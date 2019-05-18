/*
    File:   main.js
    Author: Matteo Loporchio
*/

// Minimum and maximum year.
const yearMin = 1997, yearMax = 2017;
// Default path for the graph CSV file.
const defaultGraphPath = 'data/ITALIA.csv';
// Default path for the GeoJSON file.
const defaultJSONPath = 'data/ITALIA.json';

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
    'Spesa_TOT',
    'Reddito'
];

// Set of property descriptions.
const descriptions = [
    'Alimenti e bevande',
    'Alcol e tabacchi',
    'Abbigliamento e calzature',
    'Abitazione, acqua, elettricità, gas',
    'Mobili, articoli e servizi per la casa',
    'Salute e servizi sanitari',
    'Trasporti',
    'Comunicazioni',
    'Ricreazione, spettacoli, cultura',
    'Istruzione',
    'Servizi ricettivi e ristorazione',
    'Altri beni e servizi',
    'Spesa totale',
    'Reddito'
];

const stackable = properties.slice(0, properties.length - 2);
const incomes = properties.length - 1;
const expenses = properties.length - 2;

// Colors for each property.
const palette = [
    "#335092",
    "#ff7c8d",
    "#2c70fa",
    "#bbd119",
    "#b971fc",
    "#6ee048",
    "#ff3fa7",
    "#106e38",
    "#bf180a",
    "#45aeff",
    "#877f74",
    "#91275c",
    "#ff006f",
    "#ffc012"
];

// Set of ranges. Each property has a range computed across the years.
const ranges = computeExtent();

/******************************************************************************/

// This function returns the path of the CSV file for the region with the
// specified ID. If the ID is null, the default file path is returned.
function getRegionFilename(rid) {
    var filename = defaultGraphPath;
    if (rid != null) {
        filename = 'data/by_region/'+ regions[rid] + '.csv';
    }
    return filename;
}

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
