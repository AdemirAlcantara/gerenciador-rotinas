import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import HabitCategoryView from '../views/HabitCategoryView.vue'
import HabitView from '../views/HabitView.vue'
import AboutView from '../views/AboutView.vue'
import TaskView from '../views/TaskView.vue'
import RoutineView from '../views/RoutineView.vue'
import LoginView from '../views/LoginView.vue'
import AccountView from '../views/AccountView.vue'
import RegisterView from '../views/RegisterView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView
  },
  {
    path: '/account',
    name: 'account',
    component: AccountView,
    meta: { requiresAuth: true }
  },
  {
    path: '/habit-categories',
    name: 'habit-categories',
    component: HabitCategoryView,
    meta: { requiresAuth: true }
  },
  {
    path: '/habits',
    name: 'habits',
    component: HabitView,
    meta: { requiresAuth: true }
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: TaskView,
    meta: { requiresAuth: true }
  },
  {
    path: '/routines',
    name: 'routines',
    component: RoutineView,
    meta: { requiresAuth: true }
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to) => {
  const isAuthenticated = Boolean(localStorage.getItem('token'))
  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (['login', 'register'].includes(to.name) && isAuthenticated) {
    return { name: 'home' }
  }
  return true
})

export default router
