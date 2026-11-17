<template>
  <div class="routine-page">
    <h1>Rotinas</h1>

    <form class="routine-form" @submit.prevent="handleSubmit">
      <h2>{{ editingId ? 'Editar Rotina' : 'Nova Rotina' }}</h2>

      <div class="form-grid">
        <div class="form-group">
          <label for="date">Data *</label>
          <input id="date" v-model="form.date" type="date" required />
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
          <label for="category">Categoria</label>
          <select id="category" v-model="form.category">
            <option value="">Nenhuma</option>
            <option v-for="category in categories" :key="category._id" :value="category._id">
              {{ category.category }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="user">Usuário</label>
          <select id="user" v-model="form.user">
            <option value="">Nenhum</option>
            <option v-for="user in users" :key="user._id" :value="user._id">
              {{ user.name }} ({{ user.email }})
            </option>
          </select>
        </div>

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

        <div class="form-group">
          <label for="energyLevel">Energia</label>
          <select id="energyLevel" v-model="form.energyLevel">
            <option value="Alta">Alta</option>
            <option value="Média">Média</option>
            <option value="Baixa">Baixa</option>
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

    <section class="routine-list-section">
      <h2>Rotinas cadastradas</h2>
      <p v-if="loadingList">Carregando rotinas...</p>
      <p v-else-if="routines.length === 0" class="empty-state">Nenhuma rotina cadastrada ainda.</p>
      <table v-else class="routine-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Hábito</th>
            <th>Status</th>
            <th>Humor</th>
            <th>Energia</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="routine in routines" :key="routine._id">
            <td>{{ routine.dateString }}</td>
            <td>
              <strong>{{ routine.habit?.habit || '—' }}</strong>
              <small v-if="routine.notes">{{ routine.notes }}</small>
            </td>
            <td>{{ routine.status }}</td>
            <td>{{ routine.mood }}</td>
            <td>{{ routine.energyLevel }}</td>
            <td class="actions-cell">
              <button class="btn-edit" @click="startEdit(routine)">Editar</button>
              <button class="btn-delete" @click="handleDelete(routine._id)">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script>
import axiosInstance from '../services/axiosInstance';

const today = () => new Date().toISOString().slice(0, 10);
const emptyForm = () => ({
  date: today(),
  habit: '',
  user: '',
  category: '',
  status: 'Pendente',
  completedAt: '',
  mood: 'Neutro',
  energyLevel: 'Média',
  notes: ''
});

export default {
  name: 'RoutineView',
  data() {
    return {
      routines: [],
      habits: [],
      categories: [],
      users: [],
      form: emptyForm(),
      editingId: null,
      loading: false,
      loadingList: false,
      loadingOptions: false,
      errorMessage: '',
      successMessage: ''
    };
  },
  mounted() {
    this.fetchRoutines();
    this.fetchOptions();
  },
  methods: {
    async fetchOptions() {
      this.loadingOptions = true;
      try {
        const [habits, categories, users] = await Promise.all([
          axiosInstance.get('/habits'),
          axiosInstance.get('/habit-categories'),
          axiosInstance.get('/users')
        ]);
        this.habits = habits.data;
        this.categories = categories.data;
        this.users = users.data;
      } catch (error) {
        this.errorMessage = error.response?.data?.error || 'Não foi possível carregar as opções da rotina.';
      } finally {
        this.loadingOptions = false;
      }
    },
    async fetchRoutines() {
      this.loadingList = true;
      try {
        const response = await axiosInstance.get('/routines');
        this.routines = response.data;
      } catch (error) {
        this.errorMessage = error.response?.data?.error || 'Não foi possível carregar as rotinas.';
      } finally {
        this.loadingList = false;
      }
    },
    async handleSubmit() {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';
      const payload = {
        ...this.form,
        dateString: this.form.date,
        date: this.form.date,
        completedAt: this.form.completedAt || null,
        user: this.form.user || null,
        category: this.form.category || null
      };

      try {
        if (this.editingId) {
          await axiosInstance.put(`/routines/${this.editingId}`, payload);
          this.successMessage = 'Rotina atualizada com sucesso!';
        } else {
          await axiosInstance.post('/routines', payload);
          this.successMessage = 'Rotina cadastrada com sucesso!';
        }
        this.resetForm();
        await this.fetchRoutines();
      } catch (error) {
        this.errorMessage = error.response?.data?.error || 'Erro ao salvar rotina.';
      } finally {
        this.loading = false;
      }
    },
    startEdit(routine) {
      this.editingId = routine._id;
      this.form = {
        date: routine.dateString || today(),
        habit: routine.habit?._id || routine.habit || '',
        user: routine.user?._id || routine.user || '',
        category: routine.category?._id || routine.category || '',
        status: routine.status || 'Pendente',
        completedAt: routine.completedAt || '',
        mood: routine.mood || 'Neutro',
        energyLevel: routine.energyLevel || 'Média',
        notes: routine.notes || ''
      };
      this.errorMessage = '';
      this.successMessage = '';
    },
    async handleDelete(id) {
      if (!window.confirm('Deseja realmente excluir esta rotina?')) return;
      this.errorMessage = '';
      this.successMessage = '';
      try {
        await axiosInstance.delete(`/routines/${id}`);
        this.successMessage = 'Rotina removida com sucesso!';
        await this.fetchRoutines();
      } catch (error) {
        this.errorMessage = error.response?.data?.error || 'Erro ao excluir rotina.';
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
.routine-page { max-width: 1100px; margin: 0 auto; padding: 20px; text-align: left; }
.routine-form, .routine-list-section { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px; box-shadow: 0 2px 6px rgba(0, 0, 0, .04); }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-weight: 600; margin-bottom: 6px; }
.form-group input, .form-group select, .form-group textarea { width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; }
.form-actions { display: flex; gap: 8px; align-items: center; }
button { border: 0; border-radius: 6px; color: #fff; padding: 8px 14px; cursor: pointer; font-weight: 600; }
.btn-primary { background: #42b983; } .btn-secondary { background: #94a3b8; } .btn-edit { background: #3b82f6; } .btn-delete { background: #ef4444; }
button:disabled { opacity: .6; cursor: not-allowed; }
.routine-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
.routine-table th, .routine-table td { border-bottom: 1px solid #e2e8f0; padding: 12px 10px; text-align: left; }
.routine-table .actions-cell { white-space: nowrap; vertical-align: middle; }
.routine-table .actions-cell button + button { margin-left: 8px; }
.routine-table small { display: block; color: #64748b; margin-top: 4px; }
.alert { padding: 10px 12px; border-radius: 6px; margin-bottom: 14px; font-size: 14px; }
.alert.error { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; } .alert.success { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.empty-state { color: #64748b; font-style: italic; }
@media (max-width: 760px) { .routine-table { display: block; overflow-x: auto; } }
</style>
