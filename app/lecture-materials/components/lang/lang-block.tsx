import type { Lang } from "./lang";

/** Wraps content that exists in one language. Only the active language's blocks are shown. */
export function LangBlock({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <div data-lang-block={lang}>{children}</div>;
}

/** Inline variant for short strings. */
export function L({ en, ko }: { en: React.ReactNode; ko: React.ReactNode }) {
  return (
    <>
      <span data-lang-block="en">{en}</span>
      <span data-lang-block="ko">{ko}</span>
    </>
  );
}
