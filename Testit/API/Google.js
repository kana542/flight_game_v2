let map, panorama;

function initMap() {
    const initialLocation = {lat: -34.397, lng: 150.644}; // Coordinates can be set as constants

    // The map and panorama may be reassigned, hence let is used
    map = new google.maps.Map(document.getElementById('map'), {
        center: initialLocation,
        zoom: 8
    });

    panorama = new google.maps.StreetViewPanorama(
        document.getElementById('street-view'), {
            position: initialLocation,
            pov: {
                heading: 34,
                pitch: 10
            }
        }
    );

    map.setStreetView(panorama);
}
