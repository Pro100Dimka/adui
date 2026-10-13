import{r as i,E,b as z,U as n,j as t}from"./index-9Gko-yA8.js";const f=n.quantumBackgroundControls,I=f[0].controls.slice(0,2),b=[{...f[0],controls:f[0].controls.slice(2)},...f.slice(1)],$=b.map(({id:s,label:a})=>({value:s,label:a})),T={mode:null,playing:!1,current:0,duration:0,track:""},Q=["density","fieldSize","timeScale","bloom","trails","nebulaEnabled","connectionsEnabled","interactive"],M=s=>Math.floor(25e4*Math.min(s,.14))+5e4,R=(s,a)=>a===!0?s:typeof a=="string"?`${s}="${a}"`:`${s}={${a}}`;function W(s,a){const l=o=>s[o]??n.quantumBackgroundDefaults[o],u=[...Q,...Object.keys(s).filter(o=>o!=="field"&&o!=="sensitivity"&&!Q.includes(o))];return`import { useRef, useState } from "react";
import {
  AudioPlayer, FilePicker, Grid, IconButton, QuantumBackground, Select, Slider, Stack,
  quantumBackgroundFields, quantumBackgroundMaxParticles,
  type QuantumBackgroundField, type QuantumBackgroundHandle, type QuantumBackgroundTransport,
} from "@neo-ui-kit/react";

export default function Example() {
  const scene = useRef<QuantumBackgroundHandle>(null);
  const [field, setField] = useState<QuantumBackgroundField>("${l("field")}");
  const [sensitivity, setSensitivity] = useState(${l("sensitivity")});
  const [particleCount, setParticleCount] = useState(${a});
  const [fullscreen, setFullscreen] = useState(false);
  const [transport, setTransport] = useState<QuantumBackgroundTransport>();
  const [waveform, setWaveform] = useState<number[]>();

  return (
    <Stack gap={3} style={{ width: "100%" }}>
      <QuantumBackground
        ref={scene}
        field={field}
        sensitivity={sensitivity}
        particleCount={particleCount}
        fullscreen={fullscreen}
        onFullscreenChange={setFullscreen}
${u.map(o=>`        ${R(o,l(o))}`).join(`
`)}
        onTransportChange={setTransport}
        onWaveformChange={setWaveform}
      >
        {fullscreen && (
          <IconButton icon="close" label="Выйти из полноэкранного режима" style={{ position: "absolute", top: 16, right: 16 }}
            onClick={() => setFullscreen(false)} />
        )}
      </QuantumBackground>
      <Stack direction="row" align="start" justify="between" wrap gap={2}>
        <FilePicker variant="button" size="sm" label="Выбрать песню" accept="audio/*"
          onFiles={([file]) => file && scene.current?.loadFile(file)} />
        <Stack direction="row" gap={1}>
          <IconButton size="sm" icon="mic" label="Микрофон" onClick={() => scene.current?.toggleMicrophone()} />
          <IconButton size="sm" icon="photo" label="Снимок" onClick={() => scene.current?.screenshot()} />
          <IconButton size="sm" icon="fit" label="На весь экран" onClick={() => setFullscreen(true)} />
        </Stack>
      </Stack>
      <AudioPlayer playing={transport?.playing} position={transport?.current} duration={transport?.duration}
        points={waveform} disabled={transport?.mode !== "file"} showVolume={false}
        onPlayingChange={() => scene.current?.togglePlayback()} onTimeChange={(seconds) => scene.current?.seek(seconds)} />
      <Grid columns="repeat(auto-fit, minmax(12rem, 1fr))" gap={4} align="end">
        <Select label="Тип поля" options={[...quantumBackgroundFields]} value={field}
          onValueChange={(next) => next && setField(next as QuantumBackgroundField)} />
        <Slider label="Чувствительность" min={0.1} max={3} step={0.01} value={sensitivity}
          onValueChange={setSensitivity} />
        <Slider label="Частицы" min={0} max={quantumBackgroundMaxParticles} step={1000} value={particleCount}
          onValueChange={setParticleCount} />
      </Grid>
    </Stack>
  );
}`}function A(){const s=i.useContext(E),a=i.useContext(z),l=i.useRef(null),[u,o]=i.useState({}),[v,V]=i.useState(b[0].id),[d,S]=i.useState(T),[N,h]=i.useState(),[p,j]=i.useState(),[x,g]=i.useState(!1),y=p??M(u.density??n.quantumBackgroundDefaults.density),B=W(u,y);if(i.useEffect(()=>{a?.(B)},[a,B]),s)return t.jsx(n.QuantumField,{paused:!0,quality:"low"});const F=e=>u[e]??n.quantumBackgroundDefaults[e],k=(e,r)=>o(m=>{const{[e]:c,...w}=m;return r===n.quantumBackgroundDefaults[e]?w:{...w,[e]:r}}),q=e=>{const r=F(e.key);if(e.options)return t.jsx(n.Select,{label:e.label,options:[...e.options],value:String(r),onValueChange:c=>{c&&k(e.key,c)}},e.key);if(typeof r=="boolean")return t.jsx(n.Switch,{label:e.label,checked:r,onValueChange:c=>k(e.key,c)},e.key);const m=e.step??1;return t.jsxs("div",{className:"qb-setting",children:[t.jsx(n.Slider,{label:e.label,value:Number(r),min:e.min,max:e.max,step:m,onValueChange:c=>k(e.key,c)}),t.jsx("output",{children:Number(r).toFixed(m<.001?4:m<.01?3:2)})]},e.key)},C=b.find(({id:e})=>e===v)??b[0],P=d.mode==="mic";return t.jsxs("div",{className:"qb-example",children:[t.jsx(n.QuantumBackground,{ref:l,...u,particleCount:p,fullscreen:x,onFullscreenChange:g,onTransportChange:S,onWaveformChange:h,children:x&&t.jsx(n.IconButton,{className:"qb-exit",icon:"close",label:"Выйти из полноэкранного режима",onClick:()=>g(!1)})}),t.jsxs("div",{className:"qb-panel",children:[t.jsxs("div",{className:"qb-toolbar",children:[t.jsx(n.FilePicker,{variant:"button",size:"sm",label:d.track||"Выбрать песню",accept:"audio/*",onFiles:([e])=>{e&&(h(void 0),S({...T,track:e.name}),l.current?.loadFile(e))}}),t.jsx(n.AudioPlayer,{playing:d.playing,position:d.current,duration:d.duration,points:N,disabled:d.mode!=="file",showVolume:!1,onPlayingChange:()=>l.current?.togglePlayback(),onTimeChange:e=>l.current?.seek(e)}),t.jsxs("div",{className:"qb-actions",children:[t.jsx(n.Tooltip,{content:P?"Выключить микрофон":"Включить микрофон",children:t.jsx(n.IconButton,{size:"sm",icon:"mic",label:P?"Выключить микрофон":"Микрофон",title:"",onClick:()=>{h(void 0),l.current?.toggleMicrophone()}})}),t.jsx(n.Tooltip,{content:"Сохранить снимок поля",children:t.jsx(n.IconButton,{size:"sm",icon:"photo",label:"Снимок",title:"",onClick:()=>l.current?.screenshot()})}),t.jsx(n.Tooltip,{content:"Развернуть поле на весь экран",children:t.jsx(n.IconButton,{size:"sm",icon:"fit",label:"На весь экран",title:"",onClick:()=>g(!0)})})]}),t.jsx("div",{className:"qb-grid qb-essentials",children:I.map(q)})]}),t.jsxs(n.CollapsibleSection,{title:"Тонкая настройка",description:"Среда, камера, эффекты и реакция на звук",icon:"settings",defaultOpen:!1,children:[t.jsx(n.Tabs,{label:"Тонкая настройка Quantum Background",items:$,value:v,onValueChange:V}),t.jsxs("div",{className:"qb-grid",role:"tabpanel","aria-label":C.label,children:[C.controls.filter(({enabledBy:e})=>!e||F(e)===!0).map(q),C.id==="field"&&t.jsxs(t.Fragment,{children:[t.jsx(n.Switch,{label:"Своё количество частиц",checked:p!==void 0,onValueChange:e=>j(e?y:void 0)}),p!==void 0&&t.jsxs("div",{className:"qb-setting",children:[t.jsx(n.Slider,{label:"Количество частиц",value:p,min:0,max:n.quantumBackgroundMaxParticles,step:1e3,onValueChange:j}),t.jsx("output",{children:p.toLocaleString("ru-RU")})]}),t.jsx(n.Switch,{label:"На весь экран",checked:x,onValueChange:g})]})]})]})]})]})}export{A as default};
