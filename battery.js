document.addEventListener("DOMContentLoaded", () => {
	const cards = document.querySelectorAll(".tripod-cards");

	const priceCheckboxes = document.querySelectorAll(".price-checkbox");
	const brandCheckboxes = document.querySelectorAll(".brands-checkbox");
	const categoryCheckboxes = document.querySelectorAll(".category-checkbox");

	const allCheckboxes = document.querySelectorAll("input[type='checkbox']");
	const resetBtn = document.getElementById("reset-btn");
	const searchInput = document.querySelector('.options input[type="text"]');
	const searchIcon = document.querySelector('.options label i.fa-magnifying-glass');

	const urlParams = new URLSearchParams(window.location.search);
	const searchQuery = urlParams.get("search");

	if (searchQuery && searchInput) {
		searchInput.value = searchQuery;
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
			document.querySelector(".price-checkbox[value='all']").checked = true;
			document.querySelector(".brands-checkbox[value='all']").checked = true;
			document.querySelector(".category-checkbox[value='all']").checked = true;
			filterCards();
		});
	}

	function filterCards() {
		const selectedPrices = getCheckedValues(priceCheckboxes);
		const selectedBrands = getCheckedValues(brandCheckboxes);
		const selectedCategories = getCheckedValues(categoryCheckboxes);
		const searchText = (searchInput ? searchInput.value : "").toLowerCase();

		let visibleCount = 0;

		cards.forEach(card => {
			const price = parseInt(card.dataset.price, 10);
			const brand = card.dataset.brand;
			const category = card.dataset.category;
			const cardTitle = card.querySelector(".content h2").textContent.toLowerCase();

			const priceMatch = checkPrice(price, selectedPrices);
			const brandMatch = selectedBrands.includes("all") || selectedBrands.includes(brand);
			const categoryMatch = selectedCategories.includes("all") || selectedCategories.includes(category);
			const searchMatch = cardTitle.includes(searchText);

			const isVisible = priceMatch && brandMatch && categoryMatch && searchMatch;
			card.parentElement.style.display = isVisible ? "flex" : "none";

			if (isVisible) visibleCount++;
		});

		const noResultsMessage = document.getElementById("noResultsMessage");
		if (noResultsMessage) {
			const hasActiveSearch = searchText.trim() !== "";
			const hasActiveFilter = !selectedPrices.includes("all") ||
				!selectedBrands.includes("all") ||
				!selectedCategories.includes("all");

			const shouldShowNoResults = visibleCount === 0 && (hasActiveSearch || hasActiveFilter);
			noResultsMessage.classList.toggle("active", shouldShowNoResults);
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
				case "Under 3000": return price <= 3000;
				case "3000-6000": return price > 3000 && price <= 6000;
				case "6000-10000": return price > 6000 && price <= 10000;
				case "Over 10000": return price > 10000;
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
	}

	function getTargetPageFromQuery(rawText, fallbackPage = "battery.html") {
		const text = rawText.trim().toLowerCase();
		if (!text) return fallbackPage;

		const categoryRules = [
			{ page: "battery.html", keywords: ["battery", "batteries", "rechargeable", "lithium", "apramatt", "canon lp", "sony np", "nikon en-el", "fujifilm np", "digitek", "en-el25", "lp-e10", "np-fz100", "en-el14", "np-w235", "lp-e6"] },
			{ page: "storage.html", keywords: ["storage", "memory", "sd card", "sdxc", "sdhc", "cfexpress", "sandisk", "lexar", "prograde", "angelbird"] },
			{ page: "camera.html", keywords: ["camera", "dslr", "mirrorless", "eos", "alpha", "camera body"] },
			{ page: "tripod.html", keywords: ["tripod", "manfrotto", "sirui", "gitzo", "mefoto", "peak design", "befree"] },
			{ page: "microphones.html", keywords: ["mic", "microphone", "audio", "boya", "simpex", "wireless mic", "dm-e100"] },
			{ page: "lightings.html", keywords: ["light", "lighting", "flash", "speedlite", "ring light", "digitek", "el-100", "600ex"] },
			{ page: "gimbal.html", keywords: ["gimbal", "stabilizer", "dji", "osmo", "ronin", "om 5", "mobile 7"] },
			{ page: "Lens.html", keywords: ["lens", "lenses", "macro", "50mm", "24-105", "55-250", "70-200", "70-300", "100-400"] },
			{ page: "bagpack.html", keywords: ["bag", "bags", "backpack", "camera bag", "carry case", "mobius", "camsafe", "nikon bag", "sony bag"] },
			{ page: "accessories.html", keywords: ["accessory", "accessories", "cleaning"] }
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

		const targetPage = getTargetPageFromQuery(query, "battery.html");
		window.location.href = `${targetPage}?search=${encodeURIComponent(query)}`;
	}

	if (searchInput) {
		searchInput.addEventListener("input", filterCards);

		searchInput.addEventListener("keydown", (e) => {
			if (e.key === "Enter") {
				routeSearchByCategory();
			}
		});
	}

	if (searchIcon) {
		searchIcon.addEventListener("click", routeSearchByCategory);
	}

	const clearSearchBtn = document.getElementById("clearSearchBtn");
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

	filterCards();

	const loginModal = document.getElementById("loginModal");
	const closeLoginModal = document.getElementById("closeLoginModal");
	const closeLoginBtn = document.getElementById("closeLoginBtn");
	const allLoginButtons = document.querySelectorAll(".login, .login2");

	allLoginButtons.forEach(button => {
		button.addEventListener("click", (e) => {
			e.preventDefault();
			if (loginModal) loginModal.classList.add("active");
		});
	});

	if (closeLoginModal) {
		closeLoginModal.addEventListener("click", () => {
			if (loginModal) loginModal.classList.remove("active");
		});
	}

	if (closeLoginBtn) {
		closeLoginBtn.addEventListener("click", () => {
			if (loginModal) loginModal.classList.remove("active");
		});
	}

	if (loginModal) {
		loginModal.addEventListener("click", (e) => {
			if (e.target === loginModal) loginModal.classList.remove("active");
		});
	}
});
