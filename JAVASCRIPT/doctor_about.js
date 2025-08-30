// Toggle mobile navigation
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});
 
// Fade in elements on scroll
function fadeInOnScroll() {
    const elements = document.querySelectorAll('.founder-card, .service-card');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.style.opacity = '1';
        } else {
            element.style.opacity = '0';
        }
    });
}

// Initialize elements with 0 opacity
document.querySelectorAll('.founder-card, .service-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.5s ease-in-out';
});

// Add scroll event listener
window.addEventListener('scroll', fadeInOnScroll);

fadeInOnScroll();