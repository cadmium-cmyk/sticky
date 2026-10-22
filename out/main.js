// src/application.ts
import GObject9 from "gi://GObject";
import Gio4 from "gi://Gio";
import Adw7 from "gi://Adw";
import GLib5 from "gi://GLib";
import Gtk7 from "gi://Gtk?version=4.0";
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
function get_notes_dir() {
  const path = SETTINGS.NOTES_PATH;
  if (path && path.trim() !== "") {
    return Gio2.file_new_for_path(path);
  }
  return Gio2.file_new_for_path(
    GLib3.build_filenamev([GLib3.get_user_data_dir(), pkg.name, "notes"])
  );
}
var NotesDir = Gio2.file_new_for_path(
  GLib3.build_filenamev([GLib3.get_user_data_dir(), pkg.name])
);
var Notes = Gio2.file_new_for_path(
  GLib3.build_filenamev([NotesDir.get_path(), "notes.json"])
);
var load_file = (file) => {
  try {
    const parent = file.get_parent();
    if (parent) {
      parent.make_directory_with_parents(null);
    }
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
    this.note.bind_property(
      "title",
      this._title_entry,
      "text",
      GObject7.BindingFlags.BIDIRECTIONAL | GObject7.BindingFlags.SYNC_CREATE
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
        "action_button",
        "title_entry"
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

// src/preferences.ts
import GObject8 from "gi://GObject";
import Gtk6 from "gi://Gtk?version=4.0";
import Adw6 from "gi://Adw";
var _PreferencesWindow = class extends Adw6.PreferencesWindow {
  constructor(params = {}) {
    super(params);
    this.update_notes_path_subtitle();
    this._notes_path_button.connect("clicked", () => {
      const dialog = new Gtk6.FileDialog({
        title: _("Select Notes Directory")
      });
      dialog.select_folder(this, null, (d, res) => {
        try {
          if (!d)
            return;
          const file = d.select_folder_finish(res);
          if (file) {
            settings.set_string("notes-path", file.get_path() || "");
            this.update_notes_path_subtitle();
          }
        } catch (e) {
          console.error(e);
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
};
var PreferencesWindow = _PreferencesWindow;
(() => {
  GObject8.registerClass(
    {
      GTypeName: "PreferencesWindow",
      Template: "resource:///com/vixalien/sticky/ui/preferences.ui",
      InternalChildren: ["notes_path_row", "notes_path_button"]
    },
    _PreferencesWindow
  );
})();

// src/application.ts
var _Application = class extends Adw7.Application {
  constructor() {
    super({
      application_id: "com.vixalien.sticky",
      flags: Gio4.ApplicationFlags.DEFAULT_FLAGS
    });
    this.window = null;
    this.note_windows = [];
    this.notes_list = Gio4.ListStore.new(Note.$gtype);
    this.open_new_note = false;
    this.show_all_notes = false;
    GLib5.set_application_name(_("Sticky Notes"));
    this.init_actions();
    try {
      const notes = load_notes();
      notes.forEach((note) => {
        note.connect("notify::modified", () => {
          save_note(note);
        });
        note.connect("notify::open", () => {
          save_note(note);
        });
        this.notes_list.append(note);
      });
      this.sort_notes();
    } catch (error) {
      console.error(error);
    }
    this.add_main_option(
      "all-notes",
      "a".charCodeAt(0),
      GLib5.OptionFlags.NONE,
      GLib5.OptionArg.NONE,
      "Show all notes",
      null
    );
    this.add_main_option(
      "version",
      "v".charCodeAt(0),
      GLib5.OptionFlags.NONE,
      GLib5.OptionArg.NONE,
      "Print version information and exit",
      null
    );
    this.add_main_option(
      "new-note",
      "n".charCodeAt(0),
      GLib5.OptionFlags.NONE,
      GLib5.OptionArg.NONE,
      "Open a new note",
      null
    );
    this.add_main_option(
      "if-open-note",
      "i".charCodeAt(0),
      GLib5.OptionFlags.NONE,
      GLib5.OptionArg.NONE,
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
    console.log("Storing Notes at: " + get_notes_dir().get_path());
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
    const controller = new Gtk7.ShortcutController();
    const add_shortcut = (fn, accels) => {
      const shortcut = new Gtk7.Shortcut({
        trigger: Gtk7.ShortcutTrigger.parse_string(accels.join("|")),
        // @ts-ignore bad types
        action: Gtk7.CallbackAction.new(() => {
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
    const quit_action = new Gio4.SimpleAction({ name: "quit" });
    quit_action.connect("activate", () => this.quit());
    this.add_action(quit_action);
    const show_about_action = new Gio4.SimpleAction({ name: "about" });
    show_about_action.connect("activate", () => this.show_about());
    this.add_action(show_about_action);
    const show_preferences_action = new Gio4.SimpleAction({ name: "preferences" });
    show_preferences_action.connect("activate", () => this.show_preferences());
    this.add_action(show_preferences_action);
    const new_note = new Gio4.SimpleAction({ name: "new-note" });
    new_note.connect("activate", () => this.new_note());
    this.add_action(new_note);
    const all_notes = new Gio4.SimpleAction({ name: "all-notes" });
    all_notes.connect("activate", () => {
      GLib5.idle_add(GLib5.PRIORITY_DEFAULT, () => {
        this.all_notes();
        return GLib5.SOURCE_REMOVE;
      });
    });
    this.add_action(all_notes);
    const open_link = new Gio4.SimpleAction({
      name: "open-link",
      parameter_type: GLib5.VariantType.new("s")
    });
    open_link.connect("activate", (_2, parameter) => {
      if (!parameter)
        return;
      const [uri] = parameter.get_string();
      if (uri === "null")
        return;
      Gtk7.show_uri(
        this.get_active_window(),
        uri,
        Gdk3.CURRENT_TIME
      );
    });
    this.add_action(open_link);
    const cycle_linear = new Gio4.SimpleAction({ name: "cycle" });
    cycle_linear.connect("activate", () => this.cycle_linear());
    this.add_action(cycle_linear);
    const cycle_reverse = new Gio4.SimpleAction({ name: "cycle-reverse" });
    cycle_reverse.connect("activate", () => this.cycle_reverse());
    this.add_action(cycle_reverse);
    const save = new Gio4.SimpleAction({ name: "save" });
    save.connect("activate", () => this.save());
    this.add_action(save);
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
    const filter = Gtk7.CustomFilter.new((item) => {
      const note = item;
      return this.is_note_open(note.uuid);
    });
    const notes = Gtk7.FilterListModel.new(
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
  show_preferences() {
    const preferencesWindow = new PreferencesWindow({
      transient_for: this.active_window || void 0
    });
    preferencesWindow.present();
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
      license_type: Gtk7.License.MIT_X11,
      website: "https://github.com/vixalien/sticky",
      issue_url: "https://github.com/vixalien/sticky/issues"
    };
    const aboutWindow = new Adw7.AboutWindow(aboutParams);
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
  delete_note(uuid) {
    const found_id = this.find_note_id(uuid);
    const found_window = this.find_open_window(uuid);
    if (found_id !== void 0)
      this.notes_list.splice(found_id, 1, []);
    if (found_window)
      found_window.close();
    delete_note(uuid);
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
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const notes_count = this.notes_list.n_items;
    const title = `${today}-${notes_count + 1}`;
    const note = Note.generate(title);
    note.connect("notify::modified", () => {
      save_note(note);
    });
    note.connect("notify::open", () => {
      save_note(note);
    });
    this.notes_list.append(note);
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
    const style_manager = Adw7.StyleManager.get_default();
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
  GObject9.registerClass(_Application);
})();

// src/main.ts
function main(argv) {
  return new Application().run(argv);
}
export {
  main
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2FwcGxpY2F0aW9uLnRzIiwgIi4uL3NyYy9ub3Rlcy50cyIsICIuLi9zcmMvY2FyZC50cyIsICIuLi9zcmMvdXRpbC50cyIsICIuLi9zcmMvdmlldy50cyIsICIuLi9ub2RlX21vZHVsZXMvbGlua2lmeWpzL2Rpc3QvbGlua2lmeS5lcy5qcyIsICIuLi9zcmMvdGhlbWVzZWxlY3Rvci50cyIsICIuLi9zcmMvc3RvcmUudHMiLCAiLi4vc3JjL2Vycm9ycy50cyIsICIuLi9zcmMvd2luZG93LnRzIiwgIi4uL3NyYy9zdHlsZXNlbGVjdG9yLnRzIiwgIi4uL3NyYy9wcmVmZXJlbmNlcy50cyIsICIuLi9zcmMvbWFpbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLyogTUlUIExpY2Vuc2VcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMjMgQW5nZWxvIFZlcmxhaW4sIENocmlzIERhdmlzXG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICogY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gKiBTT0ZUV0FSRS5cbiAqXG4gKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogTUlUXG4gKi9cblxuaW1wb3J0IEdPYmplY3QgZnJvbSBcImdpOi8vR09iamVjdFwiO1xuaW1wb3J0IEdpbyBmcm9tIFwiZ2k6Ly9HaW9cIjtcbmltcG9ydCBBZHcgZnJvbSBcImdpOi8vQWR3XCI7XG5pbXBvcnQgR0xpYiBmcm9tIFwiZ2k6Ly9HTGliXCI7XG5pbXBvcnQgR3RrIGZyb20gXCJnaTovL0d0az92ZXJzaW9uPTQuMFwiO1xuaW1wb3J0IEdkayBmcm9tIFwiZ2k6Ly9HZGs/dmVyc2lvbj00LjBcIjtcblxuaW1wb3J0IHsgU3RpY2t5Tm90ZXMgfSBmcm9tIFwiLi9ub3Rlcy5qc1wiO1xuaW1wb3J0IHsgTm90ZSwgc2V0dGluZ3MgfSBmcm9tIFwiLi91dGlsLmpzXCI7XG5pbXBvcnQge1xuICBkZWxldGVfbm90ZSxcbiAgbG9hZF9ub3RlcyxcbiAgZ2V0X25vdGVzX2RpcixcbiAgc2F2ZV9ub3RlLFxuICBzYXZlX25vdGVzLFxufSBmcm9tIFwiLi9zdG9yZS5qc1wiO1xuaW1wb3J0IHsgV2luZG93IH0gZnJvbSBcIi4vd2luZG93LmpzXCI7XG5pbXBvcnQgeyBQcmVmZXJlbmNlc1dpbmRvdyB9IGZyb20gXCIuL3ByZWZlcmVuY2VzLmpzXCI7XG5cbmV4cG9ydCBjbGFzcyBBcHBsaWNhdGlvbiBleHRlbmRzIEFkdy5BcHBsaWNhdGlvbiB7XG4gIHByaXZhdGUgd2luZG93OiBTdGlja3lOb3RlcyB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIG5vdGVfd2luZG93czogV2luZG93W10gPSBbXTtcblxuICBzdGF0aWMge1xuICAgIEdPYmplY3QucmVnaXN0ZXJDbGFzcyh0aGlzKTtcbiAgfVxuXG4gIG5vdGVzX2xpc3QgPSBHaW8uTGlzdFN0b3JlLm5ldyhOb3RlLiRndHlwZSkgYXMgR2lvLkxpc3RTdG9yZTxOb3RlPjtcblxuICBvcGVuX25ld19ub3RlID0gZmFsc2U7XG4gIHNob3dfYWxsX25vdGVzID0gZmFsc2U7XG5cbiAgc29ydF9ub3RlcygpIHtcbiAgICB0aGlzLm5vdGVzX2xpc3Quc29ydCgobm90ZTE6IE5vdGUsIG5vdGUyOiBOb3RlKSA9PiB7XG4gICAgICByZXR1cm4gbm90ZTEubW9kaWZpZWQuY29tcGFyZShub3RlMi5tb2RpZmllZCk7XG4gICAgfSk7XG4gIH1cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcih7XG4gICAgICBhcHBsaWNhdGlvbl9pZDogXCJjb20udml4YWxpZW4uc3RpY2t5XCIsXG4gICAgICBmbGFnczogR2lvLkFwcGxpY2F0aW9uRmxhZ3MuREVGQVVMVF9GTEFHUyxcbiAgICB9KTtcblxuICAgIEdMaWIuc2V0X2FwcGxpY2F0aW9uX25hbWUoXyhcIlN0aWNreSBOb3Rlc1wiKSk7XG5cbiAgICB0aGlzLmluaXRfYWN0aW9ucygpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG5vdGVzID0gbG9hZF9ub3RlcygpO1xuXG4gICAgICBub3Rlcy5mb3JFYWNoKChub3RlOiBOb3RlKSA9PiB7XG4gICAgICAgIG5vdGUuY29ubmVjdChcIm5vdGlmeTo6bW9kaWZpZWRcIiwgKCkgPT4ge1xuICAgICAgICAgIHNhdmVfbm90ZShub3RlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gY2hhbmdpbmcgb3BlbiBkb2Vzbid0IGNoYW5nZSBtb2RpZmllZFxuICAgICAgICBub3RlLmNvbm5lY3QoXCJub3RpZnk6Om9wZW5cIiwgKCkgPT4ge1xuICAgICAgICAgIHNhdmVfbm90ZShub3RlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5ub3Rlc19saXN0LmFwcGVuZChub3RlKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnNvcnRfbm90ZXMoKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihlcnJvciBhcyBhbnkpO1xuICAgIH1cblxuICAgIHRoaXMuYWRkX21haW5fb3B0aW9uKFxuICAgICAgXCJhbGwtbm90ZXNcIixcbiAgICAgIFwiYVwiLmNoYXJDb2RlQXQoMCksXG4gICAgICBHTGliLk9wdGlvbkZsYWdzLk5PTkUsXG4gICAgICBHTGliLk9wdGlvbkFyZy5OT05FLFxuICAgICAgXCJTaG93IGFsbCBub3Rlc1wiLFxuICAgICAgbnVsbCxcbiAgICApO1xuXG4gICAgdGhpcy5hZGRfbWFpbl9vcHRpb24oXG4gICAgICBcInZlcnNpb25cIixcbiAgICAgIFwidlwiLmNoYXJDb2RlQXQoMCksXG4gICAgICBHTGliLk9wdGlvbkZsYWdzLk5PTkUsXG4gICAgICBHTGliLk9wdGlvbkFyZy5OT05FLFxuICAgICAgXCJQcmludCB2ZXJzaW9uIGluZm9ybWF0aW9uIGFuZCBleGl0XCIsXG4gICAgICBudWxsLFxuICAgICk7XG5cbiAgICB0aGlzLmFkZF9tYWluX29wdGlvbihcbiAgICAgIFwibmV3LW5vdGVcIixcbiAgICAgIFwiblwiLmNoYXJDb2RlQXQoMCksXG4gICAgICBHTGliLk9wdGlvbkZsYWdzLk5PTkUsXG4gICAgICBHTGliLk9wdGlvbkFyZy5OT05FLFxuICAgICAgXCJPcGVuIGEgbmV3IG5vdGVcIixcbiAgICAgIG51bGwsXG4gICAgKTtcblxuICAgIHRoaXMuYWRkX21haW5fb3B0aW9uKFxuICAgICAgXCJpZi1vcGVuLW5vdGVcIixcbiAgICAgIFwiaVwiLmNoYXJDb2RlQXQoMCksXG4gICAgICBHTGliLk9wdGlvbkZsYWdzLk5PTkUsXG4gICAgICBHTGliLk9wdGlvbkFyZy5OT05FLFxuICAgICAgXCJPbmx5IHNob3cgdGhlIGFwcCBpZiB0aGVyZSBpcyBhdGxlYXN0IG9uZSBvcGVuIG5vdGVcIixcbiAgICAgIG51bGwsXG4gICAgKTtcblxuICAgIHRoaXMuY29ubmVjdChcImhhbmRsZS1sb2NhbC1vcHRpb25zXCIsIChfYXBwLCBvcHRpb25zOiBHTGliLlZhcmlhbnREaWN0KSA9PiB7XG4gICAgICBpZiAob3B0aW9ucy5jb250YWlucyhcInZlcnNpb25cIikpIHtcbiAgICAgICAgcHJpbnQocGtnLnZlcnNpb24pO1xuICAgICAgICAvKiBxdWl0IHRoZSBpbnZva2VkIHByb2Nlc3MgYWZ0ZXIgcHJpbnRpbmcgdGhlIHZlcnNpb24gbnVtYmVyXG4gICAgICAgICAqIGxlYXZpbmcgdGhlIHJ1bm5pbmcgaW5zdGFuY2UgdW5hZmZlY3RlZFxuICAgICAgICAgKi9cbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9IGVsc2UgaWYgKG9wdGlvbnMuY29udGFpbnMoXCJhbGwtbm90ZXNcIikpIHtcbiAgICAgICAgdGhpcy5zaG93X2FsbF9ub3RlcyA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKG9wdGlvbnMuY29udGFpbnMoXCJuZXctbm90ZVwiKSkge1xuICAgICAgICB0aGlzLm9wZW5fbmV3X25vdGUgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmIChvcHRpb25zLmNvbnRhaW5zKFwiaWYtb3Blbi1ub3RlXCIpKSB7XG4gICAgICAgIGxldCBvcGVuID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5mb3JlYWNoX25vdGUoKG5vdGUpID0+IHtcbiAgICAgICAgICBvcGVuID0gb3BlbiB8fCBub3RlLm9wZW47XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChvcGVuID09IGZhbHNlKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICBcIlN0aWNreSBOb3RlcyBub3Qgb3BlbmluZyBiZWNhdXNlIHRoZSBgLWlgIGZsYWcgd2FzIHBhc3NlZCBhbmQgdGhlcmUgYXJlIG5vIG9wZW4gbm90ZXNcIixcbiAgICAgICAgICApO1xuICAgICAgICAgIHRoaXMucXVpdCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gLTE7XG4gICAgfSk7XG5cbiAgICBjb25zb2xlLmxvZyhcIlN0b3JpbmcgTm90ZXMgYXQ6IFwiICsgZ2V0X25vdGVzX2RpcigpLmdldF9wYXRoKCkpO1xuICB9XG5cbiAgc2F2ZSgpIHtcbiAgICBjb25zdCBhcnJheTogTm90ZVtdID0gW107XG5cbiAgICB0aGlzLmZvcmVhY2hfbm90ZSgobm90ZSkgPT4ge1xuICAgICAgYXJyYXkucHVzaChub3RlKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBzYXZlX25vdGVzKGFycmF5KTtcbiAgfVxuXG4gIHB1YmxpYyB2ZnVuY19zaHV0ZG93bigpIHtcbiAgICB0aGlzLnNhdmUoKTtcblxuICAgIHN1cGVyLnZmdW5jX3NodXRkb3duKCk7XG4gIH1cblxuICBwdWJsaWMgdmZ1bmNfYWN0aXZhdGUoKSB7XG4gICAgLy8gdGhpcyBpcyB1c2VkIHRvIHRyYWNrIGlmIHRoZXJlIGlzIGF0bGVhc3Qgb25lIHdpbmRvdyBvcGVuLiBpZCB0aGVyZSBpc24ndCxcbiAgICAvLyB3ZSBzaG93IHRoZSBhbGxfbm90ZXNcbiAgICBsZXQgaGFzX29uZV9vcGVuID0gZmFsc2U7XG5cbiAgICBpZiAodGhpcy5zaG93X2FsbF9ub3Rlcykge1xuICAgICAgdGhpcy5hbGxfbm90ZXMoKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMub3Blbl9uZXdfbm90ZSkge1xuICAgICAgdGhpcy5uZXdfbm90ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoc2V0dGluZ3MuZ2V0X2Jvb2xlYW4oXCJzaG93LWFsbC1ub3Rlc1wiKSkgdGhpcy5hbGxfbm90ZXMoKTtcblxuICAgICAgdGhpcy5mb3JlYWNoX25vdGUoKG5vdGUpID0+IHtcbiAgICAgICAgaWYgKG5vdGUub3Blbikge1xuICAgICAgICAgIGlmIChoYXNfb25lX29wZW4gPT0gZmFsc2UpIGhhc19vbmVfb3BlbiA9IHRydWU7XG4gICAgICAgICAgdGhpcy5zaG93X25vdGUobm90ZS51dWlkKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmICghaGFzX29uZV9vcGVuKSB7XG4gICAgICAgIGNvbnN0IGxhc3Rfb3Blbl9ub3RlID0gdGhpcy5ub3Rlc19hcnJheSgpXG4gICAgICAgICAgLnNvcnQoKGEsIGIpID0+IGIubW9kaWZpZWQuY29tcGFyZShhLm1vZGlmaWVkKSlbMF07XG5cbiAgICAgICAgaWYgKGhhc19vbmVfb3Blbikge1xuICAgICAgICAgIHRoaXMuc2hvd19ub3RlKGxhc3Rfb3Blbl9ub3RlLnV1aWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNldHRpbmdzLnNldF9ib29sZWFuKFwic2hvdy1hbGwtbm90ZXNcIiwgdHJ1ZSk7XG4gICAgICAgICAgdGhpcy5hbGxfbm90ZXMoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlzX25vdGVfb3Blbih1dWlkOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5ub3RlX3dpbmRvd3Muc29tZSgodzogV2luZG93KSA9PiB3Lm5vdGUudXVpZCA9PT0gdXVpZCk7XG4gIH1cblxuICBuZXdfY29udHJvbGxlcigpIHtcbiAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IEd0ay5TaG9ydGN1dENvbnRyb2xsZXIoKTtcblxuICAgIGNvbnN0IGFkZF9zaG9ydGN1dCA9IChmbjogKCkgPT4gdm9pZCwgYWNjZWxzOiBzdHJpbmdbXSkgPT4ge1xuICAgICAgY29uc3Qgc2hvcnRjdXQgPSBuZXcgR3RrLlNob3J0Y3V0KHtcbiAgICAgICAgdHJpZ2dlcjogR3RrLlNob3J0Y3V0VHJpZ2dlci5wYXJzZV9zdHJpbmcoYWNjZWxzLmpvaW4oXCJ8XCIpKSxcbiAgICAgICAgLy8gQHRzLWlnbm9yZSBiYWQgdHlwZXNcbiAgICAgICAgYWN0aW9uOiBHdGsuQ2FsbGJhY2tBY3Rpb24ubmV3KCgpID0+IHtcbiAgICAgICAgICBmbigpO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9KSxcbiAgICAgIH0pO1xuICAgICAgY29udHJvbGxlci5hZGRfc2hvcnRjdXQoc2hvcnRjdXQpO1xuICAgIH07XG5cbiAgICBhZGRfc2hvcnRjdXQodGhpcy5jeWNsZV9saW5lYXIuYmluZCh0aGlzKSwgW1xuICAgICAgXCI8UHJpbWFyeT5QYWdlX0Rvd25cIixcbiAgICAgIFwiPFByaW1hcnk+VGFiXCIsXG4gICAgICBcIjxQcmltYXJ5PklTT19MZWZ0X1RhYlwiLFxuICAgICAgXCI8UHJpbWFyeT5LUF9UYWJcIixcbiAgICBdKTtcbiAgICBhZGRfc2hvcnRjdXQodGhpcy5jeWNsZV9yZXZlcnNlLmJpbmQodGhpcyksIFtcbiAgICAgIFwiPFByaW1hcnk+UGFnZV9VcFwiLFxuICAgICAgXCI8UHJpbWFyeT48U2hpZnQ+VGFiXCIsXG4gICAgICBcIjxQcmltYXJ5PjxTaGlmdD5JU09fTGVmdF9UYWJcIixcbiAgICAgIFwiPFByaW1hcnk+PFNoaWZ0PktQX1RhYlwiLFxuICAgIF0pO1xuXG4gICAgcmV0dXJuIGNvbnRyb2xsZXI7XG4gIH1cblxuICBpbml0X2FjdGlvbnMoKSB7XG4gICAgY29uc3QgcXVpdF9hY3Rpb24gPSBuZXcgR2lvLlNpbXBsZUFjdGlvbih7IG5hbWU6IFwicXVpdFwiIH0pO1xuICAgIHF1aXRfYWN0aW9uLmNvbm5lY3QoXCJhY3RpdmF0ZVwiLCAoKSA9PiB0aGlzLnF1aXQoKSk7XG4gICAgdGhpcy5hZGRfYWN0aW9uKHF1aXRfYWN0aW9uKTtcblxuICAgIGNvbnN0IHNob3dfYWJvdXRfYWN0aW9uID0gbmV3IEdpby5TaW1wbGVBY3Rpb24oeyBuYW1lOiBcImFib3V0XCIgfSk7XG4gICAgc2hvd19hYm91dF9hY3Rpb24uY29ubmVjdChcImFjdGl2YXRlXCIsICgpID0+IHRoaXMuc2hvd19hYm91dCgpKTtcbiAgICB0aGlzLmFkZF9hY3Rpb24oc2hvd19hYm91dF9hY3Rpb24pO1xuXG4gICAgY29uc3Qgc2hvd19wcmVmZXJlbmNlc19hY3Rpb24gPSBuZXcgR2lvLlNpbXBsZUFjdGlvbih7IG5hbWU6IFwicHJlZmVyZW5jZXNcIiB9KTtcbiAgICBzaG93X3ByZWZlcmVuY2VzX2FjdGlvbi5jb25uZWN0KFwiYWN0aXZhdGVcIiwgKCkgPT4gdGhpcy5zaG93X3ByZWZlcmVuY2VzKCkpO1xuICAgIHRoaXMuYWRkX2FjdGlvbihzaG93X3ByZWZlcmVuY2VzX2FjdGlvbik7XG5cbiAgICBjb25zdCBuZXdfbm90ZSA9IG5ldyBHaW8uU2ltcGxlQWN0aW9uKHsgbmFtZTogXCJuZXctbm90ZVwiIH0pO1xuICAgIG5ld19ub3RlLmNvbm5lY3QoXCJhY3RpdmF0ZVwiLCAoKSA9PiB0aGlzLm5ld19ub3RlKCkpO1xuICAgIHRoaXMuYWRkX2FjdGlvbihuZXdfbm90ZSk7XG5cbiAgICBjb25zdCBhbGxfbm90ZXMgPSBuZXcgR2lvLlNpbXBsZUFjdGlvbih7IG5hbWU6IFwiYWxsLW5vdGVzXCIgfSk7XG4gICAgYWxsX25vdGVzLmNvbm5lY3QoXCJhY3RpdmF0ZVwiLCAoKSA9PiB7XG4gICAgICBHTGliLmlkbGVfYWRkKEdMaWIuUFJJT1JJVFlfREVGQVVMVCwgKCkgPT4ge1xuICAgICAgICB0aGlzLmFsbF9ub3RlcygpO1xuICAgICAgICByZXR1cm4gR0xpYi5TT1VSQ0VfUkVNT1ZFO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgdGhpcy5hZGRfYWN0aW9uKGFsbF9ub3Rlcyk7XG5cbiAgICBjb25zdCBvcGVuX2xpbmsgPSBuZXcgR2lvLlNpbXBsZUFjdGlvbih7XG4gICAgICBuYW1lOiBcIm9wZW4tbGlua1wiLFxuICAgICAgcGFyYW1ldGVyX3R5cGU6IEdMaWIuVmFyaWFudFR5cGUubmV3KFwic1wiKSxcbiAgICB9KTtcbiAgICBvcGVuX2xpbmsuY29ubmVjdChcImFjdGl2YXRlXCIsIChfLCBwYXJhbWV0ZXIpID0+IHtcbiAgICAgIGlmICghcGFyYW1ldGVyKSByZXR1cm47XG4gICAgICBjb25zdCBbdXJpXSA9IHBhcmFtZXRlci5nZXRfc3RyaW5nKCk7XG5cbiAgICAgIGlmICh1cmkgPT09IFwibnVsbFwiKSByZXR1cm47XG4gICAgICBHdGsuc2hvd191cmkoXG4gICAgICAgIHRoaXMuZ2V0X2FjdGl2ZV93aW5kb3coKSxcbiAgICAgICAgdXJpLFxuICAgICAgICBHZGsuQ1VSUkVOVF9USU1FLFxuICAgICAgKTtcbiAgICB9KTtcbiAgICB0aGlzLmFkZF9hY3Rpb24ob3Blbl9saW5rKTtcblxuICAgIGNvbnN0IGN5Y2xlX2xpbmVhciA9IG5ldyBHaW8uU2ltcGxlQWN0aW9uKHsgbmFtZTogXCJjeWNsZVwiIH0pO1xuICAgIGN5Y2xlX2xpbmVhci5jb25uZWN0KFwiYWN0aXZhdGVcIiwgKCkgPT4gdGhpcy5jeWNsZV9saW5lYXIoKSk7XG4gICAgdGhpcy5hZGRfYWN0aW9uKGN5Y2xlX2xpbmVhcik7XG5cbiAgICBjb25zdCBjeWNsZV9yZXZlcnNlID0gbmV3IEdpby5TaW1wbGVBY3Rpb24oeyBuYW1lOiBcImN5Y2xlLXJldmVyc2VcIiB9KTtcbiAgICBjeWNsZV9yZXZlcnNlLmNvbm5lY3QoXCJhY3RpdmF0ZVwiLCAoKSA9PiB0aGlzLmN5Y2xlX3JldmVyc2UoKSk7XG4gICAgdGhpcy5hZGRfYWN0aW9uKGN5Y2xlX3JldmVyc2UpO1xuXG4gICAgY29uc3Qgc2F2ZSA9IG5ldyBHaW8uU2ltcGxlQWN0aW9uKHsgbmFtZTogXCJzYXZlXCIgfSk7XG4gICAgc2F2ZS5jb25uZWN0KFwiYWN0aXZhdGVcIiwgKCkgPT4gdGhpcy5zYXZlKCkpO1xuICAgIHRoaXMuYWRkX2FjdGlvbihzYXZlKTtcblxuICAgIHRoaXMuYWRkX2FjdGlvbihzZXR0aW5ncy5jcmVhdGVfYWN0aW9uKFwiY29sb3Itc2NoZW1lXCIpKTtcblxuICAgIHRoaXMuc2V0X2FjY2Vsc19mb3JfYWN0aW9uKFwiYXBwLnF1aXRcIiwgW1wiPFByaW1hcnk+cVwiXSk7XG4gICAgdGhpcy5zZXRfYWNjZWxzX2Zvcl9hY3Rpb24oXCJhcHAubmV3LW5vdGVcIiwgW1wiPFByaW1hcnk+blwiXSk7XG4gICAgdGhpcy5zZXRfYWNjZWxzX2Zvcl9hY3Rpb24oXCJhcHAuYWxsLW5vdGVzXCIsIFtcIjxQcmltYXJ5PmhcIl0pO1xuICAgIC8vIHRoaXMuc2V0X2FjY2Vsc19mb3JfYWN0aW9uKFwiYXBwLmN5Y2xlXCIsIFtcIjxQcmltYXJ5PjxTaGlmdD5hXCJdKTtcbiAgICAvLyB0aGlzLnNldF9hY2NlbHNfZm9yX2FjdGlvbihcImFwcC5jeWNsZS1yZXZlcnNlXCIsIFtcIjxQcmltYXJ5PjxTaGlmdD5iXCJdKTtcbiAgICB0aGlzLnNldF9hY2NlbHNfZm9yX2FjdGlvbihcImFwcC5zYXZlXCIsIFtcIjxQcmltYXJ5PnNcIl0pO1xuICAgIHRoaXMuc2V0X2FjY2Vsc19mb3JfYWN0aW9uKFwid2luLmRlbGV0ZVwiLCBbXCI8UHJpbWFyeT5kXCJdKTtcblxuICAgIHRoaXMuc2V0X2FjY2Vsc19mb3JfYWN0aW9uKFwid2luLm9wZW4tcHJpbWFyeS1tZW51XCIsIFtcIkYxMFwiXSk7XG4gICAgdGhpcy5zZXRfYWNjZWxzX2Zvcl9hY3Rpb24oXCJ3aW4uc2hvdy1oZWxwLW92ZXJsYXlcIiwgW1wiPFByaW1hcnk+cXVlc3Rpb25cIl0pO1xuICAgIHRoaXMuc2V0X2FjY2Vsc19mb3JfYWN0aW9uKFwid2luZG93LmNsb3NlXCIsIFtcIjxQcmltYXJ5PndcIl0pO1xuXG4gICAgdGhpcy5zZXRfYWNjZWxzX2Zvcl9hY3Rpb24oXCJ3aW4uYm9sZFwiLCBbXCI8UHJpbWFyeT5iXCJdKTtcbiAgICB0aGlzLnNldF9hY2NlbHNfZm9yX2FjdGlvbihcIndpbi5pdGFsaWNcIiwgW1wiPFByaW1hcnk+aVwiXSk7XG4gICAgdGhpcy5zZXRfYWNjZWxzX2Zvcl9hY3Rpb24oXCJ3aW4udW5kZXJsaW5lXCIsIFtcIjxQcmltYXJ5PnVcIl0pO1xuICAgIHRoaXMuc2V0X2FjY2Vsc19mb3JfYWN0aW9uKFwid2luLnN0cmlrZXRocm91Z2hcIiwgW1wiPFByaW1hcnk+dFwiXSk7XG4gIH1cblxuICBnZXRfbm90ZV93aW5kb3codXVpZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMubm90ZV93aW5kb3dzLmZpbmQoKHcpID0+IHcubm90ZS51dWlkID09PSB1dWlkKTtcbiAgfVxuXG4gIGN5Y2xlKHJldmVyc2UgPSBmYWxzZSkge1xuICAgIHRoaXMuc29ydF9ub3RlcygpO1xuXG4gICAgaWYgKHRoaXMubm90ZXNfbGlzdC5uX2l0ZW1zIDw9IDApIHJldHVybjtcblxuICAgIGNvbnN0IGZpbHRlciA9IEd0ay5DdXN0b21GaWx0ZXIubmV3KChpdGVtKSA9PiB7XG4gICAgICBjb25zdCBub3RlID0gaXRlbSBhcyBOb3RlO1xuICAgICAgcmV0dXJuIHRoaXMuaXNfbm90ZV9vcGVuKG5vdGUudXVpZCk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBub3RlcyA9IEd0ay5GaWx0ZXJMaXN0TW9kZWwubmV3KFxuICAgICAgdGhpcy5ub3Rlc19saXN0LFxuICAgICAgZmlsdGVyLFxuICAgICkgYXMgR3RrLkZpbHRlckxpc3RNb2RlbDxOb3RlPjtcblxuICAgIGNvbnN0IHByZXNlbnRlZCA9IHRoaXMuYWN0aXZlX3dpbmRvdztcblxuICAgIGlmIChwcmVzZW50ZWQgaW5zdGFuY2VvZiBTdGlja3lOb3Rlcykge1xuICAgICAgdGhpcy5nZXRfbm90ZV93aW5kb3coXG4gICAgICAgIG5vdGVzLmdldF9pdGVtKHJldmVyc2UgPyBub3Rlcy5uX2l0ZW1zIC0gMSA6IDApIS51dWlkLFxuICAgICAgKVxuICAgICAgICA/LnByZXNlbnQoKTtcbiAgICB9IGVsc2UgaWYgKHByZXNlbnRlZCBpbnN0YW5jZW9mIFdpbmRvdykge1xuICAgICAgbGV0IGlkO1xuXG4gICAgICBmb3IgKGlkID0gMDsgaWQgPCBub3Rlcy5uX2l0ZW1zOyBpZCsrKSB7XG4gICAgICAgIGlmIChub3Rlcy5nZXRfaXRlbShpZCkhLnV1aWQgPT09IHByZXNlbnRlZC5ub3RlLnV1aWQpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBmb2N1c19pZCA9IGlkICsgKHJldmVyc2UgPyAtMSA6IDEpO1xuXG4gICAgICBpZiAoZm9jdXNfaWQgPCAwIHx8IGZvY3VzX2lkID49IG5vdGVzLm5faXRlbXMpIHtcbiAgICAgICAgdGhpcy5hbGxfbm90ZXMoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZ2V0X25vdGVfd2luZG93KG5vdGVzLmdldF9pdGVtKGZvY3VzX2lkKSEudXVpZCk/LnByZXNlbnQoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjeWNsZV9saW5lYXIoKSB7XG4gICAgLy8gcmV2ZXJzZSB0aGUgb3JkZXIgKG1ha2VzIGl0IGxvb3Agb2xkZXN0IGZpcnN0KVxuICAgIHJldHVybiB0aGlzLmN5Y2xlKGZhbHNlKTtcbiAgfVxuXG4gIGN5Y2xlX3JldmVyc2UoKSB7XG4gICAgLy8gcmV2ZXJzZSB0aGUgb3JkZXIgKG1ha2VzIGl0IGxvb3Agb2xkZXN0IGZpcnN0KVxuICAgIHJldHVybiB0aGlzLmN5Y2xlKHRydWUpO1xuICB9XG5cbiAgc2hvd19wcmVmZXJlbmNlcygpIHtcbiAgICBjb25zdCBwcmVmZXJlbmNlc1dpbmRvdyA9IG5ldyBQcmVmZXJlbmNlc1dpbmRvdyh7XG4gICAgICB0cmFuc2llbnRfZm9yOiB0aGlzLmFjdGl2ZV93aW5kb3cgfHwgdW5kZWZpbmVkLFxuICAgIH0pO1xuICAgIHByZWZlcmVuY2VzV2luZG93LnByZXNlbnQoKTtcbiAgfVxuXG4gIHNob3dfYWJvdXQoKSB7XG4gICAgY29uc3QgYWJvdXRQYXJhbXM6IFBhcnRpYWw8QWR3LkFib3V0V2luZG93LkNvbnN0cnVjdG9yUHJvcHM+ID0ge1xuICAgICAgdHJhbnNpZW50X2ZvcjogdGhpcy5hY3RpdmVfd2luZG93LFxuICAgICAgYXBwbGljYXRpb25fbmFtZTogXyhcIlN0aWNreSBOb3Rlc1wiKSxcbiAgICAgIGFwcGxpY2F0aW9uX2ljb246IHBrZy5uYW1lLFxuICAgICAgZGV2ZWxvcGVyX25hbWU6IFwiQW5nZWxvIFZlcmxhaW5cIixcbiAgICAgIHZlcnNpb246IHBrZy52ZXJzaW9uLFxuICAgICAgZGV2ZWxvcGVyczogW1xuICAgICAgICBcIkFuZ2VsbyBWZXJsYWluIDxoZXlAdml4YWxpZW4uY29tPlwiLFxuICAgICAgICBcIkNocmlzdG9waGVyIERhdmlzIDxjaHJpc3RvcGhlcmRhdmlzQGdub21lLm9yZz5cIixcbiAgICAgIF0sXG4gICAgICBkZXNpZ25lcnM6IFtcbiAgICAgICAgXCJEYXZpZCBMYXBzaGluXCIsXG4gICAgICBdLFxuICAgICAgLy8gVFJBTlNMQVRPUlM6IGVnLiAnVHJhbnNsYXRvciBOYW1lIDx5b3VyLmVtYWlsQGRvbWFpbi5jb20+JyBvciAnVHJhbnNsYXRvciBOYW1lIGh0dHBzOi8vd2Vic2l0ZS5leGFtcGxlJ1xuICAgICAgdHJhbnNsYXRvcl9jcmVkaXRzOiBfKFwidHJhbnNsYXRvci1jcmVkaXRzXCIpLFxuICAgICAgY29weXJpZ2h0OiBcIlx1MDBBOSAyMDIzIEFuZ2VsbyBWZXJsYWluLCBDaHJpc3RvcGhlciBEYXZpc1wiLFxuICAgICAgbGljZW5zZV90eXBlOiBHdGsuTGljZW5zZS5NSVRfWDExLFxuICAgICAgd2Vic2l0ZTogXCJodHRwczovL2dpdGh1Yi5jb20vdml4YWxpZW4vc3RpY2t5XCIsXG4gICAgICBpc3N1ZV91cmw6IFwiaHR0cHM6Ly9naXRodWIuY29tL3ZpeGFsaWVuL3N0aWNreS9pc3N1ZXNcIixcbiAgICB9O1xuXG4gICAgY29uc3QgYWJvdXRXaW5kb3cgPSBuZXcgQWR3LkFib3V0V2luZG93KGFib3V0UGFyYW1zKTtcbiAgICBhYm91dFdpbmRvdy5wcmVzZW50KCk7XG4gIH1cblxuICBub3Rlc19hcnJheSgpIHtcbiAgICBjb25zdCBub3RlczogTm90ZVtdID0gW107XG5cbiAgICB0aGlzLmZvcmVhY2hfbm90ZSgobm90ZSkgPT4ge1xuICAgICAgbm90ZXMucHVzaChub3RlKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBub3RlcztcbiAgfVxuXG4gIGZvcmVhY2hfbm90ZShjYjogKG5vdGU6IE5vdGUsIGlkPzogbnVtYmVyKSA9PiB2b2lkKSB7XG4gICAgbGV0IGlkID0gMDtcblxuICAgIHdoaWxlIChpZCA8IHRoaXMubm90ZXNfbGlzdC5uX2l0ZW1zKSB7XG4gICAgICBjYih0aGlzLm5vdGVzX2xpc3QuZ2V0X2l0ZW0oaWQpISwgaWQpO1xuICAgICAgaWQrKztcbiAgICB9XG4gIH1cblxuICBmaW5kX25vdGVfaWQodXVpZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMubm90ZXNfYXJyYXkoKS5maW5kSW5kZXgoKG5vdGUpID0+IG5vdGUudXVpZCA9PT0gdXVpZCk7XG4gIH1cblxuICBmaW5kX25vdGUodXVpZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMubm90ZXNfYXJyYXkoKS5maW5kKChub3RlKSA9PiBub3RlLnV1aWQgPT09IHV1aWQpO1xuICB9XG5cbiAgZmluZF9vcGVuX3dpbmRvdyh1dWlkOiBzdHJpbmcpIHtcbiAgICBjb25zdCB3aW4gPSB0aGlzLm5vdGVfd2luZG93cy5maW5kKCh3aW5kb3cpID0+IHdpbmRvdy5ub3RlLnV1aWQgPT09IHV1aWQpO1xuXG4gICAgcmV0dXJuIHdpbiA/PyB1bmRlZmluZWQ7XG4gIH1cblxuICBmaW5kX29wZW5fbm90ZSh1dWlkOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5maW5kX29wZW5fd2luZG93KHV1aWQpPy5ub3RlIGFzIE5vdGUgPz8gdW5kZWZpbmVkO1xuICB9XG5cbiAgY2hhbmdlZF9ub3RlKHV1aWQ6IHN0cmluZykge1xuICAgIGNvbnN0IGZvdW5kX2lkID0gdGhpcy5maW5kX25vdGVfaWQodXVpZCk7XG4gICAgY29uc3QgZm91bmRfbm90ZSA9IHRoaXMuZmluZF9vcGVuX25vdGUodXVpZCk7XG5cbiAgICBpZiAoZm91bmRfaWQgIT09IHVuZGVmaW5lZCAmJiBmb3VuZF9ub3RlKSB7XG4gICAgICAvLyB0aGlzLm5vdGVzX2xpc3Quc3BsaWNlKGZvdW5kX2lkLCAxLCBbZm91bmRfbm90ZV0pO1xuICAgIH1cbiAgfVxuXG4gIGRlbGV0ZV9ub3RlKHV1aWQ6IHN0cmluZykge1xuICAgIGNvbnN0IGZvdW5kX2lkID0gdGhpcy5maW5kX25vdGVfaWQodXVpZCk7XG4gICAgY29uc3QgZm91bmRfd2luZG93ID0gdGhpcy5maW5kX29wZW5fd2luZG93KHV1aWQpO1xuXG4gICAgaWYgKGZvdW5kX2lkICE9PSB1bmRlZmluZWQpIHRoaXMubm90ZXNfbGlzdC5zcGxpY2UoZm91bmRfaWQsIDEsIFtdKTtcbiAgICBpZiAoZm91bmRfd2luZG93KSBmb3VuZF93aW5kb3cuY2xvc2UoKTtcblxuICAgIGRlbGV0ZV9ub3RlKHV1aWQpO1xuICB9XG5cbiAgYWxsX25vdGVzKCkge1xuICAgIGlmICghdGhpcy53aW5kb3cpIHtcbiAgICAgIHRoaXMud2luZG93ID0gbmV3IFN0aWNreU5vdGVzKHtcbiAgICAgICAgYXBwbGljYXRpb246IHRoaXMsXG4gICAgICB9KTtcblxuICAgICAgdGhpcy53aW5kb3cuY29ubmVjdChcIm5vdGUtYWN0aXZhdGVkXCIsIChfLCB1dWlkKSA9PiB7XG4gICAgICAgIHRoaXMuc2hvd19ub3RlKHV1aWQpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMud2luZG93LmNvbm5lY3QoXCJkZWxldGVkXCIsIChfLCB1dWlkKSA9PiB7XG4gICAgICAgIHRoaXMuZGVsZXRlX25vdGUodXVpZCk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy53aW5kb3cuY29ubmVjdChcImNsb3NlLXJlcXVlc3RcIiwgKCkgPT4ge1xuICAgICAgICB0aGlzLndpbmRvdyA9IG51bGw7XG4gICAgICAgIHNldHRpbmdzLnNldF9ib29sZWFuKFwic2hvdy1hbGwtbm90ZXNcIiwgZmFsc2UpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMud2luZG93LmFkZF9jb250cm9sbGVyKHRoaXMubmV3X2NvbnRyb2xsZXIoKSk7XG4gICAgfVxuXG4gICAgc2V0dGluZ3Muc2V0X2Jvb2xlYW4oXCJzaG93LWFsbC1ub3Rlc1wiLCB0cnVlKTtcblxuICAgIHRoaXMud2luZG93LnByZXNlbnQoKTtcbiAgfVxuXG4gIG5ld19ub3RlKCkge1xuICAgIGNvbnN0IHRvZGF5ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF07XG4gICAgY29uc3Qgbm90ZXNfY291bnQgPSB0aGlzLm5vdGVzX2xpc3Qubl9pdGVtcztcbiAgICBjb25zdCB0aXRsZSA9IGAke3RvZGF5fS0ke25vdGVzX2NvdW50ICsgMX1gO1xuICAgIFxuICAgIGNvbnN0IG5vdGUgPSBOb3RlLmdlbmVyYXRlKHRpdGxlKTtcblxuICAgIG5vdGUuY29ubmVjdChcIm5vdGlmeTo6bW9kaWZpZWRcIiwgKCkgPT4ge1xuICAgICAgc2F2ZV9ub3RlKG5vdGUpO1xuICAgIH0pO1xuXG4gICAgLy8gY2hhbmdpbmcgb3BlbiBkb2Vzbid0IGNoYW5nZSBtb2RpZmllZFxuICAgIG5vdGUuY29ubmVjdChcIm5vdGlmeTo6b3BlblwiLCAoKSA9PiB7XG4gICAgICBzYXZlX25vdGUobm90ZSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLm5vdGVzX2xpc3QuYXBwZW5kKG5vdGUpO1xuXG4gICAgdGhpcy5zaG93X25vdGUobm90ZS51dWlkKTtcbiAgfVxuXG4gIHNob3dfbm90ZSh1dWlkOiBzdHJpbmcpIHtcbiAgICBjb25zdCBub3RlID0gdGhpcy5maW5kX25vdGUodXVpZCk7XG5cbiAgICBpZiAoIW5vdGUpIHJldHVybjtcblxuICAgIGNvbnN0IG5vdGVfd2luZG93ID0gdGhpcy5ub3RlX3dpbmRvd3MuZmluZCgod2luZG93KSA9PlxuICAgICAgd2luZG93Lm5vdGUudXVpZCA9PT0gdXVpZFxuICAgICk7XG5cbiAgICBpZiAobm90ZV93aW5kb3cpIHtcbiAgICAgIG5vdGVfd2luZG93LnByZXNlbnQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB3aW5kb3cgPSBuZXcgV2luZG93KHtcbiAgICAgIGFwcGxpY2F0aW9uOiB0aGlzLFxuICAgICAgbm90ZSxcbiAgICB9KTtcblxuICAgIHRoaXMubm90ZV93aW5kb3dzLnB1c2god2luZG93KTtcblxuICAgIHdpbmRvdy5hZGRfY29udHJvbGxlcih0aGlzLm5ld19jb250cm9sbGVyKCkpO1xuXG4gICAgd2luZG93LmNvbm5lY3QoXCJjbG9zZS1yZXF1ZXN0XCIsICgpID0+IHtcbiAgICAgIC8vIGlmIHRoaXMgaXMgdGhlIGxhc3Qgd2luZG93LCBpdCBtZWFucyB0aGF0IHRoZSBhcHAgd2lsbCBiZSBjbG9zZWRcbiAgICAgIC8vIGltbWVkaWF0ZWx5IGFmdGVyLCBzbyBrZWVwIHRoaXMgYXMgXCJvcGVuXCIgd2hlbiB0aGUgYWxsIG5vdGVzIHdpbmRvd1xuICAgICAgLy8gaXMgb3BlbiAoc28gdGhhdCBpdCdzIHJlc3RvcmVkIHdoZW4gdGhlIGFwcCBpcyBvcGVuZWQgYWdhaW4pXG4gICAgICBpZiAoISh0aGlzLm5vdGVfd2luZG93cy5sZW5ndGggPT09IDEgJiYgIXRoaXMud2luZG93KSkge1xuICAgICAgICBub3RlLm9wZW4gPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5ub3RlX3dpbmRvd3MgPSB0aGlzLm5vdGVfd2luZG93cy5maWx0ZXIoKHdpbikgPT4gd2luICE9PSB3aW5kb3cpO1xuICAgICAgdGhpcy53aW5kb3c/LnNldF9ub3RlX3Zpc2libGUobm90ZSEudXVpZCwgZmFsc2UpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xuXG4gICAgd2luZG93LmNvbm5lY3QoXCJkZWxldGVkXCIsIChfLCB1dWlkKSA9PiB7XG4gICAgICB0aGlzLmRlbGV0ZV9ub3RlKHV1aWQpO1xuICAgIH0pO1xuXG4gICAgaWYgKG5vdGUub3BlbiA9PT0gZmFsc2UpIG5vdGUub3BlbiA9IHRydWU7XG5cbiAgICB3aW5kb3cucHJlc2VudCgpO1xuICB9XG5cbiAgdmZ1bmNfc3RhcnR1cCgpIHtcbiAgICBzdXBlci52ZnVuY19zdGFydHVwKCk7XG5cbiAgICBjb25zdCBzdHlsZV9tYW5hZ2VyID0gQWR3LlN0eWxlTWFuYWdlci5nZXRfZGVmYXVsdCgpO1xuICAgIGZ1bmN0aW9uIHNldENvbG9yU2NoZW1lKCkge1xuICAgICAgY29uc3QgY29sb3Jfc2NoZW1lID0gc2V0dGluZ3MuZ2V0X2ludChcImNvbG9yLXNjaGVtZVwiKTtcbiAgICAgIHN0eWxlX21hbmFnZXIuc2V0X2NvbG9yX3NjaGVtZShjb2xvcl9zY2hlbWUpO1xuICAgIH1cbiAgICBzZXRDb2xvclNjaGVtZSgpO1xuICAgIHNldHRpbmdzLmNvbm5lY3QoXCJjaGFuZ2VkOjpjb2xvci1zY2hlbWVcIiwgc2V0Q29sb3JTY2hlbWUpO1xuICB9XG59XG4iLCAiLyogTUlUIExpY2Vuc2VcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMjMgQW5nZWxvIFZlcmxhaW4sIENocmlzIERhdmlzXG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICogY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gKiBTT0ZUV0FSRS5cbiAqXG4gKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogTUlUXG4gKi9cblxuaW1wb3J0IEdPYmplY3QgZnJvbSBcImdpOi8vR09iamVjdFwiO1xuaW1wb3J0IEd0ayBmcm9tIFwiZ2k6Ly9HdGs/dmVyc2lvbj00LjBcIjtcbmltcG9ydCBBZHcgZnJvbSBcImdpOi8vQWR3XCI7XG5cbmltcG9ydCB0eXBlIHsgQXBwbGljYXRpb24gfSBmcm9tIFwiLi9hcHBsaWNhdGlvbi5qc1wiO1xuaW1wb3J0IHsgU3RpY2t5Tm90ZUNhcmQgfSBmcm9tIFwiLi9jYXJkLmpzXCI7XG5pbXBvcnQgeyBOb3RlLCBzZXR0aW5ncyB9IGZyb20gXCIuL3V0aWwuanNcIjtcblxuaW1wb3J0IHsgVGhlbWVTZWxlY3RvciB9IGZyb20gXCIuL3RoZW1lc2VsZWN0b3IuanNcIjtcblxuZXhwb3J0IGNsYXNzIFN0aWNreU5vdGVzIGV4dGVuZHMgQWR3LkFwcGxpY2F0aW9uV2luZG93IHtcbiAgc3RhdGljIHtcbiAgICBHT2JqZWN0LnJlZ2lzdGVyQ2xhc3MoXG4gICAgICB7XG4gICAgICAgIFRlbXBsYXRlOiBcInJlc291cmNlOi8vL2NvbS92aXhhbGllbi9zdGlja3kvdWkvbm90ZXMudWlcIixcbiAgICAgICAgR1R5cGVOYW1lOiBcIlN0aWNreU5vdGVzXCIsXG4gICAgICAgIEludGVybmFsQ2hpbGRyZW46IFtcbiAgICAgICAgICBcInNlYXJjaFwiLFxuICAgICAgICAgIFwibm90ZXNfYm94XCIsXG4gICAgICAgICAgXCJub19ub3Rlc1wiLFxuICAgICAgICAgIFwibm9fcmVzdWx0c1wiLFxuICAgICAgICAgIFwic2VhcmNoX2VudHJ5XCIsXG4gICAgICAgICAgXCJzY3JvbGxlZFwiLFxuICAgICAgICAgIFwibWVudV9idXR0b25cIixcbiAgICAgICAgICBcInN0YWNrXCIsXG4gICAgICAgIF0sXG4gICAgICAgIFNpZ25hbHM6IHtcbiAgICAgICAgICBcIm5vdGUtYWN0aXZhdGVkXCI6IHtcbiAgICAgICAgICAgIHBhcmFtX3R5cGVzOiBbR09iamVjdC5UWVBFX1NUUklOR10sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBkZWxldGVkOiB7XG4gICAgICAgICAgICBwYXJhbV90eXBlczogW0dPYmplY3QuVFlQRV9TVFJJTkddLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgdGhpcyxcbiAgICApO1xuICB9XG5cbiAgZGVjbGFyZSBfc2VhcmNoOiBHdGsuQm94O1xuICBkZWNsYXJlIF9zZWFyY2hfZW50cnk6IEd0ay5TZWFyY2hFbnRyeTtcbiAgZGVjbGFyZSBfbm90ZXNfYm94OiBHdGsuTGlzdFZpZXc7XG4gIGRlY2xhcmUgX25vX25vdGVzOiBBZHcuU3RhdHVzUGFnZTtcbiAgZGVjbGFyZSBfbm9fcmVzdWx0czogQWR3LlN0YXR1c1BhZ2U7XG4gIGRlY2xhcmUgX3Njcm9sbGVkOiBHdGsuU2Nyb2xsZWRXaW5kb3c7XG4gIGRlY2xhcmUgX21lbnVfYnV0dG9uOiBHdGsuTWVudUJ1dHRvbjtcbiAgZGVjbGFyZSBfc3RhY2s6IEd0ay5TdGFjaztcblxuICBjYXJkczogU3RpY2t5Tm90ZUNhcmRbXSA9IFtdO1xuXG4gIG9sZF9xdWVyeSA9IFwiXCI7XG5cbiAgbGFzdF9tb2RlbDogR3RrLlNlbGVjdGlvbk1vZGVsPE5vdGU+O1xuICBzb3J0ZXI6IEd0ay5Tb3J0ZXI7XG5cbiAgZ2V0IHF1ZXJ5KCkge1xuICAgIHJldHVybiB0aGlzLl9zZWFyY2hfZW50cnkudGV4dC50b0xvd2VyQ2FzZSgpO1xuICB9XG5cbiAgc2V0dXBfY2IoX2ZhY3Rvcnk6IEd0ay5MaXN0SXRlbUZhY3RvcnksIGxpc3RfaXRlbTogR3RrLkxpc3RJdGVtKSB7XG4gICAgY29uc3QgY2FyZCA9IG5ldyBTdGlja3lOb3RlQ2FyZCh0aGlzKTtcblxuICAgIGxpc3RfaXRlbS5zZXRfY2hpbGQoY2FyZCk7XG4gIH1cblxuICBiaW5kX2NiKF9mYWN0b3J5OiBHdGsuTGlzdEl0ZW1GYWN0b3J5LCBsaXN0X2l0ZW06IEd0ay5MaXN0SXRlbSkge1xuICAgIGNvbnN0IGNhcmQgPSBsaXN0X2l0ZW0uZ2V0X2NoaWxkKCkgYXMgU3RpY2t5Tm90ZUNhcmQ7XG4gICAgY29uc3Qgbm90ZSA9IGxpc3RfaXRlbS5nZXRfaXRlbSgpIGFzIE5vdGU7XG5cbiAgICBjYXJkLnNob3dfdmlzaWJsZV9pbWFnZSA9IG5vdGUub3BlbjtcbiAgICBjYXJkLmNvbm5lY3QoXCJkZWxldGVkXCIsIChfKSA9PiB0aGlzLmVtaXQoXCJkZWxldGVkXCIsIG5vdGUudXVpZCkpO1xuXG4gICAgY2FyZC5ub3RlID0gbm90ZTtcblxuICAgIG5vdGUuY29ubmVjdChcIm5vdGlmeTo6bW9kaWZpZWRcIiwgKCkgPT4ge1xuICAgICAgY2FyZC51cGRhdGVfbW9kaWZpZWRfbGFiZWwoKTtcbiAgICAgIHRoaXMuc29ydGVyLmNoYW5nZWQoR3RrLlNvcnRlckNoYW5nZS5ESUZGRVJFTlQpO1xuICAgIH0pO1xuXG4gICAgbm90ZS5jb25uZWN0KFwibm90aWZ5OjpvcGVuXCIsIChfKSA9PiB7XG4gICAgICBjYXJkLnNob3dfdmlzaWJsZV9pbWFnZSA9IG5vdGUub3BlbjtcbiAgICB9KTtcblxuICAgIG5vdGUuY29ubmVjdChcIm5vdGlmeTo6c3R5bGVcIiwgKCkgPT4ge1xuICAgICAgY2FyZC5zZXRfc3R5bGUobm90ZS5zdHlsZSk7XG4gICAgfSk7XG4gIH1cblxuICB1bmJpbmRfY2IoX2ZhY3Rvcnk6IEd0ay5MaXN0SXRlbUZhY3RvcnksIF9saXN0X2l0ZW06IEd0ay5MaXN0SXRlbSkge1xuICAgIGNvbnN0IGNhcmQgPSBuZXcgU3RpY2t5Tm90ZUNhcmQodGhpcyk7XG5cbiAgICBjYXJkLnZpZXcucmVtb3ZlX2xpc3RlbmVycygpO1xuICB9XG5cbiAgYWN0aXZhdGVfY2IobGlzdDogR3RrLkxpc3RWaWV3LCBwb3NpdGlvbjogbnVtYmVyKSB7XG4gICAgY29uc3QgaXRlbSA9IGxpc3QuZ2V0X21vZGVsKCk/LmdldF9pdGVtKHBvc2l0aW9uKSBhcyBOb3RlIHwgdW5kZWZpbmVkO1xuICAgIGlmICghaXRlbSkgcmV0dXJuO1xuICAgIHRoaXMuZW1pdChcIm5vdGUtYWN0aXZhdGVkXCIsIGl0ZW0udXVpZCk7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwYXJhbXM6IFBhcnRpYWw8R3RrLldpbmRvdy5Db25zdHJ1Y3RvclByb3BzPixcbiAgKSB7XG4gICAgc3VwZXIocGFyYW1zKTtcblxuICAgIHRoaXMuZGVmYXVsdF9oZWlnaHQgPSBzZXR0aW5ncy5nZXRfaW50KFwiZGVmYXVsdC1oZWlnaHRcIik7XG4gICAgdGhpcy5kZWZhdWx0X3dpZHRoID0gc2V0dGluZ3MuZ2V0X2ludChcImRlZmF1bHQtd2lkdGhcIik7XG5cbiAgICB0aGlzLmNvbm5lY3QoXCJjbG9zZS1yZXF1ZXN0XCIsICgpID0+IHtcbiAgICAgIHNldHRpbmdzLnNldF9pbnQoXCJkZWZhdWx0LWhlaWdodFwiLCB0aGlzLmdldF9oZWlnaHQoKSk7XG4gICAgICBzZXR0aW5ncy5zZXRfaW50KFwiZGVmYXVsdC13aWR0aFwiLCB0aGlzLmdldF93aWR0aCgpKTtcbiAgICB9KTtcblxuICAgIC8vIG1ha2UgaXQgdHJhbnNwYXJlbnRcbiAgICB0aGlzLl9ub3Rlc19ib3gucmVtb3ZlX2Nzc19jbGFzcyhcInZpZXdcIik7XG5cbiAgICBjb25zdCBmYWN0b3J5ID0gbmV3IEd0ay5TaWduYWxMaXN0SXRlbUZhY3RvcnkoKTtcbiAgICBmYWN0b3J5LmNvbm5lY3QoXCJzZXR1cFwiLCB0aGlzLnNldHVwX2NiLmJpbmQodGhpcykpO1xuICAgIGZhY3RvcnkuY29ubmVjdChcImJpbmRcIiwgdGhpcy5iaW5kX2NiLmJpbmQodGhpcykpO1xuICAgIGZhY3RvcnkuY29ubmVjdChcInVuYmluZFwiLCB0aGlzLnVuYmluZF9jYi5iaW5kKHRoaXMpKTtcblxuICAgIGNvbnN0IGZpbHRlciA9IEd0ay5DdXN0b21GaWx0ZXIubmV3KChub3RlKSA9PiB7XG4gICAgICBjb25zdCBxdWVyeSA9IHRoaXMucXVlcnk7XG4gICAgICBjb25zdCBjb250ZW50ID0gKG5vdGUgYXMgTm90ZSkuY29udGVudC50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKCFxdWVyeS5yZXBsYWNlKC9cXHMvZywgXCJcIikpIHJldHVybiB0cnVlO1xuICAgICAgcmV0dXJuIGNvbnRlbnQuaW5jbHVkZXMocXVlcnkpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgZmlsdGVyX21vZGVsID0gR3RrLkZpbHRlckxpc3RNb2RlbC5uZXcoXG4gICAgICAodGhpcy5hcHBsaWNhdGlvbiBhcyBBcHBsaWNhdGlvbikubm90ZXNfbGlzdCxcbiAgICAgIGZpbHRlcixcbiAgICApO1xuXG4gICAgdGhpcy5zb3J0ZXIgPSBHdGsuQ3VzdG9tU29ydGVyLm5ldygobm90ZTEsIG5vdGUyKSA9PiB7XG4gICAgICBjb25zdCBkYXRlMSA9IChub3RlMSBhcyBOb3RlKS5tb2RpZmllZDtcbiAgICAgIGNvbnN0IGRhdGUyID0gKG5vdGUyIGFzIE5vdGUpLm1vZGlmaWVkO1xuICAgICAgcmV0dXJuIGRhdGUyLmNvbXBhcmUoZGF0ZTEpO1xuICAgIH0pO1xuXG4gICAgY29uc3Qgc29ydGVyX21vZGVsID0gR3RrLlNvcnRMaXN0TW9kZWwubmV3KGZpbHRlcl9tb2RlbCwgdGhpcy5zb3J0ZXIpO1xuXG4gICAgdGhpcy5sYXN0X21vZGVsID0gR3RrLlNpbmdsZVNlbGVjdGlvbi5uZXcoXG4gICAgICBzb3J0ZXJfbW9kZWwsXG4gICAgKSBhcyBHdGsuU2luZ2xlU2VsZWN0aW9uPE5vdGU+O1xuXG4gICAgdGhpcy5sYXN0X21vZGVsLmNvbm5lY3QoXCJpdGVtcy1jaGFuZ2VkXCIsICgpID0+IHtcbiAgICAgIHRoaXMuc2V0X3N0YXR1cygpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fbm90ZXNfYm94LmNvbm5lY3QoXCJhY3RpdmF0ZVwiLCB0aGlzLmFjdGl2YXRlX2NiLmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5fbm90ZXNfYm94LnNldF9mYWN0b3J5KGZhY3RvcnkpO1xuICAgIHRoaXMuX25vdGVzX2JveC5zZXRfbW9kZWwodGhpcy5sYXN0X21vZGVsKTtcblxuICAgIHRoaXMuX3NlYXJjaF9lbnRyeS5jb25uZWN0KFwic2VhcmNoLWNoYW5nZWRcIiwgKCkgPT4ge1xuICAgICAgY29uc3QgcXVlcnkgPSB0aGlzLnF1ZXJ5LnRvTG93ZXJDYXNlKCk7XG4gICAgICBjb25zdCBvbGRfcXVlcnkgPSB0aGlzLm9sZF9xdWVyeS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICBpZiAocXVlcnkuaW5jbHVkZXMob2xkX3F1ZXJ5KSkge1xuICAgICAgICBmaWx0ZXIuZW1pdChcImNoYW5nZWRcIiwgR3RrLkZpbHRlckNoYW5nZS5NT1JFX1NUUklDVCk7XG4gICAgICB9IGVsc2UgaWYgKG9sZF9xdWVyeS5pbmNsdWRlcyhxdWVyeSkpIHtcbiAgICAgICAgZmlsdGVyLmVtaXQoXCJjaGFuZ2VkXCIsIEd0ay5GaWx0ZXJDaGFuZ2UuTEVTU19TVFJJQ1QpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZmlsdGVyLmVtaXQoXCJjaGFuZ2VkXCIsIEd0ay5GaWx0ZXJDaGFuZ2UuRElGRkVSRU5UKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5vbGRfcXVlcnkgPSBxdWVyeTtcbiAgICB9KTtcblxuICAgIHRoaXMuc2V0X3N0YXR1cygpO1xuXG4gICAgLy8gUG9wb3ZlciBtZW51IHRoZW1lIHN3aXRjaGVyXG4gICAgY29uc3QgcG9wb3ZlciA9IHRoaXMuX21lbnVfYnV0dG9uLmdldF9wb3BvdmVyKCkgYXMgR3RrLlBvcG92ZXJNZW51O1xuICAgIHBvcG92ZXIuYWRkX2NoaWxkKG5ldyBUaGVtZVNlbGVjdG9yKCksIFwidGhlbWVzd2l0Y2hlclwiKTtcbiAgfVxuXG4gIHNldF9zdGF0dXMoKSB7XG4gICAgaWYgKHRoaXMubGFzdF9tb2RlbC5nZXRfbl9pdGVtcygpID4gMCkge1xuICAgICAgdGhpcy5zZXRfdmlzaWJsZV9jaGlsZCh0aGlzLl9ub3Rlc19ib3gpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5xdWVyeSkge1xuICAgICAgICB0aGlzLnNldF92aXNpYmxlX2NoaWxkKHRoaXMuX25vX3Jlc3VsdHMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zZXRfdmlzaWJsZV9jaGlsZCh0aGlzLl9ub19ub3Rlcyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc2V0X25vdGVfdmlzaWJsZSh1dWlkOiBzdHJpbmcsIHZpc2libGU6IGJvb2xlYW4pIHtcbiAgICBjb25zdCBjYXJkID0gdGhpcy5jYXJkcy5maW5kKChjYXJkKSA9PiBjYXJkLm5vdGUudXVpZCA9PT0gdXVpZCk7XG5cbiAgICBpZiAoIWNhcmQpIHJldHVybjtcblxuICAgIGNhcmQuc2hvd192aXNpYmxlX2ltYWdlID0gdmlzaWJsZTtcbiAgfVxuXG4gIHNldF92aXNpYmxlX2NoaWxkKGNoaWxkOiBHdGsuV2lkZ2V0KSB7XG4gICAgdGhpcy5fc2VhcmNoLnZpc2libGUgPSBjaGlsZCA9PT0gdGhpcy5fbm90ZXNfYm94IHx8XG4gICAgICBjaGlsZCA9PT0gdGhpcy5fbm9fcmVzdWx0cztcblxuICAgIHRoaXMuX3N0YWNrLnNldF92aXNpYmxlX2NoaWxkKGNoaWxkKTtcbiAgfVxufVxuIiwgIi8qIE1JVCBMaWNlbnNlXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDIzIEFuZ2VsbyBWZXJsYWluLCBDaHJpcyBEYXZpc1xuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbiAqIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuICogU09GVFdBUkUuXG4gKlxuICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IE1JVFxuICovXG5cbmltcG9ydCBHT2JqZWN0IGZyb20gXCJnaTovL0dPYmplY3RcIjtcbmltcG9ydCBHdGsgZnJvbSBcImdpOi8vR3RrP3ZlcnNpb249NC4wXCI7XG5pbXBvcnQgR0xpYiBmcm9tIFwiZ2k6Ly9HTGliXCI7XG5cbmltcG9ydCB7IGNvbmZpcm1fZGVsZXRlLCBOb3RlLCBTdHlsZSB9IGZyb20gXCIuL3V0aWwuanNcIjtcbmltcG9ydCB7IFJlYWRvbmx5U3RpY2t5Tm90ZSB9IGZyb20gXCIuL3ZpZXcuanNcIjtcblxuZXhwb3J0IGNsYXNzIFN0aWNreU5vdGVDYXJkIGV4dGVuZHMgR3RrLkJveCB7XG4gIHN0YXRpYyB7XG4gICAgR09iamVjdC5yZWdpc3RlckNsYXNzKHtcbiAgICAgIEdUeXBlTmFtZTogXCJTdGlja3lOb3RlQ2FyZFwiLFxuICAgICAgVGVtcGxhdGU6IFwicmVzb3VyY2U6Ly8vY29tL3ZpeGFsaWVuL3N0aWNreS91aS9jYXJkLnVpXCIsXG4gICAgICBJbnRlcm5hbENoaWxkcmVuOiBbXG4gICAgICAgIFwibW9kaWZpZWRfbGFiZWxcIixcbiAgICAgICAgXCJ2aWV3X2ltYWdlXCIsXG4gICAgICAgIFwiZGVsZXRlX2J1dHRvblwiLFxuICAgICAgICBcInNjcm9sbGVkXCIsXG4gICAgICBdLFxuICAgICAgUHJvcGVydGllczoge1xuICAgICAgICB1dWlkOiBHT2JqZWN0LlBhcmFtU3BlYy5zdHJpbmcoXG4gICAgICAgICAgXCJ1dWlkXCIsXG4gICAgICAgICAgXCJVVUlEXCIsXG4gICAgICAgICAgXCJUaGUgVVVJRCBvZiB0aGUgbm90ZVwiLFxuICAgICAgICAgIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEQUJMRSxcbiAgICAgICAgICBcIlwiLFxuICAgICAgICApLFxuICAgICAgfSxcbiAgICAgIFNpZ25hbHM6IHtcbiAgICAgICAgZGVsZXRlZDoge30sXG4gICAgICB9LFxuICAgIH0sIHRoaXMpO1xuICB9XG5cbiAgZGVjbGFyZSBfc2Nyb2xsZWQ6IEd0ay5TY3JvbGxlZFdpbmRvdztcbiAgZGVjbGFyZSBfbW9kaWZpZWRfbGFiZWw6IEd0ay5MYWJlbDtcbiAgZGVjbGFyZSBfdmlld19pbWFnZTogR3RrLkltYWdlO1xuICBkZWNsYXJlIF9kZWxldGVfYnV0dG9uOiBHdGsuQnV0dG9uO1xuXG4gIHByaXZhdGUgX25vdGU/OiBOb3RlO1xuICB2aWV3OiBSZWFkb25seVN0aWNreU5vdGU7XG5cbiAgc2V0IHNob3dfdmlzaWJsZV9pbWFnZSh2aXNpYmxlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fdmlld19pbWFnZS52aXNpYmxlID0gdmlzaWJsZTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB3aW5kb3c6IEd0ay5XaW5kb3csIG5vdGU/OiBOb3RlKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMudmlldyA9IG5ldyBSZWFkb25seVN0aWNreU5vdGUobm90ZSk7XG4gICAgdGhpcy52aWV3LmFkZF9jc3NfY2xhc3MoXCJjYXJkLXRleHQtdmlld1wiKTtcbiAgICB0aGlzLnZpZXcud3JhcF9tb2RlID0gR3RrLldyYXBNb2RlLldPUkRfQ0hBUjtcblxuICAgIHRoaXMuX3Njcm9sbGVkLnNldF9jaGlsZCh0aGlzLnZpZXcpO1xuICAgIHRoaXMuX2RlbGV0ZV9idXR0b24uY29ubmVjdChcImNsaWNrZWRcIiwgdGhpcy5kZWxldGUuYmluZCh0aGlzKSk7XG5cbiAgICBpZiAobm90ZSkgdGhpcy5fbm90ZSA9IHRoaXMubm90ZSA9IG5vdGU7XG4gIH1cblxuICBzZXQgbm90ZShub3RlOiBOb3RlKSB7XG4gICAgaWYgKG5vdGU/LnN0eWxlICE9PSB0aGlzLl9ub3RlPy5zdHlsZSkgdGhpcy5zZXRfc3R5bGUobm90ZS5zdHlsZSk7XG5cbiAgICB0aGlzLl9ub3RlID0gdGhpcy52aWV3Lm5vdGUgPSBub3RlO1xuXG4gICAgdGhpcy51cGRhdGVfbW9kaWZpZWRfbGFiZWwoKTtcbiAgfVxuXG4gIGdldCB1dWlkKCkge1xuICAgIHJldHVybiB0aGlzLl9ub3RlPy51dWlkO1xuICB9XG5cbiAgdXBkYXRlX21vZGlmaWVkX2xhYmVsKCkge1xuICAgIGNvbnN0IG1vZGlmaWVkID0gdGhpcy5fbm90ZT8ubW9kaWZpZWQ/LnRvX2xvY2FsKCk7XG5cbiAgICBpZiAoIW1vZGlmaWVkKSByZXR1cm47XG5cbiAgICAvLyBpZiBkYXRlIGlzIHRvZGF5LCBzaG93IHRpbWVcbiAgICAvLyBvdGhlcndpc2UsIHNob3cgZGF0ZVxuICAgIGNvbnN0IGZvcm1hdCA9XG4gICAgICBHTGliLkRhdGVUaW1lLm5ld19ub3dfbG9jYWwoKS5mb3JtYXQoXCIlRlwiKSA9PT0gbW9kaWZpZWQuZm9ybWF0KFwiJUZcIilcbiAgICAgICAgPyBcIiVSXCJcbiAgICAgICAgOiBcIiVGXCI7XG5cbiAgICB0aGlzLl9tb2RpZmllZF9sYWJlbC5sYWJlbCA9IG1vZGlmaWVkLmZvcm1hdChmb3JtYXQpITtcbiAgfVxuXG4gIHNldF9zdHlsZShzdHlsZTogU3R5bGUpIHtcbiAgICBmb3IgKGNvbnN0IHMgb2YgdGhpcy5nZXRfY3NzX2NsYXNzZXMoKSkge1xuICAgICAgaWYgKHMuc3RhcnRzV2l0aChcInN0eWxlLVwiKSAmJiBzICE9PSBgc3R5bGUtc3BlY2lmaXR5YCkge1xuICAgICAgICB0aGlzLnJlbW92ZV9jc3NfY2xhc3Mocyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5hZGRfY3NzX2NsYXNzKGBzdHlsZS0ke1N0eWxlW3N0eWxlXX1gKTtcbiAgfVxuXG4gIGRlbGV0ZSgpIHtcbiAgICBpZiAoIXRoaXMuX25vdGUpIHJldHVybjtcbiAgICBjb25maXJtX2RlbGV0ZSh0aGlzLndpbmRvdywgKCkgPT4ge1xuICAgICAgdGhpcy5lbWl0KFwiZGVsZXRlZFwiKTtcbiAgICB9KTtcbiAgfVxufVxuIiwgIi8qIE1JVCBMaWNlbnNlXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDIzIEFuZ2VsbyBWZXJsYWluLCBDaHJpcyBEYXZpc1xuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbiAqIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuICogU09GVFdBUkUuXG4gKlxuICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IE1JVFxuICovXG5cbmltcG9ydCBBZHcgZnJvbSBcImdpOi8vQWR3XCI7XG5pbXBvcnQgR2lvIGZyb20gXCJnaTovL0dpb1wiO1xuaW1wb3J0IEdMaWIgZnJvbSBcImdpOi8vR0xpYlwiO1xuaW1wb3J0IEdPYmplY3QgZnJvbSBcImdpOi8vR09iamVjdFwiO1xuaW1wb3J0IEd0ayBmcm9tIFwiZ2k6Ly9HdGs/dmVyc2lvbj00LjBcIjtcblxuR2lvLl9wcm9taXNpZnkoXG4gIEdpby5GaWxlLnByb3RvdHlwZSxcbiAgXCJsb2FkX2NvbnRlbnRzX2FzeW5jXCIsXG4gIFwibG9hZF9jb250ZW50c19maW5pc2hcIixcbik7XG5cbkdpby5fcHJvbWlzaWZ5KFxuICBHaW8uRmlsZS5wcm90b3R5cGUsXG4gIFwicmVwbGFjZV9jb250ZW50c19hc3luY1wiLFxuICBcInJlcGxhY2VfY29udGVudHNfZmluaXNoXCIsXG4pO1xuXG5leHBvcnQgaW50ZXJmYWNlIElUYWcge1xuICBuYW1lOiBzdHJpbmc7XG4gIHN0YXJ0OiBudW1iZXI7XG4gIGVuZDogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElOb3RlIHtcbiAgdjogMTtcbiAgdXVpZDogc3RyaW5nO1xuICBjb250ZW50OiBzdHJpbmc7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIHN0eWxlOiBTdHlsZTtcbiAgdGFnczogSVRhZ1tdO1xuICBtb2RpZmllZDogRGF0ZTtcbiAgd2lkdGg6IG51bWJlcjtcbiAgaGVpZ2h0OiBudW1iZXI7XG4gIG9wZW46IGJvb2xlYW47XG59XG5cbmV4cG9ydCBlbnVtIFN0eWxlIHtcbiAgXCJ5ZWxsb3dcIiA9IDEsXG4gIFwicGlua1wiLFxuICBcImdyZWVuXCIsXG4gIFwicHVycGxlXCIsXG4gIFwiYmx1ZVwiLFxuICBcImdyYXlcIixcbiAgXCJjaGFyY29hbFwiLFxuICBcIndpbmRvd1wiLFxufVxuXG5leHBvcnQgY29uc3QgU3R5bGVOYW1lcyA9IG5ldyBNYXAoW1xuICBbU3R5bGUueWVsbG93LCBfKFwiWWVsbG93XCIpXSxcbiAgW1N0eWxlLnBpbmssIF8oXCJQaW5rXCIpXSxcbiAgW1N0eWxlLmdyZWVuLCBfKFwiR3JlZW5cIildLFxuICBbU3R5bGUucHVycGxlLCBfKFwiUHVycGxlXCIpXSxcbiAgW1N0eWxlLmJsdWUsIF8oXCJCbHVlXCIpXSxcbiAgW1N0eWxlLmdyYXksIF8oXCJHcmF5XCIpXSxcbiAgW1N0eWxlLmNoYXJjb2FsLCBfKFwiQ2hhcmNvYWxcIildLFxuICBbU3R5bGUud2luZG93LCBfKFwiV2luZG93XCIpXSxcbl0pO1xuXG5leHBvcnQgY29uc3Qgc3R5bGVzID0gT2JqZWN0LnZhbHVlcyhTdHlsZSkuZmlsdGVyKFxuICAoc3R5bGUpID0+IHR5cGVvZiBzdHlsZSA9PT0gXCJudW1iZXJcIixcbikgYXMgU3R5bGVbXTtcblxuZXhwb3J0IGNvbnN0IHNldHRpbmdzID0gbmV3IEdpby5TZXR0aW5ncyh7IHNjaGVtYV9pZDogXCJjb20udml4YWxpZW4uc3RpY2t5XCIgfSk7XG5cbmNvbnN0IGdldF9zZXR0aW5ncyA9ICgpID0+ICh7XG4gIERFRkFVTFRfU1RZTEU6IHNldHRpbmdzLmdldF9lbnVtKFwiZGVmYXVsdC1zdHlsZVwiKSBhcyBTdHlsZSxcbiAgREVGQVVMVF9XSURUSDogc2V0dGluZ3MuZ2V0X2ludChcImRlZmF1bHQtd2lkdGhcIiksXG4gIERFRkFVTFRfSEVJR0hUOiBzZXR0aW5ncy5nZXRfaW50KFwiZGVmYXVsdC1oZWlnaHRcIiksXG4gIENPTkZJUk1fREVMRVRFOiBzZXR0aW5ncy5nZXRfYm9vbGVhbihcImNvbmZpcm0tZGVsZXRlXCIpLFxuICBOT1RFU19QQVRIOiBzZXR0aW5ncy5nZXRfc3RyaW5nKFwibm90ZXMtcGF0aFwiKSxcbn0pO1xuXG5leHBvcnQgbGV0IFNFVFRJTkdTID0gZ2V0X3NldHRpbmdzKCk7XG5cbnNldHRpbmdzLmNvbm5lY3QoXCJjaGFuZ2VkXCIsICgpID0+IHtcbiAgU0VUVElOR1MgPSBnZXRfc2V0dGluZ3MoKTtcbn0pO1xuXG5leHBvcnQgY2xhc3MgVGFnIGV4dGVuZHMgR09iamVjdC5PYmplY3Qge1xuICBzdGF0aWMgJGd0eXBlOiBHT2JqZWN0LkdUeXBlPFRhZz47XG5cbiAgbmFtZTogc3RyaW5nO1xuICBzdGFydDogbnVtYmVyO1xuICBlbmQ6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcsIHN0YXJ0OiBudW1iZXIgPSAwLCBlbmQ6IG51bWJlciA9IDApIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5zdGFydCA9IHN0YXJ0O1xuICAgIHRoaXMuZW5kID0gZW5kO1xuICB9XG5cbiAgc3RhdGljIHtcbiAgICBHT2JqZWN0LnJlZ2lzdGVyQ2xhc3Moe1xuICAgICAgR1R5cGVOYW1lOiBcIlRhZ09iamVjdFwiLFxuICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgbmFtZTogR09iamVjdC5QYXJhbVNwZWMuc3RyaW5nKFwibmFtZVwiLCBcIk5hbWVcIiwgXCJUaGUgbmFtZSBvZiB0aGUgdGFnXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIFwiXCIpLFxuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgc3RhcnQ6IEdPYmplY3QuUGFyYW1TcGVjLmludChcInN0YXJ0XCIsIFwiU3RhcnRcIiwgXCJTdGFydGluZyBwb3NpdGlvbiBvZiB0aGUgdGFnXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIDAsIDEwMCwgMCksXG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICBlbmQ6IEdPYmplY3QuUGFyYW1TcGVjLmludChcImVuZFwiLCBcIkVuZFwiLCBcIkVuZGluZyBwb3NpdGlvbiBvZiB0aGUgdGFnXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIDAsIDEwMCwgMCksXG4gICAgICB9LFxuICAgIH0sIHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBOb3RlIGV4dGVuZHMgR09iamVjdC5PYmplY3Qge1xuICBwcml2YXRlIHN0YXRpYyB0YWdfbGlzdF9wc3BlYyA9IEdPYmplY3QucGFyYW1fc3BlY19vYmplY3QoXG4gICAgXCJ0YWdfbGlzdFwiLFxuICAgIFwiVGFnc1wiLFxuICAgIFwiVGFncyBvZiB0aGUgbm90ZVwiLFxuICAgIEdpby5MaXN0U3RvcmUuJGd0eXBlLFxuICAgIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsXG4gICk7XG5cbiAgc3RhdGljICRndHlwZTogR09iamVjdC5HVHlwZTxOb3RlPjtcblxuICB2OiAxO1xuICB1dWlkOiBzdHJpbmc7XG4gIGNvbnRlbnQ6IHN0cmluZztcbiAgdGl0bGU6IHN0cmluZztcbiAgc3R5bGU6IFN0eWxlO1xuICB0YWdfbGlzdDogR2lvLkxpc3RTdG9yZTxUYWc+O1xuICBtb2RpZmllZDogR0xpYi5EYXRlVGltZTtcbiAgd2lkdGg6IG51bWJlcjtcbiAgaGVpZ2h0OiBudW1iZXI7XG4gIG9wZW46IGJvb2xlYW47XG5cbiAgZ2V0IHRhZ3MoKSB7XG4gICAgY29uc3QgaXRlbXMgPSBbXTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy50YWdfbGlzdC5nZXRfbl9pdGVtcygpOyBpKyspIHtcbiAgICAgIGNvbnN0IHRhZyA9IHRoaXMudGFnX2xpc3QuZ2V0X2l0ZW0oaSkhO1xuICAgICAgaXRlbXMucHVzaCh7XG4gICAgICAgIG5hbWU6IHRhZy5uYW1lLFxuICAgICAgICBzdGFydDogdGFnLnN0YXJ0LFxuICAgICAgICBlbmQ6IHRhZy5lbmQsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gaXRlbXM7XG4gIH1cblxuICBzZXQgdGFncyh0YWdzOiBJTm90ZVtcInRhZ3NcIl0pIHtcbiAgICB0aGlzLnRhZ19saXN0LnJlbW92ZV9hbGwoKTtcblxuICAgIGZvciAoY29uc3QgdGFnIG9mIHRhZ3MpIHtcbiAgICAgIGNvbnN0IHRhZ19vYmplY3QgPSBuZXcgVGFnKHRhZy5uYW1lLCB0YWcuc3RhcnQsIHRhZy5lbmQpO1xuICAgICAgdGhpcy50YWdfbGlzdC5hcHBlbmQodGFnX29iamVjdCk7XG4gICAgfVxuXG4gICAgdGhpcy5lbWl0KFwibm90aWZ5Ojp0YWdfbGlzdFwiLCBOb3RlLnRhZ19saXN0X3BzcGVjKTtcbiAgfVxuXG4gIGdldCBtb2RpZmllZF9kYXRlKCkge1xuICAgIHJldHVybiBuZXcgRGF0ZSh0aGlzLm1vZGlmaWVkLnRvX3VuaXgoKSAqIDEwMDApO1xuICB9XG5cbiAgLy8gYW55dGhpbmcgdGhlIGNvbnN0cnVjdG9yIG9mIGRhdGUgYWNjZXB0c1xuICBzZXQgbW9kaWZpZWRfZGF0ZShkYXRlOiBEYXRlKSB7XG4gICAgdGhpcy5tb2RpZmllZCA9IEdMaWIuRGF0ZVRpbWUubmV3X2Zyb21faXNvODYwMShcbiAgICAgIG5ldyBEYXRlKGRhdGUpLnRvSVNPU3RyaW5nKCksXG4gICAgICBudWxsLFxuICAgICk7XG4gIH1cblxuICBjb25zdHJ1Y3Rvcihub3RlOiBJTm90ZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy52ID0gbm90ZS52O1xuICAgIHRoaXMudXVpZCA9IG5vdGUudXVpZDtcbiAgICB0aGlzLmNvbnRlbnQgPSBub3RlLmNvbnRlbnQ7XG4gICAgdGhpcy50aXRsZSA9IG5vdGUudGl0bGU7XG4gICAgdGhpcy5zdHlsZSA9IG5vdGUuc3R5bGU7XG4gICAgdGhpcy50YWdfbGlzdCA9IEdpby5MaXN0U3RvcmUubmV3KFRhZy4kZ3R5cGUpIGFzIEdpby5MaXN0U3RvcmU8VGFnPjtcbiAgICB0aGlzLnRhZ3MgPSBub3RlLnRhZ3M7XG4gICAgdGhpcy5tb2RpZmllZCA9IEdMaWIuRGF0ZVRpbWUubmV3X2Zyb21faXNvODYwMShcbiAgICAgIG5ldyBEYXRlKG5vdGUubW9kaWZpZWQpLnRvSVNPU3RyaW5nKCksXG4gICAgICBudWxsLFxuICAgICk7XG4gICAgdGhpcy53aWR0aCA9IG5vdGUud2lkdGg7XG4gICAgdGhpcy5oZWlnaHQgPSBub3RlLmhlaWdodDtcbiAgICB0aGlzLm9wZW4gPSBub3RlLm9wZW4gPz8gZmFsc2U7XG5cbiAgfVxuXG4gIHN0YXRpYyBnZW5lcmF0ZSh0aXRsZTogc3RyaW5nID0gXCJcIikge1xuICAgIHJldHVybiBuZXcgdGhpcyh7XG4gICAgICB2OiAxLFxuICAgICAgdXVpZDogR0xpYi51dWlkX3N0cmluZ19yYW5kb20oKSxcbiAgICAgIGNvbnRlbnQ6IFwiXCIsXG4gICAgICB0aXRsZTogdGl0bGUsXG4gICAgICBzdHlsZTogU0VUVElOR1MuREVGQVVMVF9TVFlMRSxcbiAgICAgIHRhZ3M6IFtdLFxuICAgICAgbW9kaWZpZWQ6IG5ldyBEYXRlKCksXG4gICAgICB3aWR0aDogMzAwLFxuICAgICAgaGVpZ2h0OiAzMDAsXG4gICAgICBvcGVuOiBmYWxzZSxcbiAgICB9KTtcbiAgfVxuXG4gIGNvcHkoKSB7XG4gICAgcmV0dXJuIG5ldyBOb3RlKHtcbiAgICAgIHY6IHRoaXMudixcbiAgICAgIHV1aWQ6IHRoaXMudXVpZCxcbiAgICAgIGNvbnRlbnQ6IHRoaXMuY29udGVudCxcbiAgICAgIHRpdGxlOiB0aGlzLnRpdGxlLFxuICAgICAgc3R5bGU6IHRoaXMuc3R5bGUsXG4gICAgICB0YWdzOiB0aGlzLnRhZ3MubWFwKCh0YWcpID0+ICh7XG4gICAgICAgIG5hbWU6IHRhZy5uYW1lLFxuICAgICAgICBzdGFydDogdGFnLnN0YXJ0LFxuICAgICAgICBlbmQ6IHRhZy5lbmQsXG4gICAgICB9KSksXG4gICAgICBtb2RpZmllZDogbmV3IERhdGUodGhpcy5tb2RpZmllZC50b191bml4KCkgKiAxMDAwKSxcbiAgICAgIHdpZHRoOiB0aGlzLndpZHRoLFxuICAgICAgaGVpZ2h0OiB0aGlzLmhlaWdodCxcbiAgICAgIG9wZW46IHRoaXMub3BlbixcbiAgICB9KTtcbiAgfVxuXG4gIHRvSlNPTigpOiBJTm90ZSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHY6IHRoaXMudixcbiAgICAgIHV1aWQ6IHRoaXMudXVpZCxcbiAgICAgIGNvbnRlbnQ6IHRoaXMuY29udGVudCxcbiAgICAgIHRpdGxlOiB0aGlzLnRpdGxlLFxuICAgICAgc3R5bGU6IHRoaXMuc3R5bGUsXG4gICAgICB0YWdzOiB0aGlzLnRhZ3MsXG4gICAgICBtb2RpZmllZDogdGhpcy5tb2RpZmllZF9kYXRlLFxuICAgICAgd2lkdGg6IHRoaXMud2lkdGgsXG4gICAgICBoZWlnaHQ6IHRoaXMuaGVpZ2h0LFxuICAgICAgb3BlbjogdGhpcy5vcGVuLFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMge1xuICAgIEdPYmplY3QucmVnaXN0ZXJDbGFzcyh7XG4gICAgICBHVHlwZU5hbWU6IFwiTm90ZU9iamVjdFwiLFxuICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgdjogR09iamVjdC5QYXJhbVNwZWMuaW50KFwidlwiLCBcIlZlcnNpb25cIiwgXCJWZXJzaW9uIG9mIHRoZSBub3RlXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIDAsIDEwMCwgMCksXG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICB1dWlkOiBHT2JqZWN0LlBhcmFtU3BlYy5zdHJpbmcoXCJ1dWlkXCIsIFwiVVVJRFwiLCBcIlVVSUQgb2YgdGhlIG5vdGVcIiwgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSwgXCJcIiksXG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICBjb250ZW50OiBHT2JqZWN0LlBhcmFtU3BlYy5zdHJpbmcoXCJjb250ZW50XCIsIFwiQ29udGVudFwiLCBcIkNvbnRlbnQgb2YgdGhlIG5vdGVcIiwgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSwgXCJcIiksXG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICB0aXRsZTogR09iamVjdC5QYXJhbVNwZWMuc3RyaW5nKFwidGl0bGVcIiwgXCJUaXRsZVwiLCBcIlRpdGxlIG9mIHRoZSBub3RlXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIFwiXCIpLFxuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgc3R5bGU6IEdPYmplY3QuUGFyYW1TcGVjLmludChcInN0eWxlXCIsIFwiU3R5bGVcIiwgXCJTdHlsZSBvZiB0aGUgbm90ZVwiLCBHT2JqZWN0LlBhcmFtRmxhZ3MuUkVBRFdSSVRFLCAwLCAxMDAsIDApLFxuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgdGFnX2xpc3Q6IHRoaXMudGFnX2xpc3RfcHNwZWMsXG4gICAgICAgIC8vIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICBtb2RpZmllZDogR09iamVjdC5QYXJhbVNwZWMuYm94ZWQoXCJtb2RpZmllZFwiLCBcIk1vZGlmaWVkXCIsIFwiRGF0ZSB0aGUgbm90ZSB3YXMgbW9kaWZpZWRcIiwgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSwgR0xpYi5EYXRlVGltZSksXG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICB3aWR0aDogR09iamVjdC5QYXJhbVNwZWMuaW50KFwid2lkdGhcIiwgXCJXaWR0aFwiLCBcIldpZHRoIG9mIHRoZSBub3RlXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIDAsIDEwMCwgMCksXG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICBoZWlnaHQ6IEdPYmplY3QuUGFyYW1TcGVjLmludChcImhlaWdodFwiLCBcIkhlaWdodFwiLCBcIkhlaWdodCBvZiB0aGUgbm90ZVwiLCBHT2JqZWN0LlBhcmFtRmxhZ3MuUkVBRFdSSVRFLCAwLCAxMDAsIDApLFxuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgb3BlbjogR09iamVjdC5QYXJhbVNwZWMuYm9vbGVhbihcIm9wZW5cIiwgXCJPcGVuXCIsIFwiV2hldGhlciB0aGUgbm90ZSB3YXMgb3BlbiB3aGVuIHRoZSBhcHBsaWNhdGlvbiB3YXMgY2xvc2VkXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIGZhbHNlKSxcbiAgICAgIH0sXG4gICAgfSwgdGhpcyk7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGNvbmZpcm1fZGVsZXRlID0gKHdpbmRvdzogR3RrLldpbmRvdywgY2I6ICgpID0+IHZvaWQpID0+IHtcbiAgaWYgKFNFVFRJTkdTLkNPTkZJUk1fREVMRVRFKSB7XG4gICAgY29uc3QgZGlhbG9nID0gQWR3Lk1lc3NhZ2VEaWFsb2cubmV3KFxuICAgICAgd2luZG93LFxuICAgICAgXyhcIkRlbGV0ZSBOb3RlP1wiKSxcbiAgICAgIF8oXCJUaGlzIGFjdGlvbiBjYW5ub3QgYmUgdW5kb25lLiBJZiB5b3Ugd2FudCB0byBoaWRlIHRoZSBub3RlLCB5b3UgY2FuIGNsb3NlIGl0IGluc3RlYWQuXCIpLFxuICAgICk7XG4gICAgZGlhbG9nLmFkZF9yZXNwb25zZShcImNhbmNlbFwiLCBfKFwiQ2FuY2VsXCIpKTtcbiAgICBkaWFsb2cuYWRkX3Jlc3BvbnNlKFwiZGVsZXRlXCIsIF8oXCJEZWxldGVcIikpO1xuICAgIGRpYWxvZy5zZXRfcmVzcG9uc2VfYXBwZWFyYW5jZShcbiAgICAgIFwiZGVsZXRlXCIsXG4gICAgICBBZHcuUmVzcG9uc2VBcHBlYXJhbmNlLkRFU1RSVUNUSVZFLFxuICAgICk7XG4gICAgZGlhbG9nLnNldF9kZWZhdWx0X3Jlc3BvbnNlKFwiY2FuY2VsXCIpO1xuICAgIGRpYWxvZy5zZXRfY2xvc2VfcmVzcG9uc2UoXCJjYW5jZWxcIik7XG4gICAgZGlhbG9nLmNvbm5lY3QoXCJyZXNwb25zZVwiLCAoX2RpYWxvZywgcmVzcG9uc2UpID0+IHtcbiAgICAgIGlmIChyZXNwb25zZSA9PT0gXCJkZWxldGVcIikge1xuICAgICAgICBjYigpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGRpYWxvZy5wcmVzZW50KCk7XG4gIH0gZWxzZSB7XG4gICAgY2IoKTtcbiAgfVxufTtcbiIsICIvKiBNSVQgTGljZW5zZVxuICpcbiAqIENvcHlyaWdodCAoYykgMjAyMyBBbmdlbG8gVmVybGFpbiwgQ2hyaXMgRGF2aXNcbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gKiBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAqIFNPRlRXQVJFLlxuICpcbiAqIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBNSVRcbiAqL1xuXG5pbXBvcnQgR09iamVjdCBmcm9tIFwiZ2k6Ly9HT2JqZWN0XCI7XG5pbXBvcnQgR3RrIGZyb20gXCJnaTovL0d0az92ZXJzaW9uPTQuMFwiO1xuaW1wb3J0IFBhbmdvIGZyb20gXCJnaTovL1BhbmdvXCI7XG5pbXBvcnQgQWR3IGZyb20gXCJnaTovL0Fkdz92ZXJzaW9uPTFcIjtcblxuaW1wb3J0IHsgZmluZCB9IGZyb20gXCJsaW5raWZ5anNcIjtcblxuaW1wb3J0IHsgSVRhZywgTm90ZSB9IGZyb20gXCIuL3V0aWwuanNcIjtcbmltcG9ydCB7IFN0eWxlIH0gZnJvbSBcIi4vdXRpbC5qc1wiO1xuXG5jbGFzcyBBYnN0cmFjdFN0aWNreU5vdGUgZXh0ZW5kcyBHdGsuVGV4dFZpZXcge1xuICBzdGF0aWMge1xuICAgIEdPYmplY3QucmVnaXN0ZXJDbGFzcyhcbiAgICAgIHtcbiAgICAgICAgR1R5cGVOYW1lOiBcIkFic3RyYWN0U3RpY2t5Tm90ZVwiLFxuICAgICAgICBTaWduYWxzOiB7XG4gICAgICAgICAgXCJ0YWctdG9nZ2xlXCI6IHtcbiAgICAgICAgICAgIHBhcmFtX3R5cGVzOiBbR09iamVjdC5UWVBFX1NUUklORywgR09iamVjdC5UWVBFX0JPT0xFQU5dLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzZWxlY3Rpb24tY2hhbmdlZFwiOiB7fSxcbiAgICAgICAgICBcImxpbmstc2VsZWN0ZWRcIjoge1xuICAgICAgICAgICAgcGFyYW1fdHlwZXM6IFtHT2JqZWN0LlRZUEVfU1RSSU5HXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwibGluay11bnNlbGVjdGVkXCI6IHt9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHRoaXMsXG4gICAgKTtcbiAgfVxuXG4gIGJvbGRfdGFnID0gR3RrLlRleHRUYWcubmV3KFwiYm9sZFwiKTtcbiAgdW5kZXJsaW5lX3RhZyA9IEd0ay5UZXh0VGFnLm5ldyhcInVuZGVybGluZVwiKTtcbiAgaXRhbGljX3RhZyA9IEd0ay5UZXh0VGFnLm5ldyhcIml0YWxpY1wiKTtcbiAgc3RyaWtldGhyb3VnaF90YWcgPSBHdGsuVGV4dFRhZy5uZXcoXCJzdHJpa2V0aHJvdWdoXCIpO1xuICBsaW5rX3RhZyA9IEd0ay5UZXh0VGFnLm5ldyhcImxpbmtcIik7XG5cbiAgYWN0aW9ucyA9IFtcbiAgICBbXCJib2xkXCIsIHRoaXMuYm9sZF90YWddLFxuICAgIFtcInVuZGVybGluZVwiLCB0aGlzLnVuZGVybGluZV90YWddLFxuICAgIFtcIml0YWxpY1wiLCB0aGlzLml0YWxpY190YWddLFxuICAgIFtcInN0cmlrZXRocm91Z2hcIiwgdGhpcy5zdHJpa2V0aHJvdWdoX3RhZ10sXG4gIF0gYXMgW3N0cmluZywgR3RrLlRleHRUYWddW107XG5cbiAgX25vdGU/OiBOb3RlO1xuXG4gIGdldCBub3RlKCkge1xuICAgIHJldHVybiB0aGlzLl9ub3RlO1xuICB9XG5cbiAgc2V0IG5vdGUobm90ZTogTm90ZSB8IHVuZGVmaW5lZCkge1xuICAgIGlmICghbm90ZSkgcmV0dXJuO1xuXG4gICAgdGhpcy5fbm90ZSA9IG5vdGU7XG4gICAgdGhpcy5jbGVhcl90YWdzKCk7XG4gICAgdGhpcy5idWZmZXIudGV4dCA9IG5vdGUuY29udGVudDtcbiAgICB0aGlzLmluaXRfdGFncyhub3RlLnRhZ3MpO1xuXG4gICAgdGhpcy51cGRhdGVfbGlua190YWdfY29sb3IoKTtcbiAgICB0aGlzLnJlbW92ZV9saXN0ZW5lcnMoKTtcbiAgICB0aGlzLmluaXRfbGlzdGVuZXJzKCk7XG4gIH1cblxuICBsaXN0ZW5lcnMgPSBuZXcgU2V0PG51bWJlcj4oKTtcblxuICBpbml0X2xpc3RlbmVycygpIHtcbiAgICBpZiAoIXRoaXMubm90ZSkgcmV0dXJuO1xuXG4gICAgdGhpcy5saXN0ZW5lcnMuYWRkKHRoaXMubm90ZS5jb25uZWN0KFwibm90aWZ5OjpzdHlsZVwiLCAoKSA9PiB7XG4gICAgICB0aGlzLnVwZGF0ZV9saW5rX3RhZ19jb2xvcigpO1xuICAgIH0pKTtcbiAgfVxuXG4gIHJlbW92ZV9saXN0ZW5lcnMoKSB7fVxuXG4gIHN0eWxlX21hbmFnZXI6IEFkdy5TdHlsZU1hbmFnZXI7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgbm90ZT86IE5vdGUsXG4gICkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLnN0eWxlX21hbmFnZXIgPSBBZHcuU3R5bGVNYW5hZ2VyLmdldF9kZWZhdWx0KCk7XG5cbiAgICB0aGlzLnJlZ2lzdGVyX3RhZ3MoKTtcbiAgICBpZiAobm90ZSkgdGhpcy5ub3RlID0gbm90ZTtcblxuICAgIHRoaXMuYnVmZmVyLmNvbm5lY3QoXCJtYXJrLXNldFwiLCAoX2J1ZmZlciwgX2xvYywgbWFyaykgPT4ge1xuICAgICAgaWYgKCF0aGlzLm5vdGUpIHJldHVybjtcblxuICAgICAgaWYgKFxuICAgICAgICBtYXJrLm5hbWUgPT09IFwiaW5zZXJ0XCIgfHwgbWFyay5uYW1lID09PSBcInNlbGVjdGlvbl9ib3VuZFwiIHx8XG4gICAgICAgIHRoaXMuYnVmZmVyLmdldF9pdGVyX2F0X21hcmsobWFyaykuZXF1YWwoXG4gICAgICAgICAgdGhpcy5idWZmZXIuZ2V0X2l0ZXJfYXRfbWFyayh0aGlzLmJ1ZmZlci5nZXRfaW5zZXJ0KCkpLFxuICAgICAgICApXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5lbWl0KFwic2VsZWN0aW9uLWNoYW5nZWRcIik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuY2hlY2tfbGlua19zZWxlY3RlZCgpO1xuICAgIH0pO1xuICB9XG5cbiAgbGFzdF9saW5rOiBudW1iZXIgfCBmYWxzZSA9IGZhbHNlO1xuICBsYXN0X2xpbmtfZW5kOiBudW1iZXIgPSAwO1xuXG4gIGNoZWNrX2xpbmtfc2VsZWN0ZWQoKSB7XG4gICAgY29uc3QgaGFzX2xpbmsgPSB0aGlzLmhhc190YWcodGhpcy5saW5rX3RhZyk7XG5cbiAgICBpZiAoaGFzX2xpbmspIHtcbiAgICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5idWZmZXIuZ2V0X2l0ZXJfYXRfb2Zmc2V0KGhhc19saW5rKTtcblxuICAgICAgaWYgKCFzdGFydC5zdGFydHNfdGFnKHRoaXMubGlua190YWcpKSB7XG4gICAgICAgIHN0YXJ0LmJhY2t3YXJkX3RvX3RhZ190b2dnbGUodGhpcy5saW5rX3RhZyk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGVuZCA9IHN0YXJ0LmNvcHkoKTtcbiAgICAgIGVuZC5mb3J3YXJkX3RvX3RhZ190b2dnbGUodGhpcy5saW5rX3RhZyk7XG5cbiAgICAgIGlmIChcbiAgICAgICAgc3RhcnQuZ2V0X29mZnNldCgpICE9PSB0aGlzLmxhc3RfbGluayB8fFxuICAgICAgICBlbmQuZ2V0X29mZnNldCgpICE9PSB0aGlzLmxhc3RfbGlua19lbmRcbiAgICAgICkge1xuICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy5idWZmZXIuZ2V0X3RleHQoc3RhcnQsIGVuZCwgZmFsc2UpXG4gICAgICAgICAgLnJlcGxhY2UoL1xcdTIwMEIvZywgXCJcIik7XG5cbiAgICAgICAgdGhpcy5lbWl0KFwibGluay1zZWxlY3RlZFwiLCB0ZXh0KTtcblxuICAgICAgICB0aGlzLmxhc3RfbGluayA9IHN0YXJ0LmdldF9vZmZzZXQoKTtcbiAgICAgICAgdGhpcy5sYXN0X2xpbmtfZW5kID0gZW5kLmdldF9vZmZzZXQoKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGhhc19saW5rICE9PSB0aGlzLmxhc3RfbGluaykge1xuICAgICAgdGhpcy5lbWl0KFwibGluay11bnNlbGVjdGVkXCIpO1xuICAgICAgdGhpcy5sYXN0X2xpbmsgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGVfbGlua190YWdfY29sb3IoKSB7XG4gICAgaWYgKCF0aGlzLm5vdGUpIHJldHVybjtcbiAgICBsZXQgY29sb3I7XG5cbiAgICBpZiAodGhpcy5zdHlsZV9tYW5hZ2VyLmRhcmspIHtcbiAgICAgIGNvbnN0IGFjY2VudF9jb2xvciA9IHRoaXMuZ2V0X3N0eWxlX2NvbnRleHQoKS5sb29rdXBfY29sb3IoXG4gICAgICAgIFwiYWNjZW50X2ZnX2NvbG9yXCIsXG4gICAgICApO1xuICAgICAgaWYgKGFjY2VudF9jb2xvclswXSkge1xuICAgICAgICBjb2xvciA9IGFjY2VudF9jb2xvclsxXS50b19zdHJpbmcoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbG9yID0gXCIjMDAwMGZmXCI7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGFjY2VudF9jb2xvciA9IHRoaXMuZ2V0X3N0eWxlX2NvbnRleHQoKS5sb29rdXBfY29sb3IoXG4gICAgICAgIGBsaW5rX2NvbG9yXyR7U3R5bGVbdGhpcy5ub3RlLnN0eWxlXX1gLFxuICAgICAgKTtcbiAgICAgIGlmIChhY2NlbnRfY29sb3JbMF0pIHtcbiAgICAgICAgY29sb3IgPSBhY2NlbnRfY29sb3JbMV0udG9fc3RyaW5nKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb2xvciA9IFwiIzAwMDBmZlwiO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMubGlua190YWcuZm9yZWdyb3VuZCA9IGNvbG9yO1xuICB9XG5cbiAgcHJpdmF0ZSByZWdpc3Rlcl90YWdzKCkge1xuICAgIHRoaXMuYm9sZF90YWcud2VpZ2h0ID0gUGFuZ28uV2VpZ2h0LkJPTEQ7XG4gICAgdGhpcy51bmRlcmxpbmVfdGFnLnVuZGVybGluZSA9IFBhbmdvLlVuZGVybGluZS5TSU5HTEU7XG4gICAgdGhpcy5pdGFsaWNfdGFnLnN0eWxlID0gUGFuZ28uU3R5bGUuSVRBTElDO1xuICAgIHRoaXMuc3RyaWtldGhyb3VnaF90YWcuc3RyaWtldGhyb3VnaCA9IHRydWU7XG5cbiAgICB0aGlzLmxpbmtfdGFnLnVuZGVybGluZSA9IFBhbmdvLlVuZGVybGluZS5TSU5HTEU7XG5cbiAgICBpZiAodGhpcy5zdHlsZV9tYW5hZ2VyLnN5c3RlbV9zdXBwb3J0c19jb2xvcl9zY2hlbWVzKSB7XG4gICAgICB0aGlzLnN0eWxlX21hbmFnZXIuY29ubmVjdChcbiAgICAgICAgXCJub3RpZnk6OmRhcmtcIixcbiAgICAgICAgdGhpcy51cGRhdGVfbGlua190YWdfY29sb3IuYmluZCh0aGlzKSxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgdGhpcy5idWZmZXIudGFnX3RhYmxlLmFkZCh0aGlzLmJvbGRfdGFnKTtcbiAgICB0aGlzLmJ1ZmZlci50YWdfdGFibGUuYWRkKHRoaXMudW5kZXJsaW5lX3RhZyk7XG4gICAgdGhpcy5idWZmZXIudGFnX3RhYmxlLmFkZCh0aGlzLml0YWxpY190YWcpO1xuICAgIHRoaXMuYnVmZmVyLnRhZ190YWJsZS5hZGQodGhpcy5zdHJpa2V0aHJvdWdoX3RhZyk7XG4gICAgdGhpcy5idWZmZXIudGFnX3RhYmxlLmFkZCh0aGlzLmxpbmtfdGFnKTtcbiAgfVxuXG4gIGluaXRfdGFncyh0YWdzOiBOb3RlW1widGFnc1wiXSkge1xuICAgIGZvciAoY29uc3QgdGFnIG9mIHRhZ3MpIHtcbiAgICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5idWZmZXIuZ2V0X2l0ZXJfYXRfb2Zmc2V0KHRhZy5zdGFydCk7XG4gICAgICBjb25zdCBlbmQgPSB0aGlzLmJ1ZmZlci5nZXRfaXRlcl9hdF9vZmZzZXQodGFnLmVuZCk7XG4gICAgICB0aGlzLmJ1ZmZlci5hcHBseV90YWdfYnlfbmFtZSh0YWcubmFtZSwgc3RhcnQsIGVuZCk7XG4gICAgfVxuICB9XG5cbiAgaGFzX3RhZyh0YWc6IEd0ay5UZXh0VGFnKSB7XG4gICAgbGV0IFtzZWxlY3Rpb24sIHN0YXJ0LCBlbmRdID0gdGhpcy5idWZmZXIuZ2V0X3NlbGVjdGlvbl9ib3VuZHMoKTtcbiAgICBpZiAoIXNlbGVjdGlvbikge1xuICAgICAgc3RhcnQgPSB0aGlzLmJ1ZmZlci5nZXRfaXRlcl9hdF9tYXJrKFxuICAgICAgICB0aGlzLmJ1ZmZlci5nZXRfaW5zZXJ0KCksXG4gICAgICApO1xuICAgICAgZW5kID0gc3RhcnQuY29weSgpO1xuICAgICAgZW5kLmZvcndhcmRfY3Vyc29yX3Bvc2l0aW9uKCk7XG4gICAgfVxuXG4gICAgZG8ge1xuICAgICAgaWYgKHN0YXJ0Lmhhc190YWcodGFnKSAhPT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIHN0YXJ0LmdldF9vZmZzZXQoKTtcbiAgICAgIH1cbiAgICAgIHN0YXJ0LmZvcndhcmRfY2hhcigpO1xuICAgIH0gd2hpbGUgKHN0YXJ0LmNvbXBhcmUoZW5kKSA8IDApO1xuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgYXBwbHlfdGFnKHRhZzogR3RrLlRleHRUYWcpIHtcbiAgICBsZXQgW3NlbGVjdGlvbiwgc3RhcnQsIGVuZF0gPSB0aGlzLmJ1ZmZlci5nZXRfc2VsZWN0aW9uX2JvdW5kcygpO1xuICAgIC8vIGlmIG5vIHNlbGVjdGlvbiwgYXBwbHkgdG8gdGhlIGN1cnJlbnQgd29yZFxuICAgIGlmICghc2VsZWN0aW9uKSB7XG4gICAgICAvKipcbiAgICAgICAqIElmIHRoZSB1c2VyIGhhcyBub3Qgc2VsZWN0ZWQgYW55dGhpbmcsIHdlIGluc2VydCB6ZXJvLXdpZHRoIHNwYWNlc1xuICAgICAgICogYXJvdW5kIHRoZSBjdXJzb3IgYW5kIG1hcmsgdGhlbSBhcyB0aGUgc3RhcnQgYW5kIGVuZCBvZiB0aGUgc2VsZWN0aW9uLlxuICAgICAgICovXG4gICAgICBjb25zdCBnZXRfY3Vyc29yX3Bvc2l0aW9uID0gKCkgPT4gdGhpcy5idWZmZXIuY3Vyc29yX3Bvc2l0aW9uO1xuXG4gICAgICB0aGlzLmJ1ZmZlci5pbnNlcnRfYXRfY3Vyc29yKFwiXFx1MjAwQlxcdTIwMEJcXHUyMDBCXCIsIDkpO1xuICAgICAgc3RhcnQgPSB0aGlzLmJ1ZmZlci5nZXRfaXRlcl9hdF9vZmZzZXQoZ2V0X2N1cnNvcl9wb3NpdGlvbigpIC0gMyk7XG4gICAgICBlbmQgPSB0aGlzLmJ1ZmZlci5nZXRfaXRlcl9hdF9vZmZzZXQoZ2V0X2N1cnNvcl9wb3NpdGlvbigpIC0gMSk7XG4gICAgICBjb25zdCBzZWxlYyA9IHRoaXMuYnVmZmVyLmdldF9pdGVyX2F0X29mZnNldChnZXRfY3Vyc29yX3Bvc2l0aW9uKCkpO1xuICAgICAgc2VsZWMuYmFja3dhcmRfY2hhcnMoMik7XG4gICAgICB0aGlzLmJ1ZmZlci5wbGFjZV9jdXJzb3Ioc2VsZWMpO1xuICAgIH1cblxuICAgIGNvbnN0IGhhc190YWcgPSB0aGlzLmhhc190YWcodGFnKTtcblxuICAgIGlmICh0aGlzLmhhc190YWcodGFnKSAhPT0gZmFsc2UpIHtcbiAgICAgIHRoaXMuYnVmZmVyLnJlbW92ZV90YWcodGFnLCBzdGFydCwgZW5kKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5idWZmZXIuYXBwbHlfdGFnKHRhZywgc3RhcnQsIGVuZCk7XG4gICAgfVxuXG4gICAgdGhpcy5lbWl0KFwidGFnLXRvZ2dsZVwiLCB0YWcubmFtZSwgaGFzX3RhZyA9PT0gZmFsc2UpO1xuICB9XG5cbiAgY2xlYXJfdGFncygpIHtcbiAgICBjb25zdCBzdGFydCA9IHRoaXMuYnVmZmVyLmdldF9zdGFydF9pdGVyKCk7XG4gICAgY29uc3QgZW5kID0gdGhpcy5idWZmZXIuZ2V0X2VuZF9pdGVyKCk7XG5cbiAgICBmb3IgKGNvbnN0IFtuYW1lLCB0YWddIG9mIHRoaXMuYWN0aW9ucykge1xuICAgICAgdGhpcy5idWZmZXIucmVtb3ZlX3RhZyh0YWcsIHN0YXJ0LCBlbmQpO1xuICAgICAgdGhpcy5lbWl0KFwidGFnLXRvZ2dsZVwiLCBuYW1lLCBmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0X3RhZ3MoKSB7XG4gICAgY29uc3QgdGFnczogTm90ZVtcInRhZ3NcIl0gPSBbXTtcblxuICAgIHRoaXMuYnVmZmVyLmdldF90YWdfdGFibGUoKS5mb3JlYWNoKCh0YWcpID0+IHtcbiAgICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5idWZmZXIuZ2V0X3N0YXJ0X2l0ZXIoKTtcblxuICAgICAgZG8ge1xuICAgICAgICBpZiAoIXN0YXJ0LnN0YXJ0c190YWcodGFnKSkgY29udGludWU7XG5cbiAgICAgICAgY29uc3QgYmVnaW4gPSBzdGFydC5jb3B5KCk7XG4gICAgICAgIHN0YXJ0LmZvcndhcmRfdG9fdGFnX3RvZ2dsZSh0YWcpO1xuXG4gICAgICAgIHRhZ3MucHVzaCh7XG4gICAgICAgICAgbmFtZTogdGFnLm5hbWUsXG4gICAgICAgICAgc3RhcnQ6IGJlZ2luLmdldF9vZmZzZXQoKSxcbiAgICAgICAgICBlbmQ6IHN0YXJ0LmdldF9vZmZzZXQoKSxcbiAgICAgICAgfSk7XG4gICAgICB9IHdoaWxlIChzdGFydC5mb3J3YXJkX3RvX3RhZ190b2dnbGUodGFnKSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGFncztcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVhZG9ubHlTdGlja3lOb3RlIGV4dGVuZHMgQWJzdHJhY3RTdGlja3lOb3RlIHtcbiAgc3RhdGljIHtcbiAgICBHT2JqZWN0LnJlZ2lzdGVyQ2xhc3MoXG4gICAgICB7XG4gICAgICAgIEdUeXBlTmFtZTogXCJSZWFkb25seVN0aWNreU5vdGVcIixcbiAgICAgIH0sXG4gICAgICB0aGlzLFxuICAgICk7XG4gIH1cblxuICBjb25zdHJ1Y3Rvcihub3RlPzogTm90ZSkge1xuICAgIHN1cGVyKG5vdGUpO1xuXG4gICAgdGhpcy5ub3RlID0gbm90ZTtcbiAgICB0aGlzLmVkaXRhYmxlID0gZmFsc2U7XG4gICAgdGhpcy5jdXJzb3JfdmlzaWJsZSA9IGZhbHNlO1xuICAgIHRoaXMuc2hvd19jb250ZW50KCk7XG4gIH1cblxuICBzZXQgbm90ZShub3RlOiBOb3RlIHwgdW5kZWZpbmVkKSB7XG4gICAgdGhpcy5fbm90ZSA9IHN1cGVyLm5vdGUgPSBub3RlO1xuXG4gICAgdGhpcy5zaG93X2NvbnRlbnQoKTtcbiAgfVxuXG4gIGdldCBub3RlKCkge1xuICAgIHJldHVybiBzdXBlci5ub3RlO1xuICB9XG5cbiAgY2xpcF9jb250ZW50KGNvbnRlbnQ6IHN0cmluZykge1xuICAgIGNvbnN0IE1BWF9MSU5FUyA9IDU7XG4gICAgY29uc3QgTUFYX0NIQVJTID0gMjQwO1xuXG4gICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvXFxzKyQvLCBcIlwiKTtcblxuICAgIGxldCBjdXQgPSBjb250ZW50LnNwbGl0KFwiXFxuXCIpLnNsaWNlKDAsIE1BWF9MSU5FUykuam9pbihcIlxcblwiKTtcblxuICAgIGlmIChjdXQubGVuZ3RoID4gTUFYX0NIQVJTKSB7XG4gICAgICBjdXQgPSBjdXQuc2xpY2UoMCwgTUFYX0NIQVJTKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY3V0Lmxlbmd0aCA8IGNvbnRlbnQubGVuZ3RoID8gYCR7Y3V0fVx1MjAyNmAgOiBjdXQ7XG4gIH1cblxuICBzaG93X2NvbnRlbnQoKSB7XG4gICAgaWYgKCF0aGlzLm5vdGUpIHJldHVybjtcblxuICAgIGlmICghdGhpcy5ub3RlLmNvbnRlbnQucmVwbGFjZSgvXFxzL2csIFwiXCIpKSB7XG4gICAgICB0aGlzLmJ1ZmZlci50ZXh0ID0gXCJcIjtcbiAgICAgIHRoaXMuYnVmZmVyLmluc2VydF9tYXJrdXAoXG4gICAgICAgIHRoaXMuYnVmZmVyLmdldF9zdGFydF9pdGVyKCksXG4gICAgICAgIGA8aT4oJHtfKFwiRW1wdHkgTm90ZVwiKX0pPC9pPmAsXG4gICAgICAgIC0xLFxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5idWZmZXIudGV4dCA9IHRoaXMuY2xpcF9jb250ZW50KHRoaXMubm90ZSEuY29udGVudCk7XG4gICAgICB0aGlzLmNsZWFyX3RhZ3MoKTtcbiAgICAgIHRoaXMuaW5pdF90YWdzKHRoaXMubm90ZSEudGFncyk7XG4gICAgfVxuICB9XG5cbiAgaW5pdF9saXN0ZW5lcnMoKSB7XG4gICAgc3VwZXIuaW5pdF9saXN0ZW5lcnMoKTtcblxuICAgIGlmICghdGhpcy5ub3RlKSByZXR1cm47XG5cbiAgICB0aGlzLmxpc3RlbmVycy5hZGQodGhpcy5ub3RlLmNvbm5lY3QoXCJub3RpZnk6OmNvbnRlbnRcIiwgKCkgPT4ge1xuICAgICAgdGhpcy5zaG93X2NvbnRlbnQoKTtcbiAgICB9KSk7XG5cbiAgICB0aGlzLmxpc3RlbmVycy5hZGQodGhpcy5ub3RlLmNvbm5lY3QoXCJub3RpZnk6OnRhZ19saXN0XCIsICgpID0+IHtcbiAgICAgIHRoaXMuY2xlYXJfdGFncygpO1xuICAgICAgdGhpcy5pbml0X3RhZ3ModGhpcy5ub3RlIS50YWdzKTtcbiAgICB9KSk7XG4gIH1cblxuICByZW1vdmVfbGlzdGVuZXJzKCkge1xuICAgIHN1cGVyLnJlbW92ZV9saXN0ZW5lcnMoKTtcblxuICAgIGlmICghdGhpcy5ub3RlKSByZXR1cm47XG5cbiAgICBmb3IgKGNvbnN0IGxpc3RlbmVyIG9mIHRoaXMubGlzdGVuZXJzKSB7XG4gICAgICB0aGlzLm5vdGUhLmRpc2Nvbm5lY3QobGlzdGVuZXIpO1xuICAgIH1cblxuICAgIHRoaXMubGlzdGVuZXJzLmNsZWFyKCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFdyaXRlYWJsZVN0aWNreU5vdGUgZXh0ZW5kcyBBYnN0cmFjdFN0aWNreU5vdGUge1xuICBzdGF0aWMge1xuICAgIEdPYmplY3QucmVnaXN0ZXJDbGFzcyhcbiAgICAgIHtcbiAgICAgICAgR1R5cGVOYW1lOiBcIldyaXRlYWJsZVN0aWNreU5vdGVcIixcbiAgICAgIH0sXG4gICAgICB0aGlzLFxuICAgICk7XG4gIH1cblxuICB1cGRhdGluZyA9IGZhbHNlO1xuICBzb3VyY2U6IG51bWJlciB8IG51bGwgPSBudWxsO1xuXG4gIGdldCBub3RlKCkge1xuICAgIHJldHVybiBzdXBlci5ub3RlO1xuICB9XG5cbiAgc2V0IG5vdGUobm90ZTogTm90ZSB8IHVuZGVmaW5lZCkge1xuICAgIHRoaXMudXBkYXRpbmcgPSB0cnVlO1xuICAgIHN1cGVyLm5vdGUgPSBub3RlO1xuICB9XG5cbiAgY2hhbmdlPFQgZXh0ZW5kcyBrZXlvZiBOb3RlPihrZXk6IFQsIHZhbHVlOiBOb3RlW1RdKSB7XG4gICAgaWYgKCF0aGlzLm5vdGUpIHJldHVybjtcbiAgICB0aGlzLm5vdGVba2V5XSA9IHZhbHVlO1xuICAgIHRoaXMubm90ZS5tb2RpZmllZF9kYXRlID0gbmV3IERhdGUoKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKG5vdGU/OiBOb3RlKSB7XG4gICAgc3VwZXIobm90ZSk7XG5cbiAgICB0aGlzLmJ1ZmZlci5jb25uZWN0X2FmdGVyKFwiaW5zZXJ0LXRleHRcIiwgKGJ1ZmZlciwgbG9jLCB0ZXh0LCBsZW5ndGgpID0+IHtcbiAgICAgIHRoaXMub25fdGV4dF9pbnNlcnRlZChidWZmZXIsIGxvYywgdGV4dCwgbGVuZ3RoKTtcbiAgICB9KTtcblxuICAgIHRoaXMuYnVmZmVyLmNvbm5lY3QoXCJjaGFuZ2VkXCIsICgpID0+IHtcbiAgICAgIGlmICh0aGlzLnVwZGF0aW5nKSB7XG4gICAgICAgIHRoaXMudXBkYXRpbmcgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy51cGRhdGVfbGlua3MoKTtcbiAgICAgIGlmICh0aGlzLmJ1ZmZlci50ZXh0ID09IHRoaXMubm90ZSEuY29udGVudCkgcmV0dXJuO1xuICAgICAgdGhpcy5jaGFuZ2UoXCJjb250ZW50XCIsIHRoaXMuYnVmZmVyLnRleHQpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5idWZmZXIuY29ubmVjdChcIm1hcmstc2V0XCIsICgpID0+IHtcbiAgICAgIGlmICghdGhpcy5ub3RlKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IHRhZ3MgPSB0aGlzLmdldF90YWdzKCk7XG4gICAgICBpZiAoY29tcGFyZV90YWdzKHRhZ3MsIHRoaXMubm90ZS50YWdzKSkgcmV0dXJuO1xuICAgICAgdGhpcy5ub3RlLnRhZ3MgPSB0YWdzO1xuICAgIH0pO1xuICB9XG5cbiAgY2xlYXJfbGlua3MoKSB7XG4gICAgdGhpcy5idWZmZXIucmVtb3ZlX3RhZyhcbiAgICAgIHRoaXMubGlua190YWcsXG4gICAgICB0aGlzLmJ1ZmZlci5nZXRfc3RhcnRfaXRlcigpLFxuICAgICAgdGhpcy5idWZmZXIuZ2V0X2VuZF9pdGVyKCksXG4gICAgKTtcbiAgICB0aGlzLmVtaXQoXCJ0YWctdG9nZ2xlXCIsIFwibGlua1wiLCBmYWxzZSk7XG4gIH1cblxuICB1cGRhdGVfbGlua3MoKSB7XG4gICAgY29uc3QgdGV4dCA9IHRoaXMuYnVmZmVyLnRleHQ7XG5cbiAgICB0aGlzLmNsZWFyX2xpbmtzKCk7XG5cbiAgICBmaW5kKHRleHQpXG4gICAgICAuZm9yRWFjaCgobWF0Y2gpID0+IHtcbiAgICAgICAgY29uc3Qgc3RhcnQgPSB0aGlzLmJ1ZmZlci5nZXRfaXRlcl9hdF9vZmZzZXQobWF0Y2guc3RhcnQpO1xuICAgICAgICBjb25zdCBlbmQgPSB0aGlzLmJ1ZmZlci5nZXRfaXRlcl9hdF9vZmZzZXQobWF0Y2guZW5kKTtcblxuICAgICAgICB0aGlzLmJ1ZmZlci5hcHBseV90YWcodGhpcy5saW5rX3RhZywgc3RhcnQsIGVuZCk7XG4gICAgICB9KTtcblxuICAgIHRoaXMuZW1pdChcInRhZy10b2dnbGVcIiwgXCJsaW5rXCIsIHRydWUpO1xuICB9XG5cbiAgY2xlYXJfdGFncygpIHtcbiAgICBzdXBlci5jbGVhcl90YWdzKCk7XG4gICAgLy8gdGhpcy5jaGFuZ2UoXCJ0YWdzXCIsIFtdKTtcbiAgfVxuXG4gIGFwcGx5X3RhZyh0YWc6IEd0ay5UZXh0VGFnKSB7XG4gICAgc3VwZXIuYXBwbHlfdGFnKHRhZyk7XG4gICAgY29uc3QgdGFncyA9IHRoaXMuZ2V0X3RhZ3MoKTtcbiAgICBpZiAoY29tcGFyZV90YWdzKHRhZ3MsIHRoaXMubm90ZSEudGFncykpIHJldHVybjtcbiAgICB0aGlzLmNoYW5nZShcInRhZ3NcIiwgdGFncyk7XG4gIH1cblxuICBvbl90ZXh0X2luc2VydGVkKFxuICAgIGJ1ZmZlcjogR3RrLlRleHRCdWZmZXIsXG4gICAgbG9jOiBHdGsuVGV4dEl0ZXIsXG4gICAgdGV4dDogc3RyaW5nLFxuICAgIGxlbmd0aDogbnVtYmVyLFxuICApIHtcbiAgICBpZiAodGV4dCA9PT0gXCJcXG5cIikge1xuICAgICAgY29uc3Qgc3RhcnRfaXRlciA9IGxvYy5jb3B5KCk7XG4gICAgICBzdGFydF9pdGVyLmJhY2t3YXJkX2NoYXIoKTtcbiAgICAgIHN0YXJ0X2l0ZXIuc2V0X2xpbmVfb2Zmc2V0KDApO1xuXG4gICAgICBjb25zdCBlbmRfaXRlciA9IHN0YXJ0X2l0ZXIuY29weSgpO1xuICAgICAgZW5kX2l0ZXIuZm9yd2FyZF9jaGFycygyKTtcbiAgICAgIGNvbnN0IGNoYXJzID0gYnVmZmVyLmdldF90ZXh0KHN0YXJ0X2l0ZXIsIGVuZF9pdGVyLCBmYWxzZSk7XG5cbiAgICAgIGNvbnN0IHNpbXBsZV9yZWdleF9wYXR0ZXJuID0gL15bLSsqXSAkLztcbiAgICAgIGlmIChzaW1wbGVfcmVnZXhfcGF0dGVybi50ZXN0KGNoYXJzKSkge1xuICAgICAgICBjb25zdCBidWxsZXQgPSBjaGFyc1swXTtcbiAgICAgICAgY29uc3QgbGluZV9lbmQgPSBsb2MuY29weSgpO1xuICAgICAgICBsaW5lX2VuZC5iYWNrd2FyZF9jaGFyKCk7XG4gICAgICAgIGlmIChsaW5lX2VuZC5nZXRfbGluZV9vZmZzZXQoKSA9PT0gMikge1xuICAgICAgICAgIHN0YXJ0X2l0ZXIuc2V0X2xpbmVfb2Zmc2V0KDApO1xuICAgICAgICAgIGJ1ZmZlci5kZWxldGUoc3RhcnRfaXRlciwgbG9jKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBidWZmZXIuaW5zZXJ0KGxvYywgYnVsbGV0ICsgXCIgXCIsIC0xKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgc2VhcmNoX2xpbWl0ID0gc3RhcnRfaXRlci5jb3B5KCk7XG4gICAgICAgIGNvbnN0IHNlYXJjaF9lbmQgPSBzdGFydF9pdGVyLmNvcHkoKTtcbiAgICAgICAgc2VhcmNoX2xpbWl0LmZvcndhcmRfY2hhcnMoMTApO1xuXG4gICAgICAgIHNlYXJjaF9lbmQuZm9yd2FyZF9maW5kX2NoYXIoKGNoKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJmb3J3YXJkIGNoYXJcIixjaCk7XG4gICAgICAgICAgcmV0dXJuIGNoID09PSBcIiBcIjtcbiAgICAgICAgfSwgc2VhcmNoX2xpbWl0KTtcbiAgICAgICAgc2VhcmNoX2VuZC5mb3J3YXJkX2NoYXIoKTtcbiAgICAgICAgY29uc3QgY2hhcnMgPSBidWZmZXIuZ2V0X3RleHQoc3RhcnRfaXRlciwgc2VhcmNoX2VuZCwgZmFsc2UpO1xuXG4gICAgICAgIGNvbnN0IG9yZGVyZWRfcmVnZXhfcGF0dGVybiA9IC9eXFxkK1xcLiAkLztcbiAgICAgICAgaWYgKG9yZGVyZWRfcmVnZXhfcGF0dGVybi50ZXN0KGNoYXJzKSkge1xuICAgICAgICAgIGNvbnN0IGN1cnJlbnRfb3JkZXIgPSBwYXJzZUludChjaGFycy5zbGljZSgwLCAtMikpO1xuICAgICAgICAgIGNvbnN0IG5ld19vcmRlciA9IGN1cnJlbnRfb3JkZXIgKyAxO1xuICAgICAgICAgIGNvbnN0IG5ld19vcmRlcl9idWxsZXQgPSBgJHtuZXdfb3JkZXJ9LiBgO1xuICAgICAgICAgIGNvbnN0IGxpbmVfZW5kID0gbG9jLmNvcHkoKTtcbiAgICAgICAgICBsaW5lX2VuZC5iYWNrd2FyZF9jaGFyKCk7XG5cbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBsaW5lX2VuZC5nZXRfbGluZV9vZmZzZXQoKSA9PT0gY3VycmVudF9vcmRlci50b1N0cmluZygpLmxlbmd0aCArIDJcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHN0YXJ0X2l0ZXIuc2V0X2xpbmVfb2Zmc2V0KDApO1xuICAgICAgICAgICAgYnVmZmVyLmRlbGV0ZShzdGFydF9pdGVyLCBsb2MpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBidWZmZXIuaW5zZXJ0KGxvYywgbmV3X29yZGVyX2J1bGxldCwgLTEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5jb25zdCBjb21wYXJlX3RhZ3MgPSAoYTogSVRhZ1tdLCBiOiBJVGFnW10pID0+IHtcbiAgaWYgKGEubGVuZ3RoICE9IGIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gIGZvciAoY29uc3QgdGFnIG9mIGEpIHtcbiAgICBpZiAoXG4gICAgICAhYi5maW5kKCh0KSA9PlxuICAgICAgICB0Lm5hbWUgPT0gdGFnLm5hbWUgJiYgdC5zdGFydCA9PSB0YWcuc3RhcnQgJiYgdC5lbmQgPT0gdGFnLmVuZFxuICAgICAgKVxuICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn07XG4iLCAiLy8gVEhJUyBGSUxFIElTIEFVVE9NQVRJQ0FMTFkgR0VORVJBVEVEIERPIE5PVCBFRElUIERJUkVDVExZXG4vLyBTZWUgdXBkYXRlLXRsZHMuanMgZm9yIGVuY29kaW5nL2RlY29kaW5nIGZvcm1hdFxuLy8gaHR0cHM6Ly9kYXRhLmlhbmEub3JnL1RMRC90bGRzLWFscGhhLWJ5LWRvbWFpbi50eHRcbmNvbnN0IGVuY29kZWRUbGRzID0gJ2FhYTFycDNiYXJ0aDRiMG90dDN2aWU0YzFsZTJvZ2FkbzV1ZGhhYmk3YzBhZGVteTVjZW50dXJlNm91bnRhbnQwczlvMXRvcjRkMHMxdWx0NGUwZzFybzJ0bmE0ZjBsMXJpY2E1ZzBha2hhbjVlbmN5NWkwZzFyYnVzM2ZvcmNlNXRlbDVrZG4zbDBmYXJvbWVvN2liYWJhNHBheTRsZmluYW56NnN0YXRlNXkyc2FjZTN0b201bTBhem9uNGVyaWNhbmV4cHJlc3M3ZmFtaWx5MTF4MmZhbTNpY2Ezc3RlcmRhbThuYWx5dGljczdkcm9pZDVxdWFuNHoybzBsMnBhcnRtZW50czhwMGxlNHEwdWFyZWxsZThyMGFiMW1jbzRjaGkzbXkycGEydDBlM3MwZGEyaWEyc29jaWF0ZXM5dDBobGV0YTV0b3JuZXk3dTBjdGlvbjVkaTBibGUzbzNzcG9zdDV0aG9yM28wczR2aWFuY2E2dzBzMngwYTJ6MHVyZTViYTBieTJpZHUzbmFtZXgzbmFyZXB1YmxpYzExZDFrMnIwY2Vsb25hNWxheWNhcmQ0czVlZm9vdDVnYWluczZzZWJhbGw1a2V0YmFsbDh1aGF1czV5ZXJuNWIwYzF0MXZhM2NnMW4yZDFlMGF0czJ1dHk0ZXIybnRsZXk1cmxpbjRzdDBidXk1dDJmMWcxaDBhcnRpNWkwYmxlM2Qxa2UybmcwbzNvMXoyajFsYWNrMGZyaWRheTlvY2tidXN0ZXI4ZzFvbWJlcmc3dWUzbTBzMXcybjBwcGFyaWJhczlvMGF0czNlaHJpbmdlcjhmYTJtMW5kMm8wazBpbmc1c2NoMnRpazJvbjR0MXV0aXF1ZTZ4MnIwYWRlc2NvNmlkZ2VzdG9uZTlvYWR3YXk1a2VyM3RoZXI1dXNzZWxzN3MxdDF1aWxkMGVyczZzaW5lc3M2eTF6ejN2MXcxeTF6MGgzY2EwYjFmZTJsMGwxdmlua2xlaW45bTBlcmEzcDJub24zcGV0b3duNWl0YWwwb25lOHIwYXZhbjRkczJlMGVyMHM0czJzYTFlMWgxaW5vNHQwZXJpbmc1aG9saWM3YmExbjFyZTJzMmMxZDFlbnRlcjRvMXJuM2YwYTFkMmcxaDBhbmVsMm5lbDRyaXR5NHNlMnQyZWFwM2ludGFpNXJpc3RtYXM2b21lNHVyY2g1aTBwcmlhbmk2cmNsZTRzY28zdGFkZWw0aTBjMnkwZWF0czdrMWwwYWltczRlYW5pbmc2aWNrMm5pYzFxdWU2b3RoaW5nNXVkM3ViMG1lZDZtMW4xbzBhY2gzZGVzM2ZmZWU0bGxlZ2U0b2duZTVtMGNhc3Q0bWJhbms0dW5pdHk2cGFueTJyZTN1dGVyNXNlYzRuZG9zM3N0cnVjdGlvbjh1bHRpbmc3dGFjdDNyYWN0b3JzOW9raW5nMGNoYW5uZWwxMWwxcDJyc2ljYTV1bnRyeTRwb24wczRyc2VzNnBhMnIwZWRpdDBjYXJkNHVuaW9uOWlja2V0NW93bjNzMXVpc2UwczZ1MGlzaW5lbGxhOXYxdzF4MXkwbXJ1M291M3oyZGFidXIzZDFuY2UzdGExZTFpbmczc3VuNHkyY2xrM2RzMmUwYWwwZXIyczNncmVlNGxpdmVyeTVsMW9pdHRlNXRhM21vY3JhdDZudGFsMmlzdDVzaTBnbjR2MmhsMmlhbW9uZHM2ZXQyZ2l0YWw1cmVjdDBvcnk3c2NvdW50M3ZlcjVoMnkyajFrMW0xbnAybzBjczF0b3I0ZzFtYWluczV0MXdubG9hZDdyaXZlNHR2MnViYWkzbmxvcDRwb250NHJiYW41dmFnMnIyejJlYXJ0aDN0MmMwbzJkZWthM3UwY2F0aW9uOGUxZzFtYWlsM2VyY2s1bmVyZ3k0Z2luZWVyMGluZzl0ZXJwcmlzZXMxMHBzb240cXVpcG1lbnQ4cjBpY3Nzb242bmkzczBxMXRhdGU1dDBpc2FsYXQ3dTByb3Zpc2lvbjhzMnZlbnRzNXhjaGFuZ2U2cGVydDNvc2VkNHJlc3M1dHJhc3BhY2UxMGZhZ2UyaWwxcndpbmRzNnRoM21pbHk0bjBzMnJtMGVyczVzaGlvbjR0M2VkZXgzZWRiYWNrNnJyYXJpM2VybzZpMGF0MmRlbGl0eTVvMmxtMm5hbDFuY2UxaWFsN3JlMHN0b25lNm1kYWxlNnNoMGluZzV0MG5lc3M2ajFrMWxpY2tyM2dodHM0cjJvcmlzdDR3ZXJzNXkybTFvMG8wZDBuZXR3b3JrOHRiYWxsNnJkMWV4MnNhbGU0dW0zdW5kYXRpb244eDJyMGVlMXNlbml1czdsMW9nYW5zNG50ZG9vcjRpZXI3dHIydWppdHN1NW4wZDJybml0dXJlN3Rib2w1eWkzZ2EwbDBsZXJ5M28xdXA0bWUwczNwMXJkZW40eTJiMGl6M2QwbjJlMGExbnQwaW5nNW9yZ2U1ZjFnMGVlM2gxaTBmdDBzM3ZlczJpbmc1bDBhc3MzZTFvYmFsMm80bTBhaWwzYmgybzF4Mm4xb2RhZGR5NWxkMHBvaW50NmYybzBkeWVhcjVnMGxlNHAxdDF2MnAxcTFyMGFpbmdlcjVwaGljczV0aXM0ZWVuM2lwZTNvY2VyeTR1cDRzMXQxdTBhcmRpYW42Y2NpM2dlMmlkZTJ0YXJzNXJ1M3cxeTJoYWlyMm1idXJnNW5nb3V0NXVzM2JvMmRmYzBiYW5rN2VhbHRoMGNhcmU4bHAxc2lua2k2cmUxbWVzNWd0djNpcGhvcDRzYW1pdHN1N3RhY2hpNXYyazB0Mm0xbjFvY2tleTRsZGluZ3M1aWRheTVtZWRlcG90NWdvb2RzNXMwZW5zZTduZGEzcnNlM3NwaXRhbDV0MGluZzV0MGVsZXMyczNtYWlsNXVzZTN3MnIxc2JjM3QxdTBnaGVzNXlhdHQzdW5kYWk3aWJtMmNiYzJlMXUyZDFlMGVlM2ZtMmthbm80bDFtMGFtYXQ0ZGIybW8wYmlsaWVuOW4wYzFkdXN0cmllczhmaW5pdGk1bzJnMWsxc3RpdHV0ZTZ1cmFuY2U0ZTR0MGVybmF0aW9uYWwxMHVpdDR2ZXN0bWVudHMxMG8xcGlyYW5nYTdxMXIwaXNoNHMwbWFpbGk1dDBhbmJ1bDd0MGF1MnYzamFndWFyNHZhM2NiMmUwZXAydHp0M3dlbHJ5NmlvMmxsMm0wcDJuajJvMGJzMXVyZzR0MXkycDBtb3JnYW42cnMzdWVnb3M0bmlwZXI3a2F1ZmVuNWRkaTNlMHJyeWhvdGVsczZsb2dpc3RpY3M5cHJvcGVydGllczE0ZmgyZzFoMWkwYTFkczJtMW5kZXIybGU0dGNoZW41d2kzbTFuMW9lbG4zbWF0c3U1c2hlcjVwMG1nMm4ycjBkMWVkM3Vva2dyb3VwOHcxeTBvdG80ejJsYTBjYWl4YTVtYm9yZ2hpbmk4ZXIzbmNhc3RlcjVpYTNkMHJvdmVyNnhlc3M1c2FsbGU1dDBpbm8zcm9iZTV3MHllcjViMWMxZHMyZWFzZTNjbGVyYzVmcmFrNGdhbDJvMnh1czRnYnQzaTBkbDJmZTBpbnN1cmFuY2U5c3R5bGU3Z2h0aW5nNmtlMmxseTNtaXRlZDRvMm5jb2xuNGRlMmsycHN5M3ZlMWluZzVrMWxjMXAyb2FuMHMzY2tlcjN1czNsMW5kb240dHRlMW8zdmUzcGwwZmluYW5jaWFsMTFyMXMxdDBkMGEzdTBuZGJlY2s2eGUxdXJ5NXYxeTJtYTBjeXMzZHJpZDRpZjFzb240a2V1cDRuMGFnZW1lbnQ3Z28zcDFya2V0MGluZzNzNHJpb3R0NXNoYWxsczdzZXJhdGk2dHRlbDViYTJjMGtpbnNleTdkMWUwZDBpYTNldDJsYm91cm5lN21lMW9yaWFsNm4wdTJyY2ttc2Q3ZzFoMWlhbWkzY3Jvc29mdDdsMW5pMXQydDBzdWJpc2hpOWsxbDBiMXMybTBhMm4xbzBiaTBsZTRkYTJlMWkxbTFuYXNoM2V5MnN0ZXI1cm1vbjN0Z2FnZTZzY293NHRvMHJjeWNsZXM5djBpZTRwMXExcjFzMGQydDBuMXIydTBzZXVtM2ljM3R1YWw1djF3MXgxeTF6Mm5hMGIxZ295YTRtZTJ0dXJhNHZ5M2JhMmMxZTBjMXQwYmFuazRmbGl4NHdvcms1dXN0YXI1dzBzMnh0MGRpcmVjdDd1czRmMGwyZzBvMmhrMmkwY28ya2Uxb24zbmphM3NzYW4xeTVsMW8wa2lhM3J0aHdlc3Rlcm5tdXR1YWwxNG9uNHcwcnV6M3R2NHAxcjBhMXcydHQydTF5YzJ6Mm9iaTFzZXJ2ZXI3ZmZpY2U1a2luYXdhNmxheWFuMGdyb3VwOWRuYXZ5NWxvM20wZWdhNG5lMWcxbDBpbmU1b28ycGVuM3JhY2xlM25nZTRnMGFuaWM1aWdpbnM2c2FrYTR0c3VrYTR0MnZoM3BhMGdlMm5hc29uaWM3cmlzMnMxdG5lcnM0czF5M3NzYWdlbnM3eTJjY3czZTB0MmYwaXplcjVnMWgwYXJtYWN5NmQxaWxpcHM1b25lMnRvMGdyYXBoeTZzNHlzaW81aWNzMXRldDJ1cmVzNmQxbjBnMWsyb25lZXI1enphNGsxbDBhY2UyeTBzdGF0aW9uOXVtYmluZzVzM20xbjBjMm9obDJrZXIzbGl0aWU1cm4yc3QzcjBhbWVyaWNhNnhpM2VzczNpbWUzbzBkMHVjdGlvbnM4ZjFncmVzc2l2ZThtbzJwZXJ0aWVzM3k1dGVjdGlvbjh1MGRlbnRpYWw5czF0MXViMncwYzJ5MnFhMXBvbjN1ZWJlYzNzdDVyYWNpbmc0ZGlvNGUwYWQxbGVzdGF0ZTZ0b3IyeTRjaXBlczVkMHN0b25lNXVtYnJlbGxhOWhhYjNpc2UwbjN0MmxpYW5jZTZuMHQwYWxzNXBhaXIzb3J0M3VibGljYW44c3QwYXVyYW50OHZpZXcwczV4cm90aDZpY2gwYXJkbGk2b2gzbDFvMXAybzBjaGVyM2tzM2RlbzNnZXJzNG9tM3MwdnAzdTBnYnkzaHIybjJ3MGUyeXVreXU2c2EwYXJsYW5kNmZlMHR5NGt1cmE0bGUxb24zbXNjbHViNHVuZzVuZHZpazBjb3JvbWFudDEyb2ZpNHAxcmwyczF2ZTJ4bzNiMGkxczJjMGExYjFoYWVmZmxlcjdtaWR0NG9sYXJzaGlwczhvbDN1bGUzd2FyejVpZW5jZTVvdDNkMWUwYXJjaDN0MmN1cmUxaXR5NmVrMmxlY3Q0bmVyM3J2aWNlczZ2ZW4zdzF4MHkzZnIyZzFoMGFuZ3JpbGE2cnAydzJlbGwzaWExa3NoYTVvZXMycDBwaW5nNXVqaTN3MHRpbWU3aTBsazJuYTFnbGVzNXRlM2oxazBpMG4yeTBwZTRsMGluZzRtMGFydDNpbGU0bjBjZjNvMGNjZXIzaWFsNGZ0YmFuazR3YXJlNmh1MmxhcjJ1dGlvbnM3bmcxeTJ5MnBhMGNlM29ydDJ0M3IwbDJzMXQwYWRhMnBsZXM0cjF0ZWJhbms0ZmFybTdjMGdyb3VwNm9ja2hvbG02cmFnZTNlM3JlYW00dWRpbzJ5M3lsZTR1MGNrczNwcGxpZXMzeTJvcnQ1cmYxZ2VyeTV6dWtpNXYxd2F0Y2g0aXNzNHgxeTBkbmV5NHN0ZW1zNnoydGFiMWlwZWk0bGsyb2JhbzRyZ2V0NHRhbW90b3JzNnIydG9vNHgwaTNjMGkyZDBrMmVhbTJjaDBub2xvZ3k4bDFtYXNlazVubmlzNHZhM2YxZzFoMGQxZWF0ZXIycmU2aWFhMmNrZXRzNWVuZGE0ZmZhbnk1cHMycmVzMm9sNGowbWF4eDR4MmswbWF4eDVsMW0wYWxsNG4xbzBkYXkza3lvM29sczNwMXJheTNzaGliYTV0YWwzdXJzM3duMnlvdGEzczNyMGFkZTFpbmc0aW5pbmc1dmVsMGNoYW5uZWw3ZXJzMGluc3VyYW5jZTE2dXN0M3YydDF1YmUyaTFuZXMzc2h1NHYwczJ3MXoydWExYmFuazNzMmcxazFuaWNvbTN2ZXJzaXR5OG8yb2wycHMyczF5MXoydmEwY2F0aW9uczduYTFndWFyZDdjMWUwZ2FzM250dXJlczZyaXNpZ241bVx1MDBGNmdlbnNiZXJhdGVyMnVuZzE0c2ljaGVydW5nMTB0MmcxaTBhamVzNGRlbzNnMWtpbmc0bGxhczRuMXAxcmdpbjRzYTFpb240dmExbzNsYWFuZGVyZW45bjFvZGthM2xrc3dhZ2VuN3ZvM3RlMWluZzNvMnlhZ2U1dTBlbG9zNndhbGVzMm1hcnQ0dGVyNG5nMGdvdTV0Y2gwZXM2ZWF0aGVyMGNoYW5uZWwxMmJjYW0zZXIyc2l0ZTVkMGRpbmc1aWJvMnIzZjFob3N3aG82aWVuMmtpMmxsaWFtaGlsbDluMGRvd3M0ZTFuZXJzNm1lMm9sdGVyc2tsdXdlcjExb2RzaWRlNnJrMHMybGQzdzJzMXRjMWYzeGJveDNlcm94NGZpbml0eTZpaHVhbjRuMnh4Mnl6M3lhY2h0czRob28zbWF4dW41bmRleDVlMW9kb2Jhc2hpN2dhMmtvaGFtYTZ1MHR1YmU2dDF1bjN6YTBwcG9zNHJhM2VybzNpcDJtMW9uZTN1ZXJpY2g2dzInO1xuLy8gSW50ZXJuYXRpb25hbGl6ZWQgZG9tYWluIG5hbWVzIGNvbnRhaW5pbmcgbm9uLUFTQ0lJXG5jb25zdCBlbmNvZGVkVXRsZHMgPSAnXHUwM0I1XHUwM0JCMVx1MDNDNTJcdTA0MzFcdTA0MzMxXHUwNDM1XHUwNDNCM1x1MDQzNFx1MDQzNVx1MDQ0Mlx1MDQzODRcdTA0MzVcdTA0NEUyXHUwNDNBXHUwNDMwXHUwNDQyXHUwNDNFXHUwNDNCXHUwNDM4XHUwNDNBNlx1MDQzRVx1MDQzQzNcdTA0M0NcdTA0M0FcdTA0MzQyXHUwNDNFXHUwNDNEMVx1MDQ0MVx1MDQzQVx1MDQzMlx1MDQzMDZcdTA0M0VcdTA0M0RcdTA0M0JcdTA0MzBcdTA0MzlcdTA0M0Q1XHUwNDQwXHUwNDMzM1x1MDQ0MFx1MDQ0M1x1MDQ0MTJcdTA0NDQyXHUwNDQxXHUwNDMwXHUwNDM5XHUwNDQyM1x1MDQ0MFx1MDQzMTNcdTA0NDNcdTA0M0FcdTA0NDAzXHUwNDlCXHUwNDMwXHUwNDM3M1x1MDU3MFx1MDU2MVx1MDU3NTNcdTA1RDlcdTA1RTlcdTA1RThcdTA1RDBcdTA1REM1XHUwNUU3XHUwNUQ1XHUwNUREM1x1MDYyN1x1MDYyOFx1MDY0OFx1MDYzOFx1MDYyOFx1MDY0QTVcdTA2MkFcdTA2MzVcdTA2MjdcdTA2NDRcdTA2MjdcdTA2MkE2XHUwNjMxXHUwNjI3XHUwNjQ1XHUwNjQzXHUwNjQ4NVx1MDY0NFx1MDYyN1x1MDYzMVx1MDYyRlx1MDY0NjRcdTA2MjhcdTA2MkRcdTA2MzFcdTA2NEFcdTA2NDY1XHUwNjJDXHUwNjMyXHUwNjI3XHUwNjI2XHUwNjMxNVx1MDYzM1x1MDYzOVx1MDY0OFx1MDYyRlx1MDY0QVx1MDYyOTZcdTA2MzlcdTA2NDRcdTA2NEFcdTA2MjdcdTA2NDY1XHUwNjQ1XHUwNjNBXHUwNjMxXHUwNjI4NVx1MDY0NVx1MDYyN1x1MDYzMVx1MDYyN1x1MDYyQTVcdTA2Q0NcdTA2MzFcdTA2MjdcdTA2NDY1XHUwNjI4XHUwNjI3XHUwNjMxXHUwNjJBMlx1MDYzMlx1MDYyN1x1MDYzMTRcdTA2NEFcdTA2MkFcdTA2NDMzXHUwNkJFXHUwNjI3XHUwNjMxXHUwNjJBNVx1MDYyQVx1MDY0OFx1MDY0Nlx1MDYzMzRcdTA2MzNcdTA2NDhcdTA2MkZcdTA2MjdcdTA2NDYzXHUwNjMxXHUwNjRBXHUwNjI5NVx1MDYzNFx1MDYyOFx1MDY0M1x1MDYyOTRcdTA2MzlcdTA2MzFcdTA2MjdcdTA2NDIyXHUwNjI4Mlx1MDY0NVx1MDYyN1x1MDY0NjRcdTA2NDFcdTA2NDRcdTA2MzNcdTA2MzdcdTA2NEFcdTA2NDY2XHUwNjQyXHUwNjM3XHUwNjMxM1x1MDY0M1x1MDYyN1x1MDYyQlx1MDY0OFx1MDY0NFx1MDY0QVx1MDY0MzZcdTA2NDhcdTA2NDUzXHUwNjQ1XHUwNjM1XHUwNjMxMlx1MDY0NFx1MDY0QVx1MDYzM1x1MDY0QVx1MDYyNzVcdTA2NDhcdTA2MzFcdTA2NEFcdTA2MkFcdTA2MjdcdTA2NDZcdTA2NEFcdTA2Mjc3XHUwNjQyXHUwNjM5NFx1MDY0N1x1MDY0NVx1MDYzMVx1MDYyN1x1MDY0NzVcdTA2N0VcdTA2MjdcdTA2QTlcdTA2MzNcdTA2MkFcdTA2MjdcdTA2NDY3XHUwNjgwXHUwNjI3XHUwNjMxXHUwNjJBNFx1MDkxNVx1MDk0OVx1MDkyRTNcdTA5MjhcdTA5NDdcdTA5MUYzXHUwOTJEXHUwOTNFXHUwOTMwXHUwOTI0MFx1MDkyRVx1MDk0RDNcdTA5NEJcdTA5MjQ1XHUwOTM4XHUwOTAyXHUwOTE3XHUwOTIwXHUwOTI4NVx1MDlBQ1x1MDlCRVx1MDk4Mlx1MDlCMlx1MDlCRTVcdTA5QURcdTA5QkVcdTA5QjBcdTA5QTQyXHUwOUYwXHUwOUE0NFx1MEEyRFx1MEEzRVx1MEEzMFx1MEEyNDRcdTBBQURcdTBBQkVcdTBBQjBcdTBBQTQ0XHUwQjJEXHUwQjNFXHUwQjMwXHUwQjI0NFx1MEI4N1x1MEJBOFx1MEJDRFx1MEJBNFx1MEJCRlx1MEJBRlx1MEJCRTZcdTBCQjJcdTBCOTlcdTBCQ0RcdTBCOTVcdTBCQzg2XHUwQjlBXHUwQkJGXHUwQjk5XHUwQkNEXHUwQjk1XHUwQkFBXHUwQkNEXHUwQkFBXHUwQkMyXHUwQkIwXHUwQkNEMTFcdTBDMkRcdTBDM0VcdTBDMzBcdTBDMjRcdTBDNEQ1XHUwQ0FEXHUwQ0JFXHUwQ0IwXHUwQ0E0NFx1MEQyRFx1MEQzRVx1MEQzMFx1MEQyNFx1MEQwMjVcdTBEQkRcdTBEODJcdTBEOUFcdTBEQ0Y0XHUwRTA0XHUwRTJEXHUwRTIxM1x1MEU0NFx1MEUxN1x1MEUyMjNcdTBFQTVcdTBFQjJcdTBFQTczXHUxMEQyXHUxMEQ0Mlx1MzA3Rlx1MzA5M1x1MzA2QTNcdTMwQTJcdTMwREVcdTMwQkVcdTMwRjM0XHUzMEFGXHUzMEU5XHUzMEE2XHUzMEM5NFx1MzBCMFx1MzBGQ1x1MzBCMFx1MzBFQjRcdTMwQjNcdTMwRTAyXHUzMEI5XHUzMEM4XHUzMEEyM1x1MzBCQlx1MzBGQ1x1MzBFQjNcdTMwRDVcdTMwQTFcdTMwQzNcdTMwQjdcdTMwRTdcdTMwRjM2XHUzMEREXHUzMEE0XHUzMEYzXHUzMEM4NFx1NEUxNlx1NzU0QzJcdTRFMkRcdTRGRTExXHU1NkZEMVx1NTcwQjFcdTY1ODdcdTdGNTEzXHU0RTlBXHU5QTZDXHU5MDBBM1x1NEYwMVx1NEUxQTJcdTRGNUJcdTVDNzEyXHU0RkUxXHU2MDZGMlx1NTA2NVx1NUVCNzJcdTUxNkJcdTUzNjYyXHU1MTZDXHU1M0Y4MVx1NzZDQTJcdTUzRjBcdTZFN0UxXHU3MDYzMlx1NTU0Nlx1NTdDRTFcdTVFOTcxXHU2ODA3Mlx1NTYwOVx1OTFDQzBcdTU5MjdcdTkxNTJcdTVFOTc1XHU1NzI4XHU3RUJGMlx1NTkyN1x1NjJGRjJcdTU5MjlcdTRFM0JcdTY1NTkzXHU1QTMxXHU0RTUwMlx1NUJCNlx1OTZGQjJcdTVFN0ZcdTRFMUMyXHU1RkFFXHU1MzVBMlx1NjE0OFx1NTU4NDJcdTYyMTFcdTcyMzFcdTRGNjAzXHU2MjRCXHU2NzNBMlx1NjJEQlx1ODA1ODJcdTY1M0ZcdTUyQTExXHU1RTlDMlx1NjVCMFx1NTJBMFx1NTc2MTJcdTk1RkIyXHU2NUY2XHU1QzFBMlx1NjZGOFx1N0M0RDJcdTY3M0FcdTY3ODQyXHU2REUxXHU5QTZDXHU5NTIxM1x1NkUzOFx1NjIwRjJcdTZGQjNcdTk1ODAyXHU3MEI5XHU3NzBCMlx1NzlGQlx1NTJBODJcdTdFQzRcdTdFQzdcdTY3M0FcdTY3ODQ0XHU3RjUxXHU1NzQwMVx1NUU5NzFcdTdBRDkxXHU3RURDMlx1ODA1NFx1OTAxQTJcdThDMzdcdTZCNEMyXHU4RDJEXHU3MjY5Mlx1OTAxQVx1OENBOTJcdTk2QzZcdTU2RTIyXHU5NkZCXHU4QTBBXHU3NkM4XHU3OUQxNFx1OThERVx1NTIyOVx1NkQ2NjNcdTk4REZcdTU0QzEyXHU5OTEwXHU1Mzg1Mlx1OTk5OVx1NjgzQ1x1OTFDQ1x1NjJDOTNcdTZFMkYyXHVCMkY3XHVCMTM3MVx1Q0VGNDJcdUMwQkNcdUMxMzEyXHVENTVDXHVBRDZEMic7XG5cbi8qKlxuICogQHRlbXBsYXRlIEFcbiAqIEB0ZW1wbGF0ZSBCXG4gKiBAcGFyYW0ge0F9IHRhcmdldFxuICogQHBhcmFtIHtCfSBwcm9wZXJ0aWVzXG4gKiBAcmV0dXJuIHtBICYgQn1cbiAqL1xuY29uc3QgYXNzaWduID0gKHRhcmdldCwgcHJvcGVydGllcykgPT4ge1xuICBmb3IgKGNvbnN0IGtleSBpbiBwcm9wZXJ0aWVzKSB7XG4gICAgdGFyZ2V0W2tleV0gPSBwcm9wZXJ0aWVzW2tleV07XG4gIH1cbiAgcmV0dXJuIHRhcmdldDtcbn07XG5cbi8qKlxuICogRmluaXRlIFN0YXRlIE1hY2hpbmUgZ2VuZXJhdGlvbiB1dGlsaXRpZXNcbiAqL1xuXG4vKipcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAdHlwZWRlZiB7eyBbZ3JvdXA6IHN0cmluZ106IFRbXSB9fSBDb2xsZWN0aW9uc1xuICovXG5cbi8qKlxuICogQHR5cGVkZWYge3sgW2dyb3VwOiBzdHJpbmddOiB0cnVlIH19IEZsYWdzXG4gKi9cblxuLy8gS2V5cyBpbiBzY2FubmVyIENvbGxlY3Rpb25zIGluc3RhbmNlc1xuY29uc3QgbnVtZXJpYyA9ICdudW1lcmljJztcbmNvbnN0IGFzY2lpID0gJ2FzY2lpJztcbmNvbnN0IGFscGhhID0gJ2FscGhhJztcbmNvbnN0IGFzY2lpbnVtZXJpYyA9ICdhc2NpaW51bWVyaWMnO1xuY29uc3QgYWxwaGFudW1lcmljID0gJ2FscGhhbnVtZXJpYyc7XG5jb25zdCBkb21haW4gPSAnZG9tYWluJztcbmNvbnN0IGVtb2ppID0gJ2Vtb2ppJztcbmNvbnN0IHNjaGVtZSA9ICdzY2hlbWUnO1xuY29uc3Qgc2xhc2hzY2hlbWUgPSAnc2xhc2hzY2hlbWUnO1xuY29uc3Qgd2hpdGVzcGFjZSA9ICd3aGl0ZXNwYWNlJztcblxuLyoqXG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7Q29sbGVjdGlvbnM8VD59IGdyb3VwcyB0byByZWdpc3RlciBpblxuICogQHJldHVybnMge1RbXX0gQ3VycmVudCBsaXN0IG9mIHRva2VucyBpbiB0aGUgZ2l2ZW4gY29sbGVjdGlvblxuICovXG5mdW5jdGlvbiByZWdpc3Rlckdyb3VwKG5hbWUsIGdyb3Vwcykge1xuICBpZiAoIShuYW1lIGluIGdyb3VwcykpIHtcbiAgICBncm91cHNbbmFtZV0gPSBbXTtcbiAgfVxuICByZXR1cm4gZ3JvdXBzW25hbWVdO1xufVxuXG4vKipcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0ge1R9IHQgdG9rZW4gdG8gYWRkXG4gKiBAcGFyYW0ge0NvbGxlY3Rpb25zPFQ+fSBncm91cHNcbiAqIEBwYXJhbSB7RmxhZ3N9IGZsYWdzXG4gKi9cbmZ1bmN0aW9uIGFkZFRvR3JvdXBzKHQsIGZsYWdzLCBncm91cHMpIHtcbiAgaWYgKGZsYWdzW251bWVyaWNdKSB7XG4gICAgZmxhZ3NbYXNjaWludW1lcmljXSA9IHRydWU7XG4gICAgZmxhZ3NbYWxwaGFudW1lcmljXSA9IHRydWU7XG4gIH1cbiAgaWYgKGZsYWdzW2FzY2lpXSkge1xuICAgIGZsYWdzW2FzY2lpbnVtZXJpY10gPSB0cnVlO1xuICAgIGZsYWdzW2FscGhhXSA9IHRydWU7XG4gIH1cbiAgaWYgKGZsYWdzW2FzY2lpbnVtZXJpY10pIHtcbiAgICBmbGFnc1thbHBoYW51bWVyaWNdID0gdHJ1ZTtcbiAgfVxuICBpZiAoZmxhZ3NbYWxwaGFdKSB7XG4gICAgZmxhZ3NbYWxwaGFudW1lcmljXSA9IHRydWU7XG4gIH1cbiAgaWYgKGZsYWdzW2FscGhhbnVtZXJpY10pIHtcbiAgICBmbGFnc1tkb21haW5dID0gdHJ1ZTtcbiAgfVxuICBpZiAoZmxhZ3NbZW1vamldKSB7XG4gICAgZmxhZ3NbZG9tYWluXSA9IHRydWU7XG4gIH1cbiAgZm9yIChjb25zdCBrIGluIGZsYWdzKSB7XG4gICAgY29uc3QgZ3JvdXAgPSByZWdpc3Rlckdyb3VwKGssIGdyb3Vwcyk7XG4gICAgaWYgKGdyb3VwLmluZGV4T2YodCkgPCAwKSB7XG4gICAgICBncm91cC5wdXNoKHQpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0ge1R9IHQgdG9rZW4gdG8gY2hlY2tcbiAqIEBwYXJhbSB7Q29sbGVjdGlvbnM8VD59IGdyb3Vwc1xuICogQHJldHVybnMge0ZsYWdzfSBncm91cCBmbGFncyB0aGF0IGNvbnRhaW4gdGhpcyB0b2tlblxuICovXG5mdW5jdGlvbiBmbGFnc0ZvclRva2VuKHQsIGdyb3Vwcykge1xuICBjb25zdCByZXN1bHQgPSB7fTtcbiAgZm9yIChjb25zdCBjIGluIGdyb3Vwcykge1xuICAgIGlmIChncm91cHNbY10uaW5kZXhPZih0KSA+PSAwKSB7XG4gICAgICByZXN1bHRbY10gPSB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAdHlwZWRlZiB7bnVsbCB8IFQgfSBUcmFuc2l0aW9uXG4gKi9cblxuLyoqXG4gKiBEZWZpbmUgYSBiYXNpYyBzdGF0ZSBtYWNoaW5lIHN0YXRlLiBqIGlzIHRoZSBsaXN0IG9mIGNoYXJhY3RlciB0cmFuc2l0aW9ucyxcbiAqIGpyIGlzIHRoZSBsaXN0IG9mIHJlZ2V4LW1hdGNoIHRyYW5zaXRpb25zLCBqZCBpcyB0aGUgZGVmYXVsdCBzdGF0ZSB0b1xuICogdHJhbnNpdGlvbiB0byB0IGlzIHRoZSBhY2NlcHRpbmcgdG9rZW4gdHlwZSwgaWYgYW55LiBJZiB0aGlzIGlzIHRoZSB0ZXJtaW5hbFxuICogc3RhdGUsIHRoZW4gaXQgZG9lcyBub3QgZW1pdCBhIHRva2VuLlxuICpcbiAqIFRoZSB0ZW1wbGF0ZSB0eXBlIFQgcmVwcmVzZW50cyB0aGUgdHlwZSBvZiB0aGUgdG9rZW4gdGhpcyBzdGF0ZSBhY2NlcHRzLiBUaGlzXG4gKiBzaG91bGQgYmUgYSBzdHJpbmcgKHN1Y2ggYXMgb2YgdGhlIHRva2VuIGV4cG9ydHMgaW4gYHRleHQuanNgKSBvciBhXG4gKiBNdWx0aVRva2VuIHN1YmNsYXNzIChmcm9tIGBtdWx0aS5qc2ApXG4gKlxuICogQHRlbXBsYXRlIFRcbiAqIEBwYXJhbSB7VH0gW3Rva2VuXSBUb2tlbiB0aGF0IHRoaXMgc3RhdGUgZW1pdHNcbiAqL1xuZnVuY3Rpb24gU3RhdGUodG9rZW4pIHtcbiAgaWYgKHRva2VuID09PSB2b2lkIDApIHtcbiAgICB0b2tlbiA9IG51bGw7XG4gIH1cbiAgLy8gdGhpcy5uID0gbnVsbDsgLy8gREVCVUc6IFN0YXRlIG5hbWVcbiAgLyoqIEB0eXBlIHt7IFtpbnB1dDogc3RyaW5nXTogU3RhdGU8VD4gfX0gaiAqL1xuICB0aGlzLmogPSB7fTsgLy8gSU1QTEVNRU5UQVRJT04gMVxuICAvLyB0aGlzLmogPSBbXTsgLy8gSU1QTEVNRU5UQVRJT04gMlxuICAvKiogQHR5cGUge1tSZWdFeHAsIFN0YXRlPFQ+XVtdfSBqciAqL1xuICB0aGlzLmpyID0gW107XG4gIC8qKiBAdHlwZSB7P1N0YXRlPFQ+fSBqZCAqL1xuICB0aGlzLmpkID0gbnVsbDtcbiAgLyoqIEB0eXBlIHs/VH0gdCAqL1xuICB0aGlzLnQgPSB0b2tlbjtcbn1cblxuLyoqXG4gKiBTY2FubmVyIHRva2VuIGdyb3Vwc1xuICogQHR5cGUgQ29sbGVjdGlvbnM8c3RyaW5nPlxuICovXG5TdGF0ZS5ncm91cHMgPSB7fTtcblN0YXRlLnByb3RvdHlwZSA9IHtcbiAgYWNjZXB0cygpIHtcbiAgICByZXR1cm4gISF0aGlzLnQ7XG4gIH0sXG4gIC8qKlxuICAgKiBGb2xsb3cgYW4gZXhpc3RpbmcgdHJhbnNpdGlvbiBmcm9tIHRoZSBnaXZlbiBpbnB1dCB0byB0aGUgbmV4dCBzdGF0ZS5cbiAgICogRG9lcyBub3QgbXV0YXRlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaW5wdXQgY2hhcmFjdGVyIG9yIHRva2VuIHR5cGUgdG8gdHJhbnNpdGlvbiBvblxuICAgKiBAcmV0dXJucyB7P1N0YXRlPFQ+fSB0aGUgbmV4dCBzdGF0ZSwgaWYgYW55XG4gICAqL1xuICBnbyhpbnB1dCkge1xuICAgIGNvbnN0IHN0YXRlID0gdGhpcztcbiAgICBjb25zdCBuZXh0U3RhdGUgPSBzdGF0ZS5qW2lucHV0XTtcbiAgICBpZiAobmV4dFN0YXRlKSB7XG4gICAgICByZXR1cm4gbmV4dFN0YXRlO1xuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0YXRlLmpyLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCByZWdleCA9IHN0YXRlLmpyW2ldWzBdO1xuICAgICAgY29uc3QgbmV4dFN0YXRlID0gc3RhdGUuanJbaV1bMV07IC8vIG5vdGU6IG1pZ2h0IGJlIGVtcHR5IHRvIHByZXZlbnQgZGVmYXVsdCBqdW1wXG4gICAgICBpZiAobmV4dFN0YXRlICYmIHJlZ2V4LnRlc3QoaW5wdXQpKSB7XG4gICAgICAgIHJldHVybiBuZXh0U3RhdGU7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIE5vd2hlcmUgbGVmdCB0byBqdW1wISBSZXR1cm4gZGVmYXVsdCwgaWYgYW55XG4gICAgcmV0dXJuIHN0YXRlLmpkO1xuICB9LFxuICAvKipcbiAgICogV2hldGhlciB0aGUgc3RhdGUgaGFzIGEgdHJhbnNpdGlvbiBmb3IgdGhlIGdpdmVuIGlucHV0LiBTZXQgdGhlIHNlY29uZFxuICAgKiBhcmd1bWVudCB0byB0cnVlIHRvIG9ubHkgbG9vayBmb3IgYW4gZXhhY3QgbWF0Y2ggKGFuZCBub3QgYSBkZWZhdWx0IG9yXG4gICAqIHJlZ3VsYXItZXhwcmVzc2lvbi1iYXNlZCB0cmFuc2l0aW9uKVxuICAgKiBAcGFyYW0ge3N0cmluZ30gaW5wdXRcbiAgICogQHBhcmFtIHtib29sZWFufSBleGFjdE9ubHlcbiAgICovXG4gIGhhcyhpbnB1dCwgZXhhY3RPbmx5KSB7XG4gICAgaWYgKGV4YWN0T25seSA9PT0gdm9pZCAwKSB7XG4gICAgICBleGFjdE9ubHkgPSBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGV4YWN0T25seSA/IGlucHV0IGluIHRoaXMuaiA6ICEhdGhpcy5nbyhpbnB1dCk7XG4gIH0sXG4gIC8qKlxuICAgKiBTaG9ydCBmb3IgXCJ0cmFuc2l0aW9uIGFsbFwiOyBjcmVhdGUgYSB0cmFuc2l0aW9uIGZyb20gdGhlIGFycmF5IG9mIGl0ZW1zXG4gICAqIGluIHRoZSBnaXZlbiBsaXN0IHRvIHRoZSBzYW1lIGZpbmFsIHJlc3VsdGluZyBzdGF0ZS5cbiAgICogQHBhcmFtIHtzdHJpbmcgfCBzdHJpbmdbXX0gaW5wdXRzIEdyb3VwIG9mIGlucHV0cyB0byB0cmFuc2l0aW9uIG9uXG4gICAqIEBwYXJhbSB7VHJhbnNpdGlvbjxUPiB8IFN0YXRlPFQ+fSBbbmV4dF0gVHJhbnNpdGlvbiBvcHRpb25zXG4gICAqIEBwYXJhbSB7RmxhZ3N9IFtmbGFnc10gQ29sbGVjdGlvbnMgZmxhZ3MgdG8gYWRkIHRva2VuIHRvXG4gICAqIEBwYXJhbSB7Q29sbGVjdGlvbnM8VD59IFtncm91cHNdIE1hc3RlciBsaXN0IG9mIHRva2VuIGdyb3Vwc1xuICAgKi9cbiAgdGEoaW5wdXRzLCBuZXh0LCBmbGFncywgZ3JvdXBzKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMudHQoaW5wdXRzW2ldLCBuZXh0LCBmbGFncywgZ3JvdXBzKTtcbiAgICB9XG4gIH0sXG4gIC8qKlxuICAgKiBTaG9ydCBmb3IgXCJ0YWtlIHJlZ2V4cCB0cmFuc2l0aW9uXCI7IGRlZmluZXMgYSB0cmFuc2l0aW9uIGZvciB0aGlzIHN0YXRlXG4gICAqIHdoZW4gaXQgZW5jb3VudGVycyBhIHRva2VuIHdoaWNoIG1hdGNoZXMgdGhlIGdpdmVuIHJlZ3VsYXIgZXhwcmVzc2lvblxuICAgKiBAcGFyYW0ge1JlZ0V4cH0gcmVnZXhwIFJlZ3VsYXIgZXhwcmVzc2lvbiB0cmFuc2l0aW9uIChwb3B1bGF0ZSBmaXJzdClcbiAgICogQHBhcmFtIHtUIHwgU3RhdGU8VD59IFtuZXh0XSBUcmFuc2l0aW9uIG9wdGlvbnNcbiAgICogQHBhcmFtIHtGbGFnc30gW2ZsYWdzXSBDb2xsZWN0aW9ucyBmbGFncyB0byBhZGQgdG9rZW4gdG9cbiAgICogQHBhcmFtIHtDb2xsZWN0aW9uczxUPn0gW2dyb3Vwc10gTWFzdGVyIGxpc3Qgb2YgdG9rZW4gZ3JvdXBzXG4gICAqIEByZXR1cm5zIHtTdGF0ZTxUPn0gdGFrZW4gYWZ0ZXIgdGhlIGdpdmVuIGlucHV0XG4gICAqL1xuICB0cihyZWdleHAsIG5leHQsIGZsYWdzLCBncm91cHMpIHtcbiAgICBncm91cHMgPSBncm91cHMgfHwgU3RhdGUuZ3JvdXBzO1xuICAgIGxldCBuZXh0U3RhdGU7XG4gICAgaWYgKG5leHQgJiYgbmV4dC5qKSB7XG4gICAgICBuZXh0U3RhdGUgPSBuZXh0O1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUb2tlbiB3aXRoIG1heWJlIHRva2VuIGdyb3Vwc1xuICAgICAgbmV4dFN0YXRlID0gbmV3IFN0YXRlKG5leHQpO1xuICAgICAgaWYgKGZsYWdzICYmIGdyb3Vwcykge1xuICAgICAgICBhZGRUb0dyb3VwcyhuZXh0LCBmbGFncywgZ3JvdXBzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5qci5wdXNoKFtyZWdleHAsIG5leHRTdGF0ZV0pO1xuICAgIHJldHVybiBuZXh0U3RhdGU7XG4gIH0sXG4gIC8qKlxuICAgKiBTaG9ydCBmb3IgXCJ0YWtlIHRyYW5zaXRpb25zXCIsIHdpbGwgdGFrZSBhcyBtYW55IHNlcXVlbnRpYWwgdHJhbnNpdGlvbnMgYXNcbiAgICogdGhlIGxlbmd0aCBvZiB0aGUgZ2l2ZW4gaW5wdXQgYW5kIHJldHVybnMgdGhlXG4gICAqIHJlc3VsdGluZyBmaW5hbCBzdGF0ZS5cbiAgICogQHBhcmFtIHtzdHJpbmcgfCBzdHJpbmdbXX0gaW5wdXRcbiAgICogQHBhcmFtIHtUIHwgU3RhdGU8VD59IFtuZXh0XSBUcmFuc2l0aW9uIG9wdGlvbnNcbiAgICogQHBhcmFtIHtGbGFnc30gW2ZsYWdzXSBDb2xsZWN0aW9ucyBmbGFncyB0byBhZGQgdG9rZW4gdG9cbiAgICogQHBhcmFtIHtDb2xsZWN0aW9uczxUPn0gW2dyb3Vwc10gTWFzdGVyIGxpc3Qgb2YgdG9rZW4gZ3JvdXBzXG4gICAqIEByZXR1cm5zIHtTdGF0ZTxUPn0gdGFrZW4gYWZ0ZXIgdGhlIGdpdmVuIGlucHV0XG4gICAqL1xuICB0cyhpbnB1dCwgbmV4dCwgZmxhZ3MsIGdyb3Vwcykge1xuICAgIGxldCBzdGF0ZSA9IHRoaXM7XG4gICAgY29uc3QgbGVuID0gaW5wdXQubGVuZ3RoO1xuICAgIGlmICghbGVuKSB7XG4gICAgICByZXR1cm4gc3RhdGU7XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuIC0gMTsgaSsrKSB7XG4gICAgICBzdGF0ZSA9IHN0YXRlLnR0KGlucHV0W2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIHN0YXRlLnR0KGlucHV0W2xlbiAtIDFdLCBuZXh0LCBmbGFncywgZ3JvdXBzKTtcbiAgfSxcbiAgLyoqXG4gICAqIFNob3J0IGZvciBcInRha2UgdHJhbnNpdGlvblwiLCB0aGlzIGlzIGEgbWV0aG9kIGZvciBidWlsZGluZy93b3JraW5nIHdpdGhcbiAgICogc3RhdGUgbWFjaGluZXMuXG4gICAqXG4gICAqIElmIGEgc3RhdGUgYWxyZWFkeSBleGlzdHMgZm9yIHRoZSBnaXZlbiBpbnB1dCwgcmV0dXJucyBpdC5cbiAgICpcbiAgICogSWYgYSB0b2tlbiBpcyBzcGVjaWZpZWQsIHRoYXQgc3RhdGUgd2lsbCBlbWl0IHRoYXQgdG9rZW4gd2hlbiByZWFjaGVkIGJ5XG4gICAqIHRoZSBsaW5raWZ5IGVuZ2luZS5cbiAgICpcbiAgICogSWYgbm8gc3RhdGUgZXhpc3RzLCBpdCB3aWxsIGJlIGluaXRpYWxpemVkIHdpdGggc29tZSBkZWZhdWx0IHRyYW5zaXRpb25zXG4gICAqIHRoYXQgcmVzZW1ibGUgZXhpc3RpbmcgZGVmYXVsdCB0cmFuc2l0aW9ucy5cbiAgICpcbiAgICogSWYgYSBzdGF0ZSBpcyBnaXZlbiBmb3IgdGhlIHNlY29uZCBhcmd1bWVudCwgdGhhdCBzdGF0ZSB3aWxsIGJlXG4gICAqIHRyYW5zaXRpb25lZCB0byBvbiB0aGUgZ2l2ZW4gaW5wdXQgcmVnYXJkbGVzcyBvZiB3aGF0IHRoYXQgaW5wdXRcbiAgICogcHJldmlvdXNseSBkaWQuXG4gICAqXG4gICAqIFNwZWNpZnkgYSB0b2tlbiBncm91cCBmbGFncyB0byBkZWZpbmUgZ3JvdXBzIHRoYXQgdGhpcyB0b2tlbiBiZWxvbmdzIHRvLlxuICAgKiBUaGUgdG9rZW4gd2lsbCBiZSBhZGRlZCB0byBjb3JyZXNwb25kaW5nIGVudGlyZXMgaW4gdGhlIGdpdmVuIGdyb3Vwc1xuICAgKiBvYmplY3QuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBpbnB1dCBjaGFyYWN0ZXIsIHRva2VuIHR5cGUgdG8gdHJhbnNpdGlvbiBvblxuICAgKiBAcGFyYW0ge1QgfCBTdGF0ZTxUPn0gW25leHRdIFRyYW5zaXRpb24gb3B0aW9uc1xuICAgKiBAcGFyYW0ge0ZsYWdzfSBbZmxhZ3NdIENvbGxlY3Rpb25zIGZsYWdzIHRvIGFkZCB0b2tlbiB0b1xuICAgKiBAcGFyYW0ge0NvbGxlY3Rpb25zPFQ+fSBbZ3JvdXBzXSBNYXN0ZXIgbGlzdCBvZiBncm91cHNcbiAgICogQHJldHVybnMge1N0YXRlPFQ+fSB0YWtlbiBhZnRlciB0aGUgZ2l2ZW4gaW5wdXRcbiAgICovXG4gIHR0KGlucHV0LCBuZXh0LCBmbGFncywgZ3JvdXBzKSB7XG4gICAgZ3JvdXBzID0gZ3JvdXBzIHx8IFN0YXRlLmdyb3VwcztcbiAgICBjb25zdCBzdGF0ZSA9IHRoaXM7XG5cbiAgICAvLyBDaGVjayBpZiBleGlzdGluZyBzdGF0ZSBnaXZlbiwganVzdCBhIGJhc2ljIHRyYW5zaXRpb25cbiAgICBpZiAobmV4dCAmJiBuZXh0LmopIHtcbiAgICAgIHN0YXRlLmpbaW5wdXRdID0gbmV4dDtcbiAgICAgIHJldHVybiBuZXh0O1xuICAgIH1cbiAgICBjb25zdCB0ID0gbmV4dDtcblxuICAgIC8vIFRha2UgdGhlIHRyYW5zaXRpb24gd2l0aCB0aGUgdXN1YWwgZGVmYXVsdCBtZWNoYW5pc21zIGFuZCB1c2UgdGhhdCBhc1xuICAgIC8vIGEgdGVtcGxhdGUgZm9yIGNyZWF0aW5nIHRoZSBuZXh0IHN0YXRlXG4gICAgbGV0IG5leHRTdGF0ZSxcbiAgICAgIHRlbXBsYXRlU3RhdGUgPSBzdGF0ZS5nbyhpbnB1dCk7XG4gICAgaWYgKHRlbXBsYXRlU3RhdGUpIHtcbiAgICAgIG5leHRTdGF0ZSA9IG5ldyBTdGF0ZSgpO1xuICAgICAgYXNzaWduKG5leHRTdGF0ZS5qLCB0ZW1wbGF0ZVN0YXRlLmopO1xuICAgICAgbmV4dFN0YXRlLmpyLnB1c2guYXBwbHkobmV4dFN0YXRlLmpyLCB0ZW1wbGF0ZVN0YXRlLmpyKTtcbiAgICAgIG5leHRTdGF0ZS5qZCA9IHRlbXBsYXRlU3RhdGUuamQ7XG4gICAgICBuZXh0U3RhdGUudCA9IHRlbXBsYXRlU3RhdGUudDtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV4dFN0YXRlID0gbmV3IFN0YXRlKCk7XG4gICAgfVxuICAgIGlmICh0KSB7XG4gICAgICAvLyBFbnN1cmUgbmV3bHkgdG9rZW4gaXMgaW4gdGhlIHNhbWUgZ3JvdXBzIGFzIHRoZSBvbGQgdG9rZW5cbiAgICAgIGlmIChncm91cHMpIHtcbiAgICAgICAgaWYgKG5leHRTdGF0ZS50ICYmIHR5cGVvZiBuZXh0U3RhdGUudCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBjb25zdCBhbGxGbGFncyA9IGFzc2lnbihmbGFnc0ZvclRva2VuKG5leHRTdGF0ZS50LCBncm91cHMpLCBmbGFncyk7XG4gICAgICAgICAgYWRkVG9Hcm91cHModCwgYWxsRmxhZ3MsIGdyb3Vwcyk7XG4gICAgICAgIH0gZWxzZSBpZiAoZmxhZ3MpIHtcbiAgICAgICAgICBhZGRUb0dyb3Vwcyh0LCBmbGFncywgZ3JvdXBzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbmV4dFN0YXRlLnQgPSB0OyAvLyBvdmVyd3JpdGUgYW55dGhpbmcgdGhhdCB3YXMgcHJldmlvdXNseSB0aGVyZVxuICAgIH1cblxuICAgIHN0YXRlLmpbaW5wdXRdID0gbmV4dFN0YXRlO1xuICAgIHJldHVybiBuZXh0U3RhdGU7XG4gIH1cbn07XG5cbi8vIEhlbHBlciBmdW5jdGlvbnMgdG8gaW1wcm92ZSBtaW5pZmljYXRpb24gKG5vdCBleHBvcnRlZCBvdXRzaWRlIGxpbmtpZnlqcyBtb2R1bGUpXG5cbi8qKlxuICogQHRlbXBsYXRlIFRcbiAqIEBwYXJhbSB7U3RhdGU8VD59IHN0YXRlXG4gKiBAcGFyYW0ge3N0cmluZyB8IHN0cmluZ1tdfSBpbnB1dFxuICogQHBhcmFtIHtGbGFnc30gW2ZsYWdzXVxuICogQHBhcmFtIHtDb2xsZWN0aW9uczxUPn0gW2dyb3Vwc11cbiAqL1xuY29uc3QgdGEgPSAoc3RhdGUsIGlucHV0LCBuZXh0LCBmbGFncywgZ3JvdXBzKSA9PiBzdGF0ZS50YShpbnB1dCwgbmV4dCwgZmxhZ3MsIGdyb3Vwcyk7XG5cbi8qKlxuICogQHRlbXBsYXRlIFRcbiAqIEBwYXJhbSB7U3RhdGU8VD59IHN0YXRlXG4gKiBAcGFyYW0ge1JlZ0V4cH0gcmVnZXhwXG4gKiBAcGFyYW0ge1QgfCBTdGF0ZTxUPn0gW25leHRdXG4gKiBAcGFyYW0ge0ZsYWdzfSBbZmxhZ3NdXG4gKiBAcGFyYW0ge0NvbGxlY3Rpb25zPFQ+fSBbZ3JvdXBzXVxuICovXG5jb25zdCB0ciA9IChzdGF0ZSwgcmVnZXhwLCBuZXh0LCBmbGFncywgZ3JvdXBzKSA9PiBzdGF0ZS50cihyZWdleHAsIG5leHQsIGZsYWdzLCBncm91cHMpO1xuXG4vKipcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0ge1N0YXRlPFQ+fSBzdGF0ZVxuICogQHBhcmFtIHtzdHJpbmcgfCBzdHJpbmdbXX0gaW5wdXRcbiAqIEBwYXJhbSB7VCB8IFN0YXRlPFQ+fSBbbmV4dF1cbiAqIEBwYXJhbSB7RmxhZ3N9IFtmbGFnc11cbiAqIEBwYXJhbSB7Q29sbGVjdGlvbnM8VD59IFtncm91cHNdXG4gKi9cbmNvbnN0IHRzID0gKHN0YXRlLCBpbnB1dCwgbmV4dCwgZmxhZ3MsIGdyb3VwcykgPT4gc3RhdGUudHMoaW5wdXQsIG5leHQsIGZsYWdzLCBncm91cHMpO1xuXG4vKipcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0ge1N0YXRlPFQ+fSBzdGF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IGlucHV0XG4gKiBAcGFyYW0ge1QgfCBTdGF0ZTxUPn0gW25leHRdXG4gKiBAcGFyYW0ge0NvbGxlY3Rpb25zPFQ+fSBbZ3JvdXBzXVxuICogQHBhcmFtIHtGbGFnc30gW2ZsYWdzXVxuICovXG5jb25zdCB0dCA9IChzdGF0ZSwgaW5wdXQsIG5leHQsIGZsYWdzLCBncm91cHMpID0+IHN0YXRlLnR0KGlucHV0LCBuZXh0LCBmbGFncywgZ3JvdXBzKTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuVGV4dCBUb2tlbnNcbklkZW50aWZpZXJzIGZvciB0b2tlbiBvdXRwdXRzIGZyb20gdGhlIHJlZ2V4cCBzY2FubmVyXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbi8vIEEgdmFsaWQgd2ViIGRvbWFpbiB0b2tlblxuY29uc3QgV09SRCA9ICdXT1JEJzsgLy8gb25seSBjb250YWlucyBhLXpcbmNvbnN0IFVXT1JEID0gJ1VXT1JEJzsgLy8gY29udGFpbnMgbGV0dGVycyBvdGhlciB0aGFuIGEteiwgdXNlZCBmb3IgSUROXG5cbi8vIFNwZWNpYWwgY2FzZSBvZiB3b3JkXG5jb25zdCBMT0NBTEhPU1QgPSAnTE9DQUxIT1NUJztcblxuLy8gVmFsaWQgdG9wLWxldmVsIGRvbWFpbiwgc3BlY2lhbCBjYXNlIG9mIFdPUkQgKHNlZSB0bGRzLmpzKVxuY29uc3QgVExEID0gJ1RMRCc7XG5cbi8vIFZhbGlkIElETiBUTEQsIHNwZWNpYWwgY2FzZSBvZiBVV09SRCAoc2VlIHRsZHMuanMpXG5jb25zdCBVVExEID0gJ1VUTEQnO1xuXG4vLyBUaGUgc2NoZW1lIHBvcnRpb24gb2YgYSB3ZWIgVVJJIHByb3RvY29sLiBTdXBwb3J0ZWQgdHlwZXMgaW5jbHVkZTogYG1haWx0b2AsXG4vLyBgZmlsZWAsIGFuZCB1c2VyLWRlZmluZWQgY3VzdG9tIHByb3RvY29scy4gTGltaXRlZCB0byBzY2hlbWVzIHRoYXQgY29udGFpblxuLy8gb25seSBsZXR0ZXJzXG5jb25zdCBTQ0hFTUUgPSAnU0NIRU1FJztcblxuLy8gU2ltaWxhciB0byBTQ0hFTUUsIGV4Y2VwdCBtYWtlcyBkaXN0aW5jdGlvbiBmb3Igc2NoZW1lcyB0aGF0IG11c3QgYWx3YXlzIGJlXG4vLyBmb2xsb3dlZCBieSBgOi8vYCwgbm90IGp1c3QgYDpgLiBTdXBwb3J0ZWQgdHlwZXMgaW5jbHVkZSBgaHR0cGAsIGBodHRwc2AsXG4vLyBgZnRwYCwgYGZ0cHNgXG5jb25zdCBTTEFTSF9TQ0hFTUUgPSAnU0xBU0hfU0NIRU1FJztcblxuLy8gQW55IHNlcXVlbmNlIG9mIGRpZ2l0cyAwLTlcbmNvbnN0IE5VTSA9ICdOVU0nO1xuXG4vLyBBbnkgbnVtYmVyIG9mIGNvbnNlY3V0aXZlIHdoaXRlc3BhY2UgY2hhcmFjdGVycyB0aGF0IGFyZSBub3QgbmV3bGluZVxuY29uc3QgV1MgPSAnV1MnO1xuXG4vLyBOZXcgbGluZSAodW5peCBzdHlsZSlcbmNvbnN0IE5MJDEgPSAnTkwnOyAvLyBcXG5cblxuLy8gT3BlbmluZy9jbG9zaW5nIGJyYWNrZXQgY2xhc3Nlc1xuY29uc3QgT1BFTkJSQUNFID0gJ09QRU5CUkFDRSc7IC8vIHtcbmNvbnN0IE9QRU5CUkFDS0VUID0gJ09QRU5CUkFDS0VUJzsgLy8gW1xuY29uc3QgT1BFTkFOR0xFQlJBQ0tFVCA9ICdPUEVOQU5HTEVCUkFDS0VUJzsgLy8gPFxuY29uc3QgT1BFTlBBUkVOID0gJ09QRU5QQVJFTic7IC8vIChcbmNvbnN0IENMT1NFQlJBQ0UgPSAnQ0xPU0VCUkFDRSc7IC8vIH1cbmNvbnN0IENMT1NFQlJBQ0tFVCA9ICdDTE9TRUJSQUNLRVQnOyAvLyBdXG5jb25zdCBDTE9TRUFOR0xFQlJBQ0tFVCA9ICdDTE9TRUFOR0xFQlJBQ0tFVCc7IC8vID5cbmNvbnN0IENMT1NFUEFSRU4gPSAnQ0xPU0VQQVJFTic7IC8vIClcblxuLy8gVmFyaW91cyBzeW1ib2xzXG5jb25zdCBBTVBFUlNBTkQgPSAnQU1QRVJTQU5EJzsgLy8gJlxuY29uc3QgQVBPU1RST1BIRSA9ICdBUE9TVFJPUEhFJzsgLy8gJ1xuY29uc3QgQVNURVJJU0sgPSAnQVNURVJJU0snOyAvLyAqXG5jb25zdCBBVCA9ICdBVCc7IC8vIEBcbmNvbnN0IEJBQ0tTTEFTSCA9ICdCQUNLU0xBU0gnOyAvLyBcXFxuY29uc3QgQkFDS1RJQ0sgPSAnQkFDS1RJQ0snOyAvLyBgXG5jb25zdCBDQVJFVCA9ICdDQVJFVCc7IC8vIF5cbmNvbnN0IENPTE9OID0gJ0NPTE9OJzsgLy8gOlxuY29uc3QgQ09NTUEgPSAnQ09NTUEnOyAvLyAsXG5jb25zdCBET0xMQVIgPSAnRE9MTEFSJzsgLy8gJFxuY29uc3QgRE9UID0gJ0RPVCc7IC8vIC5cbmNvbnN0IEVRVUFMUyA9ICdFUVVBTFMnOyAvLyA9XG5jb25zdCBFWENMQU1BVElPTiA9ICdFWENMQU1BVElPTic7IC8vICFcbmNvbnN0IEhZUEhFTiA9ICdIWVBIRU4nOyAvLyAtXG5jb25zdCBQRVJDRU5UID0gJ1BFUkNFTlQnOyAvLyAlXG5jb25zdCBQSVBFID0gJ1BJUEUnOyAvLyB8XG5jb25zdCBQTFVTID0gJ1BMVVMnOyAvLyArXG5jb25zdCBQT1VORCA9ICdQT1VORCc7IC8vICNcbmNvbnN0IFFVRVJZID0gJ1FVRVJZJzsgLy8gP1xuY29uc3QgUVVPVEUgPSAnUVVPVEUnOyAvLyBcIlxuXG5jb25zdCBTRU1JID0gJ1NFTUknOyAvLyA7XG5jb25zdCBTTEFTSCA9ICdTTEFTSCc7IC8vIC9cbmNvbnN0IFRJTERFID0gJ1RJTERFJzsgLy8gflxuY29uc3QgVU5ERVJTQ09SRSA9ICdVTkRFUlNDT1JFJzsgLy8gX1xuXG4vLyBFbW9qaSBzeW1ib2xcbmNvbnN0IEVNT0pJJDEgPSAnRU1PSkknO1xuXG4vLyBEZWZhdWx0IHRva2VuIC0gYW55dGhpbmcgdGhhdCBpcyBub3Qgb25lIG9mIHRoZSBhYm92ZVxuY29uc3QgU1lNID0gJ1NZTSc7XG5cbnZhciB0ayA9IC8qI19fUFVSRV9fKi9PYmplY3QuZnJlZXplKHtcblx0X19wcm90b19fOiBudWxsLFxuXHRXT1JEOiBXT1JELFxuXHRVV09SRDogVVdPUkQsXG5cdExPQ0FMSE9TVDogTE9DQUxIT1NULFxuXHRUTEQ6IFRMRCxcblx0VVRMRDogVVRMRCxcblx0U0NIRU1FOiBTQ0hFTUUsXG5cdFNMQVNIX1NDSEVNRTogU0xBU0hfU0NIRU1FLFxuXHROVU06IE5VTSxcblx0V1M6IFdTLFxuXHROTDogTkwkMSxcblx0T1BFTkJSQUNFOiBPUEVOQlJBQ0UsXG5cdE9QRU5CUkFDS0VUOiBPUEVOQlJBQ0tFVCxcblx0T1BFTkFOR0xFQlJBQ0tFVDogT1BFTkFOR0xFQlJBQ0tFVCxcblx0T1BFTlBBUkVOOiBPUEVOUEFSRU4sXG5cdENMT1NFQlJBQ0U6IENMT1NFQlJBQ0UsXG5cdENMT1NFQlJBQ0tFVDogQ0xPU0VCUkFDS0VULFxuXHRDTE9TRUFOR0xFQlJBQ0tFVDogQ0xPU0VBTkdMRUJSQUNLRVQsXG5cdENMT1NFUEFSRU46IENMT1NFUEFSRU4sXG5cdEFNUEVSU0FORDogQU1QRVJTQU5ELFxuXHRBUE9TVFJPUEhFOiBBUE9TVFJPUEhFLFxuXHRBU1RFUklTSzogQVNURVJJU0ssXG5cdEFUOiBBVCxcblx0QkFDS1NMQVNIOiBCQUNLU0xBU0gsXG5cdEJBQ0tUSUNLOiBCQUNLVElDSyxcblx0Q0FSRVQ6IENBUkVULFxuXHRDT0xPTjogQ09MT04sXG5cdENPTU1BOiBDT01NQSxcblx0RE9MTEFSOiBET0xMQVIsXG5cdERPVDogRE9ULFxuXHRFUVVBTFM6IEVRVUFMUyxcblx0RVhDTEFNQVRJT046IEVYQ0xBTUFUSU9OLFxuXHRIWVBIRU46IEhZUEhFTixcblx0UEVSQ0VOVDogUEVSQ0VOVCxcblx0UElQRTogUElQRSxcblx0UExVUzogUExVUyxcblx0UE9VTkQ6IFBPVU5ELFxuXHRRVUVSWTogUVVFUlksXG5cdFFVT1RFOiBRVU9URSxcblx0U0VNSTogU0VNSSxcblx0U0xBU0g6IFNMQVNILFxuXHRUSUxERTogVElMREUsXG5cdFVOREVSU0NPUkU6IFVOREVSU0NPUkUsXG5cdEVNT0pJOiBFTU9KSSQxLFxuXHRTWU06IFNZTVxufSk7XG5cbi8vIE5vdGUgdGhhdCB0aGVzZSB0d28gVW5pY29kZSBvbmVzIGV4cGFuZCBpbnRvIGEgcmVhbGx5IGJpZyBvbmUgd2l0aCBCYWJlbFxuY29uc3QgQVNDSUlfTEVUVEVSID0gL1thLXpdLztcbmNvbnN0IExFVFRFUiA9IC9cXHB7TH0vdTsgLy8gQW55IFVuaWNvZGUgY2hhcmFjdGVyIHdpdGggbGV0dGVyIGRhdGEgdHlwZVxuY29uc3QgRU1PSkkgPSAvXFxwe0Vtb2ppfS91OyAvLyBBbnkgVW5pY29kZSBlbW9qaSBjaGFyYWN0ZXJcbmNvbnN0IEVNT0pJX1ZBUklBVElPTiQxID0gL1xcdWZlMGYvO1xuY29uc3QgRElHSVQgPSAvXFxkLztcbmNvbnN0IFNQQUNFID0gL1xccy87XG5cbnZhciByZWdleHAgPSAvKiNfX1BVUkVfXyovT2JqZWN0LmZyZWV6ZSh7XG5cdF9fcHJvdG9fXzogbnVsbCxcblx0QVNDSUlfTEVUVEVSOiBBU0NJSV9MRVRURVIsXG5cdExFVFRFUjogTEVUVEVSLFxuXHRFTU9KSTogRU1PSkksXG5cdEVNT0pJX1ZBUklBVElPTjogRU1PSklfVkFSSUFUSU9OJDEsXG5cdERJR0lUOiBESUdJVCxcblx0U1BBQ0U6IFNQQUNFXG59KTtcblxuLyoqXG5cdFRoZSBzY2FubmVyIHByb3ZpZGVzIGFuIGludGVyZmFjZSB0aGF0IHRha2VzIGEgc3RyaW5nIG9mIHRleHQgYXMgaW5wdXQsIGFuZFxuXHRvdXRwdXRzIGFuIGFycmF5IG9mIHRva2VucyBpbnN0YW5jZXMgdGhhdCBjYW4gYmUgdXNlZCBmb3IgZWFzeSBVUkwgcGFyc2luZy5cbiovXG5jb25zdCBOTCA9ICdcXG4nOyAvLyBOZXcgbGluZSBjaGFyYWN0ZXJcbmNvbnN0IEVNT0pJX1ZBUklBVElPTiA9ICdcXHVmZTBmJzsgLy8gVmFyaWF0aW9uIHNlbGVjdG9yLCBmb2xsb3dzIGhlYXJ0IGFuZCBvdGhlcnNcbmNvbnN0IEVNT0pJX0pPSU5FUiA9ICdcXHUyMDBkJzsgLy8gemVyby13aWR0aCBqb2luZXJcblxubGV0IHRsZHMgPSBudWxsLFxuICB1dGxkcyA9IG51bGw7IC8vIGRvbid0IGNoYW5nZSBzbyBvbmx5IGhhdmUgdG8gYmUgY29tcHV0ZWQgb25jZVxuXG4vKipcbiAqIFNjYW5uZXIgb3V0cHV0IHRva2VuOlxuICogLSBgdGAgaXMgdGhlIHRva2VuIG5hbWUgKGUuZy4sICdOVU0nLCAnRU1PSkknLCAnVExEJylcbiAqIC0gYHZgIGlzIHRoZSB2YWx1ZSBvZiB0aGUgdG9rZW4gKGUuZy4sICcxMjMnLCAnXHUyNzY0XHVGRTBGJywgJ2NvbScpXG4gKiAtIGBzYCBpcyB0aGUgc3RhcnQgaW5kZXggb2YgdGhlIHRva2VuIGluIHRoZSBvcmlnaW5hbCBzdHJpbmdcbiAqIC0gYGVgIGlzIHRoZSBlbmQgaW5kZXggb2YgdGhlIHRva2VuIGluIHRoZSBvcmlnaW5hbCBzdHJpbmdcbiAqIEB0eXBlZGVmIHt7dDogc3RyaW5nLCB2OiBzdHJpbmcsIHM6IG51bWJlciwgZTogbnVtYmVyfX0gVG9rZW5cbiAqL1xuXG4vKipcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAdHlwZWRlZiB7eyBbY29sbGVjdGlvbjogc3RyaW5nXTogVFtdIH19IENvbGxlY3Rpb25zXG4gKi9cblxuLyoqXG4gKiBJbml0aWFsaXplIHRoZSBzY2FubmVyIGNoYXJhY3Rlci1iYXNlZCBzdGF0ZSBtYWNoaW5lIGZvciB0aGUgZ2l2ZW4gc3RhcnRcbiAqIHN0YXRlXG4gKiBAcGFyYW0ge1tzdHJpbmcsIGJvb2xlYW5dW119IGN1c3RvbVNjaGVtZXMgTGlzdCBvZiBjdXN0b20gc2NoZW1lcywgd2hlcmUgZWFjaFxuICogaXRlbSBpcyBhIGxlbmd0aC0yIHR1cGxlIHdpdGggdGhlIGZpcnN0IGVsZW1lbnQgc2V0IHRvIHRoZSBzdHJpbmcgc2NoZW1lLCBhbmRcbiAqIHRoZSBzZWNvbmQgZWxlbWVudCBzZXQgdG8gYHRydWVgIGlmIHRoZSBgOi8vYCBhZnRlciB0aGUgc2NoZW1lIGlzIG9wdGlvbmFsXG4gKi9cbmZ1bmN0aW9uIGluaXQkMihjdXN0b21TY2hlbWVzKSB7XG4gIGlmIChjdXN0b21TY2hlbWVzID09PSB2b2lkIDApIHtcbiAgICBjdXN0b21TY2hlbWVzID0gW107XG4gIH1cbiAgLy8gRnJlcXVlbnRseSB1c2VkIHN0YXRlcyAobmFtZSBhcmd1bWVudCByZW1vdmVkIGR1cmluZyBtaW5pZmljYXRpb24pXG4gIC8qKiBAdHlwZSBDb2xsZWN0aW9uczxzdHJpbmc+ICovXG4gIGNvbnN0IGdyb3VwcyA9IHt9OyAvLyBvZiB0b2tlbnNcbiAgU3RhdGUuZ3JvdXBzID0gZ3JvdXBzO1xuICAvKiogQHR5cGUgU3RhdGU8c3RyaW5nPiAqL1xuICBjb25zdCBTdGFydCA9IG5ldyBTdGF0ZSgpO1xuICBpZiAodGxkcyA9PSBudWxsKSB7XG4gICAgdGxkcyA9IGRlY29kZVRsZHMoZW5jb2RlZFRsZHMpO1xuICB9XG4gIGlmICh1dGxkcyA9PSBudWxsKSB7XG4gICAgdXRsZHMgPSBkZWNvZGVUbGRzKGVuY29kZWRVdGxkcyk7XG4gIH1cblxuICAvLyBTdGF0ZXMgZm9yIHNwZWNpYWwgVVJMIHN5bWJvbHMgdGhhdCBhY2NlcHQgaW1tZWRpYXRlbHkgYWZ0ZXIgc3RhcnRcbiAgdHQoU3RhcnQsIFwiJ1wiLCBBUE9TVFJPUEhFKTtcbiAgdHQoU3RhcnQsICd7JywgT1BFTkJSQUNFKTtcbiAgdHQoU3RhcnQsICdbJywgT1BFTkJSQUNLRVQpO1xuICB0dChTdGFydCwgJzwnLCBPUEVOQU5HTEVCUkFDS0VUKTtcbiAgdHQoU3RhcnQsICcoJywgT1BFTlBBUkVOKTtcbiAgdHQoU3RhcnQsICd9JywgQ0xPU0VCUkFDRSk7XG4gIHR0KFN0YXJ0LCAnXScsIENMT1NFQlJBQ0tFVCk7XG4gIHR0KFN0YXJ0LCAnPicsIENMT1NFQU5HTEVCUkFDS0VUKTtcbiAgdHQoU3RhcnQsICcpJywgQ0xPU0VQQVJFTik7XG4gIHR0KFN0YXJ0LCAnJicsIEFNUEVSU0FORCk7XG4gIHR0KFN0YXJ0LCAnKicsIEFTVEVSSVNLKTtcbiAgdHQoU3RhcnQsICdAJywgQVQpO1xuICB0dChTdGFydCwgJ2AnLCBCQUNLVElDSyk7XG4gIHR0KFN0YXJ0LCAnXicsIENBUkVUKTtcbiAgdHQoU3RhcnQsICc6JywgQ09MT04pO1xuICB0dChTdGFydCwgJywnLCBDT01NQSk7XG4gIHR0KFN0YXJ0LCAnJCcsIERPTExBUik7XG4gIHR0KFN0YXJ0LCAnLicsIERPVCk7XG4gIHR0KFN0YXJ0LCAnPScsIEVRVUFMUyk7XG4gIHR0KFN0YXJ0LCAnIScsIEVYQ0xBTUFUSU9OKTtcbiAgdHQoU3RhcnQsICctJywgSFlQSEVOKTtcbiAgdHQoU3RhcnQsICclJywgUEVSQ0VOVCk7XG4gIHR0KFN0YXJ0LCAnfCcsIFBJUEUpO1xuICB0dChTdGFydCwgJysnLCBQTFVTKTtcbiAgdHQoU3RhcnQsICcjJywgUE9VTkQpO1xuICB0dChTdGFydCwgJz8nLCBRVUVSWSk7XG4gIHR0KFN0YXJ0LCAnXCInLCBRVU9URSk7XG4gIHR0KFN0YXJ0LCAnLycsIFNMQVNIKTtcbiAgdHQoU3RhcnQsICc7JywgU0VNSSk7XG4gIHR0KFN0YXJ0LCAnficsIFRJTERFKTtcbiAgdHQoU3RhcnQsICdfJywgVU5ERVJTQ09SRSk7XG4gIHR0KFN0YXJ0LCAnXFxcXCcsIEJBQ0tTTEFTSCk7XG4gIGNvbnN0IE51bSA9IHRyKFN0YXJ0LCBESUdJVCwgTlVNLCB7XG4gICAgW251bWVyaWNdOiB0cnVlXG4gIH0pO1xuICB0cihOdW0sIERJR0lULCBOdW0pO1xuXG4gIC8vIFN0YXRlIHdoaWNoIGVtaXRzIGEgd29yZCB0b2tlblxuICBjb25zdCBXb3JkID0gdHIoU3RhcnQsIEFTQ0lJX0xFVFRFUiwgV09SRCwge1xuICAgIFthc2NpaV06IHRydWVcbiAgfSk7XG4gIHRyKFdvcmQsIEFTQ0lJX0xFVFRFUiwgV29yZCk7XG5cbiAgLy8gU2FtZSBhcyBwcmV2aW91cywgYnV0IHNwZWNpZmljIHRvIG5vbi1mc20uYXNjaWkgYWxwaGFiZXQgd29yZHNcbiAgY29uc3QgVVdvcmQgPSB0cihTdGFydCwgTEVUVEVSLCBVV09SRCwge1xuICAgIFthbHBoYV06IHRydWVcbiAgfSk7XG4gIHRyKFVXb3JkLCBBU0NJSV9MRVRURVIpOyAvLyBOb24tYWNjZXB0aW5nXG4gIHRyKFVXb3JkLCBMRVRURVIsIFVXb3JkKTtcblxuICAvLyBXaGl0ZXNwYWNlIGp1bXBzXG4gIC8vIFRva2VucyBvZiBvbmx5IG5vbi1uZXdsaW5lIHdoaXRlc3BhY2UgYXJlIGFyYml0cmFyaWx5IGxvbmdcbiAgLy8gSWYgYW55IHdoaXRlc3BhY2UgZXhjZXB0IG5ld2xpbmUsIG1vcmUgd2hpdGVzcGFjZSFcbiAgY29uc3QgV3MgPSB0cihTdGFydCwgU1BBQ0UsIFdTLCB7XG4gICAgW3doaXRlc3BhY2VdOiB0cnVlXG4gIH0pO1xuICB0dChTdGFydCwgTkwsIE5MJDEsIHtcbiAgICBbd2hpdGVzcGFjZV06IHRydWVcbiAgfSk7XG4gIHR0KFdzLCBOTCk7IC8vIG5vbi1hY2NlcHRpbmcgc3RhdGUgdG8gYXZvaWQgbWl4aW5nIHdoaXRlc3BhY2VzXG4gIHRyKFdzLCBTUEFDRSwgV3MpO1xuXG4gIC8vIEVtb2ppIHRva2Vucy4gVGhleSBhcmUgbm90IGdyb3VwZWQgYnkgdGhlIHNjYW5uZXIgZXhjZXB0IGluIGNhc2VzIHdoZXJlIGFcbiAgLy8gemVyby13aWR0aCBqb2luZXIgaXMgcHJlc2VudFxuICBjb25zdCBFbW9qaSA9IHRyKFN0YXJ0LCBFTU9KSSwgRU1PSkkkMSwge1xuICAgIFtlbW9qaV06IHRydWVcbiAgfSk7XG4gIHRyKEVtb2ppLCBFTU9KSSwgRW1vamkpO1xuICB0dChFbW9qaSwgRU1PSklfVkFSSUFUSU9OLCBFbW9qaSk7XG4gIC8vIHR0KFN0YXJ0LCBFTU9KSV9WQVJJQVRJT04sIEVtb2ppKTsgLy8gVGhpcyBvbmUgaXMgc2tldGNoeVxuXG4gIGNvbnN0IEVtb2ppSm9pbmVyID0gdHQoRW1vamksIEVNT0pJX0pPSU5FUik7XG4gIHRyKEVtb2ppSm9pbmVyLCBFTU9KSSwgRW1vamkpO1xuICAvLyB0dChFbW9qaUpvaW5lciwgRU1PSklfVkFSSUFUSU9OLCBFbW9qaSk7IC8vIGFsc28gc2tldGNoeVxuXG4gIC8vIEdlbmVyYXRlcyBzdGF0ZXMgZm9yIHRvcC1sZXZlbCBkb21haW5zXG4gIC8vIE5vdGUgdGhhdCB0aGlzIGlzIG1vc3QgYWNjdXJhdGUgd2hlbiB0bGRzIGFyZSBpbiBhbHBoYWJldGljYWwgb3JkZXJcbiAgY29uc3Qgd29yZGpyID0gW1tBU0NJSV9MRVRURVIsIFdvcmRdXTtcbiAgY29uc3QgdXdvcmRqciA9IFtbQVNDSUlfTEVUVEVSLCBudWxsXSwgW0xFVFRFUiwgVVdvcmRdXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB0bGRzLmxlbmd0aDsgaSsrKSB7XG4gICAgZmFzdHRzKFN0YXJ0LCB0bGRzW2ldLCBUTEQsIFdPUkQsIHdvcmRqcik7XG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB1dGxkcy5sZW5ndGg7IGkrKykge1xuICAgIGZhc3R0cyhTdGFydCwgdXRsZHNbaV0sIFVUTEQsIFVXT1JELCB1d29yZGpyKTtcbiAgfVxuICBhZGRUb0dyb3VwcyhUTEQsIHtcbiAgICB0bGQ6IHRydWUsXG4gICAgYXNjaWk6IHRydWVcbiAgfSwgZ3JvdXBzKTtcbiAgYWRkVG9Hcm91cHMoVVRMRCwge1xuICAgIHV0bGQ6IHRydWUsXG4gICAgYWxwaGE6IHRydWVcbiAgfSwgZ3JvdXBzKTtcblxuICAvLyBDb2xsZWN0IHRoZSBzdGF0ZXMgZ2VuZXJhdGVkIGJ5IGRpZmZlcmVudCBwcm90b2NvbHMuIE5PVEU6IElmIGFueSBuZXcgVExEc1xuICAvLyBnZXQgYWRkZWQgdGhhdCBhcmUgYWxzbyBwcm90b2NvbHMsIHNldCB0aGUgdG9rZW4gdG8gYmUgdGhlIHNhbWUgYXMgdGhlXG4gIC8vIHByb3RvY29sIHRvIGVuc3VyZSBwYXJzaW5nIHdvcmtzIGFzIGV4cGVjdGVkLlxuICBmYXN0dHMoU3RhcnQsICdmaWxlJywgU0NIRU1FLCBXT1JELCB3b3JkanIpO1xuICBmYXN0dHMoU3RhcnQsICdtYWlsdG8nLCBTQ0hFTUUsIFdPUkQsIHdvcmRqcik7XG4gIGZhc3R0cyhTdGFydCwgJ2h0dHAnLCBTTEFTSF9TQ0hFTUUsIFdPUkQsIHdvcmRqcik7XG4gIGZhc3R0cyhTdGFydCwgJ2h0dHBzJywgU0xBU0hfU0NIRU1FLCBXT1JELCB3b3JkanIpO1xuICBmYXN0dHMoU3RhcnQsICdmdHAnLCBTTEFTSF9TQ0hFTUUsIFdPUkQsIHdvcmRqcik7XG4gIGZhc3R0cyhTdGFydCwgJ2Z0cHMnLCBTTEFTSF9TQ0hFTUUsIFdPUkQsIHdvcmRqcik7XG4gIGFkZFRvR3JvdXBzKFNDSEVNRSwge1xuICAgIHNjaGVtZTogdHJ1ZSxcbiAgICBhc2NpaTogdHJ1ZVxuICB9LCBncm91cHMpO1xuICBhZGRUb0dyb3VwcyhTTEFTSF9TQ0hFTUUsIHtcbiAgICBzbGFzaHNjaGVtZTogdHJ1ZSxcbiAgICBhc2NpaTogdHJ1ZVxuICB9LCBncm91cHMpO1xuXG4gIC8vIFJlZ2lzdGVyIGN1c3RvbSBzY2hlbWVzLiBBc3N1bWVzIGVhY2ggc2NoZW1lIGlzIGFzY2lpbnVtZXJpYyB3aXRoIGh5cGhlbnNcbiAgY3VzdG9tU2NoZW1lcyA9IGN1c3RvbVNjaGVtZXMuc29ydCgoYSwgYikgPT4gYVswXSA+IGJbMF0gPyAxIDogLTEpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGN1c3RvbVNjaGVtZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBzY2ggPSBjdXN0b21TY2hlbWVzW2ldWzBdO1xuICAgIGNvbnN0IG9wdGlvbmFsU2xhc2hTbGFzaCA9IGN1c3RvbVNjaGVtZXNbaV1bMV07XG4gICAgY29uc3QgZmxhZ3MgPSBvcHRpb25hbFNsYXNoU2xhc2ggPyB7XG4gICAgICBbc2NoZW1lXTogdHJ1ZVxuICAgIH0gOiB7XG4gICAgICBbc2xhc2hzY2hlbWVdOiB0cnVlXG4gICAgfTtcbiAgICBpZiAoc2NoLmluZGV4T2YoJy0nKSA+PSAwKSB7XG4gICAgICBmbGFnc1tkb21haW5dID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKCFBU0NJSV9MRVRURVIudGVzdChzY2gpKSB7XG4gICAgICBmbGFnc1tudW1lcmljXSA9IHRydWU7IC8vIG51bWJlcnMgb25seVxuICAgIH0gZWxzZSBpZiAoRElHSVQudGVzdChzY2gpKSB7XG4gICAgICBmbGFnc1thc2NpaW51bWVyaWNdID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgZmxhZ3NbYXNjaWldID0gdHJ1ZTtcbiAgICB9XG4gICAgdHMoU3RhcnQsIHNjaCwgc2NoLCBmbGFncyk7XG4gIH1cblxuICAvLyBMb2NhbGhvc3QgdG9rZW5cbiAgdHMoU3RhcnQsICdsb2NhbGhvc3QnLCBMT0NBTEhPU1QsIHtcbiAgICBhc2NpaTogdHJ1ZVxuICB9KTtcblxuICAvLyBTZXQgZGVmYXVsdCB0cmFuc2l0aW9uIGZvciBzdGFydCBzdGF0ZSAoc29tZSBzeW1ib2wpXG4gIFN0YXJ0LmpkID0gbmV3IFN0YXRlKFNZTSk7XG4gIHJldHVybiB7XG4gICAgc3RhcnQ6IFN0YXJ0LFxuICAgIHRva2VuczogYXNzaWduKHtcbiAgICAgIGdyb3Vwc1xuICAgIH0sIHRrKVxuICB9O1xufVxuXG4vKipcblx0R2l2ZW4gYSBzdHJpbmcsIHJldHVybnMgYW4gYXJyYXkgb2YgVE9LRU4gaW5zdGFuY2VzIHJlcHJlc2VudGluZyB0aGVcblx0Y29tcG9zaXRpb24gb2YgdGhhdCBzdHJpbmcuXG5cblx0QG1ldGhvZCBydW5cblx0QHBhcmFtIHtTdGF0ZTxzdHJpbmc+fSBzdGFydCBzY2FubmVyIHN0YXJ0aW5nIHN0YXRlXG5cdEBwYXJhbSB7c3RyaW5nfSBzdHIgaW5wdXQgc3RyaW5nIHRvIHNjYW5cblx0QHJldHVybiB7VG9rZW5bXX0gbGlzdCBvZiB0b2tlbnMsIGVhY2ggd2l0aCBhIHR5cGUgYW5kIHZhbHVlXG4qL1xuZnVuY3Rpb24gcnVuJDEoc3RhcnQsIHN0cikge1xuICAvLyBTdGF0ZSBtYWNoaW5lIGlzIG5vdCBjYXNlIHNlbnNpdGl2ZSwgc28gaW5wdXQgaXMgdG9rZW5pemVkIGluIGxvd2VyY2FzZWRcbiAgLy8gZm9ybSAoc3RpbGwgcmV0dXJucyByZWd1bGFyIGNhc2UpLiBVc2VzIHNlbGVjdGl2ZSBgdG9Mb3dlckNhc2VgIGJlY2F1c2VcbiAgLy8gbG93ZXJjYXNpbmcgdGhlIGVudGlyZSBzdHJpbmcgY2F1c2VzIHRoZSBsZW5ndGggYW5kIGNoYXJhY3RlciBwb3NpdGlvbiB0b1xuICAvLyB2YXJ5IGluIHNvbWUgbm9uLUVuZ2xpc2ggc3RyaW5ncyB3aXRoIFY4LWJhc2VkIHJ1bnRpbWVzLlxuICBjb25zdCBpdGVyYWJsZSA9IHN0cmluZ1RvQXJyYXkoc3RyLnJlcGxhY2UoL1tBLVpdL2csIGMgPT4gYy50b0xvd2VyQ2FzZSgpKSk7XG4gIGNvbnN0IGNoYXJDb3VudCA9IGl0ZXJhYmxlLmxlbmd0aDsgLy8gPD0gbGVuIGlmIHRoZXJlIGFyZSBlbW9qaXMsIGV0Y1xuICBjb25zdCB0b2tlbnMgPSBbXTsgLy8gcmV0dXJuIHZhbHVlXG5cbiAgLy8gY3Vyc29yIHRocm91Z2ggdGhlIHN0cmluZyBpdHNlbGYsIGFjY291bnRpbmcgZm9yIGNoYXJhY3RlcnMgdGhhdCBoYXZlXG4gIC8vIHdpZHRoIHdpdGggbGVuZ3RoIDIgc3VjaCBhcyBlbW9qaXNcbiAgbGV0IGN1cnNvciA9IDA7XG5cbiAgLy8gQ3Vyc29yIHRocm91Z2ggdGhlIGFycmF5LXJlcHJlc2VudGF0aW9uIG9mIHRoZSBzdHJpbmdcbiAgbGV0IGNoYXJDdXJzb3IgPSAwO1xuXG4gIC8vIFRva2VuaXplIHRoZSBzdHJpbmdcbiAgd2hpbGUgKGNoYXJDdXJzb3IgPCBjaGFyQ291bnQpIHtcbiAgICBsZXQgc3RhdGUgPSBzdGFydDtcbiAgICBsZXQgbmV4dFN0YXRlID0gbnVsbDtcbiAgICBsZXQgdG9rZW5MZW5ndGggPSAwO1xuICAgIGxldCBsYXRlc3RBY2NlcHRpbmcgPSBudWxsO1xuICAgIGxldCBzaW5jZUFjY2VwdHMgPSAtMTtcbiAgICBsZXQgY2hhcnNTaW5jZUFjY2VwdHMgPSAtMTtcbiAgICB3aGlsZSAoY2hhckN1cnNvciA8IGNoYXJDb3VudCAmJiAobmV4dFN0YXRlID0gc3RhdGUuZ28oaXRlcmFibGVbY2hhckN1cnNvcl0pKSkge1xuICAgICAgc3RhdGUgPSBuZXh0U3RhdGU7XG5cbiAgICAgIC8vIEtlZXAgdHJhY2sgb2YgdGhlIGxhdGVzdCBhY2NlcHRpbmcgc3RhdGVcbiAgICAgIGlmIChzdGF0ZS5hY2NlcHRzKCkpIHtcbiAgICAgICAgc2luY2VBY2NlcHRzID0gMDtcbiAgICAgICAgY2hhcnNTaW5jZUFjY2VwdHMgPSAwO1xuICAgICAgICBsYXRlc3RBY2NlcHRpbmcgPSBzdGF0ZTtcbiAgICAgIH0gZWxzZSBpZiAoc2luY2VBY2NlcHRzID49IDApIHtcbiAgICAgICAgc2luY2VBY2NlcHRzICs9IGl0ZXJhYmxlW2NoYXJDdXJzb3JdLmxlbmd0aDtcbiAgICAgICAgY2hhcnNTaW5jZUFjY2VwdHMrKztcbiAgICAgIH1cbiAgICAgIHRva2VuTGVuZ3RoICs9IGl0ZXJhYmxlW2NoYXJDdXJzb3JdLmxlbmd0aDtcbiAgICAgIGN1cnNvciArPSBpdGVyYWJsZVtjaGFyQ3Vyc29yXS5sZW5ndGg7XG4gICAgICBjaGFyQ3Vyc29yKys7XG4gICAgfVxuXG4gICAgLy8gUm9sbCBiYWNrIHRvIHRoZSBsYXRlc3QgYWNjZXB0aW5nIHN0YXRlXG4gICAgY3Vyc29yIC09IHNpbmNlQWNjZXB0cztcbiAgICBjaGFyQ3Vyc29yIC09IGNoYXJzU2luY2VBY2NlcHRzO1xuICAgIHRva2VuTGVuZ3RoIC09IHNpbmNlQWNjZXB0cztcblxuICAgIC8vIE5vIG1vcmUganVtcHMsIGp1c3QgbWFrZSBhIG5ldyB0b2tlbiBmcm9tIHRoZSBsYXN0IGFjY2VwdGluZyBvbmVcbiAgICB0b2tlbnMucHVzaCh7XG4gICAgICB0OiBsYXRlc3RBY2NlcHRpbmcudCxcbiAgICAgIC8vIHRva2VuIHR5cGUvbmFtZVxuICAgICAgdjogc3RyLnNsaWNlKGN1cnNvciAtIHRva2VuTGVuZ3RoLCBjdXJzb3IpLFxuICAgICAgLy8gc3RyaW5nIHZhbHVlXG4gICAgICBzOiBjdXJzb3IgLSB0b2tlbkxlbmd0aCxcbiAgICAgIC8vIHN0YXJ0IGluZGV4XG4gICAgICBlOiBjdXJzb3IgLy8gZW5kIGluZGV4IChleGNsdWRpbmcpXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gdG9rZW5zO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYSBTdHJpbmcgdG8gYW4gQXJyYXkgb2YgY2hhcmFjdGVycywgdGFraW5nIGludG8gYWNjb3VudCB0aGF0IHNvbWVcbiAqIGNoYXJhY3RlcnMgbGlrZSBlbW9qaXMgdGFrZSB1cCB0d28gc3RyaW5nIGluZGV4ZXMuXG4gKlxuICogQWRhcHRlZCBmcm9tIGNvcmUtanMgKE1JVCBsaWNlbnNlKVxuICogaHR0cHM6Ly9naXRodWIuY29tL3psb2lyb2NrL2NvcmUtanMvYmxvYi8yZDY5Y2Y1Zjk5YWIzZWEzNDYzYzM5NWRmODFlNWExNWI2OGY0OWQ5L3BhY2thZ2VzL2NvcmUtanMvaW50ZXJuYWxzL3N0cmluZy1tdWx0aWJ5dGUuanNcbiAqXG4gKiBAZnVuY3Rpb24gc3RyaW5nVG9BcnJheVxuICogQHBhcmFtIHtzdHJpbmd9IHN0clxuICogQHJldHVybnMge3N0cmluZ1tdfVxuICovXG5mdW5jdGlvbiBzdHJpbmdUb0FycmF5KHN0cikge1xuICBjb25zdCByZXN1bHQgPSBbXTtcbiAgY29uc3QgbGVuID0gc3RyLmxlbmd0aDtcbiAgbGV0IGluZGV4ID0gMDtcbiAgd2hpbGUgKGluZGV4IDwgbGVuKSB7XG4gICAgbGV0IGZpcnN0ID0gc3RyLmNoYXJDb2RlQXQoaW5kZXgpO1xuICAgIGxldCBzZWNvbmQ7XG4gICAgbGV0IGNoYXIgPSBmaXJzdCA8IDB4ZDgwMCB8fCBmaXJzdCA+IDB4ZGJmZiB8fCBpbmRleCArIDEgPT09IGxlbiB8fCAoc2Vjb25kID0gc3RyLmNoYXJDb2RlQXQoaW5kZXggKyAxKSkgPCAweGRjMDAgfHwgc2Vjb25kID4gMHhkZmZmID8gc3RyW2luZGV4XSAvLyBzaW5nbGUgY2hhcmFjdGVyXG4gICAgOiBzdHIuc2xpY2UoaW5kZXgsIGluZGV4ICsgMik7IC8vIHR3by1pbmRleCBjaGFyYWN0ZXJzXG4gICAgcmVzdWx0LnB1c2goY2hhcik7XG4gICAgaW5kZXggKz0gY2hhci5sZW5ndGg7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBGYXN0IHZlcnNpb24gb2YgdHMgZnVuY3Rpb24gZm9yIHdoZW4gdHJhbnNpdGlvbiBkZWZhdWx0cyBhcmUgd2VsbCBrbm93blxuICogQHBhcmFtIHtTdGF0ZTxzdHJpbmc+fSBzdGF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IGlucHV0XG4gKiBAcGFyYW0ge3N0cmluZ30gdFxuICogQHBhcmFtIHtzdHJpbmd9IGRlZmF1bHR0XG4gKiBAcGFyYW0ge1tSZWdFeHAsIFN0YXRlPHN0cmluZz5dW119IGpyXG4gKiBAcmV0dXJucyB7U3RhdGU8c3RyaW5nPn1cbiAqL1xuZnVuY3Rpb24gZmFzdHRzKHN0YXRlLCBpbnB1dCwgdCwgZGVmYXVsdHQsIGpyKSB7XG4gIGxldCBuZXh0O1xuICBjb25zdCBsZW4gPSBpbnB1dC5sZW5ndGg7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuIC0gMTsgaSsrKSB7XG4gICAgY29uc3QgY2hhciA9IGlucHV0W2ldO1xuICAgIGlmIChzdGF0ZS5qW2NoYXJdKSB7XG4gICAgICBuZXh0ID0gc3RhdGUualtjaGFyXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV4dCA9IG5ldyBTdGF0ZShkZWZhdWx0dCk7XG4gICAgICBuZXh0LmpyID0ganIuc2xpY2UoKTtcbiAgICAgIHN0YXRlLmpbY2hhcl0gPSBuZXh0O1xuICAgIH1cbiAgICBzdGF0ZSA9IG5leHQ7XG4gIH1cbiAgbmV4dCA9IG5ldyBTdGF0ZSh0KTtcbiAgbmV4dC5qciA9IGpyLnNsaWNlKCk7XG4gIHN0YXRlLmpbaW5wdXRbbGVuIC0gMV1dID0gbmV4dDtcbiAgcmV0dXJuIG5leHQ7XG59XG5cbi8qKlxuICogQ29udmVydHMgYSBzdHJpbmcgb2YgVG9wLUxldmVsIERvbWFpbiBuYW1lcyBlbmNvZGVkIGluIHVwZGF0ZS10bGRzLmpzIGJhY2tcbiAqIGludG8gYSBsaXN0IG9mIHN0cmluZ3MuXG4gKiBAcGFyYW0ge3N0cn0gZW5jb2RlZCBlbmNvZGVkIFRMRHMgc3RyaW5nXG4gKiBAcmV0dXJucyB7c3RyW119IG9yaWdpbmFsIFRMRHMgbGlzdFxuICovXG5mdW5jdGlvbiBkZWNvZGVUbGRzKGVuY29kZWQpIHtcbiAgY29uc3Qgd29yZHMgPSBbXTtcbiAgY29uc3Qgc3RhY2sgPSBbXTtcbiAgbGV0IGkgPSAwO1xuICBsZXQgZGlnaXRzID0gJzAxMjM0NTY3ODknO1xuICB3aGlsZSAoaSA8IGVuY29kZWQubGVuZ3RoKSB7XG4gICAgbGV0IHBvcERpZ2l0Q291bnQgPSAwO1xuICAgIHdoaWxlIChkaWdpdHMuaW5kZXhPZihlbmNvZGVkW2kgKyBwb3BEaWdpdENvdW50XSkgPj0gMCkge1xuICAgICAgcG9wRGlnaXRDb3VudCsrOyAvLyBlbmNvdW50ZXJlZCBzb21lIGRpZ2l0cywgaGF2ZSB0byBwb3AgdG8gZ28gb25lIGxldmVsIHVwIHRyaWVcbiAgICB9XG5cbiAgICBpZiAocG9wRGlnaXRDb3VudCA+IDApIHtcbiAgICAgIHdvcmRzLnB1c2goc3RhY2suam9pbignJykpOyAvLyB3aGF0ZXZlciBwcmVjZWRlZCB0aGUgcG9wIGRpZ2l0cyBtdXN0IGJlIGEgd29yZFxuICAgICAgZm9yIChsZXQgcG9wQ291bnQgPSBwYXJzZUludChlbmNvZGVkLnN1YnN0cmluZyhpLCBpICsgcG9wRGlnaXRDb3VudCksIDEwKTsgcG9wQ291bnQgPiAwOyBwb3BDb3VudC0tKSB7XG4gICAgICAgIHN0YWNrLnBvcCgpO1xuICAgICAgfVxuICAgICAgaSArPSBwb3BEaWdpdENvdW50O1xuICAgIH0gZWxzZSB7XG4gICAgICBzdGFjay5wdXNoKGVuY29kZWRbaV0pOyAvLyBkcm9wIGRvd24gYSBsZXZlbCBpbnRvIHRoZSB0cmllXG4gICAgICBpKys7XG4gICAgfVxuICB9XG4gIHJldHVybiB3b3Jkcztcbn1cblxuLyoqXG4gKiBBbiBvYmplY3Qgd2hlcmUgZWFjaCBrZXkgaXMgYSB2YWxpZCBET00gRXZlbnQgTmFtZSBzdWNoIGFzIGBjbGlja2Agb3IgYGZvY3VzYFxuICogYW5kIGVhY2ggdmFsdWUgaXMgYW4gZXZlbnQgaGFuZGxlciBmdW5jdGlvbi5cbiAqXG4gKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvRWxlbWVudCNldmVudHNcbiAqIEB0eXBlZGVmIHs/eyBbZXZlbnQ6IHN0cmluZ106IEZ1bmN0aW9uIH19IEV2ZW50TGlzdGVuZXJzXG4gKi9cblxuLyoqXG4gKiBBbGwgZm9ybWF0dGVkIHByb3BlcnRpZXMgcmVxdWlyZWQgdG8gcmVuZGVyIGEgbGluaywgaW5jbHVkaW5nIGB0YWdOYW1lYCxcbiAqIGBhdHRyaWJ1dGVzYCwgYGNvbnRlbnRgIGFuZCBgZXZlbnRMaXN0ZW5lcnNgLlxuICogQHR5cGVkZWYge3sgdGFnTmFtZTogYW55LCBhdHRyaWJ1dGVzOiB7W2F0dHI6IHN0cmluZ106IGFueX0sIGNvbnRlbnQ6IHN0cmluZyxcbiAqIGV2ZW50TGlzdGVuZXJzOiBFdmVudExpc3RlbmVycyB9fSBJbnRlcm1lZGlhdGVSZXByZXNlbnRhdGlvblxuICovXG5cbi8qKlxuICogU3BlY2lmeSBlaXRoZXIgYW4gb2JqZWN0IGRlc2NyaWJlZCBieSB0aGUgdGVtcGxhdGUgdHlwZSBgT2Agb3IgYSBmdW5jdGlvbi5cbiAqXG4gKiBUaGUgZnVuY3Rpb24gdGFrZXMgYSBzdHJpbmcgdmFsdWUgKHVzdWFsbHkgdGhlIGxpbmsncyBocmVmIGF0dHJpYnV0ZSksIHRoZVxuICogbGluayB0eXBlIChgJ3VybCdgLCBgJ2hhc2h0YWdgJywgZXRjLikgYW5kIGFuIGludGVybmFsIHRva2VuIHJlcHJlc2VudGF0aW9uXG4gKiBvZiB0aGUgbGluay4gSXQgc2hvdWxkIHJldHVybiBhbiBvYmplY3Qgb2YgdGhlIHRlbXBsYXRlIHR5cGUgYE9gXG4gKiBAdGVtcGxhdGUgT1xuICogQHR5cGVkZWYge08gfCAoKHZhbHVlOiBzdHJpbmcsIHR5cGU6IHN0cmluZywgdG9rZW46IE11bHRpVG9rZW4pID0+IE8pfSBPcHRPYmpcbiAqL1xuXG4vKipcbiAqIFNwZWNpZnkgZWl0aGVyIGEgZnVuY3Rpb24gZGVzY3JpYmVkIGJ5IHRlbXBsYXRlIHR5cGUgYEZgIG9yIGFuIG9iamVjdC5cbiAqXG4gKiBFYWNoIGtleSBpbiB0aGUgb2JqZWN0IHNob3VsZCBiZSBhIGxpbmsgdHlwZSAoYCd1cmwnYCwgYCdoYXNodGFnYCcsIGV0Yy4pLiBFYWNoXG4gKiB2YWx1ZSBzaG91bGQgYmUgYSBmdW5jdGlvbiB3aXRoIHRlbXBsYXRlIHR5cGUgYEZgIHRoYXQgaXMgY2FsbGVkIHdoZW4gdGhlXG4gKiBjb3JyZXNwb25kaW5nIGxpbmsgdHlwZSBpcyBlbmNvdW50ZXJlZC5cbiAqIEB0ZW1wbGF0ZSBGXG4gKiBAdHlwZWRlZiB7RiB8IHsgW3R5cGU6IHN0cmluZ106IEZ9fSBPcHRGblxuICovXG5cbi8qKlxuICogU3BlY2lmeSBlaXRoZXIgYSB2YWx1ZSB3aXRoIHRlbXBsYXRlIHR5cGUgYFZgLCBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBgVmAgb3JcbiAqIGFuIG9iamVjdCB3aGVyZSBlYWNoIHZhbHVlIHJlc29sdmVzIHRvIGBWYC5cbiAqXG4gKiBUaGUgZnVuY3Rpb24gdGFrZXMgYSBzdHJpbmcgdmFsdWUgKHVzdWFsbHkgdGhlIGxpbmsncyBocmVmIGF0dHJpYnV0ZSksIHRoZVxuICogbGluayB0eXBlIChgJ3VybCdgLCBgJ2hhc2h0YWdgJywgZXRjLikgYW5kIGFuIGludGVybmFsIHRva2VuIHJlcHJlc2VudGF0aW9uXG4gKiBvZiB0aGUgbGluay4gSXQgc2hvdWxkIHJldHVybiBhbiBvYmplY3Qgb2YgdGhlIHRlbXBsYXRlIHR5cGUgYFZgXG4gKlxuICogRm9yIHRoZSBvYmplY3QsIGVhY2gga2V5IHNob3VsZCBiZSBhIGxpbmsgdHlwZSAoYCd1cmwnYCwgYCdoYXNodGFnYCcsIGV0Yy4pLlxuICogRWFjaCB2YWx1ZSBzaG91bGQgZWl0aGVyIGhhdmUgdHlwZSBgVmAgb3IgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgVi4gVGhpc1xuICogZnVuY3Rpb24gc2ltaWxhcmx5IHRha2VzIGEgc3RyaW5nIHZhbHVlIGFuZCBhIHRva2VuLlxuICpcbiAqIEV4YW1wbGUgdmFsaWQgdHlwZXMgZm9yIGBPcHQ8c3RyaW5nPmA6XG4gKlxuICogYGBganNcbiAqICdoZWxsbydcbiAqICh2YWx1ZSwgdHlwZSwgdG9rZW4pID0+ICd3b3JsZCdcbiAqIHsgdXJsOiAnaGVsbG8nLCBlbWFpbDogKHZhbHVlLCB0b2tlbikgPT4gJ3dvcmxkJ31cbiAqIGBgYFxuICogQHRlbXBsYXRlIFZcbiAqIEB0eXBlZGVmIHtWIHwgKCh2YWx1ZTogc3RyaW5nLCB0eXBlOiBzdHJpbmcsIHRva2VuOiBNdWx0aVRva2VuKSA9PiBWKSB8IHsgW3R5cGU6IHN0cmluZ106IFYgfCAoKHZhbHVlOiBzdHJpbmcsIHRva2VuOiBNdWx0aVRva2VuKSA9PiBWKSB9fSBPcHRcbiAqL1xuXG4vKipcbiAqIFNlZSBhdmFpbGFibGUgb3B0aW9uczogaHR0cHM6Ly9saW5raWZ5LmpzLm9yZy9kb2NzL29wdGlvbnMuaHRtbFxuICogQHR5cGVkZWYge3tcbiAqIFx0ZGVmYXVsdFByb3RvY29sPzogc3RyaW5nLFxuICogIGV2ZW50cz86IE9wdE9iajxFdmVudExpc3RlbmVycz4sXG4gKiBcdGZvcm1hdD86IE9wdDxzdHJpbmc+LFxuICogXHRmb3JtYXRIcmVmPzogT3B0PHN0cmluZz4sXG4gKiBcdG5sMmJyPzogYm9vbGVhbixcbiAqIFx0dGFnTmFtZT86IE9wdDxhbnk+LFxuICogXHR0YXJnZXQ/OiBPcHQ8c3RyaW5nPixcbiAqIFx0cmVsPzogT3B0PHN0cmluZz4sXG4gKiBcdHZhbGlkYXRlPzogT3B0PGJvb2xlYW4+LFxuICogXHR0cnVuY2F0ZT86IE9wdDxudW1iZXI+LFxuICogXHRjbGFzc05hbWU/OiBPcHQ8c3RyaW5nPixcbiAqIFx0YXR0cmlidXRlcz86IE9wdE9iajwoeyBbYXR0cjogc3RyaW5nXTogYW55IH0pPixcbiAqICBpZ25vcmVUYWdzPzogc3RyaW5nW10sXG4gKiBcdHJlbmRlcj86IE9wdEZuPCgoaXI6IEludGVybWVkaWF0ZVJlcHJlc2VudGF0aW9uKSA9PiBhbnkpPlxuICogfX0gT3B0c1xuICovXG5cbi8qKlxuICogQHR5cGUgUmVxdWlyZWQ8T3B0cz5cbiAqL1xuY29uc3QgZGVmYXVsdHMgPSB7XG4gIGRlZmF1bHRQcm90b2NvbDogJ2h0dHAnLFxuICBldmVudHM6IG51bGwsXG4gIGZvcm1hdDogbm9vcCxcbiAgZm9ybWF0SHJlZjogbm9vcCxcbiAgbmwyYnI6IGZhbHNlLFxuICB0YWdOYW1lOiAnYScsXG4gIHRhcmdldDogbnVsbCxcbiAgcmVsOiBudWxsLFxuICB2YWxpZGF0ZTogdHJ1ZSxcbiAgdHJ1bmNhdGU6IEluZmluaXR5LFxuICBjbGFzc05hbWU6IG51bGwsXG4gIGF0dHJpYnV0ZXM6IG51bGwsXG4gIGlnbm9yZVRhZ3M6IFtdLFxuICByZW5kZXI6IG51bGxcbn07XG5cbi8qKlxuICogVXRpbGl0eSBjbGFzcyBmb3IgbGlua2lmeSBpbnRlcmZhY2VzIHRvIGFwcGx5IHNwZWNpZmllZFxuICoge0BsaW5rIE9wdHMgZm9ybWF0dGluZyBhbmQgcmVuZGVyaW5nIG9wdGlvbnN9LlxuICpcbiAqIEBwYXJhbSB7T3B0cyB8IE9wdGlvbnN9IFtvcHRzXSBPcHRpb24gdmFsdWUgb3ZlcnJpZGVzLlxuICogQHBhcmFtIHsoaXI6IEludGVybWVkaWF0ZVJlcHJlc2VudGF0aW9uKSA9PiBhbnl9IFtkZWZhdWx0UmVuZGVyXSAoRm9yXG4gKiAgIGludGVybmFsIHVzZSkgZGVmYXVsdCByZW5kZXIgZnVuY3Rpb24gdGhhdCBkZXRlcm1pbmVzIGhvdyB0byBnZW5lcmF0ZSBhblxuICogICBIVE1MIGVsZW1lbnQgYmFzZWQgb24gYSBsaW5rIHRva2VuJ3MgZGVyaXZlZCB0YWdOYW1lLCBhdHRyaWJ1dGVzIGFuZCBIVE1MLlxuICogICBTaW1pbGFyIHRvIHJlbmRlciBvcHRpb25cbiAqL1xuZnVuY3Rpb24gT3B0aW9ucyhvcHRzLCBkZWZhdWx0UmVuZGVyKSB7XG4gIGlmIChkZWZhdWx0UmVuZGVyID09PSB2b2lkIDApIHtcbiAgICBkZWZhdWx0UmVuZGVyID0gbnVsbDtcbiAgfVxuICBsZXQgbyA9IGFzc2lnbih7fSwgZGVmYXVsdHMpO1xuICBpZiAob3B0cykge1xuICAgIG8gPSBhc3NpZ24obywgb3B0cyBpbnN0YW5jZW9mIE9wdGlvbnMgPyBvcHRzLm8gOiBvcHRzKTtcbiAgfVxuXG4gIC8vIEVuc3VyZSBhbGwgaWdub3JlZCB0YWdzIGFyZSB1cHBlcmNhc2VcbiAgY29uc3QgaWdub3JlZFRhZ3MgPSBvLmlnbm9yZVRhZ3M7XG4gIGNvbnN0IHVwcGVyY2FzZUlnbm9yZWRUYWdzID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgaWdub3JlZFRhZ3MubGVuZ3RoOyBpKyspIHtcbiAgICB1cHBlcmNhc2VJZ25vcmVkVGFncy5wdXNoKGlnbm9yZWRUYWdzW2ldLnRvVXBwZXJDYXNlKCkpO1xuICB9XG4gIC8qKiBAcHJvdGVjdGVkICovXG4gIHRoaXMubyA9IG87XG4gIGlmIChkZWZhdWx0UmVuZGVyKSB7XG4gICAgdGhpcy5kZWZhdWx0UmVuZGVyID0gZGVmYXVsdFJlbmRlcjtcbiAgfVxuICB0aGlzLmlnbm9yZVRhZ3MgPSB1cHBlcmNhc2VJZ25vcmVkVGFncztcbn1cbk9wdGlvbnMucHJvdG90eXBlID0ge1xuICBvOiBkZWZhdWx0cyxcbiAgLyoqXG4gICAqIEB0eXBlIHN0cmluZ1tdXG4gICAqL1xuICBpZ25vcmVUYWdzOiBbXSxcbiAgLyoqXG4gICAqIEBwYXJhbSB7SW50ZXJtZWRpYXRlUmVwcmVzZW50YXRpb259IGlyXG4gICAqIEByZXR1cm5zIHthbnl9XG4gICAqL1xuICBkZWZhdWx0UmVuZGVyKGlyKSB7XG4gICAgcmV0dXJuIGlyO1xuICB9LFxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIG9yIGZhbHNlIGJhc2VkIG9uIHdoZXRoZXIgYSB0b2tlbiBzaG91bGQgYmUgZGlzcGxheWVkIGFzIGFcbiAgICogbGluayBiYXNlZCBvbiB0aGUgdXNlciBvcHRpb25zLlxuICAgKiBAcGFyYW0ge011bHRpVG9rZW59IHRva2VuXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgY2hlY2sodG9rZW4pIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3ZhbGlkYXRlJywgdG9rZW4udG9TdHJpbmcoKSwgdG9rZW4pO1xuICB9LFxuICAvLyBQcml2YXRlIG1ldGhvZHNcblxuICAvKipcbiAgICogUmVzb2x2ZSBhbiBvcHRpb24ncyB2YWx1ZSBiYXNlZCBvbiB0aGUgdmFsdWUgb2YgdGhlIG9wdGlvbiBhbmQgdGhlIGdpdmVuXG4gICAqIHBhcmFtcy4gSWYgb3BlcmF0b3IgYW5kIHRva2VuIGFyZSBzcGVjaWZpZWQgYW5kIHRoZSB0YXJnZXQgb3B0aW9uIGlzXG4gICAqIGNhbGxhYmxlLCBhdXRvbWF0aWNhbGx5IGNhbGxzIHRoZSBmdW5jdGlvbiB3aXRoIHRoZSBnaXZlbiBhcmd1bWVudC5cbiAgICogQHRlbXBsYXRlIHtrZXlvZiBPcHRzfSBLXG4gICAqIEBwYXJhbSB7S30ga2V5IE5hbWUgb2Ygb3B0aW9uIHRvIHVzZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gW29wZXJhdG9yXSB3aWxsIGJlIHBhc3NlZCB0byB0aGUgdGFyZ2V0IG9wdGlvbiBpZiBpdCdzIGFcbiAgICogZnVuY3Rpb24uIElmIG5vdCBzcGVjaWZpZWQsIFJBVyBmdW5jdGlvbiB2YWx1ZSBnZXRzIHJldHVybmVkXG4gICAqIEBwYXJhbSB7TXVsdGlUb2tlbn0gW3Rva2VuXSBUaGUgdG9rZW4gZnJvbSBsaW5raWZ5LnRva2VuaXplXG4gICAqIEByZXR1cm5zIHtPcHRzW0tdIHwgYW55fVxuICAgKi9cbiAgZ2V0KGtleSwgb3BlcmF0b3IsIHRva2VuKSB7XG4gICAgY29uc3QgaXNDYWxsYWJsZSA9IG9wZXJhdG9yICE9IG51bGw7XG4gICAgbGV0IG9wdGlvbiA9IHRoaXMub1trZXldO1xuICAgIGlmICghb3B0aW9uKSB7XG4gICAgICByZXR1cm4gb3B0aW9uO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIG9wdGlvbiA9PT0gJ29iamVjdCcpIHtcbiAgICAgIG9wdGlvbiA9IHRva2VuLnQgaW4gb3B0aW9uID8gb3B0aW9uW3Rva2VuLnRdIDogZGVmYXVsdHNba2V5XTtcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09PSAnZnVuY3Rpb24nICYmIGlzQ2FsbGFibGUpIHtcbiAgICAgICAgb3B0aW9uID0gb3B0aW9uKG9wZXJhdG9yLCB0b2tlbik7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygb3B0aW9uID09PSAnZnVuY3Rpb24nICYmIGlzQ2FsbGFibGUpIHtcbiAgICAgIG9wdGlvbiA9IG9wdGlvbihvcGVyYXRvciwgdG9rZW4udCwgdG9rZW4pO1xuICAgIH1cbiAgICByZXR1cm4gb3B0aW9uO1xuICB9LFxuICAvKipcbiAgICogQHRlbXBsYXRlIHtrZXlvZiBPcHRzfSBMXG4gICAqIEBwYXJhbSB7TH0ga2V5IE5hbWUgb2Ygb3B0aW9ucyBvYmplY3QgdG8gdXNlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbb3BlcmF0b3JdXG4gICAqIEBwYXJhbSB7TXVsdGlUb2tlbn0gW3Rva2VuXVxuICAgKiBAcmV0dXJucyB7T3B0c1tMXSB8IGFueX1cbiAgICovXG4gIGdldE9iaihrZXksIG9wZXJhdG9yLCB0b2tlbikge1xuICAgIGxldCBvYmogPSB0aGlzLm9ba2V5XTtcbiAgICBpZiAodHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJyAmJiBvcGVyYXRvciAhPSBudWxsKSB7XG4gICAgICBvYmogPSBvYmoob3BlcmF0b3IsIHRva2VuLnQsIHRva2VuKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfSxcbiAgLyoqXG4gICAqIENvbnZlcnQgdGhlIGdpdmVuIHRva2VuIHRvIGEgcmVuZGVyZWQgZWxlbWVudCB0aGF0IG1heSBiZSBhZGRlZCB0byB0aGVcbiAgICogY2FsbGluZy1pbnRlcmZhY2UncyBET01cbiAgICogQHBhcmFtIHtNdWx0aVRva2VufSB0b2tlbiBUb2tlbiB0byByZW5kZXIgdG8gYW4gSFRNTCBlbGVtZW50XG4gICAqIEByZXR1cm5zIHthbnl9IFJlbmRlciByZXN1bHQ7IGUuZy4sIEhUTUwgc3RyaW5nLCBET00gZWxlbWVudCwgUmVhY3RcbiAgICogICBDb21wb25lbnQsIGV0Yy5cbiAgICovXG4gIHJlbmRlcih0b2tlbikge1xuICAgIGNvbnN0IGlyID0gdG9rZW4ucmVuZGVyKHRoaXMpOyAvLyBpbnRlcm1lZGlhdGUgcmVwcmVzZW50YXRpb25cbiAgICBjb25zdCByZW5kZXJGbiA9IHRoaXMuZ2V0KCdyZW5kZXInLCBudWxsLCB0b2tlbikgfHwgdGhpcy5kZWZhdWx0UmVuZGVyO1xuICAgIHJldHVybiByZW5kZXJGbihpciwgdG9rZW4udCwgdG9rZW4pO1xuICB9XG59O1xuZnVuY3Rpb24gbm9vcCh2YWwpIHtcbiAgcmV0dXJuIHZhbDtcbn1cblxudmFyIG9wdGlvbnMgPSAvKiNfX1BVUkVfXyovT2JqZWN0LmZyZWV6ZSh7XG5cdF9fcHJvdG9fXzogbnVsbCxcblx0ZGVmYXVsdHM6IGRlZmF1bHRzLFxuXHRPcHRpb25zOiBPcHRpb25zLFxuXHRhc3NpZ246IGFzc2lnblxufSk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblx0TXVsdGktVG9rZW5zXG5cdFRva2VucyBjb21wb3NlZCBvZiBhcnJheXMgb2YgVGV4dFRva2Vuc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZVxuICogQHBhcmFtIHtUb2tlbltdfSB0b2tlbnNcbiAqL1xuZnVuY3Rpb24gTXVsdGlUb2tlbih2YWx1ZSwgdG9rZW5zKSB7XG4gIHRoaXMudCA9ICd0b2tlbic7XG4gIHRoaXMudiA9IHZhbHVlO1xuICB0aGlzLnRrID0gdG9rZW5zO1xufVxuXG4vKipcbiAqIEFic3RyYWN0IGNsYXNzIHVzZWQgZm9yIG1hbnVmYWN0dXJpbmcgdG9rZW5zIG9mIHRleHQgdG9rZW5zLiBUaGF0IGlzIHJhdGhlclxuICogdGhhbiB0aGUgdmFsdWUgZm9yIGEgdG9rZW4gYmVpbmcgYSBzbWFsbCBzdHJpbmcgb2YgdGV4dCwgaXQncyB2YWx1ZSBhbiBhcnJheVxuICogb2YgdGV4dCB0b2tlbnMuXG4gKlxuICogVXNlZCBmb3IgZ3JvdXBpbmcgdG9nZXRoZXIgVVJMcywgZW1haWxzLCBoYXNodGFncywgYW5kIG90aGVyIHBvdGVudGlhbFxuICogY3JlYXRpb25zLlxuICogQGNsYXNzIE11bHRpVG9rZW5cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB0XG4gKiBAcHJvcGVydHkge3N0cmluZ30gdlxuICogQHByb3BlcnR5IHtUb2tlbltdfSB0a1xuICogQGFic3RyYWN0XG4gKi9cbk11bHRpVG9rZW4ucHJvdG90eXBlID0ge1xuICBpc0xpbms6IGZhbHNlLFxuICAvKipcbiAgICogUmV0dXJuIHRoZSBzdHJpbmcgdGhpcyB0b2tlbiByZXByZXNlbnRzLlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy52O1xuICB9LFxuICAvKipcbiAgICogV2hhdCBzaG91bGQgdGhlIHZhbHVlIGZvciB0aGlzIHRva2VuIGJlIGluIHRoZSBgaHJlZmAgSFRNTCBhdHRyaWJ1dGU/XG4gICAqIFJldHVybnMgdGhlIGAudG9TdHJpbmdgIHZhbHVlIGJ5IGRlZmF1bHQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbc2NoZW1lXVxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICovXG4gIHRvSHJlZihzY2hlbWUpIHtcbiAgICByZXR1cm4gdGhpcy50b1N0cmluZygpO1xuICB9LFxuICAvKipcbiAgICogQHBhcmFtIHtPcHRpb25zfSBvcHRpb25zIEZvcm1hdHRpbmcgb3B0aW9uc1xuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgKi9cbiAgdG9Gb3JtYXR0ZWRTdHJpbmcob3B0aW9ucykge1xuICAgIGNvbnN0IHZhbCA9IHRoaXMudG9TdHJpbmcoKTtcbiAgICBjb25zdCB0cnVuY2F0ZSA9IG9wdGlvbnMuZ2V0KCd0cnVuY2F0ZScsIHZhbCwgdGhpcyk7XG4gICAgY29uc3QgZm9ybWF0dGVkID0gb3B0aW9ucy5nZXQoJ2Zvcm1hdCcsIHZhbCwgdGhpcyk7XG4gICAgcmV0dXJuIHRydW5jYXRlICYmIGZvcm1hdHRlZC5sZW5ndGggPiB0cnVuY2F0ZSA/IGZvcm1hdHRlZC5zdWJzdHJpbmcoMCwgdHJ1bmNhdGUpICsgJ1x1MjAyNicgOiBmb3JtYXR0ZWQ7XG4gIH0sXG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0ge09wdGlvbnN9IG9wdGlvbnNcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIHRvRm9ybWF0dGVkSHJlZihvcHRpb25zKSB7XG4gICAgcmV0dXJuIG9wdGlvbnMuZ2V0KCdmb3JtYXRIcmVmJywgdGhpcy50b0hyZWYob3B0aW9ucy5nZXQoJ2RlZmF1bHRQcm90b2NvbCcpKSwgdGhpcyk7XG4gIH0sXG4gIC8qKlxuICAgKiBUaGUgc3RhcnQgaW5kZXggb2YgdGhpcyB0b2tlbiBpbiB0aGUgb3JpZ2luYWwgaW5wdXQgc3RyaW5nXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBzdGFydEluZGV4KCkge1xuICAgIHJldHVybiB0aGlzLnRrWzBdLnM7XG4gIH0sXG4gIC8qKlxuICAgKiBUaGUgZW5kIGluZGV4IG9mIHRoaXMgdG9rZW4gaW4gdGhlIG9yaWdpbmFsIGlucHV0IHN0cmluZyAodXAgdG8gdGhpc1xuICAgKiBpbmRleCBidXQgbm90IGluY2x1ZGluZyBpdClcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIGVuZEluZGV4KCkge1xuICAgIHJldHVybiB0aGlzLnRrW3RoaXMudGsubGVuZ3RoIC0gMV0uZTtcbiAgfSxcbiAgLyoqXG4gIFx0UmV0dXJucyBhbiBvYmplY3QgIG9mIHJlbGV2YW50IHZhbHVlcyBmb3IgdGhpcyB0b2tlbiwgd2hpY2ggaW5jbHVkZXMga2V5c1xuICBcdCogdHlwZSAtIEtpbmQgb2YgdG9rZW4gKCd1cmwnLCAnZW1haWwnLCBldGMuKVxuICBcdCogdmFsdWUgLSBPcmlnaW5hbCB0ZXh0XG4gIFx0KiBocmVmIC0gVGhlIHZhbHVlIHRoYXQgc2hvdWxkIGJlIGFkZGVkIHRvIHRoZSBhbmNob3IgdGFnJ3MgaHJlZlxuICBcdFx0YXR0cmlidXRlXG4gIFx0XHRAbWV0aG9kIHRvT2JqZWN0XG4gIFx0QHBhcmFtIHtzdHJpbmd9IFtwcm90b2NvbF0gYCdodHRwJ2AgYnkgZGVmYXVsdFxuICAqL1xuICB0b09iamVjdChwcm90b2NvbCkge1xuICAgIGlmIChwcm90b2NvbCA9PT0gdm9pZCAwKSB7XG4gICAgICBwcm90b2NvbCA9IGRlZmF1bHRzLmRlZmF1bHRQcm90b2NvbDtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IHRoaXMudCxcbiAgICAgIHZhbHVlOiB0aGlzLnRvU3RyaW5nKCksXG4gICAgICBpc0xpbms6IHRoaXMuaXNMaW5rLFxuICAgICAgaHJlZjogdGhpcy50b0hyZWYocHJvdG9jb2wpLFxuICAgICAgc3RhcnQ6IHRoaXMuc3RhcnRJbmRleCgpLFxuICAgICAgZW5kOiB0aGlzLmVuZEluZGV4KClcbiAgICB9O1xuICB9LFxuICAvKipcbiAgICpcbiAgICogQHBhcmFtIHtPcHRpb25zfSBvcHRpb25zIEZvcm1hdHRpbmcgb3B0aW9uXG4gICAqL1xuICB0b0Zvcm1hdHRlZE9iamVjdChvcHRpb25zKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IHRoaXMudCxcbiAgICAgIHZhbHVlOiB0aGlzLnRvRm9ybWF0dGVkU3RyaW5nKG9wdGlvbnMpLFxuICAgICAgaXNMaW5rOiB0aGlzLmlzTGluayxcbiAgICAgIGhyZWY6IHRoaXMudG9Gb3JtYXR0ZWRIcmVmKG9wdGlvbnMpLFxuICAgICAgc3RhcnQ6IHRoaXMuc3RhcnRJbmRleCgpLFxuICAgICAgZW5kOiB0aGlzLmVuZEluZGV4KClcbiAgICB9O1xuICB9LFxuICAvKipcbiAgICogV2hldGhlciB0aGlzIHRva2VuIHNob3VsZCBiZSByZW5kZXJlZCBhcyBhIGxpbmsgYWNjb3JkaW5nIHRvIHRoZSBnaXZlbiBvcHRpb25zXG4gICAqIEBwYXJhbSB7T3B0aW9uc30gb3B0aW9uc1xuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIHZhbGlkYXRlKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gb3B0aW9ucy5nZXQoJ3ZhbGlkYXRlJywgdGhpcy50b1N0cmluZygpLCB0aGlzKTtcbiAgfSxcbiAgLyoqXG4gICAqIFJldHVybiBhbiBvYmplY3QgdGhhdCByZXByZXNlbnRzIGhvdyB0aGlzIGxpbmsgc2hvdWxkIGJlIHJlbmRlcmVkLlxuICAgKiBAcGFyYW0ge09wdGlvbnN9IG9wdGlvbnMgRm9ybWF0dGlubmcgb3B0aW9uc1xuICAgKi9cbiAgcmVuZGVyKG9wdGlvbnMpIHtcbiAgICBjb25zdCB0b2tlbiA9IHRoaXM7XG4gICAgY29uc3QgaHJlZiA9IHRoaXMudG9IcmVmKG9wdGlvbnMuZ2V0KCdkZWZhdWx0UHJvdG9jb2wnKSk7XG4gICAgY29uc3QgZm9ybWF0dGVkSHJlZiA9IG9wdGlvbnMuZ2V0KCdmb3JtYXRIcmVmJywgaHJlZiwgdGhpcyk7XG4gICAgY29uc3QgdGFnTmFtZSA9IG9wdGlvbnMuZ2V0KCd0YWdOYW1lJywgaHJlZiwgdG9rZW4pO1xuICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLnRvRm9ybWF0dGVkU3RyaW5nKG9wdGlvbnMpO1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSB7fTtcbiAgICBjb25zdCBjbGFzc05hbWUgPSBvcHRpb25zLmdldCgnY2xhc3NOYW1lJywgaHJlZiwgdG9rZW4pO1xuICAgIGNvbnN0IHRhcmdldCA9IG9wdGlvbnMuZ2V0KCd0YXJnZXQnLCBocmVmLCB0b2tlbik7XG4gICAgY29uc3QgcmVsID0gb3B0aW9ucy5nZXQoJ3JlbCcsIGhyZWYsIHRva2VuKTtcbiAgICBjb25zdCBhdHRycyA9IG9wdGlvbnMuZ2V0T2JqKCdhdHRyaWJ1dGVzJywgaHJlZiwgdG9rZW4pO1xuICAgIGNvbnN0IGV2ZW50TGlzdGVuZXJzID0gb3B0aW9ucy5nZXRPYmooJ2V2ZW50cycsIGhyZWYsIHRva2VuKTtcbiAgICBhdHRyaWJ1dGVzLmhyZWYgPSBmb3JtYXR0ZWRIcmVmO1xuICAgIGlmIChjbGFzc05hbWUpIHtcbiAgICAgIGF0dHJpYnV0ZXMuY2xhc3MgPSBjbGFzc05hbWU7XG4gICAgfVxuICAgIGlmICh0YXJnZXQpIHtcbiAgICAgIGF0dHJpYnV0ZXMudGFyZ2V0ID0gdGFyZ2V0O1xuICAgIH1cbiAgICBpZiAocmVsKSB7XG4gICAgICBhdHRyaWJ1dGVzLnJlbCA9IHJlbDtcbiAgICB9XG4gICAgaWYgKGF0dHJzKSB7XG4gICAgICBhc3NpZ24oYXR0cmlidXRlcywgYXR0cnMpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgdGFnTmFtZSxcbiAgICAgIGF0dHJpYnV0ZXMsXG4gICAgICBjb250ZW50LFxuICAgICAgZXZlbnRMaXN0ZW5lcnNcbiAgICB9O1xuICB9XG59O1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyB0b2tlbiB0aGF0IGNhbiBiZSBlbWl0dGVkIGJ5IHRoZSBwYXJzZXIgc3RhdGUgbWFjaGluZVxuICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgcmVhZGFibGUgdHlwZSBvZiB0aGUgdG9rZW5cbiAqIEBwYXJhbSB7b2JqZWN0fSBwcm9wcyBwcm9wZXJ0aWVzIHRvIGFzc2lnbiBvciBvdmVycmlkZSwgaW5jbHVkaW5nIGlzTGluayA9IHRydWUgb3IgZmFsc2VcbiAqIEByZXR1cm5zIHtuZXcgKHZhbHVlOiBzdHJpbmcsIHRva2VuczogVG9rZW5bXSkgPT4gTXVsdGlUb2tlbn0gbmV3IHRva2VuIGNsYXNzXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVRva2VuQ2xhc3ModHlwZSwgcHJvcHMpIHtcbiAgY2xhc3MgVG9rZW4gZXh0ZW5kcyBNdWx0aVRva2VuIHtcbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZSwgdG9rZW5zKSB7XG4gICAgICBzdXBlcih2YWx1ZSwgdG9rZW5zKTtcbiAgICAgIHRoaXMudCA9IHR5cGU7XG4gICAgfVxuICB9XG4gIGZvciAoY29uc3QgcCBpbiBwcm9wcykge1xuICAgIFRva2VuLnByb3RvdHlwZVtwXSA9IHByb3BzW3BdO1xuICB9XG4gIFRva2VuLnQgPSB0eXBlO1xuICByZXR1cm4gVG9rZW47XG59XG5cbi8qKlxuXHRSZXByZXNlbnRzIGEgbGlzdCBvZiB0b2tlbnMgbWFraW5nIHVwIGEgdmFsaWQgZW1haWwgYWRkcmVzc1xuKi9cbmNvbnN0IEVtYWlsID0gY3JlYXRlVG9rZW5DbGFzcygnZW1haWwnLCB7XG4gIGlzTGluazogdHJ1ZSxcbiAgdG9IcmVmKCkge1xuICAgIHJldHVybiAnbWFpbHRvOicgKyB0aGlzLnRvU3RyaW5nKCk7XG4gIH1cbn0pO1xuXG4vKipcblx0UmVwcmVzZW50cyBzb21lIHBsYWluIHRleHRcbiovXG5jb25zdCBUZXh0ID0gY3JlYXRlVG9rZW5DbGFzcygndGV4dCcpO1xuXG4vKipcblx0TXVsdGktbGluZWJyZWFrIHRva2VuIC0gcmVwcmVzZW50cyBhIGxpbmUgYnJlYWtcblx0QGNsYXNzIE5sXG4qL1xuY29uc3QgTmwgPSBjcmVhdGVUb2tlbkNsYXNzKCdubCcpO1xuXG4vKipcblx0UmVwcmVzZW50cyBhIGxpc3Qgb2YgdGV4dCB0b2tlbnMgbWFraW5nIHVwIGEgdmFsaWQgVVJMXG5cdEBjbGFzcyBVcmxcbiovXG5jb25zdCBVcmwgPSBjcmVhdGVUb2tlbkNsYXNzKCd1cmwnLCB7XG4gIGlzTGluazogdHJ1ZSxcbiAgLyoqXG4gIFx0TG93ZXJjYXNlcyByZWxldmFudCBwYXJ0cyBvZiB0aGUgZG9tYWluIGFuZCBhZGRzIHRoZSBwcm90b2NvbCBpZlxuICBcdHJlcXVpcmVkLiBOb3RlIHRoYXQgdGhpcyB3aWxsIG5vdCBlc2NhcGUgdW5zYWZlIEhUTUwgY2hhcmFjdGVycyBpbiB0aGVcbiAgXHRVUkwuXG4gIFx0XHRAcGFyYW0ge3N0cmluZ30gW3NjaGVtZV0gZGVmYXVsdCBzY2hlbWUgKGUuZy4sICdodHRwcycpXG4gIFx0QHJldHVybiB7c3RyaW5nfSB0aGUgZnVsbCBocmVmXG4gICovXG4gIHRvSHJlZihzY2hlbWUpIHtcbiAgICBpZiAoc2NoZW1lID09PSB2b2lkIDApIHtcbiAgICAgIHNjaGVtZSA9IGRlZmF1bHRzLmRlZmF1bHRQcm90b2NvbDtcbiAgICB9XG4gICAgLy8gQ2hlY2sgaWYgYWxyZWFkeSBoYXMgYSBwcmVmaXggc2NoZW1lXG4gICAgcmV0dXJuIHRoaXMuaGFzUHJvdG9jb2woKSA/IHRoaXMudiA6IGAke3NjaGVtZX06Ly8ke3RoaXMudn1gO1xuICB9LFxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciB0aGlzIFVSTCB0b2tlbiBoYXMgYSBwcm90b2NvbFxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaGFzUHJvdG9jb2woKSB7XG4gICAgY29uc3QgdG9rZW5zID0gdGhpcy50aztcbiAgICByZXR1cm4gdG9rZW5zLmxlbmd0aCA+PSAyICYmIHRva2Vuc1swXS50ICE9PSBMT0NBTEhPU1QgJiYgdG9rZW5zWzFdLnQgPT09IENPTE9OO1xuICB9XG59KTtcblxudmFyIG11bHRpID0gLyojX19QVVJFX18qL09iamVjdC5mcmVlemUoe1xuXHRfX3Byb3RvX186IG51bGwsXG5cdE11bHRpVG9rZW46IE11bHRpVG9rZW4sXG5cdEJhc2U6IE11bHRpVG9rZW4sXG5cdGNyZWF0ZVRva2VuQ2xhc3M6IGNyZWF0ZVRva2VuQ2xhc3MsXG5cdEVtYWlsOiBFbWFpbCxcblx0VGV4dDogVGV4dCxcblx0Tmw6IE5sLFxuXHRVcmw6IFVybFxufSk7XG5cbi8qKlxuXHROb3QgZXhhY3RseSBwYXJzZXIsIG1vcmUgbGlrZSB0aGUgc2Vjb25kLXN0YWdlIHNjYW5uZXIgKGFsdGhvdWdoIHdlIGNhblxuXHR0aGVvcmV0aWNhbGx5IGhvdHN3YXAgdGhlIGNvZGUgaGVyZSB3aXRoIGEgcmVhbCBwYXJzZXIgaW4gdGhlIGZ1dHVyZS4uLiBidXRcblx0Zm9yIGEgbGl0dGxlIFVSTC1maW5kaW5nIHV0aWxpdHkgYWJzdHJhY3Qgc3ludGF4IHRyZWVzIG1heSBiZSBhIGxpdHRsZVxuXHRvdmVya2lsbCkuXG5cblx0VVJMIGZvcm1hdDogaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9VUklfc2NoZW1lXG5cdEVtYWlsIGZvcm1hdDogaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9FbWFpbEFkZHJlc3MgKGxpbmtzIHRvIFJGQyBpblxuXHRyZWZlcmVuY2UpXG5cblx0QG1vZHVsZSBsaW5raWZ5XG5cdEBzdWJtb2R1bGUgcGFyc2VyXG5cdEBtYWluIHJ1blxuKi9cbmNvbnN0IG1ha2VTdGF0ZSA9IGFyZyA9PiBuZXcgU3RhdGUoYXJnKTtcblxuLyoqXG4gKiBHZW5lcmF0ZSB0aGUgcGFyc2VyIG11bHRpIHRva2VuLWJhc2VkIHN0YXRlIG1hY2hpbmVcbiAqIEBwYXJhbSB7eyBncm91cHM6IENvbGxlY3Rpb25zPHN0cmluZz4gfX0gdG9rZW5zXG4gKi9cbmZ1bmN0aW9uIGluaXQkMShfcmVmKSB7XG4gIGxldCB7XG4gICAgZ3JvdXBzXG4gIH0gPSBfcmVmO1xuICAvLyBUeXBlcyBvZiBjaGFyYWN0ZXJzIHRoZSBVUkwgY2FuIGRlZmluaXRlbHkgZW5kIGluXG4gIGNvbnN0IHFzQWNjZXB0aW5nID0gZ3JvdXBzLmRvbWFpbi5jb25jYXQoW0FNUEVSU0FORCwgQVNURVJJU0ssIEFULCBCQUNLU0xBU0gsIEJBQ0tUSUNLLCBDQVJFVCwgRE9MTEFSLCBFUVVBTFMsIEhZUEhFTiwgTlVNLCBQRVJDRU5ULCBQSVBFLCBQTFVTLCBQT1VORCwgU0xBU0gsIFNZTSwgVElMREUsIFVOREVSU0NPUkVdKTtcblxuICAvLyBUeXBlcyBvZiB0b2tlbnMgdGhhdCBjYW4gZm9sbG93IGEgVVJMIGFuZCBiZSBwYXJ0IG9mIHRoZSBxdWVyeSBzdHJpbmdcbiAgLy8gYnV0IGNhbm5vdCBiZSB0aGUgdmVyeSBsYXN0IGNoYXJhY3RlcnNcbiAgLy8gQ2hhcmFjdGVycyB0aGF0IGNhbm5vdCBhcHBlYXIgaW4gdGhlIFVSTCBhdCBhbGwgc2hvdWxkIGJlIGV4Y2x1ZGVkXG4gIGNvbnN0IHFzTm9uQWNjZXB0aW5nID0gW0FQT1NUUk9QSEUsIENMT1NFQU5HTEVCUkFDS0VULCBDTE9TRUJSQUNFLCBDTE9TRUJSQUNLRVQsIENMT1NFUEFSRU4sIENPTE9OLCBDT01NQSwgRE9ULCBFWENMQU1BVElPTiwgT1BFTkFOR0xFQlJBQ0tFVCwgT1BFTkJSQUNFLCBPUEVOQlJBQ0tFVCwgT1BFTlBBUkVOLCBRVUVSWSwgUVVPVEUsIFNFTUldO1xuXG4gIC8vIEZvciBhZGRyZXNzZXMgd2l0aG91dCB0aGUgbWFpbHRvIHByZWZpeFxuICAvLyBUb2tlbnMgYWxsb3dlZCBpbiB0aGUgbG9jYWxwYXJ0IG9mIHRoZSBlbWFpbFxuICBjb25zdCBsb2NhbHBhcnRBY2NlcHRpbmcgPSBbQU1QRVJTQU5ELCBBUE9TVFJPUEhFLCBBU1RFUklTSywgQkFDS1NMQVNILCBCQUNLVElDSywgQ0FSRVQsIENMT1NFQlJBQ0UsIERPTExBUiwgRVFVQUxTLCBIWVBIRU4sIE9QRU5CUkFDRSwgUEVSQ0VOVCwgUElQRSwgUExVUywgUE9VTkQsIFFVRVJZLCBTTEFTSCwgU1lNLCBUSUxERSwgVU5ERVJTQ09SRV07XG5cbiAgLy8gVGhlIHVuaXZlcnNhbCBzdGFydGluZyBzdGF0ZS5cbiAgLyoqXG4gICAqIEB0eXBlIFN0YXRlPFRva2VuPlxuICAgKi9cbiAgY29uc3QgU3RhcnQgPSBtYWtlU3RhdGUoKTtcbiAgY29uc3QgTG9jYWxwYXJ0ID0gdHQoU3RhcnQsIFRJTERFKTsgLy8gTG9jYWwgcGFydCBvZiB0aGUgZW1haWwgYWRkcmVzc1xuICB0YShMb2NhbHBhcnQsIGxvY2FscGFydEFjY2VwdGluZywgTG9jYWxwYXJ0KTtcbiAgdGEoTG9jYWxwYXJ0LCBncm91cHMuZG9tYWluLCBMb2NhbHBhcnQpO1xuICBjb25zdCBEb21haW4gPSBtYWtlU3RhdGUoKSxcbiAgICBTY2hlbWUgPSBtYWtlU3RhdGUoKSxcbiAgICBTbGFzaFNjaGVtZSA9IG1ha2VTdGF0ZSgpO1xuICB0YShTdGFydCwgZ3JvdXBzLmRvbWFpbiwgRG9tYWluKTsgLy8gcGFyc2VkIHN0cmluZyBlbmRzIHdpdGggYSBwb3RlbnRpYWwgZG9tYWluIG5hbWUgKEEpXG4gIHRhKFN0YXJ0LCBncm91cHMuc2NoZW1lLCBTY2hlbWUpOyAvLyBlLmcuLCAnbWFpbHRvJ1xuICB0YShTdGFydCwgZ3JvdXBzLnNsYXNoc2NoZW1lLCBTbGFzaFNjaGVtZSk7IC8vIGUuZy4sICdodHRwJ1xuXG4gIHRhKERvbWFpbiwgbG9jYWxwYXJ0QWNjZXB0aW5nLCBMb2NhbHBhcnQpO1xuICB0YShEb21haW4sIGdyb3Vwcy5kb21haW4sIERvbWFpbik7XG4gIGNvbnN0IExvY2FscGFydEF0ID0gdHQoRG9tYWluLCBBVCk7IC8vIExvY2FsIHBhcnQgb2YgdGhlIGVtYWlsIGFkZHJlc3MgcGx1cyBAXG5cbiAgdHQoTG9jYWxwYXJ0LCBBVCwgTG9jYWxwYXJ0QXQpOyAvLyBjbG9zZSB0byBhbiBlbWFpbCBhZGRyZXNzIG5vd1xuXG4gIC8vIExvY2FsIHBhcnQgb2YgYW4gZW1haWwgYWRkcmVzcyBjYW4gYmUgZS5nLiAnaHR0cCcgb3IgJ21haWx0bydcbiAgdHQoU2NoZW1lLCBBVCwgTG9jYWxwYXJ0QXQpO1xuICB0dChTbGFzaFNjaGVtZSwgQVQsIExvY2FscGFydEF0KTtcbiAgY29uc3QgTG9jYWxwYXJ0RG90ID0gdHQoTG9jYWxwYXJ0LCBET1QpOyAvLyBMb2NhbCBwYXJ0IG9mIHRoZSBlbWFpbCBhZGRyZXNzIHBsdXMgJy4nIChsb2NhbHBhcnQgY2Fubm90IGVuZCBpbiAuKVxuICB0YShMb2NhbHBhcnREb3QsIGxvY2FscGFydEFjY2VwdGluZywgTG9jYWxwYXJ0KTtcbiAgdGEoTG9jYWxwYXJ0RG90LCBncm91cHMuZG9tYWluLCBMb2NhbHBhcnQpO1xuICBjb25zdCBFbWFpbERvbWFpbiA9IG1ha2VTdGF0ZSgpO1xuICB0YShMb2NhbHBhcnRBdCwgZ3JvdXBzLmRvbWFpbiwgRW1haWxEb21haW4pOyAvLyBwYXJzZWQgc3RyaW5nIHN0YXJ0cyB3aXRoIGxvY2FsIGVtYWlsIGluZm8gKyBAIHdpdGggYSBwb3RlbnRpYWwgZG9tYWluIG5hbWVcbiAgdGEoRW1haWxEb21haW4sIGdyb3Vwcy5kb21haW4sIEVtYWlsRG9tYWluKTtcbiAgY29uc3QgRW1haWxEb21haW5Eb3QgPSB0dChFbWFpbERvbWFpbiwgRE9UKTsgLy8gZG9tYWluIGZvbGxvd2VkIGJ5IERPVFxuICB0YShFbWFpbERvbWFpbkRvdCwgZ3JvdXBzLmRvbWFpbiwgRW1haWxEb21haW4pO1xuICBjb25zdCBFbWFpbCQxID0gbWFrZVN0YXRlKEVtYWlsKTsgLy8gUG9zc2libGUgZW1haWwgYWRkcmVzcyAoY291bGQgaGF2ZSBtb3JlIHRsZHMpXG4gIHRhKEVtYWlsRG9tYWluRG90LCBncm91cHMudGxkLCBFbWFpbCQxKTtcbiAgdGEoRW1haWxEb21haW5Eb3QsIGdyb3Vwcy51dGxkLCBFbWFpbCQxKTtcbiAgdHQoTG9jYWxwYXJ0QXQsIExPQ0FMSE9TVCwgRW1haWwkMSk7XG5cbiAgLy8gSHlwaGVuIGNhbiBqdW1wIGJhY2sgdG8gYSBkb21haW4gbmFtZVxuICBjb25zdCBFbWFpbERvbWFpbkh5cGhlbiA9IHR0KEVtYWlsRG9tYWluLCBIWVBIRU4pOyAvLyBwYXJzZWQgc3RyaW5nIHN0YXJ0cyB3aXRoIGxvY2FsIGVtYWlsIGluZm8gKyBAIHdpdGggYSBwb3RlbnRpYWwgZG9tYWluIG5hbWVcbiAgdGEoRW1haWxEb21haW5IeXBoZW4sIGdyb3Vwcy5kb21haW4sIEVtYWlsRG9tYWluKTtcbiAgdGEoRW1haWwkMSwgZ3JvdXBzLmRvbWFpbiwgRW1haWxEb21haW4pO1xuICB0dChFbWFpbCQxLCBET1QsIEVtYWlsRG9tYWluRG90KTtcbiAgdHQoRW1haWwkMSwgSFlQSEVOLCBFbWFpbERvbWFpbkh5cGhlbik7XG5cbiAgLy8gRmluYWwgcG9zc2libGUgZW1haWwgc3RhdGVzXG4gIGNvbnN0IEVtYWlsQ29sb24gPSB0dChFbWFpbCQxLCBDT0xPTik7IC8vIFVSTCBmb2xsb3dlZCBieSBjb2xvbiAocG90ZW50aWFsIHBvcnQgbnVtYmVyIGhlcmUpXG4gIC8qY29uc3QgRW1haWxDb2xvblBvcnQgPSAqL1xuICB0YShFbWFpbENvbG9uLCBncm91cHMubnVtZXJpYywgRW1haWwpOyAvLyBVUkwgZm9sbG93ZWQgYnkgY29sb24gYW5kIHBvcnQgbnVtbmVyXG5cbiAgLy8gQWNjb3VudCBmb3IgZG90cyBhbmQgaHlwaGVucy4gSHlwaGVucyBhcmUgdXN1YWxseSBwYXJ0cyBvZiBkb21haW4gbmFtZXNcbiAgLy8gKGJ1dCBub3QgVExEcylcbiAgY29uc3QgRG9tYWluSHlwaGVuID0gdHQoRG9tYWluLCBIWVBIRU4pOyAvLyBkb21haW4gZm9sbG93ZWQgYnkgaHlwaGVuXG4gIGNvbnN0IERvbWFpbkRvdCA9IHR0KERvbWFpbiwgRE9UKTsgLy8gZG9tYWluIGZvbGxvd2VkIGJ5IERPVFxuICB0YShEb21haW5IeXBoZW4sIGdyb3Vwcy5kb21haW4sIERvbWFpbik7XG4gIHRhKERvbWFpbkRvdCwgbG9jYWxwYXJ0QWNjZXB0aW5nLCBMb2NhbHBhcnQpO1xuICB0YShEb21haW5Eb3QsIGdyb3Vwcy5kb21haW4sIERvbWFpbik7XG4gIGNvbnN0IERvbWFpbkRvdFRsZCA9IG1ha2VTdGF0ZShVcmwpOyAvLyBTaW1wbGVzdCBwb3NzaWJsZSBVUkwgd2l0aCBubyBxdWVyeSBzdHJpbmdcbiAgdGEoRG9tYWluRG90LCBncm91cHMudGxkLCBEb21haW5Eb3RUbGQpO1xuICB0YShEb21haW5Eb3QsIGdyb3Vwcy51dGxkLCBEb21haW5Eb3RUbGQpO1xuICB0YShEb21haW5Eb3RUbGQsIGdyb3Vwcy5kb21haW4sIERvbWFpbik7XG4gIHRhKERvbWFpbkRvdFRsZCwgbG9jYWxwYXJ0QWNjZXB0aW5nLCBMb2NhbHBhcnQpO1xuICB0dChEb21haW5Eb3RUbGQsIERPVCwgRG9tYWluRG90KTtcbiAgdHQoRG9tYWluRG90VGxkLCBIWVBIRU4sIERvbWFpbkh5cGhlbik7XG4gIHR0KERvbWFpbkRvdFRsZCwgQVQsIExvY2FscGFydEF0KTtcbiAgY29uc3QgRG9tYWluRG90VGxkQ29sb24gPSB0dChEb21haW5Eb3RUbGQsIENPTE9OKTsgLy8gVVJMIGZvbGxvd2VkIGJ5IGNvbG9uIChwb3RlbnRpYWwgcG9ydCBudW1iZXIgaGVyZSlcbiAgY29uc3QgRG9tYWluRG90VGxkQ29sb25Qb3J0ID0gbWFrZVN0YXRlKFVybCk7IC8vIFRMRCBmb2xsb3dlZCBieSBhIHBvcnQgbnVtYmVyXG4gIHRhKERvbWFpbkRvdFRsZENvbG9uLCBncm91cHMubnVtZXJpYywgRG9tYWluRG90VGxkQ29sb25Qb3J0KTtcblxuICAvLyBMb25nIFVSTCB3aXRoIG9wdGlvbmFsIHBvcnQgYW5kIG1heWJlIHF1ZXJ5IHN0cmluZ1xuICBjb25zdCBVcmwkMSA9IG1ha2VTdGF0ZShVcmwpO1xuXG4gIC8vIFVSTCB3aXRoIGV4dHJhIHN5bWJvbHMgYXQgdGhlIGVuZCwgZm9sbG93ZWQgYnkgYW4gb3BlbmluZyBicmFja2V0XG4gIGNvbnN0IFVybE5vbmFjY2VwdCA9IG1ha2VTdGF0ZSgpOyAvLyBVUkwgZm9sbG93ZWQgYnkgc29tZSBzeW1ib2xzICh3aWxsIG5vdCBiZSBwYXJ0IG9mIHRoZSBmaW5hbCBVUkwpXG5cbiAgLy8gUXVlcnkgc3RyaW5nc1xuICB0YShVcmwkMSwgcXNBY2NlcHRpbmcsIFVybCQxKTtcbiAgdGEoVXJsJDEsIHFzTm9uQWNjZXB0aW5nLCBVcmxOb25hY2NlcHQpO1xuICB0YShVcmxOb25hY2NlcHQsIHFzQWNjZXB0aW5nLCBVcmwkMSk7XG4gIHRhKFVybE5vbmFjY2VwdCwgcXNOb25BY2NlcHRpbmcsIFVybE5vbmFjY2VwdCk7XG5cbiAgLy8gQmVjb21lIHJlYWwgVVJMcyBhZnRlciBgU0xBU0hgIG9yIGBDT0xPTiBOVU0gU0xBU0hgXG4gIC8vIEhlcmUgd29ya3Mgd2l0aCBvciB3aXRob3V0IHNjaGVtZTovLyBwcmVmaXhcbiAgdHQoRG9tYWluRG90VGxkLCBTTEFTSCwgVXJsJDEpO1xuICB0dChEb21haW5Eb3RUbGRDb2xvblBvcnQsIFNMQVNILCBVcmwkMSk7XG5cbiAgLy8gTm90ZSB0aGF0IGRvbWFpbnMgdGhhdCBiZWdpbiB3aXRoIHNjaGVtZXMgYXJlIHRyZWF0ZWQgc2xpZ2hseSBkaWZmZXJlbnRseVxuICBjb25zdCBTY2hlbWVDb2xvbiA9IHR0KFNjaGVtZSwgQ09MT04pOyAvLyBlLmcuLCAnbWFpbHRvOidcbiAgY29uc3QgU2xhc2hTY2hlbWVDb2xvbiA9IHR0KFNsYXNoU2NoZW1lLCBDT0xPTik7IC8vIGUuZy4sICdodHRwOidcbiAgY29uc3QgU2xhc2hTY2hlbWVDb2xvblNsYXNoID0gdHQoU2xhc2hTY2hlbWVDb2xvbiwgU0xBU0gpOyAvLyBlLmcuLCAnaHR0cDovJ1xuXG4gIGNvbnN0IFVyaVByZWZpeCA9IHR0KFNsYXNoU2NoZW1lQ29sb25TbGFzaCwgU0xBU0gpOyAvLyBlLmcuLCAnaHR0cDovLydcblxuICAvLyBTY2hlbWUgc3RhdGVzIGNhbiB0cmFuc2l0aW9uIHRvIGRvbWFpbiBzdGF0ZXNcbiAgdGEoU2NoZW1lLCBncm91cHMuZG9tYWluLCBEb21haW4pO1xuICB0dChTY2hlbWUsIERPVCwgRG9tYWluRG90KTtcbiAgdHQoU2NoZW1lLCBIWVBIRU4sIERvbWFpbkh5cGhlbik7XG4gIHRhKFNsYXNoU2NoZW1lLCBncm91cHMuZG9tYWluLCBEb21haW4pO1xuICB0dChTbGFzaFNjaGVtZSwgRE9ULCBEb21haW5Eb3QpO1xuICB0dChTbGFzaFNjaGVtZSwgSFlQSEVOLCBEb21haW5IeXBoZW4pO1xuXG4gIC8vIEZvcmNlIFVSTCB3aXRoIHNjaGVtZSBwcmVmaXggZm9sbG93ZWQgYnkgYW55dGhpbmcgc2FuZVxuICB0YShTY2hlbWVDb2xvbiwgZ3JvdXBzLmRvbWFpbiwgVXJsJDEpO1xuICB0dChTY2hlbWVDb2xvbiwgU0xBU0gsIFVybCQxKTtcbiAgdGEoVXJpUHJlZml4LCBncm91cHMuZG9tYWluLCBVcmwkMSk7XG4gIHRhKFVyaVByZWZpeCwgcXNBY2NlcHRpbmcsIFVybCQxKTtcbiAgdHQoVXJpUHJlZml4LCBTTEFTSCwgVXJsJDEpO1xuXG4gIC8vIFVSTCwgZm9sbG93ZWQgYnkgYW4gb3BlbmluZyBicmFja2V0XG4gIGNvbnN0IFVybE9wZW5icmFjZSA9IHR0KFVybCQxLCBPUEVOQlJBQ0UpOyAvLyBVUkwgZm9sbG93ZWQgYnkge1xuICBjb25zdCBVcmxPcGVuYnJhY2tldCA9IHR0KFVybCQxLCBPUEVOQlJBQ0tFVCk7IC8vIFVSTCBmb2xsb3dlZCBieSBbXG4gIGNvbnN0IFVybE9wZW5hbmdsZWJyYWNrZXQgPSB0dChVcmwkMSwgT1BFTkFOR0xFQlJBQ0tFVCk7IC8vIFVSTCBmb2xsb3dlZCBieSA8XG4gIGNvbnN0IFVybE9wZW5wYXJlbiA9IHR0KFVybCQxLCBPUEVOUEFSRU4pOyAvLyBVUkwgZm9sbG93ZWQgYnkgKFxuXG4gIHR0KFVybE5vbmFjY2VwdCwgT1BFTkJSQUNFLCBVcmxPcGVuYnJhY2UpO1xuICB0dChVcmxOb25hY2NlcHQsIE9QRU5CUkFDS0VULCBVcmxPcGVuYnJhY2tldCk7XG4gIHR0KFVybE5vbmFjY2VwdCwgT1BFTkFOR0xFQlJBQ0tFVCwgVXJsT3BlbmFuZ2xlYnJhY2tldCk7XG4gIHR0KFVybE5vbmFjY2VwdCwgT1BFTlBBUkVOLCBVcmxPcGVucGFyZW4pO1xuXG4gIC8vIENsb3NpbmcgYnJhY2tldCBjb21wb25lbnQuIFRoaXMgY2hhcmFjdGVyIFdJTEwgYmUgaW5jbHVkZWQgaW4gdGhlIFVSTFxuICB0dChVcmxPcGVuYnJhY2UsIENMT1NFQlJBQ0UsIFVybCQxKTtcbiAgdHQoVXJsT3BlbmJyYWNrZXQsIENMT1NFQlJBQ0tFVCwgVXJsJDEpO1xuICB0dChVcmxPcGVuYW5nbGVicmFja2V0LCBDTE9TRUFOR0xFQlJBQ0tFVCwgVXJsJDEpO1xuICB0dChVcmxPcGVucGFyZW4sIENMT1NFUEFSRU4sIFVybCQxKTtcbiAgdHQoVXJsT3BlbmJyYWNlLCBDTE9TRUJSQUNFLCBVcmwkMSk7XG5cbiAgLy8gVVJMIHRoYXQgYmVpbmdzIHdpdGggYW4gb3BlbmluZyBicmFja2V0LCBmb2xsb3dlZCBieSBhIHN5bWJvbHMuXG4gIC8vIE5vdGUgdGhhdCB0aGUgZmluYWwgc3RhdGUgY2FuIHN0aWxsIGJlIGBVcmxPcGVuYnJhY2VgIChpZiB0aGUgVVJMIG9ubHlcbiAgLy8gaGFzIGEgc2luZ2xlIG9wZW5pbmcgYnJhY2tldCBmb3Igc29tZSByZWFzb24pLlxuICBjb25zdCBVcmxPcGVuYnJhY2VRID0gbWFrZVN0YXRlKFVybCk7IC8vIFVSTCBmb2xsb3dlZCBieSB7IGFuZCBzb21lIHN5bWJvbHMgdGhhdCB0aGUgVVJMIGNhbiBlbmQgaXRcbiAgY29uc3QgVXJsT3BlbmJyYWNrZXRRID0gbWFrZVN0YXRlKFVybCk7IC8vIFVSTCBmb2xsb3dlZCBieSBbIGFuZCBzb21lIHN5bWJvbHMgdGhhdCB0aGUgVVJMIGNhbiBlbmQgaXRcbiAgY29uc3QgVXJsT3BlbmFuZ2xlYnJhY2tldFEgPSBtYWtlU3RhdGUoVXJsKTsgLy8gVVJMIGZvbGxvd2VkIGJ5IDwgYW5kIHNvbWUgc3ltYm9scyB0aGF0IHRoZSBVUkwgY2FuIGVuZCBpdFxuICBjb25zdCBVcmxPcGVucGFyZW5RID0gbWFrZVN0YXRlKFVybCk7IC8vIFVSTCBmb2xsb3dlZCBieSAoIGFuZCBzb21lIHN5bWJvbHMgdGhhdCB0aGUgVVJMIGNhbiBlbmQgaXRcbiAgdGEoVXJsT3BlbmJyYWNlLCBxc0FjY2VwdGluZywgVXJsT3BlbmJyYWNlUSk7XG4gIHRhKFVybE9wZW5icmFja2V0LCBxc0FjY2VwdGluZywgVXJsT3BlbmJyYWNrZXRRKTtcbiAgdGEoVXJsT3BlbmFuZ2xlYnJhY2tldCwgcXNBY2NlcHRpbmcsIFVybE9wZW5hbmdsZWJyYWNrZXRRKTtcbiAgdGEoVXJsT3BlbnBhcmVuLCBxc0FjY2VwdGluZywgVXJsT3BlbnBhcmVuUSk7XG4gIGNvbnN0IFVybE9wZW5icmFjZVN5bXMgPSBtYWtlU3RhdGUoKTsgLy8gVXJsT3BlbmJyYWNlIGZvbGxvd2VkIGJ5IHNvbWUgc3ltYm9scyBpdCBjYW5ub3QgZW5kIGl0XG4gIGNvbnN0IFVybE9wZW5icmFja2V0U3ltcyA9IG1ha2VTdGF0ZSgpOyAvLyBVcmxPcGVuYnJhY2tldFEgZm9sbG93ZWQgYnkgc29tZSBzeW1ib2xzIGl0IGNhbm5vdCBlbmQgaXRcbiAgY29uc3QgVXJsT3BlbmFuZ2xlYnJhY2tldFN5bXMgPSBtYWtlU3RhdGUoKTsgLy8gVXJsT3BlbmFuZ2xlYnJhY2tldFEgZm9sbG93ZWQgYnkgc29tZSBzeW1ib2xzIGl0IGNhbm5vdCBlbmQgaXRcbiAgY29uc3QgVXJsT3BlbnBhcmVuU3ltcyA9IG1ha2VTdGF0ZSgpOyAvLyBVcmxPcGVucGFyZW5RIGZvbGxvd2VkIGJ5IHNvbWUgc3ltYm9scyBpdCBjYW5ub3QgZW5kIGl0XG4gIHRhKFVybE9wZW5icmFjZSwgcXNOb25BY2NlcHRpbmcpO1xuICB0YShVcmxPcGVuYnJhY2tldCwgcXNOb25BY2NlcHRpbmcpO1xuICB0YShVcmxPcGVuYW5nbGVicmFja2V0LCBxc05vbkFjY2VwdGluZyk7XG4gIHRhKFVybE9wZW5wYXJlbiwgcXNOb25BY2NlcHRpbmcpO1xuXG4gIC8vIFVSTCB0aGF0IGJlZ2lucyB3aXRoIGFuIG9wZW5pbmcgYnJhY2tldCwgZm9sbG93ZWQgYnkgc29tZSBzeW1ib2xzXG4gIHRhKFVybE9wZW5icmFjZVEsIHFzQWNjZXB0aW5nLCBVcmxPcGVuYnJhY2VRKTtcbiAgdGEoVXJsT3BlbmJyYWNrZXRRLCBxc0FjY2VwdGluZywgVXJsT3BlbmJyYWNrZXRRKTtcbiAgdGEoVXJsT3BlbmFuZ2xlYnJhY2tldFEsIHFzQWNjZXB0aW5nLCBVcmxPcGVuYW5nbGVicmFja2V0USk7XG4gIHRhKFVybE9wZW5wYXJlblEsIHFzQWNjZXB0aW5nLCBVcmxPcGVucGFyZW5RKTtcbiAgdGEoVXJsT3BlbmJyYWNlUSwgcXNOb25BY2NlcHRpbmcsIFVybE9wZW5icmFjZVEpO1xuICB0YShVcmxPcGVuYnJhY2tldFEsIHFzTm9uQWNjZXB0aW5nLCBVcmxPcGVuYnJhY2tldFEpO1xuICB0YShVcmxPcGVuYW5nbGVicmFja2V0USwgcXNOb25BY2NlcHRpbmcsIFVybE9wZW5hbmdsZWJyYWNrZXRRKTtcbiAgdGEoVXJsT3BlbnBhcmVuUSwgcXNOb25BY2NlcHRpbmcsIFVybE9wZW5wYXJlblEpO1xuICB0YShVcmxPcGVuYnJhY2VTeW1zLCBxc0FjY2VwdGluZywgVXJsT3BlbmJyYWNlU3ltcyk7XG4gIHRhKFVybE9wZW5icmFja2V0U3ltcywgcXNBY2NlcHRpbmcsIFVybE9wZW5icmFja2V0USk7XG4gIHRhKFVybE9wZW5hbmdsZWJyYWNrZXRTeW1zLCBxc0FjY2VwdGluZywgVXJsT3BlbmFuZ2xlYnJhY2tldFEpO1xuICB0YShVcmxPcGVucGFyZW5TeW1zLCBxc0FjY2VwdGluZywgVXJsT3BlbnBhcmVuUSk7XG4gIHRhKFVybE9wZW5icmFjZVN5bXMsIHFzTm9uQWNjZXB0aW5nLCBVcmxPcGVuYnJhY2VTeW1zKTtcbiAgdGEoVXJsT3BlbmJyYWNrZXRTeW1zLCBxc05vbkFjY2VwdGluZywgVXJsT3BlbmJyYWNrZXRTeW1zKTtcbiAgdGEoVXJsT3BlbmFuZ2xlYnJhY2tldFN5bXMsIHFzTm9uQWNjZXB0aW5nLCBVcmxPcGVuYW5nbGVicmFja2V0U3ltcyk7XG4gIHRhKFVybE9wZW5wYXJlblN5bXMsIHFzTm9uQWNjZXB0aW5nLCBVcmxPcGVucGFyZW5TeW1zKTtcblxuICAvLyBDbG9zZSBicmFjZS9icmFja2V0IHRvIGJlY29tZSByZWd1bGFyIFVSTFxuICB0dChVcmxPcGVuYnJhY2tldFEsIENMT1NFQlJBQ0tFVCwgVXJsJDEpO1xuICB0dChVcmxPcGVuYW5nbGVicmFja2V0USwgQ0xPU0VBTkdMRUJSQUNLRVQsIFVybCQxKTtcbiAgdHQoVXJsT3BlbnBhcmVuUSwgQ0xPU0VQQVJFTiwgVXJsJDEpO1xuICB0dChVcmxPcGVuYnJhY2VRLCBDTE9TRUJSQUNFLCBVcmwkMSk7XG4gIHR0KFVybE9wZW5icmFja2V0U3ltcywgQ0xPU0VCUkFDS0VULCBVcmwkMSk7XG4gIHR0KFVybE9wZW5hbmdsZWJyYWNrZXRTeW1zLCBDTE9TRUFOR0xFQlJBQ0tFVCwgVXJsJDEpO1xuICB0dChVcmxPcGVucGFyZW5TeW1zLCBDTE9TRVBBUkVOLCBVcmwkMSk7XG4gIHR0KFVybE9wZW5icmFjZVN5bXMsIENMT1NFUEFSRU4sIFVybCQxKTtcbiAgdHQoU3RhcnQsIExPQ0FMSE9TVCwgRG9tYWluRG90VGxkKTsgLy8gbG9jYWxob3N0IGlzIGEgdmFsaWQgVVJMIHN0YXRlXG4gIHR0KFN0YXJ0LCBOTCQxLCBObCk7IC8vIHNpbmdsZSBuZXcgbGluZVxuXG4gIHJldHVybiB7XG4gICAgc3RhcnQ6IFN0YXJ0LFxuICAgIHRva2VuczogdGtcbiAgfTtcbn1cblxuLyoqXG4gKiBSdW4gdGhlIHBhcnNlciBzdGF0ZSBtYWNoaW5lIG9uIGEgbGlzdCBvZiBzY2FubmVkIHN0cmluZy1iYXNlZCB0b2tlbnMgdG9cbiAqIGNyZWF0ZSBhIGxpc3Qgb2YgbXVsdGkgdG9rZW5zLCBlYWNoIG9mIHdoaWNoIHJlcHJlc2VudHMgYSBVUkwsIGVtYWlsIGFkZHJlc3MsXG4gKiBwbGFpbiB0ZXh0LCBldGMuXG4gKlxuICogQHBhcmFtIHtTdGF0ZTxNdWx0aVRva2VuPn0gc3RhcnQgcGFyc2VyIHN0YXJ0IHN0YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5wdXQgdGhlIG9yaWdpbmFsIGlucHV0IHVzZWQgdG8gZ2VuZXJhdGUgdGhlIGdpdmVuIHRva2Vuc1xuICogQHBhcmFtIHtUb2tlbltdfSB0b2tlbnMgbGlzdCBvZiBzY2FubmVkIHRva2Vuc1xuICogQHJldHVybnMge011bHRpVG9rZW5bXX1cbiAqL1xuZnVuY3Rpb24gcnVuKHN0YXJ0LCBpbnB1dCwgdG9rZW5zKSB7XG4gIGxldCBsZW4gPSB0b2tlbnMubGVuZ3RoO1xuICBsZXQgY3Vyc29yID0gMDtcbiAgbGV0IG11bHRpcyA9IFtdO1xuICBsZXQgdGV4dFRva2VucyA9IFtdO1xuICB3aGlsZSAoY3Vyc29yIDwgbGVuKSB7XG4gICAgbGV0IHN0YXRlID0gc3RhcnQ7XG4gICAgbGV0IHNlY29uZFN0YXRlID0gbnVsbDtcbiAgICBsZXQgbmV4dFN0YXRlID0gbnVsbDtcbiAgICBsZXQgbXVsdGlMZW5ndGggPSAwO1xuICAgIGxldCBsYXRlc3RBY2NlcHRpbmcgPSBudWxsO1xuICAgIGxldCBzaW5jZUFjY2VwdHMgPSAtMTtcbiAgICB3aGlsZSAoY3Vyc29yIDwgbGVuICYmICEoc2Vjb25kU3RhdGUgPSBzdGF0ZS5nbyh0b2tlbnNbY3Vyc29yXS50KSkpIHtcbiAgICAgIC8vIFN0YXJ0aW5nIHRva2VucyB3aXRoIG5vd2hlcmUgdG8ganVtcCB0by5cbiAgICAgIC8vIENvbnNpZGVyIHRoZXNlIHRvIGJlIGp1c3QgcGxhaW4gdGV4dFxuICAgICAgdGV4dFRva2Vucy5wdXNoKHRva2Vuc1tjdXJzb3IrK10pO1xuICAgIH1cbiAgICB3aGlsZSAoY3Vyc29yIDwgbGVuICYmIChuZXh0U3RhdGUgPSBzZWNvbmRTdGF0ZSB8fCBzdGF0ZS5nbyh0b2tlbnNbY3Vyc29yXS50KSkpIHtcbiAgICAgIC8vIEdldCB0aGUgbmV4dCBzdGF0ZVxuICAgICAgc2Vjb25kU3RhdGUgPSBudWxsO1xuICAgICAgc3RhdGUgPSBuZXh0U3RhdGU7XG5cbiAgICAgIC8vIEtlZXAgdHJhY2sgb2YgdGhlIGxhdGVzdCBhY2NlcHRpbmcgc3RhdGVcbiAgICAgIGlmIChzdGF0ZS5hY2NlcHRzKCkpIHtcbiAgICAgICAgc2luY2VBY2NlcHRzID0gMDtcbiAgICAgICAgbGF0ZXN0QWNjZXB0aW5nID0gc3RhdGU7XG4gICAgICB9IGVsc2UgaWYgKHNpbmNlQWNjZXB0cyA+PSAwKSB7XG4gICAgICAgIHNpbmNlQWNjZXB0cysrO1xuICAgICAgfVxuICAgICAgY3Vyc29yKys7XG4gICAgICBtdWx0aUxlbmd0aCsrO1xuICAgIH1cbiAgICBpZiAoc2luY2VBY2NlcHRzIDwgMCkge1xuICAgICAgLy8gTm8gYWNjZXB0aW5nIHN0YXRlIHdhcyBmb3VuZCwgcGFydCBvZiBhIHJlZ3VsYXIgdGV4dCB0b2tlbiBhZGRcbiAgICAgIC8vIHRoZSBmaXJzdCB0ZXh0IHRva2VuIHRvIHRoZSB0ZXh0IHRva2VucyBhcnJheSBhbmQgdHJ5IGFnYWluIGZyb21cbiAgICAgIC8vIHRoZSBuZXh0XG4gICAgICBjdXJzb3IgLT0gbXVsdGlMZW5ndGg7XG4gICAgICBpZiAoY3Vyc29yIDwgbGVuKSB7XG4gICAgICAgIHRleHRUb2tlbnMucHVzaCh0b2tlbnNbY3Vyc29yXSk7XG4gICAgICAgIGN1cnNvcisrO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBBY2NlcHRpbmcgc3RhdGUhXG4gICAgICAvLyBGaXJzdCBjbG9zZSBvZmYgdGhlIHRleHRUb2tlbnMgKGlmIGF2YWlsYWJsZSlcbiAgICAgIGlmICh0ZXh0VG9rZW5zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgbXVsdGlzLnB1c2goaW5pdE11bHRpVG9rZW4oVGV4dCwgaW5wdXQsIHRleHRUb2tlbnMpKTtcbiAgICAgICAgdGV4dFRva2VucyA9IFtdO1xuICAgICAgfVxuXG4gICAgICAvLyBSb2xsIGJhY2sgdG8gdGhlIGxhdGVzdCBhY2NlcHRpbmcgc3RhdGVcbiAgICAgIGN1cnNvciAtPSBzaW5jZUFjY2VwdHM7XG4gICAgICBtdWx0aUxlbmd0aCAtPSBzaW5jZUFjY2VwdHM7XG5cbiAgICAgIC8vIENyZWF0ZSBhIG5ldyBtdWx0aXRva2VuXG4gICAgICBjb25zdCBNdWx0aSA9IGxhdGVzdEFjY2VwdGluZy50O1xuICAgICAgY29uc3Qgc3VidG9rZW5zID0gdG9rZW5zLnNsaWNlKGN1cnNvciAtIG11bHRpTGVuZ3RoLCBjdXJzb3IpO1xuICAgICAgbXVsdGlzLnB1c2goaW5pdE11bHRpVG9rZW4oTXVsdGksIGlucHV0LCBzdWJ0b2tlbnMpKTtcbiAgICB9XG4gIH1cblxuICAvLyBGaW5hbGx5IGNsb3NlIG9mZiB0aGUgdGV4dFRva2VucyAoaWYgYXZhaWxhYmxlKVxuICBpZiAodGV4dFRva2Vucy5sZW5ndGggPiAwKSB7XG4gICAgbXVsdGlzLnB1c2goaW5pdE11bHRpVG9rZW4oVGV4dCwgaW5wdXQsIHRleHRUb2tlbnMpKTtcbiAgfVxuICByZXR1cm4gbXVsdGlzO1xufVxuXG4vKipcbiAqIFV0aWxpdHkgZnVuY3Rpb24gZm9yIGluc3RhbnRpYXRpbmcgYSBuZXcgbXVsdGl0b2tlbiB3aXRoIGFsbCB0aGUgcmVsZXZhbnRcbiAqIGZpZWxkcyBkdXJpbmcgcGFyc2luZy5cbiAqIEBwYXJhbSB7bmV3ICh2YWx1ZTogc3RyaW5nLCB0b2tlbnM6IFRva2VuW10pID0+IE11bHRpVG9rZW59IE11bHRpIGNsYXNzIHRvIGluc3RhbnRpYXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5wdXQgb3JpZ2luYWwgaW5wdXQgc3RyaW5nXG4gKiBAcGFyYW0ge1Rva2VuW119IHRva2VucyBjb25zZWN1dGl2ZSB0b2tlbnMgc2Nhbm5lZCBmcm9tIGlucHV0IHN0cmluZ1xuICogQHJldHVybnMge011bHRpVG9rZW59XG4gKi9cbmZ1bmN0aW9uIGluaXRNdWx0aVRva2VuKE11bHRpLCBpbnB1dCwgdG9rZW5zKSB7XG4gIGNvbnN0IHN0YXJ0SWR4ID0gdG9rZW5zWzBdLnM7XG4gIGNvbnN0IGVuZElkeCA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV0uZTtcbiAgY29uc3QgdmFsdWUgPSBpbnB1dC5zbGljZShzdGFydElkeCwgZW5kSWR4KTtcbiAgcmV0dXJuIG5ldyBNdWx0aSh2YWx1ZSwgdG9rZW5zKTtcbn1cblxuY29uc3Qgd2FybiA9IHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiBjb25zb2xlICYmIGNvbnNvbGUud2FybiB8fCAoKCkgPT4ge30pO1xuY29uc3Qgd2FybkFkdmljZSA9ICd1bnRpbCBtYW51YWwgY2FsbCBvZiBsaW5raWZ5LmluaXQoKS4gUmVnaXN0ZXIgYWxsIHNjaGVtZXMgYW5kIHBsdWdpbnMgYmVmb3JlIGludm9raW5nIGxpbmtpZnkgdGhlIGZpcnN0IHRpbWUuJztcblxuLy8gU2lkZS1lZmZlY3QgaW5pdGlhbGl6YXRpb24gc3RhdGVcbmNvbnN0IElOSVQgPSB7XG4gIHNjYW5uZXI6IG51bGwsXG4gIHBhcnNlcjogbnVsbCxcbiAgdG9rZW5RdWV1ZTogW10sXG4gIHBsdWdpblF1ZXVlOiBbXSxcbiAgY3VzdG9tU2NoZW1lczogW10sXG4gIGluaXRpYWxpemVkOiBmYWxzZVxufTtcblxuLyoqXG4gKiBAdHlwZWRlZiB7e1xuICogXHRzdGFydDogU3RhdGU8c3RyaW5nPixcbiAqIFx0dG9rZW5zOiB7IGdyb3VwczogQ29sbGVjdGlvbnM8c3RyaW5nPiB9ICYgdHlwZW9mIHRrXG4gKiB9fSBTY2FubmVySW5pdFxuICovXG5cbi8qKlxuICogQHR5cGVkZWYge3tcbiAqIFx0c3RhcnQ6IFN0YXRlPE11bHRpVG9rZW4+LFxuICogXHR0b2tlbnM6IHR5cGVvZiBtdWx0aVxuICogfX0gUGFyc2VySW5pdFxuICovXG5cbi8qKlxuICogQHR5cGVkZWYgeyhhcmc6IHsgc2Nhbm5lcjogU2Nhbm5lckluaXQgfSkgPT4gdm9pZH0gVG9rZW5QbHVnaW5cbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHsoYXJnOiB7IHNjYW5uZXI6IFNjYW5uZXJJbml0LCBwYXJzZXI6IFBhcnNlckluaXQgfSkgPT4gdm9pZH0gUGx1Z2luXG4gKi9cblxuLyoqXG4gKiBEZS1yZWdpc3RlciBhbGwgcGx1Z2lucyBhbmQgcmVzZXQgdGhlIGludGVybmFsIHN0YXRlLW1hY2hpbmUuIFVzZWQgZm9yXG4gKiB0ZXN0aW5nOyBub3QgcmVxdWlyZWQgaW4gcHJhY3RpY2UuXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiByZXNldCgpIHtcbiAgU3RhdGUuZ3JvdXBzID0ge307XG4gIElOSVQuc2Nhbm5lciA9IG51bGw7XG4gIElOSVQucGFyc2VyID0gbnVsbDtcbiAgSU5JVC50b2tlblF1ZXVlID0gW107XG4gIElOSVQucGx1Z2luUXVldWUgPSBbXTtcbiAgSU5JVC5jdXN0b21TY2hlbWVzID0gW107XG4gIElOSVQuaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbn1cblxuLyoqXG4gKiBSZWdpc3RlciBhIHRva2VuIHBsdWdpbiB0byBhbGxvdyB0aGUgc2Nhbm5lciB0byByZWNvZ25pemUgYWRkaXRpb25hbCB0b2tlblxuICogdHlwZXMgYmVmb3JlIHRoZSBwYXJzZXIgc3RhdGUgbWFjaGluZSBpcyBjb25zdHJ1Y3RlZCBmcm9tIHRoZSByZXN1bHRzLlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgb2YgcGx1Z2luIHRvIHJlZ2lzdGVyXG4gKiBAcGFyYW0ge1Rva2VuUGx1Z2lufSBwbHVnaW4gZnVuY3Rpb24gdGhhdCBhY2NlcHRzIHRoZSBzY2FubmVyIHN0YXRlIG1hY2hpbmVcbiAqIGFuZCBhdmFpbGFibGUgc2Nhbm5lciB0b2tlbnMgYW5kIGNvbGxlY3Rpb25zIGFuZCBleHRlbmRzIHRoZSBzdGF0ZSBtYWNoaW5lIHRvXG4gKiByZWNvZ25pemUgYWRkaXRpb25hbCB0b2tlbnMgb3IgZ3JvdXBzLlxuICovXG5mdW5jdGlvbiByZWdpc3RlclRva2VuUGx1Z2luKG5hbWUsIHBsdWdpbikge1xuICBpZiAodHlwZW9mIHBsdWdpbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBFcnJvcihgbGlua2lmeWpzOiBJbnZhbGlkIHRva2VuIHBsdWdpbiAke3BsdWdpbn0gKGV4cGVjdHMgZnVuY3Rpb24pYCk7XG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBJTklULnRva2VuUXVldWUubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAobmFtZSA9PT0gSU5JVC50b2tlblF1ZXVlW2ldWzBdKSB7XG4gICAgICB3YXJuKGBsaW5raWZ5anM6IHRva2VuIHBsdWdpbiBcIiR7bmFtZX1cIiBhbHJlYWR5IHJlZ2lzdGVyZWQgLSB3aWxsIGJlIG92ZXJ3cml0dGVuYCk7XG4gICAgICBJTklULnRva2VuUXVldWVbaV0gPSBbbmFtZSwgcGx1Z2luXTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cbiAgSU5JVC50b2tlblF1ZXVlLnB1c2goW25hbWUsIHBsdWdpbl0pO1xuICBpZiAoSU5JVC5pbml0aWFsaXplZCkge1xuICAgIHdhcm4oYGxpbmtpZnlqczogYWxyZWFkeSBpbml0aWFsaXplZCAtIHdpbGwgbm90IHJlZ2lzdGVyIHRva2VuIHBsdWdpbiBcIiR7bmFtZX1cIiAke3dhcm5BZHZpY2V9YCk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZWdpc3RlciBhIGxpbmtpZnkgcGx1Z2luXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBvZiBwbHVnaW4gdG8gcmVnaXN0ZXJcbiAqIEBwYXJhbSB7UGx1Z2lufSBwbHVnaW4gZnVuY3Rpb24gdGhhdCBhY2NlcHRzIHRoZSBwYXJzZXIgc3RhdGUgbWFjaGluZSBhbmRcbiAqIGV4dGVuZHMgdGhlIHBhcnNlciB0byByZWNvZ25pemUgYWRkaXRpb25hbCBsaW5rIHR5cGVzXG4gKi9cbmZ1bmN0aW9uIHJlZ2lzdGVyUGx1Z2luKG5hbWUsIHBsdWdpbikge1xuICBpZiAodHlwZW9mIHBsdWdpbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBFcnJvcihgbGlua2lmeWpzOiBJbnZhbGlkIHBsdWdpbiAke3BsdWdpbn0gKGV4cGVjdHMgZnVuY3Rpb24pYCk7XG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBJTklULnBsdWdpblF1ZXVlLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKG5hbWUgPT09IElOSVQucGx1Z2luUXVldWVbaV1bMF0pIHtcbiAgICAgIHdhcm4oYGxpbmtpZnlqczogcGx1Z2luIFwiJHtuYW1lfVwiIGFscmVhZHkgcmVnaXN0ZXJlZCAtIHdpbGwgYmUgb3ZlcndyaXR0ZW5gKTtcbiAgICAgIElOSVQucGx1Z2luUXVldWVbaV0gPSBbbmFtZSwgcGx1Z2luXTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cbiAgSU5JVC5wbHVnaW5RdWV1ZS5wdXNoKFtuYW1lLCBwbHVnaW5dKTtcbiAgaWYgKElOSVQuaW5pdGlhbGl6ZWQpIHtcbiAgICB3YXJuKGBsaW5raWZ5anM6IGFscmVhZHkgaW5pdGlhbGl6ZWQgLSB3aWxsIG5vdCByZWdpc3RlciBwbHVnaW4gXCIke25hbWV9XCIgJHt3YXJuQWR2aWNlfWApO1xuICB9XG59XG5cbi8qKlxuICogRGV0ZWN0IFVSTHMgd2l0aCB0aGUgZm9sbG93aW5nIGFkZGl0aW9uYWwgcHJvdG9jb2wuIEFueXRoaW5nIHdpdGggZm9ybWF0XG4gKiBcInByb3RvY29sOi8vLi4uXCIgd2lsbCBiZSBjb25zaWRlcmVkIGEgbGluay4gSWYgYG9wdGlvbmFsU2xhc2hTbGFzaGAgaXMgc2V0IHRvXG4gKiBgdHJ1ZWAsIGFueXRoaW5nIHdpdGggZm9ybWF0IFwicHJvdG9jb2w6Li4uXCIgd2lsbCBiZSBjb25zaWRlcmVkIGEgbGluay5cbiAqIEBwYXJhbSB7c3RyaW5nfSBwcm90b2NvbFxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9uYWxTbGFzaFNsYXNoXVxuICovXG5mdW5jdGlvbiByZWdpc3RlckN1c3RvbVByb3RvY29sKHNjaGVtZSwgb3B0aW9uYWxTbGFzaFNsYXNoKSB7XG4gIGlmIChvcHRpb25hbFNsYXNoU2xhc2ggPT09IHZvaWQgMCkge1xuICAgIG9wdGlvbmFsU2xhc2hTbGFzaCA9IGZhbHNlO1xuICB9XG4gIGlmIChJTklULmluaXRpYWxpemVkKSB7XG4gICAgd2FybihgbGlua2lmeWpzOiBhbHJlYWR5IGluaXRpYWxpemVkIC0gd2lsbCBub3QgcmVnaXN0ZXIgY3VzdG9tIHNjaGVtZSBcIiR7c2NoZW1lfVwiICR7d2FybkFkdmljZX1gKTtcbiAgfVxuICBpZiAoIS9eWzAtOWEtel0rKC1bMC05YS16XSspKiQvLnRlc3Qoc2NoZW1lKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignbGlua2lmeWpzOiBpbmNvcnJlY3Qgc2NoZW1lIGZvcm1hdC5cXG4gMS4gTXVzdCBvbmx5IGNvbnRhaW4gZGlnaXRzLCBsb3dlcmNhc2UgQVNDSUkgbGV0dGVycyBvciBcIi1cIlxcbiAyLiBDYW5ub3Qgc3RhcnQgb3IgZW5kIHdpdGggXCItXCJcXG4gMy4gXCItXCIgY2Fubm90IHJlcGVhdCcpO1xuICB9XG4gIElOSVQuY3VzdG9tU2NoZW1lcy5wdXNoKFtzY2hlbWUsIG9wdGlvbmFsU2xhc2hTbGFzaF0pO1xufVxuXG4vKipcbiAqIEluaXRpYWxpemUgdGhlIGxpbmtpZnkgc3RhdGUgbWFjaGluZS4gQ2FsbGVkIGF1dG9tYXRpY2FsbHkgdGhlIGZpcnN0IHRpbWVcbiAqIGxpbmtpZnkgaXMgY2FsbGVkIG9uIGEgc3RyaW5nLCBidXQgbWF5IGJlIGNhbGxlZCBtYW51YWxseSBhcyB3ZWxsLlxuICovXG5mdW5jdGlvbiBpbml0KCkge1xuICAvLyBJbml0aWFsaXplIHNjYW5uZXIgc3RhdGUgbWFjaGluZSBhbmQgcGx1Z2luc1xuICBJTklULnNjYW5uZXIgPSBpbml0JDIoSU5JVC5jdXN0b21TY2hlbWVzKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBJTklULnRva2VuUXVldWUubGVuZ3RoOyBpKyspIHtcbiAgICBJTklULnRva2VuUXVldWVbaV1bMV0oe1xuICAgICAgc2Nhbm5lcjogSU5JVC5zY2FubmVyXG4gICAgfSk7XG4gIH1cblxuICAvLyBJbml0aWFsaXplIHBhcnNlciBzdGF0ZSBtYWNoaW5lIGFuZCBwbHVnaW5zXG4gIElOSVQucGFyc2VyID0gaW5pdCQxKElOSVQuc2Nhbm5lci50b2tlbnMpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IElOSVQucGx1Z2luUXVldWUubGVuZ3RoOyBpKyspIHtcbiAgICBJTklULnBsdWdpblF1ZXVlW2ldWzFdKHtcbiAgICAgIHNjYW5uZXI6IElOSVQuc2Nhbm5lcixcbiAgICAgIHBhcnNlcjogSU5JVC5wYXJzZXJcbiAgICB9KTtcbiAgfVxuICBJTklULmluaXRpYWxpemVkID0gdHJ1ZTtcbn1cblxuLyoqXG4gKiBQYXJzZSBhIHN0cmluZyBpbnRvIHRva2VucyB0aGF0IHJlcHJlc2VudCBsaW5rYWJsZSBhbmQgbm9uLWxpbmthYmxlIHN1Yi1jb21wb25lbnRzXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtNdWx0aVRva2VuW119IHRva2Vuc1xuICovXG5mdW5jdGlvbiB0b2tlbml6ZShzdHIpIHtcbiAgaWYgKCFJTklULmluaXRpYWxpemVkKSB7XG4gICAgaW5pdCgpO1xuICB9XG4gIHJldHVybiBydW4oSU5JVC5wYXJzZXIuc3RhcnQsIHN0ciwgcnVuJDEoSU5JVC5zY2FubmVyLnN0YXJ0LCBzdHIpKTtcbn1cblxuLyoqXG4gKiBGaW5kIGEgbGlzdCBvZiBsaW5rYWJsZSBpdGVtcyBpbiB0aGUgZ2l2ZW4gc3RyaW5nLlxuICogQHBhcmFtIHtzdHJpbmd9IHN0ciBzdHJpbmcgdG8gZmluZCBsaW5rcyBpblxuICogQHBhcmFtIHtzdHJpbmcgfCBPcHRzfSBbdHlwZV0gZWl0aGVyIGZvcm1hdHRpbmcgb3B0aW9ucyBvciBzcGVjaWZpYyB0eXBlIG9mXG4gKiBsaW5rcyB0byBmaW5kLCBlLmcuLCAndXJsJyBvciAnZW1haWwnXG4gKiBAcGFyYW0ge09wdHN9IFtvcHRzXSBmb3JtYXR0aW5nIG9wdGlvbnMgZm9yIGZpbmFsIG91dHB1dC4gQ2Fubm90IGJlIHNwZWNpZmllZFxuICogaWYgb3B0cyBhbHJlYWR5IHByb3ZpZGVkIGluIGB0eXBlYCBhcmd1bWVudFxuKi9cbmZ1bmN0aW9uIGZpbmQoc3RyLCB0eXBlLCBvcHRzKSB7XG4gIGlmICh0eXBlID09PSB2b2lkIDApIHtcbiAgICB0eXBlID0gbnVsbDtcbiAgfVxuICBpZiAob3B0cyA9PT0gdm9pZCAwKSB7XG4gICAgb3B0cyA9IG51bGw7XG4gIH1cbiAgaWYgKHR5cGUgJiYgdHlwZW9mIHR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgaWYgKG9wdHMpIHtcbiAgICAgIHRocm93IEVycm9yKGBsaW5raWZ5anM6IEludmFsaWQgbGluayB0eXBlICR7dHlwZX07IG11c3QgYmUgYSBzdHJpbmdgKTtcbiAgICB9XG4gICAgb3B0cyA9IHR5cGU7XG4gICAgdHlwZSA9IG51bGw7XG4gIH1cbiAgY29uc3Qgb3B0aW9ucyA9IG5ldyBPcHRpb25zKG9wdHMpO1xuICBjb25zdCB0b2tlbnMgPSB0b2tlbml6ZShzdHIpO1xuICBjb25zdCBmaWx0ZXJlZCA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHRva2VuID0gdG9rZW5zW2ldO1xuICAgIGlmICh0b2tlbi5pc0xpbmsgJiYgKCF0eXBlIHx8IHRva2VuLnQgPT09IHR5cGUpKSB7XG4gICAgICBmaWx0ZXJlZC5wdXNoKHRva2VuLnRvRm9ybWF0dGVkT2JqZWN0KG9wdGlvbnMpKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZpbHRlcmVkO1xufVxuXG4vKipcbiAqIElzIHRoZSBnaXZlbiBzdHJpbmcgdmFsaWQgbGlua2FibGUgdGV4dCBvZiBzb21lIHNvcnQuIE5vdGUgdGhhdCB0aGlzIGRvZXMgbm90XG4gKiB0cmltIHRoZSB0ZXh0IGZvciB5b3UuXG4gKlxuICogT3B0aW9uYWxseSBwYXNzIGluIGEgc2Vjb25kIGB0eXBlYCBwYXJhbSwgd2hpY2ggaXMgdGhlIHR5cGUgb2YgbGluayB0byB0ZXN0XG4gKiBmb3IuXG4gKlxuICogRm9yIGV4YW1wbGUsXG4gKlxuICogICAgIGxpbmtpZnkudGVzdChzdHIsICdlbWFpbCcpO1xuICpcbiAqIFJldHVybnMgYHRydWVgIGlmIHN0ciBpcyBhIHZhbGlkIGVtYWlsLlxuICogQHBhcmFtIHtzdHJpbmd9IHN0ciBzdHJpbmcgdG8gdGVzdCBmb3IgbGlua3NcbiAqIEBwYXJhbSB7c3RyaW5nfSBbdHlwZV0gb3B0aW9uYWwgc3BlY2lmaWMgbGluayB0eXBlIHRvIGxvb2sgZm9yXG4gKiBAcmV0dXJucyBib29sZWFuIHRydWUvZmFsc2VcbiAqL1xuZnVuY3Rpb24gdGVzdChzdHIsIHR5cGUpIHtcbiAgaWYgKHR5cGUgPT09IHZvaWQgMCkge1xuICAgIHR5cGUgPSBudWxsO1xuICB9XG4gIGNvbnN0IHRva2VucyA9IHRva2VuaXplKHN0cik7XG4gIHJldHVybiB0b2tlbnMubGVuZ3RoID09PSAxICYmIHRva2Vuc1swXS5pc0xpbmsgJiYgKCF0eXBlIHx8IHRva2Vuc1swXS50ID09PSB0eXBlKTtcbn1cblxuZXhwb3J0IHsgTXVsdGlUb2tlbiwgT3B0aW9ucywgU3RhdGUsIGNyZWF0ZVRva2VuQ2xhc3MsIGZpbmQsIGluaXQsIG11bHRpLCBvcHRpb25zLCByZWdleHAsIHJlZ2lzdGVyQ3VzdG9tUHJvdG9jb2wsIHJlZ2lzdGVyUGx1Z2luLCByZWdpc3RlclRva2VuUGx1Z2luLCByZXNldCwgc3RyaW5nVG9BcnJheSwgdGVzdCwgdG9rZW5pemUgfTtcbiIsICJpbXBvcnQgR09iamVjdCBmcm9tIFwiZ2k6Ly9HT2JqZWN0XCI7XG5pbXBvcnQgR3RrIGZyb20gXCJnaTovL0d0az92ZXJzaW9uPTQuMFwiO1xuaW1wb3J0IEFkdyBmcm9tIFwiZ2k6Ly9BZHdcIjtcbmltcG9ydCBHZGsgZnJvbSBcImdpOi8vR2RrP3ZlcnNpb249NC4wXCI7XG5cbmV4cG9ydCBjbGFzcyBUaGVtZVNlbGVjdG9yIGV4dGVuZHMgR3RrLldpZGdldCB7XG4gIHN0YXRpYyB7XG4gICAgR09iamVjdC5yZWdpc3RlckNsYXNzKFxuICAgICAge1xuICAgICAgICBHVHlwZU5hbWU6IFwiVGhlbWVTZWxlY3RvclwiLFxuICAgICAgICBUZW1wbGF0ZTogXCJyZXNvdXJjZTovLy9jb20vdml4YWxpZW4vc3RpY2t5L3VpL3RoZW1lLXNlbGVjdG9yLnVpXCIsXG4gICAgICAgIENzc05hbWU6IFwidGhlbWVzZWxlY3RvclwiLFxuICAgICAgICBJbnRlcm5hbENoaWxkcmVuOiBbXCJmb2xsb3dcIl0sXG4gICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICB0aGVtZTogR09iamVjdC5QYXJhbVNwZWMuc3RyaW5nKFxuICAgICAgICAgICAgXCJ0aGVtZVwiLCAvLyBOYW1lXG4gICAgICAgICAgICBcIlRoZW1lXCIsIC8vIE5pY2tcbiAgICAgICAgICAgIFwiVGhlbWVcIiwgLy8gQmx1cmJcbiAgICAgICAgICAgIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsXG4gICAgICAgICAgICAvLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgICAgICAgICAgbnVsbCwgLy8gRGVmYXVsdCB2YWx1ZVxuICAgICAgICAgICksXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgdGhpcyxcbiAgICApO1xuXG4gICAgdGhpcy5zZXRfbGF5b3V0X21hbmFnZXJfdHlwZShHdGsuQmluTGF5b3V0LiRndHlwZSk7XG4gIH1cblxuICB0aGVtZTogc3RyaW5nO1xuXG4gIGRlY2xhcmUgX2ZvbGxvdzogR3RrLkNoZWNrQnV0dG9uO1xuXG4gIHN0eWxlX21hbmFnZXI6IEFkdy5TdHlsZU1hbmFnZXI7XG5cbiAgY29uc3RydWN0b3IocGFyYW1zID0ge30pIHtcbiAgICBzdXBlcihwYXJhbXMpO1xuXG4gICAgdGhpcy5zdHlsZV9tYW5hZ2VyID0gQWR3LlN0eWxlTWFuYWdlci5nZXRfZGVmYXVsdCgpO1xuXG4gICAgdGhpcy5zdHlsZV9tYW5hZ2VyLmNvbm5lY3QoXG4gICAgICBcIm5vdGlmeTo6c3lzdGVtLXN1cHBvcnRzLWNvbG9yLXNjaGVtZXNcIixcbiAgICAgIHRoaXMuX29uX25vdGlmeV9zeXN0ZW1fc3VwcG9ydHNfY29sb3Jfc2NoZW1lcy5iaW5kKHRoaXMpLFxuICAgICk7XG4gICAgdGhpcy5fb25fbm90aWZ5X3N5c3RlbV9zdXBwb3J0c19jb2xvcl9zY2hlbWVzKCk7XG5cbiAgICBjb25zdCBkYXJrID0gdGhpcy5zdHlsZV9tYW5hZ2VyLmdldF9kYXJrKCk7XG4gICAgdGhpcy50aGVtZSA9IGRhcmsgPyBcImRhcmtcIiA6IFwibGlnaHRcIjtcblxuICAgIHRoaXMuc3R5bGVfbWFuYWdlci5jb25uZWN0KFwibm90aWZ5OjpkYXJrXCIsIHRoaXMuX29uX25vdGlmeV9kYXJrLmJpbmQodGhpcykpO1xuICAgIHRoaXMuX29uX25vdGlmeV9kYXJrKCk7XG5cbiAgICBjb25zdCBwcm92aWRlciA9IG5ldyBHdGsuQ3NzUHJvdmlkZXIoKTtcbiAgICBwcm92aWRlci5sb2FkX2Zyb21fcmVzb3VyY2UoXCIvY29tL3ZpeGFsaWVuL3N0aWNreS90aGVtZS1zZWxlY3Rvci5jc3NcIik7XG4gICAgR3RrLlN0eWxlQ29udGV4dC5hZGRfcHJvdmlkZXJfZm9yX2Rpc3BsYXkoXG4gICAgICBHZGsuRGlzcGxheS5nZXRfZGVmYXVsdCgpISxcbiAgICAgIHByb3ZpZGVyLFxuICAgICAgR3RrLlNUWUxFX1BST1ZJREVSX1BSSU9SSVRZX0FQUExJQ0FUSU9OLFxuICAgICk7XG4gIH1cblxuICBfb25fbm90aWZ5X3N5c3RlbV9zdXBwb3J0c19jb2xvcl9zY2hlbWVzKCkge1xuICAgIHRoaXMuX2ZvbGxvdy5zZXRfdmlzaWJsZShcbiAgICAgIHRoaXMuc3R5bGVfbWFuYWdlci5nZXRfc3lzdGVtX3N1cHBvcnRzX2NvbG9yX3NjaGVtZXMoKSxcbiAgICApO1xuICB9XG5cbiAgX29uX25vdGlmeV9kYXJrKCkge1xuICAgIGlmICh0aGlzLnN0eWxlX21hbmFnZXIuZ2V0X2RhcmsoKSkgdGhpcy5hZGRfY3NzX2NsYXNzKFwiZGFya1wiKTtcbiAgICBlbHNlIHRoaXMucmVtb3ZlX2Nzc19jbGFzcyhcImRhcmtcIik7XG4gIH1cbn1cbiIsICJpbXBvcnQgR2lvIGZyb20gXCJnaTovL0dpb1wiO1xuaW1wb3J0IEdMaWIgZnJvbSBcImdpOi8vR0xpYlwiO1xuXG5pbXBvcnQgeyBTdGlja3lFcnJvciwgU3RpY2t5RXJyb3JUeXBlIH0gZnJvbSBcIi4vZXJyb3JzLmpzXCI7XG5pbXBvcnQgeyBJTm90ZSwgTm90ZSwgU0VUVElOR1MgfSBmcm9tIFwiLi91dGlsLmpzXCI7XG5cbkdpby5fcHJvbWlzaWZ5KFxuICBHaW8uRmlsZS5wcm90b3R5cGUsXG4gIFwibG9hZF9jb250ZW50c19hc3luY1wiLFxuICBcImxvYWRfY29udGVudHNfZmluaXNoXCIsXG4pO1xuXG5HaW8uX3Byb21pc2lmeShcbiAgR2lvLkZpbGUucHJvdG90eXBlLFxuICBcInJlcGxhY2VfY29udGVudHNfYXN5bmNcIixcbiAgXCJyZXBsYWNlX2NvbnRlbnRzX2ZpbmlzaFwiLFxuKTtcblxuY29uc3QgZGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcigpO1xuY29uc3QgZW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0X25vdGVzX2RpcigpIHtcbiAgY29uc3QgcGF0aCA9IFNFVFRJTkdTLk5PVEVTX1BBVEg7XG4gIGlmIChwYXRoICYmIHBhdGgudHJpbSgpICE9PSBcIlwiKSB7XG4gICAgcmV0dXJuIEdpby5maWxlX25ld19mb3JfcGF0aChwYXRoKTtcbiAgfVxuICByZXR1cm4gR2lvLmZpbGVfbmV3X2Zvcl9wYXRoKFxuICAgIEdMaWIuYnVpbGRfZmlsZW5hbWV2KFtHTGliLmdldF91c2VyX2RhdGFfZGlyKCksIHBrZy5uYW1lLCBcIm5vdGVzXCJdKSxcbiAgKTtcbn1cblxuZXhwb3J0IGNvbnN0IE5vdGVzRGlyID0gR2lvLmZpbGVfbmV3X2Zvcl9wYXRoKFxuICBHTGliLmJ1aWxkX2ZpbGVuYW1ldihbR0xpYi5nZXRfdXNlcl9kYXRhX2RpcigpLCBwa2cubmFtZV0pLFxuKTtcblxuZXhwb3J0IGNvbnN0IE5vdGVzID0gR2lvLmZpbGVfbmV3X2Zvcl9wYXRoKFxuICBHTGliLmJ1aWxkX2ZpbGVuYW1ldihbTm90ZXNEaXIuZ2V0X3BhdGgoKSEsIFwibm90ZXMuanNvblwiXSksXG4pO1xuXG5leHBvcnQgY29uc3QgbG9hZF9maWxlID0gKGZpbGU6IEdpby5GaWxlKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgcGFyZW50ID0gZmlsZS5nZXRfcGFyZW50KCk7XG4gICAgaWYgKHBhcmVudCkge1xuICAgICAgcGFyZW50Lm1ha2VfZGlyZWN0b3J5X3dpdGhfcGFyZW50cyhudWxsKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGU6IHVua25vd24pIHtcbiAgICBpZiAoZSBpbnN0YW5jZW9mIEdMaWIuRXJyb3IpIHtcbiAgICAgIGlmICghZS5tYXRjaGVzKEdpby5JT0Vycm9yRW51bSwgR2lvLklPRXJyb3JFbnVtLkVYSVNUUykpIHtcbiAgICAgICAgdGhyb3cgbmV3IFN0aWNreUVycm9yKFxuICAgICAgICAgIFN0aWNreUVycm9yVHlwZS5OT19QRVJNSVNTSU9OLFxuICAgICAgICAgIFwiRmFpbGVkIHRvIGNyZWF0ZSBub3RlcyBkaXJlY3RvcnlcIixcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB0cnkge1xuICAgIGNvbnN0IFtfLCBjb250ZW50c10gPSBmaWxlLmxvYWRfY29udGVudHMobnVsbCk7XG4gICAgY29uc3QgdGV4dCA9IGRlY29kZXIuZGVjb2RlKGNvbnRlbnRzKTtcblxuICAgIC8vIElmIGl0J3MgYSBsZWdhY3kgSlNPTiBpbmRleCAobGlrZSBub3Rlcy5qc29uKVxuICAgIGlmIChmaWxlLmdldF9iYXNlbmFtZSgpID09PSBcIm5vdGVzLmpzb25cIikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UodGV4dCk7XG4gICAgICB9IGNhdGNoIChlOiB1bmtub3duKSB7XG4gICAgICAgIHRocm93IG5ldyBTdGlja3lFcnJvcihTdGlja3lFcnJvclR5cGUuRklMRV9DT1JSVVBURUQsIFwiRmFpbGVkIHRvIHBhcnNlIG5vdGVzXCIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIE5ldyBNYXJrZG93biBmb3JtYXQgd2l0aCBmcm9udG1hdHRlclxuICAgIGNvbnN0IG1hdGNoID0gdGV4dC5tYXRjaCgvXi0tLVxcbihbXFxzXFxTXSo/KVxcbi0tLVxcbihbXFxzXFxTXSopJC8pO1xuICAgIGlmICghbWF0Y2gpIHtcbiAgICAgIC8vIEl0IG1pZ2h0IGJlIGp1c3QgY29udGVudCB3aXRob3V0IGZyb250bWF0dGVyLCBidXQgbGV0J3MgYXNzdW1lIHZhbGlkIG1hcmtkb3duIGhhcyBmcm9udG1hdHRlclxuICAgICAgLy8gTGV0J3MgdHJ5IHBhcnNpbmcgSlNPTiBhcyBhIGZhbGxiYWNrIGp1c3QgaW4gY2FzZSBzb21lIC5qc29uIGZpbGVzIGFyZSBiZWluZyByZWFkXG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZSh0ZXh0KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IFN0aWNreUVycm9yKFN0aWNreUVycm9yVHlwZS5GSUxFX0NPUlJVUFRFRCwgXCJGYWlsZWQgdG8gcGFyc2Ugbm90ZSBtYXJrZG93blwiKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCB5YW1sU3RyID0gbWF0Y2hbMV07XG4gICAgY29uc3QgYm9keSA9IG1hdGNoWzJdO1xuXG4gICAgLy8gU2ltcGxlIGN1c3RvbSBZQU1MIHBhcnNlciBmb3Igb3VyIGZsYXQgb2JqZWN0ICsgdGFncyBhcnJheVxuICAgIGNvbnN0IGRhdGE6IGFueSA9IHsgY29udGVudDogYm9keSB9O1xuICAgIGNvbnN0IGxpbmVzID0geWFtbFN0ci5zcGxpdChcIlxcblwiKTtcbiAgICBsZXQgaW5UYWdzID0gZmFsc2U7XG4gICAgbGV0IGN1cnJlbnRUYWdzOiBhbnlbXSA9IFtdO1xuICAgIGxldCBjdXJyZW50VGFnOiBhbnkgPSBudWxsO1xuXG4gICAgZm9yIChsZXQgbGluZSBvZiBsaW5lcykge1xuICAgICAgaWYgKGxpbmUudHJpbSgpID09PSBcIlwiKSBjb250aW51ZTtcbiAgICAgIFxuICAgICAgaWYgKGluVGFncyAmJiBsaW5lLnN0YXJ0c1dpdGgoXCItIFwiKSkge1xuICAgICAgICBpZiAoY3VycmVudFRhZykgY3VycmVudFRhZ3MucHVzaChjdXJyZW50VGFnKTtcbiAgICAgICAgY3VycmVudFRhZyA9IHt9O1xuICAgICAgICBjb25zdCByZXN0ID0gbGluZS5zdWJzdHJpbmcoMik7XG4gICAgICAgIGNvbnN0IHBhcnRzID0gcmVzdC5zcGxpdCgvOlxccyooLiopLyk7XG4gICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgY3VycmVudFRhZ1twYXJ0c1swXS50cmltKCldID0gaXNOYU4oTnVtYmVyKHBhcnRzWzFdKSkgPyBwYXJ0c1sxXSA6IE51bWJlcihwYXJ0c1sxXSk7XG4gICAgICAgIH1cbiAgICAgICAgY29udGludWU7XG4gICAgICB9IGVsc2UgaWYgKGluVGFncyAmJiBsaW5lLnN0YXJ0c1dpdGgoXCIgIFwiKSkge1xuICAgICAgICBjb25zdCBwYXJ0cyA9IGxpbmUuc3BsaXQoLzpcXHMqKC4qKS8pO1xuICAgICAgICBpZiAocGFydHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgIGN1cnJlbnRUYWdbcGFydHNbMF0udHJpbSgpXSA9IGlzTmFOKE51bWJlcihwYXJ0c1sxXSkpID8gcGFydHNbMV0gOiBOdW1iZXIocGFydHNbMV0pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfSBlbHNlIGlmIChpblRhZ3MgJiYgIWxpbmUuc3RhcnRzV2l0aChcIiBcIikpIHtcbiAgICAgICAgaW5UYWdzID0gZmFsc2U7XG4gICAgICAgIGlmIChjdXJyZW50VGFnKSBjdXJyZW50VGFncy5wdXNoKGN1cnJlbnRUYWcpO1xuICAgICAgICBjdXJyZW50VGFnID0gbnVsbDtcbiAgICAgICAgZGF0YS50YWdzID0gY3VycmVudFRhZ3M7XG4gICAgICB9XG5cbiAgICAgIGlmICghaW5UYWdzKSB7XG4gICAgICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoXCJ0YWdzOlwiKSkge1xuICAgICAgICAgIGluVGFncyA9IHRydWU7XG4gICAgICAgICAgY3VycmVudFRhZ3MgPSBbXTtcbiAgICAgICAgICBjdXJyZW50VGFnID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBwYXJ0cyA9IGxpbmUuc3BsaXQoLzpcXHMqKC4qKS8pO1xuICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICBsZXQga2V5ID0gcGFydHNbMF0udHJpbSgpO1xuICAgICAgICAgICAgbGV0IHZhbCA9IHBhcnRzWzFdO1xuICAgICAgICAgICAgaWYgKHZhbCA9PT0gXCJ0cnVlXCIpIGRhdGFba2V5XSA9IHRydWU7XG4gICAgICAgICAgICBlbHNlIGlmICh2YWwgPT09IFwiZmFsc2VcIikgZGF0YVtrZXldID0gZmFsc2U7XG4gICAgICAgICAgICBlbHNlIGlmICghaXNOYU4oTnVtYmVyKHZhbCkpICYmIHZhbCAhPT0gXCJcIikgZGF0YVtrZXldID0gTnVtYmVyKHZhbCk7XG4gICAgICAgICAgICBlbHNlIGlmICh2YWwgJiYgdmFsLnN0YXJ0c1dpdGgoJ1wiJykgJiYgdmFsLmVuZHNXaXRoKCdcIicpKSBkYXRhW2tleV0gPSB2YWwuc2xpY2UoMSwgLTEpO1xuICAgICAgICAgICAgZWxzZSBkYXRhW2tleV0gPSB2YWw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChpblRhZ3MgJiYgY3VycmVudFRhZykge1xuICAgICAgY3VycmVudFRhZ3MucHVzaChjdXJyZW50VGFnKTtcbiAgICAgIGRhdGEudGFncyA9IGN1cnJlbnRUYWdzO1xuICAgIH1cblxuICAgIHJldHVybiBkYXRhO1xuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKGUgaW5zdGFuY2VvZiBHTGliLkVycm9yKSB7XG4gICAgICBpZiAoZS5tYXRjaGVzKEdpby5JT0Vycm9yRW51bSwgR2lvLklPRXJyb3JFbnVtLk5PVF9GT1VORCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFN0aWNreUVycm9yKFxuICAgICAgICAgIFN0aWNreUVycm9yVHlwZS5GSUxFX05PVF9GT1VORCxcbiAgICAgICAgICBcIkZhaWxlZCB0byBsb2FkIG5vdGVzXCIsXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgU3RpY2t5RXJyb3IoXG4gICAgICAgICAgU3RpY2t5RXJyb3JUeXBlLlVOS05PV04sXG4gICAgICAgICAgXCJGYWlsZWQgdG8gbG9hZCBub3Rlc1wiLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyBlO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3Qgc2F2ZV9maWxlID0gKGZpbGU6IEdpby5GaWxlLCBkYXRhOiBhbnkpID0+IHtcbiAgbGV0IHN0cmluZyA9IFwiXCI7XG5cbiAgaWYgKGZpbGUuZ2V0X2Jhc2VuYW1lKCkgPT09IFwibm90ZXMuanNvblwiKSB7XG4gICAgc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgMik7XG4gIH0gZWxzZSB7XG4gICAgLy8gU2F2ZSBhcyBtYXJrZG93biB3aXRoIGZyb250bWF0dGVyXG4gICAgbGV0IGZyb250bWF0dGVyID0gXCItLS1cXG5cIjtcbiAgICBmcm9udG1hdHRlciArPSBgdjogJHtkYXRhLnZ9XFxuYDtcbiAgICBmcm9udG1hdHRlciArPSBgdXVpZDogJHtkYXRhLnV1aWR9XFxuYDtcbiAgICBmcm9udG1hdHRlciArPSBgdGl0bGU6IFwiJHsoZGF0YS50aXRsZSB8fCBcIlwiKS5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJyl9XCJcXG5gO1xuICAgIGZyb250bWF0dGVyICs9IGBzdHlsZTogJHtkYXRhLnN0eWxlfVxcbmA7XG4gICAgZnJvbnRtYXR0ZXIgKz0gYG1vZGlmaWVkOiBcIiR7ZGF0YS5tb2RpZmllZH1cIlxcbmA7XG4gICAgZnJvbnRtYXR0ZXIgKz0gYHdpZHRoOiAke2RhdGEud2lkdGh9XFxuYDtcbiAgICBmcm9udG1hdHRlciArPSBgaGVpZ2h0OiAke2RhdGEuaGVpZ2h0fVxcbmA7XG4gICAgZnJvbnRtYXR0ZXIgKz0gYG9wZW46ICR7ZGF0YS5vcGVufVxcbmA7XG4gICAgXG4gICAgaWYgKGRhdGEudGFncyAmJiBkYXRhLnRhZ3MubGVuZ3RoID4gMCkge1xuICAgICAgZnJvbnRtYXR0ZXIgKz0gYHRhZ3M6XFxuYDtcbiAgICAgIGZvciAoY29uc3QgdGFnIG9mIGRhdGEudGFncykge1xuICAgICAgICBmcm9udG1hdHRlciArPSBgLSBuYW1lOiAke3RhZy5uYW1lfVxcbmA7XG4gICAgICAgIGZyb250bWF0dGVyICs9IGAgIHN0YXJ0OiAke3RhZy5zdGFydH1cXG5gO1xuICAgICAgICBmcm9udG1hdHRlciArPSBgICBlbmQ6ICR7dGFnLmVuZH1cXG5gO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmcm9udG1hdHRlciArPSBgdGFnczogW11cXG5gO1xuICAgIH1cbiAgICBcbiAgICBmcm9udG1hdHRlciArPSBcIi0tLVxcblwiO1xuICAgIHN0cmluZyA9IGZyb250bWF0dGVyICsgKGRhdGEuY29udGVudCB8fCBcIlwiKTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuIGZpbGUucmVwbGFjZV9jb250ZW50cyhcbiAgICAgIGVuY29kZXIuZW5jb2RlKHN0cmluZyksXG4gICAgICBudWxsLFxuICAgICAgZmFsc2UsXG4gICAgICBHaW8uRmlsZUNyZWF0ZUZsYWdzLk5PTkUsXG4gICAgICBudWxsLFxuICAgICk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoZSBpbnN0YW5jZW9mIEdMaWIuRXJyb3IpIHtcbiAgICAgIGlmIChlLm1hdGNoZXMoR2lvLklPRXJyb3JFbnVtLCBHaW8uSU9FcnJvckVudW0uUEVSTUlTU0lPTl9ERU5JRUQpKSB7XG4gICAgICAgIHRocm93IG5ldyBTdGlja3lFcnJvcihcbiAgICAgICAgICBTdGlja3lFcnJvclR5cGUuTk9fUEVSTUlTU0lPTixcbiAgICAgICAgICBcIkZhaWxlZCB0byBzYXZlIG5vdGVzXCIsXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgU3RpY2t5RXJyb3IoXG4gICAgICAgICAgU3RpY2t5RXJyb3JUeXBlLlVOS05PV04sXG4gICAgICAgICAgXCJGYWlsZWQgdG8gc2F2ZSBub3Rlc1wiLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGVuc3VyZV9kaXIgPSAoZGlyOiBHaW8uRmlsZSkgPT4ge1xuICB0cnkge1xuICAgIGRpci5tYWtlX2RpcmVjdG9yeV93aXRoX3BhcmVudHMobnVsbCk7XG4gIH0gY2F0Y2ggKGU6IHVua25vd24pIHtcbiAgICBpZiAoZSBpbnN0YW5jZW9mIEdMaWIuRXJyb3IpIHtcbiAgICAgIGlmICghZS5tYXRjaGVzKEdpby5JT0Vycm9yRW51bSwgR2lvLklPRXJyb3JFbnVtLkVYSVNUUykpIHtcbiAgICAgICAgdGhyb3cgbmV3IFN0aWNreUVycm9yKFxuICAgICAgICAgIFN0aWNreUVycm9yVHlwZS5OT19QRVJNSVNTSU9OLFxuICAgICAgICAgIFwiRmFpbGVkIHRvIGNyZWF0ZSBub3RlcyBkaXJlY3RvcnlcIixcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbmNvbnN0IGJvZ3VzX2RhdGEgPSB7IHN0YXRlOiB7IGFsbF9ub3RlczogdHJ1ZSB9LCBub3RlczogW10gfTtcblxuY29uc3QgbG9hZF9ub3Rlc192MSA9IChub3RlczogYW55KSA9PiB7XG4gIGlmIChub3Rlcy52ICE9PSAxKSB7XG4gICAgY29uc29sZS5lcnJvcihgSW52YWxpZCBub3RlcyB2ZXJzaW9uICR7bm90ZXMudn1gKTtcbiAgICByZXR1cm4gYm9ndXNfZGF0YTtcbiAgfVxuICByZXR1cm4ge1xuICAgIG5vdGVzOiBub3Rlcy5ub3Rlcy5tYXAoKG5vdGU6IElOb3RlKSA9PiBuZXcgTm90ZShub3RlKSksXG4gICAgc3RhdGU6IG5vdGVzLnN0YXRlLFxuICB9O1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRfbm90ZXMoKSB7XG4gIGxldCBpbmRleCA9IG51bGw7XG5cbiAgdHJ5IHtcbiAgICBpbmRleCA9IGxvYWRfZmlsZShOb3RlcykgPz8gbnVsbDtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChlIGluc3RhbmNlb2YgU3RpY2t5RXJyb3IpIHtcbiAgICAgIGlmIChcbiAgICAgICAgZS50eXBlID09IFN0aWNreUVycm9yVHlwZS5GSUxFX05PVF9GT1VORCB8fFxuICAgICAgICBlLnR5cGUgPT0gU3RpY2t5RXJyb3JUeXBlLkZJTEVfQ09SUlVQVEVEXG4gICAgICApIHtcbiAgICAgICAgLy8gaWdub3JlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChpbmRleCAhPT0gbnVsbCkge1xuICAgIC8vIGlmIHRoZSBpbmRleCBleGlzdHMsIGxvYWQgdGhlIG5vdGVzIGZyb20gdGhlIGluZGV4XG4gICAgY29uc3Qgbm90ZXMgPSBsb2FkX25vdGVzX3YxKGluZGV4KS5ub3RlcztcbiAgICBOb3Rlcy5kZWxldGUobnVsbCk7XG4gICAgc2F2ZV9ub3Rlcyhub3Rlcyk7XG4gICAgcmV0dXJuIG5vdGVzO1xuICB9XG5cbiAgY29uc3QgZGlyID0gZ2V0X25vdGVzX2RpcigpO1xuICBlbnN1cmVfZGlyKGRpcik7XG5cbiAgY29uc3QgZmlsZXMgPSBsaXN0X2ZpbGVzKGRpcik7XG5cbiAgcmV0dXJuIGZpbGVzXG4gICAgLmZpbHRlcigoZmlsZSkgPT4gZmlsZS5nZXRfYmFzZW5hbWUoKSEuZW5kc1dpdGgoXCIubWRcIikgfHwgZmlsZS5nZXRfYmFzZW5hbWUoKSEuZW5kc1dpdGgoXCIuanNvblwiKSlcbiAgICAubWFwKChmaWxlKSA9PiBsb2FkX2ZpbGUoZmlsZSkpXG4gICAgLm1hcCgobm90ZSkgPT4gbmV3IE5vdGUobm90ZSkpO1xufVxuXG5leHBvcnQgY29uc3QgbGlzdF9maWxlcyA9IChkaXI6IEdpby5GaWxlKSA9PiB7XG4gIGNvbnN0IGVudW1lcmF0b3IgPSBkaXIuZW51bWVyYXRlX2NoaWxkcmVuKFxuICAgIFwic3RhbmRhcmQ6Om5hbWUsc3RhbmRhcmQ6OnR5cGVcIixcbiAgICBHaW8uRmlsZVF1ZXJ5SW5mb0ZsYWdzLk5PTkUsXG4gICAgbnVsbCxcbiAgKTtcblxuICBjb25zdCBmaWxlczogR2lvLkZpbGVbXSA9IFtdO1xuXG4gIGxldCBpbmZvOiBHaW8uRmlsZUluZm8gfCBudWxsO1xuXG4gIHdoaWxlICgoaW5mbyA9IGVudW1lcmF0b3IubmV4dF9maWxlKG51bGwpKSAhPT0gbnVsbCkge1xuICAgIGNvbnN0IGZpbGUgPSBlbnVtZXJhdG9yLmdldF9jaGlsZChpbmZvKTtcbiAgICBmaWxlcy5wdXNoKGZpbGUpO1xuICB9XG5cbiAgcmV0dXJuIGZpbGVzO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHNhdmVfbm90ZXMobm90ZXM6IE5vdGVbXSkge1xuICBjb25zdCBkaXIgPSBnZXRfbm90ZXNfZGlyKCk7XG4gIGVuc3VyZV9kaXIoZGlyKTtcblxuICBjb25zdCBmaWxlcyA9IGxpc3RfZmlsZXMoZGlyKTtcblxuICBsZXQgd3JpdGVzOiBbTm90ZSwgR2lvLkZpbGVdW10gPSBbXTtcbiAgY29uc3QgZGVsZXRlczogR2lvLkZpbGVbXSA9IFtdO1xuXG4gIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuICAgIGNvbnN0IGJhc2VuYW1lID0gZmlsZS5nZXRfYmFzZW5hbWUoKSE7XG5cbiAgICBpZiAoYmFzZW5hbWUuZW5kc1dpdGgoXCIubWRcIikgfHwgYmFzZW5hbWUuZW5kc1dpdGgoXCIuanNvblwiKSkge1xuICAgICAgY29uc3QgZXh0TGVuID0gYmFzZW5hbWUuZW5kc1dpdGgoXCIubWRcIikgPyAzIDogNTtcbiAgICAgIGNvbnN0IHV1aWQgPSBiYXNlbmFtZS5zbGljZSgwLCAtZXh0TGVuKTtcblxuICAgICAgaWYgKHV1aWQubGVuZ3RoICE9PSAzNikge1xuICAgICAgICBkZWxldGVzLnB1c2goZmlsZSk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBub3RlID0gbm90ZXMuZmluZCgobm90ZSkgPT4gbm90ZS51dWlkID09PSB1dWlkKTtcbiAgICAgIGlmIChub3RlKSB7XG4gICAgICAgIGlmIChiYXNlbmFtZS5lbmRzV2l0aChcIi5qc29uXCIpKSB7XG4gICAgICAgICAgICAvLyBEZWxldGUgb2xkIGpzb24gZmlsZSBhbmQgcmVwbGFjZSB3aXRoIG1kXG4gICAgICAgICAgICBkZWxldGVzLnB1c2goZmlsZSk7XG4gICAgICAgICAgICBjb25zdCBuZXdGaWxlID0gZGlyLmdldF9jaGlsZChgJHtub3RlLnV1aWR9Lm1kYCk7XG4gICAgICAgICAgICB3cml0ZXMucHVzaChbbm90ZSwgbmV3RmlsZV0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd3JpdGVzLnB1c2goW25vdGUsIGZpbGVdKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVsZXRlcy5wdXNoKGZpbGUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBkZWxldGVzLnB1c2goZmlsZSk7XG4gICAgfVxuICB9XG5cbiAgZm9yIChjb25zdCBub3RlIG9mIG5vdGVzKSB7XG4gICAgaWYgKCF3cml0ZXMuc29tZSgoW25dKSA9PiBuLnV1aWQgPT09IG5vdGUudXVpZCkpIHtcbiAgICAgIGNvbnN0IGZpbGUgPSBkaXIuZ2V0X2NoaWxkKGAke25vdGUudXVpZH0ubWRgKTtcbiAgICAgIHdyaXRlcy5wdXNoKFtub3RlLCBmaWxlXSk7XG4gICAgfVxuICB9XG5cbiAgZm9yIChjb25zdCBmaWxlIG9mIGRlbGV0ZXMpIHtcbiAgICB0cnkgeyBmaWxlLmRlbGV0ZShudWxsKTsgfSBjYXRjaCAoZSkge31cbiAgfVxuXG4gIHJldHVybiB3cml0ZXMubWFwKChbbm90ZSwgZmlsZV0pID0+IHNhdmVfZmlsZShmaWxlLCBub3RlKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzYXZlX25vdGUobm90ZTogTm90ZSkge1xuICBjb25zdCBkaXIgPSBnZXRfbm90ZXNfZGlyKCk7XG4gIGNvbnN0IGZpbGUgPSBkaXIuZ2V0X2NoaWxkKGAke25vdGUudXVpZH0ubWRgKTtcblxuICAvLyBUcnkgdG8gcmVtb3ZlIG9sZCBqc29uIGZpbGUgaWYgaXQgZXhpc3RzXG4gIHRyeSB7XG4gICAgICBjb25zdCBvbGRGaWxlID0gZGlyLmdldF9jaGlsZChgJHtub3RlLnV1aWR9Lmpzb25gKTtcbiAgICAgIGlmIChvbGRGaWxlLnF1ZXJ5X2V4aXN0cyhudWxsKSkge1xuICAgICAgICAgIG9sZEZpbGUuZGVsZXRlKG51bGwpO1xuICAgICAgfVxuICB9IGNhdGNoIChlKSB7fVxuXG4gIHJldHVybiBzYXZlX2ZpbGUoZmlsZSwgbm90ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWxldGVfbm90ZSh1dWlkOiBzdHJpbmcpIHtcbiAgY29uc3QgZGlyID0gZ2V0X25vdGVzX2RpcigpO1xuICBjb25zdCBmaWxlTWQgPSBkaXIuZ2V0X2NoaWxkKGAke3V1aWR9Lm1kYCk7XG4gIGNvbnN0IGZpbGVKc29uID0gZGlyLmdldF9jaGlsZChgJHt1dWlkfS5qc29uYCk7XG5cbiAgdHJ5IHtcbiAgICBmaWxlTWQuZGVsZXRlKG51bGwpO1xuICB9IGNhdGNoIHt9XG4gIFxuICB0cnkge1xuICAgIGZpbGVKc29uLmRlbGV0ZShudWxsKTtcbiAgfSBjYXRjaCB7fVxufVxuIiwgImV4cG9ydCBlbnVtIFN0aWNreUVycm9yVHlwZSB7XG4gIEZJTEVfTk9UX0ZPVU5ELFxuICBGSUxFX0NPUlJVUFRFRCxcbiAgTk9fUEVSTUlTU0lPTixcbiAgVU5LTk9XTixcbn1cblxuZXhwb3J0IGNsYXNzIFN0aWNreUVycm9yIHtcbiAgbWVzc2FnZTogc3RyaW5nO1xuICB0eXBlOiBTdGlja3lFcnJvclR5cGU7XG5cbiAgY29uc3RydWN0b3IodHlwZTogU3RpY2t5RXJyb3JUeXBlLCBtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gIH1cbn1cbiIsICIvKiBNSVQgTGljZW5zZVxuICpcbiAqIENvcHlyaWdodCAoYykgMjAyMyBBbmdlbG8gVmVybGFpbiwgQ2hyaXMgRGF2aXNcbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gKiBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAqIFNPRlRXQVJFLlxuICpcbiAqIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBNSVRcbiAqL1xuXG5pbXBvcnQgR09iamVjdCBmcm9tIFwiZ2k6Ly9HT2JqZWN0XCI7XG5pbXBvcnQgR3RrIGZyb20gXCJnaTovL0d0az92ZXJzaW9uPTQuMFwiO1xuaW1wb3J0IEFkdyBmcm9tIFwiZ2k6Ly9BZHdcIjtcbmltcG9ydCBHaW8gZnJvbSBcImdpOi8vR2lvXCI7XG5pbXBvcnQgR0xpYiBmcm9tIFwiZ2k6Ly9HTGliXCI7XG5cbmltcG9ydCB7IFN0eWxlU2VsZWN0b3IgfSBmcm9tIFwiLi9zdHlsZXNlbGVjdG9yLmpzXCI7XG5pbXBvcnQgeyBjb25maXJtX2RlbGV0ZSwgTm90ZSwgU3R5bGUgfSBmcm9tIFwiLi91dGlsLmpzXCI7XG5pbXBvcnQgeyBXcml0ZWFibGVTdGlja3lOb3RlIH0gZnJvbSBcIi4vdmlldy5qc1wiO1xuaW1wb3J0IHsgZmluZCB9IGZyb20gXCJsaW5raWZ5anNcIjtcbmltcG9ydCB7IEFwcGxpY2F0aW9uIH0gZnJvbSBcIi4vYXBwbGljYXRpb24uanNcIjtcblxuZXhwb3J0IGNsYXNzIFdpbmRvdyBleHRlbmRzIEFkdy5BcHBsaWNhdGlvbldpbmRvdyB7XG4gIGRlY2xhcmUgX2NvbnRhaW5lcjogR3RrLkJveDtcbiAgZGVjbGFyZSBfdGV4dDogR3RrLlRleHRWaWV3O1xuICBkZWNsYXJlIF9tZW51X2J1dHRvbjogR3RrLk1lbnVCdXR0b247XG4gIGRlY2xhcmUgX3RpdGxlX2VudHJ5OiBHdGsuRW50cnk7XG5cbiAgZGVjbGFyZSBfYm9sZF9idXR0b246IEd0ay5Ub2dnbGVCdXR0b247XG4gIGRlY2xhcmUgX3VuZGVybGluZV9idXR0b246IEd0ay5Ub2dnbGVCdXR0b247XG4gIGRlY2xhcmUgX2l0YWxpY19idXR0b246IEd0ay5Ub2dnbGVCdXR0b247XG4gIGRlY2xhcmUgX3N0cmlrZXRocm91Z2hfYnV0dG9uOiBHdGsuVG9nZ2xlQnV0dG9uO1xuICBkZWNsYXJlIF9hY3Rpb25fYnV0dG9uOiBHdGsuVG9nZ2xlQnV0dG9uO1xuICBkZWNsYXJlIF9hY3Rpb25fcmV2ZWFsZXI6IEd0ay5SZXZlYWxlcjtcblxuICAvLyBidWZmZXIgPSBuZXcgR3RrLlRleHRCdWZmZXIoKTtcblxuICB2aWV3OiBXcml0ZWFibGVTdGlja3lOb3RlO1xuXG4gIHNlbGVjdG9yOiBTdHlsZVNlbGVjdG9yO1xuXG4gIG5vdGU6IE5vdGU7XG4gIGRlbGV0ZWQgPSBmYWxzZTtcblxuICBzdGF0aWMge1xuICAgIEdPYmplY3QucmVnaXN0ZXJDbGFzcyhcbiAgICAgIHtcbiAgICAgICAgVGVtcGxhdGU6IFwicmVzb3VyY2U6Ly8vY29tL3ZpeGFsaWVuL3N0aWNreS91aS93aW5kb3cudWlcIixcbiAgICAgICAgR1R5cGVOYW1lOiBcIlN0aWNreU5vdGVXaW5kb3dcIixcbiAgICAgICAgSW50ZXJuYWxDaGlsZHJlbjogW1xuICAgICAgICAgIFwiY29udGFpbmVyXCIsXG4gICAgICAgICAgXCJ0ZXh0XCIsXG4gICAgICAgICAgXCJib2xkX2J1dHRvblwiLFxuICAgICAgICAgIFwidW5kZXJsaW5lX2J1dHRvblwiLFxuICAgICAgICAgIFwiaXRhbGljX2J1dHRvblwiLFxuICAgICAgICAgIFwic3RyaWtldGhyb3VnaF9idXR0b25cIixcbiAgICAgICAgICBcIm1lbnVfYnV0dG9uXCIsXG4gICAgICAgICAgXCJhY3Rpb25fcmV2ZWFsZXJcIixcbiAgICAgICAgICBcImFjdGlvbl9idXR0b25cIixcbiAgICAgICAgICBcInRpdGxlX2VudHJ5XCIsXG4gICAgICAgIF0sXG4gICAgICAgIFNpZ25hbHM6IHtcbiAgICAgICAgICBkZWxldGVkOiB7XG4gICAgICAgICAgICBwYXJhbV90eXBlczogW0dPYmplY3QuVFlQRV9TVFJJTkddLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgdGhpcyxcbiAgICApO1xuICB9XG5cbiAgZ2V0X3N0eWxlKCkge1xuICAgIHJldHVybiB0aGlzLnNlbGVjdG9yLnN0eWxlO1xuICB9XG5cbiAgY29uc3RydWN0b3IoXG4gICAgeyBub3RlLCAuLi5wYXJhbXMgfTogUGFydGlhbDxBZHcuQXBwbGljYXRpb25XaW5kb3cuQ29uc3RydWN0b3JQcm9wcz4gJiB7XG4gICAgICBub3RlOiBOb3RlO1xuICAgIH0sXG4gICkge1xuICAgIHN1cGVyKHBhcmFtcyk7XG5cbiAgICB0aGlzLm5vdGUgPSBub3RlO1xuXG4gICAgdGhpcy5kZWZhdWx0X3dpZHRoID0gbm90ZS53aWR0aDtcbiAgICB0aGlzLmRlZmF1bHRfaGVpZ2h0ID0gbm90ZS5oZWlnaHQ7XG5cbiAgICB0aGlzLm5vdGUuYmluZF9wcm9wZXJ0eShcbiAgICAgIFwidGl0bGVcIixcbiAgICAgIHRoaXMuX3RpdGxlX2VudHJ5LFxuICAgICAgXCJ0ZXh0XCIsXG4gICAgICBHT2JqZWN0LkJpbmRpbmdGbGFncy5CSURJUkVDVElPTkFMIHwgR09iamVjdC5CaW5kaW5nRmxhZ3MuU1lOQ19DUkVBVEVcbiAgICApO1xuXG4gICAgdGhpcy5jb25uZWN0KFwiY2xvc2UtcmVxdWVzdFwiLCAoKSA9PiB7XG4gICAgICBpZiAodGhpcy5kZWxldGVkKSByZXR1cm47XG5cbiAgICAgIGlmICh0aGlzLnZpZXcubm90ZSAmJiB0aGlzLnZpZXcubm90ZS5jb250ZW50LnRyaW0oKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgKHRoaXMuYXBwbGljYXRpb24gYXMgQXBwbGljYXRpb24pLmRlbGV0ZV9ub3RlKHRoaXMubm90ZS51dWlkKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB3aWR0aCA9IHRoaXMuZ2V0X2FsbG9jYXRlZF93aWR0aCgpO1xuICAgICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5nZXRfYWxsb2NhdGVkX2hlaWdodCgpO1xuXG4gICAgICBpZiAod2lkdGggIT09IG5vdGUud2lkdGgpIHtcbiAgICAgICAgdGhpcy5ub3RlLndpZHRoID0gd2lkdGg7XG4gICAgICB9XG4gICAgICBpZiAoaGVpZ2h0ICE9PSBub3RlLmhlaWdodCkge1xuICAgICAgICB0aGlzLm5vdGUuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5zZXRfc3R5bGUobm90ZS5zdHlsZSwgdHJ1ZSk7XG5cbiAgICB0aGlzLnZpZXcgPSBuZXcgV3JpdGVhYmxlU3RpY2t5Tm90ZShub3RlKTtcbiAgICB0aGlzLnZpZXcuY29ubmVjdChcInNlbGVjdGlvbi1jaGFuZ2VkXCIsIHRoaXMuY2hlY2tfdGFncy5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnZpZXcuY29ubmVjdChcbiAgICAgIFwidGFnLXRvZ2dsZVwiLFxuICAgICAgKF92aWV3OiBXcml0ZWFibGVTdGlja3lOb3RlLCB0YWc6IHN0cmluZywgYWN0aXZlOiBib29sZWFuKSA9PiB7XG4gICAgICAgIGNvbnN0IGJ1dHRvbiA9XG4gICAgICAgICAgdGhpc1tgXyR7dGFnfV9idXR0b25gIGFzIGtleW9mIHR5cGVvZiB0aGlzXSBhcyBHdGsuVG9nZ2xlQnV0dG9uO1xuICAgICAgICBpZiAoIWJ1dHRvbikgcmV0dXJuO1xuICAgICAgICBidXR0b24uYWN0aXZlID0gYWN0aXZlO1xuICAgICAgfSxcbiAgICApO1xuICAgIHRoaXMudmlldy5jb25uZWN0KFwibGluay1zZWxlY3RlZFwiLCAoXywgdGV4dCkgPT4ge1xuICAgICAgdGhpcy51cGRhdGVfbGluayh0cnVlLCB0ZXh0KTtcbiAgICB9KTtcbiAgICB0aGlzLnZpZXcuY29ubmVjdChcImxpbmstdW5zZWxlY3RlZFwiLCAoKSA9PiB7XG4gICAgICB0aGlzLnVwZGF0ZV9saW5rKGZhbHNlLCBcIlwiKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX3RleHQuYnVmZmVyID0gdGhpcy52aWV3LmJ1ZmZlcjtcblxuICAgIHRoaXMuYWRkX2FjdGlvbnMoKTtcblxuICAgIHRoaXMuc2VsZWN0b3IgPSBuZXcgU3R5bGVTZWxlY3Rvcih7IHN0eWxlOiBub3RlLnN0eWxlIH0pO1xuICAgIHRoaXMuc2VsZWN0b3IuY29ubmVjdChcInN0eWxlLWNoYW5nZWRcIiwgKF9zZWxlY3Rvciwgc3R5bGUpID0+IHtcbiAgICAgIHRoaXMuc2V0X3N0eWxlKHN0eWxlKTtcbiAgICAgIHRoaXMubm90ZS5zdHlsZSA9IHN0eWxlO1xuICAgIH0pO1xuXG4gICAgY29uc3QgcG9wb3ZlciA9IHRoaXMuX21lbnVfYnV0dG9uLmdldF9wb3BvdmVyKCkgYXMgR3RrLlBvcG92ZXJNZW51O1xuICAgIHBvcG92ZXIuYWRkX2NoaWxkKHRoaXMuc2VsZWN0b3IsIFwibm90ZXN0eWxlc3dpdGNoZXJcIik7XG4gIH1cblxuICBsYXN0X3JldmVhbGVyID0gZmFsc2U7XG5cbiAgdXBkYXRlX2xpbmsoc2VsZWN0ZWQ6IGJvb2xlYW4sIHRleHQ6IHN0cmluZykge1xuICAgIGlmIChzZWxlY3RlZCkge1xuICAgICAgY29uc3QgaHJlZiA9IGZpbmQodGV4dClbMF0uaHJlZjtcbiAgICAgIHRoaXMuX2FjdGlvbl9idXR0b24uYWN0aW9uX3RhcmdldCA9IEdMaWIuVmFyaWFudC5uZXdfc3RyaW5nKGhyZWYpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmxhc3RfcmV2ZWFsZXIgPT09IHNlbGVjdGVkKSByZXR1cm47XG5cbiAgICB0aGlzLmxhc3RfcmV2ZWFsZXIgPSBzZWxlY3RlZDtcbiAgICB0aGlzLl9hY3Rpb25fcmV2ZWFsZXIucmV2ZWFsX2NoaWxkID0gc2VsZWN0ZWQ7XG5cbiAgICAvLyBhZGQgdGltZW91dCBmb3IgdGhlIHRyYW5zaXRpb24gdG8gZmluaXNoXG4gICAgR0xpYi50aW1lb3V0X2FkZChcbiAgICAgIEdMaWIuUFJJT1JJVFlfREVGQVVMVCxcbiAgICAgIHRoaXMuX2FjdGlvbl9yZXZlYWxlci50cmFuc2l0aW9uX2R1cmF0aW9uLFxuICAgICAgKCkgPT4ge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBBZHcuUHJvcGVydHlBbmltYXRpb25UYXJnZXQubmV3KFxuICAgICAgICAgIHRoaXMuX3RleHQsXG4gICAgICAgICAgXCJib3R0b21fbWFyZ2luXCIsXG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgYW5pbWF0aW9uID0gQWR3LlRpbWVkQW5pbWF0aW9uLm5ldyhcbiAgICAgICAgICB0aGlzLl90ZXh0LFxuICAgICAgICAgIHRoaXMuX3RleHQuYm90dG9tX21hcmdpbixcbiAgICAgICAgICA2MCArXG4gICAgICAgICAgICAoc2VsZWN0ZWQgPyB0aGlzLl9hY3Rpb25fcmV2ZWFsZXIuZ2V0X2FsbG9jYXRlZF9oZWlnaHQoKSA6IDApLFxuICAgICAgICAgIHRoaXMuX2FjdGlvbl9yZXZlYWxlci50cmFuc2l0aW9uX2R1cmF0aW9uLFxuICAgICAgICAgIHRhcmdldCxcbiAgICAgICAgKTtcblxuICAgICAgICBhbmltYXRpb24ucGxheSgpO1xuXG4gICAgICAgIHJldHVybiBHTGliLlNPVVJDRV9SRU1PVkU7XG4gICAgICB9LFxuICAgICk7XG4gIH1cblxuICBjaGVja190YWdzKCkge1xuICAgIGZvciAoY29uc3QgW25hbWUsIHRhZ10gb2YgdGhpcy52aWV3LmFjdGlvbnMpIHtcbiAgICAgIGNvbnN0IGJ1dHRvbiA9XG4gICAgICAgIHRoaXNbYF8ke25hbWV9X2J1dHRvbmAgYXMga2V5b2YgdHlwZW9mIHRoaXNdIGFzIEd0ay5Ub2dnbGVCdXR0b247XG4gICAgICBjb25zdCBhY3RpdmUgPSB0aGlzLnZpZXcuaGFzX3RhZyh0YWcpICE9PSBmYWxzZTtcbiAgICAgIGlmIChhY3RpdmUgPT09IGJ1dHRvbi5hY3RpdmUpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBidXR0b24uYWN0aXZlID0gYWN0aXZlO1xuICAgIH1cbiAgfVxuXG4gIGFkZF9hY3Rpb25zKCkge1xuICAgIGNvbnN0IGRlbGV0ZV8gPSBHaW8uU2ltcGxlQWN0aW9uLm5ldyhcImRlbGV0ZVwiLCBudWxsKTtcbiAgICBkZWxldGVfLmNvbm5lY3QoXCJhY3RpdmF0ZVwiLCAoKSA9PiB0aGlzLmRlbGV0ZSgpKTtcbiAgICB0aGlzLmFkZF9hY3Rpb24oZGVsZXRlXyk7XG5cbiAgICBmb3IgKGNvbnN0IFtuYW1lLCB0YWddIG9mIHRoaXMudmlldy5hY3Rpb25zKSB7XG4gICAgICBjb25zdCBhY3Rpb24gPSBHaW8uU2ltcGxlQWN0aW9uLm5ldyhuYW1lLCBudWxsKTtcbiAgICAgIGFjdGlvbi5jb25uZWN0KFwiYWN0aXZhdGVcIiwgKCkgPT4gdGhpcy52aWV3LmFwcGx5X3RhZyh0YWcpKTtcbiAgICAgIHRoaXMuYWRkX2FjdGlvbihhY3Rpb24pO1xuICAgIH1cbiAgfVxuXG4gIHNldF9zdHlsZShzdHlsZTogU3R5bGUsIGlzX2luaXQgPSBmYWxzZSkge1xuICAgIGZvciAoY29uc3QgcyBvZiB0aGlzLl9jb250YWluZXIuZ2V0X2Nzc19jbGFzc2VzKCkpIHtcbiAgICAgIGlmIChzLnN0YXJ0c1dpdGgoXCJzdHlsZS1cIikgJiYgcyAhPT0gYHN0eWxlLXNwZWNpZml0eWApIHtcbiAgICAgICAgdGhpcy5fY29udGFpbmVyLnJlbW92ZV9jc3NfY2xhc3Mocyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fY29udGFpbmVyLmFkZF9jc3NfY2xhc3MoYHN0eWxlLSR7U3R5bGVbc3R5bGVdfWApO1xuXG4gICAgaWYgKCFpc19pbml0KSB0aGlzLm5vdGUubW9kaWZpZWRfZGF0ZSA9IG5ldyBEYXRlKCk7XG4gIH1cblxuICBkZWxldGUoKSB7XG4gICAgY29uZmlybV9kZWxldGUodGhpcywgKCkgPT4ge1xuICAgICAgdGhpcy5kZWxldGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuZW1pdChcImRlbGV0ZWRcIiwgdGhpcy5ub3RlLnV1aWQpO1xuICAgICAgY29uc29sZS5sb2coXCJlbWl0dGVkIGRlbGV0ZWRcIik7XG4gICAgfSk7XG4gIH1cbn1cbiIsICIvKiBNSVQgTGljZW5zZVxuICpcbiAqIENvcHlyaWdodCAoYykgMjAyMyBBbmdlbG8gVmVybGFpbiwgQ2hyaXMgRGF2aXNcbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gKiBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAqIFNPRlRXQVJFLlxuICpcbiAqIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBNSVRcbiAqL1xuXG4vLyBBZGFwdGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL3Nvbm55cC90cm9sbC9ibG9iLzYzMzkyYTU3MzkyZmI4ZWQ5NDRlODU5MjY5YTM3NTFmNjQ5ZjY0ZWMvc3JjL3dpZGdldHMvVGhlbWVTZWxlY3Rvci5qc1xuXG5pbXBvcnQgR09iamVjdCBmcm9tIFwiZ2k6Ly9HT2JqZWN0XCI7XG5pbXBvcnQgR3RrIGZyb20gXCJnaTovL0d0az92ZXJzaW9uPTQuMFwiO1xuaW1wb3J0IEdkayBmcm9tIFwiZ2k6Ly9HZGs/dmVyc2lvbj00LjBcIjtcblxuaW1wb3J0IHsgU3R5bGUsIFN0eWxlTmFtZXMsIHN0eWxlcyB9IGZyb20gXCIuL3V0aWwuanNcIjtcblxuY29uc3QgeyB2cHJpbnRmIH0gPSBpbXBvcnRzLmZvcm1hdDtcblxubGV0IHByb3ZpZGVyOiBHdGsuQ3NzUHJvdmlkZXIgfCBudWxsID0gbnVsbDtcblxuY2xhc3MgU3R5bGVCdXR0b24gZXh0ZW5kcyBHdGsuQ2hlY2tCdXR0b24ge1xuICBzdHlsZTogU3R5bGU7XG5cbiAgY29uc3RydWN0b3Ioc3R5bGU6IFN0eWxlLCBncm91cD86IEd0ay5DaGVja0J1dHRvbikge1xuICAgIGNvbnN0IHN0eWxlX25hbWUgPSBTdHlsZVtzdHlsZV07XG4gICAgY29uc3QgZGlzcGxheV9uYW1lID0gU3R5bGVOYW1lcy5nZXQoc3R5bGUpITtcblxuICAgIHN1cGVyKHtcbiAgICAgIC8vIGZvY3VzX29uX2NsaWNrOiBmYWxzZSxcbiAgICAgIHRvb2x0aXBfdGV4dDogdnByaW50ZihfKFwiU3dpdGNoIHRvICVzIHN0eWxlXCIpLCBbZGlzcGxheV9uYW1lXSksXG4gICAgICB3aWR0aF9yZXF1ZXN0OiA0NCxcbiAgICAgIGhlaWdodF9yZXF1ZXN0OiA0NCxcbiAgICAgIGhleHBhbmQ6IHRydWUsXG4gICAgICBoYWxpZ246IEd0ay5BbGlnbi5DRU5URVIsXG4gICAgfSk7XG5cbiAgICBpZiAoZ3JvdXApIHtcbiAgICAgIHRoaXMuc2V0X2dyb3VwKGdyb3VwKTtcbiAgICB9XG5cbiAgICB0aGlzLnN0eWxlID0gc3R5bGU7XG5cbiAgICB0aGlzLnNldF9jc3NfY2xhc3NlcyhbXG4gICAgICAuLi50aGlzLmNzc19jbGFzc2VzLFxuICAgICAgYHN0eWxlLXNlbGVjdG9yYCxcbiAgICAgIGBzdHlsZS0ke3N0eWxlX25hbWV9YCxcbiAgICBdKTtcbiAgfVxuXG4gIHN0YXRpYyB7XG4gICAgR09iamVjdC5yZWdpc3RlckNsYXNzKHt9LCB0aGlzKTtcbiAgfVxufVxuXG5jb25zdCBwcm9wcyA9IHtcbiAgb3JpZW50YXRpb246IEd0ay5PcmllbnRhdGlvbi5IT1JJWk9OVEFMLFxuICBzcGFjaW5nOiAxMixcbiAgaGV4cGFuZDogdHJ1ZSxcbn07XG5cbmV4cG9ydCBjbGFzcyBTdHlsZVNlbGVjdG9yIGV4dGVuZHMgR3RrLkJveCB7XG4gIGJveDEgPSBuZXcgR3RrLkJveChwcm9wcyk7XG4gIGJveDIgPSBuZXcgR3RrLkJveChwcm9wcyk7XG4gIGJveCA9IG5ldyBHdGsuQm94KHtcbiAgICBvcmllbnRhdGlvbjogR3RrLk9yaWVudGF0aW9uLlZFUlRJQ0FMLFxuICAgIHNwYWNpbmc6IDEyLFxuICB9KTtcblxuICBwcml2YXRlIF9zdHlsZTogU3R5bGU7XG5cbiAgZ2V0IHN0eWxlKCkge1xuICAgIHJldHVybiB0aGlzLl9zdHlsZTtcbiAgfVxuXG4gIHNldCBzdHlsZShzdHlsZTogU3R5bGUpIHtcbiAgICBpZiAodGhpcy5fc3R5bGUgPT09IHN0eWxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fc3R5bGUgPSBzdHlsZTtcbiAgICB0aGlzLm5vdGlmeShcInN0eWxlXCIpO1xuICAgIHRoaXMuZW1pdChcInN0eWxlLWNoYW5nZWRcIiwgc3R5bGUpO1xuICB9XG5cbiAgY29uc3RydWN0b3IocGFyYW1zOiB7IHN0eWxlPzogU3R5bGUgfSA9IHt9KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuYm94LmFwcGVuZCh0aGlzLmJveDEpO1xuICAgIHRoaXMuYm94LmFwcGVuZCh0aGlzLmJveDIpO1xuXG4gICAgdGhpcy5hcHBlbmQodGhpcy5ib3gpO1xuXG4gICAgdGhpcy5fc3R5bGUgPSB0aGlzLnN0eWxlID0gcGFyYW1zLnN0eWxlID8/IFN0eWxlLnllbGxvdztcbiAgICB0aGlzLmJ1aWxkX3N0eWxlcygpO1xuICAgIHRoaXMuaGV4cGFuZCA9IHRydWU7XG5cbiAgICBpZiAoIXByb3ZpZGVyKSB7XG4gICAgICBwcm92aWRlciA9IG5ldyBHdGsuQ3NzUHJvdmlkZXIoKTtcbiAgICAgIHByb3ZpZGVyLmxvYWRfZnJvbV9yZXNvdXJjZShcbiAgICAgICAgXCIvY29tL3ZpeGFsaWVuL3N0aWNreS9zdHlsZS1zZWxlY3Rvci5jc3NcIixcbiAgICAgICk7XG4gICAgICBHdGsuU3R5bGVDb250ZXh0LmFkZF9wcm92aWRlcl9mb3JfZGlzcGxheShcbiAgICAgICAgR2RrLkRpc3BsYXkuZ2V0X2RlZmF1bHQoKSEsXG4gICAgICAgIHByb3ZpZGVyLFxuICAgICAgICBHdGsuU1RZTEVfUFJPVklERVJfUFJJT1JJVFlfQVBQTElDQVRJT04sXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGJ1aWxkX3N0eWxlcygpIHtcbiAgICBsZXQgZ3JvdXA6IEd0ay5DaGVja0J1dHRvbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICAgIHN0eWxlcy5mb3JFYWNoKChzdHlsZSwgaSkgPT4ge1xuICAgICAgY29uc3QgYnV0dG9uID0gbmV3IFN0eWxlQnV0dG9uKHN0eWxlLCBncm91cCk7XG4gICAgICBidXR0b24uYWN0aXZlID0gc3R5bGUgPT09IHRoaXMuc3R5bGU7XG4gICAgICBidXR0b24uY29ubmVjdChcInRvZ2dsZWRcIiwgKCkgPT4ge1xuICAgICAgICBpZiAoYnV0dG9uLmFjdGl2ZSkge1xuICAgICAgICAgIHRoaXMuc3R5bGUgPSBzdHlsZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpZiAoIWdyb3VwKSB7XG4gICAgICAgIGdyb3VwID0gYnV0dG9uO1xuICAgICAgfVxuXG4gICAgICAoaSA8IDQgPyB0aGlzLmJveDEgOiB0aGlzLmJveDIpLmFwcGVuZChidXR0b24pO1xuICAgIH0pO1xuICB9XG5cbiAgc3RhdGljIHtcbiAgICBHT2JqZWN0LnJlZ2lzdGVyQ2xhc3Moe1xuICAgICAgQ3NzTmFtZTogXCJzdHlsZXNlbGVjdG9yXCIsXG4gICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgIHN0eWxlOiBHT2JqZWN0LlBhcmFtU3BlYy5zdHJpbmcoXG4gICAgICAgICAgXCJzdHlsZVwiLFxuICAgICAgICAgIFwiU3R5bGVcIixcbiAgICAgICAgICBcIlRoZSBjdXJyZW50IHN0eWxlXCIsXG4gICAgICAgICAgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSxcbiAgICAgICAgICBcIndpbmRvd1wiLFxuICAgICAgICApLFxuICAgICAgfSxcbiAgICAgIFNpZ25hbHM6IHtcbiAgICAgICAgXCJzdHlsZS1jaGFuZ2VkXCI6IHtcbiAgICAgICAgICBwYXJhbV90eXBlczogW0dPYmplY3QuVFlQRV9VSU5UXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSwgdGhpcyk7XG4gIH1cbn1cbiIsICJpbXBvcnQgR09iamVjdCBmcm9tIFwiZ2k6Ly9HT2JqZWN0XCI7XG5pbXBvcnQgR3RrIGZyb20gXCJnaTovL0d0az92ZXJzaW9uPTQuMFwiO1xuaW1wb3J0IEFkdyBmcm9tIFwiZ2k6Ly9BZHdcIjtcbmltcG9ydCBHaW8gZnJvbSBcImdpOi8vR2lvXCI7XG5pbXBvcnQgeyBzZXR0aW5ncywgU0VUVElOR1MgfSBmcm9tIFwiLi91dGlsLmpzXCI7XG5cbmV4cG9ydCBjbGFzcyBQcmVmZXJlbmNlc1dpbmRvdyBleHRlbmRzIEFkdy5QcmVmZXJlbmNlc1dpbmRvdyB7XG4gIHN0YXRpYyB7XG4gICAgR09iamVjdC5yZWdpc3RlckNsYXNzKFxuICAgICAge1xuICAgICAgICBHVHlwZU5hbWU6IFwiUHJlZmVyZW5jZXNXaW5kb3dcIixcbiAgICAgICAgVGVtcGxhdGU6IFwicmVzb3VyY2U6Ly8vY29tL3ZpeGFsaWVuL3N0aWNreS91aS9wcmVmZXJlbmNlcy51aVwiLFxuICAgICAgICBJbnRlcm5hbENoaWxkcmVuOiBbXCJub3Rlc19wYXRoX3Jvd1wiLCBcIm5vdGVzX3BhdGhfYnV0dG9uXCJdLFxuICAgICAgfSxcbiAgICAgIHRoaXMsXG4gICAgKTtcbiAgfVxuXG4gIGRlY2xhcmUgX25vdGVzX3BhdGhfcm93OiBBZHcuQWN0aW9uUm93O1xuICBkZWNsYXJlIF9ub3Rlc19wYXRoX2J1dHRvbjogR3RrLkJ1dHRvbjtcblxuICBjb25zdHJ1Y3RvcihwYXJhbXMgPSB7fSkge1xuICAgIHN1cGVyKHBhcmFtcyk7XG5cbiAgICB0aGlzLnVwZGF0ZV9ub3Rlc19wYXRoX3N1YnRpdGxlKCk7XG5cbiAgICB0aGlzLl9ub3Rlc19wYXRoX2J1dHRvbi5jb25uZWN0KFwiY2xpY2tlZFwiLCAoKSA9PiB7XG4gICAgICBjb25zdCBkaWFsb2cgPSBuZXcgR3RrLkZpbGVEaWFsb2coe1xuICAgICAgICB0aXRsZTogXyhcIlNlbGVjdCBOb3RlcyBEaXJlY3RvcnlcIiksXG4gICAgICB9KTtcblxuICAgICAgZGlhbG9nLnNlbGVjdF9mb2xkZXIodGhpcywgbnVsbCwgKGQsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmICghZCkgcmV0dXJuO1xuICAgICAgICAgIGNvbnN0IGZpbGUgPSBkLnNlbGVjdF9mb2xkZXJfZmluaXNoKHJlcyk7XG4gICAgICAgICAgaWYgKGZpbGUpIHtcbiAgICAgICAgICAgIHNldHRpbmdzLnNldF9zdHJpbmcoXCJub3Rlcy1wYXRoXCIsIGZpbGUuZ2V0X3BhdGgoKSB8fCBcIlwiKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlX25vdGVzX3BhdGhfc3VidGl0bGUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGUgYXMgYW55KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICB1cGRhdGVfbm90ZXNfcGF0aF9zdWJ0aXRsZSgpIHtcbiAgICBjb25zdCBwYXRoID0gc2V0dGluZ3MuZ2V0X3N0cmluZyhcIm5vdGVzLXBhdGhcIik7XG4gICAgaWYgKHBhdGgpIHtcbiAgICAgIHRoaXMuX25vdGVzX3BhdGhfcm93LnNldF9zdWJ0aXRsZShwYXRoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbm90ZXNfcGF0aF9yb3cuc2V0X3N1YnRpdGxlKF8oXCJEZWZhdWx0XCIpKTtcbiAgICB9XG4gIH1cbn1cbiIsICIvKiBNSVQgTGljZW5zZVxuICpcbiAqIENvcHlyaWdodCAoYykgMjAyMyBDaHJpcyBEYXZpc1xuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbiAqIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuICogU09GVFdBUkUuXG4gKlxuICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IE1JVFxuICovXG5cbmltcG9ydCB7IEFwcGxpY2F0aW9uIH0gZnJvbSBcIi4vYXBwbGljYXRpb24uanNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIG1haW4oYXJndjogc3RyaW5nW10pOiBudW1iZXIge1xuICByZXR1cm4gbmV3IEFwcGxpY2F0aW9uKCkucnVuKGFyZ3YpO1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQXlCQSxPQUFPQSxjQUFhO0FBQ3BCLE9BQU9DLFVBQVM7QUFDaEIsT0FBT0MsVUFBUztBQUNoQixPQUFPQyxXQUFVO0FBQ2pCLE9B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RSxpQkFBSyxXQUFMLG1CQUFhLGlCQUFpQixLQUFNLE1BQU07QUFDMUMsYUFBTztBQUFBLElBQ1QsQ0FBQztBQUVELFdBQU8sUUFBUSxXQUFXLENBQUNGLElBQUdHLFVBQVM7QUFDckMsV0FBSyxZQUFZQSxLQUFJO0FBQUEsSUFDdkIsQ0FBQztBQUVELFFBQUksS0FBSyxTQUFTO0FBQU8sV0FBSyxPQUFPO0FBRXJDLFdBQU8sUUFBUTtBQUFBLEVBQ2pCO0FBQUEsRUFFQSxnQkFBZ0I7QUFDZCxVQUFNLGNBQWM7QUFFcEIsVUFBTSxnQkFBZ0JQLEtBQUksYUFBYSxZQUFZO0FBQ25ELGFBQVMsaUJBQWlCO0FBQ3hCLFlBQU0sZUFBZSxTQUFTLFFBQVEsY0FBYztBQUNwRCxvQkFBYyxpQkFBaUIsWUFBWTtBQUFBLElBQzdDO0FBQ0EsbUJBQWU7QUFDZixhQUFTLFFBQVEseUJBQXlCLGNBQWM7QUFBQSxFQUMxRDtBQUNGO0FBNWdCTyxJQUFNLGNBQU47QUFBQSxDQUlMLE1BQU87QUFDTCxFQUFBUSxTQUFRLGNBQWMsWUFBSTtBQUM1Qjs7O0FZdkJLLFNBQVMsS0FBSyxNQUF3QjtBQUMzQyxTQUFPLElBQUksWUFBWSxFQUFFLElBQUksSUFBSTtBQUNuQzsiLAogICJuYW1lcyI6IFsiR09iamVjdCIsICJHaW8iLCAiQWR3IiwgIkdMaWIiLCAiR3RrIiwgIkdkayIsICJHT2JqZWN0IiwgIkd0ayIsICJBZHciLCAiR09iamVjdCIsICJHdGsiLCAiR0xpYiIsICJTdHlsZSIsICJHT2JqZWN0IiwgIkFkdyIsICJuZXh0U3RhdGUiLCAic2NoZW1lIiwgInByb3BzIiwgIkFkdyIsICJHT2JqZWN0IiwgImNoYXJzIiwgIkd0ayIsICJHTGliIiwgIkdPYmplY3QiLCAiR09iamVjdCIsICJHdGsiLCAiQWR3IiwgInByb3ZpZGVyIiwgIkFkdyIsICJHdGsiLCAiXyIsICJjYXJkIiwgIkdPYmplY3QiLCAiR2lvIiwgIkdMaWIiLCAiR2lvIiwgIkdMaWIiLCAiXyIsICJub3RlIiwgIkdPYmplY3QiLCAiQWR3IiwgIkdpbyIsICJHTGliIiwgIkdPYmplY3QiLCAiR3RrIiwgIkdkayIsICJHdGsiLCAiR09iamVjdCIsICJHZGsiLCAiQWR3IiwgIkdPYmplY3QiLCAiXyIsICJHTGliIiwgIkdpbyIsICJHT2JqZWN0IiwgIkd0ayIsICJBZHciLCAiQWR3IiwgIkd0ayIsICJHT2JqZWN0IiwgIkFkdyIsICJHaW8iLCAiR0xpYiIsICJHdGsiLCAiXyIsICJHZGsiLCAid2luZG93IiwgInV1aWQiLCAiR09iamVjdCJdCn0K
