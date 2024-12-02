document.addEventListener("DOMContentLoaded", () => {
  const closeTabBtn = document.getElementById("close-tab-btn");

  // Función para cerrar la pestaña
  const closeTab = () => {
    console.log("Cerrando la pestaña del manual...");
    window.close();
  };

  // Asignar evento al botón
  closeTabBtn.addEventListener("click", closeTab);

  // Inicializar el manejo de swipe
  handleSwipe();

  function handleSwipe() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    const minSwipeDistance = 150; // Umbral mínimo para detectar swipe

    document.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    });

    document.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      
      const swipeDistanceX = touchEndX - touchStartX;
      const swipeDistanceY = Math.abs(touchEndY - touchStartY);
      
      // Solo detecta el swipe si el movimiento horizontal es mayor que el umbral
      // y es significativamente mayor que el movimiento vertical
      if (Math.abs(swipeDistanceX) >= minSwipeDistance && Math.abs(swipeDistanceX) > swipeDistanceY * 2) {
        const currentSection = getCurrentSection();
        if (swipeDistanceX > 0) {
          prevSection(currentSection);
        } else {
          nextSection(currentSection);
        }
      }
    });
  }

  // Función auxiliar para obtener la sección actual
  function getCurrentSection() {
    const sections = document.querySelectorAll('.scroll-section');
    for (let i = 1; i <= sections.length; i++) {
      const section = document.getElementById(`section-${i}`);
      const rect = section.getBoundingClientRect();
      if (rect.left >= -window.innerWidth / 2 && rect.left <= window.innerWidth / 2) {
        return i;
      }
    }
    return 1;
  }

});
