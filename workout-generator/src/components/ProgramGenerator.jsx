import { useState } from "react";
import { generateFullProgram } from "../api";
import { exportToPDF } from "../utils/pdfExport";
import { exportToExcel } from "../utils/excelExport";

const STATES = {
  IDLE: "idle",
  GENERATING: "generating",
  READY: "ready",
  ERROR: "error",
};

const PROGRESS_STEPS = [
  "Analyse de ton profil...",
  "Construction du programme 8 semaines...",
  "Élaboration des progressions...",
  "Création du guide nutrition...",
  "Finalisation des séances...",
  "Programme prêt !",
];

function ProgressBar({ progress, label }) {
  return (
    <div className="progress-wrapper">
      <div className="progress-bar-bg">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <p className="progress-label">{label}</p>
    </div>
  );
}

function WeekSummary({ week }) {
  return (
    <div className="week-summary">
      <div className="week-summary-header">
        <span className="week-badge">S{week.weekNumber}</span>
        <div>
          <p className="week-theme">{week.theme}</p>
          <p className="week-intensity">{week.intensityLevel} · {week.sessions?.length} séances</p>
        </div>
      </div>
    </div>
  );
}

export default function ProgramGenerator({ userData, onBack }) {
  const [state, setState] = useState(STATES.IDLE);
  const [program, setProgram] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");

  async function handleGenerate() {
    setState(STATES.GENERATING);
    setProgress(0);

    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, PROGRESS_STEPS.length - 2);
      setProgressLabel(PROGRESS_STEPS[stepIdx]);
      setProgress(Math.min((stepIdx + 1) * (85 / PROGRESS_STEPS.length) + 5, 85));
    }, 1200);

    setProgressLabel(PROGRESS_STEPS[0]);
    setProgress(5);

    try {
      const result = await generateFullProgram(userData, userData.apiKey);
      clearInterval(interval);
      setProgress(100);
      setProgressLabel(PROGRESS_STEPS[PROGRESS_STEPS.length - 1]);
      setProgram(result);
      setState(STATES.READY);
    } catch (err) {
      clearInterval(interval);
      setErrorMsg(err.message || "Une erreur est survenue lors de la génération.");
      setState(STATES.ERROR);
    }
  }

  function handleExportPDF() {
    if (program) exportToPDF(program, userData);
  }

  function handleExportExcel() {
    if (program) exportToExcel(program, userData);
  }

  if (state === STATES.IDLE) {
    return (
      <div className="generator-container">
        <div className="generator-card">
          <div className="generator-icon">🏋️</div>
          <h2 className="generator-title">Programme complet 8 semaines</h2>
          <p className="generator-desc">
            Je vais générer pour toi un programme complet personnalisé avec :
          </p>
          <ul className="generator-features">
            <li>📅 8 semaines de planning détaillé</li>
            <li>📈 Progression des charges et intensité</li>
            <li>💪 {userData.daysPerWeek} séances/semaine avec exercices, séries, reps</li>
            <li>🥗 Guide nutrition adapté à ton objectif</li>
            <li>📄 Export PDF professionnel</li>
            <li>📊 Fichier Excel de suivi avec graphiques</li>
          </ul>
          <div className="generator-actions">
            <button className="btn-generate-full" onClick={handleGenerate}>
              ⚡ Générer maintenant
            </button>
            <button className="btn-back-small" onClick={onBack} type="button">
              ← Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state === STATES.GENERATING) {
    return (
      <div className="generator-container">
        <div className="generator-card loading">
          <div className="spinner" />
          <h2 className="generator-title">Génération en cours...</h2>
          <ProgressBar progress={progress} label={progressLabel} />
          <p className="loading-note">
            Claude construit ton programme personnalisé. Cela peut prendre 20-40 secondes.
          </p>
        </div>
      </div>
    );
  }

  if (state === STATES.ERROR) {
    return (
      <div className="generator-container">
        <div className="generator-card error">
          <div className="error-icon">⚠️</div>
          <h2 className="generator-title">Erreur de génération</h2>
          <p className="error-msg">{errorMsg}</p>
          <div className="generator-actions">
            <button className="btn-generate-full" onClick={handleGenerate}>
              🔄 Réessayer
            </button>
            <button className="btn-back-small" onClick={onBack} type="button">
              ← Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  // READY
  return (
    <div className="generator-container">
      <div className="generator-ready">
        <div className="ready-hero">
          <div className="ready-checkmark">✓</div>
          <h1 className="ready-title">Programme prêt !</h1>
          <p className="ready-subtitle">
            <strong>{userData.firstName}</strong>, ton programme{" "}
            <em>{program.programName}</em> sur 8 semaines est généré.
          </p>
        </div>

        <div className="download-section">
          <h2 className="dl-title">Tes fichiers à télécharger</h2>
          <div className="download-cards">
            <div className="dl-card">
              <div className="dl-icon">📄</div>
              <div className="dl-info">
                <h3>Programme PDF</h3>
                <p>Toutes les séances, la nutrition, les conseils</p>
              </div>
              <button className="btn-download pdf" onClick={handleExportPDF}>
                Télécharger PDF
              </button>
            </div>
            <div className="dl-card">
              <div className="dl-icon">📊</div>
              <div className="dl-info">
                <h3>Suivi Excel</h3>
                <p>8 onglets hebdo + onglet Progression</p>
              </div>
              <button className="btn-download excel" onClick={handleExportExcel}>
                Télécharger Excel
              </button>
            </div>
          </div>
        </div>

        <div className="weeks-overview">
          <h2 className="dl-title">Vue d'ensemble du programme</h2>
          <div className="weeks-grid">
            {program.weeks?.map((week) => (
              <WeekSummary key={week.weekNumber} week={week} />
            ))}
          </div>
        </div>

        <div className="upsell-banner">
          <p>🚀 Tu veux ce programme accompagné d'un suivi personnalisé ?</p>
          <a
            href="https://gumroad.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-buy-full"
          >
            Obtenir le programme premium →
          </a>
        </div>

        <button className="btn-back-small centered" onClick={onBack} type="button">
          ← Retour à l'aperçu
        </button>
      </div>
    </div>
  );
}
