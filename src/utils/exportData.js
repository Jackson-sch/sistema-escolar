/**
 * Utilidades para exportar datos en diferentes formatos (CSV, PDF, Excel)
 */

import { format } from "date-fns";
import { es } from "date-fns/locale";
import * as XLSX from "xlsx";

/**
 * Convierte un array de objetos a formato CSV y lo descarga
 * @param {Array} data - Array de objetos con los datos a exportar
 * @param {String} filename - Nombre del archivo sin extensión
 * @param {Array} headers - Array de objetos con key y label para las columnas
 */
export const exportToCSV = (data, filename, headers) => {
  if (!data || !data.length) {
    console.error("No hay datos para exportar");
    return;
  }

  // Preparar encabezados
  const csvHeaders = headers.map(header => header.label).join(',');
  
  // Preparar filas
  const csvRows = data.map(row => {
    return headers
      .map(header => {
        const value = row[header.key];
        // Manejar valores especiales
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
        if (value instanceof Date) return `"${value.toLocaleDateString()}"`;
        return value;
      })
      .join(',');
  });

  // Combinar encabezados y filas
  const csvContent = [csvHeaders, ...csvRows].join('\n');
  
  // Crear blob y descargar
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  // Crear URL para descargar
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Prepara los datos de asistencias para exportación
 * @param {Array} asistencias - Array de objetos de asistencias
 * @returns {Object} Objeto con datos y encabezados
 */
export const prepareAsistenciasForExport = (asistencias) => {
  const headers = {
    fecha: "Fecha",
    estudiante: "Estudiante",
    curso: "Curso",
    estado: "Estado",
    observaciones: "Observaciones",
    justificacion: "Justificación",
    registradoPor: "Registrado por"
  };

  const data = asistencias.map(asistencia => {
    return {
      fecha: format(new Date(asistencia.fecha), "dd/MM/yyyy"),
      estudiante: `${asistencia.estudiante?.apellidoPaterno || ''} ${asistencia.estudiante?.apellidoMaterno || ''}, ${asistencia.estudiante?.name || 'Sin nombre'}`,
      curso: asistencia.curso?.nombre || 'Sin curso',
      estado: asistencia.estado.charAt(0).toUpperCase() + asistencia.estado.slice(1),
      observaciones: asistencia.observaciones || '',
      justificacion: asistencia.justificacion || '',
      registradoPor: asistencia.registradoPor?.name || 'Sistema'
    };
  });

  return { data, headers };
};

/**
 * Exporta datos a un archivo Excel y lo descarga
 * @param {Array} data - Array de objetos con los datos a exportar
 * @param {string} filename - Nombre del archivo sin extensión
 * @param {Object} headers - Objeto con los encabezados del Excel (clave: valor mostrado)
 * @param {string} sheetName - Nombre de la hoja de cálculo (opcional)
 */
export const exportToExcel = (data, filename, headers, sheetName = "Datos") => {
  try {
    // Preparar los datos con los encabezados correctos
    const formattedData = data.map(item => {
      const newItem = {};
      Object.keys(headers).forEach(key => {
        newItem[headers[key]] = item[key];
      });
      return newItem;
    });
    
    // Crear libro y hoja
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    
    // Añadir hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Guardar y descargar
    XLSX.writeFile(workbook, `${filename}.xlsx`);
    
    return true;
  } catch (error) {
    console.error("Error al exportar a Excel:", error);
    return false;
  }
};

/**
 * Determina el formato de exportación y llama a la función correspondiente
 * @param {Array} data - Array de objetos con los datos a exportar
 * @param {string} filename - Nombre del archivo sin extensión
 * @param {Object} headers - Objeto con los encabezados (clave: valor mostrado)
 * @param {string} format - Formato de exportación ('csv' o 'excel')
 * @returns {boolean} Éxito de la operación
 */
export const exportData = (data, filename, headers, format = 'csv') => {
  try {
    if (format === 'excel') {
      return exportToExcel(data, filename, headers);
    } else {
      exportToCSV(data, filename, headers);
      return true;
    }
  } catch (error) {
    console.error(`Error al exportar en formato ${format}:`, error);
    return false;
  }
};

/**
 * Prepara los datos de estadísticas para exportar a CSV
 * @param {Object} estadisticas - Objeto con estadísticas de asistencia
 * @returns {Object} Objeto con datos y encabezados listos para CSV
 */
export const prepareEstadisticasForExport = (estadisticas) => {
  // Encabezados para estadísticas generales
  const headersGenerales = [
    { key: 'concepto', label: 'Concepto' },
    { key: 'valor', label: 'Valor' },
    { key: 'porcentaje', label: 'Porcentaje' }
  ];

  // Datos generales
  const dataGenerales = [
    { 
      concepto: 'Total Registros', 
      valor: estadisticas.totalRegistros,
      porcentaje: '100%'
    },
    { 
      concepto: 'Presentes', 
      valor: estadisticas.presente || 0,
      porcentaje: calcularPorcentaje(estadisticas.presente, estadisticas.totalRegistros) + '%'
    },
    { 
      concepto: 'Ausentes', 
      valor: estadisticas.ausente || 0,
      porcentaje: calcularPorcentaje(estadisticas.ausente, estadisticas.totalRegistros) + '%'
    },
    { 
      concepto: 'Tardanzas', 
      valor: estadisticas.tardanza || 0,
      porcentaje: calcularPorcentaje(estadisticas.tardanza, estadisticas.totalRegistros) + '%'
    },
    { 
      concepto: 'Justificados', 
      valor: estadisticas.justificado || 0,
      porcentaje: calcularPorcentaje(estadisticas.justificado, estadisticas.totalRegistros) + '%'
    }
  ];

  // Si hay estadísticas por curso
  let dataCursos = [];
  let headersCursos = [];
  
  if (estadisticas.porCurso && estadisticas.porCurso.length > 0) {
    headersCursos = [
      { key: 'curso', label: 'Curso' },
      { key: 'codigo', label: 'Código' },
      { key: 'presentes', label: 'Presentes' },
      { key: 'ausentes', label: 'Ausentes' },
      { key: 'tardanzas', label: 'Tardanzas' },
      { key: 'justificados', label: 'Justificados' },
      { key: 'total', label: 'Total' },
      { key: 'porcentajeAsistencia', label: '% Asistencia' }
    ];

    dataCursos = estadisticas.porCurso.map(curso => {
      const total = curso.presente + curso.ausente + curso.tardanza + curso.justificado;
      const porcentajeAsistencia = calcularPorcentaje(curso.presente + curso.justificado, total);
      
      return {
        curso: curso.curso.nombre,
        codigo: curso.curso.codigo,
        presentes: curso.presente,
        ausentes: curso.ausente,
        tardanzas: curso.tardanza,
        justificados: curso.justificado,
        total: total,
        porcentajeAsistencia: porcentajeAsistencia + '%'
      };
    });
  }

  return { 
    dataGenerales, 
    headersGenerales,
    dataCursos,
    headersCursos
  };
};

/**
 * Calcula el porcentaje de un valor respecto a un total
 * @param {Number} valor - Valor a calcular
 * @param {Number} total - Total para el cálculo
 * @returns {Number} Porcentaje redondeado
 */
const calcularPorcentaje = (valor, total) => {
  return total > 0 ? Math.round((valor / total) * 100) : 0;
};
