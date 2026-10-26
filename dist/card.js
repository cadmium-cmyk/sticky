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
export {
  StickyNoteCard
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2NhcmQudHMiLCAiLi4vc3JjL3V0aWwudHMiLCAiLi4vc3JjL3ZpZXcudHMiLCAiLi4vbm9kZV9tb2R1bGVzL2xpbmtpZnlqcy9kaXN0L2xpbmtpZnkuZXMuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qIE1JVCBMaWNlbnNlXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDIzIEFuZ2VsbyBWZXJsYWluLCBDaHJpcyBEYXZpc1xuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbiAqIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuICogU09GVFdBUkUuXG4gKlxuICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IE1JVFxuICovXG5cbmltcG9ydCBHT2JqZWN0IGZyb20gXCJnaTovL0dPYmplY3RcIjtcbmltcG9ydCBHdGsgZnJvbSBcImdpOi8vR3RrP3ZlcnNpb249NC4wXCI7XG5pbXBvcnQgR0xpYiBmcm9tIFwiZ2k6Ly9HTGliXCI7XG5cbmltcG9ydCB7IGNvbmZpcm1fZGVsZXRlLCBOb3RlLCBTdHlsZSB9IGZyb20gXCIuL3V0aWwuanNcIjtcbmltcG9ydCB7IFJlYWRvbmx5U3RpY2t5Tm90ZSB9IGZyb20gXCIuL3ZpZXcuanNcIjtcblxuZXhwb3J0IGNsYXNzIFN0aWNreU5vdGVDYXJkIGV4dGVuZHMgR3RrLkJveCB7XG4gIHN0YXRpYyB7XG4gICAgR09iamVjdC5yZWdpc3RlckNsYXNzKHtcbiAgICAgIEdUeXBlTmFtZTogXCJTdGlja3lOb3RlQ2FyZFwiLFxuICAgICAgVGVtcGxhdGU6IFwicmVzb3VyY2U6Ly8vY29tL3ZpeGFsaWVuL3N0aWNreS91aS9jYXJkLnVpXCIsXG4gICAgICBJbnRlcm5hbENoaWxkcmVuOiBbXG4gICAgICAgIFwibW9kaWZpZWRfbGFiZWxcIixcbiAgICAgICAgXCJ2aWV3X2ltYWdlXCIsXG4gICAgICAgIFwiZGVsZXRlX2J1dHRvblwiLFxuICAgICAgICBcInNjcm9sbGVkXCIsXG4gICAgICBdLFxuICAgICAgUHJvcGVydGllczoge1xuICAgICAgICB1dWlkOiBHT2JqZWN0LlBhcmFtU3BlYy5zdHJpbmcoXG4gICAgICAgICAgXCJ1dWlkXCIsXG4gICAgICAgICAgXCJVVUlEXCIsXG4gICAgICAgICAgXCJUaGUgVVVJRCBvZiB0aGUgbm90ZVwiLFxuICAgICAgICAgIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEQUJMRSxcbiAgICAgICAgICBcIlwiLFxuICAgICAgICApLFxuICAgICAgfSxcbiAgICAgIFNpZ25hbHM6IHtcbiAgICAgICAgZGVsZXRlZDoge30sXG4gICAgICB9LFxuICAgIH0sIHRoaXMpO1xuICB9XG5cbiAgZGVjbGFyZSBfc2Nyb2xsZWQ6IEd0ay5TY3JvbGxlZFdpbmRvdztcbiAgZGVjbGFyZSBfbW9kaWZpZWRfbGFiZWw6IEd0ay5MYWJlbDtcbiAgZGVjbGFyZSBfdmlld19pbWFnZTogR3RrLkltYWdlO1xuICBkZWNsYXJlIF9kZWxldGVfYnV0dG9uOiBHdGsuQnV0dG9uO1xuXG4gIHByaXZhdGUgX25vdGU/OiBOb3RlO1xuICB2aWV3OiBSZWFkb25seVN0aWNreU5vdGU7XG5cbiAgc2V0IHNob3dfdmlzaWJsZV9pbWFnZSh2aXNpYmxlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fdmlld19pbWFnZS52aXNpYmxlID0gdmlzaWJsZTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB3aW5kb3c6IEd0ay5XaW5kb3csIG5vdGU/OiBOb3RlKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMudmlldyA9IG5ldyBSZWFkb25seVN0aWNreU5vdGUobm90ZSk7XG4gICAgdGhpcy52aWV3LmFkZF9jc3NfY2xhc3MoXCJjYXJkLXRleHQtdmlld1wiKTtcbiAgICB0aGlzLnZpZXcud3JhcF9tb2RlID0gR3RrLldyYXBNb2RlLldPUkRfQ0hBUjtcblxuICAgIHRoaXMuX3Njcm9sbGVkLnNldF9jaGlsZCh0aGlzLnZpZXcpO1xuICAgIHRoaXMuX2RlbGV0ZV9idXR0b24uY29ubmVjdChcImNsaWNrZWRcIiwgdGhpcy5kZWxldGUuYmluZCh0aGlzKSk7XG5cbiAgICBpZiAobm90ZSkgdGhpcy5fbm90ZSA9IHRoaXMubm90ZSA9IG5vdGU7XG4gIH1cblxuICBzZXQgbm90ZShub3RlOiBOb3RlKSB7XG4gICAgaWYgKG5vdGU/LnN0eWxlICE9PSB0aGlzLl9ub3RlPy5zdHlsZSkgdGhpcy5zZXRfc3R5bGUobm90ZS5zdHlsZSk7XG5cbiAgICB0aGlzLl9ub3RlID0gdGhpcy52aWV3Lm5vdGUgPSBub3RlO1xuXG4gICAgdGhpcy51cGRhdGVfbW9kaWZpZWRfbGFiZWwoKTtcbiAgfVxuXG4gIGdldCB1dWlkKCkge1xuICAgIHJldHVybiB0aGlzLl9ub3RlPy51dWlkO1xuICB9XG5cbiAgdXBkYXRlX21vZGlmaWVkX2xhYmVsKCkge1xuICAgIGNvbnN0IG1vZGlmaWVkID0gdGhpcy5fbm90ZT8ubW9kaWZpZWQ/LnRvX2xvY2FsKCk7XG5cbiAgICBpZiAoIW1vZGlmaWVkKSByZXR1cm47XG5cbiAgICAvLyBpZiBkYXRlIGlzIHRvZGF5LCBzaG93IHRpbWVcbiAgICAvLyBvdGhlcndpc2UsIHNob3cgZGF0ZVxuICAgIGNvbnN0IGZvcm1hdCA9XG4gICAgICBHTGliLkRhdGVUaW1lLm5ld19ub3dfbG9jYWwoKS5mb3JtYXQoXCIlRlwiKSA9PT0gbW9kaWZpZWQuZm9ybWF0KFwiJUZcIilcbiAgICAgICAgPyBcIiVSXCJcbiAgICAgICAgOiBcIiVGXCI7XG5cbiAgICB0aGlzLl9tb2RpZmllZF9sYWJlbC5sYWJlbCA9IG1vZGlmaWVkLmZvcm1hdChmb3JtYXQpITtcbiAgfVxuXG4gIHNldF9zdHlsZShzdHlsZTogU3R5bGUpIHtcbiAgICBmb3IgKGNvbnN0IHMgb2YgdGhpcy5nZXRfY3NzX2NsYXNzZXMoKSkge1xuICAgICAgaWYgKHMuc3RhcnRzV2l0aChcInN0eWxlLVwiKSAmJiBzICE9PSBgc3R5bGUtc3BlY2lmaXR5YCkge1xuICAgICAgICB0aGlzLnJlbW92ZV9jc3NfY2xhc3Mocyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5hZGRfY3NzX2NsYXNzKGBzdHlsZS0ke1N0eWxlW3N0eWxlXX1gKTtcbiAgfVxuXG4gIGRlbGV0ZSgpIHtcbiAgICBpZiAoIXRoaXMuX25vdGUpIHJldHVybjtcbiAgICBjb25maXJtX2RlbGV0ZSh0aGlzLndpbmRvdywgKCkgPT4ge1xuICAgICAgdGhpcy5lbWl0KFwiZGVsZXRlZFwiKTtcbiAgICB9KTtcbiAgfVxufVxuIiwgIi8qIE1JVCBMaWNlbnNlXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDIzIEFuZ2VsbyBWZXJsYWluLCBDaHJpcyBEYXZpc1xuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbiAqIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuICogU09GVFdBUkUuXG4gKlxuICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IE1JVFxuICovXG5cbmltcG9ydCBBZHcgZnJvbSBcImdpOi8vQWR3XCI7XG5pbXBvcnQgR2lvIGZyb20gXCJnaTovL0dpb1wiO1xuaW1wb3J0IEdMaWIgZnJvbSBcImdpOi8vR0xpYlwiO1xuaW1wb3J0IEdPYmplY3QgZnJvbSBcImdpOi8vR09iamVjdFwiO1xuaW1wb3J0IEd0ayBmcm9tIFwiZ2k6Ly9HdGs/dmVyc2lvbj00LjBcIjtcblxuR2lvLl9wcm9taXNpZnkoXG4gIEdpby5GaWxlLnByb3RvdHlwZSxcbiAgXCJsb2FkX2NvbnRlbnRzX2FzeW5jXCIsXG4gIFwibG9hZF9jb250ZW50c19maW5pc2hcIixcbik7XG5cbkdpby5fcHJvbWlzaWZ5KFxuICBHaW8uRmlsZS5wcm90b3R5cGUsXG4gIFwicmVwbGFjZV9jb250ZW50c19hc3luY1wiLFxuICBcInJlcGxhY2VfY29udGVudHNfZmluaXNoXCIsXG4pO1xuXG5leHBvcnQgaW50ZXJmYWNlIElUYWcge1xuICBuYW1lOiBzdHJpbmc7XG4gIHN0YXJ0OiBudW1iZXI7XG4gIGVuZDogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElOb3RlIHtcbiAgdjogMTtcbiAgdXVpZDogc3RyaW5nO1xuICBjb250ZW50OiBzdHJpbmc7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIHN0eWxlOiBTdHlsZTtcbiAgdGFnczogSVRhZ1tdO1xuICBtb2RpZmllZDogRGF0ZTtcbiAgd2lkdGg6IG51bWJlcjtcbiAgaGVpZ2h0OiBudW1iZXI7XG4gIG9wZW46IGJvb2xlYW47XG59XG5cbmV4cG9ydCBlbnVtIFN0eWxlIHtcbiAgXCJ5ZWxsb3dcIiA9IDEsXG4gIFwicGlua1wiLFxuICBcImdyZWVuXCIsXG4gIFwicHVycGxlXCIsXG4gIFwiYmx1ZVwiLFxuICBcImdyYXlcIixcbiAgXCJjaGFyY29hbFwiLFxuICBcIndpbmRvd1wiLFxufVxuXG5leHBvcnQgY29uc3QgU3R5bGVOYW1lcyA9IG5ldyBNYXAoW1xuICBbU3R5bGUueWVsbG93LCBfKFwiWWVsbG93XCIpXSxcbiAgW1N0eWxlLnBpbmssIF8oXCJQaW5rXCIpXSxcbiAgW1N0eWxlLmdyZWVuLCBfKFwiR3JlZW5cIildLFxuICBbU3R5bGUucHVycGxlLCBfKFwiUHVycGxlXCIpXSxcbiAgW1N0eWxlLmJsdWUsIF8oXCJCbHVlXCIpXSxcbiAgW1N0eWxlLmdyYXksIF8oXCJHcmF5XCIpXSxcbiAgW1N0eWxlLmNoYXJjb2FsLCBfKFwiQ2hhcmNvYWxcIildLFxuICBbU3R5bGUud2luZG93LCBfKFwiV2luZG93XCIpXSxcbl0pO1xuXG5leHBvcnQgY29uc3Qgc3R5bGVzID0gT2JqZWN0LnZhbHVlcyhTdHlsZSkuZmlsdGVyKFxuICAoc3R5bGUpID0+IHR5cGVvZiBzdHlsZSA9PT0gXCJudW1iZXJcIixcbikgYXMgU3R5bGVbXTtcblxuZXhwb3J0IGNvbnN0IHNldHRpbmdzID0gbmV3IEdpby5TZXR0aW5ncyh7IHNjaGVtYV9pZDogXCJjb20udml4YWxpZW4uc3RpY2t5XCIgfSk7XG5cbmNvbnN0IGdldF9zZXR0aW5ncyA9ICgpID0+ICh7XG4gIERFRkFVTFRfU1RZTEU6IHNldHRpbmdzLmdldF9lbnVtKFwiZGVmYXVsdC1zdHlsZVwiKSBhcyBTdHlsZSxcbiAgREVGQVVMVF9XSURUSDogc2V0dGluZ3MuZ2V0X2ludChcImRlZmF1bHQtd2lkdGhcIiksXG4gIERFRkFVTFRfSEVJR0hUOiBzZXR0aW5ncy5nZXRfaW50KFwiZGVmYXVsdC1oZWlnaHRcIiksXG4gIENPTkZJUk1fREVMRVRFOiBzZXR0aW5ncy5nZXRfYm9vbGVhbihcImNvbmZpcm0tZGVsZXRlXCIpLFxufSk7XG5cbmV4cG9ydCBsZXQgU0VUVElOR1MgPSBnZXRfc2V0dGluZ3MoKTtcblxuc2V0dGluZ3MuY29ubmVjdChcImNoYW5nZWRcIiwgKCkgPT4ge1xuICBTRVRUSU5HUyA9IGdldF9zZXR0aW5ncygpO1xufSk7XG5cbmV4cG9ydCBjbGFzcyBUYWcgZXh0ZW5kcyBHT2JqZWN0Lk9iamVjdCB7XG4gIHN0YXRpYyAkZ3R5cGU6IEdPYmplY3QuR1R5cGU8VGFnPjtcblxuICBuYW1lOiBzdHJpbmc7XG4gIHN0YXJ0OiBudW1iZXI7XG4gIGVuZDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgc3RhcnQ6IG51bWJlciA9IDAsIGVuZDogbnVtYmVyID0gMCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLnN0YXJ0ID0gc3RhcnQ7XG4gICAgdGhpcy5lbmQgPSBlbmQ7XG4gIH1cblxuICBzdGF0aWMge1xuICAgIEdPYmplY3QucmVnaXN0ZXJDbGFzcyh7XG4gICAgICBHVHlwZU5hbWU6IFwiVGFnT2JqZWN0XCIsXG4gICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICBuYW1lOiBHT2JqZWN0LlBhcmFtU3BlYy5zdHJpbmcoXCJuYW1lXCIsIFwiTmFtZVwiLCBcIlRoZSBuYW1lIG9mIHRoZSB0YWdcIiwgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSwgXCJcIiksXG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICBzdGFydDogR09iamVjdC5QYXJhbVNwZWMuaW50KFwic3RhcnRcIiwgXCJTdGFydFwiLCBcIlN0YXJ0aW5nIHBvc2l0aW9uIG9mIHRoZSB0YWdcIiwgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSwgMCwgMTAwLCAwKSxcbiAgICAgICAgLy8gZGVuby1mbXQtaWdub3JlXG4gICAgICAgIGVuZDogR09iamVjdC5QYXJhbVNwZWMuaW50KFwiZW5kXCIsIFwiRW5kXCIsIFwiRW5kaW5nIHBvc2l0aW9uIG9mIHRoZSB0YWdcIiwgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSwgMCwgMTAwLCAwKSxcbiAgICAgIH0sXG4gICAgfSwgdGhpcyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIE5vdGUgZXh0ZW5kcyBHT2JqZWN0Lk9iamVjdCB7XG4gIHByaXZhdGUgc3RhdGljIHRhZ19saXN0X3BzcGVjID0gR09iamVjdC5wYXJhbV9zcGVjX29iamVjdChcbiAgICBcInRhZ19saXN0XCIsXG4gICAgXCJUYWdzXCIsXG4gICAgXCJUYWdzIG9mIHRoZSBub3RlXCIsXG4gICAgR2lvLkxpc3RTdG9yZS4kZ3R5cGUsXG4gICAgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSxcbiAgKTtcblxuICBzdGF0aWMgJGd0eXBlOiBHT2JqZWN0LkdUeXBlPE5vdGU+O1xuXG4gIHY6IDE7XG4gIHV1aWQ6IHN0cmluZztcbiAgY29udGVudDogc3RyaW5nO1xuICB0aXRsZTogc3RyaW5nO1xuICBzdHlsZTogU3R5bGU7XG4gIHRhZ19saXN0OiBHaW8uTGlzdFN0b3JlPFRhZz47XG4gIG1vZGlmaWVkOiBHTGliLkRhdGVUaW1lO1xuICB3aWR0aDogbnVtYmVyO1xuICBoZWlnaHQ6IG51bWJlcjtcbiAgb3BlbjogYm9vbGVhbjtcblxuICBnZXQgdGFncygpIHtcbiAgICBjb25zdCBpdGVtcyA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnRhZ19saXN0LmdldF9uX2l0ZW1zKCk7IGkrKykge1xuICAgICAgY29uc3QgdGFnID0gdGhpcy50YWdfbGlzdC5nZXRfaXRlbShpKSE7XG4gICAgICBpdGVtcy5wdXNoKHtcbiAgICAgICAgbmFtZTogdGFnLm5hbWUsXG4gICAgICAgIHN0YXJ0OiB0YWcuc3RhcnQsXG4gICAgICAgIGVuZDogdGFnLmVuZCxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBpdGVtcztcbiAgfVxuXG4gIHNldCB0YWdzKHRhZ3M6IElOb3RlW1widGFnc1wiXSkge1xuICAgIHRoaXMudGFnX2xpc3QucmVtb3ZlX2FsbCgpO1xuXG4gICAgZm9yIChjb25zdCB0YWcgb2YgdGFncykge1xuICAgICAgY29uc3QgdGFnX29iamVjdCA9IG5ldyBUYWcodGFnLm5hbWUsIHRhZy5zdGFydCwgdGFnLmVuZCk7XG4gICAgICB0aGlzLnRhZ19saXN0LmFwcGVuZCh0YWdfb2JqZWN0KTtcbiAgICB9XG5cbiAgICB0aGlzLmVtaXQoXCJub3RpZnk6OnRhZ19saXN0XCIsIE5vdGUudGFnX2xpc3RfcHNwZWMpO1xuICB9XG5cbiAgZ2V0IG1vZGlmaWVkX2RhdGUoKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKHRoaXMubW9kaWZpZWQudG9fdW5peCgpICogMTAwMCk7XG4gIH1cblxuICAvLyBhbnl0aGluZyB0aGUgY29uc3RydWN0b3Igb2YgZGF0ZSBhY2NlcHRzXG4gIHNldCBtb2RpZmllZF9kYXRlKGRhdGU6IERhdGUpIHtcbiAgICB0aGlzLm1vZGlmaWVkID0gR0xpYi5EYXRlVGltZS5uZXdfZnJvbV9pc284NjAxKFxuICAgICAgbmV3IERhdGUoZGF0ZSkudG9JU09TdHJpbmcoKSxcbiAgICAgIG51bGwsXG4gICAgKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKG5vdGU6IElOb3RlKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnYgPSBub3RlLnY7XG4gICAgdGhpcy51dWlkID0gbm90ZS51dWlkO1xuICAgIHRoaXMuY29udGVudCA9IG5vdGUuY29udGVudDtcbiAgICB0aGlzLnRpdGxlID0gbm90ZS50aXRsZTtcbiAgICB0aGlzLnN0eWxlID0gbm90ZS5zdHlsZTtcbiAgICB0aGlzLnRhZ19saXN0ID0gR2lvLkxpc3RTdG9yZS5uZXcoVGFnLiRndHlwZSkgYXMgR2lvLkxpc3RTdG9yZTxUYWc+O1xuICAgIHRoaXMudGFncyA9IG5vdGUudGFncztcbiAgICB0aGlzLm1vZGlmaWVkID0gR0xpYi5EYXRlVGltZS5uZXdfZnJvbV9pc284NjAxKFxuICAgICAgbmV3IERhdGUobm90ZS5tb2RpZmllZCkudG9JU09TdHJpbmcoKSxcbiAgICAgIG51bGwsXG4gICAgKTtcbiAgICB0aGlzLndpZHRoID0gbm90ZS53aWR0aDtcbiAgICB0aGlzLmhlaWdodCA9IG5vdGUuaGVpZ2h0O1xuICAgIHRoaXMub3BlbiA9IG5vdGUub3BlbiA/PyBmYWxzZTtcblxuICAgIHRoaXMuYmluZF9wcm9wZXJ0eV9mdWxsKFxuICAgICAgXCJjb250ZW50XCIsXG4gICAgICB0aGlzLFxuICAgICAgXCJ0aXRsZVwiLFxuICAgICAgR09iamVjdC5CaW5kaW5nRmxhZ3MuU1lOQ19DUkVBVEUsXG4gICAgICAoXywgY29udGVudCkgPT4ge1xuICAgICAgICBpZiAoIWNvbnRlbnQpIHJldHVybiBbdHJ1ZSwgXCJcIl07XG4gICAgICAgIGxldCB0aXRsZSA9IGNvbnRlbnQuc3BsaXQoXCJcXG5cIilbMF0uc2xpY2UoMCwgMjApO1xuICAgICAgICBpZiAodGl0bGUubGVuZ3RoICE9IGNvbnRlbnQubGVuZ3RoKSB0aXRsZSArPSBcIlx1MjAyNlwiO1xuICAgICAgICByZXR1cm4gW3RydWUsIHRpdGxlXTtcbiAgICAgIH0sXG4gICAgICBudWxsXG4gICAgKTtcblxuXG4gIH1cblxuICBzdGF0aWMgZ2VuZXJhdGUoKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKHtcbiAgICAgIHY6IDEsXG4gICAgICB1dWlkOiBHTGliLnV1aWRfc3RyaW5nX3JhbmRvbSgpLFxuICAgICAgY29udGVudDogXCJcIixcbiAgICAgIHRpdGxlOiBcIlwiLFxuICAgICAgc3R5bGU6IFNFVFRJTkdTLkRFRkFVTFRfU1RZTEUsXG4gICAgICB0YWdzOiBbXSxcbiAgICAgIG1vZGlmaWVkOiBuZXcgRGF0ZSgpLFxuICAgICAgd2lkdGg6IDMwMCxcbiAgICAgIGhlaWdodDogMzAwLFxuICAgICAgb3BlbjogZmFsc2UsXG4gICAgfSk7XG4gIH1cblxuICBjb3B5KCkge1xuICAgIHJldHVybiBuZXcgTm90ZSh7XG4gICAgICB2OiB0aGlzLnYsXG4gICAgICB1dWlkOiB0aGlzLnV1aWQsXG4gICAgICBjb250ZW50OiB0aGlzLmNvbnRlbnQsXG4gICAgICB0aXRsZTogdGhpcy50aXRsZSxcbiAgICAgIHN0eWxlOiB0aGlzLnN0eWxlLFxuICAgICAgdGFnczogdGhpcy50YWdzLm1hcCgodGFnKSA9PiAoe1xuICAgICAgICBuYW1lOiB0YWcubmFtZSxcbiAgICAgICAgc3RhcnQ6IHRhZy5zdGFydCxcbiAgICAgICAgZW5kOiB0YWcuZW5kLFxuICAgICAgfSkpLFxuICAgICAgbW9kaWZpZWQ6IG5ldyBEYXRlKHRoaXMubW9kaWZpZWQudG9fdW5peCgpICogMTAwMCksXG4gICAgICB3aWR0aDogdGhpcy53aWR0aCxcbiAgICAgIGhlaWdodDogdGhpcy5oZWlnaHQsXG4gICAgICBvcGVuOiB0aGlzLm9wZW4sXG4gICAgfSk7XG4gIH1cblxuICB0b0pTT04oKTogSU5vdGUge1xuICAgIHJldHVybiB7XG4gICAgICB2OiB0aGlzLnYsXG4gICAgICB1dWlkOiB0aGlzLnV1aWQsXG4gICAgICBjb250ZW50OiB0aGlzLmNvbnRlbnQsXG4gICAgICB0aXRsZTogdGhpcy50aXRsZSxcbiAgICAgIHN0eWxlOiB0aGlzLnN0eWxlLFxuICAgICAgdGFnczogdGhpcy50YWdzLFxuICAgICAgbW9kaWZpZWQ6IHRoaXMubW9kaWZpZWRfZGF0ZSxcbiAgICAgIHdpZHRoOiB0aGlzLndpZHRoLFxuICAgICAgaGVpZ2h0OiB0aGlzLmhlaWdodCxcbiAgICAgIG9wZW46IHRoaXMub3BlbixcbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIHtcbiAgICBHT2JqZWN0LnJlZ2lzdGVyQ2xhc3Moe1xuICAgICAgR1R5cGVOYW1lOiBcIk5vdGVPYmplY3RcIixcbiAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgLy8gZGVuby1mbXQtaWdub3JlXG4gICAgICAgIHY6IEdPYmplY3QuUGFyYW1TcGVjLmludChcInZcIiwgXCJWZXJzaW9uXCIsIFwiVmVyc2lvbiBvZiB0aGUgbm90ZVwiLCBHT2JqZWN0LlBhcmFtRmxhZ3MuUkVBRFdSSVRFLCAwLCAxMDAsIDApLFxuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgdXVpZDogR09iamVjdC5QYXJhbVNwZWMuc3RyaW5nKFwidXVpZFwiLCBcIlVVSURcIiwgXCJVVUlEIG9mIHRoZSBub3RlXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIFwiXCIpLFxuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgY29udGVudDogR09iamVjdC5QYXJhbVNwZWMuc3RyaW5nKFwiY29udGVudFwiLCBcIkNvbnRlbnRcIiwgXCJDb250ZW50IG9mIHRoZSBub3RlXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIFwiXCIpLFxuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgdGl0bGU6IEdPYmplY3QuUGFyYW1TcGVjLnN0cmluZyhcInRpdGxlXCIsIFwiVGl0bGVcIiwgXCJUaXRsZSBvZiB0aGUgbm90ZVwiLCBHT2JqZWN0LlBhcmFtRmxhZ3MuUkVBRFdSSVRFLCBcIlwiKSxcbiAgICAgICAgLy8gZGVuby1mbXQtaWdub3JlXG4gICAgICAgIHN0eWxlOiBHT2JqZWN0LlBhcmFtU3BlYy5pbnQoXCJzdHlsZVwiLCBcIlN0eWxlXCIsIFwiU3R5bGUgb2YgdGhlIG5vdGVcIiwgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSwgMCwgMTAwLCAwKSxcbiAgICAgICAgLy8gZGVuby1mbXQtaWdub3JlXG4gICAgICAgIHRhZ19saXN0OiB0aGlzLnRhZ19saXN0X3BzcGVjLFxuICAgICAgICAvLyAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgbW9kaWZpZWQ6IEdPYmplY3QuUGFyYW1TcGVjLmJveGVkKFwibW9kaWZpZWRcIiwgXCJNb2RpZmllZFwiLCBcIkRhdGUgdGhlIG5vdGUgd2FzIG1vZGlmaWVkXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIEdMaWIuRGF0ZVRpbWUpLFxuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgd2lkdGg6IEdPYmplY3QuUGFyYW1TcGVjLmludChcIndpZHRoXCIsIFwiV2lkdGhcIiwgXCJXaWR0aCBvZiB0aGUgbm90ZVwiLCBHT2JqZWN0LlBhcmFtRmxhZ3MuUkVBRFdSSVRFLCAwLCAxMDAsIDApLFxuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgaGVpZ2h0OiBHT2JqZWN0LlBhcmFtU3BlYy5pbnQoXCJoZWlnaHRcIiwgXCJIZWlnaHRcIiwgXCJIZWlnaHQgb2YgdGhlIG5vdGVcIiwgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSwgMCwgMTAwLCAwKSxcbiAgICAgICAgLy8gZGVuby1mbXQtaWdub3JlXG4gICAgICAgIG9wZW46IEdPYmplY3QuUGFyYW1TcGVjLmJvb2xlYW4oXCJvcGVuXCIsIFwiT3BlblwiLCBcIldoZXRoZXIgdGhlIG5vdGUgd2FzIG9wZW4gd2hlbiB0aGUgYXBwbGljYXRpb24gd2FzIGNsb3NlZFwiLCBHT2JqZWN0LlBhcmFtRmxhZ3MuUkVBRFdSSVRFLCBmYWxzZSksXG4gICAgICB9LFxuICAgIH0sIHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBjb25maXJtX2RlbGV0ZSA9ICh3aW5kb3c6IEd0ay5XaW5kb3csIGNiOiAoKSA9PiB2b2lkKSA9PiB7XG4gIGlmIChTRVRUSU5HUy5DT05GSVJNX0RFTEVURSkge1xuICAgIGNvbnN0IGRpYWxvZyA9IEFkdy5NZXNzYWdlRGlhbG9nLm5ldyhcbiAgICAgIHdpbmRvdyxcbiAgICAgIF8oXCJEZWxldGUgTm90ZT9cIiksXG4gICAgICBfKFwiVGhpcyBhY3Rpb24gY2Fubm90IGJlIHVuZG9uZS4gSWYgeW91IHdhbnQgdG8gaGlkZSB0aGUgbm90ZSwgeW91IGNhbiBjbG9zZSBpdCBpbnN0ZWFkLlwiKSxcbiAgICApO1xuICAgIGRpYWxvZy5hZGRfcmVzcG9uc2UoXCJjYW5jZWxcIiwgXyhcIkNhbmNlbFwiKSk7XG4gICAgZGlhbG9nLmFkZF9yZXNwb25zZShcImRlbGV0ZVwiLCBfKFwiRGVsZXRlXCIpKTtcbiAgICBkaWFsb2cuc2V0X3Jlc3BvbnNlX2FwcGVhcmFuY2UoXG4gICAgICBcImRlbGV0ZVwiLFxuICAgICAgQWR3LlJlc3BvbnNlQXBwZWFyYW5jZS5ERVNUUlVDVElWRSxcbiAgICApO1xuICAgIGRpYWxvZy5zZXRfZGVmYXVsdF9yZXNwb25zZShcImNhbmNlbFwiKTtcbiAgICBkaWFsb2cuc2V0X2Nsb3NlX3Jlc3BvbnNlKFwiY2FuY2VsXCIpO1xuICAgIGRpYWxvZy5jb25uZWN0KFwicmVzcG9uc2VcIiwgKF9kaWFsb2csIHJlc3BvbnNlKSA9PiB7XG4gICAgICBpZiAocmVzcG9uc2UgPT09IFwiZGVsZXRlXCIpIHtcbiAgICAgICAgY2IoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBkaWFsb2cucHJlc2VudCgpO1xuICB9IGVsc2Uge1xuICAgIGNiKCk7XG4gIH1cbn07XG4iLCAiLyogTUlUIExpY2Vuc2VcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMjMgQW5nZWxvIFZlcmxhaW4sIENocmlzIERhdmlzXG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICogY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gKiBTT0ZUV0FSRS5cbiAqXG4gKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogTUlUXG4gKi9cblxuaW1wb3J0IEdPYmplY3QgZnJvbSBcImdpOi8vR09iamVjdFwiO1xuaW1wb3J0IEd0ayBmcm9tIFwiZ2k6Ly9HdGs/dmVyc2lvbj00LjBcIjtcbmltcG9ydCBQYW5nbyBmcm9tIFwiZ2k6Ly9QYW5nb1wiO1xuaW1wb3J0IEFkdyBmcm9tIFwiZ2k6Ly9BZHc/dmVyc2lvbj0xXCI7XG5cbmltcG9ydCB7IGZpbmQgfSBmcm9tIFwibGlua2lmeWpzXCI7XG5cbmltcG9ydCB7IElUYWcsIE5vdGUgfSBmcm9tIFwiLi91dGlsLmpzXCI7XG5pbXBvcnQgeyBTdHlsZSB9IGZyb20gXCIuL3V0aWwuanNcIjtcblxuY2xhc3MgQWJzdHJhY3RTdGlja3lOb3RlIGV4dGVuZHMgR3RrLlRleHRWaWV3IHtcbiAgc3RhdGljIHtcbiAgICBHT2JqZWN0LnJlZ2lzdGVyQ2xhc3MoXG4gICAgICB7XG4gICAgICAgIEdUeXBlTmFtZTogXCJBYnN0cmFjdFN0aWNreU5vdGVcIixcbiAgICAgICAgU2lnbmFsczoge1xuICAgICAgICAgIFwidGFnLXRvZ2dsZVwiOiB7XG4gICAgICAgICAgICBwYXJhbV90eXBlczogW0dPYmplY3QuVFlQRV9TVFJJTkcsIEdPYmplY3QuVFlQRV9CT09MRUFOXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2VsZWN0aW9uLWNoYW5nZWRcIjoge30sXG4gICAgICAgICAgXCJsaW5rLXNlbGVjdGVkXCI6IHtcbiAgICAgICAgICAgIHBhcmFtX3R5cGVzOiBbR09iamVjdC5UWVBFX1NUUklOR10sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImxpbmstdW5zZWxlY3RlZFwiOiB7fSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICB0aGlzLFxuICAgICk7XG4gIH1cblxuICBib2xkX3RhZyA9IEd0ay5UZXh0VGFnLm5ldyhcImJvbGRcIik7XG4gIHVuZGVybGluZV90YWcgPSBHdGsuVGV4dFRhZy5uZXcoXCJ1bmRlcmxpbmVcIik7XG4gIGl0YWxpY190YWcgPSBHdGsuVGV4dFRhZy5uZXcoXCJpdGFsaWNcIik7XG4gIHN0cmlrZXRocm91Z2hfdGFnID0gR3RrLlRleHRUYWcubmV3KFwic3RyaWtldGhyb3VnaFwiKTtcbiAgbGlua190YWcgPSBHdGsuVGV4dFRhZy5uZXcoXCJsaW5rXCIpO1xuXG4gIGFjdGlvbnMgPSBbXG4gICAgW1wiYm9sZFwiLCB0aGlzLmJvbGRfdGFnXSxcbiAgICBbXCJ1bmRlcmxpbmVcIiwgdGhpcy51bmRlcmxpbmVfdGFnXSxcbiAgICBbXCJpdGFsaWNcIiwgdGhpcy5pdGFsaWNfdGFnXSxcbiAgICBbXCJzdHJpa2V0aHJvdWdoXCIsIHRoaXMuc3RyaWtldGhyb3VnaF90YWddLFxuICBdIGFzIFtzdHJpbmcsIEd0ay5UZXh0VGFnXVtdO1xuXG4gIF9ub3RlPzogTm90ZTtcblxuICBnZXQgbm90ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fbm90ZTtcbiAgfVxuXG4gIHNldCBub3RlKG5vdGU6IE5vdGUgfCB1bmRlZmluZWQpIHtcbiAgICBpZiAoIW5vdGUpIHJldHVybjtcblxuICAgIHRoaXMuX25vdGUgPSBub3RlO1xuICAgIHRoaXMuY2xlYXJfdGFncygpO1xuICAgIHRoaXMuYnVmZmVyLnRleHQgPSBub3RlLmNvbnRlbnQ7XG4gICAgdGhpcy5pbml0X3RhZ3Mobm90ZS50YWdzKTtcblxuICAgIHRoaXMudXBkYXRlX2xpbmtfdGFnX2NvbG9yKCk7XG4gICAgdGhpcy5yZW1vdmVfbGlzdGVuZXJzKCk7XG4gICAgdGhpcy5pbml0X2xpc3RlbmVycygpO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gbmV3IFNldDxudW1iZXI+KCk7XG5cbiAgaW5pdF9saXN0ZW5lcnMoKSB7XG4gICAgaWYgKCF0aGlzLm5vdGUpIHJldHVybjtcblxuICAgIHRoaXMubGlzdGVuZXJzLmFkZCh0aGlzLm5vdGUuY29ubmVjdChcIm5vdGlmeTo6c3R5bGVcIiwgKCkgPT4ge1xuICAgICAgdGhpcy51cGRhdGVfbGlua190YWdfY29sb3IoKTtcbiAgICB9KSk7XG4gIH1cblxuICByZW1vdmVfbGlzdGVuZXJzKCkge31cblxuICBzdHlsZV9tYW5hZ2VyOiBBZHcuU3R5bGVNYW5hZ2VyO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIG5vdGU/OiBOb3RlLFxuICApIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5zdHlsZV9tYW5hZ2VyID0gQWR3LlN0eWxlTWFuYWdlci5nZXRfZGVmYXVsdCgpO1xuXG4gICAgdGhpcy5yZWdpc3Rlcl90YWdzKCk7XG4gICAgaWYgKG5vdGUpIHRoaXMubm90ZSA9IG5vdGU7XG5cbiAgICB0aGlzLmJ1ZmZlci5jb25uZWN0KFwibWFyay1zZXRcIiwgKF9idWZmZXIsIF9sb2MsIG1hcmspID0+IHtcbiAgICAgIGlmICghdGhpcy5ub3RlKSByZXR1cm47XG5cbiAgICAgIGlmIChcbiAgICAgICAgbWFyay5uYW1lID09PSBcImluc2VydFwiIHx8IG1hcmsubmFtZSA9PT0gXCJzZWxlY3Rpb25fYm91bmRcIiB8fFxuICAgICAgICB0aGlzLmJ1ZmZlci5nZXRfaXRlcl9hdF9tYXJrKG1hcmspLmVxdWFsKFxuICAgICAgICAgIHRoaXMuYnVmZmVyLmdldF9pdGVyX2F0X21hcmsodGhpcy5idWZmZXIuZ2V0X2luc2VydCgpKSxcbiAgICAgICAgKVxuICAgICAgKSB7XG4gICAgICAgIHRoaXMuZW1pdChcInNlbGVjdGlvbi1jaGFuZ2VkXCIpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmNoZWNrX2xpbmtfc2VsZWN0ZWQoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGxhc3RfbGluazogbnVtYmVyIHwgZmFsc2UgPSBmYWxzZTtcbiAgbGFzdF9saW5rX2VuZDogbnVtYmVyID0gMDtcblxuICBjaGVja19saW5rX3NlbGVjdGVkKCkge1xuICAgIGNvbnN0IGhhc19saW5rID0gdGhpcy5oYXNfdGFnKHRoaXMubGlua190YWcpO1xuXG4gICAgaWYgKGhhc19saW5rKSB7XG4gICAgICBjb25zdCBzdGFydCA9IHRoaXMuYnVmZmVyLmdldF9pdGVyX2F0X29mZnNldChoYXNfbGluayk7XG5cbiAgICAgIGlmICghc3RhcnQuc3RhcnRzX3RhZyh0aGlzLmxpbmtfdGFnKSkge1xuICAgICAgICBzdGFydC5iYWNrd2FyZF90b190YWdfdG9nZ2xlKHRoaXMubGlua190YWcpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBlbmQgPSBzdGFydC5jb3B5KCk7XG4gICAgICBlbmQuZm9yd2FyZF90b190YWdfdG9nZ2xlKHRoaXMubGlua190YWcpO1xuXG4gICAgICBpZiAoXG4gICAgICAgIHN0YXJ0LmdldF9vZmZzZXQoKSAhPT0gdGhpcy5sYXN0X2xpbmsgfHxcbiAgICAgICAgZW5kLmdldF9vZmZzZXQoKSAhPT0gdGhpcy5sYXN0X2xpbmtfZW5kXG4gICAgICApIHtcbiAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMuYnVmZmVyLmdldF90ZXh0KHN0YXJ0LCBlbmQsIGZhbHNlKVxuICAgICAgICAgIC5yZXBsYWNlKC9cXHUyMDBCL2csIFwiXCIpO1xuXG4gICAgICAgIHRoaXMuZW1pdChcImxpbmstc2VsZWN0ZWRcIiwgdGV4dCk7XG5cbiAgICAgICAgdGhpcy5sYXN0X2xpbmsgPSBzdGFydC5nZXRfb2Zmc2V0KCk7XG4gICAgICAgIHRoaXMubGFzdF9saW5rX2VuZCA9IGVuZC5nZXRfb2Zmc2V0KCk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChoYXNfbGluayAhPT0gdGhpcy5sYXN0X2xpbmspIHtcbiAgICAgIHRoaXMuZW1pdChcImxpbmstdW5zZWxlY3RlZFwiKTtcbiAgICAgIHRoaXMubGFzdF9saW5rID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlX2xpbmtfdGFnX2NvbG9yKCkge1xuICAgIGlmICghdGhpcy5ub3RlKSByZXR1cm47XG4gICAgbGV0IGNvbG9yO1xuXG4gICAgaWYgKHRoaXMuc3R5bGVfbWFuYWdlci5kYXJrKSB7XG4gICAgICBjb25zdCBhY2NlbnRfY29sb3IgPSB0aGlzLmdldF9zdHlsZV9jb250ZXh0KCkubG9va3VwX2NvbG9yKFxuICAgICAgICBcImFjY2VudF9mZ19jb2xvclwiLFxuICAgICAgKTtcbiAgICAgIGlmIChhY2NlbnRfY29sb3JbMF0pIHtcbiAgICAgICAgY29sb3IgPSBhY2NlbnRfY29sb3JbMV0udG9fc3RyaW5nKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb2xvciA9IFwiIzAwMDBmZlwiO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBhY2NlbnRfY29sb3IgPSB0aGlzLmdldF9zdHlsZV9jb250ZXh0KCkubG9va3VwX2NvbG9yKFxuICAgICAgICBgbGlua19jb2xvcl8ke1N0eWxlW3RoaXMubm90ZS5zdHlsZV19YCxcbiAgICAgICk7XG4gICAgICBpZiAoYWNjZW50X2NvbG9yWzBdKSB7XG4gICAgICAgIGNvbG9yID0gYWNjZW50X2NvbG9yWzFdLnRvX3N0cmluZygpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29sb3IgPSBcIiMwMDAwZmZcIjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmxpbmtfdGFnLmZvcmVncm91bmQgPSBjb2xvcjtcbiAgfVxuXG4gIHByaXZhdGUgcmVnaXN0ZXJfdGFncygpIHtcbiAgICB0aGlzLmJvbGRfdGFnLndlaWdodCA9IFBhbmdvLldlaWdodC5CT0xEO1xuICAgIHRoaXMudW5kZXJsaW5lX3RhZy51bmRlcmxpbmUgPSBQYW5nby5VbmRlcmxpbmUuU0lOR0xFO1xuICAgIHRoaXMuaXRhbGljX3RhZy5zdHlsZSA9IFBhbmdvLlN0eWxlLklUQUxJQztcbiAgICB0aGlzLnN0cmlrZXRocm91Z2hfdGFnLnN0cmlrZXRocm91Z2ggPSB0cnVlO1xuXG4gICAgdGhpcy5saW5rX3RhZy51bmRlcmxpbmUgPSBQYW5nby5VbmRlcmxpbmUuU0lOR0xFO1xuXG4gICAgaWYgKHRoaXMuc3R5bGVfbWFuYWdlci5zeXN0ZW1fc3VwcG9ydHNfY29sb3Jfc2NoZW1lcykge1xuICAgICAgdGhpcy5zdHlsZV9tYW5hZ2VyLmNvbm5lY3QoXG4gICAgICAgIFwibm90aWZ5OjpkYXJrXCIsXG4gICAgICAgIHRoaXMudXBkYXRlX2xpbmtfdGFnX2NvbG9yLmJpbmQodGhpcyksXG4gICAgICApO1xuICAgIH1cblxuICAgIHRoaXMuYnVmZmVyLnRhZ190YWJsZS5hZGQodGhpcy5ib2xkX3RhZyk7XG4gICAgdGhpcy5idWZmZXIudGFnX3RhYmxlLmFkZCh0aGlzLnVuZGVybGluZV90YWcpO1xuICAgIHRoaXMuYnVmZmVyLnRhZ190YWJsZS5hZGQodGhpcy5pdGFsaWNfdGFnKTtcbiAgICB0aGlzLmJ1ZmZlci50YWdfdGFibGUuYWRkKHRoaXMuc3RyaWtldGhyb3VnaF90YWcpO1xuICAgIHRoaXMuYnVmZmVyLnRhZ190YWJsZS5hZGQodGhpcy5saW5rX3RhZyk7XG4gIH1cblxuICBpbml0X3RhZ3ModGFnczogTm90ZVtcInRhZ3NcIl0pIHtcbiAgICBmb3IgKGNvbnN0IHRhZyBvZiB0YWdzKSB7XG4gICAgICBjb25zdCBzdGFydCA9IHRoaXMuYnVmZmVyLmdldF9pdGVyX2F0X29mZnNldCh0YWcuc3RhcnQpO1xuICAgICAgY29uc3QgZW5kID0gdGhpcy5idWZmZXIuZ2V0X2l0ZXJfYXRfb2Zmc2V0KHRhZy5lbmQpO1xuICAgICAgdGhpcy5idWZmZXIuYXBwbHlfdGFnX2J5X25hbWUodGFnLm5hbWUsIHN0YXJ0LCBlbmQpO1xuICAgIH1cbiAgfVxuXG4gIGhhc190YWcodGFnOiBHdGsuVGV4dFRhZykge1xuICAgIGxldCBbc2VsZWN0aW9uLCBzdGFydCwgZW5kXSA9IHRoaXMuYnVmZmVyLmdldF9zZWxlY3Rpb25fYm91bmRzKCk7XG4gICAgaWYgKCFzZWxlY3Rpb24pIHtcbiAgICAgIHN0YXJ0ID0gdGhpcy5idWZmZXIuZ2V0X2l0ZXJfYXRfbWFyayhcbiAgICAgICAgdGhpcy5idWZmZXIuZ2V0X2luc2VydCgpLFxuICAgICAgKTtcbiAgICAgIGVuZCA9IHN0YXJ0LmNvcHkoKTtcbiAgICAgIGVuZC5mb3J3YXJkX2N1cnNvcl9wb3NpdGlvbigpO1xuICAgIH1cblxuICAgIGRvIHtcbiAgICAgIGlmIChzdGFydC5oYXNfdGFnKHRhZykgIT09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybiBzdGFydC5nZXRfb2Zmc2V0KCk7XG4gICAgICB9XG4gICAgICBzdGFydC5mb3J3YXJkX2NoYXIoKTtcbiAgICB9IHdoaWxlIChzdGFydC5jb21wYXJlKGVuZCkgPCAwKTtcblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGFwcGx5X3RhZyh0YWc6IEd0ay5UZXh0VGFnKSB7XG4gICAgbGV0IFtzZWxlY3Rpb24sIHN0YXJ0LCBlbmRdID0gdGhpcy5idWZmZXIuZ2V0X3NlbGVjdGlvbl9ib3VuZHMoKTtcbiAgICAvLyBpZiBubyBzZWxlY3Rpb24sIGFwcGx5IHRvIHRoZSBjdXJyZW50IHdvcmRcbiAgICBpZiAoIXNlbGVjdGlvbikge1xuICAgICAgLyoqXG4gICAgICAgKiBJZiB0aGUgdXNlciBoYXMgbm90IHNlbGVjdGVkIGFueXRoaW5nLCB3ZSBpbnNlcnQgemVyby13aWR0aCBzcGFjZXNcbiAgICAgICAqIGFyb3VuZCB0aGUgY3Vyc29yIGFuZCBtYXJrIHRoZW0gYXMgdGhlIHN0YXJ0IGFuZCBlbmQgb2YgdGhlIHNlbGVjdGlvbi5cbiAgICAgICAqL1xuICAgICAgY29uc3QgZ2V0X2N1cnNvcl9wb3NpdGlvbiA9ICgpID0+IHRoaXMuYnVmZmVyLmN1cnNvcl9wb3NpdGlvbjtcblxuICAgICAgdGhpcy5idWZmZXIuaW5zZXJ0X2F0X2N1cnNvcihcIlxcdTIwMEJcXHUyMDBCXFx1MjAwQlwiLCA5KTtcbiAgICAgIHN0YXJ0ID0gdGhpcy5idWZmZXIuZ2V0X2l0ZXJfYXRfb2Zmc2V0KGdldF9jdXJzb3JfcG9zaXRpb24oKSAtIDMpO1xuICAgICAgZW5kID0gdGhpcy5idWZmZXIuZ2V0X2l0ZXJfYXRfb2Zmc2V0KGdldF9jdXJzb3JfcG9zaXRpb24oKSAtIDEpO1xuICAgICAgY29uc3Qgc2VsZWMgPSB0aGlzLmJ1ZmZlci5nZXRfaXRlcl9hdF9vZmZzZXQoZ2V0X2N1cnNvcl9wb3NpdGlvbigpKTtcbiAgICAgIHNlbGVjLmJhY2t3YXJkX2NoYXJzKDIpO1xuICAgICAgdGhpcy5idWZmZXIucGxhY2VfY3Vyc29yKHNlbGVjKTtcbiAgICB9XG5cbiAgICBjb25zdCBoYXNfdGFnID0gdGhpcy5oYXNfdGFnKHRhZyk7XG5cbiAgICBpZiAodGhpcy5oYXNfdGFnKHRhZykgIT09IGZhbHNlKSB7XG4gICAgICB0aGlzLmJ1ZmZlci5yZW1vdmVfdGFnKHRhZywgc3RhcnQsIGVuZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYnVmZmVyLmFwcGx5X3RhZyh0YWcsIHN0YXJ0LCBlbmQpO1xuICAgIH1cblxuICAgIHRoaXMuZW1pdChcInRhZy10b2dnbGVcIiwgdGFnLm5hbWUsIGhhc190YWcgPT09IGZhbHNlKTtcbiAgfVxuXG4gIGNsZWFyX3RhZ3MoKSB7XG4gICAgY29uc3Qgc3RhcnQgPSB0aGlzLmJ1ZmZlci5nZXRfc3RhcnRfaXRlcigpO1xuICAgIGNvbnN0IGVuZCA9IHRoaXMuYnVmZmVyLmdldF9lbmRfaXRlcigpO1xuXG4gICAgZm9yIChjb25zdCBbbmFtZSwgdGFnXSBvZiB0aGlzLmFjdGlvbnMpIHtcbiAgICAgIHRoaXMuYnVmZmVyLnJlbW92ZV90YWcodGFnLCBzdGFydCwgZW5kKTtcbiAgICAgIHRoaXMuZW1pdChcInRhZy10b2dnbGVcIiwgbmFtZSwgZmFsc2UpO1xuICAgIH1cbiAgfVxuXG4gIGdldF90YWdzKCkge1xuICAgIGNvbnN0IHRhZ3M6IE5vdGVbXCJ0YWdzXCJdID0gW107XG5cbiAgICB0aGlzLmJ1ZmZlci5nZXRfdGFnX3RhYmxlKCkuZm9yZWFjaCgodGFnKSA9PiB7XG4gICAgICBjb25zdCBzdGFydCA9IHRoaXMuYnVmZmVyLmdldF9zdGFydF9pdGVyKCk7XG5cbiAgICAgIGRvIHtcbiAgICAgICAgaWYgKCFzdGFydC5zdGFydHNfdGFnKHRhZykpIGNvbnRpbnVlO1xuXG4gICAgICAgIGNvbnN0IGJlZ2luID0gc3RhcnQuY29weSgpO1xuICAgICAgICBzdGFydC5mb3J3YXJkX3RvX3RhZ190b2dnbGUodGFnKTtcblxuICAgICAgICB0YWdzLnB1c2goe1xuICAgICAgICAgIG5hbWU6IHRhZy5uYW1lLFxuICAgICAgICAgIHN0YXJ0OiBiZWdpbi5nZXRfb2Zmc2V0KCksXG4gICAgICAgICAgZW5kOiBzdGFydC5nZXRfb2Zmc2V0KCksXG4gICAgICAgIH0pO1xuICAgICAgfSB3aGlsZSAoc3RhcnQuZm9yd2FyZF90b190YWdfdG9nZ2xlKHRhZykpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRhZ3M7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlYWRvbmx5U3RpY2t5Tm90ZSBleHRlbmRzIEFic3RyYWN0U3RpY2t5Tm90ZSB7XG4gIHN0YXRpYyB7XG4gICAgR09iamVjdC5yZWdpc3RlckNsYXNzKFxuICAgICAge1xuICAgICAgICBHVHlwZU5hbWU6IFwiUmVhZG9ubHlTdGlja3lOb3RlXCIsXG4gICAgICB9LFxuICAgICAgdGhpcyxcbiAgICApO1xuICB9XG5cbiAgY29uc3RydWN0b3Iobm90ZT86IE5vdGUpIHtcbiAgICBzdXBlcihub3RlKTtcblxuICAgIHRoaXMubm90ZSA9IG5vdGU7XG4gICAgdGhpcy5lZGl0YWJsZSA9IGZhbHNlO1xuICAgIHRoaXMuY3Vyc29yX3Zpc2libGUgPSBmYWxzZTtcbiAgICB0aGlzLnNob3dfY29udGVudCgpO1xuICB9XG5cbiAgc2V0IG5vdGUobm90ZTogTm90ZSB8IHVuZGVmaW5lZCkge1xuICAgIHRoaXMuX25vdGUgPSBzdXBlci5ub3RlID0gbm90ZTtcblxuICAgIHRoaXMuc2hvd19jb250ZW50KCk7XG4gIH1cblxuICBnZXQgbm90ZSgpIHtcbiAgICByZXR1cm4gc3VwZXIubm90ZTtcbiAgfVxuXG4gIGNsaXBfY29udGVudChjb250ZW50OiBzdHJpbmcpIHtcbiAgICBjb25zdCBNQVhfTElORVMgPSA1O1xuICAgIGNvbnN0IE1BWF9DSEFSUyA9IDI0MDtcblxuICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoL1xccyskLywgXCJcIik7XG5cbiAgICBsZXQgY3V0ID0gY29udGVudC5zcGxpdChcIlxcblwiKS5zbGljZSgwLCBNQVhfTElORVMpLmpvaW4oXCJcXG5cIik7XG5cbiAgICBpZiAoY3V0Lmxlbmd0aCA+IE1BWF9DSEFSUykge1xuICAgICAgY3V0ID0gY3V0LnNsaWNlKDAsIE1BWF9DSEFSUyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGN1dC5sZW5ndGggPCBjb250ZW50Lmxlbmd0aCA/IGAke2N1dH1cdTIwMjZgIDogY3V0O1xuICB9XG5cbiAgc2hvd19jb250ZW50KCkge1xuICAgIGlmICghdGhpcy5ub3RlKSByZXR1cm47XG5cbiAgICBpZiAoIXRoaXMubm90ZS5jb250ZW50LnJlcGxhY2UoL1xccy9nLCBcIlwiKSkge1xuICAgICAgdGhpcy5idWZmZXIudGV4dCA9IFwiXCI7XG4gICAgICB0aGlzLmJ1ZmZlci5pbnNlcnRfbWFya3VwKFxuICAgICAgICB0aGlzLmJ1ZmZlci5nZXRfc3RhcnRfaXRlcigpLFxuICAgICAgICBgPGk+KCR7XyhcIkVtcHR5IE5vdGVcIil9KTwvaT5gLFxuICAgICAgICAtMSxcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYnVmZmVyLnRleHQgPSB0aGlzLmNsaXBfY29udGVudCh0aGlzLm5vdGUhLmNvbnRlbnQpO1xuICAgICAgdGhpcy5jbGVhcl90YWdzKCk7XG4gICAgICB0aGlzLmluaXRfdGFncyh0aGlzLm5vdGUhLnRhZ3MpO1xuICAgIH1cbiAgfVxuXG4gIGluaXRfbGlzdGVuZXJzKCkge1xuICAgIHN1cGVyLmluaXRfbGlzdGVuZXJzKCk7XG5cbiAgICBpZiAoIXRoaXMubm90ZSkgcmV0dXJuO1xuXG4gICAgdGhpcy5saXN0ZW5lcnMuYWRkKHRoaXMubm90ZS5jb25uZWN0KFwibm90aWZ5Ojpjb250ZW50XCIsICgpID0+IHtcbiAgICAgIHRoaXMuc2hvd19jb250ZW50KCk7XG4gICAgfSkpO1xuXG4gICAgdGhpcy5saXN0ZW5lcnMuYWRkKHRoaXMubm90ZS5jb25uZWN0KFwibm90aWZ5Ojp0YWdfbGlzdFwiLCAoKSA9PiB7XG4gICAgICB0aGlzLmNsZWFyX3RhZ3MoKTtcbiAgICAgIHRoaXMuaW5pdF90YWdzKHRoaXMubm90ZSEudGFncyk7XG4gICAgfSkpO1xuICB9XG5cbiAgcmVtb3ZlX2xpc3RlbmVycygpIHtcbiAgICBzdXBlci5yZW1vdmVfbGlzdGVuZXJzKCk7XG5cbiAgICBpZiAoIXRoaXMubm90ZSkgcmV0dXJuO1xuXG4gICAgZm9yIChjb25zdCBsaXN0ZW5lciBvZiB0aGlzLmxpc3RlbmVycykge1xuICAgICAgdGhpcy5ub3RlIS5kaXNjb25uZWN0KGxpc3RlbmVyKTtcbiAgICB9XG5cbiAgICB0aGlzLmxpc3RlbmVycy5jbGVhcigpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBXcml0ZWFibGVTdGlja3lOb3RlIGV4dGVuZHMgQWJzdHJhY3RTdGlja3lOb3RlIHtcbiAgc3RhdGljIHtcbiAgICBHT2JqZWN0LnJlZ2lzdGVyQ2xhc3MoXG4gICAgICB7XG4gICAgICAgIEdUeXBlTmFtZTogXCJXcml0ZWFibGVTdGlja3lOb3RlXCIsXG4gICAgICB9LFxuICAgICAgdGhpcyxcbiAgICApO1xuICB9XG5cbiAgdXBkYXRpbmcgPSBmYWxzZTtcbiAgc291cmNlOiBudW1iZXIgfCBudWxsID0gbnVsbDtcblxuICBnZXQgbm90ZSgpIHtcbiAgICByZXR1cm4gc3VwZXIubm90ZTtcbiAgfVxuXG4gIHNldCBub3RlKG5vdGU6IE5vdGUgfCB1bmRlZmluZWQpIHtcbiAgICB0aGlzLnVwZGF0aW5nID0gdHJ1ZTtcbiAgICBzdXBlci5ub3RlID0gbm90ZTtcbiAgfVxuXG4gIGNoYW5nZTxUIGV4dGVuZHMga2V5b2YgTm90ZT4oa2V5OiBULCB2YWx1ZTogTm90ZVtUXSkge1xuICAgIGlmICghdGhpcy5ub3RlKSByZXR1cm47XG4gICAgdGhpcy5ub3RlW2tleV0gPSB2YWx1ZTtcbiAgICB0aGlzLm5vdGUubW9kaWZpZWRfZGF0ZSA9IG5ldyBEYXRlKCk7XG4gIH1cblxuICBjb25zdHJ1Y3Rvcihub3RlPzogTm90ZSkge1xuICAgIHN1cGVyKG5vdGUpO1xuXG4gICAgdGhpcy5idWZmZXIuY29ubmVjdF9hZnRlcihcImluc2VydC10ZXh0XCIsIChidWZmZXIsIGxvYywgdGV4dCwgbGVuZ3RoKSA9PiB7XG4gICAgICB0aGlzLm9uX3RleHRfaW5zZXJ0ZWQoYnVmZmVyLCBsb2MsIHRleHQsIGxlbmd0aCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmJ1ZmZlci5jb25uZWN0KFwiY2hhbmdlZFwiLCAoKSA9PiB7XG4gICAgICBpZiAodGhpcy51cGRhdGluZykge1xuICAgICAgICB0aGlzLnVwZGF0aW5nID0gZmFsc2U7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMudXBkYXRlX2xpbmtzKCk7XG4gICAgICBpZiAodGhpcy5idWZmZXIudGV4dCA9PSB0aGlzLm5vdGUhLmNvbnRlbnQpIHJldHVybjtcbiAgICAgIHRoaXMuY2hhbmdlKFwiY29udGVudFwiLCB0aGlzLmJ1ZmZlci50ZXh0KTtcbiAgICB9KTtcblxuICAgIHRoaXMuYnVmZmVyLmNvbm5lY3QoXCJtYXJrLXNldFwiLCAoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMubm90ZSkgcmV0dXJuO1xuXG4gICAgICBjb25zdCB0YWdzID0gdGhpcy5nZXRfdGFncygpO1xuICAgICAgaWYgKGNvbXBhcmVfdGFncyh0YWdzLCB0aGlzLm5vdGUudGFncykpIHJldHVybjtcbiAgICAgIHRoaXMubm90ZS50YWdzID0gdGFncztcbiAgICB9KTtcbiAgfVxuXG4gIGNsZWFyX2xpbmtzKCkge1xuICAgIHRoaXMuYnVmZmVyLnJlbW92ZV90YWcoXG4gICAgICB0aGlzLmxpbmtfdGFnLFxuICAgICAgdGhpcy5idWZmZXIuZ2V0X3N0YXJ0X2l0ZXIoKSxcbiAgICAgIHRoaXMuYnVmZmVyLmdldF9lbmRfaXRlcigpLFxuICAgICk7XG4gICAgdGhpcy5lbWl0KFwidGFnLXRvZ2dsZVwiLCBcImxpbmtcIiwgZmFsc2UpO1xuICB9XG5cbiAgdXBkYXRlX2xpbmtzKCkge1xuICAgIGNvbnN0IHRleHQgPSB0aGlzLmJ1ZmZlci50ZXh0O1xuXG4gICAgdGhpcy5jbGVhcl9saW5rcygpO1xuXG4gICAgZmluZCh0ZXh0KVxuICAgICAgLmZvckVhY2goKG1hdGNoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5idWZmZXIuZ2V0X2l0ZXJfYXRfb2Zmc2V0KG1hdGNoLnN0YXJ0KTtcbiAgICAgICAgY29uc3QgZW5kID0gdGhpcy5idWZmZXIuZ2V0X2l0ZXJfYXRfb2Zmc2V0KG1hdGNoLmVuZCk7XG5cbiAgICAgICAgdGhpcy5idWZmZXIuYXBwbHlfdGFnKHRoaXMubGlua190YWcsIHN0YXJ0LCBlbmQpO1xuICAgICAgfSk7XG5cbiAgICB0aGlzLmVtaXQoXCJ0YWctdG9nZ2xlXCIsIFwibGlua1wiLCB0cnVlKTtcbiAgfVxuXG4gIGNsZWFyX3RhZ3MoKSB7XG4gICAgc3VwZXIuY2xlYXJfdGFncygpO1xuICAgIC8vIHRoaXMuY2hhbmdlKFwidGFnc1wiLCBbXSk7XG4gIH1cblxuICBhcHBseV90YWcodGFnOiBHdGsuVGV4dFRhZykge1xuICAgIHN1cGVyLmFwcGx5X3RhZyh0YWcpO1xuICAgIGNvbnN0IHRhZ3MgPSB0aGlzLmdldF90YWdzKCk7XG4gICAgaWYgKGNvbXBhcmVfdGFncyh0YWdzLCB0aGlzLm5vdGUhLnRhZ3MpKSByZXR1cm47XG4gICAgdGhpcy5jaGFuZ2UoXCJ0YWdzXCIsIHRhZ3MpO1xuICB9XG5cbiAgb25fdGV4dF9pbnNlcnRlZChcbiAgICBidWZmZXI6IEd0ay5UZXh0QnVmZmVyLFxuICAgIGxvYzogR3RrLlRleHRJdGVyLFxuICAgIHRleHQ6IHN0cmluZyxcbiAgICBsZW5ndGg6IG51bWJlcixcbiAgKSB7XG4gICAgaWYgKHRleHQgPT09IFwiXFxuXCIpIHtcbiAgICAgIGNvbnN0IHN0YXJ0X2l0ZXIgPSBsb2MuY29weSgpO1xuICAgICAgc3RhcnRfaXRlci5iYWNrd2FyZF9jaGFyKCk7XG4gICAgICBzdGFydF9pdGVyLnNldF9saW5lX29mZnNldCgwKTtcblxuICAgICAgY29uc3QgZW5kX2l0ZXIgPSBzdGFydF9pdGVyLmNvcHkoKTtcbiAgICAgIGVuZF9pdGVyLmZvcndhcmRfY2hhcnMoMik7XG4gICAgICBjb25zdCBjaGFycyA9IGJ1ZmZlci5nZXRfdGV4dChzdGFydF9pdGVyLCBlbmRfaXRlciwgZmFsc2UpO1xuXG4gICAgICBjb25zdCBzaW1wbGVfcmVnZXhfcGF0dGVybiA9IC9eWy0rKl0gJC87XG4gICAgICBpZiAoc2ltcGxlX3JlZ2V4X3BhdHRlcm4udGVzdChjaGFycykpIHtcbiAgICAgICAgY29uc3QgYnVsbGV0ID0gY2hhcnNbMF07XG4gICAgICAgIGNvbnN0IGxpbmVfZW5kID0gbG9jLmNvcHkoKTtcbiAgICAgICAgbGluZV9lbmQuYmFja3dhcmRfY2hhcigpO1xuICAgICAgICBpZiAobGluZV9lbmQuZ2V0X2xpbmVfb2Zmc2V0KCkgPT09IDIpIHtcbiAgICAgICAgICBzdGFydF9pdGVyLnNldF9saW5lX29mZnNldCgwKTtcbiAgICAgICAgICBidWZmZXIuZGVsZXRlKHN0YXJ0X2l0ZXIsIGxvYyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYnVmZmVyLmluc2VydChsb2MsIGJ1bGxldCArIFwiIFwiLCAtMSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHNlYXJjaF9saW1pdCA9IHN0YXJ0X2l0ZXIuY29weSgpO1xuICAgICAgICBjb25zdCBzZWFyY2hfZW5kID0gc3RhcnRfaXRlci5jb3B5KCk7XG4gICAgICAgIHNlYXJjaF9saW1pdC5mb3J3YXJkX2NoYXJzKDEwKTtcblxuICAgICAgICBzZWFyY2hfZW5kLmZvcndhcmRfZmluZF9jaGFyKChjaCkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiZm9yd2FyZCBjaGFyXCIsY2gpO1xuICAgICAgICAgIHJldHVybiBjaCA9PT0gXCIgXCI7XG4gICAgICAgIH0sIHNlYXJjaF9saW1pdCk7XG4gICAgICAgIHNlYXJjaF9lbmQuZm9yd2FyZF9jaGFyKCk7XG4gICAgICAgIGNvbnN0IGNoYXJzID0gYnVmZmVyLmdldF90ZXh0KHN0YXJ0X2l0ZXIsIHNlYXJjaF9lbmQsIGZhbHNlKTtcblxuICAgICAgICBjb25zdCBvcmRlcmVkX3JlZ2V4X3BhdHRlcm4gPSAvXlxcZCtcXC4gJC87XG4gICAgICAgIGlmIChvcmRlcmVkX3JlZ2V4X3BhdHRlcm4udGVzdChjaGFycykpIHtcbiAgICAgICAgICBjb25zdCBjdXJyZW50X29yZGVyID0gcGFyc2VJbnQoY2hhcnMuc2xpY2UoMCwgLTIpKTtcbiAgICAgICAgICBjb25zdCBuZXdfb3JkZXIgPSBjdXJyZW50X29yZGVyICsgMTtcbiAgICAgICAgICBjb25zdCBuZXdfb3JkZXJfYnVsbGV0ID0gYCR7bmV3X29yZGVyfS4gYDtcbiAgICAgICAgICBjb25zdCBsaW5lX2VuZCA9IGxvYy5jb3B5KCk7XG4gICAgICAgICAgbGluZV9lbmQuYmFja3dhcmRfY2hhcigpO1xuXG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgbGluZV9lbmQuZ2V0X2xpbmVfb2Zmc2V0KCkgPT09IGN1cnJlbnRfb3JkZXIudG9TdHJpbmcoKS5sZW5ndGggKyAyXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBzdGFydF9pdGVyLnNldF9saW5lX29mZnNldCgwKTtcbiAgICAgICAgICAgIGJ1ZmZlci5kZWxldGUoc3RhcnRfaXRlciwgbG9jKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnVmZmVyLmluc2VydChsb2MsIG5ld19vcmRlcl9idWxsZXQsIC0xKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuY29uc3QgY29tcGFyZV90YWdzID0gKGE6IElUYWdbXSwgYjogSVRhZ1tdKSA9PiB7XG4gIGlmIChhLmxlbmd0aCAhPSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICBmb3IgKGNvbnN0IHRhZyBvZiBhKSB7XG4gICAgaWYgKFxuICAgICAgIWIuZmluZCgodCkgPT5cbiAgICAgICAgdC5uYW1lID09IHRhZy5uYW1lICYmIHQuc3RhcnQgPT0gdGFnLnN0YXJ0ICYmIHQuZW5kID09IHRhZy5lbmRcbiAgICAgIClcbiAgICApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xuIiwgIi8vIFRISVMgRklMRSBJUyBBVVRPTUFUSUNBTExZIEdFTkVSQVRFRCBETyBOT1QgRURJVCBESVJFQ1RMWVxuLy8gU2VlIHVwZGF0ZS10bGRzLmpzIGZvciBlbmNvZGluZy9kZWNvZGluZyBmb3JtYXRcbi8vIGh0dHBzOi8vZGF0YS5pYW5hLm9yZy9UTEQvdGxkcy1hbHBoYS1ieS1kb21haW4udHh0XG5jb25zdCBlbmNvZGVkVGxkcyA9ICdhYWExcnAzYmFydGg0YjBvdHQzdmllNGMxbGUyb2dhZG81dWRoYWJpN2MwYWRlbXk1Y2VudHVyZTZvdW50YW50MHM5bzF0b3I0ZDBzMXVsdDRlMGcxcm8ydG5hNGYwbDFyaWNhNWcwYWtoYW41ZW5jeTVpMGcxcmJ1czNmb3JjZTV0ZWw1a2RuM2wwZmFyb21lbzdpYmFiYTRwYXk0bGZpbmFuejZzdGF0ZTV5MnNhY2UzdG9tNW0wYXpvbjRlcmljYW5leHByZXNzN2ZhbWlseTExeDJmYW0zaWNhM3N0ZXJkYW04bmFseXRpY3M3ZHJvaWQ1cXVhbjR6Mm8wbDJwYXJ0bWVudHM4cDBsZTRxMHVhcmVsbGU4cjBhYjFtY280Y2hpM215MnBhMnQwZTNzMGRhMmlhMnNvY2lhdGVzOXQwaGxldGE1dG9ybmV5N3UwY3Rpb241ZGkwYmxlM28zc3Bvc3Q1dGhvcjNvMHM0dmlhbmNhNncwczJ4MGEyejB1cmU1YmEwYnkyaWR1M25hbWV4M25hcmVwdWJsaWMxMWQxazJyMGNlbG9uYTVsYXljYXJkNHM1ZWZvb3Q1Z2FpbnM2c2ViYWxsNWtldGJhbGw4dWhhdXM1eWVybjViMGMxdDF2YTNjZzFuMmQxZTBhdHMydXR5NGVyMm50bGV5NXJsaW40c3QwYnV5NXQyZjFnMWgwYXJ0aTVpMGJsZTNkMWtlMm5nMG8zbzF6MmoxbGFjazBmcmlkYXk5b2NrYnVzdGVyOGcxb21iZXJnN3VlM20wczF3Mm4wcHBhcmliYXM5bzBhdHMzZWhyaW5nZXI4ZmEybTFuZDJvMGswaW5nNXNjaDJ0aWsyb240dDF1dGlxdWU2eDJyMGFkZXNjbzZpZGdlc3RvbmU5b2Fkd2F5NWtlcjN0aGVyNXVzc2VsczdzMXQxdWlsZDBlcnM2c2luZXNzNnkxenozdjF3MXkxejBoM2NhMGIxZmUybDBsMXZpbmtsZWluOW0wZXJhM3Aybm9uM3BldG93bjVpdGFsMG9uZThyMGF2YW40ZHMyZTBlcjBzNHMyc2ExZTFoMWlubzR0MGVyaW5nNWhvbGljN2JhMW4xcmUyczJjMWQxZW50ZXI0bzFybjNmMGExZDJnMWgwYW5lbDJuZWw0cml0eTRzZTJ0MmVhcDNpbnRhaTVyaXN0bWFzNm9tZTR1cmNoNWkwcHJpYW5pNnJjbGU0c2NvM3RhZGVsNGkwYzJ5MGVhdHM3azFsMGFpbXM0ZWFuaW5nNmljazJuaWMxcXVlNm90aGluZzV1ZDN1YjBtZWQ2bTFuMW8wYWNoM2RlczNmZmVlNGxsZWdlNG9nbmU1bTBjYXN0NG1iYW5rNHVuaXR5NnBhbnkycmUzdXRlcjVzZWM0bmRvczNzdHJ1Y3Rpb244dWx0aW5nN3RhY3QzcmFjdG9yczlva2luZzBjaGFubmVsMTFsMXAycnNpY2E1dW50cnk0cG9uMHM0cnNlczZwYTJyMGVkaXQwY2FyZDR1bmlvbjlpY2tldDVvd24zczF1aXNlMHM2dTBpc2luZWxsYTl2MXcxeDF5MG1ydTNvdTN6MmRhYnVyM2QxbmNlM3RhMWUxaW5nM3N1bjR5MmNsazNkczJlMGFsMGVyMnMzZ3JlZTRsaXZlcnk1bDFvaXR0ZTV0YTNtb2NyYXQ2bnRhbDJpc3Q1c2kwZ240djJobDJpYW1vbmRzNmV0MmdpdGFsNXJlY3Qwb3J5N3Njb3VudDN2ZXI1aDJ5MmoxazFtMW5wMm8wY3MxdG9yNGcxbWFpbnM1dDF3bmxvYWQ3cml2ZTR0djJ1YmFpM25sb3A0cG9udDRyYmFuNXZhZzJyMnoyZWFydGgzdDJjMG8yZGVrYTN1MGNhdGlvbjhlMWcxbWFpbDNlcmNrNW5lcmd5NGdpbmVlcjBpbmc5dGVycHJpc2VzMTBwc29uNHF1aXBtZW50OHIwaWNzc29uNm5pM3MwcTF0YXRlNXQwaXNhbGF0N3Uwcm92aXNpb244czJ2ZW50czV4Y2hhbmdlNnBlcnQzb3NlZDRyZXNzNXRyYXNwYWNlMTBmYWdlMmlsMXJ3aW5kczZ0aDNtaWx5NG4wczJybTBlcnM1c2hpb240dDNlZGV4M2VkYmFjazZycmFyaTNlcm82aTBhdDJkZWxpdHk1bzJsbTJuYWwxbmNlMWlhbDdyZTBzdG9uZTZtZGFsZTZzaDBpbmc1dDBuZXNzNmoxazFsaWNrcjNnaHRzNHIyb3Jpc3Q0d2VyczV5Mm0xbzBvMGQwbmV0d29yazh0YmFsbDZyZDFleDJzYWxlNHVtM3VuZGF0aW9uOHgycjBlZTFzZW5pdXM3bDFvZ2FuczRudGRvb3I0aWVyN3RyMnVqaXRzdTVuMGQycm5pdHVyZTd0Ym9sNXlpM2dhMGwwbGVyeTNvMXVwNG1lMHMzcDFyZGVuNHkyYjBpejNkMG4yZTBhMW50MGluZzVvcmdlNWYxZzBlZTNoMWkwZnQwczN2ZXMyaW5nNWwwYXNzM2Uxb2JhbDJvNG0wYWlsM2JoMm8xeDJuMW9kYWRkeTVsZDBwb2ludDZmMm8wZHllYXI1ZzBsZTRwMXQxdjJwMXExcjBhaW5nZXI1cGhpY3M1dGlzNGVlbjNpcGUzb2Nlcnk0dXA0czF0MXUwYXJkaWFuNmNjaTNnZTJpZGUydGFyczVydTN3MXkyaGFpcjJtYnVyZzVuZ291dDV1czNibzJkZmMwYmFuazdlYWx0aDBjYXJlOGxwMXNpbmtpNnJlMW1lczVndHYzaXBob3A0c2FtaXRzdTd0YWNoaTV2MmswdDJtMW4xb2NrZXk0bGRpbmdzNWlkYXk1bWVkZXBvdDVnb29kczVzMGVuc2U3bmRhM3JzZTNzcGl0YWw1dDBpbmc1dDBlbGVzMnMzbWFpbDV1c2UzdzJyMXNiYzN0MXUwZ2hlczV5YXR0M3VuZGFpN2libTJjYmMyZTF1MmQxZTBlZTNmbTJrYW5vNGwxbTBhbWF0NGRiMm1vMGJpbGllbjluMGMxZHVzdHJpZXM4ZmluaXRpNW8yZzFrMXN0aXR1dGU2dXJhbmNlNGU0dDBlcm5hdGlvbmFsMTB1aXQ0dmVzdG1lbnRzMTBvMXBpcmFuZ2E3cTFyMGlzaDRzMG1haWxpNXQwYW5idWw3dDBhdTJ2M2phZ3VhcjR2YTNjYjJlMGVwMnR6dDN3ZWxyeTZpbzJsbDJtMHAybmoybzBiczF1cmc0dDF5MnAwbW9yZ2FuNnJzM3VlZ29zNG5pcGVyN2thdWZlbjVkZGkzZTBycnlob3RlbHM2bG9naXN0aWNzOXByb3BlcnRpZXMxNGZoMmcxaDFpMGExZHMybTFuZGVyMmxlNHRjaGVuNXdpM20xbjFvZWxuM21hdHN1NXNoZXI1cDBtZzJuMnIwZDFlZDN1b2tncm91cDh3MXkwb3RvNHoybGEwY2FpeGE1bWJvcmdoaW5pOGVyM25jYXN0ZXI1aWEzZDByb3ZlcjZ4ZXNzNXNhbGxlNXQwaW5vM3JvYmU1dzB5ZXI1YjFjMWRzMmVhc2UzY2xlcmM1ZnJhazRnYWwybzJ4dXM0Z2J0M2kwZGwyZmUwaW5zdXJhbmNlOXN0eWxlN2dodGluZzZrZTJsbHkzbWl0ZWQ0bzJuY29sbjRkZTJrMnBzeTN2ZTFpbmc1azFsYzFwMm9hbjBzM2NrZXIzdXMzbDFuZG9uNHR0ZTFvM3ZlM3BsMGZpbmFuY2lhbDExcjFzMXQwZDBhM3UwbmRiZWNrNnhlMXVyeTV2MXkybWEwY3lzM2RyaWQ0aWYxc29uNGtldXA0bjBhZ2VtZW50N2dvM3AxcmtldDBpbmczczRyaW90dDVzaGFsbHM3c2VyYXRpNnR0ZWw1YmEyYzBraW5zZXk3ZDFlMGQwaWEzZXQybGJvdXJuZTdtZTFvcmlhbDZuMHUycmNrbXNkN2cxaDFpYW1pM2Nyb3NvZnQ3bDFuaTF0MnQwc3ViaXNoaTlrMWwwYjFzMm0wYTJuMW8wYmkwbGU0ZGEyZTFpMW0xbmFzaDNleTJzdGVyNXJtb24zdGdhZ2U2c2NvdzR0bzByY3ljbGVzOXYwaWU0cDFxMXIxczBkMnQwbjFyMnUwc2V1bTNpYzN0dWFsNXYxdzF4MXkxejJuYTBiMWdveWE0bWUydHVyYTR2eTNiYTJjMWUwYzF0MGJhbms0ZmxpeDR3b3JrNXVzdGFyNXcwczJ4dDBkaXJlY3Q3dXM0ZjBsMmcwbzJoazJpMGNvMmtlMW9uM25qYTNzc2FuMXk1bDFvMGtpYTNydGh3ZXN0ZXJubXV0dWFsMTRvbjR3MHJ1ejN0djRwMXIwYTF3MnR0MnUxeWMyejJvYmkxc2VydmVyN2ZmaWNlNWtpbmF3YTZsYXlhbjBncm91cDlkbmF2eTVsbzNtMGVnYTRuZTFnMWwwaW5lNW9vMnBlbjNyYWNsZTNuZ2U0ZzBhbmljNWlnaW5zNnNha2E0dHN1a2E0dDJ2aDNwYTBnZTJuYXNvbmljN3JpczJzMXRuZXJzNHMxeTNzc2FnZW5zN3kyY2N3M2UwdDJmMGl6ZXI1ZzFoMGFybWFjeTZkMWlsaXBzNW9uZTJ0bzBncmFwaHk2czR5c2lvNWljczF0ZXQydXJlczZkMW4wZzFrMm9uZWVyNXp6YTRrMWwwYWNlMnkwc3RhdGlvbjl1bWJpbmc1czNtMW4wYzJvaGwya2VyM2xpdGllNXJuMnN0M3IwYW1lcmljYTZ4aTNlc3MzaW1lM28wZDB1Y3Rpb25zOGYxZ3Jlc3NpdmU4bW8ycGVydGllczN5NXRlY3Rpb244dTBkZW50aWFsOXMxdDF1YjJ3MGMyeTJxYTFwb24zdWViZWMzc3Q1cmFjaW5nNGRpbzRlMGFkMWxlc3RhdGU2dG9yMnk0Y2lwZXM1ZDBzdG9uZTV1bWJyZWxsYTloYWIzaXNlMG4zdDJsaWFuY2U2bjB0MGFsczVwYWlyM29ydDN1YmxpY2FuOHN0MGF1cmFudDh2aWV3MHM1eHJvdGg2aWNoMGFyZGxpNm9oM2wxbzFwMm8wY2hlcjNrczNkZW8zZ2VyczRvbTNzMHZwM3UwZ2J5M2hyMm4ydzBlMnl1a3l1NnNhMGFybGFuZDZmZTB0eTRrdXJhNGxlMW9uM21zY2x1YjR1bmc1bmR2aWswY29yb21hbnQxMm9maTRwMXJsMnMxdmUyeG8zYjBpMXMyYzBhMWIxaGFlZmZsZXI3bWlkdDRvbGFyc2hpcHM4b2wzdWxlM3dhcno1aWVuY2U1b3QzZDFlMGFyY2gzdDJjdXJlMWl0eTZlazJsZWN0NG5lcjNydmljZXM2dmVuM3cxeDB5M2ZyMmcxaDBhbmdyaWxhNnJwMncyZWxsM2lhMWtzaGE1b2VzMnAwcGluZzV1amkzdzB0aW1lN2kwbGsybmExZ2xlczV0ZTNqMWswaTBuMnkwcGU0bDBpbmc0bTBhcnQzaWxlNG4wY2YzbzBjY2VyM2lhbDRmdGJhbms0d2FyZTZodTJsYXIydXRpb25zN25nMXkyeTJwYTBjZTNvcnQydDNyMGwyczF0MGFkYTJwbGVzNHIxdGViYW5rNGZhcm03YzBncm91cDZvY2tob2xtNnJhZ2UzZTNyZWFtNHVkaW8yeTN5bGU0dTBja3MzcHBsaWVzM3kyb3J0NXJmMWdlcnk1enVraTV2MXdhdGNoNGlzczR4MXkwZG5leTRzdGVtczZ6MnRhYjFpcGVpNGxrMm9iYW80cmdldDR0YW1vdG9yczZyMnRvbzR4MGkzYzBpMmQwazJlYW0yY2gwbm9sb2d5OGwxbWFzZWs1bm5pczR2YTNmMWcxaDBkMWVhdGVyMnJlNmlhYTJja2V0czVlbmRhNGZmYW55NXBzMnJlczJvbDRqMG1heHg0eDJrMG1heHg1bDFtMGFsbDRuMW8wZGF5M2t5bzNvbHMzcDFyYXkzc2hpYmE1dGFsM3VyczN3bjJ5b3RhM3MzcjBhZGUxaW5nNGluaW5nNXZlbDBjaGFubmVsN2VyczBpbnN1cmFuY2UxNnVzdDN2MnQxdWJlMmkxbmVzM3NodTR2MHMydzF6MnVhMWJhbmszczJnMWsxbmljb20zdmVyc2l0eThvMm9sMnBzMnMxeTF6MnZhMGNhdGlvbnM3bmExZ3VhcmQ3YzFlMGdhczNudHVyZXM2cmlzaWduNW1cdTAwRjZnZW5zYmVyYXRlcjJ1bmcxNHNpY2hlcnVuZzEwdDJnMWkwYWplczRkZW8zZzFraW5nNGxsYXM0bjFwMXJnaW40c2ExaW9uNHZhMW8zbGFhbmRlcmVuOW4xb2RrYTNsa3N3YWdlbjd2bzN0ZTFpbmczbzJ5YWdlNXUwZWxvczZ3YWxlczJtYXJ0NHRlcjRuZzBnb3U1dGNoMGVzNmVhdGhlcjBjaGFubmVsMTJiY2FtM2VyMnNpdGU1ZDBkaW5nNWlibzJyM2YxaG9zd2hvNmllbjJraTJsbGlhbWhpbGw5bjBkb3dzNGUxbmVyczZtZTJvbHRlcnNrbHV3ZXIxMW9kc2lkZTZyazBzMmxkM3cyczF0YzFmM3hib3gzZXJveDRmaW5pdHk2aWh1YW40bjJ4eDJ5ejN5YWNodHM0aG9vM21heHVuNW5kZXg1ZTFvZG9iYXNoaTdnYTJrb2hhbWE2dTB0dWJlNnQxdW4zemEwcHBvczRyYTNlcm8zaXAybTFvbmUzdWVyaWNoNncyJztcbi8vIEludGVybmF0aW9uYWxpemVkIGRvbWFpbiBuYW1lcyBjb250YWluaW5nIG5vbi1BU0NJSVxuY29uc3QgZW5jb2RlZFV0bGRzID0gJ1x1MDNCNVx1MDNCQjFcdTAzQzUyXHUwNDMxXHUwNDMzMVx1MDQzNVx1MDQzQjNcdTA0MzRcdTA0MzVcdTA0NDJcdTA0Mzg0XHUwNDM1XHUwNDRFMlx1MDQzQVx1MDQzMFx1MDQ0Mlx1MDQzRVx1MDQzQlx1MDQzOFx1MDQzQTZcdTA0M0VcdTA0M0MzXHUwNDNDXHUwNDNBXHUwNDM0Mlx1MDQzRVx1MDQzRDFcdTA0NDFcdTA0M0FcdTA0MzJcdTA0MzA2XHUwNDNFXHUwNDNEXHUwNDNCXHUwNDMwXHUwNDM5XHUwNDNENVx1MDQ0MFx1MDQzMzNcdTA0NDBcdTA0NDNcdTA0NDEyXHUwNDQ0Mlx1MDQ0MVx1MDQzMFx1MDQzOVx1MDQ0MjNcdTA0NDBcdTA0MzEzXHUwNDQzXHUwNDNBXHUwNDQwM1x1MDQ5Qlx1MDQzMFx1MDQzNzNcdTA1NzBcdTA1NjFcdTA1NzUzXHUwNUQ5XHUwNUU5XHUwNUU4XHUwNUQwXHUwNURDNVx1MDVFN1x1MDVENVx1MDVERDNcdTA2MjdcdTA2MjhcdTA2NDhcdTA2MzhcdTA2MjhcdTA2NEE1XHUwNjJBXHUwNjM1XHUwNjI3XHUwNjQ0XHUwNjI3XHUwNjJBNlx1MDYzMVx1MDYyN1x1MDY0NVx1MDY0M1x1MDY0ODVcdTA2NDRcdTA2MjdcdTA2MzFcdTA2MkZcdTA2NDY0XHUwNjI4XHUwNjJEXHUwNjMxXHUwNjRBXHUwNjQ2NVx1MDYyQ1x1MDYzMlx1MDYyN1x1MDYyNlx1MDYzMTVcdTA2MzNcdTA2MzlcdTA2NDhcdTA2MkZcdTA2NEFcdTA2Mjk2XHUwNjM5XHUwNjQ0XHUwNjRBXHUwNjI3XHUwNjQ2NVx1MDY0NVx1MDYzQVx1MDYzMVx1MDYyODVcdTA2NDVcdTA2MjdcdTA2MzFcdTA2MjdcdTA2MkE1XHUwNkNDXHUwNjMxXHUwNjI3XHUwNjQ2NVx1MDYyOFx1MDYyN1x1MDYzMVx1MDYyQTJcdTA2MzJcdTA2MjdcdTA2MzE0XHUwNjRBXHUwNjJBXHUwNjQzM1x1MDZCRVx1MDYyN1x1MDYzMVx1MDYyQTVcdTA2MkFcdTA2NDhcdTA2NDZcdTA2MzM0XHUwNjMzXHUwNjQ4XHUwNjJGXHUwNjI3XHUwNjQ2M1x1MDYzMVx1MDY0QVx1MDYyOTVcdTA2MzRcdTA2MjhcdTA2NDNcdTA2Mjk0XHUwNjM5XHUwNjMxXHUwNjI3XHUwNjQyMlx1MDYyODJcdTA2NDVcdTA2MjdcdTA2NDY0XHUwNjQxXHUwNjQ0XHUwNjMzXHUwNjM3XHUwNjRBXHUwNjQ2Nlx1MDY0Mlx1MDYzN1x1MDYzMTNcdTA2NDNcdTA2MjdcdTA2MkJcdTA2NDhcdTA2NDRcdTA2NEFcdTA2NDM2XHUwNjQ4XHUwNjQ1M1x1MDY0NVx1MDYzNVx1MDYzMTJcdTA2NDRcdTA2NEFcdTA2MzNcdTA2NEFcdTA2Mjc1XHUwNjQ4XHUwNjMxXHUwNjRBXHUwNjJBXHUwNjI3XHUwNjQ2XHUwNjRBXHUwNjI3N1x1MDY0Mlx1MDYzOTRcdTA2NDdcdTA2NDVcdTA2MzFcdTA2MjdcdTA2NDc1XHUwNjdFXHUwNjI3XHUwNkE5XHUwNjMzXHUwNjJBXHUwNjI3XHUwNjQ2N1x1MDY4MFx1MDYyN1x1MDYzMVx1MDYyQTRcdTA5MTVcdTA5NDlcdTA5MkUzXHUwOTI4XHUwOTQ3XHUwOTFGM1x1MDkyRFx1MDkzRVx1MDkzMFx1MDkyNDBcdTA5MkVcdTA5NEQzXHUwOTRCXHUwOTI0NVx1MDkzOFx1MDkwMlx1MDkxN1x1MDkyMFx1MDkyODVcdTA5QUNcdTA5QkVcdTA5ODJcdTA5QjJcdTA5QkU1XHUwOUFEXHUwOUJFXHUwOUIwXHUwOUE0Mlx1MDlGMFx1MDlBNDRcdTBBMkRcdTBBM0VcdTBBMzBcdTBBMjQ0XHUwQUFEXHUwQUJFXHUwQUIwXHUwQUE0NFx1MEIyRFx1MEIzRVx1MEIzMFx1MEIyNDRcdTBCODdcdTBCQThcdTBCQ0RcdTBCQTRcdTBCQkZcdTBCQUZcdTBCQkU2XHUwQkIyXHUwQjk5XHUwQkNEXHUwQjk1XHUwQkM4Nlx1MEI5QVx1MEJCRlx1MEI5OVx1MEJDRFx1MEI5NVx1MEJBQVx1MEJDRFx1MEJBQVx1MEJDMlx1MEJCMFx1MEJDRDExXHUwQzJEXHUwQzNFXHUwQzMwXHUwQzI0XHUwQzRENVx1MENBRFx1MENCRVx1MENCMFx1MENBNDRcdTBEMkRcdTBEM0VcdTBEMzBcdTBEMjRcdTBEMDI1XHUwREJEXHUwRDgyXHUwRDlBXHUwRENGNFx1MEUwNFx1MEUyRFx1MEUyMTNcdTBFNDRcdTBFMTdcdTBFMjIzXHUwRUE1XHUwRUIyXHUwRUE3M1x1MTBEMlx1MTBENDJcdTMwN0ZcdTMwOTNcdTMwNkEzXHUzMEEyXHUzMERFXHUzMEJFXHUzMEYzNFx1MzBBRlx1MzBFOVx1MzBBNlx1MzBDOTRcdTMwQjBcdTMwRkNcdTMwQjBcdTMwRUI0XHUzMEIzXHUzMEUwMlx1MzBCOVx1MzBDOFx1MzBBMjNcdTMwQkJcdTMwRkNcdTMwRUIzXHUzMEQ1XHUzMEExXHUzMEMzXHUzMEI3XHUzMEU3XHUzMEYzNlx1MzBERFx1MzBBNFx1MzBGM1x1MzBDODRcdTRFMTZcdTc1NEMyXHU0RTJEXHU0RkUxMVx1NTZGRDFcdTU3MEIxXHU2NTg3XHU3RjUxM1x1NEU5QVx1OUE2Q1x1OTAwQTNcdTRGMDFcdTRFMUEyXHU0RjVCXHU1QzcxMlx1NEZFMVx1NjA2RjJcdTUwNjVcdTVFQjcyXHU1MTZCXHU1MzY2Mlx1NTE2Q1x1NTNGODFcdTc2Q0EyXHU1M0YwXHU2RTdFMVx1NzA2MzJcdTU1NDZcdTU3Q0UxXHU1RTk3MVx1NjgwNzJcdTU2MDlcdTkxQ0MwXHU1OTI3XHU5MTUyXHU1RTk3NVx1NTcyOFx1N0VCRjJcdTU5MjdcdTYyRkYyXHU1OTI5XHU0RTNCXHU2NTU5M1x1NUEzMVx1NEU1MDJcdTVCQjZcdTk2RkIyXHU1RTdGXHU0RTFDMlx1NUZBRVx1NTM1QTJcdTYxNDhcdTU1ODQyXHU2MjExXHU3MjMxXHU0RjYwM1x1NjI0Qlx1NjczQTJcdTYyREJcdTgwNTgyXHU2NTNGXHU1MkExMVx1NUU5QzJcdTY1QjBcdTUyQTBcdTU3NjEyXHU5NUZCMlx1NjVGNlx1NUMxQTJcdTY2RjhcdTdDNEQyXHU2NzNBXHU2Nzg0Mlx1NkRFMVx1OUE2Q1x1OTUyMTNcdTZFMzhcdTYyMEYyXHU2RkIzXHU5NTgwMlx1NzBCOVx1NzcwQjJcdTc5RkJcdTUyQTgyXHU3RUM0XHU3RUM3XHU2NzNBXHU2Nzg0NFx1N0Y1MVx1NTc0MDFcdTVFOTcxXHU3QUQ5MVx1N0VEQzJcdTgwNTRcdTkwMUEyXHU4QzM3XHU2QjRDMlx1OEQyRFx1NzI2OTJcdTkwMUFcdThDQTkyXHU5NkM2XHU1NkUyMlx1OTZGQlx1OEEwQVx1NzZDOFx1NzlEMTRcdTk4REVcdTUyMjlcdTZENjYzXHU5OERGXHU1NEMxMlx1OTkxMFx1NTM4NTJcdTk5OTlcdTY4M0NcdTkxQ0NcdTYyQzkzXHU2RTJGMlx1QjJGN1x1QjEzNzFcdUNFRjQyXHVDMEJDXHVDMTMxMlx1RDU1Q1x1QUQ2RDInO1xuXG4vKipcbiAqIEB0ZW1wbGF0ZSBBXG4gKiBAdGVtcGxhdGUgQlxuICogQHBhcmFtIHtBfSB0YXJnZXRcbiAqIEBwYXJhbSB7Qn0gcHJvcGVydGllc1xuICogQHJldHVybiB7QSAmIEJ9XG4gKi9cbmNvbnN0IGFzc2lnbiA9ICh0YXJnZXQsIHByb3BlcnRpZXMpID0+IHtcbiAgZm9yIChjb25zdCBrZXkgaW4gcHJvcGVydGllcykge1xuICAgIHRhcmdldFtrZXldID0gcHJvcGVydGllc1trZXldO1xuICB9XG4gIHJldHVybiB0YXJnZXQ7XG59O1xuXG4vKipcbiAqIEZpbml0ZSBTdGF0ZSBNYWNoaW5lIGdlbmVyYXRpb24gdXRpbGl0aWVzXG4gKi9cblxuLyoqXG4gKiBAdGVtcGxhdGUgVFxuICogQHR5cGVkZWYge3sgW2dyb3VwOiBzdHJpbmddOiBUW10gfX0gQ29sbGVjdGlvbnNcbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHt7IFtncm91cDogc3RyaW5nXTogdHJ1ZSB9fSBGbGFnc1xuICovXG5cbi8vIEtleXMgaW4gc2Nhbm5lciBDb2xsZWN0aW9ucyBpbnN0YW5jZXNcbmNvbnN0IG51bWVyaWMgPSAnbnVtZXJpYyc7XG5jb25zdCBhc2NpaSA9ICdhc2NpaSc7XG5jb25zdCBhbHBoYSA9ICdhbHBoYSc7XG5jb25zdCBhc2NpaW51bWVyaWMgPSAnYXNjaWludW1lcmljJztcbmNvbnN0IGFscGhhbnVtZXJpYyA9ICdhbHBoYW51bWVyaWMnO1xuY29uc3QgZG9tYWluID0gJ2RvbWFpbic7XG5jb25zdCBlbW9qaSA9ICdlbW9qaSc7XG5jb25zdCBzY2hlbWUgPSAnc2NoZW1lJztcbmNvbnN0IHNsYXNoc2NoZW1lID0gJ3NsYXNoc2NoZW1lJztcbmNvbnN0IHdoaXRlc3BhY2UgPSAnd2hpdGVzcGFjZSc7XG5cbi8qKlxuICogQHRlbXBsYXRlIFRcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge0NvbGxlY3Rpb25zPFQ+fSBncm91cHMgdG8gcmVnaXN0ZXIgaW5cbiAqIEByZXR1cm5zIHtUW119IEN1cnJlbnQgbGlzdCBvZiB0b2tlbnMgaW4gdGhlIGdpdmVuIGNvbGxlY3Rpb25cbiAqL1xuZnVuY3Rpb24gcmVnaXN0ZXJHcm91cChuYW1lLCBncm91cHMpIHtcbiAgaWYgKCEobmFtZSBpbiBncm91cHMpKSB7XG4gICAgZ3JvdXBzW25hbWVdID0gW107XG4gIH1cbiAgcmV0dXJuIGdyb3Vwc1tuYW1lXTtcbn1cblxuLyoqXG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHtUfSB0IHRva2VuIHRvIGFkZFxuICogQHBhcmFtIHtDb2xsZWN0aW9uczxUPn0gZ3JvdXBzXG4gKiBAcGFyYW0ge0ZsYWdzfSBmbGFnc1xuICovXG5mdW5jdGlvbiBhZGRUb0dyb3Vwcyh0LCBmbGFncywgZ3JvdXBzKSB7XG4gIGlmIChmbGFnc1tudW1lcmljXSkge1xuICAgIGZsYWdzW2FzY2lpbnVtZXJpY10gPSB0cnVlO1xuICAgIGZsYWdzW2FscGhhbnVtZXJpY10gPSB0cnVlO1xuICB9XG4gIGlmIChmbGFnc1thc2NpaV0pIHtcbiAgICBmbGFnc1thc2NpaW51bWVyaWNdID0gdHJ1ZTtcbiAgICBmbGFnc1thbHBoYV0gPSB0cnVlO1xuICB9XG4gIGlmIChmbGFnc1thc2NpaW51bWVyaWNdKSB7XG4gICAgZmxhZ3NbYWxwaGFudW1lcmljXSA9IHRydWU7XG4gIH1cbiAgaWYgKGZsYWdzW2FscGhhXSkge1xuICAgIGZsYWdzW2FscGhhbnVtZXJpY10gPSB0cnVlO1xuICB9XG4gIGlmIChmbGFnc1thbHBoYW51bWVyaWNdKSB7XG4gICAgZmxhZ3NbZG9tYWluXSA9IHRydWU7XG4gIH1cbiAgaWYgKGZsYWdzW2Vtb2ppXSkge1xuICAgIGZsYWdzW2RvbWFpbl0gPSB0cnVlO1xuICB9XG4gIGZvciAoY29uc3QgayBpbiBmbGFncykge1xuICAgIGNvbnN0IGdyb3VwID0gcmVnaXN0ZXJHcm91cChrLCBncm91cHMpO1xuICAgIGlmIChncm91cC5pbmRleE9mKHQpIDwgMCkge1xuICAgICAgZ3JvdXAucHVzaCh0KTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHtUfSB0IHRva2VuIHRvIGNoZWNrXG4gKiBAcGFyYW0ge0NvbGxlY3Rpb25zPFQ+fSBncm91cHNcbiAqIEByZXR1cm5zIHtGbGFnc30gZ3JvdXAgZmxhZ3MgdGhhdCBjb250YWluIHRoaXMgdG9rZW5cbiAqL1xuZnVuY3Rpb24gZmxhZ3NGb3JUb2tlbih0LCBncm91cHMpIHtcbiAgY29uc3QgcmVzdWx0ID0ge307XG4gIGZvciAoY29uc3QgYyBpbiBncm91cHMpIHtcbiAgICBpZiAoZ3JvdXBzW2NdLmluZGV4T2YodCkgPj0gMCkge1xuICAgICAgcmVzdWx0W2NdID0gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBAdGVtcGxhdGUgVFxuICogQHR5cGVkZWYge251bGwgfCBUIH0gVHJhbnNpdGlvblxuICovXG5cbi8qKlxuICogRGVmaW5lIGEgYmFzaWMgc3RhdGUgbWFjaGluZSBzdGF0ZS4gaiBpcyB0aGUgbGlzdCBvZiBjaGFyYWN0ZXIgdHJhbnNpdGlvbnMsXG4gKiBqciBpcyB0aGUgbGlzdCBvZiByZWdleC1tYXRjaCB0cmFuc2l0aW9ucywgamQgaXMgdGhlIGRlZmF1bHQgc3RhdGUgdG9cbiAqIHRyYW5zaXRpb24gdG8gdCBpcyB0aGUgYWNjZXB0aW5nIHRva2VuIHR5cGUsIGlmIGFueS4gSWYgdGhpcyBpcyB0aGUgdGVybWluYWxcbiAqIHN0YXRlLCB0aGVuIGl0IGRvZXMgbm90IGVtaXQgYSB0b2tlbi5cbiAqXG4gKiBUaGUgdGVtcGxhdGUgdHlwZSBUIHJlcHJlc2VudHMgdGhlIHR5cGUgb2YgdGhlIHRva2VuIHRoaXMgc3RhdGUgYWNjZXB0cy4gVGhpc1xuICogc2hvdWxkIGJlIGEgc3RyaW5nIChzdWNoIGFzIG9mIHRoZSB0b2tlbiBleHBvcnRzIGluIGB0ZXh0LmpzYCkgb3IgYVxuICogTXVsdGlUb2tlbiBzdWJjbGFzcyAoZnJvbSBgbXVsdGkuanNgKVxuICpcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0ge1R9IFt0b2tlbl0gVG9rZW4gdGhhdCB0aGlzIHN0YXRlIGVtaXRzXG4gKi9cbmZ1bmN0aW9uIFN0YXRlKHRva2VuKSB7XG4gIGlmICh0b2tlbiA9PT0gdm9pZCAwKSB7XG4gICAgdG9rZW4gPSBudWxsO1xuICB9XG4gIC8vIHRoaXMubiA9IG51bGw7IC8vIERFQlVHOiBTdGF0ZSBuYW1lXG4gIC8qKiBAdHlwZSB7eyBbaW5wdXQ6IHN0cmluZ106IFN0YXRlPFQ+IH19IGogKi9cbiAgdGhpcy5qID0ge307IC8vIElNUExFTUVOVEFUSU9OIDFcbiAgLy8gdGhpcy5qID0gW107IC8vIElNUExFTUVOVEFUSU9OIDJcbiAgLyoqIEB0eXBlIHtbUmVnRXhwLCBTdGF0ZTxUPl1bXX0ganIgKi9cbiAgdGhpcy5qciA9IFtdO1xuICAvKiogQHR5cGUgez9TdGF0ZTxUPn0gamQgKi9cbiAgdGhpcy5qZCA9IG51bGw7XG4gIC8qKiBAdHlwZSB7P1R9IHQgKi9cbiAgdGhpcy50ID0gdG9rZW47XG59XG5cbi8qKlxuICogU2Nhbm5lciB0b2tlbiBncm91cHNcbiAqIEB0eXBlIENvbGxlY3Rpb25zPHN0cmluZz5cbiAqL1xuU3RhdGUuZ3JvdXBzID0ge307XG5TdGF0ZS5wcm90b3R5cGUgPSB7XG4gIGFjY2VwdHMoKSB7XG4gICAgcmV0dXJuICEhdGhpcy50O1xuICB9LFxuICAvKipcbiAgICogRm9sbG93IGFuIGV4aXN0aW5nIHRyYW5zaXRpb24gZnJvbSB0aGUgZ2l2ZW4gaW5wdXQgdG8gdGhlIG5leHQgc3RhdGUuXG4gICAqIERvZXMgbm90IG11dGF0ZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGlucHV0IGNoYXJhY3RlciBvciB0b2tlbiB0eXBlIHRvIHRyYW5zaXRpb24gb25cbiAgICogQHJldHVybnMgez9TdGF0ZTxUPn0gdGhlIG5leHQgc3RhdGUsIGlmIGFueVxuICAgKi9cbiAgZ28oaW5wdXQpIHtcbiAgICBjb25zdCBzdGF0ZSA9IHRoaXM7XG4gICAgY29uc3QgbmV4dFN0YXRlID0gc3RhdGUualtpbnB1dF07XG4gICAgaWYgKG5leHRTdGF0ZSkge1xuICAgICAgcmV0dXJuIG5leHRTdGF0ZTtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdGF0ZS5qci5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgcmVnZXggPSBzdGF0ZS5qcltpXVswXTtcbiAgICAgIGNvbnN0IG5leHRTdGF0ZSA9IHN0YXRlLmpyW2ldWzFdOyAvLyBub3RlOiBtaWdodCBiZSBlbXB0eSB0byBwcmV2ZW50IGRlZmF1bHQganVtcFxuICAgICAgaWYgKG5leHRTdGF0ZSAmJiByZWdleC50ZXN0KGlucHV0KSkge1xuICAgICAgICByZXR1cm4gbmV4dFN0YXRlO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBOb3doZXJlIGxlZnQgdG8ganVtcCEgUmV0dXJuIGRlZmF1bHQsIGlmIGFueVxuICAgIHJldHVybiBzdGF0ZS5qZDtcbiAgfSxcbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIHN0YXRlIGhhcyBhIHRyYW5zaXRpb24gZm9yIHRoZSBnaXZlbiBpbnB1dC4gU2V0IHRoZSBzZWNvbmRcbiAgICogYXJndW1lbnQgdG8gdHJ1ZSB0byBvbmx5IGxvb2sgZm9yIGFuIGV4YWN0IG1hdGNoIChhbmQgbm90IGEgZGVmYXVsdCBvclxuICAgKiByZWd1bGFyLWV4cHJlc3Npb24tYmFzZWQgdHJhbnNpdGlvbilcbiAgICogQHBhcmFtIHtzdHJpbmd9IGlucHV0XG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gZXhhY3RPbmx5XG4gICAqL1xuICBoYXMoaW5wdXQsIGV4YWN0T25seSkge1xuICAgIGlmIChleGFjdE9ubHkgPT09IHZvaWQgMCkge1xuICAgICAgZXhhY3RPbmx5ID0gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBleGFjdE9ubHkgPyBpbnB1dCBpbiB0aGlzLmogOiAhIXRoaXMuZ28oaW5wdXQpO1xuICB9LFxuICAvKipcbiAgICogU2hvcnQgZm9yIFwidHJhbnNpdGlvbiBhbGxcIjsgY3JlYXRlIGEgdHJhbnNpdGlvbiBmcm9tIHRoZSBhcnJheSBvZiBpdGVtc1xuICAgKiBpbiB0aGUgZ2l2ZW4gbGlzdCB0byB0aGUgc2FtZSBmaW5hbCByZXN1bHRpbmcgc3RhdGUuXG4gICAqIEBwYXJhbSB7c3RyaW5nIHwgc3RyaW5nW119IGlucHV0cyBHcm91cCBvZiBpbnB1dHMgdG8gdHJhbnNpdGlvbiBvblxuICAgKiBAcGFyYW0ge1RyYW5zaXRpb248VD4gfCBTdGF0ZTxUPn0gW25leHRdIFRyYW5zaXRpb24gb3B0aW9uc1xuICAgKiBAcGFyYW0ge0ZsYWdzfSBbZmxhZ3NdIENvbGxlY3Rpb25zIGZsYWdzIHRvIGFkZCB0b2tlbiB0b1xuICAgKiBAcGFyYW0ge0NvbGxlY3Rpb25zPFQ+fSBbZ3JvdXBzXSBNYXN0ZXIgbGlzdCBvZiB0b2tlbiBncm91cHNcbiAgICovXG4gIHRhKGlucHV0cywgbmV4dCwgZmxhZ3MsIGdyb3Vwcykge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLnR0KGlucHV0c1tpXSwgbmV4dCwgZmxhZ3MsIGdyb3Vwcyk7XG4gICAgfVxuICB9LFxuICAvKipcbiAgICogU2hvcnQgZm9yIFwidGFrZSByZWdleHAgdHJhbnNpdGlvblwiOyBkZWZpbmVzIGEgdHJhbnNpdGlvbiBmb3IgdGhpcyBzdGF0ZVxuICAgKiB3aGVuIGl0IGVuY291bnRlcnMgYSB0b2tlbiB3aGljaCBtYXRjaGVzIHRoZSBnaXZlbiByZWd1bGFyIGV4cHJlc3Npb25cbiAgICogQHBhcmFtIHtSZWdFeHB9IHJlZ2V4cCBSZWd1bGFyIGV4cHJlc3Npb24gdHJhbnNpdGlvbiAocG9wdWxhdGUgZmlyc3QpXG4gICAqIEBwYXJhbSB7VCB8IFN0YXRlPFQ+fSBbbmV4dF0gVHJhbnNpdGlvbiBvcHRpb25zXG4gICAqIEBwYXJhbSB7RmxhZ3N9IFtmbGFnc10gQ29sbGVjdGlvbnMgZmxhZ3MgdG8gYWRkIHRva2VuIHRvXG4gICAqIEBwYXJhbSB7Q29sbGVjdGlvbnM8VD59IFtncm91cHNdIE1hc3RlciBsaXN0IG9mIHRva2VuIGdyb3Vwc1xuICAgKiBAcmV0dXJucyB7U3RhdGU8VD59IHRha2VuIGFmdGVyIHRoZSBnaXZlbiBpbnB1dFxuICAgKi9cbiAgdHIocmVnZXhwLCBuZXh0LCBmbGFncywgZ3JvdXBzKSB7XG4gICAgZ3JvdXBzID0gZ3JvdXBzIHx8IFN0YXRlLmdyb3VwcztcbiAgICBsZXQgbmV4dFN0YXRlO1xuICAgIGlmIChuZXh0ICYmIG5leHQuaikge1xuICAgICAgbmV4dFN0YXRlID0gbmV4dDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVG9rZW4gd2l0aCBtYXliZSB0b2tlbiBncm91cHNcbiAgICAgIG5leHRTdGF0ZSA9IG5ldyBTdGF0ZShuZXh0KTtcbiAgICAgIGlmIChmbGFncyAmJiBncm91cHMpIHtcbiAgICAgICAgYWRkVG9Hcm91cHMobmV4dCwgZmxhZ3MsIGdyb3Vwcyk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuanIucHVzaChbcmVnZXhwLCBuZXh0U3RhdGVdKTtcbiAgICByZXR1cm4gbmV4dFN0YXRlO1xuICB9LFxuICAvKipcbiAgICogU2hvcnQgZm9yIFwidGFrZSB0cmFuc2l0aW9uc1wiLCB3aWxsIHRha2UgYXMgbWFueSBzZXF1ZW50aWFsIHRyYW5zaXRpb25zIGFzXG4gICAqIHRoZSBsZW5ndGggb2YgdGhlIGdpdmVuIGlucHV0IGFuZCByZXR1cm5zIHRoZVxuICAgKiByZXN1bHRpbmcgZmluYWwgc3RhdGUuXG4gICAqIEBwYXJhbSB7c3RyaW5nIHwgc3RyaW5nW119IGlucHV0XG4gICAqIEBwYXJhbSB7VCB8IFN0YXRlPFQ+fSBbbmV4dF0gVHJhbnNpdGlvbiBvcHRpb25zXG4gICAqIEBwYXJhbSB7RmxhZ3N9IFtmbGFnc10gQ29sbGVjdGlvbnMgZmxhZ3MgdG8gYWRkIHRva2VuIHRvXG4gICAqIEBwYXJhbSB7Q29sbGVjdGlvbnM8VD59IFtncm91cHNdIE1hc3RlciBsaXN0IG9mIHRva2VuIGdyb3Vwc1xuICAgKiBAcmV0dXJucyB7U3RhdGU8VD59IHRha2VuIGFmdGVyIHRoZSBnaXZlbiBpbnB1dFxuICAgKi9cbiAgdHMoaW5wdXQsIG5leHQsIGZsYWdzLCBncm91cHMpIHtcbiAgICBsZXQgc3RhdGUgPSB0aGlzO1xuICAgIGNvbnN0IGxlbiA9IGlucHV0Lmxlbmd0aDtcbiAgICBpZiAoIWxlbikge1xuICAgICAgcmV0dXJuIHN0YXRlO1xuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbiAtIDE7IGkrKykge1xuICAgICAgc3RhdGUgPSBzdGF0ZS50dChpbnB1dFtpXSk7XG4gICAgfVxuICAgIHJldHVybiBzdGF0ZS50dChpbnB1dFtsZW4gLSAxXSwgbmV4dCwgZmxhZ3MsIGdyb3Vwcyk7XG4gIH0sXG4gIC8qKlxuICAgKiBTaG9ydCBmb3IgXCJ0YWtlIHRyYW5zaXRpb25cIiwgdGhpcyBpcyBhIG1ldGhvZCBmb3IgYnVpbGRpbmcvd29ya2luZyB3aXRoXG4gICAqIHN0YXRlIG1hY2hpbmVzLlxuICAgKlxuICAgKiBJZiBhIHN0YXRlIGFscmVhZHkgZXhpc3RzIGZvciB0aGUgZ2l2ZW4gaW5wdXQsIHJldHVybnMgaXQuXG4gICAqXG4gICAqIElmIGEgdG9rZW4gaXMgc3BlY2lmaWVkLCB0aGF0IHN0YXRlIHdpbGwgZW1pdCB0aGF0IHRva2VuIHdoZW4gcmVhY2hlZCBieVxuICAgKiB0aGUgbGlua2lmeSBlbmdpbmUuXG4gICAqXG4gICAqIElmIG5vIHN0YXRlIGV4aXN0cywgaXQgd2lsbCBiZSBpbml0aWFsaXplZCB3aXRoIHNvbWUgZGVmYXVsdCB0cmFuc2l0aW9uc1xuICAgKiB0aGF0IHJlc2VtYmxlIGV4aXN0aW5nIGRlZmF1bHQgdHJhbnNpdGlvbnMuXG4gICAqXG4gICAqIElmIGEgc3RhdGUgaXMgZ2l2ZW4gZm9yIHRoZSBzZWNvbmQgYXJndW1lbnQsIHRoYXQgc3RhdGUgd2lsbCBiZVxuICAgKiB0cmFuc2l0aW9uZWQgdG8gb24gdGhlIGdpdmVuIGlucHV0IHJlZ2FyZGxlc3Mgb2Ygd2hhdCB0aGF0IGlucHV0XG4gICAqIHByZXZpb3VzbHkgZGlkLlxuICAgKlxuICAgKiBTcGVjaWZ5IGEgdG9rZW4gZ3JvdXAgZmxhZ3MgdG8gZGVmaW5lIGdyb3VwcyB0aGF0IHRoaXMgdG9rZW4gYmVsb25ncyB0by5cbiAgICogVGhlIHRva2VuIHdpbGwgYmUgYWRkZWQgdG8gY29ycmVzcG9uZGluZyBlbnRpcmVzIGluIHRoZSBnaXZlbiBncm91cHNcbiAgICogb2JqZWN0LlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaW5wdXQgY2hhcmFjdGVyLCB0b2tlbiB0eXBlIHRvIHRyYW5zaXRpb24gb25cbiAgICogQHBhcmFtIHtUIHwgU3RhdGU8VD59IFtuZXh0XSBUcmFuc2l0aW9uIG9wdGlvbnNcbiAgICogQHBhcmFtIHtGbGFnc30gW2ZsYWdzXSBDb2xsZWN0aW9ucyBmbGFncyB0byBhZGQgdG9rZW4gdG9cbiAgICogQHBhcmFtIHtDb2xsZWN0aW9uczxUPn0gW2dyb3Vwc10gTWFzdGVyIGxpc3Qgb2YgZ3JvdXBzXG4gICAqIEByZXR1cm5zIHtTdGF0ZTxUPn0gdGFrZW4gYWZ0ZXIgdGhlIGdpdmVuIGlucHV0XG4gICAqL1xuICB0dChpbnB1dCwgbmV4dCwgZmxhZ3MsIGdyb3Vwcykge1xuICAgIGdyb3VwcyA9IGdyb3VwcyB8fCBTdGF0ZS5ncm91cHM7XG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzO1xuXG4gICAgLy8gQ2hlY2sgaWYgZXhpc3Rpbmcgc3RhdGUgZ2l2ZW4sIGp1c3QgYSBiYXNpYyB0cmFuc2l0aW9uXG4gICAgaWYgKG5leHQgJiYgbmV4dC5qKSB7XG4gICAgICBzdGF0ZS5qW2lucHV0XSA9IG5leHQ7XG4gICAgICByZXR1cm4gbmV4dDtcbiAgICB9XG4gICAgY29uc3QgdCA9IG5leHQ7XG5cbiAgICAvLyBUYWtlIHRoZSB0cmFuc2l0aW9uIHdpdGggdGhlIHVzdWFsIGRlZmF1bHQgbWVjaGFuaXNtcyBhbmQgdXNlIHRoYXQgYXNcbiAgICAvLyBhIHRlbXBsYXRlIGZvciBjcmVhdGluZyB0aGUgbmV4dCBzdGF0ZVxuICAgIGxldCBuZXh0U3RhdGUsXG4gICAgICB0ZW1wbGF0ZVN0YXRlID0gc3RhdGUuZ28oaW5wdXQpO1xuICAgIGlmICh0ZW1wbGF0ZVN0YXRlKSB7XG4gICAgICBuZXh0U3RhdGUgPSBuZXcgU3RhdGUoKTtcbiAgICAgIGFzc2lnbihuZXh0U3RhdGUuaiwgdGVtcGxhdGVTdGF0ZS5qKTtcbiAgICAgIG5leHRTdGF0ZS5qci5wdXNoLmFwcGx5KG5leHRTdGF0ZS5qciwgdGVtcGxhdGVTdGF0ZS5qcik7XG4gICAgICBuZXh0U3RhdGUuamQgPSB0ZW1wbGF0ZVN0YXRlLmpkO1xuICAgICAgbmV4dFN0YXRlLnQgPSB0ZW1wbGF0ZVN0YXRlLnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5leHRTdGF0ZSA9IG5ldyBTdGF0ZSgpO1xuICAgIH1cbiAgICBpZiAodCkge1xuICAgICAgLy8gRW5zdXJlIG5ld2x5IHRva2VuIGlzIGluIHRoZSBzYW1lIGdyb3VwcyBhcyB0aGUgb2xkIHRva2VuXG4gICAgICBpZiAoZ3JvdXBzKSB7XG4gICAgICAgIGlmIChuZXh0U3RhdGUudCAmJiB0eXBlb2YgbmV4dFN0YXRlLnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgY29uc3QgYWxsRmxhZ3MgPSBhc3NpZ24oZmxhZ3NGb3JUb2tlbihuZXh0U3RhdGUudCwgZ3JvdXBzKSwgZmxhZ3MpO1xuICAgICAgICAgIGFkZFRvR3JvdXBzKHQsIGFsbEZsYWdzLCBncm91cHMpO1xuICAgICAgICB9IGVsc2UgaWYgKGZsYWdzKSB7XG4gICAgICAgICAgYWRkVG9Hcm91cHModCwgZmxhZ3MsIGdyb3Vwcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG5leHRTdGF0ZS50ID0gdDsgLy8gb3ZlcndyaXRlIGFueXRoaW5nIHRoYXQgd2FzIHByZXZpb3VzbHkgdGhlcmVcbiAgICB9XG5cbiAgICBzdGF0ZS5qW2lucHV0XSA9IG5leHRTdGF0ZTtcbiAgICByZXR1cm4gbmV4dFN0YXRlO1xuICB9XG59O1xuXG4vLyBIZWxwZXIgZnVuY3Rpb25zIHRvIGltcHJvdmUgbWluaWZpY2F0aW9uIChub3QgZXhwb3J0ZWQgb3V0c2lkZSBsaW5raWZ5anMgbW9kdWxlKVxuXG4vKipcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0ge1N0YXRlPFQ+fSBzdGF0ZVxuICogQHBhcmFtIHtzdHJpbmcgfCBzdHJpbmdbXX0gaW5wdXRcbiAqIEBwYXJhbSB7RmxhZ3N9IFtmbGFnc11cbiAqIEBwYXJhbSB7Q29sbGVjdGlvbnM8VD59IFtncm91cHNdXG4gKi9cbmNvbnN0IHRhID0gKHN0YXRlLCBpbnB1dCwgbmV4dCwgZmxhZ3MsIGdyb3VwcykgPT4gc3RhdGUudGEoaW5wdXQsIG5leHQsIGZsYWdzLCBncm91cHMpO1xuXG4vKipcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0ge1N0YXRlPFQ+fSBzdGF0ZVxuICogQHBhcmFtIHtSZWdFeHB9IHJlZ2V4cFxuICogQHBhcmFtIHtUIHwgU3RhdGU8VD59IFtuZXh0XVxuICogQHBhcmFtIHtGbGFnc30gW2ZsYWdzXVxuICogQHBhcmFtIHtDb2xsZWN0aW9uczxUPn0gW2dyb3Vwc11cbiAqL1xuY29uc3QgdHIgPSAoc3RhdGUsIHJlZ2V4cCwgbmV4dCwgZmxhZ3MsIGdyb3VwcykgPT4gc3RhdGUudHIocmVnZXhwLCBuZXh0LCBmbGFncywgZ3JvdXBzKTtcblxuLyoqXG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHtTdGF0ZTxUPn0gc3RhdGVcbiAqIEBwYXJhbSB7c3RyaW5nIHwgc3RyaW5nW119IGlucHV0XG4gKiBAcGFyYW0ge1QgfCBTdGF0ZTxUPn0gW25leHRdXG4gKiBAcGFyYW0ge0ZsYWdzfSBbZmxhZ3NdXG4gKiBAcGFyYW0ge0NvbGxlY3Rpb25zPFQ+fSBbZ3JvdXBzXVxuICovXG5jb25zdCB0cyA9IChzdGF0ZSwgaW5wdXQsIG5leHQsIGZsYWdzLCBncm91cHMpID0+IHN0YXRlLnRzKGlucHV0LCBuZXh0LCBmbGFncywgZ3JvdXBzKTtcblxuLyoqXG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHtTdGF0ZTxUPn0gc3RhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBpbnB1dFxuICogQHBhcmFtIHtUIHwgU3RhdGU8VD59IFtuZXh0XVxuICogQHBhcmFtIHtDb2xsZWN0aW9uczxUPn0gW2dyb3Vwc11cbiAqIEBwYXJhbSB7RmxhZ3N9IFtmbGFnc11cbiAqL1xuY29uc3QgdHQgPSAoc3RhdGUsIGlucHV0LCBuZXh0LCBmbGFncywgZ3JvdXBzKSA9PiBzdGF0ZS50dChpbnB1dCwgbmV4dCwgZmxhZ3MsIGdyb3Vwcyk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblRleHQgVG9rZW5zXG5JZGVudGlmaWVycyBmb3IgdG9rZW4gb3V0cHV0cyBmcm9tIHRoZSByZWdleHAgc2Nhbm5lclxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4vLyBBIHZhbGlkIHdlYiBkb21haW4gdG9rZW5cbmNvbnN0IFdPUkQgPSAnV09SRCc7IC8vIG9ubHkgY29udGFpbnMgYS16XG5jb25zdCBVV09SRCA9ICdVV09SRCc7IC8vIGNvbnRhaW5zIGxldHRlcnMgb3RoZXIgdGhhbiBhLXosIHVzZWQgZm9yIElETlxuXG4vLyBTcGVjaWFsIGNhc2Ugb2Ygd29yZFxuY29uc3QgTE9DQUxIT1NUID0gJ0xPQ0FMSE9TVCc7XG5cbi8vIFZhbGlkIHRvcC1sZXZlbCBkb21haW4sIHNwZWNpYWwgY2FzZSBvZiBXT1JEIChzZWUgdGxkcy5qcylcbmNvbnN0IFRMRCA9ICdUTEQnO1xuXG4vLyBWYWxpZCBJRE4gVExELCBzcGVjaWFsIGNhc2Ugb2YgVVdPUkQgKHNlZSB0bGRzLmpzKVxuY29uc3QgVVRMRCA9ICdVVExEJztcblxuLy8gVGhlIHNjaGVtZSBwb3J0aW9uIG9mIGEgd2ViIFVSSSBwcm90b2NvbC4gU3VwcG9ydGVkIHR5cGVzIGluY2x1ZGU6IGBtYWlsdG9gLFxuLy8gYGZpbGVgLCBhbmQgdXNlci1kZWZpbmVkIGN1c3RvbSBwcm90b2NvbHMuIExpbWl0ZWQgdG8gc2NoZW1lcyB0aGF0IGNvbnRhaW5cbi8vIG9ubHkgbGV0dGVyc1xuY29uc3QgU0NIRU1FID0gJ1NDSEVNRSc7XG5cbi8vIFNpbWlsYXIgdG8gU0NIRU1FLCBleGNlcHQgbWFrZXMgZGlzdGluY3Rpb24gZm9yIHNjaGVtZXMgdGhhdCBtdXN0IGFsd2F5cyBiZVxuLy8gZm9sbG93ZWQgYnkgYDovL2AsIG5vdCBqdXN0IGA6YC4gU3VwcG9ydGVkIHR5cGVzIGluY2x1ZGUgYGh0dHBgLCBgaHR0cHNgLFxuLy8gYGZ0cGAsIGBmdHBzYFxuY29uc3QgU0xBU0hfU0NIRU1FID0gJ1NMQVNIX1NDSEVNRSc7XG5cbi8vIEFueSBzZXF1ZW5jZSBvZiBkaWdpdHMgMC05XG5jb25zdCBOVU0gPSAnTlVNJztcblxuLy8gQW55IG51bWJlciBvZiBjb25zZWN1dGl2ZSB3aGl0ZXNwYWNlIGNoYXJhY3RlcnMgdGhhdCBhcmUgbm90IG5ld2xpbmVcbmNvbnN0IFdTID0gJ1dTJztcblxuLy8gTmV3IGxpbmUgKHVuaXggc3R5bGUpXG5jb25zdCBOTCQxID0gJ05MJzsgLy8gXFxuXG5cbi8vIE9wZW5pbmcvY2xvc2luZyBicmFja2V0IGNsYXNzZXNcbmNvbnN0IE9QRU5CUkFDRSA9ICdPUEVOQlJBQ0UnOyAvLyB7XG5jb25zdCBPUEVOQlJBQ0tFVCA9ICdPUEVOQlJBQ0tFVCc7IC8vIFtcbmNvbnN0IE9QRU5BTkdMRUJSQUNLRVQgPSAnT1BFTkFOR0xFQlJBQ0tFVCc7IC8vIDxcbmNvbnN0IE9QRU5QQVJFTiA9ICdPUEVOUEFSRU4nOyAvLyAoXG5jb25zdCBDTE9TRUJSQUNFID0gJ0NMT1NFQlJBQ0UnOyAvLyB9XG5jb25zdCBDTE9TRUJSQUNLRVQgPSAnQ0xPU0VCUkFDS0VUJzsgLy8gXVxuY29uc3QgQ0xPU0VBTkdMRUJSQUNLRVQgPSAnQ0xPU0VBTkdMRUJSQUNLRVQnOyAvLyA+XG5jb25zdCBDTE9TRVBBUkVOID0gJ0NMT1NFUEFSRU4nOyAvLyApXG5cbi8vIFZhcmlvdXMgc3ltYm9sc1xuY29uc3QgQU1QRVJTQU5EID0gJ0FNUEVSU0FORCc7IC8vICZcbmNvbnN0IEFQT1NUUk9QSEUgPSAnQVBPU1RST1BIRSc7IC8vICdcbmNvbnN0IEFTVEVSSVNLID0gJ0FTVEVSSVNLJzsgLy8gKlxuY29uc3QgQVQgPSAnQVQnOyAvLyBAXG5jb25zdCBCQUNLU0xBU0ggPSAnQkFDS1NMQVNIJzsgLy8gXFxcbmNvbnN0IEJBQ0tUSUNLID0gJ0JBQ0tUSUNLJzsgLy8gYFxuY29uc3QgQ0FSRVQgPSAnQ0FSRVQnOyAvLyBeXG5jb25zdCBDT0xPTiA9ICdDT0xPTic7IC8vIDpcbmNvbnN0IENPTU1BID0gJ0NPTU1BJzsgLy8gLFxuY29uc3QgRE9MTEFSID0gJ0RPTExBUic7IC8vICRcbmNvbnN0IERPVCA9ICdET1QnOyAvLyAuXG5jb25zdCBFUVVBTFMgPSAnRVFVQUxTJzsgLy8gPVxuY29uc3QgRVhDTEFNQVRJT04gPSAnRVhDTEFNQVRJT04nOyAvLyAhXG5jb25zdCBIWVBIRU4gPSAnSFlQSEVOJzsgLy8gLVxuY29uc3QgUEVSQ0VOVCA9ICdQRVJDRU5UJzsgLy8gJVxuY29uc3QgUElQRSA9ICdQSVBFJzsgLy8gfFxuY29uc3QgUExVUyA9ICdQTFVTJzsgLy8gK1xuY29uc3QgUE9VTkQgPSAnUE9VTkQnOyAvLyAjXG5jb25zdCBRVUVSWSA9ICdRVUVSWSc7IC8vID9cbmNvbnN0IFFVT1RFID0gJ1FVT1RFJzsgLy8gXCJcblxuY29uc3QgU0VNSSA9ICdTRU1JJzsgLy8gO1xuY29uc3QgU0xBU0ggPSAnU0xBU0gnOyAvLyAvXG5jb25zdCBUSUxERSA9ICdUSUxERSc7IC8vIH5cbmNvbnN0IFVOREVSU0NPUkUgPSAnVU5ERVJTQ09SRSc7IC8vIF9cblxuLy8gRW1vamkgc3ltYm9sXG5jb25zdCBFTU9KSSQxID0gJ0VNT0pJJztcblxuLy8gRGVmYXVsdCB0b2tlbiAtIGFueXRoaW5nIHRoYXQgaXMgbm90IG9uZSBvZiB0aGUgYWJvdmVcbmNvbnN0IFNZTSA9ICdTWU0nO1xuXG52YXIgdGsgPSAvKiNfX1BVUkVfXyovT2JqZWN0LmZyZWV6ZSh7XG5cdF9fcHJvdG9fXzogbnVsbCxcblx0V09SRDogV09SRCxcblx0VVdPUkQ6IFVXT1JELFxuXHRMT0NBTEhPU1Q6IExPQ0FMSE9TVCxcblx0VExEOiBUTEQsXG5cdFVUTEQ6IFVUTEQsXG5cdFNDSEVNRTogU0NIRU1FLFxuXHRTTEFTSF9TQ0hFTUU6IFNMQVNIX1NDSEVNRSxcblx0TlVNOiBOVU0sXG5cdFdTOiBXUyxcblx0Tkw6IE5MJDEsXG5cdE9QRU5CUkFDRTogT1BFTkJSQUNFLFxuXHRPUEVOQlJBQ0tFVDogT1BFTkJSQUNLRVQsXG5cdE9QRU5BTkdMRUJSQUNLRVQ6IE9QRU5BTkdMRUJSQUNLRVQsXG5cdE9QRU5QQVJFTjogT1BFTlBBUkVOLFxuXHRDTE9TRUJSQUNFOiBDTE9TRUJSQUNFLFxuXHRDTE9TRUJSQUNLRVQ6IENMT1NFQlJBQ0tFVCxcblx0Q0xPU0VBTkdMRUJSQUNLRVQ6IENMT1NFQU5HTEVCUkFDS0VULFxuXHRDTE9TRVBBUkVOOiBDTE9TRVBBUkVOLFxuXHRBTVBFUlNBTkQ6IEFNUEVSU0FORCxcblx0QVBPU1RST1BIRTogQVBPU1RST1BIRSxcblx0QVNURVJJU0s6IEFTVEVSSVNLLFxuXHRBVDogQVQsXG5cdEJBQ0tTTEFTSDogQkFDS1NMQVNILFxuXHRCQUNLVElDSzogQkFDS1RJQ0ssXG5cdENBUkVUOiBDQVJFVCxcblx0Q09MT046IENPTE9OLFxuXHRDT01NQTogQ09NTUEsXG5cdERPTExBUjogRE9MTEFSLFxuXHRET1Q6IERPVCxcblx0RVFVQUxTOiBFUVVBTFMsXG5cdEVYQ0xBTUFUSU9OOiBFWENMQU1BVElPTixcblx0SFlQSEVOOiBIWVBIRU4sXG5cdFBFUkNFTlQ6IFBFUkNFTlQsXG5cdFBJUEU6IFBJUEUsXG5cdFBMVVM6IFBMVVMsXG5cdFBPVU5EOiBQT1VORCxcblx0UVVFUlk6IFFVRVJZLFxuXHRRVU9URTogUVVPVEUsXG5cdFNFTUk6IFNFTUksXG5cdFNMQVNIOiBTTEFTSCxcblx0VElMREU6IFRJTERFLFxuXHRVTkRFUlNDT1JFOiBVTkRFUlNDT1JFLFxuXHRFTU9KSTogRU1PSkkkMSxcblx0U1lNOiBTWU1cbn0pO1xuXG4vLyBOb3RlIHRoYXQgdGhlc2UgdHdvIFVuaWNvZGUgb25lcyBleHBhbmQgaW50byBhIHJlYWxseSBiaWcgb25lIHdpdGggQmFiZWxcbmNvbnN0IEFTQ0lJX0xFVFRFUiA9IC9bYS16XS87XG5jb25zdCBMRVRURVIgPSAvXFxwe0x9L3U7IC8vIEFueSBVbmljb2RlIGNoYXJhY3RlciB3aXRoIGxldHRlciBkYXRhIHR5cGVcbmNvbnN0IEVNT0pJID0gL1xccHtFbW9qaX0vdTsgLy8gQW55IFVuaWNvZGUgZW1vamkgY2hhcmFjdGVyXG5jb25zdCBFTU9KSV9WQVJJQVRJT04kMSA9IC9cXHVmZTBmLztcbmNvbnN0IERJR0lUID0gL1xcZC87XG5jb25zdCBTUEFDRSA9IC9cXHMvO1xuXG52YXIgcmVnZXhwID0gLyojX19QVVJFX18qL09iamVjdC5mcmVlemUoe1xuXHRfX3Byb3RvX186IG51bGwsXG5cdEFTQ0lJX0xFVFRFUjogQVNDSUlfTEVUVEVSLFxuXHRMRVRURVI6IExFVFRFUixcblx0RU1PSkk6IEVNT0pJLFxuXHRFTU9KSV9WQVJJQVRJT046IEVNT0pJX1ZBUklBVElPTiQxLFxuXHRESUdJVDogRElHSVQsXG5cdFNQQUNFOiBTUEFDRVxufSk7XG5cbi8qKlxuXHRUaGUgc2Nhbm5lciBwcm92aWRlcyBhbiBpbnRlcmZhY2UgdGhhdCB0YWtlcyBhIHN0cmluZyBvZiB0ZXh0IGFzIGlucHV0LCBhbmRcblx0b3V0cHV0cyBhbiBhcnJheSBvZiB0b2tlbnMgaW5zdGFuY2VzIHRoYXQgY2FuIGJlIHVzZWQgZm9yIGVhc3kgVVJMIHBhcnNpbmcuXG4qL1xuY29uc3QgTkwgPSAnXFxuJzsgLy8gTmV3IGxpbmUgY2hhcmFjdGVyXG5jb25zdCBFTU9KSV9WQVJJQVRJT04gPSAnXFx1ZmUwZic7IC8vIFZhcmlhdGlvbiBzZWxlY3RvciwgZm9sbG93cyBoZWFydCBhbmQgb3RoZXJzXG5jb25zdCBFTU9KSV9KT0lORVIgPSAnXFx1MjAwZCc7IC8vIHplcm8td2lkdGggam9pbmVyXG5cbmxldCB0bGRzID0gbnVsbCxcbiAgdXRsZHMgPSBudWxsOyAvLyBkb24ndCBjaGFuZ2Ugc28gb25seSBoYXZlIHRvIGJlIGNvbXB1dGVkIG9uY2VcblxuLyoqXG4gKiBTY2FubmVyIG91dHB1dCB0b2tlbjpcbiAqIC0gYHRgIGlzIHRoZSB0b2tlbiBuYW1lIChlLmcuLCAnTlVNJywgJ0VNT0pJJywgJ1RMRCcpXG4gKiAtIGB2YCBpcyB0aGUgdmFsdWUgb2YgdGhlIHRva2VuIChlLmcuLCAnMTIzJywgJ1x1Mjc2NFx1RkUwRicsICdjb20nKVxuICogLSBgc2AgaXMgdGhlIHN0YXJ0IGluZGV4IG9mIHRoZSB0b2tlbiBpbiB0aGUgb3JpZ2luYWwgc3RyaW5nXG4gKiAtIGBlYCBpcyB0aGUgZW5kIGluZGV4IG9mIHRoZSB0b2tlbiBpbiB0aGUgb3JpZ2luYWwgc3RyaW5nXG4gKiBAdHlwZWRlZiB7e3Q6IHN0cmluZywgdjogc3RyaW5nLCBzOiBudW1iZXIsIGU6IG51bWJlcn19IFRva2VuXG4gKi9cblxuLyoqXG4gKiBAdGVtcGxhdGUgVFxuICogQHR5cGVkZWYge3sgW2NvbGxlY3Rpb246IHN0cmluZ106IFRbXSB9fSBDb2xsZWN0aW9uc1xuICovXG5cbi8qKlxuICogSW5pdGlhbGl6ZSB0aGUgc2Nhbm5lciBjaGFyYWN0ZXItYmFzZWQgc3RhdGUgbWFjaGluZSBmb3IgdGhlIGdpdmVuIHN0YXJ0XG4gKiBzdGF0ZVxuICogQHBhcmFtIHtbc3RyaW5nLCBib29sZWFuXVtdfSBjdXN0b21TY2hlbWVzIExpc3Qgb2YgY3VzdG9tIHNjaGVtZXMsIHdoZXJlIGVhY2hcbiAqIGl0ZW0gaXMgYSBsZW5ndGgtMiB0dXBsZSB3aXRoIHRoZSBmaXJzdCBlbGVtZW50IHNldCB0byB0aGUgc3RyaW5nIHNjaGVtZSwgYW5kXG4gKiB0aGUgc2Vjb25kIGVsZW1lbnQgc2V0IHRvIGB0cnVlYCBpZiB0aGUgYDovL2AgYWZ0ZXIgdGhlIHNjaGVtZSBpcyBvcHRpb25hbFxuICovXG5mdW5jdGlvbiBpbml0JDIoY3VzdG9tU2NoZW1lcykge1xuICBpZiAoY3VzdG9tU2NoZW1lcyA9PT0gdm9pZCAwKSB7XG4gICAgY3VzdG9tU2NoZW1lcyA9IFtdO1xuICB9XG4gIC8vIEZyZXF1ZW50bHkgdXNlZCBzdGF0ZXMgKG5hbWUgYXJndW1lbnQgcmVtb3ZlZCBkdXJpbmcgbWluaWZpY2F0aW9uKVxuICAvKiogQHR5cGUgQ29sbGVjdGlvbnM8c3RyaW5nPiAqL1xuICBjb25zdCBncm91cHMgPSB7fTsgLy8gb2YgdG9rZW5zXG4gIFN0YXRlLmdyb3VwcyA9IGdyb3VwcztcbiAgLyoqIEB0eXBlIFN0YXRlPHN0cmluZz4gKi9cbiAgY29uc3QgU3RhcnQgPSBuZXcgU3RhdGUoKTtcbiAgaWYgKHRsZHMgPT0gbnVsbCkge1xuICAgIHRsZHMgPSBkZWNvZGVUbGRzKGVuY29kZWRUbGRzKTtcbiAgfVxuICBpZiAodXRsZHMgPT0gbnVsbCkge1xuICAgIHV0bGRzID0gZGVjb2RlVGxkcyhlbmNvZGVkVXRsZHMpO1xuICB9XG5cbiAgLy8gU3RhdGVzIGZvciBzcGVjaWFsIFVSTCBzeW1ib2xzIHRoYXQgYWNjZXB0IGltbWVkaWF0ZWx5IGFmdGVyIHN0YXJ0XG4gIHR0KFN0YXJ0LCBcIidcIiwgQVBPU1RST1BIRSk7XG4gIHR0KFN0YXJ0LCAneycsIE9QRU5CUkFDRSk7XG4gIHR0KFN0YXJ0LCAnWycsIE9QRU5CUkFDS0VUKTtcbiAgdHQoU3RhcnQsICc8JywgT1BFTkFOR0xFQlJBQ0tFVCk7XG4gIHR0KFN0YXJ0LCAnKCcsIE9QRU5QQVJFTik7XG4gIHR0KFN0YXJ0LCAnfScsIENMT1NFQlJBQ0UpO1xuICB0dChTdGFydCwgJ10nLCBDTE9TRUJSQUNLRVQpO1xuICB0dChTdGFydCwgJz4nLCBDTE9TRUFOR0xFQlJBQ0tFVCk7XG4gIHR0KFN0YXJ0LCAnKScsIENMT1NFUEFSRU4pO1xuICB0dChTdGFydCwgJyYnLCBBTVBFUlNBTkQpO1xuICB0dChTdGFydCwgJyonLCBBU1RFUklTSyk7XG4gIHR0KFN0YXJ0LCAnQCcsIEFUKTtcbiAgdHQoU3RhcnQsICdgJywgQkFDS1RJQ0spO1xuICB0dChTdGFydCwgJ14nLCBDQVJFVCk7XG4gIHR0KFN0YXJ0LCAnOicsIENPTE9OKTtcbiAgdHQoU3RhcnQsICcsJywgQ09NTUEpO1xuICB0dChTdGFydCwgJyQnLCBET0xMQVIpO1xuICB0dChTdGFydCwgJy4nLCBET1QpO1xuICB0dChTdGFydCwgJz0nLCBFUVVBTFMpO1xuICB0dChTdGFydCwgJyEnLCBFWENMQU1BVElPTik7XG4gIHR0KFN0YXJ0LCAnLScsIEhZUEhFTik7XG4gIHR0KFN0YXJ0LCAnJScsIFBFUkNFTlQpO1xuICB0dChTdGFydCwgJ3wnLCBQSVBFKTtcbiAgdHQoU3RhcnQsICcrJywgUExVUyk7XG4gIHR0KFN0YXJ0LCAnIycsIFBPVU5EKTtcbiAgdHQoU3RhcnQsICc/JywgUVVFUlkpO1xuICB0dChTdGFydCwgJ1wiJywgUVVPVEUpO1xuICB0dChTdGFydCwgJy8nLCBTTEFTSCk7XG4gIHR0KFN0YXJ0LCAnOycsIFNFTUkpO1xuICB0dChTdGFydCwgJ34nLCBUSUxERSk7XG4gIHR0KFN0YXJ0LCAnXycsIFVOREVSU0NPUkUpO1xuICB0dChTdGFydCwgJ1xcXFwnLCBCQUNLU0xBU0gpO1xuICBjb25zdCBOdW0gPSB0cihTdGFydCwgRElHSVQsIE5VTSwge1xuICAgIFtudW1lcmljXTogdHJ1ZVxuICB9KTtcbiAgdHIoTnVtLCBESUdJVCwgTnVtKTtcblxuICAvLyBTdGF0ZSB3aGljaCBlbWl0cyBhIHdvcmQgdG9rZW5cbiAgY29uc3QgV29yZCA9IHRyKFN0YXJ0LCBBU0NJSV9MRVRURVIsIFdPUkQsIHtcbiAgICBbYXNjaWldOiB0cnVlXG4gIH0pO1xuICB0cihXb3JkLCBBU0NJSV9MRVRURVIsIFdvcmQpO1xuXG4gIC8vIFNhbWUgYXMgcHJldmlvdXMsIGJ1dCBzcGVjaWZpYyB0byBub24tZnNtLmFzY2lpIGFscGhhYmV0IHdvcmRzXG4gIGNvbnN0IFVXb3JkID0gdHIoU3RhcnQsIExFVFRFUiwgVVdPUkQsIHtcbiAgICBbYWxwaGFdOiB0cnVlXG4gIH0pO1xuICB0cihVV29yZCwgQVNDSUlfTEVUVEVSKTsgLy8gTm9uLWFjY2VwdGluZ1xuICB0cihVV29yZCwgTEVUVEVSLCBVV29yZCk7XG5cbiAgLy8gV2hpdGVzcGFjZSBqdW1wc1xuICAvLyBUb2tlbnMgb2Ygb25seSBub24tbmV3bGluZSB3aGl0ZXNwYWNlIGFyZSBhcmJpdHJhcmlseSBsb25nXG4gIC8vIElmIGFueSB3aGl0ZXNwYWNlIGV4Y2VwdCBuZXdsaW5lLCBtb3JlIHdoaXRlc3BhY2UhXG4gIGNvbnN0IFdzID0gdHIoU3RhcnQsIFNQQUNFLCBXUywge1xuICAgIFt3aGl0ZXNwYWNlXTogdHJ1ZVxuICB9KTtcbiAgdHQoU3RhcnQsIE5MLCBOTCQxLCB7XG4gICAgW3doaXRlc3BhY2VdOiB0cnVlXG4gIH0pO1xuICB0dChXcywgTkwpOyAvLyBub24tYWNjZXB0aW5nIHN0YXRlIHRvIGF2b2lkIG1peGluZyB3aGl0ZXNwYWNlc1xuICB0cihXcywgU1BBQ0UsIFdzKTtcblxuICAvLyBFbW9qaSB0b2tlbnMuIFRoZXkgYXJlIG5vdCBncm91cGVkIGJ5IHRoZSBzY2FubmVyIGV4Y2VwdCBpbiBjYXNlcyB3aGVyZSBhXG4gIC8vIHplcm8td2lkdGggam9pbmVyIGlzIHByZXNlbnRcbiAgY29uc3QgRW1vamkgPSB0cihTdGFydCwgRU1PSkksIEVNT0pJJDEsIHtcbiAgICBbZW1vamldOiB0cnVlXG4gIH0pO1xuICB0cihFbW9qaSwgRU1PSkksIEVtb2ppKTtcbiAgdHQoRW1vamksIEVNT0pJX1ZBUklBVElPTiwgRW1vamkpO1xuICAvLyB0dChTdGFydCwgRU1PSklfVkFSSUFUSU9OLCBFbW9qaSk7IC8vIFRoaXMgb25lIGlzIHNrZXRjaHlcblxuICBjb25zdCBFbW9qaUpvaW5lciA9IHR0KEVtb2ppLCBFTU9KSV9KT0lORVIpO1xuICB0cihFbW9qaUpvaW5lciwgRU1PSkksIEVtb2ppKTtcbiAgLy8gdHQoRW1vamlKb2luZXIsIEVNT0pJX1ZBUklBVElPTiwgRW1vamkpOyAvLyBhbHNvIHNrZXRjaHlcblxuICAvLyBHZW5lcmF0ZXMgc3RhdGVzIGZvciB0b3AtbGV2ZWwgZG9tYWluc1xuICAvLyBOb3RlIHRoYXQgdGhpcyBpcyBtb3N0IGFjY3VyYXRlIHdoZW4gdGxkcyBhcmUgaW4gYWxwaGFiZXRpY2FsIG9yZGVyXG4gIGNvbnN0IHdvcmRqciA9IFtbQVNDSUlfTEVUVEVSLCBXb3JkXV07XG4gIGNvbnN0IHV3b3JkanIgPSBbW0FTQ0lJX0xFVFRFUiwgbnVsbF0sIFtMRVRURVIsIFVXb3JkXV07XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdGxkcy5sZW5ndGg7IGkrKykge1xuICAgIGZhc3R0cyhTdGFydCwgdGxkc1tpXSwgVExELCBXT1JELCB3b3JkanIpO1xuICB9XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdXRsZHMubGVuZ3RoOyBpKyspIHtcbiAgICBmYXN0dHMoU3RhcnQsIHV0bGRzW2ldLCBVVExELCBVV09SRCwgdXdvcmRqcik7XG4gIH1cbiAgYWRkVG9Hcm91cHMoVExELCB7XG4gICAgdGxkOiB0cnVlLFxuICAgIGFzY2lpOiB0cnVlXG4gIH0sIGdyb3Vwcyk7XG4gIGFkZFRvR3JvdXBzKFVUTEQsIHtcbiAgICB1dGxkOiB0cnVlLFxuICAgIGFscGhhOiB0cnVlXG4gIH0sIGdyb3Vwcyk7XG5cbiAgLy8gQ29sbGVjdCB0aGUgc3RhdGVzIGdlbmVyYXRlZCBieSBkaWZmZXJlbnQgcHJvdG9jb2xzLiBOT1RFOiBJZiBhbnkgbmV3IFRMRHNcbiAgLy8gZ2V0IGFkZGVkIHRoYXQgYXJlIGFsc28gcHJvdG9jb2xzLCBzZXQgdGhlIHRva2VuIHRvIGJlIHRoZSBzYW1lIGFzIHRoZVxuICAvLyBwcm90b2NvbCB0byBlbnN1cmUgcGFyc2luZyB3b3JrcyBhcyBleHBlY3RlZC5cbiAgZmFzdHRzKFN0YXJ0LCAnZmlsZScsIFNDSEVNRSwgV09SRCwgd29yZGpyKTtcbiAgZmFzdHRzKFN0YXJ0LCAnbWFpbHRvJywgU0NIRU1FLCBXT1JELCB3b3JkanIpO1xuICBmYXN0dHMoU3RhcnQsICdodHRwJywgU0xBU0hfU0NIRU1FLCBXT1JELCB3b3JkanIpO1xuICBmYXN0dHMoU3RhcnQsICdodHRwcycsIFNMQVNIX1NDSEVNRSwgV09SRCwgd29yZGpyKTtcbiAgZmFzdHRzKFN0YXJ0LCAnZnRwJywgU0xBU0hfU0NIRU1FLCBXT1JELCB3b3JkanIpO1xuICBmYXN0dHMoU3RhcnQsICdmdHBzJywgU0xBU0hfU0NIRU1FLCBXT1JELCB3b3JkanIpO1xuICBhZGRUb0dyb3VwcyhTQ0hFTUUsIHtcbiAgICBzY2hlbWU6IHRydWUsXG4gICAgYXNjaWk6IHRydWVcbiAgfSwgZ3JvdXBzKTtcbiAgYWRkVG9Hcm91cHMoU0xBU0hfU0NIRU1FLCB7XG4gICAgc2xhc2hzY2hlbWU6IHRydWUsXG4gICAgYXNjaWk6IHRydWVcbiAgfSwgZ3JvdXBzKTtcblxuICAvLyBSZWdpc3RlciBjdXN0b20gc2NoZW1lcy4gQXNzdW1lcyBlYWNoIHNjaGVtZSBpcyBhc2NpaW51bWVyaWMgd2l0aCBoeXBoZW5zXG4gIGN1c3RvbVNjaGVtZXMgPSBjdXN0b21TY2hlbWVzLnNvcnQoKGEsIGIpID0+IGFbMF0gPiBiWzBdID8gMSA6IC0xKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjdXN0b21TY2hlbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3Qgc2NoID0gY3VzdG9tU2NoZW1lc1tpXVswXTtcbiAgICBjb25zdCBvcHRpb25hbFNsYXNoU2xhc2ggPSBjdXN0b21TY2hlbWVzW2ldWzFdO1xuICAgIGNvbnN0IGZsYWdzID0gb3B0aW9uYWxTbGFzaFNsYXNoID8ge1xuICAgICAgW3NjaGVtZV06IHRydWVcbiAgICB9IDoge1xuICAgICAgW3NsYXNoc2NoZW1lXTogdHJ1ZVxuICAgIH07XG4gICAgaWYgKHNjaC5pbmRleE9mKCctJykgPj0gMCkge1xuICAgICAgZmxhZ3NbZG9tYWluXSA9IHRydWU7XG4gICAgfSBlbHNlIGlmICghQVNDSUlfTEVUVEVSLnRlc3Qoc2NoKSkge1xuICAgICAgZmxhZ3NbbnVtZXJpY10gPSB0cnVlOyAvLyBudW1iZXJzIG9ubHlcbiAgICB9IGVsc2UgaWYgKERJR0lULnRlc3Qoc2NoKSkge1xuICAgICAgZmxhZ3NbYXNjaWludW1lcmljXSA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZsYWdzW2FzY2lpXSA9IHRydWU7XG4gICAgfVxuICAgIHRzKFN0YXJ0LCBzY2gsIHNjaCwgZmxhZ3MpO1xuICB9XG5cbiAgLy8gTG9jYWxob3N0IHRva2VuXG4gIHRzKFN0YXJ0LCAnbG9jYWxob3N0JywgTE9DQUxIT1NULCB7XG4gICAgYXNjaWk6IHRydWVcbiAgfSk7XG5cbiAgLy8gU2V0IGRlZmF1bHQgdHJhbnNpdGlvbiBmb3Igc3RhcnQgc3RhdGUgKHNvbWUgc3ltYm9sKVxuICBTdGFydC5qZCA9IG5ldyBTdGF0ZShTWU0pO1xuICByZXR1cm4ge1xuICAgIHN0YXJ0OiBTdGFydCxcbiAgICB0b2tlbnM6IGFzc2lnbih7XG4gICAgICBncm91cHNcbiAgICB9LCB0aylcbiAgfTtcbn1cblxuLyoqXG5cdEdpdmVuIGEgc3RyaW5nLCByZXR1cm5zIGFuIGFycmF5IG9mIFRPS0VOIGluc3RhbmNlcyByZXByZXNlbnRpbmcgdGhlXG5cdGNvbXBvc2l0aW9uIG9mIHRoYXQgc3RyaW5nLlxuXG5cdEBtZXRob2QgcnVuXG5cdEBwYXJhbSB7U3RhdGU8c3RyaW5nPn0gc3RhcnQgc2Nhbm5lciBzdGFydGluZyBzdGF0ZVxuXHRAcGFyYW0ge3N0cmluZ30gc3RyIGlucHV0IHN0cmluZyB0byBzY2FuXG5cdEByZXR1cm4ge1Rva2VuW119IGxpc3Qgb2YgdG9rZW5zLCBlYWNoIHdpdGggYSB0eXBlIGFuZCB2YWx1ZVxuKi9cbmZ1bmN0aW9uIHJ1biQxKHN0YXJ0LCBzdHIpIHtcbiAgLy8gU3RhdGUgbWFjaGluZSBpcyBub3QgY2FzZSBzZW5zaXRpdmUsIHNvIGlucHV0IGlzIHRva2VuaXplZCBpbiBsb3dlcmNhc2VkXG4gIC8vIGZvcm0gKHN0aWxsIHJldHVybnMgcmVndWxhciBjYXNlKS4gVXNlcyBzZWxlY3RpdmUgYHRvTG93ZXJDYXNlYCBiZWNhdXNlXG4gIC8vIGxvd2VyY2FzaW5nIHRoZSBlbnRpcmUgc3RyaW5nIGNhdXNlcyB0aGUgbGVuZ3RoIGFuZCBjaGFyYWN0ZXIgcG9zaXRpb24gdG9cbiAgLy8gdmFyeSBpbiBzb21lIG5vbi1FbmdsaXNoIHN0cmluZ3Mgd2l0aCBWOC1iYXNlZCBydW50aW1lcy5cbiAgY29uc3QgaXRlcmFibGUgPSBzdHJpbmdUb0FycmF5KHN0ci5yZXBsYWNlKC9bQS1aXS9nLCBjID0+IGMudG9Mb3dlckNhc2UoKSkpO1xuICBjb25zdCBjaGFyQ291bnQgPSBpdGVyYWJsZS5sZW5ndGg7IC8vIDw9IGxlbiBpZiB0aGVyZSBhcmUgZW1vamlzLCBldGNcbiAgY29uc3QgdG9rZW5zID0gW107IC8vIHJldHVybiB2YWx1ZVxuXG4gIC8vIGN1cnNvciB0aHJvdWdoIHRoZSBzdHJpbmcgaXRzZWxmLCBhY2NvdW50aW5nIGZvciBjaGFyYWN0ZXJzIHRoYXQgaGF2ZVxuICAvLyB3aWR0aCB3aXRoIGxlbmd0aCAyIHN1Y2ggYXMgZW1vamlzXG4gIGxldCBjdXJzb3IgPSAwO1xuXG4gIC8vIEN1cnNvciB0aHJvdWdoIHRoZSBhcnJheS1yZXByZXNlbnRhdGlvbiBvZiB0aGUgc3RyaW5nXG4gIGxldCBjaGFyQ3Vyc29yID0gMDtcblxuICAvLyBUb2tlbml6ZSB0aGUgc3RyaW5nXG4gIHdoaWxlIChjaGFyQ3Vyc29yIDwgY2hhckNvdW50KSB7XG4gICAgbGV0IHN0YXRlID0gc3RhcnQ7XG4gICAgbGV0IG5leHRTdGF0ZSA9IG51bGw7XG4gICAgbGV0IHRva2VuTGVuZ3RoID0gMDtcbiAgICBsZXQgbGF0ZXN0QWNjZXB0aW5nID0gbnVsbDtcbiAgICBsZXQgc2luY2VBY2NlcHRzID0gLTE7XG4gICAgbGV0IGNoYXJzU2luY2VBY2NlcHRzID0gLTE7XG4gICAgd2hpbGUgKGNoYXJDdXJzb3IgPCBjaGFyQ291bnQgJiYgKG5leHRTdGF0ZSA9IHN0YXRlLmdvKGl0ZXJhYmxlW2NoYXJDdXJzb3JdKSkpIHtcbiAgICAgIHN0YXRlID0gbmV4dFN0YXRlO1xuXG4gICAgICAvLyBLZWVwIHRyYWNrIG9mIHRoZSBsYXRlc3QgYWNjZXB0aW5nIHN0YXRlXG4gICAgICBpZiAoc3RhdGUuYWNjZXB0cygpKSB7XG4gICAgICAgIHNpbmNlQWNjZXB0cyA9IDA7XG4gICAgICAgIGNoYXJzU2luY2VBY2NlcHRzID0gMDtcbiAgICAgICAgbGF0ZXN0QWNjZXB0aW5nID0gc3RhdGU7XG4gICAgICB9IGVsc2UgaWYgKHNpbmNlQWNjZXB0cyA+PSAwKSB7XG4gICAgICAgIHNpbmNlQWNjZXB0cyArPSBpdGVyYWJsZVtjaGFyQ3Vyc29yXS5sZW5ndGg7XG4gICAgICAgIGNoYXJzU2luY2VBY2NlcHRzKys7XG4gICAgICB9XG4gICAgICB0b2tlbkxlbmd0aCArPSBpdGVyYWJsZVtjaGFyQ3Vyc29yXS5sZW5ndGg7XG4gICAgICBjdXJzb3IgKz0gaXRlcmFibGVbY2hhckN1cnNvcl0ubGVuZ3RoO1xuICAgICAgY2hhckN1cnNvcisrO1xuICAgIH1cblxuICAgIC8vIFJvbGwgYmFjayB0byB0aGUgbGF0ZXN0IGFjY2VwdGluZyBzdGF0ZVxuICAgIGN1cnNvciAtPSBzaW5jZUFjY2VwdHM7XG4gICAgY2hhckN1cnNvciAtPSBjaGFyc1NpbmNlQWNjZXB0cztcbiAgICB0b2tlbkxlbmd0aCAtPSBzaW5jZUFjY2VwdHM7XG5cbiAgICAvLyBObyBtb3JlIGp1bXBzLCBqdXN0IG1ha2UgYSBuZXcgdG9rZW4gZnJvbSB0aGUgbGFzdCBhY2NlcHRpbmcgb25lXG4gICAgdG9rZW5zLnB1c2goe1xuICAgICAgdDogbGF0ZXN0QWNjZXB0aW5nLnQsXG4gICAgICAvLyB0b2tlbiB0eXBlL25hbWVcbiAgICAgIHY6IHN0ci5zbGljZShjdXJzb3IgLSB0b2tlbkxlbmd0aCwgY3Vyc29yKSxcbiAgICAgIC8vIHN0cmluZyB2YWx1ZVxuICAgICAgczogY3Vyc29yIC0gdG9rZW5MZW5ndGgsXG4gICAgICAvLyBzdGFydCBpbmRleFxuICAgICAgZTogY3Vyc29yIC8vIGVuZCBpbmRleCAoZXhjbHVkaW5nKVxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHRva2Vucztcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgU3RyaW5nIHRvIGFuIEFycmF5IG9mIGNoYXJhY3RlcnMsIHRha2luZyBpbnRvIGFjY291bnQgdGhhdCBzb21lXG4gKiBjaGFyYWN0ZXJzIGxpa2UgZW1vamlzIHRha2UgdXAgdHdvIHN0cmluZyBpbmRleGVzLlxuICpcbiAqIEFkYXB0ZWQgZnJvbSBjb3JlLWpzIChNSVQgbGljZW5zZSlcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS96bG9pcm9jay9jb3JlLWpzL2Jsb2IvMmQ2OWNmNWY5OWFiM2VhMzQ2M2MzOTVkZjgxZTVhMTViNjhmNDlkOS9wYWNrYWdlcy9jb3JlLWpzL2ludGVybmFscy9zdHJpbmctbXVsdGlieXRlLmpzXG4gKlxuICogQGZ1bmN0aW9uIHN0cmluZ1RvQXJyYXlcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJcbiAqIEByZXR1cm5zIHtzdHJpbmdbXX1cbiAqL1xuZnVuY3Rpb24gc3RyaW5nVG9BcnJheShzdHIpIHtcbiAgY29uc3QgcmVzdWx0ID0gW107XG4gIGNvbnN0IGxlbiA9IHN0ci5sZW5ndGg7XG4gIGxldCBpbmRleCA9IDA7XG4gIHdoaWxlIChpbmRleCA8IGxlbikge1xuICAgIGxldCBmaXJzdCA9IHN0ci5jaGFyQ29kZUF0KGluZGV4KTtcbiAgICBsZXQgc2Vjb25kO1xuICAgIGxldCBjaGFyID0gZmlyc3QgPCAweGQ4MDAgfHwgZmlyc3QgPiAweGRiZmYgfHwgaW5kZXggKyAxID09PSBsZW4gfHwgKHNlY29uZCA9IHN0ci5jaGFyQ29kZUF0KGluZGV4ICsgMSkpIDwgMHhkYzAwIHx8IHNlY29uZCA+IDB4ZGZmZiA/IHN0cltpbmRleF0gLy8gc2luZ2xlIGNoYXJhY3RlclxuICAgIDogc3RyLnNsaWNlKGluZGV4LCBpbmRleCArIDIpOyAvLyB0d28taW5kZXggY2hhcmFjdGVyc1xuICAgIHJlc3VsdC5wdXNoKGNoYXIpO1xuICAgIGluZGV4ICs9IGNoYXIubGVuZ3RoO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRmFzdCB2ZXJzaW9uIG9mIHRzIGZ1bmN0aW9uIGZvciB3aGVuIHRyYW5zaXRpb24gZGVmYXVsdHMgYXJlIHdlbGwga25vd25cbiAqIEBwYXJhbSB7U3RhdGU8c3RyaW5nPn0gc3RhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBpbnB1dFxuICogQHBhcmFtIHtzdHJpbmd9IHRcbiAqIEBwYXJhbSB7c3RyaW5nfSBkZWZhdWx0dFxuICogQHBhcmFtIHtbUmVnRXhwLCBTdGF0ZTxzdHJpbmc+XVtdfSBqclxuICogQHJldHVybnMge1N0YXRlPHN0cmluZz59XG4gKi9cbmZ1bmN0aW9uIGZhc3R0cyhzdGF0ZSwgaW5wdXQsIHQsIGRlZmF1bHR0LCBqcikge1xuICBsZXQgbmV4dDtcbiAgY29uc3QgbGVuID0gaW5wdXQubGVuZ3RoO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbiAtIDE7IGkrKykge1xuICAgIGNvbnN0IGNoYXIgPSBpbnB1dFtpXTtcbiAgICBpZiAoc3RhdGUualtjaGFyXSkge1xuICAgICAgbmV4dCA9IHN0YXRlLmpbY2hhcl07XG4gICAgfSBlbHNlIHtcbiAgICAgIG5leHQgPSBuZXcgU3RhdGUoZGVmYXVsdHQpO1xuICAgICAgbmV4dC5qciA9IGpyLnNsaWNlKCk7XG4gICAgICBzdGF0ZS5qW2NoYXJdID0gbmV4dDtcbiAgICB9XG4gICAgc3RhdGUgPSBuZXh0O1xuICB9XG4gIG5leHQgPSBuZXcgU3RhdGUodCk7XG4gIG5leHQuanIgPSBqci5zbGljZSgpO1xuICBzdGF0ZS5qW2lucHV0W2xlbiAtIDFdXSA9IG5leHQ7XG4gIHJldHVybiBuZXh0O1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGEgc3RyaW5nIG9mIFRvcC1MZXZlbCBEb21haW4gbmFtZXMgZW5jb2RlZCBpbiB1cGRhdGUtdGxkcy5qcyBiYWNrXG4gKiBpbnRvIGEgbGlzdCBvZiBzdHJpbmdzLlxuICogQHBhcmFtIHtzdHJ9IGVuY29kZWQgZW5jb2RlZCBUTERzIHN0cmluZ1xuICogQHJldHVybnMge3N0cltdfSBvcmlnaW5hbCBUTERzIGxpc3RcbiAqL1xuZnVuY3Rpb24gZGVjb2RlVGxkcyhlbmNvZGVkKSB7XG4gIGNvbnN0IHdvcmRzID0gW107XG4gIGNvbnN0IHN0YWNrID0gW107XG4gIGxldCBpID0gMDtcbiAgbGV0IGRpZ2l0cyA9ICcwMTIzNDU2Nzg5JztcbiAgd2hpbGUgKGkgPCBlbmNvZGVkLmxlbmd0aCkge1xuICAgIGxldCBwb3BEaWdpdENvdW50ID0gMDtcbiAgICB3aGlsZSAoZGlnaXRzLmluZGV4T2YoZW5jb2RlZFtpICsgcG9wRGlnaXRDb3VudF0pID49IDApIHtcbiAgICAgIHBvcERpZ2l0Q291bnQrKzsgLy8gZW5jb3VudGVyZWQgc29tZSBkaWdpdHMsIGhhdmUgdG8gcG9wIHRvIGdvIG9uZSBsZXZlbCB1cCB0cmllXG4gICAgfVxuXG4gICAgaWYgKHBvcERpZ2l0Q291bnQgPiAwKSB7XG4gICAgICB3b3Jkcy5wdXNoKHN0YWNrLmpvaW4oJycpKTsgLy8gd2hhdGV2ZXIgcHJlY2VkZWQgdGhlIHBvcCBkaWdpdHMgbXVzdCBiZSBhIHdvcmRcbiAgICAgIGZvciAobGV0IHBvcENvdW50ID0gcGFyc2VJbnQoZW5jb2RlZC5zdWJzdHJpbmcoaSwgaSArIHBvcERpZ2l0Q291bnQpLCAxMCk7IHBvcENvdW50ID4gMDsgcG9wQ291bnQtLSkge1xuICAgICAgICBzdGFjay5wb3AoKTtcbiAgICAgIH1cbiAgICAgIGkgKz0gcG9wRGlnaXRDb3VudDtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhY2sucHVzaChlbmNvZGVkW2ldKTsgLy8gZHJvcCBkb3duIGEgbGV2ZWwgaW50byB0aGUgdHJpZVxuICAgICAgaSsrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gd29yZHM7XG59XG5cbi8qKlxuICogQW4gb2JqZWN0IHdoZXJlIGVhY2gga2V5IGlzIGEgdmFsaWQgRE9NIEV2ZW50IE5hbWUgc3VjaCBhcyBgY2xpY2tgIG9yIGBmb2N1c2BcbiAqIGFuZCBlYWNoIHZhbHVlIGlzIGFuIGV2ZW50IGhhbmRsZXIgZnVuY3Rpb24uXG4gKlxuICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0VsZW1lbnQjZXZlbnRzXG4gKiBAdHlwZWRlZiB7P3sgW2V2ZW50OiBzdHJpbmddOiBGdW5jdGlvbiB9fSBFdmVudExpc3RlbmVyc1xuICovXG5cbi8qKlxuICogQWxsIGZvcm1hdHRlZCBwcm9wZXJ0aWVzIHJlcXVpcmVkIHRvIHJlbmRlciBhIGxpbmssIGluY2x1ZGluZyBgdGFnTmFtZWAsXG4gKiBgYXR0cmlidXRlc2AsIGBjb250ZW50YCBhbmQgYGV2ZW50TGlzdGVuZXJzYC5cbiAqIEB0eXBlZGVmIHt7IHRhZ05hbWU6IGFueSwgYXR0cmlidXRlczoge1thdHRyOiBzdHJpbmddOiBhbnl9LCBjb250ZW50OiBzdHJpbmcsXG4gKiBldmVudExpc3RlbmVyczogRXZlbnRMaXN0ZW5lcnMgfX0gSW50ZXJtZWRpYXRlUmVwcmVzZW50YXRpb25cbiAqL1xuXG4vKipcbiAqIFNwZWNpZnkgZWl0aGVyIGFuIG9iamVjdCBkZXNjcmliZWQgYnkgdGhlIHRlbXBsYXRlIHR5cGUgYE9gIG9yIGEgZnVuY3Rpb24uXG4gKlxuICogVGhlIGZ1bmN0aW9uIHRha2VzIGEgc3RyaW5nIHZhbHVlICh1c3VhbGx5IHRoZSBsaW5rJ3MgaHJlZiBhdHRyaWJ1dGUpLCB0aGVcbiAqIGxpbmsgdHlwZSAoYCd1cmwnYCwgYCdoYXNodGFnYCcsIGV0Yy4pIGFuZCBhbiBpbnRlcm5hbCB0b2tlbiByZXByZXNlbnRhdGlvblxuICogb2YgdGhlIGxpbmsuIEl0IHNob3VsZCByZXR1cm4gYW4gb2JqZWN0IG9mIHRoZSB0ZW1wbGF0ZSB0eXBlIGBPYFxuICogQHRlbXBsYXRlIE9cbiAqIEB0eXBlZGVmIHtPIHwgKCh2YWx1ZTogc3RyaW5nLCB0eXBlOiBzdHJpbmcsIHRva2VuOiBNdWx0aVRva2VuKSA9PiBPKX0gT3B0T2JqXG4gKi9cblxuLyoqXG4gKiBTcGVjaWZ5IGVpdGhlciBhIGZ1bmN0aW9uIGRlc2NyaWJlZCBieSB0ZW1wbGF0ZSB0eXBlIGBGYCBvciBhbiBvYmplY3QuXG4gKlxuICogRWFjaCBrZXkgaW4gdGhlIG9iamVjdCBzaG91bGQgYmUgYSBsaW5rIHR5cGUgKGAndXJsJ2AsIGAnaGFzaHRhZ2AnLCBldGMuKS4gRWFjaFxuICogdmFsdWUgc2hvdWxkIGJlIGEgZnVuY3Rpb24gd2l0aCB0ZW1wbGF0ZSB0eXBlIGBGYCB0aGF0IGlzIGNhbGxlZCB3aGVuIHRoZVxuICogY29ycmVzcG9uZGluZyBsaW5rIHR5cGUgaXMgZW5jb3VudGVyZWQuXG4gKiBAdGVtcGxhdGUgRlxuICogQHR5cGVkZWYge0YgfCB7IFt0eXBlOiBzdHJpbmddOiBGfX0gT3B0Rm5cbiAqL1xuXG4vKipcbiAqIFNwZWNpZnkgZWl0aGVyIGEgdmFsdWUgd2l0aCB0ZW1wbGF0ZSB0eXBlIGBWYCwgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYFZgIG9yXG4gKiBhbiBvYmplY3Qgd2hlcmUgZWFjaCB2YWx1ZSByZXNvbHZlcyB0byBgVmAuXG4gKlxuICogVGhlIGZ1bmN0aW9uIHRha2VzIGEgc3RyaW5nIHZhbHVlICh1c3VhbGx5IHRoZSBsaW5rJ3MgaHJlZiBhdHRyaWJ1dGUpLCB0aGVcbiAqIGxpbmsgdHlwZSAoYCd1cmwnYCwgYCdoYXNodGFnYCcsIGV0Yy4pIGFuZCBhbiBpbnRlcm5hbCB0b2tlbiByZXByZXNlbnRhdGlvblxuICogb2YgdGhlIGxpbmsuIEl0IHNob3VsZCByZXR1cm4gYW4gb2JqZWN0IG9mIHRoZSB0ZW1wbGF0ZSB0eXBlIGBWYFxuICpcbiAqIEZvciB0aGUgb2JqZWN0LCBlYWNoIGtleSBzaG91bGQgYmUgYSBsaW5rIHR5cGUgKGAndXJsJ2AsIGAnaGFzaHRhZ2AnLCBldGMuKS5cbiAqIEVhY2ggdmFsdWUgc2hvdWxkIGVpdGhlciBoYXZlIHR5cGUgYFZgIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIFYuIFRoaXNcbiAqIGZ1bmN0aW9uIHNpbWlsYXJseSB0YWtlcyBhIHN0cmluZyB2YWx1ZSBhbmQgYSB0b2tlbi5cbiAqXG4gKiBFeGFtcGxlIHZhbGlkIHR5cGVzIGZvciBgT3B0PHN0cmluZz5gOlxuICpcbiAqIGBgYGpzXG4gKiAnaGVsbG8nXG4gKiAodmFsdWUsIHR5cGUsIHRva2VuKSA9PiAnd29ybGQnXG4gKiB7IHVybDogJ2hlbGxvJywgZW1haWw6ICh2YWx1ZSwgdG9rZW4pID0+ICd3b3JsZCd9XG4gKiBgYGBcbiAqIEB0ZW1wbGF0ZSBWXG4gKiBAdHlwZWRlZiB7ViB8ICgodmFsdWU6IHN0cmluZywgdHlwZTogc3RyaW5nLCB0b2tlbjogTXVsdGlUb2tlbikgPT4gVikgfCB7IFt0eXBlOiBzdHJpbmddOiBWIHwgKCh2YWx1ZTogc3RyaW5nLCB0b2tlbjogTXVsdGlUb2tlbikgPT4gVikgfX0gT3B0XG4gKi9cblxuLyoqXG4gKiBTZWUgYXZhaWxhYmxlIG9wdGlvbnM6IGh0dHBzOi8vbGlua2lmeS5qcy5vcmcvZG9jcy9vcHRpb25zLmh0bWxcbiAqIEB0eXBlZGVmIHt7XG4gKiBcdGRlZmF1bHRQcm90b2NvbD86IHN0cmluZyxcbiAqICBldmVudHM/OiBPcHRPYmo8RXZlbnRMaXN0ZW5lcnM+LFxuICogXHRmb3JtYXQ/OiBPcHQ8c3RyaW5nPixcbiAqIFx0Zm9ybWF0SHJlZj86IE9wdDxzdHJpbmc+LFxuICogXHRubDJicj86IGJvb2xlYW4sXG4gKiBcdHRhZ05hbWU/OiBPcHQ8YW55PixcbiAqIFx0dGFyZ2V0PzogT3B0PHN0cmluZz4sXG4gKiBcdHJlbD86IE9wdDxzdHJpbmc+LFxuICogXHR2YWxpZGF0ZT86IE9wdDxib29sZWFuPixcbiAqIFx0dHJ1bmNhdGU/OiBPcHQ8bnVtYmVyPixcbiAqIFx0Y2xhc3NOYW1lPzogT3B0PHN0cmluZz4sXG4gKiBcdGF0dHJpYnV0ZXM/OiBPcHRPYmo8KHsgW2F0dHI6IHN0cmluZ106IGFueSB9KT4sXG4gKiAgaWdub3JlVGFncz86IHN0cmluZ1tdLFxuICogXHRyZW5kZXI/OiBPcHRGbjwoKGlyOiBJbnRlcm1lZGlhdGVSZXByZXNlbnRhdGlvbikgPT4gYW55KT5cbiAqIH19IE9wdHNcbiAqL1xuXG4vKipcbiAqIEB0eXBlIFJlcXVpcmVkPE9wdHM+XG4gKi9cbmNvbnN0IGRlZmF1bHRzID0ge1xuICBkZWZhdWx0UHJvdG9jb2w6ICdodHRwJyxcbiAgZXZlbnRzOiBudWxsLFxuICBmb3JtYXQ6IG5vb3AsXG4gIGZvcm1hdEhyZWY6IG5vb3AsXG4gIG5sMmJyOiBmYWxzZSxcbiAgdGFnTmFtZTogJ2EnLFxuICB0YXJnZXQ6IG51bGwsXG4gIHJlbDogbnVsbCxcbiAgdmFsaWRhdGU6IHRydWUsXG4gIHRydW5jYXRlOiBJbmZpbml0eSxcbiAgY2xhc3NOYW1lOiBudWxsLFxuICBhdHRyaWJ1dGVzOiBudWxsLFxuICBpZ25vcmVUYWdzOiBbXSxcbiAgcmVuZGVyOiBudWxsXG59O1xuXG4vKipcbiAqIFV0aWxpdHkgY2xhc3MgZm9yIGxpbmtpZnkgaW50ZXJmYWNlcyB0byBhcHBseSBzcGVjaWZpZWRcbiAqIHtAbGluayBPcHRzIGZvcm1hdHRpbmcgYW5kIHJlbmRlcmluZyBvcHRpb25zfS5cbiAqXG4gKiBAcGFyYW0ge09wdHMgfCBPcHRpb25zfSBbb3B0c10gT3B0aW9uIHZhbHVlIG92ZXJyaWRlcy5cbiAqIEBwYXJhbSB7KGlyOiBJbnRlcm1lZGlhdGVSZXByZXNlbnRhdGlvbikgPT4gYW55fSBbZGVmYXVsdFJlbmRlcl0gKEZvclxuICogICBpbnRlcm5hbCB1c2UpIGRlZmF1bHQgcmVuZGVyIGZ1bmN0aW9uIHRoYXQgZGV0ZXJtaW5lcyBob3cgdG8gZ2VuZXJhdGUgYW5cbiAqICAgSFRNTCBlbGVtZW50IGJhc2VkIG9uIGEgbGluayB0b2tlbidzIGRlcml2ZWQgdGFnTmFtZSwgYXR0cmlidXRlcyBhbmQgSFRNTC5cbiAqICAgU2ltaWxhciB0byByZW5kZXIgb3B0aW9uXG4gKi9cbmZ1bmN0aW9uIE9wdGlvbnMob3B0cywgZGVmYXVsdFJlbmRlcikge1xuICBpZiAoZGVmYXVsdFJlbmRlciA9PT0gdm9pZCAwKSB7XG4gICAgZGVmYXVsdFJlbmRlciA9IG51bGw7XG4gIH1cbiAgbGV0IG8gPSBhc3NpZ24oe30sIGRlZmF1bHRzKTtcbiAgaWYgKG9wdHMpIHtcbiAgICBvID0gYXNzaWduKG8sIG9wdHMgaW5zdGFuY2VvZiBPcHRpb25zID8gb3B0cy5vIDogb3B0cyk7XG4gIH1cblxuICAvLyBFbnN1cmUgYWxsIGlnbm9yZWQgdGFncyBhcmUgdXBwZXJjYXNlXG4gIGNvbnN0IGlnbm9yZWRUYWdzID0gby5pZ25vcmVUYWdzO1xuICBjb25zdCB1cHBlcmNhc2VJZ25vcmVkVGFncyA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGlnbm9yZWRUYWdzLmxlbmd0aDsgaSsrKSB7XG4gICAgdXBwZXJjYXNlSWdub3JlZFRhZ3MucHVzaChpZ25vcmVkVGFnc1tpXS50b1VwcGVyQ2FzZSgpKTtcbiAgfVxuICAvKiogQHByb3RlY3RlZCAqL1xuICB0aGlzLm8gPSBvO1xuICBpZiAoZGVmYXVsdFJlbmRlcikge1xuICAgIHRoaXMuZGVmYXVsdFJlbmRlciA9IGRlZmF1bHRSZW5kZXI7XG4gIH1cbiAgdGhpcy5pZ25vcmVUYWdzID0gdXBwZXJjYXNlSWdub3JlZFRhZ3M7XG59XG5PcHRpb25zLnByb3RvdHlwZSA9IHtcbiAgbzogZGVmYXVsdHMsXG4gIC8qKlxuICAgKiBAdHlwZSBzdHJpbmdbXVxuICAgKi9cbiAgaWdub3JlVGFnczogW10sXG4gIC8qKlxuICAgKiBAcGFyYW0ge0ludGVybWVkaWF0ZVJlcHJlc2VudGF0aW9ufSBpclxuICAgKiBAcmV0dXJucyB7YW55fVxuICAgKi9cbiAgZGVmYXVsdFJlbmRlcihpcikge1xuICAgIHJldHVybiBpcjtcbiAgfSxcbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBvciBmYWxzZSBiYXNlZCBvbiB3aGV0aGVyIGEgdG9rZW4gc2hvdWxkIGJlIGRpc3BsYXllZCBhcyBhXG4gICAqIGxpbmsgYmFzZWQgb24gdGhlIHVzZXIgb3B0aW9ucy5cbiAgICogQHBhcmFtIHtNdWx0aVRva2VufSB0b2tlblxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGNoZWNrKHRva2VuKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCd2YWxpZGF0ZScsIHRva2VuLnRvU3RyaW5nKCksIHRva2VuKTtcbiAgfSxcbiAgLy8gUHJpdmF0ZSBtZXRob2RzXG5cbiAgLyoqXG4gICAqIFJlc29sdmUgYW4gb3B0aW9uJ3MgdmFsdWUgYmFzZWQgb24gdGhlIHZhbHVlIG9mIHRoZSBvcHRpb24gYW5kIHRoZSBnaXZlblxuICAgKiBwYXJhbXMuIElmIG9wZXJhdG9yIGFuZCB0b2tlbiBhcmUgc3BlY2lmaWVkIGFuZCB0aGUgdGFyZ2V0IG9wdGlvbiBpc1xuICAgKiBjYWxsYWJsZSwgYXV0b21hdGljYWxseSBjYWxscyB0aGUgZnVuY3Rpb24gd2l0aCB0aGUgZ2l2ZW4gYXJndW1lbnQuXG4gICAqIEB0ZW1wbGF0ZSB7a2V5b2YgT3B0c30gS1xuICAgKiBAcGFyYW0ge0t9IGtleSBOYW1lIG9mIG9wdGlvbiB0byB1c2VcbiAgICogQHBhcmFtIHtzdHJpbmd9IFtvcGVyYXRvcl0gd2lsbCBiZSBwYXNzZWQgdG8gdGhlIHRhcmdldCBvcHRpb24gaWYgaXQncyBhXG4gICAqIGZ1bmN0aW9uLiBJZiBub3Qgc3BlY2lmaWVkLCBSQVcgZnVuY3Rpb24gdmFsdWUgZ2V0cyByZXR1cm5lZFxuICAgKiBAcGFyYW0ge011bHRpVG9rZW59IFt0b2tlbl0gVGhlIHRva2VuIGZyb20gbGlua2lmeS50b2tlbml6ZVxuICAgKiBAcmV0dXJucyB7T3B0c1tLXSB8IGFueX1cbiAgICovXG4gIGdldChrZXksIG9wZXJhdG9yLCB0b2tlbikge1xuICAgIGNvbnN0IGlzQ2FsbGFibGUgPSBvcGVyYXRvciAhPSBudWxsO1xuICAgIGxldCBvcHRpb24gPSB0aGlzLm9ba2V5XTtcbiAgICBpZiAoIW9wdGlvbikge1xuICAgICAgcmV0dXJuIG9wdGlvbjtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvcHRpb24gPT09ICdvYmplY3QnKSB7XG4gICAgICBvcHRpb24gPSB0b2tlbi50IGluIG9wdGlvbiA/IG9wdGlvblt0b2tlbi50XSA6IGRlZmF1bHRzW2tleV07XG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PT0gJ2Z1bmN0aW9uJyAmJiBpc0NhbGxhYmxlKSB7XG4gICAgICAgIG9wdGlvbiA9IG9wdGlvbihvcGVyYXRvciwgdG9rZW4pO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIG9wdGlvbiA9PT0gJ2Z1bmN0aW9uJyAmJiBpc0NhbGxhYmxlKSB7XG4gICAgICBvcHRpb24gPSBvcHRpb24ob3BlcmF0b3IsIHRva2VuLnQsIHRva2VuKTtcbiAgICB9XG4gICAgcmV0dXJuIG9wdGlvbjtcbiAgfSxcbiAgLyoqXG4gICAqIEB0ZW1wbGF0ZSB7a2V5b2YgT3B0c30gTFxuICAgKiBAcGFyYW0ge0x9IGtleSBOYW1lIG9mIG9wdGlvbnMgb2JqZWN0IHRvIHVzZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gW29wZXJhdG9yXVxuICAgKiBAcGFyYW0ge011bHRpVG9rZW59IFt0b2tlbl1cbiAgICogQHJldHVybnMge09wdHNbTF0gfCBhbnl9XG4gICAqL1xuICBnZXRPYmooa2V5LCBvcGVyYXRvciwgdG9rZW4pIHtcbiAgICBsZXQgb2JqID0gdGhpcy5vW2tleV07XG4gICAgaWYgKHR5cGVvZiBvYmogPT09ICdmdW5jdGlvbicgJiYgb3BlcmF0b3IgIT0gbnVsbCkge1xuICAgICAgb2JqID0gb2JqKG9wZXJhdG9yLCB0b2tlbi50LCB0b2tlbik7XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH0sXG4gIC8qKlxuICAgKiBDb252ZXJ0IHRoZSBnaXZlbiB0b2tlbiB0byBhIHJlbmRlcmVkIGVsZW1lbnQgdGhhdCBtYXkgYmUgYWRkZWQgdG8gdGhlXG4gICAqIGNhbGxpbmctaW50ZXJmYWNlJ3MgRE9NXG4gICAqIEBwYXJhbSB7TXVsdGlUb2tlbn0gdG9rZW4gVG9rZW4gdG8gcmVuZGVyIHRvIGFuIEhUTUwgZWxlbWVudFxuICAgKiBAcmV0dXJucyB7YW55fSBSZW5kZXIgcmVzdWx0OyBlLmcuLCBIVE1MIHN0cmluZywgRE9NIGVsZW1lbnQsIFJlYWN0XG4gICAqICAgQ29tcG9uZW50LCBldGMuXG4gICAqL1xuICByZW5kZXIodG9rZW4pIHtcbiAgICBjb25zdCBpciA9IHRva2VuLnJlbmRlcih0aGlzKTsgLy8gaW50ZXJtZWRpYXRlIHJlcHJlc2VudGF0aW9uXG4gICAgY29uc3QgcmVuZGVyRm4gPSB0aGlzLmdldCgncmVuZGVyJywgbnVsbCwgdG9rZW4pIHx8IHRoaXMuZGVmYXVsdFJlbmRlcjtcbiAgICByZXR1cm4gcmVuZGVyRm4oaXIsIHRva2VuLnQsIHRva2VuKTtcbiAgfVxufTtcbmZ1bmN0aW9uIG5vb3AodmFsKSB7XG4gIHJldHVybiB2YWw7XG59XG5cbnZhciBvcHRpb25zID0gLyojX19QVVJFX18qL09iamVjdC5mcmVlemUoe1xuXHRfX3Byb3RvX186IG51bGwsXG5cdGRlZmF1bHRzOiBkZWZhdWx0cyxcblx0T3B0aW9uczogT3B0aW9ucyxcblx0YXNzaWduOiBhc3NpZ25cbn0pO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cdE11bHRpLVRva2Vuc1xuXHRUb2tlbnMgY29tcG9zZWQgb2YgYXJyYXlzIG9mIFRleHRUb2tlbnNcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gdmFsdWVcbiAqIEBwYXJhbSB7VG9rZW5bXX0gdG9rZW5zXG4gKi9cbmZ1bmN0aW9uIE11bHRpVG9rZW4odmFsdWUsIHRva2Vucykge1xuICB0aGlzLnQgPSAndG9rZW4nO1xuICB0aGlzLnYgPSB2YWx1ZTtcbiAgdGhpcy50ayA9IHRva2Vucztcbn1cblxuLyoqXG4gKiBBYnN0cmFjdCBjbGFzcyB1c2VkIGZvciBtYW51ZmFjdHVyaW5nIHRva2VucyBvZiB0ZXh0IHRva2Vucy4gVGhhdCBpcyByYXRoZXJcbiAqIHRoYW4gdGhlIHZhbHVlIGZvciBhIHRva2VuIGJlaW5nIGEgc21hbGwgc3RyaW5nIG9mIHRleHQsIGl0J3MgdmFsdWUgYW4gYXJyYXlcbiAqIG9mIHRleHQgdG9rZW5zLlxuICpcbiAqIFVzZWQgZm9yIGdyb3VwaW5nIHRvZ2V0aGVyIFVSTHMsIGVtYWlscywgaGFzaHRhZ3MsIGFuZCBvdGhlciBwb3RlbnRpYWxcbiAqIGNyZWF0aW9ucy5cbiAqIEBjbGFzcyBNdWx0aVRva2VuXG4gKiBAcHJvcGVydHkge3N0cmluZ30gdFxuICogQHByb3BlcnR5IHtzdHJpbmd9IHZcbiAqIEBwcm9wZXJ0eSB7VG9rZW5bXX0gdGtcbiAqIEBhYnN0cmFjdFxuICovXG5NdWx0aVRva2VuLnByb3RvdHlwZSA9IHtcbiAgaXNMaW5rOiBmYWxzZSxcbiAgLyoqXG4gICAqIFJldHVybiB0aGUgc3RyaW5nIHRoaXMgdG9rZW4gcmVwcmVzZW50cy5cbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMudjtcbiAgfSxcbiAgLyoqXG4gICAqIFdoYXQgc2hvdWxkIHRoZSB2YWx1ZSBmb3IgdGhpcyB0b2tlbiBiZSBpbiB0aGUgYGhyZWZgIEhUTUwgYXR0cmlidXRlP1xuICAgKiBSZXR1cm5zIHRoZSBgLnRvU3RyaW5nYCB2YWx1ZSBieSBkZWZhdWx0LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gW3NjaGVtZV1cbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAqL1xuICB0b0hyZWYoc2NoZW1lKSB7XG4gICAgcmV0dXJuIHRoaXMudG9TdHJpbmcoKTtcbiAgfSxcbiAgLyoqXG4gICAqIEBwYXJhbSB7T3B0aW9uc30gb3B0aW9ucyBGb3JtYXR0aW5nIG9wdGlvbnNcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIHRvRm9ybWF0dGVkU3RyaW5nKG9wdGlvbnMpIHtcbiAgICBjb25zdCB2YWwgPSB0aGlzLnRvU3RyaW5nKCk7XG4gICAgY29uc3QgdHJ1bmNhdGUgPSBvcHRpb25zLmdldCgndHJ1bmNhdGUnLCB2YWwsIHRoaXMpO1xuICAgIGNvbnN0IGZvcm1hdHRlZCA9IG9wdGlvbnMuZ2V0KCdmb3JtYXQnLCB2YWwsIHRoaXMpO1xuICAgIHJldHVybiB0cnVuY2F0ZSAmJiBmb3JtYXR0ZWQubGVuZ3RoID4gdHJ1bmNhdGUgPyBmb3JtYXR0ZWQuc3Vic3RyaW5nKDAsIHRydW5jYXRlKSArICdcdTIwMjYnIDogZm9ybWF0dGVkO1xuICB9LFxuICAvKipcbiAgICpcbiAgICogQHBhcmFtIHtPcHRpb25zfSBvcHRpb25zXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqL1xuICB0b0Zvcm1hdHRlZEhyZWYob3B0aW9ucykge1xuICAgIHJldHVybiBvcHRpb25zLmdldCgnZm9ybWF0SHJlZicsIHRoaXMudG9IcmVmKG9wdGlvbnMuZ2V0KCdkZWZhdWx0UHJvdG9jb2wnKSksIHRoaXMpO1xuICB9LFxuICAvKipcbiAgICogVGhlIHN0YXJ0IGluZGV4IG9mIHRoaXMgdG9rZW4gaW4gdGhlIG9yaWdpbmFsIGlucHV0IHN0cmluZ1xuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgc3RhcnRJbmRleCgpIHtcbiAgICByZXR1cm4gdGhpcy50a1swXS5zO1xuICB9LFxuICAvKipcbiAgICogVGhlIGVuZCBpbmRleCBvZiB0aGlzIHRva2VuIGluIHRoZSBvcmlnaW5hbCBpbnB1dCBzdHJpbmcgKHVwIHRvIHRoaXNcbiAgICogaW5kZXggYnV0IG5vdCBpbmNsdWRpbmcgaXQpXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBlbmRJbmRleCgpIHtcbiAgICByZXR1cm4gdGhpcy50a1t0aGlzLnRrLmxlbmd0aCAtIDFdLmU7XG4gIH0sXG4gIC8qKlxuICBcdFJldHVybnMgYW4gb2JqZWN0ICBvZiByZWxldmFudCB2YWx1ZXMgZm9yIHRoaXMgdG9rZW4sIHdoaWNoIGluY2x1ZGVzIGtleXNcbiAgXHQqIHR5cGUgLSBLaW5kIG9mIHRva2VuICgndXJsJywgJ2VtYWlsJywgZXRjLilcbiAgXHQqIHZhbHVlIC0gT3JpZ2luYWwgdGV4dFxuICBcdCogaHJlZiAtIFRoZSB2YWx1ZSB0aGF0IHNob3VsZCBiZSBhZGRlZCB0byB0aGUgYW5jaG9yIHRhZydzIGhyZWZcbiAgXHRcdGF0dHJpYnV0ZVxuICBcdFx0QG1ldGhvZCB0b09iamVjdFxuICBcdEBwYXJhbSB7c3RyaW5nfSBbcHJvdG9jb2xdIGAnaHR0cCdgIGJ5IGRlZmF1bHRcbiAgKi9cbiAgdG9PYmplY3QocHJvdG9jb2wpIHtcbiAgICBpZiAocHJvdG9jb2wgPT09IHZvaWQgMCkge1xuICAgICAgcHJvdG9jb2wgPSBkZWZhdWx0cy5kZWZhdWx0UHJvdG9jb2w7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiB0aGlzLnQsXG4gICAgICB2YWx1ZTogdGhpcy50b1N0cmluZygpLFxuICAgICAgaXNMaW5rOiB0aGlzLmlzTGluayxcbiAgICAgIGhyZWY6IHRoaXMudG9IcmVmKHByb3RvY29sKSxcbiAgICAgIHN0YXJ0OiB0aGlzLnN0YXJ0SW5kZXgoKSxcbiAgICAgIGVuZDogdGhpcy5lbmRJbmRleCgpXG4gICAgfTtcbiAgfSxcbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSB7T3B0aW9uc30gb3B0aW9ucyBGb3JtYXR0aW5nIG9wdGlvblxuICAgKi9cbiAgdG9Gb3JtYXR0ZWRPYmplY3Qob3B0aW9ucykge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiB0aGlzLnQsXG4gICAgICB2YWx1ZTogdGhpcy50b0Zvcm1hdHRlZFN0cmluZyhvcHRpb25zKSxcbiAgICAgIGlzTGluazogdGhpcy5pc0xpbmssXG4gICAgICBocmVmOiB0aGlzLnRvRm9ybWF0dGVkSHJlZihvcHRpb25zKSxcbiAgICAgIHN0YXJ0OiB0aGlzLnN0YXJ0SW5kZXgoKSxcbiAgICAgIGVuZDogdGhpcy5lbmRJbmRleCgpXG4gICAgfTtcbiAgfSxcbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhpcyB0b2tlbiBzaG91bGQgYmUgcmVuZGVyZWQgYXMgYSBsaW5rIGFjY29yZGluZyB0byB0aGUgZ2l2ZW4gb3B0aW9uc1xuICAgKiBAcGFyYW0ge09wdGlvbnN9IG9wdGlvbnNcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICB2YWxpZGF0ZShvcHRpb25zKSB7XG4gICAgcmV0dXJuIG9wdGlvbnMuZ2V0KCd2YWxpZGF0ZScsIHRoaXMudG9TdHJpbmcoKSwgdGhpcyk7XG4gIH0sXG4gIC8qKlxuICAgKiBSZXR1cm4gYW4gb2JqZWN0IHRoYXQgcmVwcmVzZW50cyBob3cgdGhpcyBsaW5rIHNob3VsZCBiZSByZW5kZXJlZC5cbiAgICogQHBhcmFtIHtPcHRpb25zfSBvcHRpb25zIEZvcm1hdHRpbm5nIG9wdGlvbnNcbiAgICovXG4gIHJlbmRlcihvcHRpb25zKSB7XG4gICAgY29uc3QgdG9rZW4gPSB0aGlzO1xuICAgIGNvbnN0IGhyZWYgPSB0aGlzLnRvSHJlZihvcHRpb25zLmdldCgnZGVmYXVsdFByb3RvY29sJykpO1xuICAgIGNvbnN0IGZvcm1hdHRlZEhyZWYgPSBvcHRpb25zLmdldCgnZm9ybWF0SHJlZicsIGhyZWYsIHRoaXMpO1xuICAgIGNvbnN0IHRhZ05hbWUgPSBvcHRpb25zLmdldCgndGFnTmFtZScsIGhyZWYsIHRva2VuKTtcbiAgICBjb25zdCBjb250ZW50ID0gdGhpcy50b0Zvcm1hdHRlZFN0cmluZyhvcHRpb25zKTtcbiAgICBjb25zdCBhdHRyaWJ1dGVzID0ge307XG4gICAgY29uc3QgY2xhc3NOYW1lID0gb3B0aW9ucy5nZXQoJ2NsYXNzTmFtZScsIGhyZWYsIHRva2VuKTtcbiAgICBjb25zdCB0YXJnZXQgPSBvcHRpb25zLmdldCgndGFyZ2V0JywgaHJlZiwgdG9rZW4pO1xuICAgIGNvbnN0IHJlbCA9IG9wdGlvbnMuZ2V0KCdyZWwnLCBocmVmLCB0b2tlbik7XG4gICAgY29uc3QgYXR0cnMgPSBvcHRpb25zLmdldE9iaignYXR0cmlidXRlcycsIGhyZWYsIHRva2VuKTtcbiAgICBjb25zdCBldmVudExpc3RlbmVycyA9IG9wdGlvbnMuZ2V0T2JqKCdldmVudHMnLCBocmVmLCB0b2tlbik7XG4gICAgYXR0cmlidXRlcy5ocmVmID0gZm9ybWF0dGVkSHJlZjtcbiAgICBpZiAoY2xhc3NOYW1lKSB7XG4gICAgICBhdHRyaWJ1dGVzLmNsYXNzID0gY2xhc3NOYW1lO1xuICAgIH1cbiAgICBpZiAodGFyZ2V0KSB7XG4gICAgICBhdHRyaWJ1dGVzLnRhcmdldCA9IHRhcmdldDtcbiAgICB9XG4gICAgaWYgKHJlbCkge1xuICAgICAgYXR0cmlidXRlcy5yZWwgPSByZWw7XG4gICAgfVxuICAgIGlmIChhdHRycykge1xuICAgICAgYXNzaWduKGF0dHJpYnV0ZXMsIGF0dHJzKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHRhZ05hbWUsXG4gICAgICBhdHRyaWJ1dGVzLFxuICAgICAgY29udGVudCxcbiAgICAgIGV2ZW50TGlzdGVuZXJzXG4gICAgfTtcbiAgfVxufTtcblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgdG9rZW4gdGhhdCBjYW4gYmUgZW1pdHRlZCBieSB0aGUgcGFyc2VyIHN0YXRlIG1hY2hpbmVcbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIHJlYWRhYmxlIHR5cGUgb2YgdGhlIHRva2VuXG4gKiBAcGFyYW0ge29iamVjdH0gcHJvcHMgcHJvcGVydGllcyB0byBhc3NpZ24gb3Igb3ZlcnJpZGUsIGluY2x1ZGluZyBpc0xpbmsgPSB0cnVlIG9yIGZhbHNlXG4gKiBAcmV0dXJucyB7bmV3ICh2YWx1ZTogc3RyaW5nLCB0b2tlbnM6IFRva2VuW10pID0+IE11bHRpVG9rZW59IG5ldyB0b2tlbiBjbGFzc1xuICovXG5mdW5jdGlvbiBjcmVhdGVUb2tlbkNsYXNzKHR5cGUsIHByb3BzKSB7XG4gIGNsYXNzIFRva2VuIGV4dGVuZHMgTXVsdGlUb2tlbiB7XG4gICAgY29uc3RydWN0b3IodmFsdWUsIHRva2Vucykge1xuICAgICAgc3VwZXIodmFsdWUsIHRva2Vucyk7XG4gICAgICB0aGlzLnQgPSB0eXBlO1xuICAgIH1cbiAgfVxuICBmb3IgKGNvbnN0IHAgaW4gcHJvcHMpIHtcbiAgICBUb2tlbi5wcm90b3R5cGVbcF0gPSBwcm9wc1twXTtcbiAgfVxuICBUb2tlbi50ID0gdHlwZTtcbiAgcmV0dXJuIFRva2VuO1xufVxuXG4vKipcblx0UmVwcmVzZW50cyBhIGxpc3Qgb2YgdG9rZW5zIG1ha2luZyB1cCBhIHZhbGlkIGVtYWlsIGFkZHJlc3NcbiovXG5jb25zdCBFbWFpbCA9IGNyZWF0ZVRva2VuQ2xhc3MoJ2VtYWlsJywge1xuICBpc0xpbms6IHRydWUsXG4gIHRvSHJlZigpIHtcbiAgICByZXR1cm4gJ21haWx0bzonICsgdGhpcy50b1N0cmluZygpO1xuICB9XG59KTtcblxuLyoqXG5cdFJlcHJlc2VudHMgc29tZSBwbGFpbiB0ZXh0XG4qL1xuY29uc3QgVGV4dCA9IGNyZWF0ZVRva2VuQ2xhc3MoJ3RleHQnKTtcblxuLyoqXG5cdE11bHRpLWxpbmVicmVhayB0b2tlbiAtIHJlcHJlc2VudHMgYSBsaW5lIGJyZWFrXG5cdEBjbGFzcyBObFxuKi9cbmNvbnN0IE5sID0gY3JlYXRlVG9rZW5DbGFzcygnbmwnKTtcblxuLyoqXG5cdFJlcHJlc2VudHMgYSBsaXN0IG9mIHRleHQgdG9rZW5zIG1ha2luZyB1cCBhIHZhbGlkIFVSTFxuXHRAY2xhc3MgVXJsXG4qL1xuY29uc3QgVXJsID0gY3JlYXRlVG9rZW5DbGFzcygndXJsJywge1xuICBpc0xpbms6IHRydWUsXG4gIC8qKlxuICBcdExvd2VyY2FzZXMgcmVsZXZhbnQgcGFydHMgb2YgdGhlIGRvbWFpbiBhbmQgYWRkcyB0aGUgcHJvdG9jb2wgaWZcbiAgXHRyZXF1aXJlZC4gTm90ZSB0aGF0IHRoaXMgd2lsbCBub3QgZXNjYXBlIHVuc2FmZSBIVE1MIGNoYXJhY3RlcnMgaW4gdGhlXG4gIFx0VVJMLlxuICBcdFx0QHBhcmFtIHtzdHJpbmd9IFtzY2hlbWVdIGRlZmF1bHQgc2NoZW1lIChlLmcuLCAnaHR0cHMnKVxuICBcdEByZXR1cm4ge3N0cmluZ30gdGhlIGZ1bGwgaHJlZlxuICAqL1xuICB0b0hyZWYoc2NoZW1lKSB7XG4gICAgaWYgKHNjaGVtZSA9PT0gdm9pZCAwKSB7XG4gICAgICBzY2hlbWUgPSBkZWZhdWx0cy5kZWZhdWx0UHJvdG9jb2w7XG4gICAgfVxuICAgIC8vIENoZWNrIGlmIGFscmVhZHkgaGFzIGEgcHJlZml4IHNjaGVtZVxuICAgIHJldHVybiB0aGlzLmhhc1Byb3RvY29sKCkgPyB0aGlzLnYgOiBgJHtzY2hlbWV9Oi8vJHt0aGlzLnZ9YDtcbiAgfSxcbiAgLyoqXG4gICAqIENoZWNrIHdoZXRoZXIgdGhpcyBVUkwgdG9rZW4gaGFzIGEgcHJvdG9jb2xcbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGhhc1Byb3RvY29sKCkge1xuICAgIGNvbnN0IHRva2VucyA9IHRoaXMudGs7XG4gICAgcmV0dXJuIHRva2Vucy5sZW5ndGggPj0gMiAmJiB0b2tlbnNbMF0udCAhPT0gTE9DQUxIT1NUICYmIHRva2Vuc1sxXS50ID09PSBDT0xPTjtcbiAgfVxufSk7XG5cbnZhciBtdWx0aSA9IC8qI19fUFVSRV9fKi9PYmplY3QuZnJlZXplKHtcblx0X19wcm90b19fOiBudWxsLFxuXHRNdWx0aVRva2VuOiBNdWx0aVRva2VuLFxuXHRCYXNlOiBNdWx0aVRva2VuLFxuXHRjcmVhdGVUb2tlbkNsYXNzOiBjcmVhdGVUb2tlbkNsYXNzLFxuXHRFbWFpbDogRW1haWwsXG5cdFRleHQ6IFRleHQsXG5cdE5sOiBObCxcblx0VXJsOiBVcmxcbn0pO1xuXG4vKipcblx0Tm90IGV4YWN0bHkgcGFyc2VyLCBtb3JlIGxpa2UgdGhlIHNlY29uZC1zdGFnZSBzY2FubmVyIChhbHRob3VnaCB3ZSBjYW5cblx0dGhlb3JldGljYWxseSBob3Rzd2FwIHRoZSBjb2RlIGhlcmUgd2l0aCBhIHJlYWwgcGFyc2VyIGluIHRoZSBmdXR1cmUuLi4gYnV0XG5cdGZvciBhIGxpdHRsZSBVUkwtZmluZGluZyB1dGlsaXR5IGFic3RyYWN0IHN5bnRheCB0cmVlcyBtYXkgYmUgYSBsaXR0bGVcblx0b3ZlcmtpbGwpLlxuXG5cdFVSTCBmb3JtYXQ6IGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVVJJX3NjaGVtZVxuXHRFbWFpbCBmb3JtYXQ6IGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRW1haWxBZGRyZXNzIChsaW5rcyB0byBSRkMgaW5cblx0cmVmZXJlbmNlKVxuXG5cdEBtb2R1bGUgbGlua2lmeVxuXHRAc3VibW9kdWxlIHBhcnNlclxuXHRAbWFpbiBydW5cbiovXG5jb25zdCBtYWtlU3RhdGUgPSBhcmcgPT4gbmV3IFN0YXRlKGFyZyk7XG5cbi8qKlxuICogR2VuZXJhdGUgdGhlIHBhcnNlciBtdWx0aSB0b2tlbi1iYXNlZCBzdGF0ZSBtYWNoaW5lXG4gKiBAcGFyYW0ge3sgZ3JvdXBzOiBDb2xsZWN0aW9uczxzdHJpbmc+IH19IHRva2Vuc1xuICovXG5mdW5jdGlvbiBpbml0JDEoX3JlZikge1xuICBsZXQge1xuICAgIGdyb3Vwc1xuICB9ID0gX3JlZjtcbiAgLy8gVHlwZXMgb2YgY2hhcmFjdGVycyB0aGUgVVJMIGNhbiBkZWZpbml0ZWx5IGVuZCBpblxuICBjb25zdCBxc0FjY2VwdGluZyA9IGdyb3Vwcy5kb21haW4uY29uY2F0KFtBTVBFUlNBTkQsIEFTVEVSSVNLLCBBVCwgQkFDS1NMQVNILCBCQUNLVElDSywgQ0FSRVQsIERPTExBUiwgRVFVQUxTLCBIWVBIRU4sIE5VTSwgUEVSQ0VOVCwgUElQRSwgUExVUywgUE9VTkQsIFNMQVNILCBTWU0sIFRJTERFLCBVTkRFUlNDT1JFXSk7XG5cbiAgLy8gVHlwZXMgb2YgdG9rZW5zIHRoYXQgY2FuIGZvbGxvdyBhIFVSTCBhbmQgYmUgcGFydCBvZiB0aGUgcXVlcnkgc3RyaW5nXG4gIC8vIGJ1dCBjYW5ub3QgYmUgdGhlIHZlcnkgbGFzdCBjaGFyYWN0ZXJzXG4gIC8vIENoYXJhY3RlcnMgdGhhdCBjYW5ub3QgYXBwZWFyIGluIHRoZSBVUkwgYXQgYWxsIHNob3VsZCBiZSBleGNsdWRlZFxuICBjb25zdCBxc05vbkFjY2VwdGluZyA9IFtBUE9TVFJPUEhFLCBDTE9TRUFOR0xFQlJBQ0tFVCwgQ0xPU0VCUkFDRSwgQ0xPU0VCUkFDS0VULCBDTE9TRVBBUkVOLCBDT0xPTiwgQ09NTUEsIERPVCwgRVhDTEFNQVRJT04sIE9QRU5BTkdMRUJSQUNLRVQsIE9QRU5CUkFDRSwgT1BFTkJSQUNLRVQsIE9QRU5QQVJFTiwgUVVFUlksIFFVT1RFLCBTRU1JXTtcblxuICAvLyBGb3IgYWRkcmVzc2VzIHdpdGhvdXQgdGhlIG1haWx0byBwcmVmaXhcbiAgLy8gVG9rZW5zIGFsbG93ZWQgaW4gdGhlIGxvY2FscGFydCBvZiB0aGUgZW1haWxcbiAgY29uc3QgbG9jYWxwYXJ0QWNjZXB0aW5nID0gW0FNUEVSU0FORCwgQVBPU1RST1BIRSwgQVNURVJJU0ssIEJBQ0tTTEFTSCwgQkFDS1RJQ0ssIENBUkVULCBDTE9TRUJSQUNFLCBET0xMQVIsIEVRVUFMUywgSFlQSEVOLCBPUEVOQlJBQ0UsIFBFUkNFTlQsIFBJUEUsIFBMVVMsIFBPVU5ELCBRVUVSWSwgU0xBU0gsIFNZTSwgVElMREUsIFVOREVSU0NPUkVdO1xuXG4gIC8vIFRoZSB1bml2ZXJzYWwgc3RhcnRpbmcgc3RhdGUuXG4gIC8qKlxuICAgKiBAdHlwZSBTdGF0ZTxUb2tlbj5cbiAgICovXG4gIGNvbnN0IFN0YXJ0ID0gbWFrZVN0YXRlKCk7XG4gIGNvbnN0IExvY2FscGFydCA9IHR0KFN0YXJ0LCBUSUxERSk7IC8vIExvY2FsIHBhcnQgb2YgdGhlIGVtYWlsIGFkZHJlc3NcbiAgdGEoTG9jYWxwYXJ0LCBsb2NhbHBhcnRBY2NlcHRpbmcsIExvY2FscGFydCk7XG4gIHRhKExvY2FscGFydCwgZ3JvdXBzLmRvbWFpbiwgTG9jYWxwYXJ0KTtcbiAgY29uc3QgRG9tYWluID0gbWFrZVN0YXRlKCksXG4gICAgU2NoZW1lID0gbWFrZVN0YXRlKCksXG4gICAgU2xhc2hTY2hlbWUgPSBtYWtlU3RhdGUoKTtcbiAgdGEoU3RhcnQsIGdyb3Vwcy5kb21haW4sIERvbWFpbik7IC8vIHBhcnNlZCBzdHJpbmcgZW5kcyB3aXRoIGEgcG90ZW50aWFsIGRvbWFpbiBuYW1lIChBKVxuICB0YShTdGFydCwgZ3JvdXBzLnNjaGVtZSwgU2NoZW1lKTsgLy8gZS5nLiwgJ21haWx0bydcbiAgdGEoU3RhcnQsIGdyb3Vwcy5zbGFzaHNjaGVtZSwgU2xhc2hTY2hlbWUpOyAvLyBlLmcuLCAnaHR0cCdcblxuICB0YShEb21haW4sIGxvY2FscGFydEFjY2VwdGluZywgTG9jYWxwYXJ0KTtcbiAgdGEoRG9tYWluLCBncm91cHMuZG9tYWluLCBEb21haW4pO1xuICBjb25zdCBMb2NhbHBhcnRBdCA9IHR0KERvbWFpbiwgQVQpOyAvLyBMb2NhbCBwYXJ0IG9mIHRoZSBlbWFpbCBhZGRyZXNzIHBsdXMgQFxuXG4gIHR0KExvY2FscGFydCwgQVQsIExvY2FscGFydEF0KTsgLy8gY2xvc2UgdG8gYW4gZW1haWwgYWRkcmVzcyBub3dcblxuICAvLyBMb2NhbCBwYXJ0IG9mIGFuIGVtYWlsIGFkZHJlc3MgY2FuIGJlIGUuZy4gJ2h0dHAnIG9yICdtYWlsdG8nXG4gIHR0KFNjaGVtZSwgQVQsIExvY2FscGFydEF0KTtcbiAgdHQoU2xhc2hTY2hlbWUsIEFULCBMb2NhbHBhcnRBdCk7XG4gIGNvbnN0IExvY2FscGFydERvdCA9IHR0KExvY2FscGFydCwgRE9UKTsgLy8gTG9jYWwgcGFydCBvZiB0aGUgZW1haWwgYWRkcmVzcyBwbHVzICcuJyAobG9jYWxwYXJ0IGNhbm5vdCBlbmQgaW4gLilcbiAgdGEoTG9jYWxwYXJ0RG90LCBsb2NhbHBhcnRBY2NlcHRpbmcsIExvY2FscGFydCk7XG4gIHRhKExvY2FscGFydERvdCwgZ3JvdXBzLmRvbWFpbiwgTG9jYWxwYXJ0KTtcbiAgY29uc3QgRW1haWxEb21haW4gPSBtYWtlU3RhdGUoKTtcbiAgdGEoTG9jYWxwYXJ0QXQsIGdyb3Vwcy5kb21haW4sIEVtYWlsRG9tYWluKTsgLy8gcGFyc2VkIHN0cmluZyBzdGFydHMgd2l0aCBsb2NhbCBlbWFpbCBpbmZvICsgQCB3aXRoIGEgcG90ZW50aWFsIGRvbWFpbiBuYW1lXG4gIHRhKEVtYWlsRG9tYWluLCBncm91cHMuZG9tYWluLCBFbWFpbERvbWFpbik7XG4gIGNvbnN0IEVtYWlsRG9tYWluRG90ID0gdHQoRW1haWxEb21haW4sIERPVCk7IC8vIGRvbWFpbiBmb2xsb3dlZCBieSBET1RcbiAgdGEoRW1haWxEb21haW5Eb3QsIGdyb3Vwcy5kb21haW4sIEVtYWlsRG9tYWluKTtcbiAgY29uc3QgRW1haWwkMSA9IG1ha2VTdGF0ZShFbWFpbCk7IC8vIFBvc3NpYmxlIGVtYWlsIGFkZHJlc3MgKGNvdWxkIGhhdmUgbW9yZSB0bGRzKVxuICB0YShFbWFpbERvbWFpbkRvdCwgZ3JvdXBzLnRsZCwgRW1haWwkMSk7XG4gIHRhKEVtYWlsRG9tYWluRG90LCBncm91cHMudXRsZCwgRW1haWwkMSk7XG4gIHR0KExvY2FscGFydEF0LCBMT0NBTEhPU1QsIEVtYWlsJDEpO1xuXG4gIC8vIEh5cGhlbiBjYW4ganVtcCBiYWNrIHRvIGEgZG9tYWluIG5hbWVcbiAgY29uc3QgRW1haWxEb21haW5IeXBoZW4gPSB0dChFbWFpbERvbWFpbiwgSFlQSEVOKTsgLy8gcGFyc2VkIHN0cmluZyBzdGFydHMgd2l0aCBsb2NhbCBlbWFpbCBpbmZvICsgQCB3aXRoIGEgcG90ZW50aWFsIGRvbWFpbiBuYW1lXG4gIHRhKEVtYWlsRG9tYWluSHlwaGVuLCBncm91cHMuZG9tYWluLCBFbWFpbERvbWFpbik7XG4gIHRhKEVtYWlsJDEsIGdyb3Vwcy5kb21haW4sIEVtYWlsRG9tYWluKTtcbiAgdHQoRW1haWwkMSwgRE9ULCBFbWFpbERvbWFpbkRvdCk7XG4gIHR0KEVtYWlsJDEsIEhZUEhFTiwgRW1haWxEb21haW5IeXBoZW4pO1xuXG4gIC8vIEZpbmFsIHBvc3NpYmxlIGVtYWlsIHN0YXRlc1xuICBjb25zdCBFbWFpbENvbG9uID0gdHQoRW1haWwkMSwgQ09MT04pOyAvLyBVUkwgZm9sbG93ZWQgYnkgY29sb24gKHBvdGVudGlhbCBwb3J0IG51bWJlciBoZXJlKVxuICAvKmNvbnN0IEVtYWlsQ29sb25Qb3J0ID0gKi9cbiAgdGEoRW1haWxDb2xvbiwgZ3JvdXBzLm51bWVyaWMsIEVtYWlsKTsgLy8gVVJMIGZvbGxvd2VkIGJ5IGNvbG9uIGFuZCBwb3J0IG51bW5lclxuXG4gIC8vIEFjY291bnQgZm9yIGRvdHMgYW5kIGh5cGhlbnMuIEh5cGhlbnMgYXJlIHVzdWFsbHkgcGFydHMgb2YgZG9tYWluIG5hbWVzXG4gIC8vIChidXQgbm90IFRMRHMpXG4gIGNvbnN0IERvbWFpbkh5cGhlbiA9IHR0KERvbWFpbiwgSFlQSEVOKTsgLy8gZG9tYWluIGZvbGxvd2VkIGJ5IGh5cGhlblxuICBjb25zdCBEb21haW5Eb3QgPSB0dChEb21haW4sIERPVCk7IC8vIGRvbWFpbiBmb2xsb3dlZCBieSBET1RcbiAgdGEoRG9tYWluSHlwaGVuLCBncm91cHMuZG9tYWluLCBEb21haW4pO1xuICB0YShEb21haW5Eb3QsIGxvY2FscGFydEFjY2VwdGluZywgTG9jYWxwYXJ0KTtcbiAgdGEoRG9tYWluRG90LCBncm91cHMuZG9tYWluLCBEb21haW4pO1xuICBjb25zdCBEb21haW5Eb3RUbGQgPSBtYWtlU3RhdGUoVXJsKTsgLy8gU2ltcGxlc3QgcG9zc2libGUgVVJMIHdpdGggbm8gcXVlcnkgc3RyaW5nXG4gIHRhKERvbWFpbkRvdCwgZ3JvdXBzLnRsZCwgRG9tYWluRG90VGxkKTtcbiAgdGEoRG9tYWluRG90LCBncm91cHMudXRsZCwgRG9tYWluRG90VGxkKTtcbiAgdGEoRG9tYWluRG90VGxkLCBncm91cHMuZG9tYWluLCBEb21haW4pO1xuICB0YShEb21haW5Eb3RUbGQsIGxvY2FscGFydEFjY2VwdGluZywgTG9jYWxwYXJ0KTtcbiAgdHQoRG9tYWluRG90VGxkLCBET1QsIERvbWFpbkRvdCk7XG4gIHR0KERvbWFpbkRvdFRsZCwgSFlQSEVOLCBEb21haW5IeXBoZW4pO1xuICB0dChEb21haW5Eb3RUbGQsIEFULCBMb2NhbHBhcnRBdCk7XG4gIGNvbnN0IERvbWFpbkRvdFRsZENvbG9uID0gdHQoRG9tYWluRG90VGxkLCBDT0xPTik7IC8vIFVSTCBmb2xsb3dlZCBieSBjb2xvbiAocG90ZW50aWFsIHBvcnQgbnVtYmVyIGhlcmUpXG4gIGNvbnN0IERvbWFpbkRvdFRsZENvbG9uUG9ydCA9IG1ha2VTdGF0ZShVcmwpOyAvLyBUTEQgZm9sbG93ZWQgYnkgYSBwb3J0IG51bWJlclxuICB0YShEb21haW5Eb3RUbGRDb2xvbiwgZ3JvdXBzLm51bWVyaWMsIERvbWFpbkRvdFRsZENvbG9uUG9ydCk7XG5cbiAgLy8gTG9uZyBVUkwgd2l0aCBvcHRpb25hbCBwb3J0IGFuZCBtYXliZSBxdWVyeSBzdHJpbmdcbiAgY29uc3QgVXJsJDEgPSBtYWtlU3RhdGUoVXJsKTtcblxuICAvLyBVUkwgd2l0aCBleHRyYSBzeW1ib2xzIGF0IHRoZSBlbmQsIGZvbGxvd2VkIGJ5IGFuIG9wZW5pbmcgYnJhY2tldFxuICBjb25zdCBVcmxOb25hY2NlcHQgPSBtYWtlU3RhdGUoKTsgLy8gVVJMIGZvbGxvd2VkIGJ5IHNvbWUgc3ltYm9scyAod2lsbCBub3QgYmUgcGFydCBvZiB0aGUgZmluYWwgVVJMKVxuXG4gIC8vIFF1ZXJ5IHN0cmluZ3NcbiAgdGEoVXJsJDEsIHFzQWNjZXB0aW5nLCBVcmwkMSk7XG4gIHRhKFVybCQxLCBxc05vbkFjY2VwdGluZywgVXJsTm9uYWNjZXB0KTtcbiAgdGEoVXJsTm9uYWNjZXB0LCBxc0FjY2VwdGluZywgVXJsJDEpO1xuICB0YShVcmxOb25hY2NlcHQsIHFzTm9uQWNjZXB0aW5nLCBVcmxOb25hY2NlcHQpO1xuXG4gIC8vIEJlY29tZSByZWFsIFVSTHMgYWZ0ZXIgYFNMQVNIYCBvciBgQ09MT04gTlVNIFNMQVNIYFxuICAvLyBIZXJlIHdvcmtzIHdpdGggb3Igd2l0aG91dCBzY2hlbWU6Ly8gcHJlZml4XG4gIHR0KERvbWFpbkRvdFRsZCwgU0xBU0gsIFVybCQxKTtcbiAgdHQoRG9tYWluRG90VGxkQ29sb25Qb3J0LCBTTEFTSCwgVXJsJDEpO1xuXG4gIC8vIE5vdGUgdGhhdCBkb21haW5zIHRoYXQgYmVnaW4gd2l0aCBzY2hlbWVzIGFyZSB0cmVhdGVkIHNsaWdobHkgZGlmZmVyZW50bHlcbiAgY29uc3QgU2NoZW1lQ29sb24gPSB0dChTY2hlbWUsIENPTE9OKTsgLy8gZS5nLiwgJ21haWx0bzonXG4gIGNvbnN0IFNsYXNoU2NoZW1lQ29sb24gPSB0dChTbGFzaFNjaGVtZSwgQ09MT04pOyAvLyBlLmcuLCAnaHR0cDonXG4gIGNvbnN0IFNsYXNoU2NoZW1lQ29sb25TbGFzaCA9IHR0KFNsYXNoU2NoZW1lQ29sb24sIFNMQVNIKTsgLy8gZS5nLiwgJ2h0dHA6LydcblxuICBjb25zdCBVcmlQcmVmaXggPSB0dChTbGFzaFNjaGVtZUNvbG9uU2xhc2gsIFNMQVNIKTsgLy8gZS5nLiwgJ2h0dHA6Ly8nXG5cbiAgLy8gU2NoZW1lIHN0YXRlcyBjYW4gdHJhbnNpdGlvbiB0byBkb21haW4gc3RhdGVzXG4gIHRhKFNjaGVtZSwgZ3JvdXBzLmRvbWFpbiwgRG9tYWluKTtcbiAgdHQoU2NoZW1lLCBET1QsIERvbWFpbkRvdCk7XG4gIHR0KFNjaGVtZSwgSFlQSEVOLCBEb21haW5IeXBoZW4pO1xuICB0YShTbGFzaFNjaGVtZSwgZ3JvdXBzLmRvbWFpbiwgRG9tYWluKTtcbiAgdHQoU2xhc2hTY2hlbWUsIERPVCwgRG9tYWluRG90KTtcbiAgdHQoU2xhc2hTY2hlbWUsIEhZUEhFTiwgRG9tYWluSHlwaGVuKTtcblxuICAvLyBGb3JjZSBVUkwgd2l0aCBzY2hlbWUgcHJlZml4IGZvbGxvd2VkIGJ5IGFueXRoaW5nIHNhbmVcbiAgdGEoU2NoZW1lQ29sb24sIGdyb3Vwcy5kb21haW4sIFVybCQxKTtcbiAgdHQoU2NoZW1lQ29sb24sIFNMQVNILCBVcmwkMSk7XG4gIHRhKFVyaVByZWZpeCwgZ3JvdXBzLmRvbWFpbiwgVXJsJDEpO1xuICB0YShVcmlQcmVmaXgsIHFzQWNjZXB0aW5nLCBVcmwkMSk7XG4gIHR0KFVyaVByZWZpeCwgU0xBU0gsIFVybCQxKTtcblxuICAvLyBVUkwsIGZvbGxvd2VkIGJ5IGFuIG9wZW5pbmcgYnJhY2tldFxuICBjb25zdCBVcmxPcGVuYnJhY2UgPSB0dChVcmwkMSwgT1BFTkJSQUNFKTsgLy8gVVJMIGZvbGxvd2VkIGJ5IHtcbiAgY29uc3QgVXJsT3BlbmJyYWNrZXQgPSB0dChVcmwkMSwgT1BFTkJSQUNLRVQpOyAvLyBVUkwgZm9sbG93ZWQgYnkgW1xuICBjb25zdCBVcmxPcGVuYW5nbGVicmFja2V0ID0gdHQoVXJsJDEsIE9QRU5BTkdMRUJSQUNLRVQpOyAvLyBVUkwgZm9sbG93ZWQgYnkgPFxuICBjb25zdCBVcmxPcGVucGFyZW4gPSB0dChVcmwkMSwgT1BFTlBBUkVOKTsgLy8gVVJMIGZvbGxvd2VkIGJ5IChcblxuICB0dChVcmxOb25hY2NlcHQsIE9QRU5CUkFDRSwgVXJsT3BlbmJyYWNlKTtcbiAgdHQoVXJsTm9uYWNjZXB0LCBPUEVOQlJBQ0tFVCwgVXJsT3BlbmJyYWNrZXQpO1xuICB0dChVcmxOb25hY2NlcHQsIE9QRU5BTkdMRUJSQUNLRVQsIFVybE9wZW5hbmdsZWJyYWNrZXQpO1xuICB0dChVcmxOb25hY2NlcHQsIE9QRU5QQVJFTiwgVXJsT3BlbnBhcmVuKTtcblxuICAvLyBDbG9zaW5nIGJyYWNrZXQgY29tcG9uZW50LiBUaGlzIGNoYXJhY3RlciBXSUxMIGJlIGluY2x1ZGVkIGluIHRoZSBVUkxcbiAgdHQoVXJsT3BlbmJyYWNlLCBDTE9TRUJSQUNFLCBVcmwkMSk7XG4gIHR0KFVybE9wZW5icmFja2V0LCBDTE9TRUJSQUNLRVQsIFVybCQxKTtcbiAgdHQoVXJsT3BlbmFuZ2xlYnJhY2tldCwgQ0xPU0VBTkdMRUJSQUNLRVQsIFVybCQxKTtcbiAgdHQoVXJsT3BlbnBhcmVuLCBDTE9TRVBBUkVOLCBVcmwkMSk7XG4gIHR0KFVybE9wZW5icmFjZSwgQ0xPU0VCUkFDRSwgVXJsJDEpO1xuXG4gIC8vIFVSTCB0aGF0IGJlaW5ncyB3aXRoIGFuIG9wZW5pbmcgYnJhY2tldCwgZm9sbG93ZWQgYnkgYSBzeW1ib2xzLlxuICAvLyBOb3RlIHRoYXQgdGhlIGZpbmFsIHN0YXRlIGNhbiBzdGlsbCBiZSBgVXJsT3BlbmJyYWNlYCAoaWYgdGhlIFVSTCBvbmx5XG4gIC8vIGhhcyBhIHNpbmdsZSBvcGVuaW5nIGJyYWNrZXQgZm9yIHNvbWUgcmVhc29uKS5cbiAgY29uc3QgVXJsT3BlbmJyYWNlUSA9IG1ha2VTdGF0ZShVcmwpOyAvLyBVUkwgZm9sbG93ZWQgYnkgeyBhbmQgc29tZSBzeW1ib2xzIHRoYXQgdGhlIFVSTCBjYW4gZW5kIGl0XG4gIGNvbnN0IFVybE9wZW5icmFja2V0USA9IG1ha2VTdGF0ZShVcmwpOyAvLyBVUkwgZm9sbG93ZWQgYnkgWyBhbmQgc29tZSBzeW1ib2xzIHRoYXQgdGhlIFVSTCBjYW4gZW5kIGl0XG4gIGNvbnN0IFVybE9wZW5hbmdsZWJyYWNrZXRRID0gbWFrZVN0YXRlKFVybCk7IC8vIFVSTCBmb2xsb3dlZCBieSA8IGFuZCBzb21lIHN5bWJvbHMgdGhhdCB0aGUgVVJMIGNhbiBlbmQgaXRcbiAgY29uc3QgVXJsT3BlbnBhcmVuUSA9IG1ha2VTdGF0ZShVcmwpOyAvLyBVUkwgZm9sbG93ZWQgYnkgKCBhbmQgc29tZSBzeW1ib2xzIHRoYXQgdGhlIFVSTCBjYW4gZW5kIGl0XG4gIHRhKFVybE9wZW5icmFjZSwgcXNBY2NlcHRpbmcsIFVybE9wZW5icmFjZVEpO1xuICB0YShVcmxPcGVuYnJhY2tldCwgcXNBY2NlcHRpbmcsIFVybE9wZW5icmFja2V0USk7XG4gIHRhKFVybE9wZW5hbmdsZWJyYWNrZXQsIHFzQWNjZXB0aW5nLCBVcmxPcGVuYW5nbGVicmFja2V0USk7XG4gIHRhKFVybE9wZW5wYXJlbiwgcXNBY2NlcHRpbmcsIFVybE9wZW5wYXJlblEpO1xuICBjb25zdCBVcmxPcGVuYnJhY2VTeW1zID0gbWFrZVN0YXRlKCk7IC8vIFVybE9wZW5icmFjZSBmb2xsb3dlZCBieSBzb21lIHN5bWJvbHMgaXQgY2Fubm90IGVuZCBpdFxuICBjb25zdCBVcmxPcGVuYnJhY2tldFN5bXMgPSBtYWtlU3RhdGUoKTsgLy8gVXJsT3BlbmJyYWNrZXRRIGZvbGxvd2VkIGJ5IHNvbWUgc3ltYm9scyBpdCBjYW5ub3QgZW5kIGl0XG4gIGNvbnN0IFVybE9wZW5hbmdsZWJyYWNrZXRTeW1zID0gbWFrZVN0YXRlKCk7IC8vIFVybE9wZW5hbmdsZWJyYWNrZXRRIGZvbGxvd2VkIGJ5IHNvbWUgc3ltYm9scyBpdCBjYW5ub3QgZW5kIGl0XG4gIGNvbnN0IFVybE9wZW5wYXJlblN5bXMgPSBtYWtlU3RhdGUoKTsgLy8gVXJsT3BlbnBhcmVuUSBmb2xsb3dlZCBieSBzb21lIHN5bWJvbHMgaXQgY2Fubm90IGVuZCBpdFxuICB0YShVcmxPcGVuYnJhY2UsIHFzTm9uQWNjZXB0aW5nKTtcbiAgdGEoVXJsT3BlbmJyYWNrZXQsIHFzTm9uQWNjZXB0aW5nKTtcbiAgdGEoVXJsT3BlbmFuZ2xlYnJhY2tldCwgcXNOb25BY2NlcHRpbmcpO1xuICB0YShVcmxPcGVucGFyZW4sIHFzTm9uQWNjZXB0aW5nKTtcblxuICAvLyBVUkwgdGhhdCBiZWdpbnMgd2l0aCBhbiBvcGVuaW5nIGJyYWNrZXQsIGZvbGxvd2VkIGJ5IHNvbWUgc3ltYm9sc1xuICB0YShVcmxPcGVuYnJhY2VRLCBxc0FjY2VwdGluZywgVXJsT3BlbmJyYWNlUSk7XG4gIHRhKFVybE9wZW5icmFja2V0USwgcXNBY2NlcHRpbmcsIFVybE9wZW5icmFja2V0USk7XG4gIHRhKFVybE9wZW5hbmdsZWJyYWNrZXRRLCBxc0FjY2VwdGluZywgVXJsT3BlbmFuZ2xlYnJhY2tldFEpO1xuICB0YShVcmxPcGVucGFyZW5RLCBxc0FjY2VwdGluZywgVXJsT3BlbnBhcmVuUSk7XG4gIHRhKFVybE9wZW5icmFjZVEsIHFzTm9uQWNjZXB0aW5nLCBVcmxPcGVuYnJhY2VRKTtcbiAgdGEoVXJsT3BlbmJyYWNrZXRRLCBxc05vbkFjY2VwdGluZywgVXJsT3BlbmJyYWNrZXRRKTtcbiAgdGEoVXJsT3BlbmFuZ2xlYnJhY2tldFEsIHFzTm9uQWNjZXB0aW5nLCBVcmxPcGVuYW5nbGVicmFja2V0USk7XG4gIHRhKFVybE9wZW5wYXJlblEsIHFzTm9uQWNjZXB0aW5nLCBVcmxPcGVucGFyZW5RKTtcbiAgdGEoVXJsT3BlbmJyYWNlU3ltcywgcXNBY2NlcHRpbmcsIFVybE9wZW5icmFjZVN5bXMpO1xuICB0YShVcmxPcGVuYnJhY2tldFN5bXMsIHFzQWNjZXB0aW5nLCBVcmxPcGVuYnJhY2tldFEpO1xuICB0YShVcmxPcGVuYW5nbGVicmFja2V0U3ltcywgcXNBY2NlcHRpbmcsIFVybE9wZW5hbmdsZWJyYWNrZXRRKTtcbiAgdGEoVXJsT3BlbnBhcmVuU3ltcywgcXNBY2NlcHRpbmcsIFVybE9wZW5wYXJlblEpO1xuICB0YShVcmxPcGVuYnJhY2VTeW1zLCBxc05vbkFjY2VwdGluZywgVXJsT3BlbmJyYWNlU3ltcyk7XG4gIHRhKFVybE9wZW5icmFja2V0U3ltcywgcXNOb25BY2NlcHRpbmcsIFVybE9wZW5icmFja2V0U3ltcyk7XG4gIHRhKFVybE9wZW5hbmdsZWJyYWNrZXRTeW1zLCBxc05vbkFjY2VwdGluZywgVXJsT3BlbmFuZ2xlYnJhY2tldFN5bXMpO1xuICB0YShVcmxPcGVucGFyZW5TeW1zLCBxc05vbkFjY2VwdGluZywgVXJsT3BlbnBhcmVuU3ltcyk7XG5cbiAgLy8gQ2xvc2UgYnJhY2UvYnJhY2tldCB0byBiZWNvbWUgcmVndWxhciBVUkxcbiAgdHQoVXJsT3BlbmJyYWNrZXRRLCBDTE9TRUJSQUNLRVQsIFVybCQxKTtcbiAgdHQoVXJsT3BlbmFuZ2xlYnJhY2tldFEsIENMT1NFQU5HTEVCUkFDS0VULCBVcmwkMSk7XG4gIHR0KFVybE9wZW5wYXJlblEsIENMT1NFUEFSRU4sIFVybCQxKTtcbiAgdHQoVXJsT3BlbmJyYWNlUSwgQ0xPU0VCUkFDRSwgVXJsJDEpO1xuICB0dChVcmxPcGVuYnJhY2tldFN5bXMsIENMT1NFQlJBQ0tFVCwgVXJsJDEpO1xuICB0dChVcmxPcGVuYW5nbGVicmFja2V0U3ltcywgQ0xPU0VBTkdMRUJSQUNLRVQsIFVybCQxKTtcbiAgdHQoVXJsT3BlbnBhcmVuU3ltcywgQ0xPU0VQQVJFTiwgVXJsJDEpO1xuICB0dChVcmxPcGVuYnJhY2VTeW1zLCBDTE9TRVBBUkVOLCBVcmwkMSk7XG4gIHR0KFN0YXJ0LCBMT0NBTEhPU1QsIERvbWFpbkRvdFRsZCk7IC8vIGxvY2FsaG9zdCBpcyBhIHZhbGlkIFVSTCBzdGF0ZVxuICB0dChTdGFydCwgTkwkMSwgTmwpOyAvLyBzaW5nbGUgbmV3IGxpbmVcblxuICByZXR1cm4ge1xuICAgIHN0YXJ0OiBTdGFydCxcbiAgICB0b2tlbnM6IHRrXG4gIH07XG59XG5cbi8qKlxuICogUnVuIHRoZSBwYXJzZXIgc3RhdGUgbWFjaGluZSBvbiBhIGxpc3Qgb2Ygc2Nhbm5lZCBzdHJpbmctYmFzZWQgdG9rZW5zIHRvXG4gKiBjcmVhdGUgYSBsaXN0IG9mIG11bHRpIHRva2VucywgZWFjaCBvZiB3aGljaCByZXByZXNlbnRzIGEgVVJMLCBlbWFpbCBhZGRyZXNzLFxuICogcGxhaW4gdGV4dCwgZXRjLlxuICpcbiAqIEBwYXJhbSB7U3RhdGU8TXVsdGlUb2tlbj59IHN0YXJ0IHBhcnNlciBzdGFydCBzdGF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IGlucHV0IHRoZSBvcmlnaW5hbCBpbnB1dCB1c2VkIHRvIGdlbmVyYXRlIHRoZSBnaXZlbiB0b2tlbnNcbiAqIEBwYXJhbSB7VG9rZW5bXX0gdG9rZW5zIGxpc3Qgb2Ygc2Nhbm5lZCB0b2tlbnNcbiAqIEByZXR1cm5zIHtNdWx0aVRva2VuW119XG4gKi9cbmZ1bmN0aW9uIHJ1bihzdGFydCwgaW5wdXQsIHRva2Vucykge1xuICBsZXQgbGVuID0gdG9rZW5zLmxlbmd0aDtcbiAgbGV0IGN1cnNvciA9IDA7XG4gIGxldCBtdWx0aXMgPSBbXTtcbiAgbGV0IHRleHRUb2tlbnMgPSBbXTtcbiAgd2hpbGUgKGN1cnNvciA8IGxlbikge1xuICAgIGxldCBzdGF0ZSA9IHN0YXJ0O1xuICAgIGxldCBzZWNvbmRTdGF0ZSA9IG51bGw7XG4gICAgbGV0IG5leHRTdGF0ZSA9IG51bGw7XG4gICAgbGV0IG11bHRpTGVuZ3RoID0gMDtcbiAgICBsZXQgbGF0ZXN0QWNjZXB0aW5nID0gbnVsbDtcbiAgICBsZXQgc2luY2VBY2NlcHRzID0gLTE7XG4gICAgd2hpbGUgKGN1cnNvciA8IGxlbiAmJiAhKHNlY29uZFN0YXRlID0gc3RhdGUuZ28odG9rZW5zW2N1cnNvcl0udCkpKSB7XG4gICAgICAvLyBTdGFydGluZyB0b2tlbnMgd2l0aCBub3doZXJlIHRvIGp1bXAgdG8uXG4gICAgICAvLyBDb25zaWRlciB0aGVzZSB0byBiZSBqdXN0IHBsYWluIHRleHRcbiAgICAgIHRleHRUb2tlbnMucHVzaCh0b2tlbnNbY3Vyc29yKytdKTtcbiAgICB9XG4gICAgd2hpbGUgKGN1cnNvciA8IGxlbiAmJiAobmV4dFN0YXRlID0gc2Vjb25kU3RhdGUgfHwgc3RhdGUuZ28odG9rZW5zW2N1cnNvcl0udCkpKSB7XG4gICAgICAvLyBHZXQgdGhlIG5leHQgc3RhdGVcbiAgICAgIHNlY29uZFN0YXRlID0gbnVsbDtcbiAgICAgIHN0YXRlID0gbmV4dFN0YXRlO1xuXG4gICAgICAvLyBLZWVwIHRyYWNrIG9mIHRoZSBsYXRlc3QgYWNjZXB0aW5nIHN0YXRlXG4gICAgICBpZiAoc3RhdGUuYWNjZXB0cygpKSB7XG4gICAgICAgIHNpbmNlQWNjZXB0cyA9IDA7XG4gICAgICAgIGxhdGVzdEFjY2VwdGluZyA9IHN0YXRlO1xuICAgICAgfSBlbHNlIGlmIChzaW5jZUFjY2VwdHMgPj0gMCkge1xuICAgICAgICBzaW5jZUFjY2VwdHMrKztcbiAgICAgIH1cbiAgICAgIGN1cnNvcisrO1xuICAgICAgbXVsdGlMZW5ndGgrKztcbiAgICB9XG4gICAgaWYgKHNpbmNlQWNjZXB0cyA8IDApIHtcbiAgICAgIC8vIE5vIGFjY2VwdGluZyBzdGF0ZSB3YXMgZm91bmQsIHBhcnQgb2YgYSByZWd1bGFyIHRleHQgdG9rZW4gYWRkXG4gICAgICAvLyB0aGUgZmlyc3QgdGV4dCB0b2tlbiB0byB0aGUgdGV4dCB0b2tlbnMgYXJyYXkgYW5kIHRyeSBhZ2FpbiBmcm9tXG4gICAgICAvLyB0aGUgbmV4dFxuICAgICAgY3Vyc29yIC09IG11bHRpTGVuZ3RoO1xuICAgICAgaWYgKGN1cnNvciA8IGxlbikge1xuICAgICAgICB0ZXh0VG9rZW5zLnB1c2godG9rZW5zW2N1cnNvcl0pO1xuICAgICAgICBjdXJzb3IrKztcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQWNjZXB0aW5nIHN0YXRlIVxuICAgICAgLy8gRmlyc3QgY2xvc2Ugb2ZmIHRoZSB0ZXh0VG9rZW5zIChpZiBhdmFpbGFibGUpXG4gICAgICBpZiAodGV4dFRva2Vucy5sZW5ndGggPiAwKSB7XG4gICAgICAgIG11bHRpcy5wdXNoKGluaXRNdWx0aVRva2VuKFRleHQsIGlucHV0LCB0ZXh0VG9rZW5zKSk7XG4gICAgICAgIHRleHRUb2tlbnMgPSBbXTtcbiAgICAgIH1cblxuICAgICAgLy8gUm9sbCBiYWNrIHRvIHRoZSBsYXRlc3QgYWNjZXB0aW5nIHN0YXRlXG4gICAgICBjdXJzb3IgLT0gc2luY2VBY2NlcHRzO1xuICAgICAgbXVsdGlMZW5ndGggLT0gc2luY2VBY2NlcHRzO1xuXG4gICAgICAvLyBDcmVhdGUgYSBuZXcgbXVsdGl0b2tlblxuICAgICAgY29uc3QgTXVsdGkgPSBsYXRlc3RBY2NlcHRpbmcudDtcbiAgICAgIGNvbnN0IHN1YnRva2VucyA9IHRva2Vucy5zbGljZShjdXJzb3IgLSBtdWx0aUxlbmd0aCwgY3Vyc29yKTtcbiAgICAgIG11bHRpcy5wdXNoKGluaXRNdWx0aVRva2VuKE11bHRpLCBpbnB1dCwgc3VidG9rZW5zKSk7XG4gICAgfVxuICB9XG5cbiAgLy8gRmluYWxseSBjbG9zZSBvZmYgdGhlIHRleHRUb2tlbnMgKGlmIGF2YWlsYWJsZSlcbiAgaWYgKHRleHRUb2tlbnMubGVuZ3RoID4gMCkge1xuICAgIG11bHRpcy5wdXNoKGluaXRNdWx0aVRva2VuKFRleHQsIGlucHV0LCB0ZXh0VG9rZW5zKSk7XG4gIH1cbiAgcmV0dXJuIG11bHRpcztcbn1cblxuLyoqXG4gKiBVdGlsaXR5IGZ1bmN0aW9uIGZvciBpbnN0YW50aWF0aW5nIGEgbmV3IG11bHRpdG9rZW4gd2l0aCBhbGwgdGhlIHJlbGV2YW50XG4gKiBmaWVsZHMgZHVyaW5nIHBhcnNpbmcuXG4gKiBAcGFyYW0ge25ldyAodmFsdWU6IHN0cmluZywgdG9rZW5zOiBUb2tlbltdKSA9PiBNdWx0aVRva2VufSBNdWx0aSBjbGFzcyB0byBpbnN0YW50aWF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IGlucHV0IG9yaWdpbmFsIGlucHV0IHN0cmluZ1xuICogQHBhcmFtIHtUb2tlbltdfSB0b2tlbnMgY29uc2VjdXRpdmUgdG9rZW5zIHNjYW5uZWQgZnJvbSBpbnB1dCBzdHJpbmdcbiAqIEByZXR1cm5zIHtNdWx0aVRva2VufVxuICovXG5mdW5jdGlvbiBpbml0TXVsdGlUb2tlbihNdWx0aSwgaW5wdXQsIHRva2Vucykge1xuICBjb25zdCBzdGFydElkeCA9IHRva2Vuc1swXS5zO1xuICBjb25zdCBlbmRJZHggPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdLmU7XG4gIGNvbnN0IHZhbHVlID0gaW5wdXQuc2xpY2Uoc3RhcnRJZHgsIGVuZElkeCk7XG4gIHJldHVybiBuZXcgTXVsdGkodmFsdWUsIHRva2Vucyk7XG59XG5cbmNvbnN0IHdhcm4gPSB0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgY29uc29sZSAmJiBjb25zb2xlLndhcm4gfHwgKCgpID0+IHt9KTtcbmNvbnN0IHdhcm5BZHZpY2UgPSAndW50aWwgbWFudWFsIGNhbGwgb2YgbGlua2lmeS5pbml0KCkuIFJlZ2lzdGVyIGFsbCBzY2hlbWVzIGFuZCBwbHVnaW5zIGJlZm9yZSBpbnZva2luZyBsaW5raWZ5IHRoZSBmaXJzdCB0aW1lLic7XG5cbi8vIFNpZGUtZWZmZWN0IGluaXRpYWxpemF0aW9uIHN0YXRlXG5jb25zdCBJTklUID0ge1xuICBzY2FubmVyOiBudWxsLFxuICBwYXJzZXI6IG51bGwsXG4gIHRva2VuUXVldWU6IFtdLFxuICBwbHVnaW5RdWV1ZTogW10sXG4gIGN1c3RvbVNjaGVtZXM6IFtdLFxuICBpbml0aWFsaXplZDogZmFsc2Vcbn07XG5cbi8qKlxuICogQHR5cGVkZWYge3tcbiAqIFx0c3RhcnQ6IFN0YXRlPHN0cmluZz4sXG4gKiBcdHRva2VuczogeyBncm91cHM6IENvbGxlY3Rpb25zPHN0cmluZz4gfSAmIHR5cGVvZiB0a1xuICogfX0gU2Nhbm5lckluaXRcbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHt7XG4gKiBcdHN0YXJ0OiBTdGF0ZTxNdWx0aVRva2VuPixcbiAqIFx0dG9rZW5zOiB0eXBlb2YgbXVsdGlcbiAqIH19IFBhcnNlckluaXRcbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHsoYXJnOiB7IHNjYW5uZXI6IFNjYW5uZXJJbml0IH0pID0+IHZvaWR9IFRva2VuUGx1Z2luXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7KGFyZzogeyBzY2FubmVyOiBTY2FubmVySW5pdCwgcGFyc2VyOiBQYXJzZXJJbml0IH0pID0+IHZvaWR9IFBsdWdpblxuICovXG5cbi8qKlxuICogRGUtcmVnaXN0ZXIgYWxsIHBsdWdpbnMgYW5kIHJlc2V0IHRoZSBpbnRlcm5hbCBzdGF0ZS1tYWNoaW5lLiBVc2VkIGZvclxuICogdGVzdGluZzsgbm90IHJlcXVpcmVkIGluIHByYWN0aWNlLlxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gcmVzZXQoKSB7XG4gIFN0YXRlLmdyb3VwcyA9IHt9O1xuICBJTklULnNjYW5uZXIgPSBudWxsO1xuICBJTklULnBhcnNlciA9IG51bGw7XG4gIElOSVQudG9rZW5RdWV1ZSA9IFtdO1xuICBJTklULnBsdWdpblF1ZXVlID0gW107XG4gIElOSVQuY3VzdG9tU2NoZW1lcyA9IFtdO1xuICBJTklULmluaXRpYWxpemVkID0gZmFsc2U7XG59XG5cbi8qKlxuICogUmVnaXN0ZXIgYSB0b2tlbiBwbHVnaW4gdG8gYWxsb3cgdGhlIHNjYW5uZXIgdG8gcmVjb2duaXplIGFkZGl0aW9uYWwgdG9rZW5cbiAqIHR5cGVzIGJlZm9yZSB0aGUgcGFyc2VyIHN0YXRlIG1hY2hpbmUgaXMgY29uc3RydWN0ZWQgZnJvbSB0aGUgcmVzdWx0cy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIG9mIHBsdWdpbiB0byByZWdpc3RlclxuICogQHBhcmFtIHtUb2tlblBsdWdpbn0gcGx1Z2luIGZ1bmN0aW9uIHRoYXQgYWNjZXB0cyB0aGUgc2Nhbm5lciBzdGF0ZSBtYWNoaW5lXG4gKiBhbmQgYXZhaWxhYmxlIHNjYW5uZXIgdG9rZW5zIGFuZCBjb2xsZWN0aW9ucyBhbmQgZXh0ZW5kcyB0aGUgc3RhdGUgbWFjaGluZSB0b1xuICogcmVjb2duaXplIGFkZGl0aW9uYWwgdG9rZW5zIG9yIGdyb3Vwcy5cbiAqL1xuZnVuY3Rpb24gcmVnaXN0ZXJUb2tlblBsdWdpbihuYW1lLCBwbHVnaW4pIHtcbiAgaWYgKHR5cGVvZiBwbHVnaW4gIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYGxpbmtpZnlqczogSW52YWxpZCB0b2tlbiBwbHVnaW4gJHtwbHVnaW59IChleHBlY3RzIGZ1bmN0aW9uKWApO1xuICB9XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgSU5JVC50b2tlblF1ZXVlLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKG5hbWUgPT09IElOSVQudG9rZW5RdWV1ZVtpXVswXSkge1xuICAgICAgd2FybihgbGlua2lmeWpzOiB0b2tlbiBwbHVnaW4gXCIke25hbWV9XCIgYWxyZWFkeSByZWdpc3RlcmVkIC0gd2lsbCBiZSBvdmVyd3JpdHRlbmApO1xuICAgICAgSU5JVC50b2tlblF1ZXVlW2ldID0gW25hbWUsIHBsdWdpbl07XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG4gIElOSVQudG9rZW5RdWV1ZS5wdXNoKFtuYW1lLCBwbHVnaW5dKTtcbiAgaWYgKElOSVQuaW5pdGlhbGl6ZWQpIHtcbiAgICB3YXJuKGBsaW5raWZ5anM6IGFscmVhZHkgaW5pdGlhbGl6ZWQgLSB3aWxsIG5vdCByZWdpc3RlciB0b2tlbiBwbHVnaW4gXCIke25hbWV9XCIgJHt3YXJuQWR2aWNlfWApO1xuICB9XG59XG5cbi8qKlxuICogUmVnaXN0ZXIgYSBsaW5raWZ5IHBsdWdpblxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgb2YgcGx1Z2luIHRvIHJlZ2lzdGVyXG4gKiBAcGFyYW0ge1BsdWdpbn0gcGx1Z2luIGZ1bmN0aW9uIHRoYXQgYWNjZXB0cyB0aGUgcGFyc2VyIHN0YXRlIG1hY2hpbmUgYW5kXG4gKiBleHRlbmRzIHRoZSBwYXJzZXIgdG8gcmVjb2duaXplIGFkZGl0aW9uYWwgbGluayB0eXBlc1xuICovXG5mdW5jdGlvbiByZWdpc3RlclBsdWdpbihuYW1lLCBwbHVnaW4pIHtcbiAgaWYgKHR5cGVvZiBwbHVnaW4gIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYGxpbmtpZnlqczogSW52YWxpZCBwbHVnaW4gJHtwbHVnaW59IChleHBlY3RzIGZ1bmN0aW9uKWApO1xuICB9XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgSU5JVC5wbHVnaW5RdWV1ZS5sZW5ndGg7IGkrKykge1xuICAgIGlmIChuYW1lID09PSBJTklULnBsdWdpblF1ZXVlW2ldWzBdKSB7XG4gICAgICB3YXJuKGBsaW5raWZ5anM6IHBsdWdpbiBcIiR7bmFtZX1cIiBhbHJlYWR5IHJlZ2lzdGVyZWQgLSB3aWxsIGJlIG92ZXJ3cml0dGVuYCk7XG4gICAgICBJTklULnBsdWdpblF1ZXVlW2ldID0gW25hbWUsIHBsdWdpbl07XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG4gIElOSVQucGx1Z2luUXVldWUucHVzaChbbmFtZSwgcGx1Z2luXSk7XG4gIGlmIChJTklULmluaXRpYWxpemVkKSB7XG4gICAgd2FybihgbGlua2lmeWpzOiBhbHJlYWR5IGluaXRpYWxpemVkIC0gd2lsbCBub3QgcmVnaXN0ZXIgcGx1Z2luIFwiJHtuYW1lfVwiICR7d2FybkFkdmljZX1gKTtcbiAgfVxufVxuXG4vKipcbiAqIERldGVjdCBVUkxzIHdpdGggdGhlIGZvbGxvd2luZyBhZGRpdGlvbmFsIHByb3RvY29sLiBBbnl0aGluZyB3aXRoIGZvcm1hdFxuICogXCJwcm90b2NvbDovLy4uLlwiIHdpbGwgYmUgY29uc2lkZXJlZCBhIGxpbmsuIElmIGBvcHRpb25hbFNsYXNoU2xhc2hgIGlzIHNldCB0b1xuICogYHRydWVgLCBhbnl0aGluZyB3aXRoIGZvcm1hdCBcInByb3RvY29sOi4uLlwiIHdpbGwgYmUgY29uc2lkZXJlZCBhIGxpbmsuXG4gKiBAcGFyYW0ge3N0cmluZ30gcHJvdG9jb2xcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbmFsU2xhc2hTbGFzaF1cbiAqL1xuZnVuY3Rpb24gcmVnaXN0ZXJDdXN0b21Qcm90b2NvbChzY2hlbWUsIG9wdGlvbmFsU2xhc2hTbGFzaCkge1xuICBpZiAob3B0aW9uYWxTbGFzaFNsYXNoID09PSB2b2lkIDApIHtcbiAgICBvcHRpb25hbFNsYXNoU2xhc2ggPSBmYWxzZTtcbiAgfVxuICBpZiAoSU5JVC5pbml0aWFsaXplZCkge1xuICAgIHdhcm4oYGxpbmtpZnlqczogYWxyZWFkeSBpbml0aWFsaXplZCAtIHdpbGwgbm90IHJlZ2lzdGVyIGN1c3RvbSBzY2hlbWUgXCIke3NjaGVtZX1cIiAke3dhcm5BZHZpY2V9YCk7XG4gIH1cbiAgaWYgKCEvXlswLTlhLXpdKygtWzAtOWEtel0rKSokLy50ZXN0KHNjaGVtZSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2xpbmtpZnlqczogaW5jb3JyZWN0IHNjaGVtZSBmb3JtYXQuXFxuIDEuIE11c3Qgb25seSBjb250YWluIGRpZ2l0cywgbG93ZXJjYXNlIEFTQ0lJIGxldHRlcnMgb3IgXCItXCJcXG4gMi4gQ2Fubm90IHN0YXJ0IG9yIGVuZCB3aXRoIFwiLVwiXFxuIDMuIFwiLVwiIGNhbm5vdCByZXBlYXQnKTtcbiAgfVxuICBJTklULmN1c3RvbVNjaGVtZXMucHVzaChbc2NoZW1lLCBvcHRpb25hbFNsYXNoU2xhc2hdKTtcbn1cblxuLyoqXG4gKiBJbml0aWFsaXplIHRoZSBsaW5raWZ5IHN0YXRlIG1hY2hpbmUuIENhbGxlZCBhdXRvbWF0aWNhbGx5IHRoZSBmaXJzdCB0aW1lXG4gKiBsaW5raWZ5IGlzIGNhbGxlZCBvbiBhIHN0cmluZywgYnV0IG1heSBiZSBjYWxsZWQgbWFudWFsbHkgYXMgd2VsbC5cbiAqL1xuZnVuY3Rpb24gaW5pdCgpIHtcbiAgLy8gSW5pdGlhbGl6ZSBzY2FubmVyIHN0YXRlIG1hY2hpbmUgYW5kIHBsdWdpbnNcbiAgSU5JVC5zY2FubmVyID0gaW5pdCQyKElOSVQuY3VzdG9tU2NoZW1lcyk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgSU5JVC50b2tlblF1ZXVlLmxlbmd0aDsgaSsrKSB7XG4gICAgSU5JVC50b2tlblF1ZXVlW2ldWzFdKHtcbiAgICAgIHNjYW5uZXI6IElOSVQuc2Nhbm5lclxuICAgIH0pO1xuICB9XG5cbiAgLy8gSW5pdGlhbGl6ZSBwYXJzZXIgc3RhdGUgbWFjaGluZSBhbmQgcGx1Z2luc1xuICBJTklULnBhcnNlciA9IGluaXQkMShJTklULnNjYW5uZXIudG9rZW5zKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBJTklULnBsdWdpblF1ZXVlLmxlbmd0aDsgaSsrKSB7XG4gICAgSU5JVC5wbHVnaW5RdWV1ZVtpXVsxXSh7XG4gICAgICBzY2FubmVyOiBJTklULnNjYW5uZXIsXG4gICAgICBwYXJzZXI6IElOSVQucGFyc2VyXG4gICAgfSk7XG4gIH1cbiAgSU5JVC5pbml0aWFsaXplZCA9IHRydWU7XG59XG5cbi8qKlxuICogUGFyc2UgYSBzdHJpbmcgaW50byB0b2tlbnMgdGhhdCByZXByZXNlbnQgbGlua2FibGUgYW5kIG5vbi1saW5rYWJsZSBzdWItY29tcG9uZW50c1xuICogQHBhcmFtIHtzdHJpbmd9IHN0clxuICogQHJldHVybiB7TXVsdGlUb2tlbltdfSB0b2tlbnNcbiAqL1xuZnVuY3Rpb24gdG9rZW5pemUoc3RyKSB7XG4gIGlmICghSU5JVC5pbml0aWFsaXplZCkge1xuICAgIGluaXQoKTtcbiAgfVxuICByZXR1cm4gcnVuKElOSVQucGFyc2VyLnN0YXJ0LCBzdHIsIHJ1biQxKElOSVQuc2Nhbm5lci5zdGFydCwgc3RyKSk7XG59XG5cbi8qKlxuICogRmluZCBhIGxpc3Qgb2YgbGlua2FibGUgaXRlbXMgaW4gdGhlIGdpdmVuIHN0cmluZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHIgc3RyaW5nIHRvIGZpbmQgbGlua3MgaW5cbiAqIEBwYXJhbSB7c3RyaW5nIHwgT3B0c30gW3R5cGVdIGVpdGhlciBmb3JtYXR0aW5nIG9wdGlvbnMgb3Igc3BlY2lmaWMgdHlwZSBvZlxuICogbGlua3MgdG8gZmluZCwgZS5nLiwgJ3VybCcgb3IgJ2VtYWlsJ1xuICogQHBhcmFtIHtPcHRzfSBbb3B0c10gZm9ybWF0dGluZyBvcHRpb25zIGZvciBmaW5hbCBvdXRwdXQuIENhbm5vdCBiZSBzcGVjaWZpZWRcbiAqIGlmIG9wdHMgYWxyZWFkeSBwcm92aWRlZCBpbiBgdHlwZWAgYXJndW1lbnRcbiovXG5mdW5jdGlvbiBmaW5kKHN0ciwgdHlwZSwgb3B0cykge1xuICBpZiAodHlwZSA9PT0gdm9pZCAwKSB7XG4gICAgdHlwZSA9IG51bGw7XG4gIH1cbiAgaWYgKG9wdHMgPT09IHZvaWQgMCkge1xuICAgIG9wdHMgPSBudWxsO1xuICB9XG4gIGlmICh0eXBlICYmIHR5cGVvZiB0eXBlID09PSAnb2JqZWN0Jykge1xuICAgIGlmIChvcHRzKSB7XG4gICAgICB0aHJvdyBFcnJvcihgbGlua2lmeWpzOiBJbnZhbGlkIGxpbmsgdHlwZSAke3R5cGV9OyBtdXN0IGJlIGEgc3RyaW5nYCk7XG4gICAgfVxuICAgIG9wdHMgPSB0eXBlO1xuICAgIHR5cGUgPSBudWxsO1xuICB9XG4gIGNvbnN0IG9wdGlvbnMgPSBuZXcgT3B0aW9ucyhvcHRzKTtcbiAgY29uc3QgdG9rZW5zID0gdG9rZW5pemUoc3RyKTtcbiAgY29uc3QgZmlsdGVyZWQgPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCB0b2tlbiA9IHRva2Vuc1tpXTtcbiAgICBpZiAodG9rZW4uaXNMaW5rICYmICghdHlwZSB8fCB0b2tlbi50ID09PSB0eXBlKSkge1xuICAgICAgZmlsdGVyZWQucHVzaCh0b2tlbi50b0Zvcm1hdHRlZE9iamVjdChvcHRpb25zKSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBmaWx0ZXJlZDtcbn1cblxuLyoqXG4gKiBJcyB0aGUgZ2l2ZW4gc3RyaW5nIHZhbGlkIGxpbmthYmxlIHRleHQgb2Ygc29tZSBzb3J0LiBOb3RlIHRoYXQgdGhpcyBkb2VzIG5vdFxuICogdHJpbSB0aGUgdGV4dCBmb3IgeW91LlxuICpcbiAqIE9wdGlvbmFsbHkgcGFzcyBpbiBhIHNlY29uZCBgdHlwZWAgcGFyYW0sIHdoaWNoIGlzIHRoZSB0eXBlIG9mIGxpbmsgdG8gdGVzdFxuICogZm9yLlxuICpcbiAqIEZvciBleGFtcGxlLFxuICpcbiAqICAgICBsaW5raWZ5LnRlc3Qoc3RyLCAnZW1haWwnKTtcbiAqXG4gKiBSZXR1cm5zIGB0cnVlYCBpZiBzdHIgaXMgYSB2YWxpZCBlbWFpbC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHIgc3RyaW5nIHRvIHRlc3QgZm9yIGxpbmtzXG4gKiBAcGFyYW0ge3N0cmluZ30gW3R5cGVdIG9wdGlvbmFsIHNwZWNpZmljIGxpbmsgdHlwZSB0byBsb29rIGZvclxuICogQHJldHVybnMgYm9vbGVhbiB0cnVlL2ZhbHNlXG4gKi9cbmZ1bmN0aW9uIHRlc3Qoc3RyLCB0eXBlKSB7XG4gIGlmICh0eXBlID09PSB2b2lkIDApIHtcbiAgICB0eXBlID0gbnVsbDtcbiAgfVxuICBjb25zdCB0b2tlbnMgPSB0b2tlbml6ZShzdHIpO1xuICByZXR1cm4gdG9rZW5zLmxlbmd0aCA9PT0gMSAmJiB0b2tlbnNbMF0uaXNMaW5rICYmICghdHlwZSB8fCB0b2tlbnNbMF0udCA9PT0gdHlwZSk7XG59XG5cbmV4cG9ydCB7IE11bHRpVG9rZW4sIE9wdGlvbnMsIFN0YXRlLCBjcmVhdGVUb2tlbkNsYXNzLCBmaW5kLCBpbml0LCBtdWx0aSwgb3B0aW9ucywgcmVnZXhwLCByZWdpc3RlckN1c3RvbVByb3RvY29sLCByZWdpc3RlclBsdWdpbiwgcmVnaXN0ZXJUb2tlblBsdWdpbiwgcmVzZXQsIHN0cmluZ1RvQXJyYXksIHRlc3QsIHRva2VuaXplIH07XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBeUJBLE9BQU9BLGNBQWE7QUFDcEIsT0FBT0MsVUFBUztBQUNoQixPQUFPQyxXQUFVOzs7QUNGakIsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sU0FBUztBQUNoQixPQUFPLFVBQVU7QUFDakIsT0FBTyxhQUFhO0FBR3BCLElBQUk7QUFBQSxFQUNGLElBQUksS0FBSztBQUFBLEVBQ1Q7QUFBQSxFQUNBO0FBQ0Y7QUFFQSxJQUFJO0FBQUEsRUFDRixJQUFJLEtBQUs7QUFBQSxFQUNUO0FBQUEsRUFDQTtBQUNGO0FBcUJPLElBQUssUUFBTCxrQkFBS0MsV0FBTDtBQUNMLEVBQUFBLGNBQUEsWUFBVyxLQUFYO0FBQ0EsRUFBQUEsY0FBQTtBQUNBLEVBQUFBLGNBQUE7QUFDQSxFQUFBQSxjQUFBO0FBQ0EsRUFBQUEsY0FBQTtBQUNBLEVBQUFBLGNBQUE7QUFDQSxFQUFBQSxjQUFBO0FBQ0EsRUFBQUEsY0FBQTtBQVJVLFNBQUFBO0FBQUEsR0FBQTtBQVdMLElBQU0sYUFBYSxvQkFBSSxJQUFJO0FBQUEsRUFDaEMsQ0FBQyxnQkFBYyxFQUFFLFFBQVEsQ0FBQztBQUFBLEVBQzFCLENBQUMsY0FBWSxFQUFFLE1BQU0sQ0FBQztBQUFBLEVBQ3RCLENBQUMsZUFBYSxFQUFFLE9BQU8sQ0FBQztBQUFBLEVBQ3hCLENBQUMsZ0JBQWMsRUFBRSxRQUFRLENBQUM7QUFBQSxFQUMxQixDQUFDLGNBQVksRUFBRSxNQUFNLENBQUM7QUFBQSxFQUN0QixDQUFDLGNBQVksRUFBRSxNQUFNLENBQUM7QUFBQSxFQUN0QixDQUFDLGtCQUFnQixFQUFFLFVBQVUsQ0FBQztBQUFBLEVBQzlCLENBQUMsZ0JBQWMsRUFBRSxRQUFRLENBQUM7QUFDNUIsQ0FBQztBQUVNLElBQU0sU0FBUyxPQUFPLE9BQU8sS0FBSyxFQUFFO0FBQUEsRUFDekMsQ0FBQyxVQUFVLE9BQU8sVUFBVTtBQUM5QjtBQUVPLElBQU0sV0FBVyxJQUFJLElBQUksU0FBUyxFQUFFLFdBQVcsc0JBQXNCLENBQUM7QUFFN0UsSUFBTSxlQUFlLE9BQU87QUFBQSxFQUMxQixlQUFlLFNBQVMsU0FBUyxlQUFlO0FBQUEsRUFDaEQsZUFBZSxTQUFTLFFBQVEsZUFBZTtBQUFBLEVBQy9DLGdCQUFnQixTQUFTLFFBQVEsZ0JBQWdCO0FBQUEsRUFDakQsZ0JBQWdCLFNBQVMsWUFBWSxnQkFBZ0I7QUFDdkQ7QUFFTyxJQUFJLFdBQVcsYUFBYTtBQUVuQyxTQUFTLFFBQVEsV0FBVyxNQUFNO0FBQ2hDLGFBQVcsYUFBYTtBQUMxQixDQUFDO0FBRU0sSUFBTSxPQUFOLGNBQWtCLFFBQVEsT0FBTztBQUFBLEVBT3RDLFlBQVksTUFBYyxRQUFnQixHQUFHLE1BQWMsR0FBRztBQUM1RCxVQUFNO0FBQ04sU0FBSyxPQUFPO0FBQ1osU0FBSyxRQUFRO0FBQ2IsU0FBSyxNQUFNO0FBQUEsRUFDYjtBQWVGO0FBM0JPLElBQU0sTUFBTjtBQUFBLENBY0wsTUFBTztBQUNMLFVBQVEsY0FBYztBQUFBLElBQ3BCLFdBQVc7QUFBQSxJQUNYLFlBQVk7QUFBQTtBQUFBLE1BRVYsTUFBTSxRQUFRLFVBQVUsT0FBTyxRQUFRLFFBQVEsdUJBQXVCLFFBQVEsV0FBVyxXQUFXLEVBQUU7QUFBQTtBQUFBLE1BRXRHLE9BQU8sUUFBUSxVQUFVLElBQUksU0FBUyxTQUFTLGdDQUFnQyxRQUFRLFdBQVcsV0FBVyxHQUFHLEtBQUssQ0FBQztBQUFBO0FBQUEsTUFFdEgsS0FBSyxRQUFRLFVBQVUsSUFBSSxPQUFPLE9BQU8sOEJBQThCLFFBQVEsV0FBVyxXQUFXLEdBQUcsS0FBSyxDQUFDO0FBQUEsSUFDaEg7QUFBQSxFQUNGLEdBQUcsSUFBSTtBQUNUO0FBR0ssSUFBTSxRQUFOLGNBQW1CLFFBQVEsT0FBTztBQUFBLEVBNER2QyxZQUFZLE1BQWE7QUFoTTNCO0FBaU1JLFVBQU07QUFDTixTQUFLLElBQUksS0FBSztBQUNkLFNBQUssT0FBTyxLQUFLO0FBQ2pCLFNBQUssVUFBVSxLQUFLO0FBQ3BCLFNBQUssUUFBUSxLQUFLO0FBQ2xCLFNBQUssUUFBUSxLQUFLO0FBQ2xCLFNBQUssV0FBVyxJQUFJLFVBQVUsSUFBSSxJQUFJLE1BQU07QUFDNUMsU0FBSyxPQUFPLEtBQUs7QUFDakIsU0FBSyxXQUFXLEtBQUssU0FBUztBQUFBLE1BQzVCLElBQUksS0FBSyxLQUFLLFFBQVEsRUFBRSxZQUFZO0FBQUEsTUFDcEM7QUFBQSxJQUNGO0FBQ0EsU0FBSyxRQUFRLEtBQUs7QUFDbEIsU0FBSyxTQUFTLEtBQUs7QUFDbkIsU0FBSyxRQUFPLFVBQUssU0FBTCxZQUFhO0FBRXpCLFNBQUs7QUFBQSxNQUNIO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBLFFBQVEsYUFBYTtBQUFBLE1BQ3JCLENBQUNDLElBQUcsWUFBWTtBQUNkLFlBQUksQ0FBQztBQUFTLGlCQUFPLENBQUMsTUFBTSxFQUFFO0FBQzlCLFlBQUksUUFBUSxRQUFRLE1BQU0sSUFBSSxFQUFFLENBQUMsRUFBRSxNQUFNLEdBQUcsRUFBRTtBQUM5QyxZQUFJLE1BQU0sVUFBVSxRQUFRO0FBQVEsbUJBQVM7QUFDN0MsZUFBTyxDQUFDLE1BQU0sS0FBSztBQUFBLE1BQ3JCO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUdGO0FBQUEsRUF0RUEsSUFBSSxPQUFPO0FBQ1QsVUFBTSxRQUFRLENBQUM7QUFFZixhQUFTLElBQUksR0FBRyxJQUFJLEtBQUssU0FBUyxZQUFZLEdBQUcsS0FBSztBQUNwRCxZQUFNLE1BQU0sS0FBSyxTQUFTLFNBQVMsQ0FBQztBQUNwQyxZQUFNLEtBQUs7QUFBQSxRQUNULE1BQU0sSUFBSTtBQUFBLFFBQ1YsT0FBTyxJQUFJO0FBQUEsUUFDWCxLQUFLLElBQUk7QUFBQSxNQUNYLENBQUM7QUFBQSxJQUNIO0FBRUEsV0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUVBLElBQUksS0FBSyxNQUFxQjtBQUM1QixTQUFLLFNBQVMsV0FBVztBQUV6QixlQUFXLE9BQU8sTUFBTTtBQUN0QixZQUFNLGFBQWEsSUFBSSxJQUFJLElBQUksTUFBTSxJQUFJLE9BQU8sSUFBSSxHQUFHO0FBQ3ZELFdBQUssU0FBUyxPQUFPLFVBQVU7QUFBQSxJQUNqQztBQUVBLFNBQUssS0FBSyxvQkFBb0IsTUFBSyxjQUFjO0FBQUEsRUFDbkQ7QUFBQSxFQUVBLElBQUksZ0JBQWdCO0FBQ2xCLFdBQU8sSUFBSSxLQUFLLEtBQUssU0FBUyxRQUFRLElBQUksR0FBSTtBQUFBLEVBQ2hEO0FBQUE7QUFBQSxFQUdBLElBQUksY0FBYyxNQUFZO0FBQzVCLFNBQUssV0FBVyxLQUFLLFNBQVM7QUFBQSxNQUM1QixJQUFJLEtBQUssSUFBSSxFQUFFLFlBQVk7QUFBQSxNQUMzQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFvQ0EsT0FBTyxXQUFXO0FBQ2hCLFdBQU8sSUFBSSxLQUFLO0FBQUEsTUFDZCxHQUFHO0FBQUEsTUFDSCxNQUFNLEtBQUssbUJBQW1CO0FBQUEsTUFDOUIsU0FBUztBQUFBLE1BQ1QsT0FBTztBQUFBLE1BQ1AsT0FBTyxTQUFTO0FBQUEsTUFDaEIsTUFBTSxDQUFDO0FBQUEsTUFDUCxVQUFVLG9CQUFJLEtBQUs7QUFBQSxNQUNuQixPQUFPO0FBQUEsTUFDUCxRQUFRO0FBQUEsTUFDUixNQUFNO0FBQUEsSUFDUixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBRUEsT0FBTztBQUNMLFdBQU8sSUFBSSxNQUFLO0FBQUEsTUFDZCxHQUFHLEtBQUs7QUFBQSxNQUNSLE1BQU0sS0FBSztBQUFBLE1BQ1gsU0FBUyxLQUFLO0FBQUEsTUFDZCxPQUFPLEtBQUs7QUFBQSxNQUNaLE9BQU8sS0FBSztBQUFBLE1BQ1osTUFBTSxLQUFLLEtBQUssSUFBSSxDQUFDLFNBQVM7QUFBQSxRQUM1QixNQUFNLElBQUk7QUFBQSxRQUNWLE9BQU8sSUFBSTtBQUFBLFFBQ1gsS0FBSyxJQUFJO0FBQUEsTUFDWCxFQUFFO0FBQUEsTUFDRixVQUFVLElBQUksS0FBSyxLQUFLLFNBQVMsUUFBUSxJQUFJLEdBQUk7QUFBQSxNQUNqRCxPQUFPLEtBQUs7QUFBQSxNQUNaLFFBQVEsS0FBSztBQUFBLE1BQ2IsTUFBTSxLQUFLO0FBQUEsSUFDYixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBRUEsU0FBZ0I7QUFDZCxXQUFPO0FBQUEsTUFDTCxHQUFHLEtBQUs7QUFBQSxNQUNSLE1BQU0sS0FBSztBQUFBLE1BQ1gsU0FBUyxLQUFLO0FBQUEsTUFDZCxPQUFPLEtBQUs7QUFBQSxNQUNaLE9BQU8sS0FBSztBQUFBLE1BQ1osTUFBTSxLQUFLO0FBQUEsTUFDWCxVQUFVLEtBQUs7QUFBQSxNQUNmLE9BQU8sS0FBSztBQUFBLE1BQ1osUUFBUSxLQUFLO0FBQUEsTUFDYixNQUFNLEtBQUs7QUFBQSxJQUNiO0FBQUEsRUFDRjtBQTZCRjtBQTFLTyxJQUFNLE9BQU47QUFBTSxLQUNJLGlCQUFpQixRQUFRO0FBQUEsRUFDdEM7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0EsSUFBSSxVQUFVO0FBQUEsRUFDZCxRQUFRLFdBQVc7QUFDckI7QUFBQSxDQXdJQSxNQUFPO0FBQ0wsVUFBUSxjQUFjO0FBQUEsSUFDcEIsV0FBVztBQUFBLElBQ1gsWUFBWTtBQUFBO0FBQUEsTUFFVixHQUFHLFFBQVEsVUFBVSxJQUFJLEtBQUssV0FBVyx1QkFBdUIsUUFBUSxXQUFXLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFBQTtBQUFBLE1BRXZHLE1BQU0sUUFBUSxVQUFVLE9BQU8sUUFBUSxRQUFRLG9CQUFvQixRQUFRLFdBQVcsV0FBVyxFQUFFO0FBQUE7QUFBQSxNQUVuRyxTQUFTLFFBQVEsVUFBVSxPQUFPLFdBQVcsV0FBVyx1QkFBdUIsUUFBUSxXQUFXLFdBQVcsRUFBRTtBQUFBO0FBQUEsTUFFL0csT0FBTyxRQUFRLFVBQVUsT0FBTyxTQUFTLFNBQVMscUJBQXFCLFFBQVEsV0FBVyxXQUFXLEVBQUU7QUFBQTtBQUFBLE1BRXZHLE9BQU8sUUFBUSxVQUFVLElBQUksU0FBUyxTQUFTLHFCQUFxQixRQUFRLFdBQVcsV0FBVyxHQUFHLEtBQUssQ0FBQztBQUFBO0FBQUEsTUFFM0csVUFBVSxNQUFLO0FBQUE7QUFBQSxNQUVmLFVBQVUsUUFBUSxVQUFVLE1BQU0sWUFBWSxZQUFZLDhCQUE4QixRQUFRLFdBQVcsV0FBVyxLQUFLLFFBQVE7QUFBQTtBQUFBLE1BRW5JLE9BQU8sUUFBUSxVQUFVLElBQUksU0FBUyxTQUFTLHFCQUFxQixRQUFRLFdBQVcsV0FBVyxHQUFHLEtBQUssQ0FBQztBQUFBO0FBQUEsTUFFM0csUUFBUSxRQUFRLFVBQVUsSUFBSSxVQUFVLFVBQVUsc0JBQXNCLFFBQVEsV0FBVyxXQUFXLEdBQUcsS0FBSyxDQUFDO0FBQUE7QUFBQSxNQUUvRyxNQUFNLFFBQVEsVUFBVSxRQUFRLFFBQVEsUUFBUSw2REFBNkQsUUFBUSxXQUFXLFdBQVcsS0FBSztBQUFBLElBQ2xKO0FBQUEsRUFDRixHQUFHLEtBQUk7QUFDVDtBQUdLLElBQU0saUJBQWlCLENBQUMsUUFBb0IsT0FBbUI7QUFDcEUsTUFBSSxTQUFTLGdCQUFnQjtBQUMzQixVQUFNLFNBQVMsSUFBSSxjQUFjO0FBQUEsTUFDL0I7QUFBQSxNQUNBLEVBQUUsY0FBYztBQUFBLE1BQ2hCLEVBQUUsdUZBQXVGO0FBQUEsSUFDM0Y7QUFDQSxXQUFPLGFBQWEsVUFBVSxFQUFFLFFBQVEsQ0FBQztBQUN6QyxXQUFPLGFBQWEsVUFBVSxFQUFFLFFBQVEsQ0FBQztBQUN6QyxXQUFPO0FBQUEsTUFDTDtBQUFBLE1BQ0EsSUFBSSxtQkFBbUI7QUFBQSxJQUN6QjtBQUNBLFdBQU8scUJBQXFCLFFBQVE7QUFDcEMsV0FBTyxtQkFBbUIsUUFBUTtBQUNsQyxXQUFPLFFBQVEsWUFBWSxDQUFDLFNBQVMsYUFBYTtBQUNoRCxVQUFJLGFBQWEsVUFBVTtBQUN6QixXQUFHO0FBQUEsTUFDTDtBQUFBLElBQ0YsQ0FBQztBQUNELFdBQU8sUUFBUTtBQUFBLEVBQ2pCLE9BQU87QUFDTCxPQUFHO0FBQUEsRUFDTDtBQUNGOzs7QUMvU0EsT0FBT0MsY0FBYTtBQUNwQixPQUFPLFNBQVM7QUFDaEIsT0FBTyxXQUFXO0FBQ2xCLE9BQU9DLFVBQVM7OztBQ3pCaEIsSUFBTSxjQUFjO0FBRXBCLElBQU0sZUFBZTtBQVNyQixJQUFNLFNBQVMsQ0FBQyxRQUFRLGVBQWU7QUFDckMsYUFBVyxPQUFPLFlBQVk7QUFDNUIsV0FBTyxHQUFHLElBQUksV0FBVyxHQUFHO0FBQUEsRUFDOUI7QUFDQSxTQUFPO0FBQ1Q7QUFnQkEsSUFBTSxVQUFVO0FBQ2hCLElBQU0sUUFBUTtBQUNkLElBQU0sUUFBUTtBQUNkLElBQU0sZUFBZTtBQUNyQixJQUFNLGVBQWU7QUFDckIsSUFBTSxTQUFTO0FBQ2YsSUFBTSxRQUFRO0FBQ2QsSUFBTSxTQUFTO0FBQ2YsSUFBTSxjQUFjO0FBQ3BCLElBQU0sYUFBYTtBQVFuQixTQUFTLGNBQWMsTUFBTSxRQUFRO0FBQ25DLE1BQUksRUFBRSxRQUFRLFNBQVM7QUFDckIsV0FBTyxJQUFJLElBQUksQ0FBQztBQUFBLEVBQ2xCO0FBQ0EsU0FBTyxPQUFPLElBQUk7QUFDcEI7QUFRQSxTQUFTLFlBQVksR0FBRyxPQUFPLFFBQVE7QUFDckMsTUFBSSxNQUFNLE9BQU8sR0FBRztBQUNsQixVQUFNLFlBQVksSUFBSTtBQUN0QixVQUFNLFlBQVksSUFBSTtBQUFBLEVBQ3hCO0FBQ0EsTUFBSSxNQUFNLEtBQUssR0FBRztBQUNoQixVQUFNLFlBQVksSUFBSTtBQUN0QixVQUFNLEtBQUssSUFBSTtBQUFBLEVBQ2pCO0FBQ0EsTUFBSSxNQUFNLFlBQVksR0FBRztBQUN2QixVQUFNLFlBQVksSUFBSTtBQUFBLEVBQ3hCO0FBQ0EsTUFBSSxNQUFNLEtBQUssR0FBRztBQUNoQixVQUFNLFlBQVksSUFBSTtBQUFBLEVBQ3hCO0FBQ0EsTUFBSSxNQUFNLFlBQVksR0FBRztBQUN2QixVQUFNLE1BQU0sSUFBSTtBQUFBLEVBQ2xCO0FBQ0EsTUFBSSxNQUFNLEtBQUssR0FBRztBQUNoQixVQUFNLE1BQU0sSUFBSTtBQUFBLEVBQ2xCO0FBQ0EsYUFBVyxLQUFLLE9BQU87QUFDckIsVUFBTSxRQUFRLGNBQWMsR0FBRyxNQUFNO0FBQ3JDLFFBQUksTUFBTSxRQUFRLENBQUMsSUFBSSxHQUFHO0FBQ3hCLFlBQU0sS0FBSyxDQUFDO0FBQUEsSUFDZDtBQUFBLEVBQ0Y7QUFDRjtBQVFBLFNBQVMsY0FBYyxHQUFHLFFBQVE7QUFDaEMsUUFBTSxTQUFTLENBQUM7QUFDaEIsYUFBVyxLQUFLLFFBQVE7QUFDdEIsUUFBSSxPQUFPLENBQUMsRUFBRSxRQUFRLENBQUMsS0FBSyxHQUFHO0FBQzdCLGFBQU8sQ0FBQyxJQUFJO0FBQUEsSUFDZDtBQUFBLEVBQ0Y7QUFDQSxTQUFPO0FBQ1Q7QUFvQkEsU0FBUyxNQUFNLE9BQU87QUFDcEIsTUFBSSxVQUFVLFFBQVE7QUFDcEIsWUFBUTtBQUFBLEVBQ1Y7QUFHQSxPQUFLLElBQUksQ0FBQztBQUdWLE9BQUssS0FBSyxDQUFDO0FBRVgsT0FBSyxLQUFLO0FBRVYsT0FBSyxJQUFJO0FBQ1g7QUFNQSxNQUFNLFNBQVMsQ0FBQztBQUNoQixNQUFNLFlBQVk7QUFBQSxFQUNoQixVQUFVO0FBQ1IsV0FBTyxDQUFDLENBQUMsS0FBSztBQUFBLEVBQ2hCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFPQSxHQUFHLE9BQU87QUFDUixVQUFNLFFBQVE7QUFDZCxVQUFNLFlBQVksTUFBTSxFQUFFLEtBQUs7QUFDL0IsUUFBSSxXQUFXO0FBQ2IsYUFBTztBQUFBLElBQ1Q7QUFDQSxhQUFTLElBQUksR0FBRyxJQUFJLE1BQU0sR0FBRyxRQUFRLEtBQUs7QUFDeEMsWUFBTSxRQUFRLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUMzQixZQUFNQyxhQUFZLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUMvQixVQUFJQSxjQUFhLE1BQU0sS0FBSyxLQUFLLEdBQUc7QUFDbEMsZUFBT0E7QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUVBLFdBQU8sTUFBTTtBQUFBLEVBQ2Y7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBUUEsSUFBSSxPQUFPLFdBQVc7QUFDcEIsUUFBSSxjQUFjLFFBQVE7QUFDeEIsa0JBQVk7QUFBQSxJQUNkO0FBQ0EsV0FBTyxZQUFZLFNBQVMsS0FBSyxJQUFJLENBQUMsQ0FBQyxLQUFLLEdBQUcsS0FBSztBQUFBLEVBQ3REO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBU0EsR0FBRyxRQUFRLE1BQU0sT0FBTyxRQUFRO0FBQzlCLGFBQVMsSUFBSSxHQUFHLElBQUksT0FBTyxRQUFRLEtBQUs7QUFDdEMsV0FBSyxHQUFHLE9BQU8sQ0FBQyxHQUFHLE1BQU0sT0FBTyxNQUFNO0FBQUEsSUFDeEM7QUFBQSxFQUNGO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFVQSxHQUFHLFFBQVEsTUFBTSxPQUFPLFFBQVE7QUFDOUIsYUFBUyxVQUFVLE1BQU07QUFDekIsUUFBSTtBQUNKLFFBQUksUUFBUSxLQUFLLEdBQUc7QUFDbEIsa0JBQVk7QUFBQSxJQUNkLE9BQU87QUFFTCxrQkFBWSxJQUFJLE1BQU0sSUFBSTtBQUMxQixVQUFJLFNBQVMsUUFBUTtBQUNuQixvQkFBWSxNQUFNLE9BQU8sTUFBTTtBQUFBLE1BQ2pDO0FBQUEsSUFDRjtBQUNBLFNBQUssR0FBRyxLQUFLLENBQUMsUUFBUSxTQUFTLENBQUM7QUFDaEMsV0FBTztBQUFBLEVBQ1Q7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBV0EsR0FBRyxPQUFPLE1BQU0sT0FBTyxRQUFRO0FBQzdCLFFBQUksUUFBUTtBQUNaLFVBQU0sTUFBTSxNQUFNO0FBQ2xCLFFBQUksQ0FBQyxLQUFLO0FBQ1IsYUFBTztBQUFBLElBQ1Q7QUFDQSxhQUFTLElBQUksR0FBRyxJQUFJLE1BQU0sR0FBRyxLQUFLO0FBQ2hDLGNBQVEsTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDO0FBQUEsSUFDM0I7QUFDQSxXQUFPLE1BQU0sR0FBRyxNQUFNLE1BQU0sQ0FBQyxHQUFHLE1BQU0sT0FBTyxNQUFNO0FBQUEsRUFDckQ7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUEyQkEsR0FBRyxPQUFPLE1BQU0sT0FBTyxRQUFRO0FBQzdCLGFBQVMsVUFBVSxNQUFNO0FBQ3pCLFVBQU0sUUFBUTtBQUdkLFFBQUksUUFBUSxLQUFLLEdBQUc7QUFDbEIsWUFBTSxFQUFFLEtBQUssSUFBSTtBQUNqQixhQUFPO0FBQUEsSUFDVDtBQUNBLFVBQU0sSUFBSTtBQUlWLFFBQUksV0FDRixnQkFBZ0IsTUFBTSxHQUFHLEtBQUs7QUFDaEMsUUFBSSxlQUFlO0FBQ2pCLGtCQUFZLElBQUksTUFBTTtBQUN0QixhQUFPLFVBQVUsR0FBRyxjQUFjLENBQUM7QUFDbkMsZ0JBQVUsR0FBRyxLQUFLLE1BQU0sVUFBVSxJQUFJLGNBQWMsRUFBRTtBQUN0RCxnQkFBVSxLQUFLLGNBQWM7QUFDN0IsZ0JBQVUsSUFBSSxjQUFjO0FBQUEsSUFDOUIsT0FBTztBQUNMLGtCQUFZLElBQUksTUFBTTtBQUFBLElBQ3hCO0FBQ0EsUUFBSSxHQUFHO0FBRUwsVUFBSSxRQUFRO0FBQ1YsWUFBSSxVQUFVLEtBQUssT0FBTyxVQUFVLE1BQU0sVUFBVTtBQUNsRCxnQkFBTSxXQUFXLE9BQU8sY0FBYyxVQUFVLEdBQUcsTUFBTSxHQUFHLEtBQUs7QUFDakUsc0JBQVksR0FBRyxVQUFVLE1BQU07QUFBQSxRQUNqQyxXQUFXLE9BQU87QUFDaEIsc0JBQVksR0FBRyxPQUFPLE1BQU07QUFBQSxRQUM5QjtBQUFBLE1BQ0Y7QUFDQSxnQkFBVSxJQUFJO0FBQUEsSUFDaEI7QUFFQSxVQUFNLEVBQUUsS0FBSyxJQUFJO0FBQ2pCLFdBQU87QUFBQSxFQUNUO0FBQ0Y7QUFXQSxJQUFNLEtBQUssQ0FBQyxPQUFPLE9BQU8sTUFBTSxPQUFPLFdBQVcsTUFBTSxHQUFHLE9BQU8sTUFBTSxPQUFPLE1BQU07QUFVckYsSUFBTSxLQUFLLENBQUMsT0FBTyxRQUFRLE1BQU0sT0FBTyxXQUFXLE1BQU0sR0FBRyxRQUFRLE1BQU0sT0FBTyxNQUFNO0FBVXZGLElBQU0sS0FBSyxDQUFDLE9BQU8sT0FBTyxNQUFNLE9BQU8sV0FBVyxNQUFNLEdBQUcsT0FBTyxNQUFNLE9BQU8sTUFBTTtBQVVyRixJQUFNLEtBQUssQ0FBQyxPQUFPLE9BQU8sTUFBTSxPQUFPLFdBQVcsTUFBTSxHQUFHLE9BQU8sTUFBTSxPQUFPLE1BQU07QUFRckYsSUFBTSxPQUFPO0FBQ2IsSUFBTSxRQUFRO0FBR2QsSUFBTSxZQUFZO0FBR2xCLElBQU0sTUFBTTtBQUdaLElBQU0sT0FBTztBQUtiLElBQU0sU0FBUztBQUtmLElBQU0sZUFBZTtBQUdyQixJQUFNLE1BQU07QUFHWixJQUFNLEtBQUs7QUFHWCxJQUFNLE9BQU87QUFHYixJQUFNLFlBQVk7QUFDbEIsSUFBTSxjQUFjO0FBQ3BCLElBQU0sbUJBQW1CO0FBQ3pCLElBQU0sWUFBWTtBQUNsQixJQUFNLGFBQWE7QUFDbkIsSUFBTSxlQUFlO0FBQ3JCLElBQU0sb0JBQW9CO0FBQzFCLElBQU0sYUFBYTtBQUduQixJQUFNLFlBQVk7QUFDbEIsSUFBTSxhQUFhO0FBQ25CLElBQU0sV0FBVztBQUNqQixJQUFNLEtBQUs7QUFDWCxJQUFNLFlBQVk7QUFDbEIsSUFBTSxXQUFXO0FBQ2pCLElBQU0sUUFBUTtBQUNkLElBQU0sUUFBUTtBQUNkLElBQU0sUUFBUTtBQUNkLElBQU0sU0FBUztBQUNmLElBQU0sTUFBTTtBQUNaLElBQU0sU0FBUztBQUNmLElBQU0sY0FBYztBQUNwQixJQUFNLFNBQVM7QUFDZixJQUFNLFVBQVU7QUFDaEIsSUFBTSxPQUFPO0FBQ2IsSUFBTSxPQUFPO0FBQ2IsSUFBTSxRQUFRO0FBQ2QsSUFBTSxRQUFRO0FBQ2QsSUFBTSxRQUFRO0FBRWQsSUFBTSxPQUFPO0FBQ2IsSUFBTSxRQUFRO0FBQ2QsSUFBTSxRQUFRO0FBQ2QsSUFBTSxhQUFhO0FBR25CLElBQU0sVUFBVTtBQUdoQixJQUFNLE1BQU07QUFFWixJQUFJLEtBQWtCLHVCQUFPLE9BQU87QUFBQSxFQUNuQyxXQUFXO0FBQUEsRUFDWDtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQSxJQUFJO0FBQUEsRUFDSjtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBLE9BQU87QUFBQSxFQUNQO0FBQ0QsQ0FBQztBQUdELElBQU0sZUFBZTtBQUNyQixJQUFNLFNBQVM7QUFDZixJQUFNLFFBQVE7QUFFZCxJQUFNLFFBQVE7QUFDZCxJQUFNLFFBQVE7QUFnQmQsSUFBTSxLQUFLO0FBQ1gsSUFBTSxrQkFBa0I7QUFDeEIsSUFBTSxlQUFlO0FBRXJCLElBQUksT0FBTztBQUFYLElBQ0UsUUFBUTtBQXVCVixTQUFTLE9BQU8sZUFBZTtBQUM3QixNQUFJLGtCQUFrQixRQUFRO0FBQzVCLG9CQUFnQixDQUFDO0FBQUEsRUFDbkI7QUFHQSxRQUFNLFNBQVMsQ0FBQztBQUNoQixRQUFNLFNBQVM7QUFFZixRQUFNLFFBQVEsSUFBSSxNQUFNO0FBQ3hCLE1BQUksUUFBUSxNQUFNO0FBQ2hCLFdBQU8sV0FBVyxXQUFXO0FBQUEsRUFDL0I7QUFDQSxNQUFJLFNBQVMsTUFBTTtBQUNqQixZQUFRLFdBQVcsWUFBWTtBQUFBLEVBQ2pDO0FBR0EsS0FBRyxPQUFPLEtBQUssVUFBVTtBQUN6QixLQUFHLE9BQU8sS0FBSyxTQUFTO0FBQ3hCLEtBQUcsT0FBTyxLQUFLLFdBQVc7QUFDMUIsS0FBRyxPQUFPLEtBQUssZ0JBQWdCO0FBQy9CLEtBQUcsT0FBTyxLQUFLLFNBQVM7QUFDeEIsS0FBRyxPQUFPLEtBQUssVUFBVTtBQUN6QixLQUFHLE9BQU8sS0FBSyxZQUFZO0FBQzNCLEtBQUcsT0FBTyxLQUFLLGlCQUFpQjtBQUNoQyxLQUFHLE9BQU8sS0FBSyxVQUFVO0FBQ3pCLEtBQUcsT0FBTyxLQUFLLFNBQVM7QUFDeEIsS0FBRyxPQUFPLEtBQUssUUFBUTtBQUN2QixLQUFHLE9BQU8sS0FBSyxFQUFFO0FBQ2pCLEtBQUcsT0FBTyxLQUFLLFFBQVE7QUFDdkIsS0FBRyxPQUFPLEtBQUssS0FBSztBQUNwQixLQUFHLE9BQU8sS0FBSyxLQUFLO0FBQ3BCLEtBQUcsT0FBTyxLQUFLLEtBQUs7QUFDcEIsS0FBRyxPQUFPLEtBQUssTUFBTTtBQUNyQixLQUFHLE9BQU8sS0FBSyxHQUFHO0FBQ2xCLEtBQUcsT0FBTyxLQUFLLE1BQU07QUFDckIsS0FBRyxPQUFPLEtBQUssV0FBVztBQUMxQixLQUFHLE9BQU8sS0FBSyxNQUFNO0FBQ3JCLEtBQUcsT0FBTyxLQUFLLE9BQU87QUFDdEIsS0FBRyxPQUFPLEtBQUssSUFBSTtBQUNuQixLQUFHLE9BQU8sS0FBSyxJQUFJO0FBQ25CLEtBQUcsT0FBTyxLQUFLLEtBQUs7QUFDcEIsS0FBRyxPQUFPLEtBQUssS0FBSztBQUNwQixLQUFHLE9BQU8sS0FBSyxLQUFLO0FBQ3BCLEtBQUcsT0FBTyxLQUFLLEtBQUs7QUFDcEIsS0FBRyxPQUFPLEtBQUssSUFBSTtBQUNuQixLQUFHLE9BQU8sS0FBSyxLQUFLO0FBQ3BCLEtBQUcsT0FBTyxLQUFLLFVBQVU7QUFDekIsS0FBRyxPQUFPLE1BQU0sU0FBUztBQUN6QixRQUFNLE1BQU0sR0FBRyxPQUFPLE9BQU8sS0FBSztBQUFBLElBQ2hDLENBQUMsT0FBTyxHQUFHO0FBQUEsRUFDYixDQUFDO0FBQ0QsS0FBRyxLQUFLLE9BQU8sR0FBRztBQUdsQixRQUFNLE9BQU8sR0FBRyxPQUFPLGNBQWMsTUFBTTtBQUFBLElBQ3pDLENBQUMsS0FBSyxHQUFHO0FBQUEsRUFDWCxDQUFDO0FBQ0QsS0FBRyxNQUFNLGNBQWMsSUFBSTtBQUczQixRQUFNLFFBQVEsR0FBRyxPQUFPLFFBQVEsT0FBTztBQUFBLElBQ3JDLENBQUMsS0FBSyxHQUFHO0FBQUEsRUFDWCxDQUFDO0FBQ0QsS0FBRyxPQUFPLFlBQVk7QUFDdEIsS0FBRyxPQUFPLFFBQVEsS0FBSztBQUt2QixRQUFNLEtBQUssR0FBRyxPQUFPLE9BQU8sSUFBSTtBQUFBLElBQzlCLENBQUMsVUFBVSxHQUFHO0FBQUEsRUFDaEIsQ0FBQztBQUNELEtBQUcsT0FBTyxJQUFJLE1BQU07QUFBQSxJQUNsQixDQUFDLFVBQVUsR0FBRztBQUFBLEVBQ2hCLENBQUM7QUFDRCxLQUFHLElBQUksRUFBRTtBQUNULEtBQUcsSUFBSSxPQUFPLEVBQUU7QUFJaEIsUUFBTSxRQUFRLEdBQUcsT0FBTyxPQUFPLFNBQVM7QUFBQSxJQUN0QyxDQUFDLEtBQUssR0FBRztBQUFBLEVBQ1gsQ0FBQztBQUNELEtBQUcsT0FBTyxPQUFPLEtBQUs7QUFDdEIsS0FBRyxPQUFPLGlCQUFpQixLQUFLO0FBR2hDLFFBQU0sY0FBYyxHQUFHLE9BQU8sWUFBWTtBQUMxQyxLQUFHLGFBQWEsT0FBTyxLQUFLO0FBSzVCLFFBQU0sU0FBUyxDQUFDLENBQUMsY0FBYyxJQUFJLENBQUM7QUFDcEMsUUFBTSxVQUFVLENBQUMsQ0FBQyxjQUFjLElBQUksR0FBRyxDQUFDLFFBQVEsS0FBSyxDQUFDO0FBQ3RELFdBQVMsSUFBSSxHQUFHLElBQUksS0FBSyxRQUFRLEtBQUs7QUFDcEMsV0FBTyxPQUFPLEtBQUssQ0FBQyxHQUFHLEtBQUssTUFBTSxNQUFNO0FBQUEsRUFDMUM7QUFDQSxXQUFTLElBQUksR0FBRyxJQUFJLE1BQU0sUUFBUSxLQUFLO0FBQ3JDLFdBQU8sT0FBTyxNQUFNLENBQUMsR0FBRyxNQUFNLE9BQU8sT0FBTztBQUFBLEVBQzlDO0FBQ0EsY0FBWSxLQUFLO0FBQUEsSUFDZixLQUFLO0FBQUEsSUFDTCxPQUFPO0FBQUEsRUFDVCxHQUFHLE1BQU07QUFDVCxjQUFZLE1BQU07QUFBQSxJQUNoQixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsRUFDVCxHQUFHLE1BQU07QUFLVCxTQUFPLE9BQU8sUUFBUSxRQUFRLE1BQU0sTUFBTTtBQUMxQyxTQUFPLE9BQU8sVUFBVSxRQUFRLE1BQU0sTUFBTTtBQUM1QyxTQUFPLE9BQU8sUUFBUSxjQUFjLE1BQU0sTUFBTTtBQUNoRCxTQUFPLE9BQU8sU0FBUyxjQUFjLE1BQU0sTUFBTTtBQUNqRCxTQUFPLE9BQU8sT0FBTyxjQUFjLE1BQU0sTUFBTTtBQUMvQyxTQUFPLE9BQU8sUUFBUSxjQUFjLE1BQU0sTUFBTTtBQUNoRCxjQUFZLFFBQVE7QUFBQSxJQUNsQixRQUFRO0FBQUEsSUFDUixPQUFPO0FBQUEsRUFDVCxHQUFHLE1BQU07QUFDVCxjQUFZLGNBQWM7QUFBQSxJQUN4QixhQUFhO0FBQUEsSUFDYixPQUFPO0FBQUEsRUFDVCxHQUFHLE1BQU07QUFHVCxrQkFBZ0IsY0FBYyxLQUFLLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLElBQUksRUFBRTtBQUNqRSxXQUFTLElBQUksR0FBRyxJQUFJLGNBQWMsUUFBUSxLQUFLO0FBQzdDLFVBQU0sTUFBTSxjQUFjLENBQUMsRUFBRSxDQUFDO0FBQzlCLFVBQU0scUJBQXFCLGNBQWMsQ0FBQyxFQUFFLENBQUM7QUFDN0MsVUFBTSxRQUFRLHFCQUFxQjtBQUFBLE1BQ2pDLENBQUMsTUFBTSxHQUFHO0FBQUEsSUFDWixJQUFJO0FBQUEsTUFDRixDQUFDLFdBQVcsR0FBRztBQUFBLElBQ2pCO0FBQ0EsUUFBSSxJQUFJLFFBQVEsR0FBRyxLQUFLLEdBQUc7QUFDekIsWUFBTSxNQUFNLElBQUk7QUFBQSxJQUNsQixXQUFXLENBQUMsYUFBYSxLQUFLLEdBQUcsR0FBRztBQUNsQyxZQUFNLE9BQU8sSUFBSTtBQUFBLElBQ25CLFdBQVcsTUFBTSxLQUFLLEdBQUcsR0FBRztBQUMxQixZQUFNLFlBQVksSUFBSTtBQUFBLElBQ3hCLE9BQU87QUFDTCxZQUFNLEtBQUssSUFBSTtBQUFBLElBQ2pCO0FBQ0EsT0FBRyxPQUFPLEtBQUssS0FBSyxLQUFLO0FBQUEsRUFDM0I7QUFHQSxLQUFHLE9BQU8sYUFBYSxXQUFXO0FBQUEsSUFDaEMsT0FBTztBQUFBLEVBQ1QsQ0FBQztBQUdELFFBQU0sS0FBSyxJQUFJLE1BQU0sR0FBRztBQUN4QixTQUFPO0FBQUEsSUFDTCxPQUFPO0FBQUEsSUFDUCxRQUFRLE9BQU87QUFBQSxNQUNiO0FBQUEsSUFDRixHQUFHLEVBQUU7QUFBQSxFQUNQO0FBQ0Y7QUFXQSxTQUFTLE1BQU0sT0FBTyxLQUFLO0FBS3pCLFFBQU0sV0FBVyxjQUFjLElBQUksUUFBUSxVQUFVLE9BQUssRUFBRSxZQUFZLENBQUMsQ0FBQztBQUMxRSxRQUFNLFlBQVksU0FBUztBQUMzQixRQUFNLFNBQVMsQ0FBQztBQUloQixNQUFJLFNBQVM7QUFHYixNQUFJLGFBQWE7QUFHakIsU0FBTyxhQUFhLFdBQVc7QUFDN0IsUUFBSSxRQUFRO0FBQ1osUUFBSSxZQUFZO0FBQ2hCLFFBQUksY0FBYztBQUNsQixRQUFJLGtCQUFrQjtBQUN0QixRQUFJLGVBQWU7QUFDbkIsUUFBSSxvQkFBb0I7QUFDeEIsV0FBTyxhQUFhLGNBQWMsWUFBWSxNQUFNLEdBQUcsU0FBUyxVQUFVLENBQUMsSUFBSTtBQUM3RSxjQUFRO0FBR1IsVUFBSSxNQUFNLFFBQVEsR0FBRztBQUNuQix1QkFBZTtBQUNmLDRCQUFvQjtBQUNwQiwwQkFBa0I7QUFBQSxNQUNwQixXQUFXLGdCQUFnQixHQUFHO0FBQzVCLHdCQUFnQixTQUFTLFVBQVUsRUFBRTtBQUNyQztBQUFBLE1BQ0Y7QUFDQSxxQkFBZSxTQUFTLFVBQVUsRUFBRTtBQUNwQyxnQkFBVSxTQUFTLFVBQVUsRUFBRTtBQUMvQjtBQUFBLElBQ0Y7QUFHQSxjQUFVO0FBQ1Ysa0JBQWM7QUFDZCxtQkFBZTtBQUdmLFdBQU8sS0FBSztBQUFBLE1BQ1YsR0FBRyxnQkFBZ0I7QUFBQTtBQUFBLE1BRW5CLEdBQUcsSUFBSSxNQUFNLFNBQVMsYUFBYSxNQUFNO0FBQUE7QUFBQSxNQUV6QyxHQUFHLFNBQVM7QUFBQTtBQUFBLE1BRVosR0FBRztBQUFBO0FBQUEsSUFDTCxDQUFDO0FBQUEsRUFDSDtBQUVBLFNBQU87QUFDVDtBQWFBLFNBQVMsY0FBYyxLQUFLO0FBQzFCLFFBQU0sU0FBUyxDQUFDO0FBQ2hCLFFBQU0sTUFBTSxJQUFJO0FBQ2hCLE1BQUksUUFBUTtBQUNaLFNBQU8sUUFBUSxLQUFLO0FBQ2xCLFFBQUksUUFBUSxJQUFJLFdBQVcsS0FBSztBQUNoQyxRQUFJO0FBQ0osUUFBSSxPQUFPLFFBQVEsU0FBVSxRQUFRLFNBQVUsUUFBUSxNQUFNLFFBQVEsU0FBUyxJQUFJLFdBQVcsUUFBUSxDQUFDLEtBQUssU0FBVSxTQUFTLFFBQVMsSUFBSSxLQUFLLElBQzlJLElBQUksTUFBTSxPQUFPLFFBQVEsQ0FBQztBQUM1QixXQUFPLEtBQUssSUFBSTtBQUNoQixhQUFTLEtBQUs7QUFBQSxFQUNoQjtBQUNBLFNBQU87QUFDVDtBQVdBLFNBQVMsT0FBTyxPQUFPLE9BQU8sR0FBRyxVQUFVLElBQUk7QUFDN0MsTUFBSTtBQUNKLFFBQU0sTUFBTSxNQUFNO0FBQ2xCLFdBQVMsSUFBSSxHQUFHLElBQUksTUFBTSxHQUFHLEtBQUs7QUFDaEMsVUFBTSxPQUFPLE1BQU0sQ0FBQztBQUNwQixRQUFJLE1BQU0sRUFBRSxJQUFJLEdBQUc7QUFDakIsYUFBTyxNQUFNLEVBQUUsSUFBSTtBQUFBLElBQ3JCLE9BQU87QUFDTCxhQUFPLElBQUksTUFBTSxRQUFRO0FBQ3pCLFdBQUssS0FBSyxHQUFHLE1BQU07QUFDbkIsWUFBTSxFQUFFLElBQUksSUFBSTtBQUFBLElBQ2xCO0FBQ0EsWUFBUTtBQUFBLEVBQ1Y7QUFDQSxTQUFPLElBQUksTUFBTSxDQUFDO0FBQ2xCLE9BQUssS0FBSyxHQUFHLE1BQU07QUFDbkIsUUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDLENBQUMsSUFBSTtBQUMxQixTQUFPO0FBQ1Q7QUFRQSxTQUFTLFdBQVcsU0FBUztBQUMzQixRQUFNLFFBQVEsQ0FBQztBQUNmLFFBQU0sUUFBUSxDQUFDO0FBQ2YsTUFBSSxJQUFJO0FBQ1IsTUFBSSxTQUFTO0FBQ2IsU0FBTyxJQUFJLFFBQVEsUUFBUTtBQUN6QixRQUFJLGdCQUFnQjtBQUNwQixXQUFPLE9BQU8sUUFBUSxRQUFRLElBQUksYUFBYSxDQUFDLEtBQUssR0FBRztBQUN0RDtBQUFBLElBQ0Y7QUFFQSxRQUFJLGdCQUFnQixHQUFHO0FBQ3JCLFlBQU0sS0FBSyxNQUFNLEtBQUssRUFBRSxDQUFDO0FBQ3pCLGVBQVMsV0FBVyxTQUFTLFFBQVEsVUFBVSxHQUFHLElBQUksYUFBYSxHQUFHLEVBQUUsR0FBRyxXQUFXLEdBQUcsWUFBWTtBQUNuRyxjQUFNLElBQUk7QUFBQSxNQUNaO0FBQ0EsV0FBSztBQUFBLElBQ1AsT0FBTztBQUNMLFlBQU0sS0FBSyxRQUFRLENBQUMsQ0FBQztBQUNyQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0EsU0FBTztBQUNUO0FBbUZBLElBQU0sV0FBVztBQUFBLEVBQ2YsaUJBQWlCO0FBQUEsRUFDakIsUUFBUTtBQUFBLEVBQ1IsUUFBUTtBQUFBLEVBQ1IsWUFBWTtBQUFBLEVBQ1osT0FBTztBQUFBLEVBQ1AsU0FBUztBQUFBLEVBQ1QsUUFBUTtBQUFBLEVBQ1IsS0FBSztBQUFBLEVBQ0wsVUFBVTtBQUFBLEVBQ1YsVUFBVTtBQUFBLEVBQ1YsV0FBVztBQUFBLEVBQ1gsWUFBWTtBQUFBLEVBQ1osWUFBWSxDQUFDO0FBQUEsRUFDYixRQUFRO0FBQ1Y7QUFZQSxTQUFTLFFBQVEsTUFBTSxlQUFlO0FBQ3BDLE1BQUksa0JBQWtCLFFBQVE7QUFDNUIsb0JBQWdCO0FBQUEsRUFDbEI7QUFDQSxNQUFJLElBQUksT0FBTyxDQUFDLEdBQUcsUUFBUTtBQUMzQixNQUFJLE1BQU07QUFDUixRQUFJLE9BQU8sR0FBRyxnQkFBZ0IsVUFBVSxLQUFLLElBQUksSUFBSTtBQUFBLEVBQ3ZEO0FBR0EsUUFBTSxjQUFjLEVBQUU7QUFDdEIsUUFBTSx1QkFBdUIsQ0FBQztBQUM5QixXQUFTLElBQUksR0FBRyxJQUFJLFlBQVksUUFBUSxLQUFLO0FBQzNDLHlCQUFxQixLQUFLLFlBQVksQ0FBQyxFQUFFLFlBQVksQ0FBQztBQUFBLEVBQ3hEO0FBRUEsT0FBSyxJQUFJO0FBQ1QsTUFBSSxlQUFlO0FBQ2pCLFNBQUssZ0JBQWdCO0FBQUEsRUFDdkI7QUFDQSxPQUFLLGFBQWE7QUFDcEI7QUFDQSxRQUFRLFlBQVk7QUFBQSxFQUNsQixHQUFHO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFJSCxZQUFZLENBQUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBS2IsY0FBYyxJQUFJO0FBQ2hCLFdBQU87QUFBQSxFQUNUO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFPQSxNQUFNLE9BQU87QUFDWCxXQUFPLEtBQUssSUFBSSxZQUFZLE1BQU0sU0FBUyxHQUFHLEtBQUs7QUFBQSxFQUNyRDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBY0EsSUFBSSxLQUFLLFVBQVUsT0FBTztBQUN4QixVQUFNLGFBQWEsWUFBWTtBQUMvQixRQUFJLFNBQVMsS0FBSyxFQUFFLEdBQUc7QUFDdkIsUUFBSSxDQUFDLFFBQVE7QUFDWCxhQUFPO0FBQUEsSUFDVDtBQUNBLFFBQUksT0FBTyxXQUFXLFVBQVU7QUFDOUIsZUFBUyxNQUFNLEtBQUssU0FBUyxPQUFPLE1BQU0sQ0FBQyxJQUFJLFNBQVMsR0FBRztBQUMzRCxVQUFJLE9BQU8sV0FBVyxjQUFjLFlBQVk7QUFDOUMsaUJBQVMsT0FBTyxVQUFVLEtBQUs7QUFBQSxNQUNqQztBQUFBLElBQ0YsV0FBVyxPQUFPLFdBQVcsY0FBYyxZQUFZO0FBQ3JELGVBQVMsT0FBTyxVQUFVLE1BQU0sR0FBRyxLQUFLO0FBQUEsSUFDMUM7QUFDQSxXQUFPO0FBQUEsRUFDVDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFRQSxPQUFPLEtBQUssVUFBVSxPQUFPO0FBQzNCLFFBQUksTUFBTSxLQUFLLEVBQUUsR0FBRztBQUNwQixRQUFJLE9BQU8sUUFBUSxjQUFjLFlBQVksTUFBTTtBQUNqRCxZQUFNLElBQUksVUFBVSxNQUFNLEdBQUcsS0FBSztBQUFBLElBQ3BDO0FBQ0EsV0FBTztBQUFBLEVBQ1Q7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBUUEsT0FBTyxPQUFPO0FBQ1osVUFBTSxLQUFLLE1BQU0sT0FBTyxJQUFJO0FBQzVCLFVBQU0sV0FBVyxLQUFLLElBQUksVUFBVSxNQUFNLEtBQUssS0FBSyxLQUFLO0FBQ3pELFdBQU8sU0FBUyxJQUFJLE1BQU0sR0FBRyxLQUFLO0FBQUEsRUFDcEM7QUFDRjtBQUNBLFNBQVMsS0FBSyxLQUFLO0FBQ2pCLFNBQU87QUFDVDtBQWtCQSxTQUFTLFdBQVcsT0FBTyxRQUFRO0FBQ2pDLE9BQUssSUFBSTtBQUNULE9BQUssSUFBSTtBQUNULE9BQUssS0FBSztBQUNaO0FBZUEsV0FBVyxZQUFZO0FBQUEsRUFDckIsUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFLUixXQUFXO0FBQ1QsV0FBTyxLQUFLO0FBQUEsRUFDZDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBT0EsT0FBT0MsU0FBUTtBQUNiLFdBQU8sS0FBSyxTQUFTO0FBQUEsRUFDdkI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBS0Esa0JBQWtCLFNBQVM7QUFDekIsVUFBTSxNQUFNLEtBQUssU0FBUztBQUMxQixVQUFNLFdBQVcsUUFBUSxJQUFJLFlBQVksS0FBSyxJQUFJO0FBQ2xELFVBQU0sWUFBWSxRQUFRLElBQUksVUFBVSxLQUFLLElBQUk7QUFDakQsV0FBTyxZQUFZLFVBQVUsU0FBUyxXQUFXLFVBQVUsVUFBVSxHQUFHLFFBQVEsSUFBSSxXQUFNO0FBQUEsRUFDNUY7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFNQSxnQkFBZ0IsU0FBUztBQUN2QixXQUFPLFFBQVEsSUFBSSxjQUFjLEtBQUssT0FBTyxRQUFRLElBQUksaUJBQWlCLENBQUMsR0FBRyxJQUFJO0FBQUEsRUFDcEY7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBS0EsYUFBYTtBQUNYLFdBQU8sS0FBSyxHQUFHLENBQUMsRUFBRTtBQUFBLEVBQ3BCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBTUEsV0FBVztBQUNULFdBQU8sS0FBSyxHQUFHLEtBQUssR0FBRyxTQUFTLENBQUMsRUFBRTtBQUFBLEVBQ3JDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFVQSxTQUFTLFVBQVU7QUFDakIsUUFBSSxhQUFhLFFBQVE7QUFDdkIsaUJBQVcsU0FBUztBQUFBLElBQ3RCO0FBQ0EsV0FBTztBQUFBLE1BQ0wsTUFBTSxLQUFLO0FBQUEsTUFDWCxPQUFPLEtBQUssU0FBUztBQUFBLE1BQ3JCLFFBQVEsS0FBSztBQUFBLE1BQ2IsTUFBTSxLQUFLLE9BQU8sUUFBUTtBQUFBLE1BQzFCLE9BQU8sS0FBSyxXQUFXO0FBQUEsTUFDdkIsS0FBSyxLQUFLLFNBQVM7QUFBQSxJQUNyQjtBQUFBLEVBQ0Y7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBS0Esa0JBQWtCLFNBQVM7QUFDekIsV0FBTztBQUFBLE1BQ0wsTUFBTSxLQUFLO0FBQUEsTUFDWCxPQUFPLEtBQUssa0JBQWtCLE9BQU87QUFBQSxNQUNyQyxRQUFRLEtBQUs7QUFBQSxNQUNiLE1BQU0sS0FBSyxnQkFBZ0IsT0FBTztBQUFBLE1BQ2xDLE9BQU8sS0FBSyxXQUFXO0FBQUEsTUFDdkIsS0FBSyxLQUFLLFNBQVM7QUFBQSxJQUNyQjtBQUFBLEVBQ0Y7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFNQSxTQUFTLFNBQVM7QUFDaEIsV0FBTyxRQUFRLElBQUksWUFBWSxLQUFLLFNBQVMsR0FBRyxJQUFJO0FBQUEsRUFDdEQ7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBS0EsT0FBTyxTQUFTO0FBQ2QsVUFBTSxRQUFRO0FBQ2QsVUFBTSxPQUFPLEtBQUssT0FBTyxRQUFRLElBQUksaUJBQWlCLENBQUM7QUFDdkQsVUFBTSxnQkFBZ0IsUUFBUSxJQUFJLGNBQWMsTUFBTSxJQUFJO0FBQzFELFVBQU0sVUFBVSxRQUFRLElBQUksV0FBVyxNQUFNLEtBQUs7QUFDbEQsVUFBTSxVQUFVLEtBQUssa0JBQWtCLE9BQU87QUFDOUMsVUFBTSxhQUFhLENBQUM7QUFDcEIsVUFBTSxZQUFZLFFBQVEsSUFBSSxhQUFhLE1BQU0sS0FBSztBQUN0RCxVQUFNLFNBQVMsUUFBUSxJQUFJLFVBQVUsTUFBTSxLQUFLO0FBQ2hELFVBQU0sTUFBTSxRQUFRLElBQUksT0FBTyxNQUFNLEtBQUs7QUFDMUMsVUFBTSxRQUFRLFFBQVEsT0FBTyxjQUFjLE1BQU0sS0FBSztBQUN0RCxVQUFNLGlCQUFpQixRQUFRLE9BQU8sVUFBVSxNQUFNLEtBQUs7QUFDM0QsZUFBVyxPQUFPO0FBQ2xCLFFBQUksV0FBVztBQUNiLGlCQUFXLFFBQVE7QUFBQSxJQUNyQjtBQUNBLFFBQUksUUFBUTtBQUNWLGlCQUFXLFNBQVM7QUFBQSxJQUN0QjtBQUNBLFFBQUksS0FBSztBQUNQLGlCQUFXLE1BQU07QUFBQSxJQUNuQjtBQUNBLFFBQUksT0FBTztBQUNULGFBQU8sWUFBWSxLQUFLO0FBQUEsSUFDMUI7QUFDQSxXQUFPO0FBQUEsTUFDTDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7QUFRQSxTQUFTLGlCQUFpQixNQUFNLE9BQU87QUFDckMsUUFBTSxjQUFjLFdBQVc7QUFBQSxJQUM3QixZQUFZLE9BQU8sUUFBUTtBQUN6QixZQUFNLE9BQU8sTUFBTTtBQUNuQixXQUFLLElBQUk7QUFBQSxJQUNYO0FBQUEsRUFDRjtBQUNBLGFBQVcsS0FBSyxPQUFPO0FBQ3JCLFVBQU0sVUFBVSxDQUFDLElBQUksTUFBTSxDQUFDO0FBQUEsRUFDOUI7QUFDQSxRQUFNLElBQUk7QUFDVixTQUFPO0FBQ1Q7QUFLQSxJQUFNLFFBQVEsaUJBQWlCLFNBQVM7QUFBQSxFQUN0QyxRQUFRO0FBQUEsRUFDUixTQUFTO0FBQ1AsV0FBTyxZQUFZLEtBQUssU0FBUztBQUFBLEVBQ25DO0FBQ0YsQ0FBQztBQUtELElBQU0sT0FBTyxpQkFBaUIsTUFBTTtBQU1wQyxJQUFNLEtBQUssaUJBQWlCLElBQUk7QUFNaEMsSUFBTSxNQUFNLGlCQUFpQixPQUFPO0FBQUEsRUFDbEMsUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFRUixPQUFPQSxTQUFRO0FBQ2IsUUFBSUEsWUFBVyxRQUFRO0FBQ3JCLE1BQUFBLFVBQVMsU0FBUztBQUFBLElBQ3BCO0FBRUEsV0FBTyxLQUFLLFlBQVksSUFBSSxLQUFLLElBQUksR0FBR0EsYUFBWSxLQUFLO0FBQUEsRUFDM0Q7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBS0EsY0FBYztBQUNaLFVBQU0sU0FBUyxLQUFLO0FBQ3BCLFdBQU8sT0FBTyxVQUFVLEtBQUssT0FBTyxDQUFDLEVBQUUsTUFBTSxhQUFhLE9BQU8sQ0FBQyxFQUFFLE1BQU07QUFBQSxFQUM1RTtBQUNGLENBQUM7QUEyQkQsSUFBTSxZQUFZLFNBQU8sSUFBSSxNQUFNLEdBQUc7QUFNdEMsU0FBUyxPQUFPLE1BQU07QUFDcEIsTUFBSTtBQUFBLElBQ0Y7QUFBQSxFQUNGLElBQUk7QUFFSixRQUFNLGNBQWMsT0FBTyxPQUFPLE9BQU8sQ0FBQyxXQUFXLFVBQVUsSUFBSSxXQUFXLFVBQVUsT0FBTyxRQUFRLFFBQVEsUUFBUSxLQUFLLFNBQVMsTUFBTSxNQUFNLE9BQU8sT0FBTyxLQUFLLE9BQU8sVUFBVSxDQUFDO0FBS3RMLFFBQU0saUJBQWlCLENBQUMsWUFBWSxtQkFBbUIsWUFBWSxjQUFjLFlBQVksT0FBTyxPQUFPLEtBQUssYUFBYSxrQkFBa0IsV0FBVyxhQUFhLFdBQVcsT0FBTyxPQUFPLElBQUk7QUFJcE0sUUFBTSxxQkFBcUIsQ0FBQyxXQUFXLFlBQVksVUFBVSxXQUFXLFVBQVUsT0FBTyxZQUFZLFFBQVEsUUFBUSxRQUFRLFdBQVcsU0FBUyxNQUFNLE1BQU0sT0FBTyxPQUFPLE9BQU8sS0FBSyxPQUFPLFVBQVU7QUFNeE0sUUFBTSxRQUFRLFVBQVU7QUFDeEIsUUFBTSxZQUFZLEdBQUcsT0FBTyxLQUFLO0FBQ2pDLEtBQUcsV0FBVyxvQkFBb0IsU0FBUztBQUMzQyxLQUFHLFdBQVcsT0FBTyxRQUFRLFNBQVM7QUFDdEMsUUFBTSxTQUFTLFVBQVUsR0FDdkIsU0FBUyxVQUFVLEdBQ25CLGNBQWMsVUFBVTtBQUMxQixLQUFHLE9BQU8sT0FBTyxRQUFRLE1BQU07QUFDL0IsS0FBRyxPQUFPLE9BQU8sUUFBUSxNQUFNO0FBQy9CLEtBQUcsT0FBTyxPQUFPLGFBQWEsV0FBVztBQUV6QyxLQUFHLFFBQVEsb0JBQW9CLFNBQVM7QUFDeEMsS0FBRyxRQUFRLE9BQU8sUUFBUSxNQUFNO0FBQ2hDLFFBQU0sY0FBYyxHQUFHLFFBQVEsRUFBRTtBQUVqQyxLQUFHLFdBQVcsSUFBSSxXQUFXO0FBRzdCLEtBQUcsUUFBUSxJQUFJLFdBQVc7QUFDMUIsS0FBRyxhQUFhLElBQUksV0FBVztBQUMvQixRQUFNLGVBQWUsR0FBRyxXQUFXLEdBQUc7QUFDdEMsS0FBRyxjQUFjLG9CQUFvQixTQUFTO0FBQzlDLEtBQUcsY0FBYyxPQUFPLFFBQVEsU0FBUztBQUN6QyxRQUFNLGNBQWMsVUFBVTtBQUM5QixLQUFHLGFBQWEsT0FBTyxRQUFRLFdBQVc7QUFDMUMsS0FBRyxhQUFhLE9BQU8sUUFBUSxXQUFXO0FBQzFDLFFBQU0saUJBQWlCLEdBQUcsYUFBYSxHQUFHO0FBQzFDLEtBQUcsZ0JBQWdCLE9BQU8sUUFBUSxXQUFXO0FBQzdDLFFBQU0sVUFBVSxVQUFVLEtBQUs7QUFDL0IsS0FBRyxnQkFBZ0IsT0FBTyxLQUFLLE9BQU87QUFDdEMsS0FBRyxnQkFBZ0IsT0FBTyxNQUFNLE9BQU87QUFDdkMsS0FBRyxhQUFhLFdBQVcsT0FBTztBQUdsQyxRQUFNLG9CQUFvQixHQUFHLGFBQWEsTUFBTTtBQUNoRCxLQUFHLG1CQUFtQixPQUFPLFFBQVEsV0FBVztBQUNoRCxLQUFHLFNBQVMsT0FBTyxRQUFRLFdBQVc7QUFDdEMsS0FBRyxTQUFTLEtBQUssY0FBYztBQUMvQixLQUFHLFNBQVMsUUFBUSxpQkFBaUI7QUFHckMsUUFBTSxhQUFhLEdBQUcsU0FBUyxLQUFLO0FBRXBDLEtBQUcsWUFBWSxPQUFPLFNBQVMsS0FBSztBQUlwQyxRQUFNLGVBQWUsR0FBRyxRQUFRLE1BQU07QUFDdEMsUUFBTSxZQUFZLEdBQUcsUUFBUSxHQUFHO0FBQ2hDLEtBQUcsY0FBYyxPQUFPLFFBQVEsTUFBTTtBQUN0QyxLQUFHLFdBQVcsb0JBQW9CLFNBQVM7QUFDM0MsS0FBRyxXQUFXLE9BQU8sUUFBUSxNQUFNO0FBQ25DLFFBQU0sZUFBZSxVQUFVLEdBQUc7QUFDbEMsS0FBRyxXQUFXLE9BQU8sS0FBSyxZQUFZO0FBQ3RDLEtBQUcsV0FBVyxPQUFPLE1BQU0sWUFBWTtBQUN2QyxLQUFHLGNBQWMsT0FBTyxRQUFRLE1BQU07QUFDdEMsS0FBRyxjQUFjLG9CQUFvQixTQUFTO0FBQzlDLEtBQUcsY0FBYyxLQUFLLFNBQVM7QUFDL0IsS0FBRyxjQUFjLFFBQVEsWUFBWTtBQUNyQyxLQUFHLGNBQWMsSUFBSSxXQUFXO0FBQ2hDLFFBQU0sb0JBQW9CLEdBQUcsY0FBYyxLQUFLO0FBQ2hELFFBQU0sd0JBQXdCLFVBQVUsR0FBRztBQUMzQyxLQUFHLG1CQUFtQixPQUFPLFNBQVMscUJBQXFCO0FBRzNELFFBQU0sUUFBUSxVQUFVLEdBQUc7QUFHM0IsUUFBTSxlQUFlLFVBQVU7QUFHL0IsS0FBRyxPQUFPLGFBQWEsS0FBSztBQUM1QixLQUFHLE9BQU8sZ0JBQWdCLFlBQVk7QUFDdEMsS0FBRyxjQUFjLGFBQWEsS0FBSztBQUNuQyxLQUFHLGNBQWMsZ0JBQWdCLFlBQVk7QUFJN0MsS0FBRyxjQUFjLE9BQU8sS0FBSztBQUM3QixLQUFHLHVCQUF1QixPQUFPLEtBQUs7QUFHdEMsUUFBTSxjQUFjLEdBQUcsUUFBUSxLQUFLO0FBQ3BDLFFBQU0sbUJBQW1CLEdBQUcsYUFBYSxLQUFLO0FBQzlDLFFBQU0sd0JBQXdCLEdBQUcsa0JBQWtCLEtBQUs7QUFFeEQsUUFBTSxZQUFZLEdBQUcsdUJBQXVCLEtBQUs7QUFHakQsS0FBRyxRQUFRLE9BQU8sUUFBUSxNQUFNO0FBQ2hDLEtBQUcsUUFBUSxLQUFLLFNBQVM7QUFDekIsS0FBRyxRQUFRLFFBQVEsWUFBWTtBQUMvQixLQUFHLGFBQWEsT0FBTyxRQUFRLE1BQU07QUFDckMsS0FBRyxhQUFhLEtBQUssU0FBUztBQUM5QixLQUFHLGFBQWEsUUFBUSxZQUFZO0FBR3BDLEtBQUcsYUFBYSxPQUFPLFFBQVEsS0FBSztBQUNwQyxLQUFHLGFBQWEsT0FBTyxLQUFLO0FBQzVCLEtBQUcsV0FBVyxPQUFPLFFBQVEsS0FBSztBQUNsQyxLQUFHLFdBQVcsYUFBYSxLQUFLO0FBQ2hDLEtBQUcsV0FBVyxPQUFPLEtBQUs7QUFHMUIsUUFBTSxlQUFlLEdBQUcsT0FBTyxTQUFTO0FBQ3hDLFFBQU0saUJBQWlCLEdBQUcsT0FBTyxXQUFXO0FBQzVDLFFBQU0sc0JBQXNCLEdBQUcsT0FBTyxnQkFBZ0I7QUFDdEQsUUFBTSxlQUFlLEdBQUcsT0FBTyxTQUFTO0FBRXhDLEtBQUcsY0FBYyxXQUFXLFlBQVk7QUFDeEMsS0FBRyxjQUFjLGFBQWEsY0FBYztBQUM1QyxLQUFHLGNBQWMsa0JBQWtCLG1CQUFtQjtBQUN0RCxLQUFHLGNBQWMsV0FBVyxZQUFZO0FBR3hDLEtBQUcsY0FBYyxZQUFZLEtBQUs7QUFDbEMsS0FBRyxnQkFBZ0IsY0FBYyxLQUFLO0FBQ3RDLEtBQUcscUJBQXFCLG1CQUFtQixLQUFLO0FBQ2hELEtBQUcsY0FBYyxZQUFZLEtBQUs7QUFDbEMsS0FBRyxjQUFjLFlBQVksS0FBSztBQUtsQyxRQUFNLGdCQUFnQixVQUFVLEdBQUc7QUFDbkMsUUFBTSxrQkFBa0IsVUFBVSxHQUFHO0FBQ3JDLFFBQU0sdUJBQXVCLFVBQVUsR0FBRztBQUMxQyxRQUFNLGdCQUFnQixVQUFVLEdBQUc7QUFDbkMsS0FBRyxjQUFjLGFBQWEsYUFBYTtBQUMzQyxLQUFHLGdCQUFnQixhQUFhLGVBQWU7QUFDL0MsS0FBRyxxQkFBcUIsYUFBYSxvQkFBb0I7QUFDekQsS0FBRyxjQUFjLGFBQWEsYUFBYTtBQUMzQyxRQUFNLG1CQUFtQixVQUFVO0FBQ25DLFFBQU0scUJBQXFCLFVBQVU7QUFDckMsUUFBTSwwQkFBMEIsVUFBVTtBQUMxQyxRQUFNLG1CQUFtQixVQUFVO0FBQ25DLEtBQUcsY0FBYyxjQUFjO0FBQy9CLEtBQUcsZ0JBQWdCLGNBQWM7QUFDakMsS0FBRyxxQkFBcUIsY0FBYztBQUN0QyxLQUFHLGNBQWMsY0FBYztBQUcvQixLQUFHLGVBQWUsYUFBYSxhQUFhO0FBQzVDLEtBQUcsaUJBQWlCLGFBQWEsZUFBZTtBQUNoRCxLQUFHLHNCQUFzQixhQUFhLG9CQUFvQjtBQUMxRCxLQUFHLGVBQWUsYUFBYSxhQUFhO0FBQzVDLEtBQUcsZUFBZSxnQkFBZ0IsYUFBYTtBQUMvQyxLQUFHLGlCQUFpQixnQkFBZ0IsZUFBZTtBQUNuRCxLQUFHLHNCQUFzQixnQkFBZ0Isb0JBQW9CO0FBQzdELEtBQUcsZUFBZSxnQkFBZ0IsYUFBYTtBQUMvQyxLQUFHLGtCQUFrQixhQUFhLGdCQUFnQjtBQUNsRCxLQUFHLG9CQUFvQixhQUFhLGVBQWU7QUFDbkQsS0FBRyx5QkFBeUIsYUFBYSxvQkFBb0I7QUFDN0QsS0FBRyxrQkFBa0IsYUFBYSxhQUFhO0FBQy9DLEtBQUcsa0JBQWtCLGdCQUFnQixnQkFBZ0I7QUFDckQsS0FBRyxvQkFBb0IsZ0JBQWdCLGtCQUFrQjtBQUN6RCxLQUFHLHlCQUF5QixnQkFBZ0IsdUJBQXVCO0FBQ25FLEtBQUcsa0JBQWtCLGdCQUFnQixnQkFBZ0I7QUFHckQsS0FBRyxpQkFBaUIsY0FBYyxLQUFLO0FBQ3ZDLEtBQUcsc0JBQXNCLG1CQUFtQixLQUFLO0FBQ2pELEtBQUcsZUFBZSxZQUFZLEtBQUs7QUFDbkMsS0FBRyxlQUFlLFlBQVksS0FBSztBQUNuQyxLQUFHLG9CQUFvQixjQUFjLEtBQUs7QUFDMUMsS0FBRyx5QkFBeUIsbUJBQW1CLEtBQUs7QUFDcEQsS0FBRyxrQkFBa0IsWUFBWSxLQUFLO0FBQ3RDLEtBQUcsa0JBQWtCLFlBQVksS0FBSztBQUN0QyxLQUFHLE9BQU8sV0FBVyxZQUFZO0FBQ2pDLEtBQUcsT0FBTyxNQUFNLEVBQUU7QUFFbEIsU0FBTztBQUFBLElBQ0wsT0FBTztBQUFBLElBQ1AsUUFBUTtBQUFBLEVBQ1Y7QUFDRjtBQVlBLFNBQVMsSUFBSSxPQUFPLE9BQU8sUUFBUTtBQUNqQyxNQUFJLE1BQU0sT0FBTztBQUNqQixNQUFJLFNBQVM7QUFDYixNQUFJLFNBQVMsQ0FBQztBQUNkLE1BQUksYUFBYSxDQUFDO0FBQ2xCLFNBQU8sU0FBUyxLQUFLO0FBQ25CLFFBQUksUUFBUTtBQUNaLFFBQUksY0FBYztBQUNsQixRQUFJLFlBQVk7QUFDaEIsUUFBSSxjQUFjO0FBQ2xCLFFBQUksa0JBQWtCO0FBQ3RCLFFBQUksZUFBZTtBQUNuQixXQUFPLFNBQVMsT0FBTyxFQUFFLGNBQWMsTUFBTSxHQUFHLE9BQU8sTUFBTSxFQUFFLENBQUMsSUFBSTtBQUdsRSxpQkFBVyxLQUFLLE9BQU8sUUFBUSxDQUFDO0FBQUEsSUFDbEM7QUFDQSxXQUFPLFNBQVMsUUFBUSxZQUFZLGVBQWUsTUFBTSxHQUFHLE9BQU8sTUFBTSxFQUFFLENBQUMsSUFBSTtBQUU5RSxvQkFBYztBQUNkLGNBQVE7QUFHUixVQUFJLE1BQU0sUUFBUSxHQUFHO0FBQ25CLHVCQUFlO0FBQ2YsMEJBQWtCO0FBQUEsTUFDcEIsV0FBVyxnQkFBZ0IsR0FBRztBQUM1QjtBQUFBLE1BQ0Y7QUFDQTtBQUNBO0FBQUEsSUFDRjtBQUNBLFFBQUksZUFBZSxHQUFHO0FBSXBCLGdCQUFVO0FBQ1YsVUFBSSxTQUFTLEtBQUs7QUFDaEIsbUJBQVcsS0FBSyxPQUFPLE1BQU0sQ0FBQztBQUM5QjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLE9BQU87QUFHTCxVQUFJLFdBQVcsU0FBUyxHQUFHO0FBQ3pCLGVBQU8sS0FBSyxlQUFlLE1BQU0sT0FBTyxVQUFVLENBQUM7QUFDbkQscUJBQWEsQ0FBQztBQUFBLE1BQ2hCO0FBR0EsZ0JBQVU7QUFDVixxQkFBZTtBQUdmLFlBQU0sUUFBUSxnQkFBZ0I7QUFDOUIsWUFBTSxZQUFZLE9BQU8sTUFBTSxTQUFTLGFBQWEsTUFBTTtBQUMzRCxhQUFPLEtBQUssZUFBZSxPQUFPLE9BQU8sU0FBUyxDQUFDO0FBQUEsSUFDckQ7QUFBQSxFQUNGO0FBR0EsTUFBSSxXQUFXLFNBQVMsR0FBRztBQUN6QixXQUFPLEtBQUssZUFBZSxNQUFNLE9BQU8sVUFBVSxDQUFDO0FBQUEsRUFDckQ7QUFDQSxTQUFPO0FBQ1Q7QUFVQSxTQUFTLGVBQWUsT0FBTyxPQUFPLFFBQVE7QUFDNUMsUUFBTSxXQUFXLE9BQU8sQ0FBQyxFQUFFO0FBQzNCLFFBQU0sU0FBUyxPQUFPLE9BQU8sU0FBUyxDQUFDLEVBQUU7QUFDekMsUUFBTSxRQUFRLE1BQU0sTUFBTSxVQUFVLE1BQU07QUFDMUMsU0FBTyxJQUFJLE1BQU0sT0FBTyxNQUFNO0FBQ2hDO0FBTUEsSUFBTSxPQUFPO0FBQUEsRUFDWCxTQUFTO0FBQUEsRUFDVCxRQUFRO0FBQUEsRUFDUixZQUFZLENBQUM7QUFBQSxFQUNiLGFBQWEsQ0FBQztBQUFBLEVBQ2QsZUFBZSxDQUFDO0FBQUEsRUFDaEIsYUFBYTtBQUNmO0FBK0dBLFNBQVMsT0FBTztBQUVkLE9BQUssVUFBVSxPQUFPLEtBQUssYUFBYTtBQUN4QyxXQUFTLElBQUksR0FBRyxJQUFJLEtBQUssV0FBVyxRQUFRLEtBQUs7QUFDL0MsU0FBSyxXQUFXLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFBQSxNQUNwQixTQUFTLEtBQUs7QUFBQSxJQUNoQixDQUFDO0FBQUEsRUFDSDtBQUdBLE9BQUssU0FBUyxPQUFPLEtBQUssUUFBUSxNQUFNO0FBQ3hDLFdBQVMsSUFBSSxHQUFHLElBQUksS0FBSyxZQUFZLFFBQVEsS0FBSztBQUNoRCxTQUFLLFlBQVksQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUFBLE1BQ3JCLFNBQVMsS0FBSztBQUFBLE1BQ2QsUUFBUSxLQUFLO0FBQUEsSUFDZixDQUFDO0FBQUEsRUFDSDtBQUNBLE9BQUssY0FBYztBQUNyQjtBQU9BLFNBQVMsU0FBUyxLQUFLO0FBQ3JCLE1BQUksQ0FBQyxLQUFLLGFBQWE7QUFDckIsU0FBSztBQUFBLEVBQ1A7QUFDQSxTQUFPLElBQUksS0FBSyxPQUFPLE9BQU8sS0FBSyxNQUFNLEtBQUssUUFBUSxPQUFPLEdBQUcsQ0FBQztBQUNuRTtBQVVBLFNBQVMsS0FBSyxLQUFLLE1BQU0sTUFBTTtBQUM3QixNQUFJLFNBQVMsUUFBUTtBQUNuQixXQUFPO0FBQUEsRUFDVDtBQUNBLE1BQUksU0FBUyxRQUFRO0FBQ25CLFdBQU87QUFBQSxFQUNUO0FBQ0EsTUFBSSxRQUFRLE9BQU8sU0FBUyxVQUFVO0FBQ3BDLFFBQUksTUFBTTtBQUNSLFlBQU0sTUFBTSxnQ0FBZ0Msd0JBQXdCO0FBQUEsSUFDdEU7QUFDQSxXQUFPO0FBQ1AsV0FBTztBQUFBLEVBQ1Q7QUFDQSxRQUFNLFVBQVUsSUFBSSxRQUFRLElBQUk7QUFDaEMsUUFBTSxTQUFTLFNBQVMsR0FBRztBQUMzQixRQUFNLFdBQVcsQ0FBQztBQUNsQixXQUFTLElBQUksR0FBRyxJQUFJLE9BQU8sUUFBUSxLQUFLO0FBQ3RDLFVBQU0sUUFBUSxPQUFPLENBQUM7QUFDdEIsUUFBSSxNQUFNLFdBQVcsQ0FBQyxRQUFRLE1BQU0sTUFBTSxPQUFPO0FBQy9DLGVBQVMsS0FBSyxNQUFNLGtCQUFrQixPQUFPLENBQUM7QUFBQSxJQUNoRDtBQUFBLEVBQ0Y7QUFDQSxTQUFPO0FBQ1Q7OztBRGx2REEsSUFBTSxzQkFBTixjQUFpQyxJQUFJLFNBQVM7QUFBQSxFQWtFNUMsWUFDRSxNQUNBO0FBQ0EsVUFBTTtBQWpEUixvQkFBVyxJQUFJLFFBQVEsSUFBSSxNQUFNO0FBQ2pDLHlCQUFnQixJQUFJLFFBQVEsSUFBSSxXQUFXO0FBQzNDLHNCQUFhLElBQUksUUFBUSxJQUFJLFFBQVE7QUFDckMsNkJBQW9CLElBQUksUUFBUSxJQUFJLGVBQWU7QUFDbkQsb0JBQVcsSUFBSSxRQUFRLElBQUksTUFBTTtBQUVqQyxtQkFBVTtBQUFBLE1BQ1IsQ0FBQyxRQUFRLEtBQUssUUFBUTtBQUFBLE1BQ3RCLENBQUMsYUFBYSxLQUFLLGFBQWE7QUFBQSxNQUNoQyxDQUFDLFVBQVUsS0FBSyxVQUFVO0FBQUEsTUFDMUIsQ0FBQyxpQkFBaUIsS0FBSyxpQkFBaUI7QUFBQSxJQUMxQztBQXFCQSxxQkFBWSxvQkFBSSxJQUFZO0FBd0M1QixxQkFBNEI7QUFDNUIseUJBQXdCO0FBdEJ0QixTQUFLLGdCQUFnQkMsS0FBSSxhQUFhLFlBQVk7QUFFbEQsU0FBSyxjQUFjO0FBQ25CLFFBQUk7QUFBTSxXQUFLLE9BQU87QUFFdEIsU0FBSyxPQUFPLFFBQVEsWUFBWSxDQUFDLFNBQVMsTUFBTSxTQUFTO0FBQ3ZELFVBQUksQ0FBQyxLQUFLO0FBQU07QUFFaEIsVUFDRSxLQUFLLFNBQVMsWUFBWSxLQUFLLFNBQVMscUJBQ3hDLEtBQUssT0FBTyxpQkFBaUIsSUFBSSxFQUFFO0FBQUEsUUFDakMsS0FBSyxPQUFPLGlCQUFpQixLQUFLLE9BQU8sV0FBVyxDQUFDO0FBQUEsTUFDdkQsR0FDQTtBQUNBLGFBQUssS0FBSyxtQkFBbUI7QUFBQSxNQUMvQjtBQUVBLFdBQUssb0JBQW9CO0FBQUEsSUFDM0IsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQXZEQSxJQUFJLE9BQU87QUFDVCxXQUFPLEtBQUs7QUFBQSxFQUNkO0FBQUEsRUFFQSxJQUFJLEtBQUssTUFBd0I7QUFDL0IsUUFBSSxDQUFDO0FBQU07QUFFWCxTQUFLLFFBQVE7QUFDYixTQUFLLFdBQVc7QUFDaEIsU0FBSyxPQUFPLE9BQU8sS0FBSztBQUN4QixTQUFLLFVBQVUsS0FBSyxJQUFJO0FBRXhCLFNBQUssc0JBQXNCO0FBQzNCLFNBQUssaUJBQWlCO0FBQ3RCLFNBQUssZUFBZTtBQUFBLEVBQ3RCO0FBQUEsRUFJQSxpQkFBaUI7QUFDZixRQUFJLENBQUMsS0FBSztBQUFNO0FBRWhCLFNBQUssVUFBVSxJQUFJLEtBQUssS0FBSyxRQUFRLGlCQUFpQixNQUFNO0FBQzFELFdBQUssc0JBQXNCO0FBQUEsSUFDN0IsQ0FBQyxDQUFDO0FBQUEsRUFDSjtBQUFBLEVBRUEsbUJBQW1CO0FBQUEsRUFBQztBQUFBLEVBaUNwQixzQkFBc0I7QUFDcEIsVUFBTSxXQUFXLEtBQUssUUFBUSxLQUFLLFFBQVE7QUFFM0MsUUFBSSxVQUFVO0FBQ1osWUFBTSxRQUFRLEtBQUssT0FBTyxtQkFBbUIsUUFBUTtBQUVyRCxVQUFJLENBQUMsTUFBTSxXQUFXLEtBQUssUUFBUSxHQUFHO0FBQ3BDLGNBQU0sdUJBQXVCLEtBQUssUUFBUTtBQUFBLE1BQzVDO0FBRUEsWUFBTSxNQUFNLE1BQU0sS0FBSztBQUN2QixVQUFJLHNCQUFzQixLQUFLLFFBQVE7QUFFdkMsVUFDRSxNQUFNLFdBQVcsTUFBTSxLQUFLLGFBQzVCLElBQUksV0FBVyxNQUFNLEtBQUssZUFDMUI7QUFDQSxjQUFNLE9BQU8sS0FBSyxPQUFPLFNBQVMsT0FBTyxLQUFLLEtBQUssRUFDaEQsUUFBUSxXQUFXLEVBQUU7QUFFeEIsYUFBSyxLQUFLLGlCQUFpQixJQUFJO0FBRS9CLGFBQUssWUFBWSxNQUFNLFdBQVc7QUFDbEMsYUFBSyxnQkFBZ0IsSUFBSSxXQUFXO0FBQUEsTUFDdEM7QUFBQSxJQUNGLFdBQVcsYUFBYSxLQUFLLFdBQVc7QUFDdEMsV0FBSyxLQUFLLGlCQUFpQjtBQUMzQixXQUFLLFlBQVk7QUFBQSxJQUNuQjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLHdCQUF3QjtBQUN0QixRQUFJLENBQUMsS0FBSztBQUFNO0FBQ2hCLFFBQUk7QUFFSixRQUFJLEtBQUssY0FBYyxNQUFNO0FBQzNCLFlBQU0sZUFBZSxLQUFLLGtCQUFrQixFQUFFO0FBQUEsUUFDNUM7QUFBQSxNQUNGO0FBQ0EsVUFBSSxhQUFhLENBQUMsR0FBRztBQUNuQixnQkFBUSxhQUFhLENBQUMsRUFBRSxVQUFVO0FBQUEsTUFDcEMsT0FBTztBQUNMLGdCQUFRO0FBQUEsTUFDVjtBQUFBLElBQ0YsT0FBTztBQUNMLFlBQU0sZUFBZSxLQUFLLGtCQUFrQixFQUFFO0FBQUEsUUFDNUMsY0FBYyxNQUFNLEtBQUssS0FBSyxLQUFLO0FBQUEsTUFDckM7QUFDQSxVQUFJLGFBQWEsQ0FBQyxHQUFHO0FBQ25CLGdCQUFRLGFBQWEsQ0FBQyxFQUFFLFVBQVU7QUFBQSxNQUNwQyxPQUFPO0FBQ0wsZ0JBQVE7QUFBQSxNQUNWO0FBQUEsSUFDRjtBQUVBLFNBQUssU0FBUyxhQUFhO0FBQUEsRUFDN0I7QUFBQSxFQUVRLGdCQUFnQjtBQUN0QixTQUFLLFNBQVMsU0FBUyxNQUFNLE9BQU87QUFDcEMsU0FBSyxjQUFjLFlBQVksTUFBTSxVQUFVO0FBQy9DLFNBQUssV0FBVyxRQUFRLE1BQU0sTUFBTTtBQUNwQyxTQUFLLGtCQUFrQixnQkFBZ0I7QUFFdkMsU0FBSyxTQUFTLFlBQVksTUFBTSxVQUFVO0FBRTFDLFFBQUksS0FBSyxjQUFjLCtCQUErQjtBQUNwRCxXQUFLLGNBQWM7QUFBQSxRQUNqQjtBQUFBLFFBQ0EsS0FBSyxzQkFBc0IsS0FBSyxJQUFJO0FBQUEsTUFDdEM7QUFBQSxJQUNGO0FBRUEsU0FBSyxPQUFPLFVBQVUsSUFBSSxLQUFLLFFBQVE7QUFDdkMsU0FBSyxPQUFPLFVBQVUsSUFBSSxLQUFLLGFBQWE7QUFDNUMsU0FBSyxPQUFPLFVBQVUsSUFBSSxLQUFLLFVBQVU7QUFDekMsU0FBSyxPQUFPLFVBQVUsSUFBSSxLQUFLLGlCQUFpQjtBQUNoRCxTQUFLLE9BQU8sVUFBVSxJQUFJLEtBQUssUUFBUTtBQUFBLEVBQ3pDO0FBQUEsRUFFQSxVQUFVLE1BQW9CO0FBQzVCLGVBQVcsT0FBTyxNQUFNO0FBQ3RCLFlBQU0sUUFBUSxLQUFLLE9BQU8sbUJBQW1CLElBQUksS0FBSztBQUN0RCxZQUFNLE1BQU0sS0FBSyxPQUFPLG1CQUFtQixJQUFJLEdBQUc7QUFDbEQsV0FBSyxPQUFPLGtCQUFrQixJQUFJLE1BQU0sT0FBTyxHQUFHO0FBQUEsSUFDcEQ7QUFBQSxFQUNGO0FBQUEsRUFFQSxRQUFRLEtBQWtCO0FBQ3hCLFFBQUksQ0FBQyxXQUFXLE9BQU8sR0FBRyxJQUFJLEtBQUssT0FBTyxxQkFBcUI7QUFDL0QsUUFBSSxDQUFDLFdBQVc7QUFDZCxjQUFRLEtBQUssT0FBTztBQUFBLFFBQ2xCLEtBQUssT0FBTyxXQUFXO0FBQUEsTUFDekI7QUFDQSxZQUFNLE1BQU0sS0FBSztBQUNqQixVQUFJLHdCQUF3QjtBQUFBLElBQzlCO0FBRUEsT0FBRztBQUNELFVBQUksTUFBTSxRQUFRLEdBQUcsTUFBTSxPQUFPO0FBQ2hDLGVBQU8sTUFBTSxXQUFXO0FBQUEsTUFDMUI7QUFDQSxZQUFNLGFBQWE7QUFBQSxJQUNyQixTQUFTLE1BQU0sUUFBUSxHQUFHLElBQUk7QUFFOUIsV0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUVBLFVBQVUsS0FBa0I7QUFDMUIsUUFBSSxDQUFDLFdBQVcsT0FBTyxHQUFHLElBQUksS0FBSyxPQUFPLHFCQUFxQjtBQUUvRCxRQUFJLENBQUMsV0FBVztBQUtkLFlBQU0sc0JBQXNCLE1BQU0sS0FBSyxPQUFPO0FBRTlDLFdBQUssT0FBTyxpQkFBaUIsc0JBQXNCLENBQUM7QUFDcEQsY0FBUSxLQUFLLE9BQU8sbUJBQW1CLG9CQUFvQixJQUFJLENBQUM7QUFDaEUsWUFBTSxLQUFLLE9BQU8sbUJBQW1CLG9CQUFvQixJQUFJLENBQUM7QUFDOUQsWUFBTSxRQUFRLEtBQUssT0FBTyxtQkFBbUIsb0JBQW9CLENBQUM7QUFDbEUsWUFBTSxlQUFlLENBQUM7QUFDdEIsV0FBSyxPQUFPLGFBQWEsS0FBSztBQUFBLElBQ2hDO0FBRUEsVUFBTSxVQUFVLEtBQUssUUFBUSxHQUFHO0FBRWhDLFFBQUksS0FBSyxRQUFRLEdBQUcsTUFBTSxPQUFPO0FBQy9CLFdBQUssT0FBTyxXQUFXLEtBQUssT0FBTyxHQUFHO0FBQUEsSUFDeEMsT0FBTztBQUNMLFdBQUssT0FBTyxVQUFVLEtBQUssT0FBTyxHQUFHO0FBQUEsSUFDdkM7QUFFQSxTQUFLLEtBQUssY0FBYyxJQUFJLE1BQU0sWUFBWSxLQUFLO0FBQUEsRUFDckQ7QUFBQSxFQUVBLGFBQWE7QUFDWCxVQUFNLFFBQVEsS0FBSyxPQUFPLGVBQWU7QUFDekMsVUFBTSxNQUFNLEtBQUssT0FBTyxhQUFhO0FBRXJDLGVBQVcsQ0FBQyxNQUFNLEdBQUcsS0FBSyxLQUFLLFNBQVM7QUFDdEMsV0FBSyxPQUFPLFdBQVcsS0FBSyxPQUFPLEdBQUc7QUFDdEMsV0FBSyxLQUFLLGNBQWMsTUFBTSxLQUFLO0FBQUEsSUFDckM7QUFBQSxFQUNGO0FBQUEsRUFFQSxXQUFXO0FBQ1QsVUFBTSxPQUFxQixDQUFDO0FBRTVCLFNBQUssT0FBTyxjQUFjLEVBQUUsUUFBUSxDQUFDLFFBQVE7QUFDM0MsWUFBTSxRQUFRLEtBQUssT0FBTyxlQUFlO0FBRXpDLFNBQUc7QUFDRCxZQUFJLENBQUMsTUFBTSxXQUFXLEdBQUc7QUFBRztBQUU1QixjQUFNLFFBQVEsTUFBTSxLQUFLO0FBQ3pCLGNBQU0sc0JBQXNCLEdBQUc7QUFFL0IsYUFBSyxLQUFLO0FBQUEsVUFDUixNQUFNLElBQUk7QUFBQSxVQUNWLE9BQU8sTUFBTSxXQUFXO0FBQUEsVUFDeEIsS0FBSyxNQUFNLFdBQVc7QUFBQSxRQUN4QixDQUFDO0FBQUEsTUFDSCxTQUFTLE1BQU0sc0JBQXNCLEdBQUc7QUFBQSxJQUMxQyxDQUFDO0FBRUQsV0FBTztBQUFBLEVBQ1Q7QUFDRjtBQXhRQSxJQUFNLHFCQUFOO0FBQUEsQ0FDRSxNQUFPO0FBQ0wsRUFBQUMsU0FBUTtBQUFBLElBQ047QUFBQSxNQUNFLFdBQVc7QUFBQSxNQUNYLFNBQVM7QUFBQSxRQUNQLGNBQWM7QUFBQSxVQUNaLGFBQWEsQ0FBQ0EsU0FBUSxhQUFhQSxTQUFRLFlBQVk7QUFBQSxRQUN6RDtBQUFBLFFBQ0EscUJBQXFCLENBQUM7QUFBQSxRQUN0QixpQkFBaUI7QUFBQSxVQUNmLGFBQWEsQ0FBQ0EsU0FBUSxXQUFXO0FBQUEsUUFDbkM7QUFBQSxRQUNBLG1CQUFtQixDQUFDO0FBQUEsTUFDdEI7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFDRjtBQXdQSyxJQUFNLHNCQUFOLGNBQWlDLG1CQUFtQjtBQUFBLEVBVXpELFlBQVksTUFBYTtBQUN2QixVQUFNLElBQUk7QUFFVixTQUFLLE9BQU87QUFDWixTQUFLLFdBQVc7QUFDaEIsU0FBSyxpQkFBaUI7QUFDdEIsU0FBSyxhQUFhO0FBQUEsRUFDcEI7QUFBQSxFQUVBLElBQUksS0FBSyxNQUF3QjtBQUMvQixTQUFLLFFBQVEsTUFBTSxPQUFPO0FBRTFCLFNBQUssYUFBYTtBQUFBLEVBQ3BCO0FBQUEsRUFFQSxJQUFJLE9BQU87QUFDVCxXQUFPLE1BQU07QUFBQSxFQUNmO0FBQUEsRUFFQSxhQUFhLFNBQWlCO0FBQzVCLFVBQU0sWUFBWTtBQUNsQixVQUFNLFlBQVk7QUFFbEIsY0FBVSxRQUFRLFFBQVEsUUFBUSxFQUFFO0FBRXBDLFFBQUksTUFBTSxRQUFRLE1BQU0sSUFBSSxFQUFFLE1BQU0sR0FBRyxTQUFTLEVBQUUsS0FBSyxJQUFJO0FBRTNELFFBQUksSUFBSSxTQUFTLFdBQVc7QUFDMUIsWUFBTSxJQUFJLE1BQU0sR0FBRyxTQUFTO0FBQUEsSUFDOUI7QUFFQSxXQUFPLElBQUksU0FBUyxRQUFRLFNBQVMsR0FBRyxjQUFTO0FBQUEsRUFDbkQ7QUFBQSxFQUVBLGVBQWU7QUFDYixRQUFJLENBQUMsS0FBSztBQUFNO0FBRWhCLFFBQUksQ0FBQyxLQUFLLEtBQUssUUFBUSxRQUFRLE9BQU8sRUFBRSxHQUFHO0FBQ3pDLFdBQUssT0FBTyxPQUFPO0FBQ25CLFdBQUssT0FBTztBQUFBLFFBQ1YsS0FBSyxPQUFPLGVBQWU7QUFBQSxRQUMzQixPQUFPLEVBQUUsWUFBWTtBQUFBLFFBQ3JCO0FBQUEsTUFDRjtBQUFBLElBQ0YsT0FBTztBQUNMLFdBQUssT0FBTyxPQUFPLEtBQUssYUFBYSxLQUFLLEtBQU0sT0FBTztBQUN2RCxXQUFLLFdBQVc7QUFDaEIsV0FBSyxVQUFVLEtBQUssS0FBTSxJQUFJO0FBQUEsSUFDaEM7QUFBQSxFQUNGO0FBQUEsRUFFQSxpQkFBaUI7QUFDZixVQUFNLGVBQWU7QUFFckIsUUFBSSxDQUFDLEtBQUs7QUFBTTtBQUVoQixTQUFLLFVBQVUsSUFBSSxLQUFLLEtBQUssUUFBUSxtQkFBbUIsTUFBTTtBQUM1RCxXQUFLLGFBQWE7QUFBQSxJQUNwQixDQUFDLENBQUM7QUFFRixTQUFLLFVBQVUsSUFBSSxLQUFLLEtBQUssUUFBUSxvQkFBb0IsTUFBTTtBQUM3RCxXQUFLLFdBQVc7QUFDaEIsV0FBSyxVQUFVLEtBQUssS0FBTSxJQUFJO0FBQUEsSUFDaEMsQ0FBQyxDQUFDO0FBQUEsRUFDSjtBQUFBLEVBRUEsbUJBQW1CO0FBQ2pCLFVBQU0saUJBQWlCO0FBRXZCLFFBQUksQ0FBQyxLQUFLO0FBQU07QUFFaEIsZUFBVyxZQUFZLEtBQUssV0FBVztBQUNyQyxXQUFLLEtBQU0sV0FBVyxRQUFRO0FBQUEsSUFDaEM7QUFFQSxTQUFLLFVBQVUsTUFBTTtBQUFBLEVBQ3ZCO0FBQ0Y7QUF2Rk8sSUFBTSxxQkFBTjtBQUFBLENBQ0wsTUFBTztBQUNMLEVBQUFBLFNBQVE7QUFBQSxJQUNOO0FBQUEsTUFDRSxXQUFXO0FBQUEsSUFDYjtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBQ0Y7QUFpRkssSUFBTSx1QkFBTixjQUFrQyxtQkFBbUI7QUFBQSxFQTRCMUQsWUFBWSxNQUFhO0FBQ3ZCLFVBQU0sSUFBSTtBQW5CWixvQkFBVztBQUNYLGtCQUF3QjtBQW9CdEIsU0FBSyxPQUFPLGNBQWMsZUFBZSxDQUFDLFFBQVEsS0FBSyxNQUFNLFdBQVc7QUFDdEUsV0FBSyxpQkFBaUIsUUFBUSxLQUFLLE1BQU0sTUFBTTtBQUFBLElBQ2pELENBQUM7QUFFRCxTQUFLLE9BQU8sUUFBUSxXQUFXLE1BQU07QUFDbkMsVUFBSSxLQUFLLFVBQVU7QUFDakIsYUFBSyxXQUFXO0FBQ2hCO0FBQUEsTUFDRjtBQUNBLFdBQUssYUFBYTtBQUNsQixVQUFJLEtBQUssT0FBTyxRQUFRLEtBQUssS0FBTTtBQUFTO0FBQzVDLFdBQUssT0FBTyxXQUFXLEtBQUssT0FBTyxJQUFJO0FBQUEsSUFDekMsQ0FBQztBQUVELFNBQUssT0FBTyxRQUFRLFlBQVksTUFBTTtBQUNwQyxVQUFJLENBQUMsS0FBSztBQUFNO0FBRWhCLFlBQU0sT0FBTyxLQUFLLFNBQVM7QUFDM0IsVUFBSSxhQUFhLE1BQU0sS0FBSyxLQUFLLElBQUk7QUFBRztBQUN4QyxXQUFLLEtBQUssT0FBTztBQUFBLElBQ25CLENBQUM7QUFBQSxFQUNIO0FBQUEsRUF2Q0EsSUFBSSxPQUFPO0FBQ1QsV0FBTyxNQUFNO0FBQUEsRUFDZjtBQUFBLEVBRUEsSUFBSSxLQUFLLE1BQXdCO0FBQy9CLFNBQUssV0FBVztBQUNoQixVQUFNLE9BQU87QUFBQSxFQUNmO0FBQUEsRUFFQSxPQUE2QixLQUFRLE9BQWdCO0FBQ25ELFFBQUksQ0FBQyxLQUFLO0FBQU07QUFDaEIsU0FBSyxLQUFLLEdBQUcsSUFBSTtBQUNqQixTQUFLLEtBQUssZ0JBQWdCLG9CQUFJLEtBQUs7QUFBQSxFQUNyQztBQUFBLEVBNEJBLGNBQWM7QUFDWixTQUFLLE9BQU87QUFBQSxNQUNWLEtBQUs7QUFBQSxNQUNMLEtBQUssT0FBTyxlQUFlO0FBQUEsTUFDM0IsS0FBSyxPQUFPLGFBQWE7QUFBQSxJQUMzQjtBQUNBLFNBQUssS0FBSyxjQUFjLFFBQVEsS0FBSztBQUFBLEVBQ3ZDO0FBQUEsRUFFQSxlQUFlO0FBQ2IsVUFBTSxPQUFPLEtBQUssT0FBTztBQUV6QixTQUFLLFlBQVk7QUFFakIsU0FBSyxJQUFJLEVBQ04sUUFBUSxDQUFDLFVBQVU7QUFDbEIsWUFBTSxRQUFRLEtBQUssT0FBTyxtQkFBbUIsTUFBTSxLQUFLO0FBQ3hELFlBQU0sTUFBTSxLQUFLLE9BQU8sbUJBQW1CLE1BQU0sR0FBRztBQUVwRCxXQUFLLE9BQU8sVUFBVSxLQUFLLFVBQVUsT0FBTyxHQUFHO0FBQUEsSUFDakQsQ0FBQztBQUVILFNBQUssS0FBSyxjQUFjLFFBQVEsSUFBSTtBQUFBLEVBQ3RDO0FBQUEsRUFFQSxhQUFhO0FBQ1gsVUFBTSxXQUFXO0FBQUEsRUFFbkI7QUFBQSxFQUVBLFVBQVUsS0FBa0I7QUFDMUIsVUFBTSxVQUFVLEdBQUc7QUFDbkIsVUFBTSxPQUFPLEtBQUssU0FBUztBQUMzQixRQUFJLGFBQWEsTUFBTSxLQUFLLEtBQU0sSUFBSTtBQUFHO0FBQ3pDLFNBQUssT0FBTyxRQUFRLElBQUk7QUFBQSxFQUMxQjtBQUFBLEVBRUEsaUJBQ0UsUUFDQSxLQUNBLE1BQ0EsUUFDQTtBQUNBLFFBQUksU0FBUyxNQUFNO0FBQ2pCLFlBQU0sYUFBYSxJQUFJLEtBQUs7QUFDNUIsaUJBQVcsY0FBYztBQUN6QixpQkFBVyxnQkFBZ0IsQ0FBQztBQUU1QixZQUFNLFdBQVcsV0FBVyxLQUFLO0FBQ2pDLGVBQVMsY0FBYyxDQUFDO0FBQ3hCLFlBQU0sUUFBUSxPQUFPLFNBQVMsWUFBWSxVQUFVLEtBQUs7QUFFekQsWUFBTSx1QkFBdUI7QUFDN0IsVUFBSSxxQkFBcUIsS0FBSyxLQUFLLEdBQUc7QUFDcEMsY0FBTSxTQUFTLE1BQU0sQ0FBQztBQUN0QixjQUFNLFdBQVcsSUFBSSxLQUFLO0FBQzFCLGlCQUFTLGNBQWM7QUFDdkIsWUFBSSxTQUFTLGdCQUFnQixNQUFNLEdBQUc7QUFDcEMscUJBQVcsZ0JBQWdCLENBQUM7QUFDNUIsaUJBQU8sT0FBTyxZQUFZLEdBQUc7QUFBQSxRQUMvQixPQUFPO0FBQ0wsaUJBQU8sT0FBTyxLQUFLLFNBQVMsS0FBSyxFQUFFO0FBQUEsUUFDckM7QUFBQSxNQUNGLE9BQU87QUFDTCxjQUFNLGVBQWUsV0FBVyxLQUFLO0FBQ3JDLGNBQU0sYUFBYSxXQUFXLEtBQUs7QUFDbkMscUJBQWEsY0FBYyxFQUFFO0FBRTdCLG1CQUFXLGtCQUFrQixDQUFDLE9BQU87QUFDbkMsa0JBQVEsSUFBSSxnQkFBZSxFQUFFO0FBQzdCLGlCQUFPLE9BQU87QUFBQSxRQUNoQixHQUFHLFlBQVk7QUFDZixtQkFBVyxhQUFhO0FBQ3hCLGNBQU1DLFNBQVEsT0FBTyxTQUFTLFlBQVksWUFBWSxLQUFLO0FBRTNELGNBQU0sd0JBQXdCO0FBQzlCLFlBQUksc0JBQXNCLEtBQUtBLE1BQUssR0FBRztBQUNyQyxnQkFBTSxnQkFBZ0IsU0FBU0EsT0FBTSxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ2pELGdCQUFNLFlBQVksZ0JBQWdCO0FBQ2xDLGdCQUFNLG1CQUFtQixHQUFHO0FBQzVCLGdCQUFNLFdBQVcsSUFBSSxLQUFLO0FBQzFCLG1CQUFTLGNBQWM7QUFFdkIsY0FDRSxTQUFTLGdCQUFnQixNQUFNLGNBQWMsU0FBUyxFQUFFLFNBQVMsR0FDakU7QUFDQSx1QkFBVyxnQkFBZ0IsQ0FBQztBQUM1QixtQkFBTyxPQUFPLFlBQVksR0FBRztBQUFBLFVBQy9CLE9BQU87QUFDTCxtQkFBTyxPQUFPLEtBQUssa0JBQWtCLEVBQUU7QUFBQSxVQUN6QztBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRjtBQXJKTyxJQUFNLHNCQUFOO0FBQUEsQ0FDTCxNQUFPO0FBQ0wsRUFBQUQsU0FBUTtBQUFBLElBQ047QUFBQSxNQUNFLFdBQVc7QUFBQSxJQUNiO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFDRjtBQStJRixJQUFNLGVBQWUsQ0FBQyxHQUFXLE1BQWM7QUFDN0MsTUFBSSxFQUFFLFVBQVUsRUFBRTtBQUFRLFdBQU87QUFDakMsYUFBVyxPQUFPLEdBQUc7QUFDbkIsUUFDRSxDQUFDLEVBQUU7QUFBQSxNQUFLLENBQUMsTUFDUCxFQUFFLFFBQVEsSUFBSSxRQUFRLEVBQUUsU0FBUyxJQUFJLFNBQVMsRUFBRSxPQUFPLElBQUk7QUFBQSxJQUM3RCxHQUNBO0FBQ0EsYUFBTztBQUFBLElBQ1Q7QUFBQSxFQUNGO0FBQ0EsU0FBTztBQUNUOzs7QUZ6Z0JPLElBQU0sa0JBQU4sY0FBNkJFLEtBQUksSUFBSTtBQUFBLEVBc0MxQyxZQUFtQixRQUFvQixNQUFhO0FBQ2xELFVBQU07QUFEVztBQUdqQixTQUFLLE9BQU8sSUFBSSxtQkFBbUIsSUFBSTtBQUN2QyxTQUFLLEtBQUssY0FBYyxnQkFBZ0I7QUFDeEMsU0FBSyxLQUFLLFlBQVlBLEtBQUksU0FBUztBQUVuQyxTQUFLLFVBQVUsVUFBVSxLQUFLLElBQUk7QUFDbEMsU0FBSyxlQUFlLFFBQVEsV0FBVyxLQUFLLE9BQU8sS0FBSyxJQUFJLENBQUM7QUFFN0QsUUFBSTtBQUFNLFdBQUssUUFBUSxLQUFLLE9BQU87QUFBQSxFQUNyQztBQUFBLEVBZkEsSUFBSSxtQkFBbUIsU0FBa0I7QUFDdkMsU0FBSyxZQUFZLFVBQVU7QUFBQSxFQUM3QjtBQUFBLEVBZUEsSUFBSSxLQUFLLE1BQVk7QUFuRnZCO0FBb0ZJLFNBQUksNkJBQU0sYUFBVSxVQUFLLFVBQUwsbUJBQVk7QUFBTyxXQUFLLFVBQVUsS0FBSyxLQUFLO0FBRWhFLFNBQUssUUFBUSxLQUFLLEtBQUssT0FBTztBQUU5QixTQUFLLHNCQUFzQjtBQUFBLEVBQzdCO0FBQUEsRUFFQSxJQUFJLE9BQU87QUEzRmI7QUE0RkksWUFBTyxVQUFLLFVBQUwsbUJBQVk7QUFBQSxFQUNyQjtBQUFBLEVBRUEsd0JBQXdCO0FBL0YxQjtBQWdHSSxVQUFNLFlBQVcsZ0JBQUssVUFBTCxtQkFBWSxhQUFaLG1CQUFzQjtBQUV2QyxRQUFJLENBQUM7QUFBVTtBQUlmLFVBQU0sU0FDSkMsTUFBSyxTQUFTLGNBQWMsRUFBRSxPQUFPLElBQUksTUFBTSxTQUFTLE9BQU8sSUFBSSxJQUMvRCxPQUNBO0FBRU4sU0FBSyxnQkFBZ0IsUUFBUSxTQUFTLE9BQU8sTUFBTTtBQUFBLEVBQ3JEO0FBQUEsRUFFQSxVQUFVLE9BQWM7QUFDdEIsZUFBVyxLQUFLLEtBQUssZ0JBQWdCLEdBQUc7QUFDdEMsVUFBSSxFQUFFLFdBQVcsUUFBUSxLQUFLLE1BQU0sbUJBQW1CO0FBQ3JELGFBQUssaUJBQWlCLENBQUM7QUFBQSxNQUN6QjtBQUFBLElBQ0Y7QUFFQSxTQUFLLGNBQWMsU0FBUyxNQUFNLEtBQUssR0FBRztBQUFBLEVBQzVDO0FBQUEsRUFFQSxTQUFTO0FBQ1AsUUFBSSxDQUFDLEtBQUs7QUFBTztBQUNqQixtQkFBZSxLQUFLLFFBQVEsTUFBTTtBQUNoQyxXQUFLLEtBQUssU0FBUztBQUFBLElBQ3JCLENBQUM7QUFBQSxFQUNIO0FBQ0Y7QUE5Rk8sSUFBTSxpQkFBTjtBQUFBLENBQ0wsTUFBTztBQUNMLEVBQUFDLFNBQVEsY0FBYztBQUFBLElBQ3BCLFdBQVc7QUFBQSxJQUNYLFVBQVU7QUFBQSxJQUNWLGtCQUFrQjtBQUFBLE1BQ2hCO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsWUFBWTtBQUFBLE1BQ1YsTUFBTUEsU0FBUSxVQUFVO0FBQUEsUUFDdEI7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0FBLFNBQVEsV0FBVztBQUFBLFFBQ25CO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLFNBQVMsQ0FBQztBQUFBLElBQ1o7QUFBQSxFQUNGLEdBQUcsZUFBSTtBQUNUOyIsCiAgIm5hbWVzIjogWyJHT2JqZWN0IiwgIkd0ayIsICJHTGliIiwgIlN0eWxlIiwgIl8iLCAiR09iamVjdCIsICJBZHciLCAibmV4dFN0YXRlIiwgInNjaGVtZSIsICJBZHciLCAiR09iamVjdCIsICJjaGFycyIsICJHdGsiLCAiR0xpYiIsICJHT2JqZWN0Il0KfQo=
