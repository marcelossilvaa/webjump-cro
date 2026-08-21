<!-- canonical: .context/rules/03-dom.md -->
## 3. Manipulação do DOM

### 3.1. Seletores

**Prefira** seletores por conteúdo/texto (mais resilientes) ao invés de classes voláteis.

```javascript
const spans = container.querySelectorAll('span');
spans.forEach((span) => {
  const text = span.textContent || '';
  if (text.includes('A partir de:')) {
    // Processar
  }
});
```

### 3.2. Aplicação de estilos

Use `setProperty` com `'important'` quando precisar garantir precedência.

```javascript
element.style.setProperty('background-color', '#CF527A', 'important');
element.style.setProperty('border-radius', '65px', 'important');
```

#### 3.2.1. Tipografia (padrão Azul)

**Obrigatório**: em textos (labels, títulos, parágrafos, CTAs) use sempre:

```css
font-family: "Helvetica Neue", Arial, sans-serif;
```

Exemplo com `setProperty`:

```javascript
element.style.setProperty('font-family', '"Helvetica Neue", Arial, sans-serif', 'important');
```

Para remover:

```javascript
element.style.removeProperty('transform');
```

### 3.3. `data-*` para evitar reprocessamento

Use `data-*` para marcar elementos já processados e evitar duplicações.

**Padrão**: `data-[funcionalidade]-applied` / `data-[funcionalidade]-added`

```javascript
if (!element.hasAttribute('data-styled-applied')) {
  element.style.setProperty('max-width', '266px', 'important');
  element.setAttribute('data-styled-applied', 'true');
}
```

### 3.4. Azul (SPA): `MutationObserver` sem loop (obrigatório)

Na **Azul** (principalmente em flows de **Search/Seleção/Calendário**), o site é **SPA** e componentes React/styled-components **re-renderizam** o DOM com frequência. Se você observar o `document.body` sem filtros e, ao mesmo tempo, **injetar elementos/classes**, seu observer passa a reagir às próprias mudanças e cria:

- spam de tracking (ex.: `calendar_loaded` em loop)
- reprocessamento infinito/alto consumo
- bugs intermitentes em abrir/fechar modais (sem reload)

#### Regras obrigatórias

- **Observer específico > body**: prefira observar o **wrapper do componente** (calendário, lista, modal).
- **Anti-loop**: marque o wrapper observado (`data-at-observing="true"`) e mantenha `lastObservedWrapper`. Se já está observando, **retorne**.
- **Throttle de tracking/ações pesadas**: eventos “loaded” devem ter cooldown (ex.: 1–2s) e/ou “once per open”.
- **Idempotência**: CSS com `style.id` e checagem; elementos injetados com classe/atributo e checagem antes de inserir.
- **Guard SPA-safe**: não bloqueie só por `window[experienceName]`. Bloqueie apenas se a personalização já existe no DOM (style/elementos).

#### Template recomendado (Azul / SPA)

```javascript
const stylesId = 'at-feature-styles';
const wrapperAttr = 'data-at-observing';
const trackingCooldownMs = 1500;
let lastLoadedTs = 0;
let lastObservedWrapper = null;

function hasCustomizationInDom() {
  return (
    !!document.getElementById(stylesId) ||
    document.querySelectorAll('.at-injected, .inject-holiday-element, .inject-holiday-highlight').length >
      0
  );
}

function safeTrackLoaded(trackFn) {
  const now = Date.now();
  if (now - lastLoadedTs < trackingCooldownMs) return;
  lastLoadedTs = now;
  trackFn();
}

function observeWrapper(wrapper, onMutate) {
  if (!wrapper) return;
  if (wrapper === lastObservedWrapper && wrapper.getAttribute(wrapperAttr) === 'true') return;

  lastObservedWrapper = wrapper;
  wrapper.setAttribute(wrapperAttr, 'true');

  const mo = new MutationObserver(() => onMutate(wrapper));
  mo.observe(wrapper, { childList: true, subtree: true });
  return mo;
}
```

### 3.5. Azul (SPA / checkout): injetar cedo, modificar só na página alvo (obrigatório)

No checkout da **Azul** a navegação é **SPA** (sem reload). Se o Adobe Target injetar o script **somente** na URL final, a oferta pode chegar tarde ou nem disparar.

#### Regra

| Camada | O que fazer |
|--------|-------------|
| **Target** | Incluir o script em **etapas anteriores** do fluxo (ex.: `selecao-voo`, `passageiros`, `responsavel`, `review`) |
| **Script** | **Modificar / injetar UI só na página correta** (ex.: `/br/pt/home/review` ou review + query `seatmap`) |
| **Etapas anteriores** | Apenas observar a SPA (URL / `main`); **não** coletar, **não** injetar DOM da experiência |
| **Saída do fluxo** | Cleanup da UI injetada e, se necessário, disconnect dos observers |

Referência de implementação: `Azul/MARCELO/2026/AB-Test/Seguro viagem/script.js` e `Azul/MARCELO/2026/AB-Test/LoadingDeAssentos/script.js`.

#### Template recomendado

```javascript
const experienceName = 'AT_EXEMPLO';
const experienceAlreadyExecuted = window[experienceName] || false;
const CHECKOUT_URL_STEPS = ['selecao-voo', 'passageiros', 'responsavel', 'review'];
const TARGET_PATH = '/home/review';

function getURLPath() {
  return window.location.pathname.toLowerCase();
}

function onCheckoutFlowPage() {
  const path = getURLPath();
  return CHECKOUT_URL_STEPS.some(function (step) {
    return path.indexOf(step) !== -1;
  });
}

function isTargetPage() {
  // Ajuste: pathname e/ou query específica do teste (ex.: seatmap).
  return getURLPath().indexOf(TARGET_PATH) !== -1;
}

if (experienceAlreadyExecuted || !onCheckoutFlowPage()) {
  console.log('[AT] Fora do checkout OU script ja executado.');
  return;
}

window[experienceName] = true;

function handleCheckoutStepChange() {
  if (!onCheckoutFlowPage()) {
    cleanupInjectedExperience();
    disconnectObservers();
    return;
  }

  if (!isTargetPage()) {
    // Etapas anteriores: so observa a SPA.
    cleanupInjectedExperience();
    return;
  }

  tryInjectExperience();
}
```

#### Checklist rápido

- [ ] Target cobre etapas anteriores do checkout (não só a URL final)
- [ ] `isTargetPage()` (pathname e/ou query) impede injeção fora da página correta
- [ ] Em etapas anteriores: zero UI da experiência (no máximo pré-hooks de transição, se o teste exigir)
- [ ] Cleanup ao sair da página alvo / do checkout

