document.addEventListener("DOMContentLoaded", () => {

    const searchInput = document.querySelector('.options input[type="text"]');
    const searchIcon = document.querySelector('.options label i.fa-magnifying-glass');

    function getTargetPageFromQuery(rawText, fallbackPage = "accessories.html") {
        const text = rawText.trim().toLowerCase();
        if (!text) return fallbackPage;

        const categoryRules = [
            { page: "storage.html", keywords: ["storage", "memory", "sd card", "sdxc", "sdhc", "cfexpress", "sandisk", "lexar", "prograde", "angelbird"] },
            { page: "camera.html", keywords: ["camera", "dslr", "mirrorless", "eos", "alpha", "camera body"] },
            { page: "tripod.html", keywords: ["tripod", "manfrotto", "sirui", "gitzo", "mefoto", "peak design", "befree"] },
            { page: "microphones.html", keywords: ["mic", "microphone", "audio", "boya", "simpex", "wireless mic", "dm-e100"] },
            { page: "lightings.html", keywords: ["light", "lighting", "flash", "speedlite", "ring light", "digitek", "el-100", "600ex"] },
            { page: "gimbal.html", keywords: ["gimbal", "stabilizer", "dji", "osmo", "ronin", "om 5", "mobile 7"] },
            { page: "Lens.html", keywords: ["lens", "lenses", "macro", "50mm", "24-105", "55-250", "70-200", "70-300", "100-400"] },
            { page: "bagpack.html", keywords: ["bag", "bags", "backpack", "camera bag", "carry case", "camsafe", "mobius", "nikon bag", "sony bag"] },
            { page: "accessories.html", keywords: ["accessory", "accessories", "battery", "cleaning"] }
        ];

        if (/\bsd\b/.test(text) || /\bcard\b/.test(text)) return "storage.html";

        for (const rule of categoryRules) {
            if (rule.keywords.some(keyword => text.includes(keyword))) {
                return rule.page;
            }
        }

        return fallbackPage;
    }

    function routeSearchByCategory() {
        if (!searchInput) return;

        const query = searchInput.value.trim();
        if (!query) return;

        const targetPage = getTargetPageFromQuery(query, "accessories.html");
        window.location.href = `${targetPage}?search=${encodeURIComponent(query)}`;
    }

    if (searchInput) {
        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
            }
        });
    }

    const loginModal = document.getElementById('loginModal');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const allLoginButtons = document.querySelectorAll('.login');

    allLoginButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            if (loginModal) {
                loginModal.classList.add('active');
            }
        });
    });

    if (closeLoginModal) {
        closeLoginModal.addEventListener("click", () => {
            if (loginModal) {
                loginModal.classList.remove('active');
            }
        });
    }

    if (loginModal) {
        loginModal.addEventListener("click", (e) => {
            if (e.target === loginModal) {
                loginModal.classList.remove('active');
            }
        });
    }
});

