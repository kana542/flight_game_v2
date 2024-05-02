// GLOBAALIT MUUTTUJAT
let currentRound = 0;
const maxRounds = 5;

let tempMarker = null;
let markerLocation = null;

// FUNKTIOT
function startGame() {
    currentRound = 1;
    fetchAndCheck();
}

function startRound(latitude, longitude) {
    initMap(latitude, longitude);
}

function endRound() {
}

function fetchAndCheck() {
    fetch('http://127.0.0.1:5000/fetch_airport')
    .then(response => response.json())
    .then(data => {
        checkStreetView(data.Latitude, data.Longitude).then(location => {
            if (location) {
                startRound(location.lat(), location.lng());
            } else {
                fetchAndCheck();
            }
        });
    })
}

function checkStreetView(latitude, longitude) {
    const sv = new google.maps.StreetViewService();
    const location = new google.maps.LatLng(latitude, longitude);

    return new Promise((resolve, reject) => {
        sv.getPanorama({location: location, radius: 500}, function(data, status) {
            if (status === google.maps.StreetViewStatus.OK) {
                resolve(data.location.latLng);
            } else {
                resolve(null);
            }
        });
    });
}

function initMap(latitude, longitude) {
    const location = new google.maps.LatLng(latitude, longitude);

    const map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 30.000000, lng: 31.000000 },
        zoom: 3,
        streetViewControl: false,
        mapTypeControl: false,
        scaleControl: false,
        rotateControl: false,
        fullscreenControl: false
    });

    const panorama = new google.maps.StreetViewPanorama(document.getElementById('street-view'), {
        position: location,
        pov: { heading: 34, pitch: 10 },
        panControl: false,
        zoomControl: false,
        addressControl: false, 
        fullscreenControl: false,
        enableCloseButton: false,
        linksControl: true,
        motionTracking: false,
        motionTrackingControl: false
    });

    map.setStreetView(panorama);

    map.addListener('click', function(e) {
        if (tempMarker) {
            tempMarker.setMap(null);
        }

        tempMarker = new google.maps.Marker({
            position: e.latLng,
            map: map
        });

        markerLocation = {
            latitude: e.latLng.lat(),
            longitude: e.latLng.lng()
        };

        map.panTo(e.latLng);
    });

    document.getElementById('guess-button').addEventListener('click', function() {
        endRound(location);
    });

}

startGame();