import "@testing-library/jest-dom";
import { fireEvent, render } from "@testing-library/react";

import { NavArrowButton } from "./nav-arrow-button";

describe("NavArrowButton", () => {
  it("defaults its testId to nav-<direction> and labels by direction", () => {
    const { getByTestId } = render(<NavArrowButton direction="down" onClick={() => undefined} />);
    expect(getByTestId("nav-down")).toHaveAttribute("aria-label", "Next");
  });

  it("uses an explicit ariaLabel override when provided", () => {
    const { getByTestId } = render(
      <NavArrowButton direction="up" ariaLabel="Previous video (1 of 5)" onClick={() => undefined} />
    );
    expect(getByTestId("nav-up")).toHaveAttribute("aria-label", "Previous video (1 of 5)");
  });

  it("does not fire onClick when disabled", () => {
    const onClick = jest.fn();
    const { getByTestId } = render(<NavArrowButton direction="up" disabled onClick={onClick} />);
    fireEvent.click(getByTestId("nav-up"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("bubbles by default but stops when stopPropagation=true", () => {
    const parent = jest.fn();
    const { getByTestId, rerender } = render(
      <div onClick={parent}>
        <NavArrowButton direction="left" onClick={() => undefined} />
      </div>
    );
    fireEvent.click(getByTestId("nav-left"));
    expect(parent).toHaveBeenCalledTimes(1);

    parent.mockClear();
    rerender(
      <div onClick={parent}>
        <NavArrowButton direction="left" onClick={() => undefined} stopPropagation />
      </div>
    );
    fireEvent.click(getByTestId("nav-left"));
    expect(parent).not.toHaveBeenCalled();
  });
});
