// Once we recieve vehicle information, populate the panel as well as call for the shape and stops
function displayVehicleData (data, vehicle, newData) {
  // There should always be at least 26 items, otherwise something went wrong
  // Wednesday should also be 0 or 1, not some other value
  if (data.length <= 25 || data[21] != "1" && data[21] != "0") {
    throwError("We recieved some strange data for that vehicle. Will not display")
  }
  else {
    // If this is a new dataset rather than a 15s update
    if (newData == "true") {
      // Pan and zoom to the vehicle
      map.setZoom(13);
      map.panTo(focusLoc);
	  // Clear whatever shape, stops and info is being displayed
      clearInfo();
      // Show the recenter button
      document.getElementById("recenter").style.display = "block";
      
      // Change the panel on the left to the info screen
      toInfo();
      // Ferry shapes are in the form XXNNNN, the shape file only has shapes in the form XX
      // So get the shape from the first two chars
      if (vehicle == "ferries") {
        callAPI("getShape," + vehicle + "," + data[11].substring(0,2));
      }
      // Otherwise get the whole shape name
      else {
        callAPI("getShape," + vehicle + "," + data[11]);
      }
      // Get the stops from our data onward (we use data next)
      callAPI("getStops," + vehicle + "," + data.slice(26, data.length));
    }
    // Our data is in a different arrangment than the display order, this list shows which items to get to be in order
    targets = [4,0,1,3,6,7,8,12,13,14,15,16,17,18,19,20,21,22,23,24,25];
    for (i = 0; i < targets.length; i++) {
      // If the data item is empty, show we don't know the value
      if (data[targets[i]] == "null") {write = "Unknown";}
      else {
        // Only show the first 6 decimals of the latitude or longitude
        if (i == 1 || i == 2) {write = data[targets[i]].substring(0,10);}
        // Convert metres per second to more recognisable kilometers per hour
        else if (i == 3) {write = parseInt(parseFloat(data[targets[i]]) * 3.6);}
        else if (i == 4) { // Trip status
          if (data[targets[i]] == 0) {write = "Incoming to stop";}
          if (data[targets[i]] == 1) {write = "At stop";}
          if (data[targets[i]] == 2) {write = "On route to next stop";}
        }
        else if (i == 5) { // Traffic
          if (data[targets[i]] == 0) {write = "Unknown";}
          if (data[targets[i]] == 1) {write = "<span class=\"text-green\">Running smoothly</span>";}
          if (data[targets[i]] == 2) {write = "<span class=\"text-orange\">Bumper to bumper</span>";}
          if (data[targets[i]] == 3) {write = "<span class=\"text-red\">Congestion</span>";}
          if (data[targets[i]] == 4) {write = "<span class=\"text-red\">Bad congestion</span>";}
        }
        else if (i == 6) { // Room left
          if (data[targets[i]] == 0) {write = "<span class=\"text-green\">Almost empty</span>";}
          if (data[targets[i]] == 1) {write = "<span class=\"text-green\">Many seats</span>";}
          if (data[targets[i]] == 2) {write = "<span class=\"text-green\">Few seats</span>";}
          if (data[targets[i]] == 3) {write = "<span class=\"text-orange\">Standing room</span>";}
          if (data[targets[i]] == 4) {write = "<span class=\"text-orange\">Little staing room</span>";}
          if (data[targets[i]] == 5) {write = "<span class=\"text-red\">Almost full</span>";}
          if (data[targets[i]] == 6) {write = "<span class=\"text-red\">No more passengers</span>";}
        }
        else if (i == 7) { // Direction
          if (data[targets[i]] == 0) {write = "Outbound";}
          if (data[targets[i]] == 1) {write = "Inbound";}
        }
        else if (i == 8) { // Wheelchair access
          if (data[targets[i]] == 0) {write = "<span class=\"text-red\">No</span>";}
          if (data[targets[i]] == 1) {write = "<span class=\"text-green\">Yes</span>";}
        }
        else if (i >= 14) { // Mon-Sun
          if (data[targets[i]] == 0) {write = "<span class=\"text-red\">No</span>";}
          if (data[targets[i]] == 1) {write = "<span class=\"text-green\">Yes</span>";}
        }
        // Otherwise show the data as is, e.g bus route number
        else {write = data[targets[i]];}
      }
      // Get every second item in the table and write out data to it
      document.getElementsByTagName("td")[(i*2)+2].innerHTML = write;
    }
    // API only sends updates every 15s, so ask for new info every 15s
    vehicleInfoTimer = setTimeout(callAPI, 15000, "getInfo," + vehicle + "," + data[9] + ",false");
  }
}

// Given an array with data of stop names and locations, show markers on map for stops
function displayStops (stopsInfo) {
  lastLoc = stopsInfo.length - 1;
  // Due to inconsistncies in the data, sometimes the first stop is the last item of the array
  // so check whether the last 2 stops distance is larger that the first and last item and if so
  // move the last item to the front, if we get more than one stop
  if (lastLoc != 0) {
    distLast2 = Math.hypot(stopsInfo[lastLoc - 1][2] - stopsInfo[lastLoc][2], stopsInfo[lastLoc - 1][3] - stopsInfo[lastLoc][3]);
    distFirstLast = Math.hypot(stopsInfo[0][2] - stopsInfo[lastLoc][2], stopsInfo[0][3] - stopsInfo[lastLoc][3]);
    if (Math.abs(distLast2) > Math.abs(distFirstLast)) {
      tempStops = stopsInfo;
      // Remake the array, put the last item first, then loop the rest on after
      stopsInfo = [stopsInfo[lastLoc]];
      for (i = 0; i < tempStops.length - 1; i++) {
        stopsInfo.push(tempStops[i]);
      }
    }
  }
  globalStopsInfo = stopsInfo;
  // Now that the array is in the right order, loop over stops and add markers to map
  for (i = 0; i < stopsInfo.length; i++) {
    // Give the marker hover text of the stop name and the streetview helper text
    marker = new google.maps.Marker({
      position: {lat: parseFloat(stopsInfo[i][2]), lng: parseFloat(stopsInfo[i][3])},
      map: map,
      label: String(i + 1),
      title: stopsInfo[i][1] + "\nClick to open location in streetview"
    });
    // When we click on the icon, go to the streetview for that item
    (function (marker, lat, lng) {
        google.maps.event.addListener(marker, "click", function (e) {
          goToStreetView(lat, lng)
        });
    })(marker, stopsInfo[i][2], stopsInfo[i][3]);
    // Push the marker to the current stops array
    currentStops.push(marker);
  }
}

// When asked to show the shape
function displayShape (points) {
  lineLocations = [];
  // Convert all the xy coords into google maps lat,lng coords
  for (i = 0; i < (points.length) / 2; i++) {
    lineLocations.push({lat: parseFloat(points[i * 2]), lng: parseFloat(points[i * 2 + 1])});
  }
  // Save it globablly so we can clear it later
  routeLine = new google.maps.Polyline({
    path: lineLocations,
    geodesic: true,
    strokeColor: "#F00",
    strokeOpacity: 1.0,
    strokeWeight: 2
  });
  // Add the line to the map
  routeLine.setMap(map);
}

// Well we can clear it now
function clearInfo () {
  // Hide recenter button
  document.getElementById("recenter").style.display = "none";
  // Stop updating info every 15s
  clearTimeout(vehicleInfoTimer);
  // If we did manage to show stops
  if (currentStops.length > 0) {
    // Remove them from the map
    for (i = 0; i < currentStops.length; i++) {
      currentStops[i].setMap(null);
    }
  }
  // If we managed to show the shape, remove it from the map
  if (routeLine != null) {
    routeLine.setMap(null);
  }
}