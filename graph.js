/*
    File:   graph.js
    Author: Matteo Loporchio

    Reference: https://www.d3-graph-gallery.com/graph/streamgraph_basic.html
*/

// Path of the CSV file that contains our data.
var dataUrl = 'data/Quadro_Italia.csv';
// Select the target div.
const right = d3.select('#right');

// Set the dimensions of the graph.
var graphWidth = right.node().getBoundingClientRect().width, graphHeight = 500;
console.log('graph width = ' + graphWidth);
var margin = {top: 50, right: 50, bottom: 0, left: 50},
    width = graphWidth - margin.left - margin.right,
    height = graphHeight - margin.top - margin.bottom;

// Append the SVG object to the target div element.
var svg = right.append('svg')
    .attr('width', graphWidth)
    .attr('height', graphHeight)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// Append the tooltip to the SVG objct.
var graphTooltip = svg.append('text')
    .attr('class', 'graph_tooltip')
    .attr('x', 0)
    .attr('y', 0)
    .style('opacity', 0);

// Parse the data.
d3.csv(dataUrl, function (data) {
    // Obtain the names of the columns.
    var column_names = data.columns.slice(1);
    // Setup the X axis.
    var years = [];
    data.forEach(function (d) {years.push(d.Anno);});
    var xDom = d3.extent(data, function (d) {return d.Anno;});
    var xScale = d3.scaleLinear().domain(xDom).range([0, width]);
    var xAxis = d3.axisBottom(xScale)
        .tickSize(-height * 0.7)
        // Remove commas as separators from ticks.
        .tickFormat(d3.format('.0f'))
        .tickValues(years);
    svg.append('g')
        .attr('transform', 'translate(0,' + height*0.8 + ')')
        .call(xAxis)
        .select('.domain').remove();
    svg.selectAll('.tick line').attr('stroke', '#b8b8b8')
    svg.append('text')
        .attr('text-anchor', 'end')
        .attr('x', width)
        .attr('y', height-30)
        .text('Time (year)');
    // Setup the Y axis.
    var yDom = [-7000, 7000];
    var yScale = d3.scaleLinear().domain(yDom).range([height, 0]);
    //stack the data?
    var stackedData = d3.stack()
        .offset(d3.stackOffsetSilhouette)
        .keys(column_names)
        (data)
    // Area generator
    var area = d3.area()
        .x(function (d) {return xScale(d.data.Anno);})
        .y0(function (d) {return yScale(d[0]);})
        .y1(function (d) {return yScale(d[1]);});
    //
    svg.selectAll('mylayers')
        .data(stackedData)
        .enter()
        .append('path')
        .attr('class', 'myArea')
        .style('fill', function (d, i) {return palette[i];})
        .attr('d', area)
        // Handle mouseOver event.
        .on('mouseover', function (d) {
            graphTooltip.style('opacity', 1);
            d3.selectAll('.myArea').style('opacity', .2);
            d3.select(this).style('stroke', 'black').style('opacity', 1);
        })
        // Handle mouseMove event.
        .on('mousemove', function (d, i) {
            graphTooltip.text(properties[i][1]);
        })
        // Handle mouseLeave event.
        .on('mouseleave', function (d) {
            graphTooltip.style('opacity', 0);
            d3.selectAll('.myArea').style('opacity', 1);
            //.style('stroke', 'none');
        });
});
