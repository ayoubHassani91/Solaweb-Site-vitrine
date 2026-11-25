# CLAUDE.md : site vitrine SolaWeb

## État au 25.11.2026 (version de Saïd, seule version gardée)
- **Pas de dossier `_sources/pages/`** dans cette version : on modifie directement les fichiers `.html`. La règle « pages assemblées » plus bas ne s'applique pas tant que ce dossier n'est pas recréé.
- **Version actuelle (25.11.2026, fin de journée) : « mix »** : `css/solaweb.css` + `js/solaweb.js` (voir `DESIGN.md`). La livrée ci-dessous a été abandonnée.
- (abandonné) **Refonte du 25.11.2026 : univers « Livrée d'artisan »** (voir `DESIGN.md` et `PRODUCT.md`). Style actuel : `css/livree.css` + `js/livree.js`, chargés en dernier sur toutes les pages. L'accueil (`index.html`) n'utilise QUE `livree.css` ; les autres pages gardent les anciennes feuilles en dessous, recolorées par `livree.css`. Les règles « marine et crème, pas d'orange » plus bas sont abandonnées.
- (ancien) `css/vivant.css` et `js/vivant.js` ne sont plus chargés ; ils étaient chargés **en dernier** sur les 7 pages : écran de chargement avec le logo, accueil (vidéo + titre), motion design des boutons, objets 3D, engagements, FAQ, lisibilité. C'est là qu'on ajuste en priorité.
- **Logo (choisi le 25.11.2026) : piste A « Soleil levant »** : demi-soleil orange doux (#D98A55) sur une ligne d'horizon + reflet, nom « SolaWeb » en Instrument Sans 500. Dessiné en SVG dans chaque page (classe `sw-logo`), propositions dans `_sources/propositions-logo.html`. L'ancien logo à empattements (`assets/logo-solaweb-v2-*`) n'est plus utilisé.
- Style v2 « plus calme » (demande d'Ayoub) : pas de sur-titres, boutons fins (rayon 10 px, un seul mouvement de flèche), pas d'effets d'onde/aimant/halo, engagements et FAQ en deux colonnes à filets, étapes en frise.
- Objets 3D animés (écran, bulle, engrenages) : faits dans Blender, fichier `_sources/blender/icones-3d.blend`, rendus dans `assets/3d/` : image fixe `*.webp`, l'animation `*-anim.webp` ne joue qu'au survol de la carte.
- Vidéos d'accueil allégées : `assets/video/accueil/*-leger.mp4`.
- Prix affiché : « à partir de 490 € » pour le site vitrine (repris du flyer). HT ou TTC à confirmer.
- Bandeau cookies gardé : il deviendra un vrai bandeau de consentement quand le site sera sur son vrai nom de domaine (si on ajoute statistiques ou services tiers).
- Manquent encore : téléphone, e-mail, numéro WhatsApp (bouton retiré de la page Contact en attendant), vrai envoi du formulaire, photo et présentation de la personne derrière SolaWeb, mentions légales.

Lis ce fichier et `README.md` au début de chaque session sur ce projet.

## Qui travaille ici
La propriétaire du site, **débutante** (aucune connaissance en code), en français.
- Réponses **courtes et simples**, sans jargon. Une question à la fois si besoin.
- Si elle pose une question : **répondre d'abord**, ne rien modifier sans consigne claire.
- Petites modifications (un texte, un prix, une couleur) : les faire directement.
- Grandes modifications (nouvelle section, nouvelle page, style global, suppression) : résumer en quelques lignes et **attendre son « go »**.
- Lui dire sans qu'elle le demande ce qui manque, les défauts, et la marche à suivre.
- Ne **jamais publier** (commit + push) sans son accord explicite. Ne jamais supprimer définitivement un fichier sans confirmer.
- À la fin de chaque modification : lui dire quelle page regarder et lancer l'aperçu local si besoin.

## Le site
- Site statique : HTML, CSS, JavaScript. Aucun outil de construction, aucun cookie, aucun service tiers, polices hébergées dans le site.
- En ligne avec **GitHub Pages** : https://ayoubhassani91.github.io/Solaweb-Site-vitrine/ (dépôt `ayoubHassani91/Solaweb-Site-vitrine`, branche `main`). Chaque `git push` sur `main` met le site à jour en 1 à 2 minutes.
- Styles : `css/site.css` (base), `css/theme.css` (ancien thème blanc et violet), `css/accueil-photo.css` (accueil en photo), puis `css/marine.css` chargé en dernier (c'est lui qui décide du style actuel : c'est là qu'on ajuste). Les liens CSS sont dans `_sources/pages/haut.html`. Scripts : `js/animations.js`, `js/main.js`, `js/portable.js`.
- Style actuel (version du 12 au 16.11.2026, retours de la propriétaire) : **bleu marine (#1F2D4D) et crème (#FBF7F1)**, accents sable/doré (#C9B995). **Plus de violet, plus de noir, plus d'orange**, y compris dans le logo (soleil sable). Ne pas remettre de violet ni d'orange. Ne pas changer le style sans qu'elle le demande. Les anciennes règles (violet #5B2BC4, orange en accent) sont abandonnées.
- Accueil : diaporama de photos en fondu, 7 secondes par photo (fenêtre ouverte sur un jardin, puis bureau), textes centrés sur un voile crème léger. Réglages dans `css/accueil-photo.css` (classe `photo-6c` sur `<body>`), photos dans `assets/photos/`. L'ancienne vidéo de fond reste dans `assets/video/` (source : `_sources/video/animation.html`, régénérée avec `bash _sources/video/encoder.sh <dossier-temporaire> assets/video`, Node, Chrome et ffmpeg nécessaires) si on veut la remettre.
- Fichiers `proposition-*.html` (A, B, accueil, noir, marine) : essais de design, **non utilisés par le site**. Ne pas les supprimer sans confirmer.
- Slogan actuel : « Votre vitrine, on l'illumine ».
- Les dossiers `beauty-palace/`, `atelier-vermail/`, `eclat-peinture-93/`, `maison-tessaron-v2g/` sont des sites de démonstration (données fictives).

## RÈGLE IMPORTANTE : les pages sont assemblées
Les 8 pages (`index.html`, `services.html`, `realisations.html`, `tarifs.html`, `contact.html`, `mentions-legales.html`, `confidentialite.html`, `conditions.html`) sont **générées** à partir de `_sources/pages/` :
- `haut.html` : en-tête et menu (communs à toutes les pages) ; `bas.html` : pied de page.
- `corps-<page>.html` : contenu de chaque page ; `bloc-*.html` : blocs réutilisés ; `legal-*.html` : textes légaux.

Pour toute modification de contenu : **modifier le fichier dans `_sources/pages/`, puis régénérer** depuis la racine du site :
```bash
bash _sources/pages/monter.sh .
```
Ne jamais modifier seulement la page générée : la prochaine régénération écraserait le changement. Si une page générée a été modifiée à la main, reporter d'abord la modification dans `_sources/pages/`.

## Aperçu local
```bash
python -m http.server 8765 --bind 127.0.0.1
```
puis ouvrir http://127.0.0.1:8765/

## Publier (seulement avec son accord)
1. `git pull` avant de commencer à travailler.
2. Après les modifications : `git add -A`, commit avec un message clair en français, `git push`.
3. Attendre 1 à 2 minutes et vérifier la page en ligne.

## Avant la vraie mise en ligne (À LUI RAPPELER, sans qu'elle le demande)
Demande de Souad du 17.11.2026 : quand elle dit que le site est **finalisé** (ou dès qu'elle parle de publier), lui dérouler TOUTE cette liste, point par point, avec ce qui est fait et ce qui reste. Je ne suis pas juriste : pour le légal, lui conseiller de vérifier avec Ayoub ou service-public.fr.

**Légal**
- Mentions légales, confidentialité, conditions : compléter les passages « à compléter » (statut, SIRET, adresse, e-mail, téléphone, hébergeur, HT/TTC, médiateur). Aucune donnée inventée. Attention : elle crée sa micro-entreprise seulement au premier client confirmé, donc l'identité de l'éditeur n'existe pas encore : décider avec elle comment publier avant (et ce que dit la loi pour un site professionnel).
- Cookies et RGPD : le site n'a aucun cookie ni service tiers (polices hébergées dans le site). Le garder ainsi. Si on ajoute statistiques, carte, vidéo externe ou Google Fonts en ligne : bandeau de consentement obligatoire. Les polices des essais viennent de Google Fonts : les héberger avant publication.
- Formulaire de contact : l'envoi est encore SIMULÉ. Brancher un vrai envoi, indiquer l'usage des données, vérifier qu'une personne reçoit bien les messages.

**Photos et visuels**
- « La photo originale » (demande à elle, à préciser avec elle) : remplacer les photos d'essai par les fichiers d'origine en haute qualité, et vérifier la source et la licence de chaque image (Unsplash : usage commercial libre ; pas de visage reconnaissable, de marque, d'affiche). Photos retouchées : l'étiquette Lenovo de la photo PC 3 a été effacée ; autocollants AMD et NVIDIA restent. Le visuel des appareils « Éclat Peinture » vient d'un modèle dont la licence est inconnue : à vérifier ou à ne pas utiliser.
- Logo : fichier du projet « Solaweb nouveau » = PNG de 560 px, flou à l'impression. Récupérer l'original en grand ou en vectoriel (SVG, PDF) pour les flyers. Soleil en orange doux : contraste d'environ 3 contre 1 sur crème, seulement pour de grandes formes, jamais du petit texte.

**Technique**
- Retirer `noindex` (balise `robots` dans `_sources/pages/haut.html`) puis régénérer.
- Vérifier sur de vrais téléphones et navigateurs (iPhone Safari, Android Chrome) : le recadrage mobile n'a jamais été travaillé. Vérifier le fondu du diaporama et le mode « animations réduites ».
- Poids des images, titres de page uniques, descriptions, image de partage, favicon, textes alternatifs, liens cassés (le lien « Accueil » avait cassé dans le zip d'essai).
- Supprimer ou mettre à l'écart les fichiers d'essai (`proposition-*.html`, `essai-*.jpg`, `logos-v*.html`) : seulement avec sa confirmation.
- Sauvegarde avant de publier. Ne jamais publier sans son accord explicite.

**Contenu**
- Prix (490 / 650 / 890 € proposés), coordonnées, texte du service 03 (provisoire).
- Mentions « fictif » des sites de démonstration : conserver celles sur les faux avis. Ne jamais présenter un faux avis ou une démo comme une vraie réalisation.
- Conseils d'Ayoub : précisé par Souad le 17.11.2026, ce sont **les points de cette liste** (légal, cookies, photos, etc.), pas une liste à part. Il a aussi dit que le site n'évoque pas son activité au premier regard : en cours de traitement (logo, photo de PC avec le slogan).

**Marque**
- Le nom « SolaWeb » est à confirmer (recherche de marque INPI non terminée).
- Style en discussion (17.11.2026) : abandon du doré brillant, soleil en orange doux, police du nom moins agressive, logo du projet « Solaweb nouveau » à l'essai (`proposition-logo-projet.html`). Rien n'est appliqué au vrai site.
