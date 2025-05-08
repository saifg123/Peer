const calendar = document.getElementById("calendar");
const viewLabel = document.getElementById("view-label");

const zoomLevels = ["day", "week", "month", "quarter", "semester", "year"];
let currentIndex = 1; // Start at "week"
let currentDate = new Date();

// Zoom buttons
document.getElementById("zoom-in").addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    console.log("Zoomed in to:", zoomLevels[currentIndex]);
    renderView();
  }
});

document.getElementById("zoom-out").addEventListener("click", () => {
  if (currentIndex < zoomLevels.length - 1) {
    currentIndex++;
    console.log("Zoomed out to:", zoomLevels[currentIndex]);
    renderView();
  }
});

// Scroll-to-zoom (debounced)
let scrollTimeout = null;

calendar.addEventListener("wheel", (e) => {
  e.preventDefault();
  if (scrollTimeout) return;

  scrollTimeout = setTimeout(() => scrollTimeout = null, 400);

  if (e.deltaY < 0 && currentIndex > 0) {
    currentIndex--;
    console.log("Scroll zoom in:", zoomLevels[currentIndex]);
    renderView();
  } else if (e.deltaY > 0 && currentIndex < zoomLevels.length - 1) {
    currentIndex++;
    console.log("Scroll zoom out:", zoomLevels[currentIndex]);
    renderView();
  }
}, { passive: false });

// Main render switch
function renderView() {
  const view = zoomLevels[currentIndex];
  viewLabel.textContent = capitalize(view);
  calendar.innerHTML = "";

  switch (view) {
    case "day":
      renderDay();
      break;
    case "week":
      renderWeek();
      break;
    case "month":
      renderMonth();
      break;
    case "quarter":
      renderQuarter();
      break;
    case "semester":
      renderSemester();
      break;
    case "year":
      renderYear();
      break;
  }
}

// Day View
function renderDay() {
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  let html = `<div class="day-grid">`;
  for (let hour of hours) {
    html += `<div class="hour-cell"><span>${hour}</span></div>`;
  }
  html += `</div>`;
  calendar.innerHTML = html;
}

// Week View
function renderWeek() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  let html = `<div class="week-grid">
    <div class="week-labels">`;
  for (let day of days) {
    html += `<div class="week-label">${day}</div>`;
  }
  html += `</div>`;

  for (let hour = 0; hour < 24; hour++) {
    html += `<div class="week-row">`;
    for (let i = 0; i < 7; i++) {
      html += `<div class="week-cell"> </div>`;
    }
    html += `</div>`;
  }

  html += `</div>`;
  calendar.innerHTML = html;
}

// Month View
function renderMonth() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let html = `<div class="month-grid">
    <div class="month-labels">`;
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
  calendar.innerHTML = html;
}

// Placeholder Views
function renderQuarter() {
  const startMonth = Math.floor(currentDate.getMonth() / 3) * 3;
  const start = new Date(currentDate.getFullYear(), startMonth, 1);
  calendar.innerHTML = `<h2 style="padding: 20px;">Quarter starting ${start.toLocaleDateString()}</h2>`;
}

function renderSemester() {
  const month = currentDate.getMonth();
  const start = new Date(currentDate.getFullYear(), month < 5 ? 0 : 5, 1);
  calendar.innerHTML = `<h2 style="padding: 20px;">Semester starting ${start.toLocaleDateString()}</h2>`;
}

function renderYear() {
  const start = new Date(currentDate.getFullYear(), 7, 1); // August
  calendar.innerHTML = `<h2 style="padding: 20px;">School Year starting ${start.toLocaleDateString()}</h2>`;
}

// Helper
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// First render
renderView();
