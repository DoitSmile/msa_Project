const axiosInstance = axios.create({
  baseURL: "http://localhost:3000", // 실제 서버 URL
  timeout: 5000, // 타임아웃 설정
});

// 전역 변수로 posts 선언
let posts = [];
const itemsPerPage = 20;
let currentPage = 1;

function renderPosts(isSpecialPage = false) {
  const boardList = document.getElementById("boardList");
  boardList.innerHTML = "";

  const start = (currentPage - 1) * itemsPerPage;
  const end = Math.min(start + itemsPerPage, posts.length);

  const paginatedPosts = posts.slice(start, end);

  paginatedPosts.forEach((post) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="title">
        <div class="title-wrapper">
        ${
          isSpecialPage
            ? `<a href="post_list.html?type=${getBoardTypeKey(
                post.boardType
              )}" class="board-type">${post.boardType}</a>`
            : ""
        }
        <a href="post_view.html?id=${post.id}">${post.title}</a>
          ${
            post.comments > 0
              ? `<span class="comments">${post.comments}</span>`
              : ""
          }
          ${post.hasImage ? '<svg class="has-image">...</svg>' : ""}
        </div>
      </td>
      <td class="author">${post.name}</td>
      <td class="date">${new Date(post.createdAt).toLocaleDateString()}</td>
      <td class="views">${post.views}</td>
    `;
    // 클릭 이벤트 추가
    tr.addEventListener("click", () => viewPost(post.id));

    boardList.appendChild(tr);
  });

  renderPagination();
}

function renderPagination() {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const pageCount = Math.ceil(posts.length / itemsPerPage);

  for (let i = 1; i <= pageCount; i++) {
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = i;
    if (i === currentPage) {
      a.className = "active";
    }
    a.addEventListener("click", (e) => {
      e.preventDefault();
      currentPage = i;
      renderPosts();
    });
    pagination.appendChild(a);
  }
}

function fetchPosts() {
  axiosInstance
    .get("/posts/fetch/all")
    .then(function (response) {
      posts = response.data;
      renderPosts();
    })
    .catch(function (error) {
      console.error("게시글 목록 조회 중 오류 발생:", error);
      alert("게시글 목록을 불러오는데 실패했습니다.");
    });
}

function getUrlParameter(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  var results = regex.exec(location.search);
  return results === null
    ? ""
    : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getBoardTypeKey(boardType) {
  const lowerBoardType = boardType
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace("게시판", "");
  for (const [key, value] of Object.entries(boardTypes)) {
    if (
      value.toLowerCase().replace(/\s+/g, "").replace("게시판", "") ===
      lowerBoardType
    ) {
      return key;
    }
  }
  return "free"; // 기본값으로 자유 게시판 반환
}

const boardTypes = {
  free: "자유 게시판",
  friendship: "친목 게시판",
  dating: "연애 게시판",
  gaming: "게임 게시판",
  study: "스터디모집 게시판",
  popular: "인기 게시물",
  recent: "최근 게시물",
};

window.onload = function () {
  const postType = getUrlParameter("type");
  const pageTitle = document.querySelector(".board-header h1");

  if (boardTypes.hasOwnProperty(postType)) {
    pageTitle.textContent = boardTypes[postType];
    fetchPosts(postType);
  } else {
    pageTitle.textContent = "최신 게시판";
    fetchPosts();
  }
};
