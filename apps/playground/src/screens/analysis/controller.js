/* Screen-specific interaction controller. Common rendering and border motion live in ADUI. */
export default function initialize(context) {
  const {document,window,requestAnimationFrame,cancelAnimationFrame,ResizeObserver,MutationObserver,
    setTimeout,clearTimeout,setInterval,clearInterval,addEventListener,removeEventListener,matchMedia,localStorage}=context;

(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const finite = value => typeof value === "number" && Number.isFinite(value);
  const scene = $("#pa-scene");
  const modal = $("#pa-modal");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const players = {
    original: { duration: 51, time: 0, muted: false, media: null, url: null },
    master: { duration: 231, time: 0, muted: false, media: null, url: null }
  };
  const state = {
    record: 4, count: 35, playing: null, open: true,
    motion: !reducedMotion.matches, explicitMotion: false
  };
  let raf = null, previous = null, lastPaint = 0, toastTimer = null;
  let dialogAction = null, previousFocus = null, demoNoticeShown = false;
  const emit = (name, detail) => window.dispatchEvent(new CustomEvent(`analysis:${name}`, {
    detail, cancelable: true
  }));

  function fit() {
    const scale = Math.min(1, document.documentElement.clientWidth / 1280, context.height / 1069);
    scene.style.setProperty("--pa-scale", String(scale));
    $("#pa-viewport").style.width = `${1280 * scale}px`;
    $("#pa-viewport").style.height = `${1069 * scale}px`;
  }
  addEventListener("resize", fit, { passive: true });
  fit();

  function setMotion(enabled, explicit = true) {
    state.motion = Boolean(enabled);
    if (explicit) state.explicitMotion = true;
    scene.dataset.motion = state.motion ? "on" : "off";
    scene.dataset.explicitMotion = state.explicitMotion && state.motion ? "on" : "off";
    $("#pa-motion").title = state.motion ? "Приостановить анимации" : "Включить анимации";
    $("#pa-motion").setAttribute("aria-label", $("#pa-motion").title);
    $("#pa-motion").setAttribute("aria-pressed", String(state.motion));
  }
  setMotion(state.motion, false);
  $("#pa-motion").addEventListener("click", () => setMotion(!state.motion));
  reducedMotion.addEventListener("change", event => {
    if (!state.explicitMotion) setMotion(!event.matches, false);
  });
  document.addEventListener("visibilitychange", () => {
    scene.dataset.hidden = String(document.hidden);
    if (document.hidden) pause();
  });

  function notify(message) {
    clearTimeout(toastTimer);
    $("#pa-toast").textContent = message;
    $("#pa-toast").hidden = false;
    toastTimer = setTimeout(() => { $("#pa-toast").hidden = true; }, 3600);
  }
  function formatTime(seconds) {
    const whole = Math.max(0, Math.floor(seconds));
    return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
  }
  function renderPlayer(kind) {
    const p = players[kind], active = state.playing === kind;
    const button = $(`[data-play="${kind}"]`);
    button.setAttribute("aria-pressed", String(active));
    button.setAttribute("aria-label", `${active ? "Приостановить" : "Воспроизвести"} ${kind === "original" ? "исходную запись" : "Studio Master"}`);
    $("#pa-time-" + kind).textContent = `${formatTime(p.time)} / ${formatTime(p.duration)}`;
    const input = $(`[data-seek="${kind}"]`);
    input.max = String(p.duration);
    input.value = String(p.time);
    input.setAttribute("aria-valuetext", `${formatTime(p.time)} из ${formatTime(p.duration)}`);
    const cursor = $(kind === "original" ? "#pa-red-cursor" : "#pa-gray-cursor");
    const width = kind === "original" ? 873 : 828;
    cursor.setAttribute("transform", `translate(${((width - 7) * p.time / Math.max(1, p.duration)).toFixed(2)} 0)`);
    cursor.setAttribute("opacity", kind === "original" || active || p.time > 0 ? "1" : "0");
  }
  function pause() {
    const wasPlaying = state.playing;
    if (wasPlaying && players[wasPlaying].media) players[wasPlaying].media.pause();
    state.playing = null;
    previous = null;
    if (raf !== null) cancelAnimationFrame(raf);
    raf = null;
    modal.classList.remove("is-playing");
    Object.keys(players).forEach(renderPlayer);
  }
  function tick(now) {
    raf = null;
    if (!state.playing) return;
    const kind = state.playing, p = players[kind];
    if (p.media) p.time = p.media.currentTime;
    else if (previous !== null) p.time = Math.min(p.duration, p.time + (now - previous) / 1000);
    previous = now;
    if (p.time >= p.duration) { p.time = p.duration; pause(); return; }
    if (now - lastPaint > 33) { renderPlayer(kind); lastPaint = now; }
    raf = requestAnimationFrame(tick);
  }
  async function play(kind) {
    if (!["original", "master"].includes(kind)) return;
    if (state.playing === kind) { pause(); return; }
    pause();
    const p = players[kind];
    if (p.time >= p.duration) p.time = 0;
    if (p.media) {
      try {
        p.media.currentTime = p.time;
        p.media.muted = p.muted;
        await p.media.play();
      } catch {
        notify("Браузер не смог воспроизвести этот аудиофайл.");
        return;
      }
    } else if (!demoNoticeShown) {
      notify("Демонстрация шкалы воспроизведения: аудиофайл к макету не подключён.");
      demoNoticeShown = true;
    }
    state.playing = kind;
    previous = null;
    modal.classList.add("is-playing");
    renderPlayer(kind);
    raf = requestAnimationFrame(tick);
    emit("play", {kind, demo: !p.media});
  }
  $$('[data-play]').forEach(button => button.addEventListener("click", () => play(button.dataset.play)));
  $$('[data-seek]').forEach(input => input.addEventListener("input", () => {
    const kind = input.dataset.seek, p = players[kind];
    p.time = clamp(Number(input.value), 0, p.duration);
    if (p.media) p.media.currentTime = p.time;
    renderPlayer(kind);
    emit("seek", {kind, seconds: p.time});
  }));
  $$('[data-mute]').forEach(button => button.addEventListener("click", () => {
    const kind = button.dataset.mute, p = players[kind];
    p.muted = !p.muted;
    if (p.media) p.media.muted = p.muted;
    button.setAttribute("aria-pressed", String(p.muted));
    button.setAttribute("aria-label", `${p.muted ? "Включить" : "Выключить"} звук ${kind === "original" ? "исходной записи" : "Studio Master"}`);
    button.title = p.muted ? "Включить звук" : "Выключить звук";
    emit("mute", {kind, muted: p.muted});
  }));

  function renderRecord() {
    $("#pa-record-index").textContent = `Запись ${state.record} из ${state.count} · анализируется`;
    $("#pa-prev").disabled = state.record <= 1;
    $("#pa-next").disabled = state.record >= state.count;
    const minutes = 5 + (state.record - 4) * 3;
    const date = new Date(2026, 8, 29, 12, minutes, 8);
    const two = n => String(n).padStart(2, "0");
    $("#pa-date").textContent = `29.09.2026, ${two(date.getHours())}:${two(date.getMinutes())}:08`;
  }
  function moveRecord(delta) {
    if (!emit("record-change", {from: state.record, to: clamp(state.record + delta, 1, state.count), demo: true})) return;
    pause();
    state.record = clamp(state.record + delta, 1, state.count);
    for (const p of Object.values(players)) p.time = 0;
    renderRecord();
    Object.keys(players).forEach(renderPlayer);
  }
  $("#pa-prev").addEventListener("click", () => moveRecord(-1));
  $("#pa-next").addEventListener("click", () => moveRecord(1));

  function showDialog(title, description, confirm, action) {
    previousFocus = document.activeElement;
    dialogAction = action;
    $("#pa-dialog-title").textContent = title;
    $("#pa-dialog-text").textContent = description;
    $("#pa-dialog-confirm").textContent = confirm;
    $("#pa-dialog-backdrop").hidden = false;
    $("#pa-content").inert = true;
    $(".pa-header").inert = true;
    $("#pa-dialog-cancel").focus();
  }
  function closeDialog() {
    $("#pa-dialog-backdrop").hidden = true;
    $("#pa-content").inert = false;
    $(".pa-header").inert = false;
    dialogAction = null;
    previousFocus?.focus({preventScroll: true});
  }
  $("#pa-dialog-cancel").addEventListener("click", closeDialog);
  $("#pa-dialog-confirm").addEventListener("click", () => {
    const action = dialogAction;
    closeDialog();
    action?.();
  });
  $("#pa-dialog-backdrop").addEventListener("click", event => {
    if (event.target === event.currentTarget) closeDialog();
  });
  $("#pa-delete").addEventListener("click", () => {
    showDialog("Удалить запись?", "В этом HTML изменится только демонстрационный список. Файлы на компьютере не удаляются.", "Удалить", () => {
      if (!emit("delete-record", {record: state.record, demo: true})) return;
      pause();
      if (state.count > 1) state.count--;
      state.record = Math.min(state.record, state.count);
      renderRecord();
      notify("Запись удалена из демонстрационного списка. Файлы не затронуты.");
    });
  });
  $("#pa-create").addEventListener("click", () => {
    if (!emit("create-master", {record: state.record, demo: true})) return;
    showDialog("A&D Studio Master", "Разделение дорожек, выравнивание громкости и создание мастер-версии выполняет приложение. В этом отдельном HTML аудиообработка не подключена.", "Понятно", null);
  });
  function setOpen(open) {
    state.open = Boolean(open);
    pause();
    if (!$("#pa-dialog-backdrop").hidden) closeDialog();
    modal.hidden = !state.open;
    scene.dataset.hidden = String(!state.open || document.hidden);
    $("#pa-reopen").hidden = state.open;
    if (state.open) $("#pa-close").focus({preventScroll: true});
    else $("#pa-reopen").focus();
  }
  $("#pa-done").addEventListener("click", () => { if (emit("done", {})) setOpen(false); });
  $("#pa-close").addEventListener("click", () => { if (emit("close", {})) setOpen(false); });
  $("#pa-reopen").addEventListener("click", () => setOpen(true));
  document.addEventListener("keydown", event => {
    if (!state.open) return;
    if (event.key === "Escape") {
      event.preventDefault();
      if (!$("#pa-dialog-backdrop").hidden) closeDialog();
      else setOpen(false);
    }
    if (event.key !== "Tab") return;
    const scope = $("#pa-dialog-backdrop").hidden ? modal : $("#pa-dialog");
    const focusable = $$('button:not(:disabled),input:not(:disabled),[tabindex="0"]', scope)
      .filter(element => !element.closest('[hidden],[inert]') && element.getClientRects().length);
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || !scope.contains(document.activeElement))) {
      event.preventDefault(); last?.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !scope.contains(document.activeElement))) {
      event.preventDefault(); first?.focus();
    }
  });

  // Procedural material only: these pixels come from seeded mathematical noise,
  // never from the reference photograph. SVG artwork underneath is the fallback.
  function paintMaterials() {
    let seed = 8319;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const table = Float32Array.from({length: 65536}, random);
    const noise = (x, y) => {
      const a = Math.floor(x), b = Math.floor(y);
      let u = x - a, v = y - b;
      u = u * u * (3 - 2 * u); v = v * v * (3 - 2 * v);
      const get = (i, j) => table[(i & 255) + ((j & 255) << 8)];
      const p = get(a, b), q = get(a + 1, b), r = get(a, b + 1), s = get(a + 1, b + 1);
      return (p + (q - p) * u) * (1 - v) + (r + (s - r) * u) * v;
    };
    const fbm = (x, y, octaves = 5) => {
      let value = 0, weight = .5;
      for (let i = 0; i < octaves; i++) {
        value += noise(x, y) * weight;
        x = x * 2.09 + 9.2; y = y * 2.03 - 4.3; weight *= .5;
      }
      return value;
    };
    const canvas = $("#pa-planet-texture"), ctx = canvas?.getContext("2d");
    if (ctx) {
      const width = canvas.width, height = canvas.height;
      const image = ctx.createImageData(width, height);
      for (let y = 0; y < height; y++) for (let x = 610; x < width; x++) {
        const dx = x - 568, dy = y - 571;
        const edge = 679 - Math.hypot(dx, dy);
        const n = fbm(x * .026, y * .032);
        const crag = fbm(x * .15 + n * 5, y * .17 - n * 7, 4);
        const ridge = Math.pow(1 - Math.abs(2 * crag - 1), 4);
        let red = 0, green = 0, blue = 0, alpha = clamp((x - 610) / 150, 0, 1);
        if (edge >= 0) {
          const light = .08 + .95 * Math.exp(-edge / 145);
          const crust = Math.max(0, n - .38) * 3.4 * ridge;
          const terrain = (8 + 95 * crust + n * 22) * light;
          const hot = Math.exp(-edge / 15);
          const white = Math.exp(-edge / 2.5);
          red = 4 + terrain * .69 + hot * 95 + white * 222;
          green = 6 + terrain * .19 + hot * 7 + white * 154;
          blue = 12 + terrain * .38 + hot * 29 + white * 169;
        } else {
          const hot = Math.exp(edge / 8.2);
          const dust = Math.max(0, crag - .6) * 65;
          red = 6 + hot * 182 + dust;
          green = 5 + hot * 28 + dust * .16;
          blue = 11 + hot * 61 + dust * .25;
          alpha *= clamp((65 + edge) / 40, 0, 1);
        }
        const index = (y * width + x) * 4;
        image.data[index] = red; image.data[index+1] = green; image.data[index+2] = blue; image.data[index+3] = alpha * 255;
      }
      ctx.putImageData(image, 0, 0);
      for (let i = 0; i < 1600; i++) {
        const x = 760 + random() * 470, y = random() * 130;
        const edge = 679 - Math.hypot(x - 568, y - 571);
        if (edge > 70 && random() > .12) continue;
        const bright = random(), r = .15 + bright * .62;
        ctx.fillStyle = `rgba(255,${40 + Math.floor(bright * 80)},${78 + Math.floor(bright * 65)},${.09 + bright * .46})`;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
      }
    }
    const landscape = $("#pa-terrain"), lc = landscape?.getContext("2d");
    if (lc) {
      const anchors = [[140,139],[215,78],[255,90],[286,98],[344,116],[426,107],[520,112],[620,131],[703,102],[735,67],[753,73],[783,49],[800,39],[809,53],[822,65],[850,86],[886,112],[920,120],[948,117],[977,99],[997,80],[1017,91],[1042,92],[1071,66],[1088,66],[1108,73],[1137,73],[1161,54],[1177,61]];
      const data = lc.createImageData(landscape.width, landscape.height);
      let segment = 0;
      for (let x = 141; x < landscape.width; x++) {
        while (segment + 2 < anchors.length && x > anchors[segment+1][0]) segment++;
        const [x0,y0] = anchors[segment], [x1,y1] = anchors[segment+1];
        const t = (x-x0)/(x1-x0);
        const ridgeY = y0 + (y1-y0)*t + (noise(x*.37,17)-.5)*5;
        for (let y = Math.floor(ridgeY); y < landscape.height; y++) {
          if (y < 0) continue;
          const n = fbm(x*.032, y*.06);
          const ridges = Math.pow(1-Math.abs(fbm(x*.21+n*4, y*.16-n*8, 4)*2-1),5);
          const depth = Math.max(0,y-ridgeY);
          const edgeLight = Math.exp(-depth/5.6);
          const light = clamp((.52-n)*3,0,1);
          const terrain = (ridgedValue(n,ridges)+edgeLight*10)*(.2+light*.65);
          const index=(y*landscape.width+x)*4;
          data.data[index]=3+terrain*1.05;
          data.data[index+1]=5+terrain*.27;
          data.data[index+2]=11+terrain*.58;
          data.data[index+3]=255*clamp((x-141)/65,0,1)*clamp((y-ridgeY)*1.5,0,1);
        }
      }
      function ridgedValue(n,ridges) { return 8+n*8+ridges*32; }
      lc.putImageData(data,0,0);
      const fallback = $(".pa-terrain-fallback");
      if (fallback) fallback.style.opacity = "0";
    }
  }
  try { paintMaterials(); } catch (error) {
    // Failure of an optional canvas context must not erase the inline SVG screen.
    console.warn("Optional procedural texture unavailable", error);
  }

  renderRecord();
  Object.keys(players).forEach(renderPlayer);
  window.AnalysisView = Object.freeze({
    referenceSize: Object.freeze({width: 1280, height: 1069}),
    open: () => setOpen(true), close: () => setOpen(false), setMotion,
    getState: () => ({...state, players: Object.fromEntries(Object.entries(players).map(([key,p]) => [key, {time:p.time, duration:p.duration, muted:p.muted, demo:!p.media}]))}),
    setScores(values) {
      const keys = ["pitch", "rhythm", "stability", "overall"];
      if (!values || typeof values !== "object" || Array.isArray(values) || keys.some(key => key in values && (!finite(values[key]) || values[key] < 0 || values[key] > 100))) return false;
      for (const key of keys) {
        if (!(key in values)) continue;
        const value = Math.round(values[key]);
        if (key === "overall") $("#pa-overall").textContent = String(value);
        else {
          $("#pa-" + key + "-value").textContent = `${value}%`;
          const bar = $(`[data-score="${key}"]`);
          bar.setAttribute("aria-valuenow", String(value));
          $("span", bar).style.setProperty("--pa-fill", `${value}%`);
        }
      }
      return true;
    },
    setAudio(kind, blob) {
      if (!["original", "master"].includes(kind) || !(blob instanceof Blob)) return false;
      pause();
      const p = players[kind];
      if (p.url) URL.revokeObjectURL(p.url);
      p.url = URL.createObjectURL(blob);
      p.media = new Audio(p.url);
      p.media.preload = "metadata";
      p.media.muted = p.muted;
      p.media.volume = .65;
      p.time = 0;
      p.media.addEventListener("loadedmetadata", () => {
        if (finite(p.media.duration) && p.media.duration > 0) p.duration = p.media.duration;
        renderPlayer(kind);
      });
      p.media.addEventListener("ended", () => { if (state.playing === kind) pause(); });
      p.media.addEventListener("error", () => { pause(); notify("Не удалось открыть аудиофайл."); });
      return true;
    },
    seekDecorations(seconds) {
      if (!finite(seconds) || seconds < 0) return false;
      scene.getAnimations({subtree:true}).forEach(animation => {
        animation.pause(); animation.currentTime = seconds * 1000;
      });
      return true;
    },
    resumeDecorations() {
      scene.getAnimations({subtree:true}).forEach(animation => animation.play());
    }
  });
  window.addEventListener("pagehide", () => {
    pause();
    clearTimeout(toastTimer);
    Object.values(players).forEach(p => { if (p.url) URL.revokeObjectURL(p.url); });
  }, {once: true});
  scene.dataset.ready = "true";
})();


};
