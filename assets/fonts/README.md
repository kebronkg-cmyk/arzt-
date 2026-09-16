# Schriften

Beide Familien werden **lokal ausgeliefert**. Es gibt keine Verbindung zu
Google Fonts oder einem anderen Drittanbieter — DSGVO-relevant, weil sonst
schon beim Seitenaufruf die IP der Patientinnen und Patienten an Dritte ginge.

| Datei | Familie | Achsen | Groesse |
|---|---|---|---|
| `newsreader-var.woff2` | Newsreader (Headlines) | `opsz 14–72`, `wght 400–700` | 88 KB |
| `archivo-var.woff2` | Archivo (Fliesstext, UI) | `wght 400–700`, `wdth 75–100` | 54 KB |

* Lizenz: **SIL Open Font License 1.1** (siehe `LICENSE-Newsreader.txt`,
  `LICENSE-Archivo.txt`). Self-Hosting und Subsetting sind ausdruecklich erlaubt.
* Herkunft: `@fontsource-variable/newsreader@5.3.0` und
  `@fontsource-variable/archivo@5.3.0`, die ihrerseits aus
  `github.com/google/fonts` stammen.
* Erzeugt mit `tools/build-fonts.py` — dort stehen auch die Befehle zum
  Nachbauen. Nur die Achsbereiche sind beschnitten, der Zeichenvorrat ist das
  unveraenderte `latin`-Subset (Umlaute, ß, €, § und typografische
  Anfuehrungszeichen sind geprueft enthalten).
