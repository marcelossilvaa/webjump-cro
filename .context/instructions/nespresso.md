# Analytics Nespresso

## Identificacao do experimento AB/XT (Adobe Target)

O push de identificacao do teste AB/XT e configurado e aplicado **separadamente** pelo Adobe Target, em uma atividade propria (normalmente um arquivo `GA4.js` ou `GA4.html` dedicado). **NAO inclua este trecho nos scripts de funcionalidade/CRO**. Ele e apenas referencia:

```javascript
// REFERENCIA — aplicado separadamente via Adobe Target, NAO incluir nos scripts
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
```

## Evento de interacao personalizado (OBRIGATORIO nos scripts)

Todo script Nespresso que contenha acoes do usuario (cliques, visualizacoes, interacoes) **deve obrigatoriamente** incluir a funcao `sendGAEvent` e chama-la nos eventos relevantes. Esta e a unica forma padrao de enviar eventos para o GA4 via GTM no projeto Nespresso.

```javascript
function sendGAEvent(label) {
  window.gtmDataObject = window.gtmDataObject || [];
  gtmDataObject.push({
    event: "local_event",
    event_raised_by: "br",
    local_event_category: "user engagement",
    local_event_action: "click",
    local_event_label: label,
  });
}
```

### Campos

| Campo                  | Regra                                                                         |
| ---------------------- | ----------------------------------------------------------------------------- |
| `event`                | Sempre `"local_event"` — NAO alterar                                          |
| `event_raised_by`      | Codigo do pais (`"br"`)                                                       |
| `local_event_category` | Categoria livre em lowercase (ex: `"user engagement"`, `"pop-in-app-day"`)    |
| `local_event_action`   | Acao livre em lowercase (ex: `"click"`, `"view"`, `"Display push"`)           |
| `local_event_label`    | Label descritivo do elemento (ex: `"clicou_cta_banner"`, SKU, id do botao)    |

### Variacao com action dinamico

Quando a categoria e fixa da campanha e a acao varia, use dois parametros:

```javascript
function sendGAEvent(action, label) {
  window.gtmDataObject = window.gtmDataObject || [];
  gtmDataObject.push({
    event: "local_event",
    event_raised_by: "br",
    local_event_category: "nome-da-campanha",
    local_event_action: action,
    local_event_label: label,
  });
}
```

### Convencoes de nomenclatura para labels

- Pop-ins: `visualizou_comunicacao_*`, `clicou_comunicacao_*`, `fechou_comunicacao_*`
- Accordions: `abriu_accordion`, `fechou_accordion`
- Menus/botoes: usar o `id` do elemento ou nome descritivo
- Tudo em **lowercase** separado por `_`

## Debug no site Nespresso (obrigatorio)

No front da Nespresso **nao e possivel ver o retorno de `console.log`**. A saida nao aparece no DevTools. Nao use `console.log` para inspecionar dados, APIs ou falhas.

Alternativas oficiais:

1. **`window.alert(texto)`** — unico log nativo visivel. Use para resumo curto.
2. **Modal / UI criada pelo script** — dump completo (JSON, campos do cliente, pedidos). Preferivel para coleta.
3. **Botao Copiar** (`navigator.clipboard.writeText`) — enviar o dump para o chat. Se o clipboard falhar, cair em `window.alert`.

```javascript
// ERRADO — nao aparece no site Nespresso
console.log(customer);

// CORRETO — visivel
window.alert('linha=' + linha + ' ticket=' + ticketMedio);
```

Script pronto de inspecao (modal + copiar + alert): `Nespresso/MARCELO/debug-audiencia/inspecionar-audiencia.js`.

# Nespresso API

## Verificar informações de um SKU específico

```
window.napi.catalog().getProduct('sku');
```

Exemplo de resultado:

```
{
    "modelType": "Capsule",
    "id": "erp.br.b2c/prod/7919.90",
    "legacyId": "7919.90",
    "internationalId": "7919.90",
    "nesoaProductId": "erp.br.b2c/prod/7919.90",
    "name": "Festive Espresso",
    "urlFriendlyName": "capsula-cafe-black-espresso-original",
    "internationalName": "Festive Espresso OL",
    "headline": "Cápsula de café com notas de cereais e frutas",
    "description": "<div id=\"ProductDetails\" class=\"ProductDetails\"></div><style type=\"text/css\">.ProductDetails:not(:empty) {min-height: 4000px} @media(min-width:768px){.ProductDetails:not(:empty){min-height: 4592px}}</style>",
    "mobileDescription": "<p><br /> Torra: ■■■□□ <br /> Acidez: ■■■□□ <br /> Amargor: ■■■□□ <br /> Corpo: ■■■□□ <br /> <br /> <strong>Melhor servido como:</strong>&nbsp;Espresso 40 ml<br /> <br />Intensidade: ■■■■■■■□□□□□□ 7 de 13<br /> &nbsp;</p> <p>Vivencie a jornada encantada do Festive Espresso. Este blend requintado de caf&eacute;s Ar&aacute;bica africanos, de Ruanda, da Rep&uacute;blica Democr&aacute;tica do Congo e do Qu&ecirc;nia, oferece uma sinfonia arom&aacute;tica de notas de cereais e de frutas, real&ccedil;adas por toques sutis de madeira. Seja degustado puro ou como um Cappuccino, deixe que este Espresso transporte voc&ecirc; para um mundo de encantamento.</p> <p>&nbsp;</p> <p>Ref.: 7919.90</p>",
    "rootCategory": "capsules_original",
    "category": "Edição Limitada",
    "supercategories": [
        "bmVzY2x1YjIuYnIuYjJjL2NhdC9vcmlnaW5hbA==",
        "bmVzY2x1YjIuYnIuYjJjL2NhdC9wcm9kdWN0cy1jYXBzdWxl",
        "bmVzY2x1YjIuYnIuYjJjL2NhdC9jYXBzdWxlLWFyb21hdGljLWNlcmVhbA==",
        "bmVzY2x1YjIuYnIuYjJjL2NhdC9yZWNpcGUtY2Fwc3VsZS1hcm9tYXRpYy1jZXJlYWw=",
        "bmVzY2x1YjIuYnIuYjJjL2NhdC9jYXBzdWxlLWN1cFNpemUtZXNwcmVzc28=",
        "bmVzY2x1YjIuYnIuYjJjL2NhdC9jYXBzdWxlLWFyb21hdGljLWZydWl0eQ==",
        "bmVzY2x1YjIuYnIuYjJjL2NhdC9yZWNpcGUtY2Fwc3VsZS1hcm9tYXRpYy1mcnVpdHk=",
        "bmVzY2x1YjIuYnIuYjJjL2NhdC9jYXBzdWxlLWFyb21hdGljLXdvb2R5",
        "bmVzY2x1YjIuYnIuYjJjL2NhdC9yZWNpcGUtY2Fwc3VsZS1hcm9tYXRpYy13b29keQ==",
        "bmVzY2x1YjIuYnIuYjJjL2NhdC9jYXBzdWxlc0xpbWl0ZWRFZGl0aW9ucw==",
        "bmVzY2x1YjIuYnIuYjJjL2NhdC9jYXBzdWxlLXJhbmdlLWxpbWl0ZWQtZWRpdGlvbg==",
        "bmVzY2x1YjIuYnIuYjJjL2NhdC9jYXBzdWxlLXJhbmdlLWxhYmVsLWxpbWl0ZWQtZWRpdGlvbg==",
        "bmVzY2x1YjIuYnIuYjJjL2NhdC9jYXBzdWxlLXJhbmdlLWxhYmVsLTQwbWw="
    ],
    "images": {
        "modelType": "CapsuleImages",
        "icon": "/ecom/medias/sys_master/public/45772110495774.png",
        "main": "/ecom/medias/sys_master/public/45772098961438/C-1350-OL-Product-684x378.jpg",
        "carousel": "/ecom/medias/sys_master/public/45772104302622/C-1350-OL-MediaRecipeCarousel.png",
        "foreground": "/ecom/medias/sys_master/public/45772101451806/C-1350-OL-MediaRecipeForeground.png",
        "cardBackground": "/ecom/medias/sys_master/public/45772104990750/C-1350-OL-MediaRecipeCardBackground.jpg"
    },
    "mobileImages": {
        "modelType": "Images",
        "icon": "/mobile/media/get/8872841871410/{deviceProfile}/1759785162177",
        "main": "/mobile/media/get/8872842002482/{deviceProfile}/1759785162466"
    },
    "responsiveImages": {
        "standard": "/ecom/medias/sys_master/public/46287587999774/C-1350-OL-ResponsiveStandard-1-.png",
        "plp": "/ecom/medias/sys_master/public/45772094013470/C-1350-PLP-320x320.png"
    },
    "ingredients": [
        {
            "type": "DESCRIPTION",
            "text": "Café torrado moído"
        },
        {
            "type": "TITLE",
            "text": "Não contém glúten"
        },
        {
            "type": "DESCRIPTION",
            "text": "Contém 10 cápsulas de café"
        },
        {
            "type": "TITLE",
            "text": "Fabricado na Suíça"
        },
        {
            "type": "DESCRIPTION",
            "text": "Ao utilizar as cápsulas, preserve as embalagens originais para eventuais consultas sobre o produto. Atendimento ao cliente: 0800 7777 737"
        }
    ],
    "pdpURLs": {
        "opr": "https://www.nespresso.com/br/pt/product/capsula-cafe-black-espresso-original",
        "desktop": "https://www.nespresso.com/br/pt/order/capsules/original/capsula-cafe-black-espresso-original",
        "mobile": "https://www.nespresso.com/mobile/br/pt/products/Capsule/Festive-Espresso/p/capsula-cafe-black-espresso-original"
    },
    "unitQuantity": 1,
    "salesMultiple": 10,
    "quantities": [
        0,
        10,
        20,
        30,
        40,
        50,
        60,
        70,
        80,
        90,
        100,
        110,
        120,
        130,
        140,
        150,
        160,
        170,
        180,
        190,
        200,
        210,
        220,
        230,
        240,
        250,
        260,
        270,
        280,
        290,
        300,
        310,
        320,
        330,
        340,
        350,
        360,
        370,
        380,
        390,
        400,
        410,
        420,
        430,
        440,
        450,
        460,
        470,
        480,
        490,
        500,
        510,
        520,
        530,
        540,
        550,
        560,
        570,
        580,
        590,
        600,
        610,
        620,
        630,
        640,
        650,
        660,
        670,
        680,
        690,
        700,
        710,
        720,
        730,
        740,
        750,
        760,
        770,
        780,
        790,
        800,
        810,
        820,
        830,
        840,
        850,
        860,
        870,
        880,
        890,
        900,
        910,
        920,
        930,
        940,
        950,
        960,
        970,
        980,
        990,
        1000,
        1100,
        1200,
        1300,
        1400,
        1500
    ],
    "maxOrderQuantity": 0,
    "technologies": [
        "nesclub2.br.b2c/machineTechno/original"
    ],
    "replacementTechnologies": [
        "nesclub2.br.b2c/machineTechno/original"
    ],
    "comingSoon": false,
    "productSelections": [
        "10",
        "14",
        "60",
        "61",
        "62",
        "63",
        "64",
        "65",
        "66",
        "67",
        "1020",
        "2000",
        "2602",
        "4241",
        "5452",
        "5486",
        "5525",
        "5677",
        "5843",
        "5854",
        "6037",
        "6049"
    ],
    "type": "capsule",
    "slides": [
        {
            "url": "/ecom/medias/sys_master/public/45772094636062/C-1350-OL-ResponsivePDPMain.png",
            "focalPoint": "CENTER_CENTER",
            "type": "IMAGE",
            "mediaProvider": "internal"
        }
    ],
    "displayEcoTax": false,
    "highlightLabel": {
        "id": "BR_Label_LimitedEdition",
        "text": "EDIÇÃO LIMITADA",
        "textColor": "#FFFFFF",
        "backgroundColor": "#ec6a37"
    },
    "highlightLabels": [],
    "relatedProducts": [
        {
            "relationType": "CROSSELLING",
            "products": [
                "erp.br.b2c/prod/3594-BRA-BK",
                "erp.br.b2c/prod/134505",
                "erp.br.b2c/prod/3795"
            ]
        },
        {
            "relationType": "SIMILAR",
            "products": [
                "erp.br.b2c/prod/7907.90"
            ]
        }
    ],
    "priceDisplay": "ALL",
    "enabledUiFeatures": [],
    "mediaGallery": [],
    "seo": {
        "description": "Cápsula de Café Nespresso Festive Espresso café arábica com notas de cereais e frutas amarelas. Confira!"
    },
    "isOrderable": true,
    "gtin": "7630099220077",
    "groupedProducts": [],
    "bundled": false,
    "capsuleProperties": {
        "intensity": 7,
        "bitterness": 3,
        "acidity": 3,
        "roastLevel": 3,
        "body": 3
    },
    "capsuleProductAromatics": [
        "CEREAIS",
        "AMADEIRADO",
        "FRUTADO"
    ],
    "thirdLineQuantities": [
        100,
        150,
        200,
        250,
        300
    ],
    "originDescription": "Este blend excepcional de cafés Arábica é originário de importantes regiões produtoras de café da África, em especial Ruanda, Quênia e Congo. Ele tem um perfil aromático cativante, caracterizado por uma combinação harmoniosa de notas de cereais e de frutas. ",
    "aromaticProfileDescription": "Uma xícara deliciosamente harmoniosa, com notas de cereais, frutas maduras e caramelo, lindamente complementada por toques sutis de madeira.",
    "roastingDescription": "A maior parte do café neste split roasting passa por um processo de torra mais longo, resultando em uma cor média, enquanto a parte restante passa por uma torra mais curta e mais intensa, que produz uma cor mais escura.",
    "capsuleCupSizes": [
        "Espresso"
    ],
    "capsuleCupSizesDetails": [
        {
            "id": "espresso",
            "name": "Espresso",
            "capacityLabel": "40 ml"
        }
    ],
    "capsuleAromatics": [
        {
            "id": "capsuleAromatic_cereal",
            "name": "Cereais"
        },
        {
            "id": "capsuleAromatic_woody",
            "name": "Amadeirado"
        },
        {
            "id": "capsuleAromatic_fruity",
            "name": "Frutado"
        }
    ],
    "decaffeinated": false,
    "inStock": true,
    "currency": "BRL",
    "price": 4.2,
    "unitPrice": 4.2
}
```

## Capturar itens adicionandos ao carrinho

```
window.napi.cart().read()
```

Exemplo de resultado:

```
[
    {
        "quantity": 7,
        "nonRemovable": false,
        "unitPrice": 7.4,
        "productId": "erp.br.b2c/prod/7278.10"
    },
    {
        "quantity": 1,
        "nonRemovable": false,
        "unitPrice": 719,
        "productId": "erp.br.b2c/prod/C30-BR-BK-NE3"
    }
]
```

## Executar uma função sempre que há uma atualização no carrinho

```
window.napi.data().on("cart.update", handleCartUpdate);
```

## Criação de um novo botão de add_to_cart

HTML do botão, altere apenas o SKU

```
<div class="add-to-bag" data-product-id="erp.br.b2c/prod/SKU" data-button-size="small"></div>
```

Após criação do HTML, pegue a div mãe do novo botão e execute essa função para ativá-lo

```
mosaic.initializeAllFreeHTMLModules(document.getElementById("CONTAINER_DO_NOVO_BOTAO"));
```

## Informações do cliente logado

```
napi.customer().read();
```

Exemplo de resultado:

```
{
    "type": "PersonInfo",
    "memberNumber": "999999",
    "email": "fulano@email.com",
    "checkoutPreferences": {
        "defaultDeliveryAddress": "999999",
        "defaultBillingAddress": "999999",
        "expressCheckout": false
    },
    "currency": "BRL",
    "tariff": "1",
    "taxSystem": "SP",
    "taxIncluded": true,
    "clubCredit": 0,
    "preferredTechnology": "nesclub2.br.b2c/machineTechno/original",
    "enabledTechnologies": [
        "nesclub2.br.b2c/machineTechno/original"
    ],
    "orderHistorySize": 3,
    "lastOrderDate": "2025-05-22T23:07:45.000+02:00",
    "clubMemberStatus": false,
    "eligibleForClubMembership": true,
    "recaptureConsent": false,
    "optIns": [
        "Email",
        "Phone",
        "Sms",
        "PostMail"
    ],
    "limitedProducts": {},
    "extraProductSelections": [
        "64"
    ],
    "productSelections": [
        "64"
    ],
    "status": "Active",
    "languageOfCorrespondence": "pt_br",
    "signupDate": "2024-08-27",
    "persistentBasketLoaded": true,
    "selectionIDs": [
        "29168",
        "29256",
        "33645",
        "32937",
        "32985",
        "32998",
        "33009",
        "33018",
        "33182",
        "33195",
        "33230",
        "33239",
        "33241",
        "33250",
        "33285",
        "33286",
        "33554",
        "33637"
    ],
    "firstName": "Fulano",
    "lastName": "Silva",
    "civility": "1",
    "userGroups": {
        "userGroups": [
            "br_sacolinhareciclavel_semassinaturanocarrinho",
            "br-maquinanocarrinho-parcelamento",
            "br_b2c_campanhaaquisicao2025_compedidos"
        ]
    }
}
```

Campos uteis para segmentar audiencias de campanha (OL/VL x N1/N2) sem Target:

- `preferredTechnology` / `enabledTechnologies` — resumo da linha no cadastro
- `napi.customer().getMachines()` — maquinas **registradas** no clube (fonte principal de OL/VL)
- `userGroups.userGroups` e `selectionIDs` — conferir se o CRM ja manda N1/N2 / SELID
- Ticket medio: calcular a partir de `napi.checkout().getMyOrders()` (pedidos `DELIVERED`)
- `napi.subscription().getSubscriptions()` / `napi.promotion().getClubAction()` — ainda em mapeamento

Detalhes, limiares e script de inspecao: `Nespresso/GUIA-CRO.md` (secoes 5 e 6) e `Nespresso/MARCELO/debug-audiencia/`.

## Últimas compras do usuário logado

```
await window.napi.checkout().getMyOrders();
```

```
{
    "orders": [
        {
            "type": "Order",
            "memberNumber": "6431111",
            "currency": "BRL",
            "orderId": "e98de602-792f-4c08-996f-e0c78bfb3ef9",
            "totals": {
                "taxIncluded": true,
                "withShippingCost": {
                    "subTotal": 100,
                    "grandTotal": 110.9,
                    "taxTotal": 0,
                    "shippingCost": 10.9,
                    "totalOthers": 0,
                    "totalDue": 110.9,
                    "taxLines": [
                        {
                            "label": "Impostos (incl.)",
                            "amount": 0,
                            "amountWithCurrency": "R$ 0,00",
                            "amountType": "RowTotal",
                            "isTotal": false
                        }
                    ]
                },
                "withoutShippingCost": {
                    "subTotal": 100,
                    "grandTotal": 100,
                    "taxTotal": 0,
                    "shippingCost": 0,
                    "totalOthers": 0,
                    "totalDue": 100,
                    "taxLines": [
                        {
                            "label": "Impostos (incl.)",
                            "amount": 0,
                            "amountWithCurrency": "R$ 0,00",
                            "amountType": "RowTotal",
                            "isTotal": false
                        }
                    ]
                },
                "others": [],
                "credit": {
                    "paid": {
                        "used": 0,
                        "remaining": 0
                    },
                    "free": {
                        "used": 0,
                        "remaining": 0
                    }
                },
                "giftCards": 0
            },
            "quotation": {
                "cartLines": [
                    {
                        "id": 1,
                        "item": "erp.br.b2c/prod/7077.80",
                        "quantity": 10,
                        "unitPrice": 5.5,
                        "totalPrice": 55
                    },
                    {
                        "id": 2,
                        "item": "erp.br.b2c/prod/7919.90",
                        "quantity": 10,
                        "unitPrice": 4.5,
                        "totalPrice": 45
                    }
                ],
                "extraLines": []
            },
            "delivery": {
                "deliveryMethod": {
                    "id": "8797895380528",
                    "services": []
                },
                "deliveryAddress": "9027220"
            },
            "payment": {
                "billingAddress": "9027220",
                "paymentMethod": {
                    "id": "8801139412527"
                },
                "availablePaymentMethods": [],
                "giftCards": []
            },
            "preferences": {
                "expressCheckout": "NOT_AVAILABLE",
                "saveCheckoutDefaults": "NOT_AVAILABLE"
            },
            "warnings": [],
            "failures": [],
            "creationDate": "2026-03-10",
            "creationDateTime": "2026-03-10 20:12:14",
            "status": "PENDING",
            "orderSourceId": "I",
            "orderInvoice": {
                "invoiceDocumentStatus": "PENDING",
                "invoiceStatus": "NOT_AVAILABLE"
            },
            "parcels": [],
            "deliveryTracking": {
                "traceable": false,
                "parcels": []
            },
            "isReorderable": true
        },
        {
            "type": "Order",
            "memberNumber": "6431111",
            "currency": "BRL",
            "orderId": "68018611",
            "totals": {
                "taxIncluded": true,
                "withShippingCost": {
                    "subTotal": 55,
                    "grandTotal": 65.9,
                    "taxTotal": 0,
                    "shippingCost": 10.9,
                    "totalOthers": 0,
                    "totalDue": 65.9,
                    "taxLines": [
                        {
                            "label": "Impostos (incl.)",
                            "amount": 0,
                            "amountWithCurrency": "R$ 0,00",
                            "amountType": "RowTotal",
                            "isTotal": false
                        }
                    ]
                },
                "withoutShippingCost": {
                    "subTotal": 55,
                    "grandTotal": 55,
                    "taxTotal": 0,
                    "shippingCost": 0,
                    "totalOthers": 0,
                    "totalDue": 55,
                    "taxLines": [
                        {
                            "label": "Impostos (incl.)",
                            "amount": 0,
                            "amountWithCurrency": "R$ 0,00",
                            "amountType": "RowTotal",
                            "isTotal": false
                        }
                    ]
                },
                "others": [],
                "credit": {
                    "paid": {
                        "used": 0,
                        "remaining": 0
                    },
                    "free": {
                        "used": 0,
                        "remaining": 0
                    }
                },
                "giftCards": 0
            },
            "quotation": {
                "cartLines": [
                    {
                        "id": 1,
                        "item": "erp.br.b2c/prod/137545",
                        "quantity": 1,
                        "unitPrice": 55,
                        "totalPrice": 55
                    }
                ],
                "extraLines": []
            },
            "delivery": {
                "deliveryMethod": {
                    "id": "8797895380528",
                    "services": []
                },
                "deliveryAddress": "9027220",
                "contactPhone": "16923141232"
            },
            "payment": {
                "billingAddress": "9027220",
                "paymentMethod": {
                    "id": "8801139412527"
                },
                "availablePaymentMethods": [],
                "giftCards": []
            },
            "preferences": {
                "expressCheckout": "NOT_AVAILABLE",
                "saveCheckoutDefaults": "NOT_AVAILABLE"
            },
            "warnings": [],
            "failures": [],
            "creationDate": "2025-05-22",
            "creationDateTime": "2025-05-22 23:07:45",
            "status": "DEFERRED_PAYMENT_EXPIRED",
            "orderSourceId": "I",
            "orderInvoice": {
                "invoiceNumber": "",
                "invoiceDocumentStatus": "PENDING",
                "invoiceStatus": "NOT_AVAILABLE",
                "dueDate": "2026-03-11"
            },
            "parcels": [],
            "deliveryTracking": {
                "traceable": false,
                "parcels": []
            },
            "isReorderable": true
        },
        {
            "type": "Order",
            "memberNumber": "6431111",
            "currency": "BRL",
            "orderId": "67874653",
            "totals": {
                "taxIncluded": true,
                "withShippingCost": {
                    "subTotal": 59,
                    "grandTotal": 69.9,
                    "taxTotal": 0,
                    "shippingCost": 10.9,
                    "totalOthers": 0,
                    "totalDue": 69.9,
                    "taxLines": [
                        {
                            "label": "Impostos (incl.)",
                            "amount": 0,
                            "amountWithCurrency": "R$ 0,00",
                            "amountType": "RowTotal",
                            "isTotal": false
                        }
                    ]
                },
                "withoutShippingCost": {
                    "subTotal": 59,
                    "grandTotal": 59,
                    "taxTotal": 0,
                    "shippingCost": 0,
                    "totalOthers": 0,
                    "totalDue": 59,
                    "taxLines": [
                        {
                            "label": "Impostos (incl.)",
                            "amount": 0,
                            "amountWithCurrency": "R$ 0,00",
                            "amountType": "RowTotal",
                            "isTotal": false
                        }
                    ]
                },
                "others": [],
                "credit": {
                    "paid": {
                        "used": 0,
                        "remaining": 0
                    },
                    "free": {
                        "used": 0,
                        "remaining": 0
                    }
                },
                "giftCards": 0
            },
            "quotation": {
                "cartLines": [
                    {
                        "id": 1,
                        "item": "erp.br.b2c/prod/7057.80",
                        "quantity": 10,
                        "unitPrice": 5.9,
                        "totalPrice": 59
                    }
                ],
                "extraLines": []
            },
            "delivery": {
                "deliveryMethod": {
                    "id": "8797895380528",
                    "services": []
                },
                "deliveryAddress": "9027220",
                "contactPhone": "16923141232"
            },
            "payment": {
                "billingAddress": "9027220",
                "paymentMethod": {
                    "id": "8801139412527"
                },
                "availablePaymentMethods": [],
                "giftCards": []
            },
            "preferences": {
                "expressCheckout": "NOT_AVAILABLE",
                "saveCheckoutDefaults": "NOT_AVAILABLE"
            },
            "warnings": [],
            "failures": [],
            "creationDate": "2025-05-14",
            "creationDateTime": "2025-05-14 17:26:34",
            "status": "DEFERRED_PAYMENT_EXPIRED",
            "orderSourceId": "I",
            "orderInvoice": {
                "invoiceNumber": "",
                "invoiceDocumentStatus": "PENDING",
                "invoiceStatus": "NOT_AVAILABLE",
                "dueDate": "2026-03-11"
            },
            "parcels": [],
            "deliveryTracking": {
                "traceable": false,
                "parcels": []
            },
            "isReorderable": true
        },
        {
            "type": "Order",
            "memberNumber": "6431111",
            "currency": "BRL",
            "orderId": "63592073",
            "totals": {
                "taxIncluded": true,
                "withShippingCost": {
                    "subTotal": 32,
                    "grandTotal": 40,
                    "taxTotal": 0,
                    "shippingCost": 8,
                    "totalOthers": 0,
                    "totalDue": 40,
                    "taxLines": [
                        {
                            "label": "Impostos (incl.)",
                            "amount": 0,
                            "amountWithCurrency": "R$ 0,00",
                            "amountType": "RowTotal",
                            "isTotal": false
                        }
                    ]
                },
                "withoutShippingCost": {
                    "subTotal": 32,
                    "grandTotal": 32,
                    "taxTotal": 0,
                    "shippingCost": 0,
                    "totalOthers": 0,
                    "totalDue": 32,
                    "taxLines": [
                        {
                            "label": "Impostos (incl.)",
                            "amount": 0,
                            "amountWithCurrency": "R$ 0,00",
                            "amountType": "RowTotal",
                            "isTotal": false
                        }
                    ]
                },
                "others": [],
                "credit": {
                    "paid": {
                        "used": 0,
                        "remaining": 0
                    },
                    "free": {
                        "used": 0,
                        "remaining": 0
                    }
                },
                "giftCards": 0
            },
            "quotation": {
                "cartLines": [
                    {
                        "id": 1,
                        "item": "erp.br.b2c/prod/7831.10",
                        "quantity": 10,
                        "unitPrice": 3.2,
                        "totalPrice": 32
                    }
                ],
                "extraLines": []
            },
            "delivery": {
                "deliveryMethod": {
                    "id": "8797895380528",
                    "services": []
                },
                "deliveryAddress": "9027220",
                "contactPhone": "16923141232"
            },
            "payment": {
                "billingAddress": "9027220",
                "paymentMethod": {
                    "id": "8801139412527"
                },
                "availablePaymentMethods": [],
                "giftCards": []
            },
            "preferences": {
                "expressCheckout": "NOT_AVAILABLE",
                "saveCheckoutDefaults": "NOT_AVAILABLE"
            },
            "warnings": [],
            "failures": [],
            "creationDate": "2024-10-08",
            "creationDateTime": "2024-10-08 11:48:48",
            "status": "DEFERRED_PAYMENT_EXPIRED",
            "orderSourceId": "I",
            "orderInvoice": {
                "invoiceNumber": "",
                "invoiceDocumentStatus": "PENDING",
                "invoiceStatus": "NOT_AVAILABLE",
                "dueDate": "2026-03-11"
            },
            "parcels": [],
            "deliveryTracking": {
                "traceable": false,
                "parcels": []
            },
            "isReorderable": true
        },
        {
            "type": "Order",
            "memberNumber": "6431111",
            "currency": "BRL",
            "orderId": "63145803",
            "totals": {
                "taxIncluded": true,
                "withShippingCost": {
                    "subTotal": 32,
                    "grandTotal": 40,
                    "taxTotal": 0,
                    "shippingCost": 8,
                    "totalOthers": 0,
                    "totalDue": 40,
                    "taxLines": [
                        {
                            "label": "Impostos (incl.)",
                            "amount": 0,
                            "amountWithCurrency": "R$ 0,00",
                            "amountType": "RowTotal",
                            "isTotal": false
                        }
                    ]
                },
                "withoutShippingCost": {
                    "subTotal": 32,
                    "grandTotal": 32,
                    "taxTotal": 0,
                    "shippingCost": 0,
                    "totalOthers": 0,
                    "totalDue": 32,
                    "taxLines": [
                        {
                            "label": "Impostos (incl.)",
                            "amount": 0,
                            "amountWithCurrency": "R$ 0,00",
                            "amountType": "RowTotal",
                            "isTotal": false
                        }
                    ]
                },
                "others": [],
                "credit": {
                    "paid": {
                        "used": 0,
                        "remaining": 0
                    },
                    "free": {
                        "used": 0,
                        "remaining": 0
                    }
                },
                "giftCards": 0
            },
            "quotation": {
                "cartLines": [
                    {
                        "id": 1,
                        "item": "erp.br.b2c/prod/7748.10",
                        "quantity": 10,
                        "unitPrice": 3.2,
                        "totalPrice": 32
                    }
                ],
                "extraLines": []
            },
            "delivery": {
                "deliveryMethod": {
                    "id": "8797895380528",
                    "services": []
                },
                "deliveryAddress": "9027220",
                "contactPhone": "16923141232"
            },
            "payment": {
                "billingAddress": "9027220",
                "paymentMethod": {
                    "id": "8801139412527"
                },
                "availablePaymentMethods": [],
                "giftCards": []
            },
            "preferences": {
                "expressCheckout": "NOT_AVAILABLE",
                "saveCheckoutDefaults": "NOT_AVAILABLE"
            },
            "warnings": [],
            "failures": [],
            "creationDate": "2024-09-10",
            "creationDateTime": "2024-09-10 16:40:02",
            "status": "DEFERRED_PAYMENT_EXPIRED",
            "orderSourceId": "I",
            "orderInvoice": {
                "invoiceNumber": "",
                "invoiceDocumentStatus": "PENDING",
                "invoiceStatus": "NOT_AVAILABLE",
                "dueDate": "2026-03-11"
            },
            "parcels": [],
            "deliveryTracking": {
                "traceable": false,
                "parcels": []
            },
            "isReorderable": true
        },
        {
            "type": "Order",
            "memberNumber": "6431111",
            "currency": "BRL",
            "orderId": "63144709",
            "totals": {
                "taxIncluded": true,
                "withShippingCost": {
                    "subTotal": 32,
                    "grandTotal": 40,
                    "taxTotal": 0,
                    "shippingCost": 8,
                    "totalOthers": 0,
                    "totalDue": 40,
                    "taxLines": [
                        {
                            "label": "Impostos (incl.)",
                            "amount": 0,
                            "amountWithCurrency": "R$ 0,00",
                            "amountType": "RowTotal",
                            "isTotal": false
                        }
                    ]
                },
                "withoutShippingCost": {
                    "subTotal": 32,
                    "grandTotal": 32,
                    "taxTotal": 0,
                    "shippingCost": 0,
                    "totalOthers": 0,
                    "totalDue": 32,
                    "taxLines": [
                        {
                            "label": "Impostos (incl.)",
                            "amount": 0,
                            "amountWithCurrency": "R$ 0,00",
                            "amountType": "RowTotal",
                            "isTotal": false
                        }
                    ]
                },
                "others": [],
                "credit": {
                    "paid": {
                        "used": 0,
                        "remaining": 0
                    },
                    "free": {
                        "used": 0,
                        "remaining": 0
                    }
                },
                "giftCards": 0
            },
            "quotation": {
                "cartLines": [
                    {
                        "id": 1,
                        "item": "erp.br.b2c/prod/7748.10",
                        "quantity": 10,
                        "unitPrice": 3.2,
                        "totalPrice": 32
                    }
                ],
                "extraLines": []
            },
            "delivery": {
                "deliveryMethod": {
                    "id": "8797895380528",
                    "services": []
                },
                "deliveryAddress": "9027220",
                "contactPhone": "16923141232"
            },
            "payment": {
                "billingAddress": "9027220",
                "paymentMethod": {
                    "id": "8801139412527"
                },
                "availablePaymentMethods": [],
                "giftCards": []
            },
            "preferences": {
                "expressCheckout": "NOT_AVAILABLE",
                "saveCheckoutDefaults": "NOT_AVAILABLE"
            },
            "warnings": [],
            "failures": [],
            "creationDate": "2024-09-10",
            "creationDateTime": "2024-09-10 15:50:02",
            "status": "DEFERRED_PAYMENT_EXPIRED",
            "orderSourceId": "I",
            "orderInvoice": {
                "invoiceNumber": "",
                "invoiceDocumentStatus": "PENDING",
                "invoiceStatus": "NOT_AVAILABLE",
                "dueDate": "2026-03-11"
            },
            "parcels": [],
            "deliveryTracking": {
                "traceable": false,
                "parcels": []
            },
            "isReorderable": true
        },
        {
            "type": "Order",
            "memberNumber": "6431111",
            "currency": "BRL",
            "orderId": "63144483",
            "totals": {
                "taxIncluded": true,
                "withShippingCost": {
                    "subTotal": 32,
                    "grandTotal": 40,
                    "taxTotal": 0,
                    "shippingCost": 8,
                    "totalOthers": 0,
                    "totalDue": 40,
                    "taxLines": [
                        {
                            "label": "Impostos (incl.)",
                            "amount": 0,
                            "amountWithCurrency": "R$ 0,00",
                            "amountType": "RowTotal",
                            "isTotal": false
                        }
                    ]
                },
                "withoutShippingCost": {
                    "subTotal": 32,
                    "grandTotal": 32,
                    "taxTotal": 0,
                    "shippingCost": 0,
                    "totalOthers": 0,
                    "totalDue": 32,
                    "taxLines": [
                        {
                            "label": "Impostos (incl.)",
                            "amount": 0,
                            "amountWithCurrency": "R$ 0,00",
                            "amountType": "RowTotal",
                            "isTotal": false
                        }
                    ]
                },
                "others": [],
                "credit": {
                    "paid": {
                        "used": 0,
                        "remaining": 0
                    },
                    "free": {
                        "used": 0,
                        "remaining": 0
                    }
                },
                "giftCards": 0
            },
            "quotation": {
                "cartLines": [
                    {
                        "id": 1,
                        "item": "erp.br.b2c/prod/7748.10",
                        "quantity": 10,
                        "unitPrice": 3.2,
                        "totalPrice": 32
                    }
                ],
                "extraLines": []
            },
            "delivery": {
                "deliveryMethod": {
                    "id": "8797895380528",
                    "services": []
                },
                "deliveryAddress": "9027220",
                "contactPhone": "16923141232"
            },
            "payment": {
                "billingAddress": "9027220",
                "paymentMethod": {
                    "id": "8801139412527"
                },
                "availablePaymentMethods": [],
                "giftCards": []
            },
            "preferences": {
                "expressCheckout": "NOT_AVAILABLE",
                "saveCheckoutDefaults": "NOT_AVAILABLE"
            },
            "warnings": [],
            "failures": [],
            "creationDate": "2024-09-10",
            "creationDateTime": "2024-09-10 15:40:08",
            "status": "DEFERRED_PAYMENT_EXPIRED",
            "orderSourceId": "I",
            "orderInvoice": {
                "invoiceNumber": "",
                "invoiceDocumentStatus": "PENDING",
                "invoiceStatus": "NOT_AVAILABLE",
                "dueDate": "2026-03-11"
            },
            "parcels": [],
            "deliveryTracking": {
                "traceable": false,
                "parcels": []
            },
            "isReorderable": true
        }
    ]
}
```
