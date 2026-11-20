import { setOnChange } from "./ui-form.js";
import { renderList } from "./ui-today.js";
import { renderProgress, setOnGridChange } from "./ui-progress.js";

const btnToday = document.getElementById("btn-today");
const btnProgress = document.getElementById("btn-progress");
const viewToday = document.getElementById("view-today");
const viewProgress = document.getElementById("view-progress");

function showView(name) {
  btnToday.setAttribute("aria-pressed", name === "today");
  btnProgress.setAttribute("aria-pressed", name === "progress");

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
  renderProgress();
  showView("progress");
});

setOnChange(function () {
  renderList();
  renderProgress();
});
setOnGridChange(renderList);

renderList();
renderProgress();
