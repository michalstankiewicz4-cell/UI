// ═══════════════════════════════════════════════════════════════
//   TEXT ITEM
// ═══════════════════════════════════════════════════════════════

import { UIItem } from './UIItem.js';

/**
 * TextItem - Static or dynamic text display (supports multiline + auto word wrap)
 */
class TextItem extends UIItem {
    constructor(text, color = '#00ff88') {
        super('text');
        this.text = text;
        this.color = color;
        this.wrappedLines = null; // Cache for wrapped lines
        this.lastWidth = 0; // Track window width changes
    }

    /**
     * Word wrap text to fit within available width
     * @param {string} text - Text to wrap
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} maxWidth - Maximum line width in pixels
     * @returns {string[]} Array of wrapped lines
     */
    wrapText(text, ctx, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const testLine = currentLine ? currentLine + ' ' + word : word;
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && currentLine) {
                // Line is too long, push current line and start new one
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        
        // Push last line
        if (currentLine) {
            lines.push(currentLine);
        }
        
        return lines;
    }

    getHeight(window) {
        // Get text content (resolve function if needed)
        const textContent = typeof this.text === 'function' ? this.text() : this.text;
        
        // Calculate available width for text
        const maxWidth = window.width - window.padding * 2;
        
        // Count lines (considering word wrap)
        let totalLines = 0;
        const paragraphs = textContent.split('\n');
        
        // Need ctx for measureText - use temporary measure or estimate
        // For height calculation, we'll estimate based on max width
        // Average word length ~5 chars, average width ~30px per word
        for (const paragraph of paragraphs) {
            if (paragraph.length === 0) {
                totalLines += 1; // Empty line
            } else {
                // Rough estimate: 7 chars per word * 6px per char = 42px per word + space
                const estimatedCharsPerLine = Math.floor(maxWidth / 7);
                const estimatedLines = Math.ceil(paragraph.length / estimatedCharsPerLine);
                totalLines += Math.max(1, estimatedLines);
            }
        }
        
        // 14px per line + 4px bottom padding for spacing
        return (totalLines * 14) + 4;
    }

    draw(ctx, window, x, y) {
        const STYLES = this.STYLES || window.STYLES;
        ctx.fillStyle = this.color;
        ctx.font = STYLES.fonts.main;
        
        // Get text content (resolve function if needed)
        const textContent = typeof this.text === 'function' ? this.text() : this.text;
        
        // Calculate available width for text
        const maxWidth = window.width - window.padding * 2;
        
        // Cache wrapped lines if window width unchanged AND text is static
        // For dynamic text (functions), always recalculate
        const isDynamicText = typeof this.text === 'function';
        const needsRecalculation = isDynamicText || !this.wrappedLines || this.lastWidth !== maxWidth;
        
        if (needsRecalculation) {
            const paragraphs = textContent.split('\n');
            this.wrappedLines = [];
            
            for (const paragraph of paragraphs) {
                if (paragraph.length === 0) {
                    this.wrappedLines.push(''); // Preserve empty lines
                } else {
                    const wrapped = this.wrapText(paragraph, ctx, maxWidth);
                    this.wrappedLines.push(...wrapped);
                }
            }
            
            this.lastWidth = maxWidth;
        }
        
        // Draw each wrapped line
        for (let i = 0; i < this.wrappedLines.length; i++) {
            ctx.fillText(this.wrappedLines[i], x, y + 12 + (i * 14));
        }
    }

    update(mouseX, mouseY, mouseDown, mouseClicked, window, x, y) {
        // Text doesn't interact
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TextItem };
}
