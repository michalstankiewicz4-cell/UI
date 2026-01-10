// ═══════════════════════════════════════════════════════════════
//   UI MODULE EXPORTS
// ═══════════════════════════════════════════════════════════════
// Main entry point for UI library
// Import all modules here

// Styles
const STYLES = require('./Styles.js');

// Core Classes
const BaseWindow = require('./BaseWindow.js');
const WindowManager = require('./WindowManager.js');
const Taskbar = require('./Taskbar.js');
const EventRouter = require('./EventRouter.js');

// Utils
const { measureTextCached, clearTextCache, getTextCacheStats } = require('../utils/TextCache.js');

// Export all
module.exports = {
    // Styles
    STYLES,
    
    // Classes
    BaseWindow,
    WindowManager,
    Taskbar,
    EventRouter,
    
    // Utils
    measureTextCached,
    clearTextCache,
    getTextCacheStats
};
