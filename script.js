const products = [
    { 
        id: 1, 
        name: "Modern Sectional Sofa", 
        category: "living-room",
        price: 1299.99, 
        material: "Fabric",
        dimensions: "98 x 65 x 34 inches",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80"
    },
    { 
        id: 2, 
        name: "King Size Bed Frame", 
        category: "bedroom",
        price: 899.99, 
        material: "Wood",
        dimensions: "80 x 76 x 48 inches",
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80"
    },
    { 
        id: 3, 
        name: "Artisan Leather Armchair", 
        category: "living-room",
        price: 549.00, 
        material: "Leather",
        dimensions: "34 x 32 x 36 inches",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80"
    },
    { 
        id: 4, 
        name: "Minimalist Solid Wood Nightstand", 
        category: "bedroom",
        price: 249.50, 
        material: "Wood",
        dimensions: "22 x 18 x 24 inches",
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1532372576444-dda954194ad0?auto=format&fit=crop&w=600&q=80"
    },
    { 
        id: 5, 
        name: "Rustic Oak Dining Table", 
        category: "dining",
        price: 849.00, 
        material: "Oak",
        dimensions: "72 x 36 x 30 inches",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80"
    },
    { 
        id: 6, 
        name: "Ceramic Top Kitchen Island", 
        category: "dining",
        price: 1120.00, 
        material: "Ceramic",
        dimensions: "60 x 30 x 36 inches",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80"
    },
    { 
        id: 7, 
        name: "Minimalist Solid Oak Desk", 
        category: "office",
        price: 389.00, 
        material: "Engineered Wood",
        dimensions: "55 x 28 x 30 inches",
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80"
    },
    { 
        id: 8, 
        name: "Ergonomic Task Chair", 
        category: "office",
        price: 260.00, 
        material: "Steel",
        dimensions: "26 x 26 x 40 inches",
        rating: 4.4,
        image: "https://images.unsplash.com/photo-1681418659069-eef28d44aeab?auto=format&fit=crop&w=1200&q=80"
    }
];

let cart = JSON.parse(localStorage.getItem("homemart_cart")) || [];

let wishlist = JSON.parse(localStorage.getItem("homemart_wishlist")) || [];

let users = JSON.parse(localStorage.getItem("homemart_users")) || [];
let currentUser = JSON.parse(localStorage.getItem("homemart_current_user")) || null;
let orderHistory = JSON.parse(localStorage.getItem("homemart_orders")) || [];

const activeFilters = {
    "living-room": { query: "", material: "all" },
    "bedroom": { query: "", material: "all" },
    "dining": { query: "", material: "all" },
    "office": { query: "", material: "all" }
};

document.addEventListener("DOMContentLoaded", () => {
    seedDefaultUser();
    renderAllProducts();
    updateCartCountUI();
    renderCart();
    renderCheckoutSummary();
    syncAuthUI();
    initScrollTracker();
    initMobileNav();

    const dateInput = document.getElementById("order-date");
    if (dateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.min = tomorrow.toISOString().split("T")[0];
    }
});

function seedDefaultUser() {
    if (users.length === 0) {
        users.push({
            name: "Demo Customer",
            email: "demo@homemart.com",
            password: "password123"
        });
        localStorage.setItem("homemart_users", JSON.stringify(users));
    }
}

function initMobileNav() {
    const btn = document.getElementById("mobile-menu-btn");
    const links = document.getElementById("nav-links");
    btn.addEventListener("click", () => links.classList.toggle("active"));

    document.querySelectorAll(".nav-links a").forEach(link => {
        link.addEventListener("click", () => links.classList.remove("active"));
    });
}

function initScrollTracker() {
    const sections = document.querySelectorAll("section");
    const navAnchors = document.querySelectorAll(".nav-links a");

    window.addEventListener("scroll", () => {
        let activeId = "";
        const scrollPosition = window.pageYOffset + 100;

        sections.forEach(sec => {
            if (scrollPosition >= sec.offsetTop && scrollPosition < sec.offsetTop + sec.offsetHeight) {
                activeId = sec.getAttribute("id");
            }
        });

        navAnchors.forEach(a => {
            a.classList.remove("active");
            if (a.getAttribute("href") === `#${activeId}`) {
                a.classList.add("active");
            }
        });
    });
}

function renderAllProducts() {
    ["living-room", "bedroom", "dining", "office"].forEach(cat => renderCategoryGrid(cat));
}

function filterProducts(category, searchVal, materialVal) {
    if (searchVal !== null) activeFilters[category].query = searchVal.toLowerCase().trim();
    if (materialVal !== null) activeFilters[category].material = materialVal;
    renderCategoryGrid(category);
}

function renderCategoryGrid(category) {
    const container = document.getElementById(`${category}-grid`);
    if (!container) return;

    const { query, material } = activeFilters[category];
    let items = products.filter(p => p.category === category);

    if (query) items = items.filter(p => p.name.toLowerCase().includes(query));
    if (material !== "all") items = items.filter(p => p.material.toLowerCase() === material.toLowerCase());

    if (items.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding: 25px; color: var(--text-muted);">No furniture items match your filter criteria.</p>`;
        return;
    }

    container.innerHTML = items.map(item => {
        const isWish = wishlist.includes(item.id);
        return `
            <div class="product-card">
                <button class="wishlist-toggle-btn ${isWish ? 'active' : ''}" onclick="toggleWishlist(${item.id})">
                    <i class="fas fa-heart"></i>
                </button>
                <div class="product-card-img">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                </div>
                <div class="product-card-body">
                    <h4>${item.name}</h4>
                    <div class="product-specs">
                        <span><strong>Material:</strong> ${item.material}</span> • 
                        <span><strong>Dimensions:</strong> ${item.dimensions}</span>
                    </div>
                    <div class="product-card-foot">
                        <div class="product-card-price">$${item.price.toFixed(2)}</div>
                        <button class="btn btn-primary btn-small" onclick="addToCart(${item.id})">
                            <i class="fas fa-cart-plus"></i> Add
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

function addToCart(productId) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }
    saveCart();
    renderCart();
    renderCheckoutSummary();
    showToast("Added item to your cart!");
}

function updateQuantity(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== productId);
    }
    saveCart();
    renderCart();
    renderCheckoutSummary();
}

function removeFromCart(productId) {
    cart = cart.filter(i => i.id !== productId);
    saveCart();
    renderCart();
    renderCheckoutSummary();
    showToast("Removed item from cart");
}

function saveCart() {
    localStorage.setItem("homemart_cart", JSON.stringify(cart));
    updateCartCountUI();
}

function updateCartCountUI() {
    const count = cart.reduce((sum, i) => sum + i.quantity, 0);
    document.querySelectorAll(".cart-count").forEach(elem => elem.textContent = count);
}

function getCartCalculations() {
    let subtotal = 0;
    cart.forEach(item => {
        const prod = products.find(p => p.id === item.id);
        if (prod) subtotal += prod.price * item.quantity;
    });
    const shipping = subtotal > 500 || subtotal === 0 ? 0 : 49.00;
    const tax = subtotal * 0.07;
    const total = subtotal + shipping + tax;
    return { subtotal, shipping, tax, total };
}

function renderCart() {
    const tableWrapper = document.getElementById("cart-table-wrapper");
    const summaryBox = document.getElementById("cart-summary-box");

    if (cart.length === 0) {
        tableWrapper.innerHTML = `
            <div style="text-align: center; padding: 40px; background: var(--white); border-radius: 8px;">
                <h3>Your Cart is Currently Empty</h3>
                <p style="color: var(--text-muted); margin: 8px 0 16px;">Add items from our collections above to furnish your room.</p>
                <a href="#living-room" class="btn btn-gold btn-small">Explore Living Room</a>
            </div>
        `;
        summaryBox.innerHTML = "";
        return;
    }

    let rows = cart.map(cartItem => {
        const prod = products.find(p => p.id === cartItem.id);
        if (!prod) return "";
        return `
            <tr>
                <td><strong>${prod.name}</strong></td>
                <td>$${prod.price.toFixed(2)}</td>
                <td>
                    <button class="cart-qty-btn" onclick="updateQuantity(${prod.id}, -1)">-</button>
                    <span style="margin: 0 8px;">${cartItem.quantity}</span>
                    <button class="cart-qty-btn" onclick="updateQuantity(${prod.id}, 1)">+</button>
                </td>
                <td>$${(prod.price * cartItem.quantity).toFixed(2)}</td>
                <td>
                    <button class="btn btn-outline btn-small" onclick="removeFromCart(${prod.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    tableWrapper.innerHTML = `
        <table class="cart-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Line Total</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;

    const { subtotal, shipping, tax, total } = getCartCalculations();
    summaryBox.innerHTML = `
        <h3>Order Summary</h3>
        <div class="summary-row"><span>Subtotal:</span><span>$${subtotal.toFixed(2)}</span></div>
        <div class="summary-row"><span>Delivery:</span><span>${shipping === 0 ? "FREE" : "$" + shipping.toFixed(2)}</span></div>
        <div class="summary-row"><span>Estimated Tax (7%):</span><span>$${tax.toFixed(2)}</span></div>
        <div class="summary-row summary-total"><span>Total:</span><span>$${total.toFixed(2)}</span></div>
        <a href="#checkout" class="btn btn-gold full-width" style="margin-top: 14px;">Proceed to Checkout &rarr;</a>
    `;
}

function renderCheckoutSummary() {
    const box = document.getElementById("checkout-summary-details");
    if (!box) return;

    const { subtotal, shipping, tax, total } = getCartCalculations();
    box.innerHTML = `
        <h3>Order Review</h3>
        <div style="margin: 12px 0;">
            ${cart.map(i => {
                const prod = products.find(p => p.id === i.id);
                return `<div class="mini-row"><span>${prod.name} × ${i.quantity}</span><span>$${(prod.price * i.quantity).toFixed(2)}</span></div>`;
            }).join("")}
        </div>
        <div class="summary-row"><span>Subtotal:</span><span>$${subtotal.toFixed(2)}</span></div>
        <div class="summary-row"><span>Delivery:</span><span>${shipping === 0 ? "FREE" : "$" + shipping.toFixed(2)}</span></div>
        <div class="summary-row"><span>Taxes:</span><span>$${tax.toFixed(2)}</span></div>
        <div class="summary-row summary-total"><span>Amount Due:</span><span>$${total.toFixed(2)}</span></div>
    `;
}

function handleCheckout(e) {
    e.preventDefault();
    if (cart.length === 0) {
        showToast("Your cart is empty. Please add furniture items.");
        return;
    }

    const { total } = getCartCalculations();
    const newOrder = {
        orderId: "HM-" + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleDateString(),
        deliveryDate: document.getElementById("order-date").value,
        total: total,
        recipient: document.getElementById("order-name").value,
        address: document.getElementById("order-address").value,
        payment: document.getElementById("order-payment").value,
        itemsCount: cart.reduce((sum, i) => sum + i.quantity, 0)
    };

    orderHistory.unshift(newOrder);
    localStorage.setItem("homemart_orders", JSON.stringify(orderHistory));

    cart = [];
    saveCart();
    renderCart();
    renderCheckoutSummary();
    e.target.reset();

    showToast(`Order #${newOrder.orderId} placed successfully!`);
    window.location.hash = "#account";
    syncAuthUI();
}

function switchAuthTab(type) {
    const loginForm = document.getElementById("login-form");
    const regForm = document.getElementById("register-form");
    const tabLogin = document.getElementById("tab-login");
    const tabReg = document.getElementById("tab-register");

    if (type === "login") {
        loginForm.classList.remove("hidden");
        regForm.classList.add("hidden");
        tabLogin.classList.add("active");
        tabReg.classList.remove("active");
    } else {
        loginForm.classList.add("hidden");
        regForm.classList.remove("hidden");
        tabLogin.classList.remove("active");
        tabReg.classList.add("active");
    }
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value.trim().toLowerCase();
    const password = document.getElementById("reg-password").value;

    if (users.some(u => u.email === email)) {
        showToast("An account with this email already exists.");
        return;
    }

    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem("homemart_users", JSON.stringify(users));

    currentUser = { name: newUser.name, email: newUser.email };
    localStorage.setItem("homemart_current_user", JSON.stringify(currentUser));

    e.target.reset();
    showToast(`Welcome to HomeMart, ${currentUser.name}!`);
    syncAuthUI();
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value;

    const matched = users.find(u => u.email === email && u.password === password);
    if (!matched) {
        showToast("Invalid credentials. Try demo login.");
        return;
    }

    currentUser = { name: matched.name, email: matched.email };
    localStorage.setItem("homemart_current_user", JSON.stringify(currentUser));

    e.target.reset();
    showToast(`Welcome back, ${currentUser.name}!`);
    syncAuthUI();
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem("homemart_current_user");
    showToast("Signed out successfully.");
    syncAuthUI();
}

function syncAuthUI() {
    const authBox = document.getElementById("auth-forms-container");
    const dashboard = document.getElementById("account-dashboard");
    const navAccountLink = document.getElementById("nav-account-link");

    if (currentUser) {
        authBox.classList.add("hidden");
        dashboard.classList.remove("hidden");
        navAccountLink.textContent = currentUser.name.split(" ")[0];

        document.getElementById("user-display-name").textContent = currentUser.name;
        document.getElementById("user-display-email").textContent = currentUser.email;
        document.getElementById("avatar-initials").textContent = currentUser.name.charAt(0).toUpperCase();

        renderWishlistPanel();
        renderOrdersPanel();
    } else {
        authBox.classList.remove("hidden");
        dashboard.classList.add("hidden");
        navAccountLink.textContent = "Account";
    }
}

function toggleWishlist(productId) {
    if (wishlist.includes(productId)) {
        wishlist = wishlist.filter(id => id !== productId);
        showToast("Removed from wishlist");
    } else {
        wishlist.push(productId);
        showToast("Saved to your wishlist!");
    }
    localStorage.setItem("homemart_wishlist", JSON.stringify(wishlist));
    renderAllProducts();
    if (currentUser) renderWishlistPanel();
}

function renderWishlistPanel() {
    const container = document.getElementById("wishlist-container");
    const badge = document.getElementById("wishlist-badge");
    badge.textContent = wishlist.length;

    if (wishlist.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); padding: 10px 0;">No saved items in your wishlist.</p>`;
        return;
    }

    container.innerHTML = wishlist.map(id => {
        const prod = products.find(p => p.id === id);
        if (!prod) return "";
        return `
            <div class="mini-row">
                <div>
                    <strong>${prod.name}</strong>
                    <div style="font-size: 0.8rem; color: var(--primary);">$${prod.price.toFixed(2)}</div>
                </div>
                <div>
                    <button class="btn btn-primary btn-small" onclick="addToCart(${prod.id})">Add</button>
                    <button class="btn btn-outline btn-small" onclick="toggleWishlist(${prod.id})">Remove</button>
                </div>
            </div>
        `;
    }).join("");
}

function renderOrdersPanel() {
    const container = document.getElementById("orders-container");
    if (orderHistory.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); padding: 10px 0;">No past orders recorded yet.</p>`;
        return;
    }

    container.innerHTML = orderHistory.map(ord => `
        <div style="padding: 10px 0; border-bottom: 1px solid var(--border-light);">
            <div style="display: flex; justify-content: space-between; font-weight: 700;">
                <span>#${ord.orderId}</span>
                <span style="color: var(--primary);">$${ord.total.toFixed(2)}</span>
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
                Placed: ${ord.date} • ${ord.itemsCount} item(s) • Est. Delivery: ${ord.deliveryDate}
            </div>
        </div>
    `).join("");
}

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
}
