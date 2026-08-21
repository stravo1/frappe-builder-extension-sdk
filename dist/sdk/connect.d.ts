/**
 * The frame side of the handshake.
 *
 * Builder posts one message on the window with a port beside it. Everything
 * after that runs on the port, so this listener matters exactly once.
 */
import { type PortChannel } from "../transport/createPortChannel";
export declare const getChannel: () => PortChannel;
export declare const getSlotProps: () => Record<string, unknown>;
/**
 * Registered when this module loads. A module script runs before the iframe's
 * own `load` event, which is what the host waits for, so the message cannot
 * arrive before this listener exists.
 */
export declare const listenForHandshake: () => void;
