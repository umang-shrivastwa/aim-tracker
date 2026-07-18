const MORE_MODULES = [
  { id: 'learning', icon: '◐', label: 'Learning Tracker', desc: 'What you studied, hours, topic', built: true },
  { id: 'shipping', icon: '▲', label: 'Shipping Tracker', desc: 'What you actually built and shipped', built: true },
  { id: 'projects', icon: '◫', label: 'Project Tracker', desc: 'Multi-stage projects like Fingyaan', built: false },
  { id: 'achievements', icon: '★', label: 'Achievement Timeline', desc: 'Your growth, recorded', built: false },
  { id: 'critical', icon: '⚠', label: 'Critical Tasks', desc: 'Must finish soon, stays visible', built: false },
  { id: 'reflection', icon: '◑', label: 'Daily Reflection', desc: 'Learned, built, tomorrow', built: false },
  { id: 'analytics', icon: '▥', label: 'Analytics', desc: 'Stats generated from your own data', built: false },
  { id: 'settings', icon: '⚙', label: 'Settings', desc: 'Theme, backup, export', built: false }
];

function renderMore(container, state, onChange){
  container.innerHTML = `
    <p class="eyebrow">More · ${MORE_MODULES.filter(m=>m.built).length}/${MORE_MODULES.length} built</p>
    <h1 style="font-size:22px; margin-bottom:14px;">Full module map</h1>
    <div class="more-list"></div>
  `;

  const list = container.querySelector('.more-list');
  list.innerHTML = MORE_MODULES.map(m => `
    <button class="more-row ${m.built ? '' : 'unbuilt'}" data-module="${m.id}">
      <span class="more-icon">${m.icon}</span>
      <span class="more-text">
        <span class="more-label">${m.label}</span>
        <span class="more-desc">${m.desc}</span>
      </span>
      <span class="more-status">${m.built ? '' : 'SOON'}</span>
    </button>
  `).join('');

  list.querySelectorAll('.more-row').forEach(row=>{
    row.addEventListener('click', ()=>{
      const mod = MORE_MODULES.find(m => m.id === row.dataset.module);
      if (mod.built){
        window.navigate(mod.id);
      } else {
        renderComingSoon(container, mod);
      }
    });
  });
}

function renderComingSoon(container, mod){
  container.innerHTML = `
    <button class="icon-btn" id="backToMore" style="margin-bottom:14px;">← Back</button>
    <div class="module-locked">
      <div class="locked-glyph">${mod.icon}</div>
      <h2>${mod.label}</h2>
      <p>${mod.desc}. This ships next, once you're ready to move past Daily Execution.</p>
    </div>
  `;
  container.querySelector('#backToMore').addEventListener('click', ()=> window.navigate('more'));
}

window.renderMore = renderMore;
