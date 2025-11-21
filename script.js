// ================================
// CONFIGURACIÓN
// ================================

// Número de WhatsApp (formato internacional sin + ni espacios)
const WHATSAPP_NUMBER = "5493417420359";

// Selectores base
const body = document.body;
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

// Claves para localStorage
const CART_KEY = "mzatt_cart";
const THEME_KEY = "mzatt_theme";

let cart = [];

// ================================
// TEMA (DARK / LIGHT)
// ================================

function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") {
    body.setAttribute("data-theme", saved);
  }
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
  if (current === "dark") {
    themeToggleBtn.textContent = "🌙";
  } else {
    themeToggleBtn.textContent = "☀️";
  }
}

// ================================
// CARRITO
// ================================

function loadCart() {
  try {
    const stored = localStorage.getItem(CART_KEY);
    if (stored) {
      cart = JSON.parse(stored);
    } else {
      cart = [];
    }
  } catch (e) {
    cart = [];
  }
  renderCart();
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(product) {
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart();
  renderCart();
}

function updateQuantity(productId, delta) {
  const item = cart.find((p) => p.id === productId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter((p) => p.id !== productId);
  }
  saveCart();
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter((p) => p.id !== productId);
  saveCart();
  renderCart();
}

function clearCart() {
  cart = [];
  saveCart();
  renderCart();
}

function calculateTotal() {
  return cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
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

  const total = calculateTotal();
  cartTotalSpan.textContent = `$${total.toLocaleString("es-AR")}`;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCountSpan.textContent = totalItems;
}

// ================================
// WHATSAPP
// ================================

function openWhatsAppWithMessage(message) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    message
  )}`;
  window.open(url, "_blank");
}

function buildCartMessage() {
  if (cart.length === 0) {
    return "Hola Martín, quiero hacer una consulta por muebles tapizados.";
  }

  let message = "Hola Martín, quiero hacer el siguiente pedido:\n\n";

  cart.forEach((item) => {
    message += `• ${item.name} x ${item.quantity} (c/u $${item.price.toLocaleString(
      "es-AR"
    )})\n`;
  });

  message += `\nTotal estimado: $${calculateTotal().toLocaleString(
    "es-AR"
  )}\n\n`;
  message +=
    "Mis datos:\nNombre: \nLocalidad: \nMedidas aproximadas: \nComentarios: ";

  return message;
}

// ================================
// PANEL DEL CARRITO
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
// EVENTOS
// ================================

document.addEventListener("DOMContentLoaded", () => {
  loadTheme();
  loadCart();

  // Toggle tema
  themeToggleBtn.addEventListener("click", toggleTheme);

  // Abrir / cerrar carrito
  cartToggleBtn.addEventListener("click", openCart);
  cartCloseBtn.addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);

  // Botones de cantidad y eliminar (delegación de eventos)
  cartItemsList.addEventListener("click", (e) => {
    const id = e.target.getAttribute("data-id");
    if (!id) return;

    if (e.target.classList.contains("qty-plus")) {
      updateQuantity(id, 1);
    } else if (e.target.classList.contains("qty-minus")) {
      updateQuantity(id, -1);
    } else if (e.target.classList.contains("cart-item-remove")) {
      removeFromCart(id);
    }
  });

  // Vaciar carrito
  cartClearBtn.addEventListener("click", () => {
    if (cart.length === 0) return;
    const confirmClear = confirm(
      "¿Seguro que querés vaciar el carrito completo?"
    );
    if (confirmClear) {
      clearCart();
    }
  });

  // Enviar carrito por WhatsApp
  cartSendWhatsAppBtn.addEventListener("click", () => {
    const message = buildCartMessage();
    openWhatsAppWithMessage(message);
  });

  // Botón flotante WhatsApp (mensaje genérico)
  floatingWhatsAppBtn.addEventListener("click", () => {
    const msg =
      "Hola Martín, vengo desde tu página de muebles tapizados y quiero hacer una consulta.";
    openWhatsAppWithMessage(msg);
  });

  // Hero CTA
  heroWhatsAppBtn.addEventListener("click", () => {
    const msg =
      "Hola Martín, quiero pedir un presupuesto para muebles tapizados a medida.";
    openWhatsAppWithMessage(msg);
  });

  // Hero "Ver catálogo" -> scroll a sección productos
  heroSeeProductsBtn.addEventListener("click", () => {
    productosSection.scrollIntoView({ behavior: "smooth" });
  });

  // About CTA
  aboutWhatsAppBtn.addEventListener("click", () => {
    const msg =
      "Hola Martín, quiero contarte una idea de mueble tapizado para que me asesores:";
    openWhatsAppWithMessage(msg);
  });

  // CTA final -> si hay carrito, manda el carrito; si no, mensaje genérico
  finalWhatsAppBtn.addEventListener("click", () => {
    const message =
      cart.length > 0
        ? buildCartMessage()
        : "Hola Martín, quiero hacer un pedido de muebles tapizados.";
    openWhatsAppWithMessage(message);
  });

  // Botones "Agregar al carrito" en productos
  const productCards = document.querySelectorAll(".product-card");
  productCards.forEach((card) => {
    const btn = card.querySelector(".add-to-cart");
    btn.addEventListener("click", () => {
      const id = card.dataset.id;
      const name = card.dataset.name;
      const price = Number(card.dataset.price) || 0;

      addToCart({ id, name, price });
      openCart(); // opcional: abre el carrito al agregar
    });
  });
});

document.querySelectorAll('.product-image').forEach(img => {
  img.addEventListener('click', () => {
    img.classList.toggle('zoom-mobile');
  });
});

  document.addEventListener("DOMContentLoaded", () => {
    const products = document.querySelectorAll(".hidden-product");
    let index = 0;

    const loadMoreBtn = document.getElementById("load-more");

    loadMoreBtn.addEventListener("click", () => {
      for (let i = 0; i < 4; i++) {
        if (products[index]) {
          products[index].style.display = "flex";
          index++;
        }
      }

      if (index >= products.length) {
        loadMoreBtn.style.display = "none";
      }
    });
  });