/**
 * Created with JetBrains WebStorm.
 * User: dnelson
 * Date: 7/20/13
 * Time: 5:06 AM
 * To change this template use File | Settings | File Templates.
 */

$(function(){

    var g;

    var data = d3.selectAll('.state')[0].map(
        function(st){
            var state = d3.select(st);
            var teachersTotal = state.attr("data-total");
            var teachers = state.attr("data-val");
            var code = state.attr("id");
            return {code: code, count: teachers, total: teachersTotal, percentage: teachersTotal/teachers}
        }
    );

    var enrichDocument = function(){

        data = window.data = d3.map(d3.selectAll('.state')[0],
            function(st){
                var teachersTotal = parseInt(st.attr("data-total"),10);
                var teachers = parseInt(st.attr("data-val"),10);
                var code = st.attr("id");
                return {code: code, count: teachers, total: teachersTotal, percentage: teachers/teachersTotal}
            }
        );

        g = d3.select("svg > g");
        //g.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")

        drawLegend();

        var states = g.selectAll(".state");

        states[0].sort(function(state1, state2){
            return d3.ascending($(state1).attr("id"),$(state2).attr("id"))
        });

        states.each(doState);
    };

    var doState = function(){
        var listView = d3.select('ul#stateData');
        //var state = el;//d3.select(el);

        var state = d3.select(this)
            .on("click", click)
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
        d3.select("body")
            .on("mousemove", function(){
                if (!window.domain)
                    window.domain = d3.select("path.domain")[0][0];

                var mxy = d3.mouse(d3.select("path.domain")[0][0]);

                if(window.over === true && mxy && 350 > mxy[0] && mxy[0] > 0 && mxy[1] > 0 && 30 > mxy[1]){



                    var mousePosition = d3.mouse(window.domain)[0];
                    var perc = (mousePosition/350)*.5,
                        start = perc * .7,
                        end = perc * 1.3;



                    d3.selectAll(".state").each(
                        function(){
                            var state = d3.select(this);
                            var statePerc = stateNumPercentage(state);
                            var bool = !(statePerc > start && statePerc < end);
                            state.classed("disabled", bool);

                        });


                    d3.select("#slider")
                        .attr("x", mousePosition);
                }else {
                    key.select("#slider")
                        .attr("x", 0);

                    d3.selectAll(".state").classed("disabled", false)

                    d3.selectAll(".state")
                        .classed("disabled", false)

                    key.select("#slider")
                        .attr("x", 0);
                }
            })

        d3.select("path.domain")
            .style("fill", "url(#primaryGradient)")
            .on("mouseover", function(){
                window.over = true;
            })

        var keyElements = d3.selectAll("g.key > *");
        keyElements[0].reverse();
        keyElements.order();

        key.append("rect")
            .attr("height", 33)
            .attr("width","2px")
            .style("fill", "#000")
            .attr("id", "slider");

        d3.selectAll(".tick")
            .append("rect")
            .attr("height", 33)
            .attr("width","1px")
            .style("fill", "#fff")
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
        return numeral(stateNumPercentage(shape)).format("0.0%");
    }

    var stateNumPercentage = function(shape){
        var state = shape;
        var value = parseInt(state.attr('data-val'), 10);
        var total = parseInt(state.attr('data-total'), 10);
        return value/total;
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
        var translationDifferential = .40;
        var xDifference = -23;
        var yDifference = 10;

        if (stateHeight < 10 || stateWidth < 10){
            scale = .25 / Math.max( stateHeight / height, stateWidth / width);
            fontSize = "6px";
            translationDifferential = .30;
            xDifference = -10;
        } else if (stateHeight < 30 || stateWidth < 30) {
            translationDifferential = .30;
            scale = .50 / Math.max( stateHeight / height, stateWidth / width);
            fontSize = "10px";
        } else
            scale = .50 / Math.max( stateHeight / height, stateWidth / width);

        x = -topLeft[0]
        y = -topLeft[1]

        g.selectAll("path")
            .classed("active", active && function(d) { return d === active; });

        g.transition()
            .duration(750)
            .style("stroke-width", 1.5 / scale + "px")
            .style("stroke-color", "#f5f5f5")
            .attr("transform",
                "skewX(15) translate(" + topLeft[0]*translationDifferential +","+ topLeft[1]*translationDifferential + ")"
                    + "scale(" + scale + ")"
                    + "translate(" + x + "," + y + ") ");

        d3.select("svg").append("svg:text")
            .attr("x", centerX + xDifference)
            .attr("y", centerY + yDifference)
            .text( statePercentage(d) )
            .style("font-family", "sans-serif")
            .style("font-size", 50)
            .style("fill", "#000");


    }

    function reset() {
        d3.selectAll("svg > text").data({}).exit().remove();

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

  var width = 959,
    height = 650,
    active;


  var projection = d3.geo.albersUsa()
    .scale(width)
    .translate([0, 0]);

  var path = d3.geo.path()
    .projection(projection);

  enrichDocument();

})
