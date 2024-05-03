// JavaScript for navigation actions
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('nav ul li a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            console.log("Navigated to: " + event.target.href.split("#")[1]);
        });
    });
});
