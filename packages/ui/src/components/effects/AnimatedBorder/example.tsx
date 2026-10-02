import React from "react";
import { U } from "../../../dev/exampleHelpers";

export default function AnimatedBorderExample() {
  return (
    <U.Stack direction="row" gap={3} wrap>
      <U.AnimatedBorder
        style={{ borderRadius: "var(--ad-radius)", flex: "1 1 14rem" }}
      >
        <U.Card material="glass" title="Обычная обводка">
          <U.Typography variant="body" tone="muted">
            Эффект можно наложить на любой контейнер.
          </U.Typography>
        </U.Card>
      </U.AnimatedBorder>
      <U.AnimatedBorder
        shell
        style={{ borderRadius: "var(--ad-radius)", flex: "1 1 14rem" }}
      >
        <U.Card material="shell" title="Shell вариант">
          <U.Typography variant="body" tone="muted">
            Та же анимация без отдельного Card API.
          </U.Typography>
        </U.Card>
      </U.AnimatedBorder>
    </U.Stack>
  );
}
