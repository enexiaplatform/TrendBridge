// @vitest-environment jsdom
import React, { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import StrategyWorkbench from "@/components/strategy-workbench";
import { illustrativeStrategy } from "@/lib/strategy/sample";

vi.mock("@/components/strategy-charts", () => ({
  SegmentMap: () => null,
  CompetitiveMap: () => null,
  SignalChart: () => null,
  ChannelCharts: () => null,
  RolloutChart: () => null,
}));
function Case() {
  const [value, setValue] = useState(illustrativeStrategy()),
    [mode, setMode] = useState<"intelligence" | "gtm">("intelligence");
  return (
    <>
      <button
        onClick={() =>
          setMode(mode === "intelligence" ? "gtm" : "intelligence")
        }
      >
        Switch case mode
      </button>
      <StrategyWorkbench
        mode={mode}
        value={value}
        onChange={setValue}
        evidence={[]}
        currency="USD"
      />
    </>
  );
}
beforeEach(() => {
  vi.stubGlobal("React", React);
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: () => ({ matches: false }),
  });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe("Linked strategy workspace", () => {
  it("keeps edits and target selection when switching from segments to GTM", () => {
    render(<Case />);
    fireEvent.click(
      screen.getByRole("button", { name: /2\s*Mobile professionals/ }),
    );
    const inspector = screen.getByRole("complementary", {
      name: "Selected segment details",
    });
    expect(
      within(inspector).getByRole("heading", { name: "Mobile professionals" }),
    ).toBeTruthy();
    fireEvent.click(
      within(inspector).getByRole("button", { name: "Edit segment" }),
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Segment name" }), {
      target: { value: "Field sales teams" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Done editing" }));
    fireEvent.click(screen.getByRole("button", { name: "Use as target ICP" }));
    expect(
      screen
        .getByRole("button", { name: /2\s*Field sales teams\s*ICP/ })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Switch case mode" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Positioning & offer" }),
    );
    expect(
      screen.getByText("Field sales teams", { selector: "strong" }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Switch case mode" }));
    expect(
      screen.getByRole("button", { name: /2\s*Field sales teams\s*ICP/ }),
    ).toBeTruthy();
  });
  it("applies sensitivity to modeled comparisons without overwriting channel inputs", () => {
    render(<Case />);
    fireEvent.click(screen.getByRole("button", { name: "Switch case mode" }));
    expect(screen.getByText("-$1,404.15", { selector: "strong" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Upside" }));
    expect(screen.getByText("-$1,329.60", { selector: "strong" })).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Edit channel assumptions" }),
    );
    expect(
      (
        screen.getByRole("spinbutton", {
          name: "Visit → lead (%)",
        }) as HTMLInputElement
      ).value,
    ).toBe("8");
    expect(
      (
        screen.getByRole("spinbutton", {
          name: "Lead → customer (%)",
        }) as HTMLInputElement
      ).value,
    ).toBe("12");
  });
});
