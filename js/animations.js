/* SolaWeb : animations du texte (apparition au défilement, grand titre mot par mot)
   et ombre de l'en-tête au défilement. JavaScript natif, aucune dépendance.
   Chargé dans <head> SANS « defer » : la classe « js » est posée avant l'affichage,
   donc le texte n'apparaît pas puis disparaît. Sans JavaScript, tout reste visible. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  // Découpe le texte d'un titre en mots (les balises internes, comme .accent, sont conservées)
  function decouperMots(el) {
    var n = 0;
    (function parcourir(noeud) {
      Array.prototype.slice.call(noeud.childNodes).forEach(function (enfant) {
        if (enfant.nodeType === 3) {
          var morceaux = enfant.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          morceaux.forEach(function (m) {
            if (!m) return;
            if (/^\s+$/.test(m)) { frag.appendChild(document.createTextNode(m)); return; }
            var mot = document.createElement('span'); mot.className = 'mot';
            var interieur = document.createElement('span'); interieur.textContent = m;
            interieur.style.setProperty('--i', n++);
            mot.appendChild(interieur); frag.appendChild(mot);
          });
          noeud.replaceChild(frag, enfant);
        } else if (enfant.nodeType === 1) {
          parcourir(enfant);
        }
      });
    })(el);
  }

  document.addEventListener('DOMContentLoaded', function () {
    // En-tête : petite ombre dès qu'on fait défiler
    var entete = document.querySelector('.entete');
    if (entete) {
      var majEntete = function () { entete.classList.toggle('defile', window.scrollY > 8); };
      majEntete();
      window.addEventListener('scroll', majEntete, { passive: true });
    }

    // Vidéo de fond de l'accueil : lecture seulement si les animations sont autorisées,
    // bouton Pause / Lecture, et mise en veille quand elle n'est plus à l'écran.
    var video = document.querySelector('.heros-video video');
    var boutonVideo = document.querySelector('.video-pause');
    if (video && boutonVideo) {
      var calme = window.matchMedia('(prefers-reduced-motion: reduce)');
      var enPause = calme.matches;
      var maj = function () {
        boutonVideo.setAttribute('aria-pressed', String(enPause));
        boutonVideo.textContent = enPause ? 'Lire la vidéo' : 'Mettre la vidéo en pause';
        if (!enPause) { var p = video.play(); if (p && p.catch) p.catch(function () {}); } else { video.pause(); }
      };
      video.muted = true;
      video.autoplay = !enPause;
      boutonVideo.hidden = false;
      boutonVideo.addEventListener('click', function () { enPause = !enPause; maj(); });
      maj();

      // Bandeau interactif : la vidéo suit doucement la souris (quelques pixels), sur ordinateur seulement
      var heros = document.querySelector('.heros');
      var souris = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 921px)');
      if (heros && souris.matches && !calme.matches) {
        heros.addEventListener('pointermove', function (e) {
          var r = heros.getBoundingClientRect();
          video.style.setProperty('--vx', (((e.clientX - r.left) / r.width) - 0.5) * -18 + 'px');
          video.style.setProperty('--vy', (((e.clientY - r.top) / r.height) - 0.5) * -12 + 'px');
        });
        heros.addEventListener('pointerleave', function () { video.style.setProperty('--vx', '0px'); video.style.setProperty('--vy', '0px'); });
      }
    }

    Array.prototype.forEach.call(document.querySelectorAll('[data-mots]'), decouperMots);
    Array.prototype.forEach.call(document.querySelectorAll('[data-anime="groupe"]'), function (g) {
      Array.prototype.forEach.call(g.children, function (enfant, i) { enfant.style.setProperty('--i', i); });
    });

    // Tous les textes et boutons du contenu glissent de droite à gauche en apparaissant.
    // Les éléments déjà animés (ou placés dans un bloc animé) ne sont pas repris ; léger décalage entre voisins.
    var aAnimer = 'main h2, main h3, main p, main li, main .bouton, main .ct-champ, main .ct-coord, main .tableau-conteneur, main .ligne-limites, main .tarifs-pied, .pied-site .pied-grille > *, .pied-site .pied-bas';
    var rangs = typeof Map === 'function' ? new Map() : null;
    Array.prototype.forEach.call(document.querySelectorAll(aAnimer), function (el) {
      if (el.hasAttribute('data-anime') || el.hasAttribute('data-mots')) return;
      if (el.parentElement && el.parentElement.closest('[data-anime], [data-mots], dialog, .scene-portable, .commandes-real, .visuellement-cache, .fil-ariane')) return;
      if (el.classList.contains('visuellement-cache') || el.closest('.heros-video')) return;
      el.setAttribute('data-anime', '');
      if (rangs) { var n = rangs.get(el.parentElement) || 0; rangs.set(el.parentElement, n + 1); el.style.setProperty('--d', String(Math.min(n, 8) * 90)); }
    });

    // Boutons interactifs : la lumière suit la souris
    document.addEventListener('pointermove', function (e) {
      var b = e.target && e.target.closest ? e.target.closest('.bouton') : null;
      if (!b) return;
      var r = b.getBoundingClientRect();
      b.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      b.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });

    var cibles = document.querySelectorAll('[data-anime], [data-mots], .tete-section');
    // Ce qui est déjà à l'écran à l'arrivée s'anime tout de suite, sans attendre l'observateur
    Array.prototype.forEach.call(cibles, function (c) {
      if (c.getBoundingClientRect().top < window.innerHeight) c.classList.add('vu');
    });
    // Sécurité : si l'observateur ne se déclenche pas (onglet en arrière-plan, vieux navigateur), tout s'affiche après 2,5 s
    setTimeout(function () {
      Array.prototype.forEach.call(document.querySelectorAll('[data-anime]:not(.vu), [data-mots]:not(.vu)'), function (c) {
        if (c.getBoundingClientRect().top < window.innerHeight) c.classList.add('vu');
      });
    }, 2500);
    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(cibles, function (c) { c.classList.add('vu'); });
      return;
    }
    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('vu'); obs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
    Array.prototype.forEach.call(cibles, function (c) { obs.observe(c); });
  });
})();
