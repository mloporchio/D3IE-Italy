/*
    File:   general.js
    Author: Matteo Loporchio
*/

// Minimum and maximum year.
const yearMin = 1997, yearMax = 2017;

// Set of regions.
const regions = [
    'ABRUZZO',
    'PUGLIA',
    'BASILICATA',
    'CALABRIA',
    'CAMPANIA',
    'EMILIA_ROMAGNA',
    'FRIULI',
    'LAZIO',
    'LIGURIA',
    'LOMBARDIA',
    'MARCHE',
    'MOLISE',
    'PIEMONTE',
    'SARDEGNA',
    'SICILIA',
    'TOSCANA',
    'TRENTINO',
    'UMBRIA',
    'VALLE_AOSTA',
    'VENETO'
];

// Set of properties.
const properties = [
    'Spesa_1',
    'Spesa_2',
    'Spesa_3',
    'Spesa_4',
    'Spesa_5',
    'Spesa_6',
    'Spesa_7',
    'Spesa_8',
    'Spesa_9',
    'Spesa_10',
    'Spesa_11',
    'Spesa_12',
    'Spesa_TOT'
];

// This function fills the map with colors.
function fillMap(propertyID, year) {
    // Build the file name and load the file.
    var filename = 'data/by_year/'+ year + '.csv';
    var values = [];
    // Read the values from the CSV file.
    d3.csv(filename, function (data) {
      for (var i = 0; i < regions.length; i++) 
        values.push(data[propertyID][regions[i]]);
      const dom = d3.extent(values);
      const color = d3.scaleLinear().domain(dom).range(['pink', 'red']);
      // Color the regions according to their value.
      for (var i = 0; i < regions.length; i++) {
        d3.select('#reg' + (i + 1))
          .attr('fill', function(d) {return color(values[i]);})
          // Store also the current value into the node.
          .attr('value', values[i]);
      }
    });
}