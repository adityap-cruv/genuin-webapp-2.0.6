import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { createRef } from "react";

import { COL_GAP_CLASS, GAP_CLASS, ROW_GAP_CLASS } from "../tokens";

import { Grid } from "./grid";

describe("Grid", () => {
  it("renders a <div> with the base grid class", () => {
    const { getByTestId } = render(<Grid data-testid="grid">x</Grid>);
    const el = getByTestId("grid");
    expect(el.tagName).toBe("DIV");
    expect(el).toHaveClass("gencl:grid");
    expect(el).toHaveAttribute("data-slot", "layout-grid");
  });

  it("maps numeric cols to grid-cols-N (within 1-12)", () => {
    const { getByTestId } = render(
      <Grid data-testid="grid" cols={3}>
        x
      </Grid>
    );
    expect(getByTestId("grid")).toHaveClass("gencl:grid-cols-3");
  });

  it("maps numeric rows to grid-rows-N (within 1-6)", () => {
    const { getByTestId } = render(
      <Grid data-testid="grid" rows={2}>
        x
      </Grid>
    );
    expect(getByTestId("grid")).toHaveClass("gencl:grid-rows-2");
  });

  it("maps a string cols to inline style.gridTemplateColumns", () => {
    const { getByTestId } = render(
      <Grid data-testid="grid" cols="746px 320px">
        x
      </Grid>
    );
    const el = getByTestId("grid");
    expect(el.style.gridTemplateColumns).toBe("746px 320px");
    // No static grid-cols class should be applied for string tracks.
    expect(el.className).not.toMatch(/gencl:grid-cols-/);
  });

  it("maps a string rows to inline style.gridTemplateRows", () => {
    const { getByTestId } = render(
      <Grid data-testid="grid" rows="auto 1fr">
        x
      </Grid>
    );
    expect(getByTestId("grid").style.gridTemplateRows).toBe("auto 1fr");
  });

  it("falls back to inline style for out-of-range numeric cols", () => {
    const { getByTestId } = render(
      <Grid data-testid="grid" cols={15}>
        x
      </Grid>
    );
    expect(getByTestId("grid").style.gridTemplateColumns).toBe("repeat(15, minmax(0, 1fr))");
  });

  it("applies symmetric gap from GAP_CLASS", () => {
    const { getByTestId } = render(
      <Grid data-testid="grid" gap="md">
        x
      </Grid>
    );
    expect(getByTestId("grid")).toHaveClass(GAP_CLASS.md);
  });

  it("applies asymmetric colGap and rowGap when no gap is set", () => {
    const { getByTestId } = render(
      <Grid data-testid="grid" colGap="lg" rowGap="xs">
        x
      </Grid>
    );
    const el = getByTestId("grid");
    expect(el).toHaveClass(COL_GAP_CLASS.lg);
    expect(el).toHaveClass(ROW_GAP_CLASS.xs);
  });

  it("ignores colGap and rowGap when gap is set (mutual exclusion)", () => {
    const { getByTestId } = render(
      <Grid data-testid="grid" gap="md" colGap="lg" rowGap="xs">
        x
      </Grid>
    );
    const el = getByTestId("grid");
    expect(el).toHaveClass(GAP_CLASS.md);
    expect(el).not.toHaveClass(COL_GAP_CLASS.lg);
    expect(el).not.toHaveClass(ROW_GAP_CLASS.xs);
  });

  it("preserves a caller-provided style alongside resolved track style", () => {
    const { getByTestId } = render(
      <Grid data-testid="grid" cols="200px 1fr" style={{ background: "rgb(0, 0, 0)" }}>
        x
      </Grid>
    );
    const el = getByTestId("grid");
    expect(el.style.gridTemplateColumns).toBe("200px 1fr");
    expect(el.style.background).toBe("rgb(0, 0, 0)");
  });

  it("supports asChild polymorphism", () => {
    const { getByTestId } = render(
      <Grid asChild cols={2}>
        <section data-testid="grid-section">x</section>
      </Grid>
    );
    const el = getByTestId("grid-section");
    expect(el.tagName).toBe("SECTION");
    expect(el).toHaveClass("gencl:grid", "gencl:grid-cols-2");
  });

  it("merges a custom className", () => {
    const { getByTestId } = render(
      <Grid data-testid="grid" className="custom-class">
        x
      </Grid>
    );
    expect(getByTestId("grid")).toHaveClass("custom-class");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Grid ref={ref} data-testid="grid">
        x
      </Grid>
    );
    expect(ref.current).not.toBeNull();
  });
});
