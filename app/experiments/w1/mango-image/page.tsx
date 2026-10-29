import Image from "next/image";
import styles from "./page.module.css";

// One photo, full screen. The licence (CC BY-SA 4.0) asks for the credit line below.
export default function MangoImage() {
  return (
    <main className={styles.container}>
      <Image
        src="/experiments/w1/mango-image/mango.jpg"
        alt="A ripe Nam Dok Mai mango"
        fill
        sizes="100vw"
        preload
        className={styles.image}
      />
      <p className={styles.credit}>
        Photo:{" "}
        <a href="https://commons.wikimedia.org/wiki/File:Mango_fruit_Nam_Dok_Mai.jpg">Ivar Leidus</a>,{" "}
        <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>
      </p>
    </main>
  );
}
