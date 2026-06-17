# Schéma de spécification du classeur (workbook spec)

Un seul fichier JSON décrit tout le classeur. Les deux rendus (Google Sheets, .xlsx) le
consomment. Écrivez-le dans `/tmp/<name>-spec.json`.

## Structure de haut niveau

```json
{
  "title": "Budget 2026",
  "theme": "default",
  "tabs": [
    /* objets onglet */
  ]
}
```

- `title` — nom du classeur (titre Google Sheet ou métadonnée du .xlsx).
- `theme` — clé de thème (voir `dashboard-layout.md`). `"default"` = pastel + terre cuite.
- `tabs` — tableau ordonné d'onglets.

## Objet onglet (tab)

```json
{
  "name": "Données",
  "columns": [
    { "header": "Mois", "key": "month", "width": 120, "format": "@" },
    { "header": "Revenus", "key": "revenue", "width": 110, "format": "#,##0 €" },
    { "header": "Dépenses", "key": "expense", "width": 110, "format": "#,##0 €" },
    {
      "header": "Net",
      "key": "net",
      "width": 110,
      "format": "#,##0 €",
      "formula": "=B{row}-C{row}"
    }
  ],
  "rows": [
    { "month": "Janvier", "revenue": 5000, "expense": 3200 },
    { "month": "Février", "revenue": 5200, "expense": 3100 }
  ],
  "totals_row": {
    "label": "Total",
    "formulas": {
      "revenue": "=SUM(B2:B{lastrow})",
      "expense": "=SUM(C2:C{lastrow})",
      "net": "=SUM(D2:D{lastrow})"
    }
  },
  "freeze": { "rows": 1, "cols": 1 },
  "conditional_formats": [
    {
      "range": "D2:D{lastrow}",
      "type": "color_scale",
      "min": "#D4876B",
      "mid": "#F5EFE6",
      "max": "#5C7A6B"
    }
  ]
}
```

### Champs d'onglet

- `name` — nom de l'onglet (unique).
- `columns` — définitions de colonnes. Onglet tableau de bord : `columns: []`.
- `rows` — données ; les clés correspondent à `column.key`. Omettre pour onglet calculé.
- `totals_row` — ligne de total optionnelle avec formules d'agrégation.
- `freeze` — lignes/colonnes figées.
- `conditional_formats` — règles (`color_scale`, `data_bar`, `cell_is`, `formula`).

### Colonne

- `header`, `key`, `width`.
- `format` — format numérique (`"#,##0 €"`, `"0.0%"`, `"@"` pour texte, `"yyyy-mm-dd"`).
- `formula` — formule par ligne ; `{row}` remplacé par le numéro de ligne réel.

## Espaces réservés (placeholders) dans les formules

- `{row}` — la ligne actuelle de la donnée.
- `{lastrow}` — la dernière ligne de données.
- `{firstrow}` — la première ligne de données (généralement 2).

Le constructeur résout ces espaces réservés en références A1 réelles avant le rendu. **Les
formules ne sont jamais codées en dur avec des numéros de ligne devinés** — c'est ce que les
agents QA vérifient.

## Onglet tableau de bord

Voir `dashboard-layout.md`. Champs supplémentaires : `column_widths`, `section_bars`,
`panels`, `kpi_cards`, `charts`.

## Graphiques (charts)

```json
{
  "type": "bar", // bar | line | pie | combo
  "title": "Revenus vs Dépenses",
  "data_range": "Données!A1:C{lastrow}",
  "anchor": "B10", // cellule d'ancrage (tableau de bord)
  "series_colors": ["#5C7A6B", "#D4876B"]
}
```
