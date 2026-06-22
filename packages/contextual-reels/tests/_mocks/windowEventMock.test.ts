import { describe, expect, it } from "vitest";

import { spyOnWindowEvent } from "./windowEventMock";

describe("windowEventMock", () => {
  it("captures detail from dispatches done via the spy", () => {
    const spy = spyOnWindowEvent<{ value: number }>("test:event");
    spy.dispatch({ value: 1 });
    spy.dispatch({ value: 2 });
    expect(spy.dispatched).toEqual([{ value: 1 }, { value: 2 }]);
    spy.restore();
  });

  it("captures detail from external dispatches as well", () => {
    const spy = spyOnWindowEvent<{ k: string }>("test:external");
    window.dispatchEvent(new CustomEvent("test:external", { detail: { k: "v" } }));
    expect(spy.dispatched).toEqual([{ k: "v" }]);
    spy.restore();
  });

  it("restore stops capturing further dispatches", () => {
    const spy = spyOnWindowEvent<{ n: number }>("test:restore");
    spy.dispatch({ n: 1 });
    spy.restore();
    window.dispatchEvent(new CustomEvent("test:restore", { detail: { n: 2 } }));
    expect(spy.dispatched).toEqual([]);
  });
});
