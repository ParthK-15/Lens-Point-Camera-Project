
const progressBar = document.getElementById('readingProgress');

function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = (scrollTop / docHeight) * 100;
    if (progressBar) {
        progressBar.style.width = percent + '%';
    }
}

window.addEventListener('scroll', updateProgress);
window.addEventListener('resize', updateProgress);

const revealSections = document.querySelectorAll('.reveal-section');

function revealOnScroll() {
    const windowHeight = window.innerHeight;
    revealSections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const revealPoint = windowHeight * 0.85;

        if (sectionTop < revealPoint) {
            section.classList.add('revealed');
        }
    });
}

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

const timelineItems = document.querySelectorAll('.timeline-item');

function animateTimeline() {
    const windowHeight = window.innerHeight;
    timelineItems.forEach((item, index) => {
        const itemTop = item.getBoundingClientRect().top;
        if (itemTop < windowHeight * 0.8) {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }
    });
}

timelineItems.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(30px)';
    item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
});

window.addEventListener('scroll', animateTimeline);
window.addEventListener('load', animateTimeline);

(function () {
  
    const glowSelectors = [
        '.timeline-card',
        '.subject-card',
        '.comparison-card',
        '.sensor-insight',
        '.budget-table-wrapper'
    ];

    const glowCards = document.querySelectorAll(glowSelectors.join(', '));

    glowCards.forEach(card => {
        card.classList.add('glow-card');
    });

    const PROXIMITY = 80; 

    function handleMouseMove(e) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        glowCards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const cardCenterX = rect.left + rect.width / 2;
            const cardCenterY = rect.top + rect.height / 2;

            const isNear =
                mouseX > rect.left - PROXIMITY &&
                mouseX < rect.right + PROXIMITY &&
                mouseY > rect.top - PROXIMITY &&
                mouseY < rect.bottom + PROXIMITY;

            if (isNear) {
                card.classList.add('glow-active');

                const angle = Math.atan2(mouseY - cardCenterY, mouseX - cardCenterX);
                const angleDeg = (angle * 180 / Math.PI) + 90;

                const relX = ((mouseX - rect.left) / rect.width) * 100;
                const relY = ((mouseY - rect.top) / rect.height) * 100;

                card.style.setProperty('--glow-angle', angleDeg + 'deg');
                card.style.setProperty('--glow-x', Math.max(0, Math.min(100, relX)) + '%');
                card.style.setProperty('--glow-y', Math.max(0, Math.min(100, relY)) + '%');
            } else {
                card.classList.remove('glow-active');
            }
        });
    }

    document.addEventListener('mousemove', handleMouseMove, { passive: true });

    document.addEventListener('mouseleave', function () {
        glowCards.forEach(card => card.classList.remove('glow-active'));
    });
})();
