function renderAnalytics(container, state, onChange){
  const totalHours = state.learning.reduce((s,e) => s + Number(e.hours||0), 0);
  const shippedCount = state.shipping.filter(e => e.status === 'Shipped').length;
  const totalShippingEntries = state.shipping.length;

  const allTasks = state.daily.flatMap(d => d.tasks);
  const doneTasks = allTasks.filter(t => t.completed).length;
  const pendingTasks = allTasks.length - doneTasks;
  const taskCompletionPct = allTasks.length ? Math.round((doneTasks/allTasks.length)*100) : 0;

  const avgGoalProgress = state.goals.length
    ? Math.round(state.goals.reduce((s,g) => s + Number(g.progress||0), 0) / state.goals.length)
    : 0;
  const completedGoals = state.goals.filter(g => g.status === 'Completed').length;

  const last7 = [...Array(7)].map((_,i) => shiftDate(todayKey(), -i));
  const weekHours = state.learning.filter(e => last7.includes(e.date)).reduce((s,e)=>s+Number(e.hours||0),0);
  const weekShipped = state.shipping.filter(e => last7.includes(e.date) && e.status === 'Shipped').length;
  const weekDone = state.daily.filter(d => last7.includes(d.date)).flatMap(d=>d.tasks).filter(t=>t.completed).length;

  const totalProjectStages = state.projects.flatMap(p => p.stages);
  const doneProjectStages = totalProjectStages.filter(s => s.completed).length;

  container.innerHTML = `
    <button class="icon-btn" id="backBtn" style="margin-bottom:14px;">← Back</button>
    <p class="eyebrow">Analytics</p>
    <h1 style="font-size:22px; margin-bottom:14px;">What your data says</h1>

    <div class="card">
      <p class="eyebrow" style="margin-bottom:12px;">Learning vs Shipping · last 7 days</p>
      <div class="lvs-row">
        <span class="lvs-label">Hours learned</span>
        <div class="progress-track"><div class="progress-fill" style="width:${Math.min(weekHours*10,100)}%;"></div></div>
        <span class="progress-pct">${weekHours}h</span>
      </div>
      <div class="lvs-row">
        <span class="lvs-label">Things shipped</span>
        <div class="progress-track"><div class="progress-fill" style="width:${Math.min(weekShipped*20,100)}%;"></div></div>
        <span class="progress-pct">${weekShipped}</span>
      </div>
      <div class="lvs-row">
        <span class="lvs-label">Tasks done</span>
        <div class="progress-track"><div class="progress-fill" style="width:${Math.min(weekDone*10,100)}%;"></div></div>
        <span class="progress-pct">${weekDone}</span>
      </div>
      ${weekHours > 0 && weekShipped === 0 ? `<p style="font-size:12px; color:var(--danger); margin-top:10px;">You've learned this week but haven't shipped anything yet.</p>` : ''}
    </div>

    <div class="card">
      <p class="eyebrow" style="margin-bottom:12px;">All-time totals</p>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        ${statTile('HOURS LEARNED', totalHours)}
        ${statTile('SHIPPED', shippedCount + '/' + totalShippingEntries)}
        ${statTile('TASKS DONE', doneTasks)}
        ${statTile('TASKS PENDING', pendingTasks)}
        ${statTile('TASK COMPLETION', taskCompletionPct + '%')}
        ${statTile('AVG GOAL PROGRESS', avgGoalProgress + '%')}
        ${statTile('GOALS COMPLETED', completedGoals)}
        ${statTile('PROJECT STAGES DONE', doneProjectStages + '/' + totalProjectStages.length)}
      </div>
    </div>

    <div class="card">
      <p class="eyebrow" style="margin-bottom:12px;">Goal progress</p>
      ${state.goals.length ? state.goals.map(g => `
        <div class="lvs-row">
          <span class="lvs-label" style="max-width:100px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(g.title)}</span>
          <div class="progress-track"><div class="progress-fill" style="width:${g.progress}%;"></div></div>
          <span class="progress-pct">${g.progress}%</span>
        </div>
      `).join('') : `<div class="empty-state">No goals yet.</div>`}
    </div>
  `;

  container.querySelector('#backBtn').addEventListener('click', ()=> window.navigate('more'));
}

window.renderAnalytics = renderAnalytics;
