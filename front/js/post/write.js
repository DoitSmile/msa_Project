import { AuthService } from "../auth/auth.js";

document.addEventListener("DOMContentLoaded", function () {
  // DOM 요소 한 번에 가져오기
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

  // 카테고리별 말머리 설정
  const prefixesByCategory = {
    "2f61277c-9120-11ef-b125-0242ac120006": {
      // 애완용품
      required: true,
      options: ["판매", "나눔", "질문", "구해요"],
    },
    "ec6ffedb-911f-11ef-b125-0242ac120006": {
      // 강아지/고양이
      required: true,
      options: ["내새끼자랑", "질문", "정보", "잡담"],
    },
    "337e4172-9120-11ef-b125-0242ac120006": {
      // 기타동물
      required: true,
      options: ["내새끼자랑", "질문", "정보", "잡담"],
    },
    "e69bbb01-911f-11ef-b125-0242ac120006": {
      // 후기
      required: true,
      options: ["내새끼자랑", "병원", "사료", "간식", "애완용품", "기타"],
    },
  };

  // 초기화 함수
  function initialize() {
    const urlParams = new URLSearchParams(window.location.search);
    const postIdFromUrl = urlParams.get("postId");

    if (postIdFromUrl) {
      initializeEditMode(postIdFromUrl);
    }

    setupEventListeners();
    if (elements.categoryId && elements.categoryId.value) {
      updatePrefixVisibility();
    }

    // 초기 폰트 크기 설정을 에디터 초기화 시점에 설정
    if (elements.editor) {
      elements.editor.style.fontSize = "14px"; // 기본 폰트 크기 설정
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

    // 에디터 버튼 이벤트 리스너
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

  // 폼 데이터 업데이트
  function updateFormWithPostData(post) {
    if (elements.title) {
      elements.title.value = post.title.replace(/^\[.*?\]\s*/, "");
    }

    if (elements.postPrefix) {
      elements.postPrefix.value = post.prefix || "";
    }

    if (elements.editor) {
      // HTML 태그를 제거하고 순수 텍스트만 표시
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = post.content;
      elements.editor.textContent = tempDiv.textContent;

      // 이미지 로드
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

    // 현재 선택된 요소 확인
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const currentElement = range.commonAncestorContainer;

    // 제목 입력란인지 확인
    const titleInput = document.getElementById("title");
    if (titleInput.contains(currentElement)) {
      alert("제목에는 이미지를 삽입할 수 없습니다.");
      return;
    }

    // 에디터 영역인지 확인
    const editor = elements.editor;
    if (!editor.contains(currentElement)) {
      // 커서가 에디터 안에 없으면 에디터 끝에 추가
      range.setStart(editor, editor.childNodes.length);
      range.setEnd(editor, editor.childNodes.length);
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > maxSize) {
        alert(
          `파일 크기는 5MB를 초과할 수 없습니다. 현재 파일 크기: ${(
            file.size /
            1024 /
            1024
          ).toFixed(2)}MB`
        );
        continue;
      }

      if (file) {
        state.uploadedImages.push(file);
        const reader = new FileReader();
        reader.onload = function (e) {
          const wrapper = document.createElement("div");
          wrapper.style.display = "block";

          const imgContainer = document.createElement("div");
          imgContainer.className = "image-container";

          const img = document.createElement("img");
          img.src = e.target.result;
          img.setAttribute("contenteditable", "false");
          img.setAttribute("data-filename", file.name);

          const xMark = document.createElement("span");
          xMark.textContent = "×";
          xMark.className = "delete-mark";

          imgContainer.addEventListener(
            "mouseenter",
            () => (xMark.style.display = "block")
          );
          imgContainer.addEventListener(
            "mouseleave",
            () => (xMark.style.display = "none")
          );
          xMark.addEventListener("click", () => {
            const index = state.uploadedImages.findIndex(
              (f) => f.name === file.name
            );
            if (index > -1) {
              state.uploadedImages.splice(index, 1);
            }
            wrapper.remove();
          });

          imgContainer.appendChild(img);
          imgContainer.appendChild(xMark);
          wrapper.appendChild(imgContainer);

          // 줄바꿈 추가
          const br = document.createElement("br");
          wrapper.appendChild(br);

          // 현재 선택 위치에 삽입
          range.insertNode(wrapper);

          // 커서를 이미지 다음으로 이동
          range.setStartAfter(wrapper);
          range.setEndAfter(wrapper);
          selection.removeAllRanges();
          selection.addRange(range);
        };
        reader.readAsDataURL(file);
      }
    }
  }
  // 이미지 로드
  function loadImages(imageUrls) {
    if (!imageUrls?.length) return;

    imageUrls.forEach((imageUrl) => {
      const wrapper = document.createElement("div");
      wrapper.style.display = "block";

      const imgContainer = document.createElement("div");
      imgContainer.className = "image-container";

      const img = document.createElement("img");
      img.src = imageUrl;
      img.setAttribute("contenteditable", "false");

      const xMark = document.createElement("span");
      xMark.textContent = "×";
      xMark.className = "delete-mark";

      imgContainer.addEventListener(
        "mouseenter",
        () => (xMark.style.display = "block")
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
  // hidden input 업데이트
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
    appendPrefix(formData);
    appendTitleAndContent(formData);
    appendImages(formData);

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

  // 말머리 추가
  function appendPrefix(formData) {
    if (elements.postPrefix.style.display !== "none") {
      formData.append("prefix", elements.postPrefix.value);
    }
  }

  // 제목과 내용 추가
  function appendTitleAndContent(formData) {
    let titleValue = elements.title.value.trim().replace(/^\[.*?\]\s*/, "");
    if (!titleValue) {
      alert("제목을 입력해주세요.");
      return false;
    }
    formData.append("title", titleValue);

    const contentValue = elements.editor.innerHTML;
    if (!contentValue.trim()) {
      alert("내용을 입력해주세요.");
      return false;
    }
    formData.append("content", contentValue);
  }

  // 이미지 추가
  function appendImages(formData) {
    state.uploadedImages.forEach((image) => {
      if (image instanceof File) {
        formData.append("images", image);
      }
    });
  }

  // 게시글 제출
  async function submitPost(formData) {
    const config = {
      headers: { "Content-Type": "multipart/form-data" },
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

  // 이미지 미리보기 생성
  function createImagePreview(src, filename) {
    const img = document.createElement("img");
    img.src = src;
    img.style.maxWidth = "80%";
    img.style.height = "auto";
    img.setAttribute("contenteditable", "false");
    img.setAttribute("data-filename", filename);
    elements.editor.appendChild(img);
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
