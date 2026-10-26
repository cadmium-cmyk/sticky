// src/application.ts
import GObject8 from "gi://GObject";
import Gio5 from "gi://Gio";
import Adw6 from "gi://Adw";
import GLib6 from "gi://GLib";
import Gtk6 from "gi://Gtk?version=4.0";
import Gdk3 from "gi://Gdk?version=4.0";

// src/notes.ts
import GObject5 from "gi://GObject";
import Gtk4 from "gi://Gtk?version=4.0";
import Adw4 from "gi://Adw";

// src/card.ts
import GObject3 from "gi://GObject";
import Gtk2 from "gi://Gtk?version=4.0";
import GLib2 from "gi://GLib";

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
var confirm_delete = (window, cb) => {
  if (SETTINGS.CONFIRM_DELETE) {
    const dialog = Adw.MessageDialog.new(
      window,
      _("Delete Note?"),
      _("This action cannot be undone. If you want to hide the note, you can close it instead.")
    );
    dialog.add_response("cancel", _("Cancel"));
    dialog.add_response("delete", _("Delete"));
    dialog.set_response_appearance(
      "delete",
      Adw.ResponseAppearance.DESTRUCTIVE
    );
    dialog.set_default_response("cancel");
    dialog.set_close_response("cancel");
    dialog.connect("response", (_dialog, response) => {
      if (response === "delete") {
        cb();
      }
    });
    dialog.present();
  } else {
    cb();
  }
};

// src/view.ts
import GObject2 from "gi://GObject";
import Gtk from "gi://Gtk?version=4.0";
import Pango from "gi://Pango";
import Adw2 from "gi://Adw?version=1";

// node_modules/linkifyjs/dist/linkify.es.js
var encodedTlds = "aaa1rp3barth4b0ott3vie4c1le2ogado5udhabi7c0ademy5centure6ountant0s9o1tor4d0s1ult4e0g1ro2tna4f0l1rica5g0akhan5ency5i0g1rbus3force5tel5kdn3l0faromeo7ibaba4pay4lfinanz6state5y2sace3tom5m0azon4ericanexpress7family11x2fam3ica3sterdam8nalytics7droid5quan4z2o0l2partments8p0le4q0uarelle8r0ab1mco4chi3my2pa2t0e3s0da2ia2sociates9t0hleta5torney7u0ction5di0ble3o3spost5thor3o0s4vianca6w0s2x0a2z0ure5ba0by2idu3namex3narepublic11d1k2r0celona5laycard4s5efoot5gains6seball5ketball8uhaus5yern5b0c1t1va3cg1n2d1e0ats2uty4er2ntley5rlin4st0buy5t2f1g1h0arti5i0ble3d1ke2ng0o3o1z2j1lack0friday9ockbuster8g1omberg7ue3m0s1w2n0pparibas9o0ats3ehringer8fa2m1nd2o0k0ing5sch2tik2on4t1utique6x2r0adesco6idgestone9oadway5ker3ther5ussels7s1t1uild0ers6siness6y1zz3v1w1y1z0h3ca0b1fe2l0l1vinklein9m0era3p2non3petown5ital0one8r0avan4ds2e0er0s4s2sa1e1h1ino4t0ering5holic7ba1n1re2s2c1d1enter4o1rn3f0a1d2g1h0anel2nel4rity4se2t2eap3intai5ristmas6ome4urch5i0priani6rcle4sco3tadel4i0c2y0eats7k1l0aims4eaning6ick2nic1que6othing5ud3ub0med6m1n1o0ach3des3ffee4llege4ogne5m0cast4mbank4unity6pany2re3uter5sec4ndos3struction8ulting7tact3ractors9oking0channel11l1p2rsica5untry4pon0s4rses6pa2r0edit0card4union9icket5own3s1uise0s6u0isinella9v1w1x1y0mru3ou3z2dabur3d1nce3ta1e1ing3sun4y2clk3ds2e0al0er2s3gree4livery5l1oitte5ta3mocrat6ntal2ist5si0gn4v2hl2iamonds6et2gital5rect0ory7scount3ver5h2y2j1k1m1np2o0cs1tor4g1mains5t1wnload7rive4tv2ubai3nlop4pont4rban5vag2r2z2earth3t2c0o2deka3u0cation8e1g1mail3erck5nergy4gineer0ing9terprises10pson4quipment8r0icsson6ni3s0q1tate5t0isalat7u0rovision8s2vents5xchange6pert3osed4ress5traspace10fage2il1rwinds6th3mily4n0s2rm0ers5shion4t3edex3edback6rrari3ero6i0at2delity5o2lm2nal1nce1ial7re0stone6mdale6sh0ing5t0ness6j1k1lickr3ghts4r2orist4wers5y2m1o0o0d0network8tball6rd1ex2sale4um3undation8x2r0ee1senius7l1ogans4ntdoor4ier7tr2ujitsu5n0d2rniture7tbol5yi3ga0l0lery3o1up4me0s3p1rden4y2b0iz3d0n2e0a1nt0ing5orge5f1g0ee3h1i0ft0s3ves2ing5l0ass3e1obal2o4m0ail3bh2o1x2n1odaddy5ld0point6f2o0dyear5g0le4p1t1v2p1q1r0ainger5phics5tis4een3ipe3ocery4up4s1t1u0ardian6cci3ge2ide2tars5ru3w1y2hair2mburg5ngout5us3bo2dfc0bank7ealth0care8lp1sinki6re1mes5gtv3iphop4samitsu7tachi5v2k0t2m1n1ockey4ldings5iday5medepot5goods5s0ense7nda3rse3spital5t0ing5t0eles2s3mail5use3w2r1sbc3t1u0ghes5yatt3undai7ibm2cbc2e1u2d1e0ee3fm2kano4l1m0amat4db2mo0bilien9n0c1dustries8finiti5o2g1k1stitute6urance4e4t0ernational10uit4vestments10o1piranga7q1r0ish4s0maili5t0anbul7t0au2v3jaguar4va3cb2e0ep2tzt3welry6io2ll2m0p2nj2o0bs1urg4t1y2p0morgan6rs3uegos4niper7kaufen5ddi3e0rryhotels6logistics9properties14fh2g1h1i0a1ds2m1nder2le4tchen5wi3m1n1oeln3matsu5sher5p0mg2n2r0d1ed3uokgroup8w1y0oto4z2la0caixa5mborghini8er3ncaster5ia3d0rover6xess5salle5t0ino3robe5w0yer5b1c1ds2ease3clerc5frak4gal2o2xus4gbt3i0dl2fe0insurance9style7ghting6ke2lly3mited4o2ncoln4de2k2psy3ve1ing5k1lc1p2oan0s3cker3us3l1ndon4tte1o3ve3pl0financial11r1s1t0d0a3u0ndbeck6xe1ury5v1y2ma0cys3drid4if1son4keup4n0agement7go3p1rket0ing3s4riott5shalls7serati6ttel5ba2c0kinsey7d1e0d0ia3et2lbourne7me1orial6n0u2rckmsd7g1h1iami3crosoft7l1ni1t2t0subishi9k1l0b1s2m0a2n1o0bi0le4da2e1i1m1nash3ey2ster5rmon3tgage6scow4to0rcycles9v0ie4p1q1r1s0d2t0n1r2u0seum3ic3tual5v1w1x1y1z2na0b1goya4me2tura4vy3ba2c1e0c1t0bank4flix4work5ustar5w0s2xt0direct7us4f0l2g0o2hk2i0co2ke1on3nja3ssan1y5l1o0kia3rthwesternmutual14on4w0ruz3tv4p1r0a1w2tt2u1yc2z2obi1server7ffice5kinawa6layan0group9dnavy5lo3m0ega4ne1g1l0ine5oo2pen3racle3nge4g0anic5igins6saka4tsuka4t2vh3pa0ge2nasonic7ris2s1tners4s1y3ssagens7y2ccw3e0t2f0izer5g1h0armacy6d1ilips5one2to0graphy6s4ysio5ics1tet2ures6d1n0g1k2oneer5zza4k1l0ace2y0station9umbing5s3m1n0c2ohl2ker3litie5rn2st3r0america6xi3ess3ime3o0d0uctions8f1gressive8mo2perties3y5tection8u0dential9s1t1ub2w0c2y2qa1pon3uebec3st5racing4dio4e0ad1lestate6tor2y4cipes5d0stone5umbrella9hab3ise0n3t2liance6n0t0als5pair3ort3ublican8st0aurant8view0s5xroth6ich0ardli6oh3l1o1p2o0cher3ks3deo3gers4om3s0vp3u0gby3hr2n2w0e2yukyu6sa0arland6fe0ty4kura4le1on3msclub4ung5ndvik0coromant12ofi4p1rl2s1ve2xo3b0i1s2c0a1b1haeffler7midt4olarships8ol3ule3warz5ience5ot3d1e0arch3t2cure1ity6ek2lect4ner3rvices6ven3w1x0y3fr2g1h0angrila6rp2w2ell3ia1ksha5oes2p0ping5uji3w0time7i0lk2na1gles5te3j1k0i0n2y0pe4l0ing4m0art3ile4n0cf3o0ccer3ial4ftbank4ware6hu2lar2utions7ng1y2y2pa0ce3ort2t3r0l2s1t0ada2ples4r1tebank4farm7c0group6ockholm6rage3e3ream4udio2y3yle4u0cks3pplies3y2ort5rf1gery5zuki5v1watch4iss4x1y0dney4stems6z2tab1ipei4lk2obao4rget4tamotors6r2too4x0i3c0i2d0k2eam2ch0nology8l1masek5nnis4va3f1g1h0d1eater2re6iaa2ckets5enda4ffany5ps2res2ol4j0maxx4x2k0maxx5l1m0all4n1o0day3kyo3ols3p1ray3shiba5tal3urs3wn2yota3s3r0ade1ing4ining5vel0channel7ers0insurance16ust3v2t1ube2i1nes3shu4v0s2w1z2ua1bank3s2g1k1nicom3versity8o2ol2ps2s1y1z2va0cations7na1guard7c1e0gas3ntures6risign5m\xF6gensberater2ung14sicherung10t2g1i0ajes4deo3g1king4llas4n1p1rgin4sa1ion4va1o3laanderen9n1odka3lkswagen7vo3te1ing3o2yage5u0elos6wales2mart4ter4ng0gou5tch0es6eather0channel12bcam3er2site5d0ding5ibo2r3f1hoswho6ien2ki2lliamhill9n0dows4e1ners6me2olterskluwer11odside6rk0s2ld3w2s1tc1f3xbox3erox4finity6ihuan4n2xx2yz3yachts4hoo3maxun5ndex5e1odobashi7ga2kohama6u0tube6t1un3za0ppos4ra3ero3ip2m1one3uerich6w2";
var encodedUtlds = "\u03B5\u03BB1\u03C52\u0431\u04331\u0435\u043B3\u0434\u0435\u0442\u04384\u0435\u044E2\u043A\u0430\u0442\u043E\u043B\u0438\u043A6\u043E\u043C3\u043C\u043A\u04342\u043E\u043D1\u0441\u043A\u0432\u04306\u043E\u043D\u043B\u0430\u0439\u043D5\u0440\u04333\u0440\u0443\u04412\u04442\u0441\u0430\u0439\u04423\u0440\u04313\u0443\u043A\u04403\u049B\u0430\u04373\u0570\u0561\u05753\u05D9\u05E9\u05E8\u05D0\u05DC5\u05E7\u05D5\u05DD3\u0627\u0628\u0648\u0638\u0628\u064A5\u062A\u0635\u0627\u0644\u0627\u062A6\u0631\u0627\u0645\u0643\u06485\u0644\u0627\u0631\u062F\u06464\u0628\u062D\u0631\u064A\u06465\u062C\u0632\u0627\u0626\u06315\u0633\u0639\u0648\u062F\u064A\u06296\u0639\u0644\u064A\u0627\u06465\u0645\u063A\u0631\u06285\u0645\u0627\u0631\u0627\u062A5\u06CC\u0631\u0627\u06465\u0628\u0627\u0631\u062A2\u0632\u0627\u06314\u064A\u062A\u06433\u06BE\u0627\u0631\u062A5\u062A\u0648\u0646\u06334\u0633\u0648\u062F\u0627\u06463\u0631\u064A\u06295\u0634\u0628\u0643\u06294\u0639\u0631\u0627\u06422\u06282\u0645\u0627\u06464\u0641\u0644\u0633\u0637\u064A\u06466\u0642\u0637\u06313\u0643\u0627\u062B\u0648\u0644\u064A\u06436\u0648\u06453\u0645\u0635\u06312\u0644\u064A\u0633\u064A\u06275\u0648\u0631\u064A\u062A\u0627\u0646\u064A\u06277\u0642\u06394\u0647\u0645\u0631\u0627\u06475\u067E\u0627\u06A9\u0633\u062A\u0627\u06467\u0680\u0627\u0631\u062A4\u0915\u0949\u092E3\u0928\u0947\u091F3\u092D\u093E\u0930\u09240\u092E\u094D3\u094B\u09245\u0938\u0902\u0917\u0920\u09285\u09AC\u09BE\u0982\u09B2\u09BE5\u09AD\u09BE\u09B0\u09A42\u09F0\u09A44\u0A2D\u0A3E\u0A30\u0A244\u0AAD\u0ABE\u0AB0\u0AA44\u0B2D\u0B3E\u0B30\u0B244\u0B87\u0BA8\u0BCD\u0BA4\u0BBF\u0BAF\u0BBE6\u0BB2\u0B99\u0BCD\u0B95\u0BC86\u0B9A\u0BBF\u0B99\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0BC2\u0BB0\u0BCD11\u0C2D\u0C3E\u0C30\u0C24\u0C4D5\u0CAD\u0CBE\u0CB0\u0CA44\u0D2D\u0D3E\u0D30\u0D24\u0D025\u0DBD\u0D82\u0D9A\u0DCF4\u0E04\u0E2D\u0E213\u0E44\u0E17\u0E223\u0EA5\u0EB2\u0EA73\u10D2\u10D42\u307F\u3093\u306A3\u30A2\u30DE\u30BE\u30F34\u30AF\u30E9\u30A6\u30C94\u30B0\u30FC\u30B0\u30EB4\u30B3\u30E02\u30B9\u30C8\u30A23\u30BB\u30FC\u30EB3\u30D5\u30A1\u30C3\u30B7\u30E7\u30F36\u30DD\u30A4\u30F3\u30C84\u4E16\u754C2\u4E2D\u4FE11\u56FD1\u570B1\u6587\u7F513\u4E9A\u9A6C\u900A3\u4F01\u4E1A2\u4F5B\u5C712\u4FE1\u606F2\u5065\u5EB72\u516B\u53662\u516C\u53F81\u76CA2\u53F0\u6E7E1\u70632\u5546\u57CE1\u5E971\u68072\u5609\u91CC0\u5927\u9152\u5E975\u5728\u7EBF2\u5927\u62FF2\u5929\u4E3B\u65593\u5A31\u4E502\u5BB6\u96FB2\u5E7F\u4E1C2\u5FAE\u535A2\u6148\u55842\u6211\u7231\u4F603\u624B\u673A2\u62DB\u80582\u653F\u52A11\u5E9C2\u65B0\u52A0\u57612\u95FB2\u65F6\u5C1A2\u66F8\u7C4D2\u673A\u67842\u6DE1\u9A6C\u95213\u6E38\u620F2\u6FB3\u95802\u70B9\u770B2\u79FB\u52A82\u7EC4\u7EC7\u673A\u67844\u7F51\u57401\u5E971\u7AD91\u7EDC2\u8054\u901A2\u8C37\u6B4C2\u8D2D\u72692\u901A\u8CA92\u96C6\u56E22\u96FB\u8A0A\u76C8\u79D14\u98DE\u5229\u6D663\u98DF\u54C12\u9910\u53852\u9999\u683C\u91CC\u62C93\u6E2F2\uB2F7\uB1371\uCEF42\uC0BC\uC1312\uD55C\uAD6D2";
var assign = (target, properties) => {
  for (const key in properties) {
    target[key] = properties[key];
  }
  return target;
};
var numeric = "numeric";
var ascii = "ascii";
var alpha = "alpha";
var asciinumeric = "asciinumeric";
var alphanumeric = "alphanumeric";
var domain = "domain";
var emoji = "emoji";
var scheme = "scheme";
var slashscheme = "slashscheme";
var whitespace = "whitespace";
function registerGroup(name, groups) {
  if (!(name in groups)) {
    groups[name] = [];
  }
  return groups[name];
}
function addToGroups(t, flags, groups) {
  if (flags[numeric]) {
    flags[asciinumeric] = true;
    flags[alphanumeric] = true;
  }
  if (flags[ascii]) {
    flags[asciinumeric] = true;
    flags[alpha] = true;
  }
  if (flags[asciinumeric]) {
    flags[alphanumeric] = true;
  }
  if (flags[alpha]) {
    flags[alphanumeric] = true;
  }
  if (flags[alphanumeric]) {
    flags[domain] = true;
  }
  if (flags[emoji]) {
    flags[domain] = true;
  }
  for (const k in flags) {
    const group = registerGroup(k, groups);
    if (group.indexOf(t) < 0) {
      group.push(t);
    }
  }
}
function flagsForToken(t, groups) {
  const result = {};
  for (const c in groups) {
    if (groups[c].indexOf(t) >= 0) {
      result[c] = true;
    }
  }
  return result;
}
function State(token) {
  if (token === void 0) {
    token = null;
  }
  this.j = {};
  this.jr = [];
  this.jd = null;
  this.t = token;
}
State.groups = {};
State.prototype = {
  accepts() {
    return !!this.t;
  },
  /**
   * Follow an existing transition from the given input to the next state.
   * Does not mutate.
   * @param {string} input character or token type to transition on
   * @returns {?State<T>} the next state, if any
   */
  go(input) {
    const state = this;
    const nextState = state.j[input];
    if (nextState) {
      return nextState;
    }
    for (let i = 0; i < state.jr.length; i++) {
      const regex = state.jr[i][0];
      const nextState2 = state.jr[i][1];
      if (nextState2 && regex.test(input)) {
        return nextState2;
      }
    }
    return state.jd;
  },
  /**
   * Whether the state has a transition for the given input. Set the second
   * argument to true to only look for an exact match (and not a default or
   * regular-expression-based transition)
   * @param {string} input
   * @param {boolean} exactOnly
   */
  has(input, exactOnly) {
    if (exactOnly === void 0) {
      exactOnly = false;
    }
    return exactOnly ? input in this.j : !!this.go(input);
  },
  /**
   * Short for "transition all"; create a transition from the array of items
   * in the given list to the same final resulting state.
   * @param {string | string[]} inputs Group of inputs to transition on
   * @param {Transition<T> | State<T>} [next] Transition options
   * @param {Flags} [flags] Collections flags to add token to
   * @param {Collections<T>} [groups] Master list of token groups
   */
  ta(inputs, next, flags, groups) {
    for (let i = 0; i < inputs.length; i++) {
      this.tt(inputs[i], next, flags, groups);
    }
  },
  /**
   * Short for "take regexp transition"; defines a transition for this state
   * when it encounters a token which matches the given regular expression
   * @param {RegExp} regexp Regular expression transition (populate first)
   * @param {T | State<T>} [next] Transition options
   * @param {Flags} [flags] Collections flags to add token to
   * @param {Collections<T>} [groups] Master list of token groups
   * @returns {State<T>} taken after the given input
   */
  tr(regexp, next, flags, groups) {
    groups = groups || State.groups;
    let nextState;
    if (next && next.j) {
      nextState = next;
    } else {
      nextState = new State(next);
      if (flags && groups) {
        addToGroups(next, flags, groups);
      }
    }
    this.jr.push([regexp, nextState]);
    return nextState;
  },
  /**
   * Short for "take transitions", will take as many sequential transitions as
   * the length of the given input and returns the
   * resulting final state.
   * @param {string | string[]} input
   * @param {T | State<T>} [next] Transition options
   * @param {Flags} [flags] Collections flags to add token to
   * @param {Collections<T>} [groups] Master list of token groups
   * @returns {State<T>} taken after the given input
   */
  ts(input, next, flags, groups) {
    let state = this;
    const len = input.length;
    if (!len) {
      return state;
    }
    for (let i = 0; i < len - 1; i++) {
      state = state.tt(input[i]);
    }
    return state.tt(input[len - 1], next, flags, groups);
  },
  /**
   * Short for "take transition", this is a method for building/working with
   * state machines.
   *
   * If a state already exists for the given input, returns it.
   *
   * If a token is specified, that state will emit that token when reached by
   * the linkify engine.
   *
   * If no state exists, it will be initialized with some default transitions
   * that resemble existing default transitions.
   *
   * If a state is given for the second argument, that state will be
   * transitioned to on the given input regardless of what that input
   * previously did.
   *
   * Specify a token group flags to define groups that this token belongs to.
   * The token will be added to corresponding entires in the given groups
   * object.
   *
   * @param {string} input character, token type to transition on
   * @param {T | State<T>} [next] Transition options
   * @param {Flags} [flags] Collections flags to add token to
   * @param {Collections<T>} [groups] Master list of groups
   * @returns {State<T>} taken after the given input
   */
  tt(input, next, flags, groups) {
    groups = groups || State.groups;
    const state = this;
    if (next && next.j) {
      state.j[input] = next;
      return next;
    }
    const t = next;
    let nextState, templateState = state.go(input);
    if (templateState) {
      nextState = new State();
      assign(nextState.j, templateState.j);
      nextState.jr.push.apply(nextState.jr, templateState.jr);
      nextState.jd = templateState.jd;
      nextState.t = templateState.t;
    } else {
      nextState = new State();
    }
    if (t) {
      if (groups) {
        if (nextState.t && typeof nextState.t === "string") {
          const allFlags = assign(flagsForToken(nextState.t, groups), flags);
          addToGroups(t, allFlags, groups);
        } else if (flags) {
          addToGroups(t, flags, groups);
        }
      }
      nextState.t = t;
    }
    state.j[input] = nextState;
    return nextState;
  }
};
var ta = (state, input, next, flags, groups) => state.ta(input, next, flags, groups);
var tr = (state, regexp, next, flags, groups) => state.tr(regexp, next, flags, groups);
var ts = (state, input, next, flags, groups) => state.ts(input, next, flags, groups);
var tt = (state, input, next, flags, groups) => state.tt(input, next, flags, groups);
var WORD = "WORD";
var UWORD = "UWORD";
var LOCALHOST = "LOCALHOST";
var TLD = "TLD";
var UTLD = "UTLD";
var SCHEME = "SCHEME";
var SLASH_SCHEME = "SLASH_SCHEME";
var NUM = "NUM";
var WS = "WS";
var NL$1 = "NL";
var OPENBRACE = "OPENBRACE";
var OPENBRACKET = "OPENBRACKET";
var OPENANGLEBRACKET = "OPENANGLEBRACKET";
var OPENPAREN = "OPENPAREN";
var CLOSEBRACE = "CLOSEBRACE";
var CLOSEBRACKET = "CLOSEBRACKET";
var CLOSEANGLEBRACKET = "CLOSEANGLEBRACKET";
var CLOSEPAREN = "CLOSEPAREN";
var AMPERSAND = "AMPERSAND";
var APOSTROPHE = "APOSTROPHE";
var ASTERISK = "ASTERISK";
var AT = "AT";
var BACKSLASH = "BACKSLASH";
var BACKTICK = "BACKTICK";
var CARET = "CARET";
var COLON = "COLON";
var COMMA = "COMMA";
var DOLLAR = "DOLLAR";
var DOT = "DOT";
var EQUALS = "EQUALS";
var EXCLAMATION = "EXCLAMATION";
var HYPHEN = "HYPHEN";
var PERCENT = "PERCENT";
var PIPE = "PIPE";
var PLUS = "PLUS";
var POUND = "POUND";
var QUERY = "QUERY";
var QUOTE = "QUOTE";
var SEMI = "SEMI";
var SLASH = "SLASH";
var TILDE = "TILDE";
var UNDERSCORE = "UNDERSCORE";
var EMOJI$1 = "EMOJI";
var SYM = "SYM";
var tk = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  WORD,
  UWORD,
  LOCALHOST,
  TLD,
  UTLD,
  SCHEME,
  SLASH_SCHEME,
  NUM,
  WS,
  NL: NL$1,
  OPENBRACE,
  OPENBRACKET,
  OPENANGLEBRACKET,
  OPENPAREN,
  CLOSEBRACE,
  CLOSEBRACKET,
  CLOSEANGLEBRACKET,
  CLOSEPAREN,
  AMPERSAND,
  APOSTROPHE,
  ASTERISK,
  AT,
  BACKSLASH,
  BACKTICK,
  CARET,
  COLON,
  COMMA,
  DOLLAR,
  DOT,
  EQUALS,
  EXCLAMATION,
  HYPHEN,
  PERCENT,
  PIPE,
  PLUS,
  POUND,
  QUERY,
  QUOTE,
  SEMI,
  SLASH,
  TILDE,
  UNDERSCORE,
  EMOJI: EMOJI$1,
  SYM
});
var ASCII_LETTER = /[a-z]/;
var LETTER = /\p{L}/u;
var EMOJI = /\p{Emoji}/u;
var DIGIT = /\d/;
var SPACE = /\s/;
var NL = "\n";
var EMOJI_VARIATION = "\uFE0F";
var EMOJI_JOINER = "\u200D";
var tlds = null;
var utlds = null;
function init$2(customSchemes) {
  if (customSchemes === void 0) {
    customSchemes = [];
  }
  const groups = {};
  State.groups = groups;
  const Start = new State();
  if (tlds == null) {
    tlds = decodeTlds(encodedTlds);
  }
  if (utlds == null) {
    utlds = decodeTlds(encodedUtlds);
  }
  tt(Start, "'", APOSTROPHE);
  tt(Start, "{", OPENBRACE);
  tt(Start, "[", OPENBRACKET);
  tt(Start, "<", OPENANGLEBRACKET);
  tt(Start, "(", OPENPAREN);
  tt(Start, "}", CLOSEBRACE);
  tt(Start, "]", CLOSEBRACKET);
  tt(Start, ">", CLOSEANGLEBRACKET);
  tt(Start, ")", CLOSEPAREN);
  tt(Start, "&", AMPERSAND);
  tt(Start, "*", ASTERISK);
  tt(Start, "@", AT);
  tt(Start, "`", BACKTICK);
  tt(Start, "^", CARET);
  tt(Start, ":", COLON);
  tt(Start, ",", COMMA);
  tt(Start, "$", DOLLAR);
  tt(Start, ".", DOT);
  tt(Start, "=", EQUALS);
  tt(Start, "!", EXCLAMATION);
  tt(Start, "-", HYPHEN);
  tt(Start, "%", PERCENT);
  tt(Start, "|", PIPE);
  tt(Start, "+", PLUS);
  tt(Start, "#", POUND);
  tt(Start, "?", QUERY);
  tt(Start, '"', QUOTE);
  tt(Start, "/", SLASH);
  tt(Start, ";", SEMI);
  tt(Start, "~", TILDE);
  tt(Start, "_", UNDERSCORE);
  tt(Start, "\\", BACKSLASH);
  const Num = tr(Start, DIGIT, NUM, {
    [numeric]: true
  });
  tr(Num, DIGIT, Num);
  const Word = tr(Start, ASCII_LETTER, WORD, {
    [ascii]: true
  });
  tr(Word, ASCII_LETTER, Word);
  const UWord = tr(Start, LETTER, UWORD, {
    [alpha]: true
  });
  tr(UWord, ASCII_LETTER);
  tr(UWord, LETTER, UWord);
  const Ws = tr(Start, SPACE, WS, {
    [whitespace]: true
  });
  tt(Start, NL, NL$1, {
    [whitespace]: true
  });
  tt(Ws, NL);
  tr(Ws, SPACE, Ws);
  const Emoji = tr(Start, EMOJI, EMOJI$1, {
    [emoji]: true
  });
  tr(Emoji, EMOJI, Emoji);
  tt(Emoji, EMOJI_VARIATION, Emoji);
  const EmojiJoiner = tt(Emoji, EMOJI_JOINER);
  tr(EmojiJoiner, EMOJI, Emoji);
  const wordjr = [[ASCII_LETTER, Word]];
  const uwordjr = [[ASCII_LETTER, null], [LETTER, UWord]];
  for (let i = 0; i < tlds.length; i++) {
    fastts(Start, tlds[i], TLD, WORD, wordjr);
  }
  for (let i = 0; i < utlds.length; i++) {
    fastts(Start, utlds[i], UTLD, UWORD, uwordjr);
  }
  addToGroups(TLD, {
    tld: true,
    ascii: true
  }, groups);
  addToGroups(UTLD, {
    utld: true,
    alpha: true
  }, groups);
  fastts(Start, "file", SCHEME, WORD, wordjr);
  fastts(Start, "mailto", SCHEME, WORD, wordjr);
  fastts(Start, "http", SLASH_SCHEME, WORD, wordjr);
  fastts(Start, "https", SLASH_SCHEME, WORD, wordjr);
  fastts(Start, "ftp", SLASH_SCHEME, WORD, wordjr);
  fastts(Start, "ftps", SLASH_SCHEME, WORD, wordjr);
  addToGroups(SCHEME, {
    scheme: true,
    ascii: true
  }, groups);
  addToGroups(SLASH_SCHEME, {
    slashscheme: true,
    ascii: true
  }, groups);
  customSchemes = customSchemes.sort((a, b) => a[0] > b[0] ? 1 : -1);
  for (let i = 0; i < customSchemes.length; i++) {
    const sch = customSchemes[i][0];
    const optionalSlashSlash = customSchemes[i][1];
    const flags = optionalSlashSlash ? {
      [scheme]: true
    } : {
      [slashscheme]: true
    };
    if (sch.indexOf("-") >= 0) {
      flags[domain] = true;
    } else if (!ASCII_LETTER.test(sch)) {
      flags[numeric] = true;
    } else if (DIGIT.test(sch)) {
      flags[asciinumeric] = true;
    } else {
      flags[ascii] = true;
    }
    ts(Start, sch, sch, flags);
  }
  ts(Start, "localhost", LOCALHOST, {
    ascii: true
  });
  Start.jd = new State(SYM);
  return {
    start: Start,
    tokens: assign({
      groups
    }, tk)
  };
}
function run$1(start, str) {
  const iterable = stringToArray(str.replace(/[A-Z]/g, (c) => c.toLowerCase()));
  const charCount = iterable.length;
  const tokens = [];
  let cursor = 0;
  let charCursor = 0;
  while (charCursor < charCount) {
    let state = start;
    let nextState = null;
    let tokenLength = 0;
    let latestAccepting = null;
    let sinceAccepts = -1;
    let charsSinceAccepts = -1;
    while (charCursor < charCount && (nextState = state.go(iterable[charCursor]))) {
      state = nextState;
      if (state.accepts()) {
        sinceAccepts = 0;
        charsSinceAccepts = 0;
        latestAccepting = state;
      } else if (sinceAccepts >= 0) {
        sinceAccepts += iterable[charCursor].length;
        charsSinceAccepts++;
      }
      tokenLength += iterable[charCursor].length;
      cursor += iterable[charCursor].length;
      charCursor++;
    }
    cursor -= sinceAccepts;
    charCursor -= charsSinceAccepts;
    tokenLength -= sinceAccepts;
    tokens.push({
      t: latestAccepting.t,
      // token type/name
      v: str.slice(cursor - tokenLength, cursor),
      // string value
      s: cursor - tokenLength,
      // start index
      e: cursor
      // end index (excluding)
    });
  }
  return tokens;
}
function stringToArray(str) {
  const result = [];
  const len = str.length;
  let index = 0;
  while (index < len) {
    let first = str.charCodeAt(index);
    let second;
    let char = first < 55296 || first > 56319 || index + 1 === len || (second = str.charCodeAt(index + 1)) < 56320 || second > 57343 ? str[index] : str.slice(index, index + 2);
    result.push(char);
    index += char.length;
  }
  return result;
}
function fastts(state, input, t, defaultt, jr) {
  let next;
  const len = input.length;
  for (let i = 0; i < len - 1; i++) {
    const char = input[i];
    if (state.j[char]) {
      next = state.j[char];
    } else {
      next = new State(defaultt);
      next.jr = jr.slice();
      state.j[char] = next;
    }
    state = next;
  }
  next = new State(t);
  next.jr = jr.slice();
  state.j[input[len - 1]] = next;
  return next;
}
function decodeTlds(encoded) {
  const words = [];
  const stack = [];
  let i = 0;
  let digits = "0123456789";
  while (i < encoded.length) {
    let popDigitCount = 0;
    while (digits.indexOf(encoded[i + popDigitCount]) >= 0) {
      popDigitCount++;
    }
    if (popDigitCount > 0) {
      words.push(stack.join(""));
      for (let popCount = parseInt(encoded.substring(i, i + popDigitCount), 10); popCount > 0; popCount--) {
        stack.pop();
      }
      i += popDigitCount;
    } else {
      stack.push(encoded[i]);
      i++;
    }
  }
  return words;
}
var defaults = {
  defaultProtocol: "http",
  events: null,
  format: noop,
  formatHref: noop,
  nl2br: false,
  tagName: "a",
  target: null,
  rel: null,
  validate: true,
  truncate: Infinity,
  className: null,
  attributes: null,
  ignoreTags: [],
  render: null
};
function Options(opts, defaultRender) {
  if (defaultRender === void 0) {
    defaultRender = null;
  }
  let o = assign({}, defaults);
  if (opts) {
    o = assign(o, opts instanceof Options ? opts.o : opts);
  }
  const ignoredTags = o.ignoreTags;
  const uppercaseIgnoredTags = [];
  for (let i = 0; i < ignoredTags.length; i++) {
    uppercaseIgnoredTags.push(ignoredTags[i].toUpperCase());
  }
  this.o = o;
  if (defaultRender) {
    this.defaultRender = defaultRender;
  }
  this.ignoreTags = uppercaseIgnoredTags;
}
Options.prototype = {
  o: defaults,
  /**
   * @type string[]
   */
  ignoreTags: [],
  /**
   * @param {IntermediateRepresentation} ir
   * @returns {any}
   */
  defaultRender(ir) {
    return ir;
  },
  /**
   * Returns true or false based on whether a token should be displayed as a
   * link based on the user options.
   * @param {MultiToken} token
   * @returns {boolean}
   */
  check(token) {
    return this.get("validate", token.toString(), token);
  },
  // Private methods
  /**
   * Resolve an option's value based on the value of the option and the given
   * params. If operator and token are specified and the target option is
   * callable, automatically calls the function with the given argument.
   * @template {keyof Opts} K
   * @param {K} key Name of option to use
   * @param {string} [operator] will be passed to the target option if it's a
   * function. If not specified, RAW function value gets returned
   * @param {MultiToken} [token] The token from linkify.tokenize
   * @returns {Opts[K] | any}
   */
  get(key, operator, token) {
    const isCallable = operator != null;
    let option = this.o[key];
    if (!option) {
      return option;
    }
    if (typeof option === "object") {
      option = token.t in option ? option[token.t] : defaults[key];
      if (typeof option === "function" && isCallable) {
        option = option(operator, token);
      }
    } else if (typeof option === "function" && isCallable) {
      option = option(operator, token.t, token);
    }
    return option;
  },
  /**
   * @template {keyof Opts} L
   * @param {L} key Name of options object to use
   * @param {string} [operator]
   * @param {MultiToken} [token]
   * @returns {Opts[L] | any}
   */
  getObj(key, operator, token) {
    let obj = this.o[key];
    if (typeof obj === "function" && operator != null) {
      obj = obj(operator, token.t, token);
    }
    return obj;
  },
  /**
   * Convert the given token to a rendered element that may be added to the
   * calling-interface's DOM
   * @param {MultiToken} token Token to render to an HTML element
   * @returns {any} Render result; e.g., HTML string, DOM element, React
   *   Component, etc.
   */
  render(token) {
    const ir = token.render(this);
    const renderFn = this.get("render", null, token) || this.defaultRender;
    return renderFn(ir, token.t, token);
  }
};
function noop(val) {
  return val;
}
function MultiToken(value, tokens) {
  this.t = "token";
  this.v = value;
  this.tk = tokens;
}
MultiToken.prototype = {
  isLink: false,
  /**
   * Return the string this token represents.
   * @return {string}
   */
  toString() {
    return this.v;
  },
  /**
   * What should the value for this token be in the `href` HTML attribute?
   * Returns the `.toString` value by default.
   * @param {string} [scheme]
   * @return {string}
  */
  toHref(scheme2) {
    return this.toString();
  },
  /**
   * @param {Options} options Formatting options
   * @returns {string}
   */
  toFormattedString(options) {
    const val = this.toString();
    const truncate = options.get("truncate", val, this);
    const formatted = options.get("format", val, this);
    return truncate && formatted.length > truncate ? formatted.substring(0, truncate) + "\u2026" : formatted;
  },
  /**
   *
   * @param {Options} options
   * @returns {string}
   */
  toFormattedHref(options) {
    return options.get("formatHref", this.toHref(options.get("defaultProtocol")), this);
  },
  /**
   * The start index of this token in the original input string
   * @returns {number}
   */
  startIndex() {
    return this.tk[0].s;
  },
  /**
   * The end index of this token in the original input string (up to this
   * index but not including it)
   * @returns {number}
   */
  endIndex() {
    return this.tk[this.tk.length - 1].e;
  },
  /**
	Returns an object  of relevant values for this token, which includes keys
	* type - Kind of token ('url', 'email', etc.)
	* value - Original text
	* href - The value that should be added to the anchor tag's href
		attribute
		@method toObject
	@param {string} [protocol] `'http'` by default
  */
  toObject(protocol) {
    if (protocol === void 0) {
      protocol = defaults.defaultProtocol;
    }
    return {
      type: this.t,
      value: this.toString(),
      isLink: this.isLink,
      href: this.toHref(protocol),
      start: this.startIndex(),
      end: this.endIndex()
    };
  },
  /**
   *
   * @param {Options} options Formatting option
   */
  toFormattedObject(options) {
    return {
      type: this.t,
      value: this.toFormattedString(options),
      isLink: this.isLink,
      href: this.toFormattedHref(options),
      start: this.startIndex(),
      end: this.endIndex()
    };
  },
  /**
   * Whether this token should be rendered as a link according to the given options
   * @param {Options} options
   * @returns {boolean}
   */
  validate(options) {
    return options.get("validate", this.toString(), this);
  },
  /**
   * Return an object that represents how this link should be rendered.
   * @param {Options} options Formattinng options
   */
  render(options) {
    const token = this;
    const href = this.toHref(options.get("defaultProtocol"));
    const formattedHref = options.get("formatHref", href, this);
    const tagName = options.get("tagName", href, token);
    const content = this.toFormattedString(options);
    const attributes = {};
    const className = options.get("className", href, token);
    const target = options.get("target", href, token);
    const rel = options.get("rel", href, token);
    const attrs = options.getObj("attributes", href, token);
    const eventListeners = options.getObj("events", href, token);
    attributes.href = formattedHref;
    if (className) {
      attributes.class = className;
    }
    if (target) {
      attributes.target = target;
    }
    if (rel) {
      attributes.rel = rel;
    }
    if (attrs) {
      assign(attributes, attrs);
    }
    return {
      tagName,
      attributes,
      content,
      eventListeners
    };
  }
};
function createTokenClass(type, props2) {
  class Token extends MultiToken {
    constructor(value, tokens) {
      super(value, tokens);
      this.t = type;
    }
  }
  for (const p in props2) {
    Token.prototype[p] = props2[p];
  }
  Token.t = type;
  return Token;
}
var Email = createTokenClass("email", {
  isLink: true,
  toHref() {
    return "mailto:" + this.toString();
  }
});
var Text = createTokenClass("text");
var Nl = createTokenClass("nl");
var Url = createTokenClass("url", {
  isLink: true,
  /**
	Lowercases relevant parts of the domain and adds the protocol if
	required. Note that this will not escape unsafe HTML characters in the
	URL.
		@param {string} [scheme] default scheme (e.g., 'https')
	@return {string} the full href
  */
  toHref(scheme2) {
    if (scheme2 === void 0) {
      scheme2 = defaults.defaultProtocol;
    }
    return this.hasProtocol() ? this.v : `${scheme2}://${this.v}`;
  },
  /**
   * Check whether this URL token has a protocol
   * @return {boolean}
   */
  hasProtocol() {
    const tokens = this.tk;
    return tokens.length >= 2 && tokens[0].t !== LOCALHOST && tokens[1].t === COLON;
  }
});
var makeState = (arg) => new State(arg);
function init$1(_ref) {
  let {
    groups
  } = _ref;
  const qsAccepting = groups.domain.concat([AMPERSAND, ASTERISK, AT, BACKSLASH, BACKTICK, CARET, DOLLAR, EQUALS, HYPHEN, NUM, PERCENT, PIPE, PLUS, POUND, SLASH, SYM, TILDE, UNDERSCORE]);
  const qsNonAccepting = [APOSTROPHE, CLOSEANGLEBRACKET, CLOSEBRACE, CLOSEBRACKET, CLOSEPAREN, COLON, COMMA, DOT, EXCLAMATION, OPENANGLEBRACKET, OPENBRACE, OPENBRACKET, OPENPAREN, QUERY, QUOTE, SEMI];
  const localpartAccepting = [AMPERSAND, APOSTROPHE, ASTERISK, BACKSLASH, BACKTICK, CARET, CLOSEBRACE, DOLLAR, EQUALS, HYPHEN, OPENBRACE, PERCENT, PIPE, PLUS, POUND, QUERY, SLASH, SYM, TILDE, UNDERSCORE];
  const Start = makeState();
  const Localpart = tt(Start, TILDE);
  ta(Localpart, localpartAccepting, Localpart);
  ta(Localpart, groups.domain, Localpart);
  const Domain = makeState(), Scheme = makeState(), SlashScheme = makeState();
  ta(Start, groups.domain, Domain);
  ta(Start, groups.scheme, Scheme);
  ta(Start, groups.slashscheme, SlashScheme);
  ta(Domain, localpartAccepting, Localpart);
  ta(Domain, groups.domain, Domain);
  const LocalpartAt = tt(Domain, AT);
  tt(Localpart, AT, LocalpartAt);
  tt(Scheme, AT, LocalpartAt);
  tt(SlashScheme, AT, LocalpartAt);
  const LocalpartDot = tt(Localpart, DOT);
  ta(LocalpartDot, localpartAccepting, Localpart);
  ta(LocalpartDot, groups.domain, Localpart);
  const EmailDomain = makeState();
  ta(LocalpartAt, groups.domain, EmailDomain);
  ta(EmailDomain, groups.domain, EmailDomain);
  const EmailDomainDot = tt(EmailDomain, DOT);
  ta(EmailDomainDot, groups.domain, EmailDomain);
  const Email$1 = makeState(Email);
  ta(EmailDomainDot, groups.tld, Email$1);
  ta(EmailDomainDot, groups.utld, Email$1);
  tt(LocalpartAt, LOCALHOST, Email$1);
  const EmailDomainHyphen = tt(EmailDomain, HYPHEN);
  ta(EmailDomainHyphen, groups.domain, EmailDomain);
  ta(Email$1, groups.domain, EmailDomain);
  tt(Email$1, DOT, EmailDomainDot);
  tt(Email$1, HYPHEN, EmailDomainHyphen);
  const EmailColon = tt(Email$1, COLON);
  ta(EmailColon, groups.numeric, Email);
  const DomainHyphen = tt(Domain, HYPHEN);
  const DomainDot = tt(Domain, DOT);
  ta(DomainHyphen, groups.domain, Domain);
  ta(DomainDot, localpartAccepting, Localpart);
  ta(DomainDot, groups.domain, Domain);
  const DomainDotTld = makeState(Url);
  ta(DomainDot, groups.tld, DomainDotTld);
  ta(DomainDot, groups.utld, DomainDotTld);
  ta(DomainDotTld, groups.domain, Domain);
  ta(DomainDotTld, localpartAccepting, Localpart);
  tt(DomainDotTld, DOT, DomainDot);
  tt(DomainDotTld, HYPHEN, DomainHyphen);
  tt(DomainDotTld, AT, LocalpartAt);
  const DomainDotTldColon = tt(DomainDotTld, COLON);
  const DomainDotTldColonPort = makeState(Url);
  ta(DomainDotTldColon, groups.numeric, DomainDotTldColonPort);
  const Url$1 = makeState(Url);
  const UrlNonaccept = makeState();
  ta(Url$1, qsAccepting, Url$1);
  ta(Url$1, qsNonAccepting, UrlNonaccept);
  ta(UrlNonaccept, qsAccepting, Url$1);
  ta(UrlNonaccept, qsNonAccepting, UrlNonaccept);
  tt(DomainDotTld, SLASH, Url$1);
  tt(DomainDotTldColonPort, SLASH, Url$1);
  const SchemeColon = tt(Scheme, COLON);
  const SlashSchemeColon = tt(SlashScheme, COLON);
  const SlashSchemeColonSlash = tt(SlashSchemeColon, SLASH);
  const UriPrefix = tt(SlashSchemeColonSlash, SLASH);
  ta(Scheme, groups.domain, Domain);
  tt(Scheme, DOT, DomainDot);
  tt(Scheme, HYPHEN, DomainHyphen);
  ta(SlashScheme, groups.domain, Domain);
  tt(SlashScheme, DOT, DomainDot);
  tt(SlashScheme, HYPHEN, DomainHyphen);
  ta(SchemeColon, groups.domain, Url$1);
  tt(SchemeColon, SLASH, Url$1);
  ta(UriPrefix, groups.domain, Url$1);
  ta(UriPrefix, qsAccepting, Url$1);
  tt(UriPrefix, SLASH, Url$1);
  const UrlOpenbrace = tt(Url$1, OPENBRACE);
  const UrlOpenbracket = tt(Url$1, OPENBRACKET);
  const UrlOpenanglebracket = tt(Url$1, OPENANGLEBRACKET);
  const UrlOpenparen = tt(Url$1, OPENPAREN);
  tt(UrlNonaccept, OPENBRACE, UrlOpenbrace);
  tt(UrlNonaccept, OPENBRACKET, UrlOpenbracket);
  tt(UrlNonaccept, OPENANGLEBRACKET, UrlOpenanglebracket);
  tt(UrlNonaccept, OPENPAREN, UrlOpenparen);
  tt(UrlOpenbrace, CLOSEBRACE, Url$1);
  tt(UrlOpenbracket, CLOSEBRACKET, Url$1);
  tt(UrlOpenanglebracket, CLOSEANGLEBRACKET, Url$1);
  tt(UrlOpenparen, CLOSEPAREN, Url$1);
  tt(UrlOpenbrace, CLOSEBRACE, Url$1);
  const UrlOpenbraceQ = makeState(Url);
  const UrlOpenbracketQ = makeState(Url);
  const UrlOpenanglebracketQ = makeState(Url);
  const UrlOpenparenQ = makeState(Url);
  ta(UrlOpenbrace, qsAccepting, UrlOpenbraceQ);
  ta(UrlOpenbracket, qsAccepting, UrlOpenbracketQ);
  ta(UrlOpenanglebracket, qsAccepting, UrlOpenanglebracketQ);
  ta(UrlOpenparen, qsAccepting, UrlOpenparenQ);
  const UrlOpenbraceSyms = makeState();
  const UrlOpenbracketSyms = makeState();
  const UrlOpenanglebracketSyms = makeState();
  const UrlOpenparenSyms = makeState();
  ta(UrlOpenbrace, qsNonAccepting);
  ta(UrlOpenbracket, qsNonAccepting);
  ta(UrlOpenanglebracket, qsNonAccepting);
  ta(UrlOpenparen, qsNonAccepting);
  ta(UrlOpenbraceQ, qsAccepting, UrlOpenbraceQ);
  ta(UrlOpenbracketQ, qsAccepting, UrlOpenbracketQ);
  ta(UrlOpenanglebracketQ, qsAccepting, UrlOpenanglebracketQ);
  ta(UrlOpenparenQ, qsAccepting, UrlOpenparenQ);
  ta(UrlOpenbraceQ, qsNonAccepting, UrlOpenbraceQ);
  ta(UrlOpenbracketQ, qsNonAccepting, UrlOpenbracketQ);
  ta(UrlOpenanglebracketQ, qsNonAccepting, UrlOpenanglebracketQ);
  ta(UrlOpenparenQ, qsNonAccepting, UrlOpenparenQ);
  ta(UrlOpenbraceSyms, qsAccepting, UrlOpenbraceSyms);
  ta(UrlOpenbracketSyms, qsAccepting, UrlOpenbracketQ);
  ta(UrlOpenanglebracketSyms, qsAccepting, UrlOpenanglebracketQ);
  ta(UrlOpenparenSyms, qsAccepting, UrlOpenparenQ);
  ta(UrlOpenbraceSyms, qsNonAccepting, UrlOpenbraceSyms);
  ta(UrlOpenbracketSyms, qsNonAccepting, UrlOpenbracketSyms);
  ta(UrlOpenanglebracketSyms, qsNonAccepting, UrlOpenanglebracketSyms);
  ta(UrlOpenparenSyms, qsNonAccepting, UrlOpenparenSyms);
  tt(UrlOpenbracketQ, CLOSEBRACKET, Url$1);
  tt(UrlOpenanglebracketQ, CLOSEANGLEBRACKET, Url$1);
  tt(UrlOpenparenQ, CLOSEPAREN, Url$1);
  tt(UrlOpenbraceQ, CLOSEBRACE, Url$1);
  tt(UrlOpenbracketSyms, CLOSEBRACKET, Url$1);
  tt(UrlOpenanglebracketSyms, CLOSEANGLEBRACKET, Url$1);
  tt(UrlOpenparenSyms, CLOSEPAREN, Url$1);
  tt(UrlOpenbraceSyms, CLOSEPAREN, Url$1);
  tt(Start, LOCALHOST, DomainDotTld);
  tt(Start, NL$1, Nl);
  return {
    start: Start,
    tokens: tk
  };
}
function run(start, input, tokens) {
  let len = tokens.length;
  let cursor = 0;
  let multis = [];
  let textTokens = [];
  while (cursor < len) {
    let state = start;
    let secondState = null;
    let nextState = null;
    let multiLength = 0;
    let latestAccepting = null;
    let sinceAccepts = -1;
    while (cursor < len && !(secondState = state.go(tokens[cursor].t))) {
      textTokens.push(tokens[cursor++]);
    }
    while (cursor < len && (nextState = secondState || state.go(tokens[cursor].t))) {
      secondState = null;
      state = nextState;
      if (state.accepts()) {
        sinceAccepts = 0;
        latestAccepting = state;
      } else if (sinceAccepts >= 0) {
        sinceAccepts++;
      }
      cursor++;
      multiLength++;
    }
    if (sinceAccepts < 0) {
      cursor -= multiLength;
      if (cursor < len) {
        textTokens.push(tokens[cursor]);
        cursor++;
      }
    } else {
      if (textTokens.length > 0) {
        multis.push(initMultiToken(Text, input, textTokens));
        textTokens = [];
      }
      cursor -= sinceAccepts;
      multiLength -= sinceAccepts;
      const Multi = latestAccepting.t;
      const subtokens = tokens.slice(cursor - multiLength, cursor);
      multis.push(initMultiToken(Multi, input, subtokens));
    }
  }
  if (textTokens.length > 0) {
    multis.push(initMultiToken(Text, input, textTokens));
  }
  return multis;
}
function initMultiToken(Multi, input, tokens) {
  const startIdx = tokens[0].s;
  const endIdx = tokens[tokens.length - 1].e;
  const value = input.slice(startIdx, endIdx);
  return new Multi(value, tokens);
}
var INIT = {
  scanner: null,
  parser: null,
  tokenQueue: [],
  pluginQueue: [],
  customSchemes: [],
  initialized: false
};
function init() {
  INIT.scanner = init$2(INIT.customSchemes);
  for (let i = 0; i < INIT.tokenQueue.length; i++) {
    INIT.tokenQueue[i][1]({
      scanner: INIT.scanner
    });
  }
  INIT.parser = init$1(INIT.scanner.tokens);
  for (let i = 0; i < INIT.pluginQueue.length; i++) {
    INIT.pluginQueue[i][1]({
      scanner: INIT.scanner,
      parser: INIT.parser
    });
  }
  INIT.initialized = true;
}
function tokenize(str) {
  if (!INIT.initialized) {
    init();
  }
  return run(INIT.parser.start, str, run$1(INIT.scanner.start, str));
}
function find(str, type, opts) {
  if (type === void 0) {
    type = null;
  }
  if (opts === void 0) {
    opts = null;
  }
  if (type && typeof type === "object") {
    if (opts) {
      throw Error(`linkifyjs: Invalid link type ${type}; must be a string`);
    }
    opts = type;
    type = null;
  }
  const options = new Options(opts);
  const tokens = tokenize(str);
  const filtered = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.isLink && (!type || token.t === type)) {
      filtered.push(token.toFormattedObject(options));
    }
  }
  return filtered;
}

// src/view.ts
var _AbstractStickyNote = class extends Gtk.TextView {
  constructor(note) {
    super();
    this.bold_tag = Gtk.TextTag.new("bold");
    this.underline_tag = Gtk.TextTag.new("underline");
    this.italic_tag = Gtk.TextTag.new("italic");
    this.strikethrough_tag = Gtk.TextTag.new("strikethrough");
    this.link_tag = Gtk.TextTag.new("link");
    this.actions = [
      ["bold", this.bold_tag],
      ["underline", this.underline_tag],
      ["italic", this.italic_tag],
      ["strikethrough", this.strikethrough_tag]
    ];
    this.listeners = /* @__PURE__ */ new Set();
    this.last_link = false;
    this.last_link_end = 0;
    this.style_manager = Adw2.StyleManager.get_default();
    this.register_tags();
    if (note)
      this.note = note;
    this.buffer.connect("mark-set", (_buffer, _loc, mark) => {
      if (!this.note)
        return;
      if (mark.name === "insert" || mark.name === "selection_bound" || this.buffer.get_iter_at_mark(mark).equal(
        this.buffer.get_iter_at_mark(this.buffer.get_insert())
      )) {
        this.emit("selection-changed");
      }
      this.check_link_selected();
    });
  }
  get note() {
    return this._note;
  }
  set note(note) {
    if (!note)
      return;
    this._note = note;
    this.clear_tags();
    this.buffer.text = note.content;
    this.init_tags(note.tags);
    this.update_link_tag_color();
    this.remove_listeners();
    this.init_listeners();
  }
  init_listeners() {
    if (!this.note)
      return;
    this.listeners.add(this.note.connect("notify::style", () => {
      this.update_link_tag_color();
    }));
  }
  remove_listeners() {
  }
  check_link_selected() {
    const has_link = this.has_tag(this.link_tag);
    if (has_link) {
      const start = this.buffer.get_iter_at_offset(has_link);
      if (!start.starts_tag(this.link_tag)) {
        start.backward_to_tag_toggle(this.link_tag);
      }
      const end = start.copy();
      end.forward_to_tag_toggle(this.link_tag);
      if (start.get_offset() !== this.last_link || end.get_offset() !== this.last_link_end) {
        const text = this.buffer.get_text(start, end, false).replace(/\u200B/g, "");
        this.emit("link-selected", text);
        this.last_link = start.get_offset();
        this.last_link_end = end.get_offset();
      }
    } else if (has_link !== this.last_link) {
      this.emit("link-unselected");
      this.last_link = false;
    }
  }
  update_link_tag_color() {
    if (!this.note)
      return;
    let color;
    if (this.style_manager.dark) {
      const accent_color = this.get_style_context().lookup_color(
        "accent_fg_color"
      );
      if (accent_color[0]) {
        color = accent_color[1].to_string();
      } else {
        color = "#0000ff";
      }
    } else {
      const accent_color = this.get_style_context().lookup_color(
        `link_color_${Style[this.note.style]}`
      );
      if (accent_color[0]) {
        color = accent_color[1].to_string();
      } else {
        color = "#0000ff";
      }
    }
    this.link_tag.foreground = color;
  }
  register_tags() {
    this.bold_tag.weight = Pango.Weight.BOLD;
    this.underline_tag.underline = Pango.Underline.SINGLE;
    this.italic_tag.style = Pango.Style.ITALIC;
    this.strikethrough_tag.strikethrough = true;
    this.link_tag.underline = Pango.Underline.SINGLE;
    if (this.style_manager.system_supports_color_schemes) {
      this.style_manager.connect(
        "notify::dark",
        this.update_link_tag_color.bind(this)
      );
    }
    this.buffer.tag_table.add(this.bold_tag);
    this.buffer.tag_table.add(this.underline_tag);
    this.buffer.tag_table.add(this.italic_tag);
    this.buffer.tag_table.add(this.strikethrough_tag);
    this.buffer.tag_table.add(this.link_tag);
  }
  init_tags(tags) {
    for (const tag of tags) {
      const start = this.buffer.get_iter_at_offset(tag.start);
      const end = this.buffer.get_iter_at_offset(tag.end);
      this.buffer.apply_tag_by_name(tag.name, start, end);
    }
  }
  has_tag(tag) {
    let [selection, start, end] = this.buffer.get_selection_bounds();
    if (!selection) {
      start = this.buffer.get_iter_at_mark(
        this.buffer.get_insert()
      );
      end = start.copy();
      end.forward_cursor_position();
    }
    do {
      if (start.has_tag(tag) !== false) {
        return start.get_offset();
      }
      start.forward_char();
    } while (start.compare(end) < 0);
    return false;
  }
  apply_tag(tag) {
    let [selection, start, end] = this.buffer.get_selection_bounds();
    if (!selection) {
      const get_cursor_position = () => this.buffer.cursor_position;
      this.buffer.insert_at_cursor("\u200B\u200B\u200B", 9);
      start = this.buffer.get_iter_at_offset(get_cursor_position() - 3);
      end = this.buffer.get_iter_at_offset(get_cursor_position() - 1);
      const selec = this.buffer.get_iter_at_offset(get_cursor_position());
      selec.backward_chars(2);
      this.buffer.place_cursor(selec);
    }
    const has_tag = this.has_tag(tag);
    if (this.has_tag(tag) !== false) {
      this.buffer.remove_tag(tag, start, end);
    } else {
      this.buffer.apply_tag(tag, start, end);
    }
    this.emit("tag-toggle", tag.name, has_tag === false);
  }
  clear_tags() {
    const start = this.buffer.get_start_iter();
    const end = this.buffer.get_end_iter();
    for (const [name, tag] of this.actions) {
      this.buffer.remove_tag(tag, start, end);
      this.emit("tag-toggle", name, false);
    }
  }
  get_tags() {
    const tags = [];
    this.buffer.get_tag_table().foreach((tag) => {
      const start = this.buffer.get_start_iter();
      do {
        if (!start.starts_tag(tag))
          continue;
        const begin = start.copy();
        start.forward_to_tag_toggle(tag);
        tags.push({
          name: tag.name,
          start: begin.get_offset(),
          end: start.get_offset()
        });
      } while (start.forward_to_tag_toggle(tag));
    });
    return tags;
  }
};
var AbstractStickyNote = _AbstractStickyNote;
(() => {
  GObject2.registerClass(
    {
      GTypeName: "AbstractStickyNote",
      Signals: {
        "tag-toggle": {
          param_types: [GObject2.TYPE_STRING, GObject2.TYPE_BOOLEAN]
        },
        "selection-changed": {},
        "link-selected": {
          param_types: [GObject2.TYPE_STRING]
        },
        "link-unselected": {}
      }
    },
    _AbstractStickyNote
  );
})();
var _ReadonlyStickyNote = class extends AbstractStickyNote {
  constructor(note) {
    super(note);
    this.note = note;
    this.editable = false;
    this.cursor_visible = false;
    this.show_content();
  }
  set note(note) {
    this._note = super.note = note;
    this.show_content();
  }
  get note() {
    return super.note;
  }
  clip_content(content) {
    const MAX_LINES = 5;
    const MAX_CHARS = 240;
    content = content.replace(/\s+$/, "");
    let cut = content.split("\n").slice(0, MAX_LINES).join("\n");
    if (cut.length > MAX_CHARS) {
      cut = cut.slice(0, MAX_CHARS);
    }
    return cut.length < content.length ? `${cut}\u2026` : cut;
  }
  show_content() {
    if (!this.note)
      return;
    if (!this.note.content.replace(/\s/g, "")) {
      this.buffer.text = "";
      this.buffer.insert_markup(
        this.buffer.get_start_iter(),
        `<i>(${_("Empty Note")})</i>`,
        -1
      );
    } else {
      this.buffer.text = this.clip_content(this.note.content);
      this.clear_tags();
      this.init_tags(this.note.tags);
    }
  }
  init_listeners() {
    super.init_listeners();
    if (!this.note)
      return;
    this.listeners.add(this.note.connect("notify::content", () => {
      this.show_content();
    }));
    this.listeners.add(this.note.connect("notify::tag_list", () => {
      this.clear_tags();
      this.init_tags(this.note.tags);
    }));
  }
  remove_listeners() {
    super.remove_listeners();
    if (!this.note)
      return;
    for (const listener of this.listeners) {
      this.note.disconnect(listener);
    }
    this.listeners.clear();
  }
};
var ReadonlyStickyNote = _ReadonlyStickyNote;
(() => {
  GObject2.registerClass(
    {
      GTypeName: "ReadonlyStickyNote"
    },
    _ReadonlyStickyNote
  );
})();
var _WriteableStickyNote = class extends AbstractStickyNote {
  constructor(note) {
    super(note);
    this.updating = false;
    this.source = null;
    this.buffer.connect_after("insert-text", (buffer, loc, text, length) => {
      this.on_text_inserted(buffer, loc, text, length);
    });
    this.buffer.connect("changed", () => {
      if (this.updating) {
        this.updating = false;
        return;
      }
      this.update_links();
      if (this.buffer.text == this.note.content)
        return;
      this.change("content", this.buffer.text);
    });
    this.buffer.connect("mark-set", () => {
      if (!this.note)
        return;
      const tags = this.get_tags();
      if (compare_tags(tags, this.note.tags))
        return;
      this.note.tags = tags;
    });
  }
  get note() {
    return super.note;
  }
  set note(note) {
    this.updating = true;
    super.note = note;
  }
  change(key, value) {
    if (!this.note)
      return;
    this.note[key] = value;
    this.note.modified_date = /* @__PURE__ */ new Date();
  }
  clear_links() {
    this.buffer.remove_tag(
      this.link_tag,
      this.buffer.get_start_iter(),
      this.buffer.get_end_iter()
    );
    this.emit("tag-toggle", "link", false);
  }
  update_links() {
    const text = this.buffer.text;
    this.clear_links();
    find(text).forEach((match) => {
      const start = this.buffer.get_iter_at_offset(match.start);
      const end = this.buffer.get_iter_at_offset(match.end);
      this.buffer.apply_tag(this.link_tag, start, end);
    });
    this.emit("tag-toggle", "link", true);
  }
  clear_tags() {
    super.clear_tags();
  }
  apply_tag(tag) {
    super.apply_tag(tag);
    const tags = this.get_tags();
    if (compare_tags(tags, this.note.tags))
      return;
    this.change("tags", tags);
  }
  on_text_inserted(buffer, loc, text, length) {
    if (text === "\n") {
      const start_iter = loc.copy();
      start_iter.backward_char();
      start_iter.set_line_offset(0);
      const end_iter = start_iter.copy();
      end_iter.forward_chars(2);
      const chars = buffer.get_text(start_iter, end_iter, false);
      const simple_regex_pattern = /^[-+*] $/;
      if (simple_regex_pattern.test(chars)) {
        const bullet = chars[0];
        const line_end = loc.copy();
        line_end.backward_char();
        if (line_end.get_line_offset() === 2) {
          start_iter.set_line_offset(0);
          buffer.delete(start_iter, loc);
        } else {
          buffer.insert(loc, bullet + " ", -1);
        }
      } else {
        const search_limit = start_iter.copy();
        const search_end = start_iter.copy();
        search_limit.forward_chars(10);
        search_end.forward_find_char((ch) => {
          console.log("forward char", ch);
          return ch === " ";
        }, search_limit);
        search_end.forward_char();
        const chars2 = buffer.get_text(start_iter, search_end, false);
        const ordered_regex_pattern = /^\d+\. $/;
        if (ordered_regex_pattern.test(chars2)) {
          const current_order = parseInt(chars2.slice(0, -2));
          const new_order = current_order + 1;
          const new_order_bullet = `${new_order}. `;
          const line_end = loc.copy();
          line_end.backward_char();
          if (line_end.get_line_offset() === current_order.toString().length + 2) {
            start_iter.set_line_offset(0);
            buffer.delete(start_iter, loc);
          } else {
            buffer.insert(loc, new_order_bullet, -1);
          }
        }
      }
    }
  }
};
var WriteableStickyNote = _WriteableStickyNote;
(() => {
  GObject2.registerClass(
    {
      GTypeName: "WriteableStickyNote"
    },
    _WriteableStickyNote
  );
})();
var compare_tags = (a, b) => {
  if (a.length != b.length)
    return false;
  for (const tag of a) {
    if (!b.find(
      (t) => t.name == tag.name && t.start == tag.start && t.end == tag.end
    )) {
      return false;
    }
  }
  return true;
};

// src/card.ts
var _StickyNoteCard = class extends Gtk2.Box {
  constructor(window, note) {
    super();
    this.window = window;
    this.view = new ReadonlyStickyNote(note);
    this.view.add_css_class("card-text-view");
    this.view.wrap_mode = Gtk2.WrapMode.WORD_CHAR;
    this._scrolled.set_child(this.view);
    this._delete_button.connect("clicked", this.delete.bind(this));
    if (note)
      this._note = this.note = note;
  }
  set show_visible_image(visible) {
    this._view_image.visible = visible;
  }
  set note(note) {
    var _a;
    if ((note == null ? void 0 : note.style) !== ((_a = this._note) == null ? void 0 : _a.style))
      this.set_style(note.style);
    this._note = this.view.note = note;
    this.update_modified_label();
  }
  get uuid() {
    var _a;
    return (_a = this._note) == null ? void 0 : _a.uuid;
  }
  update_modified_label() {
    var _a, _b;
    const modified = (_b = (_a = this._note) == null ? void 0 : _a.modified) == null ? void 0 : _b.to_local();
    if (!modified)
      return;
    const format = GLib2.DateTime.new_now_local().format("%F") === modified.format("%F") ? "%R" : "%F";
    this._modified_label.label = modified.format(format);
  }
  set_style(style) {
    for (const s of this.get_css_classes()) {
      if (s.startsWith("style-") && s !== `style-specifity`) {
        this.remove_css_class(s);
      }
    }
    this.add_css_class(`style-${Style[style]}`);
  }
  delete() {
    if (!this._note)
      return;
    confirm_delete(this.window, () => {
      this.emit("deleted");
    });
  }
};
var StickyNoteCard = _StickyNoteCard;
(() => {
  GObject3.registerClass({
    GTypeName: "StickyNoteCard",
    Template: "resource:///com/vixalien/sticky/ui/card.ui",
    InternalChildren: [
      "modified_label",
      "view_image",
      "delete_button",
      "scrolled"
    ],
    Properties: {
      uuid: GObject3.ParamSpec.string(
        "uuid",
        "UUID",
        "The UUID of the note",
        GObject3.ParamFlags.READABLE,
        ""
      )
    },
    Signals: {
      deleted: {}
    }
  }, _StickyNoteCard);
})();

// src/themeselector.ts
import GObject4 from "gi://GObject";
import Gtk3 from "gi://Gtk?version=4.0";
import Adw3 from "gi://Adw";
import Gdk from "gi://Gdk?version=4.0";
var _ThemeSelector = class extends Gtk3.Widget {
  constructor(params = {}) {
    super(params);
    this.style_manager = Adw3.StyleManager.get_default();
    this.style_manager.connect(
      "notify::system-supports-color-schemes",
      this._on_notify_system_supports_color_schemes.bind(this)
    );
    this._on_notify_system_supports_color_schemes();
    const dark = this.style_manager.get_dark();
    this.theme = dark ? "dark" : "light";
    this.style_manager.connect("notify::dark", this._on_notify_dark.bind(this));
    this._on_notify_dark();
    const provider2 = new Gtk3.CssProvider();
    provider2.load_from_resource("/com/vixalien/sticky/theme-selector.css");
    Gtk3.StyleContext.add_provider_for_display(
      Gdk.Display.get_default(),
      provider2,
      Gtk3.STYLE_PROVIDER_PRIORITY_APPLICATION
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
  GObject4.registerClass(
    {
      GTypeName: "ThemeSelector",
      Template: "resource:///com/vixalien/sticky/ui/theme-selector.ui",
      CssName: "themeselector",
      InternalChildren: ["follow"],
      Properties: {
        theme: GObject4.ParamSpec.string(
          "theme",
          // Name
          "Theme",
          // Nick
          "Theme",
          // Blurb
          GObject4.ParamFlags.READWRITE,
          /// @ts-expect-error
          null
          // Default value
        )
      }
    },
    _ThemeSelector
  );
  _ThemeSelector.set_layout_manager_type(Gtk3.BinLayout.$gtype);
})();

// src/notes.ts
var _StickyNotes = class extends Adw4.ApplicationWindow {
  constructor(params) {
    super(params);
    this.cards = [];
    this.old_query = "";
    this.default_height = settings.get_int("default-height");
    this.default_width = settings.get_int("default-width");
    this.connect("close-request", () => {
      settings.set_int("default-height", this.get_height());
      settings.set_int("default-width", this.get_width());
    });
    this._notes_box.remove_css_class("view");
    const factory = new Gtk4.SignalListItemFactory();
    factory.connect("setup", this.setup_cb.bind(this));
    factory.connect("bind", this.bind_cb.bind(this));
    factory.connect("unbind", this.unbind_cb.bind(this));
    const filter = Gtk4.CustomFilter.new((note) => {
      const query = this.query;
      const content = note.content.toLowerCase();
      if (!query.replace(/\s/g, ""))
        return true;
      return content.includes(query);
    });
    const filter_model = Gtk4.FilterListModel.new(
      this.application.notes_list,
      filter
    );
    this.sorter = Gtk4.CustomSorter.new((note1, note2) => {
      const date1 = note1.modified;
      const date2 = note2.modified;
      return date2.compare(date1);
    });
    const sorter_model = Gtk4.SortListModel.new(filter_model, this.sorter);
    this.last_model = Gtk4.SingleSelection.new(
      sorter_model
    );
    this.last_model.connect("items-changed", () => {
      this.set_status();
    });
    this._notes_box.connect("activate", this.activate_cb.bind(this));
    this._notes_box.set_factory(factory);
    this._notes_box.set_model(this.last_model);
    this._search_entry.connect("search-changed", () => {
      const query = this.query.toLowerCase();
      const old_query = this.old_query.toLowerCase();
      if (query.includes(old_query)) {
        filter.emit("changed", Gtk4.FilterChange.MORE_STRICT);
      } else if (old_query.includes(query)) {
        filter.emit("changed", Gtk4.FilterChange.LESS_STRICT);
      } else {
        filter.emit("changed", Gtk4.FilterChange.DIFFERENT);
      }
      this.old_query = query;
    });
    this.set_status();
    const popover = this._menu_button.get_popover();
    popover.add_child(new ThemeSelector(), "themeswitcher");
  }
  get query() {
    return this._search_entry.text.toLowerCase();
  }
  setup_cb(_factory, list_item) {
    const card = new StickyNoteCard(this);
    list_item.set_child(card);
  }
  bind_cb(_factory, list_item) {
    const card = list_item.get_child();
    const note = list_item.get_item();
    card.show_visible_image = note.open;
    card.connect("deleted", (_2) => this.emit("deleted", note.uuid));
    card.note = note;
    note.connect("notify::modified", () => {
      card.update_modified_label();
      this.sorter.changed(Gtk4.SorterChange.DIFFERENT);
    });
    note.connect("notify::open", (_2) => {
      card.show_visible_image = note.open;
    });
    note.connect("notify::style", () => {
      card.set_style(note.style);
    });
  }
  unbind_cb(_factory, _list_item) {
    const card = new StickyNoteCard(this);
    card.view.remove_listeners();
  }
  activate_cb(list, position) {
    var _a;
    const item = (_a = list.get_model()) == null ? void 0 : _a.get_item(position);
    if (!item)
      return;
    this.emit("note-activated", item.uuid);
  }
  set_status() {
    if (this.last_model.get_n_items() > 0) {
      this.set_visible_child(this._notes_box);
    } else {
      if (this.query) {
        this.set_visible_child(this._no_results);
      } else {
        this.set_visible_child(this._no_notes);
      }
    }
  }
  set_note_visible(uuid, visible) {
    const card = this.cards.find((card2) => card2.note.uuid === uuid);
    if (!card)
      return;
    card.show_visible_image = visible;
  }
  set_visible_child(child) {
    this._search.visible = child === this._notes_box || child === this._no_results;
    this._stack.set_visible_child(child);
  }
};
var StickyNotes = _StickyNotes;
(() => {
  GObject5.registerClass(
    {
      Template: "resource:///com/vixalien/sticky/ui/notes.ui",
      GTypeName: "StickyNotes",
      InternalChildren: [
        "search",
        "notes_box",
        "no_notes",
        "no_results",
        "search_entry",
        "scrolled",
        "menu_button",
        "stack"
      ],
      Signals: {
        "note-activated": {
          param_types: [GObject5.TYPE_STRING]
        },
        deleted: {
          param_types: [GObject5.TYPE_STRING]
        }
      }
    },
    _StickyNotes
  );
})();

// src/store.ts
import Gio2 from "gi://Gio";
import GLib3 from "gi://GLib";

// src/errors.ts
var StickyError = class {
  constructor(type, message) {
    this.message = message;
    this.type = type;
  }
};

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
  GLib3.build_filenamev([GLib3.get_user_data_dir(), pkg.name])
);
var NewNotesDir = Gio2.file_new_for_path(
  GLib3.build_filenamev([GLib3.get_user_data_dir(), pkg.name, "notes"])
);
var Notes = Gio2.file_new_for_path(
  GLib3.build_filenamev([NotesDir.get_path(), "notes.json"])
);
var load_file = (file) => {
  try {
    Notes.get_parent().make_directory_with_parents(null);
  } catch (e) {
    if (e instanceof GLib3.Error) {
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
    if (e instanceof GLib3.Error) {
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
    if (e instanceof GLib3.Error) {
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
    if (e instanceof GLib3.Error) {
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

// src/window.ts
import GObject7 from "gi://GObject";
import Adw5 from "gi://Adw";
import Gio3 from "gi://Gio";
import GLib4 from "gi://GLib";

// src/styleselector.ts
import GObject6 from "gi://GObject";
import Gtk5 from "gi://Gtk?version=4.0";
import Gdk2 from "gi://Gdk?version=4.0";
var { vprintf } = imports.format;
var provider = null;
var _StyleButton = class extends Gtk5.CheckButton {
  constructor(style, group) {
    const style_name = Style[style];
    const display_name = StyleNames.get(style);
    super({
      // focus_on_click: false,
      tooltip_text: vprintf(_("Switch to %s style"), [display_name]),
      width_request: 44,
      height_request: 44,
      hexpand: true,
      halign: Gtk5.Align.CENTER
    });
    if (group) {
      this.set_group(group);
    }
    this.style = style;
    this.set_css_classes([
      ...this.css_classes,
      `style-selector`,
      `style-${style_name}`
    ]);
  }
};
var StyleButton = _StyleButton;
(() => {
  GObject6.registerClass({}, _StyleButton);
})();
var props = {
  orientation: Gtk5.Orientation.HORIZONTAL,
  spacing: 12,
  hexpand: true
};
var _StyleSelector = class extends Gtk5.Box {
  constructor(params = {}) {
    var _a;
    super();
    this.box1 = new Gtk5.Box(props);
    this.box2 = new Gtk5.Box(props);
    this.box = new Gtk5.Box({
      orientation: Gtk5.Orientation.VERTICAL,
      spacing: 12
    });
    this.box.append(this.box1);
    this.box.append(this.box2);
    this.append(this.box);
    this._style = this.style = (_a = params.style) != null ? _a : 1 /* yellow */;
    this.build_styles();
    this.hexpand = true;
    if (!provider) {
      provider = new Gtk5.CssProvider();
      provider.load_from_resource(
        "/com/vixalien/sticky/style-selector.css"
      );
      Gtk5.StyleContext.add_provider_for_display(
        Gdk2.Display.get_default(),
        provider,
        Gtk5.STYLE_PROVIDER_PRIORITY_APPLICATION
      );
    }
  }
  get style() {
    return this._style;
  }
  set style(style) {
    if (this._style === style) {
      return;
    }
    this._style = style;
    this.notify("style");
    this.emit("style-changed", style);
  }
  build_styles() {
    let group = void 0;
    styles.forEach((style, i) => {
      const button = new StyleButton(style, group);
      button.active = style === this.style;
      button.connect("toggled", () => {
        if (button.active) {
          this.style = style;
        }
      });
      if (!group) {
        group = button;
      }
      (i < 4 ? this.box1 : this.box2).append(button);
    });
  }
};
var StyleSelector = _StyleSelector;
(() => {
  GObject6.registerClass({
    CssName: "styleselector",
    Properties: {
      style: GObject6.ParamSpec.string(
        "style",
        "Style",
        "The current style",
        GObject6.ParamFlags.READWRITE,
        "window"
      )
    },
    Signals: {
      "style-changed": {
        param_types: [GObject6.TYPE_UINT]
      }
    }
  }, _StyleSelector);
})();

// src/window.ts
var _Window = class extends Adw5.ApplicationWindow {
  constructor({ note, ...params }) {
    super(params);
    this.deleted = false;
    this.last_revealer = false;
    this.note = note;
    this.default_width = note.width;
    this.default_height = note.height;
    this.note.bind_property_full(
      "title",
      this,
      "title",
      GObject7.BindingFlags.SYNC_CREATE,
      (__, title) => {
        if (!title) {
          return [true, _("Sticky Note")];
        }
        return [true, title];
      },
      null
    );
    this.connect("close-request", () => {
      if (this.deleted)
        return;
      if (this.view.note && this.view.note.content.trim().length === 0) {
        this.application.delete_note(this.note.uuid);
        return;
      }
      const width = this.get_allocated_width();
      const height = this.get_allocated_height();
      if (width !== note.width) {
        this.note.width = width;
      }
      if (height !== note.height) {
        this.note.height = height;
      }
    });
    this.set_style(note.style, true);
    this.view = new WriteableStickyNote(note);
    this.view.connect("selection-changed", this.check_tags.bind(this));
    this.view.connect(
      "tag-toggle",
      (_view, tag, active) => {
        const button = this[`_${tag}_button`];
        if (!button)
          return;
        button.active = active;
      }
    );
    this.view.connect("link-selected", (_2, text) => {
      this.update_link(true, text);
    });
    this.view.connect("link-unselected", () => {
      this.update_link(false, "");
    });
    this._text.buffer = this.view.buffer;
    this.add_actions();
    this.selector = new StyleSelector({ style: note.style });
    this.selector.connect("style-changed", (_selector, style) => {
      this.set_style(style);
      this.note.style = style;
    });
    const popover = this._menu_button.get_popover();
    popover.add_child(this.selector, "notestyleswitcher");
  }
  get_style() {
    return this.selector.style;
  }
  update_link(selected, text) {
    if (selected) {
      const href = find(text)[0].href;
      this._action_button.action_target = GLib4.Variant.new_string(href);
    }
    if (this.last_revealer === selected)
      return;
    this.last_revealer = selected;
    this._action_revealer.reveal_child = selected;
    GLib4.timeout_add(
      GLib4.PRIORITY_DEFAULT,
      this._action_revealer.transition_duration,
      () => {
        const target = Adw5.PropertyAnimationTarget.new(
          this._text,
          "bottom_margin"
        );
        const animation = Adw5.TimedAnimation.new(
          this._text,
          this._text.bottom_margin,
          60 + (selected ? this._action_revealer.get_allocated_height() : 0),
          this._action_revealer.transition_duration,
          target
        );
        animation.play();
        return GLib4.SOURCE_REMOVE;
      }
    );
  }
  check_tags() {
    for (const [name, tag] of this.view.actions) {
      const button = this[`_${name}_button`];
      const active = this.view.has_tag(tag) !== false;
      if (active === button.active) {
        continue;
      }
      button.active = active;
    }
  }
  add_actions() {
    const delete_ = Gio3.SimpleAction.new("delete", null);
    delete_.connect("activate", () => this.delete());
    this.add_action(delete_);
    for (const [name, tag] of this.view.actions) {
      const action = Gio3.SimpleAction.new(name, null);
      action.connect("activate", () => this.view.apply_tag(tag));
      this.add_action(action);
    }
  }
  set_style(style, is_init = false) {
    for (const s of this._container.get_css_classes()) {
      if (s.startsWith("style-") && s !== `style-specifity`) {
        this._container.remove_css_class(s);
      }
    }
    this._container.add_css_class(`style-${Style[style]}`);
    if (!is_init)
      this.note.modified_date = /* @__PURE__ */ new Date();
  }
  delete() {
    confirm_delete(this, () => {
      this.deleted = true;
      this.emit("deleted", this.note.uuid);
      console.log("emitted deleted");
    });
  }
};
var Window = _Window;
(() => {
  GObject7.registerClass(
    {
      Template: "resource:///com/vixalien/sticky/ui/window.ui",
      GTypeName: "StickyNoteWindow",
      InternalChildren: [
        "container",
        "text",
        "bold_button",
        "underline_button",
        "italic_button",
        "strikethrough_button",
        "menu_button",
        "action_revealer",
        "action_button"
      ],
      Signals: {
        deleted: {
          param_types: [GObject7.TYPE_STRING]
        }
      }
    },
    _Window
  );
})();

// src/mirror.ts
import Gio4 from "gi://Gio";
import GLib5 from "gi://GLib";

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
    return Gio4.file_new_for_path(dirPath);
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
        Gio4.FileMonitorFlags.NONE,
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
        Gio4.FileCreateFlags.NONE,
        null
      );
    } catch (e) {
      console.error(`Failed to save note ${note.uuid} to mirror:`, e);
    } finally {
      if (path) {
        GLib5.timeout_add(GLib5.PRIORITY_DEFAULT, 500, () => {
          this.ignoreSet.delete(path);
          return GLib5.SOURCE_REMOVE;
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
        GLib5.timeout_add(GLib5.PRIORITY_DEFAULT, 500, () => {
          this.ignoreSet.delete(path);
          return GLib5.SOURCE_REMOVE;
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
    if (event === Gio4.FileMonitorEvent.CHANGED || event === Gio4.FileMonitorEvent.CHANGES_DONE_HINT || event === Gio4.FileMonitorEvent.CREATED) {
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
            existingNote.modified = GLib5.DateTime.new_from_iso8601(
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

// src/application.ts
var _Application = class extends Adw6.Application {
  constructor() {
    super({
      application_id: "com.vixalien.sticky",
      flags: Gio5.ApplicationFlags.DEFAULT_FLAGS
    });
    this.window = null;
    this.note_windows = [];
    this.mirror_manager = null;
    this.notes_list = Gio5.ListStore.new(Note.$gtype);
    this.open_new_note = false;
    this.show_all_notes = false;
    GLib6.set_application_name(_("Sticky Notes"));
    this.init_actions();
    try {
      const notes = load_notes();
      notes.forEach((note) => {
        note.connect("notify::modified", (_2, x) => {
          save_note(note);
        });
        note.connect("notify::open", () => {
          save_note(note);
        });
        this.notes_list.append(note);
      });
      this.sort_notes();
      this.mirror_manager = new MirrorManager(
        () => this.notes_array(),
        (note) => {
          this.attach_note_listeners(note);
          this.notes_list.append(note);
          save_note(note);
        }
      );
      this.notes_array().forEach((note) => {
        this.attach_note_listeners(note);
      });
    } catch (error) {
      console.error(error);
    }
    this.add_main_option(
      "all-notes",
      "a".charCodeAt(0),
      GLib6.OptionFlags.NONE,
      GLib6.OptionArg.NONE,
      "Show all notes",
      null
    );
    this.add_main_option(
      "version",
      "v".charCodeAt(0),
      GLib6.OptionFlags.NONE,
      GLib6.OptionArg.NONE,
      "Print version information and exit",
      null
    );
    this.add_main_option(
      "new-note",
      "n".charCodeAt(0),
      GLib6.OptionFlags.NONE,
      GLib6.OptionArg.NONE,
      "Open a new note",
      null
    );
    this.add_main_option(
      "if-open-note",
      "i".charCodeAt(0),
      GLib6.OptionFlags.NONE,
      GLib6.OptionArg.NONE,
      "Only show the app if there is atleast one open note",
      null
    );
    this.connect("handle-local-options", (_app, options) => {
      if (options.contains("version")) {
        print(pkg.version);
        return 0;
      } else if (options.contains("all-notes")) {
        this.show_all_notes = true;
      } else if (options.contains("new-note")) {
        this.open_new_note = true;
      } else if (options.contains("if-open-note")) {
        let open = false;
        this.foreach_note((note) => {
          open = open || note.open;
        });
        if (open == false) {
          console.log(
            "Sticky Notes not opening because the `-i` flag was passed and there are no open notes"
          );
          this.quit();
        }
      }
      return -1;
    });
    console.log("Storing Notes at: " + NewNotesDir.get_path());
  }
  sort_notes() {
    this.notes_list.sort((note1, note2) => {
      return note1.modified.compare(note2.modified);
    });
  }
  save() {
    const array = [];
    this.foreach_note((note) => {
      array.push(note);
    });
    return save_notes(array);
  }
  vfunc_shutdown() {
    this.save();
    super.vfunc_shutdown();
  }
  vfunc_activate() {
    let has_one_open = false;
    if (this.show_all_notes) {
      this.all_notes();
    } else if (this.open_new_note) {
      this.new_note();
    } else {
      if (settings.get_boolean("show-all-notes"))
        this.all_notes();
      this.foreach_note((note) => {
        if (note.open) {
          if (has_one_open == false)
            has_one_open = true;
          this.show_note(note.uuid);
        }
      });
      if (!has_one_open) {
        const last_open_note = this.notes_array().sort((a, b) => b.modified.compare(a.modified))[0];
        if (has_one_open) {
          this.show_note(last_open_note.uuid);
        } else {
          settings.set_boolean("show-all-notes", true);
          this.all_notes();
        }
      }
    }
  }
  is_note_open(uuid) {
    return this.note_windows.some((w) => w.note.uuid === uuid);
  }
  new_controller() {
    const controller = new Gtk6.ShortcutController();
    const add_shortcut = (fn, accels) => {
      const shortcut = new Gtk6.Shortcut({
        trigger: Gtk6.ShortcutTrigger.parse_string(accels.join("|")),
        // @ts-ignore bad types
        action: Gtk6.CallbackAction.new(() => {
          fn();
          return true;
        })
      });
      controller.add_shortcut(shortcut);
    };
    add_shortcut(this.cycle_linear.bind(this), [
      "<Primary>Page_Down",
      "<Primary>Tab",
      "<Primary>ISO_Left_Tab",
      "<Primary>KP_Tab"
    ]);
    add_shortcut(this.cycle_reverse.bind(this), [
      "<Primary>Page_Up",
      "<Primary><Shift>Tab",
      "<Primary><Shift>ISO_Left_Tab",
      "<Primary><Shift>KP_Tab"
    ]);
    return controller;
  }
  init_actions() {
    const quit_action = new Gio5.SimpleAction({ name: "quit" });
    quit_action.connect("activate", () => this.quit());
    this.add_action(quit_action);
    const show_about_action = new Gio5.SimpleAction({ name: "about" });
    show_about_action.connect("activate", () => this.show_about());
    this.add_action(show_about_action);
    const new_note = new Gio5.SimpleAction({ name: "new-note" });
    new_note.connect("activate", () => this.new_note());
    this.add_action(new_note);
    const all_notes = new Gio5.SimpleAction({ name: "all-notes" });
    all_notes.connect("activate", () => {
      GLib6.idle_add(GLib6.PRIORITY_DEFAULT, () => {
        this.all_notes();
        return GLib6.SOURCE_REMOVE;
      });
    });
    this.add_action(all_notes);
    const open_link = new Gio5.SimpleAction({
      name: "open-link",
      parameter_type: GLib6.VariantType.new("s")
    });
    open_link.connect("activate", (_2, parameter) => {
      if (!parameter)
        return;
      const [uri] = parameter.get_string();
      if (uri === "null")
        return;
      Gtk6.show_uri(
        this.get_active_window(),
        uri,
        Gdk3.CURRENT_TIME
      );
    });
    this.add_action(open_link);
    const cycle_linear = new Gio5.SimpleAction({ name: "cycle" });
    cycle_linear.connect("activate", () => this.cycle_linear());
    this.add_action(cycle_linear);
    const cycle_reverse = new Gio5.SimpleAction({ name: "cycle-reverse" });
    cycle_reverse.connect("activate", () => this.cycle_reverse());
    this.add_action(cycle_reverse);
    const save = new Gio5.SimpleAction({ name: "save" });
    save.connect("activate", () => this.save());
    this.add_action(save);
    const select_mirror_dir = new Gio5.SimpleAction({ name: "select-mirror-directory" });
    select_mirror_dir.connect("activate", () => this.select_mirror_directory());
    this.add_action(select_mirror_dir);
    this.add_action(settings.create_action("color-scheme"));
    this.set_accels_for_action("app.quit", ["<Primary>q"]);
    this.set_accels_for_action("app.new-note", ["<Primary>n"]);
    this.set_accels_for_action("app.all-notes", ["<Primary>h"]);
    this.set_accels_for_action("app.save", ["<Primary>s"]);
    this.set_accels_for_action("win.delete", ["<Primary>d"]);
    this.set_accels_for_action("win.open-primary-menu", ["F10"]);
    this.set_accels_for_action("win.show-help-overlay", ["<Primary>question"]);
    this.set_accels_for_action("window.close", ["<Primary>w"]);
    this.set_accels_for_action("win.bold", ["<Primary>b"]);
    this.set_accels_for_action("win.italic", ["<Primary>i"]);
    this.set_accels_for_action("win.underline", ["<Primary>u"]);
    this.set_accels_for_action("win.strikethrough", ["<Primary>t"]);
  }
  get_note_window(uuid) {
    return this.note_windows.find((w) => w.note.uuid === uuid);
  }
  cycle(reverse = false) {
    var _a, _b;
    this.sort_notes();
    if (this.notes_list.n_items <= 0)
      return;
    const filter = Gtk6.CustomFilter.new((item) => {
      const note = item;
      return this.is_note_open(note.uuid);
    });
    const notes = Gtk6.FilterListModel.new(
      this.notes_list,
      filter
    );
    const presented = this.active_window;
    if (presented instanceof StickyNotes) {
      (_a = this.get_note_window(
        notes.get_item(reverse ? notes.n_items - 1 : 0).uuid
      )) == null ? void 0 : _a.present();
    } else if (presented instanceof Window) {
      let id;
      for (id = 0; id < notes.n_items; id++) {
        if (notes.get_item(id).uuid === presented.note.uuid) {
          break;
        }
      }
      const focus_id = id + (reverse ? -1 : 1);
      if (focus_id < 0 || focus_id >= notes.n_items) {
        this.all_notes();
      } else {
        (_b = this.get_note_window(notes.get_item(focus_id).uuid)) == null ? void 0 : _b.present();
      }
    }
  }
  cycle_linear() {
    return this.cycle(false);
  }
  cycle_reverse() {
    return this.cycle(true);
  }
  show_about() {
    const aboutParams = {
      transient_for: this.active_window,
      application_name: _("Sticky Notes"),
      application_icon: pkg.name,
      developer_name: "Angelo Verlain",
      version: pkg.version,
      developers: [
        "Angelo Verlain <hey@vixalien.com>",
        "Christopher Davis <christopherdavis@gnome.org>"
      ],
      designers: [
        "David Lapshin"
      ],
      // TRANSLATORS: eg. 'Translator Name <your.email@domain.com>' or 'Translator Name https://website.example'
      translator_credits: _("translator-credits"),
      copyright: "\xA9 2023 Angelo Verlain, Christopher Davis",
      license_type: Gtk6.License.MIT_X11,
      website: "https://github.com/vixalien/sticky",
      issue_url: "https://github.com/vixalien/sticky/issues"
    };
    const aboutWindow = new Adw6.AboutWindow(aboutParams);
    aboutWindow.present();
  }
  notes_array() {
    const notes = [];
    this.foreach_note((note) => {
      notes.push(note);
    });
    return notes;
  }
  foreach_note(cb) {
    let id = 0;
    while (id < this.notes_list.n_items) {
      cb(this.notes_list.get_item(id), id);
      id++;
    }
  }
  find_note_id(uuid) {
    return this.notes_array().findIndex((note) => note.uuid === uuid);
  }
  find_note(uuid) {
    return this.notes_array().find((note) => note.uuid === uuid);
  }
  find_open_window(uuid) {
    const win = this.note_windows.find((window) => window.note.uuid === uuid);
    return win != null ? win : void 0;
  }
  find_open_note(uuid) {
    var _a, _b;
    return (_b = (_a = this.find_open_window(uuid)) == null ? void 0 : _a.note) != null ? _b : void 0;
  }
  changed_note(uuid) {
    const found_id = this.find_note_id(uuid);
    const found_note = this.find_open_note(uuid);
    if (found_id !== void 0 && found_note) {
    }
  }
  attach_note_listeners(note) {
    const syncToMirror = () => {
      if (this.mirror_manager) {
        this.mirror_manager.save_note(note);
      }
    };
    note.connect("notify::content", syncToMirror);
    note.connect("notify::title", syncToMirror);
    note.connect("notify::style", syncToMirror);
    note.connect("notify::tag_list", syncToMirror);
    note.connect("notify::open", syncToMirror);
    note.connect("notify::modified", syncToMirror);
  }
  select_mirror_directory() {
    const parent = this.get_active_window();
    const dialog = Gtk6.FileChooserNative.new(
      _("Select Mirror Directory"),
      parent,
      Gtk6.FileChooserAction.SELECT_FOLDER,
      _("Select"),
      _("Cancel")
    );
    const currentDir = settings.get_string("mirror-directory");
    if (currentDir) {
      dialog.set_file(Gio5.file_new_for_path(currentDir));
    }
    dialog.connect("response", (_dialog, response) => {
      if (response === Gtk6.ResponseType.ACCEPT) {
        const file = dialog.get_file();
        if (file) {
          const path = file.get_path();
          if (path) {
            settings.set_string("mirror-directory", path);
            settings.set_boolean("mirror-enabled", true);
            if (this.mirror_manager) {
              this.mirror_manager.setup();
            }
          }
        }
      }
      dialog.destroy();
    });
    dialog.show();
  }
  delete_note(uuid) {
    const found_id = this.find_note_id(uuid);
    const found_window = this.find_open_window(uuid);
    if (found_id !== void 0)
      this.notes_list.splice(found_id, 1, []);
    if (found_window)
      found_window.close();
    delete_note(uuid);
    if (this.mirror_manager) {
      this.mirror_manager.delete_note(uuid);
    }
  }
  all_notes() {
    if (!this.window) {
      this.window = new StickyNotes({
        application: this
      });
      this.window.connect("note-activated", (_2, uuid) => {
        this.show_note(uuid);
      });
      this.window.connect("deleted", (_2, uuid) => {
        this.delete_note(uuid);
      });
      this.window.connect("close-request", () => {
        this.window = null;
        settings.set_boolean("show-all-notes", false);
      });
      this.window.add_controller(this.new_controller());
    }
    settings.set_boolean("show-all-notes", true);
    this.window.present();
  }
  new_note() {
    const note = Note.generate();
    note.connect("notify::modified", () => {
      save_note(note);
    });
    note.connect("notify::open", () => {
      save_note(note);
    });
    this.attach_note_listeners(note);
    this.notes_list.append(note);
    save_note(note);
    if (this.mirror_manager) {
      this.mirror_manager.save_note(note);
    }
    this.show_note(note.uuid);
  }
  show_note(uuid) {
    const note = this.find_note(uuid);
    if (!note)
      return;
    const note_window = this.note_windows.find(
      (window2) => window2.note.uuid === uuid
    );
    if (note_window) {
      note_window.present();
      return;
    }
    const window = new Window({
      application: this,
      note
    });
    this.note_windows.push(window);
    window.add_controller(this.new_controller());
    window.connect("close-request", () => {
      var _a;
      if (!(this.note_windows.length === 1 && !this.window)) {
        note.open = false;
      }
      this.note_windows = this.note_windows.filter((win) => win !== window);
      (_a = this.window) == null ? void 0 : _a.set_note_visible(note.uuid, false);
      return false;
    });
    window.connect("deleted", (_2, uuid2) => {
      this.delete_note(uuid2);
    });
    if (note.open === false)
      note.open = true;
    window.present();
  }
  vfunc_startup() {
    super.vfunc_startup();
    const style_manager = Adw6.StyleManager.get_default();
    function setColorScheme() {
      const color_scheme = settings.get_int("color-scheme");
      style_manager.set_color_scheme(color_scheme);
    }
    setColorScheme();
    settings.connect("changed::color-scheme", setColorScheme);
  }
};
var Application = _Application;
(() => {
  GObject8.registerClass(_Application);
})();
export {
  Application
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2FwcGxpY2F0aW9uLnRzIiwgIi4uL3NyYy9ub3Rlcy50cyIsICIuLi9zcmMvY2FyZC50cyIsICIuLi9zcmMvdXRpbC50cyIsICIuLi9zcmMvdmlldy50cyIsICIuLi9ub2RlX21vZHVsZXMvbGlua2lmeWpzL2Rpc3QvbGlua2lmeS5lcy5qcyIsICIuLi9zcmMvdGhlbWVzZWxlY3Rvci50cyIsICIuLi9zcmMvc3RvcmUudHMiLCAiLi4vc3JjL2Vycm9ycy50cyIsICIuLi9zcmMvd2luZG93LnRzIiwgIi4uL3NyYy9zdHlsZXNlbGVjdG9yLnRzIiwgIi4uL3NyYy9taXJyb3IudHMiLCAiLi4vc3JjL21hcmtkb3duLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKiBNSVQgTGljZW5zZVxuICpcbiAqIENvcHlyaWdodCAoYykgMjAyMyBBbmdlbG8gVmVybGFpbiwgQ2hyaXMgRGF2aXNcbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gKiBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAqIFNPRlRXQVJFLlxuICpcbiAqIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBNSVRcbiAqL1xuXG5pbXBvcnQgR09iamVjdCBmcm9tIFwiZ2k6Ly9HT2JqZWN0XCI7XG5pbXBvcnQgR2lvIGZyb20gXCJnaTovL0dpb1wiO1xuaW1wb3J0IEFkdyBmcm9tIFwiZ2k6Ly9BZHdcIjtcbmltcG9ydCBHTGliIGZyb20gXCJnaTovL0dMaWJcIjtcbmltcG9ydCBHdGsgZnJvbSBcImdpOi8vR3RrP3ZlcnNpb249NC4wXCI7XG5pbXBvcnQgR2RrIGZyb20gXCJnaTovL0dkaz92ZXJzaW9uPTQuMFwiO1xuXG5pbXBvcnQgeyBTdGlja3lOb3RlcyB9IGZyb20gXCIuL25vdGVzLmpzXCI7XG5pbXBvcnQgeyBOb3RlLCBzZXR0aW5ncyB9IGZyb20gXCIuL3V0aWwuanNcIjtcbmltcG9ydCB7XG4gIGRlbGV0ZV9ub3RlLFxuICBsb2FkX25vdGVzLFxuICBOZXdOb3Rlc0RpcixcbiAgc2F2ZV9ub3RlLFxuICBzYXZlX25vdGVzLFxufSBmcm9tIFwiLi9zdG9yZS5qc1wiO1xuaW1wb3J0IHsgV2luZG93IH0gZnJvbSBcIi4vd2luZG93LmpzXCI7XG5pbXBvcnQgeyBNaXJyb3JNYW5hZ2VyIH0gZnJvbSBcIi4vbWlycm9yLmpzXCI7XG5cbmV4cG9ydCBjbGFzcyBBcHBsaWNhdGlvbiBleHRlbmRzIEFkdy5BcHBsaWNhdGlvbiB7XG4gIHByaXZhdGUgd2luZG93OiBTdGlja3lOb3RlcyB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIG5vdGVfd2luZG93czogV2luZG93W10gPSBbXTtcbiAgcHJpdmF0ZSBtaXJyb3JfbWFuYWdlcjogTWlycm9yTWFuYWdlciB8IG51bGwgPSBudWxsO1xuXG4gIHN0YXRpYyB7XG4gICAgR09iamVjdC5yZWdpc3RlckNsYXNzKHRoaXMpO1xuICB9XG5cbiAgbm90ZXNfbGlzdCA9IEdpby5MaXN0U3RvcmUubmV3KE5vdGUuJGd0eXBlKSBhcyBHaW8uTGlzdFN0b3JlPE5vdGU+O1xuXG4gIG9wZW5fbmV3X25vdGUgPSBmYWxzZTtcbiAgc2hvd19hbGxfbm90ZXMgPSBmYWxzZTtcblxuICBzb3J0X25vdGVzKCkge1xuICAgIHRoaXMubm90ZXNfbGlzdC5zb3J0KChub3RlMTogTm90ZSwgbm90ZTI6IE5vdGUpID0+IHtcbiAgICAgIHJldHVybiBub3RlMS5tb2RpZmllZC5jb21wYXJlKG5vdGUyLm1vZGlmaWVkKTtcbiAgICB9KTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKHtcbiAgICAgIGFwcGxpY2F0aW9uX2lkOiBcImNvbS52aXhhbGllbi5zdGlja3lcIixcbiAgICAgIGZsYWdzOiBHaW8uQXBwbGljYXRpb25GbGFncy5ERUZBVUxUX0ZMQUdTLFxuICAgIH0pO1xuXG4gICAgR0xpYi5zZXRfYXBwbGljYXRpb25fbmFtZShfKFwiU3RpY2t5IE5vdGVzXCIpKTtcblxuICAgIHRoaXMuaW5pdF9hY3Rpb25zKCk7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3Qgbm90ZXMgPSBsb2FkX25vdGVzKCk7XG5cbiAgICAgIG5vdGVzLmZvckVhY2goKG5vdGUpID0+IHtcbiAgICAgICAgbm90ZS5jb25uZWN0KFwibm90aWZ5Ojptb2RpZmllZFwiLCAoXywgeCkgPT4ge1xuICAgICAgICAgIHNhdmVfbm90ZShub3RlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gY2hhbmdpbmcgb3BlbiBkb2Vzbid0IGNoYW5nZSBtb2RpZmllZFxuICAgICAgICBub3RlLmNvbm5lY3QoXCJub3RpZnk6Om9wZW5cIiwgKCkgPT4ge1xuICAgICAgICAgIHNhdmVfbm90ZShub3RlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5ub3Rlc19saXN0LmFwcGVuZChub3RlKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnNvcnRfbm90ZXMoKTtcblxuICAgICAgdGhpcy5taXJyb3JfbWFuYWdlciA9IG5ldyBNaXJyb3JNYW5hZ2VyKFxuICAgICAgICAoKSA9PiB0aGlzLm5vdGVzX2FycmF5KCksXG4gICAgICAgIChub3RlKSA9PiB7XG4gICAgICAgICAgdGhpcy5hdHRhY2hfbm90ZV9saXN0ZW5lcnMobm90ZSk7XG4gICAgICAgICAgdGhpcy5ub3Rlc19saXN0LmFwcGVuZChub3RlKTtcbiAgICAgICAgICBzYXZlX25vdGUobm90ZSk7XG4gICAgICAgIH0sXG4gICAgICApO1xuXG4gICAgICB0aGlzLm5vdGVzX2FycmF5KCkuZm9yRWFjaCgobm90ZSkgPT4ge1xuICAgICAgICB0aGlzLmF0dGFjaF9ub3RlX2xpc3RlbmVycyhub3RlKTtcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGVycm9yIGFzIGFueSk7XG4gICAgfVxuXG4gICAgdGhpcy5hZGRfbWFpbl9vcHRpb24oXG4gICAgICBcImFsbC1ub3Rlc1wiLFxuICAgICAgXCJhXCIuY2hhckNvZGVBdCgwKSxcbiAgICAgIEdMaWIuT3B0aW9uRmxhZ3MuTk9ORSxcbiAgICAgIEdMaWIuT3B0aW9uQXJnLk5PTkUsXG4gICAgICBcIlNob3cgYWxsIG5vdGVzXCIsXG4gICAgICBudWxsLFxuICAgICk7XG5cbiAgICB0aGlzLmFkZF9tYWluX29wdGlvbihcbiAgICAgIFwidmVyc2lvblwiLFxuICAgICAgXCJ2XCIuY2hhckNvZGVBdCgwKSxcbiAgICAgIEdMaWIuT3B0aW9uRmxhZ3MuTk9ORSxcbiAgICAgIEdMaWIuT3B0aW9uQXJnLk5PTkUsXG4gICAgICBcIlByaW50IHZlcnNpb24gaW5mb3JtYXRpb24gYW5kIGV4aXRcIixcbiAgICAgIG51bGwsXG4gICAgKTtcblxuICAgIHRoaXMuYWRkX21haW5fb3B0aW9uKFxuICAgICAgXCJuZXctbm90ZVwiLFxuICAgICAgXCJuXCIuY2hhckNvZGVBdCgwKSxcbiAgICAgIEdMaWIuT3B0aW9uRmxhZ3MuTk9ORSxcbiAgICAgIEdMaWIuT3B0aW9uQXJnLk5PTkUsXG4gICAgICBcIk9wZW4gYSBuZXcgbm90ZVwiLFxuICAgICAgbnVsbCxcbiAgICApO1xuXG4gICAgdGhpcy5hZGRfbWFpbl9vcHRpb24oXG4gICAgICBcImlmLW9wZW4tbm90ZVwiLFxuICAgICAgXCJpXCIuY2hhckNvZGVBdCgwKSxcbiAgICAgIEdMaWIuT3B0aW9uRmxhZ3MuTk9ORSxcbiAgICAgIEdMaWIuT3B0aW9uQXJnLk5PTkUsXG4gICAgICBcIk9ubHkgc2hvdyB0aGUgYXBwIGlmIHRoZXJlIGlzIGF0bGVhc3Qgb25lIG9wZW4gbm90ZVwiLFxuICAgICAgbnVsbCxcbiAgICApO1xuXG4gICAgdGhpcy5jb25uZWN0KFwiaGFuZGxlLWxvY2FsLW9wdGlvbnNcIiwgKF9hcHAsIG9wdGlvbnM6IEdMaWIuVmFyaWFudERpY3QpID0+IHtcbiAgICAgIGlmIChvcHRpb25zLmNvbnRhaW5zKFwidmVyc2lvblwiKSkge1xuICAgICAgICBwcmludChwa2cudmVyc2lvbik7XG4gICAgICAgIC8qIHF1aXQgdGhlIGludm9rZWQgcHJvY2VzcyBhZnRlciBwcmludGluZyB0aGUgdmVyc2lvbiBudW1iZXJcbiAgICAgICAgICogbGVhdmluZyB0aGUgcnVubmluZyBpbnN0YW5jZSB1bmFmZmVjdGVkXG4gICAgICAgICAqL1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5jb250YWlucyhcImFsbC1ub3Rlc1wiKSkge1xuICAgICAgICB0aGlzLnNob3dfYWxsX25vdGVzID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5jb250YWlucyhcIm5ldy1ub3RlXCIpKSB7XG4gICAgICAgIHRoaXMub3Blbl9uZXdfbm90ZSA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKG9wdGlvbnMuY29udGFpbnMoXCJpZi1vcGVuLW5vdGVcIikpIHtcbiAgICAgICAgbGV0IG9wZW4gPSBmYWxzZTtcblxuICAgICAgICB0aGlzLmZvcmVhY2hfbm90ZSgobm90ZSkgPT4ge1xuICAgICAgICAgIG9wZW4gPSBvcGVuIHx8IG5vdGUub3BlbjtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKG9wZW4gPT0gZmFsc2UpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgIFwiU3RpY2t5IE5vdGVzIG5vdCBvcGVuaW5nIGJlY2F1c2UgdGhlIGAtaWAgZmxhZyB3YXMgcGFzc2VkIGFuZCB0aGVyZSBhcmUgbm8gb3BlbiBub3Rlc1wiLFxuICAgICAgICAgICk7XG4gICAgICAgICAgdGhpcy5xdWl0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiAtMTtcbiAgICB9KTtcblxuICAgIGNvbnNvbGUubG9nKFwiU3RvcmluZyBOb3RlcyBhdDogXCIgKyBOZXdOb3Rlc0Rpci5nZXRfcGF0aCgpKTtcbiAgfVxuXG4gIHNhdmUoKSB7XG4gICAgY29uc3QgYXJyYXk6IE5vdGVbXSA9IFtdO1xuXG4gICAgdGhpcy5mb3JlYWNoX25vdGUoKG5vdGUpID0+IHtcbiAgICAgIGFycmF5LnB1c2gobm90ZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gc2F2ZV9ub3RlcyhhcnJheSk7XG4gIH1cblxuICBwdWJsaWMgdmZ1bmNfc2h1dGRvd24oKSB7XG4gICAgdGhpcy5zYXZlKCk7XG5cbiAgICBzdXBlci52ZnVuY19zaHV0ZG93bigpO1xuICB9XG5cbiAgcHVibGljIHZmdW5jX2FjdGl2YXRlKCkge1xuICAgIC8vIHRoaXMgaXMgdXNlZCB0byB0cmFjayBpZiB0aGVyZSBpcyBhdGxlYXN0IG9uZSB3aW5kb3cgb3Blbi4gaWQgdGhlcmUgaXNuJ3QsXG4gICAgLy8gd2Ugc2hvdyB0aGUgYWxsX25vdGVzXG4gICAgbGV0IGhhc19vbmVfb3BlbiA9IGZhbHNlO1xuXG4gICAgaWYgKHRoaXMuc2hvd19hbGxfbm90ZXMpIHtcbiAgICAgIHRoaXMuYWxsX25vdGVzKCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLm9wZW5fbmV3X25vdGUpIHtcbiAgICAgIHRoaXMubmV3X25vdGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHNldHRpbmdzLmdldF9ib29sZWFuKFwic2hvdy1hbGwtbm90ZXNcIikpIHRoaXMuYWxsX25vdGVzKCk7XG5cbiAgICAgIHRoaXMuZm9yZWFjaF9ub3RlKChub3RlKSA9PiB7XG4gICAgICAgIGlmIChub3RlLm9wZW4pIHtcbiAgICAgICAgICBpZiAoaGFzX29uZV9vcGVuID09IGZhbHNlKSBoYXNfb25lX29wZW4gPSB0cnVlO1xuICAgICAgICAgIHRoaXMuc2hvd19ub3RlKG5vdGUudXVpZCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAoIWhhc19vbmVfb3Blbikge1xuICAgICAgICBjb25zdCBsYXN0X29wZW5fbm90ZSA9IHRoaXMubm90ZXNfYXJyYXkoKVxuICAgICAgICAgIC5zb3J0KChhLCBiKSA9PiBiLm1vZGlmaWVkLmNvbXBhcmUoYS5tb2RpZmllZCkpWzBdO1xuXG4gICAgICAgIGlmIChoYXNfb25lX29wZW4pIHtcbiAgICAgICAgICB0aGlzLnNob3dfbm90ZShsYXN0X29wZW5fbm90ZS51dWlkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZXR0aW5ncy5zZXRfYm9vbGVhbihcInNob3ctYWxsLW5vdGVzXCIsIHRydWUpO1xuICAgICAgICAgIHRoaXMuYWxsX25vdGVzKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpc19ub3RlX29wZW4odXVpZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMubm90ZV93aW5kb3dzLnNvbWUoKHc6IFdpbmRvdykgPT4gdy5ub3RlLnV1aWQgPT09IHV1aWQpO1xuICB9XG5cbiAgbmV3X2NvbnRyb2xsZXIoKSB7XG4gICAgY29uc3QgY29udHJvbGxlciA9IG5ldyBHdGsuU2hvcnRjdXRDb250cm9sbGVyKCk7XG5cbiAgICBjb25zdCBhZGRfc2hvcnRjdXQgPSAoZm46ICgpID0+IHZvaWQsIGFjY2Vsczogc3RyaW5nW10pID0+IHtcbiAgICAgIGNvbnN0IHNob3J0Y3V0ID0gbmV3IEd0ay5TaG9ydGN1dCh7XG4gICAgICAgIHRyaWdnZXI6IEd0ay5TaG9ydGN1dFRyaWdnZXIucGFyc2Vfc3RyaW5nKGFjY2Vscy5qb2luKFwifFwiKSksXG4gICAgICAgIC8vIEB0cy1pZ25vcmUgYmFkIHR5cGVzXG4gICAgICAgIGFjdGlvbjogR3RrLkNhbGxiYWNrQWN0aW9uLm5ldygoKSA9PiB7XG4gICAgICAgICAgZm4oKTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSksXG4gICAgICB9KTtcbiAgICAgIGNvbnRyb2xsZXIuYWRkX3Nob3J0Y3V0KHNob3J0Y3V0KTtcbiAgICB9O1xuXG4gICAgYWRkX3Nob3J0Y3V0KHRoaXMuY3ljbGVfbGluZWFyLmJpbmQodGhpcyksIFtcbiAgICAgIFwiPFByaW1hcnk+UGFnZV9Eb3duXCIsXG4gICAgICBcIjxQcmltYXJ5PlRhYlwiLFxuICAgICAgXCI8UHJpbWFyeT5JU09fTGVmdF9UYWJcIixcbiAgICAgIFwiPFByaW1hcnk+S1BfVGFiXCIsXG4gICAgXSk7XG4gICAgYWRkX3Nob3J0Y3V0KHRoaXMuY3ljbGVfcmV2ZXJzZS5iaW5kKHRoaXMpLCBbXG4gICAgICBcIjxQcmltYXJ5PlBhZ2VfVXBcIixcbiAgICAgIFwiPFByaW1hcnk+PFNoaWZ0PlRhYlwiLFxuICAgICAgXCI8UHJpbWFyeT48U2hpZnQ+SVNPX0xlZnRfVGFiXCIsXG4gICAgICBcIjxQcmltYXJ5PjxTaGlmdD5LUF9UYWJcIixcbiAgICBdKTtcblxuICAgIHJldHVybiBjb250cm9sbGVyO1xuICB9XG5cbiAgaW5pdF9hY3Rpb25zKCkge1xuICAgIGNvbnN0IHF1aXRfYWN0aW9uID0gbmV3IEdpby5TaW1wbGVBY3Rpb24oeyBuYW1lOiBcInF1aXRcIiB9KTtcbiAgICBxdWl0X2FjdGlvbi5jb25uZWN0KFwiYWN0aXZhdGVcIiwgKCkgPT4gdGhpcy5xdWl0KCkpO1xuICAgIHRoaXMuYWRkX2FjdGlvbihxdWl0X2FjdGlvbik7XG5cbiAgICBjb25zdCBzaG93X2Fib3V0X2FjdGlvbiA9IG5ldyBHaW8uU2ltcGxlQWN0aW9uKHsgbmFtZTogXCJhYm91dFwiIH0pO1xuICAgIHNob3dfYWJvdXRfYWN0aW9uLmNvbm5lY3QoXCJhY3RpdmF0ZVwiLCAoKSA9PiB0aGlzLnNob3dfYWJvdXQoKSk7XG4gICAgdGhpcy5hZGRfYWN0aW9uKHNob3dfYWJvdXRfYWN0aW9uKTtcblxuICAgIGNvbnN0IG5ld19ub3RlID0gbmV3IEdpby5TaW1wbGVBY3Rpb24oeyBuYW1lOiBcIm5ldy1ub3RlXCIgfSk7XG4gICAgbmV3X25vdGUuY29ubmVjdChcImFjdGl2YXRlXCIsICgpID0+IHRoaXMubmV3X25vdGUoKSk7XG4gICAgdGhpcy5hZGRfYWN0aW9uKG5ld19ub3RlKTtcblxuICAgIGNvbnN0IGFsbF9ub3RlcyA9IG5ldyBHaW8uU2ltcGxlQWN0aW9uKHsgbmFtZTogXCJhbGwtbm90ZXNcIiB9KTtcbiAgICBhbGxfbm90ZXMuY29ubmVjdChcImFjdGl2YXRlXCIsICgpID0+IHtcbiAgICAgIEdMaWIuaWRsZV9hZGQoR0xpYi5QUklPUklUWV9ERUZBVUxULCAoKSA9PiB7XG4gICAgICAgIHRoaXMuYWxsX25vdGVzKCk7XG4gICAgICAgIHJldHVybiBHTGliLlNPVVJDRV9SRU1PVkU7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICB0aGlzLmFkZF9hY3Rpb24oYWxsX25vdGVzKTtcblxuICAgIGNvbnN0IG9wZW5fbGluayA9IG5ldyBHaW8uU2ltcGxlQWN0aW9uKHtcbiAgICAgIG5hbWU6IFwib3Blbi1saW5rXCIsXG4gICAgICBwYXJhbWV0ZXJfdHlwZTogR0xpYi5WYXJpYW50VHlwZS5uZXcoXCJzXCIpLFxuICAgIH0pO1xuICAgIG9wZW5fbGluay5jb25uZWN0KFwiYWN0aXZhdGVcIiwgKF8sIHBhcmFtZXRlcikgPT4ge1xuICAgICAgaWYgKCFwYXJhbWV0ZXIpIHJldHVybjtcbiAgICAgIGNvbnN0IFt1cmldID0gcGFyYW1ldGVyLmdldF9zdHJpbmcoKTtcblxuICAgICAgaWYgKHVyaSA9PT0gXCJudWxsXCIpIHJldHVybjtcbiAgICAgIEd0ay5zaG93X3VyaShcbiAgICAgICAgdGhpcy5nZXRfYWN0aXZlX3dpbmRvdygpLFxuICAgICAgICB1cmksXG4gICAgICAgIEdkay5DVVJSRU5UX1RJTUUsXG4gICAgICApO1xuICAgIH0pO1xuICAgIHRoaXMuYWRkX2FjdGlvbihvcGVuX2xpbmspO1xuXG4gICAgY29uc3QgY3ljbGVfbGluZWFyID0gbmV3IEdpby5TaW1wbGVBY3Rpb24oeyBuYW1lOiBcImN5Y2xlXCIgfSk7XG4gICAgY3ljbGVfbGluZWFyLmNvbm5lY3QoXCJhY3RpdmF0ZVwiLCAoKSA9PiB0aGlzLmN5Y2xlX2xpbmVhcigpKTtcbiAgICB0aGlzLmFkZF9hY3Rpb24oY3ljbGVfbGluZWFyKTtcblxuICAgIGNvbnN0IGN5Y2xlX3JldmVyc2UgPSBuZXcgR2lvLlNpbXBsZUFjdGlvbih7IG5hbWU6IFwiY3ljbGUtcmV2ZXJzZVwiIH0pO1xuICAgIGN5Y2xlX3JldmVyc2UuY29ubmVjdChcImFjdGl2YXRlXCIsICgpID0+IHRoaXMuY3ljbGVfcmV2ZXJzZSgpKTtcbiAgICB0aGlzLmFkZF9hY3Rpb24oY3ljbGVfcmV2ZXJzZSk7XG5cbiAgICBjb25zdCBzYXZlID0gbmV3IEdpby5TaW1wbGVBY3Rpb24oeyBuYW1lOiBcInNhdmVcIiB9KTtcbiAgICBzYXZlLmNvbm5lY3QoXCJhY3RpdmF0ZVwiLCAoKSA9PiB0aGlzLnNhdmUoKSk7XG4gICAgdGhpcy5hZGRfYWN0aW9uKHNhdmUpO1xuXG4gICAgY29uc3Qgc2VsZWN0X21pcnJvcl9kaXIgPSBuZXcgR2lvLlNpbXBsZUFjdGlvbih7IG5hbWU6IFwic2VsZWN0LW1pcnJvci1kaXJlY3RvcnlcIiB9KTtcbiAgICBzZWxlY3RfbWlycm9yX2Rpci5jb25uZWN0KFwiYWN0aXZhdGVcIiwgKCkgPT4gdGhpcy5zZWxlY3RfbWlycm9yX2RpcmVjdG9yeSgpKTtcbiAgICB0aGlzLmFkZF9hY3Rpb24oc2VsZWN0X21pcnJvcl9kaXIpO1xuXG4gICAgdGhpcy5hZGRfYWN0aW9uKHNldHRpbmdzLmNyZWF0ZV9hY3Rpb24oXCJjb2xvci1zY2hlbWVcIikpO1xuXG4gICAgdGhpcy5zZXRfYWNjZWxzX2Zvcl9hY3Rpb24oXCJhcHAucXVpdFwiLCBbXCI8UHJpbWFyeT5xXCJdKTtcbiAgICB0aGlzLnNldF9hY2NlbHNfZm9yX2FjdGlvbihcImFwcC5uZXctbm90ZVwiLCBbXCI8UHJpbWFyeT5uXCJdKTtcbiAgICB0aGlzLnNldF9hY2NlbHNfZm9yX2FjdGlvbihcImFwcC5hbGwtbm90ZXNcIiwgW1wiPFByaW1hcnk+aFwiXSk7XG4gICAgLy8gdGhpcy5zZXRfYWNjZWxzX2Zvcl9hY3Rpb24oXCJhcHAuY3ljbGVcIiwgW1wiPFByaW1hcnk+PFNoaWZ0PmFcIl0pO1xuICAgIC8vIHRoaXMuc2V0X2FjY2Vsc19mb3JfYWN0aW9uKFwiYXBwLmN5Y2xlLXJldmVyc2VcIiwgW1wiPFByaW1hcnk+PFNoaWZ0PmJcIl0pO1xuICAgIHRoaXMuc2V0X2FjY2Vsc19mb3JfYWN0aW9uKFwiYXBwLnNhdmVcIiwgW1wiPFByaW1hcnk+c1wiXSk7XG4gICAgdGhpcy5zZXRfYWNjZWxzX2Zvcl9hY3Rpb24oXCJ3aW4uZGVsZXRlXCIsIFtcIjxQcmltYXJ5PmRcIl0pO1xuXG4gICAgdGhpcy5zZXRfYWNjZWxzX2Zvcl9hY3Rpb24oXCJ3aW4ub3Blbi1wcmltYXJ5LW1lbnVcIiwgW1wiRjEwXCJdKTtcbiAgICB0aGlzLnNldF9hY2NlbHNfZm9yX2FjdGlvbihcIndpbi5zaG93LWhlbHAtb3ZlcmxheVwiLCBbXCI8UHJpbWFyeT5xdWVzdGlvblwiXSk7XG4gICAgdGhpcy5zZXRfYWNjZWxzX2Zvcl9hY3Rpb24oXCJ3aW5kb3cuY2xvc2VcIiwgW1wiPFByaW1hcnk+d1wiXSk7XG5cbiAgICB0aGlzLnNldF9hY2NlbHNfZm9yX2FjdGlvbihcIndpbi5ib2xkXCIsIFtcIjxQcmltYXJ5PmJcIl0pO1xuICAgIHRoaXMuc2V0X2FjY2Vsc19mb3JfYWN0aW9uKFwid2luLml0YWxpY1wiLCBbXCI8UHJpbWFyeT5pXCJdKTtcbiAgICB0aGlzLnNldF9hY2NlbHNfZm9yX2FjdGlvbihcIndpbi51bmRlcmxpbmVcIiwgW1wiPFByaW1hcnk+dVwiXSk7XG4gICAgdGhpcy5zZXRfYWNjZWxzX2Zvcl9hY3Rpb24oXCJ3aW4uc3RyaWtldGhyb3VnaFwiLCBbXCI8UHJpbWFyeT50XCJdKTtcbiAgfVxuXG4gIGdldF9ub3RlX3dpbmRvdyh1dWlkOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5ub3RlX3dpbmRvd3MuZmluZCgodykgPT4gdy5ub3RlLnV1aWQgPT09IHV1aWQpO1xuICB9XG5cbiAgY3ljbGUocmV2ZXJzZSA9IGZhbHNlKSB7XG4gICAgdGhpcy5zb3J0X25vdGVzKCk7XG5cbiAgICBpZiAodGhpcy5ub3Rlc19saXN0Lm5faXRlbXMgPD0gMCkgcmV0dXJuO1xuXG4gICAgY29uc3QgZmlsdGVyID0gR3RrLkN1c3RvbUZpbHRlci5uZXcoKGl0ZW0pID0+IHtcbiAgICAgIGNvbnN0IG5vdGUgPSBpdGVtIGFzIE5vdGU7XG4gICAgICByZXR1cm4gdGhpcy5pc19ub3RlX29wZW4obm90ZS51dWlkKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IG5vdGVzID0gR3RrLkZpbHRlckxpc3RNb2RlbC5uZXcoXG4gICAgICB0aGlzLm5vdGVzX2xpc3QsXG4gICAgICBmaWx0ZXIsXG4gICAgKSBhcyBHdGsuRmlsdGVyTGlzdE1vZGVsPE5vdGU+O1xuXG4gICAgY29uc3QgcHJlc2VudGVkID0gdGhpcy5hY3RpdmVfd2luZG93O1xuXG4gICAgaWYgKHByZXNlbnRlZCBpbnN0YW5jZW9mIFN0aWNreU5vdGVzKSB7XG4gICAgICB0aGlzLmdldF9ub3RlX3dpbmRvdyhcbiAgICAgICAgbm90ZXMuZ2V0X2l0ZW0ocmV2ZXJzZSA/IG5vdGVzLm5faXRlbXMgLSAxIDogMCkhLnV1aWQsXG4gICAgICApXG4gICAgICAgID8ucHJlc2VudCgpO1xuICAgIH0gZWxzZSBpZiAocHJlc2VudGVkIGluc3RhbmNlb2YgV2luZG93KSB7XG4gICAgICBsZXQgaWQ7XG5cbiAgICAgIGZvciAoaWQgPSAwOyBpZCA8IG5vdGVzLm5faXRlbXM7IGlkKyspIHtcbiAgICAgICAgaWYgKG5vdGVzLmdldF9pdGVtKGlkKSEudXVpZCA9PT0gcHJlc2VudGVkLm5vdGUudXVpZCkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGZvY3VzX2lkID0gaWQgKyAocmV2ZXJzZSA/IC0xIDogMSk7XG5cbiAgICAgIGlmIChmb2N1c19pZCA8IDAgfHwgZm9jdXNfaWQgPj0gbm90ZXMubl9pdGVtcykge1xuICAgICAgICB0aGlzLmFsbF9ub3RlcygpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5nZXRfbm90ZV93aW5kb3cobm90ZXMuZ2V0X2l0ZW0oZm9jdXNfaWQpIS51dWlkKT8ucHJlc2VudCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGN5Y2xlX2xpbmVhcigpIHtcbiAgICAvLyByZXZlcnNlIHRoZSBvcmRlciAobWFrZXMgaXQgbG9vcCBvbGRlc3QgZmlyc3QpXG4gICAgcmV0dXJuIHRoaXMuY3ljbGUoZmFsc2UpO1xuICB9XG5cbiAgY3ljbGVfcmV2ZXJzZSgpIHtcbiAgICAvLyByZXZlcnNlIHRoZSBvcmRlciAobWFrZXMgaXQgbG9vcCBvbGRlc3QgZmlyc3QpXG4gICAgcmV0dXJuIHRoaXMuY3ljbGUodHJ1ZSk7XG4gIH1cblxuICBzaG93X2Fib3V0KCkge1xuICAgIGNvbnN0IGFib3V0UGFyYW1zOiBQYXJ0aWFsPEFkdy5BYm91dFdpbmRvdy5Db25zdHJ1Y3RvclByb3BzPiA9IHtcbiAgICAgIHRyYW5zaWVudF9mb3I6IHRoaXMuYWN0aXZlX3dpbmRvdyxcbiAgICAgIGFwcGxpY2F0aW9uX25hbWU6IF8oXCJTdGlja3kgTm90ZXNcIiksXG4gICAgICBhcHBsaWNhdGlvbl9pY29uOiBwa2cubmFtZSxcbiAgICAgIGRldmVsb3Blcl9uYW1lOiBcIkFuZ2VsbyBWZXJsYWluXCIsXG4gICAgICB2ZXJzaW9uOiBwa2cudmVyc2lvbixcbiAgICAgIGRldmVsb3BlcnM6IFtcbiAgICAgICAgXCJBbmdlbG8gVmVybGFpbiA8aGV5QHZpeGFsaWVuLmNvbT5cIixcbiAgICAgICAgXCJDaHJpc3RvcGhlciBEYXZpcyA8Y2hyaXN0b3BoZXJkYXZpc0Bnbm9tZS5vcmc+XCIsXG4gICAgICBdLFxuICAgICAgZGVzaWduZXJzOiBbXG4gICAgICAgIFwiRGF2aWQgTGFwc2hpblwiLFxuICAgICAgXSxcbiAgICAgIC8vIFRSQU5TTEFUT1JTOiBlZy4gJ1RyYW5zbGF0b3IgTmFtZSA8eW91ci5lbWFpbEBkb21haW4uY29tPicgb3IgJ1RyYW5zbGF0b3IgTmFtZSBodHRwczovL3dlYnNpdGUuZXhhbXBsZSdcbiAgICAgIHRyYW5zbGF0b3JfY3JlZGl0czogXyhcInRyYW5zbGF0b3ItY3JlZGl0c1wiKSxcbiAgICAgIGNvcHlyaWdodDogXCJcdTAwQTkgMjAyMyBBbmdlbG8gVmVybGFpbiwgQ2hyaXN0b3BoZXIgRGF2aXNcIixcbiAgICAgIGxpY2Vuc2VfdHlwZTogR3RrLkxpY2Vuc2UuTUlUX1gxMSxcbiAgICAgIHdlYnNpdGU6IFwiaHR0cHM6Ly9naXRodWIuY29tL3ZpeGFsaWVuL3N0aWNreVwiLFxuICAgICAgaXNzdWVfdXJsOiBcImh0dHBzOi8vZ2l0aHViLmNvbS92aXhhbGllbi9zdGlja3kvaXNzdWVzXCIsXG4gICAgfTtcblxuICAgIGNvbnN0IGFib3V0V2luZG93ID0gbmV3IEFkdy5BYm91dFdpbmRvdyhhYm91dFBhcmFtcyk7XG4gICAgYWJvdXRXaW5kb3cucHJlc2VudCgpO1xuICB9XG5cbiAgbm90ZXNfYXJyYXkoKSB7XG4gICAgY29uc3Qgbm90ZXM6IE5vdGVbXSA9IFtdO1xuXG4gICAgdGhpcy5mb3JlYWNoX25vdGUoKG5vdGUpID0+IHtcbiAgICAgIG5vdGVzLnB1c2gobm90ZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gbm90ZXM7XG4gIH1cblxuICBmb3JlYWNoX25vdGUoY2I6IChub3RlOiBOb3RlLCBpZD86IG51bWJlcikgPT4gdm9pZCkge1xuICAgIGxldCBpZCA9IDA7XG5cbiAgICB3aGlsZSAoaWQgPCB0aGlzLm5vdGVzX2xpc3Qubl9pdGVtcykge1xuICAgICAgY2IodGhpcy5ub3Rlc19saXN0LmdldF9pdGVtKGlkKSEsIGlkKTtcbiAgICAgIGlkKys7XG4gICAgfVxuICB9XG5cbiAgZmluZF9ub3RlX2lkKHV1aWQ6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLm5vdGVzX2FycmF5KCkuZmluZEluZGV4KChub3RlKSA9PiBub3RlLnV1aWQgPT09IHV1aWQpO1xuICB9XG5cbiAgZmluZF9ub3RlKHV1aWQ6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLm5vdGVzX2FycmF5KCkuZmluZCgobm90ZSkgPT4gbm90ZS51dWlkID09PSB1dWlkKTtcbiAgfVxuXG4gIGZpbmRfb3Blbl93aW5kb3codXVpZDogc3RyaW5nKSB7XG4gICAgY29uc3Qgd2luID0gdGhpcy5ub3RlX3dpbmRvd3MuZmluZCgod2luZG93KSA9PiB3aW5kb3cubm90ZS51dWlkID09PSB1dWlkKTtcblxuICAgIHJldHVybiB3aW4gPz8gdW5kZWZpbmVkO1xuICB9XG5cbiAgZmluZF9vcGVuX25vdGUodXVpZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZmluZF9vcGVuX3dpbmRvdyh1dWlkKT8ubm90ZSBhcyBOb3RlID8/IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGNoYW5nZWRfbm90ZSh1dWlkOiBzdHJpbmcpIHtcbiAgICBjb25zdCBmb3VuZF9pZCA9IHRoaXMuZmluZF9ub3RlX2lkKHV1aWQpO1xuICAgIGNvbnN0IGZvdW5kX25vdGUgPSB0aGlzLmZpbmRfb3Blbl9ub3RlKHV1aWQpO1xuXG4gICAgaWYgKGZvdW5kX2lkICE9PSB1bmRlZmluZWQgJiYgZm91bmRfbm90ZSkge1xuICAgICAgLy8gdGhpcy5ub3Rlc19saXN0LnNwbGljZShmb3VuZF9pZCwgMSwgW2ZvdW5kX25vdGVdKTtcbiAgICB9XG4gIH1cblxuICBhdHRhY2hfbm90ZV9saXN0ZW5lcnMobm90ZTogTm90ZSkge1xuICAgIGNvbnN0IHN5bmNUb01pcnJvciA9ICgpID0+IHtcbiAgICAgIGlmICh0aGlzLm1pcnJvcl9tYW5hZ2VyKSB7XG4gICAgICAgIHRoaXMubWlycm9yX21hbmFnZXIuc2F2ZV9ub3RlKG5vdGUpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBub3RlLmNvbm5lY3QoXCJub3RpZnk6OmNvbnRlbnRcIiwgc3luY1RvTWlycm9yKTtcbiAgICBub3RlLmNvbm5lY3QoXCJub3RpZnk6OnRpdGxlXCIsIHN5bmNUb01pcnJvcik7XG4gICAgbm90ZS5jb25uZWN0KFwibm90aWZ5OjpzdHlsZVwiLCBzeW5jVG9NaXJyb3IpO1xuICAgIG5vdGUuY29ubmVjdChcIm5vdGlmeTo6dGFnX2xpc3RcIiwgc3luY1RvTWlycm9yKTtcbiAgICBub3RlLmNvbm5lY3QoXCJub3RpZnk6Om9wZW5cIiwgc3luY1RvTWlycm9yKTtcbiAgICBub3RlLmNvbm5lY3QoXCJub3RpZnk6Om1vZGlmaWVkXCIsIHN5bmNUb01pcnJvcik7XG4gIH1cblxuICBzZWxlY3RfbWlycm9yX2RpcmVjdG9yeSgpIHtcbiAgICBjb25zdCBwYXJlbnQgPSB0aGlzLmdldF9hY3RpdmVfd2luZG93KCk7XG4gICAgY29uc3QgZGlhbG9nID0gR3RrLkZpbGVDaG9vc2VyTmF0aXZlLm5ldyhcbiAgICAgIF8oXCJTZWxlY3QgTWlycm9yIERpcmVjdG9yeVwiKSxcbiAgICAgIHBhcmVudCxcbiAgICAgIEd0ay5GaWxlQ2hvb3NlckFjdGlvbi5TRUxFQ1RfRk9MREVSLFxuICAgICAgXyhcIlNlbGVjdFwiKSxcbiAgICAgIF8oXCJDYW5jZWxcIiksXG4gICAgKTtcblxuICAgIGNvbnN0IGN1cnJlbnREaXIgPSBzZXR0aW5ncy5nZXRfc3RyaW5nKFwibWlycm9yLWRpcmVjdG9yeVwiKTtcbiAgICBpZiAoY3VycmVudERpcikge1xuICAgICAgZGlhbG9nLnNldF9maWxlKEdpby5maWxlX25ld19mb3JfcGF0aChjdXJyZW50RGlyKSk7XG4gICAgfVxuXG4gICAgZGlhbG9nLmNvbm5lY3QoXCJyZXNwb25zZVwiLCAoX2RpYWxvZywgcmVzcG9uc2UpID0+IHtcbiAgICAgIGlmIChyZXNwb25zZSA9PT0gR3RrLlJlc3BvbnNlVHlwZS5BQ0NFUFQpIHtcbiAgICAgICAgY29uc3QgZmlsZSA9IGRpYWxvZy5nZXRfZmlsZSgpO1xuICAgICAgICBpZiAoZmlsZSkge1xuICAgICAgICAgIGNvbnN0IHBhdGggPSBmaWxlLmdldF9wYXRoKCk7XG4gICAgICAgICAgaWYgKHBhdGgpIHtcbiAgICAgICAgICAgIHNldHRpbmdzLnNldF9zdHJpbmcoXCJtaXJyb3ItZGlyZWN0b3J5XCIsIHBhdGgpO1xuICAgICAgICAgICAgc2V0dGluZ3Muc2V0X2Jvb2xlYW4oXCJtaXJyb3ItZW5hYmxlZFwiLCB0cnVlKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1pcnJvcl9tYW5hZ2VyKSB7XG4gICAgICAgICAgICAgIHRoaXMubWlycm9yX21hbmFnZXIuc2V0dXAoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGRpYWxvZy5kZXN0cm95KCk7XG4gICAgfSk7XG5cbiAgICBkaWFsb2cuc2hvdygpO1xuICB9XG5cbiAgZGVsZXRlX25vdGUodXVpZDogc3RyaW5nKSB7XG4gICAgY29uc3QgZm91bmRfaWQgPSB0aGlzLmZpbmRfbm90ZV9pZCh1dWlkKTtcbiAgICBjb25zdCBmb3VuZF93aW5kb3cgPSB0aGlzLmZpbmRfb3Blbl93aW5kb3codXVpZCk7XG5cbiAgICBpZiAoZm91bmRfaWQgIT09IHVuZGVmaW5lZCkgdGhpcy5ub3Rlc19saXN0LnNwbGljZShmb3VuZF9pZCwgMSwgW10pO1xuICAgIGlmIChmb3VuZF93aW5kb3cpIGZvdW5kX3dpbmRvdy5jbG9zZSgpO1xuXG4gICAgZGVsZXRlX25vdGUodXVpZCk7XG4gICAgaWYgKHRoaXMubWlycm9yX21hbmFnZXIpIHtcbiAgICAgIHRoaXMubWlycm9yX21hbmFnZXIuZGVsZXRlX25vdGUodXVpZCk7XG4gICAgfVxuICB9XG5cbiAgYWxsX25vdGVzKCkge1xuICAgIGlmICghdGhpcy53aW5kb3cpIHtcbiAgICAgIHRoaXMud2luZG93ID0gbmV3IFN0aWNreU5vdGVzKHtcbiAgICAgICAgYXBwbGljYXRpb246IHRoaXMsXG4gICAgICB9KTtcblxuICAgICAgdGhpcy53aW5kb3cuY29ubmVjdChcIm5vdGUtYWN0aXZhdGVkXCIsIChfLCB1dWlkKSA9PiB7XG4gICAgICAgIHRoaXMuc2hvd19ub3RlKHV1aWQpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMud2luZG93LmNvbm5lY3QoXCJkZWxldGVkXCIsIChfLCB1dWlkKSA9PiB7XG4gICAgICAgIHRoaXMuZGVsZXRlX25vdGUodXVpZCk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy53aW5kb3cuY29ubmVjdChcImNsb3NlLXJlcXVlc3RcIiwgKCkgPT4ge1xuICAgICAgICB0aGlzLndpbmRvdyA9IG51bGw7XG4gICAgICAgIHNldHRpbmdzLnNldF9ib29sZWFuKFwic2hvdy1hbGwtbm90ZXNcIiwgZmFsc2UpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMud2luZG93LmFkZF9jb250cm9sbGVyKHRoaXMubmV3X2NvbnRyb2xsZXIoKSk7XG4gICAgfVxuXG4gICAgc2V0dGluZ3Muc2V0X2Jvb2xlYW4oXCJzaG93LWFsbC1ub3Rlc1wiLCB0cnVlKTtcblxuICAgIHRoaXMud2luZG93LnByZXNlbnQoKTtcbiAgfVxuXG4gIG5ld19ub3RlKCkge1xuICAgIGNvbnN0IG5vdGUgPSBOb3RlLmdlbmVyYXRlKCk7XG5cbiAgICBub3RlLmNvbm5lY3QoXCJub3RpZnk6Om1vZGlmaWVkXCIsICgpID0+IHtcbiAgICAgIHNhdmVfbm90ZShub3RlKTtcbiAgICB9KTtcblxuICAgIC8vIGNoYW5naW5nIG9wZW4gZG9lc24ndCBjaGFuZ2UgbW9kaWZpZWRcbiAgICBub3RlLmNvbm5lY3QoXCJub3RpZnk6Om9wZW5cIiwgKCkgPT4ge1xuICAgICAgc2F2ZV9ub3RlKG5vdGUpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5hdHRhY2hfbm90ZV9saXN0ZW5lcnMobm90ZSk7XG5cbiAgICB0aGlzLm5vdGVzX2xpc3QuYXBwZW5kKG5vdGUpO1xuICAgIHNhdmVfbm90ZShub3RlKTtcblxuICAgIGlmICh0aGlzLm1pcnJvcl9tYW5hZ2VyKSB7XG4gICAgICB0aGlzLm1pcnJvcl9tYW5hZ2VyLnNhdmVfbm90ZShub3RlKTtcbiAgICB9XG5cbiAgICB0aGlzLnNob3dfbm90ZShub3RlLnV1aWQpO1xuICB9XG5cbiAgc2hvd19ub3RlKHV1aWQ6IHN0cmluZykge1xuICAgIGNvbnN0IG5vdGUgPSB0aGlzLmZpbmRfbm90ZSh1dWlkKTtcblxuICAgIGlmICghbm90ZSkgcmV0dXJuO1xuXG4gICAgY29uc3Qgbm90ZV93aW5kb3cgPSB0aGlzLm5vdGVfd2luZG93cy5maW5kKCh3aW5kb3cpID0+XG4gICAgICB3aW5kb3cubm90ZS51dWlkID09PSB1dWlkXG4gICAgKTtcblxuICAgIGlmIChub3RlX3dpbmRvdykge1xuICAgICAgbm90ZV93aW5kb3cucHJlc2VudCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHdpbmRvdyA9IG5ldyBXaW5kb3coe1xuICAgICAgYXBwbGljYXRpb246IHRoaXMsXG4gICAgICBub3RlLFxuICAgIH0pO1xuXG4gICAgdGhpcy5ub3RlX3dpbmRvd3MucHVzaCh3aW5kb3cpO1xuXG4gICAgd2luZG93LmFkZF9jb250cm9sbGVyKHRoaXMubmV3X2NvbnRyb2xsZXIoKSk7XG5cbiAgICB3aW5kb3cuY29ubmVjdChcImNsb3NlLXJlcXVlc3RcIiwgKCkgPT4ge1xuICAgICAgLy8gaWYgdGhpcyBpcyB0aGUgbGFzdCB3aW5kb3csIGl0IG1lYW5zIHRoYXQgdGhlIGFwcCB3aWxsIGJlIGNsb3NlZFxuICAgICAgLy8gaW1tZWRpYXRlbHkgYWZ0ZXIsIHNvIGtlZXAgdGhpcyBhcyBcIm9wZW5cIiB3aGVuIHRoZSBhbGwgbm90ZXMgd2luZG93XG4gICAgICAvLyBpcyBvcGVuIChzbyB0aGF0IGl0J3MgcmVzdG9yZWQgd2hlbiB0aGUgYXBwIGlzIG9wZW5lZCBhZ2FpbilcbiAgICAgIGlmICghKHRoaXMubm90ZV93aW5kb3dzLmxlbmd0aCA9PT0gMSAmJiAhdGhpcy53aW5kb3cpKSB7XG4gICAgICAgIG5vdGUub3BlbiA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICB0aGlzLm5vdGVfd2luZG93cyA9IHRoaXMubm90ZV93aW5kb3dzLmZpbHRlcigod2luKSA9PiB3aW4gIT09IHdpbmRvdyk7XG4gICAgICB0aGlzLndpbmRvdz8uc2V0X25vdGVfdmlzaWJsZShub3RlIS51dWlkLCBmYWxzZSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSk7XG5cbiAgICB3aW5kb3cuY29ubmVjdChcImRlbGV0ZWRcIiwgKF8sIHV1aWQpID0+IHtcbiAgICAgIHRoaXMuZGVsZXRlX25vdGUodXVpZCk7XG4gICAgfSk7XG5cbiAgICBpZiAobm90ZS5vcGVuID09PSBmYWxzZSkgbm90ZS5vcGVuID0gdHJ1ZTtcblxuICAgIHdpbmRvdy5wcmVzZW50KCk7XG4gIH1cblxuICB2ZnVuY19zdGFydHVwKCkge1xuICAgIHN1cGVyLnZmdW5jX3N0YXJ0dXAoKTtcblxuICAgIGNvbnN0IHN0eWxlX21hbmFnZXIgPSBBZHcuU3R5bGVNYW5hZ2VyLmdldF9kZWZhdWx0KCk7XG4gICAgZnVuY3Rpb24gc2V0Q29sb3JTY2hlbWUoKSB7XG4gICAgICBjb25zdCBjb2xvcl9zY2hlbWUgPSBzZXR0aW5ncy5nZXRfaW50KFwiY29sb3Itc2NoZW1lXCIpO1xuICAgICAgc3R5bGVfbWFuYWdlci5zZXRfY29sb3Jfc2NoZW1lKGNvbG9yX3NjaGVtZSk7XG4gICAgfVxuICAgIHNldENvbG9yU2NoZW1lKCk7XG4gICAgc2V0dGluZ3MuY29ubmVjdChcImNoYW5nZWQ6OmNvbG9yLXNjaGVtZVwiLCBzZXRDb2xvclNjaGVtZSk7XG4gIH1cbn1cbiIsICIvKiBNSVQgTGljZW5zZVxuICpcbiAqIENvcHlyaWdodCAoYykgMjAyMyBBbmdlbG8gVmVybGFpbiwgQ2hyaXMgRGF2aXNcbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gKiBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAqIFNPRlRXQVJFLlxuICpcbiAqIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBNSVRcbiAqL1xuXG5pbXBvcnQgR09iamVjdCBmcm9tIFwiZ2k6Ly9HT2JqZWN0XCI7XG5pbXBvcnQgR3RrIGZyb20gXCJnaTovL0d0az92ZXJzaW9uPTQuMFwiO1xuaW1wb3J0IEFkdyBmcm9tIFwiZ2k6Ly9BZHdcIjtcblxuaW1wb3J0IHR5cGUgeyBBcHBsaWNhdGlvbiB9IGZyb20gXCIuL2FwcGxpY2F0aW9uLmpzXCI7XG5pbXBvcnQgeyBTdGlja3lOb3RlQ2FyZCB9IGZyb20gXCIuL2NhcmQuanNcIjtcbmltcG9ydCB7IE5vdGUsIHNldHRpbmdzIH0gZnJvbSBcIi4vdXRpbC5qc1wiO1xuXG5pbXBvcnQgeyBUaGVtZVNlbGVjdG9yIH0gZnJvbSBcIi4vdGhlbWVzZWxlY3Rvci5qc1wiO1xuXG5leHBvcnQgY2xhc3MgU3RpY2t5Tm90ZXMgZXh0ZW5kcyBBZHcuQXBwbGljYXRpb25XaW5kb3cge1xuICBzdGF0aWMge1xuICAgIEdPYmplY3QucmVnaXN0ZXJDbGFzcyhcbiAgICAgIHtcbiAgICAgICAgVGVtcGxhdGU6IFwicmVzb3VyY2U6Ly8vY29tL3ZpeGFsaWVuL3N0aWNreS91aS9ub3Rlcy51aVwiLFxuICAgICAgICBHVHlwZU5hbWU6IFwiU3RpY2t5Tm90ZXNcIixcbiAgICAgICAgSW50ZXJuYWxDaGlsZHJlbjogW1xuICAgICAgICAgIFwic2VhcmNoXCIsXG4gICAgICAgICAgXCJub3Rlc19ib3hcIixcbiAgICAgICAgICBcIm5vX25vdGVzXCIsXG4gICAgICAgICAgXCJub19yZXN1bHRzXCIsXG4gICAgICAgICAgXCJzZWFyY2hfZW50cnlcIixcbiAgICAgICAgICBcInNjcm9sbGVkXCIsXG4gICAgICAgICAgXCJtZW51X2J1dHRvblwiLFxuICAgICAgICAgIFwic3RhY2tcIixcbiAgICAgICAgXSxcbiAgICAgICAgU2lnbmFsczoge1xuICAgICAgICAgIFwibm90ZS1hY3RpdmF0ZWRcIjoge1xuICAgICAgICAgICAgcGFyYW1fdHlwZXM6IFtHT2JqZWN0LlRZUEVfU1RSSU5HXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGRlbGV0ZWQ6IHtcbiAgICAgICAgICAgIHBhcmFtX3R5cGVzOiBbR09iamVjdC5UWVBFX1NUUklOR10sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICB0aGlzLFxuICAgICk7XG4gIH1cblxuICBkZWNsYXJlIF9zZWFyY2g6IEd0ay5Cb3g7XG4gIGRlY2xhcmUgX3NlYXJjaF9lbnRyeTogR3RrLlNlYXJjaEVudHJ5O1xuICBkZWNsYXJlIF9ub3Rlc19ib3g6IEd0ay5MaXN0VmlldztcbiAgZGVjbGFyZSBfbm9fbm90ZXM6IEFkdy5TdGF0dXNQYWdlO1xuICBkZWNsYXJlIF9ub19yZXN1bHRzOiBBZHcuU3RhdHVzUGFnZTtcbiAgZGVjbGFyZSBfc2Nyb2xsZWQ6IEd0ay5TY3JvbGxlZFdpbmRvdztcbiAgZGVjbGFyZSBfbWVudV9idXR0b246IEd0ay5NZW51QnV0dG9uO1xuICBkZWNsYXJlIF9zdGFjazogR3RrLlN0YWNrO1xuXG4gIGNhcmRzOiBTdGlja3lOb3RlQ2FyZFtdID0gW107XG5cbiAgb2xkX3F1ZXJ5ID0gXCJcIjtcblxuICBsYXN0X21vZGVsOiBHdGsuU2VsZWN0aW9uTW9kZWw8Tm90ZT47XG4gIHNvcnRlcjogR3RrLlNvcnRlcjtcblxuICBnZXQgcXVlcnkoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NlYXJjaF9lbnRyeS50ZXh0LnRvTG93ZXJDYXNlKCk7XG4gIH1cblxuICBzZXR1cF9jYihfZmFjdG9yeTogR3RrLkxpc3RJdGVtRmFjdG9yeSwgbGlzdF9pdGVtOiBHdGsuTGlzdEl0ZW0pIHtcbiAgICBjb25zdCBjYXJkID0gbmV3IFN0aWNreU5vdGVDYXJkKHRoaXMpO1xuXG4gICAgbGlzdF9pdGVtLnNldF9jaGlsZChjYXJkKTtcbiAgfVxuXG4gIGJpbmRfY2IoX2ZhY3Rvcnk6IEd0ay5MaXN0SXRlbUZhY3RvcnksIGxpc3RfaXRlbTogR3RrLkxpc3RJdGVtKSB7XG4gICAgY29uc3QgY2FyZCA9IGxpc3RfaXRlbS5nZXRfY2hpbGQoKSBhcyBTdGlja3lOb3RlQ2FyZDtcbiAgICBjb25zdCBub3RlID0gbGlzdF9pdGVtLmdldF9pdGVtKCkgYXMgTm90ZTtcblxuICAgIGNhcmQuc2hvd192aXNpYmxlX2ltYWdlID0gbm90ZS5vcGVuO1xuICAgIGNhcmQuY29ubmVjdChcImRlbGV0ZWRcIiwgKF8pID0+IHRoaXMuZW1pdChcImRlbGV0ZWRcIiwgbm90ZS51dWlkKSk7XG5cbiAgICBjYXJkLm5vdGUgPSBub3RlO1xuXG4gICAgbm90ZS5jb25uZWN0KFwibm90aWZ5Ojptb2RpZmllZFwiLCAoKSA9PiB7XG4gICAgICBjYXJkLnVwZGF0ZV9tb2RpZmllZF9sYWJlbCgpO1xuICAgICAgdGhpcy5zb3J0ZXIuY2hhbmdlZChHdGsuU29ydGVyQ2hhbmdlLkRJRkZFUkVOVCk7XG4gICAgfSk7XG5cbiAgICBub3RlLmNvbm5lY3QoXCJub3RpZnk6Om9wZW5cIiwgKF8pID0+IHtcbiAgICAgIGNhcmQuc2hvd192aXNpYmxlX2ltYWdlID0gbm90ZS5vcGVuO1xuICAgIH0pO1xuXG4gICAgbm90ZS5jb25uZWN0KFwibm90aWZ5OjpzdHlsZVwiLCAoKSA9PiB7XG4gICAgICBjYXJkLnNldF9zdHlsZShub3RlLnN0eWxlKTtcbiAgICB9KTtcbiAgfVxuXG4gIHVuYmluZF9jYihfZmFjdG9yeTogR3RrLkxpc3RJdGVtRmFjdG9yeSwgX2xpc3RfaXRlbTogR3RrLkxpc3RJdGVtKSB7XG4gICAgY29uc3QgY2FyZCA9IG5ldyBTdGlja3lOb3RlQ2FyZCh0aGlzKTtcblxuICAgIGNhcmQudmlldy5yZW1vdmVfbGlzdGVuZXJzKCk7XG4gIH1cblxuICBhY3RpdmF0ZV9jYihsaXN0OiBHdGsuTGlzdFZpZXcsIHBvc2l0aW9uOiBudW1iZXIpIHtcbiAgICBjb25zdCBpdGVtID0gbGlzdC5nZXRfbW9kZWwoKT8uZ2V0X2l0ZW0ocG9zaXRpb24pIGFzIE5vdGUgfCB1bmRlZmluZWQ7XG4gICAgaWYgKCFpdGVtKSByZXR1cm47XG4gICAgdGhpcy5lbWl0KFwibm90ZS1hY3RpdmF0ZWRcIiwgaXRlbS51dWlkKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHBhcmFtczogUGFydGlhbDxHdGsuV2luZG93LkNvbnN0cnVjdG9yUHJvcHM+LFxuICApIHtcbiAgICBzdXBlcihwYXJhbXMpO1xuXG4gICAgdGhpcy5kZWZhdWx0X2hlaWdodCA9IHNldHRpbmdzLmdldF9pbnQoXCJkZWZhdWx0LWhlaWdodFwiKTtcbiAgICB0aGlzLmRlZmF1bHRfd2lkdGggPSBzZXR0aW5ncy5nZXRfaW50KFwiZGVmYXVsdC13aWR0aFwiKTtcblxuICAgIHRoaXMuY29ubmVjdChcImNsb3NlLXJlcXVlc3RcIiwgKCkgPT4ge1xuICAgICAgc2V0dGluZ3Muc2V0X2ludChcImRlZmF1bHQtaGVpZ2h0XCIsIHRoaXMuZ2V0X2hlaWdodCgpKTtcbiAgICAgIHNldHRpbmdzLnNldF9pbnQoXCJkZWZhdWx0LXdpZHRoXCIsIHRoaXMuZ2V0X3dpZHRoKCkpO1xuICAgIH0pO1xuXG4gICAgLy8gbWFrZSBpdCB0cmFuc3BhcmVudFxuICAgIHRoaXMuX25vdGVzX2JveC5yZW1vdmVfY3NzX2NsYXNzKFwidmlld1wiKTtcblxuICAgIGNvbnN0IGZhY3RvcnkgPSBuZXcgR3RrLlNpZ25hbExpc3RJdGVtRmFjdG9yeSgpO1xuICAgIGZhY3RvcnkuY29ubmVjdChcInNldHVwXCIsIHRoaXMuc2V0dXBfY2IuYmluZCh0aGlzKSk7XG4gICAgZmFjdG9yeS5jb25uZWN0KFwiYmluZFwiLCB0aGlzLmJpbmRfY2IuYmluZCh0aGlzKSk7XG4gICAgZmFjdG9yeS5jb25uZWN0KFwidW5iaW5kXCIsIHRoaXMudW5iaW5kX2NiLmJpbmQodGhpcykpO1xuXG4gICAgY29uc3QgZmlsdGVyID0gR3RrLkN1c3RvbUZpbHRlci5uZXcoKG5vdGUpID0+IHtcbiAgICAgIGNvbnN0IHF1ZXJ5ID0gdGhpcy5xdWVyeTtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSAobm90ZSBhcyBOb3RlKS5jb250ZW50LnRvTG93ZXJDYXNlKCk7XG4gICAgICBpZiAoIXF1ZXJ5LnJlcGxhY2UoL1xccy9nLCBcIlwiKSkgcmV0dXJuIHRydWU7XG4gICAgICByZXR1cm4gY29udGVudC5pbmNsdWRlcyhxdWVyeSk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBmaWx0ZXJfbW9kZWwgPSBHdGsuRmlsdGVyTGlzdE1vZGVsLm5ldyhcbiAgICAgICh0aGlzLmFwcGxpY2F0aW9uIGFzIEFwcGxpY2F0aW9uKS5ub3Rlc19saXN0LFxuICAgICAgZmlsdGVyLFxuICAgICk7XG5cbiAgICB0aGlzLnNvcnRlciA9IEd0ay5DdXN0b21Tb3J0ZXIubmV3KChub3RlMSwgbm90ZTIpID0+IHtcbiAgICAgIGNvbnN0IGRhdGUxID0gKG5vdGUxIGFzIE5vdGUpLm1vZGlmaWVkO1xuICAgICAgY29uc3QgZGF0ZTIgPSAobm90ZTIgYXMgTm90ZSkubW9kaWZpZWQ7XG4gICAgICByZXR1cm4gZGF0ZTIuY29tcGFyZShkYXRlMSk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBzb3J0ZXJfbW9kZWwgPSBHdGsuU29ydExpc3RNb2RlbC5uZXcoZmlsdGVyX21vZGVsLCB0aGlzLnNvcnRlcik7XG5cbiAgICB0aGlzLmxhc3RfbW9kZWwgPSBHdGsuU2luZ2xlU2VsZWN0aW9uLm5ldyhcbiAgICAgIHNvcnRlcl9tb2RlbCxcbiAgICApIGFzIEd0ay5TaW5nbGVTZWxlY3Rpb248Tm90ZT47XG5cbiAgICB0aGlzLmxhc3RfbW9kZWwuY29ubmVjdChcIml0ZW1zLWNoYW5nZWRcIiwgKCkgPT4ge1xuICAgICAgdGhpcy5zZXRfc3RhdHVzKCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9ub3Rlc19ib3guY29ubmVjdChcImFjdGl2YXRlXCIsIHRoaXMuYWN0aXZhdGVfY2IuYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLl9ub3Rlc19ib3guc2V0X2ZhY3RvcnkoZmFjdG9yeSk7XG4gICAgdGhpcy5fbm90ZXNfYm94LnNldF9tb2RlbCh0aGlzLmxhc3RfbW9kZWwpO1xuXG4gICAgdGhpcy5fc2VhcmNoX2VudHJ5LmNvbm5lY3QoXCJzZWFyY2gtY2hhbmdlZFwiLCAoKSA9PiB7XG4gICAgICBjb25zdCBxdWVyeSA9IHRoaXMucXVlcnkudG9Mb3dlckNhc2UoKTtcbiAgICAgIGNvbnN0IG9sZF9xdWVyeSA9IHRoaXMub2xkX3F1ZXJ5LnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgIGlmIChxdWVyeS5pbmNsdWRlcyhvbGRfcXVlcnkpKSB7XG4gICAgICAgIGZpbHRlci5lbWl0KFwiY2hhbmdlZFwiLCBHdGsuRmlsdGVyQ2hhbmdlLk1PUkVfU1RSSUNUKTtcbiAgICAgIH0gZWxzZSBpZiAob2xkX3F1ZXJ5LmluY2x1ZGVzKHF1ZXJ5KSkge1xuICAgICAgICBmaWx0ZXIuZW1pdChcImNoYW5nZWRcIiwgR3RrLkZpbHRlckNoYW5nZS5MRVNTX1NUUklDVCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmaWx0ZXIuZW1pdChcImNoYW5nZWRcIiwgR3RrLkZpbHRlckNoYW5nZS5ESUZGRVJFTlQpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLm9sZF9xdWVyeSA9IHF1ZXJ5O1xuICAgIH0pO1xuXG4gICAgdGhpcy5zZXRfc3RhdHVzKCk7XG5cbiAgICAvLyBQb3BvdmVyIG1lbnUgdGhlbWUgc3dpdGNoZXJcbiAgICBjb25zdCBwb3BvdmVyID0gdGhpcy5fbWVudV9idXR0b24uZ2V0X3BvcG92ZXIoKSBhcyBHdGsuUG9wb3Zlck1lbnU7XG4gICAgcG9wb3Zlci5hZGRfY2hpbGQobmV3IFRoZW1lU2VsZWN0b3IoKSwgXCJ0aGVtZXN3aXRjaGVyXCIpO1xuICB9XG5cbiAgc2V0X3N0YXR1cygpIHtcbiAgICBpZiAodGhpcy5sYXN0X21vZGVsLmdldF9uX2l0ZW1zKCkgPiAwKSB7XG4gICAgICB0aGlzLnNldF92aXNpYmxlX2NoaWxkKHRoaXMuX25vdGVzX2JveCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLnF1ZXJ5KSB7XG4gICAgICAgIHRoaXMuc2V0X3Zpc2libGVfY2hpbGQodGhpcy5fbm9fcmVzdWx0cyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNldF92aXNpYmxlX2NoaWxkKHRoaXMuX25vX25vdGVzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzZXRfbm90ZV92aXNpYmxlKHV1aWQ6IHN0cmluZywgdmlzaWJsZTogYm9vbGVhbikge1xuICAgIGNvbnN0IGNhcmQgPSB0aGlzLmNhcmRzLmZpbmQoKGNhcmQpID0+IGNhcmQubm90ZS51dWlkID09PSB1dWlkKTtcblxuICAgIGlmICghY2FyZCkgcmV0dXJuO1xuXG4gICAgY2FyZC5zaG93X3Zpc2libGVfaW1hZ2UgPSB2aXNpYmxlO1xuICB9XG5cbiAgc2V0X3Zpc2libGVfY2hpbGQoY2hpbGQ6IEd0ay5XaWRnZXQpIHtcbiAgICB0aGlzLl9zZWFyY2gudmlzaWJsZSA9IGNoaWxkID09PSB0aGlzLl9ub3Rlc19ib3ggfHxcbiAgICAgIGNoaWxkID09PSB0aGlzLl9ub19yZXN1bHRzO1xuXG4gICAgdGhpcy5fc3RhY2suc2V0X3Zpc2libGVfY2hpbGQoY2hpbGQpO1xuICB9XG59XG4iLCAiLyogTUlUIExpY2Vuc2VcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMjMgQW5nZWxvIFZlcmxhaW4sIENocmlzIERhdmlzXG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICogY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gKiBTT0ZUV0FSRS5cbiAqXG4gKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogTUlUXG4gKi9cblxuaW1wb3J0IEdPYmplY3QgZnJvbSBcImdpOi8vR09iamVjdFwiO1xuaW1wb3J0IEd0ayBmcm9tIFwiZ2k6Ly9HdGs/dmVyc2lvbj00LjBcIjtcbmltcG9ydCBHTGliIGZyb20gXCJnaTovL0dMaWJcIjtcblxuaW1wb3J0IHsgY29uZmlybV9kZWxldGUsIE5vdGUsIFN0eWxlIH0gZnJvbSBcIi4vdXRpbC5qc1wiO1xuaW1wb3J0IHsgUmVhZG9ubHlTdGlja3lOb3RlIH0gZnJvbSBcIi4vdmlldy5qc1wiO1xuXG5leHBvcnQgY2xhc3MgU3RpY2t5Tm90ZUNhcmQgZXh0ZW5kcyBHdGsuQm94IHtcbiAgc3RhdGljIHtcbiAgICBHT2JqZWN0LnJlZ2lzdGVyQ2xhc3Moe1xuICAgICAgR1R5cGVOYW1lOiBcIlN0aWNreU5vdGVDYXJkXCIsXG4gICAgICBUZW1wbGF0ZTogXCJyZXNvdXJjZTovLy9jb20vdml4YWxpZW4vc3RpY2t5L3VpL2NhcmQudWlcIixcbiAgICAgIEludGVybmFsQ2hpbGRyZW46IFtcbiAgICAgICAgXCJtb2RpZmllZF9sYWJlbFwiLFxuICAgICAgICBcInZpZXdfaW1hZ2VcIixcbiAgICAgICAgXCJkZWxldGVfYnV0dG9uXCIsXG4gICAgICAgIFwic2Nyb2xsZWRcIixcbiAgICAgIF0sXG4gICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgIHV1aWQ6IEdPYmplY3QuUGFyYW1TcGVjLnN0cmluZyhcbiAgICAgICAgICBcInV1aWRcIixcbiAgICAgICAgICBcIlVVSURcIixcbiAgICAgICAgICBcIlRoZSBVVUlEIG9mIHRoZSBub3RlXCIsXG4gICAgICAgICAgR09iamVjdC5QYXJhbUZsYWdzLlJFQURBQkxFLFxuICAgICAgICAgIFwiXCIsXG4gICAgICAgICksXG4gICAgICB9LFxuICAgICAgU2lnbmFsczoge1xuICAgICAgICBkZWxldGVkOiB7fSxcbiAgICAgIH0sXG4gICAgfSwgdGhpcyk7XG4gIH1cblxuICBkZWNsYXJlIF9zY3JvbGxlZDogR3RrLlNjcm9sbGVkV2luZG93O1xuICBkZWNsYXJlIF9tb2RpZmllZF9sYWJlbDogR3RrLkxhYmVsO1xuICBkZWNsYXJlIF92aWV3X2ltYWdlOiBHdGsuSW1hZ2U7XG4gIGRlY2xhcmUgX2RlbGV0ZV9idXR0b246IEd0ay5CdXR0b247XG5cbiAgcHJpdmF0ZSBfbm90ZT86IE5vdGU7XG4gIHZpZXc6IFJlYWRvbmx5U3RpY2t5Tm90ZTtcblxuICBzZXQgc2hvd192aXNpYmxlX2ltYWdlKHZpc2libGU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl92aWV3X2ltYWdlLnZpc2libGUgPSB2aXNpYmxlO1xuICB9XG5cbiAgY29uc3RydWN0b3IocHVibGljIHdpbmRvdzogR3RrLldpbmRvdywgbm90ZT86IE5vdGUpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy52aWV3ID0gbmV3IFJlYWRvbmx5U3RpY2t5Tm90ZShub3RlKTtcbiAgICB0aGlzLnZpZXcuYWRkX2Nzc19jbGFzcyhcImNhcmQtdGV4dC12aWV3XCIpO1xuICAgIHRoaXMudmlldy53cmFwX21vZGUgPSBHdGsuV3JhcE1vZGUuV09SRF9DSEFSO1xuXG4gICAgdGhpcy5fc2Nyb2xsZWQuc2V0X2NoaWxkKHRoaXMudmlldyk7XG4gICAgdGhpcy5fZGVsZXRlX2J1dHRvbi5jb25uZWN0KFwiY2xpY2tlZFwiLCB0aGlzLmRlbGV0ZS5iaW5kKHRoaXMpKTtcblxuICAgIGlmIChub3RlKSB0aGlzLl9ub3RlID0gdGhpcy5ub3RlID0gbm90ZTtcbiAgfVxuXG4gIHNldCBub3RlKG5vdGU6IE5vdGUpIHtcbiAgICBpZiAobm90ZT8uc3R5bGUgIT09IHRoaXMuX25vdGU/LnN0eWxlKSB0aGlzLnNldF9zdHlsZShub3RlLnN0eWxlKTtcblxuICAgIHRoaXMuX25vdGUgPSB0aGlzLnZpZXcubm90ZSA9IG5vdGU7XG5cbiAgICB0aGlzLnVwZGF0ZV9tb2RpZmllZF9sYWJlbCgpO1xuICB9XG5cbiAgZ2V0IHV1aWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX25vdGU/LnV1aWQ7XG4gIH1cblxuICB1cGRhdGVfbW9kaWZpZWRfbGFiZWwoKSB7XG4gICAgY29uc3QgbW9kaWZpZWQgPSB0aGlzLl9ub3RlPy5tb2RpZmllZD8udG9fbG9jYWwoKTtcblxuICAgIGlmICghbW9kaWZpZWQpIHJldHVybjtcblxuICAgIC8vIGlmIGRhdGUgaXMgdG9kYXksIHNob3cgdGltZVxuICAgIC8vIG90aGVyd2lzZSwgc2hvdyBkYXRlXG4gICAgY29uc3QgZm9ybWF0ID1cbiAgICAgIEdMaWIuRGF0ZVRpbWUubmV3X25vd19sb2NhbCgpLmZvcm1hdChcIiVGXCIpID09PSBtb2RpZmllZC5mb3JtYXQoXCIlRlwiKVxuICAgICAgICA/IFwiJVJcIlxuICAgICAgICA6IFwiJUZcIjtcblxuICAgIHRoaXMuX21vZGlmaWVkX2xhYmVsLmxhYmVsID0gbW9kaWZpZWQuZm9ybWF0KGZvcm1hdCkhO1xuICB9XG5cbiAgc2V0X3N0eWxlKHN0eWxlOiBTdHlsZSkge1xuICAgIGZvciAoY29uc3QgcyBvZiB0aGlzLmdldF9jc3NfY2xhc3NlcygpKSB7XG4gICAgICBpZiAocy5zdGFydHNXaXRoKFwic3R5bGUtXCIpICYmIHMgIT09IGBzdHlsZS1zcGVjaWZpdHlgKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlX2Nzc19jbGFzcyhzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmFkZF9jc3NfY2xhc3MoYHN0eWxlLSR7U3R5bGVbc3R5bGVdfWApO1xuICB9XG5cbiAgZGVsZXRlKCkge1xuICAgIGlmICghdGhpcy5fbm90ZSkgcmV0dXJuO1xuICAgIGNvbmZpcm1fZGVsZXRlKHRoaXMud2luZG93LCAoKSA9PiB7XG4gICAgICB0aGlzLmVtaXQoXCJkZWxldGVkXCIpO1xuICAgIH0pO1xuICB9XG59XG4iLCAiLyogTUlUIExpY2Vuc2VcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMjMgQW5nZWxvIFZlcmxhaW4sIENocmlzIERhdmlzXG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICogY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gKiBTT0ZUV0FSRS5cbiAqXG4gKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogTUlUXG4gKi9cblxuaW1wb3J0IEFkdyBmcm9tIFwiZ2k6Ly9BZHdcIjtcbmltcG9ydCBHaW8gZnJvbSBcImdpOi8vR2lvXCI7XG5pbXBvcnQgR0xpYiBmcm9tIFwiZ2k6Ly9HTGliXCI7XG5pbXBvcnQgR09iamVjdCBmcm9tIFwiZ2k6Ly9HT2JqZWN0XCI7XG5pbXBvcnQgR3RrIGZyb20gXCJnaTovL0d0az92ZXJzaW9uPTQuMFwiO1xuXG5HaW8uX3Byb21pc2lmeShcbiAgR2lvLkZpbGUucHJvdG90eXBlLFxuICBcImxvYWRfY29udGVudHNfYXN5bmNcIixcbiAgXCJsb2FkX2NvbnRlbnRzX2ZpbmlzaFwiLFxuKTtcblxuR2lvLl9wcm9taXNpZnkoXG4gIEdpby5GaWxlLnByb3RvdHlwZSxcbiAgXCJyZXBsYWNlX2NvbnRlbnRzX2FzeW5jXCIsXG4gIFwicmVwbGFjZV9jb250ZW50c19maW5pc2hcIixcbik7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVRhZyB7XG4gIG5hbWU6IHN0cmluZztcbiAgc3RhcnQ6IG51bWJlcjtcbiAgZW5kOiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSU5vdGUge1xuICB2OiAxO1xuICB1dWlkOiBzdHJpbmc7XG4gIGNvbnRlbnQ6IHN0cmluZztcbiAgdGl0bGU6IHN0cmluZztcbiAgc3R5bGU6IFN0eWxlO1xuICB0YWdzOiBJVGFnW107XG4gIG1vZGlmaWVkOiBEYXRlO1xuICB3aWR0aDogbnVtYmVyO1xuICBoZWlnaHQ6IG51bWJlcjtcbiAgb3BlbjogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGVudW0gU3R5bGUge1xuICBcInllbGxvd1wiID0gMSxcbiAgXCJwaW5rXCIsXG4gIFwiZ3JlZW5cIixcbiAgXCJwdXJwbGVcIixcbiAgXCJibHVlXCIsXG4gIFwiZ3JheVwiLFxuICBcImNoYXJjb2FsXCIsXG4gIFwid2luZG93XCIsXG59XG5cbmV4cG9ydCBjb25zdCBTdHlsZU5hbWVzID0gbmV3IE1hcChbXG4gIFtTdHlsZS55ZWxsb3csIF8oXCJZZWxsb3dcIildLFxuICBbU3R5bGUucGluaywgXyhcIlBpbmtcIildLFxuICBbU3R5bGUuZ3JlZW4sIF8oXCJHcmVlblwiKV0sXG4gIFtTdHlsZS5wdXJwbGUsIF8oXCJQdXJwbGVcIildLFxuICBbU3R5bGUuYmx1ZSwgXyhcIkJsdWVcIildLFxuICBbU3R5bGUuZ3JheSwgXyhcIkdyYXlcIildLFxuICBbU3R5bGUuY2hhcmNvYWwsIF8oXCJDaGFyY29hbFwiKV0sXG4gIFtTdHlsZS53aW5kb3csIF8oXCJXaW5kb3dcIildLFxuXSk7XG5cbmV4cG9ydCBjb25zdCBzdHlsZXMgPSBPYmplY3QudmFsdWVzKFN0eWxlKS5maWx0ZXIoXG4gIChzdHlsZSkgPT4gdHlwZW9mIHN0eWxlID09PSBcIm51bWJlclwiLFxuKSBhcyBTdHlsZVtdO1xuXG5leHBvcnQgY29uc3Qgc2V0dGluZ3MgPSBuZXcgR2lvLlNldHRpbmdzKHsgc2NoZW1hX2lkOiBcImNvbS52aXhhbGllbi5zdGlja3lcIiB9KTtcblxuY29uc3QgZ2V0X3NldHRpbmdzID0gKCkgPT4gKHtcbiAgREVGQVVMVF9TVFlMRTogc2V0dGluZ3MuZ2V0X2VudW0oXCJkZWZhdWx0LXN0eWxlXCIpIGFzIFN0eWxlLFxuICBERUZBVUxUX1dJRFRIOiBzZXR0aW5ncy5nZXRfaW50KFwiZGVmYXVsdC13aWR0aFwiKSxcbiAgREVGQVVMVF9IRUlHSFQ6IHNldHRpbmdzLmdldF9pbnQoXCJkZWZhdWx0LWhlaWdodFwiKSxcbiAgQ09ORklSTV9ERUxFVEU6IHNldHRpbmdzLmdldF9ib29sZWFuKFwiY29uZmlybS1kZWxldGVcIiksXG59KTtcblxuZXhwb3J0IGxldCBTRVRUSU5HUyA9IGdldF9zZXR0aW5ncygpO1xuXG5zZXR0aW5ncy5jb25uZWN0KFwiY2hhbmdlZFwiLCAoKSA9PiB7XG4gIFNFVFRJTkdTID0gZ2V0X3NldHRpbmdzKCk7XG59KTtcblxuZXhwb3J0IGNsYXNzIFRhZyBleHRlbmRzIEdPYmplY3QuT2JqZWN0IHtcbiAgc3RhdGljICRndHlwZTogR09iamVjdC5HVHlwZTxUYWc+O1xuXG4gIG5hbWU6IHN0cmluZztcbiAgc3RhcnQ6IG51bWJlcjtcbiAgZW5kOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nLCBzdGFydDogbnVtYmVyID0gMCwgZW5kOiBudW1iZXIgPSAwKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMuc3RhcnQgPSBzdGFydDtcbiAgICB0aGlzLmVuZCA9IGVuZDtcbiAgfVxuXG4gIHN0YXRpYyB7XG4gICAgR09iamVjdC5yZWdpc3RlckNsYXNzKHtcbiAgICAgIEdUeXBlTmFtZTogXCJUYWdPYmplY3RcIixcbiAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgLy8gZGVuby1mbXQtaWdub3JlXG4gICAgICAgIG5hbWU6IEdPYmplY3QuUGFyYW1TcGVjLnN0cmluZyhcIm5hbWVcIiwgXCJOYW1lXCIsIFwiVGhlIG5hbWUgb2YgdGhlIHRhZ1wiLCBHT2JqZWN0LlBhcmFtRmxhZ3MuUkVBRFdSSVRFLCBcIlwiKSxcbiAgICAgICAgLy8gZGVuby1mbXQtaWdub3JlXG4gICAgICAgIHN0YXJ0OiBHT2JqZWN0LlBhcmFtU3BlYy5pbnQoXCJzdGFydFwiLCBcIlN0YXJ0XCIsIFwiU3RhcnRpbmcgcG9zaXRpb24gb2YgdGhlIHRhZ1wiLCBHT2JqZWN0LlBhcmFtRmxhZ3MuUkVBRFdSSVRFLCAwLCAxMDAsIDApLFxuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgZW5kOiBHT2JqZWN0LlBhcmFtU3BlYy5pbnQoXCJlbmRcIiwgXCJFbmRcIiwgXCJFbmRpbmcgcG9zaXRpb24gb2YgdGhlIHRhZ1wiLCBHT2JqZWN0LlBhcmFtRmxhZ3MuUkVBRFdSSVRFLCAwLCAxMDAsIDApLFxuICAgICAgfSxcbiAgICB9LCB0aGlzKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTm90ZSBleHRlbmRzIEdPYmplY3QuT2JqZWN0IHtcbiAgcHJpdmF0ZSBzdGF0aWMgdGFnX2xpc3RfcHNwZWMgPSBHT2JqZWN0LnBhcmFtX3NwZWNfb2JqZWN0KFxuICAgIFwidGFnX2xpc3RcIixcbiAgICBcIlRhZ3NcIixcbiAgICBcIlRhZ3Mgb2YgdGhlIG5vdGVcIixcbiAgICBHaW8uTGlzdFN0b3JlLiRndHlwZSxcbiAgICBHT2JqZWN0LlBhcmFtRmxhZ3MuUkVBRFdSSVRFLFxuICApO1xuXG4gIHN0YXRpYyAkZ3R5cGU6IEdPYmplY3QuR1R5cGU8Tm90ZT47XG5cbiAgdjogMTtcbiAgdXVpZDogc3RyaW5nO1xuICBjb250ZW50OiBzdHJpbmc7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIHN0eWxlOiBTdHlsZTtcbiAgdGFnX2xpc3Q6IEdpby5MaXN0U3RvcmU8VGFnPjtcbiAgbW9kaWZpZWQ6IEdMaWIuRGF0ZVRpbWU7XG4gIHdpZHRoOiBudW1iZXI7XG4gIGhlaWdodDogbnVtYmVyO1xuICBvcGVuOiBib29sZWFuO1xuXG4gIGdldCB0YWdzKCkge1xuICAgIGNvbnN0IGl0ZW1zID0gW107XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMudGFnX2xpc3QuZ2V0X25faXRlbXMoKTsgaSsrKSB7XG4gICAgICBjb25zdCB0YWcgPSB0aGlzLnRhZ19saXN0LmdldF9pdGVtKGkpITtcbiAgICAgIGl0ZW1zLnB1c2goe1xuICAgICAgICBuYW1lOiB0YWcubmFtZSxcbiAgICAgICAgc3RhcnQ6IHRhZy5zdGFydCxcbiAgICAgICAgZW5kOiB0YWcuZW5kLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGl0ZW1zO1xuICB9XG5cbiAgc2V0IHRhZ3ModGFnczogSU5vdGVbXCJ0YWdzXCJdKSB7XG4gICAgdGhpcy50YWdfbGlzdC5yZW1vdmVfYWxsKCk7XG5cbiAgICBmb3IgKGNvbnN0IHRhZyBvZiB0YWdzKSB7XG4gICAgICBjb25zdCB0YWdfb2JqZWN0ID0gbmV3IFRhZyh0YWcubmFtZSwgdGFnLnN0YXJ0LCB0YWcuZW5kKTtcbiAgICAgIHRoaXMudGFnX2xpc3QuYXBwZW5kKHRhZ19vYmplY3QpO1xuICAgIH1cblxuICAgIHRoaXMuZW1pdChcIm5vdGlmeTo6dGFnX2xpc3RcIiwgTm90ZS50YWdfbGlzdF9wc3BlYyk7XG4gIH1cblxuICBnZXQgbW9kaWZpZWRfZGF0ZSgpIHtcbiAgICByZXR1cm4gbmV3IERhdGUodGhpcy5tb2RpZmllZC50b191bml4KCkgKiAxMDAwKTtcbiAgfVxuXG4gIC8vIGFueXRoaW5nIHRoZSBjb25zdHJ1Y3RvciBvZiBkYXRlIGFjY2VwdHNcbiAgc2V0IG1vZGlmaWVkX2RhdGUoZGF0ZTogRGF0ZSkge1xuICAgIHRoaXMubW9kaWZpZWQgPSBHTGliLkRhdGVUaW1lLm5ld19mcm9tX2lzbzg2MDEoXG4gICAgICBuZXcgRGF0ZShkYXRlKS50b0lTT1N0cmluZygpLFxuICAgICAgbnVsbCxcbiAgICApO1xuICB9XG5cbiAgY29uc3RydWN0b3Iobm90ZTogSU5vdGUpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMudiA9IG5vdGUudjtcbiAgICB0aGlzLnV1aWQgPSBub3RlLnV1aWQ7XG4gICAgdGhpcy5jb250ZW50ID0gbm90ZS5jb250ZW50O1xuICAgIHRoaXMudGl0bGUgPSBub3RlLnRpdGxlO1xuICAgIHRoaXMuc3R5bGUgPSBub3RlLnN0eWxlO1xuICAgIHRoaXMudGFnX2xpc3QgPSBHaW8uTGlzdFN0b3JlLm5ldyhUYWcuJGd0eXBlKSBhcyBHaW8uTGlzdFN0b3JlPFRhZz47XG4gICAgdGhpcy50YWdzID0gbm90ZS50YWdzO1xuICAgIHRoaXMubW9kaWZpZWQgPSBHTGliLkRhdGVUaW1lLm5ld19mcm9tX2lzbzg2MDEoXG4gICAgICBuZXcgRGF0ZShub3RlLm1vZGlmaWVkKS50b0lTT1N0cmluZygpLFxuICAgICAgbnVsbCxcbiAgICApO1xuICAgIHRoaXMud2lkdGggPSBub3RlLndpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gbm90ZS5oZWlnaHQ7XG4gICAgdGhpcy5vcGVuID0gbm90ZS5vcGVuID8/IGZhbHNlO1xuXG4gICAgdGhpcy5iaW5kX3Byb3BlcnR5X2Z1bGwoXG4gICAgICBcImNvbnRlbnRcIixcbiAgICAgIHRoaXMsXG4gICAgICBcInRpdGxlXCIsXG4gICAgICBHT2JqZWN0LkJpbmRpbmdGbGFncy5TWU5DX0NSRUFURSxcbiAgICAgIChfLCBjb250ZW50KSA9PiB7XG4gICAgICAgIGlmICghY29udGVudCkgcmV0dXJuIFt0cnVlLCBcIlwiXTtcbiAgICAgICAgbGV0IHRpdGxlID0gY29udGVudC5zcGxpdChcIlxcblwiKVswXS5zbGljZSgwLCAyMCk7XG4gICAgICAgIGlmICh0aXRsZS5sZW5ndGggIT0gY29udGVudC5sZW5ndGgpIHRpdGxlICs9IFwiXHUyMDI2XCI7XG4gICAgICAgIHJldHVybiBbdHJ1ZSwgdGl0bGVdO1xuICAgICAgfSxcbiAgICAgIG51bGxcbiAgICApO1xuXG5cbiAgfVxuXG4gIHN0YXRpYyBnZW5lcmF0ZSgpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoe1xuICAgICAgdjogMSxcbiAgICAgIHV1aWQ6IEdMaWIudXVpZF9zdHJpbmdfcmFuZG9tKCksXG4gICAgICBjb250ZW50OiBcIlwiLFxuICAgICAgdGl0bGU6IFwiXCIsXG4gICAgICBzdHlsZTogU0VUVElOR1MuREVGQVVMVF9TVFlMRSxcbiAgICAgIHRhZ3M6IFtdLFxuICAgICAgbW9kaWZpZWQ6IG5ldyBEYXRlKCksXG4gICAgICB3aWR0aDogMzAwLFxuICAgICAgaGVpZ2h0OiAzMDAsXG4gICAgICBvcGVuOiBmYWxzZSxcbiAgICB9KTtcbiAgfVxuXG4gIGNvcHkoKSB7XG4gICAgcmV0dXJuIG5ldyBOb3RlKHtcbiAgICAgIHY6IHRoaXMudixcbiAgICAgIHV1aWQ6IHRoaXMudXVpZCxcbiAgICAgIGNvbnRlbnQ6IHRoaXMuY29udGVudCxcbiAgICAgIHRpdGxlOiB0aGlzLnRpdGxlLFxuICAgICAgc3R5bGU6IHRoaXMuc3R5bGUsXG4gICAgICB0YWdzOiB0aGlzLnRhZ3MubWFwKCh0YWcpID0+ICh7XG4gICAgICAgIG5hbWU6IHRhZy5uYW1lLFxuICAgICAgICBzdGFydDogdGFnLnN0YXJ0LFxuICAgICAgICBlbmQ6IHRhZy5lbmQsXG4gICAgICB9KSksXG4gICAgICBtb2RpZmllZDogbmV3IERhdGUodGhpcy5tb2RpZmllZC50b191bml4KCkgKiAxMDAwKSxcbiAgICAgIHdpZHRoOiB0aGlzLndpZHRoLFxuICAgICAgaGVpZ2h0OiB0aGlzLmhlaWdodCxcbiAgICAgIG9wZW46IHRoaXMub3BlbixcbiAgICB9KTtcbiAgfVxuXG4gIHRvSlNPTigpOiBJTm90ZSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHY6IHRoaXMudixcbiAgICAgIHV1aWQ6IHRoaXMudXVpZCxcbiAgICAgIGNvbnRlbnQ6IHRoaXMuY29udGVudCxcbiAgICAgIHRpdGxlOiB0aGlzLnRpdGxlLFxuICAgICAgc3R5bGU6IHRoaXMuc3R5bGUsXG4gICAgICB0YWdzOiB0aGlzLnRhZ3MsXG4gICAgICBtb2RpZmllZDogdGhpcy5tb2RpZmllZF9kYXRlLFxuICAgICAgd2lkdGg6IHRoaXMud2lkdGgsXG4gICAgICBoZWlnaHQ6IHRoaXMuaGVpZ2h0LFxuICAgICAgb3BlbjogdGhpcy5vcGVuLFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMge1xuICAgIEdPYmplY3QucmVnaXN0ZXJDbGFzcyh7XG4gICAgICBHVHlwZU5hbWU6IFwiTm90ZU9iamVjdFwiLFxuICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgdjogR09iamVjdC5QYXJhbVNwZWMuaW50KFwidlwiLCBcIlZlcnNpb25cIiwgXCJWZXJzaW9uIG9mIHRoZSBub3RlXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIDAsIDEwMCwgMCksXG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICB1dWlkOiBHT2JqZWN0LlBhcmFtU3BlYy5zdHJpbmcoXCJ1dWlkXCIsIFwiVVVJRFwiLCBcIlVVSUQgb2YgdGhlIG5vdGVcIiwgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSwgXCJcIiksXG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICBjb250ZW50OiBHT2JqZWN0LlBhcmFtU3BlYy5zdHJpbmcoXCJjb250ZW50XCIsIFwiQ29udGVudFwiLCBcIkNvbnRlbnQgb2YgdGhlIG5vdGVcIiwgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSwgXCJcIiksXG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICB0aXRsZTogR09iamVjdC5QYXJhbVNwZWMuc3RyaW5nKFwidGl0bGVcIiwgXCJUaXRsZVwiLCBcIlRpdGxlIG9mIHRoZSBub3RlXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIFwiXCIpLFxuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgc3R5bGU6IEdPYmplY3QuUGFyYW1TcGVjLmludChcInN0eWxlXCIsIFwiU3R5bGVcIiwgXCJTdHlsZSBvZiB0aGUgbm90ZVwiLCBHT2JqZWN0LlBhcmFtRmxhZ3MuUkVBRFdSSVRFLCAwLCAxMDAsIDApLFxuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgdGFnX2xpc3Q6IHRoaXMudGFnX2xpc3RfcHNwZWMsXG4gICAgICAgIC8vIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICBtb2RpZmllZDogR09iamVjdC5QYXJhbVNwZWMuYm94ZWQoXCJtb2RpZmllZFwiLCBcIk1vZGlmaWVkXCIsIFwiRGF0ZSB0aGUgbm90ZSB3YXMgbW9kaWZpZWRcIiwgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSwgR0xpYi5EYXRlVGltZSksXG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICB3aWR0aDogR09iamVjdC5QYXJhbVNwZWMuaW50KFwid2lkdGhcIiwgXCJXaWR0aFwiLCBcIldpZHRoIG9mIHRoZSBub3RlXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIDAsIDEwMCwgMCksXG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICBoZWlnaHQ6IEdPYmplY3QuUGFyYW1TcGVjLmludChcImhlaWdodFwiLCBcIkhlaWdodFwiLCBcIkhlaWdodCBvZiB0aGUgbm90ZVwiLCBHT2JqZWN0LlBhcmFtRmxhZ3MuUkVBRFdSSVRFLCAwLCAxMDAsIDApLFxuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgb3BlbjogR09iamVjdC5QYXJhbVNwZWMuYm9vbGVhbihcIm9wZW5cIiwgXCJPcGVuXCIsIFwiV2hldGhlciB0aGUgbm90ZSB3YXMgb3BlbiB3aGVuIHRoZSBhcHBsaWNhdGlvbiB3YXMgY2xvc2VkXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIGZhbHNlKSxcbiAgICAgIH0sXG4gICAgfSwgdGhpcyk7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGNvbmZpcm1fZGVsZXRlID0gKHdpbmRvdzogR3RrLldpbmRvdywgY2I6ICgpID0+IHZvaWQpID0+IHtcbiAgaWYgKFNFVFRJTkdTLkNPTkZJUk1fREVMRVRFKSB7XG4gICAgY29uc3QgZGlhbG9nID0gQWR3Lk1lc3NhZ2VEaWFsb2cubmV3KFxuICAgICAgd2luZG93LFxuICAgICAgXyhcIkRlbGV0ZSBOb3RlP1wiKSxcbiAgICAgIF8oXCJUaGlzIGFjdGlvbiBjYW5ub3QgYmUgdW5kb25lLiBJZiB5b3Ugd2FudCB0byBoaWRlIHRoZSBub3RlLCB5b3UgY2FuIGNsb3NlIGl0IGluc3RlYWQuXCIpLFxuICAgICk7XG4gICAgZGlhbG9nLmFkZF9yZXNwb25zZShcImNhbmNlbFwiLCBfKFwiQ2FuY2VsXCIpKTtcbiAgICBkaWFsb2cuYWRkX3Jlc3BvbnNlKFwiZGVsZXRlXCIsIF8oXCJEZWxldGVcIikpO1xuICAgIGRpYWxvZy5zZXRfcmVzcG9uc2VfYXBwZWFyYW5jZShcbiAgICAgIFwiZGVsZXRlXCIsXG4gICAgICBBZHcuUmVzcG9uc2VBcHBlYXJhbmNlLkRFU1RSVUNUSVZFLFxuICAgICk7XG4gICAgZGlhbG9nLnNldF9kZWZhdWx0X3Jlc3BvbnNlKFwiY2FuY2VsXCIpO1xuICAgIGRpYWxvZy5zZXRfY2xvc2VfcmVzcG9uc2UoXCJjYW5jZWxcIik7XG4gICAgZGlhbG9nLmNvbm5lY3QoXCJyZXNwb25zZVwiLCAoX2RpYWxvZywgcmVzcG9uc2UpID0+IHtcbiAgICAgIGlmIChyZXNwb25zZSA9PT0gXCJkZWxldGVcIikge1xuICAgICAgICBjYigpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGRpYWxvZy5wcmVzZW50KCk7XG4gIH0gZWxzZSB7XG4gICAgY2IoKTtcbiAgfVxufTtcbiIsICIvKiBNSVQgTGljZW5zZVxuICpcbiAqIENvcHlyaWdodCAoYykgMjAyMyBBbmdlbG8gVmVybGFpbiwgQ2hyaXMgRGF2aXNcbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gKiBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAqIFNPRlRXQVJFLlxuICpcbiAqIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBNSVRcbiAqL1xuXG5pbXBvcnQgR09iamVjdCBmcm9tIFwiZ2k6Ly9HT2JqZWN0XCI7XG5pbXBvcnQgR3RrIGZyb20gXCJnaTovL0d0az92ZXJzaW9uPTQuMFwiO1xuaW1wb3J0IFBhbmdvIGZyb20gXCJnaTovL1BhbmdvXCI7XG5pbXBvcnQgQWR3IGZyb20gXCJnaTovL0Fkdz92ZXJzaW9uPTFcIjtcblxuaW1wb3J0IHsgZmluZCB9IGZyb20gXCJsaW5raWZ5anNcIjtcblxuaW1wb3J0IHsgSVRhZywgTm90ZSB9IGZyb20gXCIuL3V0aWwuanNcIjtcbmltcG9ydCB7IFN0eWxlIH0gZnJvbSBcIi4vdXRpbC5qc1wiO1xuXG5jbGFzcyBBYnN0cmFjdFN0aWNreU5vdGUgZXh0ZW5kcyBHdGsuVGV4dFZpZXcge1xuICBzdGF0aWMge1xuICAgIEdPYmplY3QucmVnaXN0ZXJDbGFzcyhcbiAgICAgIHtcbiAgICAgICAgR1R5cGVOYW1lOiBcIkFic3RyYWN0U3RpY2t5Tm90ZVwiLFxuICAgICAgICBTaWduYWxzOiB7XG4gICAgICAgICAgXCJ0YWctdG9nZ2xlXCI6IHtcbiAgICAgICAgICAgIHBhcmFtX3R5cGVzOiBbR09iamVjdC5UWVBFX1NUUklORywgR09iamVjdC5UWVBFX0JPT0xFQU5dLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzZWxlY3Rpb24tY2hhbmdlZFwiOiB7fSxcbiAgICAgICAgICBcImxpbmstc2VsZWN0ZWRcIjoge1xuICAgICAgICAgICAgcGFyYW1fdHlwZXM6IFtHT2JqZWN0LlRZUEVfU1RSSU5HXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwibGluay11bnNlbGVjdGVkXCI6IHt9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHRoaXMsXG4gICAgKTtcbiAgfVxuXG4gIGJvbGRfdGFnID0gR3RrLlRleHRUYWcubmV3KFwiYm9sZFwiKTtcbiAgdW5kZXJsaW5lX3RhZyA9IEd0ay5UZXh0VGFnLm5ldyhcInVuZGVybGluZVwiKTtcbiAgaXRhbGljX3RhZyA9IEd0ay5UZXh0VGFnLm5ldyhcIml0YWxpY1wiKTtcbiAgc3RyaWtldGhyb3VnaF90YWcgPSBHdGsuVGV4dFRhZy5uZXcoXCJzdHJpa2V0aHJvdWdoXCIpO1xuICBsaW5rX3RhZyA9IEd0ay5UZXh0VGFnLm5ldyhcImxpbmtcIik7XG5cbiAgYWN0aW9ucyA9IFtcbiAgICBbXCJib2xkXCIsIHRoaXMuYm9sZF90YWddLFxuICAgIFtcInVuZGVybGluZVwiLCB0aGlzLnVuZGVybGluZV90YWddLFxuICAgIFtcIml0YWxpY1wiLCB0aGlzLml0YWxpY190YWddLFxuICAgIFtcInN0cmlrZXRocm91Z2hcIiwgdGhpcy5zdHJpa2V0aHJvdWdoX3RhZ10sXG4gIF0gYXMgW3N0cmluZywgR3RrLlRleHRUYWddW107XG5cbiAgX25vdGU/OiBOb3RlO1xuXG4gIGdldCBub3RlKCkge1xuICAgIHJldHVybiB0aGlzLl9ub3RlO1xuICB9XG5cbiAgc2V0IG5vdGUobm90ZTogTm90ZSB8IHVuZGVmaW5lZCkge1xuICAgIGlmICghbm90ZSkgcmV0dXJuO1xuXG4gICAgdGhpcy5fbm90ZSA9IG5vdGU7XG4gICAgdGhpcy5jbGVhcl90YWdzKCk7XG4gICAgdGhpcy5idWZmZXIudGV4dCA9IG5vdGUuY29udGVudDtcbiAgICB0aGlzLmluaXRfdGFncyhub3RlLnRhZ3MpO1xuXG4gICAgdGhpcy51cGRhdGVfbGlua190YWdfY29sb3IoKTtcbiAgICB0aGlzLnJlbW92ZV9saXN0ZW5lcnMoKTtcbiAgICB0aGlzLmluaXRfbGlzdGVuZXJzKCk7XG4gIH1cblxuICBsaXN0ZW5lcnMgPSBuZXcgU2V0PG51bWJlcj4oKTtcblxuICBpbml0X2xpc3RlbmVycygpIHtcbiAgICBpZiAoIXRoaXMubm90ZSkgcmV0dXJuO1xuXG4gICAgdGhpcy5saXN0ZW5lcnMuYWRkKHRoaXMubm90ZS5jb25uZWN0KFwibm90aWZ5OjpzdHlsZVwiLCAoKSA9PiB7XG4gICAgICB0aGlzLnVwZGF0ZV9saW5rX3RhZ19jb2xvcigpO1xuICAgIH0pKTtcbiAgfVxuXG4gIHJlbW92ZV9saXN0ZW5lcnMoKSB7fVxuXG4gIHN0eWxlX21hbmFnZXI6IEFkdy5TdHlsZU1hbmFnZXI7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgbm90ZT86IE5vdGUsXG4gICkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLnN0eWxlX21hbmFnZXIgPSBBZHcuU3R5bGVNYW5hZ2VyLmdldF9kZWZhdWx0KCk7XG5cbiAgICB0aGlzLnJlZ2lzdGVyX3RhZ3MoKTtcbiAgICBpZiAobm90ZSkgdGhpcy5ub3RlID0gbm90ZTtcblxuICAgIHRoaXMuYnVmZmVyLmNvbm5lY3QoXCJtYXJrLXNldFwiLCAoX2J1ZmZlciwgX2xvYywgbWFyaykgPT4ge1xuICAgICAgaWYgKCF0aGlzLm5vdGUpIHJldHVybjtcblxuICAgICAgaWYgKFxuICAgICAgICBtYXJrLm5hbWUgPT09IFwiaW5zZXJ0XCIgfHwgbWFyay5uYW1lID09PSBcInNlbGVjdGlvbl9ib3VuZFwiIHx8XG4gICAgICAgIHRoaXMuYnVmZmVyLmdldF9pdGVyX2F0X21hcmsobWFyaykuZXF1YWwoXG4gICAgICAgICAgdGhpcy5idWZmZXIuZ2V0X2l0ZXJfYXRfbWFyayh0aGlzLmJ1ZmZlci5nZXRfaW5zZXJ0KCkpLFxuICAgICAgICApXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5lbWl0KFwic2VsZWN0aW9uLWNoYW5nZWRcIik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuY2hlY2tfbGlua19zZWxlY3RlZCgpO1xuICAgIH0pO1xuICB9XG5cbiAgbGFzdF9saW5rOiBudW1iZXIgfCBmYWxzZSA9IGZhbHNlO1xuICBsYXN0X2xpbmtfZW5kOiBudW1iZXIgPSAwO1xuXG4gIGNoZWNrX2xpbmtfc2VsZWN0ZWQoKSB7XG4gICAgY29uc3QgaGFzX2xpbmsgPSB0aGlzLmhhc190YWcodGhpcy5saW5rX3RhZyk7XG5cbiAgICBpZiAoaGFzX2xpbmspIHtcbiAgICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5idWZmZXIuZ2V0X2l0ZXJfYXRfb2Zmc2V0KGhhc19saW5rKTtcblxuICAgICAgaWYgKCFzdGFydC5zdGFydHNfdGFnKHRoaXMubGlua190YWcpKSB7XG4gICAgICAgIHN0YXJ0LmJhY2t3YXJkX3RvX3RhZ190b2dnbGUodGhpcy5saW5rX3RhZyk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGVuZCA9IHN0YXJ0LmNvcHkoKTtcbiAgICAgIGVuZC5mb3J3YXJkX3RvX3RhZ190b2dnbGUodGhpcy5saW5rX3RhZyk7XG5cbiAgICAgIGlmIChcbiAgICAgICAgc3RhcnQuZ2V0X29mZnNldCgpICE9PSB0aGlzLmxhc3RfbGluayB8fFxuICAgICAgICBlbmQuZ2V0X29mZnNldCgpICE9PSB0aGlzLmxhc3RfbGlua19lbmRcbiAgICAgICkge1xuICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy5idWZmZXIuZ2V0X3RleHQoc3RhcnQsIGVuZCwgZmFsc2UpXG4gICAgICAgICAgLnJlcGxhY2UoL1xcdTIwMEIvZywgXCJcIik7XG5cbiAgICAgICAgdGhpcy5lbWl0KFwibGluay1zZWxlY3RlZFwiLCB0ZXh0KTtcblxuICAgICAgICB0aGlzLmxhc3RfbGluayA9IHN0YXJ0LmdldF9vZmZzZXQoKTtcbiAgICAgICAgdGhpcy5sYXN0X2xpbmtfZW5kID0gZW5kLmdldF9vZmZzZXQoKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGhhc19saW5rICE9PSB0aGlzLmxhc3RfbGluaykge1xuICAgICAgdGhpcy5lbWl0KFwibGluay11bnNlbGVjdGVkXCIpO1xuICAgICAgdGhpcy5sYXN0X2xpbmsgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGVfbGlua190YWdfY29sb3IoKSB7XG4gICAgaWYgKCF0aGlzLm5vdGUpIHJldHVybjtcbiAgICBsZXQgY29sb3I7XG5cbiAgICBpZiAodGhpcy5zdHlsZV9tYW5hZ2VyLmRhcmspIHtcbiAgICAgIGNvbnN0IGFjY2VudF9jb2xvciA9IHRoaXMuZ2V0X3N0eWxlX2NvbnRleHQoKS5sb29rdXBfY29sb3IoXG4gICAgICAgIFwiYWNjZW50X2ZnX2NvbG9yXCIsXG4gICAgICApO1xuICAgICAgaWYgKGFjY2VudF9jb2xvclswXSkge1xuICAgICAgICBjb2xvciA9IGFjY2VudF9jb2xvclsxXS50b19zdHJpbmcoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbG9yID0gXCIjMDAwMGZmXCI7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGFjY2VudF9jb2xvciA9IHRoaXMuZ2V0X3N0eWxlX2NvbnRleHQoKS5sb29rdXBfY29sb3IoXG4gICAgICAgIGBsaW5rX2NvbG9yXyR7U3R5bGVbdGhpcy5ub3RlLnN0eWxlXX1gLFxuICAgICAgKTtcbiAgICAgIGlmIChhY2NlbnRfY29sb3JbMF0pIHtcbiAgICAgICAgY29sb3IgPSBhY2NlbnRfY29sb3JbMV0udG9fc3RyaW5nKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb2xvciA9IFwiIzAwMDBmZlwiO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMubGlua190YWcuZm9yZWdyb3VuZCA9IGNvbG9yO1xuICB9XG5cbiAgcHJpdmF0ZSByZWdpc3Rlcl90YWdzKCkge1xuICAgIHRoaXMuYm9sZF90YWcud2VpZ2h0ID0gUGFuZ28uV2VpZ2h0LkJPTEQ7XG4gICAgdGhpcy51bmRlcmxpbmVfdGFnLnVuZGVybGluZSA9IFBhbmdvLlVuZGVybGluZS5TSU5HTEU7XG4gICAgdGhpcy5pdGFsaWNfdGFnLnN0eWxlID0gUGFuZ28uU3R5bGUuSVRBTElDO1xuICAgIHRoaXMuc3RyaWtldGhyb3VnaF90YWcuc3RyaWtldGhyb3VnaCA9IHRydWU7XG5cbiAgICB0aGlzLmxpbmtfdGFnLnVuZGVybGluZSA9IFBhbmdvLlVuZGVybGluZS5TSU5HTEU7XG5cbiAgICBpZiAodGhpcy5zdHlsZV9tYW5hZ2VyLnN5c3RlbV9zdXBwb3J0c19jb2xvcl9zY2hlbWVzKSB7XG4gICAgICB0aGlzLnN0eWxlX21hbmFnZXIuY29ubmVjdChcbiAgICAgICAgXCJub3RpZnk6OmRhcmtcIixcbiAgICAgICAgdGhpcy51cGRhdGVfbGlua190YWdfY29sb3IuYmluZCh0aGlzKSxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgdGhpcy5idWZmZXIudGFnX3RhYmxlLmFkZCh0aGlzLmJvbGRfdGFnKTtcbiAgICB0aGlzLmJ1ZmZlci50YWdfdGFibGUuYWRkKHRoaXMudW5kZXJsaW5lX3RhZyk7XG4gICAgdGhpcy5idWZmZXIudGFnX3RhYmxlLmFkZCh0aGlzLml0YWxpY190YWcpO1xuICAgIHRoaXMuYnVmZmVyLnRhZ190YWJsZS5hZGQodGhpcy5zdHJpa2V0aHJvdWdoX3RhZyk7XG4gICAgdGhpcy5idWZmZXIudGFnX3RhYmxlLmFkZCh0aGlzLmxpbmtfdGFnKTtcbiAgfVxuXG4gIGluaXRfdGFncyh0YWdzOiBOb3RlW1widGFnc1wiXSkge1xuICAgIGZvciAoY29uc3QgdGFnIG9mIHRhZ3MpIHtcbiAgICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5idWZmZXIuZ2V0X2l0ZXJfYXRfb2Zmc2V0KHRhZy5zdGFydCk7XG4gICAgICBjb25zdCBlbmQgPSB0aGlzLmJ1ZmZlci5nZXRfaXRlcl9hdF9vZmZzZXQodGFnLmVuZCk7XG4gICAgICB0aGlzLmJ1ZmZlci5hcHBseV90YWdfYnlfbmFtZSh0YWcubmFtZSwgc3RhcnQsIGVuZCk7XG4gICAgfVxuICB9XG5cbiAgaGFzX3RhZyh0YWc6IEd0ay5UZXh0VGFnKSB7XG4gICAgbGV0IFtzZWxlY3Rpb24sIHN0YXJ0LCBlbmRdID0gdGhpcy5idWZmZXIuZ2V0X3NlbGVjdGlvbl9ib3VuZHMoKTtcbiAgICBpZiAoIXNlbGVjdGlvbikge1xuICAgICAgc3RhcnQgPSB0aGlzLmJ1ZmZlci5nZXRfaXRlcl9hdF9tYXJrKFxuICAgICAgICB0aGlzLmJ1ZmZlci5nZXRfaW5zZXJ0KCksXG4gICAgICApO1xuICAgICAgZW5kID0gc3RhcnQuY29weSgpO1xuICAgICAgZW5kLmZvcndhcmRfY3Vyc29yX3Bvc2l0aW9uKCk7XG4gICAgfVxuXG4gICAgZG8ge1xuICAgICAgaWYgKHN0YXJ0Lmhhc190YWcodGFnKSAhPT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIHN0YXJ0LmdldF9vZmZzZXQoKTtcbiAgICAgIH1cbiAgICAgIHN0YXJ0LmZvcndhcmRfY2hhcigpO1xuICAgIH0gd2hpbGUgKHN0YXJ0LmNvbXBhcmUoZW5kKSA8IDApO1xuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgYXBwbHlfdGFnKHRhZzogR3RrLlRleHRUYWcpIHtcbiAgICBsZXQgW3NlbGVjdGlvbiwgc3RhcnQsIGVuZF0gPSB0aGlzLmJ1ZmZlci5nZXRfc2VsZWN0aW9uX2JvdW5kcygpO1xuICAgIC8vIGlmIG5vIHNlbGVjdGlvbiwgYXBwbHkgdG8gdGhlIGN1cnJlbnQgd29yZFxuICAgIGlmICghc2VsZWN0aW9uKSB7XG4gICAgICAvKipcbiAgICAgICAqIElmIHRoZSB1c2VyIGhhcyBub3Qgc2VsZWN0ZWQgYW55dGhpbmcsIHdlIGluc2VydCB6ZXJvLXdpZHRoIHNwYWNlc1xuICAgICAgICogYXJvdW5kIHRoZSBjdXJzb3IgYW5kIG1hcmsgdGhlbSBhcyB0aGUgc3RhcnQgYW5kIGVuZCBvZiB0aGUgc2VsZWN0aW9uLlxuICAgICAgICovXG4gICAgICBjb25zdCBnZXRfY3Vyc29yX3Bvc2l0aW9uID0gKCkgPT4gdGhpcy5idWZmZXIuY3Vyc29yX3Bvc2l0aW9uO1xuXG4gICAgICB0aGlzLmJ1ZmZlci5pbnNlcnRfYXRfY3Vyc29yKFwiXFx1MjAwQlxcdTIwMEJcXHUyMDBCXCIsIDkpO1xuICAgICAgc3RhcnQgPSB0aGlzLmJ1ZmZlci5nZXRfaXRlcl9hdF9vZmZzZXQoZ2V0X2N1cnNvcl9wb3NpdGlvbigpIC0gMyk7XG4gICAgICBlbmQgPSB0aGlzLmJ1ZmZlci5nZXRfaXRlcl9hdF9vZmZzZXQoZ2V0X2N1cnNvcl9wb3NpdGlvbigpIC0gMSk7XG4gICAgICBjb25zdCBzZWxlYyA9IHRoaXMuYnVmZmVyLmdldF9pdGVyX2F0X29mZnNldChnZXRfY3Vyc29yX3Bvc2l0aW9uKCkpO1xuICAgICAgc2VsZWMuYmFja3dhcmRfY2hhcnMoMik7XG4gICAgICB0aGlzLmJ1ZmZlci5wbGFjZV9jdXJzb3Ioc2VsZWMpO1xuICAgIH1cblxuICAgIGNvbnN0IGhhc190YWcgPSB0aGlzLmhhc190YWcodGFnKTtcblxuICAgIGlmICh0aGlzLmhhc190YWcodGFnKSAhPT0gZmFsc2UpIHtcbiAgICAgIHRoaXMuYnVmZmVyLnJlbW92ZV90YWcodGFnLCBzdGFydCwgZW5kKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5idWZmZXIuYXBwbHlfdGFnKHRhZywgc3RhcnQsIGVuZCk7XG4gICAgfVxuXG4gICAgdGhpcy5lbWl0KFwidGFnLXRvZ2dsZVwiLCB0YWcubmFtZSwgaGFzX3RhZyA9PT0gZmFsc2UpO1xuICB9XG5cbiAgY2xlYXJfdGFncygpIHtcbiAgICBjb25zdCBzdGFydCA9IHRoaXMuYnVmZmVyLmdldF9zdGFydF9pdGVyKCk7XG4gICAgY29uc3QgZW5kID0gdGhpcy5idWZmZXIuZ2V0X2VuZF9pdGVyKCk7XG5cbiAgICBmb3IgKGNvbnN0IFtuYW1lLCB0YWddIG9mIHRoaXMuYWN0aW9ucykge1xuICAgICAgdGhpcy5idWZmZXIucmVtb3ZlX3RhZyh0YWcsIHN0YXJ0LCBlbmQpO1xuICAgICAgdGhpcy5lbWl0KFwidGFnLXRvZ2dsZVwiLCBuYW1lLCBmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0X3RhZ3MoKSB7XG4gICAgY29uc3QgdGFnczogTm90ZVtcInRhZ3NcIl0gPSBbXTtcblxuICAgIHRoaXMuYnVmZmVyLmdldF90YWdfdGFibGUoKS5mb3JlYWNoKCh0YWcpID0+IHtcbiAgICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5idWZmZXIuZ2V0X3N0YXJ0X2l0ZXIoKTtcblxuICAgICAgZG8ge1xuICAgICAgICBpZiAoIXN0YXJ0LnN0YXJ0c190YWcodGFnKSkgY29udGludWU7XG5cbiAgICAgICAgY29uc3QgYmVnaW4gPSBzdGFydC5jb3B5KCk7XG4gICAgICAgIHN0YXJ0LmZvcndhcmRfdG9fdGFnX3RvZ2dsZSh0YWcpO1xuXG4gICAgICAgIHRhZ3MucHVzaCh7XG4gICAgICAgICAgbmFtZTogdGFnLm5hbWUsXG4gICAgICAgICAgc3RhcnQ6IGJlZ2luLmdldF9vZmZzZXQoKSxcbiAgICAgICAgICBlbmQ6IHN0YXJ0LmdldF9vZmZzZXQoKSxcbiAgICAgICAgfSk7XG4gICAgICB9IHdoaWxlIChzdGFydC5mb3J3YXJkX3RvX3RhZ190b2dnbGUodGFnKSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGFncztcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVhZG9ubHlTdGlja3lOb3RlIGV4dGVuZHMgQWJzdHJhY3RTdGlja3lOb3RlIHtcbiAgc3RhdGljIHtcbiAgICBHT2JqZWN0LnJlZ2lzdGVyQ2xhc3MoXG4gICAgICB7XG4gICAgICAgIEdUeXBlTmFtZTogXCJSZWFkb25seVN0aWNreU5vdGVcIixcbiAgICAgIH0sXG4gICAgICB0aGlzLFxuICAgICk7XG4gIH1cblxuICBjb25zdHJ1Y3Rvcihub3RlPzogTm90ZSkge1xuICAgIHN1cGVyKG5vdGUpO1xuXG4gICAgdGhpcy5ub3RlID0gbm90ZTtcbiAgICB0aGlzLmVkaXRhYmxlID0gZmFsc2U7XG4gICAgdGhpcy5jdXJzb3JfdmlzaWJsZSA9IGZhbHNlO1xuICAgIHRoaXMuc2hvd19jb250ZW50KCk7XG4gIH1cblxuICBzZXQgbm90ZShub3RlOiBOb3RlIHwgdW5kZWZpbmVkKSB7XG4gICAgdGhpcy5fbm90ZSA9IHN1cGVyLm5vdGUgPSBub3RlO1xuXG4gICAgdGhpcy5zaG93X2NvbnRlbnQoKTtcbiAgfVxuXG4gIGdldCBub3RlKCkge1xuICAgIHJldHVybiBzdXBlci5ub3RlO1xuICB9XG5cbiAgY2xpcF9jb250ZW50KGNvbnRlbnQ6IHN0cmluZykge1xuICAgIGNvbnN0IE1BWF9MSU5FUyA9IDU7XG4gICAgY29uc3QgTUFYX0NIQVJTID0gMjQwO1xuXG4gICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvXFxzKyQvLCBcIlwiKTtcblxuICAgIGxldCBjdXQgPSBjb250ZW50LnNwbGl0KFwiXFxuXCIpLnNsaWNlKDAsIE1BWF9MSU5FUykuam9pbihcIlxcblwiKTtcblxuICAgIGlmIChjdXQubGVuZ3RoID4gTUFYX0NIQVJTKSB7XG4gICAgICBjdXQgPSBjdXQuc2xpY2UoMCwgTUFYX0NIQVJTKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY3V0Lmxlbmd0aCA8IGNvbnRlbnQubGVuZ3RoID8gYCR7Y3V0fVx1MjAyNmAgOiBjdXQ7XG4gIH1cblxuICBzaG93X2NvbnRlbnQoKSB7XG4gICAgaWYgKCF0aGlzLm5vdGUpIHJldHVybjtcblxuICAgIGlmICghdGhpcy5ub3RlLmNvbnRlbnQucmVwbGFjZSgvXFxzL2csIFwiXCIpKSB7XG4gICAgICB0aGlzLmJ1ZmZlci50ZXh0ID0gXCJcIjtcbiAgICAgIHRoaXMuYnVmZmVyLmluc2VydF9tYXJrdXAoXG4gICAgICAgIHRoaXMuYnVmZmVyLmdldF9zdGFydF9pdGVyKCksXG4gICAgICAgIGA8aT4oJHtfKFwiRW1wdHkgTm90ZVwiKX0pPC9pPmAsXG4gICAgICAgIC0xLFxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5idWZmZXIudGV4dCA9IHRoaXMuY2xpcF9jb250ZW50KHRoaXMubm90ZSEuY29udGVudCk7XG4gICAgICB0aGlzLmNsZWFyX3RhZ3MoKTtcbiAgICAgIHRoaXMuaW5pdF90YWdzKHRoaXMubm90ZSEudGFncyk7XG4gICAgfVxuICB9XG5cbiAgaW5pdF9saXN0ZW5lcnMoKSB7XG4gICAgc3VwZXIuaW5pdF9saXN0ZW5lcnMoKTtcblxuICAgIGlmICghdGhpcy5ub3RlKSByZXR1cm47XG5cbiAgICB0aGlzLmxpc3RlbmVycy5hZGQodGhpcy5ub3RlLmNvbm5lY3QoXCJub3RpZnk6OmNvbnRlbnRcIiwgKCkgPT4ge1xuICAgICAgdGhpcy5zaG93X2NvbnRlbnQoKTtcbiAgICB9KSk7XG5cbiAgICB0aGlzLmxpc3RlbmVycy5hZGQodGhpcy5ub3RlLmNvbm5lY3QoXCJub3RpZnk6OnRhZ19saXN0XCIsICgpID0+IHtcbiAgICAgIHRoaXMuY2xlYXJfdGFncygpO1xuICAgICAgdGhpcy5pbml0X3RhZ3ModGhpcy5ub3RlIS50YWdzKTtcbiAgICB9KSk7XG4gIH1cblxuICByZW1vdmVfbGlzdGVuZXJzKCkge1xuICAgIHN1cGVyLnJlbW92ZV9saXN0ZW5lcnMoKTtcblxuICAgIGlmICghdGhpcy5ub3RlKSByZXR1cm47XG5cbiAgICBmb3IgKGNvbnN0IGxpc3RlbmVyIG9mIHRoaXMubGlzdGVuZXJzKSB7XG4gICAgICB0aGlzLm5vdGUhLmRpc2Nvbm5lY3QobGlzdGVuZXIpO1xuICAgIH1cblxuICAgIHRoaXMubGlzdGVuZXJzLmNsZWFyKCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFdyaXRlYWJsZVN0aWNreU5vdGUgZXh0ZW5kcyBBYnN0cmFjdFN0aWNreU5vdGUge1xuICBzdGF0aWMge1xuICAgIEdPYmplY3QucmVnaXN0ZXJDbGFzcyhcbiAgICAgIHtcbiAgICAgICAgR1R5cGVOYW1lOiBcIldyaXRlYWJsZVN0aWNreU5vdGVcIixcbiAgICAgIH0sXG4gICAgICB0aGlzLFxuICAgICk7XG4gIH1cblxuICB1cGRhdGluZyA9IGZhbHNlO1xuICBzb3VyY2U6IG51bWJlciB8IG51bGwgPSBudWxsO1xuXG4gIGdldCBub3RlKCkge1xuICAgIHJldHVybiBzdXBlci5ub3RlO1xuICB9XG5cbiAgc2V0IG5vdGUobm90ZTogTm90ZSB8IHVuZGVmaW5lZCkge1xuICAgIHRoaXMudXBkYXRpbmcgPSB0cnVlO1xuICAgIHN1cGVyLm5vdGUgPSBub3RlO1xuICB9XG5cbiAgY2hhbmdlPFQgZXh0ZW5kcyBrZXlvZiBOb3RlPihrZXk6IFQsIHZhbHVlOiBOb3RlW1RdKSB7XG4gICAgaWYgKCF0aGlzLm5vdGUpIHJldHVybjtcbiAgICB0aGlzLm5vdGVba2V5XSA9IHZhbHVlO1xuICAgIHRoaXMubm90ZS5tb2RpZmllZF9kYXRlID0gbmV3IERhdGUoKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKG5vdGU/OiBOb3RlKSB7XG4gICAgc3VwZXIobm90ZSk7XG5cbiAgICB0aGlzLmJ1ZmZlci5jb25uZWN0X2FmdGVyKFwiaW5zZXJ0LXRleHRcIiwgKGJ1ZmZlciwgbG9jLCB0ZXh0LCBsZW5ndGgpID0+IHtcbiAgICAgIHRoaXMub25fdGV4dF9pbnNlcnRlZChidWZmZXIsIGxvYywgdGV4dCwgbGVuZ3RoKTtcbiAgICB9KTtcblxuICAgIHRoaXMuYnVmZmVyLmNvbm5lY3QoXCJjaGFuZ2VkXCIsICgpID0+IHtcbiAgICAgIGlmICh0aGlzLnVwZGF0aW5nKSB7XG4gICAgICAgIHRoaXMudXBkYXRpbmcgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy51cGRhdGVfbGlua3MoKTtcbiAgICAgIGlmICh0aGlzLmJ1ZmZlci50ZXh0ID09IHRoaXMubm90ZSEuY29udGVudCkgcmV0dXJuO1xuICAgICAgdGhpcy5jaGFuZ2UoXCJjb250ZW50XCIsIHRoaXMuYnVmZmVyLnRleHQpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5idWZmZXIuY29ubmVjdChcIm1hcmstc2V0XCIsICgpID0+IHtcbiAgICAgIGlmICghdGhpcy5ub3RlKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IHRhZ3MgPSB0aGlzLmdldF90YWdzKCk7XG4gICAgICBpZiAoY29tcGFyZV90YWdzKHRhZ3MsIHRoaXMubm90ZS50YWdzKSkgcmV0dXJuO1xuICAgICAgdGhpcy5ub3RlLnRhZ3MgPSB0YWdzO1xuICAgIH0pO1xuICB9XG5cbiAgY2xlYXJfbGlua3MoKSB7XG4gICAgdGhpcy5idWZmZXIucmVtb3ZlX3RhZyhcbiAgICAgIHRoaXMubGlua190YWcsXG4gICAgICB0aGlzLmJ1ZmZlci5nZXRfc3RhcnRfaXRlcigpLFxuICAgICAgdGhpcy5idWZmZXIuZ2V0X2VuZF9pdGVyKCksXG4gICAgKTtcbiAgICB0aGlzLmVtaXQoXCJ0YWctdG9nZ2xlXCIsIFwibGlua1wiLCBmYWxzZSk7XG4gIH1cblxuICB1cGRhdGVfbGlua3MoKSB7XG4gICAgY29uc3QgdGV4dCA9IHRoaXMuYnVmZmVyLnRleHQ7XG5cbiAgICB0aGlzLmNsZWFyX2xpbmtzKCk7XG5cbiAgICBmaW5kKHRleHQpXG4gICAgICAuZm9yRWFjaCgobWF0Y2gpID0+IHtcbiAgICAgICAgY29uc3Qgc3RhcnQgPSB0aGlzLmJ1ZmZlci5nZXRfaXRlcl9hdF9vZmZzZXQobWF0Y2guc3RhcnQpO1xuICAgICAgICBjb25zdCBlbmQgPSB0aGlzLmJ1ZmZlci5nZXRfaXRlcl9hdF9vZmZzZXQobWF0Y2guZW5kKTtcblxuICAgICAgICB0aGlzLmJ1ZmZlci5hcHBseV90YWcodGhpcy5saW5rX3RhZywgc3RhcnQsIGVuZCk7XG4gICAgICB9KTtcblxuICAgIHRoaXMuZW1pdChcInRhZy10b2dnbGVcIiwgXCJsaW5rXCIsIHRydWUpO1xuICB9XG5cbiAgY2xlYXJfdGFncygpIHtcbiAgICBzdXBlci5jbGVhcl90YWdzKCk7XG4gICAgLy8gdGhpcy5jaGFuZ2UoXCJ0YWdzXCIsIFtdKTtcbiAgfVxuXG4gIGFwcGx5X3RhZyh0YWc6IEd0ay5UZXh0VGFnKSB7XG4gICAgc3VwZXIuYXBwbHlfdGFnKHRhZyk7XG4gICAgY29uc3QgdGFncyA9IHRoaXMuZ2V0X3RhZ3MoKTtcbiAgICBpZiAoY29tcGFyZV90YWdzKHRhZ3MsIHRoaXMubm90ZSEudGFncykpIHJldHVybjtcbiAgICB0aGlzLmNoYW5nZShcInRhZ3NcIiwgdGFncyk7XG4gIH1cblxuICBvbl90ZXh0X2luc2VydGVkKFxuICAgIGJ1ZmZlcjogR3RrLlRleHRCdWZmZXIsXG4gICAgbG9jOiBHdGsuVGV4dEl0ZXIsXG4gICAgdGV4dDogc3RyaW5nLFxuICAgIGxlbmd0aDogbnVtYmVyLFxuICApIHtcbiAgICBpZiAodGV4dCA9PT0gXCJcXG5cIikge1xuICAgICAgY29uc3Qgc3RhcnRfaXRlciA9IGxvYy5jb3B5KCk7XG4gICAgICBzdGFydF9pdGVyLmJhY2t3YXJkX2NoYXIoKTtcbiAgICAgIHN0YXJ0X2l0ZXIuc2V0X2xpbmVfb2Zmc2V0KDApO1xuXG4gICAgICBjb25zdCBlbmRfaXRlciA9IHN0YXJ0X2l0ZXIuY29weSgpO1xuICAgICAgZW5kX2l0ZXIuZm9yd2FyZF9jaGFycygyKTtcbiAgICAgIGNvbnN0IGNoYXJzID0gYnVmZmVyLmdldF90ZXh0KHN0YXJ0X2l0ZXIsIGVuZF9pdGVyLCBmYWxzZSk7XG5cbiAgICAgIGNvbnN0IHNpbXBsZV9yZWdleF9wYXR0ZXJuID0gL15bLSsqXSAkLztcbiAgICAgIGlmIChzaW1wbGVfcmVnZXhfcGF0dGVybi50ZXN0KGNoYXJzKSkge1xuICAgICAgICBjb25zdCBidWxsZXQgPSBjaGFyc1swXTtcbiAgICAgICAgY29uc3QgbGluZV9lbmQgPSBsb2MuY29weSgpO1xuICAgICAgICBsaW5lX2VuZC5iYWNrd2FyZF9jaGFyKCk7XG4gICAgICAgIGlmIChsaW5lX2VuZC5nZXRfbGluZV9vZmZzZXQoKSA9PT0gMikge1xuICAgICAgICAgIHN0YXJ0X2l0ZXIuc2V0X2xpbmVfb2Zmc2V0KDApO1xuICAgICAgICAgIGJ1ZmZlci5kZWxldGUoc3RhcnRfaXRlciwgbG9jKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBidWZmZXIuaW5zZXJ0KGxvYywgYnVsbGV0ICsgXCIgXCIsIC0xKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgc2VhcmNoX2xpbWl0ID0gc3RhcnRfaXRlci5jb3B5KCk7XG4gICAgICAgIGNvbnN0IHNlYXJjaF9lbmQgPSBzdGFydF9pdGVyLmNvcHkoKTtcbiAgICAgICAgc2VhcmNoX2xpbWl0LmZvcndhcmRfY2hhcnMoMTApO1xuXG4gICAgICAgIHNlYXJjaF9lbmQuZm9yd2FyZF9maW5kX2NoYXIoKGNoKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJmb3J3YXJkIGNoYXJcIixjaCk7XG4gICAgICAgICAgcmV0dXJuIGNoID09PSBcIiBcIjtcbiAgICAgICAgfSwgc2VhcmNoX2xpbWl0KTtcbiAgICAgICAgc2VhcmNoX2VuZC5mb3J3YXJkX2NoYXIoKTtcbiAgICAgICAgY29uc3QgY2hhcnMgPSBidWZmZXIuZ2V0X3RleHQoc3RhcnRfaXRlciwgc2VhcmNoX2VuZCwgZmFsc2UpO1xuXG4gICAgICAgIGNvbnN0IG9yZGVyZWRfcmVnZXhfcGF0dGVybiA9IC9eXFxkK1xcLiAkLztcbiAgICAgICAgaWYgKG9yZGVyZWRfcmVnZXhfcGF0dGVybi50ZXN0KGNoYXJzKSkge1xuICAgICAgICAgIGNvbnN0IGN1cnJlbnRfb3JkZXIgPSBwYXJzZUludChjaGFycy5zbGljZSgwLCAtMikpO1xuICAgICAgICAgIGNvbnN0IG5ld19vcmRlciA9IGN1cnJlbnRfb3JkZXIgKyAxO1xuICAgICAgICAgIGNvbnN0IG5ld19vcmRlcl9idWxsZXQgPSBgJHtuZXdfb3JkZXJ9LiBgO1xuICAgICAgICAgIGNvbnN0IGxpbmVfZW5kID0gbG9jLmNvcHkoKTtcbiAgICAgICAgICBsaW5lX2VuZC5iYWNrd2FyZF9jaGFyKCk7XG5cbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBsaW5lX2VuZC5nZXRfbGluZV9vZmZzZXQoKSA9PT0gY3VycmVudF9vcmRlci50b1N0cmluZygpLmxlbmd0aCArIDJcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHN0YXJ0X2l0ZXIuc2V0X2xpbmVfb2Zmc2V0KDApO1xuICAgICAgICAgICAgYnVmZmVyLmRlbGV0ZShzdGFydF9pdGVyLCBsb2MpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBidWZmZXIuaW5zZXJ0KGxvYywgbmV3X29yZGVyX2J1bGxldCwgLTEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5jb25zdCBjb21wYXJlX3RhZ3MgPSAoYTogSVRhZ1tdLCBiOiBJVGFnW10pID0+IHtcbiAgaWYgKGEubGVuZ3RoICE9IGIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gIGZvciAoY29uc3QgdGFnIG9mIGEpIHtcbiAgICBpZiAoXG4gICAgICAhYi5maW5kKCh0KSA9PlxuICAgICAgICB0Lm5hbWUgPT0gdGFnLm5hbWUgJiYgdC5zdGFydCA9PSB0YWcuc3RhcnQgJiYgdC5lbmQgPT0gdGFnLmVuZFxuICAgICAgKVxuICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn07XG4iLCAiLy8gVEhJUyBGSUxFIElTIEFVVE9NQVRJQ0FMTFkgR0VORVJBVEVEIERPIE5PVCBFRElUIERJUkVDVExZXG4vLyBTZWUgdXBkYXRlLXRsZHMuanMgZm9yIGVuY29kaW5nL2RlY29kaW5nIGZvcm1hdFxuLy8gaHR0cHM6Ly9kYXRhLmlhbmEub3JnL1RMRC90bGRzLWFscGhhLWJ5LWRvbWFpbi50eHRcbmNvbnN0IGVuY29kZWRUbGRzID0gJ2FhYTFycDNiYXJ0aDRiMG90dDN2aWU0YzFsZTJvZ2FkbzV1ZGhhYmk3YzBhZGVteTVjZW50dXJlNm91bnRhbnQwczlvMXRvcjRkMHMxdWx0NGUwZzFybzJ0bmE0ZjBsMXJpY2E1ZzBha2hhbjVlbmN5NWkwZzFyYnVzM2ZvcmNlNXRlbDVrZG4zbDBmYXJvbWVvN2liYWJhNHBheTRsZmluYW56NnN0YXRlNXkyc2FjZTN0b201bTBhem9uNGVyaWNhbmV4cHJlc3M3ZmFtaWx5MTF4MmZhbTNpY2Ezc3RlcmRhbThuYWx5dGljczdkcm9pZDVxdWFuNHoybzBsMnBhcnRtZW50czhwMGxlNHEwdWFyZWxsZThyMGFiMW1jbzRjaGkzbXkycGEydDBlM3MwZGEyaWEyc29jaWF0ZXM5dDBobGV0YTV0b3JuZXk3dTBjdGlvbjVkaTBibGUzbzNzcG9zdDV0aG9yM28wczR2aWFuY2E2dzBzMngwYTJ6MHVyZTViYTBieTJpZHUzbmFtZXgzbmFyZXB1YmxpYzExZDFrMnIwY2Vsb25hNWxheWNhcmQ0czVlZm9vdDVnYWluczZzZWJhbGw1a2V0YmFsbDh1aGF1czV5ZXJuNWIwYzF0MXZhM2NnMW4yZDFlMGF0czJ1dHk0ZXIybnRsZXk1cmxpbjRzdDBidXk1dDJmMWcxaDBhcnRpNWkwYmxlM2Qxa2UybmcwbzNvMXoyajFsYWNrMGZyaWRheTlvY2tidXN0ZXI4ZzFvbWJlcmc3dWUzbTBzMXcybjBwcGFyaWJhczlvMGF0czNlaHJpbmdlcjhmYTJtMW5kMm8wazBpbmc1c2NoMnRpazJvbjR0MXV0aXF1ZTZ4MnIwYWRlc2NvNmlkZ2VzdG9uZTlvYWR3YXk1a2VyM3RoZXI1dXNzZWxzN3MxdDF1aWxkMGVyczZzaW5lc3M2eTF6ejN2MXcxeTF6MGgzY2EwYjFmZTJsMGwxdmlua2xlaW45bTBlcmEzcDJub24zcGV0b3duNWl0YWwwb25lOHIwYXZhbjRkczJlMGVyMHM0czJzYTFlMWgxaW5vNHQwZXJpbmc1aG9saWM3YmExbjFyZTJzMmMxZDFlbnRlcjRvMXJuM2YwYTFkMmcxaDBhbmVsMm5lbDRyaXR5NHNlMnQyZWFwM2ludGFpNXJpc3RtYXM2b21lNHVyY2g1aTBwcmlhbmk2cmNsZTRzY28zdGFkZWw0aTBjMnkwZWF0czdrMWwwYWltczRlYW5pbmc2aWNrMm5pYzFxdWU2b3RoaW5nNXVkM3ViMG1lZDZtMW4xbzBhY2gzZGVzM2ZmZWU0bGxlZ2U0b2duZTVtMGNhc3Q0bWJhbms0dW5pdHk2cGFueTJyZTN1dGVyNXNlYzRuZG9zM3N0cnVjdGlvbjh1bHRpbmc3dGFjdDNyYWN0b3JzOW9raW5nMGNoYW5uZWwxMWwxcDJyc2ljYTV1bnRyeTRwb24wczRyc2VzNnBhMnIwZWRpdDBjYXJkNHVuaW9uOWlja2V0NW93bjNzMXVpc2UwczZ1MGlzaW5lbGxhOXYxdzF4MXkwbXJ1M291M3oyZGFidXIzZDFuY2UzdGExZTFpbmczc3VuNHkyY2xrM2RzMmUwYWwwZXIyczNncmVlNGxpdmVyeTVsMW9pdHRlNXRhM21vY3JhdDZudGFsMmlzdDVzaTBnbjR2MmhsMmlhbW9uZHM2ZXQyZ2l0YWw1cmVjdDBvcnk3c2NvdW50M3ZlcjVoMnkyajFrMW0xbnAybzBjczF0b3I0ZzFtYWluczV0MXdubG9hZDdyaXZlNHR2MnViYWkzbmxvcDRwb250NHJiYW41dmFnMnIyejJlYXJ0aDN0MmMwbzJkZWthM3UwY2F0aW9uOGUxZzFtYWlsM2VyY2s1bmVyZ3k0Z2luZWVyMGluZzl0ZXJwcmlzZXMxMHBzb240cXVpcG1lbnQ4cjBpY3Nzb242bmkzczBxMXRhdGU1dDBpc2FsYXQ3dTByb3Zpc2lvbjhzMnZlbnRzNXhjaGFuZ2U2cGVydDNvc2VkNHJlc3M1dHJhc3BhY2UxMGZhZ2UyaWwxcndpbmRzNnRoM21pbHk0bjBzMnJtMGVyczVzaGlvbjR0M2VkZXgzZWRiYWNrNnJyYXJpM2VybzZpMGF0MmRlbGl0eTVvMmxtMm5hbDFuY2UxaWFsN3JlMHN0b25lNm1kYWxlNnNoMGluZzV0MG5lc3M2ajFrMWxpY2tyM2dodHM0cjJvcmlzdDR3ZXJzNXkybTFvMG8wZDBuZXR3b3JrOHRiYWxsNnJkMWV4MnNhbGU0dW0zdW5kYXRpb244eDJyMGVlMXNlbml1czdsMW9nYW5zNG50ZG9vcjRpZXI3dHIydWppdHN1NW4wZDJybml0dXJlN3Rib2w1eWkzZ2EwbDBsZXJ5M28xdXA0bWUwczNwMXJkZW40eTJiMGl6M2QwbjJlMGExbnQwaW5nNW9yZ2U1ZjFnMGVlM2gxaTBmdDBzM3ZlczJpbmc1bDBhc3MzZTFvYmFsMm80bTBhaWwzYmgybzF4Mm4xb2RhZGR5NWxkMHBvaW50NmYybzBkeWVhcjVnMGxlNHAxdDF2MnAxcTFyMGFpbmdlcjVwaGljczV0aXM0ZWVuM2lwZTNvY2VyeTR1cDRzMXQxdTBhcmRpYW42Y2NpM2dlMmlkZTJ0YXJzNXJ1M3cxeTJoYWlyMm1idXJnNW5nb3V0NXVzM2JvMmRmYzBiYW5rN2VhbHRoMGNhcmU4bHAxc2lua2k2cmUxbWVzNWd0djNpcGhvcDRzYW1pdHN1N3RhY2hpNXYyazB0Mm0xbjFvY2tleTRsZGluZ3M1aWRheTVtZWRlcG90NWdvb2RzNXMwZW5zZTduZGEzcnNlM3NwaXRhbDV0MGluZzV0MGVsZXMyczNtYWlsNXVzZTN3MnIxc2JjM3QxdTBnaGVzNXlhdHQzdW5kYWk3aWJtMmNiYzJlMXUyZDFlMGVlM2ZtMmthbm80bDFtMGFtYXQ0ZGIybW8wYmlsaWVuOW4wYzFkdXN0cmllczhmaW5pdGk1bzJnMWsxc3RpdHV0ZTZ1cmFuY2U0ZTR0MGVybmF0aW9uYWwxMHVpdDR2ZXN0bWVudHMxMG8xcGlyYW5nYTdxMXIwaXNoNHMwbWFpbGk1dDBhbmJ1bDd0MGF1MnYzamFndWFyNHZhM2NiMmUwZXAydHp0M3dlbHJ5NmlvMmxsMm0wcDJuajJvMGJzMXVyZzR0MXkycDBtb3JnYW42cnMzdWVnb3M0bmlwZXI3a2F1ZmVuNWRkaTNlMHJyeWhvdGVsczZsb2dpc3RpY3M5cHJvcGVydGllczE0ZmgyZzFoMWkwYTFkczJtMW5kZXIybGU0dGNoZW41d2kzbTFuMW9lbG4zbWF0c3U1c2hlcjVwMG1nMm4ycjBkMWVkM3Vva2dyb3VwOHcxeTBvdG80ejJsYTBjYWl4YTVtYm9yZ2hpbmk4ZXIzbmNhc3RlcjVpYTNkMHJvdmVyNnhlc3M1c2FsbGU1dDBpbm8zcm9iZTV3MHllcjViMWMxZHMyZWFzZTNjbGVyYzVmcmFrNGdhbDJvMnh1czRnYnQzaTBkbDJmZTBpbnN1cmFuY2U5c3R5bGU3Z2h0aW5nNmtlMmxseTNtaXRlZDRvMm5jb2xuNGRlMmsycHN5M3ZlMWluZzVrMWxjMXAyb2FuMHMzY2tlcjN1czNsMW5kb240dHRlMW8zdmUzcGwwZmluYW5jaWFsMTFyMXMxdDBkMGEzdTBuZGJlY2s2eGUxdXJ5NXYxeTJtYTBjeXMzZHJpZDRpZjFzb240a2V1cDRuMGFnZW1lbnQ3Z28zcDFya2V0MGluZzNzNHJpb3R0NXNoYWxsczdzZXJhdGk2dHRlbDViYTJjMGtpbnNleTdkMWUwZDBpYTNldDJsYm91cm5lN21lMW9yaWFsNm4wdTJyY2ttc2Q3ZzFoMWlhbWkzY3Jvc29mdDdsMW5pMXQydDBzdWJpc2hpOWsxbDBiMXMybTBhMm4xbzBiaTBsZTRkYTJlMWkxbTFuYXNoM2V5MnN0ZXI1cm1vbjN0Z2FnZTZzY293NHRvMHJjeWNsZXM5djBpZTRwMXExcjFzMGQydDBuMXIydTBzZXVtM2ljM3R1YWw1djF3MXgxeTF6Mm5hMGIxZ295YTRtZTJ0dXJhNHZ5M2JhMmMxZTBjMXQwYmFuazRmbGl4NHdvcms1dXN0YXI1dzBzMnh0MGRpcmVjdDd1czRmMGwyZzBvMmhrMmkwY28ya2Uxb24zbmphM3NzYW4xeTVsMW8wa2lhM3J0aHdlc3Rlcm5tdXR1YWwxNG9uNHcwcnV6M3R2NHAxcjBhMXcydHQydTF5YzJ6Mm9iaTFzZXJ2ZXI3ZmZpY2U1a2luYXdhNmxheWFuMGdyb3VwOWRuYXZ5NWxvM20wZWdhNG5lMWcxbDBpbmU1b28ycGVuM3JhY2xlM25nZTRnMGFuaWM1aWdpbnM2c2FrYTR0c3VrYTR0MnZoM3BhMGdlMm5hc29uaWM3cmlzMnMxdG5lcnM0czF5M3NzYWdlbnM3eTJjY3czZTB0MmYwaXplcjVnMWgwYXJtYWN5NmQxaWxpcHM1b25lMnRvMGdyYXBoeTZzNHlzaW81aWNzMXRldDJ1cmVzNmQxbjBnMWsyb25lZXI1enphNGsxbDBhY2UyeTBzdGF0aW9uOXVtYmluZzVzM20xbjBjMm9obDJrZXIzbGl0aWU1cm4yc3QzcjBhbWVyaWNhNnhpM2VzczNpbWUzbzBkMHVjdGlvbnM4ZjFncmVzc2l2ZThtbzJwZXJ0aWVzM3k1dGVjdGlvbjh1MGRlbnRpYWw5czF0MXViMncwYzJ5MnFhMXBvbjN1ZWJlYzNzdDVyYWNpbmc0ZGlvNGUwYWQxbGVzdGF0ZTZ0b3IyeTRjaXBlczVkMHN0b25lNXVtYnJlbGxhOWhhYjNpc2UwbjN0MmxpYW5jZTZuMHQwYWxzNXBhaXIzb3J0M3VibGljYW44c3QwYXVyYW50OHZpZXcwczV4cm90aDZpY2gwYXJkbGk2b2gzbDFvMXAybzBjaGVyM2tzM2RlbzNnZXJzNG9tM3MwdnAzdTBnYnkzaHIybjJ3MGUyeXVreXU2c2EwYXJsYW5kNmZlMHR5NGt1cmE0bGUxb24zbXNjbHViNHVuZzVuZHZpazBjb3JvbWFudDEyb2ZpNHAxcmwyczF2ZTJ4bzNiMGkxczJjMGExYjFoYWVmZmxlcjdtaWR0NG9sYXJzaGlwczhvbDN1bGUzd2FyejVpZW5jZTVvdDNkMWUwYXJjaDN0MmN1cmUxaXR5NmVrMmxlY3Q0bmVyM3J2aWNlczZ2ZW4zdzF4MHkzZnIyZzFoMGFuZ3JpbGE2cnAydzJlbGwzaWExa3NoYTVvZXMycDBwaW5nNXVqaTN3MHRpbWU3aTBsazJuYTFnbGVzNXRlM2oxazBpMG4yeTBwZTRsMGluZzRtMGFydDNpbGU0bjBjZjNvMGNjZXIzaWFsNGZ0YmFuazR3YXJlNmh1MmxhcjJ1dGlvbnM3bmcxeTJ5MnBhMGNlM29ydDJ0M3IwbDJzMXQwYWRhMnBsZXM0cjF0ZWJhbms0ZmFybTdjMGdyb3VwNm9ja2hvbG02cmFnZTNlM3JlYW00dWRpbzJ5M3lsZTR1MGNrczNwcGxpZXMzeTJvcnQ1cmYxZ2VyeTV6dWtpNXYxd2F0Y2g0aXNzNHgxeTBkbmV5NHN0ZW1zNnoydGFiMWlwZWk0bGsyb2JhbzRyZ2V0NHRhbW90b3JzNnIydG9vNHgwaTNjMGkyZDBrMmVhbTJjaDBub2xvZ3k4bDFtYXNlazVubmlzNHZhM2YxZzFoMGQxZWF0ZXIycmU2aWFhMmNrZXRzNWVuZGE0ZmZhbnk1cHMycmVzMm9sNGowbWF4eDR4MmswbWF4eDVsMW0wYWxsNG4xbzBkYXkza3lvM29sczNwMXJheTNzaGliYTV0YWwzdXJzM3duMnlvdGEzczNyMGFkZTFpbmc0aW5pbmc1dmVsMGNoYW5uZWw3ZXJzMGluc3VyYW5jZTE2dXN0M3YydDF1YmUyaTFuZXMzc2h1NHYwczJ3MXoydWExYmFuazNzMmcxazFuaWNvbTN2ZXJzaXR5OG8yb2wycHMyczF5MXoydmEwY2F0aW9uczduYTFndWFyZDdjMWUwZ2FzM250dXJlczZyaXNpZ241bVx1MDBGNmdlbnNiZXJhdGVyMnVuZzE0c2ljaGVydW5nMTB0MmcxaTBhamVzNGRlbzNnMWtpbmc0bGxhczRuMXAxcmdpbjRzYTFpb240dmExbzNsYWFuZGVyZW45bjFvZGthM2xrc3dhZ2VuN3ZvM3RlMWluZzNvMnlhZ2U1dTBlbG9zNndhbGVzMm1hcnQ0dGVyNG5nMGdvdTV0Y2gwZXM2ZWF0aGVyMGNoYW5uZWwxMmJjYW0zZXIyc2l0ZTVkMGRpbmc1aWJvMnIzZjFob3N3aG82aWVuMmtpMmxsaWFtaGlsbDluMGRvd3M0ZTFuZXJzNm1lMm9sdGVyc2tsdXdlcjExb2RzaWRlNnJrMHMybGQzdzJzMXRjMWYzeGJveDNlcm94NGZpbml0eTZpaHVhbjRuMnh4Mnl6M3lhY2h0czRob28zbWF4dW41bmRleDVlMW9kb2Jhc2hpN2dhMmtvaGFtYTZ1MHR1YmU2dDF1bjN6YTBwcG9zNHJhM2VybzNpcDJtMW9uZTN1ZXJpY2g2dzInO1xuLy8gSW50ZXJuYXRpb25hbGl6ZWQgZG9tYWluIG5hbWVzIGNvbnRhaW5pbmcgbm9uLUFTQ0lJXG5jb25zdCBlbmNvZGVkVXRsZHMgPSAnXHUwM0I1XHUwM0JCMVx1MDNDNTJcdTA0MzFcdTA0MzMxXHUwNDM1XHUwNDNCM1x1MDQzNFx1MDQzNVx1MDQ0Mlx1MDQzODRcdTA0MzVcdTA0NEUyXHUwNDNBXHUwNDMwXHUwNDQyXHUwNDNFXHUwNDNCXHUwNDM4XHUwNDNBNlx1MDQzRVx1MDQzQzNcdTA0M0NcdTA0M0FcdTA0MzQyXHUwNDNFXHUwNDNEMVx1MDQ0MVx1MDQzQVx1MDQzMlx1MDQzMDZcdTA0M0VcdTA0M0RcdTA0M0JcdTA0MzBcdTA0MzlcdTA0M0Q1XHUwNDQwXHUwNDMzM1x1MDQ0MFx1MDQ0M1x1MDQ0MTJcdTA0NDQyXHUwNDQxXHUwNDMwXHUwNDM5XHUwNDQyM1x1MDQ0MFx1MDQzMTNcdTA0NDNcdTA0M0FcdTA0NDAzXHUwNDlCXHUwNDMwXHUwNDM3M1x1MDU3MFx1MDU2MVx1MDU3NTNcdTA1RDlcdTA1RTlcdTA1RThcdTA1RDBcdTA1REM1XHUwNUU3XHUwNUQ1XHUwNUREM1x1MDYyN1x1MDYyOFx1MDY0OFx1MDYzOFx1MDYyOFx1MDY0QTVcdTA2MkFcdTA2MzVcdTA2MjdcdTA2NDRcdTA2MjdcdTA2MkE2XHUwNjMxXHUwNjI3XHUwNjQ1XHUwNjQzXHUwNjQ4NVx1MDY0NFx1MDYyN1x1MDYzMVx1MDYyRlx1MDY0NjRcdTA2MjhcdTA2MkRcdTA2MzFcdTA2NEFcdTA2NDY1XHUwNjJDXHUwNjMyXHUwNjI3XHUwNjI2XHUwNjMxNVx1MDYzM1x1MDYzOVx1MDY0OFx1MDYyRlx1MDY0QVx1MDYyOTZcdTA2MzlcdTA2NDRcdTA2NEFcdTA2MjdcdTA2NDY1XHUwNjQ1XHUwNjNBXHUwNjMxXHUwNjI4NVx1MDY0NVx1MDYyN1x1MDYzMVx1MDYyN1x1MDYyQTVcdTA2Q0NcdTA2MzFcdTA2MjdcdTA2NDY1XHUwNjI4XHUwNjI3XHUwNjMxXHUwNjJBMlx1MDYzMlx1MDYyN1x1MDYzMTRcdTA2NEFcdTA2MkFcdTA2NDMzXHUwNkJFXHUwNjI3XHUwNjMxXHUwNjJBNVx1MDYyQVx1MDY0OFx1MDY0Nlx1MDYzMzRcdTA2MzNcdTA2NDhcdTA2MkZcdTA2MjdcdTA2NDYzXHUwNjMxXHUwNjRBXHUwNjI5NVx1MDYzNFx1MDYyOFx1MDY0M1x1MDYyOTRcdTA2MzlcdTA2MzFcdTA2MjdcdTA2NDIyXHUwNjI4Mlx1MDY0NVx1MDYyN1x1MDY0NjRcdTA2NDFcdTA2NDRcdTA2MzNcdTA2MzdcdTA2NEFcdTA2NDY2XHUwNjQyXHUwNjM3XHUwNjMxM1x1MDY0M1x1MDYyN1x1MDYyQlx1MDY0OFx1MDY0NFx1MDY0QVx1MDY0MzZcdTA2NDhcdTA2NDUzXHUwNjQ1XHUwNjM1XHUwNjMxMlx1MDY0NFx1MDY0QVx1MDYzM1x1MDY0QVx1MDYyNzVcdTA2NDhcdTA2MzFcdTA2NEFcdTA2MkFcdTA2MjdcdTA2NDZcdTA2NEFcdTA2Mjc3XHUwNjQyXHUwNjM5NFx1MDY0N1x1MDY0NVx1MDYzMVx1MDYyN1x1MDY0NzVcdTA2N0VcdTA2MjdcdTA2QTlcdTA2MzNcdTA2MkFcdTA2MjdcdTA2NDY3XHUwNjgwXHUwNjI3XHUwNjMxXHUwNjJBNFx1MDkxNVx1MDk0OVx1MDkyRTNcdTA5MjhcdTA5NDdcdTA5MUYzXHUwOTJEXHUwOTNFXHUwOTMwXHUwOTI0MFx1MDkyRVx1MDk0RDNcdTA5NEJcdTA5MjQ1XHUwOTM4XHUwOTAyXHUwOTE3XHUwOTIwXHUwOTI4NVx1MDlBQ1x1MDlCRVx1MDk4Mlx1MDlCMlx1MDlCRTVcdTA5QURcdTA5QkVcdTA5QjBcdTA5QTQyXHUwOUYwXHUwOUE0NFx1MEEyRFx1MEEzRVx1MEEzMFx1MEEyNDRcdTBBQURcdTBBQkVcdTBBQjBcdTBBQTQ0XHUwQjJEXHUwQjNFXHUwQjMwXHUwQjI0NFx1MEI4N1x1MEJBOFx1MEJDRFx1MEJBNFx1MEJCRlx1MEJBRlx1MEJCRTZcdTBCQjJcdTBCOTlcdTBCQ0RcdTBCOTVcdTBCQzg2XHUwQjlBXHUwQkJGXHUwQjk5XHUwQkNEXHUwQjk1XHUwQkFBXHUwQkNEXHUwQkFBXHUwQkMyXHUwQkIwXHUwQkNEMTFcdTBDMkRcdTBDM0VcdTBDMzBcdTBDMjRcdTBDNEQ1XHUwQ0FEXHUwQ0JFXHUwQ0IwXHUwQ0E0NFx1MEQyRFx1MEQzRVx1MEQzMFx1MEQyNFx1MEQwMjVcdTBEQkRcdTBEODJcdTBEOUFcdTBEQ0Y0XHUwRTA0XHUwRTJEXHUwRTIxM1x1MEU0NFx1MEUxN1x1MEUyMjNcdTBFQTVcdTBFQjJcdTBFQTczXHUxMEQyXHUxMEQ0Mlx1MzA3Rlx1MzA5M1x1MzA2QTNcdTMwQTJcdTMwREVcdTMwQkVcdTMwRjM0XHUzMEFGXHUzMEU5XHUzMEE2XHUzMEM5NFx1MzBCMFx1MzBGQ1x1MzBCMFx1MzBFQjRcdTMwQjNcdTMwRTAyXHUzMEI5XHUzMEM4XHUzMEEyM1x1MzBCQlx1MzBGQ1x1MzBFQjNcdTMwRDVcdTMwQTFcdTMwQzNcdTMwQjdcdTMwRTdcdTMwRjM2XHUzMEREXHUzMEE0XHUzMEYzXHUzMEM4NFx1NEUxNlx1NzU0QzJcdTRFMkRcdTRGRTExXHU1NkZEMVx1NTcwQjFcdTY1ODdcdTdGNTEzXHU0RTlBXHU5QTZDXHU5MDBBM1x1NEYwMVx1NEUxQTJcdTRGNUJcdTVDNzEyXHU0RkUxXHU2MDZGMlx1NTA2NVx1NUVCNzJcdTUxNkJcdTUzNjYyXHU1MTZDXHU1M0Y4MVx1NzZDQTJcdTUzRjBcdTZFN0UxXHU3MDYzMlx1NTU0Nlx1NTdDRTFcdTVFOTcxXHU2ODA3Mlx1NTYwOVx1OTFDQzBcdTU5MjdcdTkxNTJcdTVFOTc1XHU1NzI4XHU3RUJGMlx1NTkyN1x1NjJGRjJcdTU5MjlcdTRFM0JcdTY1NTkzXHU1QTMxXHU0RTUwMlx1NUJCNlx1OTZGQjJcdTVFN0ZcdTRFMUMyXHU1RkFFXHU1MzVBMlx1NjE0OFx1NTU4NDJcdTYyMTFcdTcyMzFcdTRGNjAzXHU2MjRCXHU2NzNBMlx1NjJEQlx1ODA1ODJcdTY1M0ZcdTUyQTExXHU1RTlDMlx1NjVCMFx1NTJBMFx1NTc2MTJcdTk1RkIyXHU2NUY2XHU1QzFBMlx1NjZGOFx1N0M0RDJcdTY3M0FcdTY3ODQyXHU2REUxXHU5QTZDXHU5NTIxM1x1NkUzOFx1NjIwRjJcdTZGQjNcdTk1ODAyXHU3MEI5XHU3NzBCMlx1NzlGQlx1NTJBODJcdTdFQzRcdTdFQzdcdTY3M0FcdTY3ODQ0XHU3RjUxXHU1NzQwMVx1NUU5NzFcdTdBRDkxXHU3RURDMlx1ODA1NFx1OTAxQTJcdThDMzdcdTZCNEMyXHU4RDJEXHU3MjY5Mlx1OTAxQVx1OENBOTJcdTk2QzZcdTU2RTIyXHU5NkZCXHU4QTBBXHU3NkM4XHU3OUQxNFx1OThERVx1NTIyOVx1NkQ2NjNcdTk4REZcdTU0QzEyXHU5OTEwXHU1Mzg1Mlx1OTk5OVx1NjgzQ1x1OTFDQ1x1NjJDOTNcdTZFMkYyXHVCMkY3XHVCMTM3MVx1Q0VGNDJcdUMwQkNcdUMxMzEyXHVENTVDXHVBRDZEMic7XG5cbi8qKlxuICogQHRlbXBsYXRlIEFcbiAqIEB0ZW1wbGF0ZSBCXG4gKiBAcGFyYW0ge0F9IHRhcmdldFxuICogQHBhcmFtIHtCfSBwcm9wZXJ0aWVzXG4gKiBAcmV0dXJuIHtBICYgQn1cbiAqL1xuY29uc3QgYXNzaWduID0gKHRhcmdldCwgcHJvcGVydGllcykgPT4ge1xuICBmb3IgKGNvbnN0IGtleSBpbiBwcm9wZXJ0aWVzKSB7XG4gICAgdGFyZ2V0W2tleV0gPSBwcm9wZXJ0aWVzW2tleV07XG4gIH1cbiAgcmV0dXJuIHRhcmdldDtcbn07XG5cbi8qKlxuICogRmluaXRlIFN0YXRlIE1hY2hpbmUgZ2VuZXJhdGlvbiB1dGlsaXRpZXNcbiAqL1xuXG4vKipcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAdHlwZWRlZiB7eyBbZ3JvdXA6IHN0cmluZ106IFRbXSB9fSBDb2xsZWN0aW9uc1xuICovXG5cbi8qKlxuICogQHR5cGVkZWYge3sgW2dyb3VwOiBzdHJpbmddOiB0cnVlIH19IEZsYWdzXG4gKi9cblxuLy8gS2V5cyBpbiBzY2FubmVyIENvbGxlY3Rpb25zIGluc3RhbmNlc1xuY29uc3QgbnVtZXJpYyA9ICdudW1lcmljJztcbmNvbnN0IGFzY2lpID0gJ2FzY2lpJztcbmNvbnN0IGFscGhhID0gJ2FscGhhJztcbmNvbnN0IGFzY2lpbnVtZXJpYyA9ICdhc2NpaW51bWVyaWMnO1xuY29uc3QgYWxwaGFudW1lcmljID0gJ2FscGhhbnVtZXJpYyc7XG5jb25zdCBkb21haW4gPSAnZG9tYWluJztcbmNvbnN0IGVtb2ppID0gJ2Vtb2ppJztcbmNvbnN0IHNjaGVtZSA9ICdzY2hlbWUnO1xuY29uc3Qgc2xhc2hzY2hlbWUgPSAnc2xhc2hzY2hlbWUnO1xuY29uc3Qgd2hpdGVzcGFjZSA9ICd3aGl0ZXNwYWNlJztcblxuLyoqXG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7Q29sbGVjdGlvbnM8VD59IGdyb3VwcyB0byByZWdpc3RlciBpblxuICogQHJldHVybnMge1RbXX0gQ3VycmVudCBsaXN0IG9mIHRva2VucyBpbiB0aGUgZ2l2ZW4gY29sbGVjdGlvblxuICovXG5mdW5jdGlvbiByZWdpc3Rlckdyb3VwKG5hbWUsIGdyb3Vwcykge1xuICBpZiAoIShuYW1lIGluIGdyb3VwcykpIHtcbiAgICBncm91cHNbbmFtZV0gPSBbXTtcbiAgfVxuICByZXR1cm4gZ3JvdXBzW25hbWVdO1xufVxuXG4vKipcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0ge1R9IHQgdG9rZW4gdG8gYWRkXG4gKiBAcGFyYW0ge0NvbGxlY3Rpb25zPFQ+fSBncm91cHNcbiAqIEBwYXJhbSB7RmxhZ3N9IGZsYWdzXG4gKi9cbmZ1bmN0aW9uIGFkZFRvR3JvdXBzKHQsIGZsYWdzLCBncm91cHMpIHtcbiAgaWYgKGZsYWdzW251bWVyaWNdKSB7XG4gICAgZmxhZ3NbYXNjaWludW1lcmljXSA9IHRydWU7XG4gICAgZmxhZ3NbYWxwaGFudW1lcmljXSA9IHRydWU7XG4gIH1cbiAgaWYgKGZsYWdzW2FzY2lpXSkge1xuICAgIGZsYWdzW2FzY2lpbnVtZXJpY10gPSB0cnVlO1xuICAgIGZsYWdzW2FscGhhXSA9IHRydWU7XG4gIH1cbiAgaWYgKGZsYWdzW2FzY2lpbnVtZXJpY10pIHtcbiAgICBmbGFnc1thbHBoYW51bWVyaWNdID0gdHJ1ZTtcbiAgfVxuICBpZiAoZmxhZ3NbYWxwaGFdKSB7XG4gICAgZmxhZ3NbYWxwaGFudW1lcmljXSA9IHRydWU7XG4gIH1cbiAgaWYgKGZsYWdzW2FscGhhbnVtZXJpY10pIHtcbiAgICBmbGFnc1tkb21haW5dID0gdHJ1ZTtcbiAgfVxuICBpZiAoZmxhZ3NbZW1vamldKSB7XG4gICAgZmxhZ3NbZG9tYWluXSA9IHRydWU7XG4gIH1cbiAgZm9yIChjb25zdCBrIGluIGZsYWdzKSB7XG4gICAgY29uc3QgZ3JvdXAgPSByZWdpc3Rlckdyb3VwKGssIGdyb3Vwcyk7XG4gICAgaWYgKGdyb3VwLmluZGV4T2YodCkgPCAwKSB7XG4gICAgICBncm91cC5wdXNoKHQpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0ge1R9IHQgdG9rZW4gdG8gY2hlY2tcbiAqIEBwYXJhbSB7Q29sbGVjdGlvbnM8VD59IGdyb3Vwc1xuICogQHJldHVybnMge0ZsYWdzfSBncm91cCBmbGFncyB0aGF0IGNvbnRhaW4gdGhpcyB0b2tlblxuICovXG5mdW5jdGlvbiBmbGFnc0ZvclRva2VuKHQsIGdyb3Vwcykge1xuICBjb25zdCByZXN1bHQgPSB7fTtcbiAgZm9yIChjb25zdCBjIGluIGdyb3Vwcykge1xuICAgIGlmIChncm91cHNbY10uaW5kZXhPZih0KSA+PSAwKSB7XG4gICAgICByZXN1bHRbY10gPSB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAdHlwZWRlZiB7bnVsbCB8IFQgfSBUcmFuc2l0aW9uXG4gKi9cblxuLyoqXG4gKiBEZWZpbmUgYSBiYXNpYyBzdGF0ZSBtYWNoaW5lIHN0YXRlLiBqIGlzIHRoZSBsaXN0IG9mIGNoYXJhY3RlciB0cmFuc2l0aW9ucyxcbiAqIGpyIGlzIHRoZSBsaXN0IG9mIHJlZ2V4LW1hdGNoIHRyYW5zaXRpb25zLCBqZCBpcyB0aGUgZGVmYXVsdCBzdGF0ZSB0b1xuICogdHJhbnNpdGlvbiB0byB0IGlzIHRoZSBhY2NlcHRpbmcgdG9rZW4gdHlwZSwgaWYgYW55LiBJZiB0aGlzIGlzIHRoZSB0ZXJtaW5hbFxuICogc3RhdGUsIHRoZW4gaXQgZG9lcyBub3QgZW1pdCBhIHRva2VuLlxuICpcbiAqIFRoZSB0ZW1wbGF0ZSB0eXBlIFQgcmVwcmVzZW50cyB0aGUgdHlwZSBvZiB0aGUgdG9rZW4gdGhpcyBzdGF0ZSBhY2NlcHRzLiBUaGlzXG4gKiBzaG91bGQgYmUgYSBzdHJpbmcgKHN1Y2ggYXMgb2YgdGhlIHRva2VuIGV4cG9ydHMgaW4gYHRleHQuanNgKSBvciBhXG4gKiBNdWx0aVRva2VuIHN1YmNsYXNzIChmcm9tIGBtdWx0aS5qc2ApXG4gKlxuICogQHRlbXBsYXRlIFRcbiAqIEBwYXJhbSB7VH0gW3Rva2VuXSBUb2tlbiB0aGF0IHRoaXMgc3RhdGUgZW1pdHNcbiAqL1xuZnVuY3Rpb24gU3RhdGUodG9rZW4pIHtcbiAgaWYgKHRva2VuID09PSB2b2lkIDApIHtcbiAgICB0b2tlbiA9IG51bGw7XG4gIH1cbiAgLy8gdGhpcy5uID0gbnVsbDsgLy8gREVCVUc6IFN0YXRlIG5hbWVcbiAgLyoqIEB0eXBlIHt7IFtpbnB1dDogc3RyaW5nXTogU3RhdGU8VD4gfX0gaiAqL1xuICB0aGlzLmogPSB7fTsgLy8gSU1QTEVNRU5UQVRJT04gMVxuICAvLyB0aGlzLmogPSBbXTsgLy8gSU1QTEVNRU5UQVRJT04gMlxuICAvKiogQHR5cGUge1tSZWdFeHAsIFN0YXRlPFQ+XVtdfSBqciAqL1xuICB0aGlzLmpyID0gW107XG4gIC8qKiBAdHlwZSB7P1N0YXRlPFQ+fSBqZCAqL1xuICB0aGlzLmpkID0gbnVsbDtcbiAgLyoqIEB0eXBlIHs/VH0gdCAqL1xuICB0aGlzLnQgPSB0b2tlbjtcbn1cblxuLyoqXG4gKiBTY2FubmVyIHRva2VuIGdyb3Vwc1xuICogQHR5cGUgQ29sbGVjdGlvbnM8c3RyaW5nPlxuICovXG5TdGF0ZS5ncm91cHMgPSB7fTtcblN0YXRlLnByb3RvdHlwZSA9IHtcbiAgYWNjZXB0cygpIHtcbiAgICByZXR1cm4gISF0aGlzLnQ7XG4gIH0sXG4gIC8qKlxuICAgKiBGb2xsb3cgYW4gZXhpc3RpbmcgdHJhbnNpdGlvbiBmcm9tIHRoZSBnaXZlbiBpbnB1dCB0byB0aGUgbmV4dCBzdGF0ZS5cbiAgICogRG9lcyBub3QgbXV0YXRlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaW5wdXQgY2hhcmFjdGVyIG9yIHRva2VuIHR5cGUgdG8gdHJhbnNpdGlvbiBvblxuICAgKiBAcmV0dXJucyB7P1N0YXRlPFQ+fSB0aGUgbmV4dCBzdGF0ZSwgaWYgYW55XG4gICAqL1xuICBnbyhpbnB1dCkge1xuICAgIGNvbnN0IHN0YXRlID0gdGhpcztcbiAgICBjb25zdCBuZXh0U3RhdGUgPSBzdGF0ZS5qW2lucHV0XTtcbiAgICBpZiAobmV4dFN0YXRlKSB7XG4gICAgICByZXR1cm4gbmV4dFN0YXRlO1xuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0YXRlLmpyLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCByZWdleCA9IHN0YXRlLmpyW2ldWzBdO1xuICAgICAgY29uc3QgbmV4dFN0YXRlID0gc3RhdGUuanJbaV1bMV07IC8vIG5vdGU6IG1pZ2h0IGJlIGVtcHR5IHRvIHByZXZlbnQgZGVmYXVsdCBqdW1wXG4gICAgICBpZiAobmV4dFN0YXRlICYmIHJlZ2V4LnRlc3QoaW5wdXQpKSB7XG4gICAgICAgIHJldHVybiBuZXh0U3RhdGU7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIE5vd2hlcmUgbGVmdCB0byBqdW1wISBSZXR1cm4gZGVmYXVsdCwgaWYgYW55XG4gICAgcmV0dXJuIHN0YXRlLmpkO1xuICB9LFxuICAvKipcbiAgICogV2hldGhlciB0aGUgc3RhdGUgaGFzIGEgdHJhbnNpdGlvbiBmb3IgdGhlIGdpdmVuIGlucHV0LiBTZXQgdGhlIHNlY29uZFxuICAgKiBhcmd1bWVudCB0byB0cnVlIHRvIG9ubHkgbG9vayBmb3IgYW4gZXhhY3QgbWF0Y2ggKGFuZCBub3QgYSBkZWZhdWx0IG9yXG4gICAqIHJlZ3VsYXItZXhwcmVzc2lvbi1iYXNlZCB0cmFuc2l0aW9uKVxuICAgKiBAcGFyYW0ge3N0cmluZ30gaW5wdXRcbiAgICogQHBhcmFtIHtib29sZWFufSBleGFjdE9ubHlcbiAgICovXG4gIGhhcyhpbnB1dCwgZXhhY3RPbmx5KSB7XG4gICAgaWYgKGV4YWN0T25seSA9PT0gdm9pZCAwKSB7XG4gICAgICBleGFjdE9ubHkgPSBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGV4YWN0T25seSA/IGlucHV0IGluIHRoaXMuaiA6ICEhdGhpcy5nbyhpbnB1dCk7XG4gIH0sXG4gIC8qKlxuICAgKiBTaG9ydCBmb3IgXCJ0cmFuc2l0aW9uIGFsbFwiOyBjcmVhdGUgYSB0cmFuc2l0aW9uIGZyb20gdGhlIGFycmF5IG9mIGl0ZW1zXG4gICAqIGluIHRoZSBnaXZlbiBsaXN0IHRvIHRoZSBzYW1lIGZpbmFsIHJlc3VsdGluZyBzdGF0ZS5cbiAgICogQHBhcmFtIHtzdHJpbmcgfCBzdHJpbmdbXX0gaW5wdXRzIEdyb3VwIG9mIGlucHV0cyB0byB0cmFuc2l0aW9uIG9uXG4gICAqIEBwYXJhbSB7VHJhbnNpdGlvbjxUPiB8IFN0YXRlPFQ+fSBbbmV4dF0gVHJhbnNpdGlvbiBvcHRpb25zXG4gICAqIEBwYXJhbSB7RmxhZ3N9IFtmbGFnc10gQ29sbGVjdGlvbnMgZmxhZ3MgdG8gYWRkIHRva2VuIHRvXG4gICAqIEBwYXJhbSB7Q29sbGVjdGlvbnM8VD59IFtncm91cHNdIE1hc3RlciBsaXN0IG9mIHRva2VuIGdyb3Vwc1xuICAgKi9cbiAgdGEoaW5wdXRzLCBuZXh0LCBmbGFncywgZ3JvdXBzKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMudHQoaW5wdXRzW2ldLCBuZXh0LCBmbGFncywgZ3JvdXBzKTtcbiAgICB9XG4gIH0sXG4gIC8qKlxuICAgKiBTaG9ydCBmb3IgXCJ0YWtlIHJlZ2V4cCB0cmFuc2l0aW9uXCI7IGRlZmluZXMgYSB0cmFuc2l0aW9uIGZvciB0aGlzIHN0YXRlXG4gICAqIHdoZW4gaXQgZW5jb3VudGVycyBhIHRva2VuIHdoaWNoIG1hdGNoZXMgdGhlIGdpdmVuIHJlZ3VsYXIgZXhwcmVzc2lvblxuICAgKiBAcGFyYW0ge1JlZ0V4cH0gcmVnZXhwIFJlZ3VsYXIgZXhwcmVzc2lvbiB0cmFuc2l0aW9uIChwb3B1bGF0ZSBmaXJzdClcbiAgICogQHBhcmFtIHtUIHwgU3RhdGU8VD59IFtuZXh0XSBUcmFuc2l0aW9uIG9wdGlvbnNcbiAgICogQHBhcmFtIHtGbGFnc30gW2ZsYWdzXSBDb2xsZWN0aW9ucyBmbGFncyB0byBhZGQgdG9rZW4gdG9cbiAgICogQHBhcmFtIHtDb2xsZWN0aW9uczxUPn0gW2dyb3Vwc10gTWFzdGVyIGxpc3Qgb2YgdG9rZW4gZ3JvdXBzXG4gICAqIEByZXR1cm5zIHtTdGF0ZTxUPn0gdGFrZW4gYWZ0ZXIgdGhlIGdpdmVuIGlucHV0XG4gICAqL1xuICB0cihyZWdleHAsIG5leHQsIGZsYWdzLCBncm91cHMpIHtcbiAgICBncm91cHMgPSBncm91cHMgfHwgU3RhdGUuZ3JvdXBzO1xuICAgIGxldCBuZXh0U3RhdGU7XG4gICAgaWYgKG5leHQgJiYgbmV4dC5qKSB7XG4gICAgICBuZXh0U3RhdGUgPSBuZXh0O1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUb2tlbiB3aXRoIG1heWJlIHRva2VuIGdyb3Vwc1xuICAgICAgbmV4dFN0YXRlID0gbmV3IFN0YXRlKG5leHQpO1xuICAgICAgaWYgKGZsYWdzICYmIGdyb3Vwcykge1xuICAgICAgICBhZGRUb0dyb3VwcyhuZXh0LCBmbGFncywgZ3JvdXBzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5qci5wdXNoKFtyZWdleHAsIG5leHRTdGF0ZV0pO1xuICAgIHJldHVybiBuZXh0U3RhdGU7XG4gIH0sXG4gIC8qKlxuICAgKiBTaG9ydCBmb3IgXCJ0YWtlIHRyYW5zaXRpb25zXCIsIHdpbGwgdGFrZSBhcyBtYW55IHNlcXVlbnRpYWwgdHJhbnNpdGlvbnMgYXNcbiAgICogdGhlIGxlbmd0aCBvZiB0aGUgZ2l2ZW4gaW5wdXQgYW5kIHJldHVybnMgdGhlXG4gICAqIHJlc3VsdGluZyBmaW5hbCBzdGF0ZS5cbiAgICogQHBhcmFtIHtzdHJpbmcgfCBzdHJpbmdbXX0gaW5wdXRcbiAgICogQHBhcmFtIHtUIHwgU3RhdGU8VD59IFtuZXh0XSBUcmFuc2l0aW9uIG9wdGlvbnNcbiAgICogQHBhcmFtIHtGbGFnc30gW2ZsYWdzXSBDb2xsZWN0aW9ucyBmbGFncyB0byBhZGQgdG9rZW4gdG9cbiAgICogQHBhcmFtIHtDb2xsZWN0aW9uczxUPn0gW2dyb3Vwc10gTWFzdGVyIGxpc3Qgb2YgdG9rZW4gZ3JvdXBzXG4gICAqIEByZXR1cm5zIHtTdGF0ZTxUPn0gdGFrZW4gYWZ0ZXIgdGhlIGdpdmVuIGlucHV0XG4gICAqL1xuICB0cyhpbnB1dCwgbmV4dCwgZmxhZ3MsIGdyb3Vwcykge1xuICAgIGxldCBzdGF0ZSA9IHRoaXM7XG4gICAgY29uc3QgbGVuID0gaW5wdXQubGVuZ3RoO1xuICAgIGlmICghbGVuKSB7XG4gICAgICByZXR1cm4gc3RhdGU7XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuIC0gMTsgaSsrKSB7XG4gICAgICBzdGF0ZSA9IHN0YXRlLnR0KGlucHV0W2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIHN0YXRlLnR0KGlucHV0W2xlbiAtIDFdLCBuZXh0LCBmbGFncywgZ3JvdXBzKTtcbiAgfSxcbiAgLyoqXG4gICAqIFNob3J0IGZvciBcInRha2UgdHJhbnNpdGlvblwiLCB0aGlzIGlzIGEgbWV0aG9kIGZvciBidWlsZGluZy93b3JraW5nIHdpdGhcbiAgICogc3RhdGUgbWFjaGluZXMuXG4gICAqXG4gICAqIElmIGEgc3RhdGUgYWxyZWFkeSBleGlzdHMgZm9yIHRoZSBnaXZlbiBpbnB1dCwgcmV0dXJucyBpdC5cbiAgICpcbiAgICogSWYgYSB0b2tlbiBpcyBzcGVjaWZpZWQsIHRoYXQgc3RhdGUgd2lsbCBlbWl0IHRoYXQgdG9rZW4gd2hlbiByZWFjaGVkIGJ5XG4gICAqIHRoZSBsaW5raWZ5IGVuZ2luZS5cbiAgICpcbiAgICogSWYgbm8gc3RhdGUgZXhpc3RzLCBpdCB3aWxsIGJlIGluaXRpYWxpemVkIHdpdGggc29tZSBkZWZhdWx0IHRyYW5zaXRpb25zXG4gICAqIHRoYXQgcmVzZW1ibGUgZXhpc3RpbmcgZGVmYXVsdCB0cmFuc2l0aW9ucy5cbiAgICpcbiAgICogSWYgYSBzdGF0ZSBpcyBnaXZlbiBmb3IgdGhlIHNlY29uZCBhcmd1bWVudCwgdGhhdCBzdGF0ZSB3aWxsIGJlXG4gICAqIHRyYW5zaXRpb25lZCB0byBvbiB0aGUgZ2l2ZW4gaW5wdXQgcmVnYXJkbGVzcyBvZiB3aGF0IHRoYXQgaW5wdXRcbiAgICogcHJldmlvdXNseSBkaWQuXG4gICAqXG4gICAqIFNwZWNpZnkgYSB0b2tlbiBncm91cCBmbGFncyB0byBkZWZpbmUgZ3JvdXBzIHRoYXQgdGhpcyB0b2tlbiBiZWxvbmdzIHRvLlxuICAgKiBUaGUgdG9rZW4gd2lsbCBiZSBhZGRlZCB0byBjb3JyZXNwb25kaW5nIGVudGlyZXMgaW4gdGhlIGdpdmVuIGdyb3Vwc1xuICAgKiBvYmplY3QuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBpbnB1dCBjaGFyYWN0ZXIsIHRva2VuIHR5cGUgdG8gdHJhbnNpdGlvbiBvblxuICAgKiBAcGFyYW0ge1QgfCBTdGF0ZTxUPn0gW25leHRdIFRyYW5zaXRpb24gb3B0aW9uc1xuICAgKiBAcGFyYW0ge0ZsYWdzfSBbZmxhZ3NdIENvbGxlY3Rpb25zIGZsYWdzIHRvIGFkZCB0b2tlbiB0b1xuICAgKiBAcGFyYW0ge0NvbGxlY3Rpb25zPFQ+fSBbZ3JvdXBzXSBNYXN0ZXIgbGlzdCBvZiBncm91cHNcbiAgICogQHJldHVybnMge1N0YXRlPFQ+fSB0YWtlbiBhZnRlciB0aGUgZ2l2ZW4gaW5wdXRcbiAgICovXG4gIHR0KGlucHV0LCBuZXh0LCBmbGFncywgZ3JvdXBzKSB7XG4gICAgZ3JvdXBzID0gZ3JvdXBzIHx8IFN0YXRlLmdyb3VwcztcbiAgICBjb25zdCBzdGF0ZSA9IHRoaXM7XG5cbiAgICAvLyBDaGVjayBpZiBleGlzdGluZyBzdGF0ZSBnaXZlbiwganVzdCBhIGJhc2ljIHRyYW5zaXRpb25cbiAgICBpZiAobmV4dCAmJiBuZXh0LmopIHtcbiAgICAgIHN0YXRlLmpbaW5wdXRdID0gbmV4dDtcbiAgICAgIHJldHVybiBuZXh0O1xuICAgIH1cbiAgICBjb25zdCB0ID0gbmV4dDtcblxuICAgIC8vIFRha2UgdGhlIHRyYW5zaXRpb24gd2l0aCB0aGUgdXN1YWwgZGVmYXVsdCBtZWNoYW5pc21zIGFuZCB1c2UgdGhhdCBhc1xuICAgIC8vIGEgdGVtcGxhdGUgZm9yIGNyZWF0aW5nIHRoZSBuZXh0IHN0YXRlXG4gICAgbGV0IG5leHRTdGF0ZSxcbiAgICAgIHRlbXBsYXRlU3RhdGUgPSBzdGF0ZS5nbyhpbnB1dCk7XG4gICAgaWYgKHRlbXBsYXRlU3RhdGUpIHtcbiAgICAgIG5leHRTdGF0ZSA9IG5ldyBTdGF0ZSgpO1xuICAgICAgYXNzaWduKG5leHRTdGF0ZS5qLCB0ZW1wbGF0ZVN0YXRlLmopO1xuICAgICAgbmV4dFN0YXRlLmpyLnB1c2guYXBwbHkobmV4dFN0YXRlLmpyLCB0ZW1wbGF0ZVN0YXRlLmpyKTtcbiAgICAgIG5leHRTdGF0ZS5qZCA9IHRlbXBsYXRlU3RhdGUuamQ7XG4gICAgICBuZXh0U3RhdGUudCA9IHRlbXBsYXRlU3RhdGUudDtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV4dFN0YXRlID0gbmV3IFN0YXRlKCk7XG4gICAgfVxuICAgIGlmICh0KSB7XG4gICAgICAvLyBFbnN1cmUgbmV3bHkgdG9rZW4gaXMgaW4gdGhlIHNhbWUgZ3JvdXBzIGFzIHRoZSBvbGQgdG9rZW5cbiAgICAgIGlmIChncm91cHMpIHtcbiAgICAgICAgaWYgKG5leHRTdGF0ZS50ICYmIHR5cGVvZiBuZXh0U3RhdGUudCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBjb25zdCBhbGxGbGFncyA9IGFzc2lnbihmbGFnc0ZvclRva2VuKG5leHRTdGF0ZS50LCBncm91cHMpLCBmbGFncyk7XG4gICAgICAgICAgYWRkVG9Hcm91cHModCwgYWxsRmxhZ3MsIGdyb3Vwcyk7XG4gICAgICAgIH0gZWxzZSBpZiAoZmxhZ3MpIHtcbiAgICAgICAgICBhZGRUb0dyb3Vwcyh0LCBmbGFncywgZ3JvdXBzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbmV4dFN0YXRlLnQgPSB0OyAvLyBvdmVyd3JpdGUgYW55dGhpbmcgdGhhdCB3YXMgcHJldmlvdXNseSB0aGVyZVxuICAgIH1cblxuICAgIHN0YXRlLmpbaW5wdXRdID0gbmV4dFN0YXRlO1xuICAgIHJldHVybiBuZXh0U3RhdGU7XG4gIH1cbn07XG5cbi8vIEhlbHBlciBmdW5jdGlvbnMgdG8gaW1wcm92ZSBtaW5pZmljYXRpb24gKG5vdCBleHBvcnRlZCBvdXRzaWRlIGxpbmtpZnlqcyBtb2R1bGUpXG5cbi8qKlxuICogQHRlbXBsYXRlIFRcbiAqIEBwYXJhbSB7U3RhdGU8VD59IHN0YXRlXG4gKiBAcGFyYW0ge3N0cmluZyB8IHN0cmluZ1tdfSBpbnB1dFxuICogQHBhcmFtIHtGbGFnc30gW2ZsYWdzXVxuICogQHBhcmFtIHtDb2xsZWN0aW9uczxUPn0gW2dyb3Vwc11cbiAqL1xuY29uc3QgdGEgPSAoc3RhdGUsIGlucHV0LCBuZXh0LCBmbGFncywgZ3JvdXBzKSA9PiBzdGF0ZS50YShpbnB1dCwgbmV4dCwgZmxhZ3MsIGdyb3Vwcyk7XG5cbi8qKlxuICogQHRlbXBsYXRlIFRcbiAqIEBwYXJhbSB7U3RhdGU8VD59IHN0YXRlXG4gKiBAcGFyYW0ge1JlZ0V4cH0gcmVnZXhwXG4gKiBAcGFyYW0ge1QgfCBTdGF0ZTxUPn0gW25leHRdXG4gKiBAcGFyYW0ge0ZsYWdzfSBbZmxhZ3NdXG4gKiBAcGFyYW0ge0NvbGxlY3Rpb25zPFQ+fSBbZ3JvdXBzXVxuICovXG5jb25zdCB0ciA9IChzdGF0ZSwgcmVnZXhwLCBuZXh0LCBmbGFncywgZ3JvdXBzKSA9PiBzdGF0ZS50cihyZWdleHAsIG5leHQsIGZsYWdzLCBncm91cHMpO1xuXG4vKipcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0ge1N0YXRlPFQ+fSBzdGF0ZVxuICogQHBhcmFtIHtzdHJpbmcgfCBzdHJpbmdbXX0gaW5wdXRcbiAqIEBwYXJhbSB7VCB8IFN0YXRlPFQ+fSBbbmV4dF1cbiAqIEBwYXJhbSB7RmxhZ3N9IFtmbGFnc11cbiAqIEBwYXJhbSB7Q29sbGVjdGlvbnM8VD59IFtncm91cHNdXG4gKi9cbmNvbnN0IHRzID0gKHN0YXRlLCBpbnB1dCwgbmV4dCwgZmxhZ3MsIGdyb3VwcykgPT4gc3RhdGUudHMoaW5wdXQsIG5leHQsIGZsYWdzLCBncm91cHMpO1xuXG4vKipcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0ge1N0YXRlPFQ+fSBzdGF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IGlucHV0XG4gKiBAcGFyYW0ge1QgfCBTdGF0ZTxUPn0gW25leHRdXG4gKiBAcGFyYW0ge0NvbGxlY3Rpb25zPFQ+fSBbZ3JvdXBzXVxuICogQHBhcmFtIHtGbGFnc30gW2ZsYWdzXVxuICovXG5jb25zdCB0dCA9IChzdGF0ZSwgaW5wdXQsIG5leHQsIGZsYWdzLCBncm91cHMpID0+IHN0YXRlLnR0KGlucHV0LCBuZXh0LCBmbGFncywgZ3JvdXBzKTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuVGV4dCBUb2tlbnNcbklkZW50aWZpZXJzIGZvciB0b2tlbiBvdXRwdXRzIGZyb20gdGhlIHJlZ2V4cCBzY2FubmVyXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbi8vIEEgdmFsaWQgd2ViIGRvbWFpbiB0b2tlblxuY29uc3QgV09SRCA9ICdXT1JEJzsgLy8gb25seSBjb250YWlucyBhLXpcbmNvbnN0IFVXT1JEID0gJ1VXT1JEJzsgLy8gY29udGFpbnMgbGV0dGVycyBvdGhlciB0aGFuIGEteiwgdXNlZCBmb3IgSUROXG5cbi8vIFNwZWNpYWwgY2FzZSBvZiB3b3JkXG5jb25zdCBMT0NBTEhPU1QgPSAnTE9DQUxIT1NUJztcblxuLy8gVmFsaWQgdG9wLWxldmVsIGRvbWFpbiwgc3BlY2lhbCBjYXNlIG9mIFdPUkQgKHNlZSB0bGRzLmpzKVxuY29uc3QgVExEID0gJ1RMRCc7XG5cbi8vIFZhbGlkIElETiBUTEQsIHNwZWNpYWwgY2FzZSBvZiBVV09SRCAoc2VlIHRsZHMuanMpXG5jb25zdCBVVExEID0gJ1VUTEQnO1xuXG4vLyBUaGUgc2NoZW1lIHBvcnRpb24gb2YgYSB3ZWIgVVJJIHByb3RvY29sLiBTdXBwb3J0ZWQgdHlwZXMgaW5jbHVkZTogYG1haWx0b2AsXG4vLyBgZmlsZWAsIGFuZCB1c2VyLWRlZmluZWQgY3VzdG9tIHByb3RvY29scy4gTGltaXRlZCB0byBzY2hlbWVzIHRoYXQgY29udGFpblxuLy8gb25seSBsZXR0ZXJzXG5jb25zdCBTQ0hFTUUgPSAnU0NIRU1FJztcblxuLy8gU2ltaWxhciB0byBTQ0hFTUUsIGV4Y2VwdCBtYWtlcyBkaXN0aW5jdGlvbiBmb3Igc2NoZW1lcyB0aGF0IG11c3QgYWx3YXlzIGJlXG4vLyBmb2xsb3dlZCBieSBgOi8vYCwgbm90IGp1c3QgYDpgLiBTdXBwb3J0ZWQgdHlwZXMgaW5jbHVkZSBgaHR0cGAsIGBodHRwc2AsXG4vLyBgZnRwYCwgYGZ0cHNgXG5jb25zdCBTTEFTSF9TQ0hFTUUgPSAnU0xBU0hfU0NIRU1FJztcblxuLy8gQW55IHNlcXVlbmNlIG9mIGRpZ2l0cyAwLTlcbmNvbnN0IE5VTSA9ICdOVU0nO1xuXG4vLyBBbnkgbnVtYmVyIG9mIGNvbnNlY3V0aXZlIHdoaXRlc3BhY2UgY2hhcmFjdGVycyB0aGF0IGFyZSBub3QgbmV3bGluZVxuY29uc3QgV1MgPSAnV1MnO1xuXG4vLyBOZXcgbGluZSAodW5peCBzdHlsZSlcbmNvbnN0IE5MJDEgPSAnTkwnOyAvLyBcXG5cblxuLy8gT3BlbmluZy9jbG9zaW5nIGJyYWNrZXQgY2xhc3Nlc1xuY29uc3QgT1BFTkJSQUNFID0gJ09QRU5CUkFDRSc7IC8vIHtcbmNvbnN0IE9QRU5CUkFDS0VUID0gJ09QRU5CUkFDS0VUJzsgLy8gW1xuY29uc3QgT1BFTkFOR0xFQlJBQ0tFVCA9ICdPUEVOQU5HTEVCUkFDS0VUJzsgLy8gPFxuY29uc3QgT1BFTlBBUkVOID0gJ09QRU5QQVJFTic7IC8vIChcbmNvbnN0IENMT1NFQlJBQ0UgPSAnQ0xPU0VCUkFDRSc7IC8vIH1cbmNvbnN0IENMT1NFQlJBQ0tFVCA9ICdDTE9TRUJSQUNLRVQnOyAvLyBdXG5jb25zdCBDTE9TRUFOR0xFQlJBQ0tFVCA9ICdDTE9TRUFOR0xFQlJBQ0tFVCc7IC8vID5cbmNvbnN0IENMT1NFUEFSRU4gPSAnQ0xPU0VQQVJFTic7IC8vIClcblxuLy8gVmFyaW91cyBzeW1ib2xzXG5jb25zdCBBTVBFUlNBTkQgPSAnQU1QRVJTQU5EJzsgLy8gJlxuY29uc3QgQVBPU1RST1BIRSA9ICdBUE9TVFJPUEhFJzsgLy8gJ1xuY29uc3QgQVNURVJJU0sgPSAnQVNURVJJU0snOyAvLyAqXG5jb25zdCBBVCA9ICdBVCc7IC8vIEBcbmNvbnN0IEJBQ0tTTEFTSCA9ICdCQUNLU0xBU0gnOyAvLyBcXFxuY29uc3QgQkFDS1RJQ0sgPSAnQkFDS1RJQ0snOyAvLyBgXG5jb25zdCBDQVJFVCA9ICdDQVJFVCc7IC8vIF5cbmNvbnN0IENPTE9OID0gJ0NPTE9OJzsgLy8gOlxuY29uc3QgQ09NTUEgPSAnQ09NTUEnOyAvLyAsXG5jb25zdCBET0xMQVIgPSAnRE9MTEFSJzsgLy8gJFxuY29uc3QgRE9UID0gJ0RPVCc7IC8vIC5cbmNvbnN0IEVRVUFMUyA9ICdFUVVBTFMnOyAvLyA9XG5jb25zdCBFWENMQU1BVElPTiA9ICdFWENMQU1BVElPTic7IC8vICFcbmNvbnN0IEhZUEhFTiA9ICdIWVBIRU4nOyAvLyAtXG5jb25zdCBQRVJDRU5UID0gJ1BFUkNFTlQnOyAvLyAlXG5jb25zdCBQSVBFID0gJ1BJUEUnOyAvLyB8XG5jb25zdCBQTFVTID0gJ1BMVVMnOyAvLyArXG5jb25zdCBQT1VORCA9ICdQT1VORCc7IC8vICNcbmNvbnN0IFFVRVJZID0gJ1FVRVJZJzsgLy8gP1xuY29uc3QgUVVPVEUgPSAnUVVPVEUnOyAvLyBcIlxuXG5jb25zdCBTRU1JID0gJ1NFTUknOyAvLyA7XG5jb25zdCBTTEFTSCA9ICdTTEFTSCc7IC8vIC9cbmNvbnN0IFRJTERFID0gJ1RJTERFJzsgLy8gflxuY29uc3QgVU5ERVJTQ09SRSA9ICdVTkRFUlNDT1JFJzsgLy8gX1xuXG4vLyBFbW9qaSBzeW1ib2xcbmNvbnN0IEVNT0pJJDEgPSAnRU1PSkknO1xuXG4vLyBEZWZhdWx0IHRva2VuIC0gYW55dGhpbmcgdGhhdCBpcyBub3Qgb25lIG9mIHRoZSBhYm92ZVxuY29uc3QgU1lNID0gJ1NZTSc7XG5cbnZhciB0ayA9IC8qI19fUFVSRV9fKi9PYmplY3QuZnJlZXplKHtcblx0X19wcm90b19fOiBudWxsLFxuXHRXT1JEOiBXT1JELFxuXHRVV09SRDogVVdPUkQsXG5cdExPQ0FMSE9TVDogTE9DQUxIT1NULFxuXHRUTEQ6IFRMRCxcblx0VVRMRDogVVRMRCxcblx0U0NIRU1FOiBTQ0hFTUUsXG5cdFNMQVNIX1NDSEVNRTogU0xBU0hfU0NIRU1FLFxuXHROVU06IE5VTSxcblx0V1M6IFdTLFxuXHROTDogTkwkMSxcblx0T1BFTkJSQUNFOiBPUEVOQlJBQ0UsXG5cdE9QRU5CUkFDS0VUOiBPUEVOQlJBQ0tFVCxcblx0T1BFTkFOR0xFQlJBQ0tFVDogT1BFTkFOR0xFQlJBQ0tFVCxcblx0T1BFTlBBUkVOOiBPUEVOUEFSRU4sXG5cdENMT1NFQlJBQ0U6IENMT1NFQlJBQ0UsXG5cdENMT1NFQlJBQ0tFVDogQ0xPU0VCUkFDS0VULFxuXHRDTE9TRUFOR0xFQlJBQ0tFVDogQ0xPU0VBTkdMRUJSQUNLRVQsXG5cdENMT1NFUEFSRU46IENMT1NFUEFSRU4sXG5cdEFNUEVSU0FORDogQU1QRVJTQU5ELFxuXHRBUE9TVFJPUEhFOiBBUE9TVFJPUEhFLFxuXHRBU1RFUklTSzogQVNURVJJU0ssXG5cdEFUOiBBVCxcblx0QkFDS1NMQVNIOiBCQUNLU0xBU0gsXG5cdEJBQ0tUSUNLOiBCQUNLVElDSyxcblx0Q0FSRVQ6IENBUkVULFxuXHRDT0xPTjogQ09MT04sXG5cdENPTU1BOiBDT01NQSxcblx0RE9MTEFSOiBET0xMQVIsXG5cdERPVDogRE9ULFxuXHRFUVVBTFM6IEVRVUFMUyxcblx0RVhDTEFNQVRJT046IEVYQ0xBTUFUSU9OLFxuXHRIWVBIRU46IEhZUEhFTixcblx0UEVSQ0VOVDogUEVSQ0VOVCxcblx0UElQRTogUElQRSxcblx0UExVUzogUExVUyxcblx0UE9VTkQ6IFBPVU5ELFxuXHRRVUVSWTogUVVFUlksXG5cdFFVT1RFOiBRVU9URSxcblx0U0VNSTogU0VNSSxcblx0U0xBU0g6IFNMQVNILFxuXHRUSUxERTogVElMREUsXG5cdFVOREVSU0NPUkU6IFVOREVSU0NPUkUsXG5cdEVNT0pJOiBFTU9KSSQxLFxuXHRTWU06IFNZTVxufSk7XG5cbi8vIE5vdGUgdGhhdCB0aGVzZSB0d28gVW5pY29kZSBvbmVzIGV4cGFuZCBpbnRvIGEgcmVhbGx5IGJpZyBvbmUgd2l0aCBCYWJlbFxuY29uc3QgQVNDSUlfTEVUVEVSID0gL1thLXpdLztcbmNvbnN0IExFVFRFUiA9IC9cXHB7TH0vdTsgLy8gQW55IFVuaWNvZGUgY2hhcmFjdGVyIHdpdGggbGV0dGVyIGRhdGEgdHlwZVxuY29uc3QgRU1PSkkgPSAvXFxwe0Vtb2ppfS91OyAvLyBBbnkgVW5pY29kZSBlbW9qaSBjaGFyYWN0ZXJcbmNvbnN0IEVNT0pJX1ZBUklBVElPTiQxID0gL1xcdWZlMGYvO1xuY29uc3QgRElHSVQgPSAvXFxkLztcbmNvbnN0IFNQQUNFID0gL1xccy87XG5cbnZhciByZWdleHAgPSAvKiNfX1BVUkVfXyovT2JqZWN0LmZyZWV6ZSh7XG5cdF9fcHJvdG9fXzogbnVsbCxcblx0QVNDSUlfTEVUVEVSOiBBU0NJSV9MRVRURVIsXG5cdExFVFRFUjogTEVUVEVSLFxuXHRFTU9KSTogRU1PSkksXG5cdEVNT0pJX1ZBUklBVElPTjogRU1PSklfVkFSSUFUSU9OJDEsXG5cdERJR0lUOiBESUdJVCxcblx0U1BBQ0U6IFNQQUNFXG59KTtcblxuLyoqXG5cdFRoZSBzY2FubmVyIHByb3ZpZGVzIGFuIGludGVyZmFjZSB0aGF0IHRha2VzIGEgc3RyaW5nIG9mIHRleHQgYXMgaW5wdXQsIGFuZFxuXHRvdXRwdXRzIGFuIGFycmF5IG9mIHRva2VucyBpbnN0YW5jZXMgdGhhdCBjYW4gYmUgdXNlZCBmb3IgZWFzeSBVUkwgcGFyc2luZy5cbiovXG5jb25zdCBOTCA9ICdcXG4nOyAvLyBOZXcgbGluZSBjaGFyYWN0ZXJcbmNvbnN0IEVNT0pJX1ZBUklBVElPTiA9ICdcXHVmZTBmJzsgLy8gVmFyaWF0aW9uIHNlbGVjdG9yLCBmb2xsb3dzIGhlYXJ0IGFuZCBvdGhlcnNcbmNvbnN0IEVNT0pJX0pPSU5FUiA9ICdcXHUyMDBkJzsgLy8gemVyby13aWR0aCBqb2luZXJcblxubGV0IHRsZHMgPSBudWxsLFxuICB1dGxkcyA9IG51bGw7IC8vIGRvbid0IGNoYW5nZSBzbyBvbmx5IGhhdmUgdG8gYmUgY29tcHV0ZWQgb25jZVxuXG4vKipcbiAqIFNjYW5uZXIgb3V0cHV0IHRva2VuOlxuICogLSBgdGAgaXMgdGhlIHRva2VuIG5hbWUgKGUuZy4sICdOVU0nLCAnRU1PSkknLCAnVExEJylcbiAqIC0gYHZgIGlzIHRoZSB2YWx1ZSBvZiB0aGUgdG9rZW4gKGUuZy4sICcxMjMnLCAnXHUyNzY0XHVGRTBGJywgJ2NvbScpXG4gKiAtIGBzYCBpcyB0aGUgc3RhcnQgaW5kZXggb2YgdGhlIHRva2VuIGluIHRoZSBvcmlnaW5hbCBzdHJpbmdcbiAqIC0gYGVgIGlzIHRoZSBlbmQgaW5kZXggb2YgdGhlIHRva2VuIGluIHRoZSBvcmlnaW5hbCBzdHJpbmdcbiAqIEB0eXBlZGVmIHt7dDogc3RyaW5nLCB2OiBzdHJpbmcsIHM6IG51bWJlciwgZTogbnVtYmVyfX0gVG9rZW5cbiAqL1xuXG4vKipcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAdHlwZWRlZiB7eyBbY29sbGVjdGlvbjogc3RyaW5nXTogVFtdIH19IENvbGxlY3Rpb25zXG4gKi9cblxuLyoqXG4gKiBJbml0aWFsaXplIHRoZSBzY2FubmVyIGNoYXJhY3Rlci1iYXNlZCBzdGF0ZSBtYWNoaW5lIGZvciB0aGUgZ2l2ZW4gc3RhcnRcbiAqIHN0YXRlXG4gKiBAcGFyYW0ge1tzdHJpbmcsIGJvb2xlYW5dW119IGN1c3RvbVNjaGVtZXMgTGlzdCBvZiBjdXN0b20gc2NoZW1lcywgd2hlcmUgZWFjaFxuICogaXRlbSBpcyBhIGxlbmd0aC0yIHR1cGxlIHdpdGggdGhlIGZpcnN0IGVsZW1lbnQgc2V0IHRvIHRoZSBzdHJpbmcgc2NoZW1lLCBhbmRcbiAqIHRoZSBzZWNvbmQgZWxlbWVudCBzZXQgdG8gYHRydWVgIGlmIHRoZSBgOi8vYCBhZnRlciB0aGUgc2NoZW1lIGlzIG9wdGlvbmFsXG4gKi9cbmZ1bmN0aW9uIGluaXQkMihjdXN0b21TY2hlbWVzKSB7XG4gIGlmIChjdXN0b21TY2hlbWVzID09PSB2b2lkIDApIHtcbiAgICBjdXN0b21TY2hlbWVzID0gW107XG4gIH1cbiAgLy8gRnJlcXVlbnRseSB1c2VkIHN0YXRlcyAobmFtZSBhcmd1bWVudCByZW1vdmVkIGR1cmluZyBtaW5pZmljYXRpb24pXG4gIC8qKiBAdHlwZSBDb2xsZWN0aW9uczxzdHJpbmc+ICovXG4gIGNvbnN0IGdyb3VwcyA9IHt9OyAvLyBvZiB0b2tlbnNcbiAgU3RhdGUuZ3JvdXBzID0gZ3JvdXBzO1xuICAvKiogQHR5cGUgU3RhdGU8c3RyaW5nPiAqL1xuICBjb25zdCBTdGFydCA9IG5ldyBTdGF0ZSgpO1xuICBpZiAodGxkcyA9PSBudWxsKSB7XG4gICAgdGxkcyA9IGRlY29kZVRsZHMoZW5jb2RlZFRsZHMpO1xuICB9XG4gIGlmICh1dGxkcyA9PSBudWxsKSB7XG4gICAgdXRsZHMgPSBkZWNvZGVUbGRzKGVuY29kZWRVdGxkcyk7XG4gIH1cblxuICAvLyBTdGF0ZXMgZm9yIHNwZWNpYWwgVVJMIHN5bWJvbHMgdGhhdCBhY2NlcHQgaW1tZWRpYXRlbHkgYWZ0ZXIgc3RhcnRcbiAgdHQoU3RhcnQsIFwiJ1wiLCBBUE9TVFJPUEhFKTtcbiAgdHQoU3RhcnQsICd7JywgT1BFTkJSQUNFKTtcbiAgdHQoU3RhcnQsICdbJywgT1BFTkJSQUNLRVQpO1xuICB0dChTdGFydCwgJzwnLCBPUEVOQU5HTEVCUkFDS0VUKTtcbiAgdHQoU3RhcnQsICcoJywgT1BFTlBBUkVOKTtcbiAgdHQoU3RhcnQsICd9JywgQ0xPU0VCUkFDRSk7XG4gIHR0KFN0YXJ0LCAnXScsIENMT1NFQlJBQ0tFVCk7XG4gIHR0KFN0YXJ0LCAnPicsIENMT1NFQU5HTEVCUkFDS0VUKTtcbiAgdHQoU3RhcnQsICcpJywgQ0xPU0VQQVJFTik7XG4gIHR0KFN0YXJ0LCAnJicsIEFNUEVSU0FORCk7XG4gIHR0KFN0YXJ0LCAnKicsIEFTVEVSSVNLKTtcbiAgdHQoU3RhcnQsICdAJywgQVQpO1xuICB0dChTdGFydCwgJ2AnLCBCQUNLVElDSyk7XG4gIHR0KFN0YXJ0LCAnXicsIENBUkVUKTtcbiAgdHQoU3RhcnQsICc6JywgQ09MT04pO1xuICB0dChTdGFydCwgJywnLCBDT01NQSk7XG4gIHR0KFN0YXJ0LCAnJCcsIERPTExBUik7XG4gIHR0KFN0YXJ0LCAnLicsIERPVCk7XG4gIHR0KFN0YXJ0LCAnPScsIEVRVUFMUyk7XG4gIHR0KFN0YXJ0LCAnIScsIEVYQ0xBTUFUSU9OKTtcbiAgdHQoU3RhcnQsICctJywgSFlQSEVOKTtcbiAgdHQoU3RhcnQsICclJywgUEVSQ0VOVCk7XG4gIHR0KFN0YXJ0LCAnfCcsIFBJUEUpO1xuICB0dChTdGFydCwgJysnLCBQTFVTKTtcbiAgdHQoU3RhcnQsICcjJywgUE9VTkQpO1xuICB0dChTdGFydCwgJz8nLCBRVUVSWSk7XG4gIHR0KFN0YXJ0LCAnXCInLCBRVU9URSk7XG4gIHR0KFN0YXJ0LCAnLycsIFNMQVNIKTtcbiAgdHQoU3RhcnQsICc7JywgU0VNSSk7XG4gIHR0KFN0YXJ0LCAnficsIFRJTERFKTtcbiAgdHQoU3RhcnQsICdfJywgVU5ERVJTQ09SRSk7XG4gIHR0KFN0YXJ0LCAnXFxcXCcsIEJBQ0tTTEFTSCk7XG4gIGNvbnN0IE51bSA9IHRyKFN0YXJ0LCBESUdJVCwgTlVNLCB7XG4gICAgW251bWVyaWNdOiB0cnVlXG4gIH0pO1xuICB0cihOdW0sIERJR0lULCBOdW0pO1xuXG4gIC8vIFN0YXRlIHdoaWNoIGVtaXRzIGEgd29yZCB0b2tlblxuICBjb25zdCBXb3JkID0gdHIoU3RhcnQsIEFTQ0lJX0xFVFRFUiwgV09SRCwge1xuICAgIFthc2NpaV06IHRydWVcbiAgfSk7XG4gIHRyKFdvcmQsIEFTQ0lJX0xFVFRFUiwgV29yZCk7XG5cbiAgLy8gU2FtZSBhcyBwcmV2aW91cywgYnV0IHNwZWNpZmljIHRvIG5vbi1mc20uYXNjaWkgYWxwaGFiZXQgd29yZHNcbiAgY29uc3QgVVdvcmQgPSB0cihTdGFydCwgTEVUVEVSLCBVV09SRCwge1xuICAgIFthbHBoYV06IHRydWVcbiAgfSk7XG4gIHRyKFVXb3JkLCBBU0NJSV9MRVRURVIpOyAvLyBOb24tYWNjZXB0aW5nXG4gIHRyKFVXb3JkLCBMRVRURVIsIFVXb3JkKTtcblxuICAvLyBXaGl0ZXNwYWNlIGp1bXBzXG4gIC8vIFRva2VucyBvZiBvbmx5IG5vbi1uZXdsaW5lIHdoaXRlc3BhY2UgYXJlIGFyYml0cmFyaWx5IGxvbmdcbiAgLy8gSWYgYW55IHdoaXRlc3BhY2UgZXhjZXB0IG5ld2xpbmUsIG1vcmUgd2hpdGVzcGFjZSFcbiAgY29uc3QgV3MgPSB0cihTdGFydCwgU1BBQ0UsIFdTLCB7XG4gICAgW3doaXRlc3BhY2VdOiB0cnVlXG4gIH0pO1xuICB0dChTdGFydCwgTkwsIE5MJDEsIHtcbiAgICBbd2hpdGVzcGFjZV06IHRydWVcbiAgfSk7XG4gIHR0KFdzLCBOTCk7IC8vIG5vbi1hY2NlcHRpbmcgc3RhdGUgdG8gYXZvaWQgbWl4aW5nIHdoaXRlc3BhY2VzXG4gIHRyKFdzLCBTUEFDRSwgV3MpO1xuXG4gIC8vIEVtb2ppIHRva2Vucy4gVGhleSBhcmUgbm90IGdyb3VwZWQgYnkgdGhlIHNjYW5uZXIgZXhjZXB0IGluIGNhc2VzIHdoZXJlIGFcbiAgLy8gemVyby13aWR0aCBqb2luZXIgaXMgcHJlc2VudFxuICBjb25zdCBFbW9qaSA9IHRyKFN0YXJ0LCBFTU9KSSwgRU1PSkkkMSwge1xuICAgIFtlbW9qaV06IHRydWVcbiAgfSk7XG4gIHRyKEVtb2ppLCBFTU9KSSwgRW1vamkpO1xuICB0dChFbW9qaSwgRU1PSklfVkFSSUFUSU9OLCBFbW9qaSk7XG4gIC8vIHR0KFN0YXJ0LCBFTU9KSV9WQVJJQVRJT04sIEVtb2ppKTsgLy8gVGhpcyBvbmUgaXMgc2tldGNoeVxuXG4gIGNvbnN0IEVtb2ppSm9pbmVyID0gdHQoRW1vamksIEVNT0pJX0pPSU5FUik7XG4gIHRyKEVtb2ppSm9pbmVyLCBFTU9KSSwgRW1vamkpO1xuICAvLyB0dChFbW9qaUpvaW5lciwgRU1PSklfVkFSSUFUSU9OLCBFbW9qaSk7IC8vIGFsc28gc2tldGNoeVxuXG4gIC8vIEdlbmVyYXRlcyBzdGF0ZXMgZm9yIHRvcC1sZXZlbCBkb21haW5zXG4gIC8vIE5vdGUgdGhhdCB0aGlzIGlzIG1vc3QgYWNjdXJhdGUgd2hlbiB0bGRzIGFyZSBpbiBhbHBoYWJldGljYWwgb3JkZXJcbiAgY29uc3Qgd29yZGpyID0gW1tBU0NJSV9MRVRURVIsIFdvcmRdXTtcbiAgY29uc3QgdXdvcmRqciA9IFtbQVNDSUlfTEVUVEVSLCBudWxsXSwgW0xFVFRFUiwgVVdvcmRdXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB0bGRzLmxlbmd0aDsgaSsrKSB7XG4gICAgZmFzdHRzKFN0YXJ0LCB0bGRzW2ldLCBUTEQsIFdPUkQsIHdvcmRqcik7XG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB1dGxkcy5sZW5ndGg7IGkrKykge1xuICAgIGZhc3R0cyhTdGFydCwgdXRsZHNbaV0sIFVUTEQsIFVXT1JELCB1d29yZGpyKTtcbiAgfVxuICBhZGRUb0dyb3VwcyhUTEQsIHtcbiAgICB0bGQ6IHRydWUsXG4gICAgYXNjaWk6IHRydWVcbiAgfSwgZ3JvdXBzKTtcbiAgYWRkVG9Hcm91cHMoVVRMRCwge1xuICAgIHV0bGQ6IHRydWUsXG4gICAgYWxwaGE6IHRydWVcbiAgfSwgZ3JvdXBzKTtcblxuICAvLyBDb2xsZWN0IHRoZSBzdGF0ZXMgZ2VuZXJhdGVkIGJ5IGRpZmZlcmVudCBwcm90b2NvbHMuIE5PVEU6IElmIGFueSBuZXcgVExEc1xuICAvLyBnZXQgYWRkZWQgdGhhdCBhcmUgYWxzbyBwcm90b2NvbHMsIHNldCB0aGUgdG9rZW4gdG8gYmUgdGhlIHNhbWUgYXMgdGhlXG4gIC8vIHByb3RvY29sIHRvIGVuc3VyZSBwYXJzaW5nIHdvcmtzIGFzIGV4cGVjdGVkLlxuICBmYXN0dHMoU3RhcnQsICdmaWxlJywgU0NIRU1FLCBXT1JELCB3b3JkanIpO1xuICBmYXN0dHMoU3RhcnQsICdtYWlsdG8nLCBTQ0hFTUUsIFdPUkQsIHdvcmRqcik7XG4gIGZhc3R0cyhTdGFydCwgJ2h0dHAnLCBTTEFTSF9TQ0hFTUUsIFdPUkQsIHdvcmRqcik7XG4gIGZhc3R0cyhTdGFydCwgJ2h0dHBzJywgU0xBU0hfU0NIRU1FLCBXT1JELCB3b3JkanIpO1xuICBmYXN0dHMoU3RhcnQsICdmdHAnLCBTTEFTSF9TQ0hFTUUsIFdPUkQsIHdvcmRqcik7XG4gIGZhc3R0cyhTdGFydCwgJ2Z0cHMnLCBTTEFTSF9TQ0hFTUUsIFdPUkQsIHdvcmRqcik7XG4gIGFkZFRvR3JvdXBzKFNDSEVNRSwge1xuICAgIHNjaGVtZTogdHJ1ZSxcbiAgICBhc2NpaTogdHJ1ZVxuICB9LCBncm91cHMpO1xuICBhZGRUb0dyb3VwcyhTTEFTSF9TQ0hFTUUsIHtcbiAgICBzbGFzaHNjaGVtZTogdHJ1ZSxcbiAgICBhc2NpaTogdHJ1ZVxuICB9LCBncm91cHMpO1xuXG4gIC8vIFJlZ2lzdGVyIGN1c3RvbSBzY2hlbWVzLiBBc3N1bWVzIGVhY2ggc2NoZW1lIGlzIGFzY2lpbnVtZXJpYyB3aXRoIGh5cGhlbnNcbiAgY3VzdG9tU2NoZW1lcyA9IGN1c3RvbVNjaGVtZXMuc29ydCgoYSwgYikgPT4gYVswXSA+IGJbMF0gPyAxIDogLTEpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGN1c3RvbVNjaGVtZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBzY2ggPSBjdXN0b21TY2hlbWVzW2ldWzBdO1xuICAgIGNvbnN0IG9wdGlvbmFsU2xhc2hTbGFzaCA9IGN1c3RvbVNjaGVtZXNbaV1bMV07XG4gICAgY29uc3QgZmxhZ3MgPSBvcHRpb25hbFNsYXNoU2xhc2ggPyB7XG4gICAgICBbc2NoZW1lXTogdHJ1ZVxuICAgIH0gOiB7XG4gICAgICBbc2xhc2hzY2hlbWVdOiB0cnVlXG4gICAgfTtcbiAgICBpZiAoc2NoLmluZGV4T2YoJy0nKSA+PSAwKSB7XG4gICAgICBmbGFnc1tkb21haW5dID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKCFBU0NJSV9MRVRURVIudGVzdChzY2gpKSB7XG4gICAgICBmbGFnc1tudW1lcmljXSA9IHRydWU7IC8vIG51bWJlcnMgb25seVxuICAgIH0gZWxzZSBpZiAoRElHSVQudGVzdChzY2gpKSB7XG4gICAgICBmbGFnc1thc2NpaW51bWVyaWNdID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgZmxhZ3NbYXNjaWldID0gdHJ1ZTtcbiAgICB9XG4gICAgdHMoU3RhcnQsIHNjaCwgc2NoLCBmbGFncyk7XG4gIH1cblxuICAvLyBMb2NhbGhvc3QgdG9rZW5cbiAgdHMoU3RhcnQsICdsb2NhbGhvc3QnLCBMT0NBTEhPU1QsIHtcbiAgICBhc2NpaTogdHJ1ZVxuICB9KTtcblxuICAvLyBTZXQgZGVmYXVsdCB0cmFuc2l0aW9uIGZvciBzdGFydCBzdGF0ZSAoc29tZSBzeW1ib2wpXG4gIFN0YXJ0LmpkID0gbmV3IFN0YXRlKFNZTSk7XG4gIHJldHVybiB7XG4gICAgc3RhcnQ6IFN0YXJ0LFxuICAgIHRva2VuczogYXNzaWduKHtcbiAgICAgIGdyb3Vwc1xuICAgIH0sIHRrKVxuICB9O1xufVxuXG4vKipcblx0R2l2ZW4gYSBzdHJpbmcsIHJldHVybnMgYW4gYXJyYXkgb2YgVE9LRU4gaW5zdGFuY2VzIHJlcHJlc2VudGluZyB0aGVcblx0Y29tcG9zaXRpb24gb2YgdGhhdCBzdHJpbmcuXG5cblx0QG1ldGhvZCBydW5cblx0QHBhcmFtIHtTdGF0ZTxzdHJpbmc+fSBzdGFydCBzY2FubmVyIHN0YXJ0aW5nIHN0YXRlXG5cdEBwYXJhbSB7c3RyaW5nfSBzdHIgaW5wdXQgc3RyaW5nIHRvIHNjYW5cblx0QHJldHVybiB7VG9rZW5bXX0gbGlzdCBvZiB0b2tlbnMsIGVhY2ggd2l0aCBhIHR5cGUgYW5kIHZhbHVlXG4qL1xuZnVuY3Rpb24gcnVuJDEoc3RhcnQsIHN0cikge1xuICAvLyBTdGF0ZSBtYWNoaW5lIGlzIG5vdCBjYXNlIHNlbnNpdGl2ZSwgc28gaW5wdXQgaXMgdG9rZW5pemVkIGluIGxvd2VyY2FzZWRcbiAgLy8gZm9ybSAoc3RpbGwgcmV0dXJucyByZWd1bGFyIGNhc2UpLiBVc2VzIHNlbGVjdGl2ZSBgdG9Mb3dlckNhc2VgIGJlY2F1c2VcbiAgLy8gbG93ZXJjYXNpbmcgdGhlIGVudGlyZSBzdHJpbmcgY2F1c2VzIHRoZSBsZW5ndGggYW5kIGNoYXJhY3RlciBwb3NpdGlvbiB0b1xuICAvLyB2YXJ5IGluIHNvbWUgbm9uLUVuZ2xpc2ggc3RyaW5ncyB3aXRoIFY4LWJhc2VkIHJ1bnRpbWVzLlxuICBjb25zdCBpdGVyYWJsZSA9IHN0cmluZ1RvQXJyYXkoc3RyLnJlcGxhY2UoL1tBLVpdL2csIGMgPT4gYy50b0xvd2VyQ2FzZSgpKSk7XG4gIGNvbnN0IGNoYXJDb3VudCA9IGl0ZXJhYmxlLmxlbmd0aDsgLy8gPD0gbGVuIGlmIHRoZXJlIGFyZSBlbW9qaXMsIGV0Y1xuICBjb25zdCB0b2tlbnMgPSBbXTsgLy8gcmV0dXJuIHZhbHVlXG5cbiAgLy8gY3Vyc29yIHRocm91Z2ggdGhlIHN0cmluZyBpdHNlbGYsIGFjY291bnRpbmcgZm9yIGNoYXJhY3RlcnMgdGhhdCBoYXZlXG4gIC8vIHdpZHRoIHdpdGggbGVuZ3RoIDIgc3VjaCBhcyBlbW9qaXNcbiAgbGV0IGN1cnNvciA9IDA7XG5cbiAgLy8gQ3Vyc29yIHRocm91Z2ggdGhlIGFycmF5LXJlcHJlc2VudGF0aW9uIG9mIHRoZSBzdHJpbmdcbiAgbGV0IGNoYXJDdXJzb3IgPSAwO1xuXG4gIC8vIFRva2VuaXplIHRoZSBzdHJpbmdcbiAgd2hpbGUgKGNoYXJDdXJzb3IgPCBjaGFyQ291bnQpIHtcbiAgICBsZXQgc3RhdGUgPSBzdGFydDtcbiAgICBsZXQgbmV4dFN0YXRlID0gbnVsbDtcbiAgICBsZXQgdG9rZW5MZW5ndGggPSAwO1xuICAgIGxldCBsYXRlc3RBY2NlcHRpbmcgPSBudWxsO1xuICAgIGxldCBzaW5jZUFjY2VwdHMgPSAtMTtcbiAgICBsZXQgY2hhcnNTaW5jZUFjY2VwdHMgPSAtMTtcbiAgICB3aGlsZSAoY2hhckN1cnNvciA8IGNoYXJDb3VudCAmJiAobmV4dFN0YXRlID0gc3RhdGUuZ28oaXRlcmFibGVbY2hhckN1cnNvcl0pKSkge1xuICAgICAgc3RhdGUgPSBuZXh0U3RhdGU7XG5cbiAgICAgIC8vIEtlZXAgdHJhY2sgb2YgdGhlIGxhdGVzdCBhY2NlcHRpbmcgc3RhdGVcbiAgICAgIGlmIChzdGF0ZS5hY2NlcHRzKCkpIHtcbiAgICAgICAgc2luY2VBY2NlcHRzID0gMDtcbiAgICAgICAgY2hhcnNTaW5jZUFjY2VwdHMgPSAwO1xuICAgICAgICBsYXRlc3RBY2NlcHRpbmcgPSBzdGF0ZTtcbiAgICAgIH0gZWxzZSBpZiAoc2luY2VBY2NlcHRzID49IDApIHtcbiAgICAgICAgc2luY2VBY2NlcHRzICs9IGl0ZXJhYmxlW2NoYXJDdXJzb3JdLmxlbmd0aDtcbiAgICAgICAgY2hhcnNTaW5jZUFjY2VwdHMrKztcbiAgICAgIH1cbiAgICAgIHRva2VuTGVuZ3RoICs9IGl0ZXJhYmxlW2NoYXJDdXJzb3JdLmxlbmd0aDtcbiAgICAgIGN1cnNvciArPSBpdGVyYWJsZVtjaGFyQ3Vyc29yXS5sZW5ndGg7XG4gICAgICBjaGFyQ3Vyc29yKys7XG4gICAgfVxuXG4gICAgLy8gUm9sbCBiYWNrIHRvIHRoZSBsYXRlc3QgYWNjZXB0aW5nIHN0YXRlXG4gICAgY3Vyc29yIC09IHNpbmNlQWNjZXB0cztcbiAgICBjaGFyQ3Vyc29yIC09IGNoYXJzU2luY2VBY2NlcHRzO1xuICAgIHRva2VuTGVuZ3RoIC09IHNpbmNlQWNjZXB0cztcblxuICAgIC8vIE5vIG1vcmUganVtcHMsIGp1c3QgbWFrZSBhIG5ldyB0b2tlbiBmcm9tIHRoZSBsYXN0IGFjY2VwdGluZyBvbmVcbiAgICB0b2tlbnMucHVzaCh7XG4gICAgICB0OiBsYXRlc3RBY2NlcHRpbmcudCxcbiAgICAgIC8vIHRva2VuIHR5cGUvbmFtZVxuICAgICAgdjogc3RyLnNsaWNlKGN1cnNvciAtIHRva2VuTGVuZ3RoLCBjdXJzb3IpLFxuICAgICAgLy8gc3RyaW5nIHZhbHVlXG4gICAgICBzOiBjdXJzb3IgLSB0b2tlbkxlbmd0aCxcbiAgICAgIC8vIHN0YXJ0IGluZGV4XG4gICAgICBlOiBjdXJzb3IgLy8gZW5kIGluZGV4IChleGNsdWRpbmcpXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gdG9rZW5zO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYSBTdHJpbmcgdG8gYW4gQXJyYXkgb2YgY2hhcmFjdGVycywgdGFraW5nIGludG8gYWNjb3VudCB0aGF0IHNvbWVcbiAqIGNoYXJhY3RlcnMgbGlrZSBlbW9qaXMgdGFrZSB1cCB0d28gc3RyaW5nIGluZGV4ZXMuXG4gKlxuICogQWRhcHRlZCBmcm9tIGNvcmUtanMgKE1JVCBsaWNlbnNlKVxuICogaHR0cHM6Ly9naXRodWIuY29tL3psb2lyb2NrL2NvcmUtanMvYmxvYi8yZDY5Y2Y1Zjk5YWIzZWEzNDYzYzM5NWRmODFlNWExNWI2OGY0OWQ5L3BhY2thZ2VzL2NvcmUtanMvaW50ZXJuYWxzL3N0cmluZy1tdWx0aWJ5dGUuanNcbiAqXG4gKiBAZnVuY3Rpb24gc3RyaW5nVG9BcnJheVxuICogQHBhcmFtIHtzdHJpbmd9IHN0clxuICogQHJldHVybnMge3N0cmluZ1tdfVxuICovXG5mdW5jdGlvbiBzdHJpbmdUb0FycmF5KHN0cikge1xuICBjb25zdCByZXN1bHQgPSBbXTtcbiAgY29uc3QgbGVuID0gc3RyLmxlbmd0aDtcbiAgbGV0IGluZGV4ID0gMDtcbiAgd2hpbGUgKGluZGV4IDwgbGVuKSB7XG4gICAgbGV0IGZpcnN0ID0gc3RyLmNoYXJDb2RlQXQoaW5kZXgpO1xuICAgIGxldCBzZWNvbmQ7XG4gICAgbGV0IGNoYXIgPSBmaXJzdCA8IDB4ZDgwMCB8fCBmaXJzdCA+IDB4ZGJmZiB8fCBpbmRleCArIDEgPT09IGxlbiB8fCAoc2Vjb25kID0gc3RyLmNoYXJDb2RlQXQoaW5kZXggKyAxKSkgPCAweGRjMDAgfHwgc2Vjb25kID4gMHhkZmZmID8gc3RyW2luZGV4XSAvLyBzaW5nbGUgY2hhcmFjdGVyXG4gICAgOiBzdHIuc2xpY2UoaW5kZXgsIGluZGV4ICsgMik7IC8vIHR3by1pbmRleCBjaGFyYWN0ZXJzXG4gICAgcmVzdWx0LnB1c2goY2hhcik7XG4gICAgaW5kZXggKz0gY2hhci5sZW5ndGg7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBGYXN0IHZlcnNpb24gb2YgdHMgZnVuY3Rpb24gZm9yIHdoZW4gdHJhbnNpdGlvbiBkZWZhdWx0cyBhcmUgd2VsbCBrbm93blxuICogQHBhcmFtIHtTdGF0ZTxzdHJpbmc+fSBzdGF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IGlucHV0XG4gKiBAcGFyYW0ge3N0cmluZ30gdFxuICogQHBhcmFtIHtzdHJpbmd9IGRlZmF1bHR0XG4gKiBAcGFyYW0ge1tSZWdFeHAsIFN0YXRlPHN0cmluZz5dW119IGpyXG4gKiBAcmV0dXJucyB7U3RhdGU8c3RyaW5nPn1cbiAqL1xuZnVuY3Rpb24gZmFzdHRzKHN0YXRlLCBpbnB1dCwgdCwgZGVmYXVsdHQsIGpyKSB7XG4gIGxldCBuZXh0O1xuICBjb25zdCBsZW4gPSBpbnB1dC5sZW5ndGg7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuIC0gMTsgaSsrKSB7XG4gICAgY29uc3QgY2hhciA9IGlucHV0W2ldO1xuICAgIGlmIChzdGF0ZS5qW2NoYXJdKSB7XG4gICAgICBuZXh0ID0gc3RhdGUualtjaGFyXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV4dCA9IG5ldyBTdGF0ZShkZWZhdWx0dCk7XG4gICAgICBuZXh0LmpyID0ganIuc2xpY2UoKTtcbiAgICAgIHN0YXRlLmpbY2hhcl0gPSBuZXh0O1xuICAgIH1cbiAgICBzdGF0ZSA9IG5leHQ7XG4gIH1cbiAgbmV4dCA9IG5ldyBTdGF0ZSh0KTtcbiAgbmV4dC5qciA9IGpyLnNsaWNlKCk7XG4gIHN0YXRlLmpbaW5wdXRbbGVuIC0gMV1dID0gbmV4dDtcbiAgcmV0dXJuIG5leHQ7XG59XG5cbi8qKlxuICogQ29udmVydHMgYSBzdHJpbmcgb2YgVG9wLUxldmVsIERvbWFpbiBuYW1lcyBlbmNvZGVkIGluIHVwZGF0ZS10bGRzLmpzIGJhY2tcbiAqIGludG8gYSBsaXN0IG9mIHN0cmluZ3MuXG4gKiBAcGFyYW0ge3N0cn0gZW5jb2RlZCBlbmNvZGVkIFRMRHMgc3RyaW5nXG4gKiBAcmV0dXJucyB7c3RyW119IG9yaWdpbmFsIFRMRHMgbGlzdFxuICovXG5mdW5jdGlvbiBkZWNvZGVUbGRzKGVuY29kZWQpIHtcbiAgY29uc3Qgd29yZHMgPSBbXTtcbiAgY29uc3Qgc3RhY2sgPSBbXTtcbiAgbGV0IGkgPSAwO1xuICBsZXQgZGlnaXRzID0gJzAxMjM0NTY3ODknO1xuICB3aGlsZSAoaSA8IGVuY29kZWQubGVuZ3RoKSB7XG4gICAgbGV0IHBvcERpZ2l0Q291bnQgPSAwO1xuICAgIHdoaWxlIChkaWdpdHMuaW5kZXhPZihlbmNvZGVkW2kgKyBwb3BEaWdpdENvdW50XSkgPj0gMCkge1xuICAgICAgcG9wRGlnaXRDb3VudCsrOyAvLyBlbmNvdW50ZXJlZCBzb21lIGRpZ2l0cywgaGF2ZSB0byBwb3AgdG8gZ28gb25lIGxldmVsIHVwIHRyaWVcbiAgICB9XG5cbiAgICBpZiAocG9wRGlnaXRDb3VudCA+IDApIHtcbiAgICAgIHdvcmRzLnB1c2goc3RhY2suam9pbignJykpOyAvLyB3aGF0ZXZlciBwcmVjZWRlZCB0aGUgcG9wIGRpZ2l0cyBtdXN0IGJlIGEgd29yZFxuICAgICAgZm9yIChsZXQgcG9wQ291bnQgPSBwYXJzZUludChlbmNvZGVkLnN1YnN0cmluZyhpLCBpICsgcG9wRGlnaXRDb3VudCksIDEwKTsgcG9wQ291bnQgPiAwOyBwb3BDb3VudC0tKSB7XG4gICAgICAgIHN0YWNrLnBvcCgpO1xuICAgICAgfVxuICAgICAgaSArPSBwb3BEaWdpdENvdW50O1xuICAgIH0gZWxzZSB7XG4gICAgICBzdGFjay5wdXNoKGVuY29kZWRbaV0pOyAvLyBkcm9wIGRvd24gYSBsZXZlbCBpbnRvIHRoZSB0cmllXG4gICAgICBpKys7XG4gICAgfVxuICB9XG4gIHJldHVybiB3b3Jkcztcbn1cblxuLyoqXG4gKiBBbiBvYmplY3Qgd2hlcmUgZWFjaCBrZXkgaXMgYSB2YWxpZCBET00gRXZlbnQgTmFtZSBzdWNoIGFzIGBjbGlja2Agb3IgYGZvY3VzYFxuICogYW5kIGVhY2ggdmFsdWUgaXMgYW4gZXZlbnQgaGFuZGxlciBmdW5jdGlvbi5cbiAqXG4gKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvRWxlbWVudCNldmVudHNcbiAqIEB0eXBlZGVmIHs/eyBbZXZlbnQ6IHN0cmluZ106IEZ1bmN0aW9uIH19IEV2ZW50TGlzdGVuZXJzXG4gKi9cblxuLyoqXG4gKiBBbGwgZm9ybWF0dGVkIHByb3BlcnRpZXMgcmVxdWlyZWQgdG8gcmVuZGVyIGEgbGluaywgaW5jbHVkaW5nIGB0YWdOYW1lYCxcbiAqIGBhdHRyaWJ1dGVzYCwgYGNvbnRlbnRgIGFuZCBgZXZlbnRMaXN0ZW5lcnNgLlxuICogQHR5cGVkZWYge3sgdGFnTmFtZTogYW55LCBhdHRyaWJ1dGVzOiB7W2F0dHI6IHN0cmluZ106IGFueX0sIGNvbnRlbnQ6IHN0cmluZyxcbiAqIGV2ZW50TGlzdGVuZXJzOiBFdmVudExpc3RlbmVycyB9fSBJbnRlcm1lZGlhdGVSZXByZXNlbnRhdGlvblxuICovXG5cbi8qKlxuICogU3BlY2lmeSBlaXRoZXIgYW4gb2JqZWN0IGRlc2NyaWJlZCBieSB0aGUgdGVtcGxhdGUgdHlwZSBgT2Agb3IgYSBmdW5jdGlvbi5cbiAqXG4gKiBUaGUgZnVuY3Rpb24gdGFrZXMgYSBzdHJpbmcgdmFsdWUgKHVzdWFsbHkgdGhlIGxpbmsncyBocmVmIGF0dHJpYnV0ZSksIHRoZVxuICogbGluayB0eXBlIChgJ3VybCdgLCBgJ2hhc2h0YWdgJywgZXRjLikgYW5kIGFuIGludGVybmFsIHRva2VuIHJlcHJlc2VudGF0aW9uXG4gKiBvZiB0aGUgbGluay4gSXQgc2hvdWxkIHJldHVybiBhbiBvYmplY3Qgb2YgdGhlIHRlbXBsYXRlIHR5cGUgYE9gXG4gKiBAdGVtcGxhdGUgT1xuICogQHR5cGVkZWYge08gfCAoKHZhbHVlOiBzdHJpbmcsIHR5cGU6IHN0cmluZywgdG9rZW46IE11bHRpVG9rZW4pID0+IE8pfSBPcHRPYmpcbiAqL1xuXG4vKipcbiAqIFNwZWNpZnkgZWl0aGVyIGEgZnVuY3Rpb24gZGVzY3JpYmVkIGJ5IHRlbXBsYXRlIHR5cGUgYEZgIG9yIGFuIG9iamVjdC5cbiAqXG4gKiBFYWNoIGtleSBpbiB0aGUgb2JqZWN0IHNob3VsZCBiZSBhIGxpbmsgdHlwZSAoYCd1cmwnYCwgYCdoYXNodGFnYCcsIGV0Yy4pLiBFYWNoXG4gKiB2YWx1ZSBzaG91bGQgYmUgYSBmdW5jdGlvbiB3aXRoIHRlbXBsYXRlIHR5cGUgYEZgIHRoYXQgaXMgY2FsbGVkIHdoZW4gdGhlXG4gKiBjb3JyZXNwb25kaW5nIGxpbmsgdHlwZSBpcyBlbmNvdW50ZXJlZC5cbiAqIEB0ZW1wbGF0ZSBGXG4gKiBAdHlwZWRlZiB7RiB8IHsgW3R5cGU6IHN0cmluZ106IEZ9fSBPcHRGblxuICovXG5cbi8qKlxuICogU3BlY2lmeSBlaXRoZXIgYSB2YWx1ZSB3aXRoIHRlbXBsYXRlIHR5cGUgYFZgLCBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBgVmAgb3JcbiAqIGFuIG9iamVjdCB3aGVyZSBlYWNoIHZhbHVlIHJlc29sdmVzIHRvIGBWYC5cbiAqXG4gKiBUaGUgZnVuY3Rpb24gdGFrZXMgYSBzdHJpbmcgdmFsdWUgKHVzdWFsbHkgdGhlIGxpbmsncyBocmVmIGF0dHJpYnV0ZSksIHRoZVxuICogbGluayB0eXBlIChgJ3VybCdgLCBgJ2hhc2h0YWdgJywgZXRjLikgYW5kIGFuIGludGVybmFsIHRva2VuIHJlcHJlc2VudGF0aW9uXG4gKiBvZiB0aGUgbGluay4gSXQgc2hvdWxkIHJldHVybiBhbiBvYmplY3Qgb2YgdGhlIHRlbXBsYXRlIHR5cGUgYFZgXG4gKlxuICogRm9yIHRoZSBvYmplY3QsIGVhY2gga2V5IHNob3VsZCBiZSBhIGxpbmsgdHlwZSAoYCd1cmwnYCwgYCdoYXNodGFnYCcsIGV0Yy4pLlxuICogRWFjaCB2YWx1ZSBzaG91bGQgZWl0aGVyIGhhdmUgdHlwZSBgVmAgb3IgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgVi4gVGhpc1xuICogZnVuY3Rpb24gc2ltaWxhcmx5IHRha2VzIGEgc3RyaW5nIHZhbHVlIGFuZCBhIHRva2VuLlxuICpcbiAqIEV4YW1wbGUgdmFsaWQgdHlwZXMgZm9yIGBPcHQ8c3RyaW5nPmA6XG4gKlxuICogYGBganNcbiAqICdoZWxsbydcbiAqICh2YWx1ZSwgdHlwZSwgdG9rZW4pID0+ICd3b3JsZCdcbiAqIHsgdXJsOiAnaGVsbG8nLCBlbWFpbDogKHZhbHVlLCB0b2tlbikgPT4gJ3dvcmxkJ31cbiAqIGBgYFxuICogQHRlbXBsYXRlIFZcbiAqIEB0eXBlZGVmIHtWIHwgKCh2YWx1ZTogc3RyaW5nLCB0eXBlOiBzdHJpbmcsIHRva2VuOiBNdWx0aVRva2VuKSA9PiBWKSB8IHsgW3R5cGU6IHN0cmluZ106IFYgfCAoKHZhbHVlOiBzdHJpbmcsIHRva2VuOiBNdWx0aVRva2VuKSA9PiBWKSB9fSBPcHRcbiAqL1xuXG4vKipcbiAqIFNlZSBhdmFpbGFibGUgb3B0aW9uczogaHR0cHM6Ly9saW5raWZ5LmpzLm9yZy9kb2NzL29wdGlvbnMuaHRtbFxuICogQHR5cGVkZWYge3tcbiAqIFx0ZGVmYXVsdFByb3RvY29sPzogc3RyaW5nLFxuICogIGV2ZW50cz86IE9wdE9iajxFdmVudExpc3RlbmVycz4sXG4gKiBcdGZvcm1hdD86IE9wdDxzdHJpbmc+LFxuICogXHRmb3JtYXRIcmVmPzogT3B0PHN0cmluZz4sXG4gKiBcdG5sMmJyPzogYm9vbGVhbixcbiAqIFx0dGFnTmFtZT86IE9wdDxhbnk+LFxuICogXHR0YXJnZXQ/OiBPcHQ8c3RyaW5nPixcbiAqIFx0cmVsPzogT3B0PHN0cmluZz4sXG4gKiBcdHZhbGlkYXRlPzogT3B0PGJvb2xlYW4+LFxuICogXHR0cnVuY2F0ZT86IE9wdDxudW1iZXI+LFxuICogXHRjbGFzc05hbWU/OiBPcHQ8c3RyaW5nPixcbiAqIFx0YXR0cmlidXRlcz86IE9wdE9iajwoeyBbYXR0cjogc3RyaW5nXTogYW55IH0pPixcbiAqICBpZ25vcmVUYWdzPzogc3RyaW5nW10sXG4gKiBcdHJlbmRlcj86IE9wdEZuPCgoaXI6IEludGVybWVkaWF0ZVJlcHJlc2VudGF0aW9uKSA9PiBhbnkpPlxuICogfX0gT3B0c1xuICovXG5cbi8qKlxuICogQHR5cGUgUmVxdWlyZWQ8T3B0cz5cbiAqL1xuY29uc3QgZGVmYXVsdHMgPSB7XG4gIGRlZmF1bHRQcm90b2NvbDogJ2h0dHAnLFxuICBldmVudHM6IG51bGwsXG4gIGZvcm1hdDogbm9vcCxcbiAgZm9ybWF0SHJlZjogbm9vcCxcbiAgbmwyYnI6IGZhbHNlLFxuICB0YWdOYW1lOiAnYScsXG4gIHRhcmdldDogbnVsbCxcbiAgcmVsOiBudWxsLFxuICB2YWxpZGF0ZTogdHJ1ZSxcbiAgdHJ1bmNhdGU6IEluZmluaXR5LFxuICBjbGFzc05hbWU6IG51bGwsXG4gIGF0dHJpYnV0ZXM6IG51bGwsXG4gIGlnbm9yZVRhZ3M6IFtdLFxuICByZW5kZXI6IG51bGxcbn07XG5cbi8qKlxuICogVXRpbGl0eSBjbGFzcyBmb3IgbGlua2lmeSBpbnRlcmZhY2VzIHRvIGFwcGx5IHNwZWNpZmllZFxuICoge0BsaW5rIE9wdHMgZm9ybWF0dGluZyBhbmQgcmVuZGVyaW5nIG9wdGlvbnN9LlxuICpcbiAqIEBwYXJhbSB7T3B0cyB8IE9wdGlvbnN9IFtvcHRzXSBPcHRpb24gdmFsdWUgb3ZlcnJpZGVzLlxuICogQHBhcmFtIHsoaXI6IEludGVybWVkaWF0ZVJlcHJlc2VudGF0aW9uKSA9PiBhbnl9IFtkZWZhdWx0UmVuZGVyXSAoRm9yXG4gKiAgIGludGVybmFsIHVzZSkgZGVmYXVsdCByZW5kZXIgZnVuY3Rpb24gdGhhdCBkZXRlcm1pbmVzIGhvdyB0byBnZW5lcmF0ZSBhblxuICogICBIVE1MIGVsZW1lbnQgYmFzZWQgb24gYSBsaW5rIHRva2VuJ3MgZGVyaXZlZCB0YWdOYW1lLCBhdHRyaWJ1dGVzIGFuZCBIVE1MLlxuICogICBTaW1pbGFyIHRvIHJlbmRlciBvcHRpb25cbiAqL1xuZnVuY3Rpb24gT3B0aW9ucyhvcHRzLCBkZWZhdWx0UmVuZGVyKSB7XG4gIGlmIChkZWZhdWx0UmVuZGVyID09PSB2b2lkIDApIHtcbiAgICBkZWZhdWx0UmVuZGVyID0gbnVsbDtcbiAgfVxuICBsZXQgbyA9IGFzc2lnbih7fSwgZGVmYXVsdHMpO1xuICBpZiAob3B0cykge1xuICAgIG8gPSBhc3NpZ24obywgb3B0cyBpbnN0YW5jZW9mIE9wdGlvbnMgPyBvcHRzLm8gOiBvcHRzKTtcbiAgfVxuXG4gIC8vIEVuc3VyZSBhbGwgaWdub3JlZCB0YWdzIGFyZSB1cHBlcmNhc2VcbiAgY29uc3QgaWdub3JlZFRhZ3MgPSBvLmlnbm9yZVRhZ3M7XG4gIGNvbnN0IHVwcGVyY2FzZUlnbm9yZWRUYWdzID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgaWdub3JlZFRhZ3MubGVuZ3RoOyBpKyspIHtcbiAgICB1cHBlcmNhc2VJZ25vcmVkVGFncy5wdXNoKGlnbm9yZWRUYWdzW2ldLnRvVXBwZXJDYXNlKCkpO1xuICB9XG4gIC8qKiBAcHJvdGVjdGVkICovXG4gIHRoaXMubyA9IG87XG4gIGlmIChkZWZhdWx0UmVuZGVyKSB7XG4gICAgdGhpcy5kZWZhdWx0UmVuZGVyID0gZGVmYXVsdFJlbmRlcjtcbiAgfVxuICB0aGlzLmlnbm9yZVRhZ3MgPSB1cHBlcmNhc2VJZ25vcmVkVGFncztcbn1cbk9wdGlvbnMucHJvdG90eXBlID0ge1xuICBvOiBkZWZhdWx0cyxcbiAgLyoqXG4gICAqIEB0eXBlIHN0cmluZ1tdXG4gICAqL1xuICBpZ25vcmVUYWdzOiBbXSxcbiAgLyoqXG4gICAqIEBwYXJhbSB7SW50ZXJtZWRpYXRlUmVwcmVzZW50YXRpb259IGlyXG4gICAqIEByZXR1cm5zIHthbnl9XG4gICAqL1xuICBkZWZhdWx0UmVuZGVyKGlyKSB7XG4gICAgcmV0dXJuIGlyO1xuICB9LFxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIG9yIGZhbHNlIGJhc2VkIG9uIHdoZXRoZXIgYSB0b2tlbiBzaG91bGQgYmUgZGlzcGxheWVkIGFzIGFcbiAgICogbGluayBiYXNlZCBvbiB0aGUgdXNlciBvcHRpb25zLlxuICAgKiBAcGFyYW0ge011bHRpVG9rZW59IHRva2VuXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgY2hlY2sodG9rZW4pIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3ZhbGlkYXRlJywgdG9rZW4udG9TdHJpbmcoKSwgdG9rZW4pO1xuICB9LFxuICAvLyBQcml2YXRlIG1ldGhvZHNcblxuICAvKipcbiAgICogUmVzb2x2ZSBhbiBvcHRpb24ncyB2YWx1ZSBiYXNlZCBvbiB0aGUgdmFsdWUgb2YgdGhlIG9wdGlvbiBhbmQgdGhlIGdpdmVuXG4gICAqIHBhcmFtcy4gSWYgb3BlcmF0b3IgYW5kIHRva2VuIGFyZSBzcGVjaWZpZWQgYW5kIHRoZSB0YXJnZXQgb3B0aW9uIGlzXG4gICAqIGNhbGxhYmxlLCBhdXRvbWF0aWNhbGx5IGNhbGxzIHRoZSBmdW5jdGlvbiB3aXRoIHRoZSBnaXZlbiBhcmd1bWVudC5cbiAgICogQHRlbXBsYXRlIHtrZXlvZiBPcHRzfSBLXG4gICAqIEBwYXJhbSB7S30ga2V5IE5hbWUgb2Ygb3B0aW9uIHRvIHVzZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gW29wZXJhdG9yXSB3aWxsIGJlIHBhc3NlZCB0byB0aGUgdGFyZ2V0IG9wdGlvbiBpZiBpdCdzIGFcbiAgICogZnVuY3Rpb24uIElmIG5vdCBzcGVjaWZpZWQsIFJBVyBmdW5jdGlvbiB2YWx1ZSBnZXRzIHJldHVybmVkXG4gICAqIEBwYXJhbSB7TXVsdGlUb2tlbn0gW3Rva2VuXSBUaGUgdG9rZW4gZnJvbSBsaW5raWZ5LnRva2VuaXplXG4gICAqIEByZXR1cm5zIHtPcHRzW0tdIHwgYW55fVxuICAgKi9cbiAgZ2V0KGtleSwgb3BlcmF0b3IsIHRva2VuKSB7XG4gICAgY29uc3QgaXNDYWxsYWJsZSA9IG9wZXJhdG9yICE9IG51bGw7XG4gICAgbGV0IG9wdGlvbiA9IHRoaXMub1trZXldO1xuICAgIGlmICghb3B0aW9uKSB7XG4gICAgICByZXR1cm4gb3B0aW9uO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIG9wdGlvbiA9PT0gJ29iamVjdCcpIHtcbiAgICAgIG9wdGlvbiA9IHRva2VuLnQgaW4gb3B0aW9uID8gb3B0aW9uW3Rva2VuLnRdIDogZGVmYXVsdHNba2V5XTtcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09PSAnZnVuY3Rpb24nICYmIGlzQ2FsbGFibGUpIHtcbiAgICAgICAgb3B0aW9uID0gb3B0aW9uKG9wZXJhdG9yLCB0b2tlbik7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygb3B0aW9uID09PSAnZnVuY3Rpb24nICYmIGlzQ2FsbGFibGUpIHtcbiAgICAgIG9wdGlvbiA9IG9wdGlvbihvcGVyYXRvciwgdG9rZW4udCwgdG9rZW4pO1xuICAgIH1cbiAgICByZXR1cm4gb3B0aW9uO1xuICB9LFxuICAvKipcbiAgICogQHRlbXBsYXRlIHtrZXlvZiBPcHRzfSBMXG4gICAqIEBwYXJhbSB7TH0ga2V5IE5hbWUgb2Ygb3B0aW9ucyBvYmplY3QgdG8gdXNlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbb3BlcmF0b3JdXG4gICAqIEBwYXJhbSB7TXVsdGlUb2tlbn0gW3Rva2VuXVxuICAgKiBAcmV0dXJucyB7T3B0c1tMXSB8IGFueX1cbiAgICovXG4gIGdldE9iaihrZXksIG9wZXJhdG9yLCB0b2tlbikge1xuICAgIGxldCBvYmogPSB0aGlzLm9ba2V5XTtcbiAgICBpZiAodHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJyAmJiBvcGVyYXRvciAhPSBudWxsKSB7XG4gICAgICBvYmogPSBvYmoob3BlcmF0b3IsIHRva2VuLnQsIHRva2VuKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfSxcbiAgLyoqXG4gICAqIENvbnZlcnQgdGhlIGdpdmVuIHRva2VuIHRvIGEgcmVuZGVyZWQgZWxlbWVudCB0aGF0IG1heSBiZSBhZGRlZCB0byB0aGVcbiAgICogY2FsbGluZy1pbnRlcmZhY2UncyBET01cbiAgICogQHBhcmFtIHtNdWx0aVRva2VufSB0b2tlbiBUb2tlbiB0byByZW5kZXIgdG8gYW4gSFRNTCBlbGVtZW50XG4gICAqIEByZXR1cm5zIHthbnl9IFJlbmRlciByZXN1bHQ7IGUuZy4sIEhUTUwgc3RyaW5nLCBET00gZWxlbWVudCwgUmVhY3RcbiAgICogICBDb21wb25lbnQsIGV0Yy5cbiAgICovXG4gIHJlbmRlcih0b2tlbikge1xuICAgIGNvbnN0IGlyID0gdG9rZW4ucmVuZGVyKHRoaXMpOyAvLyBpbnRlcm1lZGlhdGUgcmVwcmVzZW50YXRpb25cbiAgICBjb25zdCByZW5kZXJGbiA9IHRoaXMuZ2V0KCdyZW5kZXInLCBudWxsLCB0b2tlbikgfHwgdGhpcy5kZWZhdWx0UmVuZGVyO1xuICAgIHJldHVybiByZW5kZXJGbihpciwgdG9rZW4udCwgdG9rZW4pO1xuICB9XG59O1xuZnVuY3Rpb24gbm9vcCh2YWwpIHtcbiAgcmV0dXJuIHZhbDtcbn1cblxudmFyIG9wdGlvbnMgPSAvKiNfX1BVUkVfXyovT2JqZWN0LmZyZWV6ZSh7XG5cdF9fcHJvdG9fXzogbnVsbCxcblx0ZGVmYXVsdHM6IGRlZmF1bHRzLFxuXHRPcHRpb25zOiBPcHRpb25zLFxuXHRhc3NpZ246IGFzc2lnblxufSk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblx0TXVsdGktVG9rZW5zXG5cdFRva2VucyBjb21wb3NlZCBvZiBhcnJheXMgb2YgVGV4dFRva2Vuc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZVxuICogQHBhcmFtIHtUb2tlbltdfSB0b2tlbnNcbiAqL1xuZnVuY3Rpb24gTXVsdGlUb2tlbih2YWx1ZSwgdG9rZW5zKSB7XG4gIHRoaXMudCA9ICd0b2tlbic7XG4gIHRoaXMudiA9IHZhbHVlO1xuICB0aGlzLnRrID0gdG9rZW5zO1xufVxuXG4vKipcbiAqIEFic3RyYWN0IGNsYXNzIHVzZWQgZm9yIG1hbnVmYWN0dXJpbmcgdG9rZW5zIG9mIHRleHQgdG9rZW5zLiBUaGF0IGlzIHJhdGhlclxuICogdGhhbiB0aGUgdmFsdWUgZm9yIGEgdG9rZW4gYmVpbmcgYSBzbWFsbCBzdHJpbmcgb2YgdGV4dCwgaXQncyB2YWx1ZSBhbiBhcnJheVxuICogb2YgdGV4dCB0b2tlbnMuXG4gKlxuICogVXNlZCBmb3IgZ3JvdXBpbmcgdG9nZXRoZXIgVVJMcywgZW1haWxzLCBoYXNodGFncywgYW5kIG90aGVyIHBvdGVudGlhbFxuICogY3JlYXRpb25zLlxuICogQGNsYXNzIE11bHRpVG9rZW5cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB0XG4gKiBAcHJvcGVydHkge3N0cmluZ30gdlxuICogQHByb3BlcnR5IHtUb2tlbltdfSB0a1xuICogQGFic3RyYWN0XG4gKi9cbk11bHRpVG9rZW4ucHJvdG90eXBlID0ge1xuICBpc0xpbms6IGZhbHNlLFxuICAvKipcbiAgICogUmV0dXJuIHRoZSBzdHJpbmcgdGhpcyB0b2tlbiByZXByZXNlbnRzLlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy52O1xuICB9LFxuICAvKipcbiAgICogV2hhdCBzaG91bGQgdGhlIHZhbHVlIGZvciB0aGlzIHRva2VuIGJlIGluIHRoZSBgaHJlZmAgSFRNTCBhdHRyaWJ1dGU/XG4gICAqIFJldHVybnMgdGhlIGAudG9TdHJpbmdgIHZhbHVlIGJ5IGRlZmF1bHQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbc2NoZW1lXVxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICovXG4gIHRvSHJlZihzY2hlbWUpIHtcbiAgICByZXR1cm4gdGhpcy50b1N0cmluZygpO1xuICB9LFxuICAvKipcbiAgICogQHBhcmFtIHtPcHRpb25zfSBvcHRpb25zIEZvcm1hdHRpbmcgb3B0aW9uc1xuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgKi9cbiAgdG9Gb3JtYXR0ZWRTdHJpbmcob3B0aW9ucykge1xuICAgIGNvbnN0IHZhbCA9IHRoaXMudG9TdHJpbmcoKTtcbiAgICBjb25zdCB0cnVuY2F0ZSA9IG9wdGlvbnMuZ2V0KCd0cnVuY2F0ZScsIHZhbCwgdGhpcyk7XG4gICAgY29uc3QgZm9ybWF0dGVkID0gb3B0aW9ucy5nZXQoJ2Zvcm1hdCcsIHZhbCwgdGhpcyk7XG4gICAgcmV0dXJuIHRydW5jYXRlICYmIGZvcm1hdHRlZC5sZW5ndGggPiB0cnVuY2F0ZSA/IGZvcm1hdHRlZC5zdWJzdHJpbmcoMCwgdHJ1bmNhdGUpICsgJ1x1MjAyNicgOiBmb3JtYXR0ZWQ7XG4gIH0sXG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0ge09wdGlvbnN9IG9wdGlvbnNcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIHRvRm9ybWF0dGVkSHJlZihvcHRpb25zKSB7XG4gICAgcmV0dXJuIG9wdGlvbnMuZ2V0KCdmb3JtYXRIcmVmJywgdGhpcy50b0hyZWYob3B0aW9ucy5nZXQoJ2RlZmF1bHRQcm90b2NvbCcpKSwgdGhpcyk7XG4gIH0sXG4gIC8qKlxuICAgKiBUaGUgc3RhcnQgaW5kZXggb2YgdGhpcyB0b2tlbiBpbiB0aGUgb3JpZ2luYWwgaW5wdXQgc3RyaW5nXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBzdGFydEluZGV4KCkge1xuICAgIHJldHVybiB0aGlzLnRrWzBdLnM7XG4gIH0sXG4gIC8qKlxuICAgKiBUaGUgZW5kIGluZGV4IG9mIHRoaXMgdG9rZW4gaW4gdGhlIG9yaWdpbmFsIGlucHV0IHN0cmluZyAodXAgdG8gdGhpc1xuICAgKiBpbmRleCBidXQgbm90IGluY2x1ZGluZyBpdClcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIGVuZEluZGV4KCkge1xuICAgIHJldHVybiB0aGlzLnRrW3RoaXMudGsubGVuZ3RoIC0gMV0uZTtcbiAgfSxcbiAgLyoqXG4gIFx0UmV0dXJucyBhbiBvYmplY3QgIG9mIHJlbGV2YW50IHZhbHVlcyBmb3IgdGhpcyB0b2tlbiwgd2hpY2ggaW5jbHVkZXMga2V5c1xuICBcdCogdHlwZSAtIEtpbmQgb2YgdG9rZW4gKCd1cmwnLCAnZW1haWwnLCBldGMuKVxuICBcdCogdmFsdWUgLSBPcmlnaW5hbCB0ZXh0XG4gIFx0KiBocmVmIC0gVGhlIHZhbHVlIHRoYXQgc2hvdWxkIGJlIGFkZGVkIHRvIHRoZSBhbmNob3IgdGFnJ3MgaHJlZlxuICBcdFx0YXR0cmlidXRlXG4gIFx0XHRAbWV0aG9kIHRvT2JqZWN0XG4gIFx0QHBhcmFtIHtzdHJpbmd9IFtwcm90b2NvbF0gYCdodHRwJ2AgYnkgZGVmYXVsdFxuICAqL1xuICB0b09iamVjdChwcm90b2NvbCkge1xuICAgIGlmIChwcm90b2NvbCA9PT0gdm9pZCAwKSB7XG4gICAgICBwcm90b2NvbCA9IGRlZmF1bHRzLmRlZmF1bHRQcm90b2NvbDtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IHRoaXMudCxcbiAgICAgIHZhbHVlOiB0aGlzLnRvU3RyaW5nKCksXG4gICAgICBpc0xpbms6IHRoaXMuaXNMaW5rLFxuICAgICAgaHJlZjogdGhpcy50b0hyZWYocHJvdG9jb2wpLFxuICAgICAgc3RhcnQ6IHRoaXMuc3RhcnRJbmRleCgpLFxuICAgICAgZW5kOiB0aGlzLmVuZEluZGV4KClcbiAgICB9O1xuICB9LFxuICAvKipcbiAgICpcbiAgICogQHBhcmFtIHtPcHRpb25zfSBvcHRpb25zIEZvcm1hdHRpbmcgb3B0aW9uXG4gICAqL1xuICB0b0Zvcm1hdHRlZE9iamVjdChvcHRpb25zKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IHRoaXMudCxcbiAgICAgIHZhbHVlOiB0aGlzLnRvRm9ybWF0dGVkU3RyaW5nKG9wdGlvbnMpLFxuICAgICAgaXNMaW5rOiB0aGlzLmlzTGluayxcbiAgICAgIGhyZWY6IHRoaXMudG9Gb3JtYXR0ZWRIcmVmKG9wdGlvbnMpLFxuICAgICAgc3RhcnQ6IHRoaXMuc3RhcnRJbmRleCgpLFxuICAgICAgZW5kOiB0aGlzLmVuZEluZGV4KClcbiAgICB9O1xuICB9LFxuICAvKipcbiAgICogV2hldGhlciB0aGlzIHRva2VuIHNob3VsZCBiZSByZW5kZXJlZCBhcyBhIGxpbmsgYWNjb3JkaW5nIHRvIHRoZSBnaXZlbiBvcHRpb25zXG4gICAqIEBwYXJhbSB7T3B0aW9uc30gb3B0aW9uc1xuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIHZhbGlkYXRlKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gb3B0aW9ucy5nZXQoJ3ZhbGlkYXRlJywgdGhpcy50b1N0cmluZygpLCB0aGlzKTtcbiAgfSxcbiAgLyoqXG4gICAqIFJldHVybiBhbiBvYmplY3QgdGhhdCByZXByZXNlbnRzIGhvdyB0aGlzIGxpbmsgc2hvdWxkIGJlIHJlbmRlcmVkLlxuICAgKiBAcGFyYW0ge09wdGlvbnN9IG9wdGlvbnMgRm9ybWF0dGlubmcgb3B0aW9uc1xuICAgKi9cbiAgcmVuZGVyKG9wdGlvbnMpIHtcbiAgICBjb25zdCB0b2tlbiA9IHRoaXM7XG4gICAgY29uc3QgaHJlZiA9IHRoaXMudG9IcmVmKG9wdGlvbnMuZ2V0KCdkZWZhdWx0UHJvdG9jb2wnKSk7XG4gICAgY29uc3QgZm9ybWF0dGVkSHJlZiA9IG9wdGlvbnMuZ2V0KCdmb3JtYXRIcmVmJywgaHJlZiwgdGhpcyk7XG4gICAgY29uc3QgdGFnTmFtZSA9IG9wdGlvbnMuZ2V0KCd0YWdOYW1lJywgaHJlZiwgdG9rZW4pO1xuICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLnRvRm9ybWF0dGVkU3RyaW5nKG9wdGlvbnMpO1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSB7fTtcbiAgICBjb25zdCBjbGFzc05hbWUgPSBvcHRpb25zLmdldCgnY2xhc3NOYW1lJywgaHJlZiwgdG9rZW4pO1xuICAgIGNvbnN0IHRhcmdldCA9IG9wdGlvbnMuZ2V0KCd0YXJnZXQnLCBocmVmLCB0b2tlbik7XG4gICAgY29uc3QgcmVsID0gb3B0aW9ucy5nZXQoJ3JlbCcsIGhyZWYsIHRva2VuKTtcbiAgICBjb25zdCBhdHRycyA9IG9wdGlvbnMuZ2V0T2JqKCdhdHRyaWJ1dGVzJywgaHJlZiwgdG9rZW4pO1xuICAgIGNvbnN0IGV2ZW50TGlzdGVuZXJzID0gb3B0aW9ucy5nZXRPYmooJ2V2ZW50cycsIGhyZWYsIHRva2VuKTtcbiAgICBhdHRyaWJ1dGVzLmhyZWYgPSBmb3JtYXR0ZWRIcmVmO1xuICAgIGlmIChjbGFzc05hbWUpIHtcbiAgICAgIGF0dHJpYnV0ZXMuY2xhc3MgPSBjbGFzc05hbWU7XG4gICAgfVxuICAgIGlmICh0YXJnZXQpIHtcbiAgICAgIGF0dHJpYnV0ZXMudGFyZ2V0ID0gdGFyZ2V0O1xuICAgIH1cbiAgICBpZiAocmVsKSB7XG4gICAgICBhdHRyaWJ1dGVzLnJlbCA9IHJlbDtcbiAgICB9XG4gICAgaWYgKGF0dHJzKSB7XG4gICAgICBhc3NpZ24oYXR0cmlidXRlcywgYXR0cnMpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgdGFnTmFtZSxcbiAgICAgIGF0dHJpYnV0ZXMsXG4gICAgICBjb250ZW50LFxuICAgICAgZXZlbnRMaXN0ZW5lcnNcbiAgICB9O1xuICB9XG59O1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyB0b2tlbiB0aGF0IGNhbiBiZSBlbWl0dGVkIGJ5IHRoZSBwYXJzZXIgc3RhdGUgbWFjaGluZVxuICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgcmVhZGFibGUgdHlwZSBvZiB0aGUgdG9rZW5cbiAqIEBwYXJhbSB7b2JqZWN0fSBwcm9wcyBwcm9wZXJ0aWVzIHRvIGFzc2lnbiBvciBvdmVycmlkZSwgaW5jbHVkaW5nIGlzTGluayA9IHRydWUgb3IgZmFsc2VcbiAqIEByZXR1cm5zIHtuZXcgKHZhbHVlOiBzdHJpbmcsIHRva2VuczogVG9rZW5bXSkgPT4gTXVsdGlUb2tlbn0gbmV3IHRva2VuIGNsYXNzXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVRva2VuQ2xhc3ModHlwZSwgcHJvcHMpIHtcbiAgY2xhc3MgVG9rZW4gZXh0ZW5kcyBNdWx0aVRva2VuIHtcbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZSwgdG9rZW5zKSB7XG4gICAgICBzdXBlcih2YWx1ZSwgdG9rZW5zKTtcbiAgICAgIHRoaXMudCA9IHR5cGU7XG4gICAgfVxuICB9XG4gIGZvciAoY29uc3QgcCBpbiBwcm9wcykge1xuICAgIFRva2VuLnByb3RvdHlwZVtwXSA9IHByb3BzW3BdO1xuICB9XG4gIFRva2VuLnQgPSB0eXBlO1xuICByZXR1cm4gVG9rZW47XG59XG5cbi8qKlxuXHRSZXByZXNlbnRzIGEgbGlzdCBvZiB0b2tlbnMgbWFraW5nIHVwIGEgdmFsaWQgZW1haWwgYWRkcmVzc1xuKi9cbmNvbnN0IEVtYWlsID0gY3JlYXRlVG9rZW5DbGFzcygnZW1haWwnLCB7XG4gIGlzTGluazogdHJ1ZSxcbiAgdG9IcmVmKCkge1xuICAgIHJldHVybiAnbWFpbHRvOicgKyB0aGlzLnRvU3RyaW5nKCk7XG4gIH1cbn0pO1xuXG4vKipcblx0UmVwcmVzZW50cyBzb21lIHBsYWluIHRleHRcbiovXG5jb25zdCBUZXh0ID0gY3JlYXRlVG9rZW5DbGFzcygndGV4dCcpO1xuXG4vKipcblx0TXVsdGktbGluZWJyZWFrIHRva2VuIC0gcmVwcmVzZW50cyBhIGxpbmUgYnJlYWtcblx0QGNsYXNzIE5sXG4qL1xuY29uc3QgTmwgPSBjcmVhdGVUb2tlbkNsYXNzKCdubCcpO1xuXG4vKipcblx0UmVwcmVzZW50cyBhIGxpc3Qgb2YgdGV4dCB0b2tlbnMgbWFraW5nIHVwIGEgdmFsaWQgVVJMXG5cdEBjbGFzcyBVcmxcbiovXG5jb25zdCBVcmwgPSBjcmVhdGVUb2tlbkNsYXNzKCd1cmwnLCB7XG4gIGlzTGluazogdHJ1ZSxcbiAgLyoqXG4gIFx0TG93ZXJjYXNlcyByZWxldmFudCBwYXJ0cyBvZiB0aGUgZG9tYWluIGFuZCBhZGRzIHRoZSBwcm90b2NvbCBpZlxuICBcdHJlcXVpcmVkLiBOb3RlIHRoYXQgdGhpcyB3aWxsIG5vdCBlc2NhcGUgdW5zYWZlIEhUTUwgY2hhcmFjdGVycyBpbiB0aGVcbiAgXHRVUkwuXG4gIFx0XHRAcGFyYW0ge3N0cmluZ30gW3NjaGVtZV0gZGVmYXVsdCBzY2hlbWUgKGUuZy4sICdodHRwcycpXG4gIFx0QHJldHVybiB7c3RyaW5nfSB0aGUgZnVsbCBocmVmXG4gICovXG4gIHRvSHJlZihzY2hlbWUpIHtcbiAgICBpZiAoc2NoZW1lID09PSB2b2lkIDApIHtcbiAgICAgIHNjaGVtZSA9IGRlZmF1bHRzLmRlZmF1bHRQcm90b2NvbDtcbiAgICB9XG4gICAgLy8gQ2hlY2sgaWYgYWxyZWFkeSBoYXMgYSBwcmVmaXggc2NoZW1lXG4gICAgcmV0dXJuIHRoaXMuaGFzUHJvdG9jb2woKSA/IHRoaXMudiA6IGAke3NjaGVtZX06Ly8ke3RoaXMudn1gO1xuICB9LFxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciB0aGlzIFVSTCB0b2tlbiBoYXMgYSBwcm90b2NvbFxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaGFzUHJvdG9jb2woKSB7XG4gICAgY29uc3QgdG9rZW5zID0gdGhpcy50aztcbiAgICByZXR1cm4gdG9rZW5zLmxlbmd0aCA+PSAyICYmIHRva2Vuc1swXS50ICE9PSBMT0NBTEhPU1QgJiYgdG9rZW5zWzFdLnQgPT09IENPTE9OO1xuICB9XG59KTtcblxudmFyIG11bHRpID0gLyojX19QVVJFX18qL09iamVjdC5mcmVlemUoe1xuXHRfX3Byb3RvX186IG51bGwsXG5cdE11bHRpVG9rZW46IE11bHRpVG9rZW4sXG5cdEJhc2U6IE11bHRpVG9rZW4sXG5cdGNyZWF0ZVRva2VuQ2xhc3M6IGNyZWF0ZVRva2VuQ2xhc3MsXG5cdEVtYWlsOiBFbWFpbCxcblx0VGV4dDogVGV4dCxcblx0Tmw6IE5sLFxuXHRVcmw6IFVybFxufSk7XG5cbi8qKlxuXHROb3QgZXhhY3RseSBwYXJzZXIsIG1vcmUgbGlrZSB0aGUgc2Vjb25kLXN0YWdlIHNjYW5uZXIgKGFsdGhvdWdoIHdlIGNhblxuXHR0aGVvcmV0aWNhbGx5IGhvdHN3YXAgdGhlIGNvZGUgaGVyZSB3aXRoIGEgcmVhbCBwYXJzZXIgaW4gdGhlIGZ1dHVyZS4uLiBidXRcblx0Zm9yIGEgbGl0dGxlIFVSTC1maW5kaW5nIHV0aWxpdHkgYWJzdHJhY3Qgc3ludGF4IHRyZWVzIG1heSBiZSBhIGxpdHRsZVxuXHRvdmVya2lsbCkuXG5cblx0VVJMIGZvcm1hdDogaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9VUklfc2NoZW1lXG5cdEVtYWlsIGZvcm1hdDogaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9FbWFpbEFkZHJlc3MgKGxpbmtzIHRvIFJGQyBpblxuXHRyZWZlcmVuY2UpXG5cblx0QG1vZHVsZSBsaW5raWZ5XG5cdEBzdWJtb2R1bGUgcGFyc2VyXG5cdEBtYWluIHJ1blxuKi9cbmNvbnN0IG1ha2VTdGF0ZSA9IGFyZyA9PiBuZXcgU3RhdGUoYXJnKTtcblxuLyoqXG4gKiBHZW5lcmF0ZSB0aGUgcGFyc2VyIG11bHRpIHRva2VuLWJhc2VkIHN0YXRlIG1hY2hpbmVcbiAqIEBwYXJhbSB7eyBncm91cHM6IENvbGxlY3Rpb25zPHN0cmluZz4gfX0gdG9rZW5zXG4gKi9cbmZ1bmN0aW9uIGluaXQkMShfcmVmKSB7XG4gIGxldCB7XG4gICAgZ3JvdXBzXG4gIH0gPSBfcmVmO1xuICAvLyBUeXBlcyBvZiBjaGFyYWN0ZXJzIHRoZSBVUkwgY2FuIGRlZmluaXRlbHkgZW5kIGluXG4gIGNvbnN0IHFzQWNjZXB0aW5nID0gZ3JvdXBzLmRvbWFpbi5jb25jYXQoW0FNUEVSU0FORCwgQVNURVJJU0ssIEFULCBCQUNLU0xBU0gsIEJBQ0tUSUNLLCBDQVJFVCwgRE9MTEFSLCBFUVVBTFMsIEhZUEhFTiwgTlVNLCBQRVJDRU5ULCBQSVBFLCBQTFVTLCBQT1VORCwgU0xBU0gsIFNZTSwgVElMREUsIFVOREVSU0NPUkVdKTtcblxuICAvLyBUeXBlcyBvZiB0b2tlbnMgdGhhdCBjYW4gZm9sbG93IGEgVVJMIGFuZCBiZSBwYXJ0IG9mIHRoZSBxdWVyeSBzdHJpbmdcbiAgLy8gYnV0IGNhbm5vdCBiZSB0aGUgdmVyeSBsYXN0IGNoYXJhY3RlcnNcbiAgLy8gQ2hhcmFjdGVycyB0aGF0IGNhbm5vdCBhcHBlYXIgaW4gdGhlIFVSTCBhdCBhbGwgc2hvdWxkIGJlIGV4Y2x1ZGVkXG4gIGNvbnN0IHFzTm9uQWNjZXB0aW5nID0gW0FQT1NUUk9QSEUsIENMT1NFQU5HTEVCUkFDS0VULCBDTE9TRUJSQUNFLCBDTE9TRUJSQUNLRVQsIENMT1NFUEFSRU4sIENPTE9OLCBDT01NQSwgRE9ULCBFWENMQU1BVElPTiwgT1BFTkFOR0xFQlJBQ0tFVCwgT1BFTkJSQUNFLCBPUEVOQlJBQ0tFVCwgT1BFTlBBUkVOLCBRVUVSWSwgUVVPVEUsIFNFTUldO1xuXG4gIC8vIEZvciBhZGRyZXNzZXMgd2l0aG91dCB0aGUgbWFpbHRvIHByZWZpeFxuICAvLyBUb2tlbnMgYWxsb3dlZCBpbiB0aGUgbG9jYWxwYXJ0IG9mIHRoZSBlbWFpbFxuICBjb25zdCBsb2NhbHBhcnRBY2NlcHRpbmcgPSBbQU1QRVJTQU5ELCBBUE9TVFJPUEhFLCBBU1RFUklTSywgQkFDS1NMQVNILCBCQUNLVElDSywgQ0FSRVQsIENMT1NFQlJBQ0UsIERPTExBUiwgRVFVQUxTLCBIWVBIRU4sIE9QRU5CUkFDRSwgUEVSQ0VOVCwgUElQRSwgUExVUywgUE9VTkQsIFFVRVJZLCBTTEFTSCwgU1lNLCBUSUxERSwgVU5ERVJTQ09SRV07XG5cbiAgLy8gVGhlIHVuaXZlcnNhbCBzdGFydGluZyBzdGF0ZS5cbiAgLyoqXG4gICAqIEB0eXBlIFN0YXRlPFRva2VuPlxuICAgKi9cbiAgY29uc3QgU3RhcnQgPSBtYWtlU3RhdGUoKTtcbiAgY29uc3QgTG9jYWxwYXJ0ID0gdHQoU3RhcnQsIFRJTERFKTsgLy8gTG9jYWwgcGFydCBvZiB0aGUgZW1haWwgYWRkcmVzc1xuICB0YShMb2NhbHBhcnQsIGxvY2FscGFydEFjY2VwdGluZywgTG9jYWxwYXJ0KTtcbiAgdGEoTG9jYWxwYXJ0LCBncm91cHMuZG9tYWluLCBMb2NhbHBhcnQpO1xuICBjb25zdCBEb21haW4gPSBtYWtlU3RhdGUoKSxcbiAgICBTY2hlbWUgPSBtYWtlU3RhdGUoKSxcbiAgICBTbGFzaFNjaGVtZSA9IG1ha2VTdGF0ZSgpO1xuICB0YShTdGFydCwgZ3JvdXBzLmRvbWFpbiwgRG9tYWluKTsgLy8gcGFyc2VkIHN0cmluZyBlbmRzIHdpdGggYSBwb3RlbnRpYWwgZG9tYWluIG5hbWUgKEEpXG4gIHRhKFN0YXJ0LCBncm91cHMuc2NoZW1lLCBTY2hlbWUpOyAvLyBlLmcuLCAnbWFpbHRvJ1xuICB0YShTdGFydCwgZ3JvdXBzLnNsYXNoc2NoZW1lLCBTbGFzaFNjaGVtZSk7IC8vIGUuZy4sICdodHRwJ1xuXG4gIHRhKERvbWFpbiwgbG9jYWxwYXJ0QWNjZXB0aW5nLCBMb2NhbHBhcnQpO1xuICB0YShEb21haW4sIGdyb3Vwcy5kb21haW4sIERvbWFpbik7XG4gIGNvbnN0IExvY2FscGFydEF0ID0gdHQoRG9tYWluLCBBVCk7IC8vIExvY2FsIHBhcnQgb2YgdGhlIGVtYWlsIGFkZHJlc3MgcGx1cyBAXG5cbiAgdHQoTG9jYWxwYXJ0LCBBVCwgTG9jYWxwYXJ0QXQpOyAvLyBjbG9zZSB0byBhbiBlbWFpbCBhZGRyZXNzIG5vd1xuXG4gIC8vIExvY2FsIHBhcnQgb2YgYW4gZW1haWwgYWRkcmVzcyBjYW4gYmUgZS5nLiAnaHR0cCcgb3IgJ21haWx0bydcbiAgdHQoU2NoZW1lLCBBVCwgTG9jYWxwYXJ0QXQpO1xuICB0dChTbGFzaFNjaGVtZSwgQVQsIExvY2FscGFydEF0KTtcbiAgY29uc3QgTG9jYWxwYXJ0RG90ID0gdHQoTG9jYWxwYXJ0LCBET1QpOyAvLyBMb2NhbCBwYXJ0IG9mIHRoZSBlbWFpbCBhZGRyZXNzIHBsdXMgJy4nIChsb2NhbHBhcnQgY2Fubm90IGVuZCBpbiAuKVxuICB0YShMb2NhbHBhcnREb3QsIGxvY2FscGFydEFjY2VwdGluZywgTG9jYWxwYXJ0KTtcbiAgdGEoTG9jYWxwYXJ0RG90LCBncm91cHMuZG9tYWluLCBMb2NhbHBhcnQpO1xuICBjb25zdCBFbWFpbERvbWFpbiA9IG1ha2VTdGF0ZSgpO1xuICB0YShMb2NhbHBhcnRBdCwgZ3JvdXBzLmRvbWFpbiwgRW1haWxEb21haW4pOyAvLyBwYXJzZWQgc3RyaW5nIHN0YXJ0cyB3aXRoIGxvY2FsIGVtYWlsIGluZm8gKyBAIHdpdGggYSBwb3RlbnRpYWwgZG9tYWluIG5hbWVcbiAgdGEoRW1haWxEb21haW4sIGdyb3Vwcy5kb21haW4sIEVtYWlsRG9tYWluKTtcbiAgY29uc3QgRW1haWxEb21haW5Eb3QgPSB0dChFbWFpbERvbWFpbiwgRE9UKTsgLy8gZG9tYWluIGZvbGxvd2VkIGJ5IERPVFxuICB0YShFbWFpbERvbWFpbkRvdCwgZ3JvdXBzLmRvbWFpbiwgRW1haWxEb21haW4pO1xuICBjb25zdCBFbWFpbCQxID0gbWFrZVN0YXRlKEVtYWlsKTsgLy8gUG9zc2libGUgZW1haWwgYWRkcmVzcyAoY291bGQgaGF2ZSBtb3JlIHRsZHMpXG4gIHRhKEVtYWlsRG9tYWluRG90LCBncm91cHMudGxkLCBFbWFpbCQxKTtcbiAgdGEoRW1haWxEb21haW5Eb3QsIGdyb3Vwcy51dGxkLCBFbWFpbCQxKTtcbiAgdHQoTG9jYWxwYXJ0QXQsIExPQ0FMSE9TVCwgRW1haWwkMSk7XG5cbiAgLy8gSHlwaGVuIGNhbiBqdW1wIGJhY2sgdG8gYSBkb21haW4gbmFtZVxuICBjb25zdCBFbWFpbERvbWFpbkh5cGhlbiA9IHR0KEVtYWlsRG9tYWluLCBIWVBIRU4pOyAvLyBwYXJzZWQgc3RyaW5nIHN0YXJ0cyB3aXRoIGxvY2FsIGVtYWlsIGluZm8gKyBAIHdpdGggYSBwb3RlbnRpYWwgZG9tYWluIG5hbWVcbiAgdGEoRW1haWxEb21haW5IeXBoZW4sIGdyb3Vwcy5kb21haW4sIEVtYWlsRG9tYWluKTtcbiAgdGEoRW1haWwkMSwgZ3JvdXBzLmRvbWFpbiwgRW1haWxEb21haW4pO1xuICB0dChFbWFpbCQxLCBET1QsIEVtYWlsRG9tYWluRG90KTtcbiAgdHQoRW1haWwkMSwgSFlQSEVOLCBFbWFpbERvbWFpbkh5cGhlbik7XG5cbiAgLy8gRmluYWwgcG9zc2libGUgZW1haWwgc3RhdGVzXG4gIGNvbnN0IEVtYWlsQ29sb24gPSB0dChFbWFpbCQxLCBDT0xPTik7IC8vIFVSTCBmb2xsb3dlZCBieSBjb2xvbiAocG90ZW50aWFsIHBvcnQgbnVtYmVyIGhlcmUpXG4gIC8qY29uc3QgRW1haWxDb2xvblBvcnQgPSAqL1xuICB0YShFbWFpbENvbG9uLCBncm91cHMubnVtZXJpYywgRW1haWwpOyAvLyBVUkwgZm9sbG93ZWQgYnkgY29sb24gYW5kIHBvcnQgbnVtbmVyXG5cbiAgLy8gQWNjb3VudCBmb3IgZG90cyBhbmQgaHlwaGVucy4gSHlwaGVucyBhcmUgdXN1YWxseSBwYXJ0cyBvZiBkb21haW4gbmFtZXNcbiAgLy8gKGJ1dCBub3QgVExEcylcbiAgY29uc3QgRG9tYWluSHlwaGVuID0gdHQoRG9tYWluLCBIWVBIRU4pOyAvLyBkb21haW4gZm9sbG93ZWQgYnkgaHlwaGVuXG4gIGNvbnN0IERvbWFpbkRvdCA9IHR0KERvbWFpbiwgRE9UKTsgLy8gZG9tYWluIGZvbGxvd2VkIGJ5IERPVFxuICB0YShEb21haW5IeXBoZW4sIGdyb3Vwcy5kb21haW4sIERvbWFpbik7XG4gIHRhKERvbWFpbkRvdCwgbG9jYWxwYXJ0QWNjZXB0aW5nLCBMb2NhbHBhcnQpO1xuICB0YShEb21haW5Eb3QsIGdyb3Vwcy5kb21haW4sIERvbWFpbik7XG4gIGNvbnN0IERvbWFpbkRvdFRsZCA9IG1ha2VTdGF0ZShVcmwpOyAvLyBTaW1wbGVzdCBwb3NzaWJsZSBVUkwgd2l0aCBubyBxdWVyeSBzdHJpbmdcbiAgdGEoRG9tYWluRG90LCBncm91cHMudGxkLCBEb21haW5Eb3RUbGQpO1xuICB0YShEb21haW5Eb3QsIGdyb3Vwcy51dGxkLCBEb21haW5Eb3RUbGQpO1xuICB0YShEb21haW5Eb3RUbGQsIGdyb3Vwcy5kb21haW4sIERvbWFpbik7XG4gIHRhKERvbWFpbkRvdFRsZCwgbG9jYWxwYXJ0QWNjZXB0aW5nLCBMb2NhbHBhcnQpO1xuICB0dChEb21haW5Eb3RUbGQsIERPVCwgRG9tYWluRG90KTtcbiAgdHQoRG9tYWluRG90VGxkLCBIWVBIRU4sIERvbWFpbkh5cGhlbik7XG4gIHR0KERvbWFpbkRvdFRsZCwgQVQsIExvY2FscGFydEF0KTtcbiAgY29uc3QgRG9tYWluRG90VGxkQ29sb24gPSB0dChEb21haW5Eb3RUbGQsIENPTE9OKTsgLy8gVVJMIGZvbGxvd2VkIGJ5IGNvbG9uIChwb3RlbnRpYWwgcG9ydCBudW1iZXIgaGVyZSlcbiAgY29uc3QgRG9tYWluRG90VGxkQ29sb25Qb3J0ID0gbWFrZVN0YXRlKFVybCk7IC8vIFRMRCBmb2xsb3dlZCBieSBhIHBvcnQgbnVtYmVyXG4gIHRhKERvbWFpbkRvdFRsZENvbG9uLCBncm91cHMubnVtZXJpYywgRG9tYWluRG90VGxkQ29sb25Qb3J0KTtcblxuICAvLyBMb25nIFVSTCB3aXRoIG9wdGlvbmFsIHBvcnQgYW5kIG1heWJlIHF1ZXJ5IHN0cmluZ1xuICBjb25zdCBVcmwkMSA9IG1ha2VTdGF0ZShVcmwpO1xuXG4gIC8vIFVSTCB3aXRoIGV4dHJhIHN5bWJvbHMgYXQgdGhlIGVuZCwgZm9sbG93ZWQgYnkgYW4gb3BlbmluZyBicmFja2V0XG4gIGNvbnN0IFVybE5vbmFjY2VwdCA9IG1ha2VTdGF0ZSgpOyAvLyBVUkwgZm9sbG93ZWQgYnkgc29tZSBzeW1ib2xzICh3aWxsIG5vdCBiZSBwYXJ0IG9mIHRoZSBmaW5hbCBVUkwpXG5cbiAgLy8gUXVlcnkgc3RyaW5nc1xuICB0YShVcmwkMSwgcXNBY2NlcHRpbmcsIFVybCQxKTtcbiAgdGEoVXJsJDEsIHFzTm9uQWNjZXB0aW5nLCBVcmxOb25hY2NlcHQpO1xuICB0YShVcmxOb25hY2NlcHQsIHFzQWNjZXB0aW5nLCBVcmwkMSk7XG4gIHRhKFVybE5vbmFjY2VwdCwgcXNOb25BY2NlcHRpbmcsIFVybE5vbmFjY2VwdCk7XG5cbiAgLy8gQmVjb21lIHJlYWwgVVJMcyBhZnRlciBgU0xBU0hgIG9yIGBDT0xPTiBOVU0gU0xBU0hgXG4gIC8vIEhlcmUgd29ya3Mgd2l0aCBvciB3aXRob3V0IHNjaGVtZTovLyBwcmVmaXhcbiAgdHQoRG9tYWluRG90VGxkLCBTTEFTSCwgVXJsJDEpO1xuICB0dChEb21haW5Eb3RUbGRDb2xvblBvcnQsIFNMQVNILCBVcmwkMSk7XG5cbiAgLy8gTm90ZSB0aGF0IGRvbWFpbnMgdGhhdCBiZWdpbiB3aXRoIHNjaGVtZXMgYXJlIHRyZWF0ZWQgc2xpZ2hseSBkaWZmZXJlbnRseVxuICBjb25zdCBTY2hlbWVDb2xvbiA9IHR0KFNjaGVtZSwgQ09MT04pOyAvLyBlLmcuLCAnbWFpbHRvOidcbiAgY29uc3QgU2xhc2hTY2hlbWVDb2xvbiA9IHR0KFNsYXNoU2NoZW1lLCBDT0xPTik7IC8vIGUuZy4sICdodHRwOidcbiAgY29uc3QgU2xhc2hTY2hlbWVDb2xvblNsYXNoID0gdHQoU2xhc2hTY2hlbWVDb2xvbiwgU0xBU0gpOyAvLyBlLmcuLCAnaHR0cDovJ1xuXG4gIGNvbnN0IFVyaVByZWZpeCA9IHR0KFNsYXNoU2NoZW1lQ29sb25TbGFzaCwgU0xBU0gpOyAvLyBlLmcuLCAnaHR0cDovLydcblxuICAvLyBTY2hlbWUgc3RhdGVzIGNhbiB0cmFuc2l0aW9uIHRvIGRvbWFpbiBzdGF0ZXNcbiAgdGEoU2NoZW1lLCBncm91cHMuZG9tYWluLCBEb21haW4pO1xuICB0dChTY2hlbWUsIERPVCwgRG9tYWluRG90KTtcbiAgdHQoU2NoZW1lLCBIWVBIRU4sIERvbWFpbkh5cGhlbik7XG4gIHRhKFNsYXNoU2NoZW1lLCBncm91cHMuZG9tYWluLCBEb21haW4pO1xuICB0dChTbGFzaFNjaGVtZSwgRE9ULCBEb21haW5Eb3QpO1xuICB0dChTbGFzaFNjaGVtZSwgSFlQSEVOLCBEb21haW5IeXBoZW4pO1xuXG4gIC8vIEZvcmNlIFVSTCB3aXRoIHNjaGVtZSBwcmVmaXggZm9sbG93ZWQgYnkgYW55dGhpbmcgc2FuZVxuICB0YShTY2hlbWVDb2xvbiwgZ3JvdXBzLmRvbWFpbiwgVXJsJDEpO1xuICB0dChTY2hlbWVDb2xvbiwgU0xBU0gsIFVybCQxKTtcbiAgdGEoVXJpUHJlZml4LCBncm91cHMuZG9tYWluLCBVcmwkMSk7XG4gIHRhKFVyaVByZWZpeCwgcXNBY2NlcHRpbmcsIFVybCQxKTtcbiAgdHQoVXJpUHJlZml4LCBTTEFTSCwgVXJsJDEpO1xuXG4gIC8vIFVSTCwgZm9sbG93ZWQgYnkgYW4gb3BlbmluZyBicmFja2V0XG4gIGNvbnN0IFVybE9wZW5icmFjZSA9IHR0KFVybCQxLCBPUEVOQlJBQ0UpOyAvLyBVUkwgZm9sbG93ZWQgYnkge1xuICBjb25zdCBVcmxPcGVuYnJhY2tldCA9IHR0KFVybCQxLCBPUEVOQlJBQ0tFVCk7IC8vIFVSTCBmb2xsb3dlZCBieSBbXG4gIGNvbnN0IFVybE9wZW5hbmdsZWJyYWNrZXQgPSB0dChVcmwkMSwgT1BFTkFOR0xFQlJBQ0tFVCk7IC8vIFVSTCBmb2xsb3dlZCBieSA8XG4gIGNvbnN0IFVybE9wZW5wYXJlbiA9IHR0KFVybCQxLCBPUEVOUEFSRU4pOyAvLyBVUkwgZm9sbG93ZWQgYnkgKFxuXG4gIHR0KFVybE5vbmFjY2VwdCwgT1BFTkJSQUNFLCBVcmxPcGVuYnJhY2UpO1xuICB0dChVcmxOb25hY2NlcHQsIE9QRU5CUkFDS0VULCBVcmxPcGVuYnJhY2tldCk7XG4gIHR0KFVybE5vbmFjY2VwdCwgT1BFTkFOR0xFQlJBQ0tFVCwgVXJsT3BlbmFuZ2xlYnJhY2tldCk7XG4gIHR0KFVybE5vbmFjY2VwdCwgT1BFTlBBUkVOLCBVcmxPcGVucGFyZW4pO1xuXG4gIC8vIENsb3NpbmcgYnJhY2tldCBjb21wb25lbnQuIFRoaXMgY2hhcmFjdGVyIFdJTEwgYmUgaW5jbHVkZWQgaW4gdGhlIFVSTFxuICB0dChVcmxPcGVuYnJhY2UsIENMT1NFQlJBQ0UsIFVybCQxKTtcbiAgdHQoVXJsT3BlbmJyYWNrZXQsIENMT1NFQlJBQ0tFVCwgVXJsJDEpO1xuICB0dChVcmxPcGVuYW5nbGVicmFja2V0LCBDTE9TRUFOR0xFQlJBQ0tFVCwgVXJsJDEpO1xuICB0dChVcmxPcGVucGFyZW4sIENMT1NFUEFSRU4sIFVybCQxKTtcbiAgdHQoVXJsT3BlbmJyYWNlLCBDTE9TRUJSQUNFLCBVcmwkMSk7XG5cbiAgLy8gVVJMIHRoYXQgYmVpbmdzIHdpdGggYW4gb3BlbmluZyBicmFja2V0LCBmb2xsb3dlZCBieSBhIHN5bWJvbHMuXG4gIC8vIE5vdGUgdGhhdCB0aGUgZmluYWwgc3RhdGUgY2FuIHN0aWxsIGJlIGBVcmxPcGVuYnJhY2VgIChpZiB0aGUgVVJMIG9ubHlcbiAgLy8gaGFzIGEgc2luZ2xlIG9wZW5pbmcgYnJhY2tldCBmb3Igc29tZSByZWFzb24pLlxuICBjb25zdCBVcmxPcGVuYnJhY2VRID0gbWFrZVN0YXRlKFVybCk7IC8vIFVSTCBmb2xsb3dlZCBieSB7IGFuZCBzb21lIHN5bWJvbHMgdGhhdCB0aGUgVVJMIGNhbiBlbmQgaXRcbiAgY29uc3QgVXJsT3BlbmJyYWNrZXRRID0gbWFrZVN0YXRlKFVybCk7IC8vIFVSTCBmb2xsb3dlZCBieSBbIGFuZCBzb21lIHN5bWJvbHMgdGhhdCB0aGUgVVJMIGNhbiBlbmQgaXRcbiAgY29uc3QgVXJsT3BlbmFuZ2xlYnJhY2tldFEgPSBtYWtlU3RhdGUoVXJsKTsgLy8gVVJMIGZvbGxvd2VkIGJ5IDwgYW5kIHNvbWUgc3ltYm9scyB0aGF0IHRoZSBVUkwgY2FuIGVuZCBpdFxuICBjb25zdCBVcmxPcGVucGFyZW5RID0gbWFrZVN0YXRlKFVybCk7IC8vIFVSTCBmb2xsb3dlZCBieSAoIGFuZCBzb21lIHN5bWJvbHMgdGhhdCB0aGUgVVJMIGNhbiBlbmQgaXRcbiAgdGEoVXJsT3BlbmJyYWNlLCBxc0FjY2VwdGluZywgVXJsT3BlbmJyYWNlUSk7XG4gIHRhKFVybE9wZW5icmFja2V0LCBxc0FjY2VwdGluZywgVXJsT3BlbmJyYWNrZXRRKTtcbiAgdGEoVXJsT3BlbmFuZ2xlYnJhY2tldCwgcXNBY2NlcHRpbmcsIFVybE9wZW5hbmdsZWJyYWNrZXRRKTtcbiAgdGEoVXJsT3BlbnBhcmVuLCBxc0FjY2VwdGluZywgVXJsT3BlbnBhcmVuUSk7XG4gIGNvbnN0IFVybE9wZW5icmFjZVN5bXMgPSBtYWtlU3RhdGUoKTsgLy8gVXJsT3BlbmJyYWNlIGZvbGxvd2VkIGJ5IHNvbWUgc3ltYm9scyBpdCBjYW5ub3QgZW5kIGl0XG4gIGNvbnN0IFVybE9wZW5icmFja2V0U3ltcyA9IG1ha2VTdGF0ZSgpOyAvLyBVcmxPcGVuYnJhY2tldFEgZm9sbG93ZWQgYnkgc29tZSBzeW1ib2xzIGl0IGNhbm5vdCBlbmQgaXRcbiAgY29uc3QgVXJsT3BlbmFuZ2xlYnJhY2tldFN5bXMgPSBtYWtlU3RhdGUoKTsgLy8gVXJsT3BlbmFuZ2xlYnJhY2tldFEgZm9sbG93ZWQgYnkgc29tZSBzeW1ib2xzIGl0IGNhbm5vdCBlbmQgaXRcbiAgY29uc3QgVXJsT3BlbnBhcmVuU3ltcyA9IG1ha2VTdGF0ZSgpOyAvLyBVcmxPcGVucGFyZW5RIGZvbGxvd2VkIGJ5IHNvbWUgc3ltYm9scyBpdCBjYW5ub3QgZW5kIGl0XG4gIHRhKFVybE9wZW5icmFjZSwgcXNOb25BY2NlcHRpbmcpO1xuICB0YShVcmxPcGVuYnJhY2tldCwgcXNOb25BY2NlcHRpbmcpO1xuICB0YShVcmxPcGVuYW5nbGVicmFja2V0LCBxc05vbkFjY2VwdGluZyk7XG4gIHRhKFVybE9wZW5wYXJlbiwgcXNOb25BY2NlcHRpbmcpO1xuXG4gIC8vIFVSTCB0aGF0IGJlZ2lucyB3aXRoIGFuIG9wZW5pbmcgYnJhY2tldCwgZm9sbG93ZWQgYnkgc29tZSBzeW1ib2xzXG4gIHRhKFVybE9wZW5icmFjZVEsIHFzQWNjZXB0aW5nLCBVcmxPcGVuYnJhY2VRKTtcbiAgdGEoVXJsT3BlbmJyYWNrZXRRLCBxc0FjY2VwdGluZywgVXJsT3BlbmJyYWNrZXRRKTtcbiAgdGEoVXJsT3BlbmFuZ2xlYnJhY2tldFEsIHFzQWNjZXB0aW5nLCBVcmxPcGVuYW5nbGVicmFja2V0USk7XG4gIHRhKFVybE9wZW5wYXJlblEsIHFzQWNjZXB0aW5nLCBVcmxPcGVucGFyZW5RKTtcbiAgdGEoVXJsT3BlbmJyYWNlUSwgcXNOb25BY2NlcHRpbmcsIFVybE9wZW5icmFjZVEpO1xuICB0YShVcmxPcGVuYnJhY2tldFEsIHFzTm9uQWNjZXB0aW5nLCBVcmxPcGVuYnJhY2tldFEpO1xuICB0YShVcmxPcGVuYW5nbGVicmFja2V0USwgcXNOb25BY2NlcHRpbmcsIFVybE9wZW5hbmdsZWJyYWNrZXRRKTtcbiAgdGEoVXJsT3BlbnBhcmVuUSwgcXNOb25BY2NlcHRpbmcsIFVybE9wZW5wYXJlblEpO1xuICB0YShVcmxPcGVuYnJhY2VTeW1zLCBxc0FjY2VwdGluZywgVXJsT3BlbmJyYWNlU3ltcyk7XG4gIHRhKFVybE9wZW5icmFja2V0U3ltcywgcXNBY2NlcHRpbmcsIFVybE9wZW5icmFja2V0USk7XG4gIHRhKFVybE9wZW5hbmdsZWJyYWNrZXRTeW1zLCBxc0FjY2VwdGluZywgVXJsT3BlbmFuZ2xlYnJhY2tldFEpO1xuICB0YShVcmxPcGVucGFyZW5TeW1zLCBxc0FjY2VwdGluZywgVXJsT3BlbnBhcmVuUSk7XG4gIHRhKFVybE9wZW5icmFjZVN5bXMsIHFzTm9uQWNjZXB0aW5nLCBVcmxPcGVuYnJhY2VTeW1zKTtcbiAgdGEoVXJsT3BlbmJyYWNrZXRTeW1zLCBxc05vbkFjY2VwdGluZywgVXJsT3BlbmJyYWNrZXRTeW1zKTtcbiAgdGEoVXJsT3BlbmFuZ2xlYnJhY2tldFN5bXMsIHFzTm9uQWNjZXB0aW5nLCBVcmxPcGVuYW5nbGVicmFja2V0U3ltcyk7XG4gIHRhKFVybE9wZW5wYXJlblN5bXMsIHFzTm9uQWNjZXB0aW5nLCBVcmxPcGVucGFyZW5TeW1zKTtcblxuICAvLyBDbG9zZSBicmFjZS9icmFja2V0IHRvIGJlY29tZSByZWd1bGFyIFVSTFxuICB0dChVcmxPcGVuYnJhY2tldFEsIENMT1NFQlJBQ0tFVCwgVXJsJDEpO1xuICB0dChVcmxPcGVuYW5nbGVicmFja2V0USwgQ0xPU0VBTkdMRUJSQUNLRVQsIFVybCQxKTtcbiAgdHQoVXJsT3BlbnBhcmVuUSwgQ0xPU0VQQVJFTiwgVXJsJDEpO1xuICB0dChVcmxPcGVuYnJhY2VRLCBDTE9TRUJSQUNFLCBVcmwkMSk7XG4gIHR0KFVybE9wZW5icmFja2V0U3ltcywgQ0xPU0VCUkFDS0VULCBVcmwkMSk7XG4gIHR0KFVybE9wZW5hbmdsZWJyYWNrZXRTeW1zLCBDTE9TRUFOR0xFQlJBQ0tFVCwgVXJsJDEpO1xuICB0dChVcmxPcGVucGFyZW5TeW1zLCBDTE9TRVBBUkVOLCBVcmwkMSk7XG4gIHR0KFVybE9wZW5icmFjZVN5bXMsIENMT1NFUEFSRU4sIFVybCQxKTtcbiAgdHQoU3RhcnQsIExPQ0FMSE9TVCwgRG9tYWluRG90VGxkKTsgLy8gbG9jYWxob3N0IGlzIGEgdmFsaWQgVVJMIHN0YXRlXG4gIHR0KFN0YXJ0LCBOTCQxLCBObCk7IC8vIHNpbmdsZSBuZXcgbGluZVxuXG4gIHJldHVybiB7XG4gICAgc3RhcnQ6IFN0YXJ0LFxuICAgIHRva2VuczogdGtcbiAgfTtcbn1cblxuLyoqXG4gKiBSdW4gdGhlIHBhcnNlciBzdGF0ZSBtYWNoaW5lIG9uIGEgbGlzdCBvZiBzY2FubmVkIHN0cmluZy1iYXNlZCB0b2tlbnMgdG9cbiAqIGNyZWF0ZSBhIGxpc3Qgb2YgbXVsdGkgdG9rZW5zLCBlYWNoIG9mIHdoaWNoIHJlcHJlc2VudHMgYSBVUkwsIGVtYWlsIGFkZHJlc3MsXG4gKiBwbGFpbiB0ZXh0LCBldGMuXG4gKlxuICogQHBhcmFtIHtTdGF0ZTxNdWx0aVRva2VuPn0gc3RhcnQgcGFyc2VyIHN0YXJ0IHN0YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5wdXQgdGhlIG9yaWdpbmFsIGlucHV0IHVzZWQgdG8gZ2VuZXJhdGUgdGhlIGdpdmVuIHRva2Vuc1xuICogQHBhcmFtIHtUb2tlbltdfSB0b2tlbnMgbGlzdCBvZiBzY2FubmVkIHRva2Vuc1xuICogQHJldHVybnMge011bHRpVG9rZW5bXX1cbiAqL1xuZnVuY3Rpb24gcnVuKHN0YXJ0LCBpbnB1dCwgdG9rZW5zKSB7XG4gIGxldCBsZW4gPSB0b2tlbnMubGVuZ3RoO1xuICBsZXQgY3Vyc29yID0gMDtcbiAgbGV0IG11bHRpcyA9IFtdO1xuICBsZXQgdGV4dFRva2VucyA9IFtdO1xuICB3aGlsZSAoY3Vyc29yIDwgbGVuKSB7XG4gICAgbGV0IHN0YXRlID0gc3RhcnQ7XG4gICAgbGV0IHNlY29uZFN0YXRlID0gbnVsbDtcbiAgICBsZXQgbmV4dFN0YXRlID0gbnVsbDtcbiAgICBsZXQgbXVsdGlMZW5ndGggPSAwO1xuICAgIGxldCBsYXRlc3RBY2NlcHRpbmcgPSBudWxsO1xuICAgIGxldCBzaW5jZUFjY2VwdHMgPSAtMTtcbiAgICB3aGlsZSAoY3Vyc29yIDwgbGVuICYmICEoc2Vjb25kU3RhdGUgPSBzdGF0ZS5nbyh0b2tlbnNbY3Vyc29yXS50KSkpIHtcbiAgICAgIC8vIFN0YXJ0aW5nIHRva2VucyB3aXRoIG5vd2hlcmUgdG8ganVtcCB0by5cbiAgICAgIC8vIENvbnNpZGVyIHRoZXNlIHRvIGJlIGp1c3QgcGxhaW4gdGV4dFxuICAgICAgdGV4dFRva2Vucy5wdXNoKHRva2Vuc1tjdXJzb3IrK10pO1xuICAgIH1cbiAgICB3aGlsZSAoY3Vyc29yIDwgbGVuICYmIChuZXh0U3RhdGUgPSBzZWNvbmRTdGF0ZSB8fCBzdGF0ZS5nbyh0b2tlbnNbY3Vyc29yXS50KSkpIHtcbiAgICAgIC8vIEdldCB0aGUgbmV4dCBzdGF0ZVxuICAgICAgc2Vjb25kU3RhdGUgPSBudWxsO1xuICAgICAgc3RhdGUgPSBuZXh0U3RhdGU7XG5cbiAgICAgIC8vIEtlZXAgdHJhY2sgb2YgdGhlIGxhdGVzdCBhY2NlcHRpbmcgc3RhdGVcbiAgICAgIGlmIChzdGF0ZS5hY2NlcHRzKCkpIHtcbiAgICAgICAgc2luY2VBY2NlcHRzID0gMDtcbiAgICAgICAgbGF0ZXN0QWNjZXB0aW5nID0gc3RhdGU7XG4gICAgICB9IGVsc2UgaWYgKHNpbmNlQWNjZXB0cyA+PSAwKSB7XG4gICAgICAgIHNpbmNlQWNjZXB0cysrO1xuICAgICAgfVxuICAgICAgY3Vyc29yKys7XG4gICAgICBtdWx0aUxlbmd0aCsrO1xuICAgIH1cbiAgICBpZiAoc2luY2VBY2NlcHRzIDwgMCkge1xuICAgICAgLy8gTm8gYWNjZXB0aW5nIHN0YXRlIHdhcyBmb3VuZCwgcGFydCBvZiBhIHJlZ3VsYXIgdGV4dCB0b2tlbiBhZGRcbiAgICAgIC8vIHRoZSBmaXJzdCB0ZXh0IHRva2VuIHRvIHRoZSB0ZXh0IHRva2VucyBhcnJheSBhbmQgdHJ5IGFnYWluIGZyb21cbiAgICAgIC8vIHRoZSBuZXh0XG4gICAgICBjdXJzb3IgLT0gbXVsdGlMZW5ndGg7XG4gICAgICBpZiAoY3Vyc29yIDwgbGVuKSB7XG4gICAgICAgIHRleHRUb2tlbnMucHVzaCh0b2tlbnNbY3Vyc29yXSk7XG4gICAgICAgIGN1cnNvcisrO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBBY2NlcHRpbmcgc3RhdGUhXG4gICAgICAvLyBGaXJzdCBjbG9zZSBvZmYgdGhlIHRleHRUb2tlbnMgKGlmIGF2YWlsYWJsZSlcbiAgICAgIGlmICh0ZXh0VG9rZW5zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgbXVsdGlzLnB1c2goaW5pdE11bHRpVG9rZW4oVGV4dCwgaW5wdXQsIHRleHRUb2tlbnMpKTtcbiAgICAgICAgdGV4dFRva2VucyA9IFtdO1xuICAgICAgfVxuXG4gICAgICAvLyBSb2xsIGJhY2sgdG8gdGhlIGxhdGVzdCBhY2NlcHRpbmcgc3RhdGVcbiAgICAgIGN1cnNvciAtPSBzaW5jZUFjY2VwdHM7XG4gICAgICBtdWx0aUxlbmd0aCAtPSBzaW5jZUFjY2VwdHM7XG5cbiAgICAgIC8vIENyZWF0ZSBhIG5ldyBtdWx0aXRva2VuXG4gICAgICBjb25zdCBNdWx0aSA9IGxhdGVzdEFjY2VwdGluZy50O1xuICAgICAgY29uc3Qgc3VidG9rZW5zID0gdG9rZW5zLnNsaWNlKGN1cnNvciAtIG11bHRpTGVuZ3RoLCBjdXJzb3IpO1xuICAgICAgbXVsdGlzLnB1c2goaW5pdE11bHRpVG9rZW4oTXVsdGksIGlucHV0LCBzdWJ0b2tlbnMpKTtcbiAgICB9XG4gIH1cblxuICAvLyBGaW5hbGx5IGNsb3NlIG9mZiB0aGUgdGV4dFRva2VucyAoaWYgYXZhaWxhYmxlKVxuICBpZiAodGV4dFRva2Vucy5sZW5ndGggPiAwKSB7XG4gICAgbXVsdGlzLnB1c2goaW5pdE11bHRpVG9rZW4oVGV4dCwgaW5wdXQsIHRleHRUb2tlbnMpKTtcbiAgfVxuICByZXR1cm4gbXVsdGlzO1xufVxuXG4vKipcbiAqIFV0aWxpdHkgZnVuY3Rpb24gZm9yIGluc3RhbnRpYXRpbmcgYSBuZXcgbXVsdGl0b2tlbiB3aXRoIGFsbCB0aGUgcmVsZXZhbnRcbiAqIGZpZWxkcyBkdXJpbmcgcGFyc2luZy5cbiAqIEBwYXJhbSB7bmV3ICh2YWx1ZTogc3RyaW5nLCB0b2tlbnM6IFRva2VuW10pID0+IE11bHRpVG9rZW59IE11bHRpIGNsYXNzIHRvIGluc3RhbnRpYXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5wdXQgb3JpZ2luYWwgaW5wdXQgc3RyaW5nXG4gKiBAcGFyYW0ge1Rva2VuW119IHRva2VucyBjb25zZWN1dGl2ZSB0b2tlbnMgc2Nhbm5lZCBmcm9tIGlucHV0IHN0cmluZ1xuICogQHJldHVybnMge011bHRpVG9rZW59XG4gKi9cbmZ1bmN0aW9uIGluaXRNdWx0aVRva2VuKE11bHRpLCBpbnB1dCwgdG9rZW5zKSB7XG4gIGNvbnN0IHN0YXJ0SWR4ID0gdG9rZW5zWzBdLnM7XG4gIGNvbnN0IGVuZElkeCA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV0uZTtcbiAgY29uc3QgdmFsdWUgPSBpbnB1dC5zbGljZShzdGFydElkeCwgZW5kSWR4KTtcbiAgcmV0dXJuIG5ldyBNdWx0aSh2YWx1ZSwgdG9rZW5zKTtcbn1cblxuY29uc3Qgd2FybiA9IHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiBjb25zb2xlICYmIGNvbnNvbGUud2FybiB8fCAoKCkgPT4ge30pO1xuY29uc3Qgd2FybkFkdmljZSA9ICd1bnRpbCBtYW51YWwgY2FsbCBvZiBsaW5raWZ5LmluaXQoKS4gUmVnaXN0ZXIgYWxsIHNjaGVtZXMgYW5kIHBsdWdpbnMgYmVmb3JlIGludm9raW5nIGxpbmtpZnkgdGhlIGZpcnN0IHRpbWUuJztcblxuLy8gU2lkZS1lZmZlY3QgaW5pdGlhbGl6YXRpb24gc3RhdGVcbmNvbnN0IElOSVQgPSB7XG4gIHNjYW5uZXI6IG51bGwsXG4gIHBhcnNlcjogbnVsbCxcbiAgdG9rZW5RdWV1ZTogW10sXG4gIHBsdWdpblF1ZXVlOiBbXSxcbiAgY3VzdG9tU2NoZW1lczogW10sXG4gIGluaXRpYWxpemVkOiBmYWxzZVxufTtcblxuLyoqXG4gKiBAdHlwZWRlZiB7e1xuICogXHRzdGFydDogU3RhdGU8c3RyaW5nPixcbiAqIFx0dG9rZW5zOiB7IGdyb3VwczogQ29sbGVjdGlvbnM8c3RyaW5nPiB9ICYgdHlwZW9mIHRrXG4gKiB9fSBTY2FubmVySW5pdFxuICovXG5cbi8qKlxuICogQHR5cGVkZWYge3tcbiAqIFx0c3RhcnQ6IFN0YXRlPE11bHRpVG9rZW4+LFxuICogXHR0b2tlbnM6IHR5cGVvZiBtdWx0aVxuICogfX0gUGFyc2VySW5pdFxuICovXG5cbi8qKlxuICogQHR5cGVkZWYgeyhhcmc6IHsgc2Nhbm5lcjogU2Nhbm5lckluaXQgfSkgPT4gdm9pZH0gVG9rZW5QbHVnaW5cbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHsoYXJnOiB7IHNjYW5uZXI6IFNjYW5uZXJJbml0LCBwYXJzZXI6IFBhcnNlckluaXQgfSkgPT4gdm9pZH0gUGx1Z2luXG4gKi9cblxuLyoqXG4gKiBEZS1yZWdpc3RlciBhbGwgcGx1Z2lucyBhbmQgcmVzZXQgdGhlIGludGVybmFsIHN0YXRlLW1hY2hpbmUuIFVzZWQgZm9yXG4gKiB0ZXN0aW5nOyBub3QgcmVxdWlyZWQgaW4gcHJhY3RpY2UuXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiByZXNldCgpIHtcbiAgU3RhdGUuZ3JvdXBzID0ge307XG4gIElOSVQuc2Nhbm5lciA9IG51bGw7XG4gIElOSVQucGFyc2VyID0gbnVsbDtcbiAgSU5JVC50b2tlblF1ZXVlID0gW107XG4gIElOSVQucGx1Z2luUXVldWUgPSBbXTtcbiAgSU5JVC5jdXN0b21TY2hlbWVzID0gW107XG4gIElOSVQuaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbn1cblxuLyoqXG4gKiBSZWdpc3RlciBhIHRva2VuIHBsdWdpbiB0byBhbGxvdyB0aGUgc2Nhbm5lciB0byByZWNvZ25pemUgYWRkaXRpb25hbCB0b2tlblxuICogdHlwZXMgYmVmb3JlIHRoZSBwYXJzZXIgc3RhdGUgbWFjaGluZSBpcyBjb25zdHJ1Y3RlZCBmcm9tIHRoZSByZXN1bHRzLlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgb2YgcGx1Z2luIHRvIHJlZ2lzdGVyXG4gKiBAcGFyYW0ge1Rva2VuUGx1Z2lufSBwbHVnaW4gZnVuY3Rpb24gdGhhdCBhY2NlcHRzIHRoZSBzY2FubmVyIHN0YXRlIG1hY2hpbmVcbiAqIGFuZCBhdmFpbGFibGUgc2Nhbm5lciB0b2tlbnMgYW5kIGNvbGxlY3Rpb25zIGFuZCBleHRlbmRzIHRoZSBzdGF0ZSBtYWNoaW5lIHRvXG4gKiByZWNvZ25pemUgYWRkaXRpb25hbCB0b2tlbnMgb3IgZ3JvdXBzLlxuICovXG5mdW5jdGlvbiByZWdpc3RlclRva2VuUGx1Z2luKG5hbWUsIHBsdWdpbikge1xuICBpZiAodHlwZW9mIHBsdWdpbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBFcnJvcihgbGlua2lmeWpzOiBJbnZhbGlkIHRva2VuIHBsdWdpbiAke3BsdWdpbn0gKGV4cGVjdHMgZnVuY3Rpb24pYCk7XG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBJTklULnRva2VuUXVldWUubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAobmFtZSA9PT0gSU5JVC50b2tlblF1ZXVlW2ldWzBdKSB7XG4gICAgICB3YXJuKGBsaW5raWZ5anM6IHRva2VuIHBsdWdpbiBcIiR7bmFtZX1cIiBhbHJlYWR5IHJlZ2lzdGVyZWQgLSB3aWxsIGJlIG92ZXJ3cml0dGVuYCk7XG4gICAgICBJTklULnRva2VuUXVldWVbaV0gPSBbbmFtZSwgcGx1Z2luXTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cbiAgSU5JVC50b2tlblF1ZXVlLnB1c2goW25hbWUsIHBsdWdpbl0pO1xuICBpZiAoSU5JVC5pbml0aWFsaXplZCkge1xuICAgIHdhcm4oYGxpbmtpZnlqczogYWxyZWFkeSBpbml0aWFsaXplZCAtIHdpbGwgbm90IHJlZ2lzdGVyIHRva2VuIHBsdWdpbiBcIiR7bmFtZX1cIiAke3dhcm5BZHZpY2V9YCk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZWdpc3RlciBhIGxpbmtpZnkgcGx1Z2luXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBvZiBwbHVnaW4gdG8gcmVnaXN0ZXJcbiAqIEBwYXJhbSB7UGx1Z2lufSBwbHVnaW4gZnVuY3Rpb24gdGhhdCBhY2NlcHRzIHRoZSBwYXJzZXIgc3RhdGUgbWFjaGluZSBhbmRcbiAqIGV4dGVuZHMgdGhlIHBhcnNlciB0byByZWNvZ25pemUgYWRkaXRpb25hbCBsaW5rIHR5cGVzXG4gKi9cbmZ1bmN0aW9uIHJlZ2lzdGVyUGx1Z2luKG5hbWUsIHBsdWdpbikge1xuICBpZiAodHlwZW9mIHBsdWdpbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBFcnJvcihgbGlua2lmeWpzOiBJbnZhbGlkIHBsdWdpbiAke3BsdWdpbn0gKGV4cGVjdHMgZnVuY3Rpb24pYCk7XG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBJTklULnBsdWdpblF1ZXVlLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKG5hbWUgPT09IElOSVQucGx1Z2luUXVldWVbaV1bMF0pIHtcbiAgICAgIHdhcm4oYGxpbmtpZnlqczogcGx1Z2luIFwiJHtuYW1lfVwiIGFscmVhZHkgcmVnaXN0ZXJlZCAtIHdpbGwgYmUgb3ZlcndyaXR0ZW5gKTtcbiAgICAgIElOSVQucGx1Z2luUXVldWVbaV0gPSBbbmFtZSwgcGx1Z2luXTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cbiAgSU5JVC5wbHVnaW5RdWV1ZS5wdXNoKFtuYW1lLCBwbHVnaW5dKTtcbiAgaWYgKElOSVQuaW5pdGlhbGl6ZWQpIHtcbiAgICB3YXJuKGBsaW5raWZ5anM6IGFscmVhZHkgaW5pdGlhbGl6ZWQgLSB3aWxsIG5vdCByZWdpc3RlciBwbHVnaW4gXCIke25hbWV9XCIgJHt3YXJuQWR2aWNlfWApO1xuICB9XG59XG5cbi8qKlxuICogRGV0ZWN0IFVSTHMgd2l0aCB0aGUgZm9sbG93aW5nIGFkZGl0aW9uYWwgcHJvdG9jb2wuIEFueXRoaW5nIHdpdGggZm9ybWF0XG4gKiBcInByb3RvY29sOi8vLi4uXCIgd2lsbCBiZSBjb25zaWRlcmVkIGEgbGluay4gSWYgYG9wdGlvbmFsU2xhc2hTbGFzaGAgaXMgc2V0IHRvXG4gKiBgdHJ1ZWAsIGFueXRoaW5nIHdpdGggZm9ybWF0IFwicHJvdG9jb2w6Li4uXCIgd2lsbCBiZSBjb25zaWRlcmVkIGEgbGluay5cbiAqIEBwYXJhbSB7c3RyaW5nfSBwcm90b2NvbFxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9uYWxTbGFzaFNsYXNoXVxuICovXG5mdW5jdGlvbiByZWdpc3RlckN1c3RvbVByb3RvY29sKHNjaGVtZSwgb3B0aW9uYWxTbGFzaFNsYXNoKSB7XG4gIGlmIChvcHRpb25hbFNsYXNoU2xhc2ggPT09IHZvaWQgMCkge1xuICAgIG9wdGlvbmFsU2xhc2hTbGFzaCA9IGZhbHNlO1xuICB9XG4gIGlmIChJTklULmluaXRpYWxpemVkKSB7XG4gICAgd2FybihgbGlua2lmeWpzOiBhbHJlYWR5IGluaXRpYWxpemVkIC0gd2lsbCBub3QgcmVnaXN0ZXIgY3VzdG9tIHNjaGVtZSBcIiR7c2NoZW1lfVwiICR7d2FybkFkdmljZX1gKTtcbiAgfVxuICBpZiAoIS9eWzAtOWEtel0rKC1bMC05YS16XSspKiQvLnRlc3Qoc2NoZW1lKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignbGlua2lmeWpzOiBpbmNvcnJlY3Qgc2NoZW1lIGZvcm1hdC5cXG4gMS4gTXVzdCBvbmx5IGNvbnRhaW4gZGlnaXRzLCBsb3dlcmNhc2UgQVNDSUkgbGV0dGVycyBvciBcIi1cIlxcbiAyLiBDYW5ub3Qgc3RhcnQgb3IgZW5kIHdpdGggXCItXCJcXG4gMy4gXCItXCIgY2Fubm90IHJlcGVhdCcpO1xuICB9XG4gIElOSVQuY3VzdG9tU2NoZW1lcy5wdXNoKFtzY2hlbWUsIG9wdGlvbmFsU2xhc2hTbGFzaF0pO1xufVxuXG4vKipcbiAqIEluaXRpYWxpemUgdGhlIGxpbmtpZnkgc3RhdGUgbWFjaGluZS4gQ2FsbGVkIGF1dG9tYXRpY2FsbHkgdGhlIGZpcnN0IHRpbWVcbiAqIGxpbmtpZnkgaXMgY2FsbGVkIG9uIGEgc3RyaW5nLCBidXQgbWF5IGJlIGNhbGxlZCBtYW51YWxseSBhcyB3ZWxsLlxuICovXG5mdW5jdGlvbiBpbml0KCkge1xuICAvLyBJbml0aWFsaXplIHNjYW5uZXIgc3RhdGUgbWFjaGluZSBhbmQgcGx1Z2luc1xuICBJTklULnNjYW5uZXIgPSBpbml0JDIoSU5JVC5jdXN0b21TY2hlbWVzKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBJTklULnRva2VuUXVldWUubGVuZ3RoOyBpKyspIHtcbiAgICBJTklULnRva2VuUXVldWVbaV1bMV0oe1xuICAgICAgc2Nhbm5lcjogSU5JVC5zY2FubmVyXG4gICAgfSk7XG4gIH1cblxuICAvLyBJbml0aWFsaXplIHBhcnNlciBzdGF0ZSBtYWNoaW5lIGFuZCBwbHVnaW5zXG4gIElOSVQucGFyc2VyID0gaW5pdCQxKElOSVQuc2Nhbm5lci50b2tlbnMpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IElOSVQucGx1Z2luUXVldWUubGVuZ3RoOyBpKyspIHtcbiAgICBJTklULnBsdWdpblF1ZXVlW2ldWzFdKHtcbiAgICAgIHNjYW5uZXI6IElOSVQuc2Nhbm5lcixcbiAgICAgIHBhcnNlcjogSU5JVC5wYXJzZXJcbiAgICB9KTtcbiAgfVxuICBJTklULmluaXRpYWxpemVkID0gdHJ1ZTtcbn1cblxuLyoqXG4gKiBQYXJzZSBhIHN0cmluZyBpbnRvIHRva2VucyB0aGF0IHJlcHJlc2VudCBsaW5rYWJsZSBhbmQgbm9uLWxpbmthYmxlIHN1Yi1jb21wb25lbnRzXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtNdWx0aVRva2VuW119IHRva2Vuc1xuICovXG5mdW5jdGlvbiB0b2tlbml6ZShzdHIpIHtcbiAgaWYgKCFJTklULmluaXRpYWxpemVkKSB7XG4gICAgaW5pdCgpO1xuICB9XG4gIHJldHVybiBydW4oSU5JVC5wYXJzZXIuc3RhcnQsIHN0ciwgcnVuJDEoSU5JVC5zY2FubmVyLnN0YXJ0LCBzdHIpKTtcbn1cblxuLyoqXG4gKiBGaW5kIGEgbGlzdCBvZiBsaW5rYWJsZSBpdGVtcyBpbiB0aGUgZ2l2ZW4gc3RyaW5nLlxuICogQHBhcmFtIHtzdHJpbmd9IHN0ciBzdHJpbmcgdG8gZmluZCBsaW5rcyBpblxuICogQHBhcmFtIHtzdHJpbmcgfCBPcHRzfSBbdHlwZV0gZWl0aGVyIGZvcm1hdHRpbmcgb3B0aW9ucyBvciBzcGVjaWZpYyB0eXBlIG9mXG4gKiBsaW5rcyB0byBmaW5kLCBlLmcuLCAndXJsJyBvciAnZW1haWwnXG4gKiBAcGFyYW0ge09wdHN9IFtvcHRzXSBmb3JtYXR0aW5nIG9wdGlvbnMgZm9yIGZpbmFsIG91dHB1dC4gQ2Fubm90IGJlIHNwZWNpZmllZFxuICogaWYgb3B0cyBhbHJlYWR5IHByb3ZpZGVkIGluIGB0eXBlYCBhcmd1bWVudFxuKi9cbmZ1bmN0aW9uIGZpbmQoc3RyLCB0eXBlLCBvcHRzKSB7XG4gIGlmICh0eXBlID09PSB2b2lkIDApIHtcbiAgICB0eXBlID0gbnVsbDtcbiAgfVxuICBpZiAob3B0cyA9PT0gdm9pZCAwKSB7XG4gICAgb3B0cyA9IG51bGw7XG4gIH1cbiAgaWYgKHR5cGUgJiYgdHlwZW9mIHR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgaWYgKG9wdHMpIHtcbiAgICAgIHRocm93IEVycm9yKGBsaW5raWZ5anM6IEludmFsaWQgbGluayB0eXBlICR7dHlwZX07IG11c3QgYmUgYSBzdHJpbmdgKTtcbiAgICB9XG4gICAgb3B0cyA9IHR5cGU7XG4gICAgdHlwZSA9IG51bGw7XG4gIH1cbiAgY29uc3Qgb3B0aW9ucyA9IG5ldyBPcHRpb25zKG9wdHMpO1xuICBjb25zdCB0b2tlbnMgPSB0b2tlbml6ZShzdHIpO1xuICBjb25zdCBmaWx0ZXJlZCA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHRva2VuID0gdG9rZW5zW2ldO1xuICAgIGlmICh0b2tlbi5pc0xpbmsgJiYgKCF0eXBlIHx8IHRva2VuLnQgPT09IHR5cGUpKSB7XG4gICAgICBmaWx0ZXJlZC5wdXNoKHRva2VuLnRvRm9ybWF0dGVkT2JqZWN0KG9wdGlvbnMpKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZpbHRlcmVkO1xufVxuXG4vKipcbiAqIElzIHRoZSBnaXZlbiBzdHJpbmcgdmFsaWQgbGlua2FibGUgdGV4dCBvZiBzb21lIHNvcnQuIE5vdGUgdGhhdCB0aGlzIGRvZXMgbm90XG4gKiB0cmltIHRoZSB0ZXh0IGZvciB5b3UuXG4gKlxuICogT3B0aW9uYWxseSBwYXNzIGluIGEgc2Vjb25kIGB0eXBlYCBwYXJhbSwgd2hpY2ggaXMgdGhlIHR5cGUgb2YgbGluayB0byB0ZXN0XG4gKiBmb3IuXG4gKlxuICogRm9yIGV4YW1wbGUsXG4gKlxuICogICAgIGxpbmtpZnkudGVzdChzdHIsICdlbWFpbCcpO1xuICpcbiAqIFJldHVybnMgYHRydWVgIGlmIHN0ciBpcyBhIHZhbGlkIGVtYWlsLlxuICogQHBhcmFtIHtzdHJpbmd9IHN0ciBzdHJpbmcgdG8gdGVzdCBmb3IgbGlua3NcbiAqIEBwYXJhbSB7c3RyaW5nfSBbdHlwZV0gb3B0aW9uYWwgc3BlY2lmaWMgbGluayB0eXBlIHRvIGxvb2sgZm9yXG4gKiBAcmV0dXJucyBib29sZWFuIHRydWUvZmFsc2VcbiAqL1xuZnVuY3Rpb24gdGVzdChzdHIsIHR5cGUpIHtcbiAgaWYgKHR5cGUgPT09IHZvaWQgMCkge1xuICAgIHR5cGUgPSBudWxsO1xuICB9XG4gIGNvbnN0IHRva2VucyA9IHRva2VuaXplKHN0cik7XG4gIHJldHVybiB0b2tlbnMubGVuZ3RoID09PSAxICYmIHRva2Vuc1swXS5pc0xpbmsgJiYgKCF0eXBlIHx8IHRva2Vuc1swXS50ID09PSB0eXBlKTtcbn1cblxuZXhwb3J0IHsgTXVsdGlUb2tlbiwgT3B0aW9ucywgU3RhdGUsIGNyZWF0ZVRva2VuQ2xhc3MsIGZpbmQsIGluaXQsIG11bHRpLCBvcHRpb25zLCByZWdleHAsIHJlZ2lzdGVyQ3VzdG9tUHJvdG9jb2wsIHJlZ2lzdGVyUGx1Z2luLCByZWdpc3RlclRva2VuUGx1Z2luLCByZXNldCwgc3RyaW5nVG9BcnJheSwgdGVzdCwgdG9rZW5pemUgfTtcbiIsICJpbXBvcnQgR09iamVjdCBmcm9tIFwiZ2k6Ly9HT2JqZWN0XCI7XG5pbXBvcnQgR3RrIGZyb20gXCJnaTovL0d0az92ZXJzaW9uPTQuMFwiO1xuaW1wb3J0IEFkdyBmcm9tIFwiZ2k6Ly9BZHdcIjtcbmltcG9ydCBHZGsgZnJvbSBcImdpOi8vR2RrP3ZlcnNpb249NC4wXCI7XG5cbmV4cG9ydCBjbGFzcyBUaGVtZVNlbGVjdG9yIGV4dGVuZHMgR3RrLldpZGdldCB7XG4gIHN0YXRpYyB7XG4gICAgR09iamVjdC5yZWdpc3RlckNsYXNzKFxuICAgICAge1xuICAgICAgICBHVHlwZU5hbWU6IFwiVGhlbWVTZWxlY3RvclwiLFxuICAgICAgICBUZW1wbGF0ZTogXCJyZXNvdXJjZTovLy9jb20vdml4YWxpZW4vc3RpY2t5L3VpL3RoZW1lLXNlbGVjdG9yLnVpXCIsXG4gICAgICAgIENzc05hbWU6IFwidGhlbWVzZWxlY3RvclwiLFxuICAgICAgICBJbnRlcm5hbENoaWxkcmVuOiBbXCJmb2xsb3dcIl0sXG4gICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICB0aGVtZTogR09iamVjdC5QYXJhbVNwZWMuc3RyaW5nKFxuICAgICAgICAgICAgXCJ0aGVtZVwiLCAvLyBOYW1lXG4gICAgICAgICAgICBcIlRoZW1lXCIsIC8vIE5pY2tcbiAgICAgICAgICAgIFwiVGhlbWVcIiwgLy8gQmx1cmJcbiAgICAgICAgICAgIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsXG4gICAgICAgICAgICAvLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgICAgICAgICAgbnVsbCwgLy8gRGVmYXVsdCB2YWx1ZVxuICAgICAgICAgICksXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgdGhpcyxcbiAgICApO1xuXG4gICAgdGhpcy5zZXRfbGF5b3V0X21hbmFnZXJfdHlwZShHdGsuQmluTGF5b3V0LiRndHlwZSk7XG4gIH1cblxuICB0aGVtZTogc3RyaW5nO1xuXG4gIGRlY2xhcmUgX2ZvbGxvdzogR3RrLkNoZWNrQnV0dG9uO1xuXG4gIHN0eWxlX21hbmFnZXI6IEFkdy5TdHlsZU1hbmFnZXI7XG5cbiAgY29uc3RydWN0b3IocGFyYW1zID0ge30pIHtcbiAgICBzdXBlcihwYXJhbXMpO1xuXG4gICAgdGhpcy5zdHlsZV9tYW5hZ2VyID0gQWR3LlN0eWxlTWFuYWdlci5nZXRfZGVmYXVsdCgpO1xuXG4gICAgdGhpcy5zdHlsZV9tYW5hZ2VyLmNvbm5lY3QoXG4gICAgICBcIm5vdGlmeTo6c3lzdGVtLXN1cHBvcnRzLWNvbG9yLXNjaGVtZXNcIixcbiAgICAgIHRoaXMuX29uX25vdGlmeV9zeXN0ZW1fc3VwcG9ydHNfY29sb3Jfc2NoZW1lcy5iaW5kKHRoaXMpLFxuICAgICk7XG4gICAgdGhpcy5fb25fbm90aWZ5X3N5c3RlbV9zdXBwb3J0c19jb2xvcl9zY2hlbWVzKCk7XG5cbiAgICBjb25zdCBkYXJrID0gdGhpcy5zdHlsZV9tYW5hZ2VyLmdldF9kYXJrKCk7XG4gICAgdGhpcy50aGVtZSA9IGRhcmsgPyBcImRhcmtcIiA6IFwibGlnaHRcIjtcblxuICAgIHRoaXMuc3R5bGVfbWFuYWdlci5jb25uZWN0KFwibm90aWZ5OjpkYXJrXCIsIHRoaXMuX29uX25vdGlmeV9kYXJrLmJpbmQodGhpcykpO1xuICAgIHRoaXMuX29uX25vdGlmeV9kYXJrKCk7XG5cbiAgICBjb25zdCBwcm92aWRlciA9IG5ldyBHdGsuQ3NzUHJvdmlkZXIoKTtcbiAgICBwcm92aWRlci5sb2FkX2Zyb21fcmVzb3VyY2UoXCIvY29tL3ZpeGFsaWVuL3N0aWNreS90aGVtZS1zZWxlY3Rvci5jc3NcIik7XG4gICAgR3RrLlN0eWxlQ29udGV4dC5hZGRfcHJvdmlkZXJfZm9yX2Rpc3BsYXkoXG4gICAgICBHZGsuRGlzcGxheS5nZXRfZGVmYXVsdCgpISxcbiAgICAgIHByb3ZpZGVyLFxuICAgICAgR3RrLlNUWUxFX1BST1ZJREVSX1BSSU9SSVRZX0FQUExJQ0FUSU9OLFxuICAgICk7XG4gIH1cblxuICBfb25fbm90aWZ5X3N5c3RlbV9zdXBwb3J0c19jb2xvcl9zY2hlbWVzKCkge1xuICAgIHRoaXMuX2ZvbGxvdy5zZXRfdmlzaWJsZShcbiAgICAgIHRoaXMuc3R5bGVfbWFuYWdlci5nZXRfc3lzdGVtX3N1cHBvcnRzX2NvbG9yX3NjaGVtZXMoKSxcbiAgICApO1xuICB9XG5cbiAgX29uX25vdGlmeV9kYXJrKCkge1xuICAgIGlmICh0aGlzLnN0eWxlX21hbmFnZXIuZ2V0X2RhcmsoKSkgdGhpcy5hZGRfY3NzX2NsYXNzKFwiZGFya1wiKTtcbiAgICBlbHNlIHRoaXMucmVtb3ZlX2Nzc19jbGFzcyhcImRhcmtcIik7XG4gIH1cbn1cbiIsICJpbXBvcnQgR2lvIGZyb20gXCJnaTovL0dpb1wiO1xuaW1wb3J0IEdMaWIgZnJvbSBcImdpOi8vR0xpYlwiO1xuXG5pbXBvcnQgeyBTdGlja3lFcnJvciwgU3RpY2t5RXJyb3JUeXBlIH0gZnJvbSBcIi4vZXJyb3JzLmpzXCI7XG5pbXBvcnQgeyBJTm90ZSwgTm90ZSB9IGZyb20gXCIuL3V0aWwuanNcIjtcblxuR2lvLl9wcm9taXNpZnkoXG4gIEdpby5GaWxlLnByb3RvdHlwZSxcbiAgXCJsb2FkX2NvbnRlbnRzX2FzeW5jXCIsXG4gIFwibG9hZF9jb250ZW50c19maW5pc2hcIixcbik7XG5cbkdpby5fcHJvbWlzaWZ5KFxuICBHaW8uRmlsZS5wcm90b3R5cGUsXG4gIFwicmVwbGFjZV9jb250ZW50c19hc3luY1wiLFxuICBcInJlcGxhY2VfY29udGVudHNfZmluaXNoXCIsXG4pO1xuXG5jb25zdCBkZWNvZGVyID0gbmV3IFRleHREZWNvZGVyKCk7XG5jb25zdCBlbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKCk7XG5cbmludGVyZmFjZSBTYXZlZE5vdGVEYXRhIHtcbiAgdjogMTtcbiAgbm90ZXM6IElOb3RlW107XG4gIHN0YXRlOiBTdGF0ZTtcbn1cblxuaW50ZXJmYWNlIExvYWROb3Rlc1JldHVybiB7XG4gIG5vdGVzOiBOb3RlW107XG4gIHN0YXRlOiBTdGF0ZTtcbn1cblxuaW50ZXJmYWNlIFN0YXRlIHtcbiAgYWxsX25vdGVzOiBib29sZWFuO1xufVxuXG5leHBvcnQgY29uc3QgTm90ZXNEaXIgPSBHaW8uZmlsZV9uZXdfZm9yX3BhdGgoXG4gIEdMaWIuYnVpbGRfZmlsZW5hbWV2KFtHTGliLmdldF91c2VyX2RhdGFfZGlyKCksIHBrZy5uYW1lXSksXG4pO1xuXG5leHBvcnQgY29uc3QgTmV3Tm90ZXNEaXIgPSBHaW8uZmlsZV9uZXdfZm9yX3BhdGgoXG4gIEdMaWIuYnVpbGRfZmlsZW5hbWV2KFtHTGliLmdldF91c2VyX2RhdGFfZGlyKCksIHBrZy5uYW1lLCBcIm5vdGVzXCJdKSxcbik7XG5cbmV4cG9ydCBjb25zdCBOb3RlcyA9IEdpby5maWxlX25ld19mb3JfcGF0aChcbiAgR0xpYi5idWlsZF9maWxlbmFtZXYoW05vdGVzRGlyLmdldF9wYXRoKCkhLCBcIm5vdGVzLmpzb25cIl0pLFxuKTtcblxuZXhwb3J0IGNvbnN0IGxvYWRfZmlsZSA9IChmaWxlOiBHaW8uRmlsZSkgPT4ge1xuICB0cnkge1xuICAgIE5vdGVzLmdldF9wYXJlbnQoKSEubWFrZV9kaXJlY3Rvcnlfd2l0aF9wYXJlbnRzKG51bGwpO1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgaWYgKGUgaW5zdGFuY2VvZiBHTGliLkVycm9yKSB7XG4gICAgICBpZiAoIWUubWF0Y2hlcyhHaW8uSU9FcnJvckVudW0sIEdpby5JT0Vycm9yRW51bS5FWElTVFMpKSB7XG4gICAgICAgIHRocm93IG5ldyBTdGlja3lFcnJvcihcbiAgICAgICAgICBTdGlja3lFcnJvclR5cGUuTk9fUEVSTUlTU0lPTixcbiAgICAgICAgICBcIkZhaWxlZCB0byBjcmVhdGUgbm90ZXMgZGlyZWN0b3J5XCIsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBbXywgY29udGVudHNdID0gZmlsZS5sb2FkX2NvbnRlbnRzKG51bGwpO1xuXG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKGRlY29kZXIuZGVjb2RlKGNvbnRlbnRzKSk7XG4gICAgfSBjYXRjaCAoZTogdW5rbm93bikge1xuICAgICAgdGhyb3cgbmV3IFN0aWNreUVycm9yKFxuICAgICAgICBTdGlja3lFcnJvclR5cGUuRklMRV9DT1JSVVBURUQsXG4gICAgICAgIFwiRmFpbGVkIHRvIHBhcnNlIG5vdGVzXCIsXG4gICAgICApO1xuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChlIGluc3RhbmNlb2YgR0xpYi5FcnJvcikge1xuICAgICAgaWYgKGUubWF0Y2hlcyhHaW8uSU9FcnJvckVudW0sIEdpby5JT0Vycm9yRW51bS5OT1RfRk9VTkQpKSB7XG4gICAgICAgIHRocm93IG5ldyBTdGlja3lFcnJvcihcbiAgICAgICAgICBTdGlja3lFcnJvclR5cGUuRklMRV9OT1RfRk9VTkQsXG4gICAgICAgICAgXCJGYWlsZWQgdG8gbG9hZCBub3Rlc1wiLFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IFN0aWNreUVycm9yKFxuICAgICAgICAgIFN0aWNreUVycm9yVHlwZS5VTktOT1dOLFxuICAgICAgICAgIFwiRmFpbGVkIHRvIGxvYWQgbm90ZXNcIixcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBzYXZlX2ZpbGUgPSAoZmlsZTogR2lvLkZpbGUsIGRhdGE6IGFueSkgPT4ge1xuICBjb25zdCBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeShkYXRhLCBudWxsLCAyKTtcblxuICB0cnkge1xuICAgIHJldHVybiBmaWxlLnJlcGxhY2VfY29udGVudHMoXG4gICAgICBlbmNvZGVyLmVuY29kZShzdHJpbmcpLFxuICAgICAgbnVsbCxcbiAgICAgIGZhbHNlLFxuICAgICAgR2lvLkZpbGVDcmVhdGVGbGFncy5OT05FLFxuICAgICAgbnVsbCxcbiAgICApO1xuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKGUgaW5zdGFuY2VvZiBHTGliLkVycm9yKSB7XG4gICAgICBpZiAoZS5tYXRjaGVzKEdpby5JT0Vycm9yRW51bSwgR2lvLklPRXJyb3JFbnVtLlBFUk1JU1NJT05fREVOSUVEKSkge1xuICAgICAgICB0aHJvdyBuZXcgU3RpY2t5RXJyb3IoXG4gICAgICAgICAgU3RpY2t5RXJyb3JUeXBlLk5PX1BFUk1JU1NJT04sXG4gICAgICAgICAgXCJGYWlsZWQgdG8gc2F2ZSBub3Rlc1wiLFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IFN0aWNreUVycm9yKFxuICAgICAgICAgIFN0aWNreUVycm9yVHlwZS5VTktOT1dOLFxuICAgICAgICAgIFwiRmFpbGVkIHRvIHNhdmUgbm90ZXNcIixcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBlbnN1cmVfZGlyID0gKGRpcjogR2lvLkZpbGUpID0+IHtcbiAgdHJ5IHtcbiAgICBkaXIubWFrZV9kaXJlY3Rvcnlfd2l0aF9wYXJlbnRzKG51bGwpO1xuICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgaWYgKGUgaW5zdGFuY2VvZiBHTGliLkVycm9yKSB7XG4gICAgICBpZiAoIWUubWF0Y2hlcyhHaW8uSU9FcnJvckVudW0sIEdpby5JT0Vycm9yRW51bS5FWElTVFMpKSB7XG4gICAgICAgIHRocm93IG5ldyBTdGlja3lFcnJvcihcbiAgICAgICAgICBTdGlja3lFcnJvclR5cGUuTk9fUEVSTUlTU0lPTixcbiAgICAgICAgICBcIkZhaWxlZCB0byBjcmVhdGUgbm90ZXMgZGlyZWN0b3J5XCIsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5jb25zdCBib2d1c19kYXRhOiBMb2FkTm90ZXNSZXR1cm4gPSB7IHN0YXRlOiB7IGFsbF9ub3RlczogdHJ1ZSB9LCBub3RlczogW10gfTtcblxuY29uc3QgbG9hZF9ub3Rlc192MSA9IChub3RlczogYW55KSA9PiB7XG4gIGlmIChub3Rlcy52ICE9PSAxKSB7XG4gICAgY29uc29sZS5lcnJvcihgSW52YWxpZCBub3RlcyB2ZXJzaW9uICR7bm90ZXMudn1gKTtcbiAgICByZXR1cm4gYm9ndXNfZGF0YTtcbiAgfVxuICByZXR1cm4ge1xuICAgIG5vdGVzOiBub3Rlcy5ub3Rlcy5tYXAoKG5vdGU6IElOb3RlKSA9PiBuZXcgTm90ZShub3RlKSksXG4gICAgc3RhdGU6IG5vdGVzLnN0YXRlLFxuICB9IGFzIExvYWROb3Rlc1JldHVybjtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkX25vdGVzKCkge1xuICBsZXQgaW5kZXggPSBudWxsO1xuXG4gIHRyeSB7XG4gICAgaW5kZXggPSBsb2FkX2ZpbGUoTm90ZXMpID8/IG51bGw7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoZSBpbnN0YW5jZW9mIFN0aWNreUVycm9yKSB7XG4gICAgICBpZiAoXG4gICAgICAgIGUudHlwZSA9PSBTdGlja3lFcnJvclR5cGUuRklMRV9OT1RfRk9VTkQgfHxcbiAgICAgICAgZS50eXBlID09IFN0aWNreUVycm9yVHlwZS5GSUxFX0NPUlJVUFRFRFxuICAgICAgKSB7XG4gICAgICAgIC8vIGlnbm9yZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoaW5kZXggIT09IG51bGwpIHtcbiAgICAvLyBpZiB0aGUgaW5kZXggZXhpc3RzLCBsb2FkIHRoZSBub3RlcyBmcm9tIHRoZSBpbmRleFxuICAgIGNvbnN0IG5vdGVzID0gbG9hZF9ub3Rlc192MShpbmRleCkubm90ZXM7XG4gICAgTm90ZXMuZGVsZXRlKG51bGwpO1xuICAgIHNhdmVfbm90ZXMobm90ZXMpO1xuICAgIHJldHVybiBub3RlcztcbiAgfVxuXG4gIGVuc3VyZV9kaXIoTmV3Tm90ZXNEaXIpO1xuXG4gIGNvbnN0IGZpbGVzID0gbGlzdF9maWxlcyhOZXdOb3Rlc0Rpcik7XG5cbiAgcmV0dXJuIGZpbGVzXG4gICAgLmZpbHRlcigoZmlsZSkgPT4gZmlsZS5nZXRfYmFzZW5hbWUoKSEuZW5kc1dpdGgoXCIuanNvblwiKSlcbiAgICAubWFwKChmaWxlKSA9PiBsb2FkX2ZpbGUoZmlsZSkpXG4gICAgLm1hcCgobm90ZSkgPT4gbmV3IE5vdGUobm90ZSkpO1xufVxuXG5leHBvcnQgY29uc3QgbGlzdF9maWxlcyA9IChkaXI6IEdpby5GaWxlKSA9PiB7XG4gIGNvbnN0IGVudW1lcmF0b3IgPSBkaXIuZW51bWVyYXRlX2NoaWxkcmVuKFxuICAgIFwic3RhbmRhcmQ6Om5hbWUsc3RhbmRhcmQ6OnR5cGVcIixcbiAgICBHaW8uRmlsZVF1ZXJ5SW5mb0ZsYWdzLk5PTkUsXG4gICAgbnVsbCxcbiAgKTtcblxuICBjb25zdCBmaWxlczogR2lvLkZpbGVbXSA9IFtdO1xuXG4gIGxldCBpbmZvOiBHaW8uRmlsZUluZm8gfCBudWxsO1xuXG4gIHdoaWxlICgoaW5mbyA9IGVudW1lcmF0b3IubmV4dF9maWxlKG51bGwpKSAhPT0gbnVsbCkge1xuICAgIGNvbnN0IGZpbGUgPSBlbnVtZXJhdG9yLmdldF9jaGlsZChpbmZvKTtcbiAgICBmaWxlcy5wdXNoKGZpbGUpO1xuICB9XG5cbiAgcmV0dXJuIGZpbGVzO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHNhdmVfbm90ZXMobm90ZXM6IE5vdGVbXSkge1xuICBlbnN1cmVfZGlyKE5ld05vdGVzRGlyKTtcblxuICBjb25zdCBmaWxlcyA9IGxpc3RfZmlsZXMoTmV3Tm90ZXNEaXIpO1xuXG4gIGxldCB3cml0ZXM6IFtOb3RlLCBHaW8uRmlsZV1bXSA9IFtdO1xuICBjb25zdCBkZWxldGVzOiBHaW8uRmlsZVtdID0gW107XG5cbiAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgY29uc3QgYmFzZW5hbWUgPSBmaWxlLmdldF9iYXNlbmFtZSgpITtcblxuICAgIGlmIChiYXNlbmFtZS5lbmRzV2l0aChcIi5qc29uXCIpKSB7XG4gICAgICBjb25zdCB1dWlkID0gYmFzZW5hbWUuc2xpY2UoMCwgLTUpO1xuXG4gICAgICBpZiAodXVpZC5sZW5ndGggIT09IDM2KSB7XG4gICAgICAgIGRlbGV0ZXMucHVzaChmaWxlKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG5vdGUgPSBub3Rlcy5maW5kKChub3RlKSA9PiBub3RlLnV1aWQgPT09IHV1aWQpO1xuICAgICAgaWYgKG5vdGUpIHtcbiAgICAgICAgd3JpdGVzLnB1c2goW25vdGUsIGZpbGVdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlbGV0ZXMucHVzaChmaWxlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gZGVsZXRlcy5wdXNoKGZpbGUpO1xuICAgIH1cbiAgfVxuXG4gIGZvciAoY29uc3Qgbm90ZSBvZiBub3Rlcykge1xuICAgIGlmICghd3JpdGVzLnNvbWUoKFtuXSkgPT4gbi51dWlkID09PSBub3RlLnV1aWQpKSB7XG4gICAgICBjb25zdCBmaWxlID0gTmV3Tm90ZXNEaXIuZ2V0X2NoaWxkKGAke25vdGUudXVpZH0uanNvbmApO1xuICAgICAgd3JpdGVzLnB1c2goW25vdGUsIGZpbGVdKTtcbiAgICB9XG4gIH1cblxuICBmb3IgKGNvbnN0IGZpbGUgb2YgZGVsZXRlcykge1xuICAgIGZpbGUuZGVsZXRlKG51bGwpO1xuICB9XG5cbiAgcmV0dXJuIHdyaXRlcy5tYXAoKFtub3RlLCBmaWxlXSkgPT4gc2F2ZV9maWxlKGZpbGUsIG5vdGUpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNhdmVfbm90ZShub3RlOiBOb3RlKSB7XG4gIGNvbnN0IGZpbGUgPSBOZXdOb3Rlc0Rpci5nZXRfY2hpbGQoYCR7bm90ZS51dWlkfS5qc29uYCk7XG5cbiAgcmV0dXJuIHNhdmVfZmlsZShmaWxlLCBub3RlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlbGV0ZV9ub3RlKHV1aWQ6IHN0cmluZykge1xuICBjb25zdCBmaWxlID0gTmV3Tm90ZXNEaXIuZ2V0X2NoaWxkKGAke3V1aWR9Lmpzb25gKTtcblxuICB0cnkge1xuICAgIHJldHVybiBmaWxlLmRlbGV0ZShudWxsKTtcbiAgfSBjYXRjaCB7fVxufVxuIiwgImV4cG9ydCBlbnVtIFN0aWNreUVycm9yVHlwZSB7XG4gIEZJTEVfTk9UX0ZPVU5ELFxuICBGSUxFX0NPUlJVUFRFRCxcbiAgTk9fUEVSTUlTU0lPTixcbiAgVU5LTk9XTixcbn1cblxuZXhwb3J0IGNsYXNzIFN0aWNreUVycm9yIHtcbiAgbWVzc2FnZTogc3RyaW5nO1xuICB0eXBlOiBTdGlja3lFcnJvclR5cGU7XG5cbiAgY29uc3RydWN0b3IodHlwZTogU3RpY2t5RXJyb3JUeXBlLCBtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gIH1cbn1cbiIsICIvKiBNSVQgTGljZW5zZVxuICpcbiAqIENvcHlyaWdodCAoYykgMjAyMyBBbmdlbG8gVmVybGFpbiwgQ2hyaXMgRGF2aXNcbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gKiBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAqIFNPRlRXQVJFLlxuICpcbiAqIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBNSVRcbiAqL1xuXG5pbXBvcnQgR09iamVjdCBmcm9tIFwiZ2k6Ly9HT2JqZWN0XCI7XG5pbXBvcnQgR3RrIGZyb20gXCJnaTovL0d0az92ZXJzaW9uPTQuMFwiO1xuaW1wb3J0IEFkdyBmcm9tIFwiZ2k6Ly9BZHdcIjtcbmltcG9ydCBHaW8gZnJvbSBcImdpOi8vR2lvXCI7XG5pbXBvcnQgR0xpYiBmcm9tIFwiZ2k6Ly9HTGliXCI7XG5cbmltcG9ydCB7IFN0eWxlU2VsZWN0b3IgfSBmcm9tIFwiLi9zdHlsZXNlbGVjdG9yLmpzXCI7XG5pbXBvcnQgeyBjb25maXJtX2RlbGV0ZSwgTm90ZSwgU3R5bGUgfSBmcm9tIFwiLi91dGlsLmpzXCI7XG5pbXBvcnQgeyBXcml0ZWFibGVTdGlja3lOb3RlIH0gZnJvbSBcIi4vdmlldy5qc1wiO1xuaW1wb3J0IHsgZmluZCB9IGZyb20gXCJsaW5raWZ5anNcIjtcbmltcG9ydCB7IEFwcGxpY2F0aW9uIH0gZnJvbSBcIi4vYXBwbGljYXRpb24uanNcIjtcblxuZXhwb3J0IGNsYXNzIFdpbmRvdyBleHRlbmRzIEFkdy5BcHBsaWNhdGlvbldpbmRvdyB7XG4gIGRlY2xhcmUgX2NvbnRhaW5lcjogR3RrLkJveDtcbiAgZGVjbGFyZSBfdGV4dDogR3RrLlRleHRWaWV3O1xuICBkZWNsYXJlIF9tZW51X2J1dHRvbjogR3RrLk1lbnVCdXR0b247XG5cbiAgZGVjbGFyZSBfYm9sZF9idXR0b246IEd0ay5Ub2dnbGVCdXR0b247XG4gIGRlY2xhcmUgX3VuZGVybGluZV9idXR0b246IEd0ay5Ub2dnbGVCdXR0b247XG4gIGRlY2xhcmUgX2l0YWxpY19idXR0b246IEd0ay5Ub2dnbGVCdXR0b247XG4gIGRlY2xhcmUgX3N0cmlrZXRocm91Z2hfYnV0dG9uOiBHdGsuVG9nZ2xlQnV0dG9uO1xuICBkZWNsYXJlIF9hY3Rpb25fYnV0dG9uOiBHdGsuVG9nZ2xlQnV0dG9uO1xuICBkZWNsYXJlIF9hY3Rpb25fcmV2ZWFsZXI6IEd0ay5SZXZlYWxlcjtcblxuICAvLyBidWZmZXIgPSBuZXcgR3RrLlRleHRCdWZmZXIoKTtcblxuICB2aWV3OiBXcml0ZWFibGVTdGlja3lOb3RlO1xuXG4gIHNlbGVjdG9yOiBTdHlsZVNlbGVjdG9yO1xuXG4gIG5vdGU6IE5vdGU7XG4gIGRlbGV0ZWQgPSBmYWxzZTtcblxuICBzdGF0aWMge1xuICAgIEdPYmplY3QucmVnaXN0ZXJDbGFzcyhcbiAgICAgIHtcbiAgICAgICAgVGVtcGxhdGU6IFwicmVzb3VyY2U6Ly8vY29tL3ZpeGFsaWVuL3N0aWNreS91aS93aW5kb3cudWlcIixcbiAgICAgICAgR1R5cGVOYW1lOiBcIlN0aWNreU5vdGVXaW5kb3dcIixcbiAgICAgICAgSW50ZXJuYWxDaGlsZHJlbjogW1xuICAgICAgICAgIFwiY29udGFpbmVyXCIsXG4gICAgICAgICAgXCJ0ZXh0XCIsXG4gICAgICAgICAgXCJib2xkX2J1dHRvblwiLFxuICAgICAgICAgIFwidW5kZXJsaW5lX2J1dHRvblwiLFxuICAgICAgICAgIFwiaXRhbGljX2J1dHRvblwiLFxuICAgICAgICAgIFwic3RyaWtldGhyb3VnaF9idXR0b25cIixcbiAgICAgICAgICBcIm1lbnVfYnV0dG9uXCIsXG4gICAgICAgICAgXCJhY3Rpb25fcmV2ZWFsZXJcIixcbiAgICAgICAgICBcImFjdGlvbl9idXR0b25cIixcbiAgICAgICAgXSxcbiAgICAgICAgU2lnbmFsczoge1xuICAgICAgICAgIGRlbGV0ZWQ6IHtcbiAgICAgICAgICAgIHBhcmFtX3R5cGVzOiBbR09iamVjdC5UWVBFX1NUUklOR10sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICB0aGlzLFxuICAgICk7XG4gIH1cblxuICBnZXRfc3R5bGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0b3Iuc3R5bGU7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihcbiAgICB7IG5vdGUsIC4uLnBhcmFtcyB9OiBQYXJ0aWFsPEFkdy5BcHBsaWNhdGlvbldpbmRvdy5Db25zdHJ1Y3RvclByb3BzPiAmIHtcbiAgICAgIG5vdGU6IE5vdGU7XG4gICAgfSxcbiAgKSB7XG4gICAgc3VwZXIocGFyYW1zKTtcblxuICAgIHRoaXMubm90ZSA9IG5vdGU7XG5cbiAgICB0aGlzLmRlZmF1bHRfd2lkdGggPSBub3RlLndpZHRoO1xuICAgIHRoaXMuZGVmYXVsdF9oZWlnaHQgPSBub3RlLmhlaWdodDtcblxuICAgIHRoaXMubm90ZS5iaW5kX3Byb3BlcnR5X2Z1bGwoXG4gICAgICBcInRpdGxlXCIsXG4gICAgICB0aGlzLFxuICAgICAgXCJ0aXRsZVwiLFxuICAgICAgR09iamVjdC5CaW5kaW5nRmxhZ3MuU1lOQ19DUkVBVEUsXG4gICAgICAoX18sIHRpdGxlKSA9PiB7XG4gICAgICAgIGlmICghdGl0bGUpIHtcbiAgICAgICAgICByZXR1cm4gW3RydWUsIF8oXCJTdGlja3kgTm90ZVwiKV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFt0cnVlLCB0aXRsZV07XG4gICAgICB9LFxuICAgICAgbnVsbCxcbiAgICApO1xuXG4gICAgdGhpcy5jb25uZWN0KFwiY2xvc2UtcmVxdWVzdFwiLCAoKSA9PiB7XG4gICAgICBpZiAodGhpcy5kZWxldGVkKSByZXR1cm47XG5cbiAgICAgIGlmICh0aGlzLnZpZXcubm90ZSAmJiB0aGlzLnZpZXcubm90ZS5jb250ZW50LnRyaW0oKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgKHRoaXMuYXBwbGljYXRpb24gYXMgQXBwbGljYXRpb24pLmRlbGV0ZV9ub3RlKHRoaXMubm90ZS51dWlkKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB3aWR0aCA9IHRoaXMuZ2V0X2FsbG9jYXRlZF93aWR0aCgpO1xuICAgICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5nZXRfYWxsb2NhdGVkX2hlaWdodCgpO1xuXG4gICAgICBpZiAod2lkdGggIT09IG5vdGUud2lkdGgpIHtcbiAgICAgICAgdGhpcy5ub3RlLndpZHRoID0gd2lkdGg7XG4gICAgICB9XG4gICAgICBpZiAoaGVpZ2h0ICE9PSBub3RlLmhlaWdodCkge1xuICAgICAgICB0aGlzLm5vdGUuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5zZXRfc3R5bGUobm90ZS5zdHlsZSwgdHJ1ZSk7XG5cbiAgICB0aGlzLnZpZXcgPSBuZXcgV3JpdGVhYmxlU3RpY2t5Tm90ZShub3RlKTtcbiAgICB0aGlzLnZpZXcuY29ubmVjdChcInNlbGVjdGlvbi1jaGFuZ2VkXCIsIHRoaXMuY2hlY2tfdGFncy5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnZpZXcuY29ubmVjdChcbiAgICAgIFwidGFnLXRvZ2dsZVwiLFxuICAgICAgKF92aWV3OiBXcml0ZWFibGVTdGlja3lOb3RlLCB0YWc6IHN0cmluZywgYWN0aXZlOiBib29sZWFuKSA9PiB7XG4gICAgICAgIGNvbnN0IGJ1dHRvbiA9XG4gICAgICAgICAgdGhpc1tgXyR7dGFnfV9idXR0b25gIGFzIGtleW9mIHR5cGVvZiB0aGlzXSBhcyBHdGsuVG9nZ2xlQnV0dG9uO1xuICAgICAgICBpZiAoIWJ1dHRvbikgcmV0dXJuO1xuICAgICAgICBidXR0b24uYWN0aXZlID0gYWN0aXZlO1xuICAgICAgfSxcbiAgICApO1xuICAgIHRoaXMudmlldy5jb25uZWN0KFwibGluay1zZWxlY3RlZFwiLCAoXywgdGV4dCkgPT4ge1xuICAgICAgdGhpcy51cGRhdGVfbGluayh0cnVlLCB0ZXh0KTtcbiAgICB9KTtcbiAgICB0aGlzLnZpZXcuY29ubmVjdChcImxpbmstdW5zZWxlY3RlZFwiLCAoKSA9PiB7XG4gICAgICB0aGlzLnVwZGF0ZV9saW5rKGZhbHNlLCBcIlwiKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX3RleHQuYnVmZmVyID0gdGhpcy52aWV3LmJ1ZmZlcjtcblxuICAgIHRoaXMuYWRkX2FjdGlvbnMoKTtcblxuICAgIHRoaXMuc2VsZWN0b3IgPSBuZXcgU3R5bGVTZWxlY3Rvcih7IHN0eWxlOiBub3RlLnN0eWxlIH0pO1xuICAgIHRoaXMuc2VsZWN0b3IuY29ubmVjdChcInN0eWxlLWNoYW5nZWRcIiwgKF9zZWxlY3Rvciwgc3R5bGUpID0+IHtcbiAgICAgIHRoaXMuc2V0X3N0eWxlKHN0eWxlKTtcbiAgICAgIHRoaXMubm90ZS5zdHlsZSA9IHN0eWxlO1xuICAgIH0pO1xuXG4gICAgY29uc3QgcG9wb3ZlciA9IHRoaXMuX21lbnVfYnV0dG9uLmdldF9wb3BvdmVyKCkgYXMgR3RrLlBvcG92ZXJNZW51O1xuICAgIHBvcG92ZXIuYWRkX2NoaWxkKHRoaXMuc2VsZWN0b3IsIFwibm90ZXN0eWxlc3dpdGNoZXJcIik7XG4gIH1cblxuICBsYXN0X3JldmVhbGVyID0gZmFsc2U7XG5cbiAgdXBkYXRlX2xpbmsoc2VsZWN0ZWQ6IGJvb2xlYW4sIHRleHQ6IHN0cmluZykge1xuICAgIGlmIChzZWxlY3RlZCkge1xuICAgICAgY29uc3QgaHJlZiA9IGZpbmQodGV4dClbMF0uaHJlZjtcbiAgICAgIHRoaXMuX2FjdGlvbl9idXR0b24uYWN0aW9uX3RhcmdldCA9IEdMaWIuVmFyaWFudC5uZXdfc3RyaW5nKGhyZWYpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmxhc3RfcmV2ZWFsZXIgPT09IHNlbGVjdGVkKSByZXR1cm47XG5cbiAgICB0aGlzLmxhc3RfcmV2ZWFsZXIgPSBzZWxlY3RlZDtcbiAgICB0aGlzLl9hY3Rpb25fcmV2ZWFsZXIucmV2ZWFsX2NoaWxkID0gc2VsZWN0ZWQ7XG5cbiAgICAvLyBhZGQgdGltZW91dCBmb3IgdGhlIHRyYW5zaXRpb24gdG8gZmluaXNoXG4gICAgR0xpYi50aW1lb3V0X2FkZChcbiAgICAgIEdMaWIuUFJJT1JJVFlfREVGQVVMVCxcbiAgICAgIHRoaXMuX2FjdGlvbl9yZXZlYWxlci50cmFuc2l0aW9uX2R1cmF0aW9uLFxuICAgICAgKCkgPT4ge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBBZHcuUHJvcGVydHlBbmltYXRpb25UYXJnZXQubmV3KFxuICAgICAgICAgIHRoaXMuX3RleHQsXG4gICAgICAgICAgXCJib3R0b21fbWFyZ2luXCIsXG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgYW5pbWF0aW9uID0gQWR3LlRpbWVkQW5pbWF0aW9uLm5ldyhcbiAgICAgICAgICB0aGlzLl90ZXh0LFxuICAgICAgICAgIHRoaXMuX3RleHQuYm90dG9tX21hcmdpbixcbiAgICAgICAgICA2MCArXG4gICAgICAgICAgICAoc2VsZWN0ZWQgPyB0aGlzLl9hY3Rpb25fcmV2ZWFsZXIuZ2V0X2FsbG9jYXRlZF9oZWlnaHQoKSA6IDApLFxuICAgICAgICAgIHRoaXMuX2FjdGlvbl9yZXZlYWxlci50cmFuc2l0aW9uX2R1cmF0aW9uLFxuICAgICAgICAgIHRhcmdldCxcbiAgICAgICAgKTtcblxuICAgICAgICBhbmltYXRpb24ucGxheSgpO1xuXG4gICAgICAgIHJldHVybiBHTGliLlNPVVJDRV9SRU1PVkU7XG4gICAgICB9LFxuICAgICk7XG4gIH1cblxuICBjaGVja190YWdzKCkge1xuICAgIGZvciAoY29uc3QgW25hbWUsIHRhZ10gb2YgdGhpcy52aWV3LmFjdGlvbnMpIHtcbiAgICAgIGNvbnN0IGJ1dHRvbiA9XG4gICAgICAgIHRoaXNbYF8ke25hbWV9X2J1dHRvbmAgYXMga2V5b2YgdHlwZW9mIHRoaXNdIGFzIEd0ay5Ub2dnbGVCdXR0b247XG4gICAgICBjb25zdCBhY3RpdmUgPSB0aGlzLnZpZXcuaGFzX3RhZyh0YWcpICE9PSBmYWxzZTtcbiAgICAgIGlmIChhY3RpdmUgPT09IGJ1dHRvbi5hY3RpdmUpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBidXR0b24uYWN0aXZlID0gYWN0aXZlO1xuICAgIH1cbiAgfVxuXG4gIGFkZF9hY3Rpb25zKCkge1xuICAgIGNvbnN0IGRlbGV0ZV8gPSBHaW8uU2ltcGxlQWN0aW9uLm5ldyhcImRlbGV0ZVwiLCBudWxsKTtcbiAgICBkZWxldGVfLmNvbm5lY3QoXCJhY3RpdmF0ZVwiLCAoKSA9PiB0aGlzLmRlbGV0ZSgpKTtcbiAgICB0aGlzLmFkZF9hY3Rpb24oZGVsZXRlXyk7XG5cbiAgICBmb3IgKGNvbnN0IFtuYW1lLCB0YWddIG9mIHRoaXMudmlldy5hY3Rpb25zKSB7XG4gICAgICBjb25zdCBhY3Rpb24gPSBHaW8uU2ltcGxlQWN0aW9uLm5ldyhuYW1lLCBudWxsKTtcbiAgICAgIGFjdGlvbi5jb25uZWN0KFwiYWN0aXZhdGVcIiwgKCkgPT4gdGhpcy52aWV3LmFwcGx5X3RhZyh0YWcpKTtcbiAgICAgIHRoaXMuYWRkX2FjdGlvbihhY3Rpb24pO1xuICAgIH1cbiAgfVxuXG4gIHNldF9zdHlsZShzdHlsZTogU3R5bGUsIGlzX2luaXQgPSBmYWxzZSkge1xuICAgIGZvciAoY29uc3QgcyBvZiB0aGlzLl9jb250YWluZXIuZ2V0X2Nzc19jbGFzc2VzKCkpIHtcbiAgICAgIGlmIChzLnN0YXJ0c1dpdGgoXCJzdHlsZS1cIikgJiYgcyAhPT0gYHN0eWxlLXNwZWNpZml0eWApIHtcbiAgICAgICAgdGhpcy5fY29udGFpbmVyLnJlbW92ZV9jc3NfY2xhc3Mocyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fY29udGFpbmVyLmFkZF9jc3NfY2xhc3MoYHN0eWxlLSR7U3R5bGVbc3R5bGVdfWApO1xuXG4gICAgaWYgKCFpc19pbml0KSB0aGlzLm5vdGUubW9kaWZpZWRfZGF0ZSA9IG5ldyBEYXRlKCk7XG4gIH1cblxuICBkZWxldGUoKSB7XG4gICAgY29uZmlybV9kZWxldGUodGhpcywgKCkgPT4ge1xuICAgICAgdGhpcy5kZWxldGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuZW1pdChcImRlbGV0ZWRcIiwgdGhpcy5ub3RlLnV1aWQpO1xuICAgICAgY29uc29sZS5sb2coXCJlbWl0dGVkIGRlbGV0ZWRcIik7XG4gICAgfSk7XG4gIH1cbn1cbiIsICIvKiBNSVQgTGljZW5zZVxuICpcbiAqIENvcHlyaWdodCAoYykgMjAyMyBBbmdlbG8gVmVybGFpbiwgQ2hyaXMgRGF2aXNcbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gKiBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAqIFNPRlRXQVJFLlxuICpcbiAqIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBNSVRcbiAqL1xuXG4vLyBBZGFwdGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL3Nvbm55cC90cm9sbC9ibG9iLzYzMzkyYTU3MzkyZmI4ZWQ5NDRlODU5MjY5YTM3NTFmNjQ5ZjY0ZWMvc3JjL3dpZGdldHMvVGhlbWVTZWxlY3Rvci5qc1xuXG5pbXBvcnQgR09iamVjdCBmcm9tIFwiZ2k6Ly9HT2JqZWN0XCI7XG5pbXBvcnQgR3RrIGZyb20gXCJnaTovL0d0az92ZXJzaW9uPTQuMFwiO1xuaW1wb3J0IEdkayBmcm9tIFwiZ2k6Ly9HZGs/dmVyc2lvbj00LjBcIjtcblxuaW1wb3J0IHsgU3R5bGUsIFN0eWxlTmFtZXMsIHN0eWxlcyB9IGZyb20gXCIuL3V0aWwuanNcIjtcblxuY29uc3QgeyB2cHJpbnRmIH0gPSBpbXBvcnRzLmZvcm1hdDtcblxubGV0IHByb3ZpZGVyOiBHdGsuQ3NzUHJvdmlkZXIgfCBudWxsID0gbnVsbDtcblxuY2xhc3MgU3R5bGVCdXR0b24gZXh0ZW5kcyBHdGsuQ2hlY2tCdXR0b24ge1xuICBzdHlsZTogU3R5bGU7XG5cbiAgY29uc3RydWN0b3Ioc3R5bGU6IFN0eWxlLCBncm91cD86IEd0ay5DaGVja0J1dHRvbikge1xuICAgIGNvbnN0IHN0eWxlX25hbWUgPSBTdHlsZVtzdHlsZV07XG4gICAgY29uc3QgZGlzcGxheV9uYW1lID0gU3R5bGVOYW1lcy5nZXQoc3R5bGUpITtcblxuICAgIHN1cGVyKHtcbiAgICAgIC8vIGZvY3VzX29uX2NsaWNrOiBmYWxzZSxcbiAgICAgIHRvb2x0aXBfdGV4dDogdnByaW50ZihfKFwiU3dpdGNoIHRvICVzIHN0eWxlXCIpLCBbZGlzcGxheV9uYW1lXSksXG4gICAgICB3aWR0aF9yZXF1ZXN0OiA0NCxcbiAgICAgIGhlaWdodF9yZXF1ZXN0OiA0NCxcbiAgICAgIGhleHBhbmQ6IHRydWUsXG4gICAgICBoYWxpZ246IEd0ay5BbGlnbi5DRU5URVIsXG4gICAgfSk7XG5cbiAgICBpZiAoZ3JvdXApIHtcbiAgICAgIHRoaXMuc2V0X2dyb3VwKGdyb3VwKTtcbiAgICB9XG5cbiAgICB0aGlzLnN0eWxlID0gc3R5bGU7XG5cbiAgICB0aGlzLnNldF9jc3NfY2xhc3NlcyhbXG4gICAgICAuLi50aGlzLmNzc19jbGFzc2VzLFxuICAgICAgYHN0eWxlLXNlbGVjdG9yYCxcbiAgICAgIGBzdHlsZS0ke3N0eWxlX25hbWV9YCxcbiAgICBdKTtcbiAgfVxuXG4gIHN0YXRpYyB7XG4gICAgR09iamVjdC5yZWdpc3RlckNsYXNzKHt9LCB0aGlzKTtcbiAgfVxufVxuXG5jb25zdCBwcm9wcyA9IHtcbiAgb3JpZW50YXRpb246IEd0ay5PcmllbnRhdGlvbi5IT1JJWk9OVEFMLFxuICBzcGFjaW5nOiAxMixcbiAgaGV4cGFuZDogdHJ1ZSxcbn07XG5cbmV4cG9ydCBjbGFzcyBTdHlsZVNlbGVjdG9yIGV4dGVuZHMgR3RrLkJveCB7XG4gIGJveDEgPSBuZXcgR3RrLkJveChwcm9wcyk7XG4gIGJveDIgPSBuZXcgR3RrLkJveChwcm9wcyk7XG4gIGJveCA9IG5ldyBHdGsuQm94KHtcbiAgICBvcmllbnRhdGlvbjogR3RrLk9yaWVudGF0aW9uLlZFUlRJQ0FMLFxuICAgIHNwYWNpbmc6IDEyLFxuICB9KTtcblxuICBwcml2YXRlIF9zdHlsZTogU3R5bGU7XG5cbiAgZ2V0IHN0eWxlKCkge1xuICAgIHJldHVybiB0aGlzLl9zdHlsZTtcbiAgfVxuXG4gIHNldCBzdHlsZShzdHlsZTogU3R5bGUpIHtcbiAgICBpZiAodGhpcy5fc3R5bGUgPT09IHN0eWxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fc3R5bGUgPSBzdHlsZTtcbiAgICB0aGlzLm5vdGlmeShcInN0eWxlXCIpO1xuICAgIHRoaXMuZW1pdChcInN0eWxlLWNoYW5nZWRcIiwgc3R5bGUpO1xuICB9XG5cbiAgY29uc3RydWN0b3IocGFyYW1zOiB7IHN0eWxlPzogU3R5bGUgfSA9IHt9KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuYm94LmFwcGVuZCh0aGlzLmJveDEpO1xuICAgIHRoaXMuYm94LmFwcGVuZCh0aGlzLmJveDIpO1xuXG4gICAgdGhpcy5hcHBlbmQodGhpcy5ib3gpO1xuXG4gICAgdGhpcy5fc3R5bGUgPSB0aGlzLnN0eWxlID0gcGFyYW1zLnN0eWxlID8/IFN0eWxlLnllbGxvdztcbiAgICB0aGlzLmJ1aWxkX3N0eWxlcygpO1xuICAgIHRoaXMuaGV4cGFuZCA9IHRydWU7XG5cbiAgICBpZiAoIXByb3ZpZGVyKSB7XG4gICAgICBwcm92aWRlciA9IG5ldyBHdGsuQ3NzUHJvdmlkZXIoKTtcbiAgICAgIHByb3ZpZGVyLmxvYWRfZnJvbV9yZXNvdXJjZShcbiAgICAgICAgXCIvY29tL3ZpeGFsaWVuL3N0aWNreS9zdHlsZS1zZWxlY3Rvci5jc3NcIixcbiAgICAgICk7XG4gICAgICBHdGsuU3R5bGVDb250ZXh0LmFkZF9wcm92aWRlcl9mb3JfZGlzcGxheShcbiAgICAgICAgR2RrLkRpc3BsYXkuZ2V0X2RlZmF1bHQoKSEsXG4gICAgICAgIHByb3ZpZGVyLFxuICAgICAgICBHdGsuU1RZTEVfUFJPVklERVJfUFJJT1JJVFlfQVBQTElDQVRJT04sXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGJ1aWxkX3N0eWxlcygpIHtcbiAgICBsZXQgZ3JvdXA6IEd0ay5DaGVja0J1dHRvbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICAgIHN0eWxlcy5mb3JFYWNoKChzdHlsZSwgaSkgPT4ge1xuICAgICAgY29uc3QgYnV0dG9uID0gbmV3IFN0eWxlQnV0dG9uKHN0eWxlLCBncm91cCk7XG4gICAgICBidXR0b24uYWN0aXZlID0gc3R5bGUgPT09IHRoaXMuc3R5bGU7XG4gICAgICBidXR0b24uY29ubmVjdChcInRvZ2dsZWRcIiwgKCkgPT4ge1xuICAgICAgICBpZiAoYnV0dG9uLmFjdGl2ZSkge1xuICAgICAgICAgIHRoaXMuc3R5bGUgPSBzdHlsZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpZiAoIWdyb3VwKSB7XG4gICAgICAgIGdyb3VwID0gYnV0dG9uO1xuICAgICAgfVxuXG4gICAgICAoaSA8IDQgPyB0aGlzLmJveDEgOiB0aGlzLmJveDIpLmFwcGVuZChidXR0b24pO1xuICAgIH0pO1xuICB9XG5cbiAgc3RhdGljIHtcbiAgICBHT2JqZWN0LnJlZ2lzdGVyQ2xhc3Moe1xuICAgICAgQ3NzTmFtZTogXCJzdHlsZXNlbGVjdG9yXCIsXG4gICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgIHN0eWxlOiBHT2JqZWN0LlBhcmFtU3BlYy5zdHJpbmcoXG4gICAgICAgICAgXCJzdHlsZVwiLFxuICAgICAgICAgIFwiU3R5bGVcIixcbiAgICAgICAgICBcIlRoZSBjdXJyZW50IHN0eWxlXCIsXG4gICAgICAgICAgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSxcbiAgICAgICAgICBcIndpbmRvd1wiLFxuICAgICAgICApLFxuICAgICAgfSxcbiAgICAgIFNpZ25hbHM6IHtcbiAgICAgICAgXCJzdHlsZS1jaGFuZ2VkXCI6IHtcbiAgICAgICAgICBwYXJhbV90eXBlczogW0dPYmplY3QuVFlQRV9VSU5UXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSwgdGhpcyk7XG4gIH1cbn1cbiIsICIvKiBNSVQgTGljZW5zZVxuICpcbiAqIENvcHlyaWdodCAoYykgMjAyMyBBbmdlbG8gVmVybGFpbiwgQ2hyaXMgRGF2aXNcbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gKiBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAqIFNPRlRXQVJFLlxuICpcbiAqIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBNSVRcbiAqL1xuXG5pbXBvcnQgR2lvIGZyb20gXCJnaTovL0dpb1wiO1xuaW1wb3J0IEdMaWIgZnJvbSBcImdpOi8vR0xpYlwiO1xuXG5pbXBvcnQgeyBtYXJrZG93blRvTm90ZURhdGEsIG5vdGVUb01hcmtkb3duIH0gZnJvbSBcIi4vbWFya2Rvd24uanNcIjtcbmltcG9ydCB7IGVuc3VyZV9kaXIsIGxpc3RfZmlsZXMgfSBmcm9tIFwiLi9zdG9yZS5qc1wiO1xuaW1wb3J0IHsgTm90ZSwgc2V0dGluZ3MgfSBmcm9tIFwiLi91dGlsLmpzXCI7XG5cbmNvbnN0IGRlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoKTtcbmNvbnN0IGVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKTtcblxuZXhwb3J0IGNsYXNzIE1pcnJvck1hbmFnZXIge1xuICBwcml2YXRlIG1vbml0b3I6IEdpby5GaWxlTW9uaXRvciB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGlnbm9yZVNldCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBwcml2YXRlIGdldF9ub3RlczogKCkgPT4gTm90ZVtdO1xuICBwcml2YXRlIG9uX25vdGVfYWRkZWQ/OiAobm90ZTogTm90ZSkgPT4gdm9pZDtcbiAgcHJpdmF0ZSBpc191cGRhdGluZ19mcm9tX2Rpc2sgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBnZXRfbm90ZXM6ICgpID0+IE5vdGVbXSxcbiAgICBvbl9ub3RlX2FkZGVkPzogKG5vdGU6IE5vdGUpID0+IHZvaWQsXG4gICkge1xuICAgIHRoaXMuZ2V0X25vdGVzID0gZ2V0X25vdGVzO1xuICAgIHRoaXMub25fbm90ZV9hZGRlZCA9IG9uX25vdGVfYWRkZWQ7XG5cbiAgICBzZXR0aW5ncy5jb25uZWN0KFwiY2hhbmdlZDo6bWlycm9yLWVuYWJsZWRcIiwgKCkgPT4gdGhpcy5zZXR1cCgpKTtcbiAgICBzZXR0aW5ncy5jb25uZWN0KFwiY2hhbmdlZDo6bWlycm9yLWRpcmVjdG9yeVwiLCAoKSA9PiB0aGlzLnNldHVwKCkpO1xuXG4gICAgdGhpcy5zZXR1cCgpO1xuICB9XG5cbiAgZ2V0IGlzX2VuYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgY29uc3QgZW5hYmxlZCA9IHNldHRpbmdzLmdldF9ib29sZWFuKFwibWlycm9yLWVuYWJsZWRcIik7XG4gICAgY29uc3QgZGlyUGF0aCA9IHNldHRpbmdzLmdldF9zdHJpbmcoXCJtaXJyb3ItZGlyZWN0b3J5XCIpO1xuICAgIHJldHVybiBlbmFibGVkICYmIGRpclBhdGgudHJpbSgpLmxlbmd0aCA+IDA7XG4gIH1cblxuICBnZXQgbWlycm9yX2RpcigpOiBHaW8uRmlsZSB8IG51bGwge1xuICAgIGNvbnN0IGRpclBhdGggPSBzZXR0aW5ncy5nZXRfc3RyaW5nKFwibWlycm9yLWRpcmVjdG9yeVwiKTtcbiAgICBpZiAoIWRpclBhdGggfHwgZGlyUGF0aC50cmltKCkubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gR2lvLmZpbGVfbmV3X2Zvcl9wYXRoKGRpclBhdGgpO1xuICB9XG5cbiAgc2V0dXAoKSB7XG4gICAgaWYgKHRoaXMubW9uaXRvcikge1xuICAgICAgdGhpcy5tb25pdG9yLmNhbmNlbCgpO1xuICAgICAgdGhpcy5tb25pdG9yID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuaXNfZW5hYmxlZCkgcmV0dXJuO1xuXG4gICAgY29uc3QgZGlyID0gdGhpcy5taXJyb3JfZGlyO1xuICAgIGlmICghZGlyKSByZXR1cm47XG5cbiAgICB0cnkge1xuICAgICAgZW5zdXJlX2RpcihkaXIpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gY3JlYXRlIG1pcnJvciBkaXJlY3Rvcnk6XCIsIGUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICB0aGlzLm1vbml0b3IgPSBkaXIubW9uaXRvcl9kaXJlY3RvcnkoXG4gICAgICAgIEdpby5GaWxlTW9uaXRvckZsYWdzLk5PTkUsXG4gICAgICAgIG51bGwsXG4gICAgICApO1xuICAgICAgdGhpcy5tb25pdG9yLmNvbm5lY3QoXG4gICAgICAgIFwiY2hhbmdlZFwiLFxuICAgICAgICAoX21vbiwgZmlsZSwgX290aGVyLCBldmVudCkgPT4ge1xuICAgICAgICAgIHRoaXMuaGFuZGxlX2ZpbGVfZXZlbnQoZmlsZSwgZXZlbnQpO1xuICAgICAgICB9LFxuICAgICAgKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIHNldCB1cCBmaWxlIG1vbml0b3IgZm9yIG1pcnJvciBkaXJlY3Rvcnk6XCIsIGUpO1xuICAgIH1cblxuICAgIC8vIEluaXRpYWwgc3luYyBvZiBleGlzdGluZyBub3RlcyB0byBtaXJyb3IgZGlyZWN0b3J5XG4gICAgdGhpcy5zeW5jX2FsbF90b19taXJyb3IoKTtcbiAgICAvLyBBbHNvIGxvYWQgZXh0ZXJuYWwgZmlsZXMgZnJvbSBtaXJyb3IgZGlyZWN0b3J5XG4gICAgdGhpcy5zeW5jX2FsbF9mcm9tX21pcnJvcigpO1xuICB9XG5cbiAgc3luY19hbGxfdG9fbWlycm9yKCkge1xuICAgIGlmICghdGhpcy5pc19lbmFibGVkKSByZXR1cm47XG4gICAgY29uc3Qgbm90ZXMgPSB0aGlzLmdldF9ub3RlcygpO1xuICAgIG5vdGVzLmZvckVhY2goKG5vdGUpID0+IHRoaXMuc2F2ZV9ub3RlKG5vdGUpKTtcbiAgfVxuXG4gIHN5bmNfYWxsX2Zyb21fbWlycm9yKCkge1xuICAgIGlmICghdGhpcy5pc19lbmFibGVkKSByZXR1cm47XG4gICAgY29uc3QgZGlyID0gdGhpcy5taXJyb3JfZGlyO1xuICAgIGlmICghZGlyKSByZXR1cm47XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgZmlsZXMgPSBsaXN0X2ZpbGVzKGRpcik7XG4gICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICAgICAgY29uc3QgYmFzZW5hbWUgPSBmaWxlLmdldF9iYXNlbmFtZSgpITtcbiAgICAgICAgaWYgKGJhc2VuYW1lLmVuZHNXaXRoKFwiLm1kXCIpKSB7XG4gICAgICAgICAgdGhpcy5yZWFkX2FuZF91cGRhdGVfbm90ZV9maWxlKGZpbGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBzeW5jIGZyb20gbWlycm9yIGRpcmVjdG9yeTpcIiwgZSk7XG4gICAgfVxuICB9XG5cbiAgc2F2ZV9ub3RlKG5vdGU6IE5vdGUpIHtcbiAgICBpZiAoIXRoaXMuaXNfZW5hYmxlZCB8fCB0aGlzLmlzX3VwZGF0aW5nX2Zyb21fZGlzaykgcmV0dXJuO1xuXG4gICAgY29uc3QgZGlyID0gdGhpcy5taXJyb3JfZGlyO1xuICAgIGlmICghZGlyKSByZXR1cm47XG5cbiAgICBlbnN1cmVfZGlyKGRpcik7XG5cbiAgICBjb25zdCBmaWxlID0gZGlyLmdldF9jaGlsZChgJHtub3RlLnV1aWR9Lm1kYCk7XG4gICAgY29uc3QgcGF0aCA9IGZpbGUuZ2V0X3BhdGgoKTtcbiAgICBpZiAocGF0aCkge1xuICAgICAgdGhpcy5pZ25vcmVTZXQuYWRkKHBhdGgpO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbnRlbnQgPSBub3RlVG9NYXJrZG93bihub3RlKTtcblxuICAgIHRyeSB7XG4gICAgICBmaWxlLnJlcGxhY2VfY29udGVudHMoXG4gICAgICAgIGVuY29kZXIuZW5jb2RlKGNvbnRlbnQpLFxuICAgICAgICBudWxsLFxuICAgICAgICBmYWxzZSxcbiAgICAgICAgR2lvLkZpbGVDcmVhdGVGbGFncy5OT05FLFxuICAgICAgICBudWxsLFxuICAgICAgKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBGYWlsZWQgdG8gc2F2ZSBub3RlICR7bm90ZS51dWlkfSB0byBtaXJyb3I6YCwgZSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChwYXRoKSB7XG4gICAgICAgIEdMaWIudGltZW91dF9hZGQoR0xpYi5QUklPUklUWV9ERUZBVUxULCA1MDAsICgpID0+IHtcbiAgICAgICAgICB0aGlzLmlnbm9yZVNldC5kZWxldGUocGF0aCk7XG4gICAgICAgICAgcmV0dXJuIEdMaWIuU09VUkNFX1JFTU9WRTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZGVsZXRlX25vdGUodXVpZDogc3RyaW5nKSB7XG4gICAgaWYgKCF0aGlzLmlzX2VuYWJsZWQgfHwgdGhpcy5pc191cGRhdGluZ19mcm9tX2Rpc2spIHJldHVybjtcblxuICAgIGNvbnN0IGRpciA9IHRoaXMubWlycm9yX2RpcjtcbiAgICBpZiAoIWRpcikgcmV0dXJuO1xuXG4gICAgY29uc3QgZmlsZSA9IGRpci5nZXRfY2hpbGQoYCR7dXVpZH0ubWRgKTtcbiAgICBjb25zdCBwYXRoID0gZmlsZS5nZXRfcGF0aCgpO1xuICAgIGlmIChwYXRoKSB7XG4gICAgICB0aGlzLmlnbm9yZVNldC5hZGQocGF0aCk7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGlmIChmaWxlLnF1ZXJ5X2V4aXN0cyhudWxsKSkge1xuICAgICAgICBmaWxlLmRlbGV0ZShudWxsKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBGYWlsZWQgdG8gZGVsZXRlIG5vdGUgJHt1dWlkfSBmcm9tIG1pcnJvcjpgLCBlKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKHBhdGgpIHtcbiAgICAgICAgR0xpYi50aW1lb3V0X2FkZChHTGliLlBSSU9SSVRZX0RFRkFVTFQsIDUwMCwgKCkgPT4ge1xuICAgICAgICAgIHRoaXMuaWdub3JlU2V0LmRlbGV0ZShwYXRoKTtcbiAgICAgICAgICByZXR1cm4gR0xpYi5TT1VSQ0VfUkVNT1ZFO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGhhbmRsZV9maWxlX2V2ZW50KGZpbGU6IEdpby5GaWxlLCBldmVudDogR2lvLkZpbGVNb25pdG9yRXZlbnQpIHtcbiAgICBjb25zdCBwYXRoID0gZmlsZS5nZXRfcGF0aCgpO1xuICAgIGlmIChwYXRoICYmIHRoaXMuaWdub3JlU2V0LmhhcyhwYXRoKSkgcmV0dXJuO1xuXG4gICAgY29uc3QgYmFzZW5hbWUgPSBmaWxlLmdldF9iYXNlbmFtZSgpO1xuICAgIGlmICghYmFzZW5hbWUgfHwgIWJhc2VuYW1lLmVuZHNXaXRoKFwiLm1kXCIpKSByZXR1cm47XG5cbiAgICBpZiAoXG4gICAgICBldmVudCA9PT0gR2lvLkZpbGVNb25pdG9yRXZlbnQuQ0hBTkdFRCB8fFxuICAgICAgZXZlbnQgPT09IEdpby5GaWxlTW9uaXRvckV2ZW50LkNIQU5HRVNfRE9ORV9ISU5UIHx8XG4gICAgICBldmVudCA9PT0gR2lvLkZpbGVNb25pdG9yRXZlbnQuQ1JFQVRFRFxuICAgICkge1xuICAgICAgdGhpcy5yZWFkX2FuZF91cGRhdGVfbm90ZV9maWxlKGZpbGUpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcmVhZF9hbmRfdXBkYXRlX25vdGVfZmlsZShmaWxlOiBHaW8uRmlsZSkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIWZpbGUucXVlcnlfZXhpc3RzKG51bGwpKSByZXR1cm47XG4gICAgICBjb25zdCBbb2ssIGNvbnRlbnRzXSA9IGZpbGUubG9hZF9jb250ZW50cyhudWxsKTtcbiAgICAgIGlmICghb2spIHJldHVybjtcblxuICAgICAgY29uc3QgdGV4dCA9IGRlY29kZXIuZGVjb2RlKGNvbnRlbnRzKTtcbiAgICAgIGNvbnN0IG5vdGVEYXRhID0gbWFya2Rvd25Ub05vdGVEYXRhKHRleHQpO1xuXG4gICAgICBjb25zdCBiYXNlbmFtZSA9IGZpbGUuZ2V0X2Jhc2VuYW1lKCkhO1xuICAgICAgY29uc3QgZmlsZW5hbWVVdWlkID0gYmFzZW5hbWUuc2xpY2UoMCwgLTMpO1xuXG4gICAgICBjb25zdCB1dWlkID0gbm90ZURhdGEudXVpZCB8fCBmaWxlbmFtZVV1aWQ7XG5cbiAgICAgIGlmICghdXVpZCkgcmV0dXJuO1xuXG4gICAgICBjb25zdCBub3RlcyA9IHRoaXMuZ2V0X25vdGVzKCk7XG4gICAgICBjb25zdCBleGlzdGluZ05vdGUgPSBub3Rlcy5maW5kKChuKSA9PiBuLnV1aWQgPT09IHV1aWQpO1xuXG4gICAgICB0aGlzLmlzX3VwZGF0aW5nX2Zyb21fZGlzayA9IHRydWU7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChleGlzdGluZ05vdGUpIHtcbiAgICAgICAgICBpZiAobm90ZURhdGEuY29udGVudCAhPT0gdW5kZWZpbmVkICYmIGV4aXN0aW5nTm90ZS5jb250ZW50ICE9PSBub3RlRGF0YS5jb250ZW50KSB7XG4gICAgICAgICAgICBleGlzdGluZ05vdGUuY29udGVudCA9IG5vdGVEYXRhLmNvbnRlbnQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChub3RlRGF0YS50aXRsZSAhPT0gdW5kZWZpbmVkICYmIGV4aXN0aW5nTm90ZS50aXRsZSAhPT0gbm90ZURhdGEudGl0bGUpIHtcbiAgICAgICAgICAgIGV4aXN0aW5nTm90ZS50aXRsZSA9IG5vdGVEYXRhLnRpdGxlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobm90ZURhdGEuc3R5bGUgIT09IHVuZGVmaW5lZCAmJiBleGlzdGluZ05vdGUuc3R5bGUgIT09IG5vdGVEYXRhLnN0eWxlKSB7XG4gICAgICAgICAgICBleGlzdGluZ05vdGUuc3R5bGUgPSBub3RlRGF0YS5zdHlsZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG5vdGVEYXRhLnRhZ3MgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZXhpc3RpbmdOb3RlLnRhZ3MgPSBub3RlRGF0YS50YWdzO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobm90ZURhdGEubW9kaWZpZWQpIHtcbiAgICAgICAgICAgIGV4aXN0aW5nTm90ZS5tb2RpZmllZCA9IEdMaWIuRGF0ZVRpbWUubmV3X2Zyb21faXNvODYwMShcbiAgICAgICAgICAgICAgbmV3IERhdGUobm90ZURhdGEubW9kaWZpZWQpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobm90ZURhdGEud2lkdGggIT09IHVuZGVmaW5lZCkgZXhpc3RpbmdOb3RlLndpZHRoID0gbm90ZURhdGEud2lkdGg7XG4gICAgICAgICAgaWYgKG5vdGVEYXRhLmhlaWdodCAhPT0gdW5kZWZpbmVkKSBleGlzdGluZ05vdGUuaGVpZ2h0ID0gbm90ZURhdGEuaGVpZ2h0O1xuICAgICAgICAgIGlmIChub3RlRGF0YS5vcGVuICE9PSB1bmRlZmluZWQgJiYgZXhpc3RpbmdOb3RlLm9wZW4gIT09IG5vdGVEYXRhLm9wZW4pIHtcbiAgICAgICAgICAgIGV4aXN0aW5nTm90ZS5vcGVuID0gbm90ZURhdGEub3BlbjtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gTmV3IG5vdGUgY3JlYXRlZCBleHRlcm5hbGx5XG4gICAgICAgICAgY29uc3QgbmV3Tm90ZSA9IG5ldyBOb3RlKHtcbiAgICAgICAgICAgIHY6IG5vdGVEYXRhLnYgPz8gMSxcbiAgICAgICAgICAgIHV1aWQ6IHV1aWQsXG4gICAgICAgICAgICBjb250ZW50OiBub3RlRGF0YS5jb250ZW50ID8/IFwiXCIsXG4gICAgICAgICAgICB0aXRsZTogbm90ZURhdGEudGl0bGUgPz8gXCJcIixcbiAgICAgICAgICAgIHN0eWxlOiBub3RlRGF0YS5zdHlsZSA/PyAxLFxuICAgICAgICAgICAgdGFnczogbm90ZURhdGEudGFncyA/PyBbXSxcbiAgICAgICAgICAgIG1vZGlmaWVkOiBub3RlRGF0YS5tb2RpZmllZCA/PyBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgd2lkdGg6IG5vdGVEYXRhLndpZHRoID8/IDMwMCxcbiAgICAgICAgICAgIGhlaWdodDogbm90ZURhdGEuaGVpZ2h0ID8/IDMwMCxcbiAgICAgICAgICAgIG9wZW46IG5vdGVEYXRhLm9wZW4gPz8gZmFsc2UsXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBpZiAodGhpcy5vbl9ub3RlX2FkZGVkKSB7XG4gICAgICAgICAgICB0aGlzLm9uX25vdGVfYWRkZWQobmV3Tm90ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB0aGlzLmlzX3VwZGF0aW5nX2Zyb21fZGlzayA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciByZWFkaW5nIG1pcnJvciBub3RlIGZpbGU6XCIsIGUpO1xuICAgIH1cbiAgfVxufVxuIiwgIi8qIE1JVCBMaWNlbnNlXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDIzIEFuZ2VsbyBWZXJsYWluLCBDaHJpcyBEYXZpc1xuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbiAqIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuICogU09GVFdBUkUuXG4gKlxuICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IE1JVFxuICovXG5cbmltcG9ydCB7IElOb3RlLCBJVGFnLCBOb3RlIH0gZnJvbSBcIi4vdXRpbC5qc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gbm90ZVRvTWFya2Rvd24obm90ZTogTm90ZSk6IHN0cmluZyB7XG4gIGNvbnN0IGRhdGEgPSBub3RlLnRvSlNPTigpO1xuICBjb25zdCBmcm9udG1hdHRlck9iaiA9IHtcbiAgICB2OiBkYXRhLnYsXG4gICAgdXVpZDogZGF0YS51dWlkLFxuICAgIHRpdGxlOiBkYXRhLnRpdGxlLFxuICAgIHN0eWxlOiBkYXRhLnN0eWxlLFxuICAgIHRhZ3M6IGRhdGEudGFncyxcbiAgICBtb2RpZmllZDogbmV3IERhdGUoZGF0YS5tb2RpZmllZCkudG9JU09TdHJpbmcoKSxcbiAgICB3aWR0aDogZGF0YS53aWR0aCxcbiAgICBoZWlnaHQ6IGRhdGEuaGVpZ2h0LFxuICAgIG9wZW46IGRhdGEub3BlbixcbiAgfTtcblxuICBjb25zdCB5YW1sTGluZXMgPSBbXG4gICAgXCItLS1cIixcbiAgICBgdjogJHtmcm9udG1hdHRlck9iai52fWAsXG4gICAgYHV1aWQ6ICR7SlNPTi5zdHJpbmdpZnkoZnJvbnRtYXR0ZXJPYmoudXVpZCl9YCxcbiAgICBgdGl0bGU6ICR7SlNPTi5zdHJpbmdpZnkoZnJvbnRtYXR0ZXJPYmoudGl0bGUpfWAsXG4gICAgYHN0eWxlOiAke2Zyb250bWF0dGVyT2JqLnN0eWxlfWAsXG4gICAgYHRhZ3M6ICR7SlNPTi5zdHJpbmdpZnkoZnJvbnRtYXR0ZXJPYmoudGFncyl9YCxcbiAgICBgbW9kaWZpZWQ6ICR7SlNPTi5zdHJpbmdpZnkoZnJvbnRtYXR0ZXJPYmoubW9kaWZpZWQpfWAsXG4gICAgYHdpZHRoOiAke2Zyb250bWF0dGVyT2JqLndpZHRofWAsXG4gICAgYGhlaWdodDogJHtmcm9udG1hdHRlck9iai5oZWlnaHR9YCxcbiAgICBgb3BlbjogJHtmcm9udG1hdHRlck9iai5vcGVufWAsXG4gICAgXCItLS1cIixcbiAgXTtcblxuICByZXR1cm4gYCR7eWFtbExpbmVzLmpvaW4oXCJcXG5cIil9XFxuJHtkYXRhLmNvbnRlbnR9YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hcmtkb3duVG9Ob3RlRGF0YSh0ZXh0OiBzdHJpbmcpOiBQYXJ0aWFsPElOb3RlPiB7XG4gIGNvbnN0IG5vcm1hbGl6ZWQgPSB0ZXh0LnJlcGxhY2UoL1xcclxcbi9nLCBcIlxcblwiKTtcbiAgY29uc3QgbWF0Y2ggPSBub3JtYWxpemVkLm1hdGNoKC9eLS0tXFxuKFtcXHNcXFNdKj8pXFxuLS0tXFxuPyhbXFxzXFxTXSopJC8pO1xuXG4gIGlmICghbWF0Y2gpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29udGVudDogdGV4dCxcbiAgICB9O1xuICB9XG5cbiAgY29uc3QgWywgZnJvbnRtYXR0ZXJSYXcsIGNvbnRlbnRdID0gbWF0Y2g7XG4gIGNvbnN0IGZyb250bWF0dGVyRGF0YTogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9O1xuXG4gIGNvbnN0IGxpbmVzID0gZnJvbnRtYXR0ZXJSYXcuc3BsaXQoXCJcXG5cIik7XG4gIGxldCBjdXJyZW50S2V5OiBzdHJpbmcgfCBudWxsID0gbnVsbDtcblxuICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICBjb25zdCB0cmltbWVkID0gbGluZS50cmltKCk7XG4gICAgaWYgKCF0cmltbWVkIHx8IHRyaW1tZWQuc3RhcnRzV2l0aChcIiNcIikpIGNvbnRpbnVlO1xuXG4gICAgY29uc3QgY29sb25JbmRleCA9IGxpbmUuaW5kZXhPZihcIjpcIik7XG4gICAgaWYgKGNvbG9uSW5kZXggIT09IC0xICYmICFsaW5lLnN1YnN0cmluZygwLCBjb2xvbkluZGV4KS5pbmNsdWRlcyhcIiBcIikpIHtcbiAgICAgIGNvbnN0IGtleSA9IGxpbmUuc3Vic3RyaW5nKDAsIGNvbG9uSW5kZXgpLnRyaW0oKTtcbiAgICAgIGNvbnN0IHJhd1ZhbCA9IGxpbmUuc3Vic3RyaW5nKGNvbG9uSW5kZXggKyAxKS50cmltKCk7XG4gICAgICBjdXJyZW50S2V5ID0ga2V5O1xuXG4gICAgICBpZiAocmF3VmFsLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBmcm9udG1hdHRlckRhdGFba2V5XSA9IEpTT04ucGFyc2UocmF3VmFsKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgaWYgKHJhd1ZhbCA9PT0gXCJ0cnVlXCIpIGZyb250bWF0dGVyRGF0YVtrZXldID0gdHJ1ZTtcbiAgICAgICAgICBlbHNlIGlmIChyYXdWYWwgPT09IFwiZmFsc2VcIikgZnJvbnRtYXR0ZXJEYXRhW2tleV0gPSBmYWxzZTtcbiAgICAgICAgICBlbHNlIGlmICghaXNOYU4oTnVtYmVyKHJhd1ZhbCkpICYmIHJhd1ZhbCAhPT0gXCJcIikgZnJvbnRtYXR0ZXJEYXRhW2tleV0gPSBOdW1iZXIocmF3VmFsKTtcbiAgICAgICAgICBlbHNlIGZyb250bWF0dGVyRGF0YVtrZXldID0gcmF3VmFsLnJlcGxhY2UoL15bXCInXXxbXCInXSQvZywgXCJcIik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZyb250bWF0dGVyRGF0YVtrZXldID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjb25zdCByZXM6IFBhcnRpYWw8SU5vdGU+ID0ge1xuICAgIGNvbnRlbnQ6IGNvbnRlbnQsXG4gIH07XG5cbiAgaWYgKHR5cGVvZiBmcm9udG1hdHRlckRhdGEudiA9PT0gXCJudW1iZXJcIikgcmVzLnYgPSBmcm9udG1hdHRlckRhdGEudiBhcyAxO1xuICBpZiAodHlwZW9mIGZyb250bWF0dGVyRGF0YS51dWlkID09PSBcInN0cmluZ1wiKSByZXMudXVpZCA9IGZyb250bWF0dGVyRGF0YS51dWlkO1xuICBpZiAodHlwZW9mIGZyb250bWF0dGVyRGF0YS50aXRsZSA9PT0gXCJzdHJpbmdcIikgcmVzLnRpdGxlID0gZnJvbnRtYXR0ZXJEYXRhLnRpdGxlO1xuICBpZiAodHlwZW9mIGZyb250bWF0dGVyRGF0YS5zdHlsZSA9PT0gXCJudW1iZXJcIikgcmVzLnN0eWxlID0gZnJvbnRtYXR0ZXJEYXRhLnN0eWxlO1xuICBpZiAoQXJyYXkuaXNBcnJheShmcm9udG1hdHRlckRhdGEudGFncykpIHJlcy50YWdzID0gZnJvbnRtYXR0ZXJEYXRhLnRhZ3MgYXMgSVRhZ1tdO1xuICBpZiAoZnJvbnRtYXR0ZXJEYXRhLm1vZGlmaWVkKSByZXMubW9kaWZpZWQgPSBuZXcgRGF0ZShmcm9udG1hdHRlckRhdGEubW9kaWZpZWQpO1xuICBpZiAodHlwZW9mIGZyb250bWF0dGVyRGF0YS53aWR0aCA9PT0gXCJudW1iZXJcIikgcmVzLndpZHRoID0gZnJvbnRtYXR0ZXJEYXRhLndpZHRoO1xuICBpZiAodHlwZW9mIGZyb250bWF0dGVyRGF0YS5oZWlnaHQgPT09IFwibnVtYmVyXCIpIHJlcy5oZWlnaHQgPSBmcm9udG1hdHRlckRhdGEuaGVpZ2h0O1xuICBpZiAodHlwZW9mIGZyb250bWF0dGVyRGF0YS5vcGVuID09PSBcImJvb2xlYW5cIikgcmVzLm9wZW4gPSBmcm9udG1hdHRlckRhdGEub3BlbjtcblxuICByZXR1cm4gcmVzO1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQXlCQSxPQUFPQSxjQUFhO0FBQ3BCLE9BQU9DLFVBQVM7QUFDaEIsT0FBT0MsVUFBUztBQUNoQixPQUFPQyxXQUFVO0FBQ2pCLE9BQU9DLFVBQVM7QUFDaEIsT0FBT0MsVUFBUzs7O0FDTGhCLE9BQU9DLGNBQWE7QUFDcEIsT0FBT0MsVUFBUztBQUNoQixPQUFPQyxVQUFTOzs7QUNGaEIsT0FBT0MsY0FBYTtBQUNwQixPQUFPQyxVQUFTO0FBQ2hCLE9BQU9DLFdBQVU7OztBQ0ZqQixPQUFPLFNBQVM7QUFDaEIsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sVUFBVTtBQUNqQixPQUFPLGFBQWE7QUFHcEIsSUFBSTtBQUFBLEVBQ0YsSUFBSSxLQUFLO0FBQUEsRUFDVDtBQUFBLEVBQ0E7QUFDRjtBQUVBLElBQUk7QUFBQSxFQUNGLElBQUksS0FBSztBQUFBLEVBQ1Q7QUFBQSxFQUNB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QztBQUVELFNBQUssYUFBYSxLQUFLLE1BQU07QUFFN0IsV0FBTyxlQUFlLEtBQUssZUFBZSxDQUFDO0FBRTNDLFdBQU8sUUFBUSxpQkFBaUIsTUFBTTtBQXRsQjFDO0FBMGxCTSxVQUFJLEVBQUUsS0FBSyxhQUFhLFdBQVcsS0FBSyxDQUFDLEtBQUssU0FBUztBQUNyRCxhQUFLLE9BQU87QUFBQSxNQUNkO0FBRUEsV0FBSyxlQUFlLEtBQUssYUFBYSxPQUFPLENBQUMsUUFBUSxRQUFRLE1BQU07QUFDcEUsaUJBQUssV0FBTCxtQkFBYSxpQkFBaUIsS0FBTSxNQUFNO0FBQzFDLGFBQU87QUFBQSxJQUNULENBQUM7QUFFRCxXQUFPLFFBQVEsV0FBVyxDQUFDSCxJQUFHSSxVQUFTO0FBQ3JDLFdBQUssWUFBWUEsS0FBSTtBQUFBLElBQ3ZCLENBQUM7QUFFRCxRQUFJLEtBQUssU0FBUztBQUFPLFdBQUssT0FBTztBQUVyQyxXQUFPLFFBQVE7QUFBQSxFQUNqQjtBQUFBLEVBRUEsZ0JBQWdCO0FBQ2QsVUFBTSxjQUFjO0FBRXBCLFVBQU0sZ0JBQWdCUCxLQUFJLGFBQWEsWUFBWTtBQUNuRCxhQUFTLGlCQUFpQjtBQUN4QixZQUFNLGVBQWUsU0FBUyxRQUFRLGNBQWM7QUFDcEQsb0JBQWMsaUJBQWlCLFlBQVk7QUFBQSxJQUM3QztBQUNBLG1CQUFlO0FBQ2YsYUFBUyxRQUFRLHlCQUF5QixjQUFjO0FBQUEsRUFDMUQ7QUFDRjtBQTNrQk8sSUFBTSxjQUFOO0FBQUEsQ0FLTCxNQUFPO0FBQ0wsRUFBQVEsU0FBUSxjQUFjLFlBQUk7QUFDNUI7IiwKICAibmFtZXMiOiBbIkdPYmplY3QiLCAiR2lvIiwgIkFkdyIsICJHTGliIiwgIkd0ayIsICJHZGsiLCAiR09iamVjdCIsICJHdGsiLCAiQWR3IiwgIkdPYmplY3QiLCAiR3RrIiwgIkdMaWIiLCAiU3R5bGUiLCAiXyIsICJHT2JqZWN0IiwgIkFkdyIsICJuZXh0U3RhdGUiLCAic2NoZW1lIiwgInByb3BzIiwgIkFkdyIsICJHT2JqZWN0IiwgImNoYXJzIiwgIkd0ayIsICJHTGliIiwgIkdPYmplY3QiLCAiR09iamVjdCIsICJHdGsiLCAiQWR3IiwgInByb3ZpZGVyIiwgIkFkdyIsICJHdGsiLCAiXyIsICJjYXJkIiwgIkdPYmplY3QiLCAiR2lvIiwgIkdMaWIiLCAiR2lvIiwgIkdMaWIiLCAiXyIsICJub3RlIiwgIkdPYmplY3QiLCAiQWR3IiwgIkdpbyIsICJHTGliIiwgIkdPYmplY3QiLCAiR3RrIiwgIkdkayIsICJHdGsiLCAiR09iamVjdCIsICJHZGsiLCAiQWR3IiwgIkdPYmplY3QiLCAiXyIsICJHTGliIiwgIkdpbyIsICJHaW8iLCAiR0xpYiIsICJkZWNvZGVyIiwgImVuY29kZXIiLCAiR2lvIiwgIkdMaWIiLCAiQWR3IiwgIkdpbyIsICJHTGliIiwgIl8iLCAiR3RrIiwgIkdkayIsICJ3aW5kb3ciLCAidXVpZCIsICJHT2JqZWN0Il0KfQo=
