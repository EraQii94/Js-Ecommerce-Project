
const wlContainer = document.getElementById("wishlistItems");

document.addEventListener("DOMContentLoaded", () => {
  renderWishlist();
});

function getWishlist() {
  return JSON.parse(localStorage.getItem("wishlist")) || [];
}
function setWishlist(list) {
  localStorage.setItem("wishlist", JSON.stringify(list));
  if (window.updateBadges) updateBadges();
}

function renderWishlist() {
  const list = getWishlist();
  wlContainer.innerHTML = "";

  if (!list.length) {
    wlContainer.innerHTML = `<div class="text-center py-5">لا توجد عناصر في المفضلة</div>`;
    return;
  }

  list.forEach(p => {
    const col = document.createElement("div");
    col.className = "col-lg-3 col-md-6";
    col.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${p.image}" class="card-img-top p-3" alt="${escapeHtml(p.title)}"
             style="height:250px;object-fit:contain;">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title text-truncate" title="${escapeHtml(p.title)}">${escapeHtml(p.title)}</h5>
          <div class="d-flex justify-content-between align-items-center mt-auto">
            <span class="fw-bold text-success">$${p.price}</span>
            <div class="btn-group">
              <button class="btn btn-primary btn-sm add-cart" data-id="${p.id}"><i class="bi bi-cart-plus"></i></button>
              <button class="btn btn-outline-danger btn-sm remove" data-id="${p.id}"><i class="bi bi-trash"></i></button>
            </div>
          </div>
        </div>
      </div>
    `;
    wlContainer.appendChild(col);
  });

  wlContainer.querySelectorAll(".remove").forEach(b => b.addEventListener("click", removeItem));
  wlContainer.querySelectorAll(".add-cart").forEach(b => b.addEventListener("click", addFromWishlistToCart));
}

function removeItem(e) {
  const id = +e.currentTarget.dataset.id;
  const list = getWishlist().filter(p => p.id !== id);
  setWishlist(list);
  renderWishlist();
}

function addFromWishlistToCart(e) {
  const id = +e.currentTarget.dataset.id;
  const item = getWishlist().find(p => p.id === id);
  if (!item) return;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const idx = cart.findIndex(i => i.id === id);
  if (idx === -1) {
    cart.push({ id: item.id, title: item.title, price: item.price, image: item.image, qty: 1 });
  } else {
    cart[idx].qty += 1;
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  if (window.updateBadges) updateBadges();
  alert("✅ تمت إضافة المنتج إلى السلة");
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
}
