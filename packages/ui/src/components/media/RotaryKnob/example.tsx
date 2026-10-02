import { U, useExampleState } from "../../../dev/exampleHelpers";
export default function RotaryKnobExample() {
  const { value, setValue, notice, setNotice } = useExampleState();
  const demo = (
    <>
      <div className="sample-row sample-knob-row">
        <U.RotaryKnob
          size="lg"
          value={value}
          onValueChange={setValue}
          onValueCommit={(v) => setNotice(`Громкость: ${v}%`)}
          label="Громкость"
        />
      </div>
      <span className="sample-note">
        Круговой drag у края, линейный drag из центра, выбор по шкале, колесо,
        клавиатура, Shift для точного шага, Escape и двойной щелчок для сброса.
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
