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
Hier komt een **massieve, rauwe, ultra-concrete brainstorm** voor **ALLEEN het Quiz-systeem** — *nieuwe ideeën*, geen herhaling, alles modulair, uitvoerbaar, uitbreidbaar, echt zoals een developer het wil hebben.
Ik gooi ALLES wat mogelijk is voor jouw platform. Veel is optioneel, maar allemaal realistisch.

---

# 🧠 **ULTRA-BRAINSTORM: 100+ nieuwe quiz features**

*(voor StudyWeb Quizzes – dit is NIET flashcards, NIET dashboard, NIET agenda. Alleen quizzes.)*

---

# 🔥 **1. Quiz Modes (Gameplay Styles)**

Nieuwe, unieke modi die dieper gaan dan basis-multiple choice.

### **1.1 Survival Mode 2.0**

* 1 fout = +3–5 nieuwe vragen toegevoegd (jouw idee → uitgewerkt)
* lives systeem (3 levens)
* correcte streak reduceert penalty’s
* tijdsdruk: vraag moet binnen X seconden

### **1.2 Speedrun Mode**

* doel: quiz zo snel mogelijk afmaken
* timer loopt af, je vergelijkt met je vrienden / klas / wereld
* leaderboard per quiz

### **1.3 Boss Fight Mode**

* eindvraag = “boss”
* fout = terug naar begin van een hoofdstuk
* goed = badge + EXP

### **1.4 “Short Exam” / “Long Exam” generator**

Je kiest:

* 10 vragen
* 50 vragen
* 100 vragen
* “alles uit hoofdstuk X”

### **1.5 Adaptive Difficulty AI**

* makkelijke vragen worden langzaam vervangen door moeilijkere
* AI detecteert zwaktes → meer vragen *alleen* over wat jij niet kan

### **1.6 Mastery Mode**

Je moet elke categorie 100% “groen” krijgen.
Elke fout zet die categorie terug naar 0%.

### **1.7 Hyperfocus Mode**

* kies 1 subonderwerp → 20 vragen alleen daarover
* AI maakt automatisch subonderwerpen

### **1.8 Exam Simulation**

* hele proefwerken nabootsen met:

  * tijdslimiet (bijv 50 min)
  * geen terugknop
  * docent kan echte examens importeren

### **1.9 Duel Mode**

* 1v1 tegen iemand anders
* wie sneller goed heeft → punt
* realtime socket-based

### **1.10 Team Battle**

* teams → binnen een klas
* elke vraag geeft team-score
* leaderboard per dag/week

---

# 🎨 **2. Quiz Creation UI (voor gebruikers & docenten)**

*Veel nieuwe ideeën om quizzen te bouwen.*

### **2.1 Drag & Drop Question Builder**

* sleep losse blokken: Titel / Multiple choice / Open vraag / Matching / Image / Audio / Video
* veel intuïtiever

### **2.2 AI Question Generator 3 Levels**

1. **Basic:** omzetting tekst → quiz
2. **Enhanced:** AI maakt moeilijkheidsgraad
3. **Pro:** AI maakt volledige toets + uitleg + feedback per vraag

### **2.3 Quiz Templates**

* “Toets”
* “Huiswerk”
* “Basiskennis check”
* “Overhoring”
* “Snelle 10 vragen”
* “Examentraining”

### **2.4 Custom Question Pools**

* docent of gebruiker maakt meerdere *pools*
* quiz kiest random X vragen uit elke pool

### **2.5 Version Control**

* quiz versie 1, versie 2, versie 3
* docenten kunnen oude versies terugzetten

### **2.6 Multi-language**

* 1 quiz → automatisch vertaalbare versies
* handig voor internationale scholen

### **2.7 AI Rewriter**

* moeilijke vraag → AI maakt simpelere versie
* makkelijke vraag → AI maakt moeilijkere versie

### **2.8 Duplicate Detector**

Detecteert of je dezelfde vraag 2x hebt gemaakt.

---

# 📱 **3. Quiz UI / UX Features**

Hoe het eruitziet en voelt.

### **3.1 Quick Start Panel**

Bij quiz openen:

* recent gedaan
* aanbevelingen
* “continue last session”

### **3.2 Real-Time Progress Map**

* visualised progress zoals een routekaart
* fout → rood pad
* goed → groen pad

### **3.3 Difficulty Indicator**

* makkelijk / gemiddeld / moeilijk zichtbaar

### **3.4 Image Zoom**

Bij vragen met afbeelding → pinch zoomen (web + mobiel)

### **3.5 Keyboard-only Mode**

Voor snelle toetsers:

* 1 → A
* 2 → B
* 3 → C
* space → bevestigen

### **3.6 Dark mode / Light mode automatisch**

Gebaseerd op systeeminstellingen.

### **3.7 Accessibility Mode**

* grotere tekst
* makkelijker kleurcontrast
* voor ADHD: minder animaties

### **3.8 Offline Queue**

Als je internet wegvalt:

* vragen lokaal opslaan
* antwoorden worden later gesynchroniseerd

---

# 🏆 **4. Analytics & Stats (per quiz)**

Voor gebruiker + docent.

### **4.1 Heatmap van fouten**

“Op welke hoofdstukken gaat het slecht?”

### **4.2 Streak Tracker**

* beste streak
* gemiddelde speed
* accuracy over tijd

### **4.3 Retry System**

Na een quiz:

* “alle fouten opnieuw doen”
* “alle vragen opnieuw”
* “alleen moeilijke vragen opnieuw”

### **4.4 Mastery %

* per hoofdstuk
* per onderwerp
* per categorie
* gegamified zoals Duolingo “crowns"

### **4.5 Class Analytics (docent)**

* gemiddelde van klas
* wie 100% mastery heeft
* wie achterloopt
* welke vragen het slechtst worden gemaakt

---

# 🧩 **5. Question Types Expansion**

Veel nieuwe vraagtypes.

### **5.1 Matching Lines (drag and drop)**

Verbind kolom A met kolom B.

### **5.2 Ordering**

Zet stappen in de juiste volgorde:

* volgorde van een proces
* tijdlijn gebeurtenissen

### **5.3 Fill in the Blank**

Tekst met lege woorden:

> De industriële revolutie begon in ____.

### **5.4 Label the Image**

Plaats labels op een foto / kaart.

### **5.5 Audio Questions**

Je hoort audio → je moet antwoord geven.

### **5.6 Video Questions**

Bijv. biologie video → vraag erover.

### **5.7 Diagram Builder**

AI maakt diagrammen → jij vult labels in.

### **5.8 Multi-Answer MC**

Meer dan één antwoord correct.

### **5.9 Highlight Text**

Dieper niveau:

* je krijgt een stuk tekst
* je highlight het juiste antwoord

---

# 📂 **6. Storage Features (Saved Quizzes, Recents, Folders)**

### **6.1 Recents**

Zoals:

* laatst geopend
* laatst gehaald
* laatst aangemaakt

### **6.2 Collections / Folders**

Bijv:

* “Biologie Hoofdstuk 4”
* “Toetsweek Voorbereiding”
* “Examenbundel 2025”

### **6.3 Favorites**

⭐ favoriet zetten

### **6.4 Tags**

Quiz tags:

* moeilijkheid
* hoofdstuk
* vakgebied
* docent

### **6.5 Import / Export**

* importeren Quizlet → direct quiz
* importeren Word → AI maakt quiz
* export naar PDF (mooie layout)
* export naar JSON (ruwe data)

---

# 🎮 **7. Rewards & Gamification**

Niet kinderachtig, maar motiverend.

### **7.1 XP, Levels & Badges**

* Level 1–100
* Badges voor streaks
* Badges voor mastery

### **7.2 Weekly Challenge**

AI maakt elke week een quiz:

* 20 vragen over je vakken
* leaderboard

### **7.3 Quest System**

Bijv:

* “Doe 3 quizzen deze week”
* “Master hoofdstuk 4”

### **7.4 Quiz Pass**

Soort battle pass (gratis):

* elke week rewards
* docent kan speciale rewards toevoegen

---

# 🌍 **8. Social / Sharing Features**

### **8.1 Share Quiz via Link**

Privé of publiek.

### **8.2 Publish to Global Gallery**

Waar anderen je quiz kunnen gebruiken.

### **8.3 Class Quiz Sharing**

Docent → klas
Studenten → eigen foto’s / uitleg toevoegen

### **8.4 Study Groups**

Quizzen in groep spelen met chatroom.

---

# 🧰 **9. Advanced AI Features**

Next-level shit.

### **9.1 Auto-Explain After Answer**

AI genereert uitleg:

* waarom dit antwoord klopt
* waarom andere fout zijn

### **9.2 Personal Weakness Detector**

* AI vindt jouw 3 zwakke plekken
* maakt mini-quiz ervoor

### **9.3 Concept Graph**

AI bouwt een graf van begrippen en relaties
→ quiz focust op je zwakke nodes

### **9.4 “Explain to Me Like I’m Dumb” Button**

1 klik → vraag + antwoord uitgelegd op niveau 6-jarige

### **9.5 Smart Repetition**

AI weet exact wanneer jij iets opnieuw moet oefenen
vergelijkbaar met Anki SRS, maar geïntegreerd in quiz

---

# 🔄 **10. Integration Features (Agenda, Dashboard, Classes)**

Deze zijn quiz-specifiek.

### **10.1 Quiz Deadlines**

Uit agenda overgenomen.

### **10.2 Quiz Reminders**

* “Je hebt nog 2 quizzen openstaan”
* “Toets Biologie over 3 dagen → oefen nu 10 vragen”

### **10.3 Class Assigned Quiz**

Docent zet quiz open voor klas
→ jij ziet hem in je Dashboard

### **10.4 Auto-Suggested Quizzes**

Op basis van:

* agenda
* je prestaties
* je zwakke onderwerpen

---

# 🎛 **11. Settings / Preferences (per quiz en globaal)**

### **11.1 Animations On/Off**

Zeker houden.

### **11.2 Sounds (met mute button!)**

* subtle click
* correct ding
* incorrect soft bump
* NOT muziek
* NOT ambient loops
* alleen micro-audio cues zoals Apple UI

### **11.3 Difficulty Slider**

* normaal
* moeilijk
* ultra hard (minder tijd, zwaardere vragen)

### **11.4 Auto-Advance**

Gaat automatisch door na goed antwoord.

### **11.5 Font Size**

Klein / normaal / groot

### **11.6 Timer Options**

* timer aan
* timer uit
* countdown mode
* stopwatch mode

### **11.7 Answer Reveal Mode**

* meteen laten zien
* pas aan einde

---

# 🧪 **12. Experiment Features (future)**

Ideeën die crazy zijn maar haalbaar:

### **12.1 QuickCam Questions**

Je neemt een foto van je boek → AI maakt quiz.

### **12.2 AR Mode**

Plaats 3D model op tafel → AI stelt vragen.

### **12.3 “Explain My Wrong Answers” Video Generator**

AI maakt mini-video van 10 seconden die het fout uitlegt.

### **12.4 Peer Review Questions**

Studenten kunnen hun eigen vragen uploaden in peer-review systeem.

### **12.5 “Instructor AI”**

AI die optreedt als docent:

* geeft tips
* geeft feedback
* stelt volgvragen

---

# 🚀 Wil je dat ik:

* deze lijst omzet in **technische specs**?
* of in een **UI/UX schema**?
* of dat ik hiervan **de volledige database structuur** maak?
* of dat ik van ALLES **mockups / wireframes** genereer?
* of dat ik **een complete Next.js/TypeScript implementatie** begin?

Zeg wat je wilt.
