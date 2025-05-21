const calendarEl = document.getElementById("calendar");
const viewLabel   = document.getElementById("view-label");
const zoomLevels = ["day","week","month","quarter","semester","year"];
let currentIndex = 2;              // start at month
let currentDate  = new Date();
let scrollDebounce = null;

// Controls
document.getElementById("zoom-in").onclick  = () => zoom("in");
document.getElementById("zoom-out").onclick = () => zoom("out");
document.getElementById("prev").onclick     = () => shiftTime(-1);
document.getElementById("next").onclick     = () => shiftTime( 1);
calendarEl.addEventListener("wheel", e => {
  e.preventDefault();
  if (scrollDebounce) return;
  scrollDebounce = setTimeout(()=>scrollDebounce=null,300);
  zoom(e.deltaY<0?"in":"out");
},{passive:false});

function zoom(dir){
  if(dir==="in" && currentIndex>0) currentIndex--;
  if(dir==="out"&& currentIndex<zoomLevels.length-1) currentIndex++;
  animate();
}
function shiftTime(dir){
  const view=zoomLevels[currentIndex];
  if(view==="day")      currentDate.setDate(currentDate.getDate()+dir);
  if(view==="week")     currentDate.setDate(currentDate.getDate()+7*dir);
  if(view==="month")    currentDate.setMonth(currentDate.getMonth()+1*dir);
  if(view==="quarter")  currentDate.setMonth(currentDate.getMonth()+3*dir);
  if(view==="semester") currentDate.setMonth(currentDate.getMonth()+5*dir);
  if(view==="year")     currentDate.setFullYear(currentDate.getFullYear()+dir);
  animate();
}

function animate(){
  const wrapper = document.createElement("div");
  wrapper.className = "calendar-view transitioning";
  viewLabel.textContent = generateLabel(zoomLevels[currentIndex], currentDate);
  wrapper.innerHTML = renderView(zoomLevels[currentIndex]);
  calendarEl.innerHTML = "";
  calendarEl.append(wrapper);
  void wrapper.offsetWidth;
  requestAnimationFrame(()=> wrapper.classList.remove("transitioning"));
}

function renderView(view){
  if(view==="day")      return renderDay();
  if(view==="week")     return renderWeek();
  if(view==="month")    return renderMulti([new Date(currentDate.getFullYear(),currentDate.getMonth(),1)]);
  if(view==="quarter")  return renderMulti(getMonths(3));
  if(view==="semester") return renderMulti(getMonths(5));
  if(view==="year")     return renderMulti(getMonths(10),[5,6,7]);
}

function getMonths(count){
  const start = viewLabel.textContent==="Year"
    ? new Date(currentDate.getFullYear(),7,1)
    : new Date(currentDate.getFullYear(),currentDate.getMonth(),1);
  return Array.from({length:count},(_,i)=>
    new Date(start.getFullYear(), start.getMonth()+i,1)
  );
}

function renderMulti(months, summerIdxs=[]){
  let html=`<div class="multi-month-grid">`;
  months.forEach(md=>{
    const m=md.getMonth(), y=md.getFullYear();
    const ds=new Date(y,m+1,0).getDate();
    const fd=new Date(y,m,1).getDay();
    const isSummer=summerIdxs.includes(m);
    html+=`<div class="month-tile${isSummer?" summer":""}">
      <div class="month-title">${md.toLocaleString(undefined,{month:"long",year:"numeric"})}</div>
      <div class="month-weekdays">${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
        .map(d=>`<div>${d}</div>`).join("")}</div>
      <div class="month-days">`;
    for(let i=0;i<fd;i++) html+=`<div class="day empty"></div>`;
    for(let d=1;d<=ds;d++) html+=`<div class="day">${d}</div>`;
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
  const label=currentDate.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"});
  return `<div class="month-tile"><div class="month-title">${label}</div></div>`;
}

function renderWeek(){
  const start=new Date(currentDate);
  start.setDate(start.getDate()-start.getDay());
  const days=Array.from({length:7},(_,i)=>{
    const d=new Date(start); d.setDate(start.getDate()+i);
    return `<div class="day">${d.toLocaleDateString()}</div>`;
  }).join("");
  return `<div class="multi-month-grid">
    <div class="month-tile">
      <div class="month-title">${generateLabel("week",currentDate)}</div>
      <div class="month-days">${days}</div>
    </div>
  </div>`;
}

function generateLabel(view,date){
  if(view==="day") return date.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"});
  if(view==="week"){
    const s=new Date(date);s.setDate(date.getDate()-date.getDay());
    return `Week of ${s.toLocaleDateString(undefined,{month:"long",day:"numeric",year:"numeric"})}`;
  }
  if(view==="month") return date.toLocaleDateString(undefined,{month:"long",year:"numeric"});
  if(view==="quarter") return `Q${Math.floor(date.getMonth()/3)+1} ${date.getFullYear()}`;
  if(view==="semester") return (date.getMonth()<6?"Spring":"Fall")+` Semester ${date.getFullYear()}`;
  if(view==="year") return `School Year ${date.getFullYear()}–${(date.getFullYear()+1+"").slice(-2)}`;
}

animate(); // initial render
