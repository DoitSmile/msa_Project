document.addEventListener("DOMContentLoaded", function () {
  const sendVerificationButton = document.getElementById("sendVerification");
  const verifyCodeButton = document.getElementById("verifyCode");
  const timerElement = document.getElementById("timer");
  const statusElement = document.createElement("span");
  statusElement.id = "verification-status";
  timerElement.parentNode.insertBefore(statusElement, timerElement.nextSibling);

  let timer;
  let remainingTime = 300; // 5 minutes in seconds
  window.isPhoneVerified = false; // 전역 변수로 설정
  let resendTimeout;

  function startTimer() {
    clearInterval(timer);
    remainingTime = 300;
    timerElement.style.display = "inline-block";
    statusElement.style.display = "inline-block";
    updateTimerDisplay();
    sendVerificationButton.disabled = true;
    verifyCodeButton.disabled = false;
    timer = setInterval(() => {
      remainingTime--;
      updateTimerDisplay();
      if (remainingTime <= 0) {
        clearInterval(timer);
        timerElement.textContent = "인증 시간 만료";
        if (!window.isPhoneVerified) {
          sendVerificationButton.disabled = false;
        }
        verifyCodeButton.disabled = true;
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    timerElement.textContent = `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  function updateStatus(message, isSuccess) {
    statusElement.textContent = message;
    statusElement.style.color = isSuccess ? "green" : "red";
  }

  function enableResend() {
    if (!window.isPhoneVerified) {
      sendVerificationButton.disabled = false;
      updateStatus("인증번호를 다시 전송할 수 있습니다.", true);
    }
  }

  function startResendTimer() {
    clearTimeout(resendTimeout);
    resendTimeout = setTimeout(enableResend, 300000); // 5분 = 300,000 밀리초
  }

  if (sendVerificationButton) {
    sendVerificationButton.addEventListener("click", function () {
      const phone = document.getElementById("phone").value;
      axios
        .post("http://localhost:3000/user/sendPhone", {
          phone_num: phone,
        })
        .then((res) => {
          updateStatus("인증번호 전송됨", true);
          startTimer();
          startResendTimer();
        })
        .catch((error) => {
          updateStatus("전송 실패", false);
        });
    });
  }

  if (verifyCodeButton) {
    verifyCodeButton.addEventListener("click", function () {
      const phone = document.getElementById("phone").value;
      const verificationCode =
        document.getElementById("verificationCode").value;
      axios
        .post("http://localhost:3000/user/checkPhone", {
          phone_num: phone,
          auth_num: verificationCode,
        })
        .then((res) => {
          if (res.data === "인증이 완료되었습니다.") {
            updateStatus("인증이 완료되었습니다.", true);
            clearInterval(timer);
            clearTimeout(resendTimeout);
            timerElement.style.display = "none";
            verifyCodeButton.disabled = true;
            sendVerificationButton.disabled = true;
            window.isPhoneVerified = true;
            if (typeof window.checkFormValidity === "function") {
              window.checkFormValidity();
            }
          } else {
            updateStatus("인증 실패", false);
          }
        })
        .catch((error) => {
          updateStatus("인증 실패", false);
        });
    });
  }
});
