import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { writeFileSync } from 'node:fs';

const BASE = process.env.A11Y_BASE || 'http://127.0.0.1:8788';
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

const bag = [{
  id: 'crush',
  name: 'I have a crush on you',
  size: 'M',
  price: '$890',
  image: 'i_have_a_crush_on_you.png'
}];

async function scan(page, label) {
  const results = await new AxeBuilder({ page })
    .withTags(TAGS)
    .analyze();
  return {
    label,
    url: page.url(),
    violations: results.violations.map(function (v) {
      return {
        id: v.id,
        impact: v.impact,
        help: v.help,
        description: v.description,
        helpUrl: v.helpUrl,
        tags: v.tags,
        nodes: v.nodes.map(function (n) {
          return {
            target: n.target,
            html: n.html,
            failureSummary: n.failureSummary
          };
        })
      };
    })
  };
}

async function dismissBanner(page) {
  const banner = page.locator('#parkour-welcome-banner');
  if (await banner.count()) {
    await page.locator('#parkour-accept').click();
    await banner.waitFor({ state: 'detached' });
  }
}

const scenarios = [
  {
    label: 'Inicio, banner visible',
    path: '/index.html',
    viewport: { width: 1280, height: 800 }
  },
  {
    label: 'Inicio, banner cerrado',
    path: '/index.html',
    viewport: { width: 1280, height: 800 },
    async prepare(page) {
      await dismissBanner(page);
    }
  },
  {
    label: 'Inicio, submenú Diseños abierto',
    path: '/index.html',
    viewport: { width: 1280, height: 800 },
    async prepare(page) {
      await dismissBanner(page);
      await page.locator('nav .has-submenu').hover();
      await page.waitForTimeout(200);
    }
  },
  {
    label: 'Inicio móvil, menú abierto y submenú de categorías',
    path: '/index.html',
    viewport: { width: 390, height: 844 },
    async prepare(page) {
      await dismissBanner(page);
      await page.locator('.nav-hamburger').click();
      await page.locator('#submenu-disenos a').first().waitFor({ state: 'visible' });
    }
  },
  {
    label: 'Inicio, panel de favoritos vacío',
    path: '/index.html',
    viewport: { width: 1280, height: 800 },
    async prepare(page) {
      await dismissBanner(page);
      await page.evaluate(function () { window.PARKOUR_PEDIDO.openPanel('favorites'); });
    }
  },
  {
    label: 'Inicio, panel de favoritos con un diseño',
    path: '/index.html',
    viewport: { width: 1280, height: 800 },
    storage: { parkour_favoritos: JSON.stringify(['crush']) },
    async prepare(page) {
      await dismissBanner(page);
      await page.evaluate(function () { window.PARKOUR_PEDIDO.openPanel('favorites'); });
    }
  },
  {
    label: 'Inicio, panel de pedido vacío',
    path: '/index.html',
    viewport: { width: 1280, height: 800 },
    async prepare(page) {
      await dismissBanner(page);
      await page.evaluate(function () { window.PARKOUR_PEDIDO.openPanel('bag'); });
    }
  },
  {
    label: 'Inicio, panel de pedido con una remera',
    path: '/index.html',
    viewport: { width: 1280, height: 800 },
    storage: { parkour_bolsa: JSON.stringify(bag) },
    async prepare(page) {
      await dismissBanner(page);
      await page.evaluate(function () { window.PARKOUR_PEDIDO.openPanel('bag'); });
    }
  },
  {
    label: 'Catálogo completo',
    path: '/disenos.html',
    viewport: { width: 1280, height: 800 },
    async prepare(page) { await dismissBanner(page); }
  },
  {
    label: 'Catálogo filtrado en Frases',
    path: '/disenos.html?cat=frases',
    viewport: { width: 1280, height: 800 },
    async prepare(page) { await dismissBanner(page); }
  },
  {
    label: 'Catálogo vacío en Pelis',
    path: '/disenos.html?cat=pelis',
    viewport: { width: 1280, height: 800 },
    async prepare(page) { await dismissBanner(page); }
  },
  {
    label: 'Ficha de producto',
    path: '/producto.html?id=crush',
    viewport: { width: 1280, height: 800 },
    async prepare(page) { await dismissBanner(page); }
  },
  {
    label: 'Ficha inexistente',
    path: '/producto.html?id=no-existe',
    viewport: { width: 1280, height: 800 },
    async prepare(page) { await dismissBanner(page); }
  },
  {
    label: 'Contacto',
    path: '/contacto.html',
    viewport: { width: 1280, height: 800 },
    async prepare(page) { await dismissBanner(page); }
  },
  {
    label: 'Envíos',
    path: '/envios.html',
    viewport: { width: 1280, height: 800 },
    async prepare(page) { await dismissBanner(page); }
  }
];

const browser = await chromium.launch();
const reports = [];

for (const scenario of scenarios) {
  const context = await browser.newContext({
    viewport: scenario.viewport,
    reducedMotion: 'reduce'
  });
  if (scenario.storage) {
    await context.addInitScript(function (entries) {
      for (const key of Object.keys(entries)) {
        localStorage.setItem(key, entries[key]);
      }
    }, scenario.storage);
  }
  const page = await context.newPage();
  await page.goto(BASE + scenario.path, { waitUntil: 'networkidle' });
  if (scenario.prepare) await scenario.prepare(page);
  reports.push(await scan(page, scenario.label));
  await context.close();
}

await browser.close();

writeFileSync('/tmp/parkour-a11y-report.json', JSON.stringify(reports, null, 2));

for (const report of reports) {
  const count = report.violations.reduce(function (n, v) { return n + v.nodes.length; }, 0);
  console.log('\n## ' + report.label + ' — ' + report.violations.length + ' reglas, ' + count + ' nodos');
  for (const v of report.violations) {
    console.log('- [' + v.impact + '] ' + v.id + ' (' + v.nodes.length + ') ' + v.help);
    console.log('  ' + v.nodes[0].target.join(' '));
    console.log('  ' + v.nodes[0].failureSummary.split('\n')[0]);
  }
}
