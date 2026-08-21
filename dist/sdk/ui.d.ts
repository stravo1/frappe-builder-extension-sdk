/**
 * The dialog, popover, and toast, from inside a frame (1.15).
 *
 * Two frames are involved and neither knows about the other. One frame asks for
 * a dialog and waits. The host opens the dialog slot's document in a new frame,
 * and that frame calls `closeDialog` when it is done. The host resolves the
 * first frame's pending call with whatever the second one passed.
 *
 * A popover works the same way, in the `popover` slot. It is not modal: the user
 * keeps editing while it stands, and drags it where they want it. So a caller
 * that wants an answer awaits it, and a caller that only opens a panel does not.
 *
 * A toast opens no frame and has no result: the host displays it in Builder.
 *
 * The host controls both sets of dimensions, so an extension only supplies a
 * title, content props, and an eventual result.
 */
export type FrameOptions = {
    title?: string;
    /** Handed to the document the slot mounts, at its connect handshake. */
    props?: Record<string, unknown>;
};
export type ToastType = "success" | "error" | "warning" | "info";
export type ToastOptions = {
    /** The visual tone. Omit it for Builder's standard message toast. */
    type?: ToastType;
};
/** Resolves when the dialog closes: with the result, or with nothing if it was dismissed. */
export declare const openDialog: (options?: FrameOptions) => Promise<unknown>;
/** Called by the dialog's own frame. The result travels back to whoever opened it. */
export declare const closeDialog: (result?: unknown) => Promise<unknown>;
/** Resolves when the popover closes. Opening one does not block the editor. */
export declare const openPopover: (options?: FrameOptions) => Promise<unknown>;
/** Called by the popover's own frame, or by any frame that wants it shut. */
export declare const closePopover: (result?: unknown) => Promise<unknown>;
/** Displays a notification in Builder, outside the extension frame. */
export declare const toast: (message: string, options?: ToastOptions) => Promise<unknown>;
export declare const ui: {
    openDialog: (options?: FrameOptions) => Promise<unknown>;
    closeDialog: (result?: unknown) => Promise<unknown>;
    openPopover: (options?: FrameOptions) => Promise<unknown>;
    closePopover: (result?: unknown) => Promise<unknown>;
    toast: (message: string, options?: ToastOptions) => Promise<unknown>;
    /** What the open call was made with. Read by the document the slot mounted. */
    props: () => Record<string, unknown>;
};
