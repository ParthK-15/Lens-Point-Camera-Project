(function () {
    const scriptElement = document.currentScript;
    const baseUrl = new URL('.', scriptElement.src);
    const contactButtons = '.buy-btn';
    const loginButtons = '.login, .login2, .interested';

    const state = {
        contactReady: false,
        loginReady: false,
        contactPromise: null,
        loginPromise: null,
    };

    function ensureStyle() {
        if (document.getElementById('popup-styles')) {
            return;
        }

        const link = document.createElement('link');
        link.id = 'popup-styles';
        link.rel = 'stylesheet';
        link.href = new URL('popup.css', baseUrl).href;
        document.head.appendChild(link);
    }

    function appendFragment(html, markerId) {
        if (document.getElementById(markerId)) {
            return;
        }

        const template = document.createElement('template');
        template.innerHTML = html.trim();
        document.body.appendChild(template.content.firstElementChild);
    }

    async function loadFragment(fileName, markerId) {
        const response = await fetch(new URL(fileName, baseUrl).href, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`Unable to load ${fileName}`);
        }
        appendFragment(await response.text(), markerId);
    }

    async function ensureContactModal() {
        if (state.contactReady) {
            return;
        }
        if (!state.contactPromise) {
            state.contactPromise = loadFragment('contact-popup.html', 'contactModal').then(() => {
                state.contactReady = true;
            }).catch(() => {});
        }
        await state.contactPromise;
    }

    async function ensureLoginModal() {
        if (state.loginReady || document.getElementById('loginModal')) {
            state.loginReady = true;
            return;
        }
        if (!state.loginPromise) {
            state.loginPromise = loadFragment('login-popup.html', 'loginModal').then(() => {
                state.loginReady = true;
            }).catch(() => {});
        }
        await state.loginPromise;
    }

    function openModal(modal) {
        if (!modal) {
            return;
        }
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('popup-open');
    }

    function closeModal(modal) {
        if (!modal) {
            return;
        }
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('popup-open');
    }

    function bindModal(modalSelector, closeSelector, triggerSelector, loadModal) {
        const triggers = document.querySelectorAll(triggerSelector);
        if (!triggers.length) {
            return;
        }

        triggers.forEach((button) => {
            button.addEventListener('click', async (event) => {
                event.preventDefault();
                await loadModal();
                openModal(document.querySelector(modalSelector));
            });
        });

        document.addEventListener('click', (event) => {
            const closeButton = event.target.closest(closeSelector);
            if (closeButton) {
                closeModal(document.querySelector(modalSelector));
                return;
            }

            const modal = document.querySelector(modalSelector);
            if (modal && event.target === modal) {
                closeModal(modal);
            }
        });
    }

    function init() {
        ensureStyle();
        bindModal('#contactModal', '[data-popup-close="contact"]', contactButtons, ensureContactModal);
        
        const logBtns = document.querySelectorAll(loginButtons);
        logBtns.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const currentPath = window.location.pathname + window.location.search;
                window.location.href = `/auth/login?returnTo=${encodeURIComponent(currentPath)}`;
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
