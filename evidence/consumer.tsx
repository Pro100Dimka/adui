import { StrictMode, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Button, IconButton, InputBase, ToggleButton, Tab, Select, Slider, Autocomplete, TextField, Dialog, Stack, Card, Typography, AnimatedBorder, AudioPlayer, Toast, themes, type ThemeName, type SplitButtonProps } from "@neo-ui-kit/react";
import { ThemeProvider, LocaleProvider } from "@neo-ui-kit/react/core";
import { Form, useForm } from "@neo-ui-kit/react/forms";
import { PianoRoll } from "@neo-ui-kit/react/editor";
import { Router } from "@neo-ui-kit/react/router";
import "@neo-ui-kit/react/styles.css";

// @ts-expect-error Menu item labels are strings, not arbitrary values.
const invalidItems: SplitButtonProps["items"] = [{ label: 42 }];
void invalidItems;

function App() {
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState("a");
  const [theme, setTheme] = useState<ThemeName>("ruby");
  const [scheme, setScheme] = useState<"dark" | "light">("dark");
  const refs = { Button: useRef<HTMLButtonElement>(null), IconButton: useRef<HTMLButtonElement>(null), ToggleButton: useRef<HTMLButtonElement>(null), Tab: useRef<HTMLButtonElement>(null), InputBase: useRef<HTMLDivElement>(null), Select: useRef<HTMLButtonElement>(null), Slider: useRef<HTMLInputElement>(null) };
  const [refStatus, setRefStatus] = useState("");
  const form = useForm({ initialValues: { name: "" } });
  return <LocaleProvider locale="en"><ThemeProvider theme={theme} colorScheme={scheme}>
    <main style={{ padding: 16, maxWidth: 920, margin: "auto", color: "var(--ad-text)", background: "var(--ad-neutral-950)", fontFamily: "var(--ad-font-family-sans)" }}>
      <Stack gap={3}>
        <Typography variant="h1">Packed consumer</Typography>
        <Stack direction="row" wrap gap={2}>{Object.keys(themes).map((name) => <Button key={name} onClick={() => setTheme(name as ThemeName)}>{name}</Button>)}<Button onClick={() => setScheme(scheme === "dark" ? "light" : "dark")}>Toggle scheme</Button></Stack>
        <Card title="Public entry points" border>
          <Stack gap={3}>
            <Button ref={refs.Button} onClick={() => setOpen(true)}>Open dialog</Button>
            <IconButton ref={refs.IconButton} label="Icon action" />
            <ToggleButton ref={refs.ToggleButton}>Toggle action</ToggleButton>
            <div role="tablist" aria-label="Reference test"><Tab ref={refs.Tab} selected>Reference tab</Tab></div>
            <InputBase ref={refs.InputBase}><input aria-label="Raw input" /></InputBase>
            <Button onClick={() => setRefStatus(Object.entries(refs).filter(([, ref]) => ref.current).map(([name]) => name).join(","))}>Check refs</Button>
            <output data-testid="refs" style={{ overflowWrap: "anywhere" }}>{refStatus}</output>
            <Select ref={refs.Select} label="Packed select" value={selection} onValueChange={setSelection} options={[{ value: "a", label: "Alpha" }, { value: "b", label: "Beta" }]} />
            <Slider ref={refs.Slider} label="Packed slider" defaultValue={50} />
            <Autocomplete label="Packed autocomplete" options={["Alpha", "Beta"]} />
            <Form form={form}><TextField label="Name" value={form.values.name} onValueChange={(value) => form.setValue("name", value)} /></Form>
            <AudioPlayer volume={0.5} onVolumeChange={() => {}} />
            <Toast duration={0} />
          </Stack>
        </Card>
        <AnimatedBorder style={{ height: 96, borderRadius: "10px 30px 50% 0", padding: 16 }}>Asymmetric contour</AnimatedBorder>
        <Typography style={{ fontFamily: "Melodix" }}>Neon</Typography>
        <div hidden><PianoRoll /><Router mode="hash" routes={[{ path: "*", element: <span>Router loaded</span> }]} /></div>
      </Stack>
      <Dialog open={open} onOpenChange={setOpen} title="Packed dialog"><TextField label="Dialog name" /><Select label="Dialog select" options={["One", "Two"]} /></Dialog>
    </main>
  </ThemeProvider></LocaleProvider>;
}
createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
