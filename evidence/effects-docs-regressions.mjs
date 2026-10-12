import { chromium } from 'file:///C:/Users/YOJIK/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';
const stage=process.argv[2]??'green';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({reducedMotion:'reduce'});const results=[];const errors=[];
page.on('pageerror',error=>errors.push(error.message));
try {
 for(const [name,slug] of [['MediaCard','media-card'],['MelodixText','melodix-text'],['NeonWaves','neon-waves']]) {
  await page.emulateMedia({reducedMotion:name==='NeonWaves'?'no-preference':'reduce'});
  await page.goto('http://127.0.0.1:5173/#/components/'+slug);
  await page.getByRole('heading',{name,exact:true}).waitFor();
  await page.locator('.docs-live-stage [data-ad-component="'+name+'"]').first().waitFor();
  await page.evaluate(()=>document.fonts.ready);
  for(const width of [320,375,768,1024,1440,1920]) {
   await page.setViewportSize({width,height:900});
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   const actual=await page.locator('.docs-live-stage').evaluate(node=>{
    const cards=[...node.querySelectorAll('.ad-media-card-card')].map(card=>{const r=card.getBoundingClientRect();return {height:r.height,contentHeight:card.querySelector('.ad-media-card-content').scrollHeight,clippedActions:[...card.querySelectorAll('button')].filter(button=>{const b=button.getBoundingClientRect();return b.top<r.top-1||b.bottom>r.bottom+1||b.left<r.left-1||b.right>r.right+1}).length}});
    const texts=[...node.querySelectorAll('.ad-melodix-text')].map(text=>({text:text.textContent,width:text.clientWidth,scrollWidth:text.scrollWidth}));
    return {x:Math.max(0,node.scrollWidth-node.clientWidth),y:Math.max(0,node.scrollHeight-node.clientHeight),cards,texts};
   });
   results.push({name,width,passed:actual.x===0&&actual.y===0&&actual.cards.every(card=>card.clippedActions===0)&&actual.texts.every(text=>text.scrollWidth<=text.width),actual});
   if(width===320)await page.screenshot({path:'evidence/effects-docs-'+stage+'-'+name+'-320.png',fullPage:true});
  }
  if(name==='NeonWaves') {
   await page.setViewportSize({width:320,height:900});
   await page.locator('.ad-neon-waves').scrollIntoViewIfNeeded();
   const motion=await page.locator('.docs-live-stage').evaluate(node=>new Promise(resolve=>{let start,maxX=0,maxY=0;const frames=new Set();function frame(now){start??=now;maxX=Math.max(maxX,node.scrollWidth-node.clientWidth);maxY=Math.max(maxY,node.scrollHeight-node.clientHeight);frames.add(node.querySelector('.ad-neon-waves-comet')?.style.transform);if(now-start<1000)requestAnimationFrame(frame);else resolve({maxX,maxY,positions:frames.size})}requestAnimationFrame(frame)}));
   results.push({name:'NeonWaves resize while moving',width:320,passed:motion.maxX===0&&motion.maxY===0&&motion.positions>5,actual:motion});
  }
 }
} finally {await browser.close();}
const report={passed:results.filter(r=>r.passed).length,failed:results.filter(r=>!r.passed).length,results,errors};
await writeFile('evidence/effects-docs-'+stage+'.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));process.exitCode=report.failed||errors.length?1:0;
