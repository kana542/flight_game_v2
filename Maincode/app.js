// Alustetaan pelitila objektiksi
const gameState = {
    currentRound: 0,
    maxRounds: 5,
    map: null,
    marker: null,
    guessMade: false,
    roundData: {
        streetViewLocation: null,
        guessLocation: null
    },

    // pelin aloittamisen funktio
    startGame: function() {
        this.setupUI();
        this.fetchAndCheck(0);
    },

    // käyttöliittymän nollaaminen
    setupUI: function() {
        document.getElementById("continue-button").innerText = "Continue";
        document.getElementById("guess-button").disabled = true;
    },

    // kierroksen aloittaminen annetuilla sijaintitiedoilla
    startRound: function(latitude, longitude) {
        this.initMap(latitude, longitude);
    },

    // tiedonhaku ja tarkistus
    async fetchAndCheck(retryCount) {
        const maxRetries = 3;
        try {
            const response = await fetch('http://127.0.0.1:5000/fetch_airport');
            const data = await response.json();
            // odotetaan street view tarkistusta
            const location = await this.checkStreetView(data.Latitude, data.Longitude);

            // jos sijainti on saatavilla, aloitetaan kierros ja tallennetaan sijainti
            if (location) {
                this.startRound(location.lat(), location.lng());
                this.roundData.streetViewLocation = { lat: location.lat(), lng: location.lng() };
            //  jos fetch yrityksiä jäljellä, yritetään uudelleen
            } else if (retryCount < maxRetries) {
                this.fetchAndCheck(retryCount + 1);
            } else {
                alert("Street View not possible.");
            }
        // virheenhallinta
        } catch (error) {
            console.error('Fetch Error: ', error);
            if (retryCount < maxRetries) {
                this.fetchAndCheck(retryCount + 1);
            } else {
                alert("Fetch fail.");
            }
        }
    },

    // street view tarkistus että onko mahdollista tietokannasta saaduille koordinaateille
    checkStreetView: function(latitude, longitude) {
        const sv = new google.maps.StreetViewService();
        const location = new google.maps.LatLng(latitude, longitude);

        // nyt en oo kyllä itekkää täysin varma toimiiko kunnolla, googlen docseissa käytetty then/catch
        return new Promise((resolve) => {
            sv.getPanorama({ location: location, radius: 500 }, (data, status) => {
                 // jos panoraama löytyy palautetaan sijainti, jos ei niin null
                if (status === google.maps.StreetViewStatus.OK) {
                    resolve(data.location.latLng);
                } else {
                    resolve(null);
                }
            });
        });
    },

    // kartan alustus
    initMap: function(latitude, longitude) {
        // määritellään sijainti koordinaateista, tää tosin hieman turha kun ei haluta suoraan ite karttaa arvotulle sijainnille
        // ei viitti ottaa pois kun pasko jotain koodista aikasemmi, hotfix atm ig
        const location = new google.maps.LatLng(latitude, longitude);
        const mapOptions = {
            center: { lat: 57.730217, lng: 20.709822 },
            zoom: 2.5,
            streetViewControl: false,
            mapTypeControl: false,
            scaleControl: false,
            rotateControl: false,
            fullscreenControl: false
        };

        // luodaan ja alustetaan kartta, lisätään myös klikkauskuuntelija siihen
        this.map = new google.maps.Map(document.getElementById('map'), mapOptions); // Luodaan kartta
        this.initStreetView(location);
        this.map.addListener('click', this.handleMapClick.bind(this));
    },

    // kartan klikkausten käsittely
    handleMapClick: function(e) {
        this.placeMarker(e.latLng); // kutsutaan merkin lisäämis funktiota klikatulle sijainnille kartassa
    },

    // merkin lisääminen kartalle
    placeMarker: function(click_location) {
        // jos arvaus on jo tehty, ilmoitetaan konsoliin, tbh no idea onko ees tarpeelline mut placeholder atm
        if (this.guessMade) {
            console.warn("Guess has already been made.");
            return;
        }

        // jos merkki olemassa jo, poistetaan se
        if (this.marker) {
            this.marker.setMap(null);
        }

         // luodaan uusi merkki kartalle
        this.marker = new google.maps.Marker({
            position: click_location,
            map: this.map,
            draggable: false
        });

        // tallennetaan arvauksen sijainti
        this.roundData.guessLocation = { lat: click_location.lat(), lng: click_location.lng() };
        this.map.panTo(click_location);
        this.markerPlaced = true;
        document.getElementById('guess-button').disabled = false;
    },

    // street View alustaminen/asetukset
    initStreetView: function(location) {
        const panoramaOptions = {
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
        };

        // street viewin luominen
        const panorama = new google.maps.StreetViewPanorama(document.getElementById('street-view'), panoramaOptions);
        this.map.setStreetView(panorama);
    },

    // etäisyyden laskeminen kahden sijainnin välillä
    calculateDistance: function(location1, location2) {
        const point1 = new google.maps.LatLng(location1.lat, location1.lng);
        const point2 = new google.maps.LatLng(location2.lat, location2.lng);
        // palautetaan etäisyys kilometreinä
        return google.maps.geometry.spherical.computeDistanceBetween(point1, point2) / 1000;
    },

    // pisteytys etäisyyden perusteella
    calculateScore: function(distance) {
        const rawScore = 1000 - (distance * (1000 / 5000)); // lasketaan raakapisteet etäisyyden perusteella
        return Math.max(0, Math.round(rawScore)); // pyöristetään pisteet
    },

    // viivan piirtäminen kahden sijainnin välille
    drawLine: function() {
        // jos jompikumpi sijainneista puuttuu niin tulostetaan virhettä konsoliin, once again hieman turha mut pidetään varulle
        if (!this.roundData.streetViewLocation || !this.roundData.guessLocation) {
            console.log("Both locations are required to draw a line.");
            return;
        }

        // viivan päätepisteiden määritys
        const pathCoords = [
            { lat: this.roundData.streetViewLocation.lat, lng: this.roundData.streetViewLocation.lng },
            { lat: this.roundData.guessLocation.lat, lng: this.roundData.guessLocation.lng }
        ];

         // viivan luominen
        const linePath = new google.maps.Polyline({
            path: pathCoords,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
        });

        // asetetaan viiva kartalle
        linePath.setMap(this.map);
    },

    // kokonaispisteiden päivitys
    updateScore: function(newScore) {
        // haetaan nykyiset pisteet ja lisätään ne kokonaispisteisiin
        let currentScore = parseInt(document.getElementById('score-value').textContent);
        currentScore += newScore;
        document.getElementById('score-value').textContent = currentScore;
    },

    // seuraavan kierroksen asetukset
    nextRound: function() {
        // jos kierroksia on vielä jäljellä
        if (this.currentRound < this.maxRounds) {
            this.currentRound++;

            // päivitetään kierrosnumero näytölle ja näytetään kierroksen pisteet
            document.getElementById('round-number').textContent = this.currentRound;
            document.getElementById('score').style.display = 'block';
            // deaktivoidaan arvausnappi ettei pystytä piirtämään turhia viivoja
            document.getElementById('guess-button').disabled = true;

            this.guessMade = false;
            this.markerPlaced = false;

            // jos vanha merkki olemassa, poistetaan se
            if (this.marker) {
                this.marker.setMap(null);
                this.marker = null;
            }

            document.getElementById('roundResult').style.display = 'none'; // Piilotetaan kierrostulos
            document.getElementById('continue-button').innerText = "Continue"; // Asetetaan jatkopainikkeen teksti

            this.fetchAndCheck(0);
        } else {
            // peli päättyy, jos kierrokset täynnä
            this.endGame();
        }
    },

    // pelin päättyminen
    endGame: function() {
        alert("Peli päättyi! Loppupisteesi ovat " + document.getElementById('score-value').textContent);
        document.getElementById('continue-button').innerText = "New Game";
        document.getElementById('main-menu-button').style.display = 'inline';
        document.getElementById('roundResult').style.display = 'block';
        document.getElementById('score').style.display = 'none';
    }
};

document.getElementById('guess-button').addEventListener('click', function() {
    // jos arvausta ei ole tehty ja merkki on asetettu
    if (!gameState.guessMade && gameState.markerPlaced) {
        // piirretään viivakartalle koordinaattien väliin
        gameState.drawLine();
        this.disabled = true;
        gameState.guessMade = true;

        // etäisyyden ja pisteiden laskeminen
        const distance = gameState.calculateDistance(gameState.roundData.streetViewLocation, gameState.roundData.guessLocation);
        const score = gameState.calculateScore(distance);

        // päivitetään arvauksen tiedot näkyviin
        document.getElementById('distanceDisplay').innerText = "Etäisyys: " + distance.toFixed(2) + " km";
        document.getElementById('scoreDisplay').innerText = "Pisteet: " + score;

        // päivitetään kokonaispisteet
        gameState.updateScore(score);

        document.getElementById('roundResult').style.display = 'block';
        document.getElementById('score').style.display = 'none'; //
    }
});


document.getElementById('continue-button').addEventListener('click', function() {
    // jos continue-button arvo on "New Game"
    if (this.innerText === "New Game") {
        document.getElementById('score-value').textContent = '0';
        document.getElementById('round-number').textContent = '0';

        gameState.currentRound = 0;
        gameState.guessMade = false;
        gameState.markerPlaced = false;

         // poistetaan vanha merkki kartasta
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