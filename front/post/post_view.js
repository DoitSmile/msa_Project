import { AuthService } from "/msa_Project/front/auth.js";

const PostManager = (function () {
  let currentPostId;

  const axiosInstance = axios.create({
    baseURL: "http://localhost:3000",
    timeout: 5000,
  });

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

  function getUrlParameter(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    var results = regex.exec(location.search);
    return results === null
      ? ""
      : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  function setElementText(id, text) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = text;
    } else {
      console.warn(`Element with id '${id}' not found`);
    }
  }

  function setElementHTML(selector, html) {
    const element = document.querySelector(selector);
    if (element) {
      element.innerHTML = html;
    } else {
      console.warn(`Element with selector '${selector}' not found`);
    }
  }

  function createCategoryLink(category) {
    return `<a href="post_list.html?type=${category.id}" class="category-link">${category.name}</a>`;
  }

  function displayPostContent(post) {
    console.log("Displaying post content:", post);
    setElementText("post-title", post.title);
    setElementText("post-date", new Date(post.createdAt).toLocaleString());
    setElementHTML("#post-content", post.content);
    setElementText("post-views", post.views || "0");
    setElementText("likeCount", post.likes || "0");
    setElementText("comment-count", post.commentCount || "0");

    const imageGallery = document.getElementById("image-gallery");
    if (!imageGallery) {
      console.error("Image gallery element not found");
      return;
    }
    imageGallery.innerHTML = ""; // 기존 이미지 제거

    console.log("Image URLs:", post.imageUrls);

    if (post.imageUrls && post.imageUrls.length > 0) {
      post.imageUrls.forEach((url, index) => {
        console.log(`Processing image URL ${index}:`, url);
        const img = document.createElement("img");
        img.src = url;
        img.alt = `Post image ${index + 1}`;
        img.className = "gallery-image";
        img.onerror = (e) => {
          console.error(`Failed to load image ${index}:`, url);
          console.error("Error details:", e);
          // 오류 발생 시 이미지 대신 오류 메시지를 표시
          const errorDiv = document.createElement("div");
          errorDiv.textContent = `Image ${index + 1} failed to load`;
          errorDiv.className = "image-error";
          imageGallery.appendChild(errorDiv);
        };
        img.onload = () => console.log(`Image ${index} loaded successfully`);
        img.onclick = () => openImageModal(url);
        imageGallery.appendChild(img);

        // 이미지 URL을 직접 확인할 수 있는 링크 추가
        const linkDiv = document.createElement("div");
        const link = document.createElement("a");
        link.href = url;
        link.textContent = `Check Image ${index + 1}`;
        link.target = "_blank";
        linkDiv.appendChild(link);
        imageGallery.appendChild(linkDiv);
      });
      imageGallery.style.display = "block";
    } else {
      console.log("No images to display");
      imageGallery.style.display = "none";
    }

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
  }

  function openImageModal(url) {
    const modal = document.createElement("div");
    modal.className = "image-modal";
    modal.innerHTML = `
      <span class="close">&times;</span>
      <img class="modal-content" src="${url}">
    `;
    document.body.appendChild(modal);

    modal.style.display = "block";

    modal.querySelector(".close").onclick = function () {
      document.body.removeChild(modal);
    };

    window.onclick = function (event) {
      if (event.target == modal) {
        document.body.removeChild(modal);
      }
    };
  }

  async function fetchPostDetails() {
    console.log(`Fetching post details for ID: ${currentPostId}`);

    const currentUser = await AuthService.getCurrentUserAsync();
    const currentUserId = currentUser ? currentUser.id : null;

    console.log("currentUserId:", currentUserId);
    try {
      const response = await axiosInstance.get(`/post/fetch/${currentPostId}`, {
        params: { userId: currentUserId },
      });

      console.log(
        `Received post details for ID: ${currentPostId}`,
        response.data
      );
      const post = response.data;
      if (!post) {
        throw new Error("게시글 데이터가 없습니다.");
      }

      displayPostContent(post);
      setElementHTML("#category-link", createCategoryLink(post.category));
      setElementHTML(
        ".post-info",
        `
    작성자: <a href="/msa_Project/front/user/user_page.html?id=${
      post.userId
    }" class="user-link">${post.name}</a> |
    작성일: ${new Date(post.createdAt).toLocaleString()}
    `
      );

      fetchComments();
    } catch (error) {
      console.error(
        `Error fetching post details for ID: ${currentPostId}`,
        error
      );
      alert("게시글을 불러오는데 실패했습니다.");
    }
  }

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

  function editPost() {
    if (!AuthService.isAuthenticated()) {
      alert("로그인이 필요합니다.");
      window.location.href = "/msa_Project/front/index.html";
      return;
    }
    window.location.href = `write.html?postId=${currentPostId}`;
  }

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

  function fetchComments() {
    console.log(`Fetching comments for post ID: ${currentPostId}`);
    axiosInstance
      .get(`/post/comment/fetch/${currentPostId}`)
      .then((response) => {
        console.log(
          `Received comments for post ID: ${currentPostId}`,
          response.data
        );
        renderComments(response.data);
      })
      .catch((error) => {
        console.error(
          `Error fetching comments for post ID: ${currentPostId}`,
          error
        );
      });
  }

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

  function updateUIBasedOnAuth() {
    const isAuthenticated = AuthService.isAuthenticated();
    const currentUser = AuthService.getCurrentUser();

    const commentForm = document.querySelector(".comment-form");
    if (commentForm) {
      commentForm.style.display = isAuthenticated ? "block" : "none";
    }

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

    const userNameElement = document.getElementById("userName");
    if (userNameElement && currentUser) {
      userNameElement.textContent = currentUser.name;
    }
  }

  async function init() {
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
      await fetchPostDetails();
    } else {
      console.error("게시글 ID가 제공되지 않았습니다.");
      alert("게시글 ID가 제공되지 않았습니다.");
      window.location.href = "post_list.html";
    }

    const categoryBtn = document.querySelector(".category-btn");
    const categoryContent = document.querySelector(".category-content");
    if (categoryBtn && categoryContent) {
      categoryBtn.addEventListener("click", function (e) {
        e.preventDefault();
        categoryContent.style.display =
          categoryContent.style.display === "block" ? "none" : "block";
      });
    }

    updateUIBasedOnAuth();

    const commentForm = document.querySelector(".comment-form form");
    if (commentForm) {
      commentForm.addEventListener("submit", function (e) {
        e.preventDefault();
        addComment();
      });
    }

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
