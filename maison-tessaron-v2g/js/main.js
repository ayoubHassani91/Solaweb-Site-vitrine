// Atelier Vermeil v2 — concept de démonstration. JavaScript natif, sans dépendance.
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Apparition progressive (le contenu reste visible sans JavaScript ou si les animations sont réduites)
  if (!reduce && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        // visible, ou déjà dépassé par un défilement rapide : on l'affiche
        if (en.isIntersecting || en.boundingClientRect.top < 0) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    document.querySelectorAll('.entete > *, .carte, .pourquoi > *:not(img), .etapes li, .piste > li, .contact > *, .cta-band > *, .notice, .bande figure, .sec-in > h2, .sec-in > p.muted').forEach(function (el) {
      var i = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.setProperty('--d', Math.min(i, 5) * 0.05 + 's');
      el.classList.add('rv');
      io.observe(el);
    });
  }

  // Menu mobile
  var btn = document.querySelector('.menu-btn');
  var menu = document.getElementById('menu');
  if (btn && menu) {
    var close = function () { menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); btn.textContent = 'Menu'; };
    btn.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Fermer' : 'Menu';
    });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('open')) { close(); btn.focus(); } });
  }

  // Défilement des projets
  var piste = document.querySelector('[data-piste]');
  if (piste) {
    document.querySelectorAll('[data-dir]').forEach(function (b) {
      b.addEventListener('click', function () {
        var first = piste.querySelector('li');
        var step = first ? first.getBoundingClientRect().width + 24 : 320;
        piste.scrollBy({ left: Number(b.dataset.dir) * step, behavior: reduce ? 'auto' : 'smooth' });
      });
    });
  }

  // Formulaire de démonstration : validation, aucun envoi
  var form = document.querySelector('[data-demo-form]');
  if (form) {
    var status = document.getElementById('form-status');
    var rules = {
      nom: function (v) { return v.trim().length > 1 ? '' : 'Indiquez votre nom.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Indiquez une adresse e-mail valide.'; },
      travaux: function (v) { return v ? '' : 'Choisissez un type de travaux.'; },
      message: function (v) { return v.trim().length > 9 ? '' : 'Décrivez brièvement votre projet (10 caractères minimum).'; }
    };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true, firstBad = null;
      Object.keys(rules).forEach(function (name) {
        var field = form.elements[name];
        var msg = rules[name](field.value);
        document.getElementById('err-' + name).textContent = msg;
        field.setAttribute('aria-invalid', msg ? 'true' : 'false');
        if (msg) { ok = false; if (!firstBad) firstBad = field; }
      });
      if (!ok) { status.hidden = true; firstBad.focus(); return; }
      status.hidden = false;
      status.textContent = 'Démonstration : le formulaire est valide mais aucune demande n’a été envoyée. Ce site est un concept.';
      form.reset();
    });
  }

  // Pêle-mêle : photos déplaçables à la souris, au doigt ou au clavier ; reflet de verre qui suit le pointeur
  var pm = document.querySelector('[data-pm]');
  if (pm) {
    var zTop = 10;
    var cards = pm.querySelectorAll('.pm-card');
    var num = function (el, prop) { return parseFloat(el.style.getPropertyValue(prop)) || 0; };
    var front = function (c) { zTop += 1; c.style.setProperty('--z', zTop); };
    var clampMove = function (c, dx, dy) {
      var maxX = pm.clientWidth - c.offsetWidth - c.offsetLeft;
      var maxY = pm.clientHeight - c.offsetHeight - c.offsetTop;
      return [Math.max(-c.offsetLeft, Math.min(maxX, dx)), Math.max(-c.offsetTop, Math.min(maxY, dy))];
    };
    var place = function (c, dx, dy) {
      var p = clampMove(c, dx, dy);
      c.style.setProperty('--dx', p[0] + 'px');
      c.style.setProperty('--dy', p[1] + 'px');
    };
    cards.forEach(function (c) {
      var sx = 0, sy = 0, bx = 0, by = 0, dragging = false;
      c.addEventListener('pointerdown', function (e) {
        if (e.button > 0) return;
        dragging = true; c.setPointerCapture(e.pointerId);
        sx = e.clientX; sy = e.clientY; bx = num(c, '--dx'); by = num(c, '--dy');
        front(c); c.classList.add('drag'); pm.classList.add('used');
      });
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty('--lx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        c.style.setProperty('--ly', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
        if (dragging) place(c, bx + e.clientX - sx, by + e.clientY - sy);
      });
      var end = function () { dragging = false; c.classList.remove('drag'); };
      c.addEventListener('pointerup', end);
      c.addEventListener('pointercancel', end);
      c.addEventListener('keydown', function (e) {
        var step = e.shiftKey ? 72 : 24, dx = num(c, '--dx'), dy = num(c, '--dy');
        if (e.key === 'ArrowLeft') dx -= step;
        else if (e.key === 'ArrowRight') dx += step;
        else if (e.key === 'ArrowUp') dy -= step;
        else if (e.key === 'ArrowDown') dy += step;
        else if (e.key === 'Escape') { c.style.setProperty('--dx', '0px'); c.style.setProperty('--dy', '0px'); return; }
        else if (e.key === 'Enter' || e.key === ' ') { front(c); e.preventDefault(); return; }
        else return;
        e.preventDefault(); front(c); pm.classList.add('used'); place(c, dx, dy);
      });
    });
    var reset = pm.querySelector('[data-pm-reset]');
    if (reset) reset.addEventListener('click', function () {
      cards.forEach(function (c) { c.style.setProperty('--dx', '0px'); c.style.setProperty('--dy', '0px'); });
    });
  }
  // Héros : 3 photos en fondu enchaîné ; points pour choisir ; pause au survol, au focus et onglet masqué ; pas de défilement auto si animations réduites
  var fondu = document.querySelector('[data-fondu]');
  if (fondu) {
    var slides = fondu.querySelectorAll('.fondu-slide');
    var dots = document.querySelectorAll('[data-fondu-dot]');
    var capEl = document.querySelector('[data-fondu-cap]');
    var caps = Array.prototype.map.call(dots, function (d) { return d.getAttribute('aria-label').replace(/^Photo \d+ sur \d+ : /, ''); });
    var cur = 0, timer = null;
    var show = function (i) {
      cur = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle('is-on', k === cur); });
      dots.forEach(function (d, k) { if (k === cur) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
      if (capEl) capEl.textContent = caps[cur];
    };
    var stop = function () { if (timer) { clearInterval(timer); timer = null; } };
    var start = function () { if (reduce || timer || document.hidden) return; timer = setInterval(function () { show(cur + 1); }, 3500); };
    dots.forEach(function (d, k) { d.addEventListener('click', function () { show(k); stop(); start(); }); });
    var hero = fondu.closest('.hero');
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    hero.addEventListener('focusin', stop);
    hero.addEventListener('focusout', start);
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
    start();
  }
  // Adaptation à la taille de la fenêtre (ordinateur) : la page est conçue pour 1366 x 720 px et se réduit si la fenêtre est plus petite
  var fitMq = window.matchMedia('(min-width: 900px) and (min-height: 460px)');
  var applyZoom = function () {
    var z = 1;
    if (fitMq.matches) { z = Math.min(1, window.innerWidth / 1366, window.innerHeight / 720); if (z > 0.995) z = 1; }
    document.documentElement.style.setProperty('--z', z.toFixed(3));
  };
  applyZoom();
  window.addEventListener('resize', applyZoom);
  window.addEventListener('load', applyZoom);
  setTimeout(applyZoom, 250);

  // Défilement : premier écran complet (comme avant), puis les autres sections en dessous
  (function () {
    var secs = document.querySelectorAll('main > .sec.fit-hide');
    var foot = document.querySelector('footer.foot');
    var main = document.querySelector('main');
    if (!secs.length || !foot || !main) return;
    var demo = document.querySelector('.demo'), wrap = document.querySelector('.hero-wrap');
    var screen = document.createElement('div'); screen.className = 'screen';
    var plus = document.createElement('div'); plus.className = 'plus';
    var foot2 = foot.cloneNode(true); foot2.classList.add('foot-full');
    var placed = false;
    var arrange = function () {
      if (fitMq.matches && !placed) {
        demo.parentNode.insertBefore(screen, demo);
        [demo, wrap, main, foot].forEach(function (n) { screen.appendChild(n); });
        screen.parentNode.insertBefore(plus, screen.nextSibling);
        secs.forEach(function (s) { plus.appendChild(s); });
        plus.appendChild(foot2);
        placed = true;
      } else if (!fitMq.matches && placed) {
        secs.forEach(function (s) { main.appendChild(s); });
        screen.parentNode.insertBefore(demo, screen); screen.parentNode.insertBefore(wrap, screen);
        screen.parentNode.insertBefore(main, screen); screen.parentNode.insertBefore(foot, screen);
        screen.remove(); plus.remove(); placed = false;
      }
      if (typeof refresh === 'function') refresh();
    };
    arrange();
    if (fitMq.addEventListener) fitMq.addEventListener('change', arrange); else fitMq.addListener(arrange);
  })();
  // Pages légales : rubriques en onglets (une à la fois), sans défilement
  var legal = document.querySelector('.legal');
  if (legal) {
    var heads = legal.querySelectorAll('h2');
    var panels = [];
    heads.forEach(function (h, i) {
      var panel = document.createElement('div');
      panel.className = 'legal-panel';
      panel.id = 'legal-p' + i;
      panel.setAttribute('role', 'tabpanel');
      var node = h, group = [];
      while (node && (node === h || node.tagName !== 'H2')) { group.push(node); node = node.nextElementSibling; }
      h.parentNode.insertBefore(panel, h);
      group.forEach(function (n) { panel.appendChild(n); });
      panels.push(panel);
    });
    var box = legal.querySelector('.legal-box');
    var tabs = document.createElement('div');
    tabs.className = 'legal-tabs'; tabs.setAttribute('role', 'tablist'); tabs.setAttribute('aria-label', 'Rubriques');
    var short = function (txt) { return txt.replace(/^Assurances et garanties$/, 'Assurances').replace(/^Médiation de la consommation$/, 'Médiation').replace(/^Propriété intellectuelle$/, 'Propriété').replace(/^Responsable du traitement$/, 'Responsable').replace(/^Finalité et base légale$/, 'Finalité').replace(/^Durée de conservation$/, 'Conservation').replace(/^Données collectées$/, 'Données').replace(/^Données personnelles$/, 'Données perso.'); };
    var select = function (k, focus) {
      panels.forEach(function (p, i) { p.hidden = i !== k; });
      Array.prototype.forEach.call(tabs.children, function (b, i) { b.setAttribute('aria-selected', String(i === k)); b.tabIndex = i === k ? 0 : -1; });
      if (focus) tabs.children[k].focus();
    };
    heads.forEach(function (h, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'legal-tab'; b.setAttribute('role', 'tab');
      b.setAttribute('aria-controls', 'legal-p' + i); b.textContent = short(panels[i].querySelector('h2').textContent);
      b.addEventListener('click', function () { select(i, false); });
      b.addEventListener('keydown', function (e) {
        var k = null, n = panels.length;
        if (e.key === 'ArrowRight') k = (i + 1) % n; else if (e.key === 'ArrowLeft') k = (i - 1 + n) % n; else if (e.key === 'Home') k = 0; else if (e.key === 'End') k = n - 1;
        if (k !== null) { e.preventDefault(); select(k, true); }
      });
      tabs.appendChild(b);
    });
    if (box) box.parentNode.insertBefore(tabs, box.nextSibling); else legal.insertBefore(tabs, panels[0]);
    select(0, false);
  }
  // Boutons Monter / Descendre (en plus de la barre de défilement)
  var nav2 = document.createElement('nav');
  nav2.className = 'scroll-nav'; nav2.setAttribute('aria-label', 'Défilement de la page'); nav2.hidden = true;
  nav2.innerHTML = '<button type="button" class="scroll-btn" data-up aria-label="Monter dans la page"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg></button><button type="button" class="scroll-btn" data-down aria-label="Descendre dans la page"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>';
  document.body.appendChild(nav2);
  var upB = nav2.querySelector('[data-up]'), downB = nav2.querySelector('[data-down]');
  var refresh = function () {
    var de = document.documentElement;
    var max = de.scrollHeight - window.innerHeight;
    nav2.hidden = max < 40;
    upB.disabled = window.scrollY < 8;
    downB.disabled = window.scrollY > max - 8;
  };
  var go = function (dir) {
    window.scrollBy({ top: dir * Math.round(window.innerHeight * 0.85), behavior: reduce ? 'auto' : 'smooth' });
  };
  upB.addEventListener('click', function () { go(-1); });
  downB.addEventListener('click', function () { go(1); });
  window.addEventListener('scroll', refresh, { passive: true });
  window.addEventListener('resize', refresh);
  window.addEventListener('load', refresh);
  setTimeout(refresh, 300);
  refresh();})();

