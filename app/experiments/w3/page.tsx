import { ExperimentIndex } from "@/app/lecture-materials/components/experiment-index/experiment-index";
import { listExperiments, weekLabel } from "@/app/lecture-materials/components/experiment-index/experiments";

export const metadata = { title: "w3 · experiments · ID412" };

// Index of this week's experiments. Your experiments are the sibling folders.
export default function Week() {
  return <ExperimentIndex scope="w3" groups={[{ key: "w3", label: weekLabel("w3"), experiments: listExperiments("w3") }]} />;
}
