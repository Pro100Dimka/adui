import React, { useEffect, useState } from "react";
import {
  AudioPlayer,
  Button,
  Card,
  Dialog,
  FilePicker,
  Slider,
  Stack,
  Switch,
  TextField,
  ThemeProvider,
  Typography,
} from "@ad-voice/ui";
import "@ad-voice/ui/styles.css";

/** Native React consumer built only from public A&D UI primitives. */
export default function ControlledDemo() {
  const [name, setName] = useState("Дмитрий");
  const [volume, setVolume] = useState(35);
  const [motion, setMotion] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [savedName, setSavedName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState<string>();

  useEffect(() => {
    document.documentElement.dataset.adMotion = motion ? "on" : "off";
  }, [motion]);

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
      <Card
        title="Мои настройки"
        description="Пример управления через React state"
        border
      >
        <Stack gap={4}>
          <TextField
            label="Имя в комнате"
            required
            value={name}
            onValueChange={setName}
            clearable
          />
          <Stack gap={2}>
            <Typography variant="label">Громкость</Typography>
            <Slider value={volume} onValueChange={setVolume} />
          </Stack>
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
            <Typography as="p" variant="body-sm" tone="success">
              Сохранено локально в состоянии примера: {savedName}
            </Typography>
          )}
        </Stack>
      </Card>
      <Dialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Сохранить настройки?"
        description="В этом примере данные не отправляются на сервер."
        onConfirm={() => setSavedName(name)}
      />
    </ThemeProvider>
  );
}
