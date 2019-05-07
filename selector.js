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
    var input = form
        .append('input')
        .attr('type', 'radio')
        .attr('name', 'property')
        .attr('value', i)
        // What happens when we click on the button.
        .on('change', function () {
            // Get the ID of the current button.
            const id = d3.select(this).attr('value');
            // Get the currently selected year.
            const year = d3.select('#sliderInput').node().value;
            // Set the title of the graph.
            d3.select('#graphTooltip').text(properties[id][1]);
            // Paint the map.
            fillMap(id, year);
            // Highlight the shapes.
            if (id == defaultPropertyID) highlightAllShapes();
            else highlightShape(id);
        });
    form.append('div')
        .attr('class', 'coloredBox')
        .style('background', palette[i]);
    form.append('label')
        .attr('for', i)
        .html(properties[i][1]); // Set the label.
    // Add also a line break.
    form.append('br');
    // Set the default property.
    if (i == defaultPropertyID) {
        input.attr('checked', true);
        // Set also the title of the graph.
        d3.select('#graphTooltip').text(properties[i][1]);
    }
}
