function parseRangePlotData(jsonString) {
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error('Invalid JSON:', e);
        return null;
    }
}

function createRangePlot(data, mod, allRows) {
    const container = document.getElementById('plot-container');
    if (!container) {
        console.error('Could not find plot-container element');
        return;
    }
    
    container.innerHTML = '';

    // Find absolute min and max across all categories
    const allValues = data.data.flatMap(item => [item.min, item.max, item.value]);
    const absoluteMin = Math.min(...allValues);
    const absoluteMax = Math.max(...allValues);
    const range = absoluteMax - absoluteMin;

    // Create each category row
    data.data.forEach((item, index) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'plot-row';
        rowDiv.setAttribute('data-row-index', index);

        // Calculate percentages for positioning
        const minPercent = ((item.min - absoluteMin) / range) * 100;
        const maxPercent = ((item.max - absoluteMin) / range) * 100;
        const valuePercent = ((item.value - absoluteMin) / range) * 100;
        
        // Get color for this row (default to blue if not provided)
        const segmentColor = item.color || '#0ba5e0';

        rowDiv.innerHTML = `
            <span class="category-label">${item.category}</span>
            <div class="plot-container">
                <!-- Base rail -->
                <div class="base-rail"></div>
                
                <!-- Range segment with dynamic color -->
                <div class="range-segment" style="left: ${minPercent}%; width: ${maxPercent - minPercent}%; background-color: ${segmentColor};"></div>
                
                <!-- Min endpoint -->
                <div class="endpoint" style="left: ${minPercent}%;"></div>
                
                <!-- Max endpoint -->
                <div class="endpoint" style="left: ${maxPercent}%;"></div>
                
                <!-- Value indicator -->
                <div class="value-indicator" style="left: ${valuePercent}%;"></div>
                
                <!-- Labels -->
                <div class="labels">
                    <div class="label label-min" data-label-type="min" style="left: ${minPercent}%;">${item.minFormatted || item.min}</div>
                    <div class="label label-max" data-label-type="max" style="left: ${maxPercent}%;">${item.maxFormatted || item.max}</div>
                    <div class="value-label label-value" data-label-type="value" style="left: ${valuePercent}%;">${item.valueFormatted || item.value}</div>
                </div>
            </div>
        `;

        // Add data attributes for marking functionality
        rowDiv.dataset.rowIndex = item.rowIndex !== undefined ? item.rowIndex : index;
        rowDiv.dataset.category = item.category;

        container.appendChild(rowDiv);
        
        // Add tooltip functionality if Spotfire mod and data are available
        if (mod && allRows && item.rowIndex !== undefined) {
            const row = allRows[item.rowIndex];
            
            // Add hover events to endpoints and value indicator
            const endpoints = rowDiv.querySelectorAll('.endpoint');
            const valueIndicator = rowDiv.querySelector('.value-indicator');
            const rangeSegment = rowDiv.querySelector('.range-segment');
            
            // Min endpoint tooltip - use Spotfire's native tooltip
            if (endpoints[0]) {
                endpoints[0].addEventListener('mouseenter', () => {
                    // Use Spotfire's automatic row tooltip which respects the properties dialog settings
                    mod.controls.tooltip.show(row);
                });
                endpoints[0].addEventListener('mouseleave', () => {
                    mod.controls.tooltip.hide();
                });
            }
            
            // Max endpoint tooltip  
            if (endpoints[1]) {
                endpoints[1].addEventListener('mouseenter', () => {
                    // Use Spotfire's automatic row tooltip which respects the properties dialog settings
                    mod.controls.tooltip.show(row);
                });
                endpoints[1].addEventListener('mouseleave', () => {
                    mod.controls.tooltip.hide();
                });
            }
            
            // Value indicator tooltip
            if (valueIndicator) {
                valueIndicator.addEventListener('mouseenter', () => {
                    // Use Spotfire's automatic row tooltip which respects the properties dialog settings
                    mod.controls.tooltip.show(row);
                });
                valueIndicator.addEventListener('mouseleave', () => {
                    mod.controls.tooltip.hide();
                });
            }
            
            // Range segment tooltip - show full row data using Spotfire's row tooltip
            if (rangeSegment) {
                rangeSegment.addEventListener('mouseenter', () => {
                    // Use Spotfire's automatic row tooltip for comprehensive data
                    mod.controls.tooltip.show(row);
                });
                rangeSegment.addEventListener('mouseleave', () => {
                    mod.controls.tooltip.hide();
                });
            }
        } else {
            // Fallback tooltips for sample data
            const endpoints = rowDiv.querySelectorAll('.endpoint');
            const valueIndicator = rowDiv.querySelector('.value-indicator');
            const rangeSegment = rowDiv.querySelector('.range-segment');
            
            // Simple tooltips for sample data
            if (endpoints[0]) {
                endpoints[0].title = `${item.category} - Min: ${item.min}`;
            }
            if (endpoints[1]) {
                endpoints[1].title = `${item.category} - Max: ${item.max}`;
            }
            if (valueIndicator) {
                valueIndicator.title = `${item.category} - Current: ${item.value}`;
            }
            if (rangeSegment) {
                rangeSegment.title = `${item.category} - Range: ${item.min} to ${item.max}, Current: ${item.value}`;
            }
        }
    });

    // Initialize rectangular marking if mod is available
    if (mod && allRows && window.initializeRectangleMarking) {
        setTimeout(() => {
            // Initialize rectangular marking after DOM elements are ready
            window.initializeRectangleMarking((selectionData) => {
                console.log('Selection event:', selectionData);
                // TODO: Implement Spotfire marking API integration here
            }, mod, allRows);
        }, 100);
    }
}

// Make functions available globally
window.createRangePlot = createRangePlot;
window.parseRangePlotData = parseRangePlotData;

// Function to update with new data (can be called externally)
window.updateRangePlot = function(jsonString, mod, allRows) {
    const data = parseRangePlotData(jsonString);
    if (data) {
        createRangePlot(data, mod, allRows);
    }
};
 