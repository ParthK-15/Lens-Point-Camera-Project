document.addEventListener("DOMContentLoaded", () => {

    const cards = document.querySelectorAll(".camera-cards");

    const priceCheckboxes = document.querySelectorAll(".price-checkbox");
    const brandCheckboxes = document.querySelectorAll(".brands-checkbox");
    const categoryCheckboxes = document.querySelectorAll(".category-checkbox");

    const allCheckboxes = document.querySelectorAll("input[type='checkbox']");
    const resetBtn = document.getElementById("reset-btn");
    const searchInput = document.querySelector('.options input[type="text"]');
    const searchIcon = document.querySelector('.options label i.fa-magnifying-glass');

    // 🔍 AUTO-APPLY SEARCH FROM URL PARAMETER
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    
    if (searchQuery && searchInput) {
        searchInput.value = searchQuery; // Pre-fill search box
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
            document.querySelector(".category-checkbox[value='all']").checked = true;

            filterCards();
        });
    }

    // FILTER FUNCTION
    function filterCards() {
        const selectedPrices = getCheckedValues(priceCheckboxes);
        const selectedBrands = getCheckedValues(brandCheckboxes);
        const selectedCategories = getCheckedValues(categoryCheckboxes);
        const searchText = searchInput.value.toLowerCase();

        let visibleCount = 0;

        cards.forEach(card => {
            const price = parseInt(card.dataset.price);
            const brand = card.dataset.brand;
            const category = card.dataset.category;
            const cardTitle = card.querySelector(".content h2").textContent.toLowerCase();

            const priceMatch = checkPrice(price, selectedPrices);
            const brandMatch = selectedBrands.includes("all") || selectedBrands.includes(brand);
            const categoryMatch = selectedCategories.includes("all") || selectedCategories.includes(category);
            const searchMatch = cardTitle.includes(searchText);

            const isVisible = (priceMatch && brandMatch && categoryMatch && searchMatch);
            card.parentElement.style.display = isVisible ? "flex" : "none";
            
            if (isVisible) visibleCount++;
        });

        // 🔍 Show "No results" only if there's an active search or filter
        const noResultsMessage = document.getElementById('noResultsMessage');
        if (noResultsMessage) {
            const hasActiveSearch = searchText.trim() !== "";
            const hasActiveFilter = !selectedPrices.includes("all") || 
                                    !selectedBrands.includes("all") || 
                                    !selectedCategories.includes("all");
            
            const shouldShowNoResults = visibleCount === 0 && (hasActiveSearch || hasActiveFilter);
            
            if (shouldShowNoResults) {
                noResultsMessage.classList.add('active');
            } else {
                noResultsMessage.classList.remove('active');
            }
        }
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
                case "Under 20000": return price <= 20000;
                case "20000-50000": return price > 20000 && price <= 50000;
                case "50000-70000": return price > 50000 && price <= 70000;
                case "70000-100000": return price > 70000 && price <= 100000;
                case "Over 100000": return price > 100000;
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
        else if (changedCheckbox.classList.contains("category-checkbox")) {
            group = categoryCheckboxes;
        }

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

    function getTargetPageFromQuery(rawText, fallbackPage = "/products") {
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

        const targetPage = getTargetPageFromQuery(query, "/products");
        window.location.href = `${targetPage}?search=${encodeURIComponent(query)}`;
    }

    // 🔍 SEARCH FUNCTIONALITY (Scalable - works with any new camera cards added)
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

    // 🔍 CLEAR SEARCH BUTTON
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener("click", () => {
            if (searchInput) searchInput.value = "";
            
            allCheckboxes.forEach(cb => cb.checked = false);
            document.querySelector(".price-checkbox[value='all']").checked = true;
            document.querySelector(".brands-checkbox[value='all']").checked = true;
            document.querySelector(".category-checkbox[value='all']").checked = true;
            
            filterCards();
            
            window.history.pushState({}, document.title, window.location.pathname);
        });
    }

    // Trigger initial filter if search query came from URL
    filterCards();

    const loginModal = document.getElementById('loginModal');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const closeLoginBtn = document.getElementById('closeLoginBtn');
    const allLoginButtons = document.querySelectorAll('.login, .login2');

    // Open login modal on button click
    allLoginButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            if (loginModal) {
                loginModal.classList.add('active');
            }
        });
    });

    // Close login modal - X button
    if (closeLoginModal) {
        closeLoginModal.addEventListener("click", () => {
            if (loginModal) {
                loginModal.classList.remove('active');
            }
        });
    }

    // Close login modal - Close button
    if (closeLoginBtn) {
        closeLoginBtn.addEventListener("click", () => {
            if (loginModal) {
                loginModal.classList.remove('active');
            }
        });
    }

    // Close modal when clicking outside
    if (loginModal) {
        loginModal.addEventListener("click", (e) => {
            if (e.target === loginModal) {
                loginModal.classList.remove('active');
            }
        });
    }

});