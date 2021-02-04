// index.js for hfr-map-demo

window.addEventListener('load', (event) => {
    console.log('page is fully loaded');
});

/**
 * Action code to handle the result of onclick.  
 * Note, a timeout is needed between clicks to prevent capturing 
 * double-click events.
 */
function lluvAtClick(obj) {
    var pfx = "";
    if (document.getElementById('hourly').checked == true) {
        pfx = "Hourly";
    } else {
        pfx = "Averaged";
    }

    var multiplier = getUnitMultiplier();
    var unit = getFormValueColorbar('select_unit');

    alert('Latitude: ' + obj.lat + ', Longitude: !' + obj.lng + '\n' + 'Current Vector: U: ' + Number.parseFloat(obj.u / multiplier).toPrecision(3) + unit + ', V: ' + Number.parseFloat(obj.v / multiplier).toPrecision(3) + unit + '\n PFX: ' + pfx + ', Resolution: ' + getFormValueProducts('select_res'));
}

function displayDate() {
    var date = new Date();
    document.getElementById("date").innerHTML = date.toDateString();
}

/**
 * Display the current and UTC time and set interval
 */
function displayCurTime() {
    var date = new Date();
    var abbrev = String(String(date).split("(")[1]).split(")")[0];
    document.getElementById("cur-time").innerHTML = date.toLocaleTimeString() + " (" + abbrev + ")";
}

function displayUTCTime() {
    var date = new Date();
    var ifZeroSec = "";
    var ifZeroMin = "";
    var ifZeroHour = "";
    if (date.getUTCSeconds() < 10) {
        ifZeroSec = "0";
    }
    if (date.getUTCMinutes() < 10) {
        ifZeroMin = "0";
    }
    if (date.getUTCHours() < 10) {
        ifZeroHour = "0";
    }
    document.getElementById("utc-time").innerHTML = "  " + ifZeroHour + date.getUTCHours() + ":" + ifZeroMin + date.getUTCMinutes() + ":" + ifZeroSec + date.getUTCSeconds() + " (GMT)";   
}

/**
 * Just something to show the user what time is being displayed.
 */
function displayTimestamp(ts) {
    var frm = document.forms["timestep"];
    var d = new Date(Number(ts) * 1000);
    frm["ts"].disabled = false;
    frm["ts"].value = d.gmstrftime("%m-%d-%Y %H:%M:%S UTC");
    frm["ts"].disabled = true;
}

/**
 * Example accessor for updating time without extending 
 * beyong most recent available.
 */
function incrementTime(dt) {
    ts = overlay.getLatestTimestamp();
    overlay.setTimestamp(Math.min(ts, overlay.getTimestamp() + dt));
}

/**
 * Get the form value of colorbar
 */
function getFormValueColorbar(field) {
    var frm = document.forms['colorbar'];
    if (!frm[field]) {
        return null;
    }
    if (typeof (frm[field].value) != "undefined") {
        return frm[field].value;
    }
    if (frm[field].length != "undefined") {
        for (var i = 0, n = frm[field].length; i < n; i++) {
            if (frm[field][i].checked) {
                return frm[field][i].value;
            }
        }
    }
    return null;
}

/**
 * Get the form value of PFX
 */
function getFormValueProducts(field) {
    var frm = document.forms['products'];
    if (!frm[field]) {
        return null;
    }
    if (typeof (frm[field].value) != "undefined") {
        return frm[field].value;
    }
    if (frm[field].length != "undefined") {
        for (var i = 0, n = frm[field].length; i < n; i++) {
            if (frm[field][i].checked) {
                return frm[field][i].value;
            }
        }
    }
    return null;
}

/**
 * Get the form value of something else
 */
function getFormValue(field) {
    var frm = document.forms['something'];
    if (!frm[field]) {
        return null;
    }
    if (typeof (frm[field].value) != "undefined") {
        return frm[field].value;
    }
    if (frm[field].length != "undefined") {
        for (var i = 0, n = frm[field].length; i < n; i++) {
            if (frm[field][i].checked) {
                return frm[field][i].value;
            }
        }
    }
    return null;
}


/**
 * Accessors for updating rtv configuration
 */

function setProducts() {
    var hourlyChecked = document.getElementById('hourly').checked;
    if (hourlyChecked) {
        overlay.setAveraged(false);
        overlay.setHourly(true);
    } else {
        overlay.setHourly(false);
        overlay.setAveraged(true);
    }
}

function changeResolution() {
    overlay.setResolution(getFormValueProducts('select_res'));
}

function getUnitMultiplier() {
    var curUnit = getFormValueColorbar('select_unit');

    if (curUnit == 'm/s') {
        return 100;
    } else if (curUnit == 'kph') {
        return 27.77777778;
    } else if (curUnit == 'kts') {
        return 51.44444444;
    } else if (curUnit == 'mph') {
        return 44.70400;
    } else if (curUnit == 'ft/s') {
        return 30.48;
    } else if (curUnit == 'in/s') {
        return 2.54;
    }

    return 1;
}

function changeUnit() {
    var img = document.getElementById("colorbar");
    var curUnit = getFormValueColorbar('select_unit');
    document.getElementById('unit-text').innerHTML = curUnit;

    img.src = overlay.getColorbarUrl().replace('cm/s', curUnit);
}

function changeColorScheme() {
    overlay.setColorScheme(getFormValueColorbar('colors'));
    changeUnit();
}

function changeColorRange() {
    overlay.setColorRange(getFormValueColorbar('min'), getFormValueColorbar('max'));
    changeUnit();
}

/** Example colorbar url
 * https://cordc.ucsd.edu/projects/mapping/maps/img/php/cb.php?range=0,50&amp;scheme=4&amp;width=204&amp;height=15&amp;
 * padding=15,8&amp;title=Current%20Strength%20%28cm/s%29&amp;font_size=10&amp;ticks=6
 */

function doSubmitColor() {
    changeColorScheme();
    changeColorRange();
}

function changeOceanColor() {
    var num = document.getElementById("oceancolorrange").value;
    document.getElementById("oceancolorbar").innerHTML = num;
    var color;
    if(num == 0) {
        color = "background-color: rgb(0, 0, 0); font-size: 16px;";
    }else if(num == 255) {
        color = "background-color: rgb(255, 255, 255); font-size: 16px;";
    }else {
        color = "background-color: rgb(3, " + num + ", 252); font-size: 16px;";
    }
    document.getElementById("oceancolorbar").style = color;
}

/**
 * Center the map at given latitude/longitude
 */

function setCoordinates() {
    var frm = document.forms['coordinates'];
    if (!frm) {
        return null;
    }

    if (frm['lat'].value != "" && frm['long'].value != "") {
        map.setZoom(11);
        map.setCenter({
            lat: parseFloat(frm['lat'].value),
            lng: parseFloat(frm['long'].value)
        });
    }
}

function setCoordinatesHome() {
    map.setZoom(8);
    map.setCenter({ lat: 34.4, lng: -119.8 });
    var frm = document.forms['coordinates'];
    frm['lat'].value = null;
    frm['long'].value = null;
}

/*
 * Current Vector
 */

function displayVectorInfo(obj) {
    var pfx = "";
    if (document.getElementById('hourly').checked == true) {
        pfx = "Hourly";
    } else {
        pfx = "25hr Average";
    }

    var multiplier = getUnitMultiplier();
    var unit = getFormValueColorbar('select_unit');

    document.getElementById("curVectorInfo").style.display = "block";
    document.getElementById("curTitle").innerHTML = "Current Vector";
    document.getElementById("curCoord").innerHTML = 'Coordinates: (' + obj.lat + ', ' + obj.lng + ')';
    document.getElementById("curVector").innerHTML = 'Components (' + unit + '): u: ' + Number.parseFloat(obj.u / multiplier).toPrecision(3) + ', v: ' + Number.parseFloat(obj.v / multiplier).toPrecision(3);
    document.getElementById("curPFX").innerHTML = pfx;
    document.getElementById("curRes").innerHTML = ', Resolution: ' + getFormValueProducts('select_res');
    document.getElementById("stationLink").innerHTML = "";
}

function hideVectorInfo() {
    document.getElementById("curVectorInfo").style.display = "none";
}

/*
 * Stations
 */

function displayStationNetworkCount() {
    document.getElementById("stationCount").innerHTML = overlay.getStationCount();
    document.getElementById("networkCount").innerHTML = overlay.getNetworkCount();
}

/* Loading stations first time */
function loadStations() {
    stations = overlay.getStations();
    networks = overlay.getNetworks();
    
    var yellow = (new Date()).getTime() / 1000 - 86400; //  24 hours old.
    var red = (new Date()).getTime() / 1000 - 172800; // 2 days old.
    var white = (new Date()).getTime() / 1000 - 604800; // 7 days old

    
    for(var i = 0; i < stations.length; i++){
        var cur = overlay.getStation(stations[i]);
        if(!+cur.time) {
            stationMarkers[i] = null;
            continue;
        }

        var curTime = cur.time;
        var colorURL = "images/location-icon-" + (curTime < white ? "white" : (curTime < red ? "red" : (curTime < yellow ? "yellow" : "green"))) + ".svg";

        stationMarkers[i] = new google.maps.Marker({
            map,
            position: { lat: parseFloat(cur.lat),
                        lng: parseFloat(cur.lon)}, 
            icon: new google.maps.MarkerImage(colorURL, null, null, null,
              new google.maps.Size(28, 26)
            ),
        });

        markerBindInfo(stationMarkers[i], cur);
    }
    stationsLoaded = true;
}

function displayStationInfo(obj) {
    document.getElementById("curVectorInfo").style.display = "block";
    document.getElementById("curTitle").innerHTML = obj.staname + " (" + obj.sta + ")";
    document.getElementById("curCoord").innerHTML = "Coordinates: (" + Number.parseFloat(obj.lat).toFixed(4) + ", " + Number.parseFloat(obj.lon).toFixed(4) + ")";
    document.getElementById("curVector").innerHTML = "Affliation: " + overlay.getNetwork(obj.net)[1] + " (" + overlay.getNetwork(obj.net)[0] + ")";
    let diff = Math.floor(Date.now() / 1000) - parseFloat(obj.time);
    let hour = Math.floor(diff / 3600);
    if(hour >= 24) {
        document.getElementById("curPFX").innerHTML = "Age: " + Math.floor(hour / 24) + " days, ";
        hour = hour % 24;
    }else {
        document.getElementById("curPFX").innerHTML = "Age: ";
    }
    diff = diff % (hour * 3600);
    let minute = Math.floor(diff / 60);
    document.getElementById("curRes").innerHTML = hour + " hours, " + minute + " minutes";
    document.getElementById("stationLink").innerHTML = "Station Diagnostics";
    document.getElementById("stationLink").href = "https://hfrnet.ucsd.edu/diagnostics/?p=sta&sta=" + obj.sta + "&net=" + obj.net + "&t=0";
    console.log(obj);
    console.log(Math.floor(Date.now() / 1000));
    console.log(parseFloat(obj.time));
    console.log(new Date(parseFloat(obj.time)).getTime());
}

/* Display station placemarks on map if checked */
function setStationPlacemarks() {
    if (document.getElementById('stationCheckmark').checked) {
        if(!stationsLoaded) loadStations();
        for (var i = 0; i < stationMarkers.length; i++) {
            if (stationMarkers[i]) {
                stationMarkers[i].setVisible(true);
            }
        }
    } else {
        for (var i = 0; i < stationMarkers.length; i++) {
            if (stationMarkers[i]) {
                stationMarkers[i].setVisible(false);
            }
        }
    }
}

/*
 * Oil Platforms
 */

function loadPlatforms() {
    platforms = getPlatforms();

    for(var i = 0; i < platforms.length; i++){
        platformMarkers[i] = new google.maps.Marker({
            map,
            position: { lat: parseFloat(platforms[i].lat),
                        lng: parseFloat(platforms[i].lng)}, 
            icon: new google.maps.MarkerImage("images/oil-platform.png", null, null, null,
              new google.maps.Size(28, 26)
            ),
        });

        platformBindInfo(platformMarkers[i], platforms[i]);
    }
    platformsLoaded = true;
}

function displayPlatformInfo(obj) {
    document.getElementById("curVectorInfo").style.display = "block";
    document.getElementById("curTitle").innerHTML = obj.name;
    document.getElementById("curCoord").innerHTML = "<span class='uk-text-muted'>SoCal Oil Platform</span>";
    document.getElementById("curVector").innerHTML = "Latitude: " + Number.parseFloat(obj.lat).toFixed(4);
    document.getElementById("curPFX").innerHTML = "Longitude: " + Number.parseFloat(obj.lng).toFixed(4);
    document.getElementById("curRes").innerHTML = "";
    document.getElementById("stationLink").innerHTML = "";
    document.getElementById("stationLink").href = "";
}


/* Display station placemarks on map if checked */
function setPlatformPlacemarks() {
    getPlatforms();
    if (document.getElementById('platformCheckmark').checked) {
        if(!platformsLoaded) loadPlatforms();
        for (var i = 0; i < platformMarkers.length; i++) {
            if (platformMarkers[i]) {
                platformMarkers[i].setVisible(true);
            }
        }
    } else {
        for (var i = 0; i < platformMarkers.length; i++) {
            if (platformMarkers[i]) {
                platformMarkers[i].setVisible(false);
            }
        }
    }
}

