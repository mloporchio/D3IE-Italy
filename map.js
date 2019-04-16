/*
    File:   map.js
    Author: Matteo Loporchio
*/

var filename = "it_geo.json";
var width = 600, height = 500;
var default_title = "Italy";
var centered = null;
var parent = d3.select("#left");

// Set the map title.
parent.append("div").attr("class", "label").text(default_title);

// Create and initialize the SVG area.
var svg = parent.append("svg")
    .attr("width", width)
    .attr("height", height);
svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", clicked);
var container = svg.append("g");

// D3 map projections (used to create the map).
var projection = d3.geoNaturalEarth1();
var path = d3.geoPath().projection(projection);

// Load data from file.
d3.json(filename, function(error, countries) {
    if (error) console.log(error);
    projection.fitExtent([[0, 0], [width, height]], countries);
    console.log(countries.features);
    container.selectAll("path")
        .data(countries.features)
        .enter()
        .append("path")
        // Append a region ID to each path.
        .attr("id", function(d) {return "REG_" + d.properties.ID_1;})
        .attr("d", path)
        .on("click", clicked)
        // tooltip-related event handlers
        .on("mouseover", mouseOver)
        .on("mousemove", mouseMove)
        .on("mouseout", mouseOut);
});

// Tooltip setup.
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("visibility", "hidden");

// This function is invoked when the mouse enters a shape.
function mouseOver(d) {
    tooltip.style("visibility", "visible");
    tooltip.transition()
        .duration(200)
        .style("opacity", .9);
    // Show the region name.
    tooltip.html(d.properties.NAME_1);
}

// This function is invoked when the mouse moves on a shape.
function mouseMove(d) {
    tooltip.style("top",
    (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
}

// This function is invoked when the mouse leaves a shape.
function mouseOut(d) {
    tooltip.style("visibility", "hidden");
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
        x = width / 2;
        y = height / 2;
        k = 1; //k_init;
        centered = null;
    }
    // Set the title.
    if (centered) d3.select(".label").text(d.properties.NAME_1);
    else d3.select(".label").text(default_title);
    // Transform the shapes.
    container.selectAll("path")
        .classed("active", centered && function(d) {return d === centered;});
    container.transition()
        .duration(750)
        .attr("transform", "translate(" + width / 2 + "," + height / 2
        + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
        .style("stroke-width", 1.5 / k + "px");
}
