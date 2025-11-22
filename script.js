// ================================
// CONFIGURACIÓN GENERAL
// ================================
const WHATSAPP_NUMBER = "5493417420359";
const body = document.body;

// Theme + Cart buttons
const themeToggleBtn = document.getElementById("theme-toggle");
const cartToggleBtn = document.getElementById("cart-toggle");
const cartPanel = document.getElementById("cart-panel");
const cartOverlay = document.getElementById("cart-overlay");
const cartCloseBtn = document.getElementById("cart-close");
const cartItemsList = document.getElementById("cart-items");
const cartEmptyText = document.getElementById("cart-empty");
const cartTotalSpan = document.getElementById("cart-total");
const cartCountSpan = document.getElementById("cart-count");
const cartSendWhatsAppBtn = document.getElementById("cart-send-whatsapp");
const cartClearBtn = document.getElementById("cart-clear");
const floatingWhatsAppBtn = document.getElementById("floating-whatsapp");

const heroWhatsAppBtn = document.getElementById("hero-whatsapp");
const heroSeeProductsBtn = document.getElementById("hero-see-products");
const aboutWhatsAppBtn = document.getElementById("about-whatsapp");
const finalWhatsAppBtn = document.getElementById("final-whatsapp");

const productosSection = document.getElementById("productos");

const CART_KEY = "mzatt_cart";
const THEME_KEY = "mzatt_theme";

let cart = [];


// ================================
// TEMA (DARK / LIGHT)
// ================================
function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) body.setAttribute("data-theme", saved);
  updateThemeToggleIcon();
}

function toggleTheme() {
  const current = body.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  body.setAttribute("data-theme", next);
  localStorage.setItem(THEME_KEY, next);
  updateThemeToggleIcon();
}

function updateThemeToggleIcon() {
  const current = body.getAttribute("data-theme") || "dark";
  themeToggleBtn.textContent = current === "dark" ? "🌙" : "☀️";
}


// ================================
// CARRITO
// ================================
function loadCart() {
  try {
    cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    cart = [];
  }
  renderCart();
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(product) {
  const existing = cart.find((p) => p.id === product.id);
  if (existing) existing.quantity++;
  else cart.push({ ...product, quantity: 1 });

  saveCart();
  renderCart();
}

function updateQuantity(id, delta) {
  const item = cart.find((p) => p.id === id);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter((p) => p.id !== id);
  }

  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter((p) => p.id !== id);
  saveCart();
  renderCart();
}

function clearCart() {
  cart = [];
  saveCart();
  renderCart();
}

function calculateTotal() {
  return cart.reduce((t, p) => t + p.price * p.quantity, 0);
}

function renderCart() {
  cartItemsList.innerHTML = "";

  if (cart.length === 0) {
    cartEmptyText.style.display = "block";
    cartSendWhatsAppBtn.disabled = true;
    cartClearBtn.disabled = true;
  } else {
    cartEmptyText.style.display = "none";
    cartSendWhatsAppBtn.disabled = false;
    cartClearBtn.disabled = false;

    cart.forEach((item) => {
      const li = document.createElement("li");
      li.className = "cart-item";
      li.innerHTML = `
        <div>
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">$${item.price.toLocaleString("es-AR")}</div>
        </div>
        <button class="cart-item-remove" data-id="${item.id}">Eliminar</button>
        <div class="cart-item-controls">
          <button class="qty-btn qty-minus" data-id="${item.id}">-</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn qty-plus" data-id="${item.id}">+</button>
        </div>
        <div style="text-align:right;font-size:0.8rem;">
          Subtotal: $${(item.price * item.quantity).toLocaleString("es-AR")}
        </div>
      `;
      cartItemsList.appendChild(li);
    });
  }

  cartTotalSpan.textContent = `$${calculateTotal().toLocaleString("es-AR")}`;

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  cartCountSpan.textContent = totalItems;
}


// ================================
// WHATSAPP
// ================================
function openWhatsAppWithMessage(msg) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}

function buildCartMessage() {
  if (!cart.length)
    return "Hola Martín, quiero consultar por muebles tapizados.";

  let msg = "Hola Martín, quiero hacer el siguiente pedido:\n\n";
  cart.forEach((i) => {
    msg += `• ${i.name} x ${i.quantity} (c/u $${i.price.toLocaleString("es-AR")})\n`;
  });

  msg += `\nTotal estimado: $${calculateTotal().toLocaleString("es-AR")}\n\n`;
  msg += "Datos:\nNombre:\nLocalidad:\nMedidas:\nDetalles: ";
  return msg;
}


// ================================
// PANEL CARRITO
// ================================
function openCart() {
  cartPanel.classList.add("open");
  cartOverlay.classList.add("visible");
}

function closeCart() {
  cartPanel.classList.remove("open");
  cartOverlay.classList.remove("visible");
}


// ================================
// LOAD MORE + FILTRADO
// ================================

let allProducts = [...document.querySelectorAll(".product-card")];
let filteredProducts = allProducts;
let loadIndex = 0;
const LOAD_CHUNK = 4;

const loadMoreBtn = document.getElementById("load-more");

function renderLoadMore() {
  let shown = 0;

  for (; loadIndex < filteredProducts.length && shown < LOAD_CHUNK; loadIndex++) {
    filteredProducts[loadIndex].style.display = "flex";
    shown++;
  }

  loadMoreBtn.style.display =
    loadIndex >= filteredProducts.length ? "none" : "block";
}

renderLoadMore();

// FILTROS
document.querySelectorAll("[data-filter]").forEach(btn => {
  btn.addEventListener("click", () => {

    const cat = btn.dataset.filter;
    loadIndex = 0;

    const msg = document.getElementById("no-products-msg");
    msg.style.display = "none";

    if (!cat) filteredProducts = allProducts;
    else filteredProducts = allProducts.filter(p => p.dataset.category === cat);

    // Ocultar todo antes de mostrar los filtrados
    allProducts.forEach(p => p.style.display = "none");

    // Si no hay productos → mostrar mensaje
    if (filteredProducts.length === 0) {
      msg.style.display = "block";
      loadMoreBtn.style.display = "none";
      productosSection.scrollIntoView({ behavior: "smooth" });
      return;
    }

    // Si hay productos → mostrar los primeros
    renderLoadMore();
    productosSection.scrollIntoView({ behavior: "smooth" });

    // Cerrar menú móvil si estaba abierto
    const menu = document.getElementById("mobileMenu");
    if (menu) menu.style.display = "none";
  });
});

loadMoreBtn.addEventListener("click", renderLoadMore);


// ================================
// ZOOM IMAGEN MÓVIL
// ================================
document.querySelectorAll(".product-image").forEach((img) => {
  img.addEventListener("click", () => img.classList.toggle("zoom-mobile"));
});


// ================================
// MINIATURAS DE IMAGEN
// ================================
document.querySelectorAll(".product-card").forEach((card) => {
  const mainImg = card.querySelector(".main-img");
  const thumbs = card.querySelectorAll(".thumb");

  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      mainImg.src = thumb.src;
      thumbs.forEach((t) => t.classList.remove("active"));
      thumb.classList.add("active");
    });
  });
});


// ================================
// MENÚ MOBILE (HAMBURGUESA)
// ================================
document.addEventListener("DOMContentLoaded", () => {
  loadTheme();
  loadCart();

  themeToggleBtn?.addEventListener("click", toggleTheme);
  cartToggleBtn?.addEventListener("click", openCart);
  cartCloseBtn?.addEventListener("click", closeCart);
  cartOverlay?.addEventListener("click", closeCart);

  cartItemsList?.addEventListener("click", (e) => {
    const id = e.target.dataset.id;
    if (!id) return;

    if (e.target.classList.contains("qty-plus")) updateQuantity(id, 1);
    else if (e.target.classList.contains("qty-minus")) updateQuantity(id, -1);
    else if (e.target.classList.contains("cart-item-remove")) removeFromCart(id);
  });

  cartClearBtn?.addEventListener("click", () => {
    if (!cart.length) return;
    if (confirm("¿Vaciar carrito?")) clearCart();
  });

  cartSendWhatsAppBtn?.addEventListener("click", () =>
    openWhatsAppWithMessage(buildCartMessage())
  );

  floatingWhatsAppBtn?.addEventListener("click", () =>
    openWhatsAppWithMessage("Hola Martín, quiero consultar por muebles tapizados.")
  );

  heroWhatsAppBtn?.addEventListener("click", () =>
    openWhatsAppWithMessage("Hola Martín, quiero pedir un presupuesto.")
  );

  heroSeeProductsBtn?.addEventListener("click", () =>
    productosSection.scrollIntoView({ behavior: "smooth" })
  );

  aboutWhatsAppBtn?.addEventListener("click", () =>
    openWhatsAppWithMessage("Hola Martín, tengo una idea para un mueble a medida:")
  );

  finalWhatsAppBtn?.addEventListener("click", () =>
    openWhatsAppWithMessage(
      cart.length ? buildCartMessage() : "Hola Martín, quiero hacer un pedido."
    )
  );

  document.querySelectorAll(".add-to-cart").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const card = e.target.closest(".product-card");
      const id = card.dataset.id;
      const name = card.dataset.name;
      const price = Number(card.dataset.price) || 0;

      addToCart({ id, name, price });
      openCart();
    });
  });

  // HAMBURGESA
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");

  hamburger?.addEventListener("click", () => {
    mobileMenu.style.display =
      mobileMenu.style.display === "flex" ? "none" : "flex";
  });

  document.querySelectorAll(".mobile-item").forEach((item) => {
    item.addEventListener("click", () => {
      const key = item.dataset.mobile;
      if (!key) return;

      const submenu = document.getElementById(`sub-${key}`);
      if (!submenu) return;

      document.querySelectorAll(".mobile-submenu").forEach((m) => {
        if (m !== submenu) m.style.display = "none";
      });

      submenu.style.display =
        submenu.style.display === "flex" ? "none" : "flex";
    });
  });
});
