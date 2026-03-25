# Azul Airlines - A/B Testing & Experimentation Codebase

## Project Overview

This is a collection of **Adobe Target** experiments and optimization scripts for Azul Airlines' website (voeazul.com.br). Each feature is a **standalone IIFE** designed to be injected via Adobe Target activities. The codebase focuses on conversion optimization through UI modifications, tracking, and personalization.

## Architecture Patterns

### IIFE Structure (Mandatory)
All scripts use immediately-invoked function expressions to avoid global namespace pollution:

```javascript
(function () {
  'use strict';
  // Your code here
})();
```

**Why**: Adobe Target injects scripts directly into the page. IIFEs prevent variable collisions with client's existing code.

### Adobe Target Compatibility
- **No template literals** - Use string concatenation for HTML/CSS injection (Adobe Target editor limitation)
- **ES5 syntax preferred** - Broader browser compatibility
- **Inline styles** - CSS injected via `<style>` tags within scripts

Example from `comunicacao-loading/banner.loading.js`:
```javascript
var styles = 
  '.modal-overlay { position: fixed; }' +
  '.modal-content { background: white; }';
```

### DOM Manipulation Patterns

**Wait for elements before manipulation**:
```javascript
// Pattern used in Black Friday 2025/modal-search.js
const waitForElement = (selector, { timeout = 10000 } = {}) =>
  new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) return resolve(element);
    
    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });
    
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
    
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element "${selector}" not found`));
    }, timeout);
  });
```

**Loading state detection** (`filtro-lateral/optimizeFilterCars`):
```javascript
const checkIfContentIsRendered = () => {
  const loadingWrapper = document.querySelector('.styles__LoadingWrapper-sc-fdgbpv-4');
  if (loadingWrapper) {
    requestAnimationFrame(checkIfContentIsRendered);
    return;
  }
  initializeFeature();
};
```

## Adobe Analytics Integration

All experiments track user interactions using **Adobe Analytics (event90 + eVar82)**. Standard pattern:

```javascript
function trackEvent(label) {
  var s = window.s || (typeof window.s_gi === 'function' && window.s_gi('azul-novo-prod'));
  if (!s || typeof s.tl !== 'function') return;
  
  s.linkTrackVars   = 'events,eVar82';
  s.linkTrackEvents = 'event90';
  s.events          = 'event90';
  s.eVar82          = label;  // Activity identifier
  s.tl(true, 'o', 'target_activity_action');
}
```

**Naming convention**: `AT_{feature}_{action}` (e.g., `AT_incentivo_cadastro_view`, `AT_BF passagens_banner_click`)

## Folder Organization

Each feature lives in its own folder with descriptive names:
- `main-menu-atracoes/` - Menu text variations
- `filtro-lateral/` - Filter optimization experiments
- `Black Friday 2025/` - Campaign-specific features (countdown, modals, tracking)
- `diamante-unique-launch/` - Loyalty tier promotion modal
- `adapter (base)/` - React Native Adobe Optimize adapter (NOT web-based)

### File Naming Conventions
- `{feature}.js` - Main implementation
- `{feature} with AA tag.js` - Version with analytics
- `{feature} Control Track.js` - Control group tracking
- `test-{feature}.html` - Test/debug pages
- Multiple numbered versions indicate A/B/N variants: `(1).js`, `(2).js`, `(3).js`

## Key Development Patterns

### Cookie & LocalStorage Management
Example from `diamante-unique-launch/modal-diamante.js`:
```javascript
function getCookieValue(cookieName) {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.indexOf(cookieName + '=') === 0) {
      return decodeURIComponent(cookie.substring(cookieName.length + 1));
    }
  }
  return null;
}

function getStorage(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    return null;
  }
}
```

### Responsive Design Checks
```javascript
const isMobile = () => window.innerWidth <= 768;
const deviceWidth = window.innerWidth || document.documentElement.clientWidth;
if (deviceWidth < 1024) return; // Skip desktop-only features
```

### URL-Based Targeting
```javascript
const isCarPage = window.location.pathname.includes('/cars');
const isHomepage = window.location.href.indexOf('voeazul.com.br/home/br/pt/home') !== -1;
```

## Common Selectors

Azul's React/Styled-components class names (frequently change with builds):
- `.css-xxxxxx` - Dynamically generated classes (fragile, use data attributes when possible)
- `.styles__ComponentName-sc-xxxxx-x` - Styled-components pattern
- `[data-id]`, `[data-rte-editelement]` - More stable selectors

## Testing & Debugging

Test pages include global functions for manual testing:
```javascript
// From diamante-unique-launch/debug-modal.html
function showModalDirect() { window.TudoAzulCookie.showModal(); }
function simulateCookie() { /* Create mock data */ }
```

Always expose key functions to `window` for debugging in Adobe Target preview mode.

## React Native Integration

The `adapter (base)/` folder contains TypeScript code for Adobe Optimize in React Native:
- Uses `@adobe/react-native-aepoptimize`
- Different architecture from web experiments
- See `adapter (base)/README.md` for setup

## Common Pitfalls

1. **Template literals break Adobe Target** - Always concatenate strings
2. **Class names change frequently** - Target stable attributes or DOM structure
3. **SPA routing** - Listen for `popstate` and monitor URL changes
4. **Race conditions** - Always wait for elements before manipulating
5. **Multiple injection** - Check if component already exists before injecting again

## Starting a New Experiment

1. Create folder: `{feature-name}/`
2. Create main file: `{feature-name}.js` wrapped in IIFE
3. Add analytics tracking using standard pattern
4. Create test HTML if needed: `test-{feature-name}.html`
5. Add version with tracking: `{feature-name} with AA tag.js`
6. Document configuration at top of file in `CONFIG` object
