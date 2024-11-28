google.charts.load('current', {'packages':['gauge']});
google.charts.setOnLoadCallback(drawChart);

var lastTemperature = null;  // Variable para almacenar la última temperatura

function drawChart() {
  var data = google.visualization.arrayToDataTable([
    ['Label', 'Value'],
    ['C°', 55]  // Valor inicial
  ]);

  var options = {
    width: 600, height: 220,
    redFrom: 70, redTo: 100,
    yellowFrom: 40, yellowTo: 70,
    minorTicks: 5
  };

  var chart = new google.visualization.Gauge(document.getElementById('chart_div'));

  chart.draw(data, options);

  // Cada vez que la temperatura cambia, actualizamos el gráfico
  setInterval(function() {
    if (window.currentTemperature) {  // Asegúrate de que la variable global esté disponible
      var currentTemperature = parseFloat(window.currentTemperature);  // Obtén la temperatura de la variable global

      // Si la temperatura ha cambiado, actualizamos el gráfico
      if (currentTemperature !== lastTemperature) {
        lastTemperature = currentTemperature;  // Actualizamos la última temperatura

        // Actualiza el gráfico solo si tenemos un valor de temperatura válido
        if (!isNaN(currentTemperature)) {
          data.setValue(0, 1, currentTemperature);  // Actualiza el valor en el gráfico
          chart.draw(data, options);  // Redibuja el gráfico
        }
      }
    }
  }, 1000);  // Verifica cada 1 segundo si la temperatura ha cambiado
}
