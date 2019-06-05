/*
    File:   main.js
    Author: Matteo Loporchio
*/

// Minimum and maximum year.
var yearMin = 1997, yearMax = 2017;
// Range of years.
var years = (new Array(yearMax - yearMin + 1))
    .fill(undefined).map((_, i) => i + yearMin);
// Default title for the map.
var defaultMapName = 'Italia';
// Default path for the graph CSV file.
var defaultGraphPath = 'data/ITALIA.csv';
// Default path for the GeoJSON file.
var defaultJSONPath = 'data/ITALIA.json';
// Here we will store references to the map and graph.
var map = null;
var graph = null;

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

// Set of macroregions and their region IDs.
const macro = {
    'Centro' : [6, 9, 15, 17],
    'Isole' : [13, 14],
    'Nord-Est' : [4, 5, 16, 19],
    'Nord-Ovest' : [7, 8, 11, 18],
    'Sud' : [0, 1, 2, 3, 10, 12],  
};

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
    "#ff5500",
    "#106e38",
    "#bf180a",
    "#45aeff",
    "#6f00bf",
    "#91275c",
    "#ff006f",
    "#ffc012"
];

// This function returns the path of the CSV file for the region with the
// specified ID. If the ID is null, the default file path is returned.
function getRegionFilename(id, mode) {
    var filename = defaultGraphPath;
    if (id != null) {
        var prefix = ((mode) ? 'by_region_macro/' : 'by_region/');
        var keys = Object.keys(macro);
        var name = ((mode) ? keys[id] : regions[id]);
        filename = 'data/' + prefix + name + '.csv';
    }
    return filename;
}


// Scans each CSV file and determines min and max value.
function computeExtent() {
    var result = [];
    for (var i = 0; i < properties.length; i++) {
        result.push([Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]);
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
                if (ext[0] <= result[i][0]) result[i][0] = ext[0];
                if (ext[1] >= result[i][1]) result[i][1] = ext[1];
            }
        });
    }
    return result;
}

// This function returns the next multiple of ten starting from n.
function nextMultipleOfTen(n) {
    if (n % 10 != 0) n = n + (10 - n % 10);
    return n;
}

// This function generates a range of n colors from 'white' to 'color'.
function generateColorRange(n, color) {
    var clr = d3.scaleLinear()
        .range(['white', color])
        .domain([0, n-1]);
    var result = d3.range(n).map(function(d) {
        return clr(d)
    });
    return result;
}

// Returns the ID of the macroregion this region is included in.
function getMacroID(rid) {
    var keys = Object.keys(macro);
    for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        if (macro[k].includes(rid)) return i;
    }
    return null;
}

////////////////////////////////////////////////////////////////////////////////

// This small but very helpful function has been initially written by Brendan Sudol 
// https://brendansudol.com/writing/responsive-d3

function responsivefy(svg) {
    // get container + svg aspect ratio
    var container = d3.select(svg.node().parentNode),
        width = parseInt(svg.style("width")),
        height = parseInt(svg.style("height")),
        aspect = width / height;
  
    // add viewBox and preserveAspectRatio properties,
    // and call resize so that svg resizes on inital page load
    svg.attr("viewBox", "0 0 " + width + " " + height)
        .attr("preserveAspectRatio", "xMinYMid")
        .call(resize);
  
    // to register multiple listeners for same event type,
    // you need to add namespace, i.e., 'click.foo'
    // necessary if you call invoke this function for multiple svgs
    // api docs: https://github.com/mbostock/d3/wiki/Selections#on
    d3.select(window).on("resize." + container.attr("id"), resize);
  
    // get width of container and resize svg to fit it
    function resize() {
        var targetWidth = parseInt(container.style("width"));
        svg.attr("width", targetWidth);
        svg.attr("height", Math.round(targetWidth / aspect));
    }
  }

////////////////////////////////////////////////////////////////////////////////

// Custom implementation of getTransformToElement() to overcome issues
// with Chromium-like browsers.
// Many thanks to: https://www.jointjs.com/blog/announcement-gettransformtoelement-polyfill
function getTransformationMatrix(from, to) {
    return to.getScreenCTM().inverse().multiply(from.getScreenCTM());
}

////////////////////////////////////////////////////////////////////////////////

// Initialize the ranges for all the properties.
var ranges = computeExtent();
