const PRIORITIES = ['High', 'Medium', 'Low'];
const STATUSES = ['Not Started', 'In Progress', 'Blocked', 'Completed'];

function renderGoals(container, state, onChange){
  let formOpen = false;
  let editingId = null;

  paint();

  function paint(){
    const goals = state.goals;
    container.innerHTML = `
      <p class="eyebrow">Goals · ${goals.length} total</p>
      <h1 style="font-size:22px; margin-bottom:14px;">Yearly Goals</h1>

      <div id="formSlot"></div>

      ${!formOpen ? `<button class="btn btn-primary" id="addGoalBtn" style="width:100%; margin-bottom:16px;">+ Add a goal</button>` : ''}

      <div id="goalList"></div>
    `;

    if (formOpen) renderForm(container.querySelector('#formSlot'), editingId);

    const listEl = container.querySelector('#goalList');
    if (!goals.length){
      listEl.innerHTML = `<div class="empty-state">No goals yet. Add the first one to anchor your year.</div>`;
    } else {
      // Not Started/In Progress/Blocked first, Completed last
      const sorted = [...goals].sort((a,b) => (a.status === 'Completed') - (b.status === 'Completed'));
      listEl.innerHTML = sorted.map(goalCardHtml).join('');
    }

    const addBtn = container.querySelector('#addGoalBtn');
    if (addBtn) addBtn.addEventListener('click', ()=>{ formOpen = true; editingId = null; paint(); });

    listEl.querySelectorAll('[data-edit]').forEach(btn=>{
      btn.addEventListener('click', ()=>{ formOpen = true; editingId = btn.dataset.edit; paint(); });
    });
    listEl.querySelectorAll('[data-delete]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        if (!confirm('Delete this goal? This cannot be undone.')) return;
        state.goals = state.goals.filter(g => g.id !== btn.dataset.delete);
        onChange();
        paint();
      });
    });
  }

  function goalCardHtml(g){
    const priorityClass = 'pri-' + g.priority.toLowerCase();
    const statusClass = 'status-' + g.status.toLowerCase().replace(/\s+/g,'-');
    const deadlineTxt = g.deadline ? new Date(g.deadline).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'}) : 'No deadline';
    return `
      <div class="card goal-card">
        <div class="goal-top">
          <div class="badges">
            <span class="badge ${priorityClass}">${g.priority}</span>
            <span class="badge ${statusClass}">${g.status}</span>
          </div>
          <div class="goal-actions">
            <button class="icon-btn" data-edit="${g.id}" title="Edit" style="width:30px;height:30px;font-size:13px;">✎</button>
            <button class="icon-btn" data-delete="${g.id}" title="Delete" style="width:30px;height:30px;font-size:13px;">✕</button>
          </div>
        </div>
        <h3 style="font-size:16px; margin:10px 0 4px;">${escapeHtml(g.title)}</h3>
        ${g.description ? `<p style="font-size:13px; color:var(--text-dim); margin:0 0 10px;">${escapeHtml(g.description)}</p>` : ''}

        <div class="progress-row">
          <div class="progress-track"><div class="progress-fill" style="width:${g.progress}%;"></div></div>
          <span class="progress-pct">${g.progress}%</span>
        </div>

        <div class="goal-meta">
          <span>⏱ ${deadlineTxt}</span>
        </div>
        ${g.notes ? `<p class="goal-notes">${escapeHtml(g.notes)}</p>` : ''}
      </div>
    `;
  }

  function renderForm(slot, editId){
    const existing = editId ? state.goals.find(g => g.id === editId) : null;
    slot.innerHTML = `
      <div class="card">
        <p class="eyebrow">${existing ? 'Edit goal' : 'New goal'}</p>

        <div class="form-row">
          <label>Title</label>
          <input type="text" id="gTitle" placeholder="e.g. Complete GenAI Engineer roadmap" value="${existing ? escapeHtml(existing.title) : ''}" />
        </div>

        <div class="form-row">
          <label>Description</label>
          <textarea id="gDesc" rows="2" placeholder="What does done look like?">${existing ? escapeHtml(existing.description) : ''}</textarea>
        </div>

        <div class="form-row-split">
          <div class="form-row">
            <label>Deadline</label>
            <input type="date" id="gDeadline" value="${existing && existing.deadline ? existing.deadline.slice(0,10) : ''}" />
          </div>
          <div class="form-row">
            <label>Priority</label>
            <select id="gPriority">
              ${PRIORITIES.map(p => `<option value="${p}" ${existing && existing.priority===p?'selected':''}>${p}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-row">
          <label>Status</label>
          <select id="gStatus">
            ${STATUSES.map(s => `<option value="${s}" ${existing && existing.status===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </div>

        <div class="form-row">
          <label>Progress: <span id="gProgressVal">${existing ? existing.progress : 0}%</span></label>
          <input type="range" id="gProgress" min="0" max="100" value="${existing ? existing.progress : 0}" />
        </div>

        <div class="form-row">
          <label>Notes</label>
          <textarea id="gNotes" rows="2" placeholder="Optional">${existing ? escapeHtml(existing.notes) : ''}</textarea>
        </div>

        <div class="realign-actions">
          <button class="btn" id="cancelGoalBtn">Cancel</button>
          <button class="btn btn-primary" id="saveGoalBtn">${existing ? 'Save changes' : 'Add goal'}</button>
        </div>
      </div>
    `;

    slot.querySelector('#gProgress').addEventListener('input', (e)=>{
      slot.querySelector('#gProgressVal').textContent = e.target.value + '%';
    });

    slot.querySelector('#cancelGoalBtn').addEventListener('click', ()=>{ formOpen = false; editingId = null; paint(); });

    slot.querySelector('#saveGoalBtn').addEventListener('click', ()=>{
      const title = slot.querySelector('#gTitle').value.trim();
      if (!title){ alert('Give the goal a title.'); return; }

      const payload = {
        title,
        description: slot.querySelector('#gDesc').value.trim(),
        deadline: slot.querySelector('#gDeadline').value || null,
        priority: slot.querySelector('#gPriority').value,
        status: slot.querySelector('#gStatus').value,
        progress: parseInt(slot.querySelector('#gProgress').value, 10),
        notes: slot.querySelector('#gNotes').value.trim()
      };

      if (existing){
        Object.assign(existing, payload);
      } else {
        state.goals.push({ id: Store.uid(), ...payload });
      }
      onChange();
      formOpen = false;
      editingId = null;
      paint();
    });
  }
}

window.renderGoals = renderGoals;
