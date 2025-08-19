// js/login.js
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is already logged in
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    // Redirect based on role
    if (user.role === "admin") {
      window.location.href = "dashboard.html";
    } else {
      window.location.href = "products.html";
    }
    return;
  }

  // Initialize the page
  initializeLoginPage();
});


function initializeLoginPage() {
  const form = document.getElementById("loginForm");
  const inputs = form.querySelectorAll("input");
  
  // Add event listeners
  form.addEventListener("submit", handleFormSubmit);
  
  inputs.forEach(input => {
    input.addEventListener("blur", validateField);
    input.addEventListener("input", clearValidation);
  });
  
  // Add fade-in animation to form elements
  addFadeInAnimations();
}

function addFadeInAnimations() {
  const formElements = document.querySelectorAll('.form-floating, .btn-login, .register-link');
  formElements.forEach((element, index) => {
    element.classList.add('fade-in');
    setTimeout(() => {
      element.classList.add('show');
    }, index * 100);
  });
}

function validateField(event) {
  const field = event.target;
  const value = field.value.trim();
  const fieldId = field.id;
  
  let isValid = true;
  let message = "";
  
  switch (fieldId) {
    case "username":
      if (value.length < 3) {
        isValid = false;
        message = "اسم المستخدم يجب أن يكون 3 أحرف على الأقل";
      }
      break;
      
    case "password":
      if (value.length < 1) {
        isValid = false;
        message = "يرجى إدخال كلمة المرور";
      }
      break;
  }
  
  showValidationMessage(fieldId, message, isValid);
  updateFieldStatus(fieldId, isValid);
  
  return isValid;
}

function showValidationMessage(fieldId, message, isValid) {
  const messageEl = document.getElementById(fieldId + "Message");
  if (messageEl) {
    messageEl.textContent = message;
    messageEl.className = `validation-message ${isValid ? 'success' : 'error'}`;
  }
}

function updateFieldStatus(fieldId, isValid) {
  const fieldContainer = document.getElementById(fieldId).closest('.form-floating');
  if (fieldContainer) {
    fieldContainer.classList.remove('error', 'success');
    if (isValid) {
      fieldContainer.classList.add('success');
    } else {
      fieldContainer.classList.add('error');
    }
  }
}

function clearValidation(event) {
  const field = event.target;
  const fieldId = field.id;
  const messageEl = document.getElementById(fieldId + "Message");
  
  if (messageEl) {
    messageEl.textContent = "";
    messageEl.className = "validation-message";
  }
  
  const fieldContainer = field.closest('.form-floating');
  if (fieldContainer) {
    fieldContainer.classList.remove('error', 'success');
  }
}

function togglePassword(fieldId) {
  const field = document.getElementById(fieldId);
  const toggleBtn = field.nextElementSibling;
  const icon = toggleBtn.querySelector('i');
  
  if (field.type === "password") {
    field.type = "text";
    icon.className = "fas fa-eye-slash";
  } else {
    field.type = "password";
    icon.className = "fas fa-eye";
  }
}

function authenticateUser(username, password) {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(u => u.username === username && u.password === password);
  return user || null;
}

async function handleFormSubmit(event) {
  event.preventDefault();
  
  // Validate all fields
  const inputs = event.target.querySelectorAll("input");
  let isValid = true;
  
  inputs.forEach(input => {
    if (!validateField({ target: input })) {
      isValid = false;
    }
  });
  
  if (!isValid) {
    showFormError("يرجى تصحيح الأخطاء في النموذج");
    return;
  }
  
  // Get form data
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  
  // Show loading state
  const submitBtn = document.getElementById("loginBtn");
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>جاري التحقق...';
  submitBtn.disabled = true;
  
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Authenticate user
    const user = authenticateUser(username, password);
    
    if (user) {
  // Store user session (without password for security)
  const sessionUser = {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    loginTime: new Date().toISOString()
  };
  
  localStorage.setItem("user", JSON.stringify(sessionUser));
  
  // Show success message
  showSuccessMessage("تم تسجيل الدخول بنجاح! جاري تحويلك...");
  
  // Redirect based on role after delay
  setTimeout(() => {
    if (sessionUser.role === "admin") {
      window.location.href = "dashboard.html";
    } else {
      window.location.href = "products.html";
    }
  }, 1500);
  
} else {
  // Show error message
  showFormError("اسم المستخدم أو كلمة المرور غير صحيحة");
  shakeElement(document.getElementById("username"));
  shakeElement(document.getElementById("password"));
}

    
  } catch (error) {
    showFormError("حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.");
    console.error("Login error:", error);
  } finally {
    // Reset button state
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

function showFormError(message) {
  // Create or update error message
  let errorDiv = document.querySelector('.form-error-message');
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger form-error-message';
    errorDiv.style.marginBottom = '20px';
    errorDiv.style.borderRadius = '12px';
    errorDiv.style.border = 'none';
    errorDiv.style.backgroundColor = '#f8d7da';
    errorDiv.style.color = '#721c24';
    
    const form = document.getElementById("loginForm");
    form.insertBefore(errorDiv, form.firstChild);
  }
  
  errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle me-2"></i>${message}`;
  errorDiv.style.display = 'block';
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 5000);
}

function showSuccessMessage(message) {
  // Create success message
  const successDiv = document.createElement('div');
  successDiv.className = 'alert alert-success form-success-message';
  successDiv.style.marginBottom = '20px';
  successDiv.style.borderRadius = '12px';
  successDiv.style.border = 'none';
  successDiv.style.backgroundColor = '#d4edda';
  successDiv.style.color = '#155724';
  successDiv.innerHTML = `<i class="fas fa-check-circle me-2"></i>${message}`;
  
  const form = document.getElementById("loginForm");
  form.insertBefore(successDiv, form.firstChild);
  
  // Remove any existing error messages
  const errorDiv = document.querySelector('.form-error-message');
  if (errorDiv) {
    errorDiv.remove();
  }
}

function shakeElement(element) {
  element.closest('.form-floating').classList.add('shake');
  setTimeout(() => {
    element.closest('.form-floating').classList.remove('shake');
  }, 500);
}

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
    const nextInput = e.target.nextElementSibling;
    if (nextInput && nextInput.tagName === 'INPUT') {
      nextInput.focus();
    }
  }
});

// Add form field focus effects
document.addEventListener('focusin', (e) => {
  if (e.target.closest('.form-floating')) {
    e.target.closest('.form-floating').style.transform = 'scale(1.02)';
  }
});

document.addEventListener('focusout', (e) => {
  if (e.target.closest('.form-floating')) {
    e.target.closest('.form-floating').style.transform = 'scale(1)';
  }
});

// Add responsive behavior
window.addEventListener('resize', () => {
  const card = document.querySelector('.login-card');
  if (window.innerWidth <= 576) {
    card.style.margin = '10px';
  } else {
    card.style.margin = '0';
  }
});
