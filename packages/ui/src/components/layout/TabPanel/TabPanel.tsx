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
    {p.children}
  </div>
);
