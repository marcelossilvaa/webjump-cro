<!-- mirror: .github/rules/06-tracking.md -->
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

