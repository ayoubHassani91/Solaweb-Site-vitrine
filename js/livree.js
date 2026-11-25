/* SolaWeb — univers « livrée » (25.11.2026). JavaScript natif, aucune dépendance.
   Chargé dans <head> SANS « defer ».
   1. Ouverture : le logo se dessine, puis la bande de livrée traverse l'écran et dévoile la page.
   2. Accueil : le choix du métier rallume la vitrine d'exemple dans le téléphone.
   3. Méthode : la maquette se construit pendant la lecture, la lumière suit l'étape.
   4. Apparitions discrètes au défilement, objets 3D animés au survol.
   5. Page Contact : le métier choisi sur l'accueil pré-remplit le message.
   Tout respecte le réglage « animations réduites ». Sans JavaScript, tout reste visible. */
(function () {
  'use strict';
  var html = document.documentElement;
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var debut = Date.now();
  var DUREE_MIN = calme ? 300 : 1700;
  var DUREE_MAX = 3400;
  var termine = false;
  html.classList.add('js', 'en-chargement');

  function devoiler() {
    html.classList.remove('en-chargement');
    var flanc = document.querySelector('.flanc');
    if (flanc) flanc.classList.add('parti');
    Array.prototype.forEach.call(document.querySelectorAll('.entre'), function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('vu');
    });
  }
  function terminer() {
    if (termine) return;
    termine = true;
    var c = document.querySelector('.chargeur');
    if (!c || calme) { if (c) c.parentNode.removeChild(c); devoiler(); return; }
    c.classList.add('fini');
    setTimeout(devoiler, 560);           // la bande couvre l'écran : la page apparaît derrière
    setTimeout(function () { if (c.parentNode) c.parentNode.removeChild(c); }, 1150);
  }
  window.addEventListener('load', function () { setTimeout(terminer, Math.max(0, DUREE_MIN - (Date.now() - debut))); });
  setTimeout(terminer, DUREE_MAX);
  window.addEventListener('pageshow', function (e) { if (e.persisted) terminer(); });

  var METIERS = {
    peintre:    { img: 'assets/demos/eclat-tel.webp', alt: 'Exemple de site sur téléphone : Éclat Peinture 93, peintre en bâtiment (entreprise fictive)', nom: 'Éclat Peinture 93', lien: 'eclat-peinture-93/index.html' },
    beaute:     { img: 'assets/demos/beauty-palace-tel.webp', alt: 'Exemple de site sur téléphone : Beauty Palace, institut de beauté (entreprise fictive)', nom: 'Beauty Palace', lien: 'beauty-palace/index.html' },
    restaurant: { img: 'assets/demos/atelier-vermail-tel.webp', alt: 'Exemple de site sur téléphone : L’Atelier Vermail, restaurant (entreprise fictive)', nom: 'L’Atelier Vermail', lien: 'atelier-vermail/index.html' },
    autre:      { img: '', alt: '', nom: '', lien: '' }
  };
  var LIBELLES = { peintre: 'peintre en bâtiment', beaute: 'dans la beauté', restaurant: 'restaurateur' };

  document.addEventListener('DOMContentLoaded', function () {
    // lettres du nom dans l'ouverture
    var nom = document.querySelector('.chargeur .sw-nom');
    if (nom && !calme) {
      var texte = nom.textContent; nom.textContent = '';
      texte.split('').forEach(function (ch, i) { var s = document.createElement('span'); s.textContent = ch; s.style.setProperty('--i', i); nom.appendChild(s); });
    }

    // --- 2. le choix du métier rallume la vitrine ---
    var ecran = document.querySelector('.tel-ecran');
    var img = document.getElementById('vitrine-img');
    var legende = document.getElementById('vitrine-legende');
    var cta = document.getElementById('cta-maquette');
    Array.prototype.forEach.call(document.querySelectorAll('input[name="metier"]'), function (radio) {
      radio.addEventListener('change', function () {
        var m = METIERS[radio.value]; if (!m || !ecran) return;
        ecran.setAttribute('data-metier', radio.value);
        if (m.img) { img.src = m.img; img.alt = m.alt; img.hidden = false; } else { img.hidden = true; img.alt = ''; }
        legende.innerHTML = m.nom
          ? 'Exemple : <a href="' + m.lien + '">' + m.nom + '</a>, entreprise fictive'
          : 'Votre métier n’est pas dans la liste ? Votre maquette sera faite pour lui.';
        cta.href = 'contact.html?service=site&metier=' + radio.value;
        if (!calme) { ecran.classList.remove('allume'); void ecran.offsetWidth; ecran.classList.add('allume'); }
      });
    });

    // --- 3. méthode : la maquette suit l'étape lue ---
    var atelier = document.getElementById('atelier');
    var etapes = document.querySelectorAll('.etape-l');
    var lumiere = document.querySelector('.lumiere');
    var adresse = document.getElementById('atelier-adresse');
    var ADRESSES = { 1: 'maquette en préparation', 2: 'maquette · brouillon', 3: 'maquette · vos retours', 4: 'version finale', 5: 'www.votre-entreprise.fr' };
    function activer(li) {
      Array.prototype.forEach.call(etapes, function (e) { e.classList.toggle('actif', e === li); });
      var n = li.getAttribute('data-etape');
      if (atelier) atelier.setAttribute('data-etape', n);
      if (adresse) adresse.textContent = ADRESSES[n];
      if (lumiere) lumiere.style.transform = 'translateY(' + (li.offsetTop + 6) + 'px)';
    }
    if (etapes.length) {
      var courant = null, prevu = false;
      var suivre = function () {
        prevu = false;
        var repere = window.innerHeight * 0.55, choisi = etapes[0];
        Array.prototype.forEach.call(etapes, function (e) { if (e.getBoundingClientRect().top < repere) choisi = e; });
        if (choisi !== courant) { courant = choisi; activer(choisi); }
      };
      window.addEventListener('scroll', function () { if (!prevu) { prevu = true; requestAnimationFrame(suivre); } }, { passive: true });
      window.addEventListener('resize', suivre);
      suivre();
    }

    // --- 4. apparitions discrètes ---
    var entrees = document.querySelectorAll('.entre');
    if (calme || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(entrees, function (el) { el.classList.add('vu'); });
    } else {
      var obs = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting && !html.classList.contains('en-chargement')) { e.target.classList.add('vu'); obs.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -8% 0px' });
      Array.prototype.forEach.call(entrees, function (el) { obs.observe(el); });
      setTimeout(function () { Array.prototype.forEach.call(entrees, function (el) { el.classList.add('vu'); }); }, 9000);
    }

    // objets 3D : l'animation ne joue qu'au survol
    if (!calme && window.matchMedia('(hover: hover)').matches) {
      Array.prototype.forEach.call(document.querySelectorAll('img[data-anim]'), function (im) {
        var cible = im.closest('.s-ligne, .carte-s') || im;
        var fixe = im.getAttribute('src'), anime = im.getAttribute('data-anim');
        cible.addEventListener('pointerenter', function () { im.setAttribute('src', anime); });
        cible.addEventListener('pointerleave', function () { im.setAttribute('src', fixe); });
      });
    }

    // --- 5. page Contact : pré-remplir le message avec le métier ---
    var message = document.getElementById('message');
    var metier = new URLSearchParams(window.location.search).get('metier');
    if (message && metier && LIBELLES[metier] && !message.value) {
      message.value = 'Bonjour, je suis ' + LIBELLES[metier] + ' et je souhaite voir une maquette de mon site.';
    }
  });
})();
