function sendToken() {
  // 1. 입력한 휴대폰번호 가져오기
  const myphone = document.getElementById("myphone").value;
  console.log("나의 핸드폰번호: ", myphone);

  // 2. 해당 휴대폰번호로 인증번호API 요청하기
  axios
    .post("http://localhost:3000/auth/sendPhone", {
      phone_num: myphone,
    })
    .then((res) => {
      console.log(res);
      document.getElementById("status").innerText = res.data;
    });
}

function tokenCheck() {
  const input = document.getElementById("input").value;
  const myphone = document.getElementById("myphone").value;
  axios
    .post("http://localhost:3000/auth/checkPhone", {
      phone_num: myphone,
      auth_num: input,
    })
    .then((res) => {
      console.log(res);
      document.getElementById("status").innerText = res.data;
    });
}
