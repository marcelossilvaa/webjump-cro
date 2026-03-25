(function() {
    const targetMs = Date.UTC(2026, 0, 21, 2, 59, 59);

    const selectors = {
        days: '.modalInjected__countdown__data[type="days"] .modalInjected__countdown__data__number',
        hours: '.modalInjected__countdown__data[type="hours"] .modalInjected__countdown__data__number',
        minutes: '.modalInjected__countdown__data[type="minutes"] .modalInjected__countdown__data__number',
        seconds: '.modalInjected__countdown__data[type="seconds"] .modalInjected__countdown__data__number'
    };

    // Elements will be resolved after DOM is ready
    let elems = { days: null, hours: null, minutes: null, seconds: null };
    let modalEl = null;

    const checkIfDomReady = () => {
        const isReady = document.readyState === "complete" || document.readyState === "interactive";

        if (isReady) {
            initaniversaryCountdown();
        } else {
            document.addEventListener("DOMContentLoaded", initaniversaryCountdown);
        }
    }

    function initaniversaryCountdown() {
        console.log("[AT] - aniversaryCountdown");

        injectModal();
        injectCustomStyles();

        function injectModal() {
            const modal = createCountdownModal();
            document.body.appendChild(modal);

            elems.days = document.querySelector(selectors.days);
            elems.hours = document.querySelector(selectors.hours);
            elems.minutes = document.querySelector(selectors.minutes);
            elems.seconds = document.querySelector(selectors.seconds);
            modalEl = document.querySelector('.modalInjected');

            // If countdown still pending, add .active (CSS controls visibility). Otherwise keep it hidden and zeroed.
            const nowMs = Date.now();
            const diff = targetMs - nowMs;
            if (diff > 0) {
                if (modalEl) modalEl.classList.add('active');
                // start ticking
                tick();
            } else {
                // expired: ensure hidden and zeroed
                render(0);
                if (modalEl) modalEl.classList.remove('active');
            }

            buttonsHandler();
        }

        function createCountdownModal() {
            const container = document.createElement("div");
            container.className = "modalInjected";

            container.innerHTML = `
                <div class="modalInjectedContent">
                    <button class="modalInjected__close" title="Fechar modal">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18" stroke="white" stroke-opacity="0.8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M6 6L18 18" stroke="white" stroke-opacity="0.8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <svg width="198" height="66" viewBox="15.2502 14 167 36" preserveAspectRatio="xMidYMid meet" style="display:block" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g filter="url(#filter0_f_2906_533)">
                        <rect x="15.2502" y="14" width="167" height="36" rx="18" fill="url(#paint0_linear_2906_533)"/>
                        </g>
                        <g filter="url(#filter1_f_2906_533)">
                        <rect x="15.2502" y="14" width="164" height="36" rx="18" fill="url(#paint1_linear_2906_533)"/>
                        <rect x="15.2502" y="14" width="164" height="36" rx="18" fill="url(#paint2_linear_2906_533)"/>
                        <rect x="15.921" y="14.6708" width="162.658" height="34.6583" rx="17.3292" stroke="url(#paint3_linear_2906_533)" stroke-width="1.34168"/>
                        </g>
                        <path d="M66.5921 27.3456H70.8901C72.0101 27.3456 72.8921 27.6256 73.5501 28.1576C74.2081 28.6896 74.5441 29.4876 74.5441 30.5516C74.5441 31.6016 74.2081 32.3996 73.5641 32.9316C72.9061 33.4636 72.0521 33.7296 71.0021 33.7296H68.7621V37.3136H66.5921V27.3456ZM68.7621 29.1376V32.0076H70.7081C71.8421 32.0076 72.4161 31.5316 72.4161 30.5796C72.4161 29.6276 71.8421 29.1376 70.7221 29.1376H68.7621ZM75.72 27.3456L80.676 27.3596C81.656 27.3596 82.468 27.5836 83.098 28.0596C83.714 28.5216 84.036 29.2356 84.036 30.1876C84.036 30.7616 83.896 31.2656 83.616 31.6996C83.336 32.1336 82.944 32.4416 82.454 32.6376C83.308 32.8056 83.798 33.5896 83.924 34.9616C83.924 35.0036 83.924 35.1436 83.952 35.3956C83.966 35.6336 83.98 35.8296 84.008 35.9696C84.022 36.1096 84.05 36.2916 84.078 36.5016C84.106 36.6976 84.148 36.8796 84.204 37.0196C84.26 37.1596 84.316 37.2576 84.4 37.3276H82.132C82.048 37.1736 81.992 36.9776 81.964 36.7536C81.922 36.5296 81.894 36.2356 81.866 35.8716C81.838 35.5076 81.824 35.3116 81.824 35.2696C81.74 34.5696 81.572 34.0936 81.292 33.8136C81.012 33.5476 80.536 33.4076 79.836 33.4076H77.89V37.3136H75.72V27.3456ZM77.89 29.0816V31.8396H79.962C80.564 31.8396 81.04 31.7416 81.376 31.5456C81.712 31.3496 81.894 30.9856 81.894 30.4256C81.894 29.8936 81.726 29.5436 81.39 29.3616C81.054 29.1656 80.62 29.0816 80.06 29.0816H77.89ZM89.9675 27.1076C91.4235 27.1076 92.5995 27.5976 93.4955 28.5636C94.3915 29.5296 94.8535 30.7896 94.8535 32.3436C94.8535 33.9116 94.3915 35.1716 93.4955 36.1236C92.5995 37.0756 91.4095 37.5516 89.9535 37.5516C88.4695 37.5516 87.2795 37.0756 86.3835 36.1236C85.4735 35.1716 85.0255 33.9116 85.0255 32.3436C85.0255 30.7756 85.4735 29.5016 86.3695 28.5496C87.2655 27.5976 88.4695 27.1076 89.9675 27.1076ZM89.9395 28.8996C89.1135 28.8996 88.4555 29.2216 87.9655 29.8376C87.4755 30.4536 87.2235 31.2796 87.2235 32.3156C87.2235 33.3796 87.4755 34.2196 87.9515 34.8356C88.4415 35.4376 89.1135 35.7456 89.9675 35.7596C90.7935 35.7596 91.4515 35.4516 91.9275 34.8356C92.4035 34.2196 92.6415 33.3796 92.6415 32.3156C92.6415 31.2656 92.3895 30.4396 91.9135 29.8236C91.4235 29.2076 90.7655 28.8996 89.9395 28.8996ZM96.16 27.3456L101.116 27.3596C102.096 27.3596 102.908 27.5836 103.538 28.0596C104.154 28.5216 104.476 29.2356 104.476 30.1876C104.476 30.7616 104.336 31.2656 104.056 31.6996C103.776 32.1336 103.384 32.4416 102.894 32.6376C103.748 32.8056 104.238 33.5896 104.364 34.9616C104.364 35.0036 104.364 35.1436 104.392 35.3956C104.406 35.6336 104.42 35.8296 104.448 35.9696C104.462 36.1096 104.49 36.2916 104.518 36.5016C104.546 36.6976 104.588 36.8796 104.644 37.0196C104.7 37.1596 104.756 37.2576 104.84 37.3276H102.572C102.488 37.1736 102.432 36.9776 102.404 36.7536C102.362 36.5296 102.334 36.2356 102.306 35.8716C102.278 35.5076 102.264 35.3116 102.264 35.2696C102.18 34.5696 102.012 34.0936 101.732 33.8136C101.452 33.5476 100.976 33.4076 100.276 33.4076H98.33V37.3136H96.16V27.3456ZM98.33 29.0816V31.8396H100.402C101.004 31.8396 101.48 31.7416 101.816 31.5456C102.152 31.3496 102.334 30.9856 102.334 30.4256C102.334 29.8936 102.166 29.5436 101.83 29.3616C101.494 29.1656 101.06 29.0816 100.5 29.0816H98.33ZM105.984 27.3456L110.94 27.3596C111.92 27.3596 112.732 27.5836 113.362 28.0596C113.978 28.5216 114.3 29.2356 114.3 30.1876C114.3 30.7616 114.16 31.2656 113.88 31.6996C113.6 32.1336 113.208 32.4416 112.718 32.6376C113.572 32.8056 114.062 33.5896 114.188 34.9616C114.188 35.0036 114.188 35.1436 114.216 35.3956C114.23 35.6336 114.244 35.8296 114.272 35.9696C114.286 36.1096 114.314 36.2916 114.342 36.5016C114.37 36.6976 114.412 36.8796 114.468 37.0196C114.524 37.1596 114.58 37.2576 114.664 37.3276H112.396C112.312 37.1736 112.256 36.9776 112.228 36.7536C112.186 36.5296 112.158 36.2356 112.13 35.8716C112.102 35.5076 112.088 35.3116 112.088 35.2696C112.004 34.5696 111.836 34.0936 111.556 33.8136C111.276 33.5476 110.8 33.4076 110.1 33.4076H108.154V37.3136H105.984V27.3456ZM108.154 29.0816V31.8396H110.226C110.828 31.8396 111.304 31.7416 111.64 31.5456C111.976 31.3496 112.158 30.9856 112.158 30.4256C112.158 29.8936 111.99 29.5436 111.654 29.3616C111.318 29.1656 110.884 29.0816 110.324 29.0816H108.154ZM120.231 27.1076C121.687 27.1076 122.863 27.5976 123.759 28.5636C124.655 29.5296 125.117 30.7896 125.117 32.3436C125.117 33.9116 124.655 35.1716 123.759 36.1236C122.863 37.0756 121.673 37.5516 120.217 37.5516C118.733 37.5516 117.543 37.0756 116.647 36.1236C115.737 35.1716 115.289 33.9116 115.289 32.3436C115.289 30.7756 115.737 29.5016 116.633 28.5496C117.529 27.5976 118.733 27.1076 120.231 27.1076ZM120.203 28.8996C119.377 28.8996 118.719 29.2216 118.229 29.8376C117.739 30.4536 117.487 31.2796 117.487 32.3156C117.487 33.3796 117.739 34.2196 118.215 34.8356C118.705 35.4376 119.377 35.7456 120.231 35.7596C121.057 35.7596 121.715 35.4516 122.191 34.8356C122.667 34.2196 122.905 33.3796 122.905 32.3156C122.905 31.2656 122.653 30.4396 122.177 29.8236C121.687 29.2076 121.029 28.8996 120.203 28.8996ZM135.216 31.9236L135.202 37.3136H133.816L133.606 36.1796C132.864 37.1036 131.87 37.5516 130.61 37.5516C129.224 37.5516 128.09 37.0756 127.222 36.1096C126.354 35.1576 125.92 33.9116 125.92 32.3716C125.92 30.8316 126.382 29.5856 127.292 28.6056C128.216 27.6256 129.392 27.1356 130.82 27.1356C131.968 27.1356 132.92 27.4576 133.704 28.1016C134.488 28.7456 134.95 29.5856 135.076 30.6216H132.962C132.864 30.1036 132.626 29.6976 132.234 29.4036C131.856 29.1236 131.38 28.9696 130.806 28.9696C129.966 28.9696 129.322 29.2776 128.846 29.8796C128.37 30.4816 128.132 31.3076 128.132 32.3716C128.132 33.4636 128.37 34.3036 128.846 34.9056C129.322 35.5076 130.008 35.8016 130.876 35.8016C131.548 35.8016 132.108 35.6056 132.556 35.1856C132.99 34.7656 133.228 34.2196 133.256 33.5476H131.03V31.9236H135.216ZM141.191 27.1076C142.647 27.1076 143.823 27.5976 144.719 28.5636C145.615 29.5296 146.077 30.7896 146.077 32.3436C146.077 33.9116 145.615 35.1716 144.719 36.1236C143.823 37.0756 142.633 37.5516 141.177 37.5516C139.693 37.5516 138.503 37.0756 137.607 36.1236C136.697 35.1716 136.249 33.9116 136.249 32.3436C136.249 30.7756 136.697 29.5016 137.593 28.5496C138.489 27.5976 139.693 27.1076 141.191 27.1076ZM141.163 28.8996C140.337 28.8996 139.679 29.2216 139.189 29.8376C138.699 30.4536 138.447 31.2796 138.447 32.3156C138.447 33.3796 138.699 34.2196 139.175 34.8356C139.665 35.4376 140.337 35.7456 141.191 35.7596C142.017 35.7596 142.675 35.4516 143.151 34.8356C143.627 34.2196 143.865 33.3796 143.865 32.3156C143.865 31.2656 143.613 30.4396 143.137 29.8236C142.647 29.2076 141.989 28.8996 141.163 28.8996ZM155.783 27.3456V33.3376C155.783 34.7656 155.433 35.8296 154.747 36.5016C154.061 37.1736 152.997 37.5096 151.541 37.5096C150.057 37.5096 148.979 37.1736 148.279 36.4876C147.579 35.8016 147.243 34.7376 147.243 33.3096V27.3456H149.427V33.3096C149.427 34.1216 149.581 34.7236 149.889 35.1156C150.197 35.5076 150.757 35.7036 151.569 35.7036C152.353 35.7036 152.885 35.5076 153.165 35.1156C153.445 34.7236 153.599 34.1216 153.599 33.3096V27.3456H155.783ZM159.412 27.3456V30.0056L158.866 34.2756H157.872L157.326 30.0336V27.3456H159.412ZM159.454 35.1716V37.3136H157.284V35.1716H159.454Z" fill="white"/>
                        <path d="M44.2502 25.9994V31.1429L46.8219 29.5998M53.5084 31.1429C53.5084 36.2561 49.3634 40.4011 44.2502 40.4011C39.137 40.4011 34.992 36.2561 34.992 31.1429C34.992 26.0297 39.137 21.8847 44.2502 21.8847C49.3634 21.8847 53.5084 26.0297 53.5084 31.1429Z" stroke="white" stroke-width="1.35546" stroke-linecap="round" stroke-linejoin="round"/>
                        <defs>
                        <filter id="filter0_f_2906_533" x="8.58307e-06" y="-1.25017" width="197.5" height="66.5003" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                        <feGaussianBlur stdDeviation="0" result="effect1_foregroundBlur_2906_533"/>
                        </filter>
                        <filter id="filter1_f_2906_533" x="8.58307e-06" y="-1.25017" width="194.5" height="66.5003" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                        <feGaussianBlur stdDeviation="0" result="effect1_foregroundBlur_2906_533"/>
                        </filter>
                        <linearGradient id="paint0_linear_2906_533" x1="211.378" y1="24.7816" x2="153.145" y2="119.071" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#CF527A" stop-opacity="0"/>
                        <stop offset="1" stop-color="#CF527A"/>
                        </linearGradient>
                        <linearGradient id="paint1_linear_2906_533" x1="87.0999" y1="29.024" x2="96.8253" y2="88.0968" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#CF527A" stop-opacity="0"/>
                        <stop offset="1" stop-color="#CF527A"/>
                        </linearGradient>
                        <linearGradient id="paint2_linear_2906_533" x1="162.374" y1="15.2548" x2="156.733" y2="58.6677" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#CF527A" stop-opacity="0"/>
                        <stop offset="1" stop-color="#CF527A" stop-opacity="0.2"/>
                        </linearGradient>
                        <linearGradient id="paint3_linear_2906_533" x1="97.2502" y1="14" x2="97.2502" y2="50" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#0061A0"/>
                        <stop offset="0.509615" stop-color="#006BA8"/>
                        <stop offset="1" stop-color="#0061A0"/>
                        </linearGradient>
                        </defs>
                    </svg>
                    <h2 class="modalInjected__title">Última chance de multiplicar seus pontos</h2>
                    <div class="modalInjected__countdown">
                        <h3 class="modalInjected__countdown__title">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9.99996 18.3333C14.6023 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6023 1.66667 9.99996 1.66667C5.39759 1.66667 1.66663 5.39763 1.66663 10C1.66663 14.6024 5.39759 18.3333 9.99996 18.3333Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M10 5V10L13.3333 11.6667" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>Promoção encerra em:
                        </h3>
                        <div class="modalInjected__countdown__time">
                            <div class="modalInjected__countdown__data" type="days">
                                <span class="modalInjected__countdown__data__number">00</span>
                                <span class="modalInjected__countdown__data__text">DIAS</span>
                            </div>
                            <div class="modalInjected__countdown__data" type="hours">
                                <span class="modalInjected__countdown__data__number">00</span>
                                <span class="modalInjected__countdown__data__text">HORAS</span>
                            </div>
                            <div class="modalInjected__countdown__data" type="minutes">
                                <span class="modalInjected__countdown__data__number">00</span>
                                <span class="modalInjected__countdown__data__text">MIN</span>
                            </div>
                            <div class="modalInjected__countdown__data" type="seconds">
                                <span class="modalInjected__countdown__data__number">00</span>
                                <span class="modalInjected__countdown__data__text">SEG</span>
                            </div>
                        </div>
                    </div>
                    <ul class="modalInjected__benefits">
                        <li>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12Z" fill="#041E42"/>
                                <path d="M14.6667 8.66667H18.6667V12.6667" stroke="white" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M18.6666 8.66667L13 14.3333L9.66665 11L5.33331 15.3333" stroke="white" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg><span>Compre <b>5.000 pontos</b> e receba até <b>20.500 pontos na sua conta Azul!</b></span>
                        </li>
                        <li>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12Z" fill="#041E42"/>
                                <mask id="mask0_2906_497" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="2" y="2" width="20" height="20">
                                <rect x="2" y="2" width="20" height="20" fill="#D9D9D9"/>
                                </mask>
                                <g mask="url(#mask0_2906_497)">
                                <path d="M12 18.6669C13.0416 18.6669 13.9271 18.3023 14.6562 17.5732C15.3854 16.844 15.75 15.9586 15.75 14.9169C15.75 13.8752 15.3854 12.9898 14.6562 12.2607C13.9271 11.5315 13.0416 11.1669 12 11.1669C10.9583 11.1669 10.0729 11.5315 9.34373 12.2607C8.61456 12.9898 8.24998 13.8752 8.24998 14.9169C8.24998 15.9586 8.61456 16.844 9.34373 17.5732C10.0729 18.3023 10.9583 18.6669 12 18.6669ZM9.57852 10.5563C9.85088 10.3928 10.1407 10.262 10.4479 10.1638C10.7551 10.0654 11.0685 9.99704 11.3879 9.95857L9.3879 5.97461H7.30456L9.57852 10.5563ZM7.6779 17.7229C7.5647 17.4752 7.48352 17.2068 7.43435 16.9177C7.38519 16.6287 7.37665 16.3277 7.40873 16.0148C7.28054 15.5575 7.22095 15.0922 7.22998 14.619C7.23901 14.1457 7.31616 13.6809 7.46144 13.2246C7.46144 13.0163 7.49755 12.8186 7.56977 12.6317C7.64185 12.4447 7.74199 12.2765 7.87019 12.1269C7.47922 12.2412 7.15234 12.4487 6.88956 12.7494C6.62665 13.0501 6.47922 13.4013 6.44727 13.8029C6.13741 14.2047 5.98963 14.6655 6.00394 15.1852C6.01838 15.705 6.20505 16.1796 6.56394 16.6092C6.56394 16.9191 6.67213 17.1821 6.88852 17.3984C7.10491 17.6147 7.36804 17.7229 7.6779 17.7229ZM16.3221 17.7229C16.9908 17.6034 17.5488 17.2836 17.996 16.7638C18.4431 16.2441 18.6666 15.6284 18.6666 14.9169C18.6666 14.2054 18.4431 13.5897 17.996 13.07C17.5488 12.5502 16.9908 12.2304 16.3221 12.1109C16.29 12.1109 16.2579 12.1122 16.2258 12.1148C16.1939 12.1175 16.1619 12.1215 16.1298 12.1269C16.4032 12.5243 16.6166 12.9596 16.77 13.4329C16.9233 13.9063 17 14.4009 17 14.9169C17 15.4329 16.9233 15.9275 16.77 16.4009C16.6166 16.8742 16.4032 17.3095 16.1298 17.7069C16.1619 17.7123 16.1939 17.7163 16.2258 17.719C16.2579 17.7216 16.29 17.7229 16.3221 17.7229ZM12 19.9169C11.4551 19.9169 10.9372 19.8357 10.4462 19.6734C9.9554 19.5109 9.5054 19.2827 9.09623 18.989C8.96054 19.0275 8.82081 19.0528 8.67706 19.065C8.53331 19.0774 8.38401 19.0836 8.22915 19.0836C7.08276 19.0836 6.10519 18.6792 5.29644 17.8704C4.48769 17.0617 4.08331 16.0841 4.08331 14.9377C4.08331 13.8255 4.46206 12.8736 5.21956 12.0819C5.97706 11.2902 6.90331 10.8645 7.99831 10.8048C8.05706 10.8048 8.11317 10.8088 8.16665 10.8167C8.22012 10.8247 8.27352 10.8341 8.32685 10.8448L5.81727 5.81273C5.68908 5.56176 5.69817 5.31766 5.84456 5.08044C5.99095 4.84322 6.20783 4.72461 6.49519 4.72461H9.24831C9.53567 4.72461 9.79581 4.79996 10.0287 4.95065C10.2616 5.10134 10.4465 5.30218 10.5833 5.55315L12 8.37857L13.4166 5.55315C13.5535 5.30218 13.7383 5.10134 13.9712 4.95065C14.2041 4.79996 14.4643 4.72461 14.7516 4.72461H17.5048C17.7921 4.72461 18.009 4.84322 18.1554 5.08044C18.3018 5.31766 18.3109 5.56176 18.1827 5.81273L15.7019 10.7952C15.7499 10.7845 15.7994 10.7765 15.8502 10.7711C15.9009 10.7658 15.953 10.7632 16.0064 10.7632C17.1069 10.8315 18.0337 11.2615 18.7869 12.0532C19.54 12.8448 19.9166 13.7994 19.9166 14.9169C19.9166 16.0772 19.5123 17.0617 18.7035 17.8704C17.8948 18.6792 16.9103 19.0836 15.75 19.0836C15.6036 19.0836 15.4578 19.0774 15.3125 19.065C15.1672 19.0528 15.0267 19.0275 14.891 18.989C14.4819 19.2775 14.0339 19.5042 13.5473 19.6692C13.0606 19.8343 12.5448 19.9169 12 19.9169ZM12 15.9377L11.0433 16.6604C10.9653 16.7192 10.8899 16.7213 10.8173 16.6669C10.7446 16.6125 10.7222 16.542 10.75 16.4554L11.1137 15.2646L10.165 14.5836C10.0871 14.5248 10.062 14.4543 10.0898 14.3721C10.1175 14.2897 10.1789 14.2486 10.2739 14.2486H11.4439L11.8156 12.9907C11.8434 12.9041 11.9048 12.8609 12 12.8609C12.0951 12.8609 12.1566 12.9041 12.1844 12.9907L12.556 14.2486H13.726C13.821 14.2486 13.8824 14.2897 13.9102 14.3721C13.938 14.4543 13.9129 14.5248 13.835 14.5836L12.8862 15.2646L13.25 16.4554C13.2778 16.542 13.2553 16.6125 13.1827 16.6669C13.11 16.7213 13.0347 16.7192 12.9566 16.6604L12 15.9377ZM14.4214 10.5563L16.7162 5.97461H14.6121L12.8173 9.54836L13.0608 10.0354C13.3033 10.091 13.5375 10.1594 13.7635 10.2407C13.9895 10.3219 14.2088 10.4271 14.4214 10.5563Z" fill="white"/>
                                </g>
                            </svg><span>Aproveite trechos a partir de <b>4.000 pontos</b>  e voe cada vez mais!</span>
                        </li>
                        <li>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12Z" fill="#041E42"/>
                                <path d="M6.0459 8.95312C6.0459 8.05534 6.24186 7.38997 6.63379 6.95703C7.03027 6.52409 7.56576 6.30762 8.24023 6.30762C8.9375 6.30762 9.4821 6.52409 9.87402 6.95703C10.2705 7.38542 10.4688 8.05078 10.4688 8.95312C10.4688 9.85091 10.2705 10.5163 9.87402 10.9492C9.4821 11.3822 8.94889 11.5986 8.27441 11.5986C7.57715 11.5986 7.03027 11.3844 6.63379 10.9561C6.24186 10.5231 6.0459 9.85547 6.0459 8.95312ZM7.54297 8.93945C7.54297 9.59115 7.61816 10.0286 7.76855 10.252C7.88249 10.416 8.03971 10.498 8.24023 10.498C8.44531 10.498 8.60482 10.416 8.71875 10.252C8.86458 10.0286 8.9375 9.59115 8.9375 8.93945C8.9375 8.28776 8.86458 7.85254 8.71875 7.63379C8.60482 7.46517 8.44531 7.38086 8.24023 7.38086C8.03971 7.38086 7.88249 7.46289 7.76855 7.62695C7.61816 7.85026 7.54297 8.28776 7.54297 8.93945ZM9.70312 16.8828H8.28125L13.6201 6.30762H15.001L9.70312 16.8828ZM12.8066 14.251C12.8066 13.3532 13.0026 12.6878 13.3945 12.2549C13.791 11.8219 14.3311 11.6055 15.0146 11.6055C15.7028 11.6055 16.2428 11.8219 16.6348 12.2549C17.0312 12.6878 17.2295 13.3532 17.2295 14.251C17.2295 15.1533 17.0312 15.821 16.6348 16.2539C16.2428 16.6868 15.7096 16.9033 15.0352 16.9033C14.3379 16.9033 13.791 16.6868 13.3945 16.2539C13.0026 15.821 12.8066 15.1533 12.8066 14.251ZM14.3037 14.2441C14.3037 14.8958 14.3789 15.3311 14.5293 15.5498C14.6432 15.7184 14.8005 15.8027 15.001 15.8027C15.2061 15.8027 15.3633 15.7207 15.4727 15.5566C15.623 15.3333 15.6982 14.8958 15.6982 14.2441C15.6982 13.5924 15.6253 13.1549 15.4795 12.9316C15.3656 12.7676 15.2061 12.6855 15.001 12.6855C14.7959 12.6855 14.6387 12.7676 14.5293 12.9316C14.3789 13.1549 14.3037 13.5924 14.3037 14.2441Z" fill="white"/>
                            </svg><span><b>310% de bônus</b> exclusivo para assinantes <u>Clube Azul</u> - Faça parte e aproveite benefícios exclusivos.</span>
                        </li>
                    </ul>
                    <a class="modalInjected_cta" href="https://compradepontos.voeazul.com.br/Home" target="_blank">APROVEITAR OFERTA AGORA</a>
                    <button class="modalInjected__dismiss">Continuar navegando</button>
                </div>
            `;

            return container;
        }

        function pad(v) { return String(v).padStart(2, '0'); }

        function render(diffMs) {
            if (diffMs <= 0) {
                if (elems.days) elems.days.textContent = '00';
                if (elems.hours) elems.hours.textContent = '00';
                if (elems.minutes) elems.minutes.textContent = '00';
                if (elems.seconds) elems.seconds.textContent = '00';
                if (modalEl && modalEl.classList.contains('active')) modalEl.classList.remove('active');
                return false;
            }

            const totalSec = Math.floor(diffMs / 1000);
            const days = Math.floor(totalSec / 86400);
            const hours = Math.floor((totalSec % 86400) / 3600);
            const minutes = Math.floor((totalSec % 3600) / 60);
            const seconds = totalSec % 60;

            if (elems.days) elems.days.textContent = pad(days);
            if (elems.hours) elems.hours.textContent = pad(hours);
            if (elems.minutes) elems.minutes.textContent = pad(minutes);
            if (elems.seconds) elems.seconds.textContent = pad(seconds);

            return true;
        }

        // Tick aligned to the next second to minimize drift
        function tick() {
            const nowMs = Date.now();
            const diff = targetMs - nowMs;
            const running = render(diff);
            if (!running) return; // stopped

            // schedule next tick on the next full second boundary
            const delay = 1000 - (Date.now() % 1000);
            setTimeout(tick, delay);
        }
        

        function buttonsHandler() {
                    const dismissButton = document.querySelector('.modalInjected__dismiss');
                    if (dismissButton) {
                        dismissButton.addEventListener('click', function () {
                            const el = document.querySelector('.modalInjected');
                            if (el) el.remove();
                        });
                    }

                    const closeButton = document.querySelector('.modalInjected__close');
                    if (closeButton) {
                        closeButton.addEventListener('click', function () {
                            const el = document.querySelector('.modalInjected');
                            if (el) el.remove();
                        });
                    }

                    const ctaButton = document.querySelector('.modalInjected_cta');
                    if (ctaButton) {
                        // keep analytics hook if present
                        try { analyticsEvent && analyticsEvent("click_comprar"); } catch (e) { /* noop */ }
                    }
        }

        function analyticsEvent(eventLabel) {
            if (eventLabel === undefined || !eventLabel) {
                console.log("[AT] Missing parameters for analytics event.");
                return;
            }

            const labelEvent = "AT_aniversary_countdown " + eventLabel;

            console.log("[AT] Analytics event triggered:", labelEvent);

            // === Disparo Adobe Analytics (cópia/cole e ajuste as strings) ===
            (function () {
                var s =
                    window.s || (typeof s_gi === "function" && s_gi("azul-novo-prod"));
                if (!s || typeof s.tl !== "function") return;

                // informe aqui seu evento e as eVars/props que quiser
                s.linkTrackVars = "events,eVar82"; // listar todas as variáveis que serão enviadas
                s.linkTrackEvents = "event90"; // código do event
                s.events = "event90"; // mesmo código do event
                s.eVar82 = labelEvent; // valor da eVar82 (ex: "native" ou "floating")

                // dispara o link (o = custom link, d = download, e = exit)
                s.tl(true, "o", "target_activity_action");
            })();
        }

        function injectCustomStyles() {
            const style = document.createElement("style");
            
            style.innerHTML = `
                .modalInjected {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: none;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                }

                .modalInjected.active {
                    display: flex;
                }

                .modalInjected * {
                    font-family: "Helvetica Neue", Arial, sans-serif;
                    color: #FFFFFF;
                    box-sizing: border-box;
                    line-height: normal;
                }

                .modalInjectedContent {
                    background: linear-gradient(212.67deg, #0061A0 0.38%, #008BC4 98.78%);
                    box-shadow: 0px 25px 50px -12px #00000040;
                    padding: 16px 24px;
                    border-radius: 10px;
                    text-align: left;
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    position: relative;
                    max-width: calc(100% - 20px);
                    width: 520px;
                    margin-left: 10px;
                    margin-right: 10px;
                }

                .modalInjectedContent::before {
                    content: url('data:image/svg+xml,<svg width="87" height="126" viewBox="0 0 87 126" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><rect width="87" height="126" fill="url(%23pattern0_2906_510)"/><defs><pattern id="pattern0_2906_510" patternContentUnits="objectBoundingBox" width="1" height="1"><use xlink:href="%23image0_2906_510" transform="matrix(0.00250134 0 0 0.00172712 0.0222441 0)"/></pattern><image id="image0_2906_510" width="382" height="579" preserveAspectRatio="none" xlink:href="data:image/png;base64,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"/></defs></svg>');
                    position: absolute;
                    top: 0;
                    right: 95px;
                }

                .modalInjected__close {
                    position: absolute;
                    background: transparent;
                    border: none;
                    right: 24px;
                    padding: 0;
                    cursor: pointer;
                }

                .modalInjected__title {
                    font-size: 24px;
                    font-weight: 700;
                    max-width: 300px;
                    margin: 0;
                }

                .modalInjected__countdown {
                    background-color: #0061A0;
                    padding: 16px;
                    display: flex;
                    justify-content: center;
                    flex-direction: column;
                    gap: 12px;
                    border-radius: 10px;
                }

                .modalInjected__countdown__title {
                    display: flex;
                    align-items: center;
                    width: 100%;
                    font-size: 14px;
                    font-weight: 400;
                    margin: 0;
                    text-align: center;
                    gap: 4px;
                    justify-content: center;
                }

                .modalInjected__countdown__time {
                    display: flex;
                    gap: 8px;
                    justify-content: center;
                    align-items: flex-end;
                }

                .modalInjected__countdown__data {
                    padding: 12px 16px;
                    background-color: #041E42;
                    border-radius: 4px;
                    text-align: center;
                    width: 70px;
                    height: 75px;
                }

                .modalInjected__countdown__data__number {
                    margin-top: 0;
                    margin-bottom: 6px;
                    font-size: 24px;
                    font-weight: 700;
                    display: block;
                }

                .modalInjected__countdown__data__text {
                    color: #FFFFFFB2;
                    text-transform: uppercase;
                    font-family: Arial, sans-serif;
                    font-size: 10px;
                    font-weight: 400;
                }

                .modalInjected_cta {
                    background-color: #FFFFFF;
                    box-shadow: 0px 4px 6px -4px #0000001A, 0px 10px 15px -3px #0000001A;
                    border-radius: 24px;
                    padding: 16px;
                    width: 100%;
                    text-transform: uppercase;
                    color: #041E42;
                    font-weight: 700;
                    font-size: 16px;
                    border: none;
                    cursor: pointer;
                    transition: background-color 0.6s cubic-bezier(0.075, 0.82, 0.165, 1);
                    text-align: center;
                    text-decoration: none;
                }

                .modalInjected_cta:hover {
                    background-color: #041E42;
                    color: #FFFFFF;
                }

                .modalInjected__dismiss {
                    border: none;
                    cursor: pointer;
                    display: block;
                    width: fit-content;
                    margin: 0 auto;
                    background-color: transparent;
                    text-align: center;
                    font-size: 14px;
                }

                .modalInjected__benefits {
                    margin: 0;
                    padding: 0;
                    list-style: none;
                    font-size: 14px;
                    font-weight: 400;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .modalInjected__benefits li {
                    font-size: 14px;
                    font-weight: 400;
                }
                .modalInjected__benefits li svg {
                    width: 24px;
                    height: 24px;
                    display: inline-block;
                    vertical-align: middle;
                    margin-right: 8px;
                }

                @media screen and (max-width: 450px) {
                    .modalInjectedContent::before {
                        right: 50px !important;
                    }
                }
            `;
            
            document.head.appendChild(style);
        }
    }

    function onTargetPage() {
        const currentUrl = window.location.pathname;
        const targetTestUrl = "ofertas/facilidades";

        return currentUrl.includes(targetTestUrl);
    }

    if(window.aniversaryCountdown || !onTargetPage()) {
        console.log("[AT] Page is not a correct page OR script already executed.");
        return;
    }

    window.aniversaryCountdown = true;
    checkIfDomReady();
})();