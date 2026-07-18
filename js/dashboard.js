function renderDashboard(container, state, onChange){
  const v = state.vision;

  if (!v.lockedAt){
    container.innerHTML = `
      <div class="module-locked" style="padding-top:40px;">
        <div class="locked-glyph">⌖</div>
        <h2>No heading set yet</h2>
        <p>Go to the Vision tab and lock your yearly direction. Your dashboard anchors to it from there.</p>
        <button class="btn btn-primary" id="goVisionBtn" style="margin-top:16px;">Set your heading</button>
      </div>
    `;
    container.querySelector('#goVisionBtn').addEventListener('click', ()=> window.navigate('vision'));
    return;
  }

  const days = Store.daysSince(v.lockedAt);
  const today = new Date().toDateString();
  const todayKeyStr = new Date().toISOString().slice(0,10);
  const todayEntry = state.daily.find(d => d.date === todayKeyStr);
  const todayTasks = todayEntry ? todayEntry.tasks : [];
  const checkedInToday = v.realignLog.some(r => new Date(r.date).toDateString() === today);
  const lastEntry = v.realignLog[v.realignLog.length - 1];

  container.innerHTML = `
    <p class="eyebrow">Today's mission</p>

    <div class="card" style="text-align:center;">
      ${bearingRingSvg(days)}
      <p class="heading-statement" style="font-size:16px; margin-top:10px;">${escapeHtml(v.statement)}</p>
      <p style="color:var(--text-dim); font-size:12px; margin:-6px 0 14px;">
        ${v.directions.length} active direction${v.directions.length===1?'':'s'} · locked ${new Date(v.lockedAt).toLocaleDateString()}
      </p>

      ${checkedInToday
        ? `<div style="font-family:var(--font-mono); font-size:12px; color:${lastEntry.onTrack ? 'var(--teal)' : 'var(--danger)'};">
             Today's check-in: ${lastEntry.onTrack ? 'ON HEADING' : 'DRIFTED'}
           </div>`
        : `<div class="realign-actions">
             <button class="btn" id="offTrackBtn" style="border-color:var(--danger);">I'm drifting</button>
             <button class="btn btn-primary" id="onTrackBtn">Still on heading</button>
           </div>`
      }
    </div>

    <div class="card">
      <p class="eyebrow" style="margin-bottom:12px;">Quick stats</p>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        ${statTile('DAYS COMMITTED', days)}
        ${statTile('DIRECTIONS', v.directions.length)}
        ${statTile('ACTIVE GOALS', state.goals.filter(g=>g.status!=='Completed').length)}
        ${statTile('GOALS COMPLETED', state.goals.filter(g=>g.status==='Completed').length)}
        ${statTile('TODAY: DONE', todayTasks.filter(t=>t.completed).length)}
        ${statTile('TODAY: PENDING', todayTasks.filter(t=>!t.completed).length)}
        ${statTile('HOURS LEARNED', state.learning.reduce((s,e)=>s+Number(e.hours||0),0))}
        ${statTile('THINGS SHIPPED', state.shipping.filter(e=>e.status==='Shipped').length)}
        ${statTile('PROJECTS', state.projects.length)}
      </div>
    </div>

    <div class="card" style="opacity:.55;">
      <p class="eyebrow">Coming next</p>
      <p style="font-size:13px; color:var(--text-dim); margin:0;">
        Achievements, Critical Tasks, Reflection and Analytics will populate this dashboard as each module ships.
      </p>
    </div>
  `;

  const bindCheckIn = (onTrack) => {
    v.realignLog.push({ date: new Date().toISOString(), onTrack });
    onChange();
    renderDashboard(container, state, onChange);
  };
  const onBtn = container.querySelector('#onTrackBtn');
  const offBtn = container.querySelector('#offTrackBtn');
  if (onBtn) onBtn.addEventListener('click', ()=> bindCheckIn(true));
  if (offBtn) offBtn.addEventListener('click', ()=> bindCheckIn(false));
}

function statTile(label, value){
  return `
    <div style="background:var(--panel-raised); border:1px solid var(--border); border-radius:10px; padding:12px;">
      <div style="font-family:var(--font-mono); font-size:20px; color:var(--amber);">${value}</div>
      <div style="font-family:var(--font-mono); font-size:9px; color:var(--text-dim); letter-spacing:.06em; margin-top:2px;">${label}</div>
    </div>
  `;
}

function bearingRingSvg(days){
  const size = 148, cx = size/2, cy = size/2, r = 62;
  const circumference = 2 * Math.PI * r;
  // decorative tick marks, purely instrument-panel styling, not a literal progress bar
  let ticks = '';
  for (let i = 0; i < 24; i++){
    const angle = (i / 24) * 2 * Math.PI;
    const len = i % 6 === 0 ? 8 : 4;
    const x1 = cx + (r+6) * Math.sin(angle);
    const y1 = cy - (r+6) * Math.cos(angle);
    const x2 = cx + (r+6+len) * Math.sin(angle);
    const y2 = cy - (r+6+len) * Math.cos(angle);
    ticks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--border)" stroke-width="1.5"/>`;
  }
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      ${ticks}
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--border)" stroke-width="2"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--amber)" stroke-width="2"
        stroke-dasharray="${circumference}" stroke-dashoffset="${circumference * 0.18}" stroke-linecap="round"
        transform="rotate(-90 ${cx} ${cy})" opacity="0.85"/>
      <text x="${cx}" y="${cy-2}" text-anchor="middle" class="bearing-number">${days}</text>
      <text x="${cx}" y="${cy+16}" text-anchor="middle" class="bearing-label">DAYS ON HEADING</text>
    </svg>
  `;
}

window.renderDashboard = renderDashboard;
