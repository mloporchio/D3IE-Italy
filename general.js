/*
    File:   general.js
    Author: Matteo Loporchio
*/

// Minimum and maximum year.
const yearMin = 1997, yearMax = 2017;

// Set of regions.
const regions = [
    'ABRUZZO',
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
    'PUGLIA',
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
    ['Spesa_1', 'Alimenti e bevande'],
    ['Spesa_2', 'Alcol e tabacchi'],
    ['Spesa_3', 'Abbigliamento e calzature'],
    ['Spesa_4', 'Abitazione, acqua, elettricità, gas'],// e altri combustibili'],
    ['Spesa_5', 'Mobili, articoli e servizi per la casa'],
    ['Spesa_6', 'Salute e servizi sanitari'],
    ['Spesa_7', 'Trasporti'],
    ['Spesa_8', 'Comunicazioni'],
    ['Spesa_9', 'Ricreazione, spettacoli, cultura'],
    ['Spesa_10', 'Istruzione'],
    ['Spesa_11', 'Servizi ricettivi e ristorazione'],
    ['Spesa_12', 'Altri beni e servizi'],
    ['Spesa_TOT', 'Spesa totale']
];



const palette = [
    '#bb5ebd',
    '#6cb543',
    '#6c6ad8',
    '#beac45',
    '#8b74b8',
    '#57ae76',
    '#d24586',
    '#3dbbb8',
    '#d04b3e',
    '#5c98d5',
    '#c37c40',
    '#677731',
    '#c0687b'
];

// This function fills the map with colors.
function fillMap(propertyID, year) {
    // Build the file name and load the file.
    var filename = 'data/by_year/'+ year + '.csv';
    var values = [];
    // Read the values from the CSV file.
    d3.csv(filename, function (data) {
        // Fill the values array.
        for (var i = 0; i < regions.length; i++) {
            values.push(data[propertyID][regions[i]]);
        }
        var d = d3.extent(values, function (x) {return +x;});
        var r = ['white', palette[propertyID]];
        var color = d3.scaleLinear().domain(d).range(r);
        // Color the regions according to their value.
        for (var i = 0; i < values.length; i++) {
            var c = color(values[i]);
            d3.select('#reg' + (i + 1))
                .attr('fill', c)
                .attr('value', values[i]);
        }
    });
}