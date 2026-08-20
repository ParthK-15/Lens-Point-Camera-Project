(function () {
    try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        let count = 0;
        cart.forEach(item => {
            count += (item.quantity || 1);
        });

        const style = document.createElement('style');
        style.id = 'cart-temp-styles';
        style.innerHTML = `
            .cart-count { font-size: 0 !important; }
            .cart-count::before { content: "${count}" !important; font-size: 1rem !important; }
            .cart-count-mobile { font-size: 0 !important; }
            .cart-count-mobile::before { content: "${count}" !important; font-size: 1rem !important; }
        `;
        document.head.appendChild(style);
    } catch (e) {}
})();
