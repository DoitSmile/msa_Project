import { AuthService } from "/msa_Project/front/auth.js";

document.addEventListener("DOMContentLoaded", function () {
  // DOM 요소들을 가져옵니다.
  const title = document.getElementById("title");
  const categoryId = document.getElementById("categoryId");
  const editor = document.getElementById("content");
  const boldBtn = document.getElementById("boldBtn");
  const italicBtn = document.getElementById("italicBtn");
  const underlineBtn = document.getElementById("underlineBtn");
  const imageBtn = document.getElementById("imageBtn");
  const imageUpload = document.getElementById("imageUpload");
  const fontSizeSelect = document.getElementById("fontSizeSelect");
  const form = document.getElementById("postWriteForm");
  // axios 인스턴스 생성 및 인터셉터 설정
  // const axiosInstance = axios.create();
  axios.interceptors.request.use(
    (config) => {
      const token = AuthService.getToken();
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  if (form) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      if (!AuthService.isAuthenticated()) {
        alert("로그인이 필요합니다.");
        window.location.href = "/login";
        return;
      }

      const formData = new FormData(this);
      formData.append("content", editor.innerHTML);
      const createPostInput = Object.fromEntries(formData.entries());

      console.log("전송할 데이터:", createPostInput);

      try {
        const response = await axios.post(
          "http://localhost:3000/post/create",
          createPostInput
        );
        console.log("서버 응답:", response.data);
        alert("글이 성공적으로 등록되었습니다.");
        // 서버 응답에서 categoryId 추출
        const { categoryId } = response.data;
        // 카테고리별 게시물 목록 페이지로 이동
        window.location.href = `post_list.html?type=${categoryId}`;
      } catch (error) {
        console.error("에러 발생:", error);
        if (error.response) {
          switch (error.response.status) {
            case 401:
              alert("인증이 만료되었습니다. 다시 로그인해주세요.");
              AuthService.logout();
              window.location.href = "/login";
              break;
            case 403:
              alert("글 작성 권한이 없습니다.");
              break;
            default:
              alert("글 작성 중 오류가 발생했습니다. 다시 시도해 주세요.");
          }
        } else {
          alert(
            "서버와의 통신 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요."
          );
        }
      }
    });
  } else {
    console.error("Form not found");
  }
  // editor가 존재하는지 확인합니다.
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
  } else {
    console.error("Editor not found");
  }

  // fontSizeSelect가 존재하는지 확인합니다.
  if (fontSizeSelect) {
    fontSizeSelect.addEventListener("change", function () {
      document.execCommand("fontSize", false, this.value);
    });
  } else {
    console.error("Font size select not found");
  }

  function updateFontSizeSelect() {
    const fontSize = document.queryCommandValue("fontSize");
    if (fontSize && fontSizeSelect) {
      fontSizeSelect.value = fontSize;
    }
  }

  document.execCommand("fontSize", false, "4");

  // category가 존재하는지 확인합니다.
  if (categoryId) {
    categoryId.addEventListener("change", function () {
      this.style.color = this.value ? "#333" : "#999";
    });
  } else {
    console.error("Category select not found");
  }

  // 버튼들이 존재하는지 확인합니다.
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

  // imageUpload가 존재하는지 확인합니다.
  if (imageUpload) {
    imageUpload.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const img = document.createElement("img");
          img.src = e.target.result;
          img.style.maxWidth = "100%";
          img.style.height = "auto";
          img.style.cursor = "nwse-resize";
          img.setAttribute("contenteditable", "false");

          const selection = window.getSelection();
          if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.insertNode(img);
            range.collapse(false);
          } else if (editor) {
            editor.appendChild(img);
          }

          img.addEventListener("mousedown", initResize, false);
          img.addEventListener("click", selectImage);
        };
        reader.readAsDataURL(file);
      }
    });
  } else {
    console.error("Image upload input not found");
  }

  function selectImage(e) {
    e.stopPropagation();
    const images = editor.querySelectorAll("img");
    images.forEach((img) => img.classList.add("not-selected"));
    e.target.classList.remove("not-selected");
  }

  if (editor) {
    editor.addEventListener("click", function (e) {
      if (e.target.tagName !== "IMG") {
        const images = editor.querySelectorAll("img");
        images.forEach((img) => img.classList.add("not-selected"));
      }
    });
  }

  document.addEventListener("click", function (e) {
    if (editor && !editor.contains(e.target)) {
      const images = editor.querySelectorAll("img");
      images.forEach((img) => img.classList.add("not-selected"));
    }
  });

  let isResizing = false;
  let currentImage = null;
  let startX, startY, startWidth, startHeight;

  function initResize(e) {
    if (e.target.tagName === "IMG") {
      isResizing = true;
      currentImage = e.target;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = currentImage.clientWidth;
      startHeight = currentImage.clientHeight;
      document.addEventListener("mousemove", resize, false);
      document.addEventListener("mouseup", stopResize, false);
      e.preventDefault();
    }
  }

  function resize(e) {
    if (isResizing) {
      const width = startWidth + (e.clientX - startX);
      const height = startHeight + (e.clientY - startY);
      currentImage.style.width = width + "px";
      currentImage.style.height = height + "px";
    }
  }

  function stopResize() {
    isResizing = false;
    document.removeEventListener("mousemove", resize, false);
    document.removeEventListener("mouseup", stopResize, false);
  }
});
