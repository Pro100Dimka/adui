import { build } from "esbuild";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

const output = process.argv[2];
if (!output) throw new Error("Pass the output JSON path");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH ?? "C:/Users/YOJIK/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const baselineFiles = [];
const built = await build({ stdin: { contents: `
  import {createRoot} from 'react-dom/client';
  import {useEffect, useLayoutEffect, useState} from 'react';
  import {ThemeProvider, AnimatedBorder, TextField, NeonWaves, LevelMeter, QuantumField, MelodyRoll, setMotionFrameRate, subscribeTick} from './packages/ui/src/index';
  import './packages/ui/src/styles.css';
  const query = new URLSearchParams(location.search);
  if(query.has('fps')) setMotionFrameRate(Number(query.get('fps')));
  window.ticks = [];
  window.stopTick = subscribeTick(time => window.ticks.push(time));
  const mode = query.get('mode');
  const melodyNotes = mode === 'melody' ? Array.from({length:${Number(process.env.FRAME_NOTES ?? 10000)}},(_,i)=>({id:String(i),start:i*.25,end:i*.25+.2,pitch:60+i%12,lyric:'la'})) : [];
  function MelodyScenario() {
    const [time,setTime] = useState(0);
    useEffect(()=>subscribeTick(now=>setTime(now/1000)),[]);
    useLayoutEffect(()=>{window.rendererFrames++;});
    const input = ${JSON.stringify(process.env.FRAME_MELODY_INPUT ?? 'all')};
    const t = key => ['all',key].includes(input) ? time : 0;
    return <MelodyRoll notes={melodyNotes} position={100+t('position')} livePitch={66+Math.sin(t('voice')*2)*3} accuracy={.5+Math.sin(t('accuracy'))*.5} level={.5+Math.sin(t('level')*3)*.4} beat={.5+Math.cos(t('beat')*4)*.5} showLyrics style={{height:400,gridColumn:'1 / -1'}}/>;
  }
  createRoot(document.getElementById('root')).render(<ThemeProvider><main style={{padding:20,display:'grid',gridTemplateColumns:mode==='borders'?'repeat(10,96px)':'repeat(3,1fr)',gap:12}}>
    {mode==='melody'?<MelodyScenario/>:Array.from({length:mode==='quantum'?1:mode==='borders'?90:mode==='inputs'?30:6},(_,i)=>mode==='quantum'
      ? <QuantumField key={i} style={{height:500,gridColumn:'1 / -1'}}/>
      : mode==='borders'
      ? <AnimatedBorder key={i} style={{height:48,borderRadius:24}}/>
      : mode==='inputs'?<TextField key={i} label={'Field '+i} labelPlacement="floating" defaultValue="Value"/>
      : <div key={i}>{mode !== 'meter' && <NeonWaves style={{height:120}}/>}{mode !== 'waves' && <LevelMeter value={0.5}/>}</div>)}
  </main></ThemeProvider>);
`, loader: "tsx", resolveDir: resolve(".") }, bundle: true, write: false, outfile: "budget.js", format: "iife", jsx: "automatic", define: { "process.env.NODE_ENV": '"production"' }, loader: { ".html": "text", ".woff2": "dataurl" }, logLevel: "silent",
  plugins: (process.env.FRAME_BASELINE || process.env.FRAME_MELODY_BASELINE) ? [{name:"baseline-motion",setup(plugin){
    plugin.onLoad({filter:process.env.FRAME_MELODY_BASELINE ? /MelodyRoll[\\/](MelodyRoll\.tsx|styles\.css)$/ : /(motion-engine|border-worker|neon-renderer)\.js$|NeonWaves[\\/](NeonWaves\.tsx|styles\.css)$|QuantumField[\\/]QuantumField\.tsx$/},args=>{baselineFiles.push(args.path); return {contents:execFileSync("git",["show",`HEAD:${args.path.slice(resolve('.').length+1).replaceAll('\\','/')}`],{encoding:"utf8"}),loader:args.path.endsWith('.tsx')?'tsx':args.path.endsWith('.css')?'css':'js',resolveDir:resolve(args.path,"..")};});
  }}] : [],
});
if (process.env.FRAME_MELODY_BASELINE && baselineFiles.length !== 2) throw new Error(`Expected two MelodyRoll baseline files, loaded ${baselineFiles.length}`);
const files = new Map(built.outputFiles.map(file => [file.path.endsWith(".css") ? "/budget.css" : "/budget.js", file.text]));
const server = createServer((request, response) => {
  const path = new URL(request.url, "http://localhost").pathname;
  response.setHeader("Content-Type", path.endsWith(".css") ? "text/css" : path.endsWith(".js") ? "text/javascript" : "text/html");
  response.end(files.get(path) ?? '<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/budget.css"><style>body{margin:0;background:#090406}</style></head><body><div id="root"></div><script src="/budget.js"></script></body></html>');
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const browser = await chromium.launch({ channel: "chrome", headless: true });
const report = { baselineFiles, browser: browser.version(), baseline:!!process.env.FRAME_BASELINE, melodyBaseline:!!process.env.FRAME_MELODY_BASELINE, melodyNotes:Number(process.env.FRAME_NOTES ?? 10000), melodyInput:process.env.FRAME_MELODY_INPUT ?? 'all', extraCss:process.env.FRAME_EXTRA_CSS ?? '', directShift:!!process.env.FRAME_DIRECT_SHIFT, trace:!!process.env.FRAME_TRACE, cpuOnly:!!process.env.FRAME_CPU_ONLY, results: [], errors: [] };
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: "no-preference" });
  page.setDefaultTimeout(30000);
  page.on("pageerror", error => report.errors.push(error.message));
  const cdp = await page.context().newCDPSession(page);
  let traceEvents = [];
  cdp.on('Tracing.dataCollected', ({value}) => traceEvents.push(...value));
  await page.addInitScript(({cpuOnly}) => {
    window.rendererFrames = 0;
    const clear = WebGLRenderingContext.prototype.clear;
    WebGLRenderingContext.prototype.clear = function(...args) {window.rendererFrames++;return clear.apply(this,args);};
    const clearRect = CanvasRenderingContext2D.prototype.clearRect;
    CanvasRenderingContext2D.prototype.clearRect = function(...args) {window.rendererFrames++;return clearRect.apply(this,args);};
    if(cpuOnly) {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(kind,...args) {return ['webgl','webgl2','experimental-webgl'].includes(kind)?null:get.call(this,kind,...args);};
    }
  },{cpuOnly:!!process.env.FRAME_CPU_ONLY});
  if (process.env.FRAME_CSS_METER) await page.addInitScript(() => {
    const set = SVGElement.prototype.setAttribute;
    SVGElement.prototype.setAttribute = function(name, value) {
      if (name === 'transform' && this.classList.contains('ad-level-meter-wave')) this.style.transform = `translateX(${Number(value.match(/translate\(([^ ]+)/)?.[1] ?? 0)}px)`;
      else set.call(this,name,value);
    };
  });
  await cdp.send("Performance.enable");
  for (let repeat = 0; repeat < Number(process.env.FRAME_REPEATS ?? 1); repeat++) for (const throttle of (process.env.FRAME_THROTTLES ?? "1,4,6,8,16").split(",").map(Number)) for (const mode of (process.env.FRAME_MODES ?? "borders,inputs,media").split(",")) for (const fps of (process.env.FRAME_RATES ?? "default,60").split(",")) {
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: throttle });
    await page.goto(`http://127.0.0.1:${server.address().port}/?mode=${mode}${fps === "default" ? "" : "&fps=60"}`);
    await page.waitForFunction(() => [...document.querySelectorAll('.ad-border')].every(node => node.querySelector('canvas')?.style.visibility === ''));
    await page.waitForFunction(() => [...document.querySelectorAll('.ad-neon-waves')].every(node => node.querySelector('canvas')?.style.visibility === ''));
    await page.waitForTimeout(1200);
    if (process.env.FRAME_EXTRA_CSS) await page.addStyleTag({content:process.env.FRAME_EXTRA_CSS});
    if (process.env.FRAME_DIRECT_SHIFT) await page.evaluate(() => {
      const set = CSSStyleDeclaration.prototype.setProperty;
      CSSStyleDeclaration.prototype.setProperty = function(name,value,priority) {
        if (name === '--ad-roll-shift') this.transform = `translateX(${value})`;
        else set.call(this,name,value,priority);
      };
    });
    if (process.env.FRAME_NO_FILTER) await page.addStyleTag({content:'.ad-level-meter > svg { filter: none; }'});
    if (process.env.FRAME_CSS_METER) await page.addStyleTag({content:'.ad-level-meter-wave { will-change: transform; }'});
    if (process.env.FRAME_PROMOTE_STARS) await page.addStyleTag({content:'.ad-neon-waves-stars { will-change: opacity; }'});
    if (process.env.FRAME_PROFILE) { await cdp.send("Profiler.enable"); await cdp.send("Profiler.start"); }
    if (process.env.FRAME_TRACE) { traceEvents = []; await cdp.send('Tracing.start',{categories:'devtools.timeline,disabled-by-default-devtools.timeline,blink',transferMode:'ReportEvents'}); }
    const before = Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map(m => [m.name, m.value]));
    const sample = await page.evaluate(duration => new Promise(resolve => {
      const frames = [];
      let start, last;
      window.ticks = [];
      window.rendererFrames = 0;
      const tick = now => {
        start ??= now;
        if (last !== undefined) frames.push(now - last);
        last = now;
        if (now - start < duration) requestAnimationFrame(tick);
        else {
          frames.sort((a,b)=>a-b);
          const times = window.ticks;
          const intervals = times.slice(1).map((t,i)=>t-times[i]).sort((a,b)=>a-b);
          resolve({elapsed:now-start,frames:frames.length,displayFps:frames.length*1000/(now-start),rendererFrames:window.rendererFrames,rendererFps:window.rendererFrames*1000/(now-start),frameP95:frames[Math.ceil(frames.length*.95)-1],frameP99:frames[Math.ceil(frames.length*.99)-1],frameMax:frames.at(-1),motionTicks:times.length,motionFps:(times.length-1)*1000/(times.at(-1)-times[0]),motionP95:intervals[Math.ceil(intervals.length*.95)-1]});
        }
      };
      requestAnimationFrame(tick);
    }), Number(process.env.FRAME_DURATION_MS ?? 3000));
    const after = Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map(m => [m.name, m.value]));
    if (process.env.FRAME_TRACE) {
      const complete = new Promise(resolve=>cdp.once('Tracing.tracingComplete',resolve));
      await cdp.send('Tracing.end'); await complete;
      await writeFile(output+'.trace.json',JSON.stringify(traceEvents));
      const totals = new Map();
      for (const event of traceEvents.filter(e=>e.ph==='X')) totals.set(event.name,(totals.get(event.name)??0)+(event.dur??0)/1000);
      console.log(JSON.stringify([...totals].sort((a,b)=>b[1]-a[1]).slice(0,25)));
    }
    report.results.push({throttle,emulated:throttle!==1,mode,fps,...sample,mainThreadMs:(after.TaskDuration-before.TaskDuration)*1000,scriptMs:(after.ScriptDuration-before.ScriptDuration)*1000,layoutMs:(after.LayoutDuration-before.LayoutDuration)*1000,styleMs:(after.RecalcStyleDuration-before.RecalcStyleDuration)*1000,heapBytes:after.JSHeapUsedSize});
    if (process.env.FRAME_PROFILE) {
      const { profile } = await cdp.send("Profiler.stop");
      const nodes = new Map(profile.nodes.map(node => [node.id, node.callFrame.functionName || node.callFrame.url]));
      const times = new Map();
      profile.samples.forEach((id,i) => times.set(nodes.get(id), (times.get(nodes.get(id)) ?? 0) + profile.timeDeltas[i] / 1000));
      report.results.at(-1).profileSelfMs = [...times].sort((a,b)=>b[1]-a[1]).slice(0,15);
    }
    if (process.env.FRAME_CAPTURE_STARS) report.results.at(-1).stars = await page.evaluate(async () => {
      const wave = document.querySelector('.ad-neon-waves');
      const animations = wave.getAnimations({subtree:true}).filter(animation=>animation.animationName==='ad-neon-twinkle');
      const snapshots = [];
      for (const time of [0,600,1234]) {
        for (const animation of animations) {animation.pause();animation.currentTime=time;}
        await new Promise(resolve=>requestAnimationFrame(resolve));
        const points = new Map();
        for (const star of wave.querySelectorAll('.ad-neon-waves-star')) {
          const key = star.style.left + ',' + star.style.top;
          const group = star.closest('.ad-neon-waves-stars');
          const opacity = Number(getComputedStyle(star).opacity) * (group ? Number(getComputedStyle(group).opacity) : 1);
          const previous = points.get(key) ?? 0;
          points.set(key,previous+opacity*(1-previous));
        }
        snapshots.push({time,points:[...points]});
      }
      return snapshots;
    });
    const {stars,...summary} = report.results.at(-1);
    console.log(JSON.stringify(summary));
  }
} finally { await browser.close(); await new Promise(resolve=>server.close(resolve)); await writeFile(output, JSON.stringify(report,null,2)); }
if(report.errors.length) throw new Error(report.errors.join("\n"));
