const images = [
    "/assets/images/0000125_canon-eos-80d-dslr-camera-body-only_360_nobg.png",
    "/assets/images/eos-5d-mk-iv-ef24-105mm-001_nobg.png",
    "/assets/images/Canon-EOS-5D-Mark-IV-DSLR-Camera-with-24-105mm-f-4L-II-Lens-Basic-Kit-6_nobg.png",
    "/assets/images/4e25e07f260f4fae82ba7d036ccb0c64_nobg.png",
    "/assets/images/canon-eos-5d-mark-iv-body-p211-1989_image_nobg.png",
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