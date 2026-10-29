"use client";

import Link from "next/link";
import { useState } from "react";
import type { Experiment } from "./experiments";
import styles from "./experiment-index.module.css";

type Group = { key: string; label: string; href?: string; experiments: Experiment[] };

/**
 * The experiments index. Full page, black on white (or the reverse), one row
 * per experiment: name · description · date · routes →. Weeks collapse.
 */
export function ExperimentIndex({ groups, scope }: { groups: Group[]; scope?: string }) {
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const total = groups.reduce((sum, group) => sum + group.experiments.length, 0);

  const toggle = (key: string) =>
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <main className={styles.root}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <Link href="/" className={styles.home}>
            ID412
          </Link>
          <span className={styles.slash}>/</span>
          {scope ? (
            <>
              <Link href="/experiments" className={styles.home}>
                experiments
              </Link>
              <span className={styles.slash}>/</span>
              <span>{scope}</span>
            </>
          ) : (
            <span>experiments</span>
          )}
        </h1>
        <span className={styles.total}>{total}</span>
        <Link href="/final" className={styles.headerLink}>
          final →
        </Link>
      </header>

      {groups.map((group) => {
        const isCollapsed = collapsed.has(group.key);
        return (
          <section key={group.key}>
            <div className={styles.groupHeader}>
              <button type="button" className={styles.groupToggle} aria-expanded={!isCollapsed} onClick={() => toggle(group.key)}>
                <span aria-hidden="true" className={styles.caret}>
                  {isCollapsed ? "▶" : "▼"}
                </span>
                <span>{group.label}</span>
                <span className={styles.count}>{group.experiments.length}</span>
              </button>
              {group.href && !scope ? (
                <Link href={group.href} className={styles.groupLink}>
                  {group.href} →
                </Link>
              ) : null}
            </div>
            {isCollapsed ? null : group.experiments.length === 0 ? (
              <p className={styles.empty}>
                nothing yet · create app/experiments/{group.key}/&lt;name&gt;/page.tsx
              </p>
            ) : (
              group.experiments.map((experiment) => (
                <div key={experiment.href} className={styles.row}>
                  <Link href={experiment.href} className={styles.name} data-experiment>
                    {experiment.name}
                  </Link>
                  <span className={styles.phrase}>{experiment.description}</span>
                  <time dateTime={experiment.updated} className={styles.date}>
                    {experiment.updated.replaceAll("-", ".")}
                  </time>
                  <span className={styles.routes}>
                    {experiment.multiDevice ? (
                      <>
                        <Link href={`/experiments/${experiment.week}/${experiment.name}/mobile`}>mobile</Link>
                        <Link href={`/experiments/${experiment.week}/${experiment.name}/screen`}>screen</Link>
                      </>
                    ) : (
                      experiment.href
                    )}
                  </span>
                  <span aria-hidden="true" className={styles.arrow}>
                    →
                  </span>
                </div>
              ))
            )}
          </section>
        );
      })}
    </main>
  );
}
