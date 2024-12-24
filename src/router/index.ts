import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'
import MyRoutePage from "@/views/MyRoutePage.vue";
import SaveMyTrackPage from "@/views/SaveMyTrackPage.vue";
import ChangePassword from "@/views/ChangePassword.vue";
import PrivacyPolicy from "@/views/PrivacyPolicy.vue";
import TermsPage from "@/views/TermsPage.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/tab1'
  },
  {
    path: '/login',
    component: () => import('@/views/LoginPage.vue')
  },
  {
    path: '/register',
    component: () => import('@/views/RegisterPage.vue')
  },
  {
    path: '/tabs/',
    component: TabsPage,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/tabs/tab1'
      },
      {
        path: 'tab1',
        component: () => import('@/views/Tab1Page.vue')
      },
      {
        path: 'tab2',
        component: () => import('@/views/Tab2Page.vue')
      },
      {
        path: 'tab3',
        component: () => import('@/views/Tab3Page.vue')
      },
      {
        path: 'tab4',
        component: () => import('@/views/Tab4Page.vue')
      },
      {
        path: 'tab5',
        component: () => import('@/views/Tab5Page.vue')
      },
    ]
  },
  {
    path: '/route/:route',
    component: MyRoutePage,
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/save',
    component: SaveMyTrackPage,
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/change-password',
    component: ChangePassword,
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/privacy-policy',
    component: PrivacyPolicy,
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/terms',
    component: TermsPage,
    meta: { requiresAuth: true },
    props: true
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('authToken');

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router
