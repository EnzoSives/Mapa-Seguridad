import { defineStore } from 'pinia';
import axios from 'axios';

export interface MarcadorSeg {
  id: number;
  nombre: string;
  apellido: string;
  direccion: string;
  telefono: string;
  dni: string;
  notas?: string;
  latitud: number;
  longitud: number;
  icono: string;
}

export const useGisStore = defineStore('gis', {
  state: () => ({
    marcadores: [] as MarcadorSeg[],
    marcadorSeleccionado: null as MarcadorSeg | null,
  }),

  actions: {
    async cargarMarcadores() {
      try {
        const response = await axios.get('http://179.43.127.133:3006/marcador-seg');
        this.marcadores = response.data;
      } catch (error) {
        console.error('Error al cargar marcadores desde la API:', error);
      }
    },

    async agregarMarcador(marcador: Omit<MarcadorSeg, 'id'>) {
      try {
        const response = await axios.post(
          'http://179.43.127.133:3006/marcador-seg',
          marcador
        );
        const nuevoMarcador: MarcadorSeg = response.data;

        this.marcadores = [...this.marcadores, nuevoMarcador];

        this.marcadorSeleccionado = nuevoMarcador;
      } catch (error) {
        console.error('Error al agregar marcador:', error);
        throw error;
      }
    },

    async actualizarMarcador(marcador: MarcadorSeg) {
        try {
            const response = await axios.put(
                `http://179.43.127.133:3006/marcador-seg/${marcador.id}`,
                marcador
            );

            const index = this.marcadores.findIndex(m => m.id === marcador.id);
            if (index !== -1) {
                this.marcadores[index] = response.data;
            }

            this.marcadorSeleccionado = response.data;
        } catch (error) {
            console.error('Error al actualizar marcador:', error);
            throw error;
        }
    },

    async seleccionarMarcador(id: number) {
      try {
        const response = await axios.get(
          `http://179.43.127.133:3006/marcador-seg/${id}`
        );
        this.marcadorSeleccionado = response.data;
      } catch (error) {
        console.error('Error al obtener el marcador completo:', error);
      }
    },

    async eliminarMarcador(id: number) {
        try {
            await axios.delete(`http://179.43.127.133:3006/marcador-seg/${id}`);
            this.marcadores = this.marcadores.filter(m => m.id !== id);
            this.marcadorSeleccionado = null;
        } catch (error) {
            console.error('Error al eliminar marcador:', error);
            throw error;
        }
    },

    cerrarInfo() {
      this.marcadorSeleccionado = null;
    },
  },
});
