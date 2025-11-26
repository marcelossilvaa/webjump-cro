(function() {
    'use strict';

    // Configuração do countdown
    const CONFIG = {
        // Data final do countdown (ajuste conforme necessário)
        endDate: new Date('2024-12-02T23:59:59'),
        
        // Seletores
        containerSelector: '.container-capsule.containerDefault.css-oo7lgl',
        countdownId: 'azul-friday-countdown',
        
        // Textos
        labels: {
            days: 'Dias',
            hours: 'Horas',
            minutes: 'Min',
            seconds: 'Seg'
        }
    };

    // HTML do countdown
    const countdownHTML = `
        <div id="${CONFIG.countdownId}" style="width: 100%; border: 0px; margin: 0px auto 20px !important; padding: 20px 24px; border-radius: 16px; background: linear-gradient(0deg, rgb(216, 249, 255) -63%, rgb(107, 209, 227) -19.01%, rgb(86, 195, 229) 24.97%, rgb(0, 139, 196) 68.96%, rgb(0, 97, 160) 112.95%); display: flex; align-items: center; justify-content: space-between !important; box-shadow: rgba(0, 0, 0, 0.3) 0px 4px 8px; flex-direction: row !important; gap: 0px !important;">
            <div style="display: flex; align-items: center; gap: 20px;">
                <div style="display: flex; align-items: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="114" height="66" viewBox="0 0 114 66" fill="none" style="height: 66px; width: auto;">
                        <path d="M101.139 11.1875H91.3855V27.1391C91.3855 32.4173 88.1709 33.7959 86.0496 33.7959C82.9517 33.7959 81.23 32.4174 81.23 28.457V11.1875H71.4785V29.0901C71.4785 36.8919 73.9433 41.8266 82.4938 41.8266C85.9351 41.8266 89.7221 39.9318 91.5561 36.8919H91.6751V40.9668H101.139V11.1897V11.1875Z" fill="#00043E"></path>
                        <path d="M103.434 40.9667H113.186V0H103.434V40.9667ZM42.1643 40.9667H70.5028V33.5107H54.5579L69.4163 18.5896V11.1897H43.372V18.6502H57.0249L42.1665 33.3962V40.9689L42.1643 40.9667ZM0 40.9667H10.9569L13.5407 33.6229H27.8244L30.3476 40.9667H41.4751L26.1588 0.00224046H15.3163L0 40.9667ZM20.6523 11.3603H20.769L25.299 25.7044H16.0055L20.6523 11.3603Z" fill="#00043E"></path>
                        <path d="M0.170898 47.1312H16.9194V50.7009H5.26437V54.796H16.1854V58.3657H5.26437V65.8757H0.170898V47.1289V47.1312Z" fill="white"></path>
                        <path d="M19.6523 47.1309H33.2761C38.4728 47.1309 39.3393 50.3077 39.3393 52.225C39.3393 54.5083 38.4212 55.9789 36.2931 56.74V56.7916C38.5245 57.1329 38.8657 59.9685 38.8657 61.8072C38.8657 62.7255 38.9442 64.9324 39.8377 65.8776H34.2728C33.7991 65.011 33.7744 64.2499 33.7744 62.2809C33.7744 59.6564 32.6453 58.9986 31.0717 58.9986H24.7458V65.8776H19.6523V47.1309ZM24.7458 55.4266H31.4915C32.6206 55.4266 33.9338 54.7957 33.9338 53.0378C33.9338 51.1743 32.4635 50.7006 31.2288 50.7006H24.7458V55.4266Z" fill="white"></path>
                        <path d="M42.543 47.1309H47.6371V65.8776H42.543V47.1309Z" fill="white"></path>
                        <path d="M51.7329 47.1309H63.4149C69.8463 47.1309 72.6298 50.86 72.6298 56.5042C72.6298 62.1485 69.743 65.8776 63.8616 65.8776H51.7329V47.1309ZM56.8264 62.3056H62.4968C65.8573 62.3056 67.3792 60.285 67.3792 56.3201C67.3792 52.8537 65.9089 50.7006 62.0231 50.7006H56.8241V62.3056H56.8264Z" fill="white"></path>
                        <path d="M88.4861 62.0182H79.875L78.353 65.8776H72.8667L81.1096 47.1309H87.2514L95.4944 65.8776H90.0081L88.4861 62.0182ZM84.1805 51.1743L81.2399 58.6034H87.1212L84.1805 51.1743Z" fill="white"></path>
                        <path d="M99.7753 59.3398L91.4785 47.1309H97.4632L102.319 55.2964L107.174 47.1309H113.159L104.862 59.3398V65.8776H99.7686V59.3398H99.7753Z" fill="white"></path>
                    </svg>
                </div>
            </div>
            <div data-countdown-text-container="true" style="display: flex; align-items: center; gap: 12px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none" style="min-width: 44px !important;">
                    <path d="M22 11V22L29.3333 25.6667" stroke="white" stroke-width="2.66667" stroke-linecap="round" stroke-linejoin="round"></path>
                    <path d="M22.0003 40.3333C32.1255 40.3333 40.3337 32.1252 40.3337 22C40.3337 11.8747 32.1255 3.66663 22.0003 3.66663C11.8751 3.66663 3.66699 11.8747 3.66699 22C3.66699 32.1252 11.8751 40.3333 22.0003 40.3333Z" stroke="white" stroke-width="2.66667" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
                <span style="color: white; font-size: 24px; font-weight: 700; font-family: sans-serif;">Ofertas por tempo limitado!</span>
            </div>
            <div id="countdown-display" style="display: flex; gap: 12px;">
                <!-- Dias -->
                <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                    <div style="width: 70px; height: 60px; padding: 12px 16px; border-radius: 14px; background: rgba(0, 122, 174, 0.25); box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px; display: flex; align-items: center; justify-content: center;">
                        <div id="countdown-days" style="color: white; font-size: 30px; font-weight: 700; font-family: sans-serif; line-height: 1;">00</div>
                    </div>
                    <div style="color: white; font-size: 14px; font-weight: 500; font-family: sans-serif; text-align: center;">${CONFIG.labels.days}</div>
                </div>
                <!-- Horas -->
                <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                    <div style="width: 70px; height: 60px; padding: 12px 16px; border-radius: 14px; background: rgba(0, 122, 174, 0.25); box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px; display: flex; align-items: center; justify-content: center;">
                        <div id="countdown-hours" style="color: white; font-size: 30px; font-weight: 700; font-family: sans-serif; line-height: 1;">00</div>
                    </div>
                    <div style="color: white; font-size: 14px; font-weight: 500; font-family: sans-serif; text-align: center;">${CONFIG.labels.hours}</div>
                </div>
                <!-- Minutos -->
                <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                    <div style="width: 70px; height: 60px; padding: 12px 16px; border-radius: 14px; background: rgba(0, 122, 174, 0.25); box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px; display: flex; align-items: center; justify-content: center;">
                        <div id="countdown-minutes" style="color: white; font-size: 30px; font-weight: 700; font-family: sans-serif; line-height: 1;">00</div>
                    </div>
                    <div style="color: white; font-size: 14px; font-weight: 500; font-family: sans-serif; text-align: center;">${CONFIG.labels.minutes}</div>
                </div>
                <!-- Segundos -->
                <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                    <div style="width: 70px; height: 60px; padding: 12px 16px; border-radius: 14px; background: rgba(0, 122, 174, 0.25); box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px; display: flex; align-items: center; justify-content: center;">
                        <div id="countdown-seconds" style="color: white; font-size: 30px; font-weight: 700; font-family: sans-serif; line-height: 1;">00</div>
                    </div>
                    <div style="color: white; font-size: 14px; font-weight: 500; font-family: sans-serif; text-align: center;">${CONFIG.labels.seconds}</div>
                </div>
            </div>
        </div>
    `;

    // Função para formatar números com zero à esquerda
    function padZero(num) {
        return num < 10 ? '0' + num : num;
    }

    // Função para calcular o tempo restante
    function calculateTimeRemaining() {
        const now = new Date().getTime();
        const distance = CONFIG.endDate.getTime() - now;

        if (distance < 0) {
            return {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
                expired: true
            };
        }

        return {
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000),
            expired: false
        };
    }

    // Função para atualizar o countdown
    function updateCountdown() {
        const time = calculateTimeRemaining();
        
        const daysEl = document.getElementById('countdown-days');
        const hoursEl = document.getElementById('countdown-hours');
        const minutesEl = document.getElementById('countdown-minutes');
        const secondsEl = document.getElementById('countdown-seconds');

        if (daysEl) daysEl.textContent = padZero(time.days);
        if (hoursEl) hoursEl.textContent = padZero(time.hours);
        if (minutesEl) minutesEl.textContent = padZero(time.minutes);
        if (secondsEl) secondsEl.textContent = padZero(time.seconds);

        // Se expirou, para o countdown
        if (time.expired) {
            clearInterval(window.azulCountdownInterval);
            const countdownEl = document.getElementById(CONFIG.countdownId);
            if (countdownEl) {
                countdownEl.style.display = 'none';
            }
        }
    }

    // Função para inserir o countdown
    function insertCountdown() {
        // Verifica se o countdown já existe
        if (document.getElementById(CONFIG.countdownId)) {
            console.log('Countdown já existe');
            return;
        }

        // Encontra o container
        const container = document.querySelector(CONFIG.containerSelector);
        
        if (!container) {
            console.error('Container não encontrado:', CONFIG.containerSelector);
            return;
        }

        // Insere o countdown após o container
        container.insertAdjacentHTML('afterend', countdownHTML);
        
        // Inicia a atualização
        updateCountdown();
        
        // Atualiza a cada segundo
        if (window.azulCountdownInterval) {
            clearInterval(window.azulCountdownInterval);
        }
        window.azulCountdownInterval = setInterval(updateCountdown, 1000);
        
        console.log('Countdown inserido e iniciado com sucesso');
    }

    // Função para inicializar
    function init() {
        // Se o DOM já estiver pronto, insere imediatamente
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', insertCountdown);
        } else {
            insertCountdown();
        }

        // Também tenta inserir após um pequeno delay (caso o container seja carregado dinamicamente)
        setTimeout(insertCountdown, 1000);
        setTimeout(insertCountdown, 2000);
    }

    // Inicia o script
    init();
})();
