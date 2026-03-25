(function () {
  if (document.readyState == "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  function init() {
    let newBannerHTML = `<div class="newBannerContainer"><div class="newBannerAssinatura"><a class="crieAssinaturaCTA" href="https://www.nespresso.com/br/pt/myaccount/standing-orders#/orders/list">Crie sua assinatura</a></div></div>`;
    let bannerLocation = document.querySelector(".dp-OAC-header");
    let newCSS = `<style>
        .dp-OAC-header{
            display: none !important;
        }

        .newBannerContainer {
            width: 100%;
            display: block;
        }
        .newBannerAssinatura {
            width: 100%;
            height: 400px; /* Ajuste a altura conforme necessário */
            background-image: url('https://www.nespresso.com/ecom/medias/sys_master/public/45236324565022/Main-Banner-Desk-3840x720-Convers-o.jpg?attachment=true&cimgnr=aA0Tl');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            position:relative;
        }
        .newBannerContainer .crieAssinaturaCTA{
            position:absolute;
            left:27%;
            bottom:50px;
            font-family:"NespressoLucas",sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 16px 24px;
            height: 48px;
            background: #257A57;
            border-radius: 48px;
            border: 0px solid;
            color: #fff !important;
            text-transform: uppercase;
            box-sizing: border-box;
            font-style: normal;
            font-weight: 500;
            font-size: 16px;
            line-height: 16px;
            letter-spacing: 1px;
            text-decoration: none !important;
        }
       
        @media screen and (max-width: 1024px) {
            .newBannerAssinatura {
                background-image: url('https://www.nespresso.com/ecom/medias/sys_master/public/45236324696094/imagem-5-.jpg?attachment=true&cimgnr=KUoxp');
                height:600px;
            }
            .newBannerContainer .crieAssinaturaCTA{
                bottom:40px;
                left:25vw;
            }
        }
        @media screen and (min-width: 768px) and (max-width: 1024px) {
            .dp-OAC-header{
                display: none !important;
            }
            .newBannerAssinatura {
                height:790px;
            }    
            .newBannerContainer .crieAssinaturaCTA{
                left:35%;
            }
        }
        /* Small Desktop */
        @media screen and (min-width: 1025px) and (max-width: 1366px) {
            /* Laptops e desktops pequenos */
            .newBannerContainer .crieAssinaturaCTA{
                left: 18%;
            }
        }

        /* Medium Desktop */
        @media screen and (min-width: 1367px) and (max-width: 1920px) {
            /* Desktops padrão */
            .newBannerContainer .crieAssinaturaCTA{
                left:27%;
            }
        }

        /* Large Desktop */
        @media screen and (min-width: 1921px) and (max-width: 2560px) {
            /* Desktops grandes */
            .newBannerContainer .crieAssinaturaCTA{
                left:27%;
            }
        }

        /* Extra Large Desktop */
        @media screen and (min-width: 2561px) {
            /* 4K e monitores muito grandes */
            .newBannerContainer .crieAssinaturaCTA{
                left:27%;
            }
        }

    </style>`;
    if (bannerLocation) {
      bannerLocation.insertAdjacentHTML("beforebegin", newBannerHTML);
      document.head.insertAdjacentHTML("beforeend", newCSS);
    }
  }
})();
