import * as React from "react";
import { createRoot } from "react-dom/client";
import * as UI from "@ad-voice/ui";
import * as Core from "@ad-voice/ui/core";
import * as Editor from "@ad-voice/ui/editor";
import * as Forms from "@ad-voice/ui/forms";
import * as RouterModule from "@ad-voice/ui/router";

// This file is bundled as a classic script and runs only in an opaque-origin iframe.
const modules: Record<string, unknown> = {
  react: React,
  "@ad-voice/ui": UI,
  "@ad-voice/ui/core": Core,
  "@ad-voice/ui/editor": Editor,
  "@ad-voice/ui/forms": Forms,
  "@ad-voice/ui/router": RouterModule,
};
const root = createRoot(document.getElementById("root")!);
const report = (error: unknown) => parent.postMessage({ kind: "ad-preview-error", message: error instanceof Error ? error.message : String(error) }, "*");

class Boundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error) { report(error); }
  render() { return this.state.failed ? null : this.props.children; }
}

window.addEventListener("message", (event: MessageEvent) => {
  if (event.source !== parent || event.data?.kind !== "ad-preview-render") return;
  const { code, links, styles, tokens, theme, colorScheme, locale } = event.data;
  if (typeof code !== "string") return;
  try {
    for (const href of links as string[]) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.append(link);
    }
    for (const css of styles as string[]) {
      const style = document.createElement("style");
      style.textContent = css;
      document.head.append(style);
    }
    const module = { exports: {} as { default?: React.ComponentType } };
    const require = (name: string) => {
      if (name in modules) return modules[name];
      throw new Error(`Модуль «${name}» недоступен в песочнице`);
    };
    new Function("require", "module", "exports", "React", code)(require, module, module.exports, React);
    if (typeof module.exports.default !== "function") throw new Error("Пример должен экспортировать компонент: export default function …");
    const Example = module.exports.default;
    root.render(
      <UI.LocaleProvider locale={locale ?? "ru"}>
        <UI.ThemeProvider theme={theme} colorScheme={colorScheme} tokens={tokens}>
          <Boundary><Example /></Boundary>
        </UI.ThemeProvider>
      </UI.LocaleProvider>,
    );
  } catch (error) {
    report(error);
  }
});
