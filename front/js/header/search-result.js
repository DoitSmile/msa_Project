document.addEventListener("DOMContentLoaded", function () {
  axios.defaults.baseURL = "http://localhost:3000";
  const searchResults = document.getElementById("searchResults");
  const searchQuery = new URLSearchParams(window.location.search).get("q");

  async function fetchSearchResults(query) {
    try {
      console.log("Sending search request for query:", query);
      const response = await axios.get(`/posts/search`, {
        params: {
          q: query,
          page: 1,
          pageSize: 10,
        },
      });
      console.log("Search response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching search results:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
      }
      throw error;
    }
  }

  function renderSearchResults(data) {
    const searchResults = document.getElementById("searchResults");
    searchResults.innerHTML = "";

    console.log("Rendering search results:", data);

    if (!data || !data.posts || data.posts.length === 0) {
      searchResults.innerHTML =
        "<tr><td colspan='4'>검색 결과가 없습니다.</td></tr>";
      return;
    }

    data.posts.forEach((post) => {
      const tr = document.createElement("tr");
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
      searchResults.appendChild(tr);
    });

    console.log("Rendered search results");
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

  function viewPost(postId) {
    window.location.href = `/msa_Project/front/templates/post/post_view.html?id=${postId}`;
  }

  function displayError(message) {
    searchResults.innerHTML = `<tr><td colspan='4'>${message}</td></tr>`;
  }

  if (searchQuery) {
    console.log("Initiating search for query:", searchQuery);
    fetchSearchResults(searchQuery)
      .then(renderSearchResults)
      .catch((error) => {
        console.error("Failed to fetch search results:", error);
        displayError(
          "검색 결과를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요."
        );
      });
  } else {
    console.log("No search query provided");
    displayError("검색어를 입력해주세요.");
  }
});
