/*
    File:   graph.js
    Author: Matteo Loporchio

    Reference: https://www.d3-graph-gallery.com/graph/streamgraph_basic.html
*/

// Select the target div.
const graph = d3.select('#graph');

// Define the dimensions of the graph.
var graphFullWidth = graph.node().getBoundingClientRect().width, 
    graphFullHeight = 500;
var margin = {top: 50, right: 50, bottom: 0, left: 50},
    graphWidth = graphFullWidth - margin.left - margin.right,
    graphHeight = graphFullHeight - margin.top - margin.bottom;

// Build the graph for the whole country.
buildGraph();

/******************************************************************************/

// This function loads data and builds the graph for a given region.
// If no id is supplied, the graph for the whole country is constructed. 
function buildGraph(regionID) {
    // Build the filename to be loaded.
    var path = defaultGraphPath;
    if (regionID) path = 'data/by_region/'+ regions[regionID] + '.csv';
    // Set up the graph area.
    var svg = graph.append('svg')
        .attr('class', 'graphArea')
        .attr('width', graphFullWidth)
        .attr('height', graphFullHeight)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    // Add the graph tooltip with the name of the currently selected feature.
    var tooltip = svg.append('text')
        .attr('id', 'graphTooltip')
        .attr('x', 0)
        .attr('y', 0)
        .attr('font-size', 20)
        .style('opacity', 1);
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
        var columnNames = data.columns.slice(1, data.columns.length - 2);
        // Setup the X axis.
        var years = [];
        data.forEach(function (d) {years.push(d.Anno);});
        var xDom = d3.extent(data, function (d) {return d.Anno;});
        var xScale = d3.scaleLinear().domain(xDom).range([0, graphWidth]);
        var xAxis = d3.axisBottom(xScale)
            .tickSize(-graphHeight * 0.7)
            // Remove commas as separators from ticks.
            .tickFormat(d3.format('.0f'))
            .tickValues(years);
        var z = graphHeight * 0.8;
        svg.append('g')
            .attr('transform', 'translate(0,' + (z + 10) + ')')
            .call(xAxis)
            .select('.domain').remove();
        // Set the default style for the tick lines.
        updateTicks(yearMin);
        // Compute the range for the Y axis.
        var yScale = d3.scaleLinear()
            .domain([0, 4000])
            .range([z, 0]);
        var stackedData = d3.stack()
            .offset(d3.stackOffsetNone)
            .keys(columnNames)
            (data)
        var area = d3.area()
            .x(function (d) {return xScale(d.data.Anno);})
            .y0(function (d) {return yScale(d[0]);})
            .y1(function (d) {return yScale(d[1]);});
        // Add the shapes to the graph.
        svg.selectAll('mylayers')
            .data(stackedData)
            .enter()
            .append('path')
            .attr('class', 'graphShape')
            .attr('id', function (d, i) {return 'graphShape_' + i;})
            .style('fill', function (d, i) {return palette[i];})
            .attr('d', area)
            // Handle click event.
            // Change property when clicking on its shape.
            .on('click', function (d, i) {
                // Get the currently checked radio button.
                var prev = d3.select('input[name="property"]:checked');
                // Check the i-th button and trigger the change event.
                var curr = d3.select('input[value="'+ i +'"]');
                curr.dispatch('change');
                curr.attr('checked', true);
                // Uncheck the previously selected button.
                prev.attr('checked', null);
            })
            // Handle mouseover event.
            .on('mouseover', function (d, i) {
                // Set the tooltip text.
                tooltip.text(properties[i][1]);
                // Highlight the shape.
                highlightShape(i);
            })
            // Handle mousemove event.
            .on('mousemove', function (d, i) {
                tooltip.text(properties[i][1]);
            })
            // Handle mouseleave event.
            .on('mouseleave', function (d, i) {
                // Get the currently selected property.
                const id = d3.select('input[name="property"]:checked')
                    .node().value; 
                // Set the tooltip text.
                tooltip.text(properties[id][1]);
                // If the default property is selected highlight all the shapes.
                if (id == defaultPropertyID) highlightAllShapes();
                // Otherwise, highlight only the selected one.
                else highlightShape(id);
            });
    });
}

// Updates the graph ticks according to the currently selected year.
function updateTicks(year) {
    var graphArea = d3.select('.graphArea');
    function currentYear(d) {return d == year;}
    graphArea.selectAll('.tick line')
        .attr('stroke', '#b8b8b8')
        .attr('stroke-width', 1)
        .filter(currentYear)
        .attr('stroke', 'crimson')
        .attr('stroke-width', 2);
    graphArea.selectAll('.tick text') 
        .attr('fill', 'black')
        .filter(currentYear)
        .attr('fill', 'crimson');
}

// Highlights a given shape (and hides all the other ones).
function highlightShape(id) {
    d3.selectAll('.graphShape').style('opacity', .2);
    d3.select('#graphShape_' + id)
        .style('stroke', 'black')
        .style('opacity', 1);
}

function highlightAllShapes() {
    d3.selectAll('.graphShape').style('opacity', .7);
}
