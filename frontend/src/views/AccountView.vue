<template>
  <main class="account-page">
    <section class="account-card">
      <h1>Minha conta</h1>
      <p v-if="user">Usuário: <strong>{{ user.email }}</strong></p>

      <form @submit.prevent="changePassword">
        <h2>Alterar senha</h2>
        <div class="form-group">
          <label for="currentPassword">Senha atual</label>
          <input id="currentPassword" v-model="form.currentPassword" type="password" required autocomplete="current-password" />
        </div>
        <div class="form-group">
          <label for="newPassword">Nova senha</label>
          <input id="newPassword" v-model="form.newPassword" type="password" required autocomplete="new-password" />
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirmar nova senha</label>
          <input id="confirmPassword" v-model="form.confirmPassword" type="password" required autocomplete="new-password" />
        </div>

        <p v-if="errorMessage" class="alert error">{{ errorMessage }}</p>
        <p v-if="successMessage" class="alert success">{{ successMessage }}</p>
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Salvando...' : 'Alterar senha' }}
        </button>
      </form>
    </section>
  </main>
</template>

<script>
import axiosInstance from '../services/axiosInstance';

export default {
  name: 'AccountView',
  data() {
    return {
      user: JSON.parse(localStorage.getItem('user') || 'null'),
      form: { currentPassword: '', newPassword: '', confirmPassword: '' },
      loading: false,
      errorMessage: '',
      successMessage: ''
    };
  },
  methods: {
    async changePassword() {
      this.errorMessage = '';
      this.successMessage = '';
      if (this.form.newPassword !== this.form.confirmPassword) {
        this.errorMessage = 'A confirmação da nova senha não corresponde.';
        return;
      }

      this.loading = true;
      try {
        await axiosInstance.put('/auth/password', {
          currentPassword: this.form.currentPassword,
          newPassword: this.form.newPassword
        });
        this.form = { currentPassword: '', newPassword: '', confirmPassword: '' };
        this.successMessage = 'Senha alterada com sucesso!';
      } catch (error) {
        this.errorMessage = error.response?.data?.error || 'Não foi possível alterar a senha.';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.account-page { max-width: 600px; margin: 0 auto; padding: 20px; text-align: left; }
.account-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; box-shadow: 0 2px 6px rgba(0, 0, 0, .04); }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-weight: 600; margin-bottom: 6px; }
.form-group input { width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; }
.btn-primary { border: 0; border-radius: 6px; padding: 10px 18px; color: #fff; background: #42b983; cursor: pointer; font-weight: 600; }
.btn-primary:disabled { opacity: .6; cursor: not-allowed; }
.alert { padding: 10px 12px; border-radius: 6px; margin-bottom: 14px; font-size: 14px; }
.alert.error { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
.alert.success { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
</style>
