(function () {
  "use strict";

  const STYLE_ID = "at-o-que-procura-blue-style";
  const CLICK_ATTR = "data-oqp-click-added";
  const ICON_ATTR = "data-oqp-icon-swapped";
  const PAGE_BODY_CLASS = "category-loja";
  const CONTAINER_SELECTOR =
    ".categories-most-accessed .slider-wrapper-categories";
  const MAX_RETRIES = 40;
  const RETRY_INTERVAL = 250;

  const ICON_ARMAZENAGEM =
    "data:image/svg+xml;base64,PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KDTwhLS0gVXBsb2FkZWQgdG86IFNWRyBSZXBvLCB3d3cuc3ZncmVwby5jb20sIFRyYW5zZm9ybWVkIGJ5OiBTVkcgUmVwbyBNaXhlciBUb29scyAtLT4KPHN2ZyBmaWxsPSIjZmFmYTcxIiB3aWR0aD0iODAwcHgiIGhlaWdodD0iODAwcHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBzdHJva2U9IiNmYWZhNzEiIHN0cm9rZS13aWR0aD0iMC4wMDAyNDAwMDAwMDAwMDAwMDAwMyI+Cg08ZyBpZD0iU1ZHUmVwb19iZ0NhcnJpZXIiIHN0cm9rZS13aWR0aD0iMCIvPgoNPGcgaWQ9IlNWR1JlcG9fdHJhY2VyQ2FycmllciIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cg08ZyBpZD0iU1ZHUmVwb19pY29uQ2FycmllciI+Cg08cGF0aCBkPSJNOC41LDJDMTEuODUsMiAxNC42LDQuNTMgMTQuOTYsNy43OEwyMiwxMlYxNEwyMCwxMi44VjIySDE4VjExLjZMMTUsOS44VjIySDEzVjlINFYyMkgyVjguNUE2LjUsNi41IDAgMCwxIDguNSwyTTguNSw0QzYuNTQsNCA0Ljg3LDUuMjUgNC4yNiw3SDEyLjc0QzEyLjEzLDUuMjUgMTAuNDYsNCA4LjUsNE02LDExSDExVjEzSDZWMTFNNiwxNUgxMVYxN0g2VjE1TTYsMTlIMTFWMjFINlYxOVoiLz4KDTwvZz4KDTwvc3ZnPg==";

  const ICON_PECAS =
    "data:image/svg+xml;base64,PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KDTwhLS0gVXBsb2FkZWQgdG86IFNWRyBSZXBvLCB3d3cuc3ZncmVwby5jb20sIFRyYW5zZm9ybWVkIGJ5OiBTVkcgUmVwbyBNaXhlciBUb29scyAtLT4KPHN2ZyB3aWR0aD0iODAwcHgiIGhlaWdodD0iODAwcHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBzdHJva2U9IiNmYWZhNzEiPgoNPGcgaWQ9IlNWR1JlcG9fYmdDYXJyaWVyIiBzdHJva2Utd2lkdGg9IjAiLz4KDTxnIGlkPSJTVkdSZXBvX3RyYWNlckNhcnJpZXIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgoNPGcgaWQ9IlNWR1JlcG9faWNvbkNhcnJpZXIiPiA8cGF0aCBkPSJNNiA2TDEwLjUgMTAuNU02IDZIM0wyIDNMMyAyTDYgM1Y2Wk0xOS4yNTkgMi43NDEwMUwxNi42MzE0IDUuMzY4NjNDMTYuMjM1NCA1Ljc2NDY1IDE2LjAzNzMgNS45NjI2NSAxNS45NjMyIDYuMTkwOThDMTUuODk3OSA2LjM5MTgzIDE1Ljg5NzkgNi42MDgxNyAxNS45NjMyIDYuODA5MDJDMTYuMDM3MyA3LjAzNzM1IDE2LjIzNTQgNy4yMzUzNSAxNi42MzE0IDcuNjMxMzdMMTYuODY4NiA3Ljg2ODYzQzE3LjI2NDYgOC4yNjQ2NSAxNy40NjI3IDguNDYyNjUgMTcuNjkxIDguNTM2ODRDMTcuODkxOCA4LjYwMjEgMTguMTA4MiA4LjYwMjEgMTguMzA5IDguNTM2ODRDMTguNTM3MyA4LjQ2MjY1IDE4LjczNTQgOC4yNjQ2NSAxOS4xMzE0IDcuODY4NjNMMjEuNTg5MyA1LjQxMDcyQzIxLjg1NCA2LjA1NDg4IDIyIDYuNzYwMzkgMjIgNy41QzIyIDEwLjUzNzYgMTkuNTM3NiAxMyAxNi41IDEzQzE2LjEzMzggMTMgMTUuNzc1OSAxMi45NjQyIDE1LjQyOTggMTIuODk1OUMxNC45NDM2IDEyLjgwMDEgMTQuNzAwNSAxMi43NTIxIDE0LjU1MzIgMTIuNzY2OEMxNC4zOTY1IDEyLjc4MjQgMTQuMzE5MyAxMi44MDU5IDE0LjE4MDUgMTIuODgwMkMxNC4wNDk5IDEyLjk1MDEgMTMuOTE5IDEzLjA4MSAxMy42NTcgMTMuMzQzTDYuNSAyMC41QzUuNjcxNTcgMjEuMzI4NCA0LjMyODQzIDIxLjMyODQgMy41IDIwLjVDMi42NzE1NyAxOS42NzE2IDIuNjcxNTcgMTguMzI4NCAzLjUgMTcuNUwxMC42NTcgMTAuMzQzQzEwLjkxOSAxMC4wODEgMTEuMDQ5OSA5Ljk1MDA1IDExLjExOTggOS44MTk0OUMxMS4xOTQxIDkuNjgwNjggMTEuMjE3NiA5LjYwMzQ3IDExLjIzMzIgOS40NDY4MUMxMS4yNDc5IDkuMjk5NDUgMTEuMTk5OSA5LjA1NjM4IDExLjEwNDEgOC41NzAyNEMxMS4wMzU4IDguMjI0MDYgMTEgNy44NjYyMSAxMSA3LjVDMTEgNC40NjI0MyAxMy40NjI0IDIgMTYuNSAyQzE3LjUwNTUgMiAxOC40NDggMi4yNjk4MiAxOS4yNTkgMi43NDEwMVpNMTIuMDAwMSAxNC45OTk5TDE3LjUgMjAuNDk5OUMxOC4zMjg0IDIxLjMyODMgMTkuNjcxNiAyMS4zMjgzIDIwLjUgMjAuNDk5OUMyMS4zMjg0IDE5LjY3MTUgMjEuMzI4NCAxOC4zMjgzIDIwLjUgMTcuNDk5OUwxNS45NzUzIDEyLjk3NTNDMTUuNjU1IDEyLjk0NSAxNS4zNDI3IDEyLjg4NzIgMTUuMDQwOCAxMi44MDQzQzE0LjY1MTcgMTIuNjk3NSAxNC4yMjQ5IDEyLjc3NTEgMTMuOTM5NyAxMy4wNjAzTDEyLjAwMDEgMTQuOTk5OVoiIHN0cm9rZT0iI2ZhZmE3MSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4gPC9nPgoNPC9zdmc+";

  const ICON_IRRIGACAO =
    "data:image/svg+xml;base64,PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KDTwhLS0gVXBsb2FkZWQgdG86IFNWRyBSZXBvLCB3d3cuc3ZncmVwby5jb20sIFRyYW5zZm9ybWVkIGJ5OiBTVkcgUmVwbyBNaXhlciBUb29scyAtLT4KPHN2ZyBmaWxsPSIjZmFmYTcxIiB3aWR0aD0iODAwcHgiIGhlaWdodD0iODAwcHgiIHZpZXdCb3g9IjAgMCA1NiA1NiIgaWQ9IkxheWVyXzEiIHZlcnNpb249IjEuMSIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgc3Ryb2tlPSIjZmFmYTcxIj4KDTxnIGlkPSJTVkdSZXBvX2JnQ2FycmllciIgc3Ryb2tlLXdpZHRoPSIwIi8+Cg08ZyBpZD0iU1ZHUmVwb190cmFjZXJDYXJyaWVyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KDTxnIGlkPSJTVkdSZXBvX2ljb25DYXJyaWVyIj4gPGc+IDxwYXRoIGQ9Ik00OS42LDM0LjR2LTcuOWMwLTQuMi0zLjQtNy41LTcuNS03LjVIMjYuNHYtNC4yaC0yLjVWOS43SDI4VjNIMTMuMnY2LjdoNC4xdjUuMWgtMy45VjE5SDVWNS4xSDNWMTl2MTFWNDRoMlYzMGg1LjcgYzEuNiwzLjYsNS4yLDYsOS4yLDZzNy42LTIuNCw5LjItNmg5LjV2NC40aC0zLjR2N0g1M3YtN0g0OS42eiBNMTUuMiw3LjdWNUgyNnYyLjdoLTIuMWgtNi43SDE1LjJ6IE0xOS4zLDkuN2gyLjd2NS4xaC0yLjdWOS43eiBNMjcuNywyOGwtMC4yLDAuN2MtMS4xLDMuMi00LjEsNS4zLTcuNSw1LjNzLTYuNC0yLjEtNy41LTUuM0wxMi4xLDI4SDV2LTdoMTAuNHYtNC4yaDEuOXYwaDYuN3YwaDAuNVYyMWgxNy43IGMzLjEsMCw1LjUsMi41LDUuNSw1LjV2Ny45aC03VjI4SDI3Ljd6IE01MSwzOS40SDM3LjJ2LTNINTFWMzkuNHoiLz4gPHBhdGggZD0iTTQ0LjEsNDMuM2wtMC44LDFjLTAuNywwLjgtMi44LDMuNi0yLjgsNS4yYzAsMiwxLjYsMy42LDMuNiwzLjZzMy42LTEuNiwzLjYtMy42YzAtMS42LTIuMS00LjQtMi44LTUuMkw0NC4xLDQzLjN6IE00NC4xLDUxYy0wLjksMC0xLjYtMC43LTEuNi0xLjZjMC0wLjUsMC43LTEuNywxLjYtMi45YzAuOCwxLjIsMS42LDIuNCwxLjYsMi45QzQ1LjYsNTAuMyw0NSw1MSw0NC4xLDUxeiIvPiA8L2c+IDwvZz4KDTwvc3ZnPg==";

  const ICON_SERVICOS =
    "data:image/svg+xml;base64,PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KDTwhLS0gVXBsb2FkZWQgdG86IFNWRyBSZXBvLCB3d3cuc3ZncmVwby5jb20sIFRyYW5zZm9ybWVkIGJ5OiBTVkcgUmVwbyBNaXhlciBUb29scyAtLT4KPHN2ZyBmaWxsPSIjZmFmYTcxIiB3aWR0aD0iODAwcHgiIGhlaWdodD0iODAwcHgiIHZpZXdCb3g9IjAgMCA1NiA1NiIgaWQ9IkxheWVyXzEiIHZlcnNpb249IjEuMSIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgc3Ryb2tlPSIjZmFmYTcxIj4KDTxnIGlkPSJTVkdSZXBvX2JnQ2FycmllciIgc3Ryb2tlLXdpZHRoPSIwIi8+Cg08ZyBpZD0iU1ZHUmVwb190cmFjZXJDYXJyaWVyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KDTxnIGlkPSJTVkdSZXBvX2ljb25DYXJyaWVyIj4gPGc+IDxwYXRoIGQ9Ik01MC43LDMxLjdjLTEuNy0wLjUtMy42LTAuNS01LjQsMC4xbC02LjIsMmMtMC4xLTAuNC0wLjQtMC45LTAuOS0xLjRjLTEtMS4xLTIuNi0xLjgtNC4yLTEuOGgtNS4zYy0wLjMsMC0wLjctMC4xLTAuOS0wLjMgYy0zLjktMy4zLTguNC0xLjgtOS43LTEuMmMtMC4zLDAuMS0wLjYsMC4zLTAuOCwwLjVsLTYuMSw1LjFjLTAuNS0wLjUtMS4yLTAuOS0xLjktMWMtMC45LTAuMS0xLjgsMC4xLTIuNiwwLjdsLTIuMywxLjcgYy0xLjUsMS4yLTEuOCwzLjMtMC43LDQuOWw4LDEwLjZjMC42LDAuNywxLjQsMS4yLDIuMywxLjNjMC4yLDAsMC4zLDAsMC41LDBjMC43LDAsMS41LTAuMiwyLjEtMC43bDIuMy0xLjcgYzEuMi0wLjksMS43LTIuNiwxLjEtMy45bDEuMi0wLjljMC4zLTAuMiwwLjYtMC4zLDAuOS0wLjNsMTEuMy0wLjJjMiwwLDQtMC42LDUuOC0xLjZsMTEuNi02LjdjMC42LTAuMywyLjQtMS41LDIuMi0zLjEgQzUyLjksMzIuOCw1Mi4xLDMyLjEsNTAuNywzMS43eiBNMTcuNiw0OC45bC0yLjMsMS43QzE1LDUwLjksMTQuNiw1MSwxNC4zLDUxYy0wLjQtMC4xLTAuNy0wLjMtMS0wLjZsLTgtMTAuNiBjLTAuNS0wLjYtMC40LTEuNiwwLjMtMi4xTDcuOSwzNmMwLjMtMC4yLDAuNi0wLjMsMC45LTAuM2MwLjEsMCwwLjEsMCwwLjIsMGMwLjQsMC4xLDAuNywwLjIsMC45LDAuNWw1LjYsNy40bDIuNSwzLjIgQzE4LjQsNDcuNSwxOC4zLDQ4LjUsMTcuNiw0OC45eiBNNDkuOCwzNS4xbC0xMS42LDYuN2MtMS41LDAuOC0zLjEsMS4zLTQuOCwxLjNMMjIsNDMuM2MtMC44LDAtMS41LDAuMy0yLjEsMC43bC0xLDAuOGwtMi4zLTMgbC00LjItNS42bDYuMS01LjFjMC4xLTAuMSwwLjItMC4xLDAuMy0wLjJjMS0wLjQsNC42LTEuNyw3LjYsMC45YzAuNiwwLjUsMS40LDAuOCwyLjIsMC44aDUuM2MxLjEsMCwyLjEsMC40LDIuOCwxLjEgYzAuMiwwLjMsMC41LDAuNywwLjUsMWMwLDAuMi0wLjMsMC44LTEuOSwxLjVoLTcuNmMtMC42LDAtMSwwLjQtMSwxczAuNCwxLDEsMWg4LjFsMC4yLTAuMWMxLjUtMC43LDIuNC0xLjQsMi45LTIuMmw3LjEtMi4yIGMxLjQtMC41LDIuOS0wLjUsNC4yLTAuMWMwLjYsMC4yLDAuOCwwLjMsMC45LDAuNEM1MC45LDM0LjMsNTAuMywzNC44LDQ5LjgsMzUuMXoiLz4gPHBhdGggZD0iTTkuMSwzOC4xbC0xLjgsMS4zYy0wLjQsMC4zLTAuNSwxLTAuMiwxLjRjMC4yLDAuMywwLjUsMC40LDAuOCwwLjRjMC4yLDAsMC40LTAuMSwwLjYtMC4ybDEuOC0xLjNjMC40LTAuMywwLjUtMSwwLjItMS40IEMxMC4xLDM3LjgsOS41LDM3LjcsOS4xLDM4LjF6Ii8+IDxwYXRoIGQ9Ik0yNy4yLDE0YzEuNywxLjQsNCwxLjcsNS45LDEuN2MxLjEsMCwyLjItMC4xLDIuOS0wLjN2Ni4yYy0zLjcsMC41LTYuNiwzLjQtNi42LDYuOHYxaDE1Ljd2LTFjMC0zLjYtMy4yLTYuNS03LjItNi44di03LjIgYzEuNCwwLjYsMy42LDEuMyw1LjgsMS4zYzEsMCwyLTAuMSwyLjktMC41YzQuMi0xLjcsNS42LTcuNiw1LjctNy45YzAuMS0wLjQtMC4xLTAuOC0wLjQtMS4xYy0wLjItMC4xLTUuNC0zLjMtOS42LTEuNiBjLTIuMiwwLjktMy45LDMtNC45LDQuOEMzNyw3LjgsMzYuMSw2LDM0LjUsNC44Yy0zLjctMy05LjgtMS4zLTEwLjEtMS4yYy0wLjQsMC4xLTAuNywwLjUtMC43LDAuOUMyMy43LDQuOCwyMy40LDExLjEsMjcuMiwxNHogTTQzLDI3LjVIMzEuNWMwLjYtMi4yLDIuOS0zLjksNS43LTMuOUM0MC4xLDIzLjYsNDIuNSwyNS4zLDQzLDI3LjV6IE00My4xLDYuNmMyLjUtMSw1LjgsMC40LDcuMSwxLjFjLTAuNSwxLjUtMS44LDQuNy00LjMsNS44IGMwLDAsMCwwLDAsMGMtMiwwLjgtNC41LDAuMi02LjMtMC41bDcuMi0yLjhjMC40LTAuMiwwLjYtMC41LDAuNi0wLjljMC0wLjEsMC0wLjItMC4xLTAuNGMtMC4yLTAuNS0wLjgtMC44LTEuMy0wLjZsLTcuMiwyLjggQzM5LjcsOS40LDQxLjEsNy40LDQzLjEsNi42eiBNMzMuMyw2LjNjMS44LDEuNCwyLjQsNCwyLjYsNS44bC02LjMtNWMtMC40LTAuMy0xLjEtMC4zLTEuNCwwLjJjLTAuMSwwLjItMC4yLDAuNC0wLjIsMC42IGMwLDAuMywwLjEsMC42LDAuNCwwLjhsNi4zLDVjLTEuOCwwLjItNC40LDAuMi02LjItMS4yYy0yLjMtMS44LTIuNi01LjUtMi43LTcuMUMyNy4zLDUsMzEsNC41LDMzLjMsNi4zeiIvPiA8L2c+IDwvZz4KDTwvc3ZnPg==";

  const ICON_MAP = {
    Tratores: "https://broto.com.br/media/wysiwyg/tratores_2.svg",
    Máquinas: "https://broto.com.br/media/wysiwyg/maquinas_2.svg",
    Implementos: "https://broto.com.br/media/wysiwyg/implementos_2.svg",
    Serviços: ICON_SERVICOS,
    Irrigação: ICON_IRRIGACAO,
    "Armazenagem e Infraestrutura": ICON_ARMAZENAGEM,
    Peças: ICON_PECAS,
    Insumos: "https://broto.com.br/media/wysiwyg/insumos_2.svg",
    Energia: "https://broto.com.br/media/wysiwyg/energia_2.svg",
    "Produtos usados": "https://broto.com.br/media/wysiwyg/produtos-usados.svg",
    "Agricultura de precisão":
      "https://broto.com.br/media/wysiwyg/agricultura-precisao.svg",
  };

  const LONG_TITLE_ATTR = "data-oqp-long-title";
  const LONG_TITLES = ["Armazenagem e Infraestrutura"];

  let viewLogged = false;
  let retryCount = 0;
  let pollTimer = null;

  function getCss() {
    return [
      ".categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item {",
      "  background-color: #465EFF !important;",
      "  border: none !important;",
      "  border-radius: 0.25rem !important;",
      "  box-sizing: border-box !important;",
      "  overflow: hidden !important;",
      "}",

      ".categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item a {",
      "  box-sizing: border-box !important;",
      "}",

      ".categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item .slider-item-image::before {",
      "  display: none !important;",
      "}",

      ".categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item .slider-item-image {",
      "  background-color: transparent !important;",
      "  border: none !important;",
      "  border-radius: 0 !important;",
      "}",

      ".categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item .slider-item-title {",
      "  position: static !important;",
      "  top: auto !important;",
      "  bottom: auto !important;",
      "  left: auto !important;",
      "  right: auto !important;",
      "  opacity: 1 !important;",
      "  overflow: visible !important;",
      "  width: auto !important;",
      "  display: block !important;",
      "}",

      ".categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item .slider-item-title p {",
      "  color: #FFFFFF !important;",
      '  font-family: "Inter Variable", "Helvetica Neue", Helvetica, Arial, sans-serif !important;',
      "  font-weight: 400 !important;",
      "  margin: 0 !important;",
      "  overflow-wrap: normal !important;",
      "  word-break: keep-all !important;",
      "  hyphens: none !important;",
      "}",

      ".categories-most-accessed .slider-wrapper-categories .slider-footer {",
      "  display: none !important;",
      "}",

      "@media (max-width: 767px) {",
      "  .categories-most-accessed {",
      "    padding: 0px 0 !important;",
      "  }",

      "  .categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group {",
      "    padding-right: 16px !important;",
      "  }",

      "  .categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item {",
      "    width: 158px !important;",
      "    height: 58px !important;",
      "    margin-right: 8px !important;",
      "  }",

      "  .categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item a {",
      "    flex-direction: row !important;",
      "    align-items: center !important;",
      "    gap: 13px !important;",
      "    padding: 0px 11px !important;",
      "    width: 100% !important;",
      "    height: 100% !important;",
      "  }",

      "  .categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item .slider-item-image {",
      "    width: 20px !important;",
      "    height: 20px !important;",
      "    min-height: 20px !important;",
      "    max-height: none !important;",
      "    margin: 0 !important;",
      "    flex-shrink: 0 !important;",
      "  }",

      "  .categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item .slider-item-image img {",
      "    width: 20px !important;",
      "    height: 20px !important;",
      "  }",

      "  .categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item .slider-item-title {",
      "    padding: 0 !important;",
      "    min-height: auto !important;",
      "    height: auto !important;",
      "  }",

      "  .categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item .slider-item-title p {",
      "    font-size: 14px !important;",
      "    line-height: 16px !important;",
      "    text-align: left !important;",
      "    white-space: normal !important;",
      "  }",
      "}",

      "@media (min-width: 768px) {",
      "  .categories-most-accessed {",
      "    padding: 10px 0 !important;",
      "  }",

      "  .categories-most-accessed .slider-arrow.next {",
      "    right: -5px !important;",
      "  }",

      "  .categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item {",
      "    width: 118.06px !important;",
      "    height: 120px !important;",
      "    margin-right: 16px !important;",
      "  }",

      "  .categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item a {",
      "    flex-direction: column !important;",
      "    align-items: flex-start !important;",
      "    justify-content: space-between !important;",
      "    gap: 8px !important;",
      "    padding: 16px !important;",
      "    width: 100% !important;",
      "    height: 100% !important;",
      "  }",

      "  .categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item .slider-item-image {",
      "    width: 32px !important;",
      "    height: 32px !important;",
      "    min-height: 32px !important;",
      "    max-height: none !important;",
      "    margin: 0 !important;",
      "    flex-shrink: 0 !important;",
      "  }",

      "  .categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item .slider-item-image img {",
      "    width: 32px !important;",
      "    height: 32px !important;",
      "  }",

      "  .categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item .slider-item-title {",
      "    padding: 0 !important;",
      "    min-height: auto !important;",
      "    height: auto !important;",
      "  }",

      "  .categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item .slider-item-title p {",
      "    font-size: 14px !important;",
      "    line-height: 1.25rem !important;",
      "    text-align: left !important;",
      "    white-space: normal !important;",
      "  }",

      "  .categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item[" +
        LONG_TITLE_ATTR +
        "] .slider-item-title p {",
      "    font-size: 13px !important;",
      "    line-height: 1.25rem !important;",
      "  }",

      "  .categories-most-accessed .slider-wrapper-categories .pagebuilder-column-group .slider-item[" +
        LONG_TITLE_ATTR +
        "] a {",
      "    padding-left: 8px !important;",
      "    padding-right: 8px !important;",
      "  }",

      "  .categories-most-accessed .slider-wrapper-categories .oqp-keep-together {",
      "    white-space: nowrap !important;",
      "  }",
      "}",

      "@media (max-width: 767px) {",
      "  .categories-most-accessed .slider-wrapper-categories .oqp-keep-together {",
      "    white-space: normal !important;",
      "  }",
      "}",
    ].join("\n");
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = getCss();
    document.head.appendChild(style);

    console.log(
      "[AT O que voce procura] Estilo azul aplicado aos cards do carrossel",
    );
  }

  function trackView() {
    if (viewLogged) return;
    viewLogged = true;
    console.log(
      "[AT O que voce procura] Secao com novo layout azul visualizada",
    );
  }

  function handleCardClick(event) {
    const titleEl = event.currentTarget.querySelector(".slider-item-title p");
    const label = titleEl ? titleEl.textContent : "desconhecido";
    console.log("[AT O que voce procura] Clique no card: " + label);
  }

  function addClickTracking(container) {
    const links = container.querySelectorAll(".slider-item a");

    links.forEach(function (link) {
      if (link.getAttribute(CLICK_ATTR)) return;
      link.setAttribute(CLICK_ATTR, "true");
      link.addEventListener("click", handleCardClick);
    });
  }

  function replaceIcons(container) {
    const links = container.querySelectorAll(".slider-item a");

    links.forEach(function (link) {
      const img = link.querySelector(".slider-item-image img");
      if (!img || img.getAttribute(ICON_ATTR)) return;

      const title = link.getAttribute("title") || "";
      const newSrc = ICON_MAP[title];

      img.setAttribute(ICON_ATTR, "true");

      if (newSrc) {
        img.src = newSrc;
      } else {
        console.warn(
          '[AT O que voce procura] Sem icone novo mapeado para "' +
            title +
            '", mantendo o icone original',
        );
      }
    });
  }

  function markLongTitles(container) {
    const links = container.querySelectorAll(".slider-item a");

    links.forEach(function (link) {
      const item = link.closest(".slider-item");
      if (!item) return;

      const title = link.getAttribute("title") || "";
      if (LONG_TITLES.indexOf(title) === -1) return;

      item.setAttribute(LONG_TITLE_ATTR, "true");

      const titleP = link.querySelector(".slider-item-title p");
      if (!titleP || titleP.getAttribute(LONG_TITLE_ATTR)) return;

      titleP.setAttribute(LONG_TITLE_ATTR, "true");
      titleP.innerHTML =
        '<span class="oqp-keep-together">Armazenagem e</span> Infraestrutura';
    });
  }

  function triggerCarouselReflow() {
    window.dispatchEvent(new Event("resize"));
    setTimeout(function () {
      window.dispatchEvent(new Event("resize"));
    }, 150);
  }

  function run() {
    const container = document.querySelector(CONTAINER_SELECTOR);
    if (!container) return false;

    injectStyles();
    trackView();
    addClickTracking(container);
    replaceIcons(container);
    markLongTitles(container);
    triggerCarouselReflow();
    return true;
  }

  function init() {
    if (!document.body.classList.contains(PAGE_BODY_CLASS)) {
      console.log(
        "[AT O que voce procura] Pagina nao e /loja.html (sem classe " +
          PAGE_BODY_CLASS +
          "), script ignorado",
      );
      return;
    }

    if (run()) return;

    pollTimer = setInterval(function () {
      retryCount++;
      const found = run();
      if (found || retryCount >= MAX_RETRIES) {
        clearInterval(pollTimer);
        if (!found) {
          console.warn(
            "[AT O que voce procura] Container " +
              CONTAINER_SELECTOR +
              " nao encontrado apos " +
              MAX_RETRIES +
              " tentativas",
          );
        }
      }
    }, RETRY_INTERVAL);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
