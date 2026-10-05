const a=`import { useInsertionEffect, useRef, type CSSProperties } from "react";
import { mark, type CommonProps } from "../../../core/base";
import { usePauseOffscreen } from "../../../core/motion/hooks";
import { tr } from "../../../core/i18n";

export const loaderAnimations = ["spin", "pulse", "breathe", "bounce", "flip", "orbit", "wave", "glow", "fill", "shine", "wobble", "radar"] as const;
export type LoaderAnimation = (typeof loaderAnimations)[number];

/** Names of the animations for pickers, in the library's language. */
export const loaderAnimationLabel = (animation: LoaderAnimation) =>
  tr(
    ({
      spin: "Вращение",
      pulse: "Пульс",
      breathe: "Дыхание",
      bounce: "Отскок",
      flip: "Переворот",
      orbit: "Орбита",
      wave: "Волна",
      glow: "Свечение",
      fill: "Заливка",
      shine: "Блик",
      wobble: "Покачивание",
      radar: "Радар",
    } as const)[animation],
  );

export interface LoaderProps extends Omit<CommonProps, "size"> {
  /** The picture that moves: a logo, an icon, any image (transparent PNG/SVG/WebP look best). */
  src?: string;
  animation?: LoaderAnimation;
  /** Width and height, any CSS length. */
  size?: string;
  /** Speed multiplier: 2 is twice as fast. */
  speed?: number;
  /** Colour of rings, glows and the sweep; the theme colour by default. */
  color?: string;
  /** What screen readers hear. */
  label?: string;
}

/**
 * The loader's stylesheet. It lives here (not in a .css file) so the generator can hand the
 * exact same animation out as a standalone page. Only transform and opacity move.
 */
export const loaderCss = \`
.ad-loader{--ad-loader-size:4rem;--ad-loader-speed:1;--ad-loader-color:var(--ad-primary,#ff244c);position:relative;display:inline-grid;place-items:center;width:var(--ad-loader-size);height:var(--ad-loader-size);flex:none}
.ad-loader>*{grid-area:1/1}
.ad-loader-img{width:72%;height:72%;object-fit:contain;user-select:none;pointer-events:none;will-change:transform,opacity}
.ad-loader-ring{width:100%;height:100%;border-radius:50%;pointer-events:none}
.ad-loader[data-animation=spin] .ad-loader-img{animation:ad-loader-spin calc(1.2s/var(--ad-loader-speed)) linear infinite}
.ad-loader[data-animation=pulse] .ad-loader-img{animation:ad-loader-pulse calc(1s/var(--ad-loader-speed)) ease-in-out infinite}
.ad-loader[data-animation=breathe] .ad-loader-img{animation:ad-loader-breathe calc(2.4s/var(--ad-loader-speed)) ease-in-out infinite}
.ad-loader[data-animation=bounce] .ad-loader-img{width:60%;height:60%;animation:ad-loader-bounce calc(.9s/var(--ad-loader-speed)) cubic-bezier(.3,0,.6,1) infinite alternate}
.ad-loader[data-animation=bounce] .ad-loader-ring{width:46%;height:10%;align-self:end;border-radius:50%;background:radial-gradient(closest-side,rgb(0 0 0/.45),transparent);animation:ad-loader-shadow calc(.9s/var(--ad-loader-speed)) cubic-bezier(.3,0,.6,1) infinite alternate}
.ad-loader[data-animation=flip] .ad-loader-img{animation:ad-loader-flip calc(1.6s/var(--ad-loader-speed)) ease-in-out infinite}
.ad-loader[data-animation=orbit] .ad-loader-img{width:34%;height:34%;animation:ad-loader-orbit calc(1.4s/var(--ad-loader-speed)) linear infinite}
.ad-loader[data-animation=orbit] .ad-loader-ring{box-shadow:inset 0 0 0 2px color-mix(in srgb,var(--ad-loader-color) 35%,transparent)}
.ad-loader[data-animation=wave] .ad-loader-img{width:54%;height:54%}
.ad-loader[data-animation=wave] .ad-loader-ring{box-shadow:0 0 0 2px var(--ad-loader-color);opacity:0;animation:ad-loader-wave calc(1.8s/var(--ad-loader-speed)) ease-out infinite}
.ad-loader[data-animation=wave] .ad-loader-ring+.ad-loader-ring{animation-delay:calc(-.9s/var(--ad-loader-speed))}
.ad-loader[data-animation=glow] .ad-loader-ring{width:80%;height:80%;background:radial-gradient(closest-side,var(--ad-loader-color),transparent);opacity:.25;animation:ad-loader-glow calc(1.6s/var(--ad-loader-speed)) ease-in-out infinite}
.ad-loader[data-animation=fill] .ad-loader-img{opacity:.22;filter:grayscale(1)}
.ad-loader-fill{width:72%;height:72%;overflow:hidden;transform:translateY(100%);animation:ad-loader-fill calc(2s/var(--ad-loader-speed)) ease-in-out infinite}
.ad-loader-fill>img{width:100%;height:100%;object-fit:contain;transform:translateY(-100%);animation:ad-loader-fill-back calc(2s/var(--ad-loader-speed)) ease-in-out infinite}
.ad-loader[data-animation=shine] .ad-loader-sweep{width:72%;height:72%;overflow:hidden;-webkit-mask:var(--ad-loader-src) center/contain no-repeat;mask:var(--ad-loader-src) center/contain no-repeat}
.ad-loader-sweep>i{display:block;width:45%;height:100%;background:linear-gradient(90deg,transparent,rgb(255 255 255/.9),transparent);transform:translateX(-120%) skewX(-15deg);animation:ad-loader-shine calc(1.6s/var(--ad-loader-speed)) ease-in-out infinite}
.ad-loader[data-animation=wobble] .ad-loader-img{transform-origin:50% 90%;animation:ad-loader-wobble calc(1.2s/var(--ad-loader-speed)) ease-in-out infinite}
.ad-loader[data-animation=radar] .ad-loader-img{width:46%;height:46%}
.ad-loader[data-animation=radar] .ad-loader-ring{background:conic-gradient(from 0deg,transparent 0 70%,color-mix(in srgb,var(--ad-loader-color) 70%,transparent));-webkit-mask:radial-gradient(closest-side,transparent 30%,#000 32%);mask:radial-gradient(closest-side,transparent 30%,#000 32%);animation:ad-loader-spin calc(1.4s/var(--ad-loader-speed)) linear infinite}
@keyframes ad-loader-spin{to{transform:rotate(1turn)}}
@keyframes ad-loader-pulse{50%{transform:scale(.78);opacity:.55}}
@keyframes ad-loader-breathe{50%{transform:scale(1.12)}}
@keyframes ad-loader-bounce{from{transform:translateY(-28%)}to{transform:translateY(12%) scale(1.06,.94)}}
@keyframes ad-loader-shadow{from{transform:scale(.55);opacity:.5}to{transform:scale(1);opacity:1}}
@keyframes ad-loader-flip{0%{transform:perspective(20rem) rotateY(0)}50%{transform:perspective(20rem) rotateY(180deg)}100%{transform:perspective(20rem) rotateY(360deg)}}
@keyframes ad-loader-orbit{from{transform:rotate(0) translateX(140%) rotate(0)}to{transform:rotate(1turn) translateX(140%) rotate(-1turn)}}
@keyframes ad-loader-wave{from{transform:scale(.5);opacity:.9}to{transform:scale(1);opacity:0}}
@keyframes ad-loader-glow{50%{transform:scale(1.2);opacity:.8}}
@keyframes ad-loader-fill{0%{transform:translateY(100%)}70%,100%{transform:translateY(0)}}
@keyframes ad-loader-fill-back{0%{transform:translateY(-100%)}70%,100%{transform:translateY(0)}}
@keyframes ad-loader-shine{0%,30%{transform:translateX(-120%) skewX(-15deg)}100%{transform:translateX(260%) skewX(-15deg)}}
@keyframes ad-loader-wobble{0%,100%{transform:rotate(-12deg)}50%{transform:rotate(12deg)}}
\`;

let injected = false;
function useLoaderStyles() {
  useInsertionEffect(() => {
    if (injected || typeof document === "undefined") return;
    injected = true;
    const style = document.createElement("style");
    style.dataset.adLoader = "";
    style.textContent = loaderCss;
    document.head.append(style);
  }, []);
}

/** A music note, used when no picture is given. */
export const loaderDefaultImage =
  "data:image/svg+xml," +
  encodeURIComponent(
    \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff7c97"/><stop offset="1" stop-color="#ff244c"/></linearGradient></defs><path fill="url(#g)" d="M44 6v34.5A9 9 0 1 1 38 32V16L24 19.5v25A9 9 0 1 1 18 36V12z"/></svg>\`,
  );

/** A loading spinner made of your own picture, with one of twelve animations. */
export function Loader({ src = loaderDefaultImage, animation = "spin", size, speed = 1, color, label, style, ...p }: LoaderProps) {
  useLoaderStyles();
  const ref = useRef<HTMLSpanElement>(null);
  usePauseOffscreen(ref);
  const vars = {
    ...style,
    ...(size ? { "--ad-loader-size": size } : {}),
    "--ad-loader-speed": speed,
    ...(color ? { "--ad-loader-color": color } : {}),
    ...(animation === "shine" ? { "--ad-loader-src": \`url("\${src}")\` } : {}),
  } as CSSProperties;
  const rings = animation === "wave" ? 2 : ["bounce", "orbit", "glow", "radar"].includes(animation) ? 1 : 0;
  return (
    <span {...mark("Loader", p)} ref={ref} role="status" aria-label={label ?? tr("Загрузка")} data-animation={animation} style={vars}>
      {Array.from({ length: rings }, (_, i) => (
        <span key={i} className="ad-loader-ring" aria-hidden="true" />
      ))}
      <img className="ad-loader-img" src={src} alt="" draggable={false} />
      {animation === "fill" && (
        <span className="ad-loader-fill" aria-hidden="true">
          <img src={src} alt="" draggable={false} />
        </span>
      )}
      {animation === "shine" && (
        <span className="ad-loader-sweep" aria-hidden="true">
          <i />
        </span>
      )}
    </span>
  );
}
`;export{a as default};
