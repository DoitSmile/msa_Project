document
  .querySelector('select[name="board"]')
  .addEventListener("change", function () {
    if (this.value) {
      this.style.color = "#333";
    } else {
      this.style.color = "#999";
    }
  });
