/* Screen-specific interaction controller. Common rendering and border motion live in ADUI. */
export default function initialize(context) {
  const {document,window,requestAnimationFrame,cancelAnimationFrame,ResizeObserver,MutationObserver,
    setTimeout,clearTimeout,setInterval,clearInterval,addEventListener,removeEventListener,matchMedia,localStorage}=context;

(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const scene = $("#q-scene");
  const modal = $("#q-modal");
  const list = $("#q-list");
  const ns = "http://www.w3.org/2000/svg";
  const mediaQuery = matchMedia("(prefers-reduced-motion: reduce)");
  const initial = JSON.parse($("#q-data").textContent);
  let tasks = initial.map(task => ({...task}));
  const nodes = new Map($$("[data-task]").map(node => [node.dataset.task, node]));
  const frames = new Map();
  const sourceSummary = $("#q-summary").textContent;
  const stateLabels = {done: "Завершено", processing: "Обработка", queued: "В очереди", error: "Ошибка", cancelled: "Остановлена"};
  const stateIcons = {done: "check", processing: "processing", queued: "clock", error: "warning", cancelled: "stop"};
  let motion = !mediaQuery.matches && !new URLSearchParams(location.search).has("still");
  let explicitMotion = null;
  let frameId = null, previous = null, lastPaint = -Infinity, elapsed = 0;
  let opened = true, destroyed = false, seeking = false, toastTimer = null;
  let focusBeforeDialog = null, dialogCallback = null, menuTrigger = null;
  let headerIsReference = true;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const getTask = id => tasks.find(task => task.id === id);
  const formatTime = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
  const emit = (action, detail = {}) => modal.dispatchEvent(new CustomEvent(`queue:${action}`, {detail: {demo: true, ...detail}, bubbles: true, cancelable: true}));
  const svg = (tag, attributes = {}) => {
    const element = document.createElementNS(ns, tag);
    for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, String(value));
    return element;
  };

  function fit() {
    const scale = Math.min(1, context.width / 1064, context.height / 1280);
    scene.style.setProperty("--q-scale", String(scale));
    $("#q-viewport").style.width = `${1064 * scale}px`;
    $("#q-viewport").style.height = `${1280 * scale}px`;
  }
  addEventListener("resize", fit, {passive: true});
  fit();

  // Exact shared Advanced/ENV border palette, falloff, stroke width and travel speed.
  // A light moves ON the measured path. The panel and its contents never transform.
  function createFrame(element,index) { frames.set(element,context.getBorder(element,index,element===modal)); }
  function paintFrame() {} // AnimatedBorder owns the light clock.
  const ribbonLines = $$(".q-ribbon-line").map((node,i) => ({node, i, path:node.getAttribute("d")}));
  function renderLights(time) {
    frames.forEach(item => paintFrame(item, time));
    // Local optical shimmer only; ribbon geometry and text positions stay fixed.
    for (const {node,i} of ribbonLines) node.style.opacity = String(.34+.23*(.5+.5*Math.sin(time*.8+i*.21)));
  }
  $$('[data-q-border]').forEach(createFrame);
  function schedule() {
    if (frameId === null && !destroyed && opened && motion && !document.hidden && !seeking) frameId = requestAnimationFrame(tick);
  }
  function tick(now) {
    frameId = null;
    if (!opened || !motion || destroyed || document.hidden || seeking) {previous = null; return;}
    if (previous !== null) elapsed += Math.min((now-previous)/1000, 1);
    previous = now;
    if (now-lastPaint >= 1000/30) {renderLights(elapsed); lastPaint = now;}
    schedule();
  }
  function setMotion(enabled, explicit = true) {
    motion = Boolean(enabled);
    if (explicit) explicitMotion = motion;
    seeking = false;
    scene.dataset.motion = motion ? "on" : "off";
    if (frameId !== null) {cancelAnimationFrame(frameId); frameId = null;}
    previous = null;
    for (const animation of scene.getAnimations({subtree:true})) motion ? animation.play() : animation.pause();
    schedule();
  }
  mediaQuery.addEventListener("change", event => {if (explicitMotion === null) setMotion(!event.matches, false);});
  document.addEventListener("visibilitychange", () => {
    scene.dataset.visibility = document.hidden ? "hidden" : "visible";
    if (frameId !== null) {cancelAnimationFrame(frameId); frameId = null;}
    previous = null;
    schedule();
  });
  renderLights(0);
  setMotion(motion, false);

  function notify(message) {
    clearTimeout(toastTimer);
    $("#q-toast").textContent = message;
    $("#q-toast").hidden = false;
    toastTimer = setTimeout(() => {$("#q-toast").hidden = true;}, 4100);
  }
  function recalculateSummary() {
    const counts = {done:0, processing:0, queued:0, error:0, cancelled:0};
    tasks.forEach(task => counts[task.state]++);
    $("#q-summary").textContent = `${tasks.length} задач · ${counts.done} завершено` +
      (counts.processing ? ` · ${counts.processing} в обработке` : "") +
      ` · ${counts.queued} в очереди · ${counts.error} с ошибкой` +
      (counts.cancelled ? ` · ${counts.cancelled} остановлено` : "");
    headerIsReference = false;
    $("#q-clear").disabled = counts.done === 0;
  }
  function renderTask(task) {
    const node = nodes.get(task.id);
    node.dataset.state = task.state;
    $(".q-name", node).textContent = task.title;
    $(".q-name", node).title = task.title;
    $(".q-status-label", node).textContent = stateLabels[task.state];
    $(".q-stage-name", node).textContent = task.stage;
    $(".q-status-icon use", node).setAttribute("href", `#q-i-${stateIcons[task.state]}`);
    $(".q-status-icon", node).setAttribute("aria-label", stateLabels[task.state]);
    $(".q-track", node).setAttribute("aria-valuenow", String(task.progress));
    $(".q-fill", node).style.setProperty("--progress", `${task.progress}%`);
    $(".q-percent", node).textContent = `${task.progress}%`;
    $(".q-time", node).textContent = formatTime(task.seconds);
    $(".q-stages", node).hidden = task.state !== "processing";
    const error = $(".q-error-message", node);
    error.hidden = task.state !== "error";
    $("span", error).textContent = task.error || "";
    $$("[data-action]", node).forEach(button => {
      const action = button.dataset.action;
      const allowed = {
        folder:["done","processing"], play:["done"], stop:["processing"],
        up:["queued"], down:["queued"], retry:["error","cancelled"], menu:Object.keys(stateLabels)
      }[action];
      button.hidden = !allowed.includes(task.state);
    });
    frames.get(node)?.sync();
  }
  function updateQueueButtons() {
    const queued = tasks.filter(task => task.state === "queued");
    for (const task of tasks) {
      const index = queued.indexOf(task), node = nodes.get(task.id);
      $('[data-action="up"]', node).disabled = index < 1;
      $('[data-action="down"]', node).disabled = index < 0 || index === queued.length-1;
    }
  }
  function refreshList() {
    for (const task of tasks) {const node = nodes.get(task.id); node.hidden = false; list.insertBefore(node, $("#q-empty")); renderTask(task);}
    for (const [id,node] of nodes) if (!getTask(id)) node.hidden = true;
    $("#q-empty").hidden = tasks.length > 0;
    updateQueueButtons();
    recalculateSummary();
    updateScrollbar();
  }
  function showDialog({title, text, confirm = "Готово", onConfirm = null, informational = false}) {
    hideMenu(false);
    focusBeforeDialog = document.activeElement;
    dialogCallback = onConfirm;
    $("#q-dialog-title").textContent = title;
    $("#q-dialog-text").textContent = text;
    $("#q-confirm").textContent = confirm;
    $("#q-dialog-cancel").hidden = informational;
    $("#q-dialog-backdrop").hidden = false;
    $$(".q-header,.q-list,.q-footer,.q-scrollbar", modal).forEach(element => {element.inert = true;});
    (informational ? $("#q-confirm") : $("#q-dialog-cancel")).focus({preventScroll:true});
  }
  function closeDialog() {
    $("#q-dialog-backdrop").hidden = true;
    dialogCallback = null;
    $$(".q-header,.q-list,.q-footer,.q-scrollbar", modal).forEach(element => {element.inert = false;});
    if (focusBeforeDialog?.isConnected && !focusBeforeDialog.closest('[hidden]')) focusBeforeDialog.focus({preventScroll:true});
  }
  $("#q-dialog-cancel").addEventListener("click", closeDialog);
  $("#q-confirm").addEventListener("click", () => {const fn = dialogCallback; closeDialog(); fn?.();});
  $("#q-dialog-backdrop").addEventListener("click", event => {if (event.target === event.currentTarget) closeDialog();});

  function updateTask(id, patch) {
    const task = getTask(id);
    if (!task || !patch || typeof patch !== "object") return false;
    for (const [key,value] of Object.entries(patch)) {
      if (!["title","state","stage","progress","seconds","error"].includes(key)) return false;
      if (["title","stage","error"].includes(key) && (typeof value !== "string" || value.length > 500)) return false;
      if (key === "state" && !Object.hasOwn(stateLabels,value)) return false;
      if (key === "progress" && (!Number.isFinite(value) || value < 0 || value > 100)) return false;
      if (key === "seconds" && (!Number.isFinite(value) || value < 0)) return false;
    }
    Object.assign(task, patch);
    renderTask(task);
    updateQueueButtons();
    recalculateSummary();
    updateScrollbar();
    return true;
  }
  function moveTask(id, direction) {
    const task = getTask(id), queued = tasks.filter(item => item.state === "queued");
    const index = queued.indexOf(task), other = queued[index + direction];
    if (!other || !emit("reorder", {id, beforeId: direction<0 ? other.id : null, afterId: direction>0 ? other.id : null})) return;
    const a = tasks.indexOf(task), b = tasks.indexOf(other);
    [tasks[a], tasks[b]] = [tasks[b], tasks[a]];
    refreshList();
    notify("Порядок демонстрационных задач изменён.");
  }
  function showTask(task) {
    showDialog({title:"Сведения о задаче", text:`${task.title}\n\nСостояние: ${stateLabels[task.state]}\nЭтап: ${task.stage}\nПрогресс: ${task.progress}%\nВремя: ${formatTime(task.seconds)}`+
      (task.error?`\n\n${task.error}`:"")+"\n\nЭто демонстрационные данные. Локальные файлы, GPU и сервер не проверяются.", informational:true});
  }
  function retry(task) {
    if (!emit("retry", {id:task.id})) return;
    updateTask(task.id, {state:"queued", stage:"ProjectValidationPublication", progress:0, seconds:0});
    notify("Задача поставлена в демонстрационную очередь. Реальная обработка не запускалась.");
  }
  function stop(task) {
    if (!emit("stop-request", {id:task.id})) return;
    showDialog({title:"Остановить обработку?", text:"В макете изменится только состояние этой задачи. Реальный процесс не запущен, файлы не затрагиваются.", confirm:"Остановить", onConfirm:() => {
      if (!emit("stop", {id:task.id})) return;
      updateTask(task.id, {state:"cancelled"});
      notify("Демонстрационная задача остановлена.");
    }});
  }
  function remove(task) {
    showDialog({title:"Убрать задачу из списка?", text:"Будет удалена только карточка из этого HTML. Файлы на компьютере останутся без изменений.", confirm:"Убрать", onConfirm:() => {
      if (!emit("remove", {id:task.id})) return;
      tasks = tasks.filter(item => item.id !== task.id);
      refreshList();
    }});
  }
  const actions = {
    folder: task => {if (emit("folder", {id:task.id})) notify("Открытие папки подключается из приложения A&D Voice. Макет не имеет доступа к вашим папкам.");},
    play: task => {if (emit("play", {id:task.id})) notify("У демонстрационной задачи нет аудиофайла. Воспроизведение подключается из приложения.");},
    retry, stop,
    up: task => moveTask(task.id,-1), down: task => moveTask(task.id,1),
    details: showTask, remove
  };
  list.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");
    if (!button || button.disabled) return;
    const node = button.closest("[data-task]"), task = getTask(node?.dataset.task);
    if (!task) return;
    if (button.dataset.action === "menu") showMenu(button, task);
    else actions[button.dataset.action]?.(task);
  });
  $("#q-clear").addEventListener("click", () => {
    const completed = tasks.filter(task => task.state === "done");
    if (!completed.length || !emit("clear-completed-request", {ids:completed.map(task => task.id)})) return;
    showDialog({title:"Очистить завершённые задачи?", text:`Из списка будут убраны завершённые карточки (${completed.length}). Записи и файлы не удаляются.`, confirm:"Очистить", onConfirm:() => {
      if (!emit("clear-completed", {ids:completed.map(task => task.id)})) return;
      tasks = tasks.filter(task => task.state !== "done");
      refreshList();
      notify("Завершённые карточки убраны из списка. Файлы не затронуты.");
    }});
  });
  $("#q-storage-info").addEventListener("click", () => showDialog({title:"Место на диске", text:"42.7 GB / 232 GB — подпись из вашего образца, не измерение диска. Длина цветной полосы также сохранена по образцу.\n\nСводка в исходном заголовке повторяет изображение, хотя в нём показано 8 карточек. После действий со списком сводка пересчитывается по текущим задачам.", informational:true}));

  function hideMenu(restore = true) {
    $("#q-menu").hidden = true;
    menuTrigger?.setAttribute("aria-expanded", "false");
    if (restore && menuTrigger?.isConnected) menuTrigger.focus({preventScroll:true});
    menuTrigger = null;
  }
  function menuButton(text, iconName, fn, danger = false) {
    const button = document.createElement("button");
    button.type = "button"; button.className = "q-menu-item"; button.setAttribute("role","menuitem");
    if (danger) button.dataset.danger = "true";
    const icon = svg("svg", {class:"q-icon", "aria-hidden":"true"});
    icon.append(svg("use", {href:`#q-i-${iconName}`}));
    const label = document.createElement("span"); label.textContent = text;
    button.append(icon,label);
    button.addEventListener("click", () => {hideMenu(); fn();});
    return button;
  }
  function showMenu(trigger, task) {
    if (menuTrigger === trigger && !$("#q-menu").hidden) {hideMenu(); return;}
    hideMenu(false); menuTrigger = trigger;
    trigger.setAttribute("aria-expanded","true");
    const menu = $("#q-menu");
    menu.replaceChildren(menuButton("Сведения о задаче", "info", () => showTask(task)));
    if (["error","cancelled"].includes(task.state)) menu.append(menuButton("Повторить", "refresh", () => retry(task)));
    if (task.state === "processing") menu.append(menuButton("Остановить", "stop", () => stop(task)));
    menu.append(menuButton(motion ? "Приостановить анимации" : "Включить анимации", "motion", () => setMotion(!motion)));
    const separator = document.createElement("div"); separator.className = "q-menu-separator"; menu.append(separator);
    menu.append(menuButton("Убрать из списка", "trash", () => remove(task), true));
    menu.hidden = false;
    const a = trigger.getBoundingClientRect(), b = modal.getBoundingClientRect(), scale = b.width/modal.offsetWidth;
    const left = (a.right-b.left)/scale-menu.offsetWidth;
    let top = (a.bottom-b.top)/scale+7;
    if (top+menu.offsetHeight>modal.clientHeight-15) top = (a.top-b.top)/scale-menu.offsetHeight-7;
    menu.style.left = `${clamp(left,12,modal.clientWidth-menu.offsetWidth-12)}px`;
    menu.style.top = `${clamp(top,12,modal.clientHeight-menu.offsetHeight-12)}px`;
    $("button",menu).focus({preventScroll:true});
  }
  document.addEventListener("pointerdown", event => {if (!$("#q-menu").hidden && !event.target.closest('#q-menu,[data-action="menu"]')) hideMenu(false);});
  list.addEventListener("scroll", () => {hideMenu(false); updateScrollbar();}, {passive:true});

  // A real custom scrollbar. A shorter visual thumb follows the supplied screenshot,
  // while its position and travel are always calculated from the actual scroll area.
  const rail = $("#q-scrollbar"), thumb = $("#q-scrollbar-thumb");
  let drag = null;
  function scrollMetrics() {
    const max = Math.max(0,list.scrollHeight-list.clientHeight), h = rail.clientHeight;
    const length = max ? Math.max(32,Math.min(h-2,h*.225)) : h-2;
    return {max, length, travel:Math.max(0,h-length-2)};
  }
  function updateScrollbar() {
    const m = scrollMetrics();
    thumb.style.height = `${m.length}px`;
    thumb.style.top = `${1+(m.max?list.scrollTop/m.max*m.travel:0)}px`;
    rail.setAttribute("aria-valuenow",String(Math.round(m.max?list.scrollTop/m.max*100:0)));
    rail.setAttribute("aria-disabled",String(m.max===0));
    rail.style.opacity = m.max ? "1" : ".25";
  }
  rail.addEventListener("pointerdown", event => {
    const m = scrollMetrics(); if (event.button!==0 || !m.max) return;
    event.preventDefault(); rail.setPointerCapture(event.pointerId);
    const box = rail.getBoundingClientRect(), scale = box.height/rail.clientHeight;
    const y = (event.clientY-box.top)/scale, top = list.scrollTop/m.max*m.travel;
    if (y<top || y>top+m.length) list.scrollTop = clamp((y-m.length/2)/m.travel,0,1)*m.max;
    drag = {y:event.clientY, start:list.scrollTop, scale};
  });
  rail.addEventListener("pointermove", event => {
    if (!drag) return;
    const m = scrollMetrics(); list.scrollTop = drag.start+(event.clientY-drag.y)/drag.scale/Math.max(1,m.travel)*m.max;
  });
  ["pointerup","pointercancel","lostpointercapture"].forEach(name => rail.addEventListener(name,() => {drag=null;}));
  rail.addEventListener("wheel", event => {if (!scrollMetrics().max) return; event.preventDefault(); list.scrollTop+=event.deltaY;}, {passive:false});
  rail.addEventListener("keydown", event => {
    const moves = {ArrowDown:35,ArrowUp:-35,PageDown:list.clientHeight*.85,PageUp:-list.clientHeight*.85,Home:-Infinity,End:Infinity};
    if (!Object.hasOwn(moves,event.key)) return;
    event.preventDefault(); const d=moves[event.key]; list.scrollTop = d===Infinity?list.scrollHeight:d===-Infinity?0:list.scrollTop+d;
  });
  const listObserver = new ResizeObserver(updateScrollbar);
  listObserver.observe(list);

  function setOpen(value) {
    opened = Boolean(value); modal.hidden = !opened; $("#q-reopen").hidden = opened;
    if (!opened) {hideMenu(false); closeDialog(); if(frameId!==null) cancelAnimationFrame(frameId); frameId=null;}
    previous = null;
    if (opened) {frames.forEach(item => item.sync()); updateScrollbar(); schedule(); $("#q-close").focus({preventScroll:true});}
    else $("#q-reopen").focus({preventScroll:true});
  }
  $("#q-close").addEventListener("click",() => {if (emit("close")) setOpen(false);});
  $("#q-reopen").addEventListener("click",() => setOpen(true));
  document.addEventListener("keydown", event => {
    if (!opened) return;
    if (event.key === "Escape") {
      event.preventDefault();
      if (!$("#q-dialog-backdrop").hidden) closeDialog();
      else if (!$("#q-menu").hidden) hideMenu();
      else setOpen(false);
      return;
    }
    if (!$("#q-menu").hidden && ["ArrowDown","ArrowUp","Home","End"].includes(event.key)) {
      event.preventDefault(); const buttons=$$("button",$("#q-menu")), index=buttons.indexOf(document.activeElement);
      const next=event.key==="Home"?0:event.key==="End"?buttons.length-1:(index+(event.key==="ArrowDown"?1:-1)+buttons.length)%buttons.length;
      buttons[next]?.focus();
    }
    if (event.key !== "Tab") return;
    const scope = $("#q-dialog-backdrop").hidden ? modal : $("#q-dialog");
    const targets=$$('button:not(:disabled), [tabindex="0"]',scope).filter(el=>!el.closest('[hidden],[inert]')&&el.getClientRects().length);
    const first=targets[0],last=targets[targets.length-1];
    if(event.shiftKey&&(document.activeElement===first||!scope.contains(document.activeElement))){event.preventDefault();last?.focus();}
    else if(!event.shiftKey&&(document.activeElement===last||!scope.contains(document.activeElement))){event.preventDefault();first?.focus();}
  });

  window.ProcessingQueueView = Object.freeze({
    referenceSize:Object.freeze({width:1064,height:1280}),
    getTasks:() => tasks.map(task=>({...task})),
    getSummary:() => ({reference:headerIsReference,text:$("#q-summary").textContent}),
    setTask:updateTask,
    setMotion,
    open:()=>setOpen(true), close:()=>setOpen(false),
    resetDemo() {tasks=initial.map(task=>({...task})); refreshList(); list.scrollTop=0; $("#q-summary").textContent=sourceSummary; headerIsReference=true;},
    seek(seconds) {
      if (!Number.isFinite(seconds)||seconds<0) return false;
      seeking=true; if(frameId!==null)cancelAnimationFrame(frameId);frameId=null;
      elapsed=seconds;previous=null;renderLights(seconds);
      for(const a of scene.getAnimations({subtree:true})){a.pause();a.currentTime=seconds*1000;}
      return true;
    },
    resume(){seeking=false;previous=null;for(const a of scene.getAnimations({subtree:true}))if(motion)a.play();schedule();}
  });
  updateQueueButtons();
  updateScrollbar();
  scene.dataset.ready = "true";
  addEventListener("pagehide", () => {
    destroyed=true;if(frameId!==null)cancelAnimationFrame(frameId);clearTimeout(toastTimer);
    listObserver.disconnect();frames.forEach(item=>item.observer.disconnect());
  },{once:true});
})();


};
