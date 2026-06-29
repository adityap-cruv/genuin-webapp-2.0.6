import "@testing-library/jest-dom";
import { fireEvent, render } from "@testing-library/react";

import { ExpandCollapseButton } from "./expand-collapse-button";

describe("ExpandCollapseButton", () => {
  it("renders the injected icon and forwards testId + aria-label", () => {
    const { getByTestId } = render(
      <ExpandCollapseButton icon={<svg data-testid="glyph" />} ariaLabel="Expand" testId="exp" />
    );
    // Must be a real <button> for keyboard + focus accessibility (not a div role=button).
    expect(getByTestId("exp").tagName).toBe("BUTTON");
    expect(getByTestId("exp")).toHaveAttribute("aria-label", "Expand");
    expect(getByTestId("glyph")).toBeInTheDocument();
  });

  it("calls onClick and stops propagation", () => {
    const onClick = jest.fn();
    const parent = jest.fn();
    const { getByTestId } = render(
      <div onClick={parent}>
        <ExpandCollapseButton icon={<svg />} onClick={onClick} testId="exp" />
      </div>
    );
    fireEvent.click(getByTestId("exp"));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(parent).not.toHaveBeenCalled();
  });
});
