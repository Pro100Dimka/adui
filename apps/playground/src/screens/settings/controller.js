const cssRem = (value) =>
  `${value / (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16)}rem`;
/* Screen-specific interaction controller. Common rendering and border motion live in ADUI. */
export default function initialize(context) {
  const {
    document,
    window,
    requestAnimationFrame,
    cancelAnimationFrame,
    ResizeObserver,
    MutationObserver,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    addEventListener,
    removeEventListener,
    matchMedia,
    localStorage,
  } = context;

  (() => {
    "use strict";
    const $ = (s, root = document) => root.querySelector(s);
    const $$ = (s, root = document) => [...root.querySelectorAll(s)];
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const SVG_NS = "http://www.w3.org/2000/svg";
    const svg = (tag, attrs = {}) => {
      const el = document.createElementNS(SVG_NS, tag);
      for (const [name, value] of Object.entries(attrs))
        el.setAttribute(name, String(value));
      return el;
    };
    const scene = $("#scene");
    const modal = $("#settings");
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const params = new URLSearchParams(location.search);
    let motion = !reducedMotion.matches && !params.has("still");
    let motionExplicit = false;
    let elapsed = 0,
      previous = null,
      lastPaint = -Infinity,
      raf = null,
      seekMode = false;
    let modalOpen = true,
      dialogCallback = null,
      focusBeforeDialog = null,
      toastTimer = null;
    const storage = {
      freeGB: 92.2,
      usedGB: 36.8,
      totalGB: 128,
      cacheMB: 498,
      temporaryBytes: 0,
    };
    const diagnostics = [
      ["Python Backend", "Ready", "ok"],
      ["База данных", "Исправно", "ok"],
      ["AI runtime", "NVIDIA GeForce RTX 3060", "ok"],
      [
        "FFmpeg",
        "ffmpeg version 8.1.2-essentials_build-\nwww.gyan.dev Copyright (c) 2000-2026 the FFmpeg developers",
        "ok",
      ],
      ["AudioService", "Running", "ok"],
      ["XRuns / пропуски дедлайна", "0 / 0", "ok"],
      [
        "Подсветка клавиатуры",
        "Не поддерживается / нет совместимого устройства",
        "warning",
      ],
    ];
    const initialEvents = [
      [
        "30.09.2026, 13:24:13",
        "98bd121f-5de8-4c35-8519-dfb84af38c61",
        "AnalysisCompleted",
      ],
      [
        "30.09.2026, 13:23:01",
        "6aebe529-03b3-4398-96e3-a67bfabe1b71",
        "AnalysisCompleted",
      ],
      [
        "30.09.2026, 00:57:03",
        "6aebe529-03b3-4398-96e3-a67bfabe1b71",
        "RecordingRegistered",
      ],
      [
        "30.09.2026, 00:53:59",
        "e5a8826a-e968-4a82-8d7b-6b44ebedc9c2",
        "AnalysisCompleted",
      ],
      [
        "30.09.2026, 00:53:56",
        "e5a8826a-e968-4a82-8d7b-6b44ebedc9c2",
        "RecordingRegistered",
      ],
      [
        "30.09.2026, 00:43:47",
        "dc81e4eb-8198-4e3a-9d63-5e1c1d531fc3",
        "AnalysisCompleted",
      ],
    ];
    let events = [
      ...initialEvents,
      ...initialEvents.map((row, i) => [
        `29.09.2026, 22:${String(48 - i * 4).padStart(2, "0")}:12`,
        row[1],
        row[2],
      ]),
    ];
    let historyKind = "performances";
    let activeTab = ["appearance", "audio", "ai", "env", "advanced"].includes(
      params.get("tab"),
    )
      ? params.get("tab")
      : "ai";
    const emit = (name, detail) =>
      scene.dispatchEvent(
        new CustomEvent(`settings:${name}`, {
          detail,
          bubbles: true,
          cancelable: true,
        }),
      );

    // The reference coordinate system is scaled exactly once, including every border.
    function resizeScene() {
      const scale = Math.min(1, context.width / 1404, context.height / 1120);
      scene.style.setProperty("--ui-scale", String(scale));
      $("#viewport").style.width = cssRem(1404 * scale);
      $("#viewport").style.height = cssRem(1120 * scale);
    }
    addEventListener("resize", resizeScene, { passive: true });
    resizeScene();

    // Short pseudo-random / value-noise functions for the artwork; no image data is loaded.
    function random(seed) {
      return () => {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    const noiseTable = Float32Array.from({ length: 65536 }, random(7149));
    function noise(x, y) {
      const ix = Math.floor(x),
        iy = Math.floor(y);
      let fx = x - ix,
        fy = y - iy;
      fx = fx * fx * (3 - 2 * fx);
      fy = fy * fy * (3 - 2 * fy);
      const p = (a, b) => noiseTable[(a & 255) + ((b & 255) << 8)];
      const a = p(ix, iy),
        b = p(ix + 1, iy),
        c = p(ix, iy + 1),
        d = p(ix + 1, iy + 1);
      return (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy;
    }
    function fbm(x, y, count = 5) {
      let value = 0,
        amp = 0.5;
      for (let i = 0; i < count; i++) {
        value += noise(x, y) * amp;
        x = x * 2.07 + 13.2;
        y = y * 2.07 - 7.4;
        amp *= 0.5;
      }
      return value;
    }
    function star(ctx, x, y, r, bright = 1) {
      const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 7);
      glow.addColorStop(0, `rgba(255,203,211,${0.7 * bright})`);
      glow.addColorStop(0.18, `rgba(255,60,96,${0.44 * bright})`);
      glow.addColorStop(1, "rgba(255,17,64,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(x - r * 7, y - r * 7, r * 14, r * 14);
      ctx.fillStyle = `rgba(255,213,219,${bright})`;
      ctx.fillRect(x - 0.35, y - r * 3, 0.7, r * 6);
      ctx.fillRect(x - r * 3, y - 0.35, r * 6, 0.7);
    }
    function paintCosmos() {
      const canvas = $("#cosmos"),
        ctx = canvas.getContext("2d", { alpha: false });
      const low = document.createElement("canvas");
      low.width = 702;
      low.height = 560;
      const lc = low.getContext("2d"),
        image = lc.createImageData(702, 560);
      for (let row = 0; row < 560; row++)
        for (let column = 0; column < 702; column++) {
          const x = column * 2,
            y = row * 2;
          const warp = (fbm(x * 0.003, y * 0.003) - 0.48) * 125;
          const n = fbm(x * 0.012 + warp * 0.014, y * 0.012 - warp * 0.012);
          const vein =
            1 - Math.abs(2 * fbm(x * 0.017 + 2 * n, y * 0.017 + 3 * n) - 1);
          const band = Math.exp(
            -(
              ((y - (x * 0.5 - 198 + 44 * Math.sin(x * 0.013)) + warp) / 83) **
              2
            ),
          );
          const perimeter =
            Math.exp(-(((x + warp) / 65) ** 2)) +
            Math.exp(-(((1404 - x + warp) / 60) ** 2)) +
            0.7 * Math.exp(-(((1120 - y + warp) / 56) ** 2));
          const m = Math.min(1.25, band * 1.2 + perimeter);
          const thread = Math.pow(clamp((vein - 0.62) * 3, 0, 1), 3.6);
          const detail = fbm(x * 0.032 + warp * 0.06, y * 0.032, 4);
          const hot = Math.pow(clamp((detail - 0.37) * 3, 0, 1), 2.5) * thread;
          const lum =
            m *
            (5 +
              135 * Math.pow(n, 2.5) +
              155 * thread * Math.pow(n, 1.5) +
              220 * hot);
          const idx = (row * 702 + column) * 4;
          image.data[idx] = 5 + lum;
          image.data[idx + 1] = 3 + lum * 0.13;
          image.data[idx + 2] = 7 + lum * 0.28;
          image.data[idx + 3] = 255;
        }
      lc.putImageData(image, 0, 0);
      ctx.drawImage(low, 0, 0, 1404, 1120);
      const rand = random(70431);
      for (let i = 0; i < 2050; i++) {
        const x = rand() * 1404,
          y = rand() * 1120,
          r = 0.16 + rand() * 0.63;
        ctx.fillStyle = `rgba(255,${45 + Math.floor(rand() * 79)},${85 + Math.floor(rand() * 67)},${0.1 + rand() * 0.49})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      const inside = $("#modal-atmosphere"),
        ic = inside.getContext("2d");
      ic.drawImage(canvas, -31, -24);
      const shade = ic.createLinearGradient(0, 0, 0, 1063);
      shade.addColorStop(0, "rgba(0,0,3,.10)");
      shade.addColorStop(0.12, "rgba(0,0,3,.55)");
      shade.addColorStop(1, "rgba(0,0,3,.70)");
      ic.fillStyle = shade;
      ic.fillRect(0, 0, 1342, 1063);
      for (const [x, y, r, b] of [
        [29, 494, 2.4, 1],
        [1375, 794, 2, 1],
        [274, 1115, 1, 0.7],
        [885, 1087, 1.8, 0.7],
        [1324, 18, 1.4, 0.7],
        [6, 812, 1.8, 0.7],
        [1394, 865, 1.2, 0.6],
      ])
        star(ctx, x, y, r, b);
    }
    function paintPlanet() {
      const canvas = $("#planet"),
        ctx = canvas.getContext("2d");
      const w = canvas.width,
        h = canvas.height,
        s = w / 515,
        cx = 344 * s,
        cy = 290 * s,
        r = 302 * s;
      const image = ctx.createImageData(w, h);
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          const dx = (x - cx) / r,
            dy = (y - cy) / r,
            rad = Math.hypot(dx, dy),
            edge = (1 - rad) * r;
          const p = (y * w + x) * 4;
          if (rad > 1.12) continue;
          const illumination = clamp(0.48 - dx * 0.8 - dy * 0.3, 0.08, 1.2);
          if (rad > 1) {
            const a = Math.exp(-(rad - 1) * 88) * 0.58 * illumination;
            image.data[p] = 255;
            image.data[p + 1] = 40;
            image.data[p + 2] = 82;
            image.data[p + 3] = 255 * a;
            continue;
          }
          const z = Math.sqrt(1 - dx * dx - dy * dy);
          const n = fbm(dx * 18 + z * 7, dy * 21 + z * 5, 6);
          const crust = Math.pow(
            1 - Math.abs(noise(dx * 80 + 8 * n, dy * 80 + 8 * n) * 2 - 1),
            4,
          );
          const ridge = clamp((n - 0.38) * 5, 0, 1) * crust;
          const rim = Math.exp(-Math.max(0, edge) / (2.2 * s)) * illumination;
          const bloom = Math.exp(-Math.max(0, edge) / (15 * s)) * illumination;
          const shade = clamp(0.48 - dx * 0.78 - z * 0.55, 0.07, 0.95);
          const terrain = (10 + 61 * ridge + 26 * n) * shade;
          image.data[p] = terrain + rim * 239 + bloom * 75;
          image.data[p + 1] = terrain * 0.14 + rim * 165 + bloom * 8;
          image.data[p + 2] = terrain * 0.34 + rim * 183 + bloom * 25;
          image.data[p + 3] = 255;
        }
      ctx.putImageData(image, 0, 0);
      const rand = random(179);
      for (let i = 0; i < 180; i++) {
        const x = rand() * w,
          y = rand() * h;
        if (Math.hypot(x - cx, y - cy) > r || x > cx) continue;
        ctx.fillStyle = `rgba(255,65,99,${rand() * 0.3})`;
        ctx.fillRect(x, y, rand() * 1.8 + 0.3, 0.7);
      }
    }
    paintCosmos();
    paintPlanet();
    const art = $(".database-art"),
      dust = random(519);
    for (let i = 0; i < 65; i++)
      art.append(
        svg("circle", {
          cx: dust() * 170,
          cy: dust() * 179,
          r: 0.18 + dust() * 0.49,
          fill: "#ff436b",
          opacity: 0.1 + dust() * 0.5,
        }),
      );

    const frames = [];
    function paintFrame() {}

    context.installTabShapes();

    const waves = [];
    function installWaves(target, width, height, count, quiet = false) {
      const defs = svg("defs"),
        id = `${target.id}-fade`;
      const gradient = svg("linearGradient", { id });
      for (const [offset, color, opacity] of [
        [0, "#71152c", 0],
        [0.15, "#b7173e", 0.48],
        [0.54, "#ff4167", 0.8],
        [0.78, "#ff6482", 1],
        [1, "#ff325e", 0.56],
      ])
        gradient.append(
          svg("stop", { offset, "stop-color": color, "stop-opacity": opacity }),
        );
      defs.append(gradient);
      target.append(defs);
      const paths = Array.from({ length: count }, (_, i) => {
        const p = svg("path", {
          class: "wave",
          stroke: `url(#${id})`,
          "stroke-width": i === 9 ? 1.2 : 0.65,
          opacity: quiet ? 0.64 : 0.55 + (i % 5) * 0.09,
        });
        target.append(p);
        return p;
      });
      // Tiny fixed stars in the wave illustration, not an imported starfield.
      if (!quiet) {
        const rand = random(175);
        for (let i = 0; i < 65; i++)
          target.append(
            svg("circle", {
              cx: rand() * width,
              cy: rand() * height,
              r: 0.25 + rand() * 0.48,
              fill: "#fa4268",
              opacity: rand() * 0.6,
            }),
          );
        const starGroup = svg("g", {
          class: "sparkle",
          style: "--delay:-1.4s",
        });
        starGroup.append(
          svg("path", {
            d: "M343 23v14m-6-7h12",
            stroke: "#ffa1b5",
            "stroke-width": 0.6,
          }),
          svg("circle", { cx: 343, cy: 30, r: 1.2, fill: "#ffe3eb" }),
        );
        target.append(starGroup);
      }
      waves.push({ paths, width, height, quiet });
    }
    installWaves($("#history-waves"), 402, 187, 36);
    installWaves($("#about-waves"), 490, 98, 19, true);
    function paintWaves(time) {
      for (const { paths, width, height, quiet } of waves)
        paths.forEach((path, j) => {
          const lines = paths.length,
            step = width / 66,
            p = j / (lines - 1),
            base = height * 0.62;
          if (!quiet) {
            const phase = time * 0.7;
            const a = 18 * Math.sin(phase + j * 0.055),
              b =
                15 * Math.sin(phase + 1.5 + j * 0.05) -
                15 * Math.sin(1.5 + j * 0.05) +
                4 * Math.sin(j * 0.62);
            if (j < 21) {
              const q = j / 20;
              path.setAttribute(
                "d",
                `M-18 ${35 + q * 146 + a * 0.35} C36 ${-22 + q * 156 + a} 76 ${-7 + q * 155 + a} 136 ${67 + q * 92 + b}
                C201 ${165 - q * 35 + b} 262 ${146 - q * 33 - a * 0.6} 312 ${106 + q * 35 - a * 0.5}
                C352 ${65 + q * 101 + a * 0.5} 385 ${74 + q * 100 + a * 0.5} 418 ${133 + q * 43 + b}`,
              );
            } else {
              const q = (j - 21) / 14;
              path.setAttribute(
                "d",
                `M-18 ${122 + q * 63 + b} C67 ${39 + q * 78 + b} 136 ${48 + q * 74 + a * 0.6} 191 ${82 + q * 66 + a * 0.6}
                C248 ${122 + q * 58 - a * 0.5} 298 ${190 - q * 14 - a * 0.5} 355 ${188 - q * 10 + b * 0.3}
                C383 ${198 - q * 13 + b * 0.3} 402 ${187 - q * 8 + a * 0.25} 422 ${169 + q * 13 + a * 0.25}`,
              );
            }
            return;
          }
          let d = "";
          for (let i = 0; i <= 66; i++) {
            const x = i * step;
            const u = x / width;
            const drift = time * 0.51;
            const y = quiet
              ? height * 0.64 +
                Math.sin(u * 8.4 - drift + p * 2) * height * 0.22 +
                (p - 0.5) * height * 0.47
              : height * (0.405 + p * 0.49) -
                Math.cos(u * 7.6 - 1.05 + drift - p * 0.46) *
                  height *
                  (0.36 - p * 0.1) +
                Math.sin(u * 12.2 - drift * 0.64 + p * 3.8) * height * 0.07 +
                u * height * 0.28 * (1 - p);
            d += `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(2)}`;
          }
          path.setAttribute("d", d);
        });
    }
    function render(time) {
      frames.forEach((frame) => {
        if (!frame.element.closest("[hidden]")) paintFrame(frame, time);
      });
      if (activeTab === "advanced") paintWaves(time);
      if (activeTab === "audio") window.AudioSettingsArt?.paint(time);
      if (activeTab === "env") window.EnvironmentArt?.paint(time);
    }
    function tick(now) {
      raf = null;
      if (!motion || document.hidden || !modalOpen || seekMode) {
        previous = null;
        return;
      }
      if (previous !== null) elapsed += (now - previous) / 1000;
      previous = now;
      if (now - lastPaint >= 1000 / 30) {
        render(elapsed);
        lastPaint = now;
      }
      raf = requestAnimationFrame(tick);
    }
    function schedule() {
      if (raf === null && motion && !document.hidden && modalOpen && !seekMode)
        raf = requestAnimationFrame(tick);
    }
    function setMotion(enabled, explicit = true) {
      motion = Boolean(enabled);
      motionExplicit = explicit || motionExplicit;
      seekMode = false;
      scene.dataset.motion = motion ? "on" : "off";
      $("#motion-switch").checked = motion;
      scene.dispatchEvent(
        new CustomEvent("settings:motion", {
          bubbles: true,
          detail: { enabled: motion },
        }),
      );
      if (!motion && raf !== null) {
        cancelAnimationFrame(raf);
        raf = null;
      }
      previous = null;
      schedule();
    }
    setMotion(motion, false);
    render(0);
    document.addEventListener("visibilitychange", () => {
      scene.dataset.visibility = document.hidden ? "hidden" : "visible";
      if (document.hidden && raf !== null) {
        cancelAnimationFrame(raf);
        raf = null;
      }
      previous = null;
      schedule();
    });
    reducedMotion.addEventListener("change", (event) => {
      if (!motionExplicit) setMotion(!event.matches, false);
    });

    function notify(message) {
      clearTimeout(toastTimer);
      $("#toast").textContent = message;
      $("#toast").hidden = false;
      toastTimer = setTimeout(() => {
        $("#toast").hidden = true;
      }, 4200);
    }
    function renderDiagnostics() {
      const fragment = document.createDocumentFragment();
      diagnostics.forEach(([name, value, status], i) => {
        const row = document.createElement("div");
        row.className = `diagnostic-row${i === 3 ? " diagnostic-row--ffmpeg" : ""}${i === 6 ? " diagnostic-row--last" : ""}`;
        const icon = svg("svg", {
          class: `icon status status--${status}`,
          "aria-label": status === "ok" ? "В порядке" : "Предупреждение",
          role: "img",
        });
        icon.append(
          svg("use", { href: status === "ok" ? "#i-check" : "#i-warning" }),
        );
        const dt = document.createElement("dt"),
          dd = document.createElement("dd");
        dt.textContent = name;
        String(value)
          .split("\n")
          .forEach((line, n) => {
            if (n) dd.append(document.createElement("br"));
            dd.append(document.createTextNode(line));
          });
        row.append(icon, dt, dd);
        fragment.append(row);
      });
      $("#diagnostic-list").replaceChildren(fragment);
    }
    renderDiagnostics();
    function renderHistory() {
      const rows =
        historyKind === "processing"
          ? events.filter((row) => row[2].startsWith("Analysis"))
          : events;
      const fragment = document.createDocumentFragment();
      rows.forEach((row) => {
        const tr = document.createElement("tr");
        row.forEach((value) => {
          const td = document.createElement("td");
          td.textContent = value;
          td.title = value;
          tr.append(td);
        });
        fragment.append(tr);
      });
      $("#history-body").replaceChildren(fragment);
      $("#history-scroll").scrollTop = 0;
      $("#history-scroll").setAttribute(
        "aria-labelledby",
        historyKind === "processing" ? "processing-tab" : "performance-tab",
      );
      $$("[data-history]").forEach((button) => {
        const active = button.dataset.history === historyKind;
        button.setAttribute("aria-selected", String(active));
        button.tabIndex = active ? 0 : -1;
      });
      requestAnimationFrame(updateScrollbars);
    }
    $$("[data-history]").forEach((button) =>
      button.addEventListener("click", () => {
        historyKind = button.dataset.history;
        renderHistory();
      }),
    );
    $$(".history-tabs, .tabs").forEach((tablist) =>
      tablist.addEventListener("keydown", (event) => {
        const tabs = $$('[role="tab"]', tablist);
        const index = tabs.indexOf(document.activeElement);
        if (
          index < 0 ||
          !["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)
        )
          return;
        event.preventDefault();
        const next =
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? tabs.length - 1
              : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) %
                tabs.length;
        tabs[next].focus();
        if (tablist.classList.contains("history-tabs")) tabs[next].click();
      }),
    );
    function activateTab(tab) {
      if (!["appearance", "audio", "ai", "env", "advanced"].includes(tab))
        return false;
      activeTab = tab;
      scene.dataset.activeTab = tab;
      $("#advanced-content").hidden = tab !== "advanced";
      $(".scroll-rail--main").hidden = tab !== "advanced";
      $("#appearance-content").hidden = tab !== "appearance";
      $(".appearance-footer").hidden = tab !== "appearance";
      $("#audio-content").hidden = tab !== "audio";
      $(".audio-footer").hidden = tab !== "audio";
      $("#ai-content").hidden = tab !== "ai";
      $("#env-content").hidden = tab !== "env";
      $$(".tabs .tab").forEach((button) => {
        const selected = button.dataset.tab === tab;
        button.setAttribute("aria-selected", String(selected));
        button.tabIndex = selected ? 0 : -1;
      });
      document.title = `A&D Voice — Настройки · ${{ appearance: "Внешний вид", audio: "Аудио", ai: "AI / Обработка", env: "Ключи ENV", advanced: "Дополнительно" }[tab]}`;
      requestAnimationFrame(() => {
        render(elapsed);
        updateScrollbars();
      });
      emit("tab-change", { tab });
      return true;
    }
    $$("[data-tab]").forEach((button) =>
      button.addEventListener("click", () => {
        const tab = button.dataset.tab;
        if (activeTab === tab || !emit("navigate", { tab })) return;
        if (!activateTab(tab))
          notify(
            `«${button.textContent.trim()}»: для этой вкладки в макете нет содержимого.`,
          );
      }),
    );

    // These custom thumbs are attached to genuine scrollable areas; dragging, wheel,
    // keyboard and clicks all move the associated content. Thumb travel is measured.
    const scrollbars = [];
    function updateScrollbars() {
      scrollbars.forEach((item) => item.update());
    }
    $$(".scroll-rail").forEach((rail) => {
      const content = document.getElementById(
          rail.getAttribute("aria-controls"),
        ),
        thumb = $(".scroll-thumb", rail);
      let dragging = null;
      const metrics = () => {
        const h = rail.clientHeight,
          max = Math.max(0, content.scrollHeight - content.clientHeight);
        const ratio = content.clientHeight / Math.max(1, content.scrollHeight);
        // Cap the decorative thumb to match the reference skin, without changing travel.
        const cap = rail.classList.contains("scroll-rail--main") ? 0.365 : 0.54;
        const thumbHeight = Math.max(
          28,
          Math.min(h - 2, h * Math.min(cap, ratio)),
        );
        return {
          h,
          max,
          thumbHeight,
          travel: Math.max(0, h - thumbHeight - 2),
        };
      };
      const update = () => {
        const { max, thumbHeight, travel } = metrics();
        thumb.style.height = cssRem(thumbHeight);
        thumb.style.transform = `translateY(${(max ? (content.scrollTop / max) * travel : 0) / 16}rem)`;
        rail.setAttribute(
          "aria-valuenow",
          String(Math.round(max ? (content.scrollTop / max) * 100 : 0)),
        );
        rail.setAttribute("aria-disabled", String(max === 0));
      };
      rail.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) return;
        const m = metrics();
        if (!m.max) return;
        event.preventDefault();
        rail.focus({ preventScroll: true });
        rail.setPointerCapture(event.pointerId);
        const scale = rail.getBoundingClientRect().height / rail.clientHeight;
        const y = (event.clientY - rail.getBoundingClientRect().top) / scale;
        const top = (content.scrollTop / m.max) * m.travel;
        if (y < top || y > top + m.thumbHeight)
          content.scrollTop =
            clamp((y - m.thumbHeight / 2) / m.travel, 0, 1) * m.max;
        dragging = { y: event.clientY, scroll: content.scrollTop, scale };
      });
      rail.addEventListener("pointermove", (event) => {
        if (!dragging) return;
        const m = metrics();
        content.scrollTop =
          dragging.scroll +
          ((event.clientY - dragging.y) /
            dragging.scale /
            Math.max(1, m.travel)) *
            m.max;
      });
      const end = () => {
        dragging = null;
      };
      rail.addEventListener("pointerup", end);
      rail.addEventListener("pointercancel", end);
      rail.addEventListener("lostpointercapture", end);
      rail.addEventListener(
        "wheel",
        (event) => {
          if (!metrics().max) return;
          event.preventDefault();
          content.scrollTop += event.deltaY;
        },
        { passive: false },
      );
      rail.addEventListener("keydown", (event) => {
        const deltas = {
          ArrowDown: 36,
          ArrowUp: -36,
          PageDown: content.clientHeight * 0.85,
          PageUp: -content.clientHeight * 0.85,
          Home: -Infinity,
          End: Infinity,
        };
        if (!(event.key in deltas)) return;
        event.preventDefault();
        const d = deltas[event.key];
        content.scrollTop =
          d === Infinity
            ? content.scrollHeight
            : d === -Infinity
              ? 0
              : content.scrollTop + d;
      });
      content.addEventListener("scroll", update, { passive: true });
      new ResizeObserver(update).observe(content);
      scrollbars.push({ update });
      update();
    });
    renderHistory();

    function updateStorage() {
      $("#free-space").textContent = `${storage.freeGB.toFixed(1)} GB`;
      $("#used-space").textContent =
        `${storage.usedGB.toFixed(1)} GB из ${storage.totalGB} GB`;
      $("#cache-space").textContent = storage.cacheMB
        ? `${storage.cacheMB} MB`
        : "0 B";
      $("#temporary-space").textContent = storage.temporaryBytes
        ? `${storage.temporaryBytes} B`
        : "0 B";
      $("#storage-fill").style.width =
        `${clamp((storage.usedGB / storage.totalGB) * 100, 0, 100)}%`;
      $("#storage-track").setAttribute("aria-valuenow", String(storage.usedGB));
      $("#storage-track").setAttribute(
        "aria-valuemax",
        String(storage.totalGB),
      );
    }
    function openDialog(title, description, callback = null, isAbout = false) {
      focusBeforeDialog = document.activeElement;
      dialogCallback = callback;
      $("#dialog-title").textContent = title;
      $("#dialog-description").textContent = description;
      $("#demo-code").hidden = true;
      $("#dialog-cancel").textContent = "Отмена";
      $("#motion-option").hidden = !isAbout;
      $("#dialog-cancel").hidden = isAbout;
      $("#dialog-confirm").textContent = isAbout ? "Готово" : "Подтвердить";
      $("#dialog-confirm").classList.toggle("danger", !isAbout);
      $("#dialog-backdrop").hidden = false;
      $$(
        ".header,.tabs,.content-scroll,.scroll-rail--main,.appearance-footer,.audio-footer",
        modal,
      ).forEach((el) => {
        el.inert = true;
      });
      (isAbout ? $("#motion-switch") : $("#dialog-cancel")).focus();
    }
    function closeDialog() {
      $("#dialog-backdrop").hidden = true;
      dialogCallback = null;
      $$(
        ".header,.tabs,.content-scroll,.scroll-rail--main,.appearance-footer,.audio-footer",
        modal,
      ).forEach((el) => {
        el.inert = false;
      });
      focusBeforeDialog?.focus({ preventScroll: true });
    }
    $("#dialog-cancel").addEventListener("click", closeDialog);
    $("#dialog-confirm").addEventListener("click", () => {
      const callback = dialogCallback;
      closeDialog();
      callback?.();
    });
    $("#dialog-backdrop").addEventListener("click", (event) => {
      if (event.target === $("#dialog-backdrop")) closeDialog();
    });
    $("#about-button").addEventListener("click", () =>
      openDialog(
        "A&D Voice · HTML-макет",
        "Интерфейс по вашему изображению. Счётчики, события и состояние подсистем — демонстрационные; HTML не проверяет компьютер и не изменяет файлы на диске. Свечение, волны и иллюстрации нарисованы кодом.",
        null,
        true,
      ),
    );
    $("#motion-switch").addEventListener("change", (event) =>
      setMotion(event.target.checked),
    );
    $("#clear-cache").addEventListener("click", () => {
      if (!emit("action", { action: "clear-cache", demo: true })) return;
      openDialog(
        "Очистить кэш?",
        "Изменится только демонстрационный счётчик кэша в этом HTML. Файлы на вашем устройстве не удаляются.",
        () => {
          storage.usedGB = Math.max(0, storage.usedGB - storage.cacheMB / 1000);
          storage.freeGB += storage.cacheMB / 1000;
          storage.cacheMB = 0;
          updateStorage();
          notify("Демонстрационный кэш очищен. Файлы компьютера не затронуты.");
        },
      );
    });
    $("#clear-temporary").addEventListener("click", () => {
      if (!emit("action", { action: "clear-temporary", demo: true })) return;
      if (storage.temporaryBytes === 0) {
        notify("В демонстрационных данных временных файлов нет — 0 B.");
        return;
      }
      openDialog(
        "Удалить временные файлы?",
        "В этом макете сбрасывается только демонстрационный счётчик.",
        () => {
          storage.temporaryBytes = 0;
          updateStorage();
          notify("Демонстрационный счётчик сброшен.");
        },
      );
    });
    const report = () => ({
      demo: true,
      source: "User-provided design reference; not live device measurements",
      generatedAt: new Date().toISOString(),
      storage: { ...storage },
      diagnostics: diagnostics.map(([name, value, status]) => ({
        name,
        value,
        status,
      })),
    });
    async function copyText(value) {
      try {
        if (!navigator.clipboard?.writeText)
          throw new Error("No clipboard API");
        await navigator.clipboard.writeText(value);
        return true;
      } catch {
        const area = document.createElement("textarea");
        area.value = value;
        area.style.cssText = "position:fixed;left:-624.9375rem;top:0";
        document.body.append(area);
        area.select();
        let success = false;
        try {
          success = document.execCommand("copy");
        } catch {}
        area.remove();
        return success;
      }
    }
    $("#copy-diagnostics").addEventListener("click", async () => {
      const success = await copyText(JSON.stringify(report(), null, 2));
      notify(
        success
          ? "Демонстрационный отчёт скопирован."
          : "Браузер запретил копирование. Используйте «Экспортировать отчёт диагностики».",
      );
    });
    $("#export-diagnostics").addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(report(), null, 2)], {
        type: "application/json;charset=utf-8",
      });
      const url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download = "ad-voice-diagnostics-demo.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      notify("Сохранён демонстрационный отчёт — это не проверка компьютера.");
    });
    $("#refresh-diagnostics").addEventListener("click", () => {
      if (!emit("action", { action: "refresh-diagnostics", demo: true }))
        return;
      const button = $("#refresh-diagnostics");
      button.disabled = true;
      button.classList.add("is-working");
      // A visual demo acknowledgment, not an artificial timeout for a real device call.
      setTimeout(() => {
        renderDiagnostics();
        button.disabled = false;
        button.classList.remove("is-working");
        notify(
          "Демонстрационные данные обновлены. Проверка устройств не выполнялась.",
        );
      }, 650);
    });
    function setOpen(open) {
      modalOpen = Boolean(open);
      modal.hidden = !modalOpen;
      $("#reopen-settings").hidden = modalOpen;
      if (!modalOpen && raf !== null) {
        cancelAnimationFrame(raf);
        raf = null;
      }
      previous = null;
      scene.dispatchEvent(
        new CustomEvent("settings:open", {
          bubbles: true,
          detail: { open: modalOpen },
        }),
      );
      if (modalOpen) {
        schedule();
        requestAnimationFrame(() => {
          $("#close-settings").focus();
          updateScrollbars();
        });
      } else $("#reopen-settings").focus();
    }
    $("#close-settings").addEventListener("click", () => setOpen(false));
    $("#reopen-settings").addEventListener("click", () => setOpen(true));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modalOpen) {
        event.preventDefault();
        if (!$("#dialog-backdrop").hidden) closeDialog();
        else setOpen(false);
      }
      if (event.key !== "Tab" || !modalOpen) return;
      const scope = $("#dialog-backdrop").hidden ? modal : $("#action-dialog");
      const targets = $$(
        'button:not(:disabled),input:not(:disabled),select:not(:disabled),[tabindex="0"]',
        scope,
      ).filter(
        (el) =>
          el.tabIndex >= 0 &&
          el.type !== "file" &&
          !el.closest("[hidden],[inert]") &&
          el.getClientRects().length,
      );
      const first = targets[0],
        last = targets[targets.length - 1];
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          !scope.contains(document.activeElement))
      ) {
        event.preventDefault();
        last?.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !scope.contains(document.activeElement))
      ) {
        event.preventDefault();
        first?.focus();
      }
    });

    // Public, strictly local demo hooks. No data is fetched automatically.
    window.SettingsDemo = Object.freeze({
      referenceSize: Object.freeze({ width: 1404, height: 1120 }),
      setMotion,
      navigate: activateTab,
      getActiveTab: () => activeTab,
      notify,
      copyText,
      showDialog({
        title,
        description,
        confirm = "Подтвердить",
        cancel = "Отмена",
        code = false,
        onConfirm = null,
      }) {
        openDialog(title, description, onConfirm);
        $("#dialog-confirm").textContent = confirm;
        $("#dialog-cancel").textContent = cancel;
        $("#demo-code").hidden = !code;
      },
      open: () => setOpen(true),
      close: () => setOpen(false),
      getReport: report,
      setStorage(values) {
        if (!values || typeof values !== "object") return false;
        for (const [key, value] of Object.entries(values)) {
          if (
            !(key in storage) ||
            !Number.isFinite(value) ||
            value < 0 ||
            (key === "totalGB" && value === 0)
          )
            return false;
        }
        Object.assign(storage, values);
        updateStorage();
        return true;
      },
      setHistory(rows) {
        if (
          !Array.isArray(rows) ||
          rows.length > 1000 ||
          rows.some(
            (row) =>
              !Array.isArray(row) ||
              row.length !== 3 ||
              row.some((v) => typeof v !== "string"),
          )
        )
          return false;
        events = rows.map((row) => [...row]);
        renderHistory();
        return true;
      },
      // Deterministic, bounded preview capture / verification without external assets.
      seek(seconds) {
        if (!Number.isFinite(seconds) || seconds < 0) return false;
        seekMode = true;
        if (raf !== null) {
          cancelAnimationFrame(raf);
          raf = null;
        }
        elapsed = seconds;
        previous = null;
        render(seconds);
        for (const animation of document.getAnimations()) {
          animation.pause();
          animation.currentTime = seconds * 1000;
        }
        return true;
      },
      resume() {
        seekMode = false;
        for (const animation of document.getAnimations()) animation.play();
        previous = null;
        schedule();
      },
    });
    activateTab(activeTab);
    window.addEventListener(
      "pagehide",
      () => {
        if (raf !== null) cancelAnimationFrame(raf);
        clearTimeout(toastTimer);
      },
      { once: true },
    );
  })();

  (() => {
    "use strict";
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => [
      ...root.querySelectorAll(selector),
    ];
    const scene = $("#scene");
    const api = window.SettingsDemo;
    const clamp = (value, min = 0, max = 1) =>
      Math.max(min, Math.min(max, value));
    const emit = (name, detail) =>
      window.dispatchEvent(
        new CustomEvent(`appearance:${name}`, {
          detail,
          cancelable: true,
        }),
      );
    const defaults = {
      name: "BBB",
      language: "ru",
      station: "secret-agent",
      volume: 35,
      radio: true,
      reduceMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
      theme: "dark",
    };
    const store = "advoice-appearance-demo-v2";
    let saved = { ...defaults };
    let photoBitmap = null,
      savedPhoto = null,
      photoGeneration = 0;
    try {
      const value = JSON.parse(localStorage.getItem(store) || "null");
      if (value && typeof value === "object") {
        if (typeof value.name === "string")
          saved.name = value.name.slice(0, 48);
        if (["ru", "uk", "en"].includes(value.language))
          saved.language = value.language;
        if (
          ["secret-agent", "groove-salad", "drone-zone"].includes(value.station)
        )
          saved.station = value.station;
        if (Number.isFinite(value.volume))
          saved.volume = Math.round(clamp(value.volume, 0, 100));
        if (["dark", "light", "green", "violet"].includes(value.theme))
          saved.theme = value.theme;
        for (const key of ["radio", "reduceMotion"]) {
          if (typeof value[key] === "boolean") saved[key] = value[key];
        }
      }
    } catch {
      /* A file preview can disallow local storage. */
    }
    if (new URLSearchParams(location.search).has("still"))
      saved.reduceMotion = true;
    let draft = { ...saved };
    const cards = $$(".theme-card");
    const notify = api.notify;

    function random(seed) {
      return () => {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    const nt = Float32Array.from({ length: 65536 }, random(7149));
    function noise(x, y) {
      const ix = Math.floor(x),
        iy = Math.floor(y);
      let fx = x - ix,
        fy = y - iy;
      fx = fx * fx * (3 - 2 * fx);
      fy = fy * fy * (3 - 2 * fy);
      const a = nt[(ix & 255) + ((iy & 255) << 8)],
        b = nt[((ix + 1) & 255) + ((iy & 255) << 8)];
      const c = nt[(ix & 255) + (((iy + 1) & 255) << 8)],
        d = nt[((ix + 1) & 255) + (((iy + 1) & 255) << 8)];
      return (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy;
    }
    function fbm(x, y, count = 5) {
      let value = 0,
        amp = 0.5;
      for (let i = 0; i < count; i++) {
        value += noise(x, y) * amp;
        x = x * 2.03 + 13.2;
        y = y * 2.07 - 7.4;
        amp *= 0.5;
      }
      return value;
    }
    function glow(ctx, x, y, radius, color, alpha) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
      g.addColorStop(0, `rgba(${color},${alpha})`);
      g.addColorStop(1, `rgba(${color},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    function polygon(ctx, points, fill, stroke = null, width = 0.6) {
      ctx.beginPath();
      points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = width;
        ctx.stroke();
      }
    }
    function paintLandscape() {
      const canvas = $("#profile-landscape"),
        ctx = canvas.getContext("2d");
      if (!ctx) return;
      const w = canvas.width,
        h = canvas.height,
        s = w / 1220;
      const im = ctx.createImageData(w, h),
        cx = 1129,
        cy = 309,
        r = 346;
      for (let row = 0; row < h; row++)
        for (let column = 0; column < w; column++) {
          const x = column / s,
            y = row / s;
          const n = fbm(x * 0.012, y * 0.013 + 20),
            warp = fbm(x * 0.004, y * 0.005) * 70;
          const f = fbm(x * 0.025 + warp * 0.03, y * 0.032 + warp * 0.02),
            ridge =
              1 -
              Math.abs(2 * fbm(x * 0.026 + n * 5, y * 0.034 + n * 5, 5) - 1);
          const threads =
            Math.pow(clamp((ridge - 0.61) * 2.7), 4) *
            Math.pow(clamp((f - 0.33) * 3), 1.3);
          const horizon = Math.exp(
            -Math.pow((x - 820) / 160, 2) - Math.pow((y - 171) / 40, 2),
          );
          const cloud =
            Math.exp(-Math.pow((x - 830) / 340, 2)) *
            (8 + 32 * Math.pow(n, 2) + 95 * threads);
          let red = 6 + cloud + horizon * 170,
            green = 8 + cloud * 0.19 + horizon * 32,
            blue = 14 + cloud * 0.3 + horizon * 44;
          const dx = (x - cx) / r,
            dy = (y - cy) / r,
            rad = Math.hypot(dx, dy),
            e = (1 - rad) * r;
          const sideLight = clamp(0.18 - dx * 0.98 - dy * 0.15, 0.08, 1.3);
          if (rad <= 1) {
            const z = Math.sqrt(Math.max(0, 1 - dx * dx - dy * dy));
            const terrain = fbm(dx * 22 + z * 9, dy * 26 + z * 4, 6);
            const geology = fbm(
              dx * 78 + terrain * 9,
              dy * 82 + terrain * 7,
              3,
            );
            const vein =
              1 -
              Math.abs(
                fbm(dx * 83 + geology * 5, dy * 97 + geology * 5, 3) * 2 - 1,
              );
            const lava =
              Math.pow(clamp((vein - 0.66) * 2.9), 5) *
              Math.pow(clamp((terrain - 0.34) * 3.3), 1.6);
            const rim = Math.exp(-Math.max(0, e) / 2.15) * sideLight;
            const atmosphere = Math.exp(-Math.max(0, e) / 23) * sideLight;
            const face = clamp(0.5 - dx * 0.32 - z * 0.5, 0.12, 0.6);
            red =
              7 +
              face * (26 + 46 * terrain) +
              lava * 82 +
              rim * 238 +
              atmosphere * 166;
            green =
              8 +
              face * (17 + 12 * terrain) +
              lava * 5 +
              rim * 202 +
              atmosphere * 38;
            blue =
              16 +
              face * (21 + 18 * terrain) +
              lava * 14 +
              rim * 211 +
              atmosphere * 62;
          } else if (rad < 1.12) {
            const halo = Math.exp(e / 13) * sideLight;
            red += halo * 142;
            green += halo * 18;
            blue += halo * 34;
          }
          const i = (row * w + column) * 4;
          im.data[i] = red;
          im.data[i + 1] = green;
          im.data[i + 2] = blue;
          im.data[i + 3] = 255;
        }
      ctx.putImageData(im, 0, 0);
      ctx.save();
      ctx.scale(s, s);
      const rgen = random(840);
      for (let i = 0; i < 350; i++) {
        const x = 410 + rgen() * 810,
          y = rgen() * 168;
        if (Math.hypot(x - cx, y - cy) < r) continue;
        ctx.fillStyle = `rgba(255,${55 + Math.round(rgen() * 68)},${75 + Math.round(rgen() * 70)},${0.1 + rgen() * 0.4})`;
        ctx.beginPath();
        ctx.arc(x, y, 0.15 + rgen() * 0.57, 0, Math.PI * 2);
        ctx.fill();
      }
      glow(ctx, 828, 156, 96, "255,98,96", 0.26);
      glow(ctx, 828, 156, 38, "255,168,132", 0.4);
      const mountain = (points, base, color, line, seed) => {
        const rand = random(seed),
          fine = [];
        for (let i = 0; i < points.length - 1; i++) {
          const [x1, y1] = points[i],
            [x2, y2] = points[i + 1];
          fine.push([x1, y1]);
          for (let j = 1; j <= 3; j++) {
            const t = j / 4;
            fine.push([
              x1 + (x2 - x1) * t,
              y1 + (y2 - y1) * t + (rand() - 0.5) * 6,
            ]);
          }
        }
        fine.push(points.at(-1));
        polygon(ctx, [...fine, [1220, base], [0, base]], color);
        ctx.beginPath();
        fine.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.strokeStyle = line;
        ctx.lineWidth = 0.8;
        ctx.stroke();
        for (let i = 1; i < fine.length - 1; i++) {
          const [x, y] = fine[i];
          if (fine[i - 1][1] < y || fine[i + 1][1] < y) continue;
          const foot = [
            x + 8 + rand() * 27,
            Math.min(base + 8, y + 20 + rand() * 32),
          ];
          polygon(
            ctx,
            [fine[i - 1], [x, y], foot],
            `rgba(52,33,45,${0.12 + rand() * 0.26})`,
          );
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 5 + rand() * 8, y + 12 + rand() * 8);
          ctx.lineTo(...foot);
          ctx.strokeStyle = `rgba(192,49,69,${0.1 + rand() * 0.26})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      };
      mountain(
        [
          [0, 168],
          [410, 166],
          [475, 155],
          [518, 149],
          [548, 151],
          [582, 138],
          [610, 135],
          [650, 148],
          [697, 144],
          [725, 135],
          [749, 146],
          [768, 143],
          [788, 152],
          [825, 143],
          [843, 150],
          [868, 145],
          [891, 147],
          [918, 141],
          [945, 148],
          [989, 153],
          [1025, 149],
          [1100, 155],
          [1175, 144],
          [1220, 163],
        ],
        180,
        "#451320",
        "#ef56667a",
        716,
      );
      mountain(
        [
          [0, 169],
          [440, 168],
          [475, 153],
          [497, 151],
          [516, 138],
          [534, 123],
          [546, 128],
          [561, 114],
          [574, 112],
          [585, 100],
          [597, 94],
          [608, 96],
          [622, 113],
          [633, 113],
          [650, 132],
          [663, 121],
          [678, 117],
          [690, 129],
          [701, 141],
          [722, 145],
          [739, 155],
          [779, 158],
          [803, 148],
          [821, 153],
          [844, 149],
          [863, 145],
          [874, 135],
          [887, 129],
          [899, 128],
          [913, 140],
          [927, 145],
          [939, 144],
          [956, 151],
          [976, 154],
          [995, 164],
          [1110, 168],
          [1180, 152],
          [1202, 130],
          [1220, 132],
        ],
        181,
        "#080a10",
        "#7f2635a0",
        282,
      );
      ctx.restore();
    }

    paintLandscape();

    function paintAvatar() {
      const canvas = $("#avatar-photo"),
        ctx = canvas.getContext("2d");
      canvas.hidden = !photoBitmap;
      $("#avatar-letter").hidden = Boolean(photoBitmap);
      if (!photoBitmap || !ctx) return;
      const scale = Math.max(
        canvas.width / photoBitmap.width,
        canvas.height / photoBitmap.height,
      );
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        photoBitmap,
        (canvas.width - photoBitmap.width * scale) / 2,
        (canvas.height - photoBitmap.height * scale) / 2,
        photoBitmap.width * scale,
        photoBitmap.height * scale,
      );
    }
    function updateVolume() {
      $("#radio-volume").value = String(draft.volume);
      $("#radio-volume").style.setProperty("--level", `${draft.volume}%`);
      $("#volume-value").textContent = String(draft.volume);
    }
    function renderDraft() {
      $("#display-name").value = draft.name;
      $("#avatar-letter").textContent =
        Array.from(draft.name.trim())[0]?.toUpperCase() || "B";
      $("#language").value = draft.language;
      $("#station").value = draft.station;
      updateVolume();
      $("#radio-enabled").checked = draft.radio;
      $("#radio-label").textContent = draft.radio
        ? "Радио включено"
        : "Радио выключено";
      $("#reduce-motion").checked = draft.reduceMotion;
      cards.forEach((card) => {
        const active = card.dataset.theme === draft.theme;
        card.setAttribute("aria-checked", String(active));
        card.tabIndex = active ? 0 : -1;
      });
      paintAvatar();
      api.setMotion(!draft.reduceMotion);
    }
    function discard() {
      photoGeneration++;
      draft = { ...saved };
      if (photoBitmap && photoBitmap !== savedPhoto) photoBitmap.close();
      photoBitmap = savedPhoto;
      renderDraft();
    }
    function selectTheme(card) {
      draft.theme = card.dataset.theme;
      cards.forEach((candidate) => {
        candidate.setAttribute("aria-checked", String(candidate === card));
        candidate.tabIndex = candidate === card ? 0 : -1;
      });
      emit("theme", { theme: draft.theme });
    }
    $("#display-name").addEventListener("input", (event) => {
      draft.name = event.target.value;
      $("#avatar-letter").textContent =
        Array.from(draft.name.trim())[0]?.toUpperCase() || "B";
    });
    $("#language").addEventListener("change", (event) => {
      draft.language = event.target.value;
      emit("language", { language: draft.language });
      notify("Язык выбран. Тексты этого макета оставлены как на образце.");
    });
    $("#station").addEventListener("change", (event) => {
      draft.station = event.target.value;
      emit("station", { station: draft.station });
    });
    $("#radio-volume").addEventListener("input", (event) => {
      draft.volume = Number(event.target.value);
      updateVolume();
      emit("volume", { value: draft.volume });
    });
    $("#radio-enabled").addEventListener("change", (event) => {
      draft.radio = event.target.checked;
      $("#radio-label").textContent = draft.radio
        ? "Радио включено"
        : "Радио выключено";
      emit("radio", { enabled: draft.radio });
    });
    $("#reduce-motion").addEventListener("change", (event) => {
      draft.reduceMotion = event.target.checked;
      api.setMotion(!draft.reduceMotion);
    });
    window.addEventListener("settings:motion", (event) => {
      draft.reduceMotion = !event.detail.enabled;
      $("#reduce-motion").checked = draft.reduceMotion;
    });
    window.addEventListener("settings:open", (event) => {
      if (!event.detail.open) {
        discard();
        emit("cancel", {});
      }
    });
    cards.forEach((card, i) => {
      card.addEventListener("click", () => selectTheme(card));
      card.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
          return;
        event.preventDefault();
        const next =
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? cards.length - 1
              : (i + (event.key === "ArrowRight" ? 1 : -1) + cards.length) %
                cards.length;
        selectTheme(cards[next]);
        cards[next].focus();
      });
    });
    $("#choose-photo").addEventListener("click", () =>
      $("#photo-input").click(),
    );
    $("#photo-input").addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;
      if (
        !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
        file.size > 10 * 1024 * 1024
      ) {
        notify("Выберите PNG, JPEG или WebP размером до 10 МБ.");
        return;
      }
      const generation = ++photoGeneration;
      try {
        const bitmap = await createImageBitmap(file);
        if (generation !== photoGeneration) {
          bitmap.close();
          return;
        }
        if (photoBitmap && photoBitmap !== savedPhoto) photoBitmap.close();
        photoBitmap = bitmap;
        paintAvatar();
        emit("photo", { file });
        notify("Фото открыто локально. В интернет ничего не отправляется.");
      } catch {
        notify("Не удалось прочитать выбранный файл.");
      }
    });
    $("#show-code").addEventListener("click", () => {
      api.showDialog({
        title: "Код переноса — демонстрация",
        description:
          "Это пример кода, а не ключ от настоящего аккаунта. В приложении реальный код нужно хранить в секрете.",
        confirm: "Копировать",
        cancel: "Закрыть",
        code: true,
        onConfirm: async () => {
          const copied = await api.copyText($("#demo-code").textContent);
          notify(
            copied
              ? "Демонстрационный код скопирован."
              : "Браузер запретил копирование. Откройте код и скопируйте его вручную.",
          );
        },
      });
    });
    $("#import-account").addEventListener("click", () => {
      const input = $("#transfer-code"),
        code = input.value.trim();
      if (!code) {
        input.focus();
        notify("Введите код переноса.");
        return;
      }
      if (emit("import-request", { code }))
        api.showDialog({
          title: "Перенос аккаунта",
          description:
            "Этот HTML — локальный макет. Он не проверяет настоящий код и не переносит аккаунт. Для этого нужно подключить сервис вашего приложения.",
          confirm: "Понятно",
        });
    });
    $("#reset").addEventListener("click", () =>
      api.showDialog({
        title: "Сбросить настройки?",
        description:
          "Будут восстановлены значения макета по умолчанию. Изменения применятся только после нажатия «Сохранить».",
        confirm: "Сбросить",
        onConfirm: () => {
          photoGeneration++;
          draft = { ...defaults };
          if (photoBitmap && photoBitmap !== savedPhoto) photoBitmap.close();
          photoBitmap = null;
          renderDraft();
        },
      }),
    );
    $("#save").addEventListener("click", () => {
      if (!draft.name.trim()) {
        $("#display-name").focus();
        notify("Введите имя для онлайн-комнаты.");
        return;
      }
      draft.name = draft.name.trim();
      saved = { ...draft };
      if (savedPhoto && savedPhoto !== photoBitmap) savedPhoto.close();
      savedPhoto = photoBitmap;
      let stored = true;
      try {
        localStorage.setItem(store, JSON.stringify(saved));
      } catch {
        stored = false;
      }
      emit("save", { ...saved, hasPhoto: Boolean(photoBitmap) });
      notify(
        stored
          ? "Настройки макета сохранены в этом браузере."
          : "Настройки сохранены на время этой сессии. Браузер запретил локальное хранилище.",
      );
    });
    $("#cancel").addEventListener("click", () => api.close());
    renderDraft();
    window.AppearanceDemo = Object.freeze({
      getState: () => ({ ...draft }),
      setOpen: (open) => (open ? api.open() : api.close()),
      setMotion: (enabled) => api.setMotion(enabled),
      navigate: api.navigate,
      seek: api.seek,
      resume: api.resume,
      referenceSize: { width: 1404, height: 1120 },
    });
    window.addEventListener(
      "pagehide",
      () => {
        photoGeneration++;
        if (photoBitmap && photoBitmap !== savedPhoto) photoBitmap.close();
        savedPhoto?.close();
      },
      { once: true },
    );
    scene.dataset.ready = "true";
  })();

  (() => {
    "use strict";
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => [
      ...root.querySelectorAll(selector),
    ];
    const api = window.SettingsDemo;
    const scene = $("#scene");
    const root = $("#audio-content");
    const ns = "http://www.w3.org/2000/svg";
    const clamp = (x, min, max) => Math.max(min, Math.min(max, x));
    const finite = (x) => typeof x === "number" && Number.isFinite(x);
    const positiveInteger = (x) => Number.isSafeInteger(x) && x > 0;
    const svg = (tag, attrs = {}) => {
      const node = document.createElementNS(ns, tag);
      Object.entries(attrs).forEach(([key, value]) =>
        node.setAttribute(key, String(value)),
      );
      return node;
    };
    const emit = (name, detail) =>
      window.dispatchEvent(
        new CustomEvent(`audio:${name}`, {
          detail,
          cancelable: true,
        }),
      );

    // VIEW FIXTURES ONLY. These values are not a device scan, recommendations, or
    // a claim that a particular WASAPI/ASIO driver accepts the listed periods.
    // A desktop integration replaces them with AudioSettingsDemo.setCapabilities().
    let capabilities = {
      drivers: [
        {
          id: "wasapi-shared",
          label: "WASAPI Shared",
          rates: [
            { rate: 44100, periods: [441, 882, 1323] },
            { rate: 48000, periods: [480, 960, 1440] },
            { rate: 96000, periods: [960, 1920, 2880] },
          ],
        },
        {
          id: "wasapi-exclusive",
          label: "WASAPI Exclusive",
          rates: [
            { rate: 44100, periods: [128, 256, 512, 1024] },
            { rate: 48000, periods: [128, 256, 512, 1024] },
          ],
        },
        {
          id: "asio",
          label: "ASIO",
          rates: [
            { rate: 44100, periods: [64, 128, 256, 512] },
            { rate: 48000, periods: [64, 128, 256, 512] },
          ],
        },
      ],
      inputs: [{ id: "default", label: "Системное по умолчанию" }],
      outputs: [{ id: "default", label: "Системное по умолчанию" }],
    };
    const defaults = Object.freeze({
      driver: "wasapi-shared",
      rate: 44100,
      period: 441,
      input: "default",
      output: "default",
      monitoring: true,
    });
    const storeKey = "advoice-audio-ui-demo-v1";
    let saved = { ...defaults };
    try {
      const value = JSON.parse(localStorage.getItem(storeKey) || "null");
      if (value && typeof value === "object") {
        for (const key of ["driver", "input", "output"]) {
          if (typeof value[key] === "string")
            saved[key] = value[key].slice(0, 128);
        }
        for (const key of ["rate", "period"]) {
          if (positiveInteger(value[key])) saved[key] = value[key];
        }
        if (typeof value.monitoring === "boolean")
          saved.monitoring = value.monitoring;
      }
    } catch {
      /* File previews may disallow localStorage; the current session still works. */
    }
    let draft = { ...saved };
    let metrics = {
      microphone: 100,
      noise: 0,
      estimatedMs: 30,
      hiddenMs: null,
      status: "Исправно",
      source: "demo",
    };
    let capabilitySource = "demo";
    let artTime = 0;
    const controls = Object.fromEntries(
      ["driver", "rate", "period", "input", "output"].map((key) => [
        key,
        $(`#audio-${key}`),
      ]),
    );

    function fillSelect(control, items, selected, emptyLabel) {
      const options = items.map(
        (item) => new Option(item.label, String(item.id)),
      );
      if (!options.length) options.push(new Option(emptyLabel, ""));
      control.replaceChildren(...options);
      control.disabled = !items.length;
      const next =
        items.find((item) => String(item.id) === String(selected)) || items[0];
      control.value = next ? String(next.id) : "";
      return next?.id ?? "";
    }

    function renderDraft() {
      draft.driver = fillSelect(
        controls.driver,
        capabilities.drivers,
        draft.driver,
        "Нет доступных драйверов",
      );
      const driver = capabilities.drivers.find(
        (item) => item.id === draft.driver,
      );
      draft.rate =
        Number(
          fillSelect(
            controls.rate,
            (driver?.rates || []).map((item) => ({
              id: item.rate,
              label: `${item.rate / 1000} кГц`,
            })),
            draft.rate,
            "Нет доступных частот",
          ),
        ) || 0;
      const format = driver?.rates.find((item) => item.rate === draft.rate);
      draft.period =
        Number(
          fillSelect(
            controls.period,
            (format?.periods || []).map((frames) => ({
              id: frames,
              label: `${frames} кадров`,
            })),
            draft.period,
            "Нет доступных периодов",
          ),
        ) || 0;
      draft.input = fillSelect(
        controls.input,
        capabilities.inputs,
        draft.input,
        "Нет устройств ввода",
      );
      draft.output = fillSelect(
        controls.output,
        capabilities.outputs,
        draft.output,
        "Нет устройств вывода",
      );
      $("#audio-monitor-toggle").setAttribute(
        "aria-checked",
        String(draft.monitoring),
      );
      $("#audio-monitor-well").dataset.enabled = String(draft.monitoring);
      $("#audio-monitor-copy").innerHTML = draft.monitoring
        ? "Слушайте входящий<br>сигнал в реальном<br>времени"
        : "Мониторинг<br>входящего сигнала<br>выключен";
      $("#audio-save").disabled = !(
        draft.driver &&
        draft.rate &&
        draft.period &&
        draft.input &&
        draft.output
      );
    }

    function renderMetrics() {
      for (const [key, value] of [
        ["mic", metrics.microphone],
        ["noise", metrics.noise],
      ]) {
        const gauge = $(`#audio-gauge-${key}`);
        gauge.setAttribute("aria-valuenow", String(value));
        gauge.setAttribute(
          "aria-label",
          `${key === "mic" ? "Микрофон" : "Шум"} — ${metrics.source === "demo" ? "демонстрационный уровень" : "уровень AudioService"}`,
        );
        $(".audio-gauge-value", gauge).textContent = `${Math.round(value)}%`;
        $$(
          ".gauge-value-arc, .gauge-glow, .gauge-moving-core, .gauge-moving-glow",
          gauge,
        ).forEach((path) => {
          path.style.strokeDasharray = `${value} 100`;
          path.setAttribute("pathLength", "100");
        });
        $(".gauge-moving-core", gauge).style.opacity = value ? ".96" : "0";
        $(".gauge-moving-glow", gauge).style.opacity = value ? ".85" : "0";
      }
      const latency = $("#audio-latency-value");
      latency.replaceChildren(
        document.createTextNode(
          metrics.estimatedMs === null
            ? "— "
            : `≈ ${Math.round(metrics.estimatedMs)} `,
        ),
      );
      const unit = document.createElement("span");
      unit.className = "unit";
      unit.textContent = "мс";
      latency.append(unit);
      latency.title =
        metrics.source === "demo"
          ? "Демонстрационные данные. Не замер устройства."
          : "Оценка задержки, переданная приложением.";
      $("#audio-health-text").textContent = metrics.status;
      $("#audio-latency-detail").textContent =
        `Скрытая задержка: ${metrics.hiddenMs === null ? "не измерена" : `${metrics.hiddenMs.toFixed(1)} мс`}`;
      $("#audio-demo-note").textContent =
        metrics.source === "runtime"
          ? "Данные аудиосервиса приложения"
          : capabilitySource === "runtime"
            ? "Устройства переданы приложением · уровни демонстрационные"
            : "Демонстрационный режим · устройства не подключены";
      $("#audio-monitor-well").setAttribute(
        "aria-description",
        metrics.source === "demo"
          ? "Иллюстрация мониторинга. Микрофон не подключён."
          : "Показатели переданы приложением.",
      );
    }

    for (const key of Object.keys(controls))
      controls[key].addEventListener("change", () => {
        draft[key] = ["rate", "period"].includes(key)
          ? Number(controls[key].value)
          : controls[key].value;
        renderDraft();
        emit("settings-change", {
          settings: { ...draft },
          demo: capabilitySource === "demo",
        });
      });
    $("#audio-monitor-toggle").addEventListener("click", () => {
      const enabled = !draft.monitoring;
      if (!emit("monitoring", { enabled, demo: metrics.source === "demo" }))
        return;
      draft.monitoring = enabled;
      renderDraft();
      if (metrics.source === "demo")
        api.notify(
          enabled
            ? "Мониторинг включён в макете. Микрофон не подключён; звук с него не воспроизводится."
            : "Мониторинг в макете выключен.",
        );
    });

    function showInfo(key) {
      const messages = {
        driver: [
          "Аудиодрайвер",
          "Список сейчас демонстрационный. Выбор не переключает драйвер Windows. В приложении доступные режимы и ограничения должен передать AudioService.",
        ],
        rate: [
          "Частота дискретизации",
          "Значение выбрано в локальном макете. Доступные частоты для реальных устройств должны приходить из аудиосервиса, а не из этого демонстрационного списка.",
        ],
        period: [
          "Период обработки",
          draft.rate && draft.period
            ? `Выбрано ${draft.period} кадров при ${draft.rate} Гц. Длительность этого блока — ${((1000 * draft.period) / draft.rate).toFixed(2)} мс. Это только пересчёт кадров во время, а не полная задержка и не измерение устройства. Список периодов в макете демонстрационный.`
            : "Аудиосервис не передал доступные параметры. Для выбора периода нужны данные о драйвере, формате и устройстве.",
        ],
        latency: [
          "Данные задержки",
          metrics.source === "demo"
            ? "30 мс, статус «Исправно» и уровни 100% / 0% взяты из макета. Этот HTML не измеряет задержку и не слушает микрофон. Реальные значения можно передать через AudioSettingsDemo.setMetrics()."
            : "Значения на экране переданы приложением. Сам интерфейс не проводит измерение и не добавляет к данным предполагаемые задержки.",
        ],
      };
      const [title, description] = messages[key] || messages.latency;
      api.showDialog({
        title,
        description,
        confirm: "Понятно",
        cancel: "Закрыть",
      });
    }
    $$("[data-audio-info]").forEach((button) =>
      button.addEventListener("click", () =>
        showInfo(button.dataset.audioInfo),
      ),
    );
    $("#audio-health").addEventListener("click", () => showInfo("latency"));
    $("#audio-measure").addEventListener("click", () => {
      if (
        !emit("measure-request", {
          settings: { ...draft },
          demo: metrics.source === "demo",
        })
      )
        return;
      api.showDialog({
        title: "Измерение задержки",
        description:
          "Для измерения нужен аудиосервис приложения. В этом HTML микрофон не подключается и измерение не выполняется — демонстрационные 30 мс не являются результатом теста.",
        confirm: "Понятно",
        cancel: "Закрыть",
      });
    });

    $("#audio-reset").addEventListener("click", () =>
      api.showDialog({
        title: "Сбросить настройки аудио?",
        description:
          "Будут восстановлены значения макета по умолчанию. Настройки устройств Windows не изменятся. Для сохранения выбора нажмите «Сохранить».",
        confirm: "Сбросить",
        onConfirm: () => {
          draft = { ...defaults };
          renderDraft();
          emit("reset", { settings: { ...draft }, demo: true });
        },
      }),
    );
    $("#audio-save").addEventListener("click", () => {
      renderDraft();
      if (
        $("#audio-save").disabled ||
        !emit("save", {
          settings: { ...draft },
          demo: capabilitySource === "demo",
        })
      )
        return;
      saved = { ...draft };
      let persisted = true;
      try {
        localStorage.setItem(storeKey, JSON.stringify(saved));
      } catch {
        persisted = false;
      }
      api.notify(
        persisted
          ? "Параметры макета сохранены в этом браузере. Настройки звуковых устройств не изменены."
          : "Параметры сохранены на время сессии. Браузер запретил локальное хранилище.",
      );
    });
    $("#audio-cancel").addEventListener("click", () => {
      draft = { ...saved };
      renderDraft();
      emit("cancel", {});
      api.close();
    });

    // A deliberately quiet, short browser test tone. It is not routed through the
    // native-driver choices above. No microphone permission is ever requested.
    let soundContext = null,
      voices = [],
      soundGeneration = 0;
    const testButton = $("#audio-test");
    function setPlaying(playing) {
      testButton.dataset.playing = String(playing);
      testButton.setAttribute("aria-pressed", String(playing));
      $(".audio-test-label", testButton).textContent = playing
        ? "Остановить тестовый звук"
        : "Воспроизвести тестовый звук";
      $(".icon use", testButton).setAttribute(
        "href",
        playing ? "#audio-i-stop" : "#audio-i-play",
      );
    }
    function stopTest() {
      soundGeneration++;
      for (const { oscillator, gain } of voices) {
        oscillator.onended = null;
        try {
          oscillator.stop();
        } catch {
          /* Already stopped. */
        }
        oscillator.disconnect();
        gain.disconnect();
      }
      voices = [];
      if (soundContext) {
        const context = soundContext;
        soundContext = null;
        context.close().catch(() => {});
      }
      setPlaying(false);
    }
    async function playTest() {
      if (soundContext) {
        stopTest();
        return;
      }
      if (
        !emit("test-request", { settings: { ...draft }, browserFallback: true })
      )
        return;
      const AudioContextType = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextType) {
        api.notify("В этом браузере недоступен тестовый звук.");
        return;
      }
      const generation = ++soundGeneration;
      try {
        const context = new AudioContextType();
        soundContext = context;
        setPlaying(true);
        await context.resume();
        if (generation !== soundGeneration) return;
        const start = context.currentTime + 0.025;
        let remaining = 2;
        [440, 660].forEach((frequency, index) => {
          const oscillator = context.createOscillator(),
            gain = context.createGain();
          const when = start + index * 0.4;
          oscillator.type = "sine";
          oscillator.frequency.value = frequency;
          gain.gain.setValueAtTime(0, when);
          gain.gain.linearRampToValueAtTime(0.022, when + 0.025);
          gain.gain.linearRampToValueAtTime(0.013, when + 0.14);
          gain.gain.linearRampToValueAtTime(0, when + 0.34);
          oscillator.connect(gain);
          gain.connect(context.destination);
          voices.push({ oscillator, gain });
          oscillator.onended = () => {
            if (generation === soundGeneration && --remaining === 0) stopTest();
          };
          oscillator.start(when);
          oscillator.stop(when + 0.36);
        });
        api.notify(
          "Тестовый звук воспроизводится через выход браузера, не через выбранный драйвер макета.",
        );
      } catch {
        if (generation === soundGeneration) {
          stopTest();
          api.notify(
            "Браузер не смог запустить звук. Проверьте разрешение на воспроизведение.",
          );
        }
      }
    }
    testButton.addEventListener("click", playTest);
    window.addEventListener("settings:tab-change", (event) => {
      if (event.detail.tab !== "audio") stopTest();
    });
    window.addEventListener("settings:open", (event) => {
      if (!event.detail.open) {
        stopTest();
        draft = { ...saved };
        renderDraft();
      }
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopTest();
    });
    window.addEventListener("pagehide", stopTest, { once: true });

    // Artwork: gradients and paths live in the same SVG coordinate system. The
    // moving light follows the actual arc rather than rotating around its own box.
    const rings = ["mic", "noise"].map((key, index) => {
      const gauge = $(`#audio-gauge-${key}`),
        arc = $(".gauge-value-arc", gauge);
      return {
        key,
        gauge,
        arc,
        length: arc.getTotalLength(),
        phase: index * 0.41,
        core: $(`#audio-gauge-${key}-glint`),
        aura: $(`#audio-gauge-${key}-aura`),
      };
    });
    function random(seed) {
      return () => {
        seed = (Math.imul(seed ^ (seed >>> 15), 1 | seed) + 0x6d2b79f5) | 0;
        return (seed >>> 0) / 4294967296;
      };
    }
    const waveSets = [];
    function installWave(id, width, height, count, phase) {
      const node = document.getElementById(id),
        defs = svg("defs");
      const color = svg("linearGradient", { id: `${id}-gradient` });
      [
        [0, "#6d112b", 0],
        [0.16, "#af153d", 0.35],
        [0.57, "#ff3b65", 0.74],
        [0.78, "#ff7b95", 0.85],
        [1, "#d91b43", 0.44],
      ].forEach(([offset, stopColor, opacity]) =>
        color.append(
          svg("stop", {
            offset,
            "stop-color": stopColor,
            "stop-opacity": opacity,
          }),
        ),
      );
      defs.append(color);
      node.append(defs);
      const paths = Array.from({ length: count }, (_, i) => {
        const path = svg("path", {
          fill: "none",
          stroke: `url(#${id}-gradient)`,
          "stroke-width": i === 5 ? 1 : 0.55,
          opacity: i === 5 ? 0.95 : 0.52,
        });
        node.append(path);
        return path;
      });
      const rand = random(7913 + Math.floor(phase * 713));
      for (let i = 0; i < Math.min(50, Math.floor(width / 8)); i++) {
        node.append(
          svg("circle", {
            cx: rand() * width,
            cy: rand() * height,
            r: 0.25 + rand() * 0.55,
            fill: "#ff6381",
            opacity: 0.16 + rand() * 0.42,
          }),
        );
      }
      waveSets.push({ paths, width, height, phase });
    }
    installWave("audio-header-waves", 1000, 97, 23, 0.9);
    installWave("audio-button-waves", 135, 50, 12, 3.2);
    installWave("audio-latency-waves", 440, 105, 23, 0.2);
    installWave("audio-levels-waves", 420, 105, 21, 1.7);
    installWave("audio-monitor-waves", 325, 105, 22, 2.8);
    const spectrum = $("#audio-monitor-spectrum");
    const spectrumDefs = svg("defs");
    spectrum.append(spectrumDefs);
    const spectrumColumns = Array.from({ length: 27 }, (_, index) => {
      const clip = svg("clipPath", { id: `audio-spectrum-clip-${index}` });
      const mask = svg("rect", {
        x: index * 12 + 3,
        y: 232,
        width: 8,
        height: 0,
      });
      clip.append(mask);
      spectrumDefs.append(clip);
      const group = svg("g", {
        "clip-path": `url(#audio-spectrum-clip-${index})`,
      });
      for (let j = 0; j < 29; j++)
        group.append(
          svg("rect", {
            x: index * 12 + 3,
            y: 224 - j * 7,
            width: 8,
            height: 5,
            rx: 0.35,
            fill: "#b62140",
            opacity: 0.17 + j / 35,
          }),
        );
      spectrum.append(group);
      return { mask, phase: index * 0.59 };
    });
    const latencyBars = $$(".audio-latency-bar > .lit");
    function paint(time) {
      if (!finite(time) || time < 0) return;
      artTime = time;
      for (const ring of rings) {
        const amount =
          metrics[ring.key === "mic" ? "microphone" : "noise"] / 100;
        if (!amount) continue;
        const phase = (time / 4.8 + ring.phase) % 1;
        const point = ring.arc.getPointAtLength(phase * ring.length * amount);
        for (const gradient of [ring.core, ring.aura]) {
          gradient.setAttribute("cx", point.x.toFixed(2));
          gradient.setAttribute("cy", point.y.toFixed(2));
        }
        const fade = Math.min(1, phase * 8, (1 - phase) * 8);
        $(".gauge-moving-glow", ring.gauge).style.opacity = String(0.85 * fade);
        $(".gauge-moving-core", ring.gauge).style.opacity = String(0.96 * fade);
      }
      for (const { paths, width: w, height: h, phase } of waveSets)
        paths.forEach((path, index) => {
          const q = index / Math.max(1, paths.length - 1);
          const drift = time * 0.42 + phase;
          const a = Math.sin(drift + q * 1.4) * h * 0.095;
          const b = Math.cos(drift * 0.8 + q * 1.8) * h * 0.08;
          const y = h * (0.38 + q * 0.58);
          const d =
            index < paths.length * 0.68
              ? `M-12 ${y + a} C${w * 0.2} ${h * 1.28 - q * h * 0.27 + a} ${w * 0.32} ${h * 0.34 + q * h * 0.21 + b} ${w * 0.46} ${h * 0.62 + q * h * 0.12} S${w * 0.67} ${h * 1.14 - q * h * 0.09 + a} ${w * 0.8} ${h * 0.69 - q * h * 0.22 + b} S${w * 0.94} ${h * 0.43 - q * h * 0.44 + a} ${w + 8} ${h * 0.21 + q * h * 0.45}`
              : `M-12 ${h * (0.9 + q * 0.12) + b} C${w * 0.21} ${h * 0.98 + a} ${w * 0.33} ${h * 0.24 + q * h * 0.2 + a} ${w * 0.52} ${h * 0.75 + q * h * 0.25 + b} S${w * 0.82} ${h * 0.38 + q * h * 0.27 + a} ${w + 8} ${h * (0.48 + q * 0.5) + b}`;
          path.setAttribute("d", d);
        });
      for (const [index, column] of spectrumColumns.entries()) {
        const edge = Math.abs(index - 13) / 13;
        const height = draft.monitoring
          ? 12 +
            edge *
              (37 +
                Math.pow(0.5 + 0.5 * Math.sin(time * 1.8 + column.phase), 1.7) *
                  142)
          : 5;
        column.mask.setAttribute("y", (232 - height).toFixed(1));
        column.mask.setAttribute("height", height.toFixed(1));
      }
      latencyBars.forEach((bar, index) => {
        bar.style.filter = `brightness(${(0.94 + 0.17 * Math.sin(index * 0.24 - time * 1.3)).toFixed(2)})`;
      });
    }
    window.AudioSettingsArt = Object.freeze({ paint });

    function validDevices(items) {
      return (
        Array.isArray(items) &&
        items.length <= 128 &&
        new Set(items.map((item) => item?.id)).size === items.length &&
        items.every(
          (item) =>
            item &&
            typeof item.id === "string" &&
            item.id.length > 0 &&
            item.id.length <= 128 &&
            typeof item.label === "string" &&
            item.label.length > 0 &&
            item.label.length <= 256,
        )
      );
    }
    function setCapabilities(value) {
      if (
        !value ||
        !validDevices(value.inputs) ||
        !validDevices(value.outputs) ||
        !validDevices(value.drivers) ||
        value.drivers.length > 32 ||
        value.drivers.some(
          (driver) =>
            !Array.isArray(driver.rates) ||
            driver.rates.length > 32 ||
            new Set(driver.rates.map((format) => format?.rate)).size !==
              driver.rates.length ||
            driver.rates.some(
              (format) =>
                !format ||
                typeof format !== "object" ||
                !positiveInteger(format.rate) ||
                !Array.isArray(format.periods) ||
                format.periods.length > 128 ||
                !format.periods.every(positiveInteger) ||
                new Set(format.periods).size !== format.periods.length,
            ),
        )
      )
        return false;
      capabilities = {
        drivers: value.drivers.map((driver) => ({
          id: driver.id,
          label: driver.label,
          rates: driver.rates.map((format) => ({
            rate: format.rate,
            periods: [...format.periods],
          })),
        })),
        inputs: value.inputs.map((item) => ({
          id: item.id,
          label: item.label,
        })),
        outputs: value.outputs.map((item) => ({
          id: item.id,
          label: item.label,
        })),
      };
      capabilitySource = "runtime";
      renderDraft();
      renderMetrics();
      return true;
    }
    function setMetrics(value) {
      if (!value || typeof value !== "object" || Array.isArray(value))
        return false;
      const allowed = [
        "microphone",
        "noise",
        "estimatedMs",
        "hiddenMs",
        "status",
        "source",
      ];
      if (Object.keys(value).some((key) => !allowed.includes(key)))
        return false;
      for (const key of ["microphone", "noise"])
        if (
          key in value &&
          (!finite(value[key]) || value[key] < 0 || value[key] > 100)
        )
          return false;
      for (const key of ["estimatedMs", "hiddenMs"])
        if (
          key in value &&
          value[key] !== null &&
          (!finite(value[key]) || value[key] < 0 || value[key] > 100000)
        )
          return false;
      if (
        "status" in value &&
        (typeof value.status !== "string" ||
          !value.status.length ||
          value.status.length > 24)
      )
        return false;
      if ("source" in value && !["demo", "runtime"].includes(value.source))
        return false;
      metrics = { ...metrics, ...value };
      renderMetrics();
      paint(artTime);
      return true;
    }
    renderDraft();
    saved = { ...draft };
    renderMetrics();
    paint(0);
    window.AudioSettingsDemo = Object.freeze({
      getState: () => ({ ...draft }),
      getMetrics: () => ({ ...metrics }),
      getCapabilities: () => JSON.parse(JSON.stringify(capabilities)),
      setCapabilities,
      setMetrics,
      setMotion: api.setMotion,
      seek: api.seek,
      resume: api.resume,
      open: () => {
        api.open();
        api.navigate("audio");
      },
      close: api.close,
      stopTest,
      isTestPlaying: () => Boolean(soundContext),
    });
    scene.dataset.audioReady = "true";
  })();

  (() => {
    "use strict";
    const $ = (selector, parent = document) => parent.querySelector(selector);
    const $$ = (selector, parent = document) => [
      ...parent.querySelectorAll(selector),
    ];
    const api = window.SettingsDemo;
    const root = $("#env-content");
    if (!api || !root) return;
    const ns = "http://www.w3.org/2000/svg";
    const svg = (tag, attributes = {}) => {
      const element = document.createElementNS(ns, tag);
      for (const [name, value] of Object.entries(attributes))
        element.setAttribute(name, String(value));
      return element;
    };
    const emit = (name, detail) =>
      window.dispatchEvent(
        new CustomEvent(`environment:${name}`, {
          detail,
          cancelable: true,
        }),
      );
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const fields = Object.fromEntries(
      $$("[data-env-field]", root).map((element) => {
        const name = element.dataset.envField;
        return [
          name,
          {
            element,
            kind: element.dataset.kind,
            input: $(`#env-${name}`),
            shell: $(".env-input-shell", element),
            status: $(".env-valid", element),
            hint: $(`#env-${name}-hint`),
            selectedFile: false,
          },
        ];
      }),
    );
    const defaults = Object.fromEntries(
      Object.entries(fields).map(([key, field]) => [key, field.input.value]),
    );
    let draft = { ...defaults };

    // UI validation only. Never infer successful authentication, connectivity or file
    // existence from a filled input. No service is contacted by any of these checks.
    function validate(name) {
      const { kind } = fields[name];
      const value = draft[name].trim();
      if (kind === "port") {
        if (
          !/^\d{1,5}$/.test(value) ||
          Number(value) < 1 ||
          Number(value) > 65535
        )
          return {
            valid: false,
            message:
              "Введите целое число от 1 до 65535. Проверка доступности порта не выполняется.",
          };
        return {
          valid: true,
          message:
            "Формат порта корректен. Подключение к серверу не проверялось.",
        };
      }
      if (kind === "host") {
        try {
          if (!value || /[\s/@?#\\]/.test(value))
            throw new Error("Invalid host");
          const url = new URL(`http://${value}`);
          if (!url.hostname || url.port || url.pathname !== "/")
            throw new Error("Invalid host");
          return {
            valid: true,
            message:
              "Адрес заполнен. Проверка доступности и подключения не выполнялась.",
          };
        } catch {
          return {
            valid: false,
            message:
              "Введите имя сервера или IP-адрес без протокола, пути и порта.",
          };
        }
      }
      if (kind === "token") {
        if (name === "audd-token" && !value)
          return {
            valid: null,
            message:
              "Необязательный токен не указан. Сервис распознавания не подключён.",
          };
        if (!value)
          return {
            valid: false,
            message:
              "Укажите токен или оставьте демонстрационное значение. Авторизация не выполняется.",
          };
        if (/[\s\u0000-\u001f]/.test(value))
          return {
            valid: false,
            message:
              "Поле токена содержит пробелы или управляющие символы. Сам ключ не проверяется.",
          };
        return {
          valid: true,
          message:
            "Поле заполнено. Токен не проверялся, авторизация не выполнялась.",
        };
      }
      if (kind === "file")
        return {
          valid: Boolean(value),
          message: !value
            ? "Выберите файл. В макете используется только его имя."
            : fields[name].selectedFile
              ? "Выбрано имя файла. Содержимое не читалось, проверка SSH не выполнялась."
              : "Показан демонстрационный путь. Файл не открывался и не проверялся.",
        };
      if (kind === "user")
        return /^[A-Za-z_][A-Za-z0-9_.-]{0,63}$/.test(value)
          ? {
              valid: true,
              message: "Имя пользователя заполнено. Вход по SSH не выполнялся.",
            }
          : {
              valid: false,
              message:
                "Для макета укажите имя без пробелов: латинские буквы, цифры, _, . или -.",
            };
      return { valid: Boolean(value), message: "Демонстрационное поле." };
    }

    const envKeys = {
      "kaggle-token": "KAGGLE_API_TOKEN",
      server: "ROOM_SERVER_HOST",
      "room-port": "ROOM_SERVER_PORT",
      "voice-port": "ROOM_VOICE_PORT",
      "audd-token": "AUDD_API_TOKEN",
      "ssh-key": "ROOM_SERVER_SSH_KEY_FILE",
      "known-hosts": "ROOM_SERVER_KNOWN_HOSTS_FILE",
      "ssh-user": "ROOM_SERVER_SSH_USER",
    };
    function snapshot(includeSecrets = false) {
      const result = { _demo: true };
      for (const [name, key] of Object.entries(envKeys)) {
        const value = draft[name];
        result[key] =
          fields[name].kind === "token" && !includeSecrets && value
            ? "[СКРЫТО]"
            : fields[name].kind === "port" && validate(name).valid
              ? Number(value)
              : value;
      }
      return result;
    }
    function renderJSON() {
      // Text nodes only: pasted input must never be treated as HTML or code.
      const code = $("#env-json-code"),
        data = snapshot();
      code.replaceChildren(document.createTextNode("{\n"));
      const entries = Object.entries(data);
      for (const [index, [key, value]] of entries.entries()) {
        const keySpan = document.createElement("span");
        keySpan.className = "json-key";
        keySpan.textContent = JSON.stringify(key);
        const valueSpan = document.createElement("span");
        valueSpan.className =
          typeof value === "number" || typeof value === "boolean"
            ? "json-number"
            : value === "[СКРЫТО]"
              ? "json-muted"
              : "json-string";
        valueSpan.textContent = JSON.stringify(value);
        code.append(
          document.createTextNode("  "),
          keySpan,
          document.createTextNode(": "),
          valueSpan,
          document.createTextNode(index < entries.length - 1 ? ",\n" : "\n"),
        );
      }
      code.append(document.createTextNode("}"));
    }
    function renderField(name) {
      const field = fields[name],
        result = validate(name);
      field.shell.dataset.valid =
        result.valid === null ? "unset" : String(result.valid);
      field.status.style.color = result.valid === null ? "#a69aad" : "";
      const symbol =
        result.valid === false
          ? "#env-i-warning"
          : result.valid === null
            ? "#i-info"
            : "#env-i-ok";
      $("use", field.status).setAttribute("href", symbol);
      field.input.setAttribute("aria-invalid", String(result.valid === false));
      field.status.title = result.message;
      field.status.setAttribute("aria-label", result.message);
      field.hint.textContent = result.message;
    }
    function renderAll() {
      for (const [name, field] of Object.entries(fields)) {
        field.input.value = draft[name];
        if (field.kind === "token")
          field.input.type =
            draft[name] === defaults[name] ? "text" : "password";
        renderField(name);
      }
      renderJSON();
    }
    for (const [name, field] of Object.entries(fields)) {
      field.input.addEventListener("input", () => {
        draft[name] = field.input.value;
        // Only obvious mock keys are shown in clear text. User-entered keys are masked.
        if (field.kind === "token" && draft[name] !== defaults[name])
          field.input.type = "password";
        renderField(name);
        renderJSON();
        emit("change", {
          field: name,
          valid: validate(name).valid,
          demo: true,
        });
      });
    }
    const explanations = {
      "kaggle-token": [
        "Токен доступа Kaggle",
        "Вместо ключа со скриншота указан неработающий демонстрационный токен. Введённое значение остаётся только в памяти страницы, не сохраняется в браузере и не отправляется в сеть. Зелёная отметка означает заполненное поле, а не успешный вход.",
      ],
      "audd-token": [
        "Токен AudD",
        "Необязательное поле. Демонстрационное значение не даёт доступа к сервису. HTML не выполняет запросы распознавания. При вводе собственного значения оно маскируется; в техническом JSON токен всегда скрыт.",
      ],
      server: [
        "Адрес сервера",
        "По умолчанию показан локальный демонстрационный адрес. Проверяется только запись адреса, но не доступность сервера, соединение или возможность войти в комнату.",
      ],
      "room-port": [
        "Порт комнат",
        "Поле для порта сервера комнат. Проверяется только числовой формат. Этот макет не открывает порт и не устанавливает соединение.",
      ],
      "voice-port": [
        "Порт передачи голоса",
        "Поле для порта голосового транспорта. Проверяется только числовой формат. Настоящая передача голоса в HTML-макет не подключена.",
      ],
      "ssh-key": [
        "Приватный SSH-ключ",
        "Изначально показан демонстрационный путь. Кнопка папки позволяет выбрать локальный файл, но макет берёт только его имя: содержимое приватного ключа не читается, не сохраняется и не отправляется.",
      ],
      "known-hosts": [
        "Файл known_hosts",
        "Кнопка папки выбирает только имя локального файла. Содержимое не читается и сервер по нему не проверяется. Подключение SSH и отправка обновлений в этом HTML не выполняются.",
      ],
      "ssh-user": [
        "SSH-пользователь",
        "Демонстрационное имя для формы обновления сервера. Этот HTML не авторизуется по SSH и не запускает команды на сервере.",
      ],
    };
    $$("[data-env-info]", root).forEach((button) =>
      button.addEventListener("click", () => {
        const [title, description] = explanations[button.dataset.envInfo];
        api.showDialog({
          title,
          description,
          confirm: "Понятно",
          cancel: "Закрыть",
        });
      }),
    );
    $$("[data-env-status]", root).forEach((button) =>
      button.addEventListener("click", () => {
        api.notify(validate(button.dataset.envStatus).message);
      }),
    );
    $$("[data-env-copy]", root).forEach((button) =>
      button.addEventListener("click", async () => {
        const name = button.dataset.envCopy;
        if (!draft[name]) {
          api.notify("Поле пока пустое.");
          fields[name].input.focus();
          return;
        }
        const ok = await api.copyText(draft[name]);
        api.notify(
          ok
            ? "Значение скопировано в буфер обмена."
            : "Браузер запретил копирование. Выделите значение и скопируйте вручную.",
        );
      }),
    );
    $$("[data-env-pick]", root).forEach((button) =>
      button.addEventListener("click", () => {
        $(`#env-${button.dataset.envPick}-file`).click();
      }),
    );
    for (const name of ["ssh-key", "known-hosts"]) {
      const input = $(`#env-${name}-file`);
      input.addEventListener("change", () => {
        const file = input.files?.[0];
        if (!file) return;
        // Do not invoke File.text(), FileReader, fetch, or store the file itself.
        draft[name] = file.name;
        fields[name].selectedFile = true;
        input.value = "";
        renderAll();
        emit("file-selection", {
          field: name,
          fileName: draft[name],
          contentsRead: false,
        });
        api.notify(
          "Выбрано имя файла. Его содержимое не читалось и никуда не отправлялось.",
        );
      });
    }
    $("#env-login").addEventListener("click", () => {
      if (!emit("login-request", { service: "kaggle", demo: true })) return;
      api.showDialog({
        title: "Войти в Kaggle",
        description:
          "В этом локальном HTML вход не выполняется и учётные данные никуда не отправляются. Кнопка подготовлена для подключения авторизации из вашего приложения.",
        confirm: "Понятно",
        cancel: "Закрыть",
      });
    });
    $("#env-launch").addEventListener("click", () => {
      if (!validate("kaggle-token").valid) {
        fields["kaggle-token"].input.focus();
        api.notify(validate("kaggle-token").message);
        return;
      }
      if (!emit("deploy-request", { service: "kaggle", demo: true })) return;
      api.showDialog({
        title: "Развернуть и запустить",
        description:
          "Это кнопка интерфейса, а не запуск GPU. HTML не создаёт сессию Kaggle, не выполняет команды и не отправляет токены. Для реального запуска нужен обработчик вашего backend.",
        confirm: "Понятно",
        cancel: "Закрыть",
      });
    });
    const disclosure = $("#env-json-toggle"),
      jsonPanel = $("#env-json-panel");
    disclosure.addEventListener("click", () => {
      const open = disclosure.getAttribute("aria-expanded") !== "true";
      disclosure.setAttribute("aria-expanded", String(open));
      jsonPanel.hidden = !open;
      if (open) {
        renderJSON();
        requestAnimationFrame(() => {
          const card = $(".env-json-card", root);
          root.scrollTop = Math.max(
            root.scrollTop,
            card.offsetTop + card.offsetHeight - root.clientHeight + 15,
          );
        });
      }
    });
    $("#env-copy-json").addEventListener("click", async () => {
      const ok = await api.copyText(JSON.stringify(snapshot(), null, 2));
      api.notify(
        ok
          ? "JSON скопирован. Значения токенов скрыты."
          : "Браузер запретил копирование. JSON можно выделить вручную.",
      );
    });

    // Decorations share SettingsDemo's existing, pausable animation clock.
    // No extra loop keeps running while this tab, document or modal is hidden.
    function seeded(seed) {
      return () => {
        seed = (Math.imul(1664525, seed) + 1013904223) | 0;
        return (seed >>> 0) / 4294967296;
      };
    }
    const random = seeded(47831);
    const waveSets = $$(".env-wave", root).map((target, index) => {
      const { width, height } = target.viewBox.baseVal;
      const id = `${target.id}-color`;
      const defs = svg("defs"),
        gradient = svg("linearGradient", { id });
      for (const [offset, opacity, color] of [
        [0, 0, "#81152e"],
        [0.17, 0.28, "#ac1838"],
        [0.5, 0.63, "#ff365d"],
        [0.8, 0.92, "#ff7388"],
        [1, 0.32, "#ec1644"],
      ]) {
        gradient.append(
          svg("stop", { offset, "stop-color": color, "stop-opacity": opacity }),
        );
      }
      defs.append(gradient);
      target.append(defs);
      const paths = Array.from({ length: index === 2 ? 29 : 22 }, (_, i) => {
        const path = svg("path", {
          stroke: `url(#${id})`,
          "stroke-width": i === 9 ? 1 : 0.58,
          opacity: 0.37 + (i % 5) * 0.08,
        });
        target.append(path);
        return path;
      });
      for (let i = 0; i < 58; i++) {
        target.append(
          svg("circle", {
            cx: random() * width,
            cy: random() * height,
            r: 0.14 + random() * 0.44,
            fill: "#ff4d76",
            opacity: 0.1 + random() * 0.38,
          }),
        );
      }
      return { paths, width, height, phase: index * 0.82 };
    });
    const spectrum = $("#env-spectrum");
    const defs = svg("defs"),
      color = svg("linearGradient", {
        id: "env-spectrum-color",
        x1: 0,
        x2: 0,
        y1: 0,
        y2: 1,
      });
    color.append(
      svg("stop", { "stop-color": "#ffa7b9" }),
      svg("stop", { offset: 0.24, "stop-color": "#ff345e" }),
      svg("stop", { offset: 1, "stop-color": "#b40733", "stop-opacity": 0 }),
    );
    defs.append(color);
    spectrum.append(defs);
    const bars = Array.from({ length: 23 }, (_, i) => {
      const bar = svg("rect", {
        x: 4 + i * 6.75,
        y: 40,
        width: 2.8,
        height: 100,
        rx: 1.3,
        fill: "url(#env-spectrum-color)",
        opacity: 0.55 + i / 55,
      });
      spectrum.append(bar);
      return bar;
    });
    function paint(time) {
      if (!Number.isFinite(time)) return;
      for (const { paths, width: w, height: h, phase } of waveSets)
        paths.forEach((path, index) => {
          const q = index / (paths.length - 1),
            drift = time * 0.54 + phase;
          const a = Math.sin(drift + q * 1.7) * h * 0.085,
            b = Math.cos(drift * 0.8 + q * 2.4) * h * 0.11;
          const d = `M-8 ${h * (0.16 + q * 0.37) + a} C${w * 0.16} ${h * (0.83 - q * 0.25) + b} ${w * 0.25} ${h * (0.12 + q * 0.2) + a} ${w * 0.4} ${h * (0.46 + q * 0.1)} S${w * 0.64} ${h * (0.9 - q * 0.23) - a} ${w * 0.72} ${h * (0.4 + q * 0.23) + b} S${w * 0.91} ${h * (0.02 + q * 0.33) + a} ${w + 8} ${h * (0.26 + q * 0.44) - b}`;
          path.setAttribute("d", d);
        });
      bars.forEach((bar, i) => {
        const envelope = Math.exp(-(((i - 16) / 6) ** 2)),
          rhythm = 0.55 + 0.45 * Math.sin(time * 1.7 + i * 0.61);
        const height =
          9 +
          100 * envelope * (0.53 + 0.47 * rhythm) +
          15 * Math.sin(i * 0.67 + time * 0.58) ** 2;
        bar.setAttribute("y", (134 - height).toFixed(2));
        bar.setAttribute("height", height.toFixed(2));
      });
    }
    window.EnvironmentArt = Object.freeze({ paint });
    window.EnvironmentDemo = Object.freeze({
      // Redacted by default; exposing raw credentials requires an explicit integration call.
      getState: (options = {}) => snapshot(options.includeSecrets === true),
      setValues(values) {
        if (!values || typeof values !== "object" || Array.isArray(values))
          return false;
        const entries = Object.entries(values);
        if (
          entries.some(
            ([name, value]) =>
              !Object.hasOwn(fields, name) ||
              typeof value !== "string" ||
              value.length > 512,
          )
        )
          return false;
        for (const [name, value] of entries) draft[name] = value;
        renderAll();
        return true;
      },
      reset() {
        draft = { ...defaults };
        Object.values(fields).forEach((field) => {
          field.selectedFile = false;
        });
        renderAll();
      },
      open() {
        api.open();
        api.navigate("env");
      },
      setMotion: api.setMotion,
      seek: api.seek,
      resume: api.resume,
    });
    renderAll();
    paint(0);
    root.dataset.envReady = "true";
    window.addEventListener(
      "pagehide",
      () => {
        for (const [name, field] of Object.entries(fields))
          if (field.kind === "token") {
            draft[name] = "";
            field.input.value = "";
          }
      },
      { once: true },
    );
  })();
}
