import { mark } from "../../../core/base";
import { type TabsProps } from "../shared";
import { Tabs } from "../Tabs/Tabs";

export const SegmentedControl = (p: TabsProps) => (
  <div {...mark("SegmentedControl", p)}>
    <Tabs
      {...p}
      items={
        p.items ?? [
          { value: "list", label: "Список", icon: "list" },
          { value: "grid", label: "Плитка", icon: "grid" },
        ]
      }
    />
  </div>
);
