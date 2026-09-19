'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { createDom, productCtaSearch } = require('./helpers');

function loadContact(search) {
  return createDom({
    file: 'contacto.html',
    search: search,
    runInline: true
  });
}

describe('contacto.html order prefill', function () {
  it('keeps the default draft when there are no query params', function () {
    var dom = loadContact('');
    var draft = dom.window.document.getElementById('draft-text').textContent;
    assert.equal(draft, 'Hola! Quiero una remera Parkour.');
    assert.equal(dom.window.document.getElementById('wa-btn').getAttribute('href'), 'https://wa.me/');
    assert.match(dom.window.document.querySelector('.lead').textContent, /Elegís diseño y talle/);
    ['#ig-btn', '#nav-ig', '#ft-ig'].forEach(function (sel) {
      assert.equal(
        dom.window.document.querySelector(sel).getAttribute('href'),
        'https://www.instagram.com/'
      );
    });
    dom.window.close();
  });

  it('uses URLSearchParams.get without a second decode (names with %)', function () {
    var name = '100% algodón';
    var search = productCtaSearch(name, 'M');
    var dom = loadContact(search);
    var draft = dom.window.document.getElementById('draft-text').textContent;
    assert.equal(draft, 'Hola! Quiero la remera "100% algodón" talle M');
    assert.match(
      dom.window.document.querySelector('.lead').textContent,
      /100% algodón/
    );
    assert.match(dom.window.document.querySelector('.lead').textContent, /talle M/);
    dom.window.close();
  });

  it('still prefills existing catalog names including apostrophes', function () {
    var name = "It's not gonna lick itself";
    var search = productCtaSearch(name, 'XL');
    var dom = loadContact(search);
    assert.equal(
      dom.window.document.getElementById('draft-text').textContent,
      'Hola! Quiero la remera "It\'s not gonna lick itself" talle XL'
    );
    dom.window.close();
  });

  it('prefills a multi-line bag handoff message including % names', function () {
    var msg = [
      'Hola! Quiero pedir:',
      '- 100% algodón (talle M)',
      '- Alexa... (talle XL)',
      '',
      '¿Cómo seguimos?'
    ].join('\n');
    var search = '?msg=' + encodeURIComponent(msg);
    var dom = loadContact(search);
    assert.equal(dom.window.document.getElementById('draft-text').textContent, msg);
    assert.match(dom.window.document.querySelector('.lead').textContent, /Elegís diseño y talle/);
    dom.window.close();
  });

  it('does not rewrite the lead unless both product and size are present', function () {
    var dom = loadContact('?product=' + encodeURIComponent('Alexa...'));
    assert.match(dom.window.document.querySelector('.lead').textContent, /Elegís diseño y talle/);
    assert.equal(
      dom.window.document.getElementById('draft-text').textContent,
      'Hola! Quiero una remera Parkour.'
    );
    dom.window.close();
  });

  it('would throw if the old double-decode ran on a percent in the product name', function () {
    var params = new URLSearchParams(productCtaSearch('50% off', 'S'));
    var msg = params.get('msg');
    assert.equal(msg, 'Hola! Quiero la remera "50% off" talle S');
    assert.throws(function () {
      decodeURIComponent(msg);
    }, URIError);
  });
});
