import {
  Button,
  ButtonGroup,
  Divider,
  IconButton,
  Select,
  ToggleButton,
  Toolbar,
} from "@ad-voice/ui";

export default function ToolbarExample() {
  return (
    <Toolbar>
      <ButtonGroup>
        <ToggleButton icon="cursor" label="Выделение" defaultChecked />
        <IconButton icon="pencil" label="Карандаш" />
        <IconButton icon="eraser" label="Ластик" />
      </ButtonGroup>
      <Divider vertical />
      <Select
        size="sm"
        options={["C#4", "D4", "E4"]}
        defaultValue="D4"
        icon="note"
      />
      <Button variant="primary" icon="save" size="sm">
        Сохранить
      </Button>
    </Toolbar>
  );
}
