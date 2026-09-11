(function () {
  'use strict';

  var nav = document.querySelector('nav');
  if (!nav) return;

  var navUl = nav.querySelector(':scope > ul');
  var item = nav.querySelector('.has-submenu');

  function injectMobileStyles() {
    if (document.getElementById('parkour-nav-mobile-styles')) return;
    var style = document.createElement('style');
    style.id = 'parkour-nav-mobile-styles';
    style.textContent = 
      '.nav-hamburger {' +
        'display: none;' +
        'background: transparent;' +
        'border: none;' +
        'cursor: pointer;' +
        'padding: 8px;' +
        'z-index: 25;' +
      '}' +
      '.nav-hamburger svg {' +
        'display: block;' +
        'width: 28px;' +
        'height: 28px;' +
        'fill: none;' +
        'stroke: #F3EFE6;' +
        'stroke-width: 2;' +
        'stroke-linecap: round;' +
      '}' +
      '.nav-hamburger:hover svg { stroke: #D8A73D; }' +
      '.nav-hamburger:focus-visible {' +
        'outline: 2px solid #D8A73D;' +
        'outline-offset: 3px;' +
      '}' +
      '.nav-hamburger .icon-close { display: none; }' +
      '.nav-hamburger[aria-expanded="true"] .icon-menu { display: none; }' +
      '.nav-hamburger[aria-expanded="true"] .icon-close { display: block; }' +
      '@media (max-width: 780px) {' +
        '.nav-hamburger { display: block; }' +
        'nav > ul {' +
          'position: fixed;' +
          'top: 0;' +
          'right: 0;' +
          'bottom: 0;' +
          'width: min(320px, 85vw);' +
          'background: #121212;' +
          'flex-direction: column;' +
          'align-items: stretch;' +
          'padding: 100px 32px 48px;' +
          'gap: 0;' +
          'transform: translateX(100%);' +
          'visibility: hidden;' +
          'transition: transform 0.3s ease;' +
          'z-index: 21;' +
          'border-left: 1px solid #33312c;' +
          'box-shadow: -8px 0 24px rgba(0,0,0,0.4);' +
        '}' +
        'nav > ul.is-mobile-open {' +
          'transform: translateX(0);' +
          'visibility: visible;' +
        '}' +
        'nav > ul > li { border-bottom: 1px solid #33312c; }' +
        'nav > ul > li > a {' +
          'display: block;' +
          'padding: 18px 0;' +
          'font-size: 18px;' +
        '}' +
        'nav .has-submenu > a {' +
          'display: flex;' +
          'justify-content: space-between;' +
          'align-items: center;' +
        '}' +
        'nav .has-submenu > a::after {' +
          'display: block;' +
          'margin-left: auto;' +
          'transition: transform 0.2s ease;' +
        '}' +
        'nav .has-submenu.is-open > a::after {' +
          'transform: rotate(180deg);' +
        '}' +
        'nav .submenu {' +
          'position: static;' +
          'background: transparent;' +
          'border: none;' +
          'box-shadow: none;' +
          'padding: 0 0 12px 16px;' +
          'min-width: auto;' +
        '}' +
        'nav .has-submenu.is-open > .submenu { display: flex; }' +
        'nav .submenu a {' +
          'padding: 10px 0;' +
          'font-size: 16px;' +
        '}' +
        'nav .submenu a:hover { background: transparent; }' +
        '.nav-overlay {' +
          'position: fixed;' +
          'top: 0;' +
          'left: 0;' +
          'right: 0;' +
          'bottom: 0;' +
          'background: rgba(0,0,0,0.5);' +
          'z-index: 20;' +
          'opacity: 0;' +
          'pointer-events: none;' +
          'transition: opacity 0.3s ease;' +
        '}' +
        '.nav-overlay.is-visible {' +
          'opacity: 1;' +
          'pointer-events: auto;' +
        '}' +
      '}' +
      '@media (max-width: 780px) and (prefers-reduced-motion: reduce) {' +
        'nav > ul { transition: none; }' +
        '.nav-overlay { transition: none; }' +
      '}';
    document.head.appendChild(style);
  }

  function createHamburger() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-hamburger';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'nav-menu');
    btn.setAttribute('aria-label', 'Menú de navegación');
    btn.innerHTML = 
      '<svg class="icon-menu" viewBox="0 0 24 24" aria-hidden="true">' +
        '<line x1="3" y1="6" x2="21" y2="6"/>' +
        '<line x1="3" y1="12" x2="21" y2="12"/>' +
        '<line x1="3" y1="18" x2="21" y2="18"/>' +
      '</svg>' +
      '<svg class="icon-close" viewBox="0 0 24 24" aria-hidden="true">' +
        '<line x1="6" y1="6" x2="18" y2="18"/>' +
        '<line x1="6" y1="18" x2="18" y2="6"/>' +
      '</svg>';
    return btn;
  }

  function createOverlay() {
    var overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    return overlay;
  }

  injectMobileStyles();

  if (navUl) {
    navUl.id = 'nav-menu';
  }

  var hamburger = createHamburger();
  var overlay = createOverlay();

  nav.appendChild(hamburger);
  document.body.appendChild(overlay);

  var mobileMenuOpen = false;
  var mainEl = document.querySelector('main');
  var footerEl = document.querySelector('footer');

  function isMobileView() {
    return window.matchMedia('(max-width: 780px)').matches;
  }

  function setPageInert(inert) {
    if (mainEl) mainEl.inert = inert;
    if (footerEl) footerEl.inert = inert;
  }

  function setMobileMenuOpen(open) {
    mobileMenuOpen = open;
    hamburger.setAttribute('aria-expanded', String(open));
    if (navUl) navUl.classList.toggle('is-mobile-open', open);
    overlay.classList.toggle('is-visible', open);
    document.body.style.overflow = open ? 'hidden' : '';
    setPageInert(open && isMobileView());
  }

  function getDrawerFocusable() {
    var nodes = [];
    if (navUl) {
      var links = navUl.querySelectorAll('a');
      for (var i = 0; i < links.length; i++) {
        if (!links[i].closest('[hidden]')) nodes.push(links[i]);
      }
    }
    nodes.push(hamburger);
    return nodes;
  }

  hamburger.addEventListener('click', function() {
    setMobileMenuOpen(!mobileMenuOpen);
    if (mobileMenuOpen && navUl) {
      autoExpandSubmenu();
      var firstLink = navUl.querySelector('a');
      if (firstLink) firstLink.focus();
    }
  });

  function autoExpandSubmenu() {
    if (item && !item.classList.contains('is-open')) {
      var trigger = item.querySelector(':scope > a');
      var menu = item.querySelector('.submenu');
      item.classList.add('is-open');
      if (trigger) trigger.setAttribute('aria-expanded', 'true');
      if (menu) menu.removeAttribute('hidden');
    }
  }

  overlay.addEventListener('click', function() {
    setMobileMenuOpen(false);
    hamburger.focus();
  });

  window.addEventListener('resize', function() {
    if (!isMobileView()) {
      setMobileMenuOpen(false);
      setPageInert(false);
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Tab' && mobileMenuOpen) {
      var focusables = getDrawerFocusable();
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  if (!item) return;

  var trigger = item.querySelector(':scope > a');
  var menu = item.querySelector('.submenu');
  var touch = window.matchMedia('(hover: none)').matches;

  function isOpen() {
    return item.classList.contains('is-open');
  }

  function setOpen(open) {
    item.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', String(open));
    if (!menu) return;
    if (open) menu.removeAttribute('hidden');
    else menu.setAttribute('hidden', '');
  }

  function dismiss() {
    item.classList.add('is-dismissed');
    setOpen(false);
    trigger.focus();
  }

  function clearDismissed() {
    item.classList.remove('is-dismissed');
  }

  setOpen(false);

  item.addEventListener('mouseenter', function () {
    if (isMobileView()) return;
    if (touch) return;
    if (item.classList.contains('is-dismissed')) return;
    setOpen(true);
  });
  
  item.addEventListener('mouseleave', function () {
    if (isMobileView()) return;
    if (touch) return;
    clearDismissed();
    if (!item.contains(document.activeElement)) setOpen(false);
  });

  trigger.addEventListener('click', function(e) {
    if (isMobileView()) {
      e.preventDefault();
      clearDismissed();
      setOpen(!isOpen());
    } else if (touch && !isOpen()) {
      e.preventDefault();
      clearDismissed();
      setOpen(true);
    }
  });

  item.addEventListener('focusin', function () {
    if (isMobileView()) return;
    if (item.classList.contains('is-dismissed')) return;
    setOpen(true);
  });

  item.addEventListener('focusout', function (e) {
    if (isMobileView()) return;
    if (!item.contains(e.relatedTarget)) {
      clearDismissed();
      setOpen(false);
    }
  });

  document.addEventListener('click', function (e) {
    if (!item.contains(e.target) && !hamburger.contains(e.target)) {
      clearDismissed();
      setOpen(false);
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    
    if (mobileMenuOpen) {
      e.preventDefault();
      setMobileMenuOpen(false);
      hamburger.focus();
      return;
    }
    
    if (!isOpen() && !item.contains(document.activeElement)) return;
    e.preventDefault();
    dismiss();
  });
})();
