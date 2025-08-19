/*
* Copyright © 2025. Cloud Software Group, Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/

/**
 * Context menu for label visibility settings
 * Uses a settings icon instead of right-click to avoid conflicts
 */

let contextMenu = null;
let settingsIcon = null;
let currentMod = null;
let currentLabelProperty = null;

/**
 * Initialize context menu functionality with settings icon
 */
const initializeContextMenu = (mod, labelProperty) => {
    currentMod = mod;
    currentLabelProperty = labelProperty;
    
    // Remove existing elements if they exist
    if (contextMenu) {
        document.body.removeChild(contextMenu);
    }
    if (settingsIcon) {
        document.body.removeChild(settingsIcon);
    }
    
    // Create settings icon
    createSettingsIcon();
    
    // Create context menu element
    contextMenu = document.createElement('div');
    contextMenu.className = 'range-plot-context-menu';
    contextMenu.style.display = 'none';
    
    // Add CSS for context menu and settings icon
    addContextMenuStyles();
    
    // Add event listeners
    document.addEventListener('click', hideContextMenu);
    
    document.body.appendChild(contextMenu);
    document.body.appendChild(settingsIcon);
};

/**
 * Create the settings icon
 */
const createSettingsIcon = () => {
    settingsIcon = document.createElement('div');
    settingsIcon.className = 'range-plot-settings-icon';
    settingsIcon.title = 'Label Settings';
    settingsIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
            <path d="M16 10.66a2.078 2.078 0 0 1-3.63.34h-.47v3.9H9.15l.29-.3-.36-.66-.06-.11-.07-.13-.02-.03a.21.21 0 0 0-.04-.06 1.088 1.088 0 0 0 .08-.31c.03-.01.07-.03.11-.04h.93v-3.15l-.83-.15a3.964 3.964 0 0 1-.43-.11 1.748 1.748 0 0 1 .11-.18l.1-.15.04-.05.02-.05.06-.11.36-.66-.53-.54-.92-.91-.54-.54-.66.37-.11.06-.37.19c-.04-.12-.08-.22-.11-.3l-.01-.02v-.97H2.91v.98l-.1.33-.52-.28-.22-.12H2V5h4v-.26a2.027 2.027 0 0 1-.94-2.25A2.003 2.003 0 1 1 8 4.73V5h3.9v4h.47a1.972 1.972 0 0 1 1.73-1 2.01 2.01 0 0 1 1.9 2.66z" style="stroke: rgba(0, 0, 0, 0);"></path>
            <path d="M8.65 10.88c-.1-.03-.21-.06-.34-.1l-.52-.16a2.044 2.044 0 0 0-.28-.64l.33-.58c.05-.09.11-.19.17-.28l.04-.06.08-.12.06-.11-.91-.91-.11.06-.13.07-.95.5a2.99 2.99 0 0 0-.63-.29l-.11-.57a1.275 1.275 0 0 0-.12-.41l-.05-.17V7H3.92v.11l-.33 1.15c-.23.11-.41.17-.64.29l-.28-.18-.01-.01-.05-.02L2 8.02l-.19-.1h-.05l-.51.56-.34.3.06.11.56 1.09a2.39 2.39 0 0 0-.22.58l-.62.16a3.771 3.771 0 0 1-.69.24v1.27l.11.05 1.2.33c.05.19.16.41.22.58l-.56 1.1-.06.11.85.86h.05l.69-.38.45-.22a2.041 2.041 0 0 0 .58.22l.34 1.02.04.07.01.03h1.26l.05-.1.33-1.02a2.594 2.594 0 0 0 .64-.28l.51.28.68.36.61-.63.19-.19-.06-.11-.05-.05a4.025 4.025 0 0 0-.24-.46l-.28-.58a2.242 2.242 0 0 0 .28-.63l.54-.17a3.388 3.388 0 0 0 .51-.17H9v-1.29a3.502 3.502 0 0 1-.35-.08zm-4.12 2.44a1.82 1.82 0 0 1 0-3.64 1.82 1.82 0 0 1 0 3.64z" style="stroke: rgba(0, 0, 0, 0);"></path>
        </svg>
    `;
    
    // Position the settings icon
    updateSettingsIconPosition();
    
    // Add click handler
    settingsIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        const rect = settingsIcon.getBoundingClientRect();
        showContextMenu(rect.left, rect.bottom + 5);
    });
    
    // Add hover handlers to the mod container to show/hide settings icon
    setupHoverHandlers();
};

/**
 * Setup hover handlers to show/hide settings icon
 */
const setupHoverHandlers = () => {
    const body = document.body;
    if (!body || !settingsIcon) return;
    
    body.addEventListener('mouseenter', () => {
        settingsIcon.style.opacity = '0.8';
        settingsIcon.style.visibility = 'visible';
    });
    
    body.addEventListener('mouseleave', (e) => {
        // Check if we're moving to the settings icon
        if (!settingsIcon.contains(e.relatedTarget)) {
            settingsIcon.style.opacity = '0';
            settingsIcon.style.visibility = 'hidden';
        }
    });
    
    // Keep icon visible when hovering over it
    settingsIcon.addEventListener('mouseenter', () => {
        settingsIcon.style.opacity = '1';
        settingsIcon.style.visibility = 'visible';
    });
    
    // Hide icon when leaving it (unless moving back to body)
    settingsIcon.addEventListener('mouseleave', (e) => {
        if (!body.contains(e.relatedTarget)) {
            settingsIcon.style.opacity = '0';
            settingsIcon.style.visibility = 'hidden';
        }
    });
};

/**
 * Add CSS styles for context menu and settings icon
 */
const addContextMenuStyles = () => {
    const existingStyle = document.getElementById('context-menu-styles');
    if (existingStyle) {
        existingStyle.remove();
    }
    
    const style = document.createElement('style');
    style.id = 'context-menu-styles';
    style.textContent = `
        .range-plot-settings-icon {
            position: fixed;
            top: 10px;
            right: 10px;
            cursor: pointer;
            z-index: 9999;
            visibility: hidden;
            transition: opacity 0.2s ease, visibility 0.2s ease, box-shadow 0.2s ease;
        }
        
        .range-plot-settings-icon:hover {
            opacity: 50% !important;
        }
        
        .range-plot-settings-icon svg {
            width: 21px;
            height: 21px;
            fill: #555;
            opacity: 0.4;
        }
        
        .range-plot-context-menu {
            position: fixed;
            background: white;
            border: 1px solid #ccc;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            padding: 8px 0;
            min-width: 180px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 13px;
        }
        
        .context-menu-item {
            padding: 8px 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .context-menu-item:hover {
            background-color: #f5f5f5;
        }
        
        .context-menu-item.disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .context-menu-item.disabled:hover {
            background-color: transparent;
        }
        
        .context-menu-separator {
            height: 1px;
            background-color: #e0e0e0;
            margin: 4px 0;
        }
        
        .context-menu-header {
            padding: 8px 16px;
            font-weight: bold;
            color: #666;
            border-bottom: 1px solid #e0e0e0;
            margin-bottom: 4px;
        }
        
        .checkbox-indicator {
            width: 16px;
            height: 16px;
            border: 1px solid #ccc;
            border-radius: 3px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: 8px;
        }
        
        .checkbox-indicator.checked {
            background-color: #2563eb;
            border-color: #2563eb;
            color: white;
        }
        
        .checkbox-indicator.checked::after {
            content: "✓";
            font-size: 12px;
        }
        
        .radio-indicator {
            width: 16px;
            height: 16px;
            border: 1px solid #ccc;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: 8px;
        }
        
        .radio-indicator.checked {
            border-color: #2563eb;
        }
        
        .radio-indicator.checked::after {
            content: "";
            width: 8px;
            height: 8px;
            background-color: #2563eb;
            border-radius: 50%;
        }
    `;
    
    document.head.appendChild(style);
};

/**
 * Update settings icon position relative to the plot container
 */
const updateSettingsIconPosition = () => {
    if (!settingsIcon) return;
    
    const plotContainer = document.querySelector('#mod-container');
    if (plotContainer) {
        const rect = plotContainer.getBoundingClientRect();
        settingsIcon.style.top = (rect.top + 10) + 'px';
        settingsIcon.style.left = (rect.right - 34) + 'px';
        settingsIcon.style.right = 'auto';
    }
};

/**
 * Show the context menu at specified coordinates
 */
const showContextMenu = (x, y) => {
    if (!currentLabelProperty) {
        console.warn('No label property available for context menu');
        return;
    }
    
    console.log('Showing label settings menu');
    
    // Get current label visibility settings
    const currentSettings = getLabelVisibilitySettings();
    
    // Build context menu content
    const isNoneMode = currentSettings.labelMode === 'none';
    contextMenu.innerHTML = `
        <div class="context-menu-header">Label Visibility</div>
        <div class="context-menu-item ${isNoneMode ? 'disabled' : ''}" data-action="toggle-min">
            <span>Show Min Labels</span>
            <div class="checkbox-indicator ${currentSettings.min && !isNoneMode ? 'checked' : ''}"></div>
        </div>
        <div class="context-menu-item ${isNoneMode ? 'disabled' : ''}" data-action="toggle-max">
            <span>Show Max Labels</span>
            <div class="checkbox-indicator ${currentSettings.max && !isNoneMode ? 'checked' : ''}"></div>
        </div>
        <div class="context-menu-item ${isNoneMode ? 'disabled' : ''}" data-action="toggle-value">
            <span>Show Value Labels</span>
            <div class="checkbox-indicator ${currentSettings.value && !isNoneMode ? 'checked' : ''}"></div>
        </div>
        <div class="context-menu-separator"></div>
        <div class="context-menu-header">Show Labels For</div>
        <div class="context-menu-item" data-action="labels-all">
            <span>All Rows</span>
            <div class="radio-indicator ${(!currentSettings.labelMode || currentSettings.labelMode === 'all') ? 'checked' : ''}"></div>
        </div>
        <div class="context-menu-item" data-action="labels-marked">
            <span>Marked Rows Only</span>
            <div class="radio-indicator ${currentSettings.labelMode === 'marked' ? 'checked' : ''}"></div>
        </div>
        <div class="context-menu-item" data-action="labels-none">
            <span>None</span>
            <div class="radio-indicator ${currentSettings.labelMode === 'none' ? 'checked' : ''}"></div>
        </div>
    `;
    
    // Add click handlers
    contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
        item.addEventListener('click', handleContextMenuClick);
    });
    
    // Position and show context menu
    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
    contextMenu.style.display = 'block';
    
    // Adjust position if menu goes off screen
    const rect = contextMenu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
        contextMenu.style.left = (x - rect.width) + 'px';
    }
    if (rect.bottom > window.innerHeight) {
        contextMenu.style.top = (y - rect.height) + 'px';
    }
};

/**
 * Hide the context menu
 */
const hideContextMenu = () => {
    if (contextMenu) {
        contextMenu.style.display = 'none';
    }
};

/**
 * Handle context menu item clicks
 */
const handleContextMenuClick = (e) => {
    e.stopPropagation();
    
    // Don't handle clicks on disabled items
    if (e.currentTarget.classList.contains('disabled')) {
        return;
    }
    
    const action = e.currentTarget.getAttribute('data-action');
    const currentSettings = getLabelVisibilitySettings();
    
    switch (action) {
        case 'toggle-min':
            currentSettings.min = !currentSettings.min;
            break;
        case 'toggle-max':
            currentSettings.max = !currentSettings.max;
            break;
        case 'toggle-value':
            currentSettings.value = !currentSettings.value;
            break;
        case 'labels-all':
            currentSettings.labelMode = 'all';
            break;
        case 'labels-marked':
            currentSettings.labelMode = 'marked';
            break;
        case 'labels-none':
            currentSettings.labelMode = 'none';
            break;
    }
    
    // Save settings and update display
    saveLabelVisibilitySettings(currentSettings);
    updateLabelVisibility(currentSettings);
    hideContextMenu();
};

/**
 * Get current label visibility settings from mod property
 */
const getLabelVisibilitySettings = () => {
    if (!currentLabelProperty) {
        return { min: true, max: true, value: true, labelMode: 'all' };
    }
    
    try {
        const settingsJson = currentLabelProperty.value();
        const settings = JSON.parse(settingsJson);
        // Ensure labelMode has a default value
        if (!settings.labelMode) {
            settings.labelMode = 'all';
        }
        return settings;
    } catch (error) {
        console.warn('Failed to parse label visibility settings:', error);
        return { min: true, max: true, value: true, labelMode: 'all' };
    }
};

/**
 * Save label visibility settings to mod property
 */
const saveLabelVisibilitySettings = (settings) => {
    if (!currentLabelProperty) {
        console.warn('No label property available to save settings');
        return;
    }
    
    try {
        const settingsJson = JSON.stringify(settings);
        currentLabelProperty.set(settingsJson);
        console.log('Saved label visibility settings:', settings);
    } catch (error) {
        console.error('Failed to save label visibility settings:', error);
    }
};

/**
 * Update label visibility in the DOM based on settings
 */
const updateLabelVisibility = (settings) => {
    // Get currently marked/selected row indices
    const selectedRowIndices = (typeof window.getSelectedRowIndices === 'function') 
        ? window.getSelectedRowIndices() 
        : new Set();
    
    // Determine which rows should show labels based on labelMode
    let shouldShowLabelsForRow = (rowIndex) => {
        if (settings.labelMode === 'none') {
            return false;
        } else if (settings.labelMode === 'marked') {
            return selectedRowIndices.has(rowIndex);
        } else { // 'all' mode
            return true;
        }
    };
    
    // Hide/show min labels
    document.querySelectorAll('[data-label-type="min"]').forEach(label => {
        const plotRow = label.closest('.plot-row');
        const rowIndex = plotRow ? parseInt(plotRow.getAttribute('data-row-index')) : -1;
        const shouldShow = settings.min && shouldShowLabelsForRow(rowIndex);
        label.style.display = shouldShow ? 'block' : 'none';
    });
    
    // Hide/show max labels
    document.querySelectorAll('[data-label-type="max"]').forEach(label => {
        const plotRow = label.closest('.plot-row');
        const rowIndex = plotRow ? parseInt(plotRow.getAttribute('data-row-index')) : -1;
        const shouldShow = settings.max && shouldShowLabelsForRow(rowIndex);
        label.style.display = shouldShow ? 'block' : 'none';
    });
    
    // Hide/show value labels
    document.querySelectorAll('[data-label-type="value"]').forEach(label => {
        const plotRow = label.closest('.plot-row');
        const rowIndex = plotRow ? parseInt(plotRow.getAttribute('data-row-index')) : -1;
        const shouldShow = settings.value && shouldShowLabelsForRow(rowIndex);
        label.style.display = shouldShow ? 'block' : 'none';
    });
    
    console.log('Updated label visibility:', settings, 'Selected rows:', Array.from(selectedRowIndices));
};

/**
 * Apply initial label visibility based on saved settings
 */
const applyLabelVisibility = () => {
    const settings = getLabelVisibilitySettings();
    updateLabelVisibility(settings);
};

/**
 * Clean up context menu
 */
const cleanupContextMenu = () => {
    if (contextMenu) {
        document.body.removeChild(contextMenu);
        contextMenu = null;
    }
    
    if (settingsIcon) {
        document.body.removeChild(settingsIcon);
        settingsIcon = null;
    }
    
    document.removeEventListener('click', hideContextMenu);
    
    const style = document.getElementById('context-menu-styles');
    if (style) {
        style.remove();
    }
};

/**
 * Test function to manually show context menu (for debugging)
 */
const testContextMenu = () => {
    console.log('Testing context menu...');
    showContextMenu(100, 100);
};

// Export functions
window.initializeContextMenu = initializeContextMenu;
window.updateSettingsIconPosition = updateSettingsIconPosition;
window.applyLabelVisibility = applyLabelVisibility;
window.cleanupContextMenu = cleanupContextMenu;
window.testContextMenu = testContextMenu; // For debugging
