import{u as m,r as a,j as t,P as c,U as o,a as d}from"./index-BE20j0Y6.js";function u(){const e=m(),[s,n]=a.useState(),i=a.useMemo(()=>({version:1,mode:"simple",theme:e.theme,primary:e.primary,secondary:e.secondary,autoSecondary:!1}),[e.theme,e.primary,e.secondary]),r=s??i;return t.jsx(c,{stretch:!0,knobs:{},code:()=>`const [config, setConfig] = useState(${JSON.stringify(r,null,2)});

<ThemeProvider {...themeProps(config)}>
  `+d("ThemeEditor",{value:{expr:"config"},onValueChange:{expr:"setConfig"}})+`
</ThemeProvider>`,children:()=>t.jsx(o.ThemeProvider,{...s?o.themeProps(r):{},style:{display:"block",width:"100%"},children:t.jsx(o.ThemeEditor,{value:r,onValueChange:n})})})}export{u as default};
