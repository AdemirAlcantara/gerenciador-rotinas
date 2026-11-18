<template>
  <div class="dashboard">
    <section class="welcome-panel">
      <div>
        <p class="eyebrow">Painel pessoal</p>
        <h1>Olá, {{ firstName }}</h1>
        <p class="welcome-text">Organize seus hábitos, tarefas e rotinas em um só lugar.</p>
      </div>
      <router-link class="primary-action" to="/tasks">
        <span aria-hidden="true">+</span>
        Nova tarefa
      </router-link>
    </section>

    <section class="summary-grid" aria-label="Resumo da aplicação">
      <div v-if="loadError" class="load-error">
        Não foi possível carregar os dados. {{ loadError }}
      </div>
      <router-link
        v-for="item in summaryItems"
        :key="item.path"
        :to="item.path"
        class="summary-card"
      >
        <span class="summary-icon" :class="item.color" aria-hidden="true">{{ item.icon }}</span>
        <span class="summary-copy">
          <strong>{{ loadingCounts ? '...' : item.count }}</strong>
          <span>{{ item.label }}</span>
        </span>
        <span class="card-arrow" aria-hidden="true">→</span>
      </router-link>
    </section>

    <section class="quick-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Acesso rápido</p>
          <h2>O que você deseja fazer?</h2>
        </div>
      </div>

      <div class="quick-grid">
        <router-link v-for="item in summaryItems" :key="item.path" :to="item.path" class="quick-card">
          <span class="quick-icon" :class="item.color" aria-hidden="true">{{ item.icon }}</span>
          <span>
            <strong>Gerenciar {{ item.label.toLowerCase() }}</strong>
            <small>{{ item.description }}</small>
          </span>
          <span class="card-arrow" aria-hidden="true">→</span>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script>
import axiosInstance from '../services/axiosInstance';

export default {
  name: 'HomeView',
  data() {
    return {
      counts: {
        categories: 0,
        habits: 0,
        tasks: 0,
        routines: 0
      },
      loadingCounts: true,
      loadError: ''
    };
  },
  computed: {
    user() {
      return JSON.parse(localStorage.getItem('user') || 'null');
    },
    firstName() {
      return this.user?.name?.trim().split(/\s+/)[0] || 'bem-vindo';
    },
    summaryItems() {
      return [
        {
          path: '/habit-categories',
          label: 'Categorias',
          description: 'Organize seus registros por área.',
          count: this.counts.categories,
          icon: 'C',
          color: 'icon-purple'
        },
        {
          path: '/habits',
          label: 'Hábitos',
          description: 'Defina frequência e horários.',
          count: this.counts.habits,
          icon: 'H',
          color: 'icon-green'
        },
        {
          path: '/tasks',
          label: 'Tarefas',
          description: 'Acompanhe suas próximas atividades.',
          count: this.counts.tasks,
          icon: 'T',
          color: 'icon-blue'
        },
        {
          path: '/routines',
          label: 'Rotinas',
          description: 'Registre o progresso dos seus hábitos.',
          count: this.counts.routines,
          icon: 'R',
          color: 'icon-orange'
        }
      ];
    }
  },
  mounted() {
    this.loadCounts();
  },
  methods: {
    async loadCounts() {
      this.loadingCounts = true;
      this.loadError = '';
      const endpoints = [
        ['categories', '/habit-categories'],
        ['habits', '/habits'],
        ['tasks', '/tasks'],
        ['routines', '/routines']
      ];

      const results = await Promise.all(endpoints.map(async ([key, endpoint]) => {
        try {
          const response = await axiosInstance.get(endpoint);
          this.counts[key] = Array.isArray(response.data) ? response.data.length : 0;
          return null;
        } catch (error) {
          this.counts[key] = 0;
          return error.response?.data?.error || error.message || 'Erro ao acessar a API.';
        }
      }));
      const firstError = results.find(Boolean);
      this.loadError = firstError || '';
      this.loadingCounts = false;
    }
  }
};
</script>

<style scoped>
.dashboard {
  text-align: left;
}

.welcome-panel {
  min-height: 190px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 38px 42px;
  border-radius: 18px;
  color: #fff;
  background:
    radial-gradient(circle at 82% 20%, rgba(255, 255, 255, 0.14), transparent 24%),
    linear-gradient(135deg, #d97706 0%, #f97316 100%);
  box-shadow: 0 16px 38px rgba(180, 83, 9, 0.16);
}

.eyebrow {
  margin: 0 0 7px;
  color: #42b983;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
}

.welcome-panel .eyebrow {
  color: #fef3c7;
}

.welcome-panel h1 {
  margin: 0;
  font-size: clamp(28px, 4vw, 42px);
  line-height: 1.1;
  letter-spacing: -1px;
}

.welcome-text {
  margin: 12px 0 0;
  color: #fff7ed;
  font-size: 16px;
}

.primary-action {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 12px 16px;
  border-radius: 10px;
  color: #18352b;
  background: #fff;
  text-decoration: none;
  font-size: 14px;
  font-weight: 800;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
}

.primary-action span {
  font-size: 20px;
  line-height: 1;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.load-error {
  grid-column: 1 / -1;
  padding: 12px 14px;
  border: 1px solid #fecaca;
  border-radius: 10px;
  color: #b91c1c;
  background: #fef2f2;
  font-size: 14px;
}

.summary-card,
.quick-card {
  border: 1px solid #e4eaf2;
  background: #fff;
  color: #1e293b;
  text-decoration: none;
  box-shadow: 0 7px 20px rgba(30, 41, 59, 0.04);
}

.summary-card {
  min-height: 118px;
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 20px;
  border-radius: 14px;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.summary-card:hover,
.quick-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 26px rgba(30, 41, 59, 0.09);
}

.summary-icon,
.quick-icon {
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 11px;
  font-weight: 900;
}

.summary-icon {
  width: 44px;
  height: 44px;
  font-size: 14px;
}

.summary-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.summary-copy strong {
  font-size: 25px;
  line-height: 1;
}

.summary-copy span {
  margin-top: 7px;
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
}

.card-arrow {
  margin-left: auto;
  color: #94a3b8;
  font-size: 18px;
}

.icon-purple { color: #7c3aed; background: #ede9fe; }
.icon-green { color: #16845a; background: #dcfce7; }
.icon-blue { color: #2563eb; background: #dbeafe; }
.icon-orange { color: #c2410c; background: #ffedd5; }

.quick-section {
  margin-top: 34px;
}

.section-heading h2 {
  margin: 0;
  font-size: 22px;
  letter-spacing: -0.3px;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 16px;
}

.quick-card {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 92px;
  padding: 16px 18px;
  border-radius: 12px;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.quick-icon {
  width: 48px;
  height: 48px;
  font-size: 15px;
}

.quick-card > span:nth-child(2) {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.quick-card strong {
  font-size: 15px;
}

.quick-card small {
  margin-top: 5px;
  color: #64748b;
  line-height: 1.35;
}

@media (max-width: 900px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 620px) {
  .welcome-panel {
    align-items: flex-start;
    flex-direction: column;
    padding: 28px 24px;
  }

  .summary-grid,
  .quick-grid {
    grid-template-columns: 1fr;
  }
}
</style>
