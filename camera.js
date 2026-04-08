document.addEventListener("DOMContentLoaded", () => {

    const cards = document.querySelectorAll(".camera-cards");

    const priceCheckboxes = document.querySelectorAll(".price-checkbox");
    const brandCheckboxes = document.querySelectorAll(".brands-checkbox");
    const categoryCheckboxes = document.querySelectorAll(".category-checkbox");

    const allCheckboxes = document.querySelectorAll("input[type='checkbox']");
    const resetBtn = document.getElementById("reset-btn"); // ✅ moved inside

    // Attach checkbox listeners
    allCheckboxes.forEach(cb => {
        cb.addEventListener("change", () => {
            handleAllCheckbox(cb);
            filterCards();
        });
    });

    // ✅ RESET BUTTON (INSIDE)
    resetBtn.addEventListener("click", () => {

        // Reset all checkboxes
        allCheckboxes.forEach(cb => cb.checked = false);

        // Set "All" checked
        document.querySelector(".price-checkbox[value='all']").checked = true;
        document.querySelector(".brands-checkbox[value='all']").checked = true;
        document.querySelector(".category-checkbox[value='all']").checked = true;

        // Re-run filter
        filterCards();
    });

    // FILTER FUNCTION
    function filterCards() {
        const selectedPrices = getCheckedValues(priceCheckboxes);
        const selectedBrands = getCheckedValues(brandCheckboxes);
        const selectedCategories = getCheckedValues(categoryCheckboxes);

        cards.forEach(card => {
            const price = parseInt(card.dataset.price);
            const brand = card.dataset.brand;
            const category = card.dataset.category;

            const priceMatch = checkPrice(price, selectedPrices);
            const brandMatch = selectedBrands.includes("all") || selectedBrands.includes(brand);
            const categoryMatch = selectedCategories.includes("all") || selectedCategories.includes(category);

            card.style.display = (priceMatch && brandMatch && categoryMatch) ? "flex" : "none";
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

});