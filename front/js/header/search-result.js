document.addEventListener("DOMContentLoaded", function () {
  const searchResults = document.getElementById("searchResults");
  const sortOption = document.getElementById("sortOption");
  let searchTimeout;
  let lastRequest = null;

  // 검색 파라미터 클래스
  class SearchParams {
    constructor() {
      this.params = new URLSearchParams(window.location.search);
    }

    get query() {
      return this.params.get("q") || "";
    }
    get sort() {
      return this.params.get("sort") || "date";
    }
    get page() {
      return parseInt(this.params.get("page")) || 1;
    }

    update(newParams) {
      Object.entries(newParams).forEach(([key, value]) => {
        this.params.set(key, value);
      });
      window.history.pushState(
        {},
        "",
        `${window.location.pathname}?${this.params.toString()}`
      );
    }
  }

  // 검색 상태 관리 클래스
  class SearchState {
    constructor() {
      this.loading = false;
      this.searchParams = new SearchParams();
      this.currentData = null;
      this.pageSize = 10;
    }

    setLoading(loading) {
      this.loading = loading;
      this.updateUI();
    }

    updateUI() {
      if (this.loading) {
        searchResults.innerHTML =
          '<tr><td colspan="4" class="loading">검색 중...</td></tr>';
      } else if (!this.currentData || !this.currentData.posts.length) {
        searchResults.innerHTML =
          '<tr><td colspan="4">검색 결과가 없습니다.</td></tr>';
      } else {
        this.renderResults();
      }
    }

    renderResults() {
      if (!this.currentData) return;

      searchResults.innerHTML = this.currentData.posts
        .map(
          (post) => `
        <tr>
          <td class="title">
            <div class="title-wrapper">
              <a href="../../templates/post/post_view.html?id=${
                post.id
              }" class="post-title-link">
                ${post.title || "제목 없음"}
                ${
                  post.commentCount > 0
                    ? ` <span class="comments">[ ${post.commentCount} ]</span>`
                    : ""
                }
              </a>
              ${
                post.imageUrls?.length > 0
                  ? '<svg class="has-image" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"><path fill="none" d="M0 0h24v24H0z"/><path d="M4.828 21l-.02.02-.021-.02H2.992A.993.993 0 0 1 2 20.007V3.993A1 1 0 0 1 2.992 3h18.016c.548 0 .992.445.992.993v16.014a1 1 0 0 1-.992.993H4.828zM20 15V5H4v14L14 9l6 6zm0 2.828l-6-6L6.828 19H20v-1.172zM8 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>'
                  : ""
              }
            </div>
          </td>
          <td class="name">${post.name || "익명"}</td>
          <td class="date">${this.formatDate(post.createdAt)}</td>
          <td class="views">${post.views || 0}</td>
        </tr>
      `
        )
        .join("");

      this.renderPagination();
    }

    renderPagination() {
      const pagination = document.getElementById("pagination");
      pagination.innerHTML = "";

      for (let i = 1; i <= this.currentData.totalPages; i++) {
        const pageLink = document.createElement("a");
        pageLink.href = "#";
        pageLink.textContent = i;
        pageLink.classList.toggle("active", i === this.searchParams.page);

        pageLink.addEventListener("click", (e) => {
          e.preventDefault();
          this.searchParams.update({ page: i });
          this.search();
        });

        pagination.appendChild(pageLink);
      }
    }

    formatDate(dateString) {
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

    async fetchSearchResults() {
      if (!this.searchParams.query || this.searchParams.query.length < 2) {
        this.displayError("검색어는 2글자 이상 입력해주세요.");
        return;
      }

      const cacheKey = `search:${this.searchParams.query}:${this.searchParams.sort}:${this.searchParams.page}`;
      const cachedData = sessionStorage.getItem(cacheKey);

      if (cachedData) {
        return JSON.parse(cachedData);
      }

      if (lastRequest) {
        lastRequest.cancel();
      }

      const cancelTokenSource = axios.CancelToken.source();
      lastRequest = cancelTokenSource;

      try {
        const response = await axios.get("/api/posts/search", {
          params: {
            q: this.searchParams.query,
            page: this.searchParams.page,
            pageSize: this.pageSize,
            sort: this.searchParams.sort,
          },
          headers: { "Cache-Control": "max-age=300" },
          cancelToken: cancelTokenSource.token,
        });

        sessionStorage.setItem(cacheKey, JSON.stringify(response.data));
        return response.data;
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log("Request canceled:", error.message);
        } else {
          throw error;
        }
      }
    }

    displayError(message) {
      searchResults.innerHTML = `<tr><td colspan="4">${message}</td></tr>`;
    }

    async search() {
      this.setLoading(true);
      try {
        this.currentData = await this.fetchSearchResults();
        this.setLoading(false);
      } catch (error) {
        console.error("검색 실패:", error);
        this.displayError("검색 중 오류가 발생했습니다.");
      }
    }
  }

  // 검색 상태 초기화 및 이벤트 핸들러 설정
  const searchState = new SearchState();

  // 정렬 옵션 변경 이벤트
  sortOption.addEventListener("change", (e) => {
    searchState.searchParams.update({
      sort: e.target.value,
      page: 1,
    });
    searchState.search();
  });

  // 초기 검색 실행
  if (searchState.searchParams.query) {
    sortOption.value = searchState.searchParams.sort;
    searchState.search();
  } else {
    searchState.displayError("검색어를 입력해주세요.");
  }
});
