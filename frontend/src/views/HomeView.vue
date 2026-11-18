<template>
  <div class="dashboard">
    <section class="welcome-panel">
      <div>
        <p class="eyebrow">Painel pessoal</p>
        <h1>Olá, {{ firstName }}</h1>
        <p class="welcome-text">Organize seus hábitos, tarefas e check-ins em um só lugar.</p>
      </div>
      <div class="fidelity-card" aria-label="Fidelidade geral da rotina">
        <div class="fidelity-main">
          <strong>{{ loadingStats ? '...' : `${stats.overallFidelity}%` }}</strong>
          <span>Fidelidade geral</span>
        </div>
        <div class="fidelity-details">
          <span>Hábitos <strong>{{ loadingStats ? '...' : `${stats.habitFidelity}%` }}</strong></span>
          <span>Tarefas <strong>{{ loadingStats ? '...' : `${stats.taskFidelity}%` }}</strong></span>
        </div>
      </div>
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

    <section class="ai-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Integração com IA</p>
          <h2>Análise da sua rotina</h2>
        </div>
        <button type="button" class="ai-refresh" :disabled="loadingAi" @click="loadAiAnalysis">
          {{ loadingAi ? 'Analisando...' : 'Analisar novamente' }}
        </button>
      </div>

      <div v-if="aiError" class="ai-error">{{ aiError }}</div>
      <div v-else-if="loadingAi" class="ai-loading">
        O assistente está analisando seus check-ins e tarefas dos últimos 30 dias...
      </div>
      <div v-else-if="aiAnalysis" class="ai-content">
        <p class="ai-summary">{{ aiAnalysis.resumo }}</p>
        <div class="ai-grid">
          <article v-if="aiAnalysis.pontosPositivos?.length" class="ai-card ai-positive">
            <h3>Pontos positivos</h3>
            <ul>
              <li v-for="(item, index) in aiAnalysis.pontosPositivos" :key="index">{{ item }}</li>
            </ul>
          </article>
          <article v-if="aiAnalysis.pontosDeAtencao?.length" class="ai-card ai-attention">
            <h3>Pontos de atenção</h3>
            <ul>
              <li v-for="(item, index) in aiAnalysis.pontosDeAtencao" :key="index">{{ item }}</li>
            </ul>
          </article>
        </div>
        <div class="ai-recommendation">
          <span>Recomendação</span>
          <strong>{{ aiAnalysis.recomendacao }}</strong>
        </div>
        <div class="ai-goal">
          <span>Meta sugerida</span>
          <strong>{{ aiAnalysis.metaSugerida }}</strong>
        </div>
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
        habitCheckIns: 0
      },
      stats: {
        habitFidelity: 0,
        taskFidelity: 0,
        overallFidelity: 0
      },
      aiAnalysis: null,
      loadingCounts: true,
      loadingStats: true,
      loadingAi: false,
      loadError: '',
      aiError: ''
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
          path: '/habit-check-ins',
          label: 'Check-ins',
          description: 'Registre o progresso dos seus hábitos.',
          count: this.counts.habitCheckIns,
          icon: 'R',
          color: 'icon-orange'
        }
      ];
    }
  },
  mounted() {
    this.loadCounts();
    this.loadStats();
    this.loadAiAnalysis();
  },
  methods: {
    async loadCounts() {
      this.loadingCounts = true;
      this.loadError = '';
      const endpoints = [
        ['categories', '/habit-categories'],
        ['habits', '/habits'],
        ['tasks', '/tasks'],
        ['habitCheckIns', '/habit-check-ins']
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
    },
    async loadStats() {
      this.loadingStats = true;
      try {
        const response = await axiosInstance.get('/dashboard/stats');
        this.stats = response.data;
      } catch (error) {
        this.loadError = error.response?.data?.error || 'Não foi possível carregar a fidelidade.';
      } finally {
        this.loadingStats = false;
      }
    },
    async loadAiAnalysis() {
      this.loadingAi = true;
      this.aiError = '';
      try {
        const response = await axiosInstance.post('/dashboard/ai-analysis');
        this.aiAnalysis = response.data;
      } catch (error) {
        this.aiError = error.response?.data?.error || 'Não foi possível gerar a análise da rotina.';
      } finally {
        this.loadingAi = false;
      }
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
    linear-gradient(135deg, #f97316 0%, #facc15 100%);
  box-shadow: 0 16px 38px rgba(249, 115, 22, 0.18);
}

.eyebrow {
  margin: 0 0 7px;
  color: #ea580c;
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

.fidelity-card {
  flex: 0 0 auto;
  min-width: 220px;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 16px 18px;
  border-radius: 10px;
  color: #7c2d12;
  background: #fff;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
}

.fidelity-main,
.fidelity-details {
  display: flex;
  flex-direction: column;
}

.fidelity-main strong {
  font-size: 34px;
  line-height: 1;
}

.fidelity-main span {
  margin-top: 6px;
  font-size: 12px;
  font-weight: 800;
}

.fidelity-details {
  gap: 7px;
  padding-left: 16px;
  border-left: 1px solid #fed7aa;
  font-size: 12px;
  color: #92400e;
}

.fidelity-details strong {
  margin-left: 3px;
  font-size: 14px;
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

.summary-card {
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

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 26px rgba(30, 41, 59, 0.09);
}

.summary-icon {
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

.icon-purple { color: #92400e; background: #fef3c7; }
.icon-green { color: #c2410c; background: #ffedd5; }
.icon-blue { color: #b45309; background: #fde68a; }
.icon-orange { color: #9a3412; background: #ffedd5; }

.ai-section {
  margin-top: 34px;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.section-heading h2 {
  margin: 0;
  font-size: 22px;
  letter-spacing: -0.3px;
}

.ai-refresh {
  border: 0;
  border-radius: 8px;
  padding: 10px 14px;
  background: #f97316;
  color: #fff;
  cursor: pointer;
  font-weight: 800;
}

.ai-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ai-loading,
.ai-error,
.ai-content {
  margin-top: 16px;
  border: 1px solid #fed7aa;
  border-radius: 12px;
  background: #fffaf0;
  padding: 18px;
}

.ai-error {
  color: #b91c1c;
  background: #fef2f2;
  border-color: #fecaca;
}

.ai-summary {
  margin: 0 0 16px;
  color: #475569;
  line-height: 1.6;
}

.ai-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.ai-card {
  border-radius: 10px;
  padding: 14px;
  background: #fff;
}

.ai-card h3 {
  margin: 0 0 8px;
}

.ai-card ul {
  margin: 0;
  padding-left: 18px;
  color: #475569;
}

.ai-positive {
  border-left: 4px solid #facc15;
}

.ai-attention {
  border-left: 4px solid #f97316;
}

.ai-recommendation,
.ai-goal {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 8px;
  background: #fff;
  color: #475569;
}

.ai-recommendation span,
.ai-goal span {
  color: #c2410c;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
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

  .fidelity-card {
    width: 100%;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .ai-refresh {
    width: 100%;
  }

  .ai-grid {
    grid-template-columns: 1fr;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
