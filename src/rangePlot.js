function parseRangePlotData(jsonString) {
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error('Invalid JSON:', e);
        return null;
    }
}

function createRangePlot(data) {
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
    data.data.forEach(item => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'plot-row';

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
                    <div class="label" style="left: ${minPercent}%;">${item.min}</div>
                    <div class="label" style="left: ${maxPercent}%;">${item.max}</div>
                    <div class="value-label" style="left: ${valuePercent}%;">${item.value}</div>
                </div>
            </div>
        `;

        container.appendChild(rowDiv);
    });
}

// Make functions available globally
window.createRangePlot = createRangePlot;
window.parseRangePlotData = parseRangePlotData;

// Function to update with new data (can be called externally)
window.updateRangePlot = function(jsonString) {
    const data = parseRangePlotData(jsonString);
    if (data) {
        createRangePlot(data);
    }
};
