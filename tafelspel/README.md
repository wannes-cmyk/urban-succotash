# Tafels Kampioen

Een klein browserspelletje om tafels en hoofdrekenen te oefenen, gemaakt voor het 2de en 3de leerjaar.

## Hoe werkt het

1. Open `index.html` in een browser (dubbelklikken volstaat, of host de map via GitHub Pages).
2. Kies je leerjaar: 2de of 3de leerjaar.
3. Kies wat je wil oefenen:
   - **Tafels ✖️➗**
     - Kies welke tafels: alle tafels van 1 tot 10 door elkaar, of "Zelf tafels kiezen" om via aanvinkvakjes specifieke tafels te selecteren (bv. enkel de tafel van 7).
     - Kies maaltafels, deeltafels, of een mix.
     - Kies de moeilijkheidsgraad: gewone mix, of focus op de moeilijkste tafels (3, 4, 6, 7, 8, 9).
   - **Hoofdrekenen ➕➖**
     - 2de leerjaar: Splitsen (tot 10), Optellen & aftrekken met brug over het tiental (tot 20), of Optellen & aftrekken (tot 100).
     - 3de leerjaar: Optellen & aftrekken (tot 1000).
     - Optellen en aftrekken worden altijd door elkaar geoefend (geen aparte keuze zoals bij tafels).
4. Kies het aantal oefeningen (10, 20, 30 of 50) en of de timer aan moet staan (standaard 10 seconden per vraag zodat er niet te lang nagedacht wordt). Deze opties gelden voor beide leerjaren en beide oefenvormen.
5. Beantwoord de sommen door het antwoord in te typen en op "Check!" te drukken (of Enter).
6. Op het einde krijg je je score en 1 tot 3 sterren.

## Werkblad afdrukken

Wil je liever op papier oefenen? Maak eerst alle keuzes op het startscherm. Onder de "Start!"-knop verschijnen dan twee links:

- **"🖨️ Print X oefeningen"**: een werkblad met het aantal oefeningen dat je koos (10, 20, 30 of 50).
- **"🖨️ Print een volle pagina (60 oefeningen)"**: een volledig gevuld A4-werkblad.

Je krijgt een PDF met op pagina 1 het werkblad (naam, datum, score en de sommen in 3 kolommen met invulstreepjes) en op pagina 2 de oplossingen. Druk enkel pagina 1 af als je de oplossingen niet op papier wil. Elke klik geeft nieuwe, willekeurige sommen. Afgedrukte werkbladen komen niet in de geschiedenis.

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
- `script.js` - spellogica: vragen genereren voor tafels én hoofdrekenen (splitsen, brug over het tiental, optellen/aftrekken tot 100 of 1000), timer, score bijhouden, geschiedenis in localStorage, PDF-export van rondes en printbare werkbladen
