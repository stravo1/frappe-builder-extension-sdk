/**
 * Builds and checks the messages that cross a port. `../types` holds their shapes.
 *
 * Recognizing a message and accepting its version are two steps, and the types
 * enforce the order. A message at an unknown version is still routable, so the
 * channel can answer it rather than drop it.
 */
import { type AnyVersionMessage, type ChannelError, type EventMessage, type PortMessage, type RequestMessage, type ResponseMessage } from "../types";
export declare const request: (id: number, method: string, params?: unknown) => RequestMessage;
export declare const respond: (id: number, result?: unknown) => ResponseMessage;
export declare const fail: (id: number, error: ChannelError) => ResponseMessage;
export declare const event: (name: string, payload?: unknown) => EventMessage;
/** The only refusal the transport itself raises. Every other error comes from a method. */
export declare const unsupportedVersionError: (version: number) => ChannelError;
export declare const unsupportedVersion: (id: number, version: number) => ResponseMessage;
/**
 * True for anything shaped like a port message, at any version.
 *
 * It checks only the fields that route a message. `params`, `result` and
 * `payload` belong to the method, and the host validates those per method (1.12).
 */
export declare const isPortMessage: (value: unknown) => value is AnyVersionMessage;
export declare const isCurrentVersion: (message: AnyVersionMessage) => message is PortMessage;
