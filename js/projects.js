function renderProjects(container, state, onChange){
  let formOpen = false;
  let expandedId = null;

  paint();

  function paint(){
    const projects = state.projects;

    container.innerHTML = `
      <button class="icon-btn" id="backBtn" style="margin-bottom:14px;">← Back</button>
      <p class="eyebrow">Project Tracker · ${projects.length} projects</p>
      <h1 style="font-size:22px; margin-bottom:14px;">Multi-stage projects</h1>

      <div id="formSlot"></div>
      ${!formOpen ? `<button class="btn btn-primary" id="addBtn" style="width:100%; margin-bottom:16px;">+ New project</button>` : ''}

      <div id="list"></div>
    `;

    container.querySelector('#backBtn').addEventListener('click', ()=> window.navigate('more'));

    if (formOpen) renderForm(container.querySelector('#formSlot'));

    const listEl = container.querySelector('#list');
    listEl.innerHTML = projects.length
      ? projects.map(projectHtml).join('')
      : `<div class="empty-state">No projects yet. Break your next big thing into stages.</div>`;

    const addBtn = container.querySelector('#addBtn');
    if (addBtn) addBtn.addEventListener('click', ()=>{ formOpen = true; paint(); });

    listEl.querySelectorAll('[data-expand]').forEach(el=>{
      el.addEventListener('click', ()=>{
        expandedId = expandedId === el.dataset.expand ? null : el.dataset.expand;
        paint();
      });
    });
    listEl.querySelectorAll('[data-stage-toggle]').forEach(cb=>{
      cb.addEventListener('change', ()=>{
        const [pid, sid] = cb.dataset.stageToggle.split('::');
        const proj = state.projects.find(p => p.id === pid);
        const stage = proj.stages.find(s => s.id === sid);
        stage.completed = cb.checked;
        onChange();
        paint();
      });
    });
    listEl.querySelectorAll('[data-del-project]').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        e.stopPropagation();
        if (!confirm('Delete this project and all its stages?')) return;
        state.projects = state.projects.filter(p => p.id !== btn.dataset.delProject);
        onChange();
        paint();
      });
    });
  }

  function projectHtml(p){
    const done = p.stages.filter(s => s.completed).length;
    const total = p.stages.length;
    const pct = total ? Math.round((done/total)*100) : 0;
    const isOpen = expandedId === p.id;
    return `
      <div class="card goal-card">
        <div class="goal-top" data-expand="${p.id}" style="cursor:pointer;">
          <div class="badges">
            <span class="badge status-in-progress">${done}/${total} stages</span>
          </div>
          <div class="goal-actions">
            <button class="icon-btn" data-del-project="${p.id}" style="width:30px;height:30px;font-size:13px;">✕</button>
          </div>
        </div>
        <h3 style="font-size:16px; margin:10px 0 8px;" data-expand="${p.id}" style="cursor:pointer;">${escapeHtml(p.title)}</h3>
        <div class="progress-row">
          <div class="progress-track"><div class="progress-fill" style="width:${pct}%;"></div></div>
          <span class="progress-pct">${pct}%</span>
        </div>
        ${isOpen ? `
          <div class="stage-list">
            ${p.stages.map(s => `
              <label class="task-row">
                <input type="checkbox" data-stage-toggle="${p.id}::${s.id}" ${s.completed ? 'checked' : ''} />
                <span class="task-text ${s.completed ? 'done' : ''}">${escapeHtml(s.name)}</span>
              </label>
            `).join('')}
          </div>
        ` : `<button class="icon-btn" data-expand="${p.id}" style="width:100%; margin-top:8px; font-size:11px;">Tap to view stages</button>`}
      </div>
    `;
  }

  function renderForm(slot){
    slot.innerHTML = `
      <div class="card">
        <p class="eyebrow">New project</p>
        <div class="form-row">
          <label>Project title</label>
          <input type="text" id="pTitle" placeholder="e.g. Fingyaan" />
        </div>
        <div class="form-row">
          <label>Stages (comma-separated, in order)</label>
          <textarea id="pStages" rows="2" placeholder="e.g. Research, Script, Recording, Editing, Thumbnail, Upload"></textarea>
        </div>
        <div class="realign-actions">
          <button class="btn" id="cancelBtn">Cancel</button>
          <button class="btn btn-primary" id="saveBtn">Create project</button>
        </div>
      </div>
    `;

    slot.querySelector('#cancelBtn').addEventListener('click', ()=>{ formOpen = false; paint(); });
    slot.querySelector('#saveBtn').addEventListener('click', ()=>{
      const title = slot.querySelector('#pTitle').value.trim();
      if (!title){ alert('Give the project a title.'); return; }
      const stageNames = slot.querySelector('#pStages').value.split(',').map(s=>s.trim()).filter(Boolean);
      if (!stageNames.length){ alert('Add at least one stage.'); return; }

      state.projects.push({
        id: Store.uid(),
        title,
        stages: stageNames.map(name => ({ id: Store.uid(), name, completed: false }))
      });
      onChange();
      formOpen = false;
      paint();
    });
  }
}

window.renderProjects = renderProjects;
