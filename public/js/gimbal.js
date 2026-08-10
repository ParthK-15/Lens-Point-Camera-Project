document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".camera-cards");
    const priceCheckboxes = document.querySelectorAll(".price-checkbox");
    const brandCheckboxes = document.querySelectorAll(".brands-checkbox");
    const resetBtn = document.getElementById("reset-btn");

    function getCheckedValues(checkboxes) {
        return Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
    }

    function filterCards() {
        const selectedPrices = getCheckedValues(priceCheckboxes);
        const selectedBrands = getCheckedValues(brandCheckboxes);

        cards.forEach(card => {
            const price = parseInt(card.dataset.price, 10);
            const brand = card.dataset.brand;

            let priceMatch = false;
            let brandMatch = false;

            if (selectedPrices.includes("all")) {
                priceMatch = true;
            } else {
                priceMatch = selectedPrices.some(range => {
                    if (range === "under-15000") return price < 15000;
                    if (range === "15000-25000") return price >= 15000 && price <= 25000;
                    if (range === "25000-40000") return price > 25000 && price <= 40000;
                    if (range === "over-40000") return price > 40000;
                });
            }

            if (selectedBrands.includes("all")) {
                brandMatch = true;
            } else {
                brandMatch = selectedBrands.includes(brand);
            }

            if (priceMatch && brandMatch) {
                card.parentElement.style.display = "block";
            } else {
                card.parentElement.style.display = "none";
            }
        });

        fixLayout();
    }

    function handleAllLogic(checkboxes) {
        checkboxes.forEach(cb => {
            cb.addEventListener("change", () => {
                if (cb.value === "all" && cb.checked) {
                    checkboxes.forEach(other => {
                        if (other !== cb) other.checked = false;
                    });
                } else {
                    checkboxes.forEach(other => {
                        if (other.value === "all") other.checked = false;
                    });
                }
                filterCards();
            });
        });
    }

    handleAllLogic(priceCheckboxes);
    handleAllLogic(brandCheckboxes);

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            priceCheckboxes.forEach(cb => cb.checked = false);
            brandCheckboxes.forEach(cb => cb.checked = false);
            document.querySelector(".price-checkbox[value='all']").checked = true;
            document.querySelector(".brands-checkbox[value='all']").checked = true;
            filterCards();
        });
    }

    function fixLayout() {
        const visibleCards = Array.from(cards).filter(card => card.parentElement.style.display !== "none");
        visibleCards.forEach(card => {
            card.style.marginRight = "1rem";
        });
        visibleCards.forEach((card, index) => {
            if ((index + 1) % 3 === 0) {
                card.style.marginRight = "0";
            }
        });
    }

    filterCards();
});
