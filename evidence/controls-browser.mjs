import { build } from "esbuild";
import { createServer } from "node:http";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH ?? "C:/Users/YOJIK/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const stage = process.argv[2] ?? "green";
const fixture = `
import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ThemeProvider, Badge, Button, IconButton, TextField, TextArea, NumberField, Select, Autocomplete, DatePicker, ColorPicker, PeoplePicker, TagInput, Checkbox, Switch, Slider, ThemePicker, Dialog} from './packages/ui/src/index';
import './packages/ui/src/styles.css';
const query=new URLSearchParams(location.search), scenario=query.get('scenario'), theme=query.get('theme')??'ruby';
const options=[{value:'one',label:'First option'},{value:'two',label:'Second option'},{value:'three',label:'Third option'}];
function App(){
 const [disabled,setDisabled]=useState(false),[value,setValue]=useState(''),[submitted,setSubmitted]=useState(false),[dialog,setDialog]=useState(true);
 return <ThemeProvider theme={theme} colorScheme={query.get('scheme')??(theme==='light'?'light':'dark')}><main style={{padding:16,minHeight:'100vh',background:'var(--ad-neutral-950)'}}>
 {scenario==='badges'&&<div style={{display:'flex',gap:16,flexWrap:'wrap'}}>{[undefined,'success','error','warning','processing','pending','offline','info'].map(tone=><Badge key={tone??'default'} data-testid={'badge-'+(tone??'default')} tone={tone}>{tone??'default'}</Badge>)}</div>}
 {scenario==='fields'&&<div id="narrow" style={{width:240,maxWidth:'100%',display:'grid',gap:16}}>
 <TextField label="Long localized field label wrapping inside a narrow container" defaultValue="Sample" clearable startAdornment={<IconButton label="Field help" icon="help"/>}/>
 <TextArea label="Long text" defaultValue="A paragraph of readable content"/><NumberField label="Number" defaultValue={1.2}/>
 <Select label="Choose item" options={options} defaultValue="two"/>
 <Autocomplete label="Search item" options={options}/><DatePicker label="Date"/><ColorPicker label="Color"/>
 <PeoplePicker label="People" people={[{id:'one',name:'One Person'}]}/><TagInput label="Tags" defaultValue={['Longer tag','Second']}/>
 <Checkbox label="A checkbox with a longer descriptive label"/><Switch label="Enable sound"/><Slider label="Level"/>
 </div>}
 {scenario==='required'&&<form onSubmit={e=>{e.preventDefault();setSubmitted(true)}}><Select label="Required choice" required placeholder="Choose" options={options} value={value} onValueChange={setValue}/><Button type="submit">Submit</Button><output>{submitted?'submitted':'waiting'}</output></form>}
 {scenario==='combobox'&&<><Autocomplete label="First search" options={options} disabled={disabled}/><Autocomplete label="Second search" options={options}/><Button style={{marginTop:240}} onClick={()=>setDisabled(true)}>Disable first</Button></>}
 {scenario==='theme'&&<ThemePicker/>}
 {scenario==='public-props'&&<div style={{display:'grid',gap:16}}>{Object.entries({Select,TextField,TextArea,Autocomplete,NumberField,Slider,DatePicker,ColorPicker,TagInput,PeoplePicker}).map(([name,Component])=><Component key={name} id={'public-'+name} data-testid={'hook-'+name} label={'Visible '+name} aria-label={'Custom '+name} style={{width:170}}/>)}</div>}
 {scenario==='button-names'&&<><span id="group-name">External grouping</span><span id="color-name">External color</span>
  <Select data-testid="named-selected" aria-label="Group by" options={['Artist']}/>
  <Select data-testid="named-placeholder" aria-label="Group by" options={['Artist']} placeholder="Choose group"/>
  <Select data-testid="named-empty-value" aria-label="Group by" options={[{value:'',label:'None'}]} value=""/>
  <Select data-testid="named-rich" aria-label="Ignored" aria-labelledby="group-name" options={['one']} renderValue={()=><><strong>Custom</strong>{' '}<em>value</em></>}/>
  <Select data-testid="named-empty-label" aria-label="Group by" options={[{value:'empty',label:''}]}/>
  <ColorPicker data-testid="named-color" aria-label="Color intent"/>
  <ColorPicker data-testid="named-color-reference" aria-label="Ignored" aria-labelledby="color-name"/>
 </>}
 {scenario==='long'&&<><Autocomplete label="Long search" options={Array.from({length:50},(_,i)=>'Option '+i)}/><PeoplePicker label="Long people" people={Array.from({length:50},(_,i)=>({id:String(i),name:'Person '+i}))}/></>}
 {scenario==='dialog'&&<Dialog open={dialog} onOpenChange={setDialog} title="Fields dialog" confirmLabel={false} cancelLabel={false}><Autocomplete label="Dialog search" options={options}/></Dialog>}
 </main></ThemeProvider>
}
createRoot(document.getElementById('root')).render(<App/>);
`;
const built = await build({ stdin: { contents: fixture, resolveDir: resolve('.'), sourcefile: 'controls-fixture.tsx', loader: 'tsx' }, bundle: true, write: false, outfile: 'runtime.js', format: 'iife', jsx: 'automatic', loader: { '.woff2': 'dataurl', '.woff': 'dataurl', '.ttf': 'dataurl', '.html': 'text' }, logLevel: 'silent' });
const files = new Map(built.outputFiles.map(file => [file.path.endsWith('.css') ? '/runtime.css' : '/runtime.js', file.text]));
const html = '<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/runtime.css"><style>body{margin:0}</style></head><body><div id="root"></div><script src="/runtime.js"></script></body></html>';
const server = createServer((request, response) => {const path=new URL(request.url,'http://localhost').pathname;response.setHeader('Content-Type',path.endsWith('.css')?'text/css':path.endsWith('.js')?'text/javascript':'text/html');response.end(files.get(path)??html)});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const url=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({reducedMotion:'reduce',viewport:{width:320,height:1000}});
const results=[],errors=[];
page.on('pageerror',error=>errors.push(error.message));
const check=(name,expected,actual)=>results.push({name,passed:expected(actual),actual});
const luminance=rgb=>rgb.map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((sum,x,i)=>sum+x*[.2126,.7152,.0722][i],0);
const sampleContrast=async locator=>{
 const region=await locator.evaluate(node=>{const box=node.getBoundingClientRect();return {x:box.left+4,y:box.top+box.height/2,color:getComputedStyle(node).color}});
 const screenshot=await page.screenshot({animations:'disabled'});
 const pixels=await page.evaluate(async({region,data})=>{
  const image=new Image();image.src='data:image/png;base64,'+data;await image.decode();
  const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
  const background=[...ctx.getImageData(Math.round(region.x),Math.round(region.y),1,1).data].slice(0,3);
  ctx.clearRect(0,0,1,1);ctx.fillStyle=region.color;ctx.fillRect(0,0,1,1);return {background,foreground:[...ctx.getImageData(0,0,1,1).data].slice(0,3),cssColor:region.color};
 },{region,data:screenshot.toString('base64')});
 const values=[luminance(pixels.background),luminance(pixels.foreground)].sort((a,b)=>b-a);
 return {...pixels,ratio:(values[0]+.05)/(values[1]+.05)};
};
await mkdir('evidence',{recursive:true});
try{
 for(const theme of ['ruby','light','green','violet'])for(const scheme of ['light','dark']){
  await page.goto(url+'?scenario=badges&theme='+theme+'&scheme='+scheme);
  for(const tone of ['default','success','error','warning','processing','pending','offline','info']){
   const contrast=await sampleContrast(page.getByTestId('badge-'+tone));
   check(theme+' '+scheme+' '+tone+' badge text contrast',value=>value.ratio>=4.5,contrast);
  }
  await page.screenshot({path:'evidence/badge-'+stage+'-'+theme+'-'+scheme+'.png',animations:'disabled'});
 }
 for(const theme of ['ruby','light','green','violet']){
  for(const width of [320,375,768,1024,1440,1920]){
   await page.setViewportSize({width,height:1000});await page.goto(url+'?scenario=fields&theme='+theme);
   const geometry=await page.locator('#narrow').evaluate(node=>({viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,container:node.clientWidth,fields:[...node.querySelectorAll('.ad-input-base')].map(el=>({width:el.getBoundingClientRect().width,scroll:el.scrollWidth,client:el.clientWidth}))}));
   check(theme+' fields fit 240px container at '+width,g=>g.documentWidth<=g.viewport+1&&g.fields.every(f=>f.width<=g.container+1&&f.scroll<=f.client+1),geometry);
   await page.getByRole('button',{name:'Choose item Second option'}).click();
   const selected=page.getByRole('option',{name:'Second option'});
   const contrast=await sampleContrast(selected);check(theme+' selected option contrast at '+width,c=>c.ratio>=4.5,contrast);
   await page.getByRole('option',{name:'First option'}).hover();
   const hover=await sampleContrast(page.getByRole('option',{name:'First option'}));check(theme+' hovered option contrast at '+width,c=>c.ratio>=4.5,hover);
   if(width===320||width===1440)await page.screenshot({path:'evidence/controls-'+stage+'-'+theme+'-'+width+'.png',fullPage:true,animations:'disabled'});
  }
 }
 await page.setViewportSize({width:375,height:1000});await page.goto(url+'?scenario=fields');
 await page.getByText('Long localized field label wrapping inside a narrow container',{exact:true}).click();
 check('field label focuses input with a preceding button adornment',v=>v==='INPUT',await page.evaluate(()=>document.activeElement.tagName));
 await page.goto(url+'?scenario=required');await page.getByRole('button',{name:'Submit',exact:true}).click();
 check('required Select blocks native form submission while empty',v=>v==='waiting',await page.locator('output').textContent());
 check('invalid Select focuses the visible trigger',v=>v==='listbox',await page.evaluate(()=>document.activeElement.getAttribute('aria-haspopup')));
 await page.getByRole('button',{name:'Required choice Choose'}).click();await page.getByRole('option',{name:'First option'}).click();
 await page.getByRole('button',{name:'Submit',exact:true}).click();check('required Select allows valid form submission',v=>v==='submitted',await page.locator('output').textContent());
 await page.goto(url+'?scenario=combobox');
 const first=page.getByRole('combobox',{name:'First search'});await first.focus();await page.keyboard.press('ArrowDown');
 check('combobox keeps typing focus while announcing its active option',v=>v.focused&&v.role==='option',await first.evaluate(node=>({focused:document.activeElement===node,role:document.getElementById(node.getAttribute('aria-activedescendant'))?.getAttribute('role')})));
 await page.keyboard.press('Tab');check('Tab exits combobox options',v=>v===0,await page.getByRole('listbox').count());
 await first.focus();await page.getByRole('button',{name:'Disable first'}).click();check('disabling combobox removes open options',v=>v===0,await page.getByRole('listbox').count());
 await page.goto(url+'?scenario=dialog');const dialogSearch=page.getByRole('combobox',{name:'Dialog search'});await dialogSearch.focus();await page.keyboard.press('Escape');
 check('first Escape closes combobox and preserves its Dialog',v=>v.dialogs===1&&v.lists===0,{dialogs:await page.getByRole('dialog').count(),lists:await page.getByRole('listbox').count()});
 await page.goto(url+'?scenario=theme');
 check('theme radiogroup exposes four radios',v=>v===4,await page.getByRole('radio').count());
 const radios=page.getByRole('radio');if(await radios.count()){await radios.first().focus();await page.keyboard.press('ArrowRight');check('theme radio arrow chooses the next theme',v=>v==='true',await radios.nth(1).getAttribute('aria-checked'));}
 for(const name of ['Long search','Long people']){
  await page.goto(url+'?scenario=long');const control=page.getByRole('combobox',{name});await control.focus();
  for(let i=0;i<30;i++)await page.keyboard.press('ArrowDown');
  check(name+' keeps the keyboard active row visible in the scroll viewport',v=>v.top>=v.listTop-1&&v.bottom<=v.listBottom+1,await control.evaluate(node=>{const active=document.getElementById(node.getAttribute('aria-activedescendant'));const list=active.closest('.ad-option-list');const r=active.getBoundingClientRect(),b=list.getBoundingClientRect();return {top:r.top,bottom:r.bottom,listTop:b.top,listBottom:b.bottom};}));
 }
 await page.goto(url+'?scenario=fields&theme=light');await page.evaluate(()=>document.documentElement.style.fontSize='200%');
 check('200% text stays inside viewport and narrow fields',v=>v.width<=v.viewport+1&&v.fields.every(f=>f.scroll<=f.width+1),await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth,fields:[...document.querySelectorAll('.ad-input-base')].map(node=>({width:node.clientWidth,scroll:node.scrollWidth}))})));
 const touch=await browser.newPage({hasTouch:true,reducedMotion:'reduce',viewport:{width:375,height:1000}});
 await touch.goto(url+'?scenario=fields');const text=touch.getByRole('textbox',{name:'Long localized field label wrapping inside a narrow container'});await text.tap();
 check('touch focuses a text field',v=>v,await text.evaluate(node=>node===document.activeElement));await touch.getByRole('button',{name:'Очистить',exact:true}).first().tap();check('touch clear action empties a field',v=>v==='',await text.inputValue());await touch.close();
 await page.goto(url+'?scenario=public-props');
 for(const [name,role] of Object.entries({Select:'button',TextField:'textbox',TextArea:'textbox',Autocomplete:'combobox',NumberField:'spinbutton',Slider:'slider',DatePicker:'textbox',ColorPicker:'button',TagInput:'textbox',PeoplePicker:'combobox'})){
  const value=['Select','ColorPicker'].includes(name)?' '+(await page.locator('#public-'+name).locator(name==='ColorPicker'?'button':':scope').textContent()).trim():'';
  check(name+' browser accessible name honors aria-label and a visible button value',v=>v===1,await page.getByRole(role,{name:'Custom '+name+value,exact:true}).count());
  check(name+' retains unique public id and test hook',v=>v===1,await page.locator('#public-'+name+'[data-testid="hook-'+name+'"]').count());
 }
 check('Select width style sizes the whole field and its input surface',v=>v.frame===170&&v.surface===170,await page.locator('#public-Select').evaluate(node=>({frame:node.closest('.ad-field').getBoundingClientRect().width,surface:node.closest('.ad-input-base').getBoundingClientRect().width})));
 await page.goto(url+'?scenario=button-names');
 for(const [id,name] of Object.entries({'named-selected':'Group by Artist','named-placeholder':'Group by Choose group','named-empty-value':'Group by None','named-rich':'External grouping Custom value','named-empty-label':'Group by','named-color':'Color intent #FF244C','named-color-reference':'External color #FF244C'})){
  const control=page.getByTestId(id),target=id.startsWith('named-color')?control.getByRole('button'):control;check(id+' includes its rendered value in the accessible name',v=>v.matches===1,{matches:await target.and(page.getByRole('button',{name,exact:true})).count(),actual:await target.ariaSnapshot(),expected:name});
 }
 check('no uncaught browser errors',v=>v.length===0,errors);
}finally{await browser.close();await new Promise(done=>server.close(done));}
const report={environment:{browser:'Installed Google Chrome headless',platform:process.platform,physicalLowEndDevice:false,motion:'reduce',themes:['ruby','light','green','violet'],widths:[320,375,768,1024,1440,1920],containerWidth:240,contrastMethod:'WCAG relative luminance of computed foreground and rendered background sampled from screenshot'},stage,passed:results.filter(x=>x.passed).length,failed:results.filter(x=>!x.passed).length,results};
await writeFile('evidence/controls-browser-'+stage+'.json',JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,failed:report.failed,failures:results.filter(x=>!x.passed)},null,2));process.exitCode=report.failed?1:0;


