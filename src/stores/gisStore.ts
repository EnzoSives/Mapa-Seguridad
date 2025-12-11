// src/stores/gisStore.ts

import { defineStore } from 'pinia';
import axios from 'axios';

// Interfaz para el nuevo modelo de Delito
export interface Delito {
  id?: number;
  articulo?: string | null;
  inciso?: string | null;
  tipoDelito?: string | null;
}

// Interfaz para Imputado
export interface Delincuente {
  id?: number;
  nombre?: string | null;
  dni?: string | null;
}

// Interfaz actualizada para MarcadorSeg
export interface MarcadorSeg {
  id: number;
  nombre: string | null;
  apellido: string | null;
  direccion: string | null;
  telefono: string | null;
  dni: string | null;
  notas: string | null;
  latitud: number;
  longitud: number;
  icono: string;
  fecha_inicio?: Date;
  fecha_fin?: Date;
  delitos?: Delito[];
  delincuentes?: Delincuente[];
  numero_denuncia: string | null;
  fiscal: string | null;
  barrio: string | null;
}

export const useGisStore = defineStore('gis', {
  state: () => ({
    allMarcadores: [] as MarcadorSeg[], // <-- Guarda todos los marcadores, sin filtrar
    marcadores: [] as MarcadorSeg[], // <-- La lista que se muestra (VACÍA POR DEFECTO)
    marcadorSeleccionado: null as MarcadorSeg | null,
  }),

  actions: {
    // 1. 🛑 CAMBIO CLAVE: Carga la base de datos completa, PERO NO actualiza 'marcadores'.
    async cargarDatosBase() {
      if (this.allMarcadores.length > 0) return; // Evitar recargas
      try {
        const response = await axios.get('http://179.43.127.133:3007/marcador-seg');
        this.allMarcadores = response.data;
        // 🛑 this.marcadores NO se actualiza aquí. El mapa inicia vacío.
      } catch (error) {
        console.error('Error al cargar datos base desde la API:', error);
      }
    },

    // 2. NUEVA ACCIÓN: Se usa solo en DatosPage.vue para llenar la tabla
    async cargarDatosParaTabla() {
        await this.cargarDatosBase();
        this.marcadores = this.allMarcadores; // Muestra todos los datos
    },

    // 3. Acción de Filtrado
    async filtrarMarcadoresPorFecha(fechaInicio: string, fechaFin: string) {
      await this.cargarDatosBase(); // Asegura que allMarcadores esté listo

      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);

      // Para incluir el día completo de la fecha de fin
      fin.setHours(23, 59, 59, 999);

      this.marcadores = this.allMarcadores.filter((marcador) => {
        if (!marcador.fecha_inicio) return false;
        const fechaMarcador = new Date(marcador.fecha_inicio);
        return fechaMarcador >= inicio && fechaMarcador <= fin;
      });
      this.cerrarInfo();
    },

    // 4. 🚀 CAMBIO CLAVE: Al limpiar el filtro, el mapa/lista se VACÍA.
    limpiarFiltroDeFechas() {
      this.marcadores = []; // <-- Vacía el array para que el mapa quede en blanco
      this.cerrarInfo();
    },

    // 4.5 Nueva acción: Mostrar todos los marcadores
    async mostrarTodos() {
      await this.cargarDatosBase();
      this.marcadores = [...this.allMarcadores]; // Muestra todos los marcadores
      this.cerrarInfo();
    },

    // 5. Ajustes en CRUD para manejar allMarcadores
    async agregarMarcador(marcador: Omit<MarcadorSeg, 'id'>) {
      try {
        const response = await axios.post('http://179.43.127.133:3007/marcador-seg', marcador);
        const nuevoMarcador: MarcadorSeg = response.data;

        this.allMarcadores.push(nuevoMarcador);

        // Si el usuario está viendo la tabla o el mapa filtrado, actualizamos la lista mostrada
        if (this.marcadores.length > 0) {
            this.marcadores = [...this.marcadores, nuevoMarcador];
        }

        this.marcadorSeleccionado = nuevoMarcador;
      } catch (error) {
        console.error('Error al agregar marcador:', error);
        throw error;
      }
    },

    async actualizarMarcador(marcador: MarcadorSeg) {
      try {
        const response = await axios.put(
          `http://179.43.127.133:3007/marcador-seg/${marcador.id}`,
          marcador,
        );
        const marcadorActualizado = response.data;

        // Actualiza `marcadores` (lista mostrada)
        let index = this.marcadores.findIndex((m) => m.id === marcador.id);
        if (index !== -1) {
          this.marcadores[index] = marcadorActualizado;
        }

        // Actualiza `allMarcadores` (lista de datos base)
        index = this.allMarcadores.findIndex((m) => m.id === marcador.id);
        if (index !== -1) {
            this.allMarcadores[index] = marcadorActualizado;
        }

        this.marcadorSeleccionado = marcadorActualizado;
      } catch (error) {
        console.error('Error al actualizar marcador:', error);
        throw error;
      }
    },

    // 6. Ajuste en seleccionarMarcador
    seleccionarMarcador(id: number) {
      // Prioriza buscar en marcadores (la lista visible)
      let marcador = this.marcadores.find((m) => m.id === id);
      if (!marcador) {
         // Si no está visible (ej: limpió el filtro), busca en la lista completa
         marcador = this.allMarcadores.find((m) => m.id === id);
      }
      if (marcador) {
        this.marcadorSeleccionado = marcador;
      } else {
        console.error(`No se encontró el marcador con id: ${id} en el store.`);
      }
    },

    async eliminarMarcador(id: number) {
      try {
        await axios.delete(`http://179.43.127.133:3007/marcador-seg/${id}`);
        this.marcadores = this.marcadores.filter((m) => m.id !== id);
        this.allMarcadores = this.allMarcadores.filter((m) => m.id !== id);
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
