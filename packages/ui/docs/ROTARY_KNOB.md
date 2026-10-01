# RotaryKnob

`RotaryKnob` — интерактивный вариант `CircularGauge`.

Визуально оба компонента используют один и тот же gauge-face, чтобы read-only и editable значения выглядели одинаково во всей A&D Voice.

```tsx
const [volume, setVolume] = useState(72);

<RotaryKnob
  value={volume}
  onValueChange={setVolume}
  onValueCommit={(value) => saveVolume(value)}
  label="Громкость"
  icon="volume"
  diameter={132}
/>;
```

Управление:

- drag мышью/указателем по кругу;
- колесо мыши;
- ArrowUp / ArrowRight — увеличить;
- ArrowDown / ArrowLeft — уменьшить;
- PageUp / PageDown — ±10;
- Home / End — 0 / 100;
- Shift — fineStep;
- double click — resetValue.

Для отображения значения без возможности редактирования используйте `CircularGauge`.
