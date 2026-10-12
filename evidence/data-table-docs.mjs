import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/YOJIK/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1920,height:1080},reducedMotion:'reduce'});
const axe=await readFile('release/consumer-react19/node_modules/axe-core/axe.min.js','utf8');
const results=[];
try{
 for(const width of [1920,1440,375]){
  await page.setViewportSize({width,height:1080});await page.goto('http://127.0.0.1:5173/#/components/data-table');await page.locator('.ad-data-table tbody tr[data-row-key]').first().waitFor();
  await page.addScriptTag({content:axe});
  const violations=await page.evaluate(async()=> (await axe.run(document.querySelector('.docs-live-stage'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}})).violations.map(({id,nodes})=>({id,nodes:nodes.map(({target,html})=>({target,html}))})));
  const geometry=await page.locator('.ad-data-table').evaluate(root=>{const scroll=root.querySelector('.ad-data-table-scroll'),table=root.querySelector('table');return {container:scroll.clientWidth,table:table.getBoundingClientRect().width,pageOverflow:document.documentElement.scrollWidth>innerWidth};});
  await page.locator('.docs-live-stage').screenshot({path:`evidence/data-table-docs-final-${width}.png`});
  results.push({width,geometry,violations});
 }
}finally{await browser.close();}
await writeFile('evidence/data-table-docs-final.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));if(results.some(r=>r.violations.length||r.geometry.pageOverflow))process.exitCode=1;
