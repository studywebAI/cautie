# StudyWeb Development Progress

This file tracks the major features that have been implemented based on the project blueprint in `README.md`.

## ✅ TAB 1 — ADVANCED QUIZ SYSTEM

### 1.23 – Quiz Modes
- [x] **1.23.1 – Normal Mode**: The basic quiz functionality.
- [x] **1.23.2 – Practice Mode**: Implemented with AI-powered explanations for incorrect answers.
- [x] **1.23.3 – Exam Mode**: Timed mode with no hints or going back.
- [x] **1.23.4 – Adaptive Mode**: AI adjusts question difficulty based on performance, with on-the-fly question generation.
- [x] **1.23.5 – Speedrun Mode**: Timed mode with a "three strikes" system and a final score based on speed and accuracy.
- [x] **1.23.6 – Survival Mode**: Incorrect answers add more questions to the queue.

### 1.22 & 1.26 – Teacher & AI Features
- [x] **1.22.1 – Teacher Dashboard Foundation**: Implemented the basic UI for the teacher dashboard, showing an overview of classes.
- [x] **1.26.4 – Teacher Helper Agent (Data Generation)**: Created an AI flow to generate realistic data for the teacher dashboard.

### 1.27 – Import & Export System
- [x] **1.27.1 – Import Sources (Partial)**: Implemented file/image upload directly within the Quiz and Flashcard tools. The AI processes the file to extract text for use in the tool.

### 1.28 – Accessibility & UX
- [x] **Internationalization (i18n)**: Implemented a dictionary system for static UI text, with initial translations for English (en) and Dutch (nl). The UI language changes based on user settings.
- [x] **UI Polish**: Replaced subject placeholder images with cleaner, more professional `lucide-react` icons.

## 🎓 Student Dashboard
- [x] Implemented the initial layout for the Student Dashboard, dynamically populated by an AI flow.
- [x] Created components for:
  - Today's Plan
  - Upcoming Deadlines
  - Alerts
  - My Subjects (grid and overview)
  - AI Suggestions
  - Quick Access
  - Progress Chart (Statistics)

## 🏫 Teacher Dashboard
- [x] Implemented the initial layout for the Teacher Dashboard.
- [x] Created a `ClassCard` component to display summary information for each class.
- [x] Added a role switcher to toggle between Student and Teacher views.
