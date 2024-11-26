document.addEventListener("DOMContentLoaded", () => {
  const closeTabBtn = document.getElementById("close-tab-btn");

  // Función para cerrar la pestaña
  const closeTab = () => {
      console.log("Cerrando la pestaña del manual...");
      window.close();
  };

  // Asignar evento al botón
  closeTabBtn.addEventListener("click", closeTab);
});
