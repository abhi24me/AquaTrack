#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <NTPClient.h>
#include <Preferences.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <WiFiUdp.h>

// --- WiFi ---
// Assuming these are correct as you didn't obscure them
#define WIFI_SSID "311-312-315-316"
#define WIFI_PASSWORD "Yes@2024"

// --- Supabase RPC ---
// FIXED: Using your actual project ID 'zyojhtowkumgwihiwfsu'
const char *SUPABASE_FUNCTION_URL =
    "https://zyojhtowkumgwihiwfsu.supabase.co/rest/v1/rpc/report_usage";
const char *SUPABASE_API_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5b2podG93a3VtZ3dpaGl3ZnN1Iiwicm9sZSI6Im"
    "Fub24iLCJpYXQiOjE3NTk1MDIwMjAsImV4cCI6MjA3NTA3ODAyMH0.yxq2uHfPksFvJPfe_"
    "vIZeB81jZDOme4MPSFAQUwZQp8";

// --- Device / Location ---
// FIXED: 'SN-101-ABC' matches the test device I just ensured exists in your DB.
const char *DEVICE_UID = "SN-101-ABC";
const char *PG_NAME = "Yes Living";
const char *ROOM_NUMBER = "101";

// --- NTP (IST offset = +5:30) ---
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 19800, 60000);

// --- Flow Sensor ---
const int flowSensorPin = 33;
volatile int pulseCount = 0;
float calibrationFactor = 7.5;

// --- Variables ---
unsigned long lastMillis = 0;
unsigned long lastSendMillis = 0;
float flowRate = 0;
float totallitres = 0;
float dailyusage = 0;
float lastSentTotal = -1;
String currentDate = "";

// --- Preferences ---
Preferences prefs;

// --- ISR ---
void IRAM_ATTR pulseCounter() { pulseCount++; }

// --- Helpers ---
String getDateString() {
  timeClient.update();
  time_t rawTime = timeClient.getEpochTime();

  struct tm *timeInfo = localtime(&rawTime);
  char buffer[11];
  strftime(buffer, sizeof(buffer), "%Y-%m-%d", timeInfo);
  return String(buffer);
}

void saveTotalUsage() { prefs.putFloat("totallitres", totallitres); }

// --- WiFi Reconnect Logic ---
void ensureWiFiConnected() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ WiFi disconnected, reconnecting...");
    WiFi.disconnect();
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    unsigned long startAttemptTime = millis();
    while (WiFi.status() != WL_CONNECTED &&
           millis() - startAttemptTime < 10000) {
      delay(500);
      Serial.print(".");
    }

    if (WiFi.status() == WL_CONNECTED)
      Serial.println("\n✅ Reconnected!");
    else
      Serial.println("\n❌ Reconnect failed.");
  }
}

// --- Send to Supabase RPC ---
bool sendToSupabaseRPC(float rate, float usedToday, float totalUsage) {
  unsigned long t_start = millis();

  WiFiClientSecure client;
  client.setInsecure();
  client.setTimeout(10000); // 10s connection/read timeout

  HTTPClient http;

  // JSON Payload matches 'report_usage' params
  StaticJsonDocument<400> doc;
  doc["p_device_serial"] = DEVICE_UID;
  doc["p_flow_rate"] = rate;
  doc["p_total_usage"] = totalUsage;
  doc["p_daily_usage"] = usedToday;

  String body;
  serializeJson(doc, body);

  Serial.println("\n📤 Sending payload to Supabase RPC...");

  if (!http.begin(client, SUPABASE_FUNCTION_URL)) {
    Serial.println("❌ HTTP Begin failed");
    return false;
  }

  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_API_KEY);
  http.addHeader("Authorization", String("Bearer ") + SUPABASE_API_KEY);

  int httpCode = http.POST(body);

  if (httpCode > 0) {
    Serial.printf("🔎 HTTP Response: %d (Time: %lu ms)\n", httpCode,
                  millis() - t_start);

    // Only fetch response body if it's NOT 204 (No Content)
    if (httpCode != 204) {
      String response = http.getString();
      Serial.println(response);
    } else {
      Serial.println("✅ Success (No Content)");
    }
  } else {
    Serial.printf("❌ POST Failed: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
  client.stop(); // Explicitly close SSL connection

  Serial.println("🔄 Request finished, returning to loop.");
  return httpCode >= 200 && httpCode < 300;
}

// --- Setup ---
void setup() {
  Serial.begin(115200);
  delay(100);

  WiFi.setSleep(false);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting to WiFi");
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) {
    delay(500);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED)
    Serial.println("\n✅ WiFi Connected");
  else
    Serial.println("\n⚠️ WiFi not connected at boot.");

  timeClient.begin();
  unsigned long tstart = millis();
  while (!timeClient.update() && millis() - tstart < 5000) {
    timeClient.forceUpdate();
    delay(200);
  }

  pinMode(flowSensorPin, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(flowSensorPin), pulseCounter, FALLING);

  prefs.begin("water", false);
  totallitres = prefs.getFloat("totallitres", 0.0);
  lastSentTotal = totallitres;
  currentDate = getDateString();
  Serial.println("Starting date: " + currentDate);
  Serial.print("Loaded total litres: ");
  Serial.println(totallitres, 3);
}

// --- Loop ---
void loop() {
  ensureWiFiConnected();

  if (millis() - lastMillis > 1000) {
    detachInterrupt(flowSensorPin);

    flowRate = pulseCount / calibrationFactor;
    float litresThisSecond = flowRate / 60.0;
    totallitres += litresThisSecond;
    dailyusage += litresThisSecond;

    Serial.printf("Flow: %.2f L/min | Daily: %.3f L | Total: %.3f L\n",
                  flowRate, dailyusage, totallitres);

    pulseCount = 0;
    lastMillis = millis();

    attachInterrupt(digitalPinToInterrupt(flowSensorPin), pulseCounter,
                    FALLING);
  }

  String newDate = getDateString();
  if (newDate != currentDate) {
    currentDate = newDate;
    dailyusage = 0;
    Serial.println("🕛 Midnight reset daily usage.");
  }

  if (millis() - lastSendMillis > 15000) { // 15 seconds debounce
    lastSendMillis = millis();

    // Send if flow or significant change
    if (flowRate > 0 || abs(totallitres - lastSentTotal) > 0.1) {
      bool ok = sendToSupabaseRPC(flowRate, dailyusage, totallitres);

      if (ok) {
        lastSentTotal = totallitres;
        saveTotalUsage();
      }
    } else {
      Serial.println("⏭️ No significant usage change, skipping send");
    }
  }

  delay(10);
}
