import { U, useExampleState } from "../../../dev/exampleHelpers";
export default function AudioPlayerExample() {
  const { open, notice, setNotice, note } = useExampleState();
  const demo = (
    <>
      <U.AudioPlayer duration={51} />
      <span className="sample-note">
        Без src проигрывается только демонстрационная шкала времени.
      </span>
    </>
  );
  return (
    <>
      {demo}
      <U.Toast
        floating
        open={!!notice}
        message={notice}
        onClose={() => setNotice("")}
      />
    </>
  );
}
