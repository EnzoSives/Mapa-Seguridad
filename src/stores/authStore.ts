import { defineStore } from 'pinia';
import axios from 'axios';

export enum UserRole {
  SuperAdmin = 'superadmin',
  Admin = 'admin',
  User = 'user',
  Editor = 'editor',
  Visor = 'visor',
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    error: null as string | null, // <-- NUEVO: para guardar el mensaje de error
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,

    userRole: (state): UserRole | null => {
      return state.user?.rol || null;
    },

    // Permisos según rol
    canCreate: (state): boolean => {
      const rol = state.user?.rol;
      return (
        rol === UserRole.SuperAdmin ||
        rol === UserRole.Admin ||
        rol === UserRole.User ||
        rol === UserRole.Editor
      );
    },

    canEdit: (state): boolean => {
      const rol = state.user?.rol;
      return rol === UserRole.SuperAdmin || rol === UserRole.Admin || rol === UserRole.Editor;
    },

    canDelete: (state): boolean => {
      const rol = state.user?.rol;
      return rol === UserRole.SuperAdmin || rol === UserRole.Admin;
    },

    canView: (state): boolean => {
      return !!state.user?.rol; // Todos los roles autenticados pueden ver
    },

    canPrint: (state): boolean => {
      return !!state.user?.rol; // Todos los roles autenticados pueden imprimir
    },
  },

  actions: {
    async login(name: string, password: string) {
      this.error = null; // <-- LIMPIAR: resetea el error al intentar iniciar sesión
      try {
        const response = await axios.post('http://179.43.127.133:3007/auth/login', {
          name,
          password,
        });

        const { access_token, username, rol } = response.data;

        // Guarda el token y los datos del usuario
        this.token = access_token;
        this.user = { name: username, rol };

        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify({ name: username, rol }));

        // Configura Axios para enviar el token en futuras peticiones
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;


      } catch (error) {
        console.error('Error en el login:', error);
        // <-- AÑADIR: Establece un mensaje de error amigable
        this.error = 'Usuario o contraseña incorrectos. Por favor, inténtalo de nuevo.';
      }
    },

    logout() {
      // Limpia el estado y el almacenamiento local
      this.token = null;
      this.user = null;
      this.error = null; // <-- LIMPIAR: también limpia el error al cerrar sesión
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
    },
  },
});
