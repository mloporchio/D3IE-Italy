/*
 *  File:   viz.js
 *  Author: Matteo Loporchio
 * 
 *  This file contains the code for the D3 GeoJson viewer.
 */

var filename = "it_geo.json";

// Compute width and height for the viewer.
var ldiv = d3.select("#left").node();
var width = ldiv.getBoundingClientRect().width, height = 600;

// Create and initialize the SVG area.
var svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

var projection = d3.geoEquirectangular();
var geoGenerator = d3.geoPath().projection(projection);

d3.json(filename, function(error, countries) {
    if (error) console.log(error);
    console.log("geojson", countries);
    projection.fitExtent([[0, 0], [width, height]], countries);
    svg.selectAll("path")
        .data(countries.features)
        .enter()
        .append("path")
        .attr("d", geoGenerator)
        .on("mousedown", onMouseDown)
        .on("mouseover", onMouseOver)
        .on("mouseout", onMouseOut);
});

var tdiv = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

// This function is invoked when clicking on a region.
function onMouseDown(d) {
    //console.log(d.properties.NAME_1);
    d3.select("h2").text(d.properties.NAME_1);
}

function onMouseOver(d) {
    tdiv.transition()		
        .duration(200)		
        .style("opacity", .9);		
    tdiv.html(d.properties.NAME_1)	
        .style("left", (d3.event.pageX) + "px")		
        .style("top", (d3.event.pageY - 20) + "px");	
}

function onMouseOut(d) {
    tdiv.transition().duration(500).style("opacity", 0);	
}




