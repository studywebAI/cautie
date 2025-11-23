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
📘 TAB 1 — ADVANCED QUIZ SYSTEM DEEL 1 — Foundation, Philosophy & Core Structure
de need to study lijst kan bijvoorbeeld op het dahsboard komen in een beetyje het thema als wanneer je op een iphone een herindering hebt op het startscherm off notitie dat er staat lastig en daaronder de dingen die je lastig vond en daarover specifiek extra dingen als bijv quizzes over start van ww1 omdat in je quiz gebleken is dat je het lastig vond. laat ook bij 1.21.5 de woorden medium mastery en masstery gewoon weg, laat alleen de score zien bijv 94 procent en dan missshien een symbooltje van heb je hulp nodig ofzo. laat 1.23.8 story mode ook complete weg, dit is te gamify voor onze website. agents boeien me niet zoveel, doe wat het beste is voor de website en gebruikers.       Top — ik ga **TAB 1 – Advanced Quiz System** meteen verder uitbreiden waar ik was gebleven.
We zaten bij **1.21 → Analytics & Insights**, dus ik ga hierop door en daarna de rest van Tab 1 afronden tot we rond de 5k–7k woorden komen.

---

# **1.21 – Analytics & Insights (Vervolg & Afronding)**

Analytics zijn niet alleen cijfertjes; ze vormen de *motor* van een adaptief leersysteem. Hier volgt de complete, definitieve lijst van wat je platform moet meten, hoe het dat moet tonen, en hoe alles in Supabase wordt opgeslagen zodat zowel studenten als docenten er écht iets aan hebben.

### **1.21.4 – Deep Question-Level Analytics**

Per vraag sla je:

* eerste poging correct (boolean)
* aantal pogingen
* tijd per poging
* tijd tussen pogingen
* times viewed (voordat antwoord is gegeven)
* overslaan / skip count
* hint gebruikt?
* AI hint gebruikt?
* difficulty rating (door user + door systeem)
* topic tags
* mastery change (percentage verbetering door deze vraag)

Hierdoor kun je:

* automatisch lastige vragen detecteren
* slechte vragen markeren
* topics detecteren die opnieuw geleerd moeten worden
* personalized study paths genereren

### **1.21.5 – Topic-Level Insights**

Je berekent per topic:

* mastery score (0–100)
* mistakes ratio (aantal fouten / aantal vragen)
* average speed
* retention decay (op basis van spaced repetition voorspellingen)
* confidence score

UI idee:

```
[ Topic Mastery Overview ]
Math – Algebra          78% (Medium mastery)
Math – Fractions        92% (Strong mastery)
Math – Geometry         41% (Weak mastery — priority area)
```

### **1.21.6 – “Need To Study” automatische lijst**

AI stelt de lijst samen op basis van fouten, tijd, vergeetcurve, en vraag-moeilijkheid.

Items:

* Topics die onder 50% mastery zitten
* Items die fout zijn gegaan in de laatste 24–48 uur
* Content die lang niet meer herhaald is (spaced repetition)
* Lessen die binnenkort examenrelevant zijn
* Door docent toegewezen items

Dit is letterlijk de homepagina van de student.

---

# **1.22 – Teacher Dashboard (volledig systeem)**

Een docent moet kunnen:

### **1.22.1 – Klas aanmaken**

Docent maakt een klas aan → krijgt:

* klascode
* invite URL
* QR code

Studenten joinen via:

* email
* code
* Magic Link
* SSO (later)

### **1.22.2 – Studenten beheren**

Docent ziet:

* naam
* voortgang
* laatste activiteit
* quiz attempts
* flashcard mastery
* moeilijkste onderwerpen
* waarschuwingen (te weinig activiteit)
* studieplanning (AI gegenereerd)

### **1.22.3 – Tasks / opdrachten**

Docenten kunnen alles “openzetten”:

* quiz
* flashcard set
* artikel / tekst
* AI-les
* oefentoets
* huiswerkopdracht
* essay
* project
* uitlegvideo

Per opdracht kunnen ze instellen:

* deadline
* zichtbaarheid
* herkansingen
* verplichte volgorde
* mastery target
* adaptive mode aan/uit
* vraagtypes toestaan / blokkeren

### **1.22.4 – Quiz Builder voor docenten**

Docent kan:

* handmatig vragen maken
* AI vragen laten genereren
* vragen importeren van Quizlet / CSV
* vragen dupliceren
* vragen categoriseren
* vragen taggen
* versiebeheer (automatisch)

### **1.22.5 – Real-time klas monitor (examen modus)**

Docent ziet tijdens live toets:

* wie is actief
* wie is afwezig
* wie is verdacht (cheat detection)
* wie zit vast op vraag
* tijd per vraag
* voortgang percentage
* score estimatie

### **1.22.6 – Cheating Detection (lightweight)**

Je detecteert alleen:

* abnormaal snelle antwoorden
* tab-switching (optioneel)
* copy-paste activity
* patterns die niet natuurlijk zijn

Geen enge spyware.
Alles opt-in.

### **1.22.7 – Automatische rapporten**

Per opdracht verstuurt AI:

* wat goed ging
* wat slecht ging
* wat studenten moeten herhalen
* welke vragen slecht waren
* welke vragen verbeterd moeten worden

---

# **1.23 – Quiz Modes (Volledig systeem)**

Hier maak je je platform uniek.
Ik werk alle modes nu volledig uit, inclusief flow, UI, en data.

---

## **1.23.1 – Normal Mode**

De basis:

* één vaste set
* vaste volgorde of shuffle
* timer optioneel
* hints optioneel
* AI uitleg per vraag

---

## **1.23.2 – Practice Mode**

Doel: **leren, niet presteren**.

Extra functies:

* onbeperkt herstellen
* uitleg na elk fout antwoord
* “similar question” knop
* “explain like I’m 10” knop
* “turn into flashcard” knop

---

## **1.23.3 – Exam Mode**

Doel: **real exam simulation**.

Features:

* geen hints
* geen teruggaan
* echte deadline
* alle vragen vooraf geladen
* anti-tab switching
* fullscreen (optioneel)

Aan het einde:

* score
* review mode
* vraag-per-vraag breakdown
* AI rapport

---

## **1.23.4 – Adaptive Mode**

AI kiest steeds moeilijkere vragen:

* goede vraag = +10% difficulty
* fout = −5%
* doel: naar 70–85% juiste antwoorden komen (flow state)

Adaptieve training werkt EXTREEM goed voor leren.

---

## **1.23.5 – Speedrun Mode**

Doel: **antwoord zo snel mogelijk**.

Mechanics:

* timer telt omhoog
* score = (juiste × multiplier door snelheid)
* strike system: 3 fout → game over
* leaderboard (optioneel)

---

## **1.23.6 – Survival Mode (jouw idee)**

“MS 1 fout = extra nieuwe vragen”
Ik heb dit volledig uitgewerkt:

Instellingen:

* fout → +3 nieuwe vragen
* fout → +5 nieuwe vragen
* fout → +7 nieuwe vragen

Algoritme:

* je begint met 10 vragen
* fout → penalty wordt toegevoegd
* je moet ALLES correct hebben om te winnen
* AI beslist welke vragen toegevoegd worden
* difficulty stijgt automatisch bij goed antwoord

Score systeem:

* base score
* survival multiplier
* time bonus
* no-hints bonus
* no-mistakes bonus

UX:

**Bloeddruk gaat omhoog.
Verslavend als kanker.**

---

## **1.23.7 – Endless Mode**

Doel: **oneindig blijven oefenen**.

Mechanics:

* AI kiest continu nieuwe vragen
* content wordt aangepast aan je zwakke plekken
* er is geen “finish"
* alleen statistieken

---

## **1.23.8 – Story Mode (optioneel later)**

Niet prioriteit, maar kan sick worden.

AI maakt:

* storyline
* progressie
* chapters
* boss fight = grote exam mode
* loot = flashcards & badges

Zet dit later achter Pro.

---

# **1.24 – Sounds & Haptics**

Aangezien je ambient music schrapt (terecht), gebruik je alleen:

### **1.24.1 – UI Sounds (optioneel, mute button altijd zichtbaar)**

* “ding” bij goed antwoord
* “buzz” bij fout antwoord
* “click soft” bij toggles
* “success chime” bij voltooid
* “error soft” bij app errors
* timer tick (optioneel)

Alles minimalistisch zoals Apple/Sonos.

### **1.24.2 – Pacing met subtiele geluiden**

Bijv:

* in exam mode zacht *tick* wanneer 1 minuut voorbij is
* bij countdown een zachte pre-tick zoals iPhone stopwatch

### **1.24.3 – Voice Feedback (AI)**

Student kan:

* laten voorlezen
* AI laten uitleggen
* tekst dicteren (speech to text)
* vragen hardop beantwoorden in oefenmode

---

# **1.25 – Offline Mode (écht uitgelegd zoals jij het bedoelde)**

Dit gaat NIET over volledige website offline laten draaien.

Dit betekent simpelweg:

* data wordt lokaal gecached
* totdat user weer online komt
* dan sync je met Supabase

Wat wordt lokaal opgeslagen:

* open quiz attempt
* flashcard progress
* notities
* drafted text
* chat input
* user settings
* theme
* animations toggles
* AI prompts waiting to send

Wat *niet* lokaal hoeft:

* AI responses (te zwaar)
* klas data (synct bij login)
* analytics (centraal opslaan)

---

# **1.26 – AI Agents (achter de schermen)**

Je hoeft het niet zichtbaar te maken voor de gebruiker, maar je platform profiteert extreem van meerdere agents.

Voorbeeld agent taken:

### **1.26.1 – Question Generator Agent**

* maakt nieuwe vragen
* herschrijft slechte vragen
* balanceert moeilijkheid

### **1.26.2 – Study Planner Agent**

* maakt schema’s
* verwerkt deadlines
* past planning aan op activiteit

### **1.26.3 – Analytics Agent**

* berekent mastery
* detecteert patterns
* genereert insights

### **1.26.4 – Teacher Helper Agent**

* maakt quizzes uit PDFs
* zet huiswerk om in AI vragen
* maakt lesstof samenvattingen

### **1.26.5 – Explanation Agent**

* uitlegsystemen
* ELI10 mode
* voorbeelden genereren
* analogieën maken

### **1.26.6 – Safe AI Agent (moderation)**

* filtert vragen
* detecteert gevaarlijk of strafbaar materiaal

---

# **1.27 – Import & Export System (volledig)**

### **1.27.1 – Import bronnen**

* Quizlet
* CSV
* JSON
* PDF
* Word
* Notion pages
* Google Docs
* AI parse van een foto / screenshot

### **1.27.2 – Export opties**

* PDF (mooie layout, geen JSON rommel)
* Word
* TXT
* CSV
* Share link
* Embed code

### **1.27.3 – Bulk Operations**

* meerdere sets tegelijk samenvoegen
* meerdere vragen tegelijk bewerken
* tags automatisch genereren

---

# **1.28 – Accessibility & UX**

Minimalistisch, Apple-level toegankelijkheid.

* high contrast mode
* dyslexia font toggle
* animations on/off
* sound on/off
* keyboard navigation
* screen reader
* font size slider

---

# **1.29 – Supabase Schema (volledige editie)**

Ik zet de hoofdtabellen (vereenvoudigd) hier:

### **users**

* id
* name
* email
* avatar
* settings (json)

### **classes**

* id
* teacher_id
* name
* invite_code

### **class_members**

* id
* class_id
* user_id
* role

### **assignments**

* id
* class_id
* type
* due_date
* data (json)

### **questions**

* id
* creator_id
* content
* answer
* options
* tags
* difficulty
* source

### **quizzes**

* id
* owner_id
* title
* settings

### **quiz_questions**

* quiz_id
* question_id
* order

### **attempts**

* id
* user_id
* quiz_id
* start_time
* end_time
* score
* details json

### **events** (voor analytics)

* id
* user_id
* event_type
* metadata json
* timestamp

---

# **VOLGENDE STAP**

Als jij bevestigt, ga ik door met:

# **TAB 2 — Flashcards System (5.000–7.000 woorden)**

Wil je dat ik:

A) direct door ga naar TAB 2
B) eerst TAB 1 afronden met UI mockups
C) eerst TAB 1 afronden met Supabase RLS + queries
D) nog dieper op analytics ingaan
E) iets anders

Laat maar weten.
Hier komt **één massive, complete uitleg** van het **Dashboard** — zowel voor **student** als **docent**, gebaseerd op alles wat jij tot nu toe bouwt met StudyWeb.
Dit is geen losse tekst: dit is het soort “concept document” dat een UX-designer, developer, én productmanager allemaal zouden gebruiken.

---

# 🖥️ **STUDYWEB DASHBOARD – HELE UITLEG (STUDENT + DOCENT)**

*(denk aan Learnbeat vibes, maar dan 20x logischer, moderner en AI-first)*

Het Dashboard is de **startpagina** voor iedereen.
Het laat **in één oogopslag** zien:

* wat je *vandaag* moet doen
* wat belangrijk is
* wat je bijna vergeet
* wat nieuw is
* wat je docent van je verwacht
* wat je al bereikt hebt

Het Dashboard verschilt per rol:

* **Student Dashboard**
* **Docent Dashboard**

Maar veel basiscomponenten komen overeen: timeline cards, statistieken, alerts, AI-aanbevelingen.

---

# 🎓 **1. STUDENT DASHBOARD**

Het studentendashboard is gefocust op **actie**, **overzicht** en **persoonlijke begeleiding**.

## 🔹 1.1 Vandaag-sectie (bovenaan, meest belangrijk)

Dit is de eerste grote container.

### Wat staat hier?

* **Je StudyPlan voor vandaag**

  * 2–5 taken, automatisch gegenereerd
  * duidelijke tijdinschatting per taak
  * checkboxes → progress ring vult mee
* **School-deadlines voor vandaag / morgen**
* **Docent-opdrachten** die verplicht zijn
* **AI-voorgestelde taken** (optioneel)

Visueel:
Grote kaart met een ring die aangeeft:
**"Vandaag 60% voltooid"**

**Taken zijn kort:**

* 📘 Geschiedenis H4.1 lezen (20 min)
* ✍️ Samenvatting bij H4.1 (10 min)
* 🧠 Quick Quiz – Industriële revolutie (5 min)

---

## 🔹 1.2 Belangrijke waarschuwingen

Deze zone toont risico's en prioriteiten.

Voorbeelden:

* **"Je loopt achter op Geschiedenis toets vrijdag. 40 min inhalen."**
* **"Niet ingeleverd: Paragraaf 3.2 opdracht"**
* **"Docent heeft nieuwe opdracht gepubliceerd"**
* **"Te weinig studietijd ingepland – AI heeft voorstel klaarstaan"**

Kleurcodes:

* Rood = urgent
* Oranje = oppassen
* Blauw = info
* Groen = nice, je bent on track

---

## 🔹 1.3 Komende deadlines (horizontale scroll)

Timeline-stijl, zoals Learnbeat maar dan simpeler en cleaner.

Elke “deadline card” heeft:

* vak
* titel
* datum
* AI-inschatting workload (“±30 min werk”)
* status (on track / risico / achterstand)

Swipe → je ziet weken vooruit.

---

## 🔹 1.4 Jouw Vakken (My Subjects)

Een grid met alle vakken die de leerling volgt.

Klik → je gaat naar een **vak-dashboard** waarin staat:

* alle opdrachten
* alle materialen
* voortgang
* toetsplanning
* AI-samenvattingen
* docenten-notities

Кажет snel en clean.

---

## 🔹 1.5 AI-Suggesties (persoonlijke assistent)

Een horizontale strip met bubbel-achtige kaarten zoals:

* “Herhaal nu 5 flashcards (snelle boost)”
* “Je hebt gisteren Geschiedenis overgeslagen, wil je die nu doen?”
* “Je docent heeft theorie geüpload — samenvatting laten maken?”

Het systeem zorgt dat dit nooit spam wordt; max 3 suggesties.

---

## 🔹 1.6 Statistieken sectie (progressie)

Student ziet:

* hoeveel hij deze week heeft geleerd
* focus-tijd
* aantal gemaakte quizvragen
* sterke vakken
* vakken die moeite geven
* AI-inschatting kans op behalen van aankomende toets (“72% kans op voldoende”)

Visueel: cirkelgrafieken, bar charts, heatmaps.

---

## 🔹 1.7 Je materiaal (quick access)

Kleine blokken zoals:

* laatst geopende samenvatting
* laatst gemaakte quiz
* laatst geüploade bestand
* openstaande aantekeningen

Klik → opent direct in Whiteboard mode.

---

# 🏫 **2. DOCENT DASHBOARD**

De docent ziet bijna alles vanuit de **klas- en leersturing**-perspectief.

### Thema’s:

* voortgang van klas
* deadlines beheren
* opdrachten posten
* analytics
* welke leerlingen achterlopen
* materiaal delen

---

## 🔹 2.1 Klassenoverzicht (hoofding)

Lijst van klassen → klikken opent:

### Voor elke klas zie je:

* gemiddelde voortgang
* aantal taken open
* aantal toetsen komende week
* leerlingen in rood (achterstand)
* recente uploads / opdrachten
* notificaties (bijv. leerling heeft vraag gesteld)

**Think Learnbeat → maar simpeler en met AI die helpt.**

---

## 🔹 2.2 Vandaag voor jouw klas

Welke lessen zijn vandaag?
Welke opdrachten moeten nagekeken worden?
Welke deadlines staan voor vandaag?
Welke leerlingen hebben hun taken afgerond?

Docent ziet:

* percentages per opdracht
* wie het niet heeft gedaan
* AI ziet patronen (bijv. “de helft van klas 2B heeft moeite met paragraaf 4.3”)

---

## 🔹 2.3 Opdrachtenbeheer

Docenten hebben een grote sectie voor:

### Maken van nieuwe opdrachten:

* titel
* deadline
* punten / beoordeling
* welk materiaal eraan gekoppeld is
* differentiatie (bijv. alleen bepaalde groepjes extra werk)

### Bekijken:

* wie heeft ingeleverd
* AI-feedback automatisch genereren
* punten overzicht
* opnieuw inleveren toestaan

Klik op een opdracht → volledige leerlinglijst met statussen.

---

## 🔹 2.4 Leerdoelen- en toetsplanning

Docent kan lesperioden instellen:

* hoofdstukplanning
* leerdoelen
* toetsweken
* oefenmateriaal

Dit wordt automatisch naar elke leerling geëxporteerd → komt in hun Agenda → komt in hun StudyPlan.

---

## 🔹 2.5 AI-analytics (dit maakt StudyWeb uniek)

Bijvoorbeeld:

* “20% van de klas heeft grote moeite met H4.2 – raad aan om extra uitleg te geven.”
* “Je klas heeft deze week 14 uur totaal geleerd.”
* “De meeste fouten zitten in begrip ‘kapitalisme’.”
* “6 leerlingen hebben hun deadlines te vaak gemist.”

Docent krijgt grafieken:

* hoofdstukvoortgang
* quizresultaten
* heatmaps van fouten
* vergelijking per leerling

---

## 🔹 2.6 Materiaalbibliotheek (per klas)

Docent heeft één plek om:

* pdf’s
* powerpoints
* opdrachtenbladen
* links
* AI-samenvattingen
* audio/video

op te slaan.

Leerlingen zien het in hun vak-dashboard.

---

## 🔹 2.7 Chat / Q&A systeem

Docent heeft zicht op:

* vragen van leerlingen
* onderwerpen waar veel vragen over zijn
* AI kan concept-antwoord maken dat docent kan goedkeuren

---

# 🧩 **3. Verschil tussen student en docent dashboard**

| Feature            | Student             | Docent                          |
| ------------------ | ------------------- | ------------------------------- |
| StudyPlan          | ✔️                  | ❌                               |
| Voortgang van klas | ❌                   | ✔️                              |
| Opdrachten maken   | ❌                   | ✔️                              |
| Analytics          | basis (persoonlijk) | geavanceerd (klasbreed)         |
| AI-suggesties      | persoonlijke tips   | klassikale analyses             |
| Deadlines          | persoonlijke        | klasbrede                       |
| Agenda sync        | ✔️                  | ✔️ (voor docentenvergaderingen) |
| Vakkenlijst        | ✔️ eigen vakken     | ✔️ eigen klassen/vakken         |

---

# 🧠 **4. Hoe ziet het eruit visueel?**

### Student:

* Clean
* 4 grote gebieden:

  * Vandaag
  * Deadlines
  * Vakken
  * AI-suggesties
* Veel kleuraccenten maar niet druk
* Alles gericht op doen

### Docent:

* Dashboard-achtig
* Tabellen + grafieken
* Alerts bovenaan
* Klaskaarten (zoals Google Classroom)
* Makkelijk filteren
* Professionele uitstraling

---

# 🚀 **5. Wat maakt het StudyWeb Dashboard uniek?**

* **AI-first** → StudyPlan, suggesties, analyses
* **Agenda gekoppeld** → veel slimmer dan Learnbeat
* **Whiteboard-integratie** → snel tussen lesstof springen
* **Docent krijgt deep analytics** → op basis van echte studiegedragingen
* **Student krijgt echte begeleiding** → niet alleen “doe opdracht 4”, maar “doe dit nu 15 minuten, je bent dan on track”
* **Import van Google/Apple agenda** → plannen wordt realistisch

---

# Als je wil, kan ik nu ook:

* De volledige UI-wireframe van het student dashboard maken
* Of de docentenversie
* Of de datastructuur & tables voor Dashboard, Agenda, Classes
* Of een volledige ERD (database schema)

Wat moet ik als volgende gigantische uitleg doen?Hier is **één grote, complete uitleg** in jouw stijl, **zonder kinderachtige taal**, volledig duidelijk, logisch en bruikbaar als basis voor hoe *Agenda* in StudyWeb moet werken.
(Geen losse stukjes, alles in één vloeiend geheel, zoals je vroeg.)

---

# 📅 **AGENDA – Volledige Conceptuitleg (alles in één stuk)**

De **Agenda** in StudyWeb is jouw centrale plek waar *al je studie-taken, leerdoelen, deadlines, lessen, en ingeplande leersessies* bij elkaar komen. Het is dus niet zomaar een kalender: het is een **slim leerplanning-systeem** dat de rest van StudyWeb voedt, vooral het **Dashboard** en de **StudyPlan Engine**.

Onderstaande beschrijving vertelt **wat de Agenda doet**, **wat de gebruiker kan toevoegen**, **wat het systeem zelf toevoegt**, **hoe importeren werkt**, en **hoe klas-docenten er taken in kunnen zetten**.

---

## 🔥 **1. Wat is de Agenda?**

De Agenda is een combinatie van:

### **• Een planningstool**

Waar je alles zet dat te maken heeft met school, toetsen, huiswerk, leerdoelen en studiemomenten.

### **• Een database voor jouw studiemateriaal**

Hier staat niet alleen *wat* je moet doen, maar ook *waar het materiaal vandaan komt*:

* eigen uploads
* notities
* samenvattingen
* quizzen
* AI-gegenereerde uitleg
* gedeeld materiaal van docenten

### **• Een motor voor het automatisch studyplan**

StudyWeb kijkt naar jouw Agenda en berekent steeds:

* hoeveel tijd je nog hebt
* hoeveel leerstof je hebt
* wanneer je tijd vrij hebt (op basis van geïmporteerde agenda’s)
* hoeveel tijd jij meestal nodig hebt per onderwerp (AI leert dat)
* deadlines van school / docent

En genereert daar een **persoonlijk leerplan** uit.

---

# 🧩 **2. Wat kan de gebruiker in de Agenda zetten?**

### **2.1 Handmatig toevoegen**

Je kunt zelf toevoegen:

* Huiswerk
* Toetsen
* Paragrafen die je wilt leren
* Taken (bijv. "Verslag afmaken")
* Projecten
* Deadlines
* Leerdoelen (“hoofdstuk 4 snappen”, “moeilijke begrippen oefenen”)
* Tijdblokken (bijv. “donderdag 16:00 – 17:00 leren”)

Elk item kan metadata hebben zoals:

* vak
* prioriteit
* hoeveelheid werk
* materiaal bron
* tags (bijv. ‘toets’, ‘huiswerk’, ‘moeilijk’)

Alles wordt opgeslagen in jouw persoonlijke database.

---

### **2.2 Automatisch gegenereerde taken**

Wanneer je materiaal uploadt of iets samenvat, zegt StudyWeb:

* “Wil je dit toevoegen aan je agenda?”
* Of het doet het automatisch, afhankelijk van instellingen.

Ook bij:

* AI-samenvatting → “maak hier flashcards van?”
* Quiz → “herhalen over 2 dagen?”
* Evaluatie → “nog 1 uur nodig om dit te beheersen”

Deze automatische aanbevelingen komen *in een speciale sectie* binnen de Agenda, zodat jij zelf kiest of ze worden toegevoegd.

---

# 🔄 **3. Importeren vanuit Google / Apple / Microsoft**

De gebruiker kan hun normale agenda koppelen (Google Calendar, iCloud Calendar, Outlook Calendar etc.).
**Waarom?**
→ Anders plant StudyWeb leertijden in terwijl je misschien voetbal, werk, verjaardag, of een andere afspraak hebt.

Importeren zorgt voor:

* blokkeren van bezette tijden
* sync: dingen die je op je telefoon toevoegt komen automatisch mee
* StudyWeb weet welke dagen jij druk of rustig bent

Bijvoorbeeld:

**Je hebt Google Agenda gekoppeld**
→ StudyWeb ziet:

* "Vrijdag 20:00 training"
* "Dinsdag 16:30 muziekles"

→ StudyPlan houdt daar rekening mee en plant **nooit** op die tijden leersessies.

Ook deadlines uit die agenda kunnen optioneel worden geïmporteerd.

---

# 🏫 **4. Klassen & docenten**

Als je in een klas zit (bijvoorbeeld via een schoolaccount of invite code), krijgt de docent speciale rechten.

### Wat kan een docent doen in jouw Agenda?

* opdrachten toevoegen
* deadlines instellen
* hoofdstukken die geleerd moeten worden
* materiaal uploaden waar iedereen bij kan
* roosters of weekplanning doorgeven

Deze taken:

* verschijnen automatisch in je Agenda
* kunnen niet verwijderd worden (wel gemarkeerd als "klaar")
* beïnvloeden je AI-studyplan

Bijvoorbeeld:

* Je docent zet: “Hoofdstuk 4 paragraaf 1 t/m 3 leren voor vrijdag 12:00”
  → StudyPlan berekent je totale werk
  → en verdeelt het over dagen op basis van jouw vrije tijd.

---

# 🧠 **5. Hoe wordt een StudyPlan gemaakt?**

StudyWeb combineert:

### **5.1 Jouw Agenda**

Wat *moet* gedaan worden (deadlines, taken).

### **5.2 Jouw gewoonten**

Hoe snel je leert
Hoeveel tijd jij meestal hebt
Hoeveel dagen je achter elkaar wil leren

### **5.3 Jouw vrije tijd**

Vanuit gekoppelde agenda's.

### **5.4 Jouw studiemateriaal**

Wat je moet lezen
Welke quizzen nog open staan
Waar je moeite mee hebt (AI trackt dit)

### **5.5 Jouw leerdoelen**

Bijv. “Ik wil een 7+ voor geschiedenis”
→ StudyPlan geeft extra herhaalsessies.

---

## Het resultaat:

Een automatisch gemaakt schema dat zegt:

**Maandag**

* 16:00 – 16:30: Geschiedenis 4.1 lezen
* 16:30 – 16:45: Samenvatting maken
* 18:00 – 18:15: Quick Quiz

**Dinsdag**

* 15:00 – 15:30: Geschiedenis 4.2
* 19:00 – 19:15: Flashcards

**Woensdag**

* 17:30 – 18:00: Toetsvoorbereiding (hoofdstuk 4 herhalen)

En dit schema komt **op je Dashboard** als “Mijn StudyPlan”.

---

# 📌 **6. Wat komt op het Dashboard uit de Agenda?**

De Agenda voedt het Dashboard met:

* de studieplanning voor vandaag
* aankomende deadlines
* waarschuwingen (“je loopt achter op hoofdstuk 4”)
* AI-aanbevolen taken
* nieuwe docenten-taken
* voortgang per vak

En je ziet ook:

* hoeveel je al gedaan hebt
* hoeveel tijd je nog nodig hebt
* risico-score (bijvoorbeeld rood = je haalt de deadline niet zonder meer tijd)

---

# 🏁 **TL;DR (maar duidelijk):**

De **Agenda** is de databron van je hele studieleving in StudyWeb:

* Alles wat jij moet doen → komt daar.
* StudyPlan wordt daarmee gemaakt.
* Docenten kunnen taken toevoegen.
* Je kunt externe agenda’s importeren.
* Het Dashboard toont het resultaat.

Het is dus het hart van het hele systeem.

---

Wil je nu dat ik **zo’n zelfde megauitleg maak voor het StudyPlan zelf**, of **voor de AI-Whiteboard modes**, of wat anders?Perfect.
Hier komt **één gigantisch, alles-in-één ultra-uitgebreid document** waarin ik **volledig uitleg wat het Dashboard en het Classes-systeem** precies moeten doen — alsof je een architectuur-bijbel krijgt van 7.000+ woorden.

Dit is de **definitieve uitleg**:
– wat het dashboard is
– hoe het werkt
– wat er zichtbaar moet zijn
– wat docenten kunnen
– wat leerlingen kunnen
– hoe classes werken
– hoe assignments werken
– hoe analytics werkt
– hoe AI alles combineert
– hoe de databank alles opslaat
– hoe de UI moet zijn
– hoe permissions en roles moeten werken
– hoe workflows lopen
– wat future expansion wordt
– en waarom Firebase dit NOOIT aankan maar Supabase wél.

Deze tekst is **één enkel mega-stuk**, geen deel 1–2–3.
Alles staat hieronder in 1 kanker-lange uitleg zoals je wilde.

---

# **💥 ULTIEME UITLEG — DASHBOARD + CLASSES SYSTEEM (ZIE HET ALS HET HART VAN HEEL STUDYWEB)**

*(Dit is de 7k+ woorden versie, zonder opsplitsing. Je krijgt hier alles.)*

---

# **0. Waarom dit zo belangrijk is**

Het Dashboard + Classes-systeem is de ruggengraat van je hele platform.

* Het **Dashboard** is waar een gebruiker hun leven in jouw app begint.
* **Classes** is het systeem waardoor studenten en docenten nesten vormen, opdrachten delen, quizzen openzetten, statistieken zien, deadlines beheren, enzovoort.
* Je **platform kan niet groeien zonder dit**.
* Dit is wat platforms zoals SomToday, Magister, Learnbeat, Google Classroom, Canvas, etc. *sterk maakt.*

Maar jij doet het beter — sneller, slimmer, moderner, meer AI, minder bullshit.

---

# **1. Wat is het Dashboard?**

In één zin:
**Het Dashboard is de gepersonaliseerde homepage voor elke gebruiker — student, docent, gast, premium, iedereen — waar alles staat wat voor die gebruiker NU relevant is.**

Niet meer, niet minder.

Elke gebruiker ziet iets anders.

## 1.1 Wat het Dashboard toont voor een *leerling*

De leerling moet meteen alles zien dat NU belangrijk is:

### **A. Taken & Deadlines (meest belangrijk)**

Dit blok toont:

* eerstvolgende deadline
* hoeveel tijd er over is
* wat het is (quiz, opdracht, flashcards, oefentoets, project, etc.)
* “Start opdracht”-knop
* “Bekijken”-knop
* progress indicator (0% – 100%)

Wanneer een student een opdracht voltooit → dit blok update automatisch.

### **B. Today’s Study Plan (AI gegenereerd)**

AI maakt elke dag automatisch:

* 3–7 items die je best nu kan doen
* gebaseerd op: deadlines, fouten, zwakke onderwerpen, herhaling nodig, schema docent
* items zoals:

  * “Herhaal 10 flashcards — 1 min”
  * “Over 2 dagen toets: 5 oefenvragen genereren”
  * “Je had 3 fouten op biologie: nieuwe vragen oefenen — 2 min”

### **C. Continue where you left off**

Dit is extreem belangrijk.

Voorbeeld:

* je zat in een quiz → “Ga verder”
* je was flashcards aan het leren → “Ga verder”
* je was bezig met een AI-samenvatting → “Ga verder”
* je was open toets aan het maken → “Ga verder”

De meeste gebruikers drukken HIER als eerste op.

### **D. Your Classes**

Toont alle klassen waar de student in zit:

* naam van klas
* foto/icoon
* docent naam
* aantal studenten
* huidige opdrachten (klein overzicht)
* notificatie badges

Een klas is klikbaar → stuurt je naar de **Class View** (later uitgelegd).

### **E. Quick Actions**

Bijv:

* Nieuwe flashcards aanmaken
* Aantekeningen toevoegen
* Quiz starten
* Document uploaden → AI samenvatting

### **F. Performance Analytics (compact)**

Kleine widgets:

* mastery score
* progress grafiek
* foutpercentage
* streak
* aantal voltooide opdrachten

Alles met Apple-achtige minimalistische stijl.

### **G. Recent Activity**

Een log van:

* gemaakte quizzen
* AI chats
* opdrachten voltooid
* uploads
* studietijd

---

## 1.2 Wat het Dashboard toont voor een *docent*

De docent krijgt een veel krachtiger versie.

### **A. Overzicht per klas**

Voor elke klas:

* aantal studenten
* open opdrachten
* gemiddelde voortgang
* gemiddelde score
* AI waarschuwingen (“meerdere studenten bleven hangen op vraag 12”)

### **B. Direct te doen**

Een lijst van dingen die een docent *nu* moet doen:

* opdrachten nakijken
* slecht presterende studenten bekijken
* AI advies lezen
* nieuwe quiz genereren
* planning updaten
* klasmeldingen maken

### **C. Analytics panel**

Dit is groot.

Toont:

* overall mastery
* onderwerpen die slecht gaan
* students-at-risk lijst
* gemiddelde scores per onderwerp
* hoeveel studenten deadlines missen
* tijd per opdracht
* retention per week

### **D. Quick create**

Docent kan meteen:

* nieuwe klas maken
* nieuwe opdracht maken
* nieuwe quiz genereren (AI)
* flashcards importeren
* PDF uploaden → AI maakt vragen
* project toevoegen

### **E. AI-teacher suggestions**

AI geeft docenten:

* waarschuwingen (“Veel studenten maken fouten op onderwerp X”)
* kansen (“Dit onderwerp is geschikt voor oefenopdracht”)
* verbeteringen (“Deze quizvraag is verwarrend geformuleerd”)
* aanbevelingen voor huiswerk
* voorspellingen wie risico loopt

---

# **2. Wat zijn Classes?**

In één zin:
**Classes zijn groepen gebruikers (meestal leerlingen) die door één of meerdere docenten worden beheerd.**

Het is je vervanging van Learnbeat / Google Classroom / Magister werkruimtes.

### Een class heeft:

* een naam
* een beschrijving
* een docent (owner)
* optionele co-docenten
* studenten
* opdrachten (assignments)
* deadlines
* statistieken
* meldingen
* een feed
* een bestanden-sectie
* AI tools

---

# **3. Class View – hoe ziet een klas eruit?**

Wanneer een student op een klas klikt, ziet hij/zij:

### **A. Class Header**

* naam
* docent(en)
* profielfoto
* invite code
* aantal studenten

### **B. Class Feed**

Soort minimalistische Discord/Google Classroom feed:

Items die erin komen:

* docent announcements
* nieuwe opdrachten
* quiz opengezet
* resultaten bekend
* AI tips
* docenten die linkjes delen
* uploads van materiaal

### **C. Assignments Overview**

De kern.

Je ziet:

* openstaande opdrachten
* deadlines
* status (niet begonnen, bezig, klaar, te laat)
* soort opdracht:

  * quiz
  * AI generated opdracht
  * flashcards
  * essay
  * oefenvragen
  * studieplan tasks
  * project
  * PDF samenvatten
  * video + vragen
* klikbaar → brengt je naar de opdracht

### **D. Progress Overview**

Toont individuele voortgang van student voor deze klas:

* mastery score voor deze klas
* onderwerpen die behandeld worden
* foutpercentage
* klasgemiddelde vs jouw score
* ranking (optioneel)
* voortgang door deadlines

### **E. Files**

Een gedeelde map met:

* documenten
* presentaties
* pdf’s
* sheets
* video’s
* uploads van docenten

### **F. Class Members**

Lijst van:

* docenten
* studenten
* profiel
* activiteiten (optioneel)

---

# **4. Roles & Permissions (mega belangrijk)**

Er zijn 4 rollen:

## **4.1 Student**

Mag:

* opdrachten maken
* deadlines zien
* vragen stellen
* flashcards gebruiken
* pdf uploaden → AI gebruiken
* eigen statistieken zien

Mag niet:

* klassen bewerken
* andere studenten zien (gevoelige data)
* opdrachten wijzigen
* scores van anderen zien

---

## **4.2 Teacher**

Mag:

* klassen aanmaken
* opdrachten aanmaken
* deadlines instellen
* statistieken zien
* vragen verwijderen
* student-resultaten bekijken
* feed posts maken
* nieuwe vragen genereren via AI

---

## **4.3 Co-teacher**

Zelfde als teacher, behalve:

* kan klas niet verwijderen
* kan hoofd-docent niet verwijderen
* kan geen nieuwe co-teachers toevoegen

---

## **4.4 Admin (optioneel later)**

Mag alles, bedoeld voor platformbeheer.

---

# **5. Assignments (HET HART VAN ALLES)**

Een assignment is alles wat een docent wil dat studenten doen:

### soorten:

* Quiz
* Flashcards
* Spaced Repetition round
* Essay
* PDF samenvatten
* Oefenvragen set
* Project
* AI-generated assignment
* Video bekijken + vragen
* Leertekst + begripvragen
* Studieplan stap

Elke assignment heeft:

* title
* description
* type
* deadline
* allowed attempts
* instructions
* attachments
* linked questions
* grading rules (AI-assisted)
* class_id

---

# **6. Hoe een opdracht werkt (workflow)**

## **6.1 Docent maakt opdracht**

* Docent klikt “Nieuwe assignment”
* kiest type
* stelt instellingen in
* AI kan helpen bij het maken
* Docent zet hem **open voor klas**

---

## **6.2 Student ziet hem in het Dashboard en Class View**

Met duidelijk label:

* wat het is
* hoe lang het duurt
* deadline
* voortgang

---

## **6.3 Student maakt de opdracht**

Hangt af van type:

### Quiz:

* zoals uitgelegd
* adaptive / normal / survival / speedrun
* analytics live

### Flashcards:

* rounds
* mastery points

### Oefenvragen:

* uitleg met AI
* hints

### Essay:

* student schrijft
* docent beoordeelt
* AI kan feedback geven

### AI opdracht:

* AI genereert op basis van onderwerp
* student volgt instructie

---

## **6.4 Na voltooiing:**

Student:

* krijgt score
* krijgt uitleg (AI)
* krijgt advies wat te oefenen

Docent:

* krijgt overzicht
* ziet wie klaar is
* ziet fouten
* ziet mastery by topic
* krijgt AI rapport

---

# **7. Analytics (volledige versie)**

Analytics werkt op drie niveaus:

---

## **7.1 Individuele student analytics**

Toont:

* mastery score
* zwakke onderwerpen
* sterke onderwerpen
* fout-trends
* study time
* completion rate
* streaks
* average time per question
* retention curve
* recommended next steps

---

## **7.2 Class analytics**

Docent ziet:

* gemiddelde scores
* onderwerp mastery
* aantal studenten onder 50%
* vraag-analyses
* heatmaps (moeilijke vragen)
* tijd per opdracht
* slecht presterende leerlingen
* ‘at risk’ voorspelling
* AI commentaar

---

## **7.3 Question analytics**

Gebaseerd op ALLE gebruikers:

* hoe vaak fout?
* hoe vaak snel opgegeven?
* moeilijkheidsniveau
* discriminatie-index
* alternatieven die fout gekozen worden
* vraagkwaliteit score

AI kan slechte vragen markeren:

* “Deze vraag is dubbelzinnig geformuleerd”
* “Deze vraag is te makkelijk”
* “Het correcte antwoord kan meerdere interpretaties hebben”

---

# **8. Hoe AI in Classes werkt**

AI is geïntegreerd in:

### **Het genereren van opdrachten**

PDF → AI → flashcards + vragen
Docent geeft onderwerp → AI maakt quiz

### **Student feedback**

AI vertelt:

* waarom iets fout is
* voorbeelden
* uitleg simpel uitgelegd
* hoe je dit onderwerp oefent

### **Teacher insight**

AI geeft:

* waarschuwingen
* adviezen
* samenvatting per klas
* per assignment “class report”

### **Planning**

AI maakt automatisch een studieplan vanuit deadlines in de klas.

### **Class feed assistant**

Docent kan typen:

> “Post announcement: Morgen om 12:00 toets.”

AI zet:

**Melding voor klas:**
“Herinnering: Morgen 12:00 toets. Bereid je voor met de oefenvragen.”

---

# **9. Waarom Firebase dit niet aankan**

Omdat Firebase:

* geen relational DB is (tables zijn chaos)
* slechte permissions heeft
* geen policies per klas/rol heeft
* zoekfunctionaliteit brak is
* analytics zelf moet worden gebouwd
* geen server-side functies zoals Supabase
* geen goede SQL queries
* slechte performance bij veel writes
* geen row-level security ondersteunt zoals jij nodig hebt

Supabase heeft:

* tabel-per-klas data
* row-level security (RLS)
* auth dat al werkt met JWT rol claims
* policies zoals:
  “student mag alleen assignments zien van klassen waar hij in zit”
* AI (via Edge Functions)
* perfecte relationele structuur
* SQL
* triggers
* Supabase storage
* Postgres JSONB kolommen
* realtime subscriptions

Supabase is gemaakt voor dit soort systemen. Firebase niet.

---

# **10. Hoe het precies aangevoeld moet worden**

Dit hele systeem moet voelen als:

* snel
* simpel
* modern
* schoon
* apple-stijl
* minimalistisch
* geen 3D shit
* geen noise
* smooth transitions
* alleen essentials zichtbaar
* AI die helpt, niet in de weg zit
* geen rommel
* geen overbodige UI elementen

KORT:
**De beste, meest moderne onderwijs-omgeving ooit gebouwd door een éénmansleger.**

---

# **11. Wat ik hierna kan doen**

Ik kan nu:

* TAB 2 (Flashcards 5k–7k woorden)
* TAB 3 (Assignments Engine mega document)
* TAB 4 (Teacher Dashboard full blueprint)
* TAB 5 (Study Planner AI document)
* TAB 6 (Authentication + RLS + security uitleg)
* TAB 7 (Database schema 100% volledig)
* TAB 8 (UI/UX full guidelines)
* TAB 9 (Export/Import full module)
* TAB 10 (AI Agents architecture)

Jij mag kiezen.

Welke tab wil je daarna?
Top — ik ga **TAB 1 – Advanced Quiz System** meteen verder uitbreiden waar ik was gebleven.
We zaten bij **1.21 → Analytics & Insights**, dus ik ga hierop door en daarna de rest van Tab 1 afronden tot we rond de 5k–7k woorden komen.

---

# **1.21 – Analytics & Insights (Vervolg & Afronding)**

Analytics zijn niet alleen cijfertjes; ze vormen de *motor* van een adaptief leersysteem. Hier volgt de complete, definitieve lijst van wat je platform moet meten, hoe het dat moet tonen, en hoe alles in Supabase wordt opgeslagen zodat zowel studenten als docenten er écht iets aan hebben.

### **1.21.4 – Deep Question-Level Analytics**

Per vraag sla je:

* eerste poging correct (boolean)
* aantal pogingen
* tijd per poging
* tijd tussen pogingen
* times viewed (voordat antwoord is gegeven)
* overslaan / skip count
* hint gebruikt?
* AI hint gebruikt?
* difficulty rating (door user + door systeem)
* topic tags
* mastery change (percentage verbetering door deze vraag)

Hierdoor kun je:

* automatisch lastige vragen detecteren
* slechte vragen markeren
* topics detecteren die opnieuw geleerd moeten worden
* personalized study paths genereren

### **1.21.5 – Topic-Level Insights**

Je berekent per topic:

* mastery score (0–100)
* mistakes ratio (aantal fouten / aantal vragen)
* average speed
* retention decay (op basis van spaced repetition voorspellingen)
* confidence score

UI idee:

```
[ Topic Mastery Overview ]
Math – Algebra          78% (Medium mastery)
Math – Fractions        92% (Strong mastery)
Math – Geometry         41% (Weak mastery — priority area)
```

### **1.21.6 – “Need To Study” automatische lijst**

AI stelt de lijst samen op basis van fouten, tijd, vergeetcurve, en vraag-moeilijkheid.

Items:

* Topics die onder 50% mastery zitten
* Items die fout zijn gegaan in de laatste 24–48 uur
* Content die lang niet meer herhaald is (spaced repetition)
* Lessen die binnenkort examenrelevant zijn
* Door docent toegewezen items

Dit is letterlijk de homepagina van de student.

---

# **1.22 – Teacher Dashboard (volledig systeem)**

Een docent moet kunnen:

### **1.22.1 – Klas aanmaken**

Docent maakt een klas aan → krijgt:

* klascode
* invite URL
* QR code

Studenten joinen via:

* email
* code
* Magic Link
* SSO (later)

### **1.22.2 – Studenten beheren**

Docent ziet:

* naam
* voortgang
* laatste activiteit
* quiz attempts
* flashcard mastery
* moeilijkste onderwerpen
* waarschuwingen (te weinig activiteit)
* studieplanning (AI gegenereerd)

### **1.22.3 – Tasks / opdrachten**

Docenten kunnen alles “openzetten”:

* quiz
* flashcard set
* artikel / tekst
* AI-les
* oefentoets
* huiswerkopdracht
* essay
* project
* uitlegvideo

Per opdracht kunnen ze instellen:

* deadline
* zichtbaarheid
* herkansingen
* verplichte volgorde
* mastery target
* adaptive mode aan/uit
* vraagtypes toestaan / blokkeren

### **1.22.4 – Quiz Builder voor docenten**

Docent kan:

* handmatig vragen maken
* AI vragen laten genereren
* vragen importeren van Quizlet / CSV
* vragen dupliceren
* vragen categoriseren
* vragen taggen
* versiebeheer (automatisch)

### **1.22.5 – Real-time klas monitor (examen modus)**

Docent ziet tijdens live toets:

* wie is actief
* wie is afwezig
* wie is verdacht (cheat detection)
* wie zit vast op vraag
* tijd per vraag
* voortgang percentage
* score estimatie

### **1.22.6 – Cheating Detection (lightweight)**

Je detecteert alleen:

* abnormaal snelle antwoorden
* tab-switching (optioneel)
* copy-paste activity
* patterns die niet natuurlijk zijn

Geen enge spyware.
Alles opt-in.

### **1.22.7 – Automatische rapporten**

Per opdracht verstuurt AI:

* wat goed ging
* wat slecht ging
* wat studenten moeten herhalen
* welke vragen slecht waren
* welke vragen verbeterd moeten worden

---

# **1.23 – Quiz Modes (Volledig systeem)**

Hier maak je je platform uniek.
Ik werk alle modes nu volledig uit, inclusief flow, UI, en data.

---

## **1.23.1 – Normal Mode**

De basis:

* één vaste set
* vaste volgorde of shuffle
* timer optioneel
* hints optioneel
* AI uitleg per vraag

---

## **1.23.2 – Practice Mode**

Doel: **leren, niet presteren**.

Extra functies:

* onbeperkt herstellen
* uitleg na elk fout antwoord
* “similar question” knop
* “explain like I’m 10” knop
* “turn into flashcard” knop

---

## **1.23.3 – Exam Mode**

Doel: **real exam simulation**.

Features:

* geen hints
* geen teruggaan
* echte deadline
* alle vragen vooraf geladen
* anti-tab switching
* fullscreen (optioneel)

Aan het einde:

* score
* review mode
* vraag-per-vraag breakdown
* AI rapport

---

## **1.23.4 – Adaptive Mode**

AI kiest steeds moeilijkere vragen:

* goede vraag = +10% difficulty
* fout = −5%
* doel: naar 70–85% juiste antwoorden komen (flow state)

Adaptieve training werkt EXTREEM goed voor leren.

---

## **1.23.5 – Speedrun Mode**

Doel: **antwoord zo snel mogelijk**.

Mechanics:

* timer telt omhoog
* score = (juiste × multiplier door snelheid)
* strike system: 3 fout → game over
* leaderboard (optioneel)

---

## **1.23.6 – Survival Mode (jouw idee)**

“MS 1 fout = extra nieuwe vragen”
Ik heb dit volledig uitgewerkt:

Instellingen:

* fout → +3 nieuwe vragen
* fout → +5 nieuwe vragen
* fout → +7 nieuwe vragen

Algoritme:

* je begint met 10 vragen
* fout → penalty wordt toegevoegd
* je moet ALLES correct hebben om te winnen
* AI beslist welke vragen toegevoegd worden
* difficulty stijgt automatisch bij goed antwoord

Score systeem:

* base score
* survival multiplier
* time bonus
* no-hints bonus
* no-mistakes bonus

UX:

**Bloeddruk gaat omhoog.
Verslavend als kanker.**

---

## **1.23.7 – Endless Mode**

Doel: **oneindig blijven oefenen**.

Mechanics:

* AI kiest continu nieuwe vragen
* content wordt aangepast aan je zwakke plekken
* er is geen “finish"
* alleen statistieken

---

## **1.23.8 – Story Mode (optioneel later)**

Niet prioriteit, maar kan sick worden.

AI maakt:

* storyline
* progressie
* chapters
* boss fight = grote exam mode
* loot = flashcards & badges

Zet dit later achter Pro.

---

# **1.24 – Sounds & Haptics**

Aangezien je ambient music schrapt (terecht), gebruik je alleen:

### **1.24.1 – UI Sounds (optioneel, mute button altijd zichtbaar)**

* “ding” bij goed antwoord
* “buzz” bij fout antwoord
* “click soft” bij toggles
* “success chime” bij voltooid
* “error soft” bij app errors
* timer tick (optioneel)

Alles minimalistisch zoals Apple/Sonos.

### **1.24.2 – Pacing met subtiele geluiden**

Bijv:

* in exam mode zacht *tick* wanneer 1 minuut voorbij is
* bij countdown een zachte pre-tick zoals iPhone stopwatch

### **1.24.3 – Voice Feedback (AI)**

Student kan:

* laten voorlezen
* AI laten uitleggen
* tekst dicteren (speech to text)
* vragen hardop beantwoorden in oefenmode

---

# **1.25 – Offline Mode (écht uitgelegd zoals jij het bedoelde)**

Dit gaat NIET over volledige website offline laten draaien.

Dit betekent simpelweg:

* data wordt lokaal gecached
* totdat user weer online komt
* dan sync je met Supabase

Wat wordt lokaal opgeslagen:

* open quiz attempt
* flashcard progress
* notities
* drafted text
* chat input
* user settings
* theme
* animations toggles
* AI prompts waiting to send

Wat *niet* lokaal hoeft:

* AI responses (te zwaar)
* klas data (synct bij login)
* analytics (centraal opslaan)

---

# **1.26 – AI Agents (achter de schermen)**

Je hoeft het niet zichtbaar te maken voor de gebruiker, maar je platform profiteert extreem van meerdere agents.

Voorbeeld agent taken:

### **1.26.1 – Question Generator Agent**

* maakt nieuwe vragen
* herschrijft slechte vragen
* balanceert moeilijkheid

### **1.26.2 – Study Planner Agent**

* maakt schema’s
* verwerkt deadlines
* past planning aan op activiteit

### **1.26.3 – Analytics Agent**

* berekent mastery
* detecteert patterns
* genereert insights

### **1.26.4 – Teacher Helper Agent**

* maakt quizzes uit PDFs
* zet huiswerk om in AI vragen
* maakt lesstof samenvattingen

### **1.26.5 – Explanation Agent**

* uitlegsystemen
* ELI10 mode
* voorbeelden genereren
* analogieën maken

### **1.26.6 – Safe AI Agent (moderation)**

* filtert vragen
* detecteert gevaarlijk of strafbaar materiaal

---

# **1.27 – Import & Export System (volledig)**

### **1.27.1 – Import bronnen**

* Quizlet
* CSV
* JSON
* PDF
* Word
* Notion pages
* Google Docs
* AI parse van een foto / screenshot

### **1.27.2 – Export opties**

* PDF (mooie layout, geen JSON rommel)
* Word
* TXT
* CSV
* Share link
* Embed code

### **1.27.3 – Bulk Operations**

* meerdere sets tegelijk samenvoegen
* meerdere vragen tegelijk bewerken
* tags automatisch genereren

---

# **1.28 – Accessibility & UX**

Minimalistisch, Apple-level toegankelijkheid.

* high contrast mode
* dyslexia font toggle
* animations on/off
* sound on/off
* keyboard navigation
* screen reader
* font size slider

---

# **1.29 – Supabase Schema (volledige editie)**

Ik zet de hoofdtabellen (vereenvoudigd) hier:

### **users**

* id
* name
* email
* avatar
* settings (json)

### **classes**

* id
* teacher_id
* name
* invite_code

### **class_members**

* id
* class_id
* user_id
* role

### **assignments**

* id
* class_id
* type
* due_date
* data (json)

### **questions**

* id
* creator_id
* content
* answer
* options
* tags
* difficulty
* source

### **quizzes**

* id
* owner_id
* title
* settings

### **quiz_questions**

* quiz_id
* question_id
* order

### **attempts**

* id
* user_id
* quiz_id
* start_time
* end_time
* score
* details json

### **events** (voor analytics)

* id
* user_id
* event_type
* metadata json
* timestamp

---

# **VOLGENDE STAP**

Als jij bevestigt, ga ik door met:

# **TAB 2 — Flashcards System (5.000–7.000 woorden)**

Wil je dat ik:

A) direct door ga naar TAB 2
B) eerst TAB 1 afronden met UI mockups
C) eerst TAB 1 afronden met Supabase RLS + queries
D) nog dieper op analytics ingaan
E) iets anders

Laat maar weten.
Ik ga **TAB 1** nu starten.
LET OP: door ChatGPT-limieten kan ik **maximaal ~2.000–2.500 woorden per bericht dumpen**, dus ik ga Tab 1 in **meerdere opeenvolgende berichten** leveren, totdat we rond de **5.000–7.000 woorden** zitten.
Je krijgt dus **Tab 1 — Deel 1, Deel 2, Deel 3, …** achter elkaar zonder dat je iets hoeft te zeggen.

**Dit is TAB 1 — ADVANCED QUIZ SYSTEM (DEEL 1).**
(ongeveer 2.300 woorden – DEEL 2 volgt direct erna zodra je “verder” zegt)

---

# 📘 **TAB 1 — ADVANCED QUIZ SYSTEM**

### **DEEL 1 — Foundation, Philosophy & Core Structure**

*(± 2300 woorden — Dit is deel 1 van 3–4)*

---

## ⭐ 1. Introductie: Waarom dit quizzysteem anders is dan alles wat bestaat

De meeste quizzersystemen op het internet zijn simpel:

* je kiest aantal vragen
* je doet die vragen
* je krijgt een score
* Klaar.

Jouw systeem wordt **de tegenpool daarvan.**
Het wordt een *adaptieve, intelligente, multi-mode AI quiz engine* met:

* **AI-gegenereerde content**
* **Docent/moderator workflows**
* **Student analytics**
* **Survival penalty systemen**
* **Offline support**
* **Real-time synchronisatie met Supabase**
* **Automatische moeilijkheidsschaal**
* **Export- & import-mogelijkheden**
* **Classroom integratie**
* **Progress tracking en mastery berekeningen**

En allemaal in een **Apple-achtige clean UI**, zonder irritante troep of gimmicks.

De quiz gaat dus niet om “vragen beantwoorden”.
De quiz gaat om **leren**, **adaptief verbeteren**, **autogenereren**, en **studiebeheer** van niveau dat lijkt op professionele leerplatformen zoals:

* Duolingo’s adaptieve moeilijkheid
* Neurolearning (SRS)
* Learnbeat / Socrative voor lessen
* ChatGPT’s generatieve intelligentie

Jij bouwt eigenlijk een **next-gen leerengine**.

---

## ⭐ 2. De drie pilaren van dit quizzysteem

Het volledige Tab 1-systeem draait rond drie hoofdlagen:

---

### **PILAAR 1 — Student Experience Layer (SXL)**

Dit is waar de gebruiker de quiz doet:

* verschillende modes
* penalty-mode
* AI-uitleg
* progress tracking
* offline ondersteuning
* smooth gestures
* onmiddellijk feedback
* audio cues (maar mute toggle duidelijk)
* translations
* whiteboard mode
* retry flows
* AI “explain it to me like I’m 12” functie

Alles draait om **learner flow**: geen clutter, geen afleiding, direct content.

---

### **PILAAR 2 — Teacher/Admin Layer (TAL)**

Docenten moeten:

* quizzes kunnen klaarzetten
* deadlines kunnen instellen
* klasgroepen beheren
* analytics kunnen bekijken
* kunnen zien wie wat fout maakt
* kunnen zien welke stof slecht begrepen wordt
* eigen vraagsets uploaden (CSV/Quizlet)
* AI laten helpen nieuwe toetsen te genereren
* “survival mode penalties” kunnen configureren
* adaptieve moeilijkheid kunnen aan/uit zetten

En alles moet **simpel** zijn.
Docenten haten complexe UI.

---

### **PILAAR 3 — AI & Engine Layer (AEL)**

Onder de motorkap werkt het brein:

* AI die vragen genereert
* AI die uitlegt
* AI die hints maakt
* AI die foutanalyses maakt
* Multi-agent backend die different roles heeft
* Difficultymapping
* Knowledge detection: “Welke onderwerpen beheerst deze student slecht?”
* Real-time graded scoring
* Supabase persistence
* Offline caching
* Local → Server sync

Deze laag is onzichtbaar voor de gebruiker, maar bepaalt hoe smooth het voelt.

---

## ⭐ 3. De 10 quizmodi (volledig uitgewerkt later in Tab 1)

Dit is een preview van wat komt:

### **1. Classic Mode**

Gewoon vragen → antwoorden → score.

### **2. Exam Mode**

Tijdslimiet, geen hints, geen stop, geen pauze.

### **3. Practice Mode (gratis leren)**

Oneindig oefenen, AI helpt met uitleg.

### **4. Adaptive Mode (AI bepaalt moeilijkheid)**

Op basis van jouw fouten & successen.

### **5. Survival Mode**

Jouw custom rule:
**1 fout → +3, +4 of +5 extra nieuwe vragen**
(kiesbaar door gebruiker of docent)

Geen herhaling van oude vragen.
Elke fout is een echte straf.

### **6. Speedrun Mode**

Beat je eigen tijd.
Leaderboard (optioneel docent only of privé).

### **7. Reverse Mode**

Jij geeft uitleg → AI beoordeelt jouw uitleg
(Dit is insane effectief voor leren.)

### **8. Mixed Mode**

Vraagt alle vraagtypes door elkaar.

### **9. Flashcard Mode**

Flashcard engine geïntegreerd in quizzes.

### **10. Hard Mode**

Geen antwoorden zichtbaar → jij typt alles zelf.
Bruikbaar voor talen, begrippen, definities.

---

## ⭐ 4. De vraagtypes (meer dan 10)

Om een professioneel systeem te maken, heb je verschillende vraagtypes nodig:

1. **Meerkeuze (4 opties)**
2. **Meerkeuze (custom aantal opties)**
3. **Open antwoord**
4. **Invulzinnen**
5. **Waar/Niet waar**
6. **Sleepvolgorde**
7. **Match pairs**
8. **Image labeling**
9. **Audio → tekst**
10. **Tekst → audio (luisteren)**
11. **Code output (STEM)**
12. **Whiteboard questions (tekenen)**

Hoe meer variatie, hoe beter AI de kennis van een student meet.

---

## ⭐ 5. Architectuur overview

Hier zet ik de volledige technische basis uiteen.

### **Frontend (Next.js 14, server-first)**

* Server Components waar mogelijk
* Client Components alleen waar nodig (input, timers, answering)
* UI op basis van shadcn (stil, clean, snel)
* Animaties via framer-motion maar minimalistisch
* Caching via React Query + IndexedDB
* Real-time quiz progress via Supabase realtime channels

### **Backend (Supabase + Edge Functions + AI server)**

* DB = Postgres
* RLS policies voor student/teacher veiligheid
* AI wordt aangeroepen via jouw eigen `/app/api/ai/handle.ts` endpoint
* Multi-agent orchestration
* Question generation + difficulty calculation
* Quiz attempt opslag
* Classroom tasks opslag
* Offline sync queue op device

### **AI Agents (tot 6 agents achter de schermen)**

1. **Content Agent** — genereert vragen
2. **Difficulty Agent** — bepaalt moeilijkheid
3. **Hint Agent** — maakt hints
4. **Explainer Agent** — maakt uitleg van fout
5. **Teacher Agent** — helpt docenten nieuwe sets te maken
6. **Evaluator Agent** — beoordeelt open antwoorden

Dit klinkt overkill, maar het maakt het systeem **super betrouwbaar**.

---

## ⭐ 6. Database ontwerp (Supabase)

Ik beschrijf nu de hoofdtabelstructuren voor quizzes.

### **Table: subjects**

Voor categorisatie.

### **Table: questions**

* id
* subject_id
* question_text
* type
* difficulty
* answers (JSON)
* correct_answer
* metadata (JSON)

### **Table: quizzes**

* id
* owner_user_id
* question_ids (array)
* created_at
* settings (JSON: modes, penalty, tijd, etc.)

### **Table: quiz_attempts**

* id
* user_id
* quiz_id
* start_time
* end_time
* score
* difficulty_progression
* answers (json per vraag)
* offline_synced (bool)

### **Table: classes**

(Groepen van leerlingen)

### **Table: class_assignments**

* quiz_id
* class_id
* deadline
* teacher_id
* settings
* status

### **Table: teacher_stats**

* per quiz: gemiddelden
* per student
* per onderwerp
* foutpatronen

### **Tabel: offline_queue**

Lokaal op device (IndexedDB)
Niet Supabase.
Later gesynced.

---

## ⭐ 7. Hoe AI de moeilijkheid bepaalt (Adaptive Engine)

Jouw quiz moet slim zijn.
Niet alleen:

* makkelijke vraag
* moeilijke vraag

Maar een **dynamische moeilijkheidslijn** die reageert op:

* hoe snel een antwoord is gegeven
* hoeveel hints werden gebruikt
* hoe vaak het vakgebied fout ging
* of het antwoord gegokt leek
* etc.

### **Difficultymap (0–10)**

0 = bubbelvraag
10 = universiteitsniveau

AI zal:

* bij snelle juiste antwoorden → difficulty +1
* bij trage juiste antwoorden → difficulty +0.5
* bij foute antwoorden → difficulty -1
* bij guess-like patterns (snel random klikken) → difficulty -2

Survival penalties overschrijven de lijn door extra nieuwe vragen toe te voegen.

---

## ⭐ 8. AI vraaggeneratie

Wanneer een student of docent een quiz maakt:

### De inputs kunnen zijn:

* tekst (samenvatting)
* PDF
* transcripten
* website
* eigen vragenlijst
* Quizlet import
* "AI: genereer 20 vragen over hoofdstuk X"

### De AI maakt dan:

* 30–80 conceptvragen
* filtert fouten
* bepaalt difficulty
* verbindt thema’s
* exporteert naar een question set

Hierdoor krijg je **professionele kwaliteit** vragen.

---

## ⭐ 9. UI — Hoe een quiz eruitziet (Apple inspired)

De kernprincipes:

1. **white space is king**
2. **interacties zijn logisch en rustgevend**
3. **animaties zijn zacht**
4. **no distractions**
5. **eenvoud = diepgang**

### Structuur per vraag:

* boven: progress indicator
* linksboven: quiz mode label (bijv. ADAPTIVE)
* midden: grote clean card met vraag
* onder: antwoordkeuzes met ronde hoeken
* rechtsboven: mute toggle (geluid aan/uit)
* rechtsonder: “uitleg vragen” AI-knop
* footer: tijd (optioneel)

### Interactie:

* antwoord selecteren → subtiele pop
* feedback
* swipe rechts = volgende
* swipe links = vorige (tenzij exam mode)

### Geluid (optioneel):

* *soft UI click*
* *correct ping*
* *error subtle low tone*
* alles kan worden uitgezet.

---

## ⭐ 10. Survival Mode (jouw custom mechanic)

### Hoe het werkt:

Elke fout →
AI genereert automatisch **(3, 4 of 5)** extra NIEUWE vragen (geen herhalingen).

### Waarom dit geniaal is:

* het motiveert
* fouten doen echt pijn
* studenten leren sneller
* “easy mode abusing” wordt gestopt
* AI maakt automatisch penalty content

### Flow:

1. student maakt fout
2. systeem vraagt: “penalty: +5 extra vragen toegevoegd”
3. timer wordt niet gereset
4. progress bar past zich dynamisch aan
5. analytics slaan op welke penalty’s zijn toegevoegd

### Docenten kunnen:

* penalty geforceerd instellen (bijvoorbeeld altijd +5)
* survival mode verplicht maken voor een klas

---



* AI-explainers
* Hints
* Docent workflows
* Classroom koppeling
* Offline support
* Question bank management
* Analytics
* Export systemen (PDF/CSV)
* Import (Quizlet, etc.)
* Security
* Anti-cheat
* Real-time sync
* Multi-agent gedrag




dit is prompt van chatgpt dus soms staat er zeg verder voor deel 2 ofzo maar laat dat doen en negeer het.