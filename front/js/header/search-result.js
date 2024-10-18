document.addEventListener("DOMContentLoaded", function () {
  axios.defaults.baseURL = "http://localhost:3000";
  const searchResults = document.getElementById("searchResults");
  const searchQuery = new URLSearchParams(window.location.search).get("q");
  const sortOption = document.getElementById("sortOption");
  let currentPage = 1;
  const pageSize = 10;

  async function fetchSearchResults(query, page, sort) {
    try {
      console.log("Sending search request for query:", query, "sort:", sort);
      const response = await axios.get(`/posts/search`, {
        params: {
          q: query,
          page: page,
          pageSize: pageSize,
          sort: sort,
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
      console.log("post", post);
      const tr = document.createElement("tr");
      const commentCount = post.commentCount || 0;
      const hasImage = post.imageUrls && post.imageUrls.length > 0;

      tr.innerHTML = `
        <td class="title">
          <div class="title-wrapper">
            <a href="post_view.html?id=${post.id}" class="post-title-link">
              ${post.title || "제목 없음"}
              ${
                commentCount > 0
                  ? ` <span class="comments">[ ${commentCount} ]</span>`
                  : ""
              }
            </a>
            ${
              hasImage
                ? '<svg class="has-image" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"><path fill="none" d="M0 0h24v24H0z"/><path d="M4.828 21l-.02.02-.021-.02H2.992A.993.993 0 0 1 2 20.007V3.993A1 1 0 0 1 2.992 3h18.016c.548 0 .992.445.992.993v16.014a1 1 0 0 1-.992.993H4.828zM20 15V5H4v14L14 9l6 6zm0 2.828l-6-6L6.828 19H20v-1.172zM8 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>'
                : ""
            }
          </div>
        </td>
        <td class="name">${post.name || "익명"}</td>
        <td class="date">${formatDate(post.createdAt)}</td>
        <td class="views">${post.views || 0}</td>
      `;

      const titleLink = tr.querySelector(".post-title-link");
      titleLink.addEventListener("click", function (event) {
        event.preventDefault();
        viewPost(post.id);
      });

      searchResults.appendChild(tr);
    });

    renderPagination(data.totalPages);
    console.log("Rendered search results");
  }

  function renderPagination(totalPages) {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
      const pageLink = document.createElement("a");
      pageLink.href = "#";
      pageLink.textContent = i;
      pageLink.classList.toggle("active", i === currentPage);
      pageLink.addEventListener("click", (e) => {
        e.preventDefault();
        currentPage = i;
        performSearch();
      });
      pagination.appendChild(pageLink);
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

  function performSearch() {
    const sort = sortOption.value;
    console.log("Initiating search for query:", searchQuery, "sort:", sort);
    fetchSearchResults(searchQuery, currentPage, sort)
      .then(renderSearchResults)
      .catch((error) => {
        console.error("Failed to fetch search results:", error);
        displayError(
          "검색 결과를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요."
        );
      });
  }

  if (searchQuery) {
    sortOption.addEventListener("change", () => {
      console.log("Sort option changed to:", sortOption.value);
      currentPage = 1; // 정렬 옵션이 변경되면 첫 페이지로 돌아갑니다.
      performSearch();
    });
    performSearch();
  } else {
    console.log("No search query provided");
    displayError("검색어를 입력해주세요.");
  }
});
