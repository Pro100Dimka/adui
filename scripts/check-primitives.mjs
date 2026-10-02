import fs from "node:fs";
import path from "node:path";
const root = path.resolve("packages/ui/src");
const banned = [
  "CopyableField",
  "PathField",
  "CodeViewer",
  "MetricCard",
  "Surface",
  "PageHeader",
  "SectionHeader",
  "DialogHeader",
  "IconTile",
  "LatencyIndicator",
  "CircularGauge",
  "TransportBar",
  "VolumeControl",
  "LyricsLane",
  "TimeRuler",
  "PianoKeyboard",
  "NoteBlock",
  "Playhead",
  "SelectionOverlay",
  "ZoomControl",
  "UndoRedoControls",
  "DiagnosticsPanel",
  "ModelStatusCard",
  "PerformanceSummary",
  "ProcessingTaskCard",
  "ProfileCard",
  "RecordingCard",
  "RoomConnectionForm",
  "StorageSummary",
  "ArtworkFrame",
  "SceneIllustration",
  "ParticleLayer",
  "MotionProvider",
];
const errors = [];
for (const name of banned) {
  const dirs = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) {
        if (e.name === name) dirs.push(p);
        walk(p);
      }
    }
  };
  walk(root);
  if (dirs.length)
    errors.push(`${name}: duplicate component directory still exists`);
}
const index = fs.readFileSync(path.join(root, "index.ts"), "utf8");
for (const name of banned)
  if (new RegExp(`export[^\n]*\b${name}\b`).test(index))
    errors.push(`${name}: still exported from public API`);
const screensRoot = path.resolve("apps/playground/src/screens");
const scanFiles = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(d, e.name);
    return e.isDirectory()
      ? scanFiles(p)
      : /\.(?:ts|tsx|js|jsx)$/.test(e.name)
        ? [p]
        : [];
  });
for (const file of scanFiles(screensRoot)) {
  const source = fs.readFileSync(file, "utf8");
  if (/from\s+["']@ad-voice\/ui\/core["']/.test(source))
    errors.push(
      `${path.relative(process.cwd(), file)}: legacy screen code must not import @ad-voice/ui/core`,
    );
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  `Primitive-first API OK: ${banned.length} duplicate components stay removed.`,
);
