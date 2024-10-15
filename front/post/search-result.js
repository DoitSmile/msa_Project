document.addEventListener("DOMContentLoaded", function () {
  axios.defaults.baseURL = "http://localhost:3000";
  const searchResults = document.getElementById("searchResults");
  const searchQuery = new URLSearchParams(window.location.search).get("q");

  async function fetchSearchResults(query) {
    try {
      const response = await axios.get(`/posts/search`, {
        params: {
          q: query,
          page: 1,
          pageSize: 10,
        },
      });
      return response.data;
    } catch (error) {
      console.error("검색 결과를 가져오는 중 오류 발생:", error);
      throw error;
    }
  }

  function renderSearchResults(posts) {
    searchResults.innerHTML = ""; // 이 줄도 변경
    if (!Array.isArray(posts) || posts.length === 0) {
      searchResults.innerHTML =
        "<tr><td colspan='4'>검색 결과가 없습니다.</td></tr>"; // 이 줄도 변경
      return;
    }

    posts.forEach((post) => {
      const tr = document.createElement("tr"); // li 대신 tr 사용
      tr.innerHTML = `
        <td class="title">
          <div class="title-wrapper">
            <a href="post_view.html?id=${post.id}">${
        post.title || "제목 없음"
      }</a>
          </div>
        </td>
        <td class="name">${post.name || "익명"}</td>
        <td class="date">${formatDate(post.createdAt)}</td>
        <td class="views">${post.views || 0}</td>
      `;
      tr.addEventListener("click", () => viewPost(post.id));
      searchResults.appendChild(tr); // 이 줄도 변경
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

  function viewPost(postId) {
    window.location.href = `/msa_Project/front/post/post_view.html?id=${postId}`;
  }

  if (searchQuery) {
    fetchSearchResults(searchQuery)
      .then(renderSearchResults)
      .catch((error) => {
        searchResultsList.innerHTML =
          "<li>검색 결과를 불러오는데 실패했습니다.</li>";
      });
  }
});
