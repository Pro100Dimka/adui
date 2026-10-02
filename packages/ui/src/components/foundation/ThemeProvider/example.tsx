import { useState } from "react";
import {
  Button,
  Card,
  Stack,
  TextField,
  ThemePicker,
  ThemeProvider,
} from "@ad-voice/ui";

type Theme = "ruby" | "light" | "green" | "violet";

export default function ThemeProviderExample() {
  const [theme, setTheme] = useState<Theme>("ruby");
  return (
    <ThemeProvider theme={theme}>
      <Stack gap={4}>
        <ThemePicker value={theme} onValueChange={setTheme} />
        <Card material="glass" title="Предпросмотр темы">
          <Stack direction={{ base: "column", sm: "row" }} gap={2}>
            <TextField placeholder="Поле ввода" />
            <Button variant="primary">Применить</Button>
          </Stack>
        </Card>
      </Stack>
    </ThemeProvider>
  );
}
