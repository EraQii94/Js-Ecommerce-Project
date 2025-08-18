
const API_URL = "https://fakestoreapi.com/products";
const CATEGORY_URL = "https://fakestoreapi.com/products/categories";

const productsContainer = document.getElementById("products-container");
const filterContainer = document.getElementById("filter-container");

document.addEventListener("DOMContentLoaded", () => {
  renderCategoryFilter();
  fetchAndRenderProducts();
});

async function fetchAndRenderProducts(category = "") {
  try {
    productsContainer.innerHTML = '<div class="text-center py-5">⏳ جاري تحميل المنتجات...</div>';
    const url = category ? `${API_URL}/category/${category}` : API_URL;
    const res = await fetch(url);
    const products = await res.json();
    renderProducts(products);
  } catch (e) {
    productsContainer.innerHTML = '<div class="alert alert-danger">تعذر تحميل المنتجات حالياً</div>';
    console.error(e);
  }
}

async function renderCategoryFilter() {
  try {
    const res = await fetch(CATEGORY_URL);
    const cats = await res.json();

    const select = document.createElement("select");
    select.className = "form-select w-auto my-3 mx-auto";
    select.innerHTML = `<option value="">كل المنتجات</option>` +
      cats.map(c => `<option value="${c}">${c}</option>`).join("");

    filterContainer.appendChild(select);
    select.addEventListener("change", () => fetchAndRenderProducts(select.value));
  } catch (e) {
    console.error("فشل جلب الفئات", e);
  }
}

function renderProducts(products) {
  productsContainer.innerHTML = "";

  if (!products.length) {
    productsContainer.innerHTML = '<div class="text-center py-5">⚠️ لا توجد منتجات</div>';
    return;
  }

  products.forEach(p => {
    const col = document.createElement("div");
    col.className = "col-lg-3 col-md-6";
    col.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${p.image}" class="card-img-top p-3" alt="${escapeHtml(p.title)}"
             style="height:250px;object-fit:contain;">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title text-truncate" title="${escapeHtml(p.title)}">${escapeHtml(p.title)}</h5>
          <p class="card-text text-muted small flex-grow-1">${escapeHtml(p.description).slice(0, 80)}...</p>
          <div class="d-flex justify-content-between align-items-center">
            <span class="fw-bold text-success">$${p.price}</span>
            <div class="btn-group">
              <button class="btn btn-outline-danger btn-sm to-wishlist"><i class="bi bi-heart"></i></button>
              <button class="btn btn-primary btn-sm to-cart"><i class="bi bi-cart-plus"></i></button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Events
    col.querySelector(".to-cart").addEventListener("click", () => addToCart(p));
    col.querySelector(".to-wishlist").addEventListener("click", () => addToWishlist(p));

    productsContainer.appendChild(col);
  });
}

function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const idx = cart.findIndex(i => i.id === product.id);
  if (idx === -1) {
    cart.push({ id: product.id, title: product.title, price: product.price, image: product.image, qty: 1 });
  } else {
    cart[idx].qty += 1;
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  if (window.updateBadges) updateBadges();
  toast("✅ تمت إضافة المنتج إلى السلة");
}

function addToWishlist(product) {
  let wl = JSON.parse(localStorage.getItem("wishlist")) || [];
  if (!wl.some(i => i.id === product.id)) {
    wl.push({ id: product.id, title: product.title, price: product.price, image: product.image });
    localStorage.setItem("wishlist", JSON.stringify(wl));
    if (window.updateBadges) updateBadges();
    toast("❤️ تمت إضافة المنتج إلى المفضلة");
  } else {
    toast("ℹ️ المنتج موجود بالفعل في المفضلة");
  }
}

// Helpers
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
}

function toast(msg) {
  // تنبيه بسيط
  alert(msg);
}
