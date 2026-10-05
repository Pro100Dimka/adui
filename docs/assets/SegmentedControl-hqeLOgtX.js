const n=`import { tr } from "../../../core/i18n";
import { mark } from "../../../core/base";
import { type TabItem, type TabsProps } from "../shared";
import { Tabs } from "../Tabs/Tabs";

export const SegmentedControl = <V extends string = string>(
  p: TabsProps<V>,
) => (
  <div {...mark("SegmentedControl", p)}>
    <Tabs<V>
      {...p}
      items={
        p.items ??
        ([
          { value: "list", label: tr("Список"), icon: "list" },
          { value: "grid", label: tr("Плитка"), icon: "grid" },
        ] as TabItem<V>[])
      }
    />
  </div>
);
`;export{n as default};
