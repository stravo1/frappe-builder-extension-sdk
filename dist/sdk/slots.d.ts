/**
 * The five slot entries an extension registers, and running the one that arrived.
 *
 * The slot names are fixed and none is a name the author picks (D5).
 *
 * Every frame imports the same entry module, so all five registrations run in
 * every frame. Only the one the handshake named is then executed. That is how
 * one module serves five frames: the frame learns which it is after the module
 * has already been read.
 *
 * It is also why `main` takes a callback and the rest take `{ load }`. The entry
 * module always runs, so `main`'s work has to be deferred to the frame that owns
 * it. A slot's module should not run at all unless this frame is that slot.
 */
import type { ExtensionSlot } from "../types";
export type VisualSlot = Exclude<ExtensionSlot, "main">;
/** `load` resolves to the module holding the slot's document. */
export type SlotEntry = {
    load: () => Promise<unknown>;
};
/**
 * Set before the entry module is imported, so a registration made while that
 * module evaluates already knows which frame it is running in.
 */
export declare const setActiveSlot: (name: ExtensionSlot) => ExtensionSlot;
export declare const getActiveSlot: () => ExtensionSlot | null;
export declare const registerMain: (handler: () => void) => void;
export declare const registerSlot: (slot: VisualSlot, entry: SlotEntry) => void;
/**
 * Runs only the slot this frame was opened for.
 *
 * A frame that registered no slot warns rather than throws, because an extension
 * built against a newer Builder may know a slot this one never opens.
 */
export declare const runSlot: (props?: Record<string, unknown>) => Promise<void>;
