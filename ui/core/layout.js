// ═══════════════════════════════════════════════════════════════
//   LAYOUT ENGINE
// ═══════════════════════════════════════════════════════════════
// Compute positions and heights for all UI elements

import {
    HEIGHT_BUTTON,
    HEIGHT_SLIDER, 
    HEIGHT_TOGGLE,
    HEIGHT_SECTION,
    HEIGHT_TEXT_LINE,
    SPACING_ITEM
} from './constants.js';

/**
 * Get height for a single item
 */
export function getItemHeight(item) {
    switch (item.type) {
        case 'button': return HEIGHT_BUTTON;
        case 'slider': return HEIGHT_SLIDER;
        case 'toggle': return HEIGHT_TOGGLE;
        case 'section': return HEIGHT_SECTION;
        case 'text': {
            const lines = item.lines || 1;
            return lines * HEIGHT_TEXT_LINE;
        }
        case 'matrix': {
            // Matrix: 16×16 cells + labels + title
            return 16 * item.cellSize + item.labelWidth + 30;
        }
        default: return 20;
    }
}

/**
 * Compute layout for all items in window
 * Returns array of {type, y, height, item}
 */
export function computeLayout(items, window) {
    const layout = [];
    let currentY = window.headerHeight + window.padding;
    
    for (const item of items) {
        const height = getItemHeight(item);
        
        layout.push({
            type: item.type,
            y: currentY,
            height: height,
            item: item
        });
        
        currentY += height + SPACING_ITEM;
    }
    
    return layout;
}
