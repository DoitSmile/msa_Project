// 1. 비밀번호 입력창 정보 가져오기
let elInputPassword = document.querySelector("#password"); // input#password
// 2. 비밀번호 확인 입력창 정보 가져오기
let elInputPasswordRetype = document.querySelector("#password-retype"); // input#password-retype
// 3. 실패 메시지 정보 가져오기 (비밀번호 불일치)
let elMismatchMessage = document.querySelector(".mismatch-message"); // div.mismatch-message.hide
// 4. 실패 메시지 정보 가져오기 (8글자 이상, 영문, 숫자, 특수문자 미사용)
let elStrongPasswordMessage = document.querySelector(".strongPassword-message"); // div.strongPassword-message.hide
// 비밀번호는 8글자이상,영문,숫자,특수문자 사용

function strongPassword(str) {
  return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(
    str
  );
}

// 확인비밀번호와 비밀번호 일치
function isMatch(password1, password2) {
  return password1 === password2;
}
// 비밀번호 이벤트
elInputPassword.onkeyup = function () {
  // console.log(elInputPassword.value);
  // 값을 입력한 경우
  if (elInputPassword.value.length !== 0) {
    if (strongPassword(elInputPassword.value)) {
      elStrongPasswordMessage.classList.add("hide"); // 실패 메시지가 가려져야 함
    } else {
      elStrongPasswordMessage.classList.remove("hide"); // 실패 메시지가 보여야 함
    }
  }
  // 값을 입력하지 않은 경우 (지웠을 때)
  // 모든 메시지를 가린다.
  else {
    elStrongPasswordMessage.classList.add("hide");
  }
};

//비밀번호 확인 이벤트 (비밀번호와 비밀번호 확인 일치)
elInputPasswordRetype.onkeyup = function () {
  // console.log(elInputPasswordRetype.value);
  if (elInputPasswordRetype.value.length !== 0) {
    if (isMatch(elInputPassword.value, elInputPasswordRetype.value)) {
      elMismatchMessage.classList.add("hide"); // 실패 메시지가 가려져야 함
    } else {
      elMismatchMessage.classList.remove("hide"); // 실패 메시지가 보여야 함
    }
  } else {
    elMismatchMessage.classList.add("hide"); // 실패 메시지가 가려져야 함
  }
};
