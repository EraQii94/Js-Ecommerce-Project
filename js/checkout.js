function placeOrder(cart, customerName, customerEmail) {
  let orders = JSON.parse(localStorage.getItem("orders")) || [];

  let newOrder = {
    id: Date.now(),
    customer: {
      name: customerName,
      email: customerEmail
    },
    items: cart,
    total: cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
    status: "Pending" // مبدئيا قيد الانتظار
  };

  orders.push(newOrder);
  localStorage.setItem("orders", JSON.stringify(orders));

  alert("تم إرسال طلبك بنجاح!");
}
