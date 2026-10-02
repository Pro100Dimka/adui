import React from "react";
import { createRoot } from "react-dom/client";
import {
  Button,
  Card,
  Field,
  TextField,
  Switch,
  ProgressBar,
} from "@ad-voice/ui";
import "@ad-voice/ui/styles.css";

function App() {
  return (
    <div style={{ width: 760, margin: "3.75rem auto" }}>
      <Card animatedBorder>
        <h2>A&D Voice UI</h2>
        <Field label="Имя в онлайн-комнате">
          <TextField defaultValue="BBB" clearable />
        </Field>
        <Switch label="Радио включено" defaultChecked />
        <ProgressBar value={68} />
        <Button variant="primary" icon="save">
          Сохранить
        </Button>
      </Card>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
