import React from "react";
import { U, useExampleState } from "../../../dev/exampleHelpers";

export default function TextFieldExample() {
  const { text, setText, alert } = useExampleState();
  return <U.Stack gap={3}>
    <U.Grid minChildWidth="11rem" gap={2}>
      <U.TextField label="Обычное" value={text} onValueChange={setText} />
      <U.TextField label="С adornments" value={text} onValueChange={setText} startAdornment={<U.Icon name="search" />} endAdornment={<U.IconButton size="xs" icon="copy" label="Копировать" onClick={() => { void U.copyText(text); alert("Скопировано"); }} />} />
      <U.TextField label="Read only" readOnly value="D:/Music/song.wav" endAdornment={<U.IconButton size="xs" icon="folder" label="Открыть" />} />
    </U.Grid>
    <U.Grid minChildWidth="8rem" gap={2}>
      {(["xs", "sm", "md", "lg"] as const).map(size => <U.TextField key={size} size={size} aria-label={`TextField ${size}`} placeholder={size.toUpperCase()} />)}
    </U.Grid>
  </U.Stack>;
}
