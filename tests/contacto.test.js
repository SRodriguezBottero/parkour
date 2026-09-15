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

  it('would throw if the old double-decode ran on a percent in the product name', function () {
    var params = new URLSearchParams(productCtaSearch('50% off', 'S'));
    var msg = params.get('msg');
    assert.equal(msg, 'Hola! Quiero la remera "50% off" talle S');
    assert.throws(function () {
      decodeURIComponent(msg);
    }, URIError);
  });
});
