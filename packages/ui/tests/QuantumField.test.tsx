import { expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { act, create } from "react-test-renderer";
import { existsSync, readFileSync } from "node:fs";
import { transformSync } from "esbuild";
import QuantumFieldExample from "../src/components/artwork/QuantumField/example";
import { ExamplePreviewContext } from "../src/dev/exampleHelpers";
import { QuantumFieldExperience, quantumFieldExperienceControls } from "../src/components/artwork/QuantumField/QuantumFieldExperience";
import { createQuantumFieldAudio } from "../src/components/artwork/QuantumField/audio";
import { quantumFieldGeometry, quantumFieldFilaments, quantumFieldNetwork, quantumFieldZoom } from "../src/components/artwork/QuantumField/renderer";
import { ThemeProvider } from "../src/components/foundation/ThemeProvider/ThemeProvider";
import { FilePicker } from "../src/components/controls/FilePicker/FilePicker";
import { IconButton } from "../src/components/controls/IconButton/IconButton";
import { Slider } from "../src/components/controls/Slider/Slider";
import { Switch } from "../src/components/controls/Switch/Switch";
import { Tabs } from "../src/components/controls/Tabs/Tabs";
import { Tooltip } from "../src/components/feedback/Tooltip/Tooltip";
import { AudioPlayer } from "../src/components/media/AudioPlayer/AudioPlayer";
import {
  QuantumField,
  quantumFieldModes,
  quantumFieldResolution,
  quantumFieldAudio,
} from "../src/components/artwork/QuantumField/QuantumField";

const nodeMock = () => ({ getBoundingClientRect: () => ({}) });

it("preserves the source visualizer's MIT notice when restoring it", () => {
  const license = readFileSync(new URL("../src/components/artwork/QuantumField/UPSTREAM-LICENSE.txt", import.meta.url), "utf8");
  const reference = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  expect(license).toContain("Quantum Fields Contributors");
  expect(reference).toContain("UPSTREAM-LICENSE.txt");
  expect(reference).not.toContain("Auto-starting System Audio");
  expect(reference).toContain("AlphaFromLumaShader");
  expect(reference.indexOf("composer.addPass(new OutputPass())")).toBeLessThan(reference.indexOf("composer.addPass(new ShaderPass(AlphaFromLumaShader))"));
  expect(reference).not.toContain("key === 'background'");
});

it("restores the licensed full visualizer instead of the reduced native scene", () => {
  const html = renderToStaticMarkup(createElement(QuantumFieldExperience));
  const reference = new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url);
  expect(existsSync(reference)).toBe(true);
  expect(html).toContain("<iframe");
  expect(html).not.toContain('data-ad-component="QuantumField"');
});

it("keeps the restored visualizer's full settings and song transport in the kit", () => {
  const keys = quantumFieldExperienceControls.flatMap(({ controls }) => controls.map(({ key }) => key));
  expect(keys).toEqual(expect.arrayContaining([
    "field", "sensitivity", "density", "timeScale", "nebulaEnabled", "connectionsEnabled",
    "lensFlareEnabled", "dofEnabled", "bloom", "trails", "vortexStrength", "pulseIntensity",
    "bassGateEnabled", "onsetSensitivity", "adaptiveQualityEnabled", "targetFPS",
  ]));
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  expect(source).toContain("key === 'seek'");
  expect(source).toContain("ad-qf-transport");
});

it("shows playback and essential settings first, with detailed controls closed by default", () => {
  const html = renderToStaticMarkup(createElement(QuantumFieldExperience));
  expect(html).toContain('data-ad-component="FilePicker"');
  expect(html).toMatch(/<details[^>]*data-ad-component="CollapsibleSection"[^>]*>/);
  expect(html).toContain("Тонкая настройка");
  for (const label of ["Тип поля", "Чувствительность", "Плотность", "Скорость"])
    expect(html.split(label)).toHaveLength(2);
});

it("reveals detailed effect sliders only when their effect is enabled", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("window", { addEventListener: vi.fn(), removeEventListener: vi.fn(), setTimeout, clearTimeout });
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(createElement(QuantumFieldExperience), { createNodeMock: nodeMock }); });
  try {
    act(() => tree.root.findByType(Tabs).props.onValueChange("environment"));
    const sliders = (label: string) => tree.root.findAllByType(Slider).filter((node) => node.props.label === label);
    expect(sliders("Яркость туманности")).toHaveLength(0);
    expect(sliders("Дальность связей")).toHaveLength(1);
    act(() => tree.root.findAllByType(Switch).find((node) => node.props.label === "Туманность")!.props.onValueChange(true));
    expect(sliders("Яркость туманности")).toHaveLength(1);
  } finally { act(() => tree.unmount()); }
});

it("places a compact kit player and actions below a transparent, shorter field", () => {
  const html = renderToStaticMarkup(createElement(QuantumFieldExperience));
  expect(html.indexOf('class="ad-qf-viewport"')).toBeLessThan(html.indexOf('class="ad-qf-controls"'));
  expect(html).toContain('data-ad-component="AudioPlayer"');
  const css = readFileSync(new URL("../src/components/artwork/QuantumField/styles.css", import.meta.url), "utf8");
  const reference = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  const docsCss = readFileSync(new URL("../../../apps/playground/src/app/app.css", import.meta.url), "utf8");
  const host = readFileSync(new URL("../src/components/artwork/QuantumField/QuantumFieldExperience.tsx", import.meta.url), "utf8");
  expect(css).toMatch(/\.ad-qf-viewport\s*\{[^}]*height:\s*clamp\(18rem,\s*42vh,\s*27rem\)/s);
  expect(css).toMatch(/\.ad-qf-viewport > iframe\s*\{[^}]*color-scheme:\s*dark/s);
  expect(reference).toMatch(/html, body\s*\{[^}]*color-scheme:\s*dark/s);
  expect(docsCss).toContain('.example-stage:has(> .ad-quantum-field-experience)');
  expect(host).not.toContain('send("background"');
});

it("keeps the iframe transparent without passing unsupported React DOM attributes", () => {
  const host = readFileSync(new URL("../src/components/artwork/QuantumField/QuantumFieldExperience.tsx", import.meta.url), "utf8");
  expect(host).not.toContain("allowTransparency");
  expect(host).toContain("srcDoc={reference}");
});

it("routes the kit player and labelled icon actions to the iframe", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("getComputedStyle", () => ({ backgroundColor: "rgba(0, 0, 0, 0)" }));
  vi.stubGlobal("window", { setTimeout, clearTimeout, addEventListener: (_type: string, listener: (event: MessageEvent) => void) => { receive = listener; }, removeEventListener: vi.fn() });
  let receive!: (event: MessageEvent) => void;
  const postMessage = vi.fn();
  const contentWindow = { postMessage };
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(createElement(QuantumFieldExperience), { createNodeMock: ({ type }) => type === "iframe" ? { contentWindow } : nodeMock() }); });
  try {
    act(() => receive({ source: contentWindow, data: { type: "ad-qf-ready" } } as unknown as MessageEvent));
    act(() => receive({ source: contentWindow, data: { type: "ad-qf-transport", value: { mode: "file", playing: true, current: 12, duration: 30, track: "song.mp3" } } } as unknown as MessageEvent));
    act(() => receive({ source: contentWindow, data: { type: "ad-qf-waveform", value: [0.2, 0.5, 0.1] } } as unknown as MessageEvent));
    const player = tree.root.findByType(AudioPlayer);
    expect(player.props).toMatchObject({ playing: true, position: 12, duration: 30, points: [0.2, 0.5, 0.1] });
    expect(tree.root.findByType(FilePicker).props.label).toBe("song.mp3");
    act(() => player.props.onPlayingChange(false));
    act(() => player.props.onTimeChange(18));
    expect(postMessage).toHaveBeenCalledWith({ type: "ad-qf-control", key: "play", value: undefined }, "*");
    expect(postMessage).toHaveBeenCalledWith({ type: "ad-qf-control", key: "seek", value: 18 }, "*");
    const labels = tree.root.findAllByType(IconButton).map(({ props }) => props.label);
    expect(labels).toEqual(expect.arrayContaining(["Микрофон", "Снимок", "На весь экран"]));
    expect(tree.root.findAllByType(Tooltip)).toHaveLength(3);
  } finally { act(() => tree.unmount()); }
});

it("updates playback without rerendering the field settings", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const listeners = new Set<(event: MessageEvent) => void>();
  vi.stubGlobal("window", {
    setTimeout, clearTimeout,
    addEventListener: (type: string, listener: (event: MessageEvent) => void) => { if (type === "message") listeners.add(listener); },
    removeEventListener: (type: string, listener: (event: MessageEvent) => void) => { if (type === "message") listeners.delete(listener); },
  });
  const contentWindow = { postMessage: vi.fn() };
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(createElement(QuantumFieldExperience), {
    createNodeMock: ({ type }) => type === "iframe" ? { contentWindow } : nodeMock(),
  }); });
  try {
    const tabsBefore = tree.root.findByType(Tabs).props.items;
    act(() => listeners.forEach((listener) => listener({ source: contentWindow, data: {
      type: "ad-qf-transport", value: { mode: "file", playing: true, current: 8, duration: 42, track: "song.mp3" },
    } } as unknown as MessageEvent)));
    expect(tree.root.findByType(AudioPlayer).props.position).toBe(8);
    expect(tree.root.findByType(Tabs).props.items).toBe(tabsBefore);
  } finally {
    act(() => tree.unmount());
    vi.unstubAllGlobals();
  }
});

it("keeps seven field presets while sharing the responsive particle geometry", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  const presets = source.match(/const FIELD_TYPES = \{([\s\S]*?)\n        \};/)?.[1] ?? "";
  expect([...presets.matchAll(/'[^']+': \{/g)]).toHaveLength(7);
  expect(source).toContain("vec3 shapedPosition(vec3 seed)");
  expect(source).toContain("vec3 newPos = shapedPosition(aRandom)");
  expect(source).toContain("vec3 newPos = shapedPosition(instanceRandom)");
});

it("fits every field to the viewport aspect on resize", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  expect(quantumFieldExperienceControls[0]?.controls[0]).toMatchObject({ value: "Gluon (Strong)" });
  expect(source).toContain("seed.xy * 2.0 - 1.0");
  expect(source).toContain("uViewportAspect * uViewportHalfHeight");
  expect(source).toContain("uViewportAspect.value = window.innerWidth / window.innerHeight");
  expect(source).toContain("controls.autoRotate = false;");
});

it("keeps every field type inside the same responsive rectangle", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  const shape = source.match(/const shapeFunction = `([\s\S]*?)`;/)?.[1] ?? "";
  expect(quantumFieldExperienceControls[0]?.controls[0]?.options).not.toContain("Rectangular Field");
  expect(shape).toContain("seed.xy * 2.0 - 1.0");
  expect(shape).not.toContain("if (shape");
  expect(source).not.toContain("uFieldShape");
  expect(source).not.toContain("newPos.xz = mix(vec2(gridX");
  expect(source).toContain("controls.autoRotate = false;");
});

it("spreads network lines, crawlers, and trails across the rectangular field", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  expect(source).toContain("const particleSeeds = geometry.getAttribute('aRandom');");
  expect(source).toContain("fieldParticlePosition(trackedParticles[i], positions[i]);");
  expect(source).toContain("return positions[idx % trackedParticles.length];");
  expect(source).toContain("geometry.drawRange.count");
  expect(source).toContain("trail.anchor.x * halfWidth");
  expect(source).not.toContain("posAttr.getX(pi)");
  expect(source).not.toContain("head.multiplyScalar(CONFIG.fieldRadius");
});

it("responds to bass across the rectangle without pushing its centre empty", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  expect(source).not.toContain("newPos += centerDir * smoothstep(0.3, 0.8, uBass)");
  expect(source).not.toContain("newPos += centerDir * onsetPunch");
  expect(source).not.toContain("newPos += dir * uOnsetEnergy");
  expect(source).not.toContain("uVortexStrength * uBass * 3.5 / (1.0 + distFromCenter");
  expect(source).toContain("newPos.z += bassDepth;");
  expect(source).toContain("newPos.z += uOnsetEnergy * 14.0");
});

it("adds sparse theme-coloured glints and a field-wide depth wave without extra particle layers", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  expect(source).toContain("float fieldWave = sin(");
  expect(source).toContain("newPos.z += fieldWave *");
  expect(source).toContain("vGlint = smoothstep(0.985, 0.998, aRandom.z)");
  expect(source).toContain("max(size * uPixelRatio * (90.0 / -mvPosition.z) * layerMod, vGlint * 4.5 * uPixelRatio)");
  expect(source).toContain("float glint =");
  expect(source).toContain("finalColor += vColor * vRimLight");
  expect(source).not.toContain("vec3(0.2, 0.3, 0.4) * vRimLight");
});

it("starts the restored renderer with bounded resolution and adaptive quality", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  expect(source).toContain("pixelRatio: fitPixelRatio()");
  expect(source).toMatch(/adaptiveQualityEnabled:\s*true/);
});

it("skips FFT while audio is paused and fades its response before resuming", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  const body = source.match(/const AUDIO = \{([\s\S]*?)\r?\n        \};\r?\n\r?\n        \/\/ --- SCENE SETUP ---/)?.[1];
  expect(body).toBeTruthy();
  const state = { bassGateEnabled: false, onsetDecay: 0.92 };
  const audio = new Function("STATE", "performance", `return {${body}};`)(state, { now: () => 1_000 });
  const analyser = { connect: vi.fn(), getByteFrequencyData: vi.fn((data: Uint8Array) => data.fill(180)) };
  const oldSource = { stop: vi.fn(), disconnect: vi.fn() };
  const newSource = { connect: vi.fn(), start: vi.fn() };
  audio.ctx = { sampleRate: 48_000, currentTime: 2, destination: {}, createBufferSource: () => newSource };
  audio.analyser = analyser;
  audio.data = new Uint8Array(2_048);
  audio.prevSpectrum = new Float32Array(2_048);
  audio.audioBuffer = { duration: 10 };
  audio.mode = "file";
  audio.source = oldSource;
  audio.isPlaying = true;
  audio.active = true;
  audio.update();
  expect(audio.gatedBands.bass).toBeGreaterThan(0);
  audio.beatEnergy = 0.8;
  audio.onsetEnergy = 0.5;

  audio.pause();
  for (let i = 0; i < 60; i++) audio.update();
  expect(analyser.getByteFrequencyData).toHaveBeenCalledTimes(1);
  expect(Object.values(audio.gatedBands)).toEqual(Array(7).fill(0));
  expect(audio.spectralCentroid).toBe(0);
  expect(audio.spectralFlux).toBe(0);
  expect(audio.beatEnergy).toBeLessThan(0.02);
  expect(audio.onsetEnergy).toBeLessThan(0.02);

  audio.play();
  audio.update();
  expect(analyser.getByteFrequencyData).toHaveBeenCalledTimes(2);
  expect(audio.gatedBands.bass).toBeGreaterThan(0);
});

it("keeps full-screen postprocessing within a pixel budget and recalculates after resize", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  const body = source.match(/function fitPixelRatio\(\) \{([\s\S]*?)\n        \}/)?.[1];
  expect(body).toBeTruthy();
  const fit = new Function("window", body!);
  expect(fit({ devicePixelRatio: 2, innerWidth: 900, innerHeight: 400 })).toBe(1.5);
  expect(fit({ devicePixelRatio: 2, innerWidth: 1920, innerHeight: 1080 }))
    .toBeCloseTo(Math.sqrt(2_100_000 / (1920 * 1080)));
  expect(fit({ devicePixelRatio: 2, innerWidth: 3840, innerHeight: 2160 }))
    .toBeCloseTo(Math.sqrt(2_100_000 / (3840 * 2160)));
  const resize = source.split("window.addEventListener('resize', () => {")[1]?.split("let pausedFromKit")[0] ?? "";
  expect(resize).toContain("STATE.pixelRatio = fitPixelRatio();");
  expect(resize).toContain("QUALITY_SYSTEM.applyQuality();");
});

it("scales the compositor and particles together on slower GPUs", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  expect(source).toContain("composer.setPixelRatio(pixelRatio);");
  expect(source).toContain("renderer.setPixelRatio(pixelRatio);");
  expect(source).toContain("material.uniforms.uPixelRatio.value = pixelRatio;");
  expect(source).toContain("secondaryMaterial.uniforms.uPixelRatio.value = pixelRatio;");
  expect(source).toContain("secondaryGeometry.instanceCount = visibleParticles - mainCount;");
  expect(source).toContain("i < this.trails.length * STATE.qualityLevel");
  expect(source).toContain("Math.min(STATE.pixelRatio, Math.max(0.35, STATE.pixelRatio * q))");
  expect(source).toContain("this.currentFPS < STATE.targetFPS * 0.6 ? 0.2 : 0.1");
  expect(source).toContain("performance.now() - this.lastAdjustTime > 1000");
});

it("allocates only the primary particle range reachable by the density control", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  expect(source).toContain("maxDensity: 0.14");
  expect(source).toContain("const mainCapacity = Math.ceil(CONFIG.maxParticles * CONFIG.maxDensity);");
  expect(source).toContain("i < mainCapacity");
  expect(source).toContain("Math.min(STATE.density, CONFIG.maxDensity)");
});

it("suspends offscreen animation callbacks and caps visual frames at the requested FPS", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  expect(source).toContain("cancelAnimationFrame(frameRequest)");
  expect(source).toContain("document.addEventListener('visibilitychange'");
  expect(source).toContain("1000 / Math.max(1, STATE.targetFPS)");
  expect(source).not.toMatch(/function animate\([^)]*\)\s*\{\s*requestAnimationFrame\(animate\)/);
});

it("does not build an invisible 3D lens flare or rewrite the hidden GUI every frame", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  expect(source).not.toContain("new Lensflare()");
  expect(source).not.toContain("createSoftGlow(256)");
  expect(source).not.toContain("lensflare.visible = false");
  expect(source.split("function animate(now)")[1]?.split("window.addEventListener('resize'")[0]).not.toContain("tickGuiTheme()");
});

it("does not download or construct the hidden legacy settings GUI", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  expect(source).not.toContain("lil-gui");
  expect(source).not.toContain("new GUI(");
  expect(source).not.toContain("gui.add(");
  expect(source).toContain("STATE.dofEnabled = !STATE.dofEnabled; customDOFPass.enabled = STATE.dofEnabled;");
  expect(source).toContain("lensFlareEnabled: value => lensFlarePass.enabled = value");
  expect(source).toContain("material.uniforms.uColor1.value.copy(main)");
});

it("reduces connection search work when adaptive quality drops", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  const body = source.match(/function refreshTrackedParticles\(\) \{([\s\S]*?)\n        \}/)?.[1];
  expect(body).toBeTruthy();
  const refresh = new Function("trackedParticles", "geometry", "connectionCount", "STATE", "CONFIG", body!);
  const tracked: number[] = [];
  const geometry = { drawRange: { count: 10_750 } };
  const config = { maxParticles: 250_000, initialDensity: 0.043 };
  refresh(tracked, geometry, 500, { qualityLevel: 1 }, config);
  expect(tracked).toHaveLength(500);
  refresh(tracked, geometry, 500, { qualityLevel: 0.3 }, config);
  expect(tracked).toHaveLength(150);
  geometry.drawRange.count = 1_000;
  refresh(tracked, geometry, 500, { qualityLevel: 1 }, config);
  expect(tracked).toHaveLength(152);
  expect(source).toContain("i < trackedParticles.length && connIdx < dynamicMax");
});

it("rebuilds the connection network only for active audio or changed idle settings", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  const body = source.match(/function shouldRebuildConnections\(activeAudio, current, previous, idleElapsed\) \{([\s\S]*?)\n        \}/)?.[1];
  expect(body).toBeTruthy();
  const shouldRebuild = new Function("activeAudio", "current", "previous", "idleElapsed", body!);
  const state = ["Gluon (Strong)", 20, 10_750, 1.7, 90, 1, false];
  expect(shouldRebuild(false, state, state, 0)).toBe(false);
  expect(shouldRebuild(false, state, null, 0)).toBe(true);
  expect(shouldRebuild(true, state, state, 0)).toBe(true);
  expect(shouldRebuild(false, ["Photon (EM)", ...state.slice(1)], state, 0)).toBe(true);
  expect(shouldRebuild(false, [state[0], 22, ...state.slice(2)], state, 0)).toBe(true);
  expect(shouldRebuild(false, [state[0], state[1], 1_000, ...state.slice(3)], state, 0)).toBe(true);
  expect(shouldRebuild(false, state, [...state.slice(0, -1), true], 0)).toBe(true);
  const render = source.split("// Update particle connections")[1]?.split("// Update crawlers")[0] ?? "";
  expect(render).toContain("AUDIO.mode === 'mic' || AUDIO.isPlaying");
  expect(render).toContain("lastConnectionState = null");
  expect(render).toContain("shouldRebuildConnections(activeAudio, connectionState, lastConnectionState, idleConnectionElapsed)");
});

it("keeps the idle connection network alive with a slow two-second refresh", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  const body = source.match(/function shouldRebuildConnections\(activeAudio, current, previous, idleElapsed\) \{([\s\S]*?)\n        \}/)?.[1];
  expect(body).toBeTruthy();
  const shouldRebuild = new Function("activeAudio", "current", "previous", "idleElapsed", body!);
  const state = ["Gluon (Strong)", 20, 10_750, 1.7, 90, 1, false];
  expect(shouldRebuild(false, state, state, 1.99)).toBe(false);
  expect(shouldRebuild(false, state, state, 2)).toBe(true);
  const render = source.split("// Update particle connections")[1]?.split("// Update crawlers")[0] ?? "";
  expect(render).toContain("idleConnectionElapsed");
  expect(render).toContain("updateConnections(");
  expect(render).not.toContain("refreshTrackedParticles();");
  expect(source).toContain("if (forceRefresh || connectionRefreshCounter >= CONNECTION_REFRESH_INTERVAL)");
});

it("caps both particle layers with the public budget while adaptive quality can lower it further", () => {
  const html = renderToStaticMarkup(createElement(QuantumFieldExperience, { particleBudget: 6_000 }));
  expect(html).toContain('data-particle-budget="6000"');
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  const body = source.match(/applyQuality\(\) \{([\s\S]*?)\n            \}\n        \};/)?.[1];
  expect(body).toBeTruthy();
  const apply = new Function("CONFIG", "STATE", "particleBudget", "geometry", "secondaryGeometry", "renderer", "composer", "material", "secondaryMaterial", body!);
  const config = { maxParticles: 250_000, maxDensity: 0.14, secondaryParticles: 50_000 };
  const run = (budget: number, qualityLevel: number, density = 0.043) => {
    const geometry = { setDrawRange: vi.fn() };
    const secondaryGeometry = { instanceCount: 0 };
    const renderer = { getPixelRatio: () => 1, setPixelRatio: vi.fn() };
    const composer = { setPixelRatio: vi.fn() };
    const material = { uniforms: { uPixelRatio: { value: 1 } } };
    const secondaryMaterial = { uniforms: { uPixelRatio: { value: 1 } } };
    apply(config, { density, qualityLevel, pixelRatio: 1 }, budget, geometry, secondaryGeometry, renderer, composer, material, secondaryMaterial);
    return geometry.setDrawRange.mock.lastCall![1] + secondaryGeometry.instanceCount;
  };
  expect(run(Infinity, 1)).toBe(60_750);
  expect(run(6_000, 1)).toBe(6_000);
  expect(run(6_000, 0.5)).toBe(3_000);
  expect(run(0, 1)).toBe(0);
  expect(run(Infinity, 1, 1)).toBe(85_000);
});

it("never raises the pixel ratio above the full-screen pixel cap on 8K screens", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  const body = source.match(/applyQuality\(\) \{([\s\S]*?)\n            \}\n        \};/)?.[1];
  expect(body).toBeTruthy();
  const apply = new Function("CONFIG", "STATE", "particleBudget", "geometry", "secondaryGeometry", "renderer", "composer", "material", "secondaryMaterial", body!);
  const setPixelRatio = vi.fn();
  const state = { density: 0.043, qualityLevel: 0.3, pixelRatio: 0.25 };
  apply({ maxParticles: 250_000, maxDensity: 0.14, secondaryParticles: 50_000 }, state, Infinity,
    { setDrawRange: vi.fn() }, { instanceCount: 0 }, { getPixelRatio: () => 1, setPixelRatio },
    { setPixelRatio: vi.fn() }, { uniforms: { uPixelRatio: { value: 1 } } },
    { uniforms: { uPixelRatio: { value: 1 } } });
  expect(setPixelRatio.mock.lastCall?.[0]).toBeLessThanOrEqual(state.pixelRatio);
});

it("updates and removes the particle cap without recreating the visualizer", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("getComputedStyle", () => ({ backgroundColor: "rgb(10, 10, 10)" }));
  let receive!: (event: MessageEvent) => void;
  vi.stubGlobal("window", { addEventListener: (_type: string, listener: typeof receive) => { receive = listener; }, removeEventListener: vi.fn() });
  const postMessage = vi.fn();
  const contentWindow = { postMessage };
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(createElement(QuantumFieldExperience, { particleBudget: 6_000 }), {
    createNodeMock: ({ type }) => type === "iframe" ? { contentWindow } : nodeMock(),
  }); });
  try {
    act(() => receive({ source: contentWindow, data: { type: "ad-qf-ready" } } as unknown as MessageEvent));
    expect(postMessage).toHaveBeenCalledWith({ type: "ad-qf-control", key: "particleBudget", value: 6_000 }, "*");
    act(() => tree.update(createElement(QuantumFieldExperience, { particleBudget: 1_200 })));
    expect(postMessage).toHaveBeenCalledWith({ type: "ad-qf-control", key: "particleBudget", value: 1_200 }, "*");
    act(() => tree.update(createElement(QuantumFieldExperience)));
    expect(postMessage).toHaveBeenCalledWith({ type: "ad-qf-control", key: "particleBudget", value: undefined }, "*");
  } finally {
    act(() => tree.unmount());
    vi.unstubAllGlobals();
  }
});

it("idles offscreen rendering and limits network rebuilds to 20 Hz", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  const host = readFileSync(new URL("../src/components/artwork/QuantumField/QuantumFieldExperience.tsx", import.meta.url), "utf8");
  expect(host).toContain("new IntersectionObserver");
  expect(host).toContain('send("visible", entry.isIntersecting)');
  expect(source).toContain("if (!renderVisible || document.hidden)");
  expect(source).toContain("else if (key === 'visible') {");
  expect(source).toContain("if (renderVisible) startFrames();");
  expect(source).toContain("connectionElapsed >= 1 / 20");
});

it("uses the preload margin only for mounting, not for keeping offscreen WebGL frames alive", () => {
  const host = readFileSync(new URL("../src/components/artwork/QuantumField/QuantumFieldExperience.tsx", import.meta.url), "utf8");
  expect(host).toMatch(/setMounted\(true\)[\s\S]*?rootMargin: "120px"/);
  expect(host).toMatch(/send\("visible", entry\.isIntersecting\)[\s\S]*?rootMargin: "0px"/);
});

it("does not keep a hidden GUI FPS listener running on every animation frame", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  expect(source).not.toContain(".name('Current FPS').listen()");
});

it("skips full-screen effect passes when their intensity is zero", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  const body = source.match(/const sideEffects = \{([\s\S]*?)\n        \};/)?.[1];
  expect(body).toBeTruthy();
  const pass = () => ({ enabled: true, uniforms: { uIntensity: { value: 1 } } });
  const chromaticPass = pass(), grainPass = pass(), lensFlarePass = pass(), godRaysPass = pass();
  const state = { lensFlareEnabled: true, lensFlareIntensity: 0, godRaysEnabled: true, godRaysIntensity: 0 };
  const effects = new Function("STATE", "chromaticPass", "grainPass", "lensFlarePass", "godRaysPass", `return ({${body}});`)(
    state, chromaticPass, grainPass, lensFlarePass, godRaysPass,
  );
  effects.chromaticAberration(0);
  effects.filmGrain(0);
  effects.lensFlareIntensity(0);
  effects.lensFlareEnabled(true);
  effects.godRaysIntensity(0);
  effects.godRaysEnabled(true);
  for (const effect of [chromaticPass, grainPass, lensFlarePass, godRaysPass]) expect(effect.enabled).toBe(false);
  effects.chromaticAberration(0.004);
  effects.filmGrain(0.001);
  state.lensFlareIntensity = 0.1;
  state.godRaysIntensity = 0.1;
  effects.lensFlareIntensity(0.1);
  effects.godRaysIntensity(0.1);
  for (const effect of [chromaticPass, grainPass, lensFlarePass, godRaysPass]) expect(effect.enabled).toBe(true);
  expect(source).toMatch(/bloomPass\.strength = [^;]+;\s*bloomPass\.enabled = bloomPass\.strength > 0;/);
  expect(source).toMatch(/anamorphicPass\.uniforms\.uIntensity\.value = [^;]+;\s*anamorphicPass\.enabled = anamorphicPass\.uniforms\.uIntensity\.value > 0;/);
});

it("defers the expensive iframe startup until its example approaches the viewport", () => {
  const host = readFileSync(new URL("../src/components/artwork/QuantumField/QuantumFieldExperience.tsx", import.meta.url), "utf8");
  expect(host).toContain('useState(typeof IntersectionObserver === "undefined")');
  expect(host).toContain("if (entry?.isIntersecting) setMounted(true)");
  expect(host).toContain("{mounted && <iframe");
});

it("keeps the embedded visualizer script syntactically valid", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/reference.html", import.meta.url), "utf8");
  const script = source.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
  expect(script).toBeTruthy();
  expect(() => transformSync(script!, { loader: "js" })).not.toThrow();
});

it("keeps a detailed volumetric field without an embedded renderer", () => {
  const component = readFileSync(new URL("../src/components/artwork/QuantumField/QuantumField.tsx", import.meta.url), "utf8");
  const renderer = readFileSync(new URL("../src/components/artwork/QuantumField/renderer.ts", import.meta.url), "utf8");
  expect(component).toMatch(/WEBGL_BUDGET\s*=\s*\{\s*low:\s*[3-9]\d_\d{3},\s*high:\s*[6-9]\d_\d{3}/);
  expect(renderer).toContain("vDepth");
  expect(renderer).toContain("vSparkle");
  expect(renderer).toContain("mix(tone, vec3(1.0), vSparkle");
  expect(renderer).toContain("gl.blendFunc(gl.SRC_ALPHA, gl.ONE);");
  expect(renderer).not.toContain("reference.html");
});

it("keeps the restored visualizer settings in kit controls", () => {
  const html = renderToStaticMarkup(createElement(QuantumFieldExperience));
  expect(html).toContain('data-ad-component="Tabs"');
  expect(html).toContain('data-ad-component="Slider"');
  expect(html).toContain("Gluon (Strong)");
});

it("fills the transparent viewport with the native field", () => {
  const css = readFileSync(new URL("../src/components/artwork/QuantumField/styles.css", import.meta.url), "utf8");
  expect(css).toMatch(/\.ad-qf-viewport > \.ad-quantum-field\s*\{[^}]*height:\s*100%/s);
  expect(css).not.toContain("mix-blend-mode");
});

it("sends field and audio controls to the restored visualizer", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("getComputedStyle", () => ({ backgroundColor: "rgb(10, 10, 10)" }));
  let receive!: (event: MessageEvent) => void;
  vi.stubGlobal("window", { setTimeout, clearTimeout, addEventListener: (_type: string, listener: typeof receive) => { receive = listener; }, removeEventListener: vi.fn() });
  const postMessage = vi.fn();
  const contentWindow = { postMessage };
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(createElement(QuantumFieldExperience), {
    createNodeMock: ({ type }) => type === "iframe" ? { contentWindow } : nodeMock(),
  }); });
  try {
    act(() => receive({ source: contentWindow, data: { type: "ad-qf-ready" } } as unknown as MessageEvent));
    const fieldChoice = tree.root.findByProps({ label: "Тип поля" });
    act(() => fieldChoice.props.onValueChange("Photon (EM)"));
    expect(postMessage).toHaveBeenCalledWith({ type: "ad-qf-control", key: "field", value: "Photon (EM)" }, "*");
    act(() => tree.root.findByType(Tabs).props.onValueChange("audio"));
    const file = { name: "song.mp3" } as File;
    act(() => tree.root.findByType(FilePicker).props.onFiles([file]));
    expect(postMessage).toHaveBeenCalledWith({ type: "ad-qf-control", key: "file", value: file }, "*");
  } finally {
    act(() => tree.unmount());
    vi.unstubAllGlobals();
  }
});

it("renders immediately without an Enter gate and inherits the theme palette", () => {
  const html = renderToStaticMarkup(createElement(ThemeProvider, {
    primary: "#10c99a", secondary: "#7cf3d0",
  }, createElement(QuantumField, { mode: "vortex", "aria-label": "Music field" })));
  expect(html).toContain('data-ad-component="QuantumField"');
  expect(html).toContain('data-mode="vortex"');
  expect(html).toContain('aria-label="Music field"');
  expect(html).toContain('canvas');
  expect(html).not.toMatch(/Enter|Start|Запустить/);
  expect(html).toContain("#10c99a");
  expect(html).toContain("#7cf3d0");
});

it("offers distinct field geometries with a bounded adaptive render budget", () => {
  expect(quantumFieldModes).toEqual([
    "orbit", "vortex", "lattice", "wave", "bloom", "helix", "terrain",
  ]);
  expect(new Set(quantumFieldModes).size).toBe(7);
  const low = quantumFieldResolution(1920, 1080, 3, "low");
  const high = quantumFieldResolution(1920, 1080, 3, "high");
  expect(low.width * low.height).toBeLessThanOrEqual(350_000);
  expect(high.width * high.height).toBeLessThanOrEqual(1_050_000);
  expect(high.width * high.height).toBeGreaterThan(low.width * low.height);
});

it("derives seven stable audio bands from an analyser without allocations in the draw loop", () => {
  const bins = new Uint8Array(128);
  bins.fill(255, 0, 8);
  const analyser = {
    frequencyBinCount: bins.length,
    getByteFrequencyData(target: Uint8Array) { target.set(bins); },
  };
  const frame = quantumFieldAudio(analyser, new Uint8Array(bins.length));
  expect(frame.bands).toHaveLength(7);
  expect(frame.bands[0]).toBeGreaterThan(frame.bands[6]);
  expect(frame.energy).toBeGreaterThan(0);
  expect(frame.bands.every((value) => value >= 0 && value <= 1)).toBe(true);
});

it("connects the canvas to the renderer and sizes it before the first visible frame", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("window", { devicePixelRatio: 1 });
  vi.stubGlobal("getComputedStyle", () => ({ getPropertyValue: () => "#ff244c" }));
  vi.stubGlobal("ResizeObserver", class {
    constructor(private callback: ResizeObserverCallback) {}
    observe() { this.callback([], this as unknown as ResizeObserver); }
    disconnect() {}
  });
  vi.stubGlobal("IntersectionObserver", undefined);
  const fill = vi.fn();
  const stroke = vi.fn();
  const setFillStyle = vi.fn();
  const canvas = { width: 300, height: 150, getContext: vi.fn(() => ({
    set fillStyle(value: string) { setFillStyle(value); },
    clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, arc() {}, fill, stroke,
  })) };
  const root = { getBoundingClientRect: () => ({ width: 400, height: 200 }) };
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(createElement(QuantumField, { paused: true }), {
    createNodeMock: ({ type }) => type === "canvas" ? canvas : root,
  }); });
  expect(canvas.getContext).toHaveBeenCalledWith("2d", { alpha: true });
  expect(canvas.width).toBe(400);
  expect(fill).toHaveBeenCalled();
  expect(stroke).toHaveBeenCalled();
  expect(setFillStyle.mock.calls.length).toBeLessThanOrEqual(4);
  act(() => tree.unmount());
  vi.unstubAllGlobals();
});

it("connects an explicitly supplied microphone stream and releases its audio graph", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("window", { devicePixelRatio: 1 });
  vi.stubGlobal("getComputedStyle", () => ({ getPropertyValue: () => "#ff244c" }));
  vi.stubGlobal("IntersectionObserver", undefined);
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  const disconnect = vi.fn(), close = vi.fn(), resume = vi.fn(async () => undefined);
  const connect = vi.fn();
  const analyser = { frequencyBinCount: 32, fftSize: 0, disconnect: vi.fn(), getByteFrequencyData: vi.fn((buffer: Uint8Array) => buffer.fill(0)) };
  const createMediaStreamSource = vi.fn(() => ({ connect, disconnect }));
  vi.stubGlobal("AudioContext", class {
    createAnalyser() { return analyser; }
    createMediaStreamSource = createMediaStreamSource;
    close = close;
    resume = resume;
  });
  const stream = {} as MediaStream;
  const canvas = { width: 300, height: 150, getContext: () => ({ clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, arc() {}, fill() {}, stroke() {} }) };
  const root = { getBoundingClientRect: () => ({ width: 400, height: 200 }) };
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(createElement(QuantumField, { paused: true, stream }), {
    createNodeMock: ({ type }) => type === "canvas" ? canvas : root,
  }); });
  expect(createMediaStreamSource).toHaveBeenCalledWith(stream);
  expect(connect).toHaveBeenCalledWith(analyser);
  expect(resume).toHaveBeenCalled();
  expect(analyser.getByteFrequencyData).toHaveBeenCalled();
  act(() => tree.unmount());
  expect(disconnect).toHaveBeenCalled();
  expect(close).toHaveBeenCalled();
  vi.unstubAllGlobals();
});

it("does not force an opaque rectangle over a consumer's themed surface", () => {
  const css = readFileSync(new URL("../src/components/artwork/QuantumField/styles.css", import.meta.url), "utf8");
  expect(css).toContain("background: transparent");
  expect(css).not.toMatch(/var\(--ad-neutral-950\)/);
});

it("shows the restored visualizer in the documentation stage", () => {
  const html = renderToStaticMarkup(createElement(QuantumFieldExample));
  expect(html).toContain('class="example-stage"');
  expect(html).not.toContain('data-stretch="true"');
  expect(html).toContain('data-ad-component="QuantumFieldExperience"');
  expect(html).toContain("<iframe");
});

it("keeps the interactive controls out of overview previews", () => {
  const html = renderToStaticMarkup(createElement(ExamplePreviewContext.Provider, {
    value: true,
  }, createElement(QuantumFieldExample)));
  expect(html).not.toContain("<iframe");
  expect(html).toContain('data-ad-component="QuantumField"');
});

it("loads audio files without autoplay and releases media, URLs, and context", async () => {
  const revokeObjectURL = vi.fn(), createObjectURL = vi.fn(() => "blob:track");
  vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
  const play = vi.fn(async () => undefined), pause = vi.fn();
  vi.stubGlobal("Audio", class {
    src: string;
    currentTime = 0;
    constructor(src: string) { this.src = src; }
    play = play;
    pause = pause;
  });
  const connect = vi.fn(), disconnect = vi.fn(), close = vi.fn(async () => undefined), resume = vi.fn(async () => undefined);
  const analyser = { connect: vi.fn(), disconnect: vi.fn(), fftSize: 0 };
  vi.stubGlobal("AudioContext", class {
    destination = {};
    createAnalyser() { return analyser; }
    createMediaElementSource() { return { connect, disconnect }; }
    close = close;
    resume = resume;
  });
  const controller = createQuantumFieldAudio();
  const file = new Blob(["audio"]);
  const media = controller.loadFile(file);
  expect(createObjectURL).toHaveBeenCalledWith(file);
  expect(play).not.toHaveBeenCalled();
  expect(controller.media).toBe(media);
  await controller.play();
  expect(resume).toHaveBeenCalled();
  expect(play).toHaveBeenCalled();
  controller.seek(12);
  expect(media.currentTime).toBe(12);
  await controller.dispose();
  expect(pause).toHaveBeenCalled();
  expect(disconnect).toHaveBeenCalled();
  expect(revokeObjectURL).toHaveBeenCalledWith("blob:track");
  expect(close).toHaveBeenCalled();
  vi.unstubAllGlobals();
});

it("repaints when an ancestor changes CSS theme tokens without React rerender", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("window", { devicePixelRatio: 1 });
  let primary = "#ff244c";
  vi.stubGlobal("getComputedStyle", () => ({ getPropertyValue: (name: string) => name === "--ad-primary" ? primary : "#ff7c97" }));
  vi.stubGlobal("IntersectionObserver", undefined);
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  let changed!: MutationCallback;
  vi.stubGlobal("MutationObserver", class {
    constructor(callback: MutationCallback) { changed = callback; }
    observe() {}
    disconnect() {}
  });
  const colours: string[] = [];
  const canvas = { width: 300, height: 150, getContext: () => ({
    set fillStyle(value: string) { colours.push(value); },
    clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, arc() {}, fill() {}, stroke() {},
  }) };
  const root = { parentElement: null, getBoundingClientRect: () => ({ width: 400, height: 200 }) };
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(createElement(QuantumField, { paused: true }), {
    createNodeMock: ({ type }) => type === "canvas" ? canvas : root,
  }); });
  expect(colours).toContain("#ff244c");
  primary = "#10c99a";
  act(() => changed([], {} as MutationObserver));
  expect(colours).toContain("#10c99a");
  act(() => tree.unmount());
  vi.unstubAllGlobals();
});

it("does not paint an offscreen field until it enters the viewport", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("window", { devicePixelRatio: 1 });
  vi.stubGlobal("getComputedStyle", () => ({ getPropertyValue: () => "#ff244c" }));
  vi.stubGlobal("MutationObserver", undefined);
  let reveal!: IntersectionObserverCallback;
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: IntersectionObserverCallback) { reveal = callback; }
    observe() {}
    disconnect() {}
  });
  vi.stubGlobal("ResizeObserver", class {
    constructor(private callback: ResizeObserverCallback) {}
    observe() { this.callback([], this as unknown as ResizeObserver); }
    disconnect() {}
  });
  const fill = vi.fn();
  const canvas = { width: 300, height: 150, getContext: () => ({ clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, arc() {}, fill, stroke() {} }) };
  const root = { getBoundingClientRect: () => ({ width: 400, height: 200 }) };
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(createElement(QuantumField, { paused: true }), {
    createNodeMock: ({ type }) => type === "canvas" ? canvas : root,
  }); });
  expect(fill).not.toHaveBeenCalled();
  act(() => reveal([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
  expect(fill).toHaveBeenCalled();
  act(() => tree.unmount());
  vi.unstubAllGlobals();
});

it("builds a volumetric 3D field instead of a flat point cloud", () => {
  const sphere = quantumFieldGeometry("orbit", 4_000);
  const vortex = quantumFieldGeometry("vortex", 4_000);
  expect(sphere).toHaveLength(16_000);
  const depths = Array.from({ length: 4_000 }, (_, i) => sphere[i * 4 + 2]!);
  expect(Math.max(...depths) - Math.min(...depths)).toBeGreaterThan(1.5);
  expect(vortex).not.toEqual(sphere);
  expect(sphere.some((_, i) => i % 4 === 0 && Math.hypot(sphere[i]!, sphere[i + 1]!, sphere[i + 2]!) > 1.15)).toBe(true);
  expect(sphere.some((_, i) => i % 4 === 0 && Math.hypot(sphere[i]!, sphere[i + 1]!, sphere[i + 2]!) < 0.25)).toBe(true);
});

it("adds connected volumetric filaments for detail at microscopic zoom", () => {
  const lines = quantumFieldFilaments("orbit", 48, 12);
  expect(lines).toHaveLength(48 * 12 * 2 * 4);
  const depths = Array.from({ length: lines.length / 4 }, (_, i) => lines[i * 4 + 2]!);
  expect(Math.max(...depths) - Math.min(...depths)).toBeGreaterThan(1);
  expect(Array.from(lines.slice(4, 8))).toEqual(Array.from(lines.slice(8, 12)));
});

it("rewires a bounded force network over time without rebuilding the full particle field", () => {
  const first = quantumFieldNetwork("orbit", 96, 0);
  const next = quantumFieldNetwork("orbit", 96, 1);
  expect(first.length).toBeGreaterThan(0);
  expect(first.length).toBeLessThanOrEqual(320 * 8);
  expect(next).not.toEqual(first);
  expect(quantumFieldNetwork("orbit", 96, 0)).toEqual(first);
});

it("zooms smoothly with the wheel while respecting camera limits", () => {
  expect(quantumFieldZoom(3.5, -120)).toBeLessThan(3.5);
  expect(quantumFieldZoom(3.5, 120)).toBeGreaterThan(3.5);
  let inside = 1.5;
  for (let i = 0; i < 5; i += 1) inside = quantumFieldZoom(inside, -500);
  expect(inside).toBeLessThan(0.5);
  expect(quantumFieldZoom(0.1, -500)).toBeLessThan(0.1);
  expect(quantumFieldZoom(0.01, -100_000)).toBeGreaterThanOrEqual(0.06);
  expect(quantumFieldZoom(9, 100_000)).toBeLessThanOrEqual(8);
});

it("links vertex and fragment lighting uniforms at matching precision", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/renderer.ts", import.meta.url), "utf8");
  const precisions = [...source.matchAll(/const (?:VERTEX|FRAGMENT) = `\s*precision (\w+) float;/g)].map((match) => match[1]);
  expect(precisions).toEqual(["mediump", "mediump"]);
});

it("composites the particle core over light themes rather than washing it out additively", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/renderer.ts", import.meta.url), "utf8");
  expect(source).toContain("gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);");
});

it("reserves soft halos for sparse highlights so the field stays sharply detailed", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/renderer.ts", import.meta.url), "utf8");
  expect(source).toContain("if (uHalo > 0.5 && vStar < 0.5) discard;");
  expect(source).toContain("vSparkle * (0.25 + vMicro * 0.75)");
});

it("does not rotate the whole field on hover or as time passes", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/renderer.ts", import.meta.url), "utf8");
  expect(source).toContain("float cy = cos(uYaw), sy = sin(uYaw);");
  expect(source).toContain("gl.drawArrays(gl.LINES");
});

it("gives particles independent three-axis motion instead of rigidly spinning the field", () => {
  const source = readFileSync(new URL("../src/components/artwork/QuantumField/renderer.ts", import.meta.url), "utf8");
  expect(source).toContain("vec3 fieldFlow(vec3 p, float t)");
  expect(source).toContain("p += fieldFlow(p,");
});

it("wires wheel zoom to the interactive component without scrolling the page", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const addEventListener = vi.fn();
  const removeEventListener = vi.fn();
  const doc = { addEventListener, removeEventListener };
  const root = { dataset: {} as Record<string, string> };
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(createElement(QuantumField, { interactive: true, paused: true }), {
    createNodeMock: ({ type }) => type === "canvas" ? {
      getContext: () => null,
      ownerDocument: doc,
      getBoundingClientRect: () => ({ left: 100, right: 500, top: 200, bottom: 400 }),
    } : root,
  }); });
  expect(addEventListener).toHaveBeenCalledWith("wheel", expect.any(Function), { passive: false, capture: true });
  const preventDefault = vi.fn();
  const wheel = addEventListener.mock.calls.find(([type]) => type === "wheel")![1];
  act(() => wheel({ clientX: 600, clientY: 300, deltaY: -120, preventDefault }));
  expect(preventDefault).not.toHaveBeenCalled();
  expect(root.dataset.zoom).toBeUndefined();
  act(() => wheel({ clientX: 300, clientY: 300, deltaY: -120, preventDefault }));
  expect(preventDefault).toHaveBeenCalled();
  expect(Number(root.dataset.zoom)).toBeLessThan(3.5);
  act(() => tree.unmount());
  expect(removeEventListener).toHaveBeenCalledWith("wheel", wheel, true);
  vi.unstubAllGlobals();
});
