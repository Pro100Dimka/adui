import { build } from "esbuild";
import { createServer } from "node:http";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH ?? "C:/Users/YOJIK/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const stage = process.argv[2] ?? "green";
const fixture = `
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, AudioPlayer, RotaryKnob, AnimatedBorder, Marquee, PianoKeyboard, Tilt, Sparkles, GlowText, Equalizer, Shimmer, Reveal, Waveform, Sparkline, MediaCard, KaraokeLyrics, MelodyRoll, WaveDecoration, Beacon, ImageShine, Spotlight, MelodixText, LevelMeter, PianoRoll, NeonWaves, setMotionFrameRate } from './packages/ui/src/index';
import './packages/ui/src/styles.css';
const query = new URLSearchParams(location.search);
if(query.has('neon-resize'))setMotionFrameRate(1);
function App() {
 const [notes,setNotes] = useState(0);
 if(query.has('neon-resize'))return <ThemeProvider><div data-case="neon-resize" style={{width:600,height:180,overflow:'auto'}}><NeonWaves comets={3}/></div></ThemeProvider>;
 if (query.has('stress')) return <ThemeProvider><div style={{display:'grid',gridTemplateColumns:'repeat(10,96px)',gap:4,padding:16}}>{Array.from({length:95},(_,i)=><AnimatedBorder key={i} style={{height:48,borderRadius:i%2?'50%':'12px'}} />)}</div></ThemeProvider>;
 return <ThemeProvider theme={query.get('theme') ?? 'ruby'} colorScheme={query.get('scheme') ?? 'dark'}>
 <main style={{padding:16,display:'grid',gap:24,color:'var(--ad-text)',background:'var(--ad-neutral-950)'}}>
  <div data-case="audio" style={{width:200,maxWidth:'100%'}}><AudioPlayer points={[.2,.8,.5]}/></div>
  <div data-case="knob" style={{width:200,maxWidth:'100%'}}><RotaryKnob size="lg" label="Gain" showValue={false}/></div>
  <div style={{width:200,maxWidth:'100%'}}><Marquee><button>Visible action</button><span>Long scrolling content which needs room</span></Marquee></div>
  <div style={{height:120,width:60}}><PianoKeyboard minMidi={60} maxMidi={62} onKeyPress={()=>setNotes(n=>n+1)}/></div><output>{notes}</output>
  <div data-case="borders" style={{display:'flex',gap:32,flexWrap:'wrap'}}>
   {[{width:200,height:80,borderRadius:'50%'},{width:200,height:80,borderRadius:'8px 20px 32px 4px'},{width:60,height:60,borderRadius:'50%'},{width:220,height:40,borderRadius:999}].map((style,i)=><AnimatedBorder key={i} data-shape={i} style={{...style,maxWidth:'100%'}}/>) }
  </div>
  <div data-case="gallery" style={{display:'grid',gap:24,maxWidth:400}}>
   <Tilt><MediaCard title="A track with a long localized title" subtitle="Artist" tilt={false}/></Tilt>
   <div data-scroll-case="Sparkles" style={{overflow:'auto',height:60}}><Sparkles style={{display:'block',width:'100%'}}><GlowText>Neon voice</GlowText></Sparkles></div><Equalizer/><Shimmer/><Reveal><p>Visible revealed content</p></Reveal>
   <div data-scroll-case="Waveform" style={{overflow:'auto',height:80}}><Waveform points={[.1,.5,.8,.2]} duration={40} position={10}/></div><Sparkline values={[1,2,3,2,1]}/><KaraokeLyrics/><MelodyRoll/><WaveDecoration/>
   <div data-scroll-case="Beacon" style={{overflow:'auto',height:60}}><Beacon style={{width:'100%'}}><span>Live voice</span></Beacon></div><ImageShine src={'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="white" d="M50 5L95 95H5Z"/></svg>')} label="Music mark" style={{width:60}}/>
   <Spotlight><p>Pointer light</p></Spotlight><MelodixText>NEON</MelodixText><LevelMeter value={0}/><PianoRoll/>
  </div>
 </main></ThemeProvider>
}
createRoot(document.getElementById('root')).render(<App/>);
`;
const built = await build({stdin:{contents:fixture,resolveDir:resolve('.'),sourcefile:'effects-fixture.tsx',loader:'tsx'},bundle:true,write:false,outfile:'runtime.js',format:'iife',jsx:'automatic',loader:{'.woff2':'dataurl','.woff':'dataurl','.ttf':'dataurl','.html':'text'},logLevel:'silent'});
const files = new Map(built.outputFiles.map(file=>[file.path.endsWith('.css')?'/runtime.css':'/runtime.js',file.text]));
const server = createServer((request,response)=>{const path = new URL(request.url,'http://localhost').pathname;response.setHeader('Content-Type',path.endsWith('.css')?'text/css':path.endsWith('.js')?'text/javascript':'text/html');response.end(files.get(path)??'<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/runtime.css"><style>body{margin:0;background:#0b090e}button{font:inherit}</style></head><body><div id="root"></div><script src="/runtime.js"></script></body></html>');});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const url = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({executablePath:process.env.CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page = await browser.newPage({reducedMotion:'reduce'});
const results=[], errors=[];
const measurements=[];
const check=(name,test,actual)=>results.push({name,passed:test(actual),actual});
page.on('pageerror',error=>errors.push(error.message));
await mkdir('evidence',{recursive:true});
try {
 for (const width of [320,375,768,1024,1440,1920]) {
  await page.setViewportSize({width,height:1000});
  await page.goto(url);
  await page.locator('.ad-border > svg').first().waitFor();
  const geometry=await page.evaluate(()=>Object.fromEntries(['audio','knob'].map(name=>{const host=document.querySelector('[data-case="'+name+'"]'), control=host.firstElementChild;const h=host.getBoundingClientRect(),c=control.getBoundingClientRect();const volume=host.querySelector('input[type="range"]'); return [name,{hostWidth:h.width,controlWidth:c.width,controlHeight:c.height,right:c.right,hostRight:h.right,volumeWidth:volume?.getBoundingClientRect().width??0,volumeRight:volume?.getBoundingClientRect().right??0,trackWidth:control.querySelector(".ad-player-track")?.getBoundingClientRect().width??0}]})));
  check(`knob fits a narrow container at viewport ${width}`,g=>g.controlWidth<=g.hostWidth+1&&Math.abs(g.controlWidth-g.controlHeight)<1,geometry.knob);
  check(`audio keeps volume available at viewport ${width}`,g=>g.volumeWidth>=40&&g.controlWidth<=g.hostWidth+1&&g.volumeRight<=g.right&&g.trackWidth>=70,geometry.audio);
  const pageGeometry=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('main *')].filter(node=>node.getBoundingClientRect().right>innerWidth+1).slice(0,30).map(node=>({component:node.dataset.adComponent,className:node.getAttribute('class'),width:node.clientWidth,right:node.getBoundingClientRect().right}))}));
  check(`component gallery never adds horizontal page scroll at viewport ${width}`,g=>g.scrollWidth<=g.width,pageGeometry);
  await page.waitForFunction(()=>{const base=document.querySelector(".knob__base"),rotor=document.querySelector(".knob__rotor");return base.width===rotor.width&&base.width>300}); if(width===320||width===1440) await page.screenshot({path:`evidence/effects-${stage}-${width}.png`,fullPage:true});
 }
 const range=page.locator('.knob__control');
 await range.focus(); await page.keyboard.press('ArrowRight');
 check('hidden-readout knob responds to real keyboard',value=>value==='68',await range.getAttribute('aria-valuenow'));
 await page.getByRole('button',{name:'C4',exact:true}).focus();await page.keyboard.press('Enter');
 check('piano key keyboard activates once',value=>value==='1',await page.locator('output').textContent());
 const copies=await page.locator('.ad-marquee-group').evaluateAll(nodes=>nodes.map(node=>({inert:node.inert, width:node.getBoundingClientRect().width, visible:getComputedStyle(node).display!=='none'})));
 check('decorative marquee copy is inert',value=>value[1].inert,copies);
 const bounds=await page.locator('.ad-marquee').evaluate(node=>{const group=node.querySelector('.ad-marquee-group'),r=node.getBoundingClientRect(),g=group.getBoundingClientRect();return {left:r.left,right:r.right,groupLeft:g.left,groupRight:g.right}});
 check('reduced-motion marquee content remains available without scrolling animation',g=>g.groupLeft>=g.left-1&&g.groupRight<=g.right+1,bounds);
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.locator('.ad-beacon').scrollIntoViewIfNeeded();
 const decorativeOverflow=await page.evaluate(()=>new Promise(resolve=>{const names=['Waveform','Sparkles','Beacon'],bounds=names.map(name=>({name,extraWidth:0,extraHeight:0}));let start;function frame(now){start??=now;names.forEach((name,i)=>document.querySelectorAll('[data-scroll-case="'+name+'"]').forEach(node=>{bounds[i].extraWidth=Math.max(bounds[i].extraWidth,node.scrollWidth-node.clientWidth);bounds[i].extraHeight=Math.max(bounds[i].extraHeight,node.scrollHeight-node.clientHeight);}));if(now-start<1000)requestAnimationFrame(frame);else resolve(bounds)}requestAnimationFrame(frame)}));
 for (const bounds of decorativeOverflow) check(`${bounds.name} decorative motion never adds scrollbars to its container`,value=>value.extraWidth===0&&value.extraHeight===0,bounds);
 await page.locator('.ad-marquee').hover();
 const hoverHold=await page.locator('.ad-marquee-track').evaluate(node=>new Promise(resolve=>{const before=getComputedStyle(node).transform;setTimeout(()=>resolve({before,after:getComputedStyle(node).transform}),220)}));
 check('marquee really pauses on hover under the shared animation clock',value=>value.before===value.after,hoverHold);
 await page.locator('[data-shape="0"]').scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>document.querySelector('[data-shape="0"] .ad-border-light')?.style.transform);
 const sample=await page.evaluate(()=>new Promise(resolve=>{const node=document.querySelector('[data-shape="0"] .ad-border-light');const frames=[];let start;function frame(now){start??=now;frames.push(node.style.transform);if(now-start<650)requestAnimationFrame(frame);else resolve({samples:frames.length,moves:new Set(frames).size})}requestAnimationFrame(frame)}));
 check('border lights travel continuously without native SVG point queries',value=>value.moves>=4,sample);
 const overflow=await page.evaluate(()=>new Promise(resolve=>{const nodes=[...document.querySelectorAll('[data-shape]')],bounds=nodes.map(node=>({width:node.clientWidth,height:node.clientHeight,extraWidth:0,extraHeight:0}));let start;function frame(now){start??=now;nodes.forEach((node,i)=>{bounds[i].extraWidth=Math.max(bounds[i].extraWidth,node.scrollWidth-node.clientWidth);bounds[i].extraHeight=Math.max(bounds[i].extraHeight,node.scrollHeight-node.clientHeight);});if(now-start<650)requestAnimationFrame(frame);else resolve(bounds)}requestAnimationFrame(frame)}));
 check('masked border lights never expand scroll overflow beyond their 16px halo',values=>values.every(value=>value.extraWidth<=16&&value.extraHeight<=16),overflow);
 check('border overlay never adds scrollable area to its host',values=>values.every(value=>value.extraWidth===0&&value.extraHeight===0),overflow);
 const before=await page.locator('[data-shape="0"] .ad-border > svg').getAttribute('viewBox');
 await page.locator('[data-shape="0"]').evaluate(node=>node.style.width='120px');
 await page.waitForFunction(()=>document.querySelector('[data-shape="0"] .ad-border > svg').getAttribute('viewBox')==='0 0 120 80');
 check('border follows live resize',value=>value!==before,await page.locator('[data-shape="0"] .ad-border > svg').getAttribute('viewBox'));
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.waitForFunction(()=>document.querySelector('[data-shape="0"]').dataset.adMotion==="off"); const paused=await page.evaluate(()=>new Promise(resolve=>{const node=document.querySelector('[data-shape="0"] .ad-border-light');const before=node.style.transform;setTimeout(()=>resolve(before===node.style.transform),180)}));
 check('border holds its orbit after reduced-motion changes',value=>value,paused);
 for (const theme of ['ruby','light','green','violet']) {
  await page.goto(`${url}?theme=${theme}`);
  await page.locator('.ad-piano-roll').scrollIntoViewIfNeeded();
  await page.locator('main').evaluate(node=>node.scrollIntoView());
  const names=await page.locator('[data-ad-component]').evaluateAll(nodes=>[...new Set(nodes.map(node=>node.dataset.adComponent))]);
  check(`all effect/media/editor families render together in ${theme}`,value=>['AnimatedBorder','Beacon','Equalizer','GlowText','ImageShine','Marquee','MelodixText','Reveal','Shimmer','Sparkles','Spotlight','Tilt','AudioPlayer','KaraokeLyrics','LevelMeter','MediaCard','MelodyRoll','PianoKeyboard','RotaryKnob','Sparkline','WaveDecoration','Waveform','PianoRoll'].every(name=>value.includes(name)),names);
  await page.screenshot({path:`evidence/effects-${stage}-${theme}.png`,fullPage:true});
 }
 await page.setViewportSize({width:1440,height:1000});
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto(`${url}?neon-resize`);
 await page.waitForFunction(()=>[...document.querySelectorAll('.ad-neon-waves-comet')].some(node=>parseFloat(node.style.transform.slice(10))>250));
 const neonResize=await page.locator('[data-case="neon-resize"]').evaluate(async node=>{node.style.width='200px';await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));return {extraWidth:node.scrollWidth-node.clientWidth,extraHeight:node.scrollHeight-node.clientHeight}});
 check('NeonWaves never leaks stale comet geometry after resize between slow motion ticks',value=>value.extraWidth===0&&value.extraHeight===0,neonResize);
 const session=await page.context().newCDPSession(page);
 await session.send('Performance.enable');
 for(const throttle of [1,6]) {
  await session.send('Emulation.setCPUThrottlingRate',{rate:throttle});
  await page.goto(`${url}?stress`);
  await page.waitForFunction(()=>document.querySelectorAll('.ad-border > svg[viewBox]').length===95);
  const before=await session.send('Performance.getMetrics');
  const sample=await page.evaluate(()=>new Promise(resolve=>{const light=document.querySelector('.ad-border-light'),frames=[],moves=new Set();let start,last;function tick(now){start??=now;if(last!==undefined)frames.push(now-last);last=now;moves.add(light.style.transform);if(now-start<1500)requestAnimationFrame(tick);else {frames.sort((a,b)=>a-b);resolve({elapsed:now-start,samples:frames.length,moves:moves.size,p95FrameMs:frames[Math.floor(frames.length*.95)],maxFrameMs:frames.at(-1),hardwareConcurrency:navigator.hardwareConcurrency});}}requestAnimationFrame(tick);}));
  const after=await session.send('Performance.getMetrics');
  const metrics=Object.fromEntries(after.metrics.filter(metric=>['TaskDuration','ScriptDuration','LayoutDuration','RecalcStyleDuration'].includes(metric.name)).map(metric=>[metric.name,+(1000*(metric.value-before.metrics.find(item=>item.name===metric.name).value)).toFixed(2)]));
  measurements.push({instances:95,cpuThrottle:throttle,emulated:throttle!==1,...sample,...metrics});
 }
 await session.detach();
 check('browser has no uncaught errors',value=>value.length===0,errors);
} finally { await browser.close();await new Promise(done=>server.close(done)); }
const report={environment:{browser:'Installed Chrome headless',physicalLowEndDevice:false,viewportHeight:1000},stage,passed:results.filter(r=>r.passed).length,failed:results.filter(r=>!r.passed).length,results,measurements};
await writeFile(`evidence/effects-browser-${stage}.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
process.exitCode=report.failed?1:0;


