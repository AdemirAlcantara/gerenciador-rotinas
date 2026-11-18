<template>
  <div class="history-page">
    <div class="page-heading">
      <div>
        <h1>Histórico de Check-ins</h1>
        <p>Visualize todos os registros de check-in.</p>
      </div>
      <button type="button" class="btn-secondary" @click="$router.push({ name: 'habit-check-ins' })">
        Voltar aos Check-ins
      </button>
    </div>

    <section class="history-section">
      <div class="filters">
        <div class="filter-group">
          <label for="history-habit">Hábito</label>
          <select id="history-habit" v-model="selectedHabit" @change="fetchHistory">
            <option value="">Todos os hábitos</option>
            <option v-for="habit in habits" :key="habit._id" :value="habit._id">
              {{ habit.habit }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label for="history-status">Status</label>
          <select id="history-status" v-model="selectedStatus" @change="fetchHistory">
            <option value="">Todos os status</option>
            <option value="Pendente">Pendente</option>
            <option value="Concluído">Concluído</option>
            <option value="Pulado">Pulado</option>
          </select>
        </div>
      </div>

      <p v-if="errorMessage" class="alert error">{{ errorMessage }}</p>
      <p v-if="loading">Carregando histórico...</p>
      <p v-else-if="historyItems.length === 0" class="empty-state">
        Nenhum registro encontrado no histórico.
      </p>

      <table v-else class="history-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Hábito</th>
            <th>Status</th>
            <th>Humor</th>
            <th>Horário</th>
            <th>Observações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in historyItems" :key="item._id">
            <td>{{ formatDate(item.dateString) }}</td>
            <td><strong>{{ item.habit?.habit || 'Hábito removido' }}</strong></td>
            <td>{{ item.status }}</td>
            <td>{{ item.mood || '—' }}</td>
            <td>{{ item.completedAt || '—' }}</td>
            <td>{{ item.notes || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script>
import axiosInstance from '../services/axiosInstance';

export default {
  name: 'HabitCheckInHistoryView',
  data() {
    return {
      habits: [],
      historyItems: [],
      selectedHabit: this.$route.query.habit || '',
      selectedStatus: '',
      loading: false,
      errorMessage: ''
    };
  },
  mounted() {
    this.fetchHabits();
    this.fetchHistory();
  },
  methods: {
    async fetchHabits() {
      try {
        const response = await axiosInstance.get('/habits');
        this.habits = response.data;
      } catch (error) {
        this.errorMessage = error.response?.data?.error || 'Não foi possível carregar os hábitos.';
      }
    },
    async fetchHistory() {
      this.loading = true;
      this.errorMessage = '';
      try {
        const response = await axiosInstance.get('/habit-check-ins', {
          params: {
            history: true,
            ...(this.selectedHabit ? { habit: this.selectedHabit } : {}),
            ...(this.selectedStatus ? { status: this.selectedStatus } : {})
          }
        });
        this.historyItems = response.data;
      } catch (error) {
        this.errorMessage = error.response?.data?.error || 'Não foi possível carregar o histórico.';
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      if (!dateString) return '—';
      const [year, month, day] = String(dateString).slice(0, 10).split('-');
      return year && month && day ? `${day}/${month}/${year}` : dateString;
    }
  }
};
</script>

<style scoped>
.history-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
  text-align: left;
}

.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.page-heading h1 {
  margin: 0 0 6px;
}

.page-heading p {
  margin: 0;
  color: #64748b;
}

.history-section {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, .04);
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.filter-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
}

.filter-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #fff;
  font-size: 14px;
}

.btn-secondary {
  border: 0;
  border-radius: 6px;
  padding: 10px 18px;
  background: #94a3b8;
  color: #fff;
  cursor: pointer;
  font-weight: 600;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
}

.history-table th,
.history-table td {
  border-bottom: 1px solid #e2e8f0;
  padding: 12px 10px;
  text-align: left;
  vertical-align: middle;
}

.history-table th:first-child,
.history-table td:first-child {
  width: 105px;
}

.history-table th:nth-last-child(2),
.history-table td:nth-last-child(2) {
  width: 90px;
}

.alert {
  padding: 10px 12px;
  border-radius: 6px;
  margin-bottom: 14px;
  font-size: 14px;
}

.alert.error {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.empty-state {
  color: #64748b;
  font-style: italic;
}

@media (max-width: 760px) {
  .page-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .btn-secondary {
    width: 100%;
  }

  .history-table {
    display: block;
    overflow-x: auto;
  }
}
</style>
