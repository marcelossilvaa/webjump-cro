(function () {
  "use strict";
  const selector = "#block-8831091004917";
  const maxAttempts = 50;
  const intervalTime = 100;

  let attempts = 0;

  const intervalId = setInterval(function () {
    attempts++;

    const element = document.querySelector(selector);
    if (element) {
      clearInterval(intervalId);
      element.insertAdjacentHTML(
        "beforebegin",
        `<!-- tag 1 -->
            <liveshop-ads-carousel-v2 height="500px" use-active-videos-from="nespresso"></liveshop-ads-carousel-v2>
        <!-- tag 2 -->
        <liveshop-ads-carousel height="auto" width="100%" stories-style="true" border-radius="25px" slugs-video="TQnXTkMR,bTM4ZMgs"></liveshop-ads-carousel>`
      );
    } else if (attempts >= maxAttempts) {
      clearInterval(intervalId);
    }
  }, intervalTime);
})();
