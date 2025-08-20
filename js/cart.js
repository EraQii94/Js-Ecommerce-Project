
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

      // تفعيل PayPal Button
      renderPaypalButton();
    });
  }
}

function renderPaypalButton() {
  const subtotal = calcSubtotal();
  const shipping = subtotal >= 100 ? 0 : (subtotal > 0 ? 10 : 0);
  const total = subtotal + shipping;

  // لو الزرار اتعمل قبل كده نمسحه ونعمل جديد
  const container = document.getElementById("paypal-button-container");
  container.innerHTML = "";

  paypal.Buttons({
    style: {
      color: "blue",
      shape: "pill",
      label: "pay"
    },
    createOrder: function (data, actions) {
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: total.toFixed(2) // إجمالي الفاتورة
          }
        }]
      });
    },
    onApprove: function (data, actions) {
      return actions.order.capture().then(function (details) {
        alert("تم الدفع بنجاح بواسطة " + details.payer.name.given_name);

        // تفضي السلة بعد الدفع
        setCart([]);
        renderCart();
      });
    },
    onError: function (err) {
      console.error(err);
      alert("حصلت مشكلة أثناء الدفع، حاول تاني.");
    }
  }).render("#paypal-button-container");
}

function checkout() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let users = JSON.parse(localStorage.getItem("users")) || [];
  let sessionUser = JSON.parse(localStorage.getItem("sessionUser")) || null;

  if (!sessionUser) {
    alert("سجل الدخول أولاً.");
    return;
  }

  if (cart.length === 0) {
    alert("الكارت فارغ!");
    return;
  }

  // تحميل الطلبات القديمة
  let orders = JSON.parse(localStorage.getItem("orders")) || [];

  // إنشاء رقم طلب جديد
  let newOrderId = Date.now(); 

  // حساب الإجمالي
  let total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // تكوين الطلب
  let newOrder = {
    id: newOrderId,
    customer: sessionUser,
    items: cart,
    total: total,
    status: "قيد المراجعة"
  };

  // حفظ الطلب
  orders.push(newOrder);
  localStorage.setItem("orders", JSON.stringify(orders));

  // إفراغ الكارت
  localStorage.removeItem("cart");

  alert("تم إرسال طلبك بنجاح! رقم الطلب: " + newOrderId);

  // تحويل العميل لصفحة متابعة الطلب
  window.location.href = "orders.html?orderId=" + newOrderId;
}

function handleCashOnDelivery() {
  const cart = getCart();
  if (!cart.length) {
    alert("السلة فارغة!");
    return;
  }

  // بيانات العميل (مؤقتًا ثابتة، ممكن ناخدها من الفورم أو تسجيل الدخول)
  const customer = {
    name: localStorage.getItem("userName") || "عميل تجريبي",
    email: localStorage.getItem("userEmail") || "customer@example.com"
  };

  // حساب الإجمالي
  const subtotal = calcSubtotal();
  const shipping = subtotal >= 100 ? 0 : (subtotal > 0 ? 10 : 0);
  const total = subtotal + shipping;

  // إنشاء الأوردر
  const newOrder = {
    id: Date.now(),
    customer,
    items: cart,
    total,
    status: "قيد الانتظار"
  };

  // حفظ الأوردر في localStorage
  let orders = JSON.parse(localStorage.getItem("orders")) || [];
  orders.push(newOrder);
  localStorage.setItem("orders", JSON.stringify(orders));

  // تفريغ السلة
  localStorage.removeItem("cart");
  renderCart();

  alert("تم تسجيل الطلب بنجاح! رقم الطلب: " + newOrder.id);
  window.location.href = "orders.html"; // صفحة متابعة الطلب للمستخدم
}





// Helper
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
}
