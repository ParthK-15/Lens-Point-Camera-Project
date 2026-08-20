const check = document.getElementById("check");

if (check) {
    check.addEventListener("change", function () {
        if (this.checked) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    });
}

const tagline = document.querySelector(".tag_line");

window.addEventListener("load", () => {
    if (!tagline) return;

    tagline.style.opacity = "0";
    tagline.style.transform = "translateY(50px)";

    setTimeout(() => {
        tagline.style.transition = "1s";
        tagline.style.opacity = "1";
        tagline.style.transform = "translateY(0)";
    }, 200);
});

// Helper function to bind click redirection
function bindClickRedirect(selector, targetUrl) {
    const element = document.querySelector(selector);
    if (element) {
        element.addEventListener("click", () => {
            window.location.href = targetUrl;
        });
    }
}

// ── Category Card Redirects ──────────────────────────────────
bindClickRedirect(".camera-card", "/products");
bindClickRedirect(".lens-card", "/lenses");
bindClickRedirect(".tripod-content", "/tripods");
bindClickRedirect(".lights-content", "/category/lighting");
bindClickRedirect(".microphone-content", "/category/microphone");
bindClickRedirect(".batteries-content", "/category/battery");
bindClickRedirect(".storage", "/category/storage");
bindClickRedirect(".gimbal-content", "/category/gimbal");
bindClickRedirect(".bags-content", "/category/bag");
// ── Brand Card Redirects ─────────────────────────────────────
bindClickRedirect(".sony", "/products");
bindClickRedirect(".canon", "/products");
bindClickRedirect(".nikon", "/products");
bindClickRedirect(".gopro", "/products");

const desktopSearchInput = document.querySelector('.options input[type="text"]');
const mobileSearchInput = document.querySelector(".inputMobile");

if (desktopSearchInput) {
    desktopSearchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
        }
    });
}

if (mobileSearchInput) {
    mobileSearchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
        }
    });
}

if (mobileSearchIcon) {
    mobileSearchIcon.addEventListener("click", () => {
        routeHomeSearch(mobileSearchInput);
    });
}