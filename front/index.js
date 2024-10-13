import { AuthService } from "./auth.js";

document.addEventListener("DOMContentLoaded", function () {
  const popularPostList = document.getElementById("popularPostList");
  const recentPostList = document.getElementById("recentPostList");
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
      li.innerHTML = `
        <div class="post-info">
          <div class="post-title">${post.title || "제목 없음"}</div>
          <div class="post-meta">
            <span class="post-author">${post.name || "익명"}</span>
            <span class="post-date">${formatDate(post.createdAt)}</span>
          </div>
        </div>
        <div class="post-stats">
          <span class="post-views">조회 ${post.views || 0}</span>
          <span class="post-comments">댓글 ${post.commentCount || 0}</span>
        </div>
      `;
      li.addEventListener("click", () => viewPost(post.id));
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

  function toggleLoginMypage() {
    const loginContent = document.getElementById("loginContent");
    const profileContent = document.getElementById("profileContent");
    const sectionTitle = document.getElementById("sectionTitle");
    const myPostsLink = document.getElementById("myPostsLink");
    const accountManagementLink = document.getElementById(
      "accountManagementLink"
    );
    const userNameSpan = document.getElementById("userNameSpan");

    if (AuthService.isAuthenticated()) {
      const currentUser = AuthService.getCurrentUser();
      loginContent.style.display = "none";
      profileContent.style.display = "block";
      sectionTitle.textContent = "마이페이지";

      // 사용자 이름 표시
      userNameSpan.textContent = currentUser.name || "사용자";

      // 내가 쓴 글 링크 설정
      myPostsLink.href = `/msa_Project/front/user/user_page.html?id=${currentUser.id}`;

      // 계정 관리 링크 설정
      accountManagementLink.href = `/msa_Project/front/user/user_update.html?id=${currentUser.id}`;

      // 글쓰기 버튼 추가
      const writeButton = document.createElement("button");
      writeButton.textContent = "글쓰기";
      writeButton.className = "write-btn";
      writeButton.addEventListener("click", () => {
        window.location.href = "write.html";
      });
      profileContent.appendChild(writeButton);
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
