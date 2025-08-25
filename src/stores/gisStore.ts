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
        
        // --- CAMBIO CLAVE AQUÍ ---
        // En lugar de this.marcadores.push(nuevoMarcador), 
        // reasignamos el array para asegurar la reactividad.
        this.marcadores = [...this.marcadores, nuevoMarcador];
        
        this.marcadorSeleccionado = nuevoMarcador;
      } catch (error) {
        console.error('Error al agregar marcador:', error);
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

    cerrarInfo() {
      this.marcadorSeleccionado = null;
    },
  },
});