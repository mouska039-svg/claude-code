---
name: sheetsmith
description: >
  Pipeline guidé et auto-vérifié pour créer des feuilles de calcul et des tableaux de bord.
  Des portes sur la sortie au début — par défaut, utilise une Google Sheet en direct, ou un
  fichier .xlsx local sur demande — puis interroge l'utilisateur sur le type, la portée, les
  onglets et le style, rédige une spécification de classeur, génère des sous-agents adversaires
  pour vérifier chaque formule, le construit (graphiques natifs, cartes KPI, bandes, formats
  conditionnels, couleurs thématiques), et valide le résultat avant de le remettre. Déclenchez
  lorsque l'utilisateur dit "crée-moi une feuille de calcul", "fais une Google Sheet", "conçois
  un tableau de bord", "budget/P&L/suivi/modèle financier", "feuille de calcul à partir de zéro",
  "assistant de feuille de calcul", ou veut un nouveau classeur avec des formules fonctionnelles
  et fiables. Produit une URL de Google Sheet (ou un chemin .xlsx) ainsi qu'un rapport de QA.
  NE PAS utiliser pour un tableau en ligne jetable rapide (répondez directement), ou pour
  travailler sur une feuille déjà existante (créez-en une nouvelle ici).
---

# Sheetsmith

Le seul pipeline pour créer une feuille de calcul ou un tableau de bord : choisir la surface de
sortie, interviewer, rédiger une spécification, **vérifier chaque formule de manière
adversariale**, construire et valider. La boucle de vérification est essentielle — un classeur
Sheetsmith est livré avec des formules vérifiées et un rapport de contrôle qualité, pas un simple
tampon "tout va bien". Une spécification alimente deux rendus : une **Google Sheet** native
(par défaut) ou un fichier **.xlsx** local.

## Quand utiliser

- "Construis-moi une feuille de calcul / Google Sheet / tableau de bord de A à Z"
- "Fais-moi un budget / un compte de résultat / un suivi de projet / un modèle financier"
- "Magicien des tableurs" — un nouveau classeur avec des formules fiables, avec un tableau de
  bord à première vue
- **Pas** pour un tableau rapide et ponctuel dans le chat → écrivez-le en ligne.
- **Pas** pour éditer/analyser une feuille déjà existante → cela crée une nouvelle.

## Flux de travail

### Phase 0 — Portail : choisir la surface de sortie ← toujours en premier

Demander une fois, à l'avance : **"Google Sheet en direct (partageable, rend nativement) ou un
fichier .xlsx local ?"**

- **Google Sheet (par défaut / recommandé).** Nécessite la configuration OAuth unique. Si
  `scripts/token.json` est manquant, guidez l'utilisateur à travers `scripts/SHEETS_SETUP.md`
  d'abord (ou proposez un fichier `.xlsx` maintenant et Google plus tard).
- **Fichier .xlsx.** Fonctionne immédiatement, sans configuration ; hors ligne/portable.

Enregistrez le choix — cela ne change que les étapes de _construction_ + _validation_ ; tout le
reste est partagé.

### Phase 1 — Entretien d'admission

Posez ces questions, un sujet à la fois (adaptez ; ne les déversez pas toutes en même temps) :

1. **Type / objectif** — budget, P&L, suivi de projet, modèle financier, calendrier, inventaire,
   CRM, autre.
2. **Portée** — colonnes/métriques, plage de temps, granularité (quotidienne / hebdomadaire /
   mensuelle).
3. **Onglets** — combien et ce que chacun contient (par exemple, `Données` → `Résumé` →
   `Tableau de bord`).
4. **Formules** — sommes/agrégations, % de changement, recherches, logique conditionnelle,
   références croisées.
5. **Mise en forme** — couleur d'en-tête/thème, alternance des lignes, formats de
   nombre/devise, règles de mise en forme conditionnelle.
6. **Tableau de bord ?** — un onglet `Tableau de bord` avec des cartes KPI (étiquette + grand
   nombre), des graphiques (barres/lignes/secteurs) et des mises en évidence visuelles (échelles
   de couleurs / barres de données là où c'est pris en charge), tirées des onglets de données.
7. **Destination** — Titre de la feuille (Google) ou nom de fichier + chemin (.xlsx) ; à
   partager avec (Google).

Branche : un type connu commence à partir d'un modèle ; "autre" est construit à partir des
réponses au périmètre.

**Règle d'intégrité : ne rédigez pas la spécification tant que l'admission n'est pas répondue**
(ou que les valeurs par défaut ne sont explicitement autorisées et enregistrées).

### Phase 2 — Rédiger la spécification du classeur

Écrivez un JSON de spécification du classeur (voir `references/spec-schema.md`) dans
`/tmp/<name>-spec.json` — l'artefact que les agents QA attaquent et que _les deux_ rendus
consomment. **Pour un tableau de bord, construisez-le selon `references/dashboard-layout.md`** :
un onglet `Dashboard` (`columns: []`) avec une grille d'espacement (`column_widths`), des
`section_bars`, des remplissages de panneau, des cartes KPI, et des graphiques disposés de
manière à ce que les cartes et leurs graphiques s'alignent dans les mêmes colonnes de panneau.
Le `thème` par défaut (pastel + terre cuite) est appliqué sauf s'il est remplacé.

### Phase 3 — Point de contrôle QA 1 : audit des spécifications (pré-construction)

Lancer **3 sous-agents parallèles avec l'outil Agent** (`subagent_type: Explore`), un par
lentille, chacun pointé vers la spécification enregistrée et chargé de _tenter de la casser_.
Modèle de prompt par agent (remplacer `<LENS>`) :

> Vous êtes un auditeur de formules de tableur adversarial. Lisez les spécifications du classeur
> à `<spec path>`. Votre perspective : **<LENS>**. Essayez de trouver des formules cassées.
> Retournez chaque défaut sous la forme `cellule-ou-plage → ce qui ne va pas → correction`, en
> citant la formule fautive. Si vous n'en trouvez aucun, listez les éléments spécifiques que
> vous avez vérifiés. Ne pas approuver sans vérification : une réponse de "ça a l'air bien" sans
> vérifications détaillées est une révision échouée et sera relancée.

Lentilles :

- **Exactitude des références** — cellules/portées/onglets corrects ; décalage d'une cellule ;
  mauvaise colonne ; risque de `#REF!`.
- **Cas limites** — division par zéro, plages vides/partielles, texte dans des valeurs
  numériques, erreurs de signe, bases en %.
- **Rapprochement** — les totaux s'additionnent ; les références croisées se résolvent ; les
  calculs s'additionnent de bout en bout.

Un agent sans vérifications détaillées est **réexécuté, non accepté**. Corrigez chaque constat
concret ; enregistrez chacun pour le rapport.

### Phase 4 — Construire

À partir de la spécification corrigée, rendre selon la surface choisie en Phase 0 :

- **Google Sheet** → `scripts/build_sheet.py <spec.json>` (API Sheets/Drive via `token.json`).
  Renvoie l'URL du classeur.
- **.xlsx** → `scripts/build_xlsx.py <spec.json> <chemin.xlsx>` (openpyxl). Renvoie le chemin.

Les deux lecteurs consomment la _même_ spécification : onglets, formules, formats de nombre,
mise en forme conditionnelle, graphiques natifs, cartes KPI, bandes de section et thème.

### Phase 5 — Point de contrôle QA 2 : validation après construction

Ouvrir le résultat rendu et vérifier : aucune cellule `#REF!`/`#DIV/0!`/`#VALUE!` ; les totaux
correspondent à la spécification ; les graphiques référencent les bonnes plages ; les formats et
le thème sont appliqués. Pour Google, relire via l'API ; pour .xlsx, recharger avec
`data_only` désactivé et inspecter les formules.

### Phase 6 — Livrer

Remettre **l'URL Google Sheet (ou le chemin .xlsx)** plus un **rapport de QA** court :
constats des Phases 3 et 5, corrections appliquées, et ce qui a été vérifié.

## Références

- `references/spec-schema.md` — le format de spécification du classeur partagé (les deux rendus).
- `references/dashboard-layout.md` — la mise en page du tableau de bord et le système de couleurs.
- `scripts/SHEETS_SETUP.md` — configuration OAuth unique pour Google Sheets.
