function initTripodFilters() {
    const cards = document.querySelectorAll(".camera-cards");

    const priceCheckboxes = document.querySelectorAll(".price-checkbox");
    const brandCheckboxes = document.querySelectorAll(".brands-checkbox");

    const allCheckboxes = document.querySelectorAll("input[type='checkbox']");
    const resetBtn = document.getElementById("reset-btn");
    const searchInput = document.querySelector('.options input[type="text"]');

    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    const brandParam = urlParams.get('brand');
    
    if (searchQuery && searchInput) {
        searchInput.value = searchQuery;
    }

    if (brandParam) {
        const brandLower = brandParam.toLowerCase().trim();
        let foundMatch = false;

        brandCheckboxes.forEach(cb => {
            if (cb.value.toLowerCase().trim() === brandLower) {
                cb.checked = true;
                foundMatch = true;
            } else if (cb.value !== 'all') {
                cb.checked = false;
            }
        });

        if (foundMatch) {
            const allBrandCb = document.querySelector(".brands-checkbox[value='all']");
            if (allBrandCb) allBrandCb.checked = false;
        }
    }

    allCheckboxes.forEach(cb => {
        cb.addEventListener("change", () => {
            handleAllCheckbox(cb);
            filterCards();
        });
    });

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            allCheckboxes.forEach(cb => cb.checked = false);

            const allPrice = document.querySelector(".price-checkbox[value='all']");
            const allBrand = document.querySelector(".brands-checkbox[value='all']");

            if (allPrice) allPrice.checked = true;
            if (allBrand) allBrand.checked = true;

            if (searchInput) searchInput.value = "";
            filterCards();
        });
    }

    function filterCards() {
        const selectedPrices = getCheckedValues(priceCheckboxes);
        const selectedBrands = getCheckedValues(brandCheckboxes);
        const searchText = searchInput ? searchInput.value.toLowerCase().trim() : "";

        cards.forEach(card => {
            const rawPrice = card.dataset.price || "";
            const price = parseInt(String(rawPrice).replace(/[^\d]/g, ""), 10) || 0;
            const brand = (card.dataset.brand || "").toLowerCase().trim();
            const titleEl = card.querySelector(".card-title, .content h2, h2");
            const cardTitle = titleEl ? titleEl.textContent.toLowerCase().trim() : "";

            const priceMatch = checkPrice(price, selectedPrices);
            
            let brandMatch = false;
            if (selectedBrands.length === 0 || selectedBrands.includes("all")) {
                brandMatch = true;
            } else {
                brandMatch = selectedBrands.some(b => {
                    const bLower = b.toLowerCase().trim();
                    if (!bLower || bLower === "all") return true;
                    return brand === bLower || brand.includes(bLower) || cardTitle.includes(bLower);
                });
            }

            const searchMatch = searchText === "" || cardTitle.includes(searchText) || brand.includes(searchText);

            const isVisible = (priceMatch && brandMatch && searchMatch);
            const targetContainer = card.closest('.product-card-link') || card.parentElement || card;
            if (targetContainer) {
                if (isVisible) {
                    targetContainer.style.setProperty("display", "block", "important");
                } else {
                    targetContainer.style.setProperty("display", "none", "important");
                }
            }
        });
    }

    function getCheckedValues(checkboxes) {
        return Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
    }

    function checkPrice(price, selectedPrices) {
        if (selectedPrices.length === 0 || selectedPrices.includes("all")) return true;

        return selectedPrices.some(range => {
            const rLower = range.toLowerCase().trim();
            if (rLower === "all") return true;
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

        const anyChecked = Array.from(group).some(cb => cb.checked);
        if (!anyChecked) {
            const allCb = Array.from(group).find(cb => cb.value === "all");
            if (allCb) allCb.checked = true;
        }
    }

    filterCards();

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            filterCards();
        });
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTripodFilters);
} else {
    initTripodFilters();
}
