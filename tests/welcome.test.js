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
    assert.equal(banner.getAttribute('role'), 'dialog');
    assert.equal(banner.getAttribute('aria-labelledby'), 'parkour-banner-title');
    assert.equal(banner.getAttribute('aria-describedby'), 'parkour-banner-desc');
    var accept = dom.window.document.getElementById('parkour-accept');
    var also = dom.window.document.getElementById('parkour-also-accept');
    assert.equal(accept.getAttribute('type'), 'button');
    assert.equal(also.getAttribute('type'), 'button');
    accept.click();
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
    assert.equal(sticker.getAttribute('role'), 'complementary');
    var closeBtn = sticker.querySelector('.parkour-sticker-close');
    assert.equal(closeBtn.getAttribute('aria-label'), 'Cerrar mensaje');
    assert.equal(closeBtn.getAttribute('type'), 'button');
    closeBtn.click();
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

    ['contacto.html', 'disenos.html', 'producto.html', 'envios.html'].forEach(function (file) {
      var other = loadWelcome(file);
      assert.equal(other.window.document.getElementById('parkour-sound-btn'), null, file);
      other.window.close();
    });
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
    assert.equal(btn.tagName, 'BUTTON');
    assert.equal(btn.getAttribute('type'), 'button');

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

  it('resets the sound button label when playback ends', function () {
    var dom = loadWelcome('index.html', { reducedMotion: true });
    var btn = dom.window.document.getElementById('parkour-sound-btn');
    btn.click();
    assert.equal(btn.textContent, 'basta');
    assert.equal(btn.getAttribute('aria-pressed'), 'true');

    var audio = dom.window.__parkourAudio;
    assert.ok(audio);
    audio.paused = true;
    audio.currentTime = 0;
    audio._emit('ended');

    assert.equal(btn.textContent, 'dale play');
    assert.match(btn.getAttribute('aria-label'), /dale play/);
    assert.equal(btn.getAttribute('aria-pressed'), 'false');
    dom.window.close();
  });

  it('keys the sticker to the site-root pathname separately from index.html', function () {
    var root = createDom({
      html: '<!DOCTYPE html><html><body><nav></nav><main></main></body></html>',
      url: 'http://127.0.0.1/',
      scripts: ['welcome.js']
    });
    var sticker = root.window.document.getElementById('parkour-sticker');
    assert.ok(sticker);
    sticker.querySelector('.parkour-sticker-close').click();
    assert.equal(root.window.sessionStorage.getItem('parkour_sticker_/'), '1');
    assert.equal(root.window.sessionStorage.getItem('parkour_sticker_/index.html'), null);
    root.window.close();
  });

  it('mounts the home sound button on body when there is no nav', function () {
    var dom = createDom({
      html: '<!DOCTYPE html><html><body><main></main></body></html>',
      file: 'index.html',
      scripts: ['welcome.js'],
      reducedMotion: true
    });
    var btn = dom.window.document.getElementById('parkour-sound-btn');
    assert.ok(btn);
    assert.equal(btn.parentNode, dom.window.document.body);
    dom.window.close();
  });

  it('does not throw if Escape is pressed after the banner was dismissed', function () {
    var dom = loadWelcome('contacto.html');
    dom.window.document.getElementById('parkour-accept').click();
    assert.doesNotThrow(function () {
      pressEscape(dom.window);
    });
    assert.equal(dom.window.document.getElementById('parkour-welcome-banner'), null);
    dom.window.close();
  });

  it('keys the sticker to the ficha pathname so different ?id= values share the dismiss', function () {
    var crush = createDom({
      html: '<!DOCTYPE html><html><body><nav></nav><main></main></body></html>',
      file: 'producto.html',
      search: '?id=crush',
      scripts: ['welcome.js']
    });
    var sticker = crush.window.document.getElementById('parkour-sticker');
    assert.ok(sticker);
    sticker.querySelector('.parkour-sticker-close').click();
    assert.equal(crush.window.sessionStorage.getItem('parkour_sticker_/producto.html'), '1');
    assert.equal(crush.window.sessionStorage.getItem('parkour_sticker_/producto.html?id=crush'), null);

    var alexa = createDom({
      html: '<!DOCTYPE html><html><body><nav></nav><main></main></body></html>',
      file: 'producto.html',
      search: '?id=alexa'
    });
    alexa.window.sessionStorage.setItem('parkour_sticker_/producto.html', '1');
    loadScript(alexa.window, 'welcome.js');
    flushDomReady(alexa.window);
    assert.equal(alexa.window.document.getElementById('parkour-sticker'), null);
    crush.window.close();
    alexa.window.close();
  });

  it('still mounts the home sound button when index.html has a query string', function () {
    var dom = createDom({
      html: '<!DOCTYPE html><html><body><nav></nav><main></main></body></html>',
      file: 'index.html',
      search: '?utm_source=ig',
      scripts: ['welcome.js'],
      reducedMotion: true
    });
    assert.ok(dom.window.document.getElementById('parkour-sound-btn'));
    dom.window.close();
  });

  it('records sound autoplay in sessionStorage and not localStorage', function () {
    var dom = loadWelcome('index.html', { reducedMotion: false });
    assert.equal(dom.window.sessionStorage.getItem('parkour_sound_autoplayed'), '1');
    assert.equal(dom.window.localStorage.getItem('parkour_sound_autoplayed'), null);
    dom.window.close();
  });

  it('records banner dismiss in localStorage and not sessionStorage', function () {
    var dom = loadWelcome('contacto.html');
    dom.window.document.getElementById('parkour-accept').click();
    assert.equal(dom.window.localStorage.getItem('parkour_welcome_seen'), '1');
    assert.equal(dom.window.sessionStorage.getItem('parkour_welcome_seen'), null);
    dom.window.close();
  });

  it('stops home sound and rewinds to the start on the second click', function () {
    var dom = loadWelcome('index.html', { reducedMotion: true });
    var btn = dom.window.document.getElementById('parkour-sound-btn');
    btn.click();
    var audio = dom.window.__parkourAudio;
    assert.ok(audio);
    assert.equal(audio.paused, false);
    audio.currentTime = 12;

    btn.click();
    assert.equal(audio.paused, true);
    assert.equal(audio.currentTime, 0);
    assert.equal(btn.getAttribute('aria-pressed'), 'false');
    assert.equal(btn.textContent, 'dale play');
    dom.window.close();
  });

  it('renders a sticker from the hardcoded copy without injecting markup', function () {
    var allowed = [
      "Ta' bien si no comprás nada, igual te queremos.",
      'Remeras: porque los tatuajes duelen.',
      'El algoritmo te trajo, el diseño te queda.',
      'Somos 2 amig@s con un estampador y un sueño.',
      'Si no te gusta ninguna, inventamos una para vos (mentira).'
    ];
    var dom = loadWelcome('contacto.html');
    var text = dom.window.document.querySelector('.parkour-sticker-text').textContent;
    assert.ok(allowed.indexOf(text) !== -1, text);
    assert.equal(/[<>]/.test(text), false);
    assert.equal(dom.window.document.querySelector('.parkour-sticker-text').children.length, 0);
    dom.window.close();
  });

  it('loads the home sound from the checked-in mp3 filename', function () {
    var dom = loadWelcome('index.html', { reducedMotion: true });
    assert.equal(dom.window.__parkourAudioSrc, 'parkour-parkour.mp3');
    assert.equal(dom.window.__parkourAudio.src, 'parkour-parkour.mp3');
    dom.window.close();
  });

  it('records the autoplay session key when sound is started by a click', function () {
    var dom = loadWelcome('index.html', { reducedMotion: true });
    assert.equal(dom.window.sessionStorage.getItem('parkour_sound_autoplayed'), null);
    dom.window.document.getElementById('parkour-sound-btn').click();
    assert.equal(dom.window.sessionStorage.getItem('parkour_sound_autoplayed'), '1');
    assert.equal(dom.window.localStorage.getItem('parkour_sound_autoplayed'), null);
    dom.window.close();
  });

  it('does not throw when the browser blocks home sound autoplay', function () {
    var playCalls = 0;
    var dom = createDom({
      html: '<!DOCTYPE html><html><body><nav></nav><main></main></body></html>',
      file: 'index.html',
      reducedMotion: false,
      setupWindow: function (window) {
        window.Audio = function Audio(src) {
          this.src = src || '';
          this.paused = true;
          this.currentTime = 0;
          this.addEventListener = function () {};
          this.play = function () {
            playCalls += 1;
            return Promise.reject(Object.assign(new Error('play blocked'), { name: 'NotAllowedError' }));
          };
          this.pause = function () {};
          window.__parkourAudio = this;
        };
      },
      scripts: ['welcome.js']
    });
    var btn = dom.window.document.getElementById('parkour-sound-btn');
    assert.ok(btn);
    assert.equal(btn.getAttribute('aria-pressed'), 'false');
    assert.ok(playCalls >= 1);
    assert.doesNotThrow(function () {
      btn.click();
    });
    assert.ok(playCalls >= 2);
    assert.equal(dom.window.sessionStorage.getItem('parkour_sound_autoplayed'), null);
    dom.window.close();
  });
});
