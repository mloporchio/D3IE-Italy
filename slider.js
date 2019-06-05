/*
    File:   slider.js
    Author: Matteo Loporchio
*/

var ref = d3.select('#xAxis');

// This function returns the distance between the current position of the xAxis
// and the margin of the parent container.
function leftGap() {
    var g1 = d3.select('#graphArea').node().getBoundingClientRect().x;
    var g2 = ref.node().getBoundingClientRect().x;
    return Math.abs(g1 - g2);
}

var rangeWidth = ref.node().getBoundingClientRect().width - 5;
var sliderContainer = d3.select('#graph')
    .append('div')
    .attr('id', 'sliderContainer')
    .style('padding-left', leftGap() + 'px');

// Manually set up the resizing behaviour for the slider container.
d3.select(window)
    .on('resize.sliderContainer', function () {
        var rangeWidth = ref.node().getBoundingClientRect().width - 5;
        d3.select('#sliderInput').style('width', (rangeWidth) + 'px');
        d3.select('#sliderContainer').style('padding-left', leftGap() + 'px');
    });

var slider = sliderContainer.append('input')
        .attr('type', 'range')
        .attr('class', 'slider')
        .attr('id', 'sliderInput')
        .attr('min', yearMin)
        .attr('max', yearMax)
        .style('width', rangeWidth + 'px')
        .on('input', function () {
            var pid = d3.select('.listEntry[selected="true"]').attr('pid');
            var year = this.value;
            // Update the title of the map.
            map.setTitle(null, year);
            // Color the map.
            map.fill(pid, year);
            // Update the currently selected graph tick.
            graph.setCurrentTick(year);
        })