'use strict';
let google_maps, Street;
console.log("Defining initMap...");
async function initMap() {
    console.log("initMap is called");
    const initialLocation = {lat: -34.397, lng: 150.644};

    google_maps = new google.maps.Map(document.getElementById('map'), {
        center: initialLocation,
        zoom: 8
    });

    Street = new google.maps.StreetViewPanorama(
        document.getElementById('street-view'), {
            position: initialLocation,
            pov: {
                heading: 34,
                pitch: 10
            }
        }
    );

    google_maps.setStreetView(Street);
}

//
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("commandButton").onclick = function () {
        document.getElementById("Popup_test").style.display = 'block';
    };
});

function submitCommand() {
    const command = document.getElementById("commandInput").value;
    document.getElementById("Popup_test").style.display = 'none';
}