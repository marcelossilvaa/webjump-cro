/**
 * Azul Seats Banner Modal (exibe após o loader sumir)
 * somente quando a classe .loader desaparece do DOM.
 */

(function () {
  'use strict';

  const CONFIG = {
    urlTarget: '/home/review',
    showDelay: 0,
    debounceAfterGoneMs: 200,
    hotelImage: 'https://imgur.com/8kb2vCw.png',
    title: 'Reserva de Assentos: Família Junta!',
    description:
      '<strong>Com crianças a bordo, todo planejamento vale a pena.</strong> <br> Reserve seus assentos com antecedência e garanta que todos fiquem juntos — a partir de R$61,00 por pessoa.',
    ctaText: 'Continuar e garantir assentos',
    ctaHref: null,
    card: {
      image: 'https://imgur.com/8kb2vCw.png',
      badgeText: 'Viagem com criança',
      title: 'Reserva de Assentos: Família Junta!',
      description:
        'Marque os assentos com antecedência e garanta que fiquem lado a lado. <a href="https://www.voeazul.com.br/br/pt/sua-viagem/assentos#tipos-de-assentos" class="azul-seats-card__link" target="_blank">Saiba mais.</a>',
      mobileDescription:
        '<p style="font-size: 16px; padding-bottom: 8px; color:#FFF;">Reserva de Assentos: Família Junta!</p> <strong style="font-size: 12px;">Com crianças a bordo, todo planejamento vale a pena.</strong> <br> <span style="font-weight: 300; font-size: 12px;">Reserve seus assentos com antecedência e garanta que todos fiquem juntos — a partir de R$ 61,00 por pessoa.</span>',
      priceFrom: 'R$ 61,00',
      priceTo: 'R$ 91,00',
      priceNoteLeft: 'Valor para 2 pessoas:',
      priceNoteRight: 'A partir de R$ 122,00',
    },
    brandColors: {
      primary: '#041E42',
      secondary: '#F0F8FF',
      text: '#333333',
    },
  };

  // Função de tracking de analytics
  function analyticsEvent(eventLabel) {
    if (eventLabel === undefined || !eventLabel) {
      console.log('[BannerAssentos] Missing parameters for analytics event.');
      return;
    }

    const labelEvent = 'AT_assentos_para_crianças ' + eventLabel;

    console.log('[BannerAssentos] Analytics event triggered:', labelEvent);

    (function () {
      var s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;

      s.linkTrackVars = 'events,eVar82';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;

      s.tl(true, 'o', 'target_activity_action');
    })();
  }

  class AzulSeatsBanner {
    constructor() {
      this.isVisible = false;
      this.observer = null;
      this.urlObserverAttached = false;
      this.lastUrl = window.location.href;
      this.bannerShown = false;
      this.debounceTimer = null;
      this.progressInterval = null;
      this.cardObserver = null;
      this.cardDebounceTimer = null;
      this.cardInserted = false;
      this.cardVerificationInterval = null;
      this.mobileCardObserver = null;
      this.mobileCardInserted = false;
      this.init();
    }

    init() {
      this.preloadBannerImage();
      this.setupUrlObserver();
      this.setupLoaderObserver();
      // Caso já não exista loader ao iniciar, ainda assim verifica com debounce
      if (this.isOnTargetUrl()) {
        this.scheduleCheckForLoaderGone();
        this.injectCardWhenReady();
        this.injectMobileCardWhenReady();
      }
    }

    preloadBannerImage() {
      const img = new Image();
      img.src = CONFIG.hotelImage;
    }

    isOnTargetUrl() {
      try {
        return window.location.href.includes(CONFIG.urlTarget);
      } catch (e) {
        return false;
      }
    }

    setupUrlObserver() {
      if (this.urlObserverAttached) return;
      this.urlObserverAttached = true;

      const handleChange = () => {
        const current = window.location.href;
        if (current === this.lastUrl) return;
        this.lastUrl = current;
        this.handleUrlChange();
      };

      const wrapHistory = (type) => {
        const orig = history[type];
        if (typeof orig === 'function') {
          history[type] = function () {
            const ret = orig.apply(this, arguments);
            try {
              window.dispatchEvent(new Event('historychange'));
            } catch (e) {}
            return ret;
          };
        }
      };

      wrapHistory('pushState');
      wrapHistory('replaceState');
      window.addEventListener('popstate', handleChange);
      window.addEventListener('hashchange', handleChange);
      window.addEventListener('historychange', handleChange);

      // Fallback polling para mudanças não capturadas
      setInterval(handleChange, 300);
    }

    handleUrlChange() {
      if (this.bannerShown) return;
      // Reset flags quando URL muda
      this.cardInserted = false;
      this.mobileCardInserted = false;
      if (this.isOnTargetUrl()) {
        this.scheduleCheckForLoaderGone();
        this.injectCardWhenReady();
        this.injectMobileCardWhenReady();
      }
    }

    setupLoaderObserver() {
      if (this.observer) return;

      this.observer = new MutationObserver((mutations) => {
        let relevant = false;
        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            // Se houve remoção/adição, pode afetar loaders
            if (mutation.removedNodes.length || mutation.addedNodes.length) {
              relevant = true;
            }
          } else if (mutation.type === 'attributes') {
            // Mudanças em class/style podem esconder/mostrar loader
            relevant = true;
          }
          if (relevant) break;
        }
        if (relevant) {
          this.scheduleCheckForLoaderGone();
        }
      });

      this.observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style'],
      });
    }

    // ========== Info Card (inserção imediata em /home/review) ==========
    injectCardWhenReady() {
      if (!this.isOnTargetUrl()) return;

      const already = document.getElementById('azul-seats-info-card');
      if (already) {
        this.cardInserted = true;
        return;
      }

      // Verifica se css-1oad65c já existe
      this.checkAndInsertCard();

      // Retries agressivos para garantir inserção
      setTimeout(() => {
        const card = document.getElementById('azul-seats-info-card');
        if (!card && this.isOnTargetUrl()) {
          this.cardInserted = false;
          this.checkAndInsertCard();
        }
      }, 300);

      setTimeout(() => {
        const card = document.getElementById('azul-seats-info-card');
        if (!card && this.isOnTargetUrl()) {
          this.cardInserted = false;
          this.checkAndInsertCard();
        }
      }, 800);

      setTimeout(() => {
        const card = document.getElementById('azul-seats-info-card');
        if (!card && this.isOnTargetUrl()) {
          this.cardInserted = false;
          this.checkAndInsertCard();
        }
      }, 2000);

      setTimeout(() => {
        const card = document.getElementById('azul-seats-info-card');
        if (!card && this.isOnTargetUrl()) {
          this.cardInserted = false;
          this.checkAndInsertCard();
        }
      }, 4000);

      // Cria observador para detectar quando css-1oad65c aparecer
      if (!this.cardObserver) {
        this.cardObserver = new MutationObserver(() => {
          if (!this.cardInserted) {
            // Debounce para evitar múltiplas execuções
            if (this.cardDebounceTimer) clearTimeout(this.cardDebounceTimer);
            this.cardDebounceTimer = setTimeout(() => {
              this.cardDebounceTimer = null;
              this.checkAndInsertCard();
            }, 150);
          }
        });
        this.cardObserver.observe(document.body, { childList: true, subtree: true });
      }
    }

    checkAndInsertCard() {
      if (!this.isOnTargetUrl()) return;

      // Verifica se já existe o card no DOM e está conectado
      const existingCard = document.getElementById('azul-seats-info-card');
      if (existingCard && existingCard.isConnected) {
        this.cardInserted = true;
        return;
      }

      // Se o flag diz que foi inserido mas o elemento não está no DOM, reseta o flag
      if (this.cardInserted && !existingCard) {
        this.cardInserted = false;
      }

      if (this.cardInserted) return;

      // Verifica se o elemento css-1oad65c existe
      const pickerElement = document.querySelector('.css-1oad65c');
      if (!pickerElement) return;

      // Encontra o container pai (aem-container)
      const container = pickerElement.closest('.aem-container');
      if (!container) return;

      // Encontra todos os GridColumns dentro desse container
      const gridColumns = container.querySelectorAll('.aem-GridColumn');
      if (gridColumns.length < 2) return; // Precisa ter pelo menos 2 GridColumns

      // Pega o segundo GridColumn (índice 1) - o que vem após o que contém css-1oad65c
      const targetGridColumn = gridColumns[1];
      if (!targetGridColumn) return;

      // Verifica se já não há um card inserido depois deste GridColumn
      const nextSibling = targetGridColumn.nextElementSibling;
      if (nextSibling && nextSibling.id === 'azul-seats-info-card') {
        this.cardInserted = true;
        return;
      }

      // Insere o card
      this.insertInfoCard(targetGridColumn);

      // Verifica se o elemento foi realmente inserido no DOM após um pequeno delay
      setTimeout(() => {
        const insertedCard = document.getElementById('azul-seats-info-card');
        if (insertedCard && insertedCard.isConnected) {
          // Elemento foi inserido com sucesso
          this.cardInserted = true;

          // Para o observer principal após inserir
          if (this.cardObserver) {
            this.cardObserver.disconnect();
            this.cardObserver = null;
          }

          // Observa remoção do card para reinserir se o app re-renderizar
          const removalObserver = new MutationObserver(() => {
            if (!document.getElementById('azul-seats-info-card') && this.isOnTargetUrl()) {
              removalObserver.disconnect();
              this.cardInserted = false;
              this.injectCardWhenReady();
            }
          });
          removalObserver.observe(container, { childList: true, subtree: true });

          // Verificação periódica para garantir que o card ainda está no DOM
          if (this.cardVerificationInterval) {
            clearInterval(this.cardVerificationInterval);
          }
          this.cardVerificationInterval = setInterval(() => {
            if (this.isOnTargetUrl()) {
              const card = document.getElementById('azul-seats-info-card');
              if (!card || !card.isConnected) {
                console.log('[BannerAssentos] Card não encontrado no DOM, reinserindo...');
                this.cardInserted = false;
                clearInterval(this.cardVerificationInterval);
                this.cardVerificationInterval = null;
                this.injectCardWhenReady();
              }
            } else {
              clearInterval(this.cardVerificationInterval);
              this.cardVerificationInterval = null;
            }
          }, 2000);
        } else {
          // Elemento não foi inserido, reseta flag e tenta novamente
          console.log('[BannerAssentos] Card não foi inserido corretamente, tentando novamente...');
          this.cardInserted = false;
          // Tenta novamente após um delay
          setTimeout(() => {
            if (!this.cardInserted && this.isOnTargetUrl()) {
              this.checkAndInsertCard();
            }
          }, 500);
        }
      }, 200);
    }

    // ========== Mobile Card (inserção no modal) ==========
    injectMobileCardWhenReady() {
      if (!this.isOnTargetUrl()) return;

      // Verifica se já existe o card mobile
      const already = document.getElementById('azul-seats-info-card-mobile');
      if (already) {
        this.mobileCardInserted = true;
        return;
      }

      // Verifica se o modal já existe
      this.checkAndInsertMobileCard();

      // Cria observador para detectar quando o modal aparecer
      if (!this.mobileCardObserver) {
        this.mobileCardObserver = new MutationObserver(() => {
          if (!this.mobileCardInserted) {
            // Debounce para evitar múltiplas execuções
            if (this.cardDebounceTimer) clearTimeout(this.cardDebounceTimer);
            this.cardDebounceTimer = setTimeout(() => {
              this.cardDebounceTimer = null;
              this.checkAndInsertMobileCard();
            }, 150);
          }
        });
        this.mobileCardObserver.observe(document.body, { childList: true, subtree: true });
      }
    }

    checkAndInsertMobileCard() {
      if (!this.isOnTargetUrl()) return;
      if (this.mobileCardInserted) return;

      // Verifica se é mobile (largura menor que 768px)
      if (window.innerWidth >= 768) return;

      // Encontra o modal
      const modal = document.querySelector('.modal-content.css-wbgz83');
      if (!modal) return;

      // Encontra o body do modal
      const modalBody = modal.querySelector('.modal-content__body');
      if (!modalBody) return;

      // Encontra todos os elementos .sc-bZkfAO.dSMPxi
      const seatItems = modalBody.querySelectorAll('.sc-bZkfAO.dSMPxi');
      if (seatItems.length === 0) return;

      // Pega o último elemento
      const lastSeatItem = seatItems[seatItems.length - 1];

      // Verifica se já não há um card inserido
      const nextSibling = lastSeatItem.nextElementSibling;
      if (nextSibling && nextSibling.id === 'azul-seats-info-card-mobile') {
        this.mobileCardInserted = true;
        return;
      }

      // Insere o card mobile
      this.insertMobileCard(lastSeatItem);
      this.mobileCardInserted = true;

      // Observa remoção do modal para resetar o flag
      const modalRemovalObserver = new MutationObserver(() => {
        const modal = document.querySelector('.modal-content.css-wbgz83');
        if (!modal && this.mobileCardInserted) {
          modalRemovalObserver.disconnect();
          this.mobileCardInserted = false;
          // Remove o card se ainda existir
          const mobileCard = document.getElementById('azul-seats-info-card-mobile');
          if (mobileCard) mobileCard.remove();
        }
      });
      modalRemovalObserver.observe(document.body, { childList: true, subtree: true });
    }

    insertMobileCard(referenceElement) {
      if (document.getElementById('azul-seats-info-card-mobile')) return;

      const html =
        '<div id="azul-seats-info-card-mobile" class="azul-seats-card-mobile">' +
        '<div class="azul-seats-card-mobile__image-wrap">' +
        '<img src="' +
        CONFIG.card.image +
        '" alt="Imagem ilustrativa" class="azul-seats-card-mobile__image"/>' +
        '</div>' +
        '<div class="azul-seats-card-mobile__content">' +
        '<p class="azul-seats-card-mobile__desc">' +
        CONFIG.card.mobileDescription +
        '</p>' +
        '</div>' +
        '</div>';

      referenceElement.insertAdjacentHTML('afterend', html);
      this.addMobileCardStyles();
    }

    addMobileCardStyles() {
      const styleId = 'azul-seats-info-card-mobile-styles';
      if (document.getElementById(styleId)) return;

      const s =
        '<style id="' +
        styleId +
        '">' +
        '.azul-seats-card-mobile{background:#fff;border-radius:4px;box-shadow:0 8px 24px rgba(0,0,0,0.12);overflow:hidden;border:1px solid rgba(0,0,0,0.05);display:none;}' +
        '@media(max-width:767px){.azul-seats-card-mobile{display:block;}}' +
        '.azul-seats-card-mobile__image-wrap{position:relative;height:48px;overflow:hidden;flex:none;order:0;align-self:stretch;flex-grow:1;z-index:0;}' +
        '.azul-seats-card-mobile__image{width:100%;height:100%;object-fit:cover;display:block;border-radius:2px 2px 0 0;object-position: 0px -14px;}' +
        '.azul-seats-card-mobile__content{background:#041E42;padding:12px;color:#fff;}' +
        '.azul-seats-card-mobile__desc{margin:0;color:#fff;font-size:13px;line-height:1.35;}' +
        '</style>';

      document.head.insertAdjacentHTML('beforeend', s);
    }

    insertInfoCard(referenceGridColumn) {
      if (document.getElementById('azul-seats-info-card')) return;

      const html =
        '<div id="azul-seats-info-card-mobile" class="azul-seats-card-mobile">' +
        '<div class="azul-seats-card-mobile__image-wrap">' +
        '<img src="' +
        CONFIG.card.image +
        '" alt="Imagem ilustrativa" class="azul-seats-card-mobile__image"/>' +
        '<div class="azul-seats-card-mobile__badge">' +
        '<svg class="azul-seats-card-mobile__badge-icon" width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M5.43618 1.56666C5.43618 2.43191 4.73476 3.13332 3.86952 3.13332C3.00428 3.13332 2.30286 2.43191 2.30286 1.56666C2.30286 0.701419 3.00428 0 3.86952 0C4.73476 0 5.43618 0.701419 5.43618 1.56666Z" fill="white"/>' +
        '<path fill-rule="evenodd" clip-rule="evenodd" d="M3.86952 2.82082C4.56217 2.82082 5.12368 2.25932 5.12368 1.56666C5.12368 0.874007 4.56217 0.3125 3.86952 0.3125C3.17686 0.3125 2.61536 0.874007 2.61536 1.56666C2.61536 2.25932 3.17686 2.82082 3.86952 2.82082ZM3.86952 3.13332C4.73476 3.13332 5.43618 2.43191 5.43618 1.56666C5.43618 0.701419 4.73476 0 3.86952 0C3.00428 0 2.30286 0.701419 2.30286 1.56666C2.30286 2.43191 3.00428 3.13332 3.86952 3.13332Z" fill="white"/>' +
        '<path d="M12.869 1.56666C12.869 2.43191 12.1676 3.13332 11.3024 3.13332C10.4371 3.13332 9.73572 2.43191 9.73572 1.56666C9.73572 0.701419 10.4371 0 11.3024 0C12.1676 0 12.869 0.701419 12.869 1.56666Z" fill="white"/>' +
        '<path fill-rule="evenodd" clip-rule="evenodd" d="M11.3024 2.82082C11.995 2.82082 12.5565 2.25932 12.5565 1.56666C12.5565 0.874007 11.995 0.3125 11.3024 0.3125C10.6097 0.3125 10.0482 0.874007 10.0482 1.56666C10.0482 2.25932 10.6097 2.82082 11.3024 2.82082ZM11.3024 3.13332C12.1676 3.13332 12.869 2.43191 12.869 1.56666C12.869 0.701419 12.1676 0 11.3024 0C10.4371 0 9.73572 0.701419 9.73572 1.56666C9.73572 2.43191 10.4371 3.13332 11.3024 3.13332Z" fill="white"/>' +
        '<path d="M2.74366 3.57544C2.56147 3.57544 2.38666 3.65184 2.25737 3.78797L0.340147 5.80667C0.0949512 6.06669 0.0949512 6.48827 0.340147 6.7483C0.585343 7.00832 0.982884 7.00832 1.22808 6.7483L2.28155 5.64671V11.7722C2.28155 12.0798 2.51674 12.3292 2.80685 12.3292C3.09697 12.3292 3.33215 12.0798 3.33215 11.7722V8.86952H4.4065V11.7722C4.4065 12.0798 4.64168 12.3292 4.9318 12.3292C5.22191 12.3292 5.4571 12.0798 5.4571 11.7722V5.64671L6.51057 6.7483C6.75576 7.00832 7.1533 7.00832 7.3985 6.7483C7.6437 6.48827 7.6437 6.06669 7.3985 5.80667L5.48128 3.78797C5.35199 3.65184 5.17719 3.57544 4.99499 3.57544H2.74366Z" fill="white"/>' +
        '<path fill-rule="evenodd" clip-rule="evenodd" d="M2.74366 3.73169C2.60575 3.73169 2.47147 3.78943 2.37066 3.89557L0.453826 5.91387C0.265563 6.11371 0.265448 6.44133 0.453826 6.6411C0.637347 6.83572 0.93088 6.83572 1.1144 6.6411L1.11515 6.6403L2.4378 5.25725V11.7722C2.4378 12.0023 2.61155 12.173 2.80685 12.173C3.00216 12.173 3.1759 12.0023 3.1759 11.7722V8.71327H4.56275V11.7722C4.56275 12.0023 4.73649 12.173 4.9318 12.173C5.1271 12.173 5.30085 12.0023 5.30085 11.7722V5.25725L6.62425 6.6411C6.80777 6.83572 7.1013 6.83572 7.28482 6.6411C7.47318 6.44135 7.47326 6.11397 7.28506 5.91412L5.36798 3.89557C5.26718 3.78943 5.1329 3.73169 4.99499 3.73169H2.74366ZM2.14407 3.68037C2.30185 3.51424 2.51718 3.41919 2.74366 3.41919H4.99499C5.22147 3.41919 5.4368 3.51424 5.59458 3.68037L7.5118 5.69907C7.81375 6.01928 7.81414 6.53528 7.51218 6.85549C7.20544 7.18079 6.70418 7.18092 6.39727 6.8559L5.61335 6.03617V11.7722C5.61335 12.1574 5.31673 12.4855 4.9318 12.4855C4.54687 12.4855 4.25025 12.1574 4.25025 11.7722V9.02577H3.4884V11.7722C3.4884 12.1574 3.19178 12.4855 2.80685 12.4855C2.42193 12.4855 2.1253 12.1574 2.1253 11.7722V6.03617L1.34176 6.85549C1.03485 7.18049 0.533204 7.18078 0.226467 6.85549C-0.075489 6.53528 -0.0754893 6.01969 0.226468 5.69947L2.14407 3.68037Z" fill="white"/>' +
        '<path d="M8.25663 1.75147C8.25663 1.75147 9.9735 1.70633 9.97486 0.873482C9.97623 0.0406384 8.26051 0.0776118 8.25663 1.75147Z" fill="white"/>' +
        '<path fill-rule="evenodd" clip-rule="evenodd" d="M9.78222 0.286695C9.98896 0.399247 10.1316 0.603456 10.1311 0.873738C10.1307 1.14472 9.98758 1.34544 9.79981 1.48684C9.61559 1.62556 9.37883 1.71575 9.15578 1.77569C8.93059 1.8362 8.70731 1.869 8.54155 1.88676C8.45834 1.89567 8.38886 1.90088 8.3399 1.90386C8.31541 1.90535 8.296 1.90629 8.28254 1.90687L8.26688 1.90747L8.26258 1.90761L8.26134 1.90765C8.26134 1.90765 8.26073 1.90766 8.25663 1.75147L8.26134 1.90765C8.21914 1.90876 8.17768 1.89276 8.14747 1.86327C8.11727 1.83378 8.10028 1.79332 8.10038 1.7511C8.10246 0.853163 8.57105 0.356415 9.07748 0.22148C9.32425 0.155732 9.58085 0.177065 9.78222 0.286695ZM8.41964 1.58462C8.44667 1.58228 8.47637 1.57946 8.50826 1.57604C8.66446 1.55931 8.87048 1.52877 9.07468 1.47389C9.28103 1.41844 9.47374 1.34119 9.61182 1.23721C9.74635 1.1359 9.81838 1.01867 9.81861 0.873226C9.81885 0.727087 9.7475 0.623601 9.6328 0.561156C9.51273 0.495789 9.34042 0.474824 9.15794 0.523445C8.83222 0.610232 8.47299 0.923731 8.41964 1.58462Z" fill="white"/>' +
        '<path d="M14.3493 1.75139C14.3493 1.75139 12.6324 1.70625 12.6311 0.873411C12.6297 0.0405667 14.3454 0.0775401 14.3493 1.75139Z" fill="white"/>' +
        '<path fill-rule="evenodd" clip-rule="evenodd" d="M12.8237 0.286623C12.617 0.399175 12.4744 0.603384 12.4748 0.873667C12.4753 1.14465 12.6183 1.34537 12.8061 1.48677C12.9903 1.62549 13.2271 1.71568 13.4501 1.77562C13.6753 1.83613 13.8986 1.86893 14.0644 1.88669C14.1476 1.8956 14.2171 1.90081 14.266 1.90379C14.2905 1.90528 14.3099 1.90622 14.3234 1.90679L14.339 1.9074L14.3433 1.90754L14.3446 1.90757C14.3446 1.90757 14.3452 1.90759 14.3493 1.75139L14.3446 1.90757C14.3868 1.90868 14.4282 1.89269 14.4585 1.8632C14.4887 1.83371 14.5056 1.79325 14.5055 1.75103C14.5035 0.853091 14.0349 0.356343 13.5284 0.221408C13.2817 0.15566 13.0251 0.176994 12.8237 0.286623ZM14.1863 1.58455C14.1593 1.58221 14.1296 1.57938 14.0977 1.57597C13.9415 1.55923 13.7354 1.5287 13.5312 1.47382C13.3249 1.41837 13.1322 1.34112 12.9941 1.23713C12.8596 1.13583 12.7875 1.0186 12.7873 0.873155C12.7871 0.727016 12.8584 0.62353 12.9731 0.561085C13.0932 0.495717 13.2655 0.474752 13.448 0.523373C13.7737 0.61016 14.1329 0.923659 14.1863 1.58455Z" fill="white"/>' +
        '<path fill-rule="evenodd" clip-rule="evenodd" d="M10.2406 3.57859C10.0534 3.57859 9.8738 3.65499 9.74097 3.79112L7.77132 5.80982C7.51942 6.06984 7.51942 6.49142 7.77132 6.75145C8.02322 7.01147 8.43164 7.01147 8.68354 6.75145L9.76582 5.64986L9.80536 5.86234L8.83336 8.72163C8.72884 9.04671 8.96331 9.38205 9.29513 9.38205H9.82168V9.39438H10.901V9.38205H11.8886V9.39438H12.9679V9.38205H13.3076C13.6394 9.38205 13.8739 9.04672 13.7694 8.72164L12.8371 5.82188V5.64986L13.9194 6.75145C14.1713 7.01147 14.5797 7.01147 14.8316 6.75145C15.0835 6.49142 15.0835 6.06984 14.8316 5.80982L12.8619 3.79112C12.7291 3.65499 12.5495 3.57859 12.3623 3.57859H10.2406ZM12.9679 10.1444H11.8886V11.7702C11.8886 12.0779 12.1302 12.3273 12.4282 12.3273C12.7263 12.3273 12.9679 12.0779 12.9679 11.7702V10.1444ZM10.901 10.1444H9.82168V11.7702C9.82168 12.0779 10.0633 12.3273 10.3613 12.3273C10.6594 12.3273 10.901 12.0779 10.901 11.7702V10.1444Z" fill="white"/>' +
        '<path fill-rule="evenodd" clip-rule="evenodd" d="M10.2406 3.73484C10.0963 3.73484 9.95676 3.7937 9.85281 3.90024L7.88355 5.91854C7.69052 6.11798 7.69041 6.44336 7.88355 6.64273C8.07405 6.83938 8.38081 6.83938 8.57131 6.64273L8.57208 6.64194L9.86456 5.32641L9.96645 5.87394L8.98175 8.77059C8.90843 9.00108 9.07652 9.2258 9.29513 9.2258H13.3076C13.5266 9.2258 13.6949 9.00035 13.6206 8.76947L12.6808 5.84638V5.26787L14.0316 6.64272C14.2221 6.83938 14.5289 6.83938 14.7194 6.64273C14.9125 6.44335 14.9126 6.11814 14.7195 5.9187L12.7501 3.90024C12.6461 3.7937 12.5067 3.73484 12.3623 3.73484H10.2406ZM11.7323 9.5383H11.0573V9.55063H9.66543V9.5383H9.29513C8.85045 9.5383 8.54981 9.09308 8.68461 8.67381L8.68541 8.67134L9.56849 6.07366L8.79576 6.86017C8.48243 7.18316 7.97226 7.18343 7.6591 6.86017C7.3485 6.53955 7.3485 6.02172 7.6591 5.7011L9.62914 3.68201C9.79083 3.51628 10.0105 3.42234 10.2406 3.42234H12.3623C12.5924 3.42234 12.8121 3.51628 12.9738 3.68201L14.9434 5.7007C15.254 6.02132 15.2544 6.53955 14.9438 6.86017C14.6306 7.18343 14.1209 7.18356 13.8075 6.86057L13.1054 6.1459L13.9181 8.67382C14.0529 9.09309 13.7523 9.5383 13.3076 9.5383H13.1241V9.55063H11.7323V9.5383ZM9.66543 9.98813H11.0573V11.7702C11.0573 12.1595 10.7503 12.4836 10.3613 12.4836C9.97237 12.4836 9.66543 12.1595 9.66543 11.7702V9.98813ZM9.97793 10.3006V11.7702C9.97793 11.9963 10.1542 12.1711 10.3613 12.1711C10.5685 12.1711 10.7448 11.9963 10.7448 11.7702V10.3006H9.97793ZM11.7323 9.98813H13.1241V11.7702C13.1241 12.1595 12.8172 12.4836 12.4282 12.4836C12.0392 12.4836 11.7323 12.1595 11.7323 11.7702V9.98813ZM12.0448 10.3006V11.7702C12.0448 11.9963 12.2211 12.1711 12.4282 12.1711C12.6353 12.1711 12.8116 11.9963 12.8116 11.7702V10.3006H12.0448Z" fill="white"/>' +
        '</svg>' +
        '<span class="azul-seats-card-mobile__badge-text">' +
        CONFIG.card.badgeText +
        '</span>' +
        '</div>' +
        '</div>' +
        '<div class="azul-seats-card-mobile__content">' +
        '<p class="azul-seats-card-mobile__title">' +
        CONFIG.card.title +
        '</p>' +
        '<p class="azul-seats-card-mobile__desc">' +
        CONFIG.card.description +
        '</p>' +
        '<div class="azul-seats-card-mobile__pricebox">' +
        '<div class="azul-seats-card-mobile__pricebox-row">' +
        '<span class="azul-seats-card-mobile__label">Valor:</span>' +
        '<span class="azul-seats-card-mobile__range"> <small>de</small><strong>' +
        CONFIG.card.priceFrom +
        '</strong>  <small>a</small><strong>' +
        CONFIG.card.priceTo +
        '</strong> <small>/pessoa</small></span>' +
        '</div>' +
        '<div class="azul-seats-card-mobile__pricebox-row azul-seats-card-mobile__pricebox-row--muted">' +
        '<span class="azul-seats-card-mobile__note-left">' +
        CONFIG.card.priceNoteLeft +
        '</span>' +
        '<span class="azul-seats-card-mobile__note-right">' +
        CONFIG.card.priceNoteRight +
        '</span>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';

      referenceElement.insertAdjacentHTML('afterend', html);
      this.addMobileCardStyles();
    }

    addMobileCardStyles() {
      const styleId = 'azul-seats-info-card-mobile-styles';
      if (document.getElementById(styleId)) return;

      const s =
        '<style id="' +
        styleId +
        '">' +
        '.azul-seats-card-mobile{background:#fff;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.12);overflow:hidden;border:1px solid rgba(0,0,0,0.05);display:none;}' +
        '@media(max-width:767px){.azul-seats-card-mobile{display:block;}}' +
        '.azul-seats-card-mobile__image-wrap{position:relative;height:48px;overflow:hidden;flex:none;order:0;align-self:stretch;flex-grow:1;z-index:0;}' +
        '.azul-seats-card-mobile__image{width:100%;height:100%;object-fit:cover;display:block;border-radius:2px 2px 0 0;object-position: 0px -14px;}' +
        '.azul-seats-card-mobile__badge{position:absolute;left:10.5px;top:9px;height:28px;background:rgba(4,30,66,0.6);color:#fff;border-radius:49px;padding:4px 8px;gap:8px;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;font-weight:700;display:flex;flex-direction:row;justify-content:center;align-items:center;}' +
        '.azul-seats-card-mobile__badge-icon{width:16px;height:13px;flex:none;order:0;flex-grow:0;}' +
        '.azul-seats-card-mobile__badge-text{width:auto;height:15px;font-size:10px;line-height:15px;display:flex;align-items:center;text-align:center;flex:none;order:1;flex-grow:0;color:#FFFFFF;white-space:nowrap;}' +
        '.azul-seats-card-mobile__content{line-height: 1; background:#041E42;padding:12px;color:#fff;text-align: start;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;}' +
        '.azul-seats-card-mobile__title{margin:0 0 8px 0;color:#003366;font-weight:700;font-size:14px;}' +
        '.azul-seats-card-mobile__desc{color:#FFF;font-size:12px;line-height:1.35;}' +
        '.azul-seats-card-mobile__link{color:' +
        CONFIG.brandColors.primary +
        ';text-decoration:underline;font-weight:600;}' +
        '.azul-seats-card-mobile__pricebox{background:#0E2B4F;border-radius:8px;padding:16px 8px;color:#fff;}' +
        '.azul-seats-card-mobile__pricebox-row{display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:14px;}' +
        '.azul-seats-card-mobile__pricebox-row + .azul-seats-card-mobile__pricebox-row{margin-top:8px;}' +
        '.azul-seats-card-mobile__pricebox-row--muted{font-size:12px;border-top:solid 1px;padding-top:10px;color:#9BA5B3;}' +
        '.azul-seats-card-mobile__label{font-weight:400;font-size:14px;}' +
        '.azul-seats-card-mobile__range strong{font-weight:700;font-size:14px;}' +
        '.azul-seats-card-mobile__range small{opacity:0.9;font-size:12px;margin-right:4px;}' +
        '.azul-seats-card-mobile__note-left{opacity:0.85;}' +
        '.azul-seats-card-mobile__note-right{opacity:0.85;}' +
        '</style>';

      document.head.insertAdjacentHTML('beforeend', s);
    }

    insertInfoCard(referenceGridColumn) {
      if (document.getElementById('azul-seats-info-card')) return;

      const html =
        '<div id="azul-seats-info-card" class="azul-seats-card">' +
        '<div class="azul-seats-card__image-wrap">' +
        '<img src="' +
        CONFIG.card.image +
        '" alt="Imagem ilustrativa" class="azul-seats-card__image"/>' +
        '<div class="azul-seats-card__badge">' +
        '<svg class="azul-seats-card__badge-icon" width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M5.43618 1.56666C5.43618 2.43191 4.73476 3.13332 3.86952 3.13332C3.00428 3.13332 2.30286 2.43191 2.30286 1.56666C2.30286 0.701419 3.00428 0 3.86952 0C4.73476 0 5.43618 0.701419 5.43618 1.56666Z" fill="white"/>' +
        '<path fill-rule="evenodd" clip-rule="evenodd" d="M3.86952 2.82082C4.56217 2.82082 5.12368 2.25932 5.12368 1.56666C5.12368 0.874007 4.56217 0.3125 3.86952 0.3125C3.17686 0.3125 2.61536 0.874007 2.61536 1.56666C2.61536 2.25932 3.17686 2.82082 3.86952 2.82082ZM3.86952 3.13332C4.73476 3.13332 5.43618 2.43191 5.43618 1.56666C5.43618 0.701419 4.73476 0 3.86952 0C3.00428 0 2.30286 0.701419 2.30286 1.56666C2.30286 2.43191 3.00428 3.13332 3.86952 3.13332Z" fill="white"/>' +
        '<path d="M12.869 1.56666C12.869 2.43191 12.1676 3.13332 11.3024 3.13332C10.4371 3.13332 9.73572 2.43191 9.73572 1.56666C9.73572 0.701419 10.4371 0 11.3024 0C12.1676 0 12.869 0.701419 12.869 1.56666Z" fill="white"/>' +
        '<path fill-rule="evenodd" clip-rule="evenodd" d="M11.3024 2.82082C11.995 2.82082 12.5565 2.25932 12.5565 1.56666C12.5565 0.874007 11.995 0.3125 11.3024 0.3125C10.6097 0.3125 10.0482 0.874007 10.0482 1.56666C10.0482 2.25932 10.6097 2.82082 11.3024 2.82082ZM11.3024 3.13332C12.1676 3.13332 12.869 2.43191 12.869 1.56666C12.869 0.701419 12.1676 0 11.3024 0C10.4371 0 9.73572 0.701419 9.73572 1.56666C9.73572 2.43191 10.4371 3.13332 11.3024 3.13332Z" fill="white"/>' +
        '<path d="M2.74366 3.57544C2.56147 3.57544 2.38666 3.65184 2.25737 3.78797L0.340147 5.80667C0.0949512 6.06669 0.0949512 6.48827 0.340147 6.7483C0.585343 7.00832 0.982884 7.00832 1.22808 6.7483L2.28155 5.64671V11.7722C2.28155 12.0798 2.51674 12.3292 2.80685 12.3292C3.09697 12.3292 3.33215 12.0798 3.33215 11.7722V8.86952H4.4065V11.7722C4.4065 12.0798 4.64168 12.3292 4.9318 12.3292C5.22191 12.3292 5.4571 12.0798 5.4571 11.7722V5.64671L6.51057 6.7483C6.75576 7.00832 7.1533 7.00832 7.3985 6.7483C7.6437 6.48827 7.6437 6.06669 7.3985 5.80667L5.48128 3.78797C5.35199 3.65184 5.17719 3.57544 4.99499 3.57544H2.74366Z" fill="white"/>' +
        '<path fill-rule="evenodd" clip-rule="evenodd" d="M2.74366 3.73169C2.60575 3.73169 2.47147 3.78943 2.37066 3.89557L0.453826 5.91387C0.265563 6.11371 0.265448 6.44133 0.453826 6.6411C0.637347 6.83572 0.93088 6.83572 1.1144 6.6411L1.11515 6.6403L2.4378 5.25725V11.7722C2.4378 12.0023 2.61155 12.173 2.80685 12.173C3.00216 12.173 3.1759 12.0023 3.1759 11.7722V8.71327H4.56275V11.7722C4.56275 12.0023 4.73649 12.173 4.9318 12.173C5.1271 12.173 5.30085 12.0023 5.30085 11.7722V5.25725L6.62425 6.6411C6.80777 6.83572 7.1013 6.83572 7.28482 6.6411C7.47318 6.44135 7.47326 6.11397 7.28506 5.91412L5.36798 3.89557C5.26718 3.78943 5.1329 3.73169 4.99499 3.73169H2.74366ZM2.14407 3.68037C2.30185 3.51424 2.51718 3.41919 2.74366 3.41919H4.99499C5.22147 3.41919 5.4368 3.51424 5.59458 3.68037L7.5118 5.69907C7.81375 6.01928 7.81414 6.53528 7.51218 6.85549C7.20544 7.18079 6.70418 7.18092 6.39727 6.8559L5.61335 6.03617V11.7722C5.61335 12.1574 5.31673 12.4855 4.9318 12.4855C4.54687 12.4855 4.25025 12.1574 4.25025 11.7722V9.02577H3.4884V11.7722C3.4884 12.1574 3.19178 12.4855 2.80685 12.4855C2.42193 12.4855 2.1253 12.1574 2.1253 11.7722V6.03617L1.34176 6.85549C1.03485 7.18049 0.533204 7.18078 0.226467 6.85549C-0.075489 6.53528 -0.0754893 6.01969 0.226468 5.69947L2.14407 3.68037Z" fill="white"/>' +
        '<path d="M8.25663 1.75147C8.25663 1.75147 9.9735 1.70633 9.97486 0.873482C9.97623 0.0406384 8.26051 0.0776118 8.25663 1.75147Z" fill="white"/>' +
        '<path fill-rule="evenodd" clip-rule="evenodd" d="M9.78222 0.286695C9.98896 0.399247 10.1316 0.603456 10.1311 0.873738C10.1307 1.14472 9.98758 1.34544 9.79981 1.48684C9.61559 1.62556 9.37883 1.71575 9.15578 1.77569C8.93059 1.8362 8.70731 1.869 8.54155 1.88676C8.45834 1.89567 8.38886 1.90088 8.3399 1.90386C8.31541 1.90535 8.296 1.90629 8.28254 1.90687L8.26688 1.90747L8.26258 1.90761L8.26134 1.90765C8.26134 1.90765 8.26073 1.90766 8.25663 1.75147L8.26134 1.90765C8.21914 1.90876 8.17768 1.89276 8.14747 1.86327C8.11727 1.83378 8.10028 1.79332 8.10038 1.7511C8.10246 0.853163 8.57105 0.356415 9.07748 0.22148C9.32425 0.155732 9.58085 0.177065 9.78222 0.286695ZM8.41964 1.58462C8.44667 1.58228 8.47637 1.57946 8.50826 1.57604C8.66446 1.55931 8.87048 1.52877 9.07468 1.47389C9.28103 1.41844 9.47374 1.34119 9.61182 1.23721C9.74635 1.1359 9.81838 1.01867 9.81861 0.873226C9.81885 0.727087 9.7475 0.623601 9.6328 0.561156C9.51273 0.495789 9.34042 0.474824 9.15794 0.523445C8.83222 0.610232 8.47299 0.923731 8.41964 1.58462Z" fill="white"/>' +
        '<path d="M14.3493 1.75139C14.3493 1.75139 12.6324 1.70625 12.6311 0.873411C12.6297 0.0405667 14.3454 0.0775401 14.3493 1.75139Z" fill="white"/>' +
        '<path fill-rule="evenodd" clip-rule="evenodd" d="M12.8237 0.286623C12.617 0.399175 12.4744 0.603384 12.4748 0.873667C12.4753 1.14465 12.6183 1.34537 12.8061 1.48677C12.9903 1.62549 13.2271 1.71568 13.4501 1.77562C13.6753 1.83613 13.8986 1.86893 14.0644 1.88669C14.1476 1.8956 14.2171 1.90081 14.266 1.90379C14.2905 1.90528 14.3099 1.90622 14.3234 1.90679L14.339 1.9074L14.3433 1.90754L14.3446 1.90757C14.3446 1.90757 14.3452 1.90759 14.3493 1.75139L14.3446 1.90757C14.3868 1.90868 14.4282 1.89269 14.4585 1.8632C14.4887 1.83371 14.5056 1.79325 14.5055 1.75103C14.5035 0.853091 14.0349 0.356343 13.5284 0.221408C13.2817 0.15566 13.0251 0.176994 12.8237 0.286623ZM14.1863 1.58455C14.1593 1.58221 14.1296 1.57938 14.0977 1.57597C13.9415 1.55923 13.7354 1.5287 13.5312 1.47382C13.3249 1.41837 13.1322 1.34112 12.9941 1.23713C12.8596 1.13583 12.7875 1.0186 12.7873 0.873155C12.7871 0.727016 12.8584 0.62353 12.9731 0.561085C13.0932 0.495717 13.2655 0.474752 13.448 0.523373C13.7737 0.61016 14.1329 0.923659 14.1863 1.58455Z" fill="white"/>' +
        '<path fill-rule="evenodd" clip-rule="evenodd" d="M10.2406 3.57859C10.0534 3.57859 9.8738 3.65499 9.74097 3.79112L7.77132 5.80982C7.51942 6.06984 7.51942 6.49142 7.77132 6.75145C8.02322 7.01147 8.43164 7.01147 8.68354 6.75145L9.76582 5.64986L9.80536 5.86234L8.83336 8.72163C8.72884 9.04671 8.96331 9.38205 9.29513 9.38205H9.82168V9.39438H10.901V9.38205H11.8886V9.39438H12.9679V9.38205H13.3076C13.6394 9.38205 13.8739 9.04672 13.7694 8.72164L12.8371 5.82188V5.64986L13.9194 6.75145C14.1713 7.01147 14.5797 7.01147 14.8316 6.75145C15.0835 6.49142 15.0835 6.06984 14.8316 5.80982L12.8619 3.79112C12.7291 3.65499 12.5495 3.57859 12.3623 3.57859H10.2406ZM12.9679 10.1444H11.8886V11.7702C11.8886 12.0779 12.1302 12.3273 12.4282 12.3273C12.7263 12.3273 12.9679 12.0779 12.9679 11.7702V10.1444ZM10.901 10.1444H9.82168V11.7702C9.82168 12.0779 10.0633 12.3273 10.3613 12.3273C10.6594 12.3273 10.901 12.0779 10.901 11.7702V10.1444Z" fill="white"/>' +
        '<path fill-rule="evenodd" clip-rule="evenodd" d="M10.2406 3.73484C10.0963 3.73484 9.95676 3.7937 9.85281 3.90024L7.88355 5.91854C7.69052 6.11798 7.69041 6.44336 7.88355 6.64273C8.07405 6.83938 8.38081 6.83938 8.57131 6.64273L8.57208 6.64194L9.86456 5.32641L9.96645 5.87394L8.98175 8.77059C8.90843 9.00108 9.07652 9.2258 9.29513 9.2258H13.3076C13.5266 9.2258 13.6949 9.00035 13.6206 8.76947L12.6808 5.84638V5.26787L14.0316 6.64272C14.2221 6.83938 14.5289 6.83938 14.7194 6.64273C14.9125 6.44335 14.9126 6.11814 14.7195 5.9187L12.7501 3.90024C12.6461 3.7937 12.5067 3.73484 12.3623 3.73484H10.2406ZM11.7323 9.5383H11.0573V9.55063H9.66543V9.5383H9.29513C8.85045 9.5383 8.54981 9.09308 8.68461 8.67381L8.68541 8.67134L9.56849 6.07366L8.79576 6.86017C8.48243 7.18316 7.97226 7.18343 7.6591 6.86017C7.3485 6.53955 7.3485 6.02172 7.6591 5.7011L9.62914 3.68201C9.79083 3.51628 10.0105 3.42234 10.2406 3.42234H12.3623C12.5924 3.42234 12.8121 3.51628 12.9738 3.68201L14.9434 5.7007C15.254 6.02132 15.2544 6.53955 14.9438 6.86017C14.6306 7.18343 14.1209 7.18356 13.8075 6.86057L13.1054 6.1459L13.9181 8.67382C14.0529 9.09309 13.7523 9.5383 13.3076 9.5383H13.1241V9.55063H11.7323V9.5383ZM9.66543 9.98813H11.0573V11.7702C11.0573 12.1595 10.7503 12.4836 10.3613 12.4836C9.97237 12.4836 9.66543 12.1595 9.66543 11.7702V9.98813ZM9.97793 10.3006V11.7702C9.97793 11.9963 10.1542 12.1711 10.3613 12.1711C10.5685 12.1711 10.7448 11.9963 10.7448 11.7702V10.3006H9.97793ZM11.7323 9.98813H13.1241V11.7702C13.1241 12.1595 12.8172 12.4836 12.4282 12.4836C12.0392 12.4836 11.7323 12.1595 11.7323 11.7702V9.98813ZM12.0448 10.3006V11.7702C12.0448 11.9963 12.2211 12.1711 12.4282 12.1711C12.6353 12.1711 12.8116 11.9963 12.8116 11.7702V10.3006H12.0448Z" fill="white"/>' +
        '</svg>' +
        '<span class="azul-seats-card__badge-text">' +
        CONFIG.card.badgeText +
        '</span>' +
        '</div>' +
        '<button class="azul-seats-card__expand" aria-label="Expandir imagem" type="button">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M8 3H5C3.9 3 3 3.9 3 5V8M21 8V5C21 3.9 20.1 3 19 3H16M16 21H19C20.1 21 21 20.1 21 19V16M3 16V19C3 20.1 3.9 21 5 21H8" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>' +
        '</svg>' +
        '</button>' +
        '</div>' +
        '<div class="azul-seats-card__content">' +
        '<p class="azul-seats-card__title">' +
        CONFIG.card.title +
        '</p>' +
        '<p class="azul-seats-card__desc">' +
        CONFIG.card.description +
        '</p>' +
        '<div class="azul-seats-card__pricebox">' +
        '<div class="azul-seats-card__pricebox-row">' +
        '<span class="azul-seats-card__label">Valor:</span>' +
        '<span class="azul-seats-card__range"> <small>de</small><strong>' +
        CONFIG.card.priceFrom +
        '</strong>  <small>a</small><strong>' +
        CONFIG.card.priceTo +
        '</strong> <small>/pessoa</small></span>' +
        '</div>' +
        '<div class="azul-seats-card__pricebox-row azul-seats-card__pricebox-row--muted">' +
        '<span class="azul-seats-card__note-left">' +
        CONFIG.card.priceNoteLeft +
        '</span>' +
        '<span class="azul-seats-card__note-right">' +
        CONFIG.card.priceNoteRight +
        '</span>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';

      referenceGridColumn.insertAdjacentHTML('afterend', html);
      this.addCardStyles();

      // Adiciona tracking no link "Saiba mais"
      setTimeout(() => {
        const saibaMaisLink = document.querySelector('.azul-seats-card__link');
        if (saibaMaisLink) {
          saibaMaisLink.addEventListener('click', () => {
            analyticsEvent('saiba_mais_link');
          });
        }
      }, 100);
    }

    addCardStyles() {
      const styleId = 'azul-seats-info-card-styles';
      if (document.getElementById(styleId)) return;

      const s =
        '<style id="' +
        styleId +
        '">' +
        '.azul-seats-card{background:#fff;border-radius:4px;box-shadow:0 8px 24px rgba(0,0,0,0.12);overflow:hidden;border:1px solid rgba(0,0,0,0.05);margin:12px 0;margin-right:24px;width:285px;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;padding:0;isolation:isolate;}' +
        '.azul-seats-card__image-wrap{position:relative;height:90px;overflow:hidden;flex:none;order:0;align-self:stretch;flex-grow:1;z-index:0;}' +
        '.azul-seats-card__image{width:100%;height:100%;object-fit:cover;display:block;border-radius:2px 2px 0 0;object-position: 0px -14px;}' +
        '.azul-seats-card__badge{position:absolute;left:10.5px;top:9px;height:28px;background:rgba(4,30,66,0.6);color:#fff;border-radius:49px;padding:4px 8px;gap:8px;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;font-weight:700;display:flex;flex-direction:row;justify-content:center;align-items:center;}' +
        '.azul-seats-card__badge-icon{width:16px;height:13px;flex:none;order:0;flex-grow:0;}' +
        '.azul-seats-card__badge-text{width:auto;height:15px;font-size:10px;line-height:15px;display:flex;align-items:center;text-align:center;flex:none;order:1;flex-grow:0;color:#FFFFFF;white-space:nowrap;}' +
        '.azul-seats-card__expand{position:absolute;width:20px;height:20px;right:12px;top:12px;background:transparent;border:none;cursor:pointer;padding:0;display:flex;flex-direction:column;justify-content:center;align-items:center;flex:none;order:1;flex-grow:0;z-index:1;}' +
        '.azul-seats-card__expand svg{width:20px;height:20px;flex:none;order:0;flex-grow:0;}' +
        '.azul-seats-card__content{padding:12px;}' +
        '.azul-seats-card__title{margin:0 0 8px 0;color:#003366;font-weight:700;font-size:14px;}' +
        '.azul-seats-card__desc{margin:0 0 12px 0;color:#333;font-size:12px;line-height:1.35;}' +
        '.azul-seats-card__link{color:#026CB6' +
        ';text-decoration:underline;font-weight:600;}' +
        '.azul-seats-card__pricebox{background:#0E2B4F;border-radius:8px;padding:16px 8px;color:#fff;}' +
        '.azul-seats-card__pricebox-row{display:flex;justify-content:space-between;align-items:center;gap:10px; font-size:14px;}' +
        '.azul-seats-card__pricebox-row + .azul-seats-card__pricebox-row{margin-top:8px;}' +
        '.azul-seats-card__pricebox-row--muted{font-size:12px; border-top: solid 1px; padding-top: 10px;     color: #9BA5B3;}' +
        '.azul-seats-card__label{font-weight:400; font-size: 14px;}' +
        '.azul-seats-card__range strong{font-weight:700; font-size:14px;}' +
        '.azul-seats-card__range small{opacity:0.9; font-size:12px;margin-right: 4px;}' +
        '.azul-seats-card__note-left{opacity:0.85;}' +
        '.azul-seats-card__note-right{opacity:0.85;}' +
        '@media(max-width:767px){.azul-seats-card{display:none;}}' +
        '</style>';

      document.head.insertAdjacentHTML('beforeend', s);
    }

    scheduleCheckForLoaderGone() {
      if (this.bannerShown) return;
      if (!this.isOnTargetUrl()) return;
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
      this.debounceTimer = setTimeout(() => {
        this.debounceTimer = null;
        const anyLoader = document.querySelector('.loader');
        if (!anyLoader) {
          this.showOnce();
        }
      }, CONFIG.debounceAfterGoneMs);
    }

    showOnce() {
      if (this.bannerShown) return;
      this.bannerShown = true;
      this.createBannerHTML();
      this.addStyles();
      this.setupEventListeners();
      setTimeout(() => this.showBanner(), CONFIG.showDelay);
      // sem barra de progresso
    }

    createBannerHTML() {
      const existing = document.getElementById('azul-seats-banner');
      if (existing) existing.remove();

      const bannerHTML =
        '<div id="azul-seats-banner" class="azul-banner-overlay">' +
        '<div class="azul-banner-modal">' +
        '<button class="azul-banner-close" aria-label="Fechar modal" type="button"><span aria-hidden="true">×</span></button>' +
        '<!-- Versão Desktop -->' +
        '<div class="azul-banner-desktop">' +
        '<div class="azul-banner-image">' +
        '<img src="' +
        CONFIG.hotelImage +
        '" alt="Resort tropical com piscina" />' +
        '</div>' +
        '<div class="azul-banner-content">' +
        '<h2 class="azul-banner-title">' +
        CONFIG.title +
        '</h2>' +
        '<p class="azul-banner-description">' +
        CONFIG.description +
        '</p>' +
        '<div class="azul-banner-actions">' +
        '<button class="azul-banner-cta" role="button">' +
        CONFIG.ctaText +
        '</button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<!-- Versão Mobile -->' +
        '<div class="azul-banner-mobile">' +
        '<div class="azul-banner-mobile-image">' +
        '<img src="' +
        CONFIG.hotelImage +
        '" alt="Resort tropical com piscina" />' +
        '</div>' +
        '<div class="azul-banner-mobile-content">' +
        '<div class="azul-banner-background-icon">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" fill="none">' +
        '<g opacity="0.08">' +
        '<circle cx="100" cy="100" r="75" fill="#595959" />' +
        '</g>' +
        '</svg>' +
        '</div>' +
        '<h2 class="azul-banner-title">' +
        CONFIG.title +
        '</h2>' +
        '<p class="azul-banner-description">' +
        CONFIG.description +
        '</p>' +
        '<div class="azul-banner-actions">' +
        '<a href="' +
        (CONFIG.ctaHref ? CONFIG.ctaHref : '#') +
        '" class="azul-banner-cta" role="button">' +
        CONFIG.ctaText +
        '</a>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';

      document.body.insertAdjacentHTML('beforeend', bannerHTML);
    }

    addStyles() {
      const styleId = 'azul-seats-banner-styles';
      if (document.getElementById(styleId)) return;

      const styles =
        '<style id="' +
        styleId +
        '">' +
        '.azul-banner-overlay {' +
        'position: fixed;' +
        'top: 0;' +
        'left: 0;' +
        'width: 100%;' +
        'height: 100%;' +
        'background: rgba(0, 0, 0, 0.7);' +
        'z-index: 10000;' +
        'display: flex;' +
        'align-items: center;' +
        'justify-content: center;' +
        'opacity: 0;' +
        'visibility: hidden;' +
        'transition: all 0.3s ease;' +
        'backdrop-filter: blur(2px);' +
        '}' +
        '.azul-banner-overlay.show {' +
        'opacity: 1;' +
        'visibility: visible;' +
        '}' +
        '.azul-banner-modal {' +
        'background: white;' +
        'border-radius: 8px;' +
        'box-shadow: 0 25px 80px rgba(0, 0, 0, 0.25);' +
        'max-width: 850px;' +
        'width: 90vw;' +
        'max-height: 90vh;' +
        'position: relative;' +
        'overflow: hidden;' +
        'animation: azulSlideIn 0.4s ease-out;' +
        '}' +
        '.azul-banner-close { position:absolute; top:0px; right:12px; width:32px; height:32px; border:none; background:transparent; color:#4c4c4c; font-size:40px; line-height:1; cursor:pointer; z-index:5; font-weight:300; font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;}' +
        '@keyframes azulSlideIn {' +
        'from { transform: translateY(30px) scale(0.95); opacity: 0; }' +
        'to { transform: translateY(0) scale(1); opacity: 1; }' +
        '}' +
        '.azul-banner-desktop {' +
        'display: flex;' +
        'height: 285px;' +
        '}' +
        '.azul-banner-image {' +
        'flex: 0 0 46%;' +
        'position: relative;' +
        'overflow: hidden;' +
        'border-radius: 8px 0 0 8px;' +
        '}' +
        '.azul-banner-image img {' +
        'width: 100%;' +
        'height: 100%;' +
        'object-fit: cover;' +
        '}' +
        '.azul-banner-content {' +
        'flex: 0 0 54%;' +
        'padding: 35px 30px 35px 25px;' +
        'display: flex;' +
        'flex-direction: column;' +
        'justify-content: center;' +
        'background: white;' +
        'position: relative;' +
        'border-radius: 0 20px 20px 0;' +
        '}' +
        '.azul-banner-background-icon {' +
        'position: absolute;' +
        'top: 50%;' +
        'right: -15%;' +
        'transform: translateY(-50%);' +
        'z-index: 3;' +
        'pointer-events: none;' +
        '}' +
        '.azul-banner-background-icon svg {' +
        'width: 250px;' +
        'height: 250px;' +
        '}' +
        '.azul-banner-mobile {' +
        'display: none;' +
        'flex-direction: column;' +
        'min-width: 320px;' +
        'max-width: 400px;' +
        'overflow: hidden;' +
        '}' +
        '.azul-banner-mobile-image { height: 250px; overflow: hidden; position: relative; }' +
        '.azul-banner-mobile-image img { width: 100%; height: 100%; object-fit: cover; }' +
        '.azul-banner-mobile-content { padding: 35px 30px; background: white; position: relative; }' +
        '.azul-banner-mobile-content .azul-banner-background-icon { position: absolute; top: 50%; right: -10%; transform: translateY(-50%); z-index: 3; pointer-events: none; }' +
        '.azul-banner-mobile-content .azul-banner-background-icon svg { width: 180px; height: 180px; }' +
        '.azul-banner-title {' +
        'font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;' +
        'font-size: 26px;' +
        'font-weight: 400;' +
        'color: ' +
        CONFIG.brandColors.primary +
        ';' +
        'margin: 15px 0 25px 0;' +
        'line-height: 1.2;' +
        'letter-spacing: -0.5px;' +
        'position: relative;' +
        'z-index: 4;' +
        '}' +
        '.azul-banner-description {' +
        'font-size: 14px;' +
        'color: ' +
        CONFIG.brandColors.text +
        ';' +
        'margin: 0 0 20px 0;' +
        'line-height: 1.3;' +
        'font-weight: 400;' +
        'position: relative;' +
        'z-index: 4;' +
        '}' +
        '.azul-banner-description strong { font-weight: 700; }' +
        '.azul-banner-actions { margin-top: 20px; }' +
        '.azul-banner-cta { cursor: pointer; font-size: 16px; border: none; width: 100%; display:block; text-align:center; background: ' +
        '#026CB6' +
        '; color:#fff; text-decoration:none; border-radius:8px; padding:14px 18px; font-weight:400; font-family:"Segoe UI", Tahoma, Geneva, Verdana, sans-serif; }' +
        '@media (max-width: 768px) {' +
        '.azul-banner-desktop { display: none; }' +
        '.azul-banner-mobile { display: flex; }' +
        '.azul-banner-modal { margin: 20px; max-width: 350px; width: calc(100vw - 40px); font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;}' +
        '.azul-banner-title { font-size: 28px; margin-bottom: 16px; }' +
        '.azul-banner-description { font-size: 12px; margin-bottom: 30px; line-height: 1.5; }' +
        '}' +
        '@media (max-width: 480px) {' +
        '.azul-banner-modal { margin: 15px; max-width: calc(100vw - 30px); width: calc(100vw - 30px); border-radius: 16px; }' +
        '.azul-banner-mobile-content { padding: 30px 25px; }' +
        '.azul-banner-mobile-image { height: 220px; }' +
        '.azul-banner-title { font-size: 24px; }' +
        '.azul-banner-description { font-size: 12px; margin-bottom: 25px; }' +
        '}' +
        '@media(max-width:767px){.azul-banner-overlay{display:none!important;}}' +
        '</style>';

      document.head.insertAdjacentHTML('beforeend', styles);
    }

    setupEventListeners() {
      const banner = document.getElementById('azul-seats-banner');
      if (!banner) return;

      banner.addEventListener('click', (e) => {
        if (e.target === banner) this.hideBanner();
      });

      // Event listener para o botão X de fechar
      const closeBtn = banner.querySelector('.azul-banner-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation(); // Evita que o evento borbulhe
          analyticsEvent('close_button');
          this.hideBanner();
        });
      }

      const continueBuy = banner.querySelector('.azul-banner-cta');
      if (continueBuy) {
        continueBuy.addEventListener('click', (e) => {
          e.stopPropagation(); // Evita que o evento borbulhe
          analyticsEvent('continue_button');
          this.hideBanner();
        });
      }

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isVisible) this.hideBanner();
      });
    }

    showBanner() {
      const banner = document.getElementById('azul-seats-banner');
      if (!banner) return;
      banner.classList.add('show');
      this.isVisible = true;
      this.trackBannerEvent('show');
    }

    hideBanner() {
      if (!this.isVisible) return;
      const banner = document.getElementById('azul-seats-banner');
      if (!banner) return;
      banner.classList.remove('show');
      this.isVisible = false;
      this.trackBannerEvent('hide');
      setTimeout(() => {
        if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
      }, 300);
    }

    trackBannerEvent(action) {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'azul_seats_banner_' + action, {
          event_category: 'promotional_banner',
          event_label: 'after_loader',
          value: 1,
        });
      }
    }
  }

  function initAzulSeatsBanner() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => new AzulSeatsBanner());
    } else {
      new AzulSeatsBanner();
    }
  }

  initAzulSeatsBanner();
  window.AzulSeatsBanner = AzulSeatsBanner;
})();
