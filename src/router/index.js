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
      path: '/Singup',
      name: 'Singup',
      component: () => import('../views/Registro/RegistroView.vue')
    },
    {
      path: '/Asistencias',
      name: 'Asistencias',
      component: () => import('../views/Asistencias/AsistenciasView.vue')
    },
    {
      path: '/Asistencias/justificantes',
      name: 'AsistenciasJustificantes',
      component: () => import('../views/Asistencias/AsistenciasView.vue')
    },
    {
      path: '/Asistencias/reporte-asistencias',
      name: 'AsistenciasReporteAsistencias',
      component: () => import('../views/Asistencias/AsistenciasView.vue')
    },
    {
      path: '/Asistencias/reporte-visitas',
      name: 'AsistenciasReporteVisitas',
      component: () => import('../views/Asistencias/AsistenciasView.vue')
    },
    {
      path: '/Asistencias/reporte-analitico',
      name: 'AsistenciasReporteAnalitico',
      component: () => import('../views/Asistencias/AsistenciasView.vue')
    },
    {
      path: '/Contratos',
      name: 'Contratos',
      component: () => import('../views/Contratos/ContratosView.vue')
    },
    {
      path: '/Contratos/crear',
      name: 'ContratosCrear',
      component: () => import('../views/Contratos/ContratosView.vue')
    },
    {
      path: '/Contratos/estadisticas',
      name: 'ContratosEstadisticas',
      component: () => import('../views/Contratos/ContratosView.vue')
    },
    {
      path: '/Contratos/otra',
      name: 'ContratosOtra',
      component: () => import('../views/Contratos/ContratosView.vue')
    },
    {
      path: '/Vacaciones',
      name: 'Vacaciones',
      component: () => import('../views/Vacaciones/VacacionesView.vue')
    },
    {
      path: '/Vacaciones/Historial-de-vacaciones',
      name: 'VacacionesHistorial',
      component: () => import('../views/Vacaciones/VacacionesView.vue')
    },{
      path: '/Vacaciones/Solicitudes-de-vacaciones',
      name: 'VacacionesSolicitudes',
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
