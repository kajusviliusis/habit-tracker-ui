
import { createHabit, getHabits } from "./model.js";

const btnAdd = document.getElementById("btn-add");
const form = document.getElementById("habit-form");
const nameInput = document.getElementById("habit-name");
const nameCounter = document.getElementById("name-counter");
const typeTodo = document.getElementById("type-todo");
const typeNotTodo = document.getElementById("type-nottodo");
const dayButtons = document.querySelectorAll(".day-btn");
const formError = document.getElementById("form-error");
const btnSave = document.getElementById("btn-save");
const btnCancel = document.getElementById("btn-cancel");


let selectedDays = [];


function openForm() {
  resetForm();
  form.hidden = false;
  btnAdd.hidden = true;
  nameInput.focus();
}

function closeForm() {
  form.hidden = true;
  btnAdd.hidden = false;
}

function resetForm() {
  nameInput.value = "";
  updateCounter();

  typeTodo.checked = true;
  typeNotTodo.checked = false;

  selectedDays = [];
  for (let i = 0; i < dayButtons.length; i++) {
    dayButtons[i].classList.remove("is-selected");
  }

  formError.textContent = "";
}

function updateCounter() {
  nameCounter.textContent = nameInput.value.length + "/50";
}

function toggleDay(button) {
  const day = Number(button.getAttribute("data-day"));
  const index = selectedDays.indexOf(day);

  if (index === -1) {
    selectedDays.push(day);
    button.classList.add("is-selected");
  } else {
    selectedDays.splice(index, 1);
    button.classList.remove("is-selected");
  }
}

function getType() {
  if (typeTodo.checked) {
    return "todo";
  }
  if (typeNotTodo.checked) {
    return "nottodo";
  }
  return "";
}

function saveForm() {
  const result = createHabit(nameInput.value, getType(), selectedDays);

  if (result.ok) {
    closeForm();
    console.log("Įpročiai:", getHabits()); // laikinai, kol nėra sąrašo 
  } else {
    // Rodom klaidą
    formError.textContent = result.errors.name || result.errors.type || result.errors.days;
  }
}

btnAdd.addEventListener("click", openForm);
btnCancel.addEventListener("click", closeForm);
btnSave.addEventListener("click", saveForm);
nameInput.addEventListener("input", updateCounter);

for (let i = 0; i < dayButtons.length; i++) {
  dayButtons[i].addEventListener("click", function () {
    toggleDay(dayButtons[i]);
  });
}