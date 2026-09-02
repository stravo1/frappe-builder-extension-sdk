/**
 * One `MessagePort` per extension frame, three verbs: `call`, `listen`, `emit`.
 * Builder groups the channels from an extension's frames by extension.
 *
 * The host and the SDK both use this. Neither side is a client, so nothing here
 * knows which end of a channel it runs on, or what methods exist.
 */
import type { ChannelError } from "../types";
export type EventHandler = (payload: unknown) => void;
/** Resolves every request this end of the channel accepts. */
export type Dispatcher = (method: string, params: unknown) => unknown;
/** A refusal from the far side, or from the transport itself. */
export declare class ChannelCallError extends Error {
    code?: string;
    constructor(error: ChannelError);
}
/** The refusal for a method nothing claims. A dispatcher raises it too, so it has one spelling. */
export declare const unknownMethod: (method: string) => ChannelCallError;
export declare function createPortChannel(port: MessagePort, dispatcher?: Dispatcher): {
    call: <T = unknown>(method: string, params?: unknown) => Promise<T>;
    listen: (name: string, handler: EventHandler) => () => boolean;
    emit: (name: string, payload?: unknown) => void;
    close: () => void;
};
export type PortChannel = ReturnType<typeof createPortChannel>;
