// "Šiandien" rodinio sąrašas (T14)

import { getHabits, getHabitsForDate, isMarked, toggleResult } from "./model.js";
import { WEEKDAYS_SHORT, today, addDays, toKey, formatLong } from "./dates.js";
import { openEditForm, openDeleteConfirm } from "./ui-form.js";
import { renderProgress } from "./ui-progress.js";
import { currentStreak } from "./stats.js";

const emptyState = document.getElementById("empty-state");
const todoGroup = document.getElementById("todo-group");
const todoList = document.getElementById("todo-list");
const nottodoGroup = document.getElementById("nottodo-group");
const nottodoList = document.getElementById("nottodo-list");
const dateLabel = document.getElementById("date-label");
const btnPrevDay = document.getElementById("btn-prev-day");
const btnNextDay = document.getElementById("btn-next-day");
const btnGoToday = document.getElementById("btn-go-today");
const futureNote = document.getElementById("future-note");

let selectedDate = today();
let openMenu = null;

function closeMenu(restoreFocus = false) {
    if (openMenu === null) {
        return;
    }
    const toggle = openMenu.querySelector(".habit-menu-toggle");
    openMenu.querySelector(".habit-menu-options").hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    openMenu = null;
    if (restoreFocus) {
        toggle.focus();
    }
}

export function getSelectedDate() {
    return selectedDate;
}

function isFuture() {
    return toKey(selectedDate) > toKey(today());
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
    card.style.setProperty("--habit-color", habit.color);

    const icon = document.createElement("span");
    icon.className = "habit-icon";
    icon.setAttribute("aria-hidden", "true");
    if (habit.type === "todo") {
        icon.textContent = "●";
    } else {
        icon.textContent = "×";
    }

    const info = document.createElement("div");
    info.className = "habit-info";

    const name = document.createElement("div");
    name.className = "habit-name";
    name.textContent = habit.name;

    const streak = document.createElement("span");
    streak.className = "habit-streak";
    const streakCount = currentStreak(habit);
    streak.textContent = streakCount;
    streak.setAttribute("aria-label", "Dabartinė seka: " + streakCount + " d.");

    const flame = document.createElement("img");
    flame.className = "streak-flame";
    flame.src = "assets/flame.svg";
    flame.alt = "";
    flame.setAttribute("aria-hidden", "true");
    streak.appendChild(flame);

    const titleRow = document.createElement("div");
    titleRow.className = "habit-title-row";
    titleRow.appendChild(name);
    titleRow.appendChild(streak);

    const days = document.createElement("div");
    days.className = "habit-days";
    days.textContent = formatDays(habit.days);

    info.appendChild(titleRow);
    info.appendChild(days);

    const actions = document.createElement("div");
    actions.className = "habit-actions";

    const dateKey = toKey(selectedDate);
    const marked = isMarked(habit.id, dateKey);

    const btnMark = document.createElement("button");
    btnMark.id = "mark-" + habit.id;
    btnMark.type = "button";
    btnMark.className = "btn-mark";
    btnMark.setAttribute("aria-pressed", marked);

    if (isFuture()) {
        btnMark.disabled = true;
    }

    if (marked) {
        btnMark.classList.add("is-marked");
        card.classList.add("is-done");
        if (habit.type === "todo") {
            btnMark.textContent = "✓ Atlikta";
        } else {
            btnMark.textContent = "✓ Išvengta";
        }
    } else {
        btnMark.textContent = "Pažymėti";
    }
    btnMark.setAttribute("aria-label", habit.name + ": " + btnMark.textContent);

    btnMark.addEventListener("click", function () {
        toggleResult(habit.id, dateKey);
        renderList();
        renderProgress();
        document.getElementById("mark-" + habit.id).focus();
    });

    const menu = document.createElement("div");
    menu.className = "habit-menu";

    const menuToggle = document.createElement("button");
    menuToggle.id = "menu-" + habit.id;
    menuToggle.type = "button";
    menuToggle.className = "habit-menu-toggle";
    menuToggle.textContent = "⋮";
    menuToggle.setAttribute("aria-label", "Įpročio „" + habit.name + "“ veiksmai");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-controls", "menu-actions-" + habit.id);

    const menuOptions = document.createElement("div");
    menuOptions.id = "menu-actions-" + habit.id;
    menuOptions.className = "habit-menu-options";
    menuOptions.hidden = true;

    const btnEdit = document.createElement("button");
    btnEdit.type = "button";
    btnEdit.textContent = "Redaguoti";
    btnEdit.setAttribute("aria-label", "Redaguoti įprotį „" + habit.name + "“");
    btnEdit.addEventListener("click", function () {
        closeMenu();
        openEditForm(habit.id, menuToggle);
    });

    const btnDelete = document.createElement("button");
    btnDelete.type = "button";
    btnDelete.textContent = "Šalinti";
    btnDelete.setAttribute("aria-label", "Šalinti įprotį „" + habit.name + "“");
    btnDelete.addEventListener("click", function () {
        closeMenu();
        openDeleteConfirm(habit.id, menuToggle);
    });

    menuToggle.addEventListener("click", function () {
        if (openMenu === menu) {
            closeMenu();
            return;
        }
        closeMenu();
        menuOptions.hidden = false;
        menuToggle.setAttribute("aria-expanded", "true");
        openMenu = menu;
        btnEdit.focus();
    });

    menuOptions.appendChild(btnEdit);
    menuOptions.appendChild(btnDelete);
    menu.appendChild(menuToggle);
    menu.appendChild(menuOptions);
    actions.appendChild(btnMark);

    card.appendChild(icon);
    card.appendChild(info);
    card.appendChild(actions);
    card.appendChild(menu);

    return card;
}

function renderDate() {
    dateLabel.textContent = formatLong(selectedDate);

    const isToday = toKey(selectedDate) === toKey(today());
    btnGoToday.hidden = isToday;

    futureNote.hidden = !isFuture();
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
    closeMenu();
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

document.addEventListener("click", function (event) {
    if (openMenu !== null && !openMenu.contains(event.target)) {
        closeMenu(openMenu.contains(document.activeElement));
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && openMenu !== null) {
        event.preventDefault();
        closeMenu(true);
    }
});

document.addEventListener("focusin", function (event) {
    if (openMenu !== null && !openMenu.contains(event.target)) {
        closeMenu();
    }
});
