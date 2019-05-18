/*
  File:   slider.js
  Author: Matteo Loporchio
*/

// Initialize the range slider.
var c = d3.select('#sliderInput')
    .attr('min', yearMin)
    .attr('max', yearMax)
    .on('input', function () {
        const pid = d3.select('.listEntry[selected="true"]').attr('pid');
        const year = this.value;
        const graph = d3.select('#graphArea');
        // Update the value of the label.
        d3.select('#sliderLabel').html(year);
        // Color the map.
        fillMap(pid, year);
        // Update the currently selected graph tick.
        updateTicks(graph, year);
    });

// Initialize the label.
d3.select('#sliderLabel').html(yearMin);
// Color the map for the first time.
const pid = d3.select('.listEntry[selected="true"]').attr('pid');
fillMap(pid, yearMin);