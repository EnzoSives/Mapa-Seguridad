import { defineStore } from 'pinia';
import axios from 'axios';

// Interfaz para el nuevo modelo de Delito
export interface Delito {
  id?: number;
  articulo?: string;
  inciso?: string;
  tipoDelito?: string;
}

// Interfaz actualizada para MarcadorSeg
export interface MarcadorSeg {
  id: number;
  nombre: string;
  apellido: string;
  direccion: string;
  telefono: string;
  dni: string;
  notas: string;
  latitud: number;
  longitud: number;
  icono: string;
  fecha_inicio?: Date;
  fecha_fin?: Date;
  delitos?: Delito[];
}

export const useGisStore = defineStore('gis', {
  state: () => ({
    marcadores: [] as MarcadorSeg[],
    marcadorSeleccionado: null as MarcadorSeg | null,
  }),

  actions: {
    async cargarMarcadores() {
      try {
        const response = await axios.get('http://localhost:3006/marcador-seg');
        this.marcadores = response.data;
      } catch (error) {
        console.error('Error al cargar marcadores desde la API:', error);
      }
    },

    async agregarMarcador(marcador: Omit<MarcadorSeg, 'id'>) {
      try {
        const response = await axios.post(
          'http://localhost:3006/marcador-seg',
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
          `http://localhost:3006/marcador-seg/${marcador.id}`,
          marcador
        );

        const index = this.marcadores.findIndex((m) => m.id === marcador.id);
        if (index !== -1) {
          // Asegúrate de que la respuesta del backend se use para actualizar el estado
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
          `http://localhost:3006/marcador-seg/${id}`
        );
        this.marcadorSeleccionado = response.data;
      } catch (error) {
        console.error('Error al obtener el marcador completo:', error);
      }
    },

    async eliminarMarcador(id: number) {
      try {
        await axios.delete(`http://localhost:3006/marcador-seg/${id}`);
        this.marcadores = this.marcadores.filter((m) => m.id !== id);
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