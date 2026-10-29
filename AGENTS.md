# AGENTS.md

Rules for coding agents in this repository. Read this first. The detailed guide for each area is in `docs/`; read the one for the area you are working in before writing code there.

## One repo, two purposes

This is the KAIST ID412 Web Workshop template.

1. **Lecture website** — `app/lecture-materials/`, `public/lecture-materials/`, `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, `docs/`. Maintained by the instructor and TA, deployed at id412.xdlab.net. Guide: `docs/lecture-materials/README.md`. Do not change it unless the user explicitly asks to change the lecture site.
2. **Student workspace** — `app/experiments/`, `app/final/`, `app/api/`, `public/experiments/`, `public/final/`. Each student clones the template and builds here, week by week, with an agent. Guides: `docs/experiments/README.md` (folder layout, the per-experiment `README.md` you must write, conventions) and `docs/final/README.md`. This is where almost all of your work happens.

Shared by both: `hooks/shared/useSocket.ts` + `socket-server.mjs` (the multi-device relay) and `package.json` scripts. Extend them by adding files; do not rewrite them unless asked.

## Stack

Next.js 16 App Router, TypeScript, CSS Modules, MDX. pnpm, Node 24+. `three` via `@react-three/fiber` + `@react-three/drei`. `socket.io`. `tone`. No Tailwind, styled-components, state library or UI kit. Do not add them.

## Map

```
app/
  page.tsx  layout.tsx  globals.css      site shell (lecture site)
  lecture-materials/                         lecture site (docs/lecture-materials/README.md)
  experiments/                           student experiments (docs/experiments/README.md)
    w1/ w2/ w3/                          one folder per week, one folder per experiment inside
      w1/glsl/<name>/                    or inside a group folder for one tech (see docs/experiments/README.md)
  final/                                 the final project (docs/final/README.md)
  api/<name>/route.ts                    server endpoints (W3), secrets from .env.local
hooks/
  shared/useSocket.ts                    useSocket(room, onMessage) → { send, connected }
  experiments/<week>/  final/            hooks shared by several experiments of a week, or by the final
socket-server.mjs                        Socket.IO relay on :4000. join(room); message({type,data}) → the rest of the room
public/
  lecture-materials/<page>/                        lecture images
  experiments/<week>/<name>/  final/     student assets, mirroring app/
docs/                                    lecture-materials/ experiments/ final/ (guides), sources/
```

Everything is organised by what it belongs to. An experiment's code, styles, helpers and README live in its own folder; its assets in the mirrored `public/` folder. This repo will grow to dozens of experiments across weeks; keep the tree flat and predictable so every one of them is found the same way.

## Always

- `pnpm typecheck` passes before you say you are done. `pnpm build` passes before a push.
- Check the route in the browser. The user usually has `pnpm dev` on http://localhost:3000; do not start a second server on that port. Phones use `pnpm dev:mobile`.
- Report changes as a short list of files and what each does. Do not claim it works without checking.
- Do what was asked, in the files asked about. No unrelated refactors, renames or cleanup. Existing experiments keep working.
- Plain, readable code. A student should be able to read every file in one sitting.
- Do not over-confuse students. One way of doing things, the words of the lecture notes, no extra tooling or concepts beyond what the task needs. The same applies to anything you write (READMEs, comments): short and concrete.
- Never print or commit `.env*` or `certificates/`. Never `NEXT_PUBLIC_` a secret.
- Next.js APIs may differ from your training data: read `node_modules/next/dist/docs/` before writing Next-specific code. App Router, not Pages Router.
- Every new experiment gets a short `README.md` in its folder, in the shape given in `docs/experiments/README.md`. Update it when the experiment changes.
- Git is the student's safety net and they may not know it. When an experiment works in the browser, commit it: `git add app/experiments/<week>/<name> public/experiments/<week>/<name>` then `git commit -m "<week>: <name>"`. One commit per working step, only the files of that experiment. Never `git push`, `git reset`, `git checkout -- .` or rewrite history unless the user asks; say "commit saved" and move on.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
