'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const { loadScript } = require('./helpers');

function loadNav(options) {
  var opts = options || {};
  var mobile = !!opts.mobile;
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

  var mediaState = {
    mobile: mobile,
    hoverNone: !!opts.hoverNone,
    reducedMotion: true
  };

  var dom = new JSDOM(html, {
    url: 'http://127.0.0.1/index.html',
    pretendToBeVisual: true,
    runScripts: 'outside-only',
    beforeParse: function (window) {
      window.matchMedia = function (query) {
        var q = String(query);
        var matches = false;
        if (q.indexOf('max-width: 780px') !== -1) matches = mediaState.mobile;
        else if (q.indexOf('hover: none') !== -1) matches = mediaState.hoverNone;
        else if (q.indexOf('prefers-reduced-motion') !== -1) matches = mediaState.reducedMotion;
        return {
          matches: matches,
          media: query,
          addEventListener: function () {},
          removeEventListener: function () {},
          addListener: function () {},
          removeListener: function () {},
          dispatchEvent: function () { return true; }
        };
      };
    }
  });

  loadScript(dom.window, 'nav.js');
  if (dom.window.document.readyState === 'loading') {
    dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded', { bubbles: true }));
  }
  return { dom: dom, win: dom.window, mediaState: mediaState };
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

  it('does not leave the submenu stuck open after a resize to desktop', function () {
    var ctx = loadNav({ mobile: true });
    ctx.win.document.querySelector('.nav-hamburger').click();
    assert.equal(ctx.win.document.querySelector('.has-submenu').classList.contains('is-open'), true);

    ctx.mediaState.mobile = false;
    ctx.win.dispatchEvent(new ctx.win.Event('resize'));

    var els = submenuEls(ctx.win.document);
    assert.equal(els.item.classList.contains('is-open'), false);
    assert.equal(els.trigger.getAttribute('aria-expanded'), 'false');
    assert.equal(ctx.win.document.querySelector('nav > ul').classList.contains('is-mobile-open'), false);
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
});
