// src/stores/gisStore.ts

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
  numero_denuncia: string;
  fiscal: string;
  barrio: string;
}

export const useGisStore = defineStore('gis', {
  state: () => ({
    allMarcadores: [] as MarcadorSeg[], // <-- Guarda todos los marcadores, sin filtrar
    marcadores: [] as MarcadorSeg[], // <-- La lista que se muestra, puede estar filtrada
    marcadorSeleccionado: null as MarcadorSeg | null,
  }),

  actions: {
    // Carga inicial de marcadores
    async cargarMarcadores() {
      try {
        const response = await axios.get('http://179.43.127.133:3006/marcador-seg');
        // Guardamos los datos en ambas listas
        this.allMarcadores = response.data;
        this.marcadores = response.data;
      } catch (error) {
        console.error('Error al cargar marcadores desde la API:', error);
      }
    },

    // --- ¡NUEVA ACCIÓN DE FILTRADO LOCAL! ---
    filtrarMarcadoresPorFecha(fechaInicio: string, fechaFin: string) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);

      // Para incluir el día completo de la fecha de fin
      fin.setHours(23, 59, 59, 999);

      this.marcadores = this.allMarcadores.filter((marcador) => {
        if (!marcador.fecha_inicio) return false;
        const fechaMarcador = new Date(marcador.fecha_inicio);
        return fechaMarcador >= inicio && fechaMarcador <= fin;
      });
    },

    // --- ¡NUEVA ACCIÓN PARA LIMPIAR EL FILTRO! ---
    limpiarFiltroDeFechas() {
      this.marcadores = this.allMarcadores;
    },

    async agregarMarcador(marcador: Omit<MarcadorSeg, 'id'>) {
      try {
        const response = await axios.post('http://179.43.127.133:3006/marcador-seg', marcador);
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
          marcador,
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

    // --- ¡ACCIÓN MODIFICADA! ---
    seleccionarMarcador(id: number) {
      // Busca el marcador directamente en el array del estado.
      const marcador = this.marcadores.find((m) => m.id === id);
      if (marcador) {
        this.marcadorSeleccionado = marcador;
      } else {
        console.error(`No se encontró el marcador con id: ${id} en el store.`);
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