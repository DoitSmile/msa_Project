import { AuthService } from "/msa_Project/front/js/auth/auth.js";

document.addEventListener("DOMContentLoaded", function () {
  // DOM 요소들을 가져옵니다.
  const title = document.getElementById("title");
  const categoryId = document.getElementById("categoryId");
  const categoryWrapper = document.querySelector(".select-wrapper");
  const editor = document.getElementById("content");
  const boldBtn = document.getElementById("boldBtn");
  const italicBtn = document.getElementById("italicBtn");
  const underlineBtn = document.getElementById("underlineBtn");
  const imageBtn = document.getElementById("imageBtn");
  const imageUpload = document.getElementById("imageUpload");
  const fontSizeSelect = document.getElementById("fontSizeSelect");
  const form = document.getElementById("postWriteForm");
  const submitBtn = document.getElementById("submitBtn");
  const pageTitle = document.getElementById("pageTitle");

  let isEditMode = false;
  let originalPostId = null;
  let uploadedImages = []; // 업로드된 이미지를 추적하기 위한 배열

  // URL에서 postId 파라미터 확인
  const urlParams = new URLSearchParams(window.location.search);
  const postIdFromUrl = urlParams.get("postId");

  if (postIdFromUrl) {
    isEditMode = true;
    originalPostId = postIdFromUrl;
    if (pageTitle) pageTitle.textContent = "진대 - 게시글 수정";
    if (submitBtn) submitBtn.textContent = "수정";
    loadPostData(postIdFromUrl);

    // 카테고리 선택란 제거 및 hidden input 추가
    if (categoryWrapper && categoryId) {
      const hiddenCategoryInput = document.createElement("input");
      hiddenCategoryInput.type = "hidden";
      hiddenCategoryInput.id = "hiddenCategoryId";
      hiddenCategoryInput.name = "categoryId";
      categoryWrapper.replaceChild(hiddenCategoryInput, categoryId);
    }
  }

  // 기존 게시글 데이터 로드
  async function loadPostData(postId) {
    try {
      const response = await axios.get(
        `http://localhost:3000/post/fetch/${postId}`
      );

      const post = response.data;
      if (!post) {
        throw new Error("게시글 데이터가 없습니다.");
      }

      if (title) title.value = post.title;
      if (editor) {
        editor.innerHTML = post.content;

        // 기존 이미지 로드
        if (post.imageUrls && post.imageUrls.length > 0) {
          post.imageUrls.forEach((imageUrl) => {
            const img = document.createElement("img");
            img.src = imageUrl;
            img.style.maxWidth = "80%";
            img.style.height = "auto";
            img.setAttribute("contenteditable", "false");
            editor.appendChild(img);
          });
        }
      }

      // 카테고리 정보를 hidden input에 설정
      const hiddenCategoryInput = document.getElementById("hiddenCategoryId");
      if (hiddenCategoryInput && post.category) {
        hiddenCategoryInput.value = post.category.id;
      }

      // hidden input으로 postId 추가
      let postIdInput = document.getElementById("postIdInput");
      if (!postIdInput) {
        postIdInput = document.createElement("input");
        postIdInput.type = "hidden";
        postIdInput.id = "postIdInput";
        postIdInput.name = "postId";
        form.appendChild(postIdInput);
      }
      postIdInput.value = postId;

      // 기존 이미지 URL을 uploadedImages 배열에 추가
      uploadedImages = post.imageUrls ? post.imageUrls : [];
    } catch (error) {
      console.error("게시글 로드 중 오류 발생:", error);
      alert("게시글을 불러오는데 실패했습니다. 오류: " + error.message);
    }
  }

  // 폼 제출 이벤트 리스너
  if (form) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      if (!AuthService.isAuthenticated()) {
        alert("로그인이 필요합니다.");
        window.location.href = "/msa_Project/front/index.html";
        return;
      }

      const formData = new FormData();

      formData.append("title", document.getElementById("title").value);

      const categoryId =
        document.getElementById("categoryId") ||
        document.getElementById("hiddenCategoryId");
      if (categoryId) {
        formData.append("categoryId", categoryId.value);
      }

      formData.append("content", editor.innerHTML);

      // 이미지 파일 처리
      uploadedImages.forEach((image, index) => {
        if (image instanceof File) {
          formData.append(`images`, image);
        }
      });

      if (isEditMode && originalPostId) {
        formData.append("postId", originalPostId);
      }

      try {
        let response;
        if (isEditMode) {
          response = await axios.put(
            `http://localhost:3000/post/update/${originalPostId}`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
        } else {
          response = await axios.post(
            "http://localhost:3000/post/create/",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
        }

        console.log("서버 응답:", response.data);
        alert(
          isEditMode
            ? "글이 성공적으로 수정되었습니다."
            : "글이 성공적으로 등록되었습니다."
        );
        window.location.href = `/msa_Project/front/templates/post/post_view.html?id=${
          response.data.id || originalPostId
        }`;
      } catch (error) {
        console.error("에러 발생:", error);
        handleError(error);
      }
    });
  }

  // 이미지 업로드 처리
  if (imageUpload) {
    imageUpload.addEventListener("change", function (e) {
      const files = e.target.files;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file) {
          uploadedImages.push(file); // 업로드된 이미지 추적
          const reader = new FileReader();
          reader.onload = function (e) {
            const img = document.createElement("img");
            img.src = e.target.result;
            img.style.maxWidth = "80%";
            img.style.height = "auto";
            img.setAttribute("contenteditable", "false");
            img.setAttribute("data-filename", file.name);
            editor.appendChild(img);
          };
          reader.readAsDataURL(file);
        }
      }
    });
  }

  function handleError(error) {
    if (error.response) {
      console.log("Error response:", error.response);
      switch (error.response.status) {
        case 400:
          alert("잘못된 요청입니다. 입력 내용을 확인해주세요.");
          break;
        case 401:
          alert("인증이 만료되었습니다. 다시 로그인해주세요.");
          AuthService.logout();
          window.location.href = "/msa_Project/front/index.html";
          break;
        case 403:
          alert("글 작성/수정 권한이 없습니다.");
          break;
        default:
          alert("글 작성/수정 중 오류가 발생했습니다. 다시 시도해 주세요.");
      }
    } else if (error.request) {
      console.log("Error request:", error.request);
      alert("서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.");
    } else {
      console.log("Error message:", error.message);
      alert("오류가 발생했습니다: " + error.message);
    }
  }

  // 에디터 관련 기능
  if (editor) {
    function managePlaceholder() {
      if (editor.textContent.trim() === "") {
        editor.classList.add("empty");
      } else {
        editor.classList.remove("empty");
      }
    }

    editor.addEventListener("input", managePlaceholder);
    managePlaceholder();

    editor.addEventListener("keyup", updateFontSizeSelect);
    editor.addEventListener("mouseup", updateFontSizeSelect);
  }

  if (fontSizeSelect) {
    fontSizeSelect.addEventListener("change", function () {
      document.execCommand("fontSize", false, this.value);
    });
  }

  function updateFontSizeSelect() {
    const fontSize = document.queryCommandValue("fontSize");
    if (fontSize && fontSizeSelect) {
      fontSizeSelect.value = fontSize;
    }
  }

  document.execCommand("fontSize", false, "4");

  if (categoryId) {
    categoryId.addEventListener("change", function () {
      this.style.color = this.value ? "#333" : "#999";
    });
  }

  // 버튼 이벤트 리스너
  if (boldBtn)
    boldBtn.addEventListener("click", () =>
      document.execCommand("bold", false, null)
    );
  if (italicBtn)
    italicBtn.addEventListener("click", () =>
      document.execCommand("italic", false, null)
    );
  if (underlineBtn)
    underlineBtn.addEventListener("click", () =>
      document.execCommand("underline", false, null)
    );
  if (imageBtn && imageUpload)
    imageBtn.addEventListener("click", () => imageUpload.click());
});
