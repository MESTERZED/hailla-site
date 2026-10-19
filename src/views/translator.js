// "AI Translator" (app screen): you ⇄ a local speaker, French/English ⇄ Algerian Darja.
// Offline phrasebook with fuzzy matching; Darja spelling follows common usage (regional variants exist).
import { t, getLang } from '../core/i18n.js';
import { icon, reducedMotion } from '../core/ui.js';
import { esc } from '../core/format.js';
import { store } from '../core/store.js';

const P = (fr, en, lat, ar) => ({ fr, en, lat, ar });
export const PHRASES = [
  P('Bonjour', 'Hello', 'Salam', 'السلام'),
  P('Merci beaucoup', 'Thank you very much', 'Saha, yaatik saha', 'صحّة، يعطيك الصحّة'),
  P('Comment allez-vous ?', 'How are you?', 'Wach rak ? Labas ?', 'واش راك؟ لاباس؟'),
  P('Au revoir', 'Goodbye', 'Bslama', 'بالسلامة'),
  P('Oui', 'Yes', 'Ih', 'إيه'),
  P('Non', 'No', 'La', 'لا'),
  P('Je ne comprends pas', 'I don’t understand', 'Ma fhemtch', 'ما فهمتش'),
  P('Vous parlez français ?', 'Do you speak French?', 'Thadar bel françai ?', 'تهدر بالفرنسية؟'),
  P('Je m’appelle…', 'My name is…', 'Smiti…', 'سميتي…'),
  P('Combien ça coûte ?', 'How much is it?', 'Bshhal hadi ?', 'بشحال هادي؟'),
  P('C’est trop cher', 'It’s too expensive', 'Ghalia bezzaf', 'غالية بزّاف'),
  P('Vous pouvez baisser un peu le prix ?', 'Can you lower the price a little?', 'Tnaqas chwiya ?', 'تنقّص شويّة؟'),
  P('Combien coûte le taxi jusqu’au centre-ville ?', 'How much is the taxi to downtown?', 'Chhal taxi l centre-ville ?', 'شحال الطاكسي لسونتر فيل؟'),
  P('Emmenez-moi à cette adresse, s’il vous plaît', 'Take me to this address, please', 'Eddini l had l’adresse, aychek', 'ادّيني لهاد لادريس، عيشك'),
  P('D’accord, ça me va', 'Okay, that works for me', 'Saha, mliha lia', 'صحّة، مليحة ليّا'),
  P('Où se trouve l’hôtel ?', 'Where is the hotel?', 'Win kayen l’hôtel ?', 'وين كاين لوطيل؟'),
  P('Où sont les toilettes ?', 'Where are the toilets?', 'Win kayen toilette ?', 'وين كاين التواليت؟'),
  P('Où est la plage ?', 'Where is the beach?', 'Win kayen l’bhar ?', 'وين كاين البحر؟'),
  P('C’est loin ?', 'Is it far?', 'Bâid ?', 'بعيد؟'),
  P('Tout droit', 'Straight ahead', 'Ghir qbala', 'غير قبالة'),
  P('À droite', 'To the right', 'Al limin', 'على اليمين'),
  P('À gauche', 'To the left', 'Al lisar', 'على اليسار'),
  P('Je suis perdu', 'I am lost', 'Rani tlaft', 'راني تلفت'),
  P('À quelle heure ça ouvre ?', 'What time does it open?', 'Wa9tach yahal ?', 'وقتاش يحلّ؟'),
  P('À quelle heure ça ferme ?', 'What time does it close?', 'Wa9tach ybelaa ?', 'وقتاش يبلّع؟'),
  P('Un café, s’il vous plaît', 'A coffee, please', 'Wahed qahwa, aychek', 'واحد قهوة، عيشك'),
  P('L’addition, s’il vous plaît', 'The bill, please', 'Chhal nkhalass ?', 'شحال نخلّص؟'),
  P('C’est délicieux', 'It’s delicious', 'Bnin bezzaf', 'بنين بزّاف'),
  P('Je ne mange pas de viande', 'I don’t eat meat', 'Ma nakoulch l’lham', 'ما ناكلش اللحم'),
  P('Je voudrais réserver une chambre', 'I would like to book a room', 'Nheb nreservi chambre', 'نحب نريزيرفي شومبرة'),
  P('Combien coûte une nuit ?', 'How much is one night?', 'Chhal lila ?', 'شحال الليلة؟'),
  P('Pour deux nuits', 'For two nights', 'L zouj lilat', 'لزوج ليالي'),
  P('Vous pouvez me prendre en photo ?', 'Can you take a photo of me?', 'Tsawarni, aychek ?', 'تصوّرني، عيشك؟'),
  P('Aidez-moi !', 'Help me!', 'Aawnouni !', 'عاونوني!'),
  P('Appelez la police', 'Call the police', 'Ayyto l’police', 'عيّطو للبوليس'),
  P('J’ai besoin d’un médecin', 'I need a doctor', 'Lazemni tbib', 'لازمني طبيب'),
];

const fold = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ًͯ-ْ]/g, '').replace(/[’'?!.,،؟…]/g, ' ').replace(/\s+/g, ' ').trim();
const tokens = (s) => new Set(fold(s).split(' ').filter((w) => w.length > 1));

// Best phrase for a text written in `side` ('me' = fr/en, 'them' = darja).
export function match(text, side) {
  const q = tokens(text);
  if (!q.size) return null;
  let best = null, bestScore = 0;
  for (const p of PHRASES) {
    const fields = side === 'me' ? [p.fr, p.en] : [p.lat, p.ar];
    for (const f of fields) {
      const ft = tokens(f);
      let common = 0; q.forEach((w) => { if (ft.has(w)) common++; });
      const score = common / Math.max(q.size, ft.size);
      if (score > bestScore) { bestScore = score; best = p; }
    }
  }
  return bestScore >= 0.5 ? best : null;
}

const VOICES = { fr: 'fr-FR', en: 'en-GB', dz: 'ar-DZ' };
const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export function mountTranslator(host) {
  const myLang = () => (getLang() === 'en' ? 'en' : 'fr');
  let log = store.get('tr-log', [
    { who: 'me', src: PHRASES[12][myLang()], dst: PHRASES[12].lat },
    { who: 'them', src: PHRASES[14].ar, dst: PHRASES[14][myLang()] },
  ]);
  let swapped = false, rec = null;

  const say = (text, lang) => {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = VOICES[lang];
    speechSynthesis.speak(u);
  };

  const translate = (text, who) => {
    const p = match(text, who);
    if (!p) return { src: text, dst: null };
    return who === 'me' ? { src: text, dst: `${p.lat} · ${p.ar}`, speak: p.ar } : { src: text, dst: p[myLang()], speak: p[myLang()] };
  };

  const add = (text, who) => {
    const r = translate(text, who);
    log = [...log, { who, src: r.src, dst: r.dst }].slice(-30);
    store.set('tr-log', log);
    renderLog(true);
    if (r.speak) say(r.speak, who === 'me' ? 'dz' : myLang());
  };

  const langPill = (k) => k === 'dz'
    ? `<span class="tr-pill"><span class="tr-flag tr-flag--dz" aria-hidden="true"></span>${t('tr.darja')}</span>`
    : `<span class="tr-pill"><span class="tr-flag tr-flag--${myLang()}" aria-hidden="true"></span>${t(myLang() === 'en' ? 'tr.english' : 'tr.french')}</span>`;

  host.innerHTML = `
    <header class="app-screen__head">
      <span></span>
      <h2 class="app-screen__title">${t('tr.title')}</h2>
      <button class="icon-btn icon-btn--soft" type="button" data-tr-clear aria-label="${t('guide.clear')}" title="${t('guide.clear')}">${icon('refresh')}</button>
    </header>
    <div class="tr-langs" data-tr-langs></div>
    <div class="tr-log" data-tr-log role="log" aria-live="polite" tabindex="0" data-lenis-prevent></div>
    <form class="tr-input" data-tr-form>
      <label class="sr-only" for="tr-text">${t('tr.type')}</label>
      <input class="input" id="tr-text" name="text" autocomplete="off" placeholder="${t('tr.type')}" />
      <button class="chat__btn chat__btn--send" type="submit" aria-label="${t('guide.send')}">${icon('send')}</button>
    </form>
    <div class="tr-suggest chips chips--scroll" data-tr-suggest></div>
    <div class="tr-mics">
      <button type="button" class="tr-mic" data-mic="me">${icon('mic')}<span>${t(myLang() === 'en' ? 'tr.english' : 'tr.french')}</span></button>
      <button type="button" class="tr-mic tr-mic--dz" data-mic="them">${icon('mic')}<span>${t('tr.darja')}</span></button>
    </div>
    <p class="tr-note">${t('tr.note')}</p>`;

  const logEl = host.querySelector('[data-tr-log]');
  const renderLangs = () => {
    host.querySelector('[data-tr-langs]').innerHTML = `${langPill(swapped ? 'dz' : 'me')}<button type="button" class="tr-swap" data-tr-swap aria-label="${t('ex.swap')}">${icon('swap')}</button>${langPill(swapped ? 'me' : 'dz')}`;
  };
  const renderLog = (animate = false) => {
    logEl.innerHTML = log.map((m) => `
      <div class="tr-msg tr-msg--${m.who}">
        <p class="tr-msg__who">${t(m.who === 'me' ? 'tr.you' : 'tr.them')}</p>
        <div class="tr-msg__bubble"><p dir="auto">${esc(m.src)}</p><p class="tr-msg__dst" dir="auto">${m.dst ? esc(m.dst) : t('tr.nomatch')}</p></div>
      </div>`).join('') + `<p class="tr-ready">${t('tr.ready')}</p>`;
    logEl.scrollTop = logEl.scrollHeight;
    if (animate && !reducedMotion()) logEl.querySelector('.tr-msg:last-of-type')?.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 400, easing: 'cubic-bezier(.16,1,.3,1)' });
  };
  const renderSuggest = () => {
    host.querySelector('[data-tr-suggest]').innerHTML = [9, 12, 15, 26, 33].map((i) => `<button type="button" class="chip" data-tr-phrase="${i}">${esc(PHRASES[i][myLang()])}</button>`).join('');
  };

  host.addEventListener('submit', (e) => {
    e.preventDefault();
    const inp = e.target.text, v = inp.value.trim();
    if (!v) return;
    add(v, /[؀-ۿ]/.test(v) ? 'them' : swapped ? 'them' : 'me');
    inp.value = '';
  });
  host.addEventListener('click', (e) => {
    if (e.target.closest('[data-tr-swap]')) { swapped = !swapped; renderLangs(); return; }
    if (e.target.closest('[data-tr-clear]')) { log = []; store.set('tr-log', log); renderLog(); return; }
    const ph = e.target.closest('[data-tr-phrase]');
    if (ph) { add(PHRASES[Number(ph.dataset.trPhrase)][myLang()], 'me'); return; }
    const mic = e.target.closest('[data-mic]');
    if (mic) {
      const who = mic.dataset.mic;
      if (!Recognition) { host.querySelector('#tr-text').focus(); host.querySelector('#tr-text').placeholder = t('tr.noMic'); return; }
      if (rec) { rec.stop(); return; }
      rec = new Recognition();
      rec.lang = who === 'me' ? VOICES[myLang()] : VOICES.dz;
      mic.classList.add('is-live');
      rec.onresult = (ev) => { const text = ev.results[0][0].transcript; if (text) add(text, who); };
      rec.onend = rec.onerror = () => { mic.classList.remove('is-live'); rec = null; };
      rec.start();
    }
  });

  renderLangs();
  renderLog();
  renderSuggest();
  return { destroy: () => { rec?.stop(); if ('speechSynthesis' in window) speechSynthesis.cancel(); } };
}
