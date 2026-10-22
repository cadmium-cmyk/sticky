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
function createTokenClass(type, props) {
  class Token extends MultiToken {
    constructor(value, tokens) {
      super(value, tokens);
      this.t = type;
    }
  }
  for (const p in props) {
    Token.prototype[p] = props[p];
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
    const provider = new Gtk3.CssProvider();
    provider.load_from_resource("/com/vixalien/sticky/theme-selector.css");
    Gtk3.StyleContext.add_provider_for_display(
      Gdk.Display.get_default(),
      provider,
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
export {
  StickyNotes
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL25vdGVzLnRzIiwgIi4uL3NyYy9jYXJkLnRzIiwgIi4uL3NyYy91dGlsLnRzIiwgIi4uL3NyYy92aWV3LnRzIiwgIi4uL25vZGVfbW9kdWxlcy9saW5raWZ5anMvZGlzdC9saW5raWZ5LmVzLmpzIiwgIi4uL3NyYy90aGVtZXNlbGVjdG9yLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKiBNSVQgTGljZW5zZVxuICpcbiAqIENvcHlyaWdodCAoYykgMjAyMyBBbmdlbG8gVmVybGFpbiwgQ2hyaXMgRGF2aXNcbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gKiBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAqIFNPRlRXQVJFLlxuICpcbiAqIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBNSVRcbiAqL1xuXG5pbXBvcnQgR09iamVjdCBmcm9tIFwiZ2k6Ly9HT2JqZWN0XCI7XG5pbXBvcnQgR3RrIGZyb20gXCJnaTovL0d0az92ZXJzaW9uPTQuMFwiO1xuaW1wb3J0IEFkdyBmcm9tIFwiZ2k6Ly9BZHdcIjtcblxuaW1wb3J0IHR5cGUgeyBBcHBsaWNhdGlvbiB9IGZyb20gXCIuL2FwcGxpY2F0aW9uLmpzXCI7XG5pbXBvcnQgeyBTdGlja3lOb3RlQ2FyZCB9IGZyb20gXCIuL2NhcmQuanNcIjtcbmltcG9ydCB7IE5vdGUsIHNldHRpbmdzIH0gZnJvbSBcIi4vdXRpbC5qc1wiO1xuXG5pbXBvcnQgeyBUaGVtZVNlbGVjdG9yIH0gZnJvbSBcIi4vdGhlbWVzZWxlY3Rvci5qc1wiO1xuXG5leHBvcnQgY2xhc3MgU3RpY2t5Tm90ZXMgZXh0ZW5kcyBBZHcuQXBwbGljYXRpb25XaW5kb3cge1xuICBzdGF0aWMge1xuICAgIEdPYmplY3QucmVnaXN0ZXJDbGFzcyhcbiAgICAgIHtcbiAgICAgICAgVGVtcGxhdGU6IFwicmVzb3VyY2U6Ly8vY29tL3ZpeGFsaWVuL3N0aWNreS91aS9ub3Rlcy51aVwiLFxuICAgICAgICBHVHlwZU5hbWU6IFwiU3RpY2t5Tm90ZXNcIixcbiAgICAgICAgSW50ZXJuYWxDaGlsZHJlbjogW1xuICAgICAgICAgIFwic2VhcmNoXCIsXG4gICAgICAgICAgXCJub3Rlc19ib3hcIixcbiAgICAgICAgICBcIm5vX25vdGVzXCIsXG4gICAgICAgICAgXCJub19yZXN1bHRzXCIsXG4gICAgICAgICAgXCJzZWFyY2hfZW50cnlcIixcbiAgICAgICAgICBcInNjcm9sbGVkXCIsXG4gICAgICAgICAgXCJtZW51X2J1dHRvblwiLFxuICAgICAgICAgIFwic3RhY2tcIixcbiAgICAgICAgXSxcbiAgICAgICAgU2lnbmFsczoge1xuICAgICAgICAgIFwibm90ZS1hY3RpdmF0ZWRcIjoge1xuICAgICAgICAgICAgcGFyYW1fdHlwZXM6IFtHT2JqZWN0LlRZUEVfU1RSSU5HXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGRlbGV0ZWQ6IHtcbiAgICAgICAgICAgIHBhcmFtX3R5cGVzOiBbR09iamVjdC5UWVBFX1NUUklOR10sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICB0aGlzLFxuICAgICk7XG4gIH1cblxuICBkZWNsYXJlIF9zZWFyY2g6IEd0ay5Cb3g7XG4gIGRlY2xhcmUgX3NlYXJjaF9lbnRyeTogR3RrLlNlYXJjaEVudHJ5O1xuICBkZWNsYXJlIF9ub3Rlc19ib3g6IEd0ay5MaXN0VmlldztcbiAgZGVjbGFyZSBfbm9fbm90ZXM6IEFkdy5TdGF0dXNQYWdlO1xuICBkZWNsYXJlIF9ub19yZXN1bHRzOiBBZHcuU3RhdHVzUGFnZTtcbiAgZGVjbGFyZSBfc2Nyb2xsZWQ6IEd0ay5TY3JvbGxlZFdpbmRvdztcbiAgZGVjbGFyZSBfbWVudV9idXR0b246IEd0ay5NZW51QnV0dG9uO1xuICBkZWNsYXJlIF9zdGFjazogR3RrLlN0YWNrO1xuXG4gIGNhcmRzOiBTdGlja3lOb3RlQ2FyZFtdID0gW107XG5cbiAgb2xkX3F1ZXJ5ID0gXCJcIjtcblxuICBsYXN0X21vZGVsOiBHdGsuU2VsZWN0aW9uTW9kZWw8Tm90ZT47XG4gIHNvcnRlcjogR3RrLlNvcnRlcjtcblxuICBnZXQgcXVlcnkoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NlYXJjaF9lbnRyeS50ZXh0LnRvTG93ZXJDYXNlKCk7XG4gIH1cblxuICBzZXR1cF9jYihfZmFjdG9yeTogR3RrLkxpc3RJdGVtRmFjdG9yeSwgbGlzdF9pdGVtOiBHdGsuTGlzdEl0ZW0pIHtcbiAgICBjb25zdCBjYXJkID0gbmV3IFN0aWNreU5vdGVDYXJkKHRoaXMpO1xuXG4gICAgbGlzdF9pdGVtLnNldF9jaGlsZChjYXJkKTtcbiAgfVxuXG4gIGJpbmRfY2IoX2ZhY3Rvcnk6IEd0ay5MaXN0SXRlbUZhY3RvcnksIGxpc3RfaXRlbTogR3RrLkxpc3RJdGVtKSB7XG4gICAgY29uc3QgY2FyZCA9IGxpc3RfaXRlbS5nZXRfY2hpbGQoKSBhcyBTdGlja3lOb3RlQ2FyZDtcbiAgICBjb25zdCBub3RlID0gbGlzdF9pdGVtLmdldF9pdGVtKCkgYXMgTm90ZTtcblxuICAgIGNhcmQuc2hvd192aXNpYmxlX2ltYWdlID0gbm90ZS5vcGVuO1xuICAgIGNhcmQuY29ubmVjdChcImRlbGV0ZWRcIiwgKF8pID0+IHRoaXMuZW1pdChcImRlbGV0ZWRcIiwgbm90ZS51dWlkKSk7XG5cbiAgICBjYXJkLm5vdGUgPSBub3RlO1xuXG4gICAgbm90ZS5jb25uZWN0KFwibm90aWZ5Ojptb2RpZmllZFwiLCAoKSA9PiB7XG4gICAgICBjYXJkLnVwZGF0ZV9tb2RpZmllZF9sYWJlbCgpO1xuICAgICAgdGhpcy5zb3J0ZXIuY2hhbmdlZChHdGsuU29ydGVyQ2hhbmdlLkRJRkZFUkVOVCk7XG4gICAgfSk7XG5cbiAgICBub3RlLmNvbm5lY3QoXCJub3RpZnk6Om9wZW5cIiwgKF8pID0+IHtcbiAgICAgIGNhcmQuc2hvd192aXNpYmxlX2ltYWdlID0gbm90ZS5vcGVuO1xuICAgIH0pO1xuXG4gICAgbm90ZS5jb25uZWN0KFwibm90aWZ5OjpzdHlsZVwiLCAoKSA9PiB7XG4gICAgICBjYXJkLnNldF9zdHlsZShub3RlLnN0eWxlKTtcbiAgICB9KTtcbiAgfVxuXG4gIHVuYmluZF9jYihfZmFjdG9yeTogR3RrLkxpc3RJdGVtRmFjdG9yeSwgX2xpc3RfaXRlbTogR3RrLkxpc3RJdGVtKSB7XG4gICAgY29uc3QgY2FyZCA9IG5ldyBTdGlja3lOb3RlQ2FyZCh0aGlzKTtcblxuICAgIGNhcmQudmlldy5yZW1vdmVfbGlzdGVuZXJzKCk7XG4gIH1cblxuICBhY3RpdmF0ZV9jYihsaXN0OiBHdGsuTGlzdFZpZXcsIHBvc2l0aW9uOiBudW1iZXIpIHtcbiAgICBjb25zdCBpdGVtID0gbGlzdC5nZXRfbW9kZWwoKT8uZ2V0X2l0ZW0ocG9zaXRpb24pIGFzIE5vdGUgfCB1bmRlZmluZWQ7XG4gICAgaWYgKCFpdGVtKSByZXR1cm47XG4gICAgdGhpcy5lbWl0KFwibm90ZS1hY3RpdmF0ZWRcIiwgaXRlbS51dWlkKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHBhcmFtczogUGFydGlhbDxHdGsuV2luZG93LkNvbnN0cnVjdG9yUHJvcHM+LFxuICApIHtcbiAgICBzdXBlcihwYXJhbXMpO1xuXG4gICAgdGhpcy5kZWZhdWx0X2hlaWdodCA9IHNldHRpbmdzLmdldF9pbnQoXCJkZWZhdWx0LWhlaWdodFwiKTtcbiAgICB0aGlzLmRlZmF1bHRfd2lkdGggPSBzZXR0aW5ncy5nZXRfaW50KFwiZGVmYXVsdC13aWR0aFwiKTtcblxuICAgIHRoaXMuY29ubmVjdChcImNsb3NlLXJlcXVlc3RcIiwgKCkgPT4ge1xuICAgICAgc2V0dGluZ3Muc2V0X2ludChcImRlZmF1bHQtaGVpZ2h0XCIsIHRoaXMuZ2V0X2hlaWdodCgpKTtcbiAgICAgIHNldHRpbmdzLnNldF9pbnQoXCJkZWZhdWx0LXdpZHRoXCIsIHRoaXMuZ2V0X3dpZHRoKCkpO1xuICAgIH0pO1xuXG4gICAgLy8gbWFrZSBpdCB0cmFuc3BhcmVudFxuICAgIHRoaXMuX25vdGVzX2JveC5yZW1vdmVfY3NzX2NsYXNzKFwidmlld1wiKTtcblxuICAgIGNvbnN0IGZhY3RvcnkgPSBuZXcgR3RrLlNpZ25hbExpc3RJdGVtRmFjdG9yeSgpO1xuICAgIGZhY3RvcnkuY29ubmVjdChcInNldHVwXCIsIHRoaXMuc2V0dXBfY2IuYmluZCh0aGlzKSk7XG4gICAgZmFjdG9yeS5jb25uZWN0KFwiYmluZFwiLCB0aGlzLmJpbmRfY2IuYmluZCh0aGlzKSk7XG4gICAgZmFjdG9yeS5jb25uZWN0KFwidW5iaW5kXCIsIHRoaXMudW5iaW5kX2NiLmJpbmQodGhpcykpO1xuXG4gICAgY29uc3QgZmlsdGVyID0gR3RrLkN1c3RvbUZpbHRlci5uZXcoKG5vdGUpID0+IHtcbiAgICAgIGNvbnN0IHF1ZXJ5ID0gdGhpcy5xdWVyeTtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSAobm90ZSBhcyBOb3RlKS5jb250ZW50LnRvTG93ZXJDYXNlKCk7XG4gICAgICBpZiAoIXF1ZXJ5LnJlcGxhY2UoL1xccy9nLCBcIlwiKSkgcmV0dXJuIHRydWU7XG4gICAgICByZXR1cm4gY29udGVudC5pbmNsdWRlcyhxdWVyeSk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBmaWx0ZXJfbW9kZWwgPSBHdGsuRmlsdGVyTGlzdE1vZGVsLm5ldyhcbiAgICAgICh0aGlzLmFwcGxpY2F0aW9uIGFzIEFwcGxpY2F0aW9uKS5ub3Rlc19saXN0LFxuICAgICAgZmlsdGVyLFxuICAgICk7XG5cbiAgICB0aGlzLnNvcnRlciA9IEd0ay5DdXN0b21Tb3J0ZXIubmV3KChub3RlMSwgbm90ZTIpID0+IHtcbiAgICAgIGNvbnN0IGRhdGUxID0gKG5vdGUxIGFzIE5vdGUpLm1vZGlmaWVkO1xuICAgICAgY29uc3QgZGF0ZTIgPSAobm90ZTIgYXMgTm90ZSkubW9kaWZpZWQ7XG4gICAgICByZXR1cm4gZGF0ZTIuY29tcGFyZShkYXRlMSk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBzb3J0ZXJfbW9kZWwgPSBHdGsuU29ydExpc3RNb2RlbC5uZXcoZmlsdGVyX21vZGVsLCB0aGlzLnNvcnRlcik7XG5cbiAgICB0aGlzLmxhc3RfbW9kZWwgPSBHdGsuU2luZ2xlU2VsZWN0aW9uLm5ldyhcbiAgICAgIHNvcnRlcl9tb2RlbCxcbiAgICApIGFzIEd0ay5TaW5nbGVTZWxlY3Rpb248Tm90ZT47XG5cbiAgICB0aGlzLmxhc3RfbW9kZWwuY29ubmVjdChcIml0ZW1zLWNoYW5nZWRcIiwgKCkgPT4ge1xuICAgICAgdGhpcy5zZXRfc3RhdHVzKCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9ub3Rlc19ib3guY29ubmVjdChcImFjdGl2YXRlXCIsIHRoaXMuYWN0aXZhdGVfY2IuYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLl9ub3Rlc19ib3guc2V0X2ZhY3RvcnkoZmFjdG9yeSk7XG4gICAgdGhpcy5fbm90ZXNfYm94LnNldF9tb2RlbCh0aGlzLmxhc3RfbW9kZWwpO1xuXG4gICAgdGhpcy5fc2VhcmNoX2VudHJ5LmNvbm5lY3QoXCJzZWFyY2gtY2hhbmdlZFwiLCAoKSA9PiB7XG4gICAgICBjb25zdCBxdWVyeSA9IHRoaXMucXVlcnkudG9Mb3dlckNhc2UoKTtcbiAgICAgIGNvbnN0IG9sZF9xdWVyeSA9IHRoaXMub2xkX3F1ZXJ5LnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgIGlmIChxdWVyeS5pbmNsdWRlcyhvbGRfcXVlcnkpKSB7XG4gICAgICAgIGZpbHRlci5lbWl0KFwiY2hhbmdlZFwiLCBHdGsuRmlsdGVyQ2hhbmdlLk1PUkVfU1RSSUNUKTtcbiAgICAgIH0gZWxzZSBpZiAob2xkX3F1ZXJ5LmluY2x1ZGVzKHF1ZXJ5KSkge1xuICAgICAgICBmaWx0ZXIuZW1pdChcImNoYW5nZWRcIiwgR3RrLkZpbHRlckNoYW5nZS5MRVNTX1NUUklDVCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmaWx0ZXIuZW1pdChcImNoYW5nZWRcIiwgR3RrLkZpbHRlckNoYW5nZS5ESUZGRVJFTlQpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLm9sZF9xdWVyeSA9IHF1ZXJ5O1xuICAgIH0pO1xuXG4gICAgdGhpcy5zZXRfc3RhdHVzKCk7XG5cbiAgICAvLyBQb3BvdmVyIG1lbnUgdGhlbWUgc3dpdGNoZXJcbiAgICBjb25zdCBwb3BvdmVyID0gdGhpcy5fbWVudV9idXR0b24uZ2V0X3BvcG92ZXIoKSBhcyBHdGsuUG9wb3Zlck1lbnU7XG4gICAgcG9wb3Zlci5hZGRfY2hpbGQobmV3IFRoZW1lU2VsZWN0b3IoKSwgXCJ0aGVtZXN3aXRjaGVyXCIpO1xuICB9XG5cbiAgc2V0X3N0YXR1cygpIHtcbiAgICBpZiAodGhpcy5sYXN0X21vZGVsLmdldF9uX2l0ZW1zKCkgPiAwKSB7XG4gICAgICB0aGlzLnNldF92aXNpYmxlX2NoaWxkKHRoaXMuX25vdGVzX2JveCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLnF1ZXJ5KSB7XG4gICAgICAgIHRoaXMuc2V0X3Zpc2libGVfY2hpbGQodGhpcy5fbm9fcmVzdWx0cyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNldF92aXNpYmxlX2NoaWxkKHRoaXMuX25vX25vdGVzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzZXRfbm90ZV92aXNpYmxlKHV1aWQ6IHN0cmluZywgdmlzaWJsZTogYm9vbGVhbikge1xuICAgIGNvbnN0IGNhcmQgPSB0aGlzLmNhcmRzLmZpbmQoKGNhcmQpID0+IGNhcmQubm90ZS51dWlkID09PSB1dWlkKTtcblxuICAgIGlmICghY2FyZCkgcmV0dXJuO1xuXG4gICAgY2FyZC5zaG93X3Zpc2libGVfaW1hZ2UgPSB2aXNpYmxlO1xuICB9XG5cbiAgc2V0X3Zpc2libGVfY2hpbGQoY2hpbGQ6IEd0ay5XaWRnZXQpIHtcbiAgICB0aGlzLl9zZWFyY2gudmlzaWJsZSA9IGNoaWxkID09PSB0aGlzLl9ub3Rlc19ib3ggfHxcbiAgICAgIGNoaWxkID09PSB0aGlzLl9ub19yZXN1bHRzO1xuXG4gICAgdGhpcy5fc3RhY2suc2V0X3Zpc2libGVfY2hpbGQoY2hpbGQpO1xuICB9XG59XG4iLCAiLyogTUlUIExpY2Vuc2VcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMjMgQW5nZWxvIFZlcmxhaW4sIENocmlzIERhdmlzXG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICogY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gKiBTT0ZUV0FSRS5cbiAqXG4gKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogTUlUXG4gKi9cblxuaW1wb3J0IEdPYmplY3QgZnJvbSBcImdpOi8vR09iamVjdFwiO1xuaW1wb3J0IEd0ayBmcm9tIFwiZ2k6Ly9HdGs/dmVyc2lvbj00LjBcIjtcbmltcG9ydCBHTGliIGZyb20gXCJnaTovL0dMaWJcIjtcblxuaW1wb3J0IHsgY29uZmlybV9kZWxldGUsIE5vdGUsIFN0eWxlIH0gZnJvbSBcIi4vdXRpbC5qc1wiO1xuaW1wb3J0IHsgUmVhZG9ubHlTdGlja3lOb3RlIH0gZnJvbSBcIi4vdmlldy5qc1wiO1xuXG5leHBvcnQgY2xhc3MgU3RpY2t5Tm90ZUNhcmQgZXh0ZW5kcyBHdGsuQm94IHtcbiAgc3RhdGljIHtcbiAgICBHT2JqZWN0LnJlZ2lzdGVyQ2xhc3Moe1xuICAgICAgR1R5cGVOYW1lOiBcIlN0aWNreU5vdGVDYXJkXCIsXG4gICAgICBUZW1wbGF0ZTogXCJyZXNvdXJjZTovLy9jb20vdml4YWxpZW4vc3RpY2t5L3VpL2NhcmQudWlcIixcbiAgICAgIEludGVybmFsQ2hpbGRyZW46IFtcbiAgICAgICAgXCJtb2RpZmllZF9sYWJlbFwiLFxuICAgICAgICBcInZpZXdfaW1hZ2VcIixcbiAgICAgICAgXCJkZWxldGVfYnV0dG9uXCIsXG4gICAgICAgIFwic2Nyb2xsZWRcIixcbiAgICAgIF0sXG4gICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgIHV1aWQ6IEdPYmplY3QuUGFyYW1TcGVjLnN0cmluZyhcbiAgICAgICAgICBcInV1aWRcIixcbiAgICAgICAgICBcIlVVSURcIixcbiAgICAgICAgICBcIlRoZSBVVUlEIG9mIHRoZSBub3RlXCIsXG4gICAgICAgICAgR09iamVjdC5QYXJhbUZsYWdzLlJFQURBQkxFLFxuICAgICAgICAgIFwiXCIsXG4gICAgICAgICksXG4gICAgICB9LFxuICAgICAgU2lnbmFsczoge1xuICAgICAgICBkZWxldGVkOiB7fSxcbiAgICAgIH0sXG4gICAgfSwgdGhpcyk7XG4gIH1cblxuICBkZWNsYXJlIF9zY3JvbGxlZDogR3RrLlNjcm9sbGVkV2luZG93O1xuICBkZWNsYXJlIF9tb2RpZmllZF9sYWJlbDogR3RrLkxhYmVsO1xuICBkZWNsYXJlIF92aWV3X2ltYWdlOiBHdGsuSW1hZ2U7XG4gIGRlY2xhcmUgX2RlbGV0ZV9idXR0b246IEd0ay5CdXR0b247XG5cbiAgcHJpdmF0ZSBfbm90ZT86IE5vdGU7XG4gIHZpZXc6IFJlYWRvbmx5U3RpY2t5Tm90ZTtcblxuICBzZXQgc2hvd192aXNpYmxlX2ltYWdlKHZpc2libGU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl92aWV3X2ltYWdlLnZpc2libGUgPSB2aXNpYmxlO1xuICB9XG5cbiAgY29uc3RydWN0b3IocHVibGljIHdpbmRvdzogR3RrLldpbmRvdywgbm90ZT86IE5vdGUpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy52aWV3ID0gbmV3IFJlYWRvbmx5U3RpY2t5Tm90ZShub3RlKTtcbiAgICB0aGlzLnZpZXcuYWRkX2Nzc19jbGFzcyhcImNhcmQtdGV4dC12aWV3XCIpO1xuICAgIHRoaXMudmlldy53cmFwX21vZGUgPSBHdGsuV3JhcE1vZGUuV09SRF9DSEFSO1xuXG4gICAgdGhpcy5fc2Nyb2xsZWQuc2V0X2NoaWxkKHRoaXMudmlldyk7XG4gICAgdGhpcy5fZGVsZXRlX2J1dHRvbi5jb25uZWN0KFwiY2xpY2tlZFwiLCB0aGlzLmRlbGV0ZS5iaW5kKHRoaXMpKTtcblxuICAgIGlmIChub3RlKSB0aGlzLl9ub3RlID0gdGhpcy5ub3RlID0gbm90ZTtcbiAgfVxuXG4gIHNldCBub3RlKG5vdGU6IE5vdGUpIHtcbiAgICBpZiAobm90ZT8uc3R5bGUgIT09IHRoaXMuX25vdGU/LnN0eWxlKSB0aGlzLnNldF9zdHlsZShub3RlLnN0eWxlKTtcblxuICAgIHRoaXMuX25vdGUgPSB0aGlzLnZpZXcubm90ZSA9IG5vdGU7XG5cbiAgICB0aGlzLnVwZGF0ZV9tb2RpZmllZF9sYWJlbCgpO1xuICB9XG5cbiAgZ2V0IHV1aWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX25vdGU/LnV1aWQ7XG4gIH1cblxuICB1cGRhdGVfbW9kaWZpZWRfbGFiZWwoKSB7XG4gICAgY29uc3QgbW9kaWZpZWQgPSB0aGlzLl9ub3RlPy5tb2RpZmllZD8udG9fbG9jYWwoKTtcblxuICAgIGlmICghbW9kaWZpZWQpIHJldHVybjtcblxuICAgIC8vIGlmIGRhdGUgaXMgdG9kYXksIHNob3cgdGltZVxuICAgIC8vIG90aGVyd2lzZSwgc2hvdyBkYXRlXG4gICAgY29uc3QgZm9ybWF0ID1cbiAgICAgIEdMaWIuRGF0ZVRpbWUubmV3X25vd19sb2NhbCgpLmZvcm1hdChcIiVGXCIpID09PSBtb2RpZmllZC5mb3JtYXQoXCIlRlwiKVxuICAgICAgICA/IFwiJVJcIlxuICAgICAgICA6IFwiJUZcIjtcblxuICAgIHRoaXMuX21vZGlmaWVkX2xhYmVsLmxhYmVsID0gbW9kaWZpZWQuZm9ybWF0KGZvcm1hdCkhO1xuICB9XG5cbiAgc2V0X3N0eWxlKHN0eWxlOiBTdHlsZSkge1xuICAgIGZvciAoY29uc3QgcyBvZiB0aGlzLmdldF9jc3NfY2xhc3NlcygpKSB7XG4gICAgICBpZiAocy5zdGFydHNXaXRoKFwic3R5bGUtXCIpICYmIHMgIT09IGBzdHlsZS1zcGVjaWZpdHlgKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlX2Nzc19jbGFzcyhzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmFkZF9jc3NfY2xhc3MoYHN0eWxlLSR7U3R5bGVbc3R5bGVdfWApO1xuICB9XG5cbiAgZGVsZXRlKCkge1xuICAgIGlmICghdGhpcy5fbm90ZSkgcmV0dXJuO1xuICAgIGNvbmZpcm1fZGVsZXRlKHRoaXMud2luZG93LCAoKSA9PiB7XG4gICAgICB0aGlzLmVtaXQoXCJkZWxldGVkXCIpO1xuICAgIH0pO1xuICB9XG59XG4iLCAiLyogTUlUIExpY2Vuc2VcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMjMgQW5nZWxvIFZlcmxhaW4sIENocmlzIERhdmlzXG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICogY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gKiBTT0ZUV0FSRS5cbiAqXG4gKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogTUlUXG4gKi9cblxuaW1wb3J0IEFkdyBmcm9tIFwiZ2k6Ly9BZHdcIjtcbmltcG9ydCBHaW8gZnJvbSBcImdpOi8vR2lvXCI7XG5pbXBvcnQgR0xpYiBmcm9tIFwiZ2k6Ly9HTGliXCI7XG5pbXBvcnQgR09iamVjdCBmcm9tIFwiZ2k6Ly9HT2JqZWN0XCI7XG5pbXBvcnQgR3RrIGZyb20gXCJnaTovL0d0az92ZXJzaW9uPTQuMFwiO1xuXG5HaW8uX3Byb21pc2lmeShcbiAgR2lvLkZpbGUucHJvdG90eXBlLFxuICBcImxvYWRfY29udGVudHNfYXN5bmNcIixcbiAgXCJsb2FkX2NvbnRlbnRzX2ZpbmlzaFwiLFxuKTtcblxuR2lvLl9wcm9taXNpZnkoXG4gIEdpby5GaWxlLnByb3RvdHlwZSxcbiAgXCJyZXBsYWNlX2NvbnRlbnRzX2FzeW5jXCIsXG4gIFwicmVwbGFjZV9jb250ZW50c19maW5pc2hcIixcbik7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVRhZyB7XG4gIG5hbWU6IHN0cmluZztcbiAgc3RhcnQ6IG51bWJlcjtcbiAgZW5kOiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSU5vdGUge1xuICB2OiAxO1xuICB1dWlkOiBzdHJpbmc7XG4gIGNvbnRlbnQ6IHN0cmluZztcbiAgdGl0bGU6IHN0cmluZztcbiAgc3R5bGU6IFN0eWxlO1xuICB0YWdzOiBJVGFnW107XG4gIG1vZGlmaWVkOiBEYXRlO1xuICB3aWR0aDogbnVtYmVyO1xuICBoZWlnaHQ6IG51bWJlcjtcbiAgb3BlbjogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGVudW0gU3R5bGUge1xuICBcInllbGxvd1wiID0gMSxcbiAgXCJwaW5rXCIsXG4gIFwiZ3JlZW5cIixcbiAgXCJwdXJwbGVcIixcbiAgXCJibHVlXCIsXG4gIFwiZ3JheVwiLFxuICBcImNoYXJjb2FsXCIsXG4gIFwid2luZG93XCIsXG59XG5cbmV4cG9ydCBjb25zdCBTdHlsZU5hbWVzID0gbmV3IE1hcChbXG4gIFtTdHlsZS55ZWxsb3csIF8oXCJZZWxsb3dcIildLFxuICBbU3R5bGUucGluaywgXyhcIlBpbmtcIildLFxuICBbU3R5bGUuZ3JlZW4sIF8oXCJHcmVlblwiKV0sXG4gIFtTdHlsZS5wdXJwbGUsIF8oXCJQdXJwbGVcIildLFxuICBbU3R5bGUuYmx1ZSwgXyhcIkJsdWVcIildLFxuICBbU3R5bGUuZ3JheSwgXyhcIkdyYXlcIildLFxuICBbU3R5bGUuY2hhcmNvYWwsIF8oXCJDaGFyY29hbFwiKV0sXG4gIFtTdHlsZS53aW5kb3csIF8oXCJXaW5kb3dcIildLFxuXSk7XG5cbmV4cG9ydCBjb25zdCBzdHlsZXMgPSBPYmplY3QudmFsdWVzKFN0eWxlKS5maWx0ZXIoXG4gIChzdHlsZSkgPT4gdHlwZW9mIHN0eWxlID09PSBcIm51bWJlclwiLFxuKSBhcyBTdHlsZVtdO1xuXG5leHBvcnQgY29uc3Qgc2V0dGluZ3MgPSBuZXcgR2lvLlNldHRpbmdzKHsgc2NoZW1hX2lkOiBcImNvbS52aXhhbGllbi5zdGlja3lcIiB9KTtcblxuY29uc3QgZ2V0X3NldHRpbmdzID0gKCkgPT4gKHtcbiAgREVGQVVMVF9TVFlMRTogc2V0dGluZ3MuZ2V0X2VudW0oXCJkZWZhdWx0LXN0eWxlXCIpIGFzIFN0eWxlLFxuICBERUZBVUxUX1dJRFRIOiBzZXR0aW5ncy5nZXRfaW50KFwiZGVmYXVsdC13aWR0aFwiKSxcbiAgREVGQVVMVF9IRUlHSFQ6IHNldHRpbmdzLmdldF9pbnQoXCJkZWZhdWx0LWhlaWdodFwiKSxcbiAgQ09ORklSTV9ERUxFVEU6IHNldHRpbmdzLmdldF9ib29sZWFuKFwiY29uZmlybS1kZWxldGVcIiksXG4gIE5PVEVTX1BBVEg6IHNldHRpbmdzLmdldF9zdHJpbmcoXCJub3Rlcy1wYXRoXCIpLFxufSk7XG5cbmV4cG9ydCBsZXQgU0VUVElOR1MgPSBnZXRfc2V0dGluZ3MoKTtcblxuc2V0dGluZ3MuY29ubmVjdChcImNoYW5nZWRcIiwgKCkgPT4ge1xuICBTRVRUSU5HUyA9IGdldF9zZXR0aW5ncygpO1xufSk7XG5cbmV4cG9ydCBjbGFzcyBUYWcgZXh0ZW5kcyBHT2JqZWN0Lk9iamVjdCB7XG4gIHN0YXRpYyAkZ3R5cGU6IEdPYmplY3QuR1R5cGU8VGFnPjtcblxuICBuYW1lOiBzdHJpbmc7XG4gIHN0YXJ0OiBudW1iZXI7XG4gIGVuZDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgc3RhcnQ6IG51bWJlciA9IDAsIGVuZDogbnVtYmVyID0gMCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLnN0YXJ0ID0gc3RhcnQ7XG4gICAgdGhpcy5lbmQgPSBlbmQ7XG4gIH1cblxuICBzdGF0aWMge1xuICAgIEdPYmplY3QucmVnaXN0ZXJDbGFzcyh7XG4gICAgICBHVHlwZU5hbWU6IFwiVGFnT2JqZWN0XCIsXG4gICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICBuYW1lOiBHT2JqZWN0LlBhcmFtU3BlYy5zdHJpbmcoXCJuYW1lXCIsIFwiTmFtZVwiLCBcIlRoZSBuYW1lIG9mIHRoZSB0YWdcIiwgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSwgXCJcIiksXG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICBzdGFydDogR09iamVjdC5QYXJhbVNwZWMuaW50KFwic3RhcnRcIiwgXCJTdGFydFwiLCBcIlN0YXJ0aW5nIHBvc2l0aW9uIG9mIHRoZSB0YWdcIiwgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSwgMCwgMTAwLCAwKSxcbiAgICAgICAgLy8gZGVuby1mbXQtaWdub3JlXG4gICAgICAgIGVuZDogR09iamVjdC5QYXJhbVNwZWMuaW50KFwiZW5kXCIsIFwiRW5kXCIsIFwiRW5kaW5nIHBvc2l0aW9uIG9mIHRoZSB0YWdcIiwgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSwgMCwgMTAwLCAwKSxcbiAgICAgIH0sXG4gICAgfSwgdGhpcyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIE5vdGUgZXh0ZW5kcyBHT2JqZWN0Lk9iamVjdCB7XG4gIHByaXZhdGUgc3RhdGljIHRhZ19saXN0X3BzcGVjID0gR09iamVjdC5wYXJhbV9zcGVjX29iamVjdChcbiAgICBcInRhZ19saXN0XCIsXG4gICAgXCJUYWdzXCIsXG4gICAgXCJUYWdzIG9mIHRoZSBub3RlXCIsXG4gICAgR2lvLkxpc3RTdG9yZS4kZ3R5cGUsXG4gICAgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSxcbiAgKTtcblxuICBzdGF0aWMgJGd0eXBlOiBHT2JqZWN0LkdUeXBlPE5vdGU+O1xuXG4gIHY6IDE7XG4gIHV1aWQ6IHN0cmluZztcbiAgY29udGVudDogc3RyaW5nO1xuICB0aXRsZTogc3RyaW5nO1xuICBzdHlsZTogU3R5bGU7XG4gIHRhZ19saXN0OiBHaW8uTGlzdFN0b3JlPFRhZz47XG4gIG1vZGlmaWVkOiBHTGliLkRhdGVUaW1lO1xuICB3aWR0aDogbnVtYmVyO1xuICBoZWlnaHQ6IG51bWJlcjtcbiAgb3BlbjogYm9vbGVhbjtcblxuICBnZXQgdGFncygpIHtcbiAgICBjb25zdCBpdGVtcyA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnRhZ19saXN0LmdldF9uX2l0ZW1zKCk7IGkrKykge1xuICAgICAgY29uc3QgdGFnID0gdGhpcy50YWdfbGlzdC5nZXRfaXRlbShpKSE7XG4gICAgICBpdGVtcy5wdXNoKHtcbiAgICAgICAgbmFtZTogdGFnLm5hbWUsXG4gICAgICAgIHN0YXJ0OiB0YWcuc3RhcnQsXG4gICAgICAgIGVuZDogdGFnLmVuZCxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBpdGVtcztcbiAgfVxuXG4gIHNldCB0YWdzKHRhZ3M6IElOb3RlW1widGFnc1wiXSkge1xuICAgIHRoaXMudGFnX2xpc3QucmVtb3ZlX2FsbCgpO1xuXG4gICAgZm9yIChjb25zdCB0YWcgb2YgdGFncykge1xuICAgICAgY29uc3QgdGFnX29iamVjdCA9IG5ldyBUYWcodGFnLm5hbWUsIHRhZy5zdGFydCwgdGFnLmVuZCk7XG4gICAgICB0aGlzLnRhZ19saXN0LmFwcGVuZCh0YWdfb2JqZWN0KTtcbiAgICB9XG5cbiAgICB0aGlzLmVtaXQoXCJub3RpZnk6OnRhZ19saXN0XCIsIE5vdGUudGFnX2xpc3RfcHNwZWMpO1xuICB9XG5cbiAgZ2V0IG1vZGlmaWVkX2RhdGUoKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKHRoaXMubW9kaWZpZWQudG9fdW5peCgpICogMTAwMCk7XG4gIH1cblxuICAvLyBhbnl0aGluZyB0aGUgY29uc3RydWN0b3Igb2YgZGF0ZSBhY2NlcHRzXG4gIHNldCBtb2RpZmllZF9kYXRlKGRhdGU6IERhdGUpIHtcbiAgICB0aGlzLm1vZGlmaWVkID0gR0xpYi5EYXRlVGltZS5uZXdfZnJvbV9pc284NjAxKFxuICAgICAgbmV3IERhdGUoZGF0ZSkudG9JU09TdHJpbmcoKSxcbiAgICAgIG51bGwsXG4gICAgKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKG5vdGU6IElOb3RlKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnYgPSBub3RlLnY7XG4gICAgdGhpcy51dWlkID0gbm90ZS51dWlkO1xuICAgIHRoaXMuY29udGVudCA9IG5vdGUuY29udGVudDtcbiAgICB0aGlzLnRpdGxlID0gbm90ZS50aXRsZTtcbiAgICB0aGlzLnN0eWxlID0gbm90ZS5zdHlsZTtcbiAgICB0aGlzLnRhZ19saXN0ID0gR2lvLkxpc3RTdG9yZS5uZXcoVGFnLiRndHlwZSkgYXMgR2lvLkxpc3RTdG9yZTxUYWc+O1xuICAgIHRoaXMudGFncyA9IG5vdGUudGFncztcbiAgICB0aGlzLm1vZGlmaWVkID0gR0xpYi5EYXRlVGltZS5uZXdfZnJvbV9pc284NjAxKFxuICAgICAgbmV3IERhdGUobm90ZS5tb2RpZmllZCkudG9JU09TdHJpbmcoKSxcbiAgICAgIG51bGwsXG4gICAgKTtcbiAgICB0aGlzLndpZHRoID0gbm90ZS53aWR0aDtcbiAgICB0aGlzLmhlaWdodCA9IG5vdGUuaGVpZ2h0O1xuICAgIHRoaXMub3BlbiA9IG5vdGUub3BlbiA/PyBmYWxzZTtcblxuICB9XG5cbiAgc3RhdGljIGdlbmVyYXRlKHRpdGxlOiBzdHJpbmcgPSBcIlwiKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKHtcbiAgICAgIHY6IDEsXG4gICAgICB1dWlkOiBHTGliLnV1aWRfc3RyaW5nX3JhbmRvbSgpLFxuICAgICAgY29udGVudDogXCJcIixcbiAgICAgIHRpdGxlOiB0aXRsZSxcbiAgICAgIHN0eWxlOiBTRVRUSU5HUy5ERUZBVUxUX1NUWUxFLFxuICAgICAgdGFnczogW10sXG4gICAgICBtb2RpZmllZDogbmV3IERhdGUoKSxcbiAgICAgIHdpZHRoOiAzMDAsXG4gICAgICBoZWlnaHQ6IDMwMCxcbiAgICAgIG9wZW46IGZhbHNlLFxuICAgIH0pO1xuICB9XG5cbiAgY29weSgpIHtcbiAgICByZXR1cm4gbmV3IE5vdGUoe1xuICAgICAgdjogdGhpcy52LFxuICAgICAgdXVpZDogdGhpcy51dWlkLFxuICAgICAgY29udGVudDogdGhpcy5jb250ZW50LFxuICAgICAgdGl0bGU6IHRoaXMudGl0bGUsXG4gICAgICBzdHlsZTogdGhpcy5zdHlsZSxcbiAgICAgIHRhZ3M6IHRoaXMudGFncy5tYXAoKHRhZykgPT4gKHtcbiAgICAgICAgbmFtZTogdGFnLm5hbWUsXG4gICAgICAgIHN0YXJ0OiB0YWcuc3RhcnQsXG4gICAgICAgIGVuZDogdGFnLmVuZCxcbiAgICAgIH0pKSxcbiAgICAgIG1vZGlmaWVkOiBuZXcgRGF0ZSh0aGlzLm1vZGlmaWVkLnRvX3VuaXgoKSAqIDEwMDApLFxuICAgICAgd2lkdGg6IHRoaXMud2lkdGgsXG4gICAgICBoZWlnaHQ6IHRoaXMuaGVpZ2h0LFxuICAgICAgb3BlbjogdGhpcy5vcGVuLFxuICAgIH0pO1xuICB9XG5cbiAgdG9KU09OKCk6IElOb3RlIHtcbiAgICByZXR1cm4ge1xuICAgICAgdjogdGhpcy52LFxuICAgICAgdXVpZDogdGhpcy51dWlkLFxuICAgICAgY29udGVudDogdGhpcy5jb250ZW50LFxuICAgICAgdGl0bGU6IHRoaXMudGl0bGUsXG4gICAgICBzdHlsZTogdGhpcy5zdHlsZSxcbiAgICAgIHRhZ3M6IHRoaXMudGFncyxcbiAgICAgIG1vZGlmaWVkOiB0aGlzLm1vZGlmaWVkX2RhdGUsXG4gICAgICB3aWR0aDogdGhpcy53aWR0aCxcbiAgICAgIGhlaWdodDogdGhpcy5oZWlnaHQsXG4gICAgICBvcGVuOiB0aGlzLm9wZW4sXG4gICAgfTtcbiAgfVxuXG4gIHN0YXRpYyB7XG4gICAgR09iamVjdC5yZWdpc3RlckNsYXNzKHtcbiAgICAgIEdUeXBlTmFtZTogXCJOb3RlT2JqZWN0XCIsXG4gICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICB2OiBHT2JqZWN0LlBhcmFtU3BlYy5pbnQoXCJ2XCIsIFwiVmVyc2lvblwiLCBcIlZlcnNpb24gb2YgdGhlIG5vdGVcIiwgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSwgMCwgMTAwLCAwKSxcbiAgICAgICAgLy8gZGVuby1mbXQtaWdub3JlXG4gICAgICAgIHV1aWQ6IEdPYmplY3QuUGFyYW1TcGVjLnN0cmluZyhcInV1aWRcIiwgXCJVVUlEXCIsIFwiVVVJRCBvZiB0aGUgbm90ZVwiLCBHT2JqZWN0LlBhcmFtRmxhZ3MuUkVBRFdSSVRFLCBcIlwiKSxcbiAgICAgICAgLy8gZGVuby1mbXQtaWdub3JlXG4gICAgICAgIGNvbnRlbnQ6IEdPYmplY3QuUGFyYW1TcGVjLnN0cmluZyhcImNvbnRlbnRcIiwgXCJDb250ZW50XCIsIFwiQ29udGVudCBvZiB0aGUgbm90ZVwiLCBHT2JqZWN0LlBhcmFtRmxhZ3MuUkVBRFdSSVRFLCBcIlwiKSxcbiAgICAgICAgLy8gZGVuby1mbXQtaWdub3JlXG4gICAgICAgIHRpdGxlOiBHT2JqZWN0LlBhcmFtU3BlYy5zdHJpbmcoXCJ0aXRsZVwiLCBcIlRpdGxlXCIsIFwiVGl0bGUgb2YgdGhlIG5vdGVcIiwgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSwgXCJcIiksXG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICBzdHlsZTogR09iamVjdC5QYXJhbVNwZWMuaW50KFwic3R5bGVcIiwgXCJTdHlsZVwiLCBcIlN0eWxlIG9mIHRoZSBub3RlXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIDAsIDEwMCwgMCksXG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICB0YWdfbGlzdDogdGhpcy50YWdfbGlzdF9wc3BlYyxcbiAgICAgICAgLy8gLy8gZGVuby1mbXQtaWdub3JlXG4gICAgICAgIG1vZGlmaWVkOiBHT2JqZWN0LlBhcmFtU3BlYy5ib3hlZChcIm1vZGlmaWVkXCIsIFwiTW9kaWZpZWRcIiwgXCJEYXRlIHRoZSBub3RlIHdhcyBtb2RpZmllZFwiLCBHT2JqZWN0LlBhcmFtRmxhZ3MuUkVBRFdSSVRFLCBHTGliLkRhdGVUaW1lKSxcbiAgICAgICAgLy8gZGVuby1mbXQtaWdub3JlXG4gICAgICAgIHdpZHRoOiBHT2JqZWN0LlBhcmFtU3BlYy5pbnQoXCJ3aWR0aFwiLCBcIldpZHRoXCIsIFwiV2lkdGggb2YgdGhlIG5vdGVcIiwgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSwgMCwgMTAwLCAwKSxcbiAgICAgICAgLy8gZGVuby1mbXQtaWdub3JlXG4gICAgICAgIGhlaWdodDogR09iamVjdC5QYXJhbVNwZWMuaW50KFwiaGVpZ2h0XCIsIFwiSGVpZ2h0XCIsIFwiSGVpZ2h0IG9mIHRoZSBub3RlXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIDAsIDEwMCwgMCksXG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICBvcGVuOiBHT2JqZWN0LlBhcmFtU3BlYy5ib29sZWFuKFwib3BlblwiLCBcIk9wZW5cIiwgXCJXaGV0aGVyIHRoZSBub3RlIHdhcyBvcGVuIHdoZW4gdGhlIGFwcGxpY2F0aW9uIHdhcyBjbG9zZWRcIiwgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSwgZmFsc2UpLFxuICAgICAgfSxcbiAgICB9LCB0aGlzKTtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgY29uZmlybV9kZWxldGUgPSAod2luZG93OiBHdGsuV2luZG93LCBjYjogKCkgPT4gdm9pZCkgPT4ge1xuICBpZiAoU0VUVElOR1MuQ09ORklSTV9ERUxFVEUpIHtcbiAgICBjb25zdCBkaWFsb2cgPSBBZHcuTWVzc2FnZURpYWxvZy5uZXcoXG4gICAgICB3aW5kb3csXG4gICAgICBfKFwiRGVsZXRlIE5vdGU/XCIpLFxuICAgICAgXyhcIlRoaXMgYWN0aW9uIGNhbm5vdCBiZSB1bmRvbmUuIElmIHlvdSB3YW50IHRvIGhpZGUgdGhlIG5vdGUsIHlvdSBjYW4gY2xvc2UgaXQgaW5zdGVhZC5cIiksXG4gICAgKTtcbiAgICBkaWFsb2cuYWRkX3Jlc3BvbnNlKFwiY2FuY2VsXCIsIF8oXCJDYW5jZWxcIikpO1xuICAgIGRpYWxvZy5hZGRfcmVzcG9uc2UoXCJkZWxldGVcIiwgXyhcIkRlbGV0ZVwiKSk7XG4gICAgZGlhbG9nLnNldF9yZXNwb25zZV9hcHBlYXJhbmNlKFxuICAgICAgXCJkZWxldGVcIixcbiAgICAgIEFkdy5SZXNwb25zZUFwcGVhcmFuY2UuREVTVFJVQ1RJVkUsXG4gICAgKTtcbiAgICBkaWFsb2cuc2V0X2RlZmF1bHRfcmVzcG9uc2UoXCJjYW5jZWxcIik7XG4gICAgZGlhbG9nLnNldF9jbG9zZV9yZXNwb25zZShcImNhbmNlbFwiKTtcbiAgICBkaWFsb2cuY29ubmVjdChcInJlc3BvbnNlXCIsIChfZGlhbG9nLCByZXNwb25zZSkgPT4ge1xuICAgICAgaWYgKHJlc3BvbnNlID09PSBcImRlbGV0ZVwiKSB7XG4gICAgICAgIGNiKCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgZGlhbG9nLnByZXNlbnQoKTtcbiAgfSBlbHNlIHtcbiAgICBjYigpO1xuICB9XG59O1xuIiwgIi8qIE1JVCBMaWNlbnNlXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDIzIEFuZ2VsbyBWZXJsYWluLCBDaHJpcyBEYXZpc1xuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbiAqIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuICogU09GVFdBUkUuXG4gKlxuICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IE1JVFxuICovXG5cbmltcG9ydCBHT2JqZWN0IGZyb20gXCJnaTovL0dPYmplY3RcIjtcbmltcG9ydCBHdGsgZnJvbSBcImdpOi8vR3RrP3ZlcnNpb249NC4wXCI7XG5pbXBvcnQgUGFuZ28gZnJvbSBcImdpOi8vUGFuZ29cIjtcbmltcG9ydCBBZHcgZnJvbSBcImdpOi8vQWR3P3ZlcnNpb249MVwiO1xuXG5pbXBvcnQgeyBmaW5kIH0gZnJvbSBcImxpbmtpZnlqc1wiO1xuXG5pbXBvcnQgeyBJVGFnLCBOb3RlIH0gZnJvbSBcIi4vdXRpbC5qc1wiO1xuaW1wb3J0IHsgU3R5bGUgfSBmcm9tIFwiLi91dGlsLmpzXCI7XG5cbmNsYXNzIEFic3RyYWN0U3RpY2t5Tm90ZSBleHRlbmRzIEd0ay5UZXh0VmlldyB7XG4gIHN0YXRpYyB7XG4gICAgR09iamVjdC5yZWdpc3RlckNsYXNzKFxuICAgICAge1xuICAgICAgICBHVHlwZU5hbWU6IFwiQWJzdHJhY3RTdGlja3lOb3RlXCIsXG4gICAgICAgIFNpZ25hbHM6IHtcbiAgICAgICAgICBcInRhZy10b2dnbGVcIjoge1xuICAgICAgICAgICAgcGFyYW1fdHlwZXM6IFtHT2JqZWN0LlRZUEVfU1RSSU5HLCBHT2JqZWN0LlRZUEVfQk9PTEVBTl0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNlbGVjdGlvbi1jaGFuZ2VkXCI6IHt9LFxuICAgICAgICAgIFwibGluay1zZWxlY3RlZFwiOiB7XG4gICAgICAgICAgICBwYXJhbV90eXBlczogW0dPYmplY3QuVFlQRV9TVFJJTkddLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJsaW5rLXVuc2VsZWN0ZWRcIjoge30sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgdGhpcyxcbiAgICApO1xuICB9XG5cbiAgYm9sZF90YWcgPSBHdGsuVGV4dFRhZy5uZXcoXCJib2xkXCIpO1xuICB1bmRlcmxpbmVfdGFnID0gR3RrLlRleHRUYWcubmV3KFwidW5kZXJsaW5lXCIpO1xuICBpdGFsaWNfdGFnID0gR3RrLlRleHRUYWcubmV3KFwiaXRhbGljXCIpO1xuICBzdHJpa2V0aHJvdWdoX3RhZyA9IEd0ay5UZXh0VGFnLm5ldyhcInN0cmlrZXRocm91Z2hcIik7XG4gIGxpbmtfdGFnID0gR3RrLlRleHRUYWcubmV3KFwibGlua1wiKTtcblxuICBhY3Rpb25zID0gW1xuICAgIFtcImJvbGRcIiwgdGhpcy5ib2xkX3RhZ10sXG4gICAgW1widW5kZXJsaW5lXCIsIHRoaXMudW5kZXJsaW5lX3RhZ10sXG4gICAgW1wiaXRhbGljXCIsIHRoaXMuaXRhbGljX3RhZ10sXG4gICAgW1wic3RyaWtldGhyb3VnaFwiLCB0aGlzLnN0cmlrZXRocm91Z2hfdGFnXSxcbiAgXSBhcyBbc3RyaW5nLCBHdGsuVGV4dFRhZ11bXTtcblxuICBfbm90ZT86IE5vdGU7XG5cbiAgZ2V0IG5vdGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX25vdGU7XG4gIH1cblxuICBzZXQgbm90ZShub3RlOiBOb3RlIHwgdW5kZWZpbmVkKSB7XG4gICAgaWYgKCFub3RlKSByZXR1cm47XG5cbiAgICB0aGlzLl9ub3RlID0gbm90ZTtcbiAgICB0aGlzLmNsZWFyX3RhZ3MoKTtcbiAgICB0aGlzLmJ1ZmZlci50ZXh0ID0gbm90ZS5jb250ZW50O1xuICAgIHRoaXMuaW5pdF90YWdzKG5vdGUudGFncyk7XG5cbiAgICB0aGlzLnVwZGF0ZV9saW5rX3RhZ19jb2xvcigpO1xuICAgIHRoaXMucmVtb3ZlX2xpc3RlbmVycygpO1xuICAgIHRoaXMuaW5pdF9saXN0ZW5lcnMoKTtcbiAgfVxuXG4gIGxpc3RlbmVycyA9IG5ldyBTZXQ8bnVtYmVyPigpO1xuXG4gIGluaXRfbGlzdGVuZXJzKCkge1xuICAgIGlmICghdGhpcy5ub3RlKSByZXR1cm47XG5cbiAgICB0aGlzLmxpc3RlbmVycy5hZGQodGhpcy5ub3RlLmNvbm5lY3QoXCJub3RpZnk6OnN0eWxlXCIsICgpID0+IHtcbiAgICAgIHRoaXMudXBkYXRlX2xpbmtfdGFnX2NvbG9yKCk7XG4gICAgfSkpO1xuICB9XG5cbiAgcmVtb3ZlX2xpc3RlbmVycygpIHt9XG5cbiAgc3R5bGVfbWFuYWdlcjogQWR3LlN0eWxlTWFuYWdlcjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBub3RlPzogTm90ZSxcbiAgKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuc3R5bGVfbWFuYWdlciA9IEFkdy5TdHlsZU1hbmFnZXIuZ2V0X2RlZmF1bHQoKTtcblxuICAgIHRoaXMucmVnaXN0ZXJfdGFncygpO1xuICAgIGlmIChub3RlKSB0aGlzLm5vdGUgPSBub3RlO1xuXG4gICAgdGhpcy5idWZmZXIuY29ubmVjdChcIm1hcmstc2V0XCIsIChfYnVmZmVyLCBfbG9jLCBtYXJrKSA9PiB7XG4gICAgICBpZiAoIXRoaXMubm90ZSkgcmV0dXJuO1xuXG4gICAgICBpZiAoXG4gICAgICAgIG1hcmsubmFtZSA9PT0gXCJpbnNlcnRcIiB8fCBtYXJrLm5hbWUgPT09IFwic2VsZWN0aW9uX2JvdW5kXCIgfHxcbiAgICAgICAgdGhpcy5idWZmZXIuZ2V0X2l0ZXJfYXRfbWFyayhtYXJrKS5lcXVhbChcbiAgICAgICAgICB0aGlzLmJ1ZmZlci5nZXRfaXRlcl9hdF9tYXJrKHRoaXMuYnVmZmVyLmdldF9pbnNlcnQoKSksXG4gICAgICAgIClcbiAgICAgICkge1xuICAgICAgICB0aGlzLmVtaXQoXCJzZWxlY3Rpb24tY2hhbmdlZFwiKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5jaGVja19saW5rX3NlbGVjdGVkKCk7XG4gICAgfSk7XG4gIH1cblxuICBsYXN0X2xpbms6IG51bWJlciB8IGZhbHNlID0gZmFsc2U7XG4gIGxhc3RfbGlua19lbmQ6IG51bWJlciA9IDA7XG5cbiAgY2hlY2tfbGlua19zZWxlY3RlZCgpIHtcbiAgICBjb25zdCBoYXNfbGluayA9IHRoaXMuaGFzX3RhZyh0aGlzLmxpbmtfdGFnKTtcblxuICAgIGlmIChoYXNfbGluaykge1xuICAgICAgY29uc3Qgc3RhcnQgPSB0aGlzLmJ1ZmZlci5nZXRfaXRlcl9hdF9vZmZzZXQoaGFzX2xpbmspO1xuXG4gICAgICBpZiAoIXN0YXJ0LnN0YXJ0c190YWcodGhpcy5saW5rX3RhZykpIHtcbiAgICAgICAgc3RhcnQuYmFja3dhcmRfdG9fdGFnX3RvZ2dsZSh0aGlzLmxpbmtfdGFnKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZW5kID0gc3RhcnQuY29weSgpO1xuICAgICAgZW5kLmZvcndhcmRfdG9fdGFnX3RvZ2dsZSh0aGlzLmxpbmtfdGFnKTtcblxuICAgICAgaWYgKFxuICAgICAgICBzdGFydC5nZXRfb2Zmc2V0KCkgIT09IHRoaXMubGFzdF9saW5rIHx8XG4gICAgICAgIGVuZC5nZXRfb2Zmc2V0KCkgIT09IHRoaXMubGFzdF9saW5rX2VuZFxuICAgICAgKSB7XG4gICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLmJ1ZmZlci5nZXRfdGV4dChzdGFydCwgZW5kLCBmYWxzZSlcbiAgICAgICAgICAucmVwbGFjZSgvXFx1MjAwQi9nLCBcIlwiKTtcblxuICAgICAgICB0aGlzLmVtaXQoXCJsaW5rLXNlbGVjdGVkXCIsIHRleHQpO1xuXG4gICAgICAgIHRoaXMubGFzdF9saW5rID0gc3RhcnQuZ2V0X29mZnNldCgpO1xuICAgICAgICB0aGlzLmxhc3RfbGlua19lbmQgPSBlbmQuZ2V0X29mZnNldCgpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaGFzX2xpbmsgIT09IHRoaXMubGFzdF9saW5rKSB7XG4gICAgICB0aGlzLmVtaXQoXCJsaW5rLXVuc2VsZWN0ZWRcIik7XG4gICAgICB0aGlzLmxhc3RfbGluayA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZV9saW5rX3RhZ19jb2xvcigpIHtcbiAgICBpZiAoIXRoaXMubm90ZSkgcmV0dXJuO1xuICAgIGxldCBjb2xvcjtcblxuICAgIGlmICh0aGlzLnN0eWxlX21hbmFnZXIuZGFyaykge1xuICAgICAgY29uc3QgYWNjZW50X2NvbG9yID0gdGhpcy5nZXRfc3R5bGVfY29udGV4dCgpLmxvb2t1cF9jb2xvcihcbiAgICAgICAgXCJhY2NlbnRfZmdfY29sb3JcIixcbiAgICAgICk7XG4gICAgICBpZiAoYWNjZW50X2NvbG9yWzBdKSB7XG4gICAgICAgIGNvbG9yID0gYWNjZW50X2NvbG9yWzFdLnRvX3N0cmluZygpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29sb3IgPSBcIiMwMDAwZmZcIjtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgYWNjZW50X2NvbG9yID0gdGhpcy5nZXRfc3R5bGVfY29udGV4dCgpLmxvb2t1cF9jb2xvcihcbiAgICAgICAgYGxpbmtfY29sb3JfJHtTdHlsZVt0aGlzLm5vdGUuc3R5bGVdfWAsXG4gICAgICApO1xuICAgICAgaWYgKGFjY2VudF9jb2xvclswXSkge1xuICAgICAgICBjb2xvciA9IGFjY2VudF9jb2xvclsxXS50b19zdHJpbmcoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbG9yID0gXCIjMDAwMGZmXCI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5saW5rX3RhZy5mb3JlZ3JvdW5kID0gY29sb3I7XG4gIH1cblxuICBwcml2YXRlIHJlZ2lzdGVyX3RhZ3MoKSB7XG4gICAgdGhpcy5ib2xkX3RhZy53ZWlnaHQgPSBQYW5nby5XZWlnaHQuQk9MRDtcbiAgICB0aGlzLnVuZGVybGluZV90YWcudW5kZXJsaW5lID0gUGFuZ28uVW5kZXJsaW5lLlNJTkdMRTtcbiAgICB0aGlzLml0YWxpY190YWcuc3R5bGUgPSBQYW5nby5TdHlsZS5JVEFMSUM7XG4gICAgdGhpcy5zdHJpa2V0aHJvdWdoX3RhZy5zdHJpa2V0aHJvdWdoID0gdHJ1ZTtcblxuICAgIHRoaXMubGlua190YWcudW5kZXJsaW5lID0gUGFuZ28uVW5kZXJsaW5lLlNJTkdMRTtcblxuICAgIGlmICh0aGlzLnN0eWxlX21hbmFnZXIuc3lzdGVtX3N1cHBvcnRzX2NvbG9yX3NjaGVtZXMpIHtcbiAgICAgIHRoaXMuc3R5bGVfbWFuYWdlci5jb25uZWN0KFxuICAgICAgICBcIm5vdGlmeTo6ZGFya1wiLFxuICAgICAgICB0aGlzLnVwZGF0ZV9saW5rX3RhZ19jb2xvci5iaW5kKHRoaXMpLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICB0aGlzLmJ1ZmZlci50YWdfdGFibGUuYWRkKHRoaXMuYm9sZF90YWcpO1xuICAgIHRoaXMuYnVmZmVyLnRhZ190YWJsZS5hZGQodGhpcy51bmRlcmxpbmVfdGFnKTtcbiAgICB0aGlzLmJ1ZmZlci50YWdfdGFibGUuYWRkKHRoaXMuaXRhbGljX3RhZyk7XG4gICAgdGhpcy5idWZmZXIudGFnX3RhYmxlLmFkZCh0aGlzLnN0cmlrZXRocm91Z2hfdGFnKTtcbiAgICB0aGlzLmJ1ZmZlci50YWdfdGFibGUuYWRkKHRoaXMubGlua190YWcpO1xuICB9XG5cbiAgaW5pdF90YWdzKHRhZ3M6IE5vdGVbXCJ0YWdzXCJdKSB7XG4gICAgZm9yIChjb25zdCB0YWcgb2YgdGFncykge1xuICAgICAgY29uc3Qgc3RhcnQgPSB0aGlzLmJ1ZmZlci5nZXRfaXRlcl9hdF9vZmZzZXQodGFnLnN0YXJ0KTtcbiAgICAgIGNvbnN0IGVuZCA9IHRoaXMuYnVmZmVyLmdldF9pdGVyX2F0X29mZnNldCh0YWcuZW5kKTtcbiAgICAgIHRoaXMuYnVmZmVyLmFwcGx5X3RhZ19ieV9uYW1lKHRhZy5uYW1lLCBzdGFydCwgZW5kKTtcbiAgICB9XG4gIH1cblxuICBoYXNfdGFnKHRhZzogR3RrLlRleHRUYWcpIHtcbiAgICBsZXQgW3NlbGVjdGlvbiwgc3RhcnQsIGVuZF0gPSB0aGlzLmJ1ZmZlci5nZXRfc2VsZWN0aW9uX2JvdW5kcygpO1xuICAgIGlmICghc2VsZWN0aW9uKSB7XG4gICAgICBzdGFydCA9IHRoaXMuYnVmZmVyLmdldF9pdGVyX2F0X21hcmsoXG4gICAgICAgIHRoaXMuYnVmZmVyLmdldF9pbnNlcnQoKSxcbiAgICAgICk7XG4gICAgICBlbmQgPSBzdGFydC5jb3B5KCk7XG4gICAgICBlbmQuZm9yd2FyZF9jdXJzb3JfcG9zaXRpb24oKTtcbiAgICB9XG5cbiAgICBkbyB7XG4gICAgICBpZiAoc3RhcnQuaGFzX3RhZyh0YWcpICE9PSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gc3RhcnQuZ2V0X29mZnNldCgpO1xuICAgICAgfVxuICAgICAgc3RhcnQuZm9yd2FyZF9jaGFyKCk7XG4gICAgfSB3aGlsZSAoc3RhcnQuY29tcGFyZShlbmQpIDwgMCk7XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBhcHBseV90YWcodGFnOiBHdGsuVGV4dFRhZykge1xuICAgIGxldCBbc2VsZWN0aW9uLCBzdGFydCwgZW5kXSA9IHRoaXMuYnVmZmVyLmdldF9zZWxlY3Rpb25fYm91bmRzKCk7XG4gICAgLy8gaWYgbm8gc2VsZWN0aW9uLCBhcHBseSB0byB0aGUgY3VycmVudCB3b3JkXG4gICAgaWYgKCFzZWxlY3Rpb24pIHtcbiAgICAgIC8qKlxuICAgICAgICogSWYgdGhlIHVzZXIgaGFzIG5vdCBzZWxlY3RlZCBhbnl0aGluZywgd2UgaW5zZXJ0IHplcm8td2lkdGggc3BhY2VzXG4gICAgICAgKiBhcm91bmQgdGhlIGN1cnNvciBhbmQgbWFyayB0aGVtIGFzIHRoZSBzdGFydCBhbmQgZW5kIG9mIHRoZSBzZWxlY3Rpb24uXG4gICAgICAgKi9cbiAgICAgIGNvbnN0IGdldF9jdXJzb3JfcG9zaXRpb24gPSAoKSA9PiB0aGlzLmJ1ZmZlci5jdXJzb3JfcG9zaXRpb247XG5cbiAgICAgIHRoaXMuYnVmZmVyLmluc2VydF9hdF9jdXJzb3IoXCJcXHUyMDBCXFx1MjAwQlxcdTIwMEJcIiwgOSk7XG4gICAgICBzdGFydCA9IHRoaXMuYnVmZmVyLmdldF9pdGVyX2F0X29mZnNldChnZXRfY3Vyc29yX3Bvc2l0aW9uKCkgLSAzKTtcbiAgICAgIGVuZCA9IHRoaXMuYnVmZmVyLmdldF9pdGVyX2F0X29mZnNldChnZXRfY3Vyc29yX3Bvc2l0aW9uKCkgLSAxKTtcbiAgICAgIGNvbnN0IHNlbGVjID0gdGhpcy5idWZmZXIuZ2V0X2l0ZXJfYXRfb2Zmc2V0KGdldF9jdXJzb3JfcG9zaXRpb24oKSk7XG4gICAgICBzZWxlYy5iYWNrd2FyZF9jaGFycygyKTtcbiAgICAgIHRoaXMuYnVmZmVyLnBsYWNlX2N1cnNvcihzZWxlYyk7XG4gICAgfVxuXG4gICAgY29uc3QgaGFzX3RhZyA9IHRoaXMuaGFzX3RhZyh0YWcpO1xuXG4gICAgaWYgKHRoaXMuaGFzX3RhZyh0YWcpICE9PSBmYWxzZSkge1xuICAgICAgdGhpcy5idWZmZXIucmVtb3ZlX3RhZyh0YWcsIHN0YXJ0LCBlbmQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmJ1ZmZlci5hcHBseV90YWcodGFnLCBzdGFydCwgZW5kKTtcbiAgICB9XG5cbiAgICB0aGlzLmVtaXQoXCJ0YWctdG9nZ2xlXCIsIHRhZy5uYW1lLCBoYXNfdGFnID09PSBmYWxzZSk7XG4gIH1cblxuICBjbGVhcl90YWdzKCkge1xuICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5idWZmZXIuZ2V0X3N0YXJ0X2l0ZXIoKTtcbiAgICBjb25zdCBlbmQgPSB0aGlzLmJ1ZmZlci5nZXRfZW5kX2l0ZXIoKTtcblxuICAgIGZvciAoY29uc3QgW25hbWUsIHRhZ10gb2YgdGhpcy5hY3Rpb25zKSB7XG4gICAgICB0aGlzLmJ1ZmZlci5yZW1vdmVfdGFnKHRhZywgc3RhcnQsIGVuZCk7XG4gICAgICB0aGlzLmVtaXQoXCJ0YWctdG9nZ2xlXCIsIG5hbWUsIGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICBnZXRfdGFncygpIHtcbiAgICBjb25zdCB0YWdzOiBOb3RlW1widGFnc1wiXSA9IFtdO1xuXG4gICAgdGhpcy5idWZmZXIuZ2V0X3RhZ190YWJsZSgpLmZvcmVhY2goKHRhZykgPT4ge1xuICAgICAgY29uc3Qgc3RhcnQgPSB0aGlzLmJ1ZmZlci5nZXRfc3RhcnRfaXRlcigpO1xuXG4gICAgICBkbyB7XG4gICAgICAgIGlmICghc3RhcnQuc3RhcnRzX3RhZyh0YWcpKSBjb250aW51ZTtcblxuICAgICAgICBjb25zdCBiZWdpbiA9IHN0YXJ0LmNvcHkoKTtcbiAgICAgICAgc3RhcnQuZm9yd2FyZF90b190YWdfdG9nZ2xlKHRhZyk7XG5cbiAgICAgICAgdGFncy5wdXNoKHtcbiAgICAgICAgICBuYW1lOiB0YWcubmFtZSxcbiAgICAgICAgICBzdGFydDogYmVnaW4uZ2V0X29mZnNldCgpLFxuICAgICAgICAgIGVuZDogc3RhcnQuZ2V0X29mZnNldCgpLFxuICAgICAgICB9KTtcbiAgICAgIH0gd2hpbGUgKHN0YXJ0LmZvcndhcmRfdG9fdGFnX3RvZ2dsZSh0YWcpKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0YWdzO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZWFkb25seVN0aWNreU5vdGUgZXh0ZW5kcyBBYnN0cmFjdFN0aWNreU5vdGUge1xuICBzdGF0aWMge1xuICAgIEdPYmplY3QucmVnaXN0ZXJDbGFzcyhcbiAgICAgIHtcbiAgICAgICAgR1R5cGVOYW1lOiBcIlJlYWRvbmx5U3RpY2t5Tm90ZVwiLFxuICAgICAgfSxcbiAgICAgIHRoaXMsXG4gICAgKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKG5vdGU/OiBOb3RlKSB7XG4gICAgc3VwZXIobm90ZSk7XG5cbiAgICB0aGlzLm5vdGUgPSBub3RlO1xuICAgIHRoaXMuZWRpdGFibGUgPSBmYWxzZTtcbiAgICB0aGlzLmN1cnNvcl92aXNpYmxlID0gZmFsc2U7XG4gICAgdGhpcy5zaG93X2NvbnRlbnQoKTtcbiAgfVxuXG4gIHNldCBub3RlKG5vdGU6IE5vdGUgfCB1bmRlZmluZWQpIHtcbiAgICB0aGlzLl9ub3RlID0gc3VwZXIubm90ZSA9IG5vdGU7XG5cbiAgICB0aGlzLnNob3dfY29udGVudCgpO1xuICB9XG5cbiAgZ2V0IG5vdGUoKSB7XG4gICAgcmV0dXJuIHN1cGVyLm5vdGU7XG4gIH1cblxuICBjbGlwX2NvbnRlbnQoY29udGVudDogc3RyaW5nKSB7XG4gICAgY29uc3QgTUFYX0xJTkVTID0gNTtcbiAgICBjb25zdCBNQVhfQ0hBUlMgPSAyNDA7XG5cbiAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC9cXHMrJC8sIFwiXCIpO1xuXG4gICAgbGV0IGN1dCA9IGNvbnRlbnQuc3BsaXQoXCJcXG5cIikuc2xpY2UoMCwgTUFYX0xJTkVTKS5qb2luKFwiXFxuXCIpO1xuXG4gICAgaWYgKGN1dC5sZW5ndGggPiBNQVhfQ0hBUlMpIHtcbiAgICAgIGN1dCA9IGN1dC5zbGljZSgwLCBNQVhfQ0hBUlMpO1xuICAgIH1cblxuICAgIHJldHVybiBjdXQubGVuZ3RoIDwgY29udGVudC5sZW5ndGggPyBgJHtjdXR9XHUyMDI2YCA6IGN1dDtcbiAgfVxuXG4gIHNob3dfY29udGVudCgpIHtcbiAgICBpZiAoIXRoaXMubm90ZSkgcmV0dXJuO1xuXG4gICAgaWYgKCF0aGlzLm5vdGUuY29udGVudC5yZXBsYWNlKC9cXHMvZywgXCJcIikpIHtcbiAgICAgIHRoaXMuYnVmZmVyLnRleHQgPSBcIlwiO1xuICAgICAgdGhpcy5idWZmZXIuaW5zZXJ0X21hcmt1cChcbiAgICAgICAgdGhpcy5idWZmZXIuZ2V0X3N0YXJ0X2l0ZXIoKSxcbiAgICAgICAgYDxpPigke18oXCJFbXB0eSBOb3RlXCIpfSk8L2k+YCxcbiAgICAgICAgLTEsXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmJ1ZmZlci50ZXh0ID0gdGhpcy5jbGlwX2NvbnRlbnQodGhpcy5ub3RlIS5jb250ZW50KTtcbiAgICAgIHRoaXMuY2xlYXJfdGFncygpO1xuICAgICAgdGhpcy5pbml0X3RhZ3ModGhpcy5ub3RlIS50YWdzKTtcbiAgICB9XG4gIH1cblxuICBpbml0X2xpc3RlbmVycygpIHtcbiAgICBzdXBlci5pbml0X2xpc3RlbmVycygpO1xuXG4gICAgaWYgKCF0aGlzLm5vdGUpIHJldHVybjtcblxuICAgIHRoaXMubGlzdGVuZXJzLmFkZCh0aGlzLm5vdGUuY29ubmVjdChcIm5vdGlmeTo6Y29udGVudFwiLCAoKSA9PiB7XG4gICAgICB0aGlzLnNob3dfY29udGVudCgpO1xuICAgIH0pKTtcblxuICAgIHRoaXMubGlzdGVuZXJzLmFkZCh0aGlzLm5vdGUuY29ubmVjdChcIm5vdGlmeTo6dGFnX2xpc3RcIiwgKCkgPT4ge1xuICAgICAgdGhpcy5jbGVhcl90YWdzKCk7XG4gICAgICB0aGlzLmluaXRfdGFncyh0aGlzLm5vdGUhLnRhZ3MpO1xuICAgIH0pKTtcbiAgfVxuXG4gIHJlbW92ZV9saXN0ZW5lcnMoKSB7XG4gICAgc3VwZXIucmVtb3ZlX2xpc3RlbmVycygpO1xuXG4gICAgaWYgKCF0aGlzLm5vdGUpIHJldHVybjtcblxuICAgIGZvciAoY29uc3QgbGlzdGVuZXIgb2YgdGhpcy5saXN0ZW5lcnMpIHtcbiAgICAgIHRoaXMubm90ZSEuZGlzY29ubmVjdChsaXN0ZW5lcik7XG4gICAgfVxuXG4gICAgdGhpcy5saXN0ZW5lcnMuY2xlYXIoKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgV3JpdGVhYmxlU3RpY2t5Tm90ZSBleHRlbmRzIEFic3RyYWN0U3RpY2t5Tm90ZSB7XG4gIHN0YXRpYyB7XG4gICAgR09iamVjdC5yZWdpc3RlckNsYXNzKFxuICAgICAge1xuICAgICAgICBHVHlwZU5hbWU6IFwiV3JpdGVhYmxlU3RpY2t5Tm90ZVwiLFxuICAgICAgfSxcbiAgICAgIHRoaXMsXG4gICAgKTtcbiAgfVxuXG4gIHVwZGF0aW5nID0gZmFsc2U7XG4gIHNvdXJjZTogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG5cbiAgZ2V0IG5vdGUoKSB7XG4gICAgcmV0dXJuIHN1cGVyLm5vdGU7XG4gIH1cblxuICBzZXQgbm90ZShub3RlOiBOb3RlIHwgdW5kZWZpbmVkKSB7XG4gICAgdGhpcy51cGRhdGluZyA9IHRydWU7XG4gICAgc3VwZXIubm90ZSA9IG5vdGU7XG4gIH1cblxuICBjaGFuZ2U8VCBleHRlbmRzIGtleW9mIE5vdGU+KGtleTogVCwgdmFsdWU6IE5vdGVbVF0pIHtcbiAgICBpZiAoIXRoaXMubm90ZSkgcmV0dXJuO1xuICAgIHRoaXMubm90ZVtrZXldID0gdmFsdWU7XG4gICAgdGhpcy5ub3RlLm1vZGlmaWVkX2RhdGUgPSBuZXcgRGF0ZSgpO1xuICB9XG5cbiAgY29uc3RydWN0b3Iobm90ZT86IE5vdGUpIHtcbiAgICBzdXBlcihub3RlKTtcblxuICAgIHRoaXMuYnVmZmVyLmNvbm5lY3RfYWZ0ZXIoXCJpbnNlcnQtdGV4dFwiLCAoYnVmZmVyLCBsb2MsIHRleHQsIGxlbmd0aCkgPT4ge1xuICAgICAgdGhpcy5vbl90ZXh0X2luc2VydGVkKGJ1ZmZlciwgbG9jLCB0ZXh0LCBsZW5ndGgpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5idWZmZXIuY29ubmVjdChcImNoYW5nZWRcIiwgKCkgPT4ge1xuICAgICAgaWYgKHRoaXMudXBkYXRpbmcpIHtcbiAgICAgICAgdGhpcy51cGRhdGluZyA9IGZhbHNlO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLnVwZGF0ZV9saW5rcygpO1xuICAgICAgaWYgKHRoaXMuYnVmZmVyLnRleHQgPT0gdGhpcy5ub3RlIS5jb250ZW50KSByZXR1cm47XG4gICAgICB0aGlzLmNoYW5nZShcImNvbnRlbnRcIiwgdGhpcy5idWZmZXIudGV4dCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmJ1ZmZlci5jb25uZWN0KFwibWFyay1zZXRcIiwgKCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLm5vdGUpIHJldHVybjtcblxuICAgICAgY29uc3QgdGFncyA9IHRoaXMuZ2V0X3RhZ3MoKTtcbiAgICAgIGlmIChjb21wYXJlX3RhZ3ModGFncywgdGhpcy5ub3RlLnRhZ3MpKSByZXR1cm47XG4gICAgICB0aGlzLm5vdGUudGFncyA9IHRhZ3M7XG4gICAgfSk7XG4gIH1cblxuICBjbGVhcl9saW5rcygpIHtcbiAgICB0aGlzLmJ1ZmZlci5yZW1vdmVfdGFnKFxuICAgICAgdGhpcy5saW5rX3RhZyxcbiAgICAgIHRoaXMuYnVmZmVyLmdldF9zdGFydF9pdGVyKCksXG4gICAgICB0aGlzLmJ1ZmZlci5nZXRfZW5kX2l0ZXIoKSxcbiAgICApO1xuICAgIHRoaXMuZW1pdChcInRhZy10b2dnbGVcIiwgXCJsaW5rXCIsIGZhbHNlKTtcbiAgfVxuXG4gIHVwZGF0ZV9saW5rcygpIHtcbiAgICBjb25zdCB0ZXh0ID0gdGhpcy5idWZmZXIudGV4dDtcblxuICAgIHRoaXMuY2xlYXJfbGlua3MoKTtcblxuICAgIGZpbmQodGV4dClcbiAgICAgIC5mb3JFYWNoKChtYXRjaCkgPT4ge1xuICAgICAgICBjb25zdCBzdGFydCA9IHRoaXMuYnVmZmVyLmdldF9pdGVyX2F0X29mZnNldChtYXRjaC5zdGFydCk7XG4gICAgICAgIGNvbnN0IGVuZCA9IHRoaXMuYnVmZmVyLmdldF9pdGVyX2F0X29mZnNldChtYXRjaC5lbmQpO1xuXG4gICAgICAgIHRoaXMuYnVmZmVyLmFwcGx5X3RhZyh0aGlzLmxpbmtfdGFnLCBzdGFydCwgZW5kKTtcbiAgICAgIH0pO1xuXG4gICAgdGhpcy5lbWl0KFwidGFnLXRvZ2dsZVwiLCBcImxpbmtcIiwgdHJ1ZSk7XG4gIH1cblxuICBjbGVhcl90YWdzKCkge1xuICAgIHN1cGVyLmNsZWFyX3RhZ3MoKTtcbiAgICAvLyB0aGlzLmNoYW5nZShcInRhZ3NcIiwgW10pO1xuICB9XG5cbiAgYXBwbHlfdGFnKHRhZzogR3RrLlRleHRUYWcpIHtcbiAgICBzdXBlci5hcHBseV90YWcodGFnKTtcbiAgICBjb25zdCB0YWdzID0gdGhpcy5nZXRfdGFncygpO1xuICAgIGlmIChjb21wYXJlX3RhZ3ModGFncywgdGhpcy5ub3RlIS50YWdzKSkgcmV0dXJuO1xuICAgIHRoaXMuY2hhbmdlKFwidGFnc1wiLCB0YWdzKTtcbiAgfVxuXG4gIG9uX3RleHRfaW5zZXJ0ZWQoXG4gICAgYnVmZmVyOiBHdGsuVGV4dEJ1ZmZlcixcbiAgICBsb2M6IEd0ay5UZXh0SXRlcixcbiAgICB0ZXh0OiBzdHJpbmcsXG4gICAgbGVuZ3RoOiBudW1iZXIsXG4gICkge1xuICAgIGlmICh0ZXh0ID09PSBcIlxcblwiKSB7XG4gICAgICBjb25zdCBzdGFydF9pdGVyID0gbG9jLmNvcHkoKTtcbiAgICAgIHN0YXJ0X2l0ZXIuYmFja3dhcmRfY2hhcigpO1xuICAgICAgc3RhcnRfaXRlci5zZXRfbGluZV9vZmZzZXQoMCk7XG5cbiAgICAgIGNvbnN0IGVuZF9pdGVyID0gc3RhcnRfaXRlci5jb3B5KCk7XG4gICAgICBlbmRfaXRlci5mb3J3YXJkX2NoYXJzKDIpO1xuICAgICAgY29uc3QgY2hhcnMgPSBidWZmZXIuZ2V0X3RleHQoc3RhcnRfaXRlciwgZW5kX2l0ZXIsIGZhbHNlKTtcblxuICAgICAgY29uc3Qgc2ltcGxlX3JlZ2V4X3BhdHRlcm4gPSAvXlstKypdICQvO1xuICAgICAgaWYgKHNpbXBsZV9yZWdleF9wYXR0ZXJuLnRlc3QoY2hhcnMpKSB7XG4gICAgICAgIGNvbnN0IGJ1bGxldCA9IGNoYXJzWzBdO1xuICAgICAgICBjb25zdCBsaW5lX2VuZCA9IGxvYy5jb3B5KCk7XG4gICAgICAgIGxpbmVfZW5kLmJhY2t3YXJkX2NoYXIoKTtcbiAgICAgICAgaWYgKGxpbmVfZW5kLmdldF9saW5lX29mZnNldCgpID09PSAyKSB7XG4gICAgICAgICAgc3RhcnRfaXRlci5zZXRfbGluZV9vZmZzZXQoMCk7XG4gICAgICAgICAgYnVmZmVyLmRlbGV0ZShzdGFydF9pdGVyLCBsb2MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJ1ZmZlci5pbnNlcnQobG9jLCBidWxsZXQgKyBcIiBcIiwgLTEpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBzZWFyY2hfbGltaXQgPSBzdGFydF9pdGVyLmNvcHkoKTtcbiAgICAgICAgY29uc3Qgc2VhcmNoX2VuZCA9IHN0YXJ0X2l0ZXIuY29weSgpO1xuICAgICAgICBzZWFyY2hfbGltaXQuZm9yd2FyZF9jaGFycygxMCk7XG5cbiAgICAgICAgc2VhcmNoX2VuZC5mb3J3YXJkX2ZpbmRfY2hhcigoY2gpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImZvcndhcmQgY2hhclwiLGNoKTtcbiAgICAgICAgICByZXR1cm4gY2ggPT09IFwiIFwiO1xuICAgICAgICB9LCBzZWFyY2hfbGltaXQpO1xuICAgICAgICBzZWFyY2hfZW5kLmZvcndhcmRfY2hhcigpO1xuICAgICAgICBjb25zdCBjaGFycyA9IGJ1ZmZlci5nZXRfdGV4dChzdGFydF9pdGVyLCBzZWFyY2hfZW5kLCBmYWxzZSk7XG5cbiAgICAgICAgY29uc3Qgb3JkZXJlZF9yZWdleF9wYXR0ZXJuID0gL15cXGQrXFwuICQvO1xuICAgICAgICBpZiAob3JkZXJlZF9yZWdleF9wYXR0ZXJuLnRlc3QoY2hhcnMpKSB7XG4gICAgICAgICAgY29uc3QgY3VycmVudF9vcmRlciA9IHBhcnNlSW50KGNoYXJzLnNsaWNlKDAsIC0yKSk7XG4gICAgICAgICAgY29uc3QgbmV3X29yZGVyID0gY3VycmVudF9vcmRlciArIDE7XG4gICAgICAgICAgY29uc3QgbmV3X29yZGVyX2J1bGxldCA9IGAke25ld19vcmRlcn0uIGA7XG4gICAgICAgICAgY29uc3QgbGluZV9lbmQgPSBsb2MuY29weSgpO1xuICAgICAgICAgIGxpbmVfZW5kLmJhY2t3YXJkX2NoYXIoKTtcblxuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIGxpbmVfZW5kLmdldF9saW5lX29mZnNldCgpID09PSBjdXJyZW50X29yZGVyLnRvU3RyaW5nKCkubGVuZ3RoICsgMlxuICAgICAgICAgICkge1xuICAgICAgICAgICAgc3RhcnRfaXRlci5zZXRfbGluZV9vZmZzZXQoMCk7XG4gICAgICAgICAgICBidWZmZXIuZGVsZXRlKHN0YXJ0X2l0ZXIsIGxvYyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJ1ZmZlci5pbnNlcnQobG9jLCBuZXdfb3JkZXJfYnVsbGV0LCAtMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmNvbnN0IGNvbXBhcmVfdGFncyA9IChhOiBJVGFnW10sIGI6IElUYWdbXSkgPT4ge1xuICBpZiAoYS5sZW5ndGggIT0gYi5sZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgZm9yIChjb25zdCB0YWcgb2YgYSkge1xuICAgIGlmIChcbiAgICAgICFiLmZpbmQoKHQpID0+XG4gICAgICAgIHQubmFtZSA9PSB0YWcubmFtZSAmJiB0LnN0YXJ0ID09IHRhZy5zdGFydCAmJiB0LmVuZCA9PSB0YWcuZW5kXG4gICAgICApXG4gICAgKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufTtcbiIsICIvLyBUSElTIEZJTEUgSVMgQVVUT01BVElDQUxMWSBHRU5FUkFURUQgRE8gTk9UIEVESVQgRElSRUNUTFlcbi8vIFNlZSB1cGRhdGUtdGxkcy5qcyBmb3IgZW5jb2RpbmcvZGVjb2RpbmcgZm9ybWF0XG4vLyBodHRwczovL2RhdGEuaWFuYS5vcmcvVExEL3RsZHMtYWxwaGEtYnktZG9tYWluLnR4dFxuY29uc3QgZW5jb2RlZFRsZHMgPSAnYWFhMXJwM2JhcnRoNGIwb3R0M3ZpZTRjMWxlMm9nYWRvNXVkaGFiaTdjMGFkZW15NWNlbnR1cmU2b3VudGFudDBzOW8xdG9yNGQwczF1bHQ0ZTBnMXJvMnRuYTRmMGwxcmljYTVnMGFraGFuNWVuY3k1aTBnMXJidXMzZm9yY2U1dGVsNWtkbjNsMGZhcm9tZW83aWJhYmE0cGF5NGxmaW5hbno2c3RhdGU1eTJzYWNlM3RvbTVtMGF6b240ZXJpY2FuZXhwcmVzczdmYW1pbHkxMXgyZmFtM2ljYTNzdGVyZGFtOG5hbHl0aWNzN2Ryb2lkNXF1YW40ejJvMGwycGFydG1lbnRzOHAwbGU0cTB1YXJlbGxlOHIwYWIxbWNvNGNoaTNteTJwYTJ0MGUzczBkYTJpYTJzb2NpYXRlczl0MGhsZXRhNXRvcm5leTd1MGN0aW9uNWRpMGJsZTNvM3Nwb3N0NXRob3IzbzBzNHZpYW5jYTZ3MHMyeDBhMnowdXJlNWJhMGJ5MmlkdTNuYW1leDNuYXJlcHVibGljMTFkMWsycjBjZWxvbmE1bGF5Y2FyZDRzNWVmb290NWdhaW5zNnNlYmFsbDVrZXRiYWxsOHVoYXVzNXllcm41YjBjMXQxdmEzY2cxbjJkMWUwYXRzMnV0eTRlcjJudGxleTVybGluNHN0MGJ1eTV0MmYxZzFoMGFydGk1aTBibGUzZDFrZTJuZzBvM28xejJqMWxhY2swZnJpZGF5OW9ja2J1c3RlcjhnMW9tYmVyZzd1ZTNtMHMxdzJuMHBwYXJpYmFzOW8wYXRzM2VocmluZ2VyOGZhMm0xbmQybzBrMGluZzVzY2gydGlrMm9uNHQxdXRpcXVlNngycjBhZGVzY282aWRnZXN0b25lOW9hZHdheTVrZXIzdGhlcjV1c3NlbHM3czF0MXVpbGQwZXJzNnNpbmVzczZ5MXp6M3YxdzF5MXowaDNjYTBiMWZlMmwwbDF2aW5rbGVpbjltMGVyYTNwMm5vbjNwZXRvd241aXRhbDBvbmU4cjBhdmFuNGRzMmUwZXIwczRzMnNhMWUxaDFpbm80dDBlcmluZzVob2xpYzdiYTFuMXJlMnMyYzFkMWVudGVyNG8xcm4zZjBhMWQyZzFoMGFuZWwybmVsNHJpdHk0c2UydDJlYXAzaW50YWk1cmlzdG1hczZvbWU0dXJjaDVpMHByaWFuaTZyY2xlNHNjbzN0YWRlbDRpMGMyeTBlYXRzN2sxbDBhaW1zNGVhbmluZzZpY2sybmljMXF1ZTZvdGhpbmc1dWQzdWIwbWVkNm0xbjFvMGFjaDNkZXMzZmZlZTRsbGVnZTRvZ25lNW0wY2FzdDRtYmFuazR1bml0eTZwYW55MnJlM3V0ZXI1c2VjNG5kb3Mzc3RydWN0aW9uOHVsdGluZzd0YWN0M3JhY3RvcnM5b2tpbmcwY2hhbm5lbDExbDFwMnJzaWNhNXVudHJ5NHBvbjBzNHJzZXM2cGEycjBlZGl0MGNhcmQ0dW5pb245aWNrZXQ1b3duM3MxdWlzZTBzNnUwaXNpbmVsbGE5djF3MXgxeTBtcnUzb3UzejJkYWJ1cjNkMW5jZTN0YTFlMWluZzNzdW40eTJjbGszZHMyZTBhbDBlcjJzM2dyZWU0bGl2ZXJ5NWwxb2l0dGU1dGEzbW9jcmF0Nm50YWwyaXN0NXNpMGduNHYyaGwyaWFtb25kczZldDJnaXRhbDVyZWN0MG9yeTdzY291bnQzdmVyNWgyeTJqMWsxbTFucDJvMGNzMXRvcjRnMW1haW5zNXQxd25sb2FkN3JpdmU0dHYydWJhaTNubG9wNHBvbnQ0cmJhbjV2YWcycjJ6MmVhcnRoM3QyYzBvMmRla2EzdTBjYXRpb244ZTFnMW1haWwzZXJjazVuZXJneTRnaW5lZXIwaW5nOXRlcnByaXNlczEwcHNvbjRxdWlwbWVudDhyMGljc3NvbjZuaTNzMHExdGF0ZTV0MGlzYWxhdDd1MHJvdmlzaW9uOHMydmVudHM1eGNoYW5nZTZwZXJ0M29zZWQ0cmVzczV0cmFzcGFjZTEwZmFnZTJpbDFyd2luZHM2dGgzbWlseTRuMHMycm0wZXJzNXNoaW9uNHQzZWRleDNlZGJhY2s2cnJhcmkzZXJvNmkwYXQyZGVsaXR5NW8ybG0ybmFsMW5jZTFpYWw3cmUwc3RvbmU2bWRhbGU2c2gwaW5nNXQwbmVzczZqMWsxbGlja3IzZ2h0czRyMm9yaXN0NHdlcnM1eTJtMW8wbzBkMG5ldHdvcms4dGJhbGw2cmQxZXgyc2FsZTR1bTN1bmRhdGlvbjh4MnIwZWUxc2VuaXVzN2wxb2dhbnM0bnRkb29yNGllcjd0cjJ1aml0c3U1bjBkMnJuaXR1cmU3dGJvbDV5aTNnYTBsMGxlcnkzbzF1cDRtZTBzM3AxcmRlbjR5MmIwaXozZDBuMmUwYTFudDBpbmc1b3JnZTVmMWcwZWUzaDFpMGZ0MHMzdmVzMmluZzVsMGFzczNlMW9iYWwybzRtMGFpbDNiaDJvMXgybjFvZGFkZHk1bGQwcG9pbnQ2ZjJvMGR5ZWFyNWcwbGU0cDF0MXYycDFxMXIwYWluZ2VyNXBoaWNzNXRpczRlZW4zaXBlM29jZXJ5NHVwNHMxdDF1MGFyZGlhbjZjY2kzZ2UyaWRlMnRhcnM1cnUzdzF5MmhhaXIybWJ1cmc1bmdvdXQ1dXMzYm8yZGZjMGJhbms3ZWFsdGgwY2FyZThscDFzaW5raTZyZTFtZXM1Z3R2M2lwaG9wNHNhbWl0c3U3dGFjaGk1djJrMHQybTFuMW9ja2V5NGxkaW5nczVpZGF5NW1lZGVwb3Q1Z29vZHM1czBlbnNlN25kYTNyc2Uzc3BpdGFsNXQwaW5nNXQwZWxlczJzM21haWw1dXNlM3cycjFzYmMzdDF1MGdoZXM1eWF0dDN1bmRhaTdpYm0yY2JjMmUxdTJkMWUwZWUzZm0ya2FubzRsMW0wYW1hdDRkYjJtbzBiaWxpZW45bjBjMWR1c3RyaWVzOGZpbml0aTVvMmcxazFzdGl0dXRlNnVyYW5jZTRlNHQwZXJuYXRpb25hbDEwdWl0NHZlc3RtZW50czEwbzFwaXJhbmdhN3ExcjBpc2g0czBtYWlsaTV0MGFuYnVsN3QwYXUydjNqYWd1YXI0dmEzY2IyZTBlcDJ0enQzd2Vscnk2aW8ybGwybTBwMm5qMm8wYnMxdXJnNHQxeTJwMG1vcmdhbjZyczN1ZWdvczRuaXBlcjdrYXVmZW41ZGRpM2UwcnJ5aG90ZWxzNmxvZ2lzdGljczlwcm9wZXJ0aWVzMTRmaDJnMWgxaTBhMWRzMm0xbmRlcjJsZTR0Y2hlbjV3aTNtMW4xb2VsbjNtYXRzdTVzaGVyNXAwbWcybjJyMGQxZWQzdW9rZ3JvdXA4dzF5MG90bzR6MmxhMGNhaXhhNW1ib3JnaGluaThlcjNuY2FzdGVyNWlhM2Qwcm92ZXI2eGVzczVzYWxsZTV0MGlubzNyb2JlNXcweWVyNWIxYzFkczJlYXNlM2NsZXJjNWZyYWs0Z2FsMm8yeHVzNGdidDNpMGRsMmZlMGluc3VyYW5jZTlzdHlsZTdnaHRpbmc2a2UybGx5M21pdGVkNG8ybmNvbG40ZGUyazJwc3kzdmUxaW5nNWsxbGMxcDJvYW4wczNja2VyM3VzM2wxbmRvbjR0dGUxbzN2ZTNwbDBmaW5hbmNpYWwxMXIxczF0MGQwYTN1MG5kYmVjazZ4ZTF1cnk1djF5Mm1hMGN5czNkcmlkNGlmMXNvbjRrZXVwNG4wYWdlbWVudDdnbzNwMXJrZXQwaW5nM3M0cmlvdHQ1c2hhbGxzN3NlcmF0aTZ0dGVsNWJhMmMwa2luc2V5N2QxZTBkMGlhM2V0Mmxib3VybmU3bWUxb3JpYWw2bjB1MnJja21zZDdnMWgxaWFtaTNjcm9zb2Z0N2wxbmkxdDJ0MHN1YmlzaGk5azFsMGIxczJtMGEybjFvMGJpMGxlNGRhMmUxaTFtMW5hc2gzZXkyc3RlcjVybW9uM3RnYWdlNnNjb3c0dG8wcmN5Y2xlczl2MGllNHAxcTFyMXMwZDJ0MG4xcjJ1MHNldW0zaWMzdHVhbDV2MXcxeDF5MXoybmEwYjFnb3lhNG1lMnR1cmE0dnkzYmEyYzFlMGMxdDBiYW5rNGZsaXg0d29yazV1c3RhcjV3MHMyeHQwZGlyZWN0N3VzNGYwbDJnMG8yaGsyaTBjbzJrZTFvbjNuamEzc3NhbjF5NWwxbzBraWEzcnRod2VzdGVybm11dHVhbDE0b240dzBydXozdHY0cDFyMGExdzJ0dDJ1MXljMnoyb2JpMXNlcnZlcjdmZmljZTVraW5hd2E2bGF5YW4wZ3JvdXA5ZG5hdnk1bG8zbTBlZ2E0bmUxZzFsMGluZTVvbzJwZW4zcmFjbGUzbmdlNGcwYW5pYzVpZ2luczZzYWthNHRzdWthNHQydmgzcGEwZ2UybmFzb25pYzdyaXMyczF0bmVyczRzMXkzc3NhZ2Vuczd5MmNjdzNlMHQyZjBpemVyNWcxaDBhcm1hY3k2ZDFpbGlwczVvbmUydG8wZ3JhcGh5NnM0eXNpbzVpY3MxdGV0MnVyZXM2ZDFuMGcxazJvbmVlcjV6emE0azFsMGFjZTJ5MHN0YXRpb245dW1iaW5nNXMzbTFuMGMyb2hsMmtlcjNsaXRpZTVybjJzdDNyMGFtZXJpY2E2eGkzZXNzM2ltZTNvMGQwdWN0aW9uczhmMWdyZXNzaXZlOG1vMnBlcnRpZXMzeTV0ZWN0aW9uOHUwZGVudGlhbDlzMXQxdWIydzBjMnkycWExcG9uM3VlYmVjM3N0NXJhY2luZzRkaW80ZTBhZDFsZXN0YXRlNnRvcjJ5NGNpcGVzNWQwc3RvbmU1dW1icmVsbGE5aGFiM2lzZTBuM3QybGlhbmNlNm4wdDBhbHM1cGFpcjNvcnQzdWJsaWNhbjhzdDBhdXJhbnQ4dmlldzBzNXhyb3RoNmljaDBhcmRsaTZvaDNsMW8xcDJvMGNoZXIza3MzZGVvM2dlcnM0b20zczB2cDN1MGdieTNocjJuMncwZTJ5dWt5dTZzYTBhcmxhbmQ2ZmUwdHk0a3VyYTRsZTFvbjNtc2NsdWI0dW5nNW5kdmlrMGNvcm9tYW50MTJvZmk0cDFybDJzMXZlMnhvM2IwaTFzMmMwYTFiMWhhZWZmbGVyN21pZHQ0b2xhcnNoaXBzOG9sM3VsZTN3YXJ6NWllbmNlNW90M2QxZTBhcmNoM3QyY3VyZTFpdHk2ZWsybGVjdDRuZXIzcnZpY2VzNnZlbjN3MXgweTNmcjJnMWgwYW5ncmlsYTZycDJ3MmVsbDNpYTFrc2hhNW9lczJwMHBpbmc1dWppM3cwdGltZTdpMGxrMm5hMWdsZXM1dGUzajFrMGkwbjJ5MHBlNGwwaW5nNG0wYXJ0M2lsZTRuMGNmM28wY2NlcjNpYWw0ZnRiYW5rNHdhcmU2aHUybGFyMnV0aW9uczduZzF5MnkycGEwY2Uzb3J0MnQzcjBsMnMxdDBhZGEycGxlczRyMXRlYmFuazRmYXJtN2MwZ3JvdXA2b2NraG9sbTZyYWdlM2UzcmVhbTR1ZGlvMnkzeWxlNHUwY2tzM3BwbGllczN5Mm9ydDVyZjFnZXJ5NXp1a2k1djF3YXRjaDRpc3M0eDF5MGRuZXk0c3RlbXM2ejJ0YWIxaXBlaTRsazJvYmFvNHJnZXQ0dGFtb3RvcnM2cjJ0b280eDBpM2MwaTJkMGsyZWFtMmNoMG5vbG9neThsMW1hc2VrNW5uaXM0dmEzZjFnMWgwZDFlYXRlcjJyZTZpYWEyY2tldHM1ZW5kYTRmZmFueTVwczJyZXMyb2w0ajBtYXh4NHgyazBtYXh4NWwxbTBhbGw0bjFvMGRheTNreW8zb2xzM3AxcmF5M3NoaWJhNXRhbDN1cnMzd24yeW90YTNzM3IwYWRlMWluZzRpbmluZzV2ZWwwY2hhbm5lbDdlcnMwaW5zdXJhbmNlMTZ1c3QzdjJ0MXViZTJpMW5lczNzaHU0djBzMncxejJ1YTFiYW5rM3MyZzFrMW5pY29tM3ZlcnNpdHk4bzJvbDJwczJzMXkxejJ2YTBjYXRpb25zN25hMWd1YXJkN2MxZTBnYXMzbnR1cmVzNnJpc2lnbjVtXHUwMEY2Z2Vuc2JlcmF0ZXIydW5nMTRzaWNoZXJ1bmcxMHQyZzFpMGFqZXM0ZGVvM2cxa2luZzRsbGFzNG4xcDFyZ2luNHNhMWlvbjR2YTFvM2xhYW5kZXJlbjluMW9ka2EzbGtzd2FnZW43dm8zdGUxaW5nM28yeWFnZTV1MGVsb3M2d2FsZXMybWFydDR0ZXI0bmcwZ291NXRjaDBlczZlYXRoZXIwY2hhbm5lbDEyYmNhbTNlcjJzaXRlNWQwZGluZzVpYm8ycjNmMWhvc3dobzZpZW4ya2kybGxpYW1oaWxsOW4wZG93czRlMW5lcnM2bWUyb2x0ZXJza2x1d2VyMTFvZHNpZGU2cmswczJsZDN3MnMxdGMxZjN4Ym94M2Vyb3g0ZmluaXR5NmlodWFuNG4yeHgyeXozeWFjaHRzNGhvbzNtYXh1bjVuZGV4NWUxb2RvYmFzaGk3Z2Eya29oYW1hNnUwdHViZTZ0MXVuM3phMHBwb3M0cmEzZXJvM2lwMm0xb25lM3VlcmljaDZ3Mic7XG4vLyBJbnRlcm5hdGlvbmFsaXplZCBkb21haW4gbmFtZXMgY29udGFpbmluZyBub24tQVNDSUlcbmNvbnN0IGVuY29kZWRVdGxkcyA9ICdcdTAzQjVcdTAzQkIxXHUwM0M1Mlx1MDQzMVx1MDQzMzFcdTA0MzVcdTA0M0IzXHUwNDM0XHUwNDM1XHUwNDQyXHUwNDM4NFx1MDQzNVx1MDQ0RTJcdTA0M0FcdTA0MzBcdTA0NDJcdTA0M0VcdTA0M0JcdTA0MzhcdTA0M0E2XHUwNDNFXHUwNDNDM1x1MDQzQ1x1MDQzQVx1MDQzNDJcdTA0M0VcdTA0M0QxXHUwNDQxXHUwNDNBXHUwNDMyXHUwNDMwNlx1MDQzRVx1MDQzRFx1MDQzQlx1MDQzMFx1MDQzOVx1MDQzRDVcdTA0NDBcdTA0MzMzXHUwNDQwXHUwNDQzXHUwNDQxMlx1MDQ0NDJcdTA0NDFcdTA0MzBcdTA0MzlcdTA0NDIzXHUwNDQwXHUwNDMxM1x1MDQ0M1x1MDQzQVx1MDQ0MDNcdTA0OUJcdTA0MzBcdTA0MzczXHUwNTcwXHUwNTYxXHUwNTc1M1x1MDVEOVx1MDVFOVx1MDVFOFx1MDVEMFx1MDVEQzVcdTA1RTdcdTA1RDVcdTA1REQzXHUwNjI3XHUwNjI4XHUwNjQ4XHUwNjM4XHUwNjI4XHUwNjRBNVx1MDYyQVx1MDYzNVx1MDYyN1x1MDY0NFx1MDYyN1x1MDYyQTZcdTA2MzFcdTA2MjdcdTA2NDVcdTA2NDNcdTA2NDg1XHUwNjQ0XHUwNjI3XHUwNjMxXHUwNjJGXHUwNjQ2NFx1MDYyOFx1MDYyRFx1MDYzMVx1MDY0QVx1MDY0NjVcdTA2MkNcdTA2MzJcdTA2MjdcdTA2MjZcdTA2MzE1XHUwNjMzXHUwNjM5XHUwNjQ4XHUwNjJGXHUwNjRBXHUwNjI5Nlx1MDYzOVx1MDY0NFx1MDY0QVx1MDYyN1x1MDY0NjVcdTA2NDVcdTA2M0FcdTA2MzFcdTA2Mjg1XHUwNjQ1XHUwNjI3XHUwNjMxXHUwNjI3XHUwNjJBNVx1MDZDQ1x1MDYzMVx1MDYyN1x1MDY0NjVcdTA2MjhcdTA2MjdcdTA2MzFcdTA2MkEyXHUwNjMyXHUwNjI3XHUwNjMxNFx1MDY0QVx1MDYyQVx1MDY0MzNcdTA2QkVcdTA2MjdcdTA2MzFcdTA2MkE1XHUwNjJBXHUwNjQ4XHUwNjQ2XHUwNjMzNFx1MDYzM1x1MDY0OFx1MDYyRlx1MDYyN1x1MDY0NjNcdTA2MzFcdTA2NEFcdTA2Mjk1XHUwNjM0XHUwNjI4XHUwNjQzXHUwNjI5NFx1MDYzOVx1MDYzMVx1MDYyN1x1MDY0MjJcdTA2MjgyXHUwNjQ1XHUwNjI3XHUwNjQ2NFx1MDY0MVx1MDY0NFx1MDYzM1x1MDYzN1x1MDY0QVx1MDY0NjZcdTA2NDJcdTA2MzdcdTA2MzEzXHUwNjQzXHUwNjI3XHUwNjJCXHUwNjQ4XHUwNjQ0XHUwNjRBXHUwNjQzNlx1MDY0OFx1MDY0NTNcdTA2NDVcdTA2MzVcdTA2MzEyXHUwNjQ0XHUwNjRBXHUwNjMzXHUwNjRBXHUwNjI3NVx1MDY0OFx1MDYzMVx1MDY0QVx1MDYyQVx1MDYyN1x1MDY0Nlx1MDY0QVx1MDYyNzdcdTA2NDJcdTA2Mzk0XHUwNjQ3XHUwNjQ1XHUwNjMxXHUwNjI3XHUwNjQ3NVx1MDY3RVx1MDYyN1x1MDZBOVx1MDYzM1x1MDYyQVx1MDYyN1x1MDY0NjdcdTA2ODBcdTA2MjdcdTA2MzFcdTA2MkE0XHUwOTE1XHUwOTQ5XHUwOTJFM1x1MDkyOFx1MDk0N1x1MDkxRjNcdTA5MkRcdTA5M0VcdTA5MzBcdTA5MjQwXHUwOTJFXHUwOTREM1x1MDk0Qlx1MDkyNDVcdTA5MzhcdTA5MDJcdTA5MTdcdTA5MjBcdTA5Mjg1XHUwOUFDXHUwOUJFXHUwOTgyXHUwOUIyXHUwOUJFNVx1MDlBRFx1MDlCRVx1MDlCMFx1MDlBNDJcdTA5RjBcdTA5QTQ0XHUwQTJEXHUwQTNFXHUwQTMwXHUwQTI0NFx1MEFBRFx1MEFCRVx1MEFCMFx1MEFBNDRcdTBCMkRcdTBCM0VcdTBCMzBcdTBCMjQ0XHUwQjg3XHUwQkE4XHUwQkNEXHUwQkE0XHUwQkJGXHUwQkFGXHUwQkJFNlx1MEJCMlx1MEI5OVx1MEJDRFx1MEI5NVx1MEJDODZcdTBCOUFcdTBCQkZcdTBCOTlcdTBCQ0RcdTBCOTVcdTBCQUFcdTBCQ0RcdTBCQUFcdTBCQzJcdTBCQjBcdTBCQ0QxMVx1MEMyRFx1MEMzRVx1MEMzMFx1MEMyNFx1MEM0RDVcdTBDQURcdTBDQkVcdTBDQjBcdTBDQTQ0XHUwRDJEXHUwRDNFXHUwRDMwXHUwRDI0XHUwRDAyNVx1MERCRFx1MEQ4Mlx1MEQ5QVx1MERDRjRcdTBFMDRcdTBFMkRcdTBFMjEzXHUwRTQ0XHUwRTE3XHUwRTIyM1x1MEVBNVx1MEVCMlx1MEVBNzNcdTEwRDJcdTEwRDQyXHUzMDdGXHUzMDkzXHUzMDZBM1x1MzBBMlx1MzBERVx1MzBCRVx1MzBGMzRcdTMwQUZcdTMwRTlcdTMwQTZcdTMwQzk0XHUzMEIwXHUzMEZDXHUzMEIwXHUzMEVCNFx1MzBCM1x1MzBFMDJcdTMwQjlcdTMwQzhcdTMwQTIzXHUzMEJCXHUzMEZDXHUzMEVCM1x1MzBENVx1MzBBMVx1MzBDM1x1MzBCN1x1MzBFN1x1MzBGMzZcdTMwRERcdTMwQTRcdTMwRjNcdTMwQzg0XHU0RTE2XHU3NTRDMlx1NEUyRFx1NEZFMTFcdTU2RkQxXHU1NzBCMVx1NjU4N1x1N0Y1MTNcdTRFOUFcdTlBNkNcdTkwMEEzXHU0RjAxXHU0RTFBMlx1NEY1Qlx1NUM3MTJcdTRGRTFcdTYwNkYyXHU1MDY1XHU1RUI3Mlx1NTE2Qlx1NTM2NjJcdTUxNkNcdTUzRjgxXHU3NkNBMlx1NTNGMFx1NkU3RTFcdTcwNjMyXHU1NTQ2XHU1N0NFMVx1NUU5NzFcdTY4MDcyXHU1NjA5XHU5MUNDMFx1NTkyN1x1OTE1Mlx1NUU5NzVcdTU3MjhcdTdFQkYyXHU1OTI3XHU2MkZGMlx1NTkyOVx1NEUzQlx1NjU1OTNcdTVBMzFcdTRFNTAyXHU1QkI2XHU5NkZCMlx1NUU3Rlx1NEUxQzJcdTVGQUVcdTUzNUEyXHU2MTQ4XHU1NTg0Mlx1NjIxMVx1NzIzMVx1NEY2MDNcdTYyNEJcdTY3M0EyXHU2MkRCXHU4MDU4Mlx1NjUzRlx1NTJBMTFcdTVFOUMyXHU2NUIwXHU1MkEwXHU1NzYxMlx1OTVGQjJcdTY1RjZcdTVDMUEyXHU2NkY4XHU3QzREMlx1NjczQVx1Njc4NDJcdTZERTFcdTlBNkNcdTk1MjEzXHU2RTM4XHU2MjBGMlx1NkZCM1x1OTU4MDJcdTcwQjlcdTc3MEIyXHU3OUZCXHU1MkE4Mlx1N0VDNFx1N0VDN1x1NjczQVx1Njc4NDRcdTdGNTFcdTU3NDAxXHU1RTk3MVx1N0FEOTFcdTdFREMyXHU4MDU0XHU5MDFBMlx1OEMzN1x1NkI0QzJcdThEMkRcdTcyNjkyXHU5MDFBXHU4Q0E5Mlx1OTZDNlx1NTZFMjJcdTk2RkJcdThBMEFcdTc2QzhcdTc5RDE0XHU5OERFXHU1MjI5XHU2RDY2M1x1OThERlx1NTRDMTJcdTk5MTBcdTUzODUyXHU5OTk5XHU2ODNDXHU5MUNDXHU2MkM5M1x1NkUyRjJcdUIyRjdcdUIxMzcxXHVDRUY0Mlx1QzBCQ1x1QzEzMTJcdUQ1NUNcdUFENkQyJztcblxuLyoqXG4gKiBAdGVtcGxhdGUgQVxuICogQHRlbXBsYXRlIEJcbiAqIEBwYXJhbSB7QX0gdGFyZ2V0XG4gKiBAcGFyYW0ge0J9IHByb3BlcnRpZXNcbiAqIEByZXR1cm4ge0EgJiBCfVxuICovXG5jb25zdCBhc3NpZ24gPSAodGFyZ2V0LCBwcm9wZXJ0aWVzKSA9PiB7XG4gIGZvciAoY29uc3Qga2V5IGluIHByb3BlcnRpZXMpIHtcbiAgICB0YXJnZXRba2V5XSA9IHByb3BlcnRpZXNba2V5XTtcbiAgfVxuICByZXR1cm4gdGFyZ2V0O1xufTtcblxuLyoqXG4gKiBGaW5pdGUgU3RhdGUgTWFjaGluZSBnZW5lcmF0aW9uIHV0aWxpdGllc1xuICovXG5cbi8qKlxuICogQHRlbXBsYXRlIFRcbiAqIEB0eXBlZGVmIHt7IFtncm91cDogc3RyaW5nXTogVFtdIH19IENvbGxlY3Rpb25zXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7eyBbZ3JvdXA6IHN0cmluZ106IHRydWUgfX0gRmxhZ3NcbiAqL1xuXG4vLyBLZXlzIGluIHNjYW5uZXIgQ29sbGVjdGlvbnMgaW5zdGFuY2VzXG5jb25zdCBudW1lcmljID0gJ251bWVyaWMnO1xuY29uc3QgYXNjaWkgPSAnYXNjaWknO1xuY29uc3QgYWxwaGEgPSAnYWxwaGEnO1xuY29uc3QgYXNjaWludW1lcmljID0gJ2FzY2lpbnVtZXJpYyc7XG5jb25zdCBhbHBoYW51bWVyaWMgPSAnYWxwaGFudW1lcmljJztcbmNvbnN0IGRvbWFpbiA9ICdkb21haW4nO1xuY29uc3QgZW1vamkgPSAnZW1vamknO1xuY29uc3Qgc2NoZW1lID0gJ3NjaGVtZSc7XG5jb25zdCBzbGFzaHNjaGVtZSA9ICdzbGFzaHNjaGVtZSc7XG5jb25zdCB3aGl0ZXNwYWNlID0gJ3doaXRlc3BhY2UnO1xuXG4vKipcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICogQHBhcmFtIHtDb2xsZWN0aW9uczxUPn0gZ3JvdXBzIHRvIHJlZ2lzdGVyIGluXG4gKiBAcmV0dXJucyB7VFtdfSBDdXJyZW50IGxpc3Qgb2YgdG9rZW5zIGluIHRoZSBnaXZlbiBjb2xsZWN0aW9uXG4gKi9cbmZ1bmN0aW9uIHJlZ2lzdGVyR3JvdXAobmFtZSwgZ3JvdXBzKSB7XG4gIGlmICghKG5hbWUgaW4gZ3JvdXBzKSkge1xuICAgIGdyb3Vwc1tuYW1lXSA9IFtdO1xuICB9XG4gIHJldHVybiBncm91cHNbbmFtZV07XG59XG5cbi8qKlxuICogQHRlbXBsYXRlIFRcbiAqIEBwYXJhbSB7VH0gdCB0b2tlbiB0byBhZGRcbiAqIEBwYXJhbSB7Q29sbGVjdGlvbnM8VD59IGdyb3Vwc1xuICogQHBhcmFtIHtGbGFnc30gZmxhZ3NcbiAqL1xuZnVuY3Rpb24gYWRkVG9Hcm91cHModCwgZmxhZ3MsIGdyb3Vwcykge1xuICBpZiAoZmxhZ3NbbnVtZXJpY10pIHtcbiAgICBmbGFnc1thc2NpaW51bWVyaWNdID0gdHJ1ZTtcbiAgICBmbGFnc1thbHBoYW51bWVyaWNdID0gdHJ1ZTtcbiAgfVxuICBpZiAoZmxhZ3NbYXNjaWldKSB7XG4gICAgZmxhZ3NbYXNjaWludW1lcmljXSA9IHRydWU7XG4gICAgZmxhZ3NbYWxwaGFdID0gdHJ1ZTtcbiAgfVxuICBpZiAoZmxhZ3NbYXNjaWludW1lcmljXSkge1xuICAgIGZsYWdzW2FscGhhbnVtZXJpY10gPSB0cnVlO1xuICB9XG4gIGlmIChmbGFnc1thbHBoYV0pIHtcbiAgICBmbGFnc1thbHBoYW51bWVyaWNdID0gdHJ1ZTtcbiAgfVxuICBpZiAoZmxhZ3NbYWxwaGFudW1lcmljXSkge1xuICAgIGZsYWdzW2RvbWFpbl0gPSB0cnVlO1xuICB9XG4gIGlmIChmbGFnc1tlbW9qaV0pIHtcbiAgICBmbGFnc1tkb21haW5dID0gdHJ1ZTtcbiAgfVxuICBmb3IgKGNvbnN0IGsgaW4gZmxhZ3MpIHtcbiAgICBjb25zdCBncm91cCA9IHJlZ2lzdGVyR3JvdXAoaywgZ3JvdXBzKTtcbiAgICBpZiAoZ3JvdXAuaW5kZXhPZih0KSA8IDApIHtcbiAgICAgIGdyb3VwLnB1c2godCk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQHRlbXBsYXRlIFRcbiAqIEBwYXJhbSB7VH0gdCB0b2tlbiB0byBjaGVja1xuICogQHBhcmFtIHtDb2xsZWN0aW9uczxUPn0gZ3JvdXBzXG4gKiBAcmV0dXJucyB7RmxhZ3N9IGdyb3VwIGZsYWdzIHRoYXQgY29udGFpbiB0aGlzIHRva2VuXG4gKi9cbmZ1bmN0aW9uIGZsYWdzRm9yVG9rZW4odCwgZ3JvdXBzKSB7XG4gIGNvbnN0IHJlc3VsdCA9IHt9O1xuICBmb3IgKGNvbnN0IGMgaW4gZ3JvdXBzKSB7XG4gICAgaWYgKGdyb3Vwc1tjXS5pbmRleE9mKHQpID49IDApIHtcbiAgICAgIHJlc3VsdFtjXSA9IHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogQHRlbXBsYXRlIFRcbiAqIEB0eXBlZGVmIHtudWxsIHwgVCB9IFRyYW5zaXRpb25cbiAqL1xuXG4vKipcbiAqIERlZmluZSBhIGJhc2ljIHN0YXRlIG1hY2hpbmUgc3RhdGUuIGogaXMgdGhlIGxpc3Qgb2YgY2hhcmFjdGVyIHRyYW5zaXRpb25zLFxuICoganIgaXMgdGhlIGxpc3Qgb2YgcmVnZXgtbWF0Y2ggdHJhbnNpdGlvbnMsIGpkIGlzIHRoZSBkZWZhdWx0IHN0YXRlIHRvXG4gKiB0cmFuc2l0aW9uIHRvIHQgaXMgdGhlIGFjY2VwdGluZyB0b2tlbiB0eXBlLCBpZiBhbnkuIElmIHRoaXMgaXMgdGhlIHRlcm1pbmFsXG4gKiBzdGF0ZSwgdGhlbiBpdCBkb2VzIG5vdCBlbWl0IGEgdG9rZW4uXG4gKlxuICogVGhlIHRlbXBsYXRlIHR5cGUgVCByZXByZXNlbnRzIHRoZSB0eXBlIG9mIHRoZSB0b2tlbiB0aGlzIHN0YXRlIGFjY2VwdHMuIFRoaXNcbiAqIHNob3VsZCBiZSBhIHN0cmluZyAoc3VjaCBhcyBvZiB0aGUgdG9rZW4gZXhwb3J0cyBpbiBgdGV4dC5qc2ApIG9yIGFcbiAqIE11bHRpVG9rZW4gc3ViY2xhc3MgKGZyb20gYG11bHRpLmpzYClcbiAqXG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHtUfSBbdG9rZW5dIFRva2VuIHRoYXQgdGhpcyBzdGF0ZSBlbWl0c1xuICovXG5mdW5jdGlvbiBTdGF0ZSh0b2tlbikge1xuICBpZiAodG9rZW4gPT09IHZvaWQgMCkge1xuICAgIHRva2VuID0gbnVsbDtcbiAgfVxuICAvLyB0aGlzLm4gPSBudWxsOyAvLyBERUJVRzogU3RhdGUgbmFtZVxuICAvKiogQHR5cGUge3sgW2lucHV0OiBzdHJpbmddOiBTdGF0ZTxUPiB9fSBqICovXG4gIHRoaXMuaiA9IHt9OyAvLyBJTVBMRU1FTlRBVElPTiAxXG4gIC8vIHRoaXMuaiA9IFtdOyAvLyBJTVBMRU1FTlRBVElPTiAyXG4gIC8qKiBAdHlwZSB7W1JlZ0V4cCwgU3RhdGU8VD5dW119IGpyICovXG4gIHRoaXMuanIgPSBbXTtcbiAgLyoqIEB0eXBlIHs/U3RhdGU8VD59IGpkICovXG4gIHRoaXMuamQgPSBudWxsO1xuICAvKiogQHR5cGUgez9UfSB0ICovXG4gIHRoaXMudCA9IHRva2VuO1xufVxuXG4vKipcbiAqIFNjYW5uZXIgdG9rZW4gZ3JvdXBzXG4gKiBAdHlwZSBDb2xsZWN0aW9uczxzdHJpbmc+XG4gKi9cblN0YXRlLmdyb3VwcyA9IHt9O1xuU3RhdGUucHJvdG90eXBlID0ge1xuICBhY2NlcHRzKCkge1xuICAgIHJldHVybiAhIXRoaXMudDtcbiAgfSxcbiAgLyoqXG4gICAqIEZvbGxvdyBhbiBleGlzdGluZyB0cmFuc2l0aW9uIGZyb20gdGhlIGdpdmVuIGlucHV0IHRvIHRoZSBuZXh0IHN0YXRlLlxuICAgKiBEb2VzIG5vdCBtdXRhdGUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBpbnB1dCBjaGFyYWN0ZXIgb3IgdG9rZW4gdHlwZSB0byB0cmFuc2l0aW9uIG9uXG4gICAqIEByZXR1cm5zIHs/U3RhdGU8VD59IHRoZSBuZXh0IHN0YXRlLCBpZiBhbnlcbiAgICovXG4gIGdvKGlucHV0KSB7XG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzO1xuICAgIGNvbnN0IG5leHRTdGF0ZSA9IHN0YXRlLmpbaW5wdXRdO1xuICAgIGlmIChuZXh0U3RhdGUpIHtcbiAgICAgIHJldHVybiBuZXh0U3RhdGU7XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RhdGUuanIubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHJlZ2V4ID0gc3RhdGUuanJbaV1bMF07XG4gICAgICBjb25zdCBuZXh0U3RhdGUgPSBzdGF0ZS5qcltpXVsxXTsgLy8gbm90ZTogbWlnaHQgYmUgZW1wdHkgdG8gcHJldmVudCBkZWZhdWx0IGp1bXBcbiAgICAgIGlmIChuZXh0U3RhdGUgJiYgcmVnZXgudGVzdChpbnB1dCkpIHtcbiAgICAgICAgcmV0dXJuIG5leHRTdGF0ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gTm93aGVyZSBsZWZ0IHRvIGp1bXAhIFJldHVybiBkZWZhdWx0LCBpZiBhbnlcbiAgICByZXR1cm4gc3RhdGUuamQ7XG4gIH0sXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBzdGF0ZSBoYXMgYSB0cmFuc2l0aW9uIGZvciB0aGUgZ2l2ZW4gaW5wdXQuIFNldCB0aGUgc2Vjb25kXG4gICAqIGFyZ3VtZW50IHRvIHRydWUgdG8gb25seSBsb29rIGZvciBhbiBleGFjdCBtYXRjaCAoYW5kIG5vdCBhIGRlZmF1bHQgb3JcbiAgICogcmVndWxhci1leHByZXNzaW9uLWJhc2VkIHRyYW5zaXRpb24pXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBpbnB1dFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGV4YWN0T25seVxuICAgKi9cbiAgaGFzKGlucHV0LCBleGFjdE9ubHkpIHtcbiAgICBpZiAoZXhhY3RPbmx5ID09PSB2b2lkIDApIHtcbiAgICAgIGV4YWN0T25seSA9IGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gZXhhY3RPbmx5ID8gaW5wdXQgaW4gdGhpcy5qIDogISF0aGlzLmdvKGlucHV0KTtcbiAgfSxcbiAgLyoqXG4gICAqIFNob3J0IGZvciBcInRyYW5zaXRpb24gYWxsXCI7IGNyZWF0ZSBhIHRyYW5zaXRpb24gZnJvbSB0aGUgYXJyYXkgb2YgaXRlbXNcbiAgICogaW4gdGhlIGdpdmVuIGxpc3QgdG8gdGhlIHNhbWUgZmluYWwgcmVzdWx0aW5nIHN0YXRlLlxuICAgKiBAcGFyYW0ge3N0cmluZyB8IHN0cmluZ1tdfSBpbnB1dHMgR3JvdXAgb2YgaW5wdXRzIHRvIHRyYW5zaXRpb24gb25cbiAgICogQHBhcmFtIHtUcmFuc2l0aW9uPFQ+IHwgU3RhdGU8VD59IFtuZXh0XSBUcmFuc2l0aW9uIG9wdGlvbnNcbiAgICogQHBhcmFtIHtGbGFnc30gW2ZsYWdzXSBDb2xsZWN0aW9ucyBmbGFncyB0byBhZGQgdG9rZW4gdG9cbiAgICogQHBhcmFtIHtDb2xsZWN0aW9uczxUPn0gW2dyb3Vwc10gTWFzdGVyIGxpc3Qgb2YgdG9rZW4gZ3JvdXBzXG4gICAqL1xuICB0YShpbnB1dHMsIG5leHQsIGZsYWdzLCBncm91cHMpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0cy5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy50dChpbnB1dHNbaV0sIG5leHQsIGZsYWdzLCBncm91cHMpO1xuICAgIH1cbiAgfSxcbiAgLyoqXG4gICAqIFNob3J0IGZvciBcInRha2UgcmVnZXhwIHRyYW5zaXRpb25cIjsgZGVmaW5lcyBhIHRyYW5zaXRpb24gZm9yIHRoaXMgc3RhdGVcbiAgICogd2hlbiBpdCBlbmNvdW50ZXJzIGEgdG9rZW4gd2hpY2ggbWF0Y2hlcyB0aGUgZ2l2ZW4gcmVndWxhciBleHByZXNzaW9uXG4gICAqIEBwYXJhbSB7UmVnRXhwfSByZWdleHAgUmVndWxhciBleHByZXNzaW9uIHRyYW5zaXRpb24gKHBvcHVsYXRlIGZpcnN0KVxuICAgKiBAcGFyYW0ge1QgfCBTdGF0ZTxUPn0gW25leHRdIFRyYW5zaXRpb24gb3B0aW9uc1xuICAgKiBAcGFyYW0ge0ZsYWdzfSBbZmxhZ3NdIENvbGxlY3Rpb25zIGZsYWdzIHRvIGFkZCB0b2tlbiB0b1xuICAgKiBAcGFyYW0ge0NvbGxlY3Rpb25zPFQ+fSBbZ3JvdXBzXSBNYXN0ZXIgbGlzdCBvZiB0b2tlbiBncm91cHNcbiAgICogQHJldHVybnMge1N0YXRlPFQ+fSB0YWtlbiBhZnRlciB0aGUgZ2l2ZW4gaW5wdXRcbiAgICovXG4gIHRyKHJlZ2V4cCwgbmV4dCwgZmxhZ3MsIGdyb3Vwcykge1xuICAgIGdyb3VwcyA9IGdyb3VwcyB8fCBTdGF0ZS5ncm91cHM7XG4gICAgbGV0IG5leHRTdGF0ZTtcbiAgICBpZiAobmV4dCAmJiBuZXh0LmopIHtcbiAgICAgIG5leHRTdGF0ZSA9IG5leHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRva2VuIHdpdGggbWF5YmUgdG9rZW4gZ3JvdXBzXG4gICAgICBuZXh0U3RhdGUgPSBuZXcgU3RhdGUobmV4dCk7XG4gICAgICBpZiAoZmxhZ3MgJiYgZ3JvdXBzKSB7XG4gICAgICAgIGFkZFRvR3JvdXBzKG5leHQsIGZsYWdzLCBncm91cHMpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmpyLnB1c2goW3JlZ2V4cCwgbmV4dFN0YXRlXSk7XG4gICAgcmV0dXJuIG5leHRTdGF0ZTtcbiAgfSxcbiAgLyoqXG4gICAqIFNob3J0IGZvciBcInRha2UgdHJhbnNpdGlvbnNcIiwgd2lsbCB0YWtlIGFzIG1hbnkgc2VxdWVudGlhbCB0cmFuc2l0aW9ucyBhc1xuICAgKiB0aGUgbGVuZ3RoIG9mIHRoZSBnaXZlbiBpbnB1dCBhbmQgcmV0dXJucyB0aGVcbiAgICogcmVzdWx0aW5nIGZpbmFsIHN0YXRlLlxuICAgKiBAcGFyYW0ge3N0cmluZyB8IHN0cmluZ1tdfSBpbnB1dFxuICAgKiBAcGFyYW0ge1QgfCBTdGF0ZTxUPn0gW25leHRdIFRyYW5zaXRpb24gb3B0aW9uc1xuICAgKiBAcGFyYW0ge0ZsYWdzfSBbZmxhZ3NdIENvbGxlY3Rpb25zIGZsYWdzIHRvIGFkZCB0b2tlbiB0b1xuICAgKiBAcGFyYW0ge0NvbGxlY3Rpb25zPFQ+fSBbZ3JvdXBzXSBNYXN0ZXIgbGlzdCBvZiB0b2tlbiBncm91cHNcbiAgICogQHJldHVybnMge1N0YXRlPFQ+fSB0YWtlbiBhZnRlciB0aGUgZ2l2ZW4gaW5wdXRcbiAgICovXG4gIHRzKGlucHV0LCBuZXh0LCBmbGFncywgZ3JvdXBzKSB7XG4gICAgbGV0IHN0YXRlID0gdGhpcztcbiAgICBjb25zdCBsZW4gPSBpbnB1dC5sZW5ndGg7XG4gICAgaWYgKCFsZW4pIHtcbiAgICAgIHJldHVybiBzdGF0ZTtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW4gLSAxOyBpKyspIHtcbiAgICAgIHN0YXRlID0gc3RhdGUudHQoaW5wdXRbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gc3RhdGUudHQoaW5wdXRbbGVuIC0gMV0sIG5leHQsIGZsYWdzLCBncm91cHMpO1xuICB9LFxuICAvKipcbiAgICogU2hvcnQgZm9yIFwidGFrZSB0cmFuc2l0aW9uXCIsIHRoaXMgaXMgYSBtZXRob2QgZm9yIGJ1aWxkaW5nL3dvcmtpbmcgd2l0aFxuICAgKiBzdGF0ZSBtYWNoaW5lcy5cbiAgICpcbiAgICogSWYgYSBzdGF0ZSBhbHJlYWR5IGV4aXN0cyBmb3IgdGhlIGdpdmVuIGlucHV0LCByZXR1cm5zIGl0LlxuICAgKlxuICAgKiBJZiBhIHRva2VuIGlzIHNwZWNpZmllZCwgdGhhdCBzdGF0ZSB3aWxsIGVtaXQgdGhhdCB0b2tlbiB3aGVuIHJlYWNoZWQgYnlcbiAgICogdGhlIGxpbmtpZnkgZW5naW5lLlxuICAgKlxuICAgKiBJZiBubyBzdGF0ZSBleGlzdHMsIGl0IHdpbGwgYmUgaW5pdGlhbGl6ZWQgd2l0aCBzb21lIGRlZmF1bHQgdHJhbnNpdGlvbnNcbiAgICogdGhhdCByZXNlbWJsZSBleGlzdGluZyBkZWZhdWx0IHRyYW5zaXRpb25zLlxuICAgKlxuICAgKiBJZiBhIHN0YXRlIGlzIGdpdmVuIGZvciB0aGUgc2Vjb25kIGFyZ3VtZW50LCB0aGF0IHN0YXRlIHdpbGwgYmVcbiAgICogdHJhbnNpdGlvbmVkIHRvIG9uIHRoZSBnaXZlbiBpbnB1dCByZWdhcmRsZXNzIG9mIHdoYXQgdGhhdCBpbnB1dFxuICAgKiBwcmV2aW91c2x5IGRpZC5cbiAgICpcbiAgICogU3BlY2lmeSBhIHRva2VuIGdyb3VwIGZsYWdzIHRvIGRlZmluZSBncm91cHMgdGhhdCB0aGlzIHRva2VuIGJlbG9uZ3MgdG8uXG4gICAqIFRoZSB0b2tlbiB3aWxsIGJlIGFkZGVkIHRvIGNvcnJlc3BvbmRpbmcgZW50aXJlcyBpbiB0aGUgZ2l2ZW4gZ3JvdXBzXG4gICAqIG9iamVjdC5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGlucHV0IGNoYXJhY3RlciwgdG9rZW4gdHlwZSB0byB0cmFuc2l0aW9uIG9uXG4gICAqIEBwYXJhbSB7VCB8IFN0YXRlPFQ+fSBbbmV4dF0gVHJhbnNpdGlvbiBvcHRpb25zXG4gICAqIEBwYXJhbSB7RmxhZ3N9IFtmbGFnc10gQ29sbGVjdGlvbnMgZmxhZ3MgdG8gYWRkIHRva2VuIHRvXG4gICAqIEBwYXJhbSB7Q29sbGVjdGlvbnM8VD59IFtncm91cHNdIE1hc3RlciBsaXN0IG9mIGdyb3Vwc1xuICAgKiBAcmV0dXJucyB7U3RhdGU8VD59IHRha2VuIGFmdGVyIHRoZSBnaXZlbiBpbnB1dFxuICAgKi9cbiAgdHQoaW5wdXQsIG5leHQsIGZsYWdzLCBncm91cHMpIHtcbiAgICBncm91cHMgPSBncm91cHMgfHwgU3RhdGUuZ3JvdXBzO1xuICAgIGNvbnN0IHN0YXRlID0gdGhpcztcblxuICAgIC8vIENoZWNrIGlmIGV4aXN0aW5nIHN0YXRlIGdpdmVuLCBqdXN0IGEgYmFzaWMgdHJhbnNpdGlvblxuICAgIGlmIChuZXh0ICYmIG5leHQuaikge1xuICAgICAgc3RhdGUualtpbnB1dF0gPSBuZXh0O1xuICAgICAgcmV0dXJuIG5leHQ7XG4gICAgfVxuICAgIGNvbnN0IHQgPSBuZXh0O1xuXG4gICAgLy8gVGFrZSB0aGUgdHJhbnNpdGlvbiB3aXRoIHRoZSB1c3VhbCBkZWZhdWx0IG1lY2hhbmlzbXMgYW5kIHVzZSB0aGF0IGFzXG4gICAgLy8gYSB0ZW1wbGF0ZSBmb3IgY3JlYXRpbmcgdGhlIG5leHQgc3RhdGVcbiAgICBsZXQgbmV4dFN0YXRlLFxuICAgICAgdGVtcGxhdGVTdGF0ZSA9IHN0YXRlLmdvKGlucHV0KTtcbiAgICBpZiAodGVtcGxhdGVTdGF0ZSkge1xuICAgICAgbmV4dFN0YXRlID0gbmV3IFN0YXRlKCk7XG4gICAgICBhc3NpZ24obmV4dFN0YXRlLmosIHRlbXBsYXRlU3RhdGUuaik7XG4gICAgICBuZXh0U3RhdGUuanIucHVzaC5hcHBseShuZXh0U3RhdGUuanIsIHRlbXBsYXRlU3RhdGUuanIpO1xuICAgICAgbmV4dFN0YXRlLmpkID0gdGVtcGxhdGVTdGF0ZS5qZDtcbiAgICAgIG5leHRTdGF0ZS50ID0gdGVtcGxhdGVTdGF0ZS50O1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXh0U3RhdGUgPSBuZXcgU3RhdGUoKTtcbiAgICB9XG4gICAgaWYgKHQpIHtcbiAgICAgIC8vIEVuc3VyZSBuZXdseSB0b2tlbiBpcyBpbiB0aGUgc2FtZSBncm91cHMgYXMgdGhlIG9sZCB0b2tlblxuICAgICAgaWYgKGdyb3Vwcykge1xuICAgICAgICBpZiAobmV4dFN0YXRlLnQgJiYgdHlwZW9mIG5leHRTdGF0ZS50ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGNvbnN0IGFsbEZsYWdzID0gYXNzaWduKGZsYWdzRm9yVG9rZW4obmV4dFN0YXRlLnQsIGdyb3VwcyksIGZsYWdzKTtcbiAgICAgICAgICBhZGRUb0dyb3Vwcyh0LCBhbGxGbGFncywgZ3JvdXBzKTtcbiAgICAgICAgfSBlbHNlIGlmIChmbGFncykge1xuICAgICAgICAgIGFkZFRvR3JvdXBzKHQsIGZsYWdzLCBncm91cHMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBuZXh0U3RhdGUudCA9IHQ7IC8vIG92ZXJ3cml0ZSBhbnl0aGluZyB0aGF0IHdhcyBwcmV2aW91c2x5IHRoZXJlXG4gICAgfVxuXG4gICAgc3RhdGUualtpbnB1dF0gPSBuZXh0U3RhdGU7XG4gICAgcmV0dXJuIG5leHRTdGF0ZTtcbiAgfVxufTtcblxuLy8gSGVscGVyIGZ1bmN0aW9ucyB0byBpbXByb3ZlIG1pbmlmaWNhdGlvbiAobm90IGV4cG9ydGVkIG91dHNpZGUgbGlua2lmeWpzIG1vZHVsZSlcblxuLyoqXG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHtTdGF0ZTxUPn0gc3RhdGVcbiAqIEBwYXJhbSB7c3RyaW5nIHwgc3RyaW5nW119IGlucHV0XG4gKiBAcGFyYW0ge0ZsYWdzfSBbZmxhZ3NdXG4gKiBAcGFyYW0ge0NvbGxlY3Rpb25zPFQ+fSBbZ3JvdXBzXVxuICovXG5jb25zdCB0YSA9IChzdGF0ZSwgaW5wdXQsIG5leHQsIGZsYWdzLCBncm91cHMpID0+IHN0YXRlLnRhKGlucHV0LCBuZXh0LCBmbGFncywgZ3JvdXBzKTtcblxuLyoqXG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHtTdGF0ZTxUPn0gc3RhdGVcbiAqIEBwYXJhbSB7UmVnRXhwfSByZWdleHBcbiAqIEBwYXJhbSB7VCB8IFN0YXRlPFQ+fSBbbmV4dF1cbiAqIEBwYXJhbSB7RmxhZ3N9IFtmbGFnc11cbiAqIEBwYXJhbSB7Q29sbGVjdGlvbnM8VD59IFtncm91cHNdXG4gKi9cbmNvbnN0IHRyID0gKHN0YXRlLCByZWdleHAsIG5leHQsIGZsYWdzLCBncm91cHMpID0+IHN0YXRlLnRyKHJlZ2V4cCwgbmV4dCwgZmxhZ3MsIGdyb3Vwcyk7XG5cbi8qKlxuICogQHRlbXBsYXRlIFRcbiAqIEBwYXJhbSB7U3RhdGU8VD59IHN0YXRlXG4gKiBAcGFyYW0ge3N0cmluZyB8IHN0cmluZ1tdfSBpbnB1dFxuICogQHBhcmFtIHtUIHwgU3RhdGU8VD59IFtuZXh0XVxuICogQHBhcmFtIHtGbGFnc30gW2ZsYWdzXVxuICogQHBhcmFtIHtDb2xsZWN0aW9uczxUPn0gW2dyb3Vwc11cbiAqL1xuY29uc3QgdHMgPSAoc3RhdGUsIGlucHV0LCBuZXh0LCBmbGFncywgZ3JvdXBzKSA9PiBzdGF0ZS50cyhpbnB1dCwgbmV4dCwgZmxhZ3MsIGdyb3Vwcyk7XG5cbi8qKlxuICogQHRlbXBsYXRlIFRcbiAqIEBwYXJhbSB7U3RhdGU8VD59IHN0YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5wdXRcbiAqIEBwYXJhbSB7VCB8IFN0YXRlPFQ+fSBbbmV4dF1cbiAqIEBwYXJhbSB7Q29sbGVjdGlvbnM8VD59IFtncm91cHNdXG4gKiBAcGFyYW0ge0ZsYWdzfSBbZmxhZ3NdXG4gKi9cbmNvbnN0IHR0ID0gKHN0YXRlLCBpbnB1dCwgbmV4dCwgZmxhZ3MsIGdyb3VwcykgPT4gc3RhdGUudHQoaW5wdXQsIG5leHQsIGZsYWdzLCBncm91cHMpO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5UZXh0IFRva2Vuc1xuSWRlbnRpZmllcnMgZm9yIHRva2VuIG91dHB1dHMgZnJvbSB0aGUgcmVnZXhwIHNjYW5uZXJcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuLy8gQSB2YWxpZCB3ZWIgZG9tYWluIHRva2VuXG5jb25zdCBXT1JEID0gJ1dPUkQnOyAvLyBvbmx5IGNvbnRhaW5zIGEtelxuY29uc3QgVVdPUkQgPSAnVVdPUkQnOyAvLyBjb250YWlucyBsZXR0ZXJzIG90aGVyIHRoYW4gYS16LCB1c2VkIGZvciBJRE5cblxuLy8gU3BlY2lhbCBjYXNlIG9mIHdvcmRcbmNvbnN0IExPQ0FMSE9TVCA9ICdMT0NBTEhPU1QnO1xuXG4vLyBWYWxpZCB0b3AtbGV2ZWwgZG9tYWluLCBzcGVjaWFsIGNhc2Ugb2YgV09SRCAoc2VlIHRsZHMuanMpXG5jb25zdCBUTEQgPSAnVExEJztcblxuLy8gVmFsaWQgSUROIFRMRCwgc3BlY2lhbCBjYXNlIG9mIFVXT1JEIChzZWUgdGxkcy5qcylcbmNvbnN0IFVUTEQgPSAnVVRMRCc7XG5cbi8vIFRoZSBzY2hlbWUgcG9ydGlvbiBvZiBhIHdlYiBVUkkgcHJvdG9jb2wuIFN1cHBvcnRlZCB0eXBlcyBpbmNsdWRlOiBgbWFpbHRvYCxcbi8vIGBmaWxlYCwgYW5kIHVzZXItZGVmaW5lZCBjdXN0b20gcHJvdG9jb2xzLiBMaW1pdGVkIHRvIHNjaGVtZXMgdGhhdCBjb250YWluXG4vLyBvbmx5IGxldHRlcnNcbmNvbnN0IFNDSEVNRSA9ICdTQ0hFTUUnO1xuXG4vLyBTaW1pbGFyIHRvIFNDSEVNRSwgZXhjZXB0IG1ha2VzIGRpc3RpbmN0aW9uIGZvciBzY2hlbWVzIHRoYXQgbXVzdCBhbHdheXMgYmVcbi8vIGZvbGxvd2VkIGJ5IGA6Ly9gLCBub3QganVzdCBgOmAuIFN1cHBvcnRlZCB0eXBlcyBpbmNsdWRlIGBodHRwYCwgYGh0dHBzYCxcbi8vIGBmdHBgLCBgZnRwc2BcbmNvbnN0IFNMQVNIX1NDSEVNRSA9ICdTTEFTSF9TQ0hFTUUnO1xuXG4vLyBBbnkgc2VxdWVuY2Ugb2YgZGlnaXRzIDAtOVxuY29uc3QgTlVNID0gJ05VTSc7XG5cbi8vIEFueSBudW1iZXIgb2YgY29uc2VjdXRpdmUgd2hpdGVzcGFjZSBjaGFyYWN0ZXJzIHRoYXQgYXJlIG5vdCBuZXdsaW5lXG5jb25zdCBXUyA9ICdXUyc7XG5cbi8vIE5ldyBsaW5lICh1bml4IHN0eWxlKVxuY29uc3QgTkwkMSA9ICdOTCc7IC8vIFxcblxuXG4vLyBPcGVuaW5nL2Nsb3NpbmcgYnJhY2tldCBjbGFzc2VzXG5jb25zdCBPUEVOQlJBQ0UgPSAnT1BFTkJSQUNFJzsgLy8ge1xuY29uc3QgT1BFTkJSQUNLRVQgPSAnT1BFTkJSQUNLRVQnOyAvLyBbXG5jb25zdCBPUEVOQU5HTEVCUkFDS0VUID0gJ09QRU5BTkdMRUJSQUNLRVQnOyAvLyA8XG5jb25zdCBPUEVOUEFSRU4gPSAnT1BFTlBBUkVOJzsgLy8gKFxuY29uc3QgQ0xPU0VCUkFDRSA9ICdDTE9TRUJSQUNFJzsgLy8gfVxuY29uc3QgQ0xPU0VCUkFDS0VUID0gJ0NMT1NFQlJBQ0tFVCc7IC8vIF1cbmNvbnN0IENMT1NFQU5HTEVCUkFDS0VUID0gJ0NMT1NFQU5HTEVCUkFDS0VUJzsgLy8gPlxuY29uc3QgQ0xPU0VQQVJFTiA9ICdDTE9TRVBBUkVOJzsgLy8gKVxuXG4vLyBWYXJpb3VzIHN5bWJvbHNcbmNvbnN0IEFNUEVSU0FORCA9ICdBTVBFUlNBTkQnOyAvLyAmXG5jb25zdCBBUE9TVFJPUEhFID0gJ0FQT1NUUk9QSEUnOyAvLyAnXG5jb25zdCBBU1RFUklTSyA9ICdBU1RFUklTSyc7IC8vICpcbmNvbnN0IEFUID0gJ0FUJzsgLy8gQFxuY29uc3QgQkFDS1NMQVNIID0gJ0JBQ0tTTEFTSCc7IC8vIFxcXG5jb25zdCBCQUNLVElDSyA9ICdCQUNLVElDSyc7IC8vIGBcbmNvbnN0IENBUkVUID0gJ0NBUkVUJzsgLy8gXlxuY29uc3QgQ09MT04gPSAnQ09MT04nOyAvLyA6XG5jb25zdCBDT01NQSA9ICdDT01NQSc7IC8vICxcbmNvbnN0IERPTExBUiA9ICdET0xMQVInOyAvLyAkXG5jb25zdCBET1QgPSAnRE9UJzsgLy8gLlxuY29uc3QgRVFVQUxTID0gJ0VRVUFMUyc7IC8vID1cbmNvbnN0IEVYQ0xBTUFUSU9OID0gJ0VYQ0xBTUFUSU9OJzsgLy8gIVxuY29uc3QgSFlQSEVOID0gJ0hZUEhFTic7IC8vIC1cbmNvbnN0IFBFUkNFTlQgPSAnUEVSQ0VOVCc7IC8vICVcbmNvbnN0IFBJUEUgPSAnUElQRSc7IC8vIHxcbmNvbnN0IFBMVVMgPSAnUExVUyc7IC8vICtcbmNvbnN0IFBPVU5EID0gJ1BPVU5EJzsgLy8gI1xuY29uc3QgUVVFUlkgPSAnUVVFUlknOyAvLyA/XG5jb25zdCBRVU9URSA9ICdRVU9URSc7IC8vIFwiXG5cbmNvbnN0IFNFTUkgPSAnU0VNSSc7IC8vIDtcbmNvbnN0IFNMQVNIID0gJ1NMQVNIJzsgLy8gL1xuY29uc3QgVElMREUgPSAnVElMREUnOyAvLyB+XG5jb25zdCBVTkRFUlNDT1JFID0gJ1VOREVSU0NPUkUnOyAvLyBfXG5cbi8vIEVtb2ppIHN5bWJvbFxuY29uc3QgRU1PSkkkMSA9ICdFTU9KSSc7XG5cbi8vIERlZmF1bHQgdG9rZW4gLSBhbnl0aGluZyB0aGF0IGlzIG5vdCBvbmUgb2YgdGhlIGFib3ZlXG5jb25zdCBTWU0gPSAnU1lNJztcblxudmFyIHRrID0gLyojX19QVVJFX18qL09iamVjdC5mcmVlemUoe1xuXHRfX3Byb3RvX186IG51bGwsXG5cdFdPUkQ6IFdPUkQsXG5cdFVXT1JEOiBVV09SRCxcblx0TE9DQUxIT1NUOiBMT0NBTEhPU1QsXG5cdFRMRDogVExELFxuXHRVVExEOiBVVExELFxuXHRTQ0hFTUU6IFNDSEVNRSxcblx0U0xBU0hfU0NIRU1FOiBTTEFTSF9TQ0hFTUUsXG5cdE5VTTogTlVNLFxuXHRXUzogV1MsXG5cdE5MOiBOTCQxLFxuXHRPUEVOQlJBQ0U6IE9QRU5CUkFDRSxcblx0T1BFTkJSQUNLRVQ6IE9QRU5CUkFDS0VULFxuXHRPUEVOQU5HTEVCUkFDS0VUOiBPUEVOQU5HTEVCUkFDS0VULFxuXHRPUEVOUEFSRU46IE9QRU5QQVJFTixcblx0Q0xPU0VCUkFDRTogQ0xPU0VCUkFDRSxcblx0Q0xPU0VCUkFDS0VUOiBDTE9TRUJSQUNLRVQsXG5cdENMT1NFQU5HTEVCUkFDS0VUOiBDTE9TRUFOR0xFQlJBQ0tFVCxcblx0Q0xPU0VQQVJFTjogQ0xPU0VQQVJFTixcblx0QU1QRVJTQU5EOiBBTVBFUlNBTkQsXG5cdEFQT1NUUk9QSEU6IEFQT1NUUk9QSEUsXG5cdEFTVEVSSVNLOiBBU1RFUklTSyxcblx0QVQ6IEFULFxuXHRCQUNLU0xBU0g6IEJBQ0tTTEFTSCxcblx0QkFDS1RJQ0s6IEJBQ0tUSUNLLFxuXHRDQVJFVDogQ0FSRVQsXG5cdENPTE9OOiBDT0xPTixcblx0Q09NTUE6IENPTU1BLFxuXHRET0xMQVI6IERPTExBUixcblx0RE9UOiBET1QsXG5cdEVRVUFMUzogRVFVQUxTLFxuXHRFWENMQU1BVElPTjogRVhDTEFNQVRJT04sXG5cdEhZUEhFTjogSFlQSEVOLFxuXHRQRVJDRU5UOiBQRVJDRU5ULFxuXHRQSVBFOiBQSVBFLFxuXHRQTFVTOiBQTFVTLFxuXHRQT1VORDogUE9VTkQsXG5cdFFVRVJZOiBRVUVSWSxcblx0UVVPVEU6IFFVT1RFLFxuXHRTRU1JOiBTRU1JLFxuXHRTTEFTSDogU0xBU0gsXG5cdFRJTERFOiBUSUxERSxcblx0VU5ERVJTQ09SRTogVU5ERVJTQ09SRSxcblx0RU1PSkk6IEVNT0pJJDEsXG5cdFNZTTogU1lNXG59KTtcblxuLy8gTm90ZSB0aGF0IHRoZXNlIHR3byBVbmljb2RlIG9uZXMgZXhwYW5kIGludG8gYSByZWFsbHkgYmlnIG9uZSB3aXRoIEJhYmVsXG5jb25zdCBBU0NJSV9MRVRURVIgPSAvW2Etel0vO1xuY29uc3QgTEVUVEVSID0gL1xccHtMfS91OyAvLyBBbnkgVW5pY29kZSBjaGFyYWN0ZXIgd2l0aCBsZXR0ZXIgZGF0YSB0eXBlXG5jb25zdCBFTU9KSSA9IC9cXHB7RW1vaml9L3U7IC8vIEFueSBVbmljb2RlIGVtb2ppIGNoYXJhY3RlclxuY29uc3QgRU1PSklfVkFSSUFUSU9OJDEgPSAvXFx1ZmUwZi87XG5jb25zdCBESUdJVCA9IC9cXGQvO1xuY29uc3QgU1BBQ0UgPSAvXFxzLztcblxudmFyIHJlZ2V4cCA9IC8qI19fUFVSRV9fKi9PYmplY3QuZnJlZXplKHtcblx0X19wcm90b19fOiBudWxsLFxuXHRBU0NJSV9MRVRURVI6IEFTQ0lJX0xFVFRFUixcblx0TEVUVEVSOiBMRVRURVIsXG5cdEVNT0pJOiBFTU9KSSxcblx0RU1PSklfVkFSSUFUSU9OOiBFTU9KSV9WQVJJQVRJT04kMSxcblx0RElHSVQ6IERJR0lULFxuXHRTUEFDRTogU1BBQ0Vcbn0pO1xuXG4vKipcblx0VGhlIHNjYW5uZXIgcHJvdmlkZXMgYW4gaW50ZXJmYWNlIHRoYXQgdGFrZXMgYSBzdHJpbmcgb2YgdGV4dCBhcyBpbnB1dCwgYW5kXG5cdG91dHB1dHMgYW4gYXJyYXkgb2YgdG9rZW5zIGluc3RhbmNlcyB0aGF0IGNhbiBiZSB1c2VkIGZvciBlYXN5IFVSTCBwYXJzaW5nLlxuKi9cbmNvbnN0IE5MID0gJ1xcbic7IC8vIE5ldyBsaW5lIGNoYXJhY3RlclxuY29uc3QgRU1PSklfVkFSSUFUSU9OID0gJ1xcdWZlMGYnOyAvLyBWYXJpYXRpb24gc2VsZWN0b3IsIGZvbGxvd3MgaGVhcnQgYW5kIG90aGVyc1xuY29uc3QgRU1PSklfSk9JTkVSID0gJ1xcdTIwMGQnOyAvLyB6ZXJvLXdpZHRoIGpvaW5lclxuXG5sZXQgdGxkcyA9IG51bGwsXG4gIHV0bGRzID0gbnVsbDsgLy8gZG9uJ3QgY2hhbmdlIHNvIG9ubHkgaGF2ZSB0byBiZSBjb21wdXRlZCBvbmNlXG5cbi8qKlxuICogU2Nhbm5lciBvdXRwdXQgdG9rZW46XG4gKiAtIGB0YCBpcyB0aGUgdG9rZW4gbmFtZSAoZS5nLiwgJ05VTScsICdFTU9KSScsICdUTEQnKVxuICogLSBgdmAgaXMgdGhlIHZhbHVlIG9mIHRoZSB0b2tlbiAoZS5nLiwgJzEyMycsICdcdTI3NjRcdUZFMEYnLCAnY29tJylcbiAqIC0gYHNgIGlzIHRoZSBzdGFydCBpbmRleCBvZiB0aGUgdG9rZW4gaW4gdGhlIG9yaWdpbmFsIHN0cmluZ1xuICogLSBgZWAgaXMgdGhlIGVuZCBpbmRleCBvZiB0aGUgdG9rZW4gaW4gdGhlIG9yaWdpbmFsIHN0cmluZ1xuICogQHR5cGVkZWYge3t0OiBzdHJpbmcsIHY6IHN0cmluZywgczogbnVtYmVyLCBlOiBudW1iZXJ9fSBUb2tlblxuICovXG5cbi8qKlxuICogQHRlbXBsYXRlIFRcbiAqIEB0eXBlZGVmIHt7IFtjb2xsZWN0aW9uOiBzdHJpbmddOiBUW10gfX0gQ29sbGVjdGlvbnNcbiAqL1xuXG4vKipcbiAqIEluaXRpYWxpemUgdGhlIHNjYW5uZXIgY2hhcmFjdGVyLWJhc2VkIHN0YXRlIG1hY2hpbmUgZm9yIHRoZSBnaXZlbiBzdGFydFxuICogc3RhdGVcbiAqIEBwYXJhbSB7W3N0cmluZywgYm9vbGVhbl1bXX0gY3VzdG9tU2NoZW1lcyBMaXN0IG9mIGN1c3RvbSBzY2hlbWVzLCB3aGVyZSBlYWNoXG4gKiBpdGVtIGlzIGEgbGVuZ3RoLTIgdHVwbGUgd2l0aCB0aGUgZmlyc3QgZWxlbWVudCBzZXQgdG8gdGhlIHN0cmluZyBzY2hlbWUsIGFuZFxuICogdGhlIHNlY29uZCBlbGVtZW50IHNldCB0byBgdHJ1ZWAgaWYgdGhlIGA6Ly9gIGFmdGVyIHRoZSBzY2hlbWUgaXMgb3B0aW9uYWxcbiAqL1xuZnVuY3Rpb24gaW5pdCQyKGN1c3RvbVNjaGVtZXMpIHtcbiAgaWYgKGN1c3RvbVNjaGVtZXMgPT09IHZvaWQgMCkge1xuICAgIGN1c3RvbVNjaGVtZXMgPSBbXTtcbiAgfVxuICAvLyBGcmVxdWVudGx5IHVzZWQgc3RhdGVzIChuYW1lIGFyZ3VtZW50IHJlbW92ZWQgZHVyaW5nIG1pbmlmaWNhdGlvbilcbiAgLyoqIEB0eXBlIENvbGxlY3Rpb25zPHN0cmluZz4gKi9cbiAgY29uc3QgZ3JvdXBzID0ge307IC8vIG9mIHRva2Vuc1xuICBTdGF0ZS5ncm91cHMgPSBncm91cHM7XG4gIC8qKiBAdHlwZSBTdGF0ZTxzdHJpbmc+ICovXG4gIGNvbnN0IFN0YXJ0ID0gbmV3IFN0YXRlKCk7XG4gIGlmICh0bGRzID09IG51bGwpIHtcbiAgICB0bGRzID0gZGVjb2RlVGxkcyhlbmNvZGVkVGxkcyk7XG4gIH1cbiAgaWYgKHV0bGRzID09IG51bGwpIHtcbiAgICB1dGxkcyA9IGRlY29kZVRsZHMoZW5jb2RlZFV0bGRzKTtcbiAgfVxuXG4gIC8vIFN0YXRlcyBmb3Igc3BlY2lhbCBVUkwgc3ltYm9scyB0aGF0IGFjY2VwdCBpbW1lZGlhdGVseSBhZnRlciBzdGFydFxuICB0dChTdGFydCwgXCInXCIsIEFQT1NUUk9QSEUpO1xuICB0dChTdGFydCwgJ3snLCBPUEVOQlJBQ0UpO1xuICB0dChTdGFydCwgJ1snLCBPUEVOQlJBQ0tFVCk7XG4gIHR0KFN0YXJ0LCAnPCcsIE9QRU5BTkdMRUJSQUNLRVQpO1xuICB0dChTdGFydCwgJygnLCBPUEVOUEFSRU4pO1xuICB0dChTdGFydCwgJ30nLCBDTE9TRUJSQUNFKTtcbiAgdHQoU3RhcnQsICddJywgQ0xPU0VCUkFDS0VUKTtcbiAgdHQoU3RhcnQsICc+JywgQ0xPU0VBTkdMRUJSQUNLRVQpO1xuICB0dChTdGFydCwgJyknLCBDTE9TRVBBUkVOKTtcbiAgdHQoU3RhcnQsICcmJywgQU1QRVJTQU5EKTtcbiAgdHQoU3RhcnQsICcqJywgQVNURVJJU0spO1xuICB0dChTdGFydCwgJ0AnLCBBVCk7XG4gIHR0KFN0YXJ0LCAnYCcsIEJBQ0tUSUNLKTtcbiAgdHQoU3RhcnQsICdeJywgQ0FSRVQpO1xuICB0dChTdGFydCwgJzonLCBDT0xPTik7XG4gIHR0KFN0YXJ0LCAnLCcsIENPTU1BKTtcbiAgdHQoU3RhcnQsICckJywgRE9MTEFSKTtcbiAgdHQoU3RhcnQsICcuJywgRE9UKTtcbiAgdHQoU3RhcnQsICc9JywgRVFVQUxTKTtcbiAgdHQoU3RhcnQsICchJywgRVhDTEFNQVRJT04pO1xuICB0dChTdGFydCwgJy0nLCBIWVBIRU4pO1xuICB0dChTdGFydCwgJyUnLCBQRVJDRU5UKTtcbiAgdHQoU3RhcnQsICd8JywgUElQRSk7XG4gIHR0KFN0YXJ0LCAnKycsIFBMVVMpO1xuICB0dChTdGFydCwgJyMnLCBQT1VORCk7XG4gIHR0KFN0YXJ0LCAnPycsIFFVRVJZKTtcbiAgdHQoU3RhcnQsICdcIicsIFFVT1RFKTtcbiAgdHQoU3RhcnQsICcvJywgU0xBU0gpO1xuICB0dChTdGFydCwgJzsnLCBTRU1JKTtcbiAgdHQoU3RhcnQsICd+JywgVElMREUpO1xuICB0dChTdGFydCwgJ18nLCBVTkRFUlNDT1JFKTtcbiAgdHQoU3RhcnQsICdcXFxcJywgQkFDS1NMQVNIKTtcbiAgY29uc3QgTnVtID0gdHIoU3RhcnQsIERJR0lULCBOVU0sIHtcbiAgICBbbnVtZXJpY106IHRydWVcbiAgfSk7XG4gIHRyKE51bSwgRElHSVQsIE51bSk7XG5cbiAgLy8gU3RhdGUgd2hpY2ggZW1pdHMgYSB3b3JkIHRva2VuXG4gIGNvbnN0IFdvcmQgPSB0cihTdGFydCwgQVNDSUlfTEVUVEVSLCBXT1JELCB7XG4gICAgW2FzY2lpXTogdHJ1ZVxuICB9KTtcbiAgdHIoV29yZCwgQVNDSUlfTEVUVEVSLCBXb3JkKTtcblxuICAvLyBTYW1lIGFzIHByZXZpb3VzLCBidXQgc3BlY2lmaWMgdG8gbm9uLWZzbS5hc2NpaSBhbHBoYWJldCB3b3Jkc1xuICBjb25zdCBVV29yZCA9IHRyKFN0YXJ0LCBMRVRURVIsIFVXT1JELCB7XG4gICAgW2FscGhhXTogdHJ1ZVxuICB9KTtcbiAgdHIoVVdvcmQsIEFTQ0lJX0xFVFRFUik7IC8vIE5vbi1hY2NlcHRpbmdcbiAgdHIoVVdvcmQsIExFVFRFUiwgVVdvcmQpO1xuXG4gIC8vIFdoaXRlc3BhY2UganVtcHNcbiAgLy8gVG9rZW5zIG9mIG9ubHkgbm9uLW5ld2xpbmUgd2hpdGVzcGFjZSBhcmUgYXJiaXRyYXJpbHkgbG9uZ1xuICAvLyBJZiBhbnkgd2hpdGVzcGFjZSBleGNlcHQgbmV3bGluZSwgbW9yZSB3aGl0ZXNwYWNlIVxuICBjb25zdCBXcyA9IHRyKFN0YXJ0LCBTUEFDRSwgV1MsIHtcbiAgICBbd2hpdGVzcGFjZV06IHRydWVcbiAgfSk7XG4gIHR0KFN0YXJ0LCBOTCwgTkwkMSwge1xuICAgIFt3aGl0ZXNwYWNlXTogdHJ1ZVxuICB9KTtcbiAgdHQoV3MsIE5MKTsgLy8gbm9uLWFjY2VwdGluZyBzdGF0ZSB0byBhdm9pZCBtaXhpbmcgd2hpdGVzcGFjZXNcbiAgdHIoV3MsIFNQQUNFLCBXcyk7XG5cbiAgLy8gRW1vamkgdG9rZW5zLiBUaGV5IGFyZSBub3QgZ3JvdXBlZCBieSB0aGUgc2Nhbm5lciBleGNlcHQgaW4gY2FzZXMgd2hlcmUgYVxuICAvLyB6ZXJvLXdpZHRoIGpvaW5lciBpcyBwcmVzZW50XG4gIGNvbnN0IEVtb2ppID0gdHIoU3RhcnQsIEVNT0pJLCBFTU9KSSQxLCB7XG4gICAgW2Vtb2ppXTogdHJ1ZVxuICB9KTtcbiAgdHIoRW1vamksIEVNT0pJLCBFbW9qaSk7XG4gIHR0KEVtb2ppLCBFTU9KSV9WQVJJQVRJT04sIEVtb2ppKTtcbiAgLy8gdHQoU3RhcnQsIEVNT0pJX1ZBUklBVElPTiwgRW1vamkpOyAvLyBUaGlzIG9uZSBpcyBza2V0Y2h5XG5cbiAgY29uc3QgRW1vamlKb2luZXIgPSB0dChFbW9qaSwgRU1PSklfSk9JTkVSKTtcbiAgdHIoRW1vamlKb2luZXIsIEVNT0pJLCBFbW9qaSk7XG4gIC8vIHR0KEVtb2ppSm9pbmVyLCBFTU9KSV9WQVJJQVRJT04sIEVtb2ppKTsgLy8gYWxzbyBza2V0Y2h5XG5cbiAgLy8gR2VuZXJhdGVzIHN0YXRlcyBmb3IgdG9wLWxldmVsIGRvbWFpbnNcbiAgLy8gTm90ZSB0aGF0IHRoaXMgaXMgbW9zdCBhY2N1cmF0ZSB3aGVuIHRsZHMgYXJlIGluIGFscGhhYmV0aWNhbCBvcmRlclxuICBjb25zdCB3b3JkanIgPSBbW0FTQ0lJX0xFVFRFUiwgV29yZF1dO1xuICBjb25zdCB1d29yZGpyID0gW1tBU0NJSV9MRVRURVIsIG51bGxdLCBbTEVUVEVSLCBVV29yZF1dO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHRsZHMubGVuZ3RoOyBpKyspIHtcbiAgICBmYXN0dHMoU3RhcnQsIHRsZHNbaV0sIFRMRCwgV09SRCwgd29yZGpyKTtcbiAgfVxuICBmb3IgKGxldCBpID0gMDsgaSA8IHV0bGRzLmxlbmd0aDsgaSsrKSB7XG4gICAgZmFzdHRzKFN0YXJ0LCB1dGxkc1tpXSwgVVRMRCwgVVdPUkQsIHV3b3JkanIpO1xuICB9XG4gIGFkZFRvR3JvdXBzKFRMRCwge1xuICAgIHRsZDogdHJ1ZSxcbiAgICBhc2NpaTogdHJ1ZVxuICB9LCBncm91cHMpO1xuICBhZGRUb0dyb3VwcyhVVExELCB7XG4gICAgdXRsZDogdHJ1ZSxcbiAgICBhbHBoYTogdHJ1ZVxuICB9LCBncm91cHMpO1xuXG4gIC8vIENvbGxlY3QgdGhlIHN0YXRlcyBnZW5lcmF0ZWQgYnkgZGlmZmVyZW50IHByb3RvY29scy4gTk9URTogSWYgYW55IG5ldyBUTERzXG4gIC8vIGdldCBhZGRlZCB0aGF0IGFyZSBhbHNvIHByb3RvY29scywgc2V0IHRoZSB0b2tlbiB0byBiZSB0aGUgc2FtZSBhcyB0aGVcbiAgLy8gcHJvdG9jb2wgdG8gZW5zdXJlIHBhcnNpbmcgd29ya3MgYXMgZXhwZWN0ZWQuXG4gIGZhc3R0cyhTdGFydCwgJ2ZpbGUnLCBTQ0hFTUUsIFdPUkQsIHdvcmRqcik7XG4gIGZhc3R0cyhTdGFydCwgJ21haWx0bycsIFNDSEVNRSwgV09SRCwgd29yZGpyKTtcbiAgZmFzdHRzKFN0YXJ0LCAnaHR0cCcsIFNMQVNIX1NDSEVNRSwgV09SRCwgd29yZGpyKTtcbiAgZmFzdHRzKFN0YXJ0LCAnaHR0cHMnLCBTTEFTSF9TQ0hFTUUsIFdPUkQsIHdvcmRqcik7XG4gIGZhc3R0cyhTdGFydCwgJ2Z0cCcsIFNMQVNIX1NDSEVNRSwgV09SRCwgd29yZGpyKTtcbiAgZmFzdHRzKFN0YXJ0LCAnZnRwcycsIFNMQVNIX1NDSEVNRSwgV09SRCwgd29yZGpyKTtcbiAgYWRkVG9Hcm91cHMoU0NIRU1FLCB7XG4gICAgc2NoZW1lOiB0cnVlLFxuICAgIGFzY2lpOiB0cnVlXG4gIH0sIGdyb3Vwcyk7XG4gIGFkZFRvR3JvdXBzKFNMQVNIX1NDSEVNRSwge1xuICAgIHNsYXNoc2NoZW1lOiB0cnVlLFxuICAgIGFzY2lpOiB0cnVlXG4gIH0sIGdyb3Vwcyk7XG5cbiAgLy8gUmVnaXN0ZXIgY3VzdG9tIHNjaGVtZXMuIEFzc3VtZXMgZWFjaCBzY2hlbWUgaXMgYXNjaWludW1lcmljIHdpdGggaHlwaGVuc1xuICBjdXN0b21TY2hlbWVzID0gY3VzdG9tU2NoZW1lcy5zb3J0KChhLCBiKSA9PiBhWzBdID4gYlswXSA/IDEgOiAtMSk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY3VzdG9tU2NoZW1lcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHNjaCA9IGN1c3RvbVNjaGVtZXNbaV1bMF07XG4gICAgY29uc3Qgb3B0aW9uYWxTbGFzaFNsYXNoID0gY3VzdG9tU2NoZW1lc1tpXVsxXTtcbiAgICBjb25zdCBmbGFncyA9IG9wdGlvbmFsU2xhc2hTbGFzaCA/IHtcbiAgICAgIFtzY2hlbWVdOiB0cnVlXG4gICAgfSA6IHtcbiAgICAgIFtzbGFzaHNjaGVtZV06IHRydWVcbiAgICB9O1xuICAgIGlmIChzY2guaW5kZXhPZignLScpID49IDApIHtcbiAgICAgIGZsYWdzW2RvbWFpbl0gPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAoIUFTQ0lJX0xFVFRFUi50ZXN0KHNjaCkpIHtcbiAgICAgIGZsYWdzW251bWVyaWNdID0gdHJ1ZTsgLy8gbnVtYmVycyBvbmx5XG4gICAgfSBlbHNlIGlmIChESUdJVC50ZXN0KHNjaCkpIHtcbiAgICAgIGZsYWdzW2FzY2lpbnVtZXJpY10gPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBmbGFnc1thc2NpaV0gPSB0cnVlO1xuICAgIH1cbiAgICB0cyhTdGFydCwgc2NoLCBzY2gsIGZsYWdzKTtcbiAgfVxuXG4gIC8vIExvY2FsaG9zdCB0b2tlblxuICB0cyhTdGFydCwgJ2xvY2FsaG9zdCcsIExPQ0FMSE9TVCwge1xuICAgIGFzY2lpOiB0cnVlXG4gIH0pO1xuXG4gIC8vIFNldCBkZWZhdWx0IHRyYW5zaXRpb24gZm9yIHN0YXJ0IHN0YXRlIChzb21lIHN5bWJvbClcbiAgU3RhcnQuamQgPSBuZXcgU3RhdGUoU1lNKTtcbiAgcmV0dXJuIHtcbiAgICBzdGFydDogU3RhcnQsXG4gICAgdG9rZW5zOiBhc3NpZ24oe1xuICAgICAgZ3JvdXBzXG4gICAgfSwgdGspXG4gIH07XG59XG5cbi8qKlxuXHRHaXZlbiBhIHN0cmluZywgcmV0dXJucyBhbiBhcnJheSBvZiBUT0tFTiBpbnN0YW5jZXMgcmVwcmVzZW50aW5nIHRoZVxuXHRjb21wb3NpdGlvbiBvZiB0aGF0IHN0cmluZy5cblxuXHRAbWV0aG9kIHJ1blxuXHRAcGFyYW0ge1N0YXRlPHN0cmluZz59IHN0YXJ0IHNjYW5uZXIgc3RhcnRpbmcgc3RhdGVcblx0QHBhcmFtIHtzdHJpbmd9IHN0ciBpbnB1dCBzdHJpbmcgdG8gc2NhblxuXHRAcmV0dXJuIHtUb2tlbltdfSBsaXN0IG9mIHRva2VucywgZWFjaCB3aXRoIGEgdHlwZSBhbmQgdmFsdWVcbiovXG5mdW5jdGlvbiBydW4kMShzdGFydCwgc3RyKSB7XG4gIC8vIFN0YXRlIG1hY2hpbmUgaXMgbm90IGNhc2Ugc2Vuc2l0aXZlLCBzbyBpbnB1dCBpcyB0b2tlbml6ZWQgaW4gbG93ZXJjYXNlZFxuICAvLyBmb3JtIChzdGlsbCByZXR1cm5zIHJlZ3VsYXIgY2FzZSkuIFVzZXMgc2VsZWN0aXZlIGB0b0xvd2VyQ2FzZWAgYmVjYXVzZVxuICAvLyBsb3dlcmNhc2luZyB0aGUgZW50aXJlIHN0cmluZyBjYXVzZXMgdGhlIGxlbmd0aCBhbmQgY2hhcmFjdGVyIHBvc2l0aW9uIHRvXG4gIC8vIHZhcnkgaW4gc29tZSBub24tRW5nbGlzaCBzdHJpbmdzIHdpdGggVjgtYmFzZWQgcnVudGltZXMuXG4gIGNvbnN0IGl0ZXJhYmxlID0gc3RyaW5nVG9BcnJheShzdHIucmVwbGFjZSgvW0EtWl0vZywgYyA9PiBjLnRvTG93ZXJDYXNlKCkpKTtcbiAgY29uc3QgY2hhckNvdW50ID0gaXRlcmFibGUubGVuZ3RoOyAvLyA8PSBsZW4gaWYgdGhlcmUgYXJlIGVtb2ppcywgZXRjXG4gIGNvbnN0IHRva2VucyA9IFtdOyAvLyByZXR1cm4gdmFsdWVcblxuICAvLyBjdXJzb3IgdGhyb3VnaCB0aGUgc3RyaW5nIGl0c2VsZiwgYWNjb3VudGluZyBmb3IgY2hhcmFjdGVycyB0aGF0IGhhdmVcbiAgLy8gd2lkdGggd2l0aCBsZW5ndGggMiBzdWNoIGFzIGVtb2ppc1xuICBsZXQgY3Vyc29yID0gMDtcblxuICAvLyBDdXJzb3IgdGhyb3VnaCB0aGUgYXJyYXktcmVwcmVzZW50YXRpb24gb2YgdGhlIHN0cmluZ1xuICBsZXQgY2hhckN1cnNvciA9IDA7XG5cbiAgLy8gVG9rZW5pemUgdGhlIHN0cmluZ1xuICB3aGlsZSAoY2hhckN1cnNvciA8IGNoYXJDb3VudCkge1xuICAgIGxldCBzdGF0ZSA9IHN0YXJ0O1xuICAgIGxldCBuZXh0U3RhdGUgPSBudWxsO1xuICAgIGxldCB0b2tlbkxlbmd0aCA9IDA7XG4gICAgbGV0IGxhdGVzdEFjY2VwdGluZyA9IG51bGw7XG4gICAgbGV0IHNpbmNlQWNjZXB0cyA9IC0xO1xuICAgIGxldCBjaGFyc1NpbmNlQWNjZXB0cyA9IC0xO1xuICAgIHdoaWxlIChjaGFyQ3Vyc29yIDwgY2hhckNvdW50ICYmIChuZXh0U3RhdGUgPSBzdGF0ZS5nbyhpdGVyYWJsZVtjaGFyQ3Vyc29yXSkpKSB7XG4gICAgICBzdGF0ZSA9IG5leHRTdGF0ZTtcblxuICAgICAgLy8gS2VlcCB0cmFjayBvZiB0aGUgbGF0ZXN0IGFjY2VwdGluZyBzdGF0ZVxuICAgICAgaWYgKHN0YXRlLmFjY2VwdHMoKSkge1xuICAgICAgICBzaW5jZUFjY2VwdHMgPSAwO1xuICAgICAgICBjaGFyc1NpbmNlQWNjZXB0cyA9IDA7XG4gICAgICAgIGxhdGVzdEFjY2VwdGluZyA9IHN0YXRlO1xuICAgICAgfSBlbHNlIGlmIChzaW5jZUFjY2VwdHMgPj0gMCkge1xuICAgICAgICBzaW5jZUFjY2VwdHMgKz0gaXRlcmFibGVbY2hhckN1cnNvcl0ubGVuZ3RoO1xuICAgICAgICBjaGFyc1NpbmNlQWNjZXB0cysrO1xuICAgICAgfVxuICAgICAgdG9rZW5MZW5ndGggKz0gaXRlcmFibGVbY2hhckN1cnNvcl0ubGVuZ3RoO1xuICAgICAgY3Vyc29yICs9IGl0ZXJhYmxlW2NoYXJDdXJzb3JdLmxlbmd0aDtcbiAgICAgIGNoYXJDdXJzb3IrKztcbiAgICB9XG5cbiAgICAvLyBSb2xsIGJhY2sgdG8gdGhlIGxhdGVzdCBhY2NlcHRpbmcgc3RhdGVcbiAgICBjdXJzb3IgLT0gc2luY2VBY2NlcHRzO1xuICAgIGNoYXJDdXJzb3IgLT0gY2hhcnNTaW5jZUFjY2VwdHM7XG4gICAgdG9rZW5MZW5ndGggLT0gc2luY2VBY2NlcHRzO1xuXG4gICAgLy8gTm8gbW9yZSBqdW1wcywganVzdCBtYWtlIGEgbmV3IHRva2VuIGZyb20gdGhlIGxhc3QgYWNjZXB0aW5nIG9uZVxuICAgIHRva2Vucy5wdXNoKHtcbiAgICAgIHQ6IGxhdGVzdEFjY2VwdGluZy50LFxuICAgICAgLy8gdG9rZW4gdHlwZS9uYW1lXG4gICAgICB2OiBzdHIuc2xpY2UoY3Vyc29yIC0gdG9rZW5MZW5ndGgsIGN1cnNvciksXG4gICAgICAvLyBzdHJpbmcgdmFsdWVcbiAgICAgIHM6IGN1cnNvciAtIHRva2VuTGVuZ3RoLFxuICAgICAgLy8gc3RhcnQgaW5kZXhcbiAgICAgIGU6IGN1cnNvciAvLyBlbmQgaW5kZXggKGV4Y2x1ZGluZylcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB0b2tlbnM7XG59XG5cbi8qKlxuICogQ29udmVydCBhIFN0cmluZyB0byBhbiBBcnJheSBvZiBjaGFyYWN0ZXJzLCB0YWtpbmcgaW50byBhY2NvdW50IHRoYXQgc29tZVxuICogY2hhcmFjdGVycyBsaWtlIGVtb2ppcyB0YWtlIHVwIHR3byBzdHJpbmcgaW5kZXhlcy5cbiAqXG4gKiBBZGFwdGVkIGZyb20gY29yZS1qcyAoTUlUIGxpY2Vuc2UpXG4gKiBodHRwczovL2dpdGh1Yi5jb20vemxvaXJvY2svY29yZS1qcy9ibG9iLzJkNjljZjVmOTlhYjNlYTM0NjNjMzk1ZGY4MWU1YTE1YjY4ZjQ5ZDkvcGFja2FnZXMvY29yZS1qcy9pbnRlcm5hbHMvc3RyaW5nLW11bHRpYnl0ZS5qc1xuICpcbiAqIEBmdW5jdGlvbiBzdHJpbmdUb0FycmF5XG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyXG4gKiBAcmV0dXJucyB7c3RyaW5nW119XG4gKi9cbmZ1bmN0aW9uIHN0cmluZ1RvQXJyYXkoc3RyKSB7XG4gIGNvbnN0IHJlc3VsdCA9IFtdO1xuICBjb25zdCBsZW4gPSBzdHIubGVuZ3RoO1xuICBsZXQgaW5kZXggPSAwO1xuICB3aGlsZSAoaW5kZXggPCBsZW4pIHtcbiAgICBsZXQgZmlyc3QgPSBzdHIuY2hhckNvZGVBdChpbmRleCk7XG4gICAgbGV0IHNlY29uZDtcbiAgICBsZXQgY2hhciA9IGZpcnN0IDwgMHhkODAwIHx8IGZpcnN0ID4gMHhkYmZmIHx8IGluZGV4ICsgMSA9PT0gbGVuIHx8IChzZWNvbmQgPSBzdHIuY2hhckNvZGVBdChpbmRleCArIDEpKSA8IDB4ZGMwMCB8fCBzZWNvbmQgPiAweGRmZmYgPyBzdHJbaW5kZXhdIC8vIHNpbmdsZSBjaGFyYWN0ZXJcbiAgICA6IHN0ci5zbGljZShpbmRleCwgaW5kZXggKyAyKTsgLy8gdHdvLWluZGV4IGNoYXJhY3RlcnNcbiAgICByZXN1bHQucHVzaChjaGFyKTtcbiAgICBpbmRleCArPSBjaGFyLmxlbmd0aDtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEZhc3QgdmVyc2lvbiBvZiB0cyBmdW5jdGlvbiBmb3Igd2hlbiB0cmFuc2l0aW9uIGRlZmF1bHRzIGFyZSB3ZWxsIGtub3duXG4gKiBAcGFyYW0ge1N0YXRlPHN0cmluZz59IHN0YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5wdXRcbiAqIEBwYXJhbSB7c3RyaW5nfSB0XG4gKiBAcGFyYW0ge3N0cmluZ30gZGVmYXVsdHRcbiAqIEBwYXJhbSB7W1JlZ0V4cCwgU3RhdGU8c3RyaW5nPl1bXX0ganJcbiAqIEByZXR1cm5zIHtTdGF0ZTxzdHJpbmc+fVxuICovXG5mdW5jdGlvbiBmYXN0dHMoc3RhdGUsIGlucHV0LCB0LCBkZWZhdWx0dCwganIpIHtcbiAgbGV0IG5leHQ7XG4gIGNvbnN0IGxlbiA9IGlucHV0Lmxlbmd0aDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW4gLSAxOyBpKyspIHtcbiAgICBjb25zdCBjaGFyID0gaW5wdXRbaV07XG4gICAgaWYgKHN0YXRlLmpbY2hhcl0pIHtcbiAgICAgIG5leHQgPSBzdGF0ZS5qW2NoYXJdO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXh0ID0gbmV3IFN0YXRlKGRlZmF1bHR0KTtcbiAgICAgIG5leHQuanIgPSBqci5zbGljZSgpO1xuICAgICAgc3RhdGUualtjaGFyXSA9IG5leHQ7XG4gICAgfVxuICAgIHN0YXRlID0gbmV4dDtcbiAgfVxuICBuZXh0ID0gbmV3IFN0YXRlKHQpO1xuICBuZXh0LmpyID0ganIuc2xpY2UoKTtcbiAgc3RhdGUualtpbnB1dFtsZW4gLSAxXV0gPSBuZXh0O1xuICByZXR1cm4gbmV4dDtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhIHN0cmluZyBvZiBUb3AtTGV2ZWwgRG9tYWluIG5hbWVzIGVuY29kZWQgaW4gdXBkYXRlLXRsZHMuanMgYmFja1xuICogaW50byBhIGxpc3Qgb2Ygc3RyaW5ncy5cbiAqIEBwYXJhbSB7c3RyfSBlbmNvZGVkIGVuY29kZWQgVExEcyBzdHJpbmdcbiAqIEByZXR1cm5zIHtzdHJbXX0gb3JpZ2luYWwgVExEcyBsaXN0XG4gKi9cbmZ1bmN0aW9uIGRlY29kZVRsZHMoZW5jb2RlZCkge1xuICBjb25zdCB3b3JkcyA9IFtdO1xuICBjb25zdCBzdGFjayA9IFtdO1xuICBsZXQgaSA9IDA7XG4gIGxldCBkaWdpdHMgPSAnMDEyMzQ1Njc4OSc7XG4gIHdoaWxlIChpIDwgZW5jb2RlZC5sZW5ndGgpIHtcbiAgICBsZXQgcG9wRGlnaXRDb3VudCA9IDA7XG4gICAgd2hpbGUgKGRpZ2l0cy5pbmRleE9mKGVuY29kZWRbaSArIHBvcERpZ2l0Q291bnRdKSA+PSAwKSB7XG4gICAgICBwb3BEaWdpdENvdW50Kys7IC8vIGVuY291bnRlcmVkIHNvbWUgZGlnaXRzLCBoYXZlIHRvIHBvcCB0byBnbyBvbmUgbGV2ZWwgdXAgdHJpZVxuICAgIH1cblxuICAgIGlmIChwb3BEaWdpdENvdW50ID4gMCkge1xuICAgICAgd29yZHMucHVzaChzdGFjay5qb2luKCcnKSk7IC8vIHdoYXRldmVyIHByZWNlZGVkIHRoZSBwb3AgZGlnaXRzIG11c3QgYmUgYSB3b3JkXG4gICAgICBmb3IgKGxldCBwb3BDb3VudCA9IHBhcnNlSW50KGVuY29kZWQuc3Vic3RyaW5nKGksIGkgKyBwb3BEaWdpdENvdW50KSwgMTApOyBwb3BDb3VudCA+IDA7IHBvcENvdW50LS0pIHtcbiAgICAgICAgc3RhY2sucG9wKCk7XG4gICAgICB9XG4gICAgICBpICs9IHBvcERpZ2l0Q291bnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YWNrLnB1c2goZW5jb2RlZFtpXSk7IC8vIGRyb3AgZG93biBhIGxldmVsIGludG8gdGhlIHRyaWVcbiAgICAgIGkrKztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHdvcmRzO1xufVxuXG4vKipcbiAqIEFuIG9iamVjdCB3aGVyZSBlYWNoIGtleSBpcyBhIHZhbGlkIERPTSBFdmVudCBOYW1lIHN1Y2ggYXMgYGNsaWNrYCBvciBgZm9jdXNgXG4gKiBhbmQgZWFjaCB2YWx1ZSBpcyBhbiBldmVudCBoYW5kbGVyIGZ1bmN0aW9uLlxuICpcbiAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9FbGVtZW50I2V2ZW50c1xuICogQHR5cGVkZWYgez97IFtldmVudDogc3RyaW5nXTogRnVuY3Rpb24gfX0gRXZlbnRMaXN0ZW5lcnNcbiAqL1xuXG4vKipcbiAqIEFsbCBmb3JtYXR0ZWQgcHJvcGVydGllcyByZXF1aXJlZCB0byByZW5kZXIgYSBsaW5rLCBpbmNsdWRpbmcgYHRhZ05hbWVgLFxuICogYGF0dHJpYnV0ZXNgLCBgY29udGVudGAgYW5kIGBldmVudExpc3RlbmVyc2AuXG4gKiBAdHlwZWRlZiB7eyB0YWdOYW1lOiBhbnksIGF0dHJpYnV0ZXM6IHtbYXR0cjogc3RyaW5nXTogYW55fSwgY29udGVudDogc3RyaW5nLFxuICogZXZlbnRMaXN0ZW5lcnM6IEV2ZW50TGlzdGVuZXJzIH19IEludGVybWVkaWF0ZVJlcHJlc2VudGF0aW9uXG4gKi9cblxuLyoqXG4gKiBTcGVjaWZ5IGVpdGhlciBhbiBvYmplY3QgZGVzY3JpYmVkIGJ5IHRoZSB0ZW1wbGF0ZSB0eXBlIGBPYCBvciBhIGZ1bmN0aW9uLlxuICpcbiAqIFRoZSBmdW5jdGlvbiB0YWtlcyBhIHN0cmluZyB2YWx1ZSAodXN1YWxseSB0aGUgbGluaydzIGhyZWYgYXR0cmlidXRlKSwgdGhlXG4gKiBsaW5rIHR5cGUgKGAndXJsJ2AsIGAnaGFzaHRhZ2AnLCBldGMuKSBhbmQgYW4gaW50ZXJuYWwgdG9rZW4gcmVwcmVzZW50YXRpb25cbiAqIG9mIHRoZSBsaW5rLiBJdCBzaG91bGQgcmV0dXJuIGFuIG9iamVjdCBvZiB0aGUgdGVtcGxhdGUgdHlwZSBgT2BcbiAqIEB0ZW1wbGF0ZSBPXG4gKiBAdHlwZWRlZiB7TyB8ICgodmFsdWU6IHN0cmluZywgdHlwZTogc3RyaW5nLCB0b2tlbjogTXVsdGlUb2tlbikgPT4gTyl9IE9wdE9ialxuICovXG5cbi8qKlxuICogU3BlY2lmeSBlaXRoZXIgYSBmdW5jdGlvbiBkZXNjcmliZWQgYnkgdGVtcGxhdGUgdHlwZSBgRmAgb3IgYW4gb2JqZWN0LlxuICpcbiAqIEVhY2gga2V5IGluIHRoZSBvYmplY3Qgc2hvdWxkIGJlIGEgbGluayB0eXBlIChgJ3VybCdgLCBgJ2hhc2h0YWdgJywgZXRjLikuIEVhY2hcbiAqIHZhbHVlIHNob3VsZCBiZSBhIGZ1bmN0aW9uIHdpdGggdGVtcGxhdGUgdHlwZSBgRmAgdGhhdCBpcyBjYWxsZWQgd2hlbiB0aGVcbiAqIGNvcnJlc3BvbmRpbmcgbGluayB0eXBlIGlzIGVuY291bnRlcmVkLlxuICogQHRlbXBsYXRlIEZcbiAqIEB0eXBlZGVmIHtGIHwgeyBbdHlwZTogc3RyaW5nXTogRn19IE9wdEZuXG4gKi9cblxuLyoqXG4gKiBTcGVjaWZ5IGVpdGhlciBhIHZhbHVlIHdpdGggdGVtcGxhdGUgdHlwZSBgVmAsIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGBWYCBvclxuICogYW4gb2JqZWN0IHdoZXJlIGVhY2ggdmFsdWUgcmVzb2x2ZXMgdG8gYFZgLlxuICpcbiAqIFRoZSBmdW5jdGlvbiB0YWtlcyBhIHN0cmluZyB2YWx1ZSAodXN1YWxseSB0aGUgbGluaydzIGhyZWYgYXR0cmlidXRlKSwgdGhlXG4gKiBsaW5rIHR5cGUgKGAndXJsJ2AsIGAnaGFzaHRhZ2AnLCBldGMuKSBhbmQgYW4gaW50ZXJuYWwgdG9rZW4gcmVwcmVzZW50YXRpb25cbiAqIG9mIHRoZSBsaW5rLiBJdCBzaG91bGQgcmV0dXJuIGFuIG9iamVjdCBvZiB0aGUgdGVtcGxhdGUgdHlwZSBgVmBcbiAqXG4gKiBGb3IgdGhlIG9iamVjdCwgZWFjaCBrZXkgc2hvdWxkIGJlIGEgbGluayB0eXBlIChgJ3VybCdgLCBgJ2hhc2h0YWdgJywgZXRjLikuXG4gKiBFYWNoIHZhbHVlIHNob3VsZCBlaXRoZXIgaGF2ZSB0eXBlIGBWYCBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBWLiBUaGlzXG4gKiBmdW5jdGlvbiBzaW1pbGFybHkgdGFrZXMgYSBzdHJpbmcgdmFsdWUgYW5kIGEgdG9rZW4uXG4gKlxuICogRXhhbXBsZSB2YWxpZCB0eXBlcyBmb3IgYE9wdDxzdHJpbmc+YDpcbiAqXG4gKiBgYGBqc1xuICogJ2hlbGxvJ1xuICogKHZhbHVlLCB0eXBlLCB0b2tlbikgPT4gJ3dvcmxkJ1xuICogeyB1cmw6ICdoZWxsbycsIGVtYWlsOiAodmFsdWUsIHRva2VuKSA9PiAnd29ybGQnfVxuICogYGBgXG4gKiBAdGVtcGxhdGUgVlxuICogQHR5cGVkZWYge1YgfCAoKHZhbHVlOiBzdHJpbmcsIHR5cGU6IHN0cmluZywgdG9rZW46IE11bHRpVG9rZW4pID0+IFYpIHwgeyBbdHlwZTogc3RyaW5nXTogViB8ICgodmFsdWU6IHN0cmluZywgdG9rZW46IE11bHRpVG9rZW4pID0+IFYpIH19IE9wdFxuICovXG5cbi8qKlxuICogU2VlIGF2YWlsYWJsZSBvcHRpb25zOiBodHRwczovL2xpbmtpZnkuanMub3JnL2RvY3Mvb3B0aW9ucy5odG1sXG4gKiBAdHlwZWRlZiB7e1xuICogXHRkZWZhdWx0UHJvdG9jb2w/OiBzdHJpbmcsXG4gKiAgZXZlbnRzPzogT3B0T2JqPEV2ZW50TGlzdGVuZXJzPixcbiAqIFx0Zm9ybWF0PzogT3B0PHN0cmluZz4sXG4gKiBcdGZvcm1hdEhyZWY/OiBPcHQ8c3RyaW5nPixcbiAqIFx0bmwyYnI/OiBib29sZWFuLFxuICogXHR0YWdOYW1lPzogT3B0PGFueT4sXG4gKiBcdHRhcmdldD86IE9wdDxzdHJpbmc+LFxuICogXHRyZWw/OiBPcHQ8c3RyaW5nPixcbiAqIFx0dmFsaWRhdGU/OiBPcHQ8Ym9vbGVhbj4sXG4gKiBcdHRydW5jYXRlPzogT3B0PG51bWJlcj4sXG4gKiBcdGNsYXNzTmFtZT86IE9wdDxzdHJpbmc+LFxuICogXHRhdHRyaWJ1dGVzPzogT3B0T2JqPCh7IFthdHRyOiBzdHJpbmddOiBhbnkgfSk+LFxuICogIGlnbm9yZVRhZ3M/OiBzdHJpbmdbXSxcbiAqIFx0cmVuZGVyPzogT3B0Rm48KChpcjogSW50ZXJtZWRpYXRlUmVwcmVzZW50YXRpb24pID0+IGFueSk+XG4gKiB9fSBPcHRzXG4gKi9cblxuLyoqXG4gKiBAdHlwZSBSZXF1aXJlZDxPcHRzPlxuICovXG5jb25zdCBkZWZhdWx0cyA9IHtcbiAgZGVmYXVsdFByb3RvY29sOiAnaHR0cCcsXG4gIGV2ZW50czogbnVsbCxcbiAgZm9ybWF0OiBub29wLFxuICBmb3JtYXRIcmVmOiBub29wLFxuICBubDJicjogZmFsc2UsXG4gIHRhZ05hbWU6ICdhJyxcbiAgdGFyZ2V0OiBudWxsLFxuICByZWw6IG51bGwsXG4gIHZhbGlkYXRlOiB0cnVlLFxuICB0cnVuY2F0ZTogSW5maW5pdHksXG4gIGNsYXNzTmFtZTogbnVsbCxcbiAgYXR0cmlidXRlczogbnVsbCxcbiAgaWdub3JlVGFnczogW10sXG4gIHJlbmRlcjogbnVsbFxufTtcblxuLyoqXG4gKiBVdGlsaXR5IGNsYXNzIGZvciBsaW5raWZ5IGludGVyZmFjZXMgdG8gYXBwbHkgc3BlY2lmaWVkXG4gKiB7QGxpbmsgT3B0cyBmb3JtYXR0aW5nIGFuZCByZW5kZXJpbmcgb3B0aW9uc30uXG4gKlxuICogQHBhcmFtIHtPcHRzIHwgT3B0aW9uc30gW29wdHNdIE9wdGlvbiB2YWx1ZSBvdmVycmlkZXMuXG4gKiBAcGFyYW0geyhpcjogSW50ZXJtZWRpYXRlUmVwcmVzZW50YXRpb24pID0+IGFueX0gW2RlZmF1bHRSZW5kZXJdIChGb3JcbiAqICAgaW50ZXJuYWwgdXNlKSBkZWZhdWx0IHJlbmRlciBmdW5jdGlvbiB0aGF0IGRldGVybWluZXMgaG93IHRvIGdlbmVyYXRlIGFuXG4gKiAgIEhUTUwgZWxlbWVudCBiYXNlZCBvbiBhIGxpbmsgdG9rZW4ncyBkZXJpdmVkIHRhZ05hbWUsIGF0dHJpYnV0ZXMgYW5kIEhUTUwuXG4gKiAgIFNpbWlsYXIgdG8gcmVuZGVyIG9wdGlvblxuICovXG5mdW5jdGlvbiBPcHRpb25zKG9wdHMsIGRlZmF1bHRSZW5kZXIpIHtcbiAgaWYgKGRlZmF1bHRSZW5kZXIgPT09IHZvaWQgMCkge1xuICAgIGRlZmF1bHRSZW5kZXIgPSBudWxsO1xuICB9XG4gIGxldCBvID0gYXNzaWduKHt9LCBkZWZhdWx0cyk7XG4gIGlmIChvcHRzKSB7XG4gICAgbyA9IGFzc2lnbihvLCBvcHRzIGluc3RhbmNlb2YgT3B0aW9ucyA/IG9wdHMubyA6IG9wdHMpO1xuICB9XG5cbiAgLy8gRW5zdXJlIGFsbCBpZ25vcmVkIHRhZ3MgYXJlIHVwcGVyY2FzZVxuICBjb25zdCBpZ25vcmVkVGFncyA9IG8uaWdub3JlVGFncztcbiAgY29uc3QgdXBwZXJjYXNlSWdub3JlZFRhZ3MgPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBpZ25vcmVkVGFncy5sZW5ndGg7IGkrKykge1xuICAgIHVwcGVyY2FzZUlnbm9yZWRUYWdzLnB1c2goaWdub3JlZFRhZ3NbaV0udG9VcHBlckNhc2UoKSk7XG4gIH1cbiAgLyoqIEBwcm90ZWN0ZWQgKi9cbiAgdGhpcy5vID0gbztcbiAgaWYgKGRlZmF1bHRSZW5kZXIpIHtcbiAgICB0aGlzLmRlZmF1bHRSZW5kZXIgPSBkZWZhdWx0UmVuZGVyO1xuICB9XG4gIHRoaXMuaWdub3JlVGFncyA9IHVwcGVyY2FzZUlnbm9yZWRUYWdzO1xufVxuT3B0aW9ucy5wcm90b3R5cGUgPSB7XG4gIG86IGRlZmF1bHRzLFxuICAvKipcbiAgICogQHR5cGUgc3RyaW5nW11cbiAgICovXG4gIGlnbm9yZVRhZ3M6IFtdLFxuICAvKipcbiAgICogQHBhcmFtIHtJbnRlcm1lZGlhdGVSZXByZXNlbnRhdGlvbn0gaXJcbiAgICogQHJldHVybnMge2FueX1cbiAgICovXG4gIGRlZmF1bHRSZW5kZXIoaXIpIHtcbiAgICByZXR1cm4gaXI7XG4gIH0sXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgb3IgZmFsc2UgYmFzZWQgb24gd2hldGhlciBhIHRva2VuIHNob3VsZCBiZSBkaXNwbGF5ZWQgYXMgYVxuICAgKiBsaW5rIGJhc2VkIG9uIHRoZSB1c2VyIG9wdGlvbnMuXG4gICAqIEBwYXJhbSB7TXVsdGlUb2tlbn0gdG9rZW5cbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBjaGVjayh0b2tlbikge1xuICAgIHJldHVybiB0aGlzLmdldCgndmFsaWRhdGUnLCB0b2tlbi50b1N0cmluZygpLCB0b2tlbik7XG4gIH0sXG4gIC8vIFByaXZhdGUgbWV0aG9kc1xuXG4gIC8qKlxuICAgKiBSZXNvbHZlIGFuIG9wdGlvbidzIHZhbHVlIGJhc2VkIG9uIHRoZSB2YWx1ZSBvZiB0aGUgb3B0aW9uIGFuZCB0aGUgZ2l2ZW5cbiAgICogcGFyYW1zLiBJZiBvcGVyYXRvciBhbmQgdG9rZW4gYXJlIHNwZWNpZmllZCBhbmQgdGhlIHRhcmdldCBvcHRpb24gaXNcbiAgICogY2FsbGFibGUsIGF1dG9tYXRpY2FsbHkgY2FsbHMgdGhlIGZ1bmN0aW9uIHdpdGggdGhlIGdpdmVuIGFyZ3VtZW50LlxuICAgKiBAdGVtcGxhdGUge2tleW9mIE9wdHN9IEtcbiAgICogQHBhcmFtIHtLfSBrZXkgTmFtZSBvZiBvcHRpb24gdG8gdXNlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbb3BlcmF0b3JdIHdpbGwgYmUgcGFzc2VkIHRvIHRoZSB0YXJnZXQgb3B0aW9uIGlmIGl0J3MgYVxuICAgKiBmdW5jdGlvbi4gSWYgbm90IHNwZWNpZmllZCwgUkFXIGZ1bmN0aW9uIHZhbHVlIGdldHMgcmV0dXJuZWRcbiAgICogQHBhcmFtIHtNdWx0aVRva2VufSBbdG9rZW5dIFRoZSB0b2tlbiBmcm9tIGxpbmtpZnkudG9rZW5pemVcbiAgICogQHJldHVybnMge09wdHNbS10gfCBhbnl9XG4gICAqL1xuICBnZXQoa2V5LCBvcGVyYXRvciwgdG9rZW4pIHtcbiAgICBjb25zdCBpc0NhbGxhYmxlID0gb3BlcmF0b3IgIT0gbnVsbDtcbiAgICBsZXQgb3B0aW9uID0gdGhpcy5vW2tleV07XG4gICAgaWYgKCFvcHRpb24pIHtcbiAgICAgIHJldHVybiBvcHRpb247XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb3B0aW9uID09PSAnb2JqZWN0Jykge1xuICAgICAgb3B0aW9uID0gdG9rZW4udCBpbiBvcHRpb24gPyBvcHRpb25bdG9rZW4udF0gOiBkZWZhdWx0c1trZXldO1xuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT09ICdmdW5jdGlvbicgJiYgaXNDYWxsYWJsZSkge1xuICAgICAgICBvcHRpb24gPSBvcHRpb24ob3BlcmF0b3IsIHRva2VuKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBvcHRpb24gPT09ICdmdW5jdGlvbicgJiYgaXNDYWxsYWJsZSkge1xuICAgICAgb3B0aW9uID0gb3B0aW9uKG9wZXJhdG9yLCB0b2tlbi50LCB0b2tlbik7XG4gICAgfVxuICAgIHJldHVybiBvcHRpb247XG4gIH0sXG4gIC8qKlxuICAgKiBAdGVtcGxhdGUge2tleW9mIE9wdHN9IExcbiAgICogQHBhcmFtIHtMfSBrZXkgTmFtZSBvZiBvcHRpb25zIG9iamVjdCB0byB1c2VcbiAgICogQHBhcmFtIHtzdHJpbmd9IFtvcGVyYXRvcl1cbiAgICogQHBhcmFtIHtNdWx0aVRva2VufSBbdG9rZW5dXG4gICAqIEByZXR1cm5zIHtPcHRzW0xdIHwgYW55fVxuICAgKi9cbiAgZ2V0T2JqKGtleSwgb3BlcmF0b3IsIHRva2VuKSB7XG4gICAgbGV0IG9iaiA9IHRoaXMub1trZXldO1xuICAgIGlmICh0eXBlb2Ygb2JqID09PSAnZnVuY3Rpb24nICYmIG9wZXJhdG9yICE9IG51bGwpIHtcbiAgICAgIG9iaiA9IG9iaihvcGVyYXRvciwgdG9rZW4udCwgdG9rZW4pO1xuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9LFxuICAvKipcbiAgICogQ29udmVydCB0aGUgZ2l2ZW4gdG9rZW4gdG8gYSByZW5kZXJlZCBlbGVtZW50IHRoYXQgbWF5IGJlIGFkZGVkIHRvIHRoZVxuICAgKiBjYWxsaW5nLWludGVyZmFjZSdzIERPTVxuICAgKiBAcGFyYW0ge011bHRpVG9rZW59IHRva2VuIFRva2VuIHRvIHJlbmRlciB0byBhbiBIVE1MIGVsZW1lbnRcbiAgICogQHJldHVybnMge2FueX0gUmVuZGVyIHJlc3VsdDsgZS5nLiwgSFRNTCBzdHJpbmcsIERPTSBlbGVtZW50LCBSZWFjdFxuICAgKiAgIENvbXBvbmVudCwgZXRjLlxuICAgKi9cbiAgcmVuZGVyKHRva2VuKSB7XG4gICAgY29uc3QgaXIgPSB0b2tlbi5yZW5kZXIodGhpcyk7IC8vIGludGVybWVkaWF0ZSByZXByZXNlbnRhdGlvblxuICAgIGNvbnN0IHJlbmRlckZuID0gdGhpcy5nZXQoJ3JlbmRlcicsIG51bGwsIHRva2VuKSB8fCB0aGlzLmRlZmF1bHRSZW5kZXI7XG4gICAgcmV0dXJuIHJlbmRlckZuKGlyLCB0b2tlbi50LCB0b2tlbik7XG4gIH1cbn07XG5mdW5jdGlvbiBub29wKHZhbCkge1xuICByZXR1cm4gdmFsO1xufVxuXG52YXIgb3B0aW9ucyA9IC8qI19fUFVSRV9fKi9PYmplY3QuZnJlZXplKHtcblx0X19wcm90b19fOiBudWxsLFxuXHRkZWZhdWx0czogZGVmYXVsdHMsXG5cdE9wdGlvbnM6IE9wdGlvbnMsXG5cdGFzc2lnbjogYXNzaWduXG59KTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXHRNdWx0aS1Ub2tlbnNcblx0VG9rZW5zIGNvbXBvc2VkIG9mIGFycmF5cyBvZiBUZXh0VG9rZW5zXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlXG4gKiBAcGFyYW0ge1Rva2VuW119IHRva2Vuc1xuICovXG5mdW5jdGlvbiBNdWx0aVRva2VuKHZhbHVlLCB0b2tlbnMpIHtcbiAgdGhpcy50ID0gJ3Rva2VuJztcbiAgdGhpcy52ID0gdmFsdWU7XG4gIHRoaXMudGsgPSB0b2tlbnM7XG59XG5cbi8qKlxuICogQWJzdHJhY3QgY2xhc3MgdXNlZCBmb3IgbWFudWZhY3R1cmluZyB0b2tlbnMgb2YgdGV4dCB0b2tlbnMuIFRoYXQgaXMgcmF0aGVyXG4gKiB0aGFuIHRoZSB2YWx1ZSBmb3IgYSB0b2tlbiBiZWluZyBhIHNtYWxsIHN0cmluZyBvZiB0ZXh0LCBpdCdzIHZhbHVlIGFuIGFycmF5XG4gKiBvZiB0ZXh0IHRva2Vucy5cbiAqXG4gKiBVc2VkIGZvciBncm91cGluZyB0b2dldGhlciBVUkxzLCBlbWFpbHMsIGhhc2h0YWdzLCBhbmQgb3RoZXIgcG90ZW50aWFsXG4gKiBjcmVhdGlvbnMuXG4gKiBAY2xhc3MgTXVsdGlUb2tlblxuICogQHByb3BlcnR5IHtzdHJpbmd9IHRcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB2XG4gKiBAcHJvcGVydHkge1Rva2VuW119IHRrXG4gKiBAYWJzdHJhY3RcbiAqL1xuTXVsdGlUb2tlbi5wcm90b3R5cGUgPSB7XG4gIGlzTGluazogZmFsc2UsXG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIHN0cmluZyB0aGlzIHRva2VuIHJlcHJlc2VudHMuXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiB0aGlzLnY7XG4gIH0sXG4gIC8qKlxuICAgKiBXaGF0IHNob3VsZCB0aGUgdmFsdWUgZm9yIHRoaXMgdG9rZW4gYmUgaW4gdGhlIGBocmVmYCBIVE1MIGF0dHJpYnV0ZT9cbiAgICogUmV0dXJucyB0aGUgYC50b1N0cmluZ2AgdmFsdWUgYnkgZGVmYXVsdC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IFtzY2hlbWVdXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgKi9cbiAgdG9IcmVmKHNjaGVtZSkge1xuICAgIHJldHVybiB0aGlzLnRvU3RyaW5nKCk7XG4gIH0sXG4gIC8qKlxuICAgKiBAcGFyYW0ge09wdGlvbnN9IG9wdGlvbnMgRm9ybWF0dGluZyBvcHRpb25zXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqL1xuICB0b0Zvcm1hdHRlZFN0cmluZyhvcHRpb25zKSB7XG4gICAgY29uc3QgdmFsID0gdGhpcy50b1N0cmluZygpO1xuICAgIGNvbnN0IHRydW5jYXRlID0gb3B0aW9ucy5nZXQoJ3RydW5jYXRlJywgdmFsLCB0aGlzKTtcbiAgICBjb25zdCBmb3JtYXR0ZWQgPSBvcHRpb25zLmdldCgnZm9ybWF0JywgdmFsLCB0aGlzKTtcbiAgICByZXR1cm4gdHJ1bmNhdGUgJiYgZm9ybWF0dGVkLmxlbmd0aCA+IHRydW5jYXRlID8gZm9ybWF0dGVkLnN1YnN0cmluZygwLCB0cnVuY2F0ZSkgKyAnXHUyMDI2JyA6IGZvcm1hdHRlZDtcbiAgfSxcbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSB7T3B0aW9uc30gb3B0aW9uc1xuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgKi9cbiAgdG9Gb3JtYXR0ZWRIcmVmKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gb3B0aW9ucy5nZXQoJ2Zvcm1hdEhyZWYnLCB0aGlzLnRvSHJlZihvcHRpb25zLmdldCgnZGVmYXVsdFByb3RvY29sJykpLCB0aGlzKTtcbiAgfSxcbiAgLyoqXG4gICAqIFRoZSBzdGFydCBpbmRleCBvZiB0aGlzIHRva2VuIGluIHRoZSBvcmlnaW5hbCBpbnB1dCBzdHJpbmdcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIHN0YXJ0SW5kZXgoKSB7XG4gICAgcmV0dXJuIHRoaXMudGtbMF0ucztcbiAgfSxcbiAgLyoqXG4gICAqIFRoZSBlbmQgaW5kZXggb2YgdGhpcyB0b2tlbiBpbiB0aGUgb3JpZ2luYWwgaW5wdXQgc3RyaW5nICh1cCB0byB0aGlzXG4gICAqIGluZGV4IGJ1dCBub3QgaW5jbHVkaW5nIGl0KVxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgZW5kSW5kZXgoKSB7XG4gICAgcmV0dXJuIHRoaXMudGtbdGhpcy50ay5sZW5ndGggLSAxXS5lO1xuICB9LFxuICAvKipcbiAgXHRSZXR1cm5zIGFuIG9iamVjdCAgb2YgcmVsZXZhbnQgdmFsdWVzIGZvciB0aGlzIHRva2VuLCB3aGljaCBpbmNsdWRlcyBrZXlzXG4gIFx0KiB0eXBlIC0gS2luZCBvZiB0b2tlbiAoJ3VybCcsICdlbWFpbCcsIGV0Yy4pXG4gIFx0KiB2YWx1ZSAtIE9yaWdpbmFsIHRleHRcbiAgXHQqIGhyZWYgLSBUaGUgdmFsdWUgdGhhdCBzaG91bGQgYmUgYWRkZWQgdG8gdGhlIGFuY2hvciB0YWcncyBocmVmXG4gIFx0XHRhdHRyaWJ1dGVcbiAgXHRcdEBtZXRob2QgdG9PYmplY3RcbiAgXHRAcGFyYW0ge3N0cmluZ30gW3Byb3RvY29sXSBgJ2h0dHAnYCBieSBkZWZhdWx0XG4gICovXG4gIHRvT2JqZWN0KHByb3RvY29sKSB7XG4gICAgaWYgKHByb3RvY29sID09PSB2b2lkIDApIHtcbiAgICAgIHByb3RvY29sID0gZGVmYXVsdHMuZGVmYXVsdFByb3RvY29sO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogdGhpcy50LFxuICAgICAgdmFsdWU6IHRoaXMudG9TdHJpbmcoKSxcbiAgICAgIGlzTGluazogdGhpcy5pc0xpbmssXG4gICAgICBocmVmOiB0aGlzLnRvSHJlZihwcm90b2NvbCksXG4gICAgICBzdGFydDogdGhpcy5zdGFydEluZGV4KCksXG4gICAgICBlbmQ6IHRoaXMuZW5kSW5kZXgoKVxuICAgIH07XG4gIH0sXG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0ge09wdGlvbnN9IG9wdGlvbnMgRm9ybWF0dGluZyBvcHRpb25cbiAgICovXG4gIHRvRm9ybWF0dGVkT2JqZWN0KG9wdGlvbnMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogdGhpcy50LFxuICAgICAgdmFsdWU6IHRoaXMudG9Gb3JtYXR0ZWRTdHJpbmcob3B0aW9ucyksXG4gICAgICBpc0xpbms6IHRoaXMuaXNMaW5rLFxuICAgICAgaHJlZjogdGhpcy50b0Zvcm1hdHRlZEhyZWYob3B0aW9ucyksXG4gICAgICBzdGFydDogdGhpcy5zdGFydEluZGV4KCksXG4gICAgICBlbmQ6IHRoaXMuZW5kSW5kZXgoKVxuICAgIH07XG4gIH0sXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoaXMgdG9rZW4gc2hvdWxkIGJlIHJlbmRlcmVkIGFzIGEgbGluayBhY2NvcmRpbmcgdG8gdGhlIGdpdmVuIG9wdGlvbnNcbiAgICogQHBhcmFtIHtPcHRpb25zfSBvcHRpb25zXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgdmFsaWRhdGUob3B0aW9ucykge1xuICAgIHJldHVybiBvcHRpb25zLmdldCgndmFsaWRhdGUnLCB0aGlzLnRvU3RyaW5nKCksIHRoaXMpO1xuICB9LFxuICAvKipcbiAgICogUmV0dXJuIGFuIG9iamVjdCB0aGF0IHJlcHJlc2VudHMgaG93IHRoaXMgbGluayBzaG91bGQgYmUgcmVuZGVyZWQuXG4gICAqIEBwYXJhbSB7T3B0aW9uc30gb3B0aW9ucyBGb3JtYXR0aW5uZyBvcHRpb25zXG4gICAqL1xuICByZW5kZXIob3B0aW9ucykge1xuICAgIGNvbnN0IHRva2VuID0gdGhpcztcbiAgICBjb25zdCBocmVmID0gdGhpcy50b0hyZWYob3B0aW9ucy5nZXQoJ2RlZmF1bHRQcm90b2NvbCcpKTtcbiAgICBjb25zdCBmb3JtYXR0ZWRIcmVmID0gb3B0aW9ucy5nZXQoJ2Zvcm1hdEhyZWYnLCBocmVmLCB0aGlzKTtcbiAgICBjb25zdCB0YWdOYW1lID0gb3B0aW9ucy5nZXQoJ3RhZ05hbWUnLCBocmVmLCB0b2tlbik7XG4gICAgY29uc3QgY29udGVudCA9IHRoaXMudG9Gb3JtYXR0ZWRTdHJpbmcob3B0aW9ucyk7XG4gICAgY29uc3QgYXR0cmlidXRlcyA9IHt9O1xuICAgIGNvbnN0IGNsYXNzTmFtZSA9IG9wdGlvbnMuZ2V0KCdjbGFzc05hbWUnLCBocmVmLCB0b2tlbik7XG4gICAgY29uc3QgdGFyZ2V0ID0gb3B0aW9ucy5nZXQoJ3RhcmdldCcsIGhyZWYsIHRva2VuKTtcbiAgICBjb25zdCByZWwgPSBvcHRpb25zLmdldCgncmVsJywgaHJlZiwgdG9rZW4pO1xuICAgIGNvbnN0IGF0dHJzID0gb3B0aW9ucy5nZXRPYmooJ2F0dHJpYnV0ZXMnLCBocmVmLCB0b2tlbik7XG4gICAgY29uc3QgZXZlbnRMaXN0ZW5lcnMgPSBvcHRpb25zLmdldE9iaignZXZlbnRzJywgaHJlZiwgdG9rZW4pO1xuICAgIGF0dHJpYnV0ZXMuaHJlZiA9IGZvcm1hdHRlZEhyZWY7XG4gICAgaWYgKGNsYXNzTmFtZSkge1xuICAgICAgYXR0cmlidXRlcy5jbGFzcyA9IGNsYXNzTmFtZTtcbiAgICB9XG4gICAgaWYgKHRhcmdldCkge1xuICAgICAgYXR0cmlidXRlcy50YXJnZXQgPSB0YXJnZXQ7XG4gICAgfVxuICAgIGlmIChyZWwpIHtcbiAgICAgIGF0dHJpYnV0ZXMucmVsID0gcmVsO1xuICAgIH1cbiAgICBpZiAoYXR0cnMpIHtcbiAgICAgIGFzc2lnbihhdHRyaWJ1dGVzLCBhdHRycyk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICB0YWdOYW1lLFxuICAgICAgYXR0cmlidXRlcyxcbiAgICAgIGNvbnRlbnQsXG4gICAgICBldmVudExpc3RlbmVyc1xuICAgIH07XG4gIH1cbn07XG5cbi8qKlxuICogQ3JlYXRlIGEgbmV3IHRva2VuIHRoYXQgY2FuIGJlIGVtaXR0ZWQgYnkgdGhlIHBhcnNlciBzdGF0ZSBtYWNoaW5lXG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZSByZWFkYWJsZSB0eXBlIG9mIHRoZSB0b2tlblxuICogQHBhcmFtIHtvYmplY3R9IHByb3BzIHByb3BlcnRpZXMgdG8gYXNzaWduIG9yIG92ZXJyaWRlLCBpbmNsdWRpbmcgaXNMaW5rID0gdHJ1ZSBvciBmYWxzZVxuICogQHJldHVybnMge25ldyAodmFsdWU6IHN0cmluZywgdG9rZW5zOiBUb2tlbltdKSA9PiBNdWx0aVRva2VufSBuZXcgdG9rZW4gY2xhc3NcbiAqL1xuZnVuY3Rpb24gY3JlYXRlVG9rZW5DbGFzcyh0eXBlLCBwcm9wcykge1xuICBjbGFzcyBUb2tlbiBleHRlbmRzIE11bHRpVG9rZW4ge1xuICAgIGNvbnN0cnVjdG9yKHZhbHVlLCB0b2tlbnMpIHtcbiAgICAgIHN1cGVyKHZhbHVlLCB0b2tlbnMpO1xuICAgICAgdGhpcy50ID0gdHlwZTtcbiAgICB9XG4gIH1cbiAgZm9yIChjb25zdCBwIGluIHByb3BzKSB7XG4gICAgVG9rZW4ucHJvdG90eXBlW3BdID0gcHJvcHNbcF07XG4gIH1cbiAgVG9rZW4udCA9IHR5cGU7XG4gIHJldHVybiBUb2tlbjtcbn1cblxuLyoqXG5cdFJlcHJlc2VudHMgYSBsaXN0IG9mIHRva2VucyBtYWtpbmcgdXAgYSB2YWxpZCBlbWFpbCBhZGRyZXNzXG4qL1xuY29uc3QgRW1haWwgPSBjcmVhdGVUb2tlbkNsYXNzKCdlbWFpbCcsIHtcbiAgaXNMaW5rOiB0cnVlLFxuICB0b0hyZWYoKSB7XG4gICAgcmV0dXJuICdtYWlsdG86JyArIHRoaXMudG9TdHJpbmcoKTtcbiAgfVxufSk7XG5cbi8qKlxuXHRSZXByZXNlbnRzIHNvbWUgcGxhaW4gdGV4dFxuKi9cbmNvbnN0IFRleHQgPSBjcmVhdGVUb2tlbkNsYXNzKCd0ZXh0Jyk7XG5cbi8qKlxuXHRNdWx0aS1saW5lYnJlYWsgdG9rZW4gLSByZXByZXNlbnRzIGEgbGluZSBicmVha1xuXHRAY2xhc3MgTmxcbiovXG5jb25zdCBObCA9IGNyZWF0ZVRva2VuQ2xhc3MoJ25sJyk7XG5cbi8qKlxuXHRSZXByZXNlbnRzIGEgbGlzdCBvZiB0ZXh0IHRva2VucyBtYWtpbmcgdXAgYSB2YWxpZCBVUkxcblx0QGNsYXNzIFVybFxuKi9cbmNvbnN0IFVybCA9IGNyZWF0ZVRva2VuQ2xhc3MoJ3VybCcsIHtcbiAgaXNMaW5rOiB0cnVlLFxuICAvKipcbiAgXHRMb3dlcmNhc2VzIHJlbGV2YW50IHBhcnRzIG9mIHRoZSBkb21haW4gYW5kIGFkZHMgdGhlIHByb3RvY29sIGlmXG4gIFx0cmVxdWlyZWQuIE5vdGUgdGhhdCB0aGlzIHdpbGwgbm90IGVzY2FwZSB1bnNhZmUgSFRNTCBjaGFyYWN0ZXJzIGluIHRoZVxuICBcdFVSTC5cbiAgXHRcdEBwYXJhbSB7c3RyaW5nfSBbc2NoZW1lXSBkZWZhdWx0IHNjaGVtZSAoZS5nLiwgJ2h0dHBzJylcbiAgXHRAcmV0dXJuIHtzdHJpbmd9IHRoZSBmdWxsIGhyZWZcbiAgKi9cbiAgdG9IcmVmKHNjaGVtZSkge1xuICAgIGlmIChzY2hlbWUgPT09IHZvaWQgMCkge1xuICAgICAgc2NoZW1lID0gZGVmYXVsdHMuZGVmYXVsdFByb3RvY29sO1xuICAgIH1cbiAgICAvLyBDaGVjayBpZiBhbHJlYWR5IGhhcyBhIHByZWZpeCBzY2hlbWVcbiAgICByZXR1cm4gdGhpcy5oYXNQcm90b2NvbCgpID8gdGhpcy52IDogYCR7c2NoZW1lfTovLyR7dGhpcy52fWA7XG4gIH0sXG4gIC8qKlxuICAgKiBDaGVjayB3aGV0aGVyIHRoaXMgVVJMIHRva2VuIGhhcyBhIHByb3RvY29sXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBoYXNQcm90b2NvbCgpIHtcbiAgICBjb25zdCB0b2tlbnMgPSB0aGlzLnRrO1xuICAgIHJldHVybiB0b2tlbnMubGVuZ3RoID49IDIgJiYgdG9rZW5zWzBdLnQgIT09IExPQ0FMSE9TVCAmJiB0b2tlbnNbMV0udCA9PT0gQ09MT047XG4gIH1cbn0pO1xuXG52YXIgbXVsdGkgPSAvKiNfX1BVUkVfXyovT2JqZWN0LmZyZWV6ZSh7XG5cdF9fcHJvdG9fXzogbnVsbCxcblx0TXVsdGlUb2tlbjogTXVsdGlUb2tlbixcblx0QmFzZTogTXVsdGlUb2tlbixcblx0Y3JlYXRlVG9rZW5DbGFzczogY3JlYXRlVG9rZW5DbGFzcyxcblx0RW1haWw6IEVtYWlsLFxuXHRUZXh0OiBUZXh0LFxuXHRObDogTmwsXG5cdFVybDogVXJsXG59KTtcblxuLyoqXG5cdE5vdCBleGFjdGx5IHBhcnNlciwgbW9yZSBsaWtlIHRoZSBzZWNvbmQtc3RhZ2Ugc2Nhbm5lciAoYWx0aG91Z2ggd2UgY2FuXG5cdHRoZW9yZXRpY2FsbHkgaG90c3dhcCB0aGUgY29kZSBoZXJlIHdpdGggYSByZWFsIHBhcnNlciBpbiB0aGUgZnV0dXJlLi4uIGJ1dFxuXHRmb3IgYSBsaXR0bGUgVVJMLWZpbmRpbmcgdXRpbGl0eSBhYnN0cmFjdCBzeW50YXggdHJlZXMgbWF5IGJlIGEgbGl0dGxlXG5cdG92ZXJraWxsKS5cblxuXHRVUkwgZm9ybWF0OiBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1VSSV9zY2hlbWVcblx0RW1haWwgZm9ybWF0OiBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0VtYWlsQWRkcmVzcyAobGlua3MgdG8gUkZDIGluXG5cdHJlZmVyZW5jZSlcblxuXHRAbW9kdWxlIGxpbmtpZnlcblx0QHN1Ym1vZHVsZSBwYXJzZXJcblx0QG1haW4gcnVuXG4qL1xuY29uc3QgbWFrZVN0YXRlID0gYXJnID0+IG5ldyBTdGF0ZShhcmcpO1xuXG4vKipcbiAqIEdlbmVyYXRlIHRoZSBwYXJzZXIgbXVsdGkgdG9rZW4tYmFzZWQgc3RhdGUgbWFjaGluZVxuICogQHBhcmFtIHt7IGdyb3VwczogQ29sbGVjdGlvbnM8c3RyaW5nPiB9fSB0b2tlbnNcbiAqL1xuZnVuY3Rpb24gaW5pdCQxKF9yZWYpIHtcbiAgbGV0IHtcbiAgICBncm91cHNcbiAgfSA9IF9yZWY7XG4gIC8vIFR5cGVzIG9mIGNoYXJhY3RlcnMgdGhlIFVSTCBjYW4gZGVmaW5pdGVseSBlbmQgaW5cbiAgY29uc3QgcXNBY2NlcHRpbmcgPSBncm91cHMuZG9tYWluLmNvbmNhdChbQU1QRVJTQU5ELCBBU1RFUklTSywgQVQsIEJBQ0tTTEFTSCwgQkFDS1RJQ0ssIENBUkVULCBET0xMQVIsIEVRVUFMUywgSFlQSEVOLCBOVU0sIFBFUkNFTlQsIFBJUEUsIFBMVVMsIFBPVU5ELCBTTEFTSCwgU1lNLCBUSUxERSwgVU5ERVJTQ09SRV0pO1xuXG4gIC8vIFR5cGVzIG9mIHRva2VucyB0aGF0IGNhbiBmb2xsb3cgYSBVUkwgYW5kIGJlIHBhcnQgb2YgdGhlIHF1ZXJ5IHN0cmluZ1xuICAvLyBidXQgY2Fubm90IGJlIHRoZSB2ZXJ5IGxhc3QgY2hhcmFjdGVyc1xuICAvLyBDaGFyYWN0ZXJzIHRoYXQgY2Fubm90IGFwcGVhciBpbiB0aGUgVVJMIGF0IGFsbCBzaG91bGQgYmUgZXhjbHVkZWRcbiAgY29uc3QgcXNOb25BY2NlcHRpbmcgPSBbQVBPU1RST1BIRSwgQ0xPU0VBTkdMRUJSQUNLRVQsIENMT1NFQlJBQ0UsIENMT1NFQlJBQ0tFVCwgQ0xPU0VQQVJFTiwgQ09MT04sIENPTU1BLCBET1QsIEVYQ0xBTUFUSU9OLCBPUEVOQU5HTEVCUkFDS0VULCBPUEVOQlJBQ0UsIE9QRU5CUkFDS0VULCBPUEVOUEFSRU4sIFFVRVJZLCBRVU9URSwgU0VNSV07XG5cbiAgLy8gRm9yIGFkZHJlc3NlcyB3aXRob3V0IHRoZSBtYWlsdG8gcHJlZml4XG4gIC8vIFRva2VucyBhbGxvd2VkIGluIHRoZSBsb2NhbHBhcnQgb2YgdGhlIGVtYWlsXG4gIGNvbnN0IGxvY2FscGFydEFjY2VwdGluZyA9IFtBTVBFUlNBTkQsIEFQT1NUUk9QSEUsIEFTVEVSSVNLLCBCQUNLU0xBU0gsIEJBQ0tUSUNLLCBDQVJFVCwgQ0xPU0VCUkFDRSwgRE9MTEFSLCBFUVVBTFMsIEhZUEhFTiwgT1BFTkJSQUNFLCBQRVJDRU5ULCBQSVBFLCBQTFVTLCBQT1VORCwgUVVFUlksIFNMQVNILCBTWU0sIFRJTERFLCBVTkRFUlNDT1JFXTtcblxuICAvLyBUaGUgdW5pdmVyc2FsIHN0YXJ0aW5nIHN0YXRlLlxuICAvKipcbiAgICogQHR5cGUgU3RhdGU8VG9rZW4+XG4gICAqL1xuICBjb25zdCBTdGFydCA9IG1ha2VTdGF0ZSgpO1xuICBjb25zdCBMb2NhbHBhcnQgPSB0dChTdGFydCwgVElMREUpOyAvLyBMb2NhbCBwYXJ0IG9mIHRoZSBlbWFpbCBhZGRyZXNzXG4gIHRhKExvY2FscGFydCwgbG9jYWxwYXJ0QWNjZXB0aW5nLCBMb2NhbHBhcnQpO1xuICB0YShMb2NhbHBhcnQsIGdyb3Vwcy5kb21haW4sIExvY2FscGFydCk7XG4gIGNvbnN0IERvbWFpbiA9IG1ha2VTdGF0ZSgpLFxuICAgIFNjaGVtZSA9IG1ha2VTdGF0ZSgpLFxuICAgIFNsYXNoU2NoZW1lID0gbWFrZVN0YXRlKCk7XG4gIHRhKFN0YXJ0LCBncm91cHMuZG9tYWluLCBEb21haW4pOyAvLyBwYXJzZWQgc3RyaW5nIGVuZHMgd2l0aCBhIHBvdGVudGlhbCBkb21haW4gbmFtZSAoQSlcbiAgdGEoU3RhcnQsIGdyb3Vwcy5zY2hlbWUsIFNjaGVtZSk7IC8vIGUuZy4sICdtYWlsdG8nXG4gIHRhKFN0YXJ0LCBncm91cHMuc2xhc2hzY2hlbWUsIFNsYXNoU2NoZW1lKTsgLy8gZS5nLiwgJ2h0dHAnXG5cbiAgdGEoRG9tYWluLCBsb2NhbHBhcnRBY2NlcHRpbmcsIExvY2FscGFydCk7XG4gIHRhKERvbWFpbiwgZ3JvdXBzLmRvbWFpbiwgRG9tYWluKTtcbiAgY29uc3QgTG9jYWxwYXJ0QXQgPSB0dChEb21haW4sIEFUKTsgLy8gTG9jYWwgcGFydCBvZiB0aGUgZW1haWwgYWRkcmVzcyBwbHVzIEBcblxuICB0dChMb2NhbHBhcnQsIEFULCBMb2NhbHBhcnRBdCk7IC8vIGNsb3NlIHRvIGFuIGVtYWlsIGFkZHJlc3Mgbm93XG5cbiAgLy8gTG9jYWwgcGFydCBvZiBhbiBlbWFpbCBhZGRyZXNzIGNhbiBiZSBlLmcuICdodHRwJyBvciAnbWFpbHRvJ1xuICB0dChTY2hlbWUsIEFULCBMb2NhbHBhcnRBdCk7XG4gIHR0KFNsYXNoU2NoZW1lLCBBVCwgTG9jYWxwYXJ0QXQpO1xuICBjb25zdCBMb2NhbHBhcnREb3QgPSB0dChMb2NhbHBhcnQsIERPVCk7IC8vIExvY2FsIHBhcnQgb2YgdGhlIGVtYWlsIGFkZHJlc3MgcGx1cyAnLicgKGxvY2FscGFydCBjYW5ub3QgZW5kIGluIC4pXG4gIHRhKExvY2FscGFydERvdCwgbG9jYWxwYXJ0QWNjZXB0aW5nLCBMb2NhbHBhcnQpO1xuICB0YShMb2NhbHBhcnREb3QsIGdyb3Vwcy5kb21haW4sIExvY2FscGFydCk7XG4gIGNvbnN0IEVtYWlsRG9tYWluID0gbWFrZVN0YXRlKCk7XG4gIHRhKExvY2FscGFydEF0LCBncm91cHMuZG9tYWluLCBFbWFpbERvbWFpbik7IC8vIHBhcnNlZCBzdHJpbmcgc3RhcnRzIHdpdGggbG9jYWwgZW1haWwgaW5mbyArIEAgd2l0aCBhIHBvdGVudGlhbCBkb21haW4gbmFtZVxuICB0YShFbWFpbERvbWFpbiwgZ3JvdXBzLmRvbWFpbiwgRW1haWxEb21haW4pO1xuICBjb25zdCBFbWFpbERvbWFpbkRvdCA9IHR0KEVtYWlsRG9tYWluLCBET1QpOyAvLyBkb21haW4gZm9sbG93ZWQgYnkgRE9UXG4gIHRhKEVtYWlsRG9tYWluRG90LCBncm91cHMuZG9tYWluLCBFbWFpbERvbWFpbik7XG4gIGNvbnN0IEVtYWlsJDEgPSBtYWtlU3RhdGUoRW1haWwpOyAvLyBQb3NzaWJsZSBlbWFpbCBhZGRyZXNzIChjb3VsZCBoYXZlIG1vcmUgdGxkcylcbiAgdGEoRW1haWxEb21haW5Eb3QsIGdyb3Vwcy50bGQsIEVtYWlsJDEpO1xuICB0YShFbWFpbERvbWFpbkRvdCwgZ3JvdXBzLnV0bGQsIEVtYWlsJDEpO1xuICB0dChMb2NhbHBhcnRBdCwgTE9DQUxIT1NULCBFbWFpbCQxKTtcblxuICAvLyBIeXBoZW4gY2FuIGp1bXAgYmFjayB0byBhIGRvbWFpbiBuYW1lXG4gIGNvbnN0IEVtYWlsRG9tYWluSHlwaGVuID0gdHQoRW1haWxEb21haW4sIEhZUEhFTik7IC8vIHBhcnNlZCBzdHJpbmcgc3RhcnRzIHdpdGggbG9jYWwgZW1haWwgaW5mbyArIEAgd2l0aCBhIHBvdGVudGlhbCBkb21haW4gbmFtZVxuICB0YShFbWFpbERvbWFpbkh5cGhlbiwgZ3JvdXBzLmRvbWFpbiwgRW1haWxEb21haW4pO1xuICB0YShFbWFpbCQxLCBncm91cHMuZG9tYWluLCBFbWFpbERvbWFpbik7XG4gIHR0KEVtYWlsJDEsIERPVCwgRW1haWxEb21haW5Eb3QpO1xuICB0dChFbWFpbCQxLCBIWVBIRU4sIEVtYWlsRG9tYWluSHlwaGVuKTtcblxuICAvLyBGaW5hbCBwb3NzaWJsZSBlbWFpbCBzdGF0ZXNcbiAgY29uc3QgRW1haWxDb2xvbiA9IHR0KEVtYWlsJDEsIENPTE9OKTsgLy8gVVJMIGZvbGxvd2VkIGJ5IGNvbG9uIChwb3RlbnRpYWwgcG9ydCBudW1iZXIgaGVyZSlcbiAgLypjb25zdCBFbWFpbENvbG9uUG9ydCA9ICovXG4gIHRhKEVtYWlsQ29sb24sIGdyb3Vwcy5udW1lcmljLCBFbWFpbCk7IC8vIFVSTCBmb2xsb3dlZCBieSBjb2xvbiBhbmQgcG9ydCBudW1uZXJcblxuICAvLyBBY2NvdW50IGZvciBkb3RzIGFuZCBoeXBoZW5zLiBIeXBoZW5zIGFyZSB1c3VhbGx5IHBhcnRzIG9mIGRvbWFpbiBuYW1lc1xuICAvLyAoYnV0IG5vdCBUTERzKVxuICBjb25zdCBEb21haW5IeXBoZW4gPSB0dChEb21haW4sIEhZUEhFTik7IC8vIGRvbWFpbiBmb2xsb3dlZCBieSBoeXBoZW5cbiAgY29uc3QgRG9tYWluRG90ID0gdHQoRG9tYWluLCBET1QpOyAvLyBkb21haW4gZm9sbG93ZWQgYnkgRE9UXG4gIHRhKERvbWFpbkh5cGhlbiwgZ3JvdXBzLmRvbWFpbiwgRG9tYWluKTtcbiAgdGEoRG9tYWluRG90LCBsb2NhbHBhcnRBY2NlcHRpbmcsIExvY2FscGFydCk7XG4gIHRhKERvbWFpbkRvdCwgZ3JvdXBzLmRvbWFpbiwgRG9tYWluKTtcbiAgY29uc3QgRG9tYWluRG90VGxkID0gbWFrZVN0YXRlKFVybCk7IC8vIFNpbXBsZXN0IHBvc3NpYmxlIFVSTCB3aXRoIG5vIHF1ZXJ5IHN0cmluZ1xuICB0YShEb21haW5Eb3QsIGdyb3Vwcy50bGQsIERvbWFpbkRvdFRsZCk7XG4gIHRhKERvbWFpbkRvdCwgZ3JvdXBzLnV0bGQsIERvbWFpbkRvdFRsZCk7XG4gIHRhKERvbWFpbkRvdFRsZCwgZ3JvdXBzLmRvbWFpbiwgRG9tYWluKTtcbiAgdGEoRG9tYWluRG90VGxkLCBsb2NhbHBhcnRBY2NlcHRpbmcsIExvY2FscGFydCk7XG4gIHR0KERvbWFpbkRvdFRsZCwgRE9ULCBEb21haW5Eb3QpO1xuICB0dChEb21haW5Eb3RUbGQsIEhZUEhFTiwgRG9tYWluSHlwaGVuKTtcbiAgdHQoRG9tYWluRG90VGxkLCBBVCwgTG9jYWxwYXJ0QXQpO1xuICBjb25zdCBEb21haW5Eb3RUbGRDb2xvbiA9IHR0KERvbWFpbkRvdFRsZCwgQ09MT04pOyAvLyBVUkwgZm9sbG93ZWQgYnkgY29sb24gKHBvdGVudGlhbCBwb3J0IG51bWJlciBoZXJlKVxuICBjb25zdCBEb21haW5Eb3RUbGRDb2xvblBvcnQgPSBtYWtlU3RhdGUoVXJsKTsgLy8gVExEIGZvbGxvd2VkIGJ5IGEgcG9ydCBudW1iZXJcbiAgdGEoRG9tYWluRG90VGxkQ29sb24sIGdyb3Vwcy5udW1lcmljLCBEb21haW5Eb3RUbGRDb2xvblBvcnQpO1xuXG4gIC8vIExvbmcgVVJMIHdpdGggb3B0aW9uYWwgcG9ydCBhbmQgbWF5YmUgcXVlcnkgc3RyaW5nXG4gIGNvbnN0IFVybCQxID0gbWFrZVN0YXRlKFVybCk7XG5cbiAgLy8gVVJMIHdpdGggZXh0cmEgc3ltYm9scyBhdCB0aGUgZW5kLCBmb2xsb3dlZCBieSBhbiBvcGVuaW5nIGJyYWNrZXRcbiAgY29uc3QgVXJsTm9uYWNjZXB0ID0gbWFrZVN0YXRlKCk7IC8vIFVSTCBmb2xsb3dlZCBieSBzb21lIHN5bWJvbHMgKHdpbGwgbm90IGJlIHBhcnQgb2YgdGhlIGZpbmFsIFVSTClcblxuICAvLyBRdWVyeSBzdHJpbmdzXG4gIHRhKFVybCQxLCBxc0FjY2VwdGluZywgVXJsJDEpO1xuICB0YShVcmwkMSwgcXNOb25BY2NlcHRpbmcsIFVybE5vbmFjY2VwdCk7XG4gIHRhKFVybE5vbmFjY2VwdCwgcXNBY2NlcHRpbmcsIFVybCQxKTtcbiAgdGEoVXJsTm9uYWNjZXB0LCBxc05vbkFjY2VwdGluZywgVXJsTm9uYWNjZXB0KTtcblxuICAvLyBCZWNvbWUgcmVhbCBVUkxzIGFmdGVyIGBTTEFTSGAgb3IgYENPTE9OIE5VTSBTTEFTSGBcbiAgLy8gSGVyZSB3b3JrcyB3aXRoIG9yIHdpdGhvdXQgc2NoZW1lOi8vIHByZWZpeFxuICB0dChEb21haW5Eb3RUbGQsIFNMQVNILCBVcmwkMSk7XG4gIHR0KERvbWFpbkRvdFRsZENvbG9uUG9ydCwgU0xBU0gsIFVybCQxKTtcblxuICAvLyBOb3RlIHRoYXQgZG9tYWlucyB0aGF0IGJlZ2luIHdpdGggc2NoZW1lcyBhcmUgdHJlYXRlZCBzbGlnaGx5IGRpZmZlcmVudGx5XG4gIGNvbnN0IFNjaGVtZUNvbG9uID0gdHQoU2NoZW1lLCBDT0xPTik7IC8vIGUuZy4sICdtYWlsdG86J1xuICBjb25zdCBTbGFzaFNjaGVtZUNvbG9uID0gdHQoU2xhc2hTY2hlbWUsIENPTE9OKTsgLy8gZS5nLiwgJ2h0dHA6J1xuICBjb25zdCBTbGFzaFNjaGVtZUNvbG9uU2xhc2ggPSB0dChTbGFzaFNjaGVtZUNvbG9uLCBTTEFTSCk7IC8vIGUuZy4sICdodHRwOi8nXG5cbiAgY29uc3QgVXJpUHJlZml4ID0gdHQoU2xhc2hTY2hlbWVDb2xvblNsYXNoLCBTTEFTSCk7IC8vIGUuZy4sICdodHRwOi8vJ1xuXG4gIC8vIFNjaGVtZSBzdGF0ZXMgY2FuIHRyYW5zaXRpb24gdG8gZG9tYWluIHN0YXRlc1xuICB0YShTY2hlbWUsIGdyb3Vwcy5kb21haW4sIERvbWFpbik7XG4gIHR0KFNjaGVtZSwgRE9ULCBEb21haW5Eb3QpO1xuICB0dChTY2hlbWUsIEhZUEhFTiwgRG9tYWluSHlwaGVuKTtcbiAgdGEoU2xhc2hTY2hlbWUsIGdyb3Vwcy5kb21haW4sIERvbWFpbik7XG4gIHR0KFNsYXNoU2NoZW1lLCBET1QsIERvbWFpbkRvdCk7XG4gIHR0KFNsYXNoU2NoZW1lLCBIWVBIRU4sIERvbWFpbkh5cGhlbik7XG5cbiAgLy8gRm9yY2UgVVJMIHdpdGggc2NoZW1lIHByZWZpeCBmb2xsb3dlZCBieSBhbnl0aGluZyBzYW5lXG4gIHRhKFNjaGVtZUNvbG9uLCBncm91cHMuZG9tYWluLCBVcmwkMSk7XG4gIHR0KFNjaGVtZUNvbG9uLCBTTEFTSCwgVXJsJDEpO1xuICB0YShVcmlQcmVmaXgsIGdyb3Vwcy5kb21haW4sIFVybCQxKTtcbiAgdGEoVXJpUHJlZml4LCBxc0FjY2VwdGluZywgVXJsJDEpO1xuICB0dChVcmlQcmVmaXgsIFNMQVNILCBVcmwkMSk7XG5cbiAgLy8gVVJMLCBmb2xsb3dlZCBieSBhbiBvcGVuaW5nIGJyYWNrZXRcbiAgY29uc3QgVXJsT3BlbmJyYWNlID0gdHQoVXJsJDEsIE9QRU5CUkFDRSk7IC8vIFVSTCBmb2xsb3dlZCBieSB7XG4gIGNvbnN0IFVybE9wZW5icmFja2V0ID0gdHQoVXJsJDEsIE9QRU5CUkFDS0VUKTsgLy8gVVJMIGZvbGxvd2VkIGJ5IFtcbiAgY29uc3QgVXJsT3BlbmFuZ2xlYnJhY2tldCA9IHR0KFVybCQxLCBPUEVOQU5HTEVCUkFDS0VUKTsgLy8gVVJMIGZvbGxvd2VkIGJ5IDxcbiAgY29uc3QgVXJsT3BlbnBhcmVuID0gdHQoVXJsJDEsIE9QRU5QQVJFTik7IC8vIFVSTCBmb2xsb3dlZCBieSAoXG5cbiAgdHQoVXJsTm9uYWNjZXB0LCBPUEVOQlJBQ0UsIFVybE9wZW5icmFjZSk7XG4gIHR0KFVybE5vbmFjY2VwdCwgT1BFTkJSQUNLRVQsIFVybE9wZW5icmFja2V0KTtcbiAgdHQoVXJsTm9uYWNjZXB0LCBPUEVOQU5HTEVCUkFDS0VULCBVcmxPcGVuYW5nbGVicmFja2V0KTtcbiAgdHQoVXJsTm9uYWNjZXB0LCBPUEVOUEFSRU4sIFVybE9wZW5wYXJlbik7XG5cbiAgLy8gQ2xvc2luZyBicmFja2V0IGNvbXBvbmVudC4gVGhpcyBjaGFyYWN0ZXIgV0lMTCBiZSBpbmNsdWRlZCBpbiB0aGUgVVJMXG4gIHR0KFVybE9wZW5icmFjZSwgQ0xPU0VCUkFDRSwgVXJsJDEpO1xuICB0dChVcmxPcGVuYnJhY2tldCwgQ0xPU0VCUkFDS0VULCBVcmwkMSk7XG4gIHR0KFVybE9wZW5hbmdsZWJyYWNrZXQsIENMT1NFQU5HTEVCUkFDS0VULCBVcmwkMSk7XG4gIHR0KFVybE9wZW5wYXJlbiwgQ0xPU0VQQVJFTiwgVXJsJDEpO1xuICB0dChVcmxPcGVuYnJhY2UsIENMT1NFQlJBQ0UsIFVybCQxKTtcblxuICAvLyBVUkwgdGhhdCBiZWluZ3Mgd2l0aCBhbiBvcGVuaW5nIGJyYWNrZXQsIGZvbGxvd2VkIGJ5IGEgc3ltYm9scy5cbiAgLy8gTm90ZSB0aGF0IHRoZSBmaW5hbCBzdGF0ZSBjYW4gc3RpbGwgYmUgYFVybE9wZW5icmFjZWAgKGlmIHRoZSBVUkwgb25seVxuICAvLyBoYXMgYSBzaW5nbGUgb3BlbmluZyBicmFja2V0IGZvciBzb21lIHJlYXNvbikuXG4gIGNvbnN0IFVybE9wZW5icmFjZVEgPSBtYWtlU3RhdGUoVXJsKTsgLy8gVVJMIGZvbGxvd2VkIGJ5IHsgYW5kIHNvbWUgc3ltYm9scyB0aGF0IHRoZSBVUkwgY2FuIGVuZCBpdFxuICBjb25zdCBVcmxPcGVuYnJhY2tldFEgPSBtYWtlU3RhdGUoVXJsKTsgLy8gVVJMIGZvbGxvd2VkIGJ5IFsgYW5kIHNvbWUgc3ltYm9scyB0aGF0IHRoZSBVUkwgY2FuIGVuZCBpdFxuICBjb25zdCBVcmxPcGVuYW5nbGVicmFja2V0USA9IG1ha2VTdGF0ZShVcmwpOyAvLyBVUkwgZm9sbG93ZWQgYnkgPCBhbmQgc29tZSBzeW1ib2xzIHRoYXQgdGhlIFVSTCBjYW4gZW5kIGl0XG4gIGNvbnN0IFVybE9wZW5wYXJlblEgPSBtYWtlU3RhdGUoVXJsKTsgLy8gVVJMIGZvbGxvd2VkIGJ5ICggYW5kIHNvbWUgc3ltYm9scyB0aGF0IHRoZSBVUkwgY2FuIGVuZCBpdFxuICB0YShVcmxPcGVuYnJhY2UsIHFzQWNjZXB0aW5nLCBVcmxPcGVuYnJhY2VRKTtcbiAgdGEoVXJsT3BlbmJyYWNrZXQsIHFzQWNjZXB0aW5nLCBVcmxPcGVuYnJhY2tldFEpO1xuICB0YShVcmxPcGVuYW5nbGVicmFja2V0LCBxc0FjY2VwdGluZywgVXJsT3BlbmFuZ2xlYnJhY2tldFEpO1xuICB0YShVcmxPcGVucGFyZW4sIHFzQWNjZXB0aW5nLCBVcmxPcGVucGFyZW5RKTtcbiAgY29uc3QgVXJsT3BlbmJyYWNlU3ltcyA9IG1ha2VTdGF0ZSgpOyAvLyBVcmxPcGVuYnJhY2UgZm9sbG93ZWQgYnkgc29tZSBzeW1ib2xzIGl0IGNhbm5vdCBlbmQgaXRcbiAgY29uc3QgVXJsT3BlbmJyYWNrZXRTeW1zID0gbWFrZVN0YXRlKCk7IC8vIFVybE9wZW5icmFja2V0USBmb2xsb3dlZCBieSBzb21lIHN5bWJvbHMgaXQgY2Fubm90IGVuZCBpdFxuICBjb25zdCBVcmxPcGVuYW5nbGVicmFja2V0U3ltcyA9IG1ha2VTdGF0ZSgpOyAvLyBVcmxPcGVuYW5nbGVicmFja2V0USBmb2xsb3dlZCBieSBzb21lIHN5bWJvbHMgaXQgY2Fubm90IGVuZCBpdFxuICBjb25zdCBVcmxPcGVucGFyZW5TeW1zID0gbWFrZVN0YXRlKCk7IC8vIFVybE9wZW5wYXJlblEgZm9sbG93ZWQgYnkgc29tZSBzeW1ib2xzIGl0IGNhbm5vdCBlbmQgaXRcbiAgdGEoVXJsT3BlbmJyYWNlLCBxc05vbkFjY2VwdGluZyk7XG4gIHRhKFVybE9wZW5icmFja2V0LCBxc05vbkFjY2VwdGluZyk7XG4gIHRhKFVybE9wZW5hbmdsZWJyYWNrZXQsIHFzTm9uQWNjZXB0aW5nKTtcbiAgdGEoVXJsT3BlbnBhcmVuLCBxc05vbkFjY2VwdGluZyk7XG5cbiAgLy8gVVJMIHRoYXQgYmVnaW5zIHdpdGggYW4gb3BlbmluZyBicmFja2V0LCBmb2xsb3dlZCBieSBzb21lIHN5bWJvbHNcbiAgdGEoVXJsT3BlbmJyYWNlUSwgcXNBY2NlcHRpbmcsIFVybE9wZW5icmFjZVEpO1xuICB0YShVcmxPcGVuYnJhY2tldFEsIHFzQWNjZXB0aW5nLCBVcmxPcGVuYnJhY2tldFEpO1xuICB0YShVcmxPcGVuYW5nbGVicmFja2V0USwgcXNBY2NlcHRpbmcsIFVybE9wZW5hbmdsZWJyYWNrZXRRKTtcbiAgdGEoVXJsT3BlbnBhcmVuUSwgcXNBY2NlcHRpbmcsIFVybE9wZW5wYXJlblEpO1xuICB0YShVcmxPcGVuYnJhY2VRLCBxc05vbkFjY2VwdGluZywgVXJsT3BlbmJyYWNlUSk7XG4gIHRhKFVybE9wZW5icmFja2V0USwgcXNOb25BY2NlcHRpbmcsIFVybE9wZW5icmFja2V0USk7XG4gIHRhKFVybE9wZW5hbmdsZWJyYWNrZXRRLCBxc05vbkFjY2VwdGluZywgVXJsT3BlbmFuZ2xlYnJhY2tldFEpO1xuICB0YShVcmxPcGVucGFyZW5RLCBxc05vbkFjY2VwdGluZywgVXJsT3BlbnBhcmVuUSk7XG4gIHRhKFVybE9wZW5icmFjZVN5bXMsIHFzQWNjZXB0aW5nLCBVcmxPcGVuYnJhY2VTeW1zKTtcbiAgdGEoVXJsT3BlbmJyYWNrZXRTeW1zLCBxc0FjY2VwdGluZywgVXJsT3BlbmJyYWNrZXRRKTtcbiAgdGEoVXJsT3BlbmFuZ2xlYnJhY2tldFN5bXMsIHFzQWNjZXB0aW5nLCBVcmxPcGVuYW5nbGVicmFja2V0USk7XG4gIHRhKFVybE9wZW5wYXJlblN5bXMsIHFzQWNjZXB0aW5nLCBVcmxPcGVucGFyZW5RKTtcbiAgdGEoVXJsT3BlbmJyYWNlU3ltcywgcXNOb25BY2NlcHRpbmcsIFVybE9wZW5icmFjZVN5bXMpO1xuICB0YShVcmxPcGVuYnJhY2tldFN5bXMsIHFzTm9uQWNjZXB0aW5nLCBVcmxPcGVuYnJhY2tldFN5bXMpO1xuICB0YShVcmxPcGVuYW5nbGVicmFja2V0U3ltcywgcXNOb25BY2NlcHRpbmcsIFVybE9wZW5hbmdsZWJyYWNrZXRTeW1zKTtcbiAgdGEoVXJsT3BlbnBhcmVuU3ltcywgcXNOb25BY2NlcHRpbmcsIFVybE9wZW5wYXJlblN5bXMpO1xuXG4gIC8vIENsb3NlIGJyYWNlL2JyYWNrZXQgdG8gYmVjb21lIHJlZ3VsYXIgVVJMXG4gIHR0KFVybE9wZW5icmFja2V0USwgQ0xPU0VCUkFDS0VULCBVcmwkMSk7XG4gIHR0KFVybE9wZW5hbmdsZWJyYWNrZXRRLCBDTE9TRUFOR0xFQlJBQ0tFVCwgVXJsJDEpO1xuICB0dChVcmxPcGVucGFyZW5RLCBDTE9TRVBBUkVOLCBVcmwkMSk7XG4gIHR0KFVybE9wZW5icmFjZVEsIENMT1NFQlJBQ0UsIFVybCQxKTtcbiAgdHQoVXJsT3BlbmJyYWNrZXRTeW1zLCBDTE9TRUJSQUNLRVQsIFVybCQxKTtcbiAgdHQoVXJsT3BlbmFuZ2xlYnJhY2tldFN5bXMsIENMT1NFQU5HTEVCUkFDS0VULCBVcmwkMSk7XG4gIHR0KFVybE9wZW5wYXJlblN5bXMsIENMT1NFUEFSRU4sIFVybCQxKTtcbiAgdHQoVXJsT3BlbmJyYWNlU3ltcywgQ0xPU0VQQVJFTiwgVXJsJDEpO1xuICB0dChTdGFydCwgTE9DQUxIT1NULCBEb21haW5Eb3RUbGQpOyAvLyBsb2NhbGhvc3QgaXMgYSB2YWxpZCBVUkwgc3RhdGVcbiAgdHQoU3RhcnQsIE5MJDEsIE5sKTsgLy8gc2luZ2xlIG5ldyBsaW5lXG5cbiAgcmV0dXJuIHtcbiAgICBzdGFydDogU3RhcnQsXG4gICAgdG9rZW5zOiB0a1xuICB9O1xufVxuXG4vKipcbiAqIFJ1biB0aGUgcGFyc2VyIHN0YXRlIG1hY2hpbmUgb24gYSBsaXN0IG9mIHNjYW5uZWQgc3RyaW5nLWJhc2VkIHRva2VucyB0b1xuICogY3JlYXRlIGEgbGlzdCBvZiBtdWx0aSB0b2tlbnMsIGVhY2ggb2Ygd2hpY2ggcmVwcmVzZW50cyBhIFVSTCwgZW1haWwgYWRkcmVzcyxcbiAqIHBsYWluIHRleHQsIGV0Yy5cbiAqXG4gKiBAcGFyYW0ge1N0YXRlPE11bHRpVG9rZW4+fSBzdGFydCBwYXJzZXIgc3RhcnQgc3RhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBpbnB1dCB0aGUgb3JpZ2luYWwgaW5wdXQgdXNlZCB0byBnZW5lcmF0ZSB0aGUgZ2l2ZW4gdG9rZW5zXG4gKiBAcGFyYW0ge1Rva2VuW119IHRva2VucyBsaXN0IG9mIHNjYW5uZWQgdG9rZW5zXG4gKiBAcmV0dXJucyB7TXVsdGlUb2tlbltdfVxuICovXG5mdW5jdGlvbiBydW4oc3RhcnQsIGlucHV0LCB0b2tlbnMpIHtcbiAgbGV0IGxlbiA9IHRva2Vucy5sZW5ndGg7XG4gIGxldCBjdXJzb3IgPSAwO1xuICBsZXQgbXVsdGlzID0gW107XG4gIGxldCB0ZXh0VG9rZW5zID0gW107XG4gIHdoaWxlIChjdXJzb3IgPCBsZW4pIHtcbiAgICBsZXQgc3RhdGUgPSBzdGFydDtcbiAgICBsZXQgc2Vjb25kU3RhdGUgPSBudWxsO1xuICAgIGxldCBuZXh0U3RhdGUgPSBudWxsO1xuICAgIGxldCBtdWx0aUxlbmd0aCA9IDA7XG4gICAgbGV0IGxhdGVzdEFjY2VwdGluZyA9IG51bGw7XG4gICAgbGV0IHNpbmNlQWNjZXB0cyA9IC0xO1xuICAgIHdoaWxlIChjdXJzb3IgPCBsZW4gJiYgIShzZWNvbmRTdGF0ZSA9IHN0YXRlLmdvKHRva2Vuc1tjdXJzb3JdLnQpKSkge1xuICAgICAgLy8gU3RhcnRpbmcgdG9rZW5zIHdpdGggbm93aGVyZSB0byBqdW1wIHRvLlxuICAgICAgLy8gQ29uc2lkZXIgdGhlc2UgdG8gYmUganVzdCBwbGFpbiB0ZXh0XG4gICAgICB0ZXh0VG9rZW5zLnB1c2godG9rZW5zW2N1cnNvcisrXSk7XG4gICAgfVxuICAgIHdoaWxlIChjdXJzb3IgPCBsZW4gJiYgKG5leHRTdGF0ZSA9IHNlY29uZFN0YXRlIHx8IHN0YXRlLmdvKHRva2Vuc1tjdXJzb3JdLnQpKSkge1xuICAgICAgLy8gR2V0IHRoZSBuZXh0IHN0YXRlXG4gICAgICBzZWNvbmRTdGF0ZSA9IG51bGw7XG4gICAgICBzdGF0ZSA9IG5leHRTdGF0ZTtcblxuICAgICAgLy8gS2VlcCB0cmFjayBvZiB0aGUgbGF0ZXN0IGFjY2VwdGluZyBzdGF0ZVxuICAgICAgaWYgKHN0YXRlLmFjY2VwdHMoKSkge1xuICAgICAgICBzaW5jZUFjY2VwdHMgPSAwO1xuICAgICAgICBsYXRlc3RBY2NlcHRpbmcgPSBzdGF0ZTtcbiAgICAgIH0gZWxzZSBpZiAoc2luY2VBY2NlcHRzID49IDApIHtcbiAgICAgICAgc2luY2VBY2NlcHRzKys7XG4gICAgICB9XG4gICAgICBjdXJzb3IrKztcbiAgICAgIG11bHRpTGVuZ3RoKys7XG4gICAgfVxuICAgIGlmIChzaW5jZUFjY2VwdHMgPCAwKSB7XG4gICAgICAvLyBObyBhY2NlcHRpbmcgc3RhdGUgd2FzIGZvdW5kLCBwYXJ0IG9mIGEgcmVndWxhciB0ZXh0IHRva2VuIGFkZFxuICAgICAgLy8gdGhlIGZpcnN0IHRleHQgdG9rZW4gdG8gdGhlIHRleHQgdG9rZW5zIGFycmF5IGFuZCB0cnkgYWdhaW4gZnJvbVxuICAgICAgLy8gdGhlIG5leHRcbiAgICAgIGN1cnNvciAtPSBtdWx0aUxlbmd0aDtcbiAgICAgIGlmIChjdXJzb3IgPCBsZW4pIHtcbiAgICAgICAgdGV4dFRva2Vucy5wdXNoKHRva2Vuc1tjdXJzb3JdKTtcbiAgICAgICAgY3Vyc29yKys7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEFjY2VwdGluZyBzdGF0ZSFcbiAgICAgIC8vIEZpcnN0IGNsb3NlIG9mZiB0aGUgdGV4dFRva2VucyAoaWYgYXZhaWxhYmxlKVxuICAgICAgaWYgKHRleHRUb2tlbnMubGVuZ3RoID4gMCkge1xuICAgICAgICBtdWx0aXMucHVzaChpbml0TXVsdGlUb2tlbihUZXh0LCBpbnB1dCwgdGV4dFRva2VucykpO1xuICAgICAgICB0ZXh0VG9rZW5zID0gW107XG4gICAgICB9XG5cbiAgICAgIC8vIFJvbGwgYmFjayB0byB0aGUgbGF0ZXN0IGFjY2VwdGluZyBzdGF0ZVxuICAgICAgY3Vyc29yIC09IHNpbmNlQWNjZXB0cztcbiAgICAgIG11bHRpTGVuZ3RoIC09IHNpbmNlQWNjZXB0cztcblxuICAgICAgLy8gQ3JlYXRlIGEgbmV3IG11bHRpdG9rZW5cbiAgICAgIGNvbnN0IE11bHRpID0gbGF0ZXN0QWNjZXB0aW5nLnQ7XG4gICAgICBjb25zdCBzdWJ0b2tlbnMgPSB0b2tlbnMuc2xpY2UoY3Vyc29yIC0gbXVsdGlMZW5ndGgsIGN1cnNvcik7XG4gICAgICBtdWx0aXMucHVzaChpbml0TXVsdGlUb2tlbihNdWx0aSwgaW5wdXQsIHN1YnRva2VucykpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEZpbmFsbHkgY2xvc2Ugb2ZmIHRoZSB0ZXh0VG9rZW5zIChpZiBhdmFpbGFibGUpXG4gIGlmICh0ZXh0VG9rZW5zLmxlbmd0aCA+IDApIHtcbiAgICBtdWx0aXMucHVzaChpbml0TXVsdGlUb2tlbihUZXh0LCBpbnB1dCwgdGV4dFRva2VucykpO1xuICB9XG4gIHJldHVybiBtdWx0aXM7XG59XG5cbi8qKlxuICogVXRpbGl0eSBmdW5jdGlvbiBmb3IgaW5zdGFudGlhdGluZyBhIG5ldyBtdWx0aXRva2VuIHdpdGggYWxsIHRoZSByZWxldmFudFxuICogZmllbGRzIGR1cmluZyBwYXJzaW5nLlxuICogQHBhcmFtIHtuZXcgKHZhbHVlOiBzdHJpbmcsIHRva2VuczogVG9rZW5bXSkgPT4gTXVsdGlUb2tlbn0gTXVsdGkgY2xhc3MgdG8gaW5zdGFudGlhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBpbnB1dCBvcmlnaW5hbCBpbnB1dCBzdHJpbmdcbiAqIEBwYXJhbSB7VG9rZW5bXX0gdG9rZW5zIGNvbnNlY3V0aXZlIHRva2VucyBzY2FubmVkIGZyb20gaW5wdXQgc3RyaW5nXG4gKiBAcmV0dXJucyB7TXVsdGlUb2tlbn1cbiAqL1xuZnVuY3Rpb24gaW5pdE11bHRpVG9rZW4oTXVsdGksIGlucHV0LCB0b2tlbnMpIHtcbiAgY29uc3Qgc3RhcnRJZHggPSB0b2tlbnNbMF0ucztcbiAgY29uc3QgZW5kSWR4ID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXS5lO1xuICBjb25zdCB2YWx1ZSA9IGlucHV0LnNsaWNlKHN0YXJ0SWR4LCBlbmRJZHgpO1xuICByZXR1cm4gbmV3IE11bHRpKHZhbHVlLCB0b2tlbnMpO1xufVxuXG5jb25zdCB3YXJuID0gdHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIGNvbnNvbGUgJiYgY29uc29sZS53YXJuIHx8ICgoKSA9PiB7fSk7XG5jb25zdCB3YXJuQWR2aWNlID0gJ3VudGlsIG1hbnVhbCBjYWxsIG9mIGxpbmtpZnkuaW5pdCgpLiBSZWdpc3RlciBhbGwgc2NoZW1lcyBhbmQgcGx1Z2lucyBiZWZvcmUgaW52b2tpbmcgbGlua2lmeSB0aGUgZmlyc3QgdGltZS4nO1xuXG4vLyBTaWRlLWVmZmVjdCBpbml0aWFsaXphdGlvbiBzdGF0ZVxuY29uc3QgSU5JVCA9IHtcbiAgc2Nhbm5lcjogbnVsbCxcbiAgcGFyc2VyOiBudWxsLFxuICB0b2tlblF1ZXVlOiBbXSxcbiAgcGx1Z2luUXVldWU6IFtdLFxuICBjdXN0b21TY2hlbWVzOiBbXSxcbiAgaW5pdGlhbGl6ZWQ6IGZhbHNlXG59O1xuXG4vKipcbiAqIEB0eXBlZGVmIHt7XG4gKiBcdHN0YXJ0OiBTdGF0ZTxzdHJpbmc+LFxuICogXHR0b2tlbnM6IHsgZ3JvdXBzOiBDb2xsZWN0aW9uczxzdHJpbmc+IH0gJiB0eXBlb2YgdGtcbiAqIH19IFNjYW5uZXJJbml0XG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7e1xuICogXHRzdGFydDogU3RhdGU8TXVsdGlUb2tlbj4sXG4gKiBcdHRva2VuczogdHlwZW9mIG11bHRpXG4gKiB9fSBQYXJzZXJJbml0XG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7KGFyZzogeyBzY2FubmVyOiBTY2FubmVySW5pdCB9KSA9PiB2b2lkfSBUb2tlblBsdWdpblxuICovXG5cbi8qKlxuICogQHR5cGVkZWYgeyhhcmc6IHsgc2Nhbm5lcjogU2Nhbm5lckluaXQsIHBhcnNlcjogUGFyc2VySW5pdCB9KSA9PiB2b2lkfSBQbHVnaW5cbiAqL1xuXG4vKipcbiAqIERlLXJlZ2lzdGVyIGFsbCBwbHVnaW5zIGFuZCByZXNldCB0aGUgaW50ZXJuYWwgc3RhdGUtbWFjaGluZS4gVXNlZCBmb3JcbiAqIHRlc3Rpbmc7IG5vdCByZXF1aXJlZCBpbiBwcmFjdGljZS5cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIHJlc2V0KCkge1xuICBTdGF0ZS5ncm91cHMgPSB7fTtcbiAgSU5JVC5zY2FubmVyID0gbnVsbDtcbiAgSU5JVC5wYXJzZXIgPSBudWxsO1xuICBJTklULnRva2VuUXVldWUgPSBbXTtcbiAgSU5JVC5wbHVnaW5RdWV1ZSA9IFtdO1xuICBJTklULmN1c3RvbVNjaGVtZXMgPSBbXTtcbiAgSU5JVC5pbml0aWFsaXplZCA9IGZhbHNlO1xufVxuXG4vKipcbiAqIFJlZ2lzdGVyIGEgdG9rZW4gcGx1Z2luIHRvIGFsbG93IHRoZSBzY2FubmVyIHRvIHJlY29nbml6ZSBhZGRpdGlvbmFsIHRva2VuXG4gKiB0eXBlcyBiZWZvcmUgdGhlIHBhcnNlciBzdGF0ZSBtYWNoaW5lIGlzIGNvbnN0cnVjdGVkIGZyb20gdGhlIHJlc3VsdHMuXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBvZiBwbHVnaW4gdG8gcmVnaXN0ZXJcbiAqIEBwYXJhbSB7VG9rZW5QbHVnaW59IHBsdWdpbiBmdW5jdGlvbiB0aGF0IGFjY2VwdHMgdGhlIHNjYW5uZXIgc3RhdGUgbWFjaGluZVxuICogYW5kIGF2YWlsYWJsZSBzY2FubmVyIHRva2VucyBhbmQgY29sbGVjdGlvbnMgYW5kIGV4dGVuZHMgdGhlIHN0YXRlIG1hY2hpbmUgdG9cbiAqIHJlY29nbml6ZSBhZGRpdGlvbmFsIHRva2VucyBvciBncm91cHMuXG4gKi9cbmZ1bmN0aW9uIHJlZ2lzdGVyVG9rZW5QbHVnaW4obmFtZSwgcGx1Z2luKSB7XG4gIGlmICh0eXBlb2YgcGx1Z2luICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBsaW5raWZ5anM6IEludmFsaWQgdG9rZW4gcGx1Z2luICR7cGx1Z2lufSAoZXhwZWN0cyBmdW5jdGlvbilgKTtcbiAgfVxuICBmb3IgKGxldCBpID0gMDsgaSA8IElOSVQudG9rZW5RdWV1ZS5sZW5ndGg7IGkrKykge1xuICAgIGlmIChuYW1lID09PSBJTklULnRva2VuUXVldWVbaV1bMF0pIHtcbiAgICAgIHdhcm4oYGxpbmtpZnlqczogdG9rZW4gcGx1Z2luIFwiJHtuYW1lfVwiIGFscmVhZHkgcmVnaXN0ZXJlZCAtIHdpbGwgYmUgb3ZlcndyaXR0ZW5gKTtcbiAgICAgIElOSVQudG9rZW5RdWV1ZVtpXSA9IFtuYW1lLCBwbHVnaW5dO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuICBJTklULnRva2VuUXVldWUucHVzaChbbmFtZSwgcGx1Z2luXSk7XG4gIGlmIChJTklULmluaXRpYWxpemVkKSB7XG4gICAgd2FybihgbGlua2lmeWpzOiBhbHJlYWR5IGluaXRpYWxpemVkIC0gd2lsbCBub3QgcmVnaXN0ZXIgdG9rZW4gcGx1Z2luIFwiJHtuYW1lfVwiICR7d2FybkFkdmljZX1gKTtcbiAgfVxufVxuXG4vKipcbiAqIFJlZ2lzdGVyIGEgbGlua2lmeSBwbHVnaW5cbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIG9mIHBsdWdpbiB0byByZWdpc3RlclxuICogQHBhcmFtIHtQbHVnaW59IHBsdWdpbiBmdW5jdGlvbiB0aGF0IGFjY2VwdHMgdGhlIHBhcnNlciBzdGF0ZSBtYWNoaW5lIGFuZFxuICogZXh0ZW5kcyB0aGUgcGFyc2VyIHRvIHJlY29nbml6ZSBhZGRpdGlvbmFsIGxpbmsgdHlwZXNcbiAqL1xuZnVuY3Rpb24gcmVnaXN0ZXJQbHVnaW4obmFtZSwgcGx1Z2luKSB7XG4gIGlmICh0eXBlb2YgcGx1Z2luICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBsaW5raWZ5anM6IEludmFsaWQgcGx1Z2luICR7cGx1Z2lufSAoZXhwZWN0cyBmdW5jdGlvbilgKTtcbiAgfVxuICBmb3IgKGxldCBpID0gMDsgaSA8IElOSVQucGx1Z2luUXVldWUubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAobmFtZSA9PT0gSU5JVC5wbHVnaW5RdWV1ZVtpXVswXSkge1xuICAgICAgd2FybihgbGlua2lmeWpzOiBwbHVnaW4gXCIke25hbWV9XCIgYWxyZWFkeSByZWdpc3RlcmVkIC0gd2lsbCBiZSBvdmVyd3JpdHRlbmApO1xuICAgICAgSU5JVC5wbHVnaW5RdWV1ZVtpXSA9IFtuYW1lLCBwbHVnaW5dO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuICBJTklULnBsdWdpblF1ZXVlLnB1c2goW25hbWUsIHBsdWdpbl0pO1xuICBpZiAoSU5JVC5pbml0aWFsaXplZCkge1xuICAgIHdhcm4oYGxpbmtpZnlqczogYWxyZWFkeSBpbml0aWFsaXplZCAtIHdpbGwgbm90IHJlZ2lzdGVyIHBsdWdpbiBcIiR7bmFtZX1cIiAke3dhcm5BZHZpY2V9YCk7XG4gIH1cbn1cblxuLyoqXG4gKiBEZXRlY3QgVVJMcyB3aXRoIHRoZSBmb2xsb3dpbmcgYWRkaXRpb25hbCBwcm90b2NvbC4gQW55dGhpbmcgd2l0aCBmb3JtYXRcbiAqIFwicHJvdG9jb2w6Ly8uLi5cIiB3aWxsIGJlIGNvbnNpZGVyZWQgYSBsaW5rLiBJZiBgb3B0aW9uYWxTbGFzaFNsYXNoYCBpcyBzZXQgdG9cbiAqIGB0cnVlYCwgYW55dGhpbmcgd2l0aCBmb3JtYXQgXCJwcm90b2NvbDouLi5cIiB3aWxsIGJlIGNvbnNpZGVyZWQgYSBsaW5rLlxuICogQHBhcmFtIHtzdHJpbmd9IHByb3RvY29sXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25hbFNsYXNoU2xhc2hdXG4gKi9cbmZ1bmN0aW9uIHJlZ2lzdGVyQ3VzdG9tUHJvdG9jb2woc2NoZW1lLCBvcHRpb25hbFNsYXNoU2xhc2gpIHtcbiAgaWYgKG9wdGlvbmFsU2xhc2hTbGFzaCA9PT0gdm9pZCAwKSB7XG4gICAgb3B0aW9uYWxTbGFzaFNsYXNoID0gZmFsc2U7XG4gIH1cbiAgaWYgKElOSVQuaW5pdGlhbGl6ZWQpIHtcbiAgICB3YXJuKGBsaW5raWZ5anM6IGFscmVhZHkgaW5pdGlhbGl6ZWQgLSB3aWxsIG5vdCByZWdpc3RlciBjdXN0b20gc2NoZW1lIFwiJHtzY2hlbWV9XCIgJHt3YXJuQWR2aWNlfWApO1xuICB9XG4gIGlmICghL15bMC05YS16XSsoLVswLTlhLXpdKykqJC8udGVzdChzY2hlbWUpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdsaW5raWZ5anM6IGluY29ycmVjdCBzY2hlbWUgZm9ybWF0LlxcbiAxLiBNdXN0IG9ubHkgY29udGFpbiBkaWdpdHMsIGxvd2VyY2FzZSBBU0NJSSBsZXR0ZXJzIG9yIFwiLVwiXFxuIDIuIENhbm5vdCBzdGFydCBvciBlbmQgd2l0aCBcIi1cIlxcbiAzLiBcIi1cIiBjYW5ub3QgcmVwZWF0Jyk7XG4gIH1cbiAgSU5JVC5jdXN0b21TY2hlbWVzLnB1c2goW3NjaGVtZSwgb3B0aW9uYWxTbGFzaFNsYXNoXSk7XG59XG5cbi8qKlxuICogSW5pdGlhbGl6ZSB0aGUgbGlua2lmeSBzdGF0ZSBtYWNoaW5lLiBDYWxsZWQgYXV0b21hdGljYWxseSB0aGUgZmlyc3QgdGltZVxuICogbGlua2lmeSBpcyBjYWxsZWQgb24gYSBzdHJpbmcsIGJ1dCBtYXkgYmUgY2FsbGVkIG1hbnVhbGx5IGFzIHdlbGwuXG4gKi9cbmZ1bmN0aW9uIGluaXQoKSB7XG4gIC8vIEluaXRpYWxpemUgc2Nhbm5lciBzdGF0ZSBtYWNoaW5lIGFuZCBwbHVnaW5zXG4gIElOSVQuc2Nhbm5lciA9IGluaXQkMihJTklULmN1c3RvbVNjaGVtZXMpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IElOSVQudG9rZW5RdWV1ZS5sZW5ndGg7IGkrKykge1xuICAgIElOSVQudG9rZW5RdWV1ZVtpXVsxXSh7XG4gICAgICBzY2FubmVyOiBJTklULnNjYW5uZXJcbiAgICB9KTtcbiAgfVxuXG4gIC8vIEluaXRpYWxpemUgcGFyc2VyIHN0YXRlIG1hY2hpbmUgYW5kIHBsdWdpbnNcbiAgSU5JVC5wYXJzZXIgPSBpbml0JDEoSU5JVC5zY2FubmVyLnRva2Vucyk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgSU5JVC5wbHVnaW5RdWV1ZS5sZW5ndGg7IGkrKykge1xuICAgIElOSVQucGx1Z2luUXVldWVbaV1bMV0oe1xuICAgICAgc2Nhbm5lcjogSU5JVC5zY2FubmVyLFxuICAgICAgcGFyc2VyOiBJTklULnBhcnNlclxuICAgIH0pO1xuICB9XG4gIElOSVQuaW5pdGlhbGl6ZWQgPSB0cnVlO1xufVxuXG4vKipcbiAqIFBhcnNlIGEgc3RyaW5nIGludG8gdG9rZW5zIHRoYXQgcmVwcmVzZW50IGxpbmthYmxlIGFuZCBub24tbGlua2FibGUgc3ViLWNvbXBvbmVudHNcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge011bHRpVG9rZW5bXX0gdG9rZW5zXG4gKi9cbmZ1bmN0aW9uIHRva2VuaXplKHN0cikge1xuICBpZiAoIUlOSVQuaW5pdGlhbGl6ZWQpIHtcbiAgICBpbml0KCk7XG4gIH1cbiAgcmV0dXJuIHJ1bihJTklULnBhcnNlci5zdGFydCwgc3RyLCBydW4kMShJTklULnNjYW5uZXIuc3RhcnQsIHN0cikpO1xufVxuXG4vKipcbiAqIEZpbmQgYSBsaXN0IG9mIGxpbmthYmxlIGl0ZW1zIGluIHRoZSBnaXZlbiBzdHJpbmcuXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyIHN0cmluZyB0byBmaW5kIGxpbmtzIGluXG4gKiBAcGFyYW0ge3N0cmluZyB8IE9wdHN9IFt0eXBlXSBlaXRoZXIgZm9ybWF0dGluZyBvcHRpb25zIG9yIHNwZWNpZmljIHR5cGUgb2ZcbiAqIGxpbmtzIHRvIGZpbmQsIGUuZy4sICd1cmwnIG9yICdlbWFpbCdcbiAqIEBwYXJhbSB7T3B0c30gW29wdHNdIGZvcm1hdHRpbmcgb3B0aW9ucyBmb3IgZmluYWwgb3V0cHV0LiBDYW5ub3QgYmUgc3BlY2lmaWVkXG4gKiBpZiBvcHRzIGFscmVhZHkgcHJvdmlkZWQgaW4gYHR5cGVgIGFyZ3VtZW50XG4qL1xuZnVuY3Rpb24gZmluZChzdHIsIHR5cGUsIG9wdHMpIHtcbiAgaWYgKHR5cGUgPT09IHZvaWQgMCkge1xuICAgIHR5cGUgPSBudWxsO1xuICB9XG4gIGlmIChvcHRzID09PSB2b2lkIDApIHtcbiAgICBvcHRzID0gbnVsbDtcbiAgfVxuICBpZiAodHlwZSAmJiB0eXBlb2YgdHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICBpZiAob3B0cykge1xuICAgICAgdGhyb3cgRXJyb3IoYGxpbmtpZnlqczogSW52YWxpZCBsaW5rIHR5cGUgJHt0eXBlfTsgbXVzdCBiZSBhIHN0cmluZ2ApO1xuICAgIH1cbiAgICBvcHRzID0gdHlwZTtcbiAgICB0eXBlID0gbnVsbDtcbiAgfVxuICBjb25zdCBvcHRpb25zID0gbmV3IE9wdGlvbnMob3B0cyk7XG4gIGNvbnN0IHRva2VucyA9IHRva2VuaXplKHN0cik7XG4gIGNvbnN0IGZpbHRlcmVkID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgdG9rZW4gPSB0b2tlbnNbaV07XG4gICAgaWYgKHRva2VuLmlzTGluayAmJiAoIXR5cGUgfHwgdG9rZW4udCA9PT0gdHlwZSkpIHtcbiAgICAgIGZpbHRlcmVkLnB1c2godG9rZW4udG9Gb3JtYXR0ZWRPYmplY3Qob3B0aW9ucykpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmlsdGVyZWQ7XG59XG5cbi8qKlxuICogSXMgdGhlIGdpdmVuIHN0cmluZyB2YWxpZCBsaW5rYWJsZSB0ZXh0IG9mIHNvbWUgc29ydC4gTm90ZSB0aGF0IHRoaXMgZG9lcyBub3RcbiAqIHRyaW0gdGhlIHRleHQgZm9yIHlvdS5cbiAqXG4gKiBPcHRpb25hbGx5IHBhc3MgaW4gYSBzZWNvbmQgYHR5cGVgIHBhcmFtLCB3aGljaCBpcyB0aGUgdHlwZSBvZiBsaW5rIHRvIHRlc3RcbiAqIGZvci5cbiAqXG4gKiBGb3IgZXhhbXBsZSxcbiAqXG4gKiAgICAgbGlua2lmeS50ZXN0KHN0ciwgJ2VtYWlsJyk7XG4gKlxuICogUmV0dXJucyBgdHJ1ZWAgaWYgc3RyIGlzIGEgdmFsaWQgZW1haWwuXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyIHN0cmluZyB0byB0ZXN0IGZvciBsaW5rc1xuICogQHBhcmFtIHtzdHJpbmd9IFt0eXBlXSBvcHRpb25hbCBzcGVjaWZpYyBsaW5rIHR5cGUgdG8gbG9vayBmb3JcbiAqIEByZXR1cm5zIGJvb2xlYW4gdHJ1ZS9mYWxzZVxuICovXG5mdW5jdGlvbiB0ZXN0KHN0ciwgdHlwZSkge1xuICBpZiAodHlwZSA9PT0gdm9pZCAwKSB7XG4gICAgdHlwZSA9IG51bGw7XG4gIH1cbiAgY29uc3QgdG9rZW5zID0gdG9rZW5pemUoc3RyKTtcbiAgcmV0dXJuIHRva2Vucy5sZW5ndGggPT09IDEgJiYgdG9rZW5zWzBdLmlzTGluayAmJiAoIXR5cGUgfHwgdG9rZW5zWzBdLnQgPT09IHR5cGUpO1xufVxuXG5leHBvcnQgeyBNdWx0aVRva2VuLCBPcHRpb25zLCBTdGF0ZSwgY3JlYXRlVG9rZW5DbGFzcywgZmluZCwgaW5pdCwgbXVsdGksIG9wdGlvbnMsIHJlZ2V4cCwgcmVnaXN0ZXJDdXN0b21Qcm90b2NvbCwgcmVnaXN0ZXJQbHVnaW4sIHJlZ2lzdGVyVG9rZW5QbHVnaW4sIHJlc2V0LCBzdHJpbmdUb0FycmF5LCB0ZXN0LCB0b2tlbml6ZSB9O1xuIiwgImltcG9ydCBHT2JqZWN0IGZyb20gXCJnaTovL0dPYmplY3RcIjtcbmltcG9ydCBHdGsgZnJvbSBcImdpOi8vR3RrP3ZlcnNpb249NC4wXCI7XG5pbXBvcnQgQWR3IGZyb20gXCJnaTovL0Fkd1wiO1xuaW1wb3J0IEdkayBmcm9tIFwiZ2k6Ly9HZGs/dmVyc2lvbj00LjBcIjtcblxuZXhwb3J0IGNsYXNzIFRoZW1lU2VsZWN0b3IgZXh0ZW5kcyBHdGsuV2lkZ2V0IHtcbiAgc3RhdGljIHtcbiAgICBHT2JqZWN0LnJlZ2lzdGVyQ2xhc3MoXG4gICAgICB7XG4gICAgICAgIEdUeXBlTmFtZTogXCJUaGVtZVNlbGVjdG9yXCIsXG4gICAgICAgIFRlbXBsYXRlOiBcInJlc291cmNlOi8vL2NvbS92aXhhbGllbi9zdGlja3kvdWkvdGhlbWUtc2VsZWN0b3IudWlcIixcbiAgICAgICAgQ3NzTmFtZTogXCJ0aGVtZXNlbGVjdG9yXCIsXG4gICAgICAgIEludGVybmFsQ2hpbGRyZW46IFtcImZvbGxvd1wiXSxcbiAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgIHRoZW1lOiBHT2JqZWN0LlBhcmFtU3BlYy5zdHJpbmcoXG4gICAgICAgICAgICBcInRoZW1lXCIsIC8vIE5hbWVcbiAgICAgICAgICAgIFwiVGhlbWVcIiwgLy8gTmlja1xuICAgICAgICAgICAgXCJUaGVtZVwiLCAvLyBCbHVyYlxuICAgICAgICAgICAgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSxcbiAgICAgICAgICAgIC8vLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgICAgICAgICBudWxsLCAvLyBEZWZhdWx0IHZhbHVlXG4gICAgICAgICAgKSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICB0aGlzLFxuICAgICk7XG5cbiAgICB0aGlzLnNldF9sYXlvdXRfbWFuYWdlcl90eXBlKEd0ay5CaW5MYXlvdXQuJGd0eXBlKTtcbiAgfVxuXG4gIHRoZW1lOiBzdHJpbmc7XG5cbiAgZGVjbGFyZSBfZm9sbG93OiBHdGsuQ2hlY2tCdXR0b247XG5cbiAgc3R5bGVfbWFuYWdlcjogQWR3LlN0eWxlTWFuYWdlcjtcblxuICBjb25zdHJ1Y3RvcihwYXJhbXMgPSB7fSkge1xuICAgIHN1cGVyKHBhcmFtcyk7XG5cbiAgICB0aGlzLnN0eWxlX21hbmFnZXIgPSBBZHcuU3R5bGVNYW5hZ2VyLmdldF9kZWZhdWx0KCk7XG5cbiAgICB0aGlzLnN0eWxlX21hbmFnZXIuY29ubmVjdChcbiAgICAgIFwibm90aWZ5OjpzeXN0ZW0tc3VwcG9ydHMtY29sb3Itc2NoZW1lc1wiLFxuICAgICAgdGhpcy5fb25fbm90aWZ5X3N5c3RlbV9zdXBwb3J0c19jb2xvcl9zY2hlbWVzLmJpbmQodGhpcyksXG4gICAgKTtcbiAgICB0aGlzLl9vbl9ub3RpZnlfc3lzdGVtX3N1cHBvcnRzX2NvbG9yX3NjaGVtZXMoKTtcblxuICAgIGNvbnN0IGRhcmsgPSB0aGlzLnN0eWxlX21hbmFnZXIuZ2V0X2RhcmsoKTtcbiAgICB0aGlzLnRoZW1lID0gZGFyayA/IFwiZGFya1wiIDogXCJsaWdodFwiO1xuXG4gICAgdGhpcy5zdHlsZV9tYW5hZ2VyLmNvbm5lY3QoXCJub3RpZnk6OmRhcmtcIiwgdGhpcy5fb25fbm90aWZ5X2RhcmsuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fb25fbm90aWZ5X2RhcmsoKTtcblxuICAgIGNvbnN0IHByb3ZpZGVyID0gbmV3IEd0ay5Dc3NQcm92aWRlcigpO1xuICAgIHByb3ZpZGVyLmxvYWRfZnJvbV9yZXNvdXJjZShcIi9jb20vdml4YWxpZW4vc3RpY2t5L3RoZW1lLXNlbGVjdG9yLmNzc1wiKTtcbiAgICBHdGsuU3R5bGVDb250ZXh0LmFkZF9wcm92aWRlcl9mb3JfZGlzcGxheShcbiAgICAgIEdkay5EaXNwbGF5LmdldF9kZWZhdWx0KCkhLFxuICAgICAgcHJvdmlkZXIsXG4gICAgICBHdGsuU1RZTEVfUFJPVklERVJfUFJJT1JJVFlfQVBQTElDQVRJT04sXG4gICAgKTtcbiAgfVxuXG4gIF9vbl9ub3RpZnlfc3lzdGVtX3N1cHBvcnRzX2NvbG9yX3NjaGVtZXMoKSB7XG4gICAgdGhpcy5fZm9sbG93LnNldF92aXNpYmxlKFxuICAgICAgdGhpcy5zdHlsZV9tYW5hZ2VyLmdldF9zeXN0ZW1fc3VwcG9ydHNfY29sb3Jfc2NoZW1lcygpLFxuICAgICk7XG4gIH1cblxuICBfb25fbm90aWZ5X2RhcmsoKSB7XG4gICAgaWYgKHRoaXMuc3R5bGVfbWFuYWdlci5nZXRfZGFyaygpKSB0aGlzLmFkZF9jc3NfY2xhc3MoXCJkYXJrXCIpO1xuICAgIGVsc2UgdGhp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QUN2QztBQUFBLEVBOEVBLGFBQWE7QUFDWCxRQUFJLEtBQUssV0FBVyxZQUFZLElBQUksR0FBRztBQUNyQyxXQUFLLGtCQUFrQixLQUFLLFVBQVU7QUFBQSxJQUN4QyxPQUFPO0FBQ0wsVUFBSSxLQUFLLE9BQU87QUFDZCxhQUFLLGtCQUFrQixLQUFLLFdBQVc7QUFBQSxNQUN6QyxPQUFPO0FBQ0wsYUFBSyxrQkFBa0IsS0FBSyxTQUFTO0FBQUEsTUFDdkM7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBRUEsaUJBQWlCLE1BQWMsU0FBa0I7QUFDL0MsVUFBTSxPQUFPLEtBQUssTUFBTSxLQUFLLENBQUNDLFVBQVNBLE1BQUssS0FBSyxTQUFTLElBQUk7QUFFOUQsUUFBSSxDQUFDO0FBQU07QUFFWCxTQUFLLHFCQUFxQjtBQUFBLEVBQzVCO0FBQUEsRUFFQSxrQkFBa0IsT0FBbUI7QUFDbkMsU0FBSyxRQUFRLFVBQVUsVUFBVSxLQUFLLGNBQ3BDLFVBQVUsS0FBSztBQUVqQixTQUFLLE9BQU8sa0JBQWtCLEtBQUs7QUFBQSxFQUNyQztBQUNGO0FBaE1PLElBQU0sY0FBTjtBQUFBLENBQ0wsTUFBTztBQUNMLEVBQUFDLFNBQVE7QUFBQSxJQUNOO0FBQUEsTUFDRSxVQUFVO0FBQUEsTUFDVixXQUFXO0FBQUEsTUFDWCxrQkFBa0I7QUFBQSxRQUNoQjtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsTUFDQSxTQUFTO0FBQUEsUUFDUCxrQkFBa0I7QUFBQSxVQUNoQixhQUFhLENBQUNBLFNBQVEsV0FBVztBQUFBLFFBQ25DO0FBQUEsUUFDQSxTQUFTO0FBQUEsVUFDUCxhQUFhLENBQUNBLFNBQVEsV0FBVztBQUFBLFFBQ25DO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsRUFDRjtBQUNGOyIsCiAgIm5hbWVzIjogWyJHT2JqZWN0IiwgIkd0ayIsICJBZHciLCAiR09iamVjdCIsICJHdGsiLCAiR0xpYiIsICJTdHlsZSIsICJHT2JqZWN0IiwgIkFkdyIsICJuZXh0U3RhdGUiLCAic2NoZW1lIiwgIkFkdyIsICJHT2JqZWN0IiwgImNoYXJzIiwgIkd0ayIsICJHTGliIiwgIkdPYmplY3QiLCAiR09iamVjdCIsICJHdGsiLCAiQWR3IiwgIkFkdyIsICJHdGsiLCAiXyIsICJjYXJkIiwgIkdPYmplY3QiXQp9Cg==
