// AuthService import 추가
import { AuthService } from "/msa_Project/front/auth.js";

const PostManager = (function () {
  // 현재 게시글의 ID를 저장하는 변수
  let currentPostId;

  // Axios 인스턴스 생성
  const axiosInstance = axios.create({
    baseURL: "http://localhost:3000",
    timeout: 5000,
  });

  // Axios 인터셉터 설정
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = AuthService.getToken();
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // URL 파라미터 가져오기
  function getUrlParameter(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    var results = regex.exec(location.search);
    return results === null
      ? ""
      : decodeURIComponent(results[1].replace(/\+/g, " "));
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
  function setElementHTML(selector, html) {
    const element = document.querySelector(selector);
    if (element) {
      element.innerHTML = html;
    } else {
      console.warn(`Element with selector '${selector}' not found`);
    }
  }

  // 카테고리 링크 생성
  function createCategoryLink(category) {
    return `<a href="post_list.html?type=${category.categoryId}" class="category-link">${category.name}</a>`;
  }

  // 게시글 상세 정보 가져오기
  function fetchPostDetails() {
    console.log(`Fetching post details for ID: ${currentPostId}`);
    axiosInstance
      .get(`/post/fetch/${currentPostId}`)
      .then(function (response) {
        console.log(`Received post details for ID: ${currentPostId}`);
        const post = response.data[0];
        if (!post) {
          throw new Error("게시글 데이터가 없습니다.");
        }

        // 게시글 정보를 화면에 표시
        setElementHTML("#category-link", createCategoryLink(post.category));
        setElementText("post-title", post.title);
        setElementText("post-content", post.content);
        setElementHTML(
          ".post-info",
          `
          작성자: <a href="/profile/${post.name}" class="user-link">${
            post.name
          }</a> |
          작성일: ${new Date(post.createdAt).toLocaleString()}
          `
        );
        setElementText("post-views", post.views || "정보 없음");
        setElementText("likeCount", post.likes || "정보 없음");
        setElementText("comment-count", post.commentCount || "정보 없음");

        // 수정/삭제 버튼 표시 여부 결정
        const currentUser = AuthService.getCurrentUser();
        const postActions = document.querySelector(".edit-delete-buttons");
        if (postActions) {
          if (currentUser && currentUser.id === post.userId) {
            postActions.style.display = "block";
          } else {
            postActions.style.display = "none";
          }
        }

        fetchComments();
      })
      .catch(function (error) {
        console.error(
          `Error fetching post details for ID: ${currentPostId}`,
          error
        );
        alert("게시글을 불러오는데 실패했습니다.");
      });
  }

  // 댓글 렌더링
  function renderComments(comments) {
    const commentsContainer = document.getElementById("comments-container");
    if (!commentsContainer) return;

    commentsContainer.innerHTML = "";

    const currentUser = AuthService.getCurrentUser();

    function createCommentElement(comment, isReply = false) {
      const commentElement = document.createElement("div");
      commentElement.className = isReply ? "comment reply" : "comment";
      commentElement.dataset.commentId = comment.id;

      console.log("comment.userId:", comment.userId);
      const isCommentOwner = currentUser && currentUser.id === comment.userId;
      const actionButtons = isCommentOwner
        ? `<a href="#" class="edit-comment">수정</a>
           <a href="#" class="delete-comment">삭제</a>`
        : "";

      const replyButton = isReply
        ? ""
        : '<a href="#" class="reply-button">답글</a>';

      commentElement.innerHTML = `
        <img src="/path/to/default/avatar.png" alt="User Avatar" class="comment-avatar">
        <div class="comment-content">
          <div class="comment-header">
            <span class="comment-author"><a href="/profile/${
              comment.userId
            }" class="user-link-comment">${comment.username}</a></span>
            <span class="comment-time">${new Date(
              comment.createdAt
            ).toLocaleString()}</span>
          </div>
          <p class="comment-text">${comment.content}</p>
          <div class="comment-actions">
            ${actionButtons}
            ${replyButton}
          </div>
          ${
            isReply
              ? ""
              : `
          <div class="reply-form" style="display:none;">
            <div class="comment-input-container">
              <textarea class="reply-text" placeholder="답글을 입력하세요..."></textarea>
              <button class="submit-reply">답글 작성</button>
            </div>
          </div>
          `
          }
        </div>
      `;
      return commentElement;
    }

    comments.forEach((comment) => {
      const commentElement = createCommentElement(comment);
      commentsContainer.appendChild(commentElement);

      if (comment.replies && comment.replies.length > 0) {
        const repliesContainer = document.createElement("div");
        repliesContainer.className = "replies";
        comment.replies.forEach((reply) => {
          const replyElement = createCommentElement(reply, true);
          repliesContainer.appendChild(replyElement);
        });
        commentElement.appendChild(repliesContainer);
      }
    });
  }
  // 댓글 조회
  function fetchComments() {
    console.log(`Fetching comments for post ID: ${currentPostId}`);
    axiosInstance
      .get(`/post/comment/fetch/${currentPostId}`)
      .then((response) => {
        console.log(`Received comments for post ID: ${currentPostId}`);
        renderComments(response.data);
      })
      .catch((error) => {
        console.error(
          `Error fetching comments for post ID: ${currentPostId}`,
          error
        );
      });
  }

  // 새 댓글 추가
  function addComment() {
    console.log(`Adding comment for post ID: ${currentPostId}`);
    const commentText = document.getElementById("commentText");

    if (!currentPostId) {
      console.error("게시글 ID가 없습니다.");
      alert(
        "게시글을 불러오는 중 오류가 발생했습니다. 페이지를 새로고침해주세요."
      );
      return false;
    }

    if (!commentText || commentText.value.trim() === "") {
      alert("댓글 내용을 입력해주세요.");
      return false;
    }

    if (!AuthService.isAuthenticated()) {
      alert("로그인이 필요합니다.");
      window.location.href = "/msa_Project/front/index.html";
      return false;
    }

    axiosInstance
      .post("/post/comment/create", {
        postId: currentPostId,
        content: commentText.value.trim(),
      })
      .then(() => {
        commentText.value = "";
        fetchComments();
      })
      .catch((error) => {
        console.error("댓글 추가 중 오류 발생:", error);
        if (error.response && error.response.status === 401) {
          alert("인증이 만료되었습니다. 다시 로그인해주세요.");
          AuthService.logout();
          window.location.href = "/msa_Project/front/index.html";
        } else {
          alert("댓글 추가에 실패했습니다.");
        }
      });

    return false;
  }

  // 대댓글 폼 토글
  function toggleReplyForm(commentElement) {
    const replyForm = commentElement.querySelector(".reply-form");
    if (replyForm) {
      replyForm.style.display =
        replyForm.style.display === "none" ? "block" : "none";
    }
  }

  // 대댓글 추가
  function addReply(parentId, content) {
    if (!content.trim()) {
      alert("답글 내용을 입력해주세요.");
      return;
    }

    if (!AuthService.isAuthenticated()) {
      alert("로그인이 필요합니다.");
      window.location.href = "/msa_Project/front/index.html";
      return;
    }

    axiosInstance
      .post("/post/comment/create", {
        postId: currentPostId,
        parentId: parentId,
        content: content.trim(),
      })
      .then(() => {
        fetchComments();
      })
      .catch((error) => {
        console.error("대댓글 추가 중 오류 발생:", error);
        if (error.response && error.response.status === 401) {
          alert("인증이 만료되었습니다. 다시 로그인해주세요.");
          AuthService.logout();
          window.location.href = "/msa_Project/front/index.html";
        } else {
          alert("대댓글 추가에 실패했습니다.");
        }
      });
  }

  // 댓글 수정
  function editComment(commentId) {
    if (!AuthService.isAuthenticated()) {
      alert("로그인이 필요합니다.");
      window.location.href = "/msa_Project/front/index.html";
      return;
    }

    const newContent = prompt("수정할 내용을 입력하세요:");
    if (newContent !== null) {
      axiosInstance
        .put("/post/comment/update", {
          commentId: commentId,
          content: newContent,
        })
        .then(() => {
          fetchComments();
        })
        .catch((error) => {
          console.error("댓글 수정 중 오류 발생:", error);
          if (error.response && error.response.status === 401) {
            alert("인증이 만료되었습니다. 다시 로그인해주세요.");
            AuthService.logout();
            window.location.href = "/msa_Project/front/index.html";
          } else if (error.response && error.response.status === 403) {
            alert("댓글을 수정할 권한이 없습니다.");
          } else {
            alert("댓글 수정에 실패했습니다.");
          }
        });
    }
  }

  // 댓글 삭제
  function deleteComment(commentId) {
    if (!AuthService.isAuthenticated()) {
      alert("로그인이 필요합니다.");
      window.location.href = "/msa_Project/front/index.html";
      return;
    }

    if (confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
      axiosInstance
        .delete(`/post/comment/delete/${commentId}`, {
          data: { commentId: commentId },
        })
        .then(() => {
          fetchComments();
        })
        .catch((error) => {
          console.error("댓글 삭제 중 오류 발생:", error);
          if (error.response && error.response.status === 401) {
            alert("인증이 만료되었습니다. 다시 로그인해주세요.");
            AuthService.logout();
            window.location.href = "/msa_Project/front/index.html";
          } else if (error.response && error.response.status === 403) {
            alert("댓글을 삭제할 권한이 없습니다.");
          } else {
            alert("댓글 삭제에 실패했습니다.");
          }
        });
    }
  }

  // 좋아요 토글
  function toggleLike(element) {
    if (!AuthService.isAuthenticated()) {
      alert("로그인이 필요합니다.");
      window.location.href = "/msa_Project/front/index.html";
      return;
    }

    element.classList.toggle("liked");
    const isLiked = element.classList.contains("liked");

    axiosInstance
      .post("/post/like", {
        postId: currentPostId,
        isLiked: isLiked,
      })
      .then((response) => {
        const likeCountElement = document.getElementById("likeCount");
        if (likeCountElement) {
          likeCountElement.textContent = response.data.likeCount;
        }
      })
      .catch((error) => {
        console.error("좋아요 토글 중 오류 발생:", error);
        if (error.response && error.response.status === 401) {
          alert("인증이 만료되었습니다. 다시 로그인해주세요.");
          AuthService.logout();
          window.location.href = "/msa_Project/front/index.html";
        } else {
          alert("좋아요 업데이트에 실패했습니다.");
        }
        element.classList.toggle("liked"); // 실패 시 UI 상태 되돌리기
      });
  }

  // 게시글 수정
  function editPost() {
    if (!AuthService.isAuthenticated()) {
      alert("로그인이 필요합니다.");
      window.location.href = "/msa_Project/front/index.html";
      return;
    }
    window.location.href = `write.html?postId=${currentPostId}`;
  }

  // 게시글 삭제
  function deletePost() {
    if (!AuthService.isAuthenticated()) {
      alert("로그인이 필요합니다.");
      window.location.href = "/msa_Project/front/index.html";
      return;
    }

    if (confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      axiosInstance
        .delete(`/post/delete/${currentPostId}`)
        .then(() => {
          alert("게시글이 삭제되었습니다.");
          window.location.href = "post_list.html";
        })
        .catch((error) => {
          console.error("게시글 삭제 중 오류 발생:", error);
          if (error.response && error.response.status === 401) {
            alert("인증이 만료되었습니다. 다시 로그인해주세요.");
            AuthService.logout();
            window.location.href = "/msa_Project/front/index.html";
          } else if (error.response && error.response.status === 403) {
            alert("게시글을 삭제할 권한이 없습니다.");
          } else {
            alert("게시글 삭제에 실패했습니다.");
          }
        });
    }
  }

  // 로그인 상태에 따라 UI 업데이트
  function updateUIBasedOnAuth() {
    const isAuthenticated = AuthService.isAuthenticated();
    const currentUser = AuthService.getCurrentUser();

    // 댓글 입력 폼 표시/숨김
    const commentForm = document.querySelector(".comment-form");
    if (commentForm) {
      commentForm.style.display = isAuthenticated ? "block" : "none";
    }

    // 로그인/로그아웃 버튼 업데이트
    const authButton = document.getElementById("authButton");
    if (authButton) {
      if (isAuthenticated) {
        authButton.textContent = "로그아웃";
        authButton.onclick = () => {
          AuthService.logout();
          window.location.reload();
        };
      } else {
        authButton.textContent = "로그인";
        authButton.onclick = () => {
          window.location.href = "/msa_Project/front/index.html";
        };
      }
    }

    // 사용자 이름 표시
    const userNameElement = document.getElementById("userName");
    if (userNameElement && currentUser) {
      userNameElement.textContent = currentUser.name;
    }
  }

  // 초기화 함수
  function init() {
    const editPostBtn = document.getElementById("editPostBtn");
    const deletePostBtn = document.getElementById("deletePostBtn");
    const likeButton = document.getElementById("likeButton");

    if (editPostBtn) editPostBtn.addEventListener("click", editPost);
    if (deletePostBtn) deletePostBtn.addEventListener("click", deletePost);
    if (likeButton)
      likeButton.addEventListener("click", () => toggleLike(likeButton));

    currentPostId = getUrlParameter("id");
    console.log("Initialized. currentPostId:", currentPostId);

    if (currentPostId) {
      fetchPostDetails();
    } else {
      console.error("게시글 ID가 제공되지 않았습니다.");
      alert("게시글 ID가 제공되지 않았습니다.");
      window.location.href = "post_list.html";
    }

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

    // 로그인 상태에 따라 UI 업데이트
    updateUIBasedOnAuth();

    // 댓글 폼 제출 이벤트 리스너 추가
    const commentForm = document.querySelector(".comment-form form");
    if (commentForm) {
      commentForm.addEventListener("submit", function (e) {
        e.preventDefault();
        addComment();
      });
    }

    // 댓글 컨테이너에 이벤트 리스너 추가 (이벤트 위임)
    const commentsContainer = document.getElementById("comments-container");
    if (commentsContainer) {
      commentsContainer.addEventListener("click", function (e) {
        const target = e.target;
        const commentElement = target.closest(".comment");
        if (!commentElement) return;

        const commentId = commentElement.dataset.commentId;

        if (target.classList.contains("edit-comment")) {
          editComment(commentId);
        } else if (target.classList.contains("delete-comment")) {
          deleteComment(commentId);
        } else if (target.classList.contains("reply-button")) {
          toggleReplyForm(commentElement);
        } else if (target.classList.contains("submit-reply")) {
          const replyText = commentElement.querySelector(".reply-text").value;
          addReply(commentId, replyText);
        }
      });
    }
  }

  // Public 인터페이스
  return {
    init: init,
    addComment: addComment,
    editComment: editComment,
    deleteComment: deleteComment,
    toggleLike: toggleLike,
    editPost: editPost,
    deletePost: deletePost,
  };
})();

// DOMContentLoaded 이벤트 리스너
document.addEventListener("DOMContentLoaded", PostManager.init);
