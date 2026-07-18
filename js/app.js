(function(){
  let state = Store.loadState();
  const view = document.getElementById('view');
  const tabbar = document.getElementById('tabbar');
  const driftPill = document.getElementById('driftPill');

  const LOCKED_LABELS = {
    goals: 'Goals',
    daily: 'Daily Execution',
    more: 'More modules'
  };

  function onChange(){
    Store.saveState(state);
    updateDriftPill();
  }

  function updateDriftPill(){
    if (state.vision.lockedAt){
      const d = Store.daysSince(state.vision.lockedAt);
      driftPill.textContent = `heading locked · day ${d}`;
    } else {
      driftPill.textContent = 'no heading set';
    }
  }

  function renderLocked(route){
    const tpl = document.getElementById('tpl-locked');
    const node = tpl.content.cloneNode(true);
    node.querySelector('h2').textContent = LOCKED_LABELS[route] || 'Coming soon';
    view.innerHTML = '';
    view.appendChild(node);
  }

  function navigate(route){
    [...tabbar.querySelectorAll('.tab')].forEach(t=>{
      t.classList.toggle('active', t.dataset.route === route);
    });

    if (route === 'dashboard') renderDashboard(view, state, onChange);
    else if (route === 'vision') renderVision(view, state, onChange);
    else renderLocked(route);

    window.location.hash = route;
  }

  tabbar.addEventListener('click', (e)=>{
    const btn = e.target.closest('.tab');
    if (!btn) return;
    navigate(btn.dataset.route);
  });

  window.navigate = navigate; // exposed so dashboard's empty-state button can jump to Vision

  updateDriftPill();
  const startRoute = (window.location.hash || '#dashboard').slice(1);
  navigate(['dashboard','vision'].includes(startRoute) ? startRoute : 'dashboard');
})();
