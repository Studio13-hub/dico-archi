insert into public.categories (name, slug, description)
values
(
  'Normes SIA',
  'normes-sia',
  'References essentielles liees aux normes SIA utilisees dans la pratique de l architecture en Suisse.'
),
(
  'Normes AEAI',
  'normes-aeai',
  'Notions et exigences liees aux directives AEAI et a la securite incendie.'
),
(
  'Phases SIA',
  'phases-sia',
  'Vocabulaire des differentes phases du projet selon la logique SIA.'
),
(
  'Dessin technique',
  'dessin-technique',
  'Termes utiles pour comprendre les plans, coupes, elevations, details et conventions graphiques.'
),
(
  'Elements constructifs',
  'elements-constructifs',
  'Definitions des composants du batiment et de leur role dans la construction.'
),
(
  'Toitures',
  'toitures',
  'Vocabulaire des systemes de toiture, de leurs couches, de leur execution et de leur entretien.'
),
(
  'Facades',
  'facades',
  'Termes lies aux enveloppes verticales, parements, isolation et composition des facades.'
),
(
  'Chantier',
  'chantier',
  'Notions pratiques liees au suivi de chantier, aux entreprises, aux lots et a l execution.'
),
(
  'Materiaux',
  'materiaux',
  'Bases sur les materiaux de construction, leurs proprietes et leurs usages.'
),
(
  'Administration et permis',
  'administration-et-permis',
  'Vocabulaire administratif lie aux autorisations, dossiers et procedures de construction.'
),
(
  'Bureau d architecture',
  'bureau-d-architecture',
  'Termes du quotidien en bureau, organisation du travail, documents et coordination de projet.'
),
(
  'Securite incendie',
  'securite-incendie',
  'Definitions essentielles pour comprendre la prevention, la protection et les exigences incendie.'
)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description;