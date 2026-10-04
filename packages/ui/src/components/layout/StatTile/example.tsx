import { Playground, U, jsx } from "../../../dev/exampleHelpers";

export default function StatTileExample() {
  return (
    <Playground
      stretch
      knobs={{ tilt: { value: true } }}
      code={(v) => jsx("StatTile", { icon: "music", value: { expr: "128" }, label: "Всего песен", tilt: v.tilt ? undefined : { expr: "false" } })}
    >
      {(v) => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          <U.StatTile icon="music" value={128} label="Всего песен" tilt={v.tilt} />
          <U.StatTile icon="mic" value={96} label="Готово к караоке" tilt={v.tilt} />
          <U.StatTile icon="users" value={4} label="Друзья · 2 в сети" tilt={v.tilt} onClick={() => undefined} />
        </div>
      )}
    </Playground>
  );
}
