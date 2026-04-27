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
      h1.textContent = 'Especialize-se em Pediatria com prática em pacientes reais';
    }

    const cta = contentEl.querySelector('.cmp-banner-lead-form__cta');
    if (cta && cta.parentElement) {
      cta.parentElement.removeChild(cta);
    }

    const tags = contentEl.querySelector('.cmp-banner-lead-form__tags');
    if (tags) {
      const tagEls = Array.prototype.slice.call(
        tags.querySelectorAll('.cmp-banner-lead-form__tag'),
      );

      // Remove estados individuais (BA, MG, PE, RJ, SP) e substitui por um único.
      const statesToRemove = { BA: true, MG: true, PE: true, RJ: true, SP: true };
      for (let i = 0; i < tagEls.length; i++) {
        const t = getText(tagEls[i]);
        if (statesToRemove[t]) {
          tagEls[i].parentElement && tagEls[i].parentElement.removeChild(tagEls[i]);
        }
      }

      // Remove qualquer tag de texto do MEC (vai virar badge).
      const updatedTagEls = Array.prototype.slice.call(
        tags.querySelectorAll('.cmp-banner-lead-form__tag'),
      );
      for (let j = 0; j < updatedTagEls.length; j++) {
        const tt = getText(updatedTagEls[j]).toLowerCase();
        if (tt.indexOf('mec') !== -1) {
          updatedTagEls[j].parentElement &&
            updatedTagEls[j].parentElement.removeChild(updatedTagEls[j]);
        }
      }

      // Garante a tag agregada de estados logo após a tag wide (quando existir).
      const wide = tags.querySelector('.cmp-banner-lead-form__tag--wide');
      const combinedText = 'PE - BA - MG - RJ - SP';
      const hasCombinedAlready = Array.prototype.slice
        .call(tags.querySelectorAll('.cmp-banner-lead-form__tag'))
        .some(function (el) {
          return getText(el) === combinedText;
        });

      if (!hasCombinedAlready) {
        const combined = createTag(combinedText);
        if (wide && wide.parentElement) {
          if (wide.nextSibling) {
            wide.parentElement.insertBefore(combined, wide.nextSibling);
          } else {
            wide.parentElement.appendChild(combined);
          }
        } else {
          tags.appendChild(combined);
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
