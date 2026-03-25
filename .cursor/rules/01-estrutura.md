<!-- mirror: .github/rules/01-estrutura.md -->

## 1. Estrutura básica

### 1.1. Função encapsulada (IIFE)

**Obrigatório**: todo script deve ser encapsulado em IIFE para evitar poluição do escopo global.

```javascript
(function () {
  // Seu código aqui
})();
```

### 1.2. Variáveis no escopo

Declare variáveis no início da IIFE, antes das funções auxiliares.

```javascript
(function () {
  let observer = null;
  let isProcessing = false;
  let debounceTimer = null;
  let targetContainer = null;

  // Funções auxiliares aqui
})();
```

### 1.3. Organização sugerida

- Variáveis
- Constantes
- Funções utilitárias
- Funções de feature (DOM, listeners, observers)
- `init()`
- Bootstrap (`DOMContentLoaded`)

## Tracking (modelo curto)

### Azul (Adobe Analytics)

Use `const` dentro da IIFE ao acessar `s` (nao usar `var`).

```javascript
(function () {
  function analyticsEvent(eventLabel, eventType) {
    if (!eventLabel) return;
    const labelEvent = 'AT_NomeAtividade_' + eventType + ' ' + eventLabel;
    console.log('[Tracking NomeComponente] Analytics event triggered:', labelEvent);
    (function () {
      const s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
      if (!s || typeof s.tl !== 'function') return;
      s.linkTrackVars = 'events,eVar82,eVar84';
      s.linkTrackEvents = 'event90';
      s.events = 'event90';
      s.eVar82 = labelEvent;
      s.eVar84 = 'AT_contexto_pagina';
      s.tl(true, 'o', 'target_activity_action');
    })();
  }
})();
```

### Nespresso (GTM / dataLayer)

Push de experimento (uma vez no inicio do script):

```javascript
gtmDataObject = window.gtmDataObject || [];
gtmDataObject.push({
  event: 'adobe_target',
  event_raised_by: 'adobe target',
  experiment_id: '${campaign.id}',
  experiment_type: 'AB',
  experiment_name: '${campaign.name}',
  experiment_variant_id: '${campaign.recipe.id}',
  experiment_variant: '${campaign.recipe.name}',
});
```

Funcao de evento:

```javascript
function sendGAEvent(label) {
  window.gtmDataObject = window.gtmDataObject || [];
  gtmDataObject.push({
    event: 'local_event',
    event_raised_by: 'br',
    local_event_category: 'user engagement',
    local_event_action: 'click',
    local_event_label: label,
  });
}
```

## Checklist rapido antes de considerar pronto

<!-- mirror: .github/rules/06-tracking.md -->

## 6. Tracking

### 6.1. Quando aplicar

- Sempre que criar/alterar componentes visuais ou interativos.
- Ao interceptar respostas de API relevantes (sucesso/erro).

---

### 6.2. Tracking por projeto

Cada projeto (pasta raiz) possui seu proprio padrao de tracking. Siga o modelo correto conforme o projeto.

---

### 6.3. Azul (Adobe Analytics — `s.tl`)

#### 6.3.1. Funcao padrao (modelo Azul)

```javascript
function analyticsEvent(eventLabel, eventType) {
  if (!eventLabel) {
    console.log('[Tracking NomeComponente] Parametros ausentes para evento de analytics.');
    return;
  }

  const labelEvent = 'AT_NomeAtividade_' + eventType + ' ' + eventLabel;
  console.log('[Tracking NomeComponente] Evento de analytics disparado: ' + labelEvent);

  (function () {
    const s = window.s || (typeof s_gi === 'function' && s_gi('azul-novo-prod'));
    if (!s || typeof s.tl !== 'function') return;

    s.linkTrackVars = 'events,eVar82,eVar84';
    s.linkTrackEvents = 'event90';
    s.events = 'event90';
    s.eVar82 = labelEvent;
    s.eVar84 = 'AT_contexto_pagina';

    s.tl(true, 'o', 'target_activity_action');
  })();
}
```

#### 6.3.2. Uso das eVars (Azul)

- `eVar82`: informacao principal da acao (ex: `AT_cupom cupom_aplicar_clique`)
- `eVar84`: contexto adicional (ex: valor do input, pagina, status)

---

### 6.4. Nespresso (GTM / dataLayer — `gtmDataObject`)

#### 6.4.1. Push de identificacao do experimento

Incluir **uma vez** no inicio do script, logo apos guards e configuracao:

```javascript
gtmDataObject = window.gtmDataObject || [];
gtmDataObject.push({
  event: 'adobe_target',
  event_raised_by: 'adobe target',
  experiment_id: '${campaign.id}',
  experiment_type: 'AB',
  experiment_name: '${campaign.name}',
  experiment_variant_id: '${campaign.recipe.id}',
  experiment_variant: '${campaign.recipe.name}',
});
```

#### 6.4.2. Funcao padrao (modelo Nespresso)

```javascript
function sendGAEvent(label) {
  window.gtmDataObject = window.gtmDataObject || [];
  gtmDataObject.push({
    event: 'local_event',
    event_raised_by: 'br',
    local_event_category: 'user engagement',
    local_event_action: 'click',
    local_event_label: label,
  });
}
```

#### 6.4.3. Campos do dataLayer (Nespresso)

| Campo                  | Descricao                                                                     |
| ---------------------- | ----------------------------------------------------------------------------- |
| `event`                | Sempre `'local_event'` para interacoes do usuario                             |
| `event_raised_by`      | Codigo do pais (ex: `'br'`)                                                   |
| `local_event_category` | Categoria livre em lowercase (ex: `'user engagement'`, `'editar-assinatura'`) |
| `local_event_action`   | Acao livre em lowercase (ex: `'click'`, `'click1'`, `'click2'`)               |
| `local_event_label`    | Label descritivo do elemento clicado                                          |

---

### 6.5. Outros projetos

Para projetos como **Gerdau**, **GerdauMais**, **Nestle**, **NestleDemo** e **FTD**, verifique o padrao ja usado nos scripts existentes da pasta antes de criar a funcao de tracking. Na duvida, siga o modelo Nespresso (GTM / dataLayer) como fallback, pois a maioria dos projetos utiliza GA4.

---

### 6.6. Listeners sem duplicar (todos os projetos)

Sempre use um atributo `data-*` (ex: `data-analytics-added`) para evitar duplicacao de listeners de tracking.

```javascript
if (elemento.getAttribute('data-analytics-added')) return;
elemento.setAttribute('data-analytics-added', 'true');
elemento.addEventListener('click', function () {
  // disparo de tracking
});
```
