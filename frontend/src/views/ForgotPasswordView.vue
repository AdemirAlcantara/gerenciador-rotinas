<template>
  <main class="auth-page">
    <form class="auth-card" @submit.prevent="handleForgotPassword">
      <h1>Recuperar senha</h1>
      <p class="subtitle">Informe seu e-mail para gerar o código de redefinição.</p>

      <div class="form-group">
        <label for="email">E-mail</label>
        <input id="email" v-model.trim="email" type="email" required autocomplete="email" />
      </div>

      <p v-if="errorMessage" class="alert error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="alert success">{{ successMessage }}</p>
      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? 'Gerando...' : 'Enviar código' }}
      </button>
      <p class="back-link">
        <router-link :to="{ name: 'login' }">Voltar para o login</router-link>
      </p>
    </form>
  </main>
</template>

<script>
import axiosInstance from '../services/axiosInstance';

export default {
  name: 'ForgotPasswordView',
  data() {
    return {
      email: '',
      loading: false,
      errorMessage: '',
      successMessage: ''
    };
  },
  methods: {
    async handleForgotPassword() {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';
      try {
        const response = await axiosInstance.post('/auth/forgot-password', { email: this.email });
        if (response.data.simulatedCode) {
          await this.$router.push({
            name: 'reset-password',
            query: { code: response.data.simulatedCode }
          });
        } else {
          this.successMessage = response.data.message;
        }
      } catch (error) {
        this.errorMessage = error.response?.data?.error || 'Não foi possível gerar o código.';
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
.back-link { margin: 18px 0 0; text-align: center; font-size: 14px; }
.back-link a { color: #c2410c; font-weight: 600; }
</style>
