import { BooleanControl, type BooleanProps } from "../shared";

export const Switch = (p: BooleanProps) => (
  <BooleanControl kind="Switch" {...p} />
);
