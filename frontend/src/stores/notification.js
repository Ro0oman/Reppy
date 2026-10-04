import { defineStore } from 'pinia';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    message: '',
    type: 'error', // 'error', 'success', 'info'
    visible: false,
    timeout: null,
    showCopyLogs: false,
    // Avisos no urgentes que esperan su turno (ver notify).
    queue: [],
    
    // Confirm Dialog State
    confirmVisible: false,
    confirmTitle: '',
    confirmMessage: '',
    onConfirm: null,
    onCancel: null
  }),
  actions: {
    // `showCopyLogs` por defecto se activa en CUALQUIER error: antes era opt-in
    // (cuarto argumento) y casi ningún sitio lo pasaba, así que el botón de
    // copiar logs no aparecía justo cuando hacía falta. Se puede forzar a false
    // explícitamente para errores triviales donde el log no aporte nada.
    // Los errores se muestran al instante (pisan lo que haya, pero no la cola).
    // Los avisos de éxito/info que llegan con otro visible esperan su turno en vez
    // de pisarlo, y se acortan a 3,5 s si hay cola para que no se acumulen.
    notify(message, type = 'error', duration = 5000, showCopyLogs = null) {
      if (this.visible && type !== 'error' && this.type !== 'error') {
        if (this.queue.length < 3) this.queue.push({ message, type, duration, showCopyLogs });
        return;
      }
      this._show({ message, type, duration, showCopyLogs });
    },
    _show({ message, type, duration, showCopyLogs }) {
      if (this.timeout) clearTimeout(this.timeout);

      this.message = message;
      this.type = type;
      this.visible = true;
      this.showCopyLogs = showCopyLogs === null ? type === 'error' : showCopyLogs;

      if (duration !== Infinity) {
        const shown = this.queue.length ? Math.min(duration, 3500) : duration;
        this.timeout = setTimeout(() => this.hide(), shown);
      }
    },
    hide() {
      this.visible = false;
      this.showCopyLogs = false;
      if (this.timeout) clearTimeout(this.timeout);
      const next = this.queue.shift();
      if (next) this._show(next);
    },
    
    // Confirm Actions
    confirm(title, message, onConfirm, onCancel = null) {
      this.confirmTitle = title;
      this.confirmMessage = message;
      this.onConfirm = onConfirm;
      this.onCancel = onCancel;
      this.confirmVisible = true;
    },
    handleConfirm() {
      if (this.onConfirm) this.onConfirm();
      this.confirmVisible = false;
    },
    handleCancel() {
      if (this.onCancel) this.onCancel();
      this.confirmVisible = false;
    }
  }
});
