import { useState } from "react";

const STEPS = [
  { id: "name", title: "Bienvenue", subtitle: "Comment t'appelles-tu ?" },
  { id: "goal", title: "Ton objectif", subtitle: "Qu'est-ce que tu veux accomplir ?" },
  { id: "level", title: "Ton niveau", subtitle: "Où en es-tu dans ta pratique ?" },
  { id: "equipment", title: "Ton équipement", subtitle: "Qu'est-ce que tu as à disposition ?" },
  { id: "days", title: "Ta disponibilité", subtitle: "Combien de jours peux-tu t'entraîner ?" },
  { id: "profile", title: "Ton profil", subtitle: "Quelques infos pour personnaliser ton programme" },
];

const GOALS = [
  { value: "Prise de masse", icon: "💪", desc: "Gagner en muscle et en force" },
  { value: "Perte de poids", icon: "🔥", desc: "Brûler les graisses, affiner la silhouette" },
  { value: "Endurance", icon: "🏃", desc: "Améliorer ta capacité cardiovasculaire" },
  { value: "Forme générale", icon: "⚡", desc: "Rester actif, se sentir bien dans son corps" },
];

const LEVELS = [
  { value: "Débutant", icon: "🌱", desc: "Moins de 6 mois d'expérience" },
  { value: "Intermédiaire", icon: "📈", desc: "6 mois à 2 ans d'entraînement régulier" },
  { value: "Avancé", icon: "🏆", desc: "Plus de 2 ans d'entraînement sérieux" },
];

const EQUIPMENTS = [
  { value: "Aucun (maison)", icon: "🏠", desc: "Poids du corps uniquement, chez toi" },
  { value: "Haltères", icon: "🏋️", desc: "Haltères et matériel de base" },
  { value: "Salle complète", icon: "🏟️", desc: "Accès à une salle de sport complète" },
];

const DAYS_OPTIONS = [2, 3, 4, 5];

function OptionCard({ value, icon, desc, selected, onClick }) {
  return (
    <button
      className={`option-card ${selected ? "selected" : ""}`}
      onClick={() => onClick(value)}
      type="button"
    >
      <span className="option-icon">{icon}</span>
      <span className="option-value">{value}</span>
      {desc && <span className="option-desc">{desc}</span>}
    </button>
  );
}

function StepIndicator({ current, total }) {
  return (
    <div className="step-indicator">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`step-dot ${i < current ? "done" : i === current ? "active" : ""}`}
        />
      ))}
    </div>
  );
}

export default function FormWizard({ onComplete }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    firstName: "",
    goal: "",
    level: "",
    equipment: "",
    daysPerWeek: 3,
    age: "",
    gender: "",
    apiKey: "",
  });
  const [error, setError] = useState("");

  function update(field, value) {
    setData((d) => ({ ...d, [field]: value }));
    setError("");
  }

  function canNext() {
    switch (step) {
      case 0: return data.firstName.trim().length >= 2;
      case 1: return !!data.goal;
      case 2: return !!data.level;
      case 3: return !!data.equipment;
      case 4: return !!data.daysPerWeek;
      case 5: return data.age && data.gender && data.apiKey.trim().startsWith("sk-");
      default: return false;
    }
  }

  function handleNext() {
    if (!canNext()) {
      setError("Merci de compléter cette étape avant de continuer.");
      return;
    }
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else onComplete(data);
  }

  function handleBack() {
    setStep((s) => Math.max(0, s - 1));
    setError("");
  }

  const currentStep = STEPS[step];

  return (
    <div className="wizard-container">
      <div className="wizard-card">
        <div className="wizard-header">
          <StepIndicator current={step} total={STEPS.length} />
          <p className="step-label">Étape {step + 1} / {STEPS.length}</p>
          <h2 className="step-title">{currentStep.title}</h2>
          <p className="step-subtitle">{currentStep.subtitle}</p>
        </div>

        <div className="wizard-body">
          {step === 0 && (
            <div className="input-group">
              <input
                className="text-input"
                type="text"
                placeholder="Ton prénom..."
                value={data.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNext()}
                autoFocus
                maxLength={30}
              />
            </div>
          )}

          {step === 1 && (
            <div className="options-grid">
              {GOALS.map((g) => (
                <OptionCard
                  key={g.value}
                  {...g}
                  selected={data.goal === g.value}
                  onClick={(v) => update("goal", v)}
                />
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="options-grid cols-3">
              {LEVELS.map((l) => (
                <OptionCard
                  key={l.value}
                  {...l}
                  selected={data.level === l.value}
                  onClick={(v) => update("level", v)}
                />
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="options-grid cols-3">
              {EQUIPMENTS.map((e) => (
                <OptionCard
                  key={e.value}
                  {...e}
                  selected={data.equipment === e.value}
                  onClick={(v) => update("equipment", v)}
                />
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="days-grid">
              {DAYS_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`day-btn ${data.daysPerWeek === d ? "selected" : ""}`}
                  onClick={() => update("daysPerWeek", d)}
                >
                  <span className="day-number">{d}</span>
                  <span className="day-label">jour{d > 1 ? "s" : ""}/semaine</span>
                </button>
              ))}
            </div>
          )}

          {step === 5 && (
            <div className="profile-fields">
              <div className="field-row">
                <div className="input-group">
                  <label className="field-label">Ton âge</label>
                  <input
                    className="text-input"
                    type="number"
                    placeholder="Ex: 28"
                    value={data.age}
                    onChange={(e) => update("age", e.target.value)}
                    min="12"
                    max="80"
                  />
                </div>
                <div className="input-group">
                  <label className="field-label">Sexe</label>
                  <div className="gender-btns">
                    {["Homme", "Femme"].map((g) => (
                      <button
                        key={g}
                        type="button"
                        className={`gender-btn ${data.gender === g ? "selected" : ""}`}
                        onClick={() => update("gender", g)}
                      >
                        {g === "Homme" ? "♂" : "♀"} {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="input-group">
                <label className="field-label">
                  Clé API Anthropic{" "}
                  <span className="field-hint">(sk-ant-...)</span>
                </label>
                <input
                  className="text-input"
                  type="password"
                  placeholder="sk-ant-api03-..."
                  value={data.apiKey}
                  onChange={(e) => update("apiKey", e.target.value)}
                />
                <p className="field-note">
                  Ta clé reste dans ton navigateur et n'est jamais envoyée à nos serveurs.
                </p>
              </div>
            </div>
          )}

          {error && <p className="wizard-error">{error}</p>}
        </div>

        <div className="wizard-footer">
          {step > 0 && (
            <button className="btn-back" onClick={handleBack} type="button">
              ← Retour
            </button>
          )}
          <button
            className={`btn-next ${!canNext() ? "disabled" : ""}`}
            onClick={handleNext}
            type="button"
          >
            {step === STEPS.length - 1 ? "🚀 Générer mon aperçu" : "Continuer →"}
          </button>
        </div>
      </div>
    </div>
  );
}
