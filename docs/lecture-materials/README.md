# Lecture website — how it is built and how to edit it

Read this before changing anything under `app/lecture-materials/`, `public/lecture-materials/`, `app/layout.tsx`, `app/globals.css` or `app/page.tsx`. Students never edit these; the instructor and the TA do. The deployed site (id412.xdlab.net) is always the latest version; student clones keep whatever they cloned.

## Layout

```
app/lecture-materials/
  components/                 everything the lecture site needs, one folder per component
    sidebar/                  left navigation + per-page table of contents (reads h2[id] of the visible language)
    lang/                     EN / 한국어 switch (lang.tsx), <LangBlock> and <L> wrappers (lang-block.tsx)
    theme-toggle/             light / dark switch
    back-to-top/              bottom-right button
    term/                     <Term id="..."> clickable glossary keyword + glossary.ts (the data)
    image-row/                <ImageRow items={[...]} /> row of captioned images
    capability-chart/         the METR time-horizon chart on Prelim
    stack-diagram/            the layered frontend-stack figure on W1
    experiment-index/         scans app/experiments on the server and lists them (/experiments, /experiments/<week>)
    collapsible/              makes every h2 section and bold run-in subsection expand/collapse (DOM-only, nothing moves)
    code-block/               <pre> with a Copy button (every fenced code block)
    shell/                    LectureShell: sidebar + main column, used by the index and lecture pages only
    mdx/                      MDX element overrides (external links, [#id] headings) + the *.mdx type declaration
  prelim/ w1/ w2/ w3/
    page.tsx                  renders <En /> and <Ko /> inside <LangBlock>; metadata title
    en.mdx                    English notes
    ko.mdx                    Korean notes, same structure and same section ids
public/lecture-materials/<page>/        images used by that page (small: webp, <= 1280px)
docs/
  lecture-materials/README.md           this file
  experiments/README.md       student experiments guide
  final/README.md             final project guide
  sources/                    syllabus and source material
  handoff.md                  planning notes, gitignored
```

The index page (`app/page.tsx`) and the shell (`app/layout.tsx`, `app/globals.css`, `app/layout.module.css`) are part of the lecture site too. The root `mdx-components.tsx` only re-exports from `components/mdx/` because Next.js requires that file at the root.

## Philosophy: do not over-confuse students

- Teach the pipeline we actually use (Node.js, pnpm, Next.js App Router, React, CSS Modules, Claude Code). Name an alternative once so students recognise it in the wild, then move on. No comparison tables of things we will never touch.
- A concept earns a paragraph only if a student will meet it in this workshop. Otherwise it is a `Term` (one click, two sentences) or nothing.
- Prefer one way of doing something. If two ways are both fine (template vs. from scratch for the final), say so in one line, not two sections.
- Short lines, concrete commands, the same words every time (`pnpm dev`, `app/experiments/...`). Jargon gets a `Term`, not a lecture.

## Writing notes (MDX)

- Markdown + GFM (tables, autolinked URLs). Bare URLs become links. External links open in a new tab automatically.
- MDX gotcha: `<`, `{` and `}` in prose break the parser. Put them in backticks.
- A JSX block (`<ImageRow ... />`, `<CapabilityChart />`) needs a blank line before and after it. Inside a list item, indent it to the item's text and keep the blank lines.
- Style: English notes keep the 2025 voice (numbered sections, bold run-in subheads, nested bullets, short lines). Korean mirrors it.

## Two languages

- Every page has `en.mdx` and `ko.mdx`. Both are rendered; CSS shows the one matching `<html data-lang>`. The switch is in the sidebar and is remembered in localStorage.
- Section ids must match across languages so links and the glossary work. English ids come from the heading text (github-slugger: `## 6. Schedule & Assignments` → `6-schedule--assignments`). In Korean, end the heading with the English id in brackets: `## 6. 일정과 과제 [#6-schedule--assignments]`. The bracket is stripped on render.
- When you add or rename a section in `en.mdx`, do the same in `ko.mdx` and update any `related` links in `glossary.ts` that point at it.
- Short bilingual strings inside TSX: `<L en="..." ko="..." />`.

## Glossary (Term)

- `components/term/glossary.ts` holds every keyword: name, `en`/`ko` `{ what, use }`, `official` link, `learn` links, `related` links into the notes.
- Use it in MDX as `<Term id="pnpm" />` (renders the name) or `<Term id="api">APIs</Term>` (custom text). The word is dotted-underlined; clicking expands the explanation under that line in the current language.
- Add a term when a concept recurs across pages. Keep `what` to two or three sentences and `use` specific to this workshop.

## Images

- Put files in `public/lecture-materials/<page>/`, reference as `/lecture/<page>/<file>`. Keep them small (webp at 640–1280px). Record the licence in the caption when it is not ours (CC BY, public domain, etc.).
- `<ImageRow items={[{ src, alt, caption, href }]} />` for a row of images (two per row, click to enlarge in a lightbox); add `wide` for a single full-width one, `logos` for a row of small logos (SVGs in `public/lecture-materials/w1/logo-*.svg`, from Wikimedia Commons, licence noted in git history).
- Screenshots of the scratch app and the VS Code terminal live in `public/lecture-materials/w1/`. Re-take them when the UI changes.

## Checks

- `pnpm typecheck` and `pnpm build` must pass. `pnpm dev` is usually running on :3000; reload the page and check both languages, light and dark.
- The chart's data is hand-entered in `capability-chart.tsx` with its source; update numbers and the source line together.
