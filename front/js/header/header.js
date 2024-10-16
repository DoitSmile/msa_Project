export function initializeHeader() {
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
      window.location.href = `/msa_Project/front/templates/header/search_results.html?q=${encodeURIComponent(
        query
      )}`;
    }
  });

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
