import { useState } from "react";
import { FloatingPanel, MelodyRoll, Typography, type PanelLayout } from "@ad-voice/ui";

export default function FloatingPanelExample() {
  const [layout, setLayout] = useState<PanelLayout | null>(null);
  return (
    <div style={{ display: "grid", gap: "0.5rem" }}>
      <Typography variant="caption" tone="muted">
        Тяните панель за поверхность; щёлкните, чтобы выделить и менять размер за края и углы.
      </Typography>
      <FloatingPanel resizable layout={layout} onLayoutChange={setLayout} limits={{ minWidth: 260, minHeight: 120 }}
        label="Мелодия" style={{ right: "2rem", bottom: "2rem", width: "26rem", height: "11rem" }}>
        <MelodyRoll position={1.6} livePitch={68.8} accuracy={0.8} hit />
      </FloatingPanel>
    </div>
  );
}
