
const cartBody = document.getElementById("cartItems");
const totalEl = document.getElementById("cartTotal");
const shipEl = document.getElementById("cartShipping");

document.addEventListener("DOMContentLoaded", () => {
  renderCart();
  wireCheckout();
});

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function setCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  if (window.updateBadges) updateBadges();
}

function renderCart() {
  const cart = getCart();
  cartBody.innerHTML = "";

  if (!cart.length) {
    cartBody.innerHTML = `<tr><td colspan="5" class="py-5 text-center">السلة فارغة</td></tr>`;
    updateTotals(0);
    return;
  }

  cart.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="text-start">
        <div class="d-flex align-items-center gap-3">
          <img src="${item.image}" alt="${escapeHtml(item.title)}" width="60" height="60" style="object-fit:contain;">
          <span>${escapeHtml(item.title)}</span>
        </div>
      </td>
      <td>$${item.price}</td>
      <td style="width:140px">
        <input type="number" class="form-control qty-input" min="1" value="${item.qty || 1}" data-id="${item.id}">
      </td>
      <td class="line-total">$${(item.price * (item.qty || 1)).toFixed(2)}</td>
      <td><button class="btn btn-sm btn-danger del-item" data-id="${item.id}"><i class="bi bi-trash"></i></button></td>
    `;
    cartBody.appendChild(tr);
  });

  // أحداث الكمية والحذف
  cartBody.querySelectorAll(".qty-input").forEach(inp => {
    inp.addEventListener("input", onQtyChange);
  });
  cartBody.querySelectorAll(".del-item").forEach(btn => {
    btn.addEventListener("click", onDeleteItem);
  });

  // إجماليات أولية
  updateTotals(calcSubtotal());
}

function onQtyChange(e) {
  const id = +e.target.dataset.id;
  let qty = parseInt(e.target.value, 10);
  if (!Number.isFinite(qty) || qty < 1) qty = 1;
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === id);
  if (idx !== -1) {
    cart[idx].qty = qty;
    setCart(cart);
    renderCart();
  }
}

function onDeleteItem(e) {
  const id = +e.currentTarget.dataset.id;
  const cart = getCart().filter(i => i.id !== id);
  setCart(cart);
  renderCart();
}

function calcSubtotal() {
  return getCart().reduce((s, it) => s + it.price * (it.qty || 1), 0);
}

function updateTotals(subtotal) {
  // شحن تجريبي بسيط: مجاني لو المجموع ≥ 100$، وإلا 10$
  const shipping = subtotal >= 100 ? 0 : (subtotal > 0 ? 10 : 0);
  const total = subtotal + shipping;
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
  if (shipEl) shipEl.textContent = `$${shipping.toFixed(2)}`;

  // تحديث سطور الإجمالي لكل صف موجودة بالفعل داخل renderCart()
}

function wireCheckout() {
  const btn = document.getElementById("checkout-btn");
  const pay = document.getElementById("payment-section");
  if (btn && pay) {
    btn.addEventListener("click", () => {
      pay.style.display = "block";
      pay.scrollIntoView({ behavior: "smooth" });
    });
  }
}

// Helper
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
}
