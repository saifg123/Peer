// ==== Calendar Logic (unchanged) ====
const calendarEl = document.getElementById("calendar");
const viewLabel  = document.getElementById("view-label");
const zoomLevels = ["day","week","month","quarter","semester","year"];
let currentIndex = 2;
let currentDate  = new Date();
let scrollDebounce;

// ... your existing zoom(), shift(), animate(), onCellClick(), labelFor(), renderView(), renderDay(), renderWeek(), renderMonthGrid(), renderMulti(), getQuarterMonths(), getSemesterMonths(), getSchoolYearMonths() ...

// ==== Event Store & Helpers ====
let events = [];  // {id, date:"YYYY-MM-DD", time:"HH:MM", title}
let editingEvent = null;

function formatYYYYMMDD(date) {
  return date.toISOString().slice(0,10);
}

// ==== SEARCH / FILTER ====
document.getElementById("event-search").addEventListener("input", e => {
  const term = e.target.value.toLowerCase();
  document.querySelectorAll(".event-item").forEach(el => {
    el.style.display = el.textContent.toLowerCase().includes(term) ? "" : "none";
  });
});

// ==== MODAL MANAGEMENT ====
const modal     = document.getElementById("event-modal");
const ti        = document.getElementById("evt-title");
const tm        = document.getElementById("evt-time");
const saveBtn   = document.getElementById("evt-save");
const cancelBtn = document.getElementById("evt-cancel");

function openModal(header) {
  document.getElementById("modal-title").textContent = header;
  ti.value = editingEvent.title || "";
  tm.value = editingEvent.time  || "";
  modal.classList.remove("hidden");
  ti.focus();
}
function closeModal() {
  modal.classList.add("hidden");
  editingEvent = null;
}

saveBtn.onclick = () => {
  const title = ti.value.trim();
  if (!title) return alert("Please enter a title");
  editingEvent.title = title;
  editingEvent.time  = tm.value;
  if (!editingEvent.id) {
    editingEvent.id = Date.now();
    events.push(editingEvent);
  }
  closeModal();
  renderEvents();
};
cancelBtn.onclick = closeModal;

// ==== DOUBLE-CLICK TO CREATE/EDIT ====
calendarEl.addEventListener("dblclick", e => {
  // only on valid cells
  const cell = e.target.closest(".day-cell, .week-cell, .month-cell");
  if (!cell || cell.classList.contains("empty")) return;

  // determine date string
  let dateStr;
  const view = zoomLevels[currentIndex];
  if (view === "day") {
    dateStr = formatYYYYMMDD(currentDate);
  } else if (view === "week") {
    const idx = Array.from(cell.parentElement.children).indexOf(cell);
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay() + idx);
    dateStr = formatYYYYMMDD(start);
  } else {
    // month view
    const d = parseInt(cell.textContent, 10);
    const m = currentDate.getMonth(), y = currentDate.getFullYear();
    dateStr = new Date(y, m, d).toISOString().slice(0,10);
  }

  editingEvent = { id: null, date: dateStr, time: "", title: "" };
  openModal("New Event");
});

// ==== RENDER & DRAG-DROP ====
function renderEvents() {
  // remove old
  document.querySelectorAll(".event-item").forEach(el => el.remove());

  events.forEach(ev => {
    // filter by current view
    if (zoomLevels[currentIndex] === "month") {
      const [y,m] = ev.date.split("-");
      if (parseInt(y)!==currentDate.getFullYear() || parseInt(m)-1!==currentDate.getMonth())
        return;
    } else if (ev.date !== formatYYYYMMDD(currentDate)) {
      return;
    }

    // find proper cell selector
    let sel;
    const view = zoomLevels[currentIndex];
    if (view === "day") {
      const hour = ev.time.split(":")[0];
      sel = `.day-cell:nth-child(${hour})`;
    } else if (view === "week") {
      const idx = new Date(ev.date).getDay();
      sel = `.week-row:nth-child(${idx+2}) .week-cell`;
    } else {
      const day = new Date(ev.date).getDate();
      sel = `.month-cell:not(.empty):nth-of-type(${day})`;
    }
    const cell = calendarEl.querySelector(sel);
    if (!cell) return;

    // create event element
    const div = document.createElement("div");
    div.className = "event-item";
    div.textContent = `${ev.time} ${ev.title}`;
    div.draggable = true;
    div.dataset.id = ev.id;
    cell.appendChild(div);

    // dragstart
    div.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text/plain", ev.id);
    });
  });

  // make cells droppable
  calendarEl.querySelectorAll(".day-cell, .week-cell, .month-cell").forEach(c => {
    c.addEventListener("dragover", e => e.preventDefault());
    c.addEventListener("drop", e => {
      const id = e.dataTransfer.getData("text/plain");
      const ev = events.find(x => x.id == id);
      if (!ev) return;

      // compute new date same as dblclick logic
      let newDate;
      const view = zoomLevels[currentIndex];
      if (view === "day") {
        newDate = currentDate;
      } else if (view === "week") {
        const idx = Array.from(c.parentElement.children).indexOf(c);
        const s = new Date(currentDate);
        s.setDate(s.getDate() - s.getDay() + idx);
        newDate = s;
      } else {
        const d = parseInt(c.textContent, 10);
        const m = currentDate.getMonth(), y = currentDate.getFullYear();
        newDate = new Date(y, m, d);
      }
      ev.date = formatYYYYMMDD(newDate);
      renderEvents();
    });
  });
}

// ==== INITIALIZE ====
animate();  // your existing animate calls renderEvents internally
