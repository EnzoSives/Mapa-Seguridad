<template>
  <q-layout view="lHh Lpr lFf" id="main-layout">
    <q-header flat class="text-white">
      <div class="header-container">
        <q-toolbar class="q-toolbar-custom">
          <div class="menu-container">
            <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" class="q-mr-md" color="dark" />
            <q-toolbar-title class="text-dark">
              Mapa Simple
            </q-toolbar-title>

            <q-btn flat dense icon="tune" label="Herramientas" class="q-mx-sm text-dark" @click="toggleTools" />

            <div v-if="authStore.isLoggedIn" class="q-mr-md text-dark">
              Hola, {{ authStore.user?.name }}
            </div>
            <q-btn v-if="authStore.isLoggedIn" flat round dense icon="logout" @click="handleLogout" color="dark" />
          </div>
        </q-toolbar>

        <transition name="fade">
          <div v-if="showTools" class="tools-bar">
            <div class="date-inputs">
              <q-input outlined v-model="fechaInicio" mask="####/##/##" dense label="Fecha de inicio" class="q-my-sm">
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="fechaInicio" mask="YYYY/MM/DD" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              <q-input outlined v-model="fechaFin" mask="####/##/##" dense label="Fecha de fin" class="q-my-sm">
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="fechaFin" mask="YYYY/MM/DD" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
          </div>
        </transition>
        </div>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered>
<q-list>
  <q-item-label header>Menú</q-item-label>
  <q-item clickable to="/">
    <q-item-section avatar>
      <q-icon name="map" />
    </q-item-section>
    <q-item-section>
      <q-item-label>Mapa</q-item-label>
    </q-item-section>
  </q-item>
  <q-item clickable to="/datos">
    <q-item-section avatar>
      <q-icon name="list" />
    </q-item-section>
    <q-item-section>
      <q-item-label>Datos</q-item-label>
    </q-item-section>
  </q-item>
  <q-separator />
  <q-item clickable @click="handleLogout">
    <q-item-section avatar>
      <q-icon name="logout" />
    </q-item-section>
    <q-item-section>
      <q-item-label>Cerrar Sesión</q-item-label>
    </q-item-section>
  </q-item>
</q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const leftDrawerOpen = ref(false);
const showTools = ref(false);
const fechaInicio = ref(null);
const fechaFin = ref(null);

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const toggleTools = () => {
  showTools.value = !showTools.value;
};

const handleLogout = () => {
  authStore.logout();
  void router.push('/login');
};
</script>

<style scoped>
#main-layout > .q-header {
  background-color: transparent !important;
  box-shadow: none !important;
}

.header-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 15px;
}

.q-toolbar-custom {
  justify-content: center;
  padding: 0;
  min-height: auto;
}

.menu-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1.5rem;
  background-color: white;
  border-radius: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.date-inputs {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: white;
  border-radius: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 10px;
  padding: 0.5rem 1.5rem;
}

.date-inputs .q-input {
  width: 140px;
}

/* 👇 ESTILOS PARA LA NUEVA TRANSICIÓN 👇 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
/* 👆 FIN DE LOS ESTILOS 👆 */
</style>
