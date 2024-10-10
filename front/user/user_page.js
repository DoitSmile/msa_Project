import { AuthService } from "/msa_Project/front/auth.js";

// axios 기본 URL 설정
axios.defaults.baseURL = "http://localhost:3000"; // API 서버 주소로 변경하세요

const UserProfileManager = (function () {
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
  function updateUserProfile(currentUser) {
    console.log("현재 사용자 정보:", currentUser);
    setElementText("userName", currentUser.name || "이름 없음");
    // 프로필 이미지 업데이트
    const profileImage = document.querySelector(".profile-image");
    if (profileImage) {
      profileImage.src =
        currentUser.profileImage || "https://via.placeholder.com/120";
    }
  }

  async function loadPostData(userId) {
    try {
      const response = await axios.get(`/post/user_fetch/${userId}`);
      const posts = response.data;
      console.log("가져온 게시글 데이터:", posts);

      if (Array.isArray(posts) && posts.length > 0) {
        setElementHTML(
          "postCount",
          `작성글: <span class="stat-highlight">${posts.length}</span>`
        );
        renderItems(posts, "posts-container");
      } else {
        console.warn("게시글 데이터가 비어있거나 배열이 아닙니다.");
        setElementHTML("posts-container", "<p>작성한 게시글이 없습니다.</p>");
      }
    } catch (error) {
      console.error("게시글 로드 중 오류 발생:", error);
      setElementHTML(
        "posts-container",
        "<p>게시글을 불러오는 데 실패했습니다.</p>"
      );
    }
  }

  async function loadCommentData(userId) {
    try {
      const response = await axios.get(`/post/comment/user/${userId}`);
      const comments = response.data;
      console.log("가져온 댓글 데이터:", comments);

      if (Array.isArray(comments) && comments.length > 0) {
        setElementHTML(
          "commentCount",
          `작성댓글: <span class="stat-highlight">${comments.length}</span>`
        );
        renderItems(comments, "comments-container");
      } else {
        console.warn("댓글 데이터가 비어있거나 배열이 아닙니다.");
        setElementHTML("comments-container", "<p>작성한 댓글이 없습니다.</p>");
      }
    } catch (error) {
      console.error("댓글 로드 중 오류 발생:", error);
      setElementHTML(
        "comments-container",
        "<p>댓글을 불러오는 데 실패했습니다.</p>"
      );
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
        itemElement.innerHTML = `
          <h3><a href="post_detail.html?id=${item.id}">${item.title}</a></h3>
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

  // 탭 전환
  function switchTab(tabName) {
    const tabs = document.querySelectorAll(".content-nav li");
    const contentTabs = document.querySelectorAll(".content-tab");

    tabs.forEach((tab) => tab.classList.remove("active"));
    contentTabs.forEach((content) => (content.style.display = "none"));

    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");
    document.getElementById(`${tabName}-container`).style.display = "block";
  }

  // 초기화 함수
  function init() {
    const currentUser = AuthService.getCurrentUser();
    console.log("현재 사용자:", currentUser);
    if (currentUser && currentUser.id) {
      updateUserProfile(currentUser);
      loadPostData(currentUser.id);
      loadCommentData(currentUser.id);
    } else {
      console.error("로그인된 사용자 정보가 없습니다.");
      alert("로그인이 필요합니다.");
      window.location.href = "/msa_Project/front/index.html";
    }

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
