
/*
* Called when the slider is changing, updates the radius of the circle that
* correspondes to the radio button selection
*/
function radiusUpdate(vol) {
	document.querySelector('#radiusSlider').value = vol + " mi";
	//if radius is small, make border proportional to radius. Limit between 2 and 5, regardless
	pixel_radius = vol * milesToPixels;
	var temp_stroke = pixel_radius / 20;
	var stroke = Math.min(5, temp_stroke);
	stroke = Math.max(2, stroke);
	if (document.getElementById('circleA').checked){
		circle1.attr("r", pixel_radius + "px");
		circle1.style("stroke-width", stroke);
		document.getElementById("circleA").value = vol;

	} else {
		circle2.attr("r", pixel_radius + "px");
		circle2.style("stroke-width", stroke);
		document.getElementById("circleB").value = vol;
	}
	filterPoints();
}


var timePoints = [];
function getVals(){
	timePoints = [];
	// Get slider values
  var parent = this.parentNode;
  var slides = parent.getElementsByTagName("input");
    var slide1 = parseInt( slides[0].value );
    var slide2 = parseInt( slides[1].value );
  // Neither slider will clip the other, so make sure we determine which is larger
  if( slide1 > slide2 ){ var tmp = slide2; slide2 = slide1; slide1 = tmp; }
	// slider 2 is the larger one
  var displayElement = parent.getElementsByClassName("rangeValues")[0];
      displayElement.innerHTML = parseTimeFromMinutes(slide1) + " - " + parseTimeFromMinutes(slide2);
		timePoints.push(slide1);
		timePoints.push(slide2);
		filterPoints();
}

function parseTimeFromMinutes(val) {
	var hour = Math.floor(val / 60);
	var ampm;
	if (hour < 12) {
		ampm = "am"
	} else {
		ampm = "pm"
	}
	if (hour == 0 || hour == 12) {
		hour = 12
	} else {
		hour = hour % 12;
	}
	var minute = val % 60;
	if (minute.toString().length < 2) {
		minute = '0' + minute;
	}
	return hour + ":" + minute + " " + ampm;
}

function parseMinutesFromTime(val) {
	var hour = parseInt(val.substring(0, val.indexOf(':')));
	var minute = parseInt(val.substring(val.indexOf(':')+1, val.indexOf(':') + 3));
	if (val.length>5) {
		var ampm = val.substring(val.indexOf(':') + 3)
		if (ampm == "am") {
			if (hour == 12) {
				hour = 0;
			}
		} else {
			if (hour != 12) {
				hour = hour + 12
			}
		}
	}
	return hour * 60 + minute;
}

window.onload = function(){
	// load data immediately
	loadData({"overlap":false});

// 	// Initialize Sliders
// 	var slides = document.getElementsByTagName("input");
// 	var displayElement = document.getElementsByClassName("rangeValues")[0];
// 	var slide1 = parseInt( slides[0].value );
// 	var slide2 = parseInt( slides[1].value );
// // Neither slider will clip the other, so make sure we determine which is larger
// if( slide1 > slide2 ){ var tmp = slide2; slide2 = slide1; slide1 = tmp; }
// // slider 2 is the larger one
// var displayElement = document.getElementsByClassName("rangeValues")[0];
// 		displayElement.innerHTML = parseTimeFromMinutes(slide1) + " - " + parseTimeFromMinutes(slide2);
};

var categoryFilter = [];
function initCategoryFilters(){
	var boxes = document.getElementsByClassName("categoryCheckbox");
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
	var boxes = document.getElementsByClassName("categoryCheckbox");
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
				allBox.checked = false;
			}
		}
	}
	filterPoints();
}

var daysOfWeekFilter = [];
function initDaysOfWeekFilter(){
	var boxes = document.getElementsByClassName("daysOfWeekCheckbox");
	for (var i = 0; i < boxes.length; i++){
		var box = boxes[i];
		if (box.checked){
			daysOfWeekFilter.push(convertWeekdayAbreviations(box.name));
		}
	}
}
function convertWeekdayAbreviations(day){
	var conversions = {
		"mo" : "Monday",
		"tu" : "Tuesday",
		"we" : "Wednesday",
		"th" : "Thursday",
		"fr" : "Friday",
		"sa" : "Saturday",
		"su" : "Sunday"
	};
	return conversions[day];
}

function changeDayOfWeekFilter(checkbox){
	if (checkbox.checked){
		daysOfWeekFilter.push(convertWeekdayAbreviations(checkbox.name));
	}else{
		var index = daysOfWeekFilter.indexOf(convertWeekdayAbreviations(checkbox.name));
		if (index > -1){
			daysOfWeekFilter.splice(index, 1);
		}
	}
	filterPoints();
}

initDaysOfWeekFilter();
/*
* Called when filter button is pushed, filters to only points in the overlap
* of the two circles
*/
function filterPoints() {
	var radius1 = parseFloat(circle1.attr("r"));
	var radius2 = parseFloat(circle2.attr("r"));
	var center1 = [circle1.attr("cx"), circle1.attr("cy")];
	var center2 = [circle2.attr("cx"), circle2.attr("cy")];
	var distance = dist(center1, center2);
	var sum_radii = radius1+radius2;
	var diff_radii = Math.abs(radius1-radius2);

	if (!showCircle){
		update({"overlap":false});
		return;
	}
	if (distance < sum_radii) {
		update({"overlap":true});
	} else {
		update({"overlap":false})
	}
}

function dist(c1, c2) {
	return Math.sqrt(Math.pow(c1[0]-c2[0], 2) + Math.pow(c1[1]-c2[1], 2));
}
var allPoints;
var plottedPoints = [];
function loadData(filters) {
	// load and display the data
	d3.json("data/scpd_incidents.json", function(error, json) {
		// add circles to svg
		allPoints = json["data"];
		update({"overlap": false});
		var sliderSections = document.getElementsByClassName("range-slider");
				for( var x = 0; x < sliderSections.length; x++ ){
					var sliders = sliderSections[x].getElementsByTagName("input");
					for( var y = 0; y < sliders.length; y++ ){
						if( sliders[y].type ==="range" ){
							sliders[y].oninput = getVals;
							// Manually trigger event first time to display values
							sliders[y].oninput();
						}
					}
				}
	});

}

function update(filters) {
	plottedPoints = [];
	for (var i = 0; i < allPoints.length; i++){
		var object = allPoints[i];
		var center1 = [circle1.attr("cx"), circle1.attr("cy")];
		var center2 = [circle2.attr("cx"), circle2.attr("cy")];

		if (showCircle){
			if (!filters.overlap) break;
		// if (filters["overlap"]) {
			var dist1 = d3.geo.distance(object.Location, projection.invert(center1)) * earth_radius_mi;
			var dist2 = d3.geo.distance(object.Location, projection.invert(center2)) * earth_radius_mi;
			var radius1 = parseFloat(circle1.attr("r")) * pixelsToMiles;
			var radius2 = parseFloat(circle2.attr("r")) * pixelsToMiles;
				if (!(dist1 < radius1 && dist2 < radius2)) continue;
			}
		// }

		//does objects day of week pass filter
		var foundInDayOfWeekFilter = false;
		for (var j = 0; j < daysOfWeekFilter.length; j++){
			if (object.DayOfWeek === daysOfWeekFilter[j]){
				foundInDayOfWeekFilter = true;
				break;
			}
		}
		if (!foundInDayOfWeekFilter) continue;


		var foundInCategoryFilter = false;
		for (var jj = 0; jj < categoryFilter.length; jj++){
			if (object.Category.toLowerCase().indexOf(categoryFilter[jj].toLowerCase()) != -1){
				foundInCategoryFilter = true;
				break;
			}
		}
		if (!foundInCategoryFilter) continue;


		// var t = object.Time.substring(0, object.Time.indexOf(':'));
		var t = object.Time
		if (parseMinutesFromTime(t) < timePoints[0] || parseMinutesFromTime(t) > timePoints[1]) continue;

		plottedPoints.push(object);

	}


	var selection = svg.selectAll(".circle")
	.data(plottedPoints, function(d) {
		var id = new String(d.Description) + new String (d.IncidentNumber);
		return id;
	});

	selection.enter()
	.append("circle")
	.attr("cx", function (d) {
		return projection(d.Location)[0];
	})
	.attr("cy", function (d) { return projection(d.Location)[1]; })
	.attr("r", "2px")
	.attr("class", "circle")
	// .call(drag)
	.attr("fill", "#59c346");

	selection.exit().remove();

	circle1.moveToFront();
	circle2.moveToFront();
}

// projection is log lat to x y
// invert is x y to log lat

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

function makeCircleActive(circle){
	if (circle === circle1){
		if (document.getElementById('circleB').checked){
			document.getElementById('circleA').checked = true;
			document.getElementById('circleB').checked = false;
		}
		document.getElementById('slider').value = document.getElementById('circleA').value;
		document.getElementById('radiusSlider').innerHTML = document.getElementById('circleA').value + " mi";
	}else{
		if (document.getElementById('circleA').checked){
			document.getElementById('circleB').checked = true;
			document.getElementById('circleA').checked = false;
		}
		document.getElementById('slider').value = document.getElementById('circleB').value;
		document.getElementById('radiusSlider').innerHTML = document.getElementById('circleB').value + " mi";
	}
}

var showCircle;
function enableCircles(val){
	showCircle = val.checked;
	if (val.checked){
		document.getElementById('circle1_id').style.visibility = "visible";
		document.getElementById('circle2_id').style.visibility = "visible";
	}else{
		document.getElementById('circle1_id').style.visibility = "hidden";
		document.getElementById('circle2_id').style.visibility = "hidden";
	}
	filterPoints();
}

var circle1;
var drag1 = d3.behavior.drag()
.on('dragstart', function() {
	filterPoints();
	makeCircleActive(circle1);
})
.on('drag', function() { circle1.attr('cx', d3.event.x)
.attr('cy', d3.event.y);
filterPoints();})
.on('dragend', function() {filterPoints();});

var circle2;
var drag2 = d3.behavior.drag()
.on('dragstart', function() {
	filterPoints();
	makeCircleActive(circle2);

})
.on('drag', function() { circle2.attr('cx', d3.event.x)
.attr('cy', d3.event.y);
filterPoints();})
.on('dragend', function() {filterPoints();});


function radioButton(value){
	if (value === 1){
		makeCircleActive(circle1);
	}else{
		makeCircleActive(circle2);
	}
}


aa = [-122.490402, 37.786453];
bb = [-122.389809, 37.72728];
var earth_radius_mi = 3959;
pixel_dist = dist(projection(aa), projection(bb));
geo_dist = d3.geo.distance(aa, bb) * earth_radius_mi;
var pixelsToMiles = geo_dist / pixel_dist;
var milesToPixels = pixel_dist / geo_dist;

rad = document.querySelector('#radiusSlider').value;

circle1 = svg.selectAll("dragPoint")
.data([aa]).enter()
.append("circle")
.attr("cx", function (d) {
	return projection(d)[0];
})
.attr("cy", function (d) { return projection(d)[1]; })
.attr("r", (parseFloat(rad) * milesToPixels) + "px")
.attr("id", "circle1_id")
.call(drag1)
.attr("fill", "none")
.style("stroke", "#1d7aed")
.style("fill", "gray")
.style("fill-opacity", 0.4)
.style("visibility", "hidden")
.style("stroke-width", 2);

circle2 = svg.selectAll("dragPoint")
.data([bb]).enter()
.append("circle")
.attr("cx", function (d) {
	return projection(d)[0];
})
.attr("cy", function (d) { return projection(d)[1]; })
.attr("r", (parseFloat(rad) * milesToPixels) +"px")
.attr("id", "circle2_id")
.call(drag2)
.attr("fill", "none")
.style("stroke", "#1d7aed")
.style("fill", "gray")
.style("fill-opacity", 0.4)
.style("visibility", "hidden")
.style("stroke-width", 2);
