/**
 * `frappe-builder-extension-sdk/vue` — the optional Vue layer (1.14).
 *
 * It ships in the author's bundle, not in `extension-sdk.js`, because it needs a
 * Vue runtime and the SDK ships none. That is also why it imports the SDK by its
 * bare specifier and never by a relative path: a relative import would put a
 * second copy of `connect.ts` in the author's bundle, holding no port and no
 * channel, and every call through it would throw.
 */
import type { ContextField } from "frappe-builder-extension-sdk";
import { type Component } from "vue";
/**
 * The editor snapshot, as a reactive object that follows the editor.
 *
 * Names the fields it wants, so the host sends nothing else and only when one of
 * them moves. The subscription stops with the component that opened it.
 */
export declare const useBuilderContext: (fields: ContextField[]) => {
    selection: {
        count: number;
        blockIds: string[];
        blockId?: string | undefined;
        element?: string | undefined;
        isRoot?: boolean | undefined;
        isText?: boolean | undefined;
        isImage?: boolean | undefined;
        isHTML?: boolean | undefined;
        isSVG?: boolean | undefined;
        isLink?: boolean | undefined;
        isContainer?: boolean | undefined;
        isVideo?: boolean | undefined;
        isInput?: boolean | undefined;
        isRepeater?: boolean | undefined;
        isComponent?: boolean | undefined;
        isChildOfComponent?: boolean | undefined;
    };
    breakpoint: import("frappe-builder-extension-sdk").Breakpoint;
    editingMode: "page" | "fragment";
    readOnly: boolean;
    isAIEnabled: boolean;
    page: {
        route: string;
        isTemplate: boolean;
        isStandard: boolean;
        published: boolean;
    } | null;
    site: {
        isDeveloperMode: boolean;
        isFCSite: boolean;
    };
};
/** One of this extension's own actions, as a function a template can call. */
export declare const useAction: (name: string) => (context?: Record<string, unknown>) => Promise<unknown>;
/**
 * A component as a slot module, which is the whole contract the SDK asks for.
 *
 * ```js
 * export const { mount } = defineSlot(Panel);
 * ```
 *
 * The SDK calls `mount`, and the function it returns runs when the frame goes
 * away. `props` reaches the component as its root props, so a dialog opened with
 * `ui.openDialog({ props })` reads them as ordinary props.
 */
export declare const defineSlot: (component: Component) => {
    mount: (element: HTMLElement, props?: Record<string, unknown>) => () => void;
};
