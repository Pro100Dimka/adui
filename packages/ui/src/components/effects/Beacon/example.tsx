import { Playground, U, expr, jsx } from "../../../dev/exampleHelpers";

export default function BeaconExample() {
  return (
    <Playground
      knobs={{ active: { value: true } }}
      code={(v) =>
        jsx(
          "Beacon",
          { active: v.active ? undefined : expr("false") },
          '<IconButton variant="primary" round icon="mic" label="Ваша очередь" />',
        )
      }
    >
      {(v) => (
        <U.Beacon active={v.active}>
          <U.IconButton
            variant="primary"
            round
            icon="mic"
            label="Ваша очередь"
          />
        </U.Beacon>
      )}
    </Playground>
  );
}
