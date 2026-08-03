const images = Array.isArray(window.productImages) ? window.productImages : [];
let currentIndex = 0;

const sliderImage = document.getElementById("slider-img");
const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");
const dotsContainer = document.querySelector(".dots-container");

function renderDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = "";

    images.forEach((_, index) => {
        const dot = document.createElement("span");
        dot.className = index === currentIndex ? "dot active" : "dot";
        dot.addEventListener("click", () => {
            currentIndex = index;
            updateImage();
        });
        dotsContainer.appendChild(dot);
    });
}

function updateImage() {
    if (!sliderImage || images.length === 0) return;

    sliderImage.style.opacity = 0;
    setTimeout(() => {
        sliderImage.src = images[currentIndex];
        sliderImage.style.opacity = 1;

        const dots = document.querySelectorAll(".dot");
        dots.forEach(dot => dot.classList.remove("active"));
        if (dots[currentIndex]) dots[currentIndex].classList.add("active");
    }, 100);
}

if (sliderImage && images.length > 0) {
    sliderImage.src = images[0];
}

if (images.length <= 1) {
    if (nextBtn) nextBtn.style.display = "none";
    if (prevBtn) prevBtn.style.display = "none";
}

if (nextBtn) {
    nextBtn.addEventListener("click", () => {
        if (images.length === 0) return;
        currentIndex = (currentIndex + 1) % images.length;
        updateImage();
    });
}

if (prevBtn) {
    prevBtn.addEventListener("click", () => {
        if (images.length === 0) return;
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateImage();
    });
}

renderDots();

const elements = document.querySelectorAll(".fade-in");
function showOnScroll() {
    elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
            el.classList.add("show");
        }
    });
}

window.addEventListener("scroll", showOnScroll);
showOnScroll();

const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("nav a");

function setActiveLink() {
    let currentSection = "";

    sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom >= 120) {
            currentSection = section.getAttribute("id");
        }
    });

    navLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === "#" + currentSection) {
            link.classList.add("active");
        }
    });
}

window.addEventListener("scroll", setActiveLink);
window.addEventListener("load", setActiveLink);

window.addEventListener("scroll", () => {
    const bar = document.getElementById("progress-bar");
    if (!bar) return;
    const scroll = window.scrollY;
    const height = document.body.scrollHeight - window.innerHeight;
    const progress = (scroll / height) * 100;
    bar.style.width = progress + "%";
});
