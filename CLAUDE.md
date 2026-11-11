# CLAUDE.md : site vitrine SolaWeb

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
- Styles : `css/site.css` (base) puis `css/theme.css` (thème blanc et violet, chargé après : c'est là qu'on ajuste). Scripts : `js/animations.js`, `js/main.js`, `js/portable.js`.
- Style validé : blanc + violet (#5B2BC4), orange du logo en accent, titres en police fine (poids 300), boutons sobres à coins de 6 px, sans flèche ni forme pilule, textes qui glissent de droite à gauche. Ne pas changer le style sans qu'elle le demande.
- Accueil : vidéo de fond en motion design (`assets/video/`), source dans `_sources/video/animation.html`, régénérée avec `bash _sources/video/encoder.sh <dossier-temporaire> assets/video` (Node, Chrome et ffmpeg nécessaires).
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

## Avant la vraie mise en ligne (à lui rappeler)
- Compléter les mentions légales, la confidentialité et les conditions (passages « à compléter » : SIRET, adresse, e-mail, téléphone, hébergeur, HT/TTC, médiateur). Aucune donnée inventée : ce sont ses vraies informations.
- Retirer `noindex` : balise `robots` dans `_sources/pages/haut.html`, puis régénérer.
- Le nom « SolaWeb » est à confirmer (recherche de marque INPI non terminée).
