import { Term } from "../term/term";
import type { TermId } from "../term/glossary";
import styles from "./stack-diagram.module.css";

// The frontend stack we use, as layers. Bold = what this workshop uses.
// Faded = alternatives students will meet in the wild. Click any name for
// its glossary entry. Keep it this short.
const layers: { label: { en: string; ko: string }; ours: TermId[]; others: TermId[] }[] = [
  { label: { en: "Creative layer", ko: "크리에이티브 레이어" }, ours: ["canvas", "glsl", "threejs", "webAudio", "socketio"], others: ["p5js", "webgpu"] },
  { label: { en: "Styling", ko: "스타일링" }, ours: ["cssModules"], others: ["tailwind", "styledComponents"] },
  { label: { en: "Meta-framework", ko: "메타 프레임워크" }, ours: ["nextjs"], others: ["reactRouter", "astro", "nuxt"] },
  { label: { en: "UI framework", ko: "UI 프레임워크" }, ours: ["react"], others: ["vue", "svelte", "angular"] },
  { label: { en: "Language", ko: "언어" }, ours: ["typescript"], others: [] },
  { label: { en: "Fundamentals", ko: "기초" }, ours: ["html", "css", "javascript"], others: [] },
  { label: { en: "Runtime + packages", ko: "런타임 + 패키지" }, ours: ["nodejs", "pnpm"], others: ["npm", "yarn"] },
];

const tools = {
  en: ["VS Code + Claude Code (editor + agent)", "Git + GitHub (versions)", "Vercel (deploy)"],
  ko: ["VS Code + Claude Code (에디터 + 에이전트)", "Git + GitHub (버전 관리)", "Vercel (배포)"],
};

export function StackDiagram() {
  return (
    <figure className={styles.figure}>
      <div className={styles.stack}>
        {layers.map((layer) => (
          <div key={layer.label.en} className={styles.layer}>
            <div className={styles.label}>
              <span data-lang-block="en">{layer.label.en}</span>
              <span data-lang-block="ko">{layer.label.ko}</span>
            </div>
            <div className={styles.cells}>
              {layer.ours.map((id) => (
                <span key={id} className={styles.ours}>
                  <Term id={id} />
                </span>
              ))}
              {layer.others.map((id) => (
                <span key={id} className={styles.other}>
                  <Term id={id} />
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.side}>
        <div className={styles.sideTitle}>
          <span data-lang-block="en">Around it</span>
          <span data-lang-block="ko">그 주변</span>
        </div>
        {(["en", "ko"] as const).map((lang) => (
          <ul key={lang} data-lang-block={lang} className={styles.tools}>
            {tools[lang].map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
        ))}
      </div>
      <figcaption className={styles.caption}>
        <span data-lang-block="en">
          Each layer runs on the one below it. <b>Bold</b> is what we use; grey is what you will see elsewhere. Click a name.
        </span>
        <span data-lang-block="ko">
          각 층은 바로 아래 층 위에서 돈다. <b>굵은 글씨</b>가 우리가 쓰는 것, 회색은 다른 데서 보게 될 것. 이름을 눌러봐라.
        </span>
      </figcaption>
    </figure>
  );
}
