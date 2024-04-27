function initMap() {
    // Sijainnit
    const location = { lat: 60.1699, lng: 24.9384 };
    const centerLocation = { lat: 20, lng: 0 };

    // Alustetaan/luodaan street view
    const panorama = new google.maps.StreetViewPanorama(
        document.getElementById('street-view'), {
            position: location,
            pov: {
                heading: 34,
                pitch: 10
            },
            zoomControl: false,
            panControl: false,
            addressControl: false,
            linksControl: true,
            fullscreenControl: false,
            motionTrackingControl: false
        }
    );

    // Alustetaan/luodaan 2D kartta
    const map = new google.maps.Map(document.getElementById('map'), {
        center: centerLocation,
        zoom: 2.5,
        zoomControl: true,
        streetViewControl: false,
        scaleControl: false,
        rotateControl: false,
        fullscreenControl: false,
        disableDefaultUI: true                
    });