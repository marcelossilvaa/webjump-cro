(function () {
  'use strict';

  const EXPERIENCE_FLAG = 'AT_TESTE_TRACKING_AZULREACT_APP_DEV';
  const REPORT_SUITE = 'azulreact-app-dev';
  const EVAR82 = 'AT_teste_evar82_azulreact_app_dev';
  const EVAR84 = 'AT_teste_tracking_azulreact_app_dev';
  const STYLE_ID = 'at-teste-azulreact-app-dev-style';
  const MODAL_ID = 'at-teste-azulreact-app-dev-modal';
  const CLOSE_MS = 220;

  if (window[EXPERIENCE_FLAG]) {
    return;
  }
  window[EXPERIENCE_FLAG] = true;

  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel || !eventType) {
      console.log('[Tracking AzulReactAppDev] Parametros ausentes para analytics.');
      return;
    }

    const eVar82Value = EVAR82 + '_' + eventType + '_' + eventLabel;
    console.log(
      '[Tracking AzulReactAppDev] Evento disparado | reportSuite:',
      REPORT_SUITE,
      '| eVar82:',
      eVar82Value,
      '| eVar84:',
      EVAR84
    );

    (function () {
      const s =
        window.s ||
        (typeof s_gi === 'function' && s_gi(REPORT_SUITE));

      if (!s || typeof s.tl !== 'function') {
        console.log(
          '[Tracking AzulReactAppDev] Adobe Analytics indisponivel para suite:',
          REPORT_SUITE
        );
        return;
      }

      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = eVar82Value;
      s.eVar84 = EVAR84;
      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  function getStyles() {
    return [
      '#' + MODAL_ID + ' {',
      '  position: fixed;',
      '  inset: 0;',
      '  z-index: 999999;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  padding: 16px;',
      '  background: rgba(4, 30, 66, 0.62);',
      '  font-family: "Helvetica Neue", Arial, sans-serif;',
      '}',
      '#' + MODAL_ID + '.is-closing {',
      '  opacity: 0;',
      '  transition: opacity ' + CLOSE_MS + 'ms ease;',
      '}',
      '#' + MODAL_ID + ' .at-teste-modal {',
      '  width: 100%;',
      '  max-width: 420px;',
      '  border-radius: 12px;',
      '  background: #ffffff;',
      '  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);',
      '  overflow: hidden;',
      '}',
      '#' + MODAL_ID + ' .at-teste-modal__header {',
      '  padding: 20px 20px 0;',
      '  position: relative;',
      '}',
      '#' + MODAL_ID + ' .at-teste-modal__badge {',
      '  display: inline-block;',
      '  padding: 4px 10px;',
      '  border-radius: 999px;',
      '  background: #e8f3ff;',
      '  color: #026cb6;',
      '  font-size: 12px;',
      '  font-weight: 700;',
      '  letter-spacing: 0.02em;',
      '}',
      '#' + MODAL_ID + ' .at-teste-modal__close {',
      '  position: absolute;',
      '  top: 14px;',
      '  right: 14px;',
      '  width: 32px;',
      '  height: 32px;',
      '  border: 0;',
      '  border-radius: 50%;',
      '  background: #f2f4f7;',
      '  color: #041e42;',
      '  font-size: 20px;',
      '  line-height: 1;',
      '  cursor: pointer;',
      '}',
      '#' + MODAL_ID + ' .at-teste-modal__body {',
      '  padding: 16px 20px 8px;',
      '}',
      '#' + MODAL_ID + ' .at-teste-modal__title {',
      '  margin: 12px 0 8px;',
      '  color: #041e42;',
      '  font-size: 22px;',
      '  line-height: 1.25;',
      '  font-weight: 700;',
      '}',
      '#' + MODAL_ID + ' .at-teste-modal__text {',
      '  margin: 0;',
      '  color: #4a5568;',
      '  font-size: 14px;',
      '  line-height: 1.45;',
      '}',
      '#' + MODAL_ID + ' .at-teste-modal__meta {',
      '  margin: 12px 0 0;',
      '  padding: 10px 12px;',
      '  border-radius: 8px;',
      '  background: #f7fafc;',
      '  color: #026cb6;',
      '  font-size: 12px;',
      '  line-height: 1.4;',
      '  word-break: break-word;',
      '}',
      '#' + MODAL_ID + ' .at-teste-modal__footer {',
      '  padding: 16px 20px 20px;',
      '  display: flex;',
      '  gap: 10px;',
      '}',
      '#' + MODAL_ID + ' .at-teste-modal__cta {',
      '  flex: 1;',
      '  height: 44px;',
      '  border: 0;',
      '  border-radius: 8px;',
      '  background: #026cb6;',
      '  color: #ffffff;',
      '  font-size: 14px;',
      '  font-weight: 700;',
      '  cursor: pointer;',
      '}',
      '#' + MODAL_ID + ' .at-teste-modal__secondary {',
      '  height: 44px;',
      '  padding: 0 14px;',
      '  border: 1px solid #d0d7e2;',
      '  border-radius: 8px;',
      '  background: #ffffff;',
      '  color: #041e42;',
      '  font-size: 14px;',
      '  font-weight: 600;',
      '  cursor: pointer;',
      '}'
    ].join('\n');
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = getStyles();
    document.head.appendChild(style);
  }

  function closeModal() {
    const overlay = document.getElementById(MODAL_ID);
    if (!overlay || overlay.getAttribute('data-closing') === 'true') {
      return;
    }

    overlay.setAttribute('data-closing', 'true');
    overlay.classList.add('is-closing');
    analyticsEvent('fechar', 'click');

    window.setTimeout(function () {
      if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, CLOSE_MS);
  }

  function openModal() {
    if (document.getElementById(MODAL_ID)) {
      return;
    }

    injectStyles();

    const overlay = document.createElement('div');
    overlay.id = MODAL_ID;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', MODAL_ID + '-title');

    overlay.innerHTML =
      '<div class="at-teste-modal">' +
        '<div class="at-teste-modal__header">' +
          '<span class="at-teste-modal__badge">TESTE DEV</span>' +
          '<button type="button" class="at-teste-modal__close" aria-label="Fechar" data-action="close">&times;</button>' +
        '</div>' +
        '<div class="at-teste-modal__body">' +
          '<h2 class="at-teste-modal__title" id="' + MODAL_ID + '-title">Teste de tracking App</h2>' +
          '<p class="at-teste-modal__text">Clique no CTA para enviar eVar82 e eVar84 no report suite do App em staging.</p>' +
          '<p class="at-teste-modal__meta">Report Suite: <strong>' + REPORT_SUITE + '</strong><br>eVar82: <strong>' + EVAR82 + '</strong><br>eVar84: <strong>' + EVAR84 + '</strong></p>' +
        '</div>' +
        '<div class="at-teste-modal__footer">' +
          '<button type="button" class="at-teste-modal__secondary" data-action="close">Fechar</button>' +
          '<button type="button" class="at-teste-modal__cta" data-action="cta">Enviar tracking</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);
    analyticsEvent('modal', 'view');

    if (overlay.getAttribute('data-listeners-added') !== 'true') {
      overlay.setAttribute('data-listeners-added', 'true');

      overlay.addEventListener('click', function (event) {
        const target = event.target;
        if (!(target instanceof Element)) {
          return;
        }

        const actionEl = target.closest('[data-action]');
        if (!actionEl) {
          if (target === overlay) {
            closeModal();
          }
          return;
        }

        const action = actionEl.getAttribute('data-action');
        if (action === 'close') {
          closeModal();
          return;
        }

        if (action === 'cta') {
          analyticsEvent('enviar_tracking', 'click');
          console.log(
            '[Tracking AzulReactAppDev] CTA clicado. Verifique eVar82 e eVar84 em',
            REPORT_SUITE
          );
        }
      });
    }
  }

  function init() {
    console.log(
      '[AT] Experiencia iniciada:',
      EXPERIENCE_FLAG,
      '| suite:',
      REPORT_SUITE
    );
    openModal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
