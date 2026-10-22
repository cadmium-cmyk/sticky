// src/themeselector.ts
import GObject from "gi://GObject";
import Gtk from "gi://Gtk?version=4.0";
import Adw from "gi://Adw";
import Gdk from "gi://Gdk?version=4.0";
var _ThemeSelector = class extends Gtk.Widget {
  constructor(params = {}) {
    super(params);
    this.style_manager = Adw.StyleManager.get_default();
    this.style_manager.connect(
      "notify::system-supports-color-schemes",
      this._on_notify_system_supports_color_schemes.bind(this)
    );
    this._on_notify_system_supports_color_schemes();
    const dark = this.style_manager.get_dark();
    this.theme = dark ? "dark" : "light";
    this.style_manager.connect("notify::dark", this._on_notify_dark.bind(this));
    this._on_notify_dark();
    const provider = new Gtk.CssProvider();
    provider.load_from_resource("/com/vixalien/sticky/theme-selector.css");
    Gtk.StyleContext.add_provider_for_display(
      Gdk.Display.get_default(),
      provider,
      Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
    );
  }
  _on_notify_system_supports_color_schemes() {
    this._follow.set_visible(
      this.style_manager.get_system_supports_color_schemes()
    );
  }
  _on_notify_dark() {
    if (this.style_manager.get_dark())
      this.add_css_class("dark");
    else
      this.remove_css_class("dark");
  }
};
var ThemeSelector = _ThemeSelector;
(() => {
  GObject.registerClass(
    {
      GTypeName: "ThemeSelector",
      Template: "resource:///com/vixalien/sticky/ui/theme-selector.ui",
      CssName: "themeselector",
      InternalChildren: ["follow"],
      Properties: {
        theme: GObject.ParamSpec.string(
          "theme",
          // Name
          "Theme",
          // Nick
          "Theme",
          // Blurb
          GObject.ParamFlags.READWRITE,
          /// @ts-expect-error
          null
          // Default value
        )
      }
    },
    _ThemeSelector
  );
  _ThemeSelector.set_layout_manager_type(Gtk.BinLayout.$gtype);
})();
export {
  ThemeSelector
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL3RoZW1lc2VsZWN0b3IudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCBHT2JqZWN0IGZyb20gXCJnaTovL0dPYmplY3RcIjtcbmltcG9ydCBHdGsgZnJvbSBcImdpOi8vR3RrP3ZlcnNpb249NC4wXCI7XG5pbXBvcnQgQWR3IGZyb20gXCJnaTovL0Fkd1wiO1xuaW1wb3J0IEdkayBmcm9tIFwiZ2k6Ly9HZGs/dmVyc2lvbj00LjBcIjtcblxuZXhwb3J0IGNsYXNzIFRoZW1lU2VsZWN0b3IgZXh0ZW5kcyBHdGsuV2lkZ2V0IHtcbiAgc3RhdGljIHtcbiAgICBHT2JqZWN0LnJlZ2lzdGVyQ2xhc3MoXG4gICAgICB7XG4gICAgICAgIEdUeXBlTmFtZTogXCJUaGVtZVNlbGVjdG9yXCIsXG4gICAgICAgIFRlbXBsYXRlOiBcInJlc291cmNlOi8vL2NvbS92aXhhbGllbi9zdGlja3kvdWkvdGhlbWUtc2VsZWN0b3IudWlcIixcbiAgICAgICAgQ3NzTmFtZTogXCJ0aGVtZXNlbGVjdG9yXCIsXG4gICAgICAgIEludGVybmFsQ2hpbGRyZW46IFtcImZvbGxvd1wiXSxcbiAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgIHRoZW1lOiBHT2JqZWN0LlBhcmFtU3BlYy5zdHJpbmcoXG4gICAgICAgICAgICBcInRoZW1lXCIsIC8vIE5hbWVcbiAgICAgICAgICAgIFwiVGhlbWVcIiwgLy8gTmlja1xuICAgICAgICAgICAgXCJUaGVtZVwiLCAvLyBCbHVyYlxuICAgICAgICAgICAgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSxcbiAgICAgICAgICAgIC8vLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgICAgICAgICBudWxsLCAvLyBEZWZhdWx0IHZhbHVlXG4gICAgICAgICAgKSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICB0aGlzLFxuICAgICk7XG5cbiAgICB0aGlzLnNldF9sYXlvdXRfbWFuYWdlcl90eXBlKEd0ay5CaW5MYXlvdXQuJGd0eXBlKTtcbiAgfVxuXG4gIHRoZW1lOiBzdHJpbmc7XG5cbiAgZGVjbGFyZSBfZm9sbG93OiBHdGsuQ2hlY2tCdXR0b247XG5cbiAgc3R5bGVfbWFuYWdlcjogQWR3LlN0eWxlTWFuYWdlcjtcblxuICBjb25zdHJ1Y3RvcihwYXJhbXMgPSB7fSkge1xuICAgIHN1cGVyKHBhcmFtcyk7XG5cbiAgICB0aGlzLnN0eWxlX21hbmFnZXIgPSBBZHcuU3R5bGVNYW5hZ2VyLmdldF9kZWZhdWx0KCk7XG5cbiAgICB0aGlzLnN0eWxlX21hbmFnZXIuY29ubmVjdChcbiAgICAgIFwibm90aWZ5OjpzeXN0ZW0tc3VwcG9ydHMtY29sb3Itc2NoZW1lc1wiLFxuICAgICAgdGhpcy5fb25fbm90aWZ5X3N5c3RlbV9zdXBwb3J0c19jb2xvcl9zY2hlbWVzLmJpbmQodGhpcyksXG4gICAgKTtcbiAgICB0aGlzLl9vbl9ub3RpZnlfc3lzdGVtX3N1cHBvcnRzX2NvbG9yX3NjaGVtZXMoKTtcblxuICAgIGNvbnN0IGRhcmsgPSB0aGlzLnN0eWxlX21hbmFnZXIuZ2V0X2RhcmsoKTtcbiAgICB0aGlzLnRoZW1lID0gZGFyayA/IFwiZGFya1wiIDogXCJsaWdodFwiO1xuXG4gICAgdGhpcy5zdHlsZV9tYW5hZ2VyLmNvbm5lY3QoXCJub3RpZnk6OmRhcmtcIiwgdGhpcy5fb25fbm90aWZ5X2RhcmsuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fb25fbm90aWZ5X2RhcmsoKTtcblxuICAgIGNvbnN0IHByb3ZpZGVyID0gbmV3IEd0ay5Dc3NQcm92aWRlcigpO1xuICAgIHByb3ZpZGVyLmxvYWRfZnJvbV9yZXNvdXJjZShcIi9jb20vdml4YWxpZW4vc3RpY2t5L3RoZW1lLXNlbGVjdG9yLmNzc1wiKTtcbiAgICBHdGsuU3R5bGVDb250ZXh0LmFkZF9wcm92aWRlcl9mb3JfZGlzcGxheShcbiAgICAgIEdkay5EaXNwbGF5LmdldF9kZWZhdWx0KCkhLFxuICAgICAgcHJvdmlkZXIsXG4gICAgICBHdGsuU1RZTEVfUFJPVklERVJfUFJJT1JJVFlfQVBQTElDQVRJT04sXG4gICAgKTtcbiAgfVxuXG4gIF9vbl9ub3RpZnlfc3lzdGVtX3N1cHBvcnRzX2NvbG9yX3NjaGVtZXMoKSB7XG4gICAgdGhpcy5fZm9sbG93LnNldF92aXNpYmxlKFxuICAgICAgdGhpcy5zdHlsZV9tYW5hZ2VyLmdldF9zeXN0ZW1fc3VwcG9ydHNfY29sb3Jfc2NoZW1lcygpLFxuICAgICk7XG4gIH1cblxuICBfb25fbm90aWZ5X2RhcmsoKSB7XG4gICAgaWYgKHRoaXMuc3R5bGVfbWFuYWdlci5nZXRfZGFyaygpKSB0aGlzLmFkZF9jc3NfY2xhc3MoXCJkYXJrXCIpO1xuICAgIGVsc2UgdGhpcy5yZW1vdmVfY3NzX2NsYXNzKFwiZGFya1wiKTtcbiAgfVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFBLE9BQU8sYUFBYTtBQUNwQixPQUFPLFNBQVM7QUFDaEIsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sU0FBUztBQUVULElBQU0saUJBQU4sY0FBNEIsSUFBSSxPQUFPO0FBQUEsRUErQjVDLFlBQVksU0FBUyxDQUFDLEdBQUc7QUFDdkIsVUFBTSxNQUFNO0FBRVosU0FBSyxnQkFBZ0IsSUFBSSxhQUFhLFlBQVk7QUFFbEQsU0FBSyxjQUFjO0FBQUEsTUFDakI7QUFBQSxNQUNBLEtBQUsseUNBQXlDLEtBQUssSUFBSTtBQUFBLElBQ3pEO0FBQ0EsU0FBSyx5Q0FBeUM7QUFFOUMsVUFBTSxPQUFPLEtBQUssY0FBYyxTQUFTO0FBQ3pDLFNBQUssUUFBUSxPQUFPLFNBQVM7QUFFN0IsU0FBSyxjQUFjLFFBQVEsZ0JBQWdCLEtBQUssZ0JBQWdCLEtBQUssSUFBSSxDQUFDO0FBQzFFLFNBQUssZ0JBQWdCO0FBRXJCLFVBQU0sV0FBVyxJQUFJLElBQUksWUFBWTtBQUNyQyxhQUFTLG1CQUFtQix5Q0FBeUM7QUFDckUsUUFBSSxhQUFhO0FBQUEsTUFDZixJQUFJLFFBQVEsWUFBWTtBQUFBLE1BQ3hCO0FBQUEsTUFDQSxJQUFJO0FBQUEsSUFDTjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLDJDQUEyQztBQUN6QyxTQUFLLFFBQVE7QUFBQSxNQUNYLEtBQUssY0FBYyxrQ0FBa0M7QUFBQSxJQUN2RDtBQUFBLEVBQ0Y7QUFBQSxFQUVBLGtCQUFrQjtBQUNoQixRQUFJLEtBQUssY0FBYyxTQUFTO0FBQUcsV0FBSyxjQUFjLE1BQU07QUFBQTtBQUN2RCxXQUFLLGlCQUFpQixNQUFNO0FBQUEsRUFDbkM7QUFDRjtBQW5FTyxJQUFNLGdCQUFOO0FBQUEsQ0FDTCxNQUFPO0FBQ0wsVUFBUTtBQUFBLElBQ047QUFBQSxNQUNFLFdBQVc7QUFBQSxNQUNYLFVBQVU7QUFBQSxNQUNWLFNBQVM7QUFBQSxNQUNULGtCQUFrQixDQUFDLFFBQVE7QUFBQSxNQUMzQixZQUFZO0FBQUEsUUFDVixPQUFPLFFBQVEsVUFBVTtBQUFBLFVBQ3ZCO0FBQUE7QUFBQSxVQUNBO0FBQUE7QUFBQSxVQUNBO0FBQUE7QUFBQSxVQUNBLFFBQVEsV0FBVztBQUFBO0FBQUEsVUFFbkI7QUFBQTtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBRUEsaUJBQUssd0JBQXdCLElBQUksVUFBVSxNQUFNO0FBQ25EOyIsCiAgIm5hbWVzIjogW10KfQo=
