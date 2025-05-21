// ==== Core Calendar Logic (unchanged) ====
const calendarEl = document.getElementById("calendar");
const viewLabel   = document.getElementById("view-label");
const zoomLevels  = ["day","week","month","quarter","semester","year"];
let currentIndex  = 2;           // start at month
let currentDate   = new Date();
let scrollDebounce;

// Controls
document.getElementById("zoom-in").onclick  = () => zoom(-1);
document.getElementById("zoom-out").onclick = () => zoom( 1);
document.getElementById("prev").onclick     = () => shift(-1);
document.getElementById("next").onclick     = () => shift( 1);

// Wheel-to-zoom
calendarEl.addEventListener("wheel", e=>{
  e.preventDefault();
  if (scrollDebounce) return;
  scrollDebounce = setTimeout(()=>scrollDebounce=null,300);
  zoom(e.deltaY>0?1:-1);
},{passive:false});

function zoom(dir){
  currentIndex = Math.min(zoomLevels.length-1, Math.max(0, currentIndex+dir));
  animate();
}

function shift(dir){
  const v = zoomLevels[currentIndex];
  if (v==="day")       currentDate.setDate(currentDate.getDate()+dir);
  else if (v==="week")  currentDate.setDate(currentDate.getDate()+7*dir);
  else if (v==="month") currentDate.setMonth(currentDate.getMonth()+dir);
  else if (v==="quarter")  shiftQuarter(dir);
  else if (v==="semester") shiftSemester(dir);
  else if (v==="year")     shiftYear(dir);
  animate();
}

// Quarter/Semester/Year shifts (unchanged)
function shiftQuarter(dir){ /* … your existing code … */ }
function shiftSemester(dir){ /* … your existing code … */ }
function shiftYear(dir){ /* … your existing code … */ }

function animate(){
  const wrapper = document.createElement("div");
  wrapper.className = "calendar-view transitioning";
  viewLabel.textContent = labelFor(zoomLevels[currentIndex]);
  wrapper.innerHTML = renderView(zoomLevels[currentIndex]);
  calendarEl.innerHTML = "";
  calendarEl.append(wrapper);
  void wrapper.offsetWidth;
  requestAnimationFrame(()=>wrapper.classList.remove("transitioning"));

  // ─── NEW: after drawing grid, render events and attach drill-in ───
  renderEvents();
  wrapper.addEventListener("click", onCellClick);
}

function onCellClick(e) {
  /* … your existing click-to-drill code … */
}

// Label for header (unchanged)
function labelFor(view){ /* … */ }

// View rendering (unchanged)
function renderView(view){ /* … */ }
function renderDay(){ /* … */ }
function renderWeek(){ /* … */ }
function renderMonthGrid(){ /* … */ }
function getQuarterMonths(){ /* … */ }
function getSemesterMonths(){ /* … */ }
function getSchoolYearMonths(){ /* … */ }
function renderMulti(months){ /* … */ }

// ─── NEW: Event Store & Helper ───
let events = [];  
function formatYYYYMMDD(d) { return d.toISOString().slice(0,10); }

// ─── NEW: SEARCH / FILTER ───
// Assumes your HTML input has id="event-search" and CSS makes it smaller
document.getElementById("event-search").addEventListener("input", e => {
  const term = e.target.value.toLowerCase();
  document.querySelectorAll(".event-item").forEach(el => {
    el.style.display = el.textContent.toLowerCase().includes(term) ? "" : "none";
  });
});

// ─── NEW: MODAL WIRING ───
const modal     = document.getElementById("event-modal");
const ti        = document.getElementById("evt-title");
const tm        = document.getElementById("evt-time");
const saveBtn   = document.getElementById("evt-save");
const cancelBtn = document.getElementById("evt-cancel");
let editingEvent = null;

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
  if (!title) return alert("Title required");
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

// ─── NEW: DOUBLE-CLICK TO CREATE/EDIT ───
calendarEl.addEventListener("dblclick", e => {
  const cell = e.target.closest(".day-cell, .week-cell, .month-cell");
  if (!cell || cell.classList.contains("empty")) return;

  // determine dateStr
  let dateStr, view = zoomLevels[currentIndex];
  if (view==="day") {
    dateStr = formatYYYYMMDD(currentDate);
  } else if (view==="week") {
    const idx = Array.from(cell.parentElement.children).indexOf(cell);
    let s = new Date(currentDate);
    s.setDate(s.getDate() - s.getDay() + idx);
    dateStr = formatYYYYMMDD(s);
  } else {
    const d = parseInt(cell.textContent,10),
          m = currentDate.getMonth(),
          y = currentDate.getFullYear();
    dateStr = new Date(y,m,d).toISOString().slice(0,10);
  }

  editingEvent = { id: null, date: dateStr, time:"", title:"" };
  openModal("New Event");
});

// ─── NEW: RENDER EVENTS & DRAG-DROP ───
function renderEvents(){
  // remove old
  document.querySelectorAll(".event-item").forEach(el=>el.remove());

  events.forEach(ev => {
    const view = zoomLevels[currentIndex];
    // filter out-of-view
    if (view==="month") {
      let [y,m] = ev.date.split("-");
      if (+y!==currentDate.getFullYear() || +m-1!==currentDate.getMonth()) return;
    } else if (ev.date!==formatYYYYMMDD(currentDate)) {
      return;
    }
    // find cell selector
    let sel;
    if (view==="day") {
      let hr = parseInt(ev.time);
      sel = `.day-cell:nth-child(${hr})`;
    } else if (view==="week") {
      let idx = new Date(ev.date).getDay();
      sel = `.week-row:nth-child(${idx+2}) .week-cell`;
    } else {
      let d = new Date(ev.date).getDate();
      sel = `.month-cell:not(.empty):nth-of-type(${d})`;
    }
    let cell = calendarEl.querySelector(sel);
    if (!cell) return;

    // create draggable event
    let div = document.createElement("div");
    div.className = "event-item";
    div.textContent = `${ev.time} ${ev.title}`;
    div.draggable = true;
    div.dataset.id  = ev.id;
    cell.appendChild(div);

    div.addEventListener("dragstart", e=>{
      e.dataTransfer.setData("text/plain", ev.id);
    });
  });

  // make cells droppable
  calendarEl.querySelectorAll(".day-cell, .week-cell, .month-cell").forEach(cell=>{
    cell.addEventListener("dragover", e=>e.preventDefault());
    cell.addEventListener("drop", e=>{
      let id = e.dataTransfer.getData("text/plain"),
          ev = events.find(x=>x.id==id);
      if (!ev) return;
      // compute new date (same as dblclick logic)
      let view = zoomLevels[currentIndex], newDate;
      if (view==="day") newDate = currentDate;
      else if (view==="week") {
        let idx = Array.from(cell.parentElement.children).indexOf(cell);
        let s = new Date(currentDate);
        s.setDate(s.getDate() - s.getDay() + idx);
        newDate = s;
      } else {
        let d = parseInt(cell.textContent,10),
            m = currentDate.getMonth(),
            y = currentDate.getFullYear();
        newDate = new Date(y,m,d);
      }
      ev.date = formatYYYYMMDD(newDate);
      renderEvents();
    });
  });
}

// ==== Initial render ====
animate();
