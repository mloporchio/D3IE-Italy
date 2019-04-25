/*
  File:   slider.js
  Author: Matteo Loporchio
*/

// Initialize the range slider.
var c = d3.select('#slider_input')
    .attr('min', yearMin)
    .attr('max', yearMax)
    .on('input', function () {
        const year = this.value;
        // Update the value of the label.
        d3.select('#slider_label').html(year);
        // Get the currently selected property.
        const id = d3.select('input[name="property"]:checked').node().value;
        // Color the map.
        fillMap(id, year);
    });

// Initialize the label.
d3.select('#slider_label').html(yearMin);
// Color the map for the first time.
const id = d3.select('input[name="property"]:checked').node().value;
fillMap(id, yearMin);