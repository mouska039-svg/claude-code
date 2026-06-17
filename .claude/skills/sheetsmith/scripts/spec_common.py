#!/usr/bin/env python3
"""Utilitaires partagés par les deux constructeurs : chargement de spec et résolution
des espaces réservés de formules ({row}, {firstrow}, {lastrow})."""
import json
import re


def load_spec(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def col_letter(idx):
    """0-based -> A, B, ... AA."""
    s = ""
    idx += 1
    while idx:
        idx, r = divmod(idx - 1, 26)
        s = chr(65 + r) + s
    return s


def resolve_formula(formula, row=None, firstrow=2, lastrow=2):
    """Remplace {row}/{firstrow}/{lastrow} par des numéros de ligne réels."""
    out = formula
    if row is not None:
        out = out.replace("{row}", str(row))
    out = out.replace("{firstrow}", str(firstrow))
    out = out.replace("{lastrow}", str(lastrow))
    return out


def data_bounds(tab):
    """Renvoie (firstrow, lastrow) en coordonnées 1-based, en-tête sur la ligne 1."""
    rows = tab.get("rows", []) or []
    firstrow = 2
    lastrow = firstrow + len(rows) - 1 if rows else firstrow
    return firstrow, lastrow
