(function() {
  const experienceName = "AT_EXPERIENCE_CARS_DAILYPRICES";
  const experienceTargetUrl = "br/pt/home/cars";
  const experienceAlreadyExecuted = window[experienceName] || false;

  const onExperienceTargetPage = function() {
      return window.location.pathname.indexOf(experienceTargetUrl) !== -1;
  };

  const initExperienceWhenReady = function() {
      const isReady = document.readyState === "complete" || document.readyState === "interactive";

      if (isReady) {
          experienceSetup();
      } else {
          document.addEventListener("DOMContentLoaded", experienceSetup);
      }
  };

  if (experienceAlreadyExecuted || !onExperienceTargetPage()) {
      console.log("[AT] Page is not a correct page OR script already executed.");
      return;
  }

  window[experienceName] = true;

  initExperienceWhenReady();

  function experienceSetup() {
      console.log("[AT] Experience started:", experienceName);

      const BODY_IDENTIFIER_CLASS = "at-cars-dailyprices";
      const TRANSFORMED_ATTR = "data-at-card-transformed";

      const SELECTORS = {
          priceContentWrapper: "div[class*='PriceContentWrapper-sc-10ygdxz-'], div[class*='PriceWrapperMobile-sc-10ygdxz-']",
          // Desktop: strong com classe DailyText; mobile: strong sem classe dentro do PriceLabel
          dailyText: "strong[class*='DailyText-sc-10ygdxz-'], div[class*='PriceLabel-sc-10ygdxz-'] strong",
          dailyContainer: "div[class*='ContainerDaily-sc-10ygdxz-']",
          priceContainer: "div[class*='Price-sc-10ygdxz-13']",
          mobileCard: "div[class*='Container-sc-1w145hf-0']",
          mobilePriceLabel: "div[class*='PriceLabel-sc-10ygdxz-']",
          mobileCancelBadge: "div[class*='CancelLabelContainer-sc-1w145hf-']"
      };

      // Le o total a partir do texto completo do container de preco, ja que a
      // estrutura interna difere: desktop usa b/span com classes Integer/Cents,
      // mobile usa b e spans sem classe (com a virgula num span separado).
      function extractTotalPrice(priceContainer) {
          const text = priceContainer.textContent.replace(/\s/g, "");
          const match = text.match(/R\$([\d.]+),(\d{2})/);
          if (!match) return null;

          const price = parseFloat(match[1].replace(/\./g, "") + "." + match[2]);

          return isNaN(price) ? null : price;
      }

      function extractDaysCount(wrapper) {
          const dailyTextEl = wrapper.querySelector(SELECTORS.dailyText);
          if (!dailyTextEl) return null;

          const match = dailyTextEl.textContent.match(/(\d+)/);
          return match ? parseInt(match[1], 10) : null;
      }

      function formatCurrencyBRL(value) {
          const truncated = Math.floor(value * 100) / 100;
          const fixed = truncated.toFixed(2);
          const parts = fixed.split(".");
          const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");

          return "R$ " + integerPart + "," + parts[1];
      }

      // Edicao in-place do bloco de preco nativo (sem clonar/ocultar containers,
      // preservando todo o layout original do card). Formato de referencia:
      //   R$ 101,52 /dia
      //   R$ 304,57 /Total
      //   em até 10x sem juros (desktop) / ou 10x de R$ 30,46 (mobile)
      //   1. valor total -> valor da diaria (mesma tipografia nativa) + sufixo "/dia"
      //   2. rotulo "3 diárias por" oculto (redundante com o sufixo "/dia")
      //   3. nova linha com total + parcelamento; o span nativo de parcelamento
      //      e ocultado para nao duplicar a informacao
      function transformPriceWrapper(wrapper) {
          if (wrapper.getAttribute(TRANSFORMED_ATTR)) return false;

          const priceContainer = wrapper.querySelector(SELECTORS.priceContainer);
          if (!priceContainer) return false;

          const totalPrice = extractTotalPrice(priceContainer);
          const days = extractDaysCount(wrapper);
          if (!totalPrice || !days) return false;

          const integerEl = priceContainer.querySelector("b");
          if (!integerEl) return false;

          // Marca antes de editar: as edicoes abaixo disparam o MutationObserver
          // e o atributo garante que o wrapper nao seja reprocessado.
          wrapper.setAttribute(TRANSFORMED_ATTR, "true");

          const dailyPrice = totalPrice / days;
          const dailyParts = formatCurrencyBRL(dailyPrice).replace("R$ ", "").split(",");

          // Desktop: um unico span de centavos apos o b (",52").
          // Mobile: dois spans separados ("," e "57").
          integerEl.textContent = dailyParts[0];

          const centsSpans = [];
          let sibling = integerEl.nextElementSibling;
          while (sibling) {
              if (sibling.tagName === "SPAN") centsSpans.push(sibling);
              sibling = sibling.nextElementSibling;
          }

          if (centsSpans.length === 1) {
              centsSpans[0].textContent = "," + dailyParts[1];
          } else if (centsSpans.length >= 2) {
              centsSpans[0].textContent = ",";
              centsSpans[1].textContent = dailyParts[1];
          }

          const daySuffix = document.createElement("span");
          daySuffix.className = "at-daily-suffix";
          daySuffix.textContent = "/dia";
          priceContainer.appendChild(daySuffix);

          // Desktop: oculta o ContainerDaily inteiro ("3 diárias" + "por").
          // Mobile: nao existe ContainerDaily; oculta o span pai do strong
          // ("3 diárias por:"), preservando o "impostos já inclusos" ao lado.
          const dailyContainer = wrapper.querySelector(SELECTORS.dailyContainer);
          if (dailyContainer) {
              dailyContainer.style.setProperty("display", "none", "important");
          } else {
              const dailyTextEl = wrapper.querySelector(SELECTORS.dailyText);
              if (dailyTextEl && dailyTextEl.parentElement) {
                  dailyTextEl.parentElement.style.setProperty("display", "none", "important");
              }

              // Mobile: move o selo "Cancelamento grátis" nativo do card para
              // baixo do "impostos já inclusos", preenchendo o espaco vazio
              // deixado pelo rotulo ocultado acima.
              const card = wrapper.closest(SELECTORS.mobileCard);
              const priceLabel = wrapper.querySelector(SELECTORS.mobilePriceLabel);
              const cancelBadge = card ? card.querySelector(SELECTORS.mobileCancelBadge) : null;
              if (priceLabel && cancelBadge) {
                  cancelBadge.classList.add("at-cancel-moved");
                  priceLabel.appendChild(cancelBadge);
              }
          }

          // Texto de parcelamento nativo migra para a linha do total; o span
          // original e ocultado. Desktop: "em até 10x sem juros"; mobile:
          // "ou 10x de R$ 30,46" (por isso a deteccao por "\d+x").
          let installmentsText = "";
          Array.prototype.forEach.call(wrapper.querySelectorAll("span"), function(span) {
              if (/\d+x/.test(span.textContent)) {
                  installmentsText = span.textContent.replace(/\u00a0/g, " ").trim();
                  span.style.setProperty("display", "none", "important");
              }
          });

          const totalLine = document.createElement("div");
          totalLine.className = "at-daily-total";
          totalLine.textContent = formatCurrencyBRL(totalPrice) + " /Total";

          if (installmentsText) {
              const installmentsLine = document.createElement("div");
              installmentsLine.className = "at-daily-installments";
              installmentsLine.textContent = installmentsText;
              totalLine.appendChild(installmentsLine);
          }

          priceContainer.insertAdjacentElement("afterend", totalLine);

          return true;
      }

      // ─── Processamento dos cards ──────────────────────────────────────────────
      function processCards() {
          const wrappers = document.querySelectorAll(SELECTORS.priceContentWrapper);
          if (wrappers.length === 0) return;

          let processed = 0;
          wrappers.forEach(function(wrapper) {
              // Um card com estrutura inesperada nao deve derrubar o loop inteiro.
              try {
                  if (transformPriceWrapper(wrapper)) processed++;
              } catch (error) {
                  console.log("[AT] Failed to transform price wrapper:", error);
              }
          });

          if (processed > 0) {
              console.log("[AT] Transformed " + processed + " price blocks to daily price.");

              if (!window.__atCarsDailyPricesAnalyticsFired) {
                  window.__atCarsDailyPricesAnalyticsFired = true;
                  analyticsEvent("cards_transformed");
              }
          }
      }

      // ─── Reatividade (MutationObserver) ───────────────────────────────────────
      // Os cards sao (re)renderizados apos busca/filtros/paginacao, entao reprocessamos
      // a cada mutacao relevante do DOM. TRANSFORMED_ATTR evita reprocessar o mesmo bloco.

      function setupReactivity() {
          let scheduled = false;

          const schedule = function() {
              if (scheduled) return;
              scheduled = true;
              requestAnimationFrame(function() {
                  scheduled = false;
                  processCards();
              });
          };

          const observer = new MutationObserver(schedule);
          observer.observe(document.body, {
              childList: true,
              subtree: true
          });
      }

      // ─── CSS ───────────────────────────────────────────────────────────────────
      // Linha nova do total e sufixo "/dia", bem compactos (o container de preco
      // nativo tem altura limitada e qualquer espacamento extra comprime o botao).

      function injectCustomCSS() {
          if (document.querySelector("style[data-at-cars-dailyprices]")) return;

          const style = document.createElement("style");
          style.setAttribute("data-at-cars-dailyprices", "true");

          style.textContent = [
              ".at-daily-total {",
              "    color: #606060;",
              "    font-family: 'Helvetica Neue', Arial, sans-serif;",
              "    font-size: 12px;",
              "    font-weight: 400;",
              "    line-height: 14px;",
              "    text-align: center;",
              "}",
              "",
              ".at-daily-suffix {",
              "    color: #606060;",
              "    font-family: 'Helvetica Neue', Arial, sans-serif;",
              "    font-size: 14px;",
              "    font-weight: 400;",
              "    align-self: baseline;",
              "}",
              "",
              "div[class*='PriceContentWrapper-sc-10ygdxz-'][" + TRANSFORMED_ATTR + "='true'] {",
              "    margin-top: 8px;",
              "}",
              "",
              ".at-cancel-moved {",
              "    margin-top: 8px;",
              "}"
          ].join("\n");

          document.head.appendChild(style);
      }

      /**
       * Function to trigger an Adobe Analytics event.
       * Uses to track user interactions within the experience.
       * @param {string} eventLabel - Label of the event to be triggered.
       *
       * Example usage:
       * analyticsEvent("user_clicked_button");
       */
      function analyticsEvent(eventLabel) {
          if (!eventLabel) return;

          const labelEvent = experienceName + " " + eventLabel;
          console.log("[AT] ANALYTICS_TRIGGERED:", labelEvent);

          (function() {
              const s = window.s || (typeof s_gi === "function" && s_gi("azul-novo-prod"));
              if (!s || typeof s.tl !== "function") return;

              s.linkTrackVars = "events,eVar82";
              s.linkTrackEvents = "event90";
              s.events = "event90";
              s.eVar82 = labelEvent;

              s.tl(true, "o", "target_activity_action");
          })();
      }

      injectCustomCSS();
      document.body.classList.add(BODY_IDENTIFIER_CLASS);
      setupReactivity();
      processCards();
  }
})();
