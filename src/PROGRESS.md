# StudyWeb Development Progress

This file tracks the major features that have been implemented and outlines the complete plan for future development based on the project blueprint in `README.md`.

---

## 🏁 **Completed Features**

### ✅ **TAB 1 — ADVANCED QUIZ SYSTEM**

*   **1.23 – Quiz Modes**:
    *   [x] **1.23.1 – Normal Mode**: The basic quiz functionality.
    *   [x] **1.23.2 – Practice Mode**: Implemented with AI-powered explanations for incorrect answers.
    *   [x] **1.23.3 – Exam Mode**: Timed mode with no hints or going back.
    *   [x] **1.23.4 – Adaptive Mode**: AI adjusts question difficulty based on performance, with on-the-fly question generation.
    *   [x] **1.23.5 – Speedrun Mode**: Timed mode with a "three strikes" system and a final score based on speed and accuracy.
    *   [x] **1.23.6 – Survival Mode**: Incorrect answers add more questions to the queue.

*   **1.22 & 1.26 – Teacher & AI Features**:
    *   [x] **1.22.1 – Teacher Dashboard Foundation**: Implemented the basic UI for the teacher dashboard, showing an overview of classes.
    *   [x] **1.22.1 – Create Class (UI & Frontend Logic)**: Implemented a multi-step, AI-assisted dialog for creating new classes.
    *   [x] **1.22.2 & 1.22.3 – Class Details Foundation**: Created a details page for individual classes to display assignments and student lists.
    *   [x] **1.22.3 - Create Assignment (UI & Frontend Logic)**: Implemented dialog and client-side logic for creating assignments.
    *   [x] **1.26.4 – Teacher Helper Agent (Data Generation)**: Created an AI flow to generate realistic data for the teacher dashboard.
    *   [x] **1.26.4 – Class Idea Agent**: Created an AI flow to help teachers brainstorm class names and descriptions.

*   **1.27 – Import & Export System**:
    *   [x] **1.27.1 – Import Sources (Partial)**: Implemented file/image upload directly within the Quiz and Flashcard tools. The AI processes the file to extract text for use in the tool.

*   **1.28 – Accessibility & UX**:
    *   [x] **Internationalization (i18n)**: Implemented a dictionary system for static UI text, with initial translations for English (en) and Dutch (nl).
    *   [x] **UI Polish**: Replaced subject placeholder images with cleaner `lucide-react` icons. Created a central "Tools" page and organized the sidebar.
    *   [x] **Specific Accessibility Features**: Implemented toggles and logic for High-Contrast Mode, Dyslexia-Friendly Font, and Reduced Animations.
    *   [x] **Keyboard-only Mode (Partial)**: Implemented keyboard shortcuts for Quiz and Flashcard navigation.

### ✅ **TAB 2 — ADVANCED FLASHCARD SYSTEM**

*   **Core System & Study Modes**:
    *   [x] **Classic Flip Mode**: Basic front/back flashcard viewing.
    *   [x] **Type Mode (Active Recall)**: User must type the answer.
    *   [x] **Multiple Choice Mode**: AI generates MCQs from flashcards.
    *   [x] **AI Flashcard Generation**: Generate flashcards from text.

### ✅ **TAB 3 — DASHBOARD & CORE PLATFORM**

*   **Student Dashboard**:
    *   [x] Implemented the initial layout, dynamically populated by an AI flow.
    *   [x] Created components for all major sections (Today's Plan, Deadlines, Alerts, Subjects, AI Suggestions, Quick Access, Statistics).
    *   [x] **Session Recap Card**: A card to display real-time analytics from the last quiz session.
*   **Teacher Dashboard**:
    *   [x] Implemented the initial layout for the Teacher Dashboard.
    *   [x] Created a `ClassCard` component to display summary information for each class.
    *   [x] Added a role switcher to toggle between Student and Teacher views.

---

## 🚀 **Development Plan (To-Do List)**

This is the master checklist for all remaining features.

### **PHASE 1: QUIZ SYSTEM ENHANCEMENTS**

*   **1.1 – Quiz Modes (New & Advanced)**
    *   [ ] **1.1.1 - Boss Fight Mode**: Final question is a "boss". Failure sends user back. Success grants a badge.
    *   [ ] **1.1.2 - Mastery Mode**: User must get 100% in all categories. One error resets a category.
    *   [ ] **1.1.3 - Hyperfocus Mode**: 20 questions on a single AI-identified sub-topic.
    *   [ ] **1.1.4 - Duel Mode (1v1)**: Real-time, socket-based quiz battle against another user.
    *   [ ] **1.1.5 - Team Battle**: Class-based teams compete for a high score.

*   **1.2 – Quiz Creation & Question Types**
    *   [ ] **1.2.1 - Advanced Question Types**:
        *   [ ] Matching Lines (Drag & Drop).
        *   [ ] Ordering (sequence steps).
        *   [ ] Fill in the Blank.
        *   [ ] Label the Image.
        *   [ ] Audio & Video Questions.
        *   [ ] Multi-Answer Multiple Choice.
        *   [ ] Highlight Text.
    *   [ ] **1.2.2 - Drag & Drop Question Builder**: Visual builder for creating quizzes.
    *   [ ] **1.2.3 - Quiz Templates**: Pre-defined templates (Exam, Homework, etc.).
    *   [ ] **1.2.4 - Version Control**: Save and revert to previous quiz versions.

*   **1.3 – Quiz Analytics & Gamification**
    *   [ ] **1.3.1 - Detailed Analytics**:
        *   [ ] Heatmap of errors by topic.
        *   [ ] Personal streak tracker and speed metrics.
        *   [ ] "Retry Mistakes" feature after a quiz.
    *   [ ] **1.3.2 - Gamification**:
        *   [ ] XP, Levels, and Badges system.
        *   [ ] Weekly AI-generated challenges.
        *   [ ] Quest System (e.g., "Complete 3 quizzes this week").

*   **1.4 – Advanced AI & Integration**
    *   [ ] **1.4.1 - Personal Weakness Detector**: AI finds a user's top 3 weak spots and creates a mini-quiz.
    *   [ ] **1.4.2 - "Explain Like I'm Dumb" Button**: AI regenerates an explanation in simple terms.
    *   [ ] **1.á.3 - Smart Repetition (SRS)**: AI determines when a user should re-practice a topic.
    *   [ ] **1.4.4 - Quiz Deadlines**: Integrate quizzes with the calendar for reminders.

---

### **PHASE 2: FLASHCARD SYSTEM OVERHAUL**

*   **2.1 – Core System & Management**
    *   [ ] **2.1.1 - Deck Management**: Add descriptions, colors, icons, and tags to decks.
    *   [ ] **2.1.2 - Advanced Card Formats**: Implement Image Occlusion, Audio Prompts, and Comparison Cards.
    *   [ ] **2.1.3 - Deck/Card Views**: Implement List, Grid, and Preview views for decks and cards.
    *   [ ] **2.1.4 - Deck & Card Organization**: Add folders, favorites, and a powerful search engine for cards.

*   **2.2 – Advanced Study Modes**
    *   [ ] **2.2.1 - Rapid Fire Mode**: Cards shown for a very short duration.
    *   [ ] **2.2.2 - Story Mode**: AI builds a narrative around the flashcards.
    *   [ ] **2.2.3 - Warm-up / Cool-down Modes**: AI-selected cards to start/end a session.

*   **2.3 – AI Generation & Memory Aids**
    *   [ ] **2.3.1 - AI Generation from Rich Media**: Generate cards from PDF, URL, or Audio.
    *   [ ] **2.3.2 - AI "Make It Stick" Agent**: AI generates mnemonics, analogies, and memory hacks.
    *   [ ] **2.3.3 - Spaced Repetition System (SRS)**: Implement an SM-2-based algorithm for scheduling reviews.

*   **2.4 – Import, Export, and Integration**
    *   [ ] **2.4.1 - Import**: Add importers for Quizlet and Anki.
    *   [ ] **2.4.2 - Export**: Add exporters for PDF (printable), Anki (APKG), and a "1-click to Quiz" feature.

---

### **PHASE 3: PLATFORM-WIDE FEATURES**

*   **3.1 – Core Content & AI**
    *   [ ] **1.21 - Smart Collections**: AI automatically bundles related quizzes, flashcards, and notes.
    *   [ ] **1.22 - AI Notes**: AI generates notes from text, PDFs, and YouTube links.
    *   [ ] **1.23 - AI Tutor**: A context-aware chatbot that understands a user's progress and weak spots.
    *   [ ] **1.31 - Weak Spots Engine**: A dedicated system to track and manage user weaknesses across all tools.
    *   [ ] **1.32 - Knowledge Graph**: A visual mindmap of all learned concepts and their relationships.
    *   [ ] **1.36 - Open-Answer Expert Grader**: AI grades free-text answers submitted by students.

*   **3.2 – Social & Collaboration**
    *   [ ] **1.34 - Multiplayer Studying**: Real-time quiz battles and collaborative flashcard sessions.
    *   [ ] **1.34 - Voice Chat**: Optional voice chat during multiplayer study sessions.
    *   [ ] **Social Sharing**: Share quizzes/decks via link or publish to a global gallery.

*   **3.3 – UI/UX & Personalization**
    *   [ ] **1.30 - "Study Feed"**: A TikTok-style feed of micro-learning content.
    *   [ ] **1.37 - Study Sessions (Pomodoro)**: An integrated focus timer with AI-guided tasks.
    *   [ ] **1.38 - Universal Search**: A single search bar that queries all user content (quizzes, notes, etc.).
    *   [ ] **1.40 - Settings Mega-Panel**: Expand the settings page with more UI and learning preferences.
    *   [ ] **11.2 - UI Sounds**: Add subtle, optional audio cues for UI interactions with a global mute button.

*   **3.4 – Teacher & Admin Features**
    *   [ ] **1.25 - Teacher->Student Automations**: Allow teachers to set up rules for auto-grading, reminders, etc.
    *   [ ] **1.29 - Learning Analytics Dashboards**: Advanced analytics for both students (personal progress) and teachers (class overview).
    *   [ ] **1.42 - Organization/School Admin Console**: A dedicated portal for school administrators.

*   **3.5 – Technical & Backend**
    *   [ ] **1.39 - Offline Local Cache Mode**: Use IndexedDB to cache content for offline practice.
    *   [ ] **Database Integration**: Replace all client-side state management and placeholder data with a proper database backend (e.g., Supabase/Firestore).
    *   [ ] **User Authentication**: Implement a full login/signup system.

