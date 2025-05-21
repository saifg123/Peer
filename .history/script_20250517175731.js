const calendarEl = document.getElementById("calendar");
const viewLabel   = document.getElementById("view-label");
const zoomLevels  = ["day","week","month","quarter","semester","year"];
let currentIndex  = 2;           // start at month
let currentDate   = new Date();
let scrollDebounce;

const calendarData = {}; // key = 'YYYY-MM-DD', value = array of hour slots
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

// Quarter: Q1=Sept–Nov, Q2=Nov–Jan, Q3=Jan–Mar, Q4=Mar–Jun
function shiftQuarter(dir){
  const m = currentDate.getMonth(), y = currentDate.getFullYear();
  const starts = [8, 10, 0, 2]; // September, November, January, March
  let q = starts.findIndex((s,i)=>{
    const e = starts[(i+1)%4];
    return s < e ? m >= s && m < e : m >= s || m < e;
  });
  if (q<0) q = 0;
  let newQ = (q + dir + 4) % 4;
  let newYear = y + Math.floor((starts[q] + dir*3) / 12);
  currentDate = new Date(newYear, starts[newQ], 1);
}

// Spring: Jan–May, Fall: Sept–Dec
function shiftSemester(dir){
  const m = currentDate.getMonth(), y = currentDate.getFullYear();
  if (m <= 4) {
    // spring → fall
    currentDate = dir>0 ? new Date(y,8,1) : new Date(y-1,8,1);
  } else {
    // fall → spring
    currentDate = dir>0 ? new Date(y+1,0,1) : new Date(y,0,1);
  }
}

// School year: Sept–May
function shiftYear(dir){
  const y = currentDate.getFullYear() + dir;
  currentDate = new Date(y,8,1);
}

function animate(){
  const wrapper = document.createElement("div");
  wrapper.className = "calendar-view transitioning";
  viewLabel.textContent = labelFor(zoomLevels[currentIndex]);
  wrapper.innerHTML = renderView(zoomLevels[currentIndex]);
  calendarEl.innerHTML = "";
  calendarEl.append(wrapper);
  void wrapper.offsetWidth;
  requestAnimationFrame(() => wrapper.classList.remove("transitioning"));
  wrapper.addEventListener("click", onCellClick);

  // ✅ Fix: Add note button logic only in Day view
  const btn = wrapper.querySelector("#open-note-day");
  if (btn) {
    btn.onclick = () => {
      selectedDate = new Date(currentDate);
      const key = selectedDate.toISOString().slice(0, 10);
      modalDate.textContent = selectedDate.toDateString();
      modalText.value = notes[key] || "";
      modal.classList.remove("hidden");
    };
  }
}


function onCellClick(e) {
  const view = zoomLevels[currentIndex];

  // QUARTER -> MONTH
  if (view === "quarter") {
    const tile = e.target.closest(".month-tile");
    if (!tile) return;
    const title = tile.querySelector(".month-title").textContent;
    const [monthName, yearStr] = title.split(" ");
    const monthIndex = new Date(`${monthName} 1, ${yearStr}`).getMonth();
    currentDate = new Date(parseInt(yearStr), monthIndex, 1);
    zoom(-1); // down to month
    
  }

  // MONTH -> WEEK
  else if (view === "month") {
    const cell = e.target.closest(".month-cell");
    if (!cell || cell.classList.contains("empty")) return;
    const dayNum = parseInt(cell.textContent, 10);
    if (isNaN(dayNum)) return;
    const m = currentDate.getMonth(), y = currentDate.getFullYear();
    currentDate = new Date(y, m, dayNum);
    zoom(-1); // down to week
  }

  // WEEK -> DAY
  else if (view === "week") {
    const cell = e.target.closest(".week-cell");
    if (!cell) return;
    const row = cell.parentElement;
    const idx = Array.from(row.children).indexOf(cell);
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    currentDate = new Date(start.getFullYear(), start.getMonth(), start.getDate() + idx);
    zoom(-1); // down to day
  }

  // DAY -> no further zoom (shows hours)
}

// Label for header
function labelFor(view) {
  if (view === "day") {
    return currentDate.toLocaleDateString(undefined, { weekday:"long", month:"long", day:"numeric" });
  }
  if (view === "week") {
    const s = new Date(currentDate);
    s.setDate(s.getDate() - s.getDay());
    return "Week of " + s.toLocaleDateString(undefined, { month:"long", day:"numeric" });
  }
  if (view === "month") {
    return currentDate.toLocaleDateString(undefined, { month:"long", year:"numeric" });
  }
  if (view === "quarter") {
    const m = currentDate.getMonth();
    const qNum = Math.floor(((m+4)%12)/3) + 1;
    return `Q${qNum} ${currentDate.getFullYear()}`;
  }
  if (view === "semester") {
    return (currentDate.getMonth() <= 4 ? "Spring" : "Fall") + " Semester " + currentDate.getFullYear();
  }
  // year
  return `School Year ${currentDate.getFullYear()}–${(currentDate.getFullYear()+1+"").slice(-2)}`;
}

function renderView(view) {
  if (view === "day")      return renderDay();
  if (view === "week")     return renderWeek();
  if (view === "month")    return renderMonthGrid();
  if (view === "quarter")  return renderMulti(getQuarterMonths());
  if (view === "semester") return renderMulti(getSemesterMonths());
  return renderMulti(getSchoolYearMonths());
}

function renderDay() {
  const label = currentDate.toLocaleDateString(undefined, {
    weekday: "long", month: "long", day: "numeric"
  });

  const dateStr = currentDate.toISOString().slice(0, 10);
  initializeDay(dateStr); // ensure data exists

  let html =
    `<div class="day-header">` +
      `<span>${label}</span>` +
      `<button id="open-note-day">Add Note</button>` +
    `</div>` +
    `<div class="day-grid">`;

  for (let h = 0; h < 24; h++) {
    html += `<div class="day-cell"><span>${h}:00</span>`;
    const events = calendarData[dateStr][h];
    for (const e of events) {
      html += `<div class="event-item">${e.title} <small>(${e.className})</small></div>`;
    }
    html += `</div>`;
  }
  return html + `</div>`;
}



function renderWeek() {
  const start = new Date(currentDate);
  start.setDate(start.getDate() - start.getDay());
  let html = `<div class="week-grid"><div class="week-labels">`;

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    html += `<div class="week-label">${d.toLocaleDateString(undefined, { weekday:"short", day:"numeric" })}</div>`;
  }
  html += `</div>`;

  for (let h = 0; h < 24; h++) {
    html += `<div class="week-row">`;
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dateStr = d.toISOString().slice(0,10);
      initializeDay(dateStr);
      const events = calendarData[dateStr][h];
      html += `<div class="week-cell">`;
      for (const e of events) {
        html += `<div class="event-item">${e.title}<small> (${e.className})</small></div>`;
      }
      html += `</div>`;
    }
    html += `</div>`;
  }

  return html + `</div>`;
}


function renderMonthGrid() {
  const y = currentDate.getFullYear(), m = currentDate.getMonth();
  const firstDay = new Date(y, m, 1).getDay(), total = new Date(y, m+1, 0).getDate();
  let html = `<div class="month-grid"><div class="month-labels">` +
    ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>`<div class="month-label">${d}</div>`).join("") +
    `</div>`;

  let d = 1;
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      if ((row === 0 && col < firstDay) || d > total) {
        html += `<div class="month-cell empty"></div>`;
      } else {
        const dateStr = new Date(y, m, d).toISOString().slice(0, 10);
        initializeDay(dateStr);
        const assignments = calendarData[dateStr].flat(); // all hours
        html += `<div class="month-cell"><div>${d}</div>`;
        html += `<div class="month-events">`;
for (const e of assignments) {
  html += `<div class="event-item">${e.title}<small> (${e.className})</small></div>`;
}
html += `</div>`;

        html += `</div>`;
        d++;
      }
    }
  }
  return html + `</div>`;
}


function getQuarterMonths() {
  const m = currentDate.getMonth(), y = currentDate.getFullYear();
  const starts = [8,10,0,2];
  const q = starts.findIndex((s,i)=>{
    const e = starts[(i+1)%4];
    return s<e ? m>=s && m<e : m>=s || m<e;
  }) || 0;
  const start = starts[q];
  const yearAdjust = (start>m) ? y-1 : y;
  return Array.from({length:3},(_,i)=> new Date(yearAdjust, start+i,1));
}

function getSemesterMonths() {
  const m = currentDate.getMonth(), y = currentDate.getFullYear();
  if (m <= 4) {
    return Array.from({length:5},(_,i)=> new Date(y,i,1));
  } else {
    return Array.from({length:4},(_,i)=> new Date(y,8+i,1));
  }
}

function getSchoolYearMonths() {
  const m = currentDate.getMonth(), y = currentDate.getFullYear();
  const startYear = (m>=8)? y : y-1;
  const fall   = Array.from({length:4},(_,i)=> new Date(startYear,8+i,1));
  const spring = Array.from({length:5},(_,i)=> new Date(startYear+1,i,1));
  return fall.concat(spring);
}

function renderMulti(months) {
  const highlights = [
    {month:10,day:5}, {month:0,day:23},
    {month:2,day:28}, {month:5,day:4}
  ];
  let html = `<div class="multi-month-grid">`;
  months.forEach(md=>{
    const y=md.getFullYear(), mm=md.getMonth();
    const tot=new Date(y,mm+1,0).getDate(), fd=new Date(y,mm,1).getDay();
    html+=`<div class="month-tile"><div class="month-title">${
      md.toLocaleString(undefined,{month:"long",year:"numeric"})
    }</div><div class="month-weekdays">${
      ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
      .map(d=>`<div>${d}</div>`).join("")
    }</div><div class="month-days">`;
    for(let i=0;i<fd;i++) html+=`<div class="day empty"></div>`;
    for(let dd=1;dd<=tot;dd++){
      const hl=highlights.some(h=>h.month===mm&&h.day===dd);
      html+=`<div class="day${hl?" highlight":""}">${dd}</div>`;
    }
    html+=`</div></div>`;
  });
  return html+`</div>`;
}

// initial render
animate();
// ===== Simple Chatbox Logic =====
const chatInput    = document.getElementById("chat-input");
const chatSend     = document.getElementById("chat-send");
const chatMessages = document.getElementById("chat-messages");

chatSend.onclick = sendChat;
chatInput.addEventListener("keydown", e => {
  if (e.key === "Enter") sendChat();
});

function sendChat() {
  const text = chatInput.value.trim();
  if (!text) return;
  // user message
  const userMsg = document.createElement("div");
  userMsg.className = "chat-message user";
  userMsg.textContent = text;
  chatMessages.appendChild(userMsg);
  chatInput.value = "";
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // (Optional) simple bot echo
  setTimeout(() => {
    const botMsg = document.createElement("div");
    botMsg.className = "chat-message bot";
    botMsg.textContent = `You said: "${text}"`;
    chatMessages.appendChild(botMsg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 500);
}
// ─── NEW: Search / Filter ───
document.getElementById("event-search").addEventListener("input", e => {
  const term = e.target.value.toLowerCase();
  document.querySelectorAll(".event-item").forEach(el => {
    el.style.display = el.textContent.toLowerCase().includes(term) ? "" : "none";
  });
});
const modal         = document.getElementById("event-modal");
const modalText     = document.getElementById("event-modal-text");
const modalDate     = document.getElementById("event-modal-date");
const modalClose    = document.getElementById("event-modal-close");
const modalSave     = document.getElementById("event-modal-save");

let selectedDate = null;
const notes = {};  // store notes keyed by YYYY-MM-DD

modalClose.onclick = () => modal.classList.add("hidden");
modalSave.onclick  = () => {
  if (selectedDate) {
    const key = selectedDate.toISOString().split("T")[0];
    const value = modalText.value.trim();
    if (value) notes[key] = value;
    else delete notes[key];
  }
  modal.classList.add("hidden");
};
// ─── NEW: Double-click in Day View to open modal ───
calendarEl.addEventListener("dblclick", e => {
  // Only when in "day" zoom level
  if (zoomLevels[currentIndex] !== "day") return;

  // Only if you dbl-click on a .day-cell
  const cell = e.target.closest(".day-cell");
  if (!cell) return;

  // Set selectedDate to currentDate (day view is that date)
  selectedDate = new Date(currentDate);

  // Populate modal
  const key = selectedDate.toISOString().slice(0,10);
  modalDate.textContent = selectedDate.toDateString();
  modalText.value        = notes[key] || "";

  // Show it
  modal.classList.remove("hidden");
});
// ─── NEW: “Add Note” button opens modal for current day view date ───

  // selectedDate is the date shown in Day view
  selectedDate = new Date(currentDate);
  // populate modal
  const key = selectedDate.toISOString().slice(0,10);
  modalDate.textContent = selectedDate.toDateString();
  modalText.value        = notes[key] || "";
  // show it
  modal.classList.remove("hidden");





function initializeDay(dateStr) {
  if (!calendarData[dateStr]) {
    calendarData[dateStr] = Array.from({ length: 24 }, () => []);
  }
}
function addAssignment({ dueDate, dueTime, className, assignmentTitle }) {
  const dateStr = dueDate; // Format: 'YYYY-MM-DD'
  const hour = parseInt(dueTime.split(':')[0], 10); // Extract hour from time

  initializeDay(dateStr);

  calendarData[dateStr][hour].push({
    title: assignmentTitle,
    className,
    time: dueTime
  });
}
// === MOCK TEST DATA ===
addAssignment({
  dueDate: new Date().toISOString().split("T")[0], // today's date in 'YYYY-MM-DD'
  dueTime: "14:00",
  className: "Biology",
  assignmentTitle: "Photosynthesis Worksheet"
});

addAssignment({
  dueDate: new Date().toISOString().split("T")[0], // today
  dueTime: "10:00",
  className: "Math",
  assignmentTitle: "Algebra Quiz"
});

// Force re-render to show them
animate();
