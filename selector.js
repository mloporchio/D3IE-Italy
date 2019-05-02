/*
    File:   selector.js
    Author: Matteo Loporchio
*/

const selector = d3.select('#selector');

// Add the title.
const selectorTitle = 'Categorie';
selector.append('div')
    .attr('class', 'label')
    .attr('id', 'selectorTitle')
    .text(selectorTitle);

// Add the selection form.
const form = selector.append('form');
// Append one radio button for each property.
for (var i = 0; i < properties.length; i++) {
    var input = form.append('input')
        .attr('type', 'radio')
        .attr('name', 'property')
        .attr('value', i)
        .on('change', function () {
            // Get the ID of the current button.
            const id = d3.select(this).attr('value');
            // Get the currently selected year.
            const year = d3.select('#sliderInput').node().value;
            // Paint the map.
            //console.log('filling map with id=' + id + ' and year=' + year);
            fillMap(id, year);
        });
    form.append('label')
        .attr('for', i)
        .html(properties[i][1]); // Set the label.
    // Add also a line break.
    form.append('br');
    // The last element is the default one.
    if (i === properties.length - 1) input.attr('checked', 'checked');
}
