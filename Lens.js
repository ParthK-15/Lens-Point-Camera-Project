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
        const searchText = searchInput ? searchInput.value.toLowerCase() : "";

        cards.forEach(card => {
            const price = parseInt(card.dataset.price);
            const brand = card.dataset.brand;
            const cardTitle = card.querySelector(".content h2").textContent.toLowerCase();

            const priceMatch = checkPrice(price, selectedPrices);
            const brandMatch = selectedBrands.includes("all") || selectedBrands.includes(brand);
            const searchMatch = cardTitle.includes(searchText);

            const isVisible = (priceMatch && brandMatch && searchMatch);
            card.parentElement.style.display = isVisible ? "flex" : "none";
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
            switch (range) {
                case "under-20000": return price < 20000;
                case "20000-50000": return price >= 20000 && price <= 50000;
                case "50000-70000": return price > 50000 && price <= 70000;
                case "70000-100000": return price > 70000 && price <= 100000;
                case "over-100000": return price > 100000;
                default: return false;
            }
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
                routeSearchByCategory();
            }
        });
    }

    if (searchIcon) {
        searchIcon.addEventListener("click", () => {
            routeSearchByCategory();
        });
    }

    // Trigger initial filter
    filterCards();

});