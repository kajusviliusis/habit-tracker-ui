import { setOnChange } from "./ui-form.js";
import { renderList } from "./ui-today.js";
import { renderProgress, setOnGridChange } from "./ui-progress.js";
import { addDemoData } from "./model.js";

const btnDemo = document.getElementById("btn-demo");
const demoStatus = document.getElementById("demo-status");

// Pavyzdiniu duomenu mygtukas iskart atnaujina dienos ir pazangos rodinius.
btnDemo.addEventListener("click", function () {
  const added = addDemoData();
  renderList();
  renderProgress();
  if (added > 0) {
    demoStatus.textContent = "Pavyzdiniai duomenys įkelti.";
  } else {
    demoStatus.textContent = "Pavyzdiniai duomenys jau įkelti.";
  }
});

// Forma pranesa apie pakeitimus, kad abu rodiniai liktu suderinti.
setOnChange(function () {
  renderList();
  renderProgress();
});
// Pazymetas savaites langelis taip pat atnaujina dienos sarasa.
setOnGridChange(renderList);

// Paleidus programa, parodome issaugota busena.
renderList();
renderProgress();
