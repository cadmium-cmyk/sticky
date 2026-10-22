import GObject from "gi://GObject";
import Gtk from "gi://Gtk?version=4.0";
import Adw from "gi://Adw";
import Gio from "gi://Gio";
import { settings, SETTINGS } from "./util.js";

export class PreferencesWindow extends Adw.PreferencesWindow {
  static {
    GObject.registerClass(
      {
        GTypeName: "PreferencesWindow",
        Template: "resource:///com/vixalien/sticky/ui/preferences.ui",
        InternalChildren: ["notes_path_row", "notes_path_button"],
      },
      this,
    );
  }

  declare _notes_path_row: Adw.ActionRow;
  declare _notes_path_button: Gtk.Button;

  constructor(params = {}) {
    super(params);

    this.update_notes_path_subtitle();

    this._notes_path_button.connect("clicked", () => {
      const dialog = new Gtk.FileDialog({
        title: _("Select Notes Directory"),
      });

      dialog.select_folder(this, null, (d, res) => {
        try {
          if (!d) return;
          const file = d.select_folder_finish(res);
          if (file) {
            settings.set_string("notes-path", file.get_path() || "");
            this.update_notes_path_subtitle();
          }
        } catch (e) {
          console.error(e as any);
        }
      });
    });
  }

  update_notes_path_subtitle() {
    const path = settings.get_string("notes-path");
    if (path) {
      this._notes_path_row.set_subtitle(path);
    } else {
      this._notes_path_row.set_subtitle(_("Default"));
    }
  }
}
