    (function() {
        const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
        const eventTrigger = isTouchDevice ? new TouchEvent('touchstart', {
            bubbles: true
        }) : new MouseEvent('click', {
            bubbles: true
        });

        const CURRENT_PRODUCT_ELEMENT = ".sc-dNezTh.jYCQIG";
        const CTA_PRODUCTS_SELECTOR_TRIGGER_CLICK = "footer > button";
        const CTA_PRODUCTS_SELECTOR_DESCRIPTION = ".sc-fVLGaz .cLEazU.richTextContainer";

        const BAGAGEM_ICON = `
        <svg class="injectShowcaseSecondaryProductsWrapper__item__header__icon" width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.9733 5.35362C10.8402 5.35362 10.7322 5.46162 10.7322 5.59469V6.47862H9.92865V5.59469C9.92865 5.01869 10.3973 4.55005 10.9733 4.55005H14.0269C14.6029 4.55005 15.0715 5.01869 15.0715 5.59469V6.47862H14.2679V5.59469C14.2679 5.46162 14.1599 5.35362 14.0269 5.35362H10.9733Z" fill="#169BD6"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M20.0221 7.12177C20.8372 7.12177 21.5 7.78519 21.5 8.60162V17.2127C21.5 18.0291 20.8372 18.6932 20.0221 18.6932H4.97729C4.16214 18.6932 3.5 18.0291 3.5 17.2127V8.60162C3.5 7.78519 4.16214 7.12177 4.97729 7.12177H20.0221ZM18.0447 17.8896H17.2411V7.92531H18.0447V17.8896ZM7.75897 17.8896H6.9554V7.92531H7.75897V17.8896Z" fill="#169BD6"/>
            <path d="M7.1161 20.3003C7.02738 20.3003 6.95538 20.2283 6.95538 20.1396V19.4967C6.95538 19.408 7.02738 19.336 7.1161 19.336H7.59824C7.68695 19.336 7.75895 19.408 7.75895 19.4967V20.1396C7.75895 20.2283 7.68695 20.3003 7.59824 20.3003H7.1161Z" fill="#169BD6"/>
            <path d="M17.2411 20.1396C17.2411 20.2283 17.3132 20.3003 17.4019 20.3003H17.884C17.9727 20.3003 18.0447 20.2283 18.0447 20.1396V19.4967C18.0447 19.408 17.9727 19.336 17.884 19.336H17.4019C17.3132 19.336 17.2411 19.408 17.2411 19.4967V20.1396Z" fill="#169BD6"/>
        </svg>
    `;

        const ASSENTO_ICON = `
        <svg class="injectShowcaseSecondaryProductsWrapper__item__header__icon" width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M4.49978 16.3498H3C3 18.8351 4.49978 21.6 12 21.6C19.4996 21.6 21 18.8351 21 16.3498H19.4996C19.4996 17.6509 15.8828 18.5998 12 18.5998C8.1165 18.5998 4.49978 17.6529 4.49978 16.3498ZM5.99945 6.59967V15.5997C5.99945 16.4277 8.27131 17.1001 11.9999 17.1001C15.7278 17.1001 17.9997 16.4277 17.9997 15.5997V6.59967C17.9997 5.7736 18.6721 5.09988 19.4994 5.09988H20.2497C20.2497 4.27124 19.5785 3.6001 18.7499 3.6001H5.24988C4.4206 3.6001 3.74945 4.27124 3.74945 5.09988H4.49967C5.32702 5.09988 5.99945 5.77231 5.99945 6.59967ZM3 14.8495H4.49978V6.59971H3V14.8495ZM19.5002 14.8499H21V6.60011H19.5002V14.8499Z" fill="#169BD6"/>
        </svg>
    `;

        const PET_ICON = `
        <svg class="injectShowcaseSecondaryProductsWrapper__item__header__icon" width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.2274 14.0876C15.053 12.6243 13.5686 11.8184 12.0475 11.8184C10.5264 11.8184 9.04197 12.6243 7.86765 14.0876C6.81207 15.403 6.18188 17.0607 6.18188 18.522C6.18188 19.2318 6.39216 19.7725 6.80685 20.1291C7.21616 20.4811 7.75654 20.6002 8.35942 20.6001C9.00092 20.6001 9.71323 20.4653 10.4131 20.3328C11.0247 20.217 11.6023 20.1077 12.0476 20.1077C12.4318 20.1077 12.9737 20.2114 13.5472 20.3213C14.8876 20.5782 16.4068 20.8692 17.2844 20.1161C17.7017 19.7581 17.9132 19.2218 17.9132 18.522C17.9132 17.0607 17.283 15.403 16.2274 14.0876Z" fill="#168CC4"/>
            <path d="M15.9934 5.51648C15.6117 4.9342 15.0652 4.60028 14.4938 4.60028C13.9225 4.60028 13.3759 4.93423 12.9942 5.51648C12.6436 6.05139 12.4505 6.75383 12.4505 7.49445C12.4505 8.23506 12.6436 8.9375 12.9942 9.47241C13.3759 10.0547 13.9225 10.3886 14.4938 10.3886C15.0652 10.3886 15.6117 10.0547 15.9934 9.47241C16.3441 8.9375 16.5372 8.23506 16.5372 7.49445C16.5372 6.75383 16.3441 6.05136 15.9934 5.51648Z" fill="#168CC4"/>
            <path d="M11.1794 5.51631C10.7977 4.93402 10.2512 4.6001 9.67981 4.6001C9.10846 4.6001 8.56188 4.93406 8.1802 5.51631C7.82957 6.05121 7.63644 6.75366 7.63644 7.49427C7.63644 8.23488 7.82954 8.93733 8.1802 9.47223C8.56191 10.0545 9.10846 10.3885 9.67981 10.3885C10.2512 10.3885 10.7977 10.0545 11.1794 9.47223C11.5301 8.93733 11.7232 8.23491 11.7232 7.49427C11.7231 6.75366 11.5301 6.05118 11.1794 5.51631Z" fill="#168CC4"/>
            <path d="M19.9068 10.1345C19.748 9.5771 19.4077 9.17207 18.9485 8.99407C18.579 8.85085 18.1619 8.87513 17.7741 9.06248C17.2395 9.32061 16.8026 9.85366 16.5754 10.5249C16.3898 11.0734 16.3666 11.6532 16.5103 12.1575C16.6691 12.7149 17.0094 13.12 17.4686 13.298C17.6275 13.3596 17.7952 13.3902 17.9655 13.3902C18.1914 13.3902 18.422 13.3363 18.6431 13.2296C19.1776 12.9714 19.6145 12.4384 19.8417 11.7672C20.0273 11.2187 20.0505 10.6388 19.9068 10.1345Z" fill="#168CC4"/>
            <path d="M7.42458 10.5248C7.19736 9.85361 6.76046 9.3206 6.22595 9.06246C5.83805 8.87512 5.42092 8.85086 5.05145 8.99406C4.59226 9.17208 4.25192 9.57712 4.09313 10.1345C3.94948 10.6388 3.97263 11.2186 4.15829 11.7671C4.38554 12.4383 4.82242 12.9714 5.35692 13.2295C5.57804 13.3363 5.80864 13.3901 6.03448 13.3901C6.20486 13.3901 6.37255 13.3595 6.53142 13.2979C6.99067 13.1199 7.33099 12.7149 7.48977 12.1575C7.63336 11.6532 7.61021 11.0734 7.42458 10.5248Z" fill="#168CC4"/>
        </svg>
    `;

        const SEGURO_ICON = `
        <svg class="injectShowcaseSecondaryProductsWrapper__item__header__icon" width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M4.51242 11.6362V9.55892C4.51242 8.69366 4.50937 7.82841 4.50329 6.96315C4.49333 6.90014 4.50617 6.83568 4.53955 6.78106C4.57294 6.72643 4.62475 6.68511 4.68593 6.66433C7.06514 5.62747 9.44252 4.5864 11.8181 3.54114C11.8718 3.51425 11.9313 3.50024 11.9916 3.50024C12.0519 3.50024 12.1113 3.51425 12.1651 3.54114C14.548 4.5936 16.9314 5.63827 19.3155 6.67514C19.3734 6.69034 19.4239 6.72568 19.4574 6.77465C19.491 6.82362 19.5055 6.8829 19.4981 6.94155C19.4981 8.54545 19.4981 10.1476 19.489 11.7515C19.4863 12.2765 19.4436 12.8006 19.3612 13.3194C19.0937 14.9696 18.4237 16.5313 17.4087 17.87C16.112 19.5928 14.4536 20.824 12.3532 21.4469C12.1263 21.518 11.8825 21.518 11.6555 21.4469C9.71787 20.8735 8.01568 19.7071 6.79544 18.1167C5.30786 16.2758 4.50245 13.9896 4.51242 11.6362ZM5.79091 7.89921V10.0593H5.78178V11.7803C5.77294 13.734 6.44112 15.6322 7.67577 17.1608C8.69031 18.4832 10.1061 19.4523 11.7176 19.9276C11.906 19.9866 12.1083 19.9866 12.2966 19.9276C13.9914 19.4222 15.4685 18.3777 16.4973 16.9574C17.3406 15.8453 17.8971 14.5481 18.1192 13.1771C18.1881 12.7466 18.2241 12.3115 18.227 11.8757C18.2355 10.9887 18.2326 10.101 18.2298 9.21356C18.2284 8.76993 18.227 8.32637 18.227 7.88301C18.2332 7.83477 18.2218 7.78591 18.1946 7.74529C18.1675 7.70467 18.1265 7.67498 18.079 7.6616C16.0968 6.79754 14.1175 5.93049 12.1414 5.06043C12.0969 5.03829 12.0478 5.02675 11.998 5.02675C11.9482 5.02675 11.8991 5.03829 11.8546 5.06043C9.88208 5.92809 7.9132 6.79154 5.94798 7.6508C5.89604 7.66693 5.85166 7.70084 5.82286 7.74639C5.79406 7.79195 5.78273 7.84615 5.79091 7.89921ZM12.0001 12.5715V6.16681C11.9595 6.16693 11.9194 6.1764 11.8823 6.19462L7.33975 8.41977C7.30344 8.43386 7.27261 8.46123 7.25241 8.49734C7.2322 8.53345 7.22384 8.5761 7.22871 8.61818V11.9559C7.22871 12.1172 7.23376 12.2786 7.24554 12.438C7.25744 12.6319 7.27822 12.825 7.30779 13.0166C7.47901 14.1903 7.90625 15.3007 8.55278 16.2523C9.34011 17.4673 10.4699 18.3611 11.7662 18.7945C11.8389 18.8186 11.9141 18.8317 11.99 18.8335V12.5715H12.0001Z" fill="#169BD6"/>
        </svg>
    `;

        const HOTEL_ICON = `
        <svg class="injectShowcaseSecondaryProductsWrapper__item__header__icon" width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.5 19.8311C4.5 19.562 4.7151 19.3438 4.98044 19.3438H28.0196C28.2849 19.3438 28.5 19.562 28.5 19.8311V22.124C28.5 22.3931 28.2849 22.6113 28.0196 22.6113H4.98044C4.7151 22.6113 4.5 22.3931 4.5 22.124V19.8311Z" fill="#169BD6"/>
            <path d="M27.709 18.6875L5.28823 18.6875C5.28823 16.8933 6.72225 15.4389 8.49119 15.4389L24.506 15.4389C26.275 15.4389 27.709 16.8933 27.709 18.6875Z" fill="#169BD6"/>
            <path d="M6.0139 22.5484H9.19095L8.51244 24.4811C8.4429 24.6727 8.26291 24.8 8.06157 24.8H7.14328C6.94194 24.8 6.76195 24.6727 6.69241 24.4811L6.0139 22.5484Z" fill="#169BD6"/>
            <path d="M23.7913 22.5484H26.9683L26.2898 24.4811C26.2203 24.6727 26.0403 24.8 25.839 24.8H24.9207C24.7193 24.8 24.5394 24.6727 24.4698 24.4811L23.7913 22.5484Z" fill="#169BD6"/>
            <path d="M6.01734 8.80005C5.752 8.80005 5.5369 9.01822 5.5369 9.28734V16.0566C6.26892 15.2453 7.32147 14.7365 8.49119 14.7365H9.13798C9.09377 14.6005 9.06986 14.4551 9.06986 14.3041V13.8168C9.06986 13.0542 9.67931 12.4361 10.4311 12.4361H14.1145C14.8663 12.4361 15.4758 13.0542 15.4758 13.8168V14.3041C15.4758 14.4551 15.4519 14.6005 15.4077 14.7366H17.6036C17.5594 14.6005 17.5355 14.4551 17.5355 14.3041V13.8168C17.5355 13.0542 18.145 12.4361 18.8968 12.4361H22.5802C23.332 12.4361 23.9414 13.0542 23.9414 13.8168V14.3041C23.9414 14.4551 23.9175 14.6005 23.8733 14.7366H24.506C25.6832 14.7366 26.7418 15.2519 27.4744 16.0722V9.28734C27.4744 9.01822 27.2593 8.80005 26.9939 8.80005H6.01734Z" fill="#169BD6"/>
        </svg>
    `;

        const PASSEIOS_ICON = `
        <svg class="injectShowcaseSecondaryProductsWrapper__item__header__icon" width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.3136 14.0224L23.9445 14.0301C25.0873 14.0354 25.994 12.9739 25.7127 11.8618C24.7244 7.83156 21.0699 4.82898 16.7488 4.80229C20.1147 6.50665 22.2948 10.0031 22.3136 14.0224ZM16.7488 4.80229C12.4278 4.78845 8.81416 7.75695 7.85708 11.7717C7.59265 12.8876 8.49653 13.9576 9.64579 13.9566L11.2766 13.9642C11.2642 9.95139 13.3988 6.47516 16.7488 4.80229ZM16.7488 4.80229C14.5801 6.4807 13.1069 9.95361 13.1194 13.9793L20.4773 14.0138C20.4585 9.99451 18.9333 6.50111 16.7488 4.80229Z" fill="#169BD6"/>
            <path d="M15.8845 14.9168L17.7208 14.9254L17.7553 22.2834C17.7577 22.7842 17.3487 23.1932 16.8415 23.1972C16.3407 23.1949 15.9278 22.782 15.919 22.2748L15.8845 14.9168Z" fill="#169BD6"/>
            <path d="M10.486 24.3681C10.5811 23.9548 10.9932 23.6969 11.4064 23.7921C11.8197 23.8872 12.0776 24.2993 11.9825 24.7125L11.1788 28.2043C11.0837 28.6175 10.6716 28.8754 10.2583 28.7803C9.84509 28.6852 9.5872 28.2731 9.68231 27.8599L10.486 24.3681Z" fill="#169BD6"/>
            <path d="M25.8901 24.4389C25.8901 24.0149 26.2339 23.6711 26.6579 23.6711C27.082 23.6711 27.4257 24.0149 27.4257 24.4389V28.022C27.4257 28.446 27.082 28.7898 26.6579 28.7898C26.2339 28.7898 25.8901 28.446 25.8901 28.022V24.4389Z" fill="#169BD6"/>
            <path d="M10.0234 26.2902L4.77696 20.5669C4.41102 20.1677 4.38938 19.538 4.82239 19.2128C7.1978 17.4286 9.72158 20.2536 11.8991 21.9645H25.5489C28.0137 21.9645 28.8094 23.0772 28.3963 25.4724C28.3128 25.9566 27.8769 26.2902 27.3856 26.2902H10.0234Z" fill="#169BD6"/>
        </svg>
    `;

        const CARRO_ICON = `
        <svg class="injectShowcaseSecondaryProductsWrapper__item__header__icon" width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M28.4989 15.028C28.3987 14.5272 27.8779 14.2168 27.3572 14.3169L25.5946 14.7175L23.3813 10.2309C23.0308 9.4598 22.45 9.08925 21.789 8.919C18.2438 8.75877 14.7787 8.75877 11.2435 8.92902C10.5826 9.09927 9.99169 9.46981 9.65119 10.2409L7.43794 14.7175L5.67536 14.3169C5.15459 14.2168 4.63383 14.5172 4.53368 15.028C4.39348 15.4987 4.70393 16.0094 5.2247 16.1396L6.50658 16.41L6.22617 16.9107C6.19612 19.4344 6.15606 21.2849 6.15606 23.8186C6.15606 24.3594 6.60672 24.8 7.15753 24.8H10.5826C11.1334 24.8 11.584 24.3594 11.584 23.8186V23.1098H21.4185V23.8186C21.4185 24.3594 21.8691 24.8 22.4199 24.8H25.845C26.3958 24.8 26.8464 24.3594 26.8464 23.8186C26.8464 21.2949 26.8164 19.4445 26.7763 16.9107L26.4959 16.41L27.7778 16.1396C28.2585 16.0094 28.609 15.4987 28.4688 15.028H28.4989ZM12.5655 19.2942C12.5655 19.6648 12.255 19.9652 11.8745 19.9652H8.26916C7.84855 19.9652 7.46799 19.6247 7.46799 19.1941V18.453C7.46799 18.0524 7.8185 17.6819 8.2291 17.7119C9.82144 17.8822 11.7943 18.2527 12.5555 18.8936V19.2942H12.5655ZM8.78993 15.1481C9.24059 14.2368 10.6226 10.3611 11.594 10.291C14.8889 9.95052 18.1437 9.95052 21.4285 10.291C22.3999 10.3611 23.7819 14.2368 24.2326 15.1481C19.075 14.6775 13.9475 14.6775 8.77991 15.1481H8.78993ZM25.5245 19.1941C25.5245 19.6347 25.174 19.9652 24.7634 19.9652H21.1581C20.7775 19.9652 20.4671 19.6648 20.4671 19.2942V18.8936C21.2282 18.2527 23.2011 17.8822 24.7934 17.7119C25.214 17.6819 25.5245 18.0524 25.5245 18.453V19.1941Z" fill="#169BD6"/>
        </svg>
    `;

        const FIXED_PRODUCTS = [{
                name: "Bagagem despachada",
                icon: BAGAGEM_ICON,
                identifier: "Bagagem despachada",
                description: "Adquira já e viaje sem preocupações.",
                selectorTriggerClick: "button[aria-label='Para gerenciar as bagagens dos viajantes, selecionar']",
                image: "https://i.imgur.com/8iLCao8.png",
            },
            {
                name: "Assento antecipado",
                icon: ASSENTO_ICON,
                identifier: "Assento antecipado",
                description: "Assentos a partir de R$49,90",
                selectorTriggerClick: "button[aria-label='Para gerenciar os assentos dos viajantes, selecionar']",
                image: "https://i.imgur.com/oejCRcw.png",
            }
        ];

        const PRODUCTS = [{
                name: "Pet na cabine",
                icon: PET_ICON,
                identifier: "Pet na cabine",
                image: "https://i.imgur.com/xzxwD8W.jpeg",
                selectorTriggerClick: CTA_PRODUCTS_SELECTOR_TRIGGER_CLICK
            },
            {
                name: "Seguro viagem",
                icon: SEGURO_ICON,
                identifier: "Seguro viagem",
                description: "Coberturas para você evitar contratempos!",
                image: "https://i.imgur.com/Y1cwxpb.jpeg",
                selectorTriggerClick: CTA_PRODUCTS_SELECTOR_TRIGGER_CLICK
            },
            {
                name: "Hotéis",
                icon: HOTEL_ICON,
                identifier: "Hotel",
                description: "Sua viagem com conforto e desconto!<br/> Use o cupom: CLIENTEAZUL",
                image: "https://i.imgur.com/IV5hgFN.jpeg",
                selectorTriggerClick: CTA_PRODUCTS_SELECTOR_TRIGGER_CLICK
            },
            {
                name: "Passeios e ingressos",
                icon: PASSEIOS_ICON,
                identifier: "Passeios e ingressos",
                description: "Sua viagem com conforto e desconto!<br/> Use o cupom: CLIENTEAZUL",
                image: "https://i.imgur.com/awckST8.jpeg",
                selectorTriggerClick: CTA_PRODUCTS_SELECTOR_TRIGGER_CLICK
            },
            {
                name: "Carros",
                icon: CARRO_ICON,
                identifier: "Carro",
                description: "Novidade! comodidade para sua viagem ser inesquecível!",
                image: "https://i.imgur.com/4Tmx9ZE.jpeg",
                selectorTriggerClick: CTA_PRODUCTS_SELECTOR_TRIGGER_CLICK
            },
        ];

        const checkIfDomReady = () => {
            const isReady = document.readyState === 'complete' || document.readyState === 'interactive';

            if (isReady) {
                initShowcaseSecondaryProducts();
            } else {
                document.addEventListener('DOMContentLoaded', initShowcaseSecondaryProducts);
            }
        }

        function initShowcaseSecondaryProducts() {
            const domOnLoading = document.querySelector(".loader.css-1e6lubz");

            if (domOnLoading) {
                console.log("[AT] Waiting for DOM to be fully loaded...");
                requestAnimationFrame(initShowcaseSecondaryProducts);
                return;
            }

            trackingAnalyticsEventForOthers();

            const targetContainer = document.querySelector(".css-12mbwum");
            const slickTrackOfCurrentProducts = document.querySelector(".slick-track");
            const currentElementDotList = document.querySelector(".sc-cyAvAE.byhnwi");
            const currentProductsElement = document.querySelectorAll(CURRENT_PRODUCT_ELEMENT);

            const deviceWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

            if (deviceWidth < 601) {
                console.log("[AT] Device width is less than 601px");

                if (!targetContainer || !currentProductsElement) {
                    console.log("[AT] Waiting for target container and current products slider to be available...");
                    requestAnimationFrame(initShowcaseSecondaryProducts);

                    return;
                }

                addShowcaseSecondaryProducts();
            } else {
                console.log("[AT] Device width is greater than 601px");

                if (!targetContainer || !slickTrackOfCurrentProducts || !currentElementDotList) {
                    console.log("[AT] Waiting for target container and current products slider to be available...");
                    requestAnimationFrame(initShowcaseSecondaryProducts);
                    return;
                }

                forceDomLoadingOfCurrentProductsSlider();
            }

            injectCustomStyle();

            function forceDomLoadingOfCurrentProductsSlider() {
                const currentElementArrowsList = document.querySelectorAll(".sc-dXxSUK.ktjWwA");

                let i = 2; //skip first two slides that are already loaded
                const intervalCurrentArrows = setInterval(() => {
                    if (i >= currentElementDotList.childElementCount) {
                        currentElementDotList.childNodes[0]?.querySelector("svg")?.dispatchEvent(eventTrigger);
                        addShowcaseSecondaryProducts();
                        clearInterval(intervalCurrentArrows);
                    } else {
                        currentElementArrowsList[1].dispatchEvent(eventTrigger);
                        i++;
                    }
                }, 1000);
            }

            function addShowcaseSecondaryProducts() {
                console.log("[AT] Injecting the secondary products showcase...");
                const alreadyInjected = document.querySelector(".injectShowcaseSecondaryProductsWrapper");

                if (alreadyInjected) {
                    alreadyInjected.remove();
                }

                const injectShowcaseWrapper = document.createElement("div");
                injectShowcaseWrapper.classList.add("injectShowcaseSecondaryProductsWrapper");

                injectShowcaseWrapper.innerHTML = `
                <h2 class="injectShowcaseSecondaryProductsWrapper__title">Complete sua experiência</h2>
                <h3 class="injectShowcaseSecondaryProductsWrapper__subtitle">Adicione hotéis e ingressos e acumule ainda mais pontos no programa Azul Fidelidade. 
                    <span class="injectShowcaseSecondaryProductsWrapper__subtitle__popover">
                        <img src="http://voeazul.com.br/content/dam/azul/icons/info.svg" alt="" class="injectShowcaseSecondaryProductsWrapper__subtitle__popover__trigger">
                        <div class="injectTooltip">
                            <div class="tooltip-body">
                                <div class="sc-kMizLa cWNvVu richTextContainer" data-rte-editelement="true">
                                    <p>Adicionando produtos a sua viagem você acumula mais pontos no programa Fidelidade Azul (válido para os produtos com a etiqueta&nbsp;<b><span class="deepcerulean">Acumule pontos</span></b>)
                                    </p>
                                </div>
                            </div>
                            <div class="tooltip-arrow injectTooltipBottom"></div>
                        </div>
                    </span>
                </h3>
                <div class="injectShowcaseSecondaryProductsWrapper__wrapper">
                    <div class="injectShowcaseSecondaryProductsWrapper__carousel"></div>
                    <div class="injectShowcaseSecondaryProductsWrapper__actions">
                        <button class="injectShowcaseSecondaryProductsWrapper__actions__arrow" direction="left">
                            <svg size="24" viewBox="0 0 1024 1024" fill="none" class="sc-bczRLJ epIJpy"><path d="M133.9 527.8C126 518.8 126 505.2 133.9 496.2L364.9 232.2C373.7 222.2 388.8 221.2 398.8 229.9 408.8 238.7 409.8 253.8 401.1 263.8L204.9 488 872 488C885.3 488 896 498.7 896 512 896 525.3 885.3 536 872 536L204.9 536 401.1 760.2C409.8 770.2 408.8 785.3 398.8 794.1 388.8 802.8 373.7 801.8 364.9 791.8L133.9 527.8Z" fill="#026CB6" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                        </button>
                        <ul class="injectShowcaseSecondaryProductsWrapper__actions__dots"></ul>
                        <button class="injectShowcaseSecondaryProductsWrapper__actions__arrow" direction="right">
                            <svg size="24" viewBox="0 0 1024 1024" fill="none" class="sc-bczRLJ epIJpy"><path d="M890.1 496.2C898 505.2 898 518.8 890.1 527.8L659.1 791.8C650.3 801.8 635.2 802.8 625.2 794.1 615.2 785.3 614.2 770.2 622.9 760.2L819.1 536 152 536C138.7 536 128 525.3 128 512 128 498.7 138.7 488 152 488L819.1 488 622.9 263.8C614.2 253.8 615.2 238.7 625.2 229.9 635.2 221.2 650.3 222.2 659.1 232.2L890.1 496.2Z" fill="#026CB6" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                        </button>
                    </div>
                </div>
            `;

                FIXED_PRODUCTS.forEach(product => {
                    product.buttonTarget = document.querySelector(product.selectorTriggerClick);

                    if (product.buttonTarget) {
                        const itemElement = createCarouselItem(product, true);

                        injectShowcaseWrapper.querySelector(".injectShowcaseSecondaryProductsWrapper__carousel").appendChild(itemElement);
                    }
                });

                const currentProductsElement = document.querySelectorAll(CURRENT_PRODUCT_ELEMENT);

                for (const product of PRODUCTS) {
                    for (const currentProduct of currentProductsElement) {

                        if (currentProduct.textContent.toLowerCase().includes(product.identifier.toLowerCase())) {
                            product.buttonTarget = currentProduct.querySelector(product.selectorTriggerClick);

                            if (!product.description) {
                                product.description = currentProduct.querySelectorAll(CTA_PRODUCTS_SELECTOR_DESCRIPTION)?.[1]?.textContent || "";
                            }

                            if (product.buttonTarget) {
                                const itemElement = createCarouselItem(product);

                                injectShowcaseWrapper.querySelector(".injectShowcaseSecondaryProductsWrapper__carousel").appendChild(itemElement);
                            }

                            break;
                        }
                    }
                }

                targetContainer.insertAdjacentElement("afterbegin", injectShowcaseWrapper);
                setTimeout(() => {
                    handleCarouselActions();
                }, 500);
            }

            function createCarouselItem(product, fixedProduct = false) {
                console.log(product);
                const itemElement = document.createElement("div");
                itemElement.className = "injectShowcaseSecondaryProductsWrapper__carousel__item";

                itemElement.innerHTML = `
                <div class="injectShowcaseSecondaryProductsWrapper__item__image" style="background-image: url('[REPLACE_IMAGE]');"></div>
                <div class="injectShowcaseSecondaryProductsWrapper__item__infos">
                    <div class="injectShowcaseSecondaryProductsWrapper__item__header">
                        [REPLACE_ICON]
                        <h4 class="injectShowcaseSecondaryProductsWrapper__item__header__title">[REPLACE_NAME]</h4>
                    </div>
                    <p class="injectShowcaseSecondaryProductsWrapper__item__description">[REPLACE_DESCRIPTION]</p>
                    <button class="injectShowcaseSecondaryProductsWrapper__item__button">Adicionar serviço</button>
                </div>
            `;

                itemElement.innerHTML = itemElement.innerHTML.replace("[REPLACE_IMAGE]", product.image);
                itemElement.innerHTML = itemElement.innerHTML.replace("[REPLACE_ICON]", product.icon);
                itemElement.innerHTML = itemElement.innerHTML.replace("[REPLACE_NAME]", product.name);
                itemElement.innerHTML = itemElement.innerHTML.replace("[REPLACE_DESCRIPTION]", product.description);

                itemElement.querySelector(".injectShowcaseSecondaryProductsWrapper__item__button").addEventListener("click", () => {
                    analyticsEvent(product.name);

                    if (fixedProduct) {
                        eventTrigger.isTriggeredByShowcaseProducts = true;
                        product.buttonTarget.dispatchEvent(eventTrigger);
                        eventTrigger.isTriggeredByShowcaseProducts = false;

                        return;
                    }

                    product.buttonTarget.click();
                });

                return itemElement;
            }

            function reinjectComponentAfterOpenAndCloseSeats() {
                const checkIfPageIsOpen = setInterval(() => {
                    const pagesProducts = document.querySelectorAll(".azul-page-fragment");
                    const seatPageIsOpen = pagesProducts[2].classList.contains("azul-page-fragment--active");

                    console.log(seatPageIsOpen);
                    console.log("Checking if seat selection page is open...");

                    if (seatPageIsOpen) {
                        console.log("Seat selection page is open, removing the showcase...");
                        clearInterval(checkIfPageIsOpen);
                        reinjectComponentWhenSeatPageClosed();
                        return;
                    }
                }, 100);
            }

            function reinjectComponentWhenSeatPageClosed() {
                const checkIfPageIsClosed = setInterval(() => {
                    const pagesProducts = document.querySelectorAll(".azul-page-fragment");
                    const seatPageIsOpen = pagesProducts[2].classList.contains("azul-page-fragment--active");

                    console.log("Checking if seat selection page is closed...");
                    if (!seatPageIsOpen) {
                        console.log("Seat selection page is closed, reinjecting the showcase...");
                        clearInterval(checkIfPageIsClosed);
                        addShowcaseSecondaryProducts();
                        return;
                    }
                }, 100);
            }

            function handleCarouselActions() {
                const dotsContainer = document.querySelector(".injectShowcaseSecondaryProductsWrapper__actions__dots");

                const carousel = document.querySelector(".injectShowcaseSecondaryProductsWrapper__carousel");
                const carouselItems = document.querySelectorAll(".injectShowcaseSecondaryProductsWrapper__carousel__item");
                const carouselItemWidth = carouselItems[0]?.offsetWidth;
                const gapForCarouselItem = 16; // gap defined in CSS
                const widthToScroll = carouselItemWidth + gapForCarouselItem;

                const carouselRightEdge = carousel.getBoundingClientRect().right;
                const carouselMaxScroll = (carouselItems[carouselItems.length - 1].getBoundingClientRect().right) - carouselRightEdge;
                const carouselMaxDotsScroll = (carouselMaxScroll + widthToScroll) / widthToScroll;
                const carouselMaxDotsScrollParsed = Math.ceil(carouselMaxDotsScroll);

                for (let dotIndex = 0; dotIndex < carouselMaxDotsScrollParsed; dotIndex++) {
                    const dotShouldBeActive = dotIndex === 0;
                    const dotElement = createDotElement(dotShouldBeActive);

                    dotsContainer.appendChild(dotElement);
                }

                const arrowLeft = document.querySelector(".injectShowcaseSecondaryProductsWrapper__actions__arrow[direction='left']");
                const arrowRight = document.querySelector(".injectShowcaseSecondaryProductsWrapper__actions__arrow[direction='right']");
                const dots = document.querySelectorAll(".injectShowcaseSecondaryProductsWrapper__actions__dots__dot__button");

                arrowLeft.addEventListener("click", () => {
                    const activeDot = document.querySelector(".injectShowcaseSecondaryProductsWrapper__actions__dots__dot__button.active");
                    const previousDotItem = activeDot?.parentElement?.previousElementSibling;

                    if (!previousDotItem) {
                        dotsContainer.lastElementChild?.querySelector(".injectShowcaseSecondaryProductsWrapper__actions__dots__dot__button")?.click();
                        return;
                    }

                    previousDotItem.querySelector(".injectShowcaseSecondaryProductsWrapper__actions__dots__dot__button")?.click();
                });

                arrowRight.addEventListener("click", () => {
                    const activeDot = document.querySelector(".injectShowcaseSecondaryProductsWrapper__actions__dots__dot__button.active");
                    const nextDotItem = activeDot?.parentElement?.nextElementSibling;

                    if (!nextDotItem) {
                        dotsContainer.firstElementChild?.querySelector(".injectShowcaseSecondaryProductsWrapper__actions__dots__dot__button")?.click();
                        return;
                    }

                    nextDotItem.querySelector(".injectShowcaseSecondaryProductsWrapper__actions__dots__dot__button")?.click();
                });

                dots.forEach((dot) => {
                    dot.addEventListener("click", () => {
                        const activeDot = document.querySelector(".injectShowcaseSecondaryProductsWrapper__actions__dots__dot__button.active");
                        activeDot.classList.remove("active");
                        dot.classList.add("active");

                        const index = Array.from(dots).indexOf(dot);
                        carousel.scrollLeft = index * widthToScroll;
                    });
                });
            }

            function createDotElement(activeDot = false) {
                const dotElement = document.createElement("li");
                dotElement.className = "injectShowcaseSecondaryProductsWrapper__actions__dots__dot";

                dotElement.innerHTML = `
                <button class="injectShowcaseSecondaryProductsWrapper__actions__dots__dot__button"></button>
            `;

                if (activeDot) dotElement.querySelector("button").classList.add("active");

                return dotElement;
            }

            function trackingAnalyticsEventForOthers() {
                const eventToTrack = isTouchDevice ? "touchstart" : "click";

                const manageLuggageButton = document.querySelector("button[aria-label='Para gerenciar as bagagens dos viajantes, selecionar']");
                const manageSeatsButton = document.querySelector("button[aria-label='Para gerenciar os assentos dos viajantes, selecionar']");

                manageLuggageButton?.addEventListener(eventToTrack, (event) => {
                    if (!event.isTriggeredByShowcaseProducts) {
                        analyticsEvent("Nativo - Gerenciar bagagens");
                    }
                });

                manageSeatsButton?.addEventListener(eventToTrack, (event) => {
                    reinjectComponentAfterOpenAndCloseSeats();

                    if (!event.isTriggeredByShowcaseProducts) {
                        analyticsEvent("Nativo - Gerenciar assentos");
                    }
                });

                const moreServicesButton = document.querySelector("button[aria-label='Para gerenciar mais serviços dos viajantes, selecionar']");

                moreServicesButton?.addEventListener(eventToTrack, () => {
                    const checkIfModalMoreServicesIsOpen = setInterval(() => {
                        const addInsuranceModalButton = document.querySelector("button[aria-label='Adicionar seguros']");

                        if (addInsuranceModalButton) {
                            const addPetModalButton = document.querySelector("button[aria-label='Adicionar Pet na cabine']");
                            const addSpecialAssistanceModalButton = document.querySelector("button[aria-label='Assistência Especial']");

                            addInsuranceModalButton.addEventListener(eventToTrack, () => {
                                analyticsEvent("Nativo - Adicionar seguro");
                            });

                            addPetModalButton?.addEventListener(eventToTrack, () => {
                                analyticsEvent("Nativo - Adicionar pet na cabine");
                            });

                            addSpecialAssistanceModalButton?.addEventListener(eventToTrack, () => {
                                analyticsEvent("Nativo - Assistência especial");
                            });

                            clearInterval(checkIfModalMoreServicesIsOpen);
                        }
                    }, 100);
                });
            }

            function injectCustomStyle() {
                const style = document.createElement("style");

                style.innerHTML = `
                .injectShowcaseSecondaryProductsWrapper h1,
                .injectShowcaseSecondaryProductsWrapper h2,
                .injectShowcaseSecondaryProductsWrapper h3,
                .injectShowcaseSecondaryProductsWrapper h4,
                .injectShowcaseSecondaryProductsWrapper span,
                .injectShowcaseSecondaryProductsWrapper p {
                    margin: 0;
                    padding: 0;
                }

                .injectShowcaseSecondaryProductsWrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 8px;
                    width: 100%;
                }

                @media screen and (max-width: 1023px) {
                    .injectShowcaseSecondaryProductsWrapper {
                        padding: 24px;
                    }
                }

                .injectShowcaseSecondaryProductsWrapper__wrapper,
                .injectShowcaseSecondaryProductsWrapper__carousel,
                .injectShowcaseSecondaryProductsWrapper__actions {
                    width: 100%;
                }

                .injectShowcaseSecondaryProductsWrapper__wrapper {
                    overflow: hidden;
                }

                .injectShowcaseSecondaryProductsWrapper__actions {
                    margin-top: 8px;
                }

                .injectShowcaseSecondaryProductsWrapper__title {
                    font-family: "Helvetica Neue", Arial, sans-serif;
                    font-weight: 400;
                    font-size: 18px;
                    line-height: 16px;
                    letter-spacing: 0%;
                    color: #041E42;
                }

                .injectShowcaseSecondaryProductsWrapper__subtitle {
                    font-family: "Helvetica Neue", Arial, sans-serif;
                    font-weight: 400;
                    font-size: 14px;
                    line-height: 16px;
                    color: #026CB6;
                }

                .injectShowcaseSecondaryProductsWrapper__actions {
                    align-items: center;
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                }

                .injectShowcaseSecondaryProductsWrapper__actions__arrow {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                    margin: 0;
                    height: 24px;
                    width: 24px;
                }

                .injectShowcaseSecondaryProductsWrapper__actions__arrow svg {
                    height: 24px;
                    width: 24px;
                }

                .injectShowcaseSecondaryProductsWrapper__actions__arrow, .injectShowcaseSecondaryProductsWrapper__actions__dots {
                    margin: 0;
                    padding: 0;
                }

                .injectShowcaseSecondaryProductsWrapper__actions__dots {
                    display: flex;
                    list-style: none;
                    align-items: center;
                    gap: 18px;
                }

                .injectShowcaseSecondaryProductsWrapper__actions__dots__dot {
                    display: flex;
                    align-items: center;
                }

                .injectShowcaseSecondaryProductsWrapper__actions__dots__dot__button {
                    background-color: #A6D3F2;
                    cursor: pointer;
                    border: none;
                    height: 10px; 
                    width: 10px;
                    border-radius: 100%;
                    padding: 0;
                }

                .injectShowcaseSecondaryProductsWrapper__actions__dots__dot__button.active {
                    background-color: #026CB6;
                }

                .injectShowcaseSecondaryProductsWrapper__carousel {
                    display: flex;
                    gap: 16px;
                    overflow-x: hidden;
                    scroll-behavior: smooth;
                }
                
                .injectShowcaseSecondaryProductsWrapper__carousel__item {
                    display: flex;
                    flex-direction: column;
                    width: 186px;
                    min-height: 255px;
                    border: solid 1px #C0C0C0;
                    border-radius: 8px;
                    flex-shrink: 0;
                    box-sizing: border-box;
                }

                @media screen and (min-width: 576px) {
                    .injectShowcaseSecondaryProductsWrapper__carousel__item {
                        width: 220px;
                    }
                }

                .injectShowcaseSecondaryProductsWrapper__item__image {
                    height: 100px;
                    width: 100%;
                    background-position: top;
                    background-size: cover;
                    background-repeat: no-repeat;
                    background-image: url('https://www.voeazul.com.br/content/dam/azul/voe-azul/todas-as-lp/lp-promo%C3%A7%C3%A3o-azv/Resort%20-%20Caldas%20Novas.png');
                    border-radius: 8px 8px 0px 0px;
                    flex-shrink: 0;
                }

                .injectShowcaseSecondaryProductsWrapper__item__header__icon {
                    height: 20px;
                    width: 20px;
                }

                .injectShowcaseSecondaryProductsWrapper__item__infos {
                    background-color: #041E42;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    flex-grow: 1;
                    border-radius: 0px 0px 8px 8px;
                    color: #FFFFFF;
                    text-align: left;
                }

                .injectShowcaseSecondaryProductsWrapper__item__description {
                    font-family: "Helvetica Neue", Arial, sans-serif;
                    font-weight: 400;
                    font-size: 14px;
                    line-height: 20px;
                    color: #FFFFFF;
                    text-align: left;
                }

                .injectShowcaseSecondaryProductsWrapper__item__button {
                    background-color: transparent;
                    border: solid 1px #FFFFFF;
                    border-radius: 4px;
                    color: #FFFFFF;
                    cursor: pointer;
                    width: 100%;
                    min-height: 32px;
                    padding: 8px;
                    margin-top: auto;
                }

                .injectShowcaseSecondaryProductsWrapper__item__header {
                    align-items: center;
                    display: flex;
                    gap: 8px;
                }

                .injectShowcaseSecondaryProductsWrapper__item__header__title {
                    font-family: "Helvetica Neue", Arial, sans-serif;
                    font-weight: 400;
                    font-size: 15px;
                    line-height: 15px;
                    text-align: left;
                }

                .injectTooltipBottom {
                    position:absolute;
                    width:16px;
                    height:16px;
                    background-color:rgb(255, 255, 255);
                    border-radius:1px;
                    transform:rotate(45deg);
                    left:calc(50%);
                    margin-left:-8px;
                    top:auto;
                    bottom:-7px;
                }

                .injectTooltip{
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    z-index: 1091;
                    transform: translate(-50%, -130%);
                    padding: 16px;
                    background: rgb(255, 255, 255);
                    border-radius: 4px;
                    max-width: 276px;
                    min-width: 276px;
                    filter: drop-shadow(rgba(0, 0, 0, 0.25) 0px 0px 16px);
                    display: none;
                }

                .injectShowcaseSecondaryProductsWrapper__subtitle__popover__trigger:hover + .injectTooltip,
                .injectShowcaseSecondaryProductsWrapper__subtitle__popover__trigger:focus-visible + .injectTooltip,
                .injectShowcaseSecondaryProductsWrapper__subtitle__popover__trigger:focus + .injectTooltip {
                    display: block;
                }

                .injectShowcaseSecondaryProductsWrapper__subtitle__popover {
                    position: relative;
                }

                .injectShowcaseSecondaryProductsWrapper__subtitle__popover img {
                    vertical-align: text-bottom;
                    height: 20px;
                    width: 20px;
                }
            `;

                document.head.appendChild(style);
            }
        }

        function analyticsEvent(productName = "") {
            if (productName == "") {
                console.log("[AT] Missing parameters for analytics event.");
                return;
            }

            const labelEvent = "AT_vitrine_produtos_secundarios " + productName;

            console.log("[AT] Analytics event triggered:", labelEvent);

            (function() {
                var s = window.s || (typeof s_gi === "function" && s_gi("azul-novo-prod"));
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

        if (window.showcaseSecondaryProductsInitialized) {
            return;
        }

        window.showcaseSecondaryProductsInitialized = true;
        checkIfDomReady();
    })();