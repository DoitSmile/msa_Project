import { AuthService } from "../auth/auth.js";
export function initializeHeader() {
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
      window.location.href = `../../templates/header/search_results.html?q=${encodeURIComponent(
        query
      )}`;
    }
  });

  // 북마크 버튼에 이벤트 리스너 추가
  const bookMark = document.getElementById("bookMark");
  if (bookMark) {
    bookMark.addEventListener("click", handleBookMarkClick);
  }

  // 북마크 버튼 클릭 처리 함수
  function handleBookMarkClick(event) {
    event.preventDefault(); // 기본 동작 방지
    if (AuthService.isAuthenticated()) {
      // 로그인 상태일 때 글쓰기 페이지로 이동
      window.location.href = "../../templates/header/bookmark.html";
    } else {
      // 비로그인 상태일 때 경고 메시지 표시
      alert("로그인이 필요한 서비스입니다.");
    }
  }

  // 카테고리 버튼 토글 기능
  const categoryBtn = document.querySelector(".category-btn");
  const categoryContent = document.querySelector(".category-content");

  if (categoryBtn && categoryContent) {
    categoryBtn.addEventListener("click", function () {
      categoryContent.style.display =
        categoryContent.style.display === "block" ? "none" : "block";
    });

    // 카테고리 외부 클릭 시 닫기
    document.addEventListener("click", function (event) {
      if (
        !event.target.matches(".category-btn") &&
        !event.target.closest(".category-content")
      ) {
        categoryContent.style.display = "none";
      }
    });
  }
}
