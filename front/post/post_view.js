const axiosInstance = axios.create({
  baseURL: "http://localhost:3000", // 실제 서버 URL
  timeout: 5000, // 타임아웃 설정
});

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

function fetchPostDetails(id) {
  axiosInstance
    .get(`/post/fetch/${id}`)
    .then(function (response) {
      console.log("서버 응답 데이터:", response.data);
      const post = response.data[0]; // 응답이 배열 형태이므로 첫 번째 요소를 사용
      if (!post) {
        throw new Error("게시글 데이터가 없습니다.");
      }

      setElementText("category-link", post.category);
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
      // 아직 구현되지 않은 필드들은 임시로 처리
      setElementText("post-views", "조회수 정보 없음");
      setElementText("likeCount", "좋아요 정보 없음");
      setElementText("comment-count", "댓글 정보 없음");

      // 댓글 기능이 아직 구현되지 않았으므로 임시 메시지 표시
      const commentsContainer = document.getElementById("comments-container");
      if (commentsContainer) {
        commentsContainer.innerHTML =
          "<p>댓글 기능은 아직 구현되지 않았습니다.</p>";
      }
    })
    .catch(function (error) {
      console.error("게시글 조회 중 오류 발생:", error);
      alert("게시글을 불러오는데 실패했습니다.");
    });
}

function toggleLike(element) {
  element.classList.toggle("liked");
  // TODO: 서버에 좋아요 상태 업데이트 요청 보내기
  const likeCountElement = document.getElementById("likeCount");
  if (likeCountElement) {
    const currentLikes = parseInt(likeCountElement.textContent);
    likeCountElement.textContent = element.classList.contains("liked")
      ? currentLikes + 1
      : currentLikes - 1;
  }
}

function editPost() {
  const postId = getUrlParameter("id");
  // TODO: 게시글 수정 페이지로 이동 또는 수정 모달 표시
  alert("게시글 수정 기능 - 구현 필요");
}

function deletePost() {
  const postId = getUrlParameter("id");
  if (confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
    // TODO: 서버에 삭제 요청 보내기
    alert("게시글이 삭제되었습니다.");
    window.location.href = "post_list.html"; // 목록 페이지로 이동
  }
}

function editComment(id) {
  // TODO: 댓글 수정 기능 구현
  alert(`댓글 ${id} 수정 기능 - 구현 필요`);
}

function deleteComment(id) {
  if (confirm(`정말로 이 댓글을 삭제하시겠습니까?`)) {
    // TODO: 서버에 댓글 삭제 요청 보내기
    alert(`댓글 ${id}이 삭제되었습니다.`);
    // 댓글 목록 새로고침
    const postId = getUrlParameter("id");
    fetchPostDetails(postId);
  }
}

function addComment() {
  const commentText = document.getElementById("commentText");
  if (commentText && commentText.value.trim() !== "") {
    const postId = getUrlParameter("id");
    // TODO: 서버에 새 댓글 추가 요청 보내기
    alert("새 댓글이 추가되었습니다: " + commentText.value);
    commentText.value = "";
    // 댓글 목록 새로고침
    fetchPostDetails(postId);
  }
  return false;
}

window.onload = function () {
  const postId = getUrlParameter("id");
  if (postId) {
    fetchPostDetails(postId);
  } else {
    console.error("게시글 ID가 제공되지 않았습니다.");
    alert("게시글 ID가 제공되지 않았습니다.");
    window.location.href = "post_list.html"; // 목록 페이지로 이동
  }
};
