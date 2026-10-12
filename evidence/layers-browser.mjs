import { build } from "esbuild";
import { createServer } from "node:http";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH ?? "C:/Users/YOJIK/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const stage = process.argv[2] ?? "green";
const fixture = `
import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, Button, Select, TextField, Dialog, Popover, Menu, Tooltip, FloatingPanel, CollapsibleSection, Grid, Stack, Header, Card, Tabs, ScrollArea, Badge, EmptyState, KeyValueList, MessageBar, ProgressBar, StatusIndicator, Toast } from './packages/ui/src/index';
import './packages/ui/src/styles.css';
const query = new URLSearchParams(location.search);
const scenario = query.get('scenario');
const tones = ['success','warning','error','processing','pending','offline','info'];
const long = 'ДлиннаяЛокализованнаяПодпись'.repeat(5);
function App() {
 const [dialog, setDialog] = useState(false), [outer, setOuter] = useState(false), [inner, setInner] = useState(false);
 const [panelLayout, setPanelLayout] = useState({left:40,top:80,width:240,height:160});
 const anchor = useRef(null), child = useRef(null);
 return <ThemeProvider theme={query.get('theme') ?? 'ruby'} colorScheme={query.get('scheme') ?? 'dark'}>
  <main style={{padding:16, minHeight:'120vh'}}>
   {scenario === 'popover' && <><Button ref={anchor} onClick={()=>setOuter(true)}>Open popover</Button><Popover open={outer} anchorRef={anchor} onOpenChange={setOuter} label="Long popover"><p>{'LongUnbrokenContent'.repeat(50)}</p></Popover></>}
   {scenario === 'dialog' && <><Button onClick={()=>setDialog(true)}>Open dialog</Button><Dialog open={dialog} onOpenChange={setDialog} title="Confirm localized operation" confirmLabel="Подтвердить выбранную операцию" cancelLabel="Вернуться к редактированию"><p>Contents remain accessible in a narrow dialog.</p></Dialog></>}
   {scenario === 'layers' && <><Button onClick={()=>setDialog(true)}>Open dialog</Button><Dialog open={dialog} onOpenChange={setDialog} title="Layer host" confirmLabel={false} cancelLabel={false}><ThemeProvider theme="green"><Button ref={anchor} onClick={()=>setOuter(true)}>Open outer</Button><Popover label="Outer" open={outer} onOpenChange={setOuter} anchorRef={anchor}><Button ref={child} onClick={()=>setInner(true)}>Open inner</Button><Popover label="Inner" open={inner} onOpenChange={setInner} anchorRef={child}><Button>Inner action</Button></Popover></Popover></ThemeProvider></Dialog></>}
   {scenario === 'collapse' && <CollapsibleSection open={false} title="Controlled closed">Must stay closed</CollapsibleSection>}
   {scenario === 'menu' && <><Button ref={anchor} onClick={()=>setOuter(true)}>Open menu</Button><Menu open={outer} onOpenChange={setOuter} anchorRef={anchor} label="Long menu" items={Array.from({length:60},(_,i)=>({id:String(i),label:'Action '+i}))}/></>}
   {scenario === 'grid' && <Grid columns="40px 40px" justify="between" style={{width:240}}><span>A</span><span>B</span></Grid>}
   {scenario === 'panel' && <FloatingPanel label="Keyboard panel" layout={panelLayout} onLayoutChange={setPanelLayout} resizable><Card title="Move or resize"/></FloatingPanel>}
   {scenario === 'focus' && <><Card><Button onClick={()=>setDialog(true)}>Open focus dialog</Button><Select label="First select" options={['Alpha','Beta']}/></Card><Dialog open={dialog} onOpenChange={setDialog} title="Focus dialog"><TextField label="Dialog name"/><Select label="Dialog select" options={['One','Two']}/></Dialog></>}
   {scenario === 'toast' && <><div style={{width:240,maxWidth:'100%'}}><Card><Stack><Toast duration={0} message="Saved"/><Toast duration={0} message={long}/></Stack></Card></div>{query.has('floating') && <Toast duration={0} floating message={long}/>}</>}
   {scenario === 'feedback' && <div style={{width:240,maxWidth:'100%'}}><Stack>
     {tones.flatMap(tone=>['xs','sm','md','lg'].map(size=><section key={tone+size} data-case="Badge"><Badge tone={tone} size={size}>{long}</Badge></section>))}
     <section data-case="EmptyState"><EmptyState title={long} description={long} action={<Button>Повторить длительную операцию</Button>}/></section>
     <section data-case="KeyValueList"><KeyValueList items={[[long,'Short'],['Short',long],['Empty',null]]}/></section>
     {tones.map(tone=><section key={tone} data-case="MessageBar"><MessageBar tone={tone} action={<Button>Повторить длительную операцию</Button>}>{long}</MessageBar></section>)}
     {tones.map(status=><section key={status} data-case="StatusIndicator"><StatusIndicator status={status} label={long}/></section>)}
     {['bar','wave'].flatMap(variant=>[false,true].map(indeterminate=><section key={variant+indeterminate} data-case="ProgressBar"><ProgressBar variant={variant} indeterminate={indeterminate} value={Infinity} max={NaN} label="Upload"/></section>))}
   </Stack></div>}
   {scenario === 'layouts' && <div style={{width:240,maxWidth:'100%'}}><Card title="Narrow card"><Header title="Long localized heading inside a narrow container" actions={<><Button>First action</Button><Button>Second action</Button></>}/><Grid minChildWidth="12rem" gap={2}><Card title="A"/><Card title="B"/></Grid><Stack gap={2}><Tabs items={[{value:'a',label:'Long first label'},{value:'b',label:'Second tab'}]}/><ScrollArea height={100}>{Array.from({length:20},(_,i)=><p key={i}>Line {i}</p>)}</ScrollArea></Stack></Card></div>}
  </main>
 </ThemeProvider>
}
createRoot(document.getElementById('root')).render(<StrictMode><App/></StrictMode>);
`;
const built = await build({ stdin: { contents: fixture, resolveDir: resolve('.'), sourcefile: 'layers-fixture.tsx', loader: 'tsx' }, bundle: true, write: false, outfile: 'runtime.js', format: 'iife', jsx: 'automatic', loader: { '.woff2': 'dataurl', '.woff': 'dataurl', '.ttf': 'dataurl', '.html': 'text' }, logLevel: 'silent' });
const files = new Map(built.outputFiles.map(file => [file.path.endsWith('.css') ? '/runtime.css' : '/runtime.js', file.text]));
const html = '<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/runtime.css"><style>body{margin:0;background:#0a090d}</style></head><body><div id="root"></div><script src="/runtime.js"></script></body></html>';
const server = createServer((request, response) => {
 const path = new URL(request.url, 'http://localhost').pathname;
 response.setHeader('Content-Type', path.endsWith('.css') ? 'text/css' : path.endsWith('.js') ? 'text/javascript' : 'text/html');
 response.end(files.get(path) ?? html);
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const url = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ reducedMotion: 'reduce' });
const results = [], errors = [];
page.on('pageerror', error => errors.push(error.message));
const check = (name, expected, actual) => results.push({ name, passed: expected(actual), actual });
await mkdir('evidence', { recursive: true });
try {
 for (const width of [320,375,768,1024,1440,1920]) for (const fontSize of [16,32]) {
  await page.setViewportSize({width,height:900});
  await page.goto(`${url}?scenario=toast&floating`);
  await page.evaluate(size=>document.documentElement.style.fontSize=`${size}px`,fontSize);
  await page.evaluate(() => Promise.all(document.getAnimations().filter(animation=>Number.isFinite(animation.effect?.getComputedTiming().endTime)).map(animation=>animation.finished.catch(()=>{}))));
  const geometry = await page.locator('.ad-toast').evaluateAll(nodes=>nodes.map(node=>{
   const box=node.getBoundingClientRect(), parent=node.parentElement.getBoundingClientRect();
   const message=node.children[1], text=message.getBoundingClientRect();
   return {left:box.left,right:box.right,parentRight:node.classList.contains('ad-toast-floating')?innerWidth*.95:parent.right,parentLeft:node.classList.contains('ad-toast-floating')?innerWidth*.05:parent.left,textLeft:text.left,textRight:text.right,messageWidth:message.clientWidth,messageScrollWidth:message.scrollWidth};
  }));
  check(`Toast fits narrow containers and floating viewport at ${width}px / ${fontSize}px font`, values=>values.every(value=>value.left>=value.parentLeft-1&&value.right<=value.parentRight+1&&value.textLeft>=value.left&&value.textRight<=value.right&&value.messageScrollWidth<=value.messageWidth+1),geometry);
  if(width===320&&fontSize===16) { await page.locator('.ad-toast-floating').evaluate(node=>node.remove()); await page.locator('.ad-toast').nth(1).screenshot({path:`evidence/layers-${stage}-Toast-240.png`}); }
 }
 await page.setViewportSize({width:320,height:900});
 await page.goto(`${url}?scenario=feedback`);
 for (const name of ['Badge','EmptyState','KeyValueList','MessageBar','StatusIndicator','ProgressBar']) {
  const cases = await page.locator(`[data-case="${name}"]`).evaluateAll(nodes=>nodes.map(node=>{
    const target=node.firstElementChild, rect=node.getBoundingClientRect(), box=target.getBoundingClientRect();
    const outside=[...target.querySelectorAll('button,dt,dd,h3,p,.ad-message-bar-text,.ad-button-label')].filter(child=>{const r=child.getBoundingClientRect();return r.left<rect.left-1||r.right>rect.right+1||child.scrollWidth>child.clientWidth+1;}).map(child=>child.tagName);
    return {left:box.left,right:box.right,containerRight:rect.right,scrollWidth:target.scrollWidth,clientWidth:target.clientWidth,overflow:getComputedStyle(target).overflowX,outside};
  }));
  // A clipped decorative pseudo-element may enlarge scrollWidth; inspect actual content and
  // page scroll geometry rather than incorrectly treating that invisible sweep as text clipping.
  check(`${name} long content and variants remain within a 240px container`, values=>values.every(value=>value.right<=value.containerRight+1 && (['hidden','clip'].includes(value.overflow)||value.scrollWidth<=value.clientWidth+1) && !value.outside.length), cases);
  if (['Badge','EmptyState','KeyValueList','MessageBar'].includes(name)) await page.locator(`[data-case="${name}"]`).first().screenshot({path:`evidence/layers-${stage}-${name}-240.png`});
 }
 check('feedback content does not create page horizontal scrolling', width=>width<=320, await page.evaluate(()=>document.documentElement.scrollWidth));
 await page.screenshot({path:`evidence/layers-${stage}-feedback-320.png`,fullPage:true});
 await page.goto(`${url}?scenario=layouts`);
 check('theme transition color properties are registered by the browser', names=>['--ad-red','--ad-pink','--ad-focus','--ad-text','--ad-muted'].every(name=>names.includes(name)), await page.evaluate(()=>[...document.styleSheets].flatMap(sheet=>[...sheet.cssRules]).filter(rule=>rule.constructor.name==='CSSPropertyRule').map(rule=>rule.name)));
 for (const width of [320, 375, 768, 1024, 1440, 1920]) {
  await page.setViewportSize({width, height:900});
  for (const scenario of ['popover', 'dialog', 'layouts']) {
   await page.goto(`${url}?scenario=${scenario}`);
   if (scenario !== 'layouts') await page.getByRole('button', {name:`Open ${scenario}`, exact:true}).click();
   if (width === 320 && scenario !== 'layouts') {
    check(`${scenario} respects reduced motion`, value=>value<=0.001, await page.locator(scenario==='dialog'?'.ad-dialog':'.ad-popover').evaluate(node=>parseFloat(getComputedStyle(node).animationDuration)));
   }
   await page.evaluate(() => Promise.all(document.getAnimations().filter(animation => Number.isFinite(animation.effect?.getComputedTiming().endTime)).map(animation => animation.finished.catch(()=>{}))));
   const geometry = await page.evaluate(scenario => {
    const el = document.querySelector(scenario === 'popover' ? '.ad-popover' : scenario === 'dialog' ? '.ad-dialog' : '.ad-card');
    const r = el.getBoundingClientRect();
    const clips = [...el.querySelectorAll('button:not([role="tab"])')].map(button => { const b = button.getBoundingClientRect(); return {text:button.textContent, left:b.left, right:b.right, width:b.width, clipped:b.left<r.left-1 || b.right>r.right+1}; });
    return {left:r.left, right:r.right, width:r.width, viewport:innerWidth, documentWidth:document.documentElement.scrollWidth, scrollWidth:el.scrollWidth, clientWidth:el.clientWidth, clips};
   }, scenario);
   check(`${scenario} stays within viewport at ${width}`, g => g.left >= -1 && g.right <= g.viewport + 1 && g.documentWidth <= g.viewport + 1 && !g.clips.some(button => button.clipped), geometry);
   if (scenario === 'dialog' && width===320) check('modal close action remains beside its heading at 320', value=>value<=4, await page.locator('.ad-header').evaluate(node=>node.querySelector('button').getBoundingClientRect().top-node.getBoundingClientRect().top));
   if (width === 320 || width === 1440) await page.screenshot({path:`evidence/layers-${stage}-${scenario}-${width}.png`});
  }
 }
 await page.setViewportSize({width:320,height:900});
 await page.goto(`${url}?scenario=menu`);
 await page.getByRole('button',{name:'Open menu',exact:true}).click();
 check('long Menu scrolls locally to its last action', value=>value.lastBottom<=value.bottom+1, await page.getByRole('menu').evaluate(node=>{node.scrollTop=node.scrollHeight;return {bottom:node.getBoundingClientRect().bottom,lastBottom:node.lastElementChild.getBoundingClientRect().bottom,overflow:getComputedStyle(node).overflowY};}));
 await page.goto(`${url}?scenario=grid`);
 check('Grid between distributes columns to opposite edges', value=>Math.abs(value.gridRight-value.itemRight)<=1, await page.locator('.ad-grid').evaluate(node=>({gridRight:node.getBoundingClientRect().right,itemRight:node.lastElementChild.getBoundingClientRect().right})));
 await page.goto(`${url}?scenario=panel`);
 await page.getByRole('group',{name:'Keyboard panel'}).focus();
 await page.keyboard.press('ArrowRight');
 check('FloatingPanel keyboard moves the real focused panel', value=>value===50, await page.getByRole('group',{name:'Keyboard panel'}).evaluate(node=>node.getBoundingClientRect().left));
 await page.keyboard.press('Shift+ArrowRight');
 check('FloatingPanel keyboard resizes the real focused panel', value=>value===250, await page.getByRole('group',{name:'Keyboard panel'}).evaluate(node=>node.getBoundingClientRect().width));
 await page.goto(`${url}?scenario=focus`);
 await page.getByRole('button',{name:/^First select/}).click();
 await page.getByRole('option',{name:'Beta',exact:true}).click();
 await page.getByRole('button',{name:'Open focus dialog',exact:true}).click();
 await page.keyboard.press('Escape');
 await page.getByRole('dialog',{name:'Focus dialog',exact:true}).waitFor({state:'hidden'});
 check('StrictMode modal with fields restores focus after prior selection', value=>value===true, await page.getByRole('button',{name:'Open focus dialog',exact:true}).evaluate(node=>document.activeElement===node));
 await page.setViewportSize({width:375,height:900});
 for (const theme of ['ruby','light','green','violet']) for (const scheme of ['dark','light']) {
  await page.goto(`${url}?scenario=dialog&theme=${theme}&scheme=${scheme}`);
  await page.getByRole('button',{name:'Open dialog',exact:true}).click();
  check(`Dialog ${theme}/${scheme} remains readable and fits at 375`, value=>value.left>=0 && value.right<=375 && value.buttons===3 && value.text!=='rgba(0, 0, 0, 0)', await page.locator('.ad-dialog').evaluate(node=>({left:node.getBoundingClientRect().left,right:node.getBoundingClientRect().right,buttons:node.querySelectorAll('button').length,text:getComputedStyle(node).color})));
  await page.screenshot({path:`evidence/layers-${stage}-${theme}-${scheme}.png`});
 }
 await page.setViewportSize({width:768,height:900});
 await page.goto(`${url}?scenario=layers`);
 await page.getByRole('button',{name:'Open dialog',exact:true}).click();
 await page.getByRole('button',{name:'Open outer',exact:true}).click();
 await page.getByRole('button',{name:'Open inner',exact:true}).click();
 check('nested native top layers retain inherited theme', value => value === '#10c99a', await page.getByRole('dialog',{name:'Inner',exact:true}).evaluate(node=>getComputedStyle(node).getPropertyValue('--ad-primary').trim()));
 await page.keyboard.press('Escape');
 check('first Escape closes only inner popover', value=>value.join(',')==='Layer host,Outer', await page.getByRole('dialog').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('aria-label') ?? document.getElementById(node.getAttribute('aria-labelledby'))?.textContent)));
 check('inner Escape returns focus to its trigger', value=>value.trim()==='Open inner', await page.evaluate(()=>document.activeElement.textContent));
 await page.keyboard.press('Escape');
 check('second Escape keeps modal open', value=>value===1, await page.getByRole('dialog').count());
 await page.keyboard.press('Escape');
 check('third Escape closes modal', value=>value===0, await page.getByRole('dialog').count());
 check('modal restores root trigger focus', value=>value.trim()==='Open dialog', await page.evaluate(()=>document.activeElement.textContent));
 await page.goto(`${url}?scenario=collapse`);
 await page.locator('details').evaluate(node=>{window.__toggleHandled=false; node.addEventListener('toggle',()=>{window.__toggleHandled=true;},{once:true});});
 await page.locator('summary').click();
 await page.waitForFunction(()=>window.__toggleHandled);
 check('controlled CollapsibleSection rejects native divergence', value=>value===false, await page.locator('details').evaluate(node=>node.open));
 check('browser console has no uncaught errors', value=>value.length===0, errors);
} finally {
 await browser.close();
 await new Promise(done=>server.close(done));
}
const report = {environment: {browser:'Installed Chrome headless',platform:process.platform,physicalLowEndDevice:false, motion:'prefers-reduced-motion: reduce',viewportHeights:900}, stage, passed:results.filter(x=>x.passed).length, failed:results.filter(x=>!x.passed).length, results};
await writeFile(`evidence/layers-browser-${stage}.json`, JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
process.exitCode = report.failed ? 1 : 0;
