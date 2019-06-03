/*
    File:   graph.js
    Author: Matteo Loporchio

    This file contains several definitions of functions used to
    initialize the graphs in the main web page.
    Reference: https://www.d3-graph-gallery.com/graph/streamgraph_basic.html
*/

var graphContainer = d3.select('#graph');

// Global parameters of the graph.
var graphFullWidth = graphContainer.node().getBoundingClientRect().width;
var graphFullHeight = 500;
var margin = {top: 50, right: 50, bottom: 0, left: 50};
var graphWidth = graphFullWidth - margin.left - margin.right;
var graphHeight = graphFullHeight - margin.top - margin.bottom;
var tickLength = graphHeight * 0.8;
var gap = 10;
var normalTicks = [0, 1000, 2000, 3000, 4000];
var Ylim = normalTicks[normalTicks.length - 1];
var normalTop = 60;
var normalBase = graphHeight * 0.9; //0.8;
var focusedBase = graphHeight * 0.7; //0.5;
var timeout = 750;

////////////////////////////////////////////////////////////////////////////////

// This class represents the graph object.
class Graph {

    // Class constructor.
    constructor(parent) {
        this.parent = parent;
        this.focused = false;
        this.year = null;
        // Initialize the SVG area.
        this.area = parent.append('svg')
            .attr('id', 'graphArea')
            .attr('width', graphFullWidth)
            .attr('height', graphFullHeight)
            .call(responsivefy) // Make the whole area responsive.
            .append('g')
            .attr('id', 'graphPlane')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .call(responsivefy);
        // Initialize the tooltip.
        this.tooltip = this.area.append('text')
            .attr('id', 'graphTooltip')
            .attr('x', 0)
            .attr('y', 0)
            .attr('font-size', 20)
            .style('opacity', 1);
        // Initialize the label.
        /*
        this.label = this.area.append('text')
            .attr('id', 'xAxisLabel')
            .attr('text-anchor', 'end')
            .attr('x', graphWidth)
            .attr('y', graphHeight - 30)
            .text('Anno');
        */
        // Initialize axes.
        this.Xdom = d3.extent(years);
        this.Ydom = [0, Ylim];
        this.Xscale = d3.scaleLinear().domain(this.Xdom).range([0, graphWidth]);
        this.Yscale = d3.scaleLinear().domain(this.Ydom).range([normalBase, normalTop]);
        this.currentYscale = this.Yscale;
        // X axis.
        this.X = d3.axisBottom(this.Xscale)
            .tickSize(-tickLength)
            .tickFormat(d3.format('.0f'))
            .tickValues(years);
        this.Xaxis = this.area.append('g')
            .attr('id', 'xAxis')
            .attr('transform', 'translate(0,' + (normalBase + gap) + ')')
            .call(this.X).select('.domain').remove();
        // Initialize X axis ticks.
        this.area.selectAll('.tick line')
            .attr('id', function (d) {return 'graphLine_' + d;})
            .attr('stroke', '#b8b8b8')
            .attr('stroke-width', 1);
        this.area.selectAll('.tick text')
            .attr('id', function (d) {return 'graphText_' + d;})
            .attr('fill', 'black')
            .filter(function (d) {return (d % 2 == 0);})
            .text('');
        // Y axis.
        this.Y = d3.axisLeft(this.Yscale)
            .tickFormat(d3.format('.0f'))
            .tickValues(normalTicks);
        this.Yaxis = this.area.append('g')
            .attr('id', 'yAxis')
            .attr('transform', 'translate(-' + (gap / 2) + ',0)')
            .call(this.Y);
    }

    // This method adds the income line and area to the graph.
    addIncome(data) {
        var g = this;
        var a = d3.area()
            .x(function (d) {return g.Xscale(d.Anno);})
            .y0(function (d) {return g.Yscale(Ylim);})
            .y1(function (d) {return g.Yscale(d.Reddito);});
        var l = d3.line()
            .x(function (d) {return g.Xscale(d.Anno);})
            .y(function (d) {return g.Yscale(d.Reddito);}); 
        this.area.append('path')
            .data([data])
            .attr('id', 'incomeArea')
            .attr('d', a)
            .style('fill', 'lightgray')
            .style('opacity', .4)
            .style('stroke', 'none')
        this.area.append('path')
            .data([data])
            .attr('id', 'incomeLine')
            .attr('d', l)
            .style('fill', 'none')
            .style('stroke', palette[properties.length - 1])
            .style('stroke-width', 4);
    }

    // This function inserts shapes into the graph.
    // If pid is defined, only the shape of that property is inserted.
    addShapes(data, properties, pid = null) {
        var g = this;
        var columns = ((pid == null) ? properties : [properties[pid]]);
        var nameShape = function (d, i) {return 'shape_' + i;};
        var fillShape = function (d, i) {return palette[i];};
        var stacked = d3.stack().offset(d3.stackOffsetNone)
            .keys(columns)
            (data)
        var area = d3.area()
            .x(function (d) {return g.Xscale(d.data.Anno);})
            .y0(function (d) {return g.currentYscale(d[0]);})
            .y1(function (d) {return g.currentYscale(d[1]);});
        var shapes = g.area.append('g')
            .attr('id', 'shapeGroup')
            .selectAll('path')
            .data(stacked)
            .enter()
            .append('path')
            .attr('class', 'graphShape')
            .attr('id', ((pid == null) ? nameShape : ('shape_' + pid)))
            .style('fill', ((pid == null) ? fillShape : palette[pid]))
            .attr('d', area)
            .on('click', this.graphClick.bind(g))
            .on('mouseover', this.graphMouseOver.bind(g))
            .on('mousemove', this.graphMouseMove.bind(g))
            .on('mouseleave', this.graphMouseLeave.bind(g));
        return shapes;
    }

    // Completely removes property shapes and income line from the graph.
    removeShapes() {
        this.area.select('#shapeGroup').remove();
        this.area.select('#incomeLine').remove();
        this.area.select('#incomeArea').remove();
    }

    // Experimental function
    focus(rid, pid, year) {
        var g = this;
        // This sub-function is used to read the data and insert the single
        // shape into the graph.
        var insert = function (rid, pid, year) {
            var insertionTimeout = 100; // Delay before the shape appears.
            var mode = map.macroMode;
            d3.csv(getRegionFilename(rid, mode), function (data) {
                g.addShapes(data, properties, pid)
                    .transition()
                    .duration(insertionTimeout)
                    .attrTween('opacity', function (d) {
                        return d3.interpolateNumber(0, 1);
                    });
                g.setCurrentTick(year);
            });
        };
        // Set the graph text.
        this.tooltip.text(descriptions[pid]);
        // Select the old shapes.
        var shapes = this.area.select('#shapeGroup');
        // Set up the Y axis.
        var d = [0, nextMultipleOfTen(ranges[pid][1])];
        this.currentYscale = d3.scaleLinear().domain(d).range([focusedBase, normalTop]);
        this.Y = d3.axisLeft(this.currentYscale).tickFormat(d3.format('.0f')).tickValues(d);
        // If we are not in focused mode, then switch to it.
        if (!this.focused) {
            this.focused = true;
            // Restyle the X axis.
            this.Xaxis.transition().duration(timeout)
                .attr('transform', 
                'translate(0,' + (focusedBase + gap + 100) + ')');
            // Restyle the Y axis.
            this.Yaxis.transition().duration(timeout)
                .attr('transform', 'translate(-' + (gap / 2) + ',0)')
                .call(this.Y);
            // Remove the old shapes with a transition and insert the new one.
            shapes.transition()
                .duration(timeout)
                .attrTween('opacity', function (d) {
                    return d3.interpolateNumber(1, 0);
                })
                .remove()
                .on('end', insert.bind(this, rid, pid, year));
        }
        // If we are already in focused mode, just insert the shape.
        else {
            this.Yaxis.call(this.Y);
            shapes.remove();
            insert(rid, pid, year);
        }
        return;
    }

    // Invoke this method when all the properties must be shown.
    showAll(rid, pid, year) {
        var g = this;
        var income = true;
        // This sub-function is used to read the data and insert the shapes
        // into the graph.
        var insert = function (rid, pid, year) {
            var insertionTimeout = 100;
            var mode = map.macroMode;
            d3.csv(getRegionFilename(rid, mode), function (data) {
                g.addShapes(data, stackable)
                    .transition()
                    .duration(insertionTimeout)
                    .attrTween('opacity', function (d) {
                        return d3.interpolateNumber(0, 1);
                    });
                if (income) g.addIncome(data);
                g.setCurrentTick(year);
                g.setCurrentProperty(pid);
            });
        };
        // Set the graph text.
        this.tooltip.text(descriptions[pid]);
        // Revert the graph to its original form, if necessary.
        if (this.focused) {
            this.focused = false;
            // Do not add income again, since it is already hidden in the graph!
            income = false; 
            this.currentYscale = this.Yscale;
            this.Y = d3.axisLeft(this.Yscale)
                .tickFormat(d3.format('.0f'))
                .tickValues(normalTicks);
            this.Yaxis.transition().duration(timeout)
                .attr('transform', 'translate(-' + (gap / 2) + ',0)')
                .call(this.Y);
            // Remove the focused shape with a transition.
            this.area.select('#shapeGroup').transition()   
                .duration(timeout)
                .attrTween('opacity', function (d) {
                    return d3.interpolateNumber(1, 0);
                })
                // When the transition end, insert the shapes.
                .on('end', insert.bind(this, rid, pid, year))
                .remove();
        }
        // Otherwise, just remove everything and reinsert.
        else {
            g.removeShapes();
            insert(rid, pid, year);
        }
    }

    ////////////////////////////////////////////////////////////////////////////

    // Sets the title of the graph.
    setTitle(text) {
        this.tooltip.text(text);
    }

    // Sets the currently highlighted property of the graph.
    setCurrentProperty(pid) {
        //console.log('setting current property = ' + descriptions[pid]);
        var shapes = this.area.selectAll('.graphShape');
        // Highlight all if pid == expenses.
        if (pid == expenses) {
            shapes.style('opacity', 1);
            this.setIncome(true);
        }
        else {
            // Hide all if pid == incomes.
            if (pid == incomes) {
                shapes.style('opacity', .2);
                this.setIncome(true);
            }
            // Otherwise highlight only the selected property.
            else {
                shapes.style('opacity', .2);
                this.area.select('#shape_' + pid)
                    .style('stroke', 'black')
                    .style('opacity', 1);
                this.setIncome(false);
            }
        }
    }

    // Sets the currently highlighted tick of the graph.
    setCurrentTick(year) {
        this.area.select('#currentTick').remove(); // remove old red tick
        var current = this.area.select('#graphLine_' + year);
        var ctm = getTransformationMatrix(current.node(), this.area.node());
        var bbox = current.node().getBBox()
        this.area.append('line')
            .attr('id', 'currentTick')
            .attr('y2', bbox.y)
            .attr('transform', 'matrix(' + ctm.a + ',' + ctm.b + ',' + ctm.c 
            + ',' + ctm.d + ',' + ctm.e + ',' + ctm.f + ')')
            .attr('stroke', 'crimson')
            .attr('stroke-width', 2);
        this.area.selectAll('.tick text') 
            .attr('fill', 'black')
            .filter(function (d) {return d == year;})
            .attr('fill', 'crimson');
    }

    // Sets the visibility of the income line and area.
    setIncome(visible) {
        //console.log('set income called with ' + visible);
        var line = this.area.select('#incomeLine');
        var area = this.area.select('#incomeArea');
        line.style('visibility', ((visible) ? 'visible' : 'hidden'));
        area.style('visibility', ((visible) ? 'visible' : 'hidden'));
    }

    ////////////////////////////////////////////////////////////////////////////

    // Callback function for mouse click event.
    graphClick(d, i) {
        var previous = d3.select('.listEntry[selected="true"]');
        var year = d3.select('#sliderInput').node().value
        var rid = map.getRegion();
        // If we are in normal mode...
        if (!this.focused) {
            // Build the focused graph.
            var current = d3.select('.listEntry[pid="' + i + '"]');
            var pid = i;
            previous.attr('selected', false);
            current.attr('selected', true);
            map.fill(i, year);
            this.focus(rid, pid, year);
        }
        // If we are in focused mode, switch to normal.
        else {
            var pid = previous.attr('pid');
            this.showAll(rid, pid, year);
        }
    }
    
    // Callback function for mouse over event.
    graphMouseOver(d, i) {
        if (!this.focused) {
            this.tooltip.text(descriptions[i]);
            this.setCurrentProperty(i);
        }
    }
    
    // Callback function for mouse move event.
    graphMouseMove(d, i) {
        if (!this.focused) this.tooltip.text(descriptions[i]);
    }
    
    // Callback function for mouse leave event.
    graphMouseLeave(d, i) {
        if (!this.focused) {
            var pid = d3.select('.listEntry[selected="true"]').attr('pid');
            this.tooltip.text(descriptions[pid]);
            this.setCurrentProperty(pid);
        }
    }

}

// Build the initial graph.
graph = new Graph(graphContainer);
graph.showAll(null, expenses, yearMin, stackable);