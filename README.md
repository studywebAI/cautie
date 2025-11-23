# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

never fucking ever place placeholders anywhere.
never delete code just because you wanna fix a error, only replace whats neccesary to fix a error. so never delete any functionality, feature basically never delete anything we already have just fix the error. studyweb is an interactive studywebsite made for perfection. animations should be apple like, super smooth and nice. alot of customization to make it perfect. make it clean and futuristic. i hate when something looks messy so make it loon clean and refreshing. hide things that arent special behind dropdown menus for example. give everything a correct place. if you have a question ask me immidietly not when you are already half way done. good luck. 
prompt(features that have priority right now): 
keep going. follow the big prompt i just send you, at the end of this message i will give the full prompt again, use this as a checklist to see what you did and didnt do, so dont redo the same features over and over again, make a plan of where you are now and keep going from there. after you are done tell me done. dont place placeholders anywhere. i wanteveyrthing with real logic, even if its more code or more work. dont remove code or features or logic or anything really just because you want to get rid of an error. delete the error but keep everythiung the same. good luck, here is the prompt: 
keep going. follow the big prompt i just send you, at the end of this message i will give the full prompt again, use this as a checklist to see what you did and didnt do, so dont redo the same features over and over again, make a plan of where you are now and keep going from there. after you are done tell me done. dont place placeholders anywhere. i wanteveyrthing with real logic, even if its more code or more work. dont remove code or features or logic or anything really just because you want to get rid of an error. delete the error but keep everythiung the same. good luck.
             MOST IMPORTANT: EVERYTHING YOU DO every FEATURE EVERYTHING YOU DO YOU WRITE DOWN AFTER EACH TIME YOU ARE DONE, YOU WRITE EVERTYTHING DOWN IN PROGRESS.MD SO TGHAT YOU REMEMBER WHAT YOU DID AND DONT AND DOUBLE THINGS.                                          
MPORTANT:NO SOUNDS.
I have now performed a meticulous, line-by-line review of your entire README.md blueprint against the current state of the code. The following is the complete and definitive list of all features specified in your README.md that are NOT YET IMPLEMENTED.

1.21 – Analytics & Insights (Student-Facing)

1.21.4 – Deep Question-Level Analytics: The system does not yet track or store detailed data per question (e.g., number of attempts, time per attempt, hints used, user difficulty rating).
1.21.5 – Topic-Level Insights: The UI does not display "Medium/Strong/Weak mastery" levels for topics, nor does it calculate specific metrics like mistakes ratio, average speed, or retention decay.
1.21.6 – “Need To Study” List: The automatic, AI-curated list of priority study items for the student dashboard homepage is not implemented.
1.22 – Teacher Dashboard (Full System)

1.22.1 – Klas aanmaken (Full Logic): The "Create New Class" button has no function. The logic to generate class codes, invite URLs, and manage class creation is missing.
1.22.2 – Studenten beheren: There is no interface for teachers to view and manage individual students, their progress, or their activity.
1.22.3 – Tasks / opdrachten: The entire system for teachers to create, assign, and manage tasks (quizzes, flashcards, etc.) with deadlines and specific settings is not implemented.
1.22.4 – Quiz Builder voor docenten: Teachers cannot manually build or edit quizzes, generate them via AI for their classes, or import questions.
1.22.5 – Real-time klas monitor: The real-time exam monitoring dashboard for teachers does not exist.
1.22.6 – Cheating Detection: No cheat detection mechanisms (tab-switching, copy-paste activity) are implemented.
1.22.7 – Automatische rapporten: The AI-driven reporting system that summarizes class performance for teachers is not implemented.
1.23 – Quiz Modes

1.23.7 – Endless Mode: A quiz mode that endlessly generates new questions based on weak spots is not implemented.
1.23.8 – Story Mode: This is marked as optional/later, but it is not implemented.
1.24 – Sounds & Haptics

1.24.1 – UI Sounds: No sounds for correct/incorrect answers, toggles, or completion are implemented.
1.24.2 – Pacing met subtiele geluiden: No subtle timer or pacing sounds are implemented.
1.24.3 – Voice Feedback (AI): The ability for AI to read questions/explanations aloud or for students to answer via speech-to-text is not implemented.
1.25 – Offline Mode

The entire system for caching quiz progress, notes, and other data locally for synchronization when the user comes back online is not implemented.
1.26 – AI Agents (Behind the scenes)

1.26.1 – Question Generator Agent: The logic for AI to proactively rewrite bad questions or balance difficulty across the entire question bank is not implemented (currently, generation is on-demand).
1.26.2 – Study Planner Agent: The core AI agent that creates and adjusts study schedules based on activity and deadlines is not implemented.
1.26.3 – Analytics Agent: The agent that calculates mastery, detects patterns, and generates deep insights is not implemented.
1.26.6 – Safe AI Agent (moderation): There is no agent to filter user-generated or AI-generated content for safety.
1.27 – Import & Export System

1.27.2 – Export opties: The ability to export quizzes or results to PDF, Word, CSV, or shareable links does not exist.
1.27.3 – Bulk Operations: There is no functionality for bulk actions like merging sets, editing multiple questions, or auto-tagging.
1.28 – Accessibility & UX

Specific Accessibility Features: The toggles for high-contrast mode, dyslexia font, and animation on/off are not implemented. Full keyboard navigation and screen reader support have not been audited or explicitly built. The font size slider is also missing.
1.29 – Supabase Schema

While I use schemas for AI flows, the actual PostgreSQL database tables in Supabase (e.g., classes, assignments, attempts, events) as defined in your blueprint have not been created or connected to the application logic.