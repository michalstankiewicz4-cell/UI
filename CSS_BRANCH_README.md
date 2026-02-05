# UI System v3.1 - Modern CSS/DOM Edition (Branch CSS)

## 🎨 Zmiany w stosunku do main

### Architektura
- ❌ **Usunieto**: Canvas-based rendering (BaseWindow.js, WindowManager.js, Taskbar.js)
- ✅ **Dodano**: DOM-based rendering z nativeowymi elementami HTML
- ✅ **Nowy CSS**: `ui-modern.css` z nowoczesnym designem

### Nowe pliki
- `ui-modern.css` - Kompletny system stylów
- `ui/BaseWindowDOM.js` - Okna jako elementy DOM
- `ui/WindowManagerDOM.js` - Zarządca okien DOM
- `ui/TaskbarDOM.js` - Taskbar DOM z menu
- `core/SimulationWindowFactoryDOM.js` - Factory dla symulacji

### Design System

#### Kolory (Violet Theme)
- **Primary**: `#a78bfa` (Violet)
- **Secondary**: `#c084fc` (Purple)
- **Accent**: `#d8b4fe` (Light Violet)
- **Background**: Gradient `#1e1b4b → #312e81 → #1e1b4b`

#### Efekty wizualne
- **Glassmorphism**: `backdrop-filter: blur(20px) saturate(180%)`
- **Border Radius**: 12px (okna), 8px (komponenty)
- **Shadows**: 3 poziomy (sm/md/lg)
- **Animations**: Smooth transitions (150ms-350ms)

### Nowe funkcje

#### 1. Przycisk maksymalizacji (□/◱)
- Pełny ekran (bez taskbara)
- Przywracanie poprzednich wymiarów
- Ikona się zmienia: □ → ◱

#### 2. Ulepszona minimalizacja
- Okno całkowicie ukryte (`display: none`)
- Stan widoczny w taskbarze
- Przywracanie usuwa transparentność

#### 3. Przyciski okna
- **👁** - Toggle transparency (HUD mode)
- **□** - Maximize/Restore
- **_** - Minimize
- **×** - Close
- Tooltips przy hover
- Kolorowe hover efekty:
  - Close → Czerwony
  - Maximize → Zielony
  - Inne → Fioletowy

#### 4. Interaktywność
- Drag & drop (header)
- Resize (prawy dolny róg)
- Double-click na header → Maximize
- Click to focus (bring to front)

### Komponenty UI

Wszystkie komponenty z Canvas edition zachowane:
- ✅ Buttons
- ✅ Toggles (switch z animacją)
- ✅ Sliders (gradient fill)
- ✅ Text (dynamic)
- ✅ Sections
- ✅ Matrix (interactive grid)
- ✅ Simulation View

### Performance

**Canvas edition:**
- Każda klatka renderuje wszystko od nowa
- 60 FPS przy ~5 oknach

**CSS/DOM edition:**
- Przeglądarką optymalizuje rendering
- GPU acceleration (transform, opacity)
- Smooth 60 FPS przy >10 oknach
- Lepsze wsparcie dla animations

### Compatibility

- ✅ Chrome/Edge (pełne wsparcie)
- ✅ Firefox (pełne wsparcie)
- ✅ Safari (wymaga prefixes dla backdrop-filter)
- ❌ IE11 (brak wsparcia)

### Jak uruchomić

1. Otwórz `index.html` w przeglądarce
2. Kliknij `ADD SIM1` w SIMULATION CONTROLS
3. Przetestuj wszystkie funkcje okien

### Różnice Canvas vs CSS/DOM

| Feature | Canvas | CSS/DOM |
|---------|--------|---------|
| Rendering | Manual loop | Browser optimized |
| Styling | JS constants | CSS variables |
| Animations | Programmatic | CSS transitions |
| Accessibility | None | Native HTML |
| Tooltips | Manual | Native title |
| Text selection | None | Native |
| Mobile | Touch events | Native gestures |

## 🚀 Przyszłe ulepszenia

- [ ] Responsive design (mobile)
- [ ] Dark/Light theme toggle
- [ ] Custom themes
- [ ] Window snapping
- [ ] Multi-monitor support
- [ ] Keyboard shortcuts
- [ ] Window groups/tabs

## 📝 Notatki

Branch CSS jest eksperymentalny i może być dalej rozwijany niezależnie od main.
