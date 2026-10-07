import{r as s,U as e,j as o,P as n,a as i}from"./index-0UK2-KzX.js";function h(){const[t,r]=s.useState(e.defaultThemeConfig);return o.jsx(n,{stretch:!0,knobs:{},code:()=>`const [config, setConfig] = useState(defaultThemeConfig);

<ThemeProvider {...themeProps(config)}>
  `+i("ThemeEditor",{value:{expr:"config"},onValueChange:{expr:"setConfig"}})+`
</ThemeProvider>`,children:()=>o.jsx(e.ThemeProvider,{...e.themeProps(t),style:{display:"block",width:"100%"},children:o.jsx(e.ThemeEditor,{value:t,onValueChange:r})})})}export{h as default};
