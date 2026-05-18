# Azul Loading Banner Modal

## Descrição

Modal promocional que exibe uma oferta de desconto em hotéis durante o loading da página de tarifas da Azul. O banner é responsivo e se adapta automaticamente para desktop e mobile.

## Características

### ✅ Funcionalidades Implementadas

- **Detecção automática da URL**: Verifica se está na página `/selecao-voo` (temporariamente desabilitado)
- **Design responsivo**: Versões otimizadas para desktop e mobile
- **Animações suaves**: Transições e efeitos visuais profissionais
- **Progress bar animada**: Indicador visual de carregamento com mensagens progressivas
- **Mensagens dinâmicas**: Textos que mudam conforme o progresso (0%, 50%, 75%)
- **Compatibilidade Adobe Target**: Sem template literals, usando concatenação de strings
- **Fechamento automático**: Desaparece após 8 segundos
- **Múltiplas formas de fechar**: Botão X, clique no overlay, tecla ESC
- **Integração com Analytics**: Eventos de tracking prontos
- **Acessibilidade**: Suporte a screen readers e navegação por teclado

### 🎨 Design

- **Desktop**: Layout lado a lado com imagem do resort à esquerda
- **Mobile**: Layout vertical com imagem no topo
- **Cores**: Paleta oficial da Azul (#0066CC)
- **Tipografia**: Fontes do sistema (Segoe UI)
- **Imagens**: Imagens específicas para desktop e mobile (via Imgur)

## Como Usar

### 1. Implementação Básica

```html
<!-- Incluir o script na página -->
<script src="banner.loading.js"></script>
```

### 2. Verificação Automática

O script automaticamente:

- **Atualmente**: Exibe imediatamente após injeção (seletor de URL temporariamente removido)
- Mostra o modal por 8 segundos
- Remove automaticamente após o tempo

### 3. Personalização

Para modificar comportamentos, edite a constante `CONFIG` no início do arquivo:

```javascript
const CONFIG = {
    urlTarget: '/selecao-voo',        // URL onde exibir (temporariamente desabilitado)
    showDelay: 0,                     // Exibir imediatamente
    hideDelay: 8000,                  // Tempo de exibição (ms)
    loadingMessages: {
        0: "Estamos iniciando sua reserva...",
        50: "Quase lá... Estamos assegurando sua passagem.",
        75: "Pronto para decolar! Estamos finalizando a etapa com segurança."
    },
    title: 'A um passo da viagem dos sonhos.',
    description: 'Sua experiência Azul...',
    hotelImageDesktop: 'https://i.imgur.com/MyN94BQ.png',  // Imagem desktop
    hotelImageMobile: 'https://i.imgur.com/GAoQdi9.png',   // Imagem mobile
    brandColors: { ... }              // Cores personalizadas
};
```

## Estrutura do Modal

### Desktop Layout

```
┌─────────────────────────────────────┐
│ [X]                                 │
│ ┌─────────────┬─────────────────────┐│
│ │             │ Título              ││
│ │   Imagem    │ Descrição           ││
│ │   Resort    │ ████████░░ Loading  ││
│ │             │                     ││
│ └─────────────┴─────────────────────┘│
└─────────────────────────────────────┘
```

### Mobile Layout

```
┌─────────────────┐
│ [X]             │
│ ┌─────────────┐ │
│ │   Imagem    │ │
│ │   Resort    │ │
│ ├─────────────┤ │
│ │ Título      │ │
│ │ Descrição   │ │
│ │ ████░░░░    │ │
│ └─────────────┘ │
└─────────────────┘
```

## Eventos de Tracking

O script gera automaticamente eventos para analytics:

```javascript
// Eventos disponíveis
gtag("event", "azul_banner_show", {
  event_category: "promotional_banner",
  event_label: "loading_page",
});

gtag("event", "azul_banner_hide", {
  event_category: "promotional_banner",
  event_label: "loading_page",
});
```

## Compatibilidade

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers

## Arquivos Incluídos

- `banner.loading.js` - Script principal
- `README.md` - Esta documentação

## Testes Recomendados

1. **Teste de exibição**: Verificar se aparece imediatamente após injeção
2. **Teste responsivo**: Desktop e mobile com imagens específicas
3. **Teste de timing**: Exibição imediata e auto-hide de 8s
4. **Teste de fechamento**: Botão X, overlay e ESC
5. **Teste de analytics**: Eventos de tracking
6. **Teste de performance**: Não deve impactar o carregamento

## Próximos Passos

1. Testar em ambiente de desenvolvimento
2. Configurar analytics/tracking conforme necessário
3. Ajustar timing e textos conforme feedback
4. Implementar em produção
5. Monitorar métricas de conversão
