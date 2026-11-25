# DESIGN — SolaWeb (version « mix », 25.11.2026)

Source : `css/solaweb.css` et `js/solaweb.js`, chargés en dernier sur toutes les pages (l'accueil n'utilise que ces deux fichiers).
Mélange voulu par Ayoub : l'ADN de la version marine (accueil sur vidéo, ouverture calme avec le logo, boutons fins, sections en deux colonnes à filets) et les contenus de la version « livrée » (démo par métier, maquette qui se construit, services avec prix). Les versions précédentes : `css/vivant.css`, `css/livree.css` (non chargées).

## Couleurs
| Rôle | Valeur |
|---|---|
| Papier (fond) | `#F7F6F2` |
| Pierre (sections alternées) | `#ECE8E0` |
| Nuit (en-tête, boutons) | `#1F2D4D` |
| Nuit foncée (sections sombres, pied de page) | `#172238` |
| Encre (texte fort) | `#16213A` ; texte courant `#3A4560` |
| Soleil (seul accent : logo, menu actif, puces, liens) | `#E07B39` |
| Clair sur nuit (boutons sur fond sombre) | `#F3EEE4` |

## Typographie
Titres : Montserrat 600–700, -0.02em. Texte : Instrument Sans 400–600, 1.0625rem / 1.6. Polices hébergées.

## Règles anti « fait par IA » (relecture du 25.11.2026)
Pas de sur-titres en capitales, pas de mot coloré dans un titre, pas de flèches sur les boutons, pas de fondu identique sur chaque section, pas de cartes qui se soulèvent, pas de fausse fenêtre à trois points, pas de point lumineux qui pulse, pas de slogans en paire, pas de promesse répétée partout. Un seul modèle de bouton (rayon 8 px). Textes : verbes simples, pas de triades systématiques.

## Mouvement (fil conducteur : une journée de soleil)
- Ouverture (toutes les pages, à chaque chargement) : une ligne d'horizon traverse l'écran, un grand soleil se lève, le nom apparaît, puis l'écran s'ouvre en deux le long de l'horizon (environ 2,5 s). Derrière : le titre de l'accueil monte ligne par ligne, la vidéo se pose, le téléphone arrive et son écran s'allume ; sur les autres pages, le titre du bandeau monte.
- Logos : au survol, le soleil se lève et le reflet s'allonge ; dans l'en-tête, le soleil descend à mesure qu'on fait défiler ; dans le pied de page, il se couche.
- Boutons : au survol, un demi-soleil (marine clair ou pêche selon le fond) se lève derrière le texte et l'horizon orange se trace ; au clic, le bouton s'enfonce. Le bouton principal de l'accueil se signale une fois après l'ouverture.
- Puces de métier : un voile se lève au survol, le soleil remplit la puce choisie. Liens : le trait orange se trace. Menu : l'horizon se trace sous le lien.
- 3D : animée au survol seulement. « Animations réduites » : plus de déplacement, seulement les changements d'état.

## Accueil immersif (scènes au défilement)
Fichiers : `css/scenes.css` + `js/scenes.js` (accueil seulement). Chaque section `[data-scene]` est plus haute que l'écran (`--h`), son contenu reste épinglé et avance avec la molette (progression lissée `--p`).
1. **Chantier** (`--h: 420vh`) : le plan du site d'exemple se dessine, vos remarques apparaissent, une lumière balaie l'écran et allume la vraie capture, l'adresse se tape, le téléphone sort. Les 5 étapes défilent à gauche.
2. **Services** (`--h: 300vh`, section claire) : à gauche les trois services (cliquables), à droite une démonstration qui change : site sur ordinateur et téléphone, conversation d'exemple avec l'assistant, déroulé d'une automatisation. Le défilement ou le clic change le service actif. Sur téléphone : non épinglé, au clic.
3. **Promesse** (`--h: 240vh`) : la phrase s'allume mot à mot sur une aube orange, puis les trois engagements apparaissent.
4. **Exemples** : légère profondeur.
5. **Fin de page claire** : « Parlons de votre projet » + choix du besoin (puces) qui envoie au formulaire pré-rempli. Haut de page : le téléphone et la vidéo suivent la souris. Animations réduites : scènes posées, rien d'épinglé. La FAQ est sur la page Services.

## Version aérée (25.11.2026, soir)
- En-tête clair (papier translucide, filet fin) avec **l'ancien logo** (nom à empattements, lettres marine par masque, trait orange qui se dessine à l'arrivée et au survol). L'ouverture garde le soleil.
- Pages intérieures : en-têtes clairs et aérés, titre avec un court trait orange ; bandeau d'appel en pierre claire.
- Téléphone de l'accueil : trois mini-sites HTML (peintre, beauté, restaurant, photos dans `assets/mini/`) qui défilent seuls, pause au survol.

## Thème « nuit et aube » (25.11.2026, fin de soirée) — remplace les couleurs ci-dessus
Demandé par Ayoub d'après la scène « promesse » : `css/nuit.css`, chargé en dernier sur toutes les pages.
| Rôle | Valeur |
|---|---|
| Fond principal | `#1A2337` (bleu nuit) |
| Surfaces levées | `#20293F` ; cartes `rgba(255,255,255,.045)` |
| Pied de page | `#141B2B` |
| Titres | blanc, Montserrat 600, -0.02em |
| Texte courant / discret | crème à 80 % / 58 % (`rgba(243,238,228,…)`) |
| Accent (boutons, liens, traits) | pêche `#F0A36B` ; orange du soleil `#E07B39` |
| Lueur d'aube | dégradé radial orangé en bas des en-têtes de pages et de la fin de page |
Boutons : pêche avec texte nuit ; contour crème. Logo : lettres crème.

## Couche « moderne et tech » (25.11.2026, nuit) — REMPLACE le thème « nuit et aube »
Ayoub a trouvé le thème sombre trop compact : retour au clair et aéré. `css/nuit.css` n'est plus chargé ; `css/moderne.css` est chargé en dernier sur toutes les pages.
- Fond `#F5F6F8` avec une fine trame de points (fondue sur les bords) et des halos doux pêche et bleu.
- Navigation flottante en pilule, translucide (flou d'arrière-plan), détachée du haut.
- Accueil vidéo, scènes « chantier » et « promesse », pied de page : panneaux arrondis (28 px) avec marge autour.
- Titres plus grands (jusqu'à 4,6 rem), interlettrage -0,035em ; sections beaucoup plus espacées.
- Cartes translucides (blanc 72 %), bord fin, ombre douce, halo pêche qui suit la souris.
- Boutons et puces en pilule. Démos avec barre de titre en police à chasse fixe (« aperçu — … »).
- Mise à jour (25.11.2026, tard) : plus d'espaces blancs. Les panneaux (accueil, chantier, promesse, pied de page) reprennent toute la largeur, sans arrondi. La navigation pilule est fixe et flotte par-dessus la page. Logo : retour au **nouveau logo « Soleil levant »** dans la navigation et le pied de page (l'ouverture garde aussi le soleil). Services de l'accueil : plus de défilement épinglé, choix au survol ou au clic.

## Tout le site dans la direction de l'accueil (25.11.2026, tard)
- **Fond en motion design** : vidéo Blender en boucle de 4 s (champ de points marine qui ondule, soleil d'aube pêche au loin), `assets/video/motion/champ-points.mp4` (790 Ko) et `-mobile.mp4` (400 Ko), source dans `_sources/blender/icones-3d.blend` (collection `fond_motion`). Injectée en fond fixe par `js/solaweb.js` (`.fond-motion`), discrète (opacité 30 % sous un voile clair), visible seulement dans les zones claires ; pause quand l'onglet est caché, figée en « animations réduites ».
- **Pages intérieures** (`css/pages.css`, chargé après `moderne.css`) : en-tête sombre pleine largeur sur la vidéo floutée comme l'accueil, grands titres blancs, sections claires et aérées, cartes translucides (services, FAQ, formulaire, textes légaux), bandeau d'appel sombre avec lueur d'aube.
- Mise à jour (25.11.2026, fin) : téléphone et puces de métier retirés de l'accueil ; la vidéo d'accueil est nette (plus de flou), voile foncé seulement derrière le texte. Champ de points en fond **uniquement sur la page Services** (`<body data-fond="motion">`) ; autres pages : trois grands halos très doux (pêche, bleu) qui dérivent lentement (`.fond-doux`). Icônes 3D refaites (matières brillantes, pêche/marine, boucle de 3 s plus vivante : écran qui se remplit en pivotant, bulle qui rebondit, engrenages qui tournent en se balançant), animées en continu, image fixe en « animations réduites ».

## Page Réalisations (25.11.2026, fin) et formes 3D décoratives
- **Studio** (`js/studio.js`) : le vrai site de démonstration chargé en direct dans un cadre (iframe), mis à l'échelle d'un écran de 1366 px ; onglets pour changer de projet, bascule Ordinateur / Téléphone (le cadre se transforme, le site passe à 390 px), lien « Nouvel onglet ». Petits écrans : vue téléphone par défaut.
- **Fiches projet** : visuel ordinateur + téléphone en alternance gauche/droite, métier, texte, pages du site en pastilles (relevées dans chaque démo), boutons « Essayer dans le studio » et « Ouvrir le site ».
- Anciens `js/portable.js`, `js/palettes.js` et `js/vitrines.js` : plus chargés.
- **Formes 3D décoratives** (Blender, collection `deco`) : demi-soleil pêche, anneau marine, trois sphères, animées en boucle (`assets/3d/deco-*.webp`, images fixes `-fixe`), posées dans les grandes zones claires (accueil : exemples et fin ; Réalisations : studio et fiches), flottement lent, fixes en « animations réduites ».
