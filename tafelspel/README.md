# Tafels Kampioen

Een klein browserspelletje om maal- en deeltafels te oefenen, gemaakt voor het 2de en 3de leerjaar.

## Hoe werkt het

1. Open `index.html` in een browser (dubbelklikken volstaat, of host de map via GitHub Pages).
2. Kies je leerjaar:
   - **2de leerjaar** → tafels van 1, 2, 5 en 10. Vaste 10 vragen, geen tijdsdruk.
   - **3de leerjaar** → alle tafels van 1 tot 10, met extra opties:
     - **Moeilijkheidsgraad**: gewone mix, of focus op de moeilijkste tafels (3, 4, 6, 7, 8, 9)
     - **Aantal oefeningen**: 10, 20, 30 of 50
     - **Timer**: 10 seconden per vraag, zodat er niet te lang nagedacht wordt
3. Kies wat je wil oefenen: maaltafels, deeltafels, of een mix.
4. Beantwoord de sommen door het antwoord in te typen en op "Check!" te drukken (of Enter).
5. Op het einde krijg je je score en 1 tot 3 sterren.

## Overzicht en PDF

Elke gespeelde ronde wordt lokaal opgeslagen in de browser (localStorage), met per vraag: het gegeven antwoord, het juiste antwoord, en of het juist of fout was.

- Vanaf het startscherm of het resultaatscherm kan je op **"📋 Bekijk overzicht"** klikken.
- Kies een ronde uit de lijst om het detail te bekijken.
- Klik op **"⬇️ Download als PDF"** om die ronde als PDF-bestand te bewaren of door te sturen (bv. naar de juf/meester).
- **"Wis geschiedenis"** verwijdert alle opgeslagen rondes.

De geschiedenis is lokaal per browser/toestel - ze wordt niet gedeeld of online opgeslagen.

## Techniek

Zuiver HTML, CSS en vanilla JavaScript, plus [jsPDF](https://github.com/parallax/jsPDF) (via CDN) voor de PDF-export. Geen build-stap. Werkt offline (behalve de PDF-export, die de jsPDF-library nodig heeft) en op mobiel/tablet.

- `index.html` - structuur van de vier schermen (start, quiz, resultaat, overzicht)
- `style.css` - kleurrijke, kindvriendelijke styling
- `script.js` - spellogica: vragen genereren (met gewogen moeilijkheidsgraad), timer, score bijhouden, geschiedenis in localStorage, PDF-export
