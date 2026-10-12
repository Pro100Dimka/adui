import { build } from 'esbuild';
import { createServer } from 'node:http';
import { writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/YOJIK/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const stage = process.argv[2] ?? 'green';
const uiEntry=resolve(process.env.UI_ENTRY??'packages/ui/src/index.ts');
const uiStyles=resolve(process.env.UI_STYLES??dirname(uiEntry)+'/styles.css');
const uiRequire=createRequire(uiEntry);
const fixture = `
import {createRoot} from 'react-dom/client';
import {ThemeProvider,DataTable,Button} from '@neo-ui-kit/react';
import Example from './packages/ui/src/components/feedback/DataTable/example';
import '@neo-ui-kit/react/styles.css';
const q=new URLSearchParams(location.search), scenario=q.get('scenario')??'example';
const columns=[{key:'name',title:'A deliberately long descriptive column heading'},{key:'team',title:'Team'},{key:'score',title:'Score',align:'end'}];
const rows=Array.from({length:20},(_,i)=>({id:String(i),name:'Item '+i,team:'Team '+(i%2),score:i}));
createRoot(document.getElementById('root')).render(<ThemeProvider theme={q.get('theme')??'ruby'} colorScheme={q.get('theme')==='light'?'light':'dark'}><main style={{padding:16,background:'var(--ad-neutral-950)',minHeight:'100vh'}}><div id="container" style={{width:Number(q.get('width')??1470),maxWidth:'100%'}}>
{scenario==='example'?<Example/>:<DataTable columns={columns} rows={rows} caption="Records" searchable selectable rowNumbers renderRowDetails={row=>'Details '+row.name} renderRowActions={row=><Button size="sm" icon="copy" onClick={()=>document.body.dataset.action=row.id}>Copy</Button>} columnPinning={scenario==='all-pinned'?{left:['name','team'],right:['score']}:scenario==='unpinned'?{}:{left:['name'],right:['score']}} defaultGroupBy={q.has('groups')?'team':null} filterable groupable pageSize={10} maxHeight={360} onRowClick={row=>document.body.dataset.row=row.id}/>}</div></main></ThemeProvider>);
`;
const bundle=await build({stdin:{contents:fixture,resolveDir:resolve('.'),sourcefile:'data-table-fixture.tsx',loader:'tsx'},alias:{'@neo-ui-kit/react':uiEntry,'@neo-ui-kit/react/styles.css':uiStyles,react:dirname(uiRequire.resolve('react/package.json')),'react-dom':dirname(uiRequire.resolve('react-dom/package.json'))},bundle:true,write:false,outfile:'runtime.js',format:'iife',jsx:'automatic',loader:{'.woff2':'dataurl','.woff':'dataurl','.ttf':'dataurl','.html':'text'},logLevel:'silent'});
const files=new Map(bundle.outputFiles.map(file=>[file.path.endsWith('.css')?'/runtime.css':'/runtime.js',file.text]));
const server=createServer((req,res)=>{const path=new URL(req.url,'http://localhost').pathname;res.setHeader('Content-Type',path.endsWith('.css')?'text/css':path.endsWith('.js')?'text/javascript':'text/html');res.end(files.get(path)??'<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/runtime.css"><style>body{margin:0}</style></head><body><div id="root"></div><script src="/runtime.js"></script></body></html>')});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const url=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1536,height:1000},reducedMotion:'reduce'});
const results=[],errors=[];
page.on('pageerror',e=>errors.push(e.message));
const check=(name,actual,pass)=>results.push({name,actual,passed:pass(actual)});
async function geometry(){return page.locator('.ad-data-table').evaluate(root=>{const box=node=>{const r=node.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right}};const table=root.querySelector('table'),scroll=root.querySelector('.ad-data-table-scroll');return {table:box(table),scroll:box(scroll),pageOverflow:document.documentElement.scrollWidth>innerWidth,headerClipping:[...root.querySelectorAll('.ad-data-table-head')].some(n=>{const r=n.getBoundingClientRect(),p=n.closest('th').getBoundingClientRect();return r.left<p.left||r.right>p.right+1}),actions:[...root.querySelectorAll('.ad-data-table-actions .ad-button-label')].map(n=>({text:n.textContent,scroll:n.scrollWidth,client:n.clientWidth})),pins:[...root.querySelectorAll('tbody tr[data-row-key]')][0]?.querySelectorAll('[data-pinned]')?[...[...root.querySelectorAll('tbody tr[data-row-key]')][0].querySelectorAll('[data-pinned]')].map(n=>({key:n.dataset.columnKey,side:n.dataset.pinned,box:box(n)})):[]}})}
try {
 for(const theme of ['ruby','light']){
  await page.goto(`${url}?theme=${theme}`);await page.locator('tbody tr[data-row-key]').first().waitFor();
  const g=await geometry();check(`${theme} pinned example fills 1470px panel`,g,g=>Math.abs(g.table.width-(g.scroll.width-2))<2);check(`${theme} row actions retain full visible text`,g.actions,a=>a.every(x=>x.scroll<=x.client));check(`${theme} header controls fit their columns`,g,g=>!g.headerClipping);
  const polish=await page.locator('.ad-data-table').evaluate(root=>({rowHeight:root.querySelector('tr[data-row-key]').getBoundingClientRect().height,groupHeight:root.querySelector('.ad-data-table-group').getBoundingClientRect().height,numericAlignment:[...root.querySelectorAll('th[data-align="end"]')].map(th=>{const button=th.querySelector('.ad-data-table-sort'),text=[...button.childNodes].find(n=>n.nodeType===Node.TEXT_NODE),range=document.createRange();range.selectNode(text);return Math.abs(range.getBoundingClientRect().right-(th.getBoundingClientRect().right-parseFloat(getComputedStyle(th).paddingRight)))} )}));
  check(`${theme}: compact rows without clipping action height`,polish.rowHeight,v=>v<=54&&v>=40);check(`${theme}: compact group bands`,polish.groupHeight,v=>v<=44&&v>=32);check(`${theme}: numeric headings align with values`,polish.numericAlignment,v=>v.every(x=>x<2));
  await page.screenshot({path:`evidence/data-table-${stage}-${theme}-1470.png`,fullPage:true});
 }
 for(const scenario of ['pinned','all-pinned','unpinned'])for(const width of [320,375,768,1024,1470]){
  await page.goto(`${url}?scenario=${scenario}&width=${width}`);await page.locator('tbody tr[data-row-key]').first().waitFor();
  let g=await geometry();check(`${scenario} ${width}: no page overflow`,g.pageOverflow,v=>!v);check(`${scenario} ${width}: headers contained`,g.headerClipping,v=>!v);
  if(width>=1024)check(`${scenario} ${width}: fills available panel`,g,g=>Math.abs(g.table.width-(g.scroll.width-2))<2);
  if(scenario==='unpinned'&&width<=375)check(`${scenario} ${width}: container-responsive cards`,await page.locator('tbody tr[data-row-key]').first().evaluate(n=>getComputedStyle(n).display),v=>v==='grid');
  if(scenario==='unpinned'&&width<=375){check(`${scenario} ${width}: card utility cells use available space`,await page.locator('tbody tr[data-row-key]').first().locator('td:not(.ad-data-table-check)').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().width)),v=>v.every(x=>x>200));check(`${scenario} ${width}: card actions show full labels`,g.actions,v=>v.every(x=>x.scroll<=x.client));}
  if(scenario==='unpinned'&&width<=375)check(`${scenario} ${width}: sorting filtering and select-all remain visible`,await page.locator('thead').evaluate(n=>({height:n.getBoundingClientRect().height,clip:getComputedStyle(n).clipPath,controls:n.querySelectorAll('button,input').length})),v=>v.height>30&&v.clip==='none'&&v.controls>=7);
  if(scenario==='unpinned'&&width<=375)check(`${scenario} ${width}: card utility actions have visible labels`,await page.locator('tr[data-row-key]').first().locator('.ad-data-table-expand,.ad-data-table-actions').evaluateAll(nodes=>nodes.map(n=>n.dataset.label)),v=>v.every(Boolean));
  if(scenario==='unpinned'&&width<=375)check(`${scenario} ${width}: select-all has a readable visible label`,await page.locator('thead .ad-checkbox > span:last-child').evaluate(n=>n.getBoundingClientRect().width),v=>v>30);
  if(scenario!=='unpinned'&&width<=375){await page.locator('.ad-data-table-scroll').evaluate(n=>n.scrollLeft=n.scrollWidth);g=await geometry();check(`${scenario} ${width}: pinned cells do not obscure each other`,g.pins,p=>p.length<2||p.every((x,i)=>p.slice(i+1).every(y=>x.box.right<=y.box.x+1||y.box.right<=x.box.x+1)));}
  if(scenario==='all-pinned'&&width===1470){g=await geometry();check('all-pinned wide: sticky offsets match cell geometry',g.pins,p=>p.every((x,i)=>p.slice(i+1).every(y=>x.box.right<=y.box.x+1||y.box.right<=x.box.x+1)));}
  if(width===320)await page.screenshot({path:`evidence/data-table-${stage}-${scenario}-320.png`,fullPage:true});
 }
 await page.goto(`${url}?scenario=pinned&width=1024`);await page.locator('tr[data-row-key]').first().waitFor();
 await page.locator('.ad-data-table-scroll').evaluate(n=>n.scrollTop=180);
 check('sticky utility headers remain above body cells',await page.locator('thead th').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('th')===n})),v=>v.every(Boolean));
 await page.goto(`${url}?scenario=pinned&width=1024`);await page.locator('tr[data-row-key]').first().waitFor();
 const row=key=>page.locator('tr[data-row-key="'+key+'"]');
 await row('0').locator('.ad-checkbox').click();
 check('selection updates one stable row',await row('0').locator('input[type="checkbox"]').isChecked(),Boolean);
 await page.getByRole('button',{name:'Score',exact:true}).click();
 await page.getByRole('button',{name:'Score',exact:true}).click();
 check('numeric descending sort changes real row order',await page.locator('tr[data-row-key]').first().getAttribute('data-row-key'),v=>v==='19');
 await page.getByRole('button',{name:'A deliberately long descriptive column heading',exact:true}).click({modifiers:['Shift']});
 check('Shift adds secondary sorting priority',await page.locator('.ad-data-table-sort-priority').allTextContents(),v=>v.join()==='2,1');
 await page.getByRole('button',{name:'Следующая страница',exact:true}).click();
 check('pagination advances sorted rows',await page.locator('tr[data-row-key]').first().getAttribute('data-row-key'),v=>v==='9');
 check('selection survives sort and pagination',await row('0').locator('input[type="checkbox"]').isChecked(),Boolean);
 await row('0').getByRole('button',{name:'Copy',exact:true}).click();
 check('row actions do not trigger row activation',await page.evaluate(()=>({action:document.body.dataset.action,row:document.body.dataset.row})),v=>v.action==='0'&&!v.row);
 await row('0').focus();await page.keyboard.press('Enter');
 check('row activation works with keyboard',await page.evaluate(()=>document.body.dataset.row),v=>v==='0');
 await page.getByRole('textbox',{name:'Поиск по таблице'}).fill('Item 19');
 check('search resets pagination and returns matching row',await page.locator('tr[data-row-key]').evaluateAll(nodes=>nodes.map(n=>n.dataset.rowKey)),v=>v.join()==='19');
 await page.getByRole('textbox',{name:'Поиск по таблице'}).fill('');
 await page.getByRole('button',{name:'Фильтр: Score',exact:true}).click();
 await page.getByRole('spinbutton',{name:'От',exact:true}).fill('18');
 await page.keyboard.press('Escape');
 check('range filter changes real rows',await page.locator('tr[data-row-key]').evaluateAll(nodes=>nodes.map(n=>n.dataset.rowKey)),v=>v.join()==='19,18');
 await page.getByRole('button',{name:'Сбросить фильтры',exact:true}).click();
 const separator=page.getByRole('separator',{name:'Изменить ширину: A deliberately long descriptive column heading'});
 const widthBefore=Number(await separator.getAttribute('aria-valuenow'));await separator.focus();await page.keyboard.press('ArrowRight');
 check('keyboard resize uses actual painted width',Number(await separator.getAttribute('aria-valuenow')),v=>Math.abs(v-widthBefore-16)<1);
 await page.goto(`${url}?scenario=pinned&width=1024&groups`);await page.locator('.ad-data-table-group-toggle').first().waitFor();
 const group=page.locator('.ad-data-table-group-toggle').first();await group.click();
 check('group collapse removes its rows',await page.locator('tr[data-row-key]').evaluateAll(nodes=>nodes.map(n=>n.dataset.rowKey)),v=>v.every(x=>Number(x)%2===1));
 await group.click();check('group expands again',await page.locator('tr[data-row-key]').first().getAttribute('data-row-key'),v=>v==='0');
 await row('0').getByRole('button',{name:'Подробности строки 1',exact:true}).click();
 check('row detail expands meaningful content',await page.locator('.ad-data-table-details').innerText(),v=>v==='Details Item 0');
 await page.goto(`${url}?scenario=unpinned&width=320`);await page.locator('thead .ad-checkbox').click();
 check('mobile select-all selects all matching rows',await page.locator('.ad-data-table-foot').innerText(),v=>v.includes('Выбрано: 20'));
 await page.getByRole('button',{name:'Score',exact:true}).click();await page.getByRole('button',{name:'Score',exact:true}).click();
 check('mobile header sorting stays usable',await page.locator('tr[data-row-key]').first().getAttribute('data-row-key'),v=>v==='19');
 await page.getByRole('button',{name:'Фильтр: Score',exact:true}).click();await page.getByRole('spinbutton',{name:'От',exact:true}).fill('19');await page.keyboard.press('Escape');
 check('mobile filtering stays usable',await page.locator('tr[data-row-key]').count(),v=>v===1);
 const mobileSort=page.getByRole('button',{name:'Score',exact:true});await mobileSort.focus();
 check('mobile keyboard focus is visible',await mobileSort.evaluate(n=>{const s=getComputedStyle(n);return {style:s.outlineStyle,width:parseFloat(s.outlineWidth),visible:n.matches(':focus-visible')}}),v=>v.visible&&v.style!=='none'&&v.width>=1);
 await page.goto(url);await page.getByRole('button',{name:'Проверить 10 000 строк',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('.ad-data-table')?.hasAttribute('data-virtual'));
 check('10k virtual rows mount bounded initial window',await page.locator('tr[data-row-key]').count(),v=>v>0&&v<40);
 await page.locator('.ad-data-table-scroll').evaluate(n=>n.scrollTop=n.scrollHeight);
 await page.waitForFunction(()=>{const rows=[...document.querySelectorAll('tr[data-row-key]')];return rows.length&&rows.some(n=>Number(n.querySelector('.ad-data-table-row-number')?.textContent)>9900)});
 check('10k virtual scroll remains bounded',await page.locator('tr[data-row-key]').count(),v=>v>0&&v<40);
 check('virtual scroll reaches final sorted row',await page.locator('.ad-data-table-row-number').last().innerText(),v=>v==='10000');
 await page.getByRole('button',{name:'Компактные строки',exact:true}).click();
 check('density switches without losing virtualization',await page.locator('tr[data-row-key]').count(),v=>v>0&&v<50);
 await page.getByRole('button',{name:'Вернуть 8 строк',exact:true}).click();
 check('virtual unmount returns to paginated example',await page.locator('tr[data-row-key]').count(),v=>v===6);
 check('no runtime errors',errors,v=>v.length===0);
}finally{await browser.close();server.close();}
const report={stage,uiEntry,uiStyles,environment:'Windows installed Chrome headless; public exports; reduced motion',passed:results.filter(x=>x.passed).length,failed:results.filter(x=>!x.passed).length,results};await writeFile(`evidence/data-table-browser-${stage}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(report.failed)process.exitCode=1;
