// When we check the box to display cameras
function showCams () {
  // For each camera in the file we generated of cameras
  for (i = 0; i < trafficCams.length; i++) {
    // Change the arrow direction depending on cardinal direction
    if (trafficCams[i][3] == "N") {rotation = 0;}
    if (trafficCams[i][3] == "E") {rotation = 90;}
    if (trafficCams[i][3] == "S") {rotation = 180;}
    if (trafficCams[i][3] == "W") {rotation = 270;}
    // Get the color, opacity and scale from the customize panel
    color = document.getElementById("cams-color").value;
    opacity = parseFloat(document.getElementById("cams-opacity").value);
    scale = parseFloat(document.getElementById("cams-scale").value);
    // Make an icon based on those options
    icon = {
      path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
      strokeColor: color,
      rotation: rotation,
      scale: 2
    }
    // Make a marker with position from file and make it clickable
    marker = new google.maps.Marker({
      position: {lat: parseFloat(trafficCams[i][0][1]), lng: parseFloat(trafficCams[i][0][0])},
      map: map,
      icon: icon,
      clickable: true,
      title: String(trafficCams[i][1]),
      opacity: opacity
    });
    // When we open the window, show an image with the url of the camera from the file
    marker.info = new google.maps.InfoWindow({
      content: "<img src='" + trafficCams[i][2] + "'/>"
    });
    // When we click on the marker, open the window
    (function (marker) {
      google.maps.event.addListener(marker, "click", function (e) {
        marker.info.open(map, marker);
      });
    })(marker);
    camMarkers.push(marker);
  }
  document.getElementById("cam-count").innerHTML = camMarkers.length;
}

// When we uncheck the box in the options
function hideCams () {
  for (i = 0; i < camMarkers.length; i++) {
    camMarkers[i].setMap(null);
  }
  camMarkers = [];
  document.getElementById("cam-count").innerHTML = 0;
}

// Decide whether we checked or unchecked the box and run the correct function
function toggleCams () {
  if (camMarkers.length > 0) {hideCams();}
  else {showCams();}
}