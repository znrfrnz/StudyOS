import {
  Atom,
  Binary,
  BookOpen,
  Brain,
  Briefcase,
  Calculator,
  Cloud,
  Code,
  Database,
  Dumbbell,
  FlaskConical,
  Globe,
  GraduationCap,
  HeartPulse,
  Landmark,
  Languages,
  Leaf,
  Lightbulb,
  Microscope,
  Monitor,
  Mountain,
  Music,
  Palette,
  PenTool,
  Puzzle,
  Shield,
  TrendingUp,
  Users,
  Zap,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";

export const SUBJECT_ICONS: {
  name: string;
  label: string;
  component: ComponentType<LucideProps>;
}[] = [
  { name: "BookOpen", label: "Book", component: BookOpen },
  { name: "Calculator", label: "Math", component: Calculator },
  { name: "FlaskConical", label: "Chemistry", component: FlaskConical },
  { name: "Atom", label: "Physics", component: Atom },
  { name: "Globe", label: "World", component: Globe },
  { name: "Palette", label: "Art", component: Palette },
  { name: "Music", label: "Music", component: Music },
  { name: "Code", label: "Code", component: Code },
  { name: "Binary", label: "CS", component: Binary },
  { name: "PenTool", label: "Writing", component: PenTool },
  { name: "Languages", label: "Language", component: Languages },
  { name: "HeartPulse", label: "Health", component: HeartPulse },
  { name: "GraduationCap", label: "School", component: GraduationCap },
  { name: "Brain", label: "Mind", component: Brain },
  { name: "Lightbulb", label: "Ideas", component: Lightbulb },
  { name: "Microscope", label: "Bio", component: Microscope },
  { name: "Landmark", label: "Gov", component: Landmark },
  { name: "Mountain", label: "Earth", component: Mountain },
  { name: "Dumbbell", label: "Sport", component: Dumbbell },
  { name: "Briefcase", label: "Work", component: Briefcase },
  { name: "Monitor", label: "Tech", component: Monitor },
  { name: "Database", label: "Data", component: Database },
  { name: "Cloud", label: "Cloud", component: Cloud },
  { name: "Shield", label: "Security", component: Shield },
  { name: "Zap", label: "Energy", component: Zap },
  { name: "Puzzle", label: "Logic", component: Puzzle },
  { name: "TrendingUp", label: "Econ", component: TrendingUp },
  { name: "Users", label: "People", component: Users },
  { name: "Leaf", label: "Nature", component: Leaf },
];

export function SubjectIcon({
  name,
  className,
  ...props
}: Omit<LucideProps, "name"> & { name: string | null | undefined }) {
  const found = SUBJECT_ICONS.find((icon) => icon.name === name);
  if (!found) return null;
  const Icon = found.component;
  return <Icon className={className} {...props} />;
}
