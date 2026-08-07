(function () {
  'use strict';

  const STYLE_ID = 'at-oqvqfh-style';
  const SECTION_ID = 'at-oqvqfh-section';
  const ANCHOR_TESTID = 'store-categories-container';
  const SECTION_ID_2 = 'at-cidade-clima-section';
  const MAX_RETRIES = 40;
  const RETRY_INTERVAL = 250;

  let retryCount = 0;

  const CARDS = [
    {
      href: 'https://broto.com.br/solucoes/credito',
      titulo: 'Conseguir crédito',
      descricao: 'Encontre financiamento para realizar seus planos.',
      cta: 'Simular crédito',
      icone:
        '<svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">'
        + '<path d="M18.825 0.0287113C18.0937 0.0599613 16.9937 0.178711 16.2312 0.303711C12.8187 0.872461 10.7187 2.15371 10.3812 3.87246C10.2937 4.33496 10.3812 12.0537 10.475 12.2475C10.5125 12.3225 10.6437 12.4537 10.7625 12.535C11.0687 12.7412 11.45 12.6975 11.725 12.4287C11.9062 12.2412 11.9187 12.2037 11.9375 11.6725C11.95 11.36 11.9687 11.11 11.9812 11.11C11.9875 11.11 12.2562 11.2475 12.5812 11.4162C14.15 12.235 16.3125 12.7037 18.8875 12.7787C22.1187 12.8662 25.0937 12.2912 26.8937 11.2287C27.0625 11.1287 27.2187 11.0475 27.2312 11.0475C27.25 11.0475 27.2625 11.485 27.2625 12.0225V12.9912L26.9375 13.335C25.7437 14.5975 22.975 15.36 19.575 15.36C18.975 15.36 18.125 15.3287 17.6937 15.285C17.0437 15.2287 16.8687 15.2287 16.7 15.2975C16.1375 15.5287 16.1187 16.4412 16.6687 16.6975C17.2187 16.9537 20.2062 17.035 21.8875 16.835C23.975 16.5912 25.7125 16.085 26.9375 15.3662L27.2625 15.1725V16.1787V17.185L26.8687 17.5725C25.95 18.4662 24.275 19.085 21.9187 19.3975C20.95 19.5287 18.2812 19.5475 17.4625 19.435C17.0375 19.3787 16.9 19.3787 16.7375 19.4475C16.075 19.7225 16.1062 20.7037 16.7812 20.9162C17.1125 21.0162 18.4312 21.11 19.5875 21.11C22.5812 21.11 25.2187 20.535 27 19.485L27.325 19.2975V20.26C27.325 20.7912 27.3 21.2975 27.2687 21.3787C27.0125 22.0537 25.3937 22.7475 23.325 23.0725C21.8187 23.31 19.8625 23.3787 17.7812 23.2725L16.7 23.2225L16.4812 23.4412C16.2875 23.635 16.2625 23.6975 16.2625 23.9725C16.2625 24.3412 16.4562 24.6225 16.7812 24.7287C17.325 24.9037 20.0375 24.9725 21.6062 24.86C25.475 24.5725 27.975 23.5787 28.6937 22.0475L28.8562 21.7037L28.8375 13.0475C28.825 7.69121 28.7937 4.24746 28.7562 4.01621C28.5437 2.75371 27.4437 1.64121 25.7187 0.959961C24.4812 0.466211 22.8625 0.153711 21.0312 0.0474625C20.025 -0.00878906 19.7312 -0.0150375 18.825 0.0287113ZM22.4187 1.75996C24.5562 2.07871 25.875 2.59121 26.6687 3.38496C27.075 3.79121 27.2 4.06621 27.2 4.54746C27.2 4.78496 27.1625 4.84121 26.8562 5.14121C25.0562 6.90371 19.8187 7.62871 15.6437 6.69746C14 6.32871 12.6312 5.65996 12.1375 4.97246C11.9812 4.76621 11.95 4.65371 11.95 4.37871C11.95 3.97246 12.0375 3.79121 12.4 3.44121C13.2812 2.57871 15.4875 1.89121 18.1375 1.64746C18.7875 1.59121 21.8125 1.66621 22.4187 1.75996ZM27.2562 8.14746C27.2625 8.77871 27.2625 8.77871 27.0437 9.06621C26.7875 9.39746 25.9812 9.95371 25.3562 10.2225C22.2187 11.5725 16.4875 11.535 13.6 10.1412C12.9312 9.81621 12.3437 9.39121 12.1187 9.05996C11.9562 8.82871 11.95 8.79746 11.95 7.89746C11.95 7.39121 11.9687 6.98496 12 6.99746C13.7937 7.90996 14.6812 8.19121 16.6375 8.49746C17.8687 8.68496 20.975 8.70371 22.2 8.52871C24.1812 8.24746 25.8187 7.75996 26.8312 7.15371L27.1687 6.95371L27.2125 7.23496C27.2312 7.39121 27.2562 7.79746 27.2562 8.14746Z" fill="#5E73FF"/>'
        + '<path d="M6.95632 12.4225C5.59382 12.5975 4.14382 13.1975 3.03757 14.0475C2.51882 14.4537 1.69382 15.3475 1.30632 15.9287C0.412569 17.2787 -0.00618109 18.6912 6.8914e-05 20.36C6.8914e-05 21.6662 0.256319 22.7287 0.856319 23.9225C1.96257 26.11 4.13757 27.7162 6.56257 28.1412C7.25007 28.2662 8.60007 28.26 9.30007 28.1412C11.4126 27.7725 13.3251 26.5037 14.5438 24.6787C15.4438 23.3287 15.8501 21.96 15.8438 20.2975C15.8438 18.1037 15.0813 16.285 13.5188 14.7287C12.3251 13.535 10.9813 12.8162 9.40007 12.51C8.78757 12.3912 7.55632 12.3475 6.95632 12.4225ZM9.64382 14.1975C10.3751 14.41 10.7938 14.6037 11.4251 15.0162C12.8063 15.9162 13.8126 17.3975 14.1501 19.0412C14.3126 19.835 14.2813 21.1975 14.0751 21.9537C13.7938 22.9975 13.2751 23.8975 12.4813 24.7225C11.6626 25.585 10.6626 26.1725 9.46257 26.4975C8.80007 26.6787 7.20632 26.6975 6.51882 26.5287C5.36882 26.2475 4.36882 25.7037 3.53757 24.91C2.16257 23.5912 1.51257 21.9537 1.58757 20.035C1.63132 19.085 1.79382 18.4225 2.19382 17.5787C3.01257 15.8662 4.44382 14.6787 6.30007 14.1662C7.26257 13.9037 8.66882 13.9162 9.64382 14.1975Z" fill="#5E73FF"/>'
        + '<path d="M7.59377 15.0787C7.33752 15.185 7.13752 15.51 7.13752 15.8037C7.13752 15.9975 7.11252 16.035 6.89377 16.1287C6.33127 16.3787 5.76877 17.01 5.60002 17.585C5.40627 18.2537 5.51252 19.0975 5.85002 19.61C5.94377 19.7537 6.53752 20.2537 7.31252 20.8537C8.03127 21.41 8.65002 21.9287 8.68752 22.0162C8.86877 22.4162 8.70002 22.9475 8.33127 23.1412C7.86877 23.3787 7.36877 23.185 7.10627 22.6787C6.92502 22.3162 6.70002 22.1725 6.32502 22.1725C5.96877 22.1725 5.64377 22.4725 5.59377 22.8412C5.52502 23.3787 6.13752 24.235 6.81877 24.56C7.06252 24.6725 7.13127 24.735 7.13752 24.8475C7.13752 25.085 7.31252 25.385 7.50627 25.5037C7.71877 25.6287 8.10627 25.6412 8.31252 25.5225C8.51252 25.4162 8.70002 25.1162 8.70002 24.91C8.70002 24.7662 8.75002 24.71 9.01877 24.5725C9.94377 24.11 10.5 23.01 10.3188 22.0162C10.1563 21.1287 9.94377 20.8662 8.41252 19.6975C7.71877 19.1725 7.13127 18.6912 7.11252 18.635C7.09377 18.585 7.07502 18.4412 7.07502 18.3225C7.07502 17.4162 8.28752 17.1725 8.70627 17.9912C9.15002 18.8662 10.4125 18.46 10.2 17.5162C10.0875 17.01 9.41877 16.285 8.89377 16.1037C8.72502 16.0412 8.70002 16.0037 8.70002 15.81C8.70002 15.5037 8.49377 15.185 8.23127 15.0725C7.96877 14.9662 7.85002 14.9662 7.59377 15.0787Z" fill="#5E73FF"/>'
        + '</svg>',
    },
    {
      href: 'https://broto.com.br/loja/maquinas.html',
      titulo: 'Comprar máquinas',
      descricao: 'Encontre tudo o que precisa para produzir melhor.',
      cta: 'Ver produtos',
      icone:
        '<svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">'
        + '<g clip-path="url(#at-oqvqfh-clip-maquinas)">'
        + '<path d="M10.2465 3.3138C9.91645 3.64408 9.91645 4.17934 10.2465 4.50962C11.3655 5.6286 12.8511 6.24467 14.43 6.24467C16.0087 6.24467 17.4945 5.6286 18.6135 4.50962C18.9436 4.17956 18.9436 3.64408 18.6135 3.31402C18.2835 2.98374 17.748 2.98374 17.4177 3.31402C16.6182 4.11351 15.5571 4.55388 14.43 4.55388C13.3029 4.55388 12.2418 4.11351 11.4423 3.31402C11.1123 2.98374 10.5768 2.98374 10.2465 3.3138Z" fill="#465EFF"/>'
        + '<path d="M16.2236 2.1197C16.5537 1.78964 16.5537 1.25416 16.2236 0.924099C15.8934 0.593822 15.3581 0.593822 15.0278 0.924099C14.8682 1.08373 14.6559 1.17159 14.43 1.17159C14.2041 1.17159 13.9919 1.08373 13.8322 0.924099C13.5019 0.593822 12.9667 0.593822 12.6364 0.924099C12.3063 1.25416 12.3063 1.78964 12.6364 2.1197C13.1155 2.59882 13.7525 2.8626 14.43 2.8626C15.1075 2.8626 15.7445 2.59882 16.2236 2.1197Z" fill="#465EFF"/>'
        + '<path d="M0 13.8544V24.0005C0 24.4673 0.378497 24.846 0.845508 24.846H3.4384C3.4384 26.7107 4.95547 28.228 6.82043 28.228C8.68539 28.228 10.2025 26.7107 10.2025 24.846H13.5845C13.5845 26.7107 15.1016 28.228 16.9665 28.228C18.8315 28.228 20.3486 26.7107 20.3486 24.846H22.0396V27.3825C22.0396 27.8493 22.4181 28.228 22.8851 28.228H28.0145C28.3573 28.228 28.6662 28.0211 28.7966 27.7038C28.9267 27.3867 28.8527 27.0223 28.609 26.7812L23.7306 21.9565V19.2775L26.8649 16.1434C27.0166 15.9915 27.1126 15.7764 27.1126 15.5454V8.78135C27.1126 8.31434 26.7341 7.93584 26.2671 7.93584H17.812C17.345 7.93584 16.9665 8.31434 16.9665 8.78135V11.3179H12.739C12.5146 11.3179 12.2997 11.4068 12.1412 11.5654L11.2157 12.4908L6.69999 4.96423C6.54718 4.70948 6.27195 4.55359 5.97492 4.55359H0.845508C0.378497 4.55359 0 4.93231 0 5.3991V8.78113C0 9.24814 0.378497 9.62664 0.845508 9.62664H3.67444L4.80178 13.0087H0.845508C0.378497 13.0089 0 13.3874 0 13.8544ZM6.82043 26.537C5.88795 26.537 5.12941 25.7783 5.12941 24.846C5.12941 23.9135 5.88795 23.155 6.82043 23.155C7.75291 23.155 8.51144 23.9135 8.51144 24.846C8.51144 25.7783 7.75291 26.537 6.82043 26.537ZM16.9665 26.537C16.034 26.537 15.2755 25.7783 15.2755 24.846C15.2755 23.9135 16.034 23.155 16.9665 23.155C17.899 23.155 18.6575 23.9135 18.6575 24.846C18.6575 25.7783 17.899 26.537 16.9665 26.537ZM19.8937 23.155C19.3077 22.145 18.2156 21.464 16.9665 21.464C15.7174 21.464 14.6253 22.145 14.0394 23.155H9.74756C9.16165 22.145 8.06953 21.464 6.82043 21.464C5.57132 21.464 4.47921 22.145 3.8933 23.155H1.69102V19.773H22.0396V23.155H19.8937ZM23.7306 26.537V24.3347L25.9573 26.537H23.7306ZM25.4216 14.6999H22.0396V9.62686H25.4216V14.6999ZM20.3486 9.62686V13.5041L18.6575 11.8131V9.62686H20.3486ZM5.08604 8.51382C4.97088 8.16858 4.64787 7.93584 4.28391 7.93584H1.69102V6.24482H5.49624L9.55468 13.0089H6.58439L5.08604 8.51382ZM1.69102 14.6999H11.048C11.273 14.6999 11.4925 14.6054 11.6458 14.4522L13.0891 13.0089H17.4617L20.596 16.143C20.7588 16.3059 20.9778 16.3909 21.1941 16.3909H24.2258L22.5348 18.0819H1.69102V14.6999Z" fill="#465EFF"/>'
        + '<path d="M16.121 14.7H14.43C13.963 14.7 13.5845 15.0784 13.5845 15.5455C13.5845 16.0122 13.963 16.391 14.43 16.391H16.121C16.588 16.391 16.9665 16.0122 16.9665 15.5455C16.9665 15.0784 16.588 14.7 16.121 14.7Z" fill="#465EFF"/>'
        + '</g>'
        + '<defs><clipPath id="at-oqvqfh-clip-maquinas"><rect width="28.86" height="28.86" fill="white"/></clipPath></defs>'
        + '</svg>',
    },
    {
      href: 'https://club.broto.com.br/',
      titulo: 'Preciso de consultoria',
      descricao: 'Receba apoio especializado para o seu negócio.',
      cta: 'Clube Broto',
      icone:
        '<svg width="26" height="25" viewBox="0 0 26 25" fill="none" xmlns="http://www.w3.org/2000/svg">'
        + '<path d="M12.6667 1L16.2717 8.30333L24.3334 9.48167L18.5 15.1633L19.8767 23.19L12.6667 19.3983L5.4567 23.19L6.83336 15.1633L1.00003 9.48167L9.0617 8.30333L12.6667 1Z" stroke="#465EFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
        + '</svg>',
    },
    {
      href: 'https://noticias.broto.com.br/',
      titulo: 'Ver cursos e novidades',
      descricao: 'Aprenda, acompanhe as tendências e fique por dentro das novidades.',
      cta: 'Ver cursos',
      icone:
        '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">'
        + '<path d="M23.3333 3.5H4.66666C3.378 3.5 2.33333 4.54467 2.33333 5.83333V17.5C2.33333 18.7887 3.378 19.8333 4.66666 19.8333H23.3333C24.622 19.8333 25.6667 18.7887 25.6667 17.5V5.83333C25.6667 4.54467 24.622 3.5 23.3333 3.5Z" stroke="#465EFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
        + '<path d="M9.33333 24.5H18.6667" stroke="#465EFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
        + '<path d="M14 19.8333V24.5" stroke="#465EFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
        + '</svg>',
    },
  ];

  const CARDS_CIDADE_CLIMA = [
    {
      href: '#',
      titulo: 'Defina uma cidade',
      descricao: 'Veja as oportunidades específicas da sua região.',
      icone:
        '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">'
        + '<g clip-path="url(#at-cc-clip-cidade)">'
        + '<path d="M14 6.66666C14 11.3333 8 15.3333 8 15.3333C8 15.3333 2 11.3333 2 6.66666C2 5.07536 2.63214 3.54923 3.75736 2.42402C4.88258 1.2988 6.4087 0.666656 8 0.666656C9.5913 0.666656 11.1174 1.2988 12.2426 2.42402C13.3679 3.54923 14 5.07536 14 6.66666Z" stroke="#465EFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
        + '<path d="M8 8.66666C9.10457 8.66666 10 7.77123 10 6.66666C10 5.56209 9.10457 4.66666 8 4.66666C6.89543 4.66666 6 5.56209 6 6.66666C6 7.77123 6.89543 8.66666 8 8.66666Z" stroke="#465EFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
        + '</g>'
        + '<defs><clipPath id="at-cc-clip-cidade"><rect width="16" height="16" fill="white"/></clipPath></defs>'
        + '</svg>',
    },
    {
      href: '#',
      titulo: 'Dados climáticos',
      descricao: 'Veja clima e soluções adaptadas à sua localidade.',
      icone:
        '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">'
        + '<g clip-path="url(#at-cc-clip-clima)">'
        + '<path d="M7.99999 11.3333C9.84094 11.3333 11.3333 9.84094 11.3333 7.99999C11.3333 6.15904 9.84094 4.66666 7.99999 4.66666C6.15904 4.66666 4.66666 6.15904 4.66666 7.99999C4.66666 9.84094 6.15904 11.3333 7.99999 11.3333Z" stroke="#465EFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
        + '<path d="M8 0.666656V1.99999" stroke="#465EFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
        + '<path d="M8 14V15.3333" stroke="#465EFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
        + '<path d="M2.81332 2.81332L3.75999 3.75999" stroke="#465EFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
        + '<path d="M12.24 12.24L13.1867 13.1867" stroke="#465EFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
        + '<path d="M0.666656 8H1.99999" stroke="#465EFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
        + '<path d="M14 8H15.3333" stroke="#465EFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
        + '<path d="M2.81332 13.1867L3.75999 12.24" stroke="#465EFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
        + '<path d="M12.24 3.75999L13.1867 2.81332" stroke="#465EFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
        + '</g>'
        + '<defs><clipPath id="at-cc-clip-clima"><rect width="16" height="16" fill="white"/></clipPath></defs>'
        + '</svg>',
    },
  ];

  function buildCardHtml(card) {
    return (
      '<a class="at-oqvqfh-card" href="' + card.href + '">'
      + '<span class="at-oqvqfh-icon">' + card.icone + '</span>'
      + '<strong class="at-oqvqfh-card-titulo">' + card.titulo + '</strong>'
      + '<p class="at-oqvqfh-card-descricao">' + card.descricao + '</p>'
      + '<span class="at-oqvqfh-cta">' + card.cta + ' <span class="at-oqvqfh-cta-seta">&#8594;</span></span>'
      + '</a>'
    );
  }

  function buildSectionHtml() {
    let cardsHtml = '';
    CARDS.forEach(function (card) {
      cardsHtml += buildCardHtml(card);
    });

    return (
      '<section id="' + SECTION_ID + '" class="at-oqvqfh-section">'
      + '<div class="at-oqvqfh-container">'
      + '<h2 class="at-oqvqfh-titulo">O que você quer fazer hoje?</h2>'
      + '<div class="at-oqvqfh-scroll">' + cardsHtml + '</div>'
      + '</div>'
      + '</section>'
    );
  }

  function buildCardCidadeClimaHtml(card) {
    return (
      '<a class="at-cc-card" href="' + card.href + '">'
      + '<div class="at-cc-header">'
      + '<span class="at-cc-icon">' + card.icone + '</span>'
      + '<strong class="at-cc-titulo">' + card.titulo + '</strong>'
      + '</div>'
      + '<p class="at-cc-descricao">' + card.descricao + '</p>'
      + '<span class="at-cc-seta">&#8594;</span>'
      + '</a>'
    );
  }

  function buildSectionCidadeClimaHtml() {
    let cardsHtml = '';
    CARDS_CIDADE_CLIMA.forEach(function (card) {
      cardsHtml += buildCardCidadeClimaHtml(card);
    });

    return (
      '<section id="' + SECTION_ID_2 + '" class="at-cc-section">'
      + '<div class="at-cc-container">'
      + '<div class="at-cc-scroll">' + cardsHtml + '</div>'
      + '</div>'
      + '</section>'
    );
  }

  function getStyles() {
    return [
      '#' + SECTION_ID + ' {',
      '  padding: 24px 0;',
      '}',
      '#' + SECTION_ID + ' .at-oqvqfh-container {',
      '  max-width: 1200px;',
      '  margin: 0 auto;',
      '  padding: 0 16px;',
      '}',
      '#' + SECTION_ID + ' .at-oqvqfh-titulo {',
      '  font-size: 16px;',
      '  font-weight: 700 !important;',
      '  color: #1A1A1A;',
      '  margin: 0 0 16px 0;',
      '}',
      '#' + SECTION_ID + ' .at-oqvqfh-scroll {',
      '  display: flex;',
      '  gap: 12px;',
      '  overflow-x: auto;',
      '  scrollbar-width: none;',
      '  -webkit-overflow-scrolling: touch;',
      '}',
      '#' + SECTION_ID + ' .at-oqvqfh-scroll::-webkit-scrollbar {',
      '  display: none;',
      '}',
      '#' + SECTION_ID + ' .at-oqvqfh-card {',
      '  flex: 0 0 auto;',
      '  width: 47%;',
      '  box-sizing: border-box;',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: flex-start;',
      '  background-color: #FFFFFF;',
      '  border: 1px solid #E5E7EB;',
      '  border-radius: 12px;',
      '  padding: 20px;',
      '  text-decoration: none;',
      '}',
      '#' + SECTION_ID + ' .at-oqvqfh-icon {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  width: 48px;',
      '  height: 48px;',
      '  border-radius: 10px;',
      '  background-color: #EEF0FF;',
      '  margin-bottom: 12px;',
      '}',
      '#' + SECTION_ID + ' .at-oqvqfh-icon svg {',
      '  width: 22px;',
      '  height: 22px;',
      '}',
      '#' + SECTION_ID + ' .at-oqvqfh-card-titulo {',
      '  font-size: 16px;',
      '  font-weight: 700;',
      '  color: #1A1A1A;',
      '  line-height: 1.3;',
      '}',
      '#' + SECTION_ID + ' .at-oqvqfh-card-descricao {',
      '  font-size: 13px;',
      '  font-weight: 400;',
      '  color: #6B7280;',
      '  line-height: 1.4;',
      '  margin: 4px 0 16px 0;',
      '}',
      '#' + SECTION_ID + ' .at-oqvqfh-cta {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 4px;',
      '  margin-top: auto;',
      '  font-size: 14px;',
      '  font-weight: 700;',
      '  color: #465EFF;',
      '  white-space: nowrap;',
      '}',
      '@media (min-width: 992px) {',
      '  #' + SECTION_ID + ' .at-oqvqfh-titulo {',
      '    font-size: 16px;',
      '  }',
      '  #' + SECTION_ID + ' .at-oqvqfh-card {',
      '    width: 280px;',
      '  }',
      '}',

      '#' + SECTION_ID_2 + ' {',
      '  padding: 0 0 24px 0;',
      '}',
      '#' + SECTION_ID_2 + ' .at-cc-container {',
      '  max-width: 1200px;',
      '  margin: 0 auto;',
      '  padding: 0 16px;',
      '}',
      '#' + SECTION_ID_2 + ' .at-cc-scroll {',
      '  display: flex;',
      '  gap: 12px;',
      '  overflow-x: auto;',
      '  scrollbar-width: none;',
      '  -webkit-overflow-scrolling: touch;',
      '}',
      '#' + SECTION_ID_2 + ' .at-cc-scroll::-webkit-scrollbar {',
      '  display: none;',
      '}',
      '#' + SECTION_ID_2 + ' .at-cc-card {',
      '  position: relative;',
      '  flex: 0 0 auto;',
      '  width: 260px;',
      '  box-sizing: border-box;',
      '  display: block;',
      '  background-color: #FFFFFF;',
      '  border: 1px solid #E5E7EB;',
      '  border-radius: 16px;',
      '  padding: 16px 32px 16px 16px;',
      '  text-decoration: none;',
      '}',
      '#' + SECTION_ID_2 + ' .at-cc-header {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 8px;',
      '  margin-bottom: 4px;',
      '}',
      '#' + SECTION_ID_2 + ' .at-cc-icon {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  flex: 0 0 auto;',
      '  width: 16px;',
      '  height: 16px;',
      '}',
      '#' + SECTION_ID_2 + ' .at-cc-titulo {',
      '  font-size: 14px;',
      '  font-weight: 700;',
      '  color: #465EFF;',
      '  line-height: 1.3;',
      '}',
      '#' + SECTION_ID_2 + ' .at-cc-descricao {',
      '  font-size: 13px;',
      '  font-weight: 400;',
      '  color: #4B4B4B;',
      '  line-height: 1.4;',
      '  margin: 0;',
      '}',
      '#' + SECTION_ID_2 + ' .at-cc-seta {',
      '  position: absolute;',
      '  top: 50%;',
      '  right: 8px;',
      '  transform: translateY(-50%);',
      '  color: #465EFF;',
      '  font-size: 14px;',
      '  font-weight: 700;',
      '}',
      '@media (min-width: 992px) {',
      '  #' + SECTION_ID_2 + ' .at-cc-card {',
      '    width: 320px;',
      '  }',
      '}',
    ].join('\n');
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = getStyles();
    document.head.appendChild(style);
  }

  function findAnchor() {
    const categoriasSection = document.querySelector('[data-testid="' + ANCHOR_TESTID + '"]');
    if (!categoriasSection) return null;
    return categoriasSection.parentElement;
  }

  function addSection() {
    if (document.getElementById(SECTION_ID)) return true;

    const anchor = findAnchor();
    if (!anchor) return false;

    injectStyles();
    anchor.insertAdjacentHTML('afterend', buildSectionHtml());
    return true;
  }

  function addSectionCidadeClima() {
    if (document.getElementById(SECTION_ID_2)) return true;

    const anchor = document.getElementById(SECTION_ID);
    if (!anchor) return false;

    injectStyles();
    anchor.insertAdjacentHTML('afterend', buildSectionCidadeClimaHtml());
    return true;
  }

  function init() {
    const done1 = addSection();
    const done2 = done1 ? addSectionCidadeClima() : false;
    if (done1 && done2) return;

    const pollTimer = setInterval(function () {
      retryCount++;
      const found1 = addSection();
      const found2 = found1 ? addSectionCidadeClima() : false;
      if ((found1 && found2) || retryCount >= MAX_RETRIES) {
        clearInterval(pollTimer);
      }
    }, RETRY_INTERVAL);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
