'use client';

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Limpia y procesa el HTML para eliminar colores no compatibles
 * @param {string} htmlContent - Contenido HTML original
 * @returns {string} - HTML limpio sin colores problemáticos
 */
function limpiarHTMLParaPDF(htmlContent) {
  if (!htmlContent) return '';

  // Crear un parser temporal para trabajar con el HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  // Función para reemplazar colores problemáticos en CSS
  function limpiarCSS(cssText) {
    if (!cssText) return '';

    return cssText
      // Reemplazar colores OKLCH
      .replace(/oklch\([^)]+\)/gi, '#333333')
      // Reemplazar colores HSL complejos
      .replace(/hsl\([^)]+\)/gi, '#666666')
      // Reemplazar variables CSS problemáticas
      .replace(/var\(--[^)]+\)/gi, '#333333')
      // Reemplazar colores RGB complejos si causan problemas
      .replace(/rgba?\([^)]+\)/gi, function (match) {
        // Mantener colores RGB básicos, reemplazar los complejos
        if (match.includes('calc') || match.includes('var')) {
          return '#333333';
        }
        return match;
      });
  }

  // Procesar todos los elementos style
  const styleElements = doc.querySelectorAll('style');
  styleElements.forEach(styleEl => {
    if (styleEl.textContent) {
      styleEl.textContent = limpiarCSS(styleEl.textContent);
    }
  });

  // Procesar atributos style inline
  const elementsWithStyle = doc.querySelectorAll('[style]');
  elementsWithStyle.forEach(el => {
    const style = el.getAttribute('style');
    if (style) {
      el.setAttribute('style', limpiarCSS(style));
    }
  });

  return doc.documentElement.outerHTML;
}

/**
 * Procesa un elemento DOM para eliminar colores problemáticos
 * @param {Element} element - Elemento DOM a procesar
 */
function procesarElementoDOM(element) {
  if (!element || !element.style) return;

  // Propiedades de color que pueden causar problemas
  const colorProperties = [
    'color', 'backgroundColor', 'borderColor', 'borderTopColor',
    'borderRightColor', 'borderBottomColor', 'borderLeftColor',
    'outlineColor', 'textDecorationColor', 'caretColor'
  ];

  colorProperties.forEach(prop => {
    const value = element.style[prop];
    if (value && (value.includes('oklch') || value.includes('var(--'))) {
      element.style[prop] = prop === 'backgroundColor' ? '#ffffff' : '#333333';
    }
  });

  // Procesar hijos recursivamente
  if (element.children) {
    Array.from(element.children).forEach(child => {
      procesarElementoDOM(child);
    });
  }
}

/**
 * Genera un PDF a partir de un contenido HTML
 * @param {string} htmlContent - Contenido HTML a convertir en PDF
 * @param {string} fileName - Nombre del archivo PDF a generar
 * @param {Object} options - Opciones adicionales para la generación del PDF
 * @returns {Promise<Blob>} - Blob del PDF generado
 */
export async function generatePDFFromHTML(htmlContent, fileName, options = {}) {
  try {
    console.log('Iniciando generación de PDF...');

    // Paso 1: Limpiar el HTML de colores problemáticos
    console.log('Limpiando HTML...');
    const htmlLimpio = limpiarHTMLParaPDF(htmlContent);

    // Paso 2: Crear elemento temporal
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlLimpio;
    tempDiv.style.cssText = `
      position: absolute;
      left: -9999px;
      top: -9999px;
      width: 794px;
      font-family: Arial, sans-serif;
      background-color: white;
      padding: 0;
      margin: 0;
      box-sizing: border-box;
    `;

    // Ajustar estilos para asegurar que el contenido se ajuste a la página
    const containerElements = tempDiv.querySelectorAll('.container');
    containerElements.forEach(container => {
      container.style.cssText = `
        max-width: 100%;
        width: 100%;
        margin: 0;
        padding: 20px;
        box-sizing: border-box;
        overflow: hidden;
      `;
    });

    // Paso 3: Agregar al DOM
    document.body.appendChild(tempDiv);

    // Paso 4: Procesar elementos DOM directamente
    console.log('Procesando elementos DOM...');
    procesarElementoDOM(tempDiv);

    // Paso 5: Esperar a que se carguen recursos
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Generando canvas...');

    // Paso 6: Convertir a canvas con configuración robusta
    const canvas = await html2canvas(tempDiv, {
      scale: 1.5,
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff',
      removeContainer: false,
      foreignObjectRendering: false,
      imageTimeout: 15000,
      onclone: (clonedDoc) => {
        console.log('Procesando documento clonado...');

        // Procesar todos los elementos en el documento clonado
        const allElements = clonedDoc.querySelectorAll('*');
        allElements.forEach(el => {
          // Eliminar colores problemáticos del estilo computado
          const computedStyle = window.getComputedStyle(el);

          // Verificar y corregir colores
          if (computedStyle.color && computedStyle.color.includes('oklch')) {
            el.style.color = '#333333';
          }
          if (computedStyle.backgroundColor && computedStyle.backgroundColor.includes('oklch')) {
            el.style.backgroundColor = '#ffffff';
          }
          if (computedStyle.borderColor && computedStyle.borderColor.includes('oklch')) {
            el.style.borderColor = '#cccccc';
          }

          // Forzar fuentes web-safe
          if (el.style.fontFamily) {
            el.style.fontFamily = 'Arial, sans-serif';
          }
        });

        // Procesar hojas de estilo
        const styleSheets = clonedDoc.styleSheets;
        for (let i = 0; i < styleSheets.length; i++) {
          try {
            const styleSheet = styleSheets[i];
            if (styleSheet.cssRules) {
              for (let j = 0; j < styleSheet.cssRules.length; j++) {
                const rule = styleSheet.cssRules[j];
                if (rule.style) {
                  // Limpiar reglas CSS problemáticas
                  if (rule.style.color && rule.style.color.includes('oklch')) {
                    rule.style.color = '#333333';
                  }
                  if (rule.style.backgroundColor && rule.style.backgroundColor.includes('oklch')) {
                    rule.style.backgroundColor = '#ffffff';
                  }
                }
              }
            }
          } catch (e) {
            console.warn('No se pudo procesar hoja de estilo:', e);
          }
        }
      }
    });

    // Paso 7: Limpiar DOM
    document.body.removeChild(tempDiv);

    console.log('Canvas generado, creando PDF...');

    // Paso 8: Crear PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
      ...options
    });

    // Paso 9: Calcular dimensiones
    const imgWidth = 210; // Ancho A4 en mm
    const pageHeight = 297; // Alto A4 en mm

    // Ajustar la imagen para que se ajuste a la página
    let imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Forzar que la imagen se ajuste a una sola página
    const scale = pageHeight < imgHeight ? pageHeight / imgHeight : 1;
    const scaledImgWidth = imgWidth * scale;
    const scaledImgHeight = imgHeight * scale;

    console.log(`Dimensiones originales: ${imgWidth}mm x ${imgHeight}mm`);
    console.log(`Dimensiones escaladas: ${scaledImgWidth}mm x ${scaledImgHeight}mm`);
    console.log(`Factor de escala: ${scale}`);

    // Paso 10: Agregar imagen al PDF
    const imgData = canvas.toDataURL('image/png', 0.95);

    // Calcular margen para centrar si es necesario
    const marginX = 0; // Sin margen horizontal
    const marginY = 0; // Sin margen vertical

    // Forzar que el contenido se ajuste a una sola página
    // Usar el factor de escala calculado para asegurar que todo quepa
    pdf.addImage(imgData, 'PNG', marginX, marginY, scaledImgWidth, scaledImgHeight);
    console.log('PDF generado en una sola página con escalado forzado');

    console.log('PDF generado exitosamente');
    return pdf.output('blob');

  } catch (error) {
    console.error('Error detallado al generar PDF:', error);

    // Proporcionar información más específica sobre el error
    if (error.message.includes('color')) {
      throw new Error('Error al procesar colores en el PDF. Verifique que no haya colores OKLCH en el CSS.');
    } else if (error.message.includes('canvas')) {
      throw new Error('Error al generar el canvas. Verifique el contenido HTML.');
    } else if (error.message.includes('font')) {
      throw new Error('Error al procesar fuentes. Usando fuentes web-safe.');
    } else {
      throw new Error(`Error al generar PDF: ${error.message}`);
    }
  }
}

/**
 * Descarga un PDF generado
 * @param {Blob} pdfBlob - Blob del PDF a descargar
 * @param {string} fileName - Nombre del archivo PDF
 */
export function downloadPDF(pdfBlob, fileName) {
  try {
    // Validar parámetros
    if (!pdfBlob || !fileName) {
      throw new Error('Parámetros inválidos para descargar PDF');
    }

    // Crear URL para el blob
    const url = URL.createObjectURL(pdfBlob);

    // Crear enlace temporal
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';

    // Agregar al DOM, hacer clic y limpiar
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Limpiar URL después de un tiempo
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);

    console.log('Descarga iniciada:', fileName);

  } catch (error) {
    console.error('Error al descargar PDF:', error);
    throw new Error('Error al descargar el PDF');
  }
}

/**
 * Abre un PDF en una nueva pestaña
 * @param {Blob} pdfBlob - Blob del PDF a abrir
 */
export function openPDFInNewTab(pdfBlob) {
  try {
    // Validar parámetro
    if (!pdfBlob) {
      throw new Error('Blob de PDF inválido');
    }

    // Crear URL para el blob
    const url = URL.createObjectURL(pdfBlob);

    // Abrir en nueva pestaña
    const newWindow = window.open(url, '_blank');

    if (!newWindow) {
      throw new Error('No se pudo abrir la nueva pestaña. Verifique el bloqueador de pop-ups.');
    }

    // Limpiar URL después de un tiempo
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 30000);

    console.log('PDF abierto en nueva pestaña');

  } catch (error) {
    console.error('Error al abrir PDF:', error);
    throw new Error('Error al abrir el PDF en nueva pestaña');
  }
}

/**
 * Función auxiliar para validar si un color es problemático
 * @param {string} color - Color a validar
 * @returns {boolean} - True si el color es problemático
 */
export function esColorProblematico(color) {
  if (!color) return false;

  const coloresProblematicos = [
    'oklch(',
    'var(--',
    'hsl(',
    'hsla(',
    'color-mix(',
    'light-dark('
  ];

  return coloresProblematicos.some(patron => color.includes(patron));
}

/**
 * Función auxiliar para convertir colores problemáticos a seguros
 * @param {string} color - Color a convertir
 * @returns {string} - Color seguro
 */
export function convertirColorSeguro(color) {
  if (!color || !esColorProblematico(color)) {
    return color;
  }

  // Colores de reemplazo seguros
  const coloresSegurosPorDefecto = {
    'oklch(': '#333333',
    'var(--': '#333333',
    'hsl(': '#666666',
    'hsla(': '#666666',
    'color-mix(': '#333333',
    'light-dark(': '#333333'
  };

  for (const [patron, reemplazo] of Object.entries(coloresSegurosPorDefecto)) {
    if (color.includes(patron)) {
      return reemplazo;
    }
  }

  return '#333333'; // Color por defecto
}