import { Playground, U, jsx } from "./exampleHelpers";

const messages = { "Пока нет записей": "Your collection is empty" };

export default function LocaleProviderExample() {
  return (
    <Playground
      knobs={{ locale: { options: ["en", "ru", "uk"] as const, value: "en" }, custom: { value: false } }}
      code={(v) => jsx("LocaleProvider", { locale: v.locale, messages: v.custom ? messages : undefined }, "<EmptyState />")}
    >
      {(v) => <U.LocaleProvider locale={v.locale} messages={v.custom ? messages : undefined}><U.EmptyState /></U.LocaleProvider>}
    </Playground>
  );
}
