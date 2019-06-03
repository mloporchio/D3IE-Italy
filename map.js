/*
    File:   map.js
    Author: Matteo Loporchio
*/

var mapContainer = d3.select('#map');
var mapWidth = mapContainer.node().getBoundingClientRect().width, 
    mapHeight = 380,
    legendWidth = mapWidth,
    legendHeight = 100;

class Map {

    // This is the class constructor.
    constructor(container) {
        this.parent = container;
        this.macroMode = false;
        this.year = yearMin;
        this.name = defaultMapName;
        this.currentRegion = null;
        this.currentMacro = -1;
        this.projection = d3.geoNaturalEarth1();
        this.path = d3.geoPath().projection(this.projection);
        // Initialize the title.
        this.title = this.parent.append('div')
            .attr('class', 'itemTitle')
            .attr('id', 'mapTitle');
        this.setTitle(null);
        // Initialize the mode selector.
        this.selector = this.initSelector();
        // Tooltip setup.
        this.tooltip = d3.select('body').append('div') 
            .attr('id', 'mapTooltip')
            .style('opacity', 0)
            .style('visibility', 'hidden');
        // Initialize the SVG area.
        this.area = this.parent.append('svg')
            .attr('id', 'mapArea')
            .attr('width', mapWidth)
            .attr('height', mapHeight)
            .call(responsivefy);
        this.background = this.area.append('rect')
            .attr('class', 'background')
            .attr('width', mapWidth)
            .attr('height', mapHeight);
        // This group will contain region shapes.
        this.regions = this.area.append('g').attr('id', 'regionGroup');
        // Initialize the map legend.
        this.legend = this.parent.append('div')
            .attr('id', 'mapLegend')
            .append('svg')
            .attr('width', legendWidth)
            .attr('height', legendHeight)
            .call(responsivefy)
            .append('g')
            .attr('id', 'legendGroup')
            .attr('transform', 'translate(30,30)');
        // Build the map by reading the JSON data.
        this.readJSON();
    }

    // This function initializes the map mode selector used to switch
    // between regions and macroregions.
    initSelector() {
        var m = this;
        var selector = this.parent.append('div').attr('id', 'mapSelector');
        var selectorClick = function () {
            var previous = d3.select('.mapSelectorEntry[selected="true"]');
            var current = d3.select(this);
            var value = current.attr('value');
            previous.attr('selected', false);
            current.attr('selected', true);
            m.macroMode = ((value == 0) ? false : true);
            // Force a refill of the map.
            var pid = d3.select('.listEntry[selected="true"]').attr('pid');
            var year = d3.select('#sliderInput').node().value;
            m.fill(pid, year);
        }
        selector.append('div')
            .attr('id', 'mapSelectorRegion')
            .attr('class', 'mapSelectorEntry')
            .attr('value', 0)
            .attr('selected', true)
            .text('Regione')
            .style('float', 'left')
            .on('click', selectorClick);
        selector.append('div')
            .attr('id', 'mapSelectorMacro')
            .attr('class', 'mapSelectorEntry')
            .attr('value', 1)
            .attr('selected', false)
            .text('Macroregione')
            .style('float', 'left')
            .on('click', selectorClick);
        return selector;
    }

    // This function parses the JSON file and loads data into the map.
    readJSON() {
        var m = this;
        // Read data from the JSON file.
        d3.json(defaultJSONPath, function (error, countries) {
            if (error) console.log(error);
            m.projection.fitExtent([[0, 0], [mapWidth, mapHeight]], countries);
            //console.log(countries.features);
            var keys = Object.keys(macro);
            var values = Object.values(macro);
            var root = m.regions;
            // We create a <g> element for each macroregion...
            for (var i = 0; i < keys.length; i++) {
                var regions = values[i];
                var group = root.append('g')
                    .attr('id', 'macro_' + i)
                    .attr('class', 'mapMacro');
                var selected = regions.map(i => countries.features[i]);
                // We append all the regions to the proper <g> element.
                group.selectAll('path')
                    .data(selected)
                    .enter()
                    .append('path')
                    .attr('class', 'mapRegion')
                    .attr('id', function (d) {return 'region_' + d.properties.ID;})
                    .attr('name', function (d) {return d.properties.NAME;})
                    .attr('macro', i)
                    .attr('value', 0)
                    .attr('d', m.path)
                    .on('click', m.click.bind(m))
                    .on('mouseover', m.mouseOver.bind(m))
                    .on('mousemove', m.mouseMove.bind(m))
                    .on('mouseout', m.mouseOut.bind(m));
            }
        });
    }

    // Returns the ID of the currently selected (macro)region. If no region
    // is selected, a null value is returned.
    getRegion() {
        var result;
        if (this.macroMode) {
            result = ((this.currentMacro == -1) ? null : this.currentMacro);
        }
        else {
            var region = d3.select('.mapRegion active').node();
            result = ((region == null) ? null : region.attr('id'));
        }
        return result;
    }

    // This method sets the visibility of the map mode selector.
    setSelector(visible) {
        this.selector.style('visibility', ((visible) ? 'visible' : 'hidden'));
    }

    // This method is invoked to change the map title with a new name and year.
    setTitle(name, year) {
        // If invoked with name = null, use the current name without updating.
        // If invoked with year = null, do not update the year.
        if (name != null) this.name = name;
        if (year != null) this.year = year;
        var color = '#666666';
        var separator = '&mdash;';
        var title = this.name + ' <font color="' + color + '">' 
        + separator + ' ' + this.year + '</font>';
        this.title.html(title);
    }

    // This function fills the map with colors according to the current property
    // and the current year.
    fill(pid, year) {
        //console.log('fill called with pid = ' + pid + ', year = ' + year);
        var m = this;
        var prefix = ((this.macroMode) ? 'by_year_macro/' : 'by_year/');
        var filename = 'data/' + prefix + year + '.csv';
        var elements = 5; // Number of intervals in the legend.
        // Read the data...
        d3.csv(filename, function (data) {
            // Prepare color scales...
            var r = generateColorRange(elements, palette[pid]);
            var colorScale = d3.scaleQuantize().domain(ranges[pid])
                .range(r).nice();
            // Case 1: we are displaying macroregions.
            if (m.macroMode) {
                var keys = Object.keys(macro);
                for (var i = 0; i < keys.length; i++) {
                    var v = data[pid][keys[i]];
                    var c = colorScale(v);
                    var n = macro[keys[i]].length;
                    // For each region in this macroregion...
                    for (var j = 0; j < n; j++) {
                        var k = macro[keys[i]][j];
                        d3.select('#region_' + k)
                            .attr('fill', c)
                            .attr('value', v);
                    }
                }
            }
            // Else, if we are displaying single regions...
            else {
                for (var i = 0; i < regions.length; i++) {
                    var v = data[pid][regions[i]];
                    var c = colorScale(v);
                    d3.select('#region_' + i)
                        .attr('fill', c)
                        .attr('value', v);
                }
            }
            // Add the legend...
            var legend = d3.legendColor()
                .title(descriptions[pid] + ' (€)')
                .orient('horizontal')
                .cells(5)
                .labelFormat(d3.format('.0f'))
                .labelDelimiter('-')
                .labelAlign('middle')
                .shapeWidth(70)
                .shapePadding(5)
                .scale(colorScale)
            d3.select('#legendGroup').call(legend);
        });
    }

    // This function is invoked when the mouse enters a shape.
    mouseOver(d) {
        // Show the value for that region in the tooltip.
        this.tooltip.style('visibility', 'visible');
        this.tooltip.transition().duration(200).style('opacity', 0.9);
        var v = this.area.select('#region_' + d.properties.ID).attr('value');
        this.tooltip.html(v + ' €');
        // Case 1: we are displaying macroregions.
        if (this.macroMode) {
            var mid = getMacroID(d.properties.ID);
            var name = (Object.keys(macro))[mid];
            if (this.currentMacro == -1) this.setTitle(name, null);
            d3.selectAll('.mapRegion[macro="' + mid + '"]')
                .style('fill', 'crimson');
        }
        // Case 2: we are displaying single regions.
        else {
            if (!this.currentRegion) this.setTitle(d.properties.NAME, null);
            d3.select('#region_' + d.properties.ID).style('fill', 'crimson');
        }
    }

    // This function is invoked when the mouse moves on a shape.
    mouseMove(d) {
        var top = event.pageY - 10, left = event.pageX + 10;
        this.tooltip.style('top', top + 'px').style('left', left + 'px');
        // Case 1: we are displaying macroregions.
        if (this.macroMode) {
            var mid = getMacroID(d.properties.ID);
            d3.selectAll('.mapRegion[macro="' + mid + '"]')
                .style('fill', 'crimson');
        }
        // Case 2: we are displaying single regions.
        else {
            d3.select('#region_' + d.properties.ID).style('fill', 'crimson');
        }
    }

    // This function is invoked when the mouse leaves a shape.
    mouseOut(d) {
        this.tooltip.style('visibility', 'hidden');
        // Case 1: we are displaying macroregions.
        if (this.macroMode) {
            var mid = getMacroID(d.properties.ID);
            if (this.currentMacro == -1) this.setTitle(defaultMapName, null);
            d3.selectAll('.mapRegion[macro="' + mid + '"]')
                .style('fill', function (d) {return d.color;});
        }
        // Case 2: we are displaying single regions.
        else {
            if (!this.currentRegion) this.setTitle(defaultMapName, null);
            d3.select('#region_' + d.properties.ID)
                .style('fill', function (d) {return d.color;});
        }
    }

    // This function is invoked when when the mouse is clicked on a shape.
    click(d) {
        var m = this;
        var rid = null;
        var pid = d3.select('.listEntry[selected="true"]').attr('pid');
        var year = d3.select('#sliderInput').node().value;
        var x, y, k;
        // Case 1: we are displaying macroregions.
        if (this.macroMode) {
            var mid = getMacroID(d.properties.ID);
            var group = d3.select('#macro_' + mid);
            var bb = group.node().getBBox();
            if (this.currentMacro != mid) {
                x = bb.x + bb.width / 2;
                y = bb.y + bb.height / 2;
                k = 2;
                this.currentMacro = mid;
                this.setSelector(false);
            } else {
                x = mapWidth / 2;
                y = mapHeight / 2;
                k = 1;
                this.currentMacro = -1;
                this.setSelector(true);
            }
            // Set the active regions.
            this.regions.selectAll('path')
                .classed('active', function (d) {
                    return ((getMacroID(d.properties.ID) == m.currentMacro));
                });
            // Transform the shapes.
            this.regions.transition().duration(750)
                .attr('transform', 'translate(' + mapWidth / 2 + ','
                + mapHeight / 2 + ')scale(' + k + 
                ')translate(' + -x + ',' + -y + ')')
                .style('stroke-width', 1.5 / k + 'px');
            // Set the title.
            if (this.currentMacro == mid) {
                this.setTitle(((Object.keys(macro))[mid]), null);
                rid = mid;
            }
        }
        // Case 2: we are displaying single regions.
        else {
            if (d && this.currentRegion !== d) {
                var centroid = this.path.centroid(d);
                x = centroid[0];
                y = centroid[1];
                k = 4;
                this.currentRegion = d;
                this.setSelector(false);
            } else {
                x = mapWidth / 2;
                y = mapHeight / 2;
                k = 1;
                this.currentRegion = null;
                this.setSelector(true);
            }
            // Transform the shapes.
            this.regions.selectAll('path')
                .classed('active', 
                this.currentRegion && function(d) {return d === m.currentRegion;});
            // Transform the shapes.
            this.regions.transition().duration(750)
                .attr('transform', 'translate(' + mapWidth / 2 + ','
                + mapHeight / 2 + ')scale(' + k + 
                ')translate(' + -x + ',' + -y + ')')
                .style('stroke-width', 1.5 / k + 'px');
            // Set the title of the map.
            if (this.currentRegion === d) {
                this.setTitle(d.properties.NAME, null);
                rid = d.properties.ID;
            }
        }   
        // Update the graph.
        if (graph.focused) graph.focus(rid, pid, year);
        else graph.showAll(rid, pid, year);        
    }

}

// Create the map for the first time.
map = new Map(mapContainer);
// Fill it using default pid and year.
map.fill(expenses, yearMin);