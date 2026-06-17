#!/usr/bin/env python3
"""Génère la spec du planner de suivi de dépenses (Etsy) -> /tmp/expense-planner-spec.json"""
import json

EUR = "#,##0 €"
PCT = "0%"

MONTHS = ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
          "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"]
MONTH_LABELS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
                "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]

# 8 catégories ; budget d'exemple, réel laissé à 0 (l'acheteur remplit)
CATS = [
    ("Logement", 900), ("Alimentation", 450), ("Transport", 200),
    ("Santé", 100), ("Loisirs", 150), ("Abonnements", 60),
    ("Shopping", 120), ("Autre", 80),
]
# Lignes data des mois : 2..9, total = 10
MTOTAL = 10

tabs = []

# --- Guide ---
guide_lines = [
    "Bienvenue ! Ce classeur suit vos dépenses mois par mois.",
    "1. Onglet 'Revenus' : saisissez vos revenus et objectif d'épargne par mois.",
    "2. Onglets mensuels (Janvier…Décembre) : entrez le montant 'Dépensé réel' par catégorie.",
    "3. La colonne Écart et % utilisé se calculent automatiquement.",
    "4. L'onglet 'Dashboard' affiche vos totaux annuels et graphiques — rien à remplir.",
    "Astuce : modifiez les budgets prévus selon votre situation. Les couleurs signalent les dépassements.",
    "Bon suivi ! 💚",
]
tabs.append({
    "name": "Guide",
    "columns": [{"header": "📊 Suivi de Dépenses — Mode d'emploi",
                 "key": "g", "width": 620, "format": "@"}],
    "rows": [{"g": line} for line in guide_lines],
})

# --- Revenus ---
tabs.append({
    "name": "Revenus",
    "columns": [
        {"header": "Mois", "key": "mois", "width": 130, "format": "@"},
        {"header": "Revenus", "key": "rev", "width": 130, "format": EUR},
        {"header": "Objectif épargne", "key": "obj", "width": 150, "format": EUR},
    ],
    "rows": [{"mois": MONTH_LABELS[i], "rev": 0, "obj": 0} for i in range(12)],
    "totals_row": {"label": "TOTAL", "formulas": {
        "rev": "=SUM(B{firstrow}:B{lastrow})",
        "obj": "=SUM(C{firstrow}:C{lastrow})"}},
    "freeze": {"rows": 1, "cols": 1},
})

# --- 12 onglets mensuels ---
for i, name in enumerate(MONTHS):
    tabs.append({
        "name": name,
        "columns": [
            {"header": "Catégorie", "key": "cat", "width": 150, "format": "@"},
            {"header": "Budget prévu", "key": "budget", "width": 120, "format": EUR},
            {"header": "Dépensé réel", "key": "reel", "width": 120, "format": EUR},
            {"header": "Écart", "key": "ecart", "width": 110, "format": EUR,
             "formula": "=B{row}-C{row}"},
            {"header": "% utilisé", "key": "pct", "width": 100, "format": PCT,
             "formula": "=IF(B{row}=0,0,C{row}/B{row})"},
        ],
        "rows": [{"cat": c, "budget": b, "reel": 0} for c, b in CATS],
        "totals_row": {"label": "TOTAL", "formulas": {
            "budget": "=SUM(B{firstrow}:B{lastrow})",
            "reel": "=SUM(C{firstrow}:C{lastrow})",
            "ecart": "=SUM(D{firstrow}:D{lastrow})",
            "pct": "=IF(SUM(B{firstrow}:B{lastrow})=0,0,"
                   "SUM(C{firstrow}:C{lastrow})/SUM(B{firstrow}:B{lastrow}))"}},
        "freeze": {"rows": 1, "cols": 1},
        "conditional_formats": [
            {"range": "D{firstrow}:D{lastrow}", "type": "color_scale",
             "min": "#D4876B", "mid": "#F5EFE6", "max": "#5C7A6B"},
            {"range": "E{firstrow}:E{lastrow}", "type": "data_bar", "color": "#5C7A6B"},
        ],
    })

# --- Resume_Mensuel : agrège chaque mois (budget/dépensé total) ---
rm_rows = []
for i, m in enumerate(MONTHS):
    rm_rows.append({
        "mois": MONTH_LABELS[i],
        "budget": f"='{m}'!B{MTOTAL}",
        "reel": f"='{m}'!C{MTOTAL}",
    })
tabs.append({
    "name": "Resume_Mensuel",
    "columns": [
        {"header": "Mois", "key": "mois", "width": 130, "format": "@"},
        {"header": "Budget", "key": "budget", "width": 130, "format": EUR},
        {"header": "Dépensé", "key": "reel", "width": 130, "format": EUR},
    ],
    "rows": rm_rows,
    "totals_row": {"label": "TOTAL", "formulas": {
        "budget": "=SUM(B{firstrow}:B{lastrow})",
        "reel": "=SUM(C{firstrow}:C{lastrow})"}},
    "freeze": {"rows": 1, "cols": 1},
})

# --- Resume_Cat : total annuel par catégorie (somme de la ligne cat sur 12 mois) ---
rc_rows = []
for j, (c, _b) in enumerate(CATS):
    row_in_month = 2 + j  # catégorie j est à la ligne 2+j dans chaque mois
    terms = "+".join(f"'{m}'!C{row_in_month}" for m in MONTHS)
    rc_rows.append({"cat": c, "total": f"={terms}"})
tabs.append({
    "name": "Resume_Cat",
    "columns": [
        {"header": "Catégorie", "key": "cat", "width": 160, "format": "@"},
        {"header": "Total annuel", "key": "total", "width": 140, "format": EUR},
    ],
    "rows": rc_rows,
    "totals_row": {"label": "TOTAL", "formulas": {
        "total": "=SUM(B{firstrow}:B{lastrow})"}},
})

# --- Dashboard ---
tabs.append({
    "name": "Dashboard",
    "columns": [],
    "column_widths": [24, 160, 160, 24, 160, 160, 24],
    "section_bars": [
        {"range": "B2:F2", "label": "💰 SUIVI DE DÉPENSES — VUE ANNUELLE",
         "fill": "#5C7A6B", "text": "#FFFFFF"},
        {"range": "B10:F10", "label": "GRAPHIQUES",
         "fill": "#D4876B", "text": "#FFFFFF"},
    ],
    "panels": [{"range": "B3:F8", "fill": "#FFFFFF", "border": "#E8E0D4"}],
    "kpi_cards": [
        {"anchor": "B4", "label": "Revenus annuels", "value": "=Revenus!B14",
         "format": EUR, "accent": "#5C7A6B"},
        {"anchor": "E4", "label": "Budget annuel", "value": "=Resume_Mensuel!B14",
         "format": EUR, "accent": "#8B8A87"},
        {"anchor": "B7", "label": "Total dépensé", "value": "=Resume_Mensuel!C14",
         "format": EUR, "accent": "#D4876B"},
        {"anchor": "E7", "label": "Épargne réelle",
         "value": "=Revenus!B14-Resume_Mensuel!C14", "format": EUR, "accent": "#5C7A6B"},
    ],
    "charts": [
        {"type": "bar", "title": "Budget vs Dépensé par mois",
         "data_range": "Resume_Mensuel!A1:C13", "anchor": "B11",
         "series_colors": ["#8B8A87", "#D4876B"]},
        {"type": "pie", "title": "Répartition des dépenses par catégorie",
         "data_range": "Resume_Cat!A1:B9", "anchor": "B28"},
    ],
})

spec = {"title": "Planner Suivi de Dépenses Annuel", "theme": "default", "tabs": tabs}
with open("/tmp/expense-planner-spec.json", "w", encoding="utf-8") as f:
    json.dump(spec, f, ensure_ascii=False, indent=2)
print("spec écrite :", len(tabs), "onglets")
