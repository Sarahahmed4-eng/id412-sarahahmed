import { ExperimentIndex } from "@/app/lecture-materials/components/experiment-index/experiment-index";
import { listExperiments, listWeeks, weekLabel } from "@/app/lecture-materials/components/experiment-index/experiments";

export const metadata = { title: "experiments · ID412" };

// Every experiment under app/experiments/<week>/<name>/, read from disk at build time.
export default function Experiments() {
  const groups = listWeeks().map((week) => ({
    key: week,
    label: weekLabel(week),
    href: `/experiments/${week}`,
    experiments: listExperiments(week),
  }));
  return <ExperimentIndex groups={groups} />;
}
