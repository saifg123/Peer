const calendar = document.getElementById('calendar');
const title = document.getElementById('view-title');
const zoomInBtn = document.getElementById('zoom-in');
const zoomOutBtn = document.getElementById('zoom-out');

const ZOOM_LEVELS = ['year', 'semester', 'quarter', 'month', 'week', 'day'];
let state = {
  zoomLevel: 0, // 0 = year
  currentDate: new Date(2025, 7, 1) // Starting in August 2025
};

function renderCalendar() {
  const level = ZOOM_LEVELS[state.zoomLevel];
  calendar.innerHTML = ''; // Clear previous view

  switch (level) {
    case 'year':
      renderYearView();
      break;
    case 'semester':
      renderSemesterView();
      break;
    case 'quarter':
      renderQuarterView();
      break;
    case 'month':
      renderMonthView();
      break;
    case 'week':
      renderWeekView();
      break;
    case 'day':
      renderDayView();
      break;
  }

  title.textContent = formatTitle(level);
}

function formatTitle(level) {
  const date = state.currentDate;
  const year = date.getFullYear();
  const month = date.getMonth();

  switch (level) {
    case 'year':
      return `Academic Year: Aug ${year} – May ${year + 1}`;
    case 'semester':
      return month < 5 ? `Spring Semester ${year}` : `Fall Semester ${year}`;
    case 'quarter':
      return `Quarter starting ${date.toLocaleDateString()}`;
    case 'month':
      return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    case 'week':
      return `Week of ${date.toLocaleDateString()}`;
    case 'day':
      return date.toDateString();
  }
}

// Sample render functions (just placeholders for now)
function renderYearView() {
  calendar.innerHTML = '<div>Year View (10 months)</div>';
}
function renderSemesterView() {
  calendar.innerHTML = '<div>Semester View (5 months)</div>';
}
function renderQuarterView() {
  calendar.innerHTML = '<div>Quarter View (2.5 months)</div>';
}
function renderMonthView() {
  calendar.innerHTML = '<div>Month View (Calendar Grid)</div>';
}
function renderWeekView() {
  calendar.innerHTML = '<div>Week View (7 days)</div>';
}
function renderDayView() {
  calendar.innerHTML = '<div>Day View (hour breakdown)</div>';
}

// Zoom functionality
zoomInBtn.addEventListener('click', () => {
  if (state.zoomLevel < ZOOM_LEVELS.length - 1) {
    state.zoomLevel++;
    renderCalendar();
  }
});
zoomOutBtn.addEventListener('click', () => {
  if (state.zoomLevel > 0) {
    state.zoomLevel--;
    renderCalendar();
  }
});

renderCalendar();

  