(function() {
  
  function initDropdown() {
  const ofertaLink = document.querySelector('a.css-rzbquv[href*="/ofertas"]');
  if (!ofertaLink) return;
  clearInterval(intervalId);

  ofertaLink.addEventListener('click', () => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "local_event",
      event_raised_by: "adobe_target",
      local_event_category: "main-menu",
      local_event_action: "clique-ofertas",
      local_event_label: "Ofertas"
    });
  }); 
  ofertaLink.addEventListener('click', () => {
  window.utag_data = window.utag_data || {};
  Object.assign(window.utag_data, {
    tealium_event:        "clique-ofertas",
    local_event_category: "main-menu",
    local_event_action:   "clique-ofertas",
    local_event_label:    "Ofertas"
  });
  window.utag && window.utag.link && window.utag.link(window.utag_data);
});

  const wrapper = ofertaLink.parentElement;
  wrapper.style.position = 'relative';

  const dropdown = document.createElement('div');
  dropdown.className = 'azul-target-dropdown';
  dropdown.innerHTML = `
    <ul>
      <li>
        <a href="https://www.voeazul.com.br/br/pt/ofertas#passagens">
          <img src="https://i.imgur.com/pmpo1mX.png" alt="" />
          Passagens
        </a>
      </li>
      <li>
        <a href="https://www.voeazul.com.br/br/pt/ofertas#viagem">
          <img src="https://i.imgur.com/EHUnuFI.png" alt="" />
          Viagens Completas
        </a>
      </li>
      <li>
        <a href="https://www.voeazul.com.br/br/pt/ofertas#pontos">
          <img src="https://i.imgur.com/YT6ttE7.png" alt="" />
          Pontos e Parceiros
        </a>
      </li>
    </ul>
  `;

  dropdown.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function() {
      const label = this.textContent.trim();
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "local_event",
        event_raised_by: "webjump",
        local_event_category: "main-menu",
        local_event_action: "clique-ofertas",
        local_event_label: label
      });
    });
  });

  dropdown.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function() {
      const label = this.textContent.trim();
      window.utag_data = window.utag_data || {};
      Object.assign(window.utag_data, {
        tealium_event:        "clique-ofertas",
        local_event_category: "main-menu",
        local_event_action:   "clique-ofertas",
        local_event_label:    label
      });
      window.utag && window.utag.link && window.utag.link(window.utag_data);
    });
  });

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
      min-height: 140px
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
const intervalId = setInterval(initDropdown, 500);
})();