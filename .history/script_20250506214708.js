const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];
  
  let currentMonth = new Date().getMonth(); // Current month (0-11)
  let currentYear = new Date().getFullYear(); // Current year
  
  // Initialize the calendar view
  document.addEventListener("DOMContentLoaded", function() {
    renderMonthView(currentYear, currentMonth);
    renderSemesterView(currentYear);
    renderWeeklyView(currentYear, currentMonth, 1); // Show first week by default
    renderBiweeklyView(currentYear, currentMonth); // Show the first two weeks by default
  
    // Add event listeners for prev/next month buttons
    document.getElementById('prev-month').addEventListener('click', () => {
      currentMonth = (currentMonth === 0) ? 11 : currentMonth - 1;
      if (currentMonth === 11) currentYear--;
      updateView(currentYear, currentMonth);
    });
  
    document.getElementById('next-month').addEventListener('click', () => {
      currentMonth = (currentMonth === 11) ? 0 : currentMonth + 1;
      if (currentMonth === 0) currentYear++;
      updateView(currentYear, currentMonth);
    });
  
    // Add event listeners for view buttons
    document.querySelectorAll('.view-btn').forEach(button => {
      button.addEventListener('click', (event) => {
        const view = event.target.getAttribute('data-view');
        // Hide all views
        document.querySelectorAll('.calendar-grid, .week-view, .biweekly-view, .semester-view').forEach(view => {
          view.style.display = 'none';
        });
        // Show selected view
        if (view === 'month') {
          document.getElementById('month-view').style.display = 'grid';
          renderMonthView(currentYear, currentMonth);
        } else if (view === 'semester') {
          document.getElementById('semester-view').style.display = 'block';
          renderSemesterView(currentYear);
        } else if (view === 'week') {
          document.getElementById('week-view').style.display = 'block';
          renderWeeklyView(currentYear, currentMonth, 1);
        } else if (view === 'biweekly') {
          document.getElementById('biweekly-view').style.display = 'block';
          renderBiweeklyView(currentYear, currentMonth);
        }
  
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
      });
    });
  });
  
  // Update the calendar view after month/year change
  function updateView(year, month) {
    document.getElementById('month-year').textContent = `${MONTH_NAMES[month]} ${year}`;
    // Render the current view based on the active button
    const activeView = document.querySelector('.view-btn.active').getAttribute('data-view');
    if (activeView === 'month') {
      renderMonthView(year, month);
    } else if (activeView === 'semester') {
      renderSemesterView(year);
    } else if (activeView === 'week') {
      renderWeeklyView(year, month, 1);
    } else if (activeView === 'biweekly') {
      renderBiweeklyView(year, month);
    }
  }
  
  // Render Month View
  function renderMonthView(year, month) {
    const calendarGrid = document.getElementById('month-view');
    calendarGrid.innerHTML = ''; // Clear previous calendar
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();
    
    // Add the day names (Sun-Sat)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
      const dayNameEl = document.createElement('div');
      dayNameEl.className = 'day-name';
      dayNameEl.innerText = day;
      calendarGrid.appendChild(dayNameEl);
    });
  
    // Add blank days for the first row
    for (let i = 0; i < firstDayOfWeek; i++) {
      const blankDay = document.createElement('div');
      blankDay.className = 'day disabled';
      calendarGrid.appendChild(blankDay);
    }
  
    // Add the actual days of the month
    for (let day = 1; day <= totalDays; day++) {
      const dayEl = document.createElement('div');
      dayEl.className = 'day';
      dayEl.innerHTML = `<span class="date">${day}</span>`;
      calendarGrid.appendChild(dayEl);
    }
  
    // Add the remaining blank days for the last row
    const remainingDays = (totalDays + firstDayOfWeek) % 7;
    for (let i = 0; i < (7 - remainingDays) % 7; i++) {
      const blankDay = document.createElement('div');
      blankDay.className = 'day disabled';
      calendarGrid.appendChild(blankDay);
    }
  }
  
  // Render Semester View
  function renderSemesterView(year) {
    const semesterGrid = document.getElementById('semester-view');
    semesterGrid.innerHTML = ""; // Clear the grid before rendering new content
    const monthsInSemester = [7, 8, 9, 10, 11, 12]; // Aug-Dec (semester)
    
    monthsInSemester.forEach(monthNum => {
      const miniCalendar = document.createElement("div");
      miniCalendar.className = "mini-calendar";
  
      const monthDate = new Date(year, monthNum - 1, 1);
      const daysInMonth = new Date(year, monthNum, 0).getDate();
      const firstDayOfMonth = new Date(year, monthNum - 1, 1).getDay();
  
      let daysToRender = [];
  
      const prevMonthDays = new Date(year, monthNum - 1, 0).getDate();
      for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        daysToRender.push({ day: prevMonthDays - i, isCurrentMonth: false });
      }
  
      // Current month days
      for (let i = 1; i <= daysInMonth; i++) {
        daysToRender.push({ day: i, isCurrentMonth: true });
      }
  
      // Next month's padding (if necessary)
      const totalCells = daysToRender.length;
      const remaining = (7 - (totalCells % 7)) % 7;
      for (let i = 1; i <= remaining; i++) {
        daysToRender.push({ day: i, isCurrentMonth: false });
      }
  
      miniCalendar.innerHTML = `
        <div class="calendar-header">
          <span>${MONTH_NAMES[monthNum - 1]}</span>
        </div>
        <div class="calendar-grid">
          <div class="day-name">Sun</div>
          <div class="day-name">Mon</div>
          <div class="day-name">Tue</div>
          <div class="day-name">Wed</div>
          <div class="day-name">Thu</div>
          <div class="day-name">Fri</div>
          <div class="day-name">Sat</div>
        </div>
      `;
  
      daysToRender.forEach(obj => {
        const dayEl = document.createElement("div");
        dayEl.className = "day";
        if (!obj.isCurrentMonth) dayEl.classList.add("disabled");
        dayEl.innerHTML = `<span class="date">${obj.day}</span>`;
        miniCalendar.querySelector(".calendar-grid").appendChild(dayEl);
      });
  
      semesterGrid.appendChild(miniCalendar);
    });
  }
  
  // Render Weekly View (first week of the month)
  function renderWeeklyView(year, month, weekNumber) {
    const weekGrid = document.getElementById('week-view');
    weekGrid.innerHTML = ''; // Clear the previous week view
    
    const firstDayOfMonth = new Date(year, month, 1);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const startDay = (weekNumber - 1) * 7 - firstDayOfWeek + 1;
    const endDay = startDay + 6;
  
    for (let day = startDay; day <= endDay; day++) {
      if (day > 0 && day <= daysInMonth) {
        const dayEl = document.createElement('div');
        dayEl.className = 'day';
        dayEl.innerHTML = `<span class="date">${day}</span>`;
        weekGrid.appendChild(dayEl);
      }
    }
  }
  
  // Render Bi-Weekly View (first two weeks of the month)
  function renderBiweeklyView(year, month) {
    const biweeklyGrid = document.getElementById('biweekly-view');
    biweeklyGrid.innerHTML = ''; // Clear the previous bi-weekly view
    
    const firstDayOfMonth = new Date(year, month, 1);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let dayCounter = 1;
    
    // First Week
    const firstWeek = document.createElement('div');
    firstWeek.className = 'biweekly-week';
    
    for (let i = 0; i < 7; i++) {
      if (dayCounter <= daysInMonth) {
        const dayEl = document.createElement('div');
        dayEl.className = 'day';
        dayEl.innerHTML = `<span class="date">${dayCounter}</span>`;
        firstWeek.appendChild(dayEl);
        dayCounter++;
      }
    }
    
    biweeklyGrid.appendChild(firstWeek);
  
    // Second Week
    const secondWeek = document.createElement('div');
    secondWeek.className = 'biweekly-week';
    
    for (let i = 0; i < 7; i++) {
      if (dayCounter <= daysInMonth) {
        const dayEl = document.createElement('div');
        dayEl.className = 'day';
        dayEl.innerHTML = `<span class="date">${dayCounter}</span>`;
        secondWeek.appendChild(dayEl);
        dayCounter++;
      }
    }
    
    biweeklyGrid.appendChild(secondWeek);
  }
  
  