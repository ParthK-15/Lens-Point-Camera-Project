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
    const desktopSearchIcon = document.querySelector('.options i.fa-magnifying-glass') || document.querySelector('.options label');
    const mobileSearchInput = document.querySelector(".inputMobile");
    const mobileSearchIcon = document.getElementById("searchButton");

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

  // ── Init ──────────────────────────────────────────────────
  async function init() {
    bindGlobalSearch();
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
