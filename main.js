/*
    File:   main.js
    Author: Matteo Loporchio
*/

// Minimum and maximum year.
const yearMin = 1997, yearMax = 2017;
// Default path for the graph CSV file.
const defaultGraphPath = 'data/ITALIA.csv';
// Default path for the GeoJSON file.
const defaultJSONPath = 'data/it_geo.json';

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
    ['Spesa_1', 'Alimenti e bevande'],
    ['Spesa_2', 'Alcol e tabacchi'],
    ['Spesa_3', 'Abbigliamento e calzature'],
    ['Spesa_4', 'Abitazione, acqua, elettricità, gas'],
    ['Spesa_5', 'Mobili, articoli e servizi per la casa'],
    ['Spesa_6', 'Salute e servizi sanitari'],
    ['Spesa_7', 'Trasporti'],
    ['Spesa_8', 'Comunicazioni'],
    ['Spesa_9', 'Ricreazione, spettacoli, cultura'],
    ['Spesa_10', 'Istruzione'],
    ['Spesa_11', 'Servizi ricettivi e ristorazione'],
    ['Spesa_12', 'Altri beni e servizi'],
    ['Spesa_TOT', 'Spesa totale'],//,
    ['Reddito', 'Reddito']
];

const defaultPropertyID = properties.length - 2;

// Set of ranges. Each property has a range computed across the years.
const ranges = computeExtent();

// Colors for each property.
const palette = [
    "#9ad3a9",
    "#1fca00",
    "#d2c100",
    "#f5b3d6",
    '#636363',
    "#610075",
    "#f1bc84",
    "#b5abff",
    "#ff3d3b",
    "#6a46f2",
    "#01417b",
    "#018b68",
    "#2470ff",
    "#ff962c"
]

// Scans each CSV file and determines min and max value.
function computeExtent() {
    var ranges = [];
    for (var i = 0; i < properties.length; i++) {
        ranges.push([Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]);
    }
    // For each year...
    for (var year = yearMin; year <= yearMax; year++) {
        // Load the corresponding filename.
        d3.csv('data/by_year/' + year + '.csv', function (data) {
            for (var i = 0; i < properties.length; i++) {
                var values = [];
                for (var j = 0; j < regions.length; j++) {
                    values.push(+(data[i][regions[j]]));
                }
                var ext = d3.extent(values);
                if (ext[0] <= ranges[i][0]) ranges[i][0] = ext[0];
                if (ext[1] >= ranges[i][1]) ranges[i][1] = ext[1];
            }
        });
    }
    return ranges;
}
