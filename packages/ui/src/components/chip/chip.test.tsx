import "@testing-library/jest-dom";
import { render } from "@testing-library/react";

import { Chip } from "./chip";

describe("Chip", () => {
  it("renders the default variant + rounded='full' classes", () => {
    const { getByTestId } = render(<Chip data-testid="c">Owner</Chip>);
    const el = getByTestId("c");
    expect(el.tagName).toBe("P");
    expect(el).toHaveClass("gencl:bg-primary-100");
    expect(el).toHaveClass("gencl:text-primary");
    expect(el).toHaveClass("gencl:rounded-full");
  });

  it("applies the secondary variant tokens", () => {
    const { getByTestId } = render(
      <Chip data-testid="c" variant="secondary">
        Member
      </Chip>
    );
    const el = getByTestId("c");
    expect(el).toHaveClass("gencl:bg-secondary-100");
    expect(el).toHaveClass("gencl:text-secondary");
  });

  it("applies the success variant tokens", () => {
    const { getByTestId } = render(
      <Chip data-testid="c" variant="success">
        Active
      </Chip>
    );
    const el = getByTestId("c");
    expect(el).toHaveClass("gencl:bg-success-status");
    expect(el).toHaveClass("gencl:text-white");
  });

  it("supports rounded='small'", () => {
    const { getByTestId } = render(
      <Chip data-testid="c" rounded="small">
        Admin
      </Chip>
    );
    expect(getByTestId("c")).toHaveClass("gencl:rounded-sm");
  });

  it("merges a custom className without dropping base classes", () => {
    const { getByTestId } = render(
      <Chip data-testid="c" className="custom">
        Tag
      </Chip>
    );
    const el = getByTestId("c");
    expect(el).toHaveClass("custom");
    expect(el).toHaveClass("gencl:bg-primary-100");
  });
});
