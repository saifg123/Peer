const monthYearEl = document.getElementById("month-year");
const calendarGrid = document.querySelector(".calendar-grid");

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

let currentDate = new Date();

function renderCalendar(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDay = firstDayOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = lastDayOfMonth.getDate();

  // Set header
  monthYearEl.textContent = `${MONTH_NAMES[month]} ${year}`;

  // Clear previous days (but keep weekday headers)
  const existingDays = calendarGrid.querySelectorAll(".day");
  existingDays.forEach(day => day.remove());

  // Optional: padding days from previous month
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    const pad = document.createElement("div");
    pad.className = "day disabled";
    pad.innerHTML = `<span class="date">${prevMonthDays - i}</span>`;
    calendarGrid.appendChild(pad);
  }

  // Days in current month
  for (let i = 1; i <= daysInMonth; i++) {
    const dayEl = document.createElement("div");
    dayEl.className = "day";
    dayEl.innerHTML = `<span class="date">${i}</span>`;
    calendarGrid.appendChild(dayEl);
  }

  // Optional: padding days for next month to fill the last week
  const totalCells = startDay + daysInMonth;
  const remaining = 7 - (totalCells % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      const pad = document.createElement("div");
      pad.className = "day disabled";
      pad.innerHTML = `<span class="date">${i}</span>`;
      calendarGrid.appendChild(pad);
    }
  }
}

document.getElementById("prev-month").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar(currentDate);
});

document.getElementById("next-month").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(currentDate);
});

// View switching (still basic)
document.querySelectorAll('.view-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const view = btn.getAttribute('data-view');
    alert(`Switching to ${view} view (not implemented yet)`);
  });
});

renderCalendar(currentDate);
