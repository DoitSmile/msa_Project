const categoryBtns = document.querySelectorAll(".category-btn");

categoryBtns.forEach((btn) => {
  btn.addEventListener("click", function () {
    const content = this.nextElementSibling;
    closeAllDropdowns();
    content.classList.toggle("show");
  });
});

function closeAllDropdowns() {
  const dropdowns = document.querySelectorAll(".category-content");
  dropdowns.forEach((dropdown) => {
    dropdown.classList.remove("show");
  });
}

window.onclick = function (event) {
  if (!event.target.matches(".category-btn")) {
    closeAllDropdowns();
  }
};
