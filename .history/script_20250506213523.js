function renderSemesterView(year) {
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
  