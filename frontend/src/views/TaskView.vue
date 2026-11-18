<template>
  <div class="task-page">
    <h1>Tarefas</h1>

    <form v-if="isFormOpen" class="task-form" @submit.prevent="handleSubmit">
      <h2>{{ editingId ? 'Editar Tarefa' : 'Nova Tarefa' }}</h2>

      <div class="form-grid">
        <div class="form-group">
          <label for="title">Título *</label>
          <input id="title" v-model.trim="form.title" type="text" required />
        </div>

        <div class="form-group">
          <label for="dueDate">Data *</label>
          <input id="dueDate" v-model="form.dueDate" type="date" required />
        </div>
      </div>

      <div class="form-group">
        <label for="description">Descrição</label>
        <textarea id="description" v-model.trim="form.description" rows="3"></textarea>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label for="targetTime">Horário alvo</label>
          <input id="targetTime" v-model="form.targetTime" type="time" />
        </div>

        <div class="form-group">
          <label for="status">Status *</label>
          <select id="status" v-model="form.status" required>
            <option value="Pendente">Pendente</option>
            <option value="Concluída">Concluída</option>
            <option value="Cancelada">Cancelada</option>
            <option value="Não realizada">Não realizada</option>
          </select>
        </div>

        <div class="form-group">
          <label for="priority">Prioridade *</label>
          <select id="priority" v-model="form.priority" required>
            <option value="Baixa">Baixa</option>
            <option value="Média">Média</option>
            <option value="Alta">Alta</option>
          </select>
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

      </div>

      <p v-if="errorMessage" class="alert error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="alert success">{{ successMessage }}</p>

      <div class="form-actions">
        <button type="submit" class="btn-primary" :disabled="loading || loadingOptions">
          {{ loading ? 'Salvando...' : editingId ? 'Atualizar' : 'Cadastrar' }}
        </button>
        <button type="button" class="btn-secondary" @click="resetForm">
          Cancelar
        </button>
      </div>
    </form>

    <section class="task-list-section">
      <div class="section-header">
        <h2>Tarefas cadastradas</h2>
        <button type="button" class="btn-primary" @click="openCreateForm">
          Cadastrar Tarefa
        </button>
      </div>
      <p v-if="errorMessage" class="alert error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="alert success">{{ successMessage }}</p>
      <p v-if="loadingList">Carregando tarefas...</p>
      <p v-else-if="tasks.length === 0" class="empty-state">Nenhuma tarefa cadastrada ainda.</p>
      <table v-else class="task-table">
        <thead>
          <tr>
            <th>Tarefa</th>
            <th>Data</th>
            <th>Horário</th>
            <th>Status</th>
            <th>Prioridade</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in tasks" :key="task._id">
            <td>
              <strong>{{ task.title }}</strong>
              <small v-if="task.description">{{ task.description }}</small>
            </td>
            <td>{{ formatDate(task.dueDate) }}</td>
            <td>{{ task.targetTime || '—' }}</td>
            <td>{{ task.status }}</td>
            <td>{{ task.priority }}</td>
            <td class="actions-cell">
              <select
                class="status-action"
                :value="task.status"
                aria-label="Atualizar status da tarefa"
                @change="handleStatusUpdate(task._id, $event)"
              >
                <option value="" disabled>Atualizar status</option>
                <option value="Pendente">Pendente</option>
                <option value="Concluída">Concluída</option>
                <option value="Cancelada">Cancelada</option>
                <option value="Não realizada">Não realizada</option>
              </select>
              <button class="btn-edit" @click="startEdit(task)">Editar</button>
              <button class="btn-delete" @click="handleDelete(task._id)">Excluir</button>
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
  title: '',
  description: '',
  dueDate: today(),
  targetTime: '',
  status: 'Pendente',
  priority: 'Média',
  category: ''
});

export default {
  name: 'TaskView',
  data() {
    return {
      tasks: [],
      categories: [],
      form: emptyForm(),
      editingId: null,
      isFormOpen: false,
      loading: false,
      loadingList: false,
      loadingOptions: false,
      errorMessage: '',
      successMessage: ''
    };
  },
  mounted() {
    this.fetchTasks();
    this.fetchOptions();
  },
  methods: {
    async fetchOptions() {
      this.loadingOptions = true;
      try {
        const categories = await axiosInstance.get('/habit-categories');
        this.categories = categories.data;
      } catch (error) {
        this.errorMessage = error.response?.data?.error || 'Não foi possível carregar as opções da tarefa.';
      } finally {
        this.loadingOptions = false;
      }
    },
    async fetchTasks() {
      this.loadingList = true;
      try {
        const response = await axiosInstance.get('/tasks');
        this.tasks = response.data;
      } catch (error) {
        this.errorMessage = error.response?.data?.error || 'Não foi possível carregar as tarefas.';
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
        targetTime: this.form.targetTime || null,
        category: this.form.category || null
      };

      try {
        if (this.editingId) {
          await axiosInstance.put(`/tasks/${this.editingId}`, payload);
          this.successMessage = 'Tarefa atualizada com sucesso!';
        } else {
          await axiosInstance.post('/tasks', payload);
          this.successMessage = 'Tarefa cadastrada com sucesso!';
        }
        this.resetForm();
        await this.fetchTasks();
      } catch (error) {
        this.errorMessage = error.response?.data?.error || 'Erro ao salvar tarefa.';
      } finally {
        this.loading = false;
      }
    },
    startEdit(task) {
      this.isFormOpen = true;
      this.editingId = task._id;
      this.form = {
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate || today(),
        targetTime: task.targetTime || '',
        status: task.status === 'Em Andamento' ? 'Pendente' : (task.status || 'Pendente'),
        priority: task.priority || 'Média',
        category: task.category?._id || task.category || ''
      };
      this.errorMessage = '';
      this.successMessage = '';
    },
    async handleDelete(id) {
      if (!window.confirm('Deseja realmente excluir esta tarefa?')) return;
      this.errorMessage = '';
      this.successMessage = '';
      try {
        await axiosInstance.delete(`/tasks/${id}`);
        this.successMessage = 'Tarefa removida com sucesso!';
        await this.fetchTasks();
      } catch (error) {
        this.errorMessage = error.response?.data?.error || 'Erro ao excluir tarefa.';
      }
    },
    async handleStatusUpdate(id, event) {
      const status = event.target.value;
      if (!status) return;
      this.errorMessage = '';
      this.successMessage = '';
      try {
        await axiosInstance.patch(`/tasks/${id}/status`, { status });
        this.successMessage = `Status da tarefa atualizado para ${status}!`;
        await this.fetchTasks();
      } catch (error) {
        this.errorMessage = error.response?.data?.error || 'Erro ao atualizar o status da tarefa.';
      }
    },
    resetForm() {
      this.editingId = null;
      this.isFormOpen = false;
      this.form = emptyForm();
    },
    formatDate(dateString) {
      if (!dateString) return '—';
      const [year, month, day] = String(dateString).slice(0, 10).split('-');
      return year && month && day ? `${day}/${month}/${year}` : dateString;
    },
    openCreateForm() {
      this.editingId = null;
      this.form = emptyForm();
      this.errorMessage = '';
      this.successMessage = '';
      this.isFormOpen = true;
    },
  }
};
</script>

<style scoped>
.task-page { max-width: 1100px; margin: 0 auto; padding: 20px; text-align: left; }
.task-form, .task-list-section { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px; box-shadow: 0 2px 6px rgba(0, 0, 0, .04); }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-weight: 600; margin-bottom: 6px; }
.form-group input, .form-group select, .form-group textarea { width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; }
.form-actions { display: flex; gap: 8px; align-items: center; }
.section-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.section-header h2 { margin: 0; }
button { border: 0; border-radius: 6px; color: #fff; padding: 8px 14px; cursor: pointer; font-weight: 600; }
.btn-primary { background: #42b983; } .btn-secondary { background: #94a3b8; } .btn-edit { background: #3b82f6; } .btn-delete { background: #ef4444; }
button:disabled { opacity: .6; cursor: not-allowed; }
.task-table { width: 100%; table-layout: fixed; border-collapse: collapse; margin-top: 12px; }
.task-table th, .task-table td { border-bottom: 1px solid #e2e8f0; padding: 12px 10px; text-align: left; overflow-wrap: anywhere; word-break: break-word; }
.task-table th:last-child, .task-table td:last-child { width: 290px; padding-right: 16px; }
.task-table th:last-child { text-align: right; }
.task-table .actions-cell { text-align: right; vertical-align: middle; white-space: nowrap; }
.task-table .actions-cell button,
.task-table .status-action { height: 32px; padding: 6px 10px; border-radius: 4px; white-space: nowrap; }
.task-table .actions-cell > * + * { margin-left: 6px; }
.status-action {
  max-width: 130px;
  border: 1px solid #cbd5e1;
  background: #e2e8f0;
  color: #111827;
  cursor: pointer;
  font-weight: 600;
  accent-color: #facc15;
}

.status-action option {
  background: #f8fafc;
  color: #111827;
}

.status-action option:checked {
  background: #fef3c7;
  color: #111827;
  font-weight: 700;
}

.status-action option:hover,
.status-action option:focus {
  background: #fde68a;
  color: #111827;
}
.task-table small { display: block; color: #64748b; margin-top: 4px; }
.alert { padding: 10px 12px; border-radius: 6px; margin-bottom: 14px; font-size: 14px; }
.alert.error { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; } .alert.success { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.empty-state { color: #64748b; font-style: italic; }
@media (max-width: 760px) { .task-table { display: block; overflow-x: auto; } }
</style>
