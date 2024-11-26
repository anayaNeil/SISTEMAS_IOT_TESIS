window.addEventListener('load', onload);

function onload(event) {
  // Inicializa el gráfico con el estado de la olla 1
  chartT = createTemperatureChart(1);

  // Listener para el valor de ollaState
  dbRefOllaState.on('value', snap => {
    let ollaState = snap.val();
    console.log('OllaState actualizado:', ollaState);

    // Actualizar la línea horizontal en el gráfico basado en ollaState
    updateMaxLevelLine(chartT, ollaState);
  });

  // Listener para la temperatura actual
  dbRefTemperature.on('value', snap => {
    let currentTemperature = snap.val(); // Obtener la temperatura actual
    console.log('Temperatura actual:', currentTemperature);

    // Agregar la nueva temperatura al gráfico y actualizar los límites del gráfico
    updateChartData(chartT, currentTemperature);
  });
}

// Función para crear el gráfico de temperatura
function createTemperatureChart(ollaState) {
  var plotLinesConfig = [];
  var yAxisConfig = {
    min: 20,
    max: 100
  };

  switch (ollaState) {
    case 1:
      plotLinesConfig.push({
        color: 'red',
        value: 75,
        width: 2,
        label: {
          text: 'Olla 1 (75°C)',
          align: 'left',
          style: { color: 'red' }
        }
      });
      break;

    case 2:
      plotLinesConfig.push(
        {
          color: 'red',
          value: 70,
          width: 2,
          label: {
            text: 'Olla 2 (70°C)',
            align: 'left',
            style: { color: 'red' }
          }
        },
        {
          color: 'blue',
          value: 65,
          width: 2,
          label: {
            text: 'Olla 2 (65°C)',
            align: 'left',
            style: { color: 'blue' }
          }
        }
      );
      yAxisConfig = { min: 55, max: 80 };
      break;

    case 3:
      plotLinesConfig.push({
        color: 'blue',
        value: 30,
        width: 2,
        label: {
          text: 'Olla 3 (30°C)',
          align: 'left',
          style: { color: 'blue' }
        }
      });
      break;

    default:
      break;
  }

  var chart = new Highcharts.Chart({
    chart: {
      renderTo: 'chart-temperature',
      type: 'spline'
    },
    series: [{
      name: 'Temperatura',
      data: []
    }],
    title: { text: undefined },
    plotOptions: {
      line: { animation: false, dataLabels: { enabled: true } }
    },
    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: { second: '%H:%M' },
      labels: {
        formatter: function () {
          var date = new Date(this.value);
          date.setHours(date.getHours() - 5); // Ajuste para la zona horaria de Perú
          return Highcharts.dateFormat('%H:%M', date);
        }
      }
    },
    yAxis: {
      title: { text: 'Temperatura (°C)' },
      min: yAxisConfig.min,
      max: yAxisConfig.max,
      plotLines: plotLinesConfig
    },
    credits: { enabled: false }
  });

  return chart;
}

// Función para agregar nuevos datos al gráfico
function updateChartData(chart, currentTemperature) {
  var x = (new Date()).getTime(); // Timestamp actual

  // Agregar el nuevo punto de datos
  chart.series[0].addPoint([x, currentTemperature], true, true);

  // Aquí actualizamos también los límites del eje Y si es necesario
  updateChartYAxis(chart, currentTemperature);
}

// Función para actualizar el gráfico de acuerdo a la temperatura
function updateChartYAxis(chart, currentTemperature) {
  // Definir los límites basados en la temperatura
  var yMin = Math.max(0, currentTemperature - 10);
  var yMax = currentTemperature + 10;

  // Actualizar los límites del eje Y
  chart.yAxis[0].update({
    min: yMin,
    max: yMax
  });
}

// Función para actualizar la línea de referencia dependiendo de la ollaState
function updateMaxLevelLine(chart, ollaState) {
  var plotLinesConfig = [];
  var yAxisConfig = { min: 20, max: 100 };

  switch (ollaState) {
    case 1:
      plotLinesConfig.push({
        color: 'red',
        value: 75,
        width: 2,
        label: {
          text: 'Olla 1 (75°C)',
          align: 'left',
          style: { color: 'red' }
        }
      });
      break;
    case 2:
      plotLinesConfig.push(
        {
          color: 'red',
          value: 70,
          width: 2,
          label: {
            text: 'Olla 2 (70°C)',
            align: 'left',
            style: { color: 'red' }
          }
        },
        {
          color: 'blue',
          value: 65,
          width: 2,
          label: {
            text: 'Olla 2 (65°C)',
            align: 'left',
            style: { color: 'blue' }
          }
        }
      );
      yAxisConfig = { min: 55, max: 80 };
      break;
    case 3:
      plotLinesConfig.push({
        color: 'blue',
        value: 30,
        width: 2,
        label: {
          text: 'Olla 3 (30°C)',
          align: 'left',
          style: { color: 'blue' }
        }
      });
      break;
    default:
      break;
  }

  // Actualizar el gráfico con las nuevas líneas de referencia
  chart.yAxis[0].update({
    min: yAxisConfig.min,
    max: yAxisConfig.max,
    plotLines: plotLinesConfig
  });
}
