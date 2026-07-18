const SHIP_STATUSES = ['Shipped', 'In Progress', 'Abandoned'];

function renderShipping(container, state, onChange){
  let formOpen = false;

  paint();

  function paint(){
    const entries = [...state.shipping].sort((a,b) => b.date.localeCompare(a.date));
    const shippedCount = state.shipping.filter(e => e.status === 'Shipped').length;

    container.innerHTML = `
      <button class="icon-btn" id="backBtn" style="margin-bottom:14px;">← Back</button>
      <p class="eyebrow">Shipping Tracker · ${shippedCount} shipped total</p>
      <h1 style="font-size:22px; margin-bottom:14px;">What you built</h1>

      <div id="formSlot"></div>
      ${!formOpen ? `<button class="btn btn-primary" id="addBtn" style="width:100%; margin-bottom:16px;">+ Log something you shipped</button>` : ''}

      <div id="list"></div>
    `;

    container.querySelector('#backBtn').addEventListener('click', ()=> window.navigate('more'));

    if (formOpen) renderForm(container.querySelector('#formSlot'));

    const listEl = container.querySelector('#list');
    listEl.innerHTML = entries.length
      ? entries.map(entryHtml).join('')
      : `<div class="empty-state">Nothing shipped yet. Learning is not enough — what did you build?</div>`;

    const addBtn = container.querySelector('#addBtn');
    if (addBtn) addBtn.addEventListener('click', ()=>{ formOpen = true; paint(); });

    listEl.querySelectorAll('[data-del]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        if (!confirm('Delete this entry?')) return;
        state.shipping = state.shipping.filter(e => e.id !== btn.dataset.del);
        onChange();
        paint();
      });
    });
  }

  function entryHtml(e){
    const dateTxt = new Date(e.date).toLocaleDateString('en-IN', {day:'numeric', month:'short'});
    const statusClass = 'status-' + e.status.toLowerCase().replace(/\s+/g,'-');
    return `
      <div class="card goal-card">
        <div class="goal-top">
          <div class="badges">
            <span class="badge ${statusClass}">${e.status}</span>
          </div>
          <div class="goal-actions">
            <button class="icon-btn" data-del="${e.id}" style="width:30px;height:30px;font-size:13px;">✕</button>
          </div>
        </div>
        <h3 style="font-size:15px; margin:10px 0 4px;">${escapeHtml(e.title)}</h3>
        ${e.description ? `<p style="font-size:13px; color:var(--text-dim); margin:0;">${escapeHtml(e.description)}</p>` : ''}
        ${e.notes ? `<p class="goal-notes">${escapeHtml(e.notes)}</p>` : ''}
        <div class="goal-meta" style="margin-top:8px;">⏱ ${dateTxt}</div>
      </div>
    `;
  }

  function renderForm(slot){
    const today = new Date().toISOString().slice(0,10);
    slot.innerHTML = `
      <div class="card">
        <p class="eyebrow">New shipping entry</p>
        <div class="form-row">
          <label>Title</label>
          <input type="text" id="sTitle" placeholder="e.g. Calculator using loops" />
        </div>
        <div class="form-row">
          <label>Description</label>
          <textarea id="sDesc" rows="2" placeholder="What does it do? What problem does it solve?"></textarea>
        </div>
        <div class="form-row-split">
          <div class="form-row">
            <label>Date</label>
            <input type="date" id="sDate" value="${today}" />
          </div>
          <div class="form-row">
            <label>Status</label>
            <select id="sStatus">
              ${SHIP_STATUSES.map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-row">
          <label>Notes</label>
          <textarea id="sNotes" rows="2" placeholder="Optional"></textarea>
        </div>
        <div class="realign-actions">
          <button class="btn" id="cancelBtn">Cancel</button>
          <button class="btn btn-primary" id="saveBtn">Save</button>
        </div>
      </div>
    `;

    slot.querySelector('#cancelBtn').addEventListener('click', ()=>{ formOpen = false; paint(); });
    slot.querySelector('#saveBtn').addEventListener('click', ()=>{
      const title = slot.querySelector('#sTitle').value.trim();
      if (!title){ alert('What did you ship? Add a title.'); return; }
      state.shipping.push({
        id: Store.uid(),
        title,
        description: slot.querySelector('#sDesc').value.trim(),
        date: slot.querySelector('#sDate').value || today,
        status: slot.querySelector('#sStatus').value,
        notes: slot.querySelector('#sNotes').value.trim()
      });
      onChange();
      formOpen = false;
      paint();
    });
  }
}

window.renderShipping = renderShipping;
