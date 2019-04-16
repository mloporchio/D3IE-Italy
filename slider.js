/*
  File:   slider.js
  Author: Matteo Loporchio
*/

// Minimum and maximum year for the timeline.
var year_min = 1997, year_max = 2017;

// Initialize the range slider.
var c = d3.select("#slider_input")
  .attr("min", year_min)
  .attr("max", year_max)
  .on("input", function () {
    d3.select("#slider_label").html(this.value);
  });

// Initialize the label.
d3.select("#slider_label").html(year_min);
