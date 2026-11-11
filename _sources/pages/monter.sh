#!/usr/bin/env bash
# Assemble les pages du site SolaWeb à partir de morceaux communs (en-tête, pied, blocs).
# Usage : bash monter.sh <dossier-du-site>
set -euo pipefail
shopt -u patsub_replacement 2>/dev/null || true
P="$(cd "$(dirname "$0")" && pwd)"
SITE="$1"
SRC="$P/index-source.html"

# ---- Blocs extraits de l'ancienne page unique ----
SCENE=$(awk '/<div class="scene-portable"/{f=1} f{print} /id="annonce-real"/{if(f) exit}' "$SRC")
FORMULES=$(awk '/<div class="formules3">/{f=1} f{print} /class="tarifs-pied"/{t=1} t && /^        <\/div>$/{exit}' "$SRC" \
  | sed 's|<div class="formules3">|<div class="formules3" data-anime="groupe">|; s|href="#contact" data-formule="[a-z-]*"|href="contact.html?service=site"|; s|class="bouton bouton-plat bouton-plat-plein" href="contact|class="bouton bouton-plat bouton-plat-plein fleche" href="contact|; s|<div class="tarifs-pied">|<div class="tarifs-pied" data-anime>|')
FORM=$(awk '/<form id="form-devis"/{f=1} f{print} /<\/form>/{if(f) exit}' "$SRC")
ETAPES=$(cat "$P/bloc-etapes.html")
PROJETS=$(cat "$P/bloc-projets.html")
CTA=$(cat "$P/bloc-cta.html")
HAUT=$(cat "$P/haut.html")
BAS=$(cat "$P/bas.html")

# page <fichier> <titre> <description> <menu-actif> <corps> <scripts> <dialogues> <classe>
page() {
  local f="$1" titre="$2" desc="$3" actif="$4" corps="$5" scripts="$6" dlg="$7" classe="$8"
  local h="$HAUT" b="$BAS" c
  h="${h//__TITRE__/$titre}"; h="${h//__DESC__/$desc}"; h="${h//__SCRIPTS__/$scripts}"; h="${h//__CLASSE__/$classe}"
  for k in index services realisations tarifs contact; do
    if [ "$k" = "$actif" ]; then h="${h//__C_${k}__/ aria-current=\"page\"}"; else h="${h//__C_${k}__/}"; fi
  done
  c="$corps"
  c="${c//__ETAPES__/$ETAPES}"; c="${c//__PROJETS__/$PROJETS}"; c="${c//__CTA__/$CTA}"
  c="${c//__SCENE__/$SCENE}"; c="${c//__FORMULES__/$FORMULES}"; c="${c//__FORMULAIRE__/$FORM}"
  b="${b//__DIALOGUES__/$dlg}"
  printf '%s\n%s\n%s' "$h" "$c" "$b" > "$SITE/$f"
  echo "  $f"
}

D_REAL='Trois sites de démonstration réalisés par SolaWeb : institut de beauté, peintre en bâtiment et restaurant, sur ordinateur et téléphone.'
SC_REAL='  <script src="js/palettes.js" defer></script>
  <script src="js/portable.js" defer></script>
'

page index.html 'SolaWeb — Sites web, assistants IA et automatisation' \
  'SolaWeb crée des sites vitrines pour artisans, commerçants et indépendants, des assistants IA et l&rsquo;automatisation de vos tâches. Votre maquette avant tout paiement.' \
  index "$(cat "$P/corps-index.html")" '' '' 'page-accueil'
page services.html 'Services — SolaWeb' \
  'Sites vitrines, e-commerce, assistants IA et automatisation des tâches : les services de SolaWeb pour artisans, commerçants et indépendants.' \
  services "$(cat "$P/corps-services.html")" '' '' 'page-interne'
page realisations.html 'Réalisations — SolaWeb' "$D_REAL" \
  realisations "$(cat "$P/corps-realisations.html")" "$SC_REAL" "$(cat "$P/dlg-apercu.html")" 'page-interne'
page tarifs.html 'Tarifs — SolaWeb' \
  'Trois formules de site web à prix clair (490, 650 et 890 €), une page qui défile ou plusieurs pages. Maquette avant tout paiement.' \
  tarifs "$(cat "$P/corps-tarifs.html")" '' "$(cat "$P/dlg-options.html")" 'page-interne'
page contact.html 'Contact — SolaWeb' \
  'Demandez un devis à SolaWeb : site web, assistant IA ou automatisation. Réponse avec un devis écrit, sans engagement.' \
  contact "$(cat "$P/corps-contact.html")" '' '' 'page-interne'

legal() {
  local f="$1" h1="$2" src="$3" desc="$4" c
  c=$(cat "$P/corps-legal.html"); c="${c//__H1__/$h1}"; c="${c//__TEXTE__/$(cat "$P/$src")}"
  page "$f" "$h1 — SolaWeb" "$desc" aucun "$c" '' '' 'page-interne'
}
legal mentions-legales.html 'Mentions légales' legal-mentions.html 'Mentions légales du site SolaWeb.'
legal confidentialite.html 'Politique de confidentialité' legal-confidentialite.html 'Politique de confidentialité du site SolaWeb : données collectées, durée de conservation, vos droits.'
legal conditions.html 'Conditions commerciales' legal-conditions.html 'Conditions commerciales de SolaWeb : devis, maquette avant paiement, paiement en deux fois, modifications.'
