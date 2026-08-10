/* ═══════════════════════════════════════════════════════════════
   USER NAV — Client-side Auth State & Profile Dropdown
   Works on ALL pages (static HTML + EJS templates)
   ═══════════════════════════════════════════════════════════════ */
(function () {
  const LOGIN_SELECTORS = ".login, .login2, .interested";
  let userData = null;

  // ── Utilities ─────────────────────────────────────────────
  function getInitials(name) {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  }

  function showToast(msg) {
    let toast = document.getElementById("userToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "userToast";
      toast.className = "user-toast";
      toast.innerHTML = '<i class="fa-solid fa-circle-check"></i><span></span>';
      document.body.appendChild(toast);
    }
    toast.querySelector("span").textContent = msg;
    toast.classList.add("active");
    setTimeout(() => toast.classList.remove("active"), 3000);
  }

  // ── Build Dropdown HTML ───────────────────────────────────
  function buildDropdownHTML(user) {
    const initials = getInitials(user.name);
    const firstName = user.name.split(" ")[0];

    const hasAddress = user.address && user.address.trim() !== "";
    const hasPhone = user.phone && user.phone.trim() !== "";

    return `
      <div class="user-dropdown-overlay" id="userDropdownOverlay"></div>
      <div class="user-dropdown" id="userDropdown">
        <div class="user-dropdown-header">
          <button class="user-dropdown-close" id="userDropdownClose">
            <i class="fa-solid fa-xmark"></i>
          </button>
          <div class="user-dropdown-avatar">${initials}</div>
          <p class="user-dropdown-name">${user.name}</p>
          <p class="user-dropdown-email">${user.email}</p>
        </div>
        <div class="user-dropdown-body">

          <div class="user-dropdown-section">
            <div class="user-dropdown-section-title">Account Info</div>
            <div class="user-info-card">
              <div class="user-info-row">
                <i class="fa-solid fa-envelope"></i>
                <div class="user-info-content">
                  <span class="user-info-label">Email</span>
                  <span class="user-info-value">${user.email}</span>
                </div>
              </div>
              <div class="user-info-row">
                <i class="fa-solid fa-phone"></i>
                <div class="user-info-content">
                  <span class="user-info-label">Phone</span>
                  <span class="user-info-value ${hasPhone ? "" : "empty"}" id="userPhoneDisplay">
                    ${hasPhone ? user.phone : "Not added yet"}
                  </span>
                </div>
              </div>
              <div class="user-info-row">
                <i class="fa-solid fa-location-dot"></i>
                <div class="user-info-content">
                  <span class="user-info-label">Address</span>
                  <span class="user-info-value ${hasAddress ? "" : "empty"}" id="userAddressDisplay">
                    ${hasAddress ? user.address : "Not added yet"}
                  </span>
                </div>
              </div>
            </div>
            ${
              !hasAddress || !hasPhone
                ? `<div class="user-address-alert" id="userEditProfileAlert">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <span>Please complete your profile for faster checkout</span>
                  </div>`
                : ""
            }
          </div>

          <ul class="user-dropdown-menu">
            <li>
              <button id="userEditProfileBtn">
                <i class="fa-solid fa-pen-to-square"></i>
                Edit Profile
              </button>
            </li>
            <li>
              <a href="/orders">
                <i class="fa-solid fa-box"></i>
                My Orders
              </a>
            </li>
            <li>
              <a href="/cart.html">
                <i class="fa-solid fa-cart-shopping"></i>
                My Cart
              </a>
            </li>
            <div class="user-dropdown-divider"></div>
            <li>
              <a href="/auth/logout" class="user-menu-logout">
                <i class="fa-solid fa-right-from-bracket"></i>
                Log Out
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Edit Profile Modal -->
      <div class="user-edit-overlay" id="userEditOverlay">
        <div class="user-edit-modal">
          <h3>Edit Profile</h3>
          <p>Update your contact details for a smoother checkout experience.</p>
          <div class="user-edit-field">
            <label for="userEditPhone">Phone Number</label>
            <input type="tel" id="userEditPhone" placeholder="e.g. 9876543210"
              value="${user.phone || ""}">
          </div>
          <div class="user-edit-field">
            <label for="userEditAddress">Shipping Address</label>
            <textarea id="userEditAddress" placeholder="Street, City, State, Pincode">${user.address || ""}</textarea>
          </div>
          <div class="user-edit-actions">
            <button class="user-edit-cancel" id="userEditCancel">Cancel</button>
            <button class="user-edit-save" id="userEditSave">Save Changes</button>
          </div>
        </div>
      </div>
    `;
  }

  // ── Replace Login Buttons ─────────────────────────────────
  function replaceLoginButtons(user) {
    const initials = getInitials(user.name);
    const buttons = document.querySelectorAll(LOGIN_SELECTORS);

    buttons.forEach((btn) => {
      const avatar = document.createElement("button");
      avatar.className = "user-avatar-btn";
      avatar.textContent = initials;
      avatar.title = `Signed in as ${user.name}`;
      avatar.setAttribute("aria-label", "Open profile menu");
      avatar.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openDropdown();
      });

      btn.replaceWith(avatar);
    });
  }

  // ── Dropdown Open / Close ─────────────────────────────────
  function openDropdown() {
    const dropdown = document.getElementById("userDropdown");
    const overlay = document.getElementById("userDropdownOverlay");
    if (dropdown) dropdown.classList.add("active");
    if (overlay) overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeDropdown() {
    const dropdown = document.getElementById("userDropdown");
    const overlay = document.getElementById("userDropdownOverlay");
    if (dropdown) dropdown.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  // ── Edit Profile Modal ────────────────────────────────────
  function openEditModal() {
    const modal = document.getElementById("userEditOverlay");
    if (modal) modal.classList.add("active");
  }

  function closeEditModal() {
    const modal = document.getElementById("userEditOverlay");
    if (modal) modal.classList.remove("active");
  }

  async function saveProfile() {
    const phone = document.getElementById("userEditPhone").value.trim();
    const address = document.getElementById("userEditAddress").value.trim();

    try {
      const res = await fetch("/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, address }),
      });

      const data = await res.json();
      if (data.success) {
        // Update displayed values
        const phoneDisplay = document.getElementById("userPhoneDisplay");
        const addressDisplay = document.getElementById("userAddressDisplay");

        if (phoneDisplay) {
          phoneDisplay.textContent = phone || "Not added yet";
          phoneDisplay.className = "user-info-value" + (phone ? "" : " empty");
        }
        if (addressDisplay) {
          addressDisplay.textContent = address || "Not added yet";
          addressDisplay.className =
            "user-info-value" + (address ? "" : " empty");
        }

        // Remove alert if both fields are filled
        if (phone && address) {
          const alert = document.getElementById("userEditProfileAlert");
          if (alert) alert.remove();
        }

        closeEditModal();
        showToast("Profile updated successfully!");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
    }
  }

  // ── Bind Events ───────────────────────────────────────────
  function bindEvents() {
    document
      .getElementById("userDropdownClose")
      ?.addEventListener("click", closeDropdown);
    document
      .getElementById("userDropdownOverlay")
      ?.addEventListener("click", closeDropdown);
    document
      .getElementById("userEditProfileBtn")
      ?.addEventListener("click", openEditModal);
    document
      .getElementById("userEditProfileAlert")
      ?.addEventListener("click", openEditModal);
    document
      .getElementById("userEditCancel")
      ?.addEventListener("click", closeEditModal);
    document
      .getElementById("userEditSave")
      ?.addEventListener("click", saveProfile);

    // Close edit modal on overlay click
    document.getElementById("userEditOverlay")?.addEventListener("click", (e) => {
      if (e.target.id === "userEditOverlay") closeEditModal();
    });

    // Escape key closes everything
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeEditModal();
        closeDropdown();
      }
    });
  }

  // ── Global Search Redirects ────────────────────────────────
  function bindGlobalSearch() {
    const desktopSearchInput = document.querySelector('.options input[type="text"]');
    const desktopOptions = document.querySelector('.options');
    const mobileSearchInput = document.querySelector(".inputMobile");
    const mobileSearchIcon = document.getElementById("searchButton");
    const mobileSearchWrap = document.querySelector(".searchIcon");

    // 1. Setup Clear Button and Autocomplete Dropdown for Desktop
    if (desktopOptions && desktopSearchInput) {
      if (!desktopSearchInput.getAttribute("placeholder")) {
        desktopSearchInput.setAttribute("placeholder", "Search cameras, lenses, accessories...");
      }

      let inputWrapper = desktopOptions.querySelector(".search-input-wrapper");
      if (!inputWrapper) {
        inputWrapper = document.createElement("div");
        inputWrapper.className = "search-input-wrapper";
        inputWrapper.style.position = "relative";
        desktopSearchInput.parentNode.insertBefore(inputWrapper, desktopSearchInput);
        inputWrapper.appendChild(desktopSearchInput);
      }

      let clearBtn = inputWrapper.querySelector(".search-clear-btn");
      if (!clearBtn) {
        clearBtn = document.createElement("i");
        clearBtn.className = "fa-solid fa-xmark search-clear-btn";
        inputWrapper.appendChild(clearBtn);
      }

      let dropdown = document.getElementById("search-dropdown");
      if (!dropdown) {
        dropdown = document.createElement("div");
        dropdown.id = "search-dropdown";
        dropdown.className = "search-autocomplete-dropdown";
        desktopOptions.appendChild(dropdown);
      }

      let debounceTimer = null;

      function updateSearchUI() {
        const val = desktopSearchInput.value.trim();
        if (val.length > 0) {
          clearBtn.style.display = "block";
        } else {
          clearBtn.style.display = "none";
          dropdown.classList.remove("active");
          dropdown.innerHTML = "";
        }
      }

      function highlightText(text, query) {
        if (!query || !text) return text || "";
        const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escaped})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
      }

      desktopSearchInput.addEventListener("input", () => {
        updateSearchUI();
        const query = desktopSearchInput.value.trim();

        clearTimeout(debounceTimer);
        if (query.length < 2) {
          dropdown.classList.remove("active");
          dropdown.innerHTML = "";
          return;
        }

        // Show spinner while fetching
        dropdown.innerHTML = `
          <div class="search-autocomplete-loading">
            <div class="search-spinner"></div>
            <span>Searching...</span>
          </div>
        `;
        dropdown.classList.add("active");

        debounceTimer = setTimeout(async () => {
          try {
            const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            const results = data.results || data.products || [];

            if (results.length === 0) {
              dropdown.innerHTML = `<div class="search-autocomplete-empty">No cameras or accessories found for "${query}"</div>`;
            } else {
              let html = results.map(item => {
                const formattedPrice = item.price
                  ? (typeof item.price === 'number' ? '₹' + item.price.toLocaleString('en-IN') : String(item.price))
                  : '';
                const brandCategory = `📷 ${item.brand || 'Brand'} • ${item.category || 'Category'}`;
                const highlightedName = highlightText(item.name || item.title, query);

                return `
                  <a href="/product/${item.slug || item._id}" class="search-autocomplete-item">
                    <img src="${item.imageUrl || item.image || '/assets/images/placeholder.png'}" alt="${item.name || item.title}">
                    <div class="search-autocomplete-info">
                      <div class="search-autocomplete-title">${highlightedName}</div>
                      <div class="search-autocomplete-category">${brandCategory}</div>
                    </div>
                    <div class="search-autocomplete-price">${formattedPrice}</div>
                  </a>
                `;
              }).join('');
              html += `<a href="/search?q=${encodeURIComponent(query)}" class="search-autocomplete-footer">View all results for "${query}" →</a>`;
              dropdown.innerHTML = html;
            }
            dropdown.classList.add("active");
          } catch (e) {
            console.error("Autocomplete error:", e);
            dropdown.innerHTML = `<div class="search-autocomplete-empty">Error loading search results</div>`;
          }
        }, 300);
      });

      clearBtn.addEventListener("click", () => {
        desktopSearchInput.value = "";
        updateSearchUI();
        desktopSearchInput.focus();
      });

      document.addEventListener("click", (e) => {
        if (!desktopOptions.contains(e.target) && !dropdown.contains(e.target)) {
          dropdown.classList.remove("active");
        }
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          dropdown.classList.remove("active");
        }
      });
    }

    // 2. Setup Clear Button for Mobile Search Input
    if (mobileSearchWrap && mobileSearchInput) {
      let mobileClearBtn = mobileSearchWrap.querySelector(".search-clear-btn");
      if (!mobileClearBtn) {
        mobileClearBtn = document.createElement("i");
        mobileClearBtn.className = "fa-solid fa-xmark search-clear-btn";
        mobileSearchWrap.appendChild(mobileClearBtn);
      }

      mobileSearchInput.addEventListener("input", () => {
        if (mobileSearchInput.value.trim().length > 0) {
          mobileClearBtn.style.display = "inline-block";
        } else {
          mobileClearBtn.style.display = "none";
        }
      });

      mobileClearBtn.addEventListener("click", () => {
        mobileSearchInput.value = "";
        mobileClearBtn.style.display = "none";
        mobileSearchInput.focus();
      });
    }

    function triggerGlobalSearch(input) {
      if (!input) return;
      const query = input.value.trim();
      if (query) {
        window.location.href = `/search?q=${encodeURIComponent(query)}`;
      }
    }

    if (desktopSearchInput) {
      desktopSearchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          triggerGlobalSearch(desktopSearchInput);
        }
      });
    }
    const desktopSearchIcon = document.querySelector('.options i.fa-magnifying-glass') || document.querySelector('.options label');
    if (desktopSearchIcon) {
      desktopSearchIcon.addEventListener("click", (e) => {
        e.preventDefault();
        triggerGlobalSearch(desktopSearchInput);
      });
    }
    if (mobileSearchInput) {
      mobileSearchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          triggerGlobalSearch(mobileSearchInput);
        }
      });
    }
    if (mobileSearchIcon) {
      mobileSearchIcon.addEventListener("click", (e) => {
        e.preventDefault();
        triggerGlobalSearch(mobileSearchInput);
      });
    }
  }

  function updateCartBadges() {
    let totalCount = 0;
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      cart.forEach(item => {
        totalCount += (item.quantity || 1);
      });
    } catch (e) {}
    
    const badges = document.querySelectorAll(".cart-count, .cart-count-mobile");
    badges.forEach(badge => {
      badge.innerText = totalCount;
    });
  }

  // ── Mobile Product Filter & Sort By Controls ─────────────────────
  function initMobileProductControls() {
    const cardContainer = document.querySelector(
      ".main-camera-cards, .main-tripod-cards, .main-accessories-cards, .main-lens-cards, .main-gimbal-cards, .main-battery-cards, .main-storage-cards, .main-microphone-cards, .main-lighting-cards, .cards-container, .products-grid"
    );
    const sidebar = document.querySelector(".sidebar:not(aside .sidebar)");

    // Only run on product listing pages (pages with cards or sidebar)
    if (!cardContainer && !sidebar) return;

    // 1. Inject Mobile Bottom Toolbar
    if (!document.getElementById("mobileProductsToolbar")) {
      const toolbar = document.createElement("div");
      toolbar.className = "mobile-products-toolbar";
      toolbar.id = "mobileProductsToolbar";
      toolbar.innerHTML = `
        <button type="button" class="mobile-toolbar-btn" id="mobileFilterBtn">
          <i class="fa-solid fa-sliders"></i> Filter
        </button>
        <div class="mobile-toolbar-divider"></div>
        <button type="button" class="mobile-toolbar-btn" id="mobileSortBtn">
          <i class="fa-solid fa-arrow-down-short-wide"></i> Sort By
        </button>
      `;
      document.body.appendChild(toolbar);
    }

    // 2. Inject Backdrops & Mobile Sort Sheet Modal
    if (!document.getElementById("mobileFilterBackdrop")) {
      const filterBackdrop = document.createElement("div");
      filterBackdrop.className = "mobile-filter-backdrop";
      filterBackdrop.id = "mobileFilterBackdrop";
      document.body.appendChild(filterBackdrop);
    }

    if (!document.getElementById("mobileSortBackdrop")) {
      const sortBackdrop = document.createElement("div");
      sortBackdrop.className = "mobile-sort-backdrop";
      sortBackdrop.id = "mobileSortBackdrop";
      document.body.appendChild(sortBackdrop);
    }

    if (!document.getElementById("mobileSortSheet")) {
      const sortSheet = document.createElement("div");
      sortSheet.className = "mobile-sort-sheet";
      sortSheet.id = "mobileSortSheet";
      sortSheet.innerHTML = `
        <div class="sort-sheet-header">
          <h3>Sort By</h3>
          <button type="button" class="sort-sheet-close" id="mobileSortClose">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <ul class="sort-options-list">
          <li>
            <button type="button" class="sort-option-btn selected" data-sort="default">
              <span>Default</span> <i class="fa-solid fa-check check-icon"></i>
            </button>
          </li>
          <li>
            <button type="button" class="sort-option-btn" data-sort="price-asc">
              <span>Price: Low to High</span> <i class="fa-solid fa-check check-icon"></i>
            </button>
          </li>
          <li>
            <button type="button" class="sort-option-btn" data-sort="price-desc">
              <span>Price: High to Low</span> <i class="fa-solid fa-check check-icon"></i>
            </button>
          </li>
          <li>
            <button type="button" class="sort-option-btn" data-sort="name-asc">
              <span>Name: A to Z</span> <i class="fa-solid fa-check check-icon"></i>
            </button>
          </li>
          <li>
            <button type="button" class="sort-option-btn" data-sort="name-desc">
              <span>Name: Z to A</span> <i class="fa-solid fa-check check-icon"></i>
            </button>
          </li>
        </ul>
      `;
      document.body.appendChild(sortSheet);
    }

    // 3. Open / Close Filter Drawer Handlers
    const filterBtn = document.getElementById("mobileFilterBtn");
    const filterBackdrop = document.getElementById("mobileFilterBackdrop");
    const filterCloseBtn = document.getElementById("mobileFilterClose");

    function openFilterDrawer() {
      if (sidebar) sidebar.classList.add("mobile-open");
      if (filterBackdrop) filterBackdrop.classList.add("active");
      document.body.style.overflow = "hidden";
    }

    function closeFilterDrawer() {
      if (sidebar) sidebar.classList.remove("mobile-open");
      if (filterBackdrop) filterBackdrop.classList.remove("active");
      document.body.style.overflow = "";
    }

    if (filterBtn) filterBtn.addEventListener("click", openFilterDrawer);
    if (filterBackdrop) filterBackdrop.addEventListener("click", closeFilterDrawer);
    if (filterCloseBtn) filterCloseBtn.addEventListener("click", closeFilterDrawer);

    // 5. Open / Close Sort Sheet Handlers & Real-time DOM Sorting
    const sortBtn = document.getElementById("mobileSortBtn");
    const sortSheet = document.getElementById("mobileSortSheet");
    const sortBackdrop = document.getElementById("mobileSortBackdrop");
    const sortCloseBtn = document.getElementById("mobileSortClose");
    const sortOptionBtns = document.querySelectorAll(".sort-option-btn");

    function openSortSheet() {
      if (sortSheet) sortSheet.classList.add("active");
      if (sortBackdrop) sortBackdrop.classList.add("active");
      document.body.style.overflow = "hidden";
    }

    function closeSortSheet() {
      if (sortSheet) sortSheet.classList.remove("active");
      if (sortBackdrop) sortBackdrop.classList.remove("active");
      document.body.style.overflow = "";
    }

    if (sortBtn) sortBtn.addEventListener("click", openSortSheet);
    if (sortBackdrop) sortBackdrop.addEventListener("click", closeSortSheet);
    if (sortCloseBtn) sortCloseBtn.addEventListener("click", closeSortSheet);

    // Store original card elements array for restoring Default order
    let initialCardItems = [];
    if (cardContainer) {
      // Find the direct children of cardContainer (either <a> tags wrapping cards or card divs)
      initialCardItems = Array.from(cardContainer.children).filter(child => {
        return child.matches("a, .camera-cards, .tripod-cards, .accessories-cards, .product-card");
      });
    }

    function parsePrice(item) {
      const cardEl = item.querySelector(".camera-cards, .tripod-cards, .accessories-cards, .product-card") || item;
      if (cardEl.dataset && cardEl.dataset.price) {
        return parseFloat(cardEl.dataset.price) || 0;
      }
      const priceEl = item.querySelector(".price, .card-price, .product-price");
      if (priceEl) {
        const cleaned = priceEl.textContent.replace(/[^0-9.]/g, "");
        return parseFloat(cleaned) || 0;
      }
      return 0;
    }

    function parseTitle(item) {
      const cardEl = item.querySelector(".camera-cards, .tripod-cards, .accessories-cards, .product-card") || item;
      const titleEl = cardEl.querySelector("h2, h3, .card-title, .product-title");
      return titleEl ? titleEl.textContent.trim().toLowerCase() : "";
    }

    function sortCards(sortMode) {
      if (!cardContainer || initialCardItems.length === 0) return;

      const itemsToSort = [...initialCardItems];

      itemsToSort.sort((a, b) => {
        if (sortMode === "price-asc") {
          return parsePrice(a) - parsePrice(b);
        } else if (sortMode === "price-desc") {
          return parsePrice(b) - parsePrice(a);
        } else if (sortMode === "name-asc") {
          return parseTitle(a).localeCompare(parseTitle(b));
        } else if (sortMode === "name-desc") {
          return parseTitle(b).localeCompare(parseTitle(a));
        }
        // Default order
        return initialCardItems.indexOf(a) - initialCardItems.indexOf(b);
      });

      // Re-append items in sorted order
      itemsToSort.forEach(item => {
        cardContainer.appendChild(item);
      });
    }

    sortOptionBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        sortOptionBtns.forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        const sortMode = btn.dataset.sort;
        sortCards(sortMode);
        closeSortSheet();
      });
    });
  }

  function ensureMobileNavbar() {
    let aside = document.querySelector("aside");
    if (!aside) {
      aside = document.createElement("aside");
      aside.innerHTML = `
        <input type="checkbox" id="check">
        <div class="btn_one">
            <label for="check">
                <i class="fa-solid fa-bars"></i>
            </label>
        </div>
        <div class="mainbox">
            <div class="btn_two">
                <label for="check">
                    <i class="fa-solid fa-xmark"></i>
                </label>
            </div>
            <div class="sidebar">
                <div class="head">
                    <a href="/"><img src="/assets/images/logo.jpeg" alt="Sumati Colour Lab Logo" class="mobile-menu-logo"></a>
                </div>
                <hr>
                <div class="sidebar_menu">
                    <a href="/">Home</a>
                    <a href="/products">Camera</a>
                    <a href="/lenses">Lens</a>
                    <a href="/accessories">Accessories</a>
                    <a href="#" class="cart-anchor-mobile">
                        <i class="fa-solid fa-cart-shopping"></i> Cart
                        <span class="cart-count-mobile">0</span>
                    </a>
                </div>
            </div>
        </div>
        <div class="searchIcon">
            <input type="text" placeholder="Search" class="inputMobile">
            <label for="input">
                <i class="fa-solid fa-magnifying-glass" id="searchButton"></i>
            </label>
            <button class="login2">Log In</button>
        </div>
      `;
      const header = document.querySelector("header");
      if (header && header.nextSibling) {
        header.parentNode.insertBefore(aside, header.nextSibling);
      } else {
        document.body.insertBefore(aside, document.body.firstChild);
      }
    } else {
      const head = aside.querySelector(".head");
      if (head && !head.querySelector(".mobile-menu-logo")) {
        head.innerHTML = `<a href="/"><img src="/assets/images/logo.jpeg" alt="Sumati Colour Lab Logo" class="mobile-menu-logo"></a>`;
      }
    }
  }

  // ── Init ──────────────────────────────────────────────────
  async function init() {
    ensureMobileNavbar();
    bindGlobalSearch();
    initMobileProductControls();
    try {
      const res = await fetch("/auth/me");
      userData = await res.json();

      if (!userData.loggedIn) {
        if (localStorage.getItem("isLoggedIn") === "true") {
          localStorage.removeItem("cart");
        }
        localStorage.setItem("isLoggedIn", "false");
        updateCartBadges();
        return;
      }
      
      // Merge local cart and DB cart on login/session restoration
      let localCart = [];
      try {
        localCart = JSON.parse(localStorage.getItem("cart") || "[]");
      } catch (e) {
        localCart = [];
      }

      const dbCart = userData.cart || [];
      let mergedCart = [...dbCart];

      if (localCart.length > 0) {
        localCart.forEach(localItem => {
          const existing = mergedCart.find(dbItem => dbItem.title === localItem.title);
          if (existing) {
            existing.quantity = (existing.quantity || 1) + (localItem.quantity || 1);
            if (localItem.desc && !existing.desc) {
              existing.desc = localItem.desc;
            }
          } else {
            mergedCart.push(localItem);
          }
        });
        
        // Sync the merged cart back to the database
        await fetch("/auth/cart/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart: mergedCart }),
        });
      }

      localStorage.setItem("cart", JSON.stringify(mergedCart));
      localStorage.setItem("isLoggedIn", "true");
      updateCartBadges();

      // Inject dropdown HTML
      const container = document.createElement("div");
      container.innerHTML = buildDropdownHTML(userData);
      while (container.firstElementChild) {
        document.body.appendChild(container.firstElementChild);
      }

      // Replace login buttons with profile avatars
      replaceLoginButtons(userData);

      // Bind events
      bindEvents();
    } catch (err) {
      console.error("user-nav init error:", err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

