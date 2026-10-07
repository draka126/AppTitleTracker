const bar = document.getElementById('bar');
const lockBtn = document.getElementById('lock');
const editBtn = document.getElementById('edit');
const closeBtn = document.getElementById('close');
const titleEl = document.getElementById('title');
const input = document.getElementById('url');

let state = { locked: true, url: '' };
let editing = false;

function render() {
  bar.classList.toggle('drag', !state.locked && !editing);
  lockBtn.textContent = state.locked ? '🔒' : '🔓';
  lockBtn.title = state.locked ? 'Sblocca (rende la finestra trascinabile)' : 'Blocca in basso a sinistra';
}

function startEdit() {
  editing = true;
  titleEl.hidden = true;
  input.hidden = false;
  input.value = state.url;
  render();
  input.focus();
  input.select();
}

function endEdit() {
  editing = false;
  input.hidden = true;
  titleEl.hidden = false;
  render();
}

lockBtn.addEventListener('click', () => window.api.toggleLock());
editBtn.addEventListener('click', startEdit);
closeBtn.addEventListener('click', () => window.api.quit());

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const v = input.value.trim();
    if (v) window.api.setUrl(v);
    endEdit();
  } else if (e.key === 'Escape' && state.url) {
    endEdit();
  }
});
input.addEventListener('blur', () => { if (state.url) endEdit(); });

window.api.onTitle((t) => { titleEl.textContent = t; titleEl.title = t; });
window.api.onState((s) => {
  state = s;
  render();
  if (!s.url && !editing) startEdit();
});
