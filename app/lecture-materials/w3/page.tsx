import type { Metadata } from "next";
import { LangBlock } from "@/app/lecture-materials/components/lang/lang-block";
import En from "./en.mdx";
import Ko from "./ko.mdx";

export const metadata: Metadata = { title: "W3 · ID412 Web Workshop 2026" };

// Both languages are rendered; the EN / 한국어 switch in the sidebar shows one.
export default function Page() {
  return (
    <>
      <LangBlock lang="en">
        <En />
      </LangBlock>
      <LangBlock lang="ko">
        <Ko />
      </LangBlock>
    </>
  );
}
