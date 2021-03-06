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

$(function(){

  var svgDocument = "http://10.211.1.63:3001/reportsback/map/svg", active;

  var projection = d3.geo.albersUsa()
    .scale(width)
    .translate([0, 0]);

  var path = d3.geo.path()
    .projection(projection);

  d3.xhr(svgDocument, "image/svg", function(error, data){
    appendSvg(data.responseText);
    enrichDocument();

  })

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
    .on("click", click)
    .on("mouseover", function() {
      highlightState(d3.select(this));
    })
    .on("mouseout",  function() {
      unhighlightState(d3.select(this))
      })
    };

    var doState = function(){
      var listView = d3.select('ul#stateData');
      var state = d3.select(this);

      listView.append("li")
        .attr("data-state-id", state.attr("id"))
        .append("a")
        .attr("href", "javascript:void(0)")
        .text(states[state.attr("id")] + " ")
        .append("span")
        .property("class", "perc")
        .text(statePercentage(state))

      listView.selectAll("li")
      .on("click", click)
      .on("mouseover", function(){
        var id = d3.select(d3.event.currentTarget).attr('data-state-id');
        var shape = d3.select("#" + id);
        highlightState(shape);
      })
      .on("mouseout", function(){
        var id = d3.select(d3.event.currentTarget).attr('data-state-id');
        var shape = d3.select("#" + id);
        unhighlightState(shape);
      })
    }

    var drawLegend = function(){
      var color = d3.scale.threshold()
        .domain([.2, .4, .6, .8, 1])
        .range(["#FFEDA0", "#FECC5C", "#FD8D3C", "#F03B20", "#BD0026"]);

      // A position encoding for the key only.
      var x = d3.scale.linear()
          .domain([0, 1])
          .range([0, 350]);

      var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom")
          .tickSize(13)
          .tickValues(color.domain());

      var key = d3.select("svg").append("g")
        .attr("class", "key")
        .attr("transform", "translate(0,600)");

        key.call(xAxis).append("text")
            .attr("class", "caption")
            .attr("y", -6)
            .text("Precentage of Market");

        key.selectAll("rect")
          .data(color.range().map(function(d, i) {
            return {
              x0: i ? x(color.domain()[i - 1]) : x.range()[0],
              x1: i < color.domain().length ? x(color.domain()[i]) : x.range()[1],
              z: d
            };
          }))
        .enter().append("rect")
          .attr("height", 13)
          .attr("x", function(d) { return d.x0; })
          .attr("width", function(d) { return d.x1 - d.x0; })
          .style("fill", function(d) { return d.z; });
    }

    var highlightState = function(shape){
      shape.style('fill', d3.rgb(shape.style('fill')).darker(.3));  
    }

    var unhighlightState = function(shape){
      shape.style('fill', d3.rgb(shape.style('fill')).brighter(.3));
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
        scale = .95 / Math.max( stateHeight / height, stateWidth / width)

        g.append("svg:text")
          .attr("x", centerX-23)
          .attr("y", centerY+10)
          .text( statePercentage(d) )
          .attr("font-family", "sans-serif")
          .attr("font-size", "25px")
          .attr("fill", "#000"); 

        x = -topLeft[0]
        y = -topLeft[1]

      g.selectAll("path")
        .classed("active", active && function(d) { return d === active; });

      g.transition()
        .duration(1000)
        .style("stroke-width", 1.5 / scale + "px")
        .style("stroke-color", "#f5f5f5")
        .attr("transform", 
          "translate(" + topLeft[0]*.05 +","+ topLeft[1]*.05 + ")"
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
})
