const calendar = document.getElementById("calendar");
const viewLabel = document.getElementById("view-label");

const zoomLevels = ["day", "week", "month", "quarter", "semester", "year"];
let currentIndex = 1; // Start at week view
let currentDate = new Date();
let hoveredCell = null;

// Track hovered cell
calendar.addEventListener("mouseover", (e) => {
  const cell = e.target.closest(".day-cell, .week-cell, .month-cell");
  hoveredCell = cell || null;
});

// Zoom buttons
document.getElementById("zoom-in").addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    console.log("Zoomed in to:", zoomLevels[currentIndex]);
    if (hoveredCell) console.log("Hovered cell:", hoveredCell.textContent.trim());
    renderView();
  }
});

document.getElementById("zoom-out").addEventListener("click", () => {
  if (currentIndex < zoomLevels.length - 1) {
    currentIndex++;
    console.log("Zoomed out to:", zoomLevels[currentIndex]);
    if (hoveredCell) console.log("Hovered cell:", hoveredCell.textContent.trim());
    renderView();
  }
});

// Scroll to zoom (debounced)
let scrollTimeout = null;
calendar.addEventListener("wheel", (e) => {
  e.preventDefault();
  if (scrollTimeout) return;
  scrollTimeout = setTimeout(() => scrollTimeout = null, 300);

  if (e.deltaY < 0 && currentIndex > 0) {
    currentIndex--;
    console.log("Scroll zoom in to:", zoomLevels[currentIndex]);
    if (hoveredCell) console.log("Hovered cell:", hoveredCell.textContent.trim());
    renderView();
  } else if (e.deltaY > 0 && currentIndex < zoomLevels.length - 1) {
    currentIndex++;
    console.log("Scroll zoom out to:", zoomLevels[currentIndex]);
    if (hoveredCell) console.log("Hovered cell:", hoveredCell.textContent.trim());
    renderView();
  }
}, { passive: false });

// Main render function
function renderView() {
  const view = zoomLevels[currentIndex];
  viewLabel.textContent = capitalize(view);

  const viewWrapper = document.createElement("div");
  viewWrapper.className = "calendar-view transitioning";

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

  requestAnimationFrame(() => {
    viewWrapper.classList.remove("transitioning");
  });
}

// View renderers (return HTML)

function renderDay() {
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  let html = `<div class="day-grid">`;
  for (let hour of hours) {
    html += `<div class="day-cell"><span>${hour}</span></div>`;
  }
  html += `</div>`;
  return html;
}

function renderWeek() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let html = `<div class="week-grid"><div class="week-labels">`;
  for (let day of days) {
    html += `<div class="week-label">${day}</div>`;
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

// Placeholder views
function renderQuarter() {
  const startMonth = Math.floor(currentDate.getMonth() / 3) * 3;
  const start = new Date(currentDate.getFullYear(), startMonth, 1);
  return `<h2 style="padding: 20px;">Quarter starting ${start.toLocaleDateString()}</h2>`;
}

function renderSemester() {
  const month = currentDate.getMonth();
  const start = new Date(currentDate.getFullYear(), month < 5 ? 0 : 5, 1);
  return `<h2 style="padding: 20px;">Semester starting ${start.toLocaleDateString()}</h2>`;
}

function renderYear() {
  const start = new Date(currentDate.getFullYear(), 7, 1); // August
  return `<h2 style="padding: 20px;">School Year starting ${start.toLocaleDateString()}</h2>`;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Initial render
renderView();
