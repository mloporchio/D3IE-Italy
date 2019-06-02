/*
    File:   slider.js
    Author: Matteo Loporchio
*/

// Initialize the range slider.
var sliderContainer = d3.select('#graph')
    .append('div')
    .attr('id', 'sliderContainer');

var slider = sliderContainer.append('input')
    .attr('type', 'range')
    .attr('class', 'slider')
    .attr('id', 'sliderInput')
    .attr('min', yearMin)
    .attr('max', yearMax)
    .on('input', function () {
        var pid = d3.select('.listEntry[selected="true"]').attr('pid');
        var year = this.value;
        // Update the title of the map.
        map.setTitle(null, year);
        // Color the map.
        map.fill(pid, year);
        // Update the currently selected graph tick.
        graph.setCurrentTick(year);
    });