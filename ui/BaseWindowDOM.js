// ═══════════════════════════════════════════════════════════════
//   BASE WINDOW DOM - CSS/DOM Edition
// ═══════════════════════════════════════════════════════════════

class BaseWindowDOM {
    constructor(x, y, title, type = 'panel') {
        this.x = x;
        this.y = y;
        this.title = title;
        this.type = type;
        this.width = 300;
        this.height = 400;
        
        // State
        this.visible = false;
        this.minimized = false;
        this.transparent = false;
        this.fullscreen = false;
        this.zIndex = 0;
        
        // Fullscreen restore
        this.restoreX = x;
        this.restoreY = y;
        this.restoreWidth = 300;
        this.restoreHeight = 400;
        
        // Dragging
        this.isDragging = false;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        
        // Resizing
        this.isResizing = false;
        this.minWidth = 200;
        this.minHeight = 150;
        this.manuallyResized = false;
        
        // Content
        this.items = [];
        
        // Callbacks
        this.onMinimize = null;
        this.onToggleTransparent = null;
        this.onClose = null;
        
        // DOM Element
        this.element = null;
        this.contentElement = null;
        
        this._createDOM();
        this._attachEvents();
    }
    
    // ═══════════════════════════════════════════════════════════════
    //   DOM CREATION
    // ═══════════════════════════════════════════════════════════════
    
    _createDOM() {
        // Main window element
        this.element = document.createElement('div');
        this.element.className = 'window';
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        this.element.style.width = this.width + 'px';
        this.element.style.height = this.height + 'px';
        this.element.style.zIndex = this.zIndex;
        this.element.style.display = 'none';
        
        // Header
        const header = document.createElement('div');
        header.className = 'window-header';
        
        const titleEl = document.createElement('div');
        titleEl.className = 'window-title';
        titleEl.textContent = this.title;
        
        const buttons = document.createElement('div');
        buttons.className = 'window-buttons';
        
        // Eye button
        const eyeBtn = document.createElement('button');
        eyeBtn.className = 'window-btn eye';
        eyeBtn.textContent = '👁';
        eyeBtn.title = 'Toggle transparency';
        eyeBtn.onclick = (e) => {
            e.stopPropagation();
            this.toggleTransparent();
        };
        
        // Maximize button
        const maxBtn = document.createElement('button');
        maxBtn.className = 'window-btn maximize';
        maxBtn.textContent = '□';
        maxBtn.title = 'Maximize / Restore';
        maxBtn.onclick = (e) => {
            e.stopPropagation();
            this.toggleFullscreen();
            maxBtn.textContent = this.fullscreen ? '◱' : '□';
        };
        this.maxBtn = maxBtn;
        
        // Minimize button
        const minBtn = document.createElement('button');
        minBtn.className = 'window-btn minimize';
        minBtn.textContent = '_';
        minBtn.title = 'Minimize';
        minBtn.onclick = (e) => {
            e.stopPropagation();
            this.minimize();
        };
        
        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'window-btn close';
        closeBtn.textContent = '×';
        closeBtn.title = 'Close';
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            this.close();
        };
        
        buttons.appendChild(eyeBtn);
        buttons.appendChild(maxBtn);
        buttons.appendChild(minBtn);
        buttons.appendChild(closeBtn);
        
        header.appendChild(titleEl);
        header.appendChild(buttons);
        
        // Content
        this.contentElement = document.createElement('div');
        this.contentElement.className = 'window-content';
        
        // Resize handle
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'window-resize-handle';
        
        // Assemble
        this.element.appendChild(header);
        this.element.appendChild(this.contentElement);
        this.element.appendChild(resizeHandle);
        
        // Store header for dragging
        this.headerElement = header;
        this.resizeHandleElement = resizeHandle;
    }
    
    // ═══════════════════════════════════════════════════════════════
    //   EVENT HANDLING
    // ═══════════════════════════════════════════════════════════════
    
    _attachEvents() {
        // Dragging
        this.headerElement.addEventListener('mousedown', (e) => {
            if (this.fullscreen) return;
            this.isDragging = true;
            this.dragOffsetX = e.clientX - this.x;
            this.dragOffsetY = e.clientY - this.y;
            e.preventDefault();
        });
        
        // Resizing
        this.resizeHandleElement.addEventListener('mousedown', (e) => {
            if (this.fullscreen) return;
            this.isResizing = true;
            this.manuallyResized = true;
            e.stopPropagation();
            e.preventDefault();
        });
        
        // Double-click header to toggle fullscreen
        this.headerElement.addEventListener('dblclick', (e) => {
            this.toggleFullscreen();
        });
    }
    
    handleMouseMove(e) {
        if (this.isDragging) {
            this.x = e.clientX - this.dragOffsetX;
            this.y = e.clientY - this.dragOffsetY;
            this.element.style.left = this.x + 'px';
            this.element.style.top = this.y + 'px';
        } else if (this.isResizing) {
            const newWidth = Math.max(this.minWidth, e.clientX - this.x);
            const newHeight = Math.max(this.minHeight, e.clientY - this.y);
            this.width = newWidth;
            this.height = newHeight;
            this.element.style.width = newWidth + 'px';
            this.element.style.height = newHeight + 'px';
        }
    }
    
    handleMouseUp() {
        this.isDragging = false;
        this.isResizing = false;
    }
    
    // ═══════════════════════════════════════════════════════════════
    //   ADD ITEMS
    // ═══════════════════════════════════════════════════════════════
    
    addButton(label, callback) {
        this.items.push({ type: 'button', label, callback });
        this._updateContent();
    }
    
    addToggle(label, getValue, setValue) {
        this.items.push({ type: 'toggle', label, getValue, setValue });
        this._updateContent();
    }
    
    addSlider(label, getValue, setValue, min, max, step = 0.01) {
        this.items.push({ type: 'slider', label, getValue, setValue, min, max, step });
        this._updateContent();
    }
    
    addText(text, color = null) {
        this.items.push({ type: 'text', text, color });
        this._updateContent();
    }
    
    addSection(title, sectionType = 'standard') {
        this.items.push({ type: 'section', title, sectionType });
        this._updateContent();
    }
    
    addSimulationView(simCanvas, height = 200) {
        this.items.push({ type: 'simview', simCanvas, height });
        this._updateContent();
    }
    
    addMatrix(rows, cols, getValue, setValue, minValue = -1, maxValue = 1, label = 'Matrix') {
        this.items.push({ type: 'matrix', rows, cols, getValue, setValue, minValue, maxValue, label });
        this._updateContent();
    }
    
    // ═══════════════════════════════════════════════════════════════
    //   CONTENT RENDERING
    // ═══════════════════════════════════════════════════════════════
    
    _updateContent() {
        this.contentElement.innerHTML = '';
        
        for (const item of this.items) {
            const el = this._createItemElement(item);
            if (el) {
                this.contentElement.appendChild(el);
            }
        }
    }
    
    _createItemElement(item) {
        switch (item.type) {
            case 'button':
                return this._createButton(item);
            case 'toggle':
                return this._createToggle(item);
            case 'slider':
                return this._createSlider(item);
            case 'text':
                return this._createText(item);
            case 'section':
                return this._createSection(item);
            case 'simview':
                return this._createSimulationView(item);
            case 'matrix':
                return this._createMatrix(item);
            default:
                return null;
        }
    }
    
    _createButton(item) {
        const btn = document.createElement('button');
        btn.className = 'ui-button ui-item';
        btn.textContent = item.label;
        btn.onclick = () => item.callback();
        return btn;
    }
    
    _createToggle(item) {
        const container = document.createElement('div');
        container.className = 'ui-toggle ui-item';
        
        const label = document.createElement('span');
        label.className = 'ui-toggle-label';
        label.textContent = item.label;
        
        const switchEl = document.createElement('div');
        switchEl.className = 'ui-toggle-switch';
        
        const knob = document.createElement('div');
        knob.className = 'ui-toggle-knob';
        switchEl.appendChild(knob);
        
        // Update state
        const updateState = () => {
            const value = item.getValue();
            if (value) {
                container.classList.add('active');
            } else {
                container.classList.remove('active');
            }
        };
        
        container.onclick = () => {
            item.setValue(!item.getValue());
            updateState();
        };
        
        updateState();
        
        container.appendChild(label);
        container.appendChild(switchEl);
        return container;
    }
    
    _createSlider(item) {
        const container = document.createElement('div');
        container.className = 'ui-slider ui-item';
        
        const header = document.createElement('div');
        header.className = 'ui-slider-header';
        
        const label = document.createElement('span');
        label.className = 'ui-slider-label';
        label.textContent = item.label;
        
        const valueDisplay = document.createElement('span');
        valueDisplay.className = 'ui-slider-value';
        
        header.appendChild(label);
        header.appendChild(valueDisplay);
        
        const track = document.createElement('div');
        track.className = 'ui-slider-track';
        
        const fill = document.createElement('div');
        fill.className = 'ui-slider-fill';
        
        const thumb = document.createElement('div');
        thumb.className = 'ui-slider-thumb';
        
        track.appendChild(fill);
        track.appendChild(thumb);
        
        // Update display
        const updateDisplay = () => {
            const value = item.getValue();
            const percent = ((value - item.min) / (item.max - item.min)) * 100;
            fill.style.width = percent + '%';
            thumb.style.left = percent + '%';
            valueDisplay.textContent = value.toFixed(2);
        };
        
        // Handle interaction
        const handleMove = (e) => {
            const rect = track.getBoundingClientRect();
            const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const value = item.min + percent * (item.max - item.min);
            const steppedValue = Math.round(value / item.step) * item.step;
            item.setValue(steppedValue);
            updateDisplay();
        };
        
        let isDragging = false;
        
        thumb.addEventListener('mousedown', (e) => {
            isDragging = true;
            e.stopPropagation();
        });
        
        track.addEventListener('mousedown', (e) => {
            handleMove(e);
            isDragging = true;
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                handleMove(e);
            }
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        updateDisplay();
        
        container.appendChild(header);
        container.appendChild(track);
        return container;
    }
    
    _createText(item) {
        const el = document.createElement('div');
        el.className = 'ui-text ui-item';
        const text = typeof item.text === 'function' ? item.text() : item.text;
        el.textContent = text;
        if (item.color) {
            el.style.color = item.color;
        }
        return el;
    }
    
    _createSection(item) {
        const el = document.createElement('div');
        el.className = 'ui-section ui-item';
        el.textContent = item.title;
        return el;
    }
    
    _createSimulationView(item) {
        const container = document.createElement('div');
        container.className = 'ui-simview ui-item';
        container.style.height = item.height + 'px';
        
        // Clone canvas content
        const canvas = document.createElement('canvas');
        canvas.width = item.simCanvas.width;
        canvas.height = item.simCanvas.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(item.simCanvas, 0, 0);
        
        container.appendChild(canvas);
        
        // Update periodically
        setInterval(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(item.simCanvas, 0, 0);
        }, 100);
        
        return container;
    }
    
    _createMatrix(item) {
        const container = document.createElement('div');
        container.className = 'ui-matrix ui-item';
        
        const label = document.createElement('div');
        label.className = 'ui-matrix-label';
        label.textContent = item.label;
        container.appendChild(label);
        
        const grid = document.createElement('div');
        grid.className = 'ui-matrix-grid';
        grid.style.gridTemplateColumns = `repeat(${item.cols}, 1fr)`;
        
        for (let r = 0; r < item.rows; r++) {
            for (let c = 0; c < item.cols; c++) {
                const cell = document.createElement('div');
                cell.className = 'ui-matrix-cell';
                
                const cellLabel = document.createElement('span');
                cellLabel.className = 'ui-matrix-cell-label';
                cellLabel.textContent = `[${r},${c}]`;
                
                const cellValue = document.createElement('span');
                cellValue.className = 'ui-matrix-cell-value';
                cellValue.textContent = item.getValue(r, c).toFixed(2);
                
                const btnContainer = document.createElement('div');
                btnContainer.className = 'ui-matrix-cell-buttons';
                
                const btnMinus = document.createElement('button');
                btnMinus.className = 'ui-matrix-btn';
                btnMinus.textContent = '-';
                btnMinus.onclick = () => {
                    const newVal = Math.max(item.minValue, item.getValue(r, c) - 0.1);
                    item.setValue(r, c, newVal);
                    cellValue.textContent = newVal.toFixed(2);
                };
                
                const btnPlus = document.createElement('button');
                btnPlus.className = 'ui-matrix-btn';
                btnPlus.textContent = '+';
                btnPlus.onclick = () => {
                    const newVal = Math.min(item.maxValue, item.getValue(r, c) + 0.1);
                    item.setValue(r, c, newVal);
                    cellValue.textContent = newVal.toFixed(2);
                };
                
                btnContainer.appendChild(btnMinus);
                btnContainer.appendChild(btnPlus);
                
                cell.appendChild(cellLabel);
                cell.appendChild(cellValue);
                cell.appendChild(btnContainer);
                
                grid.appendChild(cell);
            }
        }
        
        container.appendChild(grid);
        return container;
    }
    
    // ═══════════════════════════════════════════════════════════════
    //   WINDOW CONTROLS
    // ═══════════════════════════════════════════════════════════════
    
    show() {
        this.visible = true;
        this.minimized = false;
        this.element.style.display = 'flex';
        this.element.classList.remove('minimized');
    }
    
    hide() {
        this.visible = false;
        this.element.style.display = 'none';
    }
    
    minimize() {
        this.minimized = true;
        this.visible = false;
        this.element.style.display = 'none';
        this.element.classList.add('minimized');
        if (this.onMinimize) this.onMinimize();
    }
    
    restore() {
        this.minimized = false;
        this.visible = true;
        this.element.style.display = 'flex';
        this.element.classList.remove('minimized');
        this.element.classList.remove('transparent');
        this.transparent = false;
    }
    
    close() {
        this.visible = false;
        this.element.style.display = 'none';
        if (this.onClose) this.onClose();
    }
    
    toggleTransparent() {
        this.transparent = !this.transparent;
        if (this.transparent) {
            this.element.classList.add('transparent');
        } else {
            this.element.classList.remove('transparent');
        }
        if (this.onToggleTransparent) this.onToggleTransparent();
    }
    
    toggleFullscreen() {
        if (this.fullscreen) {
            // Restore
            this.fullscreen = false;
            this.x = this.restoreX;
            this.y = this.restoreY;
            this.width = this.restoreWidth;
            this.height = this.restoreHeight;
            this.element.classList.remove('fullscreen');
            this.element.style.left = this.x + 'px';
            this.element.style.top = this.y + 'px';
            this.element.style.width = this.width + 'px';
            this.element.style.height = this.height + 'px';
        } else {
            // Go fullscreen
            this.restoreX = this.x;
            this.restoreY = this.y;
            this.restoreWidth = this.width;
            this.restoreHeight = this.height;
            this.fullscreen = true;
            this.element.classList.add('fullscreen');
        }
        if (this.maxBtn) {
            this.maxBtn.textContent = this.fullscreen ? '◱' : '□';
        }
    }
    
    setZIndex(z) {
        this.zIndex = z;
        this.element.style.zIndex = z;
    }
    
    bringToFront() {
        // Handled by WindowManager
    }
    
    // ═══════════════════════════════════════════════════════════════
    //   UPDATE
    // ═══════════════════════════════════════════════════════════════
    
    update() {
        // Update dynamic content (text items, toggles, sliders)
        this._updateContent();
    }
}
