// ==== Core Calendar Logic (unchanged) ====
const calendarEl = document.getElementById("calendar");
const viewLabel  = document.getElementById("view-label");
const zoomLevels = ["day","week","month","quarter","semester","year"];
let currentIndex = 2;
let currentDate  = new Date();
let scrollDebounce;

// Zoom & navigation controls (unchanged)
document.getElementById("zoom-in").onclick  = () => zoom(-1);
document.getElementById("zoom-out").onclick = () => zoom( 1);
document.getElementById("prev").onclick     = () => shift(-1);
document.getElementById("next").onclick     = () => shift( 1);
calendarEl.addEventListener("wheel", e => {
  e.preventDefault();
  if (scrollDebounce) return;
  scrollDebounce = setTimeout(() => scrollDebounce = null, 300);
  zoom(e.deltaY > 0 ? 1 : -1);
}, { passive: false });

function zoom(dir) {
  currentIndex = Math.min(zoomLevels.length - 1, Math.max(0, currentIndex + dir));
  animate();
}

function shift(dir) {
  const v = zoomLevels[currentIndex];
  if (v === "day")       currentDate.setDate(currentDate.getDate() + dir);
  else if (v === "week")  currentDate.setDate(currentDate.getDate() + 7 * dir);
  else if (v === "month") currentDate.setMonth(currentDate.getMonth() + dir);
  else if (v === "quarter")  shiftQuarter(dir);
  else if (v === "semester") shiftSemester(dir);
  else if (v === "year")     shiftYear(dir);
  animate();
}

// Quarter/Semester/Year shifts (unchanged)
function shiftQuarter(dir){ /* ... */ }
function shiftSemester(dir){ /* ... */ }
function shiftYear(dir){ /* ... */ }

// Main render & drill-in
function animate() {
  const wrapper = document.createElement("div");
  wrapper.className = "calendar-view transitioning";
  viewLabel.textContent = labelFor(zoomLevels[currentIndex]);
  wrapper.innerHTML = renderView(zoomLevels[currentIndex]);
  calendarEl.innerHTML = "";
  calendarEl.append(wrapper);
  void wrapper.offsetWidth;
  requestAnimationFrame(() => wrapper.classList.remove("transitioning"));

  // After rendering the grid:
  renderEvents();              // inject events
  wrapper.addEventListener("click", onCellClick);
}

// Drill-in on click (unchanged)
function onCellClick(e) { /* ... */ }

// Label and view renderers (unchanged)
function labelFor(view){ /* ... */ }
function renderView(v){ /* ... */ }
function renderDay(){ /* ... */ }
function renderWeek(){ /* ... */ }
function renderMonthGrid(){ /* ... */ }
function getQuarterMonths(){ /* ... */ }
function getSemesterMonths(){ /* ... */ }
function getSchoolYearMonths(){ /* ... */ }
function renderMulti(months){ /* ... */ }

// ==== NEW: Event Store & Helpers ====
let events = [];  // array of {id, date:"YYYY-MM-DD", time:"HH:MM", title}
let editingEvent = null;
function formatYYYYMMDD(d) { return d.toISOString().slice(0,10); }

// ==== NEW: Search / Filter ====
document.getElementById("event-search").addEventListener("input", e => {
  const term = e.target.value.toLowerCase();
  document.querySelectorAll(".event-item").forEach(el => {
    el.style.display = el.textContent.toLowerCase().includes(term) ? "" : "none";
  });
});

// ==== NEW: Modal Wiring ====
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
  if (!ti.value.trim()) return alert("Title required");
  editingEvent.title = ti.value.trim();
  editingEvent.time  = tm.value;
  if (!editingEvent.id) {
    editingEvent.id = Date.now();
    events.push(editingEvent);
  }
  closeModal();
  renderEvents();
};
cancelBtn.onclick = closeModal;

// ==== NEW: Double-click to Create/Edit ====
calendarEl.addEventListener("dblclick", e => {
  const cell = e.target.closest(".day-cell, .week-cell, .month-cell");
  if (!cell || cell.classList.contains("empty")) return;

  // Determine dateStr based on view
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
    const day = parseInt(cell.textContent,10);
    const m   = currentDate.getMonth(), y = currentDate.getFullYear();
    dateStr = new Date(y,m,day).toISOString().slice(0,10);
  }

  editingEvent = { id:null, date:dateStr, time:"", title:"" };
  openModal("New Event");
});

// ==== NEW: Render Events & Drag-Drop ====
function renderEvents(){
  // Remove any old items
  document.querySelectorAll(".event-item").forEach(el=>el.remove());

  events.forEach(ev => {
    // Only show in current view
    const view = zoomLevels[currentIndex];
    if (view==="month") {
      const [y,m] = ev.date.split("-");
      if (parseInt(y)!==currentDate.getFullYear() || parseInt(m)-1!==currentDate.getMonth())
        return;
    } else if (ev.date!==formatYYYYMMDD(currentDate)) {
      return;
    }

    // Find proper cell
    let selector;
    if (view==="day") {
      const hour = parseInt(ev.time);
      selector = `.day-cell:nth-child(${hour})`;
    } else if (view==="week") {
      const idx = new Date(ev.date).getDay();
      selector = `.week-row:nth-child(${idx+2}) .week-cell`;
    } else {
      const d = new Date(ev.date).getDate();
      selector = `.month-cell:not(.empty):nth-of-type(${d})`;
    }
    const cell = calendarEl.querySelector(selector);
    if (!cell) return;

    // Create event item
    const div = document.createElement("div");
    div.className     = "event-item";
    div.textContent   = `${ev.time} ${ev.title}`;
    div.draggable     = true;
    div.dataset.id    = ev.id;
    cell.appendChild(div);

    // dragstart
    div.addEventListener("dragstart", e=>{
      e.dataTransfer.setData("text/plain", ev.id);
    });
  });

  // Allow drop on cells
  calendarEl.querySelectorAll(".day-cell, .week-cell, .month-cell").forEach(c=>{
    c.addEventListener("dragover", e=>e.preventDefault());
    c.addEventListener("drop", e=>{
      const id = e.dataTransfer.getData("text/plain");
      const ev = events.find(x=>x.id==id);
      if (!ev) return;

      // Compute new date same logic as dblclick
      const view = zoomLevels[currentIndex];
      if (view==="day") {
        ev.date = formatYYYYMMDD(currentDate);
      } else if (view==="week") {
        const idx = Array.from(c.parentElement.children).indexOf(c);
        const s = new Date(currentDate);
        s.setDate(s.getDate() - s.getDay() + idx);
        ev.date = formatYYYYMMDD(s);
      } else {
        const d = parseInt(c.textContent,10);
        const m = currentDate.getMonth(), y = currentDate.getFullYear();
        ev.date = new Date(y,m,d).toISOString().slice(0,10);
      }
      renderEvents();
    });
  });
}

// ==== Initialize ====
animate();  // animates and calls renderEvents internally
