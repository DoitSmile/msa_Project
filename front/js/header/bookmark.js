// DOM 요소 선택
const editBtn = document.querySelector(".edit-btn");
const deleteBtn = document.querySelector(".delete-btn");
const container = document.querySelector(".container");
const selectAllCheckbox = document.getElementById("select-all");
const bookmarkCountElement = document.getElementById("bookmark-count");
const bookmarkList = document.querySelector(".bookmark-list");
const pagination = document.querySelector(".pagination");
const deletePopup = document.getElementById("delete-popup");

// 페이지네이션 설정
const itemsPerPage = 10;
let currentPage = 1;
let totalBookmarks = 0;

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 북마크 목록 가져오기
async function fetchBookmarks(page) {
  try {
    const response = await axios.get("/api/user/bookmarks", {
      params: { page, pageSize: itemsPerPage },
    });
    console.log("response:", response);
    console.log("response.data:", response.data);
    return response.data;
  } catch (error) {
    console.error("북마크 목록을 가져오는데 실패했습니다:", error);
    return { bookmarks: [], total: 0 };
  }
}

// 북마크 개수 업데이트 함수
function updateBookmarkCount(count) {
  bookmarkCountElement.textContent = `북마크한 글 ${count}`;
}

// 북마크 목록 렌더링 함수
function renderBookmarks(bookmarks) {
  console.log("bookmarks:", bookmarks);
  bookmarkList.innerHTML = bookmarks
    .map((bookmark) =>
      bookmark.post
        ? `
        <li class="bookmark-item" data-id="${bookmark.post?.id}">
            <input type="checkbox" class="checkbox">
            <div class="bookmark-content">
                <div class="bookmark-title"><a href="../../templates/post/post_view.html?id=${
                  bookmark.post?.id
                }">${bookmark.post?.title || "No Title"}</a></div>
                <div class="bookmark-info">${bookmark.post?.name || "Unknown"} 
       ${new Date(bookmark.createdAt).toLocaleDateString()}</div>
            </div>
        </li>
    `
        : ""
    )
    .join("");
}

// 페이지네이션 렌더링 함수
function renderPagination(
  totalPages,
  currentPage,
  paginationElement,
  fetchFunction
) {
  paginationElement.innerHTML = "";

  // 이전 페이지 버튼
  if (currentPage > 1) {
    const prev = document.createElement("a");
    prev.href = "#";
    prev.textContent = "이전";
    prev.addEventListener("click", (e) => {
      e.preventDefault();
      currentPage--;
      fetchFunction();
    });
    paginationElement.appendChild(prev);
  }

  // 페이지 번호
  for (
    let i = Math.max(1, currentPage - 2);
    i <= Math.min(totalPages, currentPage + 2);
    i++
  ) {
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = i;
    if (i === currentPage) {
      a.className = "active";
    }
    a.addEventListener("click", (e) => {
      e.preventDefault();
      currentPage = i;
      fetchFunction();
    });
    paginationElement.appendChild(a);
  }

  // 다음 페이지 버튼
  if (currentPage < totalPages) {
    const next = document.createElement("a");
    next.href = "#";
    next.textContent = "다음";
    next.addEventListener("click", (e) => {
      e.preventDefault();
      currentPage++;
      fetchFunction();
    });
    paginationElement.appendChild(next);
  }
}

// 북마크 삭제 함수
async function deleteBookmarks() {
  const checkedItems = document.querySelectorAll(
    ".bookmark-item .checkbox:checked"
  );
  if (checkedItems.length === 0) {
    showPopup();
    return;
  }

  const deletedIds = Array.from(checkedItems).map(
    (item) => item.closest(".bookmark-item").dataset.id
  );

  try {
    await Promise.all(
      deletedIds.map((id) => axios.delete(`/api/post/bookmark/${id}`))
    );
    loadBookmarks();
  } catch (error) {
    console.error("북마크 삭제에 실패했습니다:", error);
    alert("북마크 삭제에 실패했습니다. 다시 시도해주세요.");
  }

  selectAllCheckbox.checked = false;
}

// 북마크 목록 로드 함수
async function loadBookmarks() {
  const { bookmarks, total, totalPages } = await fetchBookmarks(currentPage);
  renderBookmarks(bookmarks);
  renderPagination(totalPages, currentPage, pagination, loadBookmarks);
  updateBookmarkCount(total);
}
// 팝업 표시 함수
function showPopup() {
  deletePopup.style.display = "block";
}

// 팝업 닫기 함수
function closePopup() {
  deletePopup.style.display = "none";
}

// 초기 로드
loadBookmarks();

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
selectAllCheckbox.addEventListener("click", function () {
  const checkboxes = document.querySelectorAll(".bookmark-item .checkbox");
  checkboxes.forEach((cb) => (cb.checked = this.checked));
});
