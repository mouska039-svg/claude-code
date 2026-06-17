#!/usr/bin/env python3
"""Rend une spécification de classeur Sheetsmith en Google Sheet en direct.

Usage: python build_sheet.py <spec.json> [--share email@exemple.com]
Renvoie l'URL du classeur. Nécessite token.json (voir SHEETS_SETUP.md).
"""
import sys
from googleapiclient.discovery import build

from spec_common import load_spec, col_letter, resolve_formula, data_bounds
from auth import get_credentials


def hex_to_rgb(c):
    c = c.lstrip("#")
    return {"red": int(c[0:2], 16) / 255, "green": int(c[2:4], 16) / 255,
            "blue": int(c[4:6], 16) / 255}


PRIMARY = "#5C7A6B"


def main():
    if len(sys.argv) < 2:
        raise SystemExit("Usage: build_sheet.py <spec.json> [--share email]")
    spec = load_spec(sys.argv[1])
    share = None
    if "--share" in sys.argv:
        share = sys.argv[sys.argv.index("--share") + 1]

    creds = get_credentials()
    sheets = build("sheets", "v4", credentials=creds)
    drive = build("drive", "v3", credentials=creds)

    # 1. créer le classeur avec tous les onglets
    body = {
        "properties": {"title": spec.get("title", "Sheetsmith")},
        "sheets": [{"properties": {"title": t["name"]}} for t in spec["tabs"]],
    }
    ss = sheets.spreadsheets().create(body=body).execute()
    sid = ss["spreadsheetId"]
    title_to_id = {s["properties"]["title"]: s["properties"]["sheetId"]
                   for s in ss["sheets"]}

    # 2. écrire les valeurs/formules par onglet via values.update
    value_data = []
    for tab in spec["tabs"]:
        cols = tab.get("columns", [])
        if not cols:
            continue  # tableau de bord traité séparément (cartes/bandes via batchUpdate)
        firstrow, lastrow = data_bounds(tab)
        grid = [[c.get("header", "") for c in cols]]
        for ri, rowdata in enumerate(tab.get("rows", []) or []):
            excel_row = firstrow + ri
            line = []
            for col in cols:
                if col.get("formula"):
                    line.append(resolve_formula(col["formula"], row=excel_row,
                                                firstrow=firstrow, lastrow=lastrow))
                else:
                    line.append(rowdata.get(col.get("key")))
            grid.append(line)
        tr = tab.get("totals_row")
        if tr:
            line = [tr.get("label", "Total")]
            for col in cols[1:]:
                f = tr.get("formulas", {}).get(col.get("key"))
                line.append(resolve_formula(f, firstrow=firstrow, lastrow=lastrow)
                            if f else "")
            grid.append(line)
        value_data.append({"range": f"{tab['name']}!A1", "values": grid})

    if value_data:
        sheets.spreadsheets().values().batchUpdate(
            spreadsheetId=sid,
            body={"valueInputOption": "USER_ENTERED", "data": value_data},
        ).execute()

    # 3. mise en forme (en-tête, gel) via batchUpdate
    requests = []
    for tab in spec["tabs"]:
        cols = tab.get("columns", [])
        if not cols:
            continue
        gid = title_to_id[tab["name"]]
        requests.append({"repeatCell": {
            "range": {"sheetId": gid, "startRowIndex": 0, "endRowIndex": 1},
            "cell": {"userEnteredFormat": {
                "backgroundColor": hex_to_rgb(PRIMARY),
                "textFormat": {"bold": True,
                               "foregroundColor": hex_to_rgb("#FFFFFF")},
                "horizontalAlignment": "CENTER"}},
            "fields": "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)"}})
        fr = tab.get("freeze")
        if fr:
            requests.append({"updateSheetProperties": {
                "properties": {"sheetId": gid, "gridProperties": {
                    "frozenRowCount": fr.get("rows", 0),
                    "frozenColumnCount": fr.get("cols", 0)}},
                "fields": "gridProperties.frozenRowCount,gridProperties.frozenColumnCount"}})
    if requests:
        sheets.spreadsheets().batchUpdate(
            spreadsheetId=sid, body={"requests": requests}).execute()

    # 4. partage optionnel
    if share:
        drive.permissions().create(
            fileId=sid, sendNotificationEmail=False,
            body={"type": "user", "role": "writer", "emailAddress": share}).execute()

    url = f"https://docs.google.com/spreadsheets/d/{sid}/edit"
    print(url)


if __name__ == "__main__":
    main()
