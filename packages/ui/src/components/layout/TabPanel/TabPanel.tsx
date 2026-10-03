import { mark } from "../../../core/base";
import { type TabPanelProps } from "../shared";

export const TabPanel = (p: TabPanelProps) => (
  <div
    {...mark("TabPanel", p)}
    role="tabpanel"
    aria-labelledby={p.labelledBy}
    hidden={p.hidden}
    tabIndex={0}
  >
    {/* Keyed by the tab, so the content plays its entrance on every switch. */}
    <div className="ad-tab-panel-content" key={p.labelledBy}>
      {p.children}
    </div>
  </div>
);
