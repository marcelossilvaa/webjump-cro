<!-- canonical: .context/rules/06-tracking.md -->

## 6. Tracking (Adobe Analytics)

### 6.1. Quando aplicar

**Obrigatório** quando você cria/modifica componente visual:

- Visualização (quando aparece)
- Ações (cliques e interações)

### 6.2. Função padrão (modelo)

Use este formato como base (ajuste o nome da atividade e contexto).

```javascript
function analyticsEvent(eventLabel, eventType) {
  if (!eventLabel) {
    console.log('[Tracking NomeComponente] Missing parameters for analytics event.');
    return;
  }

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
```

### 6.3. Uso das eVars

- `eVar82`: informação principal da ação
- `eVar84`: contexto adicional (valor do input, página, status etc.)

### 6.4. Listeners sem duplicar

Sempre use um `data-*` (ex: `data-analytics-added`) para evitar duplicação.

### 6.5. Nespresso (GTM / dataLayer — `gtmDataObject`)

#### Push de experimento AB/XT (Adobe Target)

O push `adobe_target` e aplicado **separadamente** pelo Adobe Target (arquivo `GA4.js`/`GA4.html` dedicado). **NAO inclua este trecho nos scripts de funcionalidade/CRO.**

#### Funcao de evento (OBRIGATORIA nos scripts)

Todo script Nespresso com acoes do usuario **deve obrigatoriamente** incluir `sendGAEvent`:

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

| Campo                  | Regra                                                                      |
| ---------------------- | -------------------------------------------------------------------------- |
| `event`                | Sempre `'local_event'` — NAO alterar                                       |
| `event_raised_by`      | Codigo do pais (`'br'`)                                                    |
| `local_event_category` | Categoria livre em lowercase (ex: `'user engagement'`)                     |
| `local_event_action`   | Acao livre em lowercase (ex: `'click'`, `'view'`)                          |
| `local_event_label`    | Label descritivo do elemento (lowercase, separado por `_`)                 |

### 6.6. Outros projetos

Para projetos como **Gerdau**, **GerdauMais**, **Nestle**, **NestleDemo** e **FTD**, verifique o padrao ja usado nos scripts existentes da pasta antes de criar a funcao de tracking. Na duvida, siga o modelo Nespresso (GTM / dataLayer) como fallback, pois a maioria dos projetos utiliza GA4.
