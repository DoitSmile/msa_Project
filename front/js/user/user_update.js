import { AuthService } from "/msa_Project/front/js/auth/auth.js";

document.addEventListener("DOMContentLoaded", function () {
  // DOM 요소들
  const saveChangesBtn = document.getElementById("save-changes");
  const changePasswordBtn = document.getElementById("change-password");
  const deleteBtn = document.getElementById("delete-account");
  const form = document.getElementById("account-form");
  const passwordInput = document.getElementById("password");
  const lastModifiedDate = document.getElementById("last-modified-date");
  const passwordChangeModal = document.getElementById("passwordChangeModal");
  const deleteAccountModal = document.getElementById("deleteAccountModal");
  const cropModal = document.getElementById("cropModal");

  let cropper;
  let croppedCanvas;

  // 이벤트 리스너
  saveChangesBtn.onclick = saveChanges;
  changePasswordBtn.onclick = () =>
    (passwordChangeModal.style.display = "block");
  deleteBtn.onclick = () => (deleteAccountModal.style.display = "block");

  document.getElementById("confirm-password-change").onclick = changePassword;
  document.getElementById("confirm-delete").onclick = deleteAccount;

  // 모달 외부 클릭 시 닫기
  window.onclick = function (event) {
    if (event.target == passwordChangeModal) {
      passwordChangeModal.style.display = "none";
    }
    if (event.target == deleteAccountModal) {
      deleteAccountModal.style.display = "none";
    }
    if (event.target == cropModal) {
      cropModal.style.display = "none";
      if (cropper) {
        cropper.destroy();
        cropper = null;
      }
    }
  };

  // 유틸리티 함수
  function showNotification(message) {
    alert(message);
  }

  function updateLastModifiedDate() {
    const now = new Date();
    lastModifiedDate.textContent = now.toISOString().split("T")[0];
  }

  // 현재 사용자 ID 가져오기
  async function getCurrentUserId() {
    try {
      const currentUser = await AuthService.getCurrentUserAsync();
      if (!currentUser || !currentUser.id) {
        throw new Error("사용자 정보를 찾을 수 없습니다.");
      }
      return currentUser.id;
    } catch (error) {
      console.error("사용자 ID 가져오기 오류:", error);
      throw new Error("인증에 실패했습니다. 다시 로그인해주세요.");
    }
  }

  // 현재 사용자 데이터 가져오기
  async function fetchUserData() {
    try {
      const currentUserId = await getCurrentUserId();
      const token = AuthService.getToken();
      if (!token) {
        throw new Error("인증 토큰이 없습니다. 다시 로그인해주세요.");
      }

      const response = await axios.get(
        `http://localhost:3000/user/fetch/${currentUserId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("서버 응답:", response.data);
      populateUserData(response.data);
    } catch (error) {
      console.error("사용자 데이터 가져오기 오류:", error);
      if (error.response && error.response.status === 401) {
        AuthService.logout();
        showNotification("인증이 만료되었습니다. 다시 로그인해주세요.");
        window.location.href = "/msa_Project/front/index.html";
      } else {
        showNotification(
          "사용자 데이터를 불러오는데 실패했습니다. 오류: " + error.message
        );
      }
    }
  }

  // 사용자 데이터로 폼 채우기
  function populateUserData(userData) {
    console.log("userData:", userData);
    document.getElementById("name").value = userData.name || "";
    document.getElementById("phone").value = userData.phone || "";
    document.getElementById("email").value = userData.email || "";

    const profilePic = document.getElementById("profile-pic");
    profilePic.src =
      userData.profilePictureUrl ||
      "/msa_Project/front/assets/default-profile-picture.jpg";
    profilePic.onerror = function () {
      this.src = "/msa_Project/front/assets/default-profile-picture.jpg";
    };

    lastModifiedDate.textContent = userData.lastModified || "해당 없음";
  }

  // 변경사항 저장
  async function saveChanges() {
    if (!AuthService.isAuthenticated()) {
      alert("로그인이 필요합니다.");
      window.location.href = "/msa_Project/front/index.html";
      return;
    }

    const formData = new FormData(form);

    if (!formData.get("password")) {
      showNotification("비밀번호를 입력해주세요.");
      return;
    }

    if (croppedCanvas) {
      const blob = await new Promise((resolve) =>
        croppedCanvas.toBlob(resolve, "image/jpeg")
      );
      formData.append("profilePicture", blob, "profile.jpg");
    }

    try {
      const currentUserId = await getCurrentUserId();
      const response = await axios.post(
        `http://localhost:3000/user/update/${currentUserId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${AuthService.getToken()}`,
          },
        }
      );

      console.log("서버 응답:", response.data);
      if (response.data.success) {
        updateLastModifiedDate();
        showNotification("계정 정보가 성공적으로 업데이트되었습니다.");
        passwordInput.value = "";
        if (response.data.profilePictureUrl) {
          document.getElementById("profile-pic").src =
            response.data.profilePictureUrl;
        }
      } else {
        showNotification(
          response.data.message || "업데이트에 실패했습니다. 다시 시도해주세요."
        );
      }
    } catch (error) {
      console.error("사용자 데이터 업데이트 오류:", error);
      if (error.response && error.response.status === 401) {
        AuthService.logout();
        showNotification("인증이 만료되었습니다. 다시 로그인해주세요.");
        window.location.href = "/msa_Project/front/index.html";
      } else {
        showNotification("업데이트 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    }
  }

  // 비밀번호 변경 및 계정 탈퇴 함수는 그대로 유지

  // 이미지 크롭 관련 코드
  document
    .getElementById("profile-pic-input")
    .addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          document.getElementById("cropImage").src = e.target.result;
          cropModal.style.display = "block";

          if (cropper) {
            cropper.destroy();
          }

          cropper = new Cropper(document.getElementById("cropImage"), {
            aspectRatio: 1,
            viewMode: 1,
            minCropBoxWidth: 150,
            minCropBoxHeight: 150,
          });
        };
        reader.readAsDataURL(file);
      }
    });

  document.getElementById("cropButton").addEventListener("click", function () {
    croppedCanvas = cropper.getCroppedCanvas({
      width: 150,
      height: 150,
    });

    document.getElementById("profile-pic").src = croppedCanvas.toDataURL();
    cropModal.style.display = "none";
    cropper.destroy();
    cropper = null;
  });

  document
    .getElementById("cancelCropButton")
    .addEventListener("click", function () {
      cropModal.style.display = "none";
      cropper.destroy();
      cropper = null;
    });

  // 비밀번호 변경
  async function changePassword() {
    if (!AuthService.isAuthenticated()) {
      alert("로그인이 필요합니다.");
      window.location.href = "/msa_Project/front/index.html";
      return;
    }

    const passwordChangeForm = document.getElementById("passwordChangeForm");
    const formData = new FormData(passwordChangeForm);
    const updatePasswordInput = Object.fromEntries(formData.entries());

    const { currentPassword, newPassword, confirmNewPassword } =
      updatePasswordInput;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      showNotification("모든 필드를 입력해주세요.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showNotification("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const currentUserId = await getCurrentUserId();
      const response = await axios.post(
        `http://localhost:3000/user/update/password/${currentUserId}`,
        updatePasswordInput,
        {
          headers: {
            Authorization: `Bearer ${AuthService.getToken()}`,
          },
        }
      );

      if (response.data.success) {
        updateLastModifiedDate();
        showNotification("비밀번호가 성공적으로 변경되었습니다.");
        passwordChangeModal.style.display = "none";
        passwordChangeForm.reset(); // 폼 초기화
      } else {
        showNotification(
          response.data.message ||
            "비밀번호 변경에 실패했습니다. 다시 시도해주세요."
        );
      }
    } catch (error) {
      console.error("비밀번호 변경 오류:", error);
      showNotification(
        error.response?.data?.message ||
          "비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요."
      );
    }
  }

  // 계정 탈퇴
  async function deleteAccount() {
    const deletePassword = document.getElementById("delete-password").value;

    try {
      const currentUserId = await getCurrentUserId();
      const response = await axios.post(
        `http://localhost:3000/user/delete/${currentUserId}`,
        {
          password: deletePassword,
        },
        {
          headers: {
            Authorization: `Bearer ${AuthService.getToken()}`,
          },
        }
      );

      if (response.data.success) {
        showNotification("계정이 성공적으로 삭제되었습니다.");
        deleteAccountModal.style.display = "none";
        AuthService.logout();
        window.location.href = "/msa_Project/front/index.html";
      } else {
        showNotification(
          response.data.message ||
            "계정 삭제에 실패했습니다. 다시 시도해주세요."
        );
      }
    } catch (error) {
      console.error("계정 삭제 오류:", error);
      showNotification("계정 삭제 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  }

  // 초기화
  fetchUserData();
});
