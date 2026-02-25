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
  }
];
