/*
    File:   graph.js
    Author: Matteo Loporchio

    Reference: https://www.d3-graph-gallery.com/graph/streamgraph_basic.html
*/

// Select the target div.
const graph = d3.select('#graph');

// Define the dimensions of the graph.
var graphFullWidth = graph.node().getBoundingClientRect().width, 
    graphFullHeight = 550;
var margin = {top: 50, right: 50, bottom: 0, left: 50},
    graphWidth = graphFullWidth - margin.left - margin.right,
    graphHeight = graphFullHeight - margin.top - margin.bottom;

const tickLength = graphHeight * 0.7;
const gap = 10;
const limY = 4000; // y axis limit
const base = graphHeight * 0.8;// base position of the y axis.
const duration = 500; // transition duration in ms

// Build the graph for the whole country.
buildGraph(null, expenses, stackable, base);

////////////////////////////////////////////////////////////////////////////////

// Initializes the SVG area where the graph will be placed.
function initArea() {
    var svg = graph.append('svg')
        .attr('id', 'graphArea')
        .attr('width', graphFullWidth)
        .attr('height', graphFullHeight)
        .append('g')
        .attr('transform', 'translate(' + margin.left 
        + ',' + margin.top + ')');
    return svg;
}

// Initializes the graph tooltip.
function initTooltip(parent, text) {
    var tooltip = parent.append('text')
        .attr('id', 'graphTooltip')
        .attr('x', 0)
        .attr('y', 0)
        .attr('font-size', 20)
        .style('opacity', 1)
        .text(text)
    return tooltip;
}

// Initializes the X axis of the graph.
function initXAxis(parent, values, base) {
    // Compute the extent [min, max] of the values.
    var d = d3.extent(values);
    var xScale = d3.scaleLinear().domain(d).range([0, graphWidth]);
    var xAxis = d3.axisBottom(xScale)
        .tickSize(-tickLength)
        // Remove commas as separators from ticks.
        .tickFormat(d3.format('.0f'))
        .tickValues(values);
    parent.append('g')
        .attr('id', 'xAxis')
        // X axis translation.
        .attr('transform', 'translate(0,' + (base + gap) + ')')
        .call(xAxis)
        .select('.domain').remove();
    parent.append('text')
        .attr('id', 'xAxisLabel')
        .attr('text-anchor', 'end')
        .attr('x', graphWidth)
        .attr('y', graphHeight - 30)
        .text('Anno');
    return xScale;
}

// Initializes the Y axis of the graph.
function initYAxis(parent, limY, base) {
    var yScale = d3.scaleLinear().domain([0, limY]).range([base, 60]);
    var yAxis = d3.axisLeft(yScale)
        .tickFormat(d3.format('.0f'))
        .tickValues([0, 1000, 2000, 3000, 4000]);
    parent.append('g')
        .attr('id', 'yAxis')
        .attr('transform', 'translate(-' + (gap / 2) + ',0)')
        .call(yAxis);
    return yScale;
}

// This function adds the shapes to the graph.
function initShapes(parent, data, properties, xScale, yScale) {
    var stackedData = d3.stack()
        .offset(d3.stackOffsetNone)
        .keys(properties)
        (data)
    var area = d3.area()
        .x(function (d) {return xScale(d.data.Anno);})
        .y0(function (d) {return yScale(d[0]);})
        .y1(function (d) {return yScale(d[1]);});
    parent.append('g')
        .attr('id', 'shapeGroup')
        .selectAll('path')
        .data(stackedData)
        .enter()
        .append('path')
        .attr('class', 'graphShape')
        .attr('id', function (d, i) {return 'shape_' + i;})
        .style('fill', function (d, i) {return palette[i];})
        .attr('d', area)
        .on('click', graphClick)
        .on('mouseover', graphMouseOver)
        .on('mousemove', graphMouseMove)
        .on('mouseleave', graphMouseLeave);
}

// This function adds the income line to the graph.
function initIncome(parent, data, xScale, yScale) {
    var a = d3.area()
        .x(function (d) {return xScale(d.Anno);})
        .y0(function (d) {return yScale(limY);})
        .y1(function (d) {return yScale(d.Reddito);});
    var l = d3.line()
        .x(function (d) {return xScale(d.Anno);})
        .y(function (d) {return yScale(d.Reddito);}); 
    parent.append('path')
        .data([data])
        .attr('id', 'incomeArea')
        .attr('d', a)
        .style('fill', 'lightgray')
        .style('opacity', .4)
        .style('stroke', 'none')
    parent.append('path')
        .data([data])
        .attr('id', 'incomeLine')
        .attr('d', l)
        .style('fill', 'none')
        .style('stroke', palette[properties.length-1])
        .style('stroke-width', 4);
}

function setIncome(visible) {
    const line = d3.select('#incomeLine'), area = d3.select('#incomeArea');
    line.style('visibility', ((visible) ? 'visible' : 'hidden'));
    area.style('visibility', ((visible) ? 'visible' : 'hidden'));
}

function initTicks(parent) {
    parent.selectAll('.tick line')
        .attr('id', function (d) {return 'graphLine_' + d;})
        .attr('stroke', '#b8b8b8')
        .attr('stroke-width', 1);
    parent.selectAll('.tick text').attr('fill', 'black')
}

/*
    Updates the graph ticks according to the currently selected year.
    Adds a red vertical line 
*/
function updateTicks(parent, year) {        
    // Select the current tick.
    parent.select('#currentTick').remove(); // remove old red tick
    var current = parent.select('#graphLine_' + year);
    var ctm = current.node().getTransformToElement(parent.node());//.getCTM();
    var bbox = current.node().getBBox()
    parent.append('line')
        .attr('id', 'currentTick')
        .attr('y2', bbox.y)
        .attr('transform', 'matrix(' + ctm.a + ',' + ctm.b + ',' + ctm.c 
        + ',' + ctm.d + ',' + ctm.e + ',' + ctm.f + ')')
        .attr('stroke', 'crimson')
        .attr('stroke-width', 2);
    // Label setup.
    parent.selectAll('.tick text') 
        .attr('fill', 'black')
        .filter(function (d) {return d == year;})
        .attr('fill', 'crimson');
}

/*
    Highlights a given shape in the graph.
    If the given property ID is different from the default one, 
    all the shapes are highlighted.
*/
function selectShape(parent, pid) {
    const shapes = parent.selectAll('.graphShape');
    // Highlight all if pid == expenses.
    if (pid == expenses) {
        shapes.style('opacity', 1);
        setIncome(true);
    }
    else {
        // Hide all if pid == incomes.
        if (pid == incomes) {
            shapes.style('opacity', .2);
            setIncome(true);
        }
        // Otherwise highlight only the selected property.
        else {
            shapes.style('opacity', .2);
            parent.select('#shape_' + pid)
                .style('stroke', 'black')
                .style('opacity', 1);
            setIncome(false);
        }
    }
}

/*
    Main function that builds the graph by reading data from CSV files.
    
    Parameters:
        -   rid = id of the currently selected region
        -   pid = id of the currently selected property
        -   properties = set of properties to be displayed
        -   base = position of the X axis
*/
function buildGraph(rid, pid, properties, base) {
    // Set up the graph area.
    var svg = initArea();
    // Get the path of the file.
    var filename = getRegionFilename(rid);
    // Add the graph tooltip with the name of the currently selected feature.
    initTooltip(svg, descriptions[pid]);
    // Parse the CSV file and construct the graph.
    d3.csv(filename, function (data) {
        // Compute the values (years) for the X axis.
        var years = [];
        data.forEach(function (d) {years.push(d.Anno);});
        // Build the X axis.
        var xScale = initXAxis(svg, years, base);
        // Initialize the X axis ticks.
        initTicks(svg);
        // Build the Y axis.
        var yScale = initYAxis(svg, limY, base);
        // Add the shapes.
        initShapes(svg, data, properties, xScale, yScale);
        // Initialize the income line.
        initIncome(svg, data, xScale, yScale);
        // Set the default style for the tick lines of the X axis.
        updateTicks(svg, yearMin);
        // Set the correct property on the graph.
        selectShape(svg, pid);
    });
    return svg;
}

// Makes the current graph disappear completely.
function removeGraph() {
    d3.select('#graphArea').remove();
}

// Makes the current graph disappear with a smooth transition.
function removeGraphWithTransition() {
    d3.select('#graphArea')
        .transition()
        .duration(duration)
        .attrTween('opacity', function() {
            var startValue = 1, endValue = 0;
            return d3.interpolateNumber(startValue, endValue);
        })
        .remove();
}

////////////////////////////////////////////////////////////////////////////////

function graphClick(d, i) {
    /*
    // Select and uncheck the previously checked button.
    var prev = d3.select('input[name=property]:checked');
    prev.property('checked', false);
    // Check the new button.
    var curr = d3.select('input[name=property][value="' + i + '"]');
    curr.property('checked', true);
    // Remove the current graph.
    removeGraphWithTransition();
    // Rebuild the graph.
    //buildGraph(getRegionFilename(null), [properties[i]]);
    */
}

function graphMouseOver(d, i) {
    const graph = d3.select('#graphArea');
    const tooltip = graph.select('#graphTooltip');
    tooltip.text(descriptions[i]);
    selectShape(graph, i);
}

function graphMouseMove(d, i) {
    const tooltip = d3.select('#graphTooltip');
    tooltip.text(descriptions[i]);
}

function graphMouseLeave(d, i) {
    const graph = d3.select('#graphArea');
    const tooltip = graph.select('#graphTooltip');
    const pid = d3.select('.listEntry[selected="true"]').attr('pid');
    tooltip.text(descriptions[pid]);
    selectShape(graph, pid);
}