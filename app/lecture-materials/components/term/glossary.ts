// Glossary for <Term id="..." />. Every entry answers, in English and Korean:
// what it is, how this workshop uses it, the official site, where to learn,
// and where it appears in these notes. Add a term here and it becomes
// clickable in every lecture page.

type Link = { label: string; url: string };
type Related = { href: string; en: string; ko: string };
type Text = { what: string; use: string };

export type TermEntry = {
  name: string;
  en: Text;
  ko: Text;
  official: Link;
  learn: Link[];
  related?: Related[];
};

export const terms = {
  html: {
    name: "HTML",
    en: {
      what: "HyperText Markup Language. The structure of a web page: headings, paragraphs, images, links, buttons. Every web page is HTML underneath, whatever framework produced it.",
      use: "You rarely write raw HTML files here. React components return JSX, which is HTML written inside Javascript. You still need to know the tags, because that is what you are composing.",
    },
    ko: {
      what: "웹 페이지의 구조를 적는 마크업 언어. 제목, 문단, 이미지, 링크, 버튼이 전부 HTML 태그다. 어떤 프레임워크를 쓰든 결국 브라우저가 받는 건 HTML이다.",
      use: "이 워크숍에서 HTML 파일을 직접 쓰는 일은 거의 없다. React 컴포넌트가 돌려주는 JSX가 Javascript 안에 적은 HTML이다. 그래도 태그는 알아야 한다. 결국 그걸 조합하는 거니까.",
    },
    official: { label: "MDN: HTML", url: "https://developer.mozilla.org/en-US/docs/Web/HTML" },
    learn: [
      { label: "생활코딩 HTML", url: "https://opentutorials.org/course/3084" },
      { label: "The Odin Project: Foundations", url: "https://www.theodinproject.com/paths/foundations/courses/foundations" },
    ],
    related: [{ href: "/lecture-materials/prelim#tutorial-hw", en: "Prelim: Tutorial HW", ko: "Prelim: 튜토리얼 과제" }],
  },
  css: {
    name: "CSS",
    en: {
      what: "Cascading Style Sheets. How a page looks: colour, size, position, animation. HTML says what is there, CSS says how it appears.",
      use: "Each experiment folder has a *.module.css next to its page.tsx. Full-screen canvases, overlapping images, typography experiments are all CSS before they are anything else.",
    },
    ko: {
      what: "페이지가 어떻게 보이는지를 정하는 언어. 색, 크기, 위치, 애니메이션. HTML이 '무엇이 있다'면 CSS는 '어떻게 보인다'이다.",
      use: "각 실험 폴더에 page.tsx 옆에 *.module.css가 하나씩 있다. 화면 꽉 채운 캔버스, 겹친 이미지, 타이포 실험은 다른 무엇이기 전에 CSS다.",
    },
    official: { label: "MDN: CSS", url: "https://developer.mozilla.org/en-US/docs/Web/CSS" },
    learn: [
      { label: "생활코딩 CSS", url: "https://opentutorials.org/course/3086" },
      { label: "Scrimba: HTML & CSS", url: "https://v2.scrimba.com/learn-html-and-css-c0p" },
    ],
    related: [{ href: "/lecture-materials/w1#6-use-the-id412-workshop-template", en: "W1: Hello World (template)", ko: "W1: Hello World (템플릿)" }],
  },
  javascript: {
    name: "Javascript",
    en: {
      what: "The programming language of the browser. Everything that moves, reacts, fetches, or computes on a web page is Javascript. Also runs on the server (Node.js).",
      use: "Everything you write in this workshop is Javascript, through TypeScript and React. Time intervals, mouse tracking, sockets, shaders' host code, API calls. This is the one you must actually know.",
    },
    ko: {
      what: "브라우저의 프로그래밍 언어. 웹 페이지에서 움직이고, 반응하고, 데이터를 가져오고, 계산하는 모든 것이 Javascript다. 서버에서도 돈다(Node.js).",
      use: "이 워크숍에서 쓰는 모든 코드가 결국 Javascript다(TypeScript와 React를 거쳐서). 타이머, 마우스 추적, 소켓, 셰이더를 부르는 코드, API 호출. 이것만은 진짜로 알아야 한다.",
    },
    official: { label: "MDN: JavaScript", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
    learn: [
      { label: "생활코딩 Javascript", url: "https://opentutorials.org/course/3085" },
      { label: "Scrimba: Learn JavaScript", url: "https://v2.scrimba.com/learn-javascript-c0v" },
      { label: "javascript.info", url: "https://javascript.info/" },
    ],
    related: [{ href: "/lecture-materials/prelim#tutorial-hw", en: "Prelim: Tutorial HW", ko: "Prelim: 튜토리얼 과제" }],
  },
  typescript: {
    name: "TypeScript",
    en: {
      what: "Javascript plus types. You write what kind of value a variable holds, and the editor catches mistakes before you run anything. It compiles down to plain Javascript.",
      use: "All files are .ts / .tsx. You do not need to master the type system. `pnpm typecheck` is how the agent checks its own work.",
    },
    ko: {
      what: "Javascript에 타입을 더한 언어. 변수에 어떤 값이 들어가는지 적어두면 실행 전에 에디터가 실수를 잡아준다. 결국 평범한 Javascript로 변환된다.",
      use: "모든 파일이 .ts / .tsx다. 타입 시스템을 마스터할 필요는 없다. `pnpm typecheck`가 에이전트가 자기 작업을 검증하는 방법이다.",
    },
    official: { label: "typescriptlang.org", url: "https://www.typescriptlang.org/" },
    learn: [
      { label: "TypeScript for JS Programmers", url: "https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html" },
      { label: "Total TypeScript (free tutorials)", url: "https://www.totaltypescript.com/tutorials" },
    ],
  },
  react: {
    name: "React.js",
    en: {
      what: "A library for building user interfaces out of components. A component is a function that returns JSX. State changes, the component re-renders. Made by Meta, the industry standard frontend library.",
      use: "Every page and every experiment is a React component. useState for things that change, useEffect for timers, listeners and sockets, useRef for canvases. Three.js also goes through React (React Three Fiber).",
    },
    ko: {
      what: "UI를 컴포넌트 단위로 만드는 라이브러리. 컴포넌트는 JSX를 돌려주는 함수다. 상태가 바뀌면 컴포넌트가 다시 그려진다. Meta가 만들었고, 프론트엔드 업계 표준이다.",
      use: "모든 페이지와 실험이 React 컴포넌트다. 변하는 값은 useState, 타이머·리스너·소켓은 useEffect, 캔버스는 useRef. Three.js도 React를 통해 쓴다(React Three Fiber).",
    },
    official: { label: "react.dev", url: "https://react.dev/" },
    learn: [
      { label: "React: Quick Start", url: "https://react.dev/learn" },
      { label: "React: Tic-Tac-Toe tutorial", url: "https://react.dev/learn/tutorial-tic-tac-toe" },
      { label: "생활코딩 React", url: "https://opentutorials.org/course/4900" },
    ],
    related: [{ href: "/lecture-materials/w1#3-what-is-nextjs", en: "W1: What is Next.js?", ko: "W1: Next.js란?" }],
  },
  nextjs: {
    name: "Next.js",
    en: {
      what: "A framework on top of React made by Vercel. It adds routing (a folder becomes a URL), server code (API routes), image and font handling, and one-click deployment. We use the App Router: everything lives in app/.",
      use: "This whole repository is one Next.js app. app/experiments/w1/<name>/page.tsx becomes /experiments/w1/<name>. In W3, app/api/<name>/route.ts is where your API key lives, on the server.",
    },
    ko: {
      what: "Vercel이 만든 React 기반 프레임워크. 라우팅(폴더가 곧 URL), 서버 코드(API 라우트), 이미지·폰트 처리, 원클릭 배포가 더해진다. 우리는 App Router를 쓴다. 전부 app/ 안에 있다.",
      use: "이 레포 전체가 Next.js 앱 하나다. app/experiments/w1/<이름>/page.tsx가 /experiments/w1/<이름>이 된다. W3에서는 app/api/<이름>/route.ts에 API 키가 산다. 서버 쪽에.",
    },
    official: { label: "nextjs.org/docs", url: "https://nextjs.org/docs" },
    learn: [
      { label: "Next.js: Learn (official course)", url: "https://nextjs.org/learn" },
      { label: "생활코딩 Next.js (App Router)", url: "https://opentutorials.org/course/5098" },
    ],
    related: [
      { href: "/lecture-materials/w1#3-what-is-nextjs", en: "W1: What is Next.js?", ko: "W1: Next.js란?" },
      { href: "/lecture-materials/w1#6-use-the-id412-workshop-template", en: "W1: Hello World (template)", ko: "W1: Hello World (템플릿)" },
    ],
  },
  cssModules: {
    name: "CSS Modules",
    en: {
      what: "Plain CSS files named *.module.css. Class names are scoped to the file, so .box in one experiment never collides with .box in another. Built into Next.js, no extra package.",
      use: "page.tsx imports styles from './page.module.css' and uses className={styles.box}. That is the whole pattern. No Tailwind, no styled-components in this template.",
    },
    ko: {
      what: "*.module.css라는 이름의 평범한 CSS 파일. 클래스 이름이 파일 안에서만 유효해서 다른 실험의 .box와 절대 안 겹친다. Next.js에 내장이라 추가 패키지가 없다.",
      use: "page.tsx에서 import styles from './page.module.css' 하고 className={styles.box}로 쓴다. 패턴은 그게 전부다. 이 템플릿에는 Tailwind도 styled-components도 없다.",
    },
    official: { label: "Next.js: CSS Modules", url: "https://nextjs.org/docs/app/getting-started/css#css-modules" },
    learn: [{ label: "CSS Modules (GitHub)", url: "https://github.com/css-modules/css-modules" }],
    related: [{ href: "/lecture-materials/w1#6-use-the-id412-workshop-template", en: "W1: Code structure", ko: "W1: 코드 구조" }],
  },
  pnpm: {
    name: "pnpm",
    en: {
      what: "A package manager: it downloads the libraries listed in package.json into node_modules and runs scripts. Same job as npm, but faster and it saves disk space by sharing packages between projects.",
      use: "Three commands cover the workshop: pnpm install (once after cloning), pnpm dev (start localhost:3000), pnpm add <package> (add a library). pnpm dev:mobile in W2.",
    },
    ko: {
      what: "패키지 매니저. package.json에 적힌 라이브러리를 node_modules에 내려받고 스크립트를 실행한다. npm과 같은 일을 하지만 더 빠르고, 프로젝트 간에 패키지를 공유해서 디스크를 아낀다.",
      use: "워크숍에서 쓰는 명령은 셋이다. pnpm install (클론 후 한 번), pnpm dev (localhost:3000 켜기), pnpm add <패키지> (라이브러리 추가). W2에서 pnpm dev:mobile.",
    },
    official: { label: "pnpm.io", url: "https://pnpm.io/" },
    learn: [{ label: "pnpm: Installation", url: "https://pnpm.io/installation" }],
    related: [{ href: "/lecture-materials/w1#4-package-manager", en: "W1: Package Manager", ko: "W1: 패키지 매니저" }],
  },
  git: {
    name: "Git",
    en: {
      what: "Version control. It records snapshots (commits) of your project so you can see what changed and go back. Works offline, on your machine.",
      use: "git diff shows what it changed, git restore throws it away, git commit saves a checkpoint you trust. ",
    },
    ko: {
      what: "버전 관리 도구. 프로젝트의 스냅샷(커밋)을 기록해서 무엇이 바뀌었는지 보고 되돌릴 수 있다. 네 컴퓨터 안에서, 오프라인으로 돈다.",
      use: "git diff로 뭘 바꿨는지 보고, git restore로 버리고, git commit으로 믿을 수 있는 체크포인트를 남긴다.",
    },
    official: { label: "git-scm.com", url: "https://git-scm.com/" },
    learn: [
      { label: "Git: the simple guide", url: "https://rogerdudler.github.io/git-guide/" },
      { label: "생활코딩 Git", url: "https://opentutorials.org/course/3837" },
    ],
    related: [
      { href: "/lecture-materials/w1#1-vs-code--claude-code-setup", en: "W1: Git as your checkpoint", ko: "W1: 체크포인트로서의 Git" },
      { href: "/lecture-materials/w1#12-deployment", en: "W1: Deployment", ko: "W1: 배포" },
    ],
  },
  github: {
    name: "GitHub",
    en: {
      what: "A website that hosts Git repositories. Your code lives there, Vercel reads it from there, and 'Use this template' is how you get your own copy of this repo.",
      use: "Use this template → your repository → git clone. git push sends your commits up. Vercel redeploys on every push.",
    },
    ko: {
      what: "Git 저장소를 올려두는 사이트. 네 코드가 거기 살고, Vercel이 거기서 읽어가고, 'Use this template'으로 이 레포의 네 사본을 만든다.",
      use: "Use this template → 네 레포 → git clone. git push로 커밋을 올린다. push할 때마다 Vercel이 다시 배포한다.",
    },
    official: { label: "github.com", url: "https://github.com/" },
    learn: [
      { label: "GitHub Student Developer Pack", url: "https://education.github.com/pack" },
      { label: "GitHub Docs: Hello World", url: "https://docs.github.com/en/get-started/start-your-journey/hello-world" },
    ],
    related: [{ href: "/lecture-materials/w1#6-use-the-id412-workshop-template", en: "W1: Use the ID412 Workshop Template", ko: "W1: 템플릿 사용" }],
  },
  vercel: {
    name: "Vercel",
    en: {
      what: "Hosting for Next.js (they make Next.js). Connect a GitHub repo, and every push becomes a live URL with HTTPS. Free for personal projects.",
      use: "Deploy your experiments so anyone can open them. Note: the socket relay does not run on Vercel. Multi-device work runs from your laptop.",
    },
    ko: {
      what: "Next.js 호스팅 (Next.js를 만든 회사). GitHub 레포를 연결하면 push할 때마다 HTTPS 주소로 바로 뜬다. 개인 프로젝트는 무료.",
      use: "실험을 배포해서 누구나 열 수 있게 한다. 단, 소켓 relay는 Vercel에서 안 돈다. 멀티디바이스 작업은 네 노트북에서 돌린다.",
    },
    official: { label: "vercel.com", url: "https://vercel.com/" },
    learn: [{ label: "Vercel: Deploying Next.js", url: "https://nextjs.org/docs/app/getting-started/deploying" }],
    related: [
      { href: "/lecture-materials/w1#12-deployment", en: "W1: Deployment", ko: "W1: 배포" },
      { href: "/lecture-materials/w2#3-socketio", en: "W2: Socket.io (deployment)", ko: "W2: Socket.io (배포)" },
    ],
  },
  vscode: {
    name: "VS Code",
    en: {
      what: "Visual Studio Code. A free code editor from Microsoft, the most used one. Files on the left, code in the middle, terminal at the bottom, extensions for everything else.",
      use: "Your editor. Open the project folder, open the terminal (Ctrl+` / Cmd+`), and run pnpm dev and claude from there. Install the Claude Code extension.",
    },
    ko: {
      what: "Microsoft의 무료 코드 에디터. 가장 많이 쓰인다. 왼쪽에 파일, 가운데 코드, 아래 터미널, 나머지는 확장으로.",
      use: "네 에디터. 프로젝트 폴더를 열고, 터미널을 열고(Ctrl+` / Cmd+`), 거기서 pnpm dev와 claude를 실행한다. Claude Code 확장을 설치해라.",
    },
    official: { label: "code.visualstudio.com", url: "https://code.visualstudio.com/" },
    learn: [{ label: "VS Code: Getting started", url: "https://code.visualstudio.com/docs/getstarted/getting-started" }],
    related: [{ href: "/lecture-materials/prelim#5-how-to-use-ai-agents", en: "Prelim: How to use AI Agents", ko: "Prelim: AI 에이전트 사용법" }],
  },
  cli: {
    name: "CLI",
    en: {
      what: "Command Line Interface. A program you use by typing commands in a terminal, instead of clicking in a window. You type a command, press Enter, it prints text back.",
      use: "Claude Code is a CLI: you type claude in the VS Code terminal and talk to it there. pnpm, git and node are CLIs too. Every command in these notes is typed into the terminal.",
    },
    ko: {
      what: "Command Line Interface. 창에서 클릭하는 대신 터미널에 명령어를 쳐서 쓰는 프로그램. 명령어를 치고 Enter를 누르면 글자로 답이 돌아온다.",
      use: "Claude Code가 CLI다. VS Code 터미널에 claude를 치고 거기서 대화한다. pnpm, git, node도 CLI다. 이 노트의 모든 명령어는 터미널에 치는 것이다.",
    },
    official: { label: "VS Code: Terminal basics", url: "https://code.visualstudio.com/docs/terminal/basics" },
    learn: [],
    related: [{ href: "/lecture-materials/w1#1-vs-code--claude-code-setup", en: "W1: VS Code + Claude Code setup", ko: "W1: VS Code + Claude Code 셋업" }],
  },
  claudeCode: {
    name: "Claude Code",
    en: {
      what: "Anthropic's coding agent. It runs in your terminal or VS Code, reads your project, edits files, runs commands, and checks its own work. You describe, it builds, you review.",
      use: "The main tool of this workshop. Type claude in the project folder. Use Opus 5.5. Review every diff with git before you trust it. AGENTS.md in the repo tells it the rules of this project.",
    },
    ko: {
      what: "Anthropic의 코딩 에이전트. 터미널이나 VS Code에서 돌면서 프로젝트를 읽고, 파일을 고치고, 명령을 실행하고, 자기 작업을 검증한다. 네가 설명하면 만들고, 네가 검토한다.",
      use: "이 워크숍의 핵심 도구. 프로젝트 폴더에서 claude를 입력한다. Opus 5.5를 쓴다. 믿기 전에 git으로 diff를 전부 본다. 레포의 AGENTS.md가 이 프로젝트의 규칙을 알려준다.",
    },
    official: { label: "code.claude.com/docs", url: "https://code.claude.com/docs/en/overview" },
    learn: [
      { label: "Claude Code: Quickstart", url: "https://code.claude.com/docs/en/quickstart" },
      { label: "Claude Code in VS Code", url: "https://code.claude.com/docs/en/vs-code" },
      { label: "Claude Academy: Claude Code 101", url: "https://academy.claude.com/courses/claude-code-101" },
    ],
    related: [
      { href: "/lecture-materials/prelim#5-how-to-use-ai-agents", en: "Prelim: How to use AI Agents", ko: "Prelim: AI 에이전트 사용법" },
      { href: "/lecture-materials/w1#1-vs-code--claude-code-setup", en: "W1: VS Code + Claude Code setup", ko: "W1: VS Code + Claude Code 셋업" },
    ],
  },
  canvas: {
    name: "Canvas",
    en: {
      what: "An HTML element you draw on with Javascript, pixel by pixel, every frame. Lines, circles, images, text. The basis of 2D creative coding (p5.js is a wrapper around it).",
      use: "W1 creative coding: a full-screen canvas, a requestAnimationFrame loop, mouse and time as parameters. In React: useRef to grab the canvas, useEffect to start the loop.",
    },
    ko: {
      what: "Javascript로 매 프레임 픽셀 단위로 그리는 HTML 요소. 선, 원, 이미지, 글자. 2D 크리에이티브 코딩의 기반이다(p5.js가 이걸 감싼 것).",
      use: "W1 크리에이티브 코딩: 화면 꽉 채운 캔버스, requestAnimationFrame 루프, 마우스와 시간을 파라미터로. React에서는 useRef로 캔버스를 잡고 useEffect에서 루프를 시작한다.",
    },
    official: { label: "MDN: Canvas API", url: "https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API" },
    learn: [
      { label: "MDN: Canvas tutorial", url: "https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial" },
      { label: "The Coding Train", url: "https://thecodingtrain.com/" },
    ],
    related: [{ href: "/lecture-materials/w1#9-canvas", en: "W1: Canvas", ko: "W1: Canvas" }],
  },
  glsl: {
    name: "GLSL",
    en: {
      what: "OpenGL Shading Language. A small C-like language that runs on the GPU, once per pixel (fragment shader) or per vertex (vertex shader), all in parallel. Per-pixel fields, noise, flow, post-processing.",
      use: "W1, through Three.js ShaderMaterial: a full-screen plane and a fragment shader that gets time and mouse as uniforms. Not for layout or UI.",
    },
    ko: {
      what: "GPU에서 도는 작은 C 계열 언어. 픽셀마다(프래그먼트 셰이더) 또는 정점마다(버텍스 셰이더) 전부 병렬로 실행된다. 픽셀 단위 필드, 노이즈, 흐름, 후처리.",
      use: "W1에서 Three.js ShaderMaterial로: 화면 꽉 채운 평면 하나와 time·mouse를 uniform으로 받는 프래그먼트 셰이더. 레이아웃이나 UI용이 아니다.",
    },
    official: { label: "Three.js: ShaderMaterial", url: "https://threejs.org/docs/#api/en/materials/ShaderMaterial" },
    learn: [
      { label: "The Book of Shaders", url: "https://thebookofshaders.com/" },
      { label: "Shadertoy", url: "https://www.shadertoy.com/" },
    ],
    related: [{ href: "/lecture-materials/w1#10-glsl", en: "W1: GLSL", ko: "W1: GLSL" }],
  },
  threejs: {
    name: "Three.js",
    en: {
      what: "The Javascript 3D library. Scenes, cameras, lights, meshes, materials, rendered with WebGL in the browser. React Three Fiber (R3F) lets you write it as React components, Drei adds helpers.",
      use: "W1: a Canvas from @react-three/fiber, a mesh, lights, OrbitControls from drei, useFrame for animation. The template already has three, @react-three/fiber and @react-three/drei installed.",
    },
    ko: {
      what: "Javascript 3D 라이브러리. 씬, 카메라, 조명, 메시, 머티리얼을 브라우저에서 WebGL로 렌더링한다. React Three Fiber(R3F)로 React 컴포넌트처럼 쓰고, Drei가 유틸을 더한다.",
      use: "W1: @react-three/fiber의 Canvas, 메시, 조명, drei의 OrbitControls, 애니메이션은 useFrame. three, @react-three/fiber, @react-three/drei는 템플릿에 이미 설치돼 있다.",
    },
    official: { label: "threejs.org", url: "https://threejs.org/" },
    learn: [
      { label: "React Three Fiber docs", url: "https://r3f.docs.pmnd.rs/getting-started/introduction" },
      { label: "Wawa Sensei (YouTube)", url: "https://www.youtube.com/watch?v=pXpckHDDNYo&list=PLpepLKamtPjiUF6PvVUbIFhx9HaS0qJs_" },
      { label: "Three.js Journey (paid)", url: "https://threejs-journey.com/" },
    ],
    related: [{ href: "/lecture-materials/w1#11-threejs", en: "W1: Three.js", ko: "W1: Three.js" }],
  },
  socketio: {
    name: "Socket.io",
    en: {
      what: "A library for real-time, two-way messaging between browsers and a server, built on WebSocket. Reconnects automatically. One device sends, the server forwards, the other devices receive, within milliseconds.",
      use: "W2: socket-server.mjs is the relay (one file, port 4000). hooks/shared/useSocket.ts gives you send(type, data) and onMessage. Phone page and screen page join the same room.",
    },
    ko: {
      what: "브라우저와 서버 사이의 실시간 양방향 메시징 라이브러리. WebSocket 위에 만들어졌고 자동으로 재접속한다. 한 기기가 보내면 서버가 전달하고 다른 기기가 받는다. 밀리초 안에.",
      use: "W2: socket-server.mjs가 relay(파일 하나, 4000 포트). hooks/shared/useSocket.ts가 send(type, data)와 onMessage를 준다. 폰 페이지와 스크린 페이지가 같은 room에 들어간다.",
    },
    official: { label: "socket.io", url: "https://socket.io/" },
    learn: [{ label: "Socket.io: Get started", url: "https://socket.io/get-started/chat" }],
    related: [{ href: "/lecture-materials/w2#3-socketio", en: "W2: Socket.io", ko: "W2: Socket.io" }],
  },
  tonejs: {
    name: "Tone.js",
    en: {
      what: "A Javascript library for making sound in the browser, on top of the Web Audio API. Synths, samplers, effects, a transport for timing. Written for musicians.",
      use: "W3: sound is mandatory in the final. A synth on tap, mobile parameters driving sound on the screen, microphone volume as an input. Audio can only start after a user tap.",
    },
    ko: {
      what: "브라우저에서 소리를 만드는 Javascript 라이브러리. Web Audio API 위에 있다. 신스, 샘플러, 이펙트, 타이밍용 트랜스포트. 음악가를 위해 만들어졌다.",
      use: "W3: 기말에 사운드는 필수다. 탭하면 나는 신스, 폰 파라미터로 스크린의 소리 제어, 마이크 볼륨을 입력으로. 오디오는 사용자가 탭한 뒤에만 시작할 수 있다.",
    },
    official: { label: "tonejs.github.io", url: "https://tonejs.github.io/" },
    learn: [
      { label: "Tone.js: Examples", url: "https://tonejs.github.io/examples/" },
      { label: "MDN: Web Audio API", url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API" },
    ],
    related: [{ href: "/lecture-materials/w3#3-sound-tonejs", en: "W3: Sound: Tone.js", ko: "W3: 사운드: Tone.js" }],
  },
  unreal: {
    name: "Unreal",
    en: {
      what: "Unreal Engine, Epic's real-time 3D engine. Used for games, virtual production and installations. You already use it in the midterm.",
      use: "W3: a separate repo shows phone → WebSocket → Node relay → UDP → Unreal. Not walked through in class. Read it if your final combines Unreal and web.",
    },
    ko: {
      what: "Epic의 실시간 3D 엔진. 게임, 버추얼 프로덕션, 설치 작업에 쓰인다. 중간 프로젝트에서 이미 쓰고 있다.",
      use: "W3: 별도 레포가 폰 → WebSocket → Node relay → UDP → Unreal 경로를 보여준다. 수업에서 단계별로 다루지는 않는다. 기말이 Unreal + 웹이면 읽어라.",
    },
    official: { label: "unrealengine.com", url: "https://www.unrealengine.com/" },
    learn: [{ label: "mobile-to-unreal-realtime-backbone", url: "https://github.com/jeanyoon-choi/mobile-to-unreal-realtime-backbone" }],
    related: [{ href: "/lecture-materials/w3#4-unreal", en: "W3: Unreal", ko: "W3: Unreal" }],
  },
  api: {
    name: "API",
    en: {
      what: "Application Programming Interface. A way for one program to ask another for something over HTTP: send a request, get data back. Weather, maps, LLMs, image generation are all APIs.",
      use: "W3: an LLM API (OpenAI or Anthropic) called from a Next.js Route Handler (app/api/<name>/route.ts), so your key stays on the server. The page calls fetch('/api/<name>').",
    },
    ko: {
      what: "프로그램이 다른 프로그램에게 HTTP로 뭔가를 요청하고 데이터를 받는 방식. 날씨, 지도, LLM, 이미지 생성이 전부 API다.",
      use: "W3: LLM API(OpenAI 또는 Anthropic)를 Next.js Route Handler(app/api/<이름>/route.ts)에서 호출한다. 키는 서버에 남는다. 페이지는 fetch('/api/<이름>')를 부른다.",
    },
    official: { label: "MDN: Fetch API", url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API" },
    learn: [
      { label: "Next.js: Route Handlers", url: "https://nextjs.org/docs/app/building-your-application/routing/route-handlers" },
      { label: "Claude API docs", url: "https://platform.claude.com/docs" },
      { label: "OpenAI API docs", url: "https://platform.openai.com/docs/overview" },
    ],
    related: [{ href: "/lecture-materials/w3#1-api-introduction", en: "W3: API: Introduction", ko: "W3: API 소개" }],
  },
  appRouter: {
    name: "App Router",
    en: {
      what: "The current way of structuring a Next.js app: everything under app/, a folder per URL, page.tsx for the page, layout.tsx for the frame around it, route.ts for server endpoints. Components are Server Components unless you write \"use client\".",
      use: "This repo is App Router. When a tutorial or an agent gives you pages/ code or getServerSideProps, it is the old Pages Router. Say 'App Router' in your prompt.",
    },
    ko: {
      what: "Next.js 앱을 구성하는 현재 방식. 전부 app/ 아래, 폴더 하나가 URL 하나, page.tsx가 페이지, layout.tsx가 그 바깥 틀, route.ts가 서버 엔드포인트. \"use client\"를 쓰지 않으면 Server Component다.",
      use: "이 레포는 App Router다. 튜토리얼이나 에이전트가 pages/나 getServerSideProps를 주면 옛 Pages Router다. 프롬프트에 'App Router'라고 써라.",
    },
    official: { label: "Next.js: App Router", url: "https://nextjs.org/docs/app" },
    learn: [{ label: "Next.js: Project structure", url: "https://nextjs.org/docs/app/getting-started/project-structure" }],
    related: [{ href: "/lecture-materials/w1#3-what-is-nextjs", en: "W1: What is Next.js?", ko: "W1: Next.js란?" }],
  },
  localhost: {
    name: "localhost",
    en: {
      what: "The address of your own computer. localhost:3000 is the dev server running on your machine, port 3000. Nobody else can open it. It counts as a secure context, so camera and sensors work without HTTPS.",
      use: "pnpm dev → http://localhost:3000. Your phone cannot reach localhost (it would be the phone itself); for the phone you use the laptop's LAN IP and pnpm dev:mobile (W2).",
    },
    ko: {
      what: "네 컴퓨터 자신의 주소. localhost:3000은 네 컴퓨터에서 3000번 포트로 도는 개발 서버다. 다른 사람은 못 연다. 보안 컨텍스트로 쳐주기 때문에 HTTPS 없이도 카메라와 센서가 된다.",
      use: "pnpm dev → http://localhost:3000. 폰에서는 localhost가 안 된다(폰 자신을 가리키니까). 폰은 노트북의 LAN IP와 pnpm dev:mobile로 (W2).",
    },
    official: { label: "MDN: Secure contexts", url: "https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts" },
    learn: [],
    related: [{ href: "/lecture-materials/w2#4-debugging--qa", en: "W2: Debugging & QA (A1, A3)", ko: "W2: 디버깅 (A1, A3)" }],
  },
  harness: {
    name: "harness",
    en: {
      what: "Everything around the model that makes an agent reliable on one project: the rules it reads first (AGENTS.md), the guides it is sent to, the files it must write (a README per experiment), the checks it must pass (typecheck, build, open the page) and the checkpoints it saves (git). The model is rented; the harness is yours.",
      use: "This template is a harness. AGENTS.md at the root, docs/<area>/README.md per area, README.md per experiment, typecheck before 'done', commit when it works. When the agent repeats a mistake, add a rule here instead of re-prompting.",
    },
    ko: {
      what: "한 프로젝트에서 에이전트를 믿을 수 있게 만드는, 모델 주변의 모든 것: 처음 읽는 규칙(AGENTS.md), 안내받는 가이드, 써야 하는 파일(실험마다 README), 통과해야 하는 검사(타입체크, 빌드, 페이지 열기), 저장하는 체크포인트(git). 모델은 빌려 쓰는 것, 하네스는 네 것.",
      use: "이 템플릿이 하네스다. 루트의 AGENTS.md, 영역별 docs/<area>/README.md, 실험별 README.md, '다 됐다' 전에 타입체크, 되면 커밋. 에이전트가 같은 실수를 반복하면 다시 프롬프트하지 말고 여기에 규칙을 추가해라.",
    },
    official: { label: "agents.md", url: "https://agents.md/" },
    learn: [{ label: "Claude Code: Memory (CLAUDE.md / AGENTS.md)", url: "https://code.claude.com/docs/en/memory" }],
    related: [{ href: "/lecture-materials/w1#1-vs-code--claude-code-setup", en: "W1: Harness Engineering", ko: "W1: 하네스 엔지니어링" }],
  },
  agentsMd: {
    name: "AGENTS.md",
    en: {
      what: "A markdown file at the root of a repo that a coding agent reads at the start of every session. Rules, structure, conventions, what not to touch. Claude Code reads AGENTS.md (or CLAUDE.md).",
      use: "This repo ships one. It tells the agent how the folders are organised and what the rules are. You can add your own rules to it. Next.js also appends its own block to it.",
    },
    ko: {
      what: "레포 루트에 두는 마크다운 파일. 코딩 에이전트가 매 세션 시작 때 읽는다. 규칙, 구조, 관례, 건드리면 안 되는 것. Claude Code는 AGENTS.md(또는 CLAUDE.md)를 읽는다.",
      use: "이 레포에 하나 들어 있다. 폴더가 어떻게 돼 있고 규칙이 뭔지 에이전트에게 알려준다. 네 규칙을 추가해도 된다. Next.js도 자기 블록을 거기에 덧붙인다.",
    },
    official: { label: "Claude Code: Memory (CLAUDE.md / AGENTS.md)", url: "https://code.claude.com/docs/en/memory" },
    learn: [{ label: "agents.md", url: "https://agents.md/" }],
    related: [{ href: "/lecture-materials/w1#1-vs-code--claude-code-setup", en: "W1: Harness", ko: "W1: 하네스" }],
  },
  r3f: {
    name: "React Three Fiber",
    en: {
      what: "A React renderer for Three.js. Instead of calling new THREE.Mesh() you write <mesh>, <boxGeometry />, <meshStandardMaterial /> as JSX, and React manages the scene. Drei is its box of helpers (OrbitControls, Text, Environment...).",
      use: "How we write Three.js in W1. <Canvas> from @react-three/fiber, useFrame for animation, OrbitControls from @react-three/drei. Already installed.",
    },
    ko: {
      what: "Three.js용 React 렌더러. new THREE.Mesh() 대신 <mesh>, <boxGeometry />, <meshStandardMaterial />을 JSX로 쓰고, 씬은 React가 관리한다. Drei는 그 위의 유틸 모음(OrbitControls, Text, Environment…).",
      use: "W1에서 Three.js를 쓰는 방식. @react-three/fiber의 <Canvas>, 애니메이션은 useFrame, OrbitControls는 @react-three/drei. 이미 설치돼 있다.",
    },
    official: { label: "r3f.docs.pmnd.rs", url: "https://r3f.docs.pmnd.rs/getting-started/introduction" },
    learn: [
      { label: "R3F: Examples", url: "https://r3f.docs.pmnd.rs/getting-started/examples" },
      { label: "Drei (GitHub)", url: "https://github.com/pmndrs/drei" },
    ],
    related: [{ href: "/lecture-materials/w1#11-threejs", en: "W1: Three.js", ko: "W1: Three.js" }],
  },
  websocket: {
    name: "WebSocket",
    en: {
      what: "A browser protocol for a persistent, two-way connection to a server. Unlike HTTP (ask, answer, done), a WebSocket stays open and either side can send at any time. That is what makes real-time possible.",
      use: "Under Socket.io. You don't touch raw WebSocket in this workshop, but Unreal and TouchDesigner speak it directly, which is how W3's Unreal bridge works.",
    },
    ko: {
      what: "서버와 끊기지 않는 양방향 연결을 만드는 브라우저 프로토콜. HTTP(묻고, 답하고, 끝)와 달리 연결이 열린 채로 있고 양쪽 다 아무 때나 보낼 수 있다. 실시간이 가능한 이유.",
      use: "Socket.io 아래에 있다. 이 워크숍에서 raw WebSocket을 직접 만지지는 않지만, Unreal과 TouchDesigner는 이걸 직접 말한다. W3의 Unreal 브릿지가 그렇게 돈다.",
    },
    official: { label: "MDN: WebSocket API", url: "https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API" },
    learn: [],
    related: [{ href: "/lecture-materials/w2#3-socketio", en: "W2: Socket.io", ko: "W2: Socket.io" }],
  },
  https: {
    name: "HTTPS",
    en: {
      what: "HTTP over an encrypted connection, proven by a certificate. Browsers only allow sensitive APIs (camera, microphone, motion sensors) on HTTPS, or on localhost.",
      use: "pnpm dev:mobile serves your site over HTTPS with a self-signed certificate, so your phone can use its sensors. The phone will warn you; pass the warning on port 3000 and 4000. Vercel gives you real HTTPS for free.",
    },
    ko: {
      what: "인증서로 증명되는 암호화 연결 위의 HTTP. 브라우저는 민감한 API(카메라, 마이크, 모션 센서)를 HTTPS나 localhost에서만 허용한다.",
      use: "pnpm dev:mobile은 자체 서명 인증서로 사이트를 HTTPS로 띄워서 폰이 센서를 쓸 수 있게 한다. 폰에 경고가 뜨는데, 3000과 4000 포트 둘 다 통과시켜라. Vercel은 진짜 HTTPS를 공짜로 준다.",
    },
    official: { label: "MDN: HTTPS", url: "https://developer.mozilla.org/en-US/docs/Glossary/HTTPS" },
    learn: [{ label: "Next.js: next dev --experimental-https", url: "https://nextjs.org/docs/app/api-reference/cli/next#using-https-during-development" }],
    related: [{ href: "/lecture-materials/w2#4-debugging--qa", en: "W2: A3. HTTPS for Local Dev", ko: "W2: A3. 로컬 HTTPS" }],
  },
  routeHandler: {
    name: "Route Handler",
    en: {
      what: "A server endpoint inside a Next.js app: app/api/<name>/route.ts exporting GET or POST functions. It runs on the server (Node), never in the browser, so it can hold secrets and call other APIs.",
      use: "W3: your LLM call lives here. The page does fetch('/api/<name>', { method: 'POST', body }) and the handler calls OpenAI/Anthropic with the key from .env.local. Deploys to Vercel as a serverless function.",
    },
    ko: {
      what: "Next.js 앱 안의 서버 엔드포인트. app/api/<이름>/route.ts에서 GET이나 POST 함수를 export한다. 서버(Node)에서만 돌고 브라우저에서는 안 돌기 때문에 비밀 키를 들고 다른 API를 부를 수 있다.",
      use: "W3: LLM 호출이 여기 산다. 페이지는 fetch('/api/<이름>', { method: 'POST', body })를 부르고, 핸들러는 .env.local의 키로 OpenAI/Anthropic을 부른다. Vercel에서는 서버리스 함수로 배포된다.",
    },
    official: { label: "Next.js: Route Handlers", url: "https://nextjs.org/docs/app/building-your-application/routing/route-handlers" },
    learn: [],
    related: [{ href: "/lecture-materials/w3#1-api-introduction", en: "W3: API: Introduction", ko: "W3: API 소개" }],
  },
  env: {
    name: ".env.local",
    en: {
      what: "A file of KEY=value lines that Next.js loads as environment variables on the server. Git ignores it (.env* is in .gitignore). Anything prefixed NEXT_PUBLIC_ is also sent to the browser; everything else stays on the server.",
      use: "W3: OPENAI_API_KEY=... or ANTHROPIC_API_KEY=... goes here, read in a Route Handler with process.env. Never commit it, never prefix a key with NEXT_PUBLIC_. On Vercel, add the same variable in the project settings.",
    },
    ko: {
      what: "KEY=value 줄로 된 파일. Next.js가 서버의 환경변수로 읽는다. Git은 무시한다(.gitignore에 .env*). NEXT_PUBLIC_ 접두사가 붙은 것만 브라우저에도 전달되고, 나머지는 서버에만 남는다.",
      use: "W3: OPENAI_API_KEY=... 또는 ANTHROPIC_API_KEY=...를 여기 적고 Route Handler에서 process.env로 읽는다. 절대 커밋하지 말고, 키에 NEXT_PUBLIC_을 붙이지 마라. Vercel에서는 프로젝트 설정에 같은 변수를 넣는다.",
    },
    official: { label: "Next.js: Environment variables", url: "https://nextjs.org/docs/app/guides/environment-variables" },
    learn: [],
    related: [{ href: "/lecture-materials/w3#2-llm-api", en: "W3: LLM API", ko: "W3: LLM API" }],
  },
  webAudio: {
    name: "Web Audio API",
    en: {
      what: "The browser's built-in audio engine. A graph of nodes: oscillators and samples in, gain and effects in the middle, speakers out. Also analysis: volume and frequency of the microphone.",
      use: "Tone.js sits on top of it. You will meet it directly when you analyse the microphone (AnalyserNode) or need something Tone doesn't wrap. Starts only after a user tap.",
    },
    ko: {
      what: "브라우저 내장 오디오 엔진. 노드 그래프다. 오실레이터와 샘플이 들어가고, 게인과 이펙트를 거쳐, 스피커로 나간다. 분석도 한다. 마이크의 볼륨과 주파수.",
      use: "Tone.js가 그 위에 있다. 마이크를 분석하거나(AnalyserNode) Tone이 감싸지 않은 게 필요할 때 직접 만나게 된다. 사용자가 탭한 뒤에만 시작된다.",
    },
    official: { label: "MDN: Web Audio API", url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API" },
    learn: [{ label: "MDN: Using the Web Audio API", url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API" }],
    related: [{ href: "/lecture-materials/w3#3-sound-tonejs", en: "W3: Sound: Tone.js", ko: "W3: 사운드: Tone.js" }],
  },
  ssr: {
    name: "SSR",
    en: {
      what: "Server-Side Rendering. The server runs your React components and sends finished HTML; the browser shows it immediately, then Javascript attaches the interactivity (hydration). The opposite is CSR, where the browser gets an empty page and builds everything itself.",
      use: "Next.js does SSR (and static pre-rendering) by default. For a full-screen canvas artwork it hardly matters, but it is why some code needs \"use client\" and why window is undefined during the server pass.",
    },
    ko: {
      what: "서버 사이드 렌더링. 서버가 React 컴포넌트를 실행해 완성된 HTML을 보내고, 브라우저는 바로 보여준 뒤 Javascript가 인터랙션을 붙인다(hydration). 반대는 CSR, 브라우저가 빈 페이지를 받아 직접 다 만드는 방식.",
      use: "Next.js는 기본이 SSR(과 정적 프리렌더링)이다. 화면 꽉 채운 캔버스 작품에는 별 상관없지만, 어떤 코드엔 \"use client\"가 필요하고 서버 단계에선 window가 undefined인 이유가 이것이다.",
    },
    official: { label: "Next.js: Server and Client Components", url: "https://nextjs.org/docs/app/getting-started/server-and-client-components" },
    learn: [
      { label: "MDN: SSR", url: "https://developer.mozilla.org/en-US/docs/Glossary/SSR" },
      { label: "React: hydrateRoot", url: "https://react.dev/reference/react-dom/client/hydrateRoot" },
    ],
    related: [{ href: "/lecture-materials/w1#3-what-is-nextjs", en: "W1: What is Next.js?", ko: "W1: Next.js란?" }],
  },
  seo: {
    name: "SEO",
    en: {
      what: "Search Engine Optimisation: making a page understandable and rankable by Google. Needs real HTML (not an empty CSR shell), titles, descriptions, fast loading. One of the main reasons Next.js and SSR exist.",
      use: "Not a goal for an artwork. But metadata (title, description, preview image) is set in layout.tsx / page.tsx with the Next.js Metadata API, and you want at least a title when you share a link.",
    },
    ko: {
      what: "검색엔진 최적화. Google이 페이지를 이해하고 순위를 매길 수 있게 만드는 것. 진짜 HTML(빈 CSR 껍데기가 아닌), 제목, 설명, 빠른 로딩이 필요하다. Next.js와 SSR이 존재하는 주요 이유 중 하나.",
      use: "작품의 목표는 아니다. 하지만 메타데이터(제목, 설명, 미리보기 이미지)는 layout.tsx / page.tsx에서 Next.js Metadata API로 정하고, 링크를 공유할 때 최소한 제목은 있어야 한다.",
    },
    official: { label: "Next.js: Metadata", url: "https://nextjs.org/docs/app/getting-started/metadata-and-og-images" },
    learn: [{ label: "Google: SEO Starter Guide", url: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide" }],
    related: [{ href: "/lecture-materials/w1#3-what-is-nextjs", en: "W1: What is Next.js?", ko: "W1: Next.js란?" }],
  },
  packageManager: {
    name: "Package Manager",
    en: {
      what: "The tool that installs other people's code (packages) into your project and runs your scripts. It reads package.json, downloads what is listed into node_modules, and records exact versions in a lockfile so everyone gets the same thing.",
      use: "pnpm here. pnpm install after cloning, pnpm add <package> to add a library, pnpm dev to start. The lockfile (pnpm-lock.yaml) is committed; node_modules is not.",
    },
    ko: {
      what: "남의 코드(패키지)를 프로젝트에 설치하고 스크립트를 실행하는 도구. package.json을 읽고, 적힌 것을 node_modules에 내려받고, 정확한 버전을 lockfile에 기록해서 모두가 같은 것을 받게 한다.",
      use: "여기서는 pnpm. 클론 후 pnpm install, 라이브러리 추가는 pnpm add <패키지>, 시작은 pnpm dev. lockfile(pnpm-lock.yaml)은 커밋하고 node_modules는 안 한다.",
    },
    official: { label: "npm docs: About packages", url: "https://docs.npmjs.com/about-packages-and-modules" },
    learn: [{ label: "pnpm vs npm vs yarn", url: "https://pnpm.io/motivation" }],
    related: [{ href: "/lecture-materials/w1#4-package-manager", en: "W1: Package Manager", ko: "W1: 패키지 매니저" }],
  },
  npm: {
    name: "npm",
    en: {
      what: "The default package manager that ships with Node.js, and the name of the public registry (npmjs.com) where almost every Javascript library lives. pnpm and yarn install from the same registry.",
      use: "You use the registry every time you pnpm add something. You use the npm command once: npm install --global pnpm.",
    },
    ko: {
      what: "Node.js에 기본으로 딸려오는 패키지 매니저이자, 거의 모든 Javascript 라이브러리가 사는 공개 레지스트리(npmjs.com)의 이름. pnpm과 yarn도 같은 레지스트리에서 설치한다.",
      use: "pnpm add를 할 때마다 레지스트리를 쓰는 셈이다. npm 명령은 딱 한 번 쓴다: npm install --global pnpm.",
    },
    official: { label: "npmjs.com", url: "https://www.npmjs.com/" },
    learn: [{ label: "npm docs", url: "https://docs.npmjs.com/" }],
    related: [{ href: "/lecture-materials/w1#4-package-manager", en: "W1: Package Manager", ko: "W1: 패키지 매니저" }],
  },
  yarn: {
    name: "yarn",
    en: {
      what: "Another package manager, made by Facebook in 2016 when npm was slow. The 2024 and 2025 editions of this workshop used it. Same job as pnpm.",
      use: "Not used here. If an older tutorial says yarn add, read pnpm add; yarn dev is pnpm dev.",
    },
    ko: {
      what: "또 다른 패키지 매니저. 2016년 npm이 느릴 때 Facebook이 만들었다. 이 워크숍의 2024, 2025년판이 썼다. pnpm과 같은 일을 한다.",
      use: "여기서는 안 쓴다. 옛 튜토리얼에 yarn add라고 있으면 pnpm add로, yarn dev는 pnpm dev로 읽어라.",
    },
    official: { label: "yarnpkg.com", url: "https://yarnpkg.com/" },
    learn: [],
    related: [{ href: "/lecture-materials/w1#4-package-manager", en: "W1: Package Manager", ko: "W1: 패키지 매니저" }],
  },
  drei: {
    name: "React-Three Drei",
    en: {
      what: "A box of ready-made helpers for React Three Fiber: OrbitControls, Text, Environment, Html, Float, shaderMaterial and dozens more. Things you would otherwise write yourself for every scene.",
      use: "W1: <OrbitControls /> to look around, <Environment /> for lighting, <Text /> for typography in 3D. Installed as @react-three/drei.",
    },
    ko: {
      what: "React Three Fiber용 기성 헬퍼 모음. OrbitControls, Text, Environment, Html, Float, shaderMaterial 등 수십 개. 안 그러면 씬마다 직접 써야 할 것들.",
      use: "W1: 둘러보기는 <OrbitControls />, 조명은 <Environment />, 3D 타이포는 <Text />. @react-three/drei로 설치돼 있다.",
    },
    official: { label: "drei (GitHub)", url: "https://github.com/pmndrs/drei" },
    learn: [{ label: "drei docs", url: "https://drei.docs.pmnd.rs/" }],
    related: [{ href: "/lecture-materials/w1#11-threejs", en: "W1: Three.js", ko: "W1: Three.js" }],
  },
  postprocessing: {
    name: "React-Three Postprocessing",
    en: {
      what: "Effects applied to the whole rendered frame after the scene is drawn: bloom, depth of field, noise, glitch, colour grading. One <EffectComposer> with effects inside.",
      use: "Optional in W1. The quickest way to make a plain scene look finished. Costs GPU; add one effect, check the frame rate.",
    },
    ko: {
      what: "씬을 다 그린 뒤 프레임 전체에 거는 효과: 블룸, 피사계 심도, 노이즈, 글리치, 컬러 그레이딩. <EffectComposer> 하나 안에 효과들을 넣는다.",
      use: "W1에서는 선택. 밋밋한 씬을 가장 빨리 완성된 것처럼 보이게 하는 방법. GPU를 먹으니 하나 넣고 프레임레이트를 확인해라.",
    },
    official: { label: "react-postprocessing (GitHub)", url: "https://github.com/pmndrs/react-postprocessing" },
    learn: [{ label: "postprocessing docs", url: "https://react-postprocessing.docs.pmnd.rs/" }],
    related: [{ href: "/lecture-materials/w1#11-threejs", en: "W1: Three.js", ko: "W1: Three.js" }],
  },
  rapier: {
    name: "React-Three Rapier",
    en: {
      what: "Physics for React Three Fiber: gravity, collisions, rigid bodies, joints. Wrap the scene in <Physics>, give meshes a <RigidBody>, and they fall and bounce.",
      use: "Not covered in class. Reach for it when things should fall, pile up or collide with the phone's tilt as gravity (W2).",
    },
    ko: {
      what: "React Three Fiber용 물리: 중력, 충돌, 강체, 관절. 씬을 <Physics>로 감싸고 메시에 <RigidBody>를 주면 떨어지고 튕긴다.",
      use: "수업에서는 안 다룬다. 물건이 떨어지거나 쌓이거나, 폰 기울임을 중력으로 쓰고 싶을 때(W2) 꺼내라.",
    },
    official: { label: "react-three-rapier (GitHub)", url: "https://github.com/pmndrs/react-three-rapier" },
    learn: [{ label: "Rapier docs", url: "https://rapier.rs/" }],
    related: [{ href: "/lecture-materials/w1#11-threejs", en: "W1: Three.js", ko: "W1: Three.js" }],
  },
  reactSpring: {
    name: "React Spring",
    en: {
      what: "A spring-physics animation library for React. Values move towards a target with mass, tension and friction instead of a fixed duration, so motion feels physical. Works with R3F through @react-spring/three.",
      use: "Optional. For easing a parameter (scale, position, colour) towards its new value when an input changes, instead of jumping.",
    },
    ko: {
      what: "React용 스프링 물리 애니메이션 라이브러리. 고정된 시간 대신 질량·장력·마찰로 목표값에 다가가서 움직임이 물리적으로 느껴진다. @react-spring/three로 R3F와 같이 쓴다.",
      use: "선택. 입력이 바뀔 때 파라미터(크기, 위치, 색)가 툭 바뀌지 않고 부드럽게 따라가게 할 때.",
    },
    official: { label: "react-spring.dev", url: "https://www.react-spring.dev/" },
    learn: [{ label: "React Spring: Getting started", url: "https://www.react-spring.dev/docs/getting-started" }],
    related: [{ href: "/lecture-materials/w1#11-threejs", en: "W1: Three.js", ko: "W1: Three.js" }],
  },
  shaderMaterial: {
    name: "ShaderMaterial",
    en: {
      what: "A Three.js material whose vertex and fragment shaders you write yourself in GLSL, with uniforms you pass in from Javascript. Everything else in Three.js is built on the same mechanism, just hidden.",
      use: "W1 GLSL: a full-screen plane with a ShaderMaterial and uniforms for time, mouse and resolution. The shader strings live in a .ts file next to page.tsx.",
    },
    ko: {
      what: "버텍스/프래그먼트 셰이더를 GLSL로 직접 쓰는 Three.js 머티리얼. Javascript에서 uniform을 넘긴다. Three.js의 다른 머티리얼도 전부 같은 원리 위에 있는데 숨겨져 있을 뿐이다.",
      use: "W1 GLSL: 화면 꽉 채운 평면 하나에 ShaderMaterial, uniform은 time·mouse·resolution. 셰이더 문자열은 page.tsx 옆 .ts 파일에.",
    },
    official: { label: "Three.js: ShaderMaterial", url: "https://threejs.org/docs/#api/en/materials/ShaderMaterial" },
    learn: [{ label: "The Book of Shaders", url: "https://thebookofshaders.com/" }],
    related: [{ href: "/lecture-materials/w1#10-glsl", en: "W1: GLSL", ko: "W1: GLSL" }],
  },
  uniforms: {
    name: "uniforms",
    en: {
      what: "Values that are the same for every pixel in one frame and come from the outside: time, mouse position, resolution, a colour, a texture. Javascript sets them each frame; the shader reads them.",
      use: "The bridge between your inputs and the GPU. Mouse → uniform → shader is how W1 GLSL experiments react; in W2 a phone's tilt arrives through the socket and lands in a uniform the same way.",
    },
    ko: {
      what: "한 프레임 안의 모든 픽셀에 같은 값으로 들어가는, 바깥에서 오는 값: 시간, 마우스 위치, 해상도, 색, 텍스처. Javascript가 매 프레임 정하고 셰이더가 읽는다.",
      use: "네 입력과 GPU 사이의 다리. 마우스 → uniform → 셰이더가 W1 GLSL 실험이 반응하는 방식이고, W2에서는 폰의 기울임이 소켓으로 와서 똑같이 uniform에 들어간다.",
    },
    official: { label: "Three.js: Uniform", url: "https://threejs.org/docs/#api/en/core/Uniform" },
    learn: [{ label: "The Book of Shaders: Uniforms", url: "https://thebookofshaders.com/03/" }],
    related: [{ href: "/lecture-materials/w1#10-glsl", en: "W1: GLSL", ko: "W1: GLSL" }],
  },
  nodejs: {
    name: "Node.js",
    en: {
      what: "Javascript running outside the browser, on your computer. Node reads files, opens network ports and runs the tools of the web stack. Without it there is no dev server, no package manager, no build.",
      use: "pnpm dev, the build, the socket relay (socket-server.mjs) and Claude Code all run on Node. Install the LTS version once (Prelim Tutorial HW).",
    },
    ko: {
      what: "브라우저 밖, 네 컴퓨터에서 도는 Javascript. 파일을 읽고, 네트워크 포트를 열고, 웹 스택의 도구들을 돌린다. 이게 없으면 개발 서버도, 패키지 매니저도, 빌드도 없다.",
      use: "pnpm dev, 빌드, 소켓 relay(socket-server.mjs), Claude Code 전부 Node 위에서 돈다. LTS 버전을 한 번 설치하면 된다 (Prelim 튜토리얼 과제).",
    },
    official: { label: "nodejs.org", url: "https://nodejs.org/" },
    learn: [],
    related: [{ href: "/lecture-materials/w1#4-package-manager", en: "W1: Package Manager", ko: "W1: 패키지 매니저" }],
  },
  npmRegistry: {
    name: "npm registry",
    en: {
      what: "The public store of Javascript packages. react, next, three, socket.io: every library you install comes from here. npm, pnpm and yarn are different clients for the same registry.",
      use: "pnpm add <package> downloads from the registry into node_modules and records the version in package.json.",
    },
    ko: {
      what: "Javascript 패키지의 공개 저장소. react, next, three, socket.io 등 네가 설치하는 모든 라이브러리가 여기서 온다. npm, pnpm, yarn은 같은 레지스트리를 쓰는 다른 클라이언트다.",
      use: "pnpm add <패키지>가 레지스트리에서 node_modules로 받고, 버전을 package.json에 적는다.",
    },
    official: { label: "npmjs.com", url: "https://www.npmjs.com/" },
    learn: [],
  },
  vue: {
    name: "Vue",
    en: {
      what: "A UI framework, same job as React: components, state → view. Templates look closer to HTML than JSX does.",
      use: "Not used here. If a tutorial says Vue or Nuxt, it is the other family; the ideas transfer, the code does not.",
    },
    ko: {
      what: "React와 같은 일을 하는 UI 프레임워크: 컴포넌트, 상태 → 화면. 템플릿이 JSX보다 HTML에 가깝게 생겼다.",
      use: "여기서는 안 쓴다. 튜토리얼이 Vue나 Nuxt를 말하면 다른 계열이다. 개념은 옮겨오되 코드는 못 옮긴다.",
    },
    official: { label: "vuejs.org", url: "https://vuejs.org/" },
    learn: [],
  },
  svelte: {
    name: "Svelte",
    en: {
      what: "A UI framework that compiles components to plain Javascript at build time, so there is no framework running in the browser.",
      use: "Not used here. Its meta-framework is SvelteKit.",
    },
    ko: {
      what: "컴포넌트를 빌드 시점에 평범한 Javascript로 컴파일하는 UI 프레임워크. 브라우저에서 프레임워크가 따로 돌지 않는다.",
      use: "여기서는 안 쓴다. 메타 프레임워크는 SvelteKit.",
    },
    official: { label: "svelte.dev", url: "https://svelte.dev/" },
    learn: [],
  },
  angular: {
    name: "Angular",
    en: {
      what: "Google's UI framework. Opinionated and all-in-one: routing, forms, HTTP included. Common in large companies.",
      use: "Not used here.",
    },
    ko: {
      what: "Google의 UI 프레임워크. 라우팅, 폼, HTTP까지 다 들어 있는 올인원. 대기업에서 많이 쓴다.",
      use: "여기서는 안 쓴다.",
    },
    official: { label: "angular.dev", url: "https://angular.dev/" },
    learn: [],
  },
  reactRouter: {
    name: "React Router / Remix",
    en: {
      what: "The other meta-framework on React. Remix merged into React Router in 2024. Routing and server loading, like Next.js, with different conventions.",
      use: "Not used here. Next.js does the same job for us.",
    },
    ko: {
      what: "React 위의 또 다른 메타 프레임워크. Remix는 2024년에 React Router로 합쳐졌다. Next.js처럼 라우팅과 서버 로딩을 하지만 규칙이 다르다.",
      use: "여기서는 안 쓴다. 우리는 Next.js가 그 일을 한다.",
    },
    official: { label: "reactrouter.com", url: "https://reactrouter.com/" },
    learn: [],
  },
  astro: {
    name: "Astro",
    en: {
      what: "A meta-framework for content sites. Ships zero Javascript by default and lets you mix React, Vue or Svelte components in one page.",
      use: "Not used here.",
    },
    ko: {
      what: "콘텐츠 사이트용 메타 프레임워크. 기본으로 Javascript를 거의 안 보내고, 한 페이지에 React, Vue, Svelte 컴포넌트를 섞을 수 있다.",
      use: "여기서는 안 쓴다.",
    },
    official: { label: "astro.build", url: "https://astro.build/" },
    learn: [],
  },
  nuxt: {
    name: "Nuxt",
    en: {
      what: "The meta-framework for Vue. What Next.js is to React.",
      use: "Not used here.",
    },
    ko: {
      what: "Vue의 메타 프레임워크. React에 Next.js가 있듯이.",
      use: "여기서는 안 쓴다.",
    },
    official: { label: "nuxt.com", url: "https://nuxt.com/" },
    learn: [],
  },
  sveltekit: {
    name: "SvelteKit",
    en: {
      what: "The meta-framework for Svelte. What Next.js is to React.",
      use: "Not used here.",
    },
    ko: {
      what: "Svelte의 메타 프레임워크. React에 Next.js가 있듯이.",
      use: "여기서는 안 쓴다.",
    },
    official: { label: "svelte.dev/docs/kit", url: "https://svelte.dev/docs/kit" },
    learn: [],
  },
  tailwind: {
    name: "Tailwind",
    en: {
      what: "Styling with utility classes written directly in the markup: className=\"flex gap-4 text-sm\". No separate CSS file.",
      use: "Not used here. We write plain CSS in CSS Modules so you learn the CSS itself. Agents like to suggest Tailwind; say no.",
    },
    ko: {
      what: "마크업에 바로 유틸리티 클래스를 적는 스타일링: className=\"flex gap-4 text-sm\". CSS 파일이 따로 없다.",
      use: "여기서는 안 쓴다. CSS 자체를 배우라고 CSS Modules에 평범한 CSS를 쓴다. 에이전트가 Tailwind를 권하면 거절해라.",
    },
    official: { label: "tailwindcss.com", url: "https://tailwindcss.com/" },
    learn: [],
  },
  styledComponents: {
    name: "styled-components",
    en: {
      what: "CSS-in-JS: styles written inside Javascript, attached to a component. const Box = styled.div`padding: 1rem`.",
      use: "Not used here. CSS Modules give the same per-component scoping with plain CSS files.",
    },
    ko: {
      what: "CSS-in-JS: Javascript 안에 스타일을 쓰고 컴포넌트에 붙인다. const Box = styled.div`padding: 1rem`.",
      use: "여기서는 안 쓴다. CSS Modules가 평범한 CSS 파일로 같은 컴포넌트 단위 스코프를 준다.",
    },
    official: { label: "styled-components.com", url: "https://styled-components.com/" },
    learn: [],
  },
  sass: {
    name: "Sass",
    en: {
      what: "CSS with extras (variables, nesting, mixins) that compiles to CSS. Older than CSS Modules; much of what it added is now in CSS itself.",
      use: "Not used here.",
    },
    ko: {
      what: "변수, 중첩, 믹스인이 추가된 CSS. CSS로 컴파일된다. CSS Modules보다 오래됐고, 추가했던 기능 상당수가 이제 CSS 자체에 들어갔다.",
      use: "여기서는 안 쓴다.",
    },
    official: { label: "sass-lang.com", url: "https://sass-lang.com/" },
    learn: [],
  },
  svg: {
    name: "SVG",
    en: {
      what: "Scalable Vector Graphics. Shapes described as XML in the page: circles, paths, text. Sharp at any size, styled with CSS, animated with CSS or Javascript.",
      use: "The capability chart in Prelim is an SVG. Use it for 2D that stays crisp and needs to be part of the DOM; use Canvas for thousands of moving things.",
    },
    ko: {
      what: "Scalable Vector Graphics. 페이지 안에 XML로 적는 도형: 원, 경로, 글자. 어떤 크기에서도 선명하고, CSS로 꾸미고, CSS나 Javascript로 움직인다.",
      use: "Prelim의 성능 차트가 SVG다. 선명해야 하고 DOM의 일부여야 하는 2D에 쓰고, 움직이는 것이 수천 개면 Canvas를 써라.",
    },
    official: { label: "MDN: SVG", url: "https://developer.mozilla.org/en-US/docs/Web/SVG" },
    learn: [],
  },
  p5js: {
    name: "p5.js",
    en: {
      what: "A creative-coding library wrapping Canvas: setup(), draw(), and functions like ellipse() and fill(). Processing for the browser. Where most art students meet code.",
      use: "Not used here. We draw on Canvas directly inside React, so the same ideas work without the wrapper. A p5 sketch translates almost line by line.",
    },
    ko: {
      what: "Canvas를 감싼 크리에이티브 코딩 라이브러리: setup(), draw(), ellipse(), fill(). 브라우저용 Processing. 미대생 대부분이 코드를 처음 만나는 곳.",
      use: "여기서는 안 쓴다. React 안에서 Canvas에 직접 그리니까 래퍼 없이도 같은 아이디어가 된다. p5 스케치는 거의 한 줄씩 옮겨진다.",
    },
    official: { label: "p5js.org", url: "https://p5js.org/" },
    learn: [],
  },
  webgl: {
    name: "WebGL",
    en: {
      what: "The browser API that talks to the GPU. Very low level: buffers, shaders, draw calls. Three.js exists so you do not write it by hand.",
      use: "Everything in W1 GLSL and Three.js runs on WebGL underneath. You write GLSL; Three.js handles the rest.",
    },
    ko: {
      what: "브라우저가 GPU와 대화하는 API. 매우 저수준: 버퍼, 셰이더, 드로우 콜. 이걸 손으로 안 쓰려고 Three.js가 있다.",
      use: "W1의 GLSL과 Three.js 전부 밑에서는 WebGL로 돈다. 너는 GLSL을 쓰고 나머지는 Three.js가 한다.",
    },
    official: { label: "MDN: WebGL", url: "https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API" },
    learn: [],
  },
  webgpu: {
    name: "WebGPU",
    en: {
      what: "The successor to WebGL: a newer GPU API with compute shaders and a different shader language (WGSL). Three.js has a WebGPU renderer.",
      use: "Not used here. GLSL on WebGL is what we teach; the concepts carry over.",
    },
    ko: {
      what: "WebGL의 후속: 컴퓨트 셰이더가 있고 셰이더 언어가 다른(WGSL) 새 GPU API. Three.js에 WebGPU 렌더러가 있다.",
      use: "여기서는 안 쓴다. WebGL 위의 GLSL을 가르치고, 개념은 그대로 옮겨간다.",
    },
    official: { label: "MDN: WebGPU", url: "https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API" },
    learn: [],
  },
} satisfies Record<string, TermEntry>;

export type TermId = keyof typeof terms;
