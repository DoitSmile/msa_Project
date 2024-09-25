// 더미 데이터 (실제 구현 시 서버에서 가져와야 합니다)
const posts = [
  {
    id: 1,
    title: "첫 번째 글",
    board: "자유게시판",
    date: "2024.09.20",
    commentCount: 5,
  },
  {
    id: 2,
    title: "두 번째 글",
    board: "질문게시판",
    date: "2024.09.22",
    commentCount: 3,
  },
  // ... 더 많은 게시글
];

const comments = [
  {
    id: 1,
    content: "좋은 글이에요! 많은 도움이 되었습니다.",
    postId: 101,
    postTitle: "흥미로운 주제",
    board: "자유게시판",
    date: "2024.09.21",
  },
  {
    id: 2,
    content: "동의합니다. 이 기술의 발전이 기대됩니다.",
    postId: 102,
    postTitle: "새로운 기술 소개",
    board: "기술게시판",
    date: "2024.09.23",
  },
  // ... 더 많은 댓글
];

const itemsPerPage = 5;
let currentPage = 1;
let currentTab = "posts";

function renderItems(items, tabId) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);

  const container = document.getElementById(tabId);
  container.innerHTML = "";

  paginatedItems.forEach((item) => {
    if (tabId === "posts") {
      container.innerHTML += `
                <div class="post-item">
                    <h3><a href="/board/${item.board}/post/${item.id}">${item.title}</a> <span class="comment-count">댓글 ${item.commentCount}</span></h3>
                    <p>${item.board} | ${item.date}</p>
                </div>
            `;
    } else {
      container.innerHTML += `
                <div class="comment-item">
                    <p class="comment-content" onclick="window.location.href='/board/${item.board}/post/${item.postId}'">${item.content}</p>
                    <p class="post-title">댓글 단 글: <a href="/board/${item.board}/post/${item.postId}">${item.postTitle}</a></p>
                    <p>${item.board} | ${item.date}</p>
                </div>
            `;
    }
  });

  renderPagination(items.length);
}

function renderPagination(totalItems) {
  const pageCount = Math.ceil(totalItems / itemsPerPage);
  const paginationContainer = document.querySelector(".pagination");
  paginationContainer.innerHTML = "";

  for (let i = 1; i <= pageCount; i++) {
    const button = document.createElement("button");
    button.textContent = i;
    button.classList.toggle("active", i === currentPage);
    button.addEventListener("click", () => {
      currentPage = i;
      renderItems(currentTab === "posts" ? posts : comments, currentTab);
    });
    paginationContainer.appendChild(button);
  }
}

document.querySelectorAll(".content-nav li").forEach((tab) => {
  tab.addEventListener("click", () => {
    currentTab = tab.getAttribute("data-tab");
    currentPage = 1;

    document
      .querySelectorAll(".content-nav li")
      .forEach((t) => t.classList.remove("active"));
    document
      .querySelectorAll(".content-tab")
      .forEach((content) => (content.style.display = "none"));

    tab.classList.add("active");
    document.getElementById(currentTab).style.display = "block";

    renderItems(currentTab === "posts" ? posts : comments, currentTab);
  });
});

// 초기 렌더링
renderItems(posts, "posts");
