/** The extension protocol values shared by the runtime, Vite plugin, and packager. */
export const PROTOCOL_VERSION: 1;
/** @type {readonly ("context.read" | "block.read" | "block.update" | "block.insert" | "page.read" | "page.write" | "token.write" | "ui.dialog" | "ui.popover" | "data.access" | "schema.write")[]} */
export const CAPABILITIES: readonly ("context.read" | "block.read" | "block.update" | "block.insert" | "page.read" | "page.write" | "token.write" | "ui.dialog" | "ui.popover" | "data.access" | "schema.write")[];
export function parseJson(source: any, text: any): any;
export function isSemver(value: any): boolean;
export function validateManifest(value: any, source?: string): any;
