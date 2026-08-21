import { PROTOCOL_VERSION as l } from "../types.js";
const m = (n, r, s) => ({
  v: l,
  type: "request",
  id: n,
  method: r,
  params: s
}), q = (n, r) => ({
  v: l,
  type: "response",
  id: n,
  result: r
}), w = (n, r) => ({
  v: l,
  type: "response",
  id: n,
  error: r
}), P = (n, r) => ({
  v: l,
  type: "event",
  event: n,
  payload: r
}), v = (n) => ({
  message: `This Builder speaks protocol version ${l}, not ${n}.`,
  code: "unsupported_version"
}), S = (n, r) => w(n, v(r)), L = (n) => typeof n == "object" && n !== null, N = (n) => !L(n) || typeof n.v != "number" ? !1 : n.type === "request" ? typeof n.id == "number" && typeof n.method == "string" : n.type === "response" ? typeof n.id == "number" : n.type === "event" ? typeof n.event == "string" : !1, T = (n) => n.v === l;
class f extends Error {
  constructor(r) {
    super(r.message), this.name = "ChannelCallError", this.code = r.code;
  }
}
const j = (n) => new f({ message: `Unknown method "${n}".`, code: "unknown_method" }), y = {
  message: "The extension channel is closed.",
  code: "channel_closed"
}, I = (n) => n instanceof f ? { message: n.message, code: n.code } : { message: n instanceof Error ? n.message : String(n) };
function A(n, r) {
  const s = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map();
  let E = 1, d = !1;
  const p = (e) => {
    d || n.postMessage(e);
  }, g = (e, t) => {
    const o = c.get(e);
    if (o) return o(t);
    if (r) return r(e, t);
    throw j(e);
  }, C = async (e) => {
    try {
      p(q(e.id, await g(e.method, e.params)));
    } catch (t) {
      p(w(e.id, I(t)));
    }
  }, a = (e, t, o) => {
    const i = s.get(e);
    if (!i) return console.warn(`Extension channel received a response for unknown call ${e}`);
    s.delete(e), o ? i.reject(new f(o)) : i.resolve(t);
  }, x = (e) => {
    u.get(e.event)?.forEach((t) => t(e.payload));
  }, M = (e) => {
    if (e.type === "request") return p(S(e.id, e.v));
    if (e.type === "response") return a(e.id, void 0, v(e.v));
    console.warn(`Extension channel dropped an event at protocol version ${e.v}`);
  }, $ = (e) => {
    if (N(e)) {
      if (!T(e)) return M(e);
      if (e.type === "request") return void C(e);
      if (e.type === "response") return a(e.id, e.result, e.error);
      x(e);
    }
  }, k = (e, t) => new Promise((o, i) => {
    if (d) return i(new f(y));
    const h = E++;
    s.set(h, { resolve: o, reject: i }), p(m(h, e, t));
  }), O = (e, t) => {
    if (c.has(e)) throw new Error(`"${e}" already has a handler on this channel`);
    return c.set(e, t), () => {
      c.get(e) === t && c.delete(e);
    };
  }, V = (e, t) => {
    const o = u.get(e) ?? /* @__PURE__ */ new Set();
    return u.set(e, o), o.add(t), () => o.delete(t);
  }, _ = (e, t) => p(P(e, t)), b = () => {
    d || (d = !0, s.forEach((e) => e.reject(new f(y))), s.clear(), c.clear(), u.clear(), n.close());
  };
  return n.onmessage = (e) => $(e.data), { call: k, handle: O, listen: V, emit: _, close: b };
}
export {
  f as ChannelCallError,
  A as createPortChannel,
  j as unknownMethod
};
