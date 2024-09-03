// 1. 아이디 입력창 정보 가져오기
let elInputUsername = document.querySelector("#username"); // input#username
// 2. 성공 메시지 정보 가져오기
let elSuccessMessage = document.querySelector(".success-message"); // div.success-message.hide
// 3. 실패 메시지 정보 가져오기 (글자수 제한 4~12글자)
let elFailureMessage = document.querySelector(".failure-message"); // div.failure-message.hide
// 4. 실패 메시지2 정보 가져오기 (영어 또는 숫자)
let elFailureMessageTwo = document.querySelector(".failure-message2"); // div.failure-message2.hide

// 아이디 글자 수 제한
function idLength(value) {
  return value.length >= 4 && value.length <= 12;
}

// 아이디는 영어 또는 숫자만 가능
function onlyNumberAndEnglish(str) {
  return /^[A-Za-z0-9][A-Za-z0-9]*$/.test(str);
}

// 아이디 이벤트
elInputUsername.onkeyup = function () {
  // 값을 입력한 경우
  if (elInputUsername.value.length !== 0) {
    // 영어 또는 숫자 외의 값을 입력했을 경우
    if (onlyNumberAndEnglish(elInputUsername.value) === false) {
      elSuccessMessage.classList.add("hide");
      elFailureMessage.classList.add("hide");
      elFailureMessageTwo.classList.remove("hide"); // 영어 또는 숫자만 가능합니다
    }
    // 글자 수가 4~12글자가 아닐 경우
    else if (idLength(elInputUsername.value) === false) {
      elSuccessMessage.classList.add("hide"); // 성공 메시지가 가려져야 함
      elFailureMessage.classList.remove("hide"); // 아이디는 4~12글자이어야 합니다
      elFailureMessageTwo.classList.add("hide"); // 실패 메시지2가 가려져야 함
    }
    // 조건을 모두 만족할 경우
    else if (
      idLength(elInputUsername.value) ||
      onlyNumberAndEnglish(elInputUsername.value)
    ) {
      elSuccessMessage.classList.remove("hide"); // 사용할 수 있는 아이디입니다
      elFailureMessage.classList.add("hide"); // 실패 메시지가 가려져야 함
      elFailureMessageTwo.classList.add("hide"); // 실패 메시지2가 가려져야 함
    }
  }
  // 값을 입력하지 않은 경우 (지웠을 때)
  // 모든 메시지를 가린다.
  else {
    elSuccessMessage.classList.add("hide");
    elFailureMessage.classList.add("hide");
    elFailureMessageTwo.classList.add("hide");
  }
};
