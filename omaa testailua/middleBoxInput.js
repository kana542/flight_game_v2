function checkCountry() {
    // input values
    const countryName = document.getElementById('countryInput').value;

    // list of country names
    const countryList = ["France", "Germany", "Italy", "Spain", "United Kingdom", "United States"];

    // checks if the entered country is in list
    if (countryList.includes(countryName)) {
        alert("CORRECT");
    } else {
        alert("INCORRECT");
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const checkButton = document.getElementById('checkButton');
    checkButton.addEventListener('click', checkCountry);
});
