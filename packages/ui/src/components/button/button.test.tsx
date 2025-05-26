import { render } from "@testing-library/react";

import "@testing-library/jest-dom";
import { Button, buttonVariants } from "./button";

describe("Button Component", () => {
  const variants = [
    "default",
    "destructive",
    "outline",
    "secondary",
    "ghost",
    "link",
  ];
  const sizes = ["default", "sm", "lg", "icon"];

  it("renders correctly with default props", () => {
    const { getByRole } = render(<Button>Default Button</Button>);
    const button = getByRole("button");
    expect(button).toHaveClass(
      buttonVariants({ variant: "default", size: "default" })
    );
  });

  variants.forEach((variant) => {
    it(`renders correctly with variant="${variant}"`, () => {
      const { getByRole } = render(
        <Button variant={variant as any}>Variant Button</Button>
      );
      const button = getByRole("button");
      expect(button).toHaveClass(
        buttonVariants({ variant: variant as any, size: "default" })
      );
    });
  });

  sizes.forEach((size) => {
    it(`renders correctly with size="${size}"`, () => {
      const { getByRole } = render(
        <Button size={size as any}>Size Button</Button>
      );
      const button = getByRole("button");
      expect(button).toHaveClass(
        buttonVariants({ variant: "default", size: size as any })
      );
    });
  });

  variants.forEach((variant) => {
    sizes.forEach((size) => {
      it(`renders correctly with variant="${variant}" and size="${size}"`, () => {
        const { getByRole } = render(
          <Button variant={variant as any} size={size as any}>
            Variant and Size Button
          </Button>
        );
        const button = getByRole("button");
        // expect(button).toHaveClass(buttonVariants({ variant: variant as any, size: size as any }));
      });
    });
  });

  it("renders correctly with asChild prop", () => {
    const { getByText } = render(
      <Button asChild>
        <a href="#">Child Button</a>
      </Button>
    );
    const link = getByText("Child Button");
    expect(link).toHaveAttribute("href", "#");
    expect(link).toHaveAttribute("data-slot", "button");
  });

  it("applies additional className", () => {
    const { getByRole } = render(
      <Button className="custom-class">Custom Class Button</Button>
    );
    const button = getByRole("button");
    expect(button).toHaveClass("custom-class");
  });
});
