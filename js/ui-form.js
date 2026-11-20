
import { createHabit, updateHabit, deleteHabit, getHabit, getHabits, validateHabit, hasErrors } from "./model.js";

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
const btnWeekdays = document.getElementById("btn-weekdays");
const btnEveryday = document.getElementById("btn-everyday");
const nameError = document.getElementById("name-error");
const daysError = document.getElementById("days-error");
const formTitle = document.getElementById("form-title");
const deleteModal = document.getElementById("delete-modal");
const deleteName = document.getElementById("delete-name");
const btnDeleteCancel = document.getElementById("btn-delete-cancel");
const btnDeleteConfirm = document.getElementById("btn-delete-confirm");


let selectedDays = [];
let editingId = null;
let deletingId = null;
let deleteTrigger = null;
let nameTouched = false;
let daysTouched = false;

let onChange = function () {};

export function setOnChange(fn) {
  onChange = fn;
}

function openForm() {
  resetForm();
  editingId = null;
  formTitle.textContent = "Naujas įprotis";
  showForm();
}

export function openEditForm(id) {
  const habit = getHabit(id);
  if (habit === null) {
    return;
  }

  resetForm();
  editingId = id;
  formTitle.textContent = "Redaguoti įprotį";

  nameInput.value = habit.name;
  updateCounter();

  typeTodo.checked = habit.type === "todo";
  typeNotTodo.checked = habit.type === "nottodo";

  setDays(habit.days);

  showForm();
}

function showForm() {
  form.hidden = false;
  btnAdd.hidden = true;
  nameInput.focus();
}

function closeForm() {
  form.hidden = true;
  btnAdd.hidden = false;
  editingId = null;
  btnAdd.focus();
}

function resetForm() {
  nameTouched = false;
  daysTouched = false;

  nameInput.value = "";
  updateCounter();

  typeTodo.checked = true;
  typeNotTodo.checked = false;

  setDays([]);

  formError.textContent = "";
}

function updateCounter() {
  nameCounter.textContent = nameInput.value.length + "/50";
}

function toggleDay(button) {
  daysTouched = true;
  const day = Number(button.getAttribute("data-day"));
  const index = selectedDays.indexOf(day);

  if (index === -1) {
    selectedDays.push(day);
  } else {
    selectedDays.splice(index, 1);
  }

  updateDayButtons();
}

function setDays(days) {
  selectedDays = [];
  for (let i = 0; i < days.length; i++) {
    selectedDays.push(days[i]);
  }
  updateDayButtons();
}

function updateDayButtons() {
  for (let i = 0; i < dayButtons.length; i++) {
    const day = Number(dayButtons[i].getAttribute("data-day"));

    if (selectedDays.indexOf(day) !== -1) {
      dayButtons[i].classList.add("is-selected");
      dayButtons[i].setAttribute("aria-pressed", true);
    } else {
      dayButtons[i].classList.remove("is-selected");
      dayButtons[i].setAttribute("aria-pressed", false);
    }
  }
  updateQuickButtons();
  validateForm();
}

function updateQuickButtons() {
  const hasSaturday = selectedDays.indexOf(6) !== -1;
  const hasSunday = selectedDays.indexOf(0) !== -1;

  const isEveryday = selectedDays.length === 7;
  const isWeekdays = selectedDays.length === 5 && !hasSaturday && !hasSunday;
  btnEveryday.setAttribute("aria-pressed", isEveryday);
  btnWeekdays.setAttribute("aria-pressed", isWeekdays);

  if (isEveryday) {
    btnEveryday.classList.add("is-selected");
  } else {
    btnEveryday.classList.remove("is-selected");
  }

  if (isWeekdays) {
    btnWeekdays.classList.add("is-selected");
  } else {
    btnWeekdays.classList.remove("is-selected");
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

function validateForm() {
  const errors = validateHabit(nameInput.value, getType(), selectedDays);

  btnSave.disabled = hasErrors(errors);
  nameInput.setAttribute("aria-invalid", Boolean(nameTouched && errors.name));

  if (nameTouched && errors.name) {
    nameError.textContent = errors.name;
  } else {
    nameError.textContent = "";
  }

  if (daysTouched && errors.days) {
    daysError.textContent = errors.days;
  } else {
    daysError.textContent = "";
  }
}

function saveForm() {
  let result;
   if (editingId === null) {
    result = createHabit(nameInput.value, getType(), selectedDays);
  } else {
    result = updateHabit(editingId, nameInput.value, getType(), selectedDays);
  }
  
  if (result.ok) {
    closeForm();
    onChange();
  } else {
    nameTouched = true;
    daysTouched = true;
    validateForm();
  }
}

export function openDeleteConfirm(id, triggerButton) {
  const habit = getHabit(id);
  if (habit === null) {
    return;
  }

  deletingId = id;
  deleteTrigger = triggerButton;
  deleteName.textContent = habit.name;
  deleteModal.hidden = false;
  btnDeleteCancel.focus();
}

function closeDeleteConfirm() {
  deleteModal.hidden = true;
  deletingId = null;
  if (deleteTrigger) {
    deleteTrigger.focus();
  }
  deleteTrigger = null;
}


function confirmDelete() {
  deleteHabit(deletingId);
  closeDeleteConfirm();
  onChange();
  if (btnAdd.hidden) {
    btnCancel.focus();
  } else {
    btnAdd.focus();
  }
}

btnAdd.addEventListener("click", openForm);
btnCancel.addEventListener("click", closeForm);
btnSave.addEventListener("click", saveForm);
btnWeekdays.addEventListener("click", function () {
  daysTouched = true;
  setDays([1, 2, 3, 4, 5]);
});
btnEveryday.addEventListener("click", function () {
  daysTouched = true;
  setDays([0, 1, 2, 3, 4, 5, 6]);
});

nameInput.addEventListener("input", function () {
  nameTouched = true;
  updateCounter();
  validateForm();
});

nameInput.addEventListener("blur", function () {
  nameTouched = true;
  validateForm();
});

typeTodo.addEventListener("change", validateForm);
typeNotTodo.addEventListener("change", validateForm);

btnDeleteCancel.addEventListener("click", closeDeleteConfirm);
btnDeleteConfirm.addEventListener("click", confirmDelete);

deleteModal.addEventListener("click", function (event) {
  if (event.target === deleteModal) {
    closeDeleteConfirm();
  }
});

deleteModal.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    event.preventDefault();
    closeDeleteConfirm();
  } else if (event.key === "Tab") {
    if (event.shiftKey && document.activeElement === btnDeleteCancel) {
      event.preventDefault();
      btnDeleteConfirm.focus();
    } else if (!event.shiftKey && document.activeElement === btnDeleteConfirm) {
      event.preventDefault();
      btnDeleteCancel.focus();
    }
  }
});

for (let i = 0; i < dayButtons.length; i++) {
  dayButtons[i].addEventListener("click", function () {
    toggleDay(dayButtons[i]);
  });
}
