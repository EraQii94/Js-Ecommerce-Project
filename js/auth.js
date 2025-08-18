// js/auth.js
document.addEventListener("DOMContentLoaded", () => {
  // Define protected pages that require authentication
  const protectedPages = [
    "products.html", 
    "cart.html", 
    "wishlist.html", 
    "index.html"
  ];
  
  // Get current page
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  const isProtected = protectedPages.includes(currentPage);
  
  // Get user session
  const user = JSON.parse(localStorage.getItem("user"));
  
  // Check if user is authenticated
  if (isProtected && !user) {
    // Show alert and redirect to login
    showAuthAlert("⚠️ يجب تسجيل الدخول أولاً للوصول إلى هذه الصفحة");
    setTimeout(() => {
      location.href = "login.html";
    }, 2000);
    return;
  }
  
  // If user is authenticated, update UI
  if (user) {
    updateUserInterface(user);
    updateBadges();
  }
  
  // Add logout functionality
  addLogoutFunctionality();
});

function showAuthAlert(message) {
  // Create a styled alert
  const alertDiv = document.createElement('div');
  alertDiv.className = 'alert alert-warning auth-alert';
  alertDiv.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    background: linear-gradient(135deg, #ffc107 0%, #ff8c00 100%);
    color: #000;
    border: none;
    border-radius: 12px;
    padding: 15px 25px;
    font-weight: 600;
    box-shadow: 0 8px 25px rgba(255, 193, 7, 0.3);
    animation: slideInDown 0.5s ease-out;
  `;
  
  alertDiv.innerHTML = `
    <i class="fas fa-exclamation-triangle me-2"></i>
    ${message}
  `;
  
  document.body.appendChild(alertDiv);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    alertDiv.style.animation = 'slideOutUp 0.5s ease-out';
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.parentNode.removeChild(alertDiv);
      }
    }, 500);
  }, 3000);
}

function updateUserInterface(user) {
  // Update user info in header if exists
  const userInfoElements = document.querySelectorAll('.user-info, .user-name, .user-role');
  userInfoElements.forEach(element => {
    if (element.classList.contains('user-name')) {
      element.textContent = user.fullName || user.username;
    } else if (element.classList.contains('user-role')) {
      element.textContent = user.role === 'admin' ? 'مدير' : 'مستخدم';
    }
  });
  
  // Show/hide admin elements based on role
  const adminElements = document.querySelectorAll('.admin-only');
  adminElements.forEach(element => {
    if (user.role === 'admin') {
      element.style.display = 'block';
    } else {
      element.style.display = 'none';
    }
  });
  
  // Update navigation based on authentication status
  updateNavigation(user);
}

function updateNavigation(user) {
  // Find navigation elements
  const loginLink = document.querySelector('a[href*="login.html"]');
  const registerLink = document.querySelector('a[href*="register.html"]');
  const logoutLink = document.querySelector('a[href*="logout.html"]');
  const profileLink = document.querySelector('a[href*="profile.html"]');
  
  if (user) {
    // User is logged in
    if (loginLink) loginLink.style.display = 'none';
    if (registerLink) registerLink.style.display = 'none';
    if (logoutLink) logoutLink.style.display = 'inline-block';
    if (profileLink) profileLink.style.display = 'inline-block';
  } else {
    // User is not logged in
    if (loginLink) loginLink.style.display = 'inline-block';
    if (registerLink) registerLink.style.display = 'inline-block';
    if (logoutLink) logoutLink.style.display = 'none';
    if (profileLink) profileLink.style.display = 'none';
  }
}

function updateBadges() {
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  const wlEl = document.getElementById("wishlistCount");
  const cEl = document.getElementById("cartCount");

  if (wlEl) wlEl.textContent = wishlist.length;
  if (cEl) cEl.textContent = cart.reduce((s, it) => s + (it.qty || 1), 0);
}

function addLogoutFunctionality() {
  // Add logout event listeners to logout buttons/links
  const logoutElements = document.querySelectorAll('.logout-btn, a[href*="logout.html"]');
  
  logoutElements.forEach(element => {
    element.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
    });
  });
}

function handleLogout() {
  // Show confirmation dialog
  if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
    // Clear user session
    localStorage.removeItem("user");
    
    // Show success message
    showLogoutMessage("تم تسجيل الخروج بنجاح");
    
    // Redirect to login page after delay
    setTimeout(() => {
      location.href = "login.html";
    }, 1500);
  }
}

function showLogoutMessage(message) {
  const alertDiv = document.createElement('div');
  alertDiv.className = 'alert alert-success logout-alert';
  alertDiv.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    color: white;
    border: none;
    border-radius: 12px;
    padding: 15px 25px;
    font-weight: 600;
    box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3);
    animation: slideInDown 0.5s ease-out;
  `;
  
  alertDiv.innerHTML = `
    <i class="fas fa-check-circle me-2"></i>
    ${message}
  `;
  
  document.body.appendChild(alertDiv);
  
  // Auto-remove after 2 seconds
  setTimeout(() => {
    alertDiv.style.animation = 'slideOutUp 0.5s ease-out';
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.parentNode.removeChild(alertDiv);
      }
    }, 500);
  }, 2000);
}

// Function to check if user is authenticated (for use in other scripts)
function isAuthenticated() {
  const user = JSON.parse(localStorage.getItem("user"));
  return user !== null;
}

// Function to get current user (for use in other scripts)
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("user"));
}

// Function to check if user is admin (for use in other scripts)
function isAdmin() {
  const user = getCurrentUser();
  return user && user.role === 'admin';
}

// Function to require authentication (for use in other scripts)
function requireAuth() {
  if (!isAuthenticated()) {
    showAuthAlert("⚠️ يجب تسجيل الدخول أولاً");
    setTimeout(() => {
      location.href = "login.html";
    }, 2000);
    return false;
  }
  return true;
}

// Function to require admin role (for use in other scripts)
function requireAdmin() {
  if (!requireAuth()) return false;
  
  if (!isAdmin()) {
    showAuthAlert("⚠️ يجب أن تكون مدير للوصول إلى هذه الصفحة");
    setTimeout(() => {
      location.href = "products.html";
    }, 2000);
    return false;
  }
  return true;
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInDown {
    from {
      opacity: 0;
      transform: translate(-50%, -100%);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }
  
  @keyframes slideOutUp {
    from {
      opacity: 1;
      transform: translate(-50%, 0);
    }
    to {
      opacity: 0;
      transform: translate(-50%, -100%);
    }
  }
  
  .auth-alert, .logout-alert {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
`;
document.head.appendChild(style);

// Export functions for use in other scripts
window.auth = {
  isAuthenticated,
  getCurrentUser,
  isAdmin,
  requireAuth,
  requireAdmin,
  updateBadges
};

// Make updateBadges available globally
window.updateBadges = updateBadges;
