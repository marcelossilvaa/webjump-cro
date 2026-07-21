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
          dailyText: "strong[class*='DailyText-sc-10ygdxz-']",
          dailyContainer: "div[class*='ContainerDaily-sc-10ygdxz-']",
          priceContainer: "div[class*='Price-sc-10ygdxz-13']",
          priceInteger: "b[class*='Integer-sc-10ygdxz-']",
          priceCents: "span[class*='Cents-sc-10ygdxz-']"
      };

      function extractTotalPrice(wrapper) {
          const integerEl = wrapper.querySelector(SELECTORS.priceInteger);
          const centsEl = wrapper.querySelector(SELECTORS.priceCents);
          if (!integerEl || !centsEl) return null;

          const integerText = integerEl.textContent.replace(/\./g, "").trim();
          const centsText = centsEl.textContent.replace(",", "").trim();
          const price = parseFloat(integerText + "." + centsText);

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
      // preservando todo o layout original do card):
      //   1. "3 diárias por"  ->  "Diária"
      //   2. valor total      ->  valor da diaria (mesma tipografia nativa)
      //   3. nova linha unica com o total ("3 diárias: R$ 355,94")
      function transformPriceWrapper(wrapper) {
          if (wrapper.getAttribute(TRANSFORMED_ATTR)) return false;

          const totalPrice = extractTotalPrice(wrapper);
          const days = extractDaysCount(wrapper);
          if (!totalPrice || !days) return false;

          const integerEl = wrapper.querySelector(SELECTORS.priceInteger);
          const centsEl = wrapper.querySelector(SELECTORS.priceCents);
          const dailyTextEl = wrapper.querySelector(SELECTORS.dailyText);
          const priceContainer = wrapper.querySelector(SELECTORS.priceContainer);
          if (!priceContainer) return false;

          // Marca antes de editar: as edicoes abaixo disparam o MutationObserver
          // e o atributo garante que o wrapper nao seja reprocessado.
          wrapper.setAttribute(TRANSFORMED_ATTR, "true");

          const dailyPrice = totalPrice / days;
          const dailyParts = formatCurrencyBRL(dailyPrice).replace("R$ ", "").split(",");

          integerEl.textContent = dailyParts[0];
          centsEl.textContent = "," + dailyParts[1];

          // "3 diárias" -> "Diária"; o "por" ao lado fica vazio.
          dailyTextEl.textContent = "Diária";
          const dailyContainer = wrapper.querySelector(SELECTORS.dailyContainer);
          if (dailyContainer) {
              Array.prototype.forEach.call(dailyContainer.querySelectorAll("span"), function(span) {
                  if (span.textContent.trim() === "por") {
                      span.style.setProperty("display", "none", "important");
                  }
              });
          }

          const totalLine = document.createElement("div");
          totalLine.className = "at-daily-total";
          totalLine.textContent = days + (days === 1 ? " diária: " : " diárias: ") + formatCurrencyBRL(totalPrice);
          priceContainer.insertAdjacentElement("afterend", totalLine);

          return true;
      }

      // ─── Processamento dos cards ──────────────────────────────────────────────
      function processCards() {
          const wrappers = document.querySelectorAll(SELECTORS.priceContentWrapper);
          if (wrappers.length === 0) return;

          let processed = 0;
          wrappers.forEach(function(wrapper) {
              if (transformPriceWrapper(wrapper)) processed++;
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
      // Linha nova do total, bem compacta (o container de preco nativo tem altura
      // limitada e qualquer espacamento extra comprime o botao), mais dois ajustes
      // de compensacao no wrapper transformado: remocao do margin-top nativo do
      // PriceContentWrapper e margem negativa no preco para aproxima-lo do rotulo.

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
              "}",
              "",
              "div[class*='PriceContentWrapper-sc-10ygdxz-'][" + TRANSFORMED_ATTR + "='true'] {",
              "    margin-top: 0;",
              "}",
              "",
              "[" + TRANSFORMED_ATTR + "='true'] div[class*='Price-sc-10ygdxz-13'] {",
              "    margin-top: -9px;",
              "}",
              "",
              "@media (min-width: 1024px) {",
              "    [" + TRANSFORMED_ATTR + "='true'] div[class*='Price-sc-10ygdxz-13'] {",
              "        margin: -4px;",
              "        margin-top: -9px;",
              "    }",
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
