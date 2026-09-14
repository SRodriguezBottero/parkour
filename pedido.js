(function() {
  'use strict';

  var FAVORITES_KEY = 'parkour_favoritos';
  var BAG_KEY = 'parkour_bolsa';

  var WHATSAPP_URL = 'https://wa.me/';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function getFavorites() {
    try {
      return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveFavorites(favs) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
    updateCounts();
    dispatchEvent('parkour:favorites-changed', { favorites: favs });
  }

  function isFavorite(productId) {
    return getFavorites().indexOf(productId) !== -1;
  }

  function toggleFavorite(productId) {
    var favs = getFavorites();
    var idx = favs.indexOf(productId);
    if (idx === -1) {
      favs.push(productId);
    } else {
      favs.splice(idx, 1);
    }
    saveFavorites(favs);
    return idx === -1;
  }

  function getBag() {
    try {
      return JSON.parse(localStorage.getItem(BAG_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveBag(bag) {
    localStorage.setItem(BAG_KEY, JSON.stringify(bag));
    updateCounts();
    dispatchEvent('parkour:bag-changed', { bag: bag });
  }

  function addToBag(item) {
    var bag = getBag();
    var existing = null;
    for (var i = 0; i < bag.length; i++) {
      if (bag[i].id === item.id && bag[i].size === item.size) {
        existing = bag[i];
        break;
      }
    }
    if (!existing) {
      bag.push({
        id: item.id,
        name: item.name,
        size: item.size,
        price: item.price,
        image: item.image
      });
      saveBag(bag);
    }
    return !existing;
  }

  function removeFromBag(productId, size) {
    var bag = getBag();
    var newBag = [];
    for (var i = 0; i < bag.length; i++) {
      if (!(bag[i].id === productId && bag[i].size === size)) {
        newBag.push(bag[i]);
      }
    }
    saveBag(newBag);
  }

  function clearBag() {
    saveBag([]);
  }

  function dispatchEvent(name, detail) {
    if (window.CustomEvent) {
      window.dispatchEvent(new CustomEvent(name, { detail: detail }));
    }
  }

  function injectStyles() {
    if (document.getElementById('parkour-pedido-styles')) return;
    var style = document.createElement('style');
    style.id = 'parkour-pedido-styles';
    style.textContent = 
      '.parkour-nav-icons {' +
        'display: flex;' +
        'align-items: center;' +
        'gap: 8px;' +
        'margin-left: 16px;' +
      '}' +
      '.parkour-nav-icon {' +
        'position: relative;' +
        'display: flex;' +
        'align-items: center;' +
        'justify-content: center;' +
        'width: 44px;' +
        'height: 44px;' +
        'background: transparent;' +
        'border: none;' +
        'cursor: pointer;' +
        'padding: 0;' +
      '}' +
      '.parkour-nav-icon svg {' +
        'width: 24px;' +
        'height: 24px;' +
        'fill: none;' +
        'stroke: #F3EFE6;' +
        'stroke-width: 2;' +
        'stroke-linecap: round;' +
        'stroke-linejoin: round;' +
        'transition: stroke 0.2s, fill 0.2s;' +
      '}' +
      '.parkour-nav-icon:hover svg {' +
        'stroke: #D8A73D;' +
      '}' +
      '.parkour-nav-icon:focus-visible {' +
        'outline: 2px solid #D8A73D;' +
        'outline-offset: 3px;' +
      '}' +
      '.parkour-nav-icon .count {' +
        'position: absolute;' +
        'top: 2px;' +
        'right: 2px;' +
        'min-width: 18px;' +
        'height: 18px;' +
        'background: #C1442E;' +
        'color: #F3EFE6;' +
        'font-family: "Space Grotesk", sans-serif;' +
        'font-size: 11px;' +
        'font-weight: 700;' +
        'border-radius: 9px;' +
        'display: flex;' +
        'align-items: center;' +
        'justify-content: center;' +
        'padding: 0 4px;' +
      '}' +
      '.parkour-nav-icon .count.hidden {' +
        'display: none;' +
      '}' +

      '.parkour-panel-overlay {' +
        'position: fixed;' +
        'top: 0;' +
        'left: 0;' +
        'right: 0;' +
        'bottom: 0;' +
        'background: rgba(0,0,0,0.6);' +
        'z-index: 9990;' +
        'opacity: 0;' +
        'pointer-events: none;' +
        'transition: opacity 0.3s ease;' +
      '}' +
      '.parkour-panel-overlay.is-visible {' +
        'opacity: 1;' +
        'pointer-events: auto;' +
      '}' +

      '.parkour-panel {' +
        'position: fixed;' +
        'top: 0;' +
        'right: 0;' +
        'bottom: 0;' +
        'width: min(420px, 92vw);' +
        'background: #121212;' +
        'z-index: 9991;' +
        'transform: translateX(100%);' +
        'transition: transform 0.3s ease;' +
        'display: flex;' +
        'flex-direction: column;' +
        'border-left: 1px solid #33312c;' +
        'box-shadow: -8px 0 24px rgba(0,0,0,0.4);' +
      '}' +
      '.parkour-panel.is-open {' +
        'transform: translateX(0);' +
      '}' +
      '.parkour-panel-header {' +
        'display: flex;' +
        'align-items: center;' +
        'justify-content: space-between;' +
        'padding: 24px 24px 20px;' +
        'border-bottom: 1px solid #33312c;' +
      '}' +
      '.parkour-panel-title {' +
        'font-family: "Archivo Black", sans-serif;' +
        'font-size: 24px;' +
        'text-transform: uppercase;' +
        'color: #F3EFE6;' +
        'margin: 0;' +
      '}' +
      '.parkour-panel-close {' +
        'background: transparent;' +
        'border: none;' +
        'cursor: pointer;' +
        'padding: 8px;' +
        'display: flex;' +
        'align-items: center;' +
        'justify-content: center;' +
      '}' +
      '.parkour-panel-close svg {' +
        'width: 24px;' +
        'height: 24px;' +
        'stroke: #F3EFE6;' +
        'stroke-width: 2;' +
      '}' +
      '.parkour-panel-close:hover svg {' +
        'stroke: #D8A73D;' +
      '}' +
      '.parkour-panel-close:focus-visible {' +
        'outline: 2px solid #D8A73D;' +
        'outline-offset: 3px;' +
      '}' +
      '.parkour-panel-body {' +
        'flex: 1;' +
        'overflow-y: auto;' +
        'padding: 24px;' +
      '}' +
      '.parkour-panel-footer {' +
        'padding: 20px 24px;' +
        'border-top: 1px solid #33312c;' +
      '}' +

      '.parkour-panel-empty {' +
        'text-align: center;' +
        'padding: 48px 24px;' +
      '}' +
      '.parkour-panel-empty-icon {' +
        'font-size: 48px;' +
        'margin-bottom: 16px;' +
        'opacity: 0.6;' +
      '}' +
      '.parkour-panel-empty-title {' +
        'font-family: "Permanent Marker", cursive;' +
        'font-size: 22px;' +
        'color: #D8A73D;' +
        'margin: 0 0 8px;' +
        'transform: rotate(-2deg);' +
      '}' +
      '.parkour-panel-empty-text {' +
        'color: #c9c5ba;' +
        'font-size: 16px;' +
        'margin: 0 0 24px;' +
      '}' +

      '.parkour-panel-item {' +
        'display: flex;' +
        'gap: 16px;' +
        'padding: 16px 0;' +
        'border-bottom: 1px solid #33312c;' +
      '}' +
      '.parkour-panel-item:last-child {' +
        'border-bottom: none;' +
      '}' +
      '.parkour-panel-item-img {' +
        'width: 80px;' +
        'height: 80px;' +
        'background: #0c0b0a;' +
        'flex-shrink: 0;' +
      '}' +
      '.parkour-panel-item-img img {' +
        'width: 100%;' +
        'height: 100%;' +
        'object-fit: contain;' +
      '}' +
      '.parkour-panel-item-info {' +
        'flex: 1;' +
        'min-width: 0;' +
      '}' +
      '.parkour-panel-item-name {' +
        'font-weight: 700;' +
        'font-size: 16px;' +
        'color: #F3EFE6;' +
        'margin: 0 0 4px;' +
      '}' +
      '.parkour-panel-item-name a {' +
        'color: inherit;' +
        'text-decoration: none;' +
      '}' +
      '.parkour-panel-item-name a:hover {' +
        'color: #D8A73D;' +
      '}' +
      '.parkour-panel-item-detail {' +
        'font-size: 14px;' +
        'color: #c9c5ba;' +
        'margin: 0;' +
      '}' +
      '.parkour-panel-item-price {' +
        'font-size: 16px;' +
        'color: #D8A73D;' +
        'font-weight: 700;' +
        'margin: 4px 0 0;' +
      '}' +
      '.parkour-panel-item-remove {' +
        'background: transparent;' +
        'border: none;' +
        'color: #9a968c;' +
        'font-size: 13px;' +
        'cursor: pointer;' +
        'padding: 4px 0;' +
        'margin-top: 8px;' +
      '}' +
      '.parkour-panel-item-remove:hover {' +
        'color: #C1442E;' +
      '}' +

      '.parkour-panel-btn {' +
        'display: block;' +
        'width: 100%;' +
        'background: #a83a26;' +
        'color: #F3EFE6;' +
        'border: none;' +
        'padding: 18px 24px;' +
        'font-family: "Space Grotesk", sans-serif;' +
        'font-weight: 700;' +
        'font-size: 17px;' +
        'text-align: center;' +
        'text-decoration: none;' +
        'cursor: pointer;' +
        'clip-path: polygon(0 0, 96% 0, 100% 100%, 4% 100%);' +
      '}' +
      '.parkour-panel-btn:hover {' +
        'background: #8f311f;' +
      '}' +
      '.parkour-panel-btn:focus-visible {' +
        'outline: 2px solid #D8A73D;' +
        'outline-offset: 3px;' +
      '}' +
      '.parkour-panel-btn-secondary {' +
        'background: transparent;' +
        'border: 1px solid #33312c;' +
        'clip-path: none;' +
        'margin-top: 12px;' +
      '}' +
      '.parkour-panel-btn-secondary:hover {' +
        'background: transparent;' +
        'border-color: #D8A73D;' +
        'color: #D8A73D;' +
      '}' +

      '.parkour-fav-btn {' +
        'position: absolute;' +
        'top: 12px;' +
        'right: 12px;' +
        'width: 40px;' +
        'height: 40px;' +
        'background: rgba(18,18,18,0.85);' +
        'border: none;' +
        'border-radius: 50%;' +
        'cursor: pointer;' +
        'display: flex;' +
        'align-items: center;' +
        'justify-content: center;' +
        'z-index: 5;' +
        'transition: transform 0.2s ease;' +
      '}' +
      '.parkour-fav-btn svg {' +
        'width: 22px;' +
        'height: 22px;' +
        'fill: none;' +
        'stroke: #F3EFE6;' +
        'stroke-width: 2;' +
        'transition: fill 0.2s, stroke 0.2s;' +
      '}' +
      '.parkour-fav-btn:hover svg {' +
        'stroke: #D8A73D;' +
      '}' +
      '.parkour-fav-btn.is-active svg {' +
        'fill: #C1442E;' +
        'stroke: #C1442E;' +
      '}' +
      '.parkour-fav-btn:focus-visible {' +
        'outline: 2px solid #D8A73D;' +
        'outline-offset: 3px;' +
      '}' +

      '.parkour-add-bag-btn {' +
        'display: inline-block;' +
        'background: #D8A73D;' +
        'color: #121212;' +
        'border: none;' +
        'padding: 18px 34px;' +
        'font-family: "Space Grotesk", sans-serif;' +
        'font-weight: 700;' +
        'font-size: 17px;' +
        'cursor: pointer;' +
        'clip-path: polygon(0 0, 94% 0, 100% 100%, 6% 100%);' +
        'transition: background 0.2s;' +
      '}' +
      '.parkour-add-bag-btn:hover {' +
        'background: #c49636;' +
      '}' +
      '.parkour-add-bag-btn:focus-visible {' +
        'outline: 2px solid #F3EFE6;' +
        'outline-offset: 3px;' +
      '}' +
      '.parkour-add-bag-btn.is-added {' +
        'background: #2d7a4f;' +
      '}' +

      '.parkour-wa-note {' +
        'margin-top: 16px;' +
        'padding: 16px;' +
        'background: #1c1a17;' +
        'border: 1px solid #33312c;' +
        'font-size: 14px;' +
        'color: #c9c5ba;' +
        'line-height: 1.5;' +
      '}' +
      '.parkour-wa-note a {' +
        'color: #D8A73D;' +
      '}' +

      '@media (max-width: 780px) {' +
        '.parkour-nav-icons {' +
          'position: fixed;' +
          'bottom: 0;' +
          'left: 0;' +
          'right: 0;' +
          'background: #121212;' +
          'border-top: 1px solid #33312c;' +
          'justify-content: center;' +
          'gap: 24px;' +
          'padding: 12px;' +
          'margin: 0;' +
          'z-index: 19;' +
        '}' +
        '.parkour-nav-icon {' +
          'width: 52px;' +
          'height: 52px;' +
        '}' +
        '.parkour-nav-icon svg {' +
          'width: 28px;' +
          'height: 28px;' +
        '}' +
        'body {' +
          'padding-bottom: 76px;' +
        '}' +
      '}' +

      '@media (prefers-reduced-motion: reduce) {' +
        '.parkour-panel-overlay { transition: none; }' +
        '.parkour-panel { transition: none; }' +
        '.parkour-fav-btn { transition: none; }' +
        '.parkour-fav-btn svg { transition: none; }' +
        '.parkour-add-bag-btn { transition: none; }' +
      '}';
    document.head.appendChild(style);
  }

  var navIconsContainer = null;
  var favCountEl = null;
  var bagCountEl = null;
  var favPanel = null;
  var bagPanel = null;
  var panelOverlay = null;

  function createNavIcons() {
    var nav = document.querySelector('nav');
    if (!nav) return;
    var navUl = nav.querySelector(':scope > ul');
    if (!navUl) return;

    navIconsContainer = document.createElement('div');
    navIconsContainer.className = 'parkour-nav-icons';

    var heartSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
    var bagSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';

    var favBtn = document.createElement('button');
    favBtn.type = 'button';
    favBtn.className = 'parkour-nav-icon';
    favBtn.setAttribute('aria-label', 'Favoritos');
    favBtn.innerHTML = heartSvg + '<span class="count hidden" aria-live="polite">0</span>';
    favCountEl = favBtn.querySelector('.count');

    var bagBtn = document.createElement('button');
    bagBtn.type = 'button';
    bagBtn.className = 'parkour-nav-icon';
    bagBtn.setAttribute('aria-label', 'Mi pedido');
    bagBtn.innerHTML = bagSvg + '<span class="count hidden" aria-live="polite">0</span>';
    bagCountEl = bagBtn.querySelector('.count');

    navIconsContainer.appendChild(favBtn);
    navIconsContainer.appendChild(bagBtn);

    if (window.matchMedia('(max-width: 780px)').matches) {
      document.body.appendChild(navIconsContainer);
    } else {
      navUl.appendChild(navIconsContainer);
    }

    window.addEventListener('resize', repositionNavIcons);

    favBtn.addEventListener('click', function() {
      openPanel('favorites');
    });

    bagBtn.addEventListener('click', function() {
      openPanel('bag');
    });

    updateCounts();
  }

  function repositionNavIcons() {
    if (!navIconsContainer) return;
    var isMobile = window.matchMedia('(max-width: 780px)').matches;
    var isInBody = navIconsContainer.parentNode === document.body;

    if (isMobile && !isInBody) {
      document.body.appendChild(navIconsContainer);
    } else if (!isMobile && isInBody) {
      var navUl = document.querySelector('nav > ul');
      if (navUl) navUl.appendChild(navIconsContainer);
    }
  }

  function updateCounts() {
    var favCount = getFavorites().length;
    var bagCount = getBag().length;

    if (favCountEl) {
      favCountEl.textContent = favCount;
      favCountEl.classList.toggle('hidden', favCount === 0);
    }
    if (bagCountEl) {
      bagCountEl.textContent = bagCount;
      bagCountEl.classList.toggle('hidden', bagCount === 0);
    }
  }

  function createPanelOverlay() {
    panelOverlay = document.createElement('div');
    panelOverlay.className = 'parkour-panel-overlay';
    document.body.appendChild(panelOverlay);

    panelOverlay.addEventListener('click', closeAllPanels);
  }

  function createFavoritesPanel() {
    favPanel = document.createElement('aside');
    favPanel.className = 'parkour-panel';
    favPanel.id = 'parkour-fav-panel';
    favPanel.setAttribute('aria-label', 'Panel de favoritos');
    favPanel.setAttribute('role', 'dialog');
    favPanel.setAttribute('aria-modal', 'true');
    favPanel.innerHTML = 
      '<div class="parkour-panel-header">' +
        '<h2 class="parkour-panel-title">Favoritos</h2>' +
        '<button type="button" class="parkour-panel-close" aria-label="Cerrar panel">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="parkour-panel-body" id="fav-panel-body"></div>' +
      '<div class="parkour-panel-footer">' +
        '<a href="disenos.html" class="parkour-panel-btn">Ver todos los diseños</a>' +
      '</div>';
    document.body.appendChild(favPanel);

    favPanel.querySelector('.parkour-panel-close').addEventListener('click', closeAllPanels);
  }

  function createBagPanel() {
    bagPanel = document.createElement('aside');
    bagPanel.className = 'parkour-panel';
    bagPanel.id = 'parkour-bag-panel';
    bagPanel.setAttribute('aria-label', 'Panel de pedido');
    bagPanel.setAttribute('role', 'dialog');
    bagPanel.setAttribute('aria-modal', 'true');
    bagPanel.innerHTML = 
      '<div class="parkour-panel-header">' +
        '<h2 class="parkour-panel-title">Tu pedido</h2>' +
        '<button type="button" class="parkour-panel-close" aria-label="Cerrar panel">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="parkour-panel-body" id="bag-panel-body"></div>' +
      '<div class="parkour-panel-footer" id="bag-panel-footer"></div>';
    document.body.appendChild(bagPanel);

    bagPanel.querySelector('.parkour-panel-close').addEventListener('click', closeAllPanels);
  }

  var EMPTY_FAVORITES_LINES = [
    'Todavía no marcaste nada como favorito.',
    'Dale al corazoncito en los diseños que te gusten.',
    'Esto está más vacío que heladera de estudiante.',
    'Tu colección de favoritos está en 0. Como mi cuenta del banco.',
    '¿Ningún diseño te gustó? Imposible.'
  ];

  var EMPTY_BAG_LINES = [
    'Tu pedido está vacío. Por ahora.',
    'Esto está más vacío que Montevideo en enero.',
    '¿Todo ese scroll y no agregaste nada?',
    'Tu bolsa pesa 0 gramos. Literalmente.',
    'Acá no hay nada. Todavía.'
  ];

  function getRandomLine(lines) {
    return lines[Math.floor(Math.random() * lines.length)];
  }

  function renderFavoritesPanel() {
    var body = document.getElementById('fav-panel-body');
    if (!body) return;

    var favs = getFavorites();
    if (favs.length === 0) {
      body.innerHTML = 
        '<div class="parkour-panel-empty">' +
          '<div class="parkour-panel-empty-icon">💔</div>' +
          '<p class="parkour-panel-empty-title">' + getRandomLine(EMPTY_FAVORITES_LINES) + '</p>' +
          '<p class="parkour-panel-empty-text">Mirá los diseños y marcá los que te gusten.</p>' +
        '</div>';
      return;
    }

    var html = '';
    for (var i = 0; i < favs.length; i++) {
      var productId = favs[i];
      var product = window.PARKOUR_UTILS ? window.PARKOUR_UTILS.getProductById(productId) : null;
      if (!product) continue;

      var imgSrc = window.PARKOUR_UTILS ? window.PARKOUR_UTILS.encodeImageSrc(product.image) : product.image;
      html += 
        '<div class="parkour-panel-item" data-product-id="' + productId + '">' +
          '<div class="parkour-panel-item-img">' +
            '<img src="' + imgSrc + '" alt="">' +
          '</div>' +
          '<div class="parkour-panel-item-info">' +
            '<p class="parkour-panel-item-name"><a href="producto.html?id=' + productId + '">' + product.name + '</a></p>' +
            '<p class="parkour-panel-item-price">' + product.price + '</p>' +
            '<button type="button" class="parkour-panel-item-remove" data-action="remove-fav" data-id="' + productId + '">Quitar de favoritos</button>' +
          '</div>' +
        '</div>';
    }
    body.innerHTML = html;

    var removeButtons = body.querySelectorAll('[data-action="remove-fav"]');
    for (var j = 0; j < removeButtons.length; j++) {
      removeButtons[j].addEventListener('click', function(e) {
        var id = e.target.getAttribute('data-id');
        toggleFavorite(id);
        renderFavoritesPanel();
        updateAllFavoriteButtons();
      });
    }
  }

  function renderBagPanel() {
    var body = document.getElementById('bag-panel-body');
    var footer = document.getElementById('bag-panel-footer');
    if (!body || !footer) return;

    var bag = getBag();
    if (bag.length === 0) {
      body.innerHTML = 
        '<div class="parkour-panel-empty">' +
          '<div class="parkour-panel-empty-icon">🛍️</div>' +
          '<p class="parkour-panel-empty-title">' + getRandomLine(EMPTY_BAG_LINES) + '</p>' +
          '<p class="parkour-panel-empty-text">Elegí diseño y talle, y dale a "Agregar al pedido".</p>' +
        '</div>';
      footer.innerHTML = '<a href="disenos.html" class="parkour-panel-btn">Ver diseños</a>';
      return;
    }

    var html = '';
    for (var i = 0; i < bag.length; i++) {
      var item = bag[i];
      var imgSrc = window.PARKOUR_UTILS ? window.PARKOUR_UTILS.encodeImageSrc(item.image) : item.image;
      html += 
        '<div class="parkour-panel-item" data-product-id="' + item.id + '" data-size="' + item.size + '">' +
          '<div class="parkour-panel-item-img">' +
            '<img src="' + imgSrc + '" alt="">' +
          '</div>' +
          '<div class="parkour-panel-item-info">' +
            '<p class="parkour-panel-item-name"><a href="producto.html?id=' + item.id + '">' + item.name + '</a></p>' +
            '<p class="parkour-panel-item-detail">Talle: ' + item.size + '</p>' +
            '<p class="parkour-panel-item-price">' + item.price + '</p>' +
            '<button type="button" class="parkour-panel-item-remove" data-action="remove-bag" data-id="' + item.id + '" data-size="' + item.size + '">Quitar</button>' +
          '</div>' +
        '</div>';
    }
    body.innerHTML = html;

    var waConfigured = isWhatsAppConfigured();
    var footerHtml = '';
    
    if (waConfigured) {
      footerHtml = '<button type="button" class="parkour-panel-btn" id="wa-order-btn">Pedir por WhatsApp</button>';
    } else {
      footerHtml = 
        '<a href="contacto.html?msg=' + encodeURIComponent(buildOrderMessage()) + '" class="parkour-panel-btn">Coordinar pedido</a>' +
        '<div class="parkour-wa-note">' +
          'WhatsApp no está configurado todavía. Te llevamos a <a href="contacto.html">Contacto</a> con el mensaje armado.' +
        '</div>';
    }
    footerHtml += '<button type="button" class="parkour-panel-btn parkour-panel-btn-secondary" id="clear-bag-btn">Vaciar pedido</button>';
    footer.innerHTML = footerHtml;

    var removeButtons = body.querySelectorAll('[data-action="remove-bag"]');
    for (var j = 0; j < removeButtons.length; j++) {
      removeButtons[j].addEventListener('click', function(e) {
        var id = e.target.getAttribute('data-id');
        var size = e.target.getAttribute('data-size');
        removeFromBag(id, size);
        renderBagPanel();
      });
    }

    var waBtn = document.getElementById('wa-order-btn');
    if (waBtn) {
      waBtn.addEventListener('click', function() {
        var msg = buildOrderMessage();
        var url = WHATSAPP_URL + '?text=' + encodeURIComponent(msg);
        window.open(url, '_blank', 'noopener,noreferrer');
      });
    }

    var clearBtn = document.getElementById('clear-bag-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', function() {
        clearBag();
        renderBagPanel();
      });
    }
  }

  function isWhatsAppConfigured() {
    return WHATSAPP_URL && WHATSAPP_URL.indexOf('wa.me/') !== -1 && WHATSAPP_URL.length > 'https://wa.me/'.length;
  }

  function buildOrderMessage() {
    var bag = getBag();
    if (bag.length === 0) return 'Hola! Quiero hacer un pedido de remeras Parkour.';

    var lines = ['Hola! Quiero pedir:'];
    for (var i = 0; i < bag.length; i++) {
      lines.push('- ' + bag[i].name + ' (talle ' + bag[i].size + ')');
    }
    lines.push('');
    lines.push('¿Cómo seguimos?');
    return lines.join('\n');
  }

  var currentPanel = null;

  function openPanel(type) {
    closeAllPanels();

    if (type === 'favorites') {
      renderFavoritesPanel();
      favPanel.classList.add('is-open');
      currentPanel = favPanel;
    } else if (type === 'bag') {
      renderBagPanel();
      bagPanel.classList.add('is-open');
      currentPanel = bagPanel;
    }

    panelOverlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden';

    var closeBtn = currentPanel.querySelector('.parkour-panel-close');
    if (closeBtn) closeBtn.focus();

    document.addEventListener('keydown', handlePanelKeydown);
  }

  function closeAllPanels() {
    if (favPanel) favPanel.classList.remove('is-open');
    if (bagPanel) bagPanel.classList.remove('is-open');
    if (panelOverlay) panelOverlay.classList.remove('is-visible');
    document.body.style.overflow = '';
    currentPanel = null;
    document.removeEventListener('keydown', handlePanelKeydown);
  }

  function handlePanelKeydown(e) {
    if (e.key === 'Escape') {
      closeAllPanels();
    }
    if (e.key === 'Tab' && currentPanel) {
      trapFocus(e, currentPanel);
    }
  }

  function trapFocus(e, container) {
    var focusable = container.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function createFavoriteButton(productId) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'parkour-fav-btn';
    btn.setAttribute('data-product-id', productId);
    btn.setAttribute('aria-label', isFavorite(productId) ? 'Quitar de favoritos' : 'Agregar a favoritos');
    btn.setAttribute('aria-pressed', isFavorite(productId) ? 'true' : 'false');
    if (isFavorite(productId)) btn.classList.add('is-active');
    
    btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';

    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var isNowFavorite = toggleFavorite(productId);
      btn.classList.toggle('is-active', isNowFavorite);
      btn.setAttribute('aria-pressed', isNowFavorite ? 'true' : 'false');
      btn.setAttribute('aria-label', isNowFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos');

      if (!prefersReducedMotion) {
        btn.style.transform = 'scale(1.2)';
        setTimeout(function() { btn.style.transform = ''; }, 150);
      }

      updateAllFavoriteButtons();
    });

    return btn;
  }

  function updateAllFavoriteButtons() {
    var buttons = document.querySelectorAll('.parkour-fav-btn[data-product-id]');
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      var productId = btn.getAttribute('data-product-id');
      var isFav = isFavorite(productId);
      btn.classList.toggle('is-active', isFav);
      btn.setAttribute('aria-pressed', isFav ? 'true' : 'false');
      btn.setAttribute('aria-label', isFav ? 'Quitar de favoritos' : 'Agregar a favoritos');
    }
  }

  function initProductCards() {
    var cards = document.querySelectorAll('.card[href*="producto.html?id="]');
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var href = card.getAttribute('href');
      var match = href.match(/[?&]id=([^&]+)/);
      if (!match) continue;
      var productId = match[1];

      card.style.position = 'relative';
      var existing = card.querySelector('.parkour-fav-btn');
      if (!existing) {
        var favBtn = createFavoriteButton(productId);
        card.appendChild(favBtn);
      }
    }

    var homeCards = document.querySelectorAll('.tee-card[href*="producto.html?id="]');
    for (var j = 0; j < homeCards.length; j++) {
      var homeCard = homeCards[j];
      var homeHref = homeCard.getAttribute('href');
      var homeMatch = homeHref.match(/[?&]id=([^&]+)/);
      if (!homeMatch) continue;
      var homeProductId = homeMatch[1];

      homeCard.style.position = 'relative';
      var existingHome = homeCard.querySelector('.parkour-fav-btn');
      if (!existingHome) {
        var homeFavBtn = createFavoriteButton(homeProductId);
        homeCard.appendChild(homeFavBtn);
      }
    }
  }

  function init() {
    injectStyles();
    createPanelOverlay();
    createFavoritesPanel();
    createBagPanel();
    createNavIcons();
    initProductCards();
  }

  window.PARKOUR_PEDIDO = {
    getFavorites: getFavorites,
    isFavorite: isFavorite,
    toggleFavorite: toggleFavorite,
    getBag: getBag,
    addToBag: addToBag,
    removeFromBag: removeFromBag,
    clearBag: clearBag,
    createFavoriteButton: createFavoriteButton,
    openPanel: openPanel,
    closeAllPanels: closeAllPanels,
    updateCounts: updateCounts,
    isWhatsAppConfigured: isWhatsAppConfigured,
    buildOrderMessage: buildOrderMessage
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
