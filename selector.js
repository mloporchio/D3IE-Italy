/*
    File:   selector.js
    Author: Matteo Loporchio
*/

const selector = d3.select('#selector');

// Add the title.
const selectorTitle = 'Voci';
selector.append('div')
    .attr('class', 'itemTitle')
    .attr('id', 'selectorTitle')
    .text(selectorTitle);

// Add the selection form.
const form = selector.append('form');
// For each property...
for (var i = 0; i < properties.length; i++) {
    // Add a radio button with its description.
    var input = form.append('input')
        .attr('type', 'radio')
        .attr('name', 'property')
        .attr('value', i)
        // Define what happens when we click on the button.
        .on('click', function () {
            const propertyID = this.value;
            // Get the currently selected year.
            const year = d3.select('#sliderInput').node().value;
            // Set the title of the graph.
            d3.select('#graphTooltip').text(properties[propertyID][1]);
            // Paint the map.
            fillMap(propertyID, year);
            // Highlight the shapes.
            if (propertyID == defaultPropertyID) highlightAllShapes();
            else highlightShape(propertyID);
        });
    // Text of the button.
    form.append('div')
        .attr('class', 'coloredBox')
        .style('background', palette[i]);
    form.append('label')
        .attr('for', i)
        .html(properties[i][1]);
    form.append('br');
    // Set the default selection in the list.
    if (i == defaultPropertyID) {
        input.property('checked', true);
        // Set also the title of the graph.
        d3.select('#graphTooltip').text(properties[i][1]);
    }
}

