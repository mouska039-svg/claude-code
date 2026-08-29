import * as XLSX from "xlsx";

const ORANGE = "FF6B35";
const DARK = "121212";
const LIGHT_ORANGE = "FFF0E8";
const HEADER_BG = "2D2D2D";
const WHITE = "FFFFFF";
const GRAY = "F5F5F5";

function cellStyle(opts = {}) {
  return {
    font: {
      name: "Arial",
      sz: opts.sz || 10,
      bold: opts.bold || false,
      color: { rgb: opts.color || "000000" },
    },
    fill: opts.fill
      ? { patternType: "solid", fgColor: { rgb: opts.fill } }
      : undefined,
    alignment: {
      horizontal: opts.align || "left",
      vertical: "center",
      wrapText: true,
    },
    border: {
      top: { style: "thin", color: { rgb: "DDDDDD" } },
      bottom: { style: "thin", color: { rgb: "DDDDDD" } },
      left: { style: "thin", color: { rgb: "DDDDDD" } },
      right: { style: "thin", color: { rgb: "DDDDDD" } },
    },
  };
}

function writeCell(ws, ref, value, style) {
  ws[ref] = { v: value, t: typeof value === "number" ? "n" : "s", s: style };
}

function colLetter(idx) {
  return String.fromCharCode(65 + idx);
}

function buildWeekSheet(week, firstName) {
  const ws = {};
  const range = { s: { c: 0, r: 0 }, e: { c: 6, r: 2 } };

  // ─── Titre semaine ─────────────────────────────────────────────────────
  ws["A1"] = {
    v: `SEMAINE ${week.weekNumber} — ${week.theme}`,
    t: "s",
    s: cellStyle({ bold: true, sz: 14, color: WHITE, fill: DARK, align: "center" }),
  };
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }];

  ws["A2"] = {
    v: `Intensité : ${week.intensityLevel}  |  Programme de ${firstName}`,
    t: "s",
    s: cellStyle({ bold: false, sz: 10, color: ORANGE, fill: "1E1E1E", align: "center" }),
  };
  ws["!merges"].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 6 } });

  let row = 2;

  week.sessions.forEach((session) => {
    row++;

    // Titre séance
    ws[`A${row}`] = {
      v: `${session.day.toUpperCase()} — ${session.name}  (${session.duration})`,
      t: "s",
      s: cellStyle({ bold: true, sz: 11, color: WHITE, fill: ORANGE, align: "left" }),
    };
    ws["!merges"].push({ s: { r: row - 1, c: 0 }, e: { r: row - 1, c: 6 } });

    row++;
    // Objectif
    ws[`A${row}`] = {
      v: `Objectif : ${session.objective}`,
      t: "s",
      s: cellStyle({ bold: false, sz: 9, color: "666666", fill: LIGHT_ORANGE }),
    };
    ws["!merges"].push({ s: { r: row - 1, c: 0 }, e: { r: row - 1, c: 6 } });

    row++;
    // En-têtes colonnes
    const headers = ["Exercice", "Séries prévues", "Reps prévues", "Charge utilisée (kg)", "Reps réalisées", "% Ressenti", "Notes"];
    headers.forEach((h, ci) => {
      ws[`${colLetter(ci)}${row}`] = {
        v: h,
        t: "s",
        s: cellStyle({ bold: true, sz: 9, color: WHITE, fill: HEADER_BG, align: "center" }),
      };
    });

    session.exercises.forEach((ex, ei) => {
      row++;
      const bg = ei % 2 === 0 ? WHITE : GRAY;
      writeCell(ws, `A${row}`, ex.name, cellStyle({ bold: true, fill: bg }));
      writeCell(ws, `B${row}`, ex.sets, cellStyle({ align: "center", fill: bg }));
      writeCell(ws, `C${row}`, ex.reps, cellStyle({ align: "center", fill: bg }));
      writeCell(ws, `D${row}`, "", cellStyle({ align: "center", fill: "FFF9F5" }));
      writeCell(ws, `E${row}`, "", cellStyle({ align: "center", fill: "FFF9F5" }));
      writeCell(ws, `F${row}`, "", cellStyle({ align: "center", fill: "FFF9F5" }));
      writeCell(ws, `G${row}`, ex.tip || "", cellStyle({ fill: bg, sz: 8 }));
    });

    row++;
  });

  range.e.r = row;
  ws["!ref"] = XLSX.utils.encode_range(range);
  ws["!cols"] = [
    { wch: 28 },
    { wch: 14 },
    { wch: 13 },
    { wch: 20 },
    { wch: 14 },
    { wch: 12 },
    { wch: 35 },
  ];

  return ws;
}

function buildProgressionSheet(program) {
  const ws = {};

  ws["A1"] = { v: "TABLEAU DE PROGRESSION", t: "s", s: cellStyle({ bold: true, sz: 14, color: WHITE, fill: DARK }) };
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];

  ws["A2"] = { v: "Semaine", t: "s", s: cellStyle({ bold: true, color: WHITE, fill: HEADER_BG, align: "center" }) };
  ws["B2"] = { v: "Thème", t: "s", s: cellStyle({ bold: true, color: WHITE, fill: HEADER_BG }) };
  ws["C2"] = { v: "Intensité", t: "s", s: cellStyle({ bold: true, color: WHITE, fill: HEADER_BG, align: "center" }) };
  ws["D2"] = { v: "Séances réalisées", t: "s", s: cellStyle({ bold: true, color: WHITE, fill: HEADER_BG, align: "center" }) };
  ws["E2"] = { v: "Ressenti global /10", t: "s", s: cellStyle({ bold: true, color: WHITE, fill: HEADER_BG, align: "center" }) };

  program.weeks.forEach((week, wi) => {
    const row = wi + 3;
    const bg = wi % 2 === 0 ? WHITE : GRAY;
    writeCell(ws, `A${row}`, week.weekNumber, cellStyle({ bold: true, align: "center", fill: ORANGE, color: WHITE }));
    writeCell(ws, `B${row}`, week.theme, cellStyle({ fill: bg }));
    writeCell(ws, `C${row}`, week.intensityLevel, cellStyle({ align: "center", fill: bg }));
    writeCell(ws, `D${row}`, `    / ${week.sessions.length}`, cellStyle({ align: "center", fill: "FFF9F5" }));
    writeCell(ws, `E${row}`, "", cellStyle({ align: "center", fill: "FFF9F5" }));
  });

  const lastRow = program.weeks.length + 2;
  ws["!ref"] = XLSX.utils.encode_range({ s: { c: 0, r: 0 }, e: { c: 4, r: lastRow } });
  ws["!cols"] = [{ wch: 10 }, { wch: 30 }, { wch: 16 }, { wch: 18 }, { wch: 20 }];

  return ws;
}

function buildSummarySheet(program, userData) {
  const ws = {};

  const lines = [
    ["RÉSUMÉ DU PROGRAMME", ""],
    ["", ""],
    ["Prénom", userData.firstName],
    ["Programme", program.programName],
    ["Objectif", userData.goal],
    ["Niveau", userData.level],
    ["Équipement", userData.equipment],
    ["Jours/semaine", userData.daysPerWeek],
    ["Âge", userData.age],
    ["Sexe", userData.gender],
    ["", ""],
    ["GUIDE NUTRITION", ""],
    ["Apport calorique", program.nutritionGuide?.calories || ""],
    ["Protéines", program.nutritionGuide?.protein || ""],
    ["Glucides", program.nutritionGuide?.carbs || ""],
    ["Hydratation", program.nutritionGuide?.hydration || ""],
    ["Timing", program.nutritionGuide?.timing || ""],
    ["", ""],
    ["CONSEILS GÉNÉRAUX", ""],
    [program.generalAdvice || "", ""],
  ];

  lines.forEach((line, ri) => {
    const isHeader = line[0] === "RÉSUMÉ DU PROGRAMME" || line[0] === "GUIDE NUTRITION" || line[0] === "CONSEILS GÉNÉRAUX";
    ws[`A${ri + 1}`] = {
      v: line[0],
      t: "s",
      s: isHeader
        ? cellStyle({ bold: true, sz: 12, color: WHITE, fill: DARK })
        : cellStyle({ bold: ri < 12, fill: ri % 2 === 0 ? WHITE : GRAY }),
    };
    ws[`B${ri + 1}`] = {
      v: line[1] || "",
      t: typeof line[1] === "number" ? "n" : "s",
      s: cellStyle({ fill: ri % 2 === 0 ? WHITE : GRAY }),
    };
    if (isHeader) {
      if (!ws["!merges"]) ws["!merges"] = [];
      ws["!merges"].push({ s: { r: ri, c: 0 }, e: { r: ri, c: 1 } });
    }
  });

  ws["!ref"] = XLSX.utils.encode_range({ s: { c: 0, r: 0 }, e: { c: 1, r: lines.length } });
  ws["!cols"] = [{ wch: 22 }, { wch: 55 }];
  return ws;
}

export function exportToExcel(program, userData) {
  const wb = XLSX.utils.book_new();

  const summarySheet = buildSummarySheet(program, userData);
  XLSX.utils.book_append_sheet(wb, summarySheet, "Résumé");

  const progressionSheet = buildProgressionSheet(program);
  XLSX.utils.book_append_sheet(wb, progressionSheet, "Progression");

  program.weeks.forEach((week) => {
    const ws = buildWeekSheet(week, userData.firstName);
    XLSX.utils.book_append_sheet(wb, ws, `Semaine ${week.weekNumber}`);
  });

  XLSX.writeFile(wb, `Suivi_FitPro_${userData.firstName}_8semaines.xlsx`);
}
