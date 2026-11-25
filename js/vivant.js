/* SolaWeb : finitions (25.11.2026, v2). JavaScript natif, aucune dépendance.
   Chargé dans <head> SANS « defer » pour gérer l'ouverture dès le début.
   1. Ouverture : le logo s'anime (au moins 1,9 s), puis l'écran s'efface (au plus 3,5 s).
   2. Objets 3D : image fixe, l'animation ne joue qu'au survol de la carte.
   Si le visiteur demande des animations réduites, l'ouverture est écourtée et la 3D reste fixe. */
(function () {
  'use strict';
  var html = document.documentElement;
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var debut = Date.now();
  var DUREE_MIN = calme ? 300 : 1900;
  var DUREE_MAX = 3500;
  var termine = false;

  html.classList.add('en-chargement');

  function terminer() {
    if (termine) return;
    termine = true;
    var c = document.querySelector('.chargeur');
    if (c) {
      c.classList.add('fini');
      setTimeout(function () { if (c.parentNode) c.parentNode.removeChild(c); }, 800);
    }
    // l'accueil commence à se dévoiler pendant que le logo s'efface
    setTimeout(function () { html.classList.remove('en-chargement'); }, calme ? 0 : 250);
  }
  window.addEventListener('load', function () {
    setTimeout(terminer, Math.max(0, DUREE_MIN - (Date.now() - debut)));
  });
  setTimeout(terminer, DUREE_MAX);
  window.addEventListener('pageshow', function (e) { if (e.persisted) terminer(); });

  document.addEventListener('DOMContentLoaded', function () {
    // Lettres du nom dans l'ouverture : une par une
    var nom = document.querySelector('.chargeur .sw-nom');
    if (nom && !calme) {
      var texte = nom.textContent; nom.textContent = '';
      texte.split('').forEach(function (ch, i) {
        var s = document.createElement('span'); s.textContent = ch; s.style.setProperty('--i', i); nom.appendChild(s);
      });
    }

    if (calme || !window.matchMedia('(hover: hover)').matches) return;
    Array.prototype.forEach.call(document.querySelectorAll('.carte-s .cs-3d img[data-anim]'), function (img) {
      var carte = img.closest('.carte-s');
      var fixe = img.getAttribute('src');
      var anime = img.getAttribute('data-anim');
      carte.addEventListener('pointerenter', function () { img.setAttribute('src', anime); });
      carte.addEventListener('pointerleave', function () { img.setAttribute('src', fixe); });
    });
  });
})();
