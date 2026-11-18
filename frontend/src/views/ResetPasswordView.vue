<template>
  <main class="auth-page">
    <form class="auth-card" @submit.prevent="handleResetPassword">
      <h1>Redefinir senha</h1>
      <p v-if="simulatedCode" class="demo-code">
        Ambiente de demonstração: utilize o código <strong>{{ simulatedCode }}</strong> para redefinir sua senha.
      </p>

      <div class="form-group">
        <label for="code">Código de verificação</label>
        <input id="code" v-model.trim="form.code" type="text" inputmode="numeric" maxlength="6" pattern="[0-9]{6}" required />
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
        {{ loading ? 'Salvando...' : 'Redefinir senha' }}
      </button>
    </form>
  </main>
</template>

<script>
import axiosInstance from '../services/axiosInstance';

export default {
  name: 'ResetPasswordView',
  data() {
    return {
      simulatedCode: this.$route.query.code || '',
      form: {
        code: this.$route.query.code || '',
        newPassword: '',
        confirmPassword: ''
      },
      loading: false,
      errorMessage: '',
      successMessage: ''
    };
  },
  methods: {
    async handleResetPassword() {
      this.errorMessage = '';
      this.successMessage = '';
      if (this.form.newPassword !== this.form.confirmPassword) {
        this.errorMessage = 'A confirmação da nova senha não corresponde.';
        return;
      }

      this.loading = true;
      try {
        const response = await axiosInstance.post('/auth/reset-password', {
          code: this.form.code,
          newPassword: this.form.newPassword
        });
        this.successMessage = response.data.message;
        setTimeout(() => this.$router.push({ name: 'login' }), 1200);
      } catch (error) {
        this.errorMessage = error.response?.data?.error || 'Não foi possível redefinir a senha.';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.auth-page { min-height: 70vh; display: flex; justify-content: center; align-items: center; padding: 20px; }
.auth-card { width: 100%; max-width: 420px; padding: 28px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 2px 6px rgba(0, 0, 0, .04); text-align: left; }
.auth-card h1 { margin-top: 0; text-align: center; }
.subtitle { color: #64748b; text-align: center; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-weight: 600; margin-bottom: 6px; }
.form-group input { width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; }
.btn-primary { width: 100%; border: 0; border-radius: 6px; padding: 10px; color: #fff; background: linear-gradient(135deg, #facc15, #f97316); cursor: pointer; font-weight: 600; }
.btn-primary:disabled { opacity: .6; cursor: not-allowed; }
.alert { padding: 10px 12px; border-radius: 6px; margin-bottom: 14px; font-size: 14px; }
.alert.error { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
.alert.success { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.demo-code { padding: 12px; border-radius: 6px; margin-bottom: 16px; background: #fffbeb; color: #92400e; border: 1px solid #fde68a; text-align: center; }
</style>
