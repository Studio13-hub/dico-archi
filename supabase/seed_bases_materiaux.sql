-- Seed / upsert de la categorie "Bases des materiaux"
-- Utilise la cle unique sur public.terms(term)

insert into public.terms (term, category, definition, example, related, image_url)
values
  (
    'Introduction aux materiaux de construction',
    'Bases des materiaux',
    'Vue d''ensemble des familles de materiaux, de leurs usages et des criteres de choix dans un projet de construction.',
    'En phase d''avant-projet, on compare plusieurs familles de materiaux avant de fixer une solution.',
    array['Objectifs de l''etude des materiaux','Classification des materiaux'],
    null
  ),
  (
    'Objectifs de l''etude des materiaux',
    'Bases des materiaux',
    'Comprendre les proprietes, limites et conditions d''emploi des materiaux pour choisir des solutions fiables, durables et conformes.',
    'Selectionner un materiau en tenant compte des contraintes techniques, normatives et economiques.',
    array['Evaluation des materiaux de construction','Normes et recommandations'],
    null
  ),
  (
    'Structure des materiaux',
    'Bases des materiaux',
    'Organisation interne d''un materiau (composition et arrangement) qui influence ses performances mecaniques, thermiques et hygriques.',
    'Une structure poreuse modifie la resistance mecanique et le comportement a l''humidite.',
    array['Classification par composition','Criteres techniques'],
    null
  ),
  (
    'Classification des materiaux',
    'Bases des materiaux',
    'Methode de tri des materiaux selon leur origine, leur composition, leur comportement ou leur usage en construction.',
    'On classe les materiaux par famille minerale, metallique, organique ou synthetique.',
    array['Classification par composition','Classification en pratique'],
    null
  ),
  (
    'Classification par composition',
    'Bases des materiaux',
    'Classement fonde sur les constituants principaux d''un materiau afin d''anticiper ses proprietes et son domaine d''emploi.',
    'Distinguer un materiau a base minerale d''un materiau polymere pour choisir la bonne mise en oeuvre.',
    array['Classification des materiaux','Definitions des materiaux'],
    null
  ),
  (
    'Classification en pratique',
    'Bases des materiaux',
    'Application concrete des systemes de classification pour comparer des variantes et documenter un choix de projet.',
    'Comparer deux solutions de facade en utilisant une grille identique de criteres.',
    array['Evaluation des materiaux de construction','Criteres architecturaux'],
    null
  ),
  (
    'Definitions des materiaux',
    'Bases des materiaux',
    'Ensemble de notions de base (termes et vocabulaire) utilisees pour decrire correctement les materiaux et leurs proprietes.',
    'Clarifier la difference entre densite, resistance et durabilite avant de specifier un produit.',
    array['Introduction aux materiaux de construction','Classification des materiaux'],
    null
  ),
  (
    'Evaluation des materiaux de construction',
    'Bases des materiaux',
    'Analyse multicritere permettant de juger la pertinence d''un materiau pour un usage donne.',
    'Une solution est retenue apres analyse technique, environnementale et economique.',
    array['Criteres architecturaux','Criteres techniques','Ecologie','Criteres economiques'],
    null
  ),
  (
    'Criteres architecturaux',
    'Bases des materiaux',
    'Critiques de choix lies a l''expression architecturale, a l''integration visuelle et a la coherence du projet.',
    'Choix d''un parement en fonction de la texture, de la teinte et du contexte urbain.',
    array['Evaluation des materiaux de construction','Criteres techniques'],
    null
  ),
  (
    'Criteres techniques',
    'Bases des materiaux',
    'Exigences de performance (resistance, durabilite, feu, humidite, mise en oeuvre) pour garantir la conformite et la fiabilite.',
    'Verification de la resistance a l''usure d''un materiau de sol dans une zone a fort passage.',
    array['Evaluation des materiaux de construction','Normes et recommandations'],
    null
  ),
  (
    'Sante et bien-etre',
    'Bases des materiaux',
    'Impact des materiaux sur la qualite de l''air interieur, le confort et la securite des occupants.',
    'Preference pour des produits faibles en emissions dans des locaux occupes en continu.',
    array['Ecologie','Criteres techniques'],
    null
  ),
  (
    'Ecologie',
    'Bases des materiaux',
    'Evaluation environnementale des materiaux sur leur cycle de vie: extraction, fabrication, transport, usage et fin de vie.',
    'Comparer l''empreinte carbone de deux alternatives avant specification.',
    array['Criteres economiques','Sante et bien-etre'],
    null
  ),
  (
    'Criteres economiques',
    'Bases des materiaux',
    'Analyse des couts directs et indirects d''un materiau, y compris entretien, duree de vie et remplacement.',
    'Une solution plus chere a l''achat peut etre plus rentable sur la duree.',
    array['Evaluation des materiaux de construction','Ecologie'],
    null
  ),
  (
    'Normes et recommandations',
    'Bases des materiaux',
    'Documents de reference (dont normes SIA) qui cadrent les exigences techniques et la bonne pratique de mise en oeuvre.',
    'Verification d''une solution constructive selon les exigences normatives applicables.',
    array['Criteres techniques','Bibliographie technique'],
    null
  ),
  (
    'Bibliographie technique',
    'Bases des materiaux',
    'Ensemble des references documentaires utiles pour approfondir les proprietes et l''emploi des materiaux.',
    'Consultation de references metier avant validation d''un detail.',
    array['Publications et adresses','Normes et recommandations'],
    null
  ),
  (
    'Publications et adresses',
    'Bases des materiaux',
    'Repertoire de sources, organismes et contacts utiles pour obtenir des informations techniques fiables.',
    'Utiliser un organisme de reference pour confirmer un point de conformite.',
    array['Bibliographie technique','Normes et recommandations'],
    null
  )
on conflict (term) do update
set
  category = excluded.category,
  definition = excluded.definition,
  example = excluded.example,
  related = excluded.related,
  image_url = excluded.image_url;
