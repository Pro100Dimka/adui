import { U, useExampleState } from "../../../dev/exampleHelpers";
export default function MenuExample() {
  const { open, setOpen, notice, setNotice, anchor, items } = useExampleState();
  const demo = (
    <>
      <U.Button
        ref={anchor}
        icon="more"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        Открыть меню
      </U.Button>
      <U.Menu
        open={open}
        onOpenChange={setOpen}
        anchorRef={anchor}
        items={items}
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
