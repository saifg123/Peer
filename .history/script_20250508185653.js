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
  if (v==="semester") currentDate.setMonth(currentDate.getMonth()+5*dir);
  if (v==="year")     currentDate.setFullYear(currentDate.getFullYear()+dir);
  animate();
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
    const s=new Date(currentDate); s.setDate(currentDate.getDate()-currentDate.getDay());
    return "Week of "+s.toLocaleDateString(undefined,{month:"long",day:"numeric"});
  }
  if (v==="month") return currentDate.toLocaleDateString(undefined,{month:"long",year:"numeric"});
  if (v==="quarter") return `Q${Math.floor(currentDate.getMonth()/3)+1} ${currentDate.getFullYear()}`;
  if (v==="semester") return (currentDate.getMonth()<6?"Spring":"Fall")+" Semester "+currentDate.getFullYear();
  return `School Year ${currentDate.getFullYear()}–${(currentDate.getFullYear()+1+"").slice(-2)}`;
}

function renderView(v){
  if (v==="day")      return renderDay();
  if (v==="week")     return renderWeek();
  if (v==="month")    return renderMulti(getMonths(1));
  if (v==="quarter")  return renderMulti(getMonths(3));
  if (v==="semester") return renderMulti(getMonths(5));
  return renderMulti(getMonths(10), [5,6,7]);
}

function getMonths(count){
  // For year start in August, offset only when viewing year
  let start = new Date(currentDate);
  if (count===10) start = new Date(currentDate.getFullYear(),7,1);
  else start.setDate(1);
  return Array.from({length:count},(_,i)=>
    new Date(start.getFullYear(), start.getMonth()+i,1)
  );
}

function renderMulti(months, summerIdxs=[]){
  let html=`<div class="multi-month-grid">`;
  months.forEach(md=>{
    const y=md.getFullYear(), m=md.getMonth();
    const daysInMonth=new Date(y,m+1,0).getDate();
    const firstDay=new Date(y,m,1).getDay();
    const isSummer=summerIdxs.includes(m);
    html+=`<div class="month-tile${isSummer?" summer":""}">
      <div class="month-title">${md.toLocaleString(undefined,{month:"long",year:"numeric"})}</div>
      <div class="month-weekdays">${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
        .map(d=>`<div>${d}</div>`).join("")}</div>
      <div class="month-days">`;
    for(let i=0;i<firstDay;i++) html+=`<div class="day empty"></div>`;
    for(let d=1;d<=daysInMonth;d++) html+=`<div class="day">${d}</div>`;
    html+=`</div>`;
    if(isSummer){
      html+=`<div class="summer-decoration">
        <div class="grass"></div>
        <div class="flower flower1"></div>
        <div class="flower flower2"></div>
      </div>`;
    }
    html+=`</div>`;
  });
  return html+`</div>`;
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
    h+=`<div class="week-row">`;
    for(let c=0;c<7;c++) h+=`<div class="week-cell"></div>`;
    h+=`</div>`;
  }
  return h+`</div>`;
}

// initial render
animate();
