import { AuthService } from "./auth.js";

document.addEventListener("DOMContentLoaded", function () {
  const categoryBtns = document.querySelectorAll(".category-btn");

  categoryBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const content = this.nextElementSibling;
      closeAllDropdowns();
      content.classList.toggle("show");
    });
  });

  function closeAllDropdowns() {
    const dropdowns = document.querySelectorAll(".category-content");
    dropdowns.forEach((dropdown) => {
      dropdown.classList.remove("show");
    });
  }

  window.onclick = function (event) {
    if (!event.target.matches(".category-btn")) {
      closeAllDropdowns();
    }
  };

  function toggleLoginMypage() {
    const loginSection = document.getElementById("loginSection");
    const mypageSection = document.getElementById("mypageSection");

    if (AuthService.isAuthenticated()) {
      loginSection.style.display = "none";
      mypageSection.style.display = "block";
    } else {
      loginSection.style.display = "block";
      mypageSection.style.display = "none";
    }
  }

  const loginContent = document.getElementById("loginContent");
  const profileContent = document.getElementById("profileContent");
  const sectionTitle = document.getElementById("sectionTitle");
  const logoutButton = document.getElementById("logoutButton");
  const form = document.getElementById("loginForm");

  function toggleLoginState(isLoggedIn) {
    if (isLoggedIn) {
      loginContent.style.display = "none";
      profileContent.style.display = "block";
      sectionTitle.textContent = "마이페이지";
    } else {
      loginContent.style.display = "block";
      profileContent.style.display = "none";
      sectionTitle.textContent = "로그인";
    }
  }

  if (form) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        await AuthService.login(email, password);
        alert("로그인 성공!");
        toggleLoginState(true);
      } catch (error) {
        console.error("에러 발생:", error);
        alert("로그인 중 오류가 발생했습니다. 다시 시도해 주세요.");
      }
    });
  } else {
    console.error("Form not found");
  }

  logoutButton.addEventListener("click", function () {
    AuthService.logout();
    toggleLoginState(false);
    alert("로그아웃되었습니다.");
  });

  toggleLoginState(AuthService.isAuthenticated());
});
