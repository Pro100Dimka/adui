# RotaryKnob

`RotaryKnob` is the direct React port of the supplied `premium-knob-interactive-neon(2).html`. The procedural metal rendering, knurling, ruby light channel, fixed outer scale, rotating rotor and interaction model are preserved.

## Interaction

- Drag near the edge: circular rotation.
- Drag near the center: linear up/down + left/right adjustment.
- Click/drag the outer scale: direct value selection.
- Mouse wheel and arrow keys change the value.
- Shift uses fine adjustment.
- PageUp/PageDown change by 10.
- Home/End set 0/100.
- Escape cancels the active drag.
- Double-click resets to the initial/reset value.
- `onValueChange` fires while adjusting.
- `onValueCommit` fires after committing the gesture.

## CircularGauge

`CircularGauge` is intentionally a read-only wrapper around the same exact RotaryKnob visual. It is not a separate gauge design anymore.

```tsx
const [volume, setVolume] = useState(67);

<RotaryKnob
  diameter={300}
  value={volume}
  onValueChange={setVolume}
  onValueCommit={saveVolume}
  label="Громкость"
/>

<CircularGauge value={72} diameter={180} label="Микрофон" />
```
