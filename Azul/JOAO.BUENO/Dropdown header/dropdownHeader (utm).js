(function() {
  let intervalId;
  function initDropdown() {
  const ofertaLink = document.querySelector('a.css-rzbquv[href*="/ofertas"]');
  if (!ofertaLink) return;
 const ofertaUrl = new URL(ofertaLink.href, window.location.origin);
ofertaUrl.searchParams.set('utm_linkcategory', 'ofertas-variante');
ofertaLink.href = ofertaUrl.toString();
  clearInterval(intervalId);

  const wrapper = ofertaLink.parentElement;
  wrapper.style.position = 'relative';

  const dropdown = document.createElement('div');
  dropdown.className = 'azul-target-dropdown';
  dropdown.innerHTML = `
    <ul>
      <li>
        <a href="https://www.voeazul.com.br/br/pt/ofertas?utm_linkcategory=passagens#passagens">
          <img src="https://i.imgur.com/pmpo1mX.png" alt="" />
          Passagens
        </a>
      </li>
      <li>
        <a href="https://www.voeazul.com.br/br/pt/ofertas?utm_linkcategory=viagem#viagem">
          <img src="https://i.imgur.com/EHUnuFI.png" alt="" />
          Viagens Completas
        </a>
      </li>
      <li>
        <a href="https://www.voeazul.com.br/br/pt/ofertas?utm_linkcategory=pontos#pontos">
          <img src="https://i.imgur.com/YT6ttE7.png" alt="" />
          Pontos e Parceiros
        </a>
      </li>
    </ul>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .azul-target-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      background: #ffffff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      padding: 4px 0;
      display: none;
      z-index: 1000;
      border-radius: 8px;
      min-width: 180px;
      min-height: 140px;
    }
    .azul-target-dropdown ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .azul-target-dropdown li a {
      display: block;
      padding: 10px 16px;
      color: #606060;
      text-decoration: none;
      white-space: nowrap;
    }
      .azul-target-dropdown li a img {
      width: 24px;
      height: 24px;
      margin-right: 8px;
      display: inline-block;
    }
    .azul-target-dropdown li a:hover {
      background:rgba(17, 41, 76, 0.05);
    }
  `;
  document.head.appendChild(style);
  wrapper.appendChild(dropdown);

  wrapper.addEventListener('mouseenter', () => dropdown.style.display = 'block');
  wrapper.addEventListener('mouseleave', () => dropdown.style.display = 'none');
}
 intervalId = setInterval(initDropdown, 500);
})();