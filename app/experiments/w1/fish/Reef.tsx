import type { CSSProperties, ReactNode, RefObject } from "react";
import styles from "./Reef.module.css";

// The coral reef, in three layers: far (pale silhouettes), middle (soft pastel coral) and front
// (bright, detailed coral at the sides). page.tsx moves the layers for parallax and lights up
// front pieces (the ones with data-coral) when the fish swims close.
// Each piece is its own small <svg>, placed with left/right, bottom and a height, so the reef
// rearranges itself on narrow screens. The curvy shapes are generated with a bit of maths below.

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

// --- Generated shapes ---

// Sea fan: a wavy fan outline, ribs from the base, and arcs across them like a net.
const FAN_BASE = { x: 100, y: 212 };
function fanPoint(degrees: number, radius: number) {
  const a = (degrees * Math.PI) / 180;
  return `${(FAN_BASE.x + Math.sin(a) * radius).toFixed(1)} ${(FAN_BASE.y - Math.cos(a) * radius).toFixed(1)}`;
}
const FAN_OUTLINE =
  `M${FAN_BASE.x} ${FAN_BASE.y} ` +
  Array.from({ length: 29 }, (_, i) => {
    const degrees = -68 + (i * 136) / 28;
    return `L${fanPoint(degrees, 160 + Math.sin(i * 1.7) * 9)}`;
  }).join(" ") +
  " Z";
const FAN_RIBS = Array.from({ length: 11 }, (_, i) => {
  const degrees = -62 + (i * 124) / 10;
  return `M${FAN_BASE.x} ${FAN_BASE.y} Q${fanPoint(degrees * 0.6, 80)} ${fanPoint(degrees, 155)}`;
}).join(" ");
const FAN_NET = [55, 95, 130]
  .map((radius) => `M${fanPoint(-60, radius)} A${radius} ${radius} 0 0 1 ${fanPoint(60, radius)}`)
  .join(" ");

// Round (brain) coral: a dome with wavy grooves; each groove fits inside the dome at its height.
const DOME_GROOVES = [108, 94, 80, 67, 56]
  .map((y) => {
    const halfWidth = 90 * Math.sqrt(1 - ((120 - y) / 78) ** 2) - 14;
    const waves = Math.max(1, Math.floor((halfWidth * 2) / 16));
    const startX = 100 - (waves * 16) / 2;
    return `M${startX.toFixed(1)} ${y}` + " q4 -6 8 0 q4 6 8 0".repeat(waves);
  })
  .join(" ");

// Anemone: tentacles fanning out from a small base, each ending in a round tip.
const ANEMONE_TENTACLES = Array.from({ length: 13 }, (_, i) => {
  const a = ((-70 + (i * 140) / 12) * Math.PI) / 180;
  const length = 46 + Math.cos(i * 2.3) * 8;
  // Rounded to 0.1, so the server and the browser produce exactly the same numbers.
  const round = (n: number) => Math.round(n * 10) / 10;
  const tip = { x: round(60 + Math.sin(a) * length), y: round(76 - Math.cos(a) * length) };
  const bend = { x: round(60 + Math.sin(a * 0.5) * length * 0.6 + 6), y: round(76 - Math.cos(a) * length * 0.6) };
  return { d: `M${round(60 + Math.sin(a) * 8)} 76 Q${bend.x} ${bend.y} ${tip.x} ${tip.y}`, tip };
});

// --- Pieces ---

// Branching coral: thick round-capped branches with lighter polyps at the tips.
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
function Branch({ color, tip, ...props }: PieceProps & { color: string; tip: string }) {
  return (
    <svg viewBox="0 0 200 262" {...pieceProps(props)}>
      <g fill="none" stroke={color} strokeLinecap="round">
        <path d={BRANCHES.slice(0, 2).join(" ")} strokeWidth="18" />
        <path d={BRANCHES.slice(2).join(" ")} strokeWidth="12" />
        <path d={BRANCHES.join(" ")} stroke={tip} strokeWidth="3" opacity="0.45" transform="translate(-3 -2)" />
      </g>
      {BRANCH_TIPS.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="7" fill={tip} />
      ))}
    </svg>
  );
}

function Fan({ color, ...props }: PieceProps & { color: string }) {
  return (
    <svg viewBox="0 0 200 216" {...pieceProps(props)}>
      <path d={FAN_OUTLINE} fill={color} opacity="0.35" />
      <path d={`${FAN_RIBS} ${FAN_NET}`} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M100 216 L100 196" stroke={color} strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

function Dome({ color, line, ...props }: PieceProps & { color: string; line: string }) {
  return (
    <svg viewBox="0 0 200 122" {...pieceProps(props)}>
      <path d="M8 122 C8 36 192 36 192 122 Z" fill={color} />
      <path d={DOME_GROOVES} fill="none" stroke={line} strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

// Tube sponges: three rounded tubes with dark openings.
function Tubes({ color, inside, ...props }: PieceProps & { color: string; inside: string }) {
  const tubes = [
    { x: 30, top: 70, w: 34 },
    { x: 66, top: 20, w: 40 },
    { x: 108, top: 90, w: 30 },
  ];
  return (
    <svg viewBox="0 0 160 202" {...pieceProps(props)}>
      {tubes.map((t) => (
        <g key={t.x}>
          <rect x={t.x} y={t.top} width={t.w} height={202 - t.top} rx={t.w / 2} fill={color} />
          <ellipse cx={t.x + t.w / 2} cy={t.top + 8} rx={t.w / 2 - 6} ry="5" fill={inside} />
        </g>
      ))}
    </svg>
  );
}

// Sea plant: long leaf blades that sway one after the other.
const BLADES = [
  "M60 280 C48 220 76 160 58 100 C50 70 62 40 56 10 C74 40 70 80 72 110 C86 170 66 220 70 280 Z",
  "M52 280 C40 240 26 200 30 150 C32 120 18 96 14 70 C34 92 42 120 42 150 C44 200 60 240 62 280 Z",
  "M68 280 C78 240 96 210 92 170 C90 150 100 130 108 112 C112 136 104 160 104 180 C104 220 86 250 78 280 Z",
];
function Plant({ color, ...props }: PieceProps & { color: string }) {
  return (
    <svg viewBox="0 0 120 282" {...pieceProps(props)}>
      {BLADES.map((d, i) => (
        <path key={i} d={d} fill={color} className={styles.blade} style={{ animationDelay: `${-i * 1.3}s`, opacity: 1 - i * 0.15 }} />
      ))}
    </svg>
  );
}

function Anemone({ color, tip, ...props }: PieceProps & { color: string; tip: string }) {
  return (
    <svg viewBox="0 0 120 80" {...pieceProps(props)}>
      <g className={styles.tentacles}>
        {ANEMONE_TENTACLES.map((t, i) => (
          <g key={i}>
            <path d={t.d} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
            <circle cx={t.tip.x} cy={t.tip.y} r="4" fill={tip} />
          </g>
        ))}
      </g>
      <ellipse cx="60" cy="78" rx="16" ry="6" fill={color} />
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
  children: ReactNode; // drawn between the middle and front layers (haze, the particle canvas)
};

export function Reef({ farRef, midRef, frontRef, children }: ReefProps) {
  return (
    <>
      {/* Far: pale ridges and coral silhouettes in the distance. */}
      <div ref={farRef} className={`${styles.layer} ${styles.far}`}>
        <svg className={styles.ridge} viewBox="0 0 1200 300" preserveAspectRatio="xMidYMax slice">
          <path d="M0 300 L0 190 C80 150 160 175 240 150 C320 125 380 165 470 140 C560 115 640 160 730 130 C820 100 900 150 990 125 C1080 100 1140 140 1200 120 L1200 300 Z" fill="#9fd3d3" />
          <path d="M0 300 L0 230 C120 205 220 235 360 210 C500 185 600 225 760 205 C900 188 1040 225 1200 200 L1200 300 Z" fill="#b8c9e6" opacity="0.7" />
        </svg>
        <Branch color="#8fc6cb" tip="#a7d5d6" style={{ left: "14%", bottom: "8vh", height: "18vh", ...sway(11, 2) }} />
        <Fan color="#a9bfe0" style={{ right: "24%", bottom: "9vh", height: "16vh", ...sway(13, 5) }} />
        <Branch color="#a9bfe0" tip="#bfcfea" style={{ right: "6%", bottom: "10vh", height: "14vh", ...sway(12, 7) }} />
      </div>

      {/* Middle: soft pastel coral, lower than the fish. */}
      <div ref={midRef} className={`${styles.layer} ${styles.mid}`}>
        <Dome color="#d9b8dd" line="#b893c2" style={{ left: "8%", bottom: "4vh", height: "9vh", ...sway(10, 1) }} />
        <Branch color="#efb3a8" tip="#f8cfc4" style={{ left: "30%", bottom: "3vh", height: "22vh", ...sway(9, 3) }} className={styles.wide} />
        <Fan color="#f2a99d" style={{ right: "30%", bottom: "4vh", height: "20vh", ...sway(10, 6) }} />
        <Plant color="#6fb7a6" style={{ left: "52%", bottom: "2vh", height: "18vh", ...sway(7, 2) }} className={styles.wide} />
        <Dome color="#f6c99f" line="#e0a374" style={{ right: "40%", bottom: "3vh", height: "7vh", ...sway(9, 4) }} className={styles.wide} />
      </div>

      {children}

      {/* Front: bright, detailed coral at both sides; the middle stays open for the fish. */}
      <div ref={frontRef} className={`${styles.layer} ${styles.front}`}>
        <Fan front color="#b48fd6" style={{ left: "9%", bottom: "4vh", height: "clamp(100px, min(30vh, 45vw), 320px)", ...sway(9, 2) }} />
        <Branch front color="#f27d8c" tip="#ffc2c8" style={{ left: "-3%", bottom: 0, height: "clamp(120px, min(40vh, 55vw), 440px)", ...sway(8, 0) }} />
        <Plant front color="#3f9f8c" style={{ left: "21%", bottom: 0, height: "clamp(130px, 34vh, 380px)", ...sway(6, 3) }} className={styles.wide} />
        <Dome front color="#ffb38a" line="#e07f58" style={{ left: "26%", bottom: 0, height: "clamp(46px, 10vh, 110px)", ...sway(10, 4) }} className={styles.wide} />
        <Anemone front color="#f59fb6" tip="#ffe08a" style={{ left: "43%", bottom: "1vh", height: "clamp(40px, 8vh, 90px)", ...sway(5, 1) }} />
        <Plant front color="#5bb59a" style={{ right: "33%", bottom: 0, height: "clamp(100px, 24vh, 280px)", ...sway(7, 5) }} className={styles.wide} />
        <Tubes front color="#f6c453" inside="#c98a2a" style={{ right: "21%", bottom: 0, height: "clamp(80px, 20vh, 220px)", ...sway(11, 2) }} className={styles.wide} />
        <Fan front color="#ff8f7a" style={{ right: "8%", bottom: "3vh", height: "clamp(100px, min(32vh, 45vw), 340px)", ...sway(9, 6) }} />
        <Branch front color="#ff9a4d" tip="#ffd27a" style={{ right: "-4%", bottom: 0, height: "clamp(130px, min(44vh, 60vw), 460px)", ...sway(8, 3) }} />
        <Dome front color="#c7a3e6" line="#9a74c4" style={{ right: "14%", bottom: 0, height: "clamp(40px, 8vh, 90px)", ...sway(10, 1) }} />

        <svg className={styles.sand} viewBox="0 0 1200 80" preserveAspectRatio="none">
          <path d="M0 80 L0 40 C150 20 300 50 480 34 C660 18 820 48 1000 32 C1100 24 1160 34 1200 30 L1200 80 Z" fill="#f6e3c3" />
          <path d="M0 80 L0 58 C200 44 420 66 640 54 C860 42 1020 64 1200 52 L1200 80 Z" fill="#efd3a8" />
        </svg>
      </div>
    </>
  );
}
