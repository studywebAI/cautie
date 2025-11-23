# StudyWeb Development Progress

This file tracks the major features that have been implemented and outlines the complete plan for future development based on the project blueprint in `README.md`.

---

## 🏁 **Completed Features**

### ✅ **TAB 1 — ADVANCED QUIZ SYSTEM**

*   **Quiz Modes**:
    *   [x] **Normal Mode**: The basic quiz functionality.
    *   [x] **Practice Mode**: Implemented with AI-powered explanations for incorrect answers.
    *   [x] **Exam Mode**: Timed mode with no hints or going back.
    *   [x] **Adaptive Mode**: AI adjusts question difficulty based on performance, with on-the-fly question generation.
    *   [x] **Speedrun Mode**: Timed mode with a "three strikes" system and a final score based on speed and accuracy.
    *   [x] **Survival Mode**: Incorrect answers add more questions to the queue.
*   **Teacher & AI Features**:
    *   [x] **Teacher Dashboard Foundation**: Implemented the basic UI for the teacher dashboard, showing an overview of classes.
    *   [x] **Create Class (UI & Frontend Logic)**: Implemented a multi-step, AI-assisted dialog for creating new classes.
    *   [x] **Class Details Foundation**: Created a details page for individual classes to display assignments and student lists.
    *   [x] **Create Assignment (UI & Frontend Logic)**: Implemented dialog and client-side logic for creating assignments.
    *   [x] **Teacher Helper Agent (Data Generation)**: Created an AI flow to generate realistic data for the teacher dashboard.
    *   [x] **Class Idea Agent**: Created an AI flow to help teachers brainstorm class names and descriptions.
*   **Import & Export System**:
    *   [x] **Import Sources (Partial)**: Implemented file/image upload directly within the Quiz and Flashcard tools. The AI processes the file to extract text for use in the tool.
*   **Accessibility & UX**:
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

# 🚀 **MASTER DEVELOPMENT PLAN**

This is the master checklist for all remaining features, compiled from `README.md`.

## **PHASE 1: QUIZ SYSTEM (FEATURES 1-12)**

*   **1. Advanced Quiz Modes**
    *   [ ] **1.2 Duel Mode**: 1v1 real-time, socket-based quiz battle.
    *   [ ] **1.3 Team Battle**: Class-based teams compete on a shared leaderboard.
    *   [ ] **1.4 Boss Fight Mode**: A high-stakes final question with badge rewards.
    *   [ ] **1.5 Mastery Mode**: Categories reset to 0% on any mistake.
    *   [ ] **1.6 Hyperfocus Mode**: 20 AI-generated questions on a single sub-topic.
    *   [ ] **1.7 Exam Simulation**: Full exam import and simulation with strict rules.

*   **2. Quiz Creation UI**
    *   [ ] **2.1 Drag & Drop Question Builder**: Visual block-based quiz constructor.
    *   [ ] **2.2 Advanced AI Question Generator**: Multi-level AI for difficulty and feedback generation.
    *   [ ] **2.3 Quiz Templates**: Pre-defined templates (Exam, Homework, etc.).
    *   [ ] **2.4 Custom Question Pools**: Randomize questions from different teacher-defined pools.
    *   [ ] **2.5 Version Control**: Save, view, and revert to previous quiz versions.
    *   [ ] **2.6 AI Rewriter**: "Make it simpler" / "Make it harder" button for questions.

*   **3. Quiz UI/UX Features**
    *   [ ] **3.1 Real-Time Progress Map**: Visual route map of correct/incorrect answers.
    *   [ ] **3.2 Image Zoom**: Pinch-to-zoom on question images.
    *   [ ] **3.3 Offline Queue**: Cache questions and sync answers when connection returns.

*   **4. Analytics & Stats**
    *   [ ] **4.1 Heatmap of Errors**: Visualize weak topics.
    *   [ ] **4.2 Personal Analytics**: Track best streak, average speed, and accuracy over time.
    *   [ ] **4.3 Advanced Retry System**: Options to retry all, only mistakes, or only difficult questions.
    *   [ ] **4.4 Class Analytics (Teacher)**: Deep dive into class performance, identifying struggling students and problematic questions.

*   **5. Advanced Question Types**
    *   [ ] **5.1 Matching Lines**: Drag-and-drop to connect items from two columns.
    *   [ ] **5.2 Ordering**: Place items in the correct sequence.
    *   [ ] **5.3 Fill in the Blank**: Type answers into empty text fields.
    *   [ ] **5.4 Label the Image**: Drag labels onto specific parts of an image.
    *   [ ] **5.5 Audio & Video Questions**: Answer questions based on multimedia clips.
    *   [ ] **5.6 Multi-Answer MC**: Select all correct options from a list.
    *   [ ] **5.7 Highlight Text**: Select the specific part of a text passage that answers the question.

*   **6. Quiz Storage & Organization**
    *   [ ] **6.1 Collections / Folders**: Organize quizzes into custom folders.
    *   [ ] **6.2 Favorites & Tags**: Mark favorite quizzes and add searchable tags.
    *   [ ] **6.3 Advanced Import/Export**: Import from Quizlet/Word, export to PDF/JSON.

*   **7. Rewards & Gamification**
    *   [ ] **7.1 XP, Levels & Badges**: A comprehensive progression system.
    *   [ ] **7.2 Weekly AI Challenge**: A personalized quiz challenge generated each week.
    *   [ ] **7.3 Quest System**: Complete specific learning goals for rewards.
    *   [ ] **7.4 Quiz Pass**: A free, seasonal "battle pass" with rewards.

*   **8. Social & Sharing Features**
    *   [ ] **8.1 Global Gallery**: Publish quizzes for the community to use.
    *   [ ] **8.2 Study Groups**: Play quizzes together in a shared room with chat.

*   **9. Advanced AI Features**
    *   [ ] **9.1 Personal Weakness Detector**: AI finds a user's top 3 weak spots and creates a mini-quiz.
    *   [ ] **9.2 "Explain Like I'm 5" Button**: AI regenerates an explanation in simpler terms.
    *   [ ] **9.3 Smart Repetition (SRS)**: AI determines when a user should re-practice a topic.
    *   [ ] **9.4 Concept Graph Integration**: AI builds quizzes focused on weak knowledge graph nodes.

*   **10. Platform Integration**
    *   [ ] **10.1 Quiz Deadlines & Reminders**: Integrate quizzes with the calendar for notifications.
    *   [ ] **10.2 Auto-Suggested Quizzes**: AI recommends quizzes based on performance and deadlines.

*   **11. Advanced Settings**
    *   [ ] **11.1 UI Sounds**: Add subtle, optional audio cues for UI interactions with a global mute button.
    *   [ ] **11.2 Difficulty Slider**: Manually set quiz difficulty.
    *   [ ] **11.3 Auto-Advance**: Automatically move to the next question after a correct answer.
    *   [ ] **11.4 Answer Reveal Mode**: Configure feedback to be immediate or at the end.

*   **12. Experimental Features**
    *   [ ] **12.1 QuickCam Questions**: Generate a quiz from a photo of a textbook page.
    *   [ ] **12.2 "Explain My Wrong Answers" Video Generator**: AI creates a short video explaining a mistake.
    *   [ ] **12.3 Peer Review System**: Students submit and review each other's questions.

## **PHASE 2: FLASHCARD SYSTEM (FEATURES 1-16)**

*   **1. Core System & Management**
    *   [ ] **1.1 Deck Management**: Add descriptions, colors, icons, and AI-generated tags.
    *   [ ] **1.2 Advanced Card Formats**: Implement Image Occlusion, Audio Prompts, and Comparison Cards.
    *   [ ] **1.3 Deck/Card Views**: Implement List, Grid, Preview, and High-Focus modes.

*   **2. AI Generation**
    *   [ ] **2.1 AI from Rich Media**: Generate cards from PDF, URL, or Audio.
    *   [ ] **2.2 AI Simplify/Expand**: Buttons on each card to get simpler or more detailed explanations.
    *   [ ] **2.3 AI "Make It Stick" Agent**: AI generates mnemonics, analogies, and memory hacks.

*   **3. Advanced Study Modes**
    *   [ ] **3.1 Rapid Fire Mode**: High-intensity mode with short timers per card.
    *   [ ] **3.2 Survival Mode**: Incorrect answers add more cards to the deck.
    *   [ ] **3.3 AI Teaching Mode**: AI acts as a tutor, answering questions about the cards.
    *   [ ] **3.4 Story Mode**: AI builds a narrative around the flashcards to improve retention.
    *   [ ] **3.5 Warm-up / Cool-down Modes**: AI-selected cards to start/end a session.

*   **4. UI Features & Organization**
    *   [ ] **4.1 Deck & Card Organization**: Add folders, favorites, and a powerful search engine for cards.
    *   [ ] **4.2 Voice Over**: Text-to-speech for card content.

*   **5-8. Import, Export, Analytics**
    *   [ ] **6.1 Import**: Add importers for Anki, CSV, and Notion.
    *   [ ] **7.1 Export**: Add exporters for PDF (printable), Anki (APKG), and a "1-click to Quiz" feature.
    *   [ ] **8.1 Memory Score & Forgetting Curve**: AI predicts memory retention and schedules reviews.
    *   [ ] **8.2 Review Heatmap**: A GitHub-style commit graph for study sessions.

*   **9-12. Backend & AI Architecture**
    *   [ ] **9.1 Spaced Repetition System (SRS)**: Implement an SM-2-based algorithm for scheduling reviews.
    *   [ ] **10.1 Offline Sync**: Use IndexedDB for offline study and sync with the cloud.
    *   [ ] **12.1 Multi-Agent AI Setup**: Decompose AI tasks into specialized agents (Parser, Builder, etc.).

## **PHASE 3: PLATFORM-WIDE FEATURES (FEATURES 1.21-1.60)**

*   **Content & AI**
    *   [ ] **1.21 Smart Collections**: AI automatically bundles related quizzes, flashcards, and notes.
    *   [ ] **1.22 AI Notes**: AI generates notes from text, PDFs, and YouTube links.
    *   [ ] **1.23 AI Tutor**: A context-aware chatbot that understands a user's progress and weak spots.
    *   [ ] **1.24 Cross-Mode Sync**: Seamlessly convert content between quizzes, flashcards, and notes.
    *   [ ] **1.31 Weak Spots Engine**: A dedicated system to track and manage user weaknesses across all tools.
    *   [ ] **1.32 Knowledge Graph**: A visual mindmap of all learned concepts and their relationships.
    *   [ ] **1.33 "Explain Like I'm 5/12/18"**: Multi-level explanation complexity.
    *   [ ] **1.36 Open-Answer Expert Grader**: AI grades free-text answers submitted by students.

*   **Social & Collaboration**
    *   [ ] **1.34 Multiplayer Studying**: Real-time quiz battles and collaborative flashcard sessions.
    *   [ ] **1.34 Voice Chat**: Optional voice chat during multiplayer study sessions.

*   **UI/UX & Personalization**
    *   [ ] **1.30 "Study Feed"**: A TikTok-style feed of micro-learning content.
    *   [ ] **1.37 Study Sessions (Pomodoro)**: An integrated focus timer with AI-guided tasks.
    *   [ ] **1.38 Universal Search**: A single search bar that queries all user content.
    *   [ ] **1.40 Settings Mega-Panel**: Expand the settings page with more UI and learning preferences.
    *   [ ] **1.53 Intelligent Onboarding Flow**: Personalized first-time user experience.

*   **Teacher & Admin Features**
    *   [ ] **1.25 Teacher->Student Automations**: Allow teachers to set up rules for auto-grading, reminders, etc.
    *   [ ] **1.29 Advanced Learning Analytics**: Dashboards for both students and teachers.
    *   [ ] **1.42 Organization/School Admin Console**: A dedicated portal for school administrators.
    *   [ ] **1.43 White-Labeling Engine**: Allow schools to customize branding.
    *   [ ] **1.45 Rules Engine for Automations**: "If-this-then-that" builder for admins.
    *   [ ] **1.52 Enterprise SSO & Directory Sync**: SAML/SCIM provisioning.
    *   [ ] **1.56 Learning Outcomes & Standards Mapping**: Tag content against official curriculums.

*   **Technical & Backend**
    *   [ ] **1.39 Offline Local Cache Mode**: Use IndexedDB to cache content for offline practice.
    *   [ ] **1.41 Plugin/App Marketplace**: An internal ecosystem for extensions.
    *   [ ] **1.48 Advanced Billing Engine**: Implement SaaS pricing tiers and usage-based billing.
    *   [ ] **1.50 API-first Platform**: Expose public/private APIs with a developer portal.
    *   [ ] **Full Database Integration**: Replace all client-side state and placeholder data with a proper database backend (e.g., Supabase/Firestore).
    *   [ ] **User Authentication**: Implement a full login/signup system.

    