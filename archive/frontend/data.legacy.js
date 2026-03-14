const TERMS = [
  {
    term: "SIA 102",
    category: "Normes",
    definition: "Reglement qui decrit les prestations et honoraires des architectes en Suisse.",
    example: "On s'y refere pour definir les phases et le role de l'architecte.",
    related: ["Phases SIA 102", "Maitre d'oeuvre", "Contrat"]
  },
  {
    term: "SIA 118",
    category: "Normes",
    definition: "Conditions generales pour l'execution des travaux de construction.",
    example: "Base contractuelle entre maitre d'ouvrage et entreprise.",
    related: ["Contrat d'entreprise", "Avenant", "Reception"]
  },
  {
    term: "SIA 416",
    category: "Normes",
    definition: "Norme qui definit comment mesurer surfaces et volumes d'un batiment.",
    example: "Permet de calculer surface utile et surface de plancher.",
    related: ["Surface utile", "Surface de plancher", "Volume SIA"]
  },
  {
    term: "SIA 181",
    category: "Normes",
    definition: "Norme de protection contre le bruit dans le batiment.",
    example: "Exigences acoustiques entre appartements.",
    related: ["Acoustique", "Detail constructif"]
  },
  {
    term: "Acoustique",
    category: "Normes",
    definition: "Gestion du bruit et des transmissions sonores dans un batiment.",
    example: "Isolation phonique entre logements.",
    related: ["SIA 181", "Detail constructif"]
  },
  {
    term: "SIA 500",
    category: "Normes",
    definition: "Norme suisse pour les constructions sans obstacles (accessibilite).",
    example: "Largeurs de passage pour fauteuil roulant.",
    related: ["Accessibilite", "Circulation"]
  },
  {
    term: "AEAI (PPI)",
    category: "Normes",
    definition: "Prescriptions suisses de protection incendie.",
    example: "Choix des portes coupe-feu et des voies d'evacuation.",
    related: ["Compartimentage", "Issue", "Securite incendie"]
  },
  {
    term: "Securite incendie",
    category: "Normes",
    definition: "Ensemble des mesures pour limiter les risques d'incendie.",
    example: "Detection, compartimentage, evacuation.",
    related: ["AEAI (PPI)", "Compartimentage"]
  },
  {
    term: "CFC",
    category: "Normes",
    definition: "Classification suisse des couts de construction par groupes de travaux.",
    example: "Le lot 'CFC 2' regroupe le gros oeuvre.",
    related: ["Devis", "Lot", "Appel d'offres"]
  },
  {
    term: "Phases SIA 102",
    category: "Phases",
    definition: "Decoupage du projet en 5 phases selon SIA 102.",
    example: "Avant-projet, projet, preparatoire d'execution, execution, phase finale.",
    related: ["Avant-projet", "Projet", "Execution"]
  },
  {
    term: "Programme",
    category: "Phases",
    definition: "Liste des besoins et fonctions a prevoir dans le projet.",
    example: "Nombre de logements, surfaces, budget.",
    related: ["Maitre d'ouvrage", "Avant-projet"]
  },
  {
    term: "Avant-projet",
    category: "Phases",
    definition: "Premieres esquisses selon les contraintes et les souhaits du mandant.",
    example: "Organisation generale et volumetrie.",
    related: ["Programme", "Projet"]
  },
  {
    term: "Projet",
    category: "Phases",
    definition: "Developpement des plans et preparation du permis.",
    example: "Plans, demande de permis, devis.",
    related: ["Avant-projet", "Permis de construire"]
  },
  {
    term: "Preparatoire d'execution",
    category: "Phases",
    definition: "Appels d'offres, planning des travaux, adjudication.",
    example: "Comparer les soumissions.",
    related: ["Appel d'offres", "Adjudication"]
  },
  {
    term: "Execution",
    category: "Phases",
    definition: "Plans definitifs d'execution et construction de l'ouvrage.",
    example: "Details pour chantier et suivi.",
    related: ["Chantier", "Direction des travaux"]
  },
  {
    term: "Phase finale",
    category: "Phases",
    definition: "Decompte final, travaux de garantie, reception definitive.",
    example: "Lever les reserves.",
    related: ["Reception", "Garantie"]
  },
  {
    term: "Plan de situation",
    category: "Dessin",
    definition: "Plan qui montre le batiment sur sa parcelle et son environnement.",
    example: "Orientation, limites de propriete, acces.",
    related: ["Implantation", "Limites de propriete"]
  },
  {
    term: "Limites de propriete",
    category: "Dessin",
    definition: "Frontieres legales de la parcelle.",
    example: "Ligne separant deux terrains.",
    related: ["Plan de situation", "Implantation"]
  },
  {
    term: "Plan d'etage",
    category: "Dessin",
    definition: "Vue horizontale d'un niveau a une echelle donnee.",
    example: "Plan du rez avec murs, portes, mobilier.",
    related: ["Coupe", "Cotation"]
  },
  {
    term: "Coupe",
    category: "Dessin",
    definition: "Vue verticale qui montre les niveaux et la structure.",
    example: "Hauteurs sous plafond et toiture.",
    related: ["Plan d'etage", "Niveau"]
  },
  {
    term: "Facade",
    category: "Dessin",
    definition: "Elevation d'une face du batiment.",
    example: "Facade sud avec ouvertures.",
    related: ["Coupe", "Detail"]
  },
  {
    term: "Detail",
    category: "Dessin",
    definition: "Dessin a grande echelle pour expliquer un point constructif.",
    example: "Jonction mur-dalle a l'echelle 1:10.",
    related: ["Echelle", "Detail constructif"]
  },
  {
    term: "Echelle",
    category: "Dessin",
    definition: "Rapport entre la taille sur le plan et la realite.",
    example: "1:100 pour un plan d'ensemble.",
    related: ["Detail", "Cotation"]
  },
  {
    term: "Cotation",
    category: "Dessin",
    definition: "Indication des dimensions sur un plan.",
    example: "Largeur de porte 90 cm.",
    related: ["Plan d'etage", "Axe"]
  },
  {
    term: "Cartouche",
    category: "Dessin",
    definition: "Zone du plan avec infos : projet, date, echelle, auteur.",
    example: "En bas a droite du plan.",
    related: ["Legende", "Revision"]
  },
  {
    term: "Legende",
    category: "Dessin",
    definition: "Liste des symboles et hachures utilisees.",
    example: "Hachure beton, isolant, bois.",
    related: ["Hachure", "Plan d'etage"]
  },
  {
    term: "Hachure",
    category: "Dessin",
    definition: "Motif graphique pour representer un materiau.",
    example: "Hachures pour l'isolant.",
    related: ["Legende", "Coupe"]
  },
  {
    term: "Axe",
    category: "Dessin",
    definition: "Ligne de reference pour aligner structure et elements.",
    example: "Axe A a D pour les murs porteurs.",
    related: ["Trame", "Cotation"]
  },
  {
    term: "Trame",
    category: "Dessin",
    definition: "Reseau d'axes qui organise le plan.",
    example: "Trame 5.00 m entre poteaux.",
    related: ["Axe", "Structure"]
  },
  {
    term: "Structure",
    category: "Dessin",
    definition: "Ossature porteuse du batiment (murs, dalles, poteaux).",
    example: "Structure en beton arme ou bois.",
    related: ["Trame", "Coupe"]
  },
  {
    term: "Niveau",
    category: "Dessin",
    definition: "Altitude de reference d'un point ou d'un plancher.",
    example: "+0.00 pour le rez.",
    related: ["Coupe", "Altimetrie"]
  },
  {
    term: "Altimetrie",
    category: "Dessin",
    definition: "Informations de hauteur et de relief sur un plan.",
    example: "Courbes de niveau ou points cotes.",
    related: ["Niveau", "Plan de situation"]
  },
  {
    term: "Implantation",
    category: "Dessin",
    definition: "Position precise du batiment sur la parcelle.",
    example: "Respecter les distances aux limites.",
    related: ["Plan de situation", "Gabarit"]
  },
  {
    term: "Gabarit",
    category: "Dessin",
    definition: "Volume provisoire sur site pour visualiser la hauteur/forme.",
    example: "Structure temporaire avant permis.",
    related: ["Permis de construire", "Implantation"]
  },
  {
    term: "Permis de construire",
    category: "Dossier",
    definition: "Autorisation administrative pour construire un projet.",
    example: "Dossier depose a la commune.",
    related: ["Dossier d'autorisation", "Plan de situation"]
  },
  {
    term: "Dossier d'autorisation",
    category: "Dossier",
    definition: "Ensemble de plans et documents pour demander un permis.",
    example: "Plans, coupes, notices, formulaires.",
    related: ["Permis de construire", "Facade"]
  },
  {
    term: "Dossier d'execution",
    category: "Dossier",
    definition: "Plans et details precis pour construire.",
    example: "Plans 1:50, details 1:10.",
    related: ["Detail", "Chantier"]
  },
  {
    term: "Maitre d'ouvrage",
    category: "Chantier",
    definition: "Client qui commande et finance le projet.",
    example: "Une commune, un prive, une regie.",
    related: ["Maitre d'oeuvre", "Contrat"]
  },
  {
    term: "Maitre d'oeuvre",
    category: "Chantier",
    definition: "Equipe qui conçoit et dirige le projet.",
    example: "Architecte et bureaux techniques.",
    related: ["Direction des travaux", "Phases SIA 102"]
  },
  {
    term: "Chantier",
    category: "Chantier",
    definition: "Lieu et periode ou les travaux sont realises.",
    example: "Coordination des corps de metier sur site.",
    related: ["Direction des travaux", "Entreprise generale (EG)"]
  },
  {
    term: "Direction des travaux",
    category: "Chantier",
    definition: "Suivi du chantier : qualite, delais, couts.",
    example: "Controle des entreprises et PV de chantier.",
    related: ["Chantier", "Reception"]
  },
  {
    term: "Entreprise generale (EG)",
    category: "Chantier",
    definition: "Entreprise qui coordonne plusieurs sous-traitants.",
    example: "Un seul interlocuteur pour plusieurs corps de metier.",
    related: ["Sous-traitant", "Contrat d'entreprise"]
  },
  {
    term: "Sous-traitant",
    category: "Chantier",
    definition: "Entreprise qui execute une partie des travaux pour une autre.",
    example: "Pose des menuiseries sous contrat EG.",
    related: ["Entreprise generale (EG)", "Lot"]
  },
  {
    term: "Lot",
    category: "Contrats",
    definition: "Ensemble de travaux d'un meme corps de metier.",
    example: "Lot electricite, lot sanitaire.",
    related: ["CFC", "Soumission"]
  },
  {
    term: "Entreprise totale (ET)",
    category: "Chantier",
    definition: "Entreprise qui prend conception et realisation.",
    example: "Un contrat unique du projet au chantier.",
    related: ["Entreprise generale (EG)", "Maitre d'ouvrage"]
  },
  {
    term: "Soumission",
    category: "Contrats",
    definition: "Offre de prix d'une entreprise pour un lot.",
    example: "Soumission du lot maconnerie.",
    related: ["Appel d'offres", "Adjudication"]
  },
  {
    term: "Adjudication",
    category: "Contrats",
    definition: "Attribution officielle d'un lot a une entreprise.",
    example: "Choix de l'entreprise apres comparaison.",
    related: ["Soumission", "Contrat d'entreprise"]
  },
  {
    term: "Appel d'offres",
    category: "Contrats",
    definition: "Procedure pour demander des prix a plusieurs entreprises.",
    example: "Envoi des plans et du CFC.",
    related: ["Soumission", "CFC"]
  },
  {
    term: "Devis",
    category: "Contrats",
    definition: "Estimation detaillee du cout des travaux.",
    example: "Devis par lots avec quantites.",
    related: ["CFC", "Soumission"]
  },
  {
    term: "Contrat",
    category: "Contrats",
    definition: "Accord legal qui fixe les obligations des parties.",
    example: "Qui fait quoi, a quel prix, dans quels delais.",
    related: ["Contrat d'entreprise", "Avenant"]
  },
  {
    term: "Contrat d'entreprise",
    category: "Contrats",
    definition: "Contrat entre maitre d'ouvrage et entreprise pour executer des travaux.",
    example: "Souvent base sur SIA 118.",
    related: ["SIA 118", "Avenant"]
  },
  {
    term: "Avenant",
    category: "Contrats",
    definition: "Modification du contrat initial (prix, delai, contenu).",
    example: "Ajout d'une terrasse non prevue.",
    related: ["Contrat d'entreprise", "Devis"]
  },
  {
    term: "Reception",
    category: "Chantier",
    definition: "Etape ou l'ouvrage est accepte avec reserve ou non.",
    example: "Liste des defauts a corriger.",
    related: ["Garantie", "Direction des travaux"]
  },
  {
    term: "Garantie",
    category: "Chantier",
    definition: "Periode ou l'entreprise corrige les defauts.",
    example: "Defaut d'etancheite a corriger.",
    related: ["Reception", "SIA 118"]
  },
  {
    term: "Surface de plancher",
    category: "Mesures",
    definition: "Surface de reference pour calculs et comparaisons (selon SIA 416).",
    example: "Utilisee pour estimer les couts.",
    related: ["SIA 416", "Surface utile"]
  },
  {
    term: "Surface utile",
    category: "Mesures",
    definition: "Surface vraiment utilisable par l'usager (selon SIA 416).",
    example: "Pieces, locaux, bureaux.",
    related: ["SIA 416", "Surface de plancher"]
  },
  {
    term: "Volume SIA",
    category: "Mesures",
    definition: "Volume de reference pour calculs (selon SIA 416).",
    example: "Comparer des batiments.",
    related: ["SIA 416", "Surface de plancher"]
  },
  {
    term: "BIM",
    category: "BIM",
    definition: "Mode de travail collaboratif base sur une maquette numerique.",
    example: "Modele 3D partage entre architecte et ingenieurs.",
    related: ["Maquette numerique", "IFC", "LOD"]
  },
  {
    term: "Maquette numerique",
    category: "BIM",
    definition: "Modele 3D qui contient geometrie et informations.",
    example: "Les murs ont aussi des donnees de materiaux.",
    related: ["BIM", "IFC"]
  },
  {
    term: "IFC",
    category: "BIM",
    definition: "Format d'echange standard pour maquettes BIM.",
    example: "Exporter un modele Revit vers IFC.",
    related: ["BIM", "Maquette numerique"]
  },
  {
    term: "LOD",
    category: "BIM",
    definition: "Niveau de detail attendu dans la maquette.",
    example: "LOD 200 pour l'avant-projet.",
    related: ["BIM", "Phases SIA 102"]
  },
  {
    term: "CDE",
    category: "BIM",
    definition: "Environnement de donnees commun pour centraliser les fichiers.",
    example: "Dossier partage avec versions controlees.",
    related: ["BIM", "Revision"]
  },
  {
    term: "Revision",
    category: "Dossier",
    definition: "Version datee d'un plan ou d'un document.",
    example: "Rev. B avec modifications en rouge.",
    related: ["Cartouche", "CDE"]
  },
  {
    term: "Detail constructif",
    category: "Dessin",
    definition: "Detail qui montre la composition des couches et raccords.",
    example: "Mur, isolant, pare-vapeur, finition.",
    related: ["Detail", "SIA 181"]
  },
  {
    term: "Circulation",
    category: "Dessin",
    definition: "Chemins de deplacement dans le batiment.",
    example: "Couloirs, escaliers, rampes.",
    related: ["Accessibilite", "Issue"]
  },
  {
    term: "Accessibilite",
    category: "Normes",
    definition: "Conception qui permet l'usage par tous, y compris PMR.",
    example: "Rampe, ascenseur, seuils bas.",
    related: ["SIA 500", "Circulation"]
  },
  {
    term: "PMR",
    category: "Normes",
    definition: "Personnes a mobilite reduite.",
    example: "Personnes en fauteuil, avec poussette, ou marche difficile.",
    related: ["Accessibilite", "SIA 500"]
  },
  {
    term: "Compartimentage",
    category: "Normes",
    definition: "Decoupage du batiment pour limiter la propagation du feu.",
    example: "Murs et portes coupe-feu.",
    related: ["AEAI (PPI)", "Issue"]
  },
  {
    term: "Issue",
    category: "Normes",
    definition: "Chemin d'evacuation securise en cas d'incendie.",
    example: "Escalier protege.",
    related: ["AEAI (PPI)", "Compartimentage"]
  },
  {
    term: "Toitures plates",
    category: "Toitures plates",
    definition: "Systeme de toiture a faible pente integrant structure porteuse, isolation, etancheite et evacuation des eaux.",
    example: "En logement collectif, la toiture plate facilite l'integration technique et la maintenance.",
    related: ["Types de toitures plates", "Composition des toitures plates"]
  },
  {
    term: "Types de toitures plates",
    category: "Toitures plates",
    definition: "Differentes conceptions de toitures plates selon l'ordre des couches et le principe constructif.",
    example: "Le choix entre toiture chaude, compacte, duo ou froide depend du contexte du projet.",
    related: ["Toiture chaude", "Toiture compacte", "Toiture duo", "Toiture froide"]
  },
  {
    term: "Toiture chaude",
    category: "Toitures plates",
    definition: "Toiture plate non ventilee dont l'isolation est placee sous la membrane d'etancheite.",
    example: "Solution courante pour assurer une continuite thermique simple.",
    related: ["Pare-vapeur", "Isolation thermique et phonique (toitures plates)"]
  },
  {
    term: "Toiture compacte",
    category: "Toitures plates",
    definition: "Variante de toiture plate avec couches assemblees de facon dense sans lame d'air ventilee.",
    example: "Utilisee quand on recherche une composition simple et continue.",
    related: ["Toiture chaude", "Tableau synoptique des toitures plates"]
  },
  {
    term: "Toiture duo",
    category: "Toitures plates",
    definition: "Systeme combinant isolation sous et sur l'etancheite afin d'optimiser la performance thermique.",
    example: "Souvent choisie lors d'une amelioration energetique de toiture existante.",
    related: ["Toiture chaude", "Isolation thermique et phonique (toitures plates)"]
  },
  {
    term: "Toiture froide",
    category: "Toitures plates",
    definition: "Toiture plate avec lame d'air ventilee entre les couches pour gerer les transferts d'humidite.",
    example: "Solution specifique quand la conception impose une ventilation interne.",
    related: ["Pare-vapeur", "Exigences des toitures plates"]
  },
  {
    term: "Toiture nue",
    category: "Toitures plates",
    definition: "Toiture plate avec membrane apparente, sans protection lourde de surface.",
    example: "Approche frequente pour des surfaces non amenagees en terrasse accessible.",
    related: ["Entretien des toitures plates", "Travaux de ferblanterie (toitures plates)"]
  },
  {
    term: "Tableau synoptique des toitures plates",
    category: "Toitures plates",
    definition: "Outil de comparaison rapide des systemes de toitures plates et de leurs conditions d'emploi.",
    example: "Permet de choisir une variante en avant-projet sur des bases comparables.",
    related: ["Types de toitures plates", "Exigences des toitures plates"]
  },
  {
    term: "Composition des toitures plates",
    category: "Toitures plates",
    definition: "Organisation des couches fonctionnelles: structure, pare-vapeur, isolation, etancheite et protection.",
    example: "Le detail varie selon la destination et les contraintes techniques.",
    related: ["Structure porteuse (toitures plates)", "Pare-vapeur", "Pente des toitures plates"]
  },
  {
    term: "Structure porteuse (toitures plates)",
    category: "Toitures plates",
    definition: "Element support principal qui reprend les charges permanentes et climatiques de la toiture plate.",
    example: "Dalle beton ou support equivalent dimensionne selon les exigences du projet.",
    related: ["Composition des toitures plates", "Exigences des toitures plates"]
  },
  {
    term: "Pente des toitures plates",
    category: "Toitures plates",
    definition: "Inclinaison minimale necessaire pour assurer l'ecoulement des eaux de pluie vers les points de collecte.",
    example: "Une pente reguliere limite les stagnations d'eau.",
    related: ["Indications de construction (toitures plates)", "Entretien des toitures plates"]
  },
  {
    term: "Pare-vapeur",
    category: "Toitures plates",
    definition: "Couche limitant le passage de vapeur d'eau depuis l'interieur vers les zones froides de la toiture.",
    example: "Place sous l'isolation pour reduire les risques de condensation.",
    related: ["Toiture chaude", "Isolation thermique et phonique (toitures plates)"]
  },
  {
    term: "Isolation thermique et phonique (toitures plates)",
    category: "Toitures plates",
    definition: "Dispositif d'isolation garantissant performance energetique et confort acoustique en toiture plate.",
    example: "Le choix de l'isolant depend des objectifs thermiques et de la destination des locaux.",
    related: ["Toiture duo", "Exigences des toitures plates"]
  },
  {
    term: "Travaux de ferblanterie (toitures plates)",
    category: "Toitures plates",
    definition: "Elements metalliques de raccord et finition assurant etancheite et durabilite des points singuliers.",
    example: "Habillage d'acrotere et raccord de releve d'etancheite.",
    related: ["Terminologie des toitures plates", "Indications de construction (toitures plates)"]
  },
  {
    term: "Exigences des toitures plates",
    category: "Toitures plates",
    definition: "Contraintes techniques, normatives et d'usage a respecter pour concevoir une toiture plate fiable.",
    example: "Verification simultanee de l'etancheite, de la securite et de la maintenance.",
    related: ["Normes et recommandations", "Criteres techniques"]
  },
  {
    term: "Terminologie des toitures plates",
    category: "Toitures plates",
    definition: "Vocabulaire de base pour decrire correctement les composants et details des toitures plates.",
    example: "Permet d'aligner les echanges entre bureau, chantier et entreprises.",
    related: ["Glossaire des toitures plates", "Travaux de ferblanterie (toitures plates)"]
  },
  {
    term: "Indications de construction (toitures plates)",
    category: "Toitures plates",
    definition: "Recommandations de mise en oeuvre pour limiter les pathologies et garantir la qualite d'execution.",
    example: "Respect de la sequence de pose des couches et des raccords.",
    related: ["Pente des toitures plates", "Exigences des toitures plates"]
  },
  {
    term: "Entretien des toitures plates",
    category: "Toitures plates",
    definition: "Operations periodiques de controle, nettoyage et maintenance pour conserver la performance de la toiture.",
    example: "Inspection des evacuations, relevés et points singuliers.",
    related: ["Dispositifs antichutes", "Toiture nue"]
  },
  {
    term: "Dispositifs antichutes",
    category: "Toitures plates",
    definition: "Equipements de securite en toiture destines a prevenir les chutes de hauteur lors des interventions.",
    example: "Ligne de vie et points d'ancrage lors des operations d'entretien.",
    related: ["Entretien des toitures plates", "Exigences des toitures plates"]
  },
  {
    term: "Glossaire des toitures plates",
    category: "Toitures plates",
    definition: "Referentiel de definitions pour harmoniser la communication entre conception, execution et maintenance.",
    example: "Utilise pour clarifier les termes techniques dans les documents de projet.",
    related: ["Terminologie des toitures plates", "Publications techniques (toitures plates)"]
  },
  {
    term: "Publications techniques (toitures plates)",
    category: "Toitures plates",
    definition: "Documents de reference pour approfondir conception, execution et entretien des toitures plates.",
    example: "Consultes pour verifier un detail de principe avant execution.",
    related: ["Sites Internet techniques (toitures plates)", "Normes et recommandations"]
  },
  {
    term: "Sites Internet techniques (toitures plates)",
    category: "Toitures plates",
    definition: "Sources en ligne utiles pour suivre les bonnes pratiques et mises a jour techniques sur les toitures plates.",
    example: "Verification d'un detail de raccord sur une fiche technique actualisee.",
    related: ["Publications techniques (toitures plates)", "Exigences des toitures plates"]
  },
  {
    term: "Introduction aux materiaux de construction",
    category: "Bases des materiaux",
    definition: "Vue d'ensemble des familles de materiaux, de leurs usages et des criteres de choix dans un projet de construction.",
    example: "En phase d'avant-projet, on compare plusieurs familles de materiaux avant de fixer une solution.",
    related: ["Objectifs de l'etude des materiaux", "Classification des materiaux"]
  },
  {
    term: "Objectifs de l'etude des materiaux",
    category: "Bases des materiaux",
    definition: "Comprendre les proprietes, limites et conditions d'emploi des materiaux pour choisir des solutions fiables, durables et conformes.",
    example: "Selectionner un materiau en tenant compte des contraintes techniques, normatives et economiques.",
    related: ["Evaluation des materiaux de construction", "Normes et recommandations"]
  },
  {
    term: "Structure des materiaux",
    category: "Bases des materiaux",
    definition: "Organisation interne d'un materiau (composition et arrangement) qui influence ses performances mecaniques, thermiques et hygriques.",
    example: "Une structure poreuse modifie la resistance mecanique et le comportement a l'humidite.",
    related: ["Classification par composition", "Criteres techniques"]
  },
  {
    term: "Classification des materiaux",
    category: "Bases des materiaux",
    definition: "Methode de tri des materiaux selon leur origine, leur composition, leur comportement ou leur usage en construction.",
    example: "On classe les materiaux par famille minerale, metallique, organique ou synthetique.",
    related: ["Classification par composition", "Classification en pratique"]
  },
  {
    term: "Classification par composition",
    category: "Bases des materiaux",
    definition: "Classement fonde sur les constituants principaux d'un materiau afin d'anticiper ses proprietes et son domaine d'emploi.",
    example: "Distinguer un materiau a base minerale d'un materiau polymere pour choisir la bonne mise en oeuvre.",
    related: ["Classification des materiaux", "Definitions des materiaux"]
  },
  {
    term: "Classification en pratique",
    category: "Bases des materiaux",
    definition: "Application concrete des systemes de classification pour comparer des variantes et documenter un choix de projet.",
    example: "Comparer deux solutions de facade en utilisant une grille identique de criteres.",
    related: ["Evaluation des materiaux de construction", "Criteres architecturaux"]
  },
  {
    term: "Definitions des materiaux",
    category: "Bases des materiaux",
    definition: "Ensemble de notions de base (termes et vocabulaire) utilisees pour decrire correctement les materiaux et leurs proprietes.",
    example: "Clarifier la difference entre densite, resistance et durabilite avant de specifier un produit.",
    related: ["Introduction aux materiaux de construction", "Classification des materiaux"]
  },
  {
    term: "Evaluation des materiaux de construction",
    category: "Bases des materiaux",
    definition: "Analyse multicritere permettant de juger la pertinence d'un materiau pour un usage donne.",
    example: "Une solution est retenue apres analyse technique, environnementale et economique.",
    related: ["Criteres architecturaux", "Criteres techniques", "Ecologie", "Criteres economiques"]
  },
  {
    term: "Criteres architecturaux",
    category: "Bases des materiaux",
    definition: "Critiques de choix lies a l'expression architecturale, a l'integration visuelle et a la coherence du projet.",
    example: "Choix d'un parement en fonction de la texture, de la teinte et du contexte urbain.",
    related: ["Evaluation des materiaux de construction", "Criteres techniques"]
  },
  {
    term: "Criteres techniques",
    category: "Bases des materiaux",
    definition: "Exigences de performance (resistance, durabilite, feu, humidite, mise en oeuvre) pour garantir la conformite et la fiabilite.",
    example: "Verification de la resistance a l'usure d'un materiau de sol dans une zone a fort passage.",
    related: ["Evaluation des materiaux de construction", "Normes et recommandations"]
  },
  {
    term: "Sante et bien-etre",
    category: "Bases des materiaux",
    definition: "Impact des materiaux sur la qualite de l'air interieur, le confort et la securite des occupants.",
    example: "Preference pour des produits faibles en emissions dans des locaux occupes en continu.",
    related: ["Ecologie", "Criteres techniques"]
  },
  {
    term: "Ecologie",
    category: "Bases des materiaux",
    definition: "Evaluation environnementale des materiaux sur leur cycle de vie: extraction, fabrication, transport, usage et fin de vie.",
    example: "Comparer l'empreinte carbone de deux alternatives avant specification.",
    related: ["Criteres economiques", "Sante et bien-etre"]
  },
  {
    term: "Criteres economiques",
    category: "Bases des materiaux",
    definition: "Analyse des couts directs et indirects d'un materiau, y compris entretien, duree de vie et remplacement.",
    example: "Une solution plus chere a l'achat peut etre plus rentable sur la duree.",
    related: ["Evaluation des materiaux de construction", "Ecologie"]
  },
  {
    term: "Normes et recommandations",
    category: "Bases des materiaux",
    definition: "Documents de reference (dont normes SIA) qui cadrent les exigences techniques et la bonne pratique de mise en oeuvre.",
    example: "Verification d'une solution constructive selon les exigences normatives applicables.",
    related: ["Criteres techniques", "Bibliographie technique"]
  },
  {
    term: "Bibliographie technique",
    category: "Bases des materiaux",
    definition: "Ensemble des references documentaires utiles pour approfondir les proprietes et l'emploi des materiaux.",
    example: "Consultation de references metier avant validation d'un detail.",
    related: ["Publications et adresses", "Normes et recommandations"]
  },
  {
    term: "Publications et adresses",
    category: "Bases des materiaux",
    definition: "Repertoire de sources, organismes et contacts utiles pour obtenir des informations techniques fiables.",
    example: "Utiliser un organisme de reference pour confirmer un point de conformite.",
    related: ["Bibliographie technique", "Normes et recommandations"]
  }
];

// Ensure terms are available globally for app.js in all browsers.
if (typeof window !== "undefined") {
  window.TERMS = TERMS;
}
