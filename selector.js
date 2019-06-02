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

selector.append('div')
    .style('text-align', 'center')
    .style('color', '#666666')
    .html('Per ciascuna voce sono mostrati i valori medi mensili.');

var list = selector.append('div')
    .attr('class', 'selectorArea')
    .attr('id', 'propertyList');

// Add properties from top to bottom.
for (var i = properties.length - 1; i >= 0; i--) {
    var entry = list.append('div')
        .attr('class', 'listEntry')
        .attr('id', 'entry_' + i)
        .attr('pid', i) // property id of this entry
        .attr('selected', (i == expenses)) // Expenses are selected by default
        .on('click', function () {
            const current = d3.select(this);
            const previous = d3.select('.listEntry[selected="true"]');
            const year = d3.select('#sliderInput').node().value;
            const pid = current.attr('pid');
            // Deselect the previous entry and select this one.
            previous.attr('selected', false);
            current.attr('selected', true);
            // Paint the map.
            map.fill(pid, year);
            // Set the title of the graph.
            graph.setTitle(descriptions[pid]);
            // Check what we have to do with the graph.
            if (graph.focused) {
                // If in focused mode build the graph for that property.
                var rid = map.getRegion();
                graph.focus(rid, pid, year);
            }
            else graph.setCurrentProperty(pid);
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

// Color the map for the first time.
const pid = d3.select('.listEntry[selected="true"]').attr('pid');
const year = d3.select('#sliderInput').node().value;
map.fill(pid, year);