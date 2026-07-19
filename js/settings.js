function renderSettings(container, state, onChange){
  paint();

  function paint(){
    const isLight = state.settings.theme === 'light';
    container.innerHTML = `
      <button class="icon-btn" id="backBtn" style="margin-bottom:14px;">← Back</button>
      <p class="eyebrow">Settings</p>
      <h1 style="font-size:22px; margin-bottom:14px;">Preferences & data</h1>

      <div class="card">
        <p class="eyebrow" style="margin-bottom:10px;">Appearance</p>
        <div class="more-row" id="themeToggle" style="cursor:pointer;">
          <span class="more-icon">${isLight ? '☀' : '☾'}</span>
          <span class="more-text">
            <span class="more-label">${isLight ? 'Light mode' : 'Dark mode'}</span>
            <span class="more-desc">Tap to switch to ${isLight ? 'dark' : 'light'}</span>
          </span>
        </div>
      </div>

      <div class="card">
        <p class="eyebrow" style="margin-bottom:10px;">Backup</p>
        <p style="font-size:12.5px; color:var(--text-dim); margin:0 0 12px;">Everything lives only on this device. Export regularly so you never lose your history.</p>
        <button class="btn btn-primary" id="exportBtn" style="width:100%; margin-bottom:10px;">Export data (.json)</button>
        <label class="btn" style="width:100%; text-align:center; display:block; cursor:pointer;">
          Restore from backup
          <input type="file" id="importInput" accept="application/json" style="display:none;" />
        </label>
      </div>

      <div class="card" style="border-color:var(--danger);">
        <p class="eyebrow" style="color:var(--danger); margin-bottom:10px;">Danger zone</p>
        <button class="btn" id="resetBtn" style="width:100%; border-color:var(--danger); color:var(--danger);">Reset all data</button>
      </div>
    `;

    container.querySelector('#backBtn').addEventListener('click', ()=> window.navigate('more'));

    container.querySelector('#themeToggle').addEventListener('click', ()=>{
      state.settings.theme = isLight ? 'dark' : 'light';
      onChange();
      window.applyTheme(state);
      paint();
    });

    container.querySelector('#exportBtn').addEventListener('click', ()=>{
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `execution-os-backup-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    container.querySelector('#importInput').addEventListener('change', (e)=>{
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const restored = JSON.parse(reader.result);
          if (!restored.vision || !restored.settings){
            alert('This file doesn\'t look like a valid Execution OS backup.');
            return;
          }
          if (!confirm('This will replace all current data with the backup. Continue?')) return;
          Object.assign(state, structuredClone({ ...Store.DEFAULT_STATE, ...restored }));
          onChange();
          window.applyTheme(state);
          paint();
          alert('Backup restored.');
        } catch (err){
          alert('Could not read that file. Make sure it\'s a valid backup.');
        }
      };
      reader.readAsText(file);
    });

    container.querySelector('#resetBtn').addEventListener('click', ()=>{
      if (!confirm('This deletes everything — Vision, Goals, Daily logs, everything. This cannot be undone. Continue?')) return;
      if (!confirm('Are you absolutely sure? Consider exporting a backup first.')) return;
      Object.assign(state, structuredClone(Store.DEFAULT_STATE));
      onChange();
      window.applyTheme(state);
      window.navigate('dashboard');
    });
  }
}

window.renderSettings = renderSettings;
