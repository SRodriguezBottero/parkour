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

  it('points the nav logo at the home page on every page', function () {
    PAGES.forEach(function (file) {
      var dom = createDom({ file: file });
      var logo = dom.window.document.querySelector('nav a.logo');
      assert.ok(logo, file + ' is missing the nav logo link');
      assert.equal(logo.getAttribute('href'), 'index.html', file);
      dom.window.close();
    });
  });

  it('keeps the footer GIF and home sound files in the repo', function () {
    assert.ok(fs.existsSync(path.join(ROOT, 'assets/parkour-footer.gif')));
    assert.ok(fs.existsSync(path.join(ROOT, 'parkour-parkour.mp3')));
  });

  it('wires the Diseños submenu trigger for assistive menus on every page', function () {
    PAGES.forEach(function (file) {
      var dom = createDom({ file: file });
      var trigger = dom.window.document.querySelector('nav .has-submenu > a');
      var menu = dom.window.document.getElementById('submenu-disenos');
      assert.ok(trigger, file);
      assert.equal(trigger.getAttribute('href'), 'disenos.html', file);
      assert.equal(trigger.getAttribute('aria-haspopup'), 'menu', file);
      assert.equal(trigger.getAttribute('aria-controls'), 'submenu-disenos', file);
      assert.equal(trigger.getAttribute('aria-expanded'), 'false', file);
      assert.ok(menu, file);
      assert.equal(menu.hasAttribute('hidden'), true, file);
      dom.window.close();
    });
  });

  it('declares Spanish as the document language on every page', function () {
    PAGES.forEach(function (file) {
      var dom = createDom({ file: file });
      assert.equal(dom.window.document.documentElement.getAttribute('lang'), 'es', file);
      dom.window.close();
    });
  });

  it('points Nosotr@s at the home about section on every page', function () {
    PAGES.forEach(function (file) {
      var dom = createDom({ file: file });
      var aboutLink = Array.prototype.find.call(
        dom.window.document.querySelectorAll('nav a'),
        function (link) {
          return /Nosotr/.test(link.textContent);
        }
      );
      assert.ok(aboutLink, file + ' is missing Nosotr@s');
      if (file === 'index.html') {
        assert.equal(aboutLink.getAttribute('href'), '#about', file);
        var about = dom.window.document.getElementById('about');
        assert.ok(about, 'home is missing #about');
        assert.equal(about.tagName, 'SECTION');
      } else {
        assert.equal(aboutLink.getAttribute('href'), 'index.html#about', file);
      }
      dom.window.close();
    });
  });

  it('keeps footer Contacto and Envíos links on every page', function () {
    PAGES.forEach(function (file) {
      var dom = createDom({ file: file });
      var contacto = Array.prototype.find.call(
        dom.window.document.querySelectorAll('footer a'),
        function (link) { return link.getAttribute('href') === 'contacto.html'; }
      );
      var envios = Array.prototype.find.call(
        dom.window.document.querySelectorAll('footer a'),
        function (link) { return link.getAttribute('href') === 'envios.html'; }
      );
      assert.ok(contacto, file + ' footer is missing Contacto');
      assert.ok(envios, file + ' footer is missing Envíos');
      if (file === 'contacto.html') {
        assert.equal(contacto.getAttribute('aria-current'), 'page');
      }
      if (file === 'envios.html') {
        assert.equal(envios.getAttribute('aria-current'), 'page');
      }
      dom.window.close();
    });
  });
});
