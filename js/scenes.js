/* SolaWeb — accueil immersif (25.11.2026). JavaScript natif, aucune dépendance.
   Chaque section [data-scene] est plus haute que l'écran ; son contenu reste épinglé
   et avance avec le défilement. La progression (0 à 1) est lissée à chaque image
   pour un mouvement souple, sans détourner le défilement du navigateur.
   Animations réduites : rien ne s'exécute, les scènes s'affichent posées (voir scenes.css). */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var borne = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var etape = function (p, a, b) { return borne((p - a) / (b - a), 0, 1); };

  document.addEventListener('DOMContentLoaded', function () {
    var scenes = Array.prototype.map.call(document.querySelectorAll('[data-scene]'), function (el) {
      return { el: el, type: el.getAttribute('data-scene'), cur: 0, cible: 0 };
    });

    // --- préparation : la promesse découpée en mots ---
    var promesse = document.querySelector('.promesse-texte');
    var mots = [];
    if (promesse) {
      var texte = promesse.textContent.trim().split(/\s+/);
      promesse.textContent = '';
      texte.forEach(function (m, i) {
        var s = document.createElement('span'); s.className = 'm' + (/^(maquette|rien\.)$/.test(m) ? ' chaud' : ''); s.textContent = m;
        promesse.appendChild(s); if (i < texte.length - 1) promesse.appendChild(document.createTextNode(' '));
        mots.push(s);
      });
    }

    // --- scène 1 : éléments du chantier ---
    var chantier = document.querySelector('.scene-chantier');
    var legendes = document.querySelectorAll('.legende');
    var compteur = document.querySelectorAll('.compteur i');
    var adresse = document.getElementById('adresse-texte');
    var URL_FINALE = 'www.maison-tessaron.fr';
    var BORNES = [0, .2, .4, .6, .8, 1.01];

    function chantierMaj(p) {
      var s = chantier.style;
      s.setProperty('--trace', etape(p, .03, .3).toFixed(3));
      s.setProperty('--remplit', etape(p, .26, .38).toFixed(3));
      s.setProperty('--notes', (etape(p, .42, .48) * (1 - etape(p, .6, .64))).toFixed(3));
      s.setProperty('--lum', etape(p, .62, .8).toFixed(3));
      s.setProperty('--tel', etape(p, .86, .97).toFixed(3));
      var n = 0; for (var k = 0; k < 5; k++) if (p >= BORNES[k]) n = k;
      Array.prototype.forEach.call(legendes, function (l, i) { l.classList.toggle('active', i === n); });
      Array.prototype.forEach.call(compteur, function (c, i) { c.style.setProperty('--f', etape(p, BORNES[i], BORNES[i + 1]).toFixed(3)); });
      if (adresse) {
        var txt;
        if (p < .2) txt = 'notes du premier échange';
        else if (p < .62) txt = 'maquette, premier jet';
        else if (p < .82) txt = 'version finale';
        else txt = URL_FINALE.slice(0, Math.round(etape(p, .82, .94) * URL_FINALE.length));
        if (adresse.textContent !== txt) adresse.textContent = txt;
      }
      chantier.classList.toggle('en-ligne', p > .95);
    }

    // --- scène 2 : services ---
    var piste = document.querySelector('.piste');
    var panneaux = document.querySelectorAll('.panneau');
    var etroit = window.matchMedia('(max-width: 820px)');
    function servicesMaj(p, el) {
      el.style.setProperty('--p', p.toFixed(4));
      if (!piste || etroit.matches) return;
      var largeur = document.documentElement.clientWidth;
      var marge = (largeur - Math.min(1180, largeur - 40)) / 2;
      var max = Math.max(0, piste.scrollWidth - largeur + marge);
      piste.style.setProperty('--decale', (p * max).toFixed(1));
      Array.prototype.forEach.call(panneaux, function (pan) {
        var r = pan.getBoundingClientRect();
        var proche = 1 - Math.min(1, Math.abs(r.left + r.width / 2 - largeur / 2) / (largeur * .55));
        pan.style.setProperty('--proche', proche.toFixed(3));
        var centre = proche > .72;
        if (centre !== pan.classList.contains('au-centre')) {
          pan.classList.toggle('au-centre', centre);
          var im = pan.querySelector('img[data-anim]');
          if (im) {
            if (!im.dataset.fixe) im.dataset.fixe = im.getAttribute('src');
            im.setAttribute('src', centre ? im.getAttribute('data-anim') : im.dataset.fixe);
          }
        }
      });
    }

    // --- scène 3 : promesse ---
    function promesseMaj(p, el) {
      var allumes = Math.floor(etape(p, .04, .7) * mots.length + .001);
      mots.forEach(function (m, i) { m.classList.toggle('allume', i < allumes); });
      el.style.setProperty('--p', p.toFixed(4));
      el.classList.toggle('faits', p > .74);
    }

    // --- exemples : profondeur ---
    var exemples = document.querySelectorAll('.exemples .exemple');
    function exemplesMaj() {
      var h = window.innerHeight;
      Array.prototype.forEach.call(exemples, function (e, i) {
        var r = e.getBoundingClientRect();
        if (r.bottom < -100 || r.top > h + 100) return;
        var d = (r.top + r.height / 2 - h / 2) * (-.05 - i * .025);
        e.style.setProperty('--prof', d.toFixed(1));
      });
    }

    // --- le soleil de la journée ---
    var soleilJour = document.querySelector('.journee circle');
    function journeeMaj() {
      if (!soleilJour) return;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var t = max > 0 ? borne(window.scrollY / max, 0, 1) : 0;
      soleilJour.setAttribute('cx', (32 - 26 * Math.cos(Math.PI * t)).toFixed(2));
      soleilJour.setAttribute('cy', (32 - 26 * Math.sin(Math.PI * t)).toFixed(2));
    }

    function progression(s) {
      var r = s.el.getBoundingClientRect();
      var course = r.height - window.innerHeight;
      return course > 0 ? borne(-r.top / course, 0, 1) : 0;
    }

    // --- services : le service actif suit le défilement, ou le clic ---
    var items = document.querySelectorAll('.o-item');
    var demos = document.querySelectorAll('.offre-demo .demo');
    var offre = document.querySelector('.scene-offre');
    var actifOffre = -1;
    function choisirOffre(i) {
      if (i === actifOffre) return;
      actifOffre = i;
      Array.prototype.forEach.call(items, function (it, k) { it.classList.toggle('actif', k === i); it.querySelector('button').setAttribute('aria-expanded', String(k === i)); });
      Array.prototype.forEach.call(demos, function (d, k) { d.classList.toggle('actif', k === i); });
    }
    function offreEpinglee() { var c = offre && offre.querySelector('.scene-colle'); return !!c && getComputedStyle(c).position === 'sticky'; }
    function offreMaj(p) {
      if (!offreEpinglee()) return;
      var n = items.length, i = Math.min(n - 1, Math.floor(p * n));
      choisirOffre(i);
      Array.prototype.forEach.call(items, function (it, k) { it.style.setProperty('--f', borne(p * n - k, 0, 1).toFixed(3)); });
    }
    Array.prototype.forEach.call(items, function (it, k) {
      it.querySelector('button').addEventListener('pointerenter', function () { if (!offreEpinglee()) choisirOffre(k); });
      it.querySelector('button').addEventListener('click', function () {
        if (offreEpinglee()) {
          var course = offre.offsetHeight - window.innerHeight;
          window.scrollTo({ top: offre.offsetTop + course * ((k + .5) / items.length), behavior: 'smooth' });
        } else { choisirOffre(k); }
      });
    });
    choisirOffre(0);

    var MAJ = { chantier: function (p) { chantierMaj(p); }, offre: offreMaj, promesse: promesseMaj };

    function image() {
      scenes.forEach(function (s) {
        s.cible = progression(s);
        var ecart = s.cible - s.cur;
        if (Math.abs(ecart) < .0005 && s.pose) return;
        s.cur = Math.abs(ecart) < .0005 ? s.cible : s.cur + ecart * .14;
        s.pose = Math.abs(ecart) < .0005;
        if (MAJ[s.type]) MAJ[s.type](s.cur, s.el);
      });
      exemplesMaj();
      requestAnimationFrame(image);
    }
    requestAnimationFrame(image);

    // --- haut de page : le téléphone et la vidéo suivent la souris ---
    var accueil = document.querySelector('.accueil');
    if (accueil && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      accueil.addEventListener('pointermove', function (e) {
        var r = accueil.getBoundingClientRect();
        accueil.style.setProperty('--sx', (((e.clientX - r.left) / r.width) - .5).toFixed(3) * 2);
        accueil.style.setProperty('--sy', (((e.clientY - r.top) / r.height) - .5).toFixed(3) * 2);
      });
      accueil.addEventListener('pointerleave', function () { accueil.style.setProperty('--sx', 0); accueil.style.setProperty('--sy', 0); });
    }
  });
})();
