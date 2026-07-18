const SKILL_CATEGORIES = ['Python', 'ML', 'Deep Learning', 'LangChain/LangGraph', 'FastAPI', 'RAG/MCP', 'Finance', 'English', 'Other'];

function renderLearning(container, state, onChange){
  let formOpen = false;

  paint();

  function paint(){
    const entries = [...state.learning].sort((a,b) => b.date.localeCompare(a.date));
    const totalHours = state.learning.reduce((s,e) => s + Number(e.hours || 0), 0);

    container.innerHTML = `
      <button class="icon-btn" id="backBtn" style="margin-bottom:14px;">← Back</button>
      <p class="eyebrow">Learning Tracker · ${totalHours}h logged total</p>
      <h1 style="font-size:22px; margin-bottom:14px;">What you studied</h1>

      <div id="formSlot"></div>
      ${!formOpen ? `<button class="btn btn-primary" id="addBtn" style="width:100%; margin-bottom:16px;">+ Log today's learning</button>` : ''}

      <div id="list"></div>
    `;

    container.querySelector('#backBtn').addEventListener('click', ()=> window.navigate('more'));

    if (formOpen) renderForm(container.querySelector('#formSlot'));

    const listEl = container.querySelector('#list');
    listEl.innerHTML = entries.length
      ? entries.map(entryHtml).join('')
      : `<div class="empty-state">No learning logged yet. What did you study today?</div>`;

    const addBtn = container.querySelector('#addBtn');
    if (addBtn) addBtn.addEventListener('click', ()=>{ formOpen = true; paint(); });

    listEl.querySelectorAll('[data-del]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        if (!confirm('Delete this entry?')) return;
        state.learning = state.learning.filter(e => e.id !== btn.dataset.del);
        onChange();
        paint();
      });
    });
  }

  function entryHtml(e){
    const dateTxt = new Date(e.date).toLocaleDateString('en-IN', {day:'numeric', month:'short'});
    return `
      <div class="card goal-card">
        <div class="goal-top">
          <div class="badges">
            <span class="badge pri-medium">${escapeHtml(e.skillCategory)}</span>
            <span class="badge status-in-progress">${e.hours}h</span>
          </div>
          <div class="goal-actions">
            <button class="icon-btn" data-del="${e.id}" style="width:30px;height:30px;font-size:13px;">✕</button>
          </div>
        </div>
        <h3 style="font-size:15px; margin:10px 0 4px;">${escapeHtml(e.topic)}</h3>
        ${e.notes ? `<p style="font-size:13px; color:var(--text-dim); margin:0;">${escapeHtml(e.notes)}</p>` : ''}
        <div class="goal-meta" style="margin-top:8px;">⏱ ${dateTxt}</div>
      </div>
    `;
  }

  function renderForm(slot){
    const today = new Date().toISOString().slice(0,10);
    slot.innerHTML = `
      <div class="card">
        <p class="eyebrow">New learning entry</p>
        <div class="form-row-split">
          <div class="form-row">
            <label>Date</label>
            <input type="date" id="lDate" value="${today}" />
          </div>
          <div class="form-row">
            <label>Hours studied</label>
            <input type="text" id="lHours" placeholder="e.g. 2" />
          </div>
        </div>
        <div class="form-row">
          <label>Topic</label>
          <input type="text" id="lTopic" placeholder="e.g. Python loops, LangChain agents" />
        </div>
        <div class="form-row">
          <label>Skill category</label>
          <select id="lSkill">
            ${SKILL_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
        </div>
        <div class="form-row">
          <label>Notes</label>
          <textarea id="lNotes" rows="2" placeholder="What clicked? What's still confusing?"></textarea>
        </div>
        <div class="realign-actions">
          <button class="btn" id="cancelBtn">Cancel</button>
          <button class="btn btn-primary" id="saveBtn">Save</button>
        </div>
      </div>
    `;

    slot.querySelector('#cancelBtn').addEventListener('click', ()=>{ formOpen = false; paint(); });
    slot.querySelector('#saveBtn').addEventListener('click', ()=>{
      const topic = slot.querySelector('#lTopic').value.trim();
      if (!topic){ alert('What did you study? Add a topic.'); return; }
      state.learning.push({
        id: Store.uid(),
        date: slot.querySelector('#lDate').value || today,
        hours: parseFloat(slot.querySelector('#lHours').value) || 0,
        topic,
        skillCategory: slot.querySelector('#lSkill').value,
        notes: slot.querySelector('#lNotes').value.trim()
      });
      onChange();
      formOpen = false;
      paint();
    });
  }
}

window.renderLearning = renderLearning;
