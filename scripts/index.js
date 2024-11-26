const loginElement = document.querySelector('#login-form');
const contentElement = document.querySelector("#content-sign-in");
const userDetailsElement = document.querySelector('#user-details');
const authBarElement = document.querySelector("#authentication-bar");

// Elements for sensor readings
const tempElement = document.getElementById("temp");

// MANAGE LOGIN/LOGOUT UI
const setupUI = (user) => {
  const loginContainerElement = document.getElementById('login-container');

  if (user) {
    // Ocultar el contenedor del login
    loginContainerElement.style.display = 'none';

    // Mostrar elementos principales
    loginElement.style.display = 'none';
    contentElement.style.display = 'block';
    authBarElement.style.display = 'block';
    userDetailsElement.style.display = 'block';

    userDetailsElement.innerHTML = user.email;

    // Obtener UID del usuario para datos de Firebase
    var uid = user.uid;

    // Configuración de Firebase
    var dbPathTemp = 'UsersData/' + uid.toString() + '/temperature';
    var dbPathOllaState = 'UsersData/' + uid.toString() + '/ollaState';

    var dbRefTemp = firebase.database().ref().child(dbPathTemp);
    var dbRefOllaState = firebase.database().ref().child(dbPathOllaState);

    dbRefOllaState.on('value', (snap) => {
      let ollaState = snap.val();
      console.log('OllaState actualizado:', ollaState);
      updateMaxLevelLine(chartT, ollaState);
    });

    dbRefTemp.on('value', (snap) => {
      let tempValue = snap.val().toFixed(2);
      tempElement.innerText = tempValue;

      let x = new Date().getTime(),
        y = parseFloat(tempValue);

      if (chartT.series[0].data.length > 40) {
        chartT.series[0].addPoint([x, y], true, true, true);
      } else {
        chartT.series[0].addPoint([x, y], true, false, true);
      }

      let historicalDataPath =
        'UsersData/' + uid.toString() + '/temperatureHistory';
      let dbRefHistoricalData = firebase.database().ref().child(historicalDataPath);

      let dataEntry = {
        value: y,
        timestamp: x,
      };

      dbRefHistoricalData
        .push(dataEntry)
        .then(() => {
          console.log('Datos históricos guardados con éxito.');
        })
        .catch((error) => {
          console.error('Error al guardar los datos históricos:', error);
        });
    });
  } else {
    // Mostrar login
    loginContainerElement.style.display = 'flex'; // Asegúrate de usar "flex" para el diseño del login
    loginElement.style.display = 'block';
    authBarElement.style.display = 'none';
    userDetailsElement.style.display = 'none';
    contentElement.style.display = 'none';
  }
};
