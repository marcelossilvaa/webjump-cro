 (function() {
        "use strict";
        if (window.beneficiosAquisicao) return;
        window.beneficiosAquisicao = true;

        // Adiciona o estilo customizado
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 761px) {
                .dp-OAC-header {
                    background-color: #fff;
                }

                .dp-OAC-header__box {
                    margin-top: 0vw !important;
                }
            }
        `;
        document.head.appendChild(style);

        let tentativas = 0;
        const maxTentativas = 50; // Máximo de tentativas (5 segundos com intervalo de 100ms)

        let intervalo = setInterval(function() {
            tentativas++;

            let beneficioQuePrecisaSerAlterado = document.querySelector(
                ".dp-OAC-benefits .dp-OAC-benefits__item:has(source[srcset='/ecom/medias/sys_master/public/30732147195934/imagem.png'])"
            );

            if (tentativas >= maxTentativas) {
                clearInterval(intervalo);
                return;
            }

            if (beneficioQuePrecisaSerAlterado) {
                clearInterval(intervalo);

                // Seleciona os elementos dentro do item encontrado
                let h3Element = beneficioQuePrecisaSerAlterado.querySelector(
                    "h3.dp-OAC-benefits__name"
                );
                let pElement = beneficioQuePrecisaSerAlterado.querySelector(
                    "p.dp-OAC-benefits__text"
                );
                let sourceElement =
                    beneficioQuePrecisaSerAlterado.querySelector("picture source");

                // Função para alterar os valores
                function alterarBeneficio(novoH3, novoP, novoSrcset) {
                    if (h3Element && novoH3) {
                        h3Element.textContent = novoH3;
                    }
                    if (pElement && novoP) {
                        pElement.textContent = novoP;
                    }
                    if (sourceElement && novoSrcset) {
                        sourceElement.setAttribute("srcset", novoSrcset);
                    }
                }

                alterarBeneficio(
                    "GANHE 15% OFF* EM CAFÉS",
                    "Novos assinantes garantem benefício de 15% OFF nas 3 primeiras entregas. Oferta válida para primeira Assinatura.",
                    "//ecom/medias/sys_master/public/47625647652894/Arte-para-LP-2.jpg?attachment=true&cimgnr=sOFAg"
                );
            }
        }, 100);
    })();