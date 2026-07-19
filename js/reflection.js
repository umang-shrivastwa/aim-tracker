function getOrCreateReflection(state, dateKey){
  let r = state.reflections.find(r => r.date === dateKey);
  if (!r){
    r = { date: dateKey, learned: '', built: '', tomorrow: '' };
    state.reflections.push(r);
  }
  return r;
}

function renderReflection(container, state, onChange){
  let currentDate = todayKey();

  paint();

  function paint(){
    const r = getOrCreateReflection(state, currentDate);
    const isToday = currentDate === todayKey();

    container.innerHTML = `
      <button class="icon-btn" id="backBtn" style="margin-bottom:14px;">← Back</button>
      <p class="eyebrow">Daily Reflection</p>

      <div class="date-nav">
        <button class="icon-btn" id="prevDayBtn">‹</button>
        <div class="date-display">
          <div class="date-main">${formatDateLong(currentDate)}</div>
          ${isToday ? '<div class="date-sub">Today</div>' : `<button class="date-sub link" id="jumpTodayBtn">Jump to today</button>`}
        </div>
        <button class="icon-btn" id="nextDayBtn" ${isToday ? 'disabled' : ''}>›</button>
      </div>

      <div class="card">
        <p class="eyebrow">What did I learn today?</p>
        <textarea id="rLearned" rows="3" placeholder="Be specific — what actually clicked?">${escapeHtml(r.learned)}</textarea>
      </div>

      <div class="card">
        <p class="eyebrow">What did I build today?</p>
        <textarea id="rBuilt" rows="3" placeholder="Learning isn't enough — what did you ship or move forward?">${escapeHtml(r.built)}</textarea>
      </div>

      <div class="card">
        <p class="eyebrow">What will I do tomorrow?</p>
        <textarea id="rTomorrow" rows="3" placeholder="One clear next step, tied to your plan.">${escapeHtml(r.tomorrow)}</textarea>
      </div>
    `;

    container.querySelector('#backBtn').addEventListener('click', ()=> window.navigate('more'));

    ['rLearned','rBuilt','rTomorrow'].forEach((id, i)=>{
      const field = ['learned','built','tomorrow'][i];
      container.querySelector('#'+id).addEventListener('change', (e)=>{
        r[field] = e.target.value;
        onChange();
      });
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

window.renderReflection = renderReflection;
