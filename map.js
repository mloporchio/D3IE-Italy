/*
    File:   map.js
    Author: Matteo Loporchio
*/

// Select the div node.
const left = d3.select('#left');

const jsonPath = 'data/it_geo.json';
const mapWidth = left.node().getBoundingClientRect().width, mapHeight = 500;
const mapTitle = 'Italy';
var centered = null;

// Set the map title.
left.append('div')
    .attr('class', 'label')
    .attr('id', 'mapTitle')
    .text(mapTitle);

// Create and initialize the SVG area.
var svg = left.append('svg')
    .attr('width', mapWidth)
    .attr('height', mapHeight);
svg.append('rect')
    .attr('class', 'background')
    .attr('width', mapWidth)
    .attr('height', mapHeight)
    .on('click', clicked);
var container = svg.append('g');

// D3 map projections (used to create the map).
var projection = d3.geoNaturalEarth1();
var path = d3.geoPath().projection(projection);

// Load data from file.
d3.json(jsonPath, function (error, countries) {
    if (error) console.log(error);
    projection.fitExtent([[0, 0], [mapWidth, mapHeight]], countries);
    container.selectAll('path')
        .data(countries.features)
        .enter()
        .append('path')
        // Append a region ID and a name to each path.
        .attr('id', function (d) {return 'reg' + d.properties.ID_1;})
        .attr('name', function (d) {return d.properties.NAME_1;})
        .attr('value', 0)
        .attr('d', path)
        .on('click', clicked)
        // tooltip-related event handlers
        .on('mouseover', mouseOver)
        .on('mousemove', mouseMove)
        .on('mouseout', mouseOut);
});

// Tooltip setup.
var mapTooltip = d3.select('body')
    .append('div')
    .attr('class', 'map_tooltip')
    .style('opacity', 0)
    .style('visibility', 'hidden');

// This function is invoked when the mouse enters a shape.
function mouseOver(d) {
    mapTooltip.style('visibility', 'visible');
    mapTooltip.transition().duration(200).style('opacity', 0.9);
    // Show the current value.
    const currentValue = d3.select(this).attr('value');
    mapTooltip.html(currentValue + ' €');
    // Show the region name.
    //map_tooltip.html(d.properties.NAME_1);
}

// This function is invoked when the mouse moves on a shape.
function mouseMove(d) {
    var top = event.pageY - 10, left = event.pageX + 10;
    mapTooltip.style('top', top + 'px').style('left', left + 'px');
}

// This function is invoked when the mouse leaves a shape.
function mouseOut(d) {
    mapTooltip.style('visibility', 'hidden');
}

// This function is invoked when when the mouse is clicked on a shape.
function clicked(d, i) {
    var x, y, k;
    if (d && centered !== d) {
        var centroid = path.centroid(d);
        x = centroid[0];
        y = centroid[1];
        k = 4;
        centered = d;
    } else {
        x = mapWidth / 2;
        y = mapHeight / 2;
        k = 1;
        centered = null;
    }
    // Set the title.
    if (centered) d3.select('#mapTitle').text(d.properties.NAME_1);
    else d3.select('#mapTitle').text(mapTitle);
    // Transform the shapes.
    container.selectAll('path')
        .classed('active', centered && function(d) {return d === centered;});
    container.transition()
        .duration(750)
        .attr('transform', 'translate(' + mapWidth / 2 + ','
        + mapHeight / 2 + ')scale(' + k + ')translate(' + -x + ',' + -y + ')')
        .style('stroke-width', 1.5 / k + 'px');
}
