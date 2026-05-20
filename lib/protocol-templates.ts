export type TemplateSpecialty = "naturopathe" | "sophrologue" | "hypnotherapeute" | "all";

export type TemplateTheme =
  | "fatigue"
  | "digestion"
  | "stress"
  | "sommeil"
  | "poids"
  | "immunite"
  | "hormones"
  | "detox"
  | "douleurs"
  | "anxiete"
  | "confiance"
  | "tabac";

export interface ProtocolTemplate {
  id: string;
  specialty: TemplateSpecialty;
  theme: TemplateTheme;
  title: string;
  summary: string;
  context: string;
  duration_hint: number; // weeks
}

export const PROTOCOL_TEMPLATES: ProtocolTemplate[] = [
  // ─── Naturopathe ────────────────────────────────────────────────────────────

  {
    id: "nat-fatigue-chronique",
    specialty: "naturopathe",
    theme: "fatigue",
    title: "Fatigue chronique — Relance énergétique globale",
    summary:
      "Détox hépatique douce, rééquilibrage des oligoéléments et respect du rythme circadien pour restaurer l'énergie en profondeur.",
    context:
      "La patiente présente une fatigue persistante depuis plusieurs mois, accentuée le matin au réveil et en début d'après-midi, sans amélioration notable après le repos. Les bilans biologiques récents montrent un ferritine basse et un manque de vitamine D, signalant un terrain carencé. Le foie, organe central de la vitalité en naturopathie, sera soutenu par une détox hépatique douce sur les quatre premières semaines (radis noir, chardon-Marie, artichaut). En parallèle, un travail sur les oligoéléments — manganèse-cobalt en terrain hyporéactif, zinc-cuivre si infections traînantes — permettra de relancer les grandes fonctions enzymatiques. Le rythme circadien sera restauré via une hygiène lumineuse stricte (exposition matinale, coupure des écrans avant 21h) et un rythme alimentaire régulier calé sur les pics cortisoliques naturels.",
    duration_hint: 12,
  },
  {
    id: "nat-surpoids-metabolique",
    specialty: "naturopathe",
    theme: "poids",
    title: "Syndrome métabolique & surpoids — Rééquilibrage durable",
    summary:
      "Alimentation anti-inflammatoire, soutien du microbiote et régulation de l'insulinorésistance pour un retour au poids de forme.",
    context:
      "Le patient présente un surpoids de type androïde avec un périmètre abdominal supérieur à la norme, associé à une glycémie à jeun en limite haute et une fatigue post-prandiale marquée, signes classiques d'une insulinorésistance débutante. L'axe microbiote-intestin-cerveau est au cœur de ce protocole : une dysbiose confirmée par les ballonnements fréquents et les envies sucrées compulsives sera adressée par une réintroduction progressive de fibres prébiotiques et un apport ciblé en souches lactobacilles. L'alimentation sera orientée vers un modèle anti-inflammatoire méditerranéen — réduction des acides gras saturés et des sucres raffinés, augmentation des oméga-3 (poissons gras, graines de lin), légumes colorés à chaque repas. Un jeûne intermittent doux (16:8) sera introduit à partir de la quatrième semaine, après stabilisation de la glycémie. La gestion du stress, facteur aggravant de l'hypercortisolémie chronique, sera intégrée via des techniques de pleine conscience et une activité physique modérée quotidienne.",
    duration_hint: 12,
  },
  {
    id: "nat-digestion-sii",
    specialty: "naturopathe",
    theme: "digestion",
    title: "Digestion difficile & SII — Apaisement intestinal",
    summary:
      "Protocole FODMAP simplifié, réensemencement probiotique et travail sur la mastication pour retrouver un confort digestif au quotidien.",
    context:
      "La patiente souffre d'un syndrome de l'intestin irritable prédominant ballonnements, avec des douleurs abdominales spastiques survenant surtout en deuxième partie de journée et des alternances de transit irrégulier. L'interrogatoire alimentaire révèle une consommation élevée de légumineuses, oignons, pommes et produits laitiers — tous riches en FODMAP fermentescibles. Un régime d'éviction partielle et progressive sera mis en place les quatre premières semaines, sans être ni restrictif ni permanent, l'objectif étant d'identifier les aliments déclencheurs individuels. La mastication, souvent négligée, sera travaillée comme premier outil thérapeutique : 20 à 30 cycles masticatoires par bouchée activent l'amilase salivaire et préparent le bol alimentaire. Un apport en probiotiques multi-souches (Lactobacillus plantarum, Bifidobacterium infantis) sera introduit en semaine 3 après avoir soutenu la muqueuse intestinale avec du zinc et de la L-glutamine. Le stress émotionnel comme facteur aggravant du SII via l'axe intestin-cerveau sera abordé en séance.",
    duration_hint: 8,
  },
  {
    id: "nat-troubles-sommeil",
    specialty: "naturopathe",
    theme: "sommeil",
    title: "Troubles du sommeil — Chronobiologie & récupération",
    summary:
      "Recalibrage chronobiologique, supplémentation en magnésium et protocole de luminothérapie pour rétablir un sommeil réparateur.",
    context:
      "Le patient décrit des difficultés d'endormissement récurrentes (latence supérieure à 45 minutes), des réveils nocturnes entre 2h et 4h du matin, et un réveil matinal non reposant malgré 7 à 8 heures passées au lit. Ce tableau oriente vers une dysrégulation de l'axe mélatonine-cortisol, souvent entretenue par une exposition aux écrans le soir et un mode de vie désynchronisé des cycles lumière-obscurité. Le protocole débutera par un audit chronobiologique complet : heure d'endormissement naturelle, chronotype, exposition lumineuse journalière. La luminothérapie matinale (2500 lux, 20 minutes dès le réveil) sera instaurée dès la première semaine pour recaler l'horloge centrale. Le magnésium bisglycinate (300 mg/jour en soirée) soutiendra la synthèse de GABA et favorisera la relaxation neuromusculaire. Des plantes sédatives douces — valériane, mélisse, passiflore — seront introduites sous forme de tisane rituelle à partir de la troisième semaine, avec une attention particulière portée au rituel de coucher comme signal neurobiologique du repos.",
    duration_hint: 6,
  },
  {
    id: "nat-immunite-basse",
    specialty: "naturopathe",
    theme: "immunite",
    title: "Immunité basse — Renforcement des défenses naturelles",
    summary:
      "Zinc, vitamine D et plantes adaptogènes pour consolider le terrain immunitaire et réduire la fréquence des infections récurrentes.",
    context:
      "La patiente présente un terrain immunitaire fragilisé caractérisé par plus de cinq épisodes infectieux ORL ou respiratoires par an, une convalescence prolongée après chaque épisode et une fatigue persistante en dehors des périodes aiguës. Le dosage de la vitamine D3 révèle un taux insuffisant à 18 ng/mL — bien en dessous du seuil fonctionnel de 40 ng/mL —, confirmant la nécessité d'une supplémentation intensive initiale (4000 UI/jour pendant 8 semaines, puis entretien). Le zinc, co-facteur essentiel de plus de 300 enzymes immunitaires, sera apporté à raison de 15 mg/jour sous forme de gluconate ou picolinate. Les plantes adaptogènes — astragale, eleuthérocoque, reishi — constitueront le troisième pilier, modulant la réponse immunitaire sans la sur-stimuler. L'axe intestinal, siège de 70 % du système immunitaire, sera soutenu par des prébiotiques (inuline, fructo-oligosaccharides) et une alimentation riche en polyphénols. Le programme intégrera également une gestion du stress chronique, facteur majeur d'immunosuppression via les glucocorticoïdes.",
    duration_hint: 8,
  },
  {
    id: "nat-hormones-feminines",
    specialty: "naturopathe",
    theme: "hormones",
    title: "Déséquilibre hormonal féminin — Harmonie du cycle",
    summary:
      "Soutien de l'élimination des œstrogènes, travail sur le cycle lunaire et phytoestrogènes pour rééquilibrer le terrain hormonal féminin.",
    context:
      "La patiente, en périménopause ou présentant un syndrome prémenstruel marqué, décrit une dominance oestrogénique confirmée par des règles abondantes et douloureuses, une sensibilité mammaire cyclique, des sautes d'humeur prémenstruelles et une prise de poids de type gynécoïde. Le foie étant le principal organe d'élimination des œstrogènes, sa stimulation par des plantes hépatoprotectrices (chardon-Marie, desmodium) sera initiée dès la première phase du protocole. L'intestin joue également un rôle clé via le microbiome : une dysbiose réduisant la déconjugaison des œstrogènes provoque leur réabsorption — la flore sera soutenue par des fibres et des probiotiques spécifiques. Les phytoestrogènes (isoflavones de soja fermenté, trèfle rouge) seront introduits prudemment en deuxième partie de protocole pour leur effet modulateur. Un travail de synchronisation avec le cycle lunaire et les rythmes féminins naturels (énergie, repos, créativité, introspection) enrichira le suivi d'une dimension psycho-émotionnelle indispensable.",
    duration_hint: 12,
  },
  {
    id: "nat-douleurs-articulaires",
    specialty: "naturopathe",
    theme: "douleurs",
    title: "Douleurs articulaires chroniques — Terrain anti-inflammatoire",
    summary:
      "Curcuma biodisponible, alimentation alcalinisante et bains dérivatifs pour réduire l'inflammation articulaire et retrouver la mobilité.",
    context:
      "Le patient souffre de douleurs articulaires diffuses touchant principalement les genoux, les hanches et les mains, avec une raideur matinale supérieure à 30 minutes et une aggravation lors des changements météorologiques — tableau classique d'un terrain inflammatoire chronique de bas grade. L'alimentation sera le premier levier : suppression des sucres raffinés, des huiles végétales riches en oméga-6 pro-inflammatoires (tournesol, maïs) et des aliments de la famille des solanacées, dont la tomate, l'aubergine et le poivron, chez les sujets sensibles. La curcumine, principal actif du curcuma, sera apportée sous forme de complexe phospholipidique ou associée à la pipérine pour une biodisponibilité optimale (400–600 mg d'extrait titré, deux fois par jour aux repas). Les bains dérivatifs (immersion des cuisses dans l'eau froide 10–15 minutes), technique hydrologique naturopathique, seront enseignés comme outil quotidien de drainage des toxines articulaires. Un travail d'alcalinisation progressive du terrain (légumes verts, jus de légumes crus, eau citronnée) complètera le protocole.",
    duration_hint: 10,
  },
  {
    id: "nat-anti-age-oxydatif",
    specialty: "naturopathe",
    theme: "detox",
    title: "Stress oxydatif & vitalité durable — Anti-âge fonctionnel",
    summary:
      "Antioxydants ciblés, jeûne intermittent et mouvement quotidien pour ralentir le vieillissement cellulaire et maintenir une vitalité durable.",
    context:
      "La patiente exprime une fatigue chronique associée à des signes cutanés de vieillissement accéléré (teint terne, rides prématurées), une récupération physique ralentie après l'effort et une sensibilité accrue aux infections — autant de marqueurs d'un stress oxydatif systémique dépassant les capacités antioxydantes de l'organisme. Le protocole s'appuiera sur une supplémentation ciblée en antioxydants synergiques : vitamine C liposomale (500 mg/jour), tocophérols mixtes (vitamine E), coenzyme Q10 ubiquinol (100 mg/jour, cofacteur mitochondrial indispensable), et sélénium organique (80 µg/jour). L'alimentation sera restructurée autour des aliments à haute densité phytochimique : baies sauvages, légumes crucifères, thé vert, chocolat noir 85 %. Le jeûne intermittent 16:8, instauré progressivement à partir de la troisième semaine, activera les mécanismes d'autophagie cellulaire. La marche rapide ou la natation douce (30 minutes, 5 fois par semaine) sera recommandée comme activité physique principale, la sédentarité étant un accélérateur majeur du stress oxydatif.",
    duration_hint: 10,
  },

  // ─── Sophrologue ────────────────────────────────────────────────────────────

  {
    id: "sopho-stress-professionnel",
    specialty: "sophrologue",
    theme: "stress",
    title: "Stress professionnel — Décharge et ancrage",
    summary:
      "Techniques de décharge physiologique, respiration régulée et déprogrammation des schémas de tension pour retrouver équilibre et performance.",
    context:
      "Le consultant présente un stress professionnel chronique lié à une surcharge de travail persistante, des responsabilités managériales importantes et une difficulté marquée à déconnecter en dehors des heures de bureau. Les symptômes somatiques rapportés — tensions cervicales, mâchoires serrées la nuit, troubles du transit et insomnies d'endormissement — témoignent d'une activation prolongée du système nerveux sympathique sans période de récupération suffisante. Les premières séances seront dédiées à la relaxation dynamique de premier degré (RD1) pour apprendre à relâcher les tensions musculaires conscientes, puis à la RD2 pour explorer le corps en mouvement sans effort. Les techniques de décharge physiologique — tremblement contrôlé, soupirs expiratoires profonds, étirements actifs — seront pratiquées comme rituels de transition entre le temps professionnel et le temps personnel. La cohérence cardiaque (5 secondes d'inspiration, 5 secondes d'expiration, 5 minutes, 3 fois par jour) sera introduite comme outil autonome dès la deuxième séance. En fin de protocole, un travail de déprogrammation des croyances liées à la performance et à la valeur personnelle permettra une transformation plus durable.",
    duration_hint: 8,
  },
  {
    id: "sopho-anxiete-generalisee",
    specialty: "sophrologue",
    theme: "anxiete",
    title: "Anxiété généralisée — Ancrage et sérénité intérieure",
    summary:
      "Ancrage sensoriel progressif, visualisations positives et cohérence cardiaque pour réduire le niveau d'anxiété de fond et retrouver confiance.",
    context:
      "La patiente souffre d'une anxiété généralisée caractérisée par des pensées intrusives répétitives concernant l'avenir, une hypervigilance constante, des palpitations fréquentes et une tendance à anticiper le pire dans les situations ordinaires. Cette activation chronique du système limbique génère une fatigue mentale profonde et une difficulté à habiter le moment présent. Le protocole sophrologique débutera par des exercices d'ancrage sensoriel — scan corporel des cinq sens, conscience des points de contact avec le sol, attention à la température de l'air inspiré — pour ramener l'attention du futur imaginé vers le présent vécu. La visualisation positive sera introduite progressivement : d'abord des ressources passées (moments de sécurité, de compétence), puis des projections vers un futur apaisé et maîtrisé. La cohérence cardiaque et les exercices de respiration abdominale profonde constitueront les outils d'urgence en situation d'anxiété aiguë. Les séances intégreront également un travail sur la voix intérieure critique et son remplacement progressif par une posture de bienveillance envers soi.",
    duration_hint: 10,
  },

  // ─── Hypnothérapeute ────────────────────────────────────────────────────────

  {
    id: "hypno-confiance-soi",
    specialty: "hypnotherapeute",
    theme: "confiance",
    title: "Confiance en soi — Reconstruction intérieure",
    summary:
      "Suggestions post-hypnotiques, carte mentale des ressources et journal des succès pour ancrer une confiance solide et durable.",
    context:
      "Le patient exprime un manque de confiance en soi profondément ancré, se manifestant par une autocritique sévère, une tendance à minimiser ses réussites et une inhibition dans les situations sociales ou professionnelles à enjeux. L'exploration hypnotique initiale permettra d'identifier les événements fondateurs — souvent liés à l'enfance ou à des expériences de honte ou d'échec marquantes — à l'origine des croyances limitantes. Les séances d'hypnose ericksonienne utiliseront des métaphores de croissance et de révélation pour accéder aux ressources inconscientes disponibles, souvent ignorées par la conscience critique. Des suggestions post-hypnotiques spécifiques seront ancrées à des gestes ou mots-clés choisis par le patient, créant des déclencheurs accessibles dans la vie quotidienne. Entre les séances, la tenue d'un journal des succès quotidiens — même minimes — renforcera les nouvelles voies neuronales associées à la compétence et à la valeur personnelle. Une carte mentale des ressources (qualités, accomplissements, soutiens) sera construite progressivement comme support visuel de la transformation.",
    duration_hint: 8,
  },
  {
    id: "hypno-sevrage-tabac",
    specialty: "hypnotherapeute",
    theme: "tabac",
    title: "Sevrage tabagique — Libération du lien à l'addiction",
    summary:
      "Aversion conditionnée, déconstruction du rapport à l'addiction et ancres positives pour accompagner l'arrêt du tabac en douceur.",
    context:
      "Le patient fume en moyenne 15 cigarettes par jour depuis plus de dix ans et a déjà tenté plusieurs sevrages sans succès durable, décrivant une dépendance à la fois physique et fortement psychologique, la cigarette étant associée à la gestion du stress, aux pauses sociales et aux transitions rituelles de la journée. La première séance sera consacrée à un entretien motivationnel approfondi pour explorer l'ambivalence, les bénéfices perçus du tabac et les valeurs de vie que l'arrêt servirait. L'hypnose ericksonienne sera utilisée pour créer une dissociation progressive du plaisir associé à la cigarette : techniques d'aversion douce (association à des sensations désagréables en état de transe) et de réévaluation de l'identité du fumeur vers une nouvelle identité de non-fumeur. Des ancres positives (geste, respiration profonde, image ressource) seront installées comme substituts aux rituels tabagiques. Le rapport à l'addiction sera déconstruit à travers un travail sur la partie protectrice de ce comportement, en lui proposant de nouvelles stratégies pour satisfaire les besoins sous-jacents — détente, appartenance, récompense.",
    duration_hint: 6,
  },
];

export function getTemplates(specialty?: TemplateSpecialty): ProtocolTemplate[] {
  if (!specialty || specialty === "all") {
    return PROTOCOL_TEMPLATES;
  }
  return PROTOCOL_TEMPLATES.filter((t) => t.specialty === specialty);
}

export function getTemplateById(id: string): ProtocolTemplate | undefined {
  return PROTOCOL_TEMPLATES.find((t) => t.id === id);
}
