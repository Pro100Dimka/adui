import { U, useExampleState } from "../../../dev/exampleHelpers";
export default function TabPanelExample() {
  const { notice, setNotice } = useExampleState();
  const demo = (
    <U.TabPanel>
      <U.Text>Содержимое выбранной вкладки</U.Text>
    </U.TabPanel>
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
