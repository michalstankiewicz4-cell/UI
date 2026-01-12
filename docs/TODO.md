# UI System - TODO & Roadmap

**Updated:** 2026-01-12  
**Version:** v2.2  
**Status:** Performance Optimization Complete + Factory Planned ✅

**See also:** [ROADMAP.md](ROADMAP.md) for complete optimization details

---

## ✅ COMPLETED

### v2.2 Performance Optimization (2026-01-12)
- ✅ OPT-1: Layout cache (+20-40% FPS!) 🔥
- ✅ OPT-3: Zombie code removal
- ✅ OPT-6: Cache size increase (5000)
- ✅ OPT-7: EventRouter mousemove early exit
- ✅ OPT-11: Taskbar resize bugfix
- ✅ Slider drag state bugfix (critical)
- ✅ CONST export fix
- **Result:** +25-50% FPS, -15-25% CPU, 6 commits pushed to GitHub

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

## 🔜 TODO - Priority Order

### 🆕 FAZA D1: Simulation Window Factory (2-4h) 🎯

**Goal:** Automatic window creation from declarative config

**Current (manual):**
```javascript
const sim1Window = new BaseWindow(20, 20, 'SIM1');
sim1Window.addButton('SPAWN', () => spawn());
sim1Window.addSlider('Force', () => F, (v) => F = v, 0.5, 10);
windowManager.add(sim1Window);
taskbar.addWindowItem('SIM1', sim1Window, 'simulations');
```

**Proposed (factory):**
```javascript
const sim1Window = SimulationWindowFactory.create({
    id: 'sim1',
    title: 'SIM1 SIMULATION',
    position: { x: 20, y: 20 },
    controls: [
        { type: 'button', label: 'SPAWN', action: () => spawn() },
        { type: 'slider', label: 'Force', bind: 'F', min: 0.5, max: 10 }
    ],
    taskbarSection: 'simulations'
});
```

**Features:**
- ✅ Config-based window creation
- ✅ Auto-register with WindowManager + Taskbar
- ✅ Control templates
- 🔜 Data binding helpers
- 🔜 Preset saving/loading (/data/presets/)
- 🔜 State persistence

**Priority:** 🟡 HIGH (reduces boilerplate, improves maintainability)  
**Estimated time:** 2-4 hours  
**Risk:** Low (new code, no refactoring)

---

### 🔧 Remaining Performance Optimizations

**See [ROADMAP.md](ROADMAP.md) for full details**

**Package A: Easy Wins (45 min)** - Safe, +7-15%
- OPT-2: Remove `transparent` property (10 min)
- OPT-4: Pre-render color strings (15 min)
- OPT-5: Color LUT for matrix (20 min)

**Package B: Medium (65 min)** - Moderate, +5-9%
- OPT-9: Skip slider calcs when not hovered (30 min)
- OPT-10: Throttle stats cache (20 min)
- OPT-12: Cache slider range (15 min)

**Package C: Architecture (10-13h)** - High risk, +60-110%
- OPT-13: Event bubbling (3-4h)
- OPT-14: Dirty region rendering (4-6h)
- OPT-15: Virtual scrolling (2-3h)

---

### FAZA C4: Advanced Sliders (~2-3h)

**Range Slider (Dual Handle):**
```javascript
window.addRangeSlider(
    'Filter Range',
    () => [minVal, maxVal],
    (min, max) => { minVal = min; maxVal = max; },
    0, 10, 0.1
);
```

**Vertical Slider:**
```javascript
window.addVerticalSlider('Volume', () => vol, (v) => vol = v, 0, 100);
```

**Priority:** 🔶 MEDIUM (nice to have)

---

### Future Features (Low Priority)

- [ ] Import/Export UI layouts (use /data/presets/)
- [ ] Custom themes system (use /themes/)
- [ ] Matrix control (for Petri Dish)
- [ ] Keyboard shortcuts
- [ ] Window snapping
- [ ] Color picker control
- [ ] Dropdown/Select control

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
| 2026-01-12 | v2.2 Performance Optimization | ✅ |
| TBD | FAZA D1 Simulation Factory | 🔜 ⭐ |
| TBD | Package A+B Optimizations | 🔜 |
| TBD | FAZA C4 Advanced sliders | 🔜 |

---

## 📊 Current Stats

- **Bundle:** 1972 lines (dist/ui.js)
- **Performance:** +25-50% FPS vs v2.1
- **BaseWindow:** ~445 lines
- **Taskbar:** ~126 lines
- **WindowManager:** ~126 lines
- **Total codebase:** ~9000 lines
- **Commits:** 101+

---

## 🎯 Next Session Goals

**Priority 1:** Simulation Window Factory (2-4h)
- Declarative window creation
- Reduce boilerplate
- Foundation for presets

**Priority 2:** Easy optimizations (45 min)
- Package A (OPT-2, 4, 5)
- Safe, tested, +7-15% gain

**Priority 3:** Advanced features (as needed)
- Range slider, vertical slider
- Based on actual use cases

**Estimated time:** 3-5 hours for Priority 1+2
