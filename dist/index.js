import { unknownMethod as L, createPortChannel as M, ChannelCallError as R } from "./transport/createPortChannel.js";
import { PROTOCOL_VERSION as I } from "./types.js";
const m = /* @__PURE__ */ new Map(), B = (e, t) => m.set(e, t), j = (e) => m.delete(e), U = (e) => {
  const { action: t, context: o } = e ?? {}, r = m.get(String(t));
  if (!r) throw new Error(`This extension registered no action named "${t}"`);
  return r(o ?? {});
}, N = /* @__PURE__ */ new Map([["action.invoke", U]]), q = (e, t) => {
  const o = N.get(e);
  if (!o) throw L(e);
  return o(t);
}, _ = "app";
let h = null, p = null, c = null;
const y = /* @__PURE__ */ new Map(), F = (e) => c = e, v = () => c, E = (e, t) => {
  if (t) throw new Error(`This extension already registered its "${e}" slot`);
}, H = (e) => {
  E("main", h !== null), h = e;
}, d = (e, t) => {
  E(e, y.has(e)), y.set(e, t);
}, J = (e) => {
  if (p) throw new Error("This extension already registered a mount adapter");
  p = e;
};
let k;
const G = (e, t, o, r) => {
  if (typeof e.mount == "function") return e.mount(o, r);
  if (p && e.default) return p(e.default, o, r);
  throw new Error(
    `The module for the "${t}" slot exports no "mount(element, props)", and this extension registered no mount adapter. Call builder.use(vueAdapter) from "frappe-builder-extension-sdk/vue".`
  );
}, K = async (e = {}) => {
  if (c === "main") return h?.();
  const t = c && y.get(c);
  if (!t) return void console.warn(`This extension registered no "${c}" slot`);
  const o = document.getElementById(_);
  if (!o) throw new Error(`The extension shell has no #${_} to mount into`);
  const r = await t.component();
  k = G(r, c, o, e), window.addEventListener("pagehide", () => k?.(), { once: !0 });
}, V = new URL(import.meta.url).origin;
let l = null, w = {};
const g = () => {
  if (!l) throw new Error("The Builder SDK is not connected yet");
  return l;
}, z = () => w, Q = (e) => typeof e == "object" && e !== null && e.type === "connect" && e.v === I, D = (e) => document.documentElement.setAttribute("data-theme", String(e)), W = async (e) => {
  if (e.source === void 0) {
    if (!e.entry) throw new Error("The connect message carried no extension code");
    await import(
      /* @vite-ignore */
      e.entry
    );
    return;
  }
  const t = URL.createObjectURL(new Blob([e.source], { type: "text/javascript" }));
  try {
    await import(
      /* @vite-ignore */
      t
    );
  } finally {
    URL.revokeObjectURL(t);
  }
}, X = async (e, t) => {
  l = M(t, q), l.listen("theme", D), D(e.theme), w = e.props ?? {}, F(e.slot), await W(e), await K(w), l.emit("slot.ready");
}, Y = () => {
  window.addEventListener("message", (e) => {
    e.origin === V && (l || !Q(e.data) || !e.ports[0] || X(e.data, e.ports[0]).catch(
      (t) => console.error(`[builder] the "${e.data.slot}" frame could not start`, t)
    ));
  });
}, n = (e, t) => g().call(e, t), a = (e, t) => {
  if (v() !== "main") return Promise.resolve();
  const o = n(e, t);
  return o.catch((r) => {
    if (r.code === "unknown_method") {
      console.warn(`[builder] this Builder has no "${e}", so that surface is skipped`);
      return;
    }
    console.error(`[builder] "${e}" was refused`, r);
  }), o;
}, P = (e, t) => (v() === "main" && B(e, t), a("actions.register", { name: e })), b = (e, t = "") => {
  if (typeof e.action != "function") return e;
  const o = `${t}${e.name}`;
  return P(o, e.action), { ...e, action: o };
}, O = (e, t) => t.map((o) => b(o, `${e}.`)), Z = {
  register: ({ component: e, ...t }) => (e && d("panel", { component: e }), a("leftPanel.register", t)),
  unregister: (e) => n("leftPanel.unregister", { name: e }),
  update: (e, t) => n("leftPanel.update", { name: e, patch: t })
}, ee = {
  register: (e) => a("open.register", e),
  unregister: () => n("open.unregister")
}, te = {
  register: (e) => a("toolbar.register", b(e)),
  unregister: (e) => n("toolbar.unregister", { name: e }),
  update: (e, t) => n("toolbar.update", { name: e, patch: t })
}, ne = {
  register: (e) => a("contextMenu.register", b(e)),
  unregister: (e) => n("contextMenu.unregister", { name: e }),
  update: (e, t) => n("contextMenu.update", { name: e, patch: t })
}, oe = {
  registerSection: (e) => a("properties.registerSection", {
    ...e,
    controls: O(e.name, e.controls)
  }),
  unregisterSection: (e) => n("properties.unregisterSection", { name: e }),
  /** Replaces the whole list, for a control list that depends on the extension's own state. */
  setControls: (e, t) => n("properties.setControls", { name: e, controls: O(e, t) }),
  update: (e, t) => n("properties.update", { name: e, patch: t })
}, re = {
  registerItem: ({ component: e, ...t }) => (e && d("settings", { component: e }), a("settings.registerItem", t)),
  unregisterItem: (e) => n("settings.unregisterItem", { name: e }),
  update: (e, t) => n("settings.update", { name: e, patch: t })
}, se = {
  /** The whole snapshot, once. For startup. */
  get: () => n("context.get"),
  /**
   * Names the fields this extension cares about, so the host sends nothing else
   * and only when one of them changes.
   *
   * Use it for a fact no rule can state — `isSVG` is in the snapshot but is not
   * a rule key — and push the answer back with `update`. Use `showWhen` for
   * anything the rule vocabulary already covers: it costs no messages.
   */
  subscribe: (e, t) => {
    let o = "";
    const r = g().listen("context", (C) => {
      const S = C, x = JSON.stringify(e.map((T) => S[T]));
      x !== o && (o = x, t(S));
    });
    return n("context.subscribe", { fields: e }), r;
  }
}, ie = {
  /** One block and its subtree, as a plain object. The id comes from the context or a menu row. */
  get: (e) => n("block.get", { blockId: e }),
  /** Refused without `block.update`, and refused again while the page is read-only. */
  update: (e, t) => n("block.update", { blockId: e, ...t }),
  /**
   * A new block inside `parentId`, appended unless `index` names a place.
   *
   * A block carries its own `children`, so a whole form or card is one call and
   * one undo step. Nothing is added until the whole tree reads clean, so a
   * refusal leaves the page untouched.
   *
   * Answers with the root's `blockId`, and with `keys`: every `key` named in
   * the tree, mapped to the block it became. The new blocks are not selected:
   * the selection stays the user's.
   */
  insert: (e, t, o) => n("block.insert", { parentId: e, block: t, index: o })
}, ce = {
  /**
   * The tree the canvas holds, as a list of roots. A node carries its own
   * `children`, so walk it to reach every block.
   *
   * While the user edits a component this answers with that component, because
   * those are the ids `block.get` and `block.update` can resolve. Read
   * `context.editingMode` to tell the two apart.
   */
  getBlocks: () => n("page.getBlocks"),
  /**
   * Puts one script on the open page, and rewrites it on a later call.
   *
   * The script runs on the published page, never in the editor canvas, so the
   * editor shows what a block is set to and the page shows what it does.
   *
   * One JavaScript and one CSS script per extension per page. Creating the
   * first of a type asks the user and names the page. Rewriting it does not.
   *
   * Needs `page.write`, and is refused again while the page is read-only.
   */
  attachScript: (e) => n("page.attachScript", e),
  /** Unlinks and deletes this extension's script of that type. Quiet when it has none. */
  detachScript: (e) => n("page.detachScript", { type: e }),
  /** This extension's own scripts on the open page, and nobody else's. */
  listScripts: () => n("page.listScripts")
}, ae = {
  /** Everything this extension has stored. Per browser and per user. */
  get: () => n("state.get"),
  /** Merged at the top level. Never removes a key the patch leaves unmentioned. */
  set: (e) => n("state.set", { state: e }),
  unset: (e) => n("state.unset", { key: e })
}, le = {
  /**
   * Upserts by `key`, and never deletes what the call leaves unmentioned.
   *
   * A network call, not a client write: the row has to exist server-side to
   * reach the published site, so this resolves only once Frappe answers.
   */
  set: (e) => n("tokens.set", { tokens: e }),
  unset: (e) => n("tokens.unset", { key: e })
}, i = {
  /**
   * Asks the user for access to one doctype, in a Builder dialog.
   *
   * The one method here that can open a dialog. Call it when the user is
   * expecting it — behind a button they pressed — because it is modal.
   *
   * It returns without asking when the grant already covers everything named,
   * and when the user said no last time. Read `denied` on the answer to tell
   * "not yet asked" from "already refused".
   */
  requestAccess: (e, t) => n("data.requestAccess", { doctype: e, access: t }),
  /** What this extension may already do, without asking for anything. */
  getAccess: (e) => n("data.getAccess", { doctype: e }),
  /**
   * One page of documents. Needs a `read` grant on the doctype.
   *
   * Every call below refuses with the code `grant_required` when no grant
   * covers the doctype. That is the one refusal worth catching: it means ask
   * the user. Any other refusal is the site saying no, and asking again will
   * not change it.
   */
  getList: (e, t = {}) => n("data.getList", { doctype: e, ...t }),
  /** How many documents match, without fetching them. Needs `read`. */
  getCount: (e, t) => n("data.getCount", { doctype: e, filters: t }),
  /** One whole document, child tables included. Needs `read`. */
  getDoc: (e, t) => n("data.getDoc", { doctype: e, name: t }),
  /** A new document. Needs `write`. Answers with the inserted document. */
  insert: (e, t) => n("data.insert", { doctype: e, doc: t }),
  /** A patch, not a replacement. Needs `write`. Answers with the saved document. */
  update: (e, t, o) => n("data.update", { doctype: e, name: t, doc: o }),
  /** Needs its own `delete` grant: losing a record is not changing one. */
  delete: (e, t) => n("data.delete", { doctype: e, name: t })
}, ue = {
  /**
   * A new custom doctype, owned by this extension.
   *
   * The user is asked first, by name, and the call is refused with the code
   * `refused` if they say no. It needs the `schema.write` capability, and it
   * needs the **user** to be a System Manager: Frappe wants create permission
   * on `DocType` and nothing here lifts that.
   *
   * The extension is given a full grant on what it made, so `data.*` works on
   * it with no second question.
   */
  createDoctype: (e, t, o = {}) => n("schema.createDoctype", { doctype: e, fields: t, ...o }),
  /** The field list of a doctype this extension may read. */
  getDoctype: (e) => n("schema.getDoctype", { doctype: e }),
  /**
   * Adds fields, and updates the ones already there by fieldname.
   *
   * Never removes a field the call leaves unmentioned, because removing one
   * drops a column and the data in it. Only the extension that made the
   * doctype may call this.
   */
  updateDoctype: (e, t) => n("schema.updateDoctype", { doctype: e, fields: t }),
  /** Drops a doctype this extension made, and its table. The user is asked first. */
  deleteDoctype: (e) => n("schema.deleteDoctype", { doctype: e }),
  /** Every doctype this extension made, and whether each still exists. */
  listDoctypes: () => n("schema.listDoctypes")
}, pe = {
  /**
   * The handler stays in this frame, and the host learns only the name.
   *
   * Only the entry frame holds and names it, so the host always calls the frame
   * that outlives the others.
   */
  register: (e, t) => P(e, t),
  unregister: (e) => v() !== "main" ? Promise.resolve() : (j(e), n("actions.unregister", { name: e })),
  /** Runs an action this extension owns, from any of its frames. */
  run: (e, t) => n("actions.run", { name: e, context: t })
}, f = (e, t = "unsupported_request") => new R({ message: `[builder] ${e}`, code: t }), A = (e) => e ? JSON.parse(JSON.stringify(e)) : {}, s = (e, t, o) => {
  const r = e[t];
  if (typeof r != "string" || !r)
    throw f(`${o} needs a "${t}".`, "invalid_params");
  return r;
}, de = (e) => {
  const t = e.fieldname;
  if (typeof t == "string") return { [t]: e.value };
  if (!t || typeof t != "object")
    throw f('frappe.client.set_value needs a "fieldname".', "invalid_params");
  return t;
}, ge = (e) => ({
  fields: e.fields,
  filters: e.filters,
  orFilters: e.or_filters,
  orderBy: e.order_by,
  groupBy: e.group_by,
  start: e.limit_start,
  pageLength: e.limit_page_length
}), $ = {
  "frappe.client.get_list": (e) => {
    if (e.parent)
      throw f('"parent" is not supported: grant the parent doctype instead.');
    return i.getList(s(e, "doctype", "frappe.client.get_list"), ge(e));
  },
  "frappe.client.get_count": (e) => i.getCount(
    s(e, "doctype", "frappe.client.get_count"),
    e.filters
  ),
  "frappe.client.get": (e) => i.getDoc(
    s(e, "doctype", "frappe.client.get"),
    s(e, "name", "frappe.client.get")
  ),
  // the doctype travels inside the document here, not beside it
  "frappe.client.insert": (e) => {
    const t = A(e.doc);
    return i.insert(s(t, "doctype", "frappe.client.insert"), t);
  },
  "frappe.client.set_value": (e) => i.update(
    s(e, "doctype", "frappe.client.set_value"),
    s(e, "name", "frappe.client.set_value"),
    de(e)
  ),
  "frappe.client.delete": (e) => i.delete(
    s(e, "doctype", "frappe.client.delete"),
    s(e, "name", "frappe.client.delete")
  )
}, fe = (e) => {
  const t = e?.url ?? "", o = $[t];
  if (!o)
    throw f(
      `no route for "${t}". An extension reaches site data through a doctype it was granted, so a resource may name only: ${Object.keys($).join(", ")}.`
    );
  return o(A(e.params));
}, u = (e, t) => g().call(e, t), he = (e = {}) => u("ui.openDialog", e), ye = (e) => u("ui.closeDialog", { result: e }), we = (e = {}) => u("ui.openPopover", e), me = (e) => u("ui.closePopover", { result: e }), ve = (e, t = {}) => u("ui.toast", { message: e, ...t }), be = {
  openDialog: he,
  closeDialog: ye,
  openPopover: we,
  closePopover: me,
  toast: ve,
  /** What the open call was made with. Read by the document the slot mounted. */
  props: () => z()
}, _e = {
  /**
   * Imperative startup work, in the hidden entry frame only.
   *
   * Registrations do not belong here. They are declarations, and every frame
   * needs to read them, so they go at module scope.
   */
  main: (e) => H(e),
  /**
   * Names the layer that mounts a component, once for this extension.
   *
   * `frappe-builder-extension-sdk/vue` exports `vueAdapter`. Without one, a
   * slot's module has to export `mount(element, props)` itself.
   */
  use: (e) => J(e),
  /**
   * The document `ui.openDialog` opens. Builder tells nobody: a dialog is
   * opened by a call, so this registration stays in the frame that made it.
   */
  dialog: {
    register: (e) => d("dialog", e)
  },
  /** The same, for the floating panel `ui.openPopover` opens. */
  popover: {
    register: (e) => d("popover", e)
  },
  /**
   * What the Open button in this extension's details pane opens: a popover, a
   * dialog, or its own left panel tab. Declare none and the pane draws none.
   */
  open: ee,
  /** One tab, registered from the entry frame and drawn by the host (Tier C). */
  leftPanel: Z,
  /** A descriptor. Builder draws the button and posts the action back (Tier A). */
  toolbar: te,
  /** A row in the block menu. Its rule is answered for the block under the cursor. */
  contextMenu: ne,
  /** Tier B. A list naming Builder's own controls, which the host renders. */
  properties: oe,
  /** One page in the settings dialog, and the document it loads. */
  settings: re,
  /** The editor snapshot: read it once, or name the fields to be told about. */
  context: se,
  /** One block, by the id a menu row or the snapshot handed over. */
  block: ie,
  /** The whole tree, when one block is not enough. */
  page: ce,
  /** A modal, and a draggable popover, the host draws around this extension's own document. */
  ui: be,
  /** This extension's own storage. No capability, because Builder never reads it. */
  state: ae,
  /** Real `Builder Token` rows, so they reach the published site too. */
  tokens: le,
  /**
   * Site data. Ask the user for a doctype first: nothing here is granted at install.
   *
   * `fetcher` is added here rather than in `namespaces.ts` so that file never
   * imports the one that reads it back. Wire it once, in the entry:
   *
   * ```js
   * import { setConfig } from "frappe-ui";
   * setConfig("resourceFetcher", builder.data.fetcher);
   * ```
   *
   * Then `createListResource` and `createDocumentResource` work as they do in
   * any Frappe app. The grant still comes first: a resource errors with
   * `grant_required` until `requestAccess` has been answered.
   */
  data: { ...i, fetcher: fe },
  /** Doctypes this extension creates. The user is asked before a table is made or dropped. */
  schema: ue,
  /** The functions this extension owns. A descriptor names one, the host calls it. */
  actions: pe,
  host: {
    /** Which Builder this extension landed in. An extension ships on its own schedule. */
    info: () => g().call("host.info")
  }
};
Y();
export {
  _e as default
};
