/*
    File:   selector.js
    Author: Matteo Loporchio
*/

const selector = d3.select('#selector');

// Add the title.
var selectorTitle = 'Voci';
selector.append('div')
    .attr('class', 'itemTitle')
    .attr('id', 'selectorTitle')
    .text(selectorTitle);

var list = selector.append('div')
    .attr('class', 'selectorArea')
    .attr('id', 'propertyList');

for (var i = 0; i < properties.length; i++) {
    var entry = list.append('div')
        .attr('class', 'listEntry')
        .attr('id', 'entry_' + i)
        .attr('pid', i) // property id of this entry
        .attr('selected', (i == expenses))
        .on('click', function () {
            const current = d3.select(this);
            const previous = d3.select('.listEntry[selected="true"]');
            const graph = d3.select('#graphArea');
            const year = d3.select('#sliderInput').node().value;
            const pid = current.attr('pid');
            // Deselect the previous entry and select this one.
            previous.attr('selected', false);
            current.attr('selected', true);
            // Set the title of the graph.
            graph.select('#graphTooltip').text(descriptions[pid]);
            // Paint the map.
            fillMap(pid, year);
            // Highlight the shapes.
            selectShape(graph, pid);
        });
    entry.append('label')
        .attr('class', 'listEntryLabel')
        .attr('id', 'entryLabel_' + i)
        .html(descriptions[i]);
    entry.append('div')
        .attr('class', 'listEntryBox')
        .attr('id', 'entryBox_' + i)
        .style('background', palette[i]);
}

/******************************************************************************/
/*
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
            const year = d3.select('#sliderInput').node().value;
            // Set the title of the graph.
            d3.select('#graphTooltip').text(descriptions[propertyID]);
            // Paint the map.
            fillMap(propertyID, year);
            // Highlight the shapes.
            highlight(propertyID);
            // Draw the income line if necessary.
            setIncome((propertyID == incomes || propertyID == expenses));
        });
    // Text of the button.
    form.append('label')
        .attr('for', i)
        .html(descriptions[i]);
    form.append('div')
        .attr('class', 'coloredBox')
        .style('background', palette[i]);
    form.append('br');
    // The total expenses property is the default one.
    if (i == expenses) {
        input.property('checked', true);
        // Set also the title of the graph.
        d3.select('#graphTooltip').text(descriptions[i]);
    }
}
*/

