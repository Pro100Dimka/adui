# A&D UI 0.2 — primitive-first cleanup

The public API was reduced from convenience wrappers to reusable primitives.

| Removed                                       | Use instead                                                    |
| --------------------------------------------- | -------------------------------------------------------------- |
| `CopyableField`, `PathField`                  | `TextField` + `startAdornment` / `endAdornment`                |
| `CodeViewer`                                  | read-only `TextArea` + copy `IconButton`                       |
| old wrapper-style `Field`                     | new low-level `Field` input base                               |
| `PageHeader`, `SectionHeader`, `DialogHeader` | `Header` with `level`, `icon`, `actions`, `compact`            |
| `IconTile`                                    | `Icon surface="tile"`                                          |
| `Surface`, `MetricCard`, `AnimatedBorder`     | `Card material=... border`                                     |
| `LatencyIndicator`                            | `Sparkline` + `Typography`                                     |
| `CircularGauge`                               | `RotaryKnob readOnly`                                          |
| `TransportBar`, `VolumeControl`               | `AudioPlayer` and/or `Slider`                                  |
| editor internals                              | `PianoRollGrid`                                                |
| generic app cards/panels                      | compose `Card`, `Stack`, `Grid`, `Typography`, controls        |
| `ArtworkFrame`, `SceneIllustration`           | `Illustration framed`                                          |
| `ParticleLayer`                               | removed; it was decorative and had no unique reusable contract |
| `MotionProvider`                              | global motion preference + `prefers-reduced-motion`            |

`ThemePicker` moved to Fields & Input. `ThemeProvider` moved to Foundation next to Typography and exposes live theme/accent preview.

## 0.2.2

`AnimatedBorder` снова доступен как самостоятельный низкоуровневый visual primitive. `Card border` остаётся удобным shorthand. Каталог сгруппирован по семействам и стал компактнее.
