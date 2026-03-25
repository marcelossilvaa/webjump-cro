(function () {
  "use strict";

  var POPUP_ID = "at-btq-tambore-popup";
  var STORAGE_KEY = "at-btq-tambore-dismissed";
  // Substitua pela URL real da imagem hospedada
  var IMAGE_URL = "https://iili.io/qWxu7Pn.jpg";

  if (document.getElementById(POPUP_ID + "-overlay")) return;
  if (sessionStorage.getItem(STORAGE_KEY)) return;

  var css =
    "<style>" +
    "#" +
    POPUP_ID +
    "-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.6);z-index:9999;display:flex;align-items:center;justify-content:center;animation:atBtqFadeIn .3s ease;}" +
    "#" +
    POPUP_ID +
    "{position:relative;max-width:400px;width:90%;border-radius:12px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.35);animation:atBtqSlideUp .4s ease;}" +
    "#" +
    POPUP_ID +
    " img{display:block;width:100%;height:auto;}" +
    "#" +
    POPUP_ID +
    "-close{position:absolute;top:8px;right:8px;width:32px;height:32px;border:none;background:rgba(0,0,0,.5);color:#fff;font-size:20px;line-height:32px;text-align:center;border-radius:50%;cursor:pointer;z-index:1;transition:background .2s;padding:0;}" +
    "#" +
    POPUP_ID +
    "-close:hover{background:rgba(0,0,0,.8);}" +
    "@keyframes atBtqFadeIn{from{opacity:0}to{opacity:1}}" +
    "@keyframes atBtqSlideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}" +
    "</style>";

  document.head.insertAdjacentHTML("beforeend", css);

  var overlay = document.createElement("div");
  overlay.id = POPUP_ID + "-overlay";
  overlay.innerHTML =
    '<div id="' +
    POPUP_ID +
    '">' +
    '<button id="' +
    POPUP_ID +
    '-close" aria-label="Fechar">&times;</button>' +
    '<img src="' +
    IMAGE_URL +
    '" alt="Nova Boutique Nespresso - Shopping Tamboré, Barueri - SP">' +
    "</div>";

  document.body.appendChild(overlay);

  function closePopup() {
    var el = document.getElementById(POPUP_ID + "-overlay");
    if (el) {
      el.style.animation = "atBtqFadeIn .2s ease reverse";
      setTimeout(function () {
        el.remove();
      }, 200);
    }
    sessionStorage.setItem(STORAGE_KEY, "1");
  }

  document
    .getElementById(POPUP_ID + "-close")
    .addEventListener("click", closePopup);

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closePopup();
  });
})();
