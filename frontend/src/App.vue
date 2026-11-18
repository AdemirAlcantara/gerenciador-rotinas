<template>
  <div class="app-shell">
    <header v-if="isAuthenticated" class="app-header">
      <nav class="navbar" aria-label="Navegação principal">
        <router-link to="/" class="brand" aria-label="Ir para o início">
          <span class="brand-mark">R</span>
          <span class="brand-name">Check-ins</span>
        </router-link>

        <div class="nav-links">
          <router-link to="/" exact>Início</router-link>
          <router-link to="/habit-categories">Categorias</router-link>
          <router-link to="/habits">Hábitos</router-link>
          <router-link to="/tasks">Tarefas</router-link>
          <router-link to="/habit-check-ins">Check-ins</router-link>
        </div>

        <div class="nav-user">
          <router-link to="/account" class="account-button" :title="userName">
            <span class="avatar">{{ initials }}</span>
            <span class="account-label">Minha conta</span>
          </router-link>
          <button class="logout-button" type="button" @click="logout" aria-label="Sair">
            Sair
          </button>
        </div>
      </nav>
    </header>

    <main :class="isAuthenticated ? 'app-content' : 'auth-content'">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      authenticated: Boolean(localStorage.getItem('token')),
      user: JSON.parse(localStorage.getItem('user') || 'null')
    };
  },
  computed: {
    isAuthenticated() {
      return this.authenticated;
    },
    userName() {
      return this.user?.name || this.user?.email || 'Minha conta';
    },
    initials() {
      const source = this.userName.trim();
      return source
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
    }
  },
  mounted() {
    window.addEventListener('auth-change', this.refreshAuthState);
  },
  beforeUnmount() {
    window.removeEventListener('auth-change', this.refreshAuthState);
  },
  methods: {
    refreshAuthState() {
      this.authenticated = Boolean(localStorage.getItem('token'));
      this.user = JSON.parse(localStorage.getItem('user') || 'null');
    },
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.authenticated = false;
      this.$router.push({ name: 'login' });
    }
  }
};
</script>

<style>
* {
  box-sizing: border-box;
}

html,
body,
#app {
  min-height: 100%;
  margin: 0;
}

body {
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #1e293b;
  background: #f4f7fb;
}

input,
textarea,
select,
button {
  font-family: inherit;
}

table {
  table-layout: fixed;
}

th,
td {
  overflow-wrap: anywhere;
  word-break: break-word;
}

.app-shell {
  min-height: 100vh;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(255, 255, 255, 0.96);
  border-bottom: 1px solid #e5eaf1;
  backdrop-filter: blur(12px);
}

.navbar {
  max-width: 1180px;
  min-height: 72px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 28px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #0f172a;
  text-decoration: none;
  font-weight: 800;
  white-space: nowrap;
}

.brand-mark {
  width: 38px;
  height: 38px;
  display: inline-grid;
  place-items: center;
  border-radius: 11px;
  color: #fff;
  background: linear-gradient(135deg, #facc15, #f97316);
  box-shadow: 0 7px 18px rgba(249, 115, 22, 0.24);
  font-size: 18px;
}

.brand-name {
  font-size: 20px;
  letter-spacing: -0.3px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.nav-links a {
  padding: 9px 11px;
  border-radius: 8px;
  color: #64748b;
  text-decoration: none;
  font-size: 14px;
  font-weight: 700;
  transition: 0.18s ease;
}

.nav-links a:hover {
  color: #1e293b;
  background: #f1f5f9;
}

.nav-links a.router-link-active {
  color: #16845a;
  background: #edf8f3;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.account-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #334155;
  text-decoration: none;
  font-weight: 700;
  font-size: 14px;
}

.avatar {
  width: 34px;
  height: 34px;
  display: inline-grid;
  place-items: center;
  border-radius: 50%;
  color: #fff;
  background: #1e293b;
  font-size: 12px;
  letter-spacing: 0.3px;
}

.logout-button {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 10px;
  background: #fff;
  color: #64748b;
  cursor: pointer;
  font-weight: 700;
  font-size: 13px;
}

.logout-button:hover {
  color: #dc2626;
  border-color: #fecaca;
  background: #fef2f2;
}

.app-content {
  max-width: 1180px;
  margin: 0 auto;
  padding: 32px 24px 48px;
}

.auth-content {
  min-height: 100vh;
}

@media (max-width: 900px) {
  .navbar {
    min-height: 64px;
    flex-wrap: wrap;
    gap: 10px;
    padding-top: 10px;
    padding-bottom: 10px;
  }

  .nav-links {
    order: 3;
    width: 100%;
    overflow-x: auto;
  }

  .nav-user {
    margin-left: auto;
  }
}

@media (max-width: 520px) {
  .navbar,
  .app-content {
    padding-left: 16px;
    padding-right: 16px;
  }

  .brand-name,
  .account-label {
    display: none;
  }
}
</style>
