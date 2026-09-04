// =========================================================================
// MOTOR DE CARRITO GLOBAL DEL ECOSISTEMA BAZAR NFL GDL (IAWC_MASTER_CART)
// =========================================================================
const MASTER_STORAGE_KEY = 'IAWC_MASTER_CART';

function getCart() {
    try {
        const raw = localStorage.getItem(MASTER_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
        const legacy = localStorage.getItem('ecosystem_global_cart') || localStorage.getItem('cart_items');
        if (legacy) {
            const parsed = JSON.parse(legacy);
            saveCart(parsed);
            return parsed;
        }
        return [];
    } catch(e) { return []; }
}

function saveCart(cart) {
    try {
        const json = JSON.stringify(cart);
        localStorage.setItem(MASTER_STORAGE_KEY, json);
        localStorage.setItem('ecosystem_global_cart', json);
        localStorage.setItem('cart_items', json);
    } catch(e) {}
    updateCartCounter();
}

function updateCartCounter() {
    const cart = getCart();
    const totalCount = cart.reduce((acc, item) => acc + (parseInt(item.qty || item.quantity) || 1), 0);
    const subtotal = cart.reduce((acc, item) => acc + ((parseFloat(item.price || item.precio) || 0) * (parseInt(item.qty || item.quantity) || 1)), 0);
    document.querySelectorAll('#boutique-cart-badge, .cart-badge, #cart-count').forEach(el => {
        el.textContent = totalCount;
    });
    document.querySelectorAll('#boutique-cart-total, .cart-total').forEach(el => {
        el.textContent = `$${subtotal.toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2})} MXN`;
    });
}

function changeQty(sku, delta) {
    let cart = getCart();
    const item = cart.find(i => (i.sku === sku || i.id === sku));
    if (!item) return;
    item.quantity = (parseInt(item.qty || item.quantity) || 1) + delta;
    item.qty = item.quantity;
    if (item.quantity <= 0) {
        cart = cart.filter(i => (i.sku !== sku && i.id !== sku));
    }
    saveCart(cart);
}

function removeCartItem(sku) {
    let cart = getCart();
    cart = cart.filter(i => (i.sku !== sku && i.id !== sku));
    saveCart(cart);
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartCounter();
});

window.addEventListener('storage', (e) => {
    if (e.key === MASTER_STORAGE_KEY || e.key === 'ecosystem_global_cart' || e.key === 'cart_items') {
        updateCartCounter();
    }
});
