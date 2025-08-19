// توليد باسورد عشوائي (12 حرف)
function generatePassword(length = 12) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// جلب المستخدمين من localStorage
function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

// حفظ المستخدمين
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

// عرض المستخدمين
function renderUsers() {
  const users = getUsers();
  const list = document.getElementById("usersList");
  list.innerHTML = "";
  users.forEach(user => {
    const li = document.createElement("li");
    li.textContent = `${user.username} - ${user.role}`;
    list.appendChild(li);
  });
}

// إضافة مشرف جديد
document.getElementById("addAdminForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();

  let users = getUsers();

  // تحقق من وجود المستخدم قبل
  if (users.find(u => u.username === username || u.email === email)) {
    alert("هذا المستخدم موجود بالفعل!");
    return;
  }

  const password = generatePassword();

  const newAdmin = {
    username,
    email,
    password,
    role: "admin",
    createdAt: new Date().toISOString()
  };

  users.push(newAdmin);
  saveUsers(users);

  alert(`تم إنشاء مشرف جديد\nالباسورد: ${password}`);

  renderUsers();
  this.reset();
});

// أول تحميل
renderUsers();
