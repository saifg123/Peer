const calendar = document.getElementById("calendar");
const viewLabel = document.getElementById("view-label");

const zoomLevels = ["day", "week", "month", "quarter", "semester", "year"];
let currentIndex = 1; // Start on week view
let currentDate = new Date();

// Zoom in/out
document.getElementById("zoom-in").addEventListener("click", () => zoom("in"));
document.getElementById("zoom-out").addEventListener("click", () => zoom("out"));

// Navigate time
document.getElementById("prev").addEventListener("click", () => changeTime(-1));
document.getElementById("next").addEventListener("click", () => changeTime(1));

// Scroll to zoom (debounced)
let scrollTimeout = null;
calendar.addEventListener("wheel", (e) => {
  e.preventDefault();
  if (scrollTimeout) return;
  scrollTimeout = setTimeout(() => (scrollTimeout = null), 400);
  e.deltaY < 0 ? zoom("in") : zoom("out");
}, { passive: false });

function zoom(direction) {
  if (direction === "in" && currentIndex > 0) currentIndex--;
  else if (direction === "out" && currentIndex < zoomLevels.length - 1) currentIndex++;
  animateViewChange();
}

function changeTime(direction) {
  const view = zoomLevels[currentIndex];
  const adjust = (unit, value) => currentDate.setDate(currentDate.getDate() + value);

  switch (view) {
    case "day": adjust("day", 1 * direction); break;
    case "week": adjust("day", 7 * direction); break;
    case "month": currentDate.setMonth(currentDate.getMonth() + 1 * direction); break;
    case "quarter": currentDate.setMonth(currentDate.getMonth() + 3 * direction); break;
    case "semester": currentDate.setMonth(currentDate.getMonth() + 5 * direction); break;
    case "year": currentDate.setMonth(currentDate.getMonth() + 10 * direction); break;
  }

  animateViewChange();
}

function animateViewChange() {
  const viewWrapper = document.createElement("div");
  viewWrapper.className = "calendar-view transitioning";

  const view = zoomLevels[currentIndex];

  // Label the current view with a readable date
  viewLabel.textContent = generateLabel(view, currentDate);

  switch (view) {
    case "day": viewWrapper.innerHTML = renderDay(); break;
    case "week": viewWrapper.innerHTML = renderWeek(); break;
    case "month": viewWrapper.innerHTML = renderMonth(); break;
    case "quarter": viewWrapper.innerHTML = renderQuarter(); break;
    case "semester": viewWrapper.innerHTML = renderSemester(); break;
    case "year": viewWrapper.innerHTML = renderYear(); break;
  }

  calendar.innerHTML = "";
  calendar.appendChild(viewWrapper);
  void viewWrapper.offsetWidth;
  requestAnimationFrame(() => viewWrapper.classList.remove("transitioning"));
}

// ------------------- Render Views -------------------

function renderDay() {
  const label = currentDate.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  let html = `<div class="day-header">${label}</div><div class="day-grid">`;
  for (let i = 0; i < 24; i++) html += `<div class="day-cell">${i}:00</div>`;
  html += `</div>`;
  return html;
}

function renderWeek() {
  const start = new Date(currentDate);
  start.setDate(start.getDate() - start.getDay());
  let html = `<div class="week-grid"><div class="week-labels">`;

  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const label = day.toLocaleDateString(undefined, { weekday: "short", day: "numeric" });
    html += `<div class="week-label">${label}</div>`;
  }
  html += `</div>`;

  for (let hour = 0; hour < 24; hour++) {
    html += `<div class="week-row">`;
    for (let i = 0; i < 7; i++) {
      html += `<div class="week-cell"></div>`;
    }
    html += `</div>`;
  }

  html += `</div>`;
  return html;
}

function renderMonth() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let html = `<div class="month-grid"><div class="month-labels">`;
  for (let d of days) html += `<div class="month-label">${d}</div>`;
  html += `</div>`;

  let day = 1;
  for (let i = 0; i < 6; i++) {
    html += `<div class="month-row">`;
    for (let j = 0; j < 7; j++) {
      if ((i === 0 && j < startDay) || day > daysInMonth) {
        html += `<div class="month-cell empty"></div>`;
      } else {
        html += `<div class="month-cell">${day}</div>`;
        day++;
      }
    }
    html += `</div>`;
  }

  html += `</div>`;
  return html;
}

function renderQuarter() {
    const startMonth = Math.floor(currentDate.getMonth() / 3) * 3;
    const months = [0, 1, 2].map(i => new Date(currentDate.getFullYear(), startMonth + i, 1));
    return renderMultiMonthGrid(months, "Quarter");
  }
  
  function renderSemester() {
    const startMonth = currentDate.getMonth() < 5 ? 0 : 5; // Jan or June
    const months = Array.from({ length: 5 }, (_, i) => new Date(currentDate.getFullYear(), startMonth + i, 1));
    return renderMultiMonthGrid(months, "Semester");
  }
  
  function renderYear() {
    const startMonth = 7; // August
    const months = Array.from({ length: 10 }, (_, i) => new Date(currentDate.getFullYear(), startMonth + i, 1));
    const summer = [5, 6, 7].map(i => new Date(currentDate.getFullYear(), i, 1)); // June–August
    return renderMultiMonthGrid(months, summer);
  }
  
  function renderMultiMonthGrid(months, summerMonths = []) {
    let html = `<div class="multi-month-grid">`;
  
    for (let monthDate of months.concat(summerMonths)) {
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDay = new Date(year, month, 1).getDay();
  
      const isSummer = month >= 5 && month <= 7;
  
      html += `<div class="month-tile ${isSummer ? 'summer' : ''}">`;
      html += `<div class="month-title">${monthDate.toLocaleString(undefined, { month: "long", year: "numeric" })}</div>`;
      html += `<div class="month-weekdays">Sun Mon Tue Wed Thu Fri Sat</div><div class="month-days">`;
  
      for (let i = 0; i < firstDay; i++) html += `<div class="day empty"></div>`;
      for (let day = 1; day <= daysInMonth; day++) html += `<div class="day">${day}</div>`;
  
      html += `</div>`;
  
      // Add stylized flower/grass decoration for summer
      if (isSummer) {
        html += `<div class="summer-decoration">
          <div class="grass"></div>
          <div class="flower flower1"></div>
          <div class="flower flower2"></div>
        </div>`;
      }
  
      html += `</div>`;
    }
  
    html += `</div>`;
    return html;
  }
  
  
    for (let monthDate of months) {
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDay = new Date(year, month, 1).getDay();
  
      html += `<div class="month-tile">`;
      html += `<div class="month-title">${monthDate.toLocaleString(undefined, { month: "long", year: "numeric" })}</div>`;
      html += `<div class="month-weekdays">Sun Mon Tue Wed Thu Fri Sat</div><div class="month-days">`;
  
      for (let i = 0; i < firstDay; i++) html += `<div class="day empty"></div>`;
      for (let day = 1; day <= daysInMonth; day++) html += `<div class="day">${day}</div>`;
  
      html += `</div></div>`;
    }
  
    html += `</div>`;
    return html;
  
  
// ------------------- Helpers -------------------

function generateLabel(view, date) {
  switch (view) {
    case "day":
      return date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    case "week":
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      return `Week of ${weekStart.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}`;
    case "month":
      return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    case "quarter":
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `Q${quarter} ${date.getFullYear()}`;
    case "semester":
      return (date.getMonth() < 5 ? "Spring" : "Fall") + " Semester " + date.getFullYear();
    case "year":
      return `School Year ${date.getFullYear()}–${(date.getFullYear() + 1).toString().slice(2)}`;
  }
}

animateViewChange();
