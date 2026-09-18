/**
 * Shadow-root resolution for the E2E suite.
 *
 * Every assertion in this suite has to reach inside the widget's shadow root,
 * and where that root lives depends on the layout: normally it is attached to
 * the `.gen-ext` slot, but under the stacked variant the slot is split and the
 * root moves onto the `stacked-top` row. Page objects that hardcode
 * `.gen-ext.shadowRoot` therefore read `null` on every stacked mount.
 *
 * Rather than duplicate the two-branch lookup into a dozen `page.evaluate`
 * bodies (a function from module scope is NOT callable inside `evaluate` — only
 * the serialised function body crosses into the browser), the resolver is
 * installed once as a page global by {@link SHADOW_INIT_SCRIPT}, which
 * `mountWidget` registers via `addInitScript`.
 */

declare global {
  interface Window {
    /** The widget's shadow root, wherever it currently lives. `null` before mount. */
    __cxrRoot: () => ShadowRoot | null;
    /** The `.gen-ext` host element. `null` if the harness page has not rendered. */
    __cxrHost: () => HTMLElement | null;
  }
}

/**
 * Installed before any page script runs, so it is available to the first
 * `evaluate` after navigation.
 *
 * Written as a source string rather than a function because `addInitScript`
 * serialises it into the page: it must not close over anything in this module.
 */
export const SHADOW_INIT_SCRIPT = `
  window.__cxrHost = function () {
    return document.querySelector(".gen-ext");
  };
  window.__cxrRoot = function () {
    var slot = document.querySelector(".gen-ext");
    if (!slot) return null;
    if (slot.shadowRoot) return slot.shadowRoot;
    // Stacked variant: the slot is split and our widget mounts into the top row.
    var top = slot.querySelector('[data-genuin-cxr="stacked-top"]');
    return (top && top.shadowRoot) || null;
  };
`;
