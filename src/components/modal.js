// ============================================
// Modal Component
// ============================================

export function showModal({ title, content, onConfirm, confirmText = 'Save', cancelText = 'Cancel', showCancel = true }) {
  const root = document.getElementById('modal-root');
  if (!root) return;

  // Remove existing modal
  root.innerHTML = '';

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h2>${title}</h2>
        <button class="modal-close" id="modal-close-btn">✕</button>
      </div>
      <div class="modal-body" id="modal-body"></div>
      <div class="modal-footer">
        ${showCancel ? `<button class="btn btn-secondary" id="modal-cancel-btn">${cancelText}</button>` : ''}
        ${onConfirm ? `<button class="btn btn-primary" id="modal-confirm-btn">${confirmText}</button>` : ''}
      </div>
    </div>
  `;

  root.appendChild(overlay);

  const body = overlay.querySelector('#modal-body');
  if (typeof content === 'string') {
    body.innerHTML = content;
  } else if (content instanceof HTMLElement) {
    body.appendChild(content);
  }

  // Close handlers
  const close = () => {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 200);
  };

  overlay.querySelector('#modal-close-btn').addEventListener('click', close);
  if (showCancel) {
    overlay.querySelector('#modal-cancel-btn')?.addEventListener('click', close);
  }
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  if (onConfirm) {
    overlay.querySelector('#modal-confirm-btn').addEventListener('click', () => {
      onConfirm(body);
      close();
    });
  }

  // ESC to close
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      close();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  return { close, body };
}
