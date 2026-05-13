(function () {
  'use strict';

  var STYLE_ID = 'wj-nespresso-faq-lateral-style';
  var WRAPPER_ID = 'wj-nespresso-faq-lateral';
  var TARGET_SELECTOR = 'div._sidebar__list_i70mm_676[role="menu"]';
  var MAX_ATTEMPTS = 20;
  var INTERVAL_MS = 200;
  var attempts = 0;

  function createStyle() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      '.wj-faq-sidebar { background: #FFFFFF; border-radius: 24px; padding: 24px 20px; box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08); margin-top: 24px; }' +
      '.wj-faq-sidebar__header { color: #1A1A1A; font-family: NespressoLucas, Helvetica, Arial, sans-serif; font-size: 22px; line-height: 28px; font-weight: 700; margin: 0 0 20px; }' +
      '.wj-faq-sidebar__list { list-style: none; margin: 0; padding: 0; }' +
      '.wj-faq-sidebar__item { border-top: 1px solid #D9D9D9; margin: 0; padding: 16px 0 0; }' +
      '.wj-faq-sidebar__item:first-child { border-top: 0; padding-top: 0; }' +
      '.wj-faq-sidebar__button { width: 100%; display: flex; align-items: center; gap: 12px; border: 0; background: none; padding: 0; margin: 0; font-family: NespressoLucas, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 22px; font-weight: 400; color: #1A1A1A; text-align: left; cursor: pointer; }' +
      '.wj-faq-sidebar__button:hover { opacity: 0.88; }' +
      '.wj-faq-sidebar__arrow { color: #1A1A1A; font-size: 16px; line-height: 1; transition: transform 0.3s ease; }' +
      '.wj-faq-sidebar__button[data-expanded="true"] .wj-faq-sidebar__arrow { transform: rotate(90deg); }' +
      '.wj-faq-sidebar__text { display: inline-block; }' +
      '.wj-faq-sidebar__answer { max-height: 0; overflow: hidden; transition: max-height 0.3s ease; font-family: NespressoLucas, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; font-weight: 400; color: #666666; margin-top: 12px; }' +
      '.wj-faq-sidebar__button[data-expanded="true"] + .wj-faq-sidebar__answer { max-height: 200px; }' +
      '@media screen and (max-width: 1024px) { .wj-faq-sidebar { display: none !important; } }';

    document.head.appendChild(style);
  }

  function createFaqItem(question, answer) {
    return (
      '<li class="wj-faq-sidebar__item" role="none">' +
      '<button type="button" class="wj-faq-sidebar__button" role="menuitem" data-expanded="false">' +
      '<span class="wj-faq-sidebar__arrow">&gt;</span>' +
      '<span class="wj-faq-sidebar__text">' + question + '</span>' +
      '</button>' +
      '<div class="wj-faq-sidebar__answer">' + answer + '</div>' +
      '</li>'
    );
  }

  function createFaqMarkup() {
    return (
      '<div id="' + WRAPPER_ID + '" class="wj-faq-sidebar" aria-label="Dúvidas sobre assinatura">' +
      '<div class="wj-faq-sidebar__header">Dúvidas sobre assinatura</div>' +
      '<ul class="wj-faq-sidebar__list" role="menu" aria-label="Dúvidas sobre assinatura">' +
      createFaqItem('O que é a Assinatura?', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.') +
      createFaqItem('Vantagens de fazer uma Assinatura', 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.') +
      createFaqItem('Como alterar ou cancelar', 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.') +
      createFaqItem('Formas de pagamento aceitas', 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.') +
      createFaqItem('E se um café esgotar?', 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.') +
      createFaqItem('Quantidade mínima de cápsulas', 'Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.') +
      createFaqItem('Posso ter várias Assinaturas de Cafés?', 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.') +
      '</ul>' +
      '</div>'
    );
  }

  function toggleAnswer(event) {
    var button = event.currentTarget;
    var isExpanded = button.getAttribute('data-expanded') === 'true';
    button.setAttribute('data-expanded', !isExpanded);
  }

  function addEventListeners() {
    var buttons = document.querySelectorAll('#' + WRAPPER_ID + ' .wj-faq-sidebar__button');
    for (var i = 0; i < buttons.length; i++) {
      if (!buttons[i].hasAttribute('data-listener-added')) {
        buttons[i].addEventListener('click', toggleAnswer);
        buttons[i].setAttribute('data-listener-added', 'true');
      }
    }
  }

  function insertFaq() {
    if (document.getElementById(WRAPPER_ID)) {
      return;
    }

    var target = document.querySelector(TARGET_SELECTOR);
    if (!target) {
      attempts += 1;
      if (attempts < MAX_ATTEMPTS) {
        setTimeout(insertFaq, INTERVAL_MS);
      }
      return;
    }

    createStyle();
    var faqContainer = document.createElement('div');
    faqContainer.innerHTML = createFaqMarkup();
    var faqElement = faqContainer.firstChild;
    target.parentNode.insertBefore(faqElement, target.nextSibling);
    addEventListeners();
  }

  function readyHandler() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', insertFaq);
    } else {
      insertFaq();
    }
  }

  readyHandler();
})();
