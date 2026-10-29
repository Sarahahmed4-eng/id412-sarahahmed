import { LectureShell } from "./components/shell/shell";

export default function LectureLayout({ children }: { children: React.ReactNode }) {
  return <LectureShell>{children}</LectureShell>;
}
