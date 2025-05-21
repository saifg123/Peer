// script.js
const calendarEl = document.getElementById("calendar");
const viewLabel  = document.getElementById("view-label");
const zoomLevels = ["day","week","month","quarter","semester","year"];
let currentIndex = 2; // month
let currentDate  = new Date();
let scrollDebounce;
let selectedDate = null;

// notes keyed by "YYYY-MM-DD-HH"
const notes = {};

// Helper: format key
function formatKey(dt) {
  const d = dt.toISOString().slice(0,10);
  const h = dt.getHours().toString().padStart(2,"0");
  return `${d}-${h}`;
}

// Controls
document.getElementById("zoom-in").onclick  = () => zoom(-1);
document.getElementById("zoom-out").onclick = () => zoom( 1);
document.getElementById("prev").onclick     = () => shift(-1);
document.getElementById("next").onclick     = () => shift( 1);

// Wheel-to-zoom (debounced)
calendarEl.addEventListener("wheel", e => {
  e.preventDefault();
  if (scrollDebounce) return;
  scrollDebounce = setTimeout(() => scrollDebounce = null, 300);
  zoom(e.deltaY>0 ? 1 : -1);
}, { passive: false });

function zoom(dir) {
  currentIndex = Math.min(zoomLevels.length-1, Math.max(0, currentIndex+dir));
  animate();
}

function shift(dir) {
  const v = zoomLevels[currentIndex];
  if (v==="day")       currentDate.setDate(currentDate.getDate()+dir);
  else if (v==="week") currentDate.setDate(currentDate.getDate()+7*dir);
  else if (v==="month")currentDate.setMonth(currentDate.getMonth()+dir);
  else if (v==="quarter")  shiftQuarter(dir);
  else if (v==="semester") shiftSemester(dir);
  else if (v==="year")     shiftYear(dir);
  animate();
}

function shiftQuarter(dir){
  const m = currentDate.getMonth(), y = currentDate.getFullYear();
  const starts = [8,10,0,2];
  let q = starts.findIndex((s,i)=>{
    const e = starts[(i+1)%4];
    return s<e ? m>=s && m<e : m>=s || m<e;
  });
  if (q<0) q=0;
  const newQ = (q+dir+4)%4;
  const yearAdj = y + Math.floor((starts[q]+dir*3)/12);
  currentDate = new Date(yearAdj, starts[newQ], 1);
}

function shiftSemester(dir){
  const m = currentDate.getMonth(), y = currentDate.getFullYear();
  if (m<=4) currentDate = dir>0 ? new Date(y,8,1) : new Date(y-1,8,1);
  else      currentDate = dir>0 ? new Date(y+1,0,1) : new Date(y,0,1);
}

function shiftYear(dir){
  const y = currentDate.getFullYear()+dir;
  currentDate = new Date(y,8,1);
}

function animate(){
  const wrapper = document.createElement("div");
  wrapper.className = "calendar-view transitioning";
  viewLabel.textContent = labelFor(zoomLevels[currentIndex]);
  wrapper.innerHTML = renderView(zoomLevels[currentIndex]);
  calendarEl.innerHTML = "";
  calendarEl.append(wrapper);
  // click handlers
  wrapper.addEventListener("click", onCellClick);
  // dblclick for Day notes
  wrapper.addEventListener("dblclick", onDayDblClick);
  void wrapper.offsetWidth;
  requestAnimationFrame(()=> wrapper.classList.remove("transitioning"));
}

function onCellClick(e) {
  const view = zoomLevels[currentIndex];

  // Quarter → Month
  if (view==="quarter") {
    const tile = e.target.closest(".month-tile");
    if (!tile) return;
    const [monthName, year] = tile.querySelector(".month-title").textContent.split(" ");
    const mi = new Date(`${monthName} 1, ${year}`).getMonth();
    currentDate = new Date(+year, mi, 1);
    zoom(-1);
    return;
  }

  // Month view
  if (view==="month") {
    const mcell = e.target.closest(".month-cell");
    if (!mcell || mcell.classList.contains("empty")) return;

    const numEl = mcell.querySelector(".month-day-number");
    if (e.target===numEl || e.target.closest(".note-banner")) {
      // full-day note
      const day = +numEl.textContent;
      selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day, 0,0,0);
      openModalFor(selectedDate);
    } else {
      // drill to week
      const day = +numEl.textContent;
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      zoom(-1);
    }
    return;
  }

  // Week view
  if (view==="week") {
    const cell = e.target.closest(".week-cell");
    if (!cell) return;
    const col = Array.from(cell.parentElement.children).indexOf(cell);
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay() + col);
    currentDate = start;
    zoom(-1);
    return;
  }
}

// Double-click in Day for hour note
function onDayDblClick(e) {
  if (zoomLevels[currentIndex] !== "day") return;
  const cell = e.target.closest(".day-cell");
  if (!cell) return;
  const hour = +cell.getAttribute("data-hour");
  selectedDate = new Date(currentDate);
  selectedDate.setHours(hour,0,0,0);
  openModalFor(selectedDate);
}

function openModalFor(dt) {
  modalDate.textContent = dt.toDateString() + (zoomLevels[currentIndex]==="day" ? ` @ ${dt.getHours()}:00` : "");
  modalText.value = notes[formatKey(dt)] || "";
  modal.classList.remove("hidden");
}

// header label
function labelFor(view) { /* unchanged */ }

// render dispatch
function renderView(v) {
  if (v==="day")    return renderDay();
  if (v==="week")   return renderWeek();
  if (v==="month")  return renderMonthGrid();
  if (v==="quarter")return renderMulti(getQuarterMonths());
  if (v==="semester")return renderMulti(getSemesterMonths());
  return renderMulti(getSchoolYearMonths());
}

// ... include your existing renderDay, renderWeek (with banners), renderMonthGrid (with number wrapped and banner),
// getQuarterMonths, getSemesterMonths, getSchoolYearMonths, renderMulti here unchanged ...

// Modal save/close
modalClose.onclick = () => modal.classList.add("hidden");
modalSave.onclick = () => {
  if (!selectedDate) return;
  const key = formatKey(selectedDate);
  const txt = modalText.value.trim();
  if (txt) notes[key] = txt;
  else delete notes[key];
  modal.classList.add("hidden");
  animate();
};

// initial draw
animate();
