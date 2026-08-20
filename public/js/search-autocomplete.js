/* ═══════════════════════════════════════════════════════════════
   LIVE AUTO-COMPLETE SEARCH DROPDOWN
   E-Commerce Camera & Photography Store (Sumati Colour Lab)
   ═══════════════════════════════════════════════════════════════ */

(function () {
    if (window.__searchAutocompleteLoaded) return;
    window.__searchAutocompleteLoaded = true;

    let debounceTimer = null;
    let activeQuery = "";
    let activeIndex = -1; // Currently highlighted dropdown item index

    function init() {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", initSearchAutocomplete);
        } else {
            initSearchAutocomplete();
        }
    }

    function initSearchAutocomplete() {
        const inputWrappers = document.querySelectorAll(".options, .search-box-container, .searchIcon");

        inputWrappers.forEach((wrapper) => {
            const input = wrapper.querySelector("input[type='text'], .inputMobile");
            if (!input || input.dataset.autocompleteInitialized) return;

            input.dataset.autocompleteInitialized = "true";

            // 1. Ensure search container & input styling setup
            wrapper.classList.add("search-box-container");

            // Wrap input inside a dedicated search-input-wrapper if not already wrapped
            let inputWrapper = input.closest(".search-input-wrapper");
            if (!inputWrapper) {
                inputWrapper = document.createElement("div");
                inputWrapper.className = "search-input-wrapper";
                inputWrapper.style.position = "relative";
                inputWrapper.style.display = "inline-flex";
                inputWrapper.style.alignItems = "center";
                input.parentNode.insertBefore(inputWrapper, input);
                inputWrapper.appendChild(input);
            }

            // Set placeholder if default or missing
            if (!input.placeholder || input.placeholder === "Search") {
                input.placeholder = "Search cameras, lenses, accessories...";
            }
            input.setAttribute("autocomplete", "off");
            input.classList.add("search-input");

            // 2. Add Dynamic Clear Button (✕) inside inputWrapper
            let clearBtn = inputWrapper.querySelector(".search-clear-btn");
            if (!clearBtn) {
                clearBtn = document.createElement("button");
                clearBtn.type = "button";
                clearBtn.className = "search-clear-btn";
                clearBtn.setAttribute("aria-label", "Clear search");
                clearBtn.innerHTML = "✕";
                clearBtn.style.display = "none";
                inputWrapper.appendChild(clearBtn);
            }

            // 3. Create or attach search dropdown container
            let dropdown = wrapper.querySelector("#search-dropdown, .search-dropdown");
            if (!dropdown) {
                dropdown = document.createElement("div");
                dropdown.id = "search-dropdown";
                dropdown.className = "search-dropdown search-autocomplete-dropdown";
                dropdown.style.display = "none";
                wrapper.appendChild(dropdown);
            }

            // 4. Input Event Listener with 150ms Debouncing
            input.addEventListener("focus", () => {
                if (window.innerWidth <= 768 && window.location.pathname !== "/mobile-search") {
                    window.location.href = "/mobile-search";
                }
            });

            input.addEventListener("input", (e) => {
                if (window.innerWidth <= 768 && window.location.pathname !== "/mobile-search") {
                    window.location.href = "/mobile-search";
                    return;
                }

                const query = e.target.value.trim();
                activeQuery = query;
                activeIndex = -1;

                // Toggle Clear Button
                clearBtn.style.display = query.length > 0 ? "flex" : "none";

                // Clear previous debounce timer
                if (debounceTimer) clearTimeout(debounceTimer);

                if (query.length < 1) {
                    hideDropdown(dropdown);
                    return;
                }

                // Show loading spinner immediately
                showSpinner(dropdown);

                // Debounce API call by 200ms
                debounceTimer = setTimeout(() => {
                    fetchSearchResults(query, dropdown);
                }, 200);
            });

            // 5. Clear Button Click Handler
            clearBtn.addEventListener("click", () => {
                input.value = "";
                activeQuery = "";
                activeIndex = -1;
                clearBtn.style.display = "none";
                hideDropdown(dropdown);
                input.focus();
            });

            // 6. Keyboard Navigation: Arrow Up/Down, Enter, Escape
            input.addEventListener("keydown", (e) => {
                const items = dropdown.querySelectorAll(".search-dropdown-item");

                if (e.key === "Escape") {
                    hideDropdown(dropdown);
                    activeIndex = -1;
                } else if (e.key === "ArrowDown") {
                    e.preventDefault();
                    if (items.length === 0) return;
                    activeIndex = (activeIndex + 1) % items.length;
                    updateHighlight(items, activeIndex);
                } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    if (items.length === 0) return;
                    activeIndex = activeIndex <= 0 ? items.length - 1 : activeIndex - 1;
                    updateHighlight(items, activeIndex);
                } else if (e.key === "Enter") {
                    e.preventDefault();
                    if (activeIndex >= 0 && activeIndex < items.length) {
                        // Navigate to the highlighted product
                        const href = items[activeIndex].getAttribute("href");
                        if (href) {
                            hideDropdown(dropdown);
                            window.location.href = href;
                        }
                    }
                }
            });

            // Re-open dropdown on focus if text >= 1
            input.addEventListener("focus", () => {
                if (input.value.trim().length >= 1 && dropdown.children.length > 0) {
                    showDropdown(dropdown);
                }
            });
        });

        // 7. Auto-close dropdown when clicking outside
        document.addEventListener("click", (e) => {
            const openContainers = document.querySelectorAll(".search-box-container");
            openContainers.forEach((container) => {
                const dropdown = container.querySelector("#search-dropdown, .search-dropdown, .search-autocomplete-dropdown");
                if (dropdown && !container.contains(e.target)) {
                    hideDropdown(dropdown);
                }
            });
        });
    }

    // ── Fetch Search Results from Express API ───────────────────────
    async function fetchSearchResults(query, dropdown) {
        try {
            const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error("Search network error");

            const data = await response.json();
            const results = Array.isArray(data) ? data : (data.results || data.products || []);

            // Check if user updated query during active network fetch
            if (query !== activeQuery) return;

            renderDropdown(results, query, dropdown);
        } catch (err) {
            console.error("Autocomplete search error:", err);
            renderErrorState(dropdown);
        }
    }

    // ── UI Render Functions ─────────────────────────────────────────
    function showSpinner(dropdown) {
        dropdown.innerHTML = `
            <div class="search-dropdown-status search-autocomplete-loading">
                <div class="search-spinner"></div>
                <span>Searching products...</span>
            </div>
        `;
        showDropdown(dropdown);
    }

    function renderDropdown(results, query, dropdown) {
        activeIndex = -1;

        if (!results || results.length === 0) {
            dropdown.innerHTML = `
                <div class="search-dropdown-empty search-autocomplete-empty">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <p>No products found for "<strong>${escapeHTML(query)}</strong>"</p>
                    <span class="search-empty-hint">Try searching for "Sony", "Canon", "Tripod"...</span>
                </div>
            `;
            showDropdown(dropdown);
            return;
        }

        // Results count header
        const headerHTML = `
            <div class="search-dropdown-header">
                <span>${results.length} result${results.length !== 1 ? 's' : ''} for "<strong>${escapeHTML(query)}</strong>"</span>
            </div>
        `;

        const itemsHTML = results.map((item, index) => {
            const highlightedTitle = highlightMatch(item.name || item.title || "", query);
            const brand = item.brand || item.company || "";
            const category = item.category || item.subCategory || "";
            const priceFormatted = formatCurrency(item.price);
            const imageUrl = item.imageUrl || item.image || "/assets/images/photo.jpg";
            const productUrl = `/product/${encodeURIComponent(item.slug || item._id)}`;

            // Brand + Category meta text
            const metaParts = [];
            if (brand) metaParts.push(escapeHTML(brand));
            if (category) metaParts.push(escapeHTML(category));
            const metaText = metaParts.join(" · ");

            return `
                <a href="${productUrl}" class="search-dropdown-item search-autocomplete-item" data-index="${index}">
                    <div class="search-item-thumb">
                        <img src="${escapeHTML(imageUrl)}" alt="${escapeHTML(item.name || item.title || '')}" class="search-item-img" onerror="this.src='/assets/images/photo.jpg'" loading="lazy" />
                    </div>
                    <div class="search-item-info search-autocomplete-info">
                        <div class="search-item-title search-autocomplete-title">${highlightedTitle}</div>
                        <div class="search-item-meta search-autocomplete-category">
                            <span>${metaText}</span>
                        </div>
                    </div>
                    <div class="search-item-price-wrap">
                        ${priceFormatted ? `<span class="search-item-price">${escapeHTML(priceFormatted)}</span>` : ''}
                    </div>
                </a>
            `;
        }).join("");

        dropdown.innerHTML = headerHTML + itemsHTML;
        showDropdown(dropdown);

        // Close dropdown when item link clicked
        dropdown.querySelectorAll(".search-dropdown-item").forEach((itemLink) => {
            itemLink.addEventListener("click", () => {
                hideDropdown(dropdown);
            });
        });
    }

    function renderErrorState(dropdown) {
        dropdown.innerHTML = `
            <div class="search-dropdown-empty search-autocomplete-empty">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <p>Unable to load search results. Please try again.</p>
            </div>
        `;
        showDropdown(dropdown);
    }

    function showDropdown(dropdown) {
        if (dropdown) {
            dropdown.style.display = "block";
            dropdown.style.zIndex = "999999";
            dropdown.classList.add("active");
        }
    }

    function hideDropdown(dropdown) {
        if (dropdown) {
            dropdown.style.display = "none";
            dropdown.classList.remove("active");
            activeIndex = -1;
        }
    }

    // ── Keyboard Highlight Helper ───────────────────────────────────
    function updateHighlight(items, index) {
        items.forEach((item, i) => {
            if (i === index) {
                item.classList.add("search-item-active");
                item.scrollIntoView({ block: "nearest", behavior: "smooth" });
            } else {
                item.classList.remove("search-item-active");
            }
        });
    }

    // ── Helper Utilities ────────────────────────────────────────────
    function highlightMatch(text, query) {
        if (!query) return escapeHTML(text);
        const escapedText = escapeHTML(text);
        const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`(${safeQuery})`, "gi");
        return escapedText.replace(regex, `<mark class="search-highlight">$1</mark>`);
    }

    function escapeHTML(str) {
        return String(str || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatCurrency(price) {
        if (typeof price === "number") {
            return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0
            }).format(price);
        }
        return price ? `₹${price}` : "";
    }

    init();
})();
