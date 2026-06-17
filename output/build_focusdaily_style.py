#!/usr/bin/env python3
"""
BudgetPro-Style.xlsx generator
Premium dark-mode budget tracker using only openpyxl
"""

import os
from openpyxl import Workbook
from openpyxl.styles import PatternFill, Font, Alignment, Border, Side
from openpyxl.utils import get_column_letter, column_index_from_string
from openpyxl.chart import BarChart, Reference, Series

# ── Color Palette ──────────────────────────────────────────────────────────────
BG_DARK      = "1A1A2E"
BG_MID       = "16213E"
BG_CARD      = "0F3460"
ACCENT_SAGE  = "5C7A6B"
ACCENT_TERRA = "D4876B"
ACCENT_GOLD  = "E2B96F"
TEXT_WHITE   = "FFFFFF"
TEXT_MUTED   = "8B8A87"
INPUT_YELLOW = "FFFDE7"
BORDER_COLOR = "2D2D4E"

# ── Fills ──────────────────────────────────────────────────────────────────────
def fill(color):
    return PatternFill(patternType="solid", fgColor=color)

def thin_border():
    s = Side(border_style="thin", color=BORDER_COLOR)
    return Border(left=s, right=s, top=s, bottom=s)

align_center = Alignment(horizontal="center", vertical="center")
align_left   = Alignment(horizontal="left",   vertical="center", indent=1)
align_right  = Alignment(horizontal="right",  vertical="center")

MONTHS = [
    "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"
]

MONTHS_DISPLAY = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
]

SECTIONS = [
    {
        "header": "💰 REVENUS",
        "cats": ["Salaire", "Freelance", "Aides/APL", "Autres revenus"]
    },
    {
        "header": "🏠 DÉPENSES FIXES",
        "cats": ["Loyer/Crédit", "Assurances", "Abonnements", "Téléphone/Internet"]
    },
    {
        "header": "🛒 DÉPENSES VARIABLES",
        "cats": ["Alimentation", "Transport", "Santé", "Loisirs", "Shopping", "Restaurant", "Beauté", "Autre"]
    },
    {
        "header": "💳 CRÉDITS",
        "cats": ["Crédit auto", "Crédit conso", "Autre crédit"]
    },
    {
        "header": "🏦 ÉPARGNE",
        "cats": ["Livret A", "PEL", "Assurance-vie", "Investissements"]
    },
]


def style_cell(cell, bg=BG_DARK, fg=TEXT_WHITE, size=10, bold=False,
               align=None, num_fmt=None, border=True, font_name="Calibri"):
    cell.fill = fill(bg)
    cell.font = Font(color=fg, size=size, bold=bold, name=font_name)
    cell.alignment = align or align_left
    if num_fmt:
        cell.number_format = num_fmt
    if border:
        cell.border = thin_border()


def merge_title(ws, cell_range, text, bg, fg=TEXT_WHITE, size=11, bold=False, align=None):
    ws.merge_cells(cell_range)
    top_left_ref = cell_range.split(":")[0]
    cell = ws[top_left_ref]
    cell.value = text
    cell.fill = fill(bg)
    cell.font = Font(color=fg, size=size, bold=bold, name="Calibri")
    cell.alignment = align or align_center
    return cell


def set_col_widths(ws, widths):
    for col_letter, width in widths.items():
        ws.column_dimensions[col_letter].width = width


# ══════════════════════════════════════════════════════════════════════════════
# MONTHLY SHEET BUILDER
# ══════════════════════════════════════════════════════════════════════════════

def build_monthly(ws, month_name, month_display):
    ws.sheet_view.showGridLines = False
    ws.sheet_properties.tabColor = BG_CARD

    set_col_widths(ws, {
        "A": 25, "B": 14, "C": 14, "D": 14, "E": 10, "F": 22, "G": 6
    })

    # Row 1: Month title
    ws.row_dimensions[1].height = 36
    merge_title(ws, "A1:G1", f"📅 {month_display.upper()}", BG_CARD,
                size=18, bold=True)

    r = 2  # row counter

    total_rows = {}        # sec_idx -> row number of the TOTAL row
    section_ranges = {}    # sec_idx -> (first_cat_row, last_cat_row)

    for sec_idx, section in enumerate(SECTIONS):
        # Section header
        ws.row_dimensions[r].height = 22
        merge_title(ws, f"A{r}:G{r}", section["header"], BG_MID,
                    size=12, bold=True, align=align_left)
        r += 1

        # Column headers
        ws.row_dimensions[r].height = 18
        col_headers = ["Catégorie", "Budget Prévu", "Réel", "Écart", "%", "Progression", "✓"]
        for c_idx, hdr in enumerate(col_headers, start=1):
            cell = ws.cell(row=r, column=c_idx, value=hdr)
            style_cell(cell, bg=BG_CARD, fg=TEXT_WHITE, size=10, bold=True,
                       align=align_center)
        r += 1

        first_cat = r
        for cat in section["cats"]:
            ws.row_dimensions[r].height = 18

            # A: name
            cell = ws.cell(row=r, column=1, value=cat)
            style_cell(cell, bg=BG_DARK, fg=TEXT_WHITE, size=10, align=align_left)

            # B: budget input (yellow)
            cell = ws.cell(row=r, column=2)
            style_cell(cell, bg=INPUT_YELLOW, fg=BG_DARK, size=10,
                       align=align_right, num_fmt='#,##0.00 €')

            # C: real input (yellow)
            cell = ws.cell(row=r, column=3)
            style_cell(cell, bg=INPUT_YELLOW, fg=BG_DARK, size=10,
                       align=align_right, num_fmt='#,##0.00 €')

            # D: écart
            cell = ws.cell(row=r, column=4, value=f"=B{r}-C{r}")
            style_cell(cell, bg=BG_DARK, fg=TEXT_WHITE, size=10,
                       align=align_right, num_fmt='#,##0.00 €')

            # E: %
            cell = ws.cell(row=r, column=5,
                           value=f'=IF(B{r}=0,"—",C{r}/B{r})')
            style_cell(cell, bg=BG_DARK, fg=TEXT_WHITE, size=10,
                       align=align_center, num_fmt='0%')

            # F: progress bar
            formula_f = (
                f'=IF(B{r}=0,"",'
                f'REPT("▓",MIN(20,INT(C{r}/B{r}*20)))'
                f'&REPT("░",MAX(0,20-MIN(20,INT(C{r}/B{r}*20)))))'
            )
            cell = ws.cell(row=r, column=6, value=formula_f)
            cell.fill = fill(BG_DARK)
            cell.font = Font(color=ACCENT_SAGE, size=9, name="Courier New")
            cell.alignment = align_left
            cell.border = thin_border()

            # G: traffic light
            formula_g = (
                f'=IF(C{r}="","⬜",'
                f'IF(C{r}/B{r}<0.8,"🟢",'
                f'IF(C{r}/B{r}<=1,"🟡","🔴")))'
            )
            cell = ws.cell(row=r, column=7, value=formula_g)
            style_cell(cell, bg=BG_DARK, fg=TEXT_WHITE, size=12,
                       align=align_center, font_name="Segoe UI Emoji")

            r += 1

        last_cat = r - 1
        section_ranges[sec_idx] = (first_cat, last_cat)

        # Total row
        ws.row_dimensions[r].height = 20

        cell = ws.cell(row=r, column=1, value=f"TOTAL")
        style_cell(cell, bg=BG_MID, fg=ACCENT_GOLD, size=10, bold=True, align=align_left)

        cell = ws.cell(row=r, column=2, value=f"=SUM(B{first_cat}:B{last_cat})")
        style_cell(cell, bg=BG_MID, fg=ACCENT_GOLD, size=10, bold=True,
                   align=align_right, num_fmt='#,##0.00 €')

        cell = ws.cell(row=r, column=3, value=f"=SUM(C{first_cat}:C{last_cat})")
        style_cell(cell, bg=BG_MID, fg=ACCENT_GOLD, size=10, bold=True,
                   align=align_right, num_fmt='#,##0.00 €')

        cell = ws.cell(row=r, column=4, value=f"=B{r}-C{r}")
        style_cell(cell, bg=BG_MID, fg=ACCENT_GOLD, size=10, bold=True,
                   align=align_right, num_fmt='#,##0.00 €')

        cell = ws.cell(row=r, column=5, value=f'=IF(B{r}=0,"—",C{r}/B{r})')
        style_cell(cell, bg=BG_MID, fg=ACCENT_GOLD, size=10, bold=True,
                   align=align_center, num_fmt='0%')

        for col in [6, 7]:
            cell = ws.cell(row=r, column=col)
            style_cell(cell, bg=BG_MID, fg=TEXT_WHITE)

        total_rows[sec_idx] = r
        r += 1

        # Blank spacer
        ws.row_dimensions[r].height = 8
        for col in range(1, 8):
            cell = ws.cell(row=r, column=col)
            cell.fill = fill(BG_DARK)
        r += 1

    # ── Summary block ──
    r += 1  # extra gap

    rev_total_r = total_rows[0]
    fix_total_r = total_rows[1]
    var_total_r = total_rows[2]
    cre_total_r = total_rows[3]

    # We need to know row numbers before writing formulas for Solde/Taux
    rev_row   = r
    dep_row   = r + 1
    solde_row = r + 2
    taux_row  = r + 3
    obj_row   = r + 4

    summary_data = [
        (rev_row,   "Total Revenus",    f"=C{rev_total_r}",                                '#,##0.00 €', False),
        (dep_row,   "Total Dépenses",   f"=C{fix_total_r}+C{var_total_r}+C{cre_total_r}", '#,##0.00 €', False),
        (solde_row, "Solde du mois",    f"=C{rev_row}-C{dep_row}",                         '#,##0.00 €', True),
        (taux_row,  "Taux d'épargne",   f'=IF(C{rev_row}=0,"—",C{solde_row}/C{rev_row})', '0%',         True),
        (obj_row,   "Objectif Épargne", None,                                               '#,##0.00 €', False),
    ]

    for row_n, label, formula, num_fmt, is_key in summary_data:
        ws.row_dimensions[row_n].height = 22
        bg = BG_CARD if is_key else BG_MID
        fg = ACCENT_GOLD if is_key else TEXT_WHITE

        cell = ws.cell(row=row_n, column=1, value=label)
        style_cell(cell, bg=bg, fg=fg, size=11, bold=is_key, align=align_left)

        # B: empty
        cell = ws.cell(row=row_n, column=2)
        style_cell(cell, bg=bg, fg=fg)

        # C: value or input
        if label == "Objectif Épargne":
            cell = ws.cell(row=row_n, column=3)
            style_cell(cell, bg=INPUT_YELLOW, fg=BG_DARK, size=11, bold=True,
                       align=align_right, num_fmt=num_fmt)
        else:
            cell = ws.cell(row=row_n, column=3, value=formula)
            style_cell(cell, bg=bg, fg=fg, size=11, bold=is_key,
                       align=align_right, num_fmt=num_fmt)

        for col in range(4, 8):
            cell = ws.cell(row=row_n, column=col)
            style_cell(cell, bg=bg, fg=fg)

    ws.freeze_panes = "A3"

    summary_rows = {
        "Total Revenus":    rev_row,
        "Total Dépenses":   dep_row,
        "Solde du mois":    solde_row,
        "Taux d'épargne":   taux_row,
        "Objectif Épargne": obj_row,
    }

    return total_rows, summary_rows


# ══════════════════════════════════════════════════════════════════════════════
# DASHBOARD
# ══════════════════════════════════════════════════════════════════════════════

def build_dashboard(ws, month_total_rows_map, month_summary_rows_map):
    ws.sheet_view.showGridLines = False
    ws.sheet_properties.tabColor = ACCENT_GOLD

    set_col_widths(ws, {
        "A": 22, "B": 18, "C": 18, "D": 18,
        "E": 18, "F": 18, "G": 18, "H": 18,
        "I": 4,
        "J": 14, "K": 16, "L": 16, "M": 16
    })

    # Row 1: title
    ws.row_dimensions[1].height = 40
    merge_title(ws, "A1:H1", "📊 TABLEAU DE BORD ANNUEL", BG_CARD,
                size=20, bold=True)

    # Apply dark bg to visible range
    for row in ws.iter_rows(min_row=1, max_row=50, min_col=1, max_col=9):
        for cell in row:
            if cell.row == 1 and 1 <= cell.column <= 8:
                pass  # already handled by merge_title
            else:
                cell.fill = fill(BG_DARK)

    # ── Helper data table: rows 5-18, cols J-M ──
    helper_start = 5

    ws.row_dimensions[helper_start].height = 18
    h_headers = ["Mois", "Revenus", "Dépenses", "Solde"]
    for col_idx, hdr in enumerate(h_headers, start=10):
        cell = ws.cell(row=helper_start, column=col_idx, value=hdr)
        style_cell(cell, bg=BG_CARD, fg=TEXT_WHITE, size=10, bold=True, align=align_center)

    for m_idx, (month_key, month_display) in enumerate(zip(MONTHS, MONTHS_DISPLAY)):
        hr = helper_start + 1 + m_idx
        ws.row_dimensions[hr].height = 18

        s_rows = month_summary_rows_map[month_key]
        rev_sr   = s_rows["Total Revenus"]
        dep_sr   = s_rows["Total Dépenses"]
        solde_sr = s_rows["Solde du mois"]

        cell = ws.cell(row=hr, column=10, value=month_display)
        style_cell(cell, bg=BG_MID, fg=TEXT_WHITE, size=10, align=align_center)

        cell = ws.cell(row=hr, column=11, value=f"='{month_key}'!C{rev_sr}")
        style_cell(cell, bg=BG_MID, fg=TEXT_WHITE, size=10,
                   align=align_right, num_fmt='#,##0.00 €')

        cell = ws.cell(row=hr, column=12, value=f"='{month_key}'!C{dep_sr}")
        style_cell(cell, bg=BG_MID, fg=TEXT_WHITE, size=10,
                   align=align_right, num_fmt='#,##0.00 €')

        cell = ws.cell(row=hr, column=13, value=f"='{month_key}'!C{solde_sr}")
        style_cell(cell, bg=BG_MID, fg=TEXT_WHITE, size=10,
                   align=align_right, num_fmt='#,##0.00 €')

    data_start = helper_start + 1
    data_end   = helper_start + 12

    k_rng = f"K{data_start}:K{data_end}"
    l_rng = f"L{data_start}:L{data_end}"
    m_rng = f"M{data_start}:M{data_end}"
    j_rng = f"J{data_start}:J{data_end}"

    # ── KPI Cards ──
    # Layout: 4 cards in row 2-3, 2 cards in row 4
    # Each card: label row + value row, 2 cols wide
    kpi_cards = [
        ("💰 Revenus Annuels",    f"=SUM({k_rng})",                                        '#,##0.00 €', "A", "B"),
        ("💸 Total Dépenses",     f"=SUM({l_rng})",                                        '#,##0.00 €', "C", "D"),
        ("✅ Solde Annuel",       f"=SUM({m_rng})",                                        '#,##0.00 €', "E", "F"),
        ("📈 Taux Épargne Moyen", f'=IF(SUM({k_rng})=0,"—",SUM({m_rng})/SUM({k_rng}))',   '0%',         "G", "H"),
    ]

    ws.row_dimensions[2].height = 18
    ws.row_dimensions[3].height = 30

    for label, formula, num_fmt, col_s, col_e in kpi_cards:
        # Label row (row 2)
        ws.merge_cells(f"{col_s}2:{col_e}2")
        cell = ws[f"{col_s}2"]
        cell.value = label
        style_cell(cell, bg=BG_MID, fg=TEXT_MUTED, size=10, align=align_center, border=False)

        # Value row (row 3)
        ws.merge_cells(f"{col_s}3:{col_e}3")
        cell = ws[f"{col_s}3"]
        cell.value = formula
        style_cell(cell, bg=BG_CARD, fg=ACCENT_GOLD, size=14, bold=True,
                   align=align_center, num_fmt=num_fmt, border=False)

    # Two wide KPI cards in row 4
    ws.row_dimensions[4].height = 28

    best_formula  = f"=IFERROR(INDEX({j_rng},MATCH(MAX({m_rng}),{m_rng},0)),\"N/A\")"
    worst_formula = f"=IFERROR(INDEX({j_rng},MATCH(MIN({m_rng}),{m_rng},0)),\"N/A\")"

    ws.merge_cells("A4:B4")
    cell = ws["A4"]
    cell.value = "🏆 Meilleur Mois"
    style_cell(cell, bg=BG_MID, fg=TEXT_MUTED, size=10, align=align_center, border=False)

    ws.merge_cells("C4:D4")
    cell = ws["C4"]
    cell.value = best_formula
    style_cell(cell, bg=BG_CARD, fg=ACCENT_GOLD, size=13, bold=True,
               align=align_center, border=False)

    ws.merge_cells("E4:F4")
    cell = ws["E4"]
    cell.value = "⚠️ Pire Mois"
    style_cell(cell, bg=BG_MID, fg=TEXT_MUTED, size=10, align=align_center, border=False)

    ws.merge_cells("G4:H4")
    cell = ws["G4"]
    cell.value = worst_formula
    style_cell(cell, bg=BG_CARD, fg=ACCENT_TERRA, size=13, bold=True,
               align=align_center, border=False)

    # ── Bar Chart ──
    chart = BarChart()
    chart.type = "col"
    chart.title = "Revenus vs Dépenses par Mois"
    chart.y_axis.title = "Montant (€)"
    chart.x_axis.title = "Mois"
    chart.style = 10
    chart.width = 24
    chart.height = 14
    chart.grouping = "clustered"

    cats = Reference(ws, min_col=10, min_row=data_start, max_row=data_end)

    rev_ref = Reference(ws, min_col=11, min_row=data_start - 1,
                        max_col=11, max_row=data_end)
    rev_s = Series(rev_ref, title_from_data=True)
    rev_s.graphicalProperties.solidFill = ACCENT_SAGE

    dep_ref = Reference(ws, min_col=12, min_row=data_start - 1,
                        max_col=12, max_row=data_end)
    dep_s = Series(dep_ref, title_from_data=True)
    dep_s.graphicalProperties.solidFill = ACCENT_TERRA

    chart.series.append(rev_s)
    chart.series.append(dep_s)
    chart.set_categories(cats)

    ws.add_chart(chart, "A20")


# ══════════════════════════════════════════════════════════════════════════════
# TRANSACTIONS TAB
# ══════════════════════════════════════════════════════════════════════════════

def build_transactions(ws):
    ws.sheet_view.showGridLines = False
    ws.sheet_properties.tabColor = ACCENT_SAGE

    set_col_widths(ws, {
        "A": 14, "B": 30, "C": 20, "D": 14, "E": 12, "F": 14
    })

    ws.row_dimensions[1].height = 36
    merge_title(ws, "A1:F1", "💳 JOURNAL DES TRANSACTIONS", BG_CARD,
                size=16, bold=True)

    ws.row_dimensions[2].height = 22
    headers = ["Date", "Description", "Catégorie", "Montant", "Type", "Mois"]
    for col_idx, hdr in enumerate(headers, start=1):
        cell = ws.cell(row=2, column=col_idx, value=hdr)
        style_cell(cell, bg=BG_MID, fg=TEXT_WHITE, size=11, bold=True, align=align_center)

    for i in range(50):
        r = 3 + i
        ws.row_dimensions[r].height = 18
        bg = BG_DARK if i % 2 == 0 else BG_MID
        for col in range(1, 7):
            cell = ws.cell(row=r, column=col)
            al = align_right if col == 4 else align_center
            nm = '#,##0.00 €' if col == 4 else None
            style_cell(cell, bg=bg, fg=TEXT_WHITE, size=10, align=al, num_fmt=nm)

    ws.freeze_panes = "A3"


# ══════════════════════════════════════════════════════════════════════════════
# GUIDE TAB
# ══════════════════════════════════════════════════════════════════════════════

def build_guide(ws):
    ws.sheet_view.showGridLines = False
    ws.sheet_properties.tabColor = ACCENT_TERRA

    ws.column_dimensions["A"].width = 5
    ws.column_dimensions["B"].width = 50
    ws.column_dimensions["C"].width = 5
    ws.column_dimensions["D"].width = 30

    ws.row_dimensions[1].height = 36
    merge_title(ws, "A1:D1", "📖 GUIDE D'UTILISATION", BG_CARD,
                size=16, bold=True)

    guide_content = [
        ("🚀 DÉMARRAGE RAPIDE", True),
        ("1. Sélectionnez l'onglet du mois en cours (ex: Janvier)", False),
        ("2. Remplissez les cellules jaunes (Budget Prévu et Réel)", False),
        ("3. Les formules calculent automatiquement les écarts et %", False),
        ("4. Consultez le tableau de bord pour une vue annuelle", False),
        ("", False),
        ("💰 ONGLETS MENSUELS", True),
        ("• Colonnes jaunes = saisie utilisateur uniquement", False),
        ("• Colonne D (Écart) = Budget - Réel (auto)", False),
        ("• Colonne E (%) = Réel / Budget en pourcentage (auto)", False),
        ("• Colonne F = Barre de progression visuelle (auto)", False),
        ("• 🟢 = sous 80% du budget | 🟡 = 80-100% | 🔴 = dépassement", False),
        ("", False),
        ("📊 TABLEAU DE BORD", True),
        ("• Se met à jour automatiquement depuis les onglets mensuels", False),
        ("• Le graphique compare revenus vs dépenses sur l'année", False),
        ("• Identifie le meilleur et le pire mois automatiquement", False),
        ("", False),
        ("💳 JOURNAL DES TRANSACTIONS", True),
        ("• Saisissez chaque dépense/revenu au fil de l'eau", False),
        ("• Utilisez le champ Mois pour filtrer par période", False),
        ("", False),
        ("⚠️ CONSEILS IMPORTANTS", True),
        ("• Sauvegardez régulièrement votre fichier", False),
        ("• Ne supprimez pas les formules dans les colonnes D, E, F, G", False),
    ]

    for i, (text, is_header) in enumerate(guide_content):
        r = 2 + i
        ws.row_dimensions[r].height = 20 if is_header else 18
        bg = BG_CARD if is_header else BG_DARK
        fg = ACCENT_GOLD if is_header else TEXT_WHITE
        ws.merge_cells(f"A{r}:D{r}")
        cell = ws[f"A{r}"]
        cell.value = text
        cell.fill = fill(bg)
        cell.font = Font(color=fg, size=11 if is_header else 10,
                         bold=is_header, name="Calibri")
        cell.alignment = align_left


# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════

def main():
    output_dir  = "/home/user/claude-code/output"
    output_path = os.path.join(output_dir, "BudgetPro-Style.xlsx")
    os.makedirs(output_dir, exist_ok=True)

    wb = Workbook()
    wb.remove(wb.active)

    month_total_rows_map   = {}
    month_summary_rows_map = {}

    for month_key, month_display in zip(MONTHS, MONTHS_DISPLAY):
        ws = wb.create_sheet(title=month_key)
        ws.sheet_properties.tabColor = BG_CARD
        total_rows, summary_rows = build_monthly(ws, month_key, month_display)
        month_total_rows_map[month_key]   = total_rows
        month_summary_rows_map[month_key] = summary_rows

    ws_dash = wb.create_sheet(title="Dashboard")
    build_dashboard(ws_dash, month_total_rows_map, month_summary_rows_map)

    ws_trans = wb.create_sheet(title="Transactions")
    build_transactions(ws_trans)

    ws_guide = wb.create_sheet(title="Guide")
    build_guide(ws_guide)

    wb.save(output_path)
    print(f"File saved: {output_path}")


if __name__ == "__main__":
    main()
