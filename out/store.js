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
  CONFIRM_DELETE: settings.get_boolean("confirm-delete"),
  NOTES_PATH: settings.get_string("notes-path")
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
  static generate(title = "") {
    return new this({
      v: 1,
      uuid: GLib.uuid_string_random(),
      content: "",
      title,
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
function get_notes_dir() {
  const path = SETTINGS.NOTES_PATH;
  if (path && path.trim() !== "") {
    return Gio2.file_new_for_path(path);
  }
  return Gio2.file_new_for_path(
    GLib2.build_filenamev([GLib2.get_user_data_dir(), pkg.name, "notes"])
  );
}
var NotesDir = Gio2.file_new_for_path(
  GLib2.build_filenamev([GLib2.get_user_data_dir(), pkg.name])
);
var Notes = Gio2.file_new_for_path(
  GLib2.build_filenamev([NotesDir.get_path(), "notes.json"])
);
var load_file = (file) => {
  try {
    const parent = file.get_parent();
    if (parent) {
      parent.make_directory_with_parents(null);
    }
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
  try {
    const [_2, contents] = file.load_contents(null);
    const text = decoder.decode(contents);
    if (file.get_basename() === "notes.json") {
      try {
        return JSON.parse(text);
      } catch (e) {
        throw new StickyError(1 /* FILE_CORRUPTED */, "Failed to parse notes");
      }
    }
    const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) {
      try {
        return JSON.parse(text);
      } catch (e) {
        throw new StickyError(1 /* FILE_CORRUPTED */, "Failed to parse note markdown");
      }
    }
    const yamlStr = match[1];
    const body = match[2];
    const data = { content: body };
    const lines = yamlStr.split("\n");
    let inTags = false;
    let currentTags = [];
    let currentTag = null;
    for (let line of lines) {
      if (line.trim() === "")
        continue;
      if (inTags && line.startsWith("- ")) {
        if (currentTag)
          currentTags.push(currentTag);
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
        if (currentTag)
          currentTags.push(currentTag);
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
            if (val === "true")
              data[key] = true;
            else if (val === "false")
              data[key] = false;
            else if (!isNaN(Number(val)) && val !== "")
              data[key] = Number(val);
            else if (val && val.startsWith('"') && val.endsWith('"'))
              data[key] = val.slice(1, -1);
            else
              data[key] = val;
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
    if (e instanceof GLib2.Error) {
      if (e.matches(Gio2.IOErrorEnum, Gio2.IOErrorEnum.NOT_FOUND)) {
        throw new StickyError(
          0 /* FILE_NOT_FOUND */,
          "Failed to load notes"
        );
      } else {
        throw new StickyError(
          3 /* UNKNOWN */,
          "Failed to load notes"
        );
      }
    }
    throw e;
  }
};
var save_file = (file, data) => {
  let string = "";
  if (file.get_basename() === "notes.json") {
    string = JSON.stringify(data, null, 2);
  } else {
    let frontmatter = "---\n";
    frontmatter += `v: ${data.v}
`;
    frontmatter += `uuid: ${data.uuid}
`;
    frontmatter += `title: "${(data.title || "").replace(/"/g, '\\"')}"
`;
    frontmatter += `style: ${data.style}
`;
    frontmatter += `modified: "${data.modified}"
`;
    frontmatter += `width: ${data.width}
`;
    frontmatter += `height: ${data.height}
`;
    frontmatter += `open: ${data.open}
`;
    if (data.tags && data.tags.length > 0) {
      frontmatter += `tags:
`;
      for (const tag of data.tags) {
        frontmatter += `- name: ${tag.name}
`;
        frontmatter += `  start: ${tag.start}
`;
        frontmatter += `  end: ${tag.end}
`;
      }
    } else {
      frontmatter += `tags: []
`;
    }
    frontmatter += "---\n";
    string = frontmatter + (data.content || "");
  }
  try {
    return file.replace_contents(
      encoder.encode(string),
      null,
      false,
      Gio2.FileCreateFlags.NONE,
      null
    );
  } catch (e) {
    if (e instanceof GLib2.Error) {
      if (e.matches(Gio2.IOErrorEnum, Gio2.IOErrorEnum.PERMISSION_DENIED)) {
        throw new StickyError(
          2 /* NO_PERMISSION */,
          "Failed to save notes"
        );
      } else {
        throw new StickyError(
          3 /* UNKNOWN */,
          "Failed to save notes"
        );
      }
    }
  }
};
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
var bogus_data = { state: { all_notes: true }, notes: [] };
var load_notes_v1 = (notes) => {
  if (notes.v !== 1) {
    console.error(`Invalid notes version ${notes.v}`);
    return bogus_data;
  }
  return {
    notes: notes.notes.map((note) => new Note(note)),
    state: notes.state
  };
};
function load_notes() {
  var _a;
  let index = null;
  try {
    index = (_a = load_file(Notes)) != null ? _a : null;
  } catch (e) {
    if (e instanceof StickyError) {
      if (e.type == 0 /* FILE_NOT_FOUND */ || e.type == 1 /* FILE_CORRUPTED */) {
      } else {
        throw e;
      }
    }
  }
  if (index !== null) {
    const notes = load_notes_v1(index).notes;
    Notes.delete(null);
    save_notes(notes);
    return notes;
  }
  const dir = get_notes_dir();
  ensure_dir(dir);
  const files = list_files(dir);
  return files.filter((file) => file.get_basename().endsWith(".md") || file.get_basename().endsWith(".json")).map((file) => load_file(file)).map((note) => new Note(note));
}
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
function save_notes(notes) {
  const dir = get_notes_dir();
  ensure_dir(dir);
  const files = list_files(dir);
  let writes = [];
  const deletes = [];
  for (const file of files) {
    const basename = file.get_basename();
    if (basename.endsWith(".md") || basename.endsWith(".json")) {
      const extLen = basename.endsWith(".md") ? 3 : 5;
      const uuid = basename.slice(0, -extLen);
      if (uuid.length !== 36) {
        deletes.push(file);
        continue;
      }
      const note = notes.find((note2) => note2.uuid === uuid);
      if (note) {
        if (basename.endsWith(".json")) {
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
    }
  }
  for (const note of notes) {
    if (!writes.some(([n]) => n.uuid === note.uuid)) {
      const file = dir.get_child(`${note.uuid}.md`);
      writes.push([note, file]);
    }
  }
  for (const file of deletes) {
    try {
      file.delete(null);
    } catch (e) {
    }
  }
  return writes.map(([note, file]) => save_file(file, note));
}
function save_note(note) {
  const dir = get_notes_dir();
  const file = dir.get_child(`${note.uuid}.md`);
  try {
    const oldFile = dir.get_child(`${note.uuid}.json`);
    if (oldFile.query_exists(null)) {
      oldFile.delete(null);
    }
  } catch (e) {
  }
  return save_file(file, note);
}
function delete_note(uuid) {
  const dir = get_notes_dir();
  const fileMd = dir.get_child(`${uuid}.md`);
  const fileJson = dir.get_child(`${uuid}.json`);
  try {
    fileMd.delete(null);
  } catch {
  }
  try {
    fileJson.delete(null);
  } catch {
  }
}
export {
  Notes,
  NotesDir,
  delete_note,
  ensure_dir,
  get_notes_dir,
  list_files,
  load_file,
  load_notes,
  save_file,
  save_note,
  save_notes
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL3N0b3JlLnRzIiwgIi4uL3NyYy9lcnJvcnMudHMiLCAiLi4vc3JjL3V0aWwudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCBHaW8gZnJvbSBcImdpOi8vR2lvXCI7XG5pbXBvcnQgR0xpYiBmcm9tIFwiZ2k6Ly9HTGliXCI7XG5cbmltcG9ydCB7IFN0aWNreUVycm9yLCBTdGlja3lFcnJvclR5cGUgfSBmcm9tIFwiLi9lcnJvcnMuanNcIjtcbmltcG9ydCB7IElOb3RlLCBOb3RlLCBTRVRUSU5HUyB9IGZyb20gXCIuL3V0aWwuanNcIjtcblxuR2lvLl9wcm9taXNpZnkoXG4gIEdpby5GaWxlLnByb3RvdHlwZSxcbiAgXCJsb2FkX2NvbnRlbnRzX2FzeW5jXCIsXG4gIFwibG9hZF9jb250ZW50c19maW5pc2hcIixcbik7XG5cbkdpby5fcHJvbWlzaWZ5KFxuICBHaW8uRmlsZS5wcm90b3R5cGUsXG4gIFwicmVwbGFjZV9jb250ZW50c19hc3luY1wiLFxuICBcInJlcGxhY2VfY29udGVudHNfZmluaXNoXCIsXG4pO1xuXG5jb25zdCBkZWNvZGVyID0gbmV3IFRleHREZWNvZGVyKCk7XG5jb25zdCBlbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRfbm90ZXNfZGlyKCkge1xuICBjb25zdCBwYXRoID0gU0VUVElOR1MuTk9URVNfUEFUSDtcbiAgaWYgKHBhdGggJiYgcGF0aC50cmltKCkgIT09IFwiXCIpIHtcbiAgICByZXR1cm4gR2lvLmZpbGVfbmV3X2Zvcl9wYXRoKHBhdGgpO1xuICB9XG4gIHJldHVybiBHaW8uZmlsZV9uZXdfZm9yX3BhdGgoXG4gICAgR0xpYi5idWlsZF9maWxlbmFtZXYoW0dMaWIuZ2V0X3VzZXJfZGF0YV9kaXIoKSwgcGtnLm5hbWUsIFwibm90ZXNcIl0pLFxuICApO1xufVxuXG5leHBvcnQgY29uc3QgTm90ZXNEaXIgPSBHaW8uZmlsZV9uZXdfZm9yX3BhdGgoXG4gIEdMaWIuYnVpbGRfZmlsZW5hbWV2KFtHTGliLmdldF91c2VyX2RhdGFfZGlyKCksIHBrZy5uYW1lXSksXG4pO1xuXG5leHBvcnQgY29uc3QgTm90ZXMgPSBHaW8uZmlsZV9uZXdfZm9yX3BhdGgoXG4gIEdMaWIuYnVpbGRfZmlsZW5hbWV2KFtOb3Rlc0Rpci5nZXRfcGF0aCgpISwgXCJub3Rlcy5qc29uXCJdKSxcbik7XG5cbmV4cG9ydCBjb25zdCBsb2FkX2ZpbGUgPSAoZmlsZTogR2lvLkZpbGUpID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBwYXJlbnQgPSBmaWxlLmdldF9wYXJlbnQoKTtcbiAgICBpZiAocGFyZW50KSB7XG4gICAgICBwYXJlbnQubWFrZV9kaXJlY3Rvcnlfd2l0aF9wYXJlbnRzKG51bGwpO1xuICAgIH1cbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIGlmIChlIGluc3RhbmNlb2YgR0xpYi5FcnJvcikge1xuICAgICAgaWYgKCFlLm1hdGNoZXMoR2lvLklPRXJyb3JFbnVtLCBHaW8uSU9FcnJvckVudW0uRVhJU1RTKSkge1xuICAgICAgICB0aHJvdyBuZXcgU3RpY2t5RXJyb3IoXG4gICAgICAgICAgU3RpY2t5RXJyb3JUeXBlLk5PX1BFUk1JU1NJT04sXG4gICAgICAgICAgXCJGYWlsZWQgdG8gY3JlYXRlIG5vdGVzIGRpcmVjdG9yeVwiLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHRyeSB7XG4gICAgY29uc3QgW18sIGNvbnRlbnRzXSA9IGZpbGUubG9hZF9jb250ZW50cyhudWxsKTtcbiAgICBjb25zdCB0ZXh0ID0gZGVjb2Rlci5kZWNvZGUoY29udGVudHMpO1xuXG4gICAgLy8gSWYgaXQncyBhIGxlZ2FjeSBKU09OIGluZGV4IChsaWtlIG5vdGVzLmpzb24pXG4gICAgaWYgKGZpbGUuZ2V0X2Jhc2VuYW1lKCkgPT09IFwibm90ZXMuanNvblwiKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZSh0ZXh0KTtcbiAgICAgIH0gY2F0Y2ggKGU6IHVua25vd24pIHtcbiAgICAgICAgdGhyb3cgbmV3IFN0aWNreUVycm9yKFN0aWNreUVycm9yVHlwZS5GSUxFX0NPUlJVUFRFRCwgXCJGYWlsZWQgdG8gcGFyc2Ugbm90ZXNcIik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTmV3IE1hcmtkb3duIGZvcm1hdCB3aXRoIGZyb250bWF0dGVyXG4gICAgY29uc3QgbWF0Y2ggPSB0ZXh0Lm1hdGNoKC9eLS0tXFxuKFtcXHNcXFNdKj8pXFxuLS0tXFxuKFtcXHNcXFNdKikkLyk7XG4gICAgaWYgKCFtYXRjaCkge1xuICAgICAgLy8gSXQgbWlnaHQgYmUganVzdCBjb250ZW50IHdpdGhvdXQgZnJvbnRtYXR0ZXIsIGJ1dCBsZXQncyBhc3N1bWUgdmFsaWQgbWFya2Rvd24gaGFzIGZyb250bWF0dGVyXG4gICAgICAvLyBMZXQncyB0cnkgcGFyc2luZyBKU09OIGFzIGEgZmFsbGJhY2sganVzdCBpbiBjYXNlIHNvbWUgLmpzb24gZmlsZXMgYXJlIGJlaW5nIHJlYWRcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKHRleHQpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aHJvdyBuZXcgU3RpY2t5RXJyb3IoU3RpY2t5RXJyb3JUeXBlLkZJTEVfQ09SUlVQVEVELCBcIkZhaWxlZCB0byBwYXJzZSBub3RlIG1hcmtkb3duXCIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHlhbWxTdHIgPSBtYXRjaFsxXTtcbiAgICBjb25zdCBib2R5ID0gbWF0Y2hbMl07XG5cbiAgICAvLyBTaW1wbGUgY3VzdG9tIFlBTUwgcGFyc2VyIGZvciBvdXIgZmxhdCBvYmplY3QgKyB0YWdzIGFycmF5XG4gICAgY29uc3QgZGF0YTogYW55ID0geyBjb250ZW50OiBib2R5IH07XG4gICAgY29uc3QgbGluZXMgPSB5YW1sU3RyLnNwbGl0KFwiXFxuXCIpO1xuICAgIGxldCBpblRhZ3MgPSBmYWxzZTtcbiAgICBsZXQgY3VycmVudFRhZ3M6IGFueVtdID0gW107XG4gICAgbGV0IGN1cnJlbnRUYWc6IGFueSA9IG51bGw7XG5cbiAgICBmb3IgKGxldCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgICBpZiAobGluZS50cmltKCkgPT09IFwiXCIpIGNvbnRpbnVlO1xuICAgICAgXG4gICAgICBpZiAoaW5UYWdzICYmIGxpbmUuc3RhcnRzV2l0aChcIi0gXCIpKSB7XG4gICAgICAgIGlmIChjdXJyZW50VGFnKSBjdXJyZW50VGFncy5wdXNoKGN1cnJlbnRUYWcpO1xuICAgICAgICBjdXJyZW50VGFnID0ge307XG4gICAgICAgIGNvbnN0IHJlc3QgPSBsaW5lLnN1YnN0cmluZygyKTtcbiAgICAgICAgY29uc3QgcGFydHMgPSByZXN0LnNwbGl0KC86XFxzKiguKikvKTtcbiAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICBjdXJyZW50VGFnW3BhcnRzWzBdLnRyaW0oKV0gPSBpc05hTihOdW1iZXIocGFydHNbMV0pKSA/IHBhcnRzWzFdIDogTnVtYmVyKHBhcnRzWzFdKTtcbiAgICAgICAgfVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH0gZWxzZSBpZiAoaW5UYWdzICYmIGxpbmUuc3RhcnRzV2l0aChcIiAgXCIpKSB7XG4gICAgICAgIGNvbnN0IHBhcnRzID0gbGluZS5zcGxpdCgvOlxccyooLiopLyk7XG4gICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgY3VycmVudFRhZ1twYXJ0c1swXS50cmltKCldID0gaXNOYU4oTnVtYmVyKHBhcnRzWzFdKSkgPyBwYXJ0c1sxXSA6IE51bWJlcihwYXJ0c1sxXSk7XG4gICAgICAgIH1cbiAgICAgICAgY29udGludWU7XG4gICAgICB9IGVsc2UgaWYgKGluVGFncyAmJiAhbGluZS5zdGFydHNXaXRoKFwiIFwiKSkge1xuICAgICAgICBpblRhZ3MgPSBmYWxzZTtcbiAgICAgICAgaWYgKGN1cnJlbnRUYWcpIGN1cnJlbnRUYWdzLnB1c2goY3VycmVudFRhZyk7XG4gICAgICAgIGN1cnJlbnRUYWcgPSBudWxsO1xuICAgICAgICBkYXRhLnRhZ3MgPSBjdXJyZW50VGFncztcbiAgICAgIH1cblxuICAgICAgaWYgKCFpblRhZ3MpIHtcbiAgICAgICAgaWYgKGxpbmUuc3RhcnRzV2l0aChcInRhZ3M6XCIpKSB7XG4gICAgICAgICAgaW5UYWdzID0gdHJ1ZTtcbiAgICAgICAgICBjdXJyZW50VGFncyA9IFtdO1xuICAgICAgICAgIGN1cnJlbnRUYWcgPSBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHBhcnRzID0gbGluZS5zcGxpdCgvOlxccyooLiopLyk7XG4gICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIGxldCBrZXkgPSBwYXJ0c1swXS50cmltKCk7XG4gICAgICAgICAgICBsZXQgdmFsID0gcGFydHNbMV07XG4gICAgICAgICAgICBpZiAodmFsID09PSBcInRydWVcIikgZGF0YVtrZXldID0gdHJ1ZTtcbiAgICAgICAgICAgIGVsc2UgaWYgKHZhbCA9PT0gXCJmYWxzZVwiKSBkYXRhW2tleV0gPSBmYWxzZTtcbiAgICAgICAgICAgIGVsc2UgaWYgKCFpc05hTihOdW1iZXIodmFsKSkgJiYgdmFsICE9PSBcIlwiKSBkYXRhW2tleV0gPSBOdW1iZXIodmFsKTtcbiAgICAgICAgICAgIGVsc2UgaWYgKHZhbCAmJiB2YWwuc3RhcnRzV2l0aCgnXCInKSAmJiB2YWwuZW5kc1dpdGgoJ1wiJykpIGRhdGFba2V5XSA9IHZhbC5zbGljZSgxLCAtMSk7XG4gICAgICAgICAgICBlbHNlIGRhdGFba2V5XSA9IHZhbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGluVGFncyAmJiBjdXJyZW50VGFnKSB7XG4gICAgICBjdXJyZW50VGFncy5wdXNoKGN1cnJlbnRUYWcpO1xuICAgICAgZGF0YS50YWdzID0gY3VycmVudFRhZ3M7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGE7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoZSBpbnN0YW5jZW9mIEdMaWIuRXJyb3IpIHtcbiAgICAgIGlmIChlLm1hdGNoZXMoR2lvLklPRXJyb3JFbnVtLCBHaW8uSU9FcnJvckVudW0uTk9UX0ZPVU5EKSkge1xuICAgICAgICB0aHJvdyBuZXcgU3RpY2t5RXJyb3IoXG4gICAgICAgICAgU3RpY2t5RXJyb3JUeXBlLkZJTEVfTk9UX0ZPVU5ELFxuICAgICAgICAgIFwiRmFpbGVkIHRvIGxvYWQgbm90ZXNcIixcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBTdGlja3lFcnJvcihcbiAgICAgICAgICBTdGlja3lFcnJvclR5cGUuVU5LTk9XTixcbiAgICAgICAgICBcIkZhaWxlZCB0byBsb2FkIG5vdGVzXCIsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICAgIHRocm93IGU7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBzYXZlX2ZpbGUgPSAoZmlsZTogR2lvLkZpbGUsIGRhdGE6IGFueSkgPT4ge1xuICBsZXQgc3RyaW5nID0gXCJcIjtcblxuICBpZiAoZmlsZS5nZXRfYmFzZW5hbWUoKSA9PT0gXCJub3Rlcy5qc29uXCIpIHtcbiAgICBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeShkYXRhLCBudWxsLCAyKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBTYXZlIGFzIG1hcmtkb3duIHdpdGggZnJvbnRtYXR0ZXJcbiAgICBsZXQgZnJvbnRtYXR0ZXIgPSBcIi0tLVxcblwiO1xuICAgIGZyb250bWF0dGVyICs9IGB2OiAke2RhdGEudn1cXG5gO1xuICAgIGZyb250bWF0dGVyICs9IGB1dWlkOiAke2RhdGEudXVpZH1cXG5gO1xuICAgIGZyb250bWF0dGVyICs9IGB0aXRsZTogXCIkeyhkYXRhLnRpdGxlIHx8IFwiXCIpLnJlcGxhY2UoL1wiL2csICdcXFxcXCInKX1cIlxcbmA7XG4gICAgZnJvbnRtYXR0ZXIgKz0gYHN0eWxlOiAke2RhdGEuc3R5bGV9XFxuYDtcbiAgICBmcm9udG1hdHRlciArPSBgbW9kaWZpZWQ6IFwiJHtkYXRhLm1vZGlmaWVkfVwiXFxuYDtcbiAgICBmcm9udG1hdHRlciArPSBgd2lkdGg6ICR7ZGF0YS53aWR0aH1cXG5gO1xuICAgIGZyb250bWF0dGVyICs9IGBoZWlnaHQ6ICR7ZGF0YS5oZWlnaHR9XFxuYDtcbiAgICBmcm9udG1hdHRlciArPSBgb3BlbjogJHtkYXRhLm9wZW59XFxuYDtcbiAgICBcbiAgICBpZiAoZGF0YS50YWdzICYmIGRhdGEudGFncy5sZW5ndGggPiAwKSB7XG4gICAgICBmcm9udG1hdHRlciArPSBgdGFnczpcXG5gO1xuICAgICAgZm9yIChjb25zdCB0YWcgb2YgZGF0YS50YWdzKSB7XG4gICAgICAgIGZyb250bWF0dGVyICs9IGAtIG5hbWU6ICR7dGFnLm5hbWV9XFxuYDtcbiAgICAgICAgZnJvbnRtYXR0ZXIgKz0gYCAgc3RhcnQ6ICR7dGFnLnN0YXJ0fVxcbmA7XG4gICAgICAgIGZyb250bWF0dGVyICs9IGAgIGVuZDogJHt0YWcuZW5kfVxcbmA7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZyb250bWF0dGVyICs9IGB0YWdzOiBbXVxcbmA7XG4gICAgfVxuICAgIFxuICAgIGZyb250bWF0dGVyICs9IFwiLS0tXFxuXCI7XG4gICAgc3RyaW5nID0gZnJvbnRtYXR0ZXIgKyAoZGF0YS5jb250ZW50IHx8IFwiXCIpO1xuICB9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gZmlsZS5yZXBsYWNlX2NvbnRlbnRzKFxuICAgICAgZW5jb2Rlci5lbmNvZGUoc3RyaW5nKSxcbiAgICAgIG51bGwsXG4gICAgICBmYWxzZSxcbiAgICAgIEdpby5GaWxlQ3JlYXRlRmxhZ3MuTk9ORSxcbiAgICAgIG51bGwsXG4gICAgKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChlIGluc3RhbmNlb2YgR0xpYi5FcnJvcikge1xuICAgICAgaWYgKGUubWF0Y2hlcyhHaW8uSU9FcnJvckVudW0sIEdpby5JT0Vycm9yRW51bS5QRVJNSVNTSU9OX0RFTklFRCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFN0aWNreUVycm9yKFxuICAgICAgICAgIFN0aWNreUVycm9yVHlwZS5OT19QRVJNSVNTSU9OLFxuICAgICAgICAgIFwiRmFpbGVkIHRvIHNhdmUgbm90ZXNcIixcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBTdGlja3lFcnJvcihcbiAgICAgICAgICBTdGlja3lFcnJvclR5cGUuVU5LTk9XTixcbiAgICAgICAgICBcIkZhaWxlZCB0byBzYXZlIG5vdGVzXCIsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgY29uc3QgZW5zdXJlX2RpciA9IChkaXI6IEdpby5GaWxlKSA9PiB7XG4gIHRyeSB7XG4gICAgZGlyLm1ha2VfZGlyZWN0b3J5X3dpdGhfcGFyZW50cyhudWxsKTtcbiAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgIGlmIChlIGluc3RhbmNlb2YgR0xpYi5FcnJvcikge1xuICAgICAgaWYgKCFlLm1hdGNoZXMoR2lvLklPRXJyb3JFbnVtLCBHaW8uSU9FcnJvckVudW0uRVhJU1RTKSkge1xuICAgICAgICB0aHJvdyBuZXcgU3RpY2t5RXJyb3IoXG4gICAgICAgICAgU3RpY2t5RXJyb3JUeXBlLk5PX1BFUk1JU1NJT04sXG4gICAgICAgICAgXCJGYWlsZWQgdG8gY3JlYXRlIG5vdGVzIGRpcmVjdG9yeVwiLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuY29uc3QgYm9ndXNfZGF0YSA9IHsgc3RhdGU6IHsgYWxsX25vdGVzOiB0cnVlIH0sIG5vdGVzOiBbXSB9O1xuXG5jb25zdCBsb2FkX25vdGVzX3YxID0gKG5vdGVzOiBhbnkpID0+IHtcbiAgaWYgKG5vdGVzLnYgIT09IDEpIHtcbiAgICBjb25zb2xlLmVycm9yKGBJbnZhbGlkIG5vdGVzIHZlcnNpb24gJHtub3Rlcy52fWApO1xuICAgIHJldHVybiBib2d1c19kYXRhO1xuICB9XG4gIHJldHVybiB7XG4gICAgbm90ZXM6IG5vdGVzLm5vdGVzLm1hcCgobm90ZTogSU5vdGUpID0+IG5ldyBOb3RlKG5vdGUpKSxcbiAgICBzdGF0ZTogbm90ZXMuc3RhdGUsXG4gIH07XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gbG9hZF9ub3RlcygpIHtcbiAgbGV0IGluZGV4ID0gbnVsbDtcblxuICB0cnkge1xuICAgIGluZGV4ID0gbG9hZF9maWxlKE5vdGVzKSA/PyBudWxsO1xuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKGUgaW5zdGFuY2VvZiBTdGlja3lFcnJvcikge1xuICAgICAgaWYgKFxuICAgICAgICBlLnR5cGUgPT0gU3RpY2t5RXJyb3JUeXBlLkZJTEVfTk9UX0ZPVU5EIHx8XG4gICAgICAgIGUudHlwZSA9PSBTdGlja3lFcnJvclR5cGUuRklMRV9DT1JSVVBURURcbiAgICAgICkge1xuICAgICAgICAvLyBpZ25vcmVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKGluZGV4ICE9PSBudWxsKSB7XG4gICAgLy8gaWYgdGhlIGluZGV4IGV4aXN0cywgbG9hZCB0aGUgbm90ZXMgZnJvbSB0aGUgaW5kZXhcbiAgICBjb25zdCBub3RlcyA9IGxvYWRfbm90ZXNfdjEoaW5kZXgpLm5vdGVzO1xuICAgIE5vdGVzLmRlbGV0ZShudWxsKTtcbiAgICBzYXZlX25vdGVzKG5vdGVzKTtcbiAgICByZXR1cm4gbm90ZXM7XG4gIH1cblxuICBjb25zdCBkaXIgPSBnZXRfbm90ZXNfZGlyKCk7XG4gIGVuc3VyZV9kaXIoZGlyKTtcblxuICBjb25zdCBmaWxlcyA9IGxpc3RfZmlsZXMoZGlyKTtcblxuICByZXR1cm4gZmlsZXNcbiAgICAuZmlsdGVyKChmaWxlKSA9PiBmaWxlLmdldF9iYXNlbmFtZSgpIS5lbmRzV2l0aChcIi5tZFwiKSB8fCBmaWxlLmdldF9iYXNlbmFtZSgpIS5lbmRzV2l0aChcIi5qc29uXCIpKVxuICAgIC5tYXAoKGZpbGUpID0+IGxvYWRfZmlsZShmaWxlKSlcbiAgICAubWFwKChub3RlKSA9PiBuZXcgTm90ZShub3RlKSk7XG59XG5cbmV4cG9ydCBjb25zdCBsaXN0X2ZpbGVzID0gKGRpcjogR2lvLkZpbGUpID0+IHtcbiAgY29uc3QgZW51bWVyYXRvciA9IGRpci5lbnVtZXJhdGVfY2hpbGRyZW4oXG4gICAgXCJzdGFuZGFyZDo6bmFtZSxzdGFuZGFyZDo6dHlwZVwiLFxuICAgIEdpby5GaWxlUXVlcnlJbmZvRmxhZ3MuTk9ORSxcbiAgICBudWxsLFxuICApO1xuXG4gIGNvbnN0IGZpbGVzOiBHaW8uRmlsZVtdID0gW107XG5cbiAgbGV0IGluZm86IEdpby5GaWxlSW5mbyB8IG51bGw7XG5cbiAgd2hpbGUgKChpbmZvID0gZW51bWVyYXRvci5uZXh0X2ZpbGUobnVsbCkpICE9PSBudWxsKSB7XG4gICAgY29uc3QgZmlsZSA9IGVudW1lcmF0b3IuZ2V0X2NoaWxkKGluZm8pO1xuICAgIGZpbGVzLnB1c2goZmlsZSk7XG4gIH1cblxuICByZXR1cm4gZmlsZXM7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gc2F2ZV9ub3Rlcyhub3RlczogTm90ZVtdKSB7XG4gIGNvbnN0IGRpciA9IGdldF9ub3Rlc19kaXIoKTtcbiAgZW5zdXJlX2RpcihkaXIpO1xuXG4gIGNvbnN0IGZpbGVzID0gbGlzdF9maWxlcyhkaXIpO1xuXG4gIGxldCB3cml0ZXM6IFtOb3RlLCBHaW8uRmlsZV1bXSA9IFtdO1xuICBjb25zdCBkZWxldGVzOiBHaW8uRmlsZVtdID0gW107XG5cbiAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgY29uc3QgYmFzZW5hbWUgPSBmaWxlLmdldF9iYXNlbmFtZSgpITtcblxuICAgIGlmIChiYXNlbmFtZS5lbmRzV2l0aChcIi5tZFwiKSB8fCBiYXNlbmFtZS5lbmRzV2l0aChcIi5qc29uXCIpKSB7XG4gICAgICBjb25zdCBleHRMZW4gPSBiYXNlbmFtZS5lbmRzV2l0aChcIi5tZFwiKSA/IDMgOiA1O1xuICAgICAgY29uc3QgdXVpZCA9IGJhc2VuYW1lLnNsaWNlKDAsIC1leHRMZW4pO1xuXG4gICAgICBpZiAodXVpZC5sZW5ndGggIT09IDM2KSB7XG4gICAgICAgIGRlbGV0ZXMucHVzaChmaWxlKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG5vdGUgPSBub3Rlcy5maW5kKChub3RlKSA9PiBub3RlLnV1aWQgPT09IHV1aWQpO1xuICAgICAgaWYgKG5vdGUpIHtcbiAgICAgICAgaWYgKGJhc2VuYW1lLmVuZHNXaXRoKFwiLmpzb25cIikpIHtcbiAgICAgICAgICAgIC8vIERlbGV0ZSBvbGQganNvbiBmaWxlIGFuZCByZXBsYWNlIHdpdGggbWRcbiAgICAgICAgICAgIGRlbGV0ZXMucHVzaChmaWxlKTtcbiAgICAgICAgICAgIGNvbnN0IG5ld0ZpbGUgPSBkaXIuZ2V0X2NoaWxkKGAke25vdGUudXVpZH0ubWRgKTtcbiAgICAgICAgICAgIHdyaXRlcy5wdXNoKFtub3RlLCBuZXdGaWxlXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3cml0ZXMucHVzaChbbm90ZSwgZmlsZV0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZWxldGVzLnB1c2goZmlsZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGRlbGV0ZXMucHVzaChmaWxlKTtcbiAgICB9XG4gIH1cblxuICBmb3IgKGNvbnN0IG5vdGUgb2Ygbm90ZXMpIHtcbiAgICBpZiAoIXdyaXRlcy5zb21lKChbbl0pID0+IG4udXVpZCA9PT0gbm90ZS51dWlkKSkge1xuICAgICAgY29uc3QgZmlsZSA9IGRpci5nZXRfY2hpbGQoYCR7bm90ZS51dWlkfS5tZGApO1xuICAgICAgd3JpdGVzLnB1c2goW25vdGUsIGZpbGVdKTtcbiAgICB9XG4gIH1cblxuICBmb3IgKGNvbnN0IGZpbGUgb2YgZGVsZXRlcykge1xuICAgIHRyeSB7IGZpbGUuZGVsZXRlKG51bGwpOyB9IGNhdGNoIChlKSB7fVxuICB9XG5cbiAgcmV0dXJuIHdyaXRlcy5tYXAoKFtub3RlLCBmaWxlXSkgPT4gc2F2ZV9maWxlKGZpbGUsIG5vdGUpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNhdmVfbm90ZShub3RlOiBOb3RlKSB7XG4gIGNvbnN0IGRpciA9IGdldF9ub3Rlc19kaXIoKTtcbiAgY29uc3QgZmlsZSA9IGRpci5nZXRfY2hpbGQoYCR7bm90ZS51dWlkfS5tZGApO1xuXG4gIC8vIFRyeSB0byByZW1vdmUgb2xkIGpzb24gZmlsZSBpZiBpdCBleGlzdHNcbiAgdHJ5IHtcbiAgICAgIGNvbnN0IG9sZEZpbGUgPSBkaXIuZ2V0X2NoaWxkKGAke25vdGUudXVpZH0uanNvbmApO1xuICAgICAgaWYgKG9sZEZpbGUucXVlcnlfZXhpc3RzKG51bGwpKSB7XG4gICAgICAgICAgb2xkRmlsZS5kZWxldGUobnVsbCk7XG4gICAgICB9XG4gIH0gY2F0Y2ggKGUpIHt9XG5cbiAgcmV0dXJuIHNhdmVfZmlsZShmaWxlLCBub3RlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlbGV0ZV9ub3RlKHV1aWQ6IHN0cmluZykge1xuICBjb25zdCBkaXIgPSBnZXRfbm90ZXNfZGlyKCk7XG4gIGNvbnN0IGZpbGVNZCA9IGRpci5nZXRfY2hpbGQoYCR7dXVpZH0ubWRgKTtcbiAgY29uc3QgZmlsZUpzb24gPSBkaXIuZ2V0X2NoaWxkKGAke3V1aWR9Lmpzb25gKTtcblxuICB0cnkge1xuICAgIGZpbGVNZC5kZWxldGUobnVsbCk7XG4gIH0gY2F0Y2gge31cbiAgXG4gIHRyeSB7XG4gICAgZmlsZUpzb24uZGVsZXRlKG51bGwpO1xuICB9IGNhdGNoIHt9XG59XG4iLCAiZXhwb3J0IGVudW0gU3RpY2t5RXJyb3JUeXBlIHtcbiAgRklMRV9OT1RfRk9VTkQsXG4gIEZJTEVfQ09SUlVQVEVELFxuICBOT19QRVJNSVNTSU9OLFxuICBVTktOT1dOLFxufVxuXG5leHBvcnQgY2xhc3MgU3RpY2t5RXJyb3Ige1xuICBtZXNzYWdlOiBzdHJpbmc7XG4gIHR5cGU6IFN0aWNreUVycm9yVHlwZTtcblxuICBjb25zdHJ1Y3Rvcih0eXBlOiBTdGlja3lFcnJvclR5cGUsIG1lc3NhZ2U6IHN0cmluZykge1xuICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgdGhpcy50eXBlID0gdHlwZTtcbiAgfVxufVxuIiwgIi8qIE1JVCBMaWNlbnNlXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDIzIEFuZ2VsbyBWZXJsYWluLCBDaHJpcyBEYXZpc1xuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbiAqIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuICogU09GVFdBUkUuXG4gKlxuICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IE1JVFxuICovXG5cbmltcG9ydCBBZHcgZnJvbSBcImdpOi8vQWR3XCI7XG5pbXBvcnQgR2lvIGZyb20gXCJnaTovL0dpb1wiO1xuaW1wb3J0IEdMaWIgZnJvbSBcImdpOi8vR0xpYlwiO1xuaW1wb3J0IEdPYmplY3QgZnJvbSBcImdpOi8vR09iamVjdFwiO1xuaW1wb3J0IEd0ayBmcm9tIFwiZ2k6Ly9HdGs/dmVyc2lvbj00LjBcIjtcblxuR2lvLl9wcm9taXNpZnkoXG4gIEdpby5GaWxlLnByb3RvdHlwZSxcbiAgXCJsb2FkX2NvbnRlbnRzX2FzeW5jXCIsXG4gIFwibG9hZF9jb250ZW50c19maW5pc2hcIixcbik7XG5cbkdpby5fcHJvbWlzaWZ5KFxuICBHaW8uRmlsZS5wcm90b3R5cGUsXG4gIFwicmVwbGFjZV9jb250ZW50c19hc3luY1wiLFxuICBcInJlcGxhY2VfY29udGVudHNfZmluaXNoXCIsXG4pO1xuXG5leHBvcnQgaW50ZXJmYWNlIElUYWcge1xuICBuYW1lOiBzdHJpbmc7XG4gIHN0YXJ0OiBudW1iZXI7XG4gIGVuZDogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElOb3RlIHtcbiAgdjogMTtcbiAgdXVpZDogc3RyaW5nO1xuICBjb250ZW50OiBzdHJpbmc7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIHN0eWxlOiBTdHlsZTtcbiAgdGFnczogSVRhZ1tdO1xuICBtb2RpZmllZDogRGF0ZTtcbiAgd2lkdGg6IG51bWJlcjtcbiAgaGVpZ2h0OiBudW1iZXI7XG4gIG9wZW46IGJvb2xlYW47XG59XG5cbmV4cG9ydCBlbnVtIFN0eWxlIHtcbiAgXCJ5ZWxsb3dcIiA9IDEsXG4gIFwicGlua1wiLFxuICBcImdyZWVuXCIsXG4gIFwicHVycGxlXCIsXG4gIFwiYmx1ZVwiLFxuICBcImdyYXlcIixcbiAgXCJjaGFyY29hbFwiLFxuICBcIndpbmRvd1wiLFxufVxuXG5leHBvcnQgY29uc3QgU3R5bGVOYW1lcyA9IG5ldyBNYXAoW1xuICBbU3R5bGUueWVsbG93LCBfKFwiWWVsbG93XCIpXSxcbiAgW1N0eWxlLnBpbmssIF8oXCJQaW5rXCIpXSxcbiAgW1N0eWxlLmdyZWVuLCBfKFwiR3JlZW5cIildLFxuICBbU3R5bGUucHVycGxlLCBfKFwiUHVycGxlXCIpXSxcbiAgW1N0eWxlLmJsdWUsIF8oXCJCbHVlXCIpXSxcbiAgW1N0eWxlLmdyYXksIF8oXCJHcmF5XCIpXSxcbiAgW1N0eWxlLmNoYXJjb2FsLCBfKFwiQ2hhcmNvYWxcIildLFxuICBbU3R5bGUud2luZG93LCBfKFwiV2luZG93XCIpXSxcbl0pO1xuXG5leHBvcnQgY29uc3Qgc3R5bGVzID0gT2JqZWN0LnZhbHVlcyhTdHlsZSkuZmlsdGVyKFxuICAoc3R5bGUpID0+IHR5cGVvZiBzdHlsZSA9PT0gXCJudW1iZXJcIixcbikgYXMgU3R5bGVbXTtcblxuZXhwb3J0IGNvbnN0IHNldHRpbmdzID0gbmV3IEdpby5TZXR0aW5ncyh7IHNjaGVtYV9pZDogXCJjb20udml4YWxpZW4uc3RpY2t5XCIgfSk7XG5cbmNvbnN0IGdldF9zZXR0aW5ncyA9ICgpID0+ICh7XG4gIERFRkFVTFRfU1RZTEU6IHNldHRpbmdzLmdldF9lbnVtKFwiZGVmYXVsdC1zdHlsZVwiKSBhcyBTdHlsZSxcbiAgREVGQVVMVF9XSURUSDogc2V0dGluZ3MuZ2V0X2ludChcImRlZmF1bHQtd2lkdGhcIiksXG4gIERFRkFVTFRfSEVJR0hUOiBzZXR0aW5ncy5nZXRfaW50KFwiZGVmYXVsdC1oZWlnaHRcIiksXG4gIENPTkZJUk1fREVMRVRFOiBzZXR0aW5ncy5nZXRfYm9vbGVhbihcImNvbmZpcm0tZGVsZXRlXCIpLFxuICBOT1RFU19QQVRIOiBzZXR0aW5ncy5nZXRfc3RyaW5nKFwibm90ZXMtcGF0aFwiKSxcbn0pO1xuXG5leHBvcnQgbGV0IFNFVFRJTkdTID0gZ2V0X3NldHRpbmdzKCk7XG5cbnNldHRpbmdzLmNvbm5lY3QoXCJjaGFuZ2VkXCIsICgpID0+IHtcbiAgU0VUVElOR1MgPSBnZXRfc2V0dGluZ3MoKTtcbn0pO1xuXG5leHBvcnQgY2xhc3MgVGFnIGV4dGVuZHMgR09iamVjdC5PYmplY3Qge1xuICBzdGF0aWMgJGd0eXBlOiBHT2JqZWN0LkdUeXBlPFRhZz47XG5cbiAgbmFtZTogc3RyaW5nO1xuICBzdGFydDogbnVtYmVyO1xuICBlbmQ6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcsIHN0YXJ0OiBudW1iZXIgPSAwLCBlbmQ6IG51bWJlciA9IDApIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5zdGFydCA9IHN0YXJ0O1xuICAgIHRoaXMuZW5kID0gZW5kO1xuICB9XG5cbiAgc3RhdGljIHtcbiAgICBHT2JqZWN0LnJlZ2lzdGVyQ2xhc3Moe1xuICAgICAgR1R5cGVOYW1lOiBcIlRhZ09iamVjdFwiLFxuICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgbmFtZTogR09iamVjdC5QYXJhbVNwZWMuc3RyaW5nKFwibmFtZVwiLCBcIk5hbWVcIiwgXCJUaGUgbmFtZSBvZiB0aGUgdGFnXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIFwiXCIpLFxuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgc3RhcnQ6IEdPYmplY3QuUGFyYW1TcGVjLmludChcInN0YXJ0XCIsIFwiU3RhcnRcIiwgXCJTdGFydGluZyBwb3NpdGlvbiBvZiB0aGUgdGFnXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIDAsIDEwMCwgMCksXG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICBlbmQ6IEdPYmplY3QuUGFyYW1TcGVjLmludChcImVuZFwiLCBcIkVuZFwiLCBcIkVuZGluZyBwb3NpdGlvbiBvZiB0aGUgdGFnXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIDAsIDEwMCwgMCksXG4gICAgICB9LFxuICAgIH0sIHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBOb3RlIGV4dGVuZHMgR09iamVjdC5PYmplY3Qge1xuICBwcml2YXRlIHN0YXRpYyB0YWdfbGlzdF9wc3BlYyA9IEdPYmplY3QucGFyYW1fc3BlY19vYmplY3QoXG4gICAgXCJ0YWdfbGlzdFwiLFxuICAgIFwiVGFnc1wiLFxuICAgIFwiVGFncyBvZiB0aGUgbm90ZVwiLFxuICAgIEdpby5MaXN0U3RvcmUuJGd0eXBlLFxuICAgIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsXG4gICk7XG5cbiAgc3RhdGljICRndHlwZTogR09iamVjdC5HVHlwZTxOb3RlPjtcblxuICB2OiAxO1xuICB1dWlkOiBzdHJpbmc7XG4gIGNvbnRlbnQ6IHN0cmluZztcbiAgdGl0bGU6IHN0cmluZztcbiAgc3R5bGU6IFN0eWxlO1xuICB0YWdfbGlzdDogR2lvLkxpc3RTdG9yZTxUYWc+O1xuICBtb2RpZmllZDogR0xpYi5EYXRlVGltZTtcbiAgd2lkdGg6IG51bWJlcjtcbiAgaGVpZ2h0OiBudW1iZXI7XG4gIG9wZW46IGJvb2xlYW47XG5cbiAgZ2V0IHRhZ3MoKSB7XG4gICAgY29uc3QgaXRlbXMgPSBbXTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy50YWdfbGlzdC5nZXRfbl9pdGVtcygpOyBpKyspIHtcbiAgICAgIGNvbnN0IHRhZyA9IHRoaXMudGFnX2xpc3QuZ2V0X2l0ZW0oaSkhO1xuICAgICAgaXRlbXMucHVzaCh7XG4gICAgICAgIG5hbWU6IHRhZy5uYW1lLFxuICAgICAgICBzdGFydDogdGFnLnN0YXJ0LFxuICAgICAgICBlbmQ6IHRhZy5lbmQsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gaXRlbXM7XG4gIH1cblxuICBzZXQgdGFncyh0YWdzOiBJTm90ZVtcInRhZ3NcIl0pIHtcbiAgICB0aGlzLnRhZ19saXN0LnJlbW92ZV9hbGwoKTtcblxuICAgIGZvciAoY29uc3QgdGFnIG9mIHRhZ3MpIHtcbiAgICAgIGNvbnN0IHRhZ19vYmplY3QgPSBuZXcgVGFnKHRhZy5uYW1lLCB0YWcuc3RhcnQsIHRhZy5lbmQpO1xuICAgICAgdGhpcy50YWdfbGlzdC5hcHBlbmQodGFnX29iamVjdCk7XG4gICAgfVxuXG4gICAgdGhpcy5lbWl0KFwibm90aWZ5Ojp0YWdfbGlzdFwiLCBOb3RlLnRhZ19saXN0X3BzcGVjKTtcbiAgfVxuXG4gIGdldCBtb2RpZmllZF9kYXRlKCkge1xuICAgIHJldHVybiBuZXcgRGF0ZSh0aGlzLm1vZGlmaWVkLnRvX3VuaXgoKSAqIDEwMDApO1xuICB9XG5cbiAgLy8gYW55dGhpbmcgdGhlIGNvbnN0cnVjdG9yIG9mIGRhdGUgYWNjZXB0c1xuICBzZXQgbW9kaWZpZWRfZGF0ZShkYXRlOiBEYXRlKSB7XG4gICAgdGhpcy5tb2RpZmllZCA9IEdMaWIuRGF0ZVRpbWUubmV3X2Zyb21faXNvODYwMShcbiAgICAgIG5ldyBEYXRlKGRhdGUpLnRvSVNPU3RyaW5nKCksXG4gICAgICBudWxsLFxuICAgICk7XG4gIH1cblxuICBjb25zdHJ1Y3Rvcihub3RlOiBJTm90ZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy52ID0gbm90ZS52O1xuICAgIHRoaXMudXVpZCA9IG5vdGUudXVpZDtcbiAgICB0aGlzLmNvbnRlbnQgPSBub3RlLmNvbnRlbnQ7XG4gICAgdGhpcy50aXRsZSA9IG5vdGUudGl0bGU7XG4gICAgdGhpcy5zdHlsZSA9IG5vdGUuc3R5bGU7XG4gICAgdGhpcy50YWdfbGlzdCA9IEdpby5MaXN0U3RvcmUubmV3KFRhZy4kZ3R5cGUpIGFzIEdpby5MaXN0U3RvcmU8VGFnPjtcbiAgICB0aGlzLnRhZ3MgPSBub3RlLnRhZ3M7XG4gICAgdGhpcy5tb2RpZmllZCA9IEdMaWIuRGF0ZVRpbWUubmV3X2Zyb21faXNvODYwMShcbiAgICAgIG5ldyBEYXRlKG5vdGUubW9kaWZpZWQpLnRvSVNPU3RyaW5nKCksXG4gICAgICBudWxsLFxuICAgICk7XG4gICAgdGhpcy53aWR0aCA9IG5vdGUud2lkdGg7XG4gICAgdGhpcy5oZWlnaHQgPSBub3RlLmhlaWdodDtcbiAgICB0aGlzLm9wZW4gPSBub3RlLm9wZW4gPz8gZmFsc2U7XG5cbiAgfVxuXG4gIHN0YXRpYyBnZW5lcmF0ZSh0aXRsZTogc3RyaW5nID0gXCJcIikge1xuICAgIHJldHVybiBuZXcgdGhpcyh7XG4gICAgICB2OiAxLFxuICAgICAgdXVpZDogR0xpYi51dWlkX3N0cmluZ19yYW5kb20oKSxcbiAgICAgIGNvbnRlbnQ6IFwiXCIsXG4gICAgICB0aXRsZTogdGl0bGUsXG4gICAgICBzdHlsZTogU0VUVElOR1MuREVGQVVMVF9TVFlMRSxcbiAgICAgIHRhZ3M6IFtdLFxuICAgICAgbW9kaWZpZWQ6IG5ldyBEYXRlKCksXG4gICAgICB3aWR0aDogMzAwLFxuICAgICAgaGVpZ2h0OiAzMDAsXG4gICAgICBvcGVuOiBmYWxzZSxcbiAgICB9KTtcbiAgfVxuXG4gIGNvcHkoKSB7XG4gICAgcmV0dXJuIG5ldyBOb3RlKHtcbiAgICAgIHY6IHRoaXMudixcbiAgICAgIHV1aWQ6IHRoaXMudXVpZCxcbiAgICAgIGNvbnRlbnQ6IHRoaXMuY29udGVudCxcbiAgICAgIHRpdGxlOiB0aGlzLnRpdGxlLFxuICAgICAgc3R5bGU6IHRoaXMuc3R5bGUsXG4gICAgICB0YWdzOiB0aGlzLnRhZ3MubWFwKCh0YWcpID0+ICh7XG4gICAgICAgIG5hbWU6IHRhZy5uYW1lLFxuICAgICAgICBzdGFydDogdGFnLnN0YXJ0LFxuICAgICAgICBlbmQ6IHRhZy5lbmQsXG4gICAgICB9KSksXG4gICAgICBtb2RpZmllZDogbmV3IERhdGUodGhpcy5tb2RpZmllZC50b191bml4KCkgKiAxMDAwKSxcbiAgICAgIHdpZHRoOiB0aGlzLndpZHRoLFxuICAgICAgaGVpZ2h0OiB0aGlzLmhlaWdodCxcbiAgICAgIG9wZW46IHRoaXMub3BlbixcbiAgICB9KTtcbiAgfVxuXG4gIHRvSlNPTigpOiBJTm90ZSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHY6IHRoaXMudixcbiAgICAgIHV1aWQ6IHRoaXMudXVpZCxcbiAgICAgIGNvbnRlbnQ6IHRoaXMuY29udGVudCxcbiAgICAgIHRpdGxlOiB0aGlzLnRpdGxlLFxuICAgICAgc3R5bGU6IHRoaXMuc3R5bGUsXG4gICAgICB0YWdzOiB0aGlzLnRhZ3MsXG4gICAgICBtb2RpZmllZDogdGhpcy5tb2RpZmllZF9kYXRlLFxuICAgICAgd2lkdGg6IHRoaXMud2lkdGgsXG4gICAgICBoZWlnaHQ6IHRoaXMuaGVpZ2h0LFxuICAgICAgb3BlbjogdGhpcy5vcGVuLFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMge1xuICAgIEdPYmplY3QucmVnaXN0ZXJDbGFzcyh7XG4gICAgICBHVHlwZU5hbWU6IFwiTm90ZU9iamVjdFwiLFxuICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgdjogR09iamVjdC5QYXJhbVNwZWMuaW50KFwidlwiLCBcIlZlcnNpb25cIiwgXCJWZXJzaW9uIG9mIHRoZSBub3RlXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIDAsIDEwMCwgMCksXG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICB1dWlkOiBHT2JqZWN0LlBhcmFtU3BlYy5zdHJpbmcoXCJ1dWlkXCIsIFwiVVVJRFwiLCBcIlVVSUQgb2YgdGhlIG5vdGVcIiwgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSwgXCJcIiksXG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICBjb250ZW50OiBHT2JqZWN0LlBhcmFtU3BlYy5zdHJpbmcoXCJjb250ZW50XCIsIFwiQ29udGVudFwiLCBcIkNvbnRlbnQgb2YgdGhlIG5vdGVcIiwgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSwgXCJcIiksXG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICB0aXRsZTogR09iamVjdC5QYXJhbVNwZWMuc3RyaW5nKFwidGl0bGVcIiwgXCJUaXRsZVwiLCBcIlRpdGxlIG9mIHRoZSBub3RlXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIFwiXCIpLFxuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgc3R5bGU6IEdPYmplY3QuUGFyYW1TcGVjLmludChcInN0eWxlXCIsIFwiU3R5bGVcIiwgXCJTdHlsZSBvZiB0aGUgbm90ZVwiLCBHT2JqZWN0LlBhcmFtRmxhZ3MuUkVBRFdSSVRFLCAwLCAxMDAsIDApLFxuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgdGFnX2xpc3Q6IHRoaXMudGFnX2xpc3RfcHNwZWMsXG4gICAgICAgIC8vIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICBtb2RpZmllZDogR09iamVjdC5QYXJhbVNwZWMuYm94ZWQoXCJtb2RpZmllZFwiLCBcIk1vZGlmaWVkXCIsIFwiRGF0ZSB0aGUgbm90ZSB3YXMgbW9kaWZpZWRcIiwgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSwgR0xpYi5EYXRlVGltZSksXG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICB3aWR0aDogR09iamVjdC5QYXJhbVNwZWMuaW50KFwid2lkdGhcIiwgXCJXaWR0aFwiLCBcIldpZHRoIG9mIHRoZSBub3RlXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIDAsIDEwMCwgMCksXG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICBoZWlnaHQ6IEdPYmplY3QuUGFyYW1TcGVjLmludChcImhlaWdodFwiLCBcIkhlaWdodFwiLCBcIkhlaWdodCBvZiB0aGUgbm90ZVwiLCBHT2JqZWN0LlBhcmFtRmxhZ3MuUkVBRFdSSVRFLCAwLCAxMDAsIDApLFxuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgb3BlbjogR09iamVjdC5QYXJhbVNwZWMuYm9vbGVhbihcIm9wZW5cIiwgXCJPcGVuXCIsIFwiV2hldGhlciB0aGUgbm90ZSB3YXMgb3BlbiB3aGVuIHRoZSBhcHBsaWNhdGlvbiB3YXMgY2xvc2VkXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIGZhbHNlKSxcbiAgICAgIH0sXG4gICAgfSwgdGhpcyk7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGNvbmZpcm1fZGVsZXRlID0gKHdpbmRvdzogR3RrLldpbmRvdywgY2I6ICgpID0+IHZvaWQpID0+IHtcbiAgaWYgKFNFVFRJTkdTLkNPTkZJUk1fREVMRVRFKSB7XG4gICAgY29uc3QgZGlhbG9nID0gQWR3Lk1lc3NhZ2VEaWFsb2cubmV3KFxuICAgICAgd2luZG93LFxuICAgICAgXyhcIkRlbGV0ZSBOb3RlP1wiKSxcbiAgICAgIF8oXCJUaGlzIGFjdGlvbiBjYW5ub3QgYmUgdW5kb25lLiBJZiB5b3Ugd2FudCB0byBoaWRlIHRoZSBub3RlLCB5b3UgY2FuIGNsb3NlIGl0IGluc3RlYWQuXCIpLFxuICAgICk7XG4gICAgZGlhbG9nLmFkZF9yZXNwb25zZShcImNhbmNlbFwiLCBfKFwiQ2FuY2VsXCIpKTtcbiAgICBkaWFsb2cuYWRkX3Jlc3BvbnNlKFwiZGVsZXRlXCIsIF8oXCJEZWxldGVcIikpO1xuICAgIGRpYWxvZy5zZXRfcmVzcG9uc2VfYXBwZWFyYW5jZShcbiAgICAgIFwiZGVsZXRlXCIsXG4gICAgICBBZHcuUmVzcG9uc2VBcHBlYXJhbmNlLkRFU1RSVUNUSVZFLFxuICAgICk7XG4gICAgZGlhbG9nLnNldF9kZWZhdWx0X3Jlc3BvbnNlKFwiY2FuY2VsXCIpO1xuICAgIGRpYWxvZy5zZXRfY2xvc2VfcmVzcG9uc2UoXCJjYW5jZWxcIik7XG4gICAgZGlhbG9nLmNvbm5lY3QoXCJyZXNwb25zZVwiLCAoX2RpYWxvZywgcmVzcG9uc2UpID0+IHtcbiAgICAgIGlmIChyZXNwb25zZSA9PT0gXCJkZWxldGVcIikge1xuICAgICAgICBjYigpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGRpYWxvZy5wcmVzZW50KCk7XG4gIH0gZWxzZSB7XG4gICAgY2IoKTtcbiAgfVxufTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBQSxPQUFPQSxVQUFTO0FBQ2hCLE9BQU9DLFdBQVU7OztBQ01WLElBQU0sY0FBTixNQUFrQjtBQUFBLEVBSXZCLFlBQVksTUFBdUIsU0FBaUI7QUFDbEQsU0FBSyxVQUFVO0FBQ2YsU0FBSyxPQUFPO0FBQUEsRUFDZDtBQUNGOzs7QUNVQSxPQUFPLFNBQVM7QUFDaEIsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sVUFBVTtBQUNqQixPQUFPLGFBQWE7QUFHcEIsSUFBSTtBQUFBLEVBQ0YsSUFBSSxLQUFLO0FBQUEsRUFDVDtBQUFBLEVBQ0E7QUFDRjtBQUVBLElBQUk7QUFBQSxFQUNGLElBQUksS0FBSztBQUFBLEVBQ1Q7QUFBQSxFQUNBO0FBQ0Y7QUFxQk8sSUFBSyxRQUFMLGtCQUFLQyxXQUFMO0FBQ0wsRUFBQUEsY0FBQSxZQUFXLEtBQVg7QUFDQSxFQUFBQSxjQUFBO0FBQ0EsRUFBQUEsY0FBQTtBQUNBLEVBQUFBLGNBQUE7QUFDQSxFQUFBQSxjQUFBO0FBQ0EsRUFBQUEsY0FBQTtBQUNBLEVB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S0FBSyxJQUFJO0FBQ2pCLGdCQUFNLFVBQVUsSUFBSSxVQUFVLEdBQUcsS0FBSyxTQUFTO0FBQy9DLGlCQUFPLEtBQUssQ0FBQyxNQUFNLE9BQU8sQ0FBQztBQUFBLFFBQy9CLE9BQU87QUFDSCxpQkFBTyxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUM7QUFBQSxRQUM1QjtBQUFBLE1BQ0YsT0FBTztBQUNMLGdCQUFRLEtBQUssSUFBSTtBQUFBLE1BQ25CO0FBQUEsSUFDRixPQUFPO0FBQUEsSUFFUDtBQUFBLEVBQ0Y7QUFFQSxhQUFXLFFBQVEsT0FBTztBQUN4QixRQUFJLENBQUMsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxTQUFTLEtBQUssSUFBSSxHQUFHO0FBQy9DLFlBQU0sT0FBTyxJQUFJLFVBQVUsR0FBRyxLQUFLLFNBQVM7QUFDNUMsYUFBTyxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUM7QUFBQSxJQUMxQjtBQUFBLEVBQ0Y7QUFFQSxhQUFXLFFBQVEsU0FBUztBQUMxQixRQUFJO0FBQUUsV0FBSyxPQUFPLElBQUk7QUFBQSxJQUFHLFNBQVMsR0FBUDtBQUFBLElBQVc7QUFBQSxFQUN4QztBQUVBLFNBQU8sT0FBTyxJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksTUFBTSxVQUFVLE1BQU0sSUFBSSxDQUFDO0FBQzNEO0FBRU8sU0FBUyxVQUFVLE1BQVk7QUFDcEMsUUFBTSxNQUFNLGNBQWM7QUFDMUIsUUFBTSxPQUFPLElBQUksVUFBVSxHQUFHLEtBQUssU0FBUztBQUc1QyxNQUFJO0FBQ0EsVUFBTSxVQUFVLElBQUksVUFBVSxHQUFHLEtBQUssV0FBVztBQUNqRCxRQUFJLFFBQVEsYUFBYSxJQUFJLEdBQUc7QUFDNUIsY0FBUSxPQUFPLElBQUk7QUFBQSxJQUN2QjtBQUFBLEVBQ0osU0FBUyxHQUFQO0FBQUEsRUFBVztBQUViLFNBQU8sVUFBVSxNQUFNLElBQUk7QUFDN0I7QUFFTyxTQUFTLFlBQVksTUFBYztBQUN4QyxRQUFNLE1BQU0sY0FBYztBQUMxQixRQUFNLFNBQVMsSUFBSSxVQUFVLEdBQUcsU0FBUztBQUN6QyxRQUFNLFdBQVcsSUFBSSxVQUFVLEdBQUcsV0FBVztBQUU3QyxNQUFJO0FBQ0YsV0FBTyxPQUFPLElBQUk7QUFBQSxFQUNwQixRQUFFO0FBQUEsRUFBTztBQUVULE1BQUk7QUFDRixhQUFTLE9BQU8sSUFBSTtBQUFBLEVBQ3RCLFFBQUU7QUFBQSxFQUFPO0FBQ1g7IiwKICAibmFtZXMiOiBbIkdpbyIsICJHTGliIiwgIlN0eWxlIiwgIkdpbyIsICJHTGliIiwgIl8iLCAibm90ZSJdCn0K
