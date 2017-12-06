// When we click on a map style, take in the name
function mapStyle (style) {
  // If we want to revert to the original, clear style JSON
  if (style == "original") {setStyle("");}
  // If we want to paste in our own JSON
  else if (style == "own") {
    // Save the value from the prompt
    ownJson = prompt("Find some google maps style JSON and paste it here!");
    // Try parseing and setting the style, otherwise alert the user that it's invalid
    try {
      ownJson = JSON.parse(ownJson);
      setStyle(ownJson);
    }
    catch (e) {
      throwError("That doesn't seem to be valid JSON, style has not been applied");
    }
  }
  // If we don't want the original or our own, call the api to call the server to fetch the json from the file
  else {callAPI("getJSON," + style);}
}

function setStyle (json) {
  map.setOptions({styles: json});
}

// When we change a value in the customizer
function customApply (vehicle) {
  if (vehicle == "nswtrains") {markers = markersNSWTrains;}
  if (vehicle == "sydneytrains") {markers = markersTrains;}
  if (vehicle == "ferries") {markers = markersFerries;}
  if (vehicle == "lightrail") {markers = markersLight;}
  if (vehicle == "buses") {markers = markersBuses;}
  if (vehicle == "cams") {markers = camMarkers;}
  // Get the new values
  color = document.getElementById(vehicle + "-color").value;
  opacity = document.getElementById(vehicle + "-opacity").value;
  scale = document.getElementById(vehicle + "-scale").value;
  // Go through every maker and apply the new settings
  for (i = 0; i < markers.length; i++) {
    markers[i].setOptions({'opacity': parseFloat(opacity)})
    newIcon = markers[i].icon;
    newIcon.strokeColor = color;
    newIcon.scale = parseFloat(scale);
    markers[i].setIcon(newIcon);
  }
}

// If we want the default values, fetch them and apply them
function customReset (vehicle) {
  color = document.getElementById(vehicle + "-color");
  scale = document.getElementById(vehicle + "-scale");
  opacity = document.getElementById(vehicle + "-opacity");
  color.value = color.defaultValue;
  scale.value = scale.defaultValue;
  opacity.value = opacity.defaultValue;
  // Write the "new" values to the icons
  customApply(vehicle);
}

// When we click the randomize button
function customRandom (vehicle) {
  // Randomly fetch a scale value between 0 and 5 in .5 increments
  randScale = Math.floor(Math.random() * (10 + 1)) * 0.5;
  // Randomly fetch a opacity value between 0 and 1 in .1 increments
  randOpacity = Math.floor(Math.random() * (10 + 1)) * 0.1;
  // Randomly fetch a color value between #000000 and #ffffff
  randColor = '#'+Math.random().toString(16).substr(-6);
  // Write the values to the inputs
  document.getElementById(vehicle + "-color").value = randColor;
  document.getElementById(vehicle + "-scale").value = randScale;
  document.getElementById(vehicle + "-opacity").value = randOpacity;
  // Apply the "new" values
  customApply(vehicle);
}