export class BannerSlider {
  constructor() {
    this.currentSlide = 0;
    this.slides = document.querySelector(".banner-slides");
    this.images = document.querySelectorAll(".banner-image");
    this.dotsContainer = document.querySelector(".banner-dots");

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
    setInterval(() => this.nextSlide(), 3000); // 3초마다 슬라이드 변경
  }
}
