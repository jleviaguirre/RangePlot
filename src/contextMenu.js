/*
* Copyright © 2025. Cloud Software Group, Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/

/**
 * Context menu for label visibility settings
 * Uses a settings icon instead of right-click to avoid conflicts
 */

// Debug flag for context menu logging
isDebugging = true;

let contextMenu = null;
let settingsIcon = null;
let currentMod = null;
let currentLabelProperty = null;

/**
 * Initialize context menu functionality with settings icon
 */
const initializeContextMenu = (mod, labelProperty, hasValueAxis) => {
    isDebugging && console.log('Initializing context menu...', mod, labelProperty, hasValueAxis);
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
    
    isDebugging && console.log('Context menu initialized. Settings icon should be visible at:', settingsIcon.style.left, settingsIcon.style.top);
};

/**
 * Create the settings icon
 */
const createSettingsIcon = () => {
    isDebugging && console.log('Creating settings icon...');
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
        console.log('⚙️ Settings icon clicked');
        e.stopPropagation();
        e.preventDefault();
        
        // Check if we have marking before showing popout
        if (typeof window.getSelectedRowIndices === 'function') {
            const markedRows = window.getSelectedRowIndices();
            console.log('⚙️ Current marked rows before popout:', Array.from(markedRows || []));
        }
        
        const rect = settingsIcon.getBoundingClientRect();
        // showContextMenu(rect.left, rect.bottom + 5);
        showPopoutMenu(rect.left, rect.bottom + 5);
    });
    
    // Add hover handlers to show/hide settings icon
    setupHoverHandlers();
    
    isDebugging && console.log('Settings icon created and positioned');
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
            opacity: 0;
            transition: opacity 0.2s ease, visibility 0.2s ease, box-shadow 0.2s ease;
            pointer-events: auto;
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
        isDebugging && console.warn('No label property available for context menu');
        return;
    }
    
    isDebugging && console.log('Showing label settings menu');
    
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
 * Show the Spotfire popout menu using Mods API
 */
const showPopoutMenu = (x, y) => {
    if (!currentMod || !currentLabelProperty) {
        isDebugging && console.warn('No mod or label property available for popout');
        return;
    }
    
    isDebugging && console.log('Showing Spotfire popout at coordinates:', x, y);
    
    // Get current settings directly from the Mod Property
    const currentSettings = getLabelVisibilitySettings();
    const isNoneMode = currentSettings.labelMode === 'none';
    
    console.log('🎯 Creating popout with settings:', currentSettings);
    console.log('🎯 Is none mode:', isNoneMode);
    
    // Helper function to check property values (official pattern)
    const is = (property, value) => property === value;
    
    // Get popout components
    const { radioButton, checkbox } = currentMod.controls.popout.components;
    const { section } = currentMod.controls.popout;
    
    // Create label visibility checkboxes
    const minCheckbox = checkbox({ 
        enabled: !isNoneMode, 
        name: "min", 
        text: "Show Min Labels", 
        checked: Boolean(currentSettings.min)
    });
    
    console.log('📦 Created minCheckbox with:', { enabled: !isNoneMode, checked: Boolean(currentSettings.min) });
    
    const maxCheckbox = checkbox({ 
        enabled: !isNoneMode, 
        name: "max", 
        text: "Show Max Labels", 
        checked: Boolean(currentSettings.max)
    });
    
    console.log('📦 Created maxCheckbox with:', { enabled: !isNoneMode, checked: Boolean(currentSettings.max) });
    
    const valueCheckbox = checkbox({ 
        enabled: !isNoneMode, 
        name: "value", 
        text: "Show Value Labels", 
        checked: Boolean(currentSettings.value)
    });
    
    console.log('📦 Created valueCheckbox with:', { enabled: !isNoneMode, checked: Boolean(currentSettings.value) });
    
    // Create label mode radio buttons
    const allRadio = radioButton({ 
        enabled: true, 
        name: "labelMode", 
        value: "all",
        text: "All Rows", 
        checked: is(currentSettings.labelMode, 'all') || !currentSettings.labelMode
    });
    
    const markedRadio = radioButton({ 
        enabled: true, 
        name: "labelMode", 
        value: "marked",
        text: "Marked Rows Only", 
        checked: is(currentSettings.labelMode, 'marked')
    });
    
    const noneRadio = radioButton({ 
        enabled: true, 
        name: "labelMode", 
        value: "none",
        text: "None", 
        checked: is(currentSettings.labelMode, 'none')
    });
    
    // Show popout
    currentMod.controls.popout.show({ 
        x: x, 
        y: y, 
        autoClose: true,
        alignment: "Bottom",
        onChange: (e) => {
            console.log('🔄 Popout onChange triggered with event:', e);
            console.log('🔄 Event details - name:', e.name, 'value:', e.value, 'checked:', e.checked);
            
            // Get fresh settings from Mod Property for each change
            const freshSettings = getLabelVisibilitySettings();
            console.log('🔄 Fresh settings from Mod Property:', freshSettings);
            
            // Handle radio button changes for label mode
            if (e.name === "labelMode" && e.value) {
                console.log('📻 Handling radio button change to:', e.value);
                freshSettings.labelMode = e.value;
                
                // If switching to none mode, clear all checkboxes
                if (e.value === 'none') {
                    console.log('❌ Clearing all checkboxes due to none mode');
                    freshSettings.min = false;
                    freshSettings.max = false;
                    freshSettings.value = false;
                }
                
                // Save to Mod Property immediately
                saveLabelVisibilitySettings(freshSettings);
                updateLabelVisibility(freshSettings);
            }
            // Handle checkbox changes - use e.value instead of e.checked
            else if (e.name === "min") {
                console.log('☑️ Handling min checkbox change - e.checked:', e.checked, 'e.value:', e.value);
                freshSettings.min = Boolean(e.value);
                console.log('☑️ About to save settings:', freshSettings);
                saveLabelVisibilitySettings(freshSettings);
                console.log('☑️ About to update label visibility');
                updateLabelVisibility(freshSettings);
                console.log('☑️ Finished handling min checkbox');
            }
            else if (e.name === "max") {
                console.log('☑️ Handling max checkbox change - e.checked:', e.checked, 'e.value:', e.value);
                freshSettings.max = Boolean(e.value);
                console.log('☑️ About to save settings:', freshSettings);
                saveLabelVisibilitySettings(freshSettings);
                console.log('☑️ About to update label visibility');
                updateLabelVisibility(freshSettings);
                console.log('☑️ Finished handling max checkbox');
            }
            else if (e.name === "value") {
                console.log('☑️ Handling value checkbox change - e.checked:', e.checked, 'e.value:', e.value);
                freshSettings.value = Boolean(e.value);
                console.log('☑️ About to save settings:', freshSettings);
                saveLabelVisibilitySettings(freshSettings);
                console.log('☑️ About to update label visibility');
                updateLabelVisibility(freshSettings);
                console.log('☑️ Finished handling value checkbox');
            }
        },
        onClosed: () => {
            isDebugging && console.log('Popout closed');
        }
    }, () => [
        section({ 
            heading: "Label Visibility", 
            children: [minCheckbox, maxCheckbox, valueCheckbox] 
        }),
        section({ 
            heading: "Show Labels For", 
            children: [allRadio, markedRadio, noneRadio] 
        })
    ]);
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
        console.warn('🔴 No label property available, returning defaults');
        return { min: true, max: true, value: true, labelMode: 'marked' };
    }
    
    try {
        const settingsJson = currentLabelProperty.value();
        console.log('🔍 Raw settings JSON from Mod Property:', settingsJson);
        
        const settings = JSON.parse(settingsJson);
        console.log('🔍 Parsed settings object:', settings);
        
        // Ensure all properties have default values
        const defaultSettings = { min: true, max: true, value: true, labelMode: 'marked' };
        const mergedSettings = { ...defaultSettings, ...settings };
        
        console.log('🔍 Merged settings with defaults:', mergedSettings);
        
        // Ensure labelMode has a valid value
        if (!mergedSettings.labelMode || !['all', 'marked', 'none'].includes(mergedSettings.labelMode)) {
            mergedSettings.labelMode = 'marked';
        }
        
        console.log('🔍 Final settings being returned:', mergedSettings);
        return mergedSettings;
    } catch (error) {
        console.error('🔴 Failed to parse label visibility settings:', error);
        return { min: true, max: true, value: true, labelMode: 'marked' };
    }
};

/**
 * Save label visibility settings to mod property
 */
const saveLabelVisibilitySettings = (settings) => {
    if (!currentLabelProperty) {
        console.warn('🔴 No label property available to save settings');
        return;
    }
    
    try {
        console.log('💾 Attempting to save settings:', settings);
        const settingsJson = JSON.stringify(settings);
        console.log('💾 Settings JSON to save:', settingsJson);
        
        currentLabelProperty.set(settingsJson);
        console.log('✅ Successfully saved settings to Mod Property');
        
        // Verify the save by reading it back
        const readBack = currentLabelProperty.value();
        console.log('🔍 Read back from Mod Property:', readBack);
        
    } catch (error) {
        console.error('🔴 Failed to save label visibility settings:', error);
    }
};

/**
 * Update label visibility in the DOM based on settings
 */
const updateLabelVisibility = (settings) => {
    console.log('🔄 updateLabelVisibility called with settings:', settings);
    
    // Get currently marked/selected row indices - avoid interfering with existing marking
    let selectedRowIndices = new Set();
    
    // Try to get marking state safely
    try {
        if (typeof window.getSelectedRowIndices === 'function') {
            selectedRowIndices = window.getSelectedRowIndices() || new Set();
        }
    } catch (error) {
        isDebugging && console.warn('Could not get selected row indices:', error);
    }
    
    console.log('🔄 Selected row indices:', Array.from(selectedRowIndices));
    
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
    const minLabels = document.querySelectorAll('[data-label-type="min"]');
    console.log('🔄 Found', minLabels.length, 'min labels');
    minLabels.forEach(label => {
        const plotRow = label.closest('.plot-row');
        const rowIndex = plotRow ? parseInt(plotRow.getAttribute('data-row-index')) : -1;
        const shouldShow = settings.min && shouldShowLabelsForRow(rowIndex);
        label.style.display = shouldShow ? 'block' : 'none';
    });
    
    // Hide/show max labels
    const maxLabels = document.querySelectorAll('[data-label-type="max"]');
    console.log('🔄 Found', maxLabels.length, 'max labels');
    maxLabels.forEach(label => {
        const plotRow = label.closest('.plot-row');
        const rowIndex = plotRow ? parseInt(plotRow.getAttribute('data-row-index')) : -1;
        const shouldShow = settings.max && shouldShowLabelsForRow(rowIndex);
        label.style.display = shouldShow ? 'block' : 'none';
    });
    
    // Hide/show value labels
    const valueLabels = document.querySelectorAll('[data-label-type="value"]');
    console.log('🔄 Found', valueLabels.length, 'value labels');
    valueLabels.forEach(label => {
        const plotRow = label.closest('.plot-row');
        const rowIndex = plotRow ? parseInt(plotRow.getAttribute('data-row-index')) : -1;
        const shouldShow = settings.value && shouldShowLabelsForRow(rowIndex);
        label.style.display = shouldShow ? 'block' : 'none';
    });
    
    console.log('🔄 Finished updating label visibility');
};

/**
 * Apply initial label visibility based on saved settings
 */
const applyLabelVisibility = () => {
    const settings = getLabelVisibilitySettings();
    updateLabelVisibility(settings);
};

/**
 * Apply label visibility with specific marking state (called from main.ts)
 */
const applyLabelVisibilityWithMarking = (markedRowIndices) => {
    console.log('🔄 applyLabelVisibilityWithMarking called with marked indices:', Array.from(markedRowIndices));
    
    const settings = getLabelVisibilitySettings();
    console.log('🔄 applyLabelVisibilityWithMarking using settings:', settings);
    
    updateLabelVisibilityWithMarking(settings, markedRowIndices);
    
    console.log('🔄 applyLabelVisibilityWithMarking completed');
};

/**
 * Update label visibility with specific marking state
 */
const updateLabelVisibilityWithMarking = (settings, markedRowIndices) => {
    console.log('🔄 updateLabelVisibilityWithMarking called with settings:', settings);
    console.log('🔄 updateLabelVisibilityWithMarking marked indices:', Array.from(markedRowIndices || []));
    
    // Use the provided marking state instead of getting it from rectangleSelection
    const selectedRowIndices = markedRowIndices || new Set();
    
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
    const minLabels = document.querySelectorAll('[data-label-type="min"]');
    console.log('🔄 updateLabelVisibilityWithMarking found', minLabels.length, 'min labels');
    minLabels.forEach(label => {
        const plotRow = label.closest('.plot-row');
        const rowIndex = plotRow ? parseInt(plotRow.getAttribute('data-row-index')) : -1;
        const shouldShow = settings.min && shouldShowLabelsForRow(rowIndex);
        label.style.display = shouldShow ? 'block' : 'none';
    });
    
    // Hide/show max labels
    const maxLabels = document.querySelectorAll('[data-label-type="max"]');
    console.log('🔄 updateLabelVisibilityWithMarking found', maxLabels.length, 'max labels');
    maxLabels.forEach(label => {
        const plotRow = label.closest('.plot-row');
        const rowIndex = plotRow ? parseInt(plotRow.getAttribute('data-row-index')) : -1;
        const shouldShow = settings.max && shouldShowLabelsForRow(rowIndex);
        label.style.display = shouldShow ? 'block' : 'none';
    });
    
    // Hide/show value labels
    const valueLabels = document.querySelectorAll('[data-label-type="value"]');
    console.log('🔄 updateLabelVisibilityWithMarking found', valueLabels.length, 'value labels');
    valueLabels.forEach(label => {
        const plotRow = label.closest('.plot-row');
        const rowIndex = plotRow ? parseInt(plotRow.getAttribute('data-row-index')) : -1;
        const shouldShow = settings.value && shouldShowLabelsForRow(rowIndex);
        label.style.display = shouldShow ? 'block' : 'none';
    });
    
    console.log('🔄 updateLabelVisibilityWithMarking completed');
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
    isDebugging && console.log('Testing context menu...');
    showContextMenu(100, 100);
};

/**
 * Debug function to inspect current state
 */
const debugCurrentState = () => {
    console.log('🔍 === DEBUG CURRENT STATE ===');
    console.log('🔍 currentMod:', !!currentMod);
    console.log('🔍 currentLabelProperty:', !!currentLabelProperty);
    
    if (currentLabelProperty) {
        try {
            const raw = currentLabelProperty.value();
            console.log('🔍 Raw Mod Property value:', raw);
            const parsed = JSON.parse(raw);
            console.log('🔍 Parsed Mod Property:', parsed);
        } catch (e) {
            console.error('🔍 Error reading Mod Property:', e);
        }
    }
    
    const settings = getLabelVisibilitySettings();
    console.log('🔍 getLabelVisibilitySettings() returns:', settings);
    
    if (typeof window.getSelectedRowIndices === 'function') {
        const marked = window.getSelectedRowIndices();
        console.log('🔍 Currently marked rows:', Array.from(marked || []));
    }
    
    console.log('🔍 === END DEBUG ===');
};

/**
 * Test function to manually set settings
 */
const testSetSettings = (testSettings) => {
    console.log('🧪 Testing setting:', testSettings);
    saveLabelVisibilitySettings(testSettings);
    const readBack = getLabelVisibilitySettings();
    console.log('🧪 Read back:', readBack);
};

// Export functions
window.initializeContextMenu = initializeContextMenu;
window.updateSettingsIconPosition = updateSettingsIconPosition;
window.applyLabelVisibility = applyLabelVisibility;
window.applyLabelVisibilityWithMarking = applyLabelVisibilityWithMarking;
window.cleanupContextMenu = cleanupContextMenu;
window.testContextMenu = testContextMenu; // For debugging
window.debugCurrentState = debugCurrentState; // For debugging
window.testSetSettings = testSetSettings; // For debugging
