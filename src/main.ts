// Set global debugging flag - controls all debug output across all files
(window as any).RANGEPLOT_DEBUG_MODE = false;

// Helper function for conditional logging (using global flag)
const debugLog = (...args: any[]) => {
    if ((window as any).RANGEPLOT_DEBUG_MODE) {
        console.log('[RangePlot Debug]:', ...args);
    }
};

Spotfire.initialize(async (mod: Spotfire.Mod) => {
    /**
     * Create the read function.
     */
    const reader = mod.createReader(
        mod.visualization.data(), 
        mod.windowSize(), 
        mod.property("myProperty"),
        mod.property("labelVisibility")
    );

    /**
     * Store the context.
     */
    const context = mod.getRenderContext();

    /**
     * Initiate the read loop
     */
    reader.subscribe(render);

    async function render(dataView: Spotfire.DataView, windowSize: Spotfire.Size, prop: Spotfire.ModProperty<string>, labelVisibility: Spotfire.ModProperty<string>) {
        /**
         * Set the current dataView for rectangular marking
         */
        if (typeof (window as any).setCurrentDataView === 'function') {
            (window as any).setCurrentDataView(dataView);
        }

        /**
         * Check the data view for errors
         */
        let errors = await dataView.getErrors();
        if (errors.length > 0) {
            mod.controls.errorOverlay.show(errors);
            return;
        }
        mod.controls.errorOverlay.hide();

        /**
         * Get data from all axes
         */
        const rangeByHierarchy = await dataView.hierarchy("Range by");
        const minAxis = await dataView.continuousAxis("Min");
        const maxAxis = await dataView.continuousAxis("Max");
        const valueAxis = await dataView.continuousAxis("Value"); // Optional

        // Check if we have the required data (only Min and Max are required now)
        if (!minAxis || !maxAxis) {
            // Show error overlay for missing required axes
            const missingAxes = [];
            if (!minAxis) missingAxes.push("Min");
            if (!maxAxis) missingAxes.push("Max");
            
            mod.controls.errorOverlay.show(
                `Range Plot requires the following axes to be configured: ${missingAxes.join(", ")}`
            );
            return;
        }

        // Check if we have category data (optional now)
        const rangeByRoot = rangeByHierarchy ? await rangeByHierarchy.root() : null;

        /**
         * Transform Spotfire data to our format
         */
        const plotData: any = {
            option1: "spotfire_data",
            option2: "values", 
            data: []
        };

        // Get all rows from the data view
        const allRows = await dataView.allRows();
        
        if (!allRows || allRows.length === 0) {
            debugLog("No data rows available");
            context.signalRenderComplete();
            return;
        }
        
        if (rangeByHierarchy) {
            // Process data with categories (original behavior)
            for (let i = 0; i < allRows.length; i++) {
                const row = allRows[i];
                
                try {
                    // Get the category name from the categorical axis
                    const categoryValue = row.categorical("Range by");
                    const category = categoryValue.formattedValue();
                    
                    // Get the continuous values - both raw (for calculations) and formatted (for display)
                    const minValue = row.continuous<number>("Min").value();
                    const maxValue = row.continuous<number>("Max").value();
                    
                    // Value is optional - only get if valueAxis exists
                    const currentValue = valueAxis ? row.continuous<number>("Value").value() : null;
                    
                    // Get formatted values for display
                    const minFormatted = row.continuous("Min").formattedValue();
                    const maxFormatted = row.continuous("Max").formattedValue();
                    const currentFormatted = valueAxis ? row.continuous("Value").formattedValue() : null;

                    // Get the color from the color axis
                    const colorInfo = row.color();
                    const hexColor = colorInfo ? colorInfo.hexCode : "#0ba5e0"; // Default blue if no color

                    // Only add if we have valid min and max values (value is optional)
                    if (minValue !== null && maxValue !== null) {
                        plotData.data.push({
                            category: category,
                            min: minValue,              // Raw values for calculations
                            max: maxValue,
                            value: currentValue,        // Can be null
                            minFormatted: minFormatted, // Formatted values for display
                            maxFormatted: maxFormatted,
                            valueFormatted: currentFormatted, // Can be null
                            color: hexColor,
                            rowIndex: i  // Store row index for tooltip access
                        });
                    }
                } catch (error) {
                    debugLog("Error processing categorized row", i, error);
                    continue;
                }
            }
        } else {
            // No categorical axis - aggregate all data into a single row
            const minValues: number[] = [];
            const maxValues: number[] = [];
            const valueValues: number[] = [];
            
            for (let i = 0; i < allRows.length; i++) {
                const row = allRows[i];
                
                try {
                    const minValue = row.continuous<number>("Min").value();
                    const maxValue = row.continuous<number>("Max").value();
                    const currentValue = valueAxis ? row.continuous<number>("Value").value() : null;
                    
                    if (minValue !== null && maxValue !== null) {
                        minValues.push(minValue);
                        maxValues.push(maxValue);
                        if (currentValue !== null) {
                            valueValues.push(currentValue);
                        }
                    }
                } catch (error) {
                    debugLog("Error processing aggregated row", i, error);
                    continue;
                }
            }
            
            if (minValues.length > 0 && maxValues.length > 0) {
                // Calculate aggregated values
                const aggregatedMin = Math.min(...minValues);
                const aggregatedMax = Math.max(...maxValues);
                const aggregatedValue = valueValues.length > 0 ? valueValues.reduce((a, b) => a + b) / valueValues.length : null;
                
                // Use simple number formatting for aggregated values
                const minFormatted = aggregatedMin.toString();
                const maxFormatted = aggregatedMax.toString();
                const valueFormatted = aggregatedValue !== null ? aggregatedValue.toString() : null;
                
                plotData.data.push({
                    category: "Data",
                    min: aggregatedMin,
                    max: aggregatedMax,
                    value: aggregatedValue,
                    minFormatted: minFormatted,
                    maxFormatted: maxFormatted,
                    valueFormatted: valueFormatted,
                    color: "#0ba5e0", // Default blue color
                    rowIndex: 0  // Single aggregated row
                });
            }
        }

        /**
         * Render the visualization
         */
        const container = document.querySelector("#mod-container");
        if (!container) {
            mod.controls.errorOverlay.show(
                "Failed to find the DOM node with id #mod-container."
            );
            return;
        }

        // Clear the container and render the range plot
        container.innerHTML = '<div id="plot-container"></div>';
        
        // Call the createRangePlot function with real data
        if (plotData.data.length > 0) {
            // Pass mod and allRows for tooltip functionality
            (window as any).createRangePlot(plotData, mod, allRows);
            
            // Add click handlers for plot row marking
            if (typeof (window as any).addPlotRowClickHandlers === 'function') {
                (window as any).addPlotRowClickHandlers(mod, allRows);
            }
            
            // Initialize context menu for label visibility (only in edit mode)
            if (typeof (window as any).initializeContextMenu === 'function') {
                (window as any).initializeContextMenu(mod, labelVisibility, !!valueAxis);
            }
            
            // Apply label visibility settings with current marking state
            if (typeof (window as any).applyLabelVisibility === 'function') {
                // Get current marked rows from Spotfire
                const markedRows = new Set();
                try {
                    for (let i = 0; i < allRows.length; i++) {
                        const row = allRows[i];
                        const isMarked = row.isMarked();
                        if (isMarked) {
                            markedRows.add(i);
                        }
                    }
                } catch (error) {
                    debugLog("Error getting marking state:", error);
                }
                
                (window as any).applyLabelVisibilityWithMarking(markedRows);
            }
            
            // Update settings icon position
            if (typeof (window as any).updateSettingsIconPosition === 'function') {
                (window as any).updateSettingsIconPosition();
            }
        } else {
            debugLog("No valid data to render");
        }

        /**
         * Signal that the mod is ready for export.
         */
        context.signalRenderComplete();
    }
});
