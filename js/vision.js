function renderVision(container, state, onChange){
  const v = state.vision;

  if (!v.lockedAt){
    // ---- EDIT / SETUP MODE ----
    container.innerHTML = `
      <p class="eyebrow">Vision · not yet locked</p>
      <h1 style="font-size:22px; margin-bottom:6px;">Set your heading</h1>
      <p style="color:var(--text-dim); font-size:13.5px; margin-bottom:18px;">
        Write this once, with intent. Once locked, changing it is a deliberate act — not something you do mid-distraction.
      </p>

      <div class="card">
        <div class="form-row">
          <label>Mission statement</label>
          <textarea id="visionStatement" rows="3" placeholder="e.g. Become an AI Engineer and build financial literacy for India, on my own terms.">${escapeHtml(v.statement)}</textarea>
        </div>

        <div class="form-row">
          <label>Direction items — the tracks you're committing to</label>
          <div id="dirRows"></div>
          <div class="dir-input-row">
            <input type="text" id="newDirInput" placeholder="e.g. Grow Fingyaan channel" />
            <button class="icon-btn" id="addDirBtn">+</button>
          </div>
        </div>

        <button class="btn btn-primary" id="lockVisionBtn" style="width:100%; margin-top:6px;">Lock this heading</button>
      </div>
    `;

    const dirRows = container.querySelector('#dirRows');
    function paintDirs(){
      if (!v.directions.length){
        dirRows.innerHTML = `<div class="empty-state">No direction items yet.</div>`;
        return;
      }
      dirRows.innerHTML = v.directions.map(d => `
        <div class="direction-item">
          <span class="marker">→</span>
          <span style="flex:1;">${escapeHtml(d.title)}</span>
          <button class="icon-btn" data-remove="${d.id}" style="width:28px; height:28px; font-size:13px;">✕</button>
        </div>
      `).join('');
      dirRows.querySelectorAll('[data-remove]').forEach(btn=>{
        btn.addEventListener('click', ()=>{
          v.directions = v.directions.filter(d => d.id !== btn.dataset.remove);
          onChange();
          paintDirs();
        });
      });
    }
    paintDirs();

    container.querySelector('#addDirBtn').addEventListener('click', ()=>{
      const input = container.querySelector('#newDirInput');
      const val = input.value.trim();
      if (!val) return;
      v.directions.push({ id: Store.uid(), title: val });
      input.value = '';
      onChange();
      paintDirs();
    });
    container.querySelector('#newDirInput').addEventListener('keydown', (e)=>{
      if (e.key === 'Enter') container.querySelector('#addDirBtn').click();
    });

    container.querySelector('#lockVisionBtn').addEventListener('click', ()=>{
      v.statement = container.querySelector('#visionStatement').value.trim();
      if (!v.statement){
        alert('Write your mission statement before locking.');
        return;
      }
      v.lockedAt = new Date().toISOString();
      onChange();
      renderVision(container, state, onChange);
    });

    return;
  }

  // ---- LOCKED VIEW ----
  const days = Store.daysSince(v.lockedAt);
  container.innerHTML = `
    <p class="eyebrow">Vision · locked ${days} day${days===1?'':'s'} ago</p>
    <div class="card">
      <p class="heading-statement">${escapeHtml(v.statement)}</p>
      <ul class="direction-list">
        ${v.directions.map(d => `<li class="direction-item"><span class="marker">→</span>${escapeHtml(d.title)}</li>`).join('') || '<div class="empty-state">No direction items added.</div>'}
      </ul>
      <div class="realign-actions">
        <button class="btn" id="editVisionBtn">Edit heading</button>
      </div>
    </div>
    <p style="color:var(--text-dim); font-size:12px; text-align:center;">
      This is what you decided. When you're distracted, this is where you come back to — not a new plan.
    </p>
  `;

  container.querySelector('#editVisionBtn').addEventListener('click', ()=>{
    const sure = confirm('Editing your locked heading is a deliberate act, not a distraction move. Continue?');
    if (!sure) return;
    v.lockedAt = null;
    onChange();
    renderVision(container, state, onChange);
  });
}

function escapeHtml(str){
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

window.renderVision = renderVision;
