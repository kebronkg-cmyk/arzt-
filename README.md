# Praxis Dres. Maasz — Website

Statische Seite, **kein Build-Schritt**. Was im Repo liegt, wird genau so
ausgeliefert.

## Stand

Das Designsystem steht und ist geprueft. Die **Seiteninhalte fehlen noch** —
die bestehende Seite war aus der Arbeitsumgebung nicht erreichbar, und Fakten
einer Arztpraxis werden nicht geraten. Siehe „Offen" unten.

    styleguide.html   Musterseite: zeigt alle Bausteine im echten Zustand
    DESIGN.md         Konzept, Tokens, Sektionsplan
    assets/css/       tokens.css (Designtokens) + site.css (Basis, Bausteine)
    assets/js/site.js Praxisstatus, heutiger Tag, Reveal-Fallback
    assets/fonts/     Newsreader + Archivo, lokal (siehe README dort)
    assets/icons/     Symbol-Sprite, Favicon
    tools/            Pruef- und Autorenhilfen
    netlify.toml      Auslieferung, saubere Adressen, Sicherheits-Header

## Lokal ansehen

    python3 -m http.server 8777

Dann `http://127.0.0.1:8777/styleguide.html`. Ueber `file://` blockiert der
Browser die Schriften (CORS) — die Seite sieht dann falsch aus.

## Pruefen

    python3 tools/palette-check.py            # Farbkontraste gegen WCAG 2.2 AA
    npm install --no-save jsdom
    node tools/test-status.js                 # Oeffnungslogik, 11 Faelle

`tools/palette-check.py` rechnet die OKLCH-Tokens nach sRGB und prueft jedes
Paar aus Text und Flaeche — in **beiden** Farbschemata. Genau das hat einen
Fehler gefunden, bei dem der Notfallblock im Dark Mode heller Text auf heller
Flaeche war.

`tools/test-status.js` friert die Uhr ein und prueft den Oeffnungsstatus an
festen Zeitpunkten, inklusive Sommer-/Winterzeit und Wochenend-Uebersprung.

## Symbole aendern

Symbole werden nur in `assets/icons/sprite.svg` gepflegt und danach in die
Seiten kopiert:

    python3 tools/inline-icons.py

## Sprechzeiten aendern

Die Zeiten stehen **ausschliesslich** im HTML, in den
`<time datetime="…">`-Elementen der Tabelle mit `data-hours`. Das Skript liest
genau diese Werte — sichtbarer Text und Berechnung koennen darum nicht
auseinanderlaufen. Eine Zeile ohne `<time>` gilt als geschlossen.

## Grundregeln

* **Keine externen Ressourcen.** Keine Schriften von Google, keine Karten-
  Einbettung, keine Zaehlpixel. Die Content-Security-Policy in `netlify.toml`
  erzwingt das.
* **Ohne JavaScript vollstaendig lesbar.** Animationen blenden nichts ein, was
  sonst unsichtbar bliebe.
* `prefers-reduced-motion` schaltet jede Bewegung ab.
* Schriftgroesse nie unter 18 px.

## Offen

* Inhalte aller Seiten (Sprechzeiten, Leistungen, Team, Impressum,
  Datenschutz) sowie die Bilder.
* Versandweg des Formulars — verarbeitet Gesundheitsdaten nach Art. 9 DSGVO
  und ist vor Veroeffentlichung zu klaeren.
