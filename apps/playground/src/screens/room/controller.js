const cssRem = value => `${value / (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16)}rem`;
/* Screen-specific interaction controller. Common rendering and border motion live in ADUI. */
export default function initialize(context) {
  const {document,window,requestAnimationFrame,cancelAnimationFrame,ResizeObserver,MutationObserver,
    setTimeout,clearTimeout,setInterval,clearInterval,addEventListener,removeEventListener,matchMedia,localStorage}=context;

    (() => {
      "use strict";
      // This is a standalone interface demo, not an audio/network implementation.
      // An application can supply real values through window.KaraokeRoom and listen
      // for "karaoke:volume", "karaoke:mute", "karaoke:monitoring", "karaoke:leave".
      const $ = (selector, parent = document) => parent.querySelector(selector);
      const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
      const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
      const finite = (value) => typeof value === "number" && Number.isFinite(value);
      const room = $("#room");
      const viewport = $(".viewport");
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      const state = {
        roomId: "a689365a-6315-4f8a-9080",
        host: { name: "Release Host", volume: 72, initial: 72, muted: false, status: "Говорите..." },
        guest: { name: "Release Guest", volume: 100, initial: 100, muted: false, status: "Слушает..." },
        monitoring: true,
        progress: 70,
        remaining: "Осталось ~ 2 мин",
        latency: 68,
        connected: true,
        animations: !new URLSearchParams(location.search).has("still") && !reducedMotion.matches
      };



      let settingsPerson = null;
      let toastTimer;
      const panels = Object.fromEntries(["host", "guest"].map((person) => [person, $(`[data-person="${person}"]`)]));
      const dials = Object.fromEntries(["host", "guest"].map((person) => [person, $(`[data-dial="${person}"]`)]));
      const emit = (name, detail) => window.dispatchEvent(new CustomEvent(`karaoke:${name}`, { detail }));
      const isPerson = (person) => person === "host" || person === "guest";

      function resize() {
        const width = Number.parseFloat(getComputedStyle(room).width);
        if (!(width > 0)) return;
        room.style.setProperty("--scale", String(Math.min(1, viewport.clientWidth / width)));
      }
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(viewport);
      resizeObserver.observe(room);
      resize();

      function setAnimations(enabled) {
        state.animations = Boolean(enabled);
        room.classList.toggle("is-still", !state.animations);
        $("#toggle-motion").textContent = state.animations ? "Приостановить анимации" : "Включить анимации";
      }
      setAnimations(state.animations);
      const compactSubtitle = $(".transfer-remaining");
      if (compactSubtitle) compactSubtitle.textContent = "Песня пока не выбрана";
      state.host.volume = 100;
      state.host.initial = 100;
      document.addEventListener("visibilitychange", () => room.classList.toggle("is-paused", document.hidden || !state.connected));
      reducedMotion.addEventListener("change", (event) => setAnimations(!event.matches));

      function notify(text) {
        clearTimeout(toastTimer);
        $("#toast").textContent = text;
        $("#toast").hidden = false;
        toastTimer = setTimeout(() => { $("#toast").hidden = true; }, 2200);
      }

      async function copyRoom() {
        closePopovers();
        try {
          if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
          await navigator.clipboard.writeText(state.roomId);
          notify("ID комнаты скопирован");
        } catch {
          // file:// and permission restrictions can block the Clipboard API.
          const field = document.createElement("textarea");
          field.value = state.roomId;
          field.setAttribute("readonly", "");
          field.style.cssText = "position:fixed;left:-624.9375rem;top:0";
          document.body.append(field);
          field.select();
          let copied = false;
          try { copied = document.execCommand("copy"); } catch { /* use selection below */ }
          field.remove();
          if (copied) notify("ID комнаты скопирован");
          else {
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents($("#room-id"));
            selection?.removeAllRanges();
            selection?.addRange(range);
            notify("ID выделен. Нажмите Ctrl+C, чтобы скопировать.");
          }
        }
        $("#copy-room").focus({ preventScroll: true });
      }

      function updateSettings() {
        if (!settingsPerson) return;
        const person = state[settingsPerson];
        $("#settings-title").textContent = person.name;
        $("#settings-volume").value = String(person.volume);
        $("#settings-value").textContent = `${person.volume}%`;
        $("#settings-mute").textContent = person.muted ? "Включить микрофон" : "Выключить микрофон";
      }

      function setVolume(person, value, userAction = false) {
        if (!isPerson(person) || !finite(value)) return false;
        value = Math.round(clamp(value, 0, 100));
        const item = state[person];
        const changed = item.volume !== value;
        item.volume = value;
        const dial = dials[person];
        dial.style.setProperty("--value", String(value));
        dial.style.setProperty("--rotation", `${(value - item.initial) * 2.7}deg`);
        dial.classList.toggle("is-zero", value === 0);
        $(".dial-highlight", dial).style.opacity = value < 30 ? "0" : ".85";
        dial.setAttribute("aria-valuenow", String(value));
        dial.setAttribute("aria-valuetext", `${value}%`);
        $(".dial-value", dial).textContent = `${value}%`;
        updateSettings();
        if (changed && userAction) emit("volume", { person, value });
        return true;
      }

      function setMuted(person, muted, userAction = false) {
        if (!isPerson(person)) return false;
        const item = state[person];
        item.muted = Boolean(muted);
        const panel = panels[person];
        panel.classList.toggle("is-muted", item.muted);
        $(".status-text", panel).textContent = item.muted ? "Микрофон выключен" : item.status;
        const button = $(".mute-button", panel);
        button.setAttribute("aria-pressed", String(item.muted));
        const action = item.muted ? "Включить микрофон" : "Выключить микрофон";
        button.setAttribute("aria-label", `${action} ${item.name}`);
        button.title = action;
        updateSettings();
        if (userAction) emit("mute", { person, muted: item.muted });
        return true;
      }

      function setMonitoring(enabled, userAction = false) {
        state.monitoring = Boolean(enabled);
        $("#monitor-toggle").setAttribute("aria-checked", String(state.monitoring));
        $("#monitor-toggle").title = state.monitoring ? "Выключить мониторинг" : "Включить мониторинг";
        if (userAction) emit("monitoring", { enabled: state.monitoring });
      }

      function setTransfer(value, remaining = state.remaining) {
        if (!finite(value)) return false;
        state.progress = clamp(value, 0, 100);
        state.remaining = String(remaining);
        $("#transfer-track").style.setProperty("--progress", `${state.progress}%`);
        $("#transfer-track").setAttribute("aria-valuenow", String(state.progress));
        $("#transfer-fill").classList.toggle("is-empty", state.progress === 0);
        $("#transfer-percent").textContent = `${Math.round(state.progress)}%`;
        $("#transfer-remaining").textContent = state.progress === 100 ? "Проект передан" : state.remaining;
        return true;
      }

      function setLatency(milliseconds, quality) {
        if (!finite(milliseconds) || milliseconds < 0) return false;
        state.latency = Math.round(milliseconds);
        $("#latency-value").textContent = `${state.latency} мс`;
        // Do not guess quality from invented latency thresholds: the app supplies it.
        if (typeof quality === "string") $("#latency-quality").textContent = quality;
        return true;
      }

      function setParticipant(person, data) {
        if (!isPerson(person) || !data || typeof data !== "object") return false;
        if (typeof data.name === "string") {
          state[person].name = data.name;
          $(`#${person}-name`).textContent = data.name;
          dials[person].setAttribute("aria-label", `Громкость ${data.name}`);
          $(".settings-button", panels[person]).setAttribute("aria-label", `Настройки ${data.name}`);
        }
        if (typeof data.status === "string") state[person].status = data.status;
        if (finite(data.volume)) setVolume(person, data.volume);
        setMuted(person, "muted" in data ? data.muted : state[person].muted);
        return true;
      }

      function closePopovers(returnFocus = false) {
        const opener = settingsPerson ? $(`[data-settings="${settingsPerson}"]`) : $("#room-menu-button");
        $("#room-menu").hidden = true;
        $("#participant-settings").hidden = true;
        $("#room-menu-button").setAttribute("aria-expanded", "false");
        $$("[data-settings]").forEach((button) => button.setAttribute("aria-expanded", "false"));
        settingsPerson = null;
        if (returnFocus) opener.focus({ preventScroll: true });
      }

      function openSettings(person) {
        const same = settingsPerson === person;
        closePopovers();
        if (same) return;
        settingsPerson = person;
        updateSettings();
        const popover = $("#participant-settings");
        popover.style.left = "23.375rem";
        popover.style.top = person === "host" ? "21.9375rem" : "31.625rem";
        popover.hidden = false;
        $(`[data-settings="${person}"]`).setAttribute("aria-expanded", "true");
        $("#settings-volume").focus({ preventScroll: true });
      }

      // Sixteen separate HTML capsules, with the initial heights/colors in the reference.
      const colors = ["#ff345e", "#ff426a", "#ff7892", "#ff8199", "#ff8198", "#ff8ba0", "#ffafbd", "#ff879d", "#ff6d8c", "#fc4d77"];
      const meters = {};
      for (const person of ["host", "guest"]) {
        const meter = $(`[data-meter="${person}"]`);
        const initialLit = person === "host" ? 10 : 9;
        meters[person] = Array.from({ length: 16 }, (_, index) => {
          const bar = document.createElement("span");
          bar.className = `meter-bar${index < initialLit ? " is-lit" : ""}`;
          const isPeak = person === "host" && index === 7;
          const top = person === "guest" && index === 5 ? "#ffced8" : colors[index % colors.length];
          const bottom = index < 2 ? "#ff174b" : index < 7 ? "#ff527c" : "#e43d68";
          bar.style.cssText = `--height:${(isPeak ? 34 : 28) / 16}rem;--bar-top:${top};--bar-bottom:${bottom};--duration:${1.1 + (index % 5) * 0.19}s;--delay:${0.6 + index * 0.045}s`;
          meter.append(bar);
          return bar;
        });
      }

      function setLevel(person, level) {
        if (!isPerson(person) || !finite(level)) return false;
        level = clamp(level, 0, 1);
        const meter = $(`[data-meter="${person}"]`);
        meter.classList.add("is-live");
        const count = Math.round(level * 16);
        meters[person].forEach((bar, index) => {
          bar.classList.toggle("is-lit", index < count);

        });
        return true;
      }

      for (const [person, dial] of Object.entries(dials)) {
        let drag = null;
        dial.addEventListener("pointerdown", (event) => {
          if (event.button !== 0) return;
          event.preventDefault();
          dial.focus({ preventScroll: true });
          drag = { id: event.pointerId, y: event.clientY, value: state[person].volume };
          dial.setPointerCapture(event.pointerId);
          dial.classList.add("is-dragging");
        });
        dial.addEventListener("pointermove", (event) => {
          if (!drag || drag.id !== event.pointerId) return;
          const scale = Number.parseFloat(room.style.getPropertyValue("--scale")) || 1;
          setVolume(person, drag.value + (drag.y - event.clientY) / Math.max(scale, 0.01), true);
        });
        const stopDrag = (event) => {
          if (!drag || drag.id !== event.pointerId) return;
          if (dial.hasPointerCapture(event.pointerId)) dial.releasePointerCapture(event.pointerId);
          drag = null;
          dial.classList.remove("is-dragging");
        };
        dial.addEventListener("pointerup", stopDrag);
        dial.addEventListener("pointercancel", stopDrag);
        dial.addEventListener("lostpointercapture", stopDrag);
        dial.addEventListener("dblclick", () => setVolume(person, state[person].initial, true));
        dial.addEventListener("keydown", (event) => {
          const changes = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 10, PageDown: -10 };
          const value = event.key === "Home" ? 0 : event.key === "End" ? 100 : event.key in changes ? state[person].volume + changes[event.key] : null;
          if (value === null) return;
          event.preventDefault();
          setVolume(person, value, true);
        });
        dial.addEventListener("wheel", (event) => {
          if (document.activeElement !== dial) return;
          event.preventDefault();
          setVolume(person, state[person].volume - Math.sign(event.deltaY), true);
        }, { passive: false });
      }

      $("#copy-room").addEventListener("click", copyRoom);
      $("#menu-copy").addEventListener("click", copyRoom);
      $("#room-menu-button").addEventListener("click", () => {
        const open = $("#room-menu").hidden;
        closePopovers();
        $("#room-menu").hidden = !open;
        $("#room-menu-button").setAttribute("aria-expanded", String(open));
        if (open) $("#menu-copy").focus({ preventScroll: true });
      });
      $("#toggle-motion").addEventListener("click", () => { setAnimations(!state.animations); closePopovers(true); });
      $$("[data-mute]").forEach((button) => button.addEventListener("click", () => {
        const person = button.dataset.mute;
        setMuted(person, !state[person].muted, true);
      }));
      $$("[data-settings]").forEach((button) => button.addEventListener("click", () => openSettings(button.dataset.settings)));
      $("#settings-volume").addEventListener("input", (event) => { if (settingsPerson) setVolume(settingsPerson, Number(event.target.value), true); });
      $("#settings-mute").addEventListener("click", () => { if (settingsPerson) setMuted(settingsPerson, !state[settingsPerson].muted, true); });
      $("#monitor-toggle").addEventListener("click", () => setMonitoring(!state.monitoring, true));
      $("#room-quick-leave")?.addEventListener("click", () => $("#leave-dialog").showModal());
      document.addEventListener("pointerdown", (event) => {
        if (!event.target.closest(".popover, [data-settings], #room-menu-button")) closePopovers();
      });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && (!$("#room-menu").hidden || !$("#participant-settings").hidden)) closePopovers(true);
      });

      const leaveDialog = $("#leave-dialog");
      $("#leave-room").addEventListener("click", () => { closePopovers(); leaveDialog.returnValue = "cancel"; leaveDialog.showModal(); });
      leaveDialog.addEventListener("close", () => {
        if (leaveDialog.returnValue !== "leave") return;
        state.connected = false;
        $$(".panel", room).forEach((panel) => { panel.inert = true; });
        $("#disconnected").hidden = false;
        room.classList.add("is-paused");
        $("#rejoin-room").focus({ preventScroll: true });
        emit("leave", { roomId: state.roomId });
      });
      $("#rejoin-room").addEventListener("click", () => {
        state.connected = true;
        $$(".panel", room).forEach((panel) => { panel.inert = false; });
        $("#disconnected").hidden = true;
        room.classList.remove("is-paused");
        $("#leave-room").focus({ preventScroll: true });
        emit("rejoin", { roomId: state.roomId });
      });

      for (const person of ["host", "guest"]) setVolume(person, state[person].volume);

      function setLatencyHistory(samples) {
        if (!Array.isArray(samples) || samples.length < 2 || !samples.every(finite)) return false;
        const values = samples.slice(-120);
        const min = Math.min(...values);
        const spread = Math.max(1, Math.max(...values) - min);
        const points = values.map((value, index) =>
          `${(1 + index * 166 / (values.length - 1)).toFixed(2)} ${(46 - (value - min) * 37 / spread).toFixed(2)}`
        );
        const path = `M${points.join(" L")}`;
        $("#latency-path").setAttribute("d", path);
        $(".graph-area").setAttribute("d", `${path}V53H1Z`);
        return true;
      }

      // Public UI API. Supplying values does not re-emit user-action events.
      window.KaraokeRoom = Object.freeze({
        setVolume, setMuted, setMonitoring, setTransfer, setLatency, setParticipant, setLevel, setAnimations, setLatencyHistory,
        setRoomId(value) {
          if (typeof value !== "string" || !value.trim()) return false;
          state.roomId = value.trim();
          $("#room-id").textContent = state.roomId;
          $("#room-id").title = state.roomId;
          return true;
        },
        getState() { return JSON.parse(JSON.stringify(state)); }
      });
    })();
    

    (() => {
      "use strict";

      const room = document.getElementById("room");
      const emblem = room?.querySelector(".host-emblem");
      if (!emblem) return;

      // Design speeds, not audio/network measurements: one inner lap in 5.6 s;
      // the outer glints go the other way in 8.4 s. No timers or raster assets.
      const INNER_LAP_MS = 5600;
      const OUTER_LAP_MS = 8400;
      const animations = [];
      let suspended = false;
      let active = false;

      function addAnimation(element, keyframes, options, id) {
        if (!element) return;
        const animation = element.animate(keyframes, {
          iterations: Infinity,
          easing: "linear",
          ...options
        });
        animation.id = id;
        animation.pause();
        animation.currentTime = 0;
        animations.push(animation);
      }

      for (const layer of emblem.querySelectorAll("[data-host-rotor]")) {
        const name = layer.dataset.hostRotor;
        const inner = name.startsWith("inner-");
        addAnimation(layer, [
          { transform: "rotate(0deg)" },
          { transform: `rotate(${inner ? 360 : -360}deg)` }
        ], { duration: inner ? INNER_LAP_MS : OUTER_LAP_MS }, `host-${name}`);
      }
      addAnimation(emblem.querySelector(".host-motion__gold-glow"), [
        { opacity: 0.55 }, { opacity: 0.95 }, { opacity: 0.55 }
      ], { duration: 4200, easing: "ease-in-out" }, "host-crown-light");

      function syncMotion() {
        // The main room controller already reads prefers-reduced-motion.
        // Its explicit menu toggle can also intentionally enable animation.
        const disabled = room.classList.contains("is-still");
        const shouldPlay = !disabled && !suspended && !document.hidden
          && !room.classList.contains("is-paused");

        if (!shouldPlay) {
          for (const animation of animations) {
            animation.pause();
            if (disabled) animation.currentTime = 0;
          }
          active = false;
          return;
        }
        if (active) return;
        active = true;

        // Shared start time makes the front arcs and their rear bloom exactly
        // synchronous after initial load AND after any pause/resume.
        const time = document.timeline.currentTime;
        for (const animation of animations) {
          const position = Number(animation.currentTime) || 0;
          animation.play();
          if (time !== null) animation.startTime = time - position;
        }
      }

      const observer = new MutationObserver(syncMotion);
      observer.observe(room, { attributes: true, attributeFilter: ["class"] });
      document.addEventListener("visibilitychange", syncMotion);
      window.addEventListener("pagehide", () => { suspended = true; syncMotion(); });
      window.addEventListener("pageshow", () => { suspended = false; syncMotion(); });
      syncMotion();
    })();
  
};
