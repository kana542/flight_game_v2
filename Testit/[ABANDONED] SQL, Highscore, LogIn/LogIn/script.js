'use strict'
document.querySelectorAll('.navbar a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.navbar a').forEach(a => a.style.backgroundColor = '');
        e.target.style.backgroundColor = '#ddd';
        const sections = document.querySelectorAll('div[id]');
        sections.forEach(section => section.style.display = 'none');
        const targetSection = document.querySelector(this.getAttribute('href'));
        targetSection.style.display = 'block';
    });
});
