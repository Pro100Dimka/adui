import { U, useExampleState } from "../../../dev/exampleHelpers";
export default function WaveformExample() {
  const { value, setValue, open, notice, setNotice } = useExampleState();
  const demo = <U.Waveform position={value} duration={231} onSeek={setValue} />;
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
