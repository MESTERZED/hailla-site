import { t } from '../core/i18n.js';
import { icon, toast } from '../core/ui.js';
import { user } from '../core/store.js';
import { esc } from '../core/format.js';
import { syncShell } from '../core/shell.js';
import { profileHtml, bindProfile } from './profile.js';


export function init(root) {
  const host = root.querySelector('[data-account]');
  let mode = 'signin';

  const authView = () => `
    <div class="auth">
      <img class="auth__bg" src="img/sahara-dune-1600.webp" alt="" width="1600" height="1067" fetchpriority="high" />
      <div class="auth__brand on-dark">
        <img src="brand/mark.svg" alt="" class="invert" width="64" height="80" />
        <p class="auth__word">Hailla</p>
      </div>
      <form class="auth__card" data-auth novalidate>
        <h1 class="auth__title">${t(mode === 'signin' ? 'acc.signin' : 'acc.signup')}</h1>
        <p class="muted">${t(mode === 'signin' ? 'acc.signin.p' : 'acc.signup.p')}</p>
        <div class="stack" style="--stack: 12px">
          ${mode === 'signup' ? field('name', t('acc.name'), 'text', 'name') : ''}
          ${field('email', mode === 'signin' ? t('acc.email') : t('book.email'), mode === 'signin' ? 'text' : 'email', 'email')}
          ${mode === 'signup' ? field('phone', t('acc.phone'), 'tel', 'tel') : ''}
          <label class="field"><span class="sr-only">${t('acc.password')}</span>
            <span class="input-wrap"><input class="input" name="password" type="password" placeholder="${t('acc.password')}" autocomplete="${mode === 'signin' ? 'current-password' : 'new-password'}" minlength="6" />
            <button class="icon-btn" type="button" data-peek aria-label="${t('acc.show')}" aria-pressed="false">${icon('eye')}</button></span>
          </label>
          ${mode === 'signin' ? `<button class="auth__link auth__forgot" type="button" data-soon="mdp">${t('acc.forgot')}</button>` : `<label class="check"><input type="checkbox" name="terms" /><span>${t('acc.terms')}</span></label>`}
        </div>
        <p class="field-error" role="alert" data-err hidden></p>
        <button class="btn btn--block" type="submit">${t(mode === 'signin' ? 'acc.go.in' : 'acc.go.up')}</button>
        <p class="auth__switch">${t(mode === 'signin' ? 'acc.noacc' : 'acc.hasacc')} <button class="auth__link" type="button" data-switch>${t(mode === 'signin' ? 'acc.go.up' : 'acc.go.in')}</button></p>
        <p class="auth__or"><span>${t('acc.or')}</span></p>
        <div class="auth__social">
          <button class="social social--apple" type="button" data-soon="Apple" aria-label="Apple">${icon('apple')}</button>
          <button class="social social--google" type="button" data-soon="Google" aria-label="Google">${icon('google')}</button>
          <button class="social social--in" type="button" data-soon="LinkedIn" aria-label="LinkedIn"><span aria-hidden="true">in</span></button>
        </div>
        <p class="auth__demo">${t('acc.demo')}</p>
      </form>
    </div>`;

  const field = (name, label, type, ac) => `<label class="field"><span class="sr-only">${label}</span><input class="input" name="${name}" type="${type}" placeholder="${label}" autocomplete="${ac}" ${type === 'tel' ? 'inputmode="tel"' : ''} /></label>`;

  let mounted = false;
  const render = () => {
    const u = user.get();
    root.dataset.header = u ? 'light' : 'dark';
    host.innerHTML = u ? profileHtml(u) : authView();
    host.classList.toggle('account--auth', !u);
    if (mounted) syncShell(root);
    mounted = true;
  };

  host.addEventListener('click', (e) => {
    if (e.target.closest('[data-switch]')) { mode = mode === 'signin' ? 'signup' : 'signin'; render(); host.querySelector('input')?.focus(); }
    const soon = e.target.closest('[data-soon]');
    if (soon) toast(soon.dataset.soon === 'mdp' ? t('acc.demo') : t('acc.soon', { p: soon.dataset.soon }));
    const peek = e.target.closest('[data-peek]');
    if (peek) { const inp = peek.previousElementSibling; const show = inp.type === 'password'; inp.type = show ? 'text' : 'password'; peek.setAttribute('aria-pressed', String(show)); }
  });
  bindProfile(host, () => render());

  host.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    if (!f.matches('[data-auth]')) return;
    // Sign in / sign up (prototype: stored locally, no password kept)
    const err = f.querySelector('[data-err]');
    const bad = [];
    f.querySelectorAll('[aria-invalid]').forEach((x) => x.removeAttribute('aria-invalid'));
    const email = f.email.value.trim();
    if (!email) bad.push(f.email);
    if (mode === 'signup' && email && !/^\S+@\S+\.\S+$/.test(email)) bad.push(f.email);
    if (f.password.value.length < 6) bad.push(f.password);
    if (mode === 'signup' && !f.name.value.trim()) bad.push(f.name);
    if (mode === 'signup' && !f.terms.checked) bad.push(f.terms);
    if (bad.length) {
      bad.forEach((x) => x.setAttribute('aria-invalid', 'true'));
      err.textContent = t('acc.err'); err.hidden = false; bad[0].focus();
      return;
    }
    const name = mode === 'signup' ? f.name.value.trim() : (email.split('@')[0] || 'Voyageur').replace(/^\w/, (c) => c.toUpperCase());
    user.set({ name, email: email.includes('@') ? email : '', phone: mode === 'signup' ? f.phone.value.trim() : (email.includes('@') ? '' : email) });
    toast(t('acc.welcome', { n: name.split(' ')[0] }), { tone: 'ok' });
    render();
  });

  render();
}
