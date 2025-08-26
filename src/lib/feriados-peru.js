/**
 * Feriados del Perú
 * Incluye feriados fijos y variables según el calendario peruano
 */

// Función para calcular la fecha de Pascua (algoritmo de Gauss)
function calcularPascua(año) {
  const a = año % 19;
  const b = Math.floor(año / 100);
  const c = año % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const n = Math.floor((h + l - 7 * m + 114) / 31);
  const p = (h + l - 7 * m + 114) % 31;

  return new Date(año, n - 1, p + 1);
}

// Función para obtener los feriados de un año específico
export function getFeriadosPeru(año) {
  const pascua = calcularPascua(año);
  const viernesSanto = new Date(pascua);
  viernesSanto.setDate(pascua.getDate() - 2);

  const juevesSanto = new Date(pascua);
  juevesSanto.setDate(pascua.getDate() - 3);

  const feriados = [
    // Feriados fijos
    { fecha: new Date(año, 0, 1), nombre: "Año Nuevo", tipo: "nacional" },
    { fecha: new Date(año, 4, 1), nombre: "Día del Trabajo", tipo: "nacional" },
    {
      fecha: new Date(año, 5, 29),
      nombre: "Día de San Pedro y San Pablo",
      tipo: "nacional",
    },
    {
      fecha: new Date(año, 6, 28),
      nombre: "Día de la Independencia",
      tipo: "nacional",
    },
    {
      fecha: new Date(año, 6, 29),
      nombre: "Día de la Independencia",
      tipo: "nacional",
    },
    {
      fecha: new Date(año, 7, 30),
      nombre: "Día de Santa Rosa de Lima",
      tipo: "nacional",
    },
    {
      fecha: new Date(año, 9, 8),
      nombre: "Combate de Angamos",
      tipo: "nacional",
    },
    {
      fecha: new Date(año, 10, 1),
      nombre: "Día de Todos los Santos",
      tipo: "nacional",
    },
    {
      fecha: new Date(año, 11, 8),
      nombre: "Inmaculada Concepción",
      tipo: "nacional",
    },
    { fecha: new Date(año, 11, 25), nombre: "Navidad", tipo: "nacional" },

    // Feriados variables (basados en Pascua)
    { fecha: juevesSanto, nombre: "Jueves Santo", tipo: "religioso" },
    { fecha: viernesSanto, nombre: "Viernes Santo", tipo: "religioso" },
    { fecha: pascua, nombre: "Domingo de Resurrección", tipo: "religioso" },
  ];

  // Agregar feriados adicionales según el año
  if (año >= 2021) {
    // Feriados que pueden variar según decretos gubernamentales
    feriados.push({
      fecha: new Date(año, 5, 24),
      nombre: "Día del Campesino",
      tipo: "sectorial",
    });
  }

  return feriados.sort((a, b) => a.fecha - b.fecha);
}

// Función para verificar si una fecha es feriado
export function esFeriado(fecha) {
  const año = fecha.getFullYear();
  const feriados = getFeriadosPeru(año);

  return feriados.some(
    (feriado) =>
      feriado.fecha.getDate() === fecha.getDate() &&
      feriado.fecha.getMonth() === fecha.getMonth() &&
      feriado.fecha.getFullYear() === fecha.getFullYear()
  );
}

// Función para obtener información del feriado en una fecha específica
export function getFeriadoInfo(fecha) {
  const año = fecha.getFullYear();
  const feriados = getFeriadosPeru(año);

  return feriados.find(
    (feriado) =>
      feriado.fecha.getDate() === fecha.getDate() &&
      feriado.fecha.getMonth() === fecha.getMonth() &&
      feriado.fecha.getFullYear() === fecha.getFullYear()
  );
}

// Función para verificar si es fin de semana
export function esFinDeSemana(fecha) {
  const dia = fecha.getDay();
  return dia === 0 || dia === 6; // 0 = Domingo, 6 = Sábado
}

// Función para verificar si es día no laborable (feriado o fin de semana)
export function esDiaNoLaborable(fecha) {
  return esFeriado(fecha) || esFinDeSemana(fecha);
}

// Función para obtener el tipo de día
export function getTipoDia(fecha) {
  const feriadoInfo = getFeriadoInfo(fecha);
  if (feriadoInfo) {
    return {
      tipo: "feriado",
      subtipo: feriadoInfo.tipo,
      nombre: feriadoInfo.nombre,
      laborable: false,
    };
  }

  const dia = fecha.getDay();
  if (dia === 0) {
    return {
      tipo: "domingo",
      subtipo: "fin_semana",
      nombre: "Domingo",
      laborable: false,
    };
  }

  if (dia === 6) {
    return {
      tipo: "sabado",
      subtipo: "fin_semana",
      nombre: "Sábado",
      laborable: false,
    };
  }

  return {
    tipo: "laborable",
    subtipo: "dia_semana",
    nombre: "Día laborable",
    laborable: true,
  };
}
