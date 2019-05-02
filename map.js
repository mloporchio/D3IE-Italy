/*
    File:   map.js
    Author: Matteo Loporchio
*/

// Select the div node.
const left = d3.select('#left');

const jsonPath = 'data/it_geo.json';
const mapWidth = left.node().getBoundingClientRect().width, mapHeight = 500;
const defaultMapTitle = 'Italy';
var centered = null;

// Set the map title.
left.append('div')
    .attr('class', 'label')
    .attr('id', 'mapTitle')
    .text(defaultMapTitle);

// Create and initialize the SVG area.
var svg = left.append('svg')
    .attr('width', mapWidth)
    .attr('height', mapHeight);
svg.append('rect')
    .attr('class', 'background')
    .attr('width', mapWidth)
    .attr('height', mapHeight)
    .on('click', mapClicked);
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
        .attr('id', function (d) {
            console.log('id=' + d.properties.ID_1 + ' name=' + d.properties.NAME_1);
            return 'reg' + d.properties.ID_1; 
        })
        .attr('name', function (d) {return d.properties.NAME_1;})
        .attr('value', 0)
        .attr('d', path)
        .on('click', mapClicked)
        // tooltip-related event handlers
        .on('mouseover', mapMouseOver)
        .on('mousemove', mapMouseMove)
        .on('mouseout', mapMouseOut);
});

// Tooltip setup.
var mapTooltip = d3.select('body')
    .append('div')
    .attr('class', 'map_tooltip')
    .style('opacity', 0)
    .style('visibility', 'hidden');

// This function is invoked when the mouse enters a shape.
function mapMouseOver(d) {
    // Show the value for that region in the tooltip.
    mapTooltip.style('visibility', 'visible');
    mapTooltip.transition().duration(200).style('opacity', 0.9);
    const currentValue = d3.select(this).attr('value');
    mapTooltip.html(currentValue + ' €');
    // Show the region name in the title.
    if (!centered) d3.select('#mapTitle').text(d.properties.NAME_1);
    //map_tooltip.html(d.properties.NAME_1);
}

// This function is invoked when the mouse moves on a shape.
function mapMouseMove(d) {
    var top = event.pageY - 10, left = event.pageX + 10;
    mapTooltip.style('top', top + 'px').style('left', left + 'px');
}

// This function is invoked when the mouse leaves a shape.
function mapMouseOut(d) {
    mapTooltip.style('visibility', 'hidden');
    // Show the region name in the title.
    if (!centered) d3.select('#mapTitle').text(defaultMapTitle);
}

// This function is invoked when when the mouse is clicked on a shape.
function mapClicked(d, i) {
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
    // Transform the shapes.
    container.selectAll('path')
        .classed('active', centered && function(d) {return d === centered;});
    container.transition()
        .duration(750)
        .attr('transform', 'translate(' + mapWidth / 2 + ','
        + mapHeight / 2 + ')scale(' + k + ')translate(' + -x + ',' + -y + ')')
        .style('stroke-width', 1.5 / k + 'px');
    // Load the data.
    d3.selectAll('.graphArea').remove();
    //var id = d.properties.ID_1;
    //console.log('clicked ' + id +  ' called '+ regions[i]);
    buildGraph(i);
}

// This function fills the map with colors acc
function fillMap(propertyID, year) {
    // Build the file name and load the file.
    var filename = 'data/by_year/'+ year + '.csv';
    var values = [];
    // Read the values from the CSV file.
    d3.csv(filename, function (data) {
        // Fill the values array.
        for (var i = 0; i < regions.length; i++) {
            values.push(data[propertyID][regions[i]]);
        }
        var d = d3.extent(values, function (x) {return +x;});
        var r = ['white', palette[propertyID]];
        var color = d3.scaleLinear().domain(d).range(r);
        // Color the regions according to their value.
        for (var i = 0; i < values.length; i++) {
            var c = color(values[i]);
            d3.select('#reg' + (i + 1))
                .attr('fill', c)
                .attr('value', values[i]);
        }
    });
}