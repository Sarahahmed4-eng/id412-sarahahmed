import Link from "next/link";
import { L } from "@/app/lecture-materials/components/lang/lang-block";
import { LectureShell } from "@/app/lecture-materials/components/shell/shell";
import styles from "./page.module.css";

const weeks = [
  {
    href: "/lecture-materials/prelim",
    label: "Prelim",
    en: "Workshop overview, AI agents, installation, tutorial homework",
    ko: "워크숍 개요, AI 에이전트, 설치, 튜토리얼 과제",
  },
  {
    href: "/lecture-materials/w1",
    label: "Web 1 · 10/26",
    en: "Creative Coding (Canvas, GLSL, Three.js)",
    ko: "크리에이티브 코딩 (Canvas, GLSL, Three.js)",
  },
  {
    href: "/lecture-materials/w2",
    label: "Web 2 · 11/2",
    en: "Cross-Device Interaction (WebSocket)",
    ko: "크로스 디바이스 인터랙션 (WebSocket)",
  },
  {
    href: "/lecture-materials/w3",
    label: "Web 3 · 11/16",
    en: "Integrating System (API, Sound, Unreal)",
    ko: "시스템 통합 (API, 사운드, Unreal)",
  },
];

export default function Home() {
  return (
    <LectureShell>
      <h1>ID412 Interactive Space — Web Workshop</h1>
      <p className={styles.lead}>
        <L en="Web Workshop of the " ko="" />
        <a href="https://id.kaist.ac.kr/" target="_blank" rel="noopener noreferrer">Interactive Space (ID412)</a>
        <L en=" class" ko=" 수업의 웹 워크숍" />
        <br />
        <a href="https://www.kaist.ac.kr/en/" target="_blank" rel="noopener noreferrer">KAIST</a>{" "}
        <a href="https://id.kaist.ac.kr/" target="_blank" rel="noopener noreferrer">
          <L en="Dept. of Industrial Design" ko="산업디자인학과" />
        </a>
        <L en=", Fall 2026" ko=", 2026년 가을" />
        <br />
        <L en="Prof. " ko="" />
        <a href="https://yiyunkang.com/" target="_blank" rel="noopener noreferrer">Yiyun Kang</a>
        <L en=" · TA " ko=" 교수 · 조교 " />
        <a href="https://jeanyoon.ch/oi" target="_blank" rel="noopener noreferrer">
          <L en="Jeanyoon Choi" ko="최정윤" />
        </a>{" "}
        (<a href="https://www.xdlab.net/" target="_blank" rel="noopener noreferrer">XD Lab</a>)
        <br />
        <L en="Three creative frontend web development sessions" ko="크리에이티브 프론트엔드 웹 개발 세션 세 번" />
      </p>
      <ul>
        {weeks.map((week) => (
          <li key={week.href}>
            <Link href={week.href}>{week.label}</Link> — <L en={week.en} ko={week.ko} />
          </li>
        ))}
      </ul>
      <p>
        <Link href="/experiments">Experiments</Link> — <L en="every experiment in this repo, by week" ko="이 레포의 모든 실험, 주차별" />
        <br />
        <Link href="/final">Final</Link> — <L en="your final project" ko="여러분의 기말 프로젝트" />
      </p>
      <p>
        <L en="Code: " ko="코드: " />
        <a href="https://github.com/jeanyoon-choi/id412-2026" target="_blank" rel="noopener noreferrer">
          github.com/jeanyoon-choi/id412-2026
        </a>{" "}
        <L en="(use as template)." ko="(템플릿으로 사용)." />
      </p>
    </LectureShell>
  );
}
