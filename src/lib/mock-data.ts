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
  { id: "1", title: "Geschiedenis H4.1 lezen", duration: 20, completed: true },
  { id: "2", title: "Samenvatting bij H4.1 maken", duration: 10, completed: true },
  { id: "3", title: "Wiskunde opgaven 1-5", duration: 30, completed: false },
  { id: "4", title: "Quick Quiz - Industriële revolutie", duration: 5, completed: false },
];

export const alerts: Alert[] = [
  {
    id: "1",
    title: "Je loopt achter op Geschiedenis",
    description: "Toets is aanstaande vrijdag. Plan 40 min in om in te halen.",
    variant: "destructive",
    icon: AlertTriangle,
  },
  {
    id: "2",
    title: "Niet ingeleverd: Paragraaf 3.2 opdracht",
    description: "De deadline was gisteren.",
    variant: "warning",
    icon: Info,
  },
  {
    id: "3",
    title: "Nieuwe opdracht gepubliceerd",
    description: "Je docent voor Wiskunde heeft een nieuwe opdracht geplaatst.",
    variant: "info",
    icon: Info,
  },
    {
    id: "4",
    title: "Goed bezig!",
    description: "Je bent volledig bij met al je vakken.",
    variant: "success",
    icon: CheckCircle2,
  },
];

export const deadlines: Deadline[] = [
  {
    id: "1",
    subject: "Geschiedenis",
    title: "Toets H4",
    date: "Aanstaande vrijdag",
    workload: "±2 uur werk",
    status: "risk",
  },
  {
    id: "2",
    subject: "Wiskunde",
    title: "Inleveropdracht Complexe Getallen",
    date: "Over 5 dagen",
    workload: "±45 min werk",
    status: "on-track",
  },
  {
    id: "3",
    subject: "Nederlands",
    title: "Boekverslag 'De Avonden'",
    date: "Over 2 weken",
    workload: "±4 uur werk",
    status: "on-track",
  },
  {
    id: "4",
    subject: "Scheikunde",
    title: "Practicum verslag",
    date: "Over 3 weken",
    workload: "±3 uur werk",
    status: "behind",
  },
];

export const subjects: Subject[] = [
  {
    id: "1",
    name: "Geschiedenis",
    progress: 45,
    imageUrl: "https://picsum.photos/seed/history/200/150",
    imageHint: "old book",
  },
  {
    id: "2",
    name: "Wiskunde",
    progress: 72,
    imageUrl: "https://picsum.photos/seed/math/200/150",
    imageHint: "blackboard equation",
  },
  {
    id: "3",
    name: "Scheikunde",
    progress: 60,
    imageUrl: "https://picsum.photos/seed/science/200/150",
    imageHint: "chemistry beaker",
  },
  {
    id: "4",
    name: "Nederlands",
    progress: 85,
    imageUrl: "https://picsum.photos/seed/dutch/200/150",
    imageHint: "windmill landscape",
  },
];

export const aiSuggestions: AiSuggestion[] = [
  {
    id: "1",
    title: "Herhaal nu 5 flashcards (snelle boost)",
    icon: BrainCircuit,
  },
  {
    id: "2",
    title: "Je sloeg gisteren Geschiedenis over, nu doen?",
    icon: History,
  },
  {
    id: "3",
    title: "Laat AI een samenvatting maken van je geüploade theorie.",
    icon: FileText,
  },
];

export const quickAccessItems: QuickAccessItem[] = [
  {
    id: "1",
    title: "Samenvatting Industriële Revolutie",
    type: "summary",
    icon: FileText,
  },
  { id: "2", title: "Laatst gemaakte quiz", type: "quiz", icon: BrainCircuit },
  { id: "3", title: "Upload: Bio H2.pdf", type: "file", icon: File },
  { id: "4", title: "Aantekeningen Wiskunde", type: "notes", icon: Notebook },
];

export const progressData: ProgressData[] = [
  { day: "Ma", "Study Time": 45 },
  { day: "Di", "Study Time": 60 },
  { day: "Wo", "Study Time": 30 },
  { day: "Do", "Study Time": 75 },
  { day: "Vr", "Study Time": 50 },
  { day: "Za", "Study Time": 90 },
  { day: "Zo", "Study Time": 20 },
];
