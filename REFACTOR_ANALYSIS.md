# 🔍 ANALIZA KODU - DRY & Dead Code

**Data:** 2026-02-05  
**Wersja:** 3.1 Analysis

---

## ❌ PROBLEMY ZNALEZIONE

### 1. **DUPLIKACJA - Window Registration Pattern** ⭐⭐⭐⭐⭐
**Priorytet:** Krytyczny  
**Lokacja:** [main.js](main.js)  
**Powtórzeń:** 4x (linie: 113-116, 123-128, 189-192, 247-250, 282-285)

**Problem:**
```javascript
// Ten sam kod 4 razy!
window.visible = true;
windowManager.add(window);
taskbar.addWindowItem(window.title, window, 'section');
window.onClose = () => { window.visible = false; };
```

**Rozwiązanie:**
```javascript
// Helper function
function registerWindow(window, section = 'system') {
    window.visible = true;
    windowManager.add(window);
    taskbar.addWindowItem(window.title, window, section);
    window.onClose = () => { window.visible = false; };
    return window;
}

// Użycie
registerWindow(controlsWindow, 'system');
registerWindow(sim1Window, 'symulacje');
```

**Oszczędność:** ~40 linii kodu, lepsza konsystencja

---

### 2. **DUPLIKACJA - Window Removal Pattern** ⭐⭐⭐⭐
**Priorytet:** Wysoki  
**Lokacja:** [main.js](main.js)  
**Powtórzeń:** 3x (linie: 144-145, 150-151, 239-240)

**Problem:**
```javascript
// Powtarza się 3x
windowManager.remove(window);
taskbar.removeWindowItem(window);
```

**Rozwiązanie:**
```javascript
function unregisterWindow(window) {
    windowManager.remove(window);
    taskbar.removeWindowItem(window);
}

// Użycie
unregisterWindow(sim1Window);
```

**Oszczędność:** ~10 linii, mniej błędów (zapomnienie usunięcia z taskbar)

---

### 3. **DEAD CODE - SimulationManager Modes** ⭐⭐⭐⭐⭐
**Priorytet:** Krytyczny (potencjalna confusion)  
**Lokacja:** [core/SimulationManager.js](core/SimulationManager.js#L351-L374)

**Problem:**
```javascript
// DEPRECATED metody które nic nie robią!
getMode(simId) {
    return 'window'; // Always return window mode
}

setMode(simId, mode) {
    // Do nothing - modes are handled by window properties only
}
```

**Rozwiązanie:**
Usunąć całkowicie - 25 linii martwy kod + komentarze

**Oszczędność:** ~25 linii, mniej confusion dla developerów

---

### 4. **DEAD CODE - EventBus History** ⭐⭐⭐
**Priorytet:** Średni  
**Lokacja:** [core/EventBus.js](core/EventBus.js#L26-L28, L96-L103, L135-L151)

**Problem:**
```javascript
// Event history (for debugging)
this.history = [];
this.maxHistory = 100;
this.recordHistory = false; // NIGDY NIE WŁĄCZONE!

// Kod który nigdy się nie wykona
if (this.recordHistory) {
    this.history.push({ event: eventName, data, timestamp: Date.now() });
    if (this.history.length > this.maxHistory) {
        this.history.shift();
    }
}
```

**Rozwiązanie:**
- Opcja A: Usunąć całkowicie (~60 linii)
- Opcja B: Dodać metodę `enableHistory()` jeśli kiedyś będzie potrzebna

**Oszczędność:** ~60 linii (jeśli usunięte)

---

### 5. **DEAD CODE - Unused Geometry Functions** ⭐⭐⭐
**Priorytet:** Średni  
**Lokacja:** [ui/core/geometry.js](ui/core/geometry.js)

**Problem:**
```javascript
// NIGDY NIE UŻYWANE w całym projekcie!
export function circleHit(x, y, cx, cy, radius) { ... }  // 0 użyć
export function lerp(a, b, t) { ... }                     // 0 użyć
export function unlerp(a, b, value) { ... }               // 0 użyć
```

Używane są tylko: `rectHit`, `clamp`

**Rozwiązanie:**
Usunąć nieużywane funkcje

**Oszczędność:** ~30 linii w source + bundle size

---

### 6. **DUPLIKACJA - Text Content Resolution** ⭐⭐⭐⭐
**Priorytet:** Wysoki  
**Lokacja:** [ui/components/TextItem.js](ui/components/TextItem.js)

**Problem:**
```javascript
// Ten sam kod 3 razy w tym samym pliku!
const textContent = typeof this.text === 'function' ? this.text() : this.text;
// Linie: 55, 88, 95
```

**Rozwiązanie:**
```javascript
class TextItem extends UIItem {
    // Helper method
    _resolveText() {
        return typeof this.text === 'function' ? this.text() : this.text;
    }
    
    draw(ctx, window, x, y) {
        const textContent = this._resolveText();
        // ...
    }
}
```

**Oszczędność:** Lepsza maintainability, DRY

---

### 7. **DUPLIKACJA - typeof Function Checks** ⭐⭐
**Priorytet:** Niski (można, ale optional)  
**Lokacja:** Wszędzie w projekcie

**Problem:**
```javascript
// Powtarza się dziesiątki razy
if (typeof x === 'function') { ... }
if (typeof sim.update === 'function') { ... }
if (this.onClose && typeof this.onClose === 'function') { ... }
```

**Rozwiązanie:**
```javascript
// Utility helper
function isFunction(fn) {
    return typeof fn === 'function';
}

// Użycie
if (isFunction(sim.update)) { ... }
```

**Oszczędność:** Minima, ale czytelniejszy kod

---

## 📊 PODSUMOWANIE

| Problem | Priorytet | Linii do usunięcia | Impact |
|---------|-----------|-------------------|--------|
| Window registration pattern | ⭐⭐⭐⭐⭐ | ~40 | Krityczny |
| Window removal pattern | ⭐⭐⭐⭐ | ~10 | Wysoki |
| Dead modes (SimulationManager) | ⭐⭐⭐⭐⭐ | ~25 | Krityczny |
| EventBus history | ⭐⭐⭐ | ~60 | Średni |
| Unused geometry functions | ⭐⭐⭐ | ~30 | Średni |
| Text resolution duplication | ⭐⭐⭐⭐ | Refactor | Wysoki |
| typeof checks | ⭐⭐ | Refactor | Niski |

**RAZEM:** ~165 linii niepotrzebnego kodu + duplikacje

---

## 🎯 REKOMENDOWANY PLAN DZIAŁANIA

### Faza 1: Critical (natychmiast)
1. ✅ Dodać `registerWindow()` i `unregisterWindow()` helpers
2. ✅ Usunąć `getMode()` i `setMode()` z SimulationManager
3. ✅ Dodać `_resolveText()` w TextItem

### Faza 2: Cleanup (niedługo)
4. ✅ Usunąć EventBus history system
5. ✅ Usunąć nieużywane funkcje z geometry.js

### Faza 3: Optional (przyszłość)
6. ⚪ Dodać `isFunction()` utility (opcjonalne)

**Spodziewany efekt:**
- 📉 -165 linii kodu
- 🎯 Lepsza maintainability
- 🚀 Mniejszy bundle size (~2-3 KB)
- ✨ Czystszy, bardziej DRY kod

---

## 💡 DODATKOWE UWAGI

### Pozytywne aspekty obecnego kodu:
- ✅ Dobra modularyzacja (ui/core/components)
- ✅ Consistent naming conventions
- ✅ Dobre komentarze i dokumentacja
- ✅ Już zoptymalizowane cache (layoutDirty fix)

### Potencjalne przyszłe ulepszenia:
- 🔮 Builder pattern dla okien (`new WindowBuilder().title().pos().build()`)
- 🔮 Window lifecycle hooks (onOpen, onMinimize, onMaximize)
- 🔮 Global event system dla window events
- 🔮 Window templates/presets

