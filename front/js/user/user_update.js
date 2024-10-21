import { AuthService } from "../auth/auth.js";

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
  const nameInput = document.getElementById("name");
  const nicknameMessage = document.getElementById("nickname-message");
  const phoneInput = document.getElementById("phone");
  const emailInput = document.getElementById("email");

  if (phoneInput) phoneInput.disabled = true;
  if (emailInput) emailInput.disabled = true;

  let cropper;
  let croppedCanvas;
  let originalName = "";
  let isNameAvailable = true;
  let isNameChanged = false;

  // 이벤트 리스너
  if (saveChangesBtn) saveChangesBtn.onclick = saveChanges;
  if (changePasswordBtn)
    changePasswordBtn.onclick = () =>
      (passwordChangeModal.style.display = "block");
  if (deleteBtn)
    deleteBtn.onclick = () => (deleteAccountModal.style.display = "block");

  if (document.getElementById("confirm-password-change")) {
    document.getElementById("confirm-password-change").onclick = changePassword;
  }
  if (document.getElementById("confirm-delete")) {
    document.getElementById("confirm-delete").onclick = deleteAccount;
  }

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
    if (lastModifiedDate) {
      const now = new Date();
      lastModifiedDate.textContent = now.toISOString().split("T")[0];
    }
  }

  function showMessage(element, message, isSuccess = false) {
    if (element) {
      element.textContent = message;
      element.classList.remove("hide");
      if (isSuccess) {
        element.classList.add("success-message");
        element.classList.remove("failure-message");
      } else {
        element.classList.add("failure-message");
        element.classList.remove("success-message");
      }
    } else {
      console.warn("Message element not found:", message);
    }
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

      const response = await axios.get(`/api/user/fetch/${currentUserId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("서버 응답:", response.data);
      populateUserData(response.data);
    } catch (error) {
      console.error("사용자 데이터 가져오기 오류:", error);
      if (error.response && error.response.status === 401) {
        AuthService.logout();
        showNotification("인증이 만료되었습니다. 다시 로그인해주세요.");
        window.location.href = "../../index.html";
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
    nameInput.value = userData.name || "";
    originalName = userData.name || "";
    document.getElementById("phone").value = userData.phone || "";
    document.getElementById("email").value = userData.email || "";

    const profilePic = document.getElementById("profile-pic");
    profilePic.src =
      userData.profilePictureUrl || "../../assets/default-profile-picture.jpg";
    profilePic.onerror = function () {
      this.src = "../../assets/default-profile-picture.jpg";
    };

    lastModifiedDate.textContent = userData.updatedAt || "해당 없음";
  }

  // 닉네임 중복 확인 함수
  async function checkNameAvailability(name) {
    try {
      const response = await axios.post("/api/user/check-name", { name });
      return response.data.available;
    } catch (error) {
      console.error("닉네임 중복 확인 중 오류 발생:", error);
      return false;
    }
  }

  // 닉네임 입력 필드에 이벤트 리스너 추가
  if (nameInput) {
    nameInput.addEventListener("input", function () {
      const newName = this.value.trim();
      isNameChanged = newName !== originalName;
      if (!isNameChanged) {
        showMessage(nicknameMessage, "현재 사용 중인 닉네임입니다.", true);
        isNameAvailable = true; // 현재 닉네임은 사용 가능
      }
    });

    nameInput.addEventListener("blur", async function () {
      const newName = this.value.trim();
      if (newName === originalName) {
        showMessage(nicknameMessage, "현재 사용 중인 닉네임입니다.", true);
        isNameAvailable = true;
        isNameChanged = false;
        return;
      }

      if (newName.length === 0) {
        showMessage(nicknameMessage, "닉네임을 입력해주세요.");
        isNameAvailable = false;
        return;
      }

      isNameAvailable = await checkNameAvailability(newName);
      isNameChanged = true;
      if (isNameAvailable) {
        showMessage(nicknameMessage, "사용 가능한 닉네임입니다.", true);
      } else {
        showMessage(nicknameMessage, "이미 사용 중인 닉네임입니다.");
      }
    });
  } else {
    console.warn("Name input element not found");
  }

  // 변경사항 저장
  async function saveChanges() {
    if (!AuthService.isAuthenticated()) {
      alert("로그인이 필요합니다.");
      window.location.href = "../../index.html";
      return;
    }

    const formData = new FormData(form);

    if (!formData.get("password")) {
      showNotification("비밀번호를 입력해주세요.");
      return;
    }

    const newName = formData.get("name");

    // 닉네임이 변경되었고, 사용 불가능한 경우에만 저장을 중단
    if (isNameChanged && !isNameAvailable) {
      showNotification(
        "사용할 수 없는 닉네임입니다. 다른 닉네임을 선택해주세요."
      );
      return;
    }

    if (newName === "") {
      showNotification("닉네임을 입력해주세요.");
      return;
    }

    let isAnyChange = isNameChanged;

    if (croppedCanvas) {
      const blob = await new Promise((resolve) =>
        croppedCanvas.toBlob(resolve, "image/jpeg")
      );
      formData.append("profilePicture", blob, "profile.jpg");
      isAnyChange = true;
    }

    // 변경사항이 없는 경우
    if (!isAnyChange) {
      showNotification("변경된 내용이 없습니다.");
      return;
    }
    // 전화번호와 이메일은 FormData에서 제거
    formData.delete("phone");
    formData.delete("email");
    try {
      const currentUserId = await getCurrentUserId();
      const response = await axios.post(
        `/api/user/update/${currentUserId}`,
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
        if (isNameChanged) {
          originalName = newName;
        }
        isNameChanged = false;
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
        window.location.href = "../../index.html";
      } else {
        showNotification("업데이트 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    }
  }
  // 비밀번호 변경
  async function changePassword() {
    if (!AuthService.isAuthenticated()) {
      alert("로그인이 필요합니다.");
      window.location.href = "../../index.html";
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
        `/api/user/update/password/${currentUserId}`,
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
        `/api/user/delete/${currentUserId}`,
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
        window.location.href = "../../index.html";
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

  // 이미지 크롭 관련 코드
  const profilePicInput = document.getElementById("profile-pic-input");
  if (profilePicInput) {
    profilePicInput.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const cropImage = document.getElementById("cropImage");
          if (cropImage) {
            cropImage.src = e.target.result;
            cropModal.style.display = "block";

            if (cropper) {
              cropper.destroy();
            }

            cropper = new Cropper(cropImage, {
              aspectRatio: 1,
              viewMode: 1,
              minCropBoxWidth: 150,
              minCropBoxHeight: 150,
            });
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const cropButton = document.getElementById("cropButton");
  if (cropButton) {
    cropButton.addEventListener("click", function () {
      croppedCanvas = cropper.getCroppedCanvas({
        width: 150,
        height: 150,
      });

      const profilePic = document.getElementById("profile-pic");
      if (profilePic) {
        profilePic.src = croppedCanvas.toDataURL();
      }
      cropModal.style.display = "none";
      cropper.destroy();
      cropper = null;
    });
  }

  const cancelCropButton = document.getElementById("cancelCropButton");
  if (cancelCropButton) {
    cancelCropButton.addEventListener("click", function () {
      cropModal.style.display = "none";
      cropper.destroy();
      cropper = null;
    });
  }

  // 초기화
  fetchUserData();
});
