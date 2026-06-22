import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { createRef } from "react";

import { ThemeProvider, type ThemeName } from "./theme-provider";

describe("ThemeProvider", () => {
  it("renders a <div> with default theme/mode and the matching data + class attributes", () => {
    const { getByTestId } = render(
      <ThemeProvider data-testid="tp">
        <span>child</span>
      </ThemeProvider>
    );
    const el = getByTestId("tp");
    expect(el.tagName).toBe("DIV");
    expect(el).toHaveAttribute("data-slot", "theme-provider");
    expect(el).toHaveAttribute("data-theme", "genuin");
    expect(el).toHaveAttribute("data-mode", "light");
    expect(el).toHaveClass("theme-genuin");
    // light mode should NOT add the dark class
    expect(el).not.toHaveClass("dark");
  });

  const themes: ThemeName[] = ["genuin", "iheart", "mcclatchy", "us-weekly"];

  themes.forEach((theme) => {
    it(`applies theme="${theme}" via the .theme-${theme} class and data-theme attribute`, () => {
      const { getByTestId } = render(
        <ThemeProvider theme={theme} data-testid="tp">
          <span />
        </ThemeProvider>
      );
      const el = getByTestId("tp");
      expect(el).toHaveAttribute("data-theme", theme);
      expect(el).toHaveClass(`theme-${theme}`);
    });
  });

  it("supports a custom (host-registered) theme name via the string fallback", () => {
    const { getByTestId } = render(
      <ThemeProvider theme="acme-news" data-testid="tp">
        <span />
      </ThemeProvider>
    );
    const el = getByTestId("tp");
    expect(el).toHaveAttribute("data-theme", "acme-news");
    expect(el).toHaveClass("theme-acme-news");
  });

  it('adds the "dark" class when mode === "dark"', () => {
    const { getByTestId } = render(
      <ThemeProvider mode="dark" data-testid="tp">
        <span />
      </ThemeProvider>
    );
    const el = getByTestId("tp");
    expect(el).toHaveAttribute("data-mode", "dark");
    expect(el).toHaveClass("dark");
  });

  it('omits the "dark" class when mode === "light"', () => {
    const { getByTestId } = render(
      <ThemeProvider mode="light" data-testid="tp">
        <span />
      </ThemeProvider>
    );
    expect(getByTestId("tp")).not.toHaveClass("dark");
  });

  it("supports asChild polymorphism (renders as <section>)", () => {
    const { getByTestId } = render(
      <ThemeProvider theme="iheart" mode="dark" asChild>
        <section data-testid="sec">
          <span>content</span>
        </section>
      </ThemeProvider>
    );
    const el = getByTestId("sec");
    expect(el.tagName).toBe("SECTION");
    expect(el).toHaveAttribute("data-slot", "theme-provider");
    expect(el).toHaveAttribute("data-theme", "iheart");
    expect(el).toHaveAttribute("data-mode", "dark");
    expect(el).toHaveClass("theme-iheart", "dark");
  });

  it("merges a custom className without overriding theme/mode classes", () => {
    const { getByTestId } = render(
      <ThemeProvider theme="iheart" mode="dark" className="custom-class" data-testid="tp">
        <span />
      </ThemeProvider>
    );
    const el = getByTestId("tp");
    expect(el).toHaveClass("custom-class");
    expect(el).toHaveClass("theme-iheart");
    expect(el).toHaveClass("dark");
  });

  it("forwards ref to the underlying element", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ThemeProvider ref={ref} data-testid="tp">
        <span />
      </ThemeProvider>
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe("DIV");
    expect(ref.current?.getAttribute("data-theme")).toBe("genuin");
  });

  it("renders its children", () => {
    const { getByText } = render(
      <ThemeProvider>
        <span>hello-children</span>
      </ThemeProvider>
    );
    expect(getByText("hello-children")).toBeInTheDocument();
  });
});
