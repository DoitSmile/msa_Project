const itemsPerPage = 20;
let currentPage = 1;

function renderPosts(isSpecialPage = false) {
  // 1. DOM에서 게시물 목록을 표시할 요소를 가져옵니다.
  const boardList = document.getElementById("boardList");

  // 2. 기존 내용을 지웁니다.
  boardList.innerHTML = "";

  // 3. 현재 페이지에 표시할 게시물의 범위를 계산합니다.
  const start = (currentPage - 1) * itemsPerPage;
  const end = Math.min(start + itemsPerPage, posts.length);

  // 4. 현재 페이지에 표시할 게시물만 선택합니다.
  const paginatedPosts = posts.slice(start, end);

  // 5. 각 게시물에 대해 HTML 요소를 생성합니다.
  paginatedPosts.forEach((post) => {
    const tr = document.createElement("tr");

    // 6. 게시물의 HTML 구조를 생성합니다.
    tr.innerHTML = `
      <td class="title">
        <div class="title-wrapper">
        ${
          isSpecialPage
            ? `<a href="post_list.html?type=${getBoardTypeKey(
                post.boardType
              )}" class="board-type">${post.boardType}</a>`
            : ""
        }
          <a href="#post-${post.id}">${post.title}</a>
          ${
            post.comments > 0
              ? `<span class="comments">${post.comments}</span>`
              : ""
          }
          ${post.hasImage ? '<svg class="has-image">...</svg>' : ""}
        </div>
      </td>
      <td class="author">${post.author}</td>
      <td class="date">${post.date}</td>
      <td class="views">${post.views}</td>
    `;

    // 7. 생성한 요소를 DOM에 추가합니다.
    boardList.appendChild(tr);
  });

  // 8. 페이지네이션을 렌더링합니다.
  renderPagination();
}

function renderPagination() {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const pageCount = Math.ceil(posts.length / itemsPerPage);

  for (let i = 1; i <= pageCount; i++) {
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = i;
    if (i === currentPage) {
      a.className = "active";
    }
    a.addEventListener("click", (e) => {
      e.preventDefault();
      currentPage = i;
      renderPosts();
    });
    pagination.appendChild(a);
  }
}

// 더미 데이터
const posts = [
  {
    id: 1,
    title: "오늘 아침에 먹은 맛있는 토스트 자랑",
    author: "토스트매니아",
    date: "2024-01-01",
    comments: 5,
    views: 120,
    hasImage: true,
    boardType: "자유게시판",
  },
  {
    id: 2,
    title: "출근길에 만난 귀여운 강아지",
    author: "댕댕이러버",
    date: "2024-01-02",
    comments: 3,
    views: 80,
    hasImage: false,
    boardType: "친목게시판",
  },
  {
    id: 3,
    title: "점심 시간에 읽은 재미있는 책",
    author: "책공주",
    date: "2024-01-03",
    comments: 0,
    views: 50,
    hasImage: true,
    boardType: "스터디게시판",
  },
  {
    id: 4,
    title: "퇴근 후 친구와의 저녁 약속",
    author: "맛집탐험가",
    date: "2024-01-04",
    comments: 2,
    views: 90,
    hasImage: false,
    boardType: "친목게시판",
  },
  {
    id: 5,
    title: "주말에 가족과 함께 본 영화",
    author: "영화광팬",
    date: "2024-01-05",
    comments: 7,
    views: 150,
    hasImage: true,
    boardType: "자유게시판",
  },
  {
    id: 6,
    title: "오랜만에 정리한 옷장",
    author: "정리의달인",
    date: "2024-01-06",
    comments: 1,
    views: 70,
    hasImage: false,
    boardType: "자유게시판",
  },
  {
    id: 7,
    title: "동네 공원에서의 아침 산책",
    author: "아침햇살",
    date: "2024-01-07",
    comments: 4,
    views: 110,
    hasImage: true,
    boardType: "친목게시판",
  },
  {
    id: 8,
    title: "오늘 배운 새로운 요리 레시피",
    author: "키친쉐프",
    date: "2024-01-08",
    comments: 6,
    views: 130,
    hasImage: false,
    boardType: "스터디게시판",
  },
  {
    id: 9,
    title: "집 앞 카페에서 마신 맛있는 커피",
    author: "카페인중독",
    date: "2024-01-09",
    comments: 0,
    views: 40,
    hasImage: true,
    boardType: "자유게시판",
  },
  {
    id: 10,
    title: "친구에게 받은 깜짝 선물",
    author: "행운의요정",
    date: "2024-01-10",
    comments: 8,
    views: 180,
    hasImage: false,
    boardType: "친목게시판",
  },
  {
    id: 11,
    title: "집에서 키우는 화분의 새싹",
    author: "초록",
    date: "2024-01-11",
    comments: 2,
    views: 95,
    hasImage: true,
    boardType: "자유게시판",
  },
  {
    id: 12,
    title: "오랜만에 정리한 책상",
    author: "깔끔대장",
    date: "2024-01-12",
    comments: 3,
    views: 85,
    hasImage: false,
    boardType: "자유게시판",
  },
  {
    id: 13,
    title: "아침에 본 아름다운 일출",
    author: "새벽감성",
    date: "2024-01-13",
    comments: 5,
    views: 140,
    hasImage: true,
    boardType: "자유게시판",
  },
  {
    id: 14,
    title: "동네 시장에서의 장보기",
    author: "알뜰살뜰",
    date: "2024-01-14",
    comments: 1,
    views: 60,
    hasImage: false,
    boardType: "자유게시판",
  },
  {
    id: 15,
    title: "주말에 다녀온 근교 여행",
    author: "여행중독자",
    date: "2024-01-15",
    comments: 9,
    views: 200,
    hasImage: true,
    boardType: "자유게시판",
  },
  {
    id: 16,
    title: "오늘 도착한 온라인 쇼핑 물건",
    author: "쇼핑의신",
    date: "2024-01-16",
    comments: 2,
    views: 75,
    hasImage: false,
    boardType: "자유게시판",
  },
  {
    id: 17,
    title: "저녁에 들은 좋아하는 음악",
    author: "음악천재",
    date: "2024-01-17",
    comments: 4,
    views: 100,
    hasImage: true,
    boardType: "자유게시판",
  },
  {
    id: 18,
    title: "친구와 함께한 보드게임 night",
    author: "보드게임고수",
    date: "2024-01-18",
    comments: 7,
    views: 160,
    hasImage: false,
    boardType: "게임게시판",
  },
  {
    id: 19,
    title: "새로 산 운동화로 시작한 조깅",
    author: "달리기왕",
    date: "2024-01-19",
    comments: 3,
    views: 90,
    hasImage: true,
    boardType: "자유게시판",
  },
  {
    id: 20,
    title: "반려견과의 즐거운 산책",
    author: "멍멍이파파",
    date: "2024-01-20",
    comments: 6,
    views: 130,
    hasImage: false,
    boardType: "자유게시판",
  },
  {
    id: 21,
    title: "베란다에서 키우는 작은 텃밭",
    author: "도시농부",
    date: "2024-01-21",
    comments: 5,
    views: 110,
    hasImage: true,
    boardType: "자유게시판",
  },
  {
    id: 22,
    title: "오랜만에 만난 고등학교 동창",
    author: "추억의달인",
    date: "2024-01-22",
    comments: 8,
    views: 170,
    hasImage: false,
    boardType: "친목게시판",
  },
  {
    id: 23,
    title: "직접 만든 수제 쿠키",
    author: "쿠키마스터",
    date: "2024-01-23",
    comments: 4,
    views: 95,
    hasImage: true,
    boardType: "자유게시판",
  },
  {
    id: 24,
    title: "퇴근 후 즐긴 맥주 한잔",
    author: "Beer_Lover",
    date: "2024-01-24",
    comments: 1,
    views: 55,
    hasImage: false,
    boardType: "자유게시판",
  },
  {
    id: 25,
    title: "주말에 본 재미있는 연극",
    author: "문화생활러",
    date: "2024-01-25",
    comments: 7,
    views: 145,
    hasImage: true,
    boardType: "자유게시판",
  },
  {
    id: 26,
    title: "새로 배우기 시작한 기타 연주",
    author: "음악초보자",
    date: "2024-01-26",
    comments: 2,
    views: 80,
    hasImage: false,
    boardType: "스터디게시판",
  },
  {
    id: 27,
    title: "아침에 마주친 이웃과의 대화",
    author: "친절한이웃",
    date: "2024-01-27",
    comments: 0,
    views: 45,
    hasImage: true,
    boardType: "친목게시판",
  },
  {
    id: 28,
    title: "점심 시간에 들른 미술관",
    author: "예술의향기",
    date: "2024-01-28",
    comments: 3,
    views: 100,
    hasImage: false,
    boardType: "자유게시판",
  },
  {
    id: 29,
    title: "퇴근길에 우연히 본 무지개",
    author: "행운잡는자",
    date: "2024-01-29",
    comments: 6,
    views: 135,
    hasImage: true,
    boardType: "자유게시판",
  },
  {
    id: 30,
    title: "늦은 밤 즐긴 라면의 맛",
    author: "야식킬러",
    date: "2024-01-30",
    comments: 4,
    views: 105,
    hasImage: false,
    boardType: "자유게시판",
  },
];

// URL 파라미터를 가져오는 함수
function getUrlParameter(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  var results = regex.exec(location.search);
  return results === null
    ? ""
    : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// boardType 문자열을 URL 파라미터에 맞는 키로 변환하는 함수
function getBoardTypeKey(boardType) {
  const lowerBoardType = boardType
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace("게시판", "");
  for (const [key, value] of Object.entries(boardTypes)) {
    if (
      value.toLowerCase().replace(/\s+/g, "").replace("게시판", "") ===
      lowerBoardType
    ) {
      return key;
    }
  }
  return "free"; // 기본값으로 자유 게시판 반환
}

// 게시판 정보를 관리하는 객체
const boardTypes = {
  free: "자유 게시판",
  friendship: "친목 게시판",
  dating: "연애 게시판",
  gaming: "게임 게시판",
  study: "스터디모집 게시판",
  popular: "인기 게시물",
  recent: "최근 게시물",
};

// 페이지 로드 시 실행되는 함수
window.onload = function () {
  const postType = getUrlParameter("type");
  const pageTitle = document.querySelector(".board-header h1");

  if (boardTypes.hasOwnProperty(postType)) {
    pageTitle.textContent = boardTypes[postType];
    renderPosts(postType === "popular" || postType === "recent");
  } else {
    pageTitle.textContent = "게시판";
    renderPosts(false);
  }
};
