(function() {
  'use strict';

  var BANNER_KEY = 'parkour_welcome_seen';
  var STICKER_KEY = 'parkour_sticker_dismissed';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function consoleEasterEgg() {
    var styles = [
      'background: #D8A73D',
      'color: #121212',
      'font-size: 16px',
      'font-weight: bold',
      'padding: 12px 20px',
      'border-radius: 0'
    ].join(';');

    var stylesSmall = [
      'color: #c9c5ba',
      'font-size: 12px'
    ].join(';');

    console.log('%c P! Remeras que chocan ', styles);
    console.log('%cMirá vos, llegaste hasta la consola. Sos de los nuestros.', stylesSmall);
    console.log('%cSi estás leyendo esto, capaz te interesa saber que hacemos diseños propios, tiradas chicas, desde Montevideo. Nada más. Nada menos.', stylesSmall);
    console.log('%c🚗💥🚗 Chocá tranquilo.', stylesSmall);
  }

  function createBanner() {
    if (localStorage.getItem(BANNER_KEY)) return;

    var banner = document.createElement('div');
    banner.id = 'parkour-welcome-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'parkour-banner-title');
    banner.setAttribute('aria-describedby', 'parkour-banner-desc');

    banner.innerHTML = 
      '<div class="parkour-banner-content">' +
        '<p id="parkour-banner-title" class="parkour-banner-title">Usamos cookies...</p>' +
        '<p id="parkour-banner-desc" class="parkour-banner-desc">Mentira, usamos remeras. Y vos deberías también.</p>' +
        '<div class="parkour-banner-actions">' +
          '<button type="button" class="parkour-banner-btn parkour-banner-btn-primary" id="parkour-accept">Aceptar</button>' +
          '<button type="button" class="parkour-banner-btn" id="parkour-also-accept">También aceptar</button>' +
        '</div>' +
      '</div>';

    var style = document.createElement('style');
    style.textContent = 
      '#parkour-welcome-banner {' +
        'position: fixed;' +
        'bottom: 0;' +
        'left: 0;' +
        'right: 0;' +
        'background: #121212;' +
        'border-top: 2px solid #D8A73D;' +
        'padding: 24px 5vw;' +
        'z-index: 9999;' +
        'font-family: "Space Grotesk", sans-serif;' +
        (prefersReducedMotion ? '' : 'animation: parkour-slide-up 0.4s ease;') +
      '}' +
      '@keyframes parkour-slide-up {' +
        'from { transform: translateY(100%); opacity: 0; }' +
        'to { transform: translateY(0); opacity: 1; }' +
      '}' +
      '@keyframes parkour-fade-out {' +
        'from { opacity: 1; }' +
        'to { opacity: 0; transform: translateY(20px); }' +
      '}' +
      '.parkour-banner-content {' +
        'max-width: 720px;' +
        'margin: 0 auto;' +
        'display: flex;' +
        'flex-wrap: wrap;' +
        'align-items: center;' +
        'gap: 16px 32px;' +
      '}' +
      '.parkour-banner-title {' +
        'color: #D8A73D;' +
        'font-family: "Permanent Marker", cursive;' +
        'font-size: 22px;' +
        'margin: 0;' +
        'transform: rotate(-2deg);' +
      '}' +
      '.parkour-banner-desc {' +
        'color: #F3EFE6;' +
        'font-size: 16px;' +
        'margin: 0;' +
        'flex: 1;' +
        'min-width: 200px;' +
      '}' +
      '.parkour-banner-actions {' +
        'display: flex;' +
        'gap: 12px;' +
        'flex-wrap: wrap;' +
      '}' +
      '.parkour-banner-btn {' +
        'background: transparent;' +
        'color: #F3EFE6;' +
        'border: 1px solid #33312c;' +
        'padding: 12px 20px;' +
        'font-family: "Space Grotesk", sans-serif;' +
        'font-weight: 700;' +
        'font-size: 15px;' +
        'cursor: pointer;' +
        'transition: border-color 0.2s, color 0.2s;' +
      '}' +
      '.parkour-banner-btn:hover {' +
        'border-color: #D8A73D;' +
        'color: #D8A73D;' +
      '}' +
      '.parkour-banner-btn:focus-visible {' +
        'outline: 2px solid #D8A73D;' +
        'outline-offset: 3px;' +
      '}' +
      '.parkour-banner-btn-primary {' +
        'background: #a83a26;' +
        'border-color: #a83a26;' +
      '}' +
      '.parkour-banner-btn-primary:hover {' +
        'background: #8f311f;' +
        'border-color: #8f311f;' +
        'color: #F3EFE6;' +
      '}' +
      '@media (prefers-reduced-motion: reduce) {' +
        '#parkour-welcome-banner { animation: none !important; }' +
      '}';

    document.head.appendChild(style);
    document.body.appendChild(banner);

    var acceptBtn = document.getElementById('parkour-accept');
    var alsoAcceptBtn = document.getElementById('parkour-also-accept');

    function dismissBanner() {
      localStorage.setItem(BANNER_KEY, '1');
      if (prefersReducedMotion) {
        banner.remove();
      } else {
        banner.style.animation = 'parkour-fade-out 0.3s ease forwards';
        setTimeout(function() { banner.remove(); }, 300);
      }
    }

    acceptBtn.addEventListener('click', dismissBanner);
    alsoAcceptBtn.addEventListener('click', dismissBanner);

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && document.body.contains(banner)) {
        dismissBanner();
      }
    });

    setTimeout(function() { acceptBtn.focus(); }, 100);
  }

  function createSticker() {
    if (localStorage.getItem(STICKER_KEY)) return;

    var sticker = document.createElement('div');
    sticker.id = 'parkour-sticker';
    sticker.setAttribute('role', 'complementary');
    sticker.setAttribute('aria-label', 'Mensaje de bienvenida');

    var messages = [
      "Ta' bien si no comprás nada, igual te queremos.",
      "Remeras: porque los tatuajes duelen.",
      "El algoritmo te trajo, el diseño te queda.",
      "Somos 2 amig@s con un estampador y un sueño.",
      "Si no te gusta ninguna, inventamos una para vos (mentira)."
    ];
    var randomMsg = messages[Math.floor(Math.random() * messages.length)];

    sticker.innerHTML = 
      '<button type="button" class="parkour-sticker-close" aria-label="Cerrar mensaje">&times;</button>' +
      '<p class="parkour-sticker-text">' + randomMsg + '</p>';

    var style = document.createElement('style');
    style.id = 'parkour-sticker-style';
    style.textContent = 
      '#parkour-sticker {' +
        'position: fixed;' +
        'bottom: 100px;' +
        'right: 20px;' +
        'background: #D8A73D;' +
        'color: #121212;' +
        'padding: 16px 20px;' +
        'max-width: 220px;' +
        'font-family: "Permanent Marker", cursive;' +
        'font-size: 15px;' +
        'transform: rotate(3deg);' +
        'box-shadow: 6px 6px 0 rgba(18, 18, 18, 0.3);' +
        'z-index: 9998;' +
        (prefersReducedMotion ? '' : 'animation: parkour-sticker-pop 0.5s ease 1s backwards;') +
      '}' +
      '@keyframes parkour-sticker-pop {' +
        'from { transform: rotate(3deg) scale(0.5); opacity: 0; }' +
        'to { transform: rotate(3deg) scale(1); opacity: 1; }' +
      '}' +
      '.parkour-sticker-close {' +
        'position: absolute;' +
        'top: -8px;' +
        'right: -8px;' +
        'width: 24px;' +
        'height: 24px;' +
        'background: #121212;' +
        'color: #F3EFE6;' +
        'border: none;' +
        'border-radius: 50%;' +
        'font-size: 18px;' +
        'line-height: 1;' +
        'cursor: pointer;' +
        'display: flex;' +
        'align-items: center;' +
        'justify-content: center;' +
      '}' +
      '.parkour-sticker-close:hover {' +
        'background: #a83a26;' +
      '}' +
      '.parkour-sticker-close:focus-visible {' +
        'outline: 2px solid #F3EFE6;' +
        'outline-offset: 2px;' +
      '}' +
      '.parkour-sticker-text {' +
        'margin: 0;' +
        'line-height: 1.4;' +
      '}' +
      '@media (max-width: 480px) {' +
        '#parkour-sticker {' +
          'right: 10px;' +
          'bottom: 80px;' +
          'max-width: 180px;' +
          'font-size: 14px;' +
        '}' +
      '}' +
      '@media (prefers-reduced-motion: reduce) {' +
        '#parkour-sticker { animation: none !important; }' +
      '}';

    document.head.appendChild(style);
    document.body.appendChild(sticker);

    var closeBtn = sticker.querySelector('.parkour-sticker-close');
    closeBtn.addEventListener('click', function() {
      localStorage.setItem(STICKER_KEY, '1');
      sticker.remove();
    });
  }

  consoleEasterEgg();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      createBanner();
      createSticker();
    });
  } else {
    createBanner();
    createSticker();
  }
})();
