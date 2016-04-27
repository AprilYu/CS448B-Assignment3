// Set up size
var width = 750,
	height = width;

// Set up projection that map is using
var projection = d3.geo.mercator()
	.center([-122.433701, 37.767683]) // San Francisco, roughly
	.scale(225000)
	.translate([width / 2, height / 2]);

// Add an svg element to the DOM
var svg = d3.select("#map").append("svg")
	.attr("width", width)
	.attr("height", height);

// Add svg map at correct size, assumes map is saved in a subdirectory called "data"
svg.append("image")
          .attr("width", width)
          .attr("height", height)
          .attr("xlink:href", "data/sf-map.svg");


var circle1;
var drag1 = d3.behavior.drag()
             .on('dragstart', function() { console.log("start drag"); })
             .on('drag', function() { console.log("drag");
                                      circle1.attr('cx', d3.event.x)
                                      .attr('cy', d3.event.y); })
             .on('dragend', function() { console.log("end drag"); });

 var circle2;
 var drag2 = d3.behavior.drag()
              .on('dragstart', function() { console.log("start drag"); })
              .on('drag', function() { console.log("drag");
                                       circle2.attr('cx', d3.event.x)
                                       .attr('cy', d3.event.y); })
              .on('dragend', function() { console.log("end drag"); });

// load and display the World
d3.json("data/scpd_incidents.json", function(error, json) {
  // add circles to svg

  var locationsToPlot = [];
  //json['data'].length
  for (var i = 0; i < json.data.length; i++){
    var object = json.data[i];
    locationsToPlot.push(object.Location);
  }

  // add circles to svg
  svg.selectAll("circle")
  .data(locationsToPlot).enter()
  .append("circle")
  .attr("cx", function (d) {
     return projection(d)[0];
   })
  .attr("cy", function (d) { return projection(d)[1]; })
  .attr("r", "2px")
  // .call(drag)
  .attr("fill", "red");

  aa = [-122.490402, 37.786453];
  bb = [-122.389809, 37.72728];
  circle1 = svg.selectAll("dragPoint")
  .data([aa]).enter()
  .append("circle")
  .attr("cx", function (d) {
     return projection(d)[0];
   })
  .attr("cy", function (d) { return projection(d)[1]; })
  .attr("r", "20px")
  .call(drag1)
  .attr("fill", "blue");

  circle2 = svg.selectAll("dragPoint")
  .data([bb]).enter()
  .append("circle")
  .attr("cx", function (d) {
     return projection(d)[0];
   })
  .attr("cy", function (d) { return projection(d)[1]; })
  .attr("r", "20px")
  .call(drag2)
  .attr("fill", "blue");

});
