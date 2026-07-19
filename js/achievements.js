function renderAchievements(container, state, onChange){
  let formOpen = false;

  paint();

  function paint(){
    const entries = [...state.achievements].sort((a,b) => b.date.localeCompare(a.date));

    container.innerHTML = `
      <button class="icon-btn" id="backBtn" style="margin-bottom:14px;">← Back</button>
      <p class="eyebrow">Achievement Timeline · ${entries.length} milestones</p>
      <h1 style="font-size:22px; margin-bottom:14px;">Your growth, recorded</h1>

      <div id="formSlot"></div>
      ${!formOpen ? `<button class="btn btn-primary" id="addBtn" style="width:100%; margin-bottom:16px;">+ Log an achievement</button>` : ''}

      <div id="timeline"></div>
    `;

    container.querySelector('#backBtn').addEventListener('click', ()=> window.navigate('more'));

    if (formOpen) renderForm(container.querySelector('#formSlot'));

    const timelineEl = container.querySelector('#timeline');
    timelineEl.innerHTML = entries.length
      ? `<div class="timeline">${entries.map(entryHtml).join('')}</div>`
      : `<div class="empty-state">No milestones yet. What's the first thing worth remembering?</div>`;

    const addBtn = container.querySelector('#addBtn');
    if (addBtn) addBtn.addEventListener('click', ()=>{ formOpen = true; paint(); });

    timelineEl.querySelectorAll('[data-del]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        if (!confirm('Delete this milestone?')) return;
        state.achievements = state.achievements.filter(e => e.id !== btn.dataset.del);
        onChange();
        paint();
      });
    });
  }

  function entryHtml(e){
    const dateTxt = new Date(e.date).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'});
    return `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <div class="timeline-top">
            <span class="goal-meta">${dateTxt}</span>
            <button class="icon-btn" data-del="${e.id}" style="width:26px;height:26px;font-size:12px;">✕</button>
          </div>
          <h3 style="font-size:15px; margin:4px 0 2px;">${escapeHtml(e.title)}</h3>
          ${e.notes ? `<p style="font-size:13px; color:var(--text-dim); margin:0;">${escapeHtml(e.notes)}</p>` : ''}
        </div>
      </div>
    `;
  }

  function renderForm(slot){
    const today = new Date().toISOString().slice(0,10);
    slot.innerHTML = `
      <div class="card">
        <p class="eyebrow">New milestone</p>
        <div class="form-row">
          <label>Title</label>
          <input type="text" id="aTitle" placeholder="e.g. First Calculator, First GitHub Repo" />
        </div>
        <div class="form-row">
          <label>Date</label>
          <input type="date" id="aDate" value="${today}" />
        </div>
        <div class="form-row">
          <label>Notes</label>
          <textarea id="aNotes" rows="2" placeholder="Why does this matter? What did it take?"></textarea>
        </div>
        <div class="realign-actions">
          <button class="btn" id="cancelBtn">Cancel</button>
          <button class="btn btn-primary" id="saveBtn">Save</button>
        </div>
      </div>
    `;

    slot.querySelector('#cancelBtn').addEventListener('click', ()=>{ formOpen = false; paint(); });
    slot.querySelector('#saveBtn').addEventListener('click', ()=>{
      const title = slot.querySelector('#aTitle').value.trim();
      if (!title){ alert('What did you achieve? Add a title.'); return; }
      state.achievements.push({
        id: Store.uid(),
        title,
        date: slot.querySelector('#aDate').value || today,
        notes: slot.querySelector('#aNotes').value.trim()
      });
      onChange();
      formOpen = false;
      paint();
    });
  }
}

window.renderAchievements = renderAchievements;
