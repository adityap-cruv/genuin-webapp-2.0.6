import "@testing-library/jest-dom";
import { render } from "@testing-library/react";

import { ControlButtonGroup } from "./control-button-group";

describe("ControlButtonGroup", () => {
  it("renders children in a centered flex row with the tight gap by default", () => {
    render(
      <ControlButtonGroup className="probe">
        <button>a</button>
      </ControlButtonGroup>
    );
    const row = document.querySelector(".probe") as HTMLElement;
    expect(row).toHaveClass("gencl:flex", "gencl:items-center", "gencl:gap-2");
  });

  it("uses the liberal gap when requested", () => {
    render(
      <ControlButtonGroup className="probe2" gap="liberal">
        <button>a</button>
      </ControlButtonGroup>
    );
    expect(document.querySelector(".probe2")).toHaveClass("gencl:gap-3");
  });
});
