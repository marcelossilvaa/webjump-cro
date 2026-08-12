(function () {
  'use strict';

  const experienceName = 'AT_EXPERIENCE_HOLIDAYS_ON_HOME_SEARCH';
  const experienceTargetUrl = 'https://www.voeazul.com.br/br/pt/home';
  const experienceAlreadyExecuted = window[experienceName] || false;
  const STYLE_ID = 'at-holidays-search-mobile-style';
  const MONTH_NAMES = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro'
  ];

  let isProcessing = false;
  let debounceTimer = null;
  let bodyObserver = null;
  let calendarWrapperObserver = null;
  let calendarLoadedTracked = false;
  const lastMonthsSeen = [];

  const SELECTORS = {
    datePicker: '[data-date-picker="true"]',
    calendarGrid: '[data-calendar-grid="true"]',
    dayButton: 'button[data-date]'
  };

  const HOLIDAYS = [
    {
      month: 'Janeiro 2026',
      holidays: [{ name: 'Confraternização mundial', day: 1 }]
    },
    {
      month: 'Abril 2026',
      holidays: [
        { name: 'Paixão de Cristo', day: 3 },
        { name: 'Tiradentes', day: 21 }
      ]
    },
    {
      month: 'Maio 2026',
      holidays: [{ name: 'Dia mundial do trabalho', day: 1 }]
    },
    {
      month: 'Junho 2026',
      holidays: [{ name: 'Corpus Christi', day: 4 }]
    },
    {
      month: 'Setembro 2026',
      holidays: [{ name: 'Independência do Brasil', day: 7 }]
    },
    {
      month: 'Outubro 2026',
      holidays: [{ name: 'Nossa Senhora Aparecida', day: 12 }]
    },
    {
      month: 'Novembro 2026',
      holidays: [
        { name: 'Finados', day: 2 },
        { name: 'Proclamação da República', day: 15 },
        { name: 'Dia Nacional de Zumbi e da Consciência Negra', day: 20 }
      ]
    },
    {
      month: 'Dezembro 2026',
      holidays: [{ name: 'Natal', day: 25 }]
    }
  ];

  function onExperienceTargetPage() {
    const currentFullUrl = window.location.origin + window.location.pathname;
    return currentFullUrl === experienceTargetUrl;
  }

  function getMonthNameFromDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    if (isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) return '';
    return MONTH_NAMES[monthIndex] + ' ' + year;
  }

  function getDayFromDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    return String(parseInt(parts[2], 10));
  }

  function getCalendarWrapper() {
    const datePicker = document.querySelector(SELECTORS.datePicker);
    if (!datePicker) return null;

    const grid = datePicker.querySelector(SELECTORS.calendarGrid);
    if (!grid || !grid.parentElement || !grid.parentElement.parentElement) return null;

    return grid.parentElement.parentElement;
  }

  function getMonthElements(calendarWrapper) {
    if (!calendarWrapper) return [];

    return Array.from(calendarWrapper.children).filter(function (el) {
      return el.querySelector(SELECTORS.calendarGrid);
    });
  }

  function getMonthNameOfCalendar(monthElement) {
    if (!monthElement) return '';

    const dayButton = monthElement.querySelector(SELECTORS.dayButton);
    if (dayButton) {
      return getMonthNameFromDate(dayButton.getAttribute('data-date'));
    }

    const datePicker = document.querySelector(SELECTORS.datePicker);
    if (datePicker) {
      const headerSpans = datePicker.querySelectorAll('span');
      for (let i = 0; i < headerSpans.length; i++) {
        const text = (headerSpans[i].textContent || '').trim();
        for (let m = 0; m < MONTH_NAMES.length; m++) {
          if (text.indexOf(MONTH_NAMES[m]) === 0) return text;
        }
      }
    }

    return '';
  }

  function getMonthDaysOfCalendar(monthElement) {
    if (!monthElement) return [];

    const dayElements = monthElement.querySelectorAll(SELECTORS.dayButton);
    return Array.from(dayElements).reduce(function (acc, el) {
      const day = getDayFromDate(el.getAttribute('data-date'));
      if (day) acc.push(day);
      return acc;
    }, []);
  }

  function getMonthsProps(calendarWrapper) {
    return getMonthElements(calendarWrapper).map(function (monthElement) {
      return {
        name: getMonthNameOfCalendar(monthElement),
        days: getMonthDaysOfCalendar(monthElement),
        element: monthElement
      };
    });
  }

  function checkIfIsDateRangeMode(calendarWrapper) {
    if (!calendarWrapper) return false;

    const buttons = calendarWrapper.querySelectorAll(SELECTORS.dayButton);
    for (let i = 0; i < buttons.length; i++) {
      if (buttons[i].querySelectorAll('span').length > 1) return true;
    }

    return false;
  }

  function createHolidayElement(holiday) {
    const holidayElement = document.createElement('div');
    holidayElement.classList.add('inject-holiday-element');
    holidayElement.setAttribute('data-at-holiday', 'true');
    holidayElement.textContent = holiday.name;

    const dayElement = document.createElement('span');
    dayElement.textContent = holiday.day;
    holidayElement.prepend(dayElement);

    return holidayElement;
  }

  function reinitCalendarClassesAndHolidayElement() {
    document.querySelectorAll('.inject-holiday-highlight').forEach(function (day) {
      day.classList.remove('inject-holiday-highlight');
    });

    document.querySelectorAll('.inject-holiday-element').forEach(function (el) {
      el.remove();
    });
  }

  function addTrackingEvent() {
    analyticsEvent('user_clicked_holiday');
  }

  function observeCalendarWrapper(calendarWrapper) {
    if (!calendarWrapper || !calendarWrapperObserver) return;

    calendarWrapperObserver.disconnect();
    calendarWrapperObserver.observe(calendarWrapper, {
      childList: true,
      subtree: true
    });
  }

  function injectCalendarHolidaysIfNeeded() {
    if (isProcessing) return;
    isProcessing = true;

    try {
      const calendarWrapper = getCalendarWrapper();
      if (!calendarWrapper) {
        lastMonthsSeen.length = 0;
        if (calendarWrapperObserver) calendarWrapperObserver.disconnect();
        return;
      }

      const monthsProps = getMonthsProps(calendarWrapper);
      const isDateRangeMode = checkIfIsDateRangeMode(calendarWrapper);
      const currentMonth = monthsProps[0] && monthsProps[0].name;

      if (lastMonthsSeen[0] === currentMonth && !isDateRangeMode) {
        return;
      }

      reinitCalendarClassesAndHolidayElement();

      lastMonthsSeen.length = 0;
      lastMonthsSeen.push(currentMonth);

      monthsProps.forEach(function (calendarMonth) {
        const holidayMonth = HOLIDAYS.find(function (holiday) {
          return holiday.month === calendarMonth.name;
        });
        if (!holidayMonth) return;

        holidayMonth.holidays.forEach(function (holiday) {
          const holidayIsInCalendar = calendarMonth.days.indexOf(String(holiday.day)) !== -1;

          if (holidayIsInCalendar) {
            calendarMonth.element.querySelectorAll(SELECTORS.dayButton).forEach(function (dayButton) {
              const day = getDayFromDate(dayButton.getAttribute('data-date'));
              if (day === String(holiday.day)) {
                dayButton.classList.add('inject-holiday-highlight');
                dayButton.removeEventListener('click', addTrackingEvent);
                dayButton.addEventListener('click', addTrackingEvent);
              }
            });
          }

          if (calendarWrapperObserver) calendarWrapperObserver.disconnect();
          calendarMonth.element.appendChild(createHolidayElement(holiday));
          observeCalendarWrapper(calendarWrapper);
        });
      });
    } finally {
      isProcessing = false;
    }
  }

  function handleCalendarPresence() {
    if (!onExperienceTargetPage()) {
      if (bodyObserver) bodyObserver.disconnect();
      if (calendarWrapperObserver) calendarWrapperObserver.disconnect();
      console.log('[AT] Usuario saiu da pagina alvo, observers desconectados.');
      return;
    }

    const calendarWrapper = getCalendarWrapper();
    if (!calendarWrapper) {
      lastMonthsSeen.length = 0;
      calendarLoadedTracked = false;
      if (calendarWrapperObserver) calendarWrapperObserver.disconnect();
      return;
    }

    if (!calendarLoadedTracked) {
      calendarLoadedTracked = true;
      analyticsEvent('calendar_loaded');
    }

    injectCalendarHolidaysIfNeeded();
    observeCalendarWrapper(calendarWrapper);
  }

  function bodyObserverCallback() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(handleCalendarPresence, 150);
  }

  function calendarWrapperObserverCallback(mutations) {
    for (let i = 0; i < mutations.length; i++) {
      const mutation = mutations[i];
      if (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0) {
        const touchedOwnNodes = Array.from(mutation.addedNodes).some(function (node) {
          return node.nodeType === 1 && (
            node.classList.contains('inject-holiday-element') ||
            node.getAttribute('data-at-holiday') === 'true'
          );
        });
        if (touchedOwnNodes) continue;

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(injectCalendarHolidaysIfNeeded, 150);
        break;
      }
    }
  }

  function getHolidaysCss() {
    return [
      '.inject-holiday-element {',
      '  background: #def2f9;',
      '  margin-top: 4px;',
      '  border-radius: 12px;',
      '  padding: 4px 8px;',
      '  display: flex;',
      '  gap: 8px;',
      '  color: #026cb6;',
      '  align-items: center;',
      '  font-size: 12px;',
      '  font-weight: 500;',
      '}',
      '.inject-holiday-highlight {',
      '  position: relative;',
      '}',
      '.inject-holiday-highlight:not(:hover)::after {',
      '  content: "";',
      '  position: absolute;',
      '  height: 4px;',
      '  width: 4px;',
      '  background: #026cb6;',
      '  border-radius: 100%;',
      '  bottom: 4px;',
      '  left: 50%;',
      '  transform: translateX(-50%);',
      '}',
      '.inject-holiday-element span {',
      '  font-weight: 700;',
      '  display: inline-block;',
      '  width: 17.8px;',
      '  color: #026cb6;',
      '  margin-left: 7.1px;',
      '  text-align: center;',
      '  flex-shrink: 0;',
      '}',
      '.inject-holiday-highlight span {',
      '  font-weight: 700;',
      '  color: #026cb6;',
      '}',
      '.inject-holiday-highlight[disabled] span {',
      '  opacity: .6;',
      '}'
    ].join('\n');
  }

  function injectCSS() {
    if (document.getElementById(STYLE_ID)) return;

    const styles = document.createElement('style');
    styles.id = STYLE_ID;
    styles.textContent = getHolidaysCss();
    document.head.appendChild(styles);
  }

  function experienceSetup() {
    console.log('[AT] Experience started:', experienceName);

    bodyObserver = new MutationObserver(bodyObserverCallback);
    calendarWrapperObserver = new MutationObserver(calendarWrapperObserverCallback);

    injectCSS();
    bodyObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
    handleCalendarPresence();
  }

  function initExperienceWhenReady() {
    const isReady = document.readyState === 'complete' || document.readyState === 'interactive';
    const isMobileDevice = window.innerWidth < 992;

    if (!isMobileDevice) {
      console.log('[AT] Nao e mobile, experiencia nao sera executada.');
      return;
    }

    if (isReady) {
      experienceSetup();
    } else {
      document.addEventListener('DOMContentLoaded', experienceSetup);
    }
  }

  function analyticsEvent(eventLabel) {
    if (!eventLabel) {
      console.log('[AT] Parametros ausentes para evento de analytics.');
      return;
    }

    const labelEvent = experienceName + ' ' + eventLabel;
    console.log('[AT] ANALYTICS_TRIGGERED:', labelEvent);

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

  if (experienceAlreadyExecuted || !onExperienceTargetPage()) {
    console.log('[AT] Pagina incorreta OU script ja executado.');
    return;
  }

  window[experienceName] = true;
  initExperienceWhenReady();
})();
