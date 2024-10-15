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

// Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 5000,
});

axiosInstance.interceptors.request.use(
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
    const response = await axiosInstance.get("/user/bookmarks", {
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
    .map(
      (bookmarks) => `
        <li class="bookmark-item" data-id="${bookmarks.post.id}">
            <input type="checkbox" class="checkbox">
            <div class="bookmark-content">
                <div class="bookmark-title">${bookmarks.post.title}</div>
                <div class="bookmark-info">${bookmarks.post.name} 
       ${new Date(bookmarks.createdAt).toLocaleDateString()}</div>
            </div>
        </li>
    `
    )
    .join("");
}

// 페이지네이션 렌더링 함수
function renderPagination(total) {
  const pageCount = Math.ceil(total / itemsPerPage);
  let paginationHTML = "";

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

  pagination.innerHTML = `
        <button id="prev-page" ${
          currentPage === 1 ? "disabled" : ""
        }>&lt;</button>
        ${paginationHTML}
        <button id="next-page" ${
          currentPage === pageCount ? "disabled" : ""
        }>&gt;</button>
    `;

  document.querySelectorAll(".page-number").forEach((button) => {
    button.addEventListener("click", () => {
      currentPage = parseInt(button.textContent);
      loadBookmarks();
    });
  });

  document.getElementById("prev-page").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      loadBookmarks();
    }
  });

  document.getElementById("next-page").addEventListener("click", () => {
    if (currentPage < pageCount) {
      currentPage++;
      loadBookmarks();
    }
  });
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
      deletedIds.map((id) => axiosInstance.delete(`/post/bookmark/${id}`))
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
  const { bookmarks, total } = await fetchBookmarks(currentPage);
  renderBookmarks(bookmarks);
  renderPagination(total);
  updateBookmarkCount(total);
  totalBookmarks = total;
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
