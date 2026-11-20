import { setOnChange } from "./ui-form.js";
import { renderList } from "./ui-today.js";
import { renderProgress, setOnGridChange } from "./ui-progress.js";
import { addDemoData } from "./model.js";

const btnToday = document.getElementById("btn-today");
const btnProgress = document.getElementById("btn-progress");
const viewToday = document.getElementById("view-today");
const viewProgress = document.getElementById("view-progress");
const btnDemo = document.getElementById("btn-demo");
const demoStatus = document.getElementById("demo-status");

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

btnDemo.addEventListener("click", function () {
  const added = addDemoData();
  renderList();
  renderProgress();
  demoStatus.textContent = added > 0
    ? "Pavyzdiniai duomenys įkelti."
    : "Pavyzdiniai duomenys jau įkelti.";
});

setOnChange(function () {
  renderList();
  renderProgress();
});
setOnGridChange(renderList);

renderList();
renderProgress();
