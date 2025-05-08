const calendar = document.getElementById("calendar");
const viewLabel = document.getElementById("view-label");

const zoomLevels = ["day", "week", "month", "quarter", "semester", "year"];
let currentIndex = 1; // Start at "week"
let currentDate = new Date();

document.getElementById("zoom-in").addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    renderView();
  }
});

document.getElementById("zoom-out").addEventListener("click", () => {
  if (currentIndex < zoomLevels.length - 1) {
    currentIndex++;
    renderView();
  }
});

function renderView() {
  const view = zoomLevels[currentIndex];
  viewLabel.textContent = capitalize(view);
  calendar.innerHTML = "";

  switch (view) {
    case "day":
      calendar.innerHTML = `<h2>${currentDate.toDateString()}</h2>`;
      break;
    case "week":
      renderWeek();
      break;
    case "month":
      calendar.innerHTML = `<h2>${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}</h2>`;
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

function renderWeek() {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
  
    let html = `<div class="week-grid"><div class="week-labels">`;
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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
    calendar.innerHTML = html;
  }
  

function renderQuarter() {
  const startMonth = Math.floor(currentDate.getMonth() / 3) * 3;
  const start = new Date(currentDate.getFullYear(), startMonth, 1);
  calendar.innerHTML = `<h2>Quarter starting ${start.toLocaleDateString()}</h2>`;
}

function renderSemester() {
  const month = currentDate.getMonth();
  const start = new Date(currentDate.getFullYear(), month < 5 ? 0 : 5, 1);
  calendar.innerHTML = `<h2>Semester starting ${start.toLocaleDateString()}</h2>`;
}

function renderYear() {
  const start = new Date(currentDate.getFullYear(), 7, 1); // August
  calendar.innerHTML = `<h2>School Year starting ${start.toLocaleDateString()}</h2>`;
}

function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1);
}

// Initial render
renderView();
function renderDay() {
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    let html = `<div class="day-grid">`;
    for (let hour of hours) {
      html += `<div class="hour-cell"><span>${hour}</span></div>`;
    }
    html += `</div>`;
    calendar.innerHTML = html;
  }
  
  function renderMonth() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
  
    let html = `<div class="month-grid">
      <div class="month-labels">`;
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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
  