/*
    File:   graph.js
    Author: Matteo Loporchio

    Reference: https://www.d3-graph-gallery.com/graph/streamgraph_basic.html
*/

// Select the target div.
const right = d3.select('#right');
// Define the dimensions of the graph.
var graphFullWidth = right.node().getBoundingClientRect().width, 
    graphFullHeight = 500;
var margin = {top: 50, right: 50, bottom: 0, left: 50},
    graphWidth = graphFullWidth - margin.left - margin.right,
    graphHeight = graphFullHeight - margin.top - margin.bottom;

// This function loads data and builds the graph for a given region.
// If no id is supplied, the graph for the whole country is constructed. 
function buildGraph(regionID) {
    // Build the filename to be loaded.
    var path = defaultGraphPath;
    if (regionID) path = 'data/by_region/'+ regions[regionID] + '.csv';
    // Set up the graph area.
    var svg = right.append('svg')
        .attr('class', 'graphArea')
        .attr('width', graphFullWidth)
        .attr('height', graphFullHeight)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    // Add the graph tooltip with the name of the currently selected feature.
    var tooltip = svg.append('text')
        .attr('class', 'graphTooltip')
        .attr('x', 0)
        .attr('y', 0)
        .style('opacity', 0);
    // Add a label for the X axis.
    var xAxisLabel = svg.append('text')
        .attr('id', 'xAxisLabel')
        .attr('text-anchor', 'end')
        .attr('x', graphWidth)
        .attr('y', graphHeight - 30)
        .text('Anno');
    // Parse the data.
    d3.csv(path, function (data) {
        // Obtain the names of the columns.
        var columnNames = data.columns.slice(1);
        var years = [];
        data.forEach(function (d) {years.push(d.Anno);});
        var xDom = d3.extent(data, function (d) {return d.Anno;});
        var xScale = d3.scaleLinear().domain(xDom).range([0, graphWidth]);
        var xAxis = d3.axisBottom(xScale)
            .tickSize(-graphHeight * 0.7)
            // Remove commas as separators from ticks.
            .tickFormat(d3.format('.0f'))
            .tickValues(years);
        svg.append('g')
            .attr('transform', 'translate(0,' + graphHeight * 0.8 + ')')
            .call(xAxis)
            .select('.domain').remove();
        svg.selectAll('.tick line').attr('stroke', '#b8b8b8');
        var ext = 7000;
        var yDom = [-ext, ext];
        var yScale = d3.scaleLinear().domain(yDom).range([graphHeight, 0]);
        var stackedData = d3.stack()
            .offset(d3.stackOffsetSilhouette)
            .keys(columnNames)
            (data)
        var area = d3.area()
            .x(function (d) {return xScale(d.data.Anno);})
            .y0(function (d) {return yScale(d[0]);})
            .y1(function (d) {return yScale(d[1]);});
        svg.selectAll('mylayers')
            .data(stackedData)
            .enter()
            .append('path')
            .attr('class', 'myArea')
            .style('fill', function (d, i) {return palette[i];})
            .attr('d', area)
            // Handle mouseOver event.
            .on('mouseover', function (d) {
                tooltip.style('opacity', 1);
                d3.selectAll('.myArea').style('opacity', .2);
                d3.select(this).style('stroke', 'black').style('opacity', 1);
            })
            // Handle mouseMove event.
            .on('mousemove', function (d, i) {
                tooltip.text(properties[i][1]);
            })
            // Handle mouseLeave event.
            .on('mouseleave', function (d) {
                tooltip.style('opacity', 0);
                d3.selectAll('.myArea').style('opacity', 1);
            });
    });
}

// Construct the graph for the whole country.
buildGraph();