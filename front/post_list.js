const itemsPerPage = 20;
let currentPage = 1;

function renderPosts() {
  const boardList = document.getElementById("boardList");
  boardList.innerHTML = "";

  const start = (currentPage - 1) * itemsPerPage;
  const end = Math.min(start + itemsPerPage, posts.length);
  const paginatedPosts = posts.slice(start, end);

  paginatedPosts.forEach((post) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
                <td class="title">
                    <div class="title-wrapper">
                        ${
                          post.hasImage
                            ? '<svg class="has-image" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 16L8.586 11.414C8.96106 11.0391 9.46967 10.8284 10 10.8284C10.5303 10.8284 11.0389 11.0391 11.414 11.414L16 16M14 14L15.586 12.414C15.9611 12.0391 16.4697 11.8284 17 11.8284C17.5303 11.8284 18.0389 12.0391 18.414 12.414L20 14M14 8H14.01M6 20H18C18.5304 20 19.0391 19.7893 19.4142 19.4142C19.7893 19.0391 20 18.5304 20 18V6C20 5.46957 19.7893 4.96086 19.4142 4.58579C19.0391 4.21071 18.5304 4 18 4H6C5.46957 4 4.96086 4.21071 4.58579 4.58579C4.21071 4.96086 4 5.46957 4 6V18C4 18.5304 4.21071 19.0391 4.58579 19.4142C4.96086 19.7893 5.46957 20 6 20Z" stroke="#888888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
                            : ""
                        }
                        <a href="#post-${post.id}">${post.title}</a>
                        ${
                          post.comments > 0
                            ? `<span class="comments">${post.comments}</span>`
                            : ""
                        }
                    </div>
                </td>
                <td class="author">${post.author}</td>
                <td class="date">${post.date}</td>
                <td class="views">${post.views}</td>
            `;
    boardList.appendChild(tr);
  });

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
  },
  {
    id: 2,
    title: "출근길에 만난 귀여운 강아지",
    author: "댕댕이러버",
    date: "2024-01-02",
    comments: 3,
    views: 80,
    hasImage: false,
  },
  {
    id: 3,
    title: "점심 시간에 읽은 재미있는 책",
    author: "책공주",
    date: "2024-01-03",
    comments: 0,
    views: 50,
    hasImage: true,
  },
  {
    id: 4,
    title: "퇴근 후 친구와의 저녁 약속",
    author: "맛집탐험가",
    date: "2024-01-04",
    comments: 2,
    views: 90,
    hasImage: false,
  },
  {
    id: 5,
    title: "주말에 가족과 함께 본 영화",
    author: "영화광팬",
    date: "2024-01-05",
    comments: 7,
    views: 150,
    hasImage: true,
  },
  {
    id: 6,
    title: "오랜만에 정리한 옷장",
    author: "정리의달인",
    date: "2024-01-06",
    comments: 1,
    views: 70,
    hasImage: false,
  },
  {
    id: 7,
    title: "동네 공원에서의 아침 산책",
    author: "아침햇살",
    date: "2024-01-07",
    comments: 4,
    views: 110,
    hasImage: true,
  },
  {
    id: 8,
    title: "오늘 배운 새로운 요리 레시피",
    author: "키친쉐프",
    date: "2024-01-08",
    comments: 6,
    views: 130,
    hasImage: false,
  },
  {
    id: 9,
    title: "집 앞 카페에서 마신 맛있는 커피",
    author: "카페인중독",
    date: "2024-01-09",
    comments: 0,
    views: 40,
    hasImage: true,
  },
  {
    id: 10,
    title: "친구에게 받은 깜짝 선물",
    author: "행운의요정",
    date: "2024-01-10",
    comments: 8,
    views: 180,
    hasImage: false,
  },
  {
    id: 11,
    title: "집에서 키우는 화분의 새싹",
    author: "초록",
    date: "2024-01-11",
    comments: 2,
    views: 95,
    hasImage: true,
  },
  {
    id: 12,
    title: "오랜만에 정리한 책상",
    author: "깔끔대장",
    date: "2024-01-12",
    comments: 3,
    views: 85,
    hasImage: false,
  },
  {
    id: 13,
    title: "아침에 본 아름다운 일출",
    author: "새벽감성",
    date: "2024-01-13",
    comments: 5,
    views: 140,
    hasImage: true,
  },
  {
    id: 14,
    title: "동네 시장에서의 장보기",
    author: "알뜰살뜰",
    date: "2024-01-14",
    comments: 1,
    views: 60,
    hasImage: false,
  },
  {
    id: 15,
    title: "주말에 다녀온 근교 여행",
    author: "여행중독자",
    date: "2024-01-15",
    comments: 9,
    views: 200,
    hasImage: true,
  },
  {
    id: 16,
    title: "오늘 도착한 온라인 쇼핑 물건",
    author: "쇼핑의신",
    date: "2024-01-16",
    comments: 2,
    views: 75,
    hasImage: false,
  },
  {
    id: 17,
    title: "저녁에 들은 좋아하는 음악",
    author: "음악천재",
    date: "2024-01-17",
    comments: 4,
    views: 100,
    hasImage: true,
  },
  {
    id: 18,
    title: "친구와 함께한 보드게임 night",
    author: "보드게임고수",
    date: "2024-01-18",
    comments: 7,
    views: 160,
    hasImage: false,
  },
  {
    id: 19,
    title: "새로 산 운동화로 시작한 조깅",
    author: "달리기왕",
    date: "2024-01-19",
    comments: 3,
    views: 90,
    hasImage: true,
  },
  {
    id: 20,
    title: "반려견과의 즐거운 산책",
    author: "멍멍이파파",
    date: "2024-01-20",
    comments: 6,
    views: 130,
    hasImage: false,
  },
  {
    id: 21,
    title: "베란다에서 키우는 작은 텃밭",
    author: "도시농부",
    date: "2024-01-21",
    comments: 5,
    views: 110,
    hasImage: true,
  },
  {
    id: 22,
    title: "오랜만에 만난 고등학교 동창",
    author: "추억의달인",
    date: "2024-01-22",
    comments: 8,
    views: 170,
    hasImage: false,
  },
  {
    id: 23,
    title: "직접 만든 수제 쿠키",
    author: "쿠키마스터",
    date: "2024-01-23",
    comments: 4,
    views: 95,
    hasImage: true,
  },
  {
    id: 24,
    title: "퇴근 후 즐긴 맥주 한잔",
    author: "Beer_Lover",
    date: "2024-01-24",
    comments: 1,
    views: 55,
    hasImage: false,
  },
  {
    id: 25,
    title: "주말에 본 재미있는 연극",
    author: "문화생활러",
    date: "2024-01-25",
    comments: 7,
    views: 145,
    hasImage: true,
  },
  {
    id: 26,
    title: "새로 배우기 시작한 기타 연주",
    author: "음악초보자",
    date: "2024-01-26",
    comments: 2,
    views: 80,
    hasImage: false,
  },
  {
    id: 27,
    title: "아침에 마주친 이웃과의 대화",
    author: "친절한이웃",
    date: "2024-01-27",
    comments: 0,
    views: 45,
    hasImage: true,
  },
  {
    id: 28,
    title: "점심 시간에 들른 미술관",
    author: "예술의향기",
    date: "2024-01-28",
    comments: 3,
    views: 100,
    hasImage: false,
  },
  {
    id: 29,
    title: "퇴근길에 우연히 본 무지개",
    author: "행운잡는자",
    date: "2024-01-29",
    comments: 6,
    views: 135,
    hasImage: true,
  },
  {
    id: 30,
    title: "늦은 밤 즐긴 라면의 맛",
    author: "야식킬러",
    date: "2024-01-30",
    comments: 4,
    views: 105,
    hasImage: false,
  },
];

// 초기 렌더링
renderPosts();
