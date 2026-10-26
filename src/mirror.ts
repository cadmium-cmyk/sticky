/* MIT License
 *
 * Copyright (c) 2023 Angelo Verlain, Chris Davis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * SPDX-License-Identifier: MIT
 */

import Gio from "gi://Gio";
import GLib from "gi://GLib";

import { markdownToNoteData, noteToMarkdown } from "./markdown.js";
import { ensure_dir, list_files } from "./store.js";
import { Note, settings } from "./util.js";

const decoder = new TextDecoder();
const encoder = new TextEncoder();

export class MirrorManager {
  private monitor: Gio.FileMonitor | null = null;
  private ignoreSet = new Set<string>();
  private get_notes: () => Note[];
  private on_note_added?: (note: Note) => void;
  private is_updating_from_disk = false;

  constructor(
    get_notes: () => Note[],
    on_note_added?: (note: Note) => void,
  ) {
    this.get_notes = get_notes;
    this.on_note_added = on_note_added;

    settings.connect("changed::mirror-enabled", () => this.setup());
    settings.connect("changed::mirror-directory", () => this.setup());

    this.setup();
  }

  get is_enabled(): boolean {
    const enabled = settings.get_boolean("mirror-enabled");
    const dirPath = settings.get_string("mirror-directory");
    return enabled && dirPath.trim().length > 0;
  }

  get mirror_dir(): Gio.File | null {
    const dirPath = settings.get_string("mirror-directory");
    if (!dirPath || dirPath.trim().length === 0) return null;
    return Gio.file_new_for_path(dirPath);
  }

  setup() {
    if (this.monitor) {
      this.monitor.cancel();
      this.monitor = null;
    }

    if (!this.is_enabled) return;

    const dir = this.mirror_dir;
    if (!dir) return;

    try {
      ensure_dir(dir);
    } catch (e) {
      console.error("Failed to create mirror directory:", e);
      return;
    }

    try {
      this.monitor = dir.monitor_directory(
        Gio.FileMonitorFlags.NONE,
        null,
      );
      this.monitor.connect(
        "changed",
        (_mon, file, _other, event) => {
          this.handle_file_event(file, event);
        },
      );
    } catch (e) {
      console.error("Failed to set up file monitor for mirror directory:", e);
    }

    // Initial sync of existing notes to mirror directory
    this.sync_all_to_mirror();
    // Also load external files from mirror directory
    this.sync_all_from_mirror();
  }

  sync_all_to_mirror() {
    if (!this.is_enabled) return;
    const notes = this.get_notes();
    notes.forEach((note) => this.save_note(note));
  }

  sync_all_from_mirror() {
    if (!this.is_enabled) return;
    const dir = this.mirror_dir;
    if (!dir) return;

    try {
      const files = list_files(dir);
      for (const file of files) {
        const basename = file.get_basename()!;
        if (basename.endsWith(".md")) {
          this.read_and_update_note_file(file);
        }
      }
    } catch (e) {
      console.error("Failed to sync from mirror directory:", e);
    }
  }

  save_note(note: Note) {
    if (!this.is_enabled || this.is_updating_from_disk) return;

    const dir = this.mirror_dir;
    if (!dir) return;

    ensure_dir(dir);

    const file = dir.get_child(`${note.uuid}.md`);
    const path = file.get_path();
    if (path) {
      this.ignoreSet.add(path);
    }

    const content = noteToMarkdown(note);

    try {
      file.replace_contents(
        encoder.encode(content),
        null,
        false,
        Gio.FileCreateFlags.NONE,
        null,
      );
    } catch (e) {
      console.error(`Failed to save note ${note.uuid} to mirror:`, e);
    } finally {
      if (path) {
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 500, () => {
          this.ignoreSet.delete(path);
          return GLib.SOURCE_REMOVE;
        });
      }
    }
  }

  delete_note(uuid: string) {
    if (!this.is_enabled || this.is_updating_from_disk) return;

    const dir = this.mirror_dir;
    if (!dir) return;

    const file = dir.get_child(`${uuid}.md`);
    const path = file.get_path();
    if (path) {
      this.ignoreSet.add(path);
    }

    try {
      if (file.query_exists(null)) {
        file.delete(null);
      }
    } catch (e) {
      console.error(`Failed to delete note ${uuid} from mirror:`, e);
    } finally {
      if (path) {
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 500, () => {
          this.ignoreSet.delete(path);
          return GLib.SOURCE_REMOVE;
        });
      }
    }
  }

  private handle_file_event(file: Gio.File, event: Gio.FileMonitorEvent) {
    const path = file.get_path();
    if (path && this.ignoreSet.has(path)) return;

    const basename = file.get_basename();
    if (!basename || !basename.endsWith(".md")) return;

    if (
      event === Gio.FileMonitorEvent.CHANGED ||
      event === Gio.FileMonitorEvent.CHANGES_DONE_HINT ||
      event === Gio.FileMonitorEvent.CREATED
    ) {
      this.read_and_update_note_file(file);
    }
  }

  private read_and_update_note_file(file: Gio.File) {
    try {
      if (!file.query_exists(null)) return;
      const [ok, contents] = file.load_contents(null);
      if (!ok) return;

      const text = decoder.decode(contents);
      const noteData = markdownToNoteData(text);

      const basename = file.get_basename()!;
      const filenameUuid = basename.slice(0, -3);

      const uuid = noteData.uuid || filenameUuid;

      if (!uuid) return;

      const notes = this.get_notes();
      const existingNote = notes.find((n) => n.uuid === uuid);

      this.is_updating_from_disk = true;

      try {
        if (existingNote) {
          if (noteData.content !== undefined && existingNote.content !== noteData.content) {
            existingNote.content = noteData.content;
          }
          if (noteData.title !== undefined && existingNote.title !== noteData.title) {
            existingNote.title = noteData.title;
          }
          if (noteData.style !== undefined && existingNote.style !== noteData.style) {
            existingNote.style = noteData.style;
          }
          if (noteData.tags !== undefined) {
            existingNote.tags = noteData.tags;
          }
          if (noteData.modified) {
            existingNote.modified = GLib.DateTime.new_from_iso8601(
              new Date(noteData.modified).toISOString(),
              null,
            );
          }
          if (noteData.width !== undefined) existingNote.width = noteData.width;
          if (noteData.height !== undefined) existingNote.height = noteData.height;
          if (noteData.open !== undefined && existingNote.open !== noteData.open) {
            existingNote.open = noteData.open;
          }
        } else {
          // New note created externally
          const newNote = new Note({
            v: noteData.v ?? 1,
            uuid: uuid,
            content: noteData.content ?? "",
            title: noteData.title ?? "",
            style: noteData.style ?? 1,
            tags: noteData.tags ?? [],
            modified: noteData.modified ?? new Date(),
            width: noteData.width ?? 300,
            height: noteData.height ?? 300,
            open: noteData.open ?? false,
          });

          if (this.on_note_added) {
            this.on_note_added(newNote);
          }
        }
      } finally {
        this.is_updating_from_disk = false;
      }
    } catch (e) {
      console.error("Error reading mirror note file:", e);
    }
  }
}
