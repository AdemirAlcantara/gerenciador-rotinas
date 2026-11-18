<template>
  <div class="check-in-page">
    <h1>Check-ins de Hábitos</h1>

    <form class="check-in-form" @submit.prevent="handleSubmit">
      <h2>{{ editingId ? 'Editar Check-in' : 'Novo Check-in' }}</h2>

      <div class="form-grid">
        <div class="form-group">
          <label for="date">Data *</label>
          <input id="date" v-model="form.date" type="date" :max="todayDate" required />
        </div>

        <div class="form-group">
          <label for="habit">Hábito *</label>
          <select id="habit" v-model="form.habit" required>
            <option value="" disabled>Selecione um hábito</option>
            <option v-for="habit in habits" :key="habit._id" :value="habit._id">
              {{ habit.habit }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="status">Status *</label>
          <select id="status" v-model="form.status" required>
            <option value="Pendente">Pendente</option>
            <option value="Concluído">Concluído</option>
            <option value="Pulado">Pulado</option>
          </select>
        </div>

        <div class="form-group">
          <label for="completedAt">Horário de conclusão</label>
          <input id="completedAt" v-model="form.completedAt" type="time" />
        </div>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label for="mood">Humor</label>
          <select id="mood" v-model="form.mood">
            <option value="Ótimo">Ótimo</option>
            <option value="Bom">Bom</option>
            <option value="Neutro">Neutro</option>
            <option value="Cansado">Cansado</option>
            <option value="Estressado">Estressado</option>
          </select>
        </div>

      </div>

      <div class="form-group">
        <label for="notes">Observações</label>
        <textarea id="notes" v-model.trim="form.notes" rows="3"></textarea>
      </div>

      <p v-if="errorMessage" class="alert error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="alert success">{{ successMessage }}</p>

      <div class="form-actions">
        <button type="submit" class="btn-primary" :disabled="loading || loadingOptions">
          {{ loading ? 'Salvando...' : editingId ? 'Atualizar' : 'Cadastrar' }}
        </button>
        <button v-if="editingId" type="button" class="btn-secondary" @click="resetForm">
          Cancelar
        </button>
      </div>
    </form>

    <section class="check-in-list-section">
      <h2>Check-ins cadastrados</h2>
      <p v-if="loadingList">Carregando check-ins...</p>
      <p v-else-if="habitCheckIns.length === 0" class="empty-state">Nenhum check-in cadastrado ainda.</p>
      <table v-else class="check-in-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Hábito</th>
            <th>Status</th>
            <th>Humor</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="checkIn in habitCheckIns" :key="checkIn._id">
            <td>{{ checkIn.dateString }}</td>
            <td>
              <strong>{{ checkIn.habit?.habit || '—' }}</strong>
              <small v-if="checkIn.notes">{{ checkIn.notes }}</small>
            </td>
            <td>{{ checkIn.status }}</td>
            <td>{{ checkIn.mood }}</td>
            <td class="actions-cell">
              <button class="btn-edit" @click="startEdit(checkIn)">Editar</button>
              <button class="btn-delete" @click="handleDelete(checkIn._id)">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script>
import axiosInstance from '../services/axiosInstance';

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const emptyForm = () => ({
  date: today(),
  habit: '',
  status: 'Pendente',
  completedAt: '',
  mood: 'Neutro',
  notes: ''
});

export default {
  name: 'HabitCheckInView',
  data() {
    return {
      habitCheckIns: [],
      habits: [],
      form: emptyForm(),
      editingId: null,
      loading: false,
      loadingList: false,
      loadingOptions: false,
      errorMessage: '',
      successMessage: '',
      todayDate: today()
    };
  },
  mounted() {
    this.fetchHabitCheckIns();
    this.fetchOptions();
  },
  methods: {
    async fetchOptions() {
      this.loadingOptions = true;
      try {
        const [habits] = await Promise.all([
          axiosInstance.get('/habits')
        ]);
        this.habits = habits.data;
      } catch (error) {
        this.errorMessage = error.response?.data?.error || 'Não foi possível carregar as opções do check-in.';
      } finally {
        this.loadingOptions = false;
      }
    },
    async fetchHabitCheckIns() {
      this.loadingList = true;
      try {
        const response = await axiosInstance.get('/habit-check-ins');
        this.habitCheckIns = response.data;
      } catch (error) {
        this.errorMessage = error.response?.data?.error || 'Não foi possível carregar os check-ins.';
      } finally {
        this.loadingList = false;
      }
    },
    async handleSubmit() {
      if (this.form.date > today()) {
        this.errorMessage = 'Não é possível criar ou editar um check-in em uma data posterior à atual.';
        return;
      }
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';
      const payload = {
        ...this.form,
        dateString: this.form.date,
        date: this.form.date,
        completedAt: this.form.completedAt || null
      };

      try {
        if (this.editingId) {
          await axiosInstance.put(`/habit-check-ins/${this.editingId}`, payload);
          this.successMessage = 'Check-in atualizado com sucesso!';
        } else {
          await axiosInstance.post('/habit-check-ins', payload);
          this.successMessage = 'Check-in cadastrado com sucesso!';
        }
        this.resetForm();
        await this.fetchHabitCheckIns();
      } catch (error) {
        this.errorMessage = error.response?.data?.error || 'Erro ao salvar check-in.';
      } finally {
        this.loading = false;
      }
    },
    startEdit(checkIn) {
      this.editingId = checkIn._id;
      this.form = {
        date: checkIn.dateString || today(),
        habit: checkIn.habit?._id || checkIn.habit || '',
        status: checkIn.status || 'Pendente',
        completedAt: checkIn.completedAt || '',
        mood: checkIn.mood || 'Neutro',
        notes: checkIn.notes || ''
      };
      this.errorMessage = '';
      this.successMessage = '';
    },
    async handleDelete(id) {
      if (!window.confirm('Deseja realmente excluir este check-in?')) return;
      this.errorMessage = '';
      this.successMessage = '';
      try {
        await axiosInstance.delete(`/habit-check-ins/${id}`);
        this.successMessage = 'Check-in removido com sucesso!';
        await this.fetchHabitCheckIns();
      } catch (error) {
        this.errorMessage = error.response?.data?.error || 'Erro ao excluir check-in.';
      }
    },
    resetForm() {
      this.editingId = null;
      this.form = emptyForm();
    }
  }
};
</script>

<style scoped>
.check-in-page { max-width: 1100px; margin: 0 auto; padding: 20px; text-align: left; }
.check-in-form, .check-in-list-section { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px; box-shadow: 0 2px 6px rgba(0, 0, 0, .04); }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-weight: 600; margin-bottom: 6px; }
.form-group input, .form-group select, .form-group textarea { width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; }
.form-actions { display: flex; gap: 8px; align-items: center; }
button { border: 0; border-radius: 6px; color: #fff; padding: 8px 14px; cursor: pointer; font-weight: 600; }
.btn-primary { background: #42b983; } .btn-secondary { background: #94a3b8; } .btn-edit { background: #3b82f6; } .btn-delete { background: #ef4444; }
button:disabled { opacity: .6; cursor: not-allowed; }
.check-in-table { width: 100%; table-layout: fixed; border-collapse: collapse; margin-top: 12px; }
.check-in-table th, .check-in-table td { border-bottom: 1px solid #e2e8f0; padding: 12px 10px; text-align: left; overflow-wrap: anywhere; word-break: break-word; }
.check-in-table th:last-child, .check-in-table td:last-child { width: 140px; }
.check-in-table .actions-cell { white-space: nowrap; vertical-align: middle; }
.check-in-table .actions-cell button + button { margin-left: 8px; }
.check-in-table small { display: block; color: #64748b; margin-top: 4px; }
.alert { padding: 10px 12px; border-radius: 6px; margin-bottom: 14px; font-size: 14px; }
.alert.error { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; } .alert.success { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.empty-state { color: #64748b; font-style: italic; }
@media (max-width: 760px) { .check-in-table { display: block; overflow-x: auto; } }
</style>
