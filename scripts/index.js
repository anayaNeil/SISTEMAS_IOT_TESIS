const loginElement = document.querySelector('#login-form');
const contentElement = document.querySelector("#content-sign-in");
const userDetailsElement = document.querySelector('#user-details');
const authBarElement = document.querySelector("#authentication-bar");

// Elements for sensor readings
const tempElement = document.getElementById("temp");

// MANAGE LOGIN/LOGOUT UI
const setupUI = (user) => {
  if (user) {
    //toggle UI elements
    loginElement.style.display = 'none';
    contentElement.style.display = 'block';
    authBarElement.style.display ='block';
    userDetailsElement.style.display ='block';
    userDetailsElement.innerHTML = user.email;

    // get user UID to get data from database
    var uid = user.uid;
    console.log(uid);


    // Rutas de la base de datos (con UID del usuario)
    var dbPathTemp = 'UsersData/' + uid.toString() + '/temperature';
    var dbPathOllaState = 'UsersData/' + uid.toString() + '/ollaState';


    // Referencias de la base de datos
    var dbRefTemp = firebase.database().ref().child(dbPathTemp);
    var dbRefOllaState = firebase.database().ref().child(dbPathOllaState);

    // Listener para el valor de ollaState
    dbRefOllaState.on('value', snap => {
      let ollaState = snap.val();
      console.log('OllaState actualizado:', ollaState);

      // Actualizar la línea horizontal en el gráfico basado en ollaState
      updateMaxLevelLine(chartT, ollaState);
    });


    dbRefTemp.on('value', snap => {
      let tempValue = snap.val().toFixed(2);
      tempElement.innerText = tempValue;
    
      let x = (new Date()).getTime(),
          y = parseFloat(tempValue);
    
      if (chartT.series[0].data.length > 40) {
        chartT.series[0].addPoint([x, y], true, true, true);
      } else {
        chartT.series[0].addPoint([x, y], true, false, true);
      }
    
      // **Guardar la lectura en Firebase con marca de tiempo**
      let historicalDataPath = 'UsersData/' + uid.toString() + '/temperatureHistory';
      let dbRefHistoricalData = firebase.database().ref().child(historicalDataPath);
    
      // Crear un objeto con el valor y la marca de tiempo
      let dataEntry = {
        value: y,
        timestamp: x
        
      };
    
      // Almacenar los datos en la base de datos
      dbRefHistoricalData.push(dataEntry)
        .then(() => {
          console.log('Datos históricos guardados con éxito.');
        })
        .catch((error) => {
          console.error('Error al guardar los datos históricos:', error);
        });
    });
    

  // if user is logged out
  } else{
    // toggle UI elements
    loginElement.style.display = 'block';
    authBarElement.style.display ='none';
    userDetailsElement.style.display ='none';
    contentElement.style.display = 'none';
  }
}