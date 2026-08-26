import c from "frappe-builder-extension-sdk";
import { createApp as i, reactive as r, getCurrentScope as p, onScopeDispose as u } from "vue";
const a = () => ({
  selection: { count: 0, blockIds: [] },
  breakpoint: "desktop",
  editingMode: "page",
  readOnly: !1,
  isAIEnabled: !1,
  page: null,
  site: { isDeveloperMode: !1, isFCSite: !1 }
}), m = (t) => {
  const e = r(a()), n = {}, o = c.context.subscribe(t, (s) => {
    Object.assign(n, s), Object.assign(e, s);
  });
  return c.context.get().then((s) => Object.assign(e, s, n)), p() && u(o), e;
}, b = (t) => (e) => c.actions.run(t, e), f = (t, e, n = {}) => {
  const o = i(t, n);
  return o.mount(e), () => o.unmount();
}, g = (t) => ({
  mount: (e, n = {}) => {
    const o = i(t, n);
    return o.mount(e), () => o.unmount();
  }
});
export {
  g as defineSlot,
  b as useAction,
  m as useBuilderContext,
  f as vueAdapter
};
