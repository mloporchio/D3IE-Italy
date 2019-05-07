/*
  File:   slider.js
  Author: Matteo Loporchio
*/

// Initialize the range slider.
var c = d3.select('#sliderInput')
    .attr('min', yearMin)
    .attr('max', yearMax)
    .on('input', function () {
        const year = this.value;
        // Update the value of the label.
        d3.select('#sliderLabel').html(year);
        // Get the currently selected property.
        const id = d3.select('input[name="property"]:checked').node().value;
        // Color the map.
        fillMap(id, year);
        // Update the currently selected graph tick.
        updateTicks(year);
    });

// Initialize the label.
d3.select('#sliderLabel').html(yearMin);
// Color the map for the first time.
const id = d3.select('input[name="property"]:checked').node().value;
fillMap(id, yearMin);