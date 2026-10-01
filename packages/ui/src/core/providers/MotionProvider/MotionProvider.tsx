import React from "react";
import { define, type CommonProps } from "../../base";
import { MotionContext, useMotion } from "../context";

export interface MotionProviderProps extends CommonProps {
  enabled?: boolean;
  active?: boolean;
}

export const MotionProvider = define<MotionProviderProps>(
  "MotionProvider",
  ({ enabled, active = true, children, ...rest }) => {
    const parent = useMotion();
    const value = (enabled ?? parent) && active;

    return (
      <MotionContext.Provider value={value}>
        <div
          {...rest}
          data-ad-component="MotionProvider"
          data-ad-motion={value ? "on" : "off"}
        >
          {children}
        </div>
      </MotionContext.Provider>
    );
  }
);
