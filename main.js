var map;
var kmlParser;
var markerIMG1 = 'imgs/hexa1.png';
var markerIMG2 = 'imgs/hexa2.png';
var markerIMG3 = 'imgs/hexa3.png';
//var markerIMG2 = 'glyphicons_021_snowflake.png';
var deptList = [];
var initPos = {lat: 45.317723, lng: 5.4372395, zoom:8}

function initialize() {
	$.getJSON( "mapStyle.json", function( data ) {
		var mapOptions = {
		  center: { lat:initPos.lat, lng: initPos.lng},
		  zoom: initPos.zoom,
		  minZoom: 6,
		  maxZoom: 14,
		  mapTypeId: 'northsidedownmap',
		  mapTypeControl: false,
		  streetViewControl: false
		};
		var style = data;
		var styledMapOptions = {
			name: 'Custom Style'
		};
		var customMapType = new google.maps.StyledMapType(style, styledMapOptions);
		
		
		map = new google.maps.Map(document.getElementById('map-canvas'),
			mapOptions);
			
		map.mapTypes.set('northsidedownmap', customMapType);

		  
		// K M L
		kmlParser = new geoXML3.parser({
			map: map,
			singleInfoWindow:true,
			suppressInfoWindows:true,
			zoom:false,
			afterParse:afterParseHandler
		});
		var deptdir = 'layers/departements/';
		
		kmlParser.parse([deptdir+'69.kml',deptdir+'42.kml',deptdir+'01.kml',deptdir+'74.kml',
		deptdir+'73.kml',deptdir+'38.kml',deptdir+'26.kml',deptdir+'07.kml']);
		
		function afterParseHandler(doc){
			console.log(doc);
			doc.forEach(function(element){
				// populate the dept List
				deptList.push(element.placemarks[0]);
				// add reference to the dept which the poly belongs to
				element.gpolygons[0].deptId = element.placemarks[0].id;
				// initial alpha value
				element.gpolygons[0].setOptions({fillOpacity: 0.3});
				// add mouse event handlers for polygons
				addMouseEventHandlers(element.gpolygons[0]);
			});
			unselectAllDept();
		}
		  

		loadMarkers();

	});
}

function addMouseEventHandlers(poly) {
	google.maps.event.addListener(poly,"mouseover",function() {
	  //poly.setOptions({fillColor: "#0000FF", strokeColor: "#0000FF"});
	  lightPoly(poly);
	});
	google.maps.event.addListener(poly,"mouseout",function() {
	  //poly.setOptions({fillColor: "#FF0000", strokeColor: "#FF0000", fillOpacity: 0.3});
	  if(!getDeptFromPoly(poly).selected)
	  	  unlightPoly(poly);
	});
	google.maps.event.addListener(poly,"click",function() {
	  //poly.setOptions({fillColor: "#0000FF", strokeColor: "#0000FF"});
	  //map.panToBounds(poly.bounds);
	  map.panTo(poly.bounds.getCenter());
	  //map.fitBounds(poly.bounds);
	  map.setZoom(9);
	  //dropMarkers(getMarkersFromDept(poly.deptId));
	  showMarkers(getMarkersFromDeptId(poly.deptId));
	  selectDept(getDeptFromPoly(poly));
	  openMenuSection(getDeptFromPoly(poly));
	});
} 

// list of markers currently displayed
var currentMarkers = [];
// complete markers list from json
var markerList = [];

function dropMarkers(markers) {
  for (var i = 0; i < markers.length; i++) {
	//setTimeout(function() {
	  addMarker(markers[i]);
	//}, i * 50);
  }
}
function showMarkers(markers) {
	hideAllMarkers();
	for (var i = 0; i < markers.length; i++) {
	  markers[i].setVisible(true);
	}
}
function hideAllMarkers() {
	for (var i = 0; i < currentMarkers.length; i++) {
	  currentMarkers[i].setVisible(false);
	}
}

function showAllMarkers(){
	for (var i = 0; i < currentMarkers.length; i++) {
	  currentMarkers[i].setVisible(true);
	}
}

function resetMapPos(){
	map.setZoom(initPos.zoom);
	map.panTo({ lat:initPos.lat, lng: initPos.lng});	
}

var infowindow = new google.maps.InfoWindow({
  content: "",
  disableAutoPan:true
});

function addMarker(marker) {
  currentMarkers.push(new google.maps.Marker(marker));
  

  google.maps.event.addListener(currentMarkers[currentMarkers.length-1], 'mouseover', function() {
  	infowindow.setContent(this.name);
    infowindow.open(map,this);
  });
  google.maps.event.addListener(currentMarkers[currentMarkers.length-1], 'mouseout', function() {
    infowindow.close();
  });
  google.maps.event.addListener(currentMarkers[currentMarkers.length-1], 'click', function() {
  	map.panTo(this.getPosition());
	map.setZoom(11);
  });
}

function loadMarkers(){
	$.getJSON( "markers.json", function( markerData ) {
		markerData.forEach(function(rawMarker){
			var markerIcon;
			switch(rawMarker.cat){
				case 1 :markerIcon = markerIMG1;break;
				case 2 :markerIcon = markerIMG2;break;
				case 3 :markerIcon = markerIMG3;break;
				default: markerIcon = markerIMG1;break;	
			}
			markerList.push(
				{
				  position: new google.maps.LatLng(rawMarker.lat,rawMarker.long),
				  map: map,
				  title: rawMarker.label,
				  icon: markerIcon,
				  //animation: google.maps.Animation.DROP,
				  dept: rawMarker.dept,
				  cat: rawMarker.cat,
				  name: rawMarker.name,
				  visible: false
				});
		});
		dropMarkers(markerList);
		populateMenuWithMarkerInfo();
	});
}

function getMarkersFromDeptId(deptId){
	var res = [];
	for (var k = 0; k < currentMarkers.length; k++) {
		//console.log(markerList[k].dept);
		if(currentMarkers[k].dept === deptId)
			res.push(currentMarkers[k])
	}
	return res;
}
function getDeptFromPoly(poly){
	for (var k = 0; k < deptList.length; k++) {
		if(deptList[k].id == poly.deptId)
			return deptList[k];
	}
	return null
}
function getPolyFromDept(dept){
	return dept.polygon;	
}

function getDeptFromId(id){
	for (var k = 0; k < deptList.length; k++) {
		if(deptList[k].id == id)
			return deptList[k];
	}
	return null	
}

function unselectAllDept(){
	deptList.forEach(function(dept){
		dept.selected = false;
		unlightPoly(getPolyFromDept(dept));
	});
}

function selectDept(dept){
	unselectAllDept();
	dept.selected = true;
	lightPoly(getPolyFromDept(dept));
}

function lightPoly(poly){
	poly.setOptions({fillOpacity: 0.6});	
}
function unlightPoly(poly){
	poly.setOptions({fillOpacity: 0.3});
}

function centerMapOnDept(dept){
	  map.panTo(dept.polygon.bounds.getCenter());
	  map.setZoom(9);
}

function getMarkerFromName(name){
	for (var k = 0; k < currentMarkers.length; k++) {
		if(currentMarkers[k].name == name)
			return currentMarkers[k];
	}
	return null	
}

google.maps.event.addDomListener(window, 'load', initialize);


// G U I

function populateMenuWithMarkerInfo(){
	for (var k = 0; k < markerList.length; k++) {
		switch(markerList[k].dept){
			case "69" :
				$("#rhone").next().children("ul").prepend('<li class=cat-'+markerList[k].cat+'>'+markerList[k].name+'</li>');
			break;
			case "42" :
				$("#loire").next().children("ul").prepend('<li class=cat-'+markerList[k].cat+'>'+markerList[k].name+'</li>');
			break;
			case "01" :
				$("#ain").next().children("ul").prepend('<li class=cat-'+markerList[k].cat+'>'+markerList[k].name+'</li>');
			break;
			case "26" :
				$("#drome").next().children("ul").prepend('<li class=cat-'+markerList[k].cat+'>'+markerList[k].name+'</li>');
			break;
			case "07" :
				$("#ardeche").next().children("ul").prepend('<li class=cat-'+markerList[k].cat+'>'+markerList[k].name+'</li>');
			break;
			case "38" :
				$("#isere").next().children("ul").prepend('<li class=cat-'+markerList[k].cat+'>'+markerList[k].name+'</li>');
			break;
			case "73" :
				$("#savoie").next().children("ul").prepend('<li class=cat-'+markerList[k].cat+'>'+markerList[k].name+'</li>');
			break;
			case "74" :
				$("#hsavoie").next().children("ul").prepend('<li class=cat-'+markerList[k].cat+'>'+markerList[k].name+'</li>');
			break;
			
			default :
			break;
		
		}
	}
	
	$(".cat-1, .cat-2, .cat-3").on("click",function(event){
		marker = getMarkerFromName($(this).text());	
		map.panTo(marker.getPosition());
	    map.setZoom(11);
	    infowindow.setContent(marker.name);
	    infowindow.open(map,marker);
	});
}

function openMenuSection(dept){
	
	accordionToggle($("#collection-dept")[0]);
	
	switch (dept.id) {
		case "69" :
			accordionToggle($("#rhone")[0]);
		break;
		case "42" :
			accordionToggle($("#loire")[0]);
		break;
		case "01" :
			accordionToggle($("#ain")[0]);
		break;
		case "26" :
			accordionToggle($("#drome")[0]);
		break;
		case "07" :
			accordionToggle($("#ardeche")[0]);
		break;
		case "38" :
			accordionToggle($("#isere")[0]);
		break;
		case "73" :
			accordionToggle($("#savoie")[0]);
		break;
		case "74" :
			accordionToggle($("#hsavoie")[0]);
		break;
		
		default :
		break;
		
	}
}
function accordionToggle(target){
  var name = target.nodeName.toUpperCase();
  
  if($.inArray(name,headers) > -1) {
    var subItem = $(target).next();
    
    //slideUp all elements (except target) at current depth or greater
    var depth = $(subItem).parents().length;
    var allAtDepth = $(".accordion p, .accordion div").filter(function() {
      if($(this).parents().length >= depth && this !== subItem.get(0)) {
        return true; 
      }
    });
    $(allAtDepth).slideUp("fast");
    subItem.slideDown("fast",function() {
        //$(".accordion :visible:last").css("border-radius","0 0 10px 10px");
    });
  }	
}


$( document ).ready(function() {
		
	$("#collection-ra").on("click",function(event){
		unselectAllDept();
		resetMapPos();
		showAllMarkers();	
	});
	$("#rhone").on("click",function(event){
		unselectAllDept();
		showMarkers(getMarkersFromDeptId("69"));
		var dept = getDeptFromId("69");
		selectDept(dept);	
		centerMapOnDept(dept);
	});
	$("#loire").on("click",function(event){
		unselectAllDept();
		showMarkers(getMarkersFromDeptId("42"));
		var dept = getDeptFromId("42");
		selectDept(dept);	
		centerMapOnDept(dept);
	});
	$("#ain").on("click",function(event){
		unselectAllDept();
		showMarkers(getMarkersFromDeptId("01"));
		var dept = getDeptFromId("01");
		selectDept(dept);	
		centerMapOnDept(dept);
	});
	$("#drome").on("click",function(event){
		unselectAllDept();
		showMarkers(getMarkersFromDeptId("26"));
		var dept = getDeptFromId("26");
		selectDept(dept);	
		centerMapOnDept(dept);
	});
	$("#ardeche").on("click",function(event){
		unselectAllDept();
		showMarkers(getMarkersFromDeptId("07"));
		var dept = getDeptFromId("07");
		selectDept(dept);	
		centerMapOnDept(dept);
	});
	$("#isere").on("click",function(event){
		unselectAllDept();
		showMarkers(getMarkersFromDeptId("38"));
		var dept = getDeptFromId("38");
		selectDept(dept);	
		centerMapOnDept(dept);
	});
	$("#savoie").on("click",function(event){
		unselectAllDept();
		showMarkers(getMarkersFromDeptId("73"));
		var dept = getDeptFromId("73");
		selectDept(dept);	
		centerMapOnDept(dept);
	});
	$("#hsavoie").on("click",function(event){
		unselectAllDept();
		showMarkers(getMarkersFromDeptId("74"));
		var dept = getDeptFromId("74");
		selectDept(dept);	
		centerMapOnDept(dept);
	});

});
