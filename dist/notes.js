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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL25vdGVzLnRzIiwgIi4uL3NyYy9jYXJkLnRzIiwgIi4uL3NyYy91dGlsLnRzIiwgIi4uL3NyYy92aWV3LnRzIiwgIi4uL25vZGVfbW9kdWxlcy9saW5raWZ5anMvZGlzdC9saW5raWZ5LmVzLmpzIiwgIi4uL3NyYy90aGVtZXNlbGVjdG9yLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKiBNSVQgTGljZW5zZVxuICpcbiAqIENvcHlyaWdodCAoYykgMjAyMyBBbmdlbG8gVmVybGFpbiwgQ2hyaXMgRGF2aXNcbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gKiBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAqIFNPRlRXQVJFLlxuICpcbiAqIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBNSVRcbiAqL1xuXG5pbXBvcnQgR09iamVjdCBmcm9tIFwiZ2k6Ly9HT2JqZWN0XCI7XG5pbXBvcnQgR3RrIGZyb20gXCJnaTovL0d0az92ZXJzaW9uPTQuMFwiO1xuaW1wb3J0IEFkdyBmcm9tIFwiZ2k6Ly9BZHdcIjtcblxuaW1wb3J0IHR5cGUgeyBBcHBsaWNhdGlvbiB9IGZyb20gXCIuL2FwcGxpY2F0aW9uLmpzXCI7XG5pbXBvcnQgeyBTdGlja3lOb3RlQ2FyZCB9IGZyb20gXCIuL2NhcmQuanNcIjtcbmltcG9ydCB7IE5vdGUsIHNldHRpbmdzIH0gZnJvbSBcIi4vdXRpbC5qc1wiO1xuXG5pbXBvcnQgeyBUaGVtZVNlbGVjdG9yIH0gZnJvbSBcIi4vdGhlbWVzZWxlY3Rvci5qc1wiO1xuXG5leHBvcnQgY2xhc3MgU3RpY2t5Tm90ZXMgZXh0ZW5kcyBBZHcuQXBwbGljYXRpb25XaW5kb3cge1xuICBzdGF0aWMge1xuICAgIEdPYmplY3QucmVnaXN0ZXJDbGFzcyhcbiAgICAgIHtcbiAgICAgICAgVGVtcGxhdGU6IFwicmVzb3VyY2U6Ly8vY29tL3ZpeGFsaWVuL3N0aWNreS91aS9ub3Rlcy51aVwiLFxuICAgICAgICBHVHlwZU5hbWU6IFwiU3RpY2t5Tm90ZXNcIixcbiAgICAgICAgSW50ZXJuYWxDaGlsZHJlbjogW1xuICAgICAgICAgIFwic2VhcmNoXCIsXG4gICAgICAgICAgXCJub3Rlc19ib3hcIixcbiAgICAgICAgICBcIm5vX25vdGVzXCIsXG4gICAgICAgICAgXCJub19yZXN1bHRzXCIsXG4gICAgICAgICAgXCJzZWFyY2hfZW50cnlcIixcbiAgICAgICAgICBcInNjcm9sbGVkXCIsXG4gICAgICAgICAgXCJtZW51X2J1dHRvblwiLFxuICAgICAgICAgIFwic3RhY2tcIixcbiAgICAgICAgXSxcbiAgICAgICAgU2lnbmFsczoge1xuICAgICAgICAgIFwibm90ZS1hY3RpdmF0ZWRcIjoge1xuICAgICAgICAgICAgcGFyYW1fdHlwZXM6IFtHT2JqZWN0LlRZUEVfU1RSSU5HXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGRlbGV0ZWQ6IHtcbiAgICAgICAgICAgIHBhcmFtX3R5cGVzOiBbR09iamVjdC5UWVBFX1NUUklOR10sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICB0aGlzLFxuICAgICk7XG4gIH1cblxuICBkZWNsYXJlIF9zZWFyY2g6IEd0ay5Cb3g7XG4gIGRlY2xhcmUgX3NlYXJjaF9lbnRyeTogR3RrLlNlYXJjaEVudHJ5O1xuICBkZWNsYXJlIF9ub3Rlc19ib3g6IEd0ay5MaXN0VmlldztcbiAgZGVjbGFyZSBfbm9fbm90ZXM6IEFkdy5TdGF0dXNQYWdlO1xuICBkZWNsYXJlIF9ub19yZXN1bHRzOiBBZHcuU3RhdHVzUGFnZTtcbiAgZGVjbGFyZSBfc2Nyb2xsZWQ6IEd0ay5TY3JvbGxlZFdpbmRvdztcbiAgZGVjbGFyZSBfbWVudV9idXR0b246IEd0ay5NZW51QnV0dG9uO1xuICBkZWNsYXJlIF9zdGFjazogR3RrLlN0YWNrO1xuXG4gIGNhcmRzOiBTdGlja3lOb3RlQ2FyZFtdID0gW107XG5cbiAgb2xkX3F1ZXJ5ID0gXCJcIjtcblxuICBsYXN0X21vZGVsOiBHdGsuU2VsZWN0aW9uTW9kZWw8Tm90ZT47XG4gIHNvcnRlcjogR3RrLlNvcnRlcjtcblxuICBnZXQgcXVlcnkoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NlYXJjaF9lbnRyeS50ZXh0LnRvTG93ZXJDYXNlKCk7XG4gIH1cblxuICBzZXR1cF9jYihfZmFjdG9yeTogR3RrLkxpc3RJdGVtRmFjdG9yeSwgbGlzdF9pdGVtOiBHdGsuTGlzdEl0ZW0pIHtcbiAgICBjb25zdCBjYXJkID0gbmV3IFN0aWNreU5vdGVDYXJkKHRoaXMpO1xuXG4gICAgbGlzdF9pdGVtLnNldF9jaGlsZChjYXJkKTtcbiAgfVxuXG4gIGJpbmRfY2IoX2ZhY3Rvcnk6IEd0ay5MaXN0SXRlbUZhY3RvcnksIGxpc3RfaXRlbTogR3RrLkxpc3RJdGVtKSB7XG4gICAgY29uc3QgY2FyZCA9IGxpc3RfaXRlbS5nZXRfY2hpbGQoKSBhcyBTdGlja3lOb3RlQ2FyZDtcbiAgICBjb25zdCBub3RlID0gbGlzdF9pdGVtLmdldF9pdGVtKCkgYXMgTm90ZTtcblxuICAgIGNhcmQuc2hvd192aXNpYmxlX2ltYWdlID0gbm90ZS5vcGVuO1xuICAgIGNhcmQuY29ubmVjdChcImRlbGV0ZWRcIiwgKF8pID0+IHRoaXMuZW1pdChcImRlbGV0ZWRcIiwgbm90ZS51dWlkKSk7XG5cbiAgICBjYXJkLm5vdGUgPSBub3RlO1xuXG4gICAgbm90ZS5jb25uZWN0KFwibm90aWZ5Ojptb2RpZmllZFwiLCAoKSA9PiB7XG4gICAgICBjYXJkLnVwZGF0ZV9tb2RpZmllZF9sYWJlbCgpO1xuICAgICAgdGhpcy5zb3J0ZXIuY2hhbmdlZChHdGsuU29ydGVyQ2hhbmdlLkRJRkZFUkVOVCk7XG4gICAgfSk7XG5cbiAgICBub3RlLmNvbm5lY3QoXCJub3RpZnk6Om9wZW5cIiwgKF8pID0+IHtcbiAgICAgIGNhcmQuc2hvd192aXNpYmxlX2ltYWdlID0gbm90ZS5vcGVuO1xuICAgIH0pO1xuXG4gICAgbm90ZS5jb25uZWN0KFwibm90aWZ5OjpzdHlsZVwiLCAoKSA9PiB7XG4gICAgICBjYXJkLnNldF9zdHlsZShub3RlLnN0eWxlKTtcbiAgICB9KTtcbiAgfVxuXG4gIHVuYmluZF9jYihfZmFjdG9yeTogR3RrLkxpc3RJdGVtRmFjdG9yeSwgX2xpc3RfaXRlbTogR3RrLkxpc3RJdGVtKSB7XG4gICAgY29uc3QgY2FyZCA9IG5ldyBTdGlja3lOb3RlQ2FyZCh0aGlzKTtcblxuICAgIGNhcmQudmlldy5yZW1vdmVfbGlzdGVuZXJzKCk7XG4gIH1cblxuICBhY3RpdmF0ZV9jYihsaXN0OiBHdGsuTGlzdFZpZXcsIHBvc2l0aW9uOiBudW1iZXIpIHtcbiAgICBjb25zdCBpdGVtID0gbGlzdC5nZXRfbW9kZWwoKT8uZ2V0X2l0ZW0ocG9zaXRpb24pIGFzIE5vdGUgfCB1bmRlZmluZWQ7XG4gICAgaWYgKCFpdGVtKSByZXR1cm47XG4gICAgdGhpcy5lbWl0KFwibm90ZS1hY3RpdmF0ZWRcIiwgaXRlbS51dWlkKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHBhcmFtczogUGFydGlhbDxHdGsuV2luZG93LkNvbnN0cnVjdG9yUHJvcHM+LFxuICApIHtcbiAgICBzdXBlcihwYXJhbXMpO1xuXG4gICAgdGhpcy5kZWZhdWx0X2hlaWdodCA9IHNldHRpbmdzLmdldF9pbnQoXCJkZWZhdWx0LWhlaWdodFwiKTtcbiAgICB0aGlzLmRlZmF1bHRfd2lkdGggPSBzZXR0aW5ncy5nZXRfaW50KFwiZGVmYXVsdC13aWR0aFwiKTtcblxuICAgIHRoaXMuY29ubmVjdChcImNsb3NlLXJlcXVlc3RcIiwgKCkgPT4ge1xuICAgICAgc2V0dGluZ3Muc2V0X2ludChcImRlZmF1bHQtaGVpZ2h0XCIsIHRoaXMuZ2V0X2hlaWdodCgpKTtcbiAgICAgIHNldHRpbmdzLnNldF9pbnQoXCJkZWZhdWx0LXdpZHRoXCIsIHRoaXMuZ2V0X3dpZHRoKCkpO1xuICAgIH0pO1xuXG4gICAgLy8gbWFrZSBpdCB0cmFuc3BhcmVudFxuICAgIHRoaXMuX25vdGVzX2JveC5yZW1vdmVfY3NzX2NsYXNzKFwidmlld1wiKTtcblxuICAgIGNvbnN0IGZhY3RvcnkgPSBuZXcgR3RrLlNpZ25hbExpc3RJdGVtRmFjdG9yeSgpO1xuICAgIGZhY3RvcnkuY29ubmVjdChcInNldHVwXCIsIHRoaXMuc2V0dXBfY2IuYmluZCh0aGlzKSk7XG4gICAgZmFjdG9yeS5jb25uZWN0KFwiYmluZFwiLCB0aGlzLmJpbmRfY2IuYmluZCh0aGlzKSk7XG4gICAgZmFjdG9yeS5jb25uZWN0KFwidW5iaW5kXCIsIHRoaXMudW5iaW5kX2NiLmJpbmQodGhpcykpO1xuXG4gICAgY29uc3QgZmlsdGVyID0gR3RrLkN1c3RvbUZpbHRlci5uZXcoKG5vdGUpID0+IHtcbiAgICAgIGNvbnN0IHF1ZXJ5ID0gdGhpcy5xdWVyeTtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSAobm90ZSBhcyBOb3RlKS5jb250ZW50LnRvTG93ZXJDYXNlKCk7XG4gICAgICBpZiAoIXF1ZXJ5LnJlcGxhY2UoL1xccy9nLCBcIlwiKSkgcmV0dXJuIHRydWU7XG4gICAgICByZXR1cm4gY29udGVudC5pbmNsdWRlcyhxdWVyeSk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBmaWx0ZXJfbW9kZWwgPSBHdGsuRmlsdGVyTGlzdE1vZGVsLm5ldyhcbiAgICAgICh0aGlzLmFwcGxpY2F0aW9uIGFzIEFwcGxpY2F0aW9uKS5ub3Rlc19saXN0LFxuICAgICAgZmlsdGVyLFxuICAgICk7XG5cbiAgICB0aGlzLnNvcnRlciA9IEd0ay5DdXN0b21Tb3J0ZXIubmV3KChub3RlMSwgbm90ZTIpID0+IHtcbiAgICAgIGNvbnN0IGRhdGUxID0gKG5vdGUxIGFzIE5vdGUpLm1vZGlmaWVkO1xuICAgICAgY29uc3QgZGF0ZTIgPSAobm90ZTIgYXMgTm90ZSkubW9kaWZpZWQ7XG4gICAgICByZXR1cm4gZGF0ZTIuY29tcGFyZShkYXRlMSk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBzb3J0ZXJfbW9kZWwgPSBHdGsuU29ydExpc3RNb2RlbC5uZXcoZmlsdGVyX21vZGVsLCB0aGlzLnNvcnRlcik7XG5cbiAgICB0aGlzLmxhc3RfbW9kZWwgPSBHdGsuU2luZ2xlU2VsZWN0aW9uLm5ldyhcbiAgICAgIHNvcnRlcl9tb2RlbCxcbiAgICApIGFzIEd0ay5TaW5nbGVTZWxlY3Rpb248Tm90ZT47XG5cbiAgICB0aGlzLmxhc3RfbW9kZWwuY29ubmVjdChcIml0ZW1zLWNoYW5nZWRcIiwgKCkgPT4ge1xuICAgICAgdGhpcy5zZXRfc3RhdHVzKCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9ub3Rlc19ib3guY29ubmVjdChcImFjdGl2YXRlXCIsIHRoaXMuYWN0aXZhdGVfY2IuYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLl9ub3Rlc19ib3guc2V0X2ZhY3RvcnkoZmFjdG9yeSk7XG4gICAgdGhpcy5fbm90ZXNfYm94LnNldF9tb2RlbCh0aGlzLmxhc3RfbW9kZWwpO1xuXG4gICAgdGhpcy5fc2VhcmNoX2VudHJ5LmNvbm5lY3QoXCJzZWFyY2gtY2hhbmdlZFwiLCAoKSA9PiB7XG4gICAgICBjb25zdCBxdWVyeSA9IHRoaXMucXVlcnkudG9Mb3dlckNhc2UoKTtcbiAgICAgIGNvbnN0IG9sZF9xdWVyeSA9IHRoaXMub2xkX3F1ZXJ5LnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgIGlmIChxdWVyeS5pbmNsdWRlcyhvbGRfcXVlcnkpKSB7XG4gICAgICAgIGZpbHRlci5lbWl0KFwiY2hhbmdlZFwiLCBHdGsuRmlsdGVyQ2hhbmdlLk1PUkVfU1RSSUNUKTtcbiAgICAgIH0gZWxzZSBpZiAob2xkX3F1ZXJ5LmluY2x1ZGVzKHF1ZXJ5KSkge1xuICAgICAgICBmaWx0ZXIuZW1pdChcImNoYW5nZWRcIiwgR3RrLkZpbHRlckNoYW5nZS5MRVNTX1NUUklDVCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmaWx0ZXIuZW1pdChcImNoYW5nZWRcIiwgR3RrLkZpbHRlckNoYW5nZS5ESUZGRVJFTlQpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLm9sZF9xdWVyeSA9IHF1ZXJ5O1xuICAgIH0pO1xuXG4gICAgdGhpcy5zZXRfc3RhdHVzKCk7XG5cbiAgICAvLyBQb3BvdmVyIG1lbnUgdGhlbWUgc3dpdGNoZXJcbiAgICBjb25zdCBwb3BvdmVyID0gdGhpcy5fbWVudV9idXR0b24uZ2V0X3BvcG92ZXIoKSBhcyBHdGsuUG9wb3Zlck1lbnU7XG4gICAgcG9wb3Zlci5hZGRfY2hpbGQobmV3IFRoZW1lU2VsZWN0b3IoKSwgXCJ0aGVtZXN3aXRjaGVyXCIpO1xuICB9XG5cbiAgc2V0X3N0YXR1cygpIHtcbiAgICBpZiAodGhpcy5sYXN0X21vZGVsLmdldF9uX2l0ZW1zKCkgPiAwKSB7XG4gICAgICB0aGlzLnNldF92aXNpYmxlX2NoaWxkKHRoaXMuX25vdGVzX2JveCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLnF1ZXJ5KSB7XG4gICAgICAgIHRoaXMuc2V0X3Zpc2libGVfY2hpbGQodGhpcy5fbm9fcmVzdWx0cyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNldF92aXNpYmxlX2NoaWxkKHRoaXMuX25vX25vdGVzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzZXRfbm90ZV92aXNpYmxlKHV1aWQ6IHN0cmluZywgdmlzaWJsZTogYm9vbGVhbikge1xuICAgIGNvbnN0IGNhcmQgPSB0aGlzLmNhcmRzLmZpbmQoKGNhcmQpID0+IGNhcmQubm90ZS51dWlkID09PSB1dWlkKTtcblxuICAgIGlmICghY2FyZCkgcmV0dXJuO1xuXG4gICAgY2FyZC5zaG93X3Zpc2libGVfaW1hZ2UgPSB2aXNpYmxlO1xuICB9XG5cbiAgc2V0X3Zpc2libGVfY2hpbGQoY2hpbGQ6IEd0ay5XaWRnZXQpIHtcbiAgICB0aGlzLl9zZWFyY2gudmlzaWJsZSA9IGNoaWxkID09PSB0aGlzLl9ub3Rlc19ib3ggfHxcbiAgICAgIGNoaWxkID09PSB0aGlzLl9ub19yZXN1bHRzO1xuXG4gICAgdGhpcy5fc3RhY2suc2V0X3Zpc2libGVfY2hpbGQoY2hpbGQpO1xuICB9XG59XG4iLCAiLyogTUlUIExpY2Vuc2VcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMjMgQW5nZWxvIFZlcmxhaW4sIENocmlzIERhdmlzXG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICogY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gKiBTT0ZUV0FSRS5cbiAqXG4gKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogTUlUXG4gKi9cblxuaW1wb3J0IEdPYmplY3QgZnJvbSBcImdpOi8vR09iamVjdFwiO1xuaW1wb3J0IEd0ayBmcm9tIFwiZ2k6Ly9HdGs/dmVyc2lvbj00LjBcIjtcbmltcG9ydCBHTGliIGZyb20gXCJnaTovL0dMaWJcIjtcblxuaW1wb3J0IHsgY29uZmlybV9kZWxldGUsIE5vdGUsIFN0eWxlIH0gZnJvbSBcIi4vdXRpbC5qc1wiO1xuaW1wb3J0IHsgUmVhZG9ubHlTdGlja3lOb3RlIH0gZnJvbSBcIi4vdmlldy5qc1wiO1xuXG5leHBvcnQgY2xhc3MgU3RpY2t5Tm90ZUNhcmQgZXh0ZW5kcyBHdGsuQm94IHtcbiAgc3RhdGljIHtcbiAgICBHT2JqZWN0LnJlZ2lzdGVyQ2xhc3Moe1xuICAgICAgR1R5cGVOYW1lOiBcIlN0aWNreU5vdGVDYXJkXCIsXG4gICAgICBUZW1wbGF0ZTogXCJyZXNvdXJjZTovLy9jb20vdml4YWxpZW4vc3RpY2t5L3VpL2NhcmQudWlcIixcbiAgICAgIEludGVybmFsQ2hpbGRyZW46IFtcbiAgICAgICAgXCJtb2RpZmllZF9sYWJlbFwiLFxuICAgICAgICBcInZpZXdfaW1hZ2VcIixcbiAgICAgICAgXCJkZWxldGVfYnV0dG9uXCIsXG4gICAgICAgIFwic2Nyb2xsZWRcIixcbiAgICAgIF0sXG4gICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgIHV1aWQ6IEdPYmplY3QuUGFyYW1TcGVjLnN0cmluZyhcbiAgICAgICAgICBcInV1aWRcIixcbiAgICAgICAgICBcIlVVSURcIixcbiAgICAgICAgICBcIlRoZSBVVUlEIG9mIHRoZSBub3RlXCIsXG4gICAgICAgICAgR09iamVjdC5QYXJhbUZsYWdzLlJFQURBQkxFLFxuICAgICAgICAgIFwiXCIsXG4gICAgICAgICksXG4gICAgICB9LFxuICAgICAgU2lnbmFsczoge1xuICAgICAgICBkZWxldGVkOiB7fSxcbiAgICAgIH0sXG4gICAgfSwgdGhpcyk7XG4gIH1cblxuICBkZWNsYXJlIF9zY3JvbGxlZDogR3RrLlNjcm9sbGVkV2luZG93O1xuICBkZWNsYXJlIF9tb2RpZmllZF9sYWJlbDogR3RrLkxhYmVsO1xuICBkZWNsYXJlIF92aWV3X2ltYWdlOiBHdGsuSW1hZ2U7XG4gIGRlY2xhcmUgX2RlbGV0ZV9idXR0b246IEd0ay5CdXR0b247XG5cbiAgcHJpdmF0ZSBfbm90ZT86IE5vdGU7XG4gIHZpZXc6IFJlYWRvbmx5U3RpY2t5Tm90ZTtcblxuICBzZXQgc2hvd192aXNpYmxlX2ltYWdlKHZpc2libGU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl92aWV3X2ltYWdlLnZpc2libGUgPSB2aXNpYmxlO1xuICB9XG5cbiAgY29uc3RydWN0b3IocHVibGljIHdpbmRvdzogR3RrLldpbmRvdywgbm90ZT86IE5vdGUpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy52aWV3ID0gbmV3IFJlYWRvbmx5U3RpY2t5Tm90ZShub3RlKTtcbiAgICB0aGlzLnZpZXcuYWRkX2Nzc19jbGFzcyhcImNhcmQtdGV4dC12aWV3XCIpO1xuICAgIHRoaXMudmlldy53cmFwX21vZGUgPSBHdGsuV3JhcE1vZGUuV09SRF9DSEFSO1xuXG4gICAgdGhpcy5fc2Nyb2xsZWQuc2V0X2NoaWxkKHRoaXMudmlldyk7XG4gICAgdGhpcy5fZGVsZXRlX2J1dHRvbi5jb25uZWN0KFwiY2xpY2tlZFwiLCB0aGlzLmRlbGV0ZS5iaW5kKHRoaXMpKTtcblxuICAgIGlmIChub3RlKSB0aGlzLl9ub3RlID0gdGhpcy5ub3RlID0gbm90ZTtcbiAgfVxuXG4gIHNldCBub3RlKG5vdGU6IE5vdGUpIHtcbiAgICBpZiAobm90ZT8uc3R5bGUgIT09IHRoaXMuX25vdGU/LnN0eWxlKSB0aGlzLnNldF9zdHlsZShub3RlLnN0eWxlKTtcblxuICAgIHRoaXMuX25vdGUgPSB0aGlzLnZpZXcubm90ZSA9IG5vdGU7XG5cbiAgICB0aGlzLnVwZGF0ZV9tb2RpZmllZF9sYWJlbCgpO1xuICB9XG5cbiAgZ2V0IHV1aWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX25vdGU/LnV1aWQ7XG4gIH1cblxuICB1cGRhdGVfbW9kaWZpZWRfbGFiZWwoKSB7XG4gICAgY29uc3QgbW9kaWZpZWQgPSB0aGlzLl9ub3RlPy5tb2RpZmllZD8udG9fbG9jYWwoKTtcblxuICAgIGlmICghbW9kaWZpZWQpIHJldHVybjtcblxuICAgIC8vIGlmIGRhdGUgaXMgdG9kYXksIHNob3cgdGltZVxuICAgIC8vIG90aGVyd2lzZSwgc2hvdyBkYXRlXG4gICAgY29uc3QgZm9ybWF0ID1cbiAgICAgIEdMaWIuRGF0ZVRpbWUubmV3X25vd19sb2NhbCgpLmZvcm1hdChcIiVGXCIpID09PSBtb2RpZmllZC5mb3JtYXQoXCIlRlwiKVxuICAgICAgICA/IFwiJVJcIlxuICAgICAgICA6IFwiJUZcIjtcblxuICAgIHRoaXMuX21vZGlmaWVkX2xhYmVsLmxhYmVsID0gbW9kaWZpZWQuZm9ybWF0KGZvcm1hdCkhO1xuICB9XG5cbiAgc2V0X3N0eWxlKHN0eWxlOiBTdHlsZSkge1xuICAgIGZvciAoY29uc3QgcyBvZiB0aGlzLmdldF9jc3NfY2xhc3NlcygpKSB7XG4gICAgICBpZiAocy5zdGFydHNXaXRoKFwic3R5bGUtXCIpICYmIHMgIT09IGBzdHlsZS1zcGVjaWZpdHlgKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlX2Nzc19jbGFzcyhzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmFkZF9jc3NfY2xhc3MoYHN0eWxlLSR7U3R5bGVbc3R5bGVdfWApO1xuICB9XG5cbiAgZGVsZXRlKCkge1xuICAgIGlmICghdGhpcy5fbm90ZSkgcmV0dXJuO1xuICAgIGNvbmZpcm1fZGVsZXRlKHRoaXMud2luZG93LCAoKSA9PiB7XG4gICAgICB0aGlzLmVtaXQoXCJkZWxldGVkXCIpO1xuICAgIH0pO1xuICB9XG59XG4iLCAiLyogTUlUIExpY2Vuc2VcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMjMgQW5nZWxvIFZlcmxhaW4sIENocmlzIERhdmlzXG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICogY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gKiBTT0ZUV0FSRS5cbiAqXG4gKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogTUlUXG4gKi9cblxuaW1wb3J0IEFkdyBmcm9tIFwiZ2k6Ly9BZHdcIjtcbmltcG9ydCBHaW8gZnJvbSBcImdpOi8vR2lvXCI7XG5pbXBvcnQgR0xpYiBmcm9tIFwiZ2k6Ly9HTGliXCI7XG5pbXBvcnQgR09iamVjdCBmcm9tIFwiZ2k6Ly9HT2JqZWN0XCI7XG5pbXBvcnQgR3RrIGZyb20gXCJnaTovL0d0az92ZXJzaW9uPTQuMFwiO1xuXG5HaW8uX3Byb21pc2lmeShcbiAgR2lvLkZpbGUucHJvdG90eXBlLFxuICBcImxvYWRfY29udGVudHNfYXN5bmNcIixcbiAgXCJsb2FkX2NvbnRlbnRzX2ZpbmlzaFwiLFxuKTtcblxuR2lvLl9wcm9taXNpZnkoXG4gIEdpby5GaWxlLnByb3RvdHlwZSxcbiAgXCJyZXBsYWNlX2NvbnRlbnRzX2FzeW5jXCIsXG4gIFwicmVwbGFjZV9jb250ZW50c19maW5pc2hcIixcbik7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVRhZyB7XG4gIG5hbWU6IHN0cmluZztcbiAgc3RhcnQ6IG51bWJlcjtcbiAgZW5kOiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSU5vdGUge1xuICB2OiAxO1xuICB1dWlkOiBzdHJpbmc7XG4gIGNvbnRlbnQ6IHN0cmluZztcbiAgdGl0bGU6IHN0cmluZztcbiAgc3R5bGU6IFN0eWxlO1xuICB0YWdzOiBJVGFnW107XG4gIG1vZGlmaWVkOiBEYXRlO1xuICB3aWR0aDogbnVtYmVyO1xuICBoZWlnaHQ6IG51bWJlcjtcbiAgb3BlbjogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGVudW0gU3R5bGUge1xuICBcInllbGxvd1wiID0gMSxcbiAgXCJwaW5rXCIsXG4gIFwiZ3JlZW5cIixcbiAgXCJwdXJwbGVcIixcbiAgXCJibHVlXCIsXG4gIFwiZ3JheVwiLFxuICBcImNoYXJjb2FsXCIsXG4gIFwid2luZG93XCIsXG59XG5cbmV4cG9ydCBjb25zdCBTdHlsZU5hbWVzID0gbmV3IE1hcChbXG4gIFtTdHlsZS55ZWxsb3csIF8oXCJZZWxsb3dcIildLFxuICBbU3R5bGUucGluaywgXyhcIlBpbmtcIildLFxuICBbU3R5bGUuZ3JlZW4sIF8oXCJHcmVlblwiKV0sXG4gIFtTdHlsZS5wdXJwbGUsIF8oXCJQdXJwbGVcIildLFxuICBbU3R5bGUuYmx1ZSwgXyhcIkJsdWVcIildLFxuICBbU3R5bGUuZ3JheSwgXyhcIkdyYXlcIildLFxuICBbU3R5bGUuY2hhcmNvYWwsIF8oXCJDaGFyY29hbFwiKV0sXG4gIFtTdHlsZS53aW5kb3csIF8oXCJXaW5kb3dcIildLFxuXSk7XG5cbmV4cG9ydCBjb25zdCBzdHlsZXMgPSBPYmplY3QudmFsdWVzKFN0eWxlKS5maWx0ZXIoXG4gIChzdHlsZSkgPT4gdHlwZW9mIHN0eWxlID09PSBcIm51bWJlclwiLFxuKSBhcyBTdHlsZVtdO1xuXG5leHBvcnQgY29uc3Qgc2V0dGluZ3MgPSBuZXcgR2lvLlNldHRpbmdzKHsgc2NoZW1hX2lkOiBcImNvbS52aXhhbGllbi5zdGlja3lcIiB9KTtcblxuY29uc3QgZ2V0X3NldHRpbmdzID0gKCkgPT4gKHtcbiAgREVGQVVMVF9TVFlMRTogc2V0dGluZ3MuZ2V0X2VudW0oXCJkZWZhdWx0LXN0eWxlXCIpIGFzIFN0eWxlLFxuICBERUZBVUxUX1dJRFRIOiBzZXR0aW5ncy5nZXRfaW50KFwiZGVmYXVsdC13aWR0aFwiKSxcbiAgREVGQVVMVF9IRUlHSFQ6IHNldHRpbmdzLmdldF9pbnQoXCJkZWZhdWx0LWhlaWdodFwiKSxcbiAgQ09ORklSTV9ERUxFVEU6IHNldHRpbmdzLmdldF9ib29sZWFuKFwiY29uZmlybS1kZWxldGVcIiksXG59KTtcblxuZXhwb3J0IGxldCBTRVRUSU5HUyA9IGdldF9zZXR0aW5ncygpO1xuXG5zZXR0aW5ncy5jb25uZWN0KFwiY2hhbmdlZFwiLCAoKSA9PiB7XG4gIFNFVFRJTkdTID0gZ2V0X3NldHRpbmdzKCk7XG59KTtcblxuZXhwb3J0IGNsYXNzIFRhZyBleHRlbmRzIEdPYmplY3QuT2JqZWN0IHtcbiAgc3RhdGljICRndHlwZTogR09iamVjdC5HVHlwZTxUYWc+O1xuXG4gIG5hbWU6IHN0cmluZztcbiAgc3RhcnQ6IG51bWJlcjtcbiAgZW5kOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nLCBzdGFydDogbnVtYmVyID0gMCwgZW5kOiBudW1iZXIgPSAwKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMuc3RhcnQgPSBzdGFydDtcbiAgICB0aGlzLmVuZCA9IGVuZDtcbiAgfVxuXG4gIHN0YXRpYyB7XG4gICAgR09iamVjdC5yZWdpc3RlckNsYXNzKHtcbiAgICAgIEdUeXBlTmFtZTogXCJUYWdPYmplY3RcIixcbiAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgLy8gZGVuby1mbXQtaWdub3JlXG4gICAgICAgIG5hbWU6IEdPYmplY3QuUGFyYW1TcGVjLnN0cmluZyhcIm5hbWVcIiwgXCJOYW1lXCIsIFwiVGhlIG5hbWUgb2YgdGhlIHRhZ1wiLCBHT2JqZWN0LlBhcmFtRmxhZ3MuUkVBRFdSSVRFLCBcIlwiKSxcbiAgICAgICAgLy8gZGVuby1mbXQtaWdub3JlXG4gICAgICAgIHN0YXJ0OiBHT2JqZWN0LlBhcmFtU3BlYy5pbnQoXCJzdGFydFwiLCBcIlN0YXJ0XCIsIFwiU3RhcnRpbmcgcG9zaXRpb24gb2YgdGhlIHRhZ1wiLCBHT2JqZWN0LlBhcmFtRmxhZ3MuUkVBRFdSSVRFLCAwLCAxMDAsIDApLFxuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgZW5kOiBHT2JqZWN0LlBhcmFtU3BlYy5pbnQoXCJlbmRcIiwgXCJFbmRcIiwgXCJFbmRpbmcgcG9zaXRpb24gb2YgdGhlIHRhZ1wiLCBHT2JqZWN0LlBhcmFtRmxhZ3MuUkVBRFdSSVRFLCAwLCAxMDAsIDApLFxuICAgICAgfSxcbiAgICB9LCB0aGlzKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTm90ZSBleHRlbmRzIEdPYmplY3QuT2JqZWN0IHtcbiAgcHJpdmF0ZSBzdGF0aWMgdGFnX2xpc3RfcHNwZWMgPSBHT2JqZWN0LnBhcmFtX3NwZWNfb2JqZWN0KFxuICAgIFwidGFnX2xpc3RcIixcbiAgICBcIlRhZ3NcIixcbiAgICBcIlRhZ3Mgb2YgdGhlIG5vdGVcIixcbiAgICBHaW8uTGlzdFN0b3JlLiRndHlwZSxcbiAgICBHT2JqZWN0LlBhcmFtRmxhZ3MuUkVBRFdSSVRFLFxuICApO1xuXG4gIHN0YXRpYyAkZ3R5cGU6IEdPYmplY3QuR1R5cGU8Tm90ZT47XG5cbiAgdjogMTtcbiAgdXVpZDogc3RyaW5nO1xuICBjb250ZW50OiBzdHJpbmc7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIHN0eWxlOiBTdHlsZTtcbiAgdGFnX2xpc3Q6IEdpby5MaXN0U3RvcmU8VGFnPjtcbiAgbW9kaWZpZWQ6IEdMaWIuRGF0ZVRpbWU7XG4gIHdpZHRoOiBudW1iZXI7XG4gIGhlaWdodDogbnVtYmVyO1xuICBvcGVuOiBib29sZWFuO1xuXG4gIGdldCB0YWdzKCkge1xuICAgIGNvbnN0IGl0ZW1zID0gW107XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMudGFnX2xpc3QuZ2V0X25faXRlbXMoKTsgaSsrKSB7XG4gICAgICBjb25zdCB0YWcgPSB0aGlzLnRhZ19saXN0LmdldF9pdGVtKGkpITtcbiAgICAgIGl0ZW1zLnB1c2goe1xuICAgICAgICBuYW1lOiB0YWcubmFtZSxcbiAgICAgICAgc3RhcnQ6IHRhZy5zdGFydCxcbiAgICAgICAgZW5kOiB0YWcuZW5kLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGl0ZW1zO1xuICB9XG5cbiAgc2V0IHRhZ3ModGFnczogSU5vdGVbXCJ0YWdzXCJdKSB7XG4gICAgdGhpcy50YWdfbGlzdC5yZW1vdmVfYWxsKCk7XG5cbiAgICBmb3IgKGNvbnN0IHRhZyBvZiB0YWdzKSB7XG4gICAgICBjb25zdCB0YWdfb2JqZWN0ID0gbmV3IFRhZyh0YWcubmFtZSwgdGFnLnN0YXJ0LCB0YWcuZW5kKTtcbiAgICAgIHRoaXMudGFnX2xpc3QuYXBwZW5kKHRhZ19vYmplY3QpO1xuICAgIH1cblxuICAgIHRoaXMuZW1pdChcIm5vdGlmeTo6dGFnX2xpc3RcIiwgTm90ZS50YWdfbGlzdF9wc3BlYyk7XG4gIH1cblxuICBnZXQgbW9kaWZpZWRfZGF0ZSgpIHtcbiAgICByZXR1cm4gbmV3IERhdGUodGhpcy5tb2RpZmllZC50b191bml4KCkgKiAxMDAwKTtcbiAgfVxuXG4gIC8vIGFueXRoaW5nIHRoZSBjb25zdHJ1Y3RvciBvZiBkYXRlIGFjY2VwdHNcbiAgc2V0IG1vZGlmaWVkX2RhdGUoZGF0ZTogRGF0ZSkge1xuICAgIHRoaXMubW9kaWZpZWQgPSBHTGliLkRhdGVUaW1lLm5ld19mcm9tX2lzbzg2MDEoXG4gICAgICBuZXcgRGF0ZShkYXRlKS50b0lTT1N0cmluZygpLFxuICAgICAgbnVsbCxcbiAgICApO1xuICB9XG5cbiAgY29uc3RydWN0b3Iobm90ZTogSU5vdGUpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMudiA9IG5vdGUudjtcbiAgICB0aGlzLnV1aWQgPSBub3RlLnV1aWQ7XG4gICAgdGhpcy5jb250ZW50ID0gbm90ZS5jb250ZW50O1xuICAgIHRoaXMudGl0bGUgPSBub3RlLnRpdGxlO1xuICAgIHRoaXMuc3R5bGUgPSBub3RlLnN0eWxlO1xuICAgIHRoaXMudGFnX2xpc3QgPSBHaW8uTGlzdFN0b3JlLm5ldyhUYWcuJGd0eXBlKSBhcyBHaW8uTGlzdFN0b3JlPFRhZz47XG4gICAgdGhpcy50YWdzID0gbm90ZS50YWdzO1xuICAgIHRoaXMubW9kaWZpZWQgPSBHTGliLkRhdGVUaW1lLm5ld19mcm9tX2lzbzg2MDEoXG4gICAgICBuZXcgRGF0ZShub3RlLm1vZGlmaWVkKS50b0lTT1N0cmluZygpLFxuICAgICAgbnVsbCxcbiAgICApO1xuICAgIHRoaXMud2lkdGggPSBub3RlLndpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gbm90ZS5oZWlnaHQ7XG4gICAgdGhpcy5vcGVuID0gbm90ZS5vcGVuID8/IGZhbHNlO1xuXG4gICAgdGhpcy5iaW5kX3Byb3BlcnR5X2Z1bGwoXG4gICAgICBcImNvbnRlbnRcIixcbiAgICAgIHRoaXMsXG4gICAgICBcInRpdGxlXCIsXG4gICAgICBHT2JqZWN0LkJpbmRpbmdGbGFncy5TWU5DX0NSRUFURSxcbiAgICAgIChfLCBjb250ZW50KSA9PiB7XG4gICAgICAgIGlmICghY29udGVudCkgcmV0dXJuIFt0cnVlLCBcIlwiXTtcbiAgICAgICAgbGV0IHRpdGxlID0gY29udGVudC5zcGxpdChcIlxcblwiKVswXS5zbGljZSgwLCAyMCk7XG4gICAgICAgIGlmICh0aXRsZS5sZW5ndGggIT0gY29udGVudC5sZW5ndGgpIHRpdGxlICs9IFwiXHUyMDI2XCI7XG4gICAgICAgIHJldHVybiBbdHJ1ZSwgdGl0bGVdO1xuICAgICAgfSxcbiAgICAgIG51bGxcbiAgICApO1xuXG5cbiAgfVxuXG4gIHN0YXRpYyBnZW5lcmF0ZSgpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoe1xuICAgICAgdjogMSxcbiAgICAgIHV1aWQ6IEdMaWIudXVpZF9zdHJpbmdfcmFuZG9tKCksXG4gICAgICBjb250ZW50OiBcIlwiLFxuICAgICAgdGl0bGU6IFwiXCIsXG4gICAgICBzdHlsZTogU0VUVElOR1MuREVGQVVMVF9TVFlMRSxcbiAgICAgIHRhZ3M6IFtdLFxuICAgICAgbW9kaWZpZWQ6IG5ldyBEYXRlKCksXG4gICAgICB3aWR0aDogMzAwLFxuICAgICAgaGVpZ2h0OiAzMDAsXG4gICAgICBvcGVuOiBmYWxzZSxcbiAgICB9KTtcbiAgfVxuXG4gIGNvcHkoKSB7XG4gICAgcmV0dXJuIG5ldyBOb3RlKHtcbiAgICAgIHY6IHRoaXMudixcbiAgICAgIHV1aWQ6IHRoaXMudXVpZCxcbiAgICAgIGNvbnRlbnQ6IHRoaXMuY29udGVudCxcbiAgICAgIHRpdGxlOiB0aGlzLnRpdGxlLFxuICAgICAgc3R5bGU6IHRoaXMuc3R5bGUsXG4gICAgICB0YWdzOiB0aGlzLnRhZ3MubWFwKCh0YWcpID0+ICh7XG4gICAgICAgIG5hbWU6IHRhZy5uYW1lLFxuICAgICAgICBzdGFydDogdGFnLnN0YXJ0LFxuICAgICAgICBlbmQ6IHRhZy5lbmQsXG4gICAgICB9KSksXG4gICAgICBtb2RpZmllZDogbmV3IERhdGUodGhpcy5tb2RpZmllZC50b191bml4KCkgKiAxMDAwKSxcbiAgICAgIHdpZHRoOiB0aGlzLndpZHRoLFxuICAgICAgaGVpZ2h0OiB0aGlzLmhlaWdodCxcbiAgICAgIG9wZW46IHRoaXMub3BlbixcbiAgICB9KTtcbiAgfVxuXG4gIHRvSlNPTigpOiBJTm90ZSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHY6IHRoaXMudixcbiAgICAgIHV1aWQ6IHRoaXMudXVpZCxcbiAgICAgIGNvbnRlbnQ6IHRoaXMuY29udGVudCxcbiAgICAgIHRpdGxlOiB0aGlzLnRpdGxlLFxuICAgICAgc3R5bGU6IHRoaXMuc3R5bGUsXG4gICAgICB0YWdzOiB0aGlzLnRhZ3MsXG4gICAgICBtb2RpZmllZDogdGhpcy5tb2RpZmllZF9kYXRlLFxuICAgICAgd2lkdGg6IHRoaXMud2lkdGgsXG4gICAgICBoZWlnaHQ6IHRoaXMuaGVpZ2h0LFxuICAgICAgb3BlbjogdGhpcy5vcGVuLFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMge1xuICAgIEdPYmplY3QucmVnaXN0ZXJDbGFzcyh7XG4gICAgICBHVHlwZU5hbWU6IFwiTm90ZU9iamVjdFwiLFxuICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgdjogR09iamVjdC5QYXJhbVNwZWMuaW50KFwidlwiLCBcIlZlcnNpb25cIiwgXCJWZXJzaW9uIG9mIHRoZSBub3RlXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIDAsIDEwMCwgMCksXG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICB1dWlkOiBHT2JqZWN0LlBhcmFtU3BlYy5zdHJpbmcoXCJ1dWlkXCIsIFwiVVVJRFwiLCBcIlVVSUQgb2YgdGhlIG5vdGVcIiwgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSwgXCJcIiksXG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICBjb250ZW50OiBHT2JqZWN0LlBhcmFtU3BlYy5zdHJpbmcoXCJjb250ZW50XCIsIFwiQ29udGVudFwiLCBcIkNvbnRlbnQgb2YgdGhlIG5vdGVcIiwgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSwgXCJcIiksXG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICB0aXRsZTogR09iamVjdC5QYXJhbVNwZWMuc3RyaW5nKFwidGl0bGVcIiwgXCJUaXRsZVwiLCBcIlRpdGxlIG9mIHRoZSBub3RlXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIFwiXCIpLFxuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgc3R5bGU6IEdPYmplY3QuUGFyYW1TcGVjLmludChcInN0eWxlXCIsIFwiU3R5bGVcIiwgXCJTdHlsZSBvZiB0aGUgbm90ZVwiLCBHT2JqZWN0LlBhcmFtRmxhZ3MuUkVBRFdSSVRFLCAwLCAxMDAsIDApLFxuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgdGFnX2xpc3Q6IHRoaXMudGFnX2xpc3RfcHNwZWMsXG4gICAgICAgIC8vIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICBtb2RpZmllZDogR09iamVjdC5QYXJhbVNwZWMuYm94ZWQoXCJtb2RpZmllZFwiLCBcIk1vZGlmaWVkXCIsIFwiRGF0ZSB0aGUgbm90ZSB3YXMgbW9kaWZpZWRcIiwgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSwgR0xpYi5EYXRlVGltZSksXG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICB3aWR0aDogR09iamVjdC5QYXJhbVNwZWMuaW50KFwid2lkdGhcIiwgXCJXaWR0aFwiLCBcIldpZHRoIG9mIHRoZSBub3RlXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIDAsIDEwMCwgMCksXG4gICAgICAgIC8vIGRlbm8tZm10LWlnbm9yZVxuICAgICAgICBoZWlnaHQ6IEdPYmplY3QuUGFyYW1TcGVjLmludChcImhlaWdodFwiLCBcIkhlaWdodFwiLCBcIkhlaWdodCBvZiB0aGUgbm90ZVwiLCBHT2JqZWN0LlBhcmFtRmxhZ3MuUkVBRFdSSVRFLCAwLCAxMDAsIDApLFxuICAgICAgICAvLyBkZW5vLWZtdC1pZ25vcmVcbiAgICAgICAgb3BlbjogR09iamVjdC5QYXJhbVNwZWMuYm9vbGVhbihcIm9wZW5cIiwgXCJPcGVuXCIsIFwiV2hldGhlciB0aGUgbm90ZSB3YXMgb3BlbiB3aGVuIHRoZSBhcHBsaWNhdGlvbiB3YXMgY2xvc2VkXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIGZhbHNlKSxcbiAgICAgIH0sXG4gICAgfSwgdGhpcyk7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGNvbmZpcm1fZGVsZXRlID0gKHdpbmRvdzogR3RrLldpbmRvdywgY2I6ICgpID0+IHZvaWQpID0+IHtcbiAgaWYgKFNFVFRJTkdTLkNPTkZJUk1fREVMRVRFKSB7XG4gICAgY29uc3QgZGlhbG9nID0gQWR3Lk1lc3NhZ2VEaWFsb2cubmV3KFxuICAgICAgd2luZG93LFxuICAgICAgXyhcIkRlbGV0ZSBOb3RlP1wiKSxcbiAgICAgIF8oXCJUaGlzIGFjdGlvbiBjYW5ub3QgYmUgdW5kb25lLiBJZiB5b3Ugd2FudCB0byBoaWRlIHRoZSBub3RlLCB5b3UgY2FuIGNsb3NlIGl0IGluc3RlYWQuXCIpLFxuICAgICk7XG4gICAgZGlhbG9nLmFkZF9yZXNwb25zZShcImNhbmNlbFwiLCBfKFwiQ2FuY2VsXCIpKTtcbiAgICBkaWFsb2cuYWRkX3Jlc3BvbnNlKFwiZGVsZXRlXCIsIF8oXCJEZWxldGVcIikpO1xuICAgIGRpYWxvZy5zZXRfcmVzcG9uc2VfYXBwZWFyYW5jZShcbiAgICAgIFwiZGVsZXRlXCIsXG4gICAgICBBZHcuUmVzcG9uc2VBcHBlYXJhbmNlLkRFU1RSVUNUSVZFLFxuICAgICk7XG4gICAgZGlhbG9nLnNldF9kZWZhdWx0X3Jlc3BvbnNlKFwiY2FuY2VsXCIpO1xuICAgIGRpYWxvZy5zZXRfY2xvc2VfcmVzcG9uc2UoXCJjYW5jZWxcIik7XG4gICAgZGlhbG9nLmNvbm5lY3QoXCJyZXNwb25zZVwiLCAoX2RpYWxvZywgcmVzcG9uc2UpID0+IHtcbiAgICAgIGlmIChyZXNwb25zZSA9PT0gXCJkZWxldGVcIikge1xuICAgICAgICBjYigpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGRpYWxvZy5wcmVzZW50KCk7XG4gIH0gZWxzZSB7XG4gICAgY2IoKTtcbiAgfVxufTtcbiIsICIvKiBNSVQgTGljZW5zZVxuICpcbiAqIENvcHlyaWdodCAoYykgMjAyMyBBbmdlbG8gVmVybGFpbiwgQ2hyaXMgRGF2aXNcbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gKiBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAqIFNPRlRXQVJFLlxuICpcbiAqIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBNSVRcbiAqL1xuXG5pbXBvcnQgR09iamVjdCBmcm9tIFwiZ2k6Ly9HT2JqZWN0XCI7XG5pbXBvcnQgR3RrIGZyb20gXCJnaTovL0d0az92ZXJzaW9uPTQuMFwiO1xuaW1wb3J0IFBhbmdvIGZyb20gXCJnaTovL1BhbmdvXCI7XG5pbXBvcnQgQWR3IGZyb20gXCJnaTovL0Fkdz92ZXJzaW9uPTFcIjtcblxuaW1wb3J0IHsgZmluZCB9IGZyb20gXCJsaW5raWZ5anNcIjtcblxuaW1wb3J0IHsgSVRhZywgTm90ZSB9IGZyb20gXCIuL3V0aWwuanNcIjtcbmltcG9ydCB7IFN0eWxlIH0gZnJvbSBcIi4vdXRpbC5qc1wiO1xuXG5jbGFzcyBBYnN0cmFjdFN0aWNreU5vdGUgZXh0ZW5kcyBHdGsuVGV4dFZpZXcge1xuICBzdGF0aWMge1xuICAgIEdPYmplY3QucmVnaXN0ZXJDbGFzcyhcbiAgICAgIHtcbiAgICAgICAgR1R5cGVOYW1lOiBcIkFic3RyYWN0U3RpY2t5Tm90ZVwiLFxuICAgICAgICBTaWduYWxzOiB7XG4gICAgICAgICAgXCJ0YWctdG9nZ2xlXCI6IHtcbiAgICAgICAgICAgIHBhcmFtX3R5cGVzOiBbR09iamVjdC5UWVBFX1NUUklORywgR09iamVjdC5UWVBFX0JPT0xFQU5dLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzZWxlY3Rpb24tY2hhbmdlZFwiOiB7fSxcbiAgICAgICAgICBcImxpbmstc2VsZWN0ZWRcIjoge1xuICAgICAgICAgICAgcGFyYW1fdHlwZXM6IFtHT2JqZWN0LlRZUEVfU1RSSU5HXSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwibGluay11bnNlbGVjdGVkXCI6IHt9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHRoaXMsXG4gICAgKTtcbiAgfVxuXG4gIGJvbGRfdGFnID0gR3RrLlRleHRUYWcubmV3KFwiYm9sZFwiKTtcbiAgdW5kZXJsaW5lX3RhZyA9IEd0ay5UZXh0VGFnLm5ldyhcInVuZGVybGluZVwiKTtcbiAgaXRhbGljX3RhZyA9IEd0ay5UZXh0VGFnLm5ldyhcIml0YWxpY1wiKTtcbiAgc3RyaWtldGhyb3VnaF90YWcgPSBHdGsuVGV4dFRhZy5uZXcoXCJzdHJpa2V0aHJvdWdoXCIpO1xuICBsaW5rX3RhZyA9IEd0ay5UZXh0VGFnLm5ldyhcImxpbmtcIik7XG5cbiAgYWN0aW9ucyA9IFtcbiAgICBbXCJib2xkXCIsIHRoaXMuYm9sZF90YWddLFxuICAgIFtcInVuZGVybGluZVwiLCB0aGlzLnVuZGVybGluZV90YWddLFxuICAgIFtcIml0YWxpY1wiLCB0aGlzLml0YWxpY190YWddLFxuICAgIFtcInN0cmlrZXRocm91Z2hcIiwgdGhpcy5zdHJpa2V0aHJvdWdoX3RhZ10sXG4gIF0gYXMgW3N0cmluZywgR3RrLlRleHRUYWddW107XG5cbiAgX25vdGU/OiBOb3RlO1xuXG4gIGdldCBub3RlKCkge1xuICAgIHJldHVybiB0aGlzLl9ub3RlO1xuICB9XG5cbiAgc2V0IG5vdGUobm90ZTogTm90ZSB8IHVuZGVmaW5lZCkge1xuICAgIGlmICghbm90ZSkgcmV0dXJuO1xuXG4gICAgdGhpcy5fbm90ZSA9IG5vdGU7XG4gICAgdGhpcy5jbGVhcl90YWdzKCk7XG4gICAgdGhpcy5idWZmZXIudGV4dCA9IG5vdGUuY29udGVudDtcbiAgICB0aGlzLmluaXRfdGFncyhub3RlLnRhZ3MpO1xuXG4gICAgdGhpcy51cGRhdGVfbGlua190YWdfY29sb3IoKTtcbiAgICB0aGlzLnJlbW92ZV9saXN0ZW5lcnMoKTtcbiAgICB0aGlzLmluaXRfbGlzdGVuZXJzKCk7XG4gIH1cblxuICBsaXN0ZW5lcnMgPSBuZXcgU2V0PG51bWJlcj4oKTtcblxuICBpbml0X2xpc3RlbmVycygpIHtcbiAgICBpZiAoIXRoaXMubm90ZSkgcmV0dXJuO1xuXG4gICAgdGhpcy5saXN0ZW5lcnMuYWRkKHRoaXMubm90ZS5jb25uZWN0KFwibm90aWZ5OjpzdHlsZVwiLCAoKSA9PiB7XG4gICAgICB0aGlzLnVwZGF0ZV9saW5rX3RhZ19jb2xvcigpO1xuICAgIH0pKTtcbiAgfVxuXG4gIHJlbW92ZV9saXN0ZW5lcnMoKSB7fVxuXG4gIHN0eWxlX21hbmFnZXI6IEFkdy5TdHlsZU1hbmFnZXI7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgbm90ZT86IE5vdGUsXG4gICkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLnN0eWxlX21hbmFnZXIgPSBBZHcuU3R5bGVNYW5hZ2VyLmdldF9kZWZhdWx0KCk7XG5cbiAgICB0aGlzLnJlZ2lzdGVyX3RhZ3MoKTtcbiAgICBpZiAobm90ZSkgdGhpcy5ub3RlID0gbm90ZTtcblxuICAgIHRoaXMuYnVmZmVyLmNvbm5lY3QoXCJtYXJrLXNldFwiLCAoX2J1ZmZlciwgX2xvYywgbWFyaykgPT4ge1xuICAgICAgaWYgKCF0aGlzLm5vdGUpIHJldHVybjtcblxuICAgICAgaWYgKFxuICAgICAgICBtYXJrLm5hbWUgPT09IFwiaW5zZXJ0XCIgfHwgbWFyay5uYW1lID09PSBcInNlbGVjdGlvbl9ib3VuZFwiIHx8XG4gICAgICAgIHRoaXMuYnVmZmVyLmdldF9pdGVyX2F0X21hcmsobWFyaykuZXF1YWwoXG4gICAgICAgICAgdGhpcy5idWZmZXIuZ2V0X2l0ZXJfYXRfbWFyayh0aGlzLmJ1ZmZlci5nZXRfaW5zZXJ0KCkpLFxuICAgICAgICApXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5lbWl0KFwic2VsZWN0aW9uLWNoYW5nZWRcIik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuY2hlY2tfbGlua19zZWxlY3RlZCgpO1xuICAgIH0pO1xuICB9XG5cbiAgbGFzdF9saW5rOiBudW1iZXIgfCBmYWxzZSA9IGZhbHNlO1xuICBsYXN0X2xpbmtfZW5kOiBudW1iZXIgPSAwO1xuXG4gIGNoZWNrX2xpbmtfc2VsZWN0ZWQoKSB7XG4gICAgY29uc3QgaGFzX2xpbmsgPSB0aGlzLmhhc190YWcodGhpcy5saW5rX3RhZyk7XG5cbiAgICBpZiAoaGFzX2xpbmspIHtcbiAgICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5idWZmZXIuZ2V0X2l0ZXJfYXRfb2Zmc2V0KGhhc19saW5rKTtcblxuICAgICAgaWYgKCFzdGFydC5zdGFydHNfdGFnKHRoaXMubGlua190YWcpKSB7XG4gICAgICAgIHN0YXJ0LmJhY2t3YXJkX3RvX3RhZ190b2dnbGUodGhpcy5saW5rX3RhZyk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGVuZCA9IHN0YXJ0LmNvcHkoKTtcbiAgICAgIGVuZC5mb3J3YXJkX3RvX3RhZ190b2dnbGUodGhpcy5saW5rX3RhZyk7XG5cbiAgICAgIGlmIChcbiAgICAgICAgc3RhcnQuZ2V0X29mZnNldCgpICE9PSB0aGlzLmxhc3RfbGluayB8fFxuICAgICAgICBlbmQuZ2V0X29mZnNldCgpICE9PSB0aGlzLmxhc3RfbGlua19lbmRcbiAgICAgICkge1xuICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy5idWZmZXIuZ2V0X3RleHQoc3RhcnQsIGVuZCwgZmFsc2UpXG4gICAgICAgICAgLnJlcGxhY2UoL1xcdTIwMEIvZywgXCJcIik7XG5cbiAgICAgICAgdGhpcy5lbWl0KFwibGluay1zZWxlY3RlZFwiLCB0ZXh0KTtcblxuICAgICAgICB0aGlzLmxhc3RfbGluayA9IHN0YXJ0LmdldF9vZmZzZXQoKTtcbiAgICAgICAgdGhpcy5sYXN0X2xpbmtfZW5kID0gZW5kLmdldF9vZmZzZXQoKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGhhc19saW5rICE9PSB0aGlzLmxhc3RfbGluaykge1xuICAgICAgdGhpcy5lbWl0KFwibGluay11bnNlbGVjdGVkXCIpO1xuICAgICAgdGhpcy5sYXN0X2xpbmsgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGVfbGlua190YWdfY29sb3IoKSB7XG4gICAgaWYgKCF0aGlzLm5vdGUpIHJldHVybjtcbiAgICBsZXQgY29sb3I7XG5cbiAgICBpZiAodGhpcy5zdHlsZV9tYW5hZ2VyLmRhcmspIHtcbiAgICAgIGNvbnN0IGFjY2VudF9jb2xvciA9IHRoaXMuZ2V0X3N0eWxlX2NvbnRleHQoKS5sb29rdXBfY29sb3IoXG4gICAgICAgIFwiYWNjZW50X2ZnX2NvbG9yXCIsXG4gICAgICApO1xuICAgICAgaWYgKGFjY2VudF9jb2xvclswXSkge1xuICAgICAgICBjb2xvciA9IGFjY2VudF9jb2xvclsxXS50b19zdHJpbmcoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbG9yID0gXCIjMDAwMGZmXCI7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGFjY2VudF9jb2xvciA9IHRoaXMuZ2V0X3N0eWxlX2NvbnRleHQoKS5sb29rdXBfY29sb3IoXG4gICAgICAgIGBsaW5rX2NvbG9yXyR7U3R5bGVbdGhpcy5ub3RlLnN0eWxlXX1gLFxuICAgICAgKTtcbiAgICAgIGlmIChhY2NlbnRfY29sb3JbMF0pIHtcbiAgICAgICAgY29sb3IgPSBhY2NlbnRfY29sb3JbMV0udG9fc3RyaW5nKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb2xvciA9IFwiIzAwMDBmZlwiO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMubGlua190YWcuZm9yZWdyb3VuZCA9IGNvbG9yO1xuICB9XG5cbiAgcHJpdmF0ZSByZWdpc3Rlcl90YWdzKCkge1xuICAgIHRoaXMuYm9sZF90YWcud2VpZ2h0ID0gUGFuZ28uV2VpZ2h0LkJPTEQ7XG4gICAgdGhpcy51bmRlcmxpbmVfdGFnLnVuZGVybGluZSA9IFBhbmdvLlVuZGVybGluZS5TSU5HTEU7XG4gICAgdGhpcy5pdGFsaWNfdGFnLnN0eWxlID0gUGFuZ28uU3R5bGUuSVRBTElDO1xuICAgIHRoaXMuc3RyaWtldGhyb3VnaF90YWcuc3RyaWtldGhyb3VnaCA9IHRydWU7XG5cbiAgICB0aGlzLmxpbmtfdGFnLnVuZGVybGluZSA9IFBhbmdvLlVuZGVybGluZS5TSU5HTEU7XG5cbiAgICBpZiAodGhpcy5zdHlsZV9tYW5hZ2VyLnN5c3RlbV9zdXBwb3J0c19jb2xvcl9zY2hlbWVzKSB7XG4gICAgICB0aGlzLnN0eWxlX21hbmFnZXIuY29ubmVjdChcbiAgICAgICAgXCJub3RpZnk6OmRhcmtcIixcbiAgICAgICAgdGhpcy51cGRhdGVfbGlua190YWdfY29sb3IuYmluZCh0aGlzKSxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgdGhpcy5idWZmZXIudGFnX3RhYmxlLmFkZCh0aGlzLmJvbGRfdGFnKTtcbiAgICB0aGlzLmJ1ZmZlci50YWdfdGFibGUuYWRkKHRoaXMudW5kZXJsaW5lX3RhZyk7XG4gICAgdGhpcy5idWZmZXIudGFnX3RhYmxlLmFkZCh0aGlzLml0YWxpY190YWcpO1xuICAgIHRoaXMuYnVmZmVyLnRhZ190YWJsZS5hZGQodGhpcy5zdHJpa2V0aHJvdWdoX3RhZyk7XG4gICAgdGhpcy5idWZmZXIudGFnX3RhYmxlLmFkZCh0aGlzLmxpbmtfdGFnKTtcbiAgfVxuXG4gIGluaXRfdGFncyh0YWdzOiBOb3RlW1widGFnc1wiXSkge1xuICAgIGZvciAoY29uc3QgdGFnIG9mIHRhZ3MpIHtcbiAgICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5idWZmZXIuZ2V0X2l0ZXJfYXRfb2Zmc2V0KHRhZy5zdGFydCk7XG4gICAgICBjb25zdCBlbmQgPSB0aGlzLmJ1ZmZlci5nZXRfaXRlcl9hdF9vZmZzZXQodGFnLmVuZCk7XG4gICAgICB0aGlzLmJ1ZmZlci5hcHBseV90YWdfYnlfbmFtZSh0YWcubmFtZSwgc3RhcnQsIGVuZCk7XG4gICAgfVxuICB9XG5cbiAgaGFzX3RhZyh0YWc6IEd0ay5UZXh0VGFnKSB7XG4gICAgbGV0IFtzZWxlY3Rpb24sIHN0YXJ0LCBlbmRdID0gdGhpcy5idWZmZXIuZ2V0X3NlbGVjdGlvbl9ib3VuZHMoKTtcbiAgICBpZiAoIXNlbGVjdGlvbikge1xuICAgICAgc3RhcnQgPSB0aGlzLmJ1ZmZlci5nZXRfaXRlcl9hdF9tYXJrKFxuICAgICAgICB0aGlzLmJ1ZmZlci5nZXRfaW5zZXJ0KCksXG4gICAgICApO1xuICAgICAgZW5kID0gc3RhcnQuY29weSgpO1xuICAgICAgZW5kLmZvcndhcmRfY3Vyc29yX3Bvc2l0aW9uKCk7XG4gICAgfVxuXG4gICAgZG8ge1xuICAgICAgaWYgKHN0YXJ0Lmhhc190YWcodGFnKSAhPT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIHN0YXJ0LmdldF9vZmZzZXQoKTtcbiAgICAgIH1cbiAgICAgIHN0YXJ0LmZvcndhcmRfY2hhcigpO1xuICAgIH0gd2hpbGUgKHN0YXJ0LmNvbXBhcmUoZW5kKSA8IDApO1xuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgYXBwbHlfdGFnKHRhZzogR3RrLlRleHRUYWcpIHtcbiAgICBsZXQgW3NlbGVjdGlvbiwgc3RhcnQsIGVuZF0gPSB0aGlzLmJ1ZmZlci5nZXRfc2VsZWN0aW9uX2JvdW5kcygpO1xuICAgIC8vIGlmIG5vIHNlbGVjdGlvbiwgYXBwbHkgdG8gdGhlIGN1cnJlbnQgd29yZFxuICAgIGlmICghc2VsZWN0aW9uKSB7XG4gICAgICAvKipcbiAgICAgICAqIElmIHRoZSB1c2VyIGhhcyBub3Qgc2VsZWN0ZWQgYW55dGhpbmcsIHdlIGluc2VydCB6ZXJvLXdpZHRoIHNwYWNlc1xuICAgICAgICogYXJvdW5kIHRoZSBjdXJzb3IgYW5kIG1hcmsgdGhlbSBhcyB0aGUgc3RhcnQgYW5kIGVuZCBvZiB0aGUgc2VsZWN0aW9uLlxuICAgICAgICovXG4gICAgICBjb25zdCBnZXRfY3Vyc29yX3Bvc2l0aW9uID0gKCkgPT4gdGhpcy5idWZmZXIuY3Vyc29yX3Bvc2l0aW9uO1xuXG4gICAgICB0aGlzLmJ1ZmZlci5pbnNlcnRfYXRfY3Vyc29yKFwiXFx1MjAwQlxcdTIwMEJcXHUyMDBCXCIsIDkpO1xuICAgICAgc3RhcnQgPSB0aGlzLmJ1ZmZlci5nZXRfaXRlcl9hdF9vZmZzZXQoZ2V0X2N1cnNvcl9wb3NpdGlvbigpIC0gMyk7XG4gICAgICBlbmQgPSB0aGlzLmJ1ZmZlci5nZXRfaXRlcl9hdF9vZmZzZXQoZ2V0X2N1cnNvcl9wb3NpdGlvbigpIC0gMSk7XG4gICAgICBjb25zdCBzZWxlYyA9IHRoaXMuYnVmZmVyLmdldF9pdGVyX2F0X29mZnNldChnZXRfY3Vyc29yX3Bvc2l0aW9uKCkpO1xuICAgICAgc2VsZWMuYmFja3dhcmRfY2hhcnMoMik7XG4gICAgICB0aGlzLmJ1ZmZlci5wbGFjZV9jdXJzb3Ioc2VsZWMpO1xuICAgIH1cblxuICAgIGNvbnN0IGhhc190YWcgPSB0aGlzLmhhc190YWcodGFnKTtcblxuICAgIGlmICh0aGlzLmhhc190YWcodGFnKSAhPT0gZmFsc2UpIHtcbiAgICAgIHRoaXMuYnVmZmVyLnJlbW92ZV90YWcodGFnLCBzdGFydCwgZW5kKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5idWZmZXIuYXBwbHlfdGFnKHRhZywgc3RhcnQsIGVuZCk7XG4gICAgfVxuXG4gICAgdGhpcy5lbWl0KFwidGFnLXRvZ2dsZVwiLCB0YWcubmFtZSwgaGFzX3RhZyA9PT0gZmFsc2UpO1xuICB9XG5cbiAgY2xlYXJfdGFncygpIHtcbiAgICBjb25zdCBzdGFydCA9IHRoaXMuYnVmZmVyLmdldF9zdGFydF9pdGVyKCk7XG4gICAgY29uc3QgZW5kID0gdGhpcy5idWZmZXIuZ2V0X2VuZF9pdGVyKCk7XG5cbiAgICBmb3IgKGNvbnN0IFtuYW1lLCB0YWddIG9mIHRoaXMuYWN0aW9ucykge1xuICAgICAgdGhpcy5idWZmZXIucmVtb3ZlX3RhZyh0YWcsIHN0YXJ0LCBlbmQpO1xuICAgICAgdGhpcy5lbWl0KFwidGFnLXRvZ2dsZVwiLCBuYW1lLCBmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0X3RhZ3MoKSB7XG4gICAgY29uc3QgdGFnczogTm90ZVtcInRhZ3NcIl0gPSBbXTtcblxuICAgIHRoaXMuYnVmZmVyLmdldF90YWdfdGFibGUoKS5mb3JlYWNoKCh0YWcpID0+IHtcbiAgICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5idWZmZXIuZ2V0X3N0YXJ0X2l0ZXIoKTtcblxuICAgICAgZG8ge1xuICAgICAgICBpZiAoIXN0YXJ0LnN0YXJ0c190YWcodGFnKSkgY29udGludWU7XG5cbiAgICAgICAgY29uc3QgYmVnaW4gPSBzdGFydC5jb3B5KCk7XG4gICAgICAgIHN0YXJ0LmZvcndhcmRfdG9fdGFnX3RvZ2dsZSh0YWcpO1xuXG4gICAgICAgIHRhZ3MucHVzaCh7XG4gICAgICAgICAgbmFtZTogdGFnLm5hbWUsXG4gICAgICAgICAgc3RhcnQ6IGJlZ2luLmdldF9vZmZzZXQoKSxcbiAgICAgICAgICBlbmQ6IHN0YXJ0LmdldF9vZmZzZXQoKSxcbiAgICAgICAgfSk7XG4gICAgICB9IHdoaWxlIChzdGFydC5mb3J3YXJkX3RvX3RhZ190b2dnbGUodGFnKSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGFncztcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUmVhZG9ubHlTdGlja3lOb3RlIGV4dGVuZHMgQWJzdHJhY3RTdGlja3lOb3RlIHtcbiAgc3RhdGljIHtcbiAgICBHT2JqZWN0LnJlZ2lzdGVyQ2xhc3MoXG4gICAgICB7XG4gICAgICAgIEdUeXBlTmFtZTogXCJSZWFkb25seVN0aWNreU5vdGVcIixcbiAgICAgIH0sXG4gICAgICB0aGlzLFxuICAgICk7XG4gIH1cblxuICBjb25zdHJ1Y3Rvcihub3RlPzogTm90ZSkge1xuICAgIHN1cGVyKG5vdGUpO1xuXG4gICAgdGhpcy5ub3RlID0gbm90ZTtcbiAgICB0aGlzLmVkaXRhYmxlID0gZmFsc2U7XG4gICAgdGhpcy5jdXJzb3JfdmlzaWJsZSA9IGZhbHNlO1xuICAgIHRoaXMuc2hvd19jb250ZW50KCk7XG4gIH1cblxuICBzZXQgbm90ZShub3RlOiBOb3RlIHwgdW5kZWZpbmVkKSB7XG4gICAgdGhpcy5fbm90ZSA9IHN1cGVyLm5vdGUgPSBub3RlO1xuXG4gICAgdGhpcy5zaG93X2NvbnRlbnQoKTtcbiAgfVxuXG4gIGdldCBub3RlKCkge1xuICAgIHJldHVybiBzdXBlci5ub3RlO1xuICB9XG5cbiAgY2xpcF9jb250ZW50KGNvbnRlbnQ6IHN0cmluZykge1xuICAgIGNvbnN0IE1BWF9MSU5FUyA9IDU7XG4gICAgY29uc3QgTUFYX0NIQVJTID0gMjQwO1xuXG4gICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvXFxzKyQvLCBcIlwiKTtcblxuICAgIGxldCBjdXQgPSBjb250ZW50LnNwbGl0KFwiXFxuXCIpLnNsaWNlKDAsIE1BWF9MSU5FUykuam9pbihcIlxcblwiKTtcblxuICAgIGlmIChjdXQubGVuZ3RoID4gTUFYX0NIQVJTKSB7XG4gICAgICBjdXQgPSBjdXQuc2xpY2UoMCwgTUFYX0NIQVJTKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY3V0Lmxlbmd0aCA8IGNvbnRlbnQubGVuZ3RoID8gYCR7Y3V0fVx1MjAyNmAgOiBjdXQ7XG4gIH1cblxuICBzaG93X2NvbnRlbnQoKSB7XG4gICAgaWYgKCF0aGlzLm5vdGUpIHJldHVybjtcblxuICAgIGlmICghdGhpcy5ub3RlLmNvbnRlbnQucmVwbGFjZSgvXFxzL2csIFwiXCIpKSB7XG4gICAgICB0aGlzLmJ1ZmZlci50ZXh0ID0gXCJcIjtcbiAgICAgIHRoaXMuYnVmZmVyLmluc2VydF9tYXJrdXAoXG4gICAgICAgIHRoaXMuYnVmZmVyLmdldF9zdGFydF9pdGVyKCksXG4gICAgICAgIGA8aT4oJHtfKFwiRW1wdHkgTm90ZVwiKX0pPC9pPmAsXG4gICAgICAgIC0xLFxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5idWZmZXIudGV4dCA9IHRoaXMuY2xpcF9jb250ZW50KHRoaXMubm90ZSEuY29udGVudCk7XG4gICAgICB0aGlzLmNsZWFyX3RhZ3MoKTtcbiAgICAgIHRoaXMuaW5pdF90YWdzKHRoaXMubm90ZSEudGFncyk7XG4gICAgfVxuICB9XG5cbiAgaW5pdF9saXN0ZW5lcnMoKSB7XG4gICAgc3VwZXIuaW5pdF9saXN0ZW5lcnMoKTtcblxuICAgIGlmICghdGhpcy5ub3RlKSByZXR1cm47XG5cbiAgICB0aGlzLmxpc3RlbmVycy5hZGQodGhpcy5ub3RlLmNvbm5lY3QoXCJub3RpZnk6OmNvbnRlbnRcIiwgKCkgPT4ge1xuICAgICAgdGhpcy5zaG93X2NvbnRlbnQoKTtcbiAgICB9KSk7XG5cbiAgICB0aGlzLmxpc3RlbmVycy5hZGQodGhpcy5ub3RlLmNvbm5lY3QoXCJub3RpZnk6OnRhZ19saXN0XCIsICgpID0+IHtcbiAgICAgIHRoaXMuY2xlYXJfdGFncygpO1xuICAgICAgdGhpcy5pbml0X3RhZ3ModGhpcy5ub3RlIS50YWdzKTtcbiAgICB9KSk7XG4gIH1cblxuICByZW1vdmVfbGlzdGVuZXJzKCkge1xuICAgIHN1cGVyLnJlbW92ZV9saXN0ZW5lcnMoKTtcblxuICAgIGlmICghdGhpcy5ub3RlKSByZXR1cm47XG5cbiAgICBmb3IgKGNvbnN0IGxpc3RlbmVyIG9mIHRoaXMubGlzdGVuZXJzKSB7XG4gICAgICB0aGlzLm5vdGUhLmRpc2Nvbm5lY3QobGlzdGVuZXIpO1xuICAgIH1cblxuICAgIHRoaXMubGlzdGVuZXJzLmNsZWFyKCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFdyaXRlYWJsZVN0aWNreU5vdGUgZXh0ZW5kcyBBYnN0cmFjdFN0aWNreU5vdGUge1xuICBzdGF0aWMge1xuICAgIEdPYmplY3QucmVnaXN0ZXJDbGFzcyhcbiAgICAgIHtcbiAgICAgICAgR1R5cGVOYW1lOiBcIldyaXRlYWJsZVN0aWNreU5vdGVcIixcbiAgICAgIH0sXG4gICAgICB0aGlzLFxuICAgICk7XG4gIH1cblxuICB1cGRhdGluZyA9IGZhbHNlO1xuICBzb3VyY2U6IG51bWJlciB8IG51bGwgPSBudWxsO1xuXG4gIGdldCBub3RlKCkge1xuICAgIHJldHVybiBzdXBlci5ub3RlO1xuICB9XG5cbiAgc2V0IG5vdGUobm90ZTogTm90ZSB8IHVuZGVmaW5lZCkge1xuICAgIHRoaXMudXBkYXRpbmcgPSB0cnVlO1xuICAgIHN1cGVyLm5vdGUgPSBub3RlO1xuICB9XG5cbiAgY2hhbmdlPFQgZXh0ZW5kcyBrZXlvZiBOb3RlPihrZXk6IFQsIHZhbHVlOiBOb3RlW1RdKSB7XG4gICAgaWYgKCF0aGlzLm5vdGUpIHJldHVybjtcbiAgICB0aGlzLm5vdGVba2V5XSA9IHZhbHVlO1xuICAgIHRoaXMubm90ZS5tb2RpZmllZF9kYXRlID0gbmV3IERhdGUoKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKG5vdGU/OiBOb3RlKSB7XG4gICAgc3VwZXIobm90ZSk7XG5cbiAgICB0aGlzLmJ1ZmZlci5jb25uZWN0X2FmdGVyKFwiaW5zZXJ0LXRleHRcIiwgKGJ1ZmZlciwgbG9jLCB0ZXh0LCBsZW5ndGgpID0+IHtcbiAgICAgIHRoaXMub25fdGV4dF9pbnNlcnRlZChidWZmZXIsIGxvYywgdGV4dCwgbGVuZ3RoKTtcbiAgICB9KTtcblxuICAgIHRoaXMuYnVmZmVyLmNvbm5lY3QoXCJjaGFuZ2VkXCIsICgpID0+IHtcbiAgICAgIGlmICh0aGlzLnVwZGF0aW5nKSB7XG4gICAgICAgIHRoaXMudXBkYXRpbmcgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy51cGRhdGVfbGlua3MoKTtcbiAgICAgIGlmICh0aGlzLmJ1ZmZlci50ZXh0ID09IHRoaXMubm90ZSEuY29udGVudCkgcmV0dXJuO1xuICAgICAgdGhpcy5jaGFuZ2UoXCJjb250ZW50XCIsIHRoaXMuYnVmZmVyLnRleHQpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5idWZmZXIuY29ubmVjdChcIm1hcmstc2V0XCIsICgpID0+IHtcbiAgICAgIGlmICghdGhpcy5ub3RlKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IHRhZ3MgPSB0aGlzLmdldF90YWdzKCk7XG4gICAgICBpZiAoY29tcGFyZV90YWdzKHRhZ3MsIHRoaXMubm90ZS50YWdzKSkgcmV0dXJuO1xuICAgICAgdGhpcy5ub3RlLnRhZ3MgPSB0YWdzO1xuICAgIH0pO1xuICB9XG5cbiAgY2xlYXJfbGlua3MoKSB7XG4gICAgdGhpcy5idWZmZXIucmVtb3ZlX3RhZyhcbiAgICAgIHRoaXMubGlua190YWcsXG4gICAgICB0aGlzLmJ1ZmZlci5nZXRfc3RhcnRfaXRlcigpLFxuICAgICAgdGhpcy5idWZmZXIuZ2V0X2VuZF9pdGVyKCksXG4gICAgKTtcbiAgICB0aGlzLmVtaXQoXCJ0YWctdG9nZ2xlXCIsIFwibGlua1wiLCBmYWxzZSk7XG4gIH1cblxuICB1cGRhdGVfbGlua3MoKSB7XG4gICAgY29uc3QgdGV4dCA9IHRoaXMuYnVmZmVyLnRleHQ7XG5cbiAgICB0aGlzLmNsZWFyX2xpbmtzKCk7XG5cbiAgICBmaW5kKHRleHQpXG4gICAgICAuZm9yRWFjaCgobWF0Y2gpID0+IHtcbiAgICAgICAgY29uc3Qgc3RhcnQgPSB0aGlzLmJ1ZmZlci5nZXRfaXRlcl9hdF9vZmZzZXQobWF0Y2guc3RhcnQpO1xuICAgICAgICBjb25zdCBlbmQgPSB0aGlzLmJ1ZmZlci5nZXRfaXRlcl9hdF9vZmZzZXQobWF0Y2guZW5kKTtcblxuICAgICAgICB0aGlzLmJ1ZmZlci5hcHBseV90YWcodGhpcy5saW5rX3RhZywgc3RhcnQsIGVuZCk7XG4gICAgICB9KTtcblxuICAgIHRoaXMuZW1pdChcInRhZy10b2dnbGVcIiwgXCJsaW5rXCIsIHRydWUpO1xuICB9XG5cbiAgY2xlYXJfdGFncygpIHtcbiAgICBzdXBlci5jbGVhcl90YWdzKCk7XG4gICAgLy8gdGhpcy5jaGFuZ2UoXCJ0YWdzXCIsIFtdKTtcbiAgfVxuXG4gIGFwcGx5X3RhZyh0YWc6IEd0ay5UZXh0VGFnKSB7XG4gICAgc3VwZXIuYXBwbHlfdGFnKHRhZyk7XG4gICAgY29uc3QgdGFncyA9IHRoaXMuZ2V0X3RhZ3MoKTtcbiAgICBpZiAoY29tcGFyZV90YWdzKHRhZ3MsIHRoaXMubm90ZSEudGFncykpIHJldHVybjtcbiAgICB0aGlzLmNoYW5nZShcInRhZ3NcIiwgdGFncyk7XG4gIH1cblxuICBvbl90ZXh0X2luc2VydGVkKFxuICAgIGJ1ZmZlcjogR3RrLlRleHRCdWZmZXIsXG4gICAgbG9jOiBHdGsuVGV4dEl0ZXIsXG4gICAgdGV4dDogc3RyaW5nLFxuICAgIGxlbmd0aDogbnVtYmVyLFxuICApIHtcbiAgICBpZiAodGV4dCA9PT0gXCJcXG5cIikge1xuICAgICAgY29uc3Qgc3RhcnRfaXRlciA9IGxvYy5jb3B5KCk7XG4gICAgICBzdGFydF9pdGVyLmJhY2t3YXJkX2NoYXIoKTtcbiAgICAgIHN0YXJ0X2l0ZXIuc2V0X2xpbmVfb2Zmc2V0KDApO1xuXG4gICAgICBjb25zdCBlbmRfaXRlciA9IHN0YXJ0X2l0ZXIuY29weSgpO1xuICAgICAgZW5kX2l0ZXIuZm9yd2FyZF9jaGFycygyKTtcbiAgICAgIGNvbnN0IGNoYXJzID0gYnVmZmVyLmdldF90ZXh0KHN0YXJ0X2l0ZXIsIGVuZF9pdGVyLCBmYWxzZSk7XG5cbiAgICAgIGNvbnN0IHNpbXBsZV9yZWdleF9wYXR0ZXJuID0gL15bLSsqXSAkLztcbiAgICAgIGlmIChzaW1wbGVfcmVnZXhfcGF0dGVybi50ZXN0KGNoYXJzKSkge1xuICAgICAgICBjb25zdCBidWxsZXQgPSBjaGFyc1swXTtcbiAgICAgICAgY29uc3QgbGluZV9lbmQgPSBsb2MuY29weSgpO1xuICAgICAgICBsaW5lX2VuZC5iYWNrd2FyZF9jaGFyKCk7XG4gICAgICAgIGlmIChsaW5lX2VuZC5nZXRfbGluZV9vZmZzZXQoKSA9PT0gMikge1xuICAgICAgICAgIHN0YXJ0X2l0ZXIuc2V0X2xpbmVfb2Zmc2V0KDApO1xuICAgICAgICAgIGJ1ZmZlci5kZWxldGUoc3RhcnRfaXRlciwgbG9jKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBidWZmZXIuaW5zZXJ0KGxvYywgYnVsbGV0ICsgXCIgXCIsIC0xKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgc2VhcmNoX2xpbWl0ID0gc3RhcnRfaXRlci5jb3B5KCk7XG4gICAgICAgIGNvbnN0IHNlYXJjaF9lbmQgPSBzdGFydF9pdGVyLmNvcHkoKTtcbiAgICAgICAgc2VhcmNoX2xpbWl0LmZvcndhcmRfY2hhcnMoMTApO1xuXG4gICAgICAgIHNlYXJjaF9lbmQuZm9yd2FyZF9maW5kX2NoYXIoKGNoKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJmb3J3YXJkIGNoYXJcIixjaCk7XG4gICAgICAgICAgcmV0dXJuIGNoID09PSBcIiBcIjtcbiAgICAgICAgfSwgc2VhcmNoX2xpbWl0KTtcbiAgICAgICAgc2VhcmNoX2VuZC5mb3J3YXJkX2NoYXIoKTtcbiAgICAgICAgY29uc3QgY2hhcnMgPSBidWZmZXIuZ2V0X3RleHQoc3RhcnRfaXRlciwgc2VhcmNoX2VuZCwgZmFsc2UpO1xuXG4gICAgICAgIGNvbnN0IG9yZGVyZWRfcmVnZXhfcGF0dGVybiA9IC9eXFxkK1xcLiAkLztcbiAgICAgICAgaWYgKG9yZGVyZWRfcmVnZXhfcGF0dGVybi50ZXN0KGNoYXJzKSkge1xuICAgICAgICAgIGNvbnN0IGN1cnJlbnRfb3JkZXIgPSBwYXJzZUludChjaGFycy5zbGljZSgwLCAtMikpO1xuICAgICAgICAgIGNvbnN0IG5ld19vcmRlciA9IGN1cnJlbnRfb3JkZXIgKyAxO1xuICAgICAgICAgIGNvbnN0IG5ld19vcmRlcl9idWxsZXQgPSBgJHtuZXdfb3JkZXJ9LiBgO1xuICAgICAgICAgIGNvbnN0IGxpbmVfZW5kID0gbG9jLmNvcHkoKTtcbiAgICAgICAgICBsaW5lX2VuZC5iYWNrd2FyZF9jaGFyKCk7XG5cbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBsaW5lX2VuZC5nZXRfbGluZV9vZmZzZXQoKSA9PT0gY3VycmVudF9vcmRlci50b1N0cmluZygpLmxlbmd0aCArIDJcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHN0YXJ0X2l0ZXIuc2V0X2xpbmVfb2Zmc2V0KDApO1xuICAgICAgICAgICAgYnVmZmVyLmRlbGV0ZShzdGFydF9pdGVyLCBsb2MpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBidWZmZXIuaW5zZXJ0KGxvYywgbmV3X29yZGVyX2J1bGxldCwgLTEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5jb25zdCBjb21wYXJlX3RhZ3MgPSAoYTogSVRhZ1tdLCBiOiBJVGFnW10pID0+IHtcbiAgaWYgKGEubGVuZ3RoICE9IGIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gIGZvciAoY29uc3QgdGFnIG9mIGEpIHtcbiAgICBpZiAoXG4gICAgICAhYi5maW5kKCh0KSA9PlxuICAgICAgICB0Lm5hbWUgPT0gdGFnLm5hbWUgJiYgdC5zdGFydCA9PSB0YWcuc3RhcnQgJiYgdC5lbmQgPT0gdGFnLmVuZFxuICAgICAgKVxuICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn07XG4iLCAiLy8gVEhJUyBGSUxFIElTIEFVVE9NQVRJQ0FMTFkgR0VORVJBVEVEIERPIE5PVCBFRElUIERJUkVDVExZXG4vLyBTZWUgdXBkYXRlLXRsZHMuanMgZm9yIGVuY29kaW5nL2RlY29kaW5nIGZvcm1hdFxuLy8gaHR0cHM6Ly9kYXRhLmlhbmEub3JnL1RMRC90bGRzLWFscGhhLWJ5LWRvbWFpbi50eHRcbmNvbnN0IGVuY29kZWRUbGRzID0gJ2FhYTFycDNiYXJ0aDRiMG90dDN2aWU0YzFsZTJvZ2FkbzV1ZGhhYmk3YzBhZGVteTVjZW50dXJlNm91bnRhbnQwczlvMXRvcjRkMHMxdWx0NGUwZzFybzJ0bmE0ZjBsMXJpY2E1ZzBha2hhbjVlbmN5NWkwZzFyYnVzM2ZvcmNlNXRlbDVrZG4zbDBmYXJvbWVvN2liYWJhNHBheTRsZmluYW56NnN0YXRlNXkyc2FjZTN0b201bTBhem9uNGVyaWNhbmV4cHJlc3M3ZmFtaWx5MTF4MmZhbTNpY2Ezc3RlcmRhbThuYWx5dGljczdkcm9pZDVxdWFuNHoybzBsMnBhcnRtZW50czhwMGxlNHEwdWFyZWxsZThyMGFiMW1jbzRjaGkzbXkycGEydDBlM3MwZGEyaWEyc29jaWF0ZXM5dDBobGV0YTV0b3JuZXk3dTBjdGlvbjVkaTBibGUzbzNzcG9zdDV0aG9yM28wczR2aWFuY2E2dzBzMngwYTJ6MHVyZTViYTBieTJpZHUzbmFtZXgzbmFyZXB1YmxpYzExZDFrMnIwY2Vsb25hNWxheWNhcmQ0czVlZm9vdDVnYWluczZzZWJhbGw1a2V0YmFsbDh1aGF1czV5ZXJuNWIwYzF0MXZhM2NnMW4yZDFlMGF0czJ1dHk0ZXIybnRsZXk1cmxpbjRzdDBidXk1dDJmMWcxaDBhcnRpNWkwYmxlM2Qxa2UybmcwbzNvMXoyajFsYWNrMGZyaWRheTlvY2tidXN0ZXI4ZzFvbWJlcmc3dWUzbTBzMXcybjBwcGFyaWJhczlvMGF0czNlaHJpbmdlcjhmYTJtMW5kMm8wazBpbmc1c2NoMnRpazJvbjR0MXV0aXF1ZTZ4MnIwYWRlc2NvNmlkZ2VzdG9uZTlvYWR3YXk1a2VyM3RoZXI1dXNzZWxzN3MxdDF1aWxkMGVyczZzaW5lc3M2eTF6ejN2MXcxeTF6MGgzY2EwYjFmZTJsMGwxdmlua2xlaW45bTBlcmEzcDJub24zcGV0b3duNWl0YWwwb25lOHIwYXZhbjRkczJlMGVyMHM0czJzYTFlMWgxaW5vNHQwZXJpbmc1aG9saWM3YmExbjFyZTJzMmMxZDFlbnRlcjRvMXJuM2YwYTFkMmcxaDBhbmVsMm5lbDRyaXR5NHNlMnQyZWFwM2ludGFpNXJpc3RtYXM2b21lNHVyY2g1aTBwcmlhbmk2cmNsZTRzY28zdGFkZWw0aTBjMnkwZWF0czdrMWwwYWltczRlYW5pbmc2aWNrMm5pYzFxdWU2b3RoaW5nNXVkM3ViMG1lZDZtMW4xbzBhY2gzZGVzM2ZmZWU0bGxlZ2U0b2duZTVtMGNhc3Q0bWJhbms0dW5pdHk2cGFueTJyZTN1dGVyNXNlYzRuZG9zM3N0cnVjdGlvbjh1bHRpbmc3dGFjdDNyYWN0b3JzOW9raW5nMGNoYW5uZWwxMWwxcDJyc2ljYTV1bnRyeTRwb24wczRyc2VzNnBhMnIwZWRpdDBjYXJkNHVuaW9uOWlja2V0NW93bjNzMXVpc2UwczZ1MGlzaW5lbGxhOXYxdzF4MXkwbXJ1M291M3oyZGFidXIzZDFuY2UzdGExZTFpbmczc3VuNHkyY2xrM2RzMmUwYWwwZXIyczNncmVlNGxpdmVyeTVsMW9pdHRlNXRhM21vY3JhdDZudGFsMmlzdDVzaTBnbjR2MmhsMmlhbW9uZHM2ZXQyZ2l0YWw1cmVjdDBvcnk3c2NvdW50M3ZlcjVoMnkyajFrMW0xbnAybzBjczF0b3I0ZzFtYWluczV0MXdubG9hZDdyaXZlNHR2MnViYWkzbmxvcDRwb250NHJiYW41dmFnMnIyejJlYXJ0aDN0MmMwbzJkZWthM3UwY2F0aW9uOGUxZzFtYWlsM2VyY2s1bmVyZ3k0Z2luZWVyMGluZzl0ZXJwcmlzZXMxMHBzb240cXVpcG1lbnQ4cjBpY3Nzb242bmkzczBxMXRhdGU1dDBpc2FsYXQ3dTByb3Zpc2lvbjhzMnZlbnRzNXhjaGFuZ2U2cGVydDNvc2VkNHJlc3M1dHJhc3BhY2UxMGZhZ2UyaWwxcndpbmRzNnRoM21pbHk0bjBzMnJtMGVyczVzaGlvbjR0M2VkZXgzZWRiYWNrNnJyYXJpM2VybzZpMGF0MmRlbGl0eTVvMmxtMm5hbDFuY2UxaWFsN3JlMHN0b25lNm1kYWxlNnNoMGluZzV0MG5lc3M2ajFrMWxpY2tyM2dodHM0cjJvcmlzdDR3ZXJzNXkybTFvMG8wZDBuZXR3b3JrOHRiYWxsNnJkMWV4MnNhbGU0dW0zdW5kYXRpb244eDJyMGVlMXNlbml1czdsMW9nYW5zNG50ZG9vcjRpZXI3dHIydWppdHN1NW4wZDJybml0dXJlN3Rib2w1eWkzZ2EwbDBsZXJ5M28xdXA0bWUwczNwMXJkZW40eTJiMGl6M2QwbjJlMGExbnQwaW5nNW9yZ2U1ZjFnMGVlM2gxaTBmdDBzM3ZlczJpbmc1bDBhc3MzZTFvYmFsMm80bTBhaWwzYmgybzF4Mm4xb2RhZGR5NWxkMHBvaW50NmYybzBkeWVhcjVnMGxlNHAxdDF2MnAxcTFyMGFpbmdlcjVwaGljczV0aXM0ZWVuM2lwZTNvY2VyeTR1cDRzMXQxdTBhcmRpYW42Y2NpM2dlMmlkZTJ0YXJzNXJ1M3cxeTJoYWlyMm1idXJnNW5nb3V0NXVzM2JvMmRmYzBiYW5rN2VhbHRoMGNhcmU4bHAxc2lua2k2cmUxbWVzNWd0djNpcGhvcDRzYW1pdHN1N3RhY2hpNXYyazB0Mm0xbjFvY2tleTRsZGluZ3M1aWRheTVtZWRlcG90NWdvb2RzNXMwZW5zZTduZGEzcnNlM3NwaXRhbDV0MGluZzV0MGVsZXMyczNtYWlsNXVzZTN3MnIxc2JjM3QxdTBnaGVzNXlhdHQzdW5kYWk3aWJtMmNiYzJlMXUyZDFlMGVlM2ZtMmthbm80bDFtMGFtYXQ0ZGIybW8wYmlsaWVuOW4wYzFkdXN0cmllczhmaW5pdGk1bzJnMWsxc3RpdHV0ZTZ1cmFuY2U0ZTR0MGVybmF0aW9uYWwxMHVpdDR2ZXN0bWVudHMxMG8xcGlyYW5nYTdxMXIwaXNoNHMwbWFpbGk1dDBhbmJ1bDd0MGF1MnYzamFndWFyNHZhM2NiMmUwZXAydHp0M3dlbHJ5NmlvMmxsMm0wcDJuajJvMGJzMXVyZzR0MXkycDBtb3JnYW42cnMzdWVnb3M0bmlwZXI3a2F1ZmVuNWRkaTNlMHJyeWhvdGVsczZsb2dpc3RpY3M5cHJvcGVydGllczE0ZmgyZzFoMWkwYTFkczJtMW5kZXIybGU0dGNoZW41d2kzbTFuMW9lbG4zbWF0c3U1c2hlcjVwMG1nMm4ycjBkMWVkM3Vva2dyb3VwOHcxeTBvdG80ejJsYTBjYWl4YTVtYm9yZ2hpbmk4ZXIzbmNhc3RlcjVpYTNkMHJvdmVyNnhlc3M1c2FsbGU1dDBpbm8zcm9iZTV3MHllcjViMWMxZHMyZWFzZTNjbGVyYzVmcmFrNGdhbDJvMnh1czRnYnQzaTBkbDJmZTBpbnN1cmFuY2U5c3R5bGU3Z2h0aW5nNmtlMmxseTNtaXRlZDRvMm5jb2xuNGRlMmsycHN5M3ZlMWluZzVrMWxjMXAyb2FuMHMzY2tlcjN1czNsMW5kb240dHRlMW8zdmUzcGwwZmluYW5jaWFsMTFyMXMxdDBkMGEzdTBuZGJlY2s2eGUxdXJ5NXYxeTJtYTBjeXMzZHJpZDRpZjFzb240a2V1cDRuMGFnZW1lbnQ3Z28zcDFya2V0MGluZzNzNHJpb3R0NXNoYWxsczdzZXJhdGk2dHRlbDViYTJjMGtpbnNleTdkMWUwZDBpYTNldDJsYm91cm5lN21lMW9yaWFsNm4wdTJyY2ttc2Q3ZzFoMWlhbWkzY3Jvc29mdDdsMW5pMXQydDBzdWJpc2hpOWsxbDBiMXMybTBhMm4xbzBiaTBsZTRkYTJlMWkxbTFuYXNoM2V5MnN0ZXI1cm1vbjN0Z2FnZTZzY293NHRvMHJjeWNsZXM5djBpZTRwMXExcjFzMGQydDBuMXIydTBzZXVtM2ljM3R1YWw1djF3MXgxeTF6Mm5hMGIxZ295YTRtZTJ0dXJhNHZ5M2JhMmMxZTBjMXQwYmFuazRmbGl4NHdvcms1dXN0YXI1dzBzMnh0MGRpcmVjdDd1czRmMGwyZzBvMmhrMmkwY28ya2Uxb24zbmphM3NzYW4xeTVsMW8wa2lhM3J0aHdlc3Rlcm5tdXR1YWwxNG9uNHcwcnV6M3R2NHAxcjBhMXcydHQydTF5YzJ6Mm9iaTFzZXJ2ZXI3ZmZpY2U1a2luYXdhNmxheWFuMGdyb3VwOWRuYXZ5NWxvM20wZWdhNG5lMWcxbDBpbmU1b28ycGVuM3JhY2xlM25nZTRnMGFuaWM1aWdpbnM2c2FrYTR0c3VrYTR0MnZoM3BhMGdlMm5hc29uaWM3cmlzMnMxdG5lcnM0czF5M3NzYWdlbnM3eTJjY3czZTB0MmYwaXplcjVnMWgwYXJtYWN5NmQxaWxpcHM1b25lMnRvMGdyYXBoeTZzNHlzaW81aWNzMXRldDJ1cmVzNmQxbjBnMWsyb25lZXI1enphNGsxbDBhY2UyeTBzdGF0aW9uOXVtYmluZzVzM20xbjBjMm9obDJrZXIzbGl0aWU1cm4yc3QzcjBhbWVyaWNhNnhpM2VzczNpbWUzbzBkMHVjdGlvbnM4ZjFncmVzc2l2ZThtbzJwZXJ0aWVzM3k1dGVjdGlvbjh1MGRlbnRpYWw5czF0MXViMncwYzJ5MnFhMXBvbjN1ZWJlYzNzdDVyYWNpbmc0ZGlvNGUwYWQxbGVzdGF0ZTZ0b3IyeTRjaXBlczVkMHN0b25lNXVtYnJlbGxhOWhhYjNpc2UwbjN0MmxpYW5jZTZuMHQwYWxzNXBhaXIzb3J0M3VibGljYW44c3QwYXVyYW50OHZpZXcwczV4cm90aDZpY2gwYXJkbGk2b2gzbDFvMXAybzBjaGVyM2tzM2RlbzNnZXJzNG9tM3MwdnAzdTBnYnkzaHIybjJ3MGUyeXVreXU2c2EwYXJsYW5kNmZlMHR5NGt1cmE0bGUxb24zbXNjbHViNHVuZzVuZHZpazBjb3JvbWFudDEyb2ZpNHAxcmwyczF2ZTJ4bzNiMGkxczJjMGExYjFoYWVmZmxlcjdtaWR0NG9sYXJzaGlwczhvbDN1bGUzd2FyejVpZW5jZTVvdDNkMWUwYXJjaDN0MmN1cmUxaXR5NmVrMmxlY3Q0bmVyM3J2aWNlczZ2ZW4zdzF4MHkzZnIyZzFoMGFuZ3JpbGE2cnAydzJlbGwzaWExa3NoYTVvZXMycDBwaW5nNXVqaTN3MHRpbWU3aTBsazJuYTFnbGVzNXRlM2oxazBpMG4yeTBwZTRsMGluZzRtMGFydDNpbGU0bjBjZjNvMGNjZXIzaWFsNGZ0YmFuazR3YXJlNmh1MmxhcjJ1dGlvbnM3bmcxeTJ5MnBhMGNlM29ydDJ0M3IwbDJzMXQwYWRhMnBsZXM0cjF0ZWJhbms0ZmFybTdjMGdyb3VwNm9ja2hvbG02cmFnZTNlM3JlYW00dWRpbzJ5M3lsZTR1MGNrczNwcGxpZXMzeTJvcnQ1cmYxZ2VyeTV6dWtpNXYxd2F0Y2g0aXNzNHgxeTBkbmV5NHN0ZW1zNnoydGFiMWlwZWk0bGsyb2JhbzRyZ2V0NHRhbW90b3JzNnIydG9vNHgwaTNjMGkyZDBrMmVhbTJjaDBub2xvZ3k4bDFtYXNlazVubmlzNHZhM2YxZzFoMGQxZWF0ZXIycmU2aWFhMmNrZXRzNWVuZGE0ZmZhbnk1cHMycmVzMm9sNGowbWF4eDR4MmswbWF4eDVsMW0wYWxsNG4xbzBkYXkza3lvM29sczNwMXJheTNzaGliYTV0YWwzdXJzM3duMnlvdGEzczNyMGFkZTFpbmc0aW5pbmc1dmVsMGNoYW5uZWw3ZXJzMGluc3VyYW5jZTE2dXN0M3YydDF1YmUyaTFuZXMzc2h1NHYwczJ3MXoydWExYmFuazNzMmcxazFuaWNvbTN2ZXJzaXR5OG8yb2wycHMyczF5MXoydmEwY2F0aW9uczduYTFndWFyZDdjMWUwZ2FzM250dXJlczZyaXNpZ241bVx1MDBGNmdlbnNiZXJhdGVyMnVuZzE0c2ljaGVydW5nMTB0MmcxaTBhamVzNGRlbzNnMWtpbmc0bGxhczRuMXAxcmdpbjRzYTFpb240dmExbzNsYWFuZGVyZW45bjFvZGthM2xrc3dhZ2VuN3ZvM3RlMWluZzNvMnlhZ2U1dTBlbG9zNndhbGVzMm1hcnQ0dGVyNG5nMGdvdTV0Y2gwZXM2ZWF0aGVyMGNoYW5uZWwxMmJjYW0zZXIyc2l0ZTVkMGRpbmc1aWJvMnIzZjFob3N3aG82aWVuMmtpMmxsaWFtaGlsbDluMGRvd3M0ZTFuZXJzNm1lMm9sdGVyc2tsdXdlcjExb2RzaWRlNnJrMHMybGQzdzJzMXRjMWYzeGJveDNlcm94NGZpbml0eTZpaHVhbjRuMnh4Mnl6M3lhY2h0czRob28zbWF4dW41bmRleDVlMW9kb2Jhc2hpN2dhMmtvaGFtYTZ1MHR1YmU2dDF1bjN6YTBwcG9zNHJhM2VybzNpcDJtMW9uZTN1ZXJpY2g2dzInO1xuLy8gSW50ZXJuYXRpb25hbGl6ZWQgZG9tYWluIG5hbWVzIGNvbnRhaW5pbmcgbm9uLUFTQ0lJXG5jb25zdCBlbmNvZGVkVXRsZHMgPSAnXHUwM0I1XHUwM0JCMVx1MDNDNTJcdTA0MzFcdTA0MzMxXHUwNDM1XHUwNDNCM1x1MDQzNFx1MDQzNVx1MDQ0Mlx1MDQzODRcdTA0MzVcdTA0NEUyXHUwNDNBXHUwNDMwXHUwNDQyXHUwNDNFXHUwNDNCXHUwNDM4XHUwNDNBNlx1MDQzRVx1MDQzQzNcdTA0M0NcdTA0M0FcdTA0MzQyXHUwNDNFXHUwNDNEMVx1MDQ0MVx1MDQzQVx1MDQzMlx1MDQzMDZcdTA0M0VcdTA0M0RcdTA0M0JcdTA0MzBcdTA0MzlcdTA0M0Q1XHUwNDQwXHUwNDMzM1x1MDQ0MFx1MDQ0M1x1MDQ0MTJcdTA0NDQyXHUwNDQxXHUwNDMwXHUwNDM5XHUwNDQyM1x1MDQ0MFx1MDQzMTNcdTA0NDNcdTA0M0FcdTA0NDAzXHUwNDlCXHUwNDMwXHUwNDM3M1x1MDU3MFx1MDU2MVx1MDU3NTNcdTA1RDlcdTA1RTlcdTA1RThcdTA1RDBcdTA1REM1XHUwNUU3XHUwNUQ1XHUwNUREM1x1MDYyN1x1MDYyOFx1MDY0OFx1MDYzOFx1MDYyOFx1MDY0QTVcdTA2MkFcdTA2MzVcdTA2MjdcdTA2NDRcdTA2MjdcdTA2MkE2XHUwNjMxXHUwNjI3XHUwNjQ1XHUwNjQzXHUwNjQ4NVx1MDY0NFx1MDYyN1x1MDYzMVx1MDYyRlx1MDY0NjRcdTA2MjhcdTA2MkRcdTA2MzFcdTA2NEFcdTA2NDY1XHUwNjJDXHUwNjMyXHUwNjI3XHUwNjI2XHUwNjMxNVx1MDYzM1x1MDYzOVx1MDY0OFx1MDYyRlx1MDY0QVx1MDYyOTZcdTA2MzlcdTA2NDRcdTA2NEFcdTA2MjdcdTA2NDY1XHUwNjQ1XHUwNjNBXHUwNjMxXHUwNjI4NVx1MDY0NVx1MDYyN1x1MDYzMVx1MDYyN1x1MDYyQTVcdTA2Q0NcdTA2MzFcdTA2MjdcdTA2NDY1XHUwNjI4XHUwNjI3XHUwNjMxXHUwNjJBMlx1MDYzMlx1MDYyN1x1MDYzMTRcdTA2NEFcdTA2MkFcdTA2NDMzXHUwNkJFXHUwNjI3XHUwNjMxXHUwNjJBNVx1MDYyQVx1MDY0OFx1MDY0Nlx1MDYzMzRcdTA2MzNcdTA2NDhcdTA2MkZcdTA2MjdcdTA2NDYzXHUwNjMxXHUwNjRBXHUwNjI5NVx1MDYzNFx1MDYyOFx1MDY0M1x1MDYyOTRcdTA2MzlcdTA2MzFcdTA2MjdcdTA2NDIyXHUwNjI4Mlx1MDY0NVx1MDYyN1x1MDY0NjRcdTA2NDFcdTA2NDRcdTA2MzNcdTA2MzdcdTA2NEFcdTA2NDY2XHUwNjQyXHUwNjM3XHUwNjMxM1x1MDY0M1x1MDYyN1x1MDYyQlx1MDY0OFx1MDY0NFx1MDY0QVx1MDY0MzZcdTA2NDhcdTA2NDUzXHUwNjQ1XHUwNjM1XHUwNjMxMlx1MDY0NFx1MDY0QVx1MDYzM1x1MDY0QVx1MDYyNzVcdTA2NDhcdTA2MzFcdTA2NEFcdTA2MkFcdTA2MjdcdTA2NDZcdTA2NEFcdTA2Mjc3XHUwNjQyXHUwNjM5NFx1MDY0N1x1MDY0NVx1MDYzMVx1MDYyN1x1MDY0NzVcdTA2N0VcdTA2MjdcdTA2QTlcdTA2MzNcdTA2MkFcdTA2MjdcdTA2NDY3XHUwNjgwXHUwNjI3XHUwNjMxXHUwNjJBNFx1MDkxNVx1MDk0OVx1MDkyRTNcdTA5MjhcdTA5NDdcdTA5MUYzXHUwOTJEXHUwOTNFXHUwOTMwXHUwOTI0MFx1MDkyRVx1MDk0RDNcdTA5NEJcdTA5MjQ1XHUwOTM4XHUwOTAyXHUwOTE3XHUwOTIwXHUwOTI4NVx1MDlBQ1x1MDlCRVx1MDk4Mlx1MDlCMlx1MDlCRTVcdTA5QURcdTA5QkVcdTA5QjBcdTA5QTQyXHUwOUYwXHUwOUE0NFx1MEEyRFx1MEEzRVx1MEEzMFx1MEEyNDRcdTBBQURcdTBBQkVcdTBBQjBcdTBBQTQ0XHUwQjJEXHUwQjNFXHUwQjMwXHUwQjI0NFx1MEI4N1x1MEJBOFx1MEJDRFx1MEJBNFx1MEJCRlx1MEJBRlx1MEJCRTZcdTBCQjJcdTBCOTlcdTBCQ0RcdTBCOTVcdTBCQzg2XHUwQjlBXHUwQkJGXHUwQjk5XHUwQkNEXHUwQjk1XHUwQkFBXHUwQkNEXHUwQkFBXHUwQkMyXHUwQkIwXHUwQkNEMTFcdTBDMkRcdTBDM0VcdTBDMzBcdTBDMjRcdTBDNEQ1XHUwQ0FEXHUwQ0JFXHUwQ0IwXHUwQ0E0NFx1MEQyRFx1MEQzRVx1MEQzMFx1MEQyNFx1MEQwMjVcdTBEQkRcdTBEODJcdTBEOUFcdTBEQ0Y0XHUwRTA0XHUwRTJEXHUwRTIxM1x1MEU0NFx1MEUxN1x1MEUyMjNcdTBFQTVcdTBFQjJcdTBFQTczXHUxMEQyXHUxMEQ0Mlx1MzA3Rlx1MzA5M1x1MzA2QTNcdTMwQTJcdTMwREVcdTMwQkVcdTMwRjM0XHUzMEFGXHUzMEU5XHUzMEE2XHUzMEM5NFx1MzBCMFx1MzBGQ1x1MzBCMFx1MzBFQjRcdTMwQjNcdTMwRTAyXHUzMEI5XHUzMEM4XHUzMEEyM1x1MzBCQlx1MzBGQ1x1MzBFQjNcdTMwRDVcdTMwQTFcdTMwQzNcdTMwQjdcdTMwRTdcdTMwRjM2XHUzMEREXHUzMEE0XHUzMEYzXHUzMEM4NFx1NEUxNlx1NzU0QzJcdTRFMkRcdTRGRTExXHU1NkZEMVx1NTcwQjFcdTY1ODdcdTdGNTEzXHU0RTlBXHU5QTZDXHU5MDBBM1x1NEYwMVx1NEUxQTJcdTRGNUJcdTVDNzEyXHU0RkUxXHU2MDZGMlx1NTA2NVx1NUVCNzJcdTUxNkJcdTUzNjYyXHU1MTZDXHU1M0Y4MVx1NzZDQTJcdTUzRjBcdTZFN0UxXHU3MDYzMlx1NTU0Nlx1NTdDRTFcdTVFOTcxXHU2ODA3Mlx1NTYwOVx1OTFDQzBcdTU5MjdcdTkxNTJcdTVFOTc1XHU1NzI4XHU3RUJGMlx1NTkyN1x1NjJGRjJcdTU5MjlcdTRFM0JcdTY1NTkzXHU1QTMxXHU0RTUwMlx1NUJCNlx1OTZGQjJcdTVFN0ZcdTRFMUMyXHU1RkFFXHU1MzVBMlx1NjE0OFx1NTU4NDJcdTYyMTFcdTcyMzFcdTRGNjAzXHU2MjRCXHU2NzNBMlx1NjJEQlx1ODA1ODJcdTY1M0ZcdTUyQTExXHU1RTlDMlx1NjVCMFx1NTJBMFx1NTc2MTJcdTk1RkIyXHU2NUY2XHU1QzFBMlx1NjZGOFx1N0M0RDJcdTY3M0FcdTY3ODQyXHU2REUxXHU5QTZDXHU5NTIxM1x1NkUzOFx1NjIwRjJcdTZGQjNcdTk1ODAyXHU3MEI5XHU3NzBCMlx1NzlGQlx1NTJBODJcdTdFQzRcdTdFQzdcdTY3M0FcdTY3ODQ0XHU3RjUxXHU1NzQwMVx1NUU5NzFcdTdBRDkxXHU3RURDMlx1ODA1NFx1OTAxQTJcdThDMzdcdTZCNEMyXHU4RDJEXHU3MjY5Mlx1OTAxQVx1OENBOTJcdTk2QzZcdTU2RTIyXHU5NkZCXHU4QTBBXHU3NkM4XHU3OUQxNFx1OThERVx1NTIyOVx1NkQ2NjNcdTk4REZcdTU0QzEyXHU5OTEwXHU1Mzg1Mlx1OTk5OVx1NjgzQ1x1OTFDQ1x1NjJDOTNcdTZFMkYyXHVCMkY3XHVCMTM3MVx1Q0VGNDJcdUMwQkNcdUMxMzEyXHVENTVDXHVBRDZEMic7XG5cbi8qKlxuICogQHRlbXBsYXRlIEFcbiAqIEB0ZW1wbGF0ZSBCXG4gKiBAcGFyYW0ge0F9IHRhcmdldFxuICogQHBhcmFtIHtCfSBwcm9wZXJ0aWVzXG4gKiBAcmV0dXJuIHtBICYgQn1cbiAqL1xuY29uc3QgYXNzaWduID0gKHRhcmdldCwgcHJvcGVydGllcykgPT4ge1xuICBmb3IgKGNvbnN0IGtleSBpbiBwcm9wZXJ0aWVzKSB7XG4gICAgdGFyZ2V0W2tleV0gPSBwcm9wZXJ0aWVzW2tleV07XG4gIH1cbiAgcmV0dXJuIHRhcmdldDtcbn07XG5cbi8qKlxuICogRmluaXRlIFN0YXRlIE1hY2hpbmUgZ2VuZXJhdGlvbiB1dGlsaXRpZXNcbiAqL1xuXG4vKipcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAdHlwZWRlZiB7eyBbZ3JvdXA6IHN0cmluZ106IFRbXSB9fSBDb2xsZWN0aW9uc1xuICovXG5cbi8qKlxuICogQHR5cGVkZWYge3sgW2dyb3VwOiBzdHJpbmddOiB0cnVlIH19IEZsYWdzXG4gKi9cblxuLy8gS2V5cyBpbiBzY2FubmVyIENvbGxlY3Rpb25zIGluc3RhbmNlc1xuY29uc3QgbnVtZXJpYyA9ICdudW1lcmljJztcbmNvbnN0IGFzY2lpID0gJ2FzY2lpJztcbmNvbnN0IGFscGhhID0gJ2FscGhhJztcbmNvbnN0IGFzY2lpbnVtZXJpYyA9ICdhc2NpaW51bWVyaWMnO1xuY29uc3QgYWxwaGFudW1lcmljID0gJ2FscGhhbnVtZXJpYyc7XG5jb25zdCBkb21haW4gPSAnZG9tYWluJztcbmNvbnN0IGVtb2ppID0gJ2Vtb2ppJztcbmNvbnN0IHNjaGVtZSA9ICdzY2hlbWUnO1xuY29uc3Qgc2xhc2hzY2hlbWUgPSAnc2xhc2hzY2hlbWUnO1xuY29uc3Qgd2hpdGVzcGFjZSA9ICd3aGl0ZXNwYWNlJztcblxuLyoqXG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7Q29sbGVjdGlvbnM8VD59IGdyb3VwcyB0byByZWdpc3RlciBpblxuICogQHJldHVybnMge1RbXX0gQ3VycmVudCBsaXN0IG9mIHRva2VucyBpbiB0aGUgZ2l2ZW4gY29sbGVjdGlvblxuICovXG5mdW5jdGlvbiByZWdpc3Rlckdyb3VwKG5hbWUsIGdyb3Vwcykge1xuICBpZiAoIShuYW1lIGluIGdyb3VwcykpIHtcbiAgICBncm91cHNbbmFtZV0gPSBbXTtcbiAgfVxuICByZXR1cm4gZ3JvdXBzW25hbWVdO1xufVxuXG4vKipcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0ge1R9IHQgdG9rZW4gdG8gYWRkXG4gKiBAcGFyYW0ge0NvbGxlY3Rpb25zPFQ+fSBncm91cHNcbiAqIEBwYXJhbSB7RmxhZ3N9IGZsYWdzXG4gKi9cbmZ1bmN0aW9uIGFkZFRvR3JvdXBzKHQsIGZsYWdzLCBncm91cHMpIHtcbiAgaWYgKGZsYWdzW251bWVyaWNdKSB7XG4gICAgZmxhZ3NbYXNjaWludW1lcmljXSA9IHRydWU7XG4gICAgZmxhZ3NbYWxwaGFudW1lcmljXSA9IHRydWU7XG4gIH1cbiAgaWYgKGZsYWdzW2FzY2lpXSkge1xuICAgIGZsYWdzW2FzY2lpbnVtZXJpY10gPSB0cnVlO1xuICAgIGZsYWdzW2FscGhhXSA9IHRydWU7XG4gIH1cbiAgaWYgKGZsYWdzW2FzY2lpbnVtZXJpY10pIHtcbiAgICBmbGFnc1thbHBoYW51bWVyaWNdID0gdHJ1ZTtcbiAgfVxuICBpZiAoZmxhZ3NbYWxwaGFdKSB7XG4gICAgZmxhZ3NbYWxwaGFudW1lcmljXSA9IHRydWU7XG4gIH1cbiAgaWYgKGZsYWdzW2FscGhhbnVtZXJpY10pIHtcbiAgICBmbGFnc1tkb21haW5dID0gdHJ1ZTtcbiAgfVxuICBpZiAoZmxhZ3NbZW1vamldKSB7XG4gICAgZmxhZ3NbZG9tYWluXSA9IHRydWU7XG4gIH1cbiAgZm9yIChjb25zdCBrIGluIGZsYWdzKSB7XG4gICAgY29uc3QgZ3JvdXAgPSByZWdpc3Rlckdyb3VwKGssIGdyb3Vwcyk7XG4gICAgaWYgKGdyb3VwLmluZGV4T2YodCkgPCAwKSB7XG4gICAgICBncm91cC5wdXNoKHQpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0ge1R9IHQgdG9rZW4gdG8gY2hlY2tcbiAqIEBwYXJhbSB7Q29sbGVjdGlvbnM8VD59IGdyb3Vwc1xuICogQHJldHVybnMge0ZsYWdzfSBncm91cCBmbGFncyB0aGF0IGNvbnRhaW4gdGhpcyB0b2tlblxuICovXG5mdW5jdGlvbiBmbGFnc0ZvclRva2VuKHQsIGdyb3Vwcykge1xuICBjb25zdCByZXN1bHQgPSB7fTtcbiAgZm9yIChjb25zdCBjIGluIGdyb3Vwcykge1xuICAgIGlmIChncm91cHNbY10uaW5kZXhPZih0KSA+PSAwKSB7XG4gICAgICByZXN1bHRbY10gPSB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAdHlwZWRlZiB7bnVsbCB8IFQgfSBUcmFuc2l0aW9uXG4gKi9cblxuLyoqXG4gKiBEZWZpbmUgYSBiYXNpYyBzdGF0ZSBtYWNoaW5lIHN0YXRlLiBqIGlzIHRoZSBsaXN0IG9mIGNoYXJhY3RlciB0cmFuc2l0aW9ucyxcbiAqIGpyIGlzIHRoZSBsaXN0IG9mIHJlZ2V4LW1hdGNoIHRyYW5zaXRpb25zLCBqZCBpcyB0aGUgZGVmYXVsdCBzdGF0ZSB0b1xuICogdHJhbnNpdGlvbiB0byB0IGlzIHRoZSBhY2NlcHRpbmcgdG9rZW4gdHlwZSwgaWYgYW55LiBJZiB0aGlzIGlzIHRoZSB0ZXJtaW5hbFxuICogc3RhdGUsIHRoZW4gaXQgZG9lcyBub3QgZW1pdCBhIHRva2VuLlxuICpcbiAqIFRoZSB0ZW1wbGF0ZSB0eXBlIFQgcmVwcmVzZW50cyB0aGUgdHlwZSBvZiB0aGUgdG9rZW4gdGhpcyBzdGF0ZSBhY2NlcHRzLiBUaGlzXG4gKiBzaG91bGQgYmUgYSBzdHJpbmcgKHN1Y2ggYXMgb2YgdGhlIHRva2VuIGV4cG9ydHMgaW4gYHRleHQuanNgKSBvciBhXG4gKiBNdWx0aVRva2VuIHN1YmNsYXNzIChmcm9tIGBtdWx0aS5qc2ApXG4gKlxuICogQHRlbXBsYXRlIFRcbiAqIEBwYXJhbSB7VH0gW3Rva2VuXSBUb2tlbiB0aGF0IHRoaXMgc3RhdGUgZW1pdHNcbiAqL1xuZnVuY3Rpb24gU3RhdGUodG9rZW4pIHtcbiAgaWYgKHRva2VuID09PSB2b2lkIDApIHtcbiAgICB0b2tlbiA9IG51bGw7XG4gIH1cbiAgLy8gdGhpcy5uID0gbnVsbDsgLy8gREVCVUc6IFN0YXRlIG5hbWVcbiAgLyoqIEB0eXBlIHt7IFtpbnB1dDogc3RyaW5nXTogU3RhdGU8VD4gfX0gaiAqL1xuICB0aGlzLmogPSB7fTsgLy8gSU1QTEVNRU5UQVRJT04gMVxuICAvLyB0aGlzLmogPSBbXTsgLy8gSU1QTEVNRU5UQVRJT04gMlxuICAvKiogQHR5cGUge1tSZWdFeHAsIFN0YXRlPFQ+XVtdfSBqciAqL1xuICB0aGlzLmpyID0gW107XG4gIC8qKiBAdHlwZSB7P1N0YXRlPFQ+fSBqZCAqL1xuICB0aGlzLmpkID0gbnVsbDtcbiAgLyoqIEB0eXBlIHs/VH0gdCAqL1xuICB0aGlzLnQgPSB0b2tlbjtcbn1cblxuLyoqXG4gKiBTY2FubmVyIHRva2VuIGdyb3Vwc1xuICogQHR5cGUgQ29sbGVjdGlvbnM8c3RyaW5nPlxuICovXG5TdGF0ZS5ncm91cHMgPSB7fTtcblN0YXRlLnByb3RvdHlwZSA9IHtcbiAgYWNjZXB0cygpIHtcbiAgICByZXR1cm4gISF0aGlzLnQ7XG4gIH0sXG4gIC8qKlxuICAgKiBGb2xsb3cgYW4gZXhpc3RpbmcgdHJhbnNpdGlvbiBmcm9tIHRoZSBnaXZlbiBpbnB1dCB0byB0aGUgbmV4dCBzdGF0ZS5cbiAgICogRG9lcyBub3QgbXV0YXRlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaW5wdXQgY2hhcmFjdGVyIG9yIHRva2VuIHR5cGUgdG8gdHJhbnNpdGlvbiBvblxuICAgKiBAcmV0dXJucyB7P1N0YXRlPFQ+fSB0aGUgbmV4dCBzdGF0ZSwgaWYgYW55XG4gICAqL1xuICBnbyhpbnB1dCkge1xuICAgIGNvbnN0IHN0YXRlID0gdGhpcztcbiAgICBjb25zdCBuZXh0U3RhdGUgPSBzdGF0ZS5qW2lucHV0XTtcbiAgICBpZiAobmV4dFN0YXRlKSB7XG4gICAgICByZXR1cm4gbmV4dFN0YXRlO1xuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0YXRlLmpyLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCByZWdleCA9IHN0YXRlLmpyW2ldWzBdO1xuICAgICAgY29uc3QgbmV4dFN0YXRlID0gc3RhdGUuanJbaV1bMV07IC8vIG5vdGU6IG1pZ2h0IGJlIGVtcHR5IHRvIHByZXZlbnQgZGVmYXVsdCBqdW1wXG4gICAgICBpZiAobmV4dFN0YXRlICYmIHJlZ2V4LnRlc3QoaW5wdXQpKSB7XG4gICAgICAgIHJldHVybiBuZXh0U3RhdGU7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIE5vd2hlcmUgbGVmdCB0byBqdW1wISBSZXR1cm4gZGVmYXVsdCwgaWYgYW55XG4gICAgcmV0dXJuIHN0YXRlLmpkO1xuICB9LFxuICAvKipcbiAgICogV2hldGhlciB0aGUgc3RhdGUgaGFzIGEgdHJhbnNpdGlvbiBmb3IgdGhlIGdpdmVuIGlucHV0LiBTZXQgdGhlIHNlY29uZFxuICAgKiBhcmd1bWVudCB0byB0cnVlIHRvIG9ubHkgbG9vayBmb3IgYW4gZXhhY3QgbWF0Y2ggKGFuZCBub3QgYSBkZWZhdWx0IG9yXG4gICAqIHJlZ3VsYXItZXhwcmVzc2lvbi1iYXNlZCB0cmFuc2l0aW9uKVxuICAgKiBAcGFyYW0ge3N0cmluZ30gaW5wdXRcbiAgICogQHBhcmFtIHtib29sZWFufSBleGFjdE9ubHlcbiAgICovXG4gIGhhcyhpbnB1dCwgZXhhY3RPbmx5KSB7XG4gICAgaWYgKGV4YWN0T25seSA9PT0gdm9pZCAwKSB7XG4gICAgICBleGFjdE9ubHkgPSBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGV4YWN0T25seSA/IGlucHV0IGluIHRoaXMuaiA6ICEhdGhpcy5nbyhpbnB1dCk7XG4gIH0sXG4gIC8qKlxuICAgKiBTaG9ydCBmb3IgXCJ0cmFuc2l0aW9uIGFsbFwiOyBjcmVhdGUgYSB0cmFuc2l0aW9uIGZyb20gdGhlIGFycmF5IG9mIGl0ZW1zXG4gICAqIGluIHRoZSBnaXZlbiBsaXN0IHRvIHRoZSBzYW1lIGZpbmFsIHJlc3VsdGluZyBzdGF0ZS5cbiAgICogQHBhcmFtIHtzdHJpbmcgfCBzdHJpbmdbXX0gaW5wdXRzIEdyb3VwIG9mIGlucHV0cyB0byB0cmFuc2l0aW9uIG9uXG4gICAqIEBwYXJhbSB7VHJhbnNpdGlvbjxUPiB8IFN0YXRlPFQ+fSBbbmV4dF0gVHJhbnNpdGlvbiBvcHRpb25zXG4gICAqIEBwYXJhbSB7RmxhZ3N9IFtmbGFnc10gQ29sbGVjdGlvbnMgZmxhZ3MgdG8gYWRkIHRva2VuIHRvXG4gICAqIEBwYXJhbSB7Q29sbGVjdGlvbnM8VD59IFtncm91cHNdIE1hc3RlciBsaXN0IG9mIHRva2VuIGdyb3Vwc1xuICAgKi9cbiAgdGEoaW5wdXRzLCBuZXh0LCBmbGFncywgZ3JvdXBzKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMudHQoaW5wdXRzW2ldLCBuZXh0LCBmbGFncywgZ3JvdXBzKTtcbiAgICB9XG4gIH0sXG4gIC8qKlxuICAgKiBTaG9ydCBmb3IgXCJ0YWtlIHJlZ2V4cCB0cmFuc2l0aW9uXCI7IGRlZmluZXMgYSB0cmFuc2l0aW9uIGZvciB0aGlzIHN0YXRlXG4gICAqIHdoZW4gaXQgZW5jb3VudGVycyBhIHRva2VuIHdoaWNoIG1hdGNoZXMgdGhlIGdpdmVuIHJlZ3VsYXIgZXhwcmVzc2lvblxuICAgKiBAcGFyYW0ge1JlZ0V4cH0gcmVnZXhwIFJlZ3VsYXIgZXhwcmVzc2lvbiB0cmFuc2l0aW9uIChwb3B1bGF0ZSBmaXJzdClcbiAgICogQHBhcmFtIHtUIHwgU3RhdGU8VD59IFtuZXh0XSBUcmFuc2l0aW9uIG9wdGlvbnNcbiAgICogQHBhcmFtIHtGbGFnc30gW2ZsYWdzXSBDb2xsZWN0aW9ucyBmbGFncyB0byBhZGQgdG9rZW4gdG9cbiAgICogQHBhcmFtIHtDb2xsZWN0aW9uczxUPn0gW2dyb3Vwc10gTWFzdGVyIGxpc3Qgb2YgdG9rZW4gZ3JvdXBzXG4gICAqIEByZXR1cm5zIHtTdGF0ZTxUPn0gdGFrZW4gYWZ0ZXIgdGhlIGdpdmVuIGlucHV0XG4gICAqL1xuICB0cihyZWdleHAsIG5leHQsIGZsYWdzLCBncm91cHMpIHtcbiAgICBncm91cHMgPSBncm91cHMgfHwgU3RhdGUuZ3JvdXBzO1xuICAgIGxldCBuZXh0U3RhdGU7XG4gICAgaWYgKG5leHQgJiYgbmV4dC5qKSB7XG4gICAgICBuZXh0U3RhdGUgPSBuZXh0O1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUb2tlbiB3aXRoIG1heWJlIHRva2VuIGdyb3Vwc1xuICAgICAgbmV4dFN0YXRlID0gbmV3IFN0YXRlKG5leHQpO1xuICAgICAgaWYgKGZsYWdzICYmIGdyb3Vwcykge1xuICAgICAgICBhZGRUb0dyb3VwcyhuZXh0LCBmbGFncywgZ3JvdXBzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5qci5wdXNoKFtyZWdleHAsIG5leHRTdGF0ZV0pO1xuICAgIHJldHVybiBuZXh0U3RhdGU7XG4gIH0sXG4gIC8qKlxuICAgKiBTaG9ydCBmb3IgXCJ0YWtlIHRyYW5zaXRpb25zXCIsIHdpbGwgdGFrZSBhcyBtYW55IHNlcXVlbnRpYWwgdHJhbnNpdGlvbnMgYXNcbiAgICogdGhlIGxlbmd0aCBvZiB0aGUgZ2l2ZW4gaW5wdXQgYW5kIHJldHVybnMgdGhlXG4gICAqIHJlc3VsdGluZyBmaW5hbCBzdGF0ZS5cbiAgICogQHBhcmFtIHtzdHJpbmcgfCBzdHJpbmdbXX0gaW5wdXRcbiAgICogQHBhcmFtIHtUIHwgU3RhdGU8VD59IFtuZXh0XSBUcmFuc2l0aW9uIG9wdGlvbnNcbiAgICogQHBhcmFtIHtGbGFnc30gW2ZsYWdzXSBDb2xsZWN0aW9ucyBmbGFncyB0byBhZGQgdG9rZW4gdG9cbiAgICogQHBhcmFtIHtDb2xsZWN0aW9uczxUPn0gW2dyb3Vwc10gTWFzdGVyIGxpc3Qgb2YgdG9rZW4gZ3JvdXBzXG4gICAqIEByZXR1cm5zIHtTdGF0ZTxUPn0gdGFrZW4gYWZ0ZXIgdGhlIGdpdmVuIGlucHV0XG4gICAqL1xuICB0cyhpbnB1dCwgbmV4dCwgZmxhZ3MsIGdyb3Vwcykge1xuICAgIGxldCBzdGF0ZSA9IHRoaXM7XG4gICAgY29uc3QgbGVuID0gaW5wdXQubGVuZ3RoO1xuICAgIGlmICghbGVuKSB7XG4gICAgICByZXR1cm4gc3RhdGU7XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuIC0gMTsgaSsrKSB7XG4gICAgICBzdGF0ZSA9IHN0YXRlLnR0KGlucHV0W2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIHN0YXRlLnR0KGlucHV0W2xlbiAtIDFdLCBuZXh0LCBmbGFncywgZ3JvdXBzKTtcbiAgfSxcbiAgLyoqXG4gICAqIFNob3J0IGZvciBcInRha2UgdHJhbnNpdGlvblwiLCB0aGlzIGlzIGEgbWV0aG9kIGZvciBidWlsZGluZy93b3JraW5nIHdpdGhcbiAgICogc3RhdGUgbWFjaGluZXMuXG4gICAqXG4gICAqIElmIGEgc3RhdGUgYWxyZWFkeSBleGlzdHMgZm9yIHRoZSBnaXZlbiBpbnB1dCwgcmV0dXJucyBpdC5cbiAgICpcbiAgICogSWYgYSB0b2tlbiBpcyBzcGVjaWZpZWQsIHRoYXQgc3RhdGUgd2lsbCBlbWl0IHRoYXQgdG9rZW4gd2hlbiByZWFjaGVkIGJ5XG4gICAqIHRoZSBsaW5raWZ5IGVuZ2luZS5cbiAgICpcbiAgICogSWYgbm8gc3RhdGUgZXhpc3RzLCBpdCB3aWxsIGJlIGluaXRpYWxpemVkIHdpdGggc29tZSBkZWZhdWx0IHRyYW5zaXRpb25zXG4gICAqIHRoYXQgcmVzZW1ibGUgZXhpc3RpbmcgZGVmYXVsdCB0cmFuc2l0aW9ucy5cbiAgICpcbiAgICogSWYgYSBzdGF0ZSBpcyBnaXZlbiBmb3IgdGhlIHNlY29uZCBhcmd1bWVudCwgdGhhdCBzdGF0ZSB3aWxsIGJlXG4gICAqIHRyYW5zaXRpb25lZCB0byBvbiB0aGUgZ2l2ZW4gaW5wdXQgcmVnYXJkbGVzcyBvZiB3aGF0IHRoYXQgaW5wdXRcbiAgICogcHJldmlvdXNseSBkaWQuXG4gICAqXG4gICAqIFNwZWNpZnkgYSB0b2tlbiBncm91cCBmbGFncyB0byBkZWZpbmUgZ3JvdXBzIHRoYXQgdGhpcyB0b2tlbiBiZWxvbmdzIHRvLlxuICAgKiBUaGUgdG9rZW4gd2lsbCBiZSBhZGRlZCB0byBjb3JyZXNwb25kaW5nIGVudGlyZXMgaW4gdGhlIGdpdmVuIGdyb3Vwc1xuICAgKiBvYmplY3QuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBpbnB1dCBjaGFyYWN0ZXIsIHRva2VuIHR5cGUgdG8gdHJhbnNpdGlvbiBvblxuICAgKiBAcGFyYW0ge1QgfCBTdGF0ZTxUPn0gW25leHRdIFRyYW5zaXRpb24gb3B0aW9uc1xuICAgKiBAcGFyYW0ge0ZsYWdzfSBbZmxhZ3NdIENvbGxlY3Rpb25zIGZsYWdzIHRvIGFkZCB0b2tlbiB0b1xuICAgKiBAcGFyYW0ge0NvbGxlY3Rpb25zPFQ+fSBbZ3JvdXBzXSBNYXN0ZXIgbGlzdCBvZiBncm91cHNcbiAgICogQHJldHVybnMge1N0YXRlPFQ+fSB0YWtlbiBhZnRlciB0aGUgZ2l2ZW4gaW5wdXRcbiAgICovXG4gIHR0KGlucHV0LCBuZXh0LCBmbGFncywgZ3JvdXBzKSB7XG4gICAgZ3JvdXBzID0gZ3JvdXBzIHx8IFN0YXRlLmdyb3VwcztcbiAgICBjb25zdCBzdGF0ZSA9IHRoaXM7XG5cbiAgICAvLyBDaGVjayBpZiBleGlzdGluZyBzdGF0ZSBnaXZlbiwganVzdCBhIGJhc2ljIHRyYW5zaXRpb25cbiAgICBpZiAobmV4dCAmJiBuZXh0LmopIHtcbiAgICAgIHN0YXRlLmpbaW5wdXRdID0gbmV4dDtcbiAgICAgIHJldHVybiBuZXh0O1xuICAgIH1cbiAgICBjb25zdCB0ID0gbmV4dDtcblxuICAgIC8vIFRha2UgdGhlIHRyYW5zaXRpb24gd2l0aCB0aGUgdXN1YWwgZGVmYXVsdCBtZWNoYW5pc21zIGFuZCB1c2UgdGhhdCBhc1xuICAgIC8vIGEgdGVtcGxhdGUgZm9yIGNyZWF0aW5nIHRoZSBuZXh0IHN0YXRlXG4gICAgbGV0IG5leHRTdGF0ZSxcbiAgICAgIHRlbXBsYXRlU3RhdGUgPSBzdGF0ZS5nbyhpbnB1dCk7XG4gICAgaWYgKHRlbXBsYXRlU3RhdGUpIHtcbiAgICAgIG5leHRTdGF0ZSA9IG5ldyBTdGF0ZSgpO1xuICAgICAgYXNzaWduKG5leHRTdGF0ZS5qLCB0ZW1wbGF0ZVN0YXRlLmopO1xuICAgICAgbmV4dFN0YXRlLmpyLnB1c2guYXBwbHkobmV4dFN0YXRlLmpyLCB0ZW1wbGF0ZVN0YXRlLmpyKTtcbiAgICAgIG5leHRTdGF0ZS5qZCA9IHRlbXBsYXRlU3RhdGUuamQ7XG4gICAgICBuZXh0U3RhdGUudCA9IHRlbXBsYXRlU3RhdGUudDtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV4dFN0YXRlID0gbmV3IFN0YXRlKCk7XG4gICAgfVxuICAgIGlmICh0KSB7XG4gICAgICAvLyBFbnN1cmUgbmV3bHkgdG9rZW4gaXMgaW4gdGhlIHNhbWUgZ3JvdXBzIGFzIHRoZSBvbGQgdG9rZW5cbiAgICAgIGlmIChncm91cHMpIHtcbiAgICAgICAgaWYgKG5leHRTdGF0ZS50ICYmIHR5cGVvZiBuZXh0U3RhdGUudCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBjb25zdCBhbGxGbGFncyA9IGFzc2lnbihmbGFnc0ZvclRva2VuKG5leHRTdGF0ZS50LCBncm91cHMpLCBmbGFncyk7XG4gICAgICAgICAgYWRkVG9Hcm91cHModCwgYWxsRmxhZ3MsIGdyb3Vwcyk7XG4gICAgICAgIH0gZWxzZSBpZiAoZmxhZ3MpIHtcbiAgICAgICAgICBhZGRUb0dyb3Vwcyh0LCBmbGFncywgZ3JvdXBzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbmV4dFN0YXRlLnQgPSB0OyAvLyBvdmVyd3JpdGUgYW55dGhpbmcgdGhhdCB3YXMgcHJldmlvdXNseSB0aGVyZVxuICAgIH1cblxuICAgIHN0YXRlLmpbaW5wdXRdID0gbmV4dFN0YXRlO1xuICAgIHJldHVybiBuZXh0U3RhdGU7XG4gIH1cbn07XG5cbi8vIEhlbHBlciBmdW5jdGlvbnMgdG8gaW1wcm92ZSBtaW5pZmljYXRpb24gKG5vdCBleHBvcnRlZCBvdXRzaWRlIGxpbmtpZnlqcyBtb2R1bGUpXG5cbi8qKlxuICogQHRlbXBsYXRlIFRcbiAqIEBwYXJhbSB7U3RhdGU8VD59IHN0YXRlXG4gKiBAcGFyYW0ge3N0cmluZyB8IHN0cmluZ1tdfSBpbnB1dFxuICogQHBhcmFtIHtGbGFnc30gW2ZsYWdzXVxuICogQHBhcmFtIHtDb2xsZWN0aW9uczxUPn0gW2dyb3Vwc11cbiAqL1xuY29uc3QgdGEgPSAoc3RhdGUsIGlucHV0LCBuZXh0LCBmbGFncywgZ3JvdXBzKSA9PiBzdGF0ZS50YShpbnB1dCwgbmV4dCwgZmxhZ3MsIGdyb3Vwcyk7XG5cbi8qKlxuICogQHRlbXBsYXRlIFRcbiAqIEBwYXJhbSB7U3RhdGU8VD59IHN0YXRlXG4gKiBAcGFyYW0ge1JlZ0V4cH0gcmVnZXhwXG4gKiBAcGFyYW0ge1QgfCBTdGF0ZTxUPn0gW25leHRdXG4gKiBAcGFyYW0ge0ZsYWdzfSBbZmxhZ3NdXG4gKiBAcGFyYW0ge0NvbGxlY3Rpb25zPFQ+fSBbZ3JvdXBzXVxuICovXG5jb25zdCB0ciA9IChzdGF0ZSwgcmVnZXhwLCBuZXh0LCBmbGFncywgZ3JvdXBzKSA9PiBzdGF0ZS50cihyZWdleHAsIG5leHQsIGZsYWdzLCBncm91cHMpO1xuXG4vKipcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0ge1N0YXRlPFQ+fSBzdGF0ZVxuICogQHBhcmFtIHtzdHJpbmcgfCBzdHJpbmdbXX0gaW5wdXRcbiAqIEBwYXJhbSB7VCB8IFN0YXRlPFQ+fSBbbmV4dF1cbiAqIEBwYXJhbSB7RmxhZ3N9IFtmbGFnc11cbiAqIEBwYXJhbSB7Q29sbGVjdGlvbnM8VD59IFtncm91cHNdXG4gKi9cbmNvbnN0IHRzID0gKHN0YXRlLCBpbnB1dCwgbmV4dCwgZmxhZ3MsIGdyb3VwcykgPT4gc3RhdGUudHMoaW5wdXQsIG5leHQsIGZsYWdzLCBncm91cHMpO1xuXG4vKipcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0ge1N0YXRlPFQ+fSBzdGF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IGlucHV0XG4gKiBAcGFyYW0ge1QgfCBTdGF0ZTxUPn0gW25leHRdXG4gKiBAcGFyYW0ge0NvbGxlY3Rpb25zPFQ+fSBbZ3JvdXBzXVxuICogQHBhcmFtIHtGbGFnc30gW2ZsYWdzXVxuICovXG5jb25zdCB0dCA9IChzdGF0ZSwgaW5wdXQsIG5leHQsIGZsYWdzLCBncm91cHMpID0+IHN0YXRlLnR0KGlucHV0LCBuZXh0LCBmbGFncywgZ3JvdXBzKTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuVGV4dCBUb2tlbnNcbklkZW50aWZpZXJzIGZvciB0b2tlbiBvdXRwdXRzIGZyb20gdGhlIHJlZ2V4cCBzY2FubmVyXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbi8vIEEgdmFsaWQgd2ViIGRvbWFpbiB0b2tlblxuY29uc3QgV09SRCA9ICdXT1JEJzsgLy8gb25seSBjb250YWlucyBhLXpcbmNvbnN0IFVXT1JEID0gJ1VXT1JEJzsgLy8gY29udGFpbnMgbGV0dGVycyBvdGhlciB0aGFuIGEteiwgdXNlZCBmb3IgSUROXG5cbi8vIFNwZWNpYWwgY2FzZSBvZiB3b3JkXG5jb25zdCBMT0NBTEhPU1QgPSAnTE9DQUxIT1NUJztcblxuLy8gVmFsaWQgdG9wLWxldmVsIGRvbWFpbiwgc3BlY2lhbCBjYXNlIG9mIFdPUkQgKHNlZSB0bGRzLmpzKVxuY29uc3QgVExEID0gJ1RMRCc7XG5cbi8vIFZhbGlkIElETiBUTEQsIHNwZWNpYWwgY2FzZSBvZiBVV09SRCAoc2VlIHRsZHMuanMpXG5jb25zdCBVVExEID0gJ1VUTEQnO1xuXG4vLyBUaGUgc2NoZW1lIHBvcnRpb24gb2YgYSB3ZWIgVVJJIHByb3RvY29sLiBTdXBwb3J0ZWQgdHlwZXMgaW5jbHVkZTogYG1haWx0b2AsXG4vLyBgZmlsZWAsIGFuZCB1c2VyLWRlZmluZWQgY3VzdG9tIHByb3RvY29scy4gTGltaXRlZCB0byBzY2hlbWVzIHRoYXQgY29udGFpblxuLy8gb25seSBsZXR0ZXJzXG5jb25zdCBTQ0hFTUUgPSAnU0NIRU1FJztcblxuLy8gU2ltaWxhciB0byBTQ0hFTUUsIGV4Y2VwdCBtYWtlcyBkaXN0aW5jdGlvbiBmb3Igc2NoZW1lcyB0aGF0IG11c3QgYWx3YXlzIGJlXG4vLyBmb2xsb3dlZCBieSBgOi8vYCwgbm90IGp1c3QgYDpgLiBTdXBwb3J0ZWQgdHlwZXMgaW5jbHVkZSBgaHR0cGAsIGBodHRwc2AsXG4vLyBgZnRwYCwgYGZ0cHNgXG5jb25zdCBTTEFTSF9TQ0hFTUUgPSAnU0xBU0hfU0NIRU1FJztcblxuLy8gQW55IHNlcXVlbmNlIG9mIGRpZ2l0cyAwLTlcbmNvbnN0IE5VTSA9ICdOVU0nO1xuXG4vLyBBbnkgbnVtYmVyIG9mIGNvbnNlY3V0aXZlIHdoaXRlc3BhY2UgY2hhcmFjdGVycyB0aGF0IGFyZSBub3QgbmV3bGluZVxuY29uc3QgV1MgPSAnV1MnO1xuXG4vLyBOZXcgbGluZSAodW5peCBzdHlsZSlcbmNvbnN0IE5MJDEgPSAnTkwnOyAvLyBcXG5cblxuLy8gT3BlbmluZy9jbG9zaW5nIGJyYWNrZXQgY2xhc3Nlc1xuY29uc3QgT1BFTkJSQUNFID0gJ09QRU5CUkFDRSc7IC8vIHtcbmNvbnN0IE9QRU5CUkFDS0VUID0gJ09QRU5CUkFDS0VUJzsgLy8gW1xuY29uc3QgT1BFTkFOR0xFQlJBQ0tFVCA9ICdPUEVOQU5HTEVCUkFDS0VUJzsgLy8gPFxuY29uc3QgT1BFTlBBUkVOID0gJ09QRU5QQVJFTic7IC8vIChcbmNvbnN0IENMT1NFQlJBQ0UgPSAnQ0xPU0VCUkFDRSc7IC8vIH1cbmNvbnN0IENMT1NFQlJBQ0tFVCA9ICdDTE9TRUJSQUNLRVQnOyAvLyBdXG5jb25zdCBDTE9TRUFOR0xFQlJBQ0tFVCA9ICdDTE9TRUFOR0xFQlJBQ0tFVCc7IC8vID5cbmNvbnN0IENMT1NFUEFSRU4gPSAnQ0xPU0VQQVJFTic7IC8vIClcblxuLy8gVmFyaW91cyBzeW1ib2xzXG5jb25zdCBBTVBFUlNBTkQgPSAnQU1QRVJTQU5EJzsgLy8gJlxuY29uc3QgQVBPU1RST1BIRSA9ICdBUE9TVFJPUEhFJzsgLy8gJ1xuY29uc3QgQVNURVJJU0sgPSAnQVNURVJJU0snOyAvLyAqXG5jb25zdCBBVCA9ICdBVCc7IC8vIEBcbmNvbnN0IEJBQ0tTTEFTSCA9ICdCQUNLU0xBU0gnOyAvLyBcXFxuY29uc3QgQkFDS1RJQ0sgPSAnQkFDS1RJQ0snOyAvLyBgXG5jb25zdCBDQVJFVCA9ICdDQVJFVCc7IC8vIF5cbmNvbnN0IENPTE9OID0gJ0NPTE9OJzsgLy8gOlxuY29uc3QgQ09NTUEgPSAnQ09NTUEnOyAvLyAsXG5jb25zdCBET0xMQVIgPSAnRE9MTEFSJzsgLy8gJFxuY29uc3QgRE9UID0gJ0RPVCc7IC8vIC5cbmNvbnN0IEVRVUFMUyA9ICdFUVVBTFMnOyAvLyA9XG5jb25zdCBFWENMQU1BVElPTiA9ICdFWENMQU1BVElPTic7IC8vICFcbmNvbnN0IEhZUEhFTiA9ICdIWVBIRU4nOyAvLyAtXG5jb25zdCBQRVJDRU5UID0gJ1BFUkNFTlQnOyAvLyAlXG5jb25zdCBQSVBFID0gJ1BJUEUnOyAvLyB8XG5jb25zdCBQTFVTID0gJ1BMVVMnOyAvLyArXG5jb25zdCBQT1VORCA9ICdQT1VORCc7IC8vICNcbmNvbnN0IFFVRVJZID0gJ1FVRVJZJzsgLy8gP1xuY29uc3QgUVVPVEUgPSAnUVVPVEUnOyAvLyBcIlxuXG5jb25zdCBTRU1JID0gJ1NFTUknOyAvLyA7XG5jb25zdCBTTEFTSCA9ICdTTEFTSCc7IC8vIC9cbmNvbnN0IFRJTERFID0gJ1RJTERFJzsgLy8gflxuY29uc3QgVU5ERVJTQ09SRSA9ICdVTkRFUlNDT1JFJzsgLy8gX1xuXG4vLyBFbW9qaSBzeW1ib2xcbmNvbnN0IEVNT0pJJDEgPSAnRU1PSkknO1xuXG4vLyBEZWZhdWx0IHRva2VuIC0gYW55dGhpbmcgdGhhdCBpcyBub3Qgb25lIG9mIHRoZSBhYm92ZVxuY29uc3QgU1lNID0gJ1NZTSc7XG5cbnZhciB0ayA9IC8qI19fUFVSRV9fKi9PYmplY3QuZnJlZXplKHtcblx0X19wcm90b19fOiBudWxsLFxuXHRXT1JEOiBXT1JELFxuXHRVV09SRDogVVdPUkQsXG5cdExPQ0FMSE9TVDogTE9DQUxIT1NULFxuXHRUTEQ6IFRMRCxcblx0VVRMRDogVVRMRCxcblx0U0NIRU1FOiBTQ0hFTUUsXG5cdFNMQVNIX1NDSEVNRTogU0xBU0hfU0NIRU1FLFxuXHROVU06IE5VTSxcblx0V1M6IFdTLFxuXHROTDogTkwkMSxcblx0T1BFTkJSQUNFOiBPUEVOQlJBQ0UsXG5cdE9QRU5CUkFDS0VUOiBPUEVOQlJBQ0tFVCxcblx0T1BFTkFOR0xFQlJBQ0tFVDogT1BFTkFOR0xFQlJBQ0tFVCxcblx0T1BFTlBBUkVOOiBPUEVOUEFSRU4sXG5cdENMT1NFQlJBQ0U6IENMT1NFQlJBQ0UsXG5cdENMT1NFQlJBQ0tFVDogQ0xPU0VCUkFDS0VULFxuXHRDTE9TRUFOR0xFQlJBQ0tFVDogQ0xPU0VBTkdMRUJSQUNLRVQsXG5cdENMT1NFUEFSRU46IENMT1NFUEFSRU4sXG5cdEFNUEVSU0FORDogQU1QRVJTQU5ELFxuXHRBUE9TVFJPUEhFOiBBUE9TVFJPUEhFLFxuXHRBU1RFUklTSzogQVNURVJJU0ssXG5cdEFUOiBBVCxcblx0QkFDS1NMQVNIOiBCQUNLU0xBU0gsXG5cdEJBQ0tUSUNLOiBCQUNLVElDSyxcblx0Q0FSRVQ6IENBUkVULFxuXHRDT0xPTjogQ09MT04sXG5cdENPTU1BOiBDT01NQSxcblx0RE9MTEFSOiBET0xMQVIsXG5cdERPVDogRE9ULFxuXHRFUVVBTFM6IEVRVUFMUyxcblx0RVhDTEFNQVRJT046IEVYQ0xBTUFUSU9OLFxuXHRIWVBIRU46IEhZUEhFTixcblx0UEVSQ0VOVDogUEVSQ0VOVCxcblx0UElQRTogUElQRSxcblx0UExVUzogUExVUyxcblx0UE9VTkQ6IFBPVU5ELFxuXHRRVUVSWTogUVVFUlksXG5cdFFVT1RFOiBRVU9URSxcblx0U0VNSTogU0VNSSxcblx0U0xBU0g6IFNMQVNILFxuXHRUSUxERTogVElMREUsXG5cdFVOREVSU0NPUkU6IFVOREVSU0NPUkUsXG5cdEVNT0pJOiBFTU9KSSQxLFxuXHRTWU06IFNZTVxufSk7XG5cbi8vIE5vdGUgdGhhdCB0aGVzZSB0d28gVW5pY29kZSBvbmVzIGV4cGFuZCBpbnRvIGEgcmVhbGx5IGJpZyBvbmUgd2l0aCBCYWJlbFxuY29uc3QgQVNDSUlfTEVUVEVSID0gL1thLXpdLztcbmNvbnN0IExFVFRFUiA9IC9cXHB7TH0vdTsgLy8gQW55IFVuaWNvZGUgY2hhcmFjdGVyIHdpdGggbGV0dGVyIGRhdGEgdHlwZVxuY29uc3QgRU1PSkkgPSAvXFxwe0Vtb2ppfS91OyAvLyBBbnkgVW5pY29kZSBlbW9qaSBjaGFyYWN0ZXJcbmNvbnN0IEVNT0pJX1ZBUklBVElPTiQxID0gL1xcdWZlMGYvO1xuY29uc3QgRElHSVQgPSAvXFxkLztcbmNvbnN0IFNQQUNFID0gL1xccy87XG5cbnZhciByZWdleHAgPSAvKiNfX1BVUkVfXyovT2JqZWN0LmZyZWV6ZSh7XG5cdF9fcHJvdG9fXzogbnVsbCxcblx0QVNDSUlfTEVUVEVSOiBBU0NJSV9MRVRURVIsXG5cdExFVFRFUjogTEVUVEVSLFxuXHRFTU9KSTogRU1PSkksXG5cdEVNT0pJX1ZBUklBVElPTjogRU1PSklfVkFSSUFUSU9OJDEsXG5cdERJR0lUOiBESUdJVCxcblx0U1BBQ0U6IFNQQUNFXG59KTtcblxuLyoqXG5cdFRoZSBzY2FubmVyIHByb3ZpZGVzIGFuIGludGVyZmFjZSB0aGF0IHRha2VzIGEgc3RyaW5nIG9mIHRleHQgYXMgaW5wdXQsIGFuZFxuXHRvdXRwdXRzIGFuIGFycmF5IG9mIHRva2VucyBpbnN0YW5jZXMgdGhhdCBjYW4gYmUgdXNlZCBmb3IgZWFzeSBVUkwgcGFyc2luZy5cbiovXG5jb25zdCBOTCA9ICdcXG4nOyAvLyBOZXcgbGluZSBjaGFyYWN0ZXJcbmNvbnN0IEVNT0pJX1ZBUklBVElPTiA9ICdcXHVmZTBmJzsgLy8gVmFyaWF0aW9uIHNlbGVjdG9yLCBmb2xsb3dzIGhlYXJ0IGFuZCBvdGhlcnNcbmNvbnN0IEVNT0pJX0pPSU5FUiA9ICdcXHUyMDBkJzsgLy8gemVyby13aWR0aCBqb2luZXJcblxubGV0IHRsZHMgPSBudWxsLFxuICB1dGxkcyA9IG51bGw7IC8vIGRvbid0IGNoYW5nZSBzbyBvbmx5IGhhdmUgdG8gYmUgY29tcHV0ZWQgb25jZVxuXG4vKipcbiAqIFNjYW5uZXIgb3V0cHV0IHRva2VuOlxuICogLSBgdGAgaXMgdGhlIHRva2VuIG5hbWUgKGUuZy4sICdOVU0nLCAnRU1PSkknLCAnVExEJylcbiAqIC0gYHZgIGlzIHRoZSB2YWx1ZSBvZiB0aGUgdG9rZW4gKGUuZy4sICcxMjMnLCAnXHUyNzY0XHVGRTBGJywgJ2NvbScpXG4gKiAtIGBzYCBpcyB0aGUgc3RhcnQgaW5kZXggb2YgdGhlIHRva2VuIGluIHRoZSBvcmlnaW5hbCBzdHJpbmdcbiAqIC0gYGVgIGlzIHRoZSBlbmQgaW5kZXggb2YgdGhlIHRva2VuIGluIHRoZSBvcmlnaW5hbCBzdHJpbmdcbiAqIEB0eXBlZGVmIHt7dDogc3RyaW5nLCB2OiBzdHJpbmcsIHM6IG51bWJlciwgZTogbnVtYmVyfX0gVG9rZW5cbiAqL1xuXG4vKipcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAdHlwZWRlZiB7eyBbY29sbGVjdGlvbjogc3RyaW5nXTogVFtdIH19IENvbGxlY3Rpb25zXG4gKi9cblxuLyoqXG4gKiBJbml0aWFsaXplIHRoZSBzY2FubmVyIGNoYXJhY3Rlci1iYXNlZCBzdGF0ZSBtYWNoaW5lIGZvciB0aGUgZ2l2ZW4gc3RhcnRcbiAqIHN0YXRlXG4gKiBAcGFyYW0ge1tzdHJpbmcsIGJvb2xlYW5dW119IGN1c3RvbVNjaGVtZXMgTGlzdCBvZiBjdXN0b20gc2NoZW1lcywgd2hlcmUgZWFjaFxuICogaXRlbSBpcyBhIGxlbmd0aC0yIHR1cGxlIHdpdGggdGhlIGZpcnN0IGVsZW1lbnQgc2V0IHRvIHRoZSBzdHJpbmcgc2NoZW1lLCBhbmRcbiAqIHRoZSBzZWNvbmQgZWxlbWVudCBzZXQgdG8gYHRydWVgIGlmIHRoZSBgOi8vYCBhZnRlciB0aGUgc2NoZW1lIGlzIG9wdGlvbmFsXG4gKi9cbmZ1bmN0aW9uIGluaXQkMihjdXN0b21TY2hlbWVzKSB7XG4gIGlmIChjdXN0b21TY2hlbWVzID09PSB2b2lkIDApIHtcbiAgICBjdXN0b21TY2hlbWVzID0gW107XG4gIH1cbiAgLy8gRnJlcXVlbnRseSB1c2VkIHN0YXRlcyAobmFtZSBhcmd1bWVudCByZW1vdmVkIGR1cmluZyBtaW5pZmljYXRpb24pXG4gIC8qKiBAdHlwZSBDb2xsZWN0aW9uczxzdHJpbmc+ICovXG4gIGNvbnN0IGdyb3VwcyA9IHt9OyAvLyBvZiB0b2tlbnNcbiAgU3RhdGUuZ3JvdXBzID0gZ3JvdXBzO1xuICAvKiogQHR5cGUgU3RhdGU8c3RyaW5nPiAqL1xuICBjb25zdCBTdGFydCA9IG5ldyBTdGF0ZSgpO1xuICBpZiAodGxkcyA9PSBudWxsKSB7XG4gICAgdGxkcyA9IGRlY29kZVRsZHMoZW5jb2RlZFRsZHMpO1xuICB9XG4gIGlmICh1dGxkcyA9PSBudWxsKSB7XG4gICAgdXRsZHMgPSBkZWNvZGVUbGRzKGVuY29kZWRVdGxkcyk7XG4gIH1cblxuICAvLyBTdGF0ZXMgZm9yIHNwZWNpYWwgVVJMIHN5bWJvbHMgdGhhdCBhY2NlcHQgaW1tZWRpYXRlbHkgYWZ0ZXIgc3RhcnRcbiAgdHQoU3RhcnQsIFwiJ1wiLCBBUE9TVFJPUEhFKTtcbiAgdHQoU3RhcnQsICd7JywgT1BFTkJSQUNFKTtcbiAgdHQoU3RhcnQsICdbJywgT1BFTkJSQUNLRVQpO1xuICB0dChTdGFydCwgJzwnLCBPUEVOQU5HTEVCUkFDS0VUKTtcbiAgdHQoU3RhcnQsICcoJywgT1BFTlBBUkVOKTtcbiAgdHQoU3RhcnQsICd9JywgQ0xPU0VCUkFDRSk7XG4gIHR0KFN0YXJ0LCAnXScsIENMT1NFQlJBQ0tFVCk7XG4gIHR0KFN0YXJ0LCAnPicsIENMT1NFQU5HTEVCUkFDS0VUKTtcbiAgdHQoU3RhcnQsICcpJywgQ0xPU0VQQVJFTik7XG4gIHR0KFN0YXJ0LCAnJicsIEFNUEVSU0FORCk7XG4gIHR0KFN0YXJ0LCAnKicsIEFTVEVSSVNLKTtcbiAgdHQoU3RhcnQsICdAJywgQVQpO1xuICB0dChTdGFydCwgJ2AnLCBCQUNLVElDSyk7XG4gIHR0KFN0YXJ0LCAnXicsIENBUkVUKTtcbiAgdHQoU3RhcnQsICc6JywgQ09MT04pO1xuICB0dChTdGFydCwgJywnLCBDT01NQSk7XG4gIHR0KFN0YXJ0LCAnJCcsIERPTExBUik7XG4gIHR0KFN0YXJ0LCAnLicsIERPVCk7XG4gIHR0KFN0YXJ0LCAnPScsIEVRVUFMUyk7XG4gIHR0KFN0YXJ0LCAnIScsIEVYQ0xBTUFUSU9OKTtcbiAgdHQoU3RhcnQsICctJywgSFlQSEVOKTtcbiAgdHQoU3RhcnQsICclJywgUEVSQ0VOVCk7XG4gIHR0KFN0YXJ0LCAnfCcsIFBJUEUpO1xuICB0dChTdGFydCwgJysnLCBQTFVTKTtcbiAgdHQoU3RhcnQsICcjJywgUE9VTkQpO1xuICB0dChTdGFydCwgJz8nLCBRVUVSWSk7XG4gIHR0KFN0YXJ0LCAnXCInLCBRVU9URSk7XG4gIHR0KFN0YXJ0LCAnLycsIFNMQVNIKTtcbiAgdHQoU3RhcnQsICc7JywgU0VNSSk7XG4gIHR0KFN0YXJ0LCAnficsIFRJTERFKTtcbiAgdHQoU3RhcnQsICdfJywgVU5ERVJTQ09SRSk7XG4gIHR0KFN0YXJ0LCAnXFxcXCcsIEJBQ0tTTEFTSCk7XG4gIGNvbnN0IE51bSA9IHRyKFN0YXJ0LCBESUdJVCwgTlVNLCB7XG4gICAgW251bWVyaWNdOiB0cnVlXG4gIH0pO1xuICB0cihOdW0sIERJR0lULCBOdW0pO1xuXG4gIC8vIFN0YXRlIHdoaWNoIGVtaXRzIGEgd29yZCB0b2tlblxuICBjb25zdCBXb3JkID0gdHIoU3RhcnQsIEFTQ0lJX0xFVFRFUiwgV09SRCwge1xuICAgIFthc2NpaV06IHRydWVcbiAgfSk7XG4gIHRyKFdvcmQsIEFTQ0lJX0xFVFRFUiwgV29yZCk7XG5cbiAgLy8gU2FtZSBhcyBwcmV2aW91cywgYnV0IHNwZWNpZmljIHRvIG5vbi1mc20uYXNjaWkgYWxwaGFiZXQgd29yZHNcbiAgY29uc3QgVVdvcmQgPSB0cihTdGFydCwgTEVUVEVSLCBVV09SRCwge1xuICAgIFthbHBoYV06IHRydWVcbiAgfSk7XG4gIHRyKFVXb3JkLCBBU0NJSV9MRVRURVIpOyAvLyBOb24tYWNjZXB0aW5nXG4gIHRyKFVXb3JkLCBMRVRURVIsIFVXb3JkKTtcblxuICAvLyBXaGl0ZXNwYWNlIGp1bXBzXG4gIC8vIFRva2VucyBvZiBvbmx5IG5vbi1uZXdsaW5lIHdoaXRlc3BhY2UgYXJlIGFyYml0cmFyaWx5IGxvbmdcbiAgLy8gSWYgYW55IHdoaXRlc3BhY2UgZXhjZXB0IG5ld2xpbmUsIG1vcmUgd2hpdGVzcGFjZSFcbiAgY29uc3QgV3MgPSB0cihTdGFydCwgU1BBQ0UsIFdTLCB7XG4gICAgW3doaXRlc3BhY2VdOiB0cnVlXG4gIH0pO1xuICB0dChTdGFydCwgTkwsIE5MJDEsIHtcbiAgICBbd2hpdGVzcGFjZV06IHRydWVcbiAgfSk7XG4gIHR0KFdzLCBOTCk7IC8vIG5vbi1hY2NlcHRpbmcgc3RhdGUgdG8gYXZvaWQgbWl4aW5nIHdoaXRlc3BhY2VzXG4gIHRyKFdzLCBTUEFDRSwgV3MpO1xuXG4gIC8vIEVtb2ppIHRva2Vucy4gVGhleSBhcmUgbm90IGdyb3VwZWQgYnkgdGhlIHNjYW5uZXIgZXhjZXB0IGluIGNhc2VzIHdoZXJlIGFcbiAgLy8gemVyby13aWR0aCBqb2luZXIgaXMgcHJlc2VudFxuICBjb25zdCBFbW9qaSA9IHRyKFN0YXJ0LCBFTU9KSSwgRU1PSkkkMSwge1xuICAgIFtlbW9qaV06IHRydWVcbiAgfSk7XG4gIHRyKEVtb2ppLCBFTU9KSSwgRW1vamkpO1xuICB0dChFbW9qaSwgRU1PSklfVkFSSUFUSU9OLCBFbW9qaSk7XG4gIC8vIHR0KFN0YXJ0LCBFTU9KSV9WQVJJQVRJT04sIEVtb2ppKTsgLy8gVGhpcyBvbmUgaXMgc2tldGNoeVxuXG4gIGNvbnN0IEVtb2ppSm9pbmVyID0gdHQoRW1vamksIEVNT0pJX0pPSU5FUik7XG4gIHRyKEVtb2ppSm9pbmVyLCBFTU9KSSwgRW1vamkpO1xuICAvLyB0dChFbW9qaUpvaW5lciwgRU1PSklfVkFSSUFUSU9OLCBFbW9qaSk7IC8vIGFsc28gc2tldGNoeVxuXG4gIC8vIEdlbmVyYXRlcyBzdGF0ZXMgZm9yIHRvcC1sZXZlbCBkb21haW5zXG4gIC8vIE5vdGUgdGhhdCB0aGlzIGlzIG1vc3QgYWNjdXJhdGUgd2hlbiB0bGRzIGFyZSBpbiBhbHBoYWJldGljYWwgb3JkZXJcbiAgY29uc3Qgd29yZGpyID0gW1tBU0NJSV9MRVRURVIsIFdvcmRdXTtcbiAgY29uc3QgdXdvcmRqciA9IFtbQVNDSUlfTEVUVEVSLCBudWxsXSwgW0xFVFRFUiwgVVdvcmRdXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB0bGRzLmxlbmd0aDsgaSsrKSB7XG4gICAgZmFzdHRzKFN0YXJ0LCB0bGRzW2ldLCBUTEQsIFdPUkQsIHdvcmRqcik7XG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB1dGxkcy5sZW5ndGg7IGkrKykge1xuICAgIGZhc3R0cyhTdGFydCwgdXRsZHNbaV0sIFVUTEQsIFVXT1JELCB1d29yZGpyKTtcbiAgfVxuICBhZGRUb0dyb3VwcyhUTEQsIHtcbiAgICB0bGQ6IHRydWUsXG4gICAgYXNjaWk6IHRydWVcbiAgfSwgZ3JvdXBzKTtcbiAgYWRkVG9Hcm91cHMoVVRMRCwge1xuICAgIHV0bGQ6IHRydWUsXG4gICAgYWxwaGE6IHRydWVcbiAgfSwgZ3JvdXBzKTtcblxuICAvLyBDb2xsZWN0IHRoZSBzdGF0ZXMgZ2VuZXJhdGVkIGJ5IGRpZmZlcmVudCBwcm90b2NvbHMuIE5PVEU6IElmIGFueSBuZXcgVExEc1xuICAvLyBnZXQgYWRkZWQgdGhhdCBhcmUgYWxzbyBwcm90b2NvbHMsIHNldCB0aGUgdG9rZW4gdG8gYmUgdGhlIHNhbWUgYXMgdGhlXG4gIC8vIHByb3RvY29sIHRvIGVuc3VyZSBwYXJzaW5nIHdvcmtzIGFzIGV4cGVjdGVkLlxuICBmYXN0dHMoU3RhcnQsICdmaWxlJywgU0NIRU1FLCBXT1JELCB3b3JkanIpO1xuICBmYXN0dHMoU3RhcnQsICdtYWlsdG8nLCBTQ0hFTUUsIFdPUkQsIHdvcmRqcik7XG4gIGZhc3R0cyhTdGFydCwgJ2h0dHAnLCBTTEFTSF9TQ0hFTUUsIFdPUkQsIHdvcmRqcik7XG4gIGZhc3R0cyhTdGFydCwgJ2h0dHBzJywgU0xBU0hfU0NIRU1FLCBXT1JELCB3b3JkanIpO1xuICBmYXN0dHMoU3RhcnQsICdmdHAnLCBTTEFTSF9TQ0hFTUUsIFdPUkQsIHdvcmRqcik7XG4gIGZhc3R0cyhTdGFydCwgJ2Z0cHMnLCBTTEFTSF9TQ0hFTUUsIFdPUkQsIHdvcmRqcik7XG4gIGFkZFRvR3JvdXBzKFNDSEVNRSwge1xuICAgIHNjaGVtZTogdHJ1ZSxcbiAgICBhc2NpaTogdHJ1ZVxuICB9LCBncm91cHMpO1xuICBhZGRUb0dyb3VwcyhTTEFTSF9TQ0hFTUUsIHtcbiAgICBzbGFzaHNjaGVtZTogdHJ1ZSxcbiAgICBhc2NpaTogdHJ1ZVxuICB9LCBncm91cHMpO1xuXG4gIC8vIFJlZ2lzdGVyIGN1c3RvbSBzY2hlbWVzLiBBc3N1bWVzIGVhY2ggc2NoZW1lIGlzIGFzY2lpbnVtZXJpYyB3aXRoIGh5cGhlbnNcbiAgY3VzdG9tU2NoZW1lcyA9IGN1c3RvbVNjaGVtZXMuc29ydCgoYSwgYikgPT4gYVswXSA+IGJbMF0gPyAxIDogLTEpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGN1c3RvbVNjaGVtZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBzY2ggPSBjdXN0b21TY2hlbWVzW2ldWzBdO1xuICAgIGNvbnN0IG9wdGlvbmFsU2xhc2hTbGFzaCA9IGN1c3RvbVNjaGVtZXNbaV1bMV07XG4gICAgY29uc3QgZmxhZ3MgPSBvcHRpb25hbFNsYXNoU2xhc2ggPyB7XG4gICAgICBbc2NoZW1lXTogdHJ1ZVxuICAgIH0gOiB7XG4gICAgICBbc2xhc2hzY2hlbWVdOiB0cnVlXG4gICAgfTtcbiAgICBpZiAoc2NoLmluZGV4T2YoJy0nKSA+PSAwKSB7XG4gICAgICBmbGFnc1tkb21haW5dID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKCFBU0NJSV9MRVRURVIudGVzdChzY2gpKSB7XG4gICAgICBmbGFnc1tudW1lcmljXSA9IHRydWU7IC8vIG51bWJlcnMgb25seVxuICAgIH0gZWxzZSBpZiAoRElHSVQudGVzdChzY2gpKSB7XG4gICAgICBmbGFnc1thc2NpaW51bWVyaWNdID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgZmxhZ3NbYXNjaWldID0gdHJ1ZTtcbiAgICB9XG4gICAgdHMoU3RhcnQsIHNjaCwgc2NoLCBmbGFncyk7XG4gIH1cblxuICAvLyBMb2NhbGhvc3QgdG9rZW5cbiAgdHMoU3RhcnQsICdsb2NhbGhvc3QnLCBMT0NBTEhPU1QsIHtcbiAgICBhc2NpaTogdHJ1ZVxuICB9KTtcblxuICAvLyBTZXQgZGVmYXVsdCB0cmFuc2l0aW9uIGZvciBzdGFydCBzdGF0ZSAoc29tZSBzeW1ib2wpXG4gIFN0YXJ0LmpkID0gbmV3IFN0YXRlKFNZTSk7XG4gIHJldHVybiB7XG4gICAgc3RhcnQ6IFN0YXJ0LFxuICAgIHRva2VuczogYXNzaWduKHtcbiAgICAgIGdyb3Vwc1xuICAgIH0sIHRrKVxuICB9O1xufVxuXG4vKipcblx0R2l2ZW4gYSBzdHJpbmcsIHJldHVybnMgYW4gYXJyYXkgb2YgVE9LRU4gaW5zdGFuY2VzIHJlcHJlc2VudGluZyB0aGVcblx0Y29tcG9zaXRpb24gb2YgdGhhdCBzdHJpbmcuXG5cblx0QG1ldGhvZCBydW5cblx0QHBhcmFtIHtTdGF0ZTxzdHJpbmc+fSBzdGFydCBzY2FubmVyIHN0YXJ0aW5nIHN0YXRlXG5cdEBwYXJhbSB7c3RyaW5nfSBzdHIgaW5wdXQgc3RyaW5nIHRvIHNjYW5cblx0QHJldHVybiB7VG9rZW5bXX0gbGlzdCBvZiB0b2tlbnMsIGVhY2ggd2l0aCBhIHR5cGUgYW5kIHZhbHVlXG4qL1xuZnVuY3Rpb24gcnVuJDEoc3RhcnQsIHN0cikge1xuICAvLyBTdGF0ZSBtYWNoaW5lIGlzIG5vdCBjYXNlIHNlbnNpdGl2ZSwgc28gaW5wdXQgaXMgdG9rZW5pemVkIGluIGxvd2VyY2FzZWRcbiAgLy8gZm9ybSAoc3RpbGwgcmV0dXJucyByZWd1bGFyIGNhc2UpLiBVc2VzIHNlbGVjdGl2ZSBgdG9Mb3dlckNhc2VgIGJlY2F1c2VcbiAgLy8gbG93ZXJjYXNpbmcgdGhlIGVudGlyZSBzdHJpbmcgY2F1c2VzIHRoZSBsZW5ndGggYW5kIGNoYXJhY3RlciBwb3NpdGlvbiB0b1xuICAvLyB2YXJ5IGluIHNvbWUgbm9uLUVuZ2xpc2ggc3RyaW5ncyB3aXRoIFY4LWJhc2VkIHJ1bnRpbWVzLlxuICBjb25zdCBpdGVyYWJsZSA9IHN0cmluZ1RvQXJyYXkoc3RyLnJlcGxhY2UoL1tBLVpdL2csIGMgPT4gYy50b0xvd2VyQ2FzZSgpKSk7XG4gIGNvbnN0IGNoYXJDb3VudCA9IGl0ZXJhYmxlLmxlbmd0aDsgLy8gPD0gbGVuIGlmIHRoZXJlIGFyZSBlbW9qaXMsIGV0Y1xuICBjb25zdCB0b2tlbnMgPSBbXTsgLy8gcmV0dXJuIHZhbHVlXG5cbiAgLy8gY3Vyc29yIHRocm91Z2ggdGhlIHN0cmluZyBpdHNlbGYsIGFjY291bnRpbmcgZm9yIGNoYXJhY3RlcnMgdGhhdCBoYXZlXG4gIC8vIHdpZHRoIHdpdGggbGVuZ3RoIDIgc3VjaCBhcyBlbW9qaXNcbiAgbGV0IGN1cnNvciA9IDA7XG5cbiAgLy8gQ3Vyc29yIHRocm91Z2ggdGhlIGFycmF5LXJlcHJlc2VudGF0aW9uIG9mIHRoZSBzdHJpbmdcbiAgbGV0IGNoYXJDdXJzb3IgPSAwO1xuXG4gIC8vIFRva2VuaXplIHRoZSBzdHJpbmdcbiAgd2hpbGUgKGNoYXJDdXJzb3IgPCBjaGFyQ291bnQpIHtcbiAgICBsZXQgc3RhdGUgPSBzdGFydDtcbiAgICBsZXQgbmV4dFN0YXRlID0gbnVsbDtcbiAgICBsZXQgdG9rZW5MZW5ndGggPSAwO1xuICAgIGxldCBsYXRlc3RBY2NlcHRpbmcgPSBudWxsO1xuICAgIGxldCBzaW5jZUFjY2VwdHMgPSAtMTtcbiAgICBsZXQgY2hhcnNTaW5jZUFjY2VwdHMgPSAtMTtcbiAgICB3aGlsZSAoY2hhckN1cnNvciA8IGNoYXJDb3VudCAmJiAobmV4dFN0YXRlID0gc3RhdGUuZ28oaXRlcmFibGVbY2hhckN1cnNvcl0pKSkge1xuICAgICAgc3RhdGUgPSBuZXh0U3RhdGU7XG5cbiAgICAgIC8vIEtlZXAgdHJhY2sgb2YgdGhlIGxhdGVzdCBhY2NlcHRpbmcgc3RhdGVcbiAgICAgIGlmIChzdGF0ZS5hY2NlcHRzKCkpIHtcbiAgICAgICAgc2luY2VBY2NlcHRzID0gMDtcbiAgICAgICAgY2hhcnNTaW5jZUFjY2VwdHMgPSAwO1xuICAgICAgICBsYXRlc3RBY2NlcHRpbmcgPSBzdGF0ZTtcbiAgICAgIH0gZWxzZSBpZiAoc2luY2VBY2NlcHRzID49IDApIHtcbiAgICAgICAgc2luY2VBY2NlcHRzICs9IGl0ZXJhYmxlW2NoYXJDdXJzb3JdLmxlbmd0aDtcbiAgICAgICAgY2hhcnNTaW5jZUFjY2VwdHMrKztcbiAgICAgIH1cbiAgICAgIHRva2VuTGVuZ3RoICs9IGl0ZXJhYmxlW2NoYXJDdXJzb3JdLmxlbmd0aDtcbiAgICAgIGN1cnNvciArPSBpdGVyYWJsZVtjaGFyQ3Vyc29yXS5sZW5ndGg7XG4gICAgICBjaGFyQ3Vyc29yKys7XG4gICAgfVxuXG4gICAgLy8gUm9sbCBiYWNrIHRvIHRoZSBsYXRlc3QgYWNjZXB0aW5nIHN0YXRlXG4gICAgY3Vyc29yIC09IHNpbmNlQWNjZXB0cztcbiAgICBjaGFyQ3Vyc29yIC09IGNoYXJzU2luY2VBY2NlcHRzO1xuICAgIHRva2VuTGVuZ3RoIC09IHNpbmNlQWNjZXB0cztcblxuICAgIC8vIE5vIG1vcmUganVtcHMsIGp1c3QgbWFrZSBhIG5ldyB0b2tlbiBmcm9tIHRoZSBsYXN0IGFjY2VwdGluZyBvbmVcbiAgICB0b2tlbnMucHVzaCh7XG4gICAgICB0OiBsYXRlc3RBY2NlcHRpbmcudCxcbiAgICAgIC8vIHRva2VuIHR5cGUvbmFtZVxuICAgICAgdjogc3RyLnNsaWNlKGN1cnNvciAtIHRva2VuTGVuZ3RoLCBjdXJzb3IpLFxuICAgICAgLy8gc3RyaW5nIHZhbHVlXG4gICAgICBzOiBjdXJzb3IgLSB0b2tlbkxlbmd0aCxcbiAgICAgIC8vIHN0YXJ0IGluZGV4XG4gICAgICBlOiBjdXJzb3IgLy8gZW5kIGluZGV4IChleGNsdWRpbmcpXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gdG9rZW5zO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYSBTdHJpbmcgdG8gYW4gQXJyYXkgb2YgY2hhcmFjdGVycywgdGFraW5nIGludG8gYWNjb3VudCB0aGF0IHNvbWVcbiAqIGNoYXJhY3RlcnMgbGlrZSBlbW9qaXMgdGFrZSB1cCB0d28gc3RyaW5nIGluZGV4ZXMuXG4gKlxuICogQWRhcHRlZCBmcm9tIGNvcmUtanMgKE1JVCBsaWNlbnNlKVxuICogaHR0cHM6Ly9naXRodWIuY29tL3psb2lyb2NrL2NvcmUtanMvYmxvYi8yZDY5Y2Y1Zjk5YWIzZWEzNDYzYzM5NWRmODFlNWExNWI2OGY0OWQ5L3BhY2thZ2VzL2NvcmUtanMvaW50ZXJuYWxzL3N0cmluZy1tdWx0aWJ5dGUuanNcbiAqXG4gKiBAZnVuY3Rpb24gc3RyaW5nVG9BcnJheVxuICogQHBhcmFtIHtzdHJpbmd9IHN0clxuICogQHJldHVybnMge3N0cmluZ1tdfVxuICovXG5mdW5jdGlvbiBzdHJpbmdUb0FycmF5KHN0cikge1xuICBjb25zdCByZXN1bHQgPSBbXTtcbiAgY29uc3QgbGVuID0gc3RyLmxlbmd0aDtcbiAgbGV0IGluZGV4ID0gMDtcbiAgd2hpbGUgKGluZGV4IDwgbGVuKSB7XG4gICAgbGV0IGZpcnN0ID0gc3RyLmNoYXJDb2RlQXQoaW5kZXgpO1xuICAgIGxldCBzZWNvbmQ7XG4gICAgbGV0IGNoYXIgPSBmaXJzdCA8IDB4ZDgwMCB8fCBmaXJzdCA+IDB4ZGJmZiB8fCBpbmRleCArIDEgPT09IGxlbiB8fCAoc2Vjb25kID0gc3RyLmNoYXJDb2RlQXQoaW5kZXggKyAxKSkgPCAweGRjMDAgfHwgc2Vjb25kID4gMHhkZmZmID8gc3RyW2luZGV4XSAvLyBzaW5nbGUgY2hhcmFjdGVyXG4gICAgOiBzdHIuc2xpY2UoaW5kZXgsIGluZGV4ICsgMik7IC8vIHR3by1pbmRleCBjaGFyYWN0ZXJzXG4gICAgcmVzdWx0LnB1c2goY2hhcik7XG4gICAgaW5kZXggKz0gY2hhci5sZW5ndGg7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBGYXN0IHZlcnNpb24gb2YgdHMgZnVuY3Rpb24gZm9yIHdoZW4gdHJhbnNpdGlvbiBkZWZhdWx0cyBhcmUgd2VsbCBrbm93blxuICogQHBhcmFtIHtTdGF0ZTxzdHJpbmc+fSBzdGF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IGlucHV0XG4gKiBAcGFyYW0ge3N0cmluZ30gdFxuICogQHBhcmFtIHtzdHJpbmd9IGRlZmF1bHR0XG4gKiBAcGFyYW0ge1tSZWdFeHAsIFN0YXRlPHN0cmluZz5dW119IGpyXG4gKiBAcmV0dXJucyB7U3RhdGU8c3RyaW5nPn1cbiAqL1xuZnVuY3Rpb24gZmFzdHRzKHN0YXRlLCBpbnB1dCwgdCwgZGVmYXVsdHQsIGpyKSB7XG4gIGxldCBuZXh0O1xuICBjb25zdCBsZW4gPSBpbnB1dC5sZW5ndGg7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuIC0gMTsgaSsrKSB7XG4gICAgY29uc3QgY2hhciA9IGlucHV0W2ldO1xuICAgIGlmIChzdGF0ZS5qW2NoYXJdKSB7XG4gICAgICBuZXh0ID0gc3RhdGUualtjaGFyXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV4dCA9IG5ldyBTdGF0ZShkZWZhdWx0dCk7XG4gICAgICBuZXh0LmpyID0ganIuc2xpY2UoKTtcbiAgICAgIHN0YXRlLmpbY2hhcl0gPSBuZXh0O1xuICAgIH1cbiAgICBzdGF0ZSA9IG5leHQ7XG4gIH1cbiAgbmV4dCA9IG5ldyBTdGF0ZSh0KTtcbiAgbmV4dC5qciA9IGpyLnNsaWNlKCk7XG4gIHN0YXRlLmpbaW5wdXRbbGVuIC0gMV1dID0gbmV4dDtcbiAgcmV0dXJuIG5leHQ7XG59XG5cbi8qKlxuICogQ29udmVydHMgYSBzdHJpbmcgb2YgVG9wLUxldmVsIERvbWFpbiBuYW1lcyBlbmNvZGVkIGluIHVwZGF0ZS10bGRzLmpzIGJhY2tcbiAqIGludG8gYSBsaXN0IG9mIHN0cmluZ3MuXG4gKiBAcGFyYW0ge3N0cn0gZW5jb2RlZCBlbmNvZGVkIFRMRHMgc3RyaW5nXG4gKiBAcmV0dXJucyB7c3RyW119IG9yaWdpbmFsIFRMRHMgbGlzdFxuICovXG5mdW5jdGlvbiBkZWNvZGVUbGRzKGVuY29kZWQpIHtcbiAgY29uc3Qgd29yZHMgPSBbXTtcbiAgY29uc3Qgc3RhY2sgPSBbXTtcbiAgbGV0IGkgPSAwO1xuICBsZXQgZGlnaXRzID0gJzAxMjM0NTY3ODknO1xuICB3aGlsZSAoaSA8IGVuY29kZWQubGVuZ3RoKSB7XG4gICAgbGV0IHBvcERpZ2l0Q291bnQgPSAwO1xuICAgIHdoaWxlIChkaWdpdHMuaW5kZXhPZihlbmNvZGVkW2kgKyBwb3BEaWdpdENvdW50XSkgPj0gMCkge1xuICAgICAgcG9wRGlnaXRDb3VudCsrOyAvLyBlbmNvdW50ZXJlZCBzb21lIGRpZ2l0cywgaGF2ZSB0byBwb3AgdG8gZ28gb25lIGxldmVsIHVwIHRyaWVcbiAgICB9XG5cbiAgICBpZiAocG9wRGlnaXRDb3VudCA+IDApIHtcbiAgICAgIHdvcmRzLnB1c2goc3RhY2suam9pbignJykpOyAvLyB3aGF0ZXZlciBwcmVjZWRlZCB0aGUgcG9wIGRpZ2l0cyBtdXN0IGJlIGEgd29yZFxuICAgICAgZm9yIChsZXQgcG9wQ291bnQgPSBwYXJzZUludChlbmNvZGVkLnN1YnN0cmluZyhpLCBpICsgcG9wRGlnaXRDb3VudCksIDEwKTsgcG9wQ291bnQgPiAwOyBwb3BDb3VudC0tKSB7XG4gICAgICAgIHN0YWNrLnBvcCgpO1xuICAgICAgfVxuICAgICAgaSArPSBwb3BEaWdpdENvdW50O1xuICAgIH0gZWxzZSB7XG4gICAgICBzdGFjay5wdXNoKGVuY29kZWRbaV0pOyAvLyBkcm9wIGRvd24gYSBsZXZlbCBpbnRvIHRoZSB0cmllXG4gICAgICBpKys7XG4gICAgfVxuICB9XG4gIHJldHVybiB3b3Jkcztcbn1cblxuLyoqXG4gKiBBbiBvYmplY3Qgd2hlcmUgZWFjaCBrZXkgaXMgYSB2YWxpZCBET00gRXZlbnQgTmFtZSBzdWNoIGFzIGBjbGlja2Agb3IgYGZvY3VzYFxuICogYW5kIGVhY2ggdmFsdWUgaXMgYW4gZXZlbnQgaGFuZGxlciBmdW5jdGlvbi5cbiAqXG4gKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvRWxlbWVudCNldmVudHNcbiAqIEB0eXBlZGVmIHs/eyBbZXZlbnQ6IHN0cmluZ106IEZ1bmN0aW9uIH19IEV2ZW50TGlzdGVuZXJzXG4gKi9cblxuLyoqXG4gKiBBbGwgZm9ybWF0dGVkIHByb3BlcnRpZXMgcmVxdWlyZWQgdG8gcmVuZGVyIGEgbGluaywgaW5jbHVkaW5nIGB0YWdOYW1lYCxcbiAqIGBhdHRyaWJ1dGVzYCwgYGNvbnRlbnRgIGFuZCBgZXZlbnRMaXN0ZW5lcnNgLlxuICogQHR5cGVkZWYge3sgdGFnTmFtZTogYW55LCBhdHRyaWJ1dGVzOiB7W2F0dHI6IHN0cmluZ106IGFueX0sIGNvbnRlbnQ6IHN0cmluZyxcbiAqIGV2ZW50TGlzdGVuZXJzOiBFdmVudExpc3RlbmVycyB9fSBJbnRlcm1lZGlhdGVSZXByZXNlbnRhdGlvblxuICovXG5cbi8qKlxuICogU3BlY2lmeSBlaXRoZXIgYW4gb2JqZWN0IGRlc2NyaWJlZCBieSB0aGUgdGVtcGxhdGUgdHlwZSBgT2Agb3IgYSBmdW5jdGlvbi5cbiAqXG4gKiBUaGUgZnVuY3Rpb24gdGFrZXMgYSBzdHJpbmcgdmFsdWUgKHVzdWFsbHkgdGhlIGxpbmsncyBocmVmIGF0dHJpYnV0ZSksIHRoZVxuICogbGluayB0eXBlIChgJ3VybCdgLCBgJ2hhc2h0YWdgJywgZXRjLikgYW5kIGFuIGludGVybmFsIHRva2VuIHJlcHJlc2VudGF0aW9uXG4gKiBvZiB0aGUgbGluay4gSXQgc2hvdWxkIHJldHVybiBhbiBvYmplY3Qgb2YgdGhlIHRlbXBsYXRlIHR5cGUgYE9gXG4gKiBAdGVtcGxhdGUgT1xuICogQHR5cGVkZWYge08gfCAoKHZhbHVlOiBzdHJpbmcsIHR5cGU6IHN0cmluZywgdG9rZW46IE11bHRpVG9rZW4pID0+IE8pfSBPcHRPYmpcbiAqL1xuXG4vKipcbiAqIFNwZWNpZnkgZWl0aGVyIGEgZnVuY3Rpb24gZGVzY3JpYmVkIGJ5IHRlbXBsYXRlIHR5cGUgYEZgIG9yIGFuIG9iamVjdC5cbiAqXG4gKiBFYWNoIGtleSBpbiB0aGUgb2JqZWN0IHNob3VsZCBiZSBhIGxpbmsgdHlwZSAoYCd1cmwnYCwgYCdoYXNodGFnYCcsIGV0Yy4pLiBFYWNoXG4gKiB2YWx1ZSBzaG91bGQgYmUgYSBmdW5jdGlvbiB3aXRoIHRlbXBsYXRlIHR5cGUgYEZgIHRoYXQgaXMgY2FsbGVkIHdoZW4gdGhlXG4gKiBjb3JyZXNwb25kaW5nIGxpbmsgdHlwZSBpcyBlbmNvdW50ZXJlZC5cbiAqIEB0ZW1wbGF0ZSBGXG4gKiBAdHlwZWRlZiB7RiB8IHsgW3R5cGU6IHN0cmluZ106IEZ9fSBPcHRGblxuICovXG5cbi8qKlxuICogU3BlY2lmeSBlaXRoZXIgYSB2YWx1ZSB3aXRoIHRlbXBsYXRlIHR5cGUgYFZgLCBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBgVmAgb3JcbiAqIGFuIG9iamVjdCB3aGVyZSBlYWNoIHZhbHVlIHJlc29sdmVzIHRvIGBWYC5cbiAqXG4gKiBUaGUgZnVuY3Rpb24gdGFrZXMgYSBzdHJpbmcgdmFsdWUgKHVzdWFsbHkgdGhlIGxpbmsncyBocmVmIGF0dHJpYnV0ZSksIHRoZVxuICogbGluayB0eXBlIChgJ3VybCdgLCBgJ2hhc2h0YWdgJywgZXRjLikgYW5kIGFuIGludGVybmFsIHRva2VuIHJlcHJlc2VudGF0aW9uXG4gKiBvZiB0aGUgbGluay4gSXQgc2hvdWxkIHJldHVybiBhbiBvYmplY3Qgb2YgdGhlIHRlbXBsYXRlIHR5cGUgYFZgXG4gKlxuICogRm9yIHRoZSBvYmplY3QsIGVhY2gga2V5IHNob3VsZCBiZSBhIGxpbmsgdHlwZSAoYCd1cmwnYCwgYCdoYXNodGFnYCcsIGV0Yy4pLlxuICogRWFjaCB2YWx1ZSBzaG91bGQgZWl0aGVyIGhhdmUgdHlwZSBgVmAgb3IgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgVi4gVGhpc1xuICogZnVuY3Rpb24gc2ltaWxhcmx5IHRha2VzIGEgc3RyaW5nIHZhbHVlIGFuZCBhIHRva2VuLlxuICpcbiAqIEV4YW1wbGUgdmFsaWQgdHlwZXMgZm9yIGBPcHQ8c3RyaW5nPmA6XG4gKlxuICogYGBganNcbiAqICdoZWxsbydcbiAqICh2YWx1ZSwgdHlwZSwgdG9rZW4pID0+ICd3b3JsZCdcbiAqIHsgdXJsOiAnaGVsbG8nLCBlbWFpbDogKHZhbHVlLCB0b2tlbikgPT4gJ3dvcmxkJ31cbiAqIGBgYFxuICogQHRlbXBsYXRlIFZcbiAqIEB0eXBlZGVmIHtWIHwgKCh2YWx1ZTogc3RyaW5nLCB0eXBlOiBzdHJpbmcsIHRva2VuOiBNdWx0aVRva2VuKSA9PiBWKSB8IHsgW3R5cGU6IHN0cmluZ106IFYgfCAoKHZhbHVlOiBzdHJpbmcsIHRva2VuOiBNdWx0aVRva2VuKSA9PiBWKSB9fSBPcHRcbiAqL1xuXG4vKipcbiAqIFNlZSBhdmFpbGFibGUgb3B0aW9uczogaHR0cHM6Ly9saW5raWZ5LmpzLm9yZy9kb2NzL29wdGlvbnMuaHRtbFxuICogQHR5cGVkZWYge3tcbiAqIFx0ZGVmYXVsdFByb3RvY29sPzogc3RyaW5nLFxuICogIGV2ZW50cz86IE9wdE9iajxFdmVudExpc3RlbmVycz4sXG4gKiBcdGZvcm1hdD86IE9wdDxzdHJpbmc+LFxuICogXHRmb3JtYXRIcmVmPzogT3B0PHN0cmluZz4sXG4gKiBcdG5sMmJyPzogYm9vbGVhbixcbiAqIFx0dGFnTmFtZT86IE9wdDxhbnk+LFxuICogXHR0YXJnZXQ/OiBPcHQ8c3RyaW5nPixcbiAqIFx0cmVsPzogT3B0PHN0cmluZz4sXG4gKiBcdHZhbGlkYXRlPzogT3B0PGJvb2xlYW4+LFxuICogXHR0cnVuY2F0ZT86IE9wdDxudW1iZXI+LFxuICogXHRjbGFzc05hbWU/OiBPcHQ8c3RyaW5nPixcbiAqIFx0YXR0cmlidXRlcz86IE9wdE9iajwoeyBbYXR0cjogc3RyaW5nXTogYW55IH0pPixcbiAqICBpZ25vcmVUYWdzPzogc3RyaW5nW10sXG4gKiBcdHJlbmRlcj86IE9wdEZuPCgoaXI6IEludGVybWVkaWF0ZVJlcHJlc2VudGF0aW9uKSA9PiBhbnkpPlxuICogfX0gT3B0c1xuICovXG5cbi8qKlxuICogQHR5cGUgUmVxdWlyZWQ8T3B0cz5cbiAqL1xuY29uc3QgZGVmYXVsdHMgPSB7XG4gIGRlZmF1bHRQcm90b2NvbDogJ2h0dHAnLFxuICBldmVudHM6IG51bGwsXG4gIGZvcm1hdDogbm9vcCxcbiAgZm9ybWF0SHJlZjogbm9vcCxcbiAgbmwyYnI6IGZhbHNlLFxuICB0YWdOYW1lOiAnYScsXG4gIHRhcmdldDogbnVsbCxcbiAgcmVsOiBudWxsLFxuICB2YWxpZGF0ZTogdHJ1ZSxcbiAgdHJ1bmNhdGU6IEluZmluaXR5LFxuICBjbGFzc05hbWU6IG51bGwsXG4gIGF0dHJpYnV0ZXM6IG51bGwsXG4gIGlnbm9yZVRhZ3M6IFtdLFxuICByZW5kZXI6IG51bGxcbn07XG5cbi8qKlxuICogVXRpbGl0eSBjbGFzcyBmb3IgbGlua2lmeSBpbnRlcmZhY2VzIHRvIGFwcGx5IHNwZWNpZmllZFxuICoge0BsaW5rIE9wdHMgZm9ybWF0dGluZyBhbmQgcmVuZGVyaW5nIG9wdGlvbnN9LlxuICpcbiAqIEBwYXJhbSB7T3B0cyB8IE9wdGlvbnN9IFtvcHRzXSBPcHRpb24gdmFsdWUgb3ZlcnJpZGVzLlxuICogQHBhcmFtIHsoaXI6IEludGVybWVkaWF0ZVJlcHJlc2VudGF0aW9uKSA9PiBhbnl9IFtkZWZhdWx0UmVuZGVyXSAoRm9yXG4gKiAgIGludGVybmFsIHVzZSkgZGVmYXVsdCByZW5kZXIgZnVuY3Rpb24gdGhhdCBkZXRlcm1pbmVzIGhvdyB0byBnZW5lcmF0ZSBhblxuICogICBIVE1MIGVsZW1lbnQgYmFzZWQgb24gYSBsaW5rIHRva2VuJ3MgZGVyaXZlZCB0YWdOYW1lLCBhdHRyaWJ1dGVzIGFuZCBIVE1MLlxuICogICBTaW1pbGFyIHRvIHJlbmRlciBvcHRpb25cbiAqL1xuZnVuY3Rpb24gT3B0aW9ucyhvcHRzLCBkZWZhdWx0UmVuZGVyKSB7XG4gIGlmIChkZWZhdWx0UmVuZGVyID09PSB2b2lkIDApIHtcbiAgICBkZWZhdWx0UmVuZGVyID0gbnVsbDtcbiAgfVxuICBsZXQgbyA9IGFzc2lnbih7fSwgZGVmYXVsdHMpO1xuICBpZiAob3B0cykge1xuICAgIG8gPSBhc3NpZ24obywgb3B0cyBpbnN0YW5jZW9mIE9wdGlvbnMgPyBvcHRzLm8gOiBvcHRzKTtcbiAgfVxuXG4gIC8vIEVuc3VyZSBhbGwgaWdub3JlZCB0YWdzIGFyZSB1cHBlcmNhc2VcbiAgY29uc3QgaWdub3JlZFRhZ3MgPSBvLmlnbm9yZVRhZ3M7XG4gIGNvbnN0IHVwcGVyY2FzZUlnbm9yZWRUYWdzID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgaWdub3JlZFRhZ3MubGVuZ3RoOyBpKyspIHtcbiAgICB1cHBlcmNhc2VJZ25vcmVkVGFncy5wdXNoKGlnbm9yZWRUYWdzW2ldLnRvVXBwZXJDYXNlKCkpO1xuICB9XG4gIC8qKiBAcHJvdGVjdGVkICovXG4gIHRoaXMubyA9IG87XG4gIGlmIChkZWZhdWx0UmVuZGVyKSB7XG4gICAgdGhpcy5kZWZhdWx0UmVuZGVyID0gZGVmYXVsdFJlbmRlcjtcbiAgfVxuICB0aGlzLmlnbm9yZVRhZ3MgPSB1cHBlcmNhc2VJZ25vcmVkVGFncztcbn1cbk9wdGlvbnMucHJvdG90eXBlID0ge1xuICBvOiBkZWZhdWx0cyxcbiAgLyoqXG4gICAqIEB0eXBlIHN0cmluZ1tdXG4gICAqL1xuICBpZ25vcmVUYWdzOiBbXSxcbiAgLyoqXG4gICAqIEBwYXJhbSB7SW50ZXJtZWRpYXRlUmVwcmVzZW50YXRpb259IGlyXG4gICAqIEByZXR1cm5zIHthbnl9XG4gICAqL1xuICBkZWZhdWx0UmVuZGVyKGlyKSB7XG4gICAgcmV0dXJuIGlyO1xuICB9LFxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIG9yIGZhbHNlIGJhc2VkIG9uIHdoZXRoZXIgYSB0b2tlbiBzaG91bGQgYmUgZGlzcGxheWVkIGFzIGFcbiAgICogbGluayBiYXNlZCBvbiB0aGUgdXNlciBvcHRpb25zLlxuICAgKiBAcGFyYW0ge011bHRpVG9rZW59IHRva2VuXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgY2hlY2sodG9rZW4pIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3ZhbGlkYXRlJywgdG9rZW4udG9TdHJpbmcoKSwgdG9rZW4pO1xuICB9LFxuICAvLyBQcml2YXRlIG1ldGhvZHNcblxuICAvKipcbiAgICogUmVzb2x2ZSBhbiBvcHRpb24ncyB2YWx1ZSBiYXNlZCBvbiB0aGUgdmFsdWUgb2YgdGhlIG9wdGlvbiBhbmQgdGhlIGdpdmVuXG4gICAqIHBhcmFtcy4gSWYgb3BlcmF0b3IgYW5kIHRva2VuIGFyZSBzcGVjaWZpZWQgYW5kIHRoZSB0YXJnZXQgb3B0aW9uIGlzXG4gICAqIGNhbGxhYmxlLCBhdXRvbWF0aWNhbGx5IGNhbGxzIHRoZSBmdW5jdGlvbiB3aXRoIHRoZSBnaXZlbiBhcmd1bWVudC5cbiAgICogQHRlbXBsYXRlIHtrZXlvZiBPcHRzfSBLXG4gICAqIEBwYXJhbSB7S30ga2V5IE5hbWUgb2Ygb3B0aW9uIHRvIHVzZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gW29wZXJhdG9yXSB3aWxsIGJlIHBhc3NlZCB0byB0aGUgdGFyZ2V0IG9wdGlvbiBpZiBpdCdzIGFcbiAgICogZnVuY3Rpb24uIElmIG5vdCBzcGVjaWZpZWQsIFJBVyBmdW5jdGlvbiB2YWx1ZSBnZXRzIHJldHVybmVkXG4gICAqIEBwYXJhbSB7TXVsdGlUb2tlbn0gW3Rva2VuXSBUaGUgdG9rZW4gZnJvbSBsaW5raWZ5LnRva2VuaXplXG4gICAqIEByZXR1cm5zIHtPcHRzW0tdIHwgYW55fVxuICAgKi9cbiAgZ2V0KGtleSwgb3BlcmF0b3IsIHRva2VuKSB7XG4gICAgY29uc3QgaXNDYWxsYWJsZSA9IG9wZXJhdG9yICE9IG51bGw7XG4gICAgbGV0IG9wdGlvbiA9IHRoaXMub1trZXldO1xuICAgIGlmICghb3B0aW9uKSB7XG4gICAgICByZXR1cm4gb3B0aW9uO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIG9wdGlvbiA9PT0gJ29iamVjdCcpIHtcbiAgICAgIG9wdGlvbiA9IHRva2VuLnQgaW4gb3B0aW9uID8gb3B0aW9uW3Rva2VuLnRdIDogZGVmYXVsdHNba2V5XTtcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09PSAnZnVuY3Rpb24nICYmIGlzQ2FsbGFibGUpIHtcbiAgICAgICAgb3B0aW9uID0gb3B0aW9uKG9wZXJhdG9yLCB0b2tlbik7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygb3B0aW9uID09PSAnZnVuY3Rpb24nICYmIGlzQ2FsbGFibGUpIHtcbiAgICAgIG9wdGlvbiA9IG9wdGlvbihvcGVyYXRvciwgdG9rZW4udCwgdG9rZW4pO1xuICAgIH1cbiAgICByZXR1cm4gb3B0aW9uO1xuICB9LFxuICAvKipcbiAgICogQHRlbXBsYXRlIHtrZXlvZiBPcHRzfSBMXG4gICAqIEBwYXJhbSB7TH0ga2V5IE5hbWUgb2Ygb3B0aW9ucyBvYmplY3QgdG8gdXNlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbb3BlcmF0b3JdXG4gICAqIEBwYXJhbSB7TXVsdGlUb2tlbn0gW3Rva2VuXVxuICAgKiBAcmV0dXJucyB7T3B0c1tMXSB8IGFueX1cbiAgICovXG4gIGdldE9iaihrZXksIG9wZXJhdG9yLCB0b2tlbikge1xuICAgIGxldCBvYmogPSB0aGlzLm9ba2V5XTtcbiAgICBpZiAodHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJyAmJiBvcGVyYXRvciAhPSBudWxsKSB7XG4gICAgICBvYmogPSBvYmoob3BlcmF0b3IsIHRva2VuLnQsIHRva2VuKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfSxcbiAgLyoqXG4gICAqIENvbnZlcnQgdGhlIGdpdmVuIHRva2VuIHRvIGEgcmVuZGVyZWQgZWxlbWVudCB0aGF0IG1heSBiZSBhZGRlZCB0byB0aGVcbiAgICogY2FsbGluZy1pbnRlcmZhY2UncyBET01cbiAgICogQHBhcmFtIHtNdWx0aVRva2VufSB0b2tlbiBUb2tlbiB0byByZW5kZXIgdG8gYW4gSFRNTCBlbGVtZW50XG4gICAqIEByZXR1cm5zIHthbnl9IFJlbmRlciByZXN1bHQ7IGUuZy4sIEhUTUwgc3RyaW5nLCBET00gZWxlbWVudCwgUmVhY3RcbiAgICogICBDb21wb25lbnQsIGV0Yy5cbiAgICovXG4gIHJlbmRlcih0b2tlbikge1xuICAgIGNvbnN0IGlyID0gdG9rZW4ucmVuZGVyKHRoaXMpOyAvLyBpbnRlcm1lZGlhdGUgcmVwcmVzZW50YXRpb25cbiAgICBjb25zdCByZW5kZXJGbiA9IHRoaXMuZ2V0KCdyZW5kZXInLCBudWxsLCB0b2tlbikgfHwgdGhpcy5kZWZhdWx0UmVuZGVyO1xuICAgIHJldHVybiByZW5kZXJGbihpciwgdG9rZW4udCwgdG9rZW4pO1xuICB9XG59O1xuZnVuY3Rpb24gbm9vcCh2YWwpIHtcbiAgcmV0dXJuIHZhbDtcbn1cblxudmFyIG9wdGlvbnMgPSAvKiNfX1BVUkVfXyovT2JqZWN0LmZyZWV6ZSh7XG5cdF9fcHJvdG9fXzogbnVsbCxcblx0ZGVmYXVsdHM6IGRlZmF1bHRzLFxuXHRPcHRpb25zOiBPcHRpb25zLFxuXHRhc3NpZ246IGFzc2lnblxufSk7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblx0TXVsdGktVG9rZW5zXG5cdFRva2VucyBjb21wb3NlZCBvZiBhcnJheXMgb2YgVGV4dFRva2Vuc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZVxuICogQHBhcmFtIHtUb2tlbltdfSB0b2tlbnNcbiAqL1xuZnVuY3Rpb24gTXVsdGlUb2tlbih2YWx1ZSwgdG9rZW5zKSB7XG4gIHRoaXMudCA9ICd0b2tlbic7XG4gIHRoaXMudiA9IHZhbHVlO1xuICB0aGlzLnRrID0gdG9rZW5zO1xufVxuXG4vKipcbiAqIEFic3RyYWN0IGNsYXNzIHVzZWQgZm9yIG1hbnVmYWN0dXJpbmcgdG9rZW5zIG9mIHRleHQgdG9rZW5zLiBUaGF0IGlzIHJhdGhlclxuICogdGhhbiB0aGUgdmFsdWUgZm9yIGEgdG9rZW4gYmVpbmcgYSBzbWFsbCBzdHJpbmcgb2YgdGV4dCwgaXQncyB2YWx1ZSBhbiBhcnJheVxuICogb2YgdGV4dCB0b2tlbnMuXG4gKlxuICogVXNlZCBmb3IgZ3JvdXBpbmcgdG9nZXRoZXIgVVJMcywgZW1haWxzLCBoYXNodGFncywgYW5kIG90aGVyIHBvdGVudGlhbFxuICogY3JlYXRpb25zLlxuICogQGNsYXNzIE11bHRpVG9rZW5cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB0XG4gKiBAcHJvcGVydHkge3N0cmluZ30gdlxuICogQHByb3BlcnR5IHtUb2tlbltdfSB0a1xuICogQGFic3RyYWN0XG4gKi9cbk11bHRpVG9rZW4ucHJvdG90eXBlID0ge1xuICBpc0xpbms6IGZhbHNlLFxuICAvKipcbiAgICogUmV0dXJuIHRoZSBzdHJpbmcgdGhpcyB0b2tlbiByZXByZXNlbnRzLlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy52O1xuICB9LFxuICAvKipcbiAgICogV2hhdCBzaG91bGQgdGhlIHZhbHVlIGZvciB0aGlzIHRva2VuIGJlIGluIHRoZSBgaHJlZmAgSFRNTCBhdHRyaWJ1dGU/XG4gICAqIFJldHVybnMgdGhlIGAudG9TdHJpbmdgIHZhbHVlIGJ5IGRlZmF1bHQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbc2NoZW1lXVxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICovXG4gIHRvSHJlZihzY2hlbWUpIHtcbiAgICByZXR1cm4gdGhpcy50b1N0cmluZygpO1xuICB9LFxuICAvKipcbiAgICogQHBhcmFtIHtPcHRpb25zfSBvcHRpb25zIEZvcm1hdHRpbmcgb3B0aW9uc1xuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgKi9cbiAgdG9Gb3JtYXR0ZWRTdHJpbmcob3B0aW9ucykge1xuICAgIGNvbnN0IHZhbCA9IHRoaXMudG9TdHJpbmcoKTtcbiAgICBjb25zdCB0cnVuY2F0ZSA9IG9wdGlvbnMuZ2V0KCd0cnVuY2F0ZScsIHZhbCwgdGhpcyk7XG4gICAgY29uc3QgZm9ybWF0dGVkID0gb3B0aW9ucy5nZXQoJ2Zvcm1hdCcsIHZhbCwgdGhpcyk7XG4gICAgcmV0dXJuIHRydW5jYXRlICYmIGZvcm1hdHRlZC5sZW5ndGggPiB0cnVuY2F0ZSA/IGZvcm1hdHRlZC5zdWJzdHJpbmcoMCwgdHJ1bmNhdGUpICsgJ1x1MjAyNicgOiBmb3JtYXR0ZWQ7XG4gIH0sXG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0ge09wdGlvbnN9IG9wdGlvbnNcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIHRvRm9ybWF0dGVkSHJlZihvcHRpb25zKSB7XG4gICAgcmV0dXJuIG9wdGlvbnMuZ2V0KCdmb3JtYXRIcmVmJywgdGhpcy50b0hyZWYob3B0aW9ucy5nZXQoJ2RlZmF1bHRQcm90b2NvbCcpKSwgdGhpcyk7XG4gIH0sXG4gIC8qKlxuICAgKiBUaGUgc3RhcnQgaW5kZXggb2YgdGhpcyB0b2tlbiBpbiB0aGUgb3JpZ2luYWwgaW5wdXQgc3RyaW5nXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBzdGFydEluZGV4KCkge1xuICAgIHJldHVybiB0aGlzLnRrWzBdLnM7XG4gIH0sXG4gIC8qKlxuICAgKiBUaGUgZW5kIGluZGV4IG9mIHRoaXMgdG9rZW4gaW4gdGhlIG9yaWdpbmFsIGlucHV0IHN0cmluZyAodXAgdG8gdGhpc1xuICAgKiBpbmRleCBidXQgbm90IGluY2x1ZGluZyBpdClcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIGVuZEluZGV4KCkge1xuICAgIHJldHVybiB0aGlzLnRrW3RoaXMudGsubGVuZ3RoIC0gMV0uZTtcbiAgfSxcbiAgLyoqXG4gIFx0UmV0dXJucyBhbiBvYmplY3QgIG9mIHJlbGV2YW50IHZhbHVlcyBmb3IgdGhpcyB0b2tlbiwgd2hpY2ggaW5jbHVkZXMga2V5c1xuICBcdCogdHlwZSAtIEtpbmQgb2YgdG9rZW4gKCd1cmwnLCAnZW1haWwnLCBldGMuKVxuICBcdCogdmFsdWUgLSBPcmlnaW5hbCB0ZXh0XG4gIFx0KiBocmVmIC0gVGhlIHZhbHVlIHRoYXQgc2hvdWxkIGJlIGFkZGVkIHRvIHRoZSBhbmNob3IgdGFnJ3MgaHJlZlxuICBcdFx0YXR0cmlidXRlXG4gIFx0XHRAbWV0aG9kIHRvT2JqZWN0XG4gIFx0QHBhcmFtIHtzdHJpbmd9IFtwcm90b2NvbF0gYCdodHRwJ2AgYnkgZGVmYXVsdFxuICAqL1xuICB0b09iamVjdChwcm90b2NvbCkge1xuICAgIGlmIChwcm90b2NvbCA9PT0gdm9pZCAwKSB7XG4gICAgICBwcm90b2NvbCA9IGRlZmF1bHRzLmRlZmF1bHRQcm90b2NvbDtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IHRoaXMudCxcbiAgICAgIHZhbHVlOiB0aGlzLnRvU3RyaW5nKCksXG4gICAgICBpc0xpbms6IHRoaXMuaXNMaW5rLFxuICAgICAgaHJlZjogdGhpcy50b0hyZWYocHJvdG9jb2wpLFxuICAgICAgc3RhcnQ6IHRoaXMuc3RhcnRJbmRleCgpLFxuICAgICAgZW5kOiB0aGlzLmVuZEluZGV4KClcbiAgICB9O1xuICB9LFxuICAvKipcbiAgICpcbiAgICogQHBhcmFtIHtPcHRpb25zfSBvcHRpb25zIEZvcm1hdHRpbmcgb3B0aW9uXG4gICAqL1xuICB0b0Zvcm1hdHRlZE9iamVjdChvcHRpb25zKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IHRoaXMudCxcbiAgICAgIHZhbHVlOiB0aGlzLnRvRm9ybWF0dGVkU3RyaW5nKG9wdGlvbnMpLFxuICAgICAgaXNMaW5rOiB0aGlzLmlzTGluayxcbiAgICAgIGhyZWY6IHRoaXMudG9Gb3JtYXR0ZWRIcmVmKG9wdGlvbnMpLFxuICAgICAgc3RhcnQ6IHRoaXMuc3RhcnRJbmRleCgpLFxuICAgICAgZW5kOiB0aGlzLmVuZEluZGV4KClcbiAgICB9O1xuICB9LFxuICAvKipcbiAgICogV2hldGhlciB0aGlzIHRva2VuIHNob3VsZCBiZSByZW5kZXJlZCBhcyBhIGxpbmsgYWNjb3JkaW5nIHRvIHRoZSBnaXZlbiBvcHRpb25zXG4gICAqIEBwYXJhbSB7T3B0aW9uc30gb3B0aW9uc1xuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIHZhbGlkYXRlKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gb3B0aW9ucy5nZXQoJ3ZhbGlkYXRlJywgdGhpcy50b1N0cmluZygpLCB0aGlzKTtcbiAgfSxcbiAgLyoqXG4gICAqIFJldHVybiBhbiBvYmplY3QgdGhhdCByZXByZXNlbnRzIGhvdyB0aGlzIGxpbmsgc2hvdWxkIGJlIHJlbmRlcmVkLlxuICAgKiBAcGFyYW0ge09wdGlvbnN9IG9wdGlvbnMgRm9ybWF0dGlubmcgb3B0aW9uc1xuICAgKi9cbiAgcmVuZGVyKG9wdGlvbnMpIHtcbiAgICBjb25zdCB0b2tlbiA9IHRoaXM7XG4gICAgY29uc3QgaHJlZiA9IHRoaXMudG9IcmVmKG9wdGlvbnMuZ2V0KCdkZWZhdWx0UHJvdG9jb2wnKSk7XG4gICAgY29uc3QgZm9ybWF0dGVkSHJlZiA9IG9wdGlvbnMuZ2V0KCdmb3JtYXRIcmVmJywgaHJlZiwgdGhpcyk7XG4gICAgY29uc3QgdGFnTmFtZSA9IG9wdGlvbnMuZ2V0KCd0YWdOYW1lJywgaHJlZiwgdG9rZW4pO1xuICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLnRvRm9ybWF0dGVkU3RyaW5nKG9wdGlvbnMpO1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSB7fTtcbiAgICBjb25zdCBjbGFzc05hbWUgPSBvcHRpb25zLmdldCgnY2xhc3NOYW1lJywgaHJlZiwgdG9rZW4pO1xuICAgIGNvbnN0IHRhcmdldCA9IG9wdGlvbnMuZ2V0KCd0YXJnZXQnLCBocmVmLCB0b2tlbik7XG4gICAgY29uc3QgcmVsID0gb3B0aW9ucy5nZXQoJ3JlbCcsIGhyZWYsIHRva2VuKTtcbiAgICBjb25zdCBhdHRycyA9IG9wdGlvbnMuZ2V0T2JqKCdhdHRyaWJ1dGVzJywgaHJlZiwgdG9rZW4pO1xuICAgIGNvbnN0IGV2ZW50TGlzdGVuZXJzID0gb3B0aW9ucy5nZXRPYmooJ2V2ZW50cycsIGhyZWYsIHRva2VuKTtcbiAgICBhdHRyaWJ1dGVzLmhyZWYgPSBmb3JtYXR0ZWRIcmVmO1xuICAgIGlmIChjbGFzc05hbWUpIHtcbiAgICAgIGF0dHJpYnV0ZXMuY2xhc3MgPSBjbGFzc05hbWU7XG4gICAgfVxuICAgIGlmICh0YXJnZXQpIHtcbiAgICAgIGF0dHJpYnV0ZXMudGFyZ2V0ID0gdGFyZ2V0O1xuICAgIH1cbiAgICBpZiAocmVsKSB7XG4gICAgICBhdHRyaWJ1dGVzLnJlbCA9IHJlbDtcbiAgICB9XG4gICAgaWYgKGF0dHJzKSB7XG4gICAgICBhc3NpZ24oYXR0cmlidXRlcywgYXR0cnMpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgdGFnTmFtZSxcbiAgICAgIGF0dHJpYnV0ZXMsXG4gICAgICBjb250ZW50LFxuICAgICAgZXZlbnRMaXN0ZW5lcnNcbiAgICB9O1xuICB9XG59O1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyB0b2tlbiB0aGF0IGNhbiBiZSBlbWl0dGVkIGJ5IHRoZSBwYXJzZXIgc3RhdGUgbWFjaGluZVxuICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgcmVhZGFibGUgdHlwZSBvZiB0aGUgdG9rZW5cbiAqIEBwYXJhbSB7b2JqZWN0fSBwcm9wcyBwcm9wZXJ0aWVzIHRvIGFzc2lnbiBvciBvdmVycmlkZSwgaW5jbHVkaW5nIGlzTGluayA9IHRydWUgb3IgZmFsc2VcbiAqIEByZXR1cm5zIHtuZXcgKHZhbHVlOiBzdHJpbmcsIHRva2VuczogVG9rZW5bXSkgPT4gTXVsdGlUb2tlbn0gbmV3IHRva2VuIGNsYXNzXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVRva2VuQ2xhc3ModHlwZSwgcHJvcHMpIHtcbiAgY2xhc3MgVG9rZW4gZXh0ZW5kcyBNdWx0aVRva2VuIHtcbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZSwgdG9rZW5zKSB7XG4gICAgICBzdXBlcih2YWx1ZSwgdG9rZW5zKTtcbiAgICAgIHRoaXMudCA9IHR5cGU7XG4gICAgfVxuICB9XG4gIGZvciAoY29uc3QgcCBpbiBwcm9wcykge1xuICAgIFRva2VuLnByb3RvdHlwZVtwXSA9IHByb3BzW3BdO1xuICB9XG4gIFRva2VuLnQgPSB0eXBlO1xuICByZXR1cm4gVG9rZW47XG59XG5cbi8qKlxuXHRSZXByZXNlbnRzIGEgbGlzdCBvZiB0b2tlbnMgbWFraW5nIHVwIGEgdmFsaWQgZW1haWwgYWRkcmVzc1xuKi9cbmNvbnN0IEVtYWlsID0gY3JlYXRlVG9rZW5DbGFzcygnZW1haWwnLCB7XG4gIGlzTGluazogdHJ1ZSxcbiAgdG9IcmVmKCkge1xuICAgIHJldHVybiAnbWFpbHRvOicgKyB0aGlzLnRvU3RyaW5nKCk7XG4gIH1cbn0pO1xuXG4vKipcblx0UmVwcmVzZW50cyBzb21lIHBsYWluIHRleHRcbiovXG5jb25zdCBUZXh0ID0gY3JlYXRlVG9rZW5DbGFzcygndGV4dCcpO1xuXG4vKipcblx0TXVsdGktbGluZWJyZWFrIHRva2VuIC0gcmVwcmVzZW50cyBhIGxpbmUgYnJlYWtcblx0QGNsYXNzIE5sXG4qL1xuY29uc3QgTmwgPSBjcmVhdGVUb2tlbkNsYXNzKCdubCcpO1xuXG4vKipcblx0UmVwcmVzZW50cyBhIGxpc3Qgb2YgdGV4dCB0b2tlbnMgbWFraW5nIHVwIGEgdmFsaWQgVVJMXG5cdEBjbGFzcyBVcmxcbiovXG5jb25zdCBVcmwgPSBjcmVhdGVUb2tlbkNsYXNzKCd1cmwnLCB7XG4gIGlzTGluazogdHJ1ZSxcbiAgLyoqXG4gIFx0TG93ZXJjYXNlcyByZWxldmFudCBwYXJ0cyBvZiB0aGUgZG9tYWluIGFuZCBhZGRzIHRoZSBwcm90b2NvbCBpZlxuICBcdHJlcXVpcmVkLiBOb3RlIHRoYXQgdGhpcyB3aWxsIG5vdCBlc2NhcGUgdW5zYWZlIEhUTUwgY2hhcmFjdGVycyBpbiB0aGVcbiAgXHRVUkwuXG4gIFx0XHRAcGFyYW0ge3N0cmluZ30gW3NjaGVtZV0gZGVmYXVsdCBzY2hlbWUgKGUuZy4sICdodHRwcycpXG4gIFx0QHJldHVybiB7c3RyaW5nfSB0aGUgZnVsbCBocmVmXG4gICovXG4gIHRvSHJlZihzY2hlbWUpIHtcbiAgICBpZiAoc2NoZW1lID09PSB2b2lkIDApIHtcbiAgICAgIHNjaGVtZSA9IGRlZmF1bHRzLmRlZmF1bHRQcm90b2NvbDtcbiAgICB9XG4gICAgLy8gQ2hlY2sgaWYgYWxyZWFkeSBoYXMgYSBwcmVmaXggc2NoZW1lXG4gICAgcmV0dXJuIHRoaXMuaGFzUHJvdG9jb2woKSA/IHRoaXMudiA6IGAke3NjaGVtZX06Ly8ke3RoaXMudn1gO1xuICB9LFxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciB0aGlzIFVSTCB0b2tlbiBoYXMgYSBwcm90b2NvbFxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgaGFzUHJvdG9jb2woKSB7XG4gICAgY29uc3QgdG9rZW5zID0gdGhpcy50aztcbiAgICByZXR1cm4gdG9rZW5zLmxlbmd0aCA+PSAyICYmIHRva2Vuc1swXS50ICE9PSBMT0NBTEhPU1QgJiYgdG9rZW5zWzFdLnQgPT09IENPTE9OO1xuICB9XG59KTtcblxudmFyIG11bHRpID0gLyojX19QVVJFX18qL09iamVjdC5mcmVlemUoe1xuXHRfX3Byb3RvX186IG51bGwsXG5cdE11bHRpVG9rZW46IE11bHRpVG9rZW4sXG5cdEJhc2U6IE11bHRpVG9rZW4sXG5cdGNyZWF0ZVRva2VuQ2xhc3M6IGNyZWF0ZVRva2VuQ2xhc3MsXG5cdEVtYWlsOiBFbWFpbCxcblx0VGV4dDogVGV4dCxcblx0Tmw6IE5sLFxuXHRVcmw6IFVybFxufSk7XG5cbi8qKlxuXHROb3QgZXhhY3RseSBwYXJzZXIsIG1vcmUgbGlrZSB0aGUgc2Vjb25kLXN0YWdlIHNjYW5uZXIgKGFsdGhvdWdoIHdlIGNhblxuXHR0aGVvcmV0aWNhbGx5IGhvdHN3YXAgdGhlIGNvZGUgaGVyZSB3aXRoIGEgcmVhbCBwYXJzZXIgaW4gdGhlIGZ1dHVyZS4uLiBidXRcblx0Zm9yIGEgbGl0dGxlIFVSTC1maW5kaW5nIHV0aWxpdHkgYWJzdHJhY3Qgc3ludGF4IHRyZWVzIG1heSBiZSBhIGxpdHRsZVxuXHRvdmVya2lsbCkuXG5cblx0VVJMIGZvcm1hdDogaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9VUklfc2NoZW1lXG5cdEVtYWlsIGZvcm1hdDogaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9FbWFpbEFkZHJlc3MgKGxpbmtzIHRvIFJGQyBpblxuXHRyZWZlcmVuY2UpXG5cblx0QG1vZHVsZSBsaW5raWZ5XG5cdEBzdWJtb2R1bGUgcGFyc2VyXG5cdEBtYWluIHJ1blxuKi9cbmNvbnN0IG1ha2VTdGF0ZSA9IGFyZyA9PiBuZXcgU3RhdGUoYXJnKTtcblxuLyoqXG4gKiBHZW5lcmF0ZSB0aGUgcGFyc2VyIG11bHRpIHRva2VuLWJhc2VkIHN0YXRlIG1hY2hpbmVcbiAqIEBwYXJhbSB7eyBncm91cHM6IENvbGxlY3Rpb25zPHN0cmluZz4gfX0gdG9rZW5zXG4gKi9cbmZ1bmN0aW9uIGluaXQkMShfcmVmKSB7XG4gIGxldCB7XG4gICAgZ3JvdXBzXG4gIH0gPSBfcmVmO1xuICAvLyBUeXBlcyBvZiBjaGFyYWN0ZXJzIHRoZSBVUkwgY2FuIGRlZmluaXRlbHkgZW5kIGluXG4gIGNvbnN0IHFzQWNjZXB0aW5nID0gZ3JvdXBzLmRvbWFpbi5jb25jYXQoW0FNUEVSU0FORCwgQVNURVJJU0ssIEFULCBCQUNLU0xBU0gsIEJBQ0tUSUNLLCBDQVJFVCwgRE9MTEFSLCBFUVVBTFMsIEhZUEhFTiwgTlVNLCBQRVJDRU5ULCBQSVBFLCBQTFVTLCBQT1VORCwgU0xBU0gsIFNZTSwgVElMREUsIFVOREVSU0NPUkVdKTtcblxuICAvLyBUeXBlcyBvZiB0b2tlbnMgdGhhdCBjYW4gZm9sbG93IGEgVVJMIGFuZCBiZSBwYXJ0IG9mIHRoZSBxdWVyeSBzdHJpbmdcbiAgLy8gYnV0IGNhbm5vdCBiZSB0aGUgdmVyeSBsYXN0IGNoYXJhY3RlcnNcbiAgLy8gQ2hhcmFjdGVycyB0aGF0IGNhbm5vdCBhcHBlYXIgaW4gdGhlIFVSTCBhdCBhbGwgc2hvdWxkIGJlIGV4Y2x1ZGVkXG4gIGNvbnN0IHFzTm9uQWNjZXB0aW5nID0gW0FQT1NUUk9QSEUsIENMT1NFQU5HTEVCUkFDS0VULCBDTE9TRUJSQUNFLCBDTE9TRUJSQUNLRVQsIENMT1NFUEFSRU4sIENPTE9OLCBDT01NQSwgRE9ULCBFWENMQU1BVElPTiwgT1BFTkFOR0xFQlJBQ0tFVCwgT1BFTkJSQUNFLCBPUEVOQlJBQ0tFVCwgT1BFTlBBUkVOLCBRVUVSWSwgUVVPVEUsIFNFTUldO1xuXG4gIC8vIEZvciBhZGRyZXNzZXMgd2l0aG91dCB0aGUgbWFpbHRvIHByZWZpeFxuICAvLyBUb2tlbnMgYWxsb3dlZCBpbiB0aGUgbG9jYWxwYXJ0IG9mIHRoZSBlbWFpbFxuICBjb25zdCBsb2NhbHBhcnRBY2NlcHRpbmcgPSBbQU1QRVJTQU5ELCBBUE9TVFJPUEhFLCBBU1RFUklTSywgQkFDS1NMQVNILCBCQUNLVElDSywgQ0FSRVQsIENMT1NFQlJBQ0UsIERPTExBUiwgRVFVQUxTLCBIWVBIRU4sIE9QRU5CUkFDRSwgUEVSQ0VOVCwgUElQRSwgUExVUywgUE9VTkQsIFFVRVJZLCBTTEFTSCwgU1lNLCBUSUxERSwgVU5ERVJTQ09SRV07XG5cbiAgLy8gVGhlIHVuaXZlcnNhbCBzdGFydGluZyBzdGF0ZS5cbiAgLyoqXG4gICAqIEB0eXBlIFN0YXRlPFRva2VuPlxuICAgKi9cbiAgY29uc3QgU3RhcnQgPSBtYWtlU3RhdGUoKTtcbiAgY29uc3QgTG9jYWxwYXJ0ID0gdHQoU3RhcnQsIFRJTERFKTsgLy8gTG9jYWwgcGFydCBvZiB0aGUgZW1haWwgYWRkcmVzc1xuICB0YShMb2NhbHBhcnQsIGxvY2FscGFydEFjY2VwdGluZywgTG9jYWxwYXJ0KTtcbiAgdGEoTG9jYWxwYXJ0LCBncm91cHMuZG9tYWluLCBMb2NhbHBhcnQpO1xuICBjb25zdCBEb21haW4gPSBtYWtlU3RhdGUoKSxcbiAgICBTY2hlbWUgPSBtYWtlU3RhdGUoKSxcbiAgICBTbGFzaFNjaGVtZSA9IG1ha2VTdGF0ZSgpO1xuICB0YShTdGFydCwgZ3JvdXBzLmRvbWFpbiwgRG9tYWluKTsgLy8gcGFyc2VkIHN0cmluZyBlbmRzIHdpdGggYSBwb3RlbnRpYWwgZG9tYWluIG5hbWUgKEEpXG4gIHRhKFN0YXJ0LCBncm91cHMuc2NoZW1lLCBTY2hlbWUpOyAvLyBlLmcuLCAnbWFpbHRvJ1xuICB0YShTdGFydCwgZ3JvdXBzLnNsYXNoc2NoZW1lLCBTbGFzaFNjaGVtZSk7IC8vIGUuZy4sICdodHRwJ1xuXG4gIHRhKERvbWFpbiwgbG9jYWxwYXJ0QWNjZXB0aW5nLCBMb2NhbHBhcnQpO1xuICB0YShEb21haW4sIGdyb3Vwcy5kb21haW4sIERvbWFpbik7XG4gIGNvbnN0IExvY2FscGFydEF0ID0gdHQoRG9tYWluLCBBVCk7IC8vIExvY2FsIHBhcnQgb2YgdGhlIGVtYWlsIGFkZHJlc3MgcGx1cyBAXG5cbiAgdHQoTG9jYWxwYXJ0LCBBVCwgTG9jYWxwYXJ0QXQpOyAvLyBjbG9zZSB0byBhbiBlbWFpbCBhZGRyZXNzIG5vd1xuXG4gIC8vIExvY2FsIHBhcnQgb2YgYW4gZW1haWwgYWRkcmVzcyBjYW4gYmUgZS5nLiAnaHR0cCcgb3IgJ21haWx0bydcbiAgdHQoU2NoZW1lLCBBVCwgTG9jYWxwYXJ0QXQpO1xuICB0dChTbGFzaFNjaGVtZSwgQVQsIExvY2FscGFydEF0KTtcbiAgY29uc3QgTG9jYWxwYXJ0RG90ID0gdHQoTG9jYWxwYXJ0LCBET1QpOyAvLyBMb2NhbCBwYXJ0IG9mIHRoZSBlbWFpbCBhZGRyZXNzIHBsdXMgJy4nIChsb2NhbHBhcnQgY2Fubm90IGVuZCBpbiAuKVxuICB0YShMb2NhbHBhcnREb3QsIGxvY2FscGFydEFjY2VwdGluZywgTG9jYWxwYXJ0KTtcbiAgdGEoTG9jYWxwYXJ0RG90LCBncm91cHMuZG9tYWluLCBMb2NhbHBhcnQpO1xuICBjb25zdCBFbWFpbERvbWFpbiA9IG1ha2VTdGF0ZSgpO1xuICB0YShMb2NhbHBhcnRBdCwgZ3JvdXBzLmRvbWFpbiwgRW1haWxEb21haW4pOyAvLyBwYXJzZWQgc3RyaW5nIHN0YXJ0cyB3aXRoIGxvY2FsIGVtYWlsIGluZm8gKyBAIHdpdGggYSBwb3RlbnRpYWwgZG9tYWluIG5hbWVcbiAgdGEoRW1haWxEb21haW4sIGdyb3Vwcy5kb21haW4sIEVtYWlsRG9tYWluKTtcbiAgY29uc3QgRW1haWxEb21haW5Eb3QgPSB0dChFbWFpbERvbWFpbiwgRE9UKTsgLy8gZG9tYWluIGZvbGxvd2VkIGJ5IERPVFxuICB0YShFbWFpbERvbWFpbkRvdCwgZ3JvdXBzLmRvbWFpbiwgRW1haWxEb21haW4pO1xuICBjb25zdCBFbWFpbCQxID0gbWFrZVN0YXRlKEVtYWlsKTsgLy8gUG9zc2libGUgZW1haWwgYWRkcmVzcyAoY291bGQgaGF2ZSBtb3JlIHRsZHMpXG4gIHRhKEVtYWlsRG9tYWluRG90LCBncm91cHMudGxkLCBFbWFpbCQxKTtcbiAgdGEoRW1haWxEb21haW5Eb3QsIGdyb3Vwcy51dGxkLCBFbWFpbCQxKTtcbiAgdHQoTG9jYWxwYXJ0QXQsIExPQ0FMSE9TVCwgRW1haWwkMSk7XG5cbiAgLy8gSHlwaGVuIGNhbiBqdW1wIGJhY2sgdG8gYSBkb21haW4gbmFtZVxuICBjb25zdCBFbWFpbERvbWFpbkh5cGhlbiA9IHR0KEVtYWlsRG9tYWluLCBIWVBIRU4pOyAvLyBwYXJzZWQgc3RyaW5nIHN0YXJ0cyB3aXRoIGxvY2FsIGVtYWlsIGluZm8gKyBAIHdpdGggYSBwb3RlbnRpYWwgZG9tYWluIG5hbWVcbiAgdGEoRW1haWxEb21haW5IeXBoZW4sIGdyb3Vwcy5kb21haW4sIEVtYWlsRG9tYWluKTtcbiAgdGEoRW1haWwkMSwgZ3JvdXBzLmRvbWFpbiwgRW1haWxEb21haW4pO1xuICB0dChFbWFpbCQxLCBET1QsIEVtYWlsRG9tYWluRG90KTtcbiAgdHQoRW1haWwkMSwgSFlQSEVOLCBFbWFpbERvbWFpbkh5cGhlbik7XG5cbiAgLy8gRmluYWwgcG9zc2libGUgZW1haWwgc3RhdGVzXG4gIGNvbnN0IEVtYWlsQ29sb24gPSB0dChFbWFpbCQxLCBDT0xPTik7IC8vIFVSTCBmb2xsb3dlZCBieSBjb2xvbiAocG90ZW50aWFsIHBvcnQgbnVtYmVyIGhlcmUpXG4gIC8qY29uc3QgRW1haWxDb2xvblBvcnQgPSAqL1xuICB0YShFbWFpbENvbG9uLCBncm91cHMubnVtZXJpYywgRW1haWwpOyAvLyBVUkwgZm9sbG93ZWQgYnkgY29sb24gYW5kIHBvcnQgbnVtbmVyXG5cbiAgLy8gQWNjb3VudCBmb3IgZG90cyBhbmQgaHlwaGVucy4gSHlwaGVucyBhcmUgdXN1YWxseSBwYXJ0cyBvZiBkb21haW4gbmFtZXNcbiAgLy8gKGJ1dCBub3QgVExEcylcbiAgY29uc3QgRG9tYWluSHlwaGVuID0gdHQoRG9tYWluLCBIWVBIRU4pOyAvLyBkb21haW4gZm9sbG93ZWQgYnkgaHlwaGVuXG4gIGNvbnN0IERvbWFpbkRvdCA9IHR0KERvbWFpbiwgRE9UKTsgLy8gZG9tYWluIGZvbGxvd2VkIGJ5IERPVFxuICB0YShEb21haW5IeXBoZW4sIGdyb3Vwcy5kb21haW4sIERvbWFpbik7XG4gIHRhKERvbWFpbkRvdCwgbG9jYWxwYXJ0QWNjZXB0aW5nLCBMb2NhbHBhcnQpO1xuICB0YShEb21haW5Eb3QsIGdyb3Vwcy5kb21haW4sIERvbWFpbik7XG4gIGNvbnN0IERvbWFpbkRvdFRsZCA9IG1ha2VTdGF0ZShVcmwpOyAvLyBTaW1wbGVzdCBwb3NzaWJsZSBVUkwgd2l0aCBubyBxdWVyeSBzdHJpbmdcbiAgdGEoRG9tYWluRG90LCBncm91cHMudGxkLCBEb21haW5Eb3RUbGQpO1xuICB0YShEb21haW5Eb3QsIGdyb3Vwcy51dGxkLCBEb21haW5Eb3RUbGQpO1xuICB0YShEb21haW5Eb3RUbGQsIGdyb3Vwcy5kb21haW4sIERvbWFpbik7XG4gIHRhKERvbWFpbkRvdFRsZCwgbG9jYWxwYXJ0QWNjZXB0aW5nLCBMb2NhbHBhcnQpO1xuICB0dChEb21haW5Eb3RUbGQsIERPVCwgRG9tYWluRG90KTtcbiAgdHQoRG9tYWluRG90VGxkLCBIWVBIRU4sIERvbWFpbkh5cGhlbik7XG4gIHR0KERvbWFpbkRvdFRsZCwgQVQsIExvY2FscGFydEF0KTtcbiAgY29uc3QgRG9tYWluRG90VGxkQ29sb24gPSB0dChEb21haW5Eb3RUbGQsIENPTE9OKTsgLy8gVVJMIGZvbGxvd2VkIGJ5IGNvbG9uIChwb3RlbnRpYWwgcG9ydCBudW1iZXIgaGVyZSlcbiAgY29uc3QgRG9tYWluRG90VGxkQ29sb25Qb3J0ID0gbWFrZVN0YXRlKFVybCk7IC8vIFRMRCBmb2xsb3dlZCBieSBhIHBvcnQgbnVtYmVyXG4gIHRhKERvbWFpbkRvdFRsZENvbG9uLCBncm91cHMubnVtZXJpYywgRG9tYWluRG90VGxkQ29sb25Qb3J0KTtcblxuICAvLyBMb25nIFVSTCB3aXRoIG9wdGlvbmFsIHBvcnQgYW5kIG1heWJlIHF1ZXJ5IHN0cmluZ1xuICBjb25zdCBVcmwkMSA9IG1ha2VTdGF0ZShVcmwpO1xuXG4gIC8vIFVSTCB3aXRoIGV4dHJhIHN5bWJvbHMgYXQgdGhlIGVuZCwgZm9sbG93ZWQgYnkgYW4gb3BlbmluZyBicmFja2V0XG4gIGNvbnN0IFVybE5vbmFjY2VwdCA9IG1ha2VTdGF0ZSgpOyAvLyBVUkwgZm9sbG93ZWQgYnkgc29tZSBzeW1ib2xzICh3aWxsIG5vdCBiZSBwYXJ0IG9mIHRoZSBmaW5hbCBVUkwpXG5cbiAgLy8gUXVlcnkgc3RyaW5nc1xuICB0YShVcmwkMSwgcXNBY2NlcHRpbmcsIFVybCQxKTtcbiAgdGEoVXJsJDEsIHFzTm9uQWNjZXB0aW5nLCBVcmxOb25hY2NlcHQpO1xuICB0YShVcmxOb25hY2NlcHQsIHFzQWNjZXB0aW5nLCBVcmwkMSk7XG4gIHRhKFVybE5vbmFjY2VwdCwgcXNOb25BY2NlcHRpbmcsIFVybE5vbmFjY2VwdCk7XG5cbiAgLy8gQmVjb21lIHJlYWwgVVJMcyBhZnRlciBgU0xBU0hgIG9yIGBDT0xPTiBOVU0gU0xBU0hgXG4gIC8vIEhlcmUgd29ya3Mgd2l0aCBvciB3aXRob3V0IHNjaGVtZTovLyBwcmVmaXhcbiAgdHQoRG9tYWluRG90VGxkLCBTTEFTSCwgVXJsJDEpO1xuICB0dChEb21haW5Eb3RUbGRDb2xvblBvcnQsIFNMQVNILCBVcmwkMSk7XG5cbiAgLy8gTm90ZSB0aGF0IGRvbWFpbnMgdGhhdCBiZWdpbiB3aXRoIHNjaGVtZXMgYXJlIHRyZWF0ZWQgc2xpZ2hseSBkaWZmZXJlbnRseVxuICBjb25zdCBTY2hlbWVDb2xvbiA9IHR0KFNjaGVtZSwgQ09MT04pOyAvLyBlLmcuLCAnbWFpbHRvOidcbiAgY29uc3QgU2xhc2hTY2hlbWVDb2xvbiA9IHR0KFNsYXNoU2NoZW1lLCBDT0xPTik7IC8vIGUuZy4sICdodHRwOidcbiAgY29uc3QgU2xhc2hTY2hlbWVDb2xvblNsYXNoID0gdHQoU2xhc2hTY2hlbWVDb2xvbiwgU0xBU0gpOyAvLyBlLmcuLCAnaHR0cDovJ1xuXG4gIGNvbnN0IFVyaVByZWZpeCA9IHR0KFNsYXNoU2NoZW1lQ29sb25TbGFzaCwgU0xBU0gpOyAvLyBlLmcuLCAnaHR0cDovLydcblxuICAvLyBTY2hlbWUgc3RhdGVzIGNhbiB0cmFuc2l0aW9uIHRvIGRvbWFpbiBzdGF0ZXNcbiAgdGEoU2NoZW1lLCBncm91cHMuZG9tYWluLCBEb21haW4pO1xuICB0dChTY2hlbWUsIERPVCwgRG9tYWluRG90KTtcbiAgdHQoU2NoZW1lLCBIWVBIRU4sIERvbWFpbkh5cGhlbik7XG4gIHRhKFNsYXNoU2NoZW1lLCBncm91cHMuZG9tYWluLCBEb21haW4pO1xuICB0dChTbGFzaFNjaGVtZSwgRE9ULCBEb21haW5Eb3QpO1xuICB0dChTbGFzaFNjaGVtZSwgSFlQSEVOLCBEb21haW5IeXBoZW4pO1xuXG4gIC8vIEZvcmNlIFVSTCB3aXRoIHNjaGVtZSBwcmVmaXggZm9sbG93ZWQgYnkgYW55dGhpbmcgc2FuZVxuICB0YShTY2hlbWVDb2xvbiwgZ3JvdXBzLmRvbWFpbiwgVXJsJDEpO1xuICB0dChTY2hlbWVDb2xvbiwgU0xBU0gsIFVybCQxKTtcbiAgdGEoVXJpUHJlZml4LCBncm91cHMuZG9tYWluLCBVcmwkMSk7XG4gIHRhKFVyaVByZWZpeCwgcXNBY2NlcHRpbmcsIFVybCQxKTtcbiAgdHQoVXJpUHJlZml4LCBTTEFTSCwgVXJsJDEpO1xuXG4gIC8vIFVSTCwgZm9sbG93ZWQgYnkgYW4gb3BlbmluZyBicmFja2V0XG4gIGNvbnN0IFVybE9wZW5icmFjZSA9IHR0KFVybCQxLCBPUEVOQlJBQ0UpOyAvLyBVUkwgZm9sbG93ZWQgYnkge1xuICBjb25zdCBVcmxPcGVuYnJhY2tldCA9IHR0KFVybCQxLCBPUEVOQlJBQ0tFVCk7IC8vIFVSTCBmb2xsb3dlZCBieSBbXG4gIGNvbnN0IFVybE9wZW5hbmdsZWJyYWNrZXQgPSB0dChVcmwkMSwgT1BFTkFOR0xFQlJBQ0tFVCk7IC8vIFVSTCBmb2xsb3dlZCBieSA8XG4gIGNvbnN0IFVybE9wZW5wYXJlbiA9IHR0KFVybCQxLCBPUEVOUEFSRU4pOyAvLyBVUkwgZm9sbG93ZWQgYnkgKFxuXG4gIHR0KFVybE5vbmFjY2VwdCwgT1BFTkJSQUNFLCBVcmxPcGVuYnJhY2UpO1xuICB0dChVcmxOb25hY2NlcHQsIE9QRU5CUkFDS0VULCBVcmxPcGVuYnJhY2tldCk7XG4gIHR0KFVybE5vbmFjY2VwdCwgT1BFTkFOR0xFQlJBQ0tFVCwgVXJsT3BlbmFuZ2xlYnJhY2tldCk7XG4gIHR0KFVybE5vbmFjY2VwdCwgT1BFTlBBUkVOLCBVcmxPcGVucGFyZW4pO1xuXG4gIC8vIENsb3NpbmcgYnJhY2tldCBjb21wb25lbnQuIFRoaXMgY2hhcmFjdGVyIFdJTEwgYmUgaW5jbHVkZWQgaW4gdGhlIFVSTFxuICB0dChVcmxPcGVuYnJhY2UsIENMT1NFQlJBQ0UsIFVybCQxKTtcbiAgdHQoVXJsT3BlbmJyYWNrZXQsIENMT1NFQlJBQ0tFVCwgVXJsJDEpO1xuICB0dChVcmxPcGVuYW5nbGVicmFja2V0LCBDTE9TRUFOR0xFQlJBQ0tFVCwgVXJsJDEpO1xuICB0dChVcmxPcGVucGFyZW4sIENMT1NFUEFSRU4sIFVybCQxKTtcbiAgdHQoVXJsT3BlbmJyYWNlLCBDTE9TRUJSQUNFLCBVcmwkMSk7XG5cbiAgLy8gVVJMIHRoYXQgYmVpbmdzIHdpdGggYW4gb3BlbmluZyBicmFja2V0LCBmb2xsb3dlZCBieSBhIHN5bWJvbHMuXG4gIC8vIE5vdGUgdGhhdCB0aGUgZmluYWwgc3RhdGUgY2FuIHN0aWxsIGJlIGBVcmxPcGVuYnJhY2VgIChpZiB0aGUgVVJMIG9ubHlcbiAgLy8gaGFzIGEgc2luZ2xlIG9wZW5pbmcgYnJhY2tldCBmb3Igc29tZSByZWFzb24pLlxuICBjb25zdCBVcmxPcGVuYnJhY2VRID0gbWFrZVN0YXRlKFVybCk7IC8vIFVSTCBmb2xsb3dlZCBieSB7IGFuZCBzb21lIHN5bWJvbHMgdGhhdCB0aGUgVVJMIGNhbiBlbmQgaXRcbiAgY29uc3QgVXJsT3BlbmJyYWNrZXRRID0gbWFrZVN0YXRlKFVybCk7IC8vIFVSTCBmb2xsb3dlZCBieSBbIGFuZCBzb21lIHN5bWJvbHMgdGhhdCB0aGUgVVJMIGNhbiBlbmQgaXRcbiAgY29uc3QgVXJsT3BlbmFuZ2xlYnJhY2tldFEgPSBtYWtlU3RhdGUoVXJsKTsgLy8gVVJMIGZvbGxvd2VkIGJ5IDwgYW5kIHNvbWUgc3ltYm9scyB0aGF0IHRoZSBVUkwgY2FuIGVuZCBpdFxuICBjb25zdCBVcmxPcGVucGFyZW5RID0gbWFrZVN0YXRlKFVybCk7IC8vIFVSTCBmb2xsb3dlZCBieSAoIGFuZCBzb21lIHN5bWJvbHMgdGhhdCB0aGUgVVJMIGNhbiBlbmQgaXRcbiAgdGEoVXJsT3BlbmJyYWNlLCBxc0FjY2VwdGluZywgVXJsT3BlbmJyYWNlUSk7XG4gIHRhKFVybE9wZW5icmFja2V0LCBxc0FjY2VwdGluZywgVXJsT3BlbmJyYWNrZXRRKTtcbiAgdGEoVXJsT3BlbmFuZ2xlYnJhY2tldCwgcXNBY2NlcHRpbmcsIFVybE9wZW5hbmdsZWJyYWNrZXRRKTtcbiAgdGEoVXJsT3BlbnBhcmVuLCBxc0FjY2VwdGluZywgVXJsT3BlbnBhcmVuUSk7XG4gIGNvbnN0IFVybE9wZW5icmFjZVN5bXMgPSBtYWtlU3RhdGUoKTsgLy8gVXJsT3BlbmJyYWNlIGZvbGxvd2VkIGJ5IHNvbWUgc3ltYm9scyBpdCBjYW5ub3QgZW5kIGl0XG4gIGNvbnN0IFVybE9wZW5icmFja2V0U3ltcyA9IG1ha2VTdGF0ZSgpOyAvLyBVcmxPcGVuYnJhY2tldFEgZm9sbG93ZWQgYnkgc29tZSBzeW1ib2xzIGl0IGNhbm5vdCBlbmQgaXRcbiAgY29uc3QgVXJsT3BlbmFuZ2xlYnJhY2tldFN5bXMgPSBtYWtlU3RhdGUoKTsgLy8gVXJsT3BlbmFuZ2xlYnJhY2tldFEgZm9sbG93ZWQgYnkgc29tZSBzeW1ib2xzIGl0IGNhbm5vdCBlbmQgaXRcbiAgY29uc3QgVXJsT3BlbnBhcmVuU3ltcyA9IG1ha2VTdGF0ZSgpOyAvLyBVcmxPcGVucGFyZW5RIGZvbGxvd2VkIGJ5IHNvbWUgc3ltYm9scyBpdCBjYW5ub3QgZW5kIGl0XG4gIHRhKFVybE9wZW5icmFjZSwgcXNOb25BY2NlcHRpbmcpO1xuICB0YShVcmxPcGVuYnJhY2tldCwgcXNOb25BY2NlcHRpbmcpO1xuICB0YShVcmxPcGVuYW5nbGVicmFja2V0LCBxc05vbkFjY2VwdGluZyk7XG4gIHRhKFVybE9wZW5wYXJlbiwgcXNOb25BY2NlcHRpbmcpO1xuXG4gIC8vIFVSTCB0aGF0IGJlZ2lucyB3aXRoIGFuIG9wZW5pbmcgYnJhY2tldCwgZm9sbG93ZWQgYnkgc29tZSBzeW1ib2xzXG4gIHRhKFVybE9wZW5icmFjZVEsIHFzQWNjZXB0aW5nLCBVcmxPcGVuYnJhY2VRKTtcbiAgdGEoVXJsT3BlbmJyYWNrZXRRLCBxc0FjY2VwdGluZywgVXJsT3BlbmJyYWNrZXRRKTtcbiAgdGEoVXJsT3BlbmFuZ2xlYnJhY2tldFEsIHFzQWNjZXB0aW5nLCBVcmxPcGVuYW5nbGVicmFja2V0USk7XG4gIHRhKFVybE9wZW5wYXJlblEsIHFzQWNjZXB0aW5nLCBVcmxPcGVucGFyZW5RKTtcbiAgdGEoVXJsT3BlbmJyYWNlUSwgcXNOb25BY2NlcHRpbmcsIFVybE9wZW5icmFjZVEpO1xuICB0YShVcmxPcGVuYnJhY2tldFEsIHFzTm9uQWNjZXB0aW5nLCBVcmxPcGVuYnJhY2tldFEpO1xuICB0YShVcmxPcGVuYW5nbGVicmFja2V0USwgcXNOb25BY2NlcHRpbmcsIFVybE9wZW5hbmdsZWJyYWNrZXRRKTtcbiAgdGEoVXJsT3BlbnBhcmVuUSwgcXNOb25BY2NlcHRpbmcsIFVybE9wZW5wYXJlblEpO1xuICB0YShVcmxPcGVuYnJhY2VTeW1zLCBxc0FjY2VwdGluZywgVXJsT3BlbmJyYWNlU3ltcyk7XG4gIHRhKFVybE9wZW5icmFja2V0U3ltcywgcXNBY2NlcHRpbmcsIFVybE9wZW5icmFja2V0USk7XG4gIHRhKFVybE9wZW5hbmdsZWJyYWNrZXRTeW1zLCBxc0FjY2VwdGluZywgVXJsT3BlbmFuZ2xlYnJhY2tldFEpO1xuICB0YShVcmxPcGVucGFyZW5TeW1zLCBxc0FjY2VwdGluZywgVXJsT3BlbnBhcmVuUSk7XG4gIHRhKFVybE9wZW5icmFjZVN5bXMsIHFzTm9uQWNjZXB0aW5nLCBVcmxPcGVuYnJhY2VTeW1zKTtcbiAgdGEoVXJsT3BlbmJyYWNrZXRTeW1zLCBxc05vbkFjY2VwdGluZywgVXJsT3BlbmJyYWNrZXRTeW1zKTtcbiAgdGEoVXJsT3BlbmFuZ2xlYnJhY2tldFN5bXMsIHFzTm9uQWNjZXB0aW5nLCBVcmxPcGVuYW5nbGVicmFja2V0U3ltcyk7XG4gIHRhKFVybE9wZW5wYXJlblN5bXMsIHFzTm9uQWNjZXB0aW5nLCBVcmxPcGVucGFyZW5TeW1zKTtcblxuICAvLyBDbG9zZSBicmFjZS9icmFja2V0IHRvIGJlY29tZSByZWd1bGFyIFVSTFxuICB0dChVcmxPcGVuYnJhY2tldFEsIENMT1NFQlJBQ0tFVCwgVXJsJDEpO1xuICB0dChVcmxPcGVuYW5nbGVicmFja2V0USwgQ0xPU0VBTkdMRUJSQUNLRVQsIFVybCQxKTtcbiAgdHQoVXJsT3BlbnBhcmVuUSwgQ0xPU0VQQVJFTiwgVXJsJDEpO1xuICB0dChVcmxPcGVuYnJhY2VRLCBDTE9TRUJSQUNFLCBVcmwkMSk7XG4gIHR0KFVybE9wZW5icmFja2V0U3ltcywgQ0xPU0VCUkFDS0VULCBVcmwkMSk7XG4gIHR0KFVybE9wZW5hbmdsZWJyYWNrZXRTeW1zLCBDTE9TRUFOR0xFQlJBQ0tFVCwgVXJsJDEpO1xuICB0dChVcmxPcGVucGFyZW5TeW1zLCBDTE9TRVBBUkVOLCBVcmwkMSk7XG4gIHR0KFVybE9wZW5icmFjZVN5bXMsIENMT1NFUEFSRU4sIFVybCQxKTtcbiAgdHQoU3RhcnQsIExPQ0FMSE9TVCwgRG9tYWluRG90VGxkKTsgLy8gbG9jYWxob3N0IGlzIGEgdmFsaWQgVVJMIHN0YXRlXG4gIHR0KFN0YXJ0LCBOTCQxLCBObCk7IC8vIHNpbmdsZSBuZXcgbGluZVxuXG4gIHJldHVybiB7XG4gICAgc3RhcnQ6IFN0YXJ0LFxuICAgIHRva2VuczogdGtcbiAgfTtcbn1cblxuLyoqXG4gKiBSdW4gdGhlIHBhcnNlciBzdGF0ZSBtYWNoaW5lIG9uIGEgbGlzdCBvZiBzY2FubmVkIHN0cmluZy1iYXNlZCB0b2tlbnMgdG9cbiAqIGNyZWF0ZSBhIGxpc3Qgb2YgbXVsdGkgdG9rZW5zLCBlYWNoIG9mIHdoaWNoIHJlcHJlc2VudHMgYSBVUkwsIGVtYWlsIGFkZHJlc3MsXG4gKiBwbGFpbiB0ZXh0LCBldGMuXG4gKlxuICogQHBhcmFtIHtTdGF0ZTxNdWx0aVRva2VuPn0gc3RhcnQgcGFyc2VyIHN0YXJ0IHN0YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5wdXQgdGhlIG9yaWdpbmFsIGlucHV0IHVzZWQgdG8gZ2VuZXJhdGUgdGhlIGdpdmVuIHRva2Vuc1xuICogQHBhcmFtIHtUb2tlbltdfSB0b2tlbnMgbGlzdCBvZiBzY2FubmVkIHRva2Vuc1xuICogQHJldHVybnMge011bHRpVG9rZW5bXX1cbiAqL1xuZnVuY3Rpb24gcnVuKHN0YXJ0LCBpbnB1dCwgdG9rZW5zKSB7XG4gIGxldCBsZW4gPSB0b2tlbnMubGVuZ3RoO1xuICBsZXQgY3Vyc29yID0gMDtcbiAgbGV0IG11bHRpcyA9IFtdO1xuICBsZXQgdGV4dFRva2VucyA9IFtdO1xuICB3aGlsZSAoY3Vyc29yIDwgbGVuKSB7XG4gICAgbGV0IHN0YXRlID0gc3RhcnQ7XG4gICAgbGV0IHNlY29uZFN0YXRlID0gbnVsbDtcbiAgICBsZXQgbmV4dFN0YXRlID0gbnVsbDtcbiAgICBsZXQgbXVsdGlMZW5ndGggPSAwO1xuICAgIGxldCBsYXRlc3RBY2NlcHRpbmcgPSBudWxsO1xuICAgIGxldCBzaW5jZUFjY2VwdHMgPSAtMTtcbiAgICB3aGlsZSAoY3Vyc29yIDwgbGVuICYmICEoc2Vjb25kU3RhdGUgPSBzdGF0ZS5nbyh0b2tlbnNbY3Vyc29yXS50KSkpIHtcbiAgICAgIC8vIFN0YXJ0aW5nIHRva2VucyB3aXRoIG5vd2hlcmUgdG8ganVtcCB0by5cbiAgICAgIC8vIENvbnNpZGVyIHRoZXNlIHRvIGJlIGp1c3QgcGxhaW4gdGV4dFxuICAgICAgdGV4dFRva2Vucy5wdXNoKHRva2Vuc1tjdXJzb3IrK10pO1xuICAgIH1cbiAgICB3aGlsZSAoY3Vyc29yIDwgbGVuICYmIChuZXh0U3RhdGUgPSBzZWNvbmRTdGF0ZSB8fCBzdGF0ZS5nbyh0b2tlbnNbY3Vyc29yXS50KSkpIHtcbiAgICAgIC8vIEdldCB0aGUgbmV4dCBzdGF0ZVxuICAgICAgc2Vjb25kU3RhdGUgPSBudWxsO1xuICAgICAgc3RhdGUgPSBuZXh0U3RhdGU7XG5cbiAgICAgIC8vIEtlZXAgdHJhY2sgb2YgdGhlIGxhdGVzdCBhY2NlcHRpbmcgc3RhdGVcbiAgICAgIGlmIChzdGF0ZS5hY2NlcHRzKCkpIHtcbiAgICAgICAgc2luY2VBY2NlcHRzID0gMDtcbiAgICAgICAgbGF0ZXN0QWNjZXB0aW5nID0gc3RhdGU7XG4gICAgICB9IGVsc2UgaWYgKHNpbmNlQWNjZXB0cyA+PSAwKSB7XG4gICAgICAgIHNpbmNlQWNjZXB0cysrO1xuICAgICAgfVxuICAgICAgY3Vyc29yKys7XG4gICAgICBtdWx0aUxlbmd0aCsrO1xuICAgIH1cbiAgICBpZiAoc2luY2VBY2NlcHRzIDwgMCkge1xuICAgICAgLy8gTm8gYWNjZXB0aW5nIHN0YXRlIHdhcyBmb3VuZCwgcGFydCBvZiBhIHJlZ3VsYXIgdGV4dCB0b2tlbiBhZGRcbiAgICAgIC8vIHRoZSBmaXJzdCB0ZXh0IHRva2VuIHRvIHRoZSB0ZXh0IHRva2VucyBhcnJheSBhbmQgdHJ5IGFnYWluIGZyb21cbiAgICAgIC8vIHRoZSBuZXh0XG4gICAgICBjdXJzb3IgLT0gbXVsdGlMZW5ndGg7XG4gICAgICBpZiAoY3Vyc29yIDwgbGVuKSB7XG4gICAgICAgIHRleHRUb2tlbnMucHVzaCh0b2tlbnNbY3Vyc29yXSk7XG4gICAgICAgIGN1cnNvcisrO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBBY2NlcHRpbmcgc3RhdGUhXG4gICAgICAvLyBGaXJzdCBjbG9zZSBvZmYgdGhlIHRleHRUb2tlbnMgKGlmIGF2YWlsYWJsZSlcbiAgICAgIGlmICh0ZXh0VG9rZW5zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgbXVsdGlzLnB1c2goaW5pdE11bHRpVG9rZW4oVGV4dCwgaW5wdXQsIHRleHRUb2tlbnMpKTtcbiAgICAgICAgdGV4dFRva2VucyA9IFtdO1xuICAgICAgfVxuXG4gICAgICAvLyBSb2xsIGJhY2sgdG8gdGhlIGxhdGVzdCBhY2NlcHRpbmcgc3RhdGVcbiAgICAgIGN1cnNvciAtPSBzaW5jZUFjY2VwdHM7XG4gICAgICBtdWx0aUxlbmd0aCAtPSBzaW5jZUFjY2VwdHM7XG5cbiAgICAgIC8vIENyZWF0ZSBhIG5ldyBtdWx0aXRva2VuXG4gICAgICBjb25zdCBNdWx0aSA9IGxhdGVzdEFjY2VwdGluZy50O1xuICAgICAgY29uc3Qgc3VidG9rZW5zID0gdG9rZW5zLnNsaWNlKGN1cnNvciAtIG11bHRpTGVuZ3RoLCBjdXJzb3IpO1xuICAgICAgbXVsdGlzLnB1c2goaW5pdE11bHRpVG9rZW4oTXVsdGksIGlucHV0LCBzdWJ0b2tlbnMpKTtcbiAgICB9XG4gIH1cblxuICAvLyBGaW5hbGx5IGNsb3NlIG9mZiB0aGUgdGV4dFRva2VucyAoaWYgYXZhaWxhYmxlKVxuICBpZiAodGV4dFRva2Vucy5sZW5ndGggPiAwKSB7XG4gICAgbXVsdGlzLnB1c2goaW5pdE11bHRpVG9rZW4oVGV4dCwgaW5wdXQsIHRleHRUb2tlbnMpKTtcbiAgfVxuICByZXR1cm4gbXVsdGlzO1xufVxuXG4vKipcbiAqIFV0aWxpdHkgZnVuY3Rpb24gZm9yIGluc3RhbnRpYXRpbmcgYSBuZXcgbXVsdGl0b2tlbiB3aXRoIGFsbCB0aGUgcmVsZXZhbnRcbiAqIGZpZWxkcyBkdXJpbmcgcGFyc2luZy5cbiAqIEBwYXJhbSB7bmV3ICh2YWx1ZTogc3RyaW5nLCB0b2tlbnM6IFRva2VuW10pID0+IE11bHRpVG9rZW59IE11bHRpIGNsYXNzIHRvIGluc3RhbnRpYXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5wdXQgb3JpZ2luYWwgaW5wdXQgc3RyaW5nXG4gKiBAcGFyYW0ge1Rva2VuW119IHRva2VucyBjb25zZWN1dGl2ZSB0b2tlbnMgc2Nhbm5lZCBmcm9tIGlucHV0IHN0cmluZ1xuICogQHJldHVybnMge011bHRpVG9rZW59XG4gKi9cbmZ1bmN0aW9uIGluaXRNdWx0aVRva2VuKE11bHRpLCBpbnB1dCwgdG9rZW5zKSB7XG4gIGNvbnN0IHN0YXJ0SWR4ID0gdG9rZW5zWzBdLnM7XG4gIGNvbnN0IGVuZElkeCA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV0uZTtcbiAgY29uc3QgdmFsdWUgPSBpbnB1dC5zbGljZShzdGFydElkeCwgZW5kSWR4KTtcbiAgcmV0dXJuIG5ldyBNdWx0aSh2YWx1ZSwgdG9rZW5zKTtcbn1cblxuY29uc3Qgd2FybiA9IHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiBjb25zb2xlICYmIGNvbnNvbGUud2FybiB8fCAoKCkgPT4ge30pO1xuY29uc3Qgd2FybkFkdmljZSA9ICd1bnRpbCBtYW51YWwgY2FsbCBvZiBsaW5raWZ5LmluaXQoKS4gUmVnaXN0ZXIgYWxsIHNjaGVtZXMgYW5kIHBsdWdpbnMgYmVmb3JlIGludm9raW5nIGxpbmtpZnkgdGhlIGZpcnN0IHRpbWUuJztcblxuLy8gU2lkZS1lZmZlY3QgaW5pdGlhbGl6YXRpb24gc3RhdGVcbmNvbnN0IElOSVQgPSB7XG4gIHNjYW5uZXI6IG51bGwsXG4gIHBhcnNlcjogbnVsbCxcbiAgdG9rZW5RdWV1ZTogW10sXG4gIHBsdWdpblF1ZXVlOiBbXSxcbiAgY3VzdG9tU2NoZW1lczogW10sXG4gIGluaXRpYWxpemVkOiBmYWxzZVxufTtcblxuLyoqXG4gKiBAdHlwZWRlZiB7e1xuICogXHRzdGFydDogU3RhdGU8c3RyaW5nPixcbiAqIFx0dG9rZW5zOiB7IGdyb3VwczogQ29sbGVjdGlvbnM8c3RyaW5nPiB9ICYgdHlwZW9mIHRrXG4gKiB9fSBTY2FubmVySW5pdFxuICovXG5cbi8qKlxuICogQHR5cGVkZWYge3tcbiAqIFx0c3RhcnQ6IFN0YXRlPE11bHRpVG9rZW4+LFxuICogXHR0b2tlbnM6IHR5cGVvZiBtdWx0aVxuICogfX0gUGFyc2VySW5pdFxuICovXG5cbi8qKlxuICogQHR5cGVkZWYgeyhhcmc6IHsgc2Nhbm5lcjogU2Nhbm5lckluaXQgfSkgPT4gdm9pZH0gVG9rZW5QbHVnaW5cbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHsoYXJnOiB7IHNjYW5uZXI6IFNjYW5uZXJJbml0LCBwYXJzZXI6IFBhcnNlckluaXQgfSkgPT4gdm9pZH0gUGx1Z2luXG4gKi9cblxuLyoqXG4gKiBEZS1yZWdpc3RlciBhbGwgcGx1Z2lucyBhbmQgcmVzZXQgdGhlIGludGVybmFsIHN0YXRlLW1hY2hpbmUuIFVzZWQgZm9yXG4gKiB0ZXN0aW5nOyBub3QgcmVxdWlyZWQgaW4gcHJhY3RpY2UuXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiByZXNldCgpIHtcbiAgU3RhdGUuZ3JvdXBzID0ge307XG4gIElOSVQuc2Nhbm5lciA9IG51bGw7XG4gIElOSVQucGFyc2VyID0gbnVsbDtcbiAgSU5JVC50b2tlblF1ZXVlID0gW107XG4gIElOSVQucGx1Z2luUXVldWUgPSBbXTtcbiAgSU5JVC5jdXN0b21TY2hlbWVzID0gW107XG4gIElOSVQuaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbn1cblxuLyoqXG4gKiBSZWdpc3RlciBhIHRva2VuIHBsdWdpbiB0byBhbGxvdyB0aGUgc2Nhbm5lciB0byByZWNvZ25pemUgYWRkaXRpb25hbCB0b2tlblxuICogdHlwZXMgYmVmb3JlIHRoZSBwYXJzZXIgc3RhdGUgbWFjaGluZSBpcyBjb25zdHJ1Y3RlZCBmcm9tIHRoZSByZXN1bHRzLlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgb2YgcGx1Z2luIHRvIHJlZ2lzdGVyXG4gKiBAcGFyYW0ge1Rva2VuUGx1Z2lufSBwbHVnaW4gZnVuY3Rpb24gdGhhdCBhY2NlcHRzIHRoZSBzY2FubmVyIHN0YXRlIG1hY2hpbmVcbiAqIGFuZCBhdmFpbGFibGUgc2Nhbm5lciB0b2tlbnMgYW5kIGNvbGxlY3Rpb25zIGFuZCBleHRlbmRzIHRoZSBzdGF0ZSBtYWNoaW5lIHRvXG4gKiByZWNvZ25pemUgYWRkaXRpb25hbCB0b2tlbnMgb3IgZ3JvdXBzLlxuICovXG5mdW5jdGlvbiByZWdpc3RlclRva2VuUGx1Z2luKG5hbWUsIHBsdWdpbikge1xuICBpZiAodHlwZW9mIHBsdWdpbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBFcnJvcihgbGlua2lmeWpzOiBJbnZhbGlkIHRva2VuIHBsdWdpbiAke3BsdWdpbn0gKGV4cGVjdHMgZnVuY3Rpb24pYCk7XG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBJTklULnRva2VuUXVldWUubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAobmFtZSA9PT0gSU5JVC50b2tlblF1ZXVlW2ldWzBdKSB7XG4gICAgICB3YXJuKGBsaW5raWZ5anM6IHRva2VuIHBsdWdpbiBcIiR7bmFtZX1cIiBhbHJlYWR5IHJlZ2lzdGVyZWQgLSB3aWxsIGJlIG92ZXJ3cml0dGVuYCk7XG4gICAgICBJTklULnRva2VuUXVldWVbaV0gPSBbbmFtZSwgcGx1Z2luXTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cbiAgSU5JVC50b2tlblF1ZXVlLnB1c2goW25hbWUsIHBsdWdpbl0pO1xuICBpZiAoSU5JVC5pbml0aWFsaXplZCkge1xuICAgIHdhcm4oYGxpbmtpZnlqczogYWxyZWFkeSBpbml0aWFsaXplZCAtIHdpbGwgbm90IHJlZ2lzdGVyIHRva2VuIHBsdWdpbiBcIiR7bmFtZX1cIiAke3dhcm5BZHZpY2V9YCk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZWdpc3RlciBhIGxpbmtpZnkgcGx1Z2luXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBvZiBwbHVnaW4gdG8gcmVnaXN0ZXJcbiAqIEBwYXJhbSB7UGx1Z2lufSBwbHVnaW4gZnVuY3Rpb24gdGhhdCBhY2NlcHRzIHRoZSBwYXJzZXIgc3RhdGUgbWFjaGluZSBhbmRcbiAqIGV4dGVuZHMgdGhlIHBhcnNlciB0byByZWNvZ25pemUgYWRkaXRpb25hbCBsaW5rIHR5cGVzXG4gKi9cbmZ1bmN0aW9uIHJlZ2lzdGVyUGx1Z2luKG5hbWUsIHBsdWdpbikge1xuICBpZiAodHlwZW9mIHBsdWdpbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBFcnJvcihgbGlua2lmeWpzOiBJbnZhbGlkIHBsdWdpbiAke3BsdWdpbn0gKGV4cGVjdHMgZnVuY3Rpb24pYCk7XG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBJTklULnBsdWdpblF1ZXVlLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKG5hbWUgPT09IElOSVQucGx1Z2luUXVldWVbaV1bMF0pIHtcbiAgICAgIHdhcm4oYGxpbmtpZnlqczogcGx1Z2luIFwiJHtuYW1lfVwiIGFscmVhZHkgcmVnaXN0ZXJlZCAtIHdpbGwgYmUgb3ZlcndyaXR0ZW5gKTtcbiAgICAgIElOSVQucGx1Z2luUXVldWVbaV0gPSBbbmFtZSwgcGx1Z2luXTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cbiAgSU5JVC5wbHVnaW5RdWV1ZS5wdXNoKFtuYW1lLCBwbHVnaW5dKTtcbiAgaWYgKElOSVQuaW5pdGlhbGl6ZWQpIHtcbiAgICB3YXJuKGBsaW5raWZ5anM6IGFscmVhZHkgaW5pdGlhbGl6ZWQgLSB3aWxsIG5vdCByZWdpc3RlciBwbHVnaW4gXCIke25hbWV9XCIgJHt3YXJuQWR2aWNlfWApO1xuICB9XG59XG5cbi8qKlxuICogRGV0ZWN0IFVSTHMgd2l0aCB0aGUgZm9sbG93aW5nIGFkZGl0aW9uYWwgcHJvdG9jb2wuIEFueXRoaW5nIHdpdGggZm9ybWF0XG4gKiBcInByb3RvY29sOi8vLi4uXCIgd2lsbCBiZSBjb25zaWRlcmVkIGEgbGluay4gSWYgYG9wdGlvbmFsU2xhc2hTbGFzaGAgaXMgc2V0IHRvXG4gKiBgdHJ1ZWAsIGFueXRoaW5nIHdpdGggZm9ybWF0IFwicHJvdG9jb2w6Li4uXCIgd2lsbCBiZSBjb25zaWRlcmVkIGEgbGluay5cbiAqIEBwYXJhbSB7c3RyaW5nfSBwcm90b2NvbFxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9uYWxTbGFzaFNsYXNoXVxuICovXG5mdW5jdGlvbiByZWdpc3RlckN1c3RvbVByb3RvY29sKHNjaGVtZSwgb3B0aW9uYWxTbGFzaFNsYXNoKSB7XG4gIGlmIChvcHRpb25hbFNsYXNoU2xhc2ggPT09IHZvaWQgMCkge1xuICAgIG9wdGlvbmFsU2xhc2hTbGFzaCA9IGZhbHNlO1xuICB9XG4gIGlmIChJTklULmluaXRpYWxpemVkKSB7XG4gICAgd2FybihgbGlua2lmeWpzOiBhbHJlYWR5IGluaXRpYWxpemVkIC0gd2lsbCBub3QgcmVnaXN0ZXIgY3VzdG9tIHNjaGVtZSBcIiR7c2NoZW1lfVwiICR7d2FybkFkdmljZX1gKTtcbiAgfVxuICBpZiAoIS9eWzAtOWEtel0rKC1bMC05YS16XSspKiQvLnRlc3Qoc2NoZW1lKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignbGlua2lmeWpzOiBpbmNvcnJlY3Qgc2NoZW1lIGZvcm1hdC5cXG4gMS4gTXVzdCBvbmx5IGNvbnRhaW4gZGlnaXRzLCBsb3dlcmNhc2UgQVNDSUkgbGV0dGVycyBvciBcIi1cIlxcbiAyLiBDYW5ub3Qgc3RhcnQgb3IgZW5kIHdpdGggXCItXCJcXG4gMy4gXCItXCIgY2Fubm90IHJlcGVhdCcpO1xuICB9XG4gIElOSVQuY3VzdG9tU2NoZW1lcy5wdXNoKFtzY2hlbWUsIG9wdGlvbmFsU2xhc2hTbGFzaF0pO1xufVxuXG4vKipcbiAqIEluaXRpYWxpemUgdGhlIGxpbmtpZnkgc3RhdGUgbWFjaGluZS4gQ2FsbGVkIGF1dG9tYXRpY2FsbHkgdGhlIGZpcnN0IHRpbWVcbiAqIGxpbmtpZnkgaXMgY2FsbGVkIG9uIGEgc3RyaW5nLCBidXQgbWF5IGJlIGNhbGxlZCBtYW51YWxseSBhcyB3ZWxsLlxuICovXG5mdW5jdGlvbiBpbml0KCkge1xuICAvLyBJbml0aWFsaXplIHNjYW5uZXIgc3RhdGUgbWFjaGluZSBhbmQgcGx1Z2luc1xuICBJTklULnNjYW5uZXIgPSBpbml0JDIoSU5JVC5jdXN0b21TY2hlbWVzKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBJTklULnRva2VuUXVldWUubGVuZ3RoOyBpKyspIHtcbiAgICBJTklULnRva2VuUXVldWVbaV1bMV0oe1xuICAgICAgc2Nhbm5lcjogSU5JVC5zY2FubmVyXG4gICAgfSk7XG4gIH1cblxuICAvLyBJbml0aWFsaXplIHBhcnNlciBzdGF0ZSBtYWNoaW5lIGFuZCBwbHVnaW5zXG4gIElOSVQucGFyc2VyID0gaW5pdCQxKElOSVQuc2Nhbm5lci50b2tlbnMpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IElOSVQucGx1Z2luUXVldWUubGVuZ3RoOyBpKyspIHtcbiAgICBJTklULnBsdWdpblF1ZXVlW2ldWzFdKHtcbiAgICAgIHNjYW5uZXI6IElOSVQuc2Nhbm5lcixcbiAgICAgIHBhcnNlcjogSU5JVC5wYXJzZXJcbiAgICB9KTtcbiAgfVxuICBJTklULmluaXRpYWxpemVkID0gdHJ1ZTtcbn1cblxuLyoqXG4gKiBQYXJzZSBhIHN0cmluZyBpbnRvIHRva2VucyB0aGF0IHJlcHJlc2VudCBsaW5rYWJsZSBhbmQgbm9uLWxpbmthYmxlIHN1Yi1jb21wb25lbnRzXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtNdWx0aVRva2VuW119IHRva2Vuc1xuICovXG5mdW5jdGlvbiB0b2tlbml6ZShzdHIpIHtcbiAgaWYgKCFJTklULmluaXRpYWxpemVkKSB7XG4gICAgaW5pdCgpO1xuICB9XG4gIHJldHVybiBydW4oSU5JVC5wYXJzZXIuc3RhcnQsIHN0ciwgcnVuJDEoSU5JVC5zY2FubmVyLnN0YXJ0LCBzdHIpKTtcbn1cblxuLyoqXG4gKiBGaW5kIGEgbGlzdCBvZiBsaW5rYWJsZSBpdGVtcyBpbiB0aGUgZ2l2ZW4gc3RyaW5nLlxuICogQHBhcmFtIHtzdHJpbmd9IHN0ciBzdHJpbmcgdG8gZmluZCBsaW5rcyBpblxuICogQHBhcmFtIHtzdHJpbmcgfCBPcHRzfSBbdHlwZV0gZWl0aGVyIGZvcm1hdHRpbmcgb3B0aW9ucyBvciBzcGVjaWZpYyB0eXBlIG9mXG4gKiBsaW5rcyB0byBmaW5kLCBlLmcuLCAndXJsJyBvciAnZW1haWwnXG4gKiBAcGFyYW0ge09wdHN9IFtvcHRzXSBmb3JtYXR0aW5nIG9wdGlvbnMgZm9yIGZpbmFsIG91dHB1dC4gQ2Fubm90IGJlIHNwZWNpZmllZFxuICogaWYgb3B0cyBhbHJlYWR5IHByb3ZpZGVkIGluIGB0eXBlYCBhcmd1bWVudFxuKi9cbmZ1bmN0aW9uIGZpbmQoc3RyLCB0eXBlLCBvcHRzKSB7XG4gIGlmICh0eXBlID09PSB2b2lkIDApIHtcbiAgICB0eXBlID0gbnVsbDtcbiAgfVxuICBpZiAob3B0cyA9PT0gdm9pZCAwKSB7XG4gICAgb3B0cyA9IG51bGw7XG4gIH1cbiAgaWYgKHR5cGUgJiYgdHlwZW9mIHR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgaWYgKG9wdHMpIHtcbiAgICAgIHRocm93IEVycm9yKGBsaW5raWZ5anM6IEludmFsaWQgbGluayB0eXBlICR7dHlwZX07IG11c3QgYmUgYSBzdHJpbmdgKTtcbiAgICB9XG4gICAgb3B0cyA9IHR5cGU7XG4gICAgdHlwZSA9IG51bGw7XG4gIH1cbiAgY29uc3Qgb3B0aW9ucyA9IG5ldyBPcHRpb25zKG9wdHMpO1xuICBjb25zdCB0b2tlbnMgPSB0b2tlbml6ZShzdHIpO1xuICBjb25zdCBmaWx0ZXJlZCA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHRva2VuID0gdG9rZW5zW2ldO1xuICAgIGlmICh0b2tlbi5pc0xpbmsgJiYgKCF0eXBlIHx8IHRva2VuLnQgPT09IHR5cGUpKSB7XG4gICAgICBmaWx0ZXJlZC5wdXNoKHRva2VuLnRvRm9ybWF0dGVkT2JqZWN0KG9wdGlvbnMpKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZpbHRlcmVkO1xufVxuXG4vKipcbiAqIElzIHRoZSBnaXZlbiBzdHJpbmcgdmFsaWQgbGlua2FibGUgdGV4dCBvZiBzb21lIHNvcnQuIE5vdGUgdGhhdCB0aGlzIGRvZXMgbm90XG4gKiB0cmltIHRoZSB0ZXh0IGZvciB5b3UuXG4gKlxuICogT3B0aW9uYWxseSBwYXNzIGluIGEgc2Vjb25kIGB0eXBlYCBwYXJhbSwgd2hpY2ggaXMgdGhlIHR5cGUgb2YgbGluayB0byB0ZXN0XG4gKiBmb3IuXG4gKlxuICogRm9yIGV4YW1wbGUsXG4gKlxuICogICAgIGxpbmtpZnkudGVzdChzdHIsICdlbWFpbCcpO1xuICpcbiAqIFJldHVybnMgYHRydWVgIGlmIHN0ciBpcyBhIHZhbGlkIGVtYWlsLlxuICogQHBhcmFtIHtzdHJpbmd9IHN0ciBzdHJpbmcgdG8gdGVzdCBmb3IgbGlua3NcbiAqIEBwYXJhbSB7c3RyaW5nfSBbdHlwZV0gb3B0aW9uYWwgc3BlY2lmaWMgbGluayB0eXBlIHRvIGxvb2sgZm9yXG4gKiBAcmV0dXJucyBib29sZWFuIHRydWUvZmFsc2VcbiAqL1xuZnVuY3Rpb24gdGVzdChzdHIsIHR5cGUpIHtcbiAgaWYgKHR5cGUgPT09IHZvaWQgMCkge1xuICAgIHR5cGUgPSBudWxsO1xuICB9XG4gIGNvbnN0IHRva2VucyA9IHRva2VuaXplKHN0cik7XG4gIHJldHVybiB0b2tlbnMubGVuZ3RoID09PSAxICYmIHRva2Vuc1swXS5pc0xpbmsgJiYgKCF0eXBlIHx8IHRva2Vuc1swXS50ID09PSB0eXBlKTtcbn1cblxuZXhwb3J0IHsgTXVsdGlUb2tlbiwgT3B0aW9ucywgU3RhdGUsIGNyZWF0ZVRva2VuQ2xhc3MsIGZpbmQsIGluaXQsIG11bHRpLCBvcHRpb25zLCByZWdleHAsIHJlZ2lzdGVyQ3VzdG9tUHJvdG9jb2wsIHJlZ2lzdGVyUGx1Z2luLCByZWdpc3RlclRva2VuUGx1Z2luLCByZXNldCwgc3RyaW5nVG9BcnJheSwgdGVzdCwgdG9rZW5pemUgfTtcbiIsICJpbXBvcnQgR09iamVjdCBmcm9tIFwiZ2k6Ly9HT2JqZWN0XCI7XG5pbXBvcnQgR3RrIGZyb20gXCJnaTovL0d0az92ZXJzaW9uPTQuMFwiO1xuaW1wb3J0IEFkdyBmcm9tIFwiZ2k6Ly9BZHdcIjtcbmltcG9ydCBHZGsgZnJvbSBcImdpOi8vR2RrP3ZlcnNpb249NC4wXCI7XG5cbmV4cG9ydCBjbGFzcyBUaGVtZVNlbGVjdG9yIGV4dGVuZHMgR3RrLldpZGdldCB7XG4gIHN0YXRpYyB7XG4gICAgR09iamVjdC5yZWdpc3RlckNsYXNzKFxuICAgICAge1xuICAgICAgICBHVHlwZU5hbWU6IFwiVGhlbWVTZWxlY3RvclwiLFxuICAgICAgICBUZW1wbGF0ZTogXCJyZXNvdXJjZTovLy9jb20vdml4YWxpZW4vc3RpY2t5L3VpL3RoZW1lLXNlbGVjdG9yLnVpXCIsXG4gICAgICAgIENzc05hbWU6IFwidGhlbWVzZWxlY3RvclwiLFxuICAgICAgICBJbnRlcm5hbENoaWxkcmVuOiBbXCJmb2xsb3dcIl0sXG4gICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICB0aGVtZTogR09iamVjdC5QYXJhbVNwZWMuc3RyaW5nKFxuICAgICAgICAgICAgXCJ0aGVtZVwiLCAvLyBOYW1lXG4gICAgICAgICAgICBcIlRoZW1lXCIsIC8vIE5pY2tcbiAgICAgICAgICAgIFwiVGhlbWVcIiwgLy8gQmx1cmJcbiAgICAgICAgICAgIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsXG4gICAgICAgICAgICAvLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgICAgICAgICAgbnVsbCwgLy8gRGVmYXVsdCB2YWx1ZVxuICAgICAgICAgICksXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgdGhpcyxcbiAgICApO1xuXG4gICAgdGhpcy5zZXRfbGF5b3V0X21hbmFnZXJfdHlwZShHdGsuQmluTGF5b3V0LiRndHlwZSk7XG4gIH1cblxuICB0aGVtZTogc3RyaW5nO1xuXG4gIGRlY2xhcmUgX2ZvbGxvdzogR3RrLkNoZWNrQnV0dG9uO1xuXG4gIHN0eWxlX21hbmFnZXI6IEFkdy5TdHlsZU1hbmFnZXI7XG5cbiAgY29uc3RydWN0b3IocGFyYW1zID0ge30pIHtcbiAgICBzdXBlcihwYXJhbXMpO1xuXG4gICAgdGhpcy5zdHlsZV9tYW5hZ2VyID0gQWR3LlN0eWxlTWFuYWdlci5nZXRfZGVmYXVsdCgpO1xuXG4gICAgdGhpcy5zdHlsZV9tYW5hZ2VyLmNvbm5lY3QoXG4gICAgICBcIm5vdGlmeTo6c3lzdGVtLXN1cHBvcnRzLWNvbG9yLXNjaGVtZXNcIixcbiAgICAgIHRoaXMuX29uX25vdGlmeV9zeXN0ZW1fc3VwcG9ydHNfY29sb3Jfc2NoZW1lcy5iaW5kKHRoaXMpLFxuICAgICk7XG4gICAgdGhpcy5fb25fbm90aWZ5X3N5c3RlbV9zdXBwb3J0c19jb2xvcl9zY2hlbWVzKCk7XG5cbiAgICBjb25zdCBkYXJrID0gdGhpcy5zdHlsZV9tYW5hZ2VyLmdldF9kYXJrKCk7XG4gICAgdGhpcy50aGVtZSA9IGRhcmsgPyBcImRhcmtcIiA6IFwibGlnaHRcIjtcblxuICAgIHRoaXMuc3R5bGVfbWFuYWdlci5jb25uZWN0KFwibm90aWZ5OjpkYXJrXCIsIHRoaXMuX29uX25vdGlmeV9kYXJrLmJpbmQodGhpcykpO1xuICAgIHRoaXMuX29uX25vdGlmeV9kYXJrKCk7XG5cbiAgICBjb25zdCBwcm92aWRlciA9IG5ldyBHdGsuQ3NzUHJvdmlkZXIoKTtcbiAgICBwcm92aWRlci5sb2FkX2Zyb21fcmVzb3VyY2UoXCIvY29tL3ZpeGFsaWVuL3N0aWNreS90aGVtZS1zZWxlY3Rvci5jc3NcIik7XG4gICAgR3RrLlN0eWxlQ29udGV4dC5hZGRfcHJvdmlkZXJfZm9yX2Rpc3BsYXkoXG4gICAgICBHZGsuRGlzcGxheS5nZXRfZGVmYXVsdCgpISxcbiAgICAgIHByb3ZpZGVyLFxuICAgICAgR3RrLlNUWUxFX1BST1ZJREVSX1BSSU9SSVRZX0FQUExJQ0FUSU9OLFxuICAgICk7XG4gIH1cblxuICBfb25fbm90aWZ5X3N5c3RlbV9zdXBwb3J0c19jb2xvcl9zY2hlbWVzKCkge1xuICAgIHRoaXMuX2ZvbGxvdy5zZXRfdmlzaWJsZShcbiAgICAgIHRoaXMuc3R5bGVfbWFuYWdlci5nZXRfc3lzdGVtX3N1cHBvcnRzX2NvbG9yX3NjaGVtZXMoKSxcbiAgICApO1xuICB9XG5cbiAgX29uX25vdGlmeV9kYXJrKCkge1xuICAgIGlmICh0aGlzLnN0eWxlX21hbmFnZXIuZ2V0X2RhcmsoKSkgdGhpcy5hZGRfY3NzX2NsYXNzKFwiZGFya1wiKTtcbiAgICBlbHNlIHRoaXMucmVtb3ZlX2Nzc19jbGFzcyhcImRhcmtcIik7XG4gIH1cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUF5QkEsT0FBT0EsY0FBYTtBQUNwQixPQUFPQyxVQUFTO0FBQ2hCLE9BQU9DLFVBQVM7OztBQ0ZoQixPQUFPQyxjQUFhO0FBQ3BCLE9BQU9DLFVBQVM7QUFDaEIsT0FBT0MsV0FBVTs7O0FDRmpCLE9BQU8sU0FBUztBQUNoQixPQUFPLFNBQVM7QUFDaEIsT0FBTyxVQUFVO0FBQ2pCLE9BQU8sYUFBYTtBQUdwQixJQUFJO0FBQUEsRUFDRixJQUFJLEtBQUs7QUFBQSxFQUNUO0FBQUEsRUFDQTtBQUNGO0FBRUEsSUFBSTtBQUFBLEVBQ0YsSUFBSSxLQUFLO0FBQUEsRUFDVDtBQUFBLEVBQ0E7QUFDRjtBQXFCTyxJQUFLLFFBQUwsa0JBQUtDLFdBQUw7QUFDTCxFQUFBQSxjQUFBLFlBQVcsS0FBWDtBQUNBLEVBQUFBLGNBQUE7QUFDQSxFQUFBQSxjQUFBO0FBQ0EsRUFBQUEsY0FBQTtBQUNBLEVBQUFBLGNBQUE7QUFDQSxFQUFBQSxjQUFBO0FBQ0EsRUFBQUEsY0FBQTtBQUNBLEVBQUFBLGNBQUE7QUFSVSxTQUFBQTtBQUFBLEdBQUE7QUFXTCxJQUFNLGFBQWEsb0JBQUksSUFBSTtBQUFBLEVBQ2hDLENBQUMsZ0JBQWMsRUFBRSxRQUFRLENBQUM7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QkFBcUI7QUFBQSxFQUM1QjtBQUFBLEVBRUEsa0JBQWtCLE9BQW1CO0FBQ25DLFNBQUssUUFBUSxVQUFVLFVBQVUsS0FBSyxjQUNwQyxVQUFVLEtBQUs7QUFFakIsU0FBSyxPQUFPLGtCQUFrQixLQUFLO0FBQUEsRUFDckM7QUFDRjtBQWhNTyxJQUFNLGNBQU47QUFBQSxDQUNMLE1BQU87QUFDTCxFQUFBQyxTQUFRO0FBQUEsSUFDTjtBQUFBLE1BQ0UsVUFBVTtBQUFBLE1BQ1YsV0FBVztBQUFBLE1BQ1gsa0JBQWtCO0FBQUEsUUFDaEI7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLE1BQ0EsU0FBUztBQUFBLFFBQ1Asa0JBQWtCO0FBQUEsVUFDaEIsYUFBYSxDQUFDQSxTQUFRLFdBQVc7QUFBQSxRQUNuQztBQUFBLFFBQ0EsU0FBUztBQUFBLFVBQ1AsYUFBYSxDQUFDQSxTQUFRLFdBQVc7QUFBQSxRQUNuQztBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFDRjsiLAogICJuYW1lcyI6IFsiR09iamVjdCIsICJHdGsiLCAiQWR3IiwgIkdPYmplY3QiLCAiR3RrIiwgIkdMaWIiLCAiU3R5bGUiLCAiXyIsICJHT2JqZWN0IiwgIkFkdyIsICJuZXh0U3RhdGUiLCAic2NoZW1lIiwgIkFkdyIsICJHT2JqZWN0IiwgImNoYXJzIiwgIkd0ayIsICJHTGliIiwgIkdPYmplY3QiLCAiR09iamVjdCIsICJHdGsiLCAiQWR3IiwgIkFkdyIsICJHdGsiLCAiXyIsICJjYXJkIiwgIkdPYmplY3QiXQp9Cg==
