/* Bandeau d'information sur les cookies (SolaWeb).
   Ce site ne depose aucun cookie de suivi ni de publicite : le bandeau informe, il ne demande pas de consentement.
   Seul le choix de fermer le message est memorise sur l'appareil (cle "sw-info-cookies"), ce qui est indispensable
   pour ne pas le reafficher a chaque page. Si un jour un service tiers est ajoute (statistiques, carte, video),
   ce bandeau devra devenir un vrai bandeau de consentement (Accepter / Refuser). */
(function () {
  var CLE = 'sw-info-cookies';
  /* Pendant les essais (page ouverte depuis l'ordinateur, adresse en file:) le bandeau s'affiche a chaque fois.
     En ligne, le choix du visiteur est memorise normalement. */
  try { if (location.protocol !== 'file:' && localStorage.getItem(CLE) === 'ok') return; } catch (e) { /* stockage bloque : le bandeau s'affiche */ }

  var css = document.createElement('style');
  css.textContent =
    '.sw-cookies{position:fixed;left:1rem;right:1rem;bottom:1rem;z-index:900;max-width:46rem;margin:0 auto;' +
    'display:flex;align-items:center;gap:1rem 1.5rem;flex-wrap:wrap;padding:1rem 1.25rem;border-radius:12px;' +
    'background:#1F2D4D;color:#FBF7F1;box-shadow:0 10px 30px rgba(10,16,32,.35);font-family:inherit;font-size:.95rem;line-height:1.5;}' +
    '.sw-cookies p{margin:0;flex:1 1 18rem;color:#FBF7F1;}' +
    '.sw-cookies a{color:#E9DFC8;text-decoration:underline;text-underline-offset:2px;}' +
    '.sw-cookies a:hover,.sw-cookies a:focus-visible{color:#fff;}' +
    '.sw-cookies button{font-family:inherit;font-size:inherit;font-weight:600;cursor:pointer;border:0;border-radius:8px;padding:.6rem 1.25rem;' +
    'background:#EADFC8;color:#1F2D4D;}' +
    '.sw-cookies button:hover{background:#fff;}' +
    '.sw-cookies a:focus-visible,.sw-cookies button:focus-visible{outline:2px solid #fff;outline-offset:3px;}' +
    /* 25.11.2026, demande de Souad : bandeau blanc, bouton marine (passe devant les couleurs des feuilles de style) */
    'html body .sw-cookies{background:#fff !important;color:#1F2D4D;border:1px solid rgba(31,45,77,.16);box-shadow:0 14px 40px -8px rgba(10,16,32,.38);}' +
    'html body .sw-cookies p{color:#1F2D4D;}' +
    'html body .sw-cookies a,html body .sw-cookies a:hover,html body .sw-cookies a:focus-visible{color:#1F2D4D;}' +
    'html body .sw-cookies button{background:#1F2D4D !important;color:#fff !important;}' +
    'html body .sw-cookies button:hover{background:#2C3D63 !important;}' +
    'html body .sw-cookies a:focus-visible,html body .sw-cookies button:focus-visible{outline:2px solid #1F2D4D;}' +
    '@media (max-width:560px){.sw-cookies{left:.5rem;right:.5rem;bottom:.5rem;}.sw-cookies button{width:100%;}}';
  document.head.appendChild(css);

  var b = document.createElement('div');
  b.className = 'sw-cookies';
  b.setAttribute('role', 'region');
  b.setAttribute('aria-label', 'Information sur les cookies');
  b.innerHTML =
    '<p>Ce site n’utilise aucun cookie de suivi ni de publicité. Seul votre choix de fermer ce message est mémorisé sur votre appareil. ' +
    '<a href="confidentialite.html">En savoir plus</a></p>' +
    '<button type="button">J’ai compris</button>';
  b.querySelector('button').addEventListener('click', function () {
    try { localStorage.setItem(CLE, 'ok'); } catch (e) { /* ignore */ }
    b.remove();
  });
  function poser() { document.body.appendChild(b); }
  if (document.body) poser(); else document.addEventListener('DOMContentLoaded', poser);
})();
