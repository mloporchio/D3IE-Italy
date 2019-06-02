/*
    File:   button.js
    Author: Matteo Loporchio
*/

// Prepare the modal.
var modal = d3.select("#infoModal");
var content = d3.select('#modalContent');

// Setup the close button in the modal window.
var close = d3.select('#closeButton')
    .on('click', function () {
        modal.style('display', 'none');
    });

// Setup the info button on the main page.
var button = d3.select("#infoButton")
    .on('click', function() {
        modal.style('display', 'block');
    });