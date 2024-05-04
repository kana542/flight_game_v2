// GLOBAALIT MUUTTUJAT
let currentRound = 0;
const maxRounds = 5;

let map = null;
let marker = null;

let guessMade = false;

let roundData = { 
    streetViewLocation: null, 
    guessLocation: null 
};

// FUNKTIOT
function startGame() {
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
                roundData.streetViewLocation = { lat: location.lat(), lng: location.lng() };
                console.log(roundData.streetViewLocation)
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
        placeMarker(e.latLng, map);
        console.log(marker.position);
    });
}

function placeMarker(click_location, map) {
    if (guessMade) {
        return;
    }

    if (marker) {
        marker.setMap(null);
    }

    marker = new google.maps.Marker({
        position: click_location,
        map: map,
        draggable: true
    });

    roundData.guessLocation = { lat: click_location.lat(), lng: click_location.lng() };

    map.panTo(click_location);
}

function calculateDistance(location1, location2) {
    // luodaan ensiksi objektit parametreistä
    let point1 = new google.maps.LatLng(location1.lat, location1.lng);
    let point2 = new google.maps.LatLng(location2.lat, location2.lng);

    // lasketaan etäisyys ja muutetaan se metreistä kilometreiksi
    let distance = (google.maps.geometry.spherical.computeDistanceBetween(point1, point2) / 1000);
    return distance;
}

function calculateScore(distance) {
    let rawScore = 1000 - (distance * (1000 / 5000));
    return Math.max(0, Math.round(rawScore));  // Pyöristetään tulos lähimpään kokonaislukuun
}

function drawLine() {
    if (!roundData.streetViewLocation || !roundData.guessLocation) {
        console.log("Tarvitaan molemmat sijainnit piirtämiseen.");
        return;
    }

    let PathCoords = [
        { lat: roundData.streetViewLocation.lat, lng: roundData.streetViewLocation.lng },
        { lat: roundData.guessLocation.lat, lng: roundData.guessLocation.lng }
    ];

    let linePath = new google.maps.Polyline({
        path: PathCoords,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

    linePath.setMap(map);
}

function updateScore(newScore) {
    let currentScore = parseInt(document.getElementById('score-value').textContent);
    currentScore += newScore;
    document.getElementById('score-value').textContent = currentScore;
}

function closeModal() {
    document.getElementById('roundResult').style.display = 'none';
}

function nextRound() {
    if (currentRound < maxRounds) {
        currentRound++;
        document.getElementById('round-number').textContent = currentRound;
        document.getElementById('score').style.display = 'block';
        document.getElementById('guess-button').disabled = false;
        guessMade = false;
        if (marker) {
            marker.setMap(null);
            marker = null;
        }

        document.getElementById('roundResult').style.display = 'none';

        fetchAndCheck();
    } else {
        endGame();
    }
}

function endGame() {
    alert("Game Over! Your final score is " + document.getElementById('score-value').textContent);
}

document.getElementById('guess-button').addEventListener('click', function() {
    if (!guessMade) {
        drawLine();
        marker.setOptions({ draggable: false });
        this.disabled = true;
        guessMade = true;

        let distance = calculateDistance(roundData.streetViewLocation, roundData.guessLocation);
        let score = calculateScore(distance);

        document.getElementById('distanceDisplay').innerText = "Etäisyys: " + distance.toFixed(2) + " km";
        document.getElementById('scoreDisplay').innerText = "Pisteet: " + score;

        updateScore(score);

        document.getElementById('roundResult').style.display = 'block';

        document.getElementById('score').style.display = 'none';
    }
});

document.getElementById('continue-button').addEventListener('click', function() {
    nextRound();
});

startGame();