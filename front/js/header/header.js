import { AuthService } from "../auth/auth.js";

export async function initializeHeader() {
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

  await initializeCategoryMenu();

  const bookMark = document.getElementById("bookMark");
  if (bookMark) {
    bookMark.addEventListener("click", handleBookMarkClick);
  }

  const categoryBtn = document.querySelector(".category-btn");
  const categoryContent = document.querySelector(".category-content");

  if (categoryBtn && categoryContent) {
    categoryBtn.addEventListener("click", function () {
      categoryContent.style.display =
        categoryContent.style.display === "block" ? "none" : "block";
    });

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

async function initializeCategoryMenu() {
  try {
    const response = await axios.get("/api/categories");
    const categories = response.data;

    const categoryContent = document.querySelector(".category-content");
    categoryContent.innerHTML = "";

    categories.forEach((category) => {
      const link = document.createElement("a");
      link.href = `../../templates/post/post_list.html?type=${category.id}`;
      link.textContent = category.name;
      categoryContent.appendChild(link);
    });
  } catch (error) {
    console.error("카테고리 메뉴 초기화 실패:", error);
  }
}

function handleBookMarkClick(event) {
  event.preventDefault();
  if (AuthService.isAuthenticated()) {
    window.location.href = "../../templates/header/bookmark.html";
  } else {
    alert("로그인이 필요한 서비스입니다.");
  }
}
