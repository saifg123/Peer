const monthYearEl = document.getElementById("month-year");
const calendarGrid = document.querySelector(".calendar-grid");

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

let currentDate = new Date();
let currentView = 'month';

function renderCalendar(date, view = 'month') {
  calendarGrid.innerHTML = `
    <div class="day-name">Sun</div>
    <div class="day-name">Mon</div>
    <div class="day-name">Tue</div>
    <div class="day-name">Wed</div>
    <div class="day-name">Thu</div>
    <div class="day-name">Fri</div>
    <div class="day-name">Sat</div>
  `;

  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let daysToRender = [];

  if (view === 'month') {
    const startDay = firstDayOfMonth.getDay();
    const prevMonthDays = new Date(year, month, 0).getDate();

    // Previous month's padding
    for (let i = startDay - 1; i >= 0; i--) {
      daysToRender.push({ day: prevMonthDays - i, isCurrentMonth: false });
    }

    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      daysToRender.push({ day: i, isCurrentMonth: true });
    }

    // Next month's padding
    const totalCells = daysToRender.length;
    const remaining = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      daysToRender.push({ day: i, isCurrentMonth: false });
    }

  } else if (view === 'week' || view === 'biweekly') {
    const daysToShow = view === 'week' ? 7 : 14;
    let start = new Date(date);
    start.setDate(date.getDate() - start.getDay()); // go back to Sunday

    for (let i = 0; i < daysToShow; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      daysToRender.push({
        day: d.getDate(),
        isCurrentMonth: d.getMonth() === month,
        fullDate: d
      });
    }

  } else if (view === 'semester') {
    calendarGrid.innerHTML = `
      <div class="semester-message">
        <p>Semester View (Preview)</p>
        <p>August – December ${year}</p>
      </div>
    `;
    monthYearEl.textContent = `Semester View`;
    return;
  }

  // Set header
  if (view !== 'semester') {
    monthYearEl.textContent = `${MONTH_NAMES[month]} ${year}`;
  }

  // Render days
  daysToRender.forEach(obj => {
    const dayEl = document.createElement("div");
    dayEl.className = "day";
    if (!obj.isCurrentMonth) dayEl.classList.add("disabled");
    dayEl.innerHTML = `<span class="date">${obj.day}</span>`;
    calendarGrid.appendChild(dayEl);
  });
}

// Month navigation
document.getElementById("prev-month").addEventListener("click", () => {
  if (currentView === 'month') currentDate.setMonth(currentDate.getMonth() - 1);
  else currentDate.setDate(currentDate.getDate() - 7);
  renderCalendar(currentDate, currentView);
});

document.getElementById("next-month").addEventListener("click", () => {
  if (currentView === 'month') currentDate.setMonth(currentDate.getMonth() + 1);
  else currentDate.setDate(currentDate.getDate() + 7);
  renderCalendar(currentDate, currentView);
});

// View switching
document.querySelectorAll('.view-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentView = btn.getAttribute('data-view');
    renderCalendar(currentDate, currentView);
  });
});

renderCalendar(currentDate, currentView);
