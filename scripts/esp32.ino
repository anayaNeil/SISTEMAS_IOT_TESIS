#include <Arduino.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <max6675.h>

#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// Credenciales WiFi y Firebase
#define WIFI_SSID "LABORATORIO"
#define WIFI_PASSWORD "l4b0r4+0r10IAI24"
#define API_KEY "AIzaSyAxxnDvC7fPfyKq69esOx_TwEoK5bqknUM"
#define USER_EMAIL "unia@edu.pe"
#define USER_PASSWORD "12345@"
#define DATABASE_URL "https://control-iot-esp-fb943-default-rtdb.firebaseio.com/"

// Pines del MAX6675 y la resistencia
#define SCK_PIN 13  // Pin de reloj
#define CS_PIN  12  // Pin de selección del chip
#define SO_PIN  14  // Pin de datos
#define RELAY_PIN 4 // Pin donde está conectada el led
#define BUZZER_PIN 26  // Define el pin delbuzzer
#define BUTTON_PIN 5  // Define el pin del botón

// Pines de la pantalla oled 
#define SCREEN_I2C_ADDR 0x3C // or 0x3C
#define SCREEN_WIDTH 128     // OLED display width, in pixels
#define SCREEN_HEIGHT 64     // OLED display height, in pixels
#define OLED_RST_PIN -1      // Reset pin (-1 if not available)

Adafruit_SSD1306 display(128, 64, &Wire, OLED_RST_PIN);

// OLED Animation: wifi search
// Code auto-generated by https://wokwi.com/animator, graphics by icons8.com

#define FRAME_DELAY (42)
#define FRAME_WIDTH (64)
#define FRAME_HEIGHT (64)
#define FRAME_COUNT (sizeof(frames) / sizeof(frames[0]))

const unsigned char heartIcon[] PROGMEM = {
  0x0E, 0x1F, 0x1F, 0x1F, 0x1F, 0x0E, 0x04, 0x00 // Bitmap del icono
};

// Inicializar el MAX6675
MAX6675 thermocouple(SCK_PIN, CS_PIN, SO_PIN);

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;
String uid;

String databasePath;
String tempPath;
String humPath;
String presPath;
String ollaStatePath;

// Variables del menú
int currentOlla = 1;
unsigned long lastButtonPress = 0;
bool longPressActive = false;
bool inMenu = false;

// Variables de alarma
unsigned long buzzerStartMillis = 0;  // Variable para controlar el tiempo de encendido del buzzer
bool buzzerActive = false;  // Indica si el buzzer ya se activó por 6 segundos

// Limites de temperatura para las ollas
int setTempOlla1 = 70, upperLimitOlla1 = 75;
int setTempOlla2 = 67, lowerLimitOlla2 = 64, upperLimitOlla2 = 70;
int setTempOlla3 = 32, lowerLimitOlla3 = 30;

// Variables para temporización
unsigned long previousMillis = 0;
unsigned long sendDataPrevMillis = 0;
unsigned long previousDelayMillis = 0;

// Constantes para intervalos
const unsigned long interval = 5000;  // Intervalo para cambiar entre animación y pantalla de temperatura
const unsigned long firebaseInterval = 10000;  // Intervalo para enviar datos a Firebase
const unsigned long displayDelayInterval = 50;  // Intervalo de 50ms para evitar parpadeos
const unsigned long relayInterval = 500;  // Intervalo para imprimir el estado del relé
const unsigned long animationInterval = 50;  // Intervalo de cambio de frame en la animación

// Variables de lectura y control
float temperature = 0.0;
float humidity = 0.0;
float pressure = 0.0;
int frame = 0;

// Inicializar WiFi
void initWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Conectando a WiFi ...");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print('.');
    delay(1000);
  }
  Serial.println(WiFi.localIP());
  Serial.println();
}

// Escribir valores flotantes en Firebase
void sendFloat(String path, float value){
  if (Firebase.RTDB.setFloat(&fbdo, path.c_str(), value)){
    Serial.print("Escribiendo valor: ");
    Serial.print(value);
    Serial.print(" en la ruta: ");
    Serial.println(path);
    Serial.println("PASADO");
    Serial.println("RUTA: " + fbdo.dataPath());
    Serial.println("TIPO: " + fbdo.dataType());
  }
  else {
    Serial.println("FALLIDO");
    Serial.println("RAZÓN: " + fbdo.errorReason());
  }
}

void setup(){
  Serial.begin(115200);

  // Inicializar WiFi
  initWiFi();

  // Configurar Firebase
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;

  Firebase.reconnectWiFi(true);
  fbdo.setResponseSize(4096);

  // Iniciar Firebase
  config.token_status_callback = tokenStatusCallback;
  Firebase.begin(&config, &auth);

  // Obtener el UID del usuario (pero ahora usaremos una ruta pública)
  databasePath = "/public_data/sensor_readings";
  tempPath = databasePath + "/temperature";
  humPath = databasePath + "/humidity";
  presPath = databasePath + "/pressure";
  ollaStatePath = databasePath + "/olla_state";

  // Configuración del pin de la resistencia
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH);  // Inicialmente apagado (HIGH desactiva el relé)

  //pantalla oled
  display.begin(SSD1306_SWITCHCAPVCC, SCREEN_I2C_ADDR);

  // Configuración del pin de la BOCINA Y BOTON
  pinMode(BUTTON_PIN, INPUT_PULLUP);  // Configuración del botón 
  pinMode(BUZZER_PIN, OUTPUT);        // Configuración de la bocina
}

void loop() {
  unsigned long currentMillis = millis();

  // Leer temperatura desde el MAX6675  ajustada a adicion de cable termico de  1.5m 

  temperature = thermocouple.readCelsius() - 1.5;

  handleButtonPress();  // Cambiar de olla al pulsar el botón

  if (inMenu) {
    displayMenu();  // Muestra el menú de selección de olla
  } else {
    displayTemperature();  // Muestra la temperatura actual
    controlAlarma();       // Controla la alarma según los límites de temperatura
  }

  // Enviar nuevas lecturas a Firebase cada 5 segundos
  if (Firebase.ready() && (currentMillis - sendDataPrevMillis > firebaseInterval)) {
    sendDataPrevMillis = currentMillis;

    // Enviar lecturas a Firebase
    sendFloat(tempPath, temperature);
    sendFloat(humPath, humidity);
    sendFloat(presPath, pressure);
    sendInt(ollaStatePath, currentOlla);
  }
}

void handleButtonPress() {
  if (digitalRead(BUTTON_PIN) == LOW) {
    unsigned long pressTime = millis() - lastButtonPress;
    if (pressTime >= 2000 && !longPressActive) {  // Pulsado largo
      longPressActive = true;
      inMenu = false;  // Salir del menú y seleccionar olla actual
    }
  } else {
    if (longPressActive) {
      longPressActive = false;  // Reiniciar la detección de pulsado largo
    } else if (millis() - lastButtonPress < 2000) {  // Pulsado corto
      currentOlla = (currentOlla % 3) + 1;  // Cambiar entre ollas de 1 a 3
      inMenu = true;  // Activar el menú para mostrar la selección de olla
    }
    lastButtonPress = millis();
  }
}

void displayMenu() {
  display.clearDisplay();
  display.setTextColor(WHITE);
  display.setTextSize(2);
  display.setCursor(0, 0);
 
  display.setCursor(0, 0);
  display.print(currentOlla == 1 ? "-> Olla 1" : "  Olla 1");  // Marca olla seleccionada

  display.setCursor(0, 25);
  display.print(currentOlla == 2 ? "-> Olla 2" : "  Olla 2");

  display.setCursor(0, 50);
  display.print(currentOlla == 3 ? "-> Olla 3" : "  Olla 3");

  display.display();
  delay(1000);  // Mantener menú visible por 4 segundos
  inMenu = false;  // Salir del menú después del tiempo
}

void displayTemperature() {
  display.clearDisplay();
  display.setTextColor(WHITE);
  display.setCursor(0, 0);
  display.setTextSize(1.5);
  display.print("Olla: ");
  display.setTextSize(2);
  display.print(currentOlla);
  display.setTextSize(5);
  display.setCursor(0, 25);
  display.print(temperature, 1);  // Muestra la temperatura con un decimal
  display.drawBitmap(115, 10, heartIcon, 8, 8, WHITE);  // Muestra el ícono
  display.display();

  Serial.print("OLLA ");
  Serial.print(currentOlla);
  Serial.print(" Temperatura: ");
  Serial.println(temperature);
}

void sendInt(String path, int value) {
  if (Firebase.RTDB.setInt(&fbdo, path.c_str(), value)) {
    Serial.print("Datos enviados correctamente a ");
    Serial.println(path);
  } else {
    Serial.print("Error al enviar datos: ");
    Serial.println(fbdo.errorReason());
  }
}

void controlAlarma() {
  if ((currentOlla == 1 && temperature > upperLimitOlla1) || 
    (currentOlla == 2 && (temperature > upperLimitOlla2 || temperature < lowerLimitOlla2)) || 
    (currentOlla == 3 && temperature < lowerLimitOlla3)){
    if (!buzzerActive) {  // Si el buzzer no ha sonado aún por 6 segundos
      digitalWrite(BUZZER_PIN, HIGH);  // Encender la bocina
      digitalWrite(RELAY_PIN, HIGH);   // Encender el LED
      buzzerStartMillis = millis();    // Registrar el tiempo de inicio
      buzzerActive = true;             // Marcar que el buzzer está activo
    } else if (millis() - buzzerStartMillis >= 6000) {  // Verificar si han pasado 6 segundos
      digitalWrite(BUZZER_PIN, LOW);   // Apagar la bocina
    }
  } else {
    // Si la temperatura vuelve a la normalidad
    digitalWrite(BUZZER_PIN, LOW);     // Asegurar que la bocina esté apagada
    digitalWrite(RELAY_PIN, LOW);      // Apagar el LED
    buzzerActive = false;              // Reiniciar el estado del buzzer
  }
}