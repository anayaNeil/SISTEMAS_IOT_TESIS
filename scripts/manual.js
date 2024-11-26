document.addEventListener("DOMContentLoaded", () => {
    const closeBtn = document.getElementById("close-btn");
    const closeFooterBtn = document.getElementById("close-footer-btn");

    // Función para cerrar el manual y regresar a la página principal
    const closeManual = () => {
        console.log("Botón de cerrar presionado");
        // Redirige a la página principal
        window.location.href = "temperatura.html"; // Ajusta la ruta según tu estructura de carpetas
    };
  
    // Asignar eventos a los botones
    closeBtn.addEventListener("click", () => {
        console.log("Botón X presionado");
        closeManual();
      });
      
    closeFooterBtn.addEventListener("click", () => {
    console.log("Botón cerrar presionado");
    closeManual();
  });
});