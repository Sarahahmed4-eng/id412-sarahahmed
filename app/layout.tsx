import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ID412 Web Workshop 2026",
  description: "KAIST ID412 Interactive Space — Creative Web Development Workshop",
};

// Root layout: document, global styles, and the saved theme/language applied
// before first paint. The lecture pages add their own frame (LectureShell);
// experiments and the final render full-bleed.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);var l=localStorage.getItem("lang");if(l==="ko")document.documentElement.setAttribute("data-lang","ko")}catch(e){}',
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
