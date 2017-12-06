// Set up global vars
var vehicleTypes = [];
var markersArray = [];
var markersTrains = [];
var markersNSWTrains = [];
var markersLight = [];
var markersFerries = [];
var markersBuses = [];
var camMarkers = [];
var lastTrainsIds = [];
var lastNSWTrainsIds = [];
var lastLightIds = [];
var lastFerriesIds = [];
var lastBusesIds = [];
var vehicleInfoTimer;
var currentStops = [];
var routeLine;
var map;
var callNum = 0;
var focusLoc;

// Start the map, randomize the tab icon, check we have connection to the server, randomize map style
// And make sure we are showing the main panel
initMap();
randomizeFavicon();
checkOperations();
randomizeMapStyle();
toMain();

// Start the map, center and zoom on Sydney
function initMap () {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: new google.maps.LatLng(-33.85, 151.2),
    disableDefaultUI: true
  });
}

// Randomly pick a tab icon
function randomizeFavicon () {
  icon = Math.floor(Math.random() * 4) + 1;
  image = document.querySelector("link[rel='shortcut icon']");
  if (icon == 1) {image.href = "assets/img/iconB.png";}
  if (icon == 2) {image.href = "assets/img/iconF.png";}
  if (icon == 3) {image.href = "assets/img/iconL.png";}
  if (icon == 4) {image.href = "assets/img/iconT.png";}
}

// First check if the data was updated today then check if we have a connection to the server
function checkOperations () {
  d = new Date();
  stringDate = d.getDate() + " " + (d.getMonth() + 1) + " " + d.getFullYear();
  if (stringDate != lastUpdate) {
    throwError("Today is " + stringDate + ". Data was last updated " + lastUpdate + ". Please run the update tool or continue onto the program where some functionality may not work properly");
  }
  else {
    console.log("Data is up to date!");
  }
  callAPI("ping");
}

// Pick a random style and get the JSON for it
function randomizeMapStyle () {
  styles = ["aubergine", "clean", "dark", "night", "original", "paper", "retro", "subtle"];
  callAPI("getJSON," + styles[Math.floor(Math.random()*styles.length)]);
}

// This is all ugly but neccessary
// If we press down on a button, give it an inner shadow
function depressed (dom) {dom.style.boxShadow = "inset 0px 3px 10px 2px rgba(0,0,0,0.5)";}
// If we stop or leave, return to normal
function unpressed (dom) {dom.style.boxShadow = "0px 3px 10px 0px rgba(0,0,0,0.5)";}
// Get all the elements, then if we press, run depressed, if we leave, run unpressed
// If we mouse up, run relevent function
statusDOM = document.getElementById("to-status");
customDOM = document.getElementById("to-custom");
vehiclesDOM = document.getElementById("to-vehicles");
main1DOM = document.getElementById("to-main1");
main2DOM = document.getElementById("to-main2");
main3DOM = document.getElementById("to-main3");
main4DOM = document.getElementById("to-main4");
statusDOM.onmousedown = function(){depressed(statusDOM)};
statusDOM.onmouseout = function(){unpressed(statusDOM)};
statusDOM.onmouseup = toStatus;
customDOM.onmousedown = function(){depressed(customDOM)};
customDOM.onmouseout = function(){unpressed(customDOM)};
customDOM.onmouseup = toCustom;
vehiclesDOM.onmousedown = function(){depressed(vehiclesDOM)};
vehiclesDOM.onmouseout = function(){unpressed(vehiclesDOM)};
vehiclesDOM.onmouseup = toVehicles;
main1DOM.onmousedown = function(){depressed(main1DOM)};
main1DOM.onmouseout = function(){unpressed(main1DOM)};
main1DOM.onmouseup = toMain;
main2DOM.onmousedown = function(){depressed(main2DOM)};
main2DOM.onmouseout = function(){unpressed(main2DOM)};
main2DOM.onmouseup = toMain;
main3DOM.onmousedown = function(){depressed(main3DOM)};
main3DOM.onmouseout = function(){unpressed(main3DOM)};
main3DOM.onmouseup = toMain;
main4DOM.onmousedown = function(){depressed(main4DOM)};
main4DOM.onmouseout = function(){unpressed(main4DOM)};
main4DOM.onmouseup = toMain;
// Hide other panels and restore main, also, clear info
function toMain () {panelStatus("none"); panelCustom("none"); panelVehicles("none");
panelInfo("none"); panelMain("block"); clearInfo();}
// Otherwise hide main and show a specific panel
function toStatus () {panelStatus("block"); panelMain("none");}
function toCustom () {panelCustom("block"); panelMain("none");}
function toVehicles () {panelVehicles("block"); panelMain("none");}
function toInfo () {panelInfo("block"); panelMain("none");}
function panelMain (io) {document.getElementById("panel-main").style.display = io;}
function panelInfo (io) {document.getElementById("panel-info").style.display = io;}
function panelVehicles (io) {document.getElementById("panel-vehicles").style.display = io;}
function panelStatus (io) {document.getElementById("panel-status").style.display = io;}
function panelCustom (io) {document.getElementById("panel-custom").style.display = io;}