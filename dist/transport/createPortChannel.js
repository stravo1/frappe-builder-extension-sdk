import { PROTOCOL_VERSION as i } from "../types.js";
const V = (n, t, r) => ({
  v: i,
  type: "request",
  id: n,
  method: t,
  params: r
}), _ = (n, t) => ({
  v: i,
  type: "response",
  id: n,
  result: t
}), a = (n, t) => ({
  v: i,
  type: "response",
  id: n,
  error: t
}), $ = (n, t) => ({
  v: i,
  type: "event",
  event: n,
  payload: t
}), w = (n) => ({
  message: `This Builder speaks protocol version ${i}, not ${n}.`,
  code: "unsupported_version"
}), b = (n, t) => a(n, w(t)), P = (n) => typeof n == "object" && n !== null, S = (n) => !P(n) || typeof n.v != "number" ? !1 : n.type === "request" ? typeof n.id == "number" && typeof n.method == "string" : n.type === "response" ? typeof n.id == "number" : n.type === "event" ? typeof n.event == "string" : !1, L = (n) => n.v === i;
class l extends Error {
  constructor(t) {
    super(t.message), this.name = "ChannelCallError", this.code = t.code;
  }
}
const N = (n) => new l({ message: `Unknown method "${n}".`, code: "unknown_method" }), h = {
  message: "The extension channel is closed.",
  code: "channel_closed"
}, R = (n) => n instanceof l ? { message: n.message, code: n.code } : { message: n instanceof Error ? n.message : String(n) };
function j(n, t) {
  const r = /* @__PURE__ */ new Map(), f = /* @__PURE__ */ new Map();
  let v = 1, u = !1;
  const p = (e) => {
    u || n.postMessage(e);
  }, E = (e, o) => {
    if (t) return t(e, o);
    throw N(e);
  }, m = async (e) => {
    try {
      p(_(e.id, await E(e.method, e.params)));
    } catch (o) {
      p(a(e.id, R(o)));
    }
  }, d = (e, o, s) => {
    const c = r.get(e);
    if (!c) return console.warn(`Extension channel received a response for unknown call ${e}`);
    r.delete(e), s ? c.reject(new l(s)) : c.resolve(o);
  }, C = (e) => {
    f.get(e.event)?.forEach((o) => o(e.payload));
  }, g = (e) => {
    if (e.type === "request") return p(b(e.id, e.v));
    if (e.type === "response") return d(e.id, void 0, w(e.v));
    console.warn(`Extension channel dropped an event at protocol version ${e.v}`);
  }, x = (e) => {
    if (S(e)) {
      if (!L(e)) return g(e);
      if (e.type === "request") return void m(e);
      if (e.type === "response") return d(e.id, e.result, e.error);
      C(e);
    }
  }, k = (e, o) => new Promise((s, c) => {
    if (u) return c(new l(h));
    const y = v++;
    r.set(y, { resolve: s, reject: c }), p(V(y, e, o));
  }), q = (e, o) => {
    const s = f.get(e) ?? /* @__PURE__ */ new Set();
    return f.set(e, s), s.add(o), () => s.delete(o);
  }, M = (e, o) => p($(e, o)), O = () => {
    u || (u = !0, r.forEach((e) => e.reject(new l(h))), r.clear(), f.clear(), n.close());
  };
  return n.onmessage = (e) => x(e.data), { call: k, listen: q, emit: M, close: O };
}
export {
  l as ChannelCallError,
  j as createPortChannel,
  N as unknownMethod
};
