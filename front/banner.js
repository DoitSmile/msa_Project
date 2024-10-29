export class BannerSlider {
  constructor() {
    this.currentSlide = 0;
    this.slides = document.querySelector(".banner-slides");
    this.images = document.querySelectorAll(".banner-image");
    this.dotsContainer = document.querySelector(".banner-dots");

    if (!this.slides || !this.images.length || !this.dotsContainer) {
      console.log("Banner elements not found");
      return;
    }

    this.initialize();
  }

  initialize() {
    // 도트 생성
    this.images.forEach((_, index) => {
      const dot = document.createElement("div");
      dot.className = `banner-dot ${index === 0 ? "active" : ""}`;
      dot.addEventListener("click", () => this.goToSlide(index));
      this.dotsContainer.appendChild(dot);
    });

    // 이미지 클릭 이벤트 추가
    this.images.forEach((image) => {
      image.style.cursor = "pointer"; // 커서 스타일 변경
      image.addEventListener("click", () => {
        alert("준비중인 서비스입니다.");
      });
    });

    // 자동 슬라이드 시작
    this.startAutoSlide();
  }

  goToSlide(index) {
    this.currentSlide = index;
    this.slides.style.transform = `translateX(-${index * 100}%)`;

    // 도트 업데이트
    document.querySelectorAll(".banner-dot").forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });
  }

  nextSlide() {
    const next = (this.currentSlide + 1) % this.images.length;
    this.goToSlide(next);
  }

  startAutoSlide() {
    setInterval(() => this.nextSlide(), 3000);
  }
}
