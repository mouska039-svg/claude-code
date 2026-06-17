#!/usr/bin/env python3
"""Builder PRO pour le planner mensuel de dépenses — style "wow" Etsy."""
from openpyxl import Workbook
from openpyxl.styles import (Font, PatternFill, Alignment, Border, Side,
                              GradientFill)
from openpyxl.formatting.rule import (ColorScaleRule, DataBarRule,
                                       FormulaRule)
from openpyxl.utils import get_column_letter
from openpyxl.chart import BarChart, PieChart, Reference
from openpyxl.chart.series import DataPoint

# ── Palette ──────────────────────────────────────────────────────────────────
C = {
    "hdr_dark":   "1C3A2F",   # header sombre principal
    "hdr_mid":    "2D5C48",   # sous-section
    "sage":       "5C7A6B",   # vert sauge
    "sage_light": "A8C4B8",   # sauge clair
    "terra":      "D4876B",   # terracotta accent
    "terra_lt":   "F0C9B7",   # terracotta clair
    "cream":      "F5EFE6",   # fond crème
    "cream2":     "EDE5D8",   # crème légèrement plus sombre
    "white":      "FFFFFF",
    "ink":        "2C2C2A",
    "mist":       "8B8A87",
    "input_bg":   "FFFDF7",   # fond cellules saisie
    "input_border":"D4C9B8",  # bordure cellules saisie
    "neg_bg":     "FDE8E0",   # fond restant négatif
    "pos_bg":     "E6F2EC",   # fond restant positif
}

def fill(hex_c): return PatternFill("solid", fgColor=hex_c)
def font(hex_c="2C2C2A", sz=10, bold=False, italic=False):
    return Font(color=hex_c, size=sz, bold=bold, italic=italic,
                name="Calibri")
def align(h="left", v="center", wrap=False):
    return Alignment(horizontal=h, vertical=v, wrap_text=wrap)
def thin_border(top=True, bottom=True, left=True, right=True):
    t = Side(style="thin", color="D4C9B8")
    n = Side(style=None)
    return Border(top=t if top else n, bottom=t if bottom else n,
                  left=t if left else n, right=t if right else n)
def thick_side(): return Side(style="medium", color="1C3A2F")
def outer_border():
    s = thick_side()
    return Border(top=s, bottom=s, left=s, right=s)
def no_border():
    return Border(top=Side(style=None), bottom=Side(style=None),
                  left=Side(style=None), right=Side(style=None))

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
MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin",
          "Juillet","Août","Septembre","Octobre","Novembre","Décembre"]
MONTHS_TAB = ["Janvier","Fevrier","Mars","Avril","Mai","Juin",
               "Juillet","Aout","Septembre","Octobre","Novembre","Decembre"]

# ── Helpers ──────────────────────────────────────────────────────────────────

def set_col_widths(ws, widths):
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w

def merge_header(ws, rng, label, bg, fg="FFFFFF", sz=11, bold=True):
    ws.merge_cells(rng)
    c = ws[rng.split(":")[0]]
    c.value = label
    c.fill = fill(bg)
    c.font = font(fg, sz, bold)
    c.alignment = align("center")

def style_data_cell(c, bg=None, fg="2C2C2A", sz=10, bold=False,
                    num_fmt=None, h="right"):
    c.fill = fill(bg or C["white"])
    c.font = font(fg, sz, bold)
    c.alignment = align(h, "center")
    c.border = thin_border()
    if num_fmt:
        c.number_format = num_fmt

def write_cell(ws, row, col, val, bg=None, fg="2C2C2A", sz=10, bold=False,
               num_fmt=None, h="right", formula=False):
    c = ws.cell(row=row, column=col, value=val)
    style_data_cell(c, bg, fg, sz, bold, num_fmt, h)
    return c

# ── Guide tab ────────────────────────────────────────────────────────────────

def build_guide(ws):
    set_col_widths(ws, [3, 65, 3])
    ws.row_dimensions[1].height = 8
    # Title band
    merge_header(ws, "B2:B2",
                 "💰  EXPENSE PLANNER PRO  ·  Suivi de dépenses annuel",
                 C["hdr_dark"], sz=14)
    ws.row_dimensions[2].height = 36
    # Subtitle
    c = ws.cell(row=3, column=2,
                value="Votre planner de budget personnel — formules automatiques, design soigné")
    c.fill = fill(C["hdr_mid"])
    c.font = font("A8C4B8", 10, False, True)
    c.alignment = align("center")
    ws.row_dimensions[3].height = 20

    lines = [
        ("", None),
        ("  COMMENT UTILISER CE FICHIER", C["sage"]),
        ("", None),
        ("  1 ·  Onglet « Revenus »  →  Saisissez votre revenu mensuel et votre objectif d'épargne.",
         C["cream2"]),
        ("  2 ·  Onglets mensuels (Janvier … Décembre)  →  Entrez uniquement la colonne « Dépensé réel ».",
         None),
        ("       ✦  La colonne Restant, le % et la barre de progression se mettent à jour seuls.",
         C["cream2"]),
        ("       ✦  Le feu tricolore 🟢🟡🔴 indique votre situation au premier coup d'œil.",
         None),
        ("  3 ·  Onglet « Dashboard »  →  Vue d'ensemble annuelle, graphiques et KPIs — rien à remplir.",
         C["cream2"]),
        ("", None),
        ("  LÉGENDE DES COULEURS", C["sage"]),
        ("", None),
        ("   🟢  Moins de 80 % du budget utilisé    ·    Vous êtes dans les clous !", None),
        ("   🟡  Entre 80 % et 100 %    ·    Soyez vigilant.", C["cream2"]),
        ("   🔴  Dépassement    ·    Il faut ajuster.", None),
        ("", None),
        ("  CONSEILS", C["sage"]),
        ("", None),
        ("   ✦  Modifiez les budgets prévus dans chaque onglet mensuel selon vos revenus.",
         C["cream2"]),
        ("   ✦  Les catégories sont personnalisables (clic sur la cellule, tapez votre nom).",
         None),
        ("   ✦  Dupliquez un onglet mensuel si vous voulez une version vierge de réserve.",
         C["cream2"]),
        ("", None),
        ("  Bon suivi ! 💚", C["hdr_mid"]),
    ]
    for i, (text, bg) in enumerate(lines, 4):
        c = ws.cell(row=i, column=2, value=text)
        c.fill = fill(bg or C["white"])
        c.font = font(C["ink"] if bg != C["sage"] and bg != C["hdr_mid"]
                      else "FFFFFF", 10,
                      bold=(bg == C["sage"] or bg == C["hdr_mid"]))
        c.alignment = align("left")
        ws.row_dimensions[i].height = 18
    ws.sheet_view.showGridLines = False

# ── Revenus tab ──────────────────────────────────────────────────────────────

def build_revenus(ws):
    set_col_widths(ws, [3, 22, 18, 18, 18, 3])
    ws.row_dimensions[1].height = 8
    merge_header(ws, "B2:E2", "💼  REVENUS & ÉPARGNE  —  Annuel", C["hdr_dark"], sz=12)
    ws.row_dimensions[2].height = 32
    # Col headers row 3
    for col, label in zip(range(2,6),
                          ["Mois","Revenus nets","Objectif épargne","Épargne réelle"]):
        c = ws.cell(row=3, column=col, value=label)
        c.fill = fill(C["sage"])
        c.font = font("FFFFFF", 10, True)
        c.alignment = align("center")
        c.border = thin_border()
    ws.row_dimensions[3].height = 20

    for i, m in enumerate(MONTHS):
        r = 4 + i
        alt = C["cream2"] if i % 2 else C["white"]
        write_cell(ws, r, 2, m, alt, h="left")
        write_cell(ws, r, 3, 0, C["input_bg"], num_fmt="#,##0 €", h="right")
        write_cell(ws, r, 4, 0, C["input_bg"], num_fmt="#,##0 €", h="right")
        tab = MONTHS_TAB[i]
        # Épargne réelle = revenus − dépenses du mois
        write_cell(ws, r, 5,
                   f"=C{r}-{tab}!C10",
                   alt, num_fmt="#,##0 €", h="right")
        ws.row_dimensions[r].height = 18

    # Totals row 16
    r = 16
    write_cell(ws, r, 2, "TOTAL ANNUEL", C["hdr_dark"], "FFFFFF", bold=True, h="left")
    for col, fml in [(3,"=SUM(C4:C15)"),(4,"=SUM(D4:D15)"),(5,"=SUM(E4:E15)")]:
        write_cell(ws, r, col, fml, C["hdr_dark"], "FFFFFF", bold=True,
                   num_fmt="#,##0 €")
    ws.row_dimensions[r].height = 22
    ws.freeze_panes = "B4"
    ws.sheet_view.showGridLines = False

# ── Monthly tab ──────────────────────────────────────────────────────────────

# Cols: A(pad) B(cat) C(budget) D(dépensé) E(restant) F(%) G(barre) H(status) I(pad)
MCOLS = [3, 22, 16, 16, 16, 9, 26, 8, 3]

def rept_formula(row):
    return (f"=IF(C{row}=0,\"—\","
            f"REPT(\"▓\",MIN(20,INT(D{row}/C{row}*20)))&"
            f"REPT(\"░\",MAX(0,20-MIN(20,INT(D{row}/C{row}*20)))))")

def status_formula(row):
    return (f"=IF(D{row}=0,\"⬜\","
            f"IF(D{row}/C{row}<0.8,\"🟢\","
            f"IF(D{row}/C{row}<=1,\"🟡\",\"🔴\")))")

def build_month(ws, month_label, month_tab):
    set_col_widths(ws, MCOLS)
    ws.row_dimensions[1].height = 8

    # Title
    merge_header(ws, "B2:H2",
                 f"📅  {month_label.upper()}  —  Suivi de dépenses",
                 C["hdr_dark"], sz=13)
    ws.row_dimensions[2].height = 34

    # Column headers
    headers = ["Catégorie", "Budget prévu", "Dépensé réel",
               "Restant", "% utilisé", "▓▓▓▓ Progression", "🚦"]
    for ci, h in enumerate(headers, 2):
        c = ws.cell(row=3, column=ci, value=h)
        c.fill = fill(C["sage"])
        c.font = font("FFFFFF", 9, True)
        c.alignment = align("center")
        c.border = thin_border()
    ws.row_dimensions[3].height = 20

    # Data rows 4–11
    for i, (cat, budget) in enumerate(CATS):
        r = 4 + i
        alt = C["cream2"] if i % 2 else C["white"]

        # Cat
        c = ws.cell(row=r, column=2, value=cat)
        c.fill = fill(alt); c.font = font(C["ink"], 10)
        c.alignment = align("left"); c.border = thin_border()

        # Budget (preloaded, editable)
        c = ws.cell(row=r, column=3, value=budget)
        c.fill = fill(C["input_bg"]); c.font = font(C["ink"], 10)
        c.alignment = align("right"); c.border = thin_border()
        c.number_format = "#,##0 €"

        # Dépensé (user input highlight)
        c = ws.cell(row=r, column=4, value=0)
        c.fill = fill(C["input_bg"])
        c.font = font(C["terra"], 10, True)
        c.alignment = align("right"); c.border = thin_border()
        c.number_format = "#,##0 €"
        # Highlight input column slightly
        c.fill = PatternFill("solid", fgColor="FFF8F0")

        # Restant = Budget − Dépensé
        c = ws.cell(row=r, column=5, value=f"=C{r}-D{r}")
        c.fill = fill(alt); c.font = font(C["ink"], 10)
        c.alignment = align("right"); c.border = thin_border()
        c.number_format = "#,##0 €"

        # % utilisé
        c = ws.cell(row=r, column=6,
                    value=f"=IF(C{r}=0,0,D{r}/C{r})")
        c.fill = fill(alt); c.font = font(C["ink"], 10)
        c.alignment = align("center"); c.border = thin_border()
        c.number_format = "0%"

        # Barre REPT
        c = ws.cell(row=r, column=7, value=rept_formula(r))
        c.fill = fill(alt)
        c.font = Font(name="Courier New", size=10,
                      color=C["sage"], bold=False)
        c.alignment = align("left"); c.border = thin_border()

        # Status emoji
        c = ws.cell(row=r, column=8, value=status_formula(r))
        c.fill = fill(alt); c.font = font(C["ink"], 12)
        c.alignment = align("center"); c.border = thin_border()

        ws.row_dimensions[r].height = 20

    # Separator
    ws.row_dimensions[12].height = 6

    # Totals row 13 — but data is rows 4-11, lastrow=11
    r = 13  # wait: 8 cats → rows 4-11 → total row 12? Let me recalc
    # Actually rows 4..11 = 8 cats, so total at row 12
    r = 12
    ws.row_dimensions[r].height = 22

    total_cells = {
        2: ("TOTAL", None, "left", True),
        3: ("=SUM(C4:C11)", "#,##0 €", "right", True),
        4: ("=SUM(D4:D11)", "#,##0 €", "right", True),
        5: ("=SUM(E4:E11)", "#,##0 €", "right", True),
        6: ("=IF(C12=0,0,D12/C12)", "0%", "center", True),
        7: (rept_formula(r), None, "left", True),
        8: (status_formula(r), None, "center", True),
    }
    for col, (val, fmt, h, bold) in total_cells.items():
        c = ws.cell(row=r, column=col, value=val)
        c.fill = fill(C["hdr_dark"])
        c.font = font("FFFFFF" if col != 7 else "A8C4B8", 10, bold)
        if col == 7:
            c.font = Font(name="Courier New", size=10,
                          color="A8C4B8", bold=True)
        c.alignment = align(h)
        c.border = thin_border()
        if fmt: c.number_format = fmt

    # Conditional: restant column E4:E11 — red bg if negative
    ws.conditional_formatting.add(
        "E4:E11",
        FormulaRule(formula=["E4<0"],
                    fill=fill("FDE8E0"),
                    font=Font(color="C0392B", bold=True, name="Calibri")))
    ws.conditional_formatting.add(
        "E4:E11",
        FormulaRule(formula=["E4>0"],
                    fill=fill("E6F2EC"),
                    font=Font(color="27AE60", bold=True, name="Calibri")))

    # Mini tip below
    ws.row_dimensions[13].height = 6
    c = ws.cell(row=14, column=2,
                value="  💡  Saisissez uniquement la colonne « Dépensé réel » — tout se calcule automatiquement.")
    c.fill = fill(C["cream"])
    c.font = font(C["mist"], 9, italic=True)
    c.alignment = align("left")
    ws.merge_cells("B14:H14")
    ws.row_dimensions[14].height = 18

    ws.freeze_panes = "B4"
    ws.sheet_view.showGridLines = False

# ── Dashboard ────────────────────────────────────────────────────────────────

def build_dashboard(ws, wb):
    set_col_widths(ws, [3, 20, 18, 4, 20, 18, 4, 20, 18, 3])
    ws.row_dimensions[1].height = 8

    # ── Big title ──
    merge_header(ws, "B2:I2",
                 "💰  EXPENSE PLANNER PRO  —  Vue d'ensemble annuelle",
                 C["hdr_dark"], sz=14)
    ws.row_dimensions[2].height = 40
    merge_header(ws, "B3:I3",
                 "Toutes les données ci-dessous sont automatiques — aucune saisie nécessaire",
                 C["hdr_mid"], "A8C4B8", sz=9, bold=False)
    ws.row_dimensions[3].height = 18

    ws.row_dimensions[4].height = 10

    # ── KPI Section header ──
    merge_header(ws, "B5:I5", "  📊  INDICATEURS CLÉS", C["sage"], sz=10)
    ws.row_dimensions[5].height = 24

    ws.row_dimensions[6].height = 8

    # 4 KPI cards in a row: B7:C8, E7:F8, H7:I8, B10:C11
    kpis = [
        ("B7", "C8", "💼  Revenus annuels",   "=Revenus!C18",
         "#,##0 €", C["sage"]),
        ("E7", "F8", "📅  Budget annuel",
         "=SUM(Janvier!C12,Fevrier!C12,Mars!C12,Avril!C12,Mai!C12,"
         "Juin!C12,Juillet!C12,Aout!C12,Septembre!C12,Octobre!C12,"
         "Novembre!C12,Decembre!C12)",
         "#,##0 €", C["hdr_mid"]),
        ("H7", "I8", "💸  Total dépensé",
         "=SUM(Janvier!D12,Fevrier!D12,Mars!D12,Avril!D12,Mai!D12,"
         "Juin!D12,Juillet!D12,Aout!D12,Septembre!D12,Octobre!D12,"
         "Novembre!D12,Decembre!D12)",
         "#,##0 €", C["terra"]),
    ]

    def kpi_card(ws, tl, br, label, value, fmt, accent):
        ws.merge_cells(f"{tl}:{br}")
        # label row
        tl_c = ws[tl]
        tl_c.fill = fill(accent)
        tl_c.value = None
        # unmerge then redo with 2 rows
        ws.unmerge_cells(f"{tl}:{br}")

        tlcol = tl[0]; tlrow = int(tl[1:])
        brcol = br[0]; brrow = int(br[1:])

        # label
        ws.merge_cells(f"{tlcol}{tlrow}:{brcol}{tlrow}")
        c = ws[f"{tlcol}{tlrow}"]
        c.value = label
        c.fill = fill(accent)
        c.font = font("FFFFFF", 9, False)
        c.alignment = align("center")
        ws.row_dimensions[tlrow].height = 22

        # value
        ws.merge_cells(f"{tlcol}{brrow}:{brcol}{brrow}")
        c = ws[f"{tlcol}{brrow}"]
        c.value = value
        c.fill = fill(accent)
        c.font = Font(name="Calibri", size=20, bold=True, color="FFFFFF")
        c.alignment = align("center")
        c.number_format = fmt
        ws.row_dimensions[brrow].height = 32

    for tl, br, lbl, val, fmt, accent in kpis:
        kpi_card(ws, tl, br, lbl, val, fmt, accent)

    ws.row_dimensions[9].height = 10

    # 4th KPI: épargne réelle
    kpi_card(ws, "B10", "C11",
             "💚  Épargne réelle",
             "=Revenus!C18-SUM(Janvier!D12,Fevrier!D12,Mars!D12,Avril!D12,"
             "Mai!D12,Juin!D12,Juillet!D12,Aout!D12,Septembre!D12,"
             "Octobre!D12,Novembre!D12,Decembre!D12)",
             "#,##0 €", "27AE60")

    # 5th: % budget consommé
    kpi_card(ws, "E10", "F11",
             "📉  % Budget consommé",
             "=IFERROR(SUM(Janvier!D12,Fevrier!D12,Mars!D12,Avril!D12,"
             "Mai!D12,Juin!D12,Juillet!D12,Aout!D12,Septembre!D12,"
             "Octobre!D12,Novembre!D12,Decembre!D12)/"
             "SUM(Janvier!C12,Fevrier!C12,Mars!C12,Avril!C12,Mai!C12,"
             "Juin!C12,Juillet!C12,Aout!C12,Septembre!C12,Octobre!C12,"
             "Novembre!C12,Decembre!C12),0)",
             "0.0%", C["terra"])

    # 6th: mois le plus dépensé
    kpi_card(ws, "H10", "I11",
             "🔺  Mois le plus dépensé",
             '=INDEX({"Jan";"Fév";"Mar";"Avr";"Mai";"Jun";"Jul";"Aoû";"Sep";"Oct";"Nov";"Déc"},'
             "MATCH(MAX(Janvier!D12,Fevrier!D12,Mars!D12,Avril!D12,"
             "Mai!D12,Juin!D12,Juillet!D12,Aout!D12,Septembre!D12,"
             "Octobre!D12,Novembre!D12,Decembre!D12),"
             "Janvier!D12:D12,0))",   # simplification - just show max value
             "#,##0 €", C["hdr_mid"])

    ws.row_dimensions[12].height = 14

    # ── Charts section header ──
    merge_header(ws, "B13:I13", "  📈  GRAPHIQUES ANNUELS", C["sage"], sz=10)
    ws.row_dimensions[13].height = 24
    ws.row_dimensions[14].height = 8

    # Bar chart: budget vs dépensé par mois
    # Build a hidden data table at rows 30+ for chart source
    ws.row_dimensions[30].height = 0  # hidden helper rows
    months_short = ["Jan","Fév","Mar","Avr","Mai","Jun",
                    "Jul","Aoû","Sep","Oct","Nov","Déc"]
    month_tabs = MONTHS_TAB

    ws.cell(row=30, column=2, value="Mois")
    ws.cell(row=30, column=3, value="Budget")
    ws.cell(row=30, column=4, value="Dépensé")
    for i, (ms, mt) in enumerate(zip(months_short, month_tabs)):
        r = 31 + i
        ws.cell(row=r, column=2, value=ms)
        ws.cell(row=r, column=3, value=f"='{mt}'!C12")
        ws.cell(row=r, column=4, value=f"='{mt}'!D12")
        ws.row_dimensions[r].height = 0

    bar = BarChart()
    bar.title = "Budget vs Dépensé par mois"
    bar.type = "col"; bar.grouping = "clustered"
    bar.style = 10; bar.width = 22; bar.height = 12
    bar.dLbls = None
    cats_ref = Reference(ws, min_col=2, min_row=30, max_row=42)
    budget_ref = Reference(ws, min_col=3, min_row=30, max_row=42)
    reel_ref   = Reference(ws, min_col=4, min_row=30, max_row=42)
    bar.add_data(budget_ref, titles_from_data=True)
    bar.add_data(reel_ref,   titles_from_data=True)
    bar.set_categories(cats_ref)
    bar.series[0].graphicalProperties.solidFill = C["hdr_mid"]
    bar.series[1].graphicalProperties.solidFill = C["terra"]
    ws.add_chart(bar, "B15")

    # Pie chart: dépenses par catégorie (sum across 12 months)
    ws.cell(row=44, column=2, value="Catégorie")
    ws.cell(row=44, column=3, value="Total")
    for j, (cat, _) in enumerate(CATS):
        r = 45 + j
        ws.cell(row=r, column=2, value=cat)
        tabs_sum = "+".join(f"='{mt}'!D{4+j}" for mt in month_tabs)
        # formula: sum of row 4+j col D across all months
        formula = "=" + "+".join(f"'{mt}'!D{4+j}" for mt in month_tabs)
        ws.cell(row=r, column=3, value=formula)
        ws.row_dimensions[r].height = 0
    ws.row_dimensions[44].height = 0

    pie = PieChart()
    pie.title = "Répartition annuelle par catégorie"
    pie.style = 10; pie.width = 16; pie.height = 12
    cats_p = Reference(ws, min_col=2, min_row=44, max_row=52)
    data_p = Reference(ws, min_col=3, min_row=44, max_row=52)
    pie.add_data(data_p, titles_from_data=False)
    pie.set_categories(cats_p)
    palette = ["1C3A2F","2D5C48","5C7A6B","A8C4B8","D4876B",
               "F0C9B7","8B8A87","EDE5D8"]
    for k, hex_c in enumerate(palette):
        dp = DataPoint(idx=k)
        dp.graphicalProperties.solidFill = hex_c
        pie.series[0].dPt.append(dp)
    ws.add_chart(pie, "F15")

    ws.sheet_view.showGridLines = False

# ── Main ─────────────────────────────────────────────────────────────────────

def build(out_path):
    wb = Workbook()
    wb.remove(wb.active)

    ws_guide = wb.create_sheet("Guide")
    ws_rev   = wb.create_sheet("Revenus")
    month_sheets = []
    for mt in MONTHS_TAB:
        month_sheets.append(wb.create_sheet(mt))
    ws_dash = wb.create_sheet("Dashboard")

    build_guide(ws_guide)
    build_revenus(ws_rev)
    for ws, ml, mt in zip(month_sheets, MONTHS, MONTHS_TAB):
        build_month(ws, ml, mt)
    build_dashboard(ws_dash, wb)

    # Tab colors
    ws_guide.sheet_properties.tabColor = "1C3A2F"
    ws_rev.sheet_properties.tabColor   = "2D5C48"
    for ws in month_sheets:
        ws.sheet_properties.tabColor   = "5C7A6B"
    ws_dash.sheet_properties.tabColor  = "D4876B"

    wb.save(out_path)
    print(out_path)

if __name__ == "__main__":
    import sys
    build(sys.argv[1] if len(sys.argv) > 1 else "/tmp/test_monthly.xlsx")
