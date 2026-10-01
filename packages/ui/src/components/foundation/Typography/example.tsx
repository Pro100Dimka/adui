import React from "react";
import { U } from "../../../dev/exampleHelpers";

const rows = [
  ["display", "A&D Voice"],
  ["h1", "Главный заголовок страницы"],
  ["h2", "Заголовок раздела"],
  ["h3", "Заголовок блока"],
  ["title", "Название компонента"],
  ["subtitle", "Вторичный акцентный текст"],
  ["body", "Основной текст интерфейса для описаний и содержимого."],
  ["body-sm", "Компактный вспомогательный текст."],
  ["label", "ПОДПИСЬ ПОЛЯ"],
  ["caption", "Дополнительная информация · 12:48"],
  ["eyebrow", "A&D VOICE · TYPOGRAPHY"],
  ["mono", "44.1 kHz · 24 bit · 128 frames"]
] as const;

export default function TypographyExample() {
  return (
    <div className="ad-typography-demo">
      {rows.map(([variant, text]) => (
        <div className="ad-typography-demo-row" key={variant}>
          <span className="ad-typography-demo-key">{variant}</span>
          <U.Typography variant={variant}>{text}</U.Typography>
        </div>
      ))}
      <div className="ad-typography-demo-row">
        <span className="ad-typography-demo-key">tone</span>
        <div className="sample-row">
          <U.Typography variant="body-sm" tone="muted">Muted</U.Typography>
          <U.Typography variant="body-sm" tone="accent">Accent</U.Typography>
          <U.Typography variant="body-sm" tone="success">Success</U.Typography>
          <U.Typography variant="body-sm" tone="warning">Warning</U.Typography>
          <U.Typography variant="body-sm" tone="danger">Danger</U.Typography>
        </div>
      </div>
    </div>
  );
}
