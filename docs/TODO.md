# UI System - TODO & Roadmap

**Updated:** 2026-01-10  
**Version:** v2.1  
**Status:** FAZA C3 Complete ✅

---

## ✅ COMPLETED

### v2.1 Core Architecture
- ✅ SimulationManager (360 lines) - central controller
- ✅ EventBus (192 lines) - pub-sub events
- ✅ DataBridge (224 lines) - UI ↔ Sim data flow
- ✅ Event-driven communication
- ✅ Centralized management

### FAZA C1: Header Buttons
- ✅ Close (X) - removes window
- ✅ Minimize (_) - hides to taskbar
- ✅ Eye (○/●) - HUD mode (transparent overlay)
- ✅ Dragging in all modes
- ✅ Button click detection

### FAZA C2: Scrollbar
- ✅ Vertical scrollbar
- ✅ Thumb dragging
- ✅ Mouse wheel support
- ✅ Track click to jump
- ✅ Auto-hide when content fits

### FAZA C3: Interactive Controls
- ✅ Horizontal sliders (draggable thumb)
- ✅ Toggles (checkbox style)
- ✅ getValue/setValue callback pattern
- ✅ Step rounding for values
- ✅ Track click to jump
- ✅ Bugfix: Slider dragging (WindowManager integration)

### Polish & Features
- ✅ Text colors (green default, cyan stats)
- ✅ Word wrap for long text
- ✅ Centered sections (━━━ title ━━━)
- ✅ Menu sections (symulacje/system)
- ✅ Full window titles in menu
- ✅ Simplified structure (no /src/)
- ✅ /data/ folder for import/export (prepared)

---

## 🔜 TODO

### FAZA C3: Interactive Controls ✅ COMPLETE

**Sliders:** ✅
```javascript
window.addSlider('Speed', () => speed, (v) => speed = v, 0.1, 5.0, 0.05);
// Visual: Speed: [====●------] 2.5
```

**Toggles:** ✅
```javascript
window.addToggle('Grid', () => showGrid, (v) => showGrid = v);
// Visual: Grid: [☑] or [☐]
```

**Completed:**
- ✅ Horizontal sliders with draggable thumb
- ✅ Track click to jump to position
- ✅ Toggles (checkbox style)
- ✅ getValue/setValue callback pattern
- ✅ Step rounding for precise values
- ✅ Thumb drag detection (circular hit area)

**Files modified:**
- `ui/BaseWindow.js` - added drawSlider(), drawToggle(), checkSliderClick()
- `main.js` - demo sliders (Speed, Volume) + toggles (Grid, AutoSave)

---

### FAZA C4: Advanced Sliders (~2-3h)

**Range Slider (Dual Handle):**
```javascript
window.addRangeSlider(
    'Filter Range',
    () => [minVal, maxVal],
    (min, max) => { minVal = min; maxVal = max; },
    0,      // absoluteMin
    10,     // absoluteMax  
    0.1     // step
);
// Visual: Filter Range: [██●━━━━━●██] 2.0 - 5.0
//                          min    max
```

**Features:**
- Two draggable thumbs (min/max)
- Thumbs block each other (min can't pass max)
- Click track → move nearest thumb
- Normal mode: select range (2-5)
- Inverted mode: select outside range (0-2 + 5-10) [future]

**Use cases:**
- Data filtering (temperature, speed, etc)
- Range selection
- Min/max limits

**Vertical Slider:**
```javascript
window.addVerticalSlider('Volume', () => vol, (v) => vol = v, 0, 100);
// Visual: ┃  ┃ 75
//         ┃●━┃
//         ┃██┃
//         ┃██┃
//         ┗━━┛
```

**Priority:** 🔶 MEDIUM  
**Estimated time:** 2-3h (range slider: 1-1.5h, vertical: 1h)

---

### FAZA C5: Polish & Testing (~1-2h)

- [ ] Clean up code comments
- [ ] Test all features end-to-end
- [ ] Update all docs (README, CHANGELOG)
- [ ] Performance profiling
- [ ] Edge case testing

**Priority:** 🔶 MEDIUM

---

### Future Features (Optional)

- [ ] Range slider (dual handle) - see FAZA C4
- [ ] Vertical slider - see FAZA C4
- [ ] Import/Export UI layouts (use /data/presets/)
- [ ] Custom themes system (use /themes/)
- [ ] Matrix control (for Petri Dish)
- [ ] Keyboard shortcuts
- [ ] Window snapping
- [ ] Color picker control
- [ ] Dropdown/Select control

**Priority:** 🔷 LOW

---

## 📈 Progress Timeline

| Date | Milestone | Status |
|------|-----------|--------|
| 2026-01-08 | Repo created | ✅ |
| 2026-01-08 | Modular system | ✅ |
| 2026-01-09 | v2.0 Multi-sim | ✅ |
| 2026-01-09 | v2.1 Core architecture | ✅ |
| 2026-01-09 | FAZA C1 Header buttons | ✅ |
| 2026-01-09 | FAZA C2 Scrollbar | ✅ |
| 2026-01-10 | Structure cleanup | ✅ |
| 2026-01-10 | FAZA C3 Sliders/Toggles | ✅ |
| TBD | FAZA C4 Advanced sliders | 🔜 |
| TBD | FAZA C5 Polish | 🔜 |

---

## 📊 Current Stats

- **Bundle:** 1721 lines (dist/ui.js)
- **BaseWindow:** 962 lines (largest module)
- **Taskbar:** 342 lines
- **Core modules:** 776 lines total
- **Main orchestrator:** 241 lines
- **Total codebase:** ~8500 lines
- **Commits:** 95+

---

## 🎯 Next Session Goals

1. **FAZA C4:** Range slider (dual handle) + Vertical slider
2. **Optional:** Inverted range mode for filtering
3. **Test** advanced controls
4. **Update** documentation

**Estimated time:** 2-3 hours
