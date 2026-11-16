<template>
  <div class="category-page">
    <h1>Categorias de Hábitos</h1>

    <form class="category-form" @submit.prevent="handleSubmit">
      <h2>{{ editingId ? 'Editar Categoria' : 'Nova Categoria' }}</h2>

      <div class="form-group">
        <label for="category">Nome da Categoria *</label>
        <input
          id="category"
          v-model.trim="form.category"
          type="text"
          placeholder="Ex: Saúde, Estudos, Trabalho, Lazer"
          required
        />
      </div>

      <div class="form-group">
        <label for="descripition">Descrição</label>
        <textarea
          id="descripition"
          v-model.trim="form.descripition"
          rows="3"
          placeholder="Descreva o objetivo desta categoria..."
        ></textarea>
      </div>

      <p v-if="errorMessage" class="alert error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="alert success">{{ successMessage }}</p>

      <div class="form-actions">
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Salvando...' : editingId ? 'Atualizar' : 'Cadastrar' }}
        </button>
        <button
          v-if="editingId"
          type="button"
          class="btn-secondary"
          @click="resetForm"
        >
          Cancelar
        </button>
      </div>
    </form>

    <!-- Lista de Categorias -->
    <div class="category-list-section">
      <h2>Categorias Cadastradas</h2>

      <p v-if="loadingList">Carregando categorias...</p>
      <p v-else-if="categories.length === 0" class="empty-state">
        Nenhuma categoria cadastrada ainda.
      </p>

      <table v-else class="category-table">
        <thead>
          <tr>
            <th>Categoria</th>
            <th>Descrição</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in categories" :key="item._id">
            <td><strong>{{ item.category }}</strong></td>
            <td>{{ item.descripition || '—' }}</td>
            <td class="actions-cell">
              <button class="btn-edit" @click="startEdit(item)">Editar</button>
              <button class="btn-delete" @click="handleDelete(item._id)">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axiosInstance from '../services/axiosInstance';

export default {
  name: 'HabitCategoryView',
  data() {
    return {
      categories: [],
      form: {
        category: '',
        descripition: ''
      },
      editingId: null,
      loading: false,
      loadingList: false,
      errorMessage: '',
      successMessage: ''
    };
  },
  mounted() {
    this.fetchCategories();
  },
  methods: {
    async fetchCategories() {
      this.loadingList = true;
      this.errorMessage = '';
      try {
        const response = await axiosInstance.get('/habit-categories');
        this.categories = response.data;
      } catch (error) {
        this.errorMessage =
          error.response?.data?.error || 'Não foi possível carregar as categorias.';
      } finally {
        this.loadingList = false;
      }
    },
    async handleSubmit() {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        if (this.editingId) {
          await axiosInstance.put(`/habit-categories/${this.editingId}`, this.form);
          this.successMessage = 'Categoria atualizada com sucesso!';
        } else {
          await axiosInstance.post('/habit-categories', this.form);
          this.successMessage = 'Categoria cadastrada com sucesso!';
        }
        this.resetForm();
        await this.fetchCategories();
      } catch (error) {
        this.errorMessage =
          error.response?.data?.error || 'Erro ao salvar categoria.';
      } finally {
        this.loading = false;
      }
    },
    startEdit(item) {
      this.editingId = item._id;
      this.form.category = item.category;
      this.form.descripition = item.descripition || '';
      this.errorMessage = '';
      this.successMessage = '';
    },
    async handleDelete(id) {
      if (!window.confirm('Deseja realmente excluir esta categoria?')) {
        return;
      }
      this.errorMessage = '';
      this.successMessage = '';
      try {
        await axiosInstance.delete(`/habit-categories/${id}`);
        this.successMessage = 'Categoria removida com sucesso!';
        await this.fetchCategories();
      } catch (error) {
        this.errorMessage =
          error.response?.data?.error || 'Erro ao excluir categoria.';
      }
    },
    resetForm() {
      this.editingId = null;
      this.form.category = '';
      this.form.descripition = '';
    }
  }
};
</script>

<style scoped>
.category-page {
  max-width: 820px;
  margin: 0 auto;
  padding: 20px;
  text-align: left;
}

.category-form,
.category-list-section {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.btn-primary {
  background-color: #42b983;
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #94a3b8;
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 6px;
  cursor: pointer;
}

.category-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
}

.category-table th,
.category-table td {
  border-bottom: 1px solid #e2e8f0;
  padding: 12px 10px;
  text-align: left;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.btn-edit {
  background-color: #3b82f6;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-delete {
  background-color: #ef4444;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.alert {
  padding: 10px 12px;
  border-radius: 6px;
  margin-bottom: 14px;
  font-size: 14px;
}

.alert.error {
  background-color: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.alert.success {
  background-color: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.empty-state {
  color: #64748b;
  font-style: italic;
}
</style>

