import { Button, LocaleProvider, Stack, Typography, useLocale, useTr } from "@ad-voice/ui";
import { Router, useRouter, type RouteDefinition } from "@ad-voice/ui/router";

const messages: Record<string, Record<string, string>> = {
  en: {
    "Главная": "Home", "Комнаты": "Rooms", "Настройки": "Settings",
    "Вы на главной странице.": "You are on the home page.",
    "Комната {id}": "Room {id}", "Страница настроек.": "Settings page.",
  },
  uk: {
    "Главная": "Головна", "Комнаты": "Кімнати", "Настройки": "Налаштування",
    "Вы на главной странице.": "Ви на головній сторінці.",
    "Комната {id}": "Кімната {id}", "Страница настроек.": "Сторінка налаштувань.",
  },
};

function Page({ text, vars }: { text: string; vars?: Record<string, string> }) {
  const { navigate } = useRouter();
  const tr = useTr();
  return (
    <Stack gap={4} style={{ padding: 16 }}>
      <Stack as="nav" direction="row" gap={2} wrap>
        <Button onClick={() => navigate("/")}>{tr("Главная")}</Button>
        <Button onClick={() => navigate("/rooms/42")}>{tr("Комнаты")}</Button>
        <Button onClick={() => navigate("/settings")}>{tr("Настройки")}</Button>
      </Stack>
      <Typography>{tr(text, vars)}</Typography>
    </Stack>
  );
}

const routes: RouteDefinition[] = [
  { path: "/", element: <Page text="Вы на главной странице." /> },
  { path: "/rooms/:id", element: (match) => <Page text="Комната {id}" vars={match.params} /> },
  { path: "/settings", element: <Page text="Страница настроек." /> },
  { path: "*", redirectTo: "/" },
];

/** Router uses the URL hash by default: navigate("/rooms/42") opens #/rooms/42. */
export default function RouterExample() {
  const locale = useLocale();
  return <LocaleProvider locale={locale} messages={messages[locale]}><Router routes={routes} /></LocaleProvider>;
}
