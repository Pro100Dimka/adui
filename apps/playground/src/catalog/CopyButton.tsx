import { tr, useTr } from "@ad-voice/ui";
import { useState } from "react";
import { Button, copyText } from "@ad-voice/ui";

/** Copies `text` and says so for a moment. */
export function CopyButton({ text, variant = "secondary" }: { text: string; variant?: "secondary" | "ghost" }) {
  const tr = useTr();
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size="xs"
      variant={copied && variant !== "ghost" ? "primary" : variant}
      icon={copied ? "check" : "copy"}
      onClick={() => {
        void copyText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }}
    >
      {copied ? tr("Скопировано") : tr("Копировать")}
    </Button>
  );
}
