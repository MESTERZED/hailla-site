import { getLang } from '../core/i18n.js';
import { esc } from '../core/format.js';
import credits from '../data/credits.json';

const FACTS = {
  hotels: { fr: 'Établissements hôteliers', en: 'Hotels', ar: 'مؤسسة فندقية' },
  beaches: { fr: 'Plages recensées', en: 'Listed beaches', ar: 'شاطئًا مُحصى' },
  agencies: { fr: 'Agences de voyage', en: 'Travel agencies', ar: 'وكالة سياحية' },
};
const ROLE = { fr: ['Cofondateur', 'Cofondatrice', 'Cofondateur'], en: ['Co-founder', 'Co-founder', 'Co-founder'], ar: ['مؤسس شريك', 'مؤسسة شريكة', 'مؤسس شريك'] };

export function init(root) {
  const lang = getLang();
  root.querySelectorAll('[data-fact]').forEach((dt) => { dt.textContent = FACTS[dt.dataset.fact][lang]; });
  root.querySelectorAll('.team__member .mono').forEach((el, i) => { el.textContent = ROLE[lang][i]; });
  root.querySelector('[data-credits]').innerHTML = credits
    .map((c) => `<li><a href="${esc(c.url)}" target="_blank" rel="noopener"><img src="img/${esc(c.id)}-800.webp" alt="" loading="lazy" width="120" height="80" /><span><strong>${esc(c.title)}</strong><span class="muted">${esc(c.artist || '—')} · ${esc(c.license)}</span></span></a></li>`)
    .join('');
}
