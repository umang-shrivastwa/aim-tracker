function renderCritical(container, state, onChange){
  let formOpen = false;

  paint();

  function paint(){
    const open = state.criticalTasks.filter(t => !t.completed);
    const done = state.criticalTasks.filter(t => t.completed);

    container.innerHTML = `
      <button class="icon-btn" id="backBtn" style="margin-bottom:14px;">← Back</button>
      <p class="eyebrow">Critical Tasks · ${open.length} open</p>
      <h1 style="font-size:22px; margin-bottom:6px;">Must finish soon</h1>
      <p style="font-size:12.5px; color:var(--text-dim); margin-bottom:14px;">These stay visible on your Dashboard until you finish them.</p>

      <div id="formSlot"></div>
      ${!formOpen ? `<button class="btn btn-primary" id="addBtn" style="width:100%; margin-bottom:16px;">+ Add a critical task</button>` : ''}

      <p class="eyebrow">Open</p>
      <div id="openList"></div>

      ${done.length ? `<p class="eyebrow" style="margin-top:16px;">Done</p><div id="doneList"></div>` : ''}
    `;

    container.querySelector('#backBtn').addEventListener('click', ()=> window.navigate('more'));

    if (formOpen) renderForm(container.querySelector('#formSlot'));

    const openEl = container.querySelector('#openList');
    openEl.innerHTML = open.length
      ? open.map(itemHtml).join('')
      : `<div class="empty-state">Nothing critical right now.</div>`;

    const doneEl = container.querySelector('#doneList');
    if (doneEl) doneEl.innerHTML = done.map(itemHtml).join('');

    container.querySelectorAll('[data-toggle]').forEach(cb=>{
      cb.addEventListener('change', ()=>{
        const t = state.criticalTasks.find(t => t.id === cb.dataset.toggle);
        t.completed = cb.checked;
        onChange();
        paint();
      });
    });
    container.querySelectorAll('[data-del]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        state.criticalTasks = state.criticalTasks.filter(t => t.id !== btn.dataset.del);
        onChange();
        paint();
      });
    });

    const addBtn = container.querySelector('#addBtn');
    if (addBtn) addBtn.addEventListener('click', ()=>{ formOpen = true; paint(); });
  }

  function itemHtml(t){
    return `
      <div class="card" style="padding:14px 16px;">
        <label class="task-row" style="border-bottom:none; padding:0;">
          <input type="checkbox" data-toggle="${t.id}" ${t.completed ? 'checked' : ''} />
          <span class="task-text ${t.completed ? 'done' : ''}" style="flex:1;">
            <strong style="display:block; font-family:var(--font-display);">${escapeHtml(t.title)}</strong>
            ${t.notes ? `<span style="font-size:12px; color:var(--text-dim);">${escapeHtml(t.notes)}</span>` : ''}
          </span>
          <button class="icon-btn" data-del="${t.id}" style="width:28px;height:28px;font-size:13px;">✕</button>
        </label>
      </div>
    `;
  }

  function renderForm(slot){
    slot.innerHTML = `
      <div class="card">
        <p class="eyebrow">New critical task</p>
        <div class="form-row">
          <label>Title</label>
          <input type="text" id="cTitle" placeholder="e.g. Learn GitHub basics" />
        </div>
        <div class="form-row">
          <label>Notes</label>
          <textarea id="cNotes" rows="2" placeholder="Why is this urgent?"></textarea>
        </div>
        <div class="realign-actions">
          <button class="btn" id="cancelBtn">Cancel</button>
          <button class="btn btn-primary" id="saveBtn">Add</button>
        </div>
      </div>
    `;

    slot.querySelector('#cancelBtn').addEventListener('click', ()=>{ formOpen = false; paint(); });
    slot.querySelector('#saveBtn').addEventListener('click', ()=>{
      const title = slot.querySelector('#cTitle').value.trim();
      if (!title){ alert('What needs to get done?'); return; }
      state.criticalTasks.push({
        id: Store.uid(),
        title,
        notes: slot.querySelector('#cNotes').value.trim(),
        completed: false,
        createdAt: new Date().toISOString()
      });
      onChange();
      formOpen = false;
      paint();
    });
  }
}

window.renderCritical = renderCritical;
