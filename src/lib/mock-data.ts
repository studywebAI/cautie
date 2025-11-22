import type {
  Task,
  Alert,
  Deadline,
  Subject,
  AiSuggestion,
  QuickAccessItem,
  ProgressData
} from "@/lib/types";
import {
  AlertTriangle,
  FileText,
  BookOpen,
  Calendar,
  BarChart3,
  Lightbulb,
  File,
  History,
  Info,
  CheckCircle2,
  BrainCircuit,
  Pencil,
  Notebook
} from "lucide-react";

export const tasks: Task[] = [
  { id: "1", title: "Lees hoofdstuk 2 'Moderne Geschiedenis'", duration: 30, completed: true },
  { id: "2", title: "Maak wiskundeopgaven over integralen", duration: 45, completed: false },
  { id: "3", title: "Start met het schrijven van het essay voor Engels", duration: 25, completed: false },
  { id: "4", title: "Doe een snelle quiz over de Franse Revolutie", duration: 10, completed: false },
];

export const alerts: Alert[] = [
  {
    id: "1",
    title: "Deadline voor scheikunde nadert",
    description: "Het labverslag moet morgen ingeleverd zijn.",
    variant: "destructive",
    icon: AlertTriangle,
  },
  {
    id: "2",
    title: "Feedback op je Engelse essay",
    description: "Je docent heeft feedback achtergelaten.",
    variant: "info",
    icon: Info,
  },
  {
    id: "3",
    title: "Planning loopt op schema",
    description: "Je bent goed op weg om je weekdoelen te halen.",
    variant: "success",
    icon: CheckCircle2,
  },
];

export const deadlines: Deadline[] = [
  {
    id: "1",
    subject: "Scheikunde",
    title: "Labverslag 'Reactiesnelheid'",
    date: "Morgen",
    workload: "±1.5 uur resterend",
    status: "risk",
  },
  {
    id: "2",
    subject: "Engels",
    title: "Essay 'The Great Gatsby'",
    date: "Over 4 dagen",
    workload: "±3 uur werk",
    status: "on-track",
  },
  {
    id: "3",
    subject: "Wiskunde",
    title: "Tentamen Analyse 1",
    date: "Over 1.5 week",
    workload: "±8 uur studeren",
    status: "on-track",
  },
  {
    id: "4",
    subject: "Filosofie",
    title: "Presentatie 'Sartre'",
    date: "Over 3 weken",
    workload: "±5 uur werk",
    status: "on-track",
  },
];

export const subjects: Subject[] = [
  {
    id: "1",
    name: "Geschiedenis",
    progress: 65,
    imageUrl: "https://picsum.photos/seed/history-real/200/150",
    imageHint: "historical map",
  },
  {
    id: "2",
    name: "Wiskunde",
    progress: 80,
    imageUrl: "https://picsum.photos/seed/math-real/200/150",
    imageHint: "calculus formulas",
  },
  {
    id: "3",
    name: "Scheikunde",
    progress: 55,
    imageUrl: "https://picsum.photos/seed/chemistry-real/200/150",
    imageHint: "molecular structure",
  },
  {
    id: "4",
    name: "Engels",
    progress: 75,
    imageUrl: "https://picsum.photos/seed/english-lit/200/150",
    imageHint: "stack of classic books",
  },
];

export const aiSuggestions: AiSuggestion[] = [
  {
    id: "1",
    title: "Genereer een oefentoets voor het Wiskunde tentamen.",
    icon: BrainCircuit,
  },
  {
    id: "2",
    title: "Maak een samenvatting van je notities over 'The Great Gatsby'.",
    icon: FileText,
  },
  {
    id: "3",
    title: "Stel een studieschema op voor de komende 3 dagen.",
    icon: Calendar,
  },
];

export const quickAccessItems: QuickAccessItem[] = [
  {
    id: "1",
    title: "Aantekeningen 'Reactiesnelheid'",
    type: "notes",
    icon: Notebook,
  },
  { id: "2", title: "Essay Draft (Engels)", type: "file", icon: File },
  { id: "3", title: "Oefenquiz Analyse", type: "quiz", icon: BrainCircuit },
  {
    id: "4",
    title: "Samenvatting Sartre",
    type: "summary",
    icon: FileText,
  },
];

export const progressData: ProgressData[] = [
  { day: "Ma", "Study Time": 65 },
  { day: "Di", "Study Time": 80 },
  { day: "Wo", "Study Time": 45 },
  { day: "Do", "Study Time": 95 },
  { day: "Vr", "Study Time": 70 },
  { day: "Za", "Study Time": 40 },
  { day: "Zo", "Study Time": 15 },
];
