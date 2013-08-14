/**
 * Created with JetBrains WebStorm.
 * User: dnelson
 * Date: 7/20/13
 * Time: 5:06 AM
 * To change this template use File | Settings | File Templates.
 */

$(function(){

    var drawLegend = function(){
        var color = d3.scale.threshold()
            .domain([.1, .2, .3, .4, .5]);

        // A position encoding for the key only.
        var x = d3.scale.linear()
            .domain([0,.5])
            .range([0, 350]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickSize(30)
            .tickValues(color.domain())
            .tickFormat(function(tick){return numeral(tick).format("0%")});

        var key = d3.select("svg").attr("height", "670").append("g")
            .attr("class", "key")
            .attr("transform", "translate(0,600)");

        key.call(xAxis).append("text")
            .attr("class", "caption")
            .attr("y", - 6)
            .text("Percentage of Market")
            .style("fill", "#000");

        key.selectAll(".tick").style("fill", "#000")

        d3.select("path.domain")
            .style("fill", "url(#primaryGradient)")

        var keyElements = d3.selectAll("g.key > *");
        keyElements[0].reverse();
        keyElements.order();

        d3.selectAll(".tick")
            .append("rect")
            .attr("height", 33)
            .attr("width","1px")
            .style("fill", "#fff")
    }

    d3.json("http://localhost:3001/reportsback/map/snapshots/all", function(error, json) {
        if (error) return console.warn(error);
        console.log(JSON.stringify(json));
        var options = json.map(function(snapshot){
            var year = snapshot.year,
                month = snapshot.month,
                monthYear = month + "-" +year;

            return jQuery("<option></option>")
                .text(monthYear)
                .attr("value", monthYear);
        });

        jQuery("div.container").prepend(
            jQuery("<select></select>")
                .append(options)
                .css("float", "left")
        );
    });

    d3.select("svg")
        .style("clear", "left")
        .style("float", "left");

    var svgWidth = d3.select("svg").attr("width"),
        svgHeight = d3.select("svg").attr("height");

    var _is_state_selected;

    var range = d3.select("#color-range"),

    colorRange = d3.range(10, 60, 10).map(function(num){
        return range.attr('data-color-' + num);
    }),

    percentageFormatter = d3.format("%"),
    data = d3.selectAll('.state')[0]
        .map(function(st){
            var state = d3.select(st);
            var teachersTotal = state.attr("data-total");
            var teachers = state.attr("data-val");
            var n = state.node().getBBox(),

            color = state.style("fill"),
            d3rgb = d3.rgb(color),
            d3lab = d3.lab(d3rgb),
            dColor = d3lab.darker().toString(),
            bColor = d3lab.brighter().toString(),
            code = state.attr("id"),

            topLeft = [n.x, n.y],
            bottomRight = [n.x + n.width, n.y + n.height],

            //Calculate the height and width of the box
            height = Math.abs(n.height),
            width = Math.abs(n.width),

            centerX = n.x + width / 2,
            centerY = n.y + height / 2,
            translationDifferential = .30,
            x = -topLeft[0],
            y = -topLeft[1],
            fontSize = "10px",
            scale,
            fontSize,
            translationDifferential;

            if (height < 10 || width < 10){
                scale = .25 / Math.max( height / svgHeight, width / svgWidth);
                fontSize = "6px";
            } else if (height < 30 || width < 30) {
                scale = .50 / Math.max( height / svgHeight, width / svgWidth);
            } else {
                scale = .50 / Math.max( height / svgHeight, width / svgWidth);
                translationDifferential = .40;
            }

            var transform = "translate(" + topLeft[0]*translationDifferential +","+ topLeft[1]*translationDifferential + ")"
                + "scale(" + scale + ")"
                + "translate(" + x + "," + y + ")";

            return {
                    name: states[code],
                    code: code,
                    count: teachers,
                    total: teachersTotal,
                    percentage: teachers/teachersTotal,
                    color: color,
                    dColor: dColor,
                    bColor: bColor,
                    topLeft: topLeft,
                    bottomRight: bottomRight,
                    height: height,
                    width: width,
                    centerX: centerX,
                    centerY: centerY,
                    textX: -23 + centerX,
                    textY: 10 + centerY,
                    fontSize: fontSize,
                    selectionTransform: transform
                }
        });

    var svg = d3.select("svg > g"),
        listView = d3.select('ul#stateData');

    data.forEach(function(state){
        var percentage = percentageFormatter(state.percentage);

        svg.select("#" + state.code)
            .on("click", function(){
                if(_is_state_selected){
                    _is_state_selected = false;

                    d3.select("svg > g").transition()
                        .duration(750)
                        .style("stroke-width", "")
                        .style("stroke-color", "")
                        .attr("transform", "");

                } else {
                    _is_state_selected = true;
                    d3.select("svg > g").transition()
                        .duration(750)
                        .style("stroke-width", 1.5 + "px")
                        .style("stroke-color", "#f5f5f5")
                        .attr("transform", state.selectionTransform);
                }
            })
            .on("mouseover", function(){
                d3.select('span.tooltip')
                    .text(state.name + " " + percentage)
                    .style("left", 300+ state.textX + "px" )
                    .style("top", -10 + state.topLeft[1] + "px" )
                    .style("z-index", 1000)
                    .transition()
                    .duration(200)
                    .style("display", "block");

                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("fill", state.dColor);
            })
            .on("mouseout", function(){
                d3.select('span.tooltip')
                    .transition()
                    .duration(200)
                    .delay(100)
                    .style("display", "none");



                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("fill", state.color);
            })
            .data(state);

        listView.append("li")
            .attr("data-state-id", state.code)
            .append("a")
                .attr("href", "javascript:void(0)")
                .text(state.name)
                .append("span")
                    .append("strong")
                        .property("class", "perc")
                        .text(percentage);
    });

    drawLegend();
})
