'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { createDom, loadScript, flushDomReady, pressEscape } = require('./helpers');

function loadWelcome(file, options) {
  var opts = options || {};
  return createDom({
    html: '<!DOCTYPE html><html><body><nav></nav><main></main></body></html>',
    file: file,
    scripts: ['welcome.js'],
    reducedMotion: opts.reducedMotion
  });
}

describe('welcome.js banner and per-page sticker', function () {
  it('shows the cookie parody banner until it is dismissed', function () {
    var dom = loadWelcome('contacto.html');
    var banner = dom.window.document.getElementById('parkour-welcome-banner');
    assert.ok(banner);
    dom.window.document.getElementById('parkour-accept').click();
    assert.equal(dom.window.localStorage.getItem('parkour_welcome_seen'), '1');
    assert.equal(dom.window.document.getElementById('parkour-welcome-banner'), null);
    dom.window.close();
  });

  it('dismisses the banner with También aceptar and with Escape', function () {
    var also = loadWelcome('contacto.html');
    also.window.document.getElementById('parkour-also-accept').click();
    assert.equal(also.window.localStorage.getItem('parkour_welcome_seen'), '1');
    assert.equal(also.window.document.getElementById('parkour-welcome-banner'), null);
    also.window.close();

    var esc = loadWelcome('contacto.html');
    pressEscape(esc.window);
    assert.equal(esc.window.localStorage.getItem('parkour_welcome_seen'), '1');
    assert.equal(esc.window.document.getElementById('parkour-welcome-banner'), null);
    esc.window.close();
  });

  it('does not show the banner again after it was accepted', function () {
    var dom = createDom({
      html: '<!DOCTYPE html><html><body><nav></nav><main></main></body></html>',
      file: 'contacto.html'
    });
    dom.window.localStorage.setItem('parkour_welcome_seen', '1');
    loadScript(dom.window, 'welcome.js');
    flushDomReady(dom.window);
    assert.equal(dom.window.document.getElementById('parkour-welcome-banner'), null);
    dom.window.close();
  });

  it('stores sticker dismissals per pathname so other pages still show it', function () {
    var home = loadWelcome('index.html');
    var sticker = home.window.document.getElementById('parkour-sticker');
    assert.ok(sticker);
    sticker.querySelector('.parkour-sticker-close').click();
    assert.equal(home.window.sessionStorage.getItem('parkour_sticker_/index.html'), '1');
    assert.equal(home.window.document.getElementById('parkour-sticker'), null);

    var catalog = createDom({
      html: '<!DOCTYPE html><html><body><nav></nav><main></main></body></html>',
      file: 'disenos.html'
    });
    catalog.window.sessionStorage.setItem('parkour_sticker_/index.html', '1');
    loadScript(catalog.window, 'welcome.js');
    flushDomReady(catalog.window);
    assert.ok(catalog.window.document.getElementById('parkour-sticker'));
    assert.equal(catalog.window.sessionStorage.getItem('parkour_sticker_/disenos.html'), null);
    home.window.close();
    catalog.window.close();
  });

  it('does not recreate the sticker on the same path after dismiss', function () {
    var first = loadWelcome('envios.html');
    first.window.document.querySelector('.parkour-sticker-close').click();

    var second = createDom({
      html: '<!DOCTYPE html><html><body><nav></nav><main></main></body></html>',
      file: 'envios.html'
    });
    second.window.sessionStorage.setItem('parkour_sticker_/envios.html', '1');
    loadScript(second.window, 'welcome.js');
    flushDomReady(second.window);
    assert.equal(second.window.document.getElementById('parkour-sticker'), null);
    first.window.close();
    second.window.close();
  });

  it('mounts the sound button only on the home page', function () {
    var home = loadWelcome('index.html');
    assert.ok(home.window.document.getElementById('parkour-sound-btn'));
    home.window.close();

    var other = loadWelcome('contacto.html');
    assert.equal(other.window.document.getElementById('parkour-sound-btn'), null);
    other.window.close();
  });

  it('mounts the sound button on the site root path as well as index.html', function () {
    var root = createDom({
      html: '<!DOCTYPE html><html><body><nav></nav><main></main></body></html>',
      url: 'http://127.0.0.1/',
      scripts: ['welcome.js'],
      reducedMotion: true
    });
    assert.ok(root.window.document.getElementById('parkour-sound-btn'));
    root.window.close();
  });

  it('keeps the sound button accessible name matching its visible label', function () {
    var dom = loadWelcome('index.html');
    var btn = dom.window.document.getElementById('parkour-sound-btn');
    assert.equal(btn.textContent, 'dale play');
    assert.match(btn.getAttribute('aria-label'), /dale play/);
    assert.equal(btn.getAttribute('aria-pressed'), 'false');

    btn.click();
    assert.equal(btn.textContent, 'basta');
    assert.match(btn.getAttribute('aria-label'), /basta/);
    assert.equal(btn.getAttribute('aria-pressed'), 'true');

    btn.click();
    assert.equal(btn.textContent, 'dale play');
    assert.match(btn.getAttribute('aria-label'), /dale play/);
    assert.equal(btn.getAttribute('aria-pressed'), 'false');
    dom.window.close();
  });

  it('does not autoplay home sound when reduced motion is requested', function () {
    var dom = loadWelcome('index.html', { reducedMotion: true });
    var btn = dom.window.document.getElementById('parkour-sound-btn');
    assert.equal(btn.getAttribute('aria-pressed'), 'false');
    assert.equal(dom.window.sessionStorage.getItem('parkour_sound_autoplayed'), null);
    dom.window.close();
  });

  it('autoplays home sound once when reduced motion is off', function () {
    var first = loadWelcome('index.html', { reducedMotion: false });
    var btn = first.window.document.getElementById('parkour-sound-btn');
    assert.equal(btn.getAttribute('aria-pressed'), 'true');
    assert.equal(btn.textContent, 'basta');
    assert.equal(first.window.sessionStorage.getItem('parkour_sound_autoplayed'), '1');
    first.window.close();

    var second = createDom({
      html: '<!DOCTYPE html><html><body><nav></nav><main></main></body></html>',
      file: 'index.html',
      reducedMotion: false
    });
    second.window.sessionStorage.setItem('parkour_sound_autoplayed', '1');
    loadScript(second.window, 'welcome.js');
    flushDomReady(second.window);
    assert.equal(
      second.window.document.getElementById('parkour-sound-btn').getAttribute('aria-pressed'),
      'false'
    );
    second.window.close();
  });
});
