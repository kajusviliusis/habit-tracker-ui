// "Šiandien" rodinio sąrašas (T14)

import { getHabits, getHabitsForDate } from "./model.js";
import { WEEKDAYS_SHORT, today, addDays, toKey, formatLong } from "./dates.js";
import { openEditForm, openDeleteConfirm } from "./ui-form.js";

const emptyState = document.getElementById("empty-state");
const todoGroup = document.getElementById("todo-group");
const todoList = document.getElementById("todo-list");
const nottodoGroup = document.getElementById("nottodo-group");
const nottodoList = document.getElementById("nottodo-list");
const dateLabel = document.getElementById("date-label");
const btnPrevDay = document.getElementById("btn-prev-day");
const btnNextDay = document.getElementById("btn-next-day");
const btnGoToday = document.getElementById("btn-go-today");

let selectedDate = today();

export function getSelectedDate() {
    return selectedDate;
}

function formatDays(days) {
    if (days.length === 7) {
        return "Kasdien";
    }

    const hasSaturday = days.indexOf(6) !== -1;
    const hasSunday = days.indexOf(0) !== -1;
    if (days.length === 5 && !hasSaturday && !hasSunday) {
        return "Darbo dienomis";
    }

    const order = [1, 2, 3, 4, 5, 6, 0];
    const names = [];
    for (let i = 0; i < order.length; i++) {
        if (days.indexOf(order[i]) !== -1) {
            names.push(WEEKDAYS_SHORT[order[i]]);
        }
    }
    return names.join(", ");
}

function createHabitCard(habit) {
    const card = document.createElement("li");
    card.className = "habit-card " + habit.type;

    const icon = document.createElement("span");
    icon.className = "habit-icon";
    if (habit.type === "todo") {
        icon.textContent = "◎";
    } else {
        icon.textContent = "⊘";
    }

    const info = document.createElement("div");
    info.className = "habit-info";

    const name = document.createElement("div");
    name.className = "habit-name";
    name.textContent = habit.name;

    const days = document.createElement("div");
    days.className = "habit-days";
    days.textContent = formatDays(habit.days);

    info.appendChild(name);
    info.appendChild(days);

    const actions = document.createElement("div");
    actions.className = "habit-actions";

    const btnEdit = document.createElement("button");
    btnEdit.type = "button";
    btnEdit.className = "btn-small";
    btnEdit.textContent = "Redaguoti";
    btnEdit.addEventListener("click", function () {
        openEditForm(habit.id);
    });

    const btnDelete = document.createElement("button");
    btnDelete.type = "button";
    btnDelete.className = "btn-small";
    btnDelete.textContent = "Šalinti";
    btnDelete.addEventListener("click", function () {
        openDeleteConfirm(habit.id);
    });

    actions.appendChild(btnEdit);
    actions.appendChild(btnDelete);

    card.appendChild(icon);
    card.appendChild(info);
    card.appendChild(actions);

    return card;
}

function renderDate() {
    dateLabel.textContent = formatLong(selectedDate);

    const isToday = toKey(selectedDate) === toKey(today());
    btnGoToday.hidden = isToday;
}

function changeDay(n) {
    selectedDate = addDays(selectedDate, n);
    renderList();
}

function goToday() {
    selectedDate = today();
    renderList();
}

export function renderList() {
    renderDate();
    const habits = getHabitsForDate(selectedDate);

    todoList.innerHTML = "";
    nottodoList.innerHTML = "";

    let todoCount = 0;
    let nottodoCount = 0;

    for (let i = 0; i < habits.length; i++) {
        const card = createHabitCard(habits[i]);

        if (habits[i].type === "todo") {
            todoList.appendChild(card);
            todoCount++;
        } else {
            nottodoList.appendChild(card);
            nottodoCount++;
        }
    }

    todoGroup.hidden = todoCount === 0;
    nottodoGroup.hidden = nottodoCount === 0;
    if (getHabits().length === 0) {
        emptyState.textContent = "Dar neturite įpročių. Sukurkite pirmąjį mygtuku „+ Naujas įprotis“.";
        emptyState.hidden = false;
    } else if (habits.length === 0) {
        emptyState.textContent = "Šiai dienai įpročių nesuplanuota.";
        emptyState.hidden = false;
    } else {
        emptyState.hidden = true;
    }

}

btnPrevDay.addEventListener("click", function () {
    changeDay(-1);
});

btnNextDay.addEventListener("click", function () {
    changeDay(1);
});

btnGoToday.addEventListener("click", goToday);