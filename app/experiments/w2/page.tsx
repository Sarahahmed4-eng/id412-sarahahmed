import { ExperimentIndex } from "@/app/lecture-materials/components/experiment-index/experiment-index";
import { listExperiments, weekLabel } from "@/app/lecture-materials/components/experiment-index/experiments";

export const metadata = { title: "w2 · experiments · ID412" };

// Index of this week's experiments. Your experiments are the sibling folders.
export default function Week() {
  return <ExperimentIndex scope="w2" groups={[{ key: "w2", label: weekLabel("w2"), experiments: listExperiments("w2") }]} />;
}
