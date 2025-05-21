// ==== Globals & State ====
const calendarEl = document.getElementById("calendar");
const viewLabel   = document.getElementById("view-label");
const zoomLevels  = ["day","week","month","quarter","semester","year"];
let currentIndex  = 2;
let currentDate   = new Date();
let scrollDebounce;

let events = [];      // {id, date:"YYYY-MM-DD", time:"HH:MM", title}
let editingEvent = null;

// ==== Controls & Zoom/Shift ====
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
  currentIndex = Math.min(zoomLevels.length-1, Math.max(0, currentIndex+dir));
  animate();
}

function shift(dir){
  const v = zoomLevels[currentIndex];
  if (v==="day")       currentDate.setDate(currentDate.getDate()+dir);
  else if (v==="week")  currentDate.setDate(currentDate.getDate()+7*dir);
  else if (v==="month") currentDate.setMonth(currentDate.getMonth()+dir);
  else if (v==="quarter")  shiftQuarter(dir);
  else if (v==="semester") shiftSemester(dir);
  else if (v==="year")     shiftYear(dir);
  animate();
}

// ==== Range Shifts ====
function shiftQuarter(dir){
  const m = currentDate.getMonth(), y = currentDate.getFullYear();
  const starts = [8,10,0,2];
  let q = starts.findIndex((s,i)=>{
    const e = starts[(i+1)%4];
    return s<e ? m>=s && m<e : m>=s || m<e;
  });
  if (q<0) q=0;
  let newQ=(q+dir+4)%4, newY=y+Math.floor((starts[q]+dir*3)/12);
  currentDate=new Date(newY, starts[newQ],1);
}
function shiftSemester(dir){
  const m=currentDate.getMonth(), y=currentDate.getFullYear();
  if(m<=4) currentDate=new Date(dir>0?y: y-1,8,1);
  else     currentDate=new Date(dir>0?y+1:y,0,1);
}
function shiftYear(dir){
  const y=currentDate.getFullYear()+dir;
  currentDate=new Date(y,8,1);
}

// ==== Animate & Drill-In ====
function animate(){
  const w = document.createElement("div");
  w.className = "calendar-view transitioning";
  viewLabel.textContent = labelFor(zoomLevels[currentIndex]);
  w.innerHTML = renderView(zoomLevels[currentIndex]);
  calendarEl.innerHTML="";
  calendarEl.append(w);
  void w.offsetWidth;
  requestAnimationFrame(()=>w.classList.remove("transitioning"));

  renderEvents();
  w.addEventListener("click", onCellClick);
}

function onCellClick(e){
  const view = zoomLevels[currentIndex];
  // QUARTER -> MONTH
  if(view==="quarter"){
    const tile = e.target.closest(".month-tile");
    if(!tile) return;
    const [mn, ys] = tile.querySelector(".month-title").textContent.split(" ");
    const mi = new Date(`${mn} 1, ${ys}`).getMonth();
    currentDate=new Date(parseInt(ys),mi,1);
    zoom(-1);
  }
  // MONTH -> WEEK
  else if(view==="month"){
    const cell=e.target.closest(".month-cell");
    if(!cell||cell.classList.contains("empty")) return;
    const d=parseInt(cell.textContent,10), m=currentDate.getMonth(), y=currentDate.getFullYear();
    currentDate=new Date(y,m,d); zoom(-1);
  }
  // WEEK -> DAY
  else if(view==="week"){
    const cell=e.target.closest(".week-cell");
    if(!cell) return;
    const idx=Array.from(cell.parentElement.children).indexOf(cell);
    const s=new Date(currentDate);
    s.setDate(s.getDate()-s.getDay()+idx);
    currentDate=s; zoom(-1);
  }
  // DAY: no further drill
}

// ==== Search & Modal ====
document.getElementById("event-search").addEventListener("input", e=>{
  const term=e.target.value.toLowerCase();
  document.querySelectorAll(".event-item").forEach(el=>{
    el.style.display = el.textContent.toLowerCase().includes(term) ? "" : "none";
  });
});

const modal     = document.getElementById("event-modal");
const ti        = document.getElementById("evt-title");
const tm        = document.getElementById("evt-time");
const saveBtn   = document.getElementById("evt-save");
const cancelBtn = document.getElementById("evt-cancel");

// Double-click on calendar cells to open modal
calendarEl.addEventListener("dblclick", e=>{
  const cell=e.target.closest(".day-cell, .week-cell, .month-cell");
  if(!cell||cell.classList.contains("empty"))return;

  let dateStr;
  if(zoomLevels[currentIndex]==="day"){
    dateStr=formatYYYYMMDD(currentDate);
  } else if(zoomLevels[currentIndex]==="week"){
    const idx=Array.from(cell.parentElement.children).indexOf(cell);
    const s=new Date(currentDate); s.setDate(s.getDate()-s.getDay()+idx);
    dateStr=formatYYYYMMDD(s);
  } else {
    const d=parseInt(cell.textContent,10), m=currentDate.getMonth(), y=currentDate.getFullYear();
    dateStr=new Date(y,m,d).toISOString().slice(0,10);
  }

  editingEvent={id:null,date:dateStr,time:"",title:""};
  openModal("New Event");
});

function openModal(header){
  document.getElementById("modal-title").textContent=header;
  ti.value=editingEvent.title; tm.value=editingEvent.time;
  modal.classList.remove("hidden"); ti.focus();
}
function closeModal(){ modal.classList.add("hidden"); editingEvent=null; }

saveBtn.onclick = ()=>{
  editingEvent.title=ti.value.trim();
  editingEvent.time=tm.value;
  if(!editingEvent.title){ alert("Title required"); return; }
  if(!editingEvent.id){
    editingEvent.id=Date.now(); events.push(editingEvent);
  } else {
    const i=events.findIndex(ev=>ev.id===editingEvent.id);
    events[i]=editingEvent;
  }
  closeModal(); renderEvents();
};
cancelBtn.onclick = closeModal;

// ==== Render & Drag-Drop ====
function renderEvents(){
  document.querySelectorAll(".event-item").forEach(el=>el.remove());
  events.forEach(ev=>{
    // filter by view
    if(zoomLevels[currentIndex]==="month"){
      const [y,m]=ev.date.split("-");
      if(parseInt(y)!==currentDate.getFullYear()||parseInt(m)-1!==currentDate.getMonth())return;
    } else if(ev.date!==formatYYYYMMDD(currentDate)) return;

    // find cell selector
    let sel;
    if(zoomLevels[currentIndex]==="day"){
      sel=`.day-cell:nth-child(${parseInt(ev.time)})`;
    } else if(zoomLevels[currentIndex]==="week"){
      const idx=new Date(ev.date).getDay();
      sel=`.week-row:nth-child(${idx+2}) .week-cell`;
    } else {
      const day=new Date(ev.date).getDate();
      sel=`.month-cell:not(.empty):nth-of-type(${day})`;
    }
    const cell=calendarEl.querySelector(sel);
    if(!cell) return;

    const div=document.createElement("div");
    div.className="event-item";
    div.textContent=`${ev.time} ${ev.title}`;
    div.draggable=true; div.dataset.id=ev.id;
    cell.appendChild(div);

    div.addEventListener("dragstart", e=>{
      e.dataTransfer.setData("text/plain", ev.id);
    });
  });

  calendarEl.querySelectorAll(".day-cell, .week-cell, .month-cell").forEach(c=>{
    c.addEventListener("dragover", e=>e.preventDefault());
    c.addEventListener("drop", e=>{
      const id=e.dataTransfer.getData("text/plain");
      const ev=events.find(x=>x.id==id);
      if(zoomLevels[currentIndex]==="day"){
        ev.date=formatYYYYMMDD(currentDate);
      } else if(zoomLevels[currentIndex]==="week"){
        const idx=Array.from(c.parentElement.children).indexOf(c);
        const s=new Date(currentDate);
        s.setDate(s.getDate()-s.getDay()+idx);
        ev.date=formatYYYYMMDD(s);
      } else {
        const d=parseInt(c.textContent,10), m=currentDate.getMonth(), y=currentDate.getFullYear();
        ev.date=new Date(y,m,d).toISOString().slice(0,10);
      }
      renderEvents();
    });
  });
}

function formatYYYYMMDD(d){ return d.toISOString().slice(0,10); }

// ==== Label & Render Helpers (unchanged) ====
// labelFor, renderView, renderDay, renderWeek,
// renderMonthGrid, getQuarterMonths, getSemesterMonths,
// getSchoolYearMonths, renderMulti ...

// initial render
animate();

