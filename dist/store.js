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
var load_file = (file) => {
  try {
    Notes.get_parent().make_directory_with_parents(null);
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
    try {
      return JSON.parse(decoder.decode(contents));
    } catch (e) {
      throw new StickyError(
        1 /* FILE_CORRUPTED */,
        "Failed to parse notes"
      );
    }
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
  }
};
var save_file = (file, data) => {
  const string = JSON.stringify(data, null, 2);
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
  ensure_dir(NewNotesDir);
  const files = list_files(NewNotesDir);
  return files.filter((file) => file.get_basename().endsWith(".json")).map((file) => load_file(file)).map((note) => new Note(note));
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
  ensure_dir(NewNotesDir);
  const files = list_files(NewNotesDir);
  let writes = [];
  const deletes = [];
  for (const file of files) {
    const basename = file.get_basename();
    if (basename.endsWith(".json")) {
      const uuid = basename.slice(0, -5);
      if (uuid.length !== 36) {
        deletes.push(file);
        continue;
      }
      const note = notes.find((note2) => note2.uuid === uuid);
      if (note) {
        writes.push([note, file]);
      } else {
        deletes.push(file);
      }
    } else {
    }
  }
  for (const note of notes) {
    if (!writes.some(([n]) => n.uuid === note.uuid)) {
      const file = NewNotesDir.get_child(`${note.uuid}.json`);
      writes.push([note, file]);
    }
  }
  for (const file of deletes) {
    file.delete(null);
  }
  return writes.map(([note, file]) => save_file(file, note));
}
function save_note(note) {
  const file = NewNotesDir.get_child(`${note.uuid}.json`);
  return save_file(file, note);
}
function delete_note(uuid) {
  const file = NewNotesDir.get_child(`${uuid}.json`);
  try {
    return file.delete(null);
  } catch {
  }
}
export {
  NewNotesDir,
  Notes,
  NotesDir,
  delete_note,
  ensure_dir,
  list_files,
  load_file,
  load_notes,
  save_file,
  save_note,
  save_notes
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL3N0b3JlLnRzIiwgIi4uL3NyYy9lcnJvcnMudHMiLCAiLi4vc3JjL3V0aWwudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCBHaW8gZnJvbSBcImdpOi8vR2lvXCI7XG5pbXBvcnQgR0xpYiBmcm9tIFwiZ2k6Ly9HTGliXCI7XG5cbmltcG9ydCB7IFN0aWNreUVycm9yLCBTdGlja3lFcnJvclR5cGUgfSBmcm9tIFwiLi9lcnJvcnMuanNcIjtcbmltcG9ydCB7IElOb3RlLCBOb3RlIH0gZnJvbSBcIi4vdXRpbC5qc1wiO1xuXG5HaW8uX3Byb21pc2lmeShcbiAgR2lvLkZpbGUucHJvdG90eXBlLFxuICBcImxvYWRfY29udGVudHNfYXN5bmNcIixcbiAgXCJsb2FkX2NvbnRlbnRzX2ZpbmlzaFwiLFxuKTtcblxuR2lvLl9wcm9taXNpZnkoXG4gIEdpby5GaWxlLnByb3RvdHlwZSxcbiAgXCJyZXBsYWNlX2NvbnRlbnRzX2FzeW5jXCIsXG4gIFwicmVwbGFjZV9jb250ZW50c19maW5pc2hcIixcbik7XG5cbmNvbnN0IGRlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoKTtcbmNvbnN0IGVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKTtcblxuaW50ZXJmYWNlIFNhdmVkTm90ZURhdGEge1xuICB2OiAxO1xuICBub3RlczogSU5vdGVbXTtcbiAgc3RhdGU6IFN0YXRlO1xufVxuXG5pbnRlcmZhY2UgTG9hZE5vdGVzUmV0dXJuIHtcbiAgbm90ZXM6IE5vdGVbXTtcbiAgc3RhdGU6IFN0YXRlO1xufVxuXG5pbnRlcmZhY2UgU3RhdGUge1xuICBhbGxfbm90ZXM6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjb25zdCBOb3Rlc0RpciA9IEdpby5maWxlX25ld19mb3JfcGF0aChcbiAgR0xpYi5idWlsZF9maWxlbmFtZXYoW0dMaWIuZ2V0X3VzZXJfZGF0YV9kaXIoKSwgcGtnLm5hbWVdKSxcbik7XG5cbmV4cG9ydCBjb25zdCBOZXdOb3Rlc0RpciA9IEdpby5maWxlX25ld19mb3JfcGF0aChcbiAgR0xpYi5idWlsZF9maWxlbmFtZXYoW0dMaWIuZ2V0X3VzZXJfZGF0YV9kaXIoKSwgcGtnLm5hbWUsIFwibm90ZXNcIl0pLFxuKTtcblxuZXhwb3J0IGNvbnN0IE5vdGVzID0gR2lvLmZpbGVfbmV3X2Zvcl9wYXRoKFxuICBHTGliLmJ1aWxkX2ZpbGVuYW1ldihbTm90ZXNEaXIuZ2V0X3BhdGgoKSEsIFwibm90ZXMuanNvblwiXSksXG4pO1xuXG5leHBvcnQgY29uc3QgbG9hZF9maWxlID0gKGZpbGU6IEdpby5GaWxlKSA9PiB7XG4gIHRyeSB7XG4gICAgTm90ZXMuZ2V0X3BhcmVudCgpIS5tYWtlX2RpcmVjdG9yeV93aXRoX3BhcmVudHMobnVsbCk7XG4gIH0gY2F0Y2ggKGU6IHVua25vd24pIHtcbiAgICBpZiAoZSBpbnN0YW5jZW9mIEdMaWIuRXJyb3IpIHtcbiAgICAgIGlmICghZS5tYXRjaGVzKEdpby5JT0Vycm9yRW51bSwgR2lvLklPRXJyb3JFbnVtLkVYSVNUUykpIHtcbiAgICAgICAgdGhyb3cgbmV3IFN0aWNreUVycm9yKFxuICAgICAgICAgIFN0aWNreUVycm9yVHlwZS5OT19QRVJNSVNTSU9OLFxuICAgICAgICAgIFwiRmFpbGVkIHRvIGNyZWF0ZSBub3RlcyBkaXJlY3RvcnlcIixcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB0cnkge1xuICAgIGNvbnN0IFtfLCBjb250ZW50c10gPSBmaWxlLmxvYWRfY29udGVudHMobnVsbCk7XG5cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZGVjb2Rlci5kZWNvZGUoY29udGVudHMpKTtcbiAgICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgICB0aHJvdyBuZXcgU3RpY2t5RXJyb3IoXG4gICAgICAgIFN0aWNreUVycm9yVHlwZS5GSUxFX0NPUlJVUFRFRCxcbiAgICAgICAgXCJGYWlsZWQgdG8gcGFyc2Ugbm90ZXNcIixcbiAgICAgICk7XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKGUgaW5zdGFuY2VvZiBHTGliLkVycm9yKSB7XG4gICAgICBpZiAoZS5tYXRjaGVzKEdpby5JT0Vycm9yRW51bSwgR2lvLklPRXJyb3JFbnVtLk5PVF9GT1VORCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFN0aWNreUVycm9yKFxuICAgICAgICAgIFN0aWNreUVycm9yVHlwZS5GSUxFX05PVF9GT1VORCxcbiAgICAgICAgICBcIkZhaWxlZCB0byBsb2FkIG5vdGVzXCIsXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgU3RpY2t5RXJyb3IoXG4gICAgICAgICAgU3RpY2t5RXJyb3JUeXBlLlVOS05PV04sXG4gICAgICAgICAgXCJGYWlsZWQgdG8gbG9hZCBub3Rlc1wiLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IHNhdmVfZmlsZSA9IChmaWxlOiBHaW8uRmlsZSwgZGF0YTogYW55KSA9PiB7XG4gIGNvbnN0IHN0cmluZyA9IEpTT04uc3RyaW5naWZ5KGRhdGEsIG51bGwsIDIpO1xuXG4gIHRyeSB7XG4gICAgcmV0dXJuIGZpbGUucmVwbGFjZV9jb250ZW50cyhcbiAgICAgIGVuY29kZXIuZW5jb2RlKHN0cmluZyksXG4gICAgICBudWxsLFxuICAgICAgZmFsc2UsXG4gICAgICBHaW8uRmlsZUNyZWF0ZUZsYWdzLk5PTkUsXG4gICAgICBudWxsLFxuICAgICk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoZSBpbnN0YW5jZW9mIEdMaWIuRXJyb3IpIHtcbiAgICAgIGlmIChlLm1hdGNoZXMoR2lvLklPRXJyb3JFbnVtLCBHaW8uSU9FcnJvckVudW0uUEVSTUlTU0lPTl9ERU5JRUQpKSB7XG4gICAgICAgIHRocm93IG5ldyBTdGlja3lFcnJvcihcbiAgICAgICAgICBTdGlja3lFcnJvclR5cGUuTk9fUEVSTUlTU0lPTixcbiAgICAgICAgICBcIkZhaWxlZCB0byBzYXZlIG5vdGVzXCIsXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgU3RpY2t5RXJyb3IoXG4gICAgICAgICAgU3RpY2t5RXJyb3JUeXBlLlVOS05PV04sXG4gICAgICAgICAgXCJGYWlsZWQgdG8gc2F2ZSBub3Rlc1wiLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGVuc3VyZV9kaXIgPSAoZGlyOiBHaW8uRmlsZSkgPT4ge1xuICB0cnkge1xuICAgIGRpci5tYWtlX2RpcmVjdG9yeV93aXRoX3BhcmVudHMobnVsbCk7XG4gIH0gY2F0Y2ggKGU6IHVua25vd24pIHtcbiAgICBpZiAoZSBpbnN0YW5jZW9mIEdMaWIuRXJyb3IpIHtcbiAgICAgIGlmICghZS5tYXRjaGVzKEdpby5JT0Vycm9yRW51bSwgR2lvLklPRXJyb3JFbnVtLkVYSVNUUykpIHtcbiAgICAgICAgdGhyb3cgbmV3IFN0aWNreUVycm9yKFxuICAgICAgICAgIFN0aWNreUVycm9yVHlwZS5OT19QRVJNSVNTSU9OLFxuICAgICAgICAgIFwiRmFpbGVkIHRvIGNyZWF0ZSBub3RlcyBkaXJlY3RvcnlcIixcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbmNvbnN0IGJvZ3VzX2RhdGE6IExvYWROb3Rlc1JldHVybiA9IHsgc3RhdGU6IHsgYWxsX25vdGVzOiB0cnVlIH0sIG5vdGVzOiBbXSB9O1xuXG5jb25zdCBsb2FkX25vdGVzX3YxID0gKG5vdGVzOiBhbnkpID0+IHtcbiAgaWYgKG5vdGVzLnYgIT09IDEpIHtcbiAgICBjb25zb2xlLmVycm9yKGBJbnZhbGlkIG5vdGVzIHZlcnNpb24gJHtub3Rlcy52fWApO1xuICAgIHJldHVybiBib2d1c19kYXRhO1xuICB9XG4gIHJldHVybiB7XG4gICAgbm90ZXM6IG5vdGVzLm5vdGVzLm1hcCgobm90ZTogSU5vdGUpID0+IG5ldyBOb3RlKG5vdGUpKSxcbiAgICBzdGF0ZTogbm90ZXMuc3RhdGUsXG4gIH0gYXMgTG9hZE5vdGVzUmV0dXJuO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRfbm90ZXMoKSB7XG4gIGxldCBpbmRleCA9IG51bGw7XG5cbiAgdHJ5IHtcbiAgICBpbmRleCA9IGxvYWRfZmlsZShOb3RlcykgPz8gbnVsbDtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChlIGluc3RhbmNlb2YgU3RpY2t5RXJyb3IpIHtcbiAgICAgIGlmIChcbiAgICAgICAgZS50eXBlID09IFN0aWNreUVycm9yVHlwZS5GSUxFX05PVF9GT1VORCB8fFxuICAgICAgICBlLnR5cGUgPT0gU3RpY2t5RXJyb3JUeXBlLkZJTEVfQ09SUlVQVEVEXG4gICAgICApIHtcbiAgICAgICAgLy8gaWdub3JlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChpbmRleCAhPT0gbnVsbCkge1xuICAgIC8vIGlmIHRoZSBpbmRleCBleGlzdHMsIGxvYWQgdGhlIG5vdGVzIGZyb20gdGhlIGluZGV4XG4gICAgY29uc3Qgbm90ZXMgPSBsb2FkX25vdGVzX3YxKGluZGV4KS5ub3RlcztcbiAgICBOb3Rlcy5kZWxldGUobnVsbCk7XG4gICAgc2F2ZV9ub3Rlcyhub3Rlcyk7XG4gICAgcmV0dXJuIG5vdGVzO1xuICB9XG5cbiAgZW5zdXJlX2RpcihOZXdOb3Rlc0Rpcik7XG5cbiAgY29uc3QgZmlsZXMgPSBsaXN0X2ZpbGVzKE5ld05vdGVzRGlyKTtcblxuICByZXR1cm4gZmlsZXNcbiAgICAuZmlsdGVyKChmaWxlKSA9PiBmaWxlLmdldF9iYXNlbmFtZSgpIS5lbmRzV2l0aChcIi5qc29uXCIpKVxuICAgIC5tYXAoKGZpbGUpID0+IGxvYWRfZmlsZShmaWxlKSlcbiAgICAubWFwKChub3RlKSA9PiBuZXcgTm90ZShub3RlKSk7XG59XG5cbmV4cG9ydCBjb25zdCBsaXN0X2ZpbGVzID0gKGRpcjogR2lvLkZpbGUpID0+IHtcbiAgY29uc3QgZW51bWVyYXRvciA9IGRpci5lbnVtZXJhdGVfY2hpbGRyZW4oXG4gICAgXCJzdGFuZGFyZDo6bmFtZSxzdGFuZGFyZDo6dHlwZVwiLFxuICAgIEdpby5GaWxlUXVlcnlJbmZvRmxhZ3MuTk9ORSxcbiAgICBudWxsLFxuICApO1xuXG4gIGNvbnN0IGZpbGVzOiBHaW8uRmlsZVtdID0gW107XG5cbiAgbGV0IGluZm86IEdpby5GaWxlSW5mbyB8IG51bGw7XG5cbiAgd2hpbGUgKChpbmZvID0gZW51bWVyYXRvci5uZXh0X2ZpbGUobnVsbCkpICE9PSBudWxsKSB7XG4gICAgY29uc3QgZmlsZSA9IGVudW1lcmF0b3IuZ2V0X2NoaWxkKGluZm8pO1xuICAgIGZpbGVzLnB1c2goZmlsZSk7XG4gIH1cblxuICByZXR1cm4gZmlsZXM7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gc2F2ZV9ub3Rlcyhub3RlczogTm90ZVtdKSB7XG4gIGVuc3VyZV9kaXIoTmV3Tm90ZXNEaXIpO1xuXG4gIGNvbnN0IGZpbGVzID0gbGlzdF9maWxlcyhOZXdOb3Rlc0Rpcik7XG5cbiAgbGV0IHdyaXRlczogW05vdGUsIEdpby5GaWxlXVtdID0gW107XG4gIGNvbnN0IGRlbGV0ZXM6IEdpby5GaWxlW10gPSBbXTtcblxuICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICBjb25zdCBiYXNlbmFtZSA9IGZpbGUuZ2V0X2Jhc2VuYW1lKCkhO1xuXG4gICAgaWYgKGJhc2VuYW1lLmVuZHNXaXRoKFwiLmpzb25cIikpIHtcbiAgICAgIGNvbnN0IHV1aWQgPSBiYXNlbmFtZS5zbGljZSgwLCAtNSk7XG5cbiAgICAgIGlmICh1dWlkLmxlbmd0aCAhPT0gMzYpIHtcbiAgICAgICAgZGVsZXRlcy5wdXNoKGZpbGUpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgbm90ZSA9IG5vdGVzLmZpbmQoKG5vdGUpID0+IG5vdGUudXVpZCA9PT0gdXVpZCk7XG4gICAgICBpZiAobm90ZSkge1xuICAgICAgICB3cml0ZXMucHVzaChbbm90ZSwgZmlsZV0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVsZXRlcy5wdXNoKGZpbGUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBkZWxldGVzLnB1c2goZmlsZSk7XG4gICAgfVxuICB9XG5cbiAgZm9yIChjb25zdCBub3RlIG9mIG5vdGVzKSB7XG4gICAgaWYgKCF3cml0ZXMuc29tZSgoW25dKSA9PiBuLnV1aWQgPT09IG5vdGUudXVpZCkpIHtcbiAgICAgIGNvbnN0IGZpbGUgPSBOZXdOb3Rlc0Rpci5nZXRfY2hpbGQoYCR7bm90ZS51dWlkfS5qc29uYCk7XG4gICAgICB3cml0ZXMucHVzaChbbm90ZSwgZmlsZV0pO1xuICAgIH1cbiAgfVxuXG4gIGZvciAoY29uc3QgZmlsZSBvZiBkZWxldGVzKSB7XG4gICAgZmlsZS5kZWxldGUobnVsbCk7XG4gIH1cblxuICByZXR1cm4gd3JpdGVzLm1hcCgoW25vdGUsIGZpbGVdKSA9PiBzYXZlX2ZpbGUoZmlsZSwgbm90ZSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2F2ZV9ub3RlKG5vdGU6IE5vdGUpIHtcbiAgY29uc3QgZmlsZSA9IE5ld05vdGVzRGlyLmdldF9jaGlsZChgJHtub3RlLnV1aWR9Lmpzb25gKTtcblxuICByZXR1cm4gc2F2ZV9maWxlKGZpbGUsIG5vdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVsZXRlX25vdGUodXVpZDogc3RyaW5nKSB7XG4gIGNvbnN0IGZpbGUgPSBOZXdOb3Rlc0Rpci5nZXRfY2hpbGQoYCR7dXVpZH0uanNvbmApO1xuXG4gIHRyeSB7XG4gICAgcmV0dXJuIGZpbGUuZGVsZXRlKG51bGwpO1xuICB9IGNhdGNoIHt9XG59XG4iLCAiZXhwb3J0IGVudW0gU3RpY2t5RXJyb3JUeXBlIHtcbiAgRklMRV9OT1RfRk9VTkQsXG4gIEZJTEVfQ09SUlVQVEVELFxuICBOT19QRVJNSVNTSU9OLFxuICBVTktOT1dOLFxufVxuXG5leHBvcnQgY2xhc3MgU3RpY2t5RXJyb3Ige1xuICBtZXNzYWdlOiBzdHJpbmc7XG4gIHR5cGU6IFN0aWNreUVycm9yVHlwZTtcblxuICBjb25zdHJ1Y3Rvcih0eXBlOiBTdGlja3lFcnJvclR5cGUsIG1lc3NhZ2U6IHN0cmluZykge1xuICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgdGhpcy50eXBlID0gdHlwZTtcbiAgfVxufVxuIiwgIi8qIE1JVCBMaWNlbnNlXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDIzIEFuZ2VsbyBWZXJsYWluLCBDaHJpcyBEYXZpc1xuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbiAqIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuICogU09GVFdBUkUuXG4gKlxuICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IE1JVFxuICovXG5cbmltcG9ydCBBZHcgZnJvbSBcImdpOi8vQWR3XCI7XG5pbXBvcnQgR2lvIGZyb20gXCJnaTovL0dpb1wiO1xuaW1wb3J0IEdMaWIgZnJvbSBcImdpOi8vR0xpYlwiO1xuaW1wb3J0IEdPYmplY3QgZnJvbSBcImdpOi8vR09iamVjdFwiO1xuaW1wb3J0IEd0ayBmcm9tIFwiZ2k6Ly9HdGs/dmVyc2lvbj00LjBcIjtcblxuR2lvLl9wcm9taXNpZnkoXG4gIEdpby5GaWxlLnByb3RvdHlwZSxcbiAgXCJsb2FkX2NvbnRlbnRzX2FzeW5jXCIsXG4gIFwibG9hZF9jb250ZW50c19maW5pc2hcIixcbik7XG5cbkdpby5fcHJvbWlzaWZ5KFxuICBHaW8uRmlsZS5wcm90b3R5cGUsXG4gIFwicmVwbGFjZV9jb250ZW50c19hc3luY1wiLFxuICBcInJlcGxhY2VfY29udGVudHNfZmluaXNoXCIsXG4pO1xuXG5leHBvcnQgaW50ZXJmYWNlIElUYWcge1xuICBuYW1lOiBzdHJpbmc7XG4gIHN0YXJ0OiBudW1iZXI7XG4gIGVuZDogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElOb3RlIHtcbiAgdjogMTtcbiAgdXVpZDogc3RyaW5nO1xuICBjb250ZW50OiBzdHJpbmc7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIHN0eWxlOiBTdHlsZTtcbiAgdGFnczogSVRhZ1tdO1xuICBtb2RpZmllZDogRGF0ZTtcbiAgd2lkdGg6IG51bWJlcjtcbiAgaGVpZ2h0OiBudW1iZXI7XG4gIG9wZW46IGJvb2xlYW47XG59XG5cbmV4cG9ydCBlbnVtIFN0eWxlIHtcbiAgXCJ5ZWxsb3dcIiA9IDEsXG4gIFwicGlua1wiLFxuICBcImdyZWVuXCIsXG4gIFwicHVycGxlXCIsXG4gIFwiYmx1ZVwiLFxuICBcImdyYXlcIixcbiAgXCJjaGFyY29hbFwiLFxuICBcIndpbmRvd1wiLFxufVxuXG5leHBvcnQgY29uc3QgU3R5bGVOYW1lcyA9IG5ldyBNYXAoW1xuICBbU3R5bGUueWVsbG93LCBfKFwiWWVsbG93XCIpXSxcbiAgW1N0eWxlLnBpbmssIF8oXCJQaW5rXCIpXSxcbiAgW1N0eWxlLmdyZWVuLCBfKFwiR3JlZW5cIildLFxuICBbU3R5bGUucHVycGxlLCBfKFwiUHVycGxlXCIpXSxcbiAgW1N0eWxlLmJsdWUsIF8oXCJCbHVlXCIpXSxcbiAgW1N0eWxlLmdyYXksIF8oXCJHcmF5XCIpXSxcbiAgW1N0eWxlLmNoYXJjb2FsLCBfKFwiQ2hhcmNvYWxcIildLFxuICBbU3R5bGUud2luZG93LCBfKFwiV2luZG93XCIpXSxcbl0pO1xuXG5leHBvcnQgY29uc3Qgc3R5bGVzID0gT2JqZWN0LnZhbHVlcyhTdHlsZSkuZmlsdGVyKFxuICAoc3R5bGUpID0+IHR5cGVvZiBzdHlsZSA9PT0gXCJudW1iZXJcIixcbikgYXMgU3R5bGVbXTtcblxuZXhwb3J0IGNvbnN0IHNldHRpbmdzID0gbmV3IEdpby5TZXR0aW5ncyh7IHNjaGVtYV9pZDogXCJjb20udml4YWxpZW4uc3RpY2t5XCIgfSk7XG5cbmNvbnN0IGdldF9zZXR0aW5ncyA9ICgpID0+ICh7XG4gIERFRkFVTFRfU1RZTEU6IHNldHRpbmdzLmdldF9lbnVtKFwiZGVmYXVsdC1zdHlsZVwiKSBhcyBTdHlsZSxcbiAgREVGQVVMVF9XSURUSDogc2V0dGluZ3MuZ2V0X2ludChcImRlZmF1bHQtd2lkdGhcIiksXG4gIERFRkFVTFRfSEVJR0hUOiBzZXR0aW5ncy5nZXRfaW50KFwiZGVmYXVsdC1oZWlnaHRcIiksXG4gIENPTkZJUk1fREVMRVRFOiBzZXR0aW5ncy5nZXRfYm9vbGVhbihcImNvbmZpcm0tZGVsZXRlXCIpLFxufSk7XG5cbmV4cG9ydCBsZXQgU0VUVElOR1MgPSBnZXRfc2V0dGluZ3MoKTtcblxuc2V0dGluZ3MuY29ubmVjdChcImNoYW5nZWRcIiwgKCkgPT4ge1xuICBTRVRUSU5HUyA9IGdldF9zZXR0aW5ncygpO1xufSk7XG5cbmV4cG9ydCBjbGFzcyBUYWcgZXh0ZW5kcyBHT2JqZWN0Lk9iamVjdCB7XG4gIHN0YXRpYyAkZ3R5cGU6IEdPYmplY3QuR1R5cGU8VGFnPjtcblxuICBuYW1lOiBzdHJpbmc7XG4gIHN0YXJ0OiBudW1iZXI7XG4gIGVuZDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgc3RhcnQ6IG51bWJlciA9IDAsIGVuZDogbnVtYmVyID0gMCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLnN0YXJ0ID0gc3RhcnQ7XG4gICAgdGhpcy5lbmQgPSBlbmQ7XG4gIH1cblxuICBzdGF0aWMge1xuICAgIEdPYmplY3QucmVnaXN0ZXJDbGFzcyh7XG4gICAgICBHVHlwZU5hbWU6IFwiVGFnT2JqZWN0XCIsXG4gICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICBuYW1lOiBHT2JqZWN0LlBhcmFtU3BlYy5zdHJpbmcoXCJuYW1lXCIsIFwiTmFtZVwiLCBcIlRoZSBuYW1lIG9mIHRoZSB0YWdcIiwgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSwgXCJcIiksXG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICBzdGFydDogR09iamVjdC5QYXJhbVNwZWMuaW50KFwic3RhcnRcIiwgXCJTdGFydFwiLCBcIlN0YXJ0aW5nIHBvc2l0aW9uIG9mIHRoZSB0YWdcIiwgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSwgMCwgMTAwLCAwKSxcbiAgICAgICAgLy8gZGVuby1mbXQtaWdub3JlXG4gICAgICAgIGVuZDogR09iamVjdC5QYXJhbVNwZWMuaW50KFwiZW5kXCIsIFwiRW5kXCIsIFwiRW5kaW5nIHBvc2l0aW9uIG9mIHRoZSB0YWdcIiwgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSwgMCwgMTAwLCAwKSxcbiAgICAgIH0sXG4gICAgfSwgdGhpcyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIE5vdGUgZXh0ZW5kcyBHT2JqZWN0Lk9iamVjdCB7XG4gIHByaXZhdGUgc3RhdGljIHRhZ19saXN0X3BzcGVjID0gR09iamVjdC5wYXJhbV9zcGVjX29iamVjdChcbiAgICBcInRhZ19saXN0XCIsXG4gICAgXCJUYWdzXCIsXG4gICAgXCJUYWdzIG9mIHRoZSBub3RlXCIsXG4gICAgR2lvLkxpc3RTdG9yZS4kZ3R5cGUsXG4gICAgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSxcbiAgKTtcblxuICBzdGF0aWMgJGd0eXBlOiBHT2JqZWN0LkdUeXBlPE5vdGU+O1xuXG4gIHY6IDE7XG4gIHV1aWQ6IHN0cmluZztcbiAgY29udGVudDogc3RyaW5nO1xuICB0aXRsZTogc3RyaW5nO1xuICBzdHlsZTogU3R5bGU7XG4gIHRhZ19saXN0OiBHaW8uTGlzdFN0b3JlPFRhZz47XG4gIG1vZGlmaWVkOiBHTGliLkRhdGVUaW1lO1xuICB3aWR0aDogbnVtYmVyO1xuICBoZWlnaHQ6IG51bWJlcjtcbiAgb3BlbjogYm9vbGVhbjtcblxuICBnZXQgdGFncygpIHtcbiAgICBjb25zdCBpdGVtcyA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnRhZ19saXN0LmdldF9uX2l0ZW1zKCk7IGkrKykge1xuICAgICAgY29uc3QgdGFnID0gdGhpcy50YWdfbGlzdC5nZXRfaXRlbShpKSE7XG4gICAgICBpdGVtcy5wdXNoKHtcbiAgICAgICAgbmFtZTogdGFnLm5hbWUsXG4gICAgICAgIHN0YXJ0OiB0YWcuc3RhcnQsXG4gICAgICAgIGVuZDogdGFnLmVuZCxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBpdGVtcztcbiAgfVxuXG4gIHNldCB0YWdzKHRhZ3M6IElOb3RlW1widGFnc1wiXSkge1xuICAgIHRoaXMudGFnX2xpc3QucmVtb3ZlX2FsbCgpO1xuXG4gICAgZm9yIChjb25zdCB0YWcgb2YgdGFncykge1xuICAgICAgY29uc3QgdGFnX29iamVjdCA9IG5ldyBUYWcodGFnLm5hbWUsIHRhZy5zdGFydCwgdGFnLmVuZCk7XG4gICAgICB0aGlzLnRhZ19saXN0LmFwcGVuZCh0YWdfb2JqZWN0KTtcbiAgICB9XG5cbiAgICB0aGlzLmVtaXQoXCJub3RpZnk6OnRhZ19saXN0XCIsIE5vdGUudGFnX2xpc3RfcHNwZWMpO1xuICB9XG5cbiAgZ2V0IG1vZGlmaWVkX2RhdGUoKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKHRoaXMubW9kaWZpZWQudG9fdW5peCgpICogMTAwMCk7XG4gIH1cblxuICAvLyBhbnl0aGluZyB0aGUgY29uc3RydWN0b3Igb2YgZGF0ZSBhY2NlcHRzXG4gIHNldCBtb2RpZmllZF9kYXRlKGRhdGU6IERhdGUpIHtcbiAgICB0aGlzLm1vZGlmaWVkID0gR0xpYi5EYXRlVGltZS5uZXdfZnJvbV9pc284NjAxKFxuICAgICAgbmV3IERhdGUoZGF0ZSkudG9JU09TdHJpbmcoKSxcbiAgICAgIG51bGwsXG4gICAgKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKG5vdGU6IElOb3RlKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnYgPSBub3RlLnY7XG4gICAgdGhpcy51dWlkID0gbm90ZS51dWlkO1xuICAgIHRoaXMuY29udGVudCA9IG5vdGUuY29udGVudDtcbiAgICB0aGlzLnRpdGxlID0gbm90ZS50aXRsZTtcbiAgICB0aGlzLnN0eWxlID0gbm90ZS5zdHlsZTtcbiAgICB0aGlzLnRhZ19saXN0ID0gR2lvLkxpc3RTdG9yZS5uZXcoVGFnLiRndHlwZSkgYXMgR2lvLkxpc3RTdG9yZTxUYWc+O1xuICAgIHRoaXMudGFncyA9IG5vdGUudGFncztcbiAgICB0aGlzLm1vZGlmaWVkID0gR0xpYi5EYXRlVGltZS5uZXdfZnJvbV9pc284NjAxKFxuICAgICAgbmV3IERhdGUobm90ZS5tb2RpZmllZCkudG9JU09TdHJpbmcoKSxcbiAgICAgIG51bGwsXG4gICAgKTtcbiAgICB0aGlzLndpZHRoID0gbm90ZS53aWR0aDtcbiAgICB0aGlzLmhlaWdodCA9IG5vdGUuaGVpZ2h0O1xuICAgIHRoaXMub3BlbiA9IG5vdGUub3BlbiA/PyBmYWxzZTtcblxuICAgIHRoaXMuYmluZF9wcm9wZXJ0eV9mdWxsKFxuICAgICAgXCJjb250ZW50XCIsXG4gICAgICB0aGlzLFxuICAgICAgXCJ0aXRsZVwiLFxuICAgICAgR09iamVjdC5CaW5kaW5nRmxhZ3MuU1lOQ19DUkVBVEUsXG4gICAgICAoXywgY29udGVudCkgPT4ge1xuICAgICAgICBpZiAoIWNvbnRlbnQpIHJldHVybiBbdHJ1ZSwgXCJcIl07XG4gICAgICAgIGxldCB0aXRsZSA9IGNvbnRlbnQuc3BsaXQoXCJcXG5cIilbMF0uc2xpY2UoMCwgMjApO1xuICAgICAgICBpZiAodGl0bGUubGVuZ3RoICE9IGNvbnRlbnQubGVuZ3RoKSB0aXRsZSArPSBcIlx1MjAyNlwiO1xuICAgICAgICByZXR1cm4gW3RydWUsIHRpdGxlXTtcbiAgICAgIH0sXG4gICAgICBudWxsXG4gICAgKTtcblxuXG4gIH1cblxuICBzdGF0aWMgZ2VuZXJhdGUoKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKHtcbiAgICAgIHY6IDEsXG4gICAgICB1dWlkOiBHTGliLnV1aWRfc3RyaW5nX3JhbmRvbSgpLFxuICAgICAgY29udGVudDogXCJcIixcbiAgICAgIHRpdGxlOiBcIlwiLFxuICAgICAgc3R5bGU6IFNFVFRJTkdTLkRFRkFVTFRfU1RZTEUsXG4gICAgICB0YWdzOiBbXSxcbiAgICAgIG1vZGlmaWVkOiBuZXcgRGF0ZSgpLFxuICAgICAgd2lkdGg6IDMwMCxcbiAgICAgIGhlaWdodDogMzAwLFxuICAgICAgb3BlbjogZmFsc2UsXG4gICAgfSk7XG4gIH1cblxuICBjb3B5KCkge1xuICAgIHJldHVybiBuZXcgTm90ZSh7XG4gICAgICB2OiB0aGlzLnYsXG4gICAgICB1dWlkOiB0aGlzLnV1aWQsXG4gICAgICBjb250ZW50OiB0aGlzLmNvbnRlbnQsXG4gICAgICB0aXRsZTogdGhpcy50aXRsZSxcbiAgICAgIHN0eWxlOiB0aGlzLnN0eWxlLFxuICAgICAgdGFnczogdGhpcy50YWdzLm1hcCgodGFnKSA9PiAoe1xuICAgICAgICBuYW1lOiB0YWcubmFtZSxcbiAgICAgICAgc3RhcnQ6IHRhZy5zdGFydCxcbiAgICAgICAgZW5kOiB0YWcuZW5kLFxuICAgICAgfSkpLFxuICAgICAgbW9kaWZpZWQ6IG5ldyBEYXRlKHRoaXMubW9kaWZpZWQudG9fdW5peCgpICogMTAwMCksXG4gICAgICB3aWR0aDogdGhpcy53aWR0aCxcbiAgICAgIGhlaWdodDogdGhpcy5oZWlnaHQsXG4gICAgICBvcGVuOiB0aGlzLm9wZW4sXG4gICAgfSk7XG4gIH1cblxuICB0b0pTT04oKTogSU5vdGUge1xuICAgIHJldHVybiB7XG4gICAgICB2OiB0aGlzLnYsXG4gICAgICB1dWlkOiB0aGlzLnV1aWQsXG4gICAgICBjb250ZW50OiB0aGlzLmNvbnRlbnQsXG4gICAgICB0aXRsZTogdGhpcy50aXRsZSxcbiAgICAgIHN0eWxlOiB0aGlzLnN0eWxlLFxuICAgICAgdGFnczogdGhpcy50YWdzLFxuICAgICAgbW9kaWZpZWQ6IHRoaXMubW9kaWZpZWRfZGF0ZSxcbiAgICAgIHdpZHRoOiB0aGlzLndpZHRoLFxuICAgICAgaGVpZ2h0OiB0aGlzLmhlaWdodCxcbiAgICAgIG9wZW46IHRoaXMub3BlbixcbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIHtcbiAgICBHT2JqZWN0LnJlZ2lzdGVyQ2xhc3Moe1xuICAgICAgR1R5cGVOYW1lOiBcIk5vdGVPYmplY3RcIixcbiAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgLy8gZGVuby1mbXQtaWdub3JlXG4gICAgICAgIHY6IEdPYmplY3QuUGFyYW1TcGVjLmludChcInZcIiwgXCJWZXJzaW9uXCIsIFwiVmVyc2lvbiBvZiB0aGUgbm90ZVwiLCBHT2JqZWN0LlBhcmFtRmxhZ3MuUkVBRFdSSVRFLCAwLCAxMDAsIDApLFxuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgdXVpZDogR09iamVjdC5QYXJhbVNwZWMuc3RyaW5nKFwidXVpZFwiLCBcIlVVSURcIiwgXCJVVUlEIG9mIHRoZSBub3RlXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIFwiXCIpLFxuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgY29udGVudDogR09iamVjdC5QYXJhbVNwZWMuc3RyaW5nKFwiY29udGVudFwiLCBcIkNvbnRlbnRcIiwgXCJDb250ZW50IG9mIHRoZSBub3RlXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIFwiXCIpLFxuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgdGl0bGU6IEdPYmplY3QuUGFyYW1TcGVjLnN0cmluZyhcInRpdGxlXCIsIFwiVGl0bGVcIiwgXCJUaXRsZSBvZiB0aGUgbm90ZVwiLCBHT2JqZWN0LlBhcmFtRmxhZ3MuUkVBRFdSSVRFLCBcIlwiKSxcbiAgICAgICAgLy8gZGVuby1mbXQtaWdub3JlXG4gICAgICAgIHN0eWxlOiBHT2JqZWN0LlBhcmFtU3BlYy5pbnQoXCJzdHlsZVwiLCBcIlN0eWxlXCIsIFwiU3R5bGUgb2YgdGhlIG5vdGVcIiwgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSwgMCwgMTAwLCAwKSxcbiAgICAgICAgLy8gZGVuby1mbXQtaWdub3JlXG4gICAgICAgIHRhZ19saXN0OiB0aGlzLnRhZ19saXN0X3BzcGVjLFxuICAgICAgICAvLyAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgbW9kaWZpZWQ6IEdPYmplY3QuUGFyYW1TcGVjLmJveGVkKFwibW9kaWZpZWRcIiwgXCJNb2RpZmllZFwiLCBcIkRhdGUgdGhlIG5vdGUgd2FzIG1vZGlmaWVkXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIEdMaWIuRGF0ZVRpbWUpLFxuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgd2lkdGg6IEdPYmplY3QuUGFyYW1TcGVjLmludChcIndpZHRoXCIsIFwiV2lkdGhcIiwgXCJXaWR0aCBvZiB0aGUgbm90ZVwiLCBHT2JqZWN0LlBhcmFtRmxhZ3MuUkVBRFdSSVRFLCAwLCAxMDAsIDApLFxuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgaGVpZ2h0OiBHT2JqZWN0LlBhcmFtU3BlYy5pbnQoXCJoZWlnaHRcIiwgXCJIZWlnaHRcIiwgXCJIZWlnaHQgb2YgdGhlIG5vdGVcIiwgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSwgMCwgMTAwLCAwKSxcbiAgICAgICAgLy8gZGVuby1mbXQtaWdub3JlXG4gICAgICAgIG9wZW46IEdPYmplY3QuUGFyYW1TcGVjLmJvb2xlYW4oXCJvcGVuXCIsIFwiT3BlblwiLCBcIldoZXRoZXIgdGhlIG5vdGUgd2FzIG9wZW4gd2hlbiB0aGUgYXBwbGljYXRpb24gd2FzIGNsb3NlZFwiLCBHT2JqZWN0LlBhcmFtRmxhZ3MuUkVBRFdSSVRFLCBmYWxzZSksXG4gICAgICB9LFxuICAgIH0sIHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBjb25maXJtX2RlbGV0ZSA9ICh3aW5kb3c6IEd0ay5XaW5kb3csIGNiOiAoKSA9PiB2b2lkKSA9PiB7XG4gIGlmIChTRVRUSU5HUy5DT05GSVJNX0RFTEVURSkge1xuICAgIGNvbnN0IGRpYWxvZyA9IEFkdy5NZXNzYWdlRGlhbG9nLm5ldyhcbiAgICAgIHdpbmRvdyxcbiAgICAgIF8oXCJEZWxldGUgTm90ZT9cIiksXG4gICAgICBfKFwiVGhpcyBhY3Rpb24gY2Fubm90IGJlIHVuZG9uZS4gSWYgeW91IHdhbnQgdG8gaGlkZSB0aGUgbm90ZSwgeW91IGNhbiBjbG9zZSBpdCBpbnN0ZWFkLlwiKSxcbiAgICApO1xuICAgIGRpYWxvZy5hZGRfcmVzcG9uc2UoXCJjYW5jZWxcIiwgXyhcIkNhbmNlbFwiKSk7XG4gICAgZGlhbG9nLmFkZF9yZXNwb25zZShcImRlbGV0ZVwiLCBfKFwiRGVsZXRlXCIpKTtcbiAgICBkaWFsb2cuc2V0X3Jlc3BvbnNlX2FwcGVhcmFuY2UoXG4gICAgICBcImRlbGV0ZVwiLFxuICAgICAgQWR3LlJlc3BvbnNlQXBwZWFyYW5jZS5ERVNUUlVDVElWRSxcbiAgICApO1xuICAgIGRpYWxvZy5zZXRfZGVmYXVsdF9yZXNwb25zZShcImNhbmNlbFwiKTtcbiAgICBkaWFsb2cuc2V0X2Nsb3NlX3Jlc3BvbnNlKFwiY2FuY2VsXCIpO1xuICAgIGRpYWxvZy5jb25uZWN0KFwicmVzcG9uc2VcIiwgKF9kaWFsb2csIHJlc3BvbnNlKSA9PiB7XG4gICAgICBpZiAocmVzcG9uc2UgPT09IFwiZGVsZXRlXCIpIHtcbiAgICAgICAgY2IoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBkaWFsb2cucHJlc2VudCgpO1xuICB9IGVsc2Uge1xuICAgIGNiKCk7XG4gIH1cbn07XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQUEsT0FBT0EsVUFBUztBQUNoQixPQUFPQyxXQUFVOzs7QUNNVixJQUFNLGNBQU4sTUFBa0I7QUFBQSxFQUl2QixZQUFZLE1BQXVCLFNBQWlCO0FBQ2xELFNBQUssVUFBVTtBQUNmLFNBQUssT0FBTztBQUFBLEVBQ2Q7QUFDRjs7O0FDVUEsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sU0FBUztB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QUFDO0FBQ2pDO0FBRU8sSUFBTSxhQUFhLENBQUMsUUFBa0I7QUFDM0MsUUFBTSxhQUFhLElBQUk7QUFBQSxJQUNyQjtBQUFBLElBQ0FBLEtBQUksbUJBQW1CO0FBQUEsSUFDdkI7QUFBQSxFQUNGO0FBRUEsUUFBTSxRQUFvQixDQUFDO0FBRTNCLE1BQUk7QUFFSixVQUFRLE9BQU8sV0FBVyxVQUFVLElBQUksT0FBTyxNQUFNO0FBQ25ELFVBQU0sT0FBTyxXQUFXLFVBQVUsSUFBSTtBQUN0QyxVQUFNLEtBQUssSUFBSTtBQUFBLEVBQ2pCO0FBRUEsU0FBTztBQUNUO0FBRU8sU0FBUyxXQUFXLE9BQWU7QUFDeEMsYUFBVyxXQUFXO0FBRXRCLFFBQU0sUUFBUSxXQUFXLFdBQVc7QUFFcEMsTUFBSSxTQUE2QixDQUFDO0FBQ2xDLFFBQU0sVUFBc0IsQ0FBQztBQUU3QixhQUFXLFFBQVEsT0FBTztBQUN4QixVQUFNLFdBQVcsS0FBSyxhQUFhO0FBRW5DLFFBQUksU0FBUyxTQUFTLE9BQU8sR0FBRztBQUM5QixZQUFNLE9BQU8sU0FBUyxNQUFNLEdBQUcsRUFBRTtBQUVqQyxVQUFJLEtBQUssV0FBVyxJQUFJO0FBQ3RCLGdCQUFRLEtBQUssSUFBSTtBQUNqQjtBQUFBLE1BQ0Y7QUFFQSxZQUFNLE9BQU8sTUFBTSxLQUFLLENBQUNHLFVBQVNBLE1BQUssU0FBUyxJQUFJO0FBQ3BELFVBQUksTUFBTTtBQUNSLGVBQU8sS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDO0FBQUEsTUFDMUIsT0FBTztBQUNMLGdCQUFRLEtBQUssSUFBSTtBQUFBLE1BQ25CO0FBQUEsSUFDRixPQUFPO0FBQUEsSUFFUDtBQUFBLEVBQ0Y7QUFFQSxhQUFXLFFBQVEsT0FBTztBQUN4QixRQUFJLENBQUMsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxTQUFTLEtBQUssSUFBSSxHQUFHO0FBQy9DLFlBQU0sT0FBTyxZQUFZLFVBQVUsR0FBRyxLQUFLLFdBQVc7QUFDdEQsYUFBTyxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUM7QUFBQSxJQUMxQjtBQUFBLEVBQ0Y7QUFFQSxhQUFXLFFBQVEsU0FBUztBQUMxQixTQUFLLE9BQU8sSUFBSTtBQUFBLEVBQ2xCO0FBRUEsU0FBTyxPQUFPLElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxNQUFNLFVBQVUsTUFBTSxJQUFJLENBQUM7QUFDM0Q7QUFFTyxTQUFTLFVBQVUsTUFBWTtBQUNwQyxRQUFNLE9BQU8sWUFBWSxVQUFVLEdBQUcsS0FBSyxXQUFXO0FBRXRELFNBQU8sVUFBVSxNQUFNLElBQUk7QUFDN0I7QUFFTyxTQUFTLFlBQVksTUFBYztBQUN4QyxRQUFNLE9BQU8sWUFBWSxVQUFVLEdBQUcsV0FBVztBQUVqRCxNQUFJO0FBQ0YsV0FBTyxLQUFLLE9BQU8sSUFBSTtBQUFBLEVBQ3pCLFFBQUU7QUFBQSxFQUFPO0FBQ1g7IiwKICAibmFtZXMiOiBbIkdpbyIsICJHTGliIiwgIlN0eWxlIiwgIl8iLCAiR2lvIiwgIkdMaWIiLCAiXyIsICJub3RlIl0KfQo=
