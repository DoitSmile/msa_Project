// 게시판 선택 시 텍스트 색상 변경
document
  .querySelector('select[name="board"]')
  .addEventListener("change", function () {
    if (this.value) {
      this.style.color = "#333";
    } else {
      this.style.color = "#999";
    }
  });

// 리치 텍스트 에디터 관련 요소 선택
const editor = document.getElementById("editor");
const boldBtn = document.getElementById("boldBtn");
const italicBtn = document.getElementById("italicBtn");
const underlineBtn = document.getElementById("underlineBtn");
const imageBtn = document.getElementById("imageBtn");
const imageUpload = document.getElementById("imageUpload");

// 텍스트 서식 버튼 이벤트 리스너
boldBtn.addEventListener("click", () =>
  document.execCommand("bold", false, null)
);
italicBtn.addEventListener("click", () =>
  document.execCommand("italic", false, null)
);
underlineBtn.addEventListener("click", () =>
  document.execCommand("underline", false, null)
);
imageBtn.addEventListener("click", () => imageUpload.click());

/// 이미지 업로드 처리
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
      img.classList.add("editable-image");
      img.setAttribute("contenteditable", "false");

      // 현재 커서 위치에 이미지 삽입
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(img);
        range.collapse(false);
      } else {
        editor.appendChild(img);
      }

      // 이미지 클릭 이벤트 리스너 추가
      img.addEventListener("click", toggleImageBorder);
      // 이미지 리사이즈 이벤트 리스너 추가
      img.addEventListener("mousedown", initResize, false);
    };
    reader.readAsDataURL(file);
  }
});

// 이미지 테두리 토글 함수
function toggleImageBorder(e) {
  const images = editor.querySelectorAll(".editable-image");
  images.forEach((img) => img.classList.remove("selected"));
  e.target.classList.add("selected");
}

// 에디터 영역 외 클릭 시 이미지 테두리 제거
document.addEventListener("click", function (e) {
  if (!editor.contains(e.target)) {
    const images = editor.querySelectorAll(".editable-image");
    images.forEach((img) => img.classList.remove("selected"));
  }
});
// 이미지 리사이즈 관련 변수
let isResizing = false;
let currentImage = null;
let startX, startY, startWidth, startHeight;

// 리사이즈 시작
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

// 리사이즈 중
function resize(e) {
  if (isResizing) {
    const width = startWidth + (e.clientX - startX);
    const height = startHeight + (e.clientY - startY);
    currentImage.style.width = width + "px";
    currentImage.style.height = height + "px";
  }
}

// 리사이즈 종료
function stopResize() {
  isResizing = false;
  document.removeEventListener("mousemove", resize, false);
  document.removeEventListener("mouseup", stopResize, false);
}

// placeholder 관리를 위한 함수
function managePlaceholder() {
  if (editor.textContent.trim() === "") {
    editor.classList.add("empty");
  } else {
    editor.classList.remove("empty");
  }
}

// 에디터 내용 변경 시 placeholder 관리
editor.addEventListener("input", managePlaceholder);

// 페이지 로드 시 초기 placeholder 상태 설정
managePlaceholder();

// 폼 제출 시 placeholder 제거 및 내용 저장
document.querySelector("form").addEventListener("submit", function (e) {
  if (editor.classList.add("empty")) {
    editor.textContent = "";
  }
  const content = editor.innerHTML;
  const hiddenInput = document.createElement("input");
  hiddenInput.type = "hidden";
  hiddenInput.name = "content";
  hiddenInput.value = content;
  this.appendChild(hiddenInput);
});
