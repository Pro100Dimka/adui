import { U, useExampleState } from "../../../dev/exampleHelpers";
export default function ScrollAreaExample() {
  const { notice, setNotice } = useExampleState();
  const demo = (
    <U.ScrollArea height="clamp(9rem, 28dvh, 14rem)" label="Пример прокрутки">
      {Array.from({ length: 12 }, (_, i) => (
        <div className="scroll-row" key={i}>
          <span>Запись {i + 1}</span>
          <U.Badge tone="success">Готово</U.Badge>
        </div>
      ))}
    </U.ScrollArea>
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
