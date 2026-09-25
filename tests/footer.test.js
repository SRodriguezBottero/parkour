'use strict';

const fs = require('fs');
const path = require('path');
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { createDom, pageStyleText, ROOT } = require('./helpers');

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

  it('points the skip link at main on every page', function () {
    PAGES.forEach(function (file) {
      var dom = createDom({ file: file });
      var skip = dom.window.document.querySelector('a.skip-link');
      var mainEl = dom.window.document.getElementById('main');
      assert.ok(skip, file + ' is missing the skip link');
      assert.equal(skip.getAttribute('href'), '#main');
      assert.ok(mainEl, file + ' is missing #main');
      assert.equal(mainEl.tagName, 'MAIN');
      dom.window.close();
    });
  });

  it('marks external Instagram links as opening in a new tab safely', function () {
    PAGES.forEach(function (file) {
      var dom = createDom({ file: file });
      var igLinks = dom.window.document.querySelectorAll('a[href*="instagram.com"]');
      assert.ok(igLinks.length > 0, file + ' is missing Instagram links');
      Array.prototype.forEach.call(igLinks, function (link) {
        assert.equal(link.getAttribute('target'), '_blank', file);
        assert.equal(link.getAttribute('rel'), 'noopener noreferrer', file);
      });
      dom.window.close();
    });
  });

  it('includes the shared scripts on every page so pedido and nav still boot', function () {
    PAGES.forEach(function (file) {
      var html = fs.readFileSync(path.join(ROOT, file), 'utf8');
      assert.match(html, /<script src="products\.js"><\/script>/, file);
      assert.match(html, /<script src="pedido\.js"><\/script>/, file);
      assert.match(html, /<script src="nav\.js"><\/script>/, file);
      assert.match(html, /<script src="welcome\.js"><\/script>/, file);
      var productsAt = html.indexOf('src="products.js"');
      var pedidoAt = html.indexOf('src="pedido.js"');
      assert.ok(productsAt !== -1 && pedidoAt > productsAt, file + ' must load products.js before pedido.js');
    });
  });
});
