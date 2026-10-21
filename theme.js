/* Tema da Calculadora Digital DACG — preferência local, nunca dados de atendimento. */
(function () {
  'use strict';

  const KEY = 'dacg-tema';
  const root = document.documentElement;
  const systemPreference = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = null;
  try {
    const saved = window.localStorage.getItem(KEY);
    if (saved === 'light' || saved === 'dark') preference = saved;
  } catch (_) { /* Navegação privada ou bloqueio de armazenamento. */ }

  const effectiveTheme = () => preference || (systemPreference.matches ? 'dark' : 'light');
  const updateButton = () => {
    const button = document.getElementById('btnTemaCalculadora');
    if (!button) return;
    const isDark = effectiveTheme() === 'dark';
    const action = isDark ? 'Ativar tema claro' : 'Ativar tema escuro';
    button.title = action;
    button.setAttribute('aria-label', action);
    button.setAttribute('aria-pressed', String(isDark));
    const icon = button.querySelector('.theme-symbol');
    if (icon) icon.textContent = isDark ? '☀' : '☾';
  };
  const apply = () => {
    const value = effectiveTheme();
    root.setAttribute('data-theme', value);
    root.style.colorScheme = value;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', value === 'dark' ? '#0f1512' : '#123f34');
    updateButton();
  };
  const change = () => {
    preference = effectiveTheme() === 'dark' ? 'light' : 'dark';
    try { window.localStorage.setItem(KEY, preference); } catch (_) { /* Volátil. */ }
    apply();
  };
  const mount = () => {
    const button = document.getElementById('btnTemaCalculadora');
    if (button) {
      button.addEventListener('click', change);
      updateButton();
    }
  };

  // Executa no <head> para impedir flash de fundo claro no carregamento.
  apply();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once: true});
  else mount();

  const onSystemChange = () => { if (preference === null) apply(); };
  if (typeof systemPreference.addEventListener === 'function') systemPreference.addEventListener('change', onSystemChange);
  else if (typeof systemPreference.addListener === 'function') systemPreference.addListener(onSystemChange);

  window.addEventListener('storage', event => {
    if (event.key !== KEY) return;
    preference = event.newValue === 'dark' || event.newValue === 'light' ? event.newValue : null;
    apply();
  });
})();
