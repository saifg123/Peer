// script.js

let zoomLevels = ["day", "week", "month", "quarter", "semester", "year"];
let currentZoom = 5; // start at year
let currentDate = new Date();
const calendar = document.getElementById("calendar");
const viewLabel = document.getElementById("view-label");

function renderCalendar() {
  const zoom = zoomLevels[currentZoom];
  viewLabel.textContent = zoom.charAt(0).toUpperCase() + zoom.slice(1);
  switch (zoom) {
    case "day":
      calendar.innerHTML = renderDay();
      break;
    case "week":
      calendar.innerHTML = renderWeek();
      break;
    case "month":
      calendar.innerHTML = renderMonth();
      break;
    case "quarter":
      calendar.innerHTML = renderQuarter();
      break;
    case "semester":
      calendar.innerHTML = renderSemester();
      break;
    case "year":
      calendar.innerHTML = renderYear();
      break;
  }
}

function renderDay() {
  return `<div class="day-view">${currentDate.toDateString()}</div>`;
}

function renderWeek() {
  let start = new Date(currentDate);
  start.setDate(currentDate.getDate() - currentDate.getDay());
  let days = Array.from({ length: 7 }, (_, i) => {
    let d = new Date(start);
    d.setDate(start.getDate() + i);
    return `<div class="day">${d.toDateString()}</div>`;
  }).join("");
  return `<div class="week-grid">${days}</div>`;
}

function renderMonth() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  let html = `<div class="month-grid">`;
  for (let i = 0; i < firstDay; i++) html += `<div class="day empty"></div>`;
  for (let day = 1; day <= daysInMonth; day++) html += `<div class="day">${day}</div>`;
  html += `</div>`;
  return html;
}

function renderQuarter() {
  const startMonth = Math.floor(currentDate.getMonth() / 3) * 3;
  const months = [0, 1, 2].map(i => new Date(currentDate.getFullYear(), startMonth + i, 1));
  return renderMultiMonthGrid(months);
}

function renderSemester() {
  const startMonth = currentDate.getMonth() < 5 ? 0 : 5;
  const months = Array.from({ length: 5 }, (_, i) => new Date(currentDate.getFullYear(), startMonth + i, 1));
  return renderMultiMonthGrid(months);
}

function renderYear() {
  const months = Array.from({ length: 10 }, (_, i) => new Date(currentDate.getFullYear(), i + 7 > 11 ? currentDate.getFullYear() + 1 : currentDate.getFullYear(), (i + 7) % 12, 1));
  const summer = [5, 6, 7].map(i => new Date(currentDate.getFullYear(), i, 1));
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

function changeZoom(direction) {
  currentZoom = Math.min(Math.max(0, currentZoom + direction), zoomLevels.length - 1);
  renderCalendar();
}

function navigate(offset) {
  const zoom = zoomLevels[currentZoom];
  switch (zoom) {
    case "day":
      currentDate.setDate(currentDate.getDate() + offset);
      break;
    case "week":
      currentDate.setDate(currentDate.getDate() + offset * 7);
      break;
    case "month":
      currentDate.setMonth(currentDate.getMonth() + offset);
      break;
    case "quarter":
      currentDate.setMonth(currentDate.getMonth() + offset * 3);
      break;
    case "semester":
      currentDate.setMonth(currentDate.getMonth() + offset * 5);
      break;
    case "year":
      currentDate.setFullYear(currentDate.getFullYear() + offset);
      break;
  }
  renderCalendar();
}

document.getElementById("zoom-in").addEventListener("click", () => changeZoom(1));
document.getElementById("zoom-out").addEventListener("click", () => changeZoom(-1));
document.getElementById("prev").addEventListener("click", () => navigate(-1));
document.getElementById("next").addEventListener("click", () => navigate(1));

let debounceTimer;
document.addEventListener("wheel", e => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (e.deltaY < 0) changeZoom(1);
    else changeZoom(-1);
  }, 100);
}, { passive: true });

renderCalendar();
