// Utilidades para impresión y exportación PDF

export function handlePrint(containerId = "print-container") {
  const printContainer = document.getElementById(containerId);
  if (!printContainer) return;
  const originalBody = document.body.innerHTML;
  document.body.innerHTML = printContainer.outerHTML;
  window.print();
  document.body.innerHTML = originalBody;
  window.location.reload(); // Opcional: recarga para restaurar eventos y estado JS
}

export function handleExportPDF() {
  // Aquí puedes integrar una librería como jsPDF o html2pdf
  alert("Funcionalidad de exportación a PDF en desarrollo");
  // Implementación real requeriría una biblioteca como jsPDF o html2pdf.js
}
