fetch('http://127.0.0.1:5000/fetch_airport').then(response => {
    if (!response.ok) {
        throw new Error('Network error: ' + response.statusText);
    }
    return response.json();

}).then(data => {
    window.latitude = data["Latitude"];
    window.longitude = data["Longitude"];

}).catch(error => {
    console.error('Fetch error: ', error);
});