document.addEventListener("DOMContentLoaded", function () {
  const elInputEmail = document.querySelector("#email");
  const elSuccessMessage = document.querySelector(".message.success-message");
  const elFailureMessage = document.querySelector(".message.failure-message");
  const elFailureMessageTwo = document.querySelector(
    ".message.failure-message2"
  );

  if (
    !elInputEmail ||
    !elSuccessMessage ||
    !elFailureMessage ||
    !elFailureMessageTwo
  ) {
    console.error("One or more elements are missing");
    return;
  }

  function isValidEmail(str) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str);
  }

  function hideAllMessages() {
    [elSuccessMessage, elFailureMessage, elFailureMessageTwo].forEach((el) =>
      el.classList.add("hide")
    );
  }

  function showMessage(element, message) {
    element.textContent = message;
    element.classList.remove("hide");
  }

  elInputEmail.addEventListener("input", function () {
    hideAllMessages();
    const value = this.value.trim();

    if (value.length === 0) return;

    if (isValidEmail(value)) {
      showMessage(elSuccessMessage, "유효한 이메일 주소입니다.");
    } else if (value.length < 4 || value.length > 12) {
      showMessage(
        elFailureMessage,
        "4~12자의 영문 대/소문자와 숫자를 사용하세요."
      );
    } else {
      showMessage(elFailureMessageTwo, "올바른 형식의 이메일을 입력해주세요.");
    }
  });
});
