/**
 * `frappe-builder-extension-sdk` — the object an extension imports.
 *
 * The shell loads this file, and the import map resolves the same URL for the
 * extension's own import, so both get one module instance and one channel.
 */
import { type SlotEntry } from "./slots";
export type HostInfo = {
    version: string;
    protocol: number;
};
declare const builder: {
    /**
     * Imperative startup work, in the hidden entry frame only.
     *
     * Registrations do not belong here. They are declarations, and every frame
     * needs to read them, so they go at module scope.
     */
    main: (handler: () => void) => void;
    /**
     * A dialog has no registration to hang a loader on: it is opened by
     * `ui.openDialog`, never registered. So it declares its document on its own.
     * A panel and a settings page carry `load` on the item that shows them.
     */
    dialog: (entry: SlotEntry) => void;
    /** The same, for the floating panel `ui.openPopover` opens. */
    popover: (entry: SlotEntry) => void;
    /** One tab, registered from the entry frame and drawn by the host (Tier C). */
    leftPanel: {
        register: ({ load, ...registration }: import("./namespaces").LeftPanelRegistration) => Promise<unknown>;
        unregister: (name: string) => Promise<unknown>;
        update: (name: string, patch: import("./namespaces").ItemPatch) => Promise<unknown>;
    };
    /** A descriptor. Builder draws the button and posts the action back (Tier A). */
    toolbar: {
        register: (registration: import("./namespaces").ToolbarRegistration) => Promise<unknown>;
        unregister: (name: string) => Promise<unknown>;
        update: (name: string, patch: import("./namespaces").ItemPatch) => Promise<unknown>;
    };
    /** A row in the block menu. Its rule is answered for the block under the cursor. */
    contextMenu: {
        register: (registration: import("./namespaces").ContextMenuRegistration) => Promise<unknown>;
        unregister: (name: string) => Promise<unknown>;
        update: (name: string, patch: import("./namespaces").ItemPatch) => Promise<unknown>;
    };
    /** Tier B. A list naming Builder's own controls, which the host renders. */
    properties: {
        registerSection: (registration: import("./namespaces").PropertiesRegistration) => Promise<unknown>;
        unregisterSection: (name: string) => Promise<unknown>;
        setControls: (name: string, controls: import("./namespaces").Control[]) => Promise<unknown>;
        update: (name: string, patch: import("./namespaces").ItemPatch) => Promise<unknown>;
    };
    /** One page in the settings dialog, and the document it loads. */
    settings: {
        registerItem: ({ load, ...registration }: import("./namespaces").SettingsRegistration) => Promise<unknown>;
        unregisterItem: (name: string) => Promise<unknown>;
        update: (name: string, patch: import("./namespaces").ItemPatch) => Promise<unknown>;
    };
    /** The editor snapshot: read it once, or name the fields to be told about. */
    context: {
        get: () => Promise<Record<string, unknown>>;
        subscribe: (fields: import("./namespaces").ContextField[], handler: import("./namespaces").ContextHandler) => () => boolean;
    };
    /** One block, by the id a menu row or the snapshot handed over. */
    block: {
        get: (blockId: string) => Promise<Record<string, unknown>>;
        update: (blockId: string, patch: import("./namespaces").BlockPatch) => Promise<unknown>;
        insert: (parentId: string, block: import("./namespaces").NewBlock, index?: number) => Promise<import("./namespaces").InsertedBlock>;
    };
    /** The whole tree, when one block is not enough. */
    page: {
        getBlocks: () => Promise<Array<Record<string, unknown>>>;
        attachScript: (script: import("./namespaces").PageScript) => Promise<import("./namespaces").AttachedScript>;
        detachScript: (type: import("./namespaces").ScriptType) => Promise<unknown>;
        listScripts: () => Promise<import("./namespaces").AttachedScript[]>;
    };
    /** A modal, and a draggable popover, the host draws around this extension's own document. */
    ui: {
        openDialog: (options?: import("./ui").FrameOptions) => Promise<unknown>;
        closeDialog: (result?: unknown) => Promise<unknown>;
        openPopover: (options?: import("./ui").FrameOptions) => Promise<unknown>;
        closePopover: (result?: unknown) => Promise<unknown>;
        toast: (message: string, options?: import("./ui").ToastOptions) => Promise<unknown>;
        props: () => Record<string, unknown>;
    };
    /** This extension's own storage. No capability, because Builder never reads it. */
    state: {
        get: () => Promise<Record<string, unknown>>;
        set: (state: Record<string, unknown>) => Promise<unknown>;
        unset: (key: string) => Promise<unknown>;
    };
    /** Real `Builder Token` rows, so they reach the published site too. */
    tokens: {
        set: (tokens: import("./namespaces").ExtensionToken[]) => Promise<unknown>;
        unset: (key: string) => Promise<unknown>;
    };
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
    data: {
        fetcher: (options: import("./resourceFetcher").ResourceRequest) => Promise<unknown>;
        requestAccess: (doctype: string, access: import("./namespaces").Access[]) => Promise<import("./namespaces").Grant>;
        getAccess: (doctype: string) => Promise<import("./namespaces").Grant>;
        getList: (doctype: string, options?: import("./namespaces").ListOptions) => Promise<import("./namespaces").Doc[]>;
        getCount: (doctype: string, filters?: import("./namespaces").ListOptions["filters"]) => Promise<number>;
        getDoc: (doctype: string, name: string) => Promise<import("./namespaces").Doc>;
        insert: (doctype: string, doc: import("./namespaces").Doc) => Promise<import("./namespaces").Doc>;
        update: (doctype: string, name: string, doc: import("./namespaces").Doc) => Promise<import("./namespaces").Doc>;
        delete: (doctype: string, name: string) => Promise<unknown>;
    };
    /** Doctypes this extension creates. The user is asked before a table is made or dropped. */
    schema: {
        createDoctype: (doctype: string, fields: import("./namespaces").SchemaField[], options?: {
            naming?: import("./namespaces").Naming;
            istable?: boolean;
        }) => Promise<import("./namespaces").Doctype>;
        getDoctype: (doctype: string) => Promise<import("./namespaces").Doctype>;
        updateDoctype: (doctype: string, fields: import("./namespaces").SchemaField[]) => Promise<import("./namespaces").Doctype>;
        deleteDoctype: (doctype: string) => Promise<unknown>;
        listDoctypes: () => Promise<Array<{
            doctype: string;
            exists: boolean;
        }>>;
    };
    /** The functions this extension owns. A descriptor names one, the host calls it. */
    actions: {
        register: (name: string, handler: import("./actions").ActionHandler) => Promise<unknown>;
        unregister: (name: string) => Promise<unknown>;
        run: (name: string, context?: Record<string, unknown>) => Promise<unknown>;
    };
    host: {
        /** Which Builder this extension landed in. An extension ships on its own schedule. */
        info: () => Promise<HostInfo>;
    };
};
export default builder;
