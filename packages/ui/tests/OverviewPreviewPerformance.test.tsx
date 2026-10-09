import { afterEach, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { act, create } from "react-test-renderer";
import { ExamplePreviewContext, Playground } from "../src/dev/exampleHelpers";
import LevelMeterExample from "../src/components/media/LevelMeter/example";

afterEach(() => vi.restoreAllMocks());

it("mounts only the default specimen in overview previews without generating unused code", () => {
  const code = vi.fn(() => "example");
  const specimen = vi.fn((value: { variant: "first" | "second" }) =>
    createElement("span", { "data-look": value.variant }));
  const example = createElement(Playground, {
    knobs: { variant: { options: ["first", "second"] as const, value: "first" as const } },
    code,
    children: specimen,
  });

  const preview = renderToStaticMarkup(createElement(ExamplePreviewContext.Provider, { value: true }, example));
  expect(preview).toContain('data-look="first"');
  expect(preview).not.toContain('data-look="second"');
  expect(specimen).toHaveBeenCalledTimes(1);
  expect(code).not.toHaveBeenCalled();

  const detail = renderToStaticMarkup(example);
  expect(detail).toContain('data-look="first"');
  expect(detail).toContain('data-look="second"');
});

it("does not run the LevelMeter demo state interval inside overview previews", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const interval = vi.spyOn(globalThis, "setInterval");
  let preview!: ReturnType<typeof create>;
  act(() => {
    preview = create(createElement(ExamplePreviewContext.Provider, { value: true }, createElement(LevelMeterExample)));
  });
  expect(interval).not.toHaveBeenCalled();
  act(() => preview.unmount());

  let detail!: ReturnType<typeof create>;
  act(() => { detail = create(createElement(LevelMeterExample)); });
  expect(interval).toHaveBeenCalledOnce();
  act(() => detail.unmount());
  vi.unstubAllGlobals();
});
