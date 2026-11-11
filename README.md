# SolaWeb, site vitrine

Site vitrine de SolaWeb : création de sites web, assistants IA et automatisation pour les artisans, commerçants et indépendants.

**Version de démonstration.** Les coordonnées, le SIRET, l'hébergeur et le statut HT/TTC restent à compléter. Le site est volontairement en `noindex` (il n'apparaît pas dans Google) tant qu'il n'est pas finalisé.

## Le site

Site statique : HTML, CSS et JavaScript, sans outil de construction, sans cookie et sans service tiers. Les polices sont hébergées dans le site.

| Page | Fichier |
|---|---|
| Accueil (vidéo de fond en motion design) | `index.html` |
| Services | `services.html` |
| Réalisations (portable et téléphone animés) | `realisations.html` |
| Tarifs | `tarifs.html` |
| Contact (formulaire de démonstration, aucun envoi) | `contact.html` |
| Mentions légales, confidentialité, conditions | `mentions-legales.html`, `confidentialite.html`, `conditions.html` |

Les dossiers `beauty-palace/`, `atelier-vermail/`, `eclat-peinture-93/` et `maison-tessaron-v2g/` sont des sites de démonstration (noms, adresses et avis fictifs).

- `css/site.css` : styles de base ; `css/theme.css` : thème blanc et violet, chargé après.
- `js/animations.js` : apparition des textes, boutons interactifs, vidéo de fond.
- `js/main.js` : menu mobile, fenêtres, formulaire de démonstration.
- `js/portable.js`, `js/palettes.js` : animation de la page Réalisations.

## Voir le site en local

```bash
python -m http.server 8765 --bind 127.0.0.1
```

Puis ouvrir `http://127.0.0.1:8765/`.

## Modifier l'en-tête, le pied de page ou le contenu des pages

Les pages sont assemblées à partir de morceaux communs (`_sources/pages/`) : `haut.html` (en-tête), `bas.html` (pied de page), `corps-*.html` (contenu de chaque page), `bloc-*.html` (blocs réutilisés). Après une modification, régénérer les pages depuis la racine du site :

```bash
bash _sources/pages/monter.sh .
```

## Refaire la vidéo de fond

Source : `_sources/video/animation.html` (s'ouvre dans un navigateur pour un aperçu en direct). Pour régénérer la vidéo (Node 22+, Chrome et ffmpeg nécessaires) :

```bash
bash _sources/video/encoder.sh /tmp/images-video assets/video
```

## Mise en ligne

Publié avec GitHub Pages depuis la branche `main`, dossier racine. Le fichier `_headers` (en-têtes de sécurité) ne sert que sur Netlify : GitHub Pages l'ignore.

Avant une vraie mise en ligne : compléter les mentions légales et les coordonnées, retirer `noindex` (balise `robots` dans `_sources/pages/haut.html`, puis régénérer les pages).

## Licences

Polices EB Garamond, Instrument Sans et Montserrat : SIL Open Font License 1.1. Photos des démonstrations : banques d'images libres (crédits dans chaque démonstration).
