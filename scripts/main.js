/**
 * Created with JetBrains WebStorm.
 * User: dnelson
 * Date: 7/20/13
 * Time: 5:06 AM
 * To change this template use File | Settings | File Templates.
 */

var width = 959,
height = 650,
active;

var appendSvg = function(svg){
    d3.select("div#map")
        .html(svg);
}

var enrichDocument = function(){
    g = d3.select("svg > g");
    //g.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")

    drawLegend();

    g.selectAll(".state")
        .each(doState)
};

var doState = function(){
    var listView = d3.select('ul#stateData');
    var state = d3.select(this);

    state.on("click", click)
        .on("mouseover", highlightState)
        .on("mouseout",  unhighlightState);

    listView.append("li")
        .attr("data-state-id", state.attr("id"))
        .append("a")
        .attr("href", "javascript:void(0)")
        .text(states[state.attr("id")] + " ")
        .append("span")
        .append("strong")
        .property("class", "perc")
        .text(statePercentage(state));

    listView.selectAll("li")
        .on("click", click)
        .on("mouseover", highlightState)
        .on("mouseout", unhighlightState);
}

var colorRange = function(){
    var range = d3.select("#color-range"),
        list = [];

    list.push(range.attr('data-color-10'));
    list.push(range.attr('data-color-20'));
    list.push(range.attr('data-color-30'));
    list.push(range.attr('data-color-40'));
    list.push(range.attr('data-color-50'));

    return list;
}

var drawLegend = function(){
    var color = d3.scale.threshold()
        .domain([.1, .2, .3, .4, .5])
        .range(colorRange());

    // A position encoding for the key only.
    var x = d3.scale.linear()
        .domain([0,.5])
        .range([0, 350]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickSize(5)
        .tickValues(color.domain())
        .tickFormat(function(tick){return numeral(tick).format("0%")});

    var key = d3.select("svg").append("g")
        .attr("class", "key")
        .attr("transform", "translate(0,600)");

    key.call(xAxis).append("text")
        .attr("class", "caption")
        .attr("y", - 6)
        .text("Precentage of Market")
        .style("fill", "#000");

    key.selectAll("rect")
        .data(color.range().map(function(d, i) {

            return {
                x0: i ? x(color.domain()[i - 1]) : x.range()[0],
                x1: i < color.domain().length ? x(color.domain()[i]) : x.range()[1],
                z: d
            };
        }))
        .enter().append("rect")
        .attr("height", 0)
        .attr("x", function(d) { return d.x0; })
        .attr("width", function(d) { return d.x1 - d.x0; })
        .style("fill", function(d) { return d.z; });

    key.select("path.domain")
        .style("fill", "url(#primaryGradient)");
}

var highlightState = function(){

    var self, shape, id;

    self = d3.select(this)
    shape = (d3.select(this).node().nodeName == "LI") ?
        d3.select("#" + d3.select(this).attr('data-state-id')) :
        self;

    shape.style('fill',
        d3.rgb(shape.style('fill')).darker(.3)
    );
}

var unhighlightState = function(){

    var self, shape, id;

    self = d3.select(this)
    shape = (d3.select(this).node().nodeName == "LI") ?
        d3.select("#" + d3.select(this).attr('data-state-id')) :
        self;

    shape.style('fill',
        d3.rgb(shape.style('fill')).brighter(.3)
    );
}

var showPercentage = function(shape, percentage){
    var svg = d3.select("svg");
    var bb = shape.node().getBBox();
}

var hidePercentage = function(){
    d3.select("text").data({}).exit().remove();
}

var statePercentage = function(shape){
    var value = parseInt(shape.attr('data-val'), 10);
    var total = parseInt(shape.attr('data-total'), 10);
    return numeral(value/total).format("0.0%");
}

function click() {
    if (d3.select(this).node().nodeName == "LI"){
        var id = d3.select(this).attr('data-state-id');
        d = d3.select("#" + id);
    } else
        d = d3.select(this);

    if (active && d) return reset();

    active = true;

    g.selectAll(".active").classed("active", false);

    g.selectAll(".state").classed("disabled", true);

    d.classed("active", true).classed("disabled", false)

    var n = d.node().getBBox();

    topLeft = [n.x, n.y];
    bottomRight = [n.x + n.width, n.y + n.height];

    //Calculate the height and width of the box
    stateHeight = Math.abs(n.height);
    stateWidth = Math.abs(n.width);

    centerX = n.x + (stateWidth / 2)
    centerY = n.y + stateHeight / 2

    /*drawDot(centerX, centerY);
     drawDot(topLeft[0], topLeft[1]);
     drawDot(bottomRight[0], bottomRight[1]);
     drawDot(topLeft[0] + stateWidth, topLeft[1]);
     drawDot(bottomRight[0] - stateWidth, bottomRight[1]);*/

    var fontSize = "20px";
    var translationDifferential = .05;
    var xDifference = -23;
    var yDifference = 10;

    if (stateHeight < 10 || stateWidth < 10){
        scale = .25 / Math.max( stateHeight / height, stateWidth / width);
        fontSize = "6px";
        translationDifferential = .5;
        xDifference = -10;
    } else if (stateHeight < 30 || stateWidth < 30) {
        translationDifferential = .5;
        scale = .50 / Math.max( stateHeight / height, stateWidth / width);
        fontSize = "10px";
    } else
        scale = .95 / Math.max( stateHeight / height, stateWidth / width);


    g.append("svg:text")
        .attr("x", centerX + xDifference)
        .attr("y", centerY + yDifference)
        .text( statePercentage(d) )
        .style("font-family", "sans-serif")
        .style("font-size", fontSize)
        .style("fill", "#000");

    x = -topLeft[0]
    y = -topLeft[1]

    g.selectAll("path")
        .classed("active", active && function(d) { return d === active; });

    g.transition()
        .duration(750)
        .style("stroke-width", 1.5 / scale + "px")
        .style("stroke-color", "#f5f5f5")
        .attr("transform",
            "translate(" + topLeft[0]*translationDifferential +","+ topLeft[1]*translationDifferential + ")"
                + "scale(" + scale + ")"
                + "translate(" + x + "," + y + ")");


}

function reset() {
    g.selectAll("text").data({}).exit().remove();

    g.selectAll(".state")
        .classed("disabled", false)
        .classed("active", active = false);

    g.transition().duration(750)
        .attr("transform", "");
}

function drawDot(x, y) {
    g.append("circle")
        .attr("r", 2)
        .attr("cx", x)
        .attr("cy", y)
        .attr("fill", "red")
}

$(function(){

  //var svgDocument = "http://localhost:3001/reportsback/map/svg", active;

  var projection = d3.geo.albersUsa()
    .scale(width)
    .translate([0, 0]);

  var path = d3.geo.path()
    .projection(projection);

  enrichDocument();

})
