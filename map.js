/*
    File:   map.js
    Author: Matteo Loporchio
*/

// Select the div node.
const map = d3.select('#map');
const mapWidth = map.node().getBoundingClientRect().width, 
    mapHeight = 400,
    legendWidth = mapWidth,
    legendHeight = 100;
const defaultMapTitle = 'Italia';
var centered = null;

// Set the map title.
map.append('div')
    .attr('class', 'itemTitle')
    .attr('id', 'mapTitle')
    .text(defaultMapTitle);

// Create and initialize the SVG area.
var svg = map.append('svg')
    .attr('width', mapWidth)
    .attr('height', mapHeight);
svg.append('rect')
    .attr('class', 'background')
    .attr('width', mapWidth)
    .attr('height', mapHeight)
    .on('click', mapClicked);
var container = svg.append('g');

// Add the color legend.
map.append('div')
    .attr('class', 'mapLegend')
    .append('svg')
    .attr('width', legendWidth)
    .attr('height', legendHeight)
    .append('g')
    .attr('class', 'legendLinear')
    .attr('transform', 'translate(40,30)');

// D3 map projections (used to create the map).
var projection = d3.geoNaturalEarth1();
var path = d3.geoPath().projection(projection);

// Load data from file.
d3.json(defaultJSONPath, function (error, countries) {
    if (error) console.log(error);
    projection.fitExtent([[0, 0], [mapWidth, mapHeight]], countries);
    container.selectAll('path')
        .data(countries.features)
        .enter()
        .append('path')
        // Append a region ID and a name to each path.
        .attr('id', function (d) {return 'region_' + d.properties.ID;})
        .attr('name', function (d) {return d.properties.NAME;})
        .attr('value', 0)
        .attr('d', path)
        // Event handlers.
        .on('click', mapClicked)
        .on('mouseover', mapMouseOver)
        .on('mousemove', mapMouseMove)
        .on('mouseout', mapMouseOut);
});

// Tooltip setup.
var mapTooltip = d3.select('body')
    .append('div')
    .attr('id', 'mapTooltip')
    .style('opacity', 0)
    .style('visibility', 'hidden');

/******************************************************************************/

// This function is invoked when the mouse enters a shape.
function mapMouseOver(d) {
    // Show the value for that region in the tooltip.
    mapTooltip.style('visibility', 'visible');
    mapTooltip.transition().duration(200).style('opacity', 0.9);
    const currentValue = d3.select(this).attr('value');
    mapTooltip.html(currentValue + ' €');
    // Show the region name in the title.
    if (!centered) d3.select('#mapTitle').text(d.properties.NAME);
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
    // Transform the shapes.
    container.selectAll('path')
        .classed('active', centered && function(d) {return d === centered;});
    container.transition()
        .duration(750)
        .attr('transform', 'translate(' + mapWidth / 2 + ','
        + mapHeight / 2 + ')scale(' + k + ')translate(' + -x + ',' + -y + ')')
        .style('stroke-width', 1.5 / k + 'px');
    // Remove the previous graph.
    removeGraph();
    // Prepare the new graph for this specific region.
    var rid = null;
    var pid = d3.select('.listEntry[selected="true"]').attr('pid');
    if (centered === d) {
        // Set the title of the map.
        d3.select('#mapTitle').text(d.properties.NAME);
        rid = d.properties.ID;
    }
    // Build the new graph.
    buildGraph(rid, pid, stackable, base);
}

// This function fills the map with colors according to the current property
// and the current year.
function fillMap(pid, year) {
    // Build the file name and load the file.
    var filename = 'data/by_year/' + year + '.csv';
    var values = [];
    // Read the values from the CSV file.
    d3.csv(filename, function (data) {
        // Fill the array of values.
        for (var i = 0; i < regions.length; i++) {
            values.push(data[pid][regions[i]]);
        }
        // Color each region according to its value.
        var propertyColorRange = ['white', palette[pid]];
        var color = d3.scaleLinear()
            .domain(ranges[pid])
            .range(propertyColorRange);
        for (var i = 0; i < values.length; i++) {
            var c = color(values[i]);
            d3.select('#region_' + i)
                .attr('fill', c)
                .attr('value', values[i]);
        }
        // Build the color legend.
        var legendScale = d3.scaleLinear()
            .domain([0, ranges[pid][1]])
            .range(propertyColorRange)
            .nice();
        var legendLinear = d3.legendColor()
            .title(descriptions[pid] + ' (€)')
            .shapeWidth(40)
            .cells(5)
            .orient('horizontal')
            .scale(legendScale)
            .labelFormat(d3.format('.0f'));
        d3.select(".legendLinear").call(legendLinear);
        d3.selectAll(".cell text").attr('font-size', '12px');
    });
}