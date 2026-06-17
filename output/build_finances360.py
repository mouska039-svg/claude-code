#!/usr/bin/env python3
"""
Finances360 — Dashboard tout-en-un. Architecture transactionnelle :
une table de saisie → tout le dashboard se calcule en live via SUMPRODUCT + TODAY().
"""
import sys
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.formatting.rule import FormulaRule, ColorScaleRule
from openpyxl.utils import get_column_letter as col
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.chart import BarChart, LineChart, PieChart, Reference
from openpyxl.chart.series import DataPoint
from datetime import date, timedelta
import random

# ── Palette ──────────────────────────────────────────────────────────────────
C = {
    "black":     "0D1117",
    "dark":      "1A2E1E",
    "dark2":     "243B27",
    "sage":      "2E6B4F",
    "sage_md":   "5C7A6B",
    "sage_lt":   "A8C4B8",
    "sage_pale": "D8EBE4",
    "terra":     "D4876B",
    "terra_lt":  "F0C9B7",
    "terra_pale":"FBF0EB",
    "gold":      "E8B84B",
    "gold_pale": "FBF0C7",
    "cream":     "F5EFE6",
    "cream2":    "EDE5D8",
    "white":     "FFFFFF",
    "red":       "C0392B",
    "red_lt":    "FDE8E4",
    "green":     "27AE60",
    "green_lt":  "E8F5EE",
    "blue":      "2980B9",
    "blue_lt":   "EBF5FB",
    "ink":       "2C2C2A",
    "mist":      "8B8A87",
}

CATS = [
    ("🏠 Logement",     900),
    ("🛒 Alimentation", 450),
    ("🚗 Transport",    200),
    ("💊 Santé",        100),
    ("🎮 Loisirs",      150),
    ("📱 Abonnements",   60),
    ("👗 Shopping",     120),
    ("💡 Divers",        80),
]
MONTHS_FR    = ["Janvier","Février","Mars","Avril","Mai","Juin",
                "Juillet","Août","Septembre","Octobre","Novembre","Décembre"]
MONTHS_SHORT = ["Jan","Fév","Mar","Avr","Mai","Jun",
                "Jul","Aoû","Sep","Oct","Nov","Déc"]

# ── Style helpers ─────────────────────────────────────────────────────────────
def F(c="2C2C2A", sz=10, bold=False, italic=False):
    return Font(color=c, size=sz, bold=bold, italic=italic, name="Calibri")
def P(h):  return PatternFill("solid", fgColor=h)
def A(h="center", v="center", wrap=False):
    return Alignment(horizontal=h, vertical=v, wrap_text=wrap)
def B(color="D4C9B8", style="thin"):
    s = Side(style=style, color=color)
    return Border(top=s, bottom=s, left=s, right=s)
def Bout(color="1A2E1E"):
    s = Side(style="medium", color=color)
    return Border(top=s, bottom=s, left=s, right=s)
def Bbot(color="D4C9B8"):
    s = Side(style="thin", color=color)
    n = Side(style=None)
    return Border(top=n, bottom=s, left=n, right=n)
def Bnone():
    n = Side(style=None)
    return Border(top=n, bottom=n, left=n, right=n)

def cell(ws, r, c_idx, val="", bg=None, fg="2C2C2A", sz=10, bold=False,
         h="left", v="center", wrap=False, fmt=None, italic=False, border=True,
         font_name="Calibri"):
    ce = ws.cell(row=r, column=c_idx, value=val)
    if bg:
        ce.fill = bg if isinstance(bg, PatternFill) else P(bg)
    ce.font = Font(color=fg, size=sz, bold=bold, italic=italic, name=font_name)
    ce.alignment = A(h, v, wrap)
    if border: ce.border = B()
    if fmt: ce.number_format = fmt
    return ce

def merge(ws, r1, c1, r2, c2, val="", bg=None, fg="2C2C2A", sz=10, bold=False,
          h="center", v="center", wrap=False, fmt=None, italic=False):
    ws.merge_cells(start_row=r1, start_column=c1, end_row=r2, end_column=c2)
    ce = ws.cell(row=r1, column=c1, value=val)
    if bg: ce.fill = P(bg)
    ce.font = Font(color=fg, size=sz, bold=bold, italic=italic, name="Calibri")
    ce.alignment = A(h, v, wrap)
    if fmt: ce.number_format = fmt
    return ce

def set_widths(ws, widths):
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[col(i)].width = w

def rh(ws, row, h):
    ws.row_dimensions[row].height = h

# ── SUMPRODUCT formula helpers ────────────────────────────────────────────────
TR = "Transactions"
MAX_ROW = 501  # rows 2-501 in Transactions

def _tr(col_letter):
    return f"{TR}!${col_letter}$2:${col_letter}${MAX_ROW}"

def sum_month_type(month_num, type_str):
    """Total pour un mois + type ('Revenu'/'Dépense')."""
    return (f"=SUMPRODUCT(({_tr('A')}<>\"\")*"
            f"(MONTH({_tr('A')})={month_num})*"
            f"(YEAR({_tr('A')})=YEAR(TODAY()))*"
            f"({_tr('C')}=\"{type_str}\")*{_tr('D')})")

def sum_current_month_type(type_str):
    return (f"=SUMPRODUCT(({_tr('A')}<>\"\")*"
            f"(MONTH({_tr('A')})=MONTH(TODAY()))*"
            f"(YEAR({_tr('A')})=YEAR(TODAY()))*"
            f"({_tr('C')}=\"{type_str}\")*{_tr('D')})")

def sum_current_month_cat(cat_name, type_str="Dépense"):
    return (f"=SUMPRODUCT(({_tr('A')}<>\"\")*"
            f"(MONTH({_tr('A')})=MONTH(TODAY()))*"
            f"(YEAR({_tr('A')})=YEAR(TODAY()))*"
            f"({_tr('B')}=\"{cat_name}\")*"
            f"({_tr('C')}=\"{type_str}\")*{_tr('D')})")

def sum_month_cat(month_num, cat_name, type_str="Dépense"):
    return (f"=SUMPRODUCT(({_tr('A')}<>\"\")*"
            f"(MONTH({_tr('A')})={month_num})*"
            f"(YEAR({_tr('A')})=YEAR(TODAY()))*"
            f"({_tr('B')}=\"{cat_name}\")*"
            f"({_tr('C')}=\"{type_str}\")*{_tr('D')})")

def count_current_month():
    return (f"=SUMPRODUCT(({_tr('A')}<>\"\")*"
            f"(MONTH({_tr('A')})=MONTH(TODAY()))*"
            f"(YEAR({_tr('A')})=YEAR(TODAY())))")

# ── REPT bar formula (ref to dépensé cell / budget cell) ─────────────────────
def rept_bar(dep_ref, bud_ref, size=22):
    return (f"=IF({bud_ref}=0,\"—\","
            f"REPT(\"▓\",MIN({size},INT({dep_ref}/{bud_ref}*{size})))&"
            f"REPT(\"░\",MAX(0,{size}-MIN({size},INT({dep_ref}/{bud_ref}*{size})))))")

def status_formula(dep_ref, bud_ref):
    return (f"=IF({dep_ref}=0,\"⬜\","
            f"IF({dep_ref}/{bud_ref}<0.8,\"🟢\","
            f"IF({dep_ref}/{bud_ref}<=1,\"🟡\",\"🔴\")))")

# ── Sample transactions (gives life to the dashboard on first open) ───────────
def generate_sample_transactions():
    today = date.today()
    year  = today.year
    # Generate ~40 transactions spread across the last 3 months
    samples = []
    notes_by_cat = {
        "🏠 Logement":     ["Loyer", "Eau / EDF", "Assurance habitation", "Internet"],
        "🛒 Alimentation": ["Courses Carrefour", "Lidl", "Marché bio", "Boulangerie",
                            "Monoprix", "Amazon Fresh"],
        "🚗 Transport":    ["Essence Total", "SNCF Paris-Lyon", "Uber", "Parking",
                            "Contrôle technique", "Autoroute"],
        "💊 Santé":        ["Pharmacie", "Médecin généraliste", "Dentiste",
                            "Mutuelle santé"],
        "🎮 Loisirs":      ["Netflix", "Ciné MK2", "Restaurant Le Bistrot",
                            "Bar le week-end", "Jeux vidéo Steam"],
        "📱 Abonnements":  ["Spotify", "Canal+", "iCloud 200 Go", "Adobe CC"],
        "👗 Shopping":     ["Zara", "ASOS", "Fnac", "Amazon"],
        "💡 Divers":       ["Cadeau anniversaire", "Don association", "Coiffeur"],
    }
    # Fixed monthly items (logement/abonnements)
    for m_offset in range(3):
        m = today.month - m_offset
        y = year
        if m <= 0: m += 12; y -= 1
        # Loyer
        samples.append((date(y, m, 1), "🏠 Logement", "Dépense", 900, "Loyer"))
        # Abonnements
        for ab, amt in [("Spotify",10),("Netflix",14),("iCloud 200 Go",3),("Canal+",35)]:
            samples.append((date(y, m, 5), "📱 Abonnements", "Dépense", amt, ab))
        # Salaire
        samples.append((date(y, m, 28 if m_offset > 0 else min(28, today.day-1) or 1),
                        "Salaire", "Revenu", 2800, "Virement employeur"))

    # Variable spending
    for _ in range(45):
        m_offset = random.randint(0, 2)
        m = today.month - m_offset
        y = year
        if m <= 0: m += 12; y -= 1
        max_day = 28 if m_offset == 0 else 28
        d_num = random.randint(1, max_day)
        if m_offset == 0 and d_num >= today.day:
            d_num = max(1, today.day - 1)
        cat, budget = random.choice(CATS)
        note = random.choice(notes_by_cat.get(cat, ["Dépense courante"]))
        amt  = round(random.uniform(8, min(budget * 0.4, 120)), 2)
        samples.append((date(y, m, d_num), cat, "Dépense", amt, note))

    samples.sort(key=lambda x: x[0])
    return samples


# ── Tab 1: Paramètres ─────────────────────────────────────────────────────────
def build_params(ws):
    set_widths(ws, [3, 26, 16, 4, 26, 16, 3])
    rh(ws, 1, 8)

    merge(ws, 2, 2, 2, 6,
          "⚙️  PARAMÈTRES — Catégories & Budgets mensuels",
          C["dark"], C["white"], 12, True)
    rh(ws, 2, 32)

    for c_idx, h in zip([2,3], ["Catégorie dépense", "Budget mensuel"]):
        cell(ws, 3, c_idx, h, C["sage_md"], C["white"], 9, True, "center")
    rh(ws, 3, 18)

    for i, (cat, bud) in enumerate(CATS):
        r = 4 + i
        alt = C["cream2"] if i % 2 else C["white"]
        cell(ws, r, 2, cat, alt, C["ink"], 10, h="left")
        cell(ws, r, 3, bud, C["white"] if i%2 else C["cream"],
             C["ink"], 10, h="right", fmt="#,##0 €")
        rh(ws, r, 18)

    # Types of transactions (for dropdown)
    rh(ws, 13, 6)
    cell(ws, 14, 2, "Types de transactions", C["sage_md"], C["white"], 9, True, "center")
    rh(ws, 14, 18)
    for i, t in enumerate(["Dépense", "Revenu"]):
        cell(ws, 15+i, 2, t, C["cream"] if i%2 else C["white"], C["ink"], 10, h="left")
        rh(ws, 15+i, 18)

    # Right column: tips
    merge(ws, 3, 5, 3, 6, "📌  Comment personnaliser", C["sage"], C["white"], 9, True)
    tips = [
        "Modifiez les budgets colonne C.",
        "Ajoutez des catégories sous la ligne 11.",
        "Mettez à jour le menu déroulant dans",
        "l'onglet Transactions si vous changez",
        "les catégories (plage Paramètres!B2:B9).",
    ]
    for i, t in enumerate(tips):
        merge(ws, 4+i, 5, 4+i, 6, f"  {t}",
              C["gold_pale"] if i%2 else C["cream2"], C["ink"], 9, False, "left")
        rh(ws, 4+i, 16)
    ws.sheet_view.showGridLines = False


# ── Tab 2: Transactions ───────────────────────────────────────────────────────
def build_transactions(ws, samples):
    # A=pad B=date C=cat D=type E=montant F=note  (G=mois hidden)
    set_widths(ws, [3, 16, 24, 14, 14, 32, 10, 3])
    rh(ws, 1, 8)

    merge(ws, 2, 2, 2, 7,
          "📝  TRANSACTIONS  —  Saisissez chaque opération ici",
          C["dark"], C["white"], 12, True)
    rh(ws, 2, 32)

    # Helper notice
    merge(ws, 3, 2, 3, 7,
          "  ✦  Entrez Date · Catégorie · Type (Dépense / Revenu) · Montant · Note"
          "  —  Le Dashboard se met à jour automatiquement",
          C["sage_pale"], C["sage"], 9, False, "left", italic=True)
    rh(ws, 3, 18)

    hdrs = ["Date", "Catégorie", "Type", "Montant", "Note"]
    for ci, h in enumerate(hdrs, 2):
        bg = C["dark"] if ci < 6 else C["dark2"]
        cell(ws, 4, ci, h, C["dark"], C["white"], 9, True, "center")
    rh(ws, 4, 20)

    # Dropdowns
    cats_formula = f"Paramètres!$B$4:$B${4+len(CATS)-1}"
    dv_cat = DataValidation(type="list", formula1=f"Paramètres!$B$4:$B${3+len(CATS)}")
    dv_cat.sqref = "C5:C500"
    ws.add_data_validation(dv_cat)
    dv_type = DataValidation(type="list", formula1='"Dépense,Revenu"')
    dv_type.sqref = "D5:D500"
    ws.add_data_validation(dv_type)

    # Sample data
    for i, (dt, cat, tp, amt, note) in enumerate(samples):
        r = 5 + i
        alt = C["terra_pale"] if tp == "Dépense" and i%2==0 else \
              C["cream"] if tp == "Dépense" else \
              C["green_lt"] if i%2==0 else C["sage_pale"]
        cell(ws, r, 2, dt,  alt, C["ink"], 10, h="center", fmt="dd/mm/yyyy")
        cell(ws, r, 3, cat, alt, C["ink"], 10, h="left")
        fg_tp = C["red"] if tp == "Dépense" else C["green"]
        cell(ws, r, 4, tp,  alt, fg_tp,   10, bold=True, h="center")
        cell(ws, r, 5, amt, alt, fg_tp if tp=="Dépense" else C["green"],
             10, bold=True, h="right",
             fmt='#,##0.00 €')
        cell(ws, r, 6, note, alt, C["mist"], 9, h="left")
        rh(ws, r, 17)

    # Empty input rows styling
    for r in range(5 + len(samples), 60):
        for c_idx in range(2, 7):
            ce = ws.cell(row=r, column=c_idx)
            ce.fill  = P(C["cream"] if r % 2 else C["white"])
            ce.border = B()
        rh(ws, r, 17)

    # Conditional: green row if Revenu
    ws.conditional_formatting.add(
        f"B5:F500",
        FormulaRule(formula=["$D5=\"Revenu\""],
                    fill=P(C["green_lt"]),
                    font=Font(color=C["green"], name="Calibri")))
    # Red row if over 200€
    ws.conditional_formatting.add(
        f"E5:E500",
        FormulaRule(formula=["E5>200"],
                    fill=P(C["red_lt"]),
                    font=Font(color=C["red"], bold=True, name="Calibri")))

    ws.freeze_panes = "B5"
    ws.sheet_view.showGridLines = False


# ── Tab 3: Dashboard ──────────────────────────────────────────────────────────
# Col layout:
# A(2) B(22) C(14) D(14) E(14) F(4) G(26) H(8) I(14) J(2)
DCOLS = [2, 22, 14, 14, 14, 4, 26, 8, 14, 2]

def build_dashboard(ws, wb):
    set_widths(ws, DCOLS)

    # ── HERO BANNER ──────────────────────────────────────────────────────────
    rh(ws, 1, 6)

    # Row 2-4: Big title
    merge(ws, 2, 2, 4, 9,
          "FINANCES 360°\n tableau de bord personnel",
          C["black"], C["white"], 22, True, "center")
    rh(ws, 2, 18); rh(ws, 3, 22); rh(ws, 4, 16)

    # Row 5: Month auto-detected strip
    merge(ws, 5, 2, 5, 5,
          '=UPPER(TEXT(TODAY(),"mmmm yyyy"))',
          C["dark"], C["gold"], 13, True, "left")
    merge(ws, 5, 6, 5, 7,
          '="Jour "&DAY(TODAY())&" / "&DAY(EOMONTH(TODAY(),0))',
          C["dark2"], C["sage_lt"], 11, False, "center")
    merge(ws, 5, 8, 5, 9,
          "→ Saisir",
          C["terra"], C["white"], 10, True, "center")
    rh(ws, 5, 26)

    rh(ws, 6, 8)

    # ── KPI CARDS ROW 1 (rows 7-9) ───────────────────────────────────────────
    merge(ws, 7, 2, 7, 9, "  ◆  INDICATEURS DU MOIS EN COURS",
          C["dark2"], C["sage_lt"], 9, False, "left")
    rh(ws, 7, 20)

    kpis_r1 = [
        (2, 4, "💼 REVENUS",   sum_current_month_type("Revenu"),
         "#,##0 €", C["sage"],  C["white"]),
        (5, 6, "💸 DÉPENSES",  sum_current_month_type("Dépense"),
         "#,##0 €", C["terra"], C["white"]),
        (7, 8, "💚 ÉPARGNE",
         f"={sum_current_month_type('Revenu')[1:]}-{sum_current_month_type('Dépense')[1:]}",
         "#,##0 €", C["sage"],  C["white"]),
        (9, 9, "%",
         f"=IFERROR({sum_current_month_type('Dépense')[1:]}"
         f"/{sum_current_month_type('Revenu')[1:]},0)",
         "0.0%", C["dark"], C["gold"]),
    ]
    for c1, c2, lbl, val, fmt, bg, fg in kpis_r1:
        merge(ws, 8, c1, 8, c2, lbl, bg, fg, 8, False, "center")
        merge(ws, 9, c1, 9, c2, val, bg, C["gold"] if bg==C["dark"] else C["white"],
              18, True, "center", fmt=fmt)
    rh(ws, 8, 18); rh(ws, 9, 30)

    kpis_r2 = [
        (2, 3, "📊 NB TRANSACTIONS", count_current_month(), "0", C["dark2"], C["sage_lt"]),
        (4, 5, "📅 JOURS RESTANTS",
         "=DAY(EOMONTH(TODAY(),0))-DAY(TODAY())",
         "0 j", C["dark2"], C["sage_lt"]),
        (6, 7, "📉 MOY. / JOUR",
         f"=IFERROR({sum_current_month_type('Dépense')[1:]}/DAY(TODAY()),0)",
         "#,##0 €", C["dark2"], C["sage_lt"]),
        (8, 9, "🏆 TOP CATÉGORIE",
         f"=IFERROR(INDEX(Paramètres!$B$4:$B${3+len(CATS)},"
         f"MATCH(MAX(SUMPRODUCT((MONTH({_tr('A')})=MONTH(TODAY()))*(YEAR({_tr('A')})=YEAR(TODAY()))*({_tr('C')}=\"Dépense\")*({_tr('B')}=Paramètres!$B4)*{_tr('D')})),"
         f"0)),\"—\")",
         "@", C["dark2"], C["gold"]),
    ]
    for c1, c2, lbl, val, fmt, bg, fg in kpis_r2:
        merge(ws, 10, c1, 10, c2, lbl, bg, fg, 8, False, "center")
        merge(ws, 11, c1, 11, c2, val, bg, C["gold"], 14, True, "center", fmt=fmt)
    rh(ws, 10, 18); rh(ws, 11, 26)

    rh(ws, 12, 10)

    # ── CATEGORY BREAKDOWN ───────────────────────────────────────────────────
    merge(ws, 13, 2, 13, 9, "  ◆  BUDGET PAR CATÉGORIE  —  Ce mois",
          C["dark2"], C["sage_lt"], 9, False, "left")
    rh(ws, 13, 20)

    # Header row
    for c_idx, h, bg in [
        (2, "Catégorie",   C["dark"]),
        (3, "Budget",      C["dark"]),
        (4, "Dépensé",     C["dark"]),
        (5, "Restant",     C["dark"]),
        (7, "▓▓▓ Progression", C["dark"]),
        (8, "🚦",          C["dark"]),
        (9, "% utilisé",   C["dark"]),
    ]:
        cell(ws, 14, c_idx, h, C["dark"], C["white"], 9, True, "center")
    rh(ws, 14, 20)

    # Data rows
    dep_cells = {}  # cat → (dep_row, dep_col)
    for i, (cat, budget) in enumerate(CATS):
        r = 15 + i
        alt = C["cream2"] if i%2 else C["white"]

        cell(ws, r, 2, cat, alt, C["ink"], 10, h="left")

        # Budget from Paramètres (dynamic reference)
        bud_ref = f"Paramètres!$C${4+i}"
        cell(ws, r, 3, f"={bud_ref}", alt, C["ink"], 10, h="right", fmt="#,##0 €")

        # Dépensé (SUMPRODUCT)
        dep_formula = sum_current_month_cat(cat)
        cell(ws, r, 4, dep_formula, P("FFF8F0") if i%2 else P("FFFDF7"),
             C["terra"], 10, bold=True, h="right", fmt="#,##0 €", border=True)

        # Restant
        cell(ws, r, 5, f"={col(3)}{r}-{col(4)}{r}", alt, C["ink"], 10, h="right",
             fmt="#,##0 €")

        # Bar (col G=7)
        bar_cell = ws.cell(row=r, column=7,
                           value=rept_bar(f"D{r}", f"C{r}"))
        bar_cell.fill  = P(alt)
        bar_cell.font  = Font(name="Courier New", size=9,
                              color=C["sage_md"])
        bar_cell.alignment = A("left")
        bar_cell.border = B()

        # Status (col H=8)
        cell(ws, r, 8, status_formula(f"D{r}", f"C{r}"),
             alt, C["ink"], 12, h="center")

        # % (col I=9)
        cell(ws, r, 9, f"=IFERROR(D{r}/C{r},0)", alt, C["mist"], 10, h="center",
             fmt="0%")

        rh(ws, r, 20)
        dep_cells[cat] = (r, 4)

    # Total row
    r_tot = 15 + len(CATS)
    merge(ws, r_tot, 2, r_tot, 2, "TOTAL", C["dark"], C["white"], 10, True, "left")
    for c_idx, fml, fmt in [
        (3, f"=SUM(C15:C{r_tot-1})", "#,##0 €"),
        (4, f"=SUM(D15:D{r_tot-1})", "#,##0 €"),
        (5, f"=SUM(E15:E{r_tot-1})", "#,##0 €"),
        (9, f"=IFERROR(D{r_tot}/C{r_tot},0)", "0%"),
    ]:
        cell(ws, r_tot, c_idx, fml, C["dark"], C["white"], 10, True, "right", fmt=fmt)
    bar_tot = ws.cell(row=r_tot, column=7,
                      value=rept_bar(f"D{r_tot}", f"C{r_tot}"))
    bar_tot.fill  = P(C["dark"]); bar_tot.border = B("1A2E1E")
    bar_tot.font  = Font(name="Courier New", size=9, color=C["sage_lt"], bold=True)
    bar_tot.alignment = A("left")
    cell(ws, r_tot, 8, status_formula(f"D{r_tot}", f"C{r_tot}"),
         C["dark"], C["white"], 12, h="center")
    rh(ws, r_tot, 22)

    # Conditional: col E restant
    e_range = f"E15:E{r_tot-1}"
    ws.conditional_formatting.add(e_range,
        FormulaRule(formula=[f"E15<0"],
                    fill=P(C["red_lt"]),
                    font=Font(color=C["red"], bold=True, name="Calibri")))
    ws.conditional_formatting.add(e_range,
        FormulaRule(formula=[f"E15>0"],
                    fill=P(C["green_lt"]),
                    font=Font(color=C["green"], name="Calibri")))

    next_row = r_tot + 1
    rh(ws, next_row, 12)

    # ── ÉVOLUTION 12 MOIS ─────────────────────────────────────────────────────
    ev_start = next_row + 1
    merge(ws, ev_start, 2, ev_start, 9, "  ◆  ÉVOLUTION SUR 12 MOIS  (année en cours)",
          C["dark2"], C["sage_lt"], 9, False, "left")
    rh(ws, ev_start, 20)

    # Headers
    ev_hdr = ev_start + 1
    for c_idx, h in [(2,"Mois"),(3,"Revenus"),(4,"Dépenses"),(5,"Solde"),
                     (7,"▓▓▓ Barres dépenses"),(8,"📈"),(9,"vs budget")]:
        cell(ws, ev_hdr, c_idx, h, C["dark"], C["white"], 9, True, "center")
    rh(ws, ev_hdr, 18)

    # Hidden helper: max monthly spend (for bar normalization) in col J
    max_fmls = [sum_month_type(m+1, "Dépense")[1:] for m in range(12)]
    ws.cell(row=1, column=10, value=f"=MAX({','.join(max_fmls)})")
    ws.row_dimensions[1].height = 0  # hide

    month_rows = {}
    for i, (ms, mf) in enumerate(zip(MONTHS_SHORT, MONTHS_FR)):
        r = ev_hdr + 1 + i
        alt = C["cream2"] if i%2 else C["white"]
        m_num = i + 1

        cell(ws, r, 2, mf, alt, C["ink"], 10, h="left")

        rev_f = sum_month_type(m_num, "Revenu")
        dep_f = sum_month_type(m_num, "Dépense")
        cell(ws, r, 3, rev_f,         alt, C["sage"],  10, h="right", fmt="#,##0 €")
        cell(ws, r, 4, dep_f,         alt, C["terra"], 10, bold=True, h="right",
             fmt="#,##0 €")
        cell(ws, r, 5, f"=C{r}-D{r}", alt, C["ink"],  10, h="right", fmt="#,##0 €")

        # Barre normalisée (vs max du max de toutes catégories → cell J1)
        bar_m = (f"=IF(D{r}=0,\"—\","
                 f"REPT(\"▓\",MIN(22,INT(D{r}/IF($J$1=0,1,$J$1)*22)))&"
                 f"REPT(\"░\",MAX(0,22-MIN(22,INT(D{r}/IF($J$1=0,1,$J$1)*22)))))")
        bc = ws.cell(row=r, column=7, value=bar_m)
        bc.fill  = P(alt)
        bc.font  = Font(name="Courier New", size=9, color=C["terra"])
        bc.alignment = A("left"); bc.border = B()

        # Icon: ↑ if above avg, ↓ if below
        icon = (f"=IF(D{r}=0,\"—\","
                f"IF(D{r}>AVERAGE(D{ev_hdr+1}:D{ev_hdr+12}),\"↑\",\"↓\"))")
        cell(ws, r, 8, icon, alt, C["mist"], 11, bold=True, h="center")

        # vs total budget
        total_bud = sum(b for _, b in CATS)
        cell(ws, r, 9, f"=IFERROR(D{r}/{total_bud},0)",
             alt, C["mist"], 10, h="center", fmt="0%")

        rh(ws, r, 18)
        month_rows[i] = r

    # ── MINI LINE CHART ──────────────────────────────────────────────────────
    # Chart source: months in col B, dep col D, rev col C
    first_ev_data = ev_hdr + 1
    last_ev_data  = ev_hdr + 12

    chart = LineChart()
    chart.title  = "Revenus vs Dépenses"
    chart.style  = 10
    chart.width  = 22; chart.height = 10
    chart.legend.position = "b"

    cats_r = Reference(ws, min_col=2, min_row=first_ev_data, max_row=last_ev_data)
    rev_r  = Reference(ws, min_col=3, min_row=ev_hdr, max_row=last_ev_data)
    dep_r  = Reference(ws, min_col=4, min_row=ev_hdr, max_row=last_ev_data)
    chart.add_data(rev_r, titles_from_data=True)
    chart.add_data(dep_r, titles_from_data=True)
    chart.set_categories(cats_r)
    chart.series[0].graphicalProperties.line.solidFill = C["sage"]
    chart.series[0].graphicalProperties.line.width = 25000
    chart.series[1].graphicalProperties.line.solidFill = C["terra"]
    chart.series[1].graphicalProperties.line.width = 25000
    chart.series[1].graphicalProperties.line.dashDot = "dash"
    ws.add_chart(chart, f"B{last_ev_data+2}")

    next2 = last_ev_data + 19
    rh(ws, next2 - 1, 10)

    # ── PIE: dépenses par catégorie ce mois ──────────────────────────────────
    # Hidden helper table for pie at col J
    pie_start = ev_hdr + 1
    for i, (cat, _) in enumerate(CATS):
        r_helper = pie_start + i
        ws.cell(row=r_helper, column=10, value=cat)
        ws.cell(row=r_helper, column=11,
                value=sum_current_month_cat(cat))
        ws.row_dimensions[r_helper].height = 0  # hide

    pie = PieChart()
    pie.title  = f"Répartition dépenses — mois en cours"
    pie.style  = 10
    pie.width  = 16; pie.height = 10
    pie_cats = Reference(ws, min_col=10, min_row=pie_start,
                         max_row=pie_start + len(CATS) - 1)
    pie_data = Reference(ws, min_col=11, min_row=pie_start,
                         max_row=pie_start + len(CATS) - 1)
    pie.add_data(pie_data)
    pie.set_categories(pie_cats)
    palette = ["1A2E1E","2E6B4F","5C7A6B","A8C4B8",
               "D4876B","F0C9B7","E8B84B","8B8A87"]
    for k, hx in enumerate(palette):
        dp = DataPoint(idx=k)
        dp.graphicalProperties.solidFill = hx
        pie.series[0].dPt.append(dp)
    ws.add_chart(pie, f"F{last_ev_data+2}")

    # ── DERNIÈRES TRANSACTIONS ────────────────────────────────────────────────
    rh(ws, next2, 12)
    merge(ws, next2+1, 2, next2+1, 9,
          "  ◆  10 DERNIÈRES TRANSACTIONS  (auto-actualisé)",
          C["dark2"], C["sage_lt"], 9, False, "left")
    rh(ws, next2+1, 20)

    lt_hdr = next2 + 2
    for c_idx, h in [(2,"Date"),(3,"Catégorie"),(4,"Type"),(5,"Montant"),(6,"Note")]:
        cell(ws, lt_hdr, c_idx, h, C["dark"], C["white"], 9, True, "center")
    rh(ws, lt_hdr, 18)

    # Show last 10 rows of Transactions (rows counted by COUNTA)
    cnt_col = "Transactions!$B$5:$B$500"  # use cat column to count
    for k in range(10):
        r = lt_hdr + 1 + k
        offset = 10 - k  # last 10: most recent last
        alt = C["cream2"] if k%2 else C["white"]
        idx = f"IFERROR(COUNTA({cnt_col})-{offset-1}+4,\"\")"
        for c_idx, src_col, fmt in [
            (2, "A", "dd/mm/yyyy"),
            (3, "B", "@"),
            (4, "C", "@"),
            (5, "D", "#,##0.00 €"),
            (6, "E", "@"),
        ]:
            f_val = (f"=IFERROR(INDEX(Transactions!${src_col}:${src_col},"
                     f"IFERROR(COUNTA(Transactions!$B$5:$B$500)-{offset-1}+4,1)),\"\")")
            ce = cell(ws, r, c_idx, f_val, alt, C["ink"], 10,
                      h="right" if c_idx==5 else "left",
                      fmt=fmt)
        rh(ws, r, 18)

    # ── SAVINGS GAUGE (texte) ─────────────────────────────────────────────────
    sg_row = lt_hdr + 12
    rh(ws, sg_row - 1, 10)
    merge(ws, sg_row, 2, sg_row, 9,
          "  ◆  JAUGE D'ÉPARGNE MENSUELLE",
          C["dark2"], C["sage_lt"], 9, False, "left")
    rh(ws, sg_row, 20)

    # Label
    merge(ws, sg_row+1, 2, sg_row+1, 3, "Objectif épargne", C["white"], C["mist"], 9)
    merge(ws, sg_row+1, 4, sg_row+1, 5, "Épargne actuelle", C["white"], C["ink"], 9, True)
    merge(ws, sg_row+1, 6, sg_row+1, 7, "Taux", C["white"], C["mist"], 9)
    rh(ws, sg_row+1, 18)

    rev_formula = sum_current_month_type("Revenu")[1:]
    dep_formula = sum_current_month_type("Dépense")[1:]
    obj_formula = f"={rev_formula}*0.2"  # objectif épargne = 20% des revenus

    merge(ws, sg_row+2, 2, sg_row+2, 3, obj_formula, C["cream2"], C["mist"], 12,
          h="center", fmt="#,##0 €")
    merge(ws, sg_row+2, 4, sg_row+2, 5,
          f"={rev_formula}-{dep_formula}",
          C["green_lt"], C["green"], 16, True, "center", fmt="#,##0 €")
    merge(ws, sg_row+2, 6, sg_row+2, 7,
          f"=IFERROR(({rev_formula}-{dep_formula})/({obj_formula}),0)",
          C["cream2"], C["sage_md"], 12, True, "center", fmt="0%")
    rh(ws, sg_row+2, 28)

    # Gauge text bar
    gauge_f = (f"=IF({obj_formula}<=0,\"—\","
               f"REPT(\"▓\",MIN(40,INT(({rev_formula}-{dep_formula})"
               f"/{obj_formula}*40)))&"
               f"REPT(\"░\",MAX(0,40-MIN(40,INT(({rev_formula}-{dep_formula})"
               f"/{obj_formula}*40)))))")
    gc = ws.cell(row=sg_row+3, column=2, value=gauge_f)
    ws.merge_cells(start_row=sg_row+3, start_column=2,
                   end_row=sg_row+3, end_column=9)
    gc.fill  = P(C["dark"])
    gc.font  = Font(name="Courier New", size=13, color=C["sage_lt"], bold=True)
    gc.alignment = A("center")
    rh(ws, sg_row+3, 28)

    merge(ws, sg_row+4, 2, sg_row+4, 9,
          "  ↑  Jauge vers l'objectif épargne (20 % des revenus)  —  auto-actualisé",
          C["cream"], C["mist"], 8, italic=True, h="center")
    rh(ws, sg_row+4, 14)

    # ── Footer ───────────────────────────────────────────────────────────────
    rh(ws, sg_row+6, 8)
    merge(ws, sg_row+7, 2, sg_row+7, 9,
          "Finances360  ·  Toutes les données sont issues de l'onglet Transactions"
          "  ·  Aucune saisie requise sur ce tableau de bord",
          C["black"], C["sage_lt"], 8, h="center", italic=True)
    rh(ws, sg_row+7, 18)

    ws.sheet_view.showGridLines = False
    ws.sheet_view.zoomScale = 90


# ── Main ──────────────────────────────────────────────────────────────────────
def build(out_path):
    random.seed(42)
    wb = Workbook()
    wb.remove(wb.active)

    ws_dash   = wb.create_sheet("📊 Dashboard")
    ws_trans  = wb.create_sheet("📝 Transactions")
    ws_params = wb.create_sheet("⚙️ Paramètres")

    build_params(ws_params)
    samples = generate_sample_transactions()
    build_transactions(ws_trans, samples)
    build_dashboard(ws_dash, wb)

    ws_dash.sheet_properties.tabColor   = "D4876B"
    ws_trans.sheet_properties.tabColor  = "2E6B4F"
    ws_params.sheet_properties.tabColor = "1A2E1E"

    wb.save(out_path)
    print(out_path)


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else "/tmp/finances360.xlsx")
