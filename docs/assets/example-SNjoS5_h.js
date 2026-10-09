import{j as s,P as n,s as e,c as o,U as r,a as l,e as c}from"./index-BE20j0Y6.js";const t=[{label:"Сохранить как…",icon:"save"},{label:"Экспорт в WAV",icon:"download"},{label:"Экспорт в MP3",icon:"download"}];function u(){return s.jsx(n,{knobs:{variant:{options:o,value:"primary"},size:{options:e,value:"md"}},code:(a,i)=>`const items = ${JSON.stringify(t)};

`+l("SplitButton",{icon:"save",items:c("items"),variant:i.variant,size:i.size},"Сохранить"),children:a=>s.jsx(r.SplitButton,{icon:"save",items:t,variant:a.variant,size:a.size,children:"Сохранить"})})}export{u as default};
