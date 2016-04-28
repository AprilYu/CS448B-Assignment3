/*
 * Called when the slider is changing, updates the radius of the circle that
 * correspondes to the radio button selection
 */
function radiusUpdate(vol) {
	document.querySelector('#radiusSlider').value = vol;
  //if radius is small, make border proportional to radius. Limit between 2 and 5, regardless
	var propRadius = ((vol/10)*30/20)
	var radius = Math.min(5, propRadius);
	radius = Math.max(2, radius)
  if (document.getElementById('circleA').checked){
    circle1.attr("r", (vol/10) * 30 + "px");
    circle1.style("stroke-width", radius);
  } else {
    circle2.attr("r", (vol/10) * 30 + "px");
    circle2.style("stroke-width", radius);
  }
}

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
  .attr("fill", "#59c346");

  aa = [-122.490402, 37.786453];
  bb = [-122.389809, 37.72728];
  circle1 = svg.selectAll("dragPoint")
  .data([aa]).enter()
  .append("circle")
  .attr("cx", function (d) {
     return projection(d)[0];
   })
  .attr("cy", function (d) { return projection(d)[1]; })
  .attr("r", "18px")
  .call(drag1)
  .attr("fill", "none")
  .style("stroke", "#1d7aed")
  .style("fill", "gray")
  .style("fill-opacity", 0.4)
  .style("stroke-width", 2);

  circle2 = svg.selectAll("dragPoint")
  .data([bb]).enter()
  .append("circle")
  .attr("cx", function (d) {
     return projection(d)[0];
   })
  .attr("cy", function (d) { return projection(d)[1]; })
  .attr("r", "18px")
  .call(drag2)
  .attr("fill", "none")
  .style("stroke", "#1d7aed")
  .style("fill", "gray")
  .style("fill-opacity", 0.4)
  .style("stroke-width", 2);

});
