document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("signupForm");
  const signupButton = document.getElementById("signupButton");
  const inputs = form.querySelectorAll("input[required]");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const passwordMessage = document.getElementById("password-message");
  const emailInput = document.getElementById("email");
  const nameInput = document.getElementById("name");
  const emailMessage = document.querySelector(".message.success-message");
  const emailFailureMessage = document.querySelector(
    ".message.failure-message"
  );
  const emailFailureMessage2 = document.querySelector(
    ".message.failure-message2"
  );
  const nicknameMessage = document.getElementById("nickname-message");

  let isEmailAvailable = false;
  let isNameAvailable = false;

  function isValidEmail(str) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str);
  }

  function hideEmailMessages() {
    [emailMessage, emailFailureMessage, emailFailureMessage2].forEach((el) =>
      el.classList.add("hide")
    );
  }

  function hideNicknameMessage() {
    nicknameMessage.classList.add("hide");
  }

  function showMessage(element, message, isSuccess = false) {
    element.textContent = message;
    element.classList.remove("hide");
    if (isSuccess) {
      element.classList.add("success-message");
      element.classList.remove("failure-message");
    } else {
      element.classList.add("failure-message");
      element.classList.remove("success-message");
    }
  }

  async function checkEmailAvailability(email) {
    try {
      const response = await axios.post("/api/user/check-email", { email });
      return response.data.available;
    } catch (error) {
      console.error("이메일 중복 확인 중 오류 발생:", error);
      return false;
    }
  }

  emailInput.addEventListener("blur", async function () {
    hideEmailMessages();
    const value = this.value.trim();

    if (value.length === 0) return;

    if (isValidEmail(value)) {
      isEmailAvailable = await checkEmailAvailability(value);
      if (isEmailAvailable) {
        showMessage(emailMessage, "사용 가능한 이메일입니다.", true);
      } else {
        showMessage(emailFailureMessage2, "이미 사용 중인 이메일입니다.");
      }
    } else if (value.length < 4 || value.length > 12) {
      showMessage(
        emailFailureMessage,
        "4~12자의 영문 대/소문자와 숫자를 사용하세요."
      );
    } else {
      showMessage(emailFailureMessage2, "올바른 형식의 이메일을 입력해주세요.");
    }
  });

  nameInput.addEventListener("blur", async function () {
    hideNicknameMessage();
    const value = this.value.trim();

    if (value.length === 0) return;

    isNameAvailable = await checkNameAvailability(value);
    if (isNameAvailable) {
      showMessage(nicknameMessage, "사용 가능한 닉네임입니다.", true);
    } else {
      showMessage(nicknameMessage, "이미 사용 중인 닉네임입니다.");
    }
  });

  function checkPasswordMatch() {
    if (passwordInput.value === confirmPasswordInput.value) {
      passwordMessage.textContent = "비밀번호가 일치합니다.";
      passwordMessage.className = "message success-message";
    } else {
      passwordMessage.textContent = "비밀번호가 일치하지 않습니다.";
      passwordMessage.className = "message failure-message";
    }
  }

  passwordInput.addEventListener("input", checkPasswordMatch);
  confirmPasswordInput.addEventListener("input", checkPasswordMatch);

  function showFormMessage(message, type) {
    const messageElement = document.createElement("div");
    messageElement.textContent = message;
    messageElement.className = `message ${type}-message`;
    form.insertBefore(messageElement, signupButton);
    setTimeout(() => {
      messageElement.remove();
    }, 3000);
  }

  signupButton.disabled = false;

  if (form) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      let isFormValid = true;
      let emptyFields = [];
      inputs.forEach((input) => {
        if (!input.value.trim()) {
          isFormValid = false;
          emptyFields.push(input.name);
        }
      });

      if (!isFormValid) {
        showFormMessage(
          `다음 필드를 입력해주세요: ${emptyFields.join(", ")}`,
          "failure"
        );
        return;
      }

      if (passwordInput.value !== confirmPasswordInput.value) {
        showFormMessage("비밀번호가 일치하지 않습니다.", "failure");
        return;
      }

      if (!window.isPhoneVerified) {
        showFormMessage("전화번호 인증을 완료해주세요.", "failure");
        return;
      }

      if (!isEmailAvailable) {
        showFormMessage("이메일 중복을 확인해주세요.", "failure");
        return;
      }

      if (!isNameAvailable) {
        showFormMessage("닉네임 중복을 확인해주세요.", "failure");
        return;
      }

      const formData = new FormData(this);
      const createUserInput = Object.fromEntries(formData.entries());

      console.log("전송할 데이터:", createUserInput);

      try {
        const response = await axios.post("/api/user/create", createUserInput, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("서버 응답:", response.data);
        alert("회원가입되었습니다.");
        window.location.href = "../../templates/index.html";
      } catch (error) {
        console.error("에러 발생:", error);
        showFormMessage(
          "등록 중 오류가 발생했습니다. 다시 시도해 주세요.",
          "failure"
        );
      }
    });
  } else {
    console.error("Form not found");
  }
});
