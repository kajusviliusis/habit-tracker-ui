import { setOnChange } from "./ui-form.js";
import { renderList } from "./ui-today.js";
import { renderProgress, setOnGridChange } from "./ui-progress.js";
import { addDemoData } from "./model.js";

const btnDemo = document.getElementById("btn-demo");
const demoStatus = document.getElementById("demo-status");

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
