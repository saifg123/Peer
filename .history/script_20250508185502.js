const calendarEl = document.getElementById("calendar");
const viewLabel   = document.getElementById("view-label");
const zoomLevels  = ["day","week","month"];
let currentIndex  = 2; // start at month
let currentDate   = new Date();
let scrollDebounce;

document.getElementById("zoom-in").onclick  = () => zoom(-1);
document.getElementById("zoom-out").onclick = () => zoom( 1);
document.getElementById("prev").onclick     = () => shift(-1);
document.getElementById("next").onclick     = () => shift( 1);

calendarEl.addEventListener("wheel", e=>{
  e.preventDefault();
  if (scrollDebounce) return;
  scrollDebounce = setTimeout(()=>scrollDebounce=null,300);
  zoom(e.deltaY>0?1:-1);
},{passive:false});

function zoom(dir){
  const max = zoomLevels.length - 1;
  currentIndex = Math.min(max, Math.max(0, currentIndex + dir));
  animate();
}

function shift(dir){
  const unit = zoomLevels[currentIndex];
  if (unit==="day")   currentDate.setDate(currentDate.getDate()+dir);
  if (unit==="week")  currentDate.setDate(currentDate.getDate()+7*dir);
  if (unit==="month") currentDate.setMonth(currentDate.getMonth()+dir);
  animate();
}

function animate(){
  const wrap = document.createElement("div");
  wrap.className = "calendar-view transitioning";
  viewLabel.textContent = getLabel();
  wrap.innerHTML = render();
  calendarEl.innerHTML = "";
  calendarEl.append(wrap);
  void wrap.offsetWidth;
  requestAnimationFrame(()=>wrap.classList.remove("transitioning"));
}

function getLabel(){
  const unit = zoomLevels[currentIndex];
  if (unit==="day") {
    return currentDate.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"});
  }
  if (unit==="week") {
    const start = new Date(currentDate);
    start.setDate(currentDate.getDate()-currentDate.getDay());
    return "Week of " + start.toLocaleDateString(undefined,{month:"long",day:"numeric"});
  }
  // month
  return currentDate.toLocaleDateString(undefined,{month:"long",year:"numeric"});
}

function render(){
  const unit = zoomLevels[currentIndex];
  if (unit==="day")   return renderDay();
  if (unit==="week")  return renderWeek();
  if (unit==="month") return renderMonth();
}

function renderDay(){
  let html = `<div class="day-header">${getLabel()}</div><div class="day-grid">`;
  for(let h=0;h<24;h++){
    html += `<div class="day-cell"><span>${h}:00</span></div>`;
  }
  html += `</div>`;
  return html;
}

function renderWeek(){
  const start = new Date(currentDate);
  start.setDate(currentDate.getDate() - start.getDay());
  let html = `<div class="week-grid"><div class="week-labels">`;
  for(let i=0;i<7;i++){
    const d = new Date(start);
    d.setDate(start.getDate()+i);
    html += `<div class="week-label">${d.toLocaleDateString(undefined,{weekday:"short",day:"numeric"})}</div>`;
  }
  html += `</div>`;
  for(let h=0;h<24;h++){
    html += `<div class="week-row">`;
    for(let i=0;i<7;i++){
      html += `<div class="week-cell"></div>`;
    }
    html += `</div>`;
  }
  html += `</div>`;
  return html;
}

function renderMonth(){
  const y = currentDate.getFullYear();
  const m = currentDate.getMonth();
  const first = new Date(y,m,1).getDay();
  const days = new Date(y,m+1,0).getDate();
  let html = `<div class="month-grid"><div class="month-labels">`;
  ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(d=>html+=`<div class="month-label">${d}</div>`);
  html += `</div>`;
  let d=1;
  for(let row=0; row<6; row++){
    for(let col=0; col<7; col++){
      if((row===0&&col<first) || d>days){
        html += `<div class="month-cell empty"></div>`;
      } else {
        html += `<div class="month-cell">${d}</div>`;
        d++;
      }
    }
  }
  html += `</div>`;
  return html;
}

// initial
animate();
