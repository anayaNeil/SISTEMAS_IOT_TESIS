function generateReport() {
  var dbRefHistoricalData = firebase.database().ref('public_data/sensor_readings/temperatureHistory');

  dbRefHistoricalData.once('value', snapshot => {
    let data = [];
    snapshot.forEach(childSnapshot => {
      let entry = childSnapshot.val();
      data.push({
        x: entry.timestamp, // Eje X: tiempo (en milisegundos)
        y: entry.value      // Eje Y: valor de la temperatura
      });
    });

    // Actualiza el gráfico con los datos obtenidos
    chartT.series[0].setData(data);

    // Muestra un mensaje de éxito
    alert('Historial completo generado.');

  }).catch(error => {
    console.error('Error al generar el reporte:', error);
  });
}
