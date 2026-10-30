import{r as s,E as z,b as I,U as n,j as t}from"./index-DROdgWVU.js";const b=n.quantumBackgroundControls,$=b[0].controls.slice(0,2),f=[{...b[0],controls:b[0].controls.slice(2)},...b.slice(1)],E=f.map(({id:a,label:i})=>({value:a,label:i})),P={mode:null,playing:!1,current:0,duration:0,track:""},F=a=>Math.floor(25e4*Math.min(a,.14))+5e4,D=a=>typeof a=="string"?`"${a}"`:String(a);function M(a,i){const o=Object.keys(n.quantumBackgroundDefaults);return`import { useRef, useState } from "react";
import {
  AudioPlayer, CollapsibleSection, FilePicker, Grid, IconButton, QuantumBackground, Select, Slider, Stack, Switch, Tabs,
  quantumBackgroundControls, quantumBackgroundDefaults, quantumBackgroundMaxParticles,
  type QuantumBackgroundControl, type QuantumBackgroundHandle, type QuantumBackgroundSettings,
  type QuantumBackgroundTransport,
} from "@neo-ui-kit/react";

/** The kit's defaults with what was changed on the panel. */
const initial: QuantumBackgroundSettings = {
${["  ...quantumBackgroundDefaults,",...Object.keys(a).map(r=>`  ${r}: ${D(a[r])},`)].join(`
`)}
};
const [main, ...detailed] = quantumBackgroundControls;
// "Тип поля" and "Чувствительность" stay in view; the rest of "Поле" opens with the other tabs.
const essentials = main.controls.slice(0, 2);
const tabs = [{ ...main, controls: main.controls.slice(2) }, ...detailed];

export default function Example() {
  const scene = useRef<QuantumBackgroundHandle>(null);
  const [settings, setSettings] = useState(initial);
  const [particleCount, setParticleCount] = useState<number | undefined>(${i??"undefined"});
  const [fullscreen, setFullscreen] = useState(false);
  const [tab, setTab] = useState(tabs[0].id);
  const [transport, setTransport] = useState<QuantumBackgroundTransport>();
  const [waveform, setWaveform] = useState<number[]>();
  const set = (key: keyof QuantumBackgroundSettings, value: string | number | boolean) =>
    setSettings((current) => ({ ...current, [key]: value }));

  // One control of the panel: a list, a switch or a slider, as the setting describes itself.
  const control = (item: QuantumBackgroundControl) => {
    const value = settings[item.key];
    if (item.options)
      return <Select key={item.key} label={item.label} options={[...item.options]} value={String(value)}
        onValueChange={(next) => next && set(item.key, next)} />;
    if (typeof value === "boolean")
      return <Switch key={item.key} label={item.label} checked={value} onValueChange={(next) => set(item.key, next)} />;
    return <Slider key={item.key} label={item.label} min={item.min} max={item.max} step={item.step} value={Number(value)}
      onValueChange={(next) => set(item.key, next)} />;
  };
  const group = tabs.find(({ id }) => id === tab) ?? tabs[0];

  return (
    <Stack gap={3} style={{ width: "100%" }}>
      <QuantumBackground
        ref={scene}
${o.map(r=>`        ${r}={settings.${r}}`).join(`
`)}
        particleCount={particleCount}
        fullscreen={fullscreen}
        onFullscreenChange={setFullscreen}
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
        {essentials.map(control)}
      </Grid>
      <CollapsibleSection title="Тонкая настройка" description="Среда, камера, эффекты и реакция на звук" icon="settings">
        {/* Seven tabs scroll sideways in a narrow column instead of widening the page. */}
        <div style={{ overflowX: "auto", contain: "inline-size" }}>
          <Tabs label="Тонкая настройка" items={tabs.map(({ id, label }) => ({ value: id, label }))} value={tab} onValueChange={setTab} />
        </div>
        <Grid columns="repeat(auto-fit, minmax(12rem, 1fr))" gap={4} align="end">
          {group.controls.filter(({ enabledBy }) => !enabledBy || settings[enabledBy] === true).map(control)}
          {group.id === main.id && <>
            <Switch label="Своё количество частиц" checked={particleCount !== undefined}
              onValueChange={(on) => setParticleCount(on ? ${i??F(a.density??n.quantumBackgroundDefaults.density)} : undefined)} />
            {particleCount !== undefined && (
              <Slider label="Количество частиц" min={0} max={quantumBackgroundMaxParticles} step={1000} value={particleCount}
                onValueChange={setParticleCount} />
            )}
            <Switch label="На весь экран" checked={fullscreen} onValueChange={setFullscreen} />
          </>}
        </Grid>
      </CollapsibleSection>
    </Stack>
  );
}`}function R(){const a=s.useContext(z),i=s.useContext(I),o=s.useRef(null),[m,r]=s.useState({}),[y,Q]=s.useState(f[0].id),[d,S]=s.useState(P),[V,h]=s.useState(),[c,v]=s.useState(),[k,p]=s.useState(!1),N=c??F(m.density??n.quantumBackgroundDefaults.density),B=M(m,c);if(s.useEffect(()=>{i?.(B)},[i,B]),a)return t.jsx(n.QuantumField,{paused:!0,quality:"low"});const j=e=>m[e]??n.quantumBackgroundDefaults[e],x=(e,l)=>r(g=>{const{[e]:u,...T}=g;return l===n.quantumBackgroundDefaults[e]?T:{...T,[e]:l}}),w=e=>{const l=j(e.key);if(e.options)return t.jsx(n.Select,{label:e.label,options:[...e.options],value:String(l),onValueChange:u=>{u&&x(e.key,u)}},e.key);if(typeof l=="boolean")return t.jsx(n.Switch,{label:e.label,checked:l,onValueChange:u=>x(e.key,u)},e.key);const g=e.step??1;return t.jsxs("div",{className:"qb-setting",children:[t.jsx(n.Slider,{label:e.label,value:Number(l),min:e.min,max:e.max,step:g,onValueChange:u=>x(e.key,u)}),t.jsx("output",{children:Number(l).toFixed(g<.001?4:g<.01?3:2)})]},e.key)},C=f.find(({id:e})=>e===y)??f[0],q=d.mode==="mic";return t.jsxs("div",{className:"qb-example",children:[t.jsx(n.QuantumBackground,{ref:o,...m,particleCount:c,fullscreen:k,onFullscreenChange:p,onTransportChange:S,onWaveformChange:h,children:k&&t.jsx(n.IconButton,{className:"qb-exit",icon:"close",label:"Выйти из полноэкранного режима",onClick:()=>p(!1)})}),t.jsxs("div",{className:"qb-panel",children:[t.jsxs("div",{className:"qb-toolbar",children:[t.jsx(n.FilePicker,{variant:"button",size:"sm",label:d.track||"Выбрать песню",accept:"audio/*",onFiles:([e])=>{e&&(h(void 0),S({...P,track:e.name}),o.current?.loadFile(e))}}),t.jsx(n.AudioPlayer,{playing:d.playing,position:d.current,duration:d.duration,points:V,disabled:d.mode!=="file",showVolume:!1,onPlayingChange:()=>o.current?.togglePlayback(),onTimeChange:e=>o.current?.seek(e)}),t.jsxs("div",{className:"qb-actions",children:[t.jsx(n.Tooltip,{content:q?"Выключить микрофон":"Включить микрофон",children:t.jsx(n.IconButton,{size:"sm",icon:"mic",label:q?"Выключить микрофон":"Микрофон",title:"",onClick:()=>{h(void 0),o.current?.toggleMicrophone()}})}),t.jsx(n.Tooltip,{content:"Сохранить снимок поля",children:t.jsx(n.IconButton,{size:"sm",icon:"photo",label:"Снимок",title:"",onClick:()=>o.current?.screenshot()})}),t.jsx(n.Tooltip,{content:"Развернуть поле на весь экран",children:t.jsx(n.IconButton,{size:"sm",icon:"fit",label:"На весь экран",title:"",onClick:()=>p(!0)})})]}),t.jsx("div",{className:"qb-grid qb-essentials",children:$.map(w)})]}),t.jsxs(n.CollapsibleSection,{title:"Тонкая настройка",description:"Среда, камера, эффекты и реакция на звук",icon:"settings",defaultOpen:!1,children:[t.jsx(n.Tabs,{label:"Тонкая настройка Quantum Background",items:E,value:y,onValueChange:Q}),t.jsxs("div",{className:"qb-grid",role:"tabpanel","aria-label":C.label,children:[C.controls.filter(({enabledBy:e})=>!e||j(e)===!0).map(w),C.id==="field"&&t.jsxs(t.Fragment,{children:[t.jsx(n.Switch,{label:"Своё количество частиц",checked:c!==void 0,onValueChange:e=>v(e?N:void 0)}),c!==void 0&&t.jsxs("div",{className:"qb-setting",children:[t.jsx(n.Slider,{label:"Количество частиц",value:c,min:0,max:n.quantumBackgroundMaxParticles,step:1e3,onValueChange:v}),t.jsx("output",{children:c.toLocaleString("ru-RU")})]}),t.jsx(n.Switch,{label:"На весь экран",checked:k,onValueChange:p})]})]})]})]})]})}export{R as default};
