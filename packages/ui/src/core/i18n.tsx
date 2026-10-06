import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { messages as builtIn } from "./messages";

/** Languages the library speaks out of the box; any other code works with your own messages. */
export type Locale = "ru" | "en" | "uk" | (string & {});

/** Translations of the library's own texts. The key is the Russian original, e.g. "Закрыть". */
export type Messages = Record<string, string>;

let current: Locale = "ru";
const extra: Record<string, Messages> = {};

const fill = (text: string, vars?: Record<string, string | number>) =>
  vars ? text.replace(/\{(\w+)\}/g, (all, name: string) => (name in vars ? String(vars[name]) : all)) : text;

/**
 * A text of the library in the current language: `tr("Закрыть")` is "Close" in English.
 * `{name}` placeholders are filled from `vars`. Unknown texts come back as they are.
 */
export function tr(text: string, vars?: Record<string, string | number>): string {
  return translate(current, text, vars);
}

export function translate(locale: Locale, text: string, vars?: Record<string, string | number>, messages?: Messages): string {
  const own = messages?.[text] ?? extra[locale]?.[text];
  const known = own ?? builtIn[locale]?.[text];
  return fill(known ?? text, vars);
}

/** The language of the library's texts for everything rendered after this call. */
export function setLocale(locale: Locale) {
  current = locale;
}
export function getLocale(): Locale {
  return current;
}

/** Your own translations (a new language, or other wording for a built-in one). */
export function addMessages(locale: Locale, messages: Messages) {
  extra[locale] = { ...extra[locale], ...messages };
}

/** Plural form by Slavic rules (one / few / many); English uses one / many. */
export function plural(n: number, one: string, few: string, many: string, locale: Locale = current) {
  const mod10 = n % 10,
    mod100 = n % 100;
  if (locale === "en") return n === 1 ? one : many;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

const LocaleContext = createContext<{ locale: Locale; messages?: Messages } | null>(null);

/**
 * Sets the language of every library text inside it. Changing `locale` re-renders the tree
 * under it in the new language; `messages` overrides translations only in this tree.
 */
export function LocaleProvider({ locale, messages, children }: { locale: Locale; messages?: Messages; children?: ReactNode }) {
  const value = useMemo(() => ({ locale, messages }), [locale, messages]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/** The language set by the nearest LocaleProvider. */
export function useLocale(): Locale {
  return useContext(LocaleContext)?.locale ?? current;
}

/** A translator bound to the nearest provider, safe across independent React roots. */
export function useTr() {
  const context = useContext(LocaleContext);
  const locale = context?.locale ?? current;
  const messages = context?.messages;
  return useCallback((text: string, vars?: Record<string, string | number>) => translate(locale, text, vars, messages), [locale, messages]);
}
