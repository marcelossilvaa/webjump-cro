!function(){if(!(window.personalizacaoMaquinas||540<=window.innerWidth)){(gtmDataObject=window.gtmDataObject||[]).push({event:"adobe_target",event_raised_by:"adobe target",experiment_id:"${campaign.id}",experiment_type:"AB",experiment_name:"${campaign.name}",experiment_variant_id:"${campaign.recipe.id}",experiment_variant:"${campaign.recipe.name}"}),window.personalizacaoMaquinas=!0;function t(){const a=document.createElement("div");a.className="maquinas-cards";return[{tag:"OFERTA",title:"Novo na Nespresso?",description:"",price:"40% OFF",subtext:" na compra da sua primeira máquina",buttontext:"Garanta seu desconto",href:"https://www.nespresso.com/br/pt/promocao-cafeteira-nespresso",image:"https://www.nespresso.com/ecom/medias/sys_master/public/44080333783070/DescontoNovosMembros.png?"},{tag:"OFERTA",title:"Cliente Nespresso?",description:"Compre Essenza Mini ou Vertuo Pop com até 45% OFF e ganhe ",price:"R$150",subtext:" de crédito",buttontext:"Confira",image:"https://www.nespresso.com/ecom/medias/sys_master/public/44080333717534/DescontoMaquinasExistentes.png?"}].forEach(function(e){a.appendChild(function(e){var a=document.createElement("a");a.className="maquina-card",e.href&&(a.href=e.href);var t=document.createElement("span"),t=(t.className="maquina-card__tag",t.textContent=e.tag,a.appendChild(t),document.createElement("div")),n=(t.className="maquina-card__content",document.createElement("img")),i=(n.className="maquina-card__image",n.src=e.image,n.alt=e.title,document.createElement("div")),o=(i.className="maquina-card__text",document.createElement("h3")),r=(o.className="maquina-card__title",o.textContent=e.title,document.createElement("p")),c=(r.className="maquina-card__description",document.createElement("button"));{var d;c.className="maquina-card__cta",c.textContent=e.buttontext,e.price?("Cliente Nespresso?"===e.title?(r.appendChild(document.createTextNode("Compre Essenza Mini ou Vertuo Pop com até ")),(d=document.createElement("span")).className="maquina-card__price",d.textContent="45% OFF",r.appendChild(d),r.appendChild(document.createTextNode(" e ganhe ")),(d=document.createElement("span")).className="maquina-card__price",d.textContent=e.price,r.appendChild(d)):(r.appendChild(document.createTextNode(e.description)),(d=document.createElement("span")).className="maquina-card__price",d.textContent=e.price,r.appendChild(d)),r.appendChild(document.createTextNode(e.subtext))):r.textContent=e.description}return i.appendChild(o),i.appendChild(r),i.appendChild(c),t.appendChild(n),t.appendChild(i),a.appendChild(t),a}(e))}),a}function e(){document.head.insertAdjacentHTML("beforeend",`<style>
      #BR-Sticky-ofertamaquinas_35offaberto{
          display:none;
      }
        .maquinas-cards {
            display: flex;
            flex-direction: row;
            gap: 13px;
            max-width: 800px;
            margin: 0 auto;
            font-family: "NespressoLucas", Arial, sans-serif;
            margin-bottom: 8px;
            padding: 0 15px;
        }
        .maquina-card {
            border: 1px solid #e4e4e4;
            border-radius: 2px;
            padding: 15px;
            text-decoration: none;
            position: relative;
            display: block;
            background: #fff;
            flex: 1;
            min-width: 0;
        }
        .maquina-card__content {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .maquina-card__image {
            width: 80px;
            height: auto;
            object-fit: contain;
        }
        .maquina-card__text {
            flex: 1;
            min-width: 0;
        }
        .maquina-card__tag {
            position: absolute;
            top: -10px;
            left: 0;
            background: #000;
            color: #fff;
            padding: 1px 8px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            border-radius: 4px;
        }
        .maquina-card__title {
            font-size: 14px;
            color: #000;
            margin: 0 0 4px;
            font-weight: 600;
        }
        .maquina-card__description {
            margin: 0;
            font-size: 13px;
            color: #666;
            line-height: 1.1;
        }
        .maquina-card__price {
            color: #000;
            font-weight: 700;
        }
        button.maquina-card__cta {
            background: #ffffff;
            color: #000;
            border: 1px solid #000;
            padding: 2px 12px;
            border-radius: 16px;
            margin-top: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        @media screen and (min-width: 541px) {
            button.maquina-card__cta:hover {
                background: #000;
                color: #fff;
            }
            .maquinas-cards{
              margin-bottom:70px;
              margin-top: -38px;
            }
        }
        @media screen and (max-width: 540px) {
            .maquinas-cards {
                flex-direction: column;
                max-width: 350px;
            }
        }
    </style>`);var e,a=document.querySelector("nb-text-chunk[heading]");a&&(e=t(),a.insertAdjacentElement("afterend",e),document.querySelectorAll("a.maquina-card").forEach(function(a,t){a.addEventListener("click",function(){var e;e=a.className+"_"+(0==t?"desconto":"credito"),window.gtmDataObject||(window.gtmDataObject=[]),window.gtmDataObject.push({event:"local_event",event_raised_by:"br",local_event_category:"user engagement",local_event_action:"click",local_event_label:e}),0!=t&&(e=document.querySelector(".plp-category--title"))&&(e=e.getBoundingClientRect().top+window.pageYOffset-50,window.scrollTo({top:e,behavior:"smooth"}))})}))}"loading"===document.readyState?document.addEventListener("DOMContentLoaded",e):e()}}();