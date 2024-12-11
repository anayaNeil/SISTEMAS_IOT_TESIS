// Variables globales
let tiempoTotal = 0;
let contadorActivo = false;
let intervalId = null;
let buzzerActivo20 = false; // Variable para controlar el estado del buzzer a 20 segundos
let buzzerActivo35 = false; // Variable para controlar el estado del buzzer a 35 segundos

// Función para formatear el tiempo en formato MM:SS
function formatearTiempo(segundos) {
    const minutos = Math.floor(segundos / 60);
    const segsRestantes = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${segsRestantes.toString().padStart(2, '0')} Min`;
}

// Función principal del contador
function contador(ollaState, currentTemperature) {
    console.log('Valores en contador: ollaState =', ollaState, 'currentTemperature =', currentTemperature);
    // Verificar las condiciones para activar/pausar el contador
    if (ollaState === 3 && currentTemperature > 28) {
        if (!contadorActivo) {
            contadorActivo = true;
            // Iniciar el contador si no está activo
            intervalId = setInterval(() => {
                tiempoTotal++;
                let contadorDisplay = document.getElementById('contador-display');
                if (!contadorDisplay) {
                    contadorDisplay = document.createElement('div');
                    contadorDisplay.id = 'contador-display';
                    document.body.appendChild(contadorDisplay);
                }
                contadorDisplay.textContent = formatearTiempo(tiempoTotal);

                // Verificar si se alcanzaron los 20 segundos
                if (tiempoTotal === 20 && !buzzerActivo20) {
                    console.log('Activando buzzer a los 20 segundos...');
                    activarBuzzer();
                    buzzerActivo20 = true; // Marcar como activo
                }
                // Verificar si se alcanzaron los 35 segundos
                if (tiempoTotal === 35 && !buzzerActivo35) {
                    console.log('Activando buzzer a los 35 segundos...');
                    activarBuzzer();
                    buzzerActivo35 = true; // Marcar como activo
                }
            }, 1000);
        }
    } else {
        // Pausar el contador si las condiciones no se cumplen
        if (contadorActivo) {
            contadorActivo = false;
            clearInterval(intervalId);
        }
    }
}
 

// Función para activar el buzzer
function activarBuzzer() {
    if (!buzzerActivo20) { // Verificar si el buzzer ya está activo
        buzzerActivo20 = true; // Marcar el buzzer como activo
        // Activar el buzzer a los 20 segundos
        firebase.database().ref('public_data/sensor_readings/activar_buzzer').set(true);

        // Mostrar mensaje de colorante
        const mensajeBuzzer = document.getElementById('mensaje-buzzer');
        mensajeBuzzer.textContent = 'Agregue el colorante';
        mensajeBuzzer.style.display = 'block';

        // Desactivar el buzzer después de 5 segundos
        setTimeout(() => {
            firebase.database().ref('public_data/sensor_readings/activar_buzzer').set(false);
        }, 5000);
    }
    if (!buzzerActivo35 && tiempoTotal === 35) { // Verificar si el buzzer debe activarse a 35 segundos
        buzzerActivo35 = true; // Marcar el buzzer como activo
        // Activar el buzzer a los 35 segundos
        firebase.database().ref('public_data/sensor_readings/activar_buzzer').set(true);

        // Mostrar mensaje de saborizante
        const mensajeBuzzer = document.getElementById('mensaje-buzzer');
        mensajeBuzzer.textContent = 'Agregar saborizante';

        // Ocultar el mensaje anterior
        if (buzzerActivo20) {
            mensajeBuzzer.style.display = 'none'; // Ocultar el mensaje anterior
        }
        mensajeBuzzer.style.display = 'block';

        // Desactivar el buzzer después de 5 segundos
        setTimeout(() => {
            firebase.database().ref('public_data/sensor_readings/activar_buzzer').set(false);
        }, 5000);

        // Ocultar mensaje después de 1 minuto
        setTimeout(() => {
            mensajeBuzzer.style.display = 'none';
        }, 60000);
    }
}

// Función para reiniciar el contador
function reiniciarContador() {
    tiempoTotal = 0;
    contadorActivo = false;
    buzzerActivo20 = false;
    buzzerActivo35 = false;
    if (intervalId) {
        clearInterval(intervalId);
    }
    let contadorDisplay = document.getElementById('contador-display');
    if (!contadorDisplay) {
        contadorDisplay = document.createElement('div');
        contadorDisplay.id = 'contador-display';
        document.body.appendChild(contadorDisplay);
    }

    contadorDisplay.textContent = formatearTiempo(0);
}

// Función para inicializar el contador
function inicializarContador() {
    // Crear elemento para mostrar el contador si no existe
    if (!document.getElementById('contador-display')) {
        const contadorDisplay = document.createElement('div');
        contadorDisplay.id = 'contador-display';
        contadorDisplay.textContent = '00:00 Min';
        // Añadir el elemento al DOM donde sea necesario
        document.body.appendChild(contadorDisplay);
    }

    // Crear el atributo activar_buzzer en la base de datos si no existe
    firebase.database().ref('public_data/sensor_readings/activar_buzzer').set(false);
}