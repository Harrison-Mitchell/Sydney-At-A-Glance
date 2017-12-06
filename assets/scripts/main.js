// Continually loop through wanted vehicles and dispurse location updates
function nextCall () {
  callNum++;
  if (callNum > vehicleTypes.length) {
    callNum = 0;
  }
  else {
    callAPI(vehicleTypes[callNum - 1]);
  }
  // Positions only update so often, disperse calls
  // If we have one vehicle, update every 20s
  // If we have two vehicles, update every 10s, but each vehicle will still only be updated every 20s
  setTimeout(nextCall, 20000 / vehicleTypes.length);
}

// If we select or deselect a vehicle to be shown on the map
function vehicleTypesChanged (element) {
  base = "gtfs/vehiclepos/";
  // If we have enabled a vehicle, add it to the vehicleTypes array
  // Otherwise, delete all vehicles that were on the map
  id = element.id.replace("Check", "").toLowerCase();
  if (element.checked) {
    vehicleTypes.push(base + id);
    callAPI(base + id);
  }
  else {
    vehicleTypes.splice(vehicleTypes.indexOf(base + id), 1);
    clearVehicles(id);
  }
  console.log(vehicleTypes);
}

// Smoothly move vehicles between position updates
function interpolate (newPos, old, stop) {
  stop++;
  oldPos = old.getPosition();
  // Get the newLat - oldLat (the distance) divide by ten (every step/stop) then multiply by how many stops
  // The 5th stop will be new - old / 2
  newLat = oldPos.lat() + ((parseFloat(newPos[0]) - oldPos.lat()) / 10 * stop);
  newLng = oldPos.lng() + ((parseFloat(newPos[1]) - oldPos.lng()) / 10 * stop);
  old.setPosition(new google.maps.LatLng(newLat, newLng));
  // Loop 10 times for 10 frames of animation
  if (stop < 10) {setTimeout(interpolate, 100, newPos, old, stop)};
}

// When we click on a vehicle, fetch the info for that vehicle
function clicked (vehicle, lat, lng, id) {
  // Will we have data on it?
  if (!id.startsWith("NonTimetabled")) {
    callAPI("getInfo," + vehicle + "," + id + ",true");
    focusLoc = new google.maps.LatLng(lat, lng);
  }
  else {
    throwError("This vehicle is not timetabled and thus, will have no shape or stop data.")
  }
}

function recenter () {
  // When we click on the recenter button, pan and zoom to the focused vehicle
  map.panTo(focusLoc);
  map.setZoom(15);
}

// When we click on a stop, open it in streetview
function goToStreetView (lat, lng) {
  // Googlestreet view links are in the form https://maps.google.com/maps?q=&layer=c&cbll=LONG,LAT
  // This needs to be in a different function because otherwise any stop clicked on would just link to the last
  window.open('https://maps.google.com/maps?q=&layer=c&cbll=' + lat + "," + lng, '_blank');
}

// If we encounter an error, run an alert for it
function throwError (str) {alert(str);}