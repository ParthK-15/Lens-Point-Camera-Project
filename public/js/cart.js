(function () {
    // ── Inject CSS Styles dynamically for Cart Page Layout & Badge Animations ──
    function injectStyles() {
        if (document.getElementById('cart-global-styles')) return;
        const style = document.createElement('style');
        style.id = 'cart-global-styles';
        style.innerHTML = `
            /* Badge Pop Animation */
            @keyframes badgePop {
                0% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.8);
                    background-color: #ff4500;
                }
                100% {
                    transform: scale(1);
                }
            }
            .badge-bounce {
                animation: badgePop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                transform-origin: center;
            }
        `;
        document.head.appendChild(style);
    }

    // ── Helper to update all cart badge numbers with animation ──
    function updateCartBadges(animate = false) {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        let totalCount = 0;
        cart.forEach(item => {
            totalCount += (item.quantity || 1);
        });

        const badges = document.querySelectorAll('.cart-count, .cart-count-mobile');
        badges.forEach(badge => {
            if (animate) {
                badge.classList.remove('badge-bounce');
                void badge.offsetWidth; // Trigger reflow to restart animation
                badge.classList.add('badge-bounce');
                
                setTimeout(() => {
                    badge.innerText = totalCount;
                }, 200); // changes count text when badge is at max scale (50% keyframe)
                
                setTimeout(() => {
                    badge.classList.remove('badge-bounce');
                }, 500);
            } else {
                badge.innerText = totalCount;
            }
        });
    }

    function syncNavbarState() {
        const tempStyles = document.getElementById('cart-temp-styles');
        if (tempStyles) {
            tempStyles.remove();
        }
        updateCartBadges(false);
        const interestedBtn = document.querySelector('.interested') || document.querySelector('.login') || document.querySelector('.login2');
        if (interestedBtn) {
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            interestedBtn.innerText = isLoggedIn ? 'Log Out' : 'Log In';
        }
    }

    // Run immediately when script evaluates to prevent 1-second lag/flash
    syncNavbarState();

    // ── Render dynamic cart list inside dedicated cart.html ──
    function renderDedicatedCartPage() {
        const cartItemsContainer = document.getElementById('cartPageItemsList');
        const layoutContainer = document.getElementById('cartLayoutContainer');
        const subtotalEl = document.getElementById('summarySubtotal');
        const totalEl = document.getElementById('summaryTotal');
        if (!cartItemsContainer) return;

        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cartItemsContainer.innerHTML = '';
        let totalSum = 0;

        if (cart.length === 0) {
            if (layoutContainer) {
                layoutContainer.classList.add('empty-cart-layout');
                layoutContainer.innerHTML = `
                    <div class="empty-cart-view" style="width: 100%;">
                        <i class="fa-solid fa-cart-shopping"></i>
                        <h2>Your Cart is Empty</h2>
                        <p>You haven't added any products to your cart yet. Explore our cameras and lenses to get started!</p>
                        <a href="/" class="shop-now-btn">Start Shopping</a>
                    </div>
                `;
            }
            return;
        }

        if (layoutContainer) {
            layoutContainer.classList.remove('empty-cart-layout');
        }

        cart.forEach((item, index) => {
            const numericPrice = parseInt(item.price.replace(/[^\d]/g, '')) || 0;
            const quantity = item.quantity || 1;
            const itemSubtotal = numericPrice * quantity;
            totalSum += itemSubtotal;

            const itemEl = document.createElement('div');
            itemEl.className = 'cart-page-item';
            itemEl.innerHTML = `
                <img src="${item.image}" alt="${item.title}">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-desc">${item.desc || 'Product Details'}</div>
                </div>
                <div class="cart-qty-container">
                    <button type="button" class="qty-btn qty-minus" data-index="${index}">
                        <i class="fa-solid fa-minus"></i>
                    </button>
                    <span class="qty-value">${quantity}</span>
                    <button type="button" class="qty-btn qty-plus" data-index="${index}">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
                <div class="cart-item-price-column">
                    <div class="cart-item-subtotal">₹${itemSubtotal.toLocaleString('en-IN')}/-</div>
                    <div class="cart-item-unit-price">${item.price} each</div>
                </div>
                <button type="button" class="cart-item-delete-btn" data-index="${index}" aria-label="Delete item">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            `;
            cartItemsContainer.appendChild(itemEl);
        });

        if (subtotalEl) subtotalEl.innerText = `₹${totalSum.toLocaleString('en-IN')}/-`;
        if (totalEl) totalEl.innerText = `₹${totalSum.toLocaleString('en-IN')}/-`;

        // Bind events for quantity adjustments
        document.querySelectorAll('.qty-plus').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                updateQuantity(index, 1);
            });
        });

        document.querySelectorAll('.qty-minus').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                updateQuantity(index, -1);
            });
        });

        document.querySelectorAll('.cart-item-delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                deleteCartItem(index);
            });
        });
    }

    async function syncCartToDb() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (isLoggedIn) {
            try {
                const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                await fetch('/auth/cart/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cart })
                });
            } catch (e) {
                console.error('Error syncing cart to DB:', e);
            }
        }
    }

    async function updateQuantity(index, change) {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (cart[index]) {
            const currentQty = cart[index].quantity || 1;
            const newQty = currentQty + change;
            if (newQty >= 1) {
                cart[index].quantity = newQty;
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartBadges(true);
                renderDedicatedCartPage();
                await syncCartToDb();
            }
        }
    }

    async function deleteCartItem(index) {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadges(true);
        renderDedicatedCartPage();
        await syncCartToDb();
    }

    // ── Add dynamic mock login button inside login modal body ──
    function checkAndInjectMockLogin() {
        const loginModal = document.getElementById('loginModal');
        if (!loginModal) return;

        const modalBody = loginModal.querySelector('.login-modal-body');
        if (modalBody && !document.getElementById('mockLoginBtn')) {
            const mockBtn = document.createElement('button');
            mockBtn.type = 'button';
            mockBtn.id = 'mockLoginBtn';
            mockBtn.style.width = '100%';
            mockBtn.style.marginTop = '20px';
            mockBtn.style.padding = '12px';
            mockBtn.style.borderRadius = '25px';
            mockBtn.style.border = '2px dashed orange';
            mockBtn.style.background = 'transparent';
            mockBtn.style.color = 'orange';
            mockBtn.style.fontWeight = 'bold';
            mockBtn.style.fontSize = '0.95rem';
            mockBtn.style.cursor = 'pointer';
            mockBtn.style.transition = 'all 0.3s';

            const updateMockBtnText = () => {
                const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
                mockBtn.innerText = isLoggedIn ? 'Logout (Mock Session)' : 'Log In (Mock Session)';
            };

            updateMockBtnText();

            mockBtn.addEventListener('click', () => {
                const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
                localStorage.setItem('isLoggedIn', !isLoggedIn ? 'true' : 'false');
                updateMockBtnText();

                const interestedBtn = document.querySelector('.interested') || document.querySelector('.login') || document.querySelector('.login2');
                if (interestedBtn) {
                    interestedBtn.innerText = !isLoggedIn ? 'Log Out' : 'Log In';
                }

                alert(!isLoggedIn ? 'Mock Login successful! You can now Add to Cart.' : 'Mock Logout successful!');
                
                const closeBtn = document.getElementById('closeLoginModal') || document.getElementById('closeLoginBtn');
                if (closeBtn) closeBtn.click();
                
                location.reload();
            });

            mockBtn.addEventListener('mouseenter', () => {
                mockBtn.style.background = 'orange';
                mockBtn.style.color = 'black';
            });
            mockBtn.addEventListener('mouseleave', () => {
                mockBtn.style.background = 'transparent';
                mockBtn.style.color = 'orange';
            });

            modalBody.appendChild(mockBtn);
        }
    }

    // ── Init Cart logic ──
    function init() {
        injectStyles();
        syncNavbarState();

        // 1. Sync header navbar Log In/Log Out click handler
        const interestedBtn = document.querySelector('.interested') || document.querySelector('.login') || document.querySelector('.login2');
        if (interestedBtn) {
            interestedBtn.addEventListener('click', (e) => {
                const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
                if (loggedIn) {
                    e.preventDefault();
                    e.stopPropagation();
                    localStorage.setItem('isLoggedIn', 'false');
                    interestedBtn.innerText = 'Log In';
                    alert('Logged out successfully.');
                    location.reload();
                }
            });
        }

        // 2. Click on cart icon redirects to dedicated cart page
        document.querySelectorAll('.cart-anchor, .cart-anchor-mobile').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = '/cart.html';
            });
        });

        // 3. Render Dedicated Page if loaded
        if (window.location.pathname.endsWith('cart.html') || window.location.pathname.includes('cart.html')) {
            renderDedicatedCartPage();
            
            const checkoutPageBtn = document.getElementById('checkoutBtnPage');
            if (checkoutPageBtn) {
                checkoutPageBtn.addEventListener('click', () => {
                    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
                    if (!isLoggedIn) {
                        window.location.href = '/auth/login?returnTo=/checkout';
                    } else {
                        window.location.href = '/checkout';
                    }
                });
            }
        }

        // 4. Bind Add to Cart buttons (.cart-btn)
        document.querySelectorAll('.cart-btn').forEach(btn => {
            btn.addEventListener('click', async function (e) {
                e.preventDefault();
                e.stopPropagation();

                const titleEl = document.querySelector('.product-info h1') || document.querySelector('.storage-info h1') || document.querySelector('.tripod-info h1') || document.querySelector('.lens-info h1') || document.querySelector('.camera-info h1');
                const priceEl = document.querySelector('.product-info .price') || document.querySelector('.storage-info .price') || document.querySelector('.tripod-info .price') || document.querySelector('.lens-info .price') || document.querySelector('.camera-info .price');
                const imgEl = document.getElementById('slider-img');
                const descEl = document.querySelector('.desc');

                if (titleEl && priceEl) {
                    const title = titleEl.innerText.trim();
                    const price = priceEl.innerText.trim();
                    const image = imgEl ? imgEl.src : '/assets/images/placeholder.png';
                    const desc = descEl ? descEl.innerText.trim() : '';

                    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                    const existingItem = cart.find(item => item.title === title);
                    if (existingItem) {
                        existingItem.quantity = (existingItem.quantity || 1) + 1;
                        if (desc && !existingItem.desc) {
                            existingItem.desc = desc;
                        }
                    } else {
                        cart.push({ title, price, image, quantity: 1, desc });
                    }
                    localStorage.setItem('cart', JSON.stringify(cart));

                    updateCartBadges(true);
                    await syncCartToDb();
                }
            });
        });

        setInterval(checkAndInjectMockLogin, 500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Sync state whenever page is restored from back-forward cache (bfcache)
    window.addEventListener('pageshow', function (event) {
        syncNavbarState();
    });
})();
