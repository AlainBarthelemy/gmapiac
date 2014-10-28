 function initialize() {
        $.getJSON( "mapStyle.json", function( data ) {
			var mapOptions = {
			  center: { lat: 45.7719365, lng: 4.8873918},
			  zoom: 8,
			  mapTypeId: 'northsidedownmap'
			};
        	var style = data;
			var styledMapOptions = {
				name: 'Custom Style'
			};
			var customMapType = new google.maps.StyledMapType(style, styledMapOptions);
			
			
			var map = new google.maps.Map(document.getElementById('map-canvas'),
				mapOptions);
				
			map.mapTypes.set('northsidedownmap', customMapType);
			
			var markerIMG = 'glyphicons_019_heart_empty.png';
			var markerIMG2 = 'glyphicons_021_snowflake.png';
			
			// I . A . C .
			
			var iacLatlng = new google.maps.LatLng(45.7624347,4.8723466);
			var iacInfoContent = '<div id="content">'+
				  '<div id="siteNotice">'+
				  '</div>'+
				  '<h1 id="firstHeading" class="firstHeading">I.A.C</h1>'+
				  '<div id="bodyContent">'+
				  "<p>Institut d'Art Contemporain de Villeurbanne</p>"+
				  '<img src="http://i-ac.eu/img/thumbs_cache/600x400_janssens.jpg" class="ltn" itemprop="image" alt="">'+
				  '</div>'+
				  '</div>';
			var iacInfoWindow = new google.maps.InfoWindow({
				content: iacInfoContent,
				maxWidth: 400
			});
			
			  var iacMarker = new google.maps.Marker({
				  position: iacLatlng,
				  map: map,
				  title: 'I.A.C',
				  icon: markerIMG
			  });
			  
			  
			  
			  google.maps.event.addListener(iacMarker, 'click', function() {
				iacInfoWindow.open(map,iacMarker);
			  });
		  
			// L A R R Y  B E L L
			
			var larryLatlng = new google.maps.LatLng(45.7571436,4.7940908);
			var larryInfoContent ='<div id="content">'+
				  '<div id="siteNotice">'+
				  '</div>'+
				  '<h1 id="firstHeading" class="firstHeading">Larry Bell</h1>'+
				  '<div id="bodyContent">'+
				  "<p>Glass Series</p>"+
				  '<img style="width:100%" src="http://minimalissimo.com/wordpress/wp-content/uploads/2010/12/Larry-Bell-41.png" class="ltn" itemprop="image" alt="">'+
				  '</div>'+
				  '</div>';
			var larryInfoWindow = new google.maps.InfoWindow({
				content: larryInfoContent ,
				maxWidth: 400
			});
			
			  var larryMarker = new google.maps.Marker({
				  position: larryLatlng,
				  map: map,
				  title: 'Larry Bell',
				  icon: markerIMG2
			  });
			  
			  google.maps.event.addListener(larryMarker, 'click', function() {
				larryInfoWindow.open(map,larryMarker);
			  });
			  
			  
			  // K M L
			  var myParser = new geoXML3.parser({
			  	map: map,
			  	singleInfoWindow:true,
			  	suppressInfoWindows:true,
			  	zoom:false,
			  	afterParse:afterParseHandler
			  });
			  var deptdir = 'layers/departements/'
			  myParser.parse([deptdir+'69.kml',deptdir+'42.kml',deptdir+'01.kml',deptdir+'74.kml',
			  deptdir+'73.kml',deptdir+'38.kml',deptdir+'26.kml',deptdir+'07.kml']);
			  
			  function afterParseHandler(doc){
			  	console.log(doc);
			  	doc.forEach(function(element){
			  		// initial alpha value
			  		element.gpolygons[0].setOptions({fillOpacity: 0.3});
			  		addMouseEventHandlers(element.gpolygons[0]);
			  	});
			  	//highlightPoly(doc[0].gpolygons[0]);
			  }
			  
			  function addMouseEventHandlers(poly) {
				google.maps.event.addListener(poly,"mouseover",function() {
				  //poly.setOptions({fillColor: "#0000FF", strokeColor: "#0000FF"});
				  poly.setOptions({fillOpacity: 0.6});
				});
				google.maps.event.addListener(poly,"mouseout",function() {
				  //poly.setOptions({fillColor: "#FF0000", strokeColor: "#FF0000", fillOpacity: 0.3});
				  poly.setOptions({fillOpacity: 0.3});
				});
				google.maps.event.addListener(poly,"click",function() {
				  //poly.setOptions({fillColor: "#0000FF", strokeColor: "#0000FF"});
				  map.panToBounds(poly.bounds);
				  map.panTo(poly.bounds.getCenter());
				  //map.fitBounds(poly.bounds);
				  map.setZoom(9);
				});
			  }  
			  
			    
        });
		
      }
      google.maps.event.addDomListener(window, 'load', initialize);
      
