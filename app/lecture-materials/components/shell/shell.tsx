import { BackToTop } from "../back-to-top/back-to-top";
import { Collapsible } from "../collapsible/collapsible";
import { Sidebar } from "../sidebar/sidebar";
import styles from "./shell.module.css";

/** The lecture site's frame: sidebar + one-column main. Not used by experiments or the final. */
export function LectureShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>
      <BackToTop />
      <Collapsible />
    </>
  );
}
