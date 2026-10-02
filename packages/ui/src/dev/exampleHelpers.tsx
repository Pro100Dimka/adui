import React, { useRef, useState } from "react";
import * as UI from "../index";
import * as Editor from "../editor";
import type { NoteGeometry } from "../editor";
export const U = { ...UI, ...Editor };
export const row = (children: React.ReactNode) => (
  <div className="sample-row">{children}</div>
);
export function useExampleState() {
  const [value, setValue] = useState(35),
    [checked, setChecked] = useState(true),
    [open, setOpen] = useState(false);
  const [text, setText] = useState("Дмитрий"),
    [choice, setChoice] = useState("one"),
    [notice, setNotice] = useState("");
  const [note, setNote] = useState<NoteGeometry>({ x: 25, y: 54, width: 95 });
  const [history, setHistory] = useState([0]),
    [cursor, setCursor] = useState(0);
  const anchor = useRef<HTMLButtonElement>(null);
  const alert = (message = "Действие выполнено в примере") =>
    setNotice(message);
  const items = [
    {
      label: "Переименовать",
      icon: "pencil",
      endIcon: "chevron",
      onSelect: () => alert("Переименование выбрано"),
    },
    {
      label: "Копировать",
      icon: "copy",
      onSelect: () => {
        void U.copyText("A&D UI");
        alert("Скопировано");
      },
    },
    { separator: true },
    {
      label: "Удалить",
      icon: "trash",
      danger: true,
      onSelect: () => alert("Удаление выбрано. Файлы не затрагиваются."),
    },
  ];
  return {
    value,
    setValue,
    checked,
    setChecked,
    open,
    setOpen,
    text,
    setText,
    choice,
    setChoice,
    notice,
    setNotice,
    note,
    setNote,
    history,
    setHistory,
    cursor,
    setCursor,
    anchor,
    alert,
    items,
  };
}

export const exampleSizes = ["xs", "sm", "md", "lg"] as const;
export type ExampleSize = (typeof exampleSizes)[number];

export function useExampleSize(initial: ExampleSize = "md") {
  return useState<ExampleSize>(initial);
}

export function ExampleShowcase({
  size,
  onSizeChange,
  children,
  states,
}: {
  size?: ExampleSize;
  onSizeChange?: (size: ExampleSize) => void;
  children: React.ReactNode;
  states?: React.ReactNode;
}) {
  return (
    <div className="example-showcase">
      {size && onSizeChange && (
        <div className="example-size-row">
          <strong>Size</strong>
          <div
            className="example-size-options"
            role="group"
            aria-label="Размер примера"
          >
            {exampleSizes.map((option) => (
              <button
                key={option}
                type="button"
                className="example-size-button"
                data-active={option === size || undefined}
                aria-pressed={option === size}
                onClick={() => onSizeChange(option)}
              >
                {option.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="example-showcase-rule" />
      {children}
      {states && (
        <>
          <div className="example-showcase-rule" />
          <div className="example-state-strip">{states}</div>
        </>
      )}
    </div>
  );
}

export function ExampleVariantGrid({
  children,
  columns = 2,
  layout = "grid",
}: {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  layout?: "grid" | "rows";
}) {
  return (
    <div
      className="example-variant-grid"
      data-columns={columns}
      data-layout={layout}
    >
      {children}
    </div>
  );
}

export function ExampleVariant({
  title,
  description,
  children,
  wide = false,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="example-variant" data-wide={wide || undefined}>
      <div className="example-variant-control">{children}</div>
      {title && <strong className="example-variant-title">{title}</strong>}
      {description && (
        <span className="example-variant-description">{description}</span>
      )}
    </div>
  );
}

export function ExampleStateStrip({
  label = "States",
  children,
}: {
  label?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="example-state-row">
      <span>{label}</span>
      <div>{children}</div>
    </div>
  );
}
