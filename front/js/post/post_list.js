import { AuthService } from "/msa_Project/front/js/auth/auth.js";

// 전역 변수 선언
let posts = []; // 게시물 목록을 저장할 배열
let categories = new Set(); // 카테고리 정보를 저장할 Set
let currentPage = 1; // 현재 페이지 번호
let totalPages = 1; // 총 페이지 수
let itemsPerPage = 20; // 한 페이지에 표시할 게시물 수

// 게시물 목록을 화면에 렌더링하는 함수
function renderPosts(isSpecialPage = false) {
  const boardList = document.getElementById("boardList");
  boardList.innerHTML = ""; // 기존 목록 초기화

  posts.forEach((post) => {
    console.log("post:", post);
    const tr = document.createElement("tr");
    const commentCount = post.comment ? post.comment.length : 0;
    const hasImage = post.imageUrls && post.imageUrls.length > 0;

    tr.innerHTML = `
      <td class="title">
        <div class="title-wrapper">
          ${
            !isSpecialPage && post.category && post.category.name
              ? `<a href="post_list.html?type=${encodeURIComponent(
                  post.category.id
                )}" class="board-type">${post.category.name}</a>`
              : ""
          }
          <a href="post_view.html?id=${post.id}">${
      post.title || "제목 없음"
    }</a>
           ${
             commentCount > 0
               ? `<span class="comments">[ ${commentCount} ]</span>`
               : ""
           }
          ${
            hasImage
              ? '<svg class="has-image" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"><path fill="none" d="M0 0h24v24H0z"/><path d="M4.828 21l-.02.02-.021-.02H2.992A.993.993 0 0 1 2 20.007V3.993A1 1 0 0 1 2.992 3h18.016c.548 0 .992.445.992.993v16.014a1 1 0 0 1-.992.993H4.828zM20 15V5H4v14L14 9l6 6zm0 2.828l-6-6L6.828 19H20v-1.172zM8 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>'
              : ""
          }
        </div>
      </td>
      <td class="author">${post.name || "익명"}</td>
      <td class="date">${
        post.createdAt
          ? new Date(post.createdAt).toLocaleDateString()
          : "날짜 없음"
      }</td>
      <td class="views">${post.views || 0}</td>
    `;
    tr.addEventListener("click", () => viewPost(post.id));

    boardList.appendChild(tr);
  });

  renderPagination();
}

// 페이지네이션을 렌더링하는 함수
function renderPagination() {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  // 이전 페이지 버튼
  if (currentPage > 1) {
    const prev = document.createElement("a");
    prev.href = "#";
    prev.textContent = "이전";
    prev.addEventListener("click", (e) => {
      e.preventDefault();
      currentPage--;
      fetchPosts();
    });
    pagination.appendChild(prev);
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
      fetchPosts();
    });
    pagination.appendChild(a);
  }

  // 다음 페이지 버튼
  if (currentPage < totalPages) {
    const next = document.createElement("a");
    next.href = "#";
    next.textContent = "다음";
    next.addEventListener("click", (e) => {
      e.preventDefault();
      currentPage++;
      fetchPosts();
    });
    pagination.appendChild(next);
  }
}

// 게시물 목록을 서버에서 가져오는 함수
function fetchPosts(categoryId = null, isSpecialPage = false) {
  console.log("가져온 categoryId:", categoryId);
  let url;

  if (categoryId === "popular") {
    url = `http://localhost:3000/posts/popular?page=${currentPage}&pageSize=${itemsPerPage}`;
  } else if (categoryId) {
    url = `http://localhost:3000/post/fetch/category/${categoryId}?page=${currentPage}&pageSize=${itemsPerPage}`;
  } else {
    url = `http://localhost:3000/posts/fetch/all?page=${currentPage}&pageSize=${itemsPerPage}`;
  }

  return axios
    .get(url)
    .then(function (response) {
      console.log("서버 응답:", response.data);
      posts = response.data.posts;
      totalPages = response.data.totalPages;
      currentPage = response.data.page;
      itemsPerPage = response.data.pageSize;

      posts.forEach((post) => {
        if (post.category && post.category.id) {
          categories.add(post.category.id);
        }
      });
      renderPosts(isSpecialPage);
    })
    .catch(function (error) {
      console.error("게시글 목록 조회 중 오류 발생:", error);
      console.error("에러 상세 정보:", error.response || error);
      alert("게시글 목록을 불러오는데 실패했습니다.");
    });
}

// URL 파라미터를 가져오는 함수
function getUrlParameter(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  var results = regex.exec(location.search);
  return results === null
    ? ""
    : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// 글쓰기 버튼 클릭 처리 함수
function handleWriteButtonClick(event) {
  event.preventDefault(); // 기본 동작 방지
  if (AuthService.isAuthenticated()) {
    // 로그인 상태일 때 글쓰기 페이지로 이동
    window.location.href = "write.html";
  } else {
    // 비로그인 상태일 때 경고 메시지 표시
    alert("로그인이 필요한 서비스입니다.");
    window.location.href = "/msa_Project/front/index.html";
  }
}

// 페이지 로드 시 실행되는 함수
window.onload = function () {
  const categoryId = getUrlParameter("type");
  console.log("categoryId-type:", categoryId);
  const pageTitle = document.querySelector(".board-header h1");

  if (categoryId === "popular") {
    pageTitle.textContent = "인기 게시물";
    fetchPosts("popular", true);
  } else if (categoryId) {
    const categoryName = getCategoryName(categoryId);
    pageTitle.textContent = categoryName || "카테고리 게시판";
    fetchPosts(categoryId, true);
  } else {
    pageTitle.textContent = "최근 게시물";
    fetchPosts(null, false);
  }

  // 글쓰기 버튼에 이벤트 리스너 추가
  const writeButton = document.getElementById("writePostButton");
  if (writeButton) {
    writeButton.addEventListener("click", handleWriteButtonClick);
  }
};

// 카테고리 ID에 해당하는 이름을 반환하는 함수
function getCategoryName(categoryId) {
  const categoryMap = {
    "a39a5e4b-847d-11ef-84d2-0242ac120007": "자유 게시판",
    "afaf3aaf-847d-11ef-84d2-0242ac120007": "친목 게시판",
    "0dcf3371-7996-11ef-b2ad-0242ac120004": "연애 게시판",
    "b7b56a55-847d-11ef-84d2-0242ac120007": "게임 게시판",
    "b2e6f193-847d-11ef-84d2-0242ac120007": "스터디모집 게시판",
  };
  return categoryMap[categoryId] || null;
}

// 게시물 보기 함수
function viewPost(postId) {
  axios
    .get(`http://localhost:3000/post/fetch/${postId}`)
    .then((response) => {
      // 여기서 게시물 데이터를 받아 처리합니다.
      console.log(response.data);
      // 실제로는 이 데이터를 사용하여 게시물 상세 페이지로 이동하거나 모달을 띄우는 등의 작업을 수행합니다.
      window.location.href = `post_view.html?id=${postId}`;
    })
    .catch((error) => {
      console.error("게시물 조회 중 오류 발생:", error);
      alert("게시물을 불러오는데 실패했습니다.");
    });
}
