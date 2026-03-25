import { defineStore } from 'pinia';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    message: '',
    type: 'error', // 'error', 'success', 'info'
    visible: false,
    timeout: null,
    
    // Confirm Dialog State
    confirmVisible: false,
    confirmTitle: '',
    confirmMessage: '',
    onConfirm: null,
    onCancel: null
  }),
  actions: {
    notify(message, type = 'error', duration = 5000) {
      if (this.timeout) clearTimeout(this.timeout);
      
      this.message = message;
      this.type = type;
      this.visible = true;
      
      this.timeout = setTimeout(() => {
        this.visible = false;
      }, duration);
    },
    hide() {
      this.visible = false;
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
