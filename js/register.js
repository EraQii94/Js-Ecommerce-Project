// js/register.js
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is already logged in
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    // Redirect to products page if already logged in
    window.location.href = "products.html";
    return;
  }

  // Initialize the page
  initializeRegisterPage();
});

function initializeRegisterPage() {
  const form = document.getElementById("registerForm");
  const inputs = form.querySelectorAll("input, select");
  
  // Add event listeners
  form.addEventListener("submit", handleFormSubmit);
  
  inputs.forEach(input => {
    input.addEventListener("blur", validateField);
    input.addEventListener("input", clearValidation);
    
    // Special handling for password fields
    if (input.id === "password") {
      input.addEventListener("input", checkPasswordStrength);
    }
    
    if (input.id === "confirmPassword") {
      input.addEventListener("input", validatePasswordMatch);
    }
  });
  
  // Add fade-in animation to form elements
  addFadeInAnimations();
}

function addFadeInAnimations() {
  const formElements = document.querySelectorAll('.form-floating, .btn-register, .login-link');
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
    case "fullName":
      if (value.length < 3) {
        isValid = false;
        message = "الاسم يجب أن يكون 3 أحرف على الأقل";
      } else if (!/^[\u0600-\u06FF\s]+$/.test(value)) {
        isValid = false;
        message = "يرجى إدخال اسم صحيح باللغة العربية";
      }
      break;
      
    case "email":
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        message = "يرجى إدخال بريد إلكتروني صحيح";
      }
      break;
      
    case "username":
      if (value.length < 4) {
        isValid = false;
        message = "اسم المستخدم يجب أن يكون 4 أحرف على الأقل";
      } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        isValid = false;
        message = "اسم المستخدم يمكن أن يحتوي على أحرف إنجليزية وأرقام وشرطة سفلية فقط";
      }
      break;
      
    case "password":
      if (value.length < 8) {
        isValid = false;
        message = "كلمة المرور يجب أن تكون 8 أحرف على الأقل";
      }
      break;
      
    case "confirmPassword":
      const password = document.getElementById("password").value;
      if (value !== password) {
        isValid = false;
        message = "كلمة المرور غير متطابقة";
      }
      break;
      
    case "role":
      if (!value) {
        isValid = false;
        message = "يرجى اختيار نوع الحساب";
      }
      break;
  }
  
  showValidationMessage(fieldId, message, isValid);
  updateFieldStatus(fieldId, isValid);
  
  return isValid;
}

function validatePasswordMatch() {
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  
  if (confirmPassword && password !== confirmPassword) {
    showValidationMessage("confirmPassword", "كلمة المرور غير متطابقة", false);
    updateFieldStatus("confirmPassword", false);
    return false;
  } else if (confirmPassword && password === confirmPassword) {
    showValidationMessage("confirmPassword", "كلمة المرور متطابقة", true);
    updateFieldStatus("confirmPassword", true);
    return true;
  }
  
  return true;
}

function checkPasswordStrength() {
  const password = document.getElementById("password").value;
  const strengthBar = document.getElementById("strengthBar");
  const messageEl = document.getElementById("passwordMessage");
  
  let strength = 0;
  let message = "";
  let strengthClass = "";
  
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  
  switch (strength) {
    case 0:
    case 1:
      strengthClass = "strength-weak";
      message = "كلمة مرور ضعيفة جداً";
      break;
    case 2:
      strengthClass = "strength-fair";
      message = "كلمة مرور مقبولة";
      break;
    case 3:
      strengthClass = "strength-good";
      message = "كلمة مرور جيدة";
      break;
    case 4:
    case 5:
      strengthClass = "strength-strong";
      message = "كلمة مرور قوية";
      break;
  }
  
  // Update strength meter
  strengthBar.className = `strength-meter-bar ${strengthClass}`;
  
  // Show message
  if (password.length > 0) {
    showValidationMessage("password", message, strength >= 3);
    updateFieldStatus("password", strength >= 3);
  }
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
    fieldContainer.classList.add(isValid ? 'success' : 'error');
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

function checkUsernameAvailability(username) {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  return !users.some(user => user.username === username);
}

function checkEmailAvailability(email) {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  return !users.some(user => user.email === email);
}

async function handleFormSubmit(event) {
  event.preventDefault();
  
  // Validate all fields
  const inputs = event.target.querySelectorAll("input, select");
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
  const formData = {
    fullName: document.getElementById("fullName").value.trim(),
    email: document.getElementById("email").value.trim(),
    username: document.getElementById("username").value.trim(),
    password: document.getElementById("password").value,
    role: document.getElementById("role").value,
    createdAt: new Date().toISOString(),
    id: Date.now().toString()
  };
  
  // Check username and email availability
  if (!checkUsernameAvailability(formData.username)) {
    showFormError("اسم المستخدم موجود بالفعل");
    shakeElement(document.getElementById("username"));
    return;
  }
  
  if (!checkEmailAvailability(formData.email)) {
    showFormError("البريد الإلكتروني موجود بالفعل");
    shakeElement(document.getElementById("email"));
    return;
  }
  
  // Show loading state
  const submitBtn = document.getElementById("registerBtn");
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>جاري إنشاء الحساب...';
  submitBtn.disabled = true;
  
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Save user to localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];
    users.push(formData);
    localStorage.setItem("users", JSON.stringify(users));
    
    // Show success message
    showSuccessMessage("تم إنشاء الحساب بنجاح! جاري تحويلك...");
    
    // Redirect to login page after delay
    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
    
  } catch (error) {
    showFormError("حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.");
    console.error("Registration error:", error);
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
    
    const form = document.getElementById("registerForm");
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
  
  const form = document.getElementById("registerForm");
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

// Add smooth scrolling for anchor links
document.addEventListener('click', (e) => {
  if (e.target.tagName === 'A' && e.target.getAttribute('href').startsWith('#')) {
    e.preventDefault();
    const target = document.querySelector(e.target.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
});

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
  const card = document.querySelector('.register-card');
  if (window.innerWidth <= 576) {
    card.style.margin = '10px';
  } else {
    card.style.margin = '0';
  }
});
