document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".camera-cards");
    const priceCheckboxes = document.querySelectorAll(".price-checkbox");
    const brandCheckboxes = document.querySelectorAll(".brands-checkbox");
    const categoryCheckboxes = document.querySelectorAll(".category-checkbox");
    const allCheckboxes = document.querySelectorAll("input[type='checkbox']");
    const resetBtn = document.getElementById("reset-btn");
    const searchInput = document.querySelector('.options input[type="text"]');

    // Filter checkbox change listener
    allCheckboxes.forEach(cb => {
        cb.addEventListener("change", () => {
            handleAllCheckbox(cb);
            filterCards();
        });
    });

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            allCheckboxes.forEach(cb => cb.checked = false);

            document.getElementById("price-check-all").checked = true;
            document.getElementById("brands-check-all").checked = true;
            document.getElementById("category-check-all").checked = true;

            filterCards();
        });
    }

    // Input text search list refinement
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            filterCards();
        });
    }

    function filterCards() {
        const selectedPrices = getCheckedValues(priceCheckboxes);
        const selectedBrands = getCheckedValues(brandCheckboxes);
        const selectedCategories = getCheckedValues(categoryCheckboxes);
        const searchText = searchInput ? searchInput.value.toLowerCase().trim() : "";

        let visibleCount = 0;

        cards.forEach(card => {
            const price = parseInt(card.dataset.price) || 0;
            const brand = card.dataset.brand ? card.dataset.brand.toLowerCase() : "";
            const category = card.dataset.category ? card.dataset.category.toLowerCase() : "";
            const cardTitle = card.querySelector(".content h2").textContent.toLowerCase();

            const priceMatch = checkPrice(price, selectedPrices);
            const brandMatch = selectedBrands.includes("all") || selectedBrands.includes(brand);
            const categoryMatch = selectedCategories.includes("all") || selectedCategories.includes(category);
            const searchMatch = cardTitle.includes(searchText);

            const isVisible = priceMatch && brandMatch && categoryMatch && searchMatch;
            
            // Show/hide card element parent anchor
            const cardAnchor = card.parentElement;
            if (cardAnchor && cardAnchor.tagName === "A") {
                cardAnchor.style.display = isVisible ? "block" : "none";
            } else {
                card.style.display = isVisible ? "block" : "none";
            }

            if (isVisible) visibleCount++;
        });

        // Toggle "No results" message block
        const noResultsMessage = document.getElementById("noResultsMessage");
        if (noResultsMessage) {
            noResultsMessage.style.display = visibleCount === 0 ? "block" : "none";
        }
    }

    function getCheckedValues(checkboxes) {
        return Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value.toLowerCase());
    }

    function checkPrice(price, selectedPrices) {
        if (selectedPrices.includes("all")) return true;

        return selectedPrices.some(range => {
            switch (range) {
                case "under 5000": return price <= 5000;
                case "5000-20000": return price > 5000 && price <= 20000;
                case "20000-50000": return price > 20000 && price <= 50000;
                case "over 50000": return price > 50000;
                default: return false;
            }
        });
    }

    function handleAllCheckbox(changedCheckbox) {
        let group;

        if (changedCheckbox.classList.contains("price-checkbox")) {
            group = priceCheckboxes;
        } else if (changedCheckbox.classList.contains("brands-checkbox")) {
            group = brandCheckboxes;
        } else if (changedCheckbox.classList.contains("category-checkbox")) {
            group = categoryCheckboxes;
        }

        if (!group) return;

        if (changedCheckbox.value === "all" && changedCheckbox.checked) {
            group.forEach(cb => {
                if (cb !== changedCheckbox) cb.checked = false;
            });
        } else if (changedCheckbox.value !== "all" && changedCheckbox.checked) {
            group.forEach(cb => {
                if (cb.value === "all") cb.checked = false;
            });
        }

        // If all unchecked in a group, check the "all" option
        const anyChecked = Array.from(group).some(cb => cb.checked);
        if (!anyChecked) {
            const allCheckbox = Array.from(group).find(cb => cb.value === "all");
            if (allCheckbox) allCheckbox.checked = true;
        }
    }
});
