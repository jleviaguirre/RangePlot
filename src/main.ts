Spotfire.initialize(async (mod: Spotfire.Mod) => {
    /**
     * Create the read function.
     */
    const reader = mod.createReader(mod.visualization.data(), mod.windowSize(), mod.property("myProperty"));

    /**
     * Store the context.
     */
    const context = mod.getRenderContext();

    /**
     * Initiate the read loop
     */
    reader.subscribe(render);

    async function render(dataView: Spotfire.DataView, windowSize: Spotfire.Size, prop: Spotfire.ModProperty<string>) {
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
        const valueAxis = await dataView.continuousAxis("Value");

        // Check if we have the required data
        if (!rangeByHierarchy || !minAxis || !maxAxis || !valueAxis) {
            // Show sample data if no real data is configured
            console.log("Missing required data, showing sample data");
            renderSampleData();
            context.signalRenderComplete();
            return;
        }

        const rangeByRoot = await rangeByHierarchy.root();
        if (!rangeByRoot) {
            renderSampleData();
            context.signalRenderComplete();
            return;
        }

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
            renderSampleData();
            context.signalRenderComplete();
            return;
        }
        
        for (let i = 0; i < allRows.length; i++) {
            const row = allRows[i];
            
            try {
                // Get the category name from the categorical axis
                const categoryValue = row.categorical("Range by");
                const category = categoryValue.formattedValue();
                
                // Get the continuous values - both raw (for calculations) and formatted (for display)
                const minValue = row.continuous<number>("Min").value();
                const maxValue = row.continuous<number>("Max").value();
                const currentValue = row.continuous<number>("Value").value();
                
                // Get formatted values for display
                const minFormatted = row.continuous("Min").formattedValue();
                const maxFormatted = row.continuous("Max").formattedValue();
                const currentFormatted = row.continuous("Value").formattedValue();

                // Get the color from the color axis
                const colorInfo = row.color();
                const hexColor = colorInfo ? colorInfo.hexCode : "#0ba5e0"; // Default blue if no color

                // Only add if we have valid values
                if (minValue !== null && maxValue !== null && currentValue !== null) {
                    plotData.data.push({
                        category: category,
                        min: minValue,              // Raw values for calculations
                        max: maxValue,
                        value: currentValue,
                        minFormatted: minFormatted, // Formatted values for display
                        maxFormatted: maxFormatted,
                        valueFormatted: currentFormatted,
                        color: hexColor,
                        rowIndex: i  // Store row index for tooltip access
                    });
                }
            } catch (error) {
                console.warn("Error processing row", i, error);
                continue;
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
        } else {
            renderSampleData();
        }

        /**
         * Signal that the mod is ready for export.
         */
        context.signalRenderComplete();
    }

    function renderSampleData() {
        const container = document.querySelector("#mod-container");
        if (container) {
            container.innerHTML = '<div id="plot-container"></div>';
            
            const sampleData = {
                "option1": "temperature",
                "option2": "celsius",
                "data": [
                    {"min": 52, "max": 83.5, "value": 65.9, "minFormatted": "52.0°", "maxFormatted": "83.5°", "valueFormatted": "65.9°", "category": "today", "color": "#ff6b6b", "rowIndex": 0},
                    {"min": 55.8, "max": 83.5, "value": 69.1, "minFormatted": "55.8°", "maxFormatted": "83.5°", "valueFormatted": "69.1°", "category": "yesterday", "color": "#4ecdc4", "rowIndex": 1},
                    {"min": 52, "max": 88.5, "value": 70.4, "minFormatted": "52.0°", "maxFormatted": "88.5°", "valueFormatted": "70.4°", "category": "week", "color": "#45b7d1", "rowIndex": 2},
                    {"min": 38.5, "max": 88.5, "value": 65.9, "minFormatted": "38.5°", "maxFormatted": "88.5°", "valueFormatted": "65.9°", "category": "month", "color": "#96ceb4", "rowIndex": 3},
                    {"min": -0.8, "max": 88.5, "value": 42.1, "minFormatted": "-0.8°", "maxFormatted": "88.5°", "valueFormatted": "42.1°", "category": "year", "color": "#feca57", "rowIndex": 4}
                ]
            };

            // For sample data, pass null for mod and allRows since we don't have real Spotfire data
            (window as any).createRangePlot(sampleData, null, null);
        }
    }
});
