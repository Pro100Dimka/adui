import { build } from "esbuild";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";

const output = process.argv[2];
if (!output) throw new Error("Pass the output JSON path");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH ?? "C:/Users/YOJIK/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const baselineFiles = [];
const melodySources = Object.fromEntries(['MelodyRoll.tsx','styles.css','melody-glow.js'].map(name => [name, createHash('sha256').update(readFileSync(resolve(process.env.FRAME_MELODY_REFERENCE ?? 'packages/ui/src/components/media/MelodyRoll', name))).digest('hex')]));
const built = await build({ stdin: { contents: `
  import {createRoot} from 'react-dom/client';
  import {useEffect, useLayoutEffect, useState} from 'react';
  import {ThemeProvider, AnimatedBorder, TextField, NeonWaves, LevelMeter, QuantumField, MelodyRoll, setMotionFrameRate, subscribeTick} from './packages/ui/src/index';
  import './packages/ui/src/styles.css';
  ${process.env.FRAME_KARAOKE_ROOT ? `import {RollFxRenderer} from '${process.env.FRAME_KARAOKE_ROOT.replaceAll('\\','/')}/src/features/karaoke/show/rollFxRenderer';
  import {ShowEngine} from '${process.env.FRAME_KARAOKE_ROOT.replaceAll('\\','/')}/src/features/karaoke/show/showEngine';` : ''}

  const query = new URLSearchParams(location.search);
  if(query.has('fps')) setMotionFrameRate(Number(query.get('fps')));
  window.ticks = [];
  window.stopTick = subscribeTick(time => window.ticks.push(time));
  const mode = query.get('mode');
  const melodyNotes = mode === 'melody' ? Array.from({length:${Number(process.env.FRAME_NOTES ?? 10000)}},(_,i)=>({id:String(i),start:i*.25,end:i*.25+.2,pitch:60+i%12,lyric:'la'})) : [];
  const melodyHits = ${!!process.env.FRAME_MELODY_HITS} ? new Set(melodyNotes.map(note=>note.id)) : undefined;
  const melodyPress = midi => (window.pressedKeys ??= []).push(midi);
  ${process.env.FRAME_KARAOKE_ROOT ? `window.initKaraoke = () => {
    const root = document.querySelector('.ad-melody-roll');
    const canvas = document.createElement('canvas');
    canvas.className = 'showRollFx';
    Object.assign(canvas.style,{position:'absolute',zIndex:3,pointerEvents:'none'});
    root.append(canvas);
    const engine = new ShowEngine();
    engine.load(melodyNotes,[]);
    const view = {current:undefined};
    let noteWindow, shownNotes, lastSample;
    const renderer = new RollFxRenderer(canvas,engine,root,view,undefined,()=>new Worker('/rollFxWorker.ts'));
    window.advanceKaraoke = (position,pitch) => {
      engine.advance(performance.now(),position,undefined,true,undefined,false);
      const sample = Math.floor(position*50);
      if (lastSample === undefined || sample < lastSample || sample-lastSample>75) lastSample=sample-1;
      while (lastSample < sample) {
        lastSample++;
        const time = lastSample/50-100;
        const midi = position >= 100 && ${JSON.stringify(process.env.FRAME_MELODY_INPUT ?? 'all')} === 'vocal'
          ? (Math.floor(time*5)%13===0 ? undefined : 66+Math.sin(time*22)*3) : pitch;
        engine.advance(performance.now(),lastSample/50,midi === undefined ? undefined : 440*2**((midi-69)/12),true,.02);
      }
      window.karaokeScore = engine.noteScore;
      window.karaokeHits = engine.hitNoteIds;
      const nextWindow = Math.floor(position/8);
      if (noteWindow !== nextWindow) { noteWindow=nextWindow; shownNotes=melodyNotes.filter(n=>n.end>=nextWindow*8-3&&n.start<=(nextWindow+1)*8+9); }
      const glow = (${process.env.FRAME_KARAOKE_GLOW ?? '(.5+Math.sin((position-100)*3)*.5)'}).toFixed(3);
      engine.state.ambient.rollGlow = Number(glow);
      if (!root.hasAttribute('data-show-roll-glow')) root.style.setProperty('--show-roll-glow',glow);
      view.current = {notes:shownNotes,position,span:8,lead:.25,low:58,high:73};
    };
    window.karaokeRenderer = renderer;
    if (${!!process.env.FRAME_KARAOKE_SEED}) for(let i=0;i<=150;i++) {
      const position=97+i/50;
      const midi=position>98.5&&position<98.7?undefined:66+Math.sin((position-100)*5)*2;
      engine.advance(performance.now(),position,midi===undefined?undefined:440*2**((midi-69)/12),true,.02);
    }
    renderer.start();
    window.stopKaraoke = () => { renderer.stop(); canvas.remove(); };
  };` : ''}
  function MelodyScenario() {
    const [time,setTime] = useState(0);
    const [overrides,setOverrides] = useState({});
    window.updateMelody = setOverrides;
    useEffect(()=>subscribeTick(now=>setTime(now/1000)),[]);
    useLayoutEffect(()=>{window.rendererFrames++;});
    const input = ${JSON.stringify(process.env.FRAME_MELODY_INPUT ?? 'all')};
    const t = key => ['all','vocal',key].includes(input) ? time : 0;
    const pitch = input === 'vocal' ? (Math.floor(time*5)%13 === 0 ? undefined : 66+Math.sin(Math.floor(time*50)/50*22)*3) : 66+Math.sin(t('voice')*2)*3;
    useLayoutEffect(()=>{window.advanceKaraoke?.(100+t('position'),pitch);});
    const {silent,...props} = {...${process.env.FRAME_MELODY_PROPS ?? '{}'},...overrides};
    if (${!!process.env.FRAME_MELODY_STYLE_TICK && !process.env.FRAME_KARAOKE_ROOT}) props.style = {...props.style,height:400,gridColumn:'1 / -1','--show-roll-glow':(.5+Math.sin(time*3)*.5).toFixed(3)};
    return <MelodyRoll notes={melodyNotes} hitIds={window.karaokeHits ?? melodyHits} onKeyPress={${!!process.env.FRAME_VERIFY_MELODY} ? melodyPress : undefined} position={100+t('position')} accuracy={.5+Math.sin(t('accuracy'))*.5} level={.5+Math.sin(t('level')*3)*.4} beat={.5+Math.cos(t('beat')*4)*.5} hit={input === 'vocal' && Math.sin(time*4)>.3} showLyrics style={{height:400,gridColumn:'1 / -1'}} {...props} livePitch={silent?undefined:props.livePitch??pitch}/>;
  }
  const view = createRoot(document.getElementById('root'));
  window.unmountDemo = () => view.unmount();
  view.render(<ThemeProvider><main style={{padding:20,display:'grid',gridTemplateColumns:mode==='borders'?'repeat(10,96px)':'repeat(3,1fr)',gap:12}}>
    {mode==='melody'?<MelodyScenario/>:Array.from({length:mode==='quantum'?1:mode==='borders'?90:mode==='inputs'?30:6},(_,i)=>mode==='quantum'
      ? <QuantumField key={i} style={{height:500,gridColumn:'1 / -1'}}/>
      : mode==='borders'
      ? <AnimatedBorder key={i} style={{height:48,borderRadius:24}}/>
      : mode==='inputs'?<TextField key={i} label={'Field '+i} labelPlacement="floating" defaultValue="Value"/>
      : <div key={i}>{mode !== 'meter' && <NeonWaves style={{height:120}}/>}{mode !== 'waves' && <LevelMeter value={0.5}/>}</div>)}
  </main></ThemeProvider>);
`, loader: "tsx", resolveDir: resolve(".") }, bundle: true, write: false, outfile: "budget.js", format: "iife", jsx: "automatic", define: { "process.env.NODE_ENV": '"production"', ...(process.env.FRAME_KARAOKE_ROOT ? {"import.meta.url":"location.href","import.meta.env.DEV":"false"} : {}) }, loader: { ".html": "text", ".woff2": "dataurl" }, logLevel: "silent",
  plugins: [...(process.env.FRAME_KARAOKE_REFERENCE ? [{name:'karaoke-reference',setup(plugin){
    plugin.onLoad({filter:/(rollFxRenderer|performanceTracker)\.ts$/},args=>{
      const name = args.path.split(/[\\/]/).at(-1).replace('.ts','-before.ts');
      baselineFiles.push(name);
      return {contents:readFileSync(resolve(process.env.FRAME_KARAOKE_REFERENCE,name),'utf8'),loader:'ts',resolveDir:resolve(args.path,'..')};
    });
  }}] : []), ...(process.env.FRAME_MELODY_REFERENCE ? [{name:"melody-reference",setup(plugin){
    plugin.onLoad({filter:/MelodyRoll[\\/](MelodyRoll\.tsx|styles\.css|melody-glow\.js)$/},args=>{
      const name = args.path.split(/[\\/]/).at(-1);
      baselineFiles.push(name);
      return {contents:readFileSync(resolve(process.env.FRAME_MELODY_REFERENCE,name),'utf8'),loader:name.endsWith('.tsx')?'tsx':name.endsWith('.css')?'css':'js',resolveDir:resolve(args.path,'..')};
    });
  }}] : (process.env.FRAME_BASELINE || process.env.FRAME_MELODY_BASELINE) ? [{name:"baseline-motion",setup(plugin){
    plugin.onLoad({filter:process.env.FRAME_MELODY_BASELINE ? /MelodyRoll[\\/](MelodyRoll\.tsx|styles\.css)$/ : /(motion-engine|border-worker|neon-renderer)\.js$|NeonWaves[\\/](NeonWaves\.tsx|styles\.css)$|QuantumField[\\/]QuantumField\.tsx$/},args=>{baselineFiles.push(args.path); return {contents:execFileSync("git",["show",`HEAD:${args.path.slice(resolve('.').length+1).replaceAll('\\','/')}`],{encoding:"utf8"}),loader:args.path.endsWith('.tsx')?'tsx':args.path.endsWith('.css')?'css':'js',resolveDir:resolve(args.path,"..")};});
  }}] : [])],
});
if (process.env.FRAME_KARAOKE_REFERENCE && baselineFiles.filter(name=>name.endsWith('-before.ts')).length !== 2) throw new Error('Karaoke reference files were not loaded');
if (process.env.FRAME_MELODY_BASELINE && baselineFiles.length !== 2) throw new Error(`Expected two MelodyRoll baseline files, loaded ${baselineFiles.length}`);
if (process.env.FRAME_MELODY_REFERENCE && baselineFiles.filter(name=>!name.endsWith('-before.ts')).length !== 3) throw new Error(`Expected three MelodyRoll reference files, loaded ${baselineFiles.length}`);
const files = new Map(built.outputFiles.map(file => [file.path.endsWith(".css") ? "/budget.css" : "/budget.js", file.text]));
if (process.env.FRAME_KARAOKE_ROOT && !process.env.FRAME_KARAOKE_NATIVE) {
  const worker = await build({entryPoints:[resolve(process.env.FRAME_KARAOKE_ROOT,'src/features/karaoke/show/rollFxWorker.ts')],bundle:true,write:false,format:'iife',define:{'import.meta.url':'self.location.href'},logLevel:'silent'});
  files.set('/rollFxWorker.ts',worker.outputFiles[0].text + `
    let rollSampling=false, rollTimes=[], rollAges=[], rollStart=0;
    const rollReceive=self.onmessage;
    self.onmessage=event=>{
      if(event.data.__rollFrames){
        const now=performance.now();
        if(event.data.__rollFrames==='start'){rollSampling=true;rollTimes=[];rollAges=[];rollStart=now;self.postMessage({__rollFrames:'start'});}
        else {rollSampling=false;self.postMessage({__rollFrames:'stop',times:rollTimes,ages:rollAges,elapsed:now-rollStart});}
      } else {rollReceive(event);if(rollSampling&&event.data.type==='frame'){const now=performance.now();rollTimes.push(now);rollAges.push(performance.timeOrigin+now-event.data.now);}}
    };`);

}
const server = createServer((request, response) => {
  const path = new URL(request.url, "http://localhost").pathname;
  response.setHeader("Content-Type", path.endsWith(".css") ? "text/css" : (path.endsWith(".js") || path.endsWith(".ts")) ? "text/javascript" : "text/html");
  response.end(files.get(path) ?? '<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/budget.css"><style>body{margin:0;background:#090406}</style></head><body><div id="root"></div><script src="/budget.js"></script></body></html>');
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const browser = await chromium.launch({ channel: "chrome", headless: true });
const report = { commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(), width:Number(process.env.FRAME_WIDTH ?? 1440), dpr:Number(process.env.FRAME_DPR ?? 1), reducedMotion:!!process.env.FRAME_REDUCED_MOTION, failWorker:!!process.env.FRAME_FAIL_WORKER, verifyCleanup:!!process.env.FRAME_VERIFY_MELODY, baselineFiles, browser: browser.version(), baseline:!!process.env.FRAME_BASELINE, melodyBaseline:!!process.env.FRAME_MELODY_BASELINE, melodyNotes:Number(process.env.FRAME_NOTES ?? 10000), melodyInput:process.env.FRAME_MELODY_INPUT ?? 'all', melodyProps:JSON.parse(process.env.FRAME_MELODY_PROPS ?? '{}'), sequence:JSON.parse(process.env.FRAME_MELODY_SEQUENCE ?? '[]'), noWorker:!!process.env.FRAME_NO_WORKER, extraCss:process.env.FRAME_EXTRA_CSS ?? '', directShift:!!process.env.FRAME_DIRECT_SHIFT, trace:!!process.env.FRAME_TRACE, cpuOnly:!!process.env.FRAME_CPU_ONLY, results: [], errors: [] };
try {
  const page = await browser.newPage({ viewport: { width: Number(process.env.FRAME_WIDTH ?? 1440), height: 1000 }, deviceScaleFactor:Number(process.env.FRAME_DPR ?? 1), reducedMotion: process.env.FRAME_REDUCED_MOTION ? 'reduce' : 'no-preference' });
  page.setDefaultTimeout(30000);
  page.on("pageerror", error => report.errors.push(error.message));
  const cdp = await page.context().newCDPSession(page);
  let traceEvents = [];
  cdp.on('Tracing.dataCollected', ({value}) => traceEvents.push(...value));
  report.karaoke = {root:process.env.FRAME_KARAOKE_ROOT ?? null,native:!!process.env.FRAME_KARAOKE_NATIVE,reference:process.env.FRAME_KARAOKE_REFERENCE ?? null};
  if (process.env.FRAME_KARAOKE_ROOT) report.karaoke.sources = Object.fromEntries(['rollFxRenderer.ts','performanceTracker.ts',...(!process.env.FRAME_KARAOKE_NATIVE ? ['rollFxWorker.ts'] : [])].map(name => [name, createHash('sha256').update(readFileSync(process.env.FRAME_KARAOKE_REFERENCE ? resolve(process.env.FRAME_KARAOKE_REFERENCE,name.replace('.ts','-before.ts')) : resolve(process.env.FRAME_KARAOKE_ROOT,'src/features/karaoke/show',name))).digest('hex')]));
  report.pauseGlow = !!process.env.FRAME_PAUSE_GLOW;
  report.melodyReference = process.env.FRAME_MELODY_REFERENCE ?? null;
  report.melodyHits = !!process.env.FRAME_MELODY_HITS;
  report.melodyStyleTick = !!process.env.FRAME_MELODY_STYLE_TICK;
  report.melodySources = melodySources;
  await page.addInitScript(({cpuOnly,noWorker,pauseGlow,details,workerFrames,freezeHits}) => {
    if (workerFrames || freezeHits) {
      const NativeBlob = Blob;
      window.Blob = class extends NativeBlob {
        constructor(parts, options) {
          if (parts?.some(part => typeof part === 'string' && part.includes('function renderGlow('))) parts = [
            'const nativeFrame = requestAnimationFrame; let sampledFrames = [], sampling = false, sampledStart = 0, frozenTime, sampledClears = 0; const nativeClear = OffscreenCanvasRenderingContext2D.prototype.clearRect; OffscreenCanvasRenderingContext2D.prototype.clearRect = function(...args) { if (sampling) sampledClears++; return nativeClear.apply(this,args); }; requestAnimationFrame = callback => nativeFrame(time => { if (sampling) sampledFrames.push(time); callback(frozenTime ?? time); });',
            ...parts,
            ';const receive = onmessage; onmessage = event => { if (event.data.__freeze !== undefined) frozenTime = event.data.__freeze - performance.timeOrigin; else if (event.data.__frames) { const now = performance.now(); if (event.data.__frames === "start") { sampledFrames = []; sampledClears = 0; sampledStart = now; sampling = true; postMessage({__frames:"start"}); } else { sampling = false; postMessage({__frames:"stop", frames:sampledFrames, clears:sampledClears, elapsed:now-sampledStart}); } } else receive(event); };',
          ];
          super(parts, options);
        }
      };
    }
    if (details) {
      window.styleReads = 0;
      const computed = window.getComputedStyle;
      window.getComputedStyle = (...args) => { window.styleReads++; window.styleReadStack ??= new Error().stack; return computed(...args); };
    }
    window.glowConfigurations = 0;
    window.terminatedWorkers = 0;
    const terminate = Worker.prototype.terminate;
    Worker.prototype.terminate = function() { window.terminatedWorkers++; return terminate.call(this); };
    window.rollFrames = 0;
    const post = Worker.prototype.postMessage;
    Worker.prototype.postMessage = function(message, ...args) {
      if (pauseGlow && message && ['configure','visible'].includes(message.type)) message = {...message, visible:false};
      if (message?.type === 'configure' && message?.voiceStyle) {
        window.glowConfigurations++; window.melodyWorker = this;
        window.glowConfigurationChanges ??= [];
        const compare = (a,b,path='') => {
          if (a && b && typeof a==='object' && typeof b==='object') for (const key of Object.keys(b)) compare(a[key],b[key],path+'.'+key);
          else if (a !== b) window.glowConfigurationChanges.push(path);
        };
        if (details) {
          if (window.glowForeground) compare(window.glowForeground,message.foreground);
          window.glowForeground = message.foreground;
        }
      }
      if (freezeHits && ['configure','state'].includes(message?.type)) { window.melodyState = {...window.melodyState,...message.state}; window.melodyScene = message.id; }
      return post.call(this, message, ...args);
    };
    if (noWorker) window.Worker = undefined;
    window.rendererFrames = 0;
    const clear = WebGLRenderingContext.prototype.clear;
    WebGLRenderingContext.prototype.clear = function(...args) {window.rendererFrames++;return clear.apply(this,args);};
    const clearRect = CanvasRenderingContext2D.prototype.clearRect;
    CanvasRenderingContext2D.prototype.clearRect = function(...args) {window.rendererFrames++; if (this.canvas.classList?.contains('showRollFx')) window.rollFrames++; return clearRect.apply(this,args);};
    if(cpuOnly) {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(kind,...args) {return ['webgl','webgl2','experimental-webgl'].includes(kind)?null:get.call(this,kind,...args);};
    }
  },{cpuOnly:!!process.env.FRAME_CPU_ONLY,noWorker:!!process.env.FRAME_NO_WORKER,pauseGlow:report.pauseGlow,details:!!process.env.FRAME_GLOW_DETAILS,workerFrames:!!process.env.FRAME_WORKER_FRAMES,freezeHits:process.env.FRAME_FREEZE_HITS !== undefined});
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
    // Compare steady playback, not the initial CSS-to-worker handoff under CPU throttling.
    const waitedForGlow = mode === 'melody' && !report.melodyBaseline && !report.noWorker;
    if (waitedForGlow) await page.waitForFunction(() => document.querySelector('.ad-melody-roll')?.hasAttribute('data-ad-glow'));
    await page.waitForTimeout(1200);
    for (const state of report.sequence) {
      await page.evaluate(state => window.updateMelody(state), state);
      await page.waitForTimeout(150);
    }
    if (process.env.FRAME_FAIL_WORKER) {
      await page.evaluate(() => window.melodyWorker?.onerror(new Event('error')));
      await page.waitForTimeout(300);
    }
    if (process.env.FRAME_EXTRA_CSS) {
      await page.addStyleTag({content:process.env.FRAME_EXTRA_CSS});
      await page.evaluate(async () => { await document.fonts.ready; window.dispatchEvent(new Event('resize')); });
      await page.waitForTimeout(200);
    }
    if (process.env.FRAME_KARAOKE_ROOT) {
      await page.evaluate(native => { if (native) window.Worker = undefined; window.initKaraoke();
      }, !!process.env.FRAME_KARAOKE_NATIVE);
      await page.waitForTimeout(1200);
    }
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
    const sampleRoll = action => page.evaluate(action => new Promise((resolve,reject)=>{
      const worker=window.karaokeRenderer.worker;
      const listener=event=>{if(event.data.__rollFrames===action){event.stopImmediatePropagation();clearTimeout(timeout);worker.removeEventListener('message',listener,true);resolve(event.data);}};
      const timeout=setTimeout(()=>{worker.removeEventListener('message',listener,true);reject(new Error('Roll sample timed out'));},10000);
      worker.addEventListener('message',listener,true);worker.postMessage({__rollFrames:action});
    }),action);
    if (process.env.FRAME_KARAOKE_ROOT && !process.env.FRAME_KARAOKE_NATIVE) await sampleRoll('start');
    const before = Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map(m => [m.name, m.value]));
    const sampleWorker = action => page.evaluate(action => new Promise((resolve,reject) => {
      if (!window.melodyWorker || !document.querySelector('.ad-melody-roll[data-ad-glow]')) return resolve(null);
      const worker = window.melodyWorker;
      const timeout = setTimeout(() => { worker.removeEventListener('message',listener); reject(new Error('Worker frame sampling timed out')); },10000);
      const listener = ({data}) => { if (data.__frames === action) { clearTimeout(timeout); worker.removeEventListener('message',listener); resolve(data); } };
      worker.addEventListener('message',listener); worker.postMessage({__frames:action});
    }), action);
    if (process.env.FRAME_WORKER_FRAMES) await sampleWorker('start');
    const sample = await page.evaluate(duration => new Promise(resolve => {
      const frames = [];
      let start, last;
      window.ticks = [];
      window.rendererFrames = 0; window.rollFrames = 0;
      window.styleReads = 0; window.styleReadStack = undefined;
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
    if (process.env.FRAME_KARAOKE_ROOT) {
      sample.karaoke = await page.evaluate(elapsed=>({worker:!!window.karaokeRenderer.worker,voicePoint:window.karaokeRenderer.engine.voicePoint,frames:window.rollFrames,fps:window.rollFrames*1000/elapsed}),sample.elapsed);
      if (sample.karaoke.worker) {
        const worker = await sampleRoll('stop');
        const ages=worker.ages.sort((a,b)=>a-b), gaps=worker.times.slice(1).map((time,i)=>time-worker.times[i]).sort((a,b)=>a-b);
        Object.assign(sample.karaoke,{frames:worker.times.length,fps:worker.times.length*1000/worker.elapsed,latencyP95:ages[Math.ceil(ages.length*.95)-1],latencyMax:ages.at(-1),frameP95:gaps[Math.ceil(gaps.length*.95)-1],frameMax:gaps.at(-1)});
      }
    }
    const after = Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map(m => [m.name, m.value]));
    if (process.env.FRAME_WORKER_FRAMES) {
      const worker = await sampleWorker('stop');
      if (worker) {
        const gaps = worker.frames.slice(1).map((time,i)=>time-worker.frames[i]).sort((a,b)=>a-b);
        sample.worker = {frames:worker.frames.length,clears:worker.clears,elapsed:worker.elapsed,fps:worker.frames.length*1000/worker.elapsed,p95:gaps[Math.ceil(gaps.length*.95)-1],p99:gaps[Math.ceil(gaps.length*.99)-1],max:gaps.at(-1)};
      }
    }
    if (process.env.FRAME_VERIFY_IDLE_LAYERS && sample.worker?.clears > sample.worker.frames * 1.1 + 5) throw new Error('Idle melody layers were repainted');
    if (process.env.FRAME_TRACE) {
      const complete = new Promise(resolve=>cdp.once('Tracing.tracingComplete',resolve));
      await cdp.send('Tracing.end'); await complete;
      await writeFile(output+'.trace.json',JSON.stringify(traceEvents));
      const totals = new Map();
      for (const event of traceEvents.filter(e=>e.ph==='X')) totals.set(event.name,(totals.get(event.name)??0)+(event.dur??0)/1000);
      console.log(JSON.stringify([...totals].sort((a,b)=>b[1]-a[1]).slice(0,25)));
    }
    const glowReady = mode === 'melody' ? await page.locator('.ad-melody-roll').evaluate(node => ({ready:node.hasAttribute('data-ad-glow'),configurations:window.glowConfigurations,svg:node.querySelectorAll('svg').length,voices:node.querySelectorAll('.ad-melody-voice').length})) : undefined;
    if (process.env.FRAME_GLOW_DETAILS) report.glowDetails = await page.evaluate(() => ({foreground:window.glowForeground, changes:window.glowConfigurationChanges, styleReads:window.styleReads, styleReadStack:window.styleReadStack}));
    if (process.env.FRAME_VERIFY_STYLE_TICK && report.glowDetails?.styleReads > sample.rendererFrames * 2 + 10) throw new Error('Decorative style updates repeatedly measured the whole melody');
    if (process.env.FRAME_SCREENSHOT_PREFIX) {
      if (process.env.FRAME_FREEZE_HITS !== undefined) {
        const phase = Number(process.env.FRAME_FREEZE_HITS);
        await page.addStyleTag({content: `.ad-melody-note[data-hit]{animation:ad-melody-hit .62s ease-out paused;animation-delay:-${phase}ms}.ad-piano-key[data-hit]{animation:ad-piano-key-hit .9s ease-in-out infinite paused;animation-delay:-${phase}ms}.ad-melody-voice[data-hit]{animation:ad-melody-voice-hit .42s ease-out paused;animation-delay:-${phase}ms}`});
        await page.evaluate(phase => {
          window.stopTick();
          const targets = [...document.querySelectorAll('.ad-melody-note[data-hit],.ad-piano-key[data-hit],.ad-melody-voice[data-hit]')];
          for (const node of targets) node.style.animation = 'none';
          document.body.getBoundingClientRect();
          for (const node of targets) node.style.removeProperty('animation');
          const worker = window.melodyWorker, state = window.melodyState, time = performance.timeOrigin + performance.now();
          if (!worker || !state) return;
          worker.postMessage({__freeze:time+phase});
          worker.postMessage({type:'state',id:window.melodyScene,time,state:{...state,hits:'',hit:false}});
          worker.postMessage({type:'state',id:window.melodyScene,time,state});
        },phase);
        await page.waitForTimeout(100);
      }
      if (process.env.FRAME_FREEZE_HITS === undefined) await page.evaluate(() => { for (const animation of document.getAnimations()) if (animation.effect?.getTiming().iterations === Infinity) { animation.pause(); animation.currentTime = 0; } });
      await page.screenshot({path:`${process.env.FRAME_SCREENSHOT_PREFIX}-${repeat}-${throttle}-${mode}.png`});
    }
    report.results.push({throttle,emulated:throttle!==1,mode,fps,...sample,glowReady,waitedForGlow,mainThreadMs:(after.TaskDuration-before.TaskDuration)*1000,scriptMs:(after.ScriptDuration-before.ScriptDuration)*1000,layoutMs:(after.LayoutDuration-before.LayoutDuration)*1000,styleMs:(after.RecalcStyleDuration-before.RecalcStyleDuration)*1000,heapBytes:after.JSHeapUsedSize});
    if (process.env.FRAME_VERIFY_KARAOKE) {
      await page.evaluate(() => {
        window.savedAdvance=window.advanceKaraoke; window.advanceKaraoke=undefined;
        window.karaokeRenderer.setPlaying(false);
        window.savedAdvance(40.1,64); window.savedAdvance(40.2,64);
        window.karaokeRenderer.setPlaying(false);
      });
      await page.waitForFunction(()=>window.karaokeRenderer.workerAvailable);
      const paused=await page.evaluate(()=>{const r=window.karaokeRenderer;return {worker:!!r.worker,y:r.engine.voicePoint?.y,expected:r.page.top+24+(73-64+.5)*r.lane.height/16};});
      if (!paused.worker || !Number.isFinite(paused.y) || Math.abs(paused.y-paused.expected)>.01) throw new Error('Paused seek did not update worker pitch');
      await page.setViewportSize({width:800,height:1000}); await page.waitForTimeout(300);
      await page.evaluate(()=>window.karaokeRenderer.setPlaying(false));
      await page.waitForFunction(()=>window.karaokeRenderer.workerAvailable);
      const resized=await page.evaluate(()=>({lane:window.karaokeRenderer.lane.width,glow:document.querySelector('.showRollGlow')?.width}));
      if (!(resized.lane<800 && resized.glow>0)) throw new Error('Roll worker resize failed');
      await page.evaluate(()=>{const r=window.karaokeRenderer;r.worker.onerror(new Event('error'));r.setPlaying(false);});
      const fallback=await page.evaluate(()=>({native:!window.karaokeRenderer.worker&&!!window.karaokeRenderer.context,glow:document.querySelector('.ad-melody-roll').hasAttribute('data-show-roll-glow')}));
      if (!fallback.native || fallback.glow) throw new Error('Roll worker failure did not restore native drawing');
      await page.evaluate(()=>{window.stopKaraoke();window.initKaraoke();});
      await page.waitForFunction(()=>document.querySelector('.ad-melody-roll').hasAttribute('data-show-roll-glow'));
      await page.evaluate(()=>{window.stopKaraoke();window.advanceKaraoke=undefined;window.unmountDemo();});
      await page.waitForTimeout(100);
      const cleanup=await page.evaluate(()=>({canvases:document.querySelectorAll('canvas').length,terminated:window.terminatedWorkers}));
      if (cleanup.canvases || cleanup.terminated<3) throw new Error('Roll worker cleanup failed');
      report.results.at(-1).karaokeContracts={paused,resized,fallback,cleanup};
      await page.setViewportSize({width:report.width,height:1000});
    }
    if (process.env.FRAME_VERIFY_MELODY && mode === 'melody') {
      const key = page.locator('.ad-melody-roll button.ad-piano-key').first();
      await key.focus(); await key.press('Enter');
      const keyboard = await page.evaluate(() => ({presses:window.pressedKeys,focused:document.activeElement?.classList.contains('ad-piano-key')}));
      if (keyboard.presses?.length !== 1 || !keyboard.focused) throw new Error('Keyboard activation/focus changed');
      await page.evaluate(() => window.updateMelody({minPitch:70,maxPitch:85,position:110,window:4}));
      await page.waitForTimeout(300);
      const shifted = await page.locator('.ad-melody-roll').evaluate(node => ({first:node.querySelector('.ad-piano-key').dataset.midi,ready:node.hasAttribute('data-ad-foreground'),canvases:node.querySelectorAll('canvas').length,notes:node.querySelectorAll('.ad-melody-note').length}));
      if (shifted.first !== '84') throw new Error('Keyboard range did not update');
      await page.setViewportSize({width:800,height:1000});
      await page.evaluate(() => {
        const root = document.querySelector('.ad-melody-roll');
        root.style.setProperty('--ad-primary','var(--pitch-theme)');
        root.style.setProperty('--pitch-theme','#398cff');
      });
      await page.waitForTimeout(300);
      const beforeTheme = await page.evaluate(() => window.glowConfigurations);
      await page.evaluate(() => document.querySelector('.ad-melody-roll').style.setProperty('--pitch-theme','#08ddcc'));
      await page.waitForTimeout(300);
      const afterTheme = await page.evaluate(() => window.glowConfigurations);
      if (shifted.ready && afterTheme <= beforeTheme) throw new Error('CSS variable alias change did not reach the renderer');
      report.results.at(-1).interaction = {keyboard,shifted,afterResize:await page.locator('.ad-melody-roll').evaluate(node=>({ready:node.hasAttribute('data-ad-foreground'),canvasWidth:node.querySelector('.ad-melody-note-canvas')?.width,laneWidth:node.querySelector('.ad-melody-roll-lane').clientWidth}))};
      await page.evaluate(() => window.unmountDemo());
      await page.waitForTimeout(100);
      report.results.at(-1).cleanup = await page.evaluate(() => ({canvases:document.querySelectorAll('canvas').length,terminatedWorkers:window.terminatedWorkers}));
      await page.setViewportSize({width:report.width,height:1000});
    }
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
