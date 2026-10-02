import React from "react";
import { Link, Stack } from "../../../index";
export default function LinkExample() {
  return (
    <Stack direction="row" gap={3} wrap>
      <Link href="#/components/button">Документация</Link>
      <Link href="#/components/button" icon="link" endIcon="chevron">
        С иконками
      </Link>
      <Link href="https://example.com" external>
        Внешняя ссылка
      </Link>
    </Stack>
  );
}
