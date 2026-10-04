import { useState } from "react";
import { Playground, U, jsx, inputVariants } from "../../../dev/exampleHelpers";

const genres = ["Рок", "Поп", "Джаз", "Инди", "Метал", "Фолк", "Электроника", "Хип-хоп", "Классика", "Соул"];

export default function TagInputExample() {
  const [tags, setTags] = useState(["Рок", "Инди"]);
  return (
    <Playground
      stretch
      knobs={{ variant: { options: inputVariants, value: "outlined" }, floating: { value: false } }}
      code={(v) =>
        jsx("TagInput", {
          label: "Жанры",
          value: { expr: "tags" },
          onValueChange: { expr: "setTags" },
          suggestions: { expr: "genres" },
          max: 6,
          variant: v.variant === "outlined" ? undefined : v.variant,
        })
      }
    >
      {(v) => (
        <U.TagInput label="Жанры" icon="music" value={tags} onValueChange={setTags} suggestions={genres} max={6}
          description="До шести жанров; можно вставить списком через запятую"
          validate={(tag) => (tag.length > 20 ? "Слишком длинный тег" : undefined)}
          variant={v.variant} labelPlacement={v.floating ? "floating" : "top"} />
      )}
    </Playground>
  );
}
