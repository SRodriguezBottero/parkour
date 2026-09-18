'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { createDom, pageStyleText } = require('./helpers');

var PAGES = ['index.html', 'disenos.html', 'producto.html', 'contacto.html', 'envios.html'];

describe('footer decorative GIF', function () {
  it('marks the footer GIF as decorative on every page', function () {
    PAGES.forEach(function (file) {
      var dom = createDom({ file: file });
      var img = dom.window.document.querySelector('footer img.footer-art');
      assert.ok(img, file + ' is missing footer art');
      assert.equal(img.getAttribute('src'), 'assets/parkour-footer.gif');
      assert.equal(img.getAttribute('alt'), '');
      assert.equal(img.getAttribute('aria-hidden'), 'true');
      dom.window.close();
    });
  });

  it('gives the linked nav logo a non-empty alt on every page', function () {
    PAGES.forEach(function (file) {
      var dom = createDom({ file: file });
      var logo = dom.window.document.querySelector('nav a.logo img');
      assert.ok(logo, file + ' is missing the nav logo');
      assert.ok(String(logo.getAttribute('alt') || '').trim(), file + ' logo alt is empty');
      dom.window.close();
    });
  });

  it('hides the animated footer GIF when reduced motion is requested', function () {
    PAGES.forEach(function (file) {
      var dom = createDom({ file: file });
      var css = pageStyleText(dom.window.document);
      assert.match(css, /prefers-reduced-motion:\s*reduce/);
      assert.match(css, /\.footer-art\s*\{\s*display:\s*none;/);
      dom.window.close();
    });
  });
});
