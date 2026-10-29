import type { MDXComponents } from "mdx/types";
import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { CodeBlock } from "../code-block/code-block";

function Anchor({ href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const external = typeof href === "string" && /^https?:\/\//.test(href);
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...props}
    />
  );
}

// A heading may end with "[#custom-id]" to fix its anchor. The Korean pages use
// this so that their section ids match the English ones and links work in both.
const ID_SUFFIX = /\s*\[#([A-Za-z0-9_-]+)\]\s*$/;

function withCustomId(children: ReactNode): { children: ReactNode; id?: string } {
  const list = Array.isArray(children) ? [...children] : [children];
  const last = list[list.length - 1];
  if (typeof last !== "string") return { children };
  const match = last.match(ID_SUFFIX);
  if (!match) return { children };
  list[list.length - 1] = last.replace(ID_SUFFIX, "");
  return { children: list.length === 1 ? list[0] : list, id: match[1] };
}

function heading(Tag: "h1" | "h2" | "h3" | "h4") {
  return function Heading({ children, id, ...props }: HTMLAttributes<HTMLHeadingElement>) {
    const custom = withCustomId(children);
    return (
      <Tag id={custom.id ?? id} {...props}>
        {custom.children}
      </Tag>
    );
  };
}

const components: MDXComponents = {
  a: Anchor,
  pre: CodeBlock,
  h1: heading("h1"),
  h2: heading("h2"),
  h3: heading("h3"),
  h4: heading("h4"),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
