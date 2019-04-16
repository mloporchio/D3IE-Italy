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
    // Update the value of the label.
    d3.select("#slider_label").html(this.value);
    // Colorize the map.
    colorize_map();
  });

// Initialize the label.
d3.select("#slider_label").html(year_min);

// Random value generator.
function get_random_int(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function colorize_map() {
  d3.csv("data/color_map_test.csv", function (data) {
    var min = 100, max = 10000;
    var color = d3.scaleLinear().domain([min, max]).range(["pink", "red"]);
    for (var i = 0; i < data.length; i++) {
      var v = get_random_int(min, max);//;data[i].Total;
      d3.select("#REG_" + (i+1)).attr('fill', function(d,i) {return color(v);});
    }
  });
}
