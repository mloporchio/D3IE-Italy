/*
  File:   graph.js
  Author: Matteo Loporchio

  Reference: https://www.d3-graph-gallery.com/graph/streamgraph_basic.html
*/

// Path of the CSV file that contains our data.
var data_url = "data/Quadro_Italia.csv";
// Select the target div.
const right = d3.select("#right");

// Set the dimensions of the graph.
var graph_width = 800, graph_height = 500;
var margin = {top: 50, right: 50, bottom: 0, left: 50},
    width = graph_width - margin.left - margin.right,
    height = graph_height - margin.top - margin.bottom;

// Append the SVG object to the target div element.
var svg = right.append("svg")
  .attr("width", graph_width)
  .attr("height", graph_height)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Append the tooltip to the SVG objct.
var graph_tooltip = svg.append("text")
  .attr("class", "graph_tooltip")
  .attr("x", 0)
  .attr("y", 0)
  .style("opacity", 0);

// Parse the data.
d3.csv(data_url, function (data) {
  // Obtain the names of the columns.
  var column_names = data.columns.slice(1);
  var color = d3.scaleOrdinal().domain(column_names).range(d3.schemeSet3);
  // Setup the X axis.
  var years = [];
  data.forEach(function (d) {years.push(d.Anno);});
  var x_dom = d3.extent(data, function (d) {return d.Anno;});
  var x_scale = d3.scaleLinear().domain(x_dom).range([0, width]);
  var x_axis = d3.axisBottom(x_scale)
    .tickSize(-height * 0.7)
    // Remove commas as separators from ticks.
    .tickFormat(d3.format(".0f"))
    .tickValues(years);
  svg.append("g")
      .attr("transform", "translate(0," + height*0.8 + ")")
      .call(x_axis)
      .select(".domain").remove();
  svg.selectAll(".tick line").attr("stroke", "#b8b8b8")
  svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height-30)
    .text("Time (year)");
  // Setup the Y axis.
  var y_dom = [-7000, 7000];
  var y_scale = d3.scaleLinear().domain(y_dom).range([height, 0]);
  //stack the data?
  var stackedData = d3.stack()
    .offset(d3.stackOffsetSilhouette)
    .keys(column_names)
    (data)
  // Area generator
  var area = d3.area()
    .x(function (d) {return x_scale(d.data.Anno);})
    .y0(function (d) {return y_scale(d[0]);})
    .y1(function (d) {return y_scale(d[1]);});
  //
  svg.selectAll("mylayers")
    .data(stackedData)
    .enter()
    .append("path")
    .attr("class", "myArea")
    .style("fill", function (d) {return color(d.key);})
    .attr("d", area)
    .on("mouseover", function (d) {
      graph_tooltip.style("opacity", 1);
      d3.selectAll(".myArea").style("opacity", .2);
      d3.select(this).style("stroke", "black").style("opacity", 1);
    })
    .on("mousemove", function (d, i) {
      var grp = column_names[i];
      graph_tooltip.text(grp);
    })
    .on("mouseleave", function (d) {
      graph_tooltip.style("opacity", 0);
      d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none");
    });
});
