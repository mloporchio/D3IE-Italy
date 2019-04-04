/*
  File:   slider.js
  Author: Matteo Loporchio
*/

// Minimum and maximum year for the timeline.
var year_min = 1985, year_max = 2013, year_init = 1999;
var ctl = document.getElementById("slidectl");
var label = document.getElementById("slidelabel");

// Initialize the control.
// min="1" max="100" value="50" 
ctl.setAttribute("min", year_min);
ctl.setAttribute("max", year_max);
ctl.setAttribute("value", year_init);
label.innerHTML = "Year:" + ctl.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
ctl.oninput = function() {
  label.innerHTML = "Year:" + this.value
}