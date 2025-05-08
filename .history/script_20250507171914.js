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
  let html = `<h2>Week of ${start.toDateString()}</h2><ul>`;
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    html += `<li>${day.toDateString()}</li>`;
  }
  html += "</ul>";
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

