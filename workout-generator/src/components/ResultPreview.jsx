const GOAL_COLORS = {
  "Prise de masse": "#FF6B35",
  "Perte de poids": "#FF4444",
  "Endurance": "#44AAFF",
  "Forme générale": "#44DD88",
};

function ExerciseRow({ exercise, index }) {
  return (
    <div className={`exercise-row ${index % 2 === 0 ? "even" : "odd"}`}>
      <div className="exercise-main">
        <span className="exercise-num">{index + 1}</span>
        <span className="exercise-name">{exercise.name}</span>
      </div>
      <div className="exercise-stats">
        <span className="stat-badge sets">{exercise.sets} séries</span>
        <span className="stat-badge reps">× {exercise.reps}</span>
        <span className="stat-badge rest">⏱ {exercise.rest}</span>
      </div>
      {exercise.tip && (
        <p className="exercise-tip">💡 {exercise.tip}</p>
      )}
    </div>
  );
}

function SessionCard({ session, index }) {
  return (
    <div className="session-card">
      <div className="session-header">
        <div className="session-day-badge">{session.day}</div>
        <div className="session-info">
          <h3 className="session-name">{session.name}</h3>
          <p className="session-objective">{session.objective}</p>
        </div>
        <span className="session-duration">{session.duration}</span>
      </div>
      <div className="exercises-list">
        {session.exercises.map((ex, i) => (
          <ExerciseRow key={i} exercise={ex} index={i} />
        ))}
      </div>
    </div>
  );
}

export default function ResultPreview({ program, userData, onGenerateFull, onReset }) {
  const accentColor = GOAL_COLORS[userData.goal] || "#FF6B35";

  return (
    <div className="result-container">
      {/* Hero */}
      <div className="result-hero">
        <div className="hero-badge" style={{ borderColor: accentColor, color: accentColor }}>
          APERÇU — SEMAINE 1
        </div>
        <h1 className="hero-title">{program.programName}</h1>
        <p className="hero-welcome">
          Salut <strong>{userData.firstName}</strong> ! Voici ton programme personnalisé.
        </p>
        <p className="hero-week-obj">{program.weekObjective}</p>

        <div className="profile-chips">
          <span className="chip">{userData.goal}</span>
          <span className="chip">{userData.level}</span>
          <span className="chip">{userData.equipment}</span>
          <span className="chip">{userData.daysPerWeek}j/semaine</span>
        </div>
      </div>

      {/* Sessions */}
      <div className="sessions-section">
        <h2 className="section-title">
          <span className="section-accent" style={{ background: accentColor }} />
          Tes séances de la semaine
        </h2>

        <div className="sessions-grid">
          {program.sessions.map((session, i) => (
            <SessionCard key={i} session={session} index={i} />
          ))}
        </div>
      </div>

      {/* Teaser programme complet */}
      <div className="teaser-section">
        <div className="teaser-card">
          <div className="teaser-weeks">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`week-pill ${i === 0 ? "unlocked" : "locked"}`}>
                S{i + 1}
                {i > 0 && <span className="lock-icon">🔒</span>}
              </div>
            ))}
          </div>
          <h3 className="teaser-title">
            Programme complet <span style={{ color: accentColor }}>8 semaines</span>
          </h3>
          <p className="teaser-desc">
            Progressions détaillées · Guide nutrition · Fichier de suivi Excel
          </p>
          <div className="teaser-actions">
            <button className="btn-generate" onClick={onGenerateFull}>
              🎯 Générer mon programme complet (démo)
            </button>
            <a
              href="https://gumroad.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-buy"
            >
              💳 Obtenir mon programme 8 semaines →
            </a>
          </div>
        </div>
      </div>

      <button className="btn-restart" onClick={onReset} type="button">
        ← Recommencer avec un autre profil
      </button>
    </div>
  );
}
