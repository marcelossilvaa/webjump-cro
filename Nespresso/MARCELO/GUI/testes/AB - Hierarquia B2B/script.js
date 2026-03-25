(function(){
    function main(){
        const MAX_TENTATIVAS = 20; // Número máximo de tentativas
        const INTERVALO_MS = 200; // Intervalo
        let tentativas = 0;
        
        const intervalId = setInterval(() => {
            tentativas++;
            
            let componenteHierarquia = document.querySelector("nb-usp-images[heading='Benefícios de contratar sua assinatura ']");
            let elementoBefore = document.querySelector("nb-text-chunk[heading*='Como funciona']");
            let produtosElement = document.querySelector("nb-tabbed-product-details");
            let productAfterElement = document.querySelector("nb-container[slot*='Uma experiência completa']");
            

            let hasProductCards = produtosElement && produtosElement.querySelector("nb-plp-product-card");
            
            if(componenteHierarquia && elementoBefore && produtosElement && productAfterElement && hasProductCards){
                elementoBefore.insertAdjacentElement("beforebegin", componenteHierarquia);
                clearInterval(intervalId);
                return;
            }
            
            // Se atingiu o número máximo de tentativas, encerra
            if(tentativas >= MAX_TENTATIVAS){
                clearInterval(intervalId);
            }
        }, INTERVALO_MS);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function() {
            main();
        });
    } else {
        main();
    }
})();