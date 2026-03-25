# Azul · Optimize Adapter (React Native)

**Objetivo:** disponibilizar um adapter pronto para usar **Edge/Optimize** no piloto do **banner da Home**.
O app pede a decisão pelo _scope_ `home.promo.banner`, renderiza o **JSON** e registra **view** e **click**.

## 1) Pré-requisitos

- React Native 0.70+ (sugerido)
- AEP RN: `@adobe/react-native-aepcore`, `@adobe/react-native-aepedge`, `@adobe/react-native-aepedgeidentity`, `@adobe/react-native-aepedgeconsent`, `@adobe/react-native-aepassurance`
  // react-native-aepassurance` : apenas em staging
- **Optimize RN**: `@adobe/react-native-aepoptimize`
- App inicializado com `MobileCore.initializeWithAppId(ENVIRONMENT_ID)`
- Datastreams por ambiente configurados

## 2) Instalação

```bash
npm i @adobe/react-native-aepoptimize
# iOS
cd ios && pod install && cd ..
```

## 3) Estrutura

```txt
src/
  adapters/optimizeAdapter.ts
  components/HomePromoBanner.tsx
```

## 4) Uso rápido

- Adicione `<HomePromoBanner hasReservation={false} />` **abaixo** dos banners atuais, apenas quando o usuário **não** tiver reserva.
- No Target/Optimize, crie o **placement** `home.promo.banner` com uma **JSON Offer** (v1) contendo imagem/título/CTA.

## 5) Eventos

- O adapter já envia `propositionDisplay` ao renderizar e `propositionInteract` no clique.
- Mantenha **fallback** local e `timeoutSec` curto (2s) para não travar a UI.

## 6) Referências oficiais

- `@adobe/react-native-aepoptimize` (NPM): biblioteca e versões.
- Release notes – Optimize RN (timeout em `updatePropositions/getPropositions`, melhorias de tracking).
- API de Decisioning (get/update propositions).

```
(Cole os links no seu doc interno; eles estão no chat desta entrega.)
```

---

**Observação**: este código é um ponto de partida. Ajuste o schema do JSON e o estilo do componente conforme o design do app.
