/*
  File:   slider.js
  Author: Matteo Loporchio
*/

// Minimum and maximum year for the timeline.
var year_min = 1985;
var year_max = 2013;
var year_init = 1999;

// Initialize the control.
var c = document.getElementById("slider_input");
var l = document.getElementById("slider_label");
c.setAttribute("min", year_min);
c.setAttribute("max", year_max);
c.setAttribute("value", year_init);
// Display the default value.
l.innerHTML = c.value;

// Update the current slider value (each time you drag the slider handle)
c.oninput = function() {
  l.innerHTML = this.value;
}

// 
c.onchange = function() {
  return;
}