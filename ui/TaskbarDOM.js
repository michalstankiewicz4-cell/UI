// ═══════════════════════════════════════════════════════════════
//   TASKBAR DOM - CSS/DOM Edition
// ═══════════════════════════════════════════════════════════════

class TaskbarDOM {
    constructor(simulationManager = null) {
        this.simulationManager = simulationManager;
        this.menuOpen = false;
        this.menuItems = [];
        
        // DOM elements
        this.taskbarElement = document.getElementById('taskbar');
        this.startButton = this.taskbarElement.querySelector('.taskbar-start');
        this.buttonsContainer = this.taskbarElement.querySelector('.taskbar-buttons');
        this.menuElement = document.getElementById('taskbar-menu');
        
        // Event listeners
        this.startButton.addEventListener('click', () => this.toggleMenu());
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.taskbarElement.contains(e.target) && !this.menuElement.contains(e.target)) {
                this.closeMenu();
            }
        });
    }
    
    toggleMenu() {
        this.menuOpen = !this.menuOpen;
        if (this.menuOpen) {
            this.menuElement.classList.add('visible');
            this.updateMenu();
        } else {
            this.menuElement.classList.remove('visible');
        }
    }
    
    closeMenu() {
        this.menuOpen = false;
        this.menuElement.classList.remove('visible');
    }
    
    addSection(title) {
        this.menuItems.push({ type: 'section', title });
    }
    
    addWindowItem(title, window, section = null, simId = null) {
        const windowItem = {
            type: 'window',
            title: title,
            windowTitle: window.title,
            window: window,
            simId: simId,
            isOpen: true
        };
        
        if (section) {
            // Find section and insert after it
            const sectionIndex = this.menuItems.findIndex(item => 
                item.type === 'section' && item.title === section
            );
            if (sectionIndex >= 0) {
                this.menuItems.splice(sectionIndex + 1, 0, windowItem);
                return;
            }
        }
        
        this.menuItems.push(windowItem);
        this.updateButtons();
    }
    
    removeWindowItem(window) {
        const index = this.menuItems.findIndex(item => 
            item.type === 'window' && item.window === window
        );
        if (index > -1) {
            this.menuItems.splice(index, 1);
            this.updateButtons();
        }
    }
    
    restoreWindow(item, windowManager) {
        // Always restore from any state
        item.window.visible = true;
        item.window.minimized = false;
        item.window.transparent = false;
        item.window.restore();
        
        if (windowManager) {
            if (!windowManager.windows.includes(item.window)) {
                windowManager.add(item.window);
            }
            windowManager.bringToFront(item.window);
        }
        
        item.isOpen = true;
        this.updateButtons();
    }
    
    updateButtons() {
        this.buttonsContainer.innerHTML = '';
        
        const windowItems = this.menuItems.filter(item => item.type === 'window');
        
        for (const item of windowItems) {
            const button = document.createElement('button');
            button.className = 'taskbar-button';
            button.textContent = item.title;
            
            if (item.window.visible && !item.window.minimized) {
                button.classList.add('active');
            }
            
            if (item.window.minimized) {
                button.classList.add('minimized');
            }
            
            button.addEventListener('click', () => {
                if (item.window.visible && !item.window.minimized) {
                    item.window.minimize();
                } else {
                    this.restoreWindow(item, window.windowManager);
                }
                this.updateButtons();
            });
            
            this.buttonsContainer.appendChild(button);
        }
    }
    
    updateMenu() {
        this.menuElement.innerHTML = '';
        
        // Group by sections
        let currentSection = null;
        let sectionContainer = null;
        
        for (const item of this.menuItems) {
            if (item.type === 'section') {
                // Create new section
                sectionContainer = document.createElement('div');
                sectionContainer.className = 'menu-section';
                
                const sectionTitle = document.createElement('div');
                sectionTitle.className = 'menu-section-title';
                sectionTitle.textContent = item.title;
                sectionContainer.appendChild(sectionTitle);
                
                this.menuElement.appendChild(sectionContainer);
                currentSection = item.title;
            } else if (item.type === 'window') {
                // Add window item to current section
                if (!sectionContainer) {
                    sectionContainer = document.createElement('div');
                    sectionContainer.className = 'menu-section';
                    this.menuElement.appendChild(sectionContainer);
                }
                
                const menuItem = document.createElement('div');
                menuItem.className = 'menu-item';
                menuItem.textContent = item.title;
                
                if (item.window.minimized) {
                    menuItem.classList.add('minimized');
                }
                
                menuItem.addEventListener('click', () => {
                    this.restoreWindow(item, window.windowManager);
                    this.closeMenu();
                });
                
                sectionContainer.appendChild(menuItem);
            }
        }
    }
    
    update() {
        // Update button states
        this.updateButtons();
        
        // Update menu if open
        if (this.menuOpen) {
            this.updateMenu();
        }
    }
}
