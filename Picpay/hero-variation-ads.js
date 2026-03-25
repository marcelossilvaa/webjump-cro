/**
 * PicPay - Hero Banner Personalization (ADS / Cartão de Crédito)
 * Adobe Target Custom Code - Source Based Personalization
 * 
 * CENÁRIO: Usuário vindo de campanhas Google Ads focadas em Cartão
 * UTM: utm_source=google_ads OU utm_campaign=cartao
 * 
 * @version 1.0.0
 * @author Front-end Team
 */

(function () {
  'use strict';

  // ============================================
  // CONFIGURAÇÕES
  // ============================================
  var CONFIG = {
    // Seletores do site PicPay
    selectors: {
      heroInner: '.hero__slide--inner',
      titleWrapper: '.hero__slide--title-wrapper',
      title: '.hero__slide--title h1',
      description: '.hero__slide--description',
      ctaWrapper: '.hero__cta',
      ctaButton: '.hero__cta .button',
      heroPicture: '.hero__slide picture',
      heroImg: '.hero__slide picture img'
    },

    // Conteúdo personalizado - Variação ADS
    content: {
      title: 'Seu cartão PicPay: Zero anuidade e limite que cresce com você',
      titleHighlight: 'Zero anuidade',
      description: [
        'Peça agora, construa seu histórico de',
        'crédito e aproveite benefícios exclusivos.',
        'Sem burocracia, direto pelo app.'
      ],
      cta: {
        text: 'Pedir meu cartão',
        href: '/pt-br/cartao'
      },
      heroImage: {
        src: 'https://picpay.com/fragments/pt-br/pf/conta-digital/media_1a33cee32c2b080505046d73a46c7d2bc9776a2ed.png',
        alt: 'Cartão de crédito PicPay sem anuidade',
        widthDesktop: 2000,
        widthMobile: 750
      }
    },

    // UTMs válidos para esta variação
    validSources: ['google_ads', 'google', 'gads', 'cpc'],
    validCampaigns: ['cartao', 'card', 'credito', 'credit'],

    // Tracking
    tracking: {
      variant: 'ads_cartao',
      eventName: 'ppay_hero_personalization'
    }
  };

  // ============================================
  // ESTILOS INLINE (Scoped)
  // ============================================
  var STYLES = [
    '<style id="ppay-hero-ads-styles">',
    '/* Reset e ajustes específicos para a variação ADS */',
    '[data-ppay-variant="ads"] .hero__slide--title h1 {',
    '  font-size: clamp(32px, 5vw, 52px) !important;',
    '  font-weight: 700 !important;',
    '  line-height: 1.12 !important;',
    '  letter-spacing: -0.5px !important;',
    '}',
    '',
    '/* Destaque verde no texto */',
    '[data-ppay-variant="ads"] .hero__slide--title h1 .ppay-text-highlight {',
    '  color: #11C76F !important;',
    '  font-weight: 700 !important;',
    '}',
    '',
    '[data-ppay-variant="ads"] .hero__slide--description p {',
    '  font-size: 17px !important;',
    '  line-height: 1.65 !important;',
    '  margin-bottom: 4px !important;',
    '}',
    '',
    '[data-ppay-variant="ads"] .hero__cta .button.primary-cta {',
    '  background: #11C76F !important;',
    '  color: #FFFFFF !important;',
    '  border: none !important;',
    '  padding: 15px 32px !important;',
    '  border-radius: 48px !important;',
    '  font-weight: 600 !important;',
    '  font-size: 15px !important;',
    '  transition: all 0.25s ease !important;',
    '  box-shadow: 0 6px 18px rgba(17, 199, 111, 0.35) !important;',
    '}',
    '',
    '[data-ppay-variant="ads"] .hero__cta .button.primary-cta:hover {',
    '  background: #0EAD5F !important;',
    '  transform: translateY(-2px) !important;',
    '  box-shadow: 0 8px 24px rgba(17, 199, 111, 0.45) !important;',
    '}',
    '',
    '/* Animação de entrada */',
    '[data-ppay-variant="ads"] .hero__slide--title,',
    '[data-ppay-variant="ads"] .hero__slide--description,',
    '[data-ppay-variant="ads"] .hero__cta {',
    '  animation: ppayFadeInUp 0.6s ease forwards;',
    '  opacity: 0;',
    '}',
    '',
    '[data-ppay-variant="ads"] .hero__slide--description {',
    '  animation-delay: 0.15s;',
    '}',
    '',
    '[data-ppay-variant="ads"] .hero__cta {',
    '  animation-delay: 0.3s;',
    '}',
    '',
    '@keyframes ppayFadeInUp {',
    '  from {',
    '    opacity: 0;',
    '    transform: translateY(20px);',
    '  }',
    '  to {',
    '    opacity: 1;',
    '    transform: translateY(0);',
    '  }',
    '}',
    '</style>'
  ].join('\n');

  // ============================================
  // UTILITÁRIOS
  // ============================================
  var Utils = {
    /**
     * Extrai parâmetros UTM da URL
     */
    getUTMParams: function () {
      var params = new URLSearchParams(window.location.search);
      return {
        source: (params.get('utm_source') || '').toLowerCase(),
        medium: (params.get('utm_medium') || '').toLowerCase(),
        campaign: (params.get('utm_campaign') || '').toLowerCase(),
        content: (params.get('utm_content') || '').toLowerCase(),
        term: (params.get('utm_term') || '').toLowerCase()
      };
    },

    /**
     * Verifica se o UTM corresponde à variação
     */
    isValidUTM: function (utmParams) {
      var sourceMatch = CONFIG.validSources.some(function (s) {
        return utmParams.source.indexOf(s) !== -1;
      });

      var campaignMatch = CONFIG.validCampaigns.some(function (c) {
        return utmParams.campaign.indexOf(c) !== -1;
      });

      return sourceMatch || campaignMatch;
    },

    /**
     * Aguarda elemento no DOM
     */
    waitForElement: function (selector, callback, maxAttempts) {
      maxAttempts = maxAttempts || 50;
      var attempts = 0;

      var check = function () {
        var element = document.querySelector(selector);
        if (element) {
          callback(element);
        } else if (attempts < maxAttempts) {
          attempts++;
          requestAnimationFrame(check);
        } else {
          console.warn('[PicPay Personalization] Elemento não encontrado:', selector);
        }
      };

      check();
    },

    /**
     * Destaca texto específico com span
     */
    highlightText: function (fullText, highlightPart) {
      if (!highlightPart) return fullText;
      return fullText.replace(
        highlightPart,
        '<span class="ppay-text-highlight">' + highlightPart + '</span>'
      );
    },

    /**
     * Log estilizado no console
     */
    log: function (message, type) {
      var styles = {
        success: 'background: #11C76F; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
        info: 'background: #3498DB; color: white; padding: 4px 8px; border-radius: 4px;',
        warn: 'background: #F39C12; color: white; padding: 4px 8px; border-radius: 4px;'
      };

      console.log('%c[PicPay] ' + message, styles[type] || styles.info);
    }
  };

  // ============================================
  // PERSONALIZATION ENGINE
  // ============================================
  var Personalization = {
    /**
     * Injeta estilos no head
     */
    injectStyles: function () {
      if (!document.getElementById('ppay-hero-ads-styles')) {
        document.head.insertAdjacentHTML('beforeend', STYLES);
      }
    },

    /**
     * Atualiza o título H1 com destaque
     */
    updateTitle: function () {
      Utils.waitForElement(CONFIG.selectors.title, function (titleEl) {
        var highlightedTitle = Utils.highlightText(
          CONFIG.content.title,
          CONFIG.content.titleHighlight
        );
        titleEl.innerHTML = highlightedTitle;
        Utils.log('Título atualizado: ' + CONFIG.content.title, 'success');
      });
    },

    /**
     * Atualiza a descrição
     */
    updateDescription: function () {
      Utils.waitForElement(CONFIG.selectors.description, function (descEl) {
        var descriptionHTML = CONFIG.content.description
          .map(function (line) {
            return '<p>' + line + '</p>';
          })
          .join('');

        descEl.innerHTML = descriptionHTML;
        Utils.log('Descrição atualizada', 'success');
      });
    },

    /**
     * Atualiza o CTA principal
     */
    updateCTA: function () {
      Utils.waitForElement(CONFIG.selectors.ctaButton, function (ctaEl) {
        // Adiciona classe customizada
        ctaEl.classList.add('primary-cta');
        ctaEl.textContent = CONFIG.content.cta.text;
        ctaEl.setAttribute('href', CONFIG.content.cta.href);

        // Atributos de tracking
        ctaEl.setAttribute('data-gtm-personalization', CONFIG.tracking.variant);

        Utils.log('CTA atualizado: ' + CONFIG.content.cta.text, 'success');
      });
    },

    /**
     * Adiciona marcador de variação
     */
    markVariant: function () {
      Utils.waitForElement(CONFIG.selectors.heroInner, function (heroEl) {
        heroEl.setAttribute('data-ppay-variant', 'ads');
        heroEl.closest('section') && heroEl.closest('section').setAttribute('data-ppay-variant', 'ads');
      });
    },

    /**
     * Atualiza a imagem do Hero Banner
     */
    updateHeroImage: function () {
      var imageConfig = CONFIG.content.heroImage;
      
      // Atualiza o elemento <picture> com as novas sources
      Utils.waitForElement(CONFIG.selectors.heroPicture, function (pictureEl) {
        var baseSrc = imageConfig.src;
        
        // Monta as novas sources
        var newPictureHTML = [
          '<source type="image/webp" srcset="' + baseSrc + '?width=' + imageConfig.widthDesktop + '&format=webply&optimize=medium" media="(min-width: 600px)">',
          '<source type="image/webp" srcset="' + baseSrc + '?width=' + imageConfig.widthMobile + '&format=webply&optimize=medium">',
          '<source type="image/png" srcset="' + baseSrc + '?width=' + imageConfig.widthDesktop + '&format=png&optimize=medium" media="(min-width: 600px)">',
          '<img loading="eager" alt="' + imageConfig.alt + '" src="' + baseSrc + '?width=' + imageConfig.widthMobile + '&format=png&optimize=medium" fetchpriority="high">'
        ].join('');
        
        // Substitui o conteúdo do picture
        pictureEl.innerHTML = newPictureHTML;
        
        Utils.log('Imagem do Hero atualizada', 'success');
      });
    },

    /**
     * Dispara evento de tracking
     */
    track: function (utmParams) {
      // DataLayer (GTM)
      if (window.dataLayer) {
        window.dataLayer.push({
          event: CONFIG.tracking.eventName,
          personalization_type: 'source_based',
          personalization_variant: CONFIG.tracking.variant,
          utm_source: utmParams.source,
          utm_campaign: utmParams.campaign,
          hero_title: CONFIG.content.title
        });
      }

      // Adobe Target (at.js)
      if (window.adobe && window.adobe.target) {
        window.adobe.target.trackEvent({
          mbox: 'hero-personalization-view',
          params: {
            variant: CONFIG.tracking.variant,
            source: utmParams.source
          }
        });
      }

      Utils.log('Tracking disparado: ' + CONFIG.tracking.variant, 'info');
    },

    /**
     * Executa a personalização
     */
    apply: function () {
      var utmParams = Utils.getUTMParams();
      var isValid = Utils.isValidUTM(utmParams);

      Utils.log('═══════════════════════════════════════', 'info');
      Utils.log('Personalização: ADS (Cartão de Crédito)', 'success');
      Utils.log('UTM Source: ' + (utmParams.source || 'N/A'), 'info');
      Utils.log('UTM Campaign: ' + (utmParams.campaign || 'N/A'), 'info');

      if (isValid) {
        Utils.log('✓ Personalização Ativada: ADS', 'success');
      } else {
        Utils.log('⚠ Executando sem UTM válido (preview/teste)', 'warn');
      }

      Utils.log('═══════════════════════════════════════', 'info');

      // Aplica as mudanças
      this.injectStyles();
      this.markVariant();
      this.updateTitle();
      this.updateDescription();
      this.updateCTA();
      this.updateHeroImage();
      this.track(utmParams);
    }
  };

  // ============================================
  // INICIALIZAÇÃO
  // ============================================
  var init = function () {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        Personalization.apply();
      });
    } else {
      Personalization.apply();
    }
  };

  // Executa
  init();

  // Expõe para debug (opcional)
  window.PPayHeroADS = {
    config: CONFIG,
    reapply: function () {
      Personalization.apply();
    }
  };

})();
