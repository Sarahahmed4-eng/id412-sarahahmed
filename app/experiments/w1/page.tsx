import { ExperimentIndex } from "@/app/lecture-materials/components/experiment-index/experiment-index";
import { listExperiments, weekLabel } from "@/app/lecture-materials/components/experiment-index/experiments";

export const metadata = { title: "w1 · experiments · ID412" };

// Index of this week's experiments. Your experiments are the sibling folders.
export default function Week() {
  return <ExperimentIndex scope="w1" groups={[{ key: "w1", label: weekLabel("w1"), experiments: listExperiments("w1") }]} />;
}
