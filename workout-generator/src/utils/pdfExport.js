import { jsPDF } from "jspdf";

const ORANGE = [255, 107, 53];
const DARK = [18, 18, 18];
const GRAY = [100, 100, 100];
const LIGHT_GRAY = [220, 220, 220];
const WHITE = [255, 255, 255];

function addHeader(doc, firstName, programName, pageNum, totalPages) {
  doc.setFillColor(...DARK);
  doc.rect(0, 0, 210, 20, "F");
  doc.setFillColor(...ORANGE);
  doc.rect(0, 20, 210, 2, "F");

  doc.setTextColor(...ORANGE);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("FITPRO", 15, 13);

  doc.setTextColor(...LIGHT_GRAY);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Programme de ${firstName} — ${programName}`, 105, 13, { align: "center" });
  doc.text(`${pageNum} / ${totalPages}`, 195, 13, { align: "right" });
}

function addFooter(doc) {
  doc.setDrawColor(...ORANGE);
  doc.setLineWidth(0.3);
  doc.line(15, 285, 195, 285);
  doc.setTextColor(...GRAY);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text("Généré par FitPro — Programme personnalisé", 105, 290, { align: "center" });
}

function addSectionTitle(doc, title, y) {
  doc.setFillColor(...ORANGE);
  doc.rect(15, y, 4, 8, "F");
  doc.setTextColor(...DARK);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(title, 22, y + 6);
  return y + 14;
}

function addExerciseRow(doc, exercise, y, isEven) {
  if (isEven) {
    doc.setFillColor(245, 245, 245);
    doc.rect(15, y - 4, 180, 10, "F");
  }

  doc.setTextColor(...DARK);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(exercise.name, 18, y + 2);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY);
  const details = `${exercise.sets} séries × ${exercise.reps} reps — Repos : ${exercise.rest}`;
  doc.text(details, 18, y + 8);

  if (exercise.tip) {
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    const tip = doc.splitTextToSize(`💡 ${exercise.tip}`, 170);
    doc.text(tip, 18, y + 14);
    return y + 14 + tip.length * 4 + 4;
  }
  return y + 20;
}

export function exportToPDF(program, userData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const { firstName } = userData;

  const totalWeeks = program.weeks.length;
  const totalPages = 2 + totalWeeks;

  // ─── Page de garde ───────────────────────────────────────────────────
  doc.setFillColor(...DARK);
  doc.rect(0, 0, 210, 297, "F");

  doc.setFillColor(...ORANGE);
  doc.rect(0, 0, 210, 5, "F");
  doc.rect(0, 292, 210, 5, "F");

  doc.setTextColor(...ORANGE);
  doc.setFontSize(42);
  doc.setFont("helvetica", "bold");
  doc.text("FITPRO", 105, 90, { align: "center" });

  doc.setTextColor(...WHITE);
  doc.setFontSize(22);
  doc.text(program.programName, 105, 115, { align: "center" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 200, 200);
  doc.text(`Programme personnel de ${firstName}`, 105, 135, { align: "center" });

  doc.setFontSize(11);
  doc.text(`8 semaines · ${userData.daysPerWeek} séances/semaine · ${userData.goal}`, 105, 150, { align: "center" });

  doc.setFillColor(...ORANGE);
  doc.roundedRect(55, 170, 100, 30, 5, 5, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("PROGRAMME 8 SEMAINES", 105, 189, { align: "center" });

  doc.setTextColor(150, 150, 150);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, 105, 270, { align: "center" });

  // ─── Page guide nutrition + conseils généraux ─────────────────────────
  doc.addPage();
  addHeader(doc, firstName, program.programName, 2, totalPages);
  addFooter(doc);

  let y = 35;
  y = addSectionTitle(doc, "Conseils Généraux", y);

  doc.setTextColor(...DARK);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const adviceLines = doc.splitTextToSize(program.generalAdvice, 175);
  doc.text(adviceLines, 15, y);
  y += adviceLines.length * 5 + 10;

  y = addSectionTitle(doc, "Guide Nutrition", y);

  const nutrition = program.nutritionGuide;
  const nutItems = [
    { label: "Apport calorique", value: nutrition.calories },
    { label: "Protéines", value: nutrition.protein },
    { label: "Glucides", value: nutrition.carbs },
    { label: "Hydratation", value: nutrition.hydration },
    { label: "Timing", value: nutrition.timing },
  ];

  nutItems.forEach((item, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(248, 248, 248);
      doc.rect(15, y - 3, 180, 14, "F");
    }
    doc.setFillColor(...ORANGE);
    doc.rect(15, y - 3, 3, 14, "F");

    doc.setTextColor(...ORANGE);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(item.label.toUpperCase(), 22, y + 3);

    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(item.value, 160);
    doc.text(lines, 22, y + 8);
    y += lines.length * 4 + 8;
  });

  // ─── Une page par semaine ─────────────────────────────────────────────
  program.weeks.forEach((week, wi) => {
    doc.addPage();
    addHeader(doc, firstName, program.programName, wi + 3, totalPages);
    addFooter(doc);

    y = 30;

    doc.setFillColor(...DARK);
    doc.roundedRect(15, y, 180, 18, 4, 4, "F");
    doc.setTextColor(...ORANGE);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`SEMAINE ${week.weekNumber}`, 25, y + 8);
    doc.setTextColor(...WHITE);
    doc.setFontSize(11);
    doc.text(week.theme, 25, y + 15);

    doc.setTextColor(...GRAY);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Intensité : ${week.intensityLevel}`, 160, y + 8, { align: "right" });

    y += 26;

    if (week.weeklyTips) {
      doc.setFillColor(255, 247, 230);
      doc.roundedRect(15, y, 180, 12, 3, 3, "F");
      doc.setTextColor(...ORANGE);
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      const tipLines = doc.splitTextToSize(`Conseil : ${week.weeklyTips}`, 172);
      doc.text(tipLines, 20, y + 5);
      y += 18;
    }

    week.sessions.forEach((session) => {
      if (y > 240) {
        doc.addPage();
        addHeader(doc, firstName, program.programName, wi + 3, totalPages);
        addFooter(doc);
        y = 30;
      }

      doc.setFillColor(235, 235, 235);
      doc.rect(15, y, 180, 10, "F");
      doc.setFillColor(...ORANGE);
      doc.rect(15, y, 1, 10, "F");

      doc.setTextColor(...DARK);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`${session.day} — ${session.name}`, 20, y + 7);

      doc.setTextColor(...GRAY);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`${session.objective} · ${session.duration}`, 170, y + 7, { align: "right" });

      y += 14;

      session.exercises.forEach((ex, ei) => {
        if (y > 268) {
          doc.addPage();
          addHeader(doc, firstName, program.programName, wi + 3, totalPages);
          addFooter(doc);
          y = 30;
        }
        y = addExerciseRow(doc, ex, y, ei % 2 === 0);
      });

      y += 6;
    });
  });

  doc.save(`Programme_FitPro_${firstName}_8semaines.pdf`);
}
