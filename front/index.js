//DOMContentLoaded 이벤트 리스너를 사용하여 DOM이 완전히 로드된 후에 코드가 실행되도록 함
//즉 페이지가 로드되면 자동으로 이 함수가 실행
document.addEventListener("DOMContentLoaded", function () {
  const axiosInstance = axios.create({
    baseURL: "http://localhost:3000", // 실제 서버 URL
    timeout: 5000, // 타임아웃 설정
  });

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

  // 로그인 폼 제출 처리
  if (form) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      // const formData = new FormData(this);

      // const authLoginInput = Object.fromEntries(formData.entries());
      const authLoginInput = { email, password };

      console.log("전송할 데이터:", authLoginInput);

      try {
        const response = await axiosInstance.post(
          "/auth/login",
          authLoginInput,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log("서버 응답:", response.data);

        // 로그인 성공 처리
        if (response.data) {
          // 액세스 토큰을 로컬 스토리지에 저장
          localStorage.setItem("accessToken", response.data);

          // 리프레시 토큰은 쿠키에 자동으로 저장됩니다 (httpOnly 쿠키로 설정되어 있다고 가정)

          alert("로그인 성공!");
          // // 로그인 성공 후 리다이렉션 또는 다른 작업 수행
          // window.location.href = "/index"; // 예시: 대시보드 페이지로 이동
        } else {
          throw new Error("토큰이 없습니다.");
        }
      } catch (error) {
        console.error("에러 발생:", error);
        alert("로그인 중 오류가 발생했습니다. 다시 시도해 주세요.");
      }
    });
  } else {
    console.error("Form not found");
  }
  // document.getElementById("loginForm").addEventListener("submit", function (e) {
  //   e.preventDefault();
  //   // 여기에 실제 로그인 로직을 구현합니다.
  //   // 예시를 위해 항상 로그인 성공으로 처리합니다.
  //   if loginForm
  //   toggleLoginState(true);
  // });

  // 로그아웃 버튼 클릭 처리
  logoutButton.addEventListener("click", function () {
    toggleLoginState(false);
  });

  // 초기 상태 설정 (예: 로그아웃 상태)
  toggleLoginState(false);
});
