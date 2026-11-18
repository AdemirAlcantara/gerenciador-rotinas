<template>
  <main class="account-page">
    <section class="account-card">
      <h1>Minha conta</h1>

      <p v-if="loadingProfile" class="loading">Carregando dados da conta...</p>

      <div v-else-if="user" class="account-content">
        <div v-if="!editingProfile" class="profile-details">
          <div class="detail-item">
            <span>Nome</span>
            <strong>{{ user.name || 'Não informado' }}</strong>
          </div>
          <div class="detail-item">
            <span>E-mail</span>
            <strong>{{ user.email }}</strong>
          </div>
          <div class="detail-item">
            <span>Bio</span>
            <strong>{{ user.bio || 'Nenhuma bio informada' }}</strong>
          </div>
          <button type="button" class="btn-primary" @click="startProfileEdit">
            Editar informações
          </button>
        </div>

        <form v-else class="profile-form" @submit.prevent="saveProfile">
          <h2>Editar informações</h2>
          <div class="form-group">
            <label for="name">Nome</label>
            <input id="name" v-model.trim="profileForm.name" type="text" required autocomplete="name" />
          </div>
          <div class="form-group">
            <label for="email">E-mail</label>
            <input id="email" :value="user.email" type="email" disabled />
          </div>
          <div class="form-group">
            <label for="bio">Bio</label>
            <textarea id="bio" v-model.trim="profileForm.bio" rows="4" maxlength="500"></textarea>
          </div>
          <p v-if="errorMessage" class="alert error">{{ errorMessage }}</p>
          <div class="form-actions">
            <button type="submit" class="btn-primary" :disabled="savingProfile">
              {{ savingProfile ? 'Salvando...' : 'Salvar informações' }}
            </button>
            <button type="button" class="btn-secondary" @click="cancelProfileEdit">
              Cancelar
            </button>
          </div>
        </form>

        <div class="password-section">
          <button v-if="!showPasswordForm" type="button" class="btn-secondary" @click="showPasswordForm = true">
            Alterar senha
          </button>

          <form v-else @submit.prevent="changePassword" class="password-form">
        <h2>Alterar senha</h2>
        <div class="form-group">
          <label for="currentPassword">Senha atual</label>
          <input id="currentPassword" v-model="form.currentPassword" type="password" required autocomplete="current-password" />
        </div>
        <div class="form-group">
          <label for="newPassword">Nova senha</label>
          <input id="newPassword" v-model="form.newPassword" type="password" required autocomplete="new-password" />
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirmar nova senha</label>
          <input id="confirmPassword" v-model="form.confirmPassword" type="password" required autocomplete="new-password" />
        </div>

        <p v-if="errorMessage" class="alert error">{{ errorMessage }}</p>
        <p v-if="successMessage" class="alert success">{{ successMessage }}</p>
            <div class="form-actions">
              <button type="submit" class="btn-primary" :disabled="loading">
                {{ loading ? 'Salvando...' : 'Alterar senha' }}
              </button>
              <button type="button" class="btn-secondary" @click="cancelPasswordEdit">
                Cancelar
              </button>
            </div>
      </form>
        </div>
      </div>

      <p v-if="errorMessage && !editingProfile && !showPasswordForm" class="alert error">{{ errorMessage }}</p>
      <p v-if="successMessage && !editingProfile && !showPasswordForm" class="alert success">{{ successMessage }}</p>
    </section>
  </main>
</template>

<script>
import axiosInstance from '../services/axiosInstance';

export default {
  name: 'AccountView',
  data() {
    return {
      user: null,
      profileForm: { name: '', bio: '' },
      editingProfile: false,
      showPasswordForm: false,
      form: { currentPassword: '', newPassword: '', confirmPassword: '' },
      loading: false,
      loadingProfile: true,
      savingProfile: false,
      errorMessage: '',
      successMessage: ''
    };
  },
  mounted() {
    this.fetchProfile();
  },
  methods: {
    async fetchProfile() {
      this.loadingProfile = true;
      this.errorMessage = '';
      try {
        const response = await axiosInstance.get('/users/me');
        this.user = response.data;
      } catch (error) {
        this.errorMessage = error.response?.data?.error || 'Não foi possível carregar os dados da conta.';
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
      } finally {
        this.loadingProfile = false;
      }
    },
    startProfileEdit() {
      this.profileForm = {
        name: this.user?.name || '',
        bio: this.user?.bio || ''
      };
      this.editingProfile = true;
      this.errorMessage = '';
      this.successMessage = '';
    },
    cancelProfileEdit() {
      this.editingProfile = false;
      this.errorMessage = '';
    },
    async saveProfile() {
      this.savingProfile = true;
      this.errorMessage = '';
      this.successMessage = '';
      try {
        const response = await axiosInstance.put('/users/me', this.profileForm);
        this.user = response.data;
        localStorage.setItem('user', JSON.stringify(response.data));
        window.dispatchEvent(new Event('auth-change'));
        this.editingProfile = false;
        this.successMessage = 'Informações da conta atualizadas com sucesso!';
      } catch (error) {
        this.errorMessage = error.response?.data?.error || 'Não foi possível atualizar os dados da conta.';
      } finally {
        this.savingProfile = false;
      }
    },
    cancelPasswordEdit() {
      this.showPasswordForm = false;
      this.form = { currentPassword: '', newPassword: '', confirmPassword: '' };
      this.errorMessage = '';
    },
    async changePassword() {
      this.errorMessage = '';
      this.successMessage = '';
      if (this.form.newPassword !== this.form.confirmPassword) {
        this.errorMessage = 'A confirmação da nova senha não corresponde.';
        return;
      }

      this.loading = true;
      try {
        await axiosInstance.put('/auth/password', {
          currentPassword: this.form.currentPassword,
          newPassword: this.form.newPassword
        });
        this.form = { currentPassword: '', newPassword: '', confirmPassword: '' };
        this.successMessage = 'Senha alterada com sucesso!';
      } catch (error) {
        this.errorMessage = error.response?.data?.error || 'Não foi possível alterar a senha.';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.account-page { max-width: 600px; margin: 0 auto; padding: 20px; text-align: left; }
.account-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; box-shadow: 0 2px 6px rgba(0, 0, 0, .04); }
.account-card h1 { margin-top: 0; }
.account-content { display: flex; flex-direction: column; gap: 24px; }
.profile-details { display: flex; flex-direction: column; gap: 12px; }
.detail-item { display: flex; flex-direction: column; gap: 4px; padding: 12px 14px; border: 1px solid #e2e8f0; border-radius: 6px; background: #f8fafc; }
.detail-item span { color: #64748b; font-size: 13px; }
.detail-item strong { white-space: pre-wrap; overflow-wrap: anywhere; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-weight: 600; margin-bottom: 6px; }
.form-group input, .form-group textarea { width: 100%; box-sizing: border-box; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; resize: vertical; }
.form-group input:disabled { background: #f1f5f9; color: #64748b; }
.profile-form, .password-form { border-top: 1px solid #e2e8f0; padding-top: 20px; }
.password-section { border-top: 1px solid #e2e8f0; padding-top: 20px; }
.form-actions { display: flex; gap: 10px; }
.btn-primary { border: 0; border-radius: 6px; padding: 10px 18px; color: #fff; background: #42b983; cursor: pointer; font-weight: 600; }
.btn-secondary { border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px 18px; color: #334155; background: #fff; cursor: pointer; font-weight: 600; }
.btn-primary:disabled { opacity: .6; cursor: not-allowed; }
.alert { padding: 10px 12px; border-radius: 6px; margin-bottom: 14px; font-size: 14px; }
.alert.error { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
.alert.success { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
</style>
