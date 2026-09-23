'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { createDom, pressEscape, pressTab } = require('./helpers');

function loadNav(options) {
  var opts = options || {};
  var html = [
    '<!DOCTYPE html><html><body>',
    '<nav><ul>',
    '<li class="has-submenu">',
    '<a href="disenos.html" aria-haspopup="menu" aria-expanded="false" aria-controls="submenu-disenos">Diseños</a>',
    '<ul class="submenu" id="submenu-disenos" hidden><li><a href="disenos.html">Todos</a></li></ul>',
    '</li>',
    '<li><a href="index.html#about">Nosotr@s</a></li>',
    '</ul></nav>',
    '<main></main><footer></footer>',
    '</body></html>'
  ].join('');

  var dom = createDom({
    html: html,
    file: 'index.html',
    scripts: ['nav.js'],
    mobile: !!opts.mobile,
    hoverNone: !!opts.hoverNone
  });
  return { dom: dom, win: dom.window };
}

function submenuEls(doc) {
  var item = doc.querySelector('.has-submenu');
  var trigger = item.querySelector(':scope > a');
  var menu = item.querySelector('.submenu');
  return { item: item, trigger: trigger, menu: menu };
}

describe('nav.js mobile drawer and submenu', function () {
  it('starts with the Diseños submenu closed on desktop', function () {
    var ctx = loadNav({ mobile: false });
    var els = submenuEls(ctx.win.document);
    assert.equal(els.item.classList.contains('is-open'), false);
    assert.equal(els.trigger.getAttribute('aria-expanded'), 'false');
    assert.equal(els.menu.hasAttribute('hidden'), true);
    ctx.dom.window.close();
  });

  it('auto-expands Diseños when the mobile drawer opens', function () {
    var ctx = loadNav({ mobile: true });
    var hamburger = ctx.win.document.querySelector('.nav-hamburger');
    hamburger.click();
    var els = submenuEls(ctx.win.document);
    assert.equal(els.item.classList.contains('is-open'), true);
    assert.equal(els.trigger.getAttribute('aria-expanded'), 'true');
    assert.equal(els.menu.hasAttribute('hidden'), false);
    ctx.dom.window.close();
  });

  it('resets submenu state when the mobile drawer closes', function () {
    var ctx = loadNav({ mobile: true });
    var doc = ctx.win.document;
    var hamburger = doc.querySelector('.nav-hamburger');
    hamburger.click();
    assert.equal(doc.querySelector('.has-submenu').classList.contains('is-open'), true);

    hamburger.click();
    var els = submenuEls(doc);
    assert.equal(els.item.classList.contains('is-open'), false);
    assert.equal(els.item.classList.contains('is-dismissed'), false);
    assert.equal(els.trigger.getAttribute('aria-expanded'), 'false');
    assert.equal(els.menu.hasAttribute('hidden'), true);
    ctx.dom.window.close();
  });

  it('resets the submenu when the overlay closes the drawer', function () {
    var ctx = loadNav({ mobile: true });
    var doc = ctx.win.document;
    doc.querySelector('.nav-hamburger').click();
    assert.equal(doc.querySelector('.has-submenu').classList.contains('is-open'), true);

    doc.querySelector('.nav-overlay').click();
    var els = submenuEls(doc);
    assert.equal(els.item.classList.contains('is-open'), false);
    assert.equal(els.menu.hasAttribute('hidden'), true);
    ctx.dom.window.close();
  });

  it('returns focus to the hamburger when the overlay closes the drawer', function () {
    var ctx = loadNav({ mobile: true });
    var doc = ctx.win.document;
    var hamburger = doc.querySelector('.nav-hamburger');
    hamburger.click();
    assert.equal(doc.activeElement, doc.querySelector('nav > ul a'));

    doc.querySelector('.nav-overlay').click();
    assert.equal(doc.querySelector('nav > ul').classList.contains('is-mobile-open'), false);
    assert.equal(doc.activeElement, hamburger);
    ctx.dom.window.close();
  });

  it('does not leave the submenu stuck open after a resize to desktop', function () {
    var ctx = loadNav({ mobile: true });
    ctx.win.document.querySelector('.nav-hamburger').click();
    assert.equal(ctx.win.document.querySelector('.has-submenu').classList.contains('is-open'), true);

    ctx.win.__parkourMedia.mobile = false;
    ctx.win.dispatchEvent(new ctx.win.Event('resize'));

    var els = submenuEls(ctx.win.document);
    assert.equal(els.item.classList.contains('is-open'), false);
    assert.equal(els.trigger.getAttribute('aria-expanded'), 'false');
    assert.equal(ctx.win.document.querySelector('nav > ul').classList.contains('is-mobile-open'), false);
    ctx.dom.window.close();
  });

  it('clears main/footer inert when the viewport resizes to desktop', function () {
    var ctx = loadNav({ mobile: true });
    var doc = ctx.win.document;
    doc.querySelector('.nav-hamburger').click();
    assert.equal(doc.querySelector('main').inert, true);
    assert.equal(doc.querySelector('footer').inert, true);

    ctx.win.__parkourMedia.mobile = false;
    ctx.win.dispatchEvent(new ctx.win.Event('resize'));

    assert.equal(!!doc.querySelector('main').inert, false);
    assert.equal(!!doc.querySelector('footer').inert, false);
    assert.equal(doc.body.style.overflow, '');
    ctx.dom.window.close();
  });

  it('toggles the mobile submenu on Diseños click without following the link', function () {
    var ctx = loadNav({ mobile: true });
    var doc = ctx.win.document;
    doc.querySelector('.nav-hamburger').click();
    var els = submenuEls(doc);
    assert.equal(els.item.classList.contains('is-open'), true);

    var event = new ctx.win.MouseEvent('click', { bubbles: true, cancelable: true });
    var prevented = !els.trigger.dispatchEvent(event);
    assert.equal(prevented, true);
    assert.equal(els.item.classList.contains('is-open'), false);

    els.trigger.dispatchEvent(new ctx.win.MouseEvent('click', { bubbles: true, cancelable: true }));
    assert.equal(els.item.classList.contains('is-open'), true);
    ctx.dom.window.close();
  });

  it('closes the mobile drawer on Escape and returns focus to the hamburger', function () {
    var ctx = loadNav({ mobile: true });
    var doc = ctx.win.document;
    var hamburger = doc.querySelector('.nav-hamburger');
    hamburger.click();
    assert.equal(doc.querySelector('nav > ul').classList.contains('is-mobile-open'), true);

    pressEscape(ctx.win);

    assert.equal(doc.querySelector('nav > ul').classList.contains('is-mobile-open'), false);
    assert.equal(doc.activeElement, hamburger);
    ctx.dom.window.close();
  });

  it('opens the desktop submenu on hover and closes it on mouseleave', function () {
    var ctx = loadNav({ mobile: false });
    var els = submenuEls(ctx.win.document);

    els.item.dispatchEvent(new ctx.win.Event('mouseenter', { bubbles: true }));
    assert.equal(els.item.classList.contains('is-open'), true);
    assert.equal(els.trigger.getAttribute('aria-expanded'), 'true');
    assert.equal(els.menu.hasAttribute('hidden'), false);

    els.item.dispatchEvent(new ctx.win.Event('mouseleave', { bubbles: true }));
    assert.equal(els.item.classList.contains('is-open'), false);
    assert.equal(els.trigger.getAttribute('aria-expanded'), 'false');
    assert.equal(els.menu.hasAttribute('hidden'), true);
    ctx.dom.window.close();
  });

  it('dismisses the desktop submenu on Escape and does not reopen on hover until mouseleave', function () {
    var ctx = loadNav({ mobile: false });
    var els = submenuEls(ctx.win.document);

    els.item.dispatchEvent(new ctx.win.Event('mouseenter', { bubbles: true }));
    assert.equal(els.item.classList.contains('is-open'), true);

    pressEscape(ctx.win);
    assert.equal(els.item.classList.contains('is-open'), false);
    assert.equal(els.item.classList.contains('is-dismissed'), true);
    assert.equal(els.trigger.getAttribute('aria-expanded'), 'false');

    els.item.dispatchEvent(new ctx.win.Event('mouseenter', { bubbles: true }));
    assert.equal(els.item.classList.contains('is-open'), false);

    els.item.dispatchEvent(new ctx.win.Event('mouseleave', { bubbles: true }));
    els.item.dispatchEvent(new ctx.win.Event('mouseenter', { bubbles: true }));
    assert.equal(els.item.classList.contains('is-open'), true);
    ctx.dom.window.close();
  });

  it('on touch desktop, the first Diseños click opens the submenu without navigating', function () {
    var ctx = loadNav({ mobile: false, hoverNone: true });
    var els = submenuEls(ctx.win.document);
    var event = new ctx.win.MouseEvent('click', { bubbles: true, cancelable: true });
    var prevented = !els.trigger.dispatchEvent(event);
    assert.equal(prevented, true);
    assert.equal(els.item.classList.contains('is-open'), true);
    assert.equal(els.menu.hasAttribute('hidden'), false);
    ctx.dom.window.close();
  });

  it('on touch desktop, the second Diseños click is not intercepted so navigation can proceed', function () {
    var ctx = loadNav({ mobile: false, hoverNone: true });
    var els = submenuEls(ctx.win.document);

    var first = new ctx.win.MouseEvent('click', { bubbles: true, cancelable: true });
    assert.equal(!els.trigger.dispatchEvent(first), true);
    assert.equal(els.item.classList.contains('is-open'), true);

    var second = new ctx.win.MouseEvent('click', { bubbles: true, cancelable: true });
    var prevented = !els.trigger.dispatchEvent(second);
    assert.equal(prevented, false);
    assert.equal(els.item.classList.contains('is-open'), true);
    ctx.dom.window.close();
  });

  it('does not intercept Diseños clicks on pointer desktop', function () {
    var ctx = loadNav({ mobile: false, hoverNone: false });
    var els = submenuEls(ctx.win.document);
    var event = new ctx.win.MouseEvent('click', { bubbles: true, cancelable: true });
    var prevented = !els.trigger.dispatchEvent(event);
    assert.equal(prevented, false);
    ctx.dom.window.close();
  });

  it('wraps Tab from the hamburger back to the first drawer link', function () {
    var ctx = loadNav({ mobile: true });
    var doc = ctx.win.document;
    var hamburger = doc.querySelector('.nav-hamburger');
    hamburger.click();

    hamburger.focus();
    var tab = pressTab(ctx.win, false);
    assert.equal(tab.defaultPrevented, true);
    assert.equal(doc.activeElement, doc.querySelector('nav > ul a'));

    var shiftTab = pressTab(ctx.win, true);
    assert.equal(shiftTab.defaultPrevented, true);
    assert.equal(doc.activeElement, hamburger);
    ctx.dom.window.close();
  });

  it('marks main and footer inert while the mobile drawer is open', function () {
    var ctx = loadNav({ mobile: true });
    var doc = ctx.win.document;
    var mainEl = doc.querySelector('main');
    var footerEl = doc.querySelector('footer');

    assert.equal(!!mainEl.inert, false);
    assert.equal(!!footerEl.inert, false);

    doc.querySelector('.nav-hamburger').click();
    assert.equal(mainEl.inert, true);
    assert.equal(footerEl.inert, true);

    pressEscape(ctx.win);
    assert.equal(!!mainEl.inert, false);
    assert.equal(!!footerEl.inert, false);
    ctx.dom.window.close();
  });

  it('locks body scroll and expands the hamburger while the drawer is open', function () {
    var ctx = loadNav({ mobile: true });
    var doc = ctx.win.document;
    var hamburger = doc.querySelector('.nav-hamburger');
    var firstLink = doc.querySelector('nav > ul a');

    hamburger.click();
    assert.equal(hamburger.getAttribute('aria-expanded'), 'true');
    assert.equal(doc.body.style.overflow, 'hidden');
    assert.equal(doc.activeElement, firstLink);

    hamburger.click();
    assert.equal(hamburger.getAttribute('aria-expanded'), 'false');
    assert.equal(doc.body.style.overflow, '');
    ctx.dom.window.close();
  });

  it('closes the desktop submenu when clicking outside of it', function () {
    var ctx = loadNav({ mobile: false });
    var els = submenuEls(ctx.win.document);

    els.item.dispatchEvent(new ctx.win.Event('mouseenter', { bubbles: true }));
    assert.equal(els.item.classList.contains('is-open'), true);

    ctx.win.document.querySelector('main').dispatchEvent(
      new ctx.win.MouseEvent('click', { bubbles: true, cancelable: true })
    );
    assert.equal(els.item.classList.contains('is-open'), false);
    assert.equal(els.trigger.getAttribute('aria-expanded'), 'false');
    assert.equal(els.menu.hasAttribute('hidden'), true);
    ctx.dom.window.close();
  });

  it('opens the desktop submenu on keyboard focus and closes it on focusout', function () {
    var ctx = loadNav({ mobile: false });
    var els = submenuEls(ctx.win.document);

    els.trigger.dispatchEvent(new ctx.win.FocusEvent('focusin', { bubbles: true }));
    assert.equal(els.item.classList.contains('is-open'), true);
    assert.equal(els.trigger.getAttribute('aria-expanded'), 'true');

    els.trigger.dispatchEvent(new ctx.win.FocusEvent('focusout', {
      bubbles: true,
      relatedTarget: ctx.win.document.querySelector('main')
    }));
    assert.equal(els.item.classList.contains('is-open'), false);
    assert.equal(els.item.classList.contains('is-dismissed'), false);
    ctx.dom.window.close();
  });

  it('keeps the desktop submenu open when focus moves into a category link', function () {
    var ctx = loadNav({ mobile: false });
    var els = submenuEls(ctx.win.document);
    var category = els.menu.querySelector('a');

    els.trigger.dispatchEvent(new ctx.win.FocusEvent('focusin', { bubbles: true }));
    assert.equal(els.item.classList.contains('is-open'), true);

    els.trigger.dispatchEvent(new ctx.win.FocusEvent('focusout', {
      bubbles: true,
      relatedTarget: category
    }));
    assert.equal(els.item.classList.contains('is-open'), true);
    assert.equal(els.menu.hasAttribute('hidden'), false);
    ctx.dom.window.close();
  });

  it('keeps the desktop submenu open on mouseleave while it still has focus', function () {
    var ctx = loadNav({ mobile: false });
    var els = submenuEls(ctx.win.document);

    els.trigger.focus();
    els.item.dispatchEvent(new ctx.win.Event('mouseenter', { bubbles: true }));
    assert.equal(els.item.classList.contains('is-open'), true);

    els.item.dispatchEvent(new ctx.win.Event('mouseleave', { bubbles: true }));
    assert.equal(els.item.classList.contains('is-open'), true);
    assert.equal(els.trigger.getAttribute('aria-expanded'), 'true');
    ctx.dom.window.close();
  });

  it('does not close the desktop submenu when clicking a category inside it', function () {
    var ctx = loadNav({ mobile: false });
    var els = submenuEls(ctx.win.document);

    els.item.dispatchEvent(new ctx.win.Event('mouseenter', { bubbles: true }));
    assert.equal(els.item.classList.contains('is-open'), true);

    els.menu.querySelector('a').dispatchEvent(
      new ctx.win.MouseEvent('click', { bubbles: true, cancelable: true })
    );
    assert.equal(els.item.classList.contains('is-open'), true);
    assert.equal(els.menu.hasAttribute('hidden'), false);
    ctx.dom.window.close();
  });

  it('wires the hamburger to the nav menu id for assistive controls', function () {
    var ctx = loadNav({ mobile: true });
    var hamburger = ctx.win.document.querySelector('.nav-hamburger');
    var menu = ctx.win.document.getElementById('nav-menu');
    assert.ok(menu);
    assert.equal(menu, ctx.win.document.querySelector('nav > ul'));
    assert.equal(hamburger.getAttribute('aria-controls'), 'nav-menu');
    assert.equal(hamburger.getAttribute('aria-label'), 'Menú de navegación');
    ctx.dom.window.close();
  });

  it('does not trap Tab when the mobile drawer is closed', function () {
    var ctx = loadNav({ mobile: true });
    var hamburger = ctx.win.document.querySelector('.nav-hamburger');
    hamburger.focus();
    var tab = pressTab(ctx.win, false);
    assert.equal(tab.defaultPrevented, false);
    ctx.dom.window.close();
  });

  it('skips collapsed submenu links when wrapping Tab in the mobile drawer', function () {
    var ctx = loadNav({ mobile: true });
    var doc = ctx.win.document;
    var hamburger = doc.querySelector('.nav-hamburger');
    hamburger.click();

    var els = submenuEls(doc);
    els.trigger.dispatchEvent(new ctx.win.MouseEvent('click', { bubbles: true, cancelable: true }));
    assert.equal(els.item.classList.contains('is-open'), false);
    assert.equal(els.menu.hasAttribute('hidden'), true);

    var firstLink = doc.querySelector('nav > ul a');
    firstLink.focus();
    var shiftTab = pressTab(ctx.win, true);
    assert.equal(shiftTab.defaultPrevented, true);
    assert.equal(doc.activeElement, hamburger);
    assert.notEqual(doc.activeElement, els.menu.querySelector('a'));
    ctx.dom.window.close();
  });

  it('ignores hover and focusin on the mobile Diseños item so a collapsed submenu stays closed', function () {
    var ctx = loadNav({ mobile: true });
    var doc = ctx.win.document;
    doc.querySelector('.nav-hamburger').click();
    var els = submenuEls(doc);
    els.trigger.dispatchEvent(new ctx.win.MouseEvent('click', { bubbles: true, cancelable: true }));
    assert.equal(els.item.classList.contains('is-open'), false);

    els.item.dispatchEvent(new ctx.win.Event('mouseenter', { bubbles: true }));
    assert.equal(els.item.classList.contains('is-open'), false);
    assert.equal(els.menu.hasAttribute('hidden'), true);

    els.trigger.dispatchEvent(new ctx.win.FocusEvent('focusin', { bubbles: true }));
    assert.equal(els.item.classList.contains('is-open'), false);
    assert.equal(els.trigger.getAttribute('aria-expanded'), 'false');
    ctx.dom.window.close();
  });

  it('returns focus to Diseños when Escape dismisses the desktop submenu', function () {
    var ctx = loadNav({ mobile: false });
    var els = submenuEls(ctx.win.document);

    els.item.dispatchEvent(new ctx.win.Event('mouseenter', { bubbles: true }));
    assert.equal(els.item.classList.contains('is-open'), true);

    pressEscape(ctx.win);
    assert.equal(els.item.classList.contains('is-open'), false);
    assert.equal(els.item.classList.contains('is-dismissed'), true);
    assert.equal(ctx.win.document.activeElement, els.trigger);
    ctx.dom.window.close();
  });

  it('dismisses the desktop submenu with Escape even when a category link is focused', function () {
    var ctx = loadNav({ mobile: false });
    var els = submenuEls(ctx.win.document);
    var category = els.menu.querySelector('a');

    els.trigger.dispatchEvent(new ctx.win.FocusEvent('focusin', { bubbles: true }));
    category.focus();
    assert.equal(els.item.classList.contains('is-open'), true);

    pressEscape(ctx.win);
    assert.equal(els.item.classList.contains('is-open'), false);
    assert.equal(els.item.classList.contains('is-dismissed'), true);
    assert.equal(ctx.win.document.activeElement, els.trigger);
    ctx.dom.window.close();
  });

  it('does not steal focus when Escape is pressed with the submenu and drawer closed', function () {
    var ctx = loadNav({ mobile: false });
    var mainEl = ctx.win.document.querySelector('main');
    mainEl.setAttribute('tabindex', '-1');
    mainEl.focus();

    var esc = pressEscape(ctx.win);
    assert.equal(esc.defaultPrevented, false);
    var els = submenuEls(ctx.win.document);
    assert.equal(els.item.classList.contains('is-open'), false);
    assert.equal(els.item.classList.contains('is-dismissed'), false);
    assert.equal(ctx.win.document.activeElement, mainEl);
    ctx.dom.window.close();
  });

  it('still toggles Diseños with preventDefault on mobile when hover is none', function () {
    var ctx = loadNav({ mobile: true, hoverNone: true });
    var doc = ctx.win.document;
    doc.querySelector('.nav-hamburger').click();
    var els = submenuEls(doc);
    assert.equal(els.item.classList.contains('is-open'), true);

    var event = new ctx.win.MouseEvent('click', { bubbles: true, cancelable: true });
    var prevented = !els.trigger.dispatchEvent(event);
    assert.equal(prevented, true);
    assert.equal(els.item.classList.contains('is-open'), false);
    ctx.dom.window.close();
  });

  it('closes the desktop submenu when focus leaves and relatedTarget is null', function () {
    var ctx = loadNav({ mobile: false });
    var els = submenuEls(ctx.win.document);

    els.trigger.dispatchEvent(new ctx.win.FocusEvent('focusin', { bubbles: true }));
    assert.equal(els.item.classList.contains('is-open'), true);

    els.trigger.dispatchEvent(new ctx.win.FocusEvent('focusout', {
      bubbles: true,
      relatedTarget: null
    }));
    assert.equal(els.item.classList.contains('is-open'), false);
    assert.equal(els.item.classList.contains('is-dismissed'), false);
    ctx.dom.window.close();
  });

  it('does not open or lock the page when resizing to desktop with the drawer already closed', function () {
    var ctx = loadNav({ mobile: true });
    var doc = ctx.win.document;
    assert.equal(doc.querySelector('nav > ul').classList.contains('is-mobile-open'), false);

    ctx.win.__parkourMedia.mobile = false;
    ctx.win.dispatchEvent(new ctx.win.Event('resize'));

    assert.equal(doc.querySelector('nav > ul').classList.contains('is-mobile-open'), false);
    assert.equal(doc.body.style.overflow, '');
    assert.equal(!!doc.querySelector('main').inert, false);
    ctx.dom.window.close();
  });
});
