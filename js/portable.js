/* DZ — Réalisations : un portable et un téléphone qui montrent toujours le même projet.
   Défilement automatique : le site du portable se défait en particules qui volent jusqu'au téléphone,
   où le même projet apparaît en version mobile. Un clic sur un projet change les deux appareils tout de suite.
   JavaScript natif, aucune dépendance, aucun service externe, aucune lecture de pixels (marche aussi en double-clic sur le fichier).
   Tout le calcul graphique s'arrête quand : Pause est active, la scène n'est pas à l'écran, l'onglet est masqué,
   un aperçu est ouvert, ou le clavier est dans les commandes. Avec « réduire les animations » : présentation fixe, sans mouvement automatique. */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var scene = document.getElementById('scene-portable');
    if (!scene) return;

    var section = document.getElementById('realisations');
    var cadre = document.getElementById('portable');
    var stage = document.getElementById('stage');
    var vitre = document.getElementById('vitre');
    var cv = document.getElementById('vitre-canvas');
    var cx = cv.getContext('2d');
    var vitreT = document.getElementById('vitre-tel');
    var cvT = document.getElementById('vitre-tel-canvas');
    var cxT = cvT.getContext('2d');
    var pc = document.getElementById('particules');
    var px = pc.getContext('2d');
    var imgs = Array.prototype.slice.call(vitre.querySelectorAll('.demo'));
    var imgsT = Array.prototype.slice.call(vitreT.querySelectorAll('.demo-tel'));
    var boutons = Array.prototype.slice.call(document.querySelectorAll('.selecteur button'));
    var btnApercu = document.getElementById('ouvrir-apercu');
    var btnPause = document.getElementById('pause-real');
    var annonce = document.getElementById('annonce-real');
    var cles = imgs.map(function (i) { return i.getAttribute('data-projet'); });
    var titres = { beauty: 'Beauty Palace', eclat: 'Éclat Peinture 93', vermail: 'L\'Atelier Vermail' };
    var mqCalme = window.matchMedia('(prefers-reduced-motion: reduce)');
    var calme = mqCalme.matches;
    var tactile = window.matchMedia('(hover: none)').matches;

    // ---------- Géométrie : coins des écrans dans la photo (1755 × 896), perspective ----------
    var LQ = [[95, 58], [1201.5, 71], [1233, 699], [127, 713.5]];        // portable : haut-gauche, haut-droit, bas-droit, bas-gauche
    var PQ = [[1340, 100], [1680.5, 96], [1680.5, 788.5], [1340, 784]];  // téléphone
    var LW = 960, LH = 558, TW = 300, TH = 608;                          // taille locale des deux écrans avant déformation
    var VIS_W = 1690, VIS_X = 40, VIS_Y = 0;                             // fenêtre visible sur la photo

    function resoudre(A, b) {
      var n = b.length, i, j, k;
      for (i = 0; i < n; i++) {
        var max = i;
        for (j = i + 1; j < n; j++) if (Math.abs(A[j][i]) > Math.abs(A[max][i])) max = j;
        var tmp = A[i]; A[i] = A[max]; A[max] = tmp; var tb = b[i]; b[i] = b[max]; b[max] = tb;
        for (j = i + 1; j < n; j++) {
          var f = A[j][i] / A[i][i];
          for (k = i; k < n; k++) A[j][k] -= f * A[i][k];
          b[j] -= f * b[i];
        }
      }
      var x = new Array(n);
      for (i = n - 1; i >= 0; i--) {
        var s = b[i];
        for (j = i + 1; j < n; j++) s -= A[i][j] * x[j];
        x[i] = s / A[i][i];
      }
      return x;
    }
    function matriceQuad(w, h, q) {
      var src = [[0, 0], [w, 0], [w, h], [0, h]], A = [], b = [], i;
      for (i = 0; i < 4; i++) {
        var x = src[i][0], y = src[i][1], X = q[i][0], Y = q[i][1];
        A.push([x, y, 1, 0, 0, 0, -x * X, -y * X]); b.push(X);
        A.push([0, 0, 0, x, y, 1, -x * Y, -y * Y]); b.push(Y);
      }
      var m = resoudre(A, b);
      return 'matrix3d(' + [m[0], m[3], 0, m[6], m[1], m[4], 0, m[7], 0, 0, 1, 0, m[2], m[5], 0, 1].join(',') + ')';
    }
    vitre.style.transform = matriceQuad(LW, LH, LQ);
    vitreT.style.transform = matriceQuad(TW, TH, PQ);

    // La scène s'adapte à la largeur réellement disponible (et non plus seulement à la hauteur de la fenêtre)
    function poserScene() {
      var k = cadre.offsetWidth / VIS_W;
      if (!k) return;
      stage.style.transform = 'scale(' + k + ') translate(' + (-VIS_X) + 'px,' + (-VIS_Y) + 'px)';
    }
    poserScene();
    if ('ResizeObserver' in window) new ResizeObserver(poserScene).observe(scene);
    window.addEventListener('load', poserScene);

    // ---------- Couleurs des particules : palettes précalculées (aucune lecture de pixels) ----------
    var palettes = {};
    (function () {
      var P = window.DZ_PALETTES;
      if (!P) return;
      Object.keys(P).forEach(function (k) {
        if (typeof P[k] !== 'string') return;
        try {
          var bin = atob(P[k]), a = new Uint8Array(bin.length);
          for (var i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
          palettes[k] = a;
        } catch (e) { /* palette illisible : couleur de marque par défaut */ }
      });
    })();
    function couleurPalette(cle, u, v) {
      var p = palettes[cle], P = window.DZ_PALETTES;
      if (!p || !P) return [7, 114, 197];
      var i = Math.min(P.largeur - 1, Math.floor(u * P.largeur)), j = Math.min(P.hauteur - 1, Math.floor(v * P.hauteur));
      var o = (j * P.largeur + i) * 3;
      return [p[o], p[o + 1], p[o + 2]];
    }

    // ---------- État ----------
    var courant = 0;                        // projet affiché sur le portable ET le téléphone (hors transition)
    var enPause = false, visible = false, ouvert = false, dialogue = false, clavierDans = false;
    var fondSeul = false;                   // vrai si le navigateur ne sait pas faire l'effet : on passe à un simple fondu
    var tPret = Infinity;                   // moment où le prochain changement automatique démarre
    var anim = null, parts = null;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    var CHARGE = 450;          // ms : montée en puissance de l'écran
    var VAGUE = 1500;          // ms : le site se défait de gauche à droite
    var PAUSE_ENTRE = 3000;    // ms : temps d'affichage de chaque projet

    // Horloge virtuelle : elle n'avance que lorsque la scène tourne vraiment (Pause = tout est figé, puis reprend au même endroit)
    var horloge = function () { return performance.now(); };
    var decalage = 0, tSusp = horloge();
    function maintenant() { return horloge() - decalage; }

    function rnd() { return Math.random(); }
    function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

    function dessinerCover(ctx, img, w, h) {
      var iw = img.naturalWidth || 1, ih = img.naturalHeight || 1;
      var s = Math.max(w / iw, h / ih);
      ctx.drawImage(img, (w - iw * s) / 2, 0, iw * s, ih * s); // aligné en haut, comme à l'écran
    }
    function prete(im) { return !!(im && im.complete && im.naturalWidth > 0); }
    function annoncer(txt) { if (annonce) annonce.textContent = txt; }
    function marquerBouton(i) { boutons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-projet') === cles[i])); }); }
    function afficherLaptop(i) { imgs.forEach(function (im, k) { im.classList.toggle('actif', k === i); }); }
    function afficherTel(i) { imgsT.forEach(function (im, k) { im.classList.toggle('actif', k === i); }); }

    // ---------- Aides graphiques ----------
    var sprite = (function () {
      var c = document.createElement('canvas'); c.width = c.height = 64;
      var g = c.getContext('2d');
      var gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(255,255,255,1)');
      gr.addColorStop(0.25, 'rgba(196,181,253,0.9)');
      gr.addColorStop(0.6, 'rgba(109,58,224,0.35)');
      gr.addColorStop(1, 'rgba(109,58,224,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
      return c;
    })();

    function dimensionnerParticules() {
      var r = pc.getBoundingClientRect();
      var w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
      if (pc.width !== Math.round(w * dpr) || pc.height !== Math.round(h * dpr)) {
        pc.width = Math.round(w * dpr); pc.height = Math.round(h * dpr);
      }
      px.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w: w, h: h, r: r };
    }

    function coinsDe(el, rRef) {
      var s = el.querySelectorAll('.sonde');
      var g = function (e) { var r = e.getBoundingClientRect(); return [r.left + r.width / 2 - rRef.left, r.top + r.height / 2 - rRef.top]; };
      return { hg: g(s[0]), hd: g(s[1]), bg: g(s[2]), bd: g(s[3]) };
    }
    function projeter(c, u, v) {
      var ax = c.hg[0] + (c.hd[0] - c.hg[0]) * u, ay = c.hg[1] + (c.hd[1] - c.hg[1]) * u;
      var bx = c.bg[0] + (c.bd[0] - c.bg[0]) * u, by = c.bg[1] + (c.bd[1] - c.bg[1]) * u;
      return [ax + (bx - ax) * v, ay + (by - ay) * v];
    }

    // ---------- Particules ----------
    var MAX_SPARK = 150;
    function creerParticules(cap) {
      var cols = [];
      for (var q = 0; q < 216; q++) {
        var qr = Math.floor(q / 36), qg = Math.floor((q % 36) / 6), qb = q % 6;
        cols.push('rgb(' + Math.round(qr * 51) + ',' + Math.round(qg * 51) + ',' + Math.round(qb * 51) + ')');
      }
      var F = function () { return new Float32Array(cap); };
      return {
        n: 0, cap: cap, vol: 0, cols: cols, sp: [],
        x: F(), y: F(), x0: F(), y0: F(), mx: F(), my: F(), tu: F(), tv: F(), vx: F(), vy: F(),
        age: F(), vie: F(), t0: F(), t1: F(), ph: F(),
        seau: new Uint8Array(cap), cible: new Int32Array(cap)
      };
    }
    function copier(p, l, i) {
      p.x[i] = p.x[l]; p.y[i] = p.y[l]; p.x0[i] = p.x0[l]; p.y0[i] = p.y0[l]; p.mx[i] = p.mx[l]; p.my[i] = p.my[l];
      p.tu[i] = p.tu[l]; p.tv[i] = p.tv[l]; p.vx[i] = p.vx[l]; p.vy[i] = p.vy[l]; p.age[i] = p.age[l]; p.vie[i] = p.vie[l];
      p.t0[i] = p.t0[l]; p.t1[i] = p.t1[l]; p.ph[i] = p.ph[l]; p.seau[i] = p.seau[l]; p.cible[i] = p.cible[l];
    }

    // ---------- Préparer un changement automatique : l'ancien site se défait, le téléphone se prépare ----------
    function preparer(de, vers) {
      var bw = Math.round(vitre.clientWidth * dpr), bh = Math.round(vitre.clientHeight * dpr);
      cv.width = bw; cv.height = bh;
      cx.setTransform(1, 0, 0, 1, 0, 0);
      var src = document.createElement('canvas'); src.width = bw; src.height = bh;       // l'ancien site, intact
      var sx = src.getContext('2d');
      sx.fillStyle = '#000'; sx.fillRect(0, 0, bw, bh);
      dessinerCover(sx, imgs[de], bw, bh);
      var ers = document.createElement('canvas'); ers.width = bw; ers.height = bh;       // cellules déjà envolées
      var ex = ers.getContext('2d'); ex.fillStyle = '#000';

      var cs = Math.max(3, Math.round(bw / (tactile ? 70 : 130)));
      var nx = Math.ceil(bw / cs), ny = Math.ceil(bh / cs), n = nx * ny;
      var rel = new Float32Array(n), couleurs = new Uint8Array(n * 3), ordre = new Array(n);
      for (var j = 0; j < ny; j++) {
        for (var i = 0; i < nx; i++) {
          var k = j * nx + i;
          var u = i / nx, v = j / ny;
          var c = couleurPalette(cles[de], (i + 0.5) / nx, (j + 0.5) / ny);
          couleurs[k * 3] = c[0]; couleurs[k * 3 + 1] = c[1]; couleurs[k * 3 + 2] = c[2];
          rel[k] = clamp(u * 0.86 + v * 0.06 + (rnd() - 0.5) * 0.22 + Math.sin(v * 9 + u * 5) * 0.025, 0, 1);
          ordre[k] = k;
        }
      }
      ordre.sort(function (a, b) { return rel[a] - rel[b]; });

      // Le téléphone : version mobile du NOUVEAU projet, découpée en cellules qui se remplissent de haut en bas
      var bwT = Math.round(vitreT.clientWidth * dpr), bhT = Math.round(vitreT.clientHeight * dpr);
      cvT.width = bwT; cvT.height = bhT;
      cxT.setTransform(1, 0, 0, 1, 0, 0);
      cxT.clearRect(0, 0, bwT, bhT);
      var off = document.createElement('canvas'); off.width = bwT; off.height = bhT;
      var ox = off.getContext('2d');
      ox.fillStyle = '#000'; ox.fillRect(0, 0, bwT, bhT);
      dessinerCover(ox, imgsT[vers], bwT, bhT);
      var csT = Math.max(3, Math.round(bwT / 50));
      var nxT = Math.ceil(bwT / csT), nyT = Math.ceil(bhT / csT), nT = nxT * nyT;
      var ordreT = new Array(nT), cle = new Float32Array(nT);
      for (var m = 0; m < nT; m++) { ordreT[m] = m; cle[m] = ((m / nxT) | 0) / nyT + (rnd() - 0.5) * 0.12; }
      ordreT.sort(function (a, b) { return cle[a] - cle[b]; });

      return {
        de: de, vers: vers,
        bw: bw, bh: bh, cs: cs, nx: nx, ny: ny, n: n, rel: rel, ordre: ordre, ptr: 0, couleurs: couleurs, src: src, ers: ers, ex: ex,
        T: { off: off, cs: csT, nx: nxT, ny: nyT, n: nT, ordre: ordreT, ptr: 0 },
        pVol: Math.min(1, nT / n * 1.08),
        t0: maintenant(), tFinVague: null, tFinVol: null, eteint: false, coinsT: null
      };
    }

    function lancer(vers) {
      var de = courant;
      if (!imgs.every(prete) || !imgsT.every(prete)) throw new Error('images pas encore chargées');
      anim = preparer(de, vers);
      var cap = anim.n + MAX_SPARK;
      if (!parts || parts.cap < cap) parts = creerParticules(cap);
      parts.n = 0; parts.vol = 0; parts.sp.length = 0;
      afficherLaptop(vers);                 // le nouveau site est déjà là, sous l'ancien qui va se défaire : aucun noir
      courant = vers; marquerBouton(vers);
      cv.style.visibility = 'visible';
      cx.drawImage(anim.src, 0, 0);
    }

    function liberer(a, tNow, rRef) {
      var front = (tNow - a.t0 - CHARGE) / VAGUE;
      if (front < 0) return;
      var seuil = front * 1.08;
      var cL = coinsDe(vitre, rRef);
      var echelle = Math.hypot(cL.hd[0] - cL.hg[0], cL.hd[1] - cL.hg[1]) / a.bw;
      var cT = a.coinsT;
      var echelleT = Math.hypot(cT.hd[0] - cT.hg[0], cT.hd[1] - cT.hg[1]) / (a.T.nx * a.T.cs);
      var bw = a.bw, cs = a.cs, nx = a.nx, T = a.T;
      var echelleScene = Math.hypot((cT.hg[0] + cT.bd[0]) / 2 - (cL.hg[0] + cL.bd[0]) / 2, (cT.hg[1] + cT.bd[1]) / 2 - (cL.hg[1] + cL.bd[1]) / 2) * 0.5;
      while (a.ptr < a.n && a.rel[a.ordre[a.ptr]] <= seuil) {
        var k = a.ordre[a.ptr++];
        var ci = k % nx, cj = (k / nx) | 0;
        a.ex.fillRect(ci * cs, cj * cs, cs, cs);       // la cellule disparaît de l'écran du portable
        var vole = T.ptr < T.n && rnd() < a.pVol;
        if (!vole && rnd() > 0.1) continue;            // une partie des cellules s'envole simplement avec le vent
        if (parts.n >= parts.cap - MAX_SPARK) continue;
        var u = (ci + 0.5) / nx, v = (cj + 0.5) / a.ny;
        var p0 = projeter(cL, u, v);
        var i = parts.n++;
        var r = a.couleurs[k * 3], g = a.couleurs[k * 3 + 1], b = a.couleurs[k * 3 + 2];
        var lum = (r + g + b) / 3;
        if (lum > 215) { r = r * 0.62 + 7 * 0.38; g = g * 0.62 + 114 * 0.38; b = b * 0.62 + 197 * 0.38; }
        r = r * 0.9 + 6 * 0.1; g = g * 0.9 + 23 * 0.1; b = b * 0.9 + 50 * 0.1;
        parts.seau[i] = Math.round(r / 51) * 36 + Math.round(g / 51) * 6 + Math.round(b / 51);
        parts.x[i] = parts.x0[i] = p0[0] + (rnd() - 0.5) * 1.2; parts.y[i] = parts.y0[i] = p0[1] + (rnd() - 0.5) * 1.2;
        parts.age[i] = 0; parts.ph[i] = rnd() * 6.283;
        parts.t0[i] = Math.max(1.6, cs * echelle * (0.85 + rnd() * 0.5));
        if (vole) {
          var kT = T.ordre[T.ptr++];
          parts.cible[i] = kT;
          parts.tu[i] = ((kT % T.nx) + 0.5) / T.nx; parts.tv[i] = (((kT / T.nx) | 0) + 0.5) / T.ny;
          parts.vie[i] = 0.9 + rnd() * 1.0;
          parts.t1[i] = Math.max(1.3, T.cs * echelleT * (0.9 + rnd() * 0.4));
          var arche = (0.1 + rnd() * 0.22) * echelleScene;     // arc de vol : point de contrôle décalé vers le haut et de côté
          parts.mx[i] = (rnd() - 0.5) * 0.18 * echelleScene; parts.my[i] = -arche;
          parts.vol++;
        } else {
          parts.cible[i] = -1;
          parts.vx[i] = 70 + 330 * Math.pow(rnd(), 1.8); parts.vy[i] = (rnd() - 0.62) * 150;
          parts.vie[i] = 1.5 + rnd() * 1.6; parts.t1[i] = parts.t0[i];
        }
        if (parts.sp.length < MAX_SPARK && rnd() < 0.012) {
          var q = projeter(cT, 0.2 + rnd() * 0.6, 0.1 + rnd() * 0.8);
          parts.sp.push({ x0: p0[0], y0: p0[1], x: p0[0], y: p0[1], tx: q[0], ty: q[1], mx: (rnd() - 0.5) * 60, my: -(30 + rnd() * 90), age: 0, vie: 1.0 + rnd() * 0.9, t: 12 + rnd() * 22 });
        }
      }
      // l'ancien site, moins les cellules déjà parties
      cx.globalCompositeOperation = 'source-over';
      cx.clearRect(0, 0, a.bw, a.bh);
      cx.drawImage(a.src, 0, 0);
      cx.globalCompositeOperation = 'destination-out';
      cx.drawImage(a.ers, 0, 0);
      // barre de lumière du front de l'onde
      var xf = clamp(front * 1.08 * 0.86, 0, 1) * a.bw;
      var gr = cx.createLinearGradient(xf - 60 * dpr, 0, xf + 14 * dpr, 0);
      gr.addColorStop(0, 'rgba(196,181,253,0)');
      gr.addColorStop(0.7, 'rgba(196,181,253,0.55)');
      gr.addColorStop(0.92, 'rgba(255,255,255,0.95)');
      gr.addColorStop(1, 'rgba(255,255,255,0)');
      cx.globalCompositeOperation = 'source-atop';
      cx.fillStyle = gr; cx.fillRect(xf - 60 * dpr, 0, 74 * dpr, a.bh);
      cx.globalCompositeOperation = 'source-over';
      if (a.ptr >= a.n && a.tFinVague === null) a.tFinVague = tNow;
    }

    function atterrir(a, kT) {
      var T = a.T, ci = kT % T.nx, cj = (kT / T.nx) | 0;
      var x = ci * T.cs, y = cj * T.cs;
      cxT.drawImage(T.off, x, y, T.cs, T.cs, x, y, T.cs, T.cs);
    }

    function majParticules(dt, t, a, cT) {
      var p = parts; if (!p) return;
      var i = 0;
      while (i < p.n) {
        p.age[i] += dt;
        var c = p.cible[i];
        if (c >= 0) {
          var pe = p.age[i] / p.vie[i];
          if (pe >= 1) {
            if (a) atterrir(a, c);
            p.vol--; var l = --p.n; if (l !== i) copier(p, l, i);
            continue;
          }
          var e = pe * pe * (3 - 2 * pe);
          var tg = projeter(cT, p.tu[i], p.tv[i]);
          var mx = (p.x0[i] + tg[0]) / 2 + p.mx[i], my = (p.y0[i] + tg[1]) / 2 + p.my[i];
          var u1 = 1 - e;
          var sw = Math.sin(p.age[i] * 9 + p.ph[i]) * (1 - e) * 6;
          p.x[i] = u1 * u1 * p.x0[i] + 2 * u1 * e * mx + e * e * tg[0] + sw;
          p.y[i] = u1 * u1 * p.y0[i] + 2 * u1 * e * my + e * e * tg[1] + sw * 0.6;
          i++;
        } else {
          if (p.age[i] >= p.vie[i]) { var l2 = --p.n; if (l2 !== i) copier(p, l2, i); continue; }
          var x = p.x[i], y = p.y[i];
          var ax = 120 + 70 * Math.sin(y * 0.018 + t * 2.1 + p.ph[i]);
          var ay = -34 + 90 * Math.cos(x * 0.016 + t * 1.6 + p.ph[i] * 1.3);
          var vx = p.vx[i] + ax * dt, vy = p.vy[i] + ay * dt;
          var fr = Math.exp(-0.55 * dt);
          vx *= fr; vy *= fr;
          p.vx[i] = vx; p.vy[i] = vy;
          p.x[i] = x + vx * dt; p.y[i] = y + vy * dt;
          i++;
        }
      }
      var s = p.sp;
      for (var k = s.length - 1; k >= 0; k--) {
        var o = s[k]; o.age += dt;
        if (o.age >= o.vie) { s.splice(k, 1); continue; }
        var pe2 = o.age / o.vie, e2 = pe2 * pe2 * (3 - 2 * pe2), w = 1 - e2;
        o.x = w * w * o.x0 + 2 * w * e2 * ((o.x0 + o.tx) / 2 + o.mx) + e2 * e2 * o.tx;
        o.y = w * w * o.y0 + 2 * w * e2 * ((o.y0 + o.ty) / 2 + o.my) + e2 * e2 * o.ty;
      }
    }

    function dessinerParticules(dim) {
      px.clearRect(0, 0, dim.w, dim.h);
      var p = parts; if (!p) return;
      var arc = p.n < 7000, lastSeau = -1;
      for (var i = 0; i < p.n; i++) {
        var a, sz;
        if (p.cible[i] >= 0) {
          var pe = p.age[i] / p.vie[i];
          a = pe < 0.82 ? 1 : Math.max(0, (1 - pe) / 0.18);
          sz = p.t0[i] + (p.t1[i] - p.t0[i]) * pe;
        } else {
          a = 1 - p.age[i] / p.vie[i]; a = a * a * (3 - 2 * a);
          sz = p.t0[i] * (0.45 + 0.55 * a);
        }
        if (p.seau[i] !== lastSeau) { px.fillStyle = p.cols[p.seau[i]]; lastSeau = p.seau[i]; }
        px.globalAlpha = a * 0.95;
        if (arc) { px.beginPath(); px.arc(p.x[i], p.y[i], sz * 0.55, 0, 6.283); px.fill(); }
        else px.fillRect(p.x[i] - sz / 2, p.y[i] - sz / 2, sz, sz);
      }
      for (var k = 0; k < p.sp.length; k++) {
        var o = p.sp[k], b = 1 - o.age / o.vie;
        px.globalAlpha = Math.max(0, b) * 0.8;
        var tt = o.t * (0.6 + 0.4 * b);
        px.drawImage(sprite, o.x - tt / 2, o.y - tt / 2, tt, tt);
      }
      px.globalAlpha = 1;
    }

    // ---------- Fin d'un changement ----------
    function nettoyerCalques() {
      cv.style.visibility = 'hidden'; cvT.style.visibility = 'hidden';
      cx.clearRect(0, 0, cv.width, cv.height); cxT.clearRect(0, 0, cvT.width, cvT.height);
      px.clearRect(0, 0, pc.width, pc.height);
      if (parts) { parts.n = 0; parts.vol = 0; parts.sp.length = 0; }
    }
    function finirTel(a) {
      // le téléphone est complet : on affiche la vraie image et on retire le calque
      cxT.drawImage(a.T.off, 0, 0);
      vitreT.classList.add('sans-fondu');
      afficherTel(a.vers);
      cvT.style.visibility = 'hidden'; cxT.clearRect(0, 0, cvT.width, cvT.height);
      setTimeout(function () { vitreT.classList.remove('sans-fondu'); }, 60);
    }
    function annuler() {            // abandonne proprement un changement en cours (le portable montre déjà le nouveau projet)
      if (!anim) return;
      var a = anim; anim = null;
      nettoyerCalques();
      finirTel(a);
    }

    // ---------- Boucle principale (ne tourne que si la scène est réellement active) ----------
    var tPrec = 0, rafId = 0, enMarche = false, erreurs = 0;

    function image(tNow) {
      var dt = tPrec ? Math.min(0.05, (tNow - tPrec) / 1000) : 0.016;
      tPrec = tNow;
      var t = tNow / 1000;

      if (anim) {
        var dim = dimensionnerParticules();
        var tt = tNow - anim.t0;
        anim.coinsT = coinsDe(vitreT, dim.r);
        if (tt < CHARGE) {
          if (!anim.eteint) { anim.eteint = true; cvT.style.visibility = 'visible'; }
        } else {
          liberer(anim, tNow, dim.r);
          if (anim.tFinVague !== null && tNow - anim.tFinVague > 350) cv.style.visibility = 'hidden';
          if (anim.tFinVague !== null && parts.vol === 0 && anim.tFinVol === null) {
            anim.tFinVol = tNow; finirTel(anim);
            anim = null; tPret = tNow + PAUSE_ENTRE;
          }
        }
        majParticules(dt, t, anim, anim ? anim.coinsT : null);
        dessinerParticules(dim);
      } else if (parts && parts.n) {
        px.clearRect(0, 0, pc.width, pc.height); parts.n = 0; parts.vol = 0;
      }

      if (!anim && ouvert && !enPause && !calme && tNow >= tPret) aller((courant + 1) % cles.length);
    }

    function boucle() {
      if (!enMarche) return;
      try { image(maintenant()); erreurs = 0; }
      catch (err) {
        // si l'effet échoue plusieurs fois de suite, on le coupe et on garde un simple fondu (le contenu reste cohérent)
        if (++erreurs >= 3) { fondSeul = true; annuler(); nettoyerCalques(); if (window.console) console.warn('DZ : effet de particules désactivé (', err && err.message, ')'); }
      }
      rafId = requestAnimationFrame(boucle);
    }
    function demarrer() { if (enMarche) return; enMarche = true; tPrec = 0; rafId = requestAnimationFrame(boucle); }
    function arreter() { enMarche = false; cancelAnimationFrame(rafId); }

    // La scène tourne seulement si rien ne justifie de la figer
    function doitTourner() { return !calme && !enPause && visible && !document.hidden && !dialogue && !clavierDans; }
    function synchroniser() {
      var go = doitTourner();
      if (go && !enMarche) { decalage += horloge() - tSusp; demarrer(); }
      else if (!go && enMarche) { tSusp = horloge(); arreter(); }
    }

    // ---------- Changements de projet ----------
    // Choix manuel : les deux appareils changent tout de suite et de façon fiable (pas d'attente de l'effet)
    function montrer(i) {
      annuler();
      afficherLaptop(i); afficherTel(i);
      courant = i; marquerBouton(i);
      tPret = maintenant() + PAUSE_ENTRE;
    }
    function choisir(i) {
      if (i < 0 || i >= cles.length) return;
      if (i === courant && !anim) return;
      montrer(i);
      annoncer('Réalisation affichée : ' + titres[cles[i]]);
    }
    // Changement automatique : l'effet de particules (ou un fondu si impossible)
    function aller(i) {
      if (anim || i === courant) return;
      if (calme || fondSeul) { montrer(i); return; }
      try { lancer(i); }
      catch (err) {
        anim = null; nettoyerCalques();
        if (!imgs.every(prete)) { tPret = maintenant() + 1000; return; }   // images pas encore chargées : on réessaie plus tard
        fondSeul = true; if (window.console) console.warn('DZ : effet de particules indisponible, fondu simple (', err && err.message, ')');
        montrer(i);
      }
    }

    boutons.forEach(function (b) {
      b.addEventListener('click', function () { choisir(cles.indexOf(b.getAttribute('data-projet'))); });
    });

    function ouvrirApercu(vue) { if (window.DZ_apercu) window.DZ_apercu(cles[courant], vue); }
    btnApercu.addEventListener('click', function () { ouvrirApercu('ordi'); });
    [vitre, vitreT].forEach(function (el, k) {
      el.setAttribute('tabindex', '0'); el.setAttribute('role', 'button');
      el.setAttribute('aria-label', k === 0 ? 'Ouvrir l\'aperçu du site affiché sur le portable' : 'Ouvrir l\'aperçu mobile du site affiché sur le téléphone');
      var vue = k === 0 ? 'ordi' : 'tel';
      el.addEventListener('click', function () { ouvrirApercu(vue); });
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ouvrirApercu(vue); } });
    });

    // ---------- Pause / Reprendre : vraie pause (mouvement, changements automatiques, calcul graphique) ----------
    function majBoutonPause() {
      btnPause.hidden = calme;
      btnPause.setAttribute('aria-pressed', String(enPause));
      btnPause.textContent = enPause ? 'Reprendre' : 'Pause';
    }
    btnPause.addEventListener('click', function () {
      enPause = !enPause;
      majBoutonPause();
      annoncer(enPause ? 'Défilement automatique en pause.' : 'Défilement automatique repris.');
      if (!enPause) tPret = Math.max(tPret, maintenant() + 800);
      synchroniser();
    });

    scene.addEventListener('pointerleave', function () { tPret = Math.max(tPret, maintenant() + 1500); });

    // Clavier : tant que le focus (au clavier) est dans la section, rien ne change tout seul
    section.addEventListener('focusin', function (e) { clavierDans = !!(e.target.matches && e.target.matches(':focus-visible')); synchroniser(); });
    section.addEventListener('focusout', function (e) { if (!e.relatedTarget || !section.contains(e.relatedTarget)) { clavierDans = false; tPret = Math.max(tPret, maintenant() + 1500); synchroniser(); } });

    // Aperçu ouvert : la scène est cachée derrière, on arrête tout
    function veilleDialogues() {
      var ds = document.querySelectorAll('dialog');
      function maj() { dialogue = !!document.querySelector('dialog[open]'); synchroniser(); }
      if ('MutationObserver' in window) {
        var mo = new MutationObserver(maj);
        Array.prototype.forEach.call(ds, function (d) { mo.observe(d, { attributes: true, attributeFilter: ['open'] }); });
      }
      Array.prototype.forEach.call(ds, function (d) { d.addEventListener('close', maj); });
    }
    veilleDialogues();

    // « Réduire les animations » : présentation fixe, même projet partout ; le changement de réglage est pris en compte en direct
    function appliquerCalme() {
      calme = mqCalme.matches;
      if (calme) { annuler(); nettoyerCalques(); afficherLaptop(courant); afficherTel(courant); }
      majBoutonPause(); synchroniser();
    }
    if (mqCalme.addEventListener) mqCalme.addEventListener('change', appliquerCalme);

    // ---------- Visibilité : la scène apparaît (et se met en route) quand on arrive dans la section ----------
    function ouvrir() {
      if (ouvert) return;
      scene.classList.add('ouvert');
      setTimeout(function () { ouvert = true; tPret = maintenant() + 1800; }, calme ? 0 : 1900);
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { visible = e.isIntersecting; if (visible) ouvrir(); synchroniser(); });
      }, { threshold: 0.35 }).observe(section);
    } else { visible = true; ouvrir(); synchroniser(); }
    document.addEventListener('visibilitychange', synchroniser);

    // Accès pour les tests image par image
    window.__portable = {
      fixerHorloge: function (f) { horloge = f; decalage = 0; tSusp = f(); },
      image: image, aller: aller, choisir: choisir,
      etat: function () { return { courant: courant, anim: !!anim, ouvert: ouvert, enMarche: enMarche, enPause: enPause, calme: calme, fondSeul: fondSeul, n: parts ? parts.n : 0, vol: parts ? parts.vol : 0 }; },
      ouvrirTout: function () { scene.classList.add('ouvert'); ouvert = true; tPret = maintenant() + 1800; }
    };

    afficherLaptop(0); afficherTel(0); marquerBouton(0); cv.style.visibility = 'hidden'; cvT.style.visibility = 'hidden';
    majBoutonPause();
  });
})();
