# Mise en page du tableau de bord et système de couleurs

Inspiré de "Budget by Paycheck" : une grille aérée, des bandes de section colorées, des cartes
KPI, et des graphiques alignés.

## Thème par défaut (pastel + terre cuite)

| Rôle                | Hex                               |
| ------------------- | --------------------------------- |
| Primaire / marque   | `#5C7A6B` (sage)                  |
| Accent / secondaire | `#D4876B` (terracotta)            |
| Fond / panneau      | `#F5EFE6` (cream)                 |
| Texte atténué       | `#8B8A87` (mist)                  |
| Texte / encre       | `#2C2C2A` (ink)                   |
| Bande de section    | `#5C7A6B` (fond), texte `#FFFFFF` |

Échelle de couleurs des graphiques : `["#5C7A6B", "#D4876B", "#A8C0A0", "#E8B7A0", "#8B8A87"]`.

## Grille d'espacement

L'onglet `Dashboard` utilise `columns: []` et une grille pilotée par `column_widths` :

```json
{
  "name": "Dashboard",
  "columns": [],
  "column_widths": [24, 160, 160, 24, 160, 160, 24],
  "section_bars": [
    { "range": "B2:F2", "label": "VUE D'ENSEMBLE", "fill": "#5C7A6B", "text": "#FFFFFF" }
  ],
  "panels": [{ "range": "B4:F12", "fill": "#FFFFFF", "border": "#E8E0D4" }],
  "kpi_cards": [
    {
      "anchor": "B4",
      "label": "Revenus totaux",
      "value": "=SUM(Données!B2:B13)",
      "format": "#,##0 €",
      "accent": "#5C7A6B"
    },
    {
      "anchor": "D4",
      "label": "Dépenses totales",
      "value": "=SUM(Données!C2:C13)",
      "format": "#,##0 €",
      "accent": "#D4876B"
    }
  ],
  "charts": [
    {
      "type": "bar",
      "title": "Revenus vs Dépenses",
      "data_range": "Données!A1:C13",
      "anchor": "B8",
      "series_colors": ["#5C7A6B", "#D4876B"]
    }
  ]
}
```

## Règles d'alignement

- Les colonnes de marge (gouttières) sont étroites (`24` px) ; les colonnes de contenu sont
  larges (`160` px).
- Une carte KPI et le graphique sous elle partagent les mêmes colonnes de panneau, de sorte que
  les étiquettes, les grands nombres et les graphiques s'alignent verticalement.
- Une **carte KPI** = une étiquette atténuée (petite) au-dessus d'un grand nombre coloré ; fond
  blanc, accent à gauche ou en haut.
- Les **bandes de section** s'étendent sur toute la largeur du panneau (B→F) avec fond sage et
  texte blanc.

## Mises en évidence visuelles

- `color_scale` sur les colonnes numériques (terracotta → cream → sage).
- `data_bar` là où c'est pris en charge (Google Sheets et .xlsx via openpyxl).
- Alternance de lignes dans les onglets de données (`#FFFFFF` / `#F5EFE6`).
