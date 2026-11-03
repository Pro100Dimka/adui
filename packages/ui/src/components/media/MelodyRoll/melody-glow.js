// Keep the changing blur radius and CSS ease curve on the rendering thread.
function renderGlow() {
  const scenes = new Map();
  const fonts = new Map();
  let frame = null;
  function ease(x, out = false) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0, hi = 1;
    for (let i = 0; i < 18; i++) {
      const t = (lo + hi) / 2;
      const at = out ? 1.74 * (1 - t) * t * t + t ** 3 : 0.75 * (1 - t) * t + t ** 3;
      if (at < x) lo = t;
      else hi = t;
    }
    const t = (lo + hi) / 2;
    return (out ? 0 : 0.3 * (1 - t) ** 2 * t) + 3 * (1 - t) * t * t + t ** 3;
  }
  function value(scene, now) {
    return animated(scene.beat, now);
  }
  function mix(ctx, from, to, progress, space = 'oklab') {
    ctx.fillStyle = `color-mix(in ${space}, ${from}, ${to} ${progress * 100}%)`;
    return ctx.fillStyle;
  }
  function progress(channel, now) {
    const fraction = channel.duration > 0 ? Math.min(1, Math.max(0, (now - channel.start) / channel.duration)) : 1;
    return channel.linear ? fraction : ease(fraction);
  }
  function animated(channel, now, ctx) {
    const amount = progress(channel, now);
    if (amount === 1) return channel.to;
    if (amount === 0) return channel.from;
    if (Array.isArray(channel.to)) return Array.from({ length: Math.max(channel.from.length, channel.to.length) }, (_, i) => {
      const model = channel.to[i] ?? channel.from[i];
      const empty = { kind: model.kind, value: 1, x: 0, y: 0, blur: 0, spread: 0, color: 'transparent', inset: model.inset };
      const a = channel.from[i] ?? empty, b = channel.to[i] ?? empty;
      if (model.kind === 'brightness') return { kind: model.kind, value: a.value + (b.value - a.value) * amount };
      return { kind: model.kind, inset: b.inset, ...Object.fromEntries(['x', 'y', 'blur', 'spread'].map(key => [key, a[key] + (b[key] - a[key]) * amount])), color: mix(ctx, a.color, b.color, amount) };
    });
    return typeof channel.to === 'number' ? channel.from + (channel.to - channel.from) * amount : mix(ctx, channel.from, channel.to, amount);
  }
  function transition(previous, to, now, duration, ctx, linear = false) {
    if (Array.isArray(to) && previous?.to.some((shadow, i) => to[i] && (shadow.inset !== to[i].inset || shadow.kind !== to[i].kind))) previous = undefined;
    if (!previous || duration <= 0) return { from: to, to, start: now, duration: 0, reverse: to, factor: 1, linear };
    if (previous.to === to) return previous;
    const from = animated(previous, now, ctx);
    // CSS shortens a transition when it reverses towards its adjusted start value.
    const reversing = previous.reverse === to;
    const factor = reversing ? Math.min(1, Math.abs(progress(previous, now) * previous.factor + 1 - previous.factor)) : 1;
    return { from, to, start: now, duration: duration * factor, reverse: reversing ? previous.to : from, factor, linear };
  }
  function box(ctx, style, x, y, width, height, shadows = style.shadows) {
    const radius = style.radius.map(r => Math.min(r, width / 2, height / 2));
    const [top, right, bottom, left] = style.borders.map(edge => edge.width);
    const innerX = x + left, innerY = y + top, innerW = width - left - right, innerH = height - top - bottom;
    const innerR = radius.map((r, i) => ({ x: Math.max(0, r - ([1, 2].includes(i) ? right : left)), y: Math.max(0, r - (i < 2 ? top : bottom)) }));
    const shape = () => { ctx.beginPath(); ctx.roundRect(x, y, width, height, radius); };
    const dpr = ctx.getTransform().a;
    for (const shadow of [...shadows].reverse()) {
      if (shadow.inset) continue;
      ctx.save();
      ctx.beginPath(); ctx.rect(x - 200, y - 200, width + 400, height + 400); ctx.roundRect(x, y, width, height, radius); ctx.clip('evenodd');
      const offset = width + 1000;
      ctx.shadowOffsetX = (offset + shadow.x) * dpr; ctx.shadowOffsetY = shadow.y * dpr;
      ctx.shadowBlur = shadow.blur * dpr; ctx.shadowColor = shadow.color; ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.roundRect(x - offset - shadow.spread, y - shadow.spread, Math.max(0, width + 2 * shadow.spread), Math.max(0, height + 2 * shadow.spread), radius.map(r => Math.max(0, r + shadow.spread))); ctx.fill(); ctx.restore();
    }
    ctx.save(); shape(); ctx.clip();
    ctx.fillStyle = style.backgroundColor; ctx.fillRect(x, y, width, height);
    if (style.gradient.length) {
      const gradient = ctx.createLinearGradient(innerX, y, innerX + innerW, y);
      for (const stop of style.gradient) gradient.addColorStop(stop.at, stop.color);
      ctx.fillStyle = gradient; ctx.fillRect(x, y, width, height);
    }
    for (const shadow of [...shadows].reverse()) {
      if (!shadow.inset) continue;
      ctx.save();
      ctx.beginPath(); ctx.roundRect(innerX, innerY, innerW, innerH, innerR); ctx.clip();
      const offset = width + 1000;
      ctx.shadowOffsetX = (offset + shadow.x) * dpr; ctx.shadowOffsetY = shadow.y * dpr;
      ctx.shadowBlur = shadow.blur * dpr; ctx.shadowColor = shadow.color; ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.rect(innerX - offset - 200, innerY - 200, innerW + 400, innerH + 400);
      ctx.roundRect(innerX - offset + shadow.spread, innerY + shadow.spread, Math.max(0, innerW - 2 * shadow.spread), Math.max(0, innerH - 2 * shadow.spread), innerR.map(r => ({ x: Math.max(0, r.x - shadow.spread), y: Math.max(0, r.y - shadow.spread) })));
      ctx.fill('evenodd'); ctx.restore();
    }
    const border = style.borders.find(edge => edge.width > 0);
    if (border && style.borders.every(edge => !edge.width || edge.color === border.color)) {
      ctx.fillStyle = border.color;
      ctx.beginPath(); ctx.roundRect(x, y, width, height, radius); ctx.roundRect(innerX, innerY, innerW, innerH, innerR); ctx.fill('evenodd');
    } else for (let i = 0; i < 4; i++) {
      const edge = style.borders[i];
      ctx.fillStyle = edge.color;
      const rect = [[x, y, width, edge.width], [x + width - edge.width, y, edge.width, height], [x, y + height - edge.width, width, edge.width], [x, y, edge.width, height]][i];
      ctx.fillRect(...rect);
    }
    ctx.restore();
  }
  function text(ctx, style, value, x, y, width, height, color = style.color, right = false) {
    ctx.save();
    if (!right) { ctx.beginPath(); ctx.rect(x, y, width, height); ctx.clip(); }
    ctx.font = style.font; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    ctx.letterSpacing = style.letterSpacing;
    ctx.fillStyle = color;
    const metrics = ctx.measureText(value);
    const baseline = y + (style.baseline ?? (height - metrics.fontBoundingBoxAscent - metrics.fontBoundingBoxDescent) / 2 + metrics.fontBoundingBoxAscent);
    const start = x + (right ? style.offset : style.padding);
    for (const shadow of [...style.textShadows].reverse()) {
      ctx.save(); ctx.shadowColor = shadow.color; ctx.shadowBlur = shadow.blur * ctx.getTransform().a;
      ctx.shadowOffsetX = (width + 1000 + shadow.x) * ctx.getTransform().a; ctx.shadowOffsetY = shadow.y * ctx.getTransform().a;
      ctx.fillText(value, start - width - 1000, baseline); ctx.restore();
    }
    ctx.fillText(value, start, baseline); ctx.restore();
  }
  function retargetForeground(scene, now) {
    if (!scene.foreground) return;
    const { state, foreground: style, noteCtx: ctx } = scene;
    scene.noteStates ??= new Map();
    const kept = new Map();
    const from = state.position - state.span * state.lead;
    let until = 0;
    for (const [i, note] of (state.notes ?? []).entries()) {
      const previous = scene.noteStates.get(note.id);
      const visible = note.end >= from && note.start <= from + state.span;
      const hit = visible && state.hits?.[i] === 'h';
      const current = visible && state.position >= note.start && state.position <= note.end;
      const target = hit ? style.note.hit : current ? style.note.current : style.note.base;
      const item = { note, visible, hit, buffer: previous?.buffer,
        opacity: transition(previous?.opacity, visible && !hit && state.position > note.end ? style.note.pastOpacity : 1, now, style.note.opacityDuration),
        filter: transition(previous?.filter, target.filter, now, style.note.filterDuration, ctx),
        hitStart: hit && !previous?.hit ? (previous ? now : scene.noteTimes?.[note.id] ?? now) : previous?.hitStart ?? -Infinity };
      kept.set(note.id, item);
      until = Math.max(until, item.opacity.start + item.opacity.duration, item.filter.start + item.filter.duration, hit ? item.hitStart + style.note.hitDuration : 0);
    }
    scene.noteStates = kept;
    scene.keyStates ??= new Map();
    const keyStates = new Map();
    for (const key of style.keys) {
      const previous = scene.keyStates.get(key.midi);
      const active = state.pitch !== undefined && key.midi === Math.round(state.pitch);
      const hit = active && state.hit;
      const pressed = scene.pressed?.includes(key.midi);
      const variant = hit ? 'hit' : active ? 'active' : pressed ? 'pressed' : 'base';
      const target = key[variant];
      const item = { key, target, hit, variant, buffer: previous?.buffer,
        color: transition(previous?.color, target.color, now, key.duration, ctx),
        shadows: transition(previous?.shadows, target.shadows, now, key.duration, ctx),
        shift: transition(previous?.shift, pressed ? key.pressShift : 0, now, key.pressDuration),
        hitStart: hit && !previous?.hit ? (previous ? now : scene.keyTimes?.[key.midi] ?? now) : previous?.hitStart ?? now };
      keyStates.set(key.midi, item);
      until = Math.max(until, ...['color', 'shadows', 'shift'].map(name => item[name].start + item[name].duration), hit && key.hitDuration > 0 ? item.hitStart + key.hitDuration * key.hitIterations : 0);
    }
    scene.keyStates = keyStates;
    scene.noteTimes = scene.keyTimes = undefined;
    scene.foregroundUntil = until;
  }
  function drawForeground(scene, now) {
    if (!scene.foreground) return;
    const { noteCtx: ctx, keyCtx, foreground: style, state, dpr, laneWidth, laneHeight } = scene;
    ctx.clearRect(0, 0, laneWidth, laneHeight);
    scene.sprites ??= new Map();
    scene.filteredSprites ??= new Map(); scene.filteredPixels ??= 0;
    const from = state.position - state.span * state.lead;
    ctx.fillStyle = style.grid.color;
    const spacing = laneWidth / state.span;
    const shift = -(((from % 1) + 1) % 1) * spacing;
    for (let x = shift; x < laneWidth; x += spacing) ctx.fillRect(x, 0, style.grid.width, laneHeight);
    for (const item of scene.noteStates.values()) {
      if (!item.visible) continue;
      const { note } = item;
      const origin = Math.floor(from / state.span) * state.span;
      const left = Math.floor((note.start - origin) / state.span * laneWidth * 64) / 64;
      const width = Math.floor(Math.max(0.006, (note.end - note.start) / state.span) * laneWidth * 64) / 64;
      const height = Math.round(style.note.height * 64) / 64;
      const top = Math.floor((state.high - note.pitch) / state.rows * laneHeight * 64) / 64 + height * 0.158;
      const offsetX = left - Math.floor(left * dpr) / dpr, offsetY = top - Math.floor(top * dpr) / dpr;
      const lyric = state.showLyrics ? note.lyric ?? '' : '';
      const spriteKey = JSON.stringify([width, height, lyric, item.hit, offsetX, offsetY]);
      let sprite = scene.sprites.get(spriteKey);
      if (!sprite) {
        sprite = new OffscreenCanvas(Math.ceil((width + offsetX) * dpr), Math.ceil((height + offsetY) * dpr));
        const paint = sprite.getContext('2d'); paint.setTransform(dpr, 0, 0, dpr, 0, 0);
        const base = item.hit ? style.note.hit : style.note.base;
        paint.save(); paint.beginPath(); paint.roundRect(offsetX, offsetY, width, height, base.radius.map(radius => Math.min(radius, width / 2, height / 2))); paint.clip();
        box(paint, base, offsetX, offsetY, width, height); text(paint, style.note.text, lyric, offsetX, offsetY, width, height); paint.restore();
        scene.sprites.set(spriteKey, sprite);
        if (scene.sprites.size > 512) scene.sprites.delete(scene.sprites.keys().next().value);
      }
      let filter = animated(item.filter, now, ctx);
      const phase = style.note.hitDuration > 0 ? (now - item.hitStart) / style.note.hitDuration : 1;
      let scale = 1;
      if (item.hit && phase < 1) {
        const amount = phase < 0.28 ? ease(phase / 0.28, true) : 1 - ease((phase - 0.28) / 0.72, true);
        scale += 0.6 * amount;
        const a = style.note.hit.filter, b = style.note.peakFilter;
        filter = a.some((entry, i) => b[i] && entry.kind !== b[i].kind) ? (amount < 0.5 ? a : b) : animated({ from: a, to: b, start: 0, duration: 1, linear: true }, amount, ctx);
      }
      const filterValue = filter.map(part => part.kind === 'brightness' ? `brightness(${part.value})` : `drop-shadow(${part.x * dpr}px ${part.y * dpr}px ${part.blur * dpr}px ${part.color})`).join(' ') || 'none';
      let painted = sprite, padding = 0;
      if (filter.length) {
        padding = Math.ceil(style.note.filterPad * dpr);
        const filteredKey = spriteKey + filterValue;
        const settled = progress(item.filter, now) === 1 && (!item.hit || phase >= 1);
        painted = settled ? scene.filteredSprites.get(filteredKey) : null;
        if (!painted) {
          const w = sprite.width + padding * 2, h = sprite.height + padding * 2;
          if (!item.buffer || item.buffer.width !== w || item.buffer.height !== h) item.buffer = new OffscreenCanvas(w, h);
          painted = settled ? new OffscreenCanvas(w, h) : item.buffer;
          const paint = painted.getContext('2d'); paint.clearRect(0, 0, w, h); paint.filter = filterValue; paint.drawImage(sprite, padding, padding);
          if (settled && w * h <= 8 * 1024 * 1024) {
            scene.filteredSprites.set(filteredKey, painted); scene.filteredPixels += w * h;
            while (scene.filteredPixels > 8 * 1024 * 1024) { const oldest = scene.filteredSprites.keys().next().value; const old = scene.filteredSprites.get(oldest); scene.filteredPixels -= old.width * old.height; scene.filteredSprites.delete(oldest); }
          }
        }
      }
      ctx.save(); ctx.globalAlpha = animated(item.opacity, now);
      const x = left - offsetX + Number((((origin - from) / state.span) * 100).toFixed(3)) / 100 * laneWidth;
      const y = top - offsetY;
      ctx.drawImage(painted, x - padding / dpr, top + height / 2 + (y - padding / dpr - top - height / 2) * scale, painted.width / dpr, painted.height / dpr * scale); ctx.restore();
    }
    keyCtx.clearRect(0, 0, style.keyWidth, style.keyHeight);
    scene.keySprites ??= new Map();
    for (const item of scene.keyStates.values()) {
      const { key, target } = item;
      keyCtx.save();
      const phase = key.hitDuration > 0 ? ((now - item.hitStart) / key.hitDuration) % 1 : 0;
      // ease-in-out is symmetric around the peak at half of the key pulse.
      const fraction = phase < 0.5 ? phase * 2 : (1 - phase) * 2;
      let lo = 0, hi = 1;
      for (let i = 0; i < 18; i++) { const t = (lo + hi) / 2; if (1.26 * (1 - t) ** 2 * t + 1.74 * (1 - t) * t * t + t ** 3 < fraction) lo = t; else hi = t; }
      const t = (lo + hi) / 2;
      const baseBrightness = scene.hovered === key.midi ? 1.08 : 1;
      const brightness = item.hit && key.hitDuration > 0 && now < item.hitStart + key.hitDuration * key.hitIterations ? baseBrightness + (1.25 - baseBrightness) * (3 * (1 - t) * t * t + t ** 3) : baseBrightness;
      keyCtx.filter = `brightness(${brightness})`;
      const settled = progress(item.shadows, now) === 1 && progress(item.color, now) === 1;
      const cacheKey = `${key.midi}:${item.variant}`;
      let sprite = settled ? scene.keySprites.get(cacheKey) : null;
      const paintTop = Math.round(key.top * dpr) / dpr, paintWidth = Math.round(key.width * dpr) / dpr;
      const paintHeight = Math.round((key.top + key.height) * dpr) / dpr - paintTop;
      const pad = key.pad, width = paintWidth + pad * 2, height = paintHeight + pad * 2;
      if (!sprite) {
        sprite = settled ? new OffscreenCanvas(Math.ceil(width * dpr), Math.ceil(height * dpr)) : item.buffer ??= new OffscreenCanvas(Math.ceil(width * dpr), Math.ceil(height * dpr));
        const paint = sprite.getContext('2d'); paint.setTransform(dpr, 0, 0, dpr, 0, 0); paint.clearRect(0, 0, width, height);
        box(paint, target, pad, pad, paintWidth, paintHeight, animated(item.shadows, now, paint));
        const [top, right, bottom, left] = target.borders.map(edge => edge.width);
        text(paint, key.text, key.label, pad + left, pad + top + key.top - paintTop, key.width - left - right, key.height - top - bottom, animated(item.color, now, paint), true);
        if (settled) scene.keySprites.set(cacheKey, sprite);
      }
      keyCtx.drawImage(sprite, 0, 0, width * dpr, height * dpr, animated(item.shift, now) - pad, paintTop - pad, width, height);
      keyCtx.restore();
    }
  }
  function voiceValue(scene, now) {
    return Object.fromEntries(['y', 'size', 'color'].map(key => [key, animated(scene.voice[key], now, scene.voiceCtx)]));
  }
  function retargetVoice(scene, now, previous) {
    const { state, voiceStyle: style, voiceCtx: ctx, laneHeight } = scene;
    const to = { y: (state.high - (state.pitch ?? 0) + 0.5) / state.rows * laneHeight,
      size: style.size[0] + (style.size[1] - style.size[0]) * state.level,
      color: state.hit ? style.hitColor : mix(ctx, style.color[0], style.color[1], state.accuracy, 'oklch') };
    const hitStart = state.hit && !previous?.hit ? now : scene.voice?.hitStart ?? -Infinity;
    scene.voice = { ...Object.fromEntries(Object.entries(to).map(([key, target]) => [key,
      transition(previous?.pitch !== undefined ? scene.voice?.[key] : undefined, target, now, style.duration, ctx, key === 'y'),
    ])), hitStart };
  }
  function drawVoice(scene, now) {
    const { voiceCtx: ctx, laneWidth, laneHeight, state, voiceStyle: style, dpr } = scene;
    ctx.clearRect(0, 0, laneWidth, laneHeight);
    ctx.save();
    const head = state.lead * laneWidth - scene.headWidth / 2;
    const offset = laneWidth + 200;
    ctx.beginPath(); ctx.rect(0, 0, laneWidth, laneHeight); ctx.rect(head, 0, scene.headWidth, laneHeight); ctx.clip('evenodd');
    ctx.globalAlpha = state.beat;
    ctx.shadowOffsetX = offset * dpr;
    for (const shadow of [...scene.headShadows].reverse()) {
      ctx.shadowBlur = shadow.blur * dpr;
      ctx.shadowColor = shadow.color;
      ctx.fillRect(head - offset, 0, scene.headWidth, laneHeight);
    }
    ctx.restore();
    if (state.pitch === undefined) return;
    const voice = voiceValue(scene, now);
    const phase = style.hitDuration > 0 ? (now - scene.voice.hitStart) / style.hitDuration : 1;
    const scale = state.hit && phase < 1 ? 1 + 0.35 * (phase < 0.45 ? ease(phase / 0.45, true) : 1 - ease((phase - 0.45) / 0.55, true)) : 1;
    const x = state.lead * laneWidth, r = voice.size * scale / 2;
    for (let i = style.shadows[0].length - 1; i >= 0; i--) {
      const a = style.shadows[0][i], b = style.shadows[1][i];
      const blur = (a.blur + (b.blur - a.blur) * state.accuracy) * scale;
      const spread = (a.spread + (b.spread - a.spread) * state.accuracy) * scale;
      ctx.save();
      const offset = laneWidth + 100;
      ctx.shadowOffsetX = offset * dpr;
      ctx.shadowBlur = blur * dpr;
      ctx.shadowColor = mix(ctx, a.color, b.color, state.accuracy, 'srgb');
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(x - offset, voice.y, r + spread, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = style.borderColor;
    ctx.beginPath(); ctx.arc(x, voice.y, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = voice.color;
    ctx.beginPath(); ctx.arc(x, voice.y, Math.max(0, r - style.border * scale), 0, Math.PI * 2); ctx.fill();
  }
  function updateTrail(scene) {
    const { position, pitch } = scene.state;
    if (scene.trail.at(-1)?.t !== position)
      scene.trail = [...scene.trail.filter(point => point.t > position - 3 && point.t < position), { t: position, pitch }];
  }
  function drawTrail(scene) {
    const { trailCtx: ctx, laneWidth, laneHeight, state, trailStyle } = scene;
    ctx.clearRect(0, 0, laneWidth, laneHeight);
    const paths = [];
    let path = null;
    for (const point of scene.trail) {
      if (point.pitch === undefined) { path = null; continue; }
      const x = Number(((point.t - state.position + state.span * state.lead) / state.span * 100).toFixed(2)) / 100 * laneWidth;
      const y = Number(((state.high - point.pitch + 0.5) / state.rows * 100).toFixed(2)) / 100 * laneHeight;
      if (!path) { path = new Path2D(); path.moveTo(x, y); paths.push(path); }
      else path.lineTo(x, y);
    }
    ctx.lineCap = ctx.lineJoin = 'round';
    for (const path of paths) for (const layer of trailStyle) {
      ctx.strokeStyle = mix(ctx, layer.color[0], layer.color[1], state.accuracy, 'oklch');
      ctx.lineWidth = layer.width;
      ctx.globalAlpha = layer.opacity;
      ctx.stroke(path);
    }
    ctx.globalAlpha = 1;
  }
  function draw(scene, now) {
    const { ctx, width, height, pad, radius, blur, color, dpr } = scene;
    ctx.clearRect(0, 0, width + pad * 2, height + pad * 2);
    const amount = value(scene, now);
    if (amount > 0) {
      ctx.save();
      // Outer shadows do not paint over the translucent glass inside the border box.
      ctx.beginPath();
      ctx.rect(0, 0, width + pad * 2, height + pad * 2);
      ctx.roundRect(pad, pad, width, height, radius);
      ctx.clip('evenodd');
      const offset = width + pad * 4;
      ctx.shadowOffsetX = offset * dpr;
      ctx.shadowBlur = blur * amount * dpr;
      ctx.shadowColor = color;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.roundRect(pad - offset, pad, width, height, radius);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = amount;
      ctx.translate(pad, pad);
      ctx.beginPath(); ctx.roundRect(0, 0, width, height, radius); ctx.clip();
      ctx.save();
      ctx.translate(width * 0.25, height * 0.5);
      ctx.scale(width * 0.8, height * 1.2);
      const light = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      light.addColorStop(0, scene.lightColors[0]);
      light.addColorStop(0.7, `rgb(from ${scene.lightColors[0]} r g b / 0)`);
      ctx.fillStyle = light;
      ctx.fillRect(-0.25 / 0.8, -0.5 / 1.2, 1 / 0.8, 1 / 1.2);
      ctx.restore();
      ctx.strokeStyle = scene.lightBorder;
      ctx.lineWidth = scene.lightWidth;
      const half = scene.lightWidth / 2;
      ctx.beginPath(); ctx.roundRect(half, half, width - scene.lightWidth, height - scene.lightWidth, radius.map(r => Math.max(0, r - half))); ctx.stroke();
      ctx.restore();
    }
    drawTrail(scene);
    drawForeground(scene, now);
    drawVoice(scene, now);
  }
  function tick(now) {
    now += performance.timeOrigin;
    frame = null;
    for (const scene of scenes.values()) if (scene.visible && !scene.loading) draw(scene, now);
    if ([...scenes.values()].some(scene => scene.visible && !scene.loading && now < Math.max(scene.foregroundUntil ?? 0, scene.beat.start + scene.beat.duration, ...['y', 'size', 'color'].map(key => scene.voice[key].start + scene.voice[key].duration), scene.state.hit ? scene.voice.hitStart + scene.voiceStyle.hitDuration : 0)))
      frame = requestAnimationFrame(tick);
  }
  onmessage = async ({ data }) => {
    try {
      let scene = scenes.get(data.id);
      const now = data.time ?? performance.timeOrigin + performance.now();
      if (data.type === 'remove') scenes.delete(data.id);
      else if (data.type === 'configure') {
        const canvas = scene?.canvas ?? data.canvas;
        const previous = scene?.state;
        if (scene?.voice && scene.laneHeight > 0) {
          scene.voice.y.from *= data.laneHeight / scene.laneHeight;
          scene.voice.y.to *= data.laneHeight / scene.laneHeight;
          scene.voice.y.reverse *= data.laneHeight / scene.laneHeight;
        }
        const voiceCanvas = scene?.voiceCanvas ?? data.voiceCanvas;
        const trailCanvas = scene?.trailCanvas ?? data.trailCanvas;
        scene = { ...scene, ...data, canvas, voiceCanvas, trailCanvas, beat: transition(scene?.beat, data.state.beat, now, data.duration), trail: scene?.trail ?? data.state.trail ?? [] };
        canvas.width = Math.ceil((data.width + data.pad * 2) * data.dpr);
        canvas.height = Math.ceil((data.height + data.pad * 2) * data.dpr);
        scene.ctx = canvas.getContext('2d');
        scene.ctx.setTransform(data.dpr, 0, 0, data.dpr, 0, 0);
        voiceCanvas.width = Math.ceil(data.laneWidth * data.dpr);
        voiceCanvas.height = Math.ceil(data.laneHeight * data.dpr);
        scene.voiceCtx = voiceCanvas.getContext('2d');
        scene.voiceCtx.fillStyle = '#010203';
        scene.voiceCtx.fillStyle = 'color-mix(in oklch, white, #2ee886 50%)';
        if (scene.voiceCtx.fillStyle === '#010203') throw new Error('Canvas color interpolation is unavailable');
        scene.voiceCtx.setTransform(data.dpr, 0, 0, data.dpr, 0, 0);
        trailCanvas.width = Math.ceil(data.laneWidth * data.dpr);
        trailCanvas.height = Math.ceil(data.laneHeight * data.dpr);
        scene.trailCtx = trailCanvas.getContext('2d');
        scene.trailCtx.setTransform(data.dpr, 0, 0, data.dpr, 0, 0);
        if (data.foreground) {
          scene.noteCanvas ??= data.noteCanvas; scene.keyCanvas ??= data.keyCanvas;
          scene.noteCanvas.width = Math.ceil(data.laneWidth * data.dpr); scene.noteCanvas.height = Math.ceil(data.laneHeight * data.dpr);
          scene.keyCanvas.width = Math.ceil(data.foreground.keyWidth * data.dpr); scene.keyCanvas.height = Math.ceil(data.foreground.keyHeight * data.dpr);
          scene.noteCtx = scene.noteCanvas.getContext('2d'); scene.keyCtx = scene.keyCanvas.getContext('2d');
          scene.noteCtx.setTransform(data.dpr, 0, 0, data.dpr, 0, 0); scene.keyCtx.setTransform(data.dpr, 0, 0, data.dpr, 0, 0);
          scene.sprites?.clear(); scene.keySprites?.clear(); scene.filteredSprites?.clear(); scene.filteredPixels = 0;
          for (const item of scene.noteStates?.values() ?? []) item.buffer = undefined;
          for (const item of scene.keyStates?.values() ?? []) item.buffer = undefined;
          retargetForeground(scene, now);
        }
        updateTrail(scene);
        retargetVoice(scene, now, previous);
        if (data.hitStartedAt !== undefined) scene.voice.hitStart = data.hitStartedAt;
        scenes.set(data.id, scene);
        if (scene.foreground?.fonts.length) {
          scene.loading = true;
          try {
            await Promise.all(scene.foreground.fonts.map(definition => {
              const key = JSON.stringify(definition);
              if (!fonts.has(key)) fonts.set(key, new FontFace(definition.family, definition.src, definition.descriptors).load().then(face => self.fonts.add(face)));
              return fonts.get(key);
            }));
          } catch { scenes.delete(data.id); postMessage({ id: data.id, failed: true }); return; }
          if (scenes.get(data.id) !== scene) return;
          scene.loading = false;
        }
        draw(scene, performance.timeOrigin + performance.now());
        postMessage({ id: data.id, revision: data.revision });
      } else if (scene && data.type === 'state') {
        const previous = scene.state;
        scene.beat = transition(scene.beat, data.state.beat, now, scene.duration);
        scene.state = { ...scene.state, ...data.state };
        updateTrail(scene);
        retargetVoice(scene, now, previous);
        retargetForeground(scene, now);
      } else if (scene && data.type === 'keys') {
        scene.pressed = data.pressed; scene.hovered = data.hovered;
        retargetForeground(scene, now);
      } else if (scene && data.type === 'visible') scene.visible = data.visible;
      if (frame === null && [...scenes.values()].some(scene => scene.visible && !scene.loading)) frame = requestAnimationFrame(tick);
    } catch {
      scenes.delete(data.id);
      postMessage({ id: data.id, failed: true });
    }
  };
}

let thread = null, url = null, serial = 0, unavailable = false;
const clients = new Map();
export function createMelodyGlow(root, initialState, onReady) {
  if (unavailable || typeof Worker === 'undefined' || typeof OffscreenCanvas === 'undefined' ||
      typeof ResizeObserver === 'undefined' || typeof IntersectionObserver === 'undefined' ||
      typeof MutationObserver === 'undefined' || typeof HTMLCanvasElement === 'undefined' ||
      typeof matchMedia === 'undefined' ||
      !HTMLCanvasElement.prototype.transferControlToOffscreen) return null;
  try {
    if (!thread) {
      url = URL.createObjectURL(new Blob([`(${renderGlow.toString()})()`], { type: 'text/javascript' }));
      thread = new Worker(url);
      thread.onmessage = ({ data }) => data.failed ? clients.get(data.id)?.dispose() : clients.get(data.id)?.ready(data);
      thread.onerror = () => { unavailable = true; for (const client of [...clients.values()]) client.dispose(); };
    }
  } catch {
    unavailable = true;
    if (url) URL.revokeObjectURL(url);
    thread = url = null;
    return null;
  }
  const worker = thread, id = ++serial;
  const canvas = document.createElement('canvas');
  canvas.className = 'ad-melody-glow';
  canvas.style.visibility = 'hidden';
  root.append(canvas);
  const lane = root.querySelector('.ad-melody-roll-lane');
  const voiceCanvas = document.createElement('canvas');
  voiceCanvas.className = 'ad-melody-voice-canvas';
  voiceCanvas.style.visibility = 'hidden';
  lane.append(voiceCanvas);
  const trailCanvas = document.createElement('canvas');
  trailCanvas.className = 'ad-melody-trail';
  trailCanvas.style.visibility = 'hidden';
  lane.insertBefore(trailCanvas, lane.querySelector('.ad-melody-playhead'));
  const noteCanvas = document.createElement('canvas'), keyCanvas = document.createElement('canvas');
  noteCanvas.className = 'ad-melody-note-canvas'; keyCanvas.className = 'ad-melody-key-canvas';
  noteCanvas.style.visibility = keyCanvas.style.visibility = 'hidden';
  lane.insertBefore(noteCanvas, trailCanvas);
  const keyboard = root.querySelector('.ad-melody-roll-keys');
  keyboard.append(keyCanvas);
  for (const layer of [canvas, voiceCanvas, trailCanvas, noteCanvas, keyCanvas]) layer.setAttribute('aria-hidden', 'true');
  let state = initialState, disposed = false, transferred = false, inView = true, revision = 0, signature = '';
  const visible = () => inView && !document.hidden && !root.closest('[data-ad-paused], [data-ad-offscreen]');
  const visibility = () => worker.postMessage({ type: 'visible', id, visible: visible() });
  const resize = new ResizeObserver(configure);
  const intersection = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; visibility(); });
  const tokens = new MutationObserver(records => {
    visibility();
    if (records.some(record => !['data-ad-paused', 'data-ad-offscreen'].includes(record.attributeName))) configure();
  });
  for (let node = root; node; node = node.parentElement)
    tokens.observe(node, { attributes: true, attributeFilter: ['style', 'class', 'data-ad-theme', 'data-ad-color-scheme', 'data-ad-motion', 'data-ad-paused', 'data-ad-offscreen'] });
  resize.observe(root);
  resize.observe(lane);
  intersection.observe(root);
  document.addEventListener('visibilitychange', visibility);
  window.addEventListener('resize', configure);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  reduced.addEventListener('change', configure);
  document.fonts?.addEventListener('loadingdone', configure);
  const keysChanged = () => worker.postMessage({ type: 'keys', id, time: performance.timeOrigin + performance.now(),
    pressed: [...keyboard.querySelectorAll('[data-pressed]')].map(node => Number(node.dataset.midi)),
    hovered: keyboard.querySelector('button:hover') ? Number(keyboard.querySelector('button:hover').dataset.midi) : undefined });
  const keyObserver = new MutationObserver(records => {
    if (records.some(record => record.type === 'childList')) configure();
    keysChanged();
  });
  keyObserver.observe(keyboard, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-pressed'] });
  keyboard.addEventListener('pointerover', keysChanged); keyboard.addEventListener('pointerout', keysChanged);
  const split = value => value.split(/,\s*(?![^()]*\))/);
  const shadows = (value, text = false) => value === 'none' ? [] : split(value).map(part => {
    const inset = part.includes('inset');
    const match = part.replace(/\s*inset\s*/, '').match(text ? /^(.*) (-?[\d.]+)px (-?[\d.]+)px ([\d.]+)px$/ : /^(.*) (-?[\d.]+)px (-?[\d.]+)px ([\d.]+)px (-?[\d.]+)px$/);
    if (!match) throw new Error('Unsupported foreground shadow');
    return { color: match[1], x: Number(match[2]), y: Number(match[3]), blur: Number(match[4]), spread: Number(match[5] ?? 0), inset };
  });
  const filters = value => {
    const result = [];
    while (value && value !== 'none') {
      const kind = value.slice(0, value.indexOf('('));
      let depth = 1, end = kind.length + 1;
      for (; depth && end < value.length; end++) { if (value[end] === '(') depth++; if (value[end] === ')') depth--; }
      const argument = value.slice(kind.length + 1, end - 1);
      if (kind === 'brightness') result.push({ kind, value: Number(argument) });
      else if (kind === 'drop-shadow') result.push({ kind, ...shadows(argument, true)[0] });
      else throw new Error('Unsupported note filter');
      value = value.slice(end).trim();
    }
    return result;
  };
  const surface = node => {
    const style = getComputedStyle(node);
    if ([style.borderTopLeftRadius, style.borderTopRightRadius, style.borderBottomRightRadius, style.borderBottomLeftRadius].some(value => !/^[\d.]+px$/.test(value)) ||
        ['Top', 'Right', 'Bottom', 'Left'].some(side => !['none', 'solid'].includes(style[`border${side}Style`]))) throw new Error('Unsupported foreground border');
    const gradient = style.backgroundImage === 'none' ? [] : split(style.backgroundImage.slice(16, -1)).slice(1).map(stop => {
      const match = stop.match(/^(.*?)(?: ([\d.]+)%)?$/);
      return { color: match[1], at: match[2] === undefined ? undefined : Number(match[2]) / 100 };
    });
    if (style.backgroundImage !== 'none' && !style.backgroundImage.startsWith('linear-gradient(90deg,')) throw new Error('Unsupported note background');
    if (gradient.length) {
      gradient[0].at ??= 0; gradient.at(-1).at ??= 1;
      for (let i = 1; i < gradient.length - 1; i++) if (gradient[i].at === undefined) {
        let end = i; while (gradient[end].at === undefined) end++;
        const start = gradient[i - 1].at, count = end - i + 1;
        for (let j = i; j < end; j++) gradient[j].at = start + (gradient[end].at - start) * (j - i + 1) / count;
      }
    }
    return { gradient, backgroundColor: style.backgroundColor, color: style.color, filter: filters(style.filter), shadows: shadows(style.boxShadow),
      radius: [style.borderTopLeftRadius, style.borderTopRightRadius, style.borderBottomRightRadius, style.borderBottomLeftRadius].map(parseFloat),
      borders: ['Top', 'Right', 'Bottom', 'Left'].map(side => ({ width: parseFloat(style[`border${side}Width`]), color: style[`border${side}Color`] })) };
  };
  const lettering = (node, right = false) => {
    const style = getComputedStyle(node);
    if (style.fontFeatureSettings !== 'normal' || style.fontVariationSettings !== 'normal' || style.fontVariant !== 'normal' ||
        style.textTransform !== 'none' || style.direction !== 'ltr' || !['normal', '100%'].includes(style.fontStretch)) throw new Error('Unsupported foreground typography');
    const parent = node.parentElement, parentStyle = getComputedStyle(parent);
    const marker = document.createElement('i');
    Object.assign(marker.style, { display: 'inline-block', width: '0', height: '0', padding: '0', border: '0', margin: '0', verticalAlign: 'baseline' });
    node.append(marker);
    const parentBox = parent.getBoundingClientRect(), labelBox = node.getBoundingClientRect();
    const baseline = marker.getBoundingClientRect().top - parentBox.top - parseFloat(parentStyle.borderTopWidth);
    const offset = labelBox.left - parentBox.left - parseFloat(parentStyle.borderLeftWidth);
    marker.remove();
    return { font: `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`, color: style.color,
      baseline, offset,
      letterSpacing: style.letterSpacing === 'normal' ? '0px' : style.letterSpacing,
      padding: parseFloat(right ? getComputedStyle(node.parentElement).paddingRight : style.paddingLeft), textShadows: shadows(style.textShadow, true) };
  };
  function configure() {
    if (disposed || !root.clientWidth || !root.clientHeight) return;
    const temporary = [];
    try {
      const probe = document.createElement('div');
      temporary.push(probe);
      probe.className = root.className;
      probe.style.cssText = root.style.cssText;
      probe.style.setProperty('--ad-roll-beat', '1');
      Object.assign(probe.style, { position: 'absolute', visibility: 'hidden', pointerEvents: 'none' });
      root.append(probe);
      const style = getComputedStyle(probe);
      const shadow = style.boxShadow.match(/^(.*) 0px 0px ([\d.]+)px 0px$/);
      const radius = [style.borderTopLeftRadius, style.borderTopRightRadius, style.borderBottomRightRadius, style.borderBottomLeftRadius];
      const duration = parseFloat(style.transitionDuration) * 1000;
      const rootStyle = getComputedStyle(root);
      const width = parseFloat(rootStyle.width), height = parseFloat(rootStyle.height);
      probe.remove();
      if (!shadow || radius.some(value => !/^[\d.]+px$/.test(value)) || !Number.isFinite(width + height)) { dispose(); return; }
      const blur = Number(shadow[2]), pad = Math.ceil(blur * 2);
      Object.assign(canvas.style, { left: `${-pad}px`, top: `${-pad}px`, width: `${width + pad * 2}px`, height: `${height + pad * 2}px` });
      const lightStyle = getComputedStyle(root.querySelector('.ad-melody-roll-light'));
      if (!lightStyle.backgroundImage.startsWith('radial-gradient(80% 120% at 25% 50%,')) throw new Error('Unsupported melody light');
      const lightColors = lightStyle.backgroundImage.slice(lightStyle.backgroundImage.indexOf(',') + 1, -1).split(/,\s*(?![^()]*\))/).map(color => color.trim().replace(/\s+[\d.]+%$/, ''));
      const lightBorder = lightStyle.borderTopColor, lightWidth = parseFloat(lightStyle.borderTopWidth);
      const headStyle = getComputedStyle(lane.querySelector('.ad-melody-playhead-light'));
      const headShadows = headStyle.boxShadow.split(/,\s*(?![^()]*\))/).map(shadow => {
        const match = shadow.match(/^(.*) 0px 0px ([\d.]+)px 0px$/);
        return { color: match[1], blur: Number(match[2]) };
      });
      const headWidth = parseFloat(getComputedStyle(lane.querySelector('.ad-melody-playhead')).width);
      const marker = document.createElement('span');
      temporary.push(marker);
      marker.className = 'ad-melody-voice';
      marker.style.visibility = 'hidden';
      lane.append(marker);
      const voiceDuration = parseFloat(getComputedStyle(marker).transitionDuration) * 1000;
      marker.style.transition = 'none';
      marker.setAttribute('data-hit', '');
      const hitStyle = getComputedStyle(marker);
      const hitColor = hitStyle.backgroundColor, hitDuration = parseFloat(hitStyle.animationDuration) * 1000;
      marker.removeAttribute('data-hit');
      marker.style.animation = 'none';
      const samples = [0, 1].map(value => {
        marker.style.setProperty('--ad-roll-level', value);
        marker.style.setProperty('--ad-roll-accuracy', value);
        const computed = getComputedStyle(marker);
        if (computed.borderRadius !== '50%' || computed.width !== computed.height || computed.backgroundImage !== 'none') throw new Error('Unsupported melody marker');
        const shadows = computed.boxShadow.split(/,\s*(?![^()]*\))/).map(shadow => {
          const match = shadow.match(/^(.*) 0px 0px ([\d.]+)px ([\d.]+)px$/);
          if (!match) throw new Error('Unsupported melody shadow');
          return { color: match[1], blur: Number(match[2]), spread: Number(match[3]) };
        });
        return { size: parseFloat(computed.width), color: computed.backgroundColor, shadows, border: parseFloat(computed.borderTopWidth), borderColor: computed.borderTopColor };
      });
      marker.remove();
      const voiceStyle = { size: samples.map(sample => sample.size), color: samples.map(sample => sample.color), shadows: samples.map(sample => sample.shadows), border: samples[0].border, borderColor: samples[0].borderColor, hitColor, hitDuration, duration: voiceDuration };
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      temporary.push(svg);
      svg.setAttribute('class', 'ad-melody-trail');
      svg.style.visibility = 'hidden';
      lane.append(svg);
      const trailStyle = ['wide', 'near', ''].map(halo => {
        const path = document.createElementNS(svg.namespaceURI, 'path');
        if (halo) path.setAttribute('data-halo', halo);
        svg.append(path);
        const color = [0, 1].map(value => {
          svg.style.setProperty('--ad-roll-accuracy', value);
          return getComputedStyle(path).stroke;
        });
        const computed = getComputedStyle(path);
        return { color, width: parseFloat(computed.strokeWidth), opacity: Number(computed.opacity) };
      });
      svg.remove();
      const noteProbe = document.createElement('span'); temporary.push(noteProbe);
      noteProbe.className = 'ad-melody-note'; noteProbe.dataset.renderProbe = '';
      noteProbe.style.width = '100px'; noteProbe.style.visibility = 'hidden';
      const label = document.createElement('span'); label.textContent = 'M'; noteProbe.append(label);
      root.querySelector('.ad-melody-roll-strip').append(noteProbe);
      const noteDurations = getComputedStyle(noteProbe).transitionDuration.split(',').map(value => parseFloat(value) * 1000);
      noteProbe.style.transition = 'none'; noteProbe.style.animation = 'none';
      const noteStyle = { base: surface(noteProbe), height: parseFloat(getComputedStyle(noteProbe).height), text: lettering(label), filterDuration: noteDurations[0], opacityDuration: noteDurations[1] ?? noteDurations[0] };
      noteProbe.dataset.now = ''; noteStyle.current = surface(noteProbe); delete noteProbe.dataset.now;
      noteProbe.dataset.past = ''; noteStyle.pastOpacity = Number(getComputedStyle(noteProbe).opacity); delete noteProbe.dataset.past;
      noteProbe.dataset.hit = ''; noteStyle.hit = surface(noteProbe);
      noteProbe.style.animation = '';
      noteStyle.hitDuration = parseFloat(getComputedStyle(noteProbe).animationDuration) * 1000;
      const noteAnimation = noteProbe.getAnimations().find(animation => animation.animationName === 'ad-melody-hit');
      if (noteAnimation) { noteAnimation.pause(); noteAnimation.currentTime = noteStyle.hitDuration * 0.28; }
      noteStyle.peakFilter = filters(getComputedStyle(noteProbe).filter);
      noteStyle.filterPad = Math.ceil(Math.max(0, ...[noteStyle.base.filter, noteStyle.current.filter, noteStyle.hit.filter, noteStyle.peakFilter].map(filter => filter.reduce((pad, part) => pad + (part.kind === 'drop-shadow' ? Math.max(Math.abs(part.x), Math.abs(part.y)) + part.blur * 3 : 0), 0))));
      noteProbe.remove();
      const board = keyboard.cloneNode(true); temporary.push(board); board.dataset.renderProbe = '';
      for (const layer of board.querySelectorAll('canvas')) layer.remove();
      Object.assign(board.style, { position: 'absolute', width: `${keyboard.clientWidth}px`, height: `${keyboard.clientHeight}px`, visibility: 'hidden', pointerEvents: 'none' });
      root.append(board);
      const boardTop = board.getBoundingClientRect().top;
      const keys = [...board.querySelectorAll('.ad-piano-key')].map(node => {
        delete node.dataset.active; delete node.dataset.hit; delete node.dataset.pressed;
        const css = getComputedStyle(node), durations = css.transitionDuration.split(',').map(value => parseFloat(value) * 1000);
        node.style.transition = 'none'; node.style.animation = 'none';
        const bounds = node.getBoundingClientRect();
        const key = { midi: Number(node.dataset.midi), label: node.textContent, top: bounds.top - boardTop, width: bounds.width, height: bounds.height, text: lettering(node.querySelector('span') ?? node, true), duration: durations[0], pressDuration: durations[3] ?? durations[0] };
        key.base = surface(node);
        key.text.color = key.base.color;
        node.dataset.pressed = ''; key.pressed = surface(node); key.pressShift = parseFloat(getComputedStyle(node).translate); delete node.dataset.pressed;
        node.dataset.active = ''; key.active = surface(node);
        node.dataset.hit = ''; key.hit = surface(node);
        node.style.animation = ''; const hitCSS = getComputedStyle(node);
        key.hitDuration = parseFloat(hitCSS.animationDuration) * 1000;
        key.hitIterations = hitCSS.animationIterationCount === 'infinite' ? Infinity : Number(hitCSS.animationIterationCount);
        node.style.animation = 'none';
        key.pad = Math.ceil(Math.max(1, ...[key.base, key.pressed, key.active, key.hit].flatMap(style => style.shadows.map(shadow => Math.max(Math.abs(shadow.x), Math.abs(shadow.y)) + shadow.blur * 2 + Math.abs(shadow.spread)))));
        return key;
      });
      board.remove();
      const fonts = [];
      const fontNames = [noteStyle.text.font, ...keys.map(key => key.text.font)].join(',');
      const readFonts = sheet => {
        let rules; try { rules = sheet.cssRules; } catch { return; }
        for (const rule of rules) {
          if (rule.styleSheet) readFonts(rule.styleSheet);
          if (rule.type !== 5) continue;
          const family = rule.style.fontFamily.replaceAll('"', '').replaceAll("'", '');
          if (!fontNames.includes(family)) continue;
          fonts.push({ family, src: rule.style.getPropertyValue('src').replace(/url\(["']?([^"')]+)["']?\)/g, (_, url) => `url("${new URL(url, sheet.href ?? document.baseURI)}")`),
            descriptors: { ...Object.fromEntries(['weight', 'style', 'stretch'].map(key => [key, rule.style.getPropertyValue(`font-${key}`) || 'normal'])), unicodeRange: rule.style.getPropertyValue('unicode-range') || 'U+0-10FFFF' } });
        }
      };
      for (const sheet of document.styleSheets) readFonts(sheet);
      for (const face of document.fonts ?? []) if (fontNames.includes(face.family.replaceAll('"', '').replaceAll("'", '')) && !fonts.some(font => font.family === face.family.replaceAll('"', '').replaceAll("'", ''))) throw new Error('Font source is unavailable to the worker');
      const gridCSS = getComputedStyle(lane.querySelector('.ad-melody-roll-seconds')).backgroundImage;
      const gridStop = split(gridCSS.slice(16, -1))[1].match(/^(.*) ([\d.]+)px$/);
      if (!gridStop) throw new Error('Unsupported melody grid');
      const foreground = { note: noteStyle, keys, fonts, grid: { color: gridStop[1].trim(), width: Number(gridStop[2]) }, keyWidth: keyboard.clientWidth, keyHeight: keyboard.clientHeight };
      const config = { type: 'configure', id, width, height, pad, blur, color: shadow[1], radius: radius.map(parseFloat), dpr: devicePixelRatio || 1, duration, voiceStyle, trailStyle, lightColors, lightBorder, lightWidth, headShadows, headWidth, foreground, laneWidth: lane.clientWidth, laneHeight: lane.clientHeight };
      const nextSignature = JSON.stringify(config);
      if (nextSignature === signature) return;
      signature = nextSignature;
      const time = performance.timeOrigin + performance.now();
      const started = (node, name, duration) => time - Number(node?.getAnimations().find(animation => animation.animationName === name)?.currentTime ?? duration);
      const noteTimes = !transferred ? Object.fromEntries([...root.querySelectorAll('.ad-melody-note')].map((node, i) => [state.notes?.[i]?.id, started(node, 'ad-melody-hit', noteStyle.hitDuration)])) : undefined;
      const keyTimes = !transferred ? Object.fromEntries([...keyboard.querySelectorAll('.ad-piano-key')].map(node => [node.dataset.midi, started(node, 'ad-piano-key-hit', 0)])) : undefined;
      const animation = !transferred && state.hit ? lane.querySelector('.ad-melody-voice')?.getAnimations().find(animation => animation.animationName === 'ad-melody-voice-hit') : undefined;
      const message = { ...config, state, visible: visible(), revision: ++revision, time, noteTimes, keyTimes,
        hitStartedAt: !transferred && state.hit ? time - Number(animation?.currentTime ?? hitDuration) : undefined };
      if (!transferred) {
        const offscreen = canvas.transferControlToOffscreen();
        const voiceOffscreen = voiceCanvas.transferControlToOffscreen();
        const trailOffscreen = trailCanvas.transferControlToOffscreen();
        const noteOffscreen = noteCanvas.transferControlToOffscreen(), keyOffscreen = keyCanvas.transferControlToOffscreen();
        worker.postMessage({ ...message, canvas: offscreen, voiceCanvas: voiceOffscreen, trailCanvas: trailOffscreen, noteCanvas: noteOffscreen, keyCanvas: keyOffscreen }, [offscreen, voiceOffscreen, trailOffscreen, noteOffscreen, keyOffscreen]);
        transferred = true;
      } else worker.postMessage(message);
    } catch { dispose(); }
    finally { temporary.forEach(node => node.remove()); }
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    resize.disconnect(); intersection.disconnect(); tokens.disconnect(); keyObserver.disconnect();
    keyboard.removeEventListener('pointerover', keysChanged); keyboard.removeEventListener('pointerout', keysChanged);
    document.removeEventListener('visibilitychange', visibility);
    window.removeEventListener('resize', configure);
    reduced.removeEventListener('change', configure);
    document.fonts?.removeEventListener('loadingdone', configure);
    root.removeAttribute('data-ad-glow');
    root.removeAttribute('data-ad-foreground');
    onReady(false);
    canvas.remove();
    voiceCanvas.remove();
    trailCanvas.remove();
    noteCanvas.remove(); keyCanvas.remove();
    worker.postMessage({ type: 'remove', id });
    clients.delete(id);
    if (!clients.size) {
      worker.terminate(); URL.revokeObjectURL(url);
      thread = url = null;
    }
  }
  const renderer = {
    update(next) { if (!disposed) { const sent = { ...next }; if (next.notes === state.notes) delete sent.notes; if (next.hits === state.hits) delete sent.hits; state = next; worker.postMessage({ type: 'state', id, state: sent, time: performance.timeOrigin + performance.now() }); } },
    ready(data) { if (!disposed && data.revision === revision) { canvas.style.visibility = voiceCanvas.style.visibility = trailCanvas.style.visibility = noteCanvas.style.visibility = keyCanvas.style.visibility = ''; root.setAttribute('data-ad-glow', ''); root.setAttribute('data-ad-foreground', ''); onReady(true); } },
    dispose,
  };
  clients.set(id, renderer);
  configure();
  return renderer;
}
