document.addEventListener("DOMContentLoaded", () => {

    const cards = document.querySelectorAll(".camera-cards");

    const priceCheckboxes = document.querySelectorAll(".price-checkbox");
    const brandCheckboxes = document.querySelectorAll(".brands-checkbox");

    const allCheckboxes = document.querySelectorAll("input[type='checkbox']");
    const resetBtn = document.getElementById("reset-btn");
    const searchInput = document.querySelector('.options input[type="text"]');
    const searchIcon = document.querySelector('.options label i.fa-magnifying-glass');

    // 🔍 AUTO-APPLY SEARCH FROM URL PARAMETER
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    
    if (searchQuery && searchInput) {
        searchInput.value = searchQuery;
    }

    // Attach checkbox listeners
    allCheckboxes.forEach(cb => {
        cb.addEventListener("change", () => {
            handleAllCheckbox(cb);
            filterCards();
        });
    });

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {

            allCheckboxes.forEach(cb => cb.checked = false);

            document.querySelector(".price-checkbox[value='all']").checked = true;
            document.querySelector(".brands-checkbox[value='all']").checked = true;

            if (searchInput) searchInput.value = "";
            filterCards();
        });
    }

    // FILTER FUNCTION
    function filterCards() {
        const selectedPrices = getCheckedValues(priceCheckboxes);
        const selectedBrands = getCheckedValues(brandCheckboxes);

        cards.forEach(card => {
            const rawPrice = card.dataset.price || "";
            const price = parseInt(String(rawPrice).replace(/[^\d]/g, ""), 10) || 0;
            const brand = (card.dataset.brand || "").toLowerCase();

            const priceMatch = checkPrice(price, selectedPrices);
            const brandMatch = selectedBrands.includes("all") || selectedBrands.map(b => b.toLowerCase()).includes(brand);

            const isVisible = (priceMatch && brandMatch);
            if (card.parentElement) {
                card.parentElement.style.display = isVisible ? "flex" : "none";
            }
        });
    }

    function getCheckedValues(checkboxes) {
        return Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
    }

    function checkPrice(price, selectedPrices) {
        if (selectedPrices.includes("all")) return true;

        return selectedPrices.some(range => {
            const rLower = range.toLowerCase().trim();
            if (rLower.startsWith("under ") || rLower.startsWith("under-")) {
                const val = parseInt(rLower.replace(/[^\d]/g, ""), 10) || Infinity;
                return price <= val;
            }
            if (rLower.startsWith("over ") || rLower.startsWith("over-")) {
                const val = parseInt(rLower.replace(/[^\d]/g, ""), 10) || 0;
                return price > val;
            }
            const parts = range.split("-").map(p => parseInt(p.replace(/[^\d]/g, ""), 10));
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                return price >= parts[0] && price <= parts[1];
            }
            return false;
        });
    }

    function handleAllCheckbox(changedCheckbox) {

        let group;

        if (changedCheckbox.classList.contains("price-checkbox")) {
            group = priceCheckboxes;
        } 
        else if (changedCheckbox.classList.contains("brands-checkbox")) {
            group = brandCheckboxes;
        }

        if (!group) return;

        if (changedCheckbox.value === "all" && changedCheckbox.checked) {
            group.forEach(cb => {
                if (cb !== changedCheckbox) cb.checked = false;
            });
        } 
        else if (changedCheckbox.value !== "all" && changedCheckbox.checked) {
            group.forEach(cb => {
                if (cb.value === "all") cb.checked = false;
            });
        }
    }

    function getTargetPageFromQuery(rawText, fallbackPage = "/lenses") {
        const text = rawText.trim().toLowerCase();
        if (!text) return fallbackPage;

        const categoryRules = [
            { page: "storage.html", keywords: ["storage", "memory", "sd card", "sdxc", "sdhc", "cfexpress", "sandisk", "lexar", "prograde", "angelbird"] },
            { page: "/products", keywords: ["camera", "dslr", "mirrorless", "eos", "alpha", "camera body"] },
            { page: "/tripods", keywords: ["tripod", "manfrotto", "sirui", "gitzo", "mefoto", "peak design", "befree"] },
            { page: "microphones.html", keywords: ["mic", "microphone", "audio", "boya", "simpex", "wireless mic", "dm-e100"] },
            { page: "lightings.html", keywords: ["light", "lighting", "flash", "speedlite", "ring light", "digitek", "el-100", "600ex"] },
            { page: "gimbal.html", keywords: ["gimbal", "stabilizer", "dji", "osmo", "ronin", "om 5", "mobile 7"] },
            { page: "/lenses", keywords: ["lens", "lenses", "macro", "50mm", "24-105", "55-250", "70-200", "70-300", "100-400"] },
            { page: "accessories.html", keywords: ["accessory", "accessories", "bag", "battery", "cleaning"] }
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

        const targetPage = getTargetPageFromQuery(query, "/lenses");
        window.location.href = `${targetPage}?search=${encodeURIComponent(query)}`;
    }

    // 🔍 SEARCH FUNCTIONALITY
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            filterCards();
        });

        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
            }
        });

    // Trigger initial filter
    filterCards();

});