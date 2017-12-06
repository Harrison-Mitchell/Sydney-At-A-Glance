// The heart of the program, call the node server with a request
function callAPI (path) {
  console.log("Calling with", path);
  var returnValue = [];
  var request = new XMLHttpRequest();
  // Call the node server with the path provided, this is split up in the server to understand our request
  request.open("GET", "http://localhost:8001/" + path, true);
  // If there's an error (aka server isn't on), then alert the user to run it
  request.onerror = function(e) {
    throwError("Have you started the server? It doesn't seem to be responding... Maybe a proxy issue?");
  };
  // Wait until the server has finished our request
  request.onreadystatechange = function() {
    // If there aren't any errors then move on
    if (request.readyState == 4 && request.status == 200) {
      // | is our designated data splitter since only a sting and not arrays can be passed from the server
      returnValue = request.responseText.split("|");
      // Further split each data item into each bit of information
      for (i = 0; i < returnValue.length; i++) {
        returnValue[i] = returnValue[i].split(",");
      }
      if (path.startsWith("ping")) {
        // Ensure the server has a connection by seeing if it replies with pong
        if (returnValue[0][0] == "pong") {
          console.log("Sever responed... excellent!");
          vehicleTypes.push("gtfs/vehiclepos/nswtrains");
          vehicleTypes.push("gtfs/vehiclepos/ferries");
          // If so, finish the init
          callAPI("getStatus");
          nextCall();
        }
        // If the server doesn't respond with pong, alert the user the server isn't working
        else {
          throwError("Have you started the server? It doesn't seem to be responding... Maybe a proxy issue?");
        }
      }
      // If we asked for position updates
      else if (path.startsWith("gtfs")) {
        // Print number of vehicles
        console.log(path.split("/")[2], "has", returnValue.length - 1, "vehicles");
        // Draw the vehicles
        drawVehicles(path.split("/")[2], returnValue.slice(0, returnValue.length - 1));
      }
      // If we click on a vehicle and want to show the shape
      else if (path.startsWith("getShape")) {
        // Send the draw route function all the lat/lng points
        displayShape(returnValue[0]);
      }
      // On start, find the API statuses
      else if (path.startsWith("getStatus")) {
        deadApi = false;
        for (i = 0; i < returnValue.length - 1; i++) {
          // If this particular module's API is down, alert the user by making the API status button red
          if (returnValue[i][1] == "0") {
            document.getElementById("to-status").style.backgroundColor = "rgb(255, 230, 230)";
            // At least one API is down
            deadApi = true;
            // Add the item to the list under the API status window with relevent online indicator
            document.getElementById("statuses").innerHTML += "<div class=\"status\"><p>" + returnValue[i][0] + "</p><img src=\"assets/img/red.png\"/></div><hr/>";
          }
          else {
            document.getElementById("statuses").innerHTML += "<div class=\"status\"><p>" + returnValue[i][0] + "</p><img src=\"assets/img/green.png\"/></div><hr/>";
          }
        }
        if (deadApi) {throwError("One or more API's are down, this could impact program functionality");}
      }
      // If we click on a vehicle and need to find information about it
      else if (path.startsWith("getInfo")) {
        // Call the data display function with the data, the vehicle type and whether we are sending the data
        // for the first time
        displayVehicleData(returnValue[0], path.split(",")[1], path.split(",")[3]);
      }
      // Again, if we click on a vehicle and need the stops
      else if (path.startsWith("getStops")) {
        // We replaced commas in the trip information to underscores to stop getting split above,
        // so replace all underscores with commas to go back to what it was\
        for (i = 0; i < returnValue.length; i++) {
          returnValue[i][1] = returnValue[i][1].replace(/_/g, ',');
        }
        displayStops(returnValue);
      }
      // If we asked for JSON, pass it onto the set style function
      else if (path.startsWith("getJSON")) {
        setStyle(JSON.parse(returnValue[0].join(",")));
      }
    }
  };
  request.send();
}