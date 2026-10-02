import { U, useExampleState } from "../../../dev/exampleHelpers";
export default function LevelMeterExample() {
  const { value, setValue, notice, setNotice } = useExampleState();
  const demo = (
    <>
      <U.LevelMeter value={value} />
      <U.Slider
        value={value}
        onValueChange={setValue}
        label="Уровень сигнала"
      />
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
