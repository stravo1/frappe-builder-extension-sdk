import c from "frappe-builder-extension-sdk";
import { createApp as i, reactive as r, getCurrentScope as p, onScopeDispose as a } from "vue";
const u = () => ({
  selection: { count: 0, blockIds: [] },
  breakpoint: "desktop",
  editingMode: "page",
  readOnly: !1,
  isAIEnabled: !1,
  page: null,
  site: { isDeveloperMode: !1, isFCSite: !1 }
}), b = (t) => {
  const e = r(u()), o = {}, n = c.context.subscribe(t, (s) => {
    Object.assign(o, s), Object.assign(e, s);
  });
  return c.context.get().then((s) => Object.assign(e, s, o)), p() && a(n), e;
}, f = (t) => (e) => c.actions.run(t, e), g = (t) => ({
  mount: (e, o = {}) => {
    const n = i(t, o);
    return n.mount(e), () => n.unmount();
  }
});
export {
  g as defineSlot,
  f as useAction,
  b as useBuilderContext
};
