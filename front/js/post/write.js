import { AuthService } from "../auth/auth.js";

// 전역 카테고리-말머리 매핑
const prefixesByCategory = {
  "e1c56315-9360-11ef-a119-42010a400003": {
    // 기타동물
    options: ["자랑", "잡담", "질문", "정보"],
    required: true,
  },
  "e1c5608b-9360-11ef-a119-42010a400003": {
    // 강아지/고양이
    options: ["자랑", "잡담", "질문", "정보"],
    required: true,
  },
  "e1c56398-9360-11ef-a119-42010a400003": {
    // 애완용품
    options: ["질문", "정보", "판매", "나눔", "구해요"],
    required: true,
  },
  "e1c563ec-9360-11ef-a119-42010a400003": {
    // 후기
    options: ["용품후기", "병원후기", "기타후기"],
    required: true,
  },
};

document.addEventListener("DOMContentLoaded", function () {
  const elements = {
    title: document.getElementById("title"),
    categoryId: document.getElementById("categoryId"),
    categoryWrapper: document.querySelector(".select-wrapper"),
    postPrefix: document.getElementById("postPrefix"),
    editor: document.getElementById("content"),
    boldBtn: document.getElementById("boldBtn"),
    italicBtn: document.getElementById("italicBtn"),
    underlineBtn: document.getElementById("underlineBtn"),
    imageBtn: document.getElementById("imageBtn"),
    imageUpload: document.getElementById("imageUpload"),
    fontSizeSelect: document.getElementById("fontSizeSelect"),
    form: document.getElementById("postWriteForm"),
    submitBtn: document.getElementById("submitBtn"),
    pageTitle: document.getElementById("pageTitle"),
  };

  // 상태 관리
  const state = {
    isEditMode: false,
    originalPostId: null,
    uploadedImages: [],
  };

  async function initializeCategorySelect() {
    try {
      console.log("카테고리 API 호출 시작");
      const response = await axios.get("/api/categories");
      console.log("API 응답:", response);

      const categorySelect = document.getElementById("categoryId");
      if (!categorySelect) {
        console.error("categoryId element not found");
        return;
      }

      response.data.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
    } catch (error) {
      console.error("카테고리 API 호출 실패:", error);
    }
  }
  // 초기화 함수

  async function initialize() {
    try {
      // 카테고리 먼저 초기화
      await initializeCategorySelect();

      const urlParams = new URLSearchParams(window.location.search);
      const postIdFromUrl = urlParams.get("postId");

      if (postIdFromUrl) {
        initializeEditMode(postIdFromUrl);
      }

      setupEventListeners();
      if (elements.categoryId && elements.categoryId.value) {
        updatePrefixVisibility();
      }

      if (elements.editor) {
        elements.editor.style.fontSize = "14px";
      }
    } catch (error) {
      console.error("초기화 중 오류 발생:", error);
    }
  }

  // 수정 모드 초기화
  function initializeEditMode(postId) {
    state.isEditMode = true;
    state.originalPostId = postId;

    if (elements.pageTitle)
      elements.pageTitle.textContent = "진대 - 게시글 수정";
    if (elements.submitBtn) elements.submitBtn.textContent = "수정";

    if (elements.categoryWrapper && elements.categoryId) {
      const hiddenCategoryInput = document.createElement("input");
      hiddenCategoryInput.type = "hidden";
      hiddenCategoryInput.id = "hiddenCategoryId";
      hiddenCategoryInput.name = "categoryId";
      elements.categoryWrapper.replaceChild(
        hiddenCategoryInput,
        elements.categoryId
      );
    }

    loadPostData(postId);
  }

  // 이벤트 리스너 설정
  function setupEventListeners() {
    if (elements.categoryId) {
      elements.categoryId.addEventListener("change", () => {
        updatePrefixVisibility();
        updateTitle();
      });
    }

    if (elements.postPrefix) {
      elements.postPrefix.addEventListener("change", updateTitle);
    }

    if (elements.title) {
      elements.title.addEventListener("input", updateTitle);
    }

    if (elements.form) {
      elements.form.addEventListener("submit", handleFormSubmit);
    }

    if (elements.editor) {
      elements.editor.addEventListener("input", managePlaceholder);
      elements.editor.addEventListener("keyup", updateFontSizeSelect);
      elements.editor.addEventListener("mouseup", updateFontSizeSelect);
      managePlaceholder();
    }

    if (elements.fontSizeSelect) {
      elements.fontSizeSelect.addEventListener("change", function () {
        document.execCommand("fontSize", false, this.value);
      });
    }

    if (elements.imageUpload) {
      elements.imageUpload.addEventListener("change", handleImageUpload);
    }

    setupEditorButtons();
  }

  // 에디터 버튼 설정
  function setupEditorButtons() {
    const commands = {
      boldBtn: "bold",
      italicBtn: "italic",
      underlineBtn: "underline",
    };

    Object.entries(commands).forEach(([btnId, command]) => {
      if (elements[btnId]) {
        elements[btnId].addEventListener("click", () =>
          document.execCommand(command, false, null)
        );
      }
    });

    if (elements.imageBtn && elements.imageUpload) {
      elements.imageBtn.addEventListener("click", () =>
        elements.imageUpload.click()
      );
    }
  }

  // 말머리 가시성 업데이트
  function updatePrefixVisibility() {
    const selectedCategory = elements.categoryId.value;
    const prefixSelect = elements.postPrefix;

    while (prefixSelect.options.length > 1) {
      prefixSelect.remove(1);
    }

    const categoryPrefixes = prefixesByCategory[selectedCategory];

    if (categoryPrefixes) {
      categoryPrefixes.options.forEach((prefix) => {
        const option = document.createElement("option");
        option.value = prefix;
        option.textContent = prefix;
        prefixSelect.appendChild(option);
      });

      prefixSelect.style.display = "inline-block";
      prefixSelect.required = categoryPrefixes.required;
      prefixSelect.classList.add("required");
    } else {
      prefixSelect.style.display = "none";
      prefixSelect.required = false;
      prefixSelect.classList.remove("required");
      prefixSelect.value = "";
    }
  }

  // 제목 업데이트
  function updateTitle() {
    let currentTitle = elements.title.value;
    currentTitle = currentTitle.replace(/^\[.*?\]\s*/, "");
    elements.title.value = currentTitle;
  }

  // 게시글 데이터 로드
  async function loadPostData(postId) {
    try {
      const response = await axios.get(`/api/post/fetch/${postId}`);
      const post = response.data;

      if (!post) throw new Error("게시글 데이터가 없습니다.");

      updateFormWithPostData(post);
    } catch (error) {
      console.error("게시글 로드 중 오류 발생:", error);
      alert("게시글을 불러오는데 실패했습니다. 오류: " + error.message);
    }
  }

  function loadImages(imageUrls) {
    if (!imageUrls?.length) return;

    imageUrls.forEach((imageUrl) => {
      // blob URL인 경우 건너뛰기
      if (imageUrl.startsWith("blob:")) return;

      const wrapper = document.createElement("div");
      wrapper.style.display = "block";

      const imgContainer = document.createElement("div");
      imgContainer.className = "image-container";

      const img = document.createElement("img");
      img.src = imageUrl;
      img.setAttribute("contenteditable", "false");

      // 이미지 로드 에러 처리
      img.onerror = () => {
        wrapper.remove();
        const index = state.uploadedImages.indexOf(imageUrl);
        if (index > -1) {
          state.uploadedImages.splice(index, 1);
        }
      };

      const xMark = document.createElement("span");
      xMark.textContent = "×";
      xMark.className = "delete-mark write-mode";

      imgContainer.addEventListener(
        "mouseenter",
        () => (xMark.style.display = "flex")
      );
      imgContainer.addEventListener(
        "mouseleave",
        () => (xMark.style.display = "none")
      );
      xMark.addEventListener("click", () => {
        const index = state.uploadedImages.indexOf(imageUrl);
        if (index > -1) {
          state.uploadedImages.splice(index, 1);
        }
        wrapper.remove();
      });

      imgContainer.appendChild(img);
      imgContainer.appendChild(xMark);
      wrapper.appendChild(imgContainer);
      wrapper.appendChild(document.createElement("br"));

      elements.editor.appendChild(wrapper);
    });
  }

  // 폼 데이터 업데이트
  function updateFormWithPostData(post) {
    if (elements.title) {
      elements.title.value = post.title.replace(/^\[.*?\]\s*/, "");
    }

    if (elements.postPrefix) {
      elements.postPrefix.value = post.prefix || "";
    }

    if (elements.editor) {
      elements.editor.innerHTML = post.content;

      if (post.imageUrls && post.imageUrls.length > 0) {
        state.uploadedImages = post.imageUrls;
        loadImages(post.imageUrls);
      }
    }

    updateHiddenInputs(post);
  }

  // 이미지 업로드 처리
  function handleImageUpload(e) {
    const files = e.target.files;
    const maxSize = 5 * 1024 * 1024;

    try {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const currentElement = range.commonAncestorContainer;

      const editor = elements.editor;
      if (!editor.contains(currentElement)) {
        range.setStart(editor, editor.childNodes.length);
        range.setEnd(editor, editor.childNodes.length);
      }

      Array.from(files).forEach((file) => {
        if (file.size > maxSize) {
          alert(
            `파일 크기는 5MB를 초과할 수 없습니다. 현재 파일 크기: ${(
              file.size /
              1024 /
              1024
            ).toFixed(2)}MB`
          );
          return;
        }

        state.uploadedImages.push(file);

        const wrapper = document.createElement("div");
        wrapper.style.display = "block";

        const imgContainer = document.createElement("div");
        imgContainer.className = "image-container";

        const img = document.createElement("img");
        img.file = file;
        const reader = new FileReader();

        reader.onload = (function (aImg) {
          return function (e) {
            aImg.src = e.target.result;
          };
        })(img);

        reader.readAsDataURL(file);
        img.style.maxWidth = "400px";
        img.style.height = "auto";

        const deleteSpan = document.createElement("span");
        deleteSpan.textContent = "×";
        deleteSpan.className = "delete-mark";
        deleteSpan.addEventListener("click", () => {
          const index = state.uploadedImages.indexOf(file);
          if (index > -1) {
            state.uploadedImages.splice(index, 1);
          }
          wrapper.remove();
        });

        imgContainer.appendChild(img);
        imgContainer.appendChild(deleteSpan);
        wrapper.appendChild(imgContainer);
        wrapper.appendChild(document.createElement("br"));

        range.insertNode(wrapper);
        range.setStartAfter(wrapper);
        range.setEndAfter(wrapper);
      });

      selection.removeAllRanges();
      selection.addRange(range);
    } catch (error) {
      const editor = elements.editor;
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
  // hidden input
  function updateHiddenInputs(post) {
    const hiddenCategoryInput = document.getElementById("hiddenCategoryId");
    if (hiddenCategoryInput && post.category) {
      hiddenCategoryInput.value = post.category.id;
    }

    let postIdInput = document.getElementById("postIdInput");
    if (!postIdInput) {
      postIdInput = document.createElement("input");
      postIdInput.type = "hidden";
      postIdInput.id = "postIdInput";
      postIdInput.name = "postId";
      elements.form.appendChild(postIdInput);
    }
    postIdInput.value = post.id;
  }

  // 폼 제출 처리
  async function handleFormSubmit(event) {
    event.preventDefault();

    if (!AuthService.isAuthenticated()) {
      alert("로그인이 필요합니다.");
      window.location.href = "../../index.html";
      return;
    }

    const formData = new FormData();
    if (!appendFormData(formData)) return;

    try {
      const response = await submitPost(formData);
      handleSubmitSuccess(response);
    } catch (error) {
      console.error("에러 발생:", error);
      handleError(error);
    }
  }

  // 폼 데이터 추가
  function appendFormData(formData) {
    const categoryId =
      document.getElementById("categoryId") ||
      document.getElementById("hiddenCategoryId");

    if (!validateFormData(categoryId)) return false;

    formData.append("categoryId", categoryId.value);

    if (elements.postPrefix.style.display !== "none") {
      formData.append("prefix", elements.postPrefix.value);
    }

    let titleValue = elements.title.value.trim().replace(/^\[.*?\]\s*/, "");
    if (!titleValue) {
      alert("제목을 입력해주세요.");
      return false;
    }
    formData.append("title", titleValue);

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = elements.editor.innerHTML;
    const deleteButtons = tempDiv.querySelectorAll(".delete-mark");
    deleteButtons.forEach((button) => button.remove());

    formData.append("content", tempDiv.innerHTML);

    state.uploadedImages.forEach((image) => {
      if (image instanceof File) {
        formData.append("images", image);
      }
    });

    if (state.isEditMode && state.originalPostId) {
      formData.append("postId", state.originalPostId);
    }

    return true;
  }

  // 폼 데이터 유효성 검사
  function validateFormData(categoryId) {
    if (!categoryId) {
      alert("카테고리를 선택해주세요.");
      return false;
    }

    if (
      elements.postPrefix.style.display !== "none" &&
      elements.postPrefix.required &&
      !elements.postPrefix.value
    ) {
      alert("이 카테고리에서는 말머리 선택이 필수입니다.");
      return false;
    }

    return true;
  }

  // 게시글 제출
  async function submitPost(formData) {
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      // maxContentLength와 maxBodyLength 제거
    };

    if (state.isEditMode) {
      return await axios.put(
        `/api/post/update/${state.originalPostId}`,
        formData,
        config
      );
    } else {
      return await axios.post("/api/post/create/", formData, config);
    }
  }
  // 제출 성공 처리
  function handleSubmitSuccess(response) {
    console.log("서버 응답:", response.data);
    alert(
      state.isEditMode
        ? "글이 성공적으로 수정되었습니다."
        : "글이 성공적으로 등록되었습니다."
    );
    window.location.href = `../../templates/post/post_view.html?id=${
      response.data.id || state.originalPostId
    }`;
  }

  // 에디터 플레이스홀더 관리
  function managePlaceholder() {
    elements.editor.classList.toggle(
      "empty",
      elements.editor.textContent.trim() === ""
    );
  }

  // 폰트 크기 선택 업데이트
  function updateFontSizeSelect() {
    const fontSize = document.queryCommandValue("fontSize");
    if (fontSize && elements.fontSizeSelect) {
      elements.fontSizeSelect.value = fontSize;
    }
  }

  // 에러 처리
  function handleError(error) {
    if (error.response) {
      handleResponseError(error.response);
    } else if (error.request) {
      console.log("Error request:", error.request);
      alert("서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.");
    } else {
      console.log("Error message:", error.message);
      alert("오류가 발생했습니다: " + error.message);
    }
  }

  // 응답 에러 처리
  function handleResponseError(response) {
    console.log("Error response:", response);
    const errorMessages = {
      400: "잘못된 요청입니다. 입력 내용을 확인해주세요.",
      401: "인증이 만료되었습니다. 다시 로그인해주세요.",
      403: "글 작성/수정 권한이 없습니다.",
    };

    const message =
      errorMessages[response.status] ||
      "글 작성/수정 중 오류가 발생했습니다. 다시 시도해 주세요.";

    if (response.status === 401) {
      AuthService.logout();
      window.location.href = "../../index.html";
    } else {
      alert(message);
    }
  }

  // 초기화 실행
  initialize();
});
