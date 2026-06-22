import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { createRef } from "react";

import { MetaList, type MetaListItem } from "./meta-list";

const ITEMS: MetaListItem[] = [
  { label: "Placement Styles", value: "Carousel, Grid, Feed" },
  { label: "Network", value: "Activated" },
];

describe("MetaList", () => {
  it("renders a <dl> with one <dt>/<dd> pair per item", () => {
    const { container, getByText } = render(<MetaList items={ITEMS} />);
    const dl = container.querySelector("dl");
    expect(dl).not.toBeNull();
    expect(dl).toHaveAttribute("data-slot", "meta-list");
    expect(dl?.querySelectorAll("dt")).toHaveLength(2);
    expect(dl?.querySelectorAll("dd")).toHaveLength(2);
    expect(getByText("Placement Styles").tagName).toBe("DT");
    expect(getByText("Carousel, Grid, Feed").tagName).toBe("DD");
  });

  it("defaults to the dotted leader style", () => {
    const { container } = render(<MetaList items={ITEMS} />);
    const dl = container.querySelector("dl");
    expect(dl).toHaveAttribute("data-leader", "dotted");
    const leader = container.querySelector("span[aria-hidden='true']");
    expect(leader).toHaveClass("gencl:border-dotted");
  });

  it("applies the chosen leader style", () => {
    const { container } = render(<MetaList items={ITEMS} leader="dashed" />);
    expect(container.querySelector("dl")).toHaveAttribute("data-leader", "dashed");
    expect(container.querySelector("span[aria-hidden='true']")).toHaveClass("gencl:border-dashed");
  });

  it("renders no border classes when leader='none'", () => {
    const { container } = render(<MetaList items={ITEMS} leader="none" />);
    const leader = container.querySelector("span[aria-hidden='true']");
    expect(leader).not.toHaveClass("gencl:border-dotted");
    expect(leader).not.toHaveClass("gencl:border-dashed");
    expect(leader).not.toHaveClass("gencl:border-solid");
  });

  it("renders nothing inside the <dl> when items is empty (edge case)", () => {
    const { container } = render(<MetaList items={[]} />);
    const dl = container.querySelector("dl");
    expect(dl).not.toBeNull();
    expect(dl?.querySelectorAll("dt")).toHaveLength(0);
    expect(dl?.querySelectorAll("dd")).toHaveLength(0);
  });

  it("merges a custom className without overriding base layout", () => {
    const { container } = render(<MetaList items={ITEMS} className="custom-class" />);
    const dl = container.querySelector("dl");
    expect(dl).toHaveClass("custom-class");
    expect(dl).toHaveClass("gencl:flex");
  });

  it("forwards ref to the underlying <dl>", () => {
    const ref = createRef<HTMLDListElement>();
    render(<MetaList ref={ref} items={ITEMS} />);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe("DL");
  });
});
