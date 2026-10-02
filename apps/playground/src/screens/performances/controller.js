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

  /* Procedural paintings: generated locally from noise, lights and geometry, not image files.
   The inline vector scenes remain visible whenever Canvas is unavailable. */
  (() => {
    "use strict";
    const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
    const random = (seed) => () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
      return (seed >>> 0) / 4294967296;
    };
    const rng = random(97131);
    const table = Float32Array.from({ length: 65536 }, rng);
    function noise(x, y) {
      const ix = Math.floor(x),
        iy = Math.floor(y);
      let fx = x - ix,
        fy = y - iy;
      fx *= fx * (3 - 2 * fx);
      fy *= fy * (3 - 2 * fy);
      const at = (a, b) => table[(a & 255) + ((b & 255) << 8)];
      const a = at(ix, iy),
        b = at(ix + 1, iy),
        c = at(ix, iy + 1),
        d = at(ix + 1, iy + 1);
      return (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy;
    }
    function fbm(x, y, octaves = 5) {
      let result = 0,
        amplitude = 0.53;
      for (let i = 0; i < octaves; i++) {
        result += noise(x, y) * amplitude;
        x = x * 2.07 + 17.8;
        y = y * 2.03 - 11.5;
        amplitude *= 0.48;
      }
      return result;
    }
    function glow(ctx, x, y, rx, ry, color, strength = 1) {
      if (!(rx > 0 && ry > 0)) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(rx, ry);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      g.addColorStop(0, `rgba(${color},${strength})`);
      g.addColorStop(0.3, `rgba(${color},${strength * 0.34})`);
      g.addColorStop(1, `rgba(${color},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(-1, -1, 2, 2);
      ctx.restore();
    }
    function line(ctx, pts, color, width = 1) {
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.stroke();
    }
    function polygon(ctx, pts, color) {
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    }
    function sky(ctx, seed, h = 204) {
      const pixels = ctx.createImageData(240, h),
        data = pixels.data;
      for (let y = 0; y < h; y++)
        for (let x = 0; x < 240; x++) {
          const n = fbm(x * 0.037 + seed, y * 0.037, 4);
          const horizon =
            Math.exp(-Math.pow((y - 143) / 41, 2)) *
            Math.exp(-Math.pow((x - 120) / 167, 2));
          const cloud = clamp((n - 0.38) * 3);
          const light = horizon * (13 + cloud * 60);
          const k = (y * 240 + x) * 4;
          data[k] = 2 + light;
          data[k + 1] = 5 + light * 0.13;
          data[k + 2] = 10 + light * 0.27;
          data[k + 3] = 255;
        }
      ctx.putImageData(pixels, 0, 0);
      const r = random(seed * 757);
      for (let i = 0; i < 180; i++) {
        const x = r() * 240,
          y = r() * 160;
        ctx.fillStyle = `rgba(200,${Math.floor(90 + r() * 70)},170,${0.15 + r() * 0.55})`;
        ctx.fillRect(x, y, 0.3 + r() * 0.5, 0.3 + r() * 0.5);
      }
    }
    function sphere(ctx, cx, cy, radius, w = 240, h = 204, header = false) {
      const image = ctx.getImageData(0, 0, w, h),
        data = image.data;
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          const dx = (x - cx) / radius,
            dy = (y - cy) / radius;
          const rad = Math.hypot(dx, dy),
            distance = (1 - rad) * radius;
          if (rad > 1 + 23 / radius) continue;
          const k = (y * w + x) * 4;
          const side = header
            ? clamp(0.7 - dx * 0.55, 0.08, 1)
            : clamp(0.48 + dx * 0.74 + dy * 0.52, 0.02, 1);
          if (rad > 1) {
            const a = Math.exp(distance / 6.2) * side * 0.8;
            data[k] = data[k] * (1 - a) + 253 * a;
            data[k + 1] = data[k + 1] * (1 - a) + 20 * a;
            data[k + 2] = data[k + 2] * (1 - a) + 62 * a;
            if (header) data[k + 3] = Math.round(a * 255);
            continue;
          }
          const z = Math.sqrt(Math.max(0, 1 - rad * rad));
          const n = fbm(dx * 26 + z * 13, dy * 26 + z * 6, 5);
          const fissure = Math.pow(
            1 - Math.abs(2 * noise(dx * 112 + n * 9, dy * 98 + n * 11) - 1),
            5,
          );
          const grain = noise(x * 0.43 + 6, y * 0.4);
          const light = header
            ? clamp(0.8 - dx * 0.5 - z * 1.1, 0.02, 1)
            : clamp(0.1 + dx * 0.85 + dy * 0.5 - z * 0.7, 0.01, 0.6);
          const rim =
            Math.exp(-Math.max(0, distance) / (header ? 1.05 : 1.85)) * side;
          const haze =
            Math.exp(-Math.max(0, distance) / (header ? 8 : 11)) * side;
          const rock =
            (7 + n * 50 + fissure * 145 * clamp((n - 0.32) * 3)) * light;
          data[k] = 3 + rock + rim * 252 + haze * 54;
          data[k + 1] = 5 + rock * 0.09 + rim * 197 + haze * 8;
          data[k + 2] = 10 + rock * 0.25 + rim * 204 + haze * 22;
          data[k + 3] = 255;
        }
      ctx.putImageData(image, 0, 0);
    }
    function clouds(ctx) {
      const image = ctx.getImageData(0, 0, 240, 204),
        data = image.data;
      for (let y = 96; y < 204; y++)
        for (let x = 0; x < 240; x++) {
          let k = (y * 240 + x) * 4;
          for (let layer = 0; layer < 3; layer++) {
            const base = [121, 147, 183][layer];
            const nx = x * 0.048 + 71 * layer;
            const n = fbm(nx, y * 0.064 + layer * 11, 5);
            const top = base + (fbm(x * 0.034 + layer * 31, 4, 4) - 0.46) * 46;
            const field = n * 0.87 + (y - top) * 0.041;
            const a = clamp((field - 0.32) * 5.2);
            if (!a) continue;
            const rim =
              Math.exp(-Math.abs(field - 0.53) * 8) * (0.3 + n * 0.95);
            const moonLight =
              0.25 + 0.75 * Math.exp(-Math.pow((x - 126) / 108, 2));
            const lit = rim * moonLight * (layer === 2 ? 130 : 242);
            data[k] = data[k] * (1 - a) + (4 + n * 9 + lit) * a;
            data[k + 1] = data[k + 1] * (1 - a) + (6 + n * 7 + lit * 0.17) * a;
            data[k + 2] =
              data[k + 2] * (1 - a) + (12 + n * 14 + lit * 0.34) * a;
          }
        }
      ctx.putImageData(image, 0, 0);
    }
    function mountain(ctx, points, seed, dark = false) {
      const rand = random(seed);
      const contour = [];
      for (let x = points[0][0]; x <= points[points.length - 1][0]; x++) {
        let p = 0;
        while (p < points.length - 2 && x > points[p + 1][0]) p++;
        const a = points[p],
          b = points[p + 1],
          q = (x - a[0]) / Math.max(1, b[0] - a[0]);
        const y =
          a[1] + (b[1] - a[1]) * q + (fbm(x * 0.27 + seed, 4, 3) - 0.5) * 6;
        contour.push([x, y]);
      }
      ctx.save();
      ctx.beginPath();
      contour.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.lineTo(contour[contour.length - 1][0], 207);
      ctx.lineTo(contour[0][0], 207);
      ctx.closePath();
      ctx.clip();
      const g = ctx.createLinearGradient(0, 70, 100, 206);
      g.addColorStop(0, "#152333");
      g.addColorStop(0.5, "#100f1c");
      g.addColorStop(1, "#01070c");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 240, 207);
      for (let i = 0; i < points.length - 1; i++) {
        const [x, y] = points[i],
          [nx, ny] = points[i + 1],
          bx = (x + nx) / 2 + rand() * 30 - 15;
        polygon(
          ctx,
          [
            [x, y],
            [nx, ny],
            [bx, 208],
          ],
          dark
            ? "#040910"
            : `rgba(${22 + rand() * 25},${14 + rand() * 21},${30 + rand() * 24},.7)`,
        );
        for (let j = 0; j < 36; j++) {
          const q = rand(),
            sx = x + (nx - x) * q,
            sy = y + (ny - y) * q;
          const ex = bx + (rand() - 0.5) * 27;
          line(
            ctx,
            [
              [sx, sy],
              [
                sx + (ex - sx) * 0.3 + (rand() - 0.5) * 11,
                sy + 20 + rand() * 20,
              ],
              [ex, 204],
            ],
            `rgba(${rand() > 0.55 ? "209,54,81" : "57,82,105"},${0.025 + rand() * 0.16})`,
            0.25 + rand() * 0.7,
          );
        }
      }
      ctx.restore();
      line(ctx, contour, dark ? "#251a2a" : "#a93650", 0.68);
      // Fine terrain flecks and escarpment edges, deterministic for each landscape.
      for (let i = 0; i < 500; i++) {
        const x = Math.floor(rand() * contour.length),
          pt = contour[x];
        if (!pt) continue;
        const y = pt[1] + rand() * (205 - pt[1]);
        const q = rand();
        ctx.fillStyle = `rgba(${q > 0.5 ? "165,43,68" : "48,68,91"},${rand() * 0.22})`;
        ctx.fillRect(pt[0], y, 0.4 + rand() * 1.8, 0.3 + rand());
      }
    }
    function lake(ctx, top, seed) {
      const r = random(seed);
      polygon(
        ctx,
        [
          [94, top],
          [148, top],
          [216, 204],
          [17, 204],
        ],
        "#060911",
      );
      glow(ctx, 123, top + 10, 41, 13, "247,29,75", 0.27);
      for (let i = 0; i < 240; i++) {
        const y = top + r() * (204 - top),
          cx = 121 + Math.sin(y * 0.17) * 8,
          spread = (y - top) * 0.55 + 2;
        const x = cx + (r() - 0.5) * spread * 2;
        line(
          ctx,
          [
            [x, y],
            [x + r() * spread * 0.55 + 0.2, y],
          ],
          `rgba(${r() > 0.15 ? "236,54,84" : "77,106,137"},${0.1 + r() * 0.54})`,
          0.25 + r() * 0.5,
        );
      }
      glow(ctx, 122, top + 7, 10, 2, "255,168,181", 0.7);
    }
    function marble(ctx) {
      const image = ctx.createImageData(240, 204),
        d = image.data;
      for (let y = 0; y < 204; y++)
        for (let x = 0; x < 240; x++) {
          let u = (x - 120) / 105,
            v = (y - 102) / 105;
          for (const [cx, cy, strength] of [
            [-0.26, -0.39, 2.9],
            [0.32, 0.56, -2.8],
          ]) {
            const a = u - cx,
              b = v - cy,
              rr = a * a + b * b,
              theta = strength * Math.exp(-rr * 1.23);
            u = cx + a * Math.cos(theta) - b * Math.sin(theta);
            v = cy + a * Math.sin(theta) + b * Math.cos(theta);
          }
          const n = fbm(u * 2.8 + 9, v * 2.8 + 7, 5);
          const phase = (u * 0.73 + v + n * 0.57) * 7.6;
          const band = Math.pow(Math.max(0, Math.sin(phase)), 2.4);
          const secondary = Math.pow(Math.max(0, Math.sin(phase + 0.18)), 9);
          const thin = Math.pow(Math.max(0, Math.sin(phase * 19 + n * 2)), 16);
          const spec =
            Math.pow(secondary, 2) *
            (0.25 + 0.75 * fbm(u * 4 + 18, v * 4 + 14, 3));
          const level = band * (0.48 + thin * 0.35) + secondary * 0.25;
          const k = (y * 240 + x) * 4;
          d[k] = 3 + level * 204 + spec * 142;
          d[k + 1] = 6 + level * 16 + spec * 139;
          d[k + 2] = 13 + level * 43 + spec * 148;
          d[k + 3] = 255;
        }
      ctx.putImageData(image, 0, 0);
    }
    function city(ctx) {
      sky(ctx, 77);
      glow(ctx, 126, 121, 100, 94, "248,25,58", 0.38);
      const rand = random(408);
      for (let layer = 0; layer < 3; layer++)
        for (let i = 0; i < 22; i++) {
          const x = i * 12 + rand() * 7 - 8,
            w = 7 + rand() * 14,
            y = 95 + rand() * 60 + layer * 11;
          polygon(
            ctx,
            [
              [x, y],
              [x + w * 0.65, y - 4],
              [x + w, y],
              [x + w, 208],
              [x, 208],
            ],
            "#030912",
          );
          polygon(
            ctx,
            [
              [x + w * 0.65, y - 4],
              [x + w, y],
              [x + w, 208],
              [x + w * 0.65, 208],
            ],
            "#260d1b",
          );
          line(
            ctx,
            [
              [x + w * 0.65, y - 4],
              [x + w * 0.65, 205],
            ],
            `rgba(250,38,76,${0.16 + rand() * 0.52})`,
            0.7,
          );
          for (let wy = y + 7; wy < 204; wy += 5)
            for (let wx = x + 2; wx < x + w - 1; wx += 3.5) {
              if (rand() > 0.48) {
                ctx.fillStyle = `rgba(${rand() > 0.15 ? "242,47,77" : "171,211,230"},${0.2 + rand() * 0.58})`;
                ctx.fillRect(wx, wy, 1, 2.2);
              }
            }
        }
      ctx.save();
      ctx.shadowColor = "#ff2557";
      ctx.shadowBlur = 10;
      polygon(
        ctx,
        [
          [108, 195],
          [108, 98],
          [113, 94],
          [117, 53],
          [122, 46],
          [124, 5],
          [127, 46],
          [132, 53],
          [136, 95],
          [141, 99],
          [141, 195],
        ],
        "#661529",
      );
      line(
        ctx,
        [
          [124, 5],
          [124, 186],
        ],
        "#ff526f",
        2,
      );
      ctx.restore();
      polygon(
        ctx,
        [
          [111, 98],
          [123, 91],
          [123, 195],
          [111, 195],
        ],
        "#e73152",
      );
      polygon(
        ctx,
        [
          [125, 52],
          [131, 57],
          [135, 99],
          [139, 193],
          [126, 191],
        ],
        "#1a0b15",
      );
      line(
        ctx,
        [
          [124, 4],
          [124, 86],
        ],
        "#ffe9e1",
        0.8,
      );
      for (let y = 63; y < 190; y += 5) {
        line(
          ctx,
          [
            [115, y],
            [133, y],
          ],
          "#ff8096",
          0.6,
        );
        line(
          ctx,
          [
            [119, y + 1],
            [126, y + 1],
          ],
          "#08060e",
          2.2,
        );
      }
      line(
        ctx,
        [
          [110, 96],
          [110, 194],
        ],
        "#ffbdc8",
        0.6,
      );
      polygon(
        ctx,
        [
          [176, 185],
          [176, 64],
          [182, 55],
          [189, 62],
          [189, 189],
        ],
        "#07101a",
      );
      line(
        ctx,
        [
          [182, 37],
          [182, 56],
          [187, 64],
          [187, 175],
        ],
        "#f65069",
        0.7,
      );
      for (let y = 74; y < 180; y += 7)
        line(
          ctx,
          [
            [180, y],
            [186, y],
          ],
          "#8d2944",
          1.2,
        );
      ctx.save();
      ctx.shadowColor = "#ff375f";
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.moveTo(27, 206);
      ctx.bezierCurveTo(67, 194, 87, 194, 122, 176);
      ctx.strokeStyle = "#f34d6a";
      ctx.lineWidth = 2.3;
      ctx.stroke();
      ctx.restore();
      ctx.beginPath();
      ctx.moveTo(40, 208);
      ctx.bezierCurveTo(92, 197, 86, 192, 123, 178);
      ctx.strokeStyle = "#ffd2d6";
      ctx.lineWidth = 0.6;
      ctx.stroke();
      polygon(
        ctx,
        [
          [138, 204],
          [197, 182],
          [240, 186],
          [240, 204],
        ],
        "#061520",
      );
    }
    function paintCover(index) {
      const canvas = document.createElement("canvas");
      canvas.width = 240;
      canvas.height = 204;
      const ctx = canvas.getContext("2d", {
        alpha: false,
        willReadFrequently: true,
      });
      if (!ctx) return null;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      sky(ctx, index * 37);
      if (index === 1) {
        sphere(ctx, 112, 78, 47);
        clouds(ctx);
      } else if (index === 2) {
        sphere(ctx, 108, 31, 45);
        glow(ctx, 122, 118, 119, 56, "229,49,73", 0.43);
        mountain(
          ctx,
          [
            [0, 150],
            [20, 128],
            [40, 134],
            [68, 75],
            [78, 93],
            [84, 89],
            [104, 127],
            [125, 144],
            [145, 106],
            [162, 89],
            [168, 113],
            [190, 101],
            [205, 130],
            [228, 135],
            [240, 150],
          ],
          93,
        );
        lake(ctx, 157, 86);
        mountain(
          ctx,
          [
            [0, 154],
            [19, 167],
            [32, 155],
            [45, 173],
            [64, 178],
            [85, 202],
            [96, 210],
          ],
          65,
          true,
        );
        mountain(
          ctx,
          [
            [150, 211],
            [177, 183],
            [194, 181],
            [209, 159],
            [225, 148],
            [240, 171],
          ],
          94,
          true,
        );
      } else if (index === 3) {
        city(ctx);
      } else if (index === 4) {
        marble(ctx);
      } else if (index === 5) {
        ctx.fillStyle = "#030913";
        ctx.fillRect(0, 0, 240, 204);
        sphere(ctx, 60, 9, 154);
        glow(ctx, 139, 143, 103, 21, "233,53,91", 0.62);
        lake(ctx, 149, 198);
        mountain(
          ctx,
          [
            [0, 169],
            [14, 156],
            [28, 149],
            [39, 118],
            [49, 131],
            [55, 135],
            [66, 163],
            [80, 171],
            [104, 206],
            [124, 208],
          ],
          92,
          true,
        );
        mountain(
          ctx,
          [
            [147, 210],
            [179, 185],
            [195, 181],
            [205, 173],
            [222, 183],
            [240, 167],
          ],
          108,
          true,
        );
      } else {
        glow(ctx, 122, 134, 98, 51, "238,68,89", 0.53);
        ctx.save();
        ctx.shadowColor = "#ff1746";
        ctx.shadowBlur = 11;
        line(
          ctx,
          [
            [102, 121],
            [120, 98],
            [145, 125],
          ],
          "#ff546c",
          4,
        );
        ctx.restore();
        line(
          ctx,
          [
            [103, 121],
            [120, 98],
            [143, 125],
          ],
          "#ffe0dd",
          0.8,
        );
        mountain(
          ctx,
          [
            [0, 157],
            [19, 141],
            [29, 151],
            [44, 143],
            [59, 127],
            [72, 133],
            [82, 125],
            [100, 110],
            [109, 119],
            [123, 116],
            [137, 131],
            [152, 127],
            [168, 150],
            [191, 131],
            [205, 153],
            [222, 141],
            [240, 157],
          ],
          334,
        );
        lake(ctx, 171, 92);
        glow(ctx, 123, 184, 12, 3, "255,124,143", 0.9);
        mountain(
          ctx,
          [
            [0, 174],
            [11, 155],
            [24, 166],
            [36, 159],
            [48, 178],
            [61, 183],
            [88, 207],
          ],
          913,
          true,
        );
        mountain(
          ctx,
          [
            [150, 209],
            [180, 193],
            [199, 181],
            [208, 169],
            [223, 167],
            [240, 146],
          ],
          22,
          true,
        );
      }
      const shade = ctx.createRadialGradient(120, 100, 50, 120, 100, 158);
      shade.addColorStop(0, "#01040900");
      shade.addColorStop(1, "#01040a99");
      ctx.fillStyle = shade;
      ctx.fillRect(0, 0, 240, 204);
      canvas.className = "pf-painted-cover";
      canvas.setAttribute("aria-hidden", "true");
      return canvas;
    }
    try {
      const cache = new Map();
      document.querySelectorAll(".pf-art-frame").forEach((frame, index) => {
        const painted = paintCover(index + 1);
        if (painted) {
          frame.append(painted);
          frame.classList.add("pf-painted");
          painted.setAttribute("role", "img");
          painted.removeAttribute("aria-hidden");
          painted.setAttribute(
            "aria-label",
            frame.querySelector("svg").getAttribute("aria-label") ||
              "Векторный пейзаж",
          );
          cache.set(index + 1, painted);
        }
      });
      const canvas = document.createElement("canvas");
      canvas.width = 1230;
      canvas.height = 156;
      canvas.className = "pf-header-texture";
      canvas.setAttribute("aria-hidden", "true");
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (context) {
        sphere(context, 1230, 390, 506, 1230, 156, true);
        document.querySelector(".pf-header-art").after(canvas);
        document.querySelector(".pf-header-art").style.visibility = "hidden";
      }
      window.PerformancesArtwork = Object.freeze({
        copy(index) {
          const source = cache.get(index);
          if (!source) return null;
          const target = document.createElement("canvas");
          target.width = 240;
          target.height = 204;
          target.className = "pf-painted-cover";
          target.setAttribute("role", "img");
          target.setAttribute(
            "aria-label",
            source.getAttribute("aria-label") || "Векторный пейзаж",
          );
          target.getContext("2d").drawImage(source, 0, 0);
          return target;
        },
      });
    } catch (error) {
      console.warn(
        "Векторные миниатюры сохранены: дополнительная фактура Canvas недоступна.",
        error,
      );
    }
  })();

  (() => {
    "use strict";
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => [
      ...root.querySelectorAll(selector),
    ];
    const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
    const ns = "http://www.w3.org/2000/svg";
    const svg = (tag, attributes = {}) => {
      const el = document.createElementNS(ns, tag);
      Object.entries(attributes).forEach(([k, v]) =>
        el.setAttribute(k, String(v)),
      );
      return el;
    };
    const icon = (name) => {
      const el = svg("svg", {
        class: "pf-icon",
        viewBox: "0 0 28 28",
        "aria-hidden": "true",
      });
      el.append(svg("use", { href: `#pf-i-${name}` }));
      return el;
    };
    const scene = $("#pf-scene"),
      modal = $("#pf-modal"),
      list = $("#pf-records");
    const mediaQuery = matchMedia("(prefers-reduced-motion: reduce)");
    const initial = JSON.parse($("#pf-record-data").textContent);
    const records = initial.map((r) => ({
      ...r,
      position: 0,
      muted: false,
      media: null,
      url: null,
      originalFile: null,
      demo: true,
    }));
    const elements = new Map(
      records.map((r) => [r.id, $(`[data-id="${r.id}"]`, list)]),
    );
    const template = $(".pf-card", list).cloneNode(true);
    const frames = new Map();
    let activeId = null,
      opened = true,
      frameId = null,
      previous = null,
      elapsed = 0;
    let lastPaint = -Infinity,
      seekMode = false,
      destroyed = false,
      explicitMotion = null;
    let motion =
      !mediaQuery.matches && !new URLSearchParams(location.search).has("still");
    let toastTimer,
      menuTarget = null,
      menuTrigger = null,
      dialogState = null,
      unique = 7;
    let previewNotice = false;
    const emit = (name, detail) =>
      window.dispatchEvent(
        new CustomEvent(`performances:${name}`, { detail, cancelable: true }),
      );
    const get = (id) => records.find((r) => r.id === id);
    const metadata = (r) => ({
      id: r.id,
      title: r.title,
      duration: r.duration,
      analyzed: r.analyzed,
      sizeMB: r.size,
      position: r.position,
      muted: r.muted,
      demo: r.demo,
    });
    const formatTime = (value) =>
      `${Math.floor(Math.max(0, value) / 60)}:${String(Math.floor(Math.max(0, value)) % 60).padStart(2, "0")}`;

    function fit() {
      const scale = Math.min(1, context.width / 1280, context.height / 1221);
      scene.style.setProperty("--pf-scale", String(scale));
      $("#pf-viewport").style.width = cssRem(1280 * scale);
      $("#pf-viewport").style.height = cssRem(1221 * scale);
      hideMenu();
    }
    addEventListener("resize", fit, { passive: true });
    fit();

    // The approved Advanced / room border material. Geometry is measured, never rotated.
    function createFrame(element, index) {
      frames.set(element, context.getBorder(element, index, element === modal));
    }
    function paintFrame() {} // AnimatedBorder owns the light clock.
    $$("[data-pf-border]").forEach(createFrame);
    function renderDecorations(time) {
      frames.forEach((item) => paintFrame(item, time));
    }
    function schedule() {
      if (
        frameId === null &&
        !destroyed &&
        opened &&
        !document.hidden &&
        !seekMode &&
        (motion || activeId)
      )
        frameId = requestAnimationFrame(tick);
    }
    function tick(now) {
      frameId = null;
      if (destroyed || !opened || document.hidden || seekMode) {
        previous = null;
        return;
      }
      const delta =
        previous === null ? 0 : Math.min((now - previous) / 1000, 1);
      previous = now;
      if (motion) elapsed += delta;
      if (activeId) {
        const r = get(activeId);
        if (r) {
          r.position = r.media
            ? Math.min(r.duration, r.media.currentTime || 0)
            : Math.min(r.duration, r.position + delta);
          renderPlayer(r);
          if (r.position >= r.duration) stopPlayback();
        }
      }
      if (motion && now - lastPaint >= 1000 / 30) {
        renderDecorations(elapsed);
        lastPaint = now;
      }
      schedule();
    }
    function setMotion(enabled, explicit = true) {
      motion = Boolean(enabled);
      if (explicit) explicitMotion = motion;
      seekMode = false;
      scene.dataset.motion = motion ? "on" : "off";
      if (!motion && !activeId && frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
      previous = null;
      schedule();
    }
    setMotion(motion, false);
    renderDecorations(0);
    mediaQuery.addEventListener("change", (e) => {
      if (explicitMotion === null) setMotion(!e.matches, false);
    });
    document.addEventListener("visibilitychange", () => {
      scene.dataset.visibility = document.hidden ? "hidden" : "visible";
      if (document.hidden && frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
      previous = null;
      schedule();
    });

    function notify(text) {
      clearTimeout(toastTimer);
      $("#pf-toast").textContent = text;
      $("#pf-toast").hidden = false;
      toastTimer = setTimeout(() => {
        $("#pf-toast").hidden = true;
      }, 4000);
    }
    function renderPlayer(r) {
      const row = elements.get(r.id);
      if (!row) return;
      const playing = activeId === r.id;
      const play = $('[data-action="play"]', row),
        mute = $('[data-action="mute"]', row),
        range = $("[data-seek]", row);
      play.setAttribute("aria-pressed", String(playing));
      play.setAttribute(
        "aria-label",
        playing ? "Приостановить воспроизведение" : "Воспроизвести запись",
      );
      play.title = playing ? "Пауза" : "Воспроизвести";
      mute.setAttribute("aria-pressed", String(r.muted));
      mute.setAttribute(
        "aria-label",
        r.muted ? "Включить звук" : "Выключить звук",
      );
      mute.title = r.muted ? "Включить звук" : "Выключить звук";
      range.value = String(r.position);
      range.max = String(r.duration);
      range.setAttribute(
        "aria-valuetext",
        `${formatTime(r.position)} из ${formatTime(r.duration)}`,
      );
      $("[data-time]", row).textContent =
        `${formatTime(r.position)} / ${formatTime(r.duration)}`;
      const x = r.duration ? clamp(r.position / r.duration) * 551 : 0;
      $("[data-playhead]", row).setAttribute(
        "transform",
        `translate(${x.toFixed(2)} 0)`,
      );
      $("[data-clip]", row).setAttribute("width", x.toFixed(2));
    }
    function stopPlayback() {
      const r = get(activeId);
      activeId = null;
      if (r) {
        r.media?.pause();
        renderPlayer(r);
      }
    }
    async function togglePlay(r) {
      if (!emit("play", { ...metadata(r), playing: activeId !== r.id })) return;
      if (activeId === r.id) {
        stopPlayback();
        return;
      }
      stopPlayback();
      if (r.position >= r.duration) r.position = 0;
      activeId = r.id;
      if (r.media) {
        try {
          r.media.currentTime = r.position;
          r.media.muted = r.muted;
          await r.media.play();
        } catch {
          if (activeId === r.id) activeId = null;
          notify("Браузер не смог воспроизвести этот аудиофайл.");
        }
      } else if (!previewNotice) {
        previewNotice = true;
        notify(
          "Демонстрация дорожки без звука. «Добавить запись» открывает ваш локальный аудиофайл.",
        );
      }
      renderPlayer(r);
      previous = null;
      schedule();
    }
    function seekRecord(r, seconds) {
      r.position = clamp(Number(seconds) || 0, 0, r.duration);
      if (r.media) {
        try {
          r.media.currentTime = r.position;
        } catch {
          /* metadata not loaded yet */
        }
      }
      renderPlayer(r);
      emit("seek", metadata(r));
    }
    function renderTotals() {
      const n = records.length,
        last = n % 10,
        teen = n % 100 >= 11 && n % 100 <= 14;
      const word = teen
        ? "записей"
        : last === 1
          ? "запись"
          : last >= 2 && last <= 4
            ? "записи"
            : "записей";
      $("#pf-count").textContent = `${n} ${word}`;
      $("#pf-size").textContent =
        `${records.reduce((sum, r) => sum + r.size, 0).toFixed(1)} MB`;
      $("#pf-empty").hidden = n > 0;
    }
    function showDialog({
      title,
      text,
      value = null,
      confirm = "Готово",
      cancel = "Отмена",
      onConfirm = null,
    }) {
      hideMenu();
      dialogState = { trigger: document.activeElement, onConfirm };
      $("#pf-dialog-title").textContent = title;
      $("#pf-dialog-text").textContent = text;
      const input = $("#pf-dialog-input");
      input.hidden = value === null;
      input.value = value ?? "";
      $("#pf-dialog-confirm").textContent = confirm;
      $("#pf-dialog-cancel").textContent = cancel;
      $("#pf-dialog-cancel").hidden = !onConfirm && value === null;
      $("#pf-dialog-backdrop").hidden = false;
      $$(".pf-header,.pf-list,.pf-footer", modal).forEach((el) => {
        el.inert = true;
      });
      (value !== null
        ? input
        : onConfirm
          ? $("#pf-dialog-cancel")
          : $("#pf-dialog-confirm")
      ).focus();
      if (value !== null) input.select();
    }
    function closeDialog() {
      const previousFocus = dialogState?.trigger;
      $("#pf-dialog-backdrop").hidden = true;
      dialogState = null;
      $$(".pf-header,.pf-list,.pf-footer", modal).forEach((el) => {
        el.inert = false;
      });
      if (previousFocus?.isConnected)
        previousFocus.focus({ preventScroll: true });
    }
    $("#pf-dialog-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const value = $("#pf-dialog-input").value.trim();
      if (!$("#pf-dialog-input").hidden && !value) {
        $("#pf-dialog-input").focus();
        return;
      }
      const callback = dialogState?.onConfirm;
      closeDialog();
      callback?.(value);
    });
    $("#pf-dialog-cancel").addEventListener("click", closeDialog);
    $("#pf-dialog-backdrop").addEventListener("click", (event) => {
      if (event.target === event.currentTarget) closeDialog();
    });
    function rename(r) {
      showDialog({
        title: "Переименовать запись",
        text: "Название изменится только в этом списке. Имя файла на диске останется прежним.",
        value: r.title,
        confirm: "Сохранить",
        onConfirm: (title) => {
          if (!emit("rename", { id: r.id, title })) return;
          r.title = title;
          const h = $(".pf-record-title", elements.get(r.id));
          h.textContent = title;
          h.title = title;
        },
      });
    }
    function remove(r) {
      showDialog({
        title: "Убрать запись из списка?",
        text: `«${r.title}»\nВ этом HTML запись удаляется только из списка. Файл на компьютере не затрагивается.`,
        confirm: "Удалить",
        onConfirm: () => {
          if (!emit("delete", metadata(r))) return;
          if (activeId === r.id) stopPlayback();
          const row = elements.get(r.id),
            frame = frames.get(row);
          frame?.observer.disconnect();
          frames.delete(row);
          row?.remove();
          elements.delete(r.id);
          if (r.url) URL.revokeObjectURL(r.url);
          r.media?.removeAttribute("src");
          const index = records.indexOf(r);
          if (index >= 0) records.splice(index, 1);
          renderTotals();
          $("#pf-add").focus({ preventScroll: true });
        },
      });
    }
    function analyze(r) {
      if (!emit("analyze", metadata(r))) return;
      showDialog({
        title: "Анализ исполнения",
        text: r.demo
          ? `«${r.title}»\nСтатус «${r.analyzed ? "Анализ готов" : "Не проанализирована"}» показан по дизайн-макету. Настоящих результатов измерений у этой демонстрационной записи нет.\nДля запуска анализа нужен обработчик приложения A&D Voice.`
          : `«${r.title}»\nАудиофайл добавлен локально. Этот HTML не запускает нейросети: анализ подключается приложением через событие performances:analyze.`,
      });
    }
    function folder(r) {
      if (emit("folder", metadata(r)))
        showDialog({
          title: "Папка записи",
          text: "Браузерный макет не имеет доступа к папкам приложения. Кнопка передаёт приложению событие performances:folder с идентификатором записи; файлы не открывались.",
        });
    }
    function exportMetadata(r) {
      const blob = new Blob(
        [
          JSON.stringify(
            { song: $("#pf-song").textContent, ...metadata(r) },
            null,
            2,
          ),
        ],
        { type: "application/json;charset=utf-8" },
      );
      const url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download = `${r.id}-metadata.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    }
    function hideMenu() {
      const context = $("#pf-context");
      if (!context) return;
      context.hidden = true;
      menuTrigger?.setAttribute("aria-expanded", "false");
      menuTrigger = null;
      menuTarget = null;
    }
    function showMenu(trigger, r = null) {
      const wasOpen = menuTrigger === trigger && !$("#pf-context").hidden;
      hideMenu();
      if (wasOpen) return;
      menuTrigger = trigger;
      menuTarget = r;
      const menu = $("#pf-context");
      menu.replaceChildren();
      const options = r
        ? [
            ["edit", "Переименовать", () => rename(r)],
            ["export", "Экспортировать сведения", () => exportMetadata(r)],
            [
              "motion",
              motion ? "Уменьшить анимации" : "Включить анимации",
              () => setMotion(!motion),
            ],
            ["delete", "Убрать из списка", () => remove(r)],
          ]
        : [
            ["folder", "Выбрать аудиофайл", () => $("#pf-files").click()],
            [
              "info",
              "О демонстрационных записях",
              () =>
                showDialog({
                  title: "Выступления песни",
                  text: "Шесть исходных записей — демонстрация интерфейса по вашему изображению. Можно добавить и воспроизвести собственный аудиофайл. Ничего не отправляется на сервер.",
                }),
            ],
            [
              "motion",
              motion ? "Уменьшить анимации" : "Включить анимации",
              () => setMotion(!motion),
            ],
          ];
      options.forEach(([symbol, title, action]) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "pf-menu-item";
        if (symbol === "delete") button.classList.add("pf-menu-item--danger");
        button.setAttribute("role", "menuitem");
        button.append(icon(symbol), document.createTextNode(title));
        button.addEventListener("click", () => {
          hideMenu();
          trigger.focus({ preventScroll: true });
          action();
        });
        menu.append(button);
      });
      menu.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      const scale = modal.getBoundingClientRect().width / modal.offsetWidth;
      const box = trigger.getBoundingClientRect(),
        parent = modal.getBoundingClientRect();
      let left = (box.right - parent.left) / scale - menu.offsetWidth;
      let top = (box.bottom - parent.top) / scale + 8;
      if (top + menu.offsetHeight > modal.clientHeight - 14)
        top = (box.top - parent.top) / scale - menu.offsetHeight - 8;
      menu.style.left = cssRem(
        clamp(left, 10, modal.clientWidth - menu.offsetWidth - 10),
      );
      menu.style.top = cssRem(Math.max(10, top));
      $("button", menu)?.focus();
    }
    document.addEventListener("pointerdown", (event) => {
      if (
        !$("#pf-context").hidden &&
        !$("#pf-context").contains(event.target) &&
        !menuTrigger?.contains(event.target)
      )
        hideMenu();
    });
    list.addEventListener("scroll", hideMenu, { passive: true });
    list.addEventListener("click", (event) => {
      const button = event.target.closest("[data-action]");
      if (!button) return;
      const r = get(button.closest(".pf-card")?.dataset.id);
      if (!r) return;
      const actions = {
        play: () => togglePlay(r),
        rename: () => rename(r),
        analyze: () => analyze(r),
        folder: () => folder(r),
        delete: () => remove(r),
        menu: () => showMenu(button, r),
        mute: () => {
          r.muted = !r.muted;
          if (r.media) r.media.muted = r.muted;
          renderPlayer(r);
          emit("mute", metadata(r));
        },
      };
      actions[button.dataset.action]?.();
    });
    list.addEventListener("input", (event) => {
      if (!event.target.matches("[data-seek]")) return;
      const r = get(event.target.closest(".pf-card").dataset.id);
      if (r) seekRecord(r, Number(event.target.value));
    });
    $$("[data-view-button]").forEach((button) =>
      button.addEventListener("click", () =>
        setView(button.dataset.viewButton),
      ),
    );
    function setView(view) {
      if (!["list", "grid"].includes(view)) return false;
      hideMenu();
      list.dataset.view = view;
      list.scrollTop = 0;
      $$("[data-view-button]").forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.viewButton === view)),
      );
      emit("view", { view });
      return true;
    }
    $("#pf-add").addEventListener("click", () => $("#pf-files").click());
    $("#pf-add-more").addEventListener("click", (event) =>
      showMenu(event.currentTarget),
    );

    function prepareMedia(url) {
      return new Promise((resolve, reject) => {
        const media = new Audio();
        media.preload = "metadata";
        media.volume = 0.65;
        const timer = setTimeout(
          () => finish(new Error("Metadata timeout")),
          10000,
        );
        function finish(error = null) {
          clearTimeout(timer);
          media.removeEventListener("loadedmetadata", loaded);
          media.removeEventListener("error", failed);
          if (error) {
            media.removeAttribute("src");
            reject(error);
          } else resolve(media);
        }
        function loaded() {
          Number.isFinite(media.duration) && media.duration > 0
            ? finish()
            : finish(new Error("Invalid duration"));
        }
        function failed() {
          finish(new Error("Unsupported media"));
        }
        media.addEventListener("loadedmetadata", loaded);
        media.addEventListener("error", failed);
        media.src = url;
      });
    }
    function cloneCard(r, serial) {
      const row = template.cloneNode(true);
      row.dataset.id = r.id;
      // Every SVG definition gets a new ID; no duplicate masks/gradients after importing.
      const idMap = new Map(
        $$("[id]", row).map((e) => [e.id, `pf-local-${serial}-${e.id}`]),
      );
      $$("*", row).forEach((e) => {
        for (const attr of [...e.attributes]) {
          if (attr.name === "id") {
            e.id = idMap.get(e.id);
            continue;
          }
          let value = attr.value;
          for (const [oldId, newId] of idMap) {
            if (value === oldId) value = newId;
            else value = value.replaceAll(`#${oldId}`, `#${newId}`);
          }
          if (value !== attr.value) e.setAttribute(attr.name, value);
        }
      });
      const title = $(".pf-record-title", row);
      title.textContent = r.title;
      title.title = r.title;
      row.setAttribute("aria-labelledby", title.id);
      $("[data-analysis-status]", row).textContent = "Не проанализирована";
      $$("canvas", row).forEach((e) => e.remove());
      const cover = window.PerformancesArtwork?.copy(r.art);
      if (cover) $(".pf-art-frame", row).append(cover);
      $("[data-seek]", row).max = String(r.duration);
      return row;
    }
    async function decodeWave(r) {
      const AudioContextType =
        window.OfflineAudioContext || window.webkitOfflineAudioContext;
      if (!AudioContextType || !r.originalFile) return;
      let ctx = null;
      try {
        ctx = new AudioContextType(1, 1, 44100);
        const buffer = await ctx.decodeAudioData(
          await r.originalFile.arrayBuffer(),
        );
        if (destroyed || !get(r.id)) return;
        const samples = buffer.getChannelData(0),
          points = 340;
        const stride = Math.max(1, Math.floor(samples.length / points));
        const peaks = Array.from({ length: points }, (_, i) => {
          let peak = 0;
          const start = i * stride,
            end = Math.min(samples.length, start + stride);
          const sampleStep = Math.max(1, Math.floor(stride / 180));
          for (let j = start; j < end; j += sampleStep)
            peak = Math.max(peak, Math.abs(samples[j]));
          return peak;
        });
        const max = Math.max(0.015, ...peaks);
        let d = "";
        peaks.forEach((peak, i) => {
          const x = (i / (points - 1)) * 549,
            amplitude = Math.max(0.45, (peak / max) * 21);
          d += `M${x.toFixed(2)} ${(23.5 - amplitude).toFixed(2)}V${(23.5 + amplitude).toFixed(2)}`;
        });
        const wave = $(".pf-waveform defs path", elements.get(r.id));
        if (wave) wave.setAttribute("d", d);
      } catch {
        // The player can still use formats the browser plays but Web Audio cannot decode.
        if (get(r.id))
          notify(
            "Файл добавлен. Браузер не смог построить форму волны: оставлен демонстрационный рисунок.",
          );
      } finally {
        if (ctx?.close && ctx.state !== "closed")
          await ctx.close().catch(() => {});
      }
    }
    let importing = false;
    $("#pf-files").addEventListener("change", async (event) => {
      if (importing) return;
      const picked = [...event.target.files];
      event.target.value = "";
      if (!picked.length) return;
      importing = true;
      $("#pf-add").disabled = true;
      let added = 0;
      try {
        for (const file of picked.slice(0, 12)) {
          if (records.length >= 60) {
            notify("В демонстрационном списке можно хранить до 60 записей.");
            break;
          }
          if (file.size > 150 * 1024 * 1024) {
            notify(
              "Для этого локального макета выберите аудиофайл размером до 150 MB.",
            );
            continue;
          }
          const url = URL.createObjectURL(file);
          let media;
          try {
            media = await prepareMedia(url);
          } catch {
            URL.revokeObjectURL(url);
            notify(`Не удалось открыть аудио «${file.name}».`);
            continue;
          }
          if (destroyed) {
            media.removeAttribute("src");
            URL.revokeObjectURL(url);
            break;
          }
          const serial = unique++;
          const r = {
            id: `local-${serial}`,
            title: file.name.replace(/\.[^.]+$/, ""),
            duration: media.duration,
            analyzed: false,
            size: file.size / 1e6,
            art: 1,
            position: 0,
            muted: false,
            media,
            url,
            originalFile: file,
            demo: false,
          };
          records.push(r);
          const row = cloneCard(r, serial);
          elements.set(r.id, row);
          list.insertBefore(row, $("#pf-empty"));
          createFrame(row, serial + 20);
          renderPlayer(r);
          media.addEventListener("ended", () => {
            r.position = r.duration;
            if (activeId === r.id) stopPlayback();
            renderPlayer(r);
          });
          media.addEventListener("error", () => {
            if (get(r.id)) {
              if (activeId === r.id) stopPlayback();
              notify("Ошибка воспроизведения локального файла.");
            }
          });
          await decodeWave(r);
          added++;
        }
        renderTotals();
        if (added) {
          notify(
            `Добавлено файлов: ${added}. Они остаются на вашем устройстве и никуда не отправляются.`,
          );
          list.scrollTop = list.scrollHeight;
        }
        if (picked.length > 12)
          notify("За один раз добавляются первые 12 файлов.");
      } finally {
        importing = false;
        $("#pf-add").disabled = false;
      }
    });

    function setOpen(value) {
      if (emit(value ? "open" : "close", { open: Boolean(value) }) === false)
        return;
      opened = Boolean(value);
      modal.hidden = !opened;
      $("#pf-reopen").hidden = opened;
      hideMenu();
      closeDialog();
      if (!opened) {
        stopPlayback();
        if (frameId !== null) cancelAnimationFrame(frameId);
        frameId = null;
      } else schedule();
      previous = null;
      (opened ? $("#pf-close") : $("#pf-reopen")).focus({
        preventScroll: true,
      });
    }
    $("#pf-close").addEventListener("click", () => setOpen(false));
    $("#pf-reopen").addEventListener("click", () => setOpen(true));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && opened) {
        event.preventDefault();
        if (!$("#pf-dialog-backdrop").hidden) closeDialog();
        else if (!$("#pf-context").hidden) {
          const trigger = menuTrigger;
          hideMenu();
          trigger?.focus();
        } else setOpen(false);
      }
      if (
        !$("#pf-context").hidden &&
        ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)
      ) {
        event.preventDefault();
        const items = $$("button", $("#pf-context")),
          index = items.indexOf(document.activeElement);
        const next =
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? items.length - 1
              : (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) %
                items.length;
        items[next]?.focus();
      }
      if (event.key !== "Tab" || !opened) return;
      const root = $("#pf-dialog-backdrop").hidden ? modal : $("#pf-dialog");
      const targets = $$(
        'button:not(:disabled), input:not(:disabled), [tabindex="0"]',
        root,
      ).filter(
        (e) => !e.closest("[hidden],[inert]") && e.getClientRects().length,
      );
      const first = targets[0],
        last = targets[targets.length - 1];
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          !root.contains(document.activeElement))
      ) {
        event.preventDefault();
        last?.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !root.contains(document.activeElement))
      ) {
        event.preventDefault();
        first?.focus();
      }
    });

    window.PerformancesView = Object.freeze({
      referenceSize: Object.freeze({ width: 1280, height: 1221 }),
      getRecords: () => records.map(metadata),
      setView,
      setMotion,
      open: () => setOpen(true),
      close: () => setOpen(false),
      setSong(title) {
        if (typeof title !== "string" || !title.trim()) return false;
        $("#pf-song").textContent = title.trim().slice(0, 60);
        return true;
      },
      setAnalysis(id, ready) {
        const r = get(id);
        if (!r) return false;
        r.analyzed = Boolean(ready);
        $("[data-analysis-status]", elements.get(id)).textContent = r.analyzed
          ? "Анализ готов"
          : "Не проанализирована";
        return true;
      },
      seekRecord(id, seconds) {
        const r = get(id);
        if (!r || !Number.isFinite(seconds)) return false;
        seekRecord(r, seconds);
        return true;
      },
      // Deterministic capture affects light only. It does not move card content.
      seek(seconds) {
        if (!Number.isFinite(seconds) || seconds < 0) return false;
        seekMode = true;
        if (frameId !== null) cancelAnimationFrame(frameId);
        frameId = null;
        elapsed = seconds;
        previous = null;
        renderDecorations(seconds);
        for (const a of scene.getAnimations({ subtree: true })) {
          a.pause();
          a.currentTime = seconds * 1000;
        }
        return true;
      },
      resume() {
        seekMode = false;
        previous = null;
        for (const a of scene.getAnimations({ subtree: true }))
          if (motion) a.play();
        schedule();
      },
    });
    renderTotals();
    records.forEach(renderPlayer);
    scene.dataset.ready = "true";
    addEventListener(
      "pagehide",
      () => {
        destroyed = true;
        if (frameId !== null) cancelAnimationFrame(frameId);
        clearTimeout(toastTimer);
        frames.forEach((f) => f.observer.disconnect());
        records.forEach((r) => {
          r.media?.pause();
          if (r.url) URL.revokeObjectURL(r.url);
        });
      },
      { once: true },
    );
  })();
}
