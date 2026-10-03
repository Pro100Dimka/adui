# @ad-voice/ui

Neo UI — React + TypeScript UI kit: glass/ruby surfaces, animated neon borders, fields, tabs, dialogs, audio controls and a melody editor.

## Install

React and ReactDOM are peer dependencies.

```bash
npm install @ad-voice/ui react react-dom
```

Import the stylesheet once in the app entry point:

```ts
import "@ad-voice/ui/styles.css";
```

## Usage

```tsx
import { Button, Card, Switch, TextField } from "@ad-voice/ui";

export function SettingsCard() {
  return (
    <Card title="Настройки" border>
      <TextField label="Имя в онлайн-комнате" defaultValue="BBB" clearable />
      <Switch label="Радио включено" defaultChecked />
      <Button variant="primary" icon="save">
        Сохранить
      </Button>
    </Card>
  );
}
```

Every stateful component works both controlled (`value` + `onValueChange`) and uncontrolled (`defaultValue`).

## Entry points

```ts
import { Button, Card, Dialog, AudioPlayer } from "@ad-voice/ui";
import { PianoRollGrid } from "@ad-voice/ui/editor";
import { Router } from "@ad-voice/ui/router";
import { Form, FormFields, useForm } from "@ad-voice/ui/forms";
import { ThemeProvider, useMotion } from "@ad-voice/ui/core";
```

## RotaryKnob

Canvas-rendered volume knob. Drag near the edge to rotate, drag from the center to move linearly, click the outer scale to jump. Wheel and arrow keys change the value, Shift gives a fine step, PageUp/PageDown change by 10, Home/End set 0/100, Escape cancels a drag, double-click resets. `onValueChange` fires while adjusting, `onValueCommit` after the gesture. `readOnly` turns it into a gauge.
