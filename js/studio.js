/* SolaWeb — page Réalisations : le studio (25.11.2026). JavaScript natif.
   Le vrai site de démonstration est chargé dans un cadre (iframe) et mis à l'échelle :
   en vue « Ordinateur », il est affiché comme sur un écran de 1366 px de large ;
   en vue « Téléphone », comme sur un écran de 390 px. On peut le faire défiler et cliquer dedans.
   Les onglets changent de projet ; les fiches « Essayer dans le studio » y renvoient. */
(function () {
  'use strict';
  var PROJETS = {
    beauty:  { nom: 'Beauty Palace', dossier: 'beauty-palace' },
    eclat:   { nom: 'Éclat Peinture 93', dossier: 'eclat-peinture-93' },
    vermail: { nom: 'L’Atelier Vermail', dossier: 'atelier-vermail' }
  };
  var LARGEUR = { ordi: 1366, tel: 390 };

  document.addEventListener('DOMContentLoaded', function () {
    var scene = document.getElementById('studio-scene');
    if (!scene) return;
    var ecran = document.getElementById('studio-ecran');
    var iframe = document.getElementById('studio-iframe');
    var url = document.getElementById('studio-url');
    var ouvrir = document.getElementById('studio-ouvrir');
    var onglets = document.querySelectorAll('.studio-onglets [role="tab"]');
    var appareils = document.querySelectorAll('.studio-appareils button');
    var appareil = 'ordi', projet = 'beauty';

    // mise à l'échelle du site dans le cadre
    function ajuster() {
      var l = ecran.clientWidth, h = ecran.clientHeight;
      if (!l || !h) return;
      var echelle = l / LARGEUR[appareil];
      iframe.style.width = LARGEUR[appareil] + 'px';
      iframe.style.height = (h / echelle) + 'px';
      iframe.style.transform = 'scale(' + echelle + ')';
    }
    if ('ResizeObserver' in window) new ResizeObserver(ajuster).observe(ecran);
    window.addEventListener('resize', ajuster);

    function charger(cle) {
      projet = cle;
      var p = PROJETS[cle];
      Array.prototype.forEach.call(onglets, function (o) { o.setAttribute('aria-selected', String(o.getAttribute('data-projet') === cle)); });
      url.textContent = p.dossier + ' / accueil';
      ouvrir.href = p.dossier + '/index.html';
      iframe.title = 'Démonstration en direct : ' + p.nom;
      scene.classList.add('charge');
      iframe.src = p.dossier + '/index.html';
    }
    iframe.addEventListener('load', function () { scene.classList.remove('charge'); ajuster(); });

    Array.prototype.forEach.call(onglets, function (o, i) {
      o.addEventListener('click', function () { if (o.getAttribute('data-projet') !== projet) charger(o.getAttribute('data-projet')); });
      o.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        var n = onglets[(i + (e.key === 'ArrowRight' ? 1 : onglets.length - 1)) % onglets.length];
        n.focus(); n.click();
      });
    });
    Array.prototype.forEach.call(appareils, function (b) {
      b.addEventListener('click', function () {
        appareil = b.getAttribute('data-appareil');
        Array.prototype.forEach.call(appareils, function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        scene.setAttribute('data-appareil', appareil);
        ajuster();
      });
    });
    // les fiches projet renvoient au studio
    Array.prototype.forEach.call(document.querySelectorAll('[data-essayer]'), function (b) {
      b.addEventListener('click', function () {
        charger(b.getAttribute('data-essayer'));
        document.getElementById('realisations').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      });
    });
    // sur petit écran, on commence en vue téléphone
    if (window.matchMedia('(max-width: 700px)').matches) appareils[1].click(); else ajuster();
  });
})();
