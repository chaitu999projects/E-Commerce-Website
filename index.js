const btn = document.querySelector(".mobile-menu-button");
const menu = document.querySelector(".mobile-menu");

btn.addEventListener("click", () => {
  menu.classList.toggle("hidden");
});

let allProducts = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

document.addEventListener("DOMContentLoaded", function () {
  fetch("https://fakestoreapi.com/products")
    .then((res) => res.json())
    .then((products) => {
      allProducts = products;
      renderProducts(products);
      updateCartCount();
      // Remove this line - it's causing the duplicate listeners
      // setupAddToCartButtons();
    })
    .catch((error) => {
      console.error("Error fetching products:", error);
    });
});

function filterProducts(category) {
  if (category === "all") {
    renderProducts(allProducts);
  } else {
    const filteredProducts = allProducts.filter(
      (product) => product.category === category
    );
    renderProducts(filteredProducts);
  }
}

function renderProducts(products) {
  const container = document.getElementById("products-container");
  container.innerHTML = "";

  products.forEach((product) => {
    const shortTitle =
      product.title.length > 15
        ? product.title.substring(0, 15) + "..."
        : product.title;

    const shortDescription =
      product.description.length > 100
        ? product.description.substring(0, 100) + "..."
        : product.description;

    const productElement = document.createElement("div");
    productElement.className = "border rounded-lg p-4 flex flex-col";
    productElement.innerHTML = `
      <img alt="${product.title}" class="w-full h-48 object-cover mb-4" height="200" src="${product.image}" width="200"/>
      <h3 class="text-lg font-bold">${shortTitle}</h3>
      <p class="text-gray-600 mb-2 truncate-3-lines">${shortDescription}</p>
      <p class="text-xl font-bold mb-2">$${product.price}</p>
      <div class="flex justify-between mt-auto">
        <button class="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-600 transition">Details</button>
        <button class="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-600 transition add-to-cart" data-id="${product.id}">Add to Cart</button>
      </div>
    `;

    container.appendChild(productElement);
  });

  // This is the only place we need to setup the listeners
  setupAddToCartButtons();
}

function setupAddToCartButtons() {
  // Remove any existing listeners first
  document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.replaceWith(button.cloneNode(true));
  });

  // Add new listeners
  document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", (e) => {
      const productId = parseInt(e.target.getAttribute("data-id"));
      addToCart(productId);
    });
  });
}

function addToCart(productId) {
  const product = allProducts.find((p) => p.id === productId);

  if (!product) return;

  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  }

  updateCartCount();
  saveCartToLocalStorage();
}

function updateCartCount() {
  const cartCountElements = document.querySelectorAll(
    ".fa-shopping-cart + span, .fa-shopping-cart"
  );

  cartCountElements.forEach((element) => {
    if (element.tagName === "SPAN") {
      element.textContent = ` (${cart.reduce(
        (total, item) => total + item.quantity,
        0
      )})`;
    } else if (element.nextSibling) {
      // For elements where the cart count is in a sibling node
      element.nextSibling.textContent = ` (${cart.reduce(
        (total, item) => total + item.quantity,
        0
      )})`;
    }
  });
}

function saveCartToLocalStorage() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Function to render cart items (will be used in cart.html)
function renderCartItems() {
  const cartContainer = document.getElementById("cart-container");

  if (!cartContainer) return;

  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-md">
        <h2 class="text-2xl font-semibold mb-4">Your Cart is Empty</h2>
        <a href="./index.html" class="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100">
          <i class="fas fa-arrow-left mr-2"></i> Continue Shopping
        </a>
      </div>
    `;
    return;
  }

  let cartHTML = `
    <div class="w-full">
      <div class="grid grid-cols-6 gap-4 font-bold border-b pb-2 mb-4">
        <div class="col-span-2">Product</div>
        <div>Price</div>
        <div>Quantity</div>
        <div>Total</div>
        <div>Delete</div>
      </div>
  `;

  let subtotal = 0;

  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    cartHTML += `
      <div class="grid grid-cols-6 gap-4 items-center border-b py-4">
        <div class="col-span-2 flex items-center">
          <img src="${item.image}" alt="${
      item.title
    }" class="w-16 h-16 object-cover mr-4">
          <span>${item.title}</span>
        </div>
        <div>$${item.price.toFixed(2)}</div>
        <div class="flex items-center">
          <button class="quantity-decrease px-2 py-1 bg-gray-200 rounded-l" data-id="${
            item.id
          }">-</button>
          <span class="quantity-display px-4 py-1 bg-gray-100">${
            item.quantity
          }</span>
          <button class="quantity-increase px-2 py-1 bg-gray-200 rounded-r" data-id="${
            item.id
          }">+</button>
        </div>
        <div>$${itemTotal.toFixed(2)}</div>
        <div>
          <button class="text-red-500 hover:text-red-700 delete-item" data-id="${
            item.id
          }">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  });

  cartHTML += `
      <div class="mt-8 text-right">
        <div class="text-xl font-bold mb-4">
          Subtotal: $${subtotal.toFixed(2)}
        </div>
        <button class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 checkout-btn">
          Proceed to Checkout
        </button>
      </div>
    </div>
  `;

  cartContainer.innerHTML = cartHTML;

  // Setup increase quantity listeners
  document.querySelectorAll(".quantity-increase").forEach((button) => {
    button.addEventListener("click", (e) => {
      const productId = parseInt(e.target.getAttribute("data-id"));
      const cartItem = cart.find((item) => item.id === productId);
      if (cartItem) {
        cartItem.quantity += 1;
        saveCartToLocalStorage();
        renderCartItems();
        updateCartCount();
      }
    });
  });

  // Setup decrease quantity listeners
  document.querySelectorAll(".quantity-decrease").forEach((button) => {
    button.addEventListener("click", (e) => {
      const productId = parseInt(e.target.getAttribute("data-id"));
      const cartItemIndex = cart.findIndex((item) => item.id === productId);

      if (cartItemIndex !== -1) {
        if (cart[cartItemIndex].quantity > 1) {
          cart[cartItemIndex].quantity -= 1;
        } else {
          // Remove item if quantity would go to 0
          cart.splice(cartItemIndex, 1);
        }
        saveCartToLocalStorage();
        renderCartItems();
        updateCartCount();
      }
    });
  });

  // Setup delete item listeners
  document.querySelectorAll(".delete-item").forEach((button) => {
    button.addEventListener("click", (e) => {
      const productId = parseInt(
        e.target.closest("button").getAttribute("data-id")
      );
      removeFromCart(productId);
    });
  });
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCartToLocalStorage();
  renderCartItems();
  updateCartCount();
}

// function removeFromCart(productId) {
//   cart = cart.filter(item => item.id !== productId);
//   saveCartToLocalStorage();
//   renderCartItems();
//   updateCartCount();
// }
// Initialize cart on cart.html page
if (window.location.pathname.includes("cart.html")) {
  document.addEventListener("DOMContentLoaded", () => {
    renderCartItems();
  });
}
