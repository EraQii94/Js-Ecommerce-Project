
document.addEventListener("DOMContentLoaded", () => {
  const ratingsBtn = document.getElementById("show-ratings-btn");
  const ratingSection = document.getElementById("rating-section");

  if (ratingsBtn && ratingSection) {
    ratingsBtn.addEventListener("click", () => {
      ratingSection.style.display = "block";
      ratingSection.scrollIntoView({ behavior: "smooth" });
    });
  }
});

const logoutLink = document.getElementById("logoutLink");
if (logoutLink) {
  logoutLink.addEventListener("click", function (e) {
    e.preventDefault();
    localStorage.removeItem("sessionUser");
    window.location.href = "login.html";
  });
}