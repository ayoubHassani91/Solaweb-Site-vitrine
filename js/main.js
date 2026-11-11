/* DZ — Scripts du site en une page. JavaScript natif, aucune dépendance.
   Aucune donnée n'est envoyée ni enregistrée : le formulaire est une démonstration. */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  document.addEventListener('DOMContentLoaded', function () {
    // ----- Menu mobile -----
    var bouton = document.querySelector('.bouton-menu');
    var menu = document.getElementById('menu');
    if (bouton && menu) {
      bouton.addEventListener('click', function () {
        var ouvert = menu.classList.toggle('ouvert');
        bouton.setAttribute('aria-expanded', String(ouvert));
      });
      // Un clic sur un lien du menu referme le menu (téléphone)
      Array.prototype.forEach.call(menu.querySelectorAll('a'), function (a) {
        a.addEventListener('click', function () {
          menu.classList.remove('ouvert');
          bouton.setAttribute('aria-expanded', 'false');
        });
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menu.classList.contains('ouvert')) {
          menu.classList.remove('ouvert');
          bouton.setAttribute('aria-expanded', 'false');
          bouton.focus();
        }
      });
    }

    // ----- Lien du menu = section visible -----
    var liensMenu = {};
    Array.prototype.forEach.call(document.querySelectorAll('.menu a[href^="#"]:not(.bouton)'), function (a) {
      liensMenu[a.getAttribute('href').slice(1)] = a;
    });
    var marquer = function (id) {
      Object.keys(liensMenu).forEach(function (k) {
        if (k === id) { liensMenu[k].setAttribute('aria-current', 'true'); }
        else { liensMenu[k].removeAttribute('aria-current'); }
      });
    };
    if ('IntersectionObserver' in window) {
      var observateur = new IntersectionObserver(function (entrees) {
        entrees.forEach(function (e) { if (e.isIntersecting) marquer(e.target.id); });
      }, { rootMargin: '-40% 0px -55% 0px' });
      Object.keys(liensMenu).forEach(function (id) {
        var s = document.getElementById(id);
        if (s) observateur.observe(s);
      });
    }

    // ----- Fenêtres (options, mentions légales, confidentialité, conditions) -----
    Array.prototype.forEach.call(document.querySelectorAll('[data-dlg]'), function (declencheur) {
      declencheur.addEventListener('click', function () {
        var f = document.getElementById(declencheur.getAttribute('data-dlg'));
        if (f && typeof f.showModal === 'function') f.showModal();
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll('dialog.dlg'), function (f) {
      var fermer = f.querySelector('[data-close]');
      if (fermer) fermer.addEventListener('click', function () { f.close(); });
      f.addEventListener('click', function (e) { if (e.target === f) f.close(); });
    });

    // ----- Réalisations : aperçu interactif (ordinateur / téléphone, légère inclinaison) -----
    var cartes = document.querySelectorAll('.carte-real');
    var fenetre = document.getElementById('apercu');
    if (fenetre && typeof fenetre.showModal === 'function') {
      var infos = {
        beauty: { titre: 'Beauty Palace', texte: 'Un site de démonstration d\'institut de beauté : photos en grand, soins et tarifs, prise de rendez-vous.', images: { ordi: 'assets/demos/beauty-palace-ordi.jpg', tel: 'assets/demos/beauty-palace-tel.jpg' }, lien: 'beauty-palace/index.html' },
        eclat: { titre: 'Éclat Peinture 93', texte: 'Un site de démonstration de peintre en bâtiment : services, galerie de chantiers, avis et demande de devis.', images: { ordi: 'assets/demos/eclat-ordi.jpg', tel: 'assets/demos/eclat-tel.jpg' }, lien: 'eclat-peinture-93/index.html' },
        vermail: { titre: 'L\'Atelier Vermail', texte: 'Un site de démonstration de restaurant : ambiance sombre et dorée, carte, réservation.', images: { ordi: 'assets/demos/atelier-vermail-ordi.jpg', tel: 'assets/demos/atelier-vermail-tel.jpg' }, lien: 'atelier-vermail/index.html' }
      };
      var scene = document.getElementById('apercu-scene');
      var boutonsVue = fenetre.querySelectorAll('.bascule button');
      var choisirVue = function (vue) {
        scene.classList.toggle('tel', vue === 'tel');
        Array.prototype.forEach.call(boutonsVue, function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-vue') === vue)); });
      };
      Array.prototype.forEach.call(boutonsVue, function (b) {
        b.addEventListener('click', function () { choisirVue(b.getAttribute('data-vue')); });
      });
      // Ouvre la fenêtre d'aperçu d'une réalisation (appelée par le portable de la section Réalisations)
      window.DZ_apercu = function (cle, vue) {
        var info = infos[cle];
        if (!info) return;
        scene.innerHTML = '';
        scene.classList.add('photo');
        var o = document.createElement('div'); o.className = 'vue-ordi';
        var io = document.createElement('img'); io.src = info.images.ordi; io.alt = info.titre + ', affichage sur ordinateur'; o.appendChild(io);
        var p = document.createElement('div'); p.className = 'vue-tel';
        var ip = document.createElement('img'); ip.src = info.images.tel; ip.alt = info.titre + ', affichage sur téléphone'; p.appendChild(ip);
        scene.appendChild(o); scene.appendChild(p);
        var lien = document.getElementById('apercu-lien');
        if (info.lien) { lien.href = info.lien; lien.hidden = false; } else { lien.hidden = true; lien.removeAttribute('href'); }
        document.getElementById('apercu-titre').textContent = info.titre;
        document.getElementById('apercu-desc').textContent = info.texte;
        choisirVue(vue === 'tel' ? 'tel' : 'ordi');
        fenetre.showModal();
      };
      fenetre.querySelector('.fermer').addEventListener('click', function () { fenetre.close(); });
      fenetre.addEventListener('click', function (e) { if (e.target === fenetre) fenetre.close(); });
    }


    // ----- Formulaire de devis : démonstration, envoi simulé -----
    var form = document.getElementById('form-devis');
    if (!form) return;
    var retour = document.getElementById('retour-simule');
    var cadreChamps = form.querySelector('fieldset');
    form.noValidate = true;
    if (cadreChamps) cadreChamps.disabled = false;          // sans JavaScript, les champs restent inactifs : rien ne peut partir

    // Les boutons « Demander un devis » des formules présélectionnent la formule
    var choixFormule = form.elements['formule'];
    Array.prototype.forEach.call(document.querySelectorAll('[data-formule]'), function (lien) {
      lien.addEventListener('click', function () {
        if (!choixFormule) return;
        var valeur = lien.getAttribute('data-formule');
        if (choixFormule.options) {                          // liste déroulante (ancien formulaire)
          for (var i = 0; i < choixFormule.options.length; i++) {
            if (choixFormule.options[i].value === valeur) { choixFormule.selectedIndex = i; break; }
          }
        } else {                                             // boutons ronds (nouveau formulaire) : les formules de site correspondent à « Site web »
          Array.prototype.forEach.call(form.querySelectorAll('input[name="formule"]'), function (r) { if (r.value === 'site') r.checked = true; });
        }
      });
    });

    // Site en plusieurs pages : « contact.html?service=ia » présélectionne le service demandé
    var serviceDemande = /[?&]service=([a-z-]+)/.exec(window.location.search);
    if (serviceDemande) {
      Array.prototype.forEach.call(form.querySelectorAll('input[name="formule"]'), function (r) { if (r.value === serviceDemande[1]) r.checked = true; });
    }

    // ---- 1) Validation (indépendante de l'envoi : elle servira telle quelle le jour où un envoi réel sera activé) ----
    var LIMITES = { nom: 100, email: 254, telephone: 20, activite: 100, message: 2000 };
    var regles = {
      nom: function (v) { return v.length < 2 ? 'Indiquez votre nom ou celui de votre entreprise (2 caractères minimum).' : ''; },
      email: function (v) {
        if (!v) return 'Indiquez votre adresse e-mail.';
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'L\'adresse e-mail n\'est pas valide (exemple : nom@domaine.fr).';
      },
      telephone: function (v) {
        if (!v) return '';
        return /^[0-9 +().\-]{6,20}$/.test(v) && v.replace(/\D/g, '').length >= 6 ? '' : 'Le numéro n\'est pas valide : utilisez des chiffres, espaces ou +. Vous pouvez aussi laisser ce champ vide.';
      },
      activite: function (v) { return v.length < 2 ? 'Indiquez votre secteur d\'activité (2 caractères minimum).' : ''; },
      formule: function (v) { return v ? '' : 'Choisissez une formule, ou « Je ne sais pas encore ».'; },
      message: function (v) {
        if (v.length < 10) return 'Décrivez votre projet en quelques mots (10 caractères minimum).';
        return '';
      }
    };
    function lire(champ) {                                   // retire les espaces autour ; un champ d'espaces seuls devient vide
      if (champ.type === 'checkbox') return champ.checked;
      return String(champ.value).trim();
    }
    function verifier(champ) {
      var zone = document.getElementById('erreur-' + champ.name), msg = '';
      if (champ.name === 'consentement') msg = champ.checked ? '' : 'Cochez cette case pour continuer.';
      else if (regles[champ.name]) {
        var v = lire(champ);
        msg = LIMITES[champ.name] && v.length > LIMITES[champ.name] ? 'Texte trop long (' + LIMITES[champ.name] + ' caractères maximum).' : regles[champ.name](v);
      }
      champ.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (zone) zone.textContent = msg;
      return !msg;
    }
    function valider() {
      var premier = null, donnees = {};
      Array.prototype.forEach.call(form.elements, function (champ) {
        if (!champ.name) return;
        donnees[champ.name] = lire(champ);
        if (!verifier(champ) && !premier) premier = champ;
      });
      return { ok: !premier, premier: premier, donnees: donnees };
    }

    // ---- 2) Envoi : DÉSACTIVÉ. Il ne s'active que si les trois conditions ci-dessous sont remplies à la main ----
    var CONFIG = window.DZ_FORMULAIRE || { mode: 'demo', endpoint: '', receptionTestee: false };
    function envoiReelPossible() { return CONFIG.mode === 'actif' && CONFIG.receptionTestee === true && /^https:\/\//.test(CONFIG.endpoint || ''); }
    function envoyer(donnees) {
      if (!envoiReelPossible()) return Promise.resolve({ simule: true });   // démonstration : rien ne part, rien n'est enregistré
      return fetch(CONFIG.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(donnees) })
        .then(function (r) { if (!r.ok) throw new Error('refus ' + r.status); return { simule: false }; });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = valider();
      if (!v.ok) { retour.hidden = true; v.premier.focus(); return; }
      envoyer(v.donnees).then(function (res) {
        form.reset();
        Array.prototype.forEach.call(form.elements, function (c) { if (c.name) c.removeAttribute('aria-invalid'); });
        retour.querySelector('p').innerHTML = res.simule
          ? '<strong>Envoi simulé.</strong> Aucune donnée n\'a été transmise ni enregistrée.'
          : '<strong>Demande envoyée.</strong> Nous revenons vers vous.';
        retour.hidden = false; retour.focus();
      }).catch(function () {
        retour.querySelector('p').innerHTML = '<strong>L\'envoi a échoué.</strong> Votre demande n\'a pas été transmise ; réessayez plus tard.';
        retour.hidden = false; retour.focus();
      });
    });

    form.addEventListener('input', function (e) {
      if (e.target.name && e.target.getAttribute('aria-invalid') === 'true') verifier(e.target);
    });
  });
})();