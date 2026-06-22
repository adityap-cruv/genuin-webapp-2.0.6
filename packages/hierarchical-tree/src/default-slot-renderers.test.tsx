import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { defaultSlotRenderers, mergeSlotRenderers } from "./default-slot-renderers";
import type { SlotNode } from "./schema";

describe("defaultSlotRenderers — content", () => {
  it("renders markdown paragraphs as Text components", () => {
    const slot: SlotNode = { type: "slot", name: "body", kind: "content" };
    const { container } = render(
      <>{defaultSlotRenderers.content({ slot, props: { body: "Hello **world**." } })}</>,
    );
    expect(container.querySelector('[data-slot="text"]')).not.toBeNull();
    expect(container.textContent).toContain("Hello");
    expect(container.querySelector("strong")?.textContent).toBe("world");
  });

  it("renders an empty marker when body is missing", () => {
    const slot: SlotNode = { type: "slot", name: "body", kind: "content" };
    const { container } = render(<>{defaultSlotRenderers.content({ slot, props: {} })}</>);
    const wrapper = container.querySelector('[data-slot-content="body"]');
    expect(wrapper?.getAttribute("data-empty")).toBe("true");
  });

  it("renders h2 markdown as a Heading data-slot", () => {
    const slot: SlotNode = { type: "slot", name: "body", kind: "content" };
    const { container } = render(
      <>{defaultSlotRenderers.content({ slot, props: { body: "## Section" } })}</>,
    );
    expect(container.querySelector('[data-slot="heading"]')).not.toBeNull();
    expect(container.querySelector("h2")?.textContent).toBe("Section");
  });

  it("renders inline links as Link data-slot anchors", () => {
    const slot: SlotNode = { type: "slot", name: "body", kind: "content" };
    const { container } = render(
      <>{defaultSlotRenderers.content({
        slot,
        props: { body: "Visit [Google](https://google.com)." },
      })}</>,
    );
    const link = container.querySelector('[data-slot="link"]');
    expect(link).not.toBeNull();
    expect(link?.getAttribute("href")).toBe("https://google.com");
    expect(link?.getAttribute("target")).toBe("_blank");
  });
});

describe("defaultSlotRenderers — video", () => {
  it("renders an embed-target div with the generated elementId", () => {
    const slot: SlotNode = { type: "slot", name: "main-video", kind: "video" };
    const { container } = render(
      <>{defaultSlotRenderers.video({ slot, props: {} })}</>,
    );
    const target = container.querySelector('[data-genuin-embed-target="true"]');
    expect(target).not.toBeNull();
    expect(target?.getAttribute("id")).toBe("genuin-embed-main-video");
  });

  it("honours a custom elementId", () => {
    const slot: SlotNode = { type: "slot", name: "main-video", kind: "video" };
    const { container } = render(
      <>{defaultSlotRenderers.video({ slot, props: { elementId: "custom-id" } })}</>,
    );
    expect(container.querySelector("#custom-id")).not.toBeNull();
  });

  it("forwards slot.style as a data attribute", () => {
    const slot: SlotNode = {
      type: "slot",
      name: "v",
      kind: "video",
      style: "carousel",
      cols: 3,
    };
    const { container } = render(<>{defaultSlotRenderers.video({ slot, props: {} })}</>);
    const wrapper = container.querySelector('[data-slot-video="v"]');
    expect(wrapper?.getAttribute("data-slot-style")).toBe("carousel");
    expect(wrapper?.getAttribute("data-slot-cols")).toBe("3");
  });
});

describe("defaultSlotRenderers — linkout", () => {
  it("renders an empty marker when no cards are provided", () => {
    const slot: SlotNode = { type: "slot", name: "lo", kind: "linkout" };
    const { container } = render(<>{defaultSlotRenderers.linkout({ slot, props: {} })}</>);
    const wrapper = container.querySelector('[data-slot-linkout="lo"]');
    expect(wrapper?.getAttribute("data-empty")).toBe("true");
  });

  it("renders one anchor per supplied card", () => {
    const slot: SlotNode = { type: "slot", name: "lo", kind: "linkout" };
    const { container } = render(
      <>{defaultSlotRenderers.linkout({
        slot,
        props: {
          cards: [
            { id: "a", title: "Card A", href: "https://a.example" },
            { id: "b", title: "Card B", href: "https://b.example", description: "desc" },
          ],
        },
      })}</>,
    );
    const wrapper = container.querySelector('[data-slot-linkout="lo"]');
    expect(wrapper?.querySelectorAll("a").length).toBe(2);
    expect(container.textContent).toContain("Card A");
    expect(container.textContent).toContain("desc");
  });
});

describe("defaultSlotRenderers — size decorator", () => {
  it("applies explicit height: 300px on video wrapper when size='compact'", () => {
    const slot: SlotNode = {
      type: "slot",
      name: "v",
      kind: "video",
      style: "carousel",
      cols: 3,
      size: "compact",
    };
    const { container } = render(<>{defaultSlotRenderers.video({ slot, props: {} })}</>);
    const wrapper = container.querySelector('[data-slot-video="v"]') as HTMLElement;
    expect(wrapper.style.height).toBe("300px");
    expect(wrapper.getAttribute("data-slot-size")).toBe("compact");
  });

  it("applies explicit height: 500px on video wrapper when size='default'", () => {
    const slot: SlotNode = { type: "slot", name: "v", kind: "video", size: "default" };
    const { container } = render(<>{defaultSlotRenderers.video({ slot, props: {} })}</>);
    const wrapper = container.querySelector('[data-slot-video="v"]') as HTMLElement;
    expect(wrapper.style.height).toBe("500px");
  });

  it("applies inline maxHeight: 700px on linkout when size='hero' (linkouts cap via max-height)", () => {
    const slot: SlotNode = {
      type: "slot",
      name: "lo",
      kind: "linkout",
      style: "grid",
      cols: 2,
      rows: 2,
      size: "hero",
    };
    const { container } = render(
      <>{defaultSlotRenderers.linkout({
        slot,
        props: { cards: [{ id: "a", title: "A", href: "https://a.example" }] },
      })}</>,
    );
    const wrapper = container.querySelector('[data-slot-linkout="lo"]') as HTMLElement;
    expect(wrapper.style.maxHeight).toBe("700px");
    expect(wrapper.className).toContain("gencl:overflow-y-auto");
  });

  it("emits no explicit height on video wrapper when size is omitted (back-compat)", () => {
    const slot: SlotNode = { type: "slot", name: "v", kind: "video" };
    const { container } = render(<>{defaultSlotRenderers.video({ slot, props: {} })}</>);
    const wrapper = container.querySelector('[data-slot-video="v"]') as HTMLElement;
    expect(wrapper.style.height).toBe("");
  });
});

describe("defaultSlotRenderers — size enum expansion", () => {
  it("applies inline height 180px on video when size='xs'", () => {
    const slot: SlotNode = { type: "slot", name: "v", kind: "video", size: "xs" };
    const { container } = render(<>{defaultSlotRenderers.video({ slot, props: {} })}</>);
    const wrapper = container.querySelector('[data-slot-video="v"]') as HTMLElement;
    expect(wrapper.style.height).toBe("180px");
  });

  it("applies inline height 600px on video when size='lg'", () => {
    const slot: SlotNode = { type: "slot", name: "v", kind: "video", size: "lg" };
    const { container } = render(<>{defaultSlotRenderers.video({ slot, props: {} })}</>);
    const wrapper = container.querySelector('[data-slot-video="v"]') as HTMLElement;
    expect(wrapper.style.height).toBe("600px");
  });

  it("applies inline height 100vh on video when size='screen'", () => {
    const slot: SlotNode = { type: "slot", name: "v", kind: "video", size: "screen" };
    const { container } = render(<>{defaultSlotRenderers.video({ slot, props: {} })}</>);
    const wrapper = container.querySelector('[data-slot-video="v"]') as HTMLElement;
    expect(wrapper.style.height).toBe("100vh");
  });

  it("applies inline maxHeight 420px on linkout when size='sm'", () => {
    const slot: SlotNode = {
      type: "slot",
      name: "lo",
      kind: "linkout",
      style: "grid",
      cols: 2,
      rows: 2,
      size: "sm",
    };
    const { container } = render(
      <>{defaultSlotRenderers.linkout({
        slot,
        props: { cards: [{ id: "a", title: "A", href: "https://a.example" }] },
      })}</>,
    );
    const wrapper = container.querySelector('[data-slot-linkout="lo"]') as HTMLElement;
    expect(wrapper.style.maxHeight).toBe("420px");
  });
});

describe("defaultSlotRenderers — aspect decorator", () => {
  it("applies inline aspectRatio 9 / 16 on video when aspect='reel'", () => {
    const slot: SlotNode = {
      type: "slot",
      name: "v",
      kind: "video",
      aspect: "reel",
    };
    const { container } = render(<>{defaultSlotRenderers.video({ slot, props: {} })}</>);
    const wrapper = container.querySelector('[data-slot-video="v"]') as HTMLElement;
    expect(wrapper.style.aspectRatio).toBe("9 / 16");
    expect(wrapper.getAttribute("data-slot-aspect")).toBe("reel");
    // aspect overrides size for video — no inline height should be set.
    expect(wrapper.style.height).toBe("");
  });

  it("treats size as a max-height cap when both aspect and size are set on video", () => {
    const slot: SlotNode = {
      type: "slot",
      name: "v",
      kind: "video",
      aspect: "reel",
      size: "hero",
    };
    const { container } = render(<>{defaultSlotRenderers.video({ slot, props: {} })}</>);
    const wrapper = container.querySelector('[data-slot-video="v"]') as HTMLElement;
    expect(wrapper.style.aspectRatio).toBe("9 / 16");
    expect(wrapper.style.maxHeight).toBe("700px");
    expect(wrapper.style.height).toBe("");
  });

  it("applies inline aspectRatio 21 / 9 on linkout when aspect='banner'", () => {
    const slot: SlotNode = {
      type: "slot",
      name: "lo",
      kind: "linkout",
      style: "grid",
      cols: 2,
      rows: 1,
      aspect: "banner",
    };
    const { container } = render(
      <>{defaultSlotRenderers.linkout({
        slot,
        props: { cards: [{ id: "a", title: "A", href: "https://a.example" }] },
      })}</>,
    );
    const wrapper = container.querySelector('[data-slot-linkout="lo"]') as HTMLElement;
    expect(wrapper.style.aspectRatio).toBe("21 / 9");
  });
});

describe("defaultSlotRenderers — minHeight decorator", () => {
  it("applies inline minHeight 420px on video when minHeight='lg'", () => {
    const slot: SlotNode = {
      type: "slot",
      name: "v",
      kind: "video",
      minHeight: "lg",
    };
    const { container } = render(<>{defaultSlotRenderers.video({ slot, props: {} })}</>);
    const wrapper = container.querySelector('[data-slot-video="v"]') as HTMLElement;
    expect(wrapper.style.minHeight).toBe("420px");
    expect(wrapper.getAttribute("data-slot-min-height")).toBe("lg");
  });

  it("applies inline minHeight 600px on linkout when minHeight='hero'", () => {
    const slot: SlotNode = {
      type: "slot",
      name: "lo",
      kind: "linkout",
      minHeight: "hero",
    };
    const { container } = render(
      <>{defaultSlotRenderers.linkout({
        slot,
        props: { cards: [{ id: "a", title: "A", href: "https://a.example" }] },
      })}</>,
    );
    const wrapper = container.querySelector('[data-slot-linkout="lo"]') as HTMLElement;
    expect(wrapper.style.minHeight).toBe("600px");
  });

  it("applies inline minHeight 300px on content when minHeight='md'", () => {
    const slot: SlotNode = {
      type: "slot",
      name: "body",
      kind: "content",
      minHeight: "md",
    };
    const { container } = render(
      <>{defaultSlotRenderers.content({ slot, props: { body: "Hello." } })}</>,
    );
    const wrapper = container.querySelector('[data-slot-content="body"]') as HTMLElement;
    expect(wrapper.style.minHeight).toBe("300px");
  });

  it("emits no minHeight when minHeight='none'", () => {
    const slot: SlotNode = {
      type: "slot",
      name: "v",
      kind: "video",
      minHeight: "none",
    };
    const { container } = render(<>{defaultSlotRenderers.video({ slot, props: {} })}</>);
    const wrapper = container.querySelector('[data-slot-video="v"]') as HTMLElement;
    expect(wrapper.style.minHeight).toBe("");
  });
});

describe("mergeSlotRenderers", () => {
  it("returns the default registry when no override is supplied", () => {
    expect(mergeSlotRenderers(undefined)).toBe(defaultSlotRenderers);
  });

  it("layers overrides on top of the defaults", () => {
    const customVideo = () => null;
    const merged = mergeSlotRenderers({ video: customVideo });
    expect(merged.video).toBe(customVideo);
    expect(merged.content).toBe(defaultSlotRenderers.content);
    expect(merged.linkout).toBe(defaultSlotRenderers.linkout);
  });
});
