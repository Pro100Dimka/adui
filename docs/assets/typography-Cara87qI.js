const n=`export const typography = {
  fontFamily: {
    sans: "var(--ad-font-family-sans)",
    mono: "var(--ad-font-family-mono)",
  },
  size: {
    display: "var(--ad-font-size-display)",
    h1: "var(--ad-font-size-h1)",
    h2: "var(--ad-font-size-h2)",
    h3: "var(--ad-font-size-h3)",
    title: "var(--ad-font-size-title)",
    subtitle: "var(--ad-font-size-subtitle)",
    body: "var(--ad-font-size-body)",
    bodySmall: "var(--ad-font-size-body-sm)",
    label: "var(--ad-font-size-label)",
    caption: "var(--ad-font-size-caption)",
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;
`;export{n as default};
