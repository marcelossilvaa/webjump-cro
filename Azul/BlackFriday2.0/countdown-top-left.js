(function () {
  // Timer 1: 12:00 às 18:00
  const TIMER_1_START = '12:00:00';
  const TIMER_1_END = '18:00:00';
  // Timer 2: 18:00 às 21:30
  const TIMER_2_START = '18:00:00';
  const TIMER_2_END = '21:30:00';

  let countdownInterval = null;
  let resizeTimeout = null;
  let targetDivRef = null;
  let targetH1Ref = null;

  function getBrasiliaTime() {
    const now = new Date();
    const brasiliaOffset = -3 * 60;
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const brasiliaTime = new Date(utc + brasiliaOffset * 60000);
    return brasiliaTime;
  }

  function isTargetDate() {
    const now = getBrasiliaTime();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    return year === 2025 && month === 11 && day === 28;
  }

  function createTodayTime(timeString) {
    const now = getBrasiliaTime();
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    const date = new Date(now);
    date.setHours(hours, minutes, seconds, 0);
    return date;
  }

  function getActiveTimerEndDate() {
    const now = getBrasiliaTime();
    const currentTime = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    const timer1Start = parseTimeToSeconds(TIMER_1_START);
    const timer1End = parseTimeToSeconds(TIMER_1_END);
    const timer2Start = parseTimeToSeconds(TIMER_2_START);
    const timer2End = parseTimeToSeconds(TIMER_2_END);

    if (currentTime >= timer2Start && currentTime < timer2End) {
      return createTodayTime(TIMER_2_END);
    } else if (currentTime >= timer1Start && currentTime < timer1End) {
      return createTodayTime(TIMER_1_END);
    }

    if (currentTime < timer1Start) {
      return createTodayTime(TIMER_1_END);
    } else if (currentTime < timer2Start) {
      return createTodayTime(TIMER_2_END);
    } else {
      const now = getBrasiliaTime();
      const expiredDate = new Date(now.getTime() - 3600000);
      return expiredDate;
    }
  }

  function parseTimeToSeconds(timeString) {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  }

  function calculateTimeRemaining() {
    const now = getBrasiliaTime();
    const end = getActiveTimerEndDate();
    const difference = end - now;

    if (difference <= 0) {
      return { hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { hours, minutes, seconds, expired: false };
  }

  function findContainers() {
    const mainContainer = document.querySelector('.css-oo7lgl');
    if (!mainContainer) {
      return null;
    }

    const h1 = mainContainer.querySelector('h1');
    if (h1) {
      const span = h1.querySelector('span.white');
      if (
        span &&
        span.textContent &&
        span.textContent.includes('Corre que o precinho tá voando.')
      ) {
        const parentDiv = h1.parentElement;
        if (parentDiv && parentDiv.classList.contains('css-putdhw')) {
          return {
            mainContainer: mainContainer,
            targetDiv: parentDiv,
          };
        }
        return {
          mainContainer: mainContainer,
          targetDiv: h1.parentElement,
        };
      }
    }
    return null;
  }

  function createCountdown() {
    if (!isTargetDate()) {
      return;
    }

    if (document.getElementById('azul-passagens-countdown-top-left')) {
      return;
    }

    const containers = findContainers();
    if (!containers) {
      setTimeout(createCountdown, 500);
      return;
    }

    const mainContainer = containers.mainContainer;
    const targetDiv = containers.targetDiv;
    targetDivRef = targetDiv;

    const h1 = targetDiv.querySelector('h1');
    if (h1) {
      const span = h1.querySelector('span.white');
      if (
        span &&
        span.textContent &&
        span.textContent.includes('Corre que o precinho tá voando.')
      ) {
        targetH1Ref = h1;
      }
    }

    const countdownWrapper = document.createElement('div');
    countdownWrapper.id = 'azul-passagens-countdown-top-left';
    countdownWrapper.style.cssText =
      'display: flex;' +
      'flex-direction: row;' +
      'align-items: center;' +
      'gap: 8px;' +
      'padding: 16px 20px;' +
      'box-sizing: border-box;' +
      'background: transparent;' +
      'z-index: 10;';

    const timersContainer = document.createElement('div');
    timersContainer.id = 'passagens-countdown-display';
    timersContainer.style.cssText =
      'display: flex;' + 'flex-direction: row;' + 'gap: 8px;' + 'align-items: center;';

    countdownWrapper.appendChild(timersContainer);

    targetDiv.appendChild(countdownWrapper);

    updateCountdown();

    applyResponsiveStyles();
  }

  function updateCountdown() {
    if (!isTargetDate()) {
      const countdownWrapper = document.getElementById('azul-passagens-countdown-top-left');
      if (countdownWrapper) {
        if (countdownInterval) {
          clearInterval(countdownInterval);
          countdownInterval = null;
        }
        countdownWrapper.remove();
      }
      return;
    }

    const countdownWrapper = document.getElementById('azul-passagens-countdown-top-left');
    if (!countdownWrapper) {
      return;
    }

    const timersContainer = document.getElementById('passagens-countdown-display');
    if (!timersContainer) {
      return;
    }

    const time = calculateTimeRemaining();

    if (time.expired) {
      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }
      countdownWrapper.remove();
      return;
    }

    const timeUnits = [
      { value: time.hours, label: 'HORAS' },
      { value: time.minutes, label: 'MINUTOS' },
      { value: time.seconds, label: 'SEGUNDOS' },
    ];

    timersContainer.innerHTML = '';

    const isMobile = window.innerWidth < 768;
    const boxSize = isMobile ? '40px' : '60px';
    const boxPadding = isMobile ? '4px' : '8px';
    const valueFontSize = isMobile ? '18px' : '24px';
    const valueLineHeight = isMobile ? '22px' : '28px';
    const labelFontSize = isMobile ? '11px' : '12px';
    const labelLineHeight = isMobile ? '14px' : '16px';

    timeUnits.forEach(function (unit, index) {
      const unitContainer = document.createElement('div');
      unitContainer.style.cssText =
        'display: flex;' +
        'flex-direction: row;' +
        'align-items: center;' +
        'gap: 8px;' +
        'border: 1px solid white;' +
        'border-radius: 8px;' +
        'flex-shrink: 0;';

      const numberBox = document.createElement('div');
      numberBox.style.cssText =
        'width: ' +
        boxSize +
        ';' +
        'height: ' +
        boxSize +
        ';' +
        'background: #FFFFFF;' +
        'border: 1px solid #FFFFFF;' +
        'padding: ' +
        boxPadding +
        ';' +
        'border-radius: 8px;' +
        'display: flex;' +
        'align-items: center;' +
        'justify-content: center;' +
        'flex-shrink: 0;';

      const value = document.createElement('div');
      value.textContent = String(unit.value).padStart(2, '0');
      value.style.cssText =
        'font-family: "Helvetica Neue", Arial, sans-serif;' +
        'font-weight: 700;' +
        'font-size: ' +
        valueFontSize +
        ';' +
        'line-height: ' +
        valueLineHeight +
        ';' +
        'color: #de5296;' +
        'text-align: center;';

      const label = document.createElement('div');
      label.textContent = unit.label;
      label.style.cssText =
        'font-family: "Helvetica Neue", Arial, sans-serif;' +
        'font-weight: 400;' +
        'font-size: ' +
        labelFontSize +
        ';' +
        'line-height: ' +
        labelLineHeight +
        ';' +
        'color: #FFFFFF;' +
        'margin-right: 8px;' +
        'white-space: nowrap;';

      numberBox.appendChild(value);
      unitContainer.appendChild(numberBox);
      unitContainer.appendChild(label);
      timersContainer.appendChild(unitContainer);
    });
  }

  function applyResponsiveStyles() {
    const countdownWrapper = document.getElementById('azul-passagens-countdown-top-left');
    if (!countdownWrapper) return;

    const windowWidth = window.innerWidth;
    const isMobile = windowWidth < 768;
    const isSmallMobile = windowWidth < 520;
    const isTablet = windowWidth >= 768 && windowWidth <= 1020;

    if (targetDivRef) {
      targetDivRef.style.setProperty('display', 'flex', 'important');
      targetDivRef.style.setProperty('flex-wrap', 'wrap', 'important');
      targetDivRef.style.setProperty('width', '100%', 'important');
      targetDivRef.style.setProperty('justify-content', 'space-between', 'important');
    }

    if (isMobile) {
      const mainContainer = document.querySelector('.css-oo7lgl');
      if (mainContainer) {
        mainContainer.style.removeProperty('padding-top');
      }

      countdownWrapper.style.cssText =
        'display: flex;' +
        'flex-flow: wrap;' +
        'align-items: center;' +
        'gap: 6px;' +
        'padding-top: 10px;' +
        'box-sizing: border-box;' +
        'background: transparent;' +
        'z-index: 10;';

      const timersContainer = document.getElementById('passagens-countdown-display');
      if (timersContainer) {
        timersContainer.style.cssText =
          'display: flex;' + 'flex-flow: wrap;' + 'gap: 6px;' + 'align-items: center;';
      }

      const boxes = timersContainer
        ? timersContainer.querySelectorAll('div[style*="width: 60px"]')
        : [];
      boxes.forEach(function (box) {
        box.style.cssText =
          'width: 50px;' +
          'height: 50px;' +
          'background: #FFFFFF;' +
          'border: 1px solid #FFFFFF;' +
          'padding: 6px;' +
          'border-radius: 6px;' +
          'display: flex;' +
          'align-items: center;' +
          'justify-content: center;' +
          'flex-shrink: 0;';
      });

      const values = timersContainer
        ? timersContainer.querySelectorAll('div[style*="font-size: 24px"]')
        : [];
      values.forEach(function (value) {
        value.style.cssText =
          'font-family: "Helvetica Neue", Arial, sans-serif;' +
          'font-weight: 700;' +
          'font-size: 18px;' +
          'line-height: 22px;' +
          'color: #de5296;' +
          'text-align: center;';
      });

      const labels = timersContainer
        ? timersContainer.querySelectorAll('div[style*="font-size: 12px"]')
        : [];
      labels.forEach(function (label) {
        if (
          label.textContent === 'HORAS' ||
          label.textContent === 'MINUTOS' ||
          label.textContent === 'SEGUNDOS'
        ) {
          label.style.cssText =
            'font-family: "Helvetica Neue", Arial, sans-serif;' +
            'font-weight: 400;' +
            'font-size: 11px;' +
            'line-height: 14px;' +
            'color: #FFFFFF;' +
            'margin-right: 8px;' +
            'white-space: nowrap;';
        }
      });
    } else {
      const mainContainer = document.querySelector('.css-oo7lgl');
      if (mainContainer) {
        mainContainer.style.removeProperty('padding-top');
      }

      if (targetH1Ref) {
        targetH1Ref.style.removeProperty('padding-bottom');
      }

      countdownWrapper.style.cssText =
        'display: flex;' +
        'flex-direction: row;' +
        'align-items: center;' +
        'gap: 8px;' +
        'box-sizing: border-box;' +
        'background: transparent;' +
        'z-index: 10;';
    }

    injectGridStyles();
  }

  function injectGridStyles() {
    const mainContainer = document.querySelector('.css-oo7lgl');
    if (!mainContainer) {
      return;
    }

    const h1 = mainContainer.querySelector('h1');
    if (!h1) {
      return;
    }

    const span = h1.querySelector('span.white');
    if (
      !span ||
      !span.textContent ||
      !span.textContent.includes('Corre que o precinho tá voando.')
    ) {
      return;
    }

    const cssSp5706 = h1.closest('.css-sp5706');
    if (!cssSp5706) {
      return;
    }

    const windowWidth = window.innerWidth;
    if (windowWidth >= 768) {
      cssSp5706.style.setProperty('display', 'block', 'important');
      cssSp5706.style.setProperty('grid-template-columns', 'none', 'important');
    }
  }

  function init() {
    if (!isTargetDate()) {
      return;
    }

    injectGridStyles();
    createCountdown();

    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
    countdownInterval = setInterval(function () {
      if (!isTargetDate()) {
        const countdownWrapper = document.getElementById('azul-passagens-countdown-top-left');
        if (countdownWrapper) {
          countdownWrapper.remove();
        }
        if (countdownInterval) {
          clearInterval(countdownInterval);
          countdownInterval = null;
        }
        return;
      }

      updateCountdown();
      const now = getBrasiliaTime();
      const currentTime = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
      const timer1End = parseTimeToSeconds(TIMER_1_END);
      const timer2End = parseTimeToSeconds(TIMER_2_END);

      if (currentTime === timer1End || currentTime === timer2End) {
        updateCountdown();
      }
    }, 1000);

    window.addEventListener('resize', function () {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      resizeTimeout = setTimeout(function () {
        injectGridStyles();
        applyResponsiveStyles();
      }, 100);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
