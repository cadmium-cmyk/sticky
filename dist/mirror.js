// src/mirror.ts
import Gio3 from "gi://Gio";
import GLib3 from "gi://GLib";

// src/markdown.ts
function noteToMarkdown(note) {
  const data = note.toJSON();
  const frontmatterObj = {
    v: data.v,
    uuid: data.uuid,
    title: data.title,
    style: data.style,
    tags: data.tags,
    modified: new Date(data.modified).toISOString(),
    width: data.width,
    height: data.height,
    open: data.open
  };
  const yamlLines = [
    "---",
    `v: ${frontmatterObj.v}`,
    `uuid: ${JSON.stringify(frontmatterObj.uuid)}`,
    `title: ${JSON.stringify(frontmatterObj.title)}`,
    `style: ${frontmatterObj.style}`,
    `tags: ${JSON.stringify(frontmatterObj.tags)}`,
    `modified: ${JSON.stringify(frontmatterObj.modified)}`,
    `width: ${frontmatterObj.width}`,
    `height: ${frontmatterObj.height}`,
    `open: ${frontmatterObj.open}`,
    "---"
  ];
  return `${yamlLines.join("\n")}
${data.content}`;
}
function markdownToNoteData(text) {
  const normalized = text.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    return {
      content: text
    };
  }
  const [, frontmatterRaw, content] = match;
  const frontmatterData = {};
  const lines = frontmatterRaw.split("\n");
  let currentKey = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#"))
      continue;
    const colonIndex = line.indexOf(":");
    if (colonIndex !== -1 && !line.substring(0, colonIndex).includes(" ")) {
      const key = line.substring(0, colonIndex).trim();
      const rawVal = line.substring(colonIndex + 1).trim();
      currentKey = key;
      if (rawVal.length > 0) {
        try {
          frontmatterData[key] = JSON.parse(rawVal);
        } catch {
          if (rawVal === "true")
            frontmatterData[key] = true;
          else if (rawVal === "false")
            frontmatterData[key] = false;
          else if (!isNaN(Number(rawVal)) && rawVal !== "")
            frontmatterData[key] = Number(rawVal);
          else
            frontmatterData[key] = rawVal.replace(/^["']|["']$/g, "");
        }
      } else {
        frontmatterData[key] = null;
      }
    }
  }
  const res = {
    content
  };
  if (typeof frontmatterData.v === "number")
    res.v = frontmatterData.v;
  if (typeof frontmatterData.uuid === "string")
    res.uuid = frontmatterData.uuid;
  if (typeof frontmatterData.title === "string")
    res.title = frontmatterData.title;
  if (typeof frontmatterData.style === "number")
    res.style = frontmatterData.style;
  if (Array.isArray(frontmatterData.tags))
    res.tags = frontmatterData.tags;
  if (frontmatterData.modified)
    res.modified = new Date(frontmatterData.modified);
  if (typeof frontmatterData.width === "number")
    res.width = frontmatterData.width;
  if (typeof frontmatterData.height === "number")
    res.height = frontmatterData.height;
  if (typeof frontmatterData.open === "boolean")
    res.open = frontmatterData.open;
  return res;
}

// src/store.ts
import Gio2 from "gi://Gio";
import GLib2 from "gi://GLib";

// src/errors.ts
var StickyError = class {
  constructor(type, message) {
    this.message = message;
    this.type = type;
  }
};

// src/util.ts
import Adw from "gi://Adw";
import Gio from "gi://Gio";
import GLib from "gi://GLib";
import GObject from "gi://GObject";
Gio._promisify(
  Gio.File.prototype,
  "load_contents_async",
  "load_contents_finish"
);
Gio._promisify(
  Gio.File.prototype,
  "replace_contents_async",
  "replace_contents_finish"
);
var Style = /* @__PURE__ */ ((Style2) => {
  Style2[Style2["yellow"] = 1] = "yellow";
  Style2[Style2["pink"] = 2] = "pink";
  Style2[Style2["green"] = 3] = "green";
  Style2[Style2["purple"] = 4] = "purple";
  Style2[Style2["blue"] = 5] = "blue";
  Style2[Style2["gray"] = 6] = "gray";
  Style2[Style2["charcoal"] = 7] = "charcoal";
  Style2[Style2["window"] = 8] = "window";
  return Style2;
})(Style || {});
var StyleNames = /* @__PURE__ */ new Map([
  [1 /* yellow */, _("Yellow")],
  [2 /* pink */, _("Pink")],
  [3 /* green */, _("Green")],
  [4 /* purple */, _("Purple")],
  [5 /* blue */, _("Blue")],
  [6 /* gray */, _("Gray")],
  [7 /* charcoal */, _("Charcoal")],
  [8 /* window */, _("Window")]
]);
var styles = Object.values(Style).filter(
  (style) => typeof style === "number"
);
var settings = new Gio.Settings({ schema_id: "com.vixalien.sticky" });
var get_settings = () => ({
  DEFAULT_STYLE: settings.get_enum("default-style"),
  DEFAULT_WIDTH: settings.get_int("default-width"),
  DEFAULT_HEIGHT: settings.get_int("default-height"),
  CONFIRM_DELETE: settings.get_boolean("confirm-delete")
});
var SETTINGS = get_settings();
settings.connect("changed", () => {
  SETTINGS = get_settings();
});
var _Tag = class extends GObject.Object {
  constructor(name, start = 0, end = 0) {
    super();
    this.name = name;
    this.start = start;
    this.end = end;
  }
};
var Tag = _Tag;
(() => {
  GObject.registerClass({
    GTypeName: "TagObject",
    Properties: {
      // deno-fmt-ignore
      name: GObject.ParamSpec.string("name", "Name", "The name of the tag", GObject.ParamFlags.READWRITE, ""),
      // deno-fmt-ignore
      start: GObject.ParamSpec.int("start", "Start", "Starting position of the tag", GObject.ParamFlags.READWRITE, 0, 100, 0),
      // deno-fmt-ignore
      end: GObject.ParamSpec.int("end", "End", "Ending position of the tag", GObject.ParamFlags.READWRITE, 0, 100, 0)
    }
  }, _Tag);
})();
var _Note = class extends GObject.Object {
  constructor(note) {
    var _a;
    super();
    this.v = note.v;
    this.uuid = note.uuid;
    this.content = note.content;
    this.title = note.title;
    this.style = note.style;
    this.tag_list = Gio.ListStore.new(Tag.$gtype);
    this.tags = note.tags;
    this.modified = GLib.DateTime.new_from_iso8601(
      new Date(note.modified).toISOString(),
      null
    );
    this.width = note.width;
    this.height = note.height;
    this.open = (_a = note.open) != null ? _a : false;
    this.bind_property_full(
      "content",
      this,
      "title",
      GObject.BindingFlags.SYNC_CREATE,
      (_2, content) => {
        if (!content)
          return [true, ""];
        let title = content.split("\n")[0].slice(0, 20);
        if (title.length != content.length)
          title += "\u2026";
        return [true, title];
      },
      null
    );
  }
  get tags() {
    const items = [];
    for (let i = 0; i < this.tag_list.get_n_items(); i++) {
      const tag = this.tag_list.get_item(i);
      items.push({
        name: tag.name,
        start: tag.start,
        end: tag.end
      });
    }
    return items;
  }
  set tags(tags) {
    this.tag_list.remove_all();
    for (const tag of tags) {
      const tag_object = new Tag(tag.name, tag.start, tag.end);
      this.tag_list.append(tag_object);
    }
    this.emit("notify::tag_list", _Note.tag_list_pspec);
  }
  get modified_date() {
    return new Date(this.modified.to_unix() * 1e3);
  }
  // anything the constructor of date accepts
  set modified_date(date) {
    this.modified = GLib.DateTime.new_from_iso8601(
      new Date(date).toISOString(),
      null
    );
  }
  static generate() {
    return new this({
      v: 1,
      uuid: GLib.uuid_string_random(),
      content: "",
      title: "",
      style: SETTINGS.DEFAULT_STYLE,
      tags: [],
      modified: /* @__PURE__ */ new Date(),
      width: 300,
      height: 300,
      open: false
    });
  }
  copy() {
    return new _Note({
      v: this.v,
      uuid: this.uuid,
      content: this.content,
      title: this.title,
      style: this.style,
      tags: this.tags.map((tag) => ({
        name: tag.name,
        start: tag.start,
        end: tag.end
      })),
      modified: new Date(this.modified.to_unix() * 1e3),
      width: this.width,
      height: this.height,
      open: this.open
    });
  }
  toJSON() {
    return {
      v: this.v,
      uuid: this.uuid,
      content: this.content,
      title: this.title,
      style: this.style,
      tags: this.tags,
      modified: this.modified_date,
      width: this.width,
      height: this.height,
      open: this.open
    };
  }
};
var Note = _Note;
Note.tag_list_pspec = GObject.param_spec_object(
  "tag_list",
  "Tags",
  "Tags of the note",
  Gio.ListStore.$gtype,
  GObject.ParamFlags.READWRITE
);
(() => {
  GObject.registerClass({
    GTypeName: "NoteObject",
    Properties: {
      // deno-fmt-ignore
      v: GObject.ParamSpec.int("v", "Version", "Version of the note", GObject.ParamFlags.READWRITE, 0, 100, 0),
      // deno-fmt-ignore
      uuid: GObject.ParamSpec.string("uuid", "UUID", "UUID of the note", GObject.ParamFlags.READWRITE, ""),
      // deno-fmt-ignore
      content: GObject.ParamSpec.string("content", "Content", "Content of the note", GObject.ParamFlags.READWRITE, ""),
      // deno-fmt-ignore
      title: GObject.ParamSpec.string("title", "Title", "Title of the note", GObject.ParamFlags.READWRITE, ""),
      // deno-fmt-ignore
      style: GObject.ParamSpec.int("style", "Style", "Style of the note", GObject.ParamFlags.READWRITE, 0, 100, 0),
      // deno-fmt-ignore
      tag_list: _Note.tag_list_pspec,
      // // deno-fmt-ignore
      modified: GObject.ParamSpec.boxed("modified", "Modified", "Date the note was modified", GObject.ParamFlags.READWRITE, GLib.DateTime),
      // deno-fmt-ignore
      width: GObject.ParamSpec.int("width", "Width", "Width of the note", GObject.ParamFlags.READWRITE, 0, 100, 0),
      // deno-fmt-ignore
      height: GObject.ParamSpec.int("height", "Height", "Height of the note", GObject.ParamFlags.READWRITE, 0, 100, 0),
      // deno-fmt-ignore
      open: GObject.ParamSpec.boolean("open", "Open", "Whether the note was open when the application was closed", GObject.ParamFlags.READWRITE, false)
    }
  }, _Note);
})();

// src/store.ts
Gio2._promisify(
  Gio2.File.prototype,
  "load_contents_async",
  "load_contents_finish"
);
Gio2._promisify(
  Gio2.File.prototype,
  "replace_contents_async",
  "replace_contents_finish"
);
var decoder = new TextDecoder();
var encoder = new TextEncoder();
var NotesDir = Gio2.file_new_for_path(
  GLib2.build_filenamev([GLib2.get_user_data_dir(), pkg.name])
);
var NewNotesDir = Gio2.file_new_for_path(
  GLib2.build_filenamev([GLib2.get_user_data_dir(), pkg.name, "notes"])
);
var Notes = Gio2.file_new_for_path(
  GLib2.build_filenamev([NotesDir.get_path(), "notes.json"])
);
var ensure_dir = (dir) => {
  try {
    dir.make_directory_with_parents(null);
  } catch (e) {
    if (e instanceof GLib2.Error) {
      if (!e.matches(Gio2.IOErrorEnum, Gio2.IOErrorEnum.EXISTS)) {
        throw new StickyError(
          2 /* NO_PERMISSION */,
          "Failed to create notes directory"
        );
      }
    }
  }
};
var list_files = (dir) => {
  const enumerator = dir.enumerate_children(
    "standard::name,standard::type",
    Gio2.FileQueryInfoFlags.NONE,
    null
  );
  const files = [];
  let info;
  while ((info = enumerator.next_file(null)) !== null) {
    const file = enumerator.get_child(info);
    files.push(file);
  }
  return files;
};

// src/mirror.ts
var decoder2 = new TextDecoder();
var encoder2 = new TextEncoder();
var MirrorManager = class {
  constructor(get_notes, on_note_added) {
    this.monitor = null;
    this.ignoreSet = /* @__PURE__ */ new Set();
    this.is_updating_from_disk = false;
    this.get_notes = get_notes;
    this.on_note_added = on_note_added;
    settings.connect("changed::mirror-enabled", () => this.setup());
    settings.connect("changed::mirror-directory", () => this.setup());
    this.setup();
  }
  get is_enabled() {
    const enabled = settings.get_boolean("mirror-enabled");
    const dirPath = settings.get_string("mirror-directory");
    return enabled && dirPath.trim().length > 0;
  }
  get mirror_dir() {
    const dirPath = settings.get_string("mirror-directory");
    if (!dirPath || dirPath.trim().length === 0)
      return null;
    return Gio3.file_new_for_path(dirPath);
  }
  setup() {
    if (this.monitor) {
      this.monitor.cancel();
      this.monitor = null;
    }
    if (!this.is_enabled)
      return;
    const dir = this.mirror_dir;
    if (!dir)
      return;
    try {
      ensure_dir(dir);
    } catch (e) {
      console.error("Failed to create mirror directory:", e);
      return;
    }
    try {
      this.monitor = dir.monitor_directory(
        Gio3.FileMonitorFlags.NONE,
        null
      );
      this.monitor.connect(
        "changed",
        (_mon, file, _other, event) => {
          this.handle_file_event(file, event);
        }
      );
    } catch (e) {
      console.error("Failed to set up file monitor for mirror directory:", e);
    }
    this.sync_all_to_mirror();
    this.sync_all_from_mirror();
  }
  sync_all_to_mirror() {
    if (!this.is_enabled)
      return;
    const notes = this.get_notes();
    notes.forEach((note) => this.save_note(note));
  }
  sync_all_from_mirror() {
    if (!this.is_enabled)
      return;
    const dir = this.mirror_dir;
    if (!dir)
      return;
    try {
      const files = list_files(dir);
      for (const file of files) {
        const basename = file.get_basename();
        if (basename.endsWith(".md")) {
          this.read_and_update_note_file(file);
        }
      }
    } catch (e) {
      console.error("Failed to sync from mirror directory:", e);
    }
  }
  save_note(note) {
    if (!this.is_enabled || this.is_updating_from_disk)
      return;
    const dir = this.mirror_dir;
    if (!dir)
      return;
    ensure_dir(dir);
    const file = dir.get_child(`${note.uuid}.md`);
    const path = file.get_path();
    if (path) {
      this.ignoreSet.add(path);
    }
    const content = noteToMarkdown(note);
    try {
      file.replace_contents(
        encoder2.encode(content),
        null,
        false,
        Gio3.FileCreateFlags.NONE,
        null
      );
    } catch (e) {
      console.error(`Failed to save note ${note.uuid} to mirror:`, e);
    } finally {
      if (path) {
        GLib3.timeout_add(GLib3.PRIORITY_DEFAULT, 500, () => {
          this.ignoreSet.delete(path);
          return GLib3.SOURCE_REMOVE;
        });
      }
    }
  }
  delete_note(uuid) {
    if (!this.is_enabled || this.is_updating_from_disk)
      return;
    const dir = this.mirror_dir;
    if (!dir)
      return;
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
        GLib3.timeout_add(GLib3.PRIORITY_DEFAULT, 500, () => {
          this.ignoreSet.delete(path);
          return GLib3.SOURCE_REMOVE;
        });
      }
    }
  }
  handle_file_event(file, event) {
    const path = file.get_path();
    if (path && this.ignoreSet.has(path))
      return;
    const basename = file.get_basename();
    if (!basename || !basename.endsWith(".md"))
      return;
    if (event === Gio3.FileMonitorEvent.CHANGED || event === Gio3.FileMonitorEvent.CHANGES_DONE_HINT || event === Gio3.FileMonitorEvent.CREATED) {
      this.read_and_update_note_file(file);
    }
  }
  read_and_update_note_file(file) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    try {
      if (!file.query_exists(null))
        return;
      const [ok, contents] = file.load_contents(null);
      if (!ok)
        return;
      const text = decoder2.decode(contents);
      const noteData = markdownToNoteData(text);
      const basename = file.get_basename();
      const filenameUuid = basename.slice(0, -3);
      const uuid = noteData.uuid || filenameUuid;
      if (!uuid)
        return;
      const notes = this.get_notes();
      const existingNote = notes.find((n) => n.uuid === uuid);
      this.is_updating_from_disk = true;
      try {
        if (existingNote) {
          if (noteData.content !== void 0 && existingNote.content !== noteData.content) {
            existingNote.content = noteData.content;
          }
          if (noteData.title !== void 0 && existingNote.title !== noteData.title) {
            existingNote.title = noteData.title;
          }
          if (noteData.style !== void 0 && existingNote.style !== noteData.style) {
            existingNote.style = noteData.style;
          }
          if (noteData.tags !== void 0) {
            existingNote.tags = noteData.tags;
          }
          if (noteData.modified) {
            existingNote.modified = GLib3.DateTime.new_from_iso8601(
              new Date(noteData.modified).toISOString(),
              null
            );
          }
          if (noteData.width !== void 0)
            existingNote.width = noteData.width;
          if (noteData.height !== void 0)
            existingNote.height = noteData.height;
          if (noteData.open !== void 0 && existingNote.open !== noteData.open) {
            existingNote.open = noteData.open;
          }
        } else {
          const newNote = new Note({
            v: (_a = noteData.v) != null ? _a : 1,
            uuid,
            content: (_b = noteData.content) != null ? _b : "",
            title: (_c = noteData.title) != null ? _c : "",
            style: (_d = noteData.style) != null ? _d : 1,
            tags: (_e = noteData.tags) != null ? _e : [],
            modified: (_f = noteData.modified) != null ? _f : /* @__PURE__ */ new Date(),
            width: (_g = noteData.width) != null ? _g : 300,
            height: (_h = noteData.height) != null ? _h : 300,
            open: (_i = noteData.open) != null ? _i : false
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
};
export {
  MirrorManager
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL21pcnJvci50cyIsICIuLi9zcmMvbWFya2Rvd24udHMiLCAiLi4vc3JjL3N0b3JlLnRzIiwgIi4uL3NyYy9lcnJvcnMudHMiLCAiLi4vc3JjL3V0aWwudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qIE1JVCBMaWNlbnNlXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDIzIEFuZ2VsbyBWZXJsYWluLCBDaHJpcyBEYXZpc1xuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbiAqIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuICogU09GVFdBUkUuXG4gKlxuICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IE1JVFxuICovXG5cbmltcG9ydCBHaW8gZnJvbSBcImdpOi8vR2lvXCI7XG5pbXBvcnQgR0xpYiBmcm9tIFwiZ2k6Ly9HTGliXCI7XG5cbmltcG9ydCB7IG1hcmtkb3duVG9Ob3RlRGF0YSwgbm90ZVRvTWFya2Rvd24gfSBmcm9tIFwiLi9tYXJrZG93bi5qc1wiO1xuaW1wb3J0IHsgZW5zdXJlX2RpciwgbGlzdF9maWxlcyB9IGZyb20gXCIuL3N0b3JlLmpzXCI7XG5pbXBvcnQgeyBOb3RlLCBzZXR0aW5ncyB9IGZyb20gXCIuL3V0aWwuanNcIjtcblxuY29uc3QgZGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcigpO1xuY29uc3QgZW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xuXG5leHBvcnQgY2xhc3MgTWlycm9yTWFuYWdlciB7XG4gIHByaXZhdGUgbW9uaXRvcjogR2lvLkZpbGVNb25pdG9yIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgaWdub3JlU2V0ID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIHByaXZhdGUgZ2V0X25vdGVzOiAoKSA9PiBOb3RlW107XG4gIHByaXZhdGUgb25fbm90ZV9hZGRlZD86IChub3RlOiBOb3RlKSA9PiB2b2lkO1xuICBwcml2YXRlIGlzX3VwZGF0aW5nX2Zyb21fZGlzayA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGdldF9ub3RlczogKCkgPT4gTm90ZVtdLFxuICAgIG9uX25vdGVfYWRkZWQ/OiAobm90ZTogTm90ZSkgPT4gdm9pZCxcbiAgKSB7XG4gICAgdGhpcy5nZXRfbm90ZXMgPSBnZXRfbm90ZXM7XG4gICAgdGhpcy5vbl9ub3RlX2FkZGVkID0gb25fbm90ZV9hZGRlZDtcblxuICAgIHNldHRpbmdzLmNvbm5lY3QoXCJjaGFuZ2VkOjptaXJyb3ItZW5hYmxlZFwiLCAoKSA9PiB0aGlzLnNldHVwKCkpO1xuICAgIHNldHRpbmdzLmNvbm5lY3QoXCJjaGFuZ2VkOjptaXJyb3ItZGlyZWN0b3J5XCIsICgpID0+IHRoaXMuc2V0dXAoKSk7XG5cbiAgICB0aGlzLnNldHVwKCk7XG4gIH1cblxuICBnZXQgaXNfZW5hYmxlZCgpOiBib29sZWFuIHtcbiAgICBjb25zdCBlbmFibGVkID0gc2V0dGluZ3MuZ2V0X2Jvb2xlYW4oXCJtaXJyb3ItZW5hYmxlZFwiKTtcbiAgICBjb25zdCBkaXJQYXRoID0gc2V0dGluZ3MuZ2V0X3N0cmluZyhcIm1pcnJvci1kaXJlY3RvcnlcIik7XG4gICAgcmV0dXJuIGVuYWJsZWQgJiYgZGlyUGF0aC50cmltKCkubGVuZ3RoID4gMDtcbiAgfVxuXG4gIGdldCBtaXJyb3JfZGlyKCk6IEdpby5GaWxlIHwgbnVsbCB7XG4gICAgY29uc3QgZGlyUGF0aCA9IHNldHRpbmdzLmdldF9zdHJpbmcoXCJtaXJyb3ItZGlyZWN0b3J5XCIpO1xuICAgIGlmICghZGlyUGF0aCB8fCBkaXJQYXRoLnRyaW0oKS5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuICAgIHJldHVybiBHaW8uZmlsZV9uZXdfZm9yX3BhdGgoZGlyUGF0aCk7XG4gIH1cblxuICBzZXR1cCgpIHtcbiAgICBpZiAodGhpcy5tb25pdG9yKSB7XG4gICAgICB0aGlzLm1vbml0b3IuY2FuY2VsKCk7XG4gICAgICB0aGlzLm1vbml0b3IgPSBudWxsO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5pc19lbmFibGVkKSByZXR1cm47XG5cbiAgICBjb25zdCBkaXIgPSB0aGlzLm1pcnJvcl9kaXI7XG4gICAgaWYgKCFkaXIpIHJldHVybjtcblxuICAgIHRyeSB7XG4gICAgICBlbnN1cmVfZGlyKGRpcik7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBjcmVhdGUgbWlycm9yIGRpcmVjdG9yeTpcIiwgZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIHRoaXMubW9uaXRvciA9IGRpci5tb25pdG9yX2RpcmVjdG9yeShcbiAgICAgICAgR2lvLkZpbGVNb25pdG9yRmxhZ3MuTk9ORSxcbiAgICAgICAgbnVsbCxcbiAgICAgICk7XG4gICAgICB0aGlzLm1vbml0b3IuY29ubmVjdChcbiAgICAgICAgXCJjaGFuZ2VkXCIsXG4gICAgICAgIChfbW9uLCBmaWxlLCBfb3RoZXIsIGV2ZW50KSA9PiB7XG4gICAgICAgICAgdGhpcy5oYW5kbGVfZmlsZV9ldmVudChmaWxlLCBldmVudCk7XG4gICAgICAgIH0sXG4gICAgICApO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gc2V0IHVwIGZpbGUgbW9uaXRvciBmb3IgbWlycm9yIGRpcmVjdG9yeTpcIiwgZSk7XG4gICAgfVxuXG4gICAgLy8gSW5pdGlhbCBzeW5jIG9mIGV4aXN0aW5nIG5vdGVzIHRvIG1pcnJvciBkaXJlY3RvcnlcbiAgICB0aGlzLnN5bmNfYWxsX3RvX21pcnJvcigpO1xuICAgIC8vIEFsc28gbG9hZCBleHRlcm5hbCBmaWxlcyBmcm9tIG1pcnJvciBkaXJlY3RvcnlcbiAgICB0aGlzLnN5bmNfYWxsX2Zyb21fbWlycm9yKCk7XG4gIH1cblxuICBzeW5jX2FsbF90b19taXJyb3IoKSB7XG4gICAgaWYgKCF0aGlzLmlzX2VuYWJsZWQpIHJldHVybjtcbiAgICBjb25zdCBub3RlcyA9IHRoaXMuZ2V0X25vdGVzKCk7XG4gICAgbm90ZXMuZm9yRWFjaCgobm90ZSkgPT4gdGhpcy5zYXZlX25vdGUobm90ZSkpO1xuICB9XG5cbiAgc3luY19hbGxfZnJvbV9taXJyb3IoKSB7XG4gICAgaWYgKCF0aGlzLmlzX2VuYWJsZWQpIHJldHVybjtcbiAgICBjb25zdCBkaXIgPSB0aGlzLm1pcnJvcl9kaXI7XG4gICAgaWYgKCFkaXIpIHJldHVybjtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBmaWxlcyA9IGxpc3RfZmlsZXMoZGlyKTtcbiAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuICAgICAgICBjb25zdCBiYXNlbmFtZSA9IGZpbGUuZ2V0X2Jhc2VuYW1lKCkhO1xuICAgICAgICBpZiAoYmFzZW5hbWUuZW5kc1dpdGgoXCIubWRcIikpIHtcbiAgICAgICAgICB0aGlzLnJlYWRfYW5kX3VwZGF0ZV9ub3RlX2ZpbGUoZmlsZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIHN5bmMgZnJvbSBtaXJyb3IgZGlyZWN0b3J5OlwiLCBlKTtcbiAgICB9XG4gIH1cblxuICBzYXZlX25vdGUobm90ZTogTm90ZSkge1xuICAgIGlmICghdGhpcy5pc19lbmFibGVkIHx8IHRoaXMuaXNfdXBkYXRpbmdfZnJvbV9kaXNrKSByZXR1cm47XG5cbiAgICBjb25zdCBkaXIgPSB0aGlzLm1pcnJvcl9kaXI7XG4gICAgaWYgKCFkaXIpIHJldHVybjtcblxuICAgIGVuc3VyZV9kaXIoZGlyKTtcblxuICAgIGNvbnN0IGZpbGUgPSBkaXIuZ2V0X2NoaWxkKGAke25vdGUudXVpZH0ubWRgKTtcbiAgICBjb25zdCBwYXRoID0gZmlsZS5nZXRfcGF0aCgpO1xuICAgIGlmIChwYXRoKSB7XG4gICAgICB0aGlzLmlnbm9yZVNldC5hZGQocGF0aCk7XG4gICAgfVxuXG4gICAgY29uc3QgY29udGVudCA9IG5vdGVUb01hcmtkb3duKG5vdGUpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGZpbGUucmVwbGFjZV9jb250ZW50cyhcbiAgICAgICAgZW5jb2Rlci5lbmNvZGUoY29udGVudCksXG4gICAgICAgIG51bGwsXG4gICAgICAgIGZhbHNlLFxuICAgICAgICBHaW8uRmlsZUNyZWF0ZUZsYWdzLk5PTkUsXG4gICAgICAgIG51bGwsXG4gICAgICApO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYEZhaWxlZCB0byBzYXZlIG5vdGUgJHtub3RlLnV1aWR9IHRvIG1pcnJvcjpgLCBlKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKHBhdGgpIHtcbiAgICAgICAgR0xpYi50aW1lb3V0X2FkZChHTGliLlBSSU9SSVRZX0RFRkFVTFQsIDUwMCwgKCkgPT4ge1xuICAgICAgICAgIHRoaXMuaWdub3JlU2V0LmRlbGV0ZShwYXRoKTtcbiAgICAgICAgICByZXR1cm4gR0xpYi5TT1VSQ0VfUkVNT1ZFO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBkZWxldGVfbm90ZSh1dWlkOiBzdHJpbmcpIHtcbiAgICBpZiAoIXRoaXMuaXNfZW5hYmxlZCB8fCB0aGlzLmlzX3VwZGF0aW5nX2Zyb21fZGlzaykgcmV0dXJuO1xuXG4gICAgY29uc3QgZGlyID0gdGhpcy5taXJyb3JfZGlyO1xuICAgIGlmICghZGlyKSByZXR1cm47XG5cbiAgICBjb25zdCBmaWxlID0gZGlyLmdldF9jaGlsZChgJHt1dWlkfS5tZGApO1xuICAgIGNvbnN0IHBhdGggPSBmaWxlLmdldF9wYXRoKCk7XG4gICAgaWYgKHBhdGgpIHtcbiAgICAgIHRoaXMuaWdub3JlU2V0LmFkZChwYXRoKTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgaWYgKGZpbGUucXVlcnlfZXhpc3RzKG51bGwpKSB7XG4gICAgICAgIGZpbGUuZGVsZXRlKG51bGwpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYEZhaWxlZCB0byBkZWxldGUgbm90ZSAke3V1aWR9IGZyb20gbWlycm9yOmAsIGUpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAocGF0aCkge1xuICAgICAgICBHTGliLnRpbWVvdXRfYWRkKEdMaWIuUFJJT1JJVFlfREVGQVVMVCwgNTAwLCAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5pZ25vcmVTZXQuZGVsZXRlKHBhdGgpO1xuICAgICAgICAgIHJldHVybiBHTGliLlNPVVJDRV9SRU1PVkU7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgaGFuZGxlX2ZpbGVfZXZlbnQoZmlsZTogR2lvLkZpbGUsIGV2ZW50OiBHaW8uRmlsZU1vbml0b3JFdmVudCkge1xuICAgIGNvbnN0IHBhdGggPSBmaWxlLmdldF9wYXRoKCk7XG4gICAgaWYgKHBhdGggJiYgdGhpcy5pZ25vcmVTZXQuaGFzKHBhdGgpKSByZXR1cm47XG5cbiAgICBjb25zdCBiYXNlbmFtZSA9IGZpbGUuZ2V0X2Jhc2VuYW1lKCk7XG4gICAgaWYgKCFiYXNlbmFtZSB8fCAhYmFzZW5hbWUuZW5kc1dpdGgoXCIubWRcIikpIHJldHVybjtcblxuICAgIGlmIChcbiAgICAgIGV2ZW50ID09PSBHaW8uRmlsZU1vbml0b3JFdmVudC5DSEFOR0VEIHx8XG4gICAgICBldmVudCA9PT0gR2lvLkZpbGVNb25pdG9yRXZlbnQuQ0hBTkdFU19ET05FX0hJTlQgfHxcbiAgICAgIGV2ZW50ID09PSBHaW8uRmlsZU1vbml0b3JFdmVudC5DUkVBVEVEXG4gICAgKSB7XG4gICAgICB0aGlzLnJlYWRfYW5kX3VwZGF0ZV9ub3RlX2ZpbGUoZmlsZSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSByZWFkX2FuZF91cGRhdGVfbm90ZV9maWxlKGZpbGU6IEdpby5GaWxlKSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghZmlsZS5xdWVyeV9leGlzdHMobnVsbCkpIHJldHVybjtcbiAgICAgIGNvbnN0IFtvaywgY29udGVudHNdID0gZmlsZS5sb2FkX2NvbnRlbnRzKG51bGwpO1xuICAgICAgaWYgKCFvaykgcmV0dXJuO1xuXG4gICAgICBjb25zdCB0ZXh0ID0gZGVjb2Rlci5kZWNvZGUoY29udGVudHMpO1xuICAgICAgY29uc3Qgbm90ZURhdGEgPSBtYXJrZG93blRvTm90ZURhdGEodGV4dCk7XG5cbiAgICAgIGNvbnN0IGJhc2VuYW1lID0gZmlsZS5nZXRfYmFzZW5hbWUoKSE7XG4gICAgICBjb25zdCBmaWxlbmFtZVV1aWQgPSBiYXNlbmFtZS5zbGljZSgwLCAtMyk7XG5cbiAgICAgIGNvbnN0IHV1aWQgPSBub3RlRGF0YS51dWlkIHx8IGZpbGVuYW1lVXVpZDtcblxuICAgICAgaWYgKCF1dWlkKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IG5vdGVzID0gdGhpcy5nZXRfbm90ZXMoKTtcbiAgICAgIGNvbnN0IGV4aXN0aW5nTm90ZSA9IG5vdGVzLmZpbmQoKG4pID0+IG4udXVpZCA9PT0gdXVpZCk7XG5cbiAgICAgIHRoaXMuaXNfdXBkYXRpbmdfZnJvbV9kaXNrID0gdHJ1ZTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKGV4aXN0aW5nTm90ZSkge1xuICAgICAgICAgIGlmIChub3RlRGF0YS5jb250ZW50ICE9PSB1bmRlZmluZWQgJiYgZXhpc3RpbmdOb3RlLmNvbnRlbnQgIT09IG5vdGVEYXRhLmNvbnRlbnQpIHtcbiAgICAgICAgICAgIGV4aXN0aW5nTm90ZS5jb250ZW50ID0gbm90ZURhdGEuY29udGVudDtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG5vdGVEYXRhLnRpdGxlICE9PSB1bmRlZmluZWQgJiYgZXhpc3RpbmdOb3RlLnRpdGxlICE9PSBub3RlRGF0YS50aXRsZSkge1xuICAgICAgICAgICAgZXhpc3RpbmdOb3RlLnRpdGxlID0gbm90ZURhdGEudGl0bGU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChub3RlRGF0YS5zdHlsZSAhPT0gdW5kZWZpbmVkICYmIGV4aXN0aW5nTm90ZS5zdHlsZSAhPT0gbm90ZURhdGEuc3R5bGUpIHtcbiAgICAgICAgICAgIGV4aXN0aW5nTm90ZS5zdHlsZSA9IG5vdGVEYXRhLnN0eWxlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobm90ZURhdGEudGFncyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBleGlzdGluZ05vdGUudGFncyA9IG5vdGVEYXRhLnRhZ3M7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChub3RlRGF0YS5tb2RpZmllZCkge1xuICAgICAgICAgICAgZXhpc3RpbmdOb3RlLm1vZGlmaWVkID0gR0xpYi5EYXRlVGltZS5uZXdfZnJvbV9pc284NjAxKFxuICAgICAgICAgICAgICBuZXcgRGF0ZShub3RlRGF0YS5tb2RpZmllZCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChub3RlRGF0YS53aWR0aCAhPT0gdW5kZWZpbmVkKSBleGlzdGluZ05vdGUud2lkdGggPSBub3RlRGF0YS53aWR0aDtcbiAgICAgICAgICBpZiAobm90ZURhdGEuaGVpZ2h0ICE9PSB1bmRlZmluZWQpIGV4aXN0aW5nTm90ZS5oZWlnaHQgPSBub3RlRGF0YS5oZWlnaHQ7XG4gICAgICAgICAgaWYgKG5vdGVEYXRhLm9wZW4gIT09IHVuZGVmaW5lZCAmJiBleGlzdGluZ05vdGUub3BlbiAhPT0gbm90ZURhdGEub3Blbikge1xuICAgICAgICAgICAgZXhpc3RpbmdOb3RlLm9wZW4gPSBub3RlRGF0YS5vcGVuO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBOZXcgbm90ZSBjcmVhdGVkIGV4dGVybmFsbHlcbiAgICAgICAgICBjb25zdCBuZXdOb3RlID0gbmV3IE5vdGUoe1xuICAgICAgICAgICAgdjogbm90ZURhdGEudiA/PyAxLFxuICAgICAgICAgICAgdXVpZDogdXVpZCxcbiAgICAgICAgICAgIGNvbnRlbnQ6IG5vdGVEYXRhLmNvbnRlbnQgPz8gXCJcIixcbiAgICAgICAgICAgIHRpdGxlOiBub3RlRGF0YS50aXRsZSA/PyBcIlwiLFxuICAgICAgICAgICAgc3R5bGU6IG5vdGVEYXRhLnN0eWxlID8/IDEsXG4gICAgICAgICAgICB0YWdzOiBub3RlRGF0YS50YWdzID8/IFtdLFxuICAgICAgICAgICAgbW9kaWZpZWQ6IG5vdGVEYXRhLm1vZGlmaWVkID8/IG5ldyBEYXRlKCksXG4gICAgICAgICAgICB3aWR0aDogbm90ZURhdGEud2lkdGggPz8gMzAwLFxuICAgICAgICAgICAgaGVpZ2h0OiBub3RlRGF0YS5oZWlnaHQgPz8gMzAwLFxuICAgICAgICAgICAgb3Blbjogbm90ZURhdGEub3BlbiA/PyBmYWxzZSxcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGlmICh0aGlzLm9uX25vdGVfYWRkZWQpIHtcbiAgICAgICAgICAgIHRoaXMub25fbm90ZV9hZGRlZChuZXdOb3RlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRoaXMuaXNfdXBkYXRpbmdfZnJvbV9kaXNrID0gZmFsc2U7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIHJlYWRpbmcgbWlycm9yIG5vdGUgZmlsZTpcIiwgZSk7XG4gICAgfVxuICB9XG59XG4iLCAiLyogTUlUIExpY2Vuc2VcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMjMgQW5nZWxvIFZlcmxhaW4sIENocmlzIERhdmlzXG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICogY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gKiBTT0ZUV0FSRS5cbiAqXG4gKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogTUlUXG4gKi9cblxuaW1wb3J0IHsgSU5vdGUsIElUYWcsIE5vdGUgfSBmcm9tIFwiLi91dGlsLmpzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBub3RlVG9NYXJrZG93bihub3RlOiBOb3RlKTogc3RyaW5nIHtcbiAgY29uc3QgZGF0YSA9IG5vdGUudG9KU09OKCk7XG4gIGNvbnN0IGZyb250bWF0dGVyT2JqID0ge1xuICAgIHY6IGRhdGEudixcbiAgICB1dWlkOiBkYXRhLnV1aWQsXG4gICAgdGl0bGU6IGRhdGEudGl0bGUsXG4gICAgc3R5bGU6IGRhdGEuc3R5bGUsXG4gICAgdGFnczogZGF0YS50YWdzLFxuICAgIG1vZGlmaWVkOiBuZXcgRGF0ZShkYXRhLm1vZGlmaWVkKS50b0lTT1N0cmluZygpLFxuICAgIHdpZHRoOiBkYXRhLndpZHRoLFxuICAgIGhlaWdodDogZGF0YS5oZWlnaHQsXG4gICAgb3BlbjogZGF0YS5vcGVuLFxuICB9O1xuXG4gIGNvbnN0IHlhbWxMaW5lcyA9IFtcbiAgICBcIi0tLVwiLFxuICAgIGB2OiAke2Zyb250bWF0dGVyT2JqLnZ9YCxcbiAgICBgdXVpZDogJHtKU09OLnN0cmluZ2lmeShmcm9udG1hdHRlck9iai51dWlkKX1gLFxuICAgIGB0aXRsZTogJHtKU09OLnN0cmluZ2lmeShmcm9udG1hdHRlck9iai50aXRsZSl9YCxcbiAgICBgc3R5bGU6ICR7ZnJvbnRtYXR0ZXJPYmouc3R5bGV9YCxcbiAgICBgdGFnczogJHtKU09OLnN0cmluZ2lmeShmcm9udG1hdHRlck9iai50YWdzKX1gLFxuICAgIGBtb2RpZmllZDogJHtKU09OLnN0cmluZ2lmeShmcm9udG1hdHRlck9iai5tb2RpZmllZCl9YCxcbiAgICBgd2lkdGg6ICR7ZnJvbnRtYXR0ZXJPYmoud2lkdGh9YCxcbiAgICBgaGVpZ2h0OiAke2Zyb250bWF0dGVyT2JqLmhlaWdodH1gLFxuICAgIGBvcGVuOiAke2Zyb250bWF0dGVyT2JqLm9wZW59YCxcbiAgICBcIi0tLVwiLFxuICBdO1xuXG4gIHJldHVybiBgJHt5YW1sTGluZXMuam9pbihcIlxcblwiKX1cXG4ke2RhdGEuY29udGVudH1gO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFya2Rvd25Ub05vdGVEYXRhKHRleHQ6IHN0cmluZyk6IFBhcnRpYWw8SU5vdGU+IHtcbiAgY29uc3Qgbm9ybWFsaXplZCA9IHRleHQucmVwbGFjZSgvXFxyXFxuL2csIFwiXFxuXCIpO1xuICBjb25zdCBtYXRjaCA9IG5vcm1hbGl6ZWQubWF0Y2goL14tLS1cXG4oW1xcc1xcU10qPylcXG4tLS1cXG4/KFtcXHNcXFNdKikkLyk7XG5cbiAgaWYgKCFtYXRjaCkge1xuICAgIHJldHVybiB7XG4gICAgICBjb250ZW50OiB0ZXh0LFxuICAgIH07XG4gIH1cblxuICBjb25zdCBbLCBmcm9udG1hdHRlclJhdywgY29udGVudF0gPSBtYXRjaDtcbiAgY29uc3QgZnJvbnRtYXR0ZXJEYXRhOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge307XG5cbiAgY29uc3QgbGluZXMgPSBmcm9udG1hdHRlclJhdy5zcGxpdChcIlxcblwiKTtcbiAgbGV0IGN1cnJlbnRLZXk6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG4gIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcykge1xuICAgIGNvbnN0IHRyaW1tZWQgPSBsaW5lLnRyaW0oKTtcbiAgICBpZiAoIXRyaW1tZWQgfHwgdHJpbW1lZC5zdGFydHNXaXRoKFwiI1wiKSkgY29udGludWU7XG5cbiAgICBjb25zdCBjb2xvbkluZGV4ID0gbGluZS5pbmRleE9mKFwiOlwiKTtcbiAgICBpZiAoY29sb25JbmRleCAhPT0gLTEgJiYgIWxpbmUuc3Vic3RyaW5nKDAsIGNvbG9uSW5kZXgpLmluY2x1ZGVzKFwiIFwiKSkge1xuICAgICAgY29uc3Qga2V5ID0gbGluZS5zdWJzdHJpbmcoMCwgY29sb25JbmRleCkudHJpbSgpO1xuICAgICAgY29uc3QgcmF3VmFsID0gbGluZS5zdWJzdHJpbmcoY29sb25JbmRleCArIDEpLnRyaW0oKTtcbiAgICAgIGN1cnJlbnRLZXkgPSBrZXk7XG5cbiAgICAgIGlmIChyYXdWYWwubGVuZ3RoID4gMCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGZyb250bWF0dGVyRGF0YVtrZXldID0gSlNPTi5wYXJzZShyYXdWYWwpO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICBpZiAocmF3VmFsID09PSBcInRydWVcIikgZnJvbnRtYXR0ZXJEYXRhW2tleV0gPSB0cnVlO1xuICAgICAgICAgIGVsc2UgaWYgKHJhd1ZhbCA9PT0gXCJmYWxzZVwiKSBmcm9udG1hdHRlckRhdGFba2V5XSA9IGZhbHNlO1xuICAgICAgICAgIGVsc2UgaWYgKCFpc05hTihOdW1iZXIocmF3VmFsKSkgJiYgcmF3VmFsICE9PSBcIlwiKSBmcm9udG1hdHRlckRhdGFba2V5XSA9IE51bWJlcihyYXdWYWwpO1xuICAgICAgICAgIGVsc2UgZnJvbnRtYXR0ZXJEYXRhW2tleV0gPSByYXdWYWwucmVwbGFjZSgvXltcIiddfFtcIiddJC9nLCBcIlwiKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZnJvbnRtYXR0ZXJEYXRhW2tleV0gPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHJlczogUGFydGlhbDxJTm90ZT4gPSB7XG4gICAgY29udGVudDogY29udGVudCxcbiAgfTtcblxuICBpZiAodHlwZW9mIGZyb250bWF0dGVyRGF0YS52ID09PSBcIm51bWJlclwiKSByZXMudiA9IGZyb250bWF0dGVyRGF0YS52IGFzIDE7XG4gIGlmICh0eXBlb2YgZnJvbnRtYXR0ZXJEYXRhLnV1aWQgPT09IFwic3RyaW5nXCIpIHJlcy51dWlkID0gZnJvbnRtYXR0ZXJEYXRhLnV1aWQ7XG4gIGlmICh0eXBlb2YgZnJvbnRtYXR0ZXJEYXRhLnRpdGxlID09PSBcInN0cmluZ1wiKSByZXMudGl0bGUgPSBmcm9udG1hdHRlckRhdGEudGl0bGU7XG4gIGlmICh0eXBlb2YgZnJvbnRtYXR0ZXJEYXRhLnN0eWxlID09PSBcIm51bWJlclwiKSByZXMuc3R5bGUgPSBmcm9udG1hdHRlckRhdGEuc3R5bGU7XG4gIGlmIChBcnJheS5pc0FycmF5KGZyb250bWF0dGVyRGF0YS50YWdzKSkgcmVzLnRhZ3MgPSBmcm9udG1hdHRlckRhdGEudGFncyBhcyBJVGFnW107XG4gIGlmIChmcm9udG1hdHRlckRhdGEubW9kaWZpZWQpIHJlcy5tb2RpZmllZCA9IG5ldyBEYXRlKGZyb250bWF0dGVyRGF0YS5tb2RpZmllZCk7XG4gIGlmICh0eXBlb2YgZnJvbnRtYXR0ZXJEYXRhLndpZHRoID09PSBcIm51bWJlclwiKSByZXMud2lkdGggPSBmcm9udG1hdHRlckRhdGEud2lkdGg7XG4gIGlmICh0eXBlb2YgZnJvbnRtYXR0ZXJEYXRhLmhlaWdodCA9PT0gXCJudW1iZXJcIikgcmVzLmhlaWdodCA9IGZyb250bWF0dGVyRGF0YS5oZWlnaHQ7XG4gIGlmICh0eXBlb2YgZnJvbnRtYXR0ZXJEYXRhLm9wZW4gPT09IFwiYm9vbGVhblwiKSByZXMub3BlbiA9IGZyb250bWF0dGVyRGF0YS5vcGVuO1xuXG4gIHJldHVybiByZXM7XG59XG4iLCAiaW1wb3J0IEdpbyBmcm9tIFwiZ2k6Ly9HaW9cIjtcbmltcG9ydCBHTGliIGZyb20gXCJnaTovL0dMaWJcIjtcblxuaW1wb3J0IHsgU3RpY2t5RXJyb3IsIFN0aWNreUVycm9yVHlwZSB9IGZyb20gXCIuL2Vycm9ycy5qc1wiO1xuaW1wb3J0IHsgSU5vdGUsIE5vdGUgfSBmcm9tIFwiLi91dGlsLmpzXCI7XG5cbkdpby5fcHJvbWlzaWZ5KFxuICBHaW8uRmlsZS5wcm90b3R5cGUsXG4gIFwibG9hZF9jb250ZW50c19hc3luY1wiLFxuICBcImxvYWRfY29udGVudHNfZmluaXNoXCIsXG4pO1xuXG5HaW8uX3Byb21pc2lmeShcbiAgR2lvLkZpbGUucHJvdG90eXBlLFxuICBcInJlcGxhY2VfY29udGVudHNfYXN5bmNcIixcbiAgXCJyZXBsYWNlX2NvbnRlbnRzX2ZpbmlzaFwiLFxuKTtcblxuY29uc3QgZGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcigpO1xuY29uc3QgZW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xuXG5pbnRlcmZhY2UgU2F2ZWROb3RlRGF0YSB7XG4gIHY6IDE7XG4gIG5vdGVzOiBJTm90ZVtdO1xuICBzdGF0ZTogU3RhdGU7XG59XG5cbmludGVyZmFjZSBMb2FkTm90ZXNSZXR1cm4ge1xuICBub3RlczogTm90ZVtdO1xuICBzdGF0ZTogU3RhdGU7XG59XG5cbmludGVyZmFjZSBTdGF0ZSB7XG4gIGFsbF9ub3RlczogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNvbnN0IE5vdGVzRGlyID0gR2lvLmZpbGVfbmV3X2Zvcl9wYXRoKFxuICBHTGliLmJ1aWxkX2ZpbGVuYW1ldihbR0xpYi5nZXRfdXNlcl9kYXRhX2RpcigpLCBwa2cubmFtZV0pLFxuKTtcblxuZXhwb3J0IGNvbnN0IE5ld05vdGVzRGlyID0gR2lvLmZpbGVfbmV3X2Zvcl9wYXRoKFxuICBHTGliLmJ1aWxkX2ZpbGVuYW1ldihbR0xpYi5nZXRfdXNlcl9kYXRhX2RpcigpLCBwa2cubmFtZSwgXCJub3Rlc1wiXSksXG4pO1xuXG5leHBvcnQgY29uc3QgTm90ZXMgPSBHaW8uZmlsZV9uZXdfZm9yX3BhdGgoXG4gIEdMaWIuYnVpbGRfZmlsZW5hbWV2KFtOb3Rlc0Rpci5nZXRfcGF0aCgpISwgXCJub3Rlcy5qc29uXCJdKSxcbik7XG5cbmV4cG9ydCBjb25zdCBsb2FkX2ZpbGUgPSAoZmlsZTogR2lvLkZpbGUpID0+IHtcbiAgdHJ5IHtcbiAgICBOb3Rlcy5nZXRfcGFyZW50KCkhLm1ha2VfZGlyZWN0b3J5X3dpdGhfcGFyZW50cyhudWxsKTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIGlmIChlIGluc3RhbmNlb2YgR0xpYi5FcnJvcikge1xuICAgICAgaWYgKCFlLm1hdGNoZXMoR2lvLklPRXJyb3JFbnVtLCBHaW8uSU9FcnJvckVudW0uRVhJU1RTKSkge1xuICAgICAgICB0aHJvdyBuZXcgU3RpY2t5RXJyb3IoXG4gICAgICAgICAgU3RpY2t5RXJyb3JUeXBlLk5PX1BFUk1JU1NJT04sXG4gICAgICAgICAgXCJGYWlsZWQgdG8gY3JlYXRlIG5vdGVzIGRpcmVjdG9yeVwiLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHRyeSB7XG4gICAgY29uc3QgW18sIGNvbnRlbnRzXSA9IGZpbGUubG9hZF9jb250ZW50cyhudWxsKTtcblxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZShkZWNvZGVyLmRlY29kZShjb250ZW50cykpO1xuICAgIH0gY2F0Y2ggKGU6IHVua25vd24pIHtcbiAgICAgIHRocm93IG5ldyBTdGlja3lFcnJvcihcbiAgICAgICAgU3RpY2t5RXJyb3JUeXBlLkZJTEVfQ09SUlVQVEVELFxuICAgICAgICBcIkZhaWxlZCB0byBwYXJzZSBub3Rlc1wiLFxuICAgICAgKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoZSBpbnN0YW5jZW9mIEdMaWIuRXJyb3IpIHtcbiAgICAgIGlmIChlLm1hdGNoZXMoR2lvLklPRXJyb3JFbnVtLCBHaW8uSU9FcnJvckVudW0uTk9UX0ZPVU5EKSkge1xuICAgICAgICB0aHJvdyBuZXcgU3RpY2t5RXJyb3IoXG4gICAgICAgICAgU3RpY2t5RXJyb3JUeXBlLkZJTEVfTk9UX0ZPVU5ELFxuICAgICAgICAgIFwiRmFpbGVkIHRvIGxvYWQgbm90ZXNcIixcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBTdGlja3lFcnJvcihcbiAgICAgICAgICBTdGlja3lFcnJvclR5cGUuVU5LTk9XTixcbiAgICAgICAgICBcIkZhaWxlZCB0byBsb2FkIG5vdGVzXCIsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgY29uc3Qgc2F2ZV9maWxlID0gKGZpbGU6IEdpby5GaWxlLCBkYXRhOiBhbnkpID0+IHtcbiAgY29uc3Qgc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgMik7XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gZmlsZS5yZXBsYWNlX2NvbnRlbnRzKFxuICAgICAgZW5jb2Rlci5lbmNvZGUoc3RyaW5nKSxcbiAgICAgIG51bGwsXG4gICAgICBmYWxzZSxcbiAgICAgIEdpby5GaWxlQ3JlYXRlRmxhZ3MuTk9ORSxcbiAgICAgIG51bGwsXG4gICAgKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChlIGluc3RhbmNlb2YgR0xpYi5FcnJvcikge1xuICAgICAgaWYgKGUubWF0Y2hlcyhHaW8uSU9FcnJvckVudW0sIEdpby5JT0Vycm9yRW51bS5QRVJNSVNTSU9OX0RFTklFRCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFN0aWNreUVycm9yKFxuICAgICAgICAgIFN0aWNreUVycm9yVHlwZS5OT19QRVJNSVNTSU9OLFxuICAgICAgICAgIFwiRmFpbGVkIHRvIHNhdmUgbm90ZXNcIixcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBTdGlja3lFcnJvcihcbiAgICAgICAgICBTdGlja3lFcnJvclR5cGUuVU5LTk9XTixcbiAgICAgICAgICBcIkZhaWxlZCB0byBzYXZlIG5vdGVzXCIsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgY29uc3QgZW5zdXJlX2RpciA9IChkaXI6IEdpby5GaWxlKSA9PiB7XG4gIHRyeSB7XG4gICAgZGlyLm1ha2VfZGlyZWN0b3J5X3dpdGhfcGFyZW50cyhudWxsKTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIGlmIChlIGluc3RhbmNlb2YgR0xpYi5FcnJvcikge1xuICAgICAgaWYgKCFlLm1hdGNoZXMoR2lvLklPRXJyb3JFbnVtLCBHaW8uSU9FcnJvckVudW0uRVhJU1RTKSkge1xuICAgICAgICB0aHJvdyBuZXcgU3RpY2t5RXJyb3IoXG4gICAgICAgICAgU3RpY2t5RXJyb3JUeXBlLk5PX1BFUk1JU1NJT04sXG4gICAgICAgICAgXCJGYWlsZWQgdG8gY3JlYXRlIG5vdGVzIGRpcmVjdG9yeVwiLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuY29uc3QgYm9ndXNfZGF0YTogTG9hZE5vdGVzUmV0dXJuID0geyBzdGF0ZTogeyBhbGxfbm90ZXM6IHRydWUgfSwgbm90ZXM6IFtdIH07XG5cbmNvbnN0IGxvYWRfbm90ZXNfdjEgPSAobm90ZXM6IGFueSkgPT4ge1xuICBpZiAobm90ZXMudiAhPT0gMSkge1xuICAgIGNvbnNvbGUuZXJyb3IoYEludmFsaWQgbm90ZXMgdmVyc2lvbiAke25vdGVzLnZ9YCk7XG4gICAgcmV0dXJuIGJvZ3VzX2RhdGE7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBub3Rlczogbm90ZXMubm90ZXMubWFwKChub3RlOiBJTm90ZSkgPT4gbmV3IE5vdGUobm90ZSkpLFxuICAgIHN0YXRlOiBub3Rlcy5zdGF0ZSxcbiAgfSBhcyBMb2FkTm90ZXNSZXR1cm47XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gbG9hZF9ub3RlcygpIHtcbiAgbGV0IGluZGV4ID0gbnVsbDtcblxuICB0cnkge1xuICAgIGluZGV4ID0gbG9hZF9maWxlKE5vdGVzKSA/PyBudWxsO1xuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKGUgaW5zdGFuY2VvZiBTdGlja3lFcnJvcikge1xuICAgICAgaWYgKFxuICAgICAgICBlLnR5cGUgPT0gU3RpY2t5RXJyb3JUeXBlLkZJTEVfTk9UX0ZPVU5EIHx8XG4gICAgICAgIGUudHlwZSA9PSBTdGlja3lFcnJvclR5cGUuRklMRV9DT1JSVVBURURcbiAgICAgICkge1xuICAgICAgICAvLyBpZ25vcmVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKGluZGV4ICE9PSBudWxsKSB7XG4gICAgLy8gaWYgdGhlIGluZGV4IGV4aXN0cywgbG9hZCB0aGUgbm90ZXMgZnJvbSB0aGUgaW5kZXhcbiAgICBjb25zdCBub3RlcyA9IGxvYWRfbm90ZXNfdjEoaW5kZXgpLm5vdGVzO1xuICAgIE5vdGVzLmRlbGV0ZShudWxsKTtcbiAgICBzYXZlX25vdGVzKG5vdGVzKTtcbiAgICByZXR1cm4gbm90ZXM7XG4gIH1cblxuICBlbnN1cmVfZGlyKE5ld05vdGVzRGlyKTtcblxuICBjb25zdCBmaWxlcyA9IGxpc3RfZmlsZXMoTmV3Tm90ZXNEaXIpO1xuXG4gIHJldHVybiBmaWxlc1xuICAgIC5maWx0ZXIoKGZpbGUpID0+IGZpbGUuZ2V0X2Jhc2VuYW1lKCkhLmVuZHNXaXRoKFwiLmpzb25cIikpXG4gICAgLm1hcCgoZmlsZSkgPT4gbG9hZF9maWxlKGZpbGUpKVxuICAgIC5tYXAoKG5vdGUpID0+IG5ldyBOb3RlKG5vdGUpKTtcbn1cblxuZXhwb3J0IGNvbnN0IGxpc3RfZmlsZXMgPSAoZGlyOiBHaW8uRmlsZSkgPT4ge1xuICBjb25zdCBlbnVtZXJhdG9yID0gZGlyLmVudW1lcmF0ZV9jaGlsZHJlbihcbiAgICBcInN0YW5kYXJkOjpuYW1lLHN0YW5kYXJkOjp0eXBlXCIsXG4gICAgR2lvLkZpbGVRdWVyeUluZm9GbGFncy5OT05FLFxuICAgIG51bGwsXG4gICk7XG5cbiAgY29uc3QgZmlsZXM6IEdpby5GaWxlW10gPSBbXTtcblxuICBsZXQgaW5mbzogR2lvLkZpbGVJbmZvIHwgbnVsbDtcblxuICB3aGlsZSAoKGluZm8gPSBlbnVtZXJhdG9yLm5leHRfZmlsZShudWxsKSkgIT09IG51bGwpIHtcbiAgICBjb25zdCBmaWxlID0gZW51bWVyYXRvci5nZXRfY2hpbGQoaW5mbyk7XG4gICAgZmlsZXMucHVzaChmaWxlKTtcbiAgfVxuXG4gIHJldHVybiBmaWxlcztcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBzYXZlX25vdGVzKG5vdGVzOiBOb3RlW10pIHtcbiAgZW5zdXJlX2RpcihOZXdOb3Rlc0Rpcik7XG5cbiAgY29uc3QgZmlsZXMgPSBsaXN0X2ZpbGVzKE5ld05vdGVzRGlyKTtcblxuICBsZXQgd3JpdGVzOiBbTm90ZSwgR2lvLkZpbGVdW10gPSBbXTtcbiAgY29uc3QgZGVsZXRlczogR2lvLkZpbGVbXSA9IFtdO1xuXG4gIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuICAgIGNvbnN0IGJhc2VuYW1lID0gZmlsZS5nZXRfYmFzZW5hbWUoKSE7XG5cbiAgICBpZiAoYmFzZW5hbWUuZW5kc1dpdGgoXCIuanNvblwiKSkge1xuICAgICAgY29uc3QgdXVpZCA9IGJhc2VuYW1lLnNsaWNlKDAsIC01KTtcblxuICAgICAgaWYgKHV1aWQubGVuZ3RoICE9PSAzNikge1xuICAgICAgICBkZWxldGVzLnB1c2goZmlsZSk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBub3RlID0gbm90ZXMuZmluZCgobm90ZSkgPT4gbm90ZS51dWlkID09PSB1dWlkKTtcbiAgICAgIGlmIChub3RlKSB7XG4gICAgICAgIHdyaXRlcy5wdXNoKFtub3RlLCBmaWxlXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZWxldGVzLnB1c2goZmlsZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGRlbGV0ZXMucHVzaChmaWxlKTtcbiAgICB9XG4gIH1cblxuICBmb3IgKGNvbnN0IG5vdGUgb2Ygbm90ZXMpIHtcbiAgICBpZiAoIXdyaXRlcy5zb21lKChbbl0pID0+IG4udXVpZCA9PT0gbm90ZS51dWlkKSkge1xuICAgICAgY29uc3QgZmlsZSA9IE5ld05vdGVzRGlyLmdldF9jaGlsZChgJHtub3RlLnV1aWR9Lmpzb25gKTtcbiAgICAgIHdyaXRlcy5wdXNoKFtub3RlLCBmaWxlXSk7XG4gICAgfVxuICB9XG5cbiAgZm9yIChjb25zdCBmaWxlIG9mIGRlbGV0ZXMpIHtcbiAgICBmaWxlLmRlbGV0ZShudWxsKTtcbiAgfVxuXG4gIHJldHVybiB3cml0ZXMubWFwKChbbm90ZSwgZmlsZV0pID0+IHNhdmVfZmlsZShmaWxlLCBub3RlKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzYXZlX25vdGUobm90ZTogTm90ZSkge1xuICBjb25zdCBmaWxlID0gTmV3Tm90ZXNEaXIuZ2V0X2NoaWxkKGAke25vdGUudXVpZH0uanNvbmApO1xuXG4gIHJldHVybiBzYXZlX2ZpbGUoZmlsZSwgbm90ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWxldGVfbm90ZSh1dWlkOiBzdHJpbmcpIHtcbiAgY29uc3QgZmlsZSA9IE5ld05vdGVzRGlyLmdldF9jaGlsZChgJHt1dWlkfS5qc29uYCk7XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gZmlsZS5kZWxldGUobnVsbCk7XG4gIH0gY2F0Y2gge31cbn1cbiIsICJleHBvcnQgZW51bSBTdGlja3lFcnJvclR5cGUge1xuICBGSUxFX05PVF9GT1VORCxcbiAgRklMRV9DT1JSVVBURUQsXG4gIE5PX1BFUk1JU1NJT04sXG4gIFVOS05PV04sXG59XG5cbmV4cG9ydCBjbGFzcyBTdGlja3lFcnJvciB7XG4gIG1lc3NhZ2U6IHN0cmluZztcbiAgdHlwZTogU3RpY2t5RXJyb3JUeXBlO1xuXG4gIGNvbnN0cnVjdG9yKHR5cGU6IFN0aWNreUVycm9yVHlwZSwgbWVzc2FnZTogc3RyaW5nKSB7XG4gICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICB9XG59XG4iLCAiLyogTUlUIExpY2Vuc2VcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMjMgQW5nZWxvIFZlcmxhaW4sIENocmlzIERhdmlzXG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICogY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gKiBTT0ZUV0FSRS5cbiAqXG4gKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogTUlUXG4gKi9cblxuaW1wb3J0IEFkdyBmcm9tIFwiZ2k6Ly9BZHdcIjtcbmltcG9ydCBHaW8gZnJvbSBcImdpOi8vR2lvXCI7XG5pbXBvcnQgR0xpYiBmcm9tIFwiZ2k6Ly9HTGliXCI7XG5pbXBvcnQgR09iamVjdCBmcm9tIFwiZ2k6Ly9HT2JqZWN0XCI7XG5pbXBvcnQgR3RrIGZyb20gXCJnaTovL0d0az92ZXJzaW9uPTQuMFwiO1xuXG5HaW8uX3Byb21pc2lmeShcbiAgR2lvLkZpbGUucHJvdG90eXBlLFxuICBcImxvYWRfY29udGVudHNfYXN5bmNcIixcbiAgXCJsb2FkX2NvbnRlbnRzX2ZpbmlzaFwiLFxuKTtcblxuR2lvLl9wcm9taXNpZnkoXG4gIEdpby5GaWxlLnByb3RvdHlwZSxcbiAgXCJyZXBsYWNlX2NvbnRlbnRzX2FzeW5jXCIsXG4gIFwicmVwbGFjZV9jb250ZW50c19maW5pc2hcIixcbik7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVRhZyB7XG4gIG5hbWU6IHN0cmluZztcbiAgc3RhcnQ6IG51bWJlcjtcbiAgZW5kOiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSU5vdGUge1xuICB2OiAxO1xuICB1dWlkOiBzdHJpbmc7XG4gIGNvbnRlbnQ6IHN0cmluZztcbiAgdGl0bGU6IHN0cmluZztcbiAgc3R5bGU6IFN0eWxlO1xuICB0YWdzOiBJVGFnW107XG4gIG1vZGlmaWVkOiBEYXRlO1xuICB3aWR0aDogbnVtYmVyO1xuICBoZWlnaHQ6IG51bWJlcjtcbiAgb3BlbjogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGVudW0gU3R5bGUge1xuICBcInllbGxvd1wiID0gMSxcbiAgXCJwaW5rXCIsXG4gIFwiZ3JlZW5cIixcbiAgXCJwdXJwbGVcIixcbiAgXCJibHVlXCIsXG4gIFwiZ3JheVwiLFxuICBcImNoYXJjb2FsXCIsXG4gIFwid2luZG93XCIsXG59XG5cbmV4cG9ydCBjb25zdCBTdHlsZU5hbWVzID0gbmV3IE1hcChbXG4gIFtTdHlsZS55ZWxsb3csIF8oXCJZZWxsb3dcIildLFxuICBbU3R5bGUucGluaywgXyhcIlBpbmtcIildLFxuICBbU3R5bGUuZ3JlZW4sIF8oXCJHcmVlblwiKV0sXG4gIFtTdHlsZS5wdXJwbGUsIF8oXCJQdXJwbGVcIildLFxuICBbU3R5bGUuYmx1ZSwgXyhcIkJsdWVcIildLFxuICBbU3R5bGUuZ3JheSwgXyhcIkdyYXlcIildLFxuICBbU3R5bGUuY2hhcmNvYWwsIF8oXCJDaGFyY29hbFwiKV0sXG4gIFtTdHlsZS53aW5kb3csIF8oXCJXaW5kb3dcIildLFxuXSk7XG5cbmV4cG9ydCBjb25zdCBzdHlsZXMgPSBPYmplY3QudmFsdWVzKFN0eWxlKS5maWx0ZXIoXG4gIChzdHlsZSkgPT4gdHlwZW9mIHN0eWxlID09PSBcIm51bWJlclwiLFxuKSBhcyBTdHlsZVtdO1xuXG5leHBvcnQgY29uc3Qgc2V0dGluZ3MgPSBuZXcgR2lvLlNldHRpbmdzKHsgc2NoZW1hX2lkOiBcImNvbS52aXhhbGllbi5zdGlja3lcIiB9KTtcblxuY29uc3QgZ2V0X3NldHRpbmdzID0gKCkgPT4gKHtcbiAgREVGQVVMVF9TVFlMRTogc2V0dGluZ3MuZ2V0X2VudW0oXCJkZWZhdWx0LXN0eWxlXCIpIGFzIFN0eWxlLFxuICBERUZBVUxUX1dJRFRIOiBzZXR0aW5ncy5nZXRfaW50KFwiZGVmYXVsdC13aWR0aFwiKSxcbiAgREVGQVVMVF9IRUlHSFQ6IHNldHRpbmdzLmdldF9pbnQoXCJkZWZhdWx0LWhlaWdodFwiKSxcbiAgQ09ORklSTV9ERUxFVEU6IHNldHRpbmdzLmdldF9ib29sZWFuKFwiY29uZmlybS1kZWxldGVcIiksXG59KTtcblxuZXhwb3J0IGxldCBTRVRUSU5HUyA9IGdldF9zZXR0aW5ncygpO1xuXG5zZXR0aW5ncy5jb25uZWN0KFwiY2hhbmdlZFwiLCAoKSA9PiB7XG4gIFNFVFRJTkdTID0gZ2V0X3NldHRpbmdzKCk7XG59KTtcblxuZXhwb3J0IGNsYXNzIFRhZyBleHRlbmRzIEdPYmplY3QuT2JqZWN0IHtcbiAgc3RhdGljICRndHlwZTogR09iamVjdC5HVHlwZTxUYWc+O1xuXG4gIG5hbWU6IHN0cmluZztcbiAgc3RhcnQ6IG51bWJlcjtcbiAgZW5kOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nLCBzdGFydDogbnVtYmVyID0gMCwgZW5kOiBudW1iZXIgPSAwKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMuc3RhcnQgPSBzdGFydDtcbiAgICB0aGlzLmVuZCA9IGVuZDtcbiAgfVxuXG4gIHN0YXRpYyB7XG4gICAgR09iamVjdC5yZWdpc3RlckNsYXNzKHtcbiAgICAgIEdUeXBlTmFtZTogXCJUYWdPYmplY3RcIixcbiAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgLy8gZGVuby1mbXQtaWdub3JlXG4gICAgICAgIG5hbWU6IEdPYmplY3QuUGFyYW1TcGVjLnN0cmluZyhcIm5hbWVcIiwgXCJOYW1lXCIsIFwiVGhlIG5hbWUgb2YgdGhlIHRhZ1wiLCBHT2JqZWN0LlBhcmFtRmxhZ3MuUkVBRFdSSVRFLCBcIlwiKSxcbiAgICAgICAgLy8gZGVuby1mbXQtaWdub3JlXG4gICAgICAgIHN0YXJ0OiBHT2JqZWN0LlBhcmFtU3BlYy5pbnQoXCJzdGFydFwiLCBcIlN0YXJ0XCIsIFwiU3RhcnRpbmcgcG9zaXRpb24gb2YgdGhlIHRhZ1wiLCBHT2JqZWN0LlBhcmFtRmxhZ3MuUkVBRFdSSVRFLCAwLCAxMDAsIDApLFxuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgZW5kOiBHT2JqZWN0LlBhcmFtU3BlYy5pbnQoXCJlbmRcIiwgXCJFbmRcIiwgXCJFbmRpbmcgcG9zaXRpb24gb2YgdGhlIHRhZ1wiLCBHT2JqZWN0LlBhcmFtRmxhZ3MuUkVBRFdSSVRFLCAwLCAxMDAsIDApLFxuICAgICAgfSxcbiAgICB9LCB0aGlzKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTm90ZSBleHRlbmRzIEdPYmplY3QuT2JqZWN0IHtcbiAgcHJpdmF0ZSBzdGF0aWMgdGFnX2xpc3RfcHNwZWMgPSBHT2JqZWN0LnBhcmFtX3NwZWNfb2JqZWN0KFxuICAgIFwidGFnX2xpc3RcIixcbiAgICBcIlRhZ3NcIixcbiAgICBcIlRhZ3Mgb2YgdGhlIG5vdGVcIixcbiAgICBHaW8uTGlzdFN0b3JlLiRndHlwZSxcbiAgICBHT2JqZWN0LlBhcmFtRmxhZ3MuUkVBRFdSSVRFLFxuICApO1xuXG4gIHN0YXRpYyAkZ3R5cGU6IEdPYmplY3QuR1R5cGU8Tm90ZT47XG5cbiAgdjogMTtcbiAgdXVpZDogc3RyaW5nO1xuICBjb250ZW50OiBzdHJpbmc7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIHN0eWxlOiBTdHlsZTtcbiAgdGFnX2xpc3Q6IEdpby5MaXN0U3RvcmU8VGFnPjtcbiAgbW9kaWZpZWQ6IEdMaWIuRGF0ZVRpbWU7XG4gIHdpZHRoOiBudW1iZXI7XG4gIGhlaWdodDogbnVtYmVyO1xuICBvcGVuOiBib29sZWFuO1xuXG4gIGdldCB0YWdzKCkge1xuICAgIGNvbnN0IGl0ZW1zID0gW107XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMudGFnX2xpc3QuZ2V0X25faXRlbXMoKTsgaSsrKSB7XG4gICAgICBjb25zdCB0YWcgPSB0aGlzLnRhZ19saXN0LmdldF9pdGVtKGkpITtcbiAgICAgIGl0ZW1zLnB1c2goe1xuICAgICAgICBuYW1lOiB0YWcubmFtZSxcbiAgICAgICAgc3RhcnQ6IHRhZy5zdGFydCxcbiAgICAgICAgZW5kOiB0YWcuZW5kLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGl0ZW1zO1xuICB9XG5cbiAgc2V0IHRhZ3ModGFnczogSU5vdGVbXCJ0YWdzXCJdKSB7XG4gICAgdGhpcy50YWdfbGlzdC5yZW1vdmVfYWxsKCk7XG5cbiAgICBmb3IgKGNvbnN0IHRhZyBvZiB0YWdzKSB7XG4gICAgICBjb25zdCB0YWdfb2JqZWN0ID0gbmV3IFRhZyh0YWcubmFtZSwgdGFnLnN0YXJ0LCB0YWcuZW5kKTtcbiAgICAgIHRoaXMudGFnX2xpc3QuYXBwZW5kKHRhZ19vYmplY3QpO1xuICAgIH1cblxuICAgIHRoaXMuZW1pdChcIm5vdGlmeTo6dGFnX2xpc3RcIiwgTm90ZS50YWdfbGlzdF9wc3BlYyk7XG4gIH1cblxuICBnZXQgbW9kaWZpZWRfZGF0ZSgpIHtcbiAgICByZXR1cm4gbmV3IERhdGUodGhpcy5tb2RpZmllZC50b191bml4KCkgKiAxMDAwKTtcbiAgfVxuXG4gIC8vIGFueXRoaW5nIHRoZSBjb25zdHJ1Y3RvciBvZiBkYXRlIGFjY2VwdHNcbiAgc2V0IG1vZGlmaWVkX2RhdGUoZGF0ZTogRGF0ZSkge1xuICAgIHRoaXMubW9kaWZpZWQgPSBHTGliLkRhdGVUaW1lLm5ld19mcm9tX2lzbzg2MDEoXG4gICAgICBuZXcgRGF0ZShkYXRlKS50b0lTT1N0cmluZygpLFxuICAgICAgbnVsbCxcbiAgICApO1xuICB9XG5cbiAgY29uc3RydWN0b3Iobm90ZTogSU5vdGUpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMudiA9IG5vdGUudjtcbiAgICB0aGlzLnV1aWQgPSBub3RlLnV1aWQ7XG4gICAgdGhpcy5jb250ZW50ID0gbm90ZS5jb250ZW50O1xuICAgIHRoaXMudGl0bGUgPSBub3RlLnRpdGxlO1xuICAgIHRoaXMuc3R5bGUgPSBub3RlLnN0eWxlO1xuICAgIHRoaXMudGFnX2xpc3QgPSBHaW8uTGlzdFN0b3JlLm5ldyhUYWcuJGd0eXBlKSBhcyBHaW8uTGlzdFN0b3JlPFRhZz47XG4gICAgdGhpcy50YWdzID0gbm90ZS50YWdzO1xuICAgIHRoaXMubW9kaWZpZWQgPSBHTGliLkRhdGVUaW1lLm5ld19mcm9tX2lzbzg2MDEoXG4gICAgICBuZXcgRGF0ZShub3RlLm1vZGlmaWVkKS50b0lTT1N0cmluZygpLFxuICAgICAgbnVsbCxcbiAgICApO1xuICAgIHRoaXMud2lkdGggPSBub3RlLndpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gbm90ZS5oZWlnaHQ7XG4gICAgdGhpcy5vcGVuID0gbm90ZS5vcGVuID8/IGZhbHNlO1xuXG4gICAgdGhpcy5iaW5kX3Byb3BlcnR5X2Z1bGwoXG4gICAgICBcImNvbnRlbnRcIixcbiAgICAgIHRoaXMsXG4gICAgICBcInRpdGxlXCIsXG4gICAgICBHT2JqZWN0LkJpbmRpbmdGbGFncy5TWU5DX0NSRUFURSxcbiAgICAgIChfLCBjb250ZW50KSA9PiB7XG4gICAgICAgIGlmICghY29udGVudCkgcmV0dXJuIFt0cnVlLCBcIlwiXTtcbiAgICAgICAgbGV0IHRpdGxlID0gY29udGVudC5zcGxpdChcIlxcblwiKVswXS5zbGljZSgwLCAyMCk7XG4gICAgICAgIGlmICh0aXRsZS5sZW5ndGggIT0gY29udGVudC5sZW5ndGgpIHRpdGxlICs9IFwiXHUyMDI2XCI7XG4gICAgICAgIHJldHVybiBbdHJ1ZSwgdGl0bGVdO1xuICAgICAgfSxcbiAgICAgIG51bGxcbiAgICApO1xuXG5cbiAgfVxuXG4gIHN0YXRpYyBnZW5lcmF0ZSgpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoe1xuICAgICAgdjogMSxcbiAgICAgIHV1aWQ6IEdMaWIudXVpZF9zdHJpbmdfcmFuZG9tKCksXG4gICAgICBjb250ZW50OiBcIlwiLFxuICAgICAgdGl0bGU6IFwiXCIsXG4gICAgICBzdHlsZTogU0VUVElOR1MuREVGQVVMVF9TVFlMRSxcbiAgICAgIHRhZ3M6IFtdLFxuICAgICAgbW9kaWZpZWQ6IG5ldyBEYXRlKCksXG4gICAgICB3aWR0aDogMzAwLFxuICAgICAgaGVpZ2h0OiAzMDAsXG4gICAgICBvcGVuOiBmYWxzZSxcbiAgICB9KTtcbiAgfVxuXG4gIGNvcHkoKSB7XG4gICAgcmV0dXJuIG5ldyBOb3RlKHtcbiAgICAgIHY6IHRoaXMudixcbiAgICAgIHV1aWQ6IHRoaXMudXVpZCxcbiAgICAgIGNvbnRlbnQ6IHRoaXMuY29udGVudCxcbiAgICAgIHRpdGxlOiB0aGlzLnRpdGxlLFxuICAgICAgc3R5bGU6IHRoaXMuc3R5bGUsXG4gICAgICB0YWdzOiB0aGlzLnRhZ3MubWFwKCh0YWcpID0+ICh7XG4gICAgICAgIG5hbWU6IHRhZy5uYW1lLFxuICAgICAgICBzdGFydDogdGFnLnN0YXJ0LFxuICAgICAgICBlbmQ6IHRhZy5lbmQsXG4gICAgICB9KSksXG4gICAgICBtb2RpZmllZDogbmV3IERhdGUodGhpcy5tb2RpZmllZC50b191bml4KCkgKiAxMDAwKSxcbiAgICAgIHdpZHRoOiB0aGlzLndpZHRoLFxuICAgICAgaGVpZ2h0OiB0aGlzLmhlaWdodCxcbiAgICAgIG9wZW46IHRoaXMub3BlbixcbiAgICB9KTtcbiAgfVxuXG4gIHRvSlNPTigpOiBJTm90ZSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHY6IHRoaXMudixcbiAgICAgIHV1aWQ6IHRoaXMudXVpZCxcbiAgICAgIGNvbnRlbnQ6IHRoaXMuY29udGVudCxcbiAgICAgIHRpdGxlOiB0aGlzLnRpdGxlLFxuICAgICAgc3R5bGU6IHRoaXMuc3R5bGUsXG4gICAgICB0YWdzOiB0aGlzLnRhZ3MsXG4gICAgICBtb2RpZmllZDogdGhpcy5tb2RpZmllZF9kYXRlLFxuICAgICAgd2lkdGg6IHRoaXMud2lkdGgsXG4gICAgICBoZWlnaHQ6IHRoaXMuaGVpZ2h0LFxuICAgICAgb3BlbjogdGhpcy5vcGVuLFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMge1xuICAgIEdPYmplY3QucmVnaXN0ZXJDbGFzcyh7XG4gICAgICBHVHlwZU5hbWU6IFwiTm90ZU9iamVjdFwiLFxuICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgdjogR09iamVjdC5QYXJhbVNwZWMuaW50KFwidlwiLCBcIlZlcnNpb25cIiwgXCJWZXJzaW9uIG9mIHRoZSBub3RlXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIDAsIDEwMCwgMCksXG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICB1dWlkOiBHT2JqZWN0LlBhcmFtU3BlYy5zdHJpbmcoXCJ1dWlkXCIsIFwiVVVJRFwiLCBcIlVVSUQgb2YgdGhlIG5vdGVcIiwgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSwgXCJcIiksXG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICBjb250ZW50OiBHT2JqZWN0LlBhcmFtU3BlYy5zdHJpbmcoXCJjb250ZW50XCIsIFwiQ29udGVudFwiLCBcIkNvbnRlbnQgb2YgdGhlIG5vdGVcIiwgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSwgXCJcIiksXG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICB0aXRsZTogR09iamVjdC5QYXJhbVNwZWMuc3RyaW5nKFwidGl0bGVcIiwgXCJUaXRsZVwiLCBcIlRpdGxlIG9mIHRoZSBub3RlXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIFwiXCIpLFxuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgc3R5bGU6IEdPYmplY3QuUGFyYW1TcGVjLmludChcInN0eWxlXCIsIFwiU3R5bGVcIiwgXCJTdHlsZSBvZiB0aGUgbm90ZVwiLCBHT2JqZWN0LlBhcmFtRmxhZ3MuUkVBRFdSSVRFLCAwLCAxMDAsIDApLFxuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgdGFnX2xpc3Q6IHRoaXMudGFnX2xpc3RfcHNwZWMsXG4gICAgICAgIC8vIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICBtb2RpZmllZDogR09iamVjdC5QYXJhbVNwZWMuYm94ZWQoXCJtb2RpZmllZFwiLCBcIk1vZGlmaWVkXCIsIFwiRGF0ZSB0aGUgbm90ZSB3YXMgbW9kaWZpZWRcIiwgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSwgR0xpYi5EYXRlVGltZSksXG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICB3aWR0aDogR09iamVjdC5QYXJhbVNwZWMuaW50KFwid2lkdGhcIiwgXCJXaWR0aFwiLCBcIldpZHRoIG9mIHRoZSBub3RlXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIDAsIDEwMCwgMCksXG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICBoZWlnaHQ6IEdPYmplY3QuUGFyYW1TcGVjLmludChcImhlaWdodFwiLCBcIkhlaWdodFwiLCBcIkhlaWdodCBvZiB0aGUgbm90ZVwiLCBHT2JqZWN0LlBhcmFtRmxhZ3MuUkVBRFdSSVRFLCAwLCAxMDAsIDApLFxuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgb3BlbjogR09iamVjdC5QYXJhbVNwZWMuYm9vbGVhbihcIm9wZW5cIiwgXCJPcGVuXCIsIFwiV2hldGhlciB0aGUgbm90ZSB3YXMgb3BlbiB3aGVuIHRoZSBhcHBsaWNhdGlvbiB3YXMgY2xvc2VkXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIGZhbHNlKSxcbiAgICAgIH0sXG4gICAgfSwgdGhpcyk7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGNvbmZpcm1fZGVsZXRlID0gKHdpbmRvdzogR3RrLldpbmRvdywgY2I6ICgpID0+IHZvaWQpID0+IHtcbiAgaWYgKFNFVFRJTkdTLkNPTkZJUk1fREVMRVRFKSB7XG4gICAgY29uc3QgZGlhbG9nID0gQWR3Lk1lc3NhZ2VEaWFsb2cubmV3KFxuICAgICAgd2luZG93LFxuICAgICAgXyhcIkRlbGV0ZSBOb3RlP1wiKSxcbiAgICAgIF8oXCJUaGlzIGFjdGlvbiBjYW5ub3QgYmUgdW5kb25lLiBJZiB5b3Ugd2FudCB0byBoaWRlIHRoZSBub3RlLCB5b3UgY2FuIGNsb3NlIGl0IGluc3RlYWQuXCIpLFxuICAgICk7XG4gICAgZGlhbG9nLmFkZF9yZXNwb25zZShcImNhbmNlbFwiLCBfKFwiQ2FuY2VsXCIpKTtcbiAgICBkaWFsb2cuYWRkX3Jlc3BvbnNlKFwiZGVsZXRlXCIsIF8oXCJEZWxldGVcIikpO1xuICAgIGRpYWxvZy5zZXRfcmVzcG9uc2VfYXBwZWFyYW5jZShcbiAgICAgIFwiZGVsZXRlXCIsXG4gICAgICBBZHcuUmVzcG9uc2VBcHBlYXJhbmNlLkRFU1RSVUNUSVZFLFxuICAgICk7XG4gICAgZGlhbG9nLnNldF9kZWZhdWx0X3Jlc3BvbnNlKFwiY2FuY2VsXCIpO1xuICAgIGRpYWxvZy5zZXRfY2xvc2VfcmVzcG9uc2UoXCJjYW5jZWxcIik7XG4gICAgZGlhbG9nLmNvbm5lY3QoXCJyZXNwb25zZVwiLCAoX2RpYWxvZywgcmVzcG9uc2UpID0+IHtcbiAgICAgIGlmIChyZXNwb25zZSA9PT0gXCJkZWxldGVcIikge1xuICAgICAgICBjYigpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGRpYWxvZy5wcmVzZW50KCk7XG4gIH0gZWxzZSB7XG4gICAgY2IoKTtcbiAgfVxufTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUF5QkEsT0FBT0EsVUFBUztBQUNoQixPQUFPQyxXQUFVOzs7QUNDVixTQUFTLGVBQWUsTUFBb0I7QUFDakQsUUFBTSxPQUFPLEtBQUssT0FBTztBQUN6QixRQUFNLGlCQUFpQjtBQUFBLElBQ3JCLEdBQUcsS0FBSztBQUFBLElBQ1IsTUFBTSxLQUFLO0FBQUEsSUFDWCxPQUFPLEtBQUs7QUFBQSxJQUNaLE9BQU8sS0FBSztBQUFBLElBQ1osTUFBTSxLQUFLO0FBQUEsSUFDWCxVQUFVLElBQUksS0FBSyxLQUFLLFFBQVEsRUFBRSxZQUFZO0FBQUEsSUFDOUMsT0FBTyxLQUFLO0FBQUEsSUFDWixRQUFRLEtBQUs7QUFBQSxJQUNiLE1BQU0sS0FBSztBQUFBLEVBQ2I7QUFFQSxRQUFNLFlBQVk7QUFBQSxJQUNoQjtBQUFBLElBQ0EsTUFBTSxlQUFlO0FBQUEsSUFDckIsU0FBUyxLQUFLLFVBQVUsZUFBZSxJQUFJO0FBQUEsSUFDM0MsVUFBVSxLQUFLLFVBQVUsZUFBZSxLQUFLO0FBQUEsSUFDN0MsVUFBVSxlQUFlO0FBQUEsSUFDekIsU0FBUyxLQUFLLFVBQVUsZUFBZSxJQUFJO0FBQUEsSUFDM0MsYUFBYSxLQUFLLFVBQVUsZUFBZSxRQUFRO0FBQUEs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QUNsQztBQUNBLGNBQUksU0FBUyxVQUFVLFVBQWEsYUFBYSxVQUFVLFNBQVMsT0FBTztBQUN6RSx5QkFBYSxRQUFRLFNBQVM7QUFBQSxVQUNoQztBQUNBLGNBQUksU0FBUyxVQUFVLFVBQWEsYUFBYSxVQUFVLFNBQVMsT0FBTztBQUN6RSx5QkFBYSxRQUFRLFNBQVM7QUFBQSxVQUNoQztBQUNBLGNBQUksU0FBUyxTQUFTLFFBQVc7QUFDL0IseUJBQWEsT0FBTyxTQUFTO0FBQUEsVUFDL0I7QUFDQSxjQUFJLFNBQVMsVUFBVTtBQUNyQix5QkFBYSxXQUFXRyxNQUFLLFNBQVM7QUFBQSxjQUNwQyxJQUFJLEtBQUssU0FBUyxRQUFRLEVBQUUsWUFBWTtBQUFBLGNBQ3hDO0FBQUEsWUFDRjtBQUFBLFVBQ0Y7QUFDQSxjQUFJLFNBQVMsVUFBVTtBQUFXLHlCQUFhLFFBQVEsU0FBUztBQUNoRSxjQUFJLFNBQVMsV0FBVztBQUFXLHlCQUFhLFNBQVMsU0FBUztBQUNsRSxjQUFJLFNBQVMsU0FBUyxVQUFhLGFBQWEsU0FBUyxTQUFTLE1BQU07QUFDdEUseUJBQWEsT0FBTyxTQUFTO0FBQUEsVUFDL0I7QUFBQSxRQUNGLE9BQU87QUFFTCxnQkFBTSxVQUFVLElBQUksS0FBSztBQUFBLFlBQ3ZCLElBQUcsY0FBUyxNQUFULFlBQWM7QUFBQSxZQUNqQjtBQUFBLFlBQ0EsVUFBUyxjQUFTLFlBQVQsWUFBb0I7QUFBQSxZQUM3QixRQUFPLGNBQVMsVUFBVCxZQUFrQjtBQUFBLFlBQ3pCLFFBQU8sY0FBUyxVQUFULFlBQWtCO0FBQUEsWUFDekIsT0FBTSxjQUFTLFNBQVQsWUFBaUIsQ0FBQztBQUFBLFlBQ3hCLFdBQVUsY0FBUyxhQUFULFlBQXFCLG9CQUFJLEtBQUs7QUFBQSxZQUN4QyxRQUFPLGNBQVMsVUFBVCxZQUFrQjtBQUFBLFlBQ3pCLFNBQVEsY0FBUyxXQUFULFlBQW1CO0FBQUEsWUFDM0IsT0FBTSxjQUFTLFNBQVQsWUFBaUI7QUFBQSxVQUN6QixDQUFDO0FBRUQsY0FBSSxLQUFLLGVBQWU7QUFDdEIsaUJBQUssY0FBYyxPQUFPO0FBQUEsVUFDNUI7QUFBQSxRQUNGO0FBQUEsTUFDRixVQUFFO0FBQ0EsYUFBSyx3QkFBd0I7QUFBQSxNQUMvQjtBQUFBLElBQ0YsU0FBUyxHQUFQO0FBQ0EsY0FBUSxNQUFNLG1DQUFtQyxDQUFDO0FBQUEsSUFDcEQ7QUFBQSxFQUNGO0FBQ0Y7IiwKICAibmFtZXMiOiBbIkdpbyIsICJHTGliIiwgIkdpbyIsICJHTGliIiwgIlN0eWxlIiwgIl8iLCAiR2lvIiwgIkdMaWIiLCAiR0xpYiIsICJHaW8iLCAiR2lvIiwgImRlY29kZXIiLCAiZW5jb2RlciIsICJHaW8iLCAiR0xpYiJdCn0K
