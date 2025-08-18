// js/demo-users.js
// This file adds sample users to localStorage for testing purposes
// You can remove this file in production

function addDemoUsers() {
  // Check if demo users already exist
  const existingUsers = JSON.parse(localStorage.getItem("users")) || [];
  if (existingUsers.length > 0) {
    console.log("Demo users already exist");
    return;
  }

  // Sample users for testing
  const demoUsers = [
    {
      id: "1",
      fullName: "أحمد محمد",
      email: "ahmed@example.com",
      username: "ahmed",
      password: "12345678",
      role: "user",
      createdAt: new Date().toISOString()
    },
    {
      id: "2",
      fullName: "فاطمة علي",
      email: "fatima@example.com",
      username: "fatima",
      password: "12345678",
      role: "user",
      createdAt: new Date().toISOString()
    },
    {
      id: "3",
      fullName: "محمد أحمد",
      email: "mohamed@example.com",
      username: "admin",
      password: "admin123",
      role: "admin",
      createdAt: new Date().toISOString()
    }
  ];

  // Add demo users to localStorage
  localStorage.setItem("users", JSON.stringify(demoUsers));
  
  console.log("Demo users added successfully!");
  console.log("You can now login with:");
  console.log("- Username: ahmed, Password: 12345678");
  console.log("- Username: fatima, Password: 12345678");
  console.log("- Username: admin, Password: admin123 (Admin role)");
}

// Add demo users when the script is loaded
addDemoUsers();

// Export function for manual use
window.addDemoUsers = addDemoUsers;
