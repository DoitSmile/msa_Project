// DOM 요소 선택
const editBtn = document.querySelector(".edit-btn");
const deleteBtn = document.querySelector(".delete-btn");
const container = document.querySelector(".container");
const selectAllCheckbox = document.getElementById("select-all");
const bookmarkCountElement = document.getElementById("bookmark-count");
const bookmarkList = document.querySelector(".bookmark-list");
const pagination = document.querySelector(".pagination");
const deletePopup = document.getElementById("delete-popup");

// 가상의 북마크 데이터 생성 (Date 객체 사용)
let bookmarks = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  title: `북마크 제목 ${i + 1}`,
  author: `작성자 ${i + 1}`,
  category: `카테고리 ${(i % 5) + 1}`,
  date: new Date(2024, 8, (i % 30) + 1), // 9월 (0부터 시작하므로 8이 9월)
}));

// 페이지네이션 설정
const itemsPerPage = 10;
let currentPage = 1;

// 북마크를 날짜 기준으로 정렬하는 함수
function sortBookmarksByDate() {
  bookmarks.sort((a, b) => b.date - a.date);
}

// 북마크 개수 업데이트 함수
function updateBookmarkCount() {
  bookmarkCountElement.textContent = `보관한 글 ${bookmarks.length}`;
}

// 북마크 목록 렌더링 함수
function renderBookmarks(page) {
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageBookmarks = bookmarks.slice(start, end);

  bookmarkList.innerHTML = pageBookmarks
    .map(
      (bookmark) => `
        <li class="bookmark-item" data-id="${bookmark.id}">
            <input type="checkbox" class="checkbox">
            <div class="bookmark-content">
                <div class="bookmark-title">${bookmark.title}</div>
                <div class="bookmark-info">${bookmark.author} ${
        bookmark.category
      } ${bookmark.date.toLocaleDateString()}</div>
            </div>
        </li>
    `
    )
    .join("");
}

// 페이지네이션 렌더링 함수
function renderPagination() {
  const pageCount = Math.ceil(bookmarks.length / itemsPerPage);
  let paginationHTML = "";

  // 페이지 번호 버튼 생성
  for (let i = 1; i <= pageCount; i++) {
    if (
      i === 1 ||
      i === pageCount ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      paginationHTML += `<button class="page-number ${
        currentPage === i ? "active" : ""
      }">${i}</button>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      paginationHTML += "<button disabled>...</button>";
    }
  }

  // 페이지네이션 HTML 설정
  pagination.innerHTML = `
        <button id="prev-page" ${
          currentPage === 1 ? "disabled" : ""
        }>&lt;</button>
        ${paginationHTML}
        <button id="next-page" ${
          currentPage === pageCount ? "disabled" : ""
        }>&gt;</button>
    `;

  // 페이지 번호 버튼에 이벤트 리스너 추가
  document.querySelectorAll(".page-number").forEach((button) => {
    button.addEventListener("click", () => {
      currentPage = parseInt(button.textContent);
      renderBookmarks(currentPage);
      renderPagination();
    });
  });

  // 이전 페이지 버튼 이벤트 리스너
  document.getElementById("prev-page").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderBookmarks(currentPage);
      renderPagination();
    }
  });

  // 다음 페이지 버튼 이벤트 리스너
  document.getElementById("next-page").addEventListener("click", () => {
    if (currentPage < pageCount) {
      currentPage++;
      renderBookmarks(currentPage);
      renderPagination();
    }
  });
}

// 북마크 삭제 함수
function deleteBookmarks() {
  const checkedItems = document.querySelectorAll(
    ".bookmark-item .checkbox:checked"
  );
  if (checkedItems.length === 0) {
    showPopup();
    return;
  }

  // 선택된 북마크의 ID 추출
  const deletedIds = Array.from(checkedItems).map((item) =>
    parseInt(item.closest(".bookmark-item").dataset.id)
  );

  // 선택된 북마크 삭제
  bookmarks = bookmarks.filter((bookmark) => !deletedIds.includes(bookmark.id));

  updateBookmarkCount();

  // 페이지 재계산
  const pageCount = Math.ceil(bookmarks.length / itemsPerPage);
  if (currentPage > pageCount) {
    currentPage = pageCount || 1;
  }

  renderBookmarks(currentPage);
  renderPagination();

  selectAllCheckbox.checked = false;
}

// 팝업 표시 함수
function showPopup() {
  deletePopup.style.display = "block";
}

// 팝업 닫기 함수
function closePopup() {
  deletePopup.style.display = "none";
}

// 초기 렌더링
sortBookmarksByDate();
updateBookmarkCount();
renderBookmarks(currentPage);
renderPagination();

// 편집 버튼 이벤트 리스너
editBtn.addEventListener("click", function () {
  container.classList.toggle("edit-mode");
  this.textContent = container.classList.contains("edit-mode")
    ? "완료"
    : "목록편집";
  if (!container.classList.contains("edit-mode")) {
    selectAllCheckbox.checked = false;
    document
      .querySelectorAll(".bookmark-item .checkbox")
      .forEach((cb) => (cb.checked = false));
  }
});

// 삭제 버튼 이벤트 리스너
deleteBtn.addEventListener("click", deleteBookmarks);

// 전체 선택 체크박스 이벤트 리스너
selectAllCheckbox.addEventListener("change", function () {
  const checkboxes = document.querySelectorAll(".bookmark-item .checkbox");
  checkboxes.forEach((cb) => (cb.checked = this.checked));
});
