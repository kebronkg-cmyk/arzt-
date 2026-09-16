#!/usr/bin/env python3
"""Erzeugt die selbst gehosteten Schriften aus den Fontsource-Paketen.

Reproduzierbar:
    pip install fonttools brotli
    npm pack @fontsource-variable/newsreader@5.3.0 @fontsource-variable/archivo@5.3.0
    tar xzf *.tgz   # ergibt jeweils ./package
    python3 tools/build-fonts.py <newsreader-pkg> <archivo-pkg>

Beide Familien stehen unter OFL-1.1; Subsetting und Self-Hosting sind erlaubt.
Wir beschneiden nur die Achsbereiche auf das, was das Design benutzt, und
bleiben beim latin-Subset (deckt Deutsch inkl. Umlauten, ß, €, § vollstaendig ab).
"""
import os
import sys

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

# (Quelldatei im Paket, Ziel, Achsgrenzen)
JOBS = [
    ("files/newsreader-latin-standard-normal.woff2", "newsreader-var.woff2",
     {"opsz": (14, 72), "wght": (400, 700)}),
    ("files/archivo-latin-standard-normal.woff2", "archivo-var.woff2",
     {"wght": (400, 700), "wdth": (75, 100)}),
]

OUT = os.path.join(os.path.dirname(__file__), os.pardir, "assets", "fonts")


def main(pkgs):
    total = 0
    for pkg, (rel, name, limits) in zip(pkgs, JOBS):
        src = os.path.join(pkg, rel)
        font = instancer.instantiateVariableFont(TTFont(src), limits, inplace=True)
        font.flavor = "woff2"
        dst = os.path.join(OUT, name)
        font.save(dst)
        size = os.path.getsize(dst)
        total += size
        print(f"{name:22} {os.path.getsize(src):>7} -> {size:>7} B  {limits}")
    print(f"Summe: {total} B ({round(total / 1024)} KB)")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1:])
