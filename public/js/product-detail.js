// ==========================================
// Product Detail Page — Image Slider,
// Scroll Animations, Nav Highlighting,
// Progress Bar
// ==========================================
(function () {
    "use strict";

    // --- Image Slider ---
    var images = window.sliderImages || [];
    var currentIndex = 0;
    var sliderImage = document.getElementById("slider-img");
    var nextBtn = document.querySelector(".next");
    var prevBtn = document.querySelector(".prev");
    var dots = document.querySelectorAll(".dot");

    function updateImage() {
        if (!sliderImage || images.length === 0) return;
        sliderImage.style.opacity = 0;
        setTimeout(function() {
            sliderImage.src = images[currentIndex];
            sliderImage.style.opacity = 1;
        }, 100);
        dots.forEach(function(dot) { dot.classList.remove("active"); });
        if (dots[currentIndex]) dots[currentIndex].classList.add("active");
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", function () {
            currentIndex = (currentIndex + 1) % images.length;
            updateImage();
        });
    }
    if (prevBtn) {
        prevBtn.addEventListener("click", function () {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            updateImage();
        });
    }
    dots.forEach(function(dot, index) {
        dot.addEventListener("click", function () {
            currentIndex = index;
            updateImage();
        });
    });

    // --- Fade-In on Scroll ---
    var fadeElements = document.querySelectorAll(".fade-in");
    function showOnScroll() {
        fadeElements.forEach(function(el) {
            var rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight - 100) {
                el.classList.add("show");
            }
        });
    }
    window.addEventListener("scroll", showOnScroll);
    showOnScroll();

    // --- Active Nav Link Highlighting ---
    var sections = document.querySelectorAll("main section");
    var navLinks = document.querySelectorAll("nav .navigation a");
    function setActiveLink() {
        var currentSection = "";
        sections.forEach(function(section) {
            var rect = section.getBoundingClientRect();
            if (rect.top <= 120 && rect.bottom >= 120) {
                currentSection = section.getAttribute("id");
            }
        });
        navLinks.forEach(function(link) {
            link.classList.remove("active");
            if (link.getAttribute("href") === "#" + currentSection) {
                link.classList.add("active");
            }
        });
    }
    window.addEventListener("scroll", setActiveLink);
    window.addEventListener("load", setActiveLink);

    // --- Scroll Progress Bar ---
    window.addEventListener("scroll", function() {
        var scroll = window.scrollY;
        var height = document.body.scrollHeight - window.innerHeight;
        var progress = height > 0 ? (scroll / height) * 100 : 0;
        var bar = document.getElementById("progress-bar");
        if (bar) bar.style.width = progress + "%";
    });
})();
