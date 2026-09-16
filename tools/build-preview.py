#!/usr/bin/env python3
"""Baut aus den Seiten je eine eigenstaendige HTML-Datei.

    python3 tools/build-preview.py

Hintergrund: Vorschau-Umgebungen (etwa der Artifact-Viewer) rendern HTML in
einer Sandbox, in der relative Unterressourcen nicht aufgeloest werden — die
Seite erscheint dann voellig ungestylt. Diese Fassung traegt Stylesheet,
Skript, Schriften und Favicon im Dokument selbst und ist deshalb ueberall
identisch darstellbar.

Nur fuer die Vorschau. Ausgeliefert wird die aufgeteilte Fassung: getrennte
Dateien lassen sich zwischenspeichern, und die Schriften werden dann einmal
geladen statt auf jeder Seite erneut.
"""
import base64
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
OUT = os.path.join(ROOT, "preview")
PAGES = ["index.html", "formular.html", "impressum.html", "datenschutz.html"]


def read(*parts):
    with open(os.path.join(ROOT, *parts), encoding="utf-8") as handle:
        return handle.read()


def data_uri(path, mime):
    with open(os.path.join(ROOT, path), "rb") as handle:
        return f"data:{mime};base64," + base64.b64encode(handle.read()).decode("ascii")


def build_css():
    css = read("assets", "css", "tokens.css") + "\n" + read("assets", "css", "site.css")
    for name in ("newsreader", "archivo"):
        css = css.replace(
            f'url("../fonts/{name}-var.woff2")',
            f'url("{data_uri(f"assets/fonts/{name}-var.woff2", "font/woff2")}")',
        )
    return css


def main():
    os.makedirs(OUT, exist_ok=True)
    css = build_css()
    js = read("assets", "js", "site.js")
    favicon = data_uri("assets/icons/favicon.svg", "image/svg+xml")

    for page in PAGES:
        html = read(page)
        # Vorladen entfaellt: die Schrift steckt bereits im Dokument.
        html = re.sub(r'\s*<link rel="preload"[^>]*>', "", html)
        html = html.replace(
            '<link rel="icon" href="assets/icons/favicon.svg" type="image/svg+xml">',
            f'<link rel="icon" href="{favicon}" type="image/svg+xml">',
        )
        html = html.replace(
            '<link rel="stylesheet" href="assets/css/tokens.css">\n'
            '<link rel="stylesheet" href="assets/css/site.css">',
            "<style>\n" + css + "\n</style>",
        )
        html = html.replace(
            '<script src="assets/js/site.js" defer></script>',
            "<script>\n" + js + "\n</script>",
        )

        leftovers = re.findall(r'(?:href|src)="assets/[^"]+"', html)
        if leftovers:
            raise SystemExit(f"{page}: nicht eingebettete Verweise {leftovers}")

        target = os.path.join(OUT, page)
        with open(target, "w", encoding="utf-8") as handle:
            handle.write(html)
        print(f"{page:18} {os.path.getsize(target) / 1024:7.0f} KB")


if __name__ == "__main__":
    main()
