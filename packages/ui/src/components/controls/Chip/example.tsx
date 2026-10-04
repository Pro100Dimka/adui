import { useState } from "react";
import { Playground, U, jsx } from "../../../dev/exampleHelpers";

export default function ChipExample() {
  const [genres, setGenres] = useState(["Рок", "Поп", "Джаз", "Инди"]);
  const [on, setOn] = useState("Поп");
  return (
    <Playground
      knobs={{ removable: { value: true } }}
      code={(v) => jsx("Chip", { label: "Анна", avatar: { expr: '{ name: "Анна" }' }, onRemove: v.removable ? { expr: "() => remove()" } : undefined })}
    >
      {(v) => (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <U.Chip label="Анна Ковальчук" avatar={{ name: "Анна Ковальчук" }} onRemove={v.removable ? () => undefined : undefined} />
            <U.Chip label="Студия" icon="studio" onRemove={v.removable ? () => undefined : undefined} />
            {genres.map((genre) => (
              <U.Chip key={genre} label={genre} onRemove={v.removable ? () => setGenres((all) => all.filter((g) => g !== genre)) : undefined} />
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {["Рок", "Поп", "Джаз"].map((genre) => (
              <U.Chip key={genre} label={genre} selected={on === genre} onClick={() => setOn(genre)} />
            ))}
          </div>
        </div>
      )}
    </Playground>
  );
}
