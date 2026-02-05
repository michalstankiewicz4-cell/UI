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
export function getItemHeight(item, window) {
    // Use item's own getHeight method if available (for dynamic sizing)
    if (item.getHeight && typeof item.getHeight === 'function') {
        return item.getHeight(window);
    }
    
    // Fallback to static heights
    switch (item.type) {
        case 'button': return HEIGHT_BUTTON;
        case 'slider': return HEIGHT_SLIDER;
        case 'toggle': return HEIGHT_TOGGLE;
        case 'section': return HEIGHT_SECTION;
        case 'text': {
            const lines = item.lines || 1;
            return lines * HEIGHT_TEXT_LINE;
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
        const height = getItemHeight(item, window);
        
        layout.push({
            type: item.type,
            y: currentY,
            height: height,
            item: item
        });
        
        // Spacing rules:
        // - Sections: 0px (visual dividers only)
        // - Text blocks: 4px (compact but readable)
        // - Other items: 8px (standard spacing)
        let spacing = SPACING_ITEM;
        if (item.type === 'section') {
            spacing = 0;
        } else if (item.type === 'text') {
            spacing = 4;
        }
        
        currentY += height + spacing;
    }
    
    return layout;
}
