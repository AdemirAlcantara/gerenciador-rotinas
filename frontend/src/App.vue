<template>
  <nav v-if="isAuthenticated">
    <router-link to="/">Home</router-link> |
    <router-link to="/habit-categories">Categorias de Hábitos</router-link> |
    <router-link to="/habits">Hábitos</router-link> |
    <router-link to="/tasks">Tarefas</router-link> |
    <router-link to="/routines">Rotinas</router-link> |
    <router-link to="/account">Minha conta</router-link> |
    <button class="logout-button" @click="logout">Sair</button>
  </nav>
  <router-view/>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      authenticated: Boolean(localStorage.getItem('token'))
    };
  },
  computed: {
    isAuthenticated() {
      return this.authenticated;
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
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}

.logout-button {
  border: 0;
  background: transparent;
  color: #2c3e50;
  font: inherit;
  font-weight: bold;
  cursor: pointer;
}
</style>
