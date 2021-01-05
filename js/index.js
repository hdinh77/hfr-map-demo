/**
       * Action code to handle the result of onclick.  
       * Note, a timeout is needed between clicks to prevent capturing 
       * double-click events.  I expected this to be implemented by 
       * Google, but it's been years, and no support.
       */
function lluvAtClick(obj) {
    console.log(obj);
    var pfx = "";
    if (document.getElementById('hourly').checked == true) {
        pfx = "Hourly";
    } else {
        pfx = "Averaged";
    }

    var multiplier = getUnitMultiplier();
    var unit = getFormValueColorbar('select_unit');

    alert('Latitude: ' + obj.lat + ', Longitude: ' + obj.lng + '\n' + 'Current Vector: U: ' + Number.parseFloat(obj.u / multiplier).toPrecision(3) + unit + ', V: ' + Number.parseFloat(obj.v / multiplier).toPrecision(3) + unit + '\n PFX: ' + pfx + ', Resolution: ' + getFormValueProducts('select_res'));
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
    console.log(ts + ", " + d);
    frm["ts"].disabled = false;
    frm["ts"].value = d.gmstrftime("%m-%d-%Y %H:%M:%S UTC");
    console.log(frm["ts"].value);
    frm["ts"].disabled = true;
}

/**
 * Example accessor for updating time without extending 
 * beyong most recent available.
 */
function incrementTime(dt) {
    ts = overlay.getLatestTimestamp();
    console.log("timestamp: " + overlay.getTimestamp());
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
    changeUnit();
}

/**
   * Center the map at given latitude/longitude
   */

function setCoordinates() {
    var frm = document.forms['coordinates'];
    if (!frm) {
        return null;
    }

    console.log("(" + frm['lat'].value + ", " + frm['long'].value + ")");

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

function displayVectorInfo(obj) {
    console.log(obj);
    var pfx = "";
    if (document.getElementById('hourly').checked == true) {
        pfx = "Hourly";
    } else {
        pfx = "Averaged";
    }

    var multiplier = getUnitMultiplier();
    var unit = getFormValueColorbar('select_unit');

    document.getElementById("curVectorInfo").style.display = "block";
    document.getElementById("curCoord").innerHTML = '(' + obj.lat + ', ' + obj.lng + ')';
    document.getElementById("curVector").innerHTML = '(' + unit + '): u: ' + Number.parseFloat(obj.u / multiplier).toPrecision(3) + ', v: ' + Number.parseFloat(obj.v / multiplier).toPrecision(3);
    document.getElementById("curPFX").innerHTML = pfx;
    document.getElementById("curRes").innerHTML = getFormValueProducts('select_res');
}

function hideVectorInfo() {
    document.getElementById("curVectorInfo").style.display = "none";
}