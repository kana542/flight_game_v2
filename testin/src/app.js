// GLOBAALIT MUUTTUJAT
let currentRound = 0;
const maxRounds = 5;
let currentMarker = null;
let map = null;

// FUNKTIOT
function startGame() {
    currentRound = 1;
    fetchAndCheck();
}

function startRound(latitude, longitude) {
    initMap(latitude, longitude);
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

    map = new google.maps.Map(document.getElementById('map'), {
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
        setMapMarker(e.latLng, map);
    });
}

function handleGuess() {
    const correctLocation = new google.maps.LatLng(storedLatitude, storedLongitude);
    const guessedLocation = currentMarker.getPosition();

    drawLine(correctLocation, guessedLocation);

    // Laske pisteet
    const distance = calculateDistance(correctLocation, guessedLocation);
    updateScore(distance);

    // Siirry seuraavaan kierrokseen
    nextRound();
}

function setMapMarker(position, map) {
    if (currentMarker) {
        currentMarker.setMap(null);
    }

    currentMarker = new google.maps.Marker({
        position: position,
        map: map
    });

    console.log(`Marker placed at: ${position.lat()}, ${position.lng()}`);
}

function calculateDistance(location1, location2) {
    return google.maps.geometry.spherical.computeDistanceBetween(location1, location2);
}

function updateScore(distance) {
    const points = Math.max(0, 10000 - distance / 100); // Esimerkkipistemäärän laskukaava
    const scoreElement = document.getElementById('score-value');
    const currentScore = parseInt(scoreElement.innerText, 10);
    scoreElement.innerText = currentScore + points;
}

function drawLine(start, end) {
    const linePath = new google.maps.Polyline({
        path: [start, end],
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2,
        map: map
    });
}

function nextRound() {
    if (currentRound < maxRounds) {
        currentRound++;
        document.getElementById('round-number').innerText = currentRound;
        fetchAndCheck(); // Käynnistä uusi kierros
    } else {
        endGame();
    }
}

function endGame() {
    console.log("Peli päättyi!");
}

startGame();