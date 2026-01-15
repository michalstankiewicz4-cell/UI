# 🌐 UI SYSTEM 3.0 — AI GUIDE

**Wersja:** 3.0 Compact  
**Data:** 2026-01-15  
**Tokeny:** ~1200 (było: ~2800, oszczędność: 57%)

Ten dokument zawiera wszystko co AI musi wiedzieć o projekcie UI.

---

## 1️⃣ ARCHITEKTURA — gdzie co jest

```
main.js
 ├─ WindowManager      → zarządza oknami
 ├─ Taskbar            → pasek zadań + menu start
 ├─ EventRouter        → routing inputu (taskbar → windows → components)
 ├─ SimulationManager  → zarządza symulacjami
 ├─ DataBridge         → UI ↔ Sim
 └─ EventBus           → globalne eventy

ui/
 ├─ BaseWindow.js      → pojedyncze okno (dragging, minimize, HUD, scrollbar)
 ├─ WindowManager.js   → kolekcja okien (z-index, focus)
 ├─ Taskbar.js         → start menu + przyciski okien (kolory: cyan=HUD, green=minimized)
 ├─ EventRouter.js     → mysz/klawiatura
 ├─ Styles.js          → kolory, fonty, spacingi
 ├─ core/              → layout.js, geometry.js, text-cache.js, constants.js
 └─ components/        → ButtonItem, SliderItem, ToggleItem, TextItem, SectionItem
                         header.js, scrollbar.js, UIItem.js (base class)

core/
 ├─ SimulationManager.js       → lifecycle, pause/resume, getMode/setMode (deprecated)
 ├─ EventBus.js                → pub-sub events
 ├─ DataBridge.js              → bindParameter, bindStat
 └─ SimulationWindowFactory.js → auto-generacja okien (FAZA D1 - nieaktywne)

simulations/
 ├─ sim1/Sim1.js      → 2D Particles
 ├─ sim2/Sim2.js      → 3D Cubes
 ├─ sim3/Sim3.js      → Physics Balls
 └─ sim4/Sim4.js      → Cellular Automata

dist/
 └─ ui.js             → bundled UI library (2399 linii, 90.74 KB)
```

---

## 2️⃣ QUICK REFERENCE — jak to zrobić

| Zadanie | Jak zrobić |
|---------|-----------|
| **Dodaj przycisk do okna** | `window.addButton('Label', () => {...})` |
| **Dodaj dynamiczny tekst** | `window.addText(() => \`Count: ${counter}\`)` |
| **Dodaj statyczny tekst** | `window.addText('Hello World', '#00ff88')` |
| **Dodaj slider** | `window.addSlider('Speed', getValue, setValue, min, max, step)` |
| **Dodaj toggle** | `window.addToggle('Grid', getValue, setValue)` |
| **Dodaj sekcję** | `window.addSection('physics', 'statistics')` |
| **Zmień kolor** | `ui/Styles.js` → `STYLES.colors.xxx` |
| **Otwórz okno** | `windowManager.add(window); window.visible = true` |
| **Dodaj do taskbara** | `taskbar.addWindowItem(title, window, 'section')` |
| **Rebuild bundle** | `.\build.ps1` (Windows) lub `./build.sh` (Linux/Mac) |

---

## 3️⃣ DODAWANIE KOMPONENTU UI

### Krok 1: Utwórz komponent
```javascript
// ui/components/MyItem.js
import { UIItem } from './UIItem.js';

class MyItem extends UIItem {
    constructor(label) {
        super('myitem');
        this.label = label;
    }
    
    draw(ctx, window, x, y) {
        ctx.fillStyle = '#00ff88';
        ctx.fillText(this.label, x, y + 12);
    }
    
    update(mouseX, mouseY, mouseDown, mouseClicked, window, x, y) {
        // Handle interaction
    }
    
    getHeight(window) {
        return 20; // Height in pixels
    }
}

export { MyItem };
```

### Krok 2: Dodaj metodę do BaseWindow
```javascript
// ui/BaseWindow.js
import { MyItem } from './components/MyItem.js';

addMyItem(label) {
    const item = new MyItem(label);
    this.items.push(item);
    this.layoutDirty = true;
    return item;
}
```

### Krok 3: Rebuild + użyj
```javascript
// main.js
window.addMyItem('Hello');
```

---

## 4️⃣ DODAWANIE SYMULACJI

### Krok 1: Utwórz symulację
```javascript
// simulations/sim5/Sim5.js
export class Simulation5 {
    static metadata = {
        name: 'My Simulation',
        description: 'Does cool stuff',
        type: '2D'
    };
    
    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        // Initialize
    }
    
    update(dt) {
        // Update logic
    }
    
    render() {
        // Render to canvas
    }
}
```

### Krok 2: Zarejestruj w main.js
```javascript
// main.js
simulationManager.register('sim5', 
    () => Promise.resolve(Simulation5), 
    Simulation5.metadata
);
```

### Krok 3: Dodaj UI (ręcznie lub przez Factory)
```javascript
// Ręcznie
const sim5Window = new UI.BaseWindow(50, 50, 'MY SIMULATION');
sim5Window.addButton('START', () => sim5.start());
sim5Window.addSlider('Speed', () => speed, (v) => speed = v, 0, 10, 0.1);
windowManager.add(sim5Window);
taskbar.addWindowItem('MY SIMULATION', sim5Window, 'symulacje');

// Lub czekaj na Factory (FAZA D1)
```

---

## 5️⃣ CZEGO NIE RUSZAĆ ⚠️

### ❌ NIGDY NIE EDYTUJ:
- **`dist/ui.js`** — auto-generated bundle
  - **Dlaczego:** Każdy build nadpisuje ten plik
  - **Co zamiast:** Edytuj pliki w `ui/` i `core/`, potem rebuild
  
- **`build.ps1` / `build.sh`** — build scripts
  - **Dlaczego:** Działają stabilnie, zmiany mogą zepsuć bundle
  - **Co zamiast:** Zgłoś problem jeśli build się sypie

- **`index.html`** — entry point
  - **Dlaczego:** Ustawienia canvas i ładowanie skryptów są krytyczne
  - **Co zamiast:** Zmiany tylko za zgodą

### ⚠️ OSTROŻNIE Z:
- **`EventBus.js`** — tylko jeśli dodajesz nowe eventy
- **`DataBridge.js`** — tylko jeśli dodajesz nowe bindingi
- **`SimulationManager.js`** — tylko jeśli zmieniasz lifecycle

### ✅ BEZPIECZNIE EDYTUJ:
- `ui/BaseWindow.js` — dodawanie komponentów
- `ui/Taskbar.js` — zmiany w menu/taskbarze
- `ui/components/*.js` — komponenty UI
- `ui/Styles.js` — kolory, fonty
- `main.js` — okna, logika aplikacji
- `simulations/**/*.js` — symulacje

---

## 6️⃣ CZĘSTE PUŁAPKI 🐛

### ❌ Błąd: "Unexpected token" w dist/ui.js
**Problem:** Wiele instrukcji w jednej linii
```javascript
// ❌ ŹLE
ctx.fillStyle = color;            ctx.fillRect(x, y, w, h);

// ✅ DOBRZE
ctx.fillStyle = color;
ctx.fillRect(x, y, w, h);
```
**Rozwiązanie:** Napraw w pliku źródłowym (ui/*.js), nie w dist/ui.js!

---

### ❌ Błąd: Liczniki nie aktualizują się dynamicznie
**Problem:** Tekst statyczny zamiast funkcji
```javascript
// ❌ ŹLE
window.addText(`Count: ${counter}`); // Wartość zamrożona

// ✅ DOBRZE
window.addText(() => `Count: ${counter}`); // Dynamicznie aktualizowane
```

---

### ❌ Błąd: window.mode nie istnieje
**Problem:** Używasz starego API trybów symulacji
```javascript
// ❌ ŹLE (stare API)
if (window.mode === 'hud') {...}

// ✅ DOBRZE (obecne API)
if (window.transparent && window.visible) {...} // HUD
if (window.minimized) {...}
if (window.fullscreen) {...}
```

---

### ❌ Błąd: Cache nie odświeża się
**Problem:** `layoutDirty` nie jest ustawiony
```javascript
// ✅ Po każdej zmianie layoutu:
this.layoutDirty = true;
```

---

### ❌ Błąd: Plik zablokowany przez przeglądarkę
**Problem:** Nie można przebudować bundle bo przeglądarka trzyma plik
```powershell
# ✅ Rozwiązanie:
Remove-Item dist\ui.js -Force
.\build.ps1
```

---

### ❌ Błąd: Okno nie pojawia się
**Problem:** Zapomniałeś ustawić `visible = true`
```javascript
// ✅ Zawsze:
const window = new UI.BaseWindow(x, y, 'Title');
window.visible = true; // BEZ TEGO OKNO JEST NIEWIDOCZNE
windowManager.add(window);
```

---

## 7️⃣ DEBUGGING 🔧

### Problem: Bundle się sypie po buildzie
**Gdzie szukać:**
1. Sprawdź ostatnie zmiany w `ui/`
2. Szukaj wielolinijkowych instrukcji (patrz sekcja 6)
3. Sprawdź czy wszystkie `import` są poprawne
4. Sprawdź nawiasy `{}` — czy są zbalansowane

**Pliki podejrzane:**
- `ui/BaseWindow.js` (największy plik, ~500 linii)
- `ui/Taskbar.js` (~450 linii)
- `ui/EventRouter.js`

---

### Problem: Okno nie renderuje się poprawnie
**Gdzie szukać:**
1. `ui/BaseWindow.js` → metoda `draw()`
2. `ui/components/*.js` → metoda `draw()` w komponencie
3. `ui/core/layout.js` → logika layoutu
4. Console (F12) → błędy JavaScript

---

### Problem: Kliknięcia nie działają
**Gdzie szukać:**
1. `ui/EventRouter.js` → kolejność obsługi zdarzeń
2. `ui/BaseWindow.js` → metoda `update()`
3. `ui/components/*.js` → metoda `update()` w komponencie
4. Sprawdź `z-index` okien (może jest zasłonięte)

---

### Problem: Symulacja nie dodaje się
**Gdzie szukać:**
1. Console (F12) → błędy ładowania
2. `main.js` → czy `simulationManager.register()` jest wywołany
3. `simulations/simX/SimX.js` → czy eksportuje klasę
4. `core/SimulationManager.js` → metoda `addSimulation()`

---

## 8️⃣ BUILD PROCESS

### Build bundle:
```powershell
# Windows
.\build.ps1

# Linux/Mac
./build.sh
```

### Co robi build:
1. Łączy wszystkie pliki z `ui/` w jeden plik
2. Dodaje header i footer
3. Zapisuje do `dist/ui.js`
4. **NIE** minifikuje kodu (dev mode)

### Po każdym buildzie:
```powershell
# Hard refresh w przeglądarce
Ctrl + Shift + R
```

---

## 9️⃣ FILE LOCATIONS CHEAT SHEET

| Czego szukasz | Gdzie jest |
|---------------|-----------|
| Kolory | `ui/Styles.js` |
| Dodawanie komponentów do okna | `ui/BaseWindow.js` |
| Pojedynczy komponent | `ui/components/*.js` |
| Dragging okien | `ui/BaseWindow.js` → `startDrag()` |
| Scrollbar | `ui/components/scrollbar.js` |
| Header (przyciski X, _, ○) | `ui/components/header.js` |
| Taskbar menu | `ui/Taskbar.js` → `buildStartMenu()` |
| Routing myszy | `ui/EventRouter.js` |
| Layout obliczenia | `ui/core/layout.js` |
| Text measurement cache | `ui/core/text-cache.js` |
| Lifecycle symulacji | `core/SimulationManager.js` |
| UI ↔ Sim binding | `core/DataBridge.js` |
| Globalne eventy | `core/EventBus.js` |

---

## 🔟 TYPOWE WORKFLOW

### Scenariusz 1: Dodaj nowy przycisk do istniejącego okna
```
1. Znajdź okno w main.js
2. Dodaj: window.addButton('Label', callback)
3. Ctrl + R w przeglądarce
```

### Scenariusz 2: Zmień kolor elementu
```
1. Otwórz ui/Styles.js
2. Zmień STYLES.colors.xxx
3. Rebuild: .\build.ps1
4. Ctrl + Shift + R w przeglądarce
```

### Scenariusz 3: Napraw błąd w bundlu
```
1. NIE EDYTUJ dist/ui.js
2. Sprawdź ostatnie zmiany w ui/ lub core/
3. Napraw błąd w źródle
4. Rebuild: .\build.ps1
5. Test w przeglądarce
```

### Scenariusz 4: Dodaj nową symulację
```
1. Utwórz simulations/sim5/Sim5.js (patrz sekcja 4)
2. Zarejestruj w main.js
3. Dodaj UI (window + controls)
4. Test
```

---

**Koniec dokumentu** — masz teraz wszystko co potrzebne! 🚀