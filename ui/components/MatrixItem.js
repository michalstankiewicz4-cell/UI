// ═══════════════════════════════════════════════════════════════
//   MATRIX ITEM - Interactive Value Matrix
// ═══════════════════════════════════════════════════════════════

import { UIItem } from './UIItem.js';

/**
 * MatrixItem - Interactive matrix with editable values
 * 
 * Features:
 * - Click cells to edit values
 * - Color coding: red (negative), blue (0), green (positive)
 * - Intensity based on absolute value
 * - Visual value display in each cell
 */
class MatrixItem extends UIItem {
    constructor(rows, cols, getValue, setValue, minValue = -1, maxValue = 1, label = 'Matrix') {
        super('matrix');
        this.rows = rows;
        this.cols = cols;
        this.getValue = getValue;  // (row, col) => value
        this.setValue = setValue;  // (row, col, value) => void
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.label = label;
        
        // UI properties
        this.cellSize = 32;
        this.labelWidth = 40;
        this.headerHeight = 40;
        
        // Interaction state
        this.selectedCell = null; // { row, col }
        this.editingCell = null;
        this.editValue = '';
        
        // Button properties
        this.buttonSize = 18;
        this.valueStep = 0.1;
    }
    
    getHeight(window) {
        return this.headerHeight + this.rows * this.cellSize + 30;
    }
    
    getColorForValue(value) {
        if (value === 0) {
            return { r: 0, g: 100, b: 255, alpha: 0.7 };
        }
        
        if (value > 0) {
            const intensity = Math.min(value / this.maxValue, 1);
            const green = Math.floor(150 + intensity * 105);
            return { r: 0, g: green, b: 50, alpha: 0.6 + intensity * 0.3 };
        } else {
            const intensity = Math.min(Math.abs(value) / Math.abs(this.minValue), 1);
            const red = Math.floor(150 + intensity * 105);
            return { r: red, g: 0, b: 0, alpha: 0.6 + intensity * 0.3 };
        }
    }
    
    draw(ctx, window, x, y) {
        const STYLES = this.STYLES || {};
        
        // Title
        ctx.fillStyle = STYLES.colors?.panel || '#00ff88';
        ctx.font = '12px Courier New';
        ctx.textAlign = 'left';
        ctx.fillText(this.label, x, y + 14);
        
        const matrixX = x + this.labelWidth;
        const matrixY = y + this.headerHeight;
        
        // Column labels
        if (this.cols <= 10) {
            ctx.font = '12px Courier New';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = STYLES.colors?.panel || '#00ff88';
            
            for (let col = 0; col < this.cols; col++) {
                const labelX = matrixX + col * this.cellSize + this.cellSize / 2;
                const labelY = matrixY - 10;
                ctx.fillText(col.toString(), labelX, labelY);
            }
        }
        
        // Row labels
        if (this.rows <= 10) {
            ctx.font = '12px Courier New';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = STYLES.colors?.panel || '#00ff88';
            
            for (let row = 0; row < this.rows; row++) {
                const labelX = matrixX - 8;
                const labelY = matrixY + row * this.cellSize + this.cellSize / 2;
                ctx.fillText(row.toString(), labelX, labelY);
            }
        }
        
        // Matrix cells
        ctx.font = '12px Courier New';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cellX = matrixX + col * this.cellSize;
                const cellY = matrixY + row * this.cellSize;
                const value = this.getValue(row, col);
                
                const isSelected = this.selectedCell && 
                                  this.selectedCell.row === row && 
                                  this.selectedCell.col === col;
                
                const isEditing = this.editingCell && 
                                 this.editingCell.row === row && 
                                 this.editingCell.col === col;
                
                // Background
                const color = this.getColorForValue(value);
                ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.alpha})`;
                ctx.fillRect(cellX, cellY, this.cellSize, this.cellSize);
                
                // Border
                if (isSelected || isEditing) {
                    ctx.strokeStyle = '#ffff00';
                    ctx.lineWidth = 2;
                } else {
                    ctx.strokeStyle = STYLES.colors?.matrixCell || 'rgba(0, 255, 136, 0.2)';
                    ctx.lineWidth = 1;
                }
                ctx.strokeRect(cellX, cellY, this.cellSize, this.cellSize);
                
                // Value
                ctx.fillStyle = '#ffffff';
                const displayValue = isEditing ? this.editValue : value.toFixed(1);
                ctx.fillText(displayValue, cellX + this.cellSize / 2, cellY + this.cellSize / 2);
            }
        }
        
        // Plus/Minus buttons for selected cell
        if (this.selectedCell) {
            const row = this.selectedCell.row;
            const col = this.selectedCell.col;
            const cellX = matrixX + col * this.cellSize;
            const cellY = matrixY + row * this.cellSize;
            
            // Plus button (above)
            const btnUpX = cellX + this.cellSize / 2 - this.buttonSize / 2;
            const btnUpY = cellY - this.buttonSize - 4;
            
            ctx.fillStyle = 'rgba(0, 200, 0, 0.8)';
            ctx.fillRect(btnUpX, btnUpY, this.buttonSize, this.buttonSize);
            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 1;
            ctx.strokeRect(btnUpX, btnUpY, this.buttonSize, this.buttonSize);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Courier New';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('+', btnUpX + this.buttonSize / 2, btnUpY + this.buttonSize / 2);
            
            // Minus button (below)
            const btnDownX = cellX + this.cellSize / 2 - this.buttonSize / 2;
            const btnDownY = cellY + this.cellSize + 4;
            
            ctx.fillStyle = 'rgba(200, 0, 0, 0.8)';
            ctx.fillRect(btnDownX, btnDownY, this.buttonSize, this.buttonSize);
            ctx.strokeStyle = '#ff4444';
            ctx.lineWidth = 1;
            ctx.strokeRect(btnDownX, btnDownY, this.buttonSize, this.buttonSize);
            
            ctx.fillStyle = '#ffffff';
            ctx.fillText('-', btnDownX + this.buttonSize / 2, btnDownY + this.buttonSize / 2);
        }
    }
    
    update(mouseX, mouseY, mouseDown, mouseClicked, window, x, y) {
        super.update(mouseX, mouseY, mouseDown, mouseClicked, window, x, y);
        
        const matrixX = x + this.labelWidth;
        const matrixY = y + this.headerHeight;
        
        // Check buttons first (work even during editing)
        if (this.selectedCell && mouseClicked) {
            const row = this.selectedCell.row;
            const col = this.selectedCell.col;
            const cellX = matrixX + col * this.cellSize;
            const cellY = matrixY + row * this.cellSize;
            
            // Plus button
            const btnUpX = cellX + this.cellSize / 2 - this.buttonSize / 2;
            const btnUpY = cellY - this.buttonSize - 4;
            
            if (mouseX >= btnUpX && mouseX <= btnUpX + this.buttonSize &&
                mouseY >= btnUpY && mouseY <= btnUpY + this.buttonSize) {
                // Cancel editing if active, then adjust value
                this.editingCell = null;
                this.editValue = '';
                const currentValue = this.getValue(row, col);
                const newValue = Math.min(this.maxValue, currentValue + this.valueStep);
                this.setValue(row, col, newValue);
                return;
            }
            
            // Minus button
            const btnDownX = cellX + this.cellSize / 2 - this.buttonSize / 2;
            const btnDownY = cellY + this.cellSize + 4;
            
            if (mouseX >= btnDownX && mouseX <= btnDownX + this.buttonSize &&
                mouseY >= btnDownY && mouseY <= btnDownY + this.buttonSize) {
                // Cancel editing if active, then adjust value
                this.editingCell = null;
                this.editValue = '';
                const currentValue = this.getValue(row, col);
                const newValue = Math.max(this.minValue, currentValue - this.valueStep);
                this.setValue(row, col, newValue);
                return;
            }
        }
        
        // Check matrix cells
        if (mouseX >= matrixX && mouseX <= matrixX + this.cols * this.cellSize &&
            mouseY >= matrixY && mouseY <= matrixY + this.rows * this.cellSize) {
            
            const col = Math.floor((mouseX - matrixX) / this.cellSize);
            const row = Math.floor((mouseY - matrixY) / this.cellSize);
            
            if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
                // Check if clicking the same cell that is already selected
                const sameCell = this.selectedCell && 
                                this.selectedCell.row === row && 
                                this.selectedCell.col === col;
                
                this.selectedCell = { row, col };
                
                if (mouseClicked && sameCell) {
                    // Second click on same cell - start or stop editing
                    if (this.editingCell && 
                        this.editingCell.row === row && 
                        this.editingCell.col === col) {
                        // Submit edit
                        const newValue = parseFloat(this.editValue);
                        if (!isNaN(newValue)) {
                            const clampedValue = Math.max(this.minValue, Math.min(this.maxValue, newValue));
                            this.setValue(row, col, clampedValue);
                        }
                        this.editingCell = null;
                        this.editValue = '';
                    } else {
                        // Start editing
                        this.editingCell = { row, col };
                        this.editValue = this.getValue(row, col).toString();
                    }
                }
            }
        } else {
            if (!mouseDown) {
                this.selectedCell = null;
            }
            
            if (mouseClicked && this.editingCell) {
                this.editingCell = null;
                this.editValue = '';
            }
        }
    }
}

export { MatrixItem };

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MatrixItem };
}
