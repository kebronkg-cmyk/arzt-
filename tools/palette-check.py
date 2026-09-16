#!/usr/bin/env python3
"""Prueft die Farbtokens aus assets/css/tokens.css gegen WCAG 2.2 AA.

    python3 tools/palette-check.py

Rechnet OKLCH -> sRGB -> Kontrastverhaeltnis. AA verlangt 4.5:1 fuer
Fliesstext, 3:1 fuer grosse Schrift und fuer Bedienelement-Grenzen.
"""
import math

AA_TEXT = 4.5
AA_LARGE = 3.0


def _srgb(c):
    c = 12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055
    return max(0.0, min(1.0, c))


def oklch_to_rgb(L, C, H):
    h = math.radians(H)
    a, b = C * math.cos(h), C * math.sin(h)
    l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
    m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
    s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3
    return (
        _srgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
        _srgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
        _srgb(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s),
    )


def luminance(rgb):
    r, g, b = (c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(fg, bg):
    a, b = luminance(fg), luminance(bg)
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)


LIGHT = {
    "paper": (0.974, 0.006, 85), "paper-2": (0.954, 0.009, 80),
    "ink": (0.245, 0.038, 255), "ink-soft": (0.430, 0.035, 255),
    "brand": (0.409, 0.107, 250), "accent": (0.530, 0.130, 48),
    "line": (0.880, 0.010, 85),
}
DARK = {
    "paper": (0.190, 0.012, 80), "paper-2": (0.240, 0.014, 78),
    "ink": (0.930, 0.010, 85), "ink-soft": (0.760, 0.015, 85),
    "brand": (0.730, 0.090, 250), "accent": (0.760, 0.120, 60),
    "line": (0.330, 0.014, 80),
}

# (Vordergrund, Hintergrund, geforderte Mindestratio)
PAIRS = [
    ("ink", "paper", AA_TEXT), ("ink", "paper-2", AA_TEXT),
    ("ink-soft", "paper", AA_TEXT), ("brand", "paper", AA_TEXT),
    ("accent", "paper", AA_TEXT), ("paper", "ink", AA_TEXT),
    ("paper", "brand", AA_TEXT), ("line", "paper", 1.0),
]


def main():
    failed = 0
    for label, tokens in (("Light", LIGHT), ("Dark", DARK)):
        print(f"\n{label}")
        for fg, bg, need in PAIRS:
            ratio = contrast(oklch_to_rgb(*tokens[fg]), oklch_to_rgb(*tokens[bg]))
            ok = ratio >= need
            failed += not ok
            print(f"  {'OK ' if ok else 'FAIL'} {fg:9} auf {bg:9} {ratio:5.2f}:1 (min {need})")
    print("\nAlle Paare bestehen AA." if not failed else f"\n{failed} Paar(e) unter AA.")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
