/*
  File:   graph.js
  Author: Matteo Loporchio

  Reference: https://www.d3-graph-gallery.com/graph/streamgraph_basic.html
*/

var parent = d3.select("#right");

// set the dimensions and margins of the graph
var full_width = 460, full_height = 400;
var margin = {top: 20, right: 30, bottom: 30, left: 60},
width = full_width - margin.left - margin.right,
height = full_height - margin.top - margin.bottom;
// append the svg object to the body of the page
var svg = parent.append("svg")
  .attr("width", full_width) //width + margin.left + margin.right)
  .attr("height", full_height) //height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
// create a tooltip
var Tooltip = svg
.append("text")
.attr("x", 0)
.attr("y", 0)
.style("opacity", 0)
.style("font-size", 17)

d3.csv(filename, function (data) {
  // List of groups = header of the csv files
  var keys = data.columns.slice(1);
  //console.log(keys);
  // Add X axis
  var x = d3.scaleLinear()
    .domain(d3.extent(data, function(d) {return d.Year;}))
    .range([ 0, width ]);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(10));
  // Add Y axis
  var y = d3.scaleLinear().domain([-30000, 30000]).range([height, 0]);
  svg.append("g").call(d3.axisLeft(y).ticks(5));

  // color palette
  var color = d3.scaleOrdinal()
    .domain(keys)
    .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf'])
  //
  //stack the data?
  var stackedData = d3.stack()
    .offset(d3.stackOffsetSilhouette)
    .keys(keys)
    (data)
  
  svg.selectAll("mylayers")
    .data(stackedData)
    .enter()
    .append("path")
      .style("fill", function(d) { return color(d.key); })
      .attr("d", d3.area()
        .x(function(d, i) { return x(d.data.Year); })
        .y0(function(d) { return y(d[0]); })
        .y1(function(d) { return y(d[1]); })
    )
});
/*

// Parse the Data
d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/5_OneCatSevNumOrdered_wide.csv", function(data) {

  // List of groups = header of the csv files
  var keys = data.columns.slice(1)

  // Add X axis
  var x = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { return d.year; }))
    .range([ 0, width ]);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(5));

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([-100000, 100000])
    .range([ height, 0 ]);
  svg.append("g")
    .call(d3.axisLeft(y));

  // color palette
  var color = d3.scaleOrdinal()
    .domain(keys)
    .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf'])

  //stack the data?
  var stackedData = d3.stack()
    .offset(d3.stackOffsetSilhouette)
    .keys(keys)
    (data)

  // Show the areas
  svg
    .selectAll("mylayers")
    .data(stackedData)
    .enter()
    .append("path")
      .style("fill", function(d) { return color(d.key); })
      .attr("d", d3.area()
        .x(function(d, i) { return x(d.data.year); })
        .y0(function(d) { return y(d[0]); })
        .y1(function(d) { return y(d[1]); })
    )

})
*/