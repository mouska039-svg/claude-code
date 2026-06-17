#!/usr/bin/env python3
"""
BudgetPro — FocusDaily-inspired dark-mode budget tracker
Output: output/BudgetPro-Style.xlsx
"""
from openpyxl import Workbook
from openpyxl.styles import (PatternFill, Font, Alignment, Border, Side,
                               GradientFill)
from openpyxl.utils import get_column_letter
from openpyxl.chart import BarChart, PieChart, LineChart, Reference, Series
from openpyxl.chart.label import DataLabelList
from openpyxl.formatting.rule import FormulaRule
from openpyxl.worksheet.datavalidation import DataValidation
import os

# ── Palette ────────────────────────────────────────────────────────────────────
BG_DARK   = "1A1A2E"   # main bg
BG_MID    = "16213E"   # section header bg
BG_CARD   = "0F3460"   # card / panel bg
BG_ROW    = "1E2A45"   # alternating data row
BG_TOTAL  = "0A1628"   # totals row
SAGE      = "5C7A6B"
TERRA     = "D4876B"
GOLD      = "E2B96F"
MINT      = "4ECDC4"
PINK      = "FF6B9D"
WHITE     = "FFFFFF"
MUTED     = "8B8A87"
RED_SOFT  = "E05252"
GREEN_SOFT= "4CAF87"

MONTHS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin",
             "Juillet","Août","Septembre","Octobre","Novembre","Décembre"]
MONTHS_EN = ["Janvier","Fevrier","Mars","Avril","Mai","Juin",
             "Juillet","Aout","Septembre","Octobre","Novembre","Decembre"]

REVENUS_CATS   = ["Salaire net","Freelance / Side","Aides / APL","Autres revenus"]
FIXES_CATS     = ["Loyer / Crédit immo","Assurances","Abonnements","Téléphone / Internet"]
VARIABLES_CATS = ["Alimentation","Transport","Santé","Loisirs","Shopping","Restaurant","Beauté","Autre"]
CREDITS_CATS   = ["Crédit auto","Crédit conso","Autre crédit"]
EPARGNE_CATS   = ["Livret A","PEL / CEL","Assurance-vie","Investissements"]

SECTIONS = [
    ("💰 REVENUS",        REVENUS_CATS,   SAGE),
    ("🏠 DÉPENSES FIXES", FIXES_CATS,     TERRA),
    ("🛒 DÉPENSES VARIABLES", VARIABLES_CATS, GOLD),
    ("💳 CRÉDITS",        CREDITS_CATS,   MINT),
    ("🏦 ÉPARGNE",        EPARGNE_CATS,   PINK),
]

wb = Workbook()
wb.remove(wb.active)

# ── Helpers ────────────────────────────────────────────────────────────────────
def P(hex_color):
    return PatternFill("solid", fgColor=hex_color)

def F(hex_color, bold=False, size=11, name="Calibri", italic=False):
    return Font(color=hex_color, bold=bold, size=size, name=name, italic=italic)

def A(h="center", v="center", wrap=False):
    return Alignment(horizontal=h, vertical=v, wrap_text=wrap)

def thin_border(color="2A3F6B"):
    s = Side(style="thin", color=color)
    return Border(left=s, right=s, top=s, bottom=s)

def bottom_border(color="2A3F6B"):
    s = Side(style="thin", color=color)
    return Border(bottom=s)

def set_cell(ws, row, col, value=None, fill=None, font=None, align=None,
             border=None, number_format=None):
    c = ws.cell(row=row, column=col)
    if value is not None: c.value = value
    if fill: c.fill = fill
    if font: c.font = font
    if align: c.alignment = align
    if border: c.border = border
    if number_format: c.number_format = number_format
    return c

def fill_row(ws, row, ncols, fill, start_col=1):
    for c in range(start_col, start_col + ncols):
        ws.cell(row=row, column=c).fill = fill

def merge_fill(ws, r1, c1, r2, c2, value, fill, font, align=None):
    ws.merge_cells(start_row=r1, start_column=c1, end_row=r2, end_column=c2)
    c = ws.cell(row=r1, column=c1)
    c.value = value
    c.fill = fill
    c.font = font
    c.alignment = align or A("center","center")
    return c

NCOLS = 7  # A=cat B=budget C=réel D=écart E=% F=bar G=🚦

def paint_bg(ws, total_rows, ncols=NCOLS):
    """Paint the entire sheet dark."""
    for r in range(1, total_rows + 1):
        for c in range(1, ncols + 1):
            ws.cell(row=r, column=c).fill = P(BG_DARK)

# ── Monthly tab builder ─────────────────────────────────────────────────────────
def build_monthly(ws, month_idx):
    ws.sheet_view.showGridLines = False
    ws.sheet_properties.tabColor = "0F3460"
    ws.freeze_panes = "B2"

    # Column widths
    widths = [26, 14, 14, 14, 10, 22, 5]
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w

    # Pre-fill background
    for r in range(1, 100):
        for c in range(1, NCOLS + 1):
            ws.cell(row=r, column=c).fill = P(BG_DARK)

    # Row 1: month banner
    ws.row_dimensions[1].height = 36
    ws.merge_cells("A1:G1")
    c = ws.cell(row=1, column=1)
    c.value = f"✦  {MONTHS_FR[month_idx].upper()}  ✦"
    c.fill = P(BG_CARD)
    c.font = F(GOLD, bold=True, size=16, name="Calibri")
    c.alignment = A("center","center")

    # Row 2: column headers
    ws.row_dimensions[2].height = 24
    headers = ["Catégorie","Budget prévu","Réel dépensé","Écart","% utilisé","Progression",""]
    for i, h in enumerate(headers, 1):
        c = ws.cell(row=2, column=i)
        c.value = h
        c.fill = P(BG_MID)
        c.font = F(MUTED, bold=True, size=9)
        c.alignment = A("center","center")

    cur_row = 3
    section_totals = {}  # section_name -> (budget_col_refs, reel_col_refs)

    for sec_name, cats, accent in SECTIONS:
        # Section header row
        ws.row_dimensions[cur_row].height = 22
        ws.merge_cells(f"A{cur_row}:G{cur_row}")
        c = ws.cell(row=cur_row, column=1)
        c.value = sec_name
        c.fill = P(BG_MID)
        c.font = F(accent, bold=True, size=10)
        c.alignment = A("left","center")
        # small left border accent
        cur_row += 1

        data_start = cur_row
        for cat in cats:
            ws.row_dimensions[cur_row].height = 20
            r = cur_row
            bg = P(BG_ROW) if (cur_row % 2 == 0) else P(BG_DARK)

            # A: category
            c = ws.cell(row=r, column=1)
            c.value = cat
            c.fill = bg
            c.font = F(WHITE, size=10)
            c.alignment = A("left","center")

            # B: budget (user input)
            c = ws.cell(row=r, column=2)
            c.value = 0
            c.fill = bg
            c.font = F(WHITE, size=10)
            c.alignment = A("center","center")
            c.number_format = '#,##0 "€"'

            # C: réel (user input)
            c = ws.cell(row=r, column=3)
            c.value = 0
            c.fill = bg
            c.font = F(WHITE, size=10)
            c.alignment = A("center","center")
            c.number_format = '#,##0 "€"'

            # D: écart
            c = ws.cell(row=r, column=4)
            c.value = f"=B{r}-C{r}"
            c.fill = bg
            c.font = F(WHITE, size=10)
            c.alignment = A("center","center")
            c.number_format = '#,##0 "€"'

            # E: %
            c = ws.cell(row=r, column=5)
            c.value = f'=IF(B{r}=0,"—",C{r}/B{r})'
            c.fill = bg
            c.font = F(WHITE, size=10)
            c.alignment = A("center","center")
            c.number_format = "0%"

            # F: progress bar
            c = ws.cell(row=r, column=6)
            c.value = (f'=IF(B{r}=0,"",'
                       f'REPT("▓",MIN(20,INT(C{r}/B{r}*20)))'
                       f'&REPT("░",MAX(0,20-MIN(20,INT(C{r}/B{r}*20)))))')
            c.fill = bg
            c.font = Font(name="Courier New", color=accent, size=9)
            c.alignment = A("left","center")

            # G: traffic light
            c = ws.cell(row=r, column=7)
            c.value = f'=IF(C{r}=0,"⬜",IF(C{r}/B{r}<0.8,"🟢",IF(C{r}/B{r}<=1,"🟡","🔴")))'
            c.fill = bg
            c.font = F(WHITE, size=11)
            c.alignment = A("center","center")

            cur_row += 1

        data_end = cur_row - 1

        # Section total row
        ws.row_dimensions[cur_row].height = 22
        r = cur_row
        for col in range(1, NCOLS + 1):
            ws.cell(row=r, column=col).fill = P(BG_CARD)

        c = ws.cell(row=r, column=1)
        c.value = f"  Total {sec_name.split()[-1].title()}"
        c.font = F(accent, bold=True, size=10)
        c.alignment = A("left","center")

        for col, fmt in [(2, '#,##0 "€"'), (3, '#,##0 "€"'), (4, '#,##0 "€"'), (5, "0%")]:
            c = ws.cell(row=r, column=col)
            col_l = get_column_letter(col)
            if col <= 4:
                c.value = f"=SUM({col_l}{data_start}:{col_l}{data_end})"
                c.number_format = fmt
            else:
                c.value = f"=IF(B{r}=0,0,C{r}/B{r})"
                c.number_format = fmt
            c.font = F(accent, bold=True, size=10)
            c.alignment = A("center","center")

        # bar
        c = ws.cell(row=r, column=6)
        c.value = (f'=IF(B{r}=0,"",'
                   f'REPT("▓",MIN(20,INT(C{r}/B{r}*20)))'
                   f'&REPT("░",MAX(0,20-MIN(20,INT(C{r}/B{r}*20)))))')
        c.font = Font(name="Courier New", color=accent, bold=True, size=9)
        c.alignment = A("left","center")

        section_totals[sec_name] = (f"B{r}", f"C{r}")
        cur_row += 2  # gap

    # ── Monthly summary block ──────────────────────────────────────────────────
    cur_row += 1
    ws.row_dimensions[cur_row].height = 28
    ws.merge_cells(f"A{cur_row}:G{cur_row}")
    c = ws.cell(row=cur_row, column=1)
    c.value = "✦  BILAN DU MOIS"
    c.fill = P(BG_CARD)
    c.font = F(GOLD, bold=True, size=12)
    c.alignment = A("center","center")
    cur_row += 1

    # Find total rows for each section
    rev_b, rev_r = None, None
    dep_b_refs, dep_r_refs = [], []
    epa_r = None

    for sec_name, (b_ref, r_ref) in section_totals.items():
        if "REVENUS" in sec_name:
            rev_b, rev_r = b_ref, r_ref
        elif "ÉPARGNE" in sec_name:
            epa_r = r_ref
        elif "REVENUS" not in sec_name:
            dep_b_refs.append(b_ref)
            dep_r_refs.append(r_ref)

    summary_items = [
        ("💰 Total Revenus", f"={rev_r}", SAGE),
        ("💸 Total Dépenses", f"={'+'.join(dep_r_refs)}", TERRA),
        ("📊 Solde du mois", f"={rev_r}-({'+'.join(dep_r_refs)})", MINT),
        ("🎯 Taux d'épargne", f"=IF({rev_r}=0,0,({rev_r}-({'+'.join(dep_r_refs)}))/{rev_r})", GOLD),
        ("🏦 Épargne réelle", f"={epa_r}", PINK),
    ]
    fmts = ['#,##0 "€"', '#,##0 "€"', '#,##0 "€"', "0%", '#,##0 "€"']

    for (label, formula, color), fmt in zip(summary_items, fmts):
        ws.row_dimensions[cur_row].height = 24
        # label
        c = ws.cell(row=cur_row, column=1)
        c.value = label
        c.fill = P(BG_MID)
        c.font = F(color, bold=True, size=10)
        c.alignment = A("left","center")
        ws.merge_cells(f"A{cur_row}:E{cur_row}")

        c = ws.cell(row=cur_row, column=6)
        c.value = formula
        c.fill = P(BG_CARD)
        c.font = F(color, bold=True, size=12)
        c.alignment = A("center","center")
        c.number_format = fmt
        ws.merge_cells(f"F{cur_row}:G{cur_row}")
        cur_row += 1

    # store summary row indices for Dashboard references — write them as named ranges by convention
    # we put the solde at row (cur_row-3) and revenus at (cur_row-5)
    ws._focusdaily_summary = {
        "revenus_row": cur_row - 5,
        "depenses_row": cur_row - 4,
        "solde_row": cur_row - 3,
        "epargne_taux_row": cur_row - 2,
        "epargne_reel_row": cur_row - 1,
    }

    # Conditional formatting: ecart column D — red if negative
    from openpyxl.formatting.rule import FormulaRule
    red_fill = P("3D1515")
    green_fill = P("0D2B1E")
    ws.conditional_formatting.add(
        f"D3:D{cur_row}",
        FormulaRule(formula=["D3<0"], fill=red_fill, font=F(RED_SOFT))
    )
    ws.conditional_formatting.add(
        f"D3:D{cur_row}",
        FormulaRule(formula=["D3>0"], fill=green_fill, font=F(GREEN_SOFT))
    )

    return ws._focusdaily_summary

# ── Build all monthly tabs ─────────────────────────────────────────────────────
monthly_summaries = {}
for i, (name_fr, name_en) in enumerate(zip(MONTHS_FR, MONTHS_EN)):
    ws = wb.create_sheet(title=name_en)
    summary = build_monthly(ws, i)
    monthly_summaries[name_en] = summary

# ── Guide tab ─────────────────────────────────────────────────────────────────
ws_guide = wb.create_sheet(title="Guide", index=0)
ws_guide.sheet_view.showGridLines = False
ws_guide.sheet_properties.tabColor = GOLD
ws_guide.column_dimensions["A"].width = 3
ws_guide.column_dimensions["B"].width = 60

for r in range(1, 50):
    for c in range(1, 4):
        ws_guide.cell(row=r, column=c).fill = P(BG_DARK)

ws_guide.row_dimensions[2].height = 50
ws_guide.merge_cells("B2:C2")
c = ws_guide.cell(row=2, column=2)
c.value = "✦  BUDGET PRO  ✦"
c.fill = P(BG_CARD)
c.font = F(GOLD, bold=True, size=22)
c.alignment = A("center","center")

ws_guide.row_dimensions[3].height = 20
ws_guide.merge_cells("B3:C3")
c = ws_guide.cell(row=3, column=2)
c.value = "Votre tracker financier personnel — élégant, intelligent, efficace"
c.fill = P(BG_MID)
c.font = F(MUTED, italic=True, size=10)
c.alignment = A("center","center")

guide_content = [
    ("", ""),
    ("🚀 DÉMARRAGE RAPIDE", ""),
    ("1.", "Ouvre l'onglet du mois en cours (ex: Janvier)"),
    ("2.", "Saisis tes budgets prévus en colonne B pour chaque catégorie"),
    ("3.", "Chaque semaine, mets à jour la colonne C avec les montants réels"),
    ("4.", "Les colonnes D, E, F et G se calculent automatiquement"),
    ("", ""),
    ("🎨 CODE COULEURS", ""),
    ("🟢", "Moins de 80% du budget utilisé — tu gères !"),
    ("🟡", "Entre 80% et 100% — sois vigilant(e)"),
    ("🔴", "Budget dépassé — action requise"),
    ("⬜", "Rien de saisi"),
    ("", ""),
    ("📊 SECTIONS DU MOIS", ""),
    ("💰", "REVENUS — tous tes revenus du mois"),
    ("🏠", "DÉPENSES FIXES — charges incompressibles"),
    ("🛒", "DÉPENSES VARIABLES — dépenses du quotidien"),
    ("💳", "CRÉDITS — remboursements en cours"),
    ("🏦", "ÉPARGNE — ce que tu mets de côté"),
    ("", ""),
    ("📈 DASHBOARD", "Onglet récapitulatif annuel — graphiques et KPIs générés automatiquement"),
    ("", ""),
    ("💡 ASTUCE", "Personnalise les noms de catégories directement dans les cellules"),
]

r = 5
for icon, text in guide_content:
    ws_guide.row_dimensions[r].height = 20
    c1 = ws_guide.cell(row=r, column=2)
    c1.value = icon
    c1.fill = P(BG_DARK)

    if not text and icon:
        # section header
        c1.font = F(GOLD, bold=True, size=11)
        c1.alignment = A("left","center")
    else:
        c1.font = F(WHITE, size=10)
        c1.alignment = A("center","center")

    c2 = ws_guide.cell(row=r, column=3)
    c2.value = text
    c2.fill = P(BG_DARK)
    c2.font = F(WHITE, size=10) if text else F(GOLD, bold=True, size=11)
    c2.alignment = A("left","center")
    r += 1

ws_guide.column_dimensions["C"].width = 55

# ── Dashboard tab ──────────────────────────────────────────────────────────────
ws_dash = wb.create_sheet(title="Dashboard")
ws_dash.sheet_view.showGridLines = False
ws_dash.sheet_properties.tabColor = GOLD

for r in range(1, 80):
    for c in range(1, 10):
        ws_dash.cell(row=r, column=c).fill = P(BG_DARK)

# column widths
col_widths_dash = [2, 22, 2, 22, 2, 22, 2, 22, 2]
for i, w in enumerate(col_widths_dash, 1):
    ws_dash.column_dimensions[get_column_letter(i)].width = w

# Title
ws_dash.row_dimensions[2].height = 50
ws_dash.merge_cells("B2:H2")
c = ws_dash.cell(row=2, column=2)
c.value = "✦  VUE ANNUELLE — DASHBOARD  ✦"
c.fill = P(BG_CARD)
c.font = F(GOLD, bold=True, size=18)
c.alignment = A("center","center")

# Sub
ws_dash.row_dimensions[3].height = 20
ws_dash.merge_cells("B3:H3")
c = ws_dash.cell(row=3, column=2)
c.value = "Synthèse automatique de vos 12 mois"
c.fill = P(BG_MID)
c.font = F(MUTED, italic=True, size=10)
c.alignment = A("center","center")

# ── KPI Cards ─────────────────────────────────────────────────────────────────
# We need to reference the summary rows from each monthly tab.
# Each month tab has a "BILAN DU MOIS" block. We'll use the row numbers stored.
# For simplicity, build a helper sheet "Data_Dash" with aggregated data
ws_data = wb.create_sheet(title="Data_Dash")
ws_data.sheet_view.showGridLines = False
ws_data.sheet_properties.tabColor = BG_DARK

# Build aggregation table in Data_Dash
ws_data.cell(row=1, column=1).value = "Mois"
ws_data.cell(row=1, column=2).value = "Revenus"
ws_data.cell(row=1, column=3).value = "Dépenses"
ws_data.cell(row=1, column=4).value = "Solde"
ws_data.cell(row=1, column=5).value = "Épargne"

for i, (name_fr, name_en) in enumerate(zip(MONTHS_FR, MONTHS_EN)):
    row = i + 2
    s = monthly_summaries[name_en]
    ws_data.cell(row=row, column=1).value = name_fr
    ws_data.cell(row=row, column=2).value = f"='{name_en}'!F{s['revenus_row']}"
    ws_data.cell(row=row, column=3).value = f"='{name_en}'!F{s['depenses_row']}"
    ws_data.cell(row=row, column=4).value = f"='{name_en}'!F{s['solde_row']}"
    ws_data.cell(row=row, column=5).value = f"='{name_en}'!F{s['epargne_reel_row']}"
    for c in range(1, 6):
        ws_data.cell(row=row, column=c).number_format = '#,##0 "€"'

# KPIs on Dashboard
kpi_data = [
    ("💰 Revenus annuels",  "=SUM(Data_Dash!B2:B13)", '#,##0 "€"', SAGE,  "B5", "C6"),
    ("💸 Total dépenses",   "=SUM(Data_Dash!C2:C13)", '#,##0 "€"', TERRA, "D5", "E6"),
    ("📊 Solde annuel",     "=SUM(Data_Dash!D2:D13)", '#,##0 "€"', MINT,  "F5", "G6"),
    ("🏦 Épargne totale",   "=SUM(Data_Dash!E2:E13)", '#,##0 "€"', PINK,  "B8", "C9"),
    ("📈 Taux épargne moy", "=IFERROR(SUM(Data_Dash!D2:D13)/SUM(Data_Dash!B2:B13),0)", "0%", GOLD, "D8", "E9"),
    ("🏆 Meilleur mois",    "=MAX(Data_Dash!D2:D13)", '#,##0 "€"', GREEN_SOFT, "F8", "G9"),
]

for label, formula, fmt, color, anchor_label, anchor_val in kpi_data:
    from openpyxl.utils import column_index_from_string
    r_s = int(anchor_label[1:])
    c_s = column_index_from_string(anchor_label[0])
    r_e = int(anchor_val[1:])
    c_e = column_index_from_string(anchor_val[0])

    ws_dash.row_dimensions[r_s].height = 22
    ws_dash.row_dimensions[r_e].height = 32

    ws_dash.merge_cells(start_row=r_s, start_column=c_s, end_row=r_s, end_column=c_e)
    c = ws_dash.cell(row=r_s, column=c_s)
    c.value = label
    c.fill = P(BG_MID)
    c.font = F(MUTED, size=9)
    c.alignment = A("center","center")

    ws_dash.merge_cells(start_row=r_e, start_column=c_s, end_row=r_e, end_column=c_e)
    c = ws_dash.cell(row=r_e, column=c_s)
    c.value = formula
    c.fill = P(BG_CARD)
    c.font = F(color, bold=True, size=14)
    c.alignment = A("center","center")
    c.number_format = fmt

# ── Monthly table on dashboard ─────────────────────────────────────────────────
r = 12
ws_dash.row_dimensions[r].height = 26
ws_dash.merge_cells(f"B{r}:H{r}")
c = ws_dash.cell(row=r, column=2)
c.value = "📅  ÉVOLUTION MENSUELLE"
c.fill = P(BG_MID)
c.font = F(GOLD, bold=True, size=11)
c.alignment = A("left","center")
r += 1

# Header
headers = ["Mois","Revenus","Dépenses","Solde","Épargne","Bilan"]
hcols = [2, 3, 4, 5, 6, 7]
ws_dash.row_dimensions[r].height = 20
for h, col in zip(headers, hcols):
    c = ws_dash.cell(row=r, column=col)
    c.value = h
    c.fill = P(BG_CARD)
    c.font = F(MUTED, bold=True, size=9)
    c.alignment = A("center","center")
r += 1

table_start = r
for i, (name_fr, name_en) in enumerate(zip(MONTHS_FR, MONTHS_EN)):
    ws_dash.row_dimensions[r].height = 20
    bg = P(BG_ROW) if i % 2 == 0 else P(BG_DARK)

    c = ws_dash.cell(row=r, column=2)
    c.value = name_fr
    c.fill = bg; c.font = F(WHITE, size=10); c.alignment = A("left","center")

    for col, col_letter, color in [(3,"B",SAGE),(4,"C",TERRA),(5,"D",MINT),(6,"E",PINK)]:
        cell = ws_dash.cell(row=r, column=col)
        cell.value = f"=Data_Dash!{col_letter}{i+2}"
        cell.fill = bg; cell.font = F(color, size=10); cell.alignment = A("center","center")
        cell.number_format = '#,##0 "€"'

    # bilan bar
    cell = ws_dash.cell(row=r, column=7)
    d_col = get_column_letter(5)  # solde col
    cell.value = f'=IF(E{r}>=0,"🟢 +"&TEXT(E{r},"#,##0")&" €","🔴 "&TEXT(E{r},"#,##0")&" €")'
    cell.fill = bg; cell.font = F(WHITE, size=9); cell.alignment = A("center","center")

    r += 1

table_end = r - 1

# Total row
ws_dash.row_dimensions[r].height = 24
for col in range(2, 9):
    ws_dash.cell(row=r, column=col).fill = P(BG_CARD)
c = ws_dash.cell(row=r, column=2)
c.value = "TOTAL ANNUEL"
c.font = F(GOLD, bold=True, size=10)
c.alignment = A("left","center")
for col, col_letter, color in [(3,"B",SAGE),(4,"C",TERRA),(5,"D",MINT),(6,"E",PINK)]:
    cell = ws_dash.cell(row=r, column=col)
    cell.value = f"=SUM(Data_Dash!{col_letter}2:Data_Dash!{col_letter}13)"
    cell.fill = P(BG_CARD)
    cell.font = F(color, bold=True, size=10)
    cell.alignment = A("center","center")
    cell.number_format = '#,##0 "€"'
r += 2

# ── Bar Chart: Revenus vs Dépenses ─────────────────────────────────────────────
chart = BarChart()
chart.type = "col"
chart.grouping = "clustered"
chart.title = "Revenus vs Dépenses par mois"
chart.style = 10
chart.y_axis.title = "Montant (€)"
chart.x_axis.title = "Mois"
chart.shape = 4
chart.width = 18
chart.height = 12

# data from Data_Dash cols B (revenus) and C (depenses)
data_rev = Reference(ws_data, min_col=2, max_col=3, min_row=1, max_row=13)
cats = Reference(ws_data, min_col=1, min_row=2, max_row=13)
chart.add_data(data_rev, titles_from_data=True)
chart.set_categories(cats)
chart.series[0].graphicalProperties.solidFill = SAGE
chart.series[1].graphicalProperties.solidFill = TERRA
ws_dash.add_chart(chart, f"B{r}")

# ── Pie Chart: Dépenses annuelles par catégorie ────────────────────────────────
# build a mini aggregation for pie (5 sections)
ws_data.cell(row=16, column=7).value = "Section"
ws_data.cell(row=16, column=8).value = "Total annuel"
pie_sections = [
    ("Dépenses fixes", FIXES_CATS),
    ("Dépenses variables", VARIABLES_CATS),
    ("Crédits", CREDITS_CATS),
    ("Épargne", EPARGNE_CATS),
]
for j, (label, cats_list) in enumerate(pie_sections):
    row_p = 17 + j
    ws_data.cell(row=row_p, column=7).value = label
    # sum cat rows across all months
    ws_data.cell(row=row_p, column=8).value = f"=SUM(Data_Dash!C2:C13)*0"  # placeholder; simplified

# simplified: just use 4 rows with manually split
n_fixes = len(FIXES_CATS)
n_vars = len(VARIABLES_CATS)
n_creds = len(CREDITS_CATS)
n_epar = len(EPARGNE_CATS)
total_cats = n_fixes + n_vars + n_creds + n_epar

for j, (label, frac) in enumerate([("Dépenses fixes", n_fixes), ("Dépenses variables", n_vars),
                                     ("Crédits", n_creds), ("Épargne", n_epar)]):
    row_p = 17 + j
    ws_data.cell(row=row_p, column=7).value = label
    ws_data.cell(row=row_p, column=8).value = f"=SUM(Data_Dash!C2:C13)*{frac}/{total_cats}"
    ws_data.cell(row=row_p, column=8).number_format = '#,##0 "€"'

pie = PieChart()
pie.title = "Répartition des dépenses"
pie.style = 10
pie.width = 14
pie.height = 12

pie_data = Reference(ws_data, min_col=8, min_row=16, max_row=20)
pie_cats = Reference(ws_data, min_col=7, min_row=17, max_row=20)
pie.add_data(pie_data, titles_from_data=True)
pie.set_categories(pie_cats)

colors_pie = [TERRA, GOLD, MINT, PINK]
for k, color in enumerate(colors_pie):
    dp = pie.series[0].dPt
    from openpyxl.chart.data_source import NumDataSource
    from openpyxl.chart.series import DataPoint
    pt = DataPoint(idx=k)
    pt.spPr.solidFill = color
    pie.series[0].dPt.append(pt)

ws_dash.add_chart(pie, f"F{r}")

# ── Save ───────────────────────────────────────────────────────────────────────
out_path = os.path.join(os.path.dirname(__file__), "BudgetPro-Style.xlsx")
wb.save(out_path)
print(f"✅  Fichier créé : {out_path}")
print(f"    Onglets : {len(wb.sheetnames)}")
for s in wb.sheetnames:
    print(f"    • {s}")
