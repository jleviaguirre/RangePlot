/*
 * Copyright © 2025. Cloud Software Group, Inc.
 * This file is subject to the license terms contained
 * in the license file that is distributed with this file.
 */

/**
 * Context menu for label visibility settings
 * Uses a settings icon instead of right-click to avoid conflicts
 */

let settingsIcon = null;
let currentMod = null;
let currentLabelProperty = null;

/**
 * Initialize context menu functionality with settings icon
 */
const initializeContextMenu = (mod, labelProperty, hasValueAxis) => {
    currentMod = mod;
    currentLabelProperty = labelProperty;
    
    // Remove existing elements if they exist
    if (settingsIcon) {
        document.body.removeChild(settingsIcon);
    }
    
    // Create settings icon
    createSettingsIcon();
    
    // Add CSS for settings icon
    addContextMenuStyles();
    
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
        e.preventDefault();
        
        const rect = settingsIcon.getBoundingClientRect();
        showPopoutMenu(rect.left, rect.bottom + 5);
    });
    
    // Add hover handlers to show/hide settings icon
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
 * Add CSS styles for settings icon
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
 * Show the Spotfire popout menu using Mods API
 */
const showPopoutMenu = (x, y) => {
    if (!currentMod || !currentLabelProperty) {
        console.warn('No mod or label property available for popout');
        return;
    }
    
    // Get current settings directly from the Mod Property
    const currentSettings = getLabelVisibilitySettings();
    const isNoneMode = currentSettings.labelMode === 'none';
    
    // Helper function to check property values (official pattern)
    const is = (property, value) => property === value;
    
    // Get popout components
    const { radioButton, checkbox, button } = currentMod.controls.popout.components;
    const { section } = currentMod.controls.popout;
    
    // Create label visibility checkboxes
    const minCheckbox = checkbox({ 
        enabled: !isNoneMode, 
        name: "min", 
        text: "Show Min Labels", 
        checked: Boolean(currentSettings.min)
    });
    
    const maxCheckbox = checkbox({ 
        enabled: !isNoneMode, 
        name: "max", 
        text: "Show Max Labels", 
        checked: Boolean(currentSettings.max)
    });
    
    const valueCheckbox = checkbox({ 
        enabled: !isNoneMode, 
        name: "value", 
        text: "Show Value Labels", 
        checked: Boolean(currentSettings.value)
    });
    
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
        alignment: "Top",
        onChange: (e) => {
            // Get fresh settings from Mod Property for each change
            const freshSettings = getLabelVisibilitySettings();
            
            // Handle radio button changes for label mode
            if (e.name === "labelMode" && e.value) {
                freshSettings.labelMode = e.value;
                
                // If switching to none mode, clear all checkboxes
                if (e.value === 'none') {
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
                freshSettings.min = Boolean(e.value);
                saveLabelVisibilitySettings(freshSettings);
                updateLabelVisibility(freshSettings);
            }
            else if (e.name === "max") {
                freshSettings.max = Boolean(e.value);
                saveLabelVisibilitySettings(freshSettings);
                updateLabelVisibility(freshSettings);
            }
            else if (e.name === "value") {
                freshSettings.value = Boolean(e.value);
                saveLabelVisibilitySettings(freshSettings);
                updateLabelVisibility(freshSettings);
            }
        },
        onClosed: () => {
            // Popout closed - no action needed
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
 * Get current label visibility settings from mod property
 */
const getLabelVisibilitySettings = () => {
    if (!currentLabelProperty) {
        console.warn('No label property available, returning defaults');
        return { min: true, max: true, value: true, labelMode: 'all' };
    }
    
    try {
        const settingsJson = currentLabelProperty.value();
        const settings = JSON.parse(settingsJson);
        
        // Ensure all properties have default values
        const defaultSettings = { min: true, max: true, value: true, labelMode: 'all' };
        const mergedSettings = { ...defaultSettings, ...settings };
        
        // Ensure labelMode has a valid value
        if (!mergedSettings.labelMode || !['all', 'marked', 'none'].includes(mergedSettings.labelMode)) {
            mergedSettings.labelMode = 'all';
        }
        
        return mergedSettings;
    } catch (error) {
        console.error('Failed to parse label visibility settings:', error);
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
    } catch (error) {
        console.error('Failed to save label visibility settings:', error);
    }
};

/**
 * Update label visibility in the DOM based on settings
 */
const updateLabelVisibility = (settings) => {
    // Get currently marked/selected row indices - avoid interfering with existing marking
    let selectedRowIndices = new Set();
    
    // Try to get marking state safely
    try {
        if (typeof window.getSelectedRowIndices === 'function') {
            selectedRowIndices = window.getSelectedRowIndices() || new Set();
        }
    } catch (error) {
        console.warn('Could not get selected row indices:', error);
    }
    
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
    minLabels.forEach(label => {
        const plotRow = label.closest('.plot-row');
        const rowIndex = plotRow ? parseInt(plotRow.getAttribute('data-row-index')) : -1;
        const shouldShow = settings.min && shouldShowLabelsForRow(rowIndex);
        label.style.display = shouldShow ? 'block' : 'none';
    });
    
    // Hide/show max labels
    const maxLabels = document.querySelectorAll('[data-label-type="max"]');
    maxLabels.forEach(label => {
        const plotRow = label.closest('.plot-row');
        const rowIndex = plotRow ? parseInt(plotRow.getAttribute('data-row-index')) : -1;
        const shouldShow = settings.max && shouldShowLabelsForRow(rowIndex);
        label.style.display = shouldShow ? 'block' : 'none';
    });
    
    // Hide/show value labels
    const valueLabels = document.querySelectorAll('[data-label-type="value"]');
    valueLabels.forEach(label => {
        const plotRow = label.closest('.plot-row');
        const rowIndex = plotRow ? parseInt(plotRow.getAttribute('data-row-index')) : -1;
        const shouldShow = settings.value && shouldShowLabelsForRow(rowIndex);
        label.style.display = shouldShow ? 'block' : 'none';
    });
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
    const settings = getLabelVisibilitySettings();
    updateLabelVisibilityWithMarking(settings, markedRowIndices);
};

/**
 * Update label visibility with specific marking state
 */
const updateLabelVisibilityWithMarking = (settings, markedRowIndices) => {
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
    minLabels.forEach(label => {
        const plotRow = label.closest('.plot-row');
        const rowIndex = plotRow ? parseInt(plotRow.getAttribute('data-row-index')) : -1;
        const shouldShow = settings.min && shouldShowLabelsForRow(rowIndex);
        label.style.display = shouldShow ? 'block' : 'none';
    });
    
    // Hide/show max labels
    const maxLabels = document.querySelectorAll('[data-label-type="max"]');
    maxLabels.forEach(label => {
        const plotRow = label.closest('.plot-row');
        const rowIndex = plotRow ? parseInt(plotRow.getAttribute('data-row-index')) : -1;
        const shouldShow = settings.max && shouldShowLabelsForRow(rowIndex);
        label.style.display = shouldShow ? 'block' : 'none';
    });
    
    // Hide/show value labels
    const valueLabels = document.querySelectorAll('[data-label-type="value"]');
    valueLabels.forEach(label => {
        const plotRow = label.closest('.plot-row');
        const rowIndex = plotRow ? parseInt(plotRow.getAttribute('data-row-index')) : -1;
        const shouldShow = settings.value && shouldShowLabelsForRow(rowIndex);
        label.style.display = shouldShow ? 'block' : 'none';
    });
};

/**
 * Clean up context menu
 */
const cleanupContextMenu = () => {
    if (settingsIcon) {
        document.body.removeChild(settingsIcon);
        settingsIcon = null;
    }
    
    const style = document.getElementById('context-menu-styles');
    if (style) {
        style.remove();
    }
};

// Export functions
window.initializeContextMenu = initializeContextMenu;
window.updateSettingsIconPosition = updateSettingsIconPosition;
window.applyLabelVisibility = applyLabelVisibility;
window.applyLabelVisibilityWithMarking = applyLabelVisibilityWithMarking;
window.cleanupContextMenu = cleanupContextMenu;
