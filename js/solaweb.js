/* SolaWeb (25.11.2026, version « mix »). JavaScript natif, aucune dépendance.
   Chargé dans <head> SANS « defer ».
   1. Ouverture : le logo se dessine (1,6 s au moins, 3 s au plus), puis l'écran s'efface.
   2. Accueil : le choix du métier change l'exemple affiché dans le téléphone.
   3. Méthode : la maquette suit l'étape lue.
   4. Objets 3D animés au survol ; page Contact pré-remplie avec le métier choisi.
   Réglage « animations réduites » respecté. Sans JavaScript, tout reste visible. */
(function () {
  'use strict';
  var html = document.documentElement;
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var debut = Date.now();
  var termine = false;
  html.classList.add('js', 'en-chargement');

  function terminer() {
    if (termine) return;
    termine = true;
    var c = document.querySelector('.chargeur');
    if (c) { c.classList.add('fini'); setTimeout(function () { if (c.parentNode) c.parentNode.removeChild(c); }, 1100); }
    // la page apparaît pendant que l'écran s'ouvre le long de l'horizon
    setTimeout(function () {
      html.classList.remove('en-chargement');
      html.classList.add('pret');
      var a = document.querySelector('.accueil'); if (a) a.classList.add('parti');
    }, calme ? 0 : 180);
  }
  window.addEventListener('load', function () { setTimeout(terminer, Math.max(0, (calme ? 300 : 1900) - (Date.now() - debut))); });
  setTimeout(terminer, 3200);
  window.addEventListener('pageshow', function (e) { if (e.persisted) terminer(); });

  var METIERS = {
    peintre:    { img: 'assets/demos/eclat-tel.webp', alt: 'Exemple de site sur téléphone pour un peintre en bâtiment (Éclat Peinture 93, entreprise fictive)', nom: 'Éclat Peinture 93', lien: 'eclat-peinture-93/index.html' },
    beaute:     { img: 'assets/demos/beauty-palace-tel.webp', alt: 'Exemple de site sur téléphone pour un institut de beauté (Beauty Palace, entreprise fictive)', nom: 'Beauty Palace', lien: 'beauty-palace/index.html' },
    restaurant: { img: 'assets/demos/atelier-vermail-tel.webp', alt: 'Exemple de site sur téléphone pour un restaurant (L’Atelier Vermail, entreprise fictive)', nom: 'L’Atelier Vermail', lien: 'atelier-vermail/index.html' },
    autre:      { img: '', alt: '', nom: '', lien: '' }
  };
  var LIBELLES = { peintre: 'peintre en bâtiment', beaute: 'dans la beauté', restaurant: 'restaurateur' };

  document.addEventListener('DOMContentLoaded', function () {
    // fond en motion design (Blender) derrière toutes les zones claires
    // ailleurs : de grands halos très doux qui dérivent lentement
    if (document.body.getAttribute('data-fond') !== 'motion' && !document.querySelector('.fond-doux')) {
      var doux = document.createElement('div');
      doux.className = 'fond-doux'; doux.setAttribute('aria-hidden', 'true');
      doux.innerHTML = '<i></i><i></i><i></i>';
      document.body.insertBefore(doux, document.body.firstChild);
    }
    if (document.body.getAttribute('data-fond') === 'motion' && !document.querySelector('.fond-motion')) {
      var fond = document.createElement('div');
      fond.className = 'fond-motion';
      fond.setAttribute('aria-hidden', 'true');
      fond.innerHTML = '<video muted loop playsinline preload="metadata" poster="assets/video/motion/champ-points.jpg">' +
        '<source src="assets/video/motion/champ-points-mobile.mp4" type="video/mp4" media="(max-width: 900px)">' +
        '<source src="assets/video/motion/champ-points.mp4" type="video/mp4"></video>';
      document.body.insertBefore(fond, document.body.firstChild);
      var vf = fond.querySelector('video');
      if (!calme) {
        vf.autoplay = true;
        var jouer = function () { var p = vf.play(); if (p && p.catch) p.catch(function () {}); };
        jouer();
        document.addEventListener('visibilitychange', function () { if (document.hidden) vf.pause(); else jouer(); });
      }
    }

    // le soleil de l'en-tête descend quand on fait défiler, celui du pied de page se couche
    if (!calme) {
      var prevuSoleil = false;
      var soleil = function () { prevuSoleil = false; html.style.setProperty('--couche', Math.min(window.scrollY / 900, 1).toFixed(3)); };
      window.addEventListener('scroll', function () { if (!prevuSoleil) { prevuSoleil = true; requestAnimationFrame(soleil); } }, { passive: true });
      soleil();
      var pied = document.querySelector('.pied-site');
      if (pied && 'IntersectionObserver' in window) {
        new IntersectionObserver(function (es) { es.forEach(function (e) { pied.classList.toggle('couchant', e.isIntersecting); }); }, { threshold: .35 }).observe(pied);
      }
    }

    // mini-sites du téléphone : distance exacte du défilement automatique
    var mesurer = function () {
      Array.prototype.forEach.call(document.querySelectorAll('.mini'), function (mi) {
        var d = mi.querySelector('.mini-defile'); if (!d) return;
        d.style.setProperty('--course', Math.max(0, d.scrollHeight - mi.clientHeight) + 'px');
      });
    };
    mesurer(); window.addEventListener('load', mesurer); window.addEventListener('resize', mesurer);

    // cartes : un halo de lumière suit la souris
    if (!calme && window.matchMedia('(hover: hover)').matches) {
      document.addEventListener('pointermove', function (e) {
        var c = e.target.closest && e.target.closest('.offre-demo, .exemple, .carte-s, .carte-f, .ct-droite, .bande-cta');
        if (!c) return;
        var cible = c.classList.contains('exemple') ? c.querySelector('.e-img') : c;
        if (!cible) return;
        var r = cible.getBoundingClientRect();
        cible.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        cible.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }, { passive: true });
    }

    // choix du métier
    var ecran = document.querySelector('.tel-ecran');
    var legende = document.getElementById('vitrine-legende');
    var cta = document.getElementById('cta-maquette');
    Array.prototype.forEach.call(document.querySelectorAll('input[name="metier"]'), function (radio) {
      radio.addEventListener('change', function () {
        var m = METIERS[radio.value]; if (!m || !ecran) return;
        var appliquer = function () {
          ecran.setAttribute('data-metier', radio.value);
          Array.prototype.forEach.call(ecran.querySelectorAll('.mini'), function (mi) { mi.classList.toggle('actif', mi.classList.contains('mini-' + (radio.value === 'restaurant' ? 'resto' : radio.value))); });
          legende.innerHTML = m.nom
            ? 'Exemple : <a href="' + m.lien + '">' + m.nom + '</a> <span style="white-space:nowrap">(entreprise fictive)</span>'
            : 'Votre métier n’est pas dans la liste ? La maquette sera faite pour lui.';
          cta.href = 'contact.html?service=site&metier=' + radio.value;
        };
        appliquer(); return;
        if (calme) { appliquer(); return; }
        ecran.classList.add('change');
        setTimeout(appliquer, 300);
      });
    });

    // méthode : l'étape la plus haute passée sous le milieu de l'écran est l'étape active
    var etapes = document.querySelectorAll('.etapes-m li');
    var ecranM = document.getElementById('ecran-m');
    var adresse = document.getElementById('ecran-adresse');
    var ADRESSES = { 1: 'Notes du premier échange', 2: 'Maquette, premier jet', 3: 'Maquette, avec vos remarques', 4: 'Version finale', 5: 'www.votre-entreprise.fr' };
    if (etapes.length && ecranM) {
      var courant = null, prevu = false;
      var suivre = function () {
        prevu = false;
        var repere = window.innerHeight * 0.55, choisi = etapes[0];
        Array.prototype.forEach.call(etapes, function (e) { if (e.getBoundingClientRect().top < repere) choisi = e; });
        if (choisi === courant) return;
        courant = choisi;
        Array.prototype.forEach.call(etapes, function (e) { e.classList.toggle('actif', e === choisi); });
        var n = choisi.getAttribute('data-etape');
        ecranM.setAttribute('data-etape', n);
        if (adresse) adresse.textContent = ADRESSES[n];
      };
      window.addEventListener('scroll', function () { if (!prevu) { prevu = true; requestAnimationFrame(suivre); } }, { passive: true });
      window.addEventListener('resize', suivre);
      suivre();
    }

    // objets 3D animés en continu ; image fixe si le visiteur demande des animations réduites
    if (calme) Array.prototype.forEach.call(document.querySelectorAll('img[data-fixe]'), function (im) { im.src = im.getAttribute('data-fixe'); });
    // (ancien) objets 3D : l'animation ne joue qu'au survol
    if (!calme && window.matchMedia('(hover: hover)').matches) {
      Array.prototype.forEach.call(document.querySelectorAll('img[data-anim]'), function (im) {
        var cible = im.closest('.service, .carte-s') || im;
        var fixe = im.getAttribute('src'), anime = im.getAttribute('data-anim');
        cible.addEventListener('pointerenter', function () { im.setAttribute('src', anime); });
        cible.addEventListener('pointerleave', function () { im.setAttribute('src', fixe); });
      });
    }

    // page Contact : message pré-rempli avec le métier
    var message = document.getElementById('message');
    var metier = new URLSearchParams(window.location.search).get('metier');
    if (message && metier && LIBELLES[metier] && !message.value) {
      message.value = 'Bonjour, je suis ' + LIBELLES[metier] + ' et je voudrais voir une maquette de mon site.';
    }
  });
})();
