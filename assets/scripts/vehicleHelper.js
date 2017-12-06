// When we wish to draw vehicles
function drawVehicles (vehicle, returnValue) {
  // If the vehicle has been turned off since fetching the data, don't draw the vehicles
  if (vehicleTypes.join().indexOf(vehicle) == -1) {return;}
  ourCurrentIds = [];
  markersArray = [];
  for (i = 0; i < returnValue.length; i++) {
    ourCurrentIds.push(returnValue[i][3]);
  }
  // Get relevent data for the vehicle
  if (vehicle == "nswtrains") {ourLastIds = lastNSWTrainsIds; ourArray = markersNSWTrains;}
  if (vehicle == "sydneytrains") {ourLastIds = lastTrainsIds; ourArray = markersTrains;}
  if (vehicle == "ferries") {ourLastIds = lastFerriesIds; ourArray = markersFerries;}
  if (vehicle == "lightrail") {ourLastIds = lastLightIds; ourArray = markersLight;}
  if (vehicle == "buses") {ourLastIds = lastBusesIds; ourArray = markersBuses;}
  // Get the values for the icon settings
  color = document.getElementById(vehicle + "-color").value;
  opacity = parseFloat(document.getElementById(vehicle + "-opacity").value);
  scale = parseFloat(document.getElementById(vehicle + "-scale").value);
  // Update the number on how many vehicles there are
  document.getElementById(vehicle + "-count").innerHTML = ourCurrentIds.length;
  console.log("Last: " + ourLastIds.length + " Current: " + ourCurrentIds.length);
  toPop = [];
  // If a vehicle has finished it's route and has dropped off the list from the live API
  // AKA if an ID was there and now isn't, add it to toPop to have it removed
  // Also, remove it from the map
  for (i = 0; i < ourArray.length; i++) {
    if (ourCurrentIds.indexOf(ourArray[i].id) == -1) {
      ourArray[i].setMap(null);
      toPop.push(i);
    }
  }
  // Array indexs will break if we pop near the front and go to pop one later in the array
  // So reverse the array so we can pop from the end to the front
  // For example in a,b,c,d,e if we want to remove b and d
  // b index is 1 and d index is 3
  // If we remove b the array will now be a,c,d,e so now if we go to remove the 3rd element
  // We will be removing e and not d like originally intended
  toPop = toPop.reverse();
  for (i = 0; i < toPop.length; i++) {
    // Remove one item at the point aka pop
    ourArray.splice(toPop[i], 1);
  }
  // For all the vehicles we just got
  for (i = 0; i < returnValue.length; i++) {
    // Find it in our ID array
    idLoc = ourLastIds.indexOf(returnValue[i][3]);
    // If it's there (if it's already on the map)
    if (idLoc != -1) {
      // Get the index of it in marker array
      for (a = 0; a < ourArray.length; a++) {
        if (returnValue[i][3] == ourArray[a].id) {myIndex = a;}
      }
      // interpolate the positions, unless it's a bus, since interpolating potenially 4000 items is laggy
      if (vehicle != "buses") {interpolate(returnValue[i], ourArray[myIndex], 0);}
      // If it's a bus just put it in its new place
      else {ourArray[myIndex].setPosition(new google.maps.LatLng(returnValue[i][0], returnValue[i][1]));}
      // We wiped the marker array so we can add the fresh and current ones, but not the stale
      markersArray.push(ourArray[myIndex]);
    }
    // We have a new vehicle
    else {
      // Sydneytrains use track signals and not GPS, so their direction is unknown, so give it a dot not an arrow
      if (vehicle == "sydneytrains") {
        path = google.maps.SymbolPath.CIRCLE;
        rotation = 0;
      }
      // Otherwise give it an arrow with its direction
      else {
        path = google.maps.SymbolPath.FORWARD_CLOSED_ARROW;
        rotation = parseInt(returnValue[i][2]);
      }
      icon = {
        path: path,
        strokeColor: color,
        rotation: rotation,
        scale: scale
      }
      marker = new google.maps.Marker({
        position: new google.maps.LatLng(parseFloat(returnValue[i][0]), parseFloat(returnValue[i][1])),
        map: map,
        icon: icon,
        id: returnValue[i][3],
        opacity: opacity
      });
      marker.setClickable(true);
      // If we click on the vehicle at some point, prepare to load its info, shape and stops
      (function (marker, vehicle, lat, lng, id) {
        google.maps.event.addListener(marker, "click", function (e) {
          clicked(vehicle, lat, lng, id)
        });
      })(marker, vehicle, returnValue[i][0], returnValue[i][1], returnValue[i][3]);
      // Add the marker to the marker array
      markersArray.push(marker);
    }
  }
  // Save the data we temporarily wrote to
  if (vehicle == "nswtrains") {lastNSWTrainsIds = ourCurrentIds; markersNSWTrains = markersArray; arrayNSWTrains = returnValue;}
  if (vehicle == "sydneytrains") {lastTrainsIds = ourCurrentIds; markersTrains = markersArray; arrayTrains = returnValue;}
  if (vehicle == "ferries") {lastFerriesIds = ourCurrentIds; markersFerries = markersArray; arrayFerries = returnValue;}
  if (vehicle == "lightrail") {lastLightIds = ourCurrentIds; markersLight = markersArray; arrayLight = returnValue;}
  if (vehicle == "buses") {lastBusesIds = ourCurrentIds; markersBuses = markersArray; arrayBuses = returnValue;}
}

// If we uncheck the box for a vehicle
function clearVehicles (vehicle) {
  // Get that vehicle types' data
  if (vehicle == "nswtrains") {markers = markersNSWTrains; lastNSWTrainsIds = [];}
  if (vehicle == "sydneytrains") {markers = markersTrains; lastTrainsIds = [];}
  if (vehicle == "ferries") {markers = markersFerries; lastFerriesIds = [];}
  if (vehicle == "lightrail") {markers = markersLight; lastLightIds = [];}
  if (vehicle == "buses") {markers = markersBuses; lastBusesIds = [];}
  // Remove all the markers from the map
  for (i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  // Clear the marker array
  markers = [];
  // Tell the user no vehicles of its type is being shown
  document.getElementById(vehicle + "-count").innerHTML = 0;
}