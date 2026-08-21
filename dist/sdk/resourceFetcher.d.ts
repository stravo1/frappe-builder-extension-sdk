/**
 * frappe-ui's resources, over the bridge.
 *
 * An extension frame runs at an opaque origin with no cookie, so `fetch` can
 * never reach Frappe from here. `createResource` reads its fetcher on every
 * fetch (`resources.js:57`), so one `setConfig` call reroutes every resource in
 * the frame through the port instead:
 *
 * ```js
 * import { setConfig } from "frappe-ui";
 * import builder from "frappe-builder-extension-sdk";
 *
 * setConfig("resourceFetcher", builder.data.fetcher);
 * ```
 *
 * Write it in the entry, which every frame imports. It must be the extension's
 * own `frappe-ui`: each extension bundles a copy, and the SDK cannot reach that
 * copy's config from here.
 *
 * **This is an adapter, not a gate.** It runs inside the frame, which is the
 * untrusted side, so it cannot decide anything. Each route below lands on a
 * `data.*` method the host gates and the server checks against the grant. A
 * frame that replaced this file with its own would reach exactly the same
 * methods and the same refusals.
 *
 * A URL with no route is refused rather than forwarded. Forwarding would let a
 * resource name any whitelisted method on the site, and the doctype grant would
 * stop meaning anything.
 */
type Params = Record<string, unknown>;
/** frappe-ui hands the fetcher the whole resource options, with params resolved. */
export type ResourceRequest = {
    url?: string;
    params?: Params;
};
/**
 * Hand this to `setConfig("resourceFetcher", ...)`.
 *
 * It answers with the data, and throws on a refusal, which is the contract
 * `resources.js` expects. A refusal keeps its `code`, so a resource's `onError`
 * can still read `grant_required` and call `builder.data.requestAccess`.
 *
 * It never opens the consent dialog itself. A resource fetches when it decides
 * to — `auto: true` fires on mount — so an asking fetcher would put a modal on
 * screen while the user is doing something else.
 */
export declare const resourceFetcher: (options: ResourceRequest) => Promise<unknown>;
export {};
