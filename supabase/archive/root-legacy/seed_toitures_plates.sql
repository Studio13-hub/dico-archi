-- Seed / upsert de la categorie "Toitures plates"
-- Utilise la cle unique sur public.terms(term)

insert into public.terms (term, category, definition, example, related, image_url)
values
  (
    'Toitures plates',
    'Toitures plates',
    'Systeme de toiture a faible pente integrant structure porteuse, isolation, etancheite et evacuation des eaux.',
    'En logement collectif, la toiture plate facilite l''integration technique et la maintenance.',
    array['Types de toitures plates','Composition des toitures plates'],
    null
  ),
  (
    'Types de toitures plates',
    'Toitures plates',
    'Differentes conceptions de toitures plates selon l''ordre des couches et le principe constructif.',
    'Le choix entre toiture chaude, compacte, duo ou froide depend du contexte du projet.',
    array['Toiture chaude','Toiture compacte','Toiture duo','Toiture froide'],
    null
  ),
  (
    'Toiture chaude',
    'Toitures plates',
    'Toiture plate non ventilee dont l''isolation est placee sous la membrane d''etancheite.',
    'Solution courante pour assurer une continuite thermique simple.',
    array['Pare-vapeur','Isolation thermique et phonique (toitures plates)'],
    null
  ),
  (
    'Toiture compacte',
    'Toitures plates',
    'Variante de toiture plate avec couches assemblees de facon dense sans lame d''air ventilee.',
    'Utilisee quand on recherche une composition simple et continue.',
    array['Toiture chaude','Tableau synoptique des toitures plates'],
    null
  ),
  (
    'Toiture duo',
    'Toitures plates',
    'Systeme combinant isolation sous et sur l''etancheite afin d''optimiser la performance thermique.',
    'Souvent choisie lors d''une amelioration energetique de toiture existante.',
    array['Toiture chaude','Isolation thermique et phonique (toitures plates)'],
    null
  ),
  (
    'Toiture froide',
    'Toitures plates',
    'Toiture plate avec lame d''air ventilee entre les couches pour gerer les transferts d''humidite.',
    'Solution specifique quand la conception impose une ventilation interne.',
    array['Pare-vapeur','Exigences des toitures plates'],
    null
  ),
  (
    'Toiture nue',
    'Toitures plates',
    'Toiture plate avec membrane apparente, sans protection lourde de surface.',
    'Approche frequente pour des surfaces non amenagees en terrasse accessible.',
    array['Entretien des toitures plates','Travaux de ferblanterie (toitures plates)'],
    null
  ),
  (
    'Tableau synoptique des toitures plates',
    'Toitures plates',
    'Outil de comparaison rapide des systemes de toitures plates et de leurs conditions d''emploi.',
    'Permet de choisir une variante en avant-projet sur des bases comparables.',
    array['Types de toitures plates','Exigences des toitures plates'],
    null
  ),
  (
    'Composition des toitures plates',
    'Toitures plates',
    'Organisation des couches fonctionnelles: structure, pare-vapeur, isolation, etancheite et protection.',
    'Le detail varie selon la destination et les contraintes techniques.',
    array['Structure porteuse (toitures plates)','Pare-vapeur','Pente des toitures plates'],
    null
  ),
  (
    'Structure porteuse (toitures plates)',
    'Toitures plates',
    'Element support principal qui reprend les charges permanentes et climatiques de la toiture plate.',
    'Dalle beton ou support equivalent dimensionne selon les exigences du projet.',
    array['Composition des toitures plates','Exigences des toitures plates'],
    null
  ),
  (
    'Pente des toitures plates',
    'Toitures plates',
    'Inclinaison minimale necessaire pour assurer l''ecoulement des eaux de pluie vers les points de collecte.',
    'Une pente reguliere limite les stagnations d''eau.',
    array['Indications de construction (toitures plates)','Entretien des toitures plates'],
    null
  ),
  (
    'Pare-vapeur',
    'Toitures plates',
    'Couche limitant le passage de vapeur d''eau depuis l''interieur vers les zones froides de la toiture.',
    'Place sous l''isolation pour reduire les risques de condensation.',
    array['Toiture chaude','Isolation thermique et phonique (toitures plates)'],
    null
  ),
  (
    'Isolation thermique et phonique (toitures plates)',
    'Toitures plates',
    'Dispositif d''isolation garantissant performance energetique et confort acoustique en toiture plate.',
    'Le choix de l''isolant depend des objectifs thermiques et de la destination des locaux.',
    array['Toiture duo','Exigences des toitures plates'],
    null
  ),
  (
    'Travaux de ferblanterie (toitures plates)',
    'Toitures plates',
    'Elements metalliques de raccord et finition assurant etancheite et durabilite des points singuliers.',
    'Habillage d''acrotere et raccord de releve d''etancheite.',
    array['Terminologie des toitures plates','Indications de construction (toitures plates)'],
    null
  ),
  (
    'Exigences des toitures plates',
    'Toitures plates',
    'Contraintes techniques, normatives et d''usage a respecter pour concevoir une toiture plate fiable.',
    'Verification simultanee de l''etancheite, de la securite et de la maintenance.',
    array['Normes et recommandations','Criteres techniques'],
    null
  ),
  (
    'Terminologie des toitures plates',
    'Toitures plates',
    'Vocabulaire de base pour decrire correctement les composants et details des toitures plates.',
    'Permet d''aligner les echanges entre bureau, chantier et entreprises.',
    array['Glossaire des toitures plates','Travaux de ferblanterie (toitures plates)'],
    null
  ),
  (
    'Indications de construction (toitures plates)',
    'Toitures plates',
    'Recommandations de mise en oeuvre pour limiter les pathologies et garantir la qualite d''execution.',
    'Respect de la sequence de pose des couches et des raccords.',
    array['Pente des toitures plates','Exigences des toitures plates'],
    null
  ),
  (
    'Entretien des toitures plates',
    'Toitures plates',
    'Operations periodiques de controle, nettoyage et maintenance pour conserver la performance de la toiture.',
    'Inspection des evacuations, releves et points singuliers.',
    array['Dispositifs antichutes','Toiture nue'],
    null
  ),
  (
    'Dispositifs antichutes',
    'Toitures plates',
    'Equipements de securite en toiture destines a prevenir les chutes de hauteur lors des interventions.',
    'Ligne de vie et points d''ancrage lors des operations d''entretien.',
    array['Entretien des toitures plates','Exigences des toitures plates'],
    null
  ),
  (
    'Glossaire des toitures plates',
    'Toitures plates',
    'Referentiel de definitions pour harmoniser la communication entre conception, execution et maintenance.',
    'Utilise pour clarifier les termes techniques dans les documents de projet.',
    array['Terminologie des toitures plates','Publications techniques (toitures plates)'],
    null
  ),
  (
    'Publications techniques (toitures plates)',
    'Toitures plates',
    'Documents de reference pour approfondir conception, execution et entretien des toitures plates.',
    'Consultes pour verifier un detail de principe avant execution.',
    array['Sites Internet techniques (toitures plates)','Normes et recommandations'],
    null
  ),
  (
    'Sites Internet techniques (toitures plates)',
    'Toitures plates',
    'Sources en ligne utiles pour suivre les bonnes pratiques et mises a jour techniques sur les toitures plates.',
    'Verification d''un detail de raccord sur une fiche technique actualisee.',
    array['Publications techniques (toitures plates)','Exigences des toitures plates'],
    null
  )
on conflict (term) do update
set
  category = excluded.category,
  definition = excluded.definition,
  example = excluded.example,
  related = excluded.related,
  image_url = excluded.image_url;
