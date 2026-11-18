<template>
  <div class="notification-page">
    <div class="page-heading">
      <div>
        <h1>Notificações</h1>
        <p>Acompanhe os avisos sobre as suas tarefas pendentes.</p>
      </div>
      <button class="btn-secondary" type="button" @click="fetchNotifications" :disabled="loading">
        Atualizar
      </button>
    </div>

    <p v-if="errorMessage" class="alert error">{{ errorMessage }}</p>
    <p v-if="loading">Carregando notificações...</p>
    <p v-else-if="notifications.length === 0" class="empty-state">
      Nenhuma notificação disponível.
    </p>

    <section v-else class="notification-list">
      <article
        v-for="notification in notifications"
        :key="notification._id"
        class="notification-card"
        :class="{ unread: !notification.read }"
      >
        <button
          class="dismiss-button"
          type="button"
          :aria-label="`Ocultar notificação: ${notification.message}`"
          title="Ocultar notificação"
          @click="dismissNotification(notification)"
        >
          ×
        </button>
        <div class="notification-content">
          <span class="notification-status">{{ notification.read ? 'Lida' : 'Nova' }}</span>
          <h2>{{ notification.message }}</h2>
          <p v-if="notification.task?.description">{{ notification.task.description }}</p>
          <small>Data da tarefa: {{ formatDate(notification.dueDate) }}</small>
        </div>
        <button
          v-if="!notification.read"
          class="btn-primary"
          type="button"
          @click="markAsRead(notification)"
        >
          Marcar como lida
        </button>
      </article>
    </section>
  </div>
</template>

<script>
import axiosInstance from '../services/axiosInstance';

export default {
  name: 'NotificationView',
  data() {
    return {
      notifications: [],
      loading: false,
      errorMessage: ''
    };
  },
  mounted() {
    this.fetchNotifications();
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return '—';
      const [year, month, day] = String(dateString).slice(0, 10).split('-');
      return year && month && day ? `${day}/${month}/${year}` : dateString;
    },
    async fetchNotifications() {
      this.loading = true;
      this.errorMessage = '';
      try {
        const response = await axiosInstance.get('/notifications');
        this.notifications = response.data;
        window.dispatchEvent(new Event('notifications-change'));
      } catch (error) {
        this.errorMessage = error.response?.data?.error || 'Não foi possível carregar as notificações.';
      } finally {
        this.loading = false;
      }
    },
    async markAsRead(notification) {
      try {
        const response = await axiosInstance.patch(`/notifications/${notification._id}/read`);
        const index = this.notifications.findIndex((item) => item._id === notification._id);
        if (index !== -1) {
          this.notifications.splice(index, 1, response.data);
        }
        window.dispatchEvent(new Event('notifications-change'));
      } catch (error) {
        this.errorMessage = error.response?.data?.error || 'Não foi possível atualizar a notificação.';
      }
    },
    async dismissNotification(notification) {
      try {
        await axiosInstance.patch(`/notifications/${notification._id}/dismiss`);
        this.notifications = this.notifications.filter((item) => item._id !== notification._id);
        window.dispatchEvent(new Event('notifications-change'));
      } catch (error) {
        this.errorMessage = error.response?.data?.error || 'Não foi possível retirar a notificação.';
      }
    }
  }
};
</script>

<style scoped>
.notification-page { max-width: 900px; margin: 0 auto; padding: 20px; text-align: left; }
.page-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 20px; }
.page-heading h1 { margin: 0 0 6px; }
.page-heading p { margin: 0; color: #64748b; }
.notification-list { display: grid; gap: 12px; }
.notification-card { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 18px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; }
.notification-content { flex: 1; min-width: 0; padding-right: 34px; }
.dismiss-button { position: absolute; top: 10px; right: 10px; width: 28px; height: 28px; display: inline-grid; place-items: center; border: 0; border-radius: 50%; color: #64748b; background: #f1f5f9; font-size: 19px; line-height: 1; }
.dismiss-button:hover { color: #b91c1c; background: #fee2e2; }
.notification-card.unread { border-left: 4px solid #f97316; }
.notification-card h2 { margin: 6px 0; font-size: 17px; }
.notification-card p { margin: 0 0 8px; color: #475569; overflow-wrap: anywhere; }
.notification-card small { color: #64748b; }
.notification-status { color: #f97316; font-size: 12px; font-weight: 700; text-transform: uppercase; }
.btn-primary, .btn-secondary { border: 0; border-radius: 6px; padding: 9px 13px; cursor: pointer; font-weight: 600; white-space: nowrap; }
.btn-primary { color: #fff; background: #42b983; }
.btn-secondary { color: #334155; background: #e2e8f0; }
button:disabled { opacity: .6; cursor: not-allowed; }
.alert { padding: 10px 12px; border-radius: 6px; margin-bottom: 14px; font-size: 14px; }
.alert.error { color: #b91c1c; background: #fef2f2; border: 1px solid #fecaca; }
.empty-state { color: #64748b; font-style: italic; }
@media (max-width: 620px) {
  .page-heading, .notification-card { align-items: stretch; flex-direction: column; }
}
</style>
