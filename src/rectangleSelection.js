/*
* Copyright © 2025. Cloud Software Group, Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/

/**
 * Rectangular selection for Range Plot visualization
 * Allows users to select range segments by dragging a rectangle or clicking individual elements
 */

// Global reference to current dataView for marking operations
let currentDataView = null;

// Store persistent selection state
let persistentSelectedRowIndices = new Set();

/**
 * Helper function to get the current dataView
 */
const getCurrentDataView = () => {
    return currentDataView;
};

/**
 * Set the current dataView (called from main.ts during render)
 */
const setCurrentDataView = (dataView) => {
    currentDataView = dataView;
};

/**
 * Get the current selected row indices
 */
const getSelectedRowIndices = () => {
    return persistentSelectedRowIndices;
};

/**
 * Restore visual selection state after render
 */
const restoreVisualSelection = () => {
    // Clear any existing visual selection
    document.querySelectorAll('.plot-row, .range-segment, .endpoint, .value-indicator').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Restore selection for persistent row indices
    persistentSelectedRowIndices.forEach(rowIndex => {
        const plotRow = document.querySelector(`.plot-row[data-row-index="${rowIndex}"]`);
        if (plotRow) {
            plotRow.classList.add('selected');
            
            // Also select individual elements within this row
            const rangeSegment = plotRow.querySelector('.range-segment');
            const endpoints = plotRow.querySelectorAll('.endpoint');
            const valueIndicator = plotRow.querySelector('.value-indicator');
            
            if (rangeSegment) rangeSegment.classList.add('selected');
            endpoints.forEach(endpoint => endpoint.classList.add('selected'));
            if (valueIndicator) valueIndicator.classList.add('selected');
        }
    });
};

/**Draws the rectangular selection */
const selectionDiv = document.createElement("div");
selectionDiv.className = "selection";

// Add selection styles
const selectionStyles = document.createElement("style");
selectionStyles.textContent = `
    .selection {
        position: absolute;
        border: 1px solid #0a153080;
        background-color: #8daddf80; 
        visibility: hidden;
        z-index: 1000;
        pointer-events: none;
    }
    .range-segment.selected {
        opacity: 0.7;
        stroke: #1d4ed8;
        stroke-width: 2px;
    }
    .endpoint.selected {
        stroke: #1d4ed8;
        stroke-width: 3px;
    }
    .value-indicator.selected {
        stroke: #1d4ed8;
        stroke-width: 3px;
    }
`;

document.head.appendChild(selectionStyles);
document.querySelector("body").appendChild(selectionDiv);

const clamp = (value, min, max) => Math.min(Math.max(min, value), max);

let selectionPoint = { x: 0, y: 0 };
let meta = { ctrlKey: false, altKey: false };
let isSelecting = false;
let isDragging = false; // Track if user is actually dragging
let dragStartElement = null; // Track what element the drag started on
let selectedElements = new Set();

/**
 * Initialize rectangular marking for range plot
 * @param {Function} callback - Callback function to handle selection events
 * @param {Object} mod - Spotfire mod object for marking functionality
 * @param {Array} allRows - All data rows for marking
 */
const initializeRectangleMarking = (callback, mod, allRows) => {
    // Add event listeners to the entire document for global rectangular selection
    document.onmousedown = (e) => {
        // Start rectangle selection immediately, but we'll handle click vs drag logic later
        // Prevent default to avoid text selection
        e.preventDefault();
        startRectangleSelection(e, callback, mod, allRows);
    };
};

/**
 * Start rectangular selection
 */
const startRectangleSelection = (e, callback, mod, allRows) => {
    isSelecting = true;
    isDragging = false; // Reset dragging state
    dragStartElement = e.target; // Remember what was clicked
    callback({ dragSelectActive: true });

    const x = e.clientX;
    const y = e.clientY;
    
    selectionPoint = { x, y };
    meta = { ctrlKey: e.ctrlKey, altKey: e.altKey };
    
    selectionDiv.style.left = x + "px";
    selectionDiv.style.top = y + "px";
    selectionDiv.style.width = "0px";
    selectionDiv.style.height = "0px";

    // Create mouse move and mouse up handlers with access to mod and allRows
    const mousemoveHandler = (e) => mousemove(e, mod, allRows);
    const mouseupHandler = (e) => mouseup(e, mod, allRows);

    document.addEventListener("mousemove", mousemoveHandler);
    document.addEventListener("mouseup", mouseupHandler);
    
    // Store handlers for cleanup
    document._currentMousemoveHandler = mousemoveHandler;
    document._currentMouseupHandler = mouseupHandler;
};

/**
 * Handle mouse move during selection
 */
const mousemove = (e, mod, allRows) => {
    if (!isSelecting) return;

    const x = clamp(e.clientX, 0, window.innerWidth - 2);
    const y = clamp(e.clientY, 0, window.innerHeight - 2);
    const width = Math.abs(selectionPoint.x - x);
    const height = Math.abs(selectionPoint.y - y);
    
    // Only start showing rectangle and set dragging=true if moved enough distance
    const minDragDistance = 5;
    if (!isDragging && (width > minDragDistance || height > minDragDistance)) {
        isDragging = true;
        console.log('Started dragging - showing rectangle selection');
    }
    
    // Only show visual selection if we're actually dragging
    if (isDragging) {
        selectionDiv.style.width = width + "px";
        selectionDiv.style.height = height + "px";
        selectionDiv.style.visibility = "visible";

        x < selectionPoint.x && (selectionDiv.style.left = x + "px");
        y < selectionPoint.y && (selectionDiv.style.top = y + "px");

        // Highlight elements within selection
        highlightElementsInSelection(x, y, width, height);
    }
};

/**
 * Handle mouse up to complete selection
 */
const mouseup = (e, mod, allRows) => {
    if (!isSelecting) return;

    const x = e.clientX;
    const y = e.clientY;
    const width = Math.abs(selectionPoint.x - x);
    const height = Math.abs(selectionPoint.y - y);
    
    selectionDiv.style.visibility = "hidden";

    // If we never started dragging (just a click), let the plot row click handler work
    if (!isDragging) {
        console.log('Click detected (no drag) - checking what was clicked');
        
        // Check if we clicked on a plot row
        const plotRowElement = dragStartElement.closest('.plot-row');
        if (plotRowElement && mod && allRows) {
            // Manually trigger the plot row click handler
            const rowIndex = parseInt(plotRowElement.getAttribute('data-row-index'));
            if (!isNaN(rowIndex) && allRows[rowIndex]) {
                handlePlotRowClickDirect(rowIndex, meta.ctrlKey, mod, allRows);
            }
        } else {
            // Clicked outside plot rows - clear marking unless using Ctrl
            if (!meta.ctrlKey) {
                console.log('Clicked outside plot rows - clearing marking');
                const currentDataView = getCurrentDataView();
                if (currentDataView) {
                    try {
                        currentDataView.clearMarking();
                        console.log('Cleared Spotfire marking');
                    } catch (error) {
                        console.error('Failed to clear Spotfire marking:', error);
                    }
                }
            }
        }
    } else {
        // We were dragging, so handle rectangular selection
        console.log('Drag detected - processing rectangular selection');
        
        const minSelectionSize = 5;
        if (width > minSelectionSize && height > minSelectionSize) {
            // Perform selection of elements within rectangle
            const selectionRect = {
                x: x < selectionPoint.x ? x : selectionPoint.x,
                y: y < selectionPoint.y ? y : selectionPoint.y,
                width,
                height,
                ...meta
            };
            
            selectElementsInRectangle(selectionRect, mod, allRows);
        } else {
            // Small drag - treat as clearing unless using Ctrl
            if (!meta.ctrlKey) {
                console.log('Small drag detected - clearing marking');
                const currentDataView = getCurrentDataView();
                if (currentDataView) {
                    try {
                        currentDataView.clearMarking();
                        console.log('Cleared Spotfire marking');
                    } catch (error) {
                        console.error('Failed to clear Spotfire marking:', error);
                    }
                }
            }
        }
    }

    // Clean up highlighting
    document.querySelectorAll('.range-segment, .endpoint, .value-indicator').forEach(el => {
        el.classList.remove('highlighted');
    });

    isSelecting = false;
    isDragging = false; // Reset dragging state
    dragStartElement = null; // Clear drag start element
    
    // Remove event listeners using stored handlers
    if (document._currentMousemoveHandler) {
        document.removeEventListener("mousemove", document._currentMousemoveHandler);
        document._currentMousemoveHandler = null;
    }
    if (document._currentMouseupHandler) {
        document.removeEventListener("mouseup", document._currentMouseupHandler);
        document._currentMouseupHandler = null;
    }
};

/**
 * Highlight elements within the current selection rectangle
 */
const highlightElementsInSelection = (x, y, width, height) => {
    const selectionRect = {
        left: Math.min(x, selectionPoint.x),
        top: Math.min(y, selectionPoint.y),
        right: Math.min(x, selectionPoint.x) + width,
        bottom: Math.min(y, selectionPoint.y) + height
    };

    // Remove previous highlights
    document.querySelectorAll('.range-segment, .endpoint, .value-indicator').forEach(el => {
        el.classList.remove('highlighted');
    });

    // Add highlights to elements in selection
    document.querySelectorAll('.range-segment, .endpoint, .value-indicator').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (isElementInSelection(rect, selectionRect)) {
            el.classList.add('highlighted');
        }
    });
};

/**
 * Check if an element is within the selection rectangle
 */
const isElementInSelection = (elementRect, selectionRect) => {
    return elementRect.left < selectionRect.right &&
           elementRect.right > selectionRect.left &&
           elementRect.top < selectionRect.bottom &&
           elementRect.bottom > selectionRect.top;
};

/**
 * Select elements within the rectangle and mark corresponding data rows
 */
const selectElementsInRectangle = (selectionRect, mod, allRows) => {
    const elementsToMark = [];
    const selectedRowIndices = [];
    const spotfireRowsToMark = [];
    
    // Clear previous selection if not using Ctrl
    if (!selectionRect.ctrlKey) {
        clearSelection(mod);
        persistentSelectedRowIndices.clear();
    }
    
    document.querySelectorAll('.plot-row').forEach((row, rowIndex) => {
        const rowRect = row.getBoundingClientRect();
        if (isElementInSelection(rowRect, {
            left: selectionRect.x,
            top: selectionRect.y,
            right: selectionRect.x + selectionRect.width,
            bottom: selectionRect.y + selectionRect.height
        })) {
            // Get the data row index from the row's data attribute
            const dataRowIndex = row.dataset.rowIndex;
            if (dataRowIndex !== undefined) {
                const index = parseInt(dataRowIndex);
                
                // Add to persistent selection state
                if (selectionRect.ctrlKey) {
                    // Toggle selection with Ctrl
                    if (persistentSelectedRowIndices.has(index)) {
                        persistentSelectedRowIndices.delete(index);
                    } else {
                        persistentSelectedRowIndices.add(index);
                    }
                } else {
                    // Replace selection without Ctrl
                    persistentSelectedRowIndices.add(index);
                }
                
                selectedRowIndices.push(index);
                elementsToMark.push(index);
                
                // Get the corresponding Spotfire data row
                if (allRows && allRows[index]) {
                    spotfireRowsToMark.push(allRows[index]);
                }
            }
        }
    });

    // Apply visual selection based on persistent state
    restoreVisualSelection();

    console.log('Selected rows:', selectedRowIndices);
    console.log('Persistent selection state:', Array.from(persistentSelectedRowIndices));
    console.log('Elements to mark in Spotfire:', elementsToMark);
    console.log('Spotfire rows to mark:', spotfireRowsToMark);
    
    // Mark the rows in Spotfire's data table using persistent state
    if (mod && persistentSelectedRowIndices.size > 0) {
        try {
            // Get the dataView from the current render context
            const currentDataView = getCurrentDataView();
            if (currentDataView && allRows) {
                // Get all rows that should be marked based on persistent state
                const rowsToMark = [];
                persistentSelectedRowIndices.forEach(index => {
                    if (allRows[index]) {
                        rowsToMark.push(allRows[index]);
                    }
                });
                
                if (rowsToMark.length > 0) {
                    // Always use Replace since we're managing the full selection state
                    currentDataView.mark(rowsToMark, "Replace");
                    console.log('Successfully marked', rowsToMark.length, 'rows in Spotfire based on persistent state');
                }
            } else {
                console.warn('No dataView available for marking');
            }
        } catch (error) {
            console.error('Failed to mark rows in Spotfire:', error);
        }
    } else if (persistentSelectedRowIndices.size === 0) {
        // Clear marking if no rows selected
        try {
            const currentDataView = getCurrentDataView();
            if (currentDataView) {
                currentDataView.clearMarking();
                console.log('Cleared Spotfire marking - no persistent selection');
            }
        } catch (error) {
            console.error('Failed to clear Spotfire marking:', error);
        }
    }
};

/**
 * Clear all selections
 */
const clearSelection = (mod = null) => {
    // Clear visual selection
    document.querySelectorAll('.plot-row, .range-segment, .endpoint, .value-indicator').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Clear persistent selection state
    persistentSelectedRowIndices.clear();
    
    // Optionally clear Spotfire marking as well
    if (mod) {
        try {
            const currentDataView = getCurrentDataView();
            if (currentDataView) {
                currentDataView.clearMarking();
                console.log('Cleared Spotfire marking');
            }
        } catch (error) {
            console.error('Failed to clear Spotfire marking:', error);
        }
    }
};

/**
 * Handle direct plot row click (called from mouseup when no dragging occurred)
 */
const handlePlotRowClickDirect = (rowIndex, ctrlPressed, mod, allRows) => {
    console.log('Direct plot row click:', rowIndex, 'Ctrl pressed:', ctrlPressed);
    
    // Get the dataView for marking
    const currentDataView = getCurrentDataView();
    if (!currentDataView) {
        console.warn('No dataView available for marking');
        return;
    }
    
    try {
        const rowToMark = allRows[rowIndex];
        
        if (ctrlPressed) {
            // Ctrl+click: Add to existing marking
            currentDataView.mark([rowToMark], "ToggleOrAdd");
            console.log('Added/toggled row in Spotfire marking:', rowIndex);
        } else {
            // Regular click: Replace marking with this row only
            currentDataView.mark([rowToMark], "Replace");
            console.log('Replaced Spotfire marking with row:', rowIndex);
        }
    } catch (error) {
        console.error('Failed to mark row in Spotfire:', error);
    }
};

/**
 * Handle individual plot row clicks for Spotfire marking only
 */
const handlePlotRowClick = (e, mod, allRows) => {
    // Prevent event bubbling to avoid triggering rectangle selection
    e.stopPropagation();
    
    const plotRow = e.currentTarget;
    const rowIndex = parseInt(plotRow.getAttribute('data-row-index'));
    
    if (isNaN(rowIndex) || !allRows || !allRows[rowIndex]) {
        console.warn('Invalid row index for click marking:', rowIndex);
        return;
    }
    
    console.log('Plot row clicked:', rowIndex, 'Ctrl pressed:', e.ctrlKey);
    
    // Get the dataView for marking
    const currentDataView = getCurrentDataView();
    if (!currentDataView) {
        console.warn('No dataView available for marking');
        return;
    }
    
    try {
        const rowToMark = allRows[rowIndex];
        
        if (e.ctrlKey) {
            // Ctrl+click: Add to existing marking
            currentDataView.mark([rowToMark], "ToggleOrAdd");
            console.log('Added/toggled row in Spotfire marking:', rowIndex);
        } else {
            // Regular click: Replace marking with this row only
            currentDataView.mark([rowToMark], "Replace");
            console.log('Replaced Spotfire marking with row:', rowIndex);
        }
    } catch (error) {
        console.error('Failed to mark row in Spotfire:', error);
    }
};

/**
 * Add click handlers to all plot row elements for Spotfire marking
 */
const addPlotRowClickHandlers = (mod, allRows) => {
    // Since we're now handling clicks through the global mouseup event,
    // we just need to ensure the cursor shows it's clickable
    document.querySelectorAll('.plot-row').forEach(plotRow => {
        plotRow.style.cursor = 'pointer';
    });
    
    console.log('Configured', document.querySelectorAll('.plot-row').length, 'plot rows for click/drag marking');
};

/**
 * Handle individual element clicks (deprecated - now using plot row clicks)
 */
const handleElementClick = (e, mod, allRows) => {
    // Deprecated - now using handlePlotRowClick instead
};

/**
 * Add click handlers to all interactive elements (deprecated - now using plot row clicks)
 */
const addElementClickHandlers = (mod, allRows) => {
    // Deprecated - now using addPlotRowClickHandlers instead
};

// Export functions for use in range plot
window.initializeRectangleMarking = initializeRectangleMarking;
window.setCurrentDataView = setCurrentDataView;
window.addPlotRowClickHandlers = addPlotRowClickHandlers;
window.getSelectedRowIndices = getSelectedRowIndices;
