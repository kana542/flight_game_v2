async function initMap() {

    while(window.latitude === undefined || window.longitude === undefined) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(window.latitude, window.longitude)

    const location = {
        lat: window.latitude, 
        lng: window.longitude 
    };

    const panoramaOptions = {
        position: location,
        pov: { heading: 34, pitch: 10 },
        zoomControl: false,
        panControl: false,
        addressControl: false,
        linksControl: true,
        fullscreenControl: false,
        motionTrackingControl: false
    };

    const panorama = new google.maps.StreetViewPanorama( document.getElementById('street-view'), panoramaOptions );

    let streetViewService = new google.maps.StreetViewService();

    let radius = 1000;

    streetViewService.getPanorama({
        location: location,
        radius: radius
    }, function(data, status) {
        if (status === google.maps.StreetViewStatus.OK) {
            panorama.setPosition(data.location.latLng);
            console.log("Street View OK.");
        } else {
            alert('Street View ei saatavilla.');
            console.log("Street View ei saatavilla näillä koordinaateilla.");
        }
    });

    const map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 20, lng: 0 },
        zoom: 2.5,
        zoomControl: true,
        streetViewControl: false,
        scaleControl: false,
        rotateControl: false,
        fullscreenControl: false,
        disableDefaultUI: true
    });
}