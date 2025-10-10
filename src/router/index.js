import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/Login/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: LoginView
    },
    {
      path: '/Dashboard',
      name: 'Dashboard',
      component: () => import('../views/Dashboard/DashboardView.vue')
    },
    {
      path: '/Asistencias',
      name: 'Asistencias',
      component: () => import('../views/Asistencias/AsistenciasView.vue')
    },
    {
      path: '/Documentacion',
      name: 'Documentacion',
      component: () => import('../views/Contratos/ContratosView.vue')
    },
    {
      path: '/Vacaciones',
      name: 'Vacaciones',
      component: () => import('../views/Vacaciones/VacacionesView.vue')
    },
    {
      path: '/Incidencias',
      name: 'Incidencias',
      component: () => import('../views/Incidencias/IncidenciasView.vue')
    },
    {
      path: '/Areas',
      name: 'Areas',
      component: () => import('../views/Areas/AreasView.vue')
    }
  ]
})

export default router
