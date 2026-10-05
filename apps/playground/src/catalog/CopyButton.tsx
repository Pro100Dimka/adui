import { tr } from "@ad-voice/ui";
import { useState } from "react";
import { Button, copyText } from "@ad-voice/ui";

/** Copies `text` and says so for a moment. */
export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size="xs"
      variant={copied ? "primary" : "secondary"}
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
