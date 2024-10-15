import { AuthService } from "./auth.js";

document.addEventListener("DOMContentLoaded", function () {
  const popularPostList = document.getElementById("popularPostList");
  const recentPostList = document.getElementById("recentPostList");
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");

  const itemsPerPage = 5; // 한 페이지에 표시할 게시물 수
  axios.defaults.baseURL = "http://localhost:3000";

  function renderPosts(posts, listElement) {
    listElement.innerHTML = ""; // 기존 목록 초기화

    if (!Array.isArray(posts) || posts.length === 0) {
      listElement.innerHTML = "<li>게시글이 없습니다.</li>";
      return;
    }

    posts.slice(0, itemsPerPage).forEach((post) => {
      const li = document.createElement("li");
      const commentCount = post.comment ? post.comment.length : 0;
      const hasImage = post.imageUrls && post.imageUrls.length > 0;

      li.innerHTML = `
        <div class="post-info">
          <div class="post-title">
            <a href="/msa_Project/front/post/post_view.html?id=${post.id}">
              ${post.title || "제목 없음"}
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
          </div>
          <div class="post-meta">
            <span class="post-author">${post.name || "익명"}</span>
            <span class="post-date">${formatDate(post.createdAt)}</span>
          </div>
        </div>
        <div class="post-stats">
          <span class="post-views">조회 ${post.views || 0}</span>
          <span class="post-comments">댓글 ${commentCount}</span>
        </div>
      `;
      li.addEventListener("click", () => viewPost(post.id));
      listElement.appendChild(li);
    });
  }
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
      window.location.href = `/msa_Project/front/post/search_results.html?q=${encodeURIComponent(
        query
      )}`;
    }
  });
  async function searchPosts(query) {
    try {
      const response = await axios.get(
        `/posts/search?q=${encodeURIComponent(query)}`
      );
      const searchResults = response.data;
      renderPosts(searchResults, recentPostList);
    } catch (error) {
      console.error("검색 중 오류 발생:", error);
      alert("검색 중 오류가 발생했습니다. 다시 시도해 주세요.");
    }
  }
  function formatDate(dateString) {
    if (!dateString) return "날짜 없음";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}일 전`;
    } else if (hours > 0) {
      return `${hours}시간 전`;
    } else if (minutes > 0) {
      return `${minutes}분 전`;
    } else {
      return "방금 전";
    }
  }

  function fetchPosts() {
    // 최근 게시물 가져오기
    axios
      .get("/posts/fetch/all")
      .then(function (response) {
        console.log("최근 게시물 응답:", response.data);
        const recentPosts = Array.isArray(response.data) ? response.data : [];
        renderPosts(recentPosts, recentPostList);
      })
      .catch(function (error) {
        console.error("최근 게시글 목록 조회 중 오류 발생:", error);
        console.error(
          "오류 상세:",
          error.response ? error.response.data : error.message
        );
        recentPostList.innerHTML =
          "<li>최근 게시글을 불러오는데 실패했습니다.</li>";
      });
  }

  function viewPost(postId) {
    window.location.href = `/msa_Project/front/post/post_view.html?id=${postId}`;
  }

  async function updateUserProfile(userId) {
    try {
      const response = await axios.get(`/user/fetch/${userId}`);
      const userData = response.data;
      console.log("사용자 정보:", userData);

      const userNameSpan = document.getElementById("userNameSpan");
      if (userNameSpan) {
        userNameSpan.textContent = userData.name || "이름 없음";
      }

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

  function toggleLoginMypage() {
    const loginContent = document.getElementById("loginContent");
    const profileContent = document.getElementById("profileContent");
    const sectionTitle = document.getElementById("sectionTitle");
    const myPostsLink = document.getElementById("myPostsLink");
    const accountManagementLink = document.getElementById(
      "accountManagementLink"
    );

    if (AuthService.isAuthenticated()) {
      const currentUser = AuthService.getCurrentUser();
      loginContent.style.display = "none";
      profileContent.style.display = "block";
      sectionTitle.textContent = "마이페이지";

      // 사용자 정보 업데이트
      updateUserProfile(currentUser.id);

      // 내가 쓴 글 링크 설정
      myPostsLink.href = `/msa_Project/front/user/user_page.html?id=${currentUser.id}`;

      // 계정 관리 링크 설정
      accountManagementLink.href = `/msa_Project/front/user/user_update.html?id=${currentUser.id}`;

      // 새 글쓰기 링크 설정
      writePost.href = `/msa_Project/front/post/write.html?id=${currentUser.id}`;
    } else {
      loginContent.style.display = "block";
      profileContent.style.display = "none";
      sectionTitle.textContent = "로그인";
    }
  }

  const logoutButton = document.getElementById("logoutButton");
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        await AuthService.login(email, password);
        alert("로그인 성공!");
        toggleLoginMypage();
      } catch (error) {
        console.error("에러 발생:", error);
        alert("로그인 중 오류가 발생했습니다. 다시 시도해 주세요.");
      }
    });
  }

  logoutButton.addEventListener("click", function () {
    AuthService.logout();
    toggleLoginMypage();
    alert("로그아웃되었습니다.");
  });

  toggleLoginMypage();
  fetchPosts(); // 페이지 로드 시 게시글 가져오기
});
