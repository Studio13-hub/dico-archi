-- 013_seed_core_terms_initial.sql
-- Premiere seed de termes core pour un environnement fonctionnel minimal.

begin;

insert into public.terms (term, slug, definition, example, category_id, status)
select
  v.term,
  v.slug,
  v.definition,
  v.example,
  c.id,
  'published'
from (
  values
    (
      'Etancheite',
      'etancheite',
      'Ensemble des dispositions et materiaux qui empechent la penetration de l eau dans une toiture ou un element constructif.',
      'L etancheite de la toiture doit rester continue au droit des relevés et des raccords.',
      'toitures'
    ),
    (
      'Pare-vapeur',
      'pare-vapeur',
      'Couche placee dans une paroi pour limiter le passage de vapeur d eau et reduire les risques de condensation.',
      'Le pare-vapeur est pose du cote chaud de la construction.',
      'toitures'
    ),
    (
      'Isolation thermique',
      'isolation-thermique',
      'Ensemble des materiaux ou systemes qui limitent les pertes de chaleur a travers l enveloppe du batiment.',
      'Une bonne isolation thermique ameliore le confort et diminue les besoins energetiques.',
      'elements-constructifs'
    ),
    (
      'Acrotere',
      'acrotere',
      'Petit mur en bord de toiture qui permet notamment de relever l etancheite et de finir le pourtour du toit.',
      'L acrotere protege le bord de la toiture et sert de support a certains details de finition.',
      'toitures'
    ),
    (
      'Coupe',
      'coupe',
      'Representation d un batiment tranche verticalement pour montrer l interieur, les niveaux et les elements constructifs.',
      'La coupe permet de comprendre la hauteur des espaces et la composition des planchers.',
      'dessin-technique'
    ),
    (
      'Facade',
      'facade',
      'Representation exterieure d un cote du batiment montrant son apparence, ses ouvertures et ses proportions.',
      'La facade renseigne sur l aspect architectural et les percements visibles.',
      'dessin-technique'
    ),
    (
      'Plan d etage',
      'plan-d-etage',
      'Dessin horizontal representant un niveau du batiment vu en projection.',
      'Le plan d etage montre les pieces, les cloisons, les cotes et les ouvertures.',
      'dessin-technique'
    ),
    (
      'Detail constructif',
      'detail-constructif',
      'Dessin a grande echelle montrant precisement l assemblage des elements de construction.',
      'Un detail constructif explique comment la facade rejoint la dalle ou la toiture.',
      'dessin-technique'
    ),
    (
      'Echelle',
      'echelle',
      'Rapport entre les dimensions dessinees et les dimensions reelles d un objet ou d un batiment.',
      'Une echelle 1:100 signifie qu un centimetre sur le plan correspond a un metre en realite.',
      'dessin-technique'
    ),
    (
      'Cotation',
      'cotation',
      'Indication graphique des dimensions et mesures sur un dessin technique.',
      'La cotation permet de lire la largeur d une piece ou l epaisseur d un mur.',
      'dessin-technique'
    ),
    (
      'Mur porteur',
      'mur-porteur',
      'Mur qui reprend des charges et les transmet a la structure porteuse ou aux fondations.',
      'Le mur porteur ne peut pas etre modifie sans verification structurelle.',
      'elements-constructifs'
    ),
    (
      'Dalle',
      'dalle',
      'Element horizontal porteur formant un plancher ou une toiture selon sa position dans l ouvrage.',
      'La dalle relie les espaces et transmet les charges aux murs ou aux poteaux.',
      'elements-constructifs'
    ),
    (
      'Poteau',
      'poteau',
      'Element vertical porteur qui reprend des charges ponctuelles et les transmet aux niveaux inferieurs.',
      'Le poteau travaille avec les poutres pour former une structure stable.',
      'elements-constructifs'
    ),
    (
      'Linteau',
      'linteau',
      'Element horizontal place au-dessus d une ouverture pour reprendre les charges du mur situe au-dessus.',
      'Le linteau permet de creer une baie sans affaiblir la stabilite du mur.',
      'elements-constructifs'
    ),
    (
      'Fondation',
      'fondation',
      'Partie de l ouvrage qui transmet les charges du batiment au terrain.',
      'Les fondations doivent etre adaptees a la nature du sol et aux charges du projet.',
      'elements-constructifs'
    ),
    (
      'Avant-projet',
      'avant-projet',
      'Phase de conception initiale ou l on developpe les intentions architecturales et les premieres options du projet.',
      'L avant-projet permet de tester le volume, l implantation et les grandes orientations.',
      'phases-sia'
    ),
    (
      'Projet',
      'projet',
      'Phase ou la solution retenue est developpee avec plus de precision avant l autorisation et l execution.',
      'Le projet precise les plans, les dimensions et les choix techniques principaux.',
      'phases-sia'
    ),
    (
      'Execution',
      'execution',
      'Phase de production des documents et decisions necessaires pour construire l ouvrage.',
      'La phase execution comprend les plans d execution et la coordination technique.',
      'phases-sia'
    ),
    (
      'Soumission',
      'soumission',
      'Phase ou les documents sont prepares pour consulter les entreprises et comparer les offres.',
      'La soumission permet de demander des prix sur une base commune et comparable.',
      'phases-sia'
    ),
    (
      'Reception des travaux',
      'reception-des-travaux',
      'Etape de fin de chantier durant laquelle l ouvrage est controle et remis avec reserves eventuelles.',
      'La reception des travaux marque une etape importante dans la cloture du chantier.',
      'phases-sia'
    )
) as v(term, slug, definition, example, category_slug)
join public.categories c
  on c.slug = v.category_slug
on conflict (slug) do nothing;

commit;
