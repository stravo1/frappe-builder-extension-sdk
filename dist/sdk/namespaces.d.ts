/**
 * `builder.<surface>.<verb>` over one call.
 *
 * Registrations are declarations, written at module scope. Every frame of an
 * extension imports the same module, so every frame reads them — which is what
 * lets a panel tab declare the document it loads in the same breath as the tab
 * itself, even though the two are used in different frames.
 *
 * Only the entry frame tells the host. A declaration read in a panel frame
 * records what that frame needs locally and sends nothing, so the host hears
 * each registration once however many frames are open.
 *
 * Nothing is validated here. The host validates every parameter (1.12), and a
 * copy of a rule on this side would be a second thing to keep in step.
 */
import { type ActionHandler } from "./actions";
export type ShowWhen = Record<string, unknown>;
/** Resolves to the module holding a slot's document. */
export type SlotLoader = () => Promise<unknown>;
export type LeftPanelRegistration = {
    name: string;
    label: string;
    icon: string;
    /** What the tab's frame paints. Declared here because the tab is what shows it. */
    load?: SlotLoader;
    before?: string;
    after?: string;
    showWhen?: ShowWhen;
};
export type ToolbarRegistration = {
    name: string;
    region: "left" | "center" | "right";
    icon: string;
    label?: string;
    tooltip?: string;
    /** The name of an action this extension registered. */
    action?: string;
    badge?: string | number | null;
    before?: string;
    after?: string;
    showWhen?: ShowWhen;
    enableWhen?: ShowWhen;
};
export type ContextMenuRegistration = {
    name: string;
    label: string;
    /** The name of an action this extension registered. A row with none does nothing. */
    action: string;
    /** Which menu the row belongs to. Fixed at registration. Defaults to "both". */
    menu?: "canvas" | "layers" | "both";
    before?: string;
    after?: string;
    showWhen?: ShowWhen;
    enableWhen?: ShowWhen;
};
export type SettingsRegistration = {
    name: string;
    label: string;
    title: string;
    icon: string;
    /** What the settings frame paints. Declared here, because this item shows it. */
    load?: SlotLoader;
    before?: string;
    after?: string;
};
/** Which Builder control the host renders. A section holds values, not triggers. */
export type ControlName = "text" | "number" | "select" | "toggle" | "color" | "range";
/** One control in a property section (Tier B). The host renders it (B3, B4). */
export type Control = {
    name: string;
    control: ControlName;
    label?: string;
    placeholder?: string;
    /** The host writes the block itself. Needs the `block.update` capability. */
    bind?: {
        attribute?: string;
        style?: string;
    };
    /** The extension's own value, when no block property holds it (B4). */
    value?: unknown;
    /** An action to invoke after a bound write, or on every change when unbound. */
    action?: string;
    /** For "select" and "toggle". A toggle option may carry an icon. */
    options?: Array<{
        label: string;
        value: string;
        icon?: string;
    }>;
    min?: number;
    max?: number;
    step?: number;
    /** Per control, so one control can hide while the rest of the section stays. */
    showWhen?: ShowWhen;
};
export type PropertiesRegistration = {
    name: string;
    /** The section header. Defaults to `name`. */
    label?: string;
    controls: Control[];
    before?: string;
    after?: string;
    showWhen?: ShowWhen;
};
export type ItemPatch = {
    visible?: boolean;
    enabled?: boolean;
    label?: string;
    icon?: string;
    tooltip?: string;
    badge?: string | number | null;
};
export declare const leftPanel: {
    register: ({ load, ...registration }: LeftPanelRegistration) => Promise<unknown>;
    unregister: (name: string) => Promise<unknown>;
    update: (name: string, patch: ItemPatch) => Promise<unknown>;
};
export declare const toolbar: {
    register: (registration: ToolbarRegistration) => Promise<unknown>;
    unregister: (name: string) => Promise<unknown>;
    update: (name: string, patch: ItemPatch) => Promise<unknown>;
};
export declare const contextMenu: {
    register: (registration: ContextMenuRegistration) => Promise<unknown>;
    unregister: (name: string) => Promise<unknown>;
    update: (name: string, patch: ItemPatch) => Promise<unknown>;
};
export declare const properties: {
    registerSection: (registration: PropertiesRegistration) => Promise<unknown>;
    unregisterSection: (name: string) => Promise<unknown>;
    /** Replaces the whole list, for a control list that depends on the extension's own state. */
    setControls: (name: string, controls: Control[]) => Promise<unknown>;
    update: (name: string, patch: ItemPatch) => Promise<unknown>;
};
export declare const settings: {
    registerItem: ({ load, ...registration }: SettingsRegistration) => Promise<unknown>;
    unregisterItem: (name: string) => Promise<unknown>;
    update: (name: string, patch: ItemPatch) => Promise<unknown>;
};
export type ContextField = "selection" | "breakpoint" | "editingMode" | "readOnly" | "isAIEnabled" | "page" | "site";
export type ContextHandler = (context: Record<string, unknown>) => void;
export declare const context: {
    /** The whole snapshot, once. For startup. */
    get: () => Promise<Record<string, unknown>>;
    /**
     * Names the fields this extension cares about, so the host sends nothing else
     * and only when one of them changes.
     *
     * Use it for a fact no rule can state — `isSVG` is in the snapshot but is not
     * a rule key — and push the answer back with `update`. Use `showWhen` for
     * anything the rule vocabulary already covers: it costs no messages.
     */
    subscribe: (fields: ContextField[], handler: ContextHandler) => () => boolean;
};
export type BlockPatch = {
    attributes?: Record<string, string | null>;
    /** Lands on the breakpoint the user is looking at unless `breakpoint` names one. */
    styles?: Record<string, string | number | null>;
    classes?: string[];
    innerHTML?: string;
    breakpoint?: "desktop" | "tablet" | "mobile";
};
export declare const block: {
    /** One block and its subtree, as a plain object. The id comes from the context or a menu row. */
    get: (blockId: string) => Promise<Record<string, unknown>>;
    /** Refused without `block.update`, and refused again while the page is read-only. */
    update: (blockId: string, patch: BlockPatch) => Promise<unknown>;
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
    insert: (parentId: string, block: NewBlock, index?: number) => Promise<InsertedBlock>;
};
/** What `block.insert` draws. `element` is required, and everything else is optional. */
export type NewBlock = {
    element: string;
    attributes?: Record<string, string | null>;
    styles?: Record<string, string | number | null>;
    classes?: string[];
    innerHTML?: string;
    /** The caller's own name for this node, answered back as a `blockId`. Unique in one call. */
    key?: string;
    children?: NewBlock[];
};
export type InsertedBlock = {
    /** The root of what this call made. */
    blockId: string;
    /** Every `key` in the tree, and the block it became. Empty when the tree named none. */
    keys: Record<string, string>;
};
export declare const page: {
    /**
     * The tree the canvas holds, as a list of roots. A node carries its own
     * `children`, so walk it to reach every block.
     *
     * While the user edits a component this answers with that component, because
     * those are the ids `block.get` and `block.update` can resolve. Read
     * `context.editingMode` to tell the two apart.
     */
    getBlocks: () => Promise<Array<Record<string, unknown>>>;
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
    attachScript: (script: PageScript) => Promise<AttachedScript>;
    /** Unlinks and deletes this extension's script of that type. Quiet when it has none. */
    detachScript: (type: ScriptType) => Promise<unknown>;
    /** This extension's own scripts on the open page, and nobody else's. */
    listScripts: () => Promise<AttachedScript[]>;
};
export type ScriptType = "JavaScript" | "CSS";
export type PageScript = {
    type: ScriptType;
    /** The whole file. A later call replaces it, so send what the page should run. */
    script: string;
};
export type AttachedScript = {
    name: string;
    type: ScriptType;
    script: string;
};
export declare const state: {
    /** Everything this extension has stored. Per browser and per user. */
    get: () => Promise<Record<string, unknown>>;
    /** Merged at the top level. Never removes a key the patch leaves unmentioned. */
    set: (state: Record<string, unknown>) => Promise<unknown>;
    unset: (key: string) => Promise<unknown>;
};
/** One row in `Builder Token`, as an extension describes it (D6). */
export type ExtensionToken = {
    /** This extension's own stable id for the token. The record's name is a uuid. */
    key: string;
    token_name: string;
    type: "Color" | "Dimension" | "Font";
    value: string;
    dark_value?: string;
    group?: string;
};
export declare const tokens: {
    /**
     * Upserts by `key`, and never deletes what the call leaves unmentioned.
     *
     * A network call, not a client write: the row has to exist server-side to
     * reach the published site, so this resolves only once Frappe answers.
     */
    set: (tokens: ExtensionToken[]) => Promise<unknown>;
    unset: (key: string) => Promise<unknown>;
};
/** What one extension may do to one doctype, as the host answers it. */
export type Grant = {
    doctype: string;
    read: boolean;
    write: boolean;
    delete: boolean;
    /** The user said no last time, so `requestAccess` returns without a dialog. */
    denied: boolean;
};
export type Access = "read" | "write" | "delete";
/** One document, as Frappe holds it. Its fields are the doctype's own. */
export type Doc = Record<string, unknown>;
/**
 * The options `data.getList` takes, spelled the way `createListResource` spells
 * them, because an extension author is a frontend author.
 */
export type ListOptions = {
    fields?: string[];
    /** A dict of equalities, or Frappe's list form: `[["status", "!=", "Open"]]`. */
    filters?: Record<string, unknown> | unknown[];
    /** Matched with OR, beside `filters`, which is matched with AND. */
    orFilters?: Record<string, unknown> | unknown[];
    orderBy?: string;
    groupBy?: string;
    start?: number;
    /** Up to 500. The server refuses 0, which Frappe reads as every row. */
    pageLength?: number;
};
export declare const data: {
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
    requestAccess: (doctype: string, access: Access[]) => Promise<Grant>;
    /** What this extension may already do, without asking for anything. */
    getAccess: (doctype: string) => Promise<Grant>;
    /**
     * One page of documents. Needs a `read` grant on the doctype.
     *
     * Every call below refuses with the code `grant_required` when no grant
     * covers the doctype. That is the one refusal worth catching: it means ask
     * the user. Any other refusal is the site saying no, and asking again will
     * not change it.
     */
    getList: (doctype: string, options?: ListOptions) => Promise<Doc[]>;
    /** How many documents match, without fetching them. Needs `read`. */
    getCount: (doctype: string, filters?: ListOptions["filters"]) => Promise<number>;
    /** One whole document, child tables included. Needs `read`. */
    getDoc: (doctype: string, name: string) => Promise<Doc>;
    /** A new document. Needs `write`. Answers with the inserted document. */
    insert: (doctype: string, doc: Doc) => Promise<Doc>;
    /** A patch, not a replacement. Needs `write`. Answers with the saved document. */
    update: (doctype: string, name: string, doc: Doc) => Promise<Doc>;
    /** Needs its own `delete` grant: losing a record is not changing one. */
    delete: (doctype: string, name: string) => Promise<unknown>;
};
/** One field of a doctype an extension creates. */
export type SchemaField = {
    fieldname?: string;
    label?: string;
    /** A layout break and a Heading need no fieldname. A Table needs a child doctype, so it is refused. */
    fieldtype: string;
    /** The linked doctype for a Link, or the newline-separated choices for a Select. */
    options?: string;
    reqd?: boolean;
    unique?: boolean;
    default?: unknown;
    in_list_view?: boolean;
    read_only?: boolean;
    description?: string;
};
export type Doctype = {
    doctype: string;
    istable: boolean;
    fields: SchemaField[];
};
/** How a new document is named. Fixed at creation: changing it later renames nothing. */
export type Naming = "hash" | "autoincrement" | "prompt";
export declare const schema: {
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
    createDoctype: (doctype: string, fields: SchemaField[], options?: {
        naming?: Naming;
        istable?: boolean;
    }) => Promise<Doctype>;
    /** The field list of a doctype this extension may read. */
    getDoctype: (doctype: string) => Promise<Doctype>;
    /**
     * Adds fields, and updates the ones already there by fieldname.
     *
     * Never removes a field the call leaves unmentioned, because removing one
     * drops a column and the data in it. Only the extension that made the
     * doctype may call this.
     */
    updateDoctype: (doctype: string, fields: SchemaField[]) => Promise<Doctype>;
    /** Drops a doctype this extension made, and its table. The user is asked first. */
    deleteDoctype: (doctype: string) => Promise<unknown>;
    /** Every doctype this extension made, and whether each still exists. */
    listDoctypes: () => Promise<Array<{
        doctype: string;
        exists: boolean;
    }>>;
};
export declare const actions: {
    /**
     * The handler stays in this frame, and the host learns only the name.
     *
     * Only the entry frame holds and names it, so the host always calls the frame
     * that outlives the others.
     */
    register: (name: string, handler: ActionHandler) => Promise<unknown>;
    unregister: (name: string) => Promise<unknown>;
    /** Runs an action this extension owns, from any of its frames. */
    run: (name: string, context?: Record<string, unknown>) => Promise<unknown>;
};
