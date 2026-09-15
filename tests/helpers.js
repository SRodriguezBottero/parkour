'use strict';

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.resolve(__dirname, '..');

function stubMatchMedia(window, options) {
  var opts = options || {};
  window.__parkourMedia = opts;
  window.matchMedia = function (query) {
    var state = window.__parkourMedia || {};
    var matches = false;
    if (String(query).indexOf('max-width: 780px') !== -1) matches = !!state.mobile;
    else if (String(query).indexOf('hover: none') !== -1) matches = !!state.hoverNone;
    else if (String(query).indexOf('prefers-reduced-motion') !== -1) matches = state.reducedMotion !== false;
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

function stubAudio(window) {
  window.Audio = function Audio() {
    var listeners = {};
    this.paused = true;
    this.currentTime = 0;
    this.preload = '';
    this.addEventListener = function (type, fn) {
      (listeners[type] || (listeners[type] = [])).push(fn);
    };
    this.play = function () {
      this.paused = false;
      var list = listeners.play || [];
      for (var i = 0; i < list.length; i++) list[i]();
      return Promise.resolve();
    };
    this.pause = function () {
      this.paused = true;
    };
  };
}

function stripScripts(html) {
  return html.replace(/<script\b[\s\S]*?<\/script>/gi, '');
}

function extractInlineScripts(html) {
  var scripts = [];
  html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, function (_, attrs, code) {
    if (/\bsrc\s*=/.test(attrs)) return '';
    if (code && code.trim()) scripts.push(code);
    return '';
  });
  return scripts;
}

function loadScript(window, filename) {
  var code = fs.readFileSync(path.join(ROOT, filename), 'utf8');
  window.eval(code);
}

function flushDomReady(window) {
  if (window.document.readyState === 'loading') {
    window.document.dispatchEvent(new window.Event('DOMContentLoaded', { bubbles: true }));
  }
}

function createDom(options) {
  var opts = options || {};
  var file = opts.file;
  var search = opts.search || '';
  var html;

  if (opts.html) {
    html = opts.html;
  } else if (file) {
    html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  } else {
    html = '<!DOCTYPE html><html><body></body></html>';
  }

  var inline = [];
  if (opts.runInline) {
    inline = extractInlineScripts(html);
  }
  html = stripScripts(html);

  var urlFile = file || 'index.html';
  var url = 'http://127.0.0.1/' + urlFile + search;

  var media = {
    mobile: !!opts.mobile,
    hoverNone: !!opts.hoverNone,
    reducedMotion: opts.reducedMotion !== false
  };

  var dom = new JSDOM(html, {
    url: url,
    pretendToBeVisual: true,
    runScripts: 'outside-only',
    beforeParse: function (window) {
      stubMatchMedia(window, media);
      stubAudio(window);
      window.console.log = function () {};
    }
  });

  var scripts = opts.scripts || [];
  for (var i = 0; i < scripts.length; i++) {
    loadScript(dom.window, scripts[i]);
  }
  for (var j = 0; j < inline.length; j++) {
    dom.window.eval(inline[j]);
  }

  // jsdom leaves readyState at "loading" with runScripts: "outside-only".
  // Site scripts wait on DOMContentLoaded in that case.
  flushDomReady(dom.window);

  return dom;
}

function productCtaSearch(productName, size) {
  var text = encodeURIComponent('Hola! Quiero la remera "' + productName + '" talle ' + size);
  return '?msg=' + text + '&product=' + encodeURIComponent(productName) + '&size=' + size;
}

function fromWindow(value) {
  return JSON.parse(JSON.stringify(value));
}

module.exports = {
  ROOT: ROOT,
  createDom: createDom,
  loadScript: loadScript,
  flushDomReady: flushDomReady,
  productCtaSearch: productCtaSearch,
  stubMatchMedia: stubMatchMedia,
  fromWindow: fromWindow
};
