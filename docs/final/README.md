# Final — how the final project is organised

Read by agents (via AGENTS.md) and by students. Applies to `app/final/`.

The final grows out of one (or more) experiments. Experiments stay as they are; the final is a copy that keeps changing.

Two valid routes: build the final inside this template at `app/final/`, or start a brand-new Next.js app from scratch (`pnpm create next-app@latest`, W1 §5) and copy over only what you need (`hooks/shared/useSocket.ts`, `socket-server.mjs`, your experiment). Both are fine. The rest of this file is for the in-template route.

- Start by copying the chosen experiment's folder contents here: `page.tsx` (+ `page.module.css`, helpers), or `mobile/` + `screen/` for multi-device. Assets go to `public/final/`.
- Socket room: a unique name (`final-<student>`), never the experiment's room.
- As it grows, split by concern inside this folder (`scene/`, `audio/`, `input/`, `api` under `app/api/final/`), not by week. Keep one `README.md` at `app/final/README.md` in the same shape as an experiment README, plus a "Setup in the Black Room" section: which laptop runs what, URLs for phones, sound output, what to check before opening.
- Sound is mandatory in the final. Audio starts after a user gesture.
- Multi-device finals run from the installation laptop with `pnpm dev:mobile` (or `pnpm build && pnpm start` plus `node socket-server.mjs`). Vercel hosts the pages only, not the relay.
- `pnpm build` must pass; the whole repo deploys together.
