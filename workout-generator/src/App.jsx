import { useState } from "react";
import FormWizard from "./components/FormWizard";
import ResultPreview from "./components/ResultPreview";
import ProgramGenerator from "./components/ProgramGenerator";
import { generatePreview } from "./api";
import "./App.css";

const VIEWS = {
  FORM: "form",
  LOADING: "loading",
  PREVIEW: "preview",
  GENERATOR: "generator",
  ERROR: "error",
};

export default function App() {
  const [view, setView] = useState(VIEWS.FORM);
  const [userData, setUserData] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleFormComplete(data) {
    setUserData(data);
    setView(VIEWS.LOADING);
    try {
      const result = await generatePreview(data, data.apiKey);
      setPreview(result);
      setView(VIEWS.PREVIEW);
    } catch (err) {
      setErrorMsg(err.message || "Erreur lors de la génération de l'aperçu.");
      setView(VIEWS.ERROR);
    }
  }

  function handleReset() {
    setView(VIEWS.FORM);
    setUserData(null);
    setPreview(null);
    setErrorMsg("");
  }

  return (
    <div className="app">
      <nav className="navbar">
        <button className="nav-logo" onClick={handleReset} type="button">
          <span className="logo-fit">FIT</span>
          <span className="logo-pro">PRO</span>
        </button>
        <div className="nav-tagline">Programmes sportifs personnalisés par IA</div>
      </nav>

      <main className="main-content">
        {view === VIEWS.FORM && <FormWizard onComplete={handleFormComplete} />}

        {view === VIEWS.LOADING && (
          <div className="loading-screen">
            <div className="spinner large" />
            <h2>Génération de ton aperçu...</h2>
            <p>Claude analyse ton profil et construit tes séances personnalisées.</p>
          </div>
        )}

        {view === VIEWS.ERROR && (
          <div className="error-screen">
            <div className="error-icon-big">⚠️</div>
            <h2>Oups, une erreur s'est produite</h2>
            <p className="error-msg">{errorMsg}</p>
            <button className="btn-next" onClick={handleReset}>
              ← Recommencer
            </button>
          </div>
        )}

        {view === VIEWS.PREVIEW && preview && userData && (
          <ResultPreview
            program={preview}
            userData={userData}
            onGenerateFull={() => setView(VIEWS.GENERATOR)}
            onReset={handleReset}
          />
        )}

        {view === VIEWS.GENERATOR && userData && (
          <ProgramGenerator
            userData={userData}
            onBack={() => setView(VIEWS.PREVIEW)}
          />
        )}
      </main>
    </div>
  );
}
