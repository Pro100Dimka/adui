import { tr, useLocale, useTr } from "@ad-voice/ui";
import { useEffect, useRef, useState } from "react";
import { Badge, Button, MessageBar, Typography } from "@ad-voice/ui";
import { CopyButton } from "./CopyButton";
import { CodeEditor } from "./CodeEditor";
import { compile } from "./liveCode";
import sandboxRuntimeUrl from "./sandboxRuntime.tsx?worker&url";
const previewRuntimeUrl = import.meta.env.DEV ? "/sandbox-runtime.js" : sandboxRuntimeUrl;

const storageKey = (name: string) => `neo-ui-code:${name}`;
const readDraft = (name: string) => {
  try {
    return sessionStorage.getItem(storageKey(name));
  } catch {
    return null;
  }
};

/**
 * Edit the example and see it run: the code compiles as you type and renders beside it.
 * Edits stay in this browser tab only; until edited, the code follows the example settings.
 */
export function LiveEditor({
  name,
  original,
}: {
  name: string;
  original: string;
}) {
  const tr = useTr();
  const locale = useLocale();
  const [stored, setStored] = useState(() => readDraft(name));
  // Typing the example back to what it was is no edit at all: the draft disappears with it.
  const draft = stored === original ? null : stored;
  const setDraft = (next: string | null) => setStored(next === original ? null : next);
  const code = draft ?? original;
  const preview = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [result, setResult] = useState<{
    js?: string;
    error?: string;
    version: number;
  }>({ version: 0 });

  useEffect(() => {
    try {
      if (draft === null) sessionStorage.removeItem(storageKey(name));
      else sessionStorage.setItem(storageKey(name), draft);
    } catch {
      // Storage blocked: edits still work until the dialog closes.
    }
  }, [draft, name]);

  useEffect(() => {
    let alive = true;
    const timer = setTimeout(() => {
      compile(code).then(
        (js) =>
          alive && setResult((r) => ({ js, version: r.version + 1 })),
        (error: Error) =>
          alive && setResult((r) => ({ error: error.message, version: r.version + 1 })),
      );
    }, 250);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [code]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const receive = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow || event.data?.kind !== "ad-preview-error") return;
      setResult((current) => ({ error: String(event.data.message), version: current.version + 1 }));
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);

  const sendPreview = () => {
    const host = preview.current;
    if (!host || !result.js) return;
    const theme = host.closest<HTMLElement>("[data-ad-theme]");
    const computed = getComputedStyle(theme ?? host);
    const tokens = Object.fromEntries(Array.from(computed)
      .filter((name) => name.startsWith("--ad-"))
      .map((name) => [name, computed.getPropertyValue(name)]));
    frame.current?.contentWindow?.postMessage({
      kind: "ad-preview-render",
      code: result.js,
      locale,
      theme: theme?.dataset.adTheme ?? "ruby",
      colorScheme: theme?.dataset.adColorScheme ?? "dark",
      tokens,
      links: Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')).map((link) => link.href),
      styles: Array.from(document.querySelectorAll<HTMLStyleElement>("style")).map((style) => style.textContent ?? ""),
    }, "*");
  };

  const { js, error, version } = result;
  return (
    <div className="docs-live">
      <div className="docs-live-editor">
        <div className="docs-live-head">
          <Badge>TSX</Badge>
          <Typography variant="label">Example.tsx</Typography>
          {draft !== null && (
            <Badge tone="warning" size="sm">
              {tr("Изменено")}
            </Badge>
          )}
          <span className="docs-live-actions">
            {draft !== null && (
              <Button
                size="xs"
                variant="ghost"
                icon="reset"
                onClick={() => setDraft(null)}
              >
                {tr("Вернуть исходный")}
              </Button>
            )}
            <CopyButton text={code} />
          </span>
        </div>
        <CodeEditor label={tr("Код примера")} value={code} onChange={setDraft} />
      </div>
      <div className="docs-live-preview" ref={preview}>
        {error && <MessageBar tone="error">{error}</MessageBar>}
        {js && (
          <iframe
            key={version}
            ref={frame}
            className="docs-live-frame"
            title={`${name} preview`}
            sandbox="allow-scripts"
            srcDoc={`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;min-height:100%;background:transparent}#root{min-height:100vh;display:grid;place-items:center}</style></head><body><div id="root"></div><script>addEventListener("error",function(e){parent.postMessage({kind:"ad-preview-error",message:e.message||"Не удалось загрузить предпросмотр."},"*")},true)<\/script><script src="${previewRuntimeUrl}"><\/script></body></html>`}
            onLoad={sendPreview}
          />
        )}
      </div>
    </div>
  );
}
export default LiveEditor;
