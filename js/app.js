import "./ui-form.js"

const btnToday = document.getElementById("btn-today");
const btnProgress = document.getElementById("btn-progress");
const viewToday = document.getElementById("view-today");
const viewProgress = document.getElementById("view-progress");

function showView(name) {
  if (name === "today") {
    viewToday.hidden = false;
    viewProgress.hidden = true;

    btnToday.classList.add("is-active");
    btnProgress.classList.remove("is-active");
  } else {
    viewToday.hidden = true;
    viewProgress.hidden = false;

    btnToday.classList.remove("is-active");
    btnProgress.classList.add("is-active");
  }
}

btnToday.addEventListener("click", function () {
  showView("today");
});

btnProgress.addEventListener("click", function () {
  showView("progress");
});