/*
* Called when the slider is changing, updates the radius of the circle that
* correspondes to the radio button selection
*/
function radiusUpdate(vol) {
	document.querySelector('#radiusSlider').value = vol;
	//if radius is small, make border proportional to radius. Limit between 2 and 5, regardless
	var propRadius = ((vol/10)*30/20);
	var radius = Math.min(5, propRadius);
	radius = Math.max(2, radius);
	if (document.getElementById('circleA').checked){
		circle1.attr("r", (vol/10) * 30 + "px");
		circle1.style("stroke-width", radius);
	} else {
		circle2.attr("r", (vol/10) * 30 + "px");
		circle2.style("stroke-width", radius);
	}
}

var categoryFilter = [];
function initCategoryFilters(){
	var boxes = document.getElementsByClassName("checkbox");
	for (var i = 0; i < boxes.length; i++){
		var box = boxes[i];
		if (box.checked){
			categoryFilter.push(box.name);
		}
	}
}
initCategoryFilters();
function changeCategoryFilter(checkbox){
	var allBox = document.getElementById("allBox");
	var noneBox = document.getElementById("noneBox");
	var boxes = document.getElementsByClassName("checkbox");
	var i, box;
	if (checkbox.name === "All"){
		noneBox.checked = false;
		categoryFilter = [];
		for (i = 0; i < boxes.length; i++){
			box = boxes[i];
			box.checked = true;
			categoryFilter.push(box.name);
		}
	}else if (checkbox.name === "None"){
		allBox.checked = false;
		categoryFilter = [];
		for (i = 0; i < boxes.length; i++){
			box = boxes[i];
			box.checked = false;
		}
	}else{
		if (checkbox.checked){
			categoryFilter.push(checkbox.name);
			noneBox.checked = false;
		}else{
			var index = categoryFilter.indexOf(checkbox.name);
			if (index > -1){
				categoryFilter.splice(index, 1);
			}
		}

	}

	console.log(categoryFilter);
}
/*
* Called when filter button is pushed, filters to only points in the overlap
* of the two circles
*/
function filterPoints() {
	var radius1 = parseInt(circle1.attr("r"));
	var radius2 = parseInt(circle2.attr("r"));
	var center1 = [circle1.attr("cx"), circle1.attr("cy")];
	var center2 = [circle2.attr("cx"), circle2.attr("cy")];
	var distance = dist(center1, center2);
	var sum_radii = radius1+radius2;
	var diff_radii = Math.abs(radius1-radius2);
	// console.log("distance: " + distance)
	// console.log("sum: " + sum_radii)
	// console.log("difference: " + diff_radii)
	if (distance < sum_radii && distance > diff_radii) {
		loadData({"overlap":true});
	} else {
		console.log("no overlap");
	}
}

function dist(c1, c2) {
	return Math.sqrt(Math.pow(c1[0]-c2[0], 2) + Math.pow(c1[1]-c2[1], 2));
}

function loadData(filters) {
	// load and display the data
	d3.json("data/scpd_incidents.json", function(error, json) {
		// add circles to svg

		var locationsToPlot = [];
		//json['data'].length
		for (var i = 0; i < json.data.length; i++){
			var object = json.data[i];
			var center1 = [circle1.attr("cx"), circle1.attr("cy")];
			var center2 = [circle2.attr("cx"), circle2.attr("cy")];
			if (filters["overlap"]) {
				var dist1 = d3.geo.distance(object.Location, projection(center1));
				var dist2 = d3.geo.distance(object.Location, projection(center2));
				var radius1 = parseInt(circle1.attr("r")) * pixelToMiles;
				var radius2 = parseInt(circle2.attr("r")) * pixelToMiles;
				// console.log("projection1: " + projection(center1));
				// console.log("projection2: " + projection(center2));
				console.log("distance 1: " + dist1);
				console.log("distance 2: " + dist2);
				console.log("radius 1: " + radius1);
				console.log("radius 2: " + radius2);
				if (dist1 < radius1 && dist2 < radius2) {
					console.log("found point");
					locationsToPlot.push(object.Location);
				}
			} else {
				locationsToPlot.push(object.Location);
			}
		}
		console.log(locationsToPlot.length);
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
	});
	circle1.moveToFront();
	circle2.moveToFront();
}

d3.selection.prototype.moveToFront = function() {
	return this.each(function() {
		this.parentNode.appendChild(this);
	});
};

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

p1=[7,7];
p2=[12,12];
pixel_dist = dist(p1, p2);
geo_dist = d3.geo.distance(projection(p1), projection(p2));
var pixelToMiles = geo_dist / pixel_dist;

aa = [-122.490402, 37.786453];
bb = [-122.389809, 37.72728];
console.log(d3.geo.distance(aa,bb));
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

loadData({"overlap":false});
