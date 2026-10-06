import{r as o,j as t,P as r,s as u,U as m,a as c,e}from"./index-CkfvrOzv.js";const a=[{value:"list",label:"Список",icon:"list"},{value:"grid",label:"Плитка",icon:"grid"},{value:"wave",label:"Волна",icon:"wave"}];function v(){const[i,l]=o.useState("list");return t.jsx(r,{knobs:{size:{options:u,value:"md"}},code:(s,n)=>`const items = ${JSON.stringify(a)};

`+c("SegmentedControl",{label:"Вид",items:e("items"),value:e("view"),onValueChange:e("setView"),size:n.size}),children:s=>t.jsx(m.SegmentedControl,{label:"Вид",items:a,value:i,onValueChange:l,size:s.size})})}export{v as default};
