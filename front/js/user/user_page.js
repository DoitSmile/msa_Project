import { AuthService } from "/msa_Project/front/js/auth/auth.js";

// axios 기본 URL 설정
axios.defaults.baseURL = "http://localhost:3000"; // API 서버 주소로 변경하세요

const UserProfileManager = (function () {
  // 페이지네이션을 위한 상태 변수
  let currentPostPage = 1;
  let currentCommentPage = 1;
  const pageSize = 10;
  let viewedUserId = null;

  // URL에서 사용자 ID 파라미터 가져오기
  function getUserIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id");
  }

  // 요소의 텍스트 설정
  function setElementText(id, text) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = text;
    } else {
      console.warn(`Element with id '${id}' not found`);
    }
  }

  // 요소의 HTML 설정
  function setElementHTML(id, html) {
    const element = document.getElementById(id);
    if (element) {
      element.innerHTML = html;
    } else {
      console.warn(`Element with id '${id}' not found`);
    }
  }

  // 사용자 프로필 정보 업데이트
  async function updateUserProfile(userId) {
    try {
      const response = await axios.get(`/user/fetch/${userId}`);
      const userData = response.data;
      console.log("사용자 정보:", userData);

      setElementText("userName", userData.name || "이름 없음");

      // 프로필 이미지 업데이트
      const profileImage = document.querySelector(".profile-image");
      if (profileImage) {
        profileImage.src =
          userData.profilePictureUrl ||
          "/msa_Project/front/assets/default-profile-picture.jpg";
        profileImage.onerror = function () {
          this.src = "/msa_Project/front/assets/default-profile-picture.jpg";
        };
      }
    } catch (error) {
      console.error("사용자 정보 로드 중 오류 발생:", error);
      alert("사용자 정보를 불러오는 데 실패했습니다.");
    }
  }
  // 게시글 데이터 로드
  async function loadPostData(userId, page = 1) {
    try {
      const response = await axios.get(`/post/user_fetch/${userId}`, {
        params: { page, pageSize },
      });
      const { posts, total, totalPages } = response.data;
      console.log("가져온 게시글 데이터:", posts);

      if (Array.isArray(posts) && posts.length > 0) {
        renderItems(posts, "posts-container");
        renderPagination(
          page,
          totalPages,
          "posts-pagination",
          loadPostData,
          userId
        );
        document.getElementById("posts-pagination").style.display = "flex";
      } else {
        console.warn("게시글 데이터가 비어있거나 배열이 아닙니다.");
        setElementHTML("posts-container", "<p>작성한 게시글이 없습니다.</p>");
        document.getElementById("posts-pagination").style.display = "none";
      }

      // 총 게시글 수 업데이트
      setElementHTML(
        "postCount",
        `총 작성글 : <span class="stat-highlight">${total}</span>`
      );

      return total;
    } catch (error) {
      console.error("게시글 로드 중 오류 발생:", error);
      setElementHTML(
        "posts-container",
        "<p>게시글을 불러오는 데 실패했습니다.</p>"
      );
      document.getElementById("posts-pagination").style.display = "none";
      return 0;
    }
  }

  // 댓글 데이터 로드
  async function loadCommentData(userId, page = 1) {
    try {
      const response = await axios.get(`/post/comment/user/${userId}`, {
        params: { page, pageSize },
      });
      const { comments, total, totalPages } = response.data;
      console.log("가져온 댓글 데이터:", comments);

      if (Array.isArray(comments) && comments.length > 0) {
        renderItems(comments, "comments-container");
        renderPagination(
          page,
          totalPages,
          "comments-pagination",
          loadCommentData,
          userId
        );
        document.getElementById("comments-pagination").style.display = "flex";
      } else {
        console.warn("댓글 데이터가 비어있거나 배열이 아닙니다.");
        setElementHTML("comments-container", "<p>작성한 댓글이 없습니다.</p>");
        document.getElementById("comments-pagination").style.display = "none";
      }

      // 총 댓글 수 업데이트
      setElementHTML(
        "commentCount",
        `총 작성댓글 수 : <span class="stat-highlight">${total}</span>`
      );

      return total;
    } catch (error) {
      console.error("댓글 로드 중 오류 발생:", error);
      setElementHTML(
        "comments-container",
        "<p>댓글을 불러오는 데 실패했습니다.</p>"
      );
      document.getElementById("comments-pagination").style.display = "none";
      return 0;
    }
  }

  // 아이템 렌더링 (게시글 또는 댓글)
  function renderItems(items, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`Container with id '${containerId}' not found`);
      return;
    }

    container.innerHTML = "";

    if (!Array.isArray(items) || items.length === 0) {
      container.innerHTML = "<p>아직 작성한 내용이 없습니다.</p>";
      return;
    }

    items.forEach((item) => {
      const itemElement = document.createElement("div");
      itemElement.className = `${
        containerId === "posts-container" ? "post" : "comment"
      }-item`;

      if (containerId === "posts-container") {
        const commentCount = item.comment ? item.comment.length : 0;
        const hasImage = item.imageUrls && item.imageUrls.length > 0;

        itemElement.innerHTML = `
          <h3>
            <a href="/msa_Project/front/post/post_view.html?id=${item.id}">
              ${item.title}
              ${
                commentCount > 0
                  ? `<span class="comment-count">[ ${commentCount} ]</span>`
                  : ""
              }
            </a>
            ${
              hasImage
                ? '<svg class="has-image" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"><path fill="none" d="M0 0h24v24H0z"/><path d="M4.828 21l-.02.02-.021-.02H2.992A.993.993 0 0 1 2 20.007V3.993A1 1 0 0 1 2.992 3h18.016c.548 0 .992.445.992.993v16.014a1 1 0 0 1-.992.993H4.828zM20 15V5H4v14L14 9l6 6zm0 2.828l-6-6L6.828 19H20v-1.172zM8 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>'
                : ""
            }
          </h3>
          <p>${item.category?.name || "Unknown"} | ${new Date(
          item.createdAt
        ).toLocaleString()}</p>
        `;
      } else {
        itemElement.innerHTML = `
          <p class="comment-content">${item.content}</p>
          <p class="post-title">댓글 단 글: <a href="/msa_Project/front/post/post_view.html?id=${
            item.post.id
          }">${item.post.title || "Unknown"}</a></p>
          <p>${new Date(item.createdAt).toLocaleString()}</p>
        `;
      }

      container.appendChild(itemElement);
    });
  }
  // 페이지네이션 렌더링
  function renderPagination(
    currentPage,
    totalPages,
    containerId,
    loadFunction,
    userId
  ) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`Pagination container with id '${containerId}' not found`);
      return;
    }
    container.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
      const button = document.createElement("button");
      button.textContent = i;
      button.classList.add("pagination-button");
      if (i === currentPage) {
        button.classList.add("active");
      }
      button.addEventListener("click", () => loadFunction(userId, i));
      container.appendChild(button);
    }
  }

  // 탭 전환
  function switchTab(tabName) {
    const tabs = document.querySelectorAll(".content-nav li");
    const contentTabs = document.querySelectorAll(".content-tab");
    const paginationContainers = document.querySelectorAll(".pagination");

    tabs.forEach((tab) => tab.classList.remove("active"));
    contentTabs.forEach((content) => (content.style.display = "none"));
    paginationContainers.forEach(
      (pagination) => (pagination.style.display = "none")
    );

    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");
    document.getElementById(`${tabName}-container`).style.display = "block";
    document.getElementById(`${tabName}-pagination`).style.display = "flex";

    // 스크롤 위치 초기화
    document.querySelector(".content-wrapper").scrollTop = 0;

    // 탭 전환 시 해당 탭의 데이터 로드
    if (viewedUserId) {
      if (tabName === "posts") {
        loadPostData(viewedUserId, 1);
      } else if (tabName === "comments") {
        loadCommentData(viewedUserId, 1);
      }
    }
  }

  // 초기화 함수
  async function init() {
    viewedUserId = getUserIdFromUrl();
    if (!viewedUserId) {
      console.error("유효한 사용자 ID가 URL에 없습니다.");
      alert("유효한 사용자 정보가 없습니다.");
      window.location.href = "/msa_Project/front/index.html";
      return;
    }

    await updateUserProfile(viewedUserId);
    await loadPostData(viewedUserId, 1);
    await loadCommentData(viewedUserId, 1);
    switchTab("posts"); // 초기 탭을 게시글로 설정

    // 탭 전환 이벤트 리스너 추가
    document.querySelectorAll(".content-nav li").forEach((tab) => {
      tab.addEventListener("click", () =>
        switchTab(tab.getAttribute("data-tab"))
      );
    });

    // 카테고리 드롭다운 동작 추가
    const categoryBtn = document.querySelector(".category-btn");
    const categoryContent = document.querySelector(".category-content");
    if (categoryBtn && categoryContent) {
      categoryBtn.addEventListener("click", function (e) {
        e.preventDefault();
        categoryContent.style.display =
          categoryContent.style.display === "block" ? "none" : "block";
      });
    }
  }

  // Public 인터페이스
  return {
    init: init,
    switchTab: switchTab,
  };
})();

// DOMContentLoaded 이벤트 리스너
document.addEventListener("DOMContentLoaded", UserProfileManager.init);
