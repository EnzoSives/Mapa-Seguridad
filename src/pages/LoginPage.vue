<template>
    <q-layout>
        <q-page-container>
            <q-page class="flex flex-center bg-grey-2">
                <q-card class="q-pa-md shadow-2 my_card" bordered>
                    <q-card-section class="text-center">
                        <div class="text-grey-9 text-h5 text-weight-bold">Secretaría de Seguridad</div>
                        <div class="text-grey-9 text-h5 text-weight-bold">Iniciar Sesión</div>
                        <div class="text-grey-8">Ingresa tus credenciales</div>
                    </q-card-section>

                    <q-card-section v-if="authStore.error">
                        <q-banner inline-actions class="text-white bg-red rounded-borders">
                            <template v-slot:avatar>
                                <q-icon name="warning" color="white" />
                            </template>
                            {{ authStore.error }}
                        </q-banner>
                    </q-card-section>

                    <q-card-section>
                        <q-form @submit.prevent="handleLogin">
                            <q-input v-model="name" dense outlined label="Nombre de Usuario" class="q-mb-md"
                                :rules="[(val: string) => !!val || 'El nombre de usuario es requerido']" />
                            <q-input v-model="password" dense outlined type="password" label="Contraseña"
                                :rules="[(val: string) => !!val || 'La contraseña es requerida']" />

                            <q-btn style="border-radius: 8px;" color="dark" rounded size="md" label="Ingresar" no-caps
                                class="full-width q-mt-md" type="submit" :loading="loading"></q-btn>
                        </q-form>
                    </q-card-section>

                    </q-card>
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from 'src/stores/authStore';
import { useRouter } from 'vue-router';

const name = ref('');
const password = ref('');
const loading = ref(false);
const authStore = useAuthStore();
const router = useRouter();


const handleLogin = async () => {
    // La validación del formulario de Quasar ya se encargó de verificar que los campos tienen valor,
    // pero mantenemos esta comprobación para mayor seguridad.
    if (!name.value || !password.value) {
        return;
    }
    loading.value = true;
    await authStore.login(name.value, password.value);
    loading.value = false;

    if (authStore.isLoggedIn) {
        void router.push('/');
    }
};
</script>

<style scoped>
.my_card {
    width: 25rem;
    border-radius: 8px;
}
</style>
