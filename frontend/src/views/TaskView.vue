<template>
  <div class="task-page">
    <h1>Tarefas</h1>

    <form class="task-form" @submit.prevent="handleSubmit">
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
          <label for="timeBlock">Período *</label>
          <select id="timeBlock" v-model="form.timeBlock" required>
            <option value="Qualquer">Qualquer</option>
            <option value="Manha">Manhã</option>
            <option value="Tarde">Tarde</option>
            <option value="Noite">Noite</option>
          </select>
        </div>

        <div class="form-group">
          <label for="targetTime">Horário alvo</label>
          <input id="targetTime" v-model="form.targetTime" type="time" />
        </div>

        <div class="form-group">
          <label for="startTime">Início</label>
          <input id="startTime" v-model="form.startTime" type="time" />
        </div>

        <div class="form-group">
          <label for="endTime">Fim</label>
          <input id="endTime" v-model="form.endTime" type="time" />
        </div>

        <div class="form-group">
          <label for="status">Status *</label>
          <select id="status" v-model="form.status" required>
            <option value="Pendente">Pendente</option>
            <option value="Em Andamento">Em Andamento</option>
            <option value="Concluída">Concluída</option>
            <option value="Cancelada">Cancelada</option>
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
          <label for="habitCheckIn">Check-in</label>
          <select id="habitCheckIn" v-model="form.habitCheckIn">
            <option value="">Nenhuma</option>
            <option v-for="checkIn in habitCheckIns" :key="checkIn._id" :value="checkIn._id">
              {{ habitCheckInLabel(checkIn) }}
            </option>
          </select>
        </div>

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
        <button v-if="editingId" type="button" class="btn-secondary" @click="resetForm">
          Cancelar
        </button>
      </div>
    </form>

    <section class="task-list-section">
      <h2>Tarefas cadastradas</h2>
      <p v-if="loadingList">Carregando tarefas...</p>
      <p v-else-if="tasks.length === 0" class="empty-state">Nenhuma tarefa cadastrada ainda.</p>
      <table v-else class="task-table">
        <thead>
          <tr>
            <th>Tarefa</th>
            <th>Data</th>
            <th>Período</th>
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
            <td>{{ task.dueDate }}</td>
            <td>{{ timeBlockLabel(task.timeBlock) }}</td>
            <td>{{ task.targetTime || task.startTime || '—' }}</td>
            <td>{{ task.status }}</td>
            <td>{{ task.priority }}</td>
            <td class="actions-cell">
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
  timeBlock: 'Qualquer',
  targetTime: '',
  startTime: '',
  endTime: '',
  status: 'Pendente',
  priority: 'Média',
  habitCheckIn: '',
  category: ''
});

export default {
  name: 'TaskView',
  data() {
    return {
      tasks: [],
      habitCheckIns: [],
      categories: [],
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
    this.fetchTasks();
    this.fetchOptions();
  },
  methods: {
    async fetchOptions() {
      this.loadingOptions = true;
      try {
        const [habitCheckIns, categories] = await Promise.all([
          axiosInstance.get('/habit-check-ins'),
          axiosInstance.get('/habit-categories')
        ]);
        this.habitCheckIns = habitCheckIns.data;
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
        startTime: this.form.startTime || null,
        endTime: this.form.endTime || null,
        habitCheckIn: this.form.habitCheckIn || null,
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
      this.editingId = task._id;
      this.form = {
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate || today(),
        timeBlock: task.timeBlock || 'Qualquer',
        targetTime: task.targetTime || '',
        startTime: task.startTime || '',
        endTime: task.endTime || '',
        status: task.status || 'Pendente',
        priority: task.priority || 'Média',
        habitCheckIn: task.habitCheckIn?._id || task.habitCheckIn || '',
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
    resetForm() {
      this.editingId = null;
      this.form = emptyForm();
    },
    habitCheckInLabel(checkIn) {
      return `${checkIn.habit?.habit || 'Check-in'} - ${checkIn.dateString || ''}`;
    },
    timeBlockLabel(timeBlock) {
      return { Manha: 'Manhã', Tarde: 'Tarde', Noite: 'Noite', Qualquer: 'Qualquer' }[timeBlock] || timeBlock;
    }
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
button { border: 0; border-radius: 6px; color: #fff; padding: 8px 14px; cursor: pointer; font-weight: 600; }
.btn-primary { background: #42b983; } .btn-secondary { background: #94a3b8; } .btn-edit { background: #3b82f6; } .btn-delete { background: #ef4444; }
button:disabled { opacity: .6; cursor: not-allowed; }
.task-table { width: 100%; table-layout: fixed; border-collapse: collapse; margin-top: 12px; }
.task-table th, .task-table td { border-bottom: 1px solid #e2e8f0; padding: 12px 10px; text-align: left; overflow-wrap: anywhere; word-break: break-word; }
.task-table th:last-child, .task-table td:last-child { width: 140px; }
.task-table .actions-cell { white-space: nowrap; vertical-align: middle; }
.task-table .actions-cell button + button { margin-left: 8px; }
.task-table small { display: block; color: #64748b; margin-top: 4px; }
.alert { padding: 10px 12px; border-radius: 6px; margin-bottom: 14px; font-size: 14px; }
.alert.error { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; } .alert.success { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.empty-state { color: #64748b; font-style: italic; }
@media (max-width: 760px) { .task-table { display: block; overflow-x: auto; } }
</style>
