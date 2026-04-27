(function () {
  'use strict';

  let isProcessing = false;
  let debounceTimer = null;
  let observer = null;

  const STYLE_ID = 'wj-inspirali-banner-pediatria-v1-style';
  const PROCESSED_ATTR = 'data-wj-inspirali-banner-pediatria-v1';

  // Importante: usar link direto do arquivo (i.imgur.com). O formato imgur.com/XXXX.png
  // geralmente abre uma página HTML, não o asset direto.
  const MEC_BADGE_IMG_SRC = 'https://i.imgur.com/2N8qI6z.png';

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      '@media (min-width: 1280px){.cmp-banner-lead-form__title{width:515px !important}}' +
      '.wj-banner-tags-row{display:flex;align-items:center;gap:12px;}' +
      '.wj-banner-tags{display:flex;flex-direction:column;gap:8px !important}' +
      '.wj-banner-tags-top{display:flex;flex-wrap:wrap;gap:8px !important;align-items:center}' +
      '.wj-banner-tags-places{display:flex;flex-wrap:wrap;gap:8px !important;align-items:center}' +
      '.wj-banner-tags-bottom{display:flex;flex-wrap:nowrap;gap:8px !important;align-items:center}' +
      '.wj-banner-tags-bottom .cmp-banner-lead-form__tag{white-space:nowrap}' +
      '.wj-banner-mec-badge{display:flex;align-items:center}' +
      '.wj-banner-mec-badge img{display:block;max-width:120px;height:auto}';

    document.head.appendChild(style);
  }

  function getText(el) {
    return (el && el.textContent ? el.textContent : '').replace(/\s+/g, ' ').trim();
  }

  function createTag(text) {
    const span = document.createElement('span');
    span.className = 'cmp-banner-lead-form__tag';
    span.textContent = text;
    return span;
  }

  function ensureTagLines(tagsEl) {
    if (!tagsEl) return null;

    tagsEl.classList.add('wj-banner-tags');

    let top = tagsEl.querySelector(':scope > .wj-banner-tags-top');
    let bottom = tagsEl.querySelector(':scope > .wj-banner-tags-bottom');
    let places = tagsEl.querySelector(':scope > .wj-banner-tags-top > .wj-banner-tags-places');

    if (!top) {
      top = document.createElement('div');
      top.className = 'wj-banner-tags-top';
      tagsEl.insertBefore(top, tagsEl.firstChild);
    }

    if (!bottom) {
      bottom = document.createElement('div');
      bottom.className = 'wj-banner-tags-bottom';
      tagsEl.appendChild(bottom);
    }

    if (!places) {
      places = document.createElement('div');
      places.className = 'wj-banner-tags-places';
      top.appendChild(places);
    }

    // Move tags soltas (span diretos) para o TOP por padrão
    const directTags = Array.prototype.slice.call(
      tagsEl.querySelectorAll(':scope > .cmp-banner-lead-form__tag'),
    );

    for (let i = 0; i < directTags.length; i++) {
      top.appendChild(directTags[i]);
    }

    return { top: top, bottom: bottom, places: places };
  }

  function ensureTagsRow(tagsEl) {
    const parent = tagsEl.parentElement;
    if (!parent) return null;

    const existingRow = parent.querySelector('.wj-banner-tags-row');
    if (existingRow) return existingRow;

    const row = document.createElement('div');
    row.className = 'wj-banner-tags-row';

    parent.insertBefore(row, tagsEl);
    row.appendChild(tagsEl);

    return row;
  }

  function ensureMecBadge(tagsEl) {
    const row = ensureTagsRow(tagsEl);
    if (!row) return;

    const existing = row.querySelector('.wj-banner-mec-badge');
    if (existing) {
      if (existing.nextSibling !== tagsEl) {
        row.insertBefore(existing, tagsEl);
      }
      return;
    }

    const wrap = document.createElement('div');
    wrap.className = 'wj-banner-mec-badge';

    const img = document.createElement('img');
    img.alt = 'MEC - Conceito Máximo';
    img.src = MEC_BADGE_IMG_SRC;

    wrap.appendChild(img);
    // Ordem preferida: badge antes das tags
    row.insertBefore(wrap, tagsEl);
  }

  function updateBannerContent(contentEl) {
    if (!contentEl || contentEl.getAttribute(PROCESSED_ATTR) === '1') return false;

    const h1 = contentEl.querySelector('.cmp-banner-lead-form__title');
    if (h1) {
      h1.textContent = 'Aprimore sua atuação na saúde pediátrica';
    }

    const cta = contentEl.querySelector('.cmp-banner-lead-form__cta');
    if (cta && cta.parentElement) {
      cta.parentElement.removeChild(cta);
    }

    const tags = contentEl.querySelector('.cmp-banner-lead-form__tags');
    if (tags) {
      const lines = ensureTagLines(tags);

      // Remove qualquer tag de texto do MEC (vai virar badge).
      const allTagEls = Array.prototype.slice.call(
        tags.querySelectorAll('.cmp-banner-lead-form__tag'),
      );
      for (let j = 0; j < allTagEls.length; j++) {
        const tt = getText(allTagEls[j]).toLowerCase();
        if (tt.indexOf('mec') !== -1) {
          allTagEls[j].parentElement && allTagEls[j].parentElement.removeChild(allTagEls[j]);
        }
      }

      // Mantém praças separadas na linha de cima e força "horas" + "meses" na linha de baixo.
      if (lines && lines.top && lines.bottom) {
        const tagsNow = Array.prototype.slice.call(
          tags.querySelectorAll('.cmp-banner-lead-form__tag'),
        );

        for (let k = 0; k < tagsNow.length; k++) {
          const text = getText(tagsNow[k]).toLowerCase();
          const isBottom = text.indexOf('hora') !== -1 || text.indexOf('mes') !== -1;
          const isPlace =
            text === 'ba' || text === 'mg' || text === 'pe' || text === 'rj' || text === 'sp';
          if (isBottom) {
            lines.bottom.appendChild(tagsNow[k]);
          } else if (isPlace && lines.places) {
            lines.places.appendChild(tagsNow[k]);
          } else {
            // Wide + praças continuam no topo, separados
            lines.top.appendChild(tagsNow[k]);
          }
        }

        // Garante que o container de praças fique logo após a tag wide (quando existir).
        if (lines.places && lines.places.parentElement === lines.top) {
          const wide = lines.top.querySelector('.cmp-banner-lead-form__tag--wide');
          if (wide && wide.nextSibling !== lines.places) {
            lines.top.insertBefore(lines.places, wide.nextSibling);
          }
        }
      }

      ensureMecBadge(tags);
    }

    contentEl.setAttribute(PROCESSED_ATTR, '1');
    return true;
  }

  function run() {
    if (isProcessing) return;
    isProcessing = true;

    try {
      injectStyles();

      const contentEl = document.querySelector('.cmp-banner-lead-form__content');
      if (!contentEl) return;

      updateBannerContent(contentEl);
    } finally {
      isProcessing = false;
    }
  }

  function scheduleRun() {
    if (debounceTimer) window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(function () {
      run();
    }, 150);
  }

  function initObserver() {
    if (observer) return;

    observer = new MutationObserver(function (mutations) {
      for (let i = 0; i < mutations.length; i++) {
        const target = mutations[i] && mutations[i].target;
        if (target && target.nodeType === 1) {
          const el = target;
          if (el && (el.id === STYLE_ID || (el.closest && el.closest('#' + STYLE_ID)))) {
            return;
          }
        }
      }
      scheduleRun();
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  function init() {
    run();
    initObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
