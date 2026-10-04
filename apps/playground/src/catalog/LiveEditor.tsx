import { useEffect, useState, type ComponentType } from "react";
import { Badge, Button, MessageBar, Typography } from "@ad-voice/ui";
import { CopyButton } from "./CopyButton";
import { DocsExampleBoundary } from "./DocsExampleBoundary";
import { CodeEditor } from "./CodeEditor";
import { compile } from "./liveCode";

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
  const [stored, setStored] = useState(() => readDraft(name));
  // Typing the example back to what it was is no edit at all: the draft disappears with it.
  const draft = stored === original ? null : stored;
  const setDraft = (next: string | null) => setStored(next === original ? null : next);
  const code = draft ?? original;
  const [result, setResult] = useState<{
    Component?: ComponentType;
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
        (Component) =>
          alive && setResult((r) => ({ Component, version: r.version + 1 })),
        (error: Error) =>
          alive && setResult((r) => ({ ...r, error: error.message })),
      );
    }, 250);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [code]);

  const { Component, error, version } = result;
  return (
    <div className="docs-live">
      <div className="docs-live-editor">
        <div className="docs-live-head">
          <Badge>TSX</Badge>
          <Typography variant="label">Example.tsx</Typography>
          {draft !== null && (
            <Badge tone="warning" size="sm">
              Изменено
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
                Вернуть исходный
              </Button>
            )}
            <CopyButton text={code} />
          </span>
        </div>
        <CodeEditor label="Код примера" value={code} onChange={setDraft} />
      </div>
      <div className="docs-live-preview">
        {error && <MessageBar tone="error">{error}</MessageBar>}
        {Component && (
          <DocsExampleBoundary key={version} name={name}>
            <Component />
          </DocsExampleBoundary>
        )}
      </div>
    </div>
  );
}
