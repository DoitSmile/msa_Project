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

// 로그인 상태를 확인하는 함수 (실제 구현에서는 서버와의 통신이 필요할 수 있음)
function isLoggedIn() {
  return localStorage.getItem("isLoggedIn") === "true";
}

// 로그인/마이페이지 섹션을 토글하는 함수
function toggleLoginMypage() {
  const loginSection = document.getElementById("loginSection");
  const mypageSection = document.getElementById("mypageSection");

  if (isLoggedIn()) {
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

// 로그인 폼 제출 처리
document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();
  // 여기에 실제 로그인 로직을 구현합니다.
  // 예시를 위해 항상 로그인 성공으로 처리합니다.
  toggleLoginState(true);
});

// 로그아웃 버튼 클릭 처리
logoutButton.addEventListener("click", function () {
  toggleLoginState(false);
});

// 초기 상태 설정 (예: 로그아웃 상태)
toggleLoginState(false);
