const gameState = {
    currentRound: 1,
    maxRounds: 5,
    map: null,
    marker: null,
    guessMade: false,
    roundData: {
        streetViewLocation: null,
        guessLocation: null
    },

    startGame: function() {
        this.setupUI();
        this.fetchAndCheck(0);
    },

    setupUI: function() {
        document.getElementById("continue-button").innerText = "Continue";
        document.getElementById("guess-button").disabled = true;
    },

    startRound: function(latitude, longitude) {
        this.initMap(latitude, longitude);
    },

    async fetchAndCheck(retryCount) {
        const maxRetries = 3;
        try {
            const response = await fetch('http://127.0.0.1:5000/fetch_airport');
            const data = await response.json();
            const location = await this.checkStreetView(data.Latitude, data.Longitude);

            if (location) {
                this.startRound(location.lat(), location.lng());
                this.roundData.streetViewLocation = {lat: location.lat(), lng: location.lng()};
            } else if (retryCount < maxRetries) {
                this.fetchAndCheck(retryCount + 1);
            } else {
                alert("Street View not possible.");
            }
        } catch (error) {
            console.error('Fetch Error: ', error);
            if (retryCount < maxRetries) {
                this.fetchAndCheck(retryCount + 1);
            } else {
                alert("Fetch fail.");
            }
        }
    },

    checkStreetView: function(latitude, longitude) {
        const sv = new google.maps.StreetViewService();
        const location = new google.maps.LatLng(latitude, longitude);

        return new Promise((resolve) => {
            sv.getPanorama({location: location, radius: 500}, (data, status) => {
                if (status === google.maps.StreetViewStatus.OK) {
                    resolve(data.location.latLng);
                } else {
                    resolve(null);
                }
            });
        });
    },

    initMap: function(latitude, longitude) {
        const location = new google.maps.LatLng(latitude, longitude);
        const mapOptions = {
            center: {lat: 57.730217, lng: 20.709822},
            zoom: 2.5,
            streetViewControl: false,
            mapTypeControl: false,
            scaleControl: false,
            rotateControl: false,
            fullscreenControl: false
        };

        this.map = new google.maps.Map(document.getElementById('map'), mapOptions);
        this.initStreetView(location);
        this.map.addListener('click', this.handleMapClick.bind(this));
    },

    handleMapClick: function(e) {
        this.placeMarker(e.latLng);
    },

    placeMarker: function(click_location) {
        if (this.guessMade) {
            console.warn("Guess has already been made.");
            return;
        }

        if (this.marker) {
            this.marker.setMap(null);
        }

        this.marker = new google.maps.Marker({
            position: click_location,
            map: this.map,
            draggable: false
        });

        this.roundData.guessLocation = {lat: click_location.lat(), lng: click_location.lng()};
        this.map.panTo(click_location);
        this.markerPlaced = true;
        document.getElementById('guess-button').disabled = false;
    },

    initStreetView: function(location) {
        const panoramaOptions = {
            position: location,
            pov: {heading: 34, pitch: 10},
            panControl: false,
            zoomControl: false,
            addressControl: false,
            fullscreenControl: false,
            enableCloseButton: false,
            linksControl: true,
            motionTracking: false,
            motionTrackingControl: false
        };

        const panorama = new google.maps.StreetViewPanorama(document.getElementById('street-view'), panoramaOptions);
        this.map.setStreetView(panorama);
    },

    calculateDistance: function(location1, location2) {
        const point1 = new google.maps.LatLng(location1.lat, location1.lng);
        const point2 = new google.maps.LatLng(location2.lat, location2.lng);
        return google.maps.geometry.spherical.computeDistanceBetween(point1, point2) / 1000;
    },

    calculateScore: function(distance) {
        const rawScore = 1000 - (distance * (1000 / 5000));
        return Math.max(0, Math.round(rawScore));
    },

    drawLine: function() {
        if (!this.roundData.streetViewLocation || !this.roundData.guessLocation) {
            console.log("Both locations are required to draw a line.");
            return;
        }

        const pathCoords = [
            {lat: this.roundData.streetViewLocation.lat, lng: this.roundData.streetViewLocation.lng},
            {lat: this.roundData.guessLocation.lat, lng: this.roundData.guessLocation.lng}
        ];

        const linePath = new google.maps.Polyline({
            path: pathCoords,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
        });

        linePath.setMap(this.map);
    },

    updateScore: function(newScore) {
        let currentScore = parseInt(document.getElementById('score-value').textContent);
        currentScore += newScore;
        document.getElementById('score-value').textContent = currentScore;
    },

    nextRound: function() {
        if (this.currentRound < this.maxRounds) {
            this.currentRound++;
            document.getElementById('round-number').textContent = this.currentRound;
            document.getElementById('score').style.display = 'block';
            document.getElementById('guess-button').disabled = true;

            this.guessMade = false;
            this.markerPlaced = false;

            if (this.marker) {
                this.marker.setMap(null);
                this.marker = null;
            }

            document.getElementById('roundResult').style.display = 'none';
            document.getElementById('continue-button').innerText = "Continue";

            this.fetchAndCheck(0);
        } else {
            this.endGame();
        }
    },

    endGame: function() {
        const score = parseInt(document.getElementById('score-value').textContent);
        alert("Peli päättyi! Loppupisteesi ovat " + score);
        document.getElementById('continue-button').innerText = "New Game";
        document.getElementById('main-menu-button').style.display = 'inline';
        document.getElementById('roundResult').style.display = 'block';
        document.getElementById('score').style.display = 'none';

        fetch('http://127.0.0.1:5000/update_highscore', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({score: score})
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                if (data.updated) {
                    alert("Uusi Korkeintulos Saavutettu!");
                }
            })
            .catch((error) => console.error('Error:', error));
    }
};

document.getElementById('guess-button').addEventListener('click', function() {
    if (!gameState.guessMade && gameState.markerPlaced) {
        gameState.drawLine();
        this.disabled = true;
        gameState.guessMade = true;

        const distance = gameState.calculateDistance(gameState.roundData.streetViewLocation, gameState.roundData.guessLocation);
        const score = gameState.calculateScore(distance);

        document.getElementById('distanceDisplay').innerText = "Etäisyys: " + distance.toFixed(2) + " km";
        document.getElementById('scoreDisplay').innerText = "Pisteet: " + score;

        gameState.updateScore(score);

        document.getElementById('roundResult').style.display = 'block';
        document.getElementById('score').style.display = 'none';
    }
});

document.getElementById('continue-button').addEventListener('click', function() {
    if (this.innerText === "New Game") {
        document.getElementById('score-value').textContent = '0';
        document.getElementById('round-number').textContent = '1';
        document.getElementById('main-menu-button').style.display = 'none';

        gameState.currentRound = 1;
        gameState.guessMade = false;
        gameState.markerPlaced = false;

        if (gameState.marker) {
            gameState.marker.setMap(null);
            gameState.marker = null;
        }

        document.getElementById('roundResult').style.display = 'none';
        document.getElementById('score').style.display = 'block';

        gameState.startGame();
    } else {
        gameState.nextRound();
    }
});

gameState.startGame();