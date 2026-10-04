const e=`import { mark } from "../../../core/base";\r
import { type TabPanelProps } from "../shared";\r
\r
export const TabPanel = (p: TabPanelProps) => (\r
  <div\r
    {...mark("TabPanel", p)}\r
    role="tabpanel"\r
    aria-labelledby={p.labelledBy}\r
    hidden={p.hidden}\r
    tabIndex={0}\r
  >\r
    {/* Keyed by the tab, so the content plays its entrance on every switch. */}\r
    <div className="ad-tab-panel-content" key={p.labelledBy}>\r
      {p.children}\r
    </div>\r
  </div>\r
);\r
`;export{e as default};
