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
  if (v==="week")     currentDate.setDate(currentDate.getDate()+7*dir);
  if (v==="month")    currentDate.setMonth(currentDate.getMonth()+dir);
  if (v==="quarter")  currentDate.setMonth(currentDate.getMonth()+3*dir);
  if (v==="semester") shiftSemester(dir);
  if (v==="year")     shiftYear(dir);
  animate();
}

function shiftSemester(dir){
  // Spring Jan–May (0–4), Fall Sep–Dec (8–11)
  let m = currentDate.getMonth();
  if (m>=0 && m<=4) currentDate.setMonth(m + 5*dir);
  else              currentDate.setMonth(m + (m<=7?1:1)*dir); // jump into next or prev semester block
}
function shiftYear(dir){
  // School year Sept–May
  let y = currentDate.getFullYear() + dir;
  // keep in September–May range by setting to September of that year
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
  requestAnimationFrame(()=>w.classList.remove("transitioning"));
}

function labelFor(v){
  if (v==="day") {
    return currentDate.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"});
  }
  if (v==="week") {
    const s=new Date(currentDate);
    s.setDate(currentDate.getDate()-currentDate.getDay());
    return "Week of "+s.toLocaleDateString(undefined,{month:"long",day:"numeric"});
  }
  if (v==="month")    return currentDate.toLocaleDateString(undefined,{month:"long",year:"numeric"});
  if (v==="quarter")  return `Q${Math.floor(currentDate.getMonth()/3)+1} ${currentDate.getFullYear()}`;
  if (v==="semester") {
    const m=currentDate.getMonth();
    return m<=4
      ? "Spring Semester " + currentDate.getFullYear()
      : "Fall Semester " + currentDate.getFullYear();
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
  let h=`<div class="day-header">${labelFor("day")}</div><div class="day-grid">`;
  for(let i=0;i<24;i++) h+=`<div class="day-cell"><span>${i}:00</span></div>`;
  return h+`</div>`;
}

function renderWeek(){
  const start=new Date(currentDate);
  start.setDate(currentDate.getDate()-start.getDay());
  let h=`<div class="week-grid"><div class="week-labels">`;
  for(let i=0;i<7;i++){
    const d=new Date(start); d.setDate(start.getDate()+i);
    h+=`<div class="week-label">${d.toLocaleDateString(undefined,{weekday:"short",day:"numeric"})}</div>`;
  }
  h+=`</div>`;
  for(let r=0;r<24;r++){
    h+=`<div class="week-row">`+`<div class="week-cell"></div>`.repeat(7)+`</div>`;
  }
  return h+`</div>`;
}

function renderMonthGrid(){
  const y=currentDate.getFullYear(), m=currentDate.getMonth();
  const firstDay=new Date(y,m,1).getDay(), total=new Date(y,m+1,0).getDate();
  let h=`<div class="month-grid"><div class="month-labels">`;
  ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(d=>h+=`<div class="month-label">${d}</div>`);
  h+=`</div>`;
  let d=1;
  for(let row=0;row<6;row++){
    for(let col=0;col<7;col++){
      if((row===0&&col<firstDay)||d>total) h+=`<div class="month-cell empty"></div>`;
      else { h+=`<div class="month-cell">${d}</div>`; d++; }
    }
  }
  return h+`</div>`;
}

function getMonths(count){
  const start=new Date(currentDate.getFullYear(),currentDate.getMonth(),1);
  return Array.from({length:count},(_,i)=>new Date(start.getFullYear(),start.getMonth()+i,1));
}

function getSemesterMonths(){
  const year=currentDate.getFullYear();
  if(currentDate.getMonth()<=4){
    // Spring Jan–May
    return Array.from({length:5},(_,i)=>new Date(year, i, 1));
  } else {
    // Fall Sep–Dec
    return Array.from({length:4},(_,i)=>new Date(year, 8+i, 1));
  }
}

function getSchoolYearMonths(){
  const y=currentDate.getMonth()>=8 ? currentDate.getFullYear() : currentDate.getFullYear()-1;
  // Sept–Dec then Jan–May
  const arr = Array.from({length:4},(_,i)=>new Date(y,8+i,1))
    .concat(Array.from({length:5},(_,i)=>new Date(y+1, i,1)));
  return arr;
}

function renderMulti(months){
  let html=`<div class="multi-month-grid">`;
  months.forEach(md=>{
    const y=md.getFullYear(), m=md.getMonth();
    const total=new Date(y,m+1,0).getDate(),
          fd=new Date(y,m,1).getDay();
    html+=`<div class="month-tile"><div class="month-title">${
      md.toLocaleString(undefined,{month:"long",year:"numeric"})
    }</div>
    <div class="month-weekdays">${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
      .map(d=>`<div>${d}</div>`).join("")}</div>
    <div class="month-days">`;
    for(let i=0;i<fd;i++) html+=`<div class="day empty"></div>`;
    for(let d=1;d<=total;d++) html+=`<div class="day">${d}</div>`;
    html+=`</div></div>`;
  });
  return html+`</div>`;
}

// initial render
animate();
