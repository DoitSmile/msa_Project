import { AuthService } from "./js/auth/auth.js";

document.addEventListener("DOMContentLoaded", function () {
  const popularPostList = document.getElementById("popularPostList");
  const recentPostList = document.getElementById("recentPostList");
  const loginForm = document.getElementById("loginForm");
  const logoutButton = document.getElementById("logoutButton");
  const writePostLink = document.getElementById("writePost");
  const myPostsLink = document.getElementById("myPostsLink");
  const accountManagementLink = document.getElementById(
    "accountManagementLink"
  );

  const itemsPerPage = 5; // 각 섹션에 표시할 게시물 수

  function renderPosts(posts, listElement) {
    listElement.innerHTML = "";

    if (!Array.isArray(posts) || posts.length === 0) {
      listElement.innerHTML = "<li>게시글이 없습니다.</li>";
      return;
    }

    posts.slice(0, itemsPerPage).forEach((post) => {
      const li = document.createElement("li");
      const commentCount = post.comment ? post.comment.length : 0;
      const hasImage = post.imageUrls && post.imageUrls.length > 0;

      li.innerHTML = `
      <div class="post-main-info">
        <span class="post-title">
        ${
          post.prefix ? `<span class="post-prefix">[${post.prefix}]</span>` : ""
        }
          <a href="/templates/post/post_view.html?id=${post.id}">
            ${post.title || "제목 없음"}
          </a>
          ${
            commentCount > 0
              ? `<span class="comment-count">[${commentCount}]</span>`
              : ""
          }
          ${
            hasImage
              ? '<svg class="has-image" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"><path fill="none" d="M0 0h24v24H0z"/><path d="M4.828 21l-.02.02-.021-.02H2.992A.993.993 0 0 1 2 20.007V3.993A1 1 0 0 1 2.992 3h18.016c.548 0 .992.445.992.993v16.014a1 1 0 0 1-.992.993H4.828zM20 15V5H4v14L14 9l6 6zm0 2.828l-6-6L6.828 19H20v-1.172zM8 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>'
              : ""
          }
        </span>
      </div>
      <div class="post-sub-info">
        <span class="post-author">${post.name || "익명"}</span>
        <span class="separator">|</span>
        <span class="post-views">${post.views || 0}</span>
        <span class="separator">|</span>
        <span class="post-date">${formatDate(post.createdAt)}</span>
      </div>
    `;
      listElement.appendChild(li);
    });
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

    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    if (minutes > 0) return `${minutes}분 전`;
    return "방금 전";
  }

  function fetchPopularPosts() {
    axios
      .get(`/api/posts/popular?page=1&pageSize=${itemsPerPage}`)
      .then(function (response) {
        console.log("Popular posts response:", response.data);
        const popularPosts = response.data.posts || [];
        renderPosts(popularPosts, popularPostList);
      })
      .catch(function (error) {
        console.error("인기 게시글 목록 조회 중 오류 발생:", error);
        popularPostList.innerHTML =
          "<li>인기 게시글을 불러오는데 실패했습니다.</li>";
      });
  }

  function fetchRecentPosts() {
    axios
      .get(`/api/posts/fetch/all?page=1&pageSize=${itemsPerPage}`)
      .then(function (response) {
        console.log("Recent posts response:", response.data);
        const recentPosts = response.data.posts || [];
        renderPosts(recentPosts, recentPostList);
      })
      .catch(function (error) {
        console.error("최근 게시글 목록 조회 중 오류 발생:", error);
        recentPostList.innerHTML =
          "<li>최근 게시글을 불러오는데 실패했습니다.</li>";
      });
  }

  function toggleLoginMypage() {
    const loginContent = document.getElementById("loginContent");
    const profileContent = document.getElementById("profileContent");
    const sectionTitle = document.getElementById("sectionTitle");

    if (AuthService.isAuthenticated()) {
      const currentUser = AuthService.getCurrentUser();
      if (loginContent) loginContent.style.display = "none";
      if (profileContent) profileContent.style.display = "block";
      if (sectionTitle) sectionTitle.textContent = "나의 정보";

      updateUserProfile(currentUser.id);

      if (myPostsLink)
        myPostsLink.href = `./templates/user/user_page.html?id=${currentUser.id}`;
      if (accountManagementLink)
        accountManagementLink.href = `./templates/user/user_update.html?id=${currentUser.id}`;
      if (writePostLink)
        writePostLink.href = `./templates/post/write.html?id=${currentUser.id}`;
    } else {
      if (loginContent) loginContent.style.display = "block";
      if (profileContent) profileContent.style.display = "none";
      if (sectionTitle) sectionTitle.textContent = "로그인";
    }
  }

  async function updateUserProfile(userId) {
    try {
      const response = await axios.get(`/api/user/fetch/${userId}`);
      const userData = response.data;
      console.log("사용자 정보:", userData);

      const userNameSpan = document.getElementById("userNameSpan");
      if (userNameSpan) {
        userNameSpan.textContent = userData.name || "이름 없음";
      }

      const profileImage = document.querySelector(".profile-image");
      if (profileImage) {
        profileImage.src =
          userData.profilePictureUrl || "/assets/default-profile-picture.jpg";
        profileImage.onerror = function () {
          this.src = "/assets/default-profile-picture.jpg";
        };
      }
    } catch (error) {
      console.error("사용자 정보 로드 중 오류 발생:", error);
      alert("사용자 정보를 불러오는 데 실패했습니다.");
    }
  }

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

  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      AuthService.logout();
      toggleLoginMypage();
      alert("로그아웃되었습니다.");
    });
  }

  toggleLoginMypage();
  fetchPopularPosts();
  fetchRecentPosts();
});
