/**
 * The handlers this frame owns, and running the one the host asked for.
 *
 * A handler is a function, so it never crosses the port. The host holds only
 * the name, and calls back when a descriptor naming it is activated (B2).
 *
 * Apart from `namespaces.ts` so that `connect.ts` can register the responder
 * without the two importing each other.
 *
 * Only the entry frame holds handlers. The host calls that frame because it
 * outlives visual slots, which can close while an action still appears on a
 * descriptor.
 */
export type ActionHandler = (context: Record<string, unknown>) => unknown;
export declare const holdAction: (name: string, handler: ActionHandler) => Map<string, ActionHandler>;
export declare const releaseAction: (name: string) => boolean;
export declare const runAction: (params: unknown) => unknown;
