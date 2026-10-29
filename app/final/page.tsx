import Link from "next/link";
import styles from "./page.module.css";

export const metadata = { title: "final · ID412" };

// Replace this file with the final project. See docs/final/README.md.
export default function Final() {
  return (
    <main className={styles.root}>
      <p className={styles.crumb}>
        <Link href="/">ID412</Link> / final
      </p>
      <p className={styles.crumb}>app/final/page.tsx</p>
    </main>
  );
}
