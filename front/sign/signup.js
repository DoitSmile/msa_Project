//DOMContentLoaded 이벤트 리스너를 사용하여 DOM이 완전히 로드된 후에 코드가 실행되도록 함
//즉 페이지가 로드되면 자동으로 이 함수가 실행
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("signupForm");
  const signupButton = document.getElementById("signupButton");
  const inputs = form.querySelectorAll("input[required]");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const passwordMessage = document.getElementById("password-message");

  function checkFormValidity() {
    let isValid = true;
    inputs.forEach((input) => {
      if (!input.value.trim()) {
        isValid = false;
      }
    });
    if (passwordInput.value !== confirmPasswordInput.value) {
      isValid = false;
    }
    signupButton.disabled = !isValid;
  }

  function checkPasswordMatch() {
    if (passwordInput.value === confirmPasswordInput.value) {
      passwordMessage.textContent = "비밀번호가 일치합니다.";
      passwordMessage.className = "message success-message";
    } else {
      passwordMessage.textContent = "비밀번호가 일치하지 않습니다.";
      passwordMessage.className = "message failure-message";
    }
    checkFormValidity();
  }

  inputs.forEach((input) => {
    input.addEventListener("input", checkFormValidity);
  });

  passwordInput.addEventListener("input", checkPasswordMatch);
  confirmPasswordInput.addEventListener("input", checkPasswordMatch);

  // 중복 확인
  function checkDuplicate(field) {
    const value = document.getElementById(field).value;
    if (!value) {
      showMessage(field, "", "");
      return;
    }
    // 실제로는 서버에 중복 확인 요청을 보내야 합니다.
    setTimeout(() => {
      const isDuplicate = Math.random() < 0.5; // 50% 확률로 중복 여부 결정
      if (isDuplicate) {
        showMessage(
          field,
          "이미 사용 중입니다. 다른 값을 입력해주세요.",
          "error"
        );
      } else {
        showMessage(field, "사용 가능합니다.", "success");
      }
    }, 500);
  }

  function showMessage(field, message, type) {
    const messageElement = document.getElementById(`${field}-message`);
    messageElement.textContent = message;
    messageElement.className = `message ${type}-message`;
  }

  // document
  //   .getElementById("sendVerification")
  //   .addEventListener("click", function () {
  //     const phoneNumber = document.getElementById("phone").value;
  //     if (phoneNumber) {
  //       // 여기에 인증번호 전송 로직을 구현합니다.
  //       alert("인증번호가 전송되었습니다!");
  //     } else {
  //       alert("핸드폰 번호를 입력해주세요.");
  //     }
  //   });

  // document.getElementById("verifyCode").addEventListener("click", function () {
  //   const verificationCode = document.getElementById("verificationCode").value;
  //   if (verificationCode) {
  //     // 여기에 인증번호 확인 로직을 구현합니다.
  //     const isVerified = Math.random() < 0.8; // 80% 확률로 인증 성공
  //     if (isVerified) {
  //       alert("인증이 완료되었습니다.");
  //     } else {
  //       alert("인증번호가 일치하지 않습니다.");
  //     }
  //   } else {
  //     alert("인증번호를 입력해주세요.");
  //   }
  // });

  if (form) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault(); // 폼의 기본 제출 동작 방지

      const formData = new FormData(this);
      const createUserInput = Object.fromEntries(formData.entries());

      console.log("전송할 데이터:", createUserInput);

      try {
        const response = await axios.post(
          "http://localhost:3000/user/create",
          createUserInput,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log("서버 응답:", response.data);
        alert("사용자 정보가 성공적으로 등록되었습니다.");
      } catch (error) {
        console.error("에러 발생:", error);
        alert("등록 중 오류가 발생했습니다. 다시 시도해 주세요.");
      }
    });
  } else {
    console.error("Form not found");
  }
});
