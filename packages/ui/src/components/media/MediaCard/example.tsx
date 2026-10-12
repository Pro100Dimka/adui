import { Playground, U, jsx } from "../../../dev/exampleHelpers";

export default function MediaCardExample() {
  return (
    <Playground
      stretch
      knobs={{ tilt: { value: true } }}
      code={(v) =>
        jsx("MediaCard", { title: "Небо", subtitle: "Звери", badge: { expr: '<Badge tone="success">Готово</Badge>' }, tilt: v.tilt ? undefined : { expr: "false" } },
          '<IconButton round size="sm" variant="primary" icon="play" label="Играть" />')
      }
    >
      {(v) => (
        <U.Grid minChildWidth="15rem" gap={4} style={{ gridAutoRows: "minmax(12rem, auto)" }}>
          <U.MediaCard title="Небо" subtitle="Звери" tilt={v.tilt} badge={<U.Badge tone="success">Готово</U.Badge>}
            actions={<><U.IconButton round size="sm" variant="primary" icon="play" label="Играть" /><U.IconButton round size="sm" icon="more" label="Ещё" /></>} />
          <U.MediaCard title="Группа крови" subtitle="Кино" phase={0.4} tilt={v.tilt} badge={<U.Badge tone="warning">Обработка</U.Badge>}
            actions={<U.IconButton round size="sm" icon="stop" label="Отменить" />}>
            <U.ProgressBar value={46} label="Разделение · 46%" />
          </U.MediaCard>
        </U.Grid>
      )}
    </Playground>
  );
}
