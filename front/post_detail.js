function toggleLike(element) {
  element.classList.toggle("liked");
}

function editPost() {
  alert("게시글 수정 기능");
}

function deletePost() {
  if (confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
    alert("게시글이 삭제되었습니다.");
  }
}

function editComment(id) {
  alert(`댓글 ${id} 수정 기능`);
}

function deleteComment(id) {
  if (confirm(`정말로 이 댓글을 삭제하시겠습니까?`)) {
    alert(`댓글 ${id}이 삭제되었습니다.`);
  }
}

function addComment() {
  const commentText = document.getElementById("commentText").value;
  if (commentText.trim() !== "") {
    alert("새 댓글이 추가되었습니다: " + commentText);
    document.getElementById("commentText").value = "";
  }
  return false;
}

let isLiked = false;
let likeCount = 56;

function toggleLike(element) {
  isLiked = !isLiked;
  element.classList.toggle("liked");
  likeCount += isLiked ? 1 : -1;
  document.getElementById("likeCount").textContent = likeCount;
}
