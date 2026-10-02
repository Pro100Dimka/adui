import { U, useExampleState } from "../../../dev/exampleHelpers";
export default function ProgressBarExample() {
  const { value, setValue, open, notice, setNotice } = useExampleState();
  const demo = (
    <>
      <U.ProgressBar value={value} />
      <U.Slider
        value={value}
        onValueChange={setValue}
        label="Значение прогресса"
      />
      <U.Text>{value}%</U.Text>
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
