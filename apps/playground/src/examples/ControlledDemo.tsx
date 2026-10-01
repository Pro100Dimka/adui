import { useEffect, useState } from "react";
import {
  AudioPlayer,
  Button,
  Card,
  Dialog,
  Field,
  FilePicker,
  MotionProvider,
  Slider,
  Switch,
  TextField,
  ThemeProvider,
} from "@ad-voice/ui";
import "@ad-voice/ui/styles.css";

/** A native React consumer. No legacy controller, raw HTML or reference mode. */
export default function ControlledDemo() {
  const [name, setName] = useState("Дмитрий");
  const [volume, setVolume] = useState(35);
  const [motion, setMotion] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [savedName, setSavedName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState<string>();

  useEffect(() => {
    if (!file) {
      setSource(undefined);
      return;
    }
    const url = URL.createObjectURL(file);
    setSource(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <ThemeProvider>
      <MotionProvider enabled={motion}>
        <Card
          title="Мои настройки"
          description="Пример управления через React state"
          border
        >
          <Field label="Имя в комнате" required>
            <TextField value={name} onValueChange={setName} clearable />
          </Field>
          <Field label="Громкость">
            <Slider value={volume} onValueChange={setVolume} />
          </Field>
          <Switch label="Анимации" checked={motion} onValueChange={setMotion} />
          <FilePicker
            label="Выбрать свою запись"
            accept="audio/*"
            onFiles={(files) => setFile(files[0] ?? null)}
          />
          <AudioPlayer src={source} volume={volume / 100} />
          <Button
            variant="primary"
            icon="save"
            onClick={() => setConfirming(true)}
          >
            Сохранить
          </Button>
          {savedName && (
            <p role="status">
              Сохранено локально в состоянии примера: {savedName}
            </p>
          )}
        </Card>
        <Dialog
          open={confirming}
          onOpenChange={setConfirming}
          title="Сохранить настройки?"
          description="В этом примере данные не отправляются на сервер."
          onConfirm={() => setSavedName(name)}
        />
      </MotionProvider>
    </ThemeProvider>
  );
}
