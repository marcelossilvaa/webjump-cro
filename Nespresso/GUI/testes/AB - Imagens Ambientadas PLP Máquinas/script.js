(function () {
  if (window.imagensMaquinasAB) {
    return;
  }
  window.imagensMaquinasAB = true;
  gtmDataObject = window.gtmDataObject || [];
  gtmDataObject.push({
    event: "adobe_target",
    event_raised_by: "adobe target",
    experiment_id: "${campaign.id}",
    experiment_type: "AB",
    experiment_name: "${campaign.name}",
    experiment_variant_id: "${campaign.recipe.id}",
    experiment_variant: "${campaign.recipe.name}",
  });
  document.head.insertAdjacentHTML(
    "beforeend",
    `<style>
  .nb-sku .cb-image .nb-img img {
    height: 120%!important;
    border-top-right-radius: 15px!important;
    border-top-left-radius: 15px!important;
    margin-top: -10px!important;
}

.nb-sku .cb-content {
  margin-top:20px!important;
}

@media (max-width: 768px) {
    .nb-sku .cb-image .nb-img img {
        height: 142% !important;
        border-top-right-radius: 15px !important;
        border-top-left-radius: 15px !important;
        margin-top: -10px !important;
    }

    .nb-sku .cb-content {
    margin-top: 55px !important;
}
}
</style>`,
  );

  const imageMap = {
    // EssenzaMini
    "EssenzaMiniVermelha-320x320-PLP":
      "https://www.nespresso.com/shared_res/mos/free_html/cl/3_4PlpMaqEne2026/600x400_Machines_OL_Inissia_Roja_Single_v1.jpg",
    "EssenzaMiniVermelha-2000x2000-110v":
      "https://www.nespresso.com/shared_res/mos/free_html/cl/3_4PlpMaqEne2026/600x400_Machines_OL_Inissia_Roja_Single_v1.jpg",
    "EssenzaMiniVermelha-2000x2000-220v":
      "https://www.nespresso.com/shared_res/mos/free_html/cl/3_4PlpMaqEne2026/600x400_Machines_OL_Inissia_Roja_Single_v1.jpg",
    "EssenzaMiniPreta-2000x2000-110v":
      "https://www.nespresso.com/shared_res/mos/free_html/cl/3_4PlpMaqEne2026/600x400_Machines_OL_Inissia_Negra_Single_v1.jpg",
    "EssenzaMiniPreta-2000x2000-220v":
      "https://www.nespresso.com/shared_res/mos/free_html/cl/3_4PlpMaqEne2026/600x400_Machines_OL_Inissia_Negra_Single_v1.jpg",
    // EssenzaMini Preta - ícone cross-sell
    46921760899102:
      "https://www.nespresso.com/shared_res/mos/free_html/cl/3_4PlpMaqEne2026/600x400_Machines_OL_Inissia_Negra_Single_v1.jpg",
    46922707894302:
      "https://www.nespresso.com/shared_res/mos/free_html/cl/3_4PlpMaqEne2026/600x400_Machines_OL_Inissia_Negra_Single_v1.jpg",
    // Pixie
    "M-2082-responsive-plp-image.png":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49524161740830/PixieRoxa-PLP-Ambientada.jpg?",
    "PixieRoxa-2000x2000-110v-TQ":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49524161740830/PixieRoxa-PLP-Ambientada.jpg?",
    PixiePrata:
      "https://www.nespresso.com/shared_res/mos/free_html/cl/3_4PlpMaqEne2026/600x400_Machines_OL_Pixie_Silver_Single_v1.jpg",
    PixieAzul:
      "https://www.nespresso.com/ecom/medias/sys_master/public/49524161675294/PixieAzul-PLP-Ambientada.jpg?",

    // Citiz
    "CitizVermelha-320x320-PLP":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49524161019934/CitizVermelha-PLP-Ambientada-v2.jpg?",
    "CitizVermelha-2000x2000-110v-TQ":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49524161019934/CitizVermelha-PLP-Ambientada-v2.jpg?",
    "Citizvermelha-2000x2000-220v-TQ":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49524161019934/CitizVermelha-PLP-Ambientada-v2.jpg?",
    "CitizPreta-2000x2000-110v-TQ":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49524162101278/CitizPreta-PLP-Ambientada-v2.jpg?",
    "CitizPreta-2000x2000-220v-TQ":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49524162101278/CitizPreta-PLP-Ambientada-v2.jpg?",

    // Citiz Platinum
    "CitizPlatinumAcoInoxidavel-320x320-PLP":
      "https://www.nespresso.com/ecom/medias/sys_master/public/48893843439646/675x450-Maq-OL-Citiz-Silver-Sing.jpg",
    "CitizPlatinumAcoInoxidavel-2000x2000-110v-TQ":
      "https://www.nespresso.com/ecom/medias/sys_master/public/48893843439646/675x450-Maq-OL-Citiz-Silver-Sing.jpg",
    "CitizPlatinumAcoInoxidavel-2000x2000-220v-TQ":
      "https://www.nespresso.com/ecom/medias/sys_master/public/48893843439646/675x450-Maq-OL-Citiz-Silver-Sing.jpg",
    "CitizPlatinumTitan-2000x2000-110v-TQ":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49524167868446/CitizPlatinumTitan-PLP-Ambientada.jpg?",
    "CitizPlatinumTitan-2000x2000-220v-TQ":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49524167868446/CitizPlatinumTitan-PLP-Ambientada.jpg?",

    // EssenzaMini+Aero3
    "EssenzaMiniVermelhaAero3-320x320-PLP":
      "https://www.nespresso.com/shared_res/mos/free_html/cl/3_4PlpMaqEne2026/600x400_Machines_OL_Inissia_Roja_Bundle_v1.jpg",
    "EssenzaMiniVermelhaAero3-2000x2000-110v":
      "https://www.nespresso.com/shared_res/mos/free_html/cl/3_4PlpMaqEne2026/600x400_Machines_OL_Inissia_Roja_Bundle_v1.jpg",
    "EssenzaMiniVermelhaAero3-2000x2000-220v":
      "https://www.nespresso.com/shared_res/mos/free_html/cl/3_4PlpMaqEne2026/600x400_Machines_OL_Inissia_Roja_Bundle_v1.jpg",
    "EssenzaMiniBrancaAero3-2000x2000-110v":
      "https://www.nespresso.com/shared_res/mos/free_html/cl/3_4PlpMaqEne2026/600x400_Machines_OL_Inissia_Blanca_Bundle_v1.jpg",
    "EssenzaMiniBrancaAero3-2000x2000-220v":
      "https://www.nespresso.com/shared_res/mos/free_html/cl/3_4PlpMaqEne2026/600x400_Machines_OL_Inissia_Blanca_Bundle_v1.jpg",

    // Citiz + Aeroccino
    "CitizVermelhaAero3-2000x2000-110v":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49524188872734/CitizAero3-PLP-Ambientada.jpg?",
    "CitizVermelhaAero3-320x320-PLP":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49524188872734/CitizAero3-PLP-Ambientada.jpg?",
    "CitizvermelhaAero3-2000x2000-220v":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49524188872734/CitizAero3-PLP-Ambientada.jpg?",
    "CitizPretaAero3Preto-2000x2000-110v":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49524190478366/CitizPretaAero3-PLP-Ambientada.jpg?",
    "CitizPretaAeo3-2000x2000-220v":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49524190478366/CitizPretaAero3-PLP-Ambientada.jpg?",

    // LattissimaOne
    "LattissimaOne-320x320-PLP":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49526686023710/LattissimaOneBranca-PLP-Ambientada.jpg?",
    "LattissimaOneBranca-2000x2000-110v-TQ":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49526686023710/LattissimaOneBranca-PLP-Ambientada.jpg?",
    "LattissimaOneBranca-2000x2000-220v-TQ":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49526686023710/LattissimaOneBranca-PLP-Ambientada.jpg?",
    "LattissimaOnePreta-2000x2000-110v-TQ":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49526686089246/LattissimaOnePreta-PLP-Ambientada.jpg?",
    "LattissimaOnePreta-2000x2000-220v-TQ":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49526686089246/LattissimaOnePreta-PLP-Ambientada.jpg?",

    //GranLattissima
    "M-2022-ResponsivePLPImage":
      "https://www.nespresso.com/ecom/medias/sys_master/public/47470110539806/60C172-1.jpg",
    "GranLattissimaPreta-2000x2000-110v":
      "https://www.nespresso.com/ecom/medias/sys_master/public/47470110539806/60C172-1.jpg",
    "GranLattissimaPreta-2000x2000-220v":
      "https://www.nespresso.com/ecom/medias/sys_master/public/47470110539806/60C172-1.jpg",

    //Creatista
    "M-0425-Responsive-plp":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49614459306014/CreatistaPlus-PLP-Ambientada.jpg?",

    // Barista
    "barista-frother":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49526691102750/MaquinaBarista-PLP-Ambientada.jpg?",
    "DispBarista-2000x2000-110v-TQ":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49526691102750/MaquinaBarista-PLP-Ambientada.jpg?",
    "DispositivoBarista-2000x2000-220v-TQ":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49526691102750/MaquinaBarista-PLP-Ambientada.jpg?",

    //Vertuo Pop
    "verde-pistache-320x320-Nespresso":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49616435052574/VertuoPopVerdePistache-PLP-Ambientada.jpg?",
    "M-2089-ResponsiveStandard":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49616435052574/VertuoPopVerdePistache-PLP-Ambientada.jpg?",
    "M-2091-ResponsiveStandard":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49616434659358/VertuoPopAmareloSummer-PLP-Ambientada.jpg?",

    //Vertuo Pop + aero3
    "Pop-amareloSummer-320x320-nespresso":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49616446226462/VertuoPopAmareloSummerAero3-PLP-Ambientada.jpg?",
    "2000x2000-yellow":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49616446226462/VertuoPopAmareloSummerAero3-PLP-Ambientada.jpg?",
    "NespressoVertuoPopVerdeAcqua-2000x2000":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49616446488606/VertuoPopVerdeAcquaAero3-PLP-Ambientada.jpg?",
    "NespressoVertuoPopVerdeAcqua-2000x2000":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49616446488606/VertuoPopVerdeAcquaAero3-PLP-Ambientada.jpg?",

    //Vertuo Pop+
    "M-2057-PLPimage-320x320.png":
      "https://www.nespresso.com/shared_res/mos/free_html/cl/3_4PlpMaqEne2026/600x400_Machines_VL_PopPlus_Titan_Single_v1.jpg",
    "Imagem2000x2000-Voltagem-2-":
      "https://www.nespresso.com/shared_res/mos/free_html/cl/3_4PlpMaqEne2026/600x400_Machines_VL_PopPlus_Titan_Single_v1.jpg",
    "Imagem2000x2000-Voltagem-1-":
      "https://www.nespresso.com/shared_res/mos/free_html/cl/3_4PlpMaqEne2026/600x400_Machines_VL_PopPlus_Titan_Single_v1.jpg",
    "color-matte-black-brand-nespresso-view-front-coffee-d-2x":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49621174059038/VertuoPop-PretoFosco-PLP-Ambientada.jpg?",
    "VLPLUSMATT2000x2000-110":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49621174059038/VertuoPop-PretoFosco-PLP-Ambientada.jpg?",
    "VLPLUSMATT2000x2000-220":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49621174059038/VertuoPop-PretoFosco-PLP-Ambientada.jpg?",
    "Imagem2000x2000-Voltagem-VertuoPlusDourada-110":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49621174190110/VertuoPop-PretoDourado-PLP-Ambientada.jpg?",
    "VLPLUSGOLD2000x2000-220":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49621174190110/VertuoPop-PretoDourado-PLP-Ambientada.jpg?",

    // Vertuo Next
    "VertuoNextPretaPLP-320x320":
      "https://www.nespresso.com/shared_res/mos/free_html/cl/3_4PlpMaqEne2026/600x400_Machines_VL_Next_Negra_Single_v1.jpg",
    "VLNEXTPRETA2000x2000-110":
      "https://www.nespresso.com/shared_res/mos/free_html/cl/3_4PlpMaqEne2026/600x400_Machines_VL_Next_Negra_Single_v1.jpg",
    "VLNEXTPRETA2000x2000-220":
      "https://www.nespresso.com/shared_res/mos/free_html/cl/3_4PlpMaqEne2026/600x400_Machines_VL_Next_Negra_Single_v1.jpg",
    "VertuoNextVermelha-2000x2000-110V":
      "https://www.nespresso.com/shared_res/mos/free_html/cl/3_4PlpMaqEne2026/600x400_Machines_VL_Next_Roja_Single_v1.jpg",
    "VertuoNextVermelha-2000x2000-220V":
      "https://www.nespresso.com/shared_res/mos/free_html/cl/3_4PlpMaqEne2026/600x400_Machines_VL_Next_Roja_Single_v1.jpg",
    "VertuoNextChrome-320x320-PLP":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49621174255646/VertuoNextDeluxe-PLP-Ambientada.jpg?",
    "Imagem2000x2000-Voltagem-NextChrome-110":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49621174255646/VertuoNextDeluxe-PLP-Ambientada.jpg?",
    "Imagem2000x2000-Voltagem-NextChrome-220":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49621174255646/VertuoNextDeluxe-PLP-Ambientada.jpg?",

    //Vertuo Next + Aero3

    "VertuoNextPretoFoscoAero3-2000x2000-110v":
      "https://www.nespresso.com/shared_res/mos/free_html/cl/3_4PlpMaqEne2026/600x400_Machines_VL_Next_Negra_Bundle_v1.jpg",
    "VertuoNextPretoFoscoAero3-2000x2000-220v":
      "https://www.nespresso.com/shared_res/mos/free_html/cl/3_4PlpMaqEne2026/600x400_Machines_VL_Next_Negra_Bundle_v1.jpg",
    "CafeteiraNespressoVertuoNextVermelha-Espumadordeleite-2000x2000":
      "https://www.nespresso.com/shared_res/mos/free_html/cl/3_4PlpMaqEne2026/600x400_Machines_VL_Next_Roja_Bundle_v1.jpg",
    "VertuoNextCromada-320x320-PLP":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49621174321182/VertuoNextDeluxeAero3-PLP-Ambientada.jpg?",
    "VertuoNextCromada-2000x2000-110v":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49621174321182/VertuoNextDeluxeAero3-PLP-Ambientada.jpg?",
    "VertuoNextCromada-2000x2000-220v":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49621174321182/VertuoNextDeluxeAero3-PLP-Ambientada.jpg?",

    //Vertuo Lattissima
    "VertuoLattissimaBrancaPLP-320x320":
      "https://www.nespresso.com/shared_res/mos/free_html/cl/3_4PlpMaqEne2026/600x400_Machines_VL_Lattissima_Blanca_Single_v1.jpg",
    "VLLATTISSIMABRANCA2000x2000-110":
      "https://www.nespresso.com/shared_res/mos/free_html/cl/3_4PlpMaqEne2026/600x400_Machines_VL_Lattissima_Blanca_Single_v1.jpg",
    "VLLATTISSIMABRANCA2000x2000-220":
      "https://www.nespresso.com/shared_res/mos/free_html/cl/3_4PlpMaqEne2026/600x400_Machines_VL_Lattissima_Blanca_Single_v1.jpg",
    "VLLATISSIMAPRETA2000x2000-110":
      "https://www.nespresso.com/shared_res/mos/free_html/cl/3_4PlpMaqEne2026/600x400_Machines_VL_Lattissima_Negra_Single_v1.jpg",
    "VLLATISSIMAPRETA2000x2000-220":
      "https://www.nespresso.com/shared_res/mos/free_html/cl/3_4PlpMaqEne2026/600x400_Machines_VL_Lattissima_Negra_Single_v1.jpg",

    //Vertuo Creatista
    "VertuoCreatistaPLP-320x320":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49621174386718/VertuoCreatista-PLP-Ambientada.jpg",
    "VLCREATISTA2000x2000-110":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49621174386718/VertuoCreatista-PLP-Ambientada.jpg",
    "VLCREATISTA2000x2000-220":
      "https://www.nespresso.com/ecom/medias/sys_master/public/49621174386718/VertuoCreatista-PLP-Ambientada.jpg",
  };

  function getAmbientImage(originalSrc) {
    if (!originalSrc) return null;

    for (const key in imageMap) {
      if (originalSrc.includes(key)) {
        return imageMap[key];
      }
    }
    return null;
  }

  function updateImage(img) {
    if (!img.closest("plp-products")) return;
    const productEl = img.closest("nb-sku-machine");
    if (!productEl) return;

    const originalSrc = img.src;
    const newSrc = getAmbientImage(originalSrc);

    if (!newSrc) return;

    if (img.src !== newSrc) {
      img.src = newSrc;

      // ?? Retry para evitar overwrite do site
      setTimeout(() => {
        if (img.src !== newSrc) {
          img.src = newSrc;
          console.log("?? Reaplicando imagem:", newSrc);
        }
      }, 300);
    }
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes" && mutation.attributeName === "src") {
        const img = mutation.target;
        if (img.tagName === "IMG") {
          updateImage(img);
        }
      }

      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;

          if (node.tagName === "IMG") {
            updateImage(node);
          }

          const imgs = node.querySelectorAll && node.querySelectorAll("img");
          if (imgs) {
            imgs.forEach(updateImage);
          }
        });
      }
    });
  });

  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["src"],
  });

  // ?? inicial + retry (IMPORTANTE)
  function init() {
    document
      .querySelectorAll("plp-products nb-sku-machine img")
      .forEach(updateImage);
  }

  init();

  // ?? roda de novo depois (sites dinâmicos)
  setTimeout(init, 500);
  setTimeout(init, 1200);
})();
