const saveChangesBtn = document.getElementById("save-changes");
const changePasswordBtn = document.getElementById("change-password");
const deleteBtn = document.getElementById("delete-account");
const form = document.getElementById("account-form");
const passwordInput = document.getElementById("password");
const lastModifiedDate = document.getElementById("last-modified-date");
const passwordChangeModal = document.getElementById("passwordChangeModal");
const deleteAccountModal = document.getElementById("deleteAccountModal");

saveChangesBtn.onclick = saveChanges;
changePasswordBtn.onclick = () => (passwordChangeModal.style.display = "block");
deleteBtn.onclick = () => (deleteAccountModal.style.display = "block");

document.getElementById("confirm-password-change").onclick = changePassword;
document.getElementById("confirm-delete").onclick = deleteAccount;

window.onclick = function (event) {
  if (event.target == passwordChangeModal) {
    passwordChangeModal.style.display = "none";
  }
  if (event.target == deleteAccountModal) {
    deleteAccountModal.style.display = "none";
  }
};

function showNotification(message) {
  alert(message);
}

function updateLastModifiedDate() {
  const now = new Date();
  lastModifiedDate.textContent = now.toISOString().split("T")[0];
}

document
  .getElementById("profile-pic-input")
  .addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById("profile-pic").src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

function saveChanges() {
  if (passwordInput.value === "correctpassword") {
    // 실제 구현에서는 서버에서 확인해야 합니다
    updateLastModifiedDate();
    showNotification("계정 정보가 성공적으로 업데이트되었습니다.");
    passwordInput.value = ""; // 비밀번호 입력 필드 초기화
  } else {
    showNotification("비밀번호가 일치하지 않습니다.");
  }
}

function changePassword() {
  const currentPassword = document.getElementById("current-password").value;
  const newPassword = document.getElementById("new-password").value;
  const confirmNewPassword = document.getElementById(
    "confirm-new-password"
  ).value;

  if (
    currentPassword === "correctpassword" &&
    newPassword === confirmNewPassword
  ) {
    updateLastModifiedDate();
    showNotification("비밀번호가 성공적으로 변경되었습니다.");
    passwordChangeModal.style.display = "none";
  } else if (currentPassword !== "correctpassword") {
    showNotification("현재 비밀번호가 일치하지 않습니다.");
  } else {
    showNotification("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
  }
}

function deleteAccount() {
  const deletePassword = document.getElementById("delete-password").value;

  if (deletePassword === "correctpassword") {
    showNotification("계정이 성공적으로 탈퇴되었습니다.");
    deleteAccountModal.style.display = "none";
    // 여기에 탈퇴 후 처리 로직을 추가해야 합니다 (예: 로그아웃, 메인 페이지로 이동 등)
  } else {
    showNotification("비밀번호가 일치하지 않습니다.");
  }
}
