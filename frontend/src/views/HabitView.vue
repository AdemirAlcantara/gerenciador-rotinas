<template>
  <div class="habit-page">
    <h1>Hábitos</h1>

    <form class="habit-form" @submit.prevent="handleSubmit">
      <h2>{{ editingId ? 'Editar Hábito' : 'Novo Hábito' }}</h2>

      <div class="form-grid">
        <div class="form-group">
          <label for="habit">Nome do hábito *</label>
          <input id="habit" v-model.trim="form.habit" type="text" required />
        </div>

        <div class="form-group">
          <label for="category">Categoria *</label>
          <select id="category" v-model="form.category" required>
            <option value="" disabled>Selecione uma categoria</option>
            <option v-for="category in categories" :key="category._id" :value="category._id">
              {{ category.category }}
            </option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="description">Descrição</label>
        <textarea id="description" v-model.trim="form.description" rows="3"></textarea>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label for="frequency">Frequência *</label>
          <select id="frequency" v-model="form.frequency" required>
            <option value="Diário">Diário</option>
            <option value="Semanal">Semanal</option>
            <option value="Mensal">Mensal</option>
          </select>
        </div>

        <div class="form-group">
          <label for="period">Período</label>
          <select id="period" v-model="form.period">
            <option value="Qualquer">Qualquer</option>
            <option value="Manha">Manhã</option>
            <option value="Tarde">Tarde</option>
            <option value="Noite">Noite</option>
          </select>
        </div>

        <div class="form-group">
          <label for="targetTime">Horário</label>
          <input id="targetTime" v-model="form.targetTime" type="time" />
        </div>

        <div v-if="form.frequency === 'Mensal'" class="form-group">
          <label for="dayOfMonth">Dia do mês</label>
          <input id="dayOfMonth" v-model.number="form.dayOfMonth" type="number" min="1" max="31" />
        </div>
      </div>

      <fieldset v-if="form.frequency === 'Semanal'" class="weekdays">
        <legend>Dias da semana *</legend>
        <label v-for="day in weekdays" :key="day.value">
          <input v-model="form.daysOfWeek" type="checkbox" :value="day.value" />
          {{ day.label }}
        </label>
      </fieldset>

      <label class="active-field">
        <input v-model="form.active" type="checkbox" />
        Hábito ativo
      </label>

      <p v-if="errorMessage" class="alert error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="alert success">{{ successMessage }}</p>

      <div class="form-actions">
        <button type="submit" class="btn-primary" :disabled="loading || loadingCategories">
          {{ loading ? 'Salvando...' : editingId ? 'Atualizar' : 'Cadastrar' }}
        </button>
        <button v-if="editingId" type="button" class="btn-secondary" @click="resetForm">
          Cancelar
        </button>
      </div>
    </form>

    <section class="habit-list-section">
      <h2>Hábitos cadastrados</h2>
      <p v-if="loadingList">Carregando hábitos...</p>
      <p v-else-if="habits.length === 0" class="empty-state">Nenhum hábito cadastrado ainda.</p>
      <table v-else class="habit-table">
        <thead>
          <tr>
            <th>Hábito</th>
            <th>Categoria</th>
            <th>Frequência</th>
            <th>Horário</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in habits" :key="item._id">
            <td>
              <strong>{{ item.habit }}</strong>
              <small v-if="item.description">{{ item.description }}</small>
            </td>
            <td>{{ item.category?.category || '—' }}</td>
            <td>{{ scheduleLabel(item) }}</td>
            <td>{{ item.targetTime || '—' }}</td>
            <td>{{ item.active ? 'Ativo' : 'Inativo' }}</td>
            <td class="actions-cell">
              <button class="btn-edit" @click="startEdit(item)">Editar</button>
              <button class="btn-delete" @click="handleDelete(item._id)">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script>
import axiosInstance from '../services/axiosInstance';

const emptyForm = () => ({
  habit: '',
  description: '',
  frequency: 'Diário',
  daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  dayOfMonth: null,
  targetTime: '',
  period: 'Qualquer',
  category: '',
  active: true
});

export default {
  name: 'HabitView',
  data() {
    return {
      habits: [],
      categories: [],
      form: emptyForm(),
      editingId: null,
      loading: false,
      loadingList: false,
      loadingCategories: false,
      errorMessage: '',
      successMessage: '',
      weekdays: [
        { value: 0, label: 'Dom' },
        { value: 1, label: 'Seg' },
        { value: 2, label: 'Ter' },
        { value: 3, label: 'Qua' },
        { value: 4, label: 'Qui' },
        { value: 5, label: 'Sex' },
        { value: 6, label: 'Sáb' }
      ]
    };
  },
  mounted() {
    this.fetchCategories();
    this.fetchHabits();
  },
  methods: {
    async fetchCategories() {
      this.loadingCategories = true;
      try {
        const response = await axiosInstance.get('/habit-categories');
        this.categories = response.data;
      } catch (error) {
        this.errorMessage = error.response?.data?.error || 'Não foi possível carregar as categorias.';
      } finally {
        this.loadingCategories = false;
      }
    },
    async fetchHabits() {
      this.loadingList = true;
      try {
        const response = await axiosInstance.get('/habits');
        this.habits = response.data;
      } catch (error) {
        this.errorMessage = error.response?.data?.error || 'Não foi possível carregar os hábitos.';
      } finally {
        this.loadingList = false;
      }
    },
    async handleSubmit() {
      if (this.form.frequency === 'Semanal' && this.form.daysOfWeek.length === 0) {
        this.errorMessage = 'Selecione pelo menos um dia para um hábito semanal.';
        return;
      }

      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';
      const payload = {
        ...this.form,
        targetTime: this.form.targetTime || null,
        dayOfMonth: this.form.frequency === 'Mensal' ? this.form.dayOfMonth : null
      };

      try {
        if (this.editingId) {
          await axiosInstance.put(`/habits/${this.editingId}`, payload);
          this.successMessage = 'Hábito atualizado com sucesso!';
        } else {
          await axiosInstance.post('/habits', payload);
          this.successMessage = 'Hábito cadastrado com sucesso!';
        }
        this.resetForm();
        await this.fetchHabits();
      } catch (error) {
        this.errorMessage = error.response?.data?.error || 'Erro ao salvar hábito.';
      } finally {
        this.loading = false;
      }
    },
    startEdit(item) {
      this.editingId = item._id;
      this.form = {
        habit: item.habit,
        description: item.description || '',
        frequency: item.frequency,
        daysOfWeek: item.daysOfWeek || [],
        dayOfMonth: item.dayOfMonth,
        targetTime: item.targetTime || '',
        period: item.period || 'Qualquer',
        category: item.category?._id || item.category,
        active: item.active
      };
      this.errorMessage = '';
      this.successMessage = '';
    },
    async handleDelete(id) {
      if (!window.confirm('Deseja realmente excluir este hábito?')) {
        return;
      }
      this.errorMessage = '';
      this.successMessage = '';
      try {
        await axiosInstance.delete(`/habits/${id}`);
        this.successMessage = 'Hábito removido com sucesso!';
        await this.fetchHabits();
      } catch (error) {
        this.errorMessage = error.response?.data?.error || 'Erro ao excluir hábito.';
      }
    },
    resetForm() {
      this.editingId = null;
      this.form = emptyForm();
    },
    scheduleLabel(item) {
      if (item.frequency === 'Semanal') {
        return `Semanal (${(item.daysOfWeek || []).map((day) => this.weekdays[day]?.label).join(', ')})`;
      }
      if (item.frequency === 'Mensal' && item.dayOfMonth) {
        return `Mensal (dia ${item.dayOfMonth})`;
      }
      return item.frequency;
    }
  }
};
</script>

<style scoped>
.habit-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  text-align: left;
}

.habit-form,
.habit-list-section {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label,
.weekdays legend {
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
}

.weekdays {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  border: 0;
  padding: 0;
  margin-bottom: 16px;
}

.weekdays legend {
  width: 100%;
}

.active-field {
  display: block;
  margin-bottom: 16px;
}

.form-actions,
.actions-cell {
  display: flex;
  gap: 8px;
  align-items: center;
}

button {
  border: 0;
  border-radius: 6px;
  color: #fff;
  padding: 8px 14px;
  cursor: pointer;
  font-weight: 600;
}

.btn-primary {
  background: #42b983;
}

.btn-secondary {
  background: #94a3b8;
}

.btn-edit {
  background: #3b82f6;
}

.btn-delete {
  background: #ef4444;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.habit-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
}

.habit-table th,
.habit-table td {
  border-bottom: 1px solid #e2e8f0;
  padding: 12px 10px;
  text-align: left;
}

.habit-table small {
  display: block;
  color: #64748b;
  margin-top: 4px;
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

.alert.success {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.empty-state {
  color: #64748b;
  font-style: italic;
}

@media (max-width: 760px) {
  .habit-table {
    display: block;
    overflow-x: auto;
  }
}
</style>
