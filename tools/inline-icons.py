#!/usr/bin/env python3
"""Kopiert assets/icons/sprite.svg in alle HTML-Seiten.

    python3 tools/inline-icons.py

Das Sprite liegt einmal als Quelle vor und wird in jede Seite zwischen die
Marker <!-- icons:start --> und <!-- icons:end --> geschrieben. So gibt es
keinen zweiten Request und keine Abhaengigkeit von externen <use>-Referenzen,
die auf aelteren Browsern stumm ausfallen — und trotzdem nur eine Datei, in
der Symbole gepflegt werden.

Die ausgelieferten HTML-Dateien sind fertig; das hier ist eine
Autorenhilfe, kein Build-Schritt beim Deployen.
"""
import glob
import os
import re

ROOT = os.path.join(os.path.dirname(__file__), os.pardir)
START, END = "<!-- icons:start -->", "<!-- icons:end -->"


def main():
    sprite_path = os.path.join(ROOT, "assets", "icons", "sprite.svg")
    with open(sprite_path, encoding="utf-8") as handle:
        sprite = handle.read()

    # XML-Deklaration und Kommentare raus — im HTML stoeren sie nur.
    sprite = re.sub(r"<\?xml.*?\?>\s*", "", sprite, flags=re.S)
    sprite = re.sub(r"<!--.*?-->\s*", "", sprite, flags=re.S).strip()

    pattern = re.compile(re.escape(START) + r".*?" + re.escape(END), re.S)
    block = START + "\n" + sprite + "\n" + END

    touched = 0
    for page in sorted(glob.glob(os.path.join(ROOT, "*.html"))):
        with open(page, encoding="utf-8") as handle:
            html = handle.read()
        if START not in html:
            continue
        updated = pattern.sub(lambda _: block, html, count=1)
        if updated != html:
            with open(page, "w", encoding="utf-8") as handle:
                handle.write(updated)
            touched += 1
            print("aktualisiert:", os.path.basename(page))
        else:
            print("unveraendert: ", os.path.basename(page))
    print(f"{touched} Datei(en) geaendert.")


if __name__ == "__main__":
    main()
