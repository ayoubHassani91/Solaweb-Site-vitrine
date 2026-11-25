/* SolaWeb — page Réalisations : la vitrine des trois démonstrations (25.11.2026).
   JavaScript natif. Les boutons changent le projet (fondu entre les captures,
   ordinateur et téléphone ensemble). Défilement automatique toutes les 6 s,
   barre de progression, bouton Pause, pause au survol. Animations réduites :
   pas de défilement automatique. */
(function () {
  'use strict';
  var PROJETS = {
    beauty:  { nom: 'Beauty Palace', url: 'beauty-palace / accueil', lien: 'beauty-palace/index.html', desc: 'Les soins, l’histoire de la maison et la réservation en ligne.' },
    eclat:   { nom: 'Éclat Peinture 93', url: 'eclat-peinture-93 / accueil', lien: 'eclat-peinture-93/index.html', desc: 'Les prestations, les chantiers réalisés et la demande de devis.' },
    vermail: { nom: 'L’Atelier Vermail', url: 'atelier-vermail / accueil', lien: 'atelier-vermail/index.html', desc: 'La carte, le chef et la réservation d’une table.' }
  };
  var ORDRE = ['beauty', 'eclat', 'vermail'];
  var DUREE = 6000;

  document.addEventListener('DOMContentLoaded', function () {
    var scene = document.getElementById('vitrines-scene');
    if (!scene) return;
    var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var boutons = document.querySelectorAll('.v-choix button');
    var imgs = scene.querySelectorAll('.v-img');
    var url = document.getElementById('v-url');
    var desc = document.getElementById('v-desc');
    var ouvrir = document.getElementById('v-ouvrir');
    var pause = document.getElementById('v-pause');
    var barre = document.getElementById('v-barre');
    var courant = 'beauty', enPause = calme, survol = false, debut = 0, ecoule = 0;

    function montrer(cle) {
      courant = cle;
      var p = PROJETS[cle];
      Array.prototype.forEach.call(imgs, function (im) { im.classList.toggle('actif', im.getAttribute('data-projet') === cle); });
      Array.prototype.forEach.call(boutons, function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-projet') === cle)); });
      url.textContent = p.url;
      desc.textContent = p.desc;
      ouvrir.href = p.lien;
      ouvrir.textContent = 'Ouvrir ' + p.nom;
      scene.setAttribute('aria-label', 'Site de démonstration ' + p.nom + ' sur ordinateur et sur téléphone');
      scene.classList.remove('change'); void scene.offsetWidth; scene.classList.add('change');
      ecoule = 0; debut = performance.now();
    }
    Array.prototype.forEach.call(boutons, function (b) {
      b.addEventListener('click', function () { montrer(b.getAttribute('data-projet')); });
    });
    pause.addEventListener('click', function () {
      enPause = !enPause;
      pause.setAttribute('aria-pressed', String(enPause));
      pause.textContent = enPause ? 'Reprendre' : 'Pause';
      debut = performance.now() - ecoule;
    });
    scene.addEventListener('pointerenter', function () { survol = true; });
    scene.addEventListener('pointerleave', function () { survol = false; debut = performance.now() - ecoule; });
    if (calme) { pause.textContent = 'Reprendre'; pause.setAttribute('aria-pressed', 'true'); }

    debut = performance.now();
    function image(t) {
      if (!enPause && !survol && !document.hidden) {
        ecoule = t - debut;
        if (ecoule >= DUREE) { montrer(ORDRE[(ORDRE.indexOf(courant) + 1) % ORDRE.length]); ecoule = 0; }
      } else { debut = t - ecoule; }
      if (barre) barre.style.transform = 'scaleX(' + Math.min(1, ecoule / DUREE).toFixed(3) + ')';
      requestAnimationFrame(image);
    }
    requestAnimationFrame(image);
    montrer('beauty');
  });
})();
