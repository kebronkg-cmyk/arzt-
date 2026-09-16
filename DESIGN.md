# Praxis Dres. Maasz — Designsystem „Editorial Medical"

Stand: Konzept freigegeben durch Stack- und Inhaltsentscheidung, Umsetzung
wartet auf (a) ausdrueckliches OK zum Entwurf und (b) Zugriff auf die
Live-Inhalte.

## Konzept

Die Praxis als **Sprechstunde in Kapiteln**. Kein Stapel gleicher Karten,
sondern ein durchlaufender redaktioneller Satz mit nummerierten Kapitelmarken:

    01 Praxis · 02 Sprechzeiten · 03 Leistungen · 04 Team · 05 Anfahrt

Der Live-Praxisstatus ist kein Badge am Rand, sondern das einzige bewegte
Element im ruhigen Satzbild. Haltung: Schweizer Satzkultur, Papier statt
Interface.

## Stack

Statisches HTML + CSS + wenig Vanilla-JS, **kein Build-Schritt**. Bei vier
Seiten ist jede Toolchain Ballast; so bleiben Ladezeit, Abhaengigkeiten und
Angriffsflaeche minimal. Netlify liefert die Dateien direkt aus.

## Farben

OKLCH, Grundlage ist das Tintenblau `#0f4c81` = `oklch(.409 .107 250)`.
Dark Mode ueber `prefers-color-scheme`. Alle Paarungen sind mit
`tools/palette-check.py` gegen WCAG 2.2 AA geprueft (schlechtester Wert
5,15:1 — AA verlangt 4,5:1).

| Token | Light | Dark |
|---|---|---|
| `--paper` | `oklch(.974 .006 85)` | `oklch(.19 .012 80)` |
| `--paper-2` | `oklch(.954 .009 80)` | `oklch(.24 .014 78)` |
| `--ink` | `oklch(.245 .038 255)` | `oklch(.93 .01 85)` |
| `--ink-soft` | `oklch(.43 .035 255)` | `oklch(.76 .015 85)` |
| `--brand` | `oklch(.409 .107 250)` | `oklch(.73 .09 250)` |
| `--accent` | `oklch(.53 .13 48)` | `oklch(.76 .12 60)` |
| `--line` | `oklch(.88 .01 85)` | `oklch(.33 .014 80)` |

Der warme Akzent erscheint bewusst nur an drei Stellen: Statuspunkt, aktiver
Wochentag, Hover-Unterstreichung. Keine Verlaeufe, kein Glow.

## Typografie

Beide Schriften liegen lokal unter `assets/fonts/` (Details und Lizenzen
dort). Zusammen 142 KB.

* **Newsreader** — Headlines. Magazin-Serif mit optischer Achse (`opsz`),
  seriös statt verspielt.
* **Archivo** — Fliesstext und UI. Klare Grotesk; die Breitenachse (`wdth`)
  liefert schmale Marginalien-Labels und breite Kapitelziffern, ohne dass
  eine dritte Schrift noetig waere.

Basisgroesse **18 px** (aeltere Patientinnen und Patienten), fluide Skala per
`clamp()`, Zeilenlaenge max. 66 Zeichen, grosser Groessenkontrast zwischen
Headline und Text.

## Layout

12-Spalten-Grid, asymmetrisch belegt: Text in 3–9, Marginalien in 1–2, Bilder
brechen gezielt ueber Spalte 12 hinaus. Spacing als 8-px-Skala mit benannten
Stufen. Grosse, angeschnittene Kapitelziffern am linken Rand. Feines
SVG-Grain (`feTurbulence`, ~3 % Deckkraft) und Haarlinien als Gliederung.

## Sektionen

| Kapitel | Idee |
|---|---|
| Header | Wortmarke, Navigation, Telefonnummer dauerhaft sichtbar; schrumpft beim Scrollen auf eine Zeile |
| Hero | Grosse Typo-Komposition, links im Raster verankert; rechts unten der Statusblock mit pulsierendem Punkt. Kein Hero-Bild |
| 02 Sprechzeiten | Zeiten als Satz statt Tabelle; heutiger Tag durch Ockerlinie markiert; Status live in `Europe/Berlin` |
| 03 Leistungen | Aufklappbare Liste (`<details>`), je Zeile Nummer und Linien-Icon. Keine drei gleichen Karten |
| 04 Team | Aerzte gross und im Raster gebrochen, Team darunter kleiner; einheitlicher Farblook per CSS-Filter |
| 05 Anfahrt | Adresse und OEPNV als Text, Karte ausschliesslich als Link — kein Embed |
| Notfall | Eigener Block auf `--ink`; 112 / 116117 / Bereitschaftspraxen als grosse Telefon-Links |

## Icons

Eigenes Set, 24er Grid, 1,5 px Kontur, runde Enden, als Inline-SVG-Sprite
(~10 Symbole). Keine Emojis.

## Bewegung

`animation-timeline: view()` fuer gestaffeltes Einblenden und Linien, die
sich zeichnen (`stroke-dashoffset`); IntersectionObserver als Fallback.
Leichte Parallax nur auf Bildern. Micro-Interactions an Links und Buttons.
Seitenwechsel per `@view-transition`.

Zwei harte Regeln: `prefers-reduced-motion: reduce` schaltet alles ab, und
**Inhalte sind ohne JS und ohne Animation vollstaendig sichtbar** — Reveals
starten im sichtbaren Zustand und werden nur ergaenzend animiert.

## Barrierefreiheit und Performance

Referenzbreite 360 px, Sticky-„Anrufen"-Leiste auf Mobile, Klickflaechen
mindestens 44 px, Skip-Link, sichtbare 2-px-Fokusringe mit Offset,
semantisches HTML. Bilder lokal in AVIF/WebP mit `width`/`height` und
`loading="lazy"`. Ziel: Lighthouse >= 95 in allen vier Kategorien.

## Datenschutz

Keine externen Ressourcen. Schriften lokal, Bilder lokal, keine Hotlinks,
kein Karten-Embed, keine Analytics. Das Kontaktformular verarbeitet
Gesundheitsdaten nach Art. 9 DSGVO und braucht eine aktive
Einwilligungs-Checkbox sowie einen Hinweis zur Uebertragung — der bestehende
Versandweg ist noch zu pruefen.
