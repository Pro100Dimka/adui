const r=`import { mark, type CommonProps } from "../../../core/base";\r
\r
export interface ShimmerProps extends CommonProps {\r
  /** Text lines to imitate. */\r
  lines?: number;\r
  /** Add a round placeholder, e.g. for an avatar. */\r
  circle?: boolean;\r
  label?: string;\r
}\r
\r
/** Loading placeholder: the shape of the coming content with a light running over it. */\r
export function Shimmer({\r
  lines = 3,\r
  circle = false,\r
  label = "Загрузка",\r
  ...p\r
}: ShimmerProps) {\r
  return (\r
    <div\r
      {...mark("Shimmer", p)}\r
      role="status"\r
      aria-label={label}\r
      aria-busy="true"\r
    >\r
      {circle && <i className="ad-shimmer-circle" />}\r
      <span className="ad-shimmer-lines">\r
        {Array.from({ length: lines }, (_, i) => (\r
          <i\r
            key={i}\r
            style={{ width: i === lines - 1 && lines > 1 ? "60%" : "100%" }}\r
          />\r
        ))}\r
      </span>\r
    </div>\r
  );\r
}\r
`;export{r as default};
