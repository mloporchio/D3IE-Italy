/*
 *  File:   viz.js
 *  Author: Matteo Loporchio
 * 
 *  This file contains the code for the D3 GeoJson viewer.
 */

var filename = "it_geo.json";
var width = 500, height = 600;

var projection = d3.geoEquirectangular();
var geoGenerator = d3.geoPath().projection(projection);
var svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

d3.json(filename, function(error, countries) {
    if (error) console.log(error);
    console.log("geojson", countries);
    projection.fitExtent([[0, 0], [width, height]], countries);
    svg.selectAll("path")
        .data(countries.features)
        .enter()
        .append("path")
        .attr("d", geoGenerator)
        .on("mousedown", onMouseDown);
});

// This function is invoked when clicking on a region.
function onMouseDown(d) {
    console.log(d.properties.NAME_1);
    d3.select("h2").text(d.properties.NAME_1)
}




