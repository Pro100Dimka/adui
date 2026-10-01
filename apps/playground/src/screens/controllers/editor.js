/* Screen-specific interaction controller. Common rendering and border motion live in ADUI. */
export default function initialize(context) {
  const {document,window,requestAnimationFrame,cancelAnimationFrame,ResizeObserver,MutationObserver,
    setTimeout,clearTimeout,setInterval,clearInterval,addEventListener,removeEventListener,matchMedia,localStorage}=context;
(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clone = value => JSON.parse(JSON.stringify(value));
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const initial = JSON.parse($("#me-initial").textContent);
  const scene = $("#me-scene"), viewport = $("#me-viewport"), scroll = $("#me-grid-scroll"), world = $("#me-world");
  const notesRoot = $("#me-notes"), wordsRoot = $("#me-words");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const storageKey = "advoice-melody-editor-demo-v1";
  const pitchStep = 8.8, c4Y = 229.5, preRoll = .5;
  let project = clone(initial), saved = JSON.stringify(initial);
  let zoom = 1, waveZoom = 1, tool = "select", mode = "notes", snap = .05;
  let selected = new Set(), nextId = 100, undoStack = [], redoStack = [], clipboard = [];
  let dragging = null, changed = false, menuAnchor = null, dialogCallback = null, focusBefore = null;
  let time = 0, playing = false, volume = .88, muted = false, audition = false;
  let audio = null, audioURL = null, audioContext = null, previewed = new Set();
  let motion = !reduced.matches, explicitMotion = false, open = true, seeking = false;
  let elapsed = 0, previous = null, lastPaint = -Infinity, frameId = null, toastTimer = null;
  const frames = new Map();
  const emit = (name, detail = {}) => window.dispatchEvent(new CustomEvent(`melody:${name}`, {detail, cancelable: true}));
  const px = () => 40 * zoom;
  const toX = value => (value + preRoll) * px();
  const fromX = x => x / px() - preRoll;
  const toY = pitch => c4Y + (60 - pitch) * pitchStep;
  const pitchAt = y => clamp(Math.round(60 + (c4Y - y) / pitchStep), 43, 83);
  const quantize = value => snap ? Math.round(value / snap) * snap : value;
  const duration = () => audio && Number.isFinite(audio.duration) ? audio.duration : project.duration;
  const fmt = value => {
    const whole = Math.floor(Math.max(0, value));
    const fraction = Math.floor((Math.max(0, value) - whole) * 100 + .0001);
    return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}.${String(fraction).padStart(2, "0")}`;
  };
  const pitchName = pitch => ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"][pitch % 12] + (Math.floor(pitch / 12) - 1);
  const svg = (name, attributes = {}) => {
    const element = document.createElementNS("http://www.w3.org/2000/svg", name);
    for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
    return element;
  };
  function icon(name) { const element = svg("svg", {class: "me-icon", "aria-hidden": "true"}); element.append(svg("use", {href: `#me-i-${name}`})); return element; }

  // Procedural optical texture only; the complete SVG landscape remains the fallback.
  function paintHeader() {
    const header = $(".me-header"), canvas = document.createElement("canvas");
    canvas.className = "me-header-canvas"; canvas.width = 1280; canvas.height = 83;
    canvas.setAttribute("aria-hidden", "true");
    const context = canvas.getContext("2d"); if (!context) return;
    let seed = 37419;
    const random = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const table = Float32Array.from({length: 65536}, random);
    const noise = (x,y) => { const ix=Math.floor(x),iy=Math.floor(y);let u=x-ix,v=y-iy;u=u*u*(3-2*u);v=v*v*(3-2*v);const n=(a,b)=>table[(a&255)+((b&255)<<8)];return(n(ix,iy)*(1-u)+n(ix+1,iy)*u)*(1-v)+(n(ix,iy+1)*(1-u)+n(ix+1,iy+1)*u)*v; };
    const fbm = (x,y,count=5) => {let sum=0,amplitude=.5;for(let i=0;i<count;i++){sum+=amplitude*noise(x,y);x=x*2.13+21.3;y=y*2.13-7.6;amplitude*=.5;}return sum;};
    const image=context.createImageData(1280,83);
    for(let y=0;y<83;y++)for(let x=0;x<1280;x++){
      const dx=x-398,dy=y-105,r=Math.hypot(dx,dy),edge=323-r;
      const haze=Math.exp(-(((x-716)/145)**2))*Math.exp(-(((y-52)/72)**2));
      const clouds=fbm(x*.021,y*.032);
      let red=5+44*haze*(.4+clouds),green=5+13*haze,blue=10+20*haze;
      if(edge>0){
        const illumination=clamp((x-360)/363,0,1),n=fbm(x*.032,y*.045,6),cracks=Math.pow(1-Math.abs(2*noise(x*.082+n*7,y*.1+n*8)-1),5);
        const ridges=clamp((n-.38)*4,0,1)*cracks;
        red=6+(38*n+110*ridges)*illumination**2;green=5+(16*n+12*ridges)*illumination**2;blue=10+(28*n+38*ridges)*illumination**2;
        const rim=Math.exp(-edge/1.75),bloom=Math.exp(-edge/14);
        red+=232*rim+80*bloom;green+=157*rim+26*bloom;blue+=149*rim+34*bloom;
      }else{
        const rim=Math.exp(edge/2.5),bloom=Math.exp(edge/15);
        red+=175*rim+75*bloom;green+=72*rim+9*bloom;blue+=96*rim+22*bloom;
      }
      const vignette=clamp(Math.min((x-330)/210,(1130-x)/270),.05,1);
      const p=(y*1280+x)*4;image.data[p]=red*vignette;image.data[p+1]=green*vignette;image.data[p+2]=blue*vignette;image.data[p+3]=255;
    }
    context.putImageData(image,0,0);
    context.save();context.globalCompositeOperation="screen";context.translate(717,54);context.scale(2.35,1);const horizon=context.createRadialGradient(0,0,0,0,0,68);horizon.addColorStop(0,"rgba(255,166,139,.72)");horizon.addColorStop(.24,"rgba(255,77,94,.53)");horizon.addColorStop(1,"rgba(208,25,58,0)");context.fillStyle=horizon;context.fillRect(-70,-70,140,140);context.restore();
    const water=context.createLinearGradient(0,59,0,83);water.addColorStop(0,"#50232c");water.addColorStop(.3,"#221923");water.addColorStop(1,"#06080c");context.fillStyle=water;context.fillRect(360,60,690,23);
    for(let i=0;i<1700;i++){const x=370+random()*660,y=60+random()*23,falloff=Math.exp(-(((x-717)/(32+(y-59)*2.3))**2));context.strokeStyle=`rgba(255,${105+Math.floor(random()*75)},${117+Math.floor(random()*72)},${falloff*(.12+random()*.42)})`;context.lineWidth=.22+random()*.5;context.beginPath();context.moveTo(x,y);context.lineTo(x+2+random()*18,y);context.stroke();}
    for(let layer=0;layer<5;layer++){
      const ridge=[];
      for(let x=345;x<=1020;x+=3){const distance=Math.abs(x-715)/360,detail=fbm(x*.049+layer*3.4,layer*14);const y=60-(7+Math.pow(distance,1.4)*63)*(1-layer*.12)*(detail*.85+.55);ridge.push([x,y]);}
      context.fillStyle=["#32202b","#251722","#180f1a","#0d0c13","#05080d"][layer];context.beginPath();context.moveTo(345,64);ridge.forEach(([x,y])=>context.lineTo(x,y));context.lineTo(1020,64);context.closePath();context.fill();
      for(let i=0;i<85;i++){const pos=Math.floor(random()*(ridge.length-1)),[x,y]=ridge[pos];context.strokeStyle=`rgba(221,84,104,${.04+random()*.12})`;context.lineWidth=.5;context.beginPath();context.moveTo(x,y);context.lineTo(x+3+random()*7,y+3+random()*9);context.lineTo(x+8+random()*14,64);context.stroke();}
    }
    for(let i=0;i<550;i++){const x=random()*1280,y=random()*83,light=.04+random()*.28;context.fillStyle=`rgba(243,94,122,${light})`;context.fillRect(x,y,.3+random()*.7,.3+random()*.6);}
    const fade=context.createLinearGradient(0,0,1280,0);fade.addColorStop(0,"#040509d9");fade.addColorStop(.29,"#040509cb");fade.addColorStop(.42,"#0405090a");fade.addColorStop(.64,"#04050900");fade.addColorStop(.84,"#040509d9");fade.addColorStop(1,"#040509f5");context.fillStyle=fade;context.fillRect(0,0,1280,83);
    header.append(canvas);header.classList.add("me-header-painted");
  }

  function fit() {
    const scale = Math.min(1, context.width / 1280, context.height / 698);
    scene.style.setProperty("--me-scale", String(scale));
    viewport.style.width = `${1280 * scale}px`; viewport.style.height = `${698 * scale}px`;
    closeMenu();
  }
  function notify(text) {
    clearTimeout(toastTimer); $("#me-toast").textContent = text; $("#me-toast").hidden = false;
    toastTimer = setTimeout(() => { $("#me-toast").hidden = true; }, 3300);
  }
  function createId() { let id; do { id = `new-${nextId++}`; } while (project.notes.some(n => n.id === id) || project.words.some(w => w.id === id)); return id; }
  function snapshot() { return JSON.stringify(project); }
  function markDirty() {
    changed = snapshot() !== saved;
    $("#me-dirty").hidden = !changed;
    $("#me-undo").disabled = undoStack.length === 0;
    $("#me-redo").disabled = redoStack.length === 0;
  }
  function commit(before, message = "") {
    if (before === snapshot()) return false;
    undoStack.push(before); if (undoStack.length > 100) undoStack.shift();
    redoStack = []; markDirty(); emit("change", {project: getProject()});
    if (message) notify(message);
    return true;
  }
  function undo() {
    if (!undoStack.length) return;
    redoStack.push(snapshot()); project = JSON.parse(undoStack.pop()); selected.clear(); renderProject(); markDirty();
    emit("change", {project: getProject(), action: "undo"});
  }
  function redo() {
    if (!redoStack.length) return;
    undoStack.push(snapshot()); project = JSON.parse(redoStack.pop()); selected.clear(); renderProject(); markDirty();
    emit("change", {project: getProject(), action: "redo"});
  }
  function getProject() { return clone(project); }
  function validate(value) {
    if (!value || value.version !== 1 || !Array.isArray(value.notes) || !Array.isArray(value.words) || value.notes.length > 2000 || value.words.length > 1000) throw Error("Неверный формат проекта: ожидаются version: 1, notes и words.");
    if (!Number.isFinite(value.duration) || value.duration <= 0 || value.duration > 36000) throw Error("Недопустимая длительность.");
    if (!Number.isFinite(value.bpm) || value.bpm < 30 || value.bpm > 300) throw Error("Темп должен быть от 30 до 300 BPM.");
    const ids = new Set();
    const checkSpan = item => {
      if (!item || typeof item.id !== "string" || ids.has(item.id) || item.id.length > 80 || !Number.isFinite(item.start) || !Number.isFinite(item.end) || item.start < -preRoll || item.end <= item.start || item.end > value.duration) throw Error("Некорректный интервал или повторяющийся ID.");
      ids.add(item.id);
    };
    const notes = value.notes.map(n => { checkSpan(n); if (!Number.isInteger(n.pitch) || n.pitch < 43 || n.pitch > 83) throw Error("Высота ноты должна быть MIDI 43–83."); return {id: n.id, start: n.start, end: n.end, pitch: n.pitch}; });
    const words = value.words.map(w => { checkSpan(w); if (typeof w.text !== "string" || w.text.length > 100) throw Error("Слово слишком длинное."); return {id: w.id, start: w.start, end: w.end, text: w.text}; });
    return {version: 1, name: String(value.name || "Проект").slice(0, 100), duration: value.duration, bpm: value.bpm, root: [...$("#me-root").options].some(o => o.value === value.root) ? value.root : "C#4", mode: ["none", "major", "minor"].includes(value.mode) ? value.mode : "none", notes, words};
  }
  function setProject(value) {
    const parsed = validate(value), before = snapshot();
    pause(); project = parsed; selected.clear(); time = 0;
    renderProject(); commit(before); return true;
  }

  function styleNote(element, note) {
    element.style.left = `${toX(note.start)}px`;
    element.style.top = `${toY(note.pitch) - 7.5}px`;
    element.style.width = `${Math.max(4, (note.end - note.start) * px())}px`;
    element.setAttribute("aria-label", `${pitchName(note.pitch)}, ${note.start.toFixed(2)}–${note.end.toFixed(2)} с`);
    element.classList.toggle("is-selected", selected.has(note.id));
    element.setAttribute("aria-pressed", String(selected.has(note.id)));
  }
  function renderNotes() {
    const existing = new Map($$(".me-note", notesRoot).map(n => [n.dataset.id, n]));
    for (const note of project.notes) {
      let element = existing.get(note.id);
      if (!element) {
        element = document.createElement("div"); element.className = "me-note"; element.tabIndex = 0;
        element.dataset.id = note.id; element.setAttribute("role", "button");
        element.title = "Перетащите ноту. Край — длительность. Двойной щелчок — свойства.";
        for (const [cls, handle] of [["me-note-face", null], ["me-resize me-resize--start", "start"], ["me-resize me-resize--end", "end"]]) {
          const span = document.createElement("span"); span.className = cls; if (handle) span.dataset.handle = handle;
          element.append(span);
        }
        notesRoot.append(element);
      }
      styleNote(element, note); existing.delete(note.id);
    }
    existing.forEach(element => element.remove());
  }
  function renderWords() {
    const fragment = document.createDocumentFragment();
    for (const word of project.words) {
      const button = document.createElement("button"); button.className = "me-word"; button.type = "button";
      button.dataset.word = word.id; button.textContent = word.text;
      button.style.left = `${toX(word.start)}px`; button.style.width = `${Math.max(12, (word.end - word.start) * px())}px`;
      button.title = "Двойной щелчок — изменить слово"; fragment.append(button);
    }
    wordsRoot.replaceChildren(fragment);
  }
  function renderRuler() {
    const measureWidth = px() * 240 / project.bpm;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i <= Math.ceil(project.duration * project.bpm / 240); i++) {
      const button = document.createElement("button"); button.className = "me-measure"; button.type = "button";
      button.dataset.bar = String(i); button.textContent = String(i + 1); button.title = `Такт ${i + 1}`;
      button.style.left = `${toX(i * 240 / project.bpm) - 16 * zoom}px`; fragment.append(button);
    }
    $("#me-ruler").replaceChildren(fragment);
    const pattern = $("#me-grid-pattern"); pattern.setAttribute("width", String(measureWidth));
    const paths = $$('path', pattern);
    paths[0].setAttribute("d", `M0 0H${measureWidth}`);
    paths[2].setAttribute("d", [1,2,3].map(i => `M${i * measureWidth / 4} 0V8.8`).join(""));
    pattern.setAttribute("x", String(toX(0)));
    const width = Math.max(scroll.clientWidth, toX(project.duration) + 60);
    world.style.width = `${width}px`;
    const grid = $("#me-grid-svg"); grid.style.width = `${width}px`; grid.setAttribute("viewBox", `0 0 ${width} 390`);
    $$("rect, path", grid).filter(node => !node.closest("defs")).forEach(node => {
      if (node.tagName === "rect") node.setAttribute("width", String(width));
      else { const m = node.getAttribute("d")?.match(/^M0 ([\d.-]+)H/); if (m) node.setAttribute("d", `M0 ${m[1]}H${width}`); }
    });
  }
  function renderProject() {
    $("#me-project-name").textContent = project.name;
    renderRuler(); renderNotes(); renderWords();
    $("#me-root").value = project.root; $("#me-scale-mode").value = project.mode;
    updateScaleRows(); paintTransport();
  }
  function updateScaleRows() {
    const roots = ["C4","C#4","D4","D#4","E4","F4","F#4","G4","G#4","A4","A#4","B4"];
    const root = roots.indexOf(project.root);
    const scale = project.mode === "major" ? [0,2,4,5,7,9,11] : [0,2,3,5,7,8,10];
    $$(".me-key", $("#me-piano")).forEach(key => {
      const on = project.mode !== "none" && scale.includes((Number(key.dataset.pitch) - root + 120) % 12);
      key.style.boxShadow = on ? "inset -2px 0 #ff527a, inset 0 1px #ffc4d420" : "";
    });
  }
  function setZoom(value) {
    const center = fromX(scroll.scrollLeft + scroll.clientWidth / 2);
    zoom = clamp(value, .5, 2); $("#me-zoom").value = String(Math.round(zoom * 100));
    renderProject(); scroll.scrollLeft = Math.max(0, toX(center) - scroll.clientWidth / 2);
    closeMenu();
  }
  function setTool(value) {
    if (!["select", "draw", "erase", "split", "pan"].includes(value)) return;
    tool = value; world.dataset.tool = value;
    $$("[data-tool]", $(".me-tools")).forEach(button => { const active = button.dataset.tool === value; button.classList.toggle("me-ruby", active); button.setAttribute("aria-pressed", String(active)); });
    const hints = {select: "Перетаскивайте ноты, чтобы изменить высоту и длительность", draw: "Потяните на свободном месте, чтобы нарисовать новую ноту", erase: "Нажмите на ноту, чтобы удалить её. Ctrl+Z — отмена", split: "Нажмите внутри ноты, чтобы разделить её на две", pan: "Перетаскивайте нотное поле, чтобы перемещаться по времени"};
    $("#me-hint").textContent = hints[value];
  }
  function setMode(value) {
    if (value === "grid") { showGridSettings(); return; }
    mode = value; scene.dataset.mode = value;
    $$("[data-mode]", $(".me-modes")).forEach(button => { const active = button.dataset.mode === value; button.classList.toggle("me-ruby", active); button.setAttribute("aria-pressed", String(active)); });
    if (value === "text") $("#me-hint").textContent = "Двойной щелчок по слову — текст и время его появления";
    else if (value === "rhythm") $("#me-hint").textContent = "Ритм: перемещайте ноты по времени; высота остаётся прежней";
    else setTool(tool);
  }
  function localPoint(event) {
    const r = scroll.getBoundingClientRect();
    const scale = r.width / scroll.clientWidth;
    return {x: (event.clientX - r.left) / scale + scroll.scrollLeft, y: (event.clientY - r.top) / scale};
  }
  function selectNote(id, toggle = false) {
    if (toggle) selected.has(id) ? selected.delete(id) : selected.add(id);
    else if (!selected.has(id)) selected = new Set([id]);
    renderNotes();
  }
  function removeNotes() {
    if (!selected.size) return;
    const before = snapshot(); project.notes = project.notes.filter(n => !selected.has(n.id)); selected.clear();
    renderNotes(); commit(before);
  }
  function splitNote(note, value) {
    const at = quantize(value);
    if (at <= note.start + .05 || at >= note.end - .05) { notify("Разделите ноту ближе к середине, не у края."); return; }
    const before = snapshot(), end = note.end;
    note.end = at;
    const next = {id: createId(), start: at, end, pitch: note.pitch};
    project.notes.push(next); selected = new Set([note.id, next.id]); renderNotes(); commit(before);
  }
  world.addEventListener("pointerdown", event => {
    if (event.button !== 0 || event.target.closest(".me-word,.me-ruler")) return;
    closeMenu(); const point = localPoint(event), node = event.target.closest(".me-note");
    if (tool === "pan") { dragging = {kind: "pan", clientX: event.clientX, left: scroll.scrollLeft, scale: scroll.getBoundingClientRect().width / scroll.clientWidth}; }
    else if (node) {
      const note = project.notes.find(n => n.id === node.dataset.id); if (!note) return;
      if (tool === "erase") { selected = new Set([note.id]); removeNotes(); return; }
      if (tool === "split") { splitNote(note, fromX(point.x)); return; }
      selectNote(note.id, event.shiftKey || event.ctrlKey || event.metaKey);
      if (!selected.has(note.id)) return;
      const handle = event.target.dataset.handle;
      dragging = {kind: handle || "move", x: point.x, y: point.y, before: snapshot(), bases: project.notes.filter(n => selected.has(n.id)).map(clone), id: note.id, moved: false};
      node.classList.add("is-dragging");
      if (audition) tone(note.pitch);
    } else if (tool === "draw" && point.y > 63) {
      const before = snapshot(), start = clamp(quantize(fromX(point.x)), 0, project.duration - .1);
      const note = {id: createId(), start, end: Math.min(start + .35, project.duration), pitch: pitchAt(point.y)};
      project.notes.push(note); selected = new Set([note.id]); renderNotes();
      dragging = {kind: "draw", before, x: point.x, y: point.y, id: note.id, origin: start, moved: false};
    } else if (point.y > 63) {
      if (!event.shiftKey) selected.clear(); renderNotes();
      dragging = {kind: "marquee", x: point.x, y: point.y, base: new Set(selected), moved: false};
    }
    if (dragging) { event.preventDefault(); world.setPointerCapture(event.pointerId); }
  });
  world.addEventListener("pointermove", event => {
    if (!dragging) return;
    const point = localPoint(event), g = dragging;
    if (g.kind === "pan") { scroll.scrollLeft = g.left - (event.clientX - g.clientX) / g.scale; return; }
    g.moved = g.moved || Math.hypot(point.x - g.x, point.y - g.y) > 2;
    if (g.kind === "marquee") {
      const x = Math.min(g.x, point.x), y = Math.min(g.y, point.y), w = Math.abs(g.x - point.x), h = Math.abs(g.y - point.y);
      const box = $("#me-marquee"); box.hidden = false; box.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
      selected = new Set(g.base);
      for (const n of project.notes) if (toX(n.end) >= x && toX(n.start) <= x + w && toY(n.pitch) + 7.5 >= y && toY(n.pitch) - 7.5 <= y + h) selected.add(n.id);
      renderNotes(); return;
    }
    if (g.kind === "draw") {
      const note = project.notes.find(n => n.id === g.id);
      const end = clamp(quantize(fromX(point.x)), 0, project.duration);
      note.start = Math.min(end, g.origin); note.end = Math.max(g.origin + .06, end);
      renderNotes(); return;
    }
    let dt = quantize((point.x - g.x) / px());
    const dp = mode === "rhythm" ? 0 : Math.round((g.y - point.y) / pitchStep);
    if (g.kind === "move") dt = clamp(dt, -preRoll - Math.min(...g.bases.map(n => n.start)), project.duration - Math.max(...g.bases.map(n => n.end)));
    for (const base of g.bases) {
      const note = project.notes.find(n => n.id === base.id);
      if (g.kind === "move") { note.start = +(base.start + dt).toFixed(4); note.end = +(base.end + dt).toFixed(4); note.pitch = clamp(base.pitch + dp, 43, 83); }
      else if (note.id === g.id && g.kind === "start") note.start = clamp(quantize(base.start + dt), -preRoll, base.end - .06);
      else if (note.id === g.id && g.kind === "end") note.end = clamp(quantize(base.end + dt), base.start + .06, project.duration);
    }
    renderNotes();
  });
  function endDrag(event) {
    if (!dragging) return;
    const g = dragging; dragging = null; $("#me-marquee").hidden = true;
    $$(".is-dragging", notesRoot).forEach(node => node.classList.remove("is-dragging"));
    if (event?.type === "pointercancel" && g.before) { project = JSON.parse(g.before); renderNotes(); }
    else if (g.before) commit(g.before);
    else if (g.kind === "marquee" && !g.moved) setTime(fromX(g.x));
    if (event?.pointerId && world.hasPointerCapture(event.pointerId)) world.releasePointerCapture(event.pointerId);
  }
  world.addEventListener("pointerup", endDrag); world.addEventListener("pointercancel", endDrag);
  world.addEventListener("lostpointercapture", () => { if (dragging) endDrag(); });
  world.addEventListener("dblclick", event => { const element = event.target.closest(".me-note") || document.elementFromPoint(event.clientX, event.clientY)?.closest(".me-note"); if (element) editNote(element.dataset.id); });
  wordsRoot.addEventListener("dblclick", event => { const button = event.target.closest(".me-word"); if (button) editWord(button.dataset.word); });
  wordsRoot.addEventListener("click", event => { const button = event.target.closest(".me-word"); if (!button) return; $$(".me-word", wordsRoot).forEach(b => b.classList.toggle("is-selected", b === button)); });
  $("#me-ruler").addEventListener("click", event => { const button = event.target.closest(".me-measure"); if (button) setTime(Number(button.dataset.bar) * 240 / project.bpm); });
  scroll.addEventListener("wheel", event => {
    if (event.ctrlKey || event.metaKey) { event.preventDefault(); setZoom(clamp(zoom + (event.deltaY > 0 ? -.25 : .25), .5, 2)); }
    else if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) { event.preventDefault(); scroll.scrollLeft += event.deltaY; }
  }, {passive: false});

  function dialog({title, description = "", fields = [], confirm = "Применить", onConfirm}) {
    closeMenu(); pause(); focusBefore = document.activeElement; dialogCallback = onConfirm;
    $("#me-dialog-title").textContent = title; $("#me-dialog-description").textContent = description;
    const root = $("#me-dialog-fields"); root.replaceChildren();
    for (const field of fields) {
      const label = document.createElement("label"); label.className = "me-dialog-field";
      const span = document.createElement("span"); span.textContent = field.label;
      const input = document.createElement(field.options ? "select" : "input");
      input.name = field.name; input.id = `me-field-${field.name}`;
      if (field.options) for (const [value, text] of field.options) { const option = document.createElement("option"); option.value = value; option.textContent = text; input.append(option); }
      else { input.type = field.type || "text"; if (field.min != null) input.min = field.min; if (field.max != null) input.max = field.max; if (field.step != null) input.step = field.step; if (input.type === "text") input.maxLength = field.maxLength || 100; }
      if (field.type === "checkbox") input.checked = Boolean(field.value); else input.value = String(field.value ?? "");
      if (field.required) input.required = true;
      label.append(span, input); root.append(label);
    }
    const error = document.createElement("div"); error.className = "me-dialog-error"; error.id = "me-dialog-error"; error.setAttribute("role", "alert"); root.append(error);
    $("#me-dialog-confirm span").textContent = confirm;
    $("#me-dialog-backdrop").hidden = false;
    $$(':scope > header, :scope > section, :scope > footer', scene).forEach(node => { node.inert = true; });
    (root.querySelector("input,select") || $("#me-dialog-cancel")).focus({preventScroll: true});
  }
  function closeDialog() {
    $("#me-dialog-backdrop").hidden = true; dialogCallback = null;
    $$(':scope > header, :scope > section, :scope > footer', scene).forEach(node => { node.inert = false; });
    if (focusBefore?.isConnected) focusBefore.focus({preventScroll: true});
  }
  $("#me-dialog-cancel").addEventListener("click", closeDialog);
  function submitDialog(event) {
    event.preventDefault(); const form = $("#me-dialog-form"); if (!form.reportValidity()) return;
    const values = {};
    $$('input,select', $("#me-dialog-fields")).forEach(input => { values[input.name] = input.type === "checkbox" ? input.checked : input.type === "number" ? Number(input.value) : input.value; });
    try { const callback = dialogCallback; callback?.(values); closeDialog(); }
    catch (error) { $("#me-dialog-error").textContent = error.message; }
  }
  $("#me-dialog-confirm").addEventListener("click", submitDialog); $("#me-dialog-form").addEventListener("submit", submitDialog);
  $("#me-dialog-backdrop").addEventListener("click", event => { if (event.target === $("#me-dialog-backdrop")) closeDialog(); });
  function editNote(id) {
    const n = project.notes.find(note => note.id === id); if (!n) return;
    dialog({title: `Нота ${pitchName(n.pitch)}`, description: "Время задаётся в секундах. MIDI — высота ноты.", fields: [{name:"pitch", label:"Высота MIDI", type:"number", min:43, max:83, step:1, value:n.pitch}, {name:"start", label:"Начало, с", type:"number", min:-preRoll, max:project.duration, step:.01, value:+n.start.toFixed(2)}, {name:"end",label:"Конец, с",type:"number",min:0,max:project.duration,step:.01,value:+n.end.toFixed(2)}], onConfirm: values => {
      if (values.end <= values.start) throw Error("Конец должен быть позже начала.");
      const before = snapshot(); Object.assign(n, values); renderNotes(); commit(before);
    }});
  }
  function editWord(id) {
    const word = project.words.find(w => w.id === id); if (!word) return;
    dialog({title:"Текст и время слова", description:"Редактируется слово из демонстрационного фрагмента.", fields:[{name:"text",label:"Текст",value:word.text,required:true},{name:"start",label:"Начало, с",type:"number",min:0,max:project.duration,step:.01,value:+word.start.toFixed(2)},{name:"end",label:"Конец, с",type:"number",min:0,max:project.duration,step:.01,value:+word.end.toFixed(2)}],onConfirm:values=>{
      if (values.end <= values.start) throw Error("Конец должен быть позже начала.");
      const before=snapshot();Object.assign(word,values);renderWords();commit(before);
    }});
  }
  function showGridSettings() {
    dialog({title:"Сетка и привязка",fields:[{name:"visible",label:"Показывать сетку",type:"checkbox",value:scene.dataset.grid!=="off"},{name:"snap",label:"Привязка по времени",value:snap,options:[[0,"Без привязки"],[.05,"50 мс"],[.1,"100 мс"],[60/project.bpm/4,"1/16 такта"],[60/project.bpm,"Одна доля"]]},{name:"bpm",label:"Темп, BPM",type:"number",min:30,max:300,step:1,value:project.bpm}],onConfirm:values=>{
      scene.dataset.grid=values.visible?"on":"off";snap=Number(values.snap); const before=snapshot(); project.bpm=values.bpm;renderRuler();commit(before);
      $("#me-mode-grid").setAttribute("aria-pressed",String(values.visible));
    }});
  }
  function showSettings() {
    dialog({title:"Настройки редактора",description:"Эффекты не меняют положение панелей, кнопок и нот. Звук нот включается отдельно.",fields:[{name:"motion",label:"Анимации неона и декоративных волн",type:"checkbox",value:motion},{name:"audition",label:"Прослушивание нот при редактировании",type:"checkbox",value:audition}],onConfirm:values=>{setMotion(values.motion);setAudition(values.audition);}});
  }

  function closeMenu() { $("#me-popover").hidden = true; if (menuAnchor) menuAnchor.setAttribute("aria-expanded", "false"); menuAnchor = null; }
  function menu(anchor, items) {
    const popover = $("#me-popover"); if (!popover.hidden && menuAnchor === anchor) { closeMenu(); return; }
    closeMenu();menuAnchor=anchor;anchor.setAttribute("aria-expanded","true");popover.replaceChildren();
    for (const item of items) {
      const button = document.createElement("button");button.className="me-menu-item";button.type="button";button.setAttribute("role","menuitem");
      button.append(icon(item.icon));const span=document.createElement("span");span.textContent=item.label;button.append(span);
      if(item.disabled)button.disabled=true;
      button.addEventListener("click",()=>{closeMenu();try{Promise.resolve(item.action()).catch(e=>notify(e.message));}catch(e){notify(e.message);}});popover.append(button);
    }
    popover.hidden=false;const a=anchor.getBoundingClientRect(),s=scene.getBoundingClientRect(),scale=s.width/1280;
    const width=popover.offsetWidth,height=popover.offsetHeight;
    popover.style.left=`${clamp((a.right-s.left)/scale-width,12,1280-width-12)}px`;
    const down=(a.bottom-s.top)/scale+7;popover.style.top=`${down+height<680?down:Math.max(8,(a.top-s.top)/scale-height-7)}px`;
    popover.querySelector("button:not(:disabled)")?.focus({preventScroll:true});
  }
  document.addEventListener("pointerdown", event => {if(!event.target.closest(".me-popover")&&!menuAnchor?.contains(event.target))closeMenu();});
  function exportProject() {
    const blob=new Blob([JSON.stringify({...getProject(),demo:true,source:"Melody editor UI reference"},null,2)],{type:"application/json;charset=utf-8"});
    const url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download="melody-project.json";link.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
    notify("JSON проекта экспортирован.");
  }
  function save() {
    if (!emit("save", {project: getProject(), demo: true})) return;
    try {localStorage.setItem(storageKey,snapshot());saved=snapshot();markDirty();notify("Проект сохранён локально в браузере. Экспорт JSON — в меню справа.");}
    catch {notify("Браузер не разрешил локальное сохранение. Используйте экспорт JSON.");}
  }
  function restoreSaved() {
    try {const value=localStorage.getItem(storageKey);if(!value){notify("В этом браузере ещё нет сохранённого проекта.");return;}setProject(JSON.parse(value));saved=snapshot();markDirty();notify("Локальный проект открыт.");}
    catch(error){notify(`Не удалось открыть проект: ${error.message}`);}
  }
  function resetProject() {dialog({title:"Вернуть исходный фрагмент?",description:"Изменения нот и текста в текущем макете будут отменены. Файлы компьютера не изменятся.",confirm:"Восстановить",onConfirm:()=>{setProject(clone(initial));scroll.scrollLeft=0;notify("Исходный демонстрационный фрагмент восстановлен.");}});}
  $("#me-save").addEventListener("click",save);
  $("#me-save-menu").addEventListener("click",event=>menu(event.currentTarget,[{icon:"download",label:"Экспортировать проект JSON",action:exportProject},{icon:"upload",label:"Импортировать проект JSON",action:()=>$("#me-json-file").click()},{icon:"folder",label:"Открыть сохранённый проект",action:restoreSaved}]));
  $("#me-transport-menu").addEventListener("click",event=>menu(event.currentTarget,[{icon:"folder",label:"Выбрать локальный аудиофайл",action:()=>$("#me-audio-file").click()},{icon:"info",label:"О демонстрационном проекте",action:()=>notify("Ноты и время воспроизводят макет. Аудио песни не встроено; подключите свой файл.")}]));
  $("#me-more").addEventListener("click",event=>menu(event.currentTarget,[{icon:"grid",label:"Сетка и привязка",action:showGridSettings},{icon:"copy",label:"Дублировать выбранные ноты",disabled:!selected.size,action:duplicateNotes},{icon:"reset",label:"Вернуть исходный фрагмент",action:resetProject},{icon:"settings",label:"Настройки редактора",action:showSettings}]));
  $("#me-json-file").addEventListener("change",async event=>{
    const file=event.target.files?.[0];if(!file)return;
    try{if(file.size>2000000)throw Error("Файл проекта должен быть не больше 2 МБ.");setProject(JSON.parse(await file.text()));notify("Проект импортирован.");}catch(error){notify(error.message);}event.target.value="";
  });

  function setTime(value) {time=clamp(Number(value)||0,0,duration());if(audio)audio.currentTime=time;previewed.clear();paintTransport();}
  function paintTransport() {
    $("#me-time").textContent=fmt(time);$("#me-duration").textContent=fmt(duration());$("#me-seek").max=duration();$("#me-seek").value=String(time);
    $("#me-wave-cursor").style.left=`${Math.min(652,time/Math.max(1,duration())*652*waveZoom)}px`;
    $("#me-playhead").style.left=`${toX(time)}px`;
    $("#me-play").setAttribute("aria-pressed",String(playing));$("#me-play").setAttribute("aria-label",playing?"Пауза":"Воспроизвести");
    $("#me-play use").setAttribute("href",playing?"#me-i-pause":"#me-i-play");
    if(playing){const x=toX(time);if(x>scroll.scrollLeft+scroll.clientWidth-80||x<scroll.scrollLeft)scroll.scrollLeft=Math.max(0,x-90);}
  }
  async function play() {
    if(time>=duration())setTime(0);
    if(audio){try{await audio.play();}catch(error){notify(`Не удалось воспроизвести файл: ${error.message}`);return;}}
    else if(!scene.dataset.demoNotified){scene.dataset.demoNotified="true";notify("Пока это беззвучный просмотр шкалы. Свою запись можно открыть через ⋯.");}
    if(audition)await ensureAudio();playing=true;previous=null;previewed.clear();paintTransport();schedule();
  }
  function pause(){playing=false;audio?.pause();paintTransport();schedule();}
  async function ensureAudio(){if(!audioContext){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;audioContext=new C();}if(audioContext.state==="suspended")await audioContext.resume();return audioContext;}
  async function tone(pitch,length=.18){
    if(!audition||muted)return;
    try{const context=await ensureAudio();if(!context)return;const gain=context.createGain(),osc=context.createOscillator();osc.type="triangle";osc.frequency.value=440*Math.pow(2,(pitch-69)/12);const now=context.currentTime;
      gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.045*volume,now+.008);gain.gain.exponentialRampToValueAtTime(.0001,now+length);osc.connect(gain);gain.connect(context.destination);osc.start(now);osc.stop(now+length+.03);osc.onended=()=>{osc.disconnect();gain.disconnect();};
    }catch{notify("Предпрослушивание нот недоступно в этом браузере.");}
  }
  function setAudition(on){audition=Boolean(on);$("#me-audition").setAttribute("aria-pressed",String(audition));if(audition)ensureAudio().catch(()=>{});}
  async function loadAudio(file){
    if(!(file instanceof File))throw Error("Ожидается локальный аудиофайл.");
    if(file.size>500*1024*1024)throw Error("Для макета выберите файл меньше 500 МБ.");
    pause();const url=URL.createObjectURL(file),next=new Audio();next.preload="metadata";next.src=url;
    try{await new Promise((resolve,reject)=>{next.onloadedmetadata=resolve;next.onerror=()=>reject(Error("Браузер не поддерживает этот аудиофайл."));});if(!Number.isFinite(next.duration)||next.duration<=0)throw Error("Не удалось определить длительность аудио.");}
    catch(error){next.src="";URL.revokeObjectURL(url);throw error;}
    if(audio){audio.pause();audio.removeAttribute("src");audio.load();}if(audioURL)URL.revokeObjectURL(audioURL);
    audio=next;audioURL=url;audio.volume=volume;audio.muted=muted;audio.onended=()=>{playing=false;paintTransport();};time=0;paintTransport();notify(`Открыто: ${file.name}. Ноты макета не заменяются автоматически.`);return true;
  }
  $("#me-audio-file").addEventListener("change",async event=>{const file=event.target.files?.[0];if(file){try{await loadAudio(file);}catch(e){notify(e.message);}}event.target.value="";});
  $("#me-play").addEventListener("click",()=>playing?pause():play());
  $("#me-seek").addEventListener("input",event=>setTime(Number(event.target.value)));
  $("#me-volume").addEventListener("input",event=>{volume=Number(event.target.value)/100;event.target.style.setProperty("--level",event.target.value+"%");if(audio)audio.volume=volume;});
  $("#me-mute").addEventListener("click",()=>{muted=!muted;$("#me-mute").setAttribute("aria-pressed",String(muted));$("#me-mute").title=muted?"Включить звук":"Выключить звук";if(audio)audio.muted=muted;});
  $("#me-audition").addEventListener("click",()=>{setAudition(!audition);notify(audition?"Предпрослушивание нот включено.":"Предпрослушивание нот выключено.");});
  $("#me-piano").addEventListener("pointerdown",event=>{const key=event.target.closest(".me-key");if(!key)return;key.classList.add("is-active");tone(Number(key.dataset.pitch));setTimeout(()=>key.classList.remove("is-active"),190);});
  $("#me-wave-zoom").addEventListener("change",event=>{waveZoom=Number(event.target.value)/100;$(".me-waveform > svg").setAttribute("viewBox",`0 0 ${652/waveZoom} 48`);paintTransport();});
  $("#me-zoom").addEventListener("change",event=>setZoom(Number(event.target.value)/100));
  $("#me-zoom-out").addEventListener("click",()=>setZoom(zoom-.25));$("#me-zoom-in").addEventListener("click",()=>setZoom(zoom+.25));
  $("#me-fit").addEventListener("click",()=>{setZoom(1);scroll.scrollLeft=0;setTime(0);});
  $$(".me-mode").forEach(button=>button.addEventListener("click",()=>setMode(button.dataset.mode)));
  $$(".me-tool").forEach(button=>button.addEventListener("click",()=>setTool(button.dataset.tool)));
  $("#me-root").addEventListener("change",event=>{const before=snapshot();project.root=event.target.value;updateScaleRows();commit(before);});
  $("#me-scale-mode").addEventListener("change",event=>{const before=snapshot();project.mode=event.target.value;updateScaleRows();commit(before);});
  $("#me-undo").addEventListener("click",undo);$("#me-redo").addEventListener("click",redo);$("#me-settings").addEventListener("click",showSettings);

  function duplicateNotes(){
    const group=project.notes.filter(n=>selected.has(n.id));if(!group.length)return;
    const before=snapshot(),offset=Math.max(...group.map(n=>n.end))-Math.min(...group.map(n=>n.start))+.1;selected.clear();
    for(const n of group){if(n.end+offset>project.duration)continue;const note={...n,id:createId(),start:n.start+offset,end:n.end+offset};project.notes.push(note);selected.add(note.id);}renderNotes();commit(before);
  }
  function setOpen(on){open=Boolean(on);$("#me-closed").hidden=open;if(!open)pause();previous=null;schedule();}
  function requestClose(action){if(!emit("navigate",{action,dirty:changed}))return;if(changed)dialog({title:"Закрыть редактор?",description:"Есть несохранённые изменения. Сохраните их кнопкой «Сохранить» либо закройте только макет.",confirm:"Закрыть",onConfirm:()=>setOpen(false)});else setOpen(false);}
  $("#me-close").addEventListener("click",()=>requestClose("close"));$("#me-back").addEventListener("click",()=>requestClose("back"));$("#me-reopen").addEventListener("click",()=>setOpen(true));
  $("#me-minimize").addEventListener("click",()=>{if(emit("window",{action:"minimize"}))notify("Сворачивание окна подключается в настольном приложении.");});
  $("#me-maximize").addEventListener("click",async()=>{if(!emit("window",{action:"fullscreen"}))return;try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else notify("Полноэкранный режим в этом браузере недоступен.");}catch{notify("Браузер не разрешил полноэкранный режим.");}});
  document.addEventListener("keydown",event=>{
    const modalOpen=!$("#me-dialog-backdrop").hidden;
    if(modalOpen){if(event.key==="Escape"){event.preventDefault();closeDialog();}if(event.key==="Tab"){const targets=$$('button:not(:disabled),input,select',$("#me-dialog")),first=targets[0],last=targets.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}return;}
    if(!$("#me-popover").hidden){if(event.key==="Escape"){event.preventDefault();const anchor=menuAnchor;closeMenu();anchor?.focus();}return;}
    if(!open||event.target.matches("input,select,textarea"))return;
    const mod=event.ctrlKey||event.metaKey,key=event.key.toLowerCase();
    if(mod&&["z","y","s","a","c","v"].includes(key)){
      event.preventDefault();
      if(key==="s")save();else if(key==="z")event.shiftKey?redo():undo();else if(key==="y")redo();
      else if(key==="a"){selected=new Set(project.notes.map(n=>n.id));renderNotes();}
      else if(key==="c"){clipboard=project.notes.filter(n=>selected.has(n.id)).map(clone);if(clipboard.length)notify(`Скопировано нот: ${clipboard.length}`);}
      else if(key==="v"&&clipboard.length){const before=snapshot(),offset=time-Math.min(...clipboard.map(n=>n.start));selected.clear();for(const n of clipboard){const copy={...n,id:createId(),start:n.start+offset,end:n.end+offset};if(copy.end<=project.duration){project.notes.push(copy);selected.add(copy.id);}}renderNotes();commit(before);}
      return;
    }
    if(event.code==="Space"){event.preventDefault();playing?pause():play();return;}
    if(["delete","backspace"].includes(key)){event.preventDefault();removeNotes();return;}
    const toolKeys={v:"select",d:"draw",e:"erase",c:"split",h:"pan"};if(toolKeys[key])setTool(toolKeys[key]);
    if(key==="escape"){selected.clear();renderNotes();}
    if(event.key.startsWith("Arrow")&&selected.size){
      event.preventDefault();const before=snapshot(),group=project.notes.filter(n=>selected.has(n.id));
      if(event.key==="ArrowUp"||event.key==="ArrowDown"){const dp=(event.key==="ArrowUp"?1:-1)*(event.shiftKey?12:1);for(const n of group)n.pitch=clamp(n.pitch+dp,43,83);}
      else{let dt=(event.key==="ArrowRight"?1:-1)*(event.shiftKey?.5:(snap||.05));dt=clamp(dt,-preRoll-Math.min(...group.map(n=>n.start)),project.duration-Math.max(...group.map(n=>n.end)));for(const n of group){n.start+=dt;n.end+=dt;}}
      renderNotes();commit(before);
    }
  });

  // Same border optics as Advanced/ENV: two radial lights on the measured path,
  // no rotating rectangles and no geometry animation. One animation loop for this page.
  function roundedPath(width,height,radius){
    const i=.65,right=width-i,bottom=height-i,r=Math.max(0,Math.min(radius-i,(width-2*i)/2,(height-2*i)/2));
    return r?`M${i+r} ${i}H${right-r}A${r} ${r} 0 0 1 ${right} ${i+r}V${bottom-r}A${r} ${r} 0 0 1 ${right-r} ${bottom}H${i+r}A${r} ${r} 0 0 1 ${i} ${bottom-r}V${i+r}A${r} ${r} 0 0 1 ${i+r} ${i}Z`:`M${i} ${i}H${right}V${bottom}H${i}Z`;
  }
  const borderObserver={observe(){},disconnect(){}};
  function makeBorder(element,index){frames.set(element,context.getBorder(element,index));}
  function syncBorder(item){item?.sync();}
  function paintBorders(){} // AnimatedBorder owns the light clock.
  const waveLines=$$("[data-wave-line]"),waveStars=$$("[data-wave-star]");
  function waveY(u,j,t){
    if(j<16){const q=j/15;return 116-44*Math.exp(-(((u-(.31+.012*Math.sin(t*.3)+q*.016))/.095)**2))-31*Math.exp(-(((u-(.62+.015*Math.sin(t*.22+1)+q*.023))/.093)**2))-43*Math.exp(-(((u-1.015-q*.015)/.075)**2))+q*14+4*Math.sin(u*32+t*.35+q);}
    const q=(j-16)/12;return 116+31*Math.sin(u*12.3-1+t*.26+q*.5)+17*Math.sin(u*5.2-.6-q*.12)+q*24;
  }
  function paintWaves(t){
    for(const path of waveLines){const j=Number(path.dataset.waveLine);let d="";for(let i=0;i<=100;i++){const x=i*11.89,y=waveY(x/1189,j,t);d+=`${i?"L":"M"}${x.toFixed(2)} ${y.toFixed(2)}`;}path.setAttribute("d",d);}
    for(const circle of waveStars){const[i,j]=circle.dataset.waveStar.split(":").map(Number);circle.setAttribute("cy",waveY(i/100,j,t).toFixed(2));}
  }
  function tick(now){
    frameId=null;if(document.hidden||!open||seeking){previous=null;return;}
    const dt=previous===null?0:Math.min(.25,(now-previous)/1000);previous=now;
    if(motion)elapsed+=dt;
    if(playing){time=audio?audio.currentTime:Math.min(time+dt,duration());if(time>=duration())playing=false;}
    if(now-lastPaint>=1000/30){
      if(motion){paintBorders(elapsed);paintWaves(elapsed);}
      if(playing||dt){paintTransport();}
      if(playing&&audition&&!audio){for(const n of project.notes){if(n.start<=time&&n.end>time&&!previewed.has(n.id)){previewed.add(n.id);tone(n.pitch,Math.min(.45,n.end-time));}}}
      lastPaint=now;
    }
    schedule();
  }
  function schedule(){if(frameId===null&&(motion||playing)&&!document.hidden&&open&&!seeking)frameId=requestAnimationFrame(tick);}
  function setMotion(on){motion=Boolean(on);explicitMotion=true;scene.dataset.motion=motion?"on":"off";previous=null;if(!motion&&!playing&&frameId!==null){cancelAnimationFrame(frameId);frameId=null;}schedule();return motion;}
  function seekAnimation(seconds){if(!Number.isFinite(seconds)||seconds<0)return false;seeking=true;if(frameId!==null)cancelAnimationFrame(frameId);frameId=null;elapsed=seconds;previous=null;paintBorders(seconds);paintWaves(seconds);return true;}
  function resumeAnimation(){seeking=false;previous=null;schedule();}
  document.addEventListener("visibilitychange",()=>{scene.dataset.visibility=document.hidden?"hidden":"visible";if(document.hidden){if(frameId!==null)cancelAnimationFrame(frameId);frameId=null;if(playing)pause();}previous=null;schedule();});
  reduced.addEventListener("change",event=>{if(!explicitMotion){motion=!event.matches;scene.dataset.motion=motion?"on":"off";schedule();}});
  addEventListener("resize",fit,{passive:true});fit();
  try { paintHeader(); } catch {}
  renderProject();setTool("select");markDirty();scene.dataset.motion=motion?"on":"off";
  $$('[data-neon]').forEach(makeBorder);paintBorders(0);paintWaves(0);schedule();
  window.MelodyEditorView=Object.freeze({getProject,setProject,save,undo,redo,setTime,play,pause,setMotion,setTool,setZoom,setMode,loadAudio,exportProject,seekAnimation,resumeAnimation,
    getState:()=>({time,playing,motion,zoom,tool,selected:[...selected],dirty:changed,noteCount:project.notes.length,wordCount:project.words.length}),
    getBorderGeometry:()=>[...frames.values()].map(i=>({width:i.element.offsetWidth,height:i.element.offsetHeight,viewBox:i.overlay.getAttribute("viewBox"),length:i.length})),
    referenceSize:Object.freeze({width:1280,height:698})});
  addEventListener("pagehide",()=>{if(frameId!==null)cancelAnimationFrame(frameId);frameId=null;borderObserver.disconnect();clearTimeout(toastTimer);audio?.pause();if(audioURL)URL.revokeObjectURL(audioURL);audioContext?.close().catch(()=>{});},{once:true});
  scene.dataset.ready="true";
})();

};
