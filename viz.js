/*
 *  File:   viz.js
 *  Author: Matteo Loporchio
 * 
 *  This file contains the code for the D3 GeoJson viewer.
 */

var width = 960, height = 500;

var projection = d3.geoEquirectangular();
var geoGenerator = d3.geoPath().projection(projection);
var svg = d3.select("body").append("svg").attr("width", width).attr("height", height);
            
var url = "ITA_adm1_GEO.json";
d3.json(url, function(error, countries) {
    if (error) console.log(error);
    console.log("geojson", countries);
    projection.fitExtent([[0, 0], [width, height]], countries);
    svg.selectAll("path").data(countries.features).enter().append("path").attr("d", geoGenerator);
});
