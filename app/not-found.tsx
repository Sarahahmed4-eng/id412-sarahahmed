import Link from "next/link";

// Shown for any URL that has no page.tsx. Next.js picks this file up by name.
export default function NotFound() {
  return (
    <>
      <h1>404</h1>
      <p>There is no page at this address. Every URL is a folder under app/ with a page.tsx inside.</p>
      <p>
        <Link href="/">Back to the index</Link>
      </p>
    </>
  );
}
