
import { createHabit, updateHabit, deleteHabit, getHabit, validateHabit, hasErrors } from "./model.js";

const btnAdd = document.getElementById("btn-add");
const formBackdrop = document.getElementById("form-backdrop");
const form = document.getElementById("habit-form");
const btnCloseForm = document.getElementById("btn-close-form");
const nameInput = document.getElementById("habit-name");
const nameCounter = document.getElementById("name-counter");
const typeTodo = document.getElementById("type-todo");
const typeNotTodo = document.getElementById("type-nottodo");
const dayButtons = document.querySelectorAll(".day-btn");
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
const toast = document.getElementById("toast");

let selectedDays = [];
let editingId = null;
let formTrigger = null;
let deletingId = null;
let deleteTrigger = null;
let nameTouched = false;
let daysTouched = false;
let toastTimer;

let onChange = function () {};

// Po formos pakeitimo pagrindinis modulis atnaujina abu rodinius.
export function setOnChange(fn) {
  onChange = fn;
}

// Trumpam parodome pranesima apie issaugota arba istrinta iproti.
function showToast(message) {
  clearTimeout(toastTimer);
  toast.hidden = false;
  toast.textContent = message;
  toastTimer = setTimeout(function () {
    toast.hidden = true;
  }, 2500);
}

// Naujo iprocio forma visada atidaroma su tusciomis reiksmemis.
function openForm() {
  resetForm();
  editingId = null;
  formTitle.textContent = "Naujas įprotis";
  showForm(btnAdd);
}

// Redagavimo forma uzpildoma esamais iprocio nustatymais.
export function openEditForm(id, triggerButton) {
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

  showForm(triggerButton);
}

// Atidarome sonini skydeli ir perkeliame i ji klaviaturos fokusa.
function showForm(triggerButton) {
  formTrigger = triggerButton;
  formBackdrop.hidden = false;
  document.body.classList.add("has-dialog");
  nameInput.focus();
}

// Uzdare skydeli, graziname fokusa i ji atidariusi mygtuka.
function closeForm(restoreFocus = true) {
  formBackdrop.hidden = true;
  document.body.classList.remove("has-dialog");
  editingId = null;
  if (restoreFocus) {
    if (formTrigger && formTrigger.isConnected) {
      formTrigger.focus();
    } else {
      btnAdd.focus();
    }
  }
  formTrigger = null;
}

// Pries kuriant kita iproti isvalome laukus ir klaidu rodymo busena.
function resetForm() {
  nameTouched = false;
  daysTouched = false;

  nameInput.value = "";
  updateCounter();

  typeTodo.checked = true;
  typeNotTodo.checked = false;

  setDays([]);
}

function updateCounter() {
  nameCounter.textContent = nameInput.value.length + "/50";
}

// Paspaudus diena, pridedame ja arba pasaliname is tvarkarascio.
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

// Nustatome pasirinktas dienas neperrasydami iprocio saugomo masyvo.
function setDays(days) {
  selectedDays = [];
  for (let i = 0; i < days.length; i++) {
    selectedDays.push(days[i]);
  }
  updateDayButtons();
}

// Atnaujiname dienu mygtuku vaizda ir ju pasiekiamumo busena.
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

// Greitieji pasirinkimai pazymimi tik kai tiksliai atitinka dienu rinkini.
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

// Tikriname forma ir klaidas rodome tik po atitinkamo lauko naudojimo.
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

// Issaugome nauja arba redaguota iproti ir atnaujiname rodinius.
function saveForm() {
  const savedId = editingId;
  let result;
  if (editingId === null) {
    result = createHabit(nameInput.value, getType(), selectedDays);
  } else {
    result = updateHabit(editingId, nameInput.value, getType(), selectedDays);
  }

  if (result.ok) {
    closeForm(false);
    onChange();
    // Po perpiesto saraso senasis meniu mygtukas jau nebeegzistuoja.
    const savedMenu = savedId === null ? null : document.getElementById("menu-" + savedId);
    if (savedMenu) {
      savedMenu.focus();
    } else {
      btnAdd.focus();
    }
    showToast("Išsaugota");
  } else {
    nameTouched = true;
    daysTouched = true;
    validateForm();
  }
}

// Pries trinima parodome iprocio pavadinima patvirtinimo dialoge.
export function openDeleteConfirm(id, triggerButton) {
  const habit = getHabit(id);
  if (habit === null) {
    return;
  }

  deletingId = id;
  deleteTrigger = triggerButton;
  deleteName.textContent = habit.name;
  deleteModal.hidden = false;
  document.body.classList.add("has-dialog");
  btnDeleteCancel.focus();
}

// Uzdarius patvirtinima, griztame i ji atidariusi valdikli.
function closeDeleteConfirm(restoreFocus = true) {
  deleteModal.hidden = true;
  document.body.classList.remove("has-dialog");
  deletingId = null;
  if (restoreFocus && deleteTrigger && deleteTrigger.isConnected) {
    deleteTrigger.focus();
  }
  deleteTrigger = null;
}

// Tik patvirtinus triname iproti kartu su jo istorija.
function confirmDelete() {
  deleteHabit(deletingId);
  closeDeleteConfirm(false);
  onChange();
  btnAdd.focus();
  showToast("Įprotis pašalintas");
}

// Sujungiame formos mygtukus, fono paspaudima ir klaviaturos valdyma.
btnAdd.addEventListener("click", openForm);
btnCloseForm.addEventListener("click", function () { closeForm(); });
btnCancel.addEventListener("click", function () { closeForm(); });
btnSave.addEventListener("click", saveForm);
formBackdrop.addEventListener("click", function (event) {
  if (event.target === formBackdrop) {
    closeForm();
  }
});

formBackdrop.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    event.preventDefault();
    closeForm();
  } else if (event.key === "Tab") {
    // Fokusas lieka atidarytame dialoge, kol jis uzdaromas.
    const focusable = form.querySelectorAll("button:not([disabled]), input:not([disabled])");
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

// Greitieji pasirinkimai naudoja ta pati dienu mygtuku atnaujinima.
btnWeekdays.addEventListener("click", function () {
  daysTouched = true;
  setDays([1, 2, 3, 4, 5]);
});
btnEveryday.addEventListener("click", function () {
  daysTouched = true;
  setDays([0, 1, 2, 3, 4, 5, 6]);
});

// Kiekvienas ivesties pakeitimas atnaujina skaitikli ir saugojimo busena.
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

// Trinimo dialogas uzdaromas mygtuku, fono paspaudimu arba Escape klavisu.
btnDeleteCancel.addEventListener("click", function () { closeDeleteConfirm(); });
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
    // Tab perjungia tik tarp dvieju patvirtinimo dialogo mygtuku.
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
