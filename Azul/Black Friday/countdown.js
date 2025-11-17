// ============================================
// CONFIGURAÇÃO DA DATA FINAL DO COUNTDOWN
// ============================================
// Formato: 'YYYY-MM-DD HH:MM:SS' (horário de Brasília)
// Exemplo: '2024-11-29 23:59:59'
const COUNTDOWN_END_DATE = '2025-11-29 23:59:59';

(function () {
  // Função para obter data atual em Brasília
  function getBrasiliaTime() {
    const now = new Date();
    // Converter para horário de Brasília (UTC-3)
    const brasiliaOffset = -3 * 60; // -3 horas em minutos
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const brasiliaTime = new Date(utc + brasiliaOffset * 60000);
    return brasiliaTime;
  }

  // Função para criar data final em Brasília
  function getEndDate() {
    const [datePart, timePart] = COUNTDOWN_END_DATE.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes, seconds] = timePart.split(':').map(Number);

    // Criar data em UTC e ajustar para Brasília
    const endDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
    // Ajustar para horário de Brasília (UTC-3)
    const brasiliaOffset = -3 * 60;
    const utc = endDate.getTime() - brasiliaOffset * 60000;
    return new Date(utc);
  }

  // Função para calcular diferença
  function calculateTimeRemaining() {
    const now = getBrasiliaTime();
    const end = getEndDate();
    const difference = end - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, expired: false };
  }

  // Função para criar o SVG do logo Azul FRIDAY
  function createLogoSvg() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('width', '129');
    svg.setAttribute('height', '108');
    svg.setAttribute('viewBox', '0 0 129 108');
    svg.setAttribute('fill', 'none');

    const paths = [
      {
        d: 'M109.446 11.1876H99.6921V27.1392C99.6921 32.4175 96.4776 33.796 94.3562 33.796C91.2584 33.796 89.5366 32.4175 89.5366 28.4571V11.1876H79.7852V29.0902C79.7852 36.892 82.25 41.8268 90.8004 41.8268C94.2417 41.8268 98.0287 39.9319 99.8627 36.892H99.9817V40.9669H109.446V11.1899V11.1876Z',
        fill: '#00043E',
      },
      {
        d: 'M111.741 40.9667H121.493V0H111.741V40.9667ZM50.4714 40.9667H78.8099V33.5107H62.865L77.7234 18.5896V11.1897H51.6791V18.6502H65.3321L50.4736 33.3962V40.9689L50.4714 40.9667ZM8.30713 40.9667H19.264L21.8478 33.6229H36.1316L38.6547 40.9667H49.7822L34.4659 0.00224046H23.6235L8.30713 40.9667ZM28.9594 11.3603H29.0761L33.6061 25.7044H24.3126L28.9594 11.3603Z',
        fill: '#00043E',
      },
      {
        d: 'M8.47852 47.1316H25.227V50.7014H13.572V54.7965H24.493V58.3662H13.572V65.8762H8.47852V47.1294V47.1316Z',
        fill: 'white',
      },
      {
        d: 'M27.9595 47.1318H41.5832C46.78 47.1318 47.6464 50.3087 47.6464 52.226C47.6464 54.5093 46.7283 55.9799 44.6002 56.741V56.7926C46.8316 57.1338 47.1728 59.9694 47.1728 61.8082C47.1728 62.7264 47.2514 64.9334 48.1448 65.8786H42.5799C42.1063 65.012 42.0816 64.2509 42.0816 62.2819C42.0816 59.6574 40.9524 58.9995 39.3788 58.9995H33.0529V65.8786H27.9595V47.1318ZM33.0529 55.4275H39.7986C40.9277 55.4275 42.2409 54.7967 42.2409 53.0387C42.2409 51.1753 40.7706 50.7016 39.536 50.7016H33.0529V55.4275Z',
        fill: 'white',
      },
      { d: 'M50.8511 47.1318H55.9453V65.8786H50.8511V47.1318Z', fill: 'white' },
      {
        d: 'M60.04 47.1318H71.722C78.1534 47.1318 80.937 50.861 80.937 56.5052C80.937 62.1494 78.0501 65.8786 72.1687 65.8786H60.04V47.1318ZM65.1335 62.3066H70.8039C74.1644 62.3066 75.6864 60.286 75.6864 56.3211C75.6864 52.8547 74.216 50.7016 70.3302 50.7016H65.1313V62.3066H65.1335Z',
        fill: 'white',
      },
      {
        d: 'M96.7932 62.0192H88.1821L86.6601 65.8786H81.1738L89.4168 47.1318H95.5586L103.802 65.8786H98.3152L96.7932 62.0192ZM92.4877 51.1753L89.547 58.6044H95.4284L92.4877 51.1753Z',
        fill: 'white',
      },
      {
        d: 'M108.083 59.3408L99.7866 47.1318H105.771L110.627 55.2973L115.482 47.1318H121.467L113.17 59.3408V65.8786H108.077V59.3408H108.083Z',
        fill: 'white',
      },
      {
        d: 'M32.8303 78.7903C33.7395 79.8477 34.2917 81.2173 34.2917 82.717V103.538C34.2917 105.148 33.6542 106.61 32.6216 107.694H123.664L129 78.7903H32.8303Z',
        fill: 'white',
      },
      {
        d: 'M43.8758 81.9564C46.5628 81.9564 47.1711 83.427 46.3653 87.2033C45.5594 90.9796 44.3292 92.4501 41.6422 92.4501C38.9551 92.4501 38.3468 90.9796 39.1527 87.2033C39.9586 83.427 41.1887 81.9564 43.8758 81.9564ZM42.0238 90.6675C42.8297 90.6675 43.0699 89.9311 43.649 87.2033C44.2282 84.4732 44.3 83.739 43.4941 83.739C42.6883 83.739 42.4481 84.4754 41.8689 87.2033C41.2897 89.9333 41.2179 90.6675 42.0238 90.6675Z',
        fill: '#00043E',
      },
      {
        d: 'M48.671 82.1547H54.6512L54.1843 84.3032H50.8328L50.4804 86.0275H53.6186L53.1651 88.093H50.0269L49.1492 92.251H46.5205L48.6688 82.1547H48.671Z',
        fill: '#00043E',
      },
      {
        d: 'M55.7553 82.1542H61.7355L61.2686 84.3028H57.9171L57.5646 86.0271H60.7029L60.2494 88.0926H57.1112L56.6869 90.0997H60.1641L59.7107 92.2483H53.6025L55.7508 82.152L55.7553 82.1542Z',
        fill: '#00043E',
      },
      {
        d: 'M63.1082 82.1547H67.223C69.2298 82.1547 69.7551 83.2862 69.4139 84.8421C69.1311 86.1846 68.424 87.0625 67.1803 87.2466V87.2758C68.424 87.388 68.6372 88.194 68.3544 89.5389L68.1703 90.401C68.0581 90.9241 67.9166 91.6021 67.9997 91.8019C68.0423 91.9142 68.0715 92.0287 68.2264 92.114L68.1995 92.2555H65.4002C65.2588 91.7189 65.472 90.7557 65.5551 90.3314L65.6965 89.6534C65.9367 88.5083 65.7818 88.212 65.1443 88.212H64.4507L63.5886 92.2555H60.96L63.1082 82.1591V82.1547ZM64.8345 86.4271H65.3576C66.1073 86.4271 66.5585 85.9467 66.7157 85.226C66.8863 84.4065 66.6304 84.0518 65.8379 84.0518H65.3284L64.8323 86.4271H64.8345Z',
        fill: '#00043E',
      },
      {
        d: 'M72.1042 84.3904H70.124L70.6045 82.1565H77.1939L76.7135 84.3904H74.7333L73.0651 92.2528H70.4361L72.1042 84.3904Z',
        fill: '#00043E',
      },
      {
        d: 'M78.9463 82.1547H82.2551L82.5649 92.251H79.7656L79.8779 90.4841H77.7857L77.1347 92.251H74.3354L78.9441 82.1547H78.9463ZM80.1764 84.2202H80.1495L78.5086 88.5061H79.9789L80.1764 84.2202Z',
        fill: '#00043E',
      },
      {
        d: 'M88.7453 85.0691L88.8015 84.8289C88.9294 84.2339 88.788 83.74 88.2784 83.74C87.7127 83.74 87.3603 84.1778 87.275 84.6313C86.8507 86.6249 91.3471 85.6506 90.5704 89.3415C90.1034 91.4901 88.6466 92.4533 86.3277 92.4533C84.1502 92.4533 83.0907 91.7034 83.5419 89.611L83.6115 89.2585H86.1571L86.1009 89.4987C85.9169 90.3608 86.2132 90.6729 86.7228 90.6729C87.2593 90.6729 87.6566 90.2486 87.7689 89.6963C88.1931 87.7026 83.8674 88.6927 84.6149 85.114C85.0526 83.0777 86.3838 81.9596 88.6017 81.9596C90.8195 81.9596 91.6569 82.907 91.2034 85.0713H88.7431L88.7453 85.0691Z',
        fill: '#00043E',
      },
      {
        d: 'M42.1777 94.5876H45.4866L45.7964 104.684H42.9971L43.1093 102.917H41.0172L40.3662 104.684H37.5669L42.1755 94.5876H42.1777ZM43.4079 96.6531H43.3787L41.74 100.939H43.2104L43.4079 96.6531Z',
        fill: '#00043E',
      },
      {
        d: 'M48.6712 94.5876H51.6119L51.9801 100.809H52.0093L53.3382 94.5876H55.7985L53.6502 104.684H50.7656L50.3414 98.447H50.3122L48.9833 104.684H46.5229L48.6712 94.5876Z',
        fill: '#00043E',
      },
      {
        d: 'M58.1736 96.8235H56.1934L56.6738 94.5896H63.2632L62.7828 96.8235H60.8026L59.1345 104.686H56.5032L58.1713 96.8235H58.1736Z',
        fill: '#00043E',
      },
      {
        d: 'M64.1396 94.5873H70.1198L69.6528 96.7359H66.3013L65.9489 98.4602H69.0872L68.6337 100.526H65.4955L65.0712 102.533H68.5484L68.0949 104.681H61.9868L64.1351 94.5851L64.1396 94.5873Z',
        fill: '#00043E',
      },
      {
        d: 'M74.8746 97.6565C75.1148 96.5115 74.9734 96.1725 74.4638 96.1725C73.6579 96.1725 73.4177 96.9089 72.8385 99.6367C72.2594 102.367 72.1875 103.101 72.9934 103.101C73.6444 103.101 73.8981 102.535 74.3089 100.627H76.8545L76.6996 101.377C76.0913 104.206 74.2954 104.884 72.6141 104.884C69.6576 104.884 69.3187 103.4 70.1246 99.6367C70.9439 95.7751 72.118 94.3899 74.8476 94.3899C77.2227 94.3899 77.8445 95.6337 77.4359 97.5869L77.2945 98.2223H74.7489L74.8768 97.6565H74.8746Z',
        fill: '#00043E',
      },
      { d: 'M79.2716 94.5876H81.9029L79.7543 104.684H77.123L79.2716 94.5876Z', fill: '#00043E' },
      {
        d: 'M83.2306 94.5876H87.1747C89.1838 94.5876 89.8034 95.9302 89.424 97.6994C88.9863 99.7649 87.5855 100.838 85.4507 100.838H84.5303L83.711 104.684H81.0801L83.2284 94.5876H83.2306ZM84.9277 98.9454H85.4238C86.0883 98.9454 86.526 98.5638 86.7101 97.7151C86.8807 96.8799 86.6113 96.4848 85.9468 96.4848H85.453L84.9299 98.9454H84.9277Z',
        fill: '#00043E',
      },
      {
        d: 'M92.3374 94.5876H95.6462L95.956 104.684H93.1568L93.269 102.917H91.1768L90.5258 104.684H87.7266L92.3351 94.5876H92.3374ZM93.5675 96.6531H93.5384L91.8997 100.939H93.37L93.5675 96.6531Z',
        fill: '#00043E',
      },
      {
        d: 'M98.8289 94.5876H102.647C105.687 94.5876 105.334 96.9922 104.769 99.6369C104.203 102.282 103.539 104.686 100.499 104.686H96.6807L98.8289 94.5899V94.5876ZM99.7044 102.791H100.227C101.247 102.791 101.471 102.367 102.05 99.6369C102.629 96.9069 102.587 96.4825 101.57 96.4825H101.047L99.7044 102.789V102.791Z',
        fill: '#00043E',
      },
      {
        d: 'M108.628 94.5876H111.937L112.247 104.684H109.447L109.56 102.917H107.467L106.816 104.684H104.017L108.626 94.5876H108.628ZM109.858 96.6531H109.829L108.19 100.939H109.661L109.858 96.6531Z',
        fill: '#00043E',
      },
      {
        d: 'M118.429 97.5012L118.485 97.261C118.613 96.666 118.472 96.1721 117.962 96.1721C117.397 96.1721 117.044 96.6099 116.959 97.0634C116.535 99.0571 121.031 98.0827 120.254 101.771C119.787 103.92 118.33 104.883 116.012 104.883C113.834 104.883 112.772 104.133 113.226 102.041L113.298 101.686H115.843L115.787 101.926C115.603 102.788 115.899 103.101 116.409 103.101C116.945 103.101 117.343 102.676 117.455 102.124C117.879 100.13 113.553 101.12 114.303 97.5416C114.741 95.5053 116.07 94.3872 118.29 94.3872C120.51 94.3872 121.345 95.3346 120.892 97.4989H118.431L118.429 97.5012Z',
        fill: '#00043E',
      },
      {
        d: 'M28.2597 78.2555H27.3685V79.5936C27.3685 80.5792 26.5694 81.3785 25.5839 81.3785C24.5984 81.3785 23.7993 80.5792 23.7993 79.5936V78.2555H8.92967V79.5936C8.92967 80.5792 8.13051 81.3785 7.14504 81.3785C6.15957 81.3785 5.36042 80.5792 5.36042 79.5936V78.2555H4.46923C2.00443 78.2555 0.00878906 80.2536 0.00878906 82.7165V103.538C0.00878906 106.003 2.00667 107.999 4.46923 107.999H28.262C30.7245 107.999 32.7224 106.001 32.7224 103.538V82.7165C32.7224 80.2514 30.7245 78.2555 28.262 78.2555H28.2597Z',
        fill: '#CF527A',
      },
      {
        d: 'M0.00224358 86.4355V103.539C0.00224358 106.004 2.00012 108 4.46268 108H28.2554C30.7202 108 32.7159 106.002 32.7159 103.539V86.4355H0H0.00224358Z',
        fill: 'white',
      },
      {
        d: 'M28.2581 78.2555H27.3669V79.5936C27.3669 80.5792 26.5677 81.3785 25.5822 81.3785C24.5968 81.3785 23.7976 80.5792 23.7976 79.5936V78.2555H8.92575V79.5936C8.92575 80.5792 8.12661 81.3785 7.14113 81.3785C6.15566 81.3785 5.35651 80.5792 5.35651 79.5936V78.2555H4.46532C2.00052 78.2555 0.00488281 80.2536 0.00488281 82.7165V86.4345H32.7207V82.7165C32.7207 80.2514 30.7229 78.2555 28.2603 78.2555H28.2581Z',
        fill: '#CF527A',
      },
      {
        d: 'M7.14132 75.1311C6.15571 75.1311 5.35645 75.9304 5.35645 76.916V79.5922C5.35645 80.5778 6.15571 81.377 7.14132 81.377C8.12693 81.377 8.92618 80.5778 8.92618 79.5922V76.916C8.92618 75.9304 8.12693 75.1311 7.14132 75.1311Z',
        fill: '#00B4E2',
      },
      {
        d: 'M25.5813 75.1311C24.5956 75.1311 23.7964 75.9304 23.7964 76.916V79.5922C23.7964 80.5778 24.5956 81.377 25.5813 81.377C26.5669 81.377 27.3661 80.5778 27.3661 79.5922V76.916C27.3661 75.9304 26.5669 75.1311 25.5813 75.1311Z',
        fill: '#00B4E2',
      },
      {
        d: 'M13.3697 94.091C12.182 94.091 11.2144 93.1256 11.2144 91.9357C11.2144 90.7458 12.1798 89.7804 13.3697 89.7804C14.5596 89.7804 15.525 90.7458 15.525 91.9357C15.525 93.1256 14.5596 94.091 13.3697 94.091ZM13.3697 91.1297C12.9251 91.1297 12.5614 91.4912 12.5614 91.938C12.5614 92.3847 12.9229 92.7462 13.3697 92.7462C13.8165 92.7462 14.1779 92.3847 14.1779 91.938C14.1779 91.4912 13.8165 91.1297 13.3697 91.1297Z',
        fill: '#CF527A',
      },
      {
        d: 'M19.3372 93.0585C19.915 93.0585 20.3835 92.5901 20.3835 92.0123C20.3835 91.4345 19.915 90.9661 19.3372 90.9661C18.7594 90.9661 18.291 91.4345 18.291 92.0123C18.291 92.5901 18.7594 93.0585 19.3372 93.0585Z',
        fill: '#CF527A',
      },
      {
        d: 'M25.2845 93.0585C25.8623 93.0585 26.3307 92.5901 26.3307 92.0123C26.3307 91.4345 25.8623 90.9661 25.2845 90.9661C24.7067 90.9661 24.2383 91.4345 24.2383 92.0123C24.2383 92.5901 24.7067 93.0585 25.2845 93.0585Z',
        fill: '#CF527A',
      },
      {
        d: 'M7.4388 98.2649C8.01661 98.2649 8.48502 97.7965 8.48502 97.2187C8.48502 96.6409 8.01661 96.1725 7.4388 96.1725C6.86098 96.1725 6.39258 96.6409 6.39258 97.2187C6.39258 97.7965 6.86098 98.2649 7.4388 98.2649Z',
        fill: '#CF527A',
      },
      {
        d: 'M13.388 98.2649C13.9658 98.2649 14.4342 97.7965 14.4342 97.2187C14.4342 96.6409 13.9658 96.1725 13.388 96.1725C12.8102 96.1725 12.3418 96.6409 12.3418 97.2187C12.3418 97.7965 12.8102 98.2649 13.388 98.2649Z',
        fill: '#CF527A',
      },
      {
        d: 'M19.3372 98.2649C19.915 98.2649 20.3835 97.7965 20.3835 97.2187C20.3835 96.6409 19.915 96.1725 19.3372 96.1725C18.7594 96.1725 18.291 96.6409 18.291 97.2187C18.291 97.7965 18.7594 98.2649 19.3372 98.2649Z',
        fill: '#CF527A',
      },
      {
        d: 'M25.2845 98.2649C25.8623 98.2649 26.3307 97.7965 26.3307 97.2187C26.3307 96.6409 25.8623 96.1725 25.2845 96.1725C24.7067 96.1725 24.2383 96.6409 24.2383 97.2187C24.2383 97.7965 24.7067 98.2649 25.2845 98.2649Z',
        fill: '#CF527A',
      },
      {
        d: 'M7.4388 103.469C8.01661 103.469 8.48502 103.001 8.48502 102.423C8.48502 101.845 8.01661 101.377 7.4388 101.377C6.86098 101.377 6.39258 101.845 6.39258 102.423C6.39258 103.001 6.86098 103.469 7.4388 103.469Z',
        fill: '#CF527A',
      },
      {
        d: 'M13.388 103.469C13.9658 103.469 14.4342 103.001 14.4342 102.423C14.4342 101.845 13.9658 101.377 13.388 101.377C12.8102 101.377 12.3418 101.845 12.3418 102.423C12.3418 103.001 12.8102 103.469 13.388 103.469Z',
        fill: '#CF527A',
      },
      {
        d: 'M19.3372 103.469C19.915 103.469 20.3835 103.001 20.3835 102.423C20.3835 101.845 19.915 101.377 19.3372 101.377C18.7594 101.377 18.291 101.845 18.291 102.423C18.291 103.001 18.7594 103.469 19.3372 103.469Z',
        fill: '#CF527A',
      },
    ];

    paths.forEach((pathData) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData.d);
      path.setAttribute('fill', pathData.fill);
      svg.appendChild(path);
    });

    return svg;
  }

  // Função para encontrar o container do header
  function findHeaderContainer() {
    // Buscar todos os containers
    const containers = document.querySelectorAll('.container-capsule.containerDefault');

    for (let i = 0; i < containers.length; i++) {
      const container = containers[i];
      // Verificar se contém um botão com as imagens header-geral
      const button = container.querySelector('button');
      if (button) {
        const images = button.querySelectorAll('img');
        const hasHeaderImages = Array.from(images).some(
          (img) =>
            img.src.includes('header-geral-mobile.png') ||
            img.src.includes('header-geral-desktop.png')
        );
        if (hasHeaderImages) {
          return container;
        }
      }
    }
    return null;
  }

  // Função para criar o banner do countdown
  function createCountdownBanner() {
    // Verificar se o banner já existe
    if (document.getElementById('azul-friday-countdown')) {
      return;
    }

    // Encontrar o container do header
    const headerContainer = findHeaderContainer();
    if (!headerContainer) {
      console.log('Container do header não encontrado, tentando novamente...');
      setTimeout(createCountdownBanner, 500);
      return;
    }

    const banner = document.createElement('div');
    banner.id = 'azul-friday-countdown';
    banner.style.cssText = `
      max-width: 1024px;
      width: 100%;
      border: 0px;
      margin: 0px auto;
      padding: 20px 24px;
      border-radius: 16px;
      background: linear-gradient(0deg, #D8F9FF -63%, #6BD1E3 -19.01%, #56C3E5 24.97%, #008BC4 68.96%, #0061A0 112.95%);
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    `;

    // Lado esquerdo: Logo
    const leftSection = document.createElement('div');
    leftSection.style.cssText = `
      display: flex;
      align-items: center;
      gap: 20px;
    `;

    // Container do logo
    const logoContainer = document.createElement('div');
    logoContainer.style.cssText = `
      display: flex;
      align-items: center;
    `;
    const logoSvg = createLogoSvg();
    logoSvg.style.cssText = 'height: 108px; width: auto;';
    logoContainer.appendChild(logoSvg);

    leftSection.appendChild(logoContainer);

    // Texto "Ofertas por tempo limitado!" (agora diretamente no banner)
    const textContainer = document.createElement('div');
    textContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
    `;

    // Ícone de relógio (SVG)
    const clockIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    clockIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clockIcon.setAttribute('width', '44');
    clockIcon.setAttribute('height', '44');
    clockIcon.setAttribute('viewBox', '0 0 44 44');
    clockIcon.setAttribute('fill', 'none');

    const clockPath1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    clockPath1.setAttribute('d', 'M22 11V22L29.3333 25.6667');
    clockPath1.setAttribute('stroke', 'white');
    clockPath1.setAttribute('stroke-width', '2.66667');
    clockPath1.setAttribute('stroke-linecap', 'round');
    clockPath1.setAttribute('stroke-linejoin', 'round');

    const clockPath2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    clockPath2.setAttribute(
      'd',
      'M22.0003 40.3333C32.1255 40.3333 40.3337 32.1252 40.3337 22C40.3337 11.8747 32.1255 3.66663 22.0003 3.66663C11.8751 3.66663 3.66699 11.8747 3.66699 22C3.66699 32.1252 11.8751 40.3333 22.0003 40.3333Z'
    );
    clockPath2.setAttribute('stroke', 'white');
    clockPath2.setAttribute('stroke-width', '2.66667');
    clockPath2.setAttribute('stroke-linecap', 'round');
    clockPath2.setAttribute('stroke-linejoin', 'round');

    clockIcon.appendChild(clockPath1);
    clockIcon.appendChild(clockPath2);

    const text = document.createElement('span');
    text.textContent = 'Ofertas por tempo limitado!';
    text.style.cssText = `
      color: white;
      font-size: 24px;
      font-weight: 700;
      font-family: sans-serif;
    `;

    textContainer.appendChild(clockIcon);
    textContainer.appendChild(text);

    // Lado direito: Countdown
    const countdownContainer = document.createElement('div');
    countdownContainer.id = 'countdown-display';
    countdownContainer.style.cssText = `
      display: flex;
      gap: 12px;
    `;

    banner.appendChild(leftSection);
    banner.appendChild(textContainer);
    banner.appendChild(countdownContainer);

    // Encontrar a div vazia dentro do container do header para inserir o countdown
    // A estrutura é: container > div > button + div vazia
    const containerInnerDiv = headerContainer.querySelector('div');
    if (containerInnerDiv) {
      // Procurar pela div vazia que vem após o button
      const button = containerInnerDiv.querySelector('button');
      if (button) {
        // Encontrar a próxima div irmã (div vazia)
        let nextDiv = button.nextElementSibling;
        while (nextDiv && nextDiv.tagName !== 'DIV') {
          nextDiv = nextDiv.nextElementSibling;
        }
        if (nextDiv) {
          // Inserir o banner dentro da div vazia
          nextDiv.appendChild(banner);
        } else {
          // Se não encontrar, criar uma nova div e inserir
          const newDiv = document.createElement('div');
          newDiv.appendChild(banner);
          containerInnerDiv.appendChild(newDiv);
        }
      } else {
        // Se não encontrar o button, inserir diretamente na div interna
        containerInnerDiv.appendChild(banner);
      }
    } else {
      // Fallback: inserir após o container do header
      headerContainer.parentElement.insertBefore(banner, headerContainer.nextSibling);
    }

    // Atualizar countdown
    updateCountdown();
  }

  // Função para atualizar o countdown
  function updateCountdown() {
    const countdownContainer = document.getElementById('countdown-display');
    if (!countdownContainer) {
      return;
    }

    const time = calculateTimeRemaining();

    if (time.expired) {
      countdownContainer.innerHTML = `
        <div style="color: white; font-size: 20px; font-weight: 700;">
          Oferta encerrada
        </div>
      `;
      return;
    }

    // Criar boxes para cada unidade de tempo
    const timeUnits = [
      { value: time.days, label: 'Dias' },
      { value: time.hours, label: 'Horas' },
      { value: time.minutes, label: 'Min' },
      { value: time.seconds, label: 'Seg' },
    ];

    countdownContainer.innerHTML = '';

    timeUnits.forEach((unit) => {
      // Container wrapper para cada unidade de tempo
      const unitWrapper = document.createElement('div');
      unitWrapper.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      `;

      // Box do número
      const numberBox = document.createElement('div');
      numberBox.style.cssText = `
        width: 70px;
        height: 60px;
        padding: 12px 16px;
        border-radius: 14px;
        background: rgba(0, 122, 174, 0.25);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.10), 0 4px 6px -4px rgba(0, 0, 0, 0.10);
        display: flex;
        align-items: center;
        justify-content: center;
      `;

      const value = document.createElement('div');
      value.textContent = String(unit.value).padStart(2, '0');
      value.style.cssText = `
        color: white;
        font-size: 32px;
        font-weight: 700;
        font-family: sans-serif;
        line-height: 1;
      `;

      // Label em div separada (fora do box)
      const label = document.createElement('div');
      label.textContent = unit.label;
      label.style.cssText = `
        color: white;
        font-size: 14px;
        font-weight: 500;
        font-family: sans-serif;
        text-align: center;
      `;

      numberBox.appendChild(value);
      unitWrapper.appendChild(numberBox);
      unitWrapper.appendChild(label);
      countdownContainer.appendChild(unitWrapper);
    });
  }

  // Função para inicializar
  function init() {
    createCountdownBanner();

    // Atualizar a cada segundo
    setInterval(() => {
      updateCountdown();
    }, 1000);
  }

  // Aguardar DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
