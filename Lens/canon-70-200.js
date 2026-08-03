const images = [
    "../Assets/canon70-200-1.png",
    "../Assets/canon70-200-2.png",
    "../Assets/canon70-200-3.png",
    "../Assets/canon70-200-4.png",
    "../Assets/canon70-200-5.png"
];
let currentIndex = 0;

const sliderImage = document.getElementById("slider-img");
const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");

nextBtn.addEventListener("click", function () {
    currentIndex++;

    if (currentIndex >= images.length) {
        currentIndex = 0;
    }
    updateImage();
});

prevBtn.addEventListener("click", function () {
    currentIndex--;

    if (currentIndex < 0) {
        currentIndex = images.length - 1;
    }
    updateImage();
});

const dots = document.querySelectorAll(".dot");

function updateImage() {
    sliderImage.style.opacity = 0;

    setTimeout(() => {
        sliderImage.src = images[currentIndex];
        sliderImage.style.opacity = 1;
    }, 100);

    dots.forEach(dot => dot.classList.remove("active"));
    dots[currentIndex].classList.add("active");
}

dots.forEach((dot, index) => {
    dot.addEventListener("click", function(){
        currentIndex = index;
        updateImage();
    });
});

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
    const scroll = window.scrollY;
    const height = document.body.scrollHeight - window.innerHeight;
    const progress = (scroll / height) * 100;
    document.getElementById("progress-bar").style.width = progress + "%";
});