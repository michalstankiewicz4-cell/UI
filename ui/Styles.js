// ═══════════════════════════════════════════════════════════════
//   UI STYLES
// ═══════════════════════════════════════════════════════════════
// Extracted from Petrie Dish v5.1-C2
// Complete styling system for Canvas UI

const STYLES = {
    fonts: {
        main: '12px Courier New',           // Normal text
        mainBold: 'bold 12px Courier New',  // Titles, buttons
        small: '12px Courier New'           // Sections (lowercase text)
    },
    colors: {
        panel: '#00FF88',          // Green (buttons, frames, default text)
        text: '#00FF88',           // Green text (default)
        stats: '#00F5FF',          // Cyan text (statistics)
        sectionDim: 'rgba(0, 255, 136, 0.5)',
        scrollbarTrack: 'rgba(0, 0, 0, 0.3)',
        sliderTrack: 'rgba(0, 0, 0, 0.3)',
        sliderFill: '#00FF88',
        
        // Buttons & Controls
        buttonBg: 'rgba(0, 255, 136, 0.15)',         // Button background
        sliderBorder: 'rgba(0, 255, 136, 0.3)',      // Slider track border
        
        // Matrix
        matrixCell: 'rgba(0, 255, 136, 0.2)',        // Matrix cell border
        
        // Taskbar & Menu
        taskbarBg: 'rgba(0, 0, 0, 0.9)',             // Taskbar background
        menuBg: 'rgba(0, 0, 0, 0.95)',               // Menu background
        menuItemHud: 'rgba(0, 245, 255, 0.15)',      // HUD window in menu (cyan)
        menuItemMin: 'rgba(0, 255, 136, 0.15)',      // Minimized window in menu (green)
        menuItemNormal: 'rgba(0, 255, 136, 0.05)',   // Normal window in menu
        taskbarButtonBg: 'rgba(0, 255, 136, 0.2)',   // Taskbar button background
        startButtonBg: 'rgba(0, 255, 136, 0.1)'      // Start button background
    },
    spacing: {
        padding: 10,
        itemSpacing: 8,
        headerHeight: 26,
        buttonSize: 20,
        buttonSpacing: 4,
        lineHeight: 18,
        scrollbarWidth: 8
    },
    panel: {
        bgColor: 'rgba(0, 0, 0, 0.85)',
        borderColor: '#00FF88',
        borderWidth: 2,
        headerBgColor: 'rgba(0, 255, 136, 0.2)'
    }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = STYLES;
}
