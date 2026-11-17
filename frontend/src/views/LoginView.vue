<template>
  <main class="auth-page">
    <form class="auth-card" @submit.prevent="handleLogin">
      <h1>Entrar</h1>
      <p class="subtitle">Acesse o Gerenciador de Rotinas</p>

      <div class="form-group">
        <label for="email">E-mail</label>
        <input id="email" v-model.trim="form.email" type="email" required autocomplete="email" />
      </div>

      <div class="form-group">
        <label for="password">Senha</label>
        <input id="password" v-model="form.password" type="password" required autocomplete="current-password" />
      </div>

      <p v-if="errorMessage" class="alert error">{{ errorMessage }}</p>
      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? 'Entrando...' : 'Entrar' }}
      </button>
      <p class="register-link">
        Ainda não tem uma conta?
        <router-link :to="{ name: 'register' }">Registre-se agora</router-link>
      </p>
    </form>
  </main>
</template>

<script>
import axiosInstance from '../services/axiosInstance';

export default {
  name: 'LoginView',
  data() {
    return {
      form: { email: '', password: '' },
      loading: false,
      errorMessage: ''
    };
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      this.errorMessage = '';
      try {
        const response = await axiosInstance.post('/auth/login', this.form);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        window.dispatchEvent(new Event('auth-change'));
        const redirect = this.$route.query.redirect || '/';
        await this.$router.push(redirect);
      } catch (error) {
        this.errorMessage = error.response?.data?.error || 'Não foi possível realizar o login.';
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
.btn-primary { width: 100%; border: 0; border-radius: 6px; padding: 10px; color: #fff; background: #42b983; cursor: pointer; font-weight: 600; }
.btn-primary:disabled { opacity: .6; cursor: not-allowed; }
.alert { padding: 10px 12px; border-radius: 6px; margin-bottom: 14px; font-size: 14px; }
.alert.error { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
.register-link { margin: 18px 0 0; text-align: center; color: #64748b; font-size: 14px; }
.register-link a { color: #42b983; font-weight: 600; }
</style>
