import { defineStore } from 'pinia';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    message: '',
    type: 'error', // 'error', 'success', 'info'
    visible: false,
    timeout: null,
    showCopyLogs: false,
    
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
    notify(message, type = 'error', duration = 5000, showCopyLogs = null) {
      if (this.timeout) clearTimeout(this.timeout);

      this.message = message;
      this.type = type;
      this.visible = true;
      this.showCopyLogs = showCopyLogs === null ? type === 'error' : showCopyLogs;
      
      if (duration !== Infinity) {
        this.timeout = setTimeout(() => {
          this.visible = false;
        }, duration);
      }
    },
    hide() {
      this.visible = false;
      this.showCopyLogs = false;
      if (this.timeout) clearTimeout(this.timeout);
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
