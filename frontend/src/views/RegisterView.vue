<template>
  <main class="auth-page">
    <form class="auth-card" @submit.prevent="handleRegister">
      <h1>Criar conta</h1>
      <p class="subtitle">Comece a organizar seus hábitos e check-ins</p>

      <div class="form-group">
        <label for="name">Nome</label>
        <input id="name" v-model.trim="form.name" type="text" required autocomplete="name" />
      </div>

      <div class="form-group">
        <label for="email">E-mail</label>
        <input id="email" v-model.trim="form.email" type="email" required autocomplete="email" />
      </div>

      <div class="form-group">
        <label for="password">Senha</label>
        <input id="password" v-model="form.password" type="password" required autocomplete="new-password" />
      </div>

      <div class="form-group">
        <label for="confirmPassword">Confirmar senha</label>
        <input id="confirmPassword" v-model="form.confirmPassword" type="password" required autocomplete="new-password" />
      </div>

      <p v-if="errorMessage" class="alert error">{{ errorMessage }}</p>
      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? 'Criando conta...' : 'Registrar' }}
      </button>
      <p class="login-link">
        Já tem uma conta?
        <router-link :to="{ name: 'login' }">Entrar</router-link>
      </p>
    </form>
  </main>
</template>

<script>
import axiosInstance from '../services/axiosInstance';

export default {
  name: 'RegisterView',
  data() {
    return {
      form: { name: '', email: '', password: '', confirmPassword: '' },
      loading: false,
      errorMessage: ''
    };
  },
  methods: {
    async handleRegister() {
      this.errorMessage = '';
      if (this.form.password !== this.form.confirmPassword) {
        this.errorMessage = 'A confirmação da senha não corresponde.';
        return;
      }

      this.loading = true;
      try {
        await axiosInstance.post('/users', {
          name: this.form.name,
          email: this.form.email,
          password: this.form.password
        });
        try {
          const loginResponse = await axiosInstance.post('/auth/login', {
            email: this.form.email,
            password: this.form.password
          });
          localStorage.setItem('token', loginResponse.data.token);
          localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
          window.dispatchEvent(new Event('auth-change'));
          await this.$router.push({ name: 'home' });
        } catch (error) {
          this.errorMessage = 'Conta criada. Reinicie o backend e faça login para continuar.';
        }
      } catch (error) {
        this.errorMessage = error.response?.data?.error || 'Não foi possível criar a conta.';
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
.login-link { margin: 18px 0 0; text-align: center; color: #64748b; font-size: 14px; }
.login-link a { color: #42b983; font-weight: 600; }
</style>
