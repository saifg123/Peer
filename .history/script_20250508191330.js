const calendarEl = document.getElementById("calendar");
const viewLabel   = document.getElementById("view-label");
const zoomLevels  = ["day","week","month","quarter","semester","year"];
let currentIndex  = 2;           // start at month
let currentDate   = new Date();
let scrollDebounce;

// Controls
document.getElementById("zoom-in").onclick  = () => zoom(-1);
document.getElementById("zoom-out").onclick = () => zoom( 1);
document.getElementById("prev").onclick     = () => shift(-1);
document.getElementById("next").onclick     = () => shift( 1);

// Wheel-to-zoom
calendarEl.addEventListener("wheel", e=>{
  e.preventDefault();
  if (scrollDebounce) return;
  scrollDebounce = setTimeout(()=>scrollDebounce=null,300);
  zoom(e.deltaY>0?1:-1);
},{passive:false});

function zoom(dir){
  currentIndex = Math.min(zoomLevels.length-1, Math.max(0, currentIndex+dir));
  animate();
}

function shift(dir){
  const v = zoomLevels[currentIndex];
  if (v==="day")      currentDate.setDate(currentDate.getDate()+dir);
  else if (v==="week")     currentDate.setDate(currentDate.getDate()+7*dir);
  else if (v==="month")    currentDate.setMonth(currentDate.getMonth()+dir);
  else if (v==="quarter")  currentDate.setMonth(currentDate.getMonth()+3*dir);
  else if (v==="semester") shiftSemester(dir);
  else if (v==="year")     shiftYear(dir);
  animate();
}

function shiftSemester(dir){
  let y = currentDate.getFullYear();
  let m = currentDate.getMonth();
  // Determine current semester by month
  if (m >= 0 && m <= 4) {
    // Currently in Spring (Jan–May)
    if (dir > 0) {
      // Go to Fall same year
      currentDate = new Date(y, 8, 1);
    } else {
      // Go to Fall previous year
      currentDate = new Date(y - 1, 8, 1);
    }
  } else {
    // Currently in Fall (Sep–Dec) or summer region treat as fall
    if (dir > 0) {
      // Go to Spring next year
      currentDate = new Date(y + 1, 0, 1);
    } else {
      // Go to Spring same year
      currentDate = new Date(y, 0, 1);
    }
  }
}

function shiftYear(dir){
  // School year labelled Sep–May: shift entire year by one
  let y = currentDate.getFullYear() + dir;
  // Jump to September of that year
  currentDate = new Date(y, 8, 1);
}

function animate(){
  const w = document.createElement("div");
  w.className = "calendar-view transitioning";
  viewLabel.textContent = labelFor(zoomLevels[currentIndex]);
  w.innerHTML = renderView(zoomLevels[currentIndex]);
  calendarEl.innerHTML = "";
  calendarEl.append(w);
  void w.offsetWidth;
  requestAnimationFrame(() => w.classList.remove("transitioning"));
}

function labelFor(v){
  if (v==="day") {
    return currentDate.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"});
  }
  if (v==="week") {
    const s = new Date(currentDate);
    s.setDate(currentDate.getDate() - currentDate.getDay());
    return "Week of " + s.toLocaleDateString(undefined,{month:"long",day:"numeric"});
  }
  if (v==="month")    return currentDate.toLocaleDateString(undefined,{month:"long",year:"numeric"});
  if (v==="quarter")  return `Q${Math.floor(currentDate.getMonth()/3)+1} ${currentDate.getFullYear()}`;
  if (v==="semester") {
    const m = currentDate.getMonth();
    return (m <= 4 ? "Spring Semester " : "Fall Semester ") + currentDate.getFullYear();
  }
  return `School Year ${currentDate.getFullYear()}–${(currentDate.getFullYear()+1+"").slice(-2)}`;
}

function renderView(v){
  if (v==="day")      return renderDay();
  if (v==="week")     return renderWeek();
  if (v==="month")    return renderMonthGrid();
  if (v==="quarter")  return renderMulti(getMonths(3));
  if (v==="semester") return renderMulti(getSemesterMonths());
  if (v==="year")     return renderMulti(getSchoolYearMonths());
}

function renderDay(){
  let h = `<div class="day-header">${labelFor("day")}</div><div class="day-grid">`;
  for(let i=0;i<24;i++){
    h += `<div class="day-cell"><span>${i}:00</span></div>`;
  }
  return h + `</div>`;
}

function renderWeek(){
  const start = new Date(currentDate);
  start.setDate(start.getDate() - start.getDay());
  let h = `<div class="week-grid"><div class="week-labels">`;
  for(let i=0;i<7;i++){
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    h += `<div class="week-label">${d.toLocaleDateString(undefined,{weekday:"short",day:"numeric"})}</div>`;
  }
  h += `</div>`;
  for(let r=0;r<24;r++){
    h += `<div class="week-row">` + `<div class="week-cell"></div>`.repeat(7) + `</div>`;
  }
  return h + `</div>`;
}

function renderMonthGrid(){
  const y = currentDate.getFullYear(), m = currentDate.getMonth();
  const firstDay = new Date(y,m,1).getDay(), total = new Date(y,m+1,0).getDate();
  let h = `<div class="month-grid"><div class="month-labels">`;
  ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(d=>h+=`<div class="month-label">${d}</div>`);
  h += `</div>`;
  let d=1;
  for(let row=0;row<6;row++){
    for(let col=0;col<7;col++){
      if((row===0&&col<firstDay)||d>total){
        h += `<div class="month-cell empty"></div>`;
      } else {
        h += `<div class="month-cell">${d}</div>`;
        d++;
      }
    }
  }
  return h + `</div>`;
}

function getMonths(count){
  const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  return Array.from({length:count}, (_,i) =>
    new Date(start.getFullYear(), start.getMonth()+i, 1)
  );
}

function getSemesterMonths(){
  const y = currentDate.getFullYear();
  if (currentDate.getMonth() <= 4) {
    return Array.from({length:5}, (_,i)=> new Date(y, i, 1));        // Jan–May
  } else {
    return Array.from({length:4}, (_,i)=> new Date(y, 8+i, 1));     // Sep–Dec
  }
}

function getSchoolYearMonths(){
  const y = currentDate.getMonth() >= 8 ? currentDate.getFullYear() : currentDate.getFullYear()-1;
  const fall = Array.from({length:4}, (_,i)=> new Date(y, 8+i, 1));  // Sep–Dec
  const spring = Array.from({length:5}, (_,i)=> new Date(y+1, i, 1)); // Jan–May
  return fall.concat(spring);
}

function renderMulti(months){
    const highlights = [
      { month: 10, day: 5 },  // Nov 5
      { month: 0,  day: 23 }, // Jan 23
      { month: 2,  day: 28 }, // Mar 28
      { month: 5,  day: 4 }   // Jun 4
    ];
  
    let html = `<div class="multi-month-grid">`;
    months.forEach(md=>{
      const y = md.getFullYear(), m = md.getMonth();
      const total = new Date(y, m + 1, 0).getDate();
      const fd = new Date(y, m, 1).getDay();
  
      html += `<div class="month-tile">
        <div class="month-title">${md.toLocaleString(undefined, {month:"long", year:"numeric"})}</div>
        <div class="month-weekdays">${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
          .map(d => `<div>${d}</div>`).join("")}</div>
        <div class="month-days">`;
  
      for (let i = 0; i < fd; i++) html += `<div class="day empty"></div>`;
      for (let dd = 1; dd <= total; dd++) {
        const isHighlight = highlights.some(h => h.month === m && h.day === dd);
        html += `<div class="day${isHighlight ? " highlight" : ""}">${dd}</div>`;
      }
  
      html += `</div></div>`;
    });
  
    return html + `</div>`;
  }
  

// initial render
animate();
