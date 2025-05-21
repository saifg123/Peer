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
  else if (v==="quarter")  shiftQuarter(dir);
  else if (v==="semester") shiftSemester(dir);
  else if (v==="year")     shiftYear(dir);
  animate();
}

// Academic quarter shift (Q1=Sep–Nov, Q2=Nov–Jan, Q3=Jan–Mar, Q4=Mar–Jun)
function shiftQuarter(dir){
  const m = currentDate.getMonth(), y = currentDate.getFullYear();
  // Determine current quarter index (0-3)
  const quarterMap = [
    { start: 8 },   // Q1: Sep(8)–Nov(10)
    { start: 10 },  // Q2: Nov(10)–Jan(0)
    { start: 0 },   // Q3: Jan(0)–Mar(2)
    { start: 2 }    // Q4: Mar(2)–Jun(5)
  ];
  // find q such that currentMonth in [start…nextStart) mod 12
  let q = quarterMap.findIndex((q,i)=>{
    const s = q.start, e = quarterMap[(i+1)%4].start;
    if (s < e) return m >= s && m < e;
    return m >= s || m < e;
  });
  if (q < 0) q = 0;
  let newQ = (q + dir + 4) % 4;
  let newYear = y + Math.floor((quarterMap[q].start + dir*3) / 12);
  currentDate = new Date(newYear, quarterMap[newQ].start, 1);
}

function shiftSemester(dir){
  const y = currentDate.getFullYear(), m = currentDate.getMonth();
  if (m <= 4) { // Spring Jan–May
    currentDate = dir>0
      ? new Date(y, 8, 1)      // to Fall same year
      : new Date(y-1, 8, 1);   // to Fall prev year
  } else {      // Fall Sep–Dec
    currentDate = dir>0
      ? new Date(y+1, 0, 1)    // to Spring next year
      : new Date(y, 0, 1);     // to Spring same year
  }
}

function shiftYear(dir){
  const y = currentDate.getFullYear() + dir;
  currentDate = new Date(y, 8, 1); // always September 1
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
    return currentDate.toLocaleDateString(undefined,
      {weekday:"long",month:"long",day:"numeric"});
  }
  if (v==="week") {
    const s=new Date(currentDate);
    s.setDate(currentDate.getDate()-currentDate.getDay());
    return "Week of "+s.toLocaleDateString(undefined,
      {month:"long",day:"numeric"});
  }
  if (v==="month")    return currentDate.toLocaleDateString(undefined,
                          {month:"long",year:"numeric"});
  if (v==="quarter")  return `Q${Math.floor(((currentDate.getMonth()+4)%12)/3)+1}`
                           + ` ${currentDate.getFullYear()}`;
  if (v==="semester") {
    const m=currentDate.getMonth();
    return (m<=4?"Spring Semester ":"Fall Semester ")
           + currentDate.getFullYear();
  }
  return `School Year ${currentDate.getFullYear()}–`
       + `${(currentDate.getFullYear()+1+"").slice(-2)}`;
}

function renderView(v){
  if (v==="day")      return renderDay();
  if (v==="week")     return renderWeek();
  if (v==="month")    return renderMonthGrid();
  if (v==="quarter")  return renderMulti(getQuarterMonths());
  if (v==="semester") return renderMulti(getSemesterMonths());
  return renderMulti(getSchoolYearMonths());
}

function renderDay(){
  let s = `<div class="day-header">${labelFor("day")}</div><div class="day-grid">`;
  for(let i=0;i<24;i++) s+=`<div class="day-cell"><span>${i}:00</span></div>`;
  return s+`</div>`;
}

function renderWeek(){
  const st=new Date(currentDate);
  st.setDate(st.getDate()-st.getDay());
  let s=`<div class="week-grid"><div class="week-labels">`;
  for(let i=0;i<7;i++){
    const d=new Date(st); d.setDate(st.getDate()+i);
    s+=`<div class="week-label">${d.toLocaleDateString(undefined,
       {weekday:"short",day:"numeric"})}</div>`;
  }
  s+=`</div>`;
  for(let r=0;r<24;r++){
    s+=`<div class="week-row">`+`<div class="week-cell"></div>`.repeat(7)+`</div>`;
  }
  return s+`</div>`;
}

function renderMonthGrid(){
  const y=currentDate.getFullYear(), m=currentDate.getMonth();
  const fd=new Date(y,m,1).getDay(), tot=new Date(y,m+1,0).getDate();
  let s=`<div class="month-grid"><div class="month-labels">`;
  ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(d=>s+=`<div class="month-label">${d}</div>`);
  s+=`</div>`;
  let d=1;
  for(let row=0;row<6;row++){
    for(let col=0;col<7;col++){
      if((row===0&&col<fd)||d>tot) s+=`<div class="month-cell empty"></div>`;
      else { s+=`<div class="month-cell">${d}</div>`; d++; }
    }
  }
  return s+`</div>`;
}

// computes quarter months in academic cycle
function getQuarterMonths(){
  const m=currentDate.getMonth(), y=currentDate.getFullYear();
  // academic quarters start at Sep(8), Dec(11), Mar(2), Jun(5)
  const starts=[8,11,2,5];
  // find current academic quarter index
  const q=starts.findIndex((st,i)=>{
    const end=starts[(i+1)%4];
    if(st<end) return m>=st && m<end;
    return m>=st || m<end;
  }) || 0;
  const start=starts[q];
  // year adjustment for months < start
  const baseYear = (start>m) ? y-1 : y;
  return Array.from({length:3},(_,i)=> new Date(baseYear, (start+i*1)%12,1));
}

function getSemesterMonths(){
  const m=currentDate.getMonth(), y=currentDate.getFullYear();
  if(m<=4){
    return Array.from({length:5},(_,i)=> new Date(y, i,1));       // Jan–May
  } else {
    return Array.from({length:4},(_,i)=> new Date(y, 8+i,1));     // Sep–Dec
  }
}

function getSchoolYearMonths(){
  const m=currentDate.getMonth(), y=currentDate.getFullYear();
  const startYear = (m>=8)? y : y-1;
  const fall   = Array.from({length:4},(_,i)=> new Date(startYear,8+i,1));
  const spring = Array.from({length:5},(_,i)=> new Date(startYear+1, i,1));
  return fall.concat(spring);
}

function renderMulti(months){
  const highlights = [
    {month:10,day:5},   // Nov 5
    {month:0, day:23},  // Jan 23
    {month:2, day:28},  // Mar 28
    {month:5, day:4}    // Jun 4
  ];
  let html=`<div class="multi-month-grid">`;
  months.forEach(md=>{
    const y=md.getFullYear(), m=md.getMonth();
    const tot=new Date(y,m+1,0).getDate(), fd=new Date(y,m,1).getDay();
    html+=`<div class="month-tile"><div class="month-title">${
      md.toLocaleString(undefined,{month:"long",year:"numeric"})
    }</div><div class="month-weekdays">${
      ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
      .map(d=>`<div>${d}</div>`).join("")
    }</div><div class="month-days">`;
    for(let i=0;i<fd;i++) html+=`<div class="day empty"></div>`;
    for(let dd=1;dd<=tot;dd++){
      const hl=highlights.some(h=>h.month===m&&h.day===dd);
      html+=`<div class="day${hl?" highlight":""}">${dd}</div>`;
    }
    html+=`</div></div>`;
  });
  return html+`</div>`;
}

// kick off initial render
animate();
