import { Fragment, type CSSProperties, type ReactNode, type RefObject } from "react";
import styles from "./Reef.module.css";

// The coral reef, in three layers: far (dark blue silhouettes and kelp), middle (dimmer coral)
// and front (luminous coral at the sides, with glowing dots). page.tsx moves the layers for
// parallax and lights up front pieces (the ones with data-coral) when the fish swims close.
// Each piece is its own small <svg>, placed with left/right, bottom and a height, so the reef
// rearranges itself on narrow screens. The curvy shapes are generated with a bit of maths below.

// Colour ramps: base (deep, at the bottom) → middle → tip (luminous). Each becomes a gradient in <Defs>.
const TONES = {
  orange: ["#9a3412", "#ff8a3d", "#ffd59a"],
  pink: ["#831843", "#ff5fa2", "#ffc4de"],
  magenta: ["#5b1370", "#d946ef", "#f7c4ff"],
  lavender: ["#3b2f8f", "#a48bff", "#e6deff"],
  blue: ["#1e3a8a", "#4f9bff", "#c4e4ff"],
  gold: ["#8a5a06", "#ffc83d", "#fff2b8"],
  green: ["#0d4f4a", "#22b59a", "#aaf7dc"],
  violetMid: ["#262463", "#5d55b8", "#9d93e8"],
  coralMid: ["#3a2056", "#a5507f", "#e09ab9"],
  tealMid: ["#10385a", "#2a7f93", "#77c9c4"],
  far: ["#16386a", "#24578a", "#3a7aa6"],
  floor: ["#0f1640", "#1f2a66", "#3b4a8f"],
} as const;
type Tone = keyof typeof TONES;

// Colours of the small glowing (bioluminescent) dots.
const GLOWS = { gold: "#ffe9a8", cyan: "#9ffcf0", pink: "#ffc4f0" };
type Glow = keyof typeof GLOWS;

// The gradients, defined once for the whole page. url(#reef-pink) works from any piece's <svg>.
// reef-<tone>: bottom to top of each shape. reef-<tone>-tall: bottom to top of a 262-high drawing (branches).
function Defs() {
  return (
    <svg className={styles.defs} aria-hidden="true">
      <defs>
        {Object.entries(TONES).map(([name, [base, middle, tip]]) => (
          <Fragment key={name}>
            <linearGradient id={`reef-${name}`} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor={base} />
              <stop offset="0.55" stopColor={middle} />
              <stop offset="1" stopColor={tip} />
            </linearGradient>
            <linearGradient id={`reef-${name}-tall`} gradientUnits="userSpaceOnUse" x1="0" y1="262" x2="0" y2="0">
              <stop offset="0" stopColor={base} />
              <stop offset="0.6" stopColor={middle} />
              <stop offset="1" stopColor={tip} />
            </linearGradient>
          </Fragment>
        ))}
        {Object.entries(GLOWS).map(([name, color]) => (
          <radialGradient key={name} id={`glow-${name}`}>
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.2" stopColor={color} />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>
    </svg>
  );
}

// A glowing dot that twinkles slowly.
function Dot({ x, y, r, glow, delay }: { x: number; y: number; r: number; glow: Glow; delay: number }) {
  return <circle cx={x} cy={y} r={r} fill={`url(#glow-${glow})`} className={styles.spark} style={{ animationDelay: `${-delay}s` }} />;
}

type PieceProps = { style: CSSProperties; className?: string; front?: boolean };

// Every piece sways from its base. Its animation duration and delay come from style.
function pieceProps({ style, className, front }: PieceProps) {
  return {
    className: `${styles.piece} ${className ?? ""}`,
    style,
    "data-coral": front ? "" : undefined,
    preserveAspectRatio: "xMidYMax meet",
  };
}

// Rounded to 0.1, so the server and the browser produce exactly the same numbers.
function round(n: number) {
  return Math.round(n * 10) / 10;
}

// --- Generated shapes ---

// Sea fan: a wavy fan outline, ribs from the base, and arcs across them like a net.
function fanXY(degrees: number, radius: number) {
  const a = (degrees * Math.PI) / 180;
  return { x: round(100 + Math.sin(a) * radius), y: round(212 - Math.cos(a) * radius) };
}
function fanPoint(degrees: number, radius: number) {
  const { x, y } = fanXY(degrees, radius);
  return `${x} ${y}`;
}
const FAN_OUTLINE =
  "M100 212 " +
  Array.from({ length: 29 }, (_, i) => `L${fanPoint(-68 + (i * 136) / 28, 160 + Math.sin(i * 1.7) * 9)}`).join(" ") +
  " Z";
const FAN_RIBS = Array.from({ length: 11 }, (_, i) => {
  const degrees = -62 + (i * 124) / 10;
  return `M100 212 Q${fanPoint(degrees * 0.6, 80)} ${fanPoint(degrees, 155)}`;
}).join(" ");
const FAN_NET = [55, 95, 130].map((r) => `M${fanPoint(-60, r)} A${r} ${r} 0 0 1 ${fanPoint(60, r)}`).join(" ");
const FAN_DOTS = [-48, -18, 14, 44].map((degrees) => fanXY(degrees, 148));

// Round (brain) coral: a dome with wavy grooves; each groove fits inside the dome at its height.
const DOME_GROOVES = [108, 94, 80, 67, 56]
  .map((y) => {
    const halfWidth = 90 * Math.sqrt(1 - ((120 - y) / 78) ** 2) - 14;
    const waves = Math.max(1, Math.floor((halfWidth * 2) / 16));
    return `M${round(100 - (waves * 16) / 2)} ${y}` + " q4 -6 8 0 q4 6 8 0".repeat(waves);
  })
  .join(" ");

// Anemone: tentacles fanning out from a small base, each ending in a round tip.
const ANEMONE_TENTACLES = Array.from({ length: 13 }, (_, i) => {
  const a = ((-70 + (i * 140) / 12) * Math.PI) / 180;
  const length = 46 + Math.cos(i * 2.3) * 8;
  const tip = { x: round(60 + Math.sin(a) * length), y: round(76 - Math.cos(a) * length) };
  const bend = { x: round(60 + Math.sin(a * 0.5) * length * 0.6 + 6), y: round(76 - Math.cos(a) * length * 0.6) };
  return { d: `M${round(60 + Math.sin(a) * 8)} 76 Q${bend.x} ${bend.y} ${tip.x} ${tip.y}`, tip };
});

// Sea grass: thin blades of different heights, each leaning its own way.
const GRASS = Array.from({ length: 7 }, (_, i) => {
  const x = 24 + i * 12;
  const h = 150 + ((i * 53) % 110);
  const lean = ((i * 37) % 44) - 22;
  const w = 6 + (i % 3) * 2;
  return (
    `M${x - w / 2} 282 C${x - w / 2 + lean * 0.3} ${282 - h * 0.5} ${x - w / 2 + lean * 0.8} ${282 - h * 0.8} ${x + lean} ${282 - h} ` +
    `C${x + w / 2 + lean * 0.8} ${282 - h * 0.8} ${x + w / 2 + lean * 0.3} ${282 - h * 0.5} ${x + w / 2} 282 Z`
  );
});

// Soft coral: round lobes on short stalks, with tiny polyps.
const LOBES = [
  { x: 60, y: 40, rx: 22, ry: 18 },
  { x: 32, y: 62, rx: 18, ry: 15 },
  { x: 88, y: 58, rx: 20, ry: 16 },
  { x: 48, y: 86, rx: 16, ry: 13 },
  { x: 80, y: 90, rx: 15, ry: 12 },
  { x: 18, y: 98, rx: 12, ry: 10 },
  { x: 102, y: 100, rx: 12, ry: 10 },
];

// Kelp: a wavy stalk with leaves on alternate sides.
const KELP_LEAVES = Array.from({ length: 9 }, (_, i) => ({ y: 280 - i * 31, side: i % 2 === 0 ? 1 : -1 }));

// --- Pieces ---

// Branching coral: thick round-capped branches, darker at the base, with luminous polyps at the tips.
const BRANCHES = [
  "M100 260 C100 225 96 195 100 160",
  "M100 205 C80 185 60 172 54 132",
  "M54 132 C48 112 34 102 30 76",
  "M54 132 C62 114 68 98 66 70",
  "M100 175 C122 155 140 142 146 106",
  "M146 106 C150 86 166 74 170 50",
  "M146 106 C136 88 130 72 132 46",
  "M100 160 C98 130 104 100 100 62",
  "M100 62 C96 48 88 38 84 20",
  "M100 62 C106 48 114 40 118 22",
];
const BRANCH_TIPS = [
  [30, 76], [66, 70], [170, 50], [132, 46], [84, 20], [118, 22],
];
function Branch({ tone, glow, ...props }: PieceProps & { tone: Tone; glow?: Glow }) {
  return (
    <svg viewBox="0 0 200 262" {...pieceProps(props)}>
      <g fill="none" stroke={`url(#reef-${tone}-tall)`} strokeLinecap="round">
        <path d={BRANCHES.slice(0, 2).join(" ")} strokeWidth="18" />
        <path d={BRANCHES.slice(2).join(" ")} strokeWidth="12" />
      </g>
      {BRANCH_TIPS.map(([x, y], i) => (
        <Fragment key={i}>
          <circle cx={x} cy={y} r="7" fill={TONES[tone][2]} />
          {glow && <Dot x={x} y={y} r={17} glow={glow} delay={i * 0.9} />}
        </Fragment>
      ))}
    </svg>
  );
}

// Sea fan: translucent, with fine ribs.
function Fan({ tone, glow, ...props }: PieceProps & { tone: Tone; glow?: Glow }) {
  const [base, , tip] = TONES[tone];
  return (
    <svg viewBox="0 0 200 216" {...pieceProps(props)}>
      <path d={FAN_OUTLINE} fill={`url(#reef-${tone})`} opacity="0.5" />
      <path d={FAN_RIBS} fill="none" stroke={tip} strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />
      <path d={FAN_NET} fill="none" stroke={tip} strokeWidth="1.2" opacity="0.3" />
      <path d="M100 216 L100 196" stroke={base} strokeWidth="6" strokeLinecap="round" />
      {glow && FAN_DOTS.map((p, i) => <Dot key={i} x={p.x} y={p.y} r={12} glow={glow} delay={i * 1.3} />)}
    </svg>
  );
}

function Dome({ tone, glow, ...props }: PieceProps & { tone: Tone; glow?: Glow }) {
  return (
    <svg viewBox="0 0 200 122" {...pieceProps(props)}>
      <path d="M8 122 C8 36 192 36 192 122 Z" fill={`url(#reef-${tone})`} />
      <path d={DOME_GROOVES} fill="none" stroke={TONES[tone][0]} strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
      {glow && [[70, 60], [104, 52], [138, 64]].map(([x, y], i) => <Dot key={i} x={x} y={y} r={14} glow={glow} delay={i * 1.1} />)}
    </svg>
  );
}

// Tube sponges: three rounded tubes with glowing rims.
const TUBES = [
  { x: 30, top: 70, w: 34 },
  { x: 66, top: 20, w: 40 },
  { x: 108, top: 90, w: 30 },
];
function Tubes({ tone, glow, ...props }: PieceProps & { tone: Tone; glow?: Glow }) {
  const [base, , tip] = TONES[tone];
  return (
    <svg viewBox="0 0 160 202" {...pieceProps(props)}>
      {TUBES.map((t, i) => (
        <g key={t.x}>
          <rect x={t.x} y={t.top} width={t.w} height={202 - t.top} rx={t.w / 2} fill={`url(#reef-${tone})`} />
          <ellipse cx={t.x + t.w / 2} cy={t.top + 8} rx={t.w / 2 - 5} ry="5" fill={base} />
          <ellipse cx={t.x + t.w / 2} cy={t.top + 8} rx={t.w / 2 - 5} ry="5" fill="none" stroke={tip} strokeWidth="2" opacity="0.9" />
          {glow && <Dot x={t.x + t.w / 2} y={t.top + 6} r={16} glow={glow} delay={i * 1.4} />}
        </g>
      ))}
    </svg>
  );
}

// Sea grass: many thin blades, each swaying on its own.
function Grass({ tone, ...props }: PieceProps & { tone: Tone }) {
  return (
    <svg viewBox="0 0 120 282" {...pieceProps(props)}>
      {GRASS.map((d, i) => (
        <path key={i} d={d} fill={`url(#reef-${tone})`} className={styles.blade} style={{ animationDelay: `${-i * 0.6}s`, animationDuration: `${4 + (i % 3)}s` }} />
      ))}
    </svg>
  );
}

// Sea plant: a few wide leaves.
const LEAVES = [
  "M60 280 C48 220 76 160 58 100 C50 70 62 40 56 10 C74 40 70 80 72 110 C86 170 66 220 70 280 Z",
  "M52 280 C40 240 26 200 30 150 C32 120 18 96 14 70 C34 92 42 120 42 150 C44 200 60 240 62 280 Z",
  "M68 280 C78 240 96 210 92 170 C90 150 100 130 108 112 C112 136 104 160 104 180 C104 220 86 250 78 280 Z",
];
function Plant({ tone, ...props }: PieceProps & { tone: Tone }) {
  return (
    <svg viewBox="0 0 120 282" {...pieceProps(props)}>
      {LEAVES.map((d, i) => (
        <path key={i} d={d} fill={`url(#reef-${tone})`} className={styles.blade} style={{ animationDelay: `${-i * 1.3}s`, opacity: 0.9 - i * 0.15 }} />
      ))}
    </svg>
  );
}

function Anemone({ tone, glow, ...props }: PieceProps & { tone: Tone; glow: Glow }) {
  const [base, , tip] = TONES[tone];
  return (
    <svg viewBox="0 0 120 80" {...pieceProps(props)}>
      <g className={styles.tentacles}>
        {ANEMONE_TENTACLES.map((t, i) => (
          <g key={i}>
            <path d={t.d} fill="none" stroke={`url(#reef-${tone})`} strokeWidth="5" strokeLinecap="round" />
            <circle cx={t.tip.x} cy={t.tip.y} r="3.5" fill={tip} />
            {i % 3 === 0 && <Dot x={t.tip.x} y={t.tip.y} r={9} glow={glow} delay={i * 0.5} />}
          </g>
        ))}
      </g>
      <ellipse cx="60" cy="78" rx="16" ry="6" fill={base} />
    </svg>
  );
}

function SoftCoral({ tone, glow, ...props }: PieceProps & { tone: Tone; glow?: Glow }) {
  const [base] = TONES[tone];
  return (
    <svg viewBox="0 0 120 130" {...pieceProps(props)}>
      <path d={LOBES.map((l) => `M60 130 Q${(60 + l.x) / 2} ${l.y + 30} ${l.x} ${l.y}`).join(" ")} fill="none" stroke={base} strokeWidth="6" strokeLinecap="round" />
      {LOBES.map((l, i) => (
        <g key={i}>
          <ellipse cx={l.x} cy={l.y} rx={l.rx} ry={l.ry} fill={`url(#reef-${tone})`} opacity="0.88" />
          <circle cx={round(l.x - l.rx * 0.4)} cy={round(l.y - l.ry * 0.2)} r="1.6" fill="#fff" opacity="0.55" />
          <circle cx={round(l.x + l.rx * 0.3)} cy={round(l.y - l.ry * 0.35)} r="1.4" fill="#fff" opacity="0.5" />
          <circle cx={l.x} cy={round(l.y + l.ry * 0.3)} r="1.5" fill="#fff" opacity="0.45" />
        </g>
      ))}
      {glow && <Dot x={60} y={36} r={20} glow={glow} delay={0.5} />}
    </svg>
  );
}

function Kelp({ tone, ...props }: PieceProps & { tone: Tone }) {
  const [, middle, tip] = TONES[tone];
  return (
    <svg viewBox="0 0 80 300" {...pieceProps(props)}>
      <path d="M40 300 C30 250 50 200 38 150 C28 100 50 60 40 0" fill="none" stroke={middle} strokeWidth="4" strokeLinecap="round" />
      {KELP_LEAVES.map(({ y, side }) => (
        <ellipse key={y} cx={40 + side * 13} cy={y} rx="15" ry="5" fill={tip} opacity="0.8" transform={`rotate(${-side * 30} ${40 + side * 13} ${y})`} />
      ))}
    </svg>
  );
}

// A sway speed per piece, so they never move in step.
function sway(duration: number, delay: number): CSSProperties {
  return { animationDuration: `${duration}s`, animationDelay: `${-delay}s` };
}

type ReefProps = {
  farRef: RefObject<HTMLDivElement | null>;
  midRef: RefObject<HTMLDivElement | null>;
  frontRef: RefObject<HTMLDivElement | null>;
  children: ReactNode; // drawn between the middle and front layers (haze, the light canvas)
};

export function Reef({ farRef, midRef, frontRef, children }: ReefProps) {
  return (
    <>
      <Defs />

      {/* Far: dark blue ridges, kelp and coral silhouettes, deep in the haze. */}
      <div ref={farRef} className={`${styles.layer} ${styles.far}`}>
        <svg className={styles.ridge} viewBox="0 0 1200 300" preserveAspectRatio="xMidYMax slice">
          <path d="M0 300 L0 170 C80 130 160 160 240 135 C320 110 380 150 470 125 C560 100 640 145 730 115 C820 85 900 135 990 110 C1080 85 1140 125 1200 105 L1200 300 Z" fill="url(#reef-far)" opacity="0.8" />
          <path d="M0 300 L0 220 C120 195 220 225 360 200 C500 175 600 215 760 195 C900 178 1040 215 1200 190 L1200 300 Z" fill="#17306a" />
        </svg>
        <Kelp tone="far" style={{ left: "4%", bottom: "10vh", height: "44vh", ...sway(12, 1) }} />
        <Kelp tone="far" style={{ left: "35%", bottom: "12vh", height: "32vh", ...sway(14, 4) }} className={styles.wide} />
        <Kelp tone="far" style={{ right: "30%", bottom: "11vh", height: "40vh", ...sway(13, 7) }} />
        <Kelp tone="far" style={{ right: "5%", bottom: "13vh", height: "30vh", ...sway(11, 3) }} className={styles.wide} />
        <Branch tone="far" style={{ left: "17%", bottom: "11vh", height: "19vh", ...sway(11, 2) }} />
        <Fan tone="far" style={{ right: "17%", bottom: "12vh", height: "17vh", ...sway(13, 5) }} />
        <SoftCoral tone="far" style={{ right: "44%", bottom: "12vh", height: "9vh", ...sway(12, 6) }} />
      </div>

      {/* Middle: dimmer, softer coral, lower than the fish. */}
      <div ref={midRef} className={`${styles.layer} ${styles.mid}`}>
        <Dome tone="coralMid" style={{ left: "9%", bottom: "5vh", height: "9vh", ...sway(10, 1) }} />
        <Plant tone="tealMid" style={{ left: "38%", bottom: "4vh", height: "16vh", ...sway(7, 4) }} className={styles.wide} />
        <Branch tone="violetMid" glow="cyan" style={{ left: "26%", bottom: "4vh", height: "22vh", ...sway(9, 3) }} className={styles.wide} />
        <Grass tone="tealMid" style={{ left: "50%", bottom: "3vh", height: "19vh", ...sway(7, 2) }} />
        <Fan tone="coralMid" style={{ right: "28%", bottom: "5vh", height: "21vh", ...sway(10, 6) }} />
        <SoftCoral tone="violetMid" style={{ right: "44%", bottom: "4vh", height: "11vh", ...sway(9, 4) }} className={styles.wide} />
        <Tubes tone="tealMid" style={{ right: "10%", bottom: "6vh", height: "15vh", ...sway(11, 5) }} />
      </div>

      {children}

      {/* Front: luminous coral at both sides; the middle stays open for the fish. */}
      <div ref={frontRef} className={`${styles.layer} ${styles.front}`}>
        <Fan front tone="lavender" glow="cyan" style={{ left: "8%", bottom: "4vh", height: "clamp(100px, min(30vh, 45vw), 320px)", ...sway(9, 2) }} />
        <Branch front tone="pink" glow="pink" style={{ left: "-3%", bottom: 0, height: "clamp(120px, min(40vh, 55vw), 440px)", ...sway(8, 0) }} />
        <Grass front tone="green" style={{ left: "19%", bottom: 0, height: "clamp(110px, min(30vh, 40vw), 340px)", ...sway(6, 3) }} className={styles.wide} />
        <SoftCoral front tone="magenta" glow="pink" style={{ left: "25%", bottom: "1vh", height: "clamp(60px, 13vh, 150px)", ...sway(9, 1) }} className={styles.wide} />
        <Dome front tone="orange" glow="gold" style={{ left: "31%", bottom: 0, height: "clamp(44px, 9vh, 100px)", ...sway(10, 4) }} className={styles.wide} />
        <Anemone front tone="pink" glow="gold" style={{ left: "43%", bottom: "1vh", height: "clamp(40px, 8vh, 90px)", ...sway(5, 1) }} />
        <Plant front tone="green" style={{ right: "34%", bottom: 0, height: "clamp(90px, 22vh, 260px)", ...sway(7, 5) }} className={styles.wide} />
        <Tubes front tone="gold" glow="gold" style={{ right: "22%", bottom: 0, height: "clamp(80px, 19vh, 210px)", ...sway(11, 2) }} className={styles.wide} />
        <Fan front tone="blue" glow="cyan" style={{ right: "8%", bottom: "3vh", height: "clamp(100px, min(32vh, 45vw), 340px)", ...sway(9, 6) }} />
        <Grass front tone="green" style={{ right: "14%", bottom: 0, height: "clamp(70px, 16vh, 180px)", ...sway(6, 2) }} />
        <Branch front tone="orange" glow="gold" style={{ right: "-4%", bottom: 0, height: "clamp(130px, min(44vh, 60vw), 460px)", ...sway(8, 3) }} />
        <Dome front tone="magenta" style={{ right: "15%", bottom: 0, height: "clamp(40px, 8vh, 90px)", ...sway(10, 1) }} />

        <svg className={styles.floor} viewBox="0 0 1200 80" preserveAspectRatio="none">
          <path d="M0 80 L0 38 C60 22 120 40 190 30 C260 20 330 44 420 34 C520 22 600 46 700 36 C800 26 880 44 980 30 C1080 18 1150 36 1200 28 L1200 80 Z" fill="url(#reef-floor)" />
        </svg>
      </div>
    </>
  );
}
