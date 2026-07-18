function todayKey(){
  return new Date().toISOString().slice(0,10); // YYYY-MM-DD
}

function getOrCreateDay(state, dateKey){
  let day = state.daily.find(d => d.date === dateKey);
  if (!day){
    day = { date: dateKey, tasks: [], notes: '' };
    state.daily.push(day);
  }
  return day;
}

function renderDaily(container, state, onChange){
  let currentDate = todayKey();

  paint();

  function paint(){
    const day = getOrCreateDay(state, currentDate);
    const pending = day.tasks.filter(t => !t.completed);
    const completed = day.tasks.filter(t => t.completed);
    const isToday = currentDate === todayKey();

    container.innerHTML = `
      <p class="eyebrow">Daily Execution</p>
      <div class="date-nav">
        <button class="icon-btn" id="prevDayBtn">‹</button>
        <div class="date-display">
          <div class="date-main">${formatDateLong(currentDate)}</div>
          ${isToday ? '<div class="date-sub">Today</div>' : `<button class="date-sub link" id="jumpTodayBtn">Jump to today</button>`}
        </div>
        <button class="icon-btn" id="nextDayBtn" ${isToday ? 'disabled' : ''}>›</button>
      </div>

      <div class="card">
        <p class="eyebrow" style="margin-bottom:10px;">Add a task</p>
        <div class="dir-input-row">
          <input type="text" id="newTaskInput" placeholder="What are you executing today?" />
          <button class="icon-btn" id="addTaskBtn">+</button>
        </div>
      </div>

      <div class="card">
        <p class="eyebrow">Pending · ${pending.length}</p>
        <div id="pendingList"></div>
      </div>

      <div class="card">
        <p class="eyebrow">Completed · ${completed.length}</p>
        <div id="completedList"></div>
      </div>

      <div class="card">
        <p class="eyebrow">Daily notes</p>
        <textarea id="dayNotes" rows="3" placeholder="Anything worth remembering about today?">${escapeHtml(day.notes)}</textarea>
      </div>
    `;

    const pendingEl = container.querySelector('#pendingList');
    pendingEl.innerHTML = pending.length
      ? pending.map(taskHtml).join('')
      : `<div class="empty-state">Nothing pending. Add a task above.</div>`;

    const completedEl = container.querySelector('#completedList');
    completedEl.innerHTML = completed.length
      ? completed.map(taskHtml).join('')
      : `<div class="empty-state">Nothing shipped yet today.</div>`;

    container.querySelectorAll('[data-toggle]').forEach(cb=>{
      cb.addEventListener('change', ()=>{
        const t = day.tasks.find(t => t.id === cb.dataset.toggle);
        t.completed = cb.checked;
        onChange();
        paint();
      });
    });
    container.querySelectorAll('[data-del-task]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        day.tasks = day.tasks.filter(t => t.id !== btn.dataset.delTask);
        onChange();
        paint();
      });
    });

    container.querySelector('#addTaskBtn').addEventListener('click', addTask);
    container.querySelector('#newTaskInput').addEventListener('keydown', (e)=>{
      if (e.key === 'Enter') addTask();
    });
    function addTask(){
      const input = container.querySelector('#newTaskInput');
      const val = input.value.trim();
      if (!val) return;
      day.tasks.push({ id: Store.uid(), text: val, completed: false });
      onChange();
      paint();
    }

    container.querySelector('#dayNotes').addEventListener('change', (e)=>{
      day.notes = e.target.value;
      onChange();
    });

    container.querySelector('#prevDayBtn').addEventListener('click', ()=>{
      currentDate = shiftDate(currentDate, -1);
      paint();
    });
    const nextBtn = container.querySelector('#nextDayBtn');
    if (!isToday) nextBtn.addEventListener('click', ()=>{
      currentDate = shiftDate(currentDate, 1);
      paint();
    });
    const jumpBtn = container.querySelector('#jumpTodayBtn');
    if (jumpBtn) jumpBtn.addEventListener('click', ()=>{
      currentDate = todayKey();
      paint();
    });
  }
}

function taskHtml(t){
  return `
    <label class="task-row">
      <input type="checkbox" data-toggle="${t.id}" ${t.completed ? 'checked' : ''} />
      <span class="task-text ${t.completed ? 'done' : ''}">${escapeHtml(t.text)}</span>
      <button class="icon-btn" data-del-task="${t.id}" style="width:26px;height:26px;font-size:12px;">✕</button>
    </label>
  `;
}

function shiftDate(dateKey, deltaDays){
  const d = new Date(dateKey + 'T00:00:00');
  d.setDate(d.getDate() + deltaDays);
  return d.toISOString().slice(0,10);
}

function formatDateLong(dateKey){
  const d = new Date(dateKey + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short', year:'numeric' });
}

window.renderDaily = renderDaily;
