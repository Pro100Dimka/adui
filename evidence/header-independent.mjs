import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/YOJIK/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const axe = readFileSync('release/consumer-react19/node_modules/axe-core/axe.min.js', 'utf8');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ reducedMotion: 'reduce' });
const baseUrl = process.env.UI_BASE_URL ?? 'http://127.0.0.1:5173';
const results = [], errors = [];
const check = (name, passed, actual) => results.push({ name, passed, actual });
page.on('pageerror', error => errors.push(error.message));
try {
 for (const width of [320, 768]) for (const appearance of ['dark', 'light']) for (const textScale of ['100%', '200% text only', '200% root font']) {
  await page.setViewportSize({ width, height: 1000 });
  await page.goto(baseUrl + '/#/components/overview');
  await page.evaluate(({ appearance }) => localStorage.setItem('neo-ui-site-settings', JSON.stringify({ ...JSON.parse(localStorage.getItem('neo-ui-site-settings') ?? '{}'), locale: 'uk', appearance, scale: 1 })), { appearance });
  await page.reload();
  await page.locator('.site-tools').waitFor();
  await page.evaluate(async () => document.fonts.ready);
  const fonts = await page.evaluate(textScale => {
   const text = [...document.querySelectorAll('.site-top *')].filter(element => [...element.childNodes].some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim()));
   const before = text.map(element => Number.parseFloat(getComputedStyle(element).fontSize));
   if (textScale === '200% text only') text.forEach((element, i) => element.style.fontSize = before[i] * 2 + 'px');
   if (textScale === '200% root font') document.documentElement.style.fontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) * 2 + 'px';
   return text.map((element, i) => ({ text: element.textContent.trim().slice(0, 50), before: before[i], after: Number.parseFloat(getComputedStyle(element).fontSize) }));
  }, textScale);
  const scenario = `${width} ${appearance} ${textScale}`;
  const geometry = await page.locator('.site-top').evaluate(header => {
   const rect = header.getBoundingClientRect();
   const actions = [...header.querySelectorAll('a,button')].map(node => { const box = node.getBoundingClientRect(); return { name: node.getAttribute('aria-label') || node.textContent.trim(), x: box.x, y: box.y, width: box.width, height: box.height, right: box.right, bottom: box.bottom, scrollWidth: node.scrollWidth, clientWidth: node.clientWidth }; });
   const overlap = actions.flatMap((a, i) => actions.slice(i + 1).filter(b => Math.min(a.right,b.right) - Math.max(a.x,b.x) > 1 && Math.min(a.bottom,b.bottom) - Math.max(a.y,b.y) > 1).map(b => [a.name,b.name]));
   return { right: rect.right, bottom: rect.bottom, width: innerWidth, actions, overlap };
  });
  check(scenario + ' reachable geometry', geometry.actions.length === 5 && geometry.actions.every(a => a.x >= 0 && a.right <= geometry.width + 1 && a.bottom <= geometry.bottom + 1 && a.scrollWidth <= a.clientWidth + 1) && geometry.overlap.length === 0, { ...geometry, fonts });
  await page.addScriptTag({ content: axe });
  const violations = await page.evaluate(async () => (await axe.run(document.querySelector('.site-top'), { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa'] } })).violations.map(({id,impact,nodes}) => ({id,impact,nodes:nodes.map(({target,failureSummary})=>({target,failureSummary}))})));
  check(scenario + ' header axe', violations.length === 0, violations);
  await page.locator('.site-top').screenshot({ path: `evidence/header-independent-${width}-${appearance}-${textScale.replaceAll(' ','-').replace('%','')}.png` });
  await page.locator('.site-brand').focus();
  const focus = [];
  for (let i = 0; i < 4; i++) { await page.keyboard.press('Tab'); focus.push(await page.evaluate(() => ({ className: document.activeElement.className, visible: document.activeElement.matches(':focus-visible'), name: document.activeElement.getAttribute('aria-label'), outline: getComputedStyle(document.activeElement).outlineStyle, shadow: getComputedStyle(document.activeElement).boxShadow }))); }
  check(scenario + ' focus order and visible focus', ['site-appearance','site-settings-trigger','site-motion','site-locale'].every((name,i) => focus[i].className.includes(name) && focus[i].visible && (focus[i].outline !== 'none' || focus[i].shadow !== 'none')), focus);
  await page.keyboard.press('ArrowDown');
  await page.getByRole('menu').waitFor();
  const first = await page.evaluate(() => document.activeElement.textContent.trim());
  await page.keyboard.press('End');
  const last = await page.evaluate(() => document.activeElement.textContent.trim());
  await page.keyboard.press('Home');
  const home = await page.evaluate(() => document.activeElement.textContent.trim());
  await page.keyboard.press('Escape');
  check(scenario + ' locale keyboard and restore', first === 'Русский' && last === 'Українська' && home === first && await page.locator('.site-locale').evaluate(node => node === document.activeElement && node.getAttribute('aria-expanded') === 'false'), {first,last,home});
  await page.locator('.site-settings-trigger').focus();
  await page.keyboard.press('Enter');
  await page.getByRole('dialog').waitFor();
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({state:'detached'});
  check(scenario + ' settings restores keyboard focus', await page.locator('.site-settings-trigger').evaluate(node => node === document.activeElement));
  const state = await page.locator('.site-motion').getAttribute('aria-pressed');
  await page.locator('.site-motion').focus();
  await page.keyboard.press('Space');
  check(scenario + ' motion keyboard toggle', await page.locator('.site-motion').getAttribute('aria-pressed') !== state);
  await page.keyboard.press('Space');
  await page.locator('.site-appearance').focus();
  const original = await page.locator('.site-appearance').getAttribute('aria-pressed');
  await page.keyboard.press('Space');
  check(scenario + ' appearance keyboard toggle', await page.locator('.site-appearance').getAttribute('aria-pressed') !== original);
  await page.keyboard.press('Space');
 }
 check('no runtime errors', errors.length === 0, errors);
} finally { await browser.close(); }
const report = { baseUrl, browser: 'Installed Chrome headless', scope: 'Header only, UA locale, 320/768, dark/light, actual font-size doubling and separate root font doubling; emulation, not OS text zoom', passed: results.filter(r => r.passed).length, failed: results.filter(r => !r.passed).length, results };
writeFileSync('evidence/header-independent.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exitCode = report.failed ? 1 : 0;
