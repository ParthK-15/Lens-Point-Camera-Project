const check = document.getElementById("check");

if (check) {
    check.addEventListener("change", function () {
        if (this.checked) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    });
}

const tagline = document.querySelector(".tag_line");

window.addEventListener("load", () => {
    if (!tagline) return;

    tagline.style.opacity = "0";
    tagline.style.transform = "translateY(50px)";

    setTimeout(() => {
        tagline.style.transition = "1s";
        tagline.style.opacity = "1";
        tagline.style.transform = "translateY(0)";
    }, 200);
});

const cameraCard = document.querySelector(".camera-card");
if (cameraCard) {
    cameraCard.addEventListener("click", function () {
        window.location.href = "camera.html";
    });
}

const storageCard = document.querySelector(".storage");
if (storageCard) {
    storageCard.addEventListener("click", function () {
        window.location.href = "storage.html";
    });
}

function getTargetPageFromQuery(rawText) {
    const text = rawText.trim().toLowerCase();
    if (!text) return null;

    const categoryRules = [
        {
            page: "storage.html",
            keywords: ["storage", "memory", "sd card", "sdxc", "sdhc", "cfexpress", "sandisk", "lexar", "prograde", "angelbird"]
        },
        {
            page: "camera.html",
            keywords: ["camera", "dslr", "mirrorless", "eos", "alpha", "camera body"]
        },
        {
            page: "tripod.html",
            keywords: ["tripod", "manfrotto", "sirui", "gitzo", "mefoto", "peak design", "befree"]
        },
        {
            page: "microphones.html",
            keywords: ["mic", "microphone", "audio", "boya", "simpex", "wireless mic", "dm-e100"]
        },
        {
            page: "lightings.html",
            keywords: ["light", "lighting", "flash", "speedlite", "ring light", "digitek", "el-100", "600ex"]
        },
        {
            page: "gimbal.html",
            keywords: ["gimbal", "stabilizer", "dji", "osmo", "ronin", "om 5", "mobile 7"]
        },
        {
            page: "Lens.html",
            keywords: ["lens", "lenses", "macro", "50mm", "24-105", "55-250", "70-200", "70-300", "100-400"]
        },
        {
            page: "accessories.html",
            keywords: ["accessory", "accessories", "bag", "battery", "cleaning"]
        }
    ];

    if (/\bsd\b/.test(text) || /\bcard\b/.test(text)) return "storage.html";

    for (const rule of categoryRules) {
        if (rule.keywords.some(keyword => text.includes(keyword))) {
            return rule.page;
        }
    }

    return "camera.html";
}

function routeHomeSearch(inputElement) {
    if (!inputElement) return;

    const searchText = inputElement.value.trim();
    if (!searchText) return;

    const targetPage = getTargetPageFromQuery(searchText);
    if (!targetPage) return;

    window.location.href = `${targetPage}?search=${encodeURIComponent(searchText)}`;
}

const desktopSearchInput = document.querySelector('.options input[type="text"]');
const desktopSearchIcon = document.querySelector('.options i.fa-magnifying-glass');
const mobileSearchInput = document.querySelector(".inputMobile");
const mobileSearchIcon = document.getElementById("searchButton");

if (desktopSearchInput) {
    desktopSearchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            routeHomeSearch(desktopSearchInput);
        }
    });
}

if (desktopSearchIcon) {
    desktopSearchIcon.addEventListener("click", () => {
        routeHomeSearch(desktopSearchInput);
    });
}

if (mobileSearchInput) {
    mobileSearchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            routeHomeSearch(mobileSearchInput);
        }
    });
}

if (mobileSearchIcon) {
    mobileSearchIcon.addEventListener("click", () => {
        routeHomeSearch(mobileSearchInput);
    });
}