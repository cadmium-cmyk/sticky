import Gio from "gi://Gio";
import GLib from "gi://GLib";

import { StickyError, StickyErrorType } from "./errors.js";
import { INote, Note, SETTINGS } from "./util.js";

Gio._promisify(
  Gio.File.prototype,
  "load_contents_async",
  "load_contents_finish",
);

Gio._promisify(
  Gio.File.prototype,
  "replace_contents_async",
  "replace_contents_finish",
);

const decoder = new TextDecoder();
const encoder = new TextEncoder();

export function get_notes_dir() {
  const path = SETTINGS.NOTES_PATH;
  if (path && path.trim() !== "") {
    return Gio.file_new_for_path(path);
  }
  return Gio.file_new_for_path(
    GLib.build_filenamev([GLib.get_user_data_dir(), pkg.name, "notes"]),
  );
}

export const NotesDir = Gio.file_new_for_path(
  GLib.build_filenamev([GLib.get_user_data_dir(), pkg.name]),
);

export const Notes = Gio.file_new_for_path(
  GLib.build_filenamev([NotesDir.get_path()!, "notes.json"]),
);

export const load_file = (file: Gio.File) => {
  try {
    const parent = file.get_parent();
    if (parent) {
      parent.make_directory_with_parents(null);
    }
  } catch (e: unknown) {
    if (e instanceof GLib.Error) {
      if (!e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.EXISTS)) {
        throw new StickyError(
          StickyErrorType.NO_PERMISSION,
          "Failed to create notes directory",
        );
      }
    }
  }

  try {
    const [_, contents] = file.load_contents(null);
    const text = decoder.decode(contents);

    // If it's a legacy JSON index (like notes.json)
    if (file.get_basename() === "notes.json") {
      try {
        return JSON.parse(text);
      } catch (e: unknown) {
        throw new StickyError(StickyErrorType.FILE_CORRUPTED, "Failed to parse notes");
      }
    }

    // New Markdown format with frontmatter
    const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) {
      // It might be just content without frontmatter, but let's assume valid markdown has frontmatter
      // Let's try parsing JSON as a fallback just in case some .json files are being read
      try {
        return JSON.parse(text);
      } catch (e) {
        throw new StickyError(StickyErrorType.FILE_CORRUPTED, "Failed to parse note markdown");
      }
    }

    const yamlStr = match[1];
    const body = match[2];

    // Simple custom YAML parser for our flat object + tags array
    const data: any = { content: body };
    const lines = yamlStr.split("\n");
    let inTags = false;
    let currentTags: any[] = [];
    let currentTag: any = null;

    for (let line of lines) {
      if (line.trim() === "") continue;

      if (inTags && line.startsWith("- ")) {
        if (currentTag) currentTags.push(currentTag);
        currentTag = {};
        const rest = line.substring(2);
        const parts = rest.split(/:\s*(.*)/);
        if (parts.length > 1) {
          currentTag[parts[0].trim()] = isNaN(Number(parts[1])) ? parts[1] : Number(parts[1]);
        }
        continue;
      } else if (inTags && line.startsWith("  ")) {
        const parts = line.split(/:\s*(.*)/);
        if (parts.length > 1) {
          currentTag[parts[0].trim()] = isNaN(Number(parts[1])) ? parts[1] : Number(parts[1]);
        }
        continue;
      } else if (inTags && !line.startsWith(" ")) {
        inTags = false;
        if (currentTag) currentTags.push(currentTag);
        currentTag = null;
        data.tags = currentTags;
      }

      if (!inTags) {
        if (line.startsWith("tags:")) {
          inTags = true;
          currentTags = [];
          currentTag = null;
        } else {
          const parts = line.split(/:\s*(.*)/);
          if (parts.length > 1) {
            let key = parts[0].trim();
            let val = parts[1];
            if (val === "true") data[key] = true;
            else if (val === "false") data[key] = false;
            else if (!isNaN(Number(val)) && val !== "") data[key] = Number(val);
            else if (val && val.startsWith('"') && val.endsWith('"')) data[key] = val.slice(1, -1);
            else data[key] = val;
          }
        }
      }
    }
    if (inTags && currentTag) {
      currentTags.push(currentTag);
      data.tags = currentTags;
    }

    return data;
  } catch (e) {
    if (e instanceof GLib.Error) {
      if (e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_FOUND)) {
        throw new StickyError(
          StickyErrorType.FILE_NOT_FOUND,
          "Failed to load notes",
        );
      } else {
        throw new StickyError(
          StickyErrorType.UNKNOWN,
          "Failed to load notes",
        );
      }
    }
    throw e;
  }
};

export const save_file = (file: Gio.File, data: any) => {
  let string = "";

  if (file.get_basename() === "notes.json") {
    string = JSON.stringify(data, null, 2);
  } else {
    // Save as markdown with frontmatter
    let frontmatter = "---\n";
    frontmatter += `v: ${data.v}\n`;
    frontmatter += `uuid: ${data.uuid}\n`;
    frontmatter += `title: "${(data.title || "").replace(/"/g, '\\"')}"\n`;
    frontmatter += `style: ${data.style}\n`;
    frontmatter += `modified: "${data.modified}"\n`;
    frontmatter += `width: ${data.width}\n`;
    frontmatter += `height: ${data.height}\n`;
    frontmatter += `open: ${data.open}\n`;

    if (data.tags && data.tags.length > 0) {
      frontmatter += `tags:\n`;
      for (const tag of data.tags) {
        frontmatter += `- name: ${tag.name}\n`;
        frontmatter += `  start: ${tag.start}\n`;
        frontmatter += `  end: ${tag.end}\n`;
      }
    } else {
      frontmatter += `tags: []\n`;
    }

    frontmatter += "---\n";
    string = frontmatter + (data.content || "");
  }

  try {
    return file.replace_contents(
      encoder.encode(string),
      null,
      false,
      Gio.FileCreateFlags.NONE,
      null,
    );
  } catch (e) {
    if (e instanceof GLib.Error) {
      if (e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.PERMISSION_DENIED)) {
        throw new StickyError(
          StickyErrorType.NO_PERMISSION,
          "Failed to save notes",
        );
      } else {
        throw new StickyError(
          StickyErrorType.UNKNOWN,
          "Failed to save notes",
        );
      }
    }
  }
};

export const ensure_dir = (dir: Gio.File) => {
  try {
    dir.make_directory_with_parents(null);
  } catch (e: unknown) {
    if (e instanceof GLib.Error) {
      if (!e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.EXISTS)) {
        throw new StickyError(
          StickyErrorType.NO_PERMISSION,
          "Failed to create notes directory",
        );
      }
    }
  }
};

const bogus_data = { state: { all_notes: true }, notes: [] };

const load_notes_v1 = (notes: any) => {
  if (notes.v !== 1) {
    console.error(`Invalid notes version ${notes.v}`);
    return bogus_data;
  }
  return {
    notes: notes.notes.map((note: INote) => new Note(note)),
    state: notes.state,
  };
};

export function load_notes() {
  let index = null;

  try {
    index = load_file(Notes) ?? null;
  } catch (e) {
    if (e instanceof StickyError) {
      if (
        e.type == StickyErrorType.FILE_NOT_FOUND ||
        e.type == StickyErrorType.FILE_CORRUPTED
      ) {
        // ignore
      } else {
        throw e;
      }
    }
  }

  if (index !== null) {
    // if the index exists, load the notes from the index
    const notes = load_notes_v1(index).notes;
    Notes.delete(null);
    save_notes(notes);
    return notes;
  }

  const dir = get_notes_dir();
  ensure_dir(dir);

  const files = list_files(dir);

  return files
    .filter((file) => file.get_basename()!.endsWith(".md") || file.get_basename()!.endsWith(".json"))
    .map((file) => load_file(file))
    .map((note) => new Note(note));
}

export const list_files = (dir: Gio.File) => {
  const enumerator = dir.enumerate_children(
    "standard::name,standard::type",
    Gio.FileQueryInfoFlags.NONE,
    null,
  );

  const files: Gio.File[] = [];

  let info: Gio.FileInfo | null;

  while ((info = enumerator.next_file(null)) !== null) {
    const file = enumerator.get_child(info);
    files.push(file);
  }

  return files;
};

export function save_notes(notes: Note[]) {
  const dir = get_notes_dir();
  ensure_dir(dir);

  const files = list_files(dir);

  let writes: [Note, Gio.File][] = [];
  const deletes: Gio.File[] = [];

  for (const file of files) {
    const basename = file.get_basename()!;

    if (basename.endsWith(".md") || basename.endsWith(".json")) {
      const extLen = basename.endsWith(".md") ? 3 : 5;
      const uuid = basename.slice(0, -extLen);

      if (uuid.length !== 36) {
        deletes.push(file);
        continue;
      }

      const note = notes.find((note) => note.uuid === uuid);
      if (note) {
        if (basename.endsWith(".json")) {
            // Delete old json file and replace with md
            deletes.push(file);
            const newFile = dir.get_child(`${note.uuid}.md`);
            writes.push([note, newFile]);
        } else {
            writes.push([note, file]);
        }
      } else {
        deletes.push(file);
      }
    } else {
      // deletes.push(file);
    }
  }

  for (const note of notes) {
    if (!writes.some(([n]) => n.uuid === note.uuid)) {
      const file = dir.get_child(`${note.uuid}.md`);
      writes.push([note, file]);
    }
  }

  for (const file of deletes) {
    try { file.delete(null); } catch (e) {}
  }

  return writes.map(([note, file]) => save_file(file, note));
}

export function save_note(note: Note) {
  const dir = get_notes_dir();
  const file = dir.get_child(`${note.uuid}.md`);

  // Try to remove old json file if it exists
  try {
      const oldFile = dir.get_child(`${note.uuid}.json`);
      if (oldFile.query_exists(null)) {
          oldFile.delete(null);
      }
  } catch (e) {}

  return save_file(file, note);
}

export function delete_note(uuid: string) {
  const dir = get_notes_dir();
  const fileMd = dir.get_child(`${uuid}.md`);
  const fileJson = dir.get_child(`${uuid}.json`);

  try {
    fileMd.delete(null);
  } catch {}

  try {
    fileJson.delete(null);
  } catch {}
}
